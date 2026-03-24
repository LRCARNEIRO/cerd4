import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LacunaIdentificada, ComplianceStatus, ThematicAxis, FocalGroupType } from '@/hooks/useLacunasData';
import { EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';

// ── Types ──────────────────────────────────────────────────────────
export type DiagnosticSignalType = 'tendencia' | 'orcamento_simbolico' | 'cobertura_normativa' | 'divergencia';

export interface DiagnosticSignal {
  type: DiagnosticSignalType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  detail?: string;
}

export interface LinkedIndicador {
  nome: string;
  categoria: string;
  tendencia: string | null;
  dados: any;
}

export interface LinkedOrcamento {
  programa: string;
  orgao: string;
  ano: number;
  dotacao_autorizada: number | null;
  pago: number | null;
}

export interface LinkedNormativo {
  titulo: string;
  status: string;
}

export interface LacunaDiagnostic {
  lacunaId: string;
  statusManual: ComplianceStatus;
  statusSugerido: ComplianceStatus | null;
  divergente: boolean;
  signals: DiagnosticSignal[];
  linkedIndicadores: LinkedIndicador[];
  linkedOrcamento: LinkedOrcamento[];
  linkedNormativos: LinkedNormativo[];
}

export interface DiagnosticSummary {
  totalDivergencias: number;
  totalOrcamentoSimbolico: number;
  totalTendenciaPiora: number;
  totalSemCoberturaNormativa: number;
  statusReclassificado: {
    cumprido: number;
    parcialmente_cumprido: number;
    nao_cumprido: number;
    retrocesso: number;
    em_andamento: number;
  };
  progressoSensor: number;
}

function normalizeArticle(raw: string): ArtigoConvencao | null {
  const value = String(raw || '').toUpperCase().trim();
  if (value.includes('VII')) return 'VII';
  if (value.includes('VI')) return 'VI';
  if (value.includes('V')) return 'V';
  if (value.includes('IV')) return 'IV';
  if (value.includes('III')) return 'III';
  if (value.includes('II')) return 'II';
  if (value.includes('I')) return 'I';
  return null;
}

function getLacunaArtigos(lacuna: LacunaIdentificada): ArtigoConvencao[] {
  const raw = (lacuna as any).artigos_convencao;
  const explicit = Array.isArray(raw) ? raw.map(normalizeArticle).filter(Boolean) as ArtigoConvencao[] : [];
  if (explicit.length > 0) return [...new Set(explicit)];
  return EIXO_PARA_ARTIGOS[lacuna.eixo_tematico as ThematicAxis] || [];
}

const NEGATIVE_INDICATORS = [
  'mortalidade', 'homicídio', 'violência', 'desemprego', 'analfabet',
  'evasão', 'abandono', 'pobreza', 'deficit', 'déficit', 'trabalho infantil',
  'desigualdade', 'letalidade', 'encarceramento', 'insegurança',
];

function isLowerBetter(nome: string): boolean {
  const lower = nome.toLowerCase();
  return NEGATIVE_INDICATORS.some(kw => lower.includes(kw));
}

function inferTendencia(indicador: { nome: string; tendencia: string | null; dados: any }): 'melhora' | 'piora' | 'estavel' | 'desconhecida' {
  if (indicador.tendencia) {
    const t = indicador.tendencia.toLowerCase();
    const lowerBetter = isLowerBetter(indicador.nome);
    if (t === 'crescente') return lowerBetter ? 'piora' : 'melhora';
    if (t === 'decrescente') return lowerBetter ? 'melhora' : 'piora';
    if (t === 'estavel' || t === 'estável') return 'estavel';
  }
  return 'desconhecida';
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 4);
}

function getLacunaKeywords(lacuna: LacunaIdentificada): string[] {
  const eixoKeywords: Record<ThematicAxis, string[]> = {
    legislacao_justica: ['justica', 'judicial', 'discriminacao', 'reparacao'],
    politicas_institucionais: ['politica', 'institucional', 'igualdade', 'mulheres', 'genero', 'interseccional'],
    seguranca_publica: ['violencia', 'homicidio', 'policial', 'seguranca'],
    saude: ['saude', 'mortalidade', 'materna', 'infantil'],
    educacao: ['educacao', 'escolar', 'analfabetismo'],
    trabalho_renda: ['trabalho', 'renda', 'emprego', 'pobreza'],
    terra_territorio: ['territorio', 'terra', 'quilombola', 'indigena'],
    cultura_patrimonio: ['cultura', 'patrimonio', 'religiao'],
    participacao_social: ['participacao', 'representacao', 'politica'],
    dados_estatisticas: ['dados', 'estatistica', 'indicador'],
  };

  const grupoKeywords: Record<FocalGroupType, string[]> = {
    negros: ['negros', 'negras', 'afro', 'racial'],
    indigenas: ['indigena', 'indigenas'],
    quilombolas: ['quilombola', 'quilombolas'],
    ciganos: ['ciganos', 'romani'],
    religioes_matriz_africana: ['religiao', 'matriz', 'africana'],
    juventude_negra: ['juventude', 'jovens', 'negra'],
    mulheres_negras: ['mulheres', 'mulher', 'negras', 'negra', 'genero', 'materna'],
    lgbtqia_negros: ['lgbt', 'trans', 'sexualidade'],
    pcd_negros: ['deficiencia', 'pcd'],
    idosos_negros: ['idosos', 'idosas'],
    geral: [],
  };

  return [...new Set([
    ...tokenize(`${lacuna.tema} ${lacuna.descricao_lacuna}`),
    ...(eixoKeywords[lacuna.eixo_tematico as ThematicAxis] || []),
    ...(grupoKeywords[lacuna.grupo_focal as FocalGroupType] || []),
  ])];
}

// ── Main Hook ──────────────────────────────────────────────────────
export function useDiagnosticSensor(lacunas: LacunaIdentificada[] | undefined) {
  // Fetch all three cross-reference sources in parallel
  const { data: indicadores } = useQuery({
    queryKey: ['sensor-indicadores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indicadores_interseccionais')
        .select('nome, categoria, tendencia, dados, artigos_convencao');
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: orcamento } = useQuery({
    queryKey: ['sensor-orcamento'],
    queryFn: async () => {
      let all: any[] = [];
      let page = 0;
      while (true) {
        const { data, error } = await supabase
          .from('dados_orcamentarios')
          .select('programa, orgao, ano, dotacao_autorizada, pago, artigos_convencao')
          .range(page * 1000, (page + 1) * 1000 - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all = all.concat(data);
        if (data.length < 1000) break;
        page++;
      }
      return all;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: normativos } = useQuery({
    queryKey: ['sensor-normativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos_normativos')
        .select('titulo, artigos_convencao, status');
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Build indices by normalized artigo ───────────────────────────
  const indicadoresPorArtigo = useMemo(() => {
    if (!indicadores) return {} as Record<string, typeof indicadores>;
    const map: Record<string, typeof indicadores> = {};
    indicadores.forEach(ind => {
      const arts = ((ind.artigos_convencao as string[] | null) || [])
        .map(normalizeArticle)
        .filter(Boolean) as ArtigoConvencao[];
      arts.forEach(a => {
        if (!map[a]) map[a] = [];
        map[a].push(ind);
      });
    });
    return map;
  }, [indicadores]);

  const orcamentoPorArtigo = useMemo(() => {
    if (!orcamento) return {} as Record<string, typeof orcamento>;
    const map: Record<string, typeof orcamento> = {};
    orcamento.forEach(orc => {
      const arts = ((orc.artigos_convencao as string[] | null) || [])
        .map(normalizeArticle)
        .filter(Boolean) as ArtigoConvencao[];
      arts.forEach(a => {
        if (!map[a]) map[a] = [];
        map[a].push(orc);
      });
    });
    return map;
  }, [orcamento]);

  const normativosPorArtigo = useMemo(() => {
    if (!normativos) return {} as Record<string, typeof normativos>;
    const map: Record<string, typeof normativos> = {};
    normativos.forEach(doc => {
      const arts = ((doc.artigos_convencao as string[] | null) || [])
        .map(normalizeArticle)
        .filter(Boolean) as ArtigoConvencao[];
      arts.forEach(a => {
        if (!map[a]) map[a] = [];
        map[a].push(doc);
      });
    });
    return map;
  }, [normativos]);

  // ── Diagnose each lacuna ─────────────────────────────────────────
  const diagnostics = useMemo<LacunaDiagnostic[]>(() => {
    if (!lacunas || !indicadores || !orcamento || !normativos) return [];

    return lacunas.map(lacuna => {
      const artigos = getLacunaArtigos(lacuna);
      const keywords = getLacunaKeywords(lacuna);
      const signals: DiagnosticSignal[] = [];

      const baseIndicadores = artigos.flatMap(a => indicadoresPorArtigo[a] || []);
      const baseOrcamento = artigos.flatMap(a => orcamentoPorArtigo[a] || []);
      const baseNormativos = artigos.flatMap(a => normativosPorArtigo[a] || []);

      const keywordIndicadores = indicadores.filter(ind => {
        const haystack = `${ind.nome} ${ind.categoria}`.toLowerCase();
        return keywords.some(k => haystack.includes(k));
      });

      const keywordOrcamento = orcamento.filter(item => {
        const haystack = `${item.programa} ${item.orgao}`.toLowerCase();
        return keywords.some(k => haystack.includes(k));
      });

      const keywordNormativos = normativos.filter(doc => {
        const haystack = `${doc.titulo}`.toLowerCase();
        return keywords.some(k => haystack.includes(k));
      });

      const indicadoresVinculados = Array.from(new Map([...baseIndicadores, ...keywordIndicadores].map(i => [i.nome, i])).values())
        .slice(0, 20);
      const orcamentosVinculados = Array.from(new Map([...baseOrcamento, ...keywordOrcamento].map(o => [`${o.programa}-${o.orgao}-${o.ano}`, o])).values())
        .slice(0, 20);
      const normativosVinculados = Array.from(new Map([...baseNormativos, ...keywordNormativos].map(n => [n.titulo, n])).values())
        .slice(0, 20);

      // 1. 📊 Tendência dos indicadores
      const tendencias = indicadoresVinculados.map(i => inferTendencia(i));
      const pioram = tendencias.filter(t => t === 'piora').length;
      const melhoram = tendencias.filter(t => t === 'melhora').length;

      if (pioram > 0 && pioram >= melhoram) {
        signals.push({
          type: 'tendencia',
          severity: 'critical',
          message: `${pioram} indicador(es) com tendência de piora`,
          detail: indicadoresVinculados
            .filter(i => inferTendencia(i) === 'piora')
            .map(i => i.nome)
            .slice(0, 4)
            .join(', '),
        });
      } else if (melhoram > 0) {
        signals.push({
          type: 'tendencia',
          severity: 'info',
          message: `${melhoram} indicador(es) com tendência de melhora`,
          detail: indicadoresVinculados
            .filter(i => inferTendencia(i) === 'melhora')
            .map(i => i.nome)
            .slice(0, 4)
            .join(', '),
        });
      }

      // 2. 💰 Orçamento simbólico
      const simbolicos = orcamentosVinculados.filter(o => {
        const dotacao = Number(o.dotacao_autorizada) || 0;
        const pago = Number(o.pago) || 0;
        return dotacao > 100000 && pago < dotacao * 0.05;
      });

      if (simbolicos.length > 0) {
        const totalDotacao = simbolicos.reduce((s, o) => s + (Number(o.dotacao_autorizada) || 0), 0);
        signals.push({
          type: 'orcamento_simbolico',
          severity: 'warning',
          message: `${simbolicos.length} ação(ões) com orçamento simbólico`,
          detail: `R$ ${(totalDotacao / 1e6).toFixed(1)}M autorizados com execução < 5%`,
        });
      } else if (orcamentosVinculados.length > 0) {
        signals.push({
          type: 'orcamento_simbolico',
          severity: 'info',
          message: `${orcamentosVinculados.length} ação(ões) orçamentária(s) vinculada(s)`,
        });
      }

      // 3. 📋 Cobertura normativa
      if (normativosVinculados.length > 0) {
        signals.push({
          type: 'cobertura_normativa',
          severity: 'info',
          message: `${normativosVinculados.length} norma(s) vinculada(s)`,
          detail: normativosVinculados.slice(0, 3).map(n => n.titulo).join(', '),
        });
      } else {
        signals.push({
          type: 'cobertura_normativa',
          severity: 'warning',
          message: 'Sem cobertura normativa identificada',
        });
      }

      // 4. ⚠️ Sugestão de reclassificação (interpretação equilibrada)
      // Critérios mais permissivos: reconhece esforço normativo e tendências mistas
      let statusSugerido: ComplianceStatus | null = null;
      const manual = lacuna.status_cumprimento;

      // Condição de piora: MAIORIA dos indicadores piora E orçamento simbólico E sem cobertura normativa
      const pioraGrave = pioram > 0 && pioram > melhoram * 2 && simbolicos.length > 0 && normativosVinculados.length === 0;
      // Condição de melhora: indicadores melhoram OU há cobertura normativa significativa
      const melhoraDetectada = (melhoram > 0 && pioram === 0) || (normativosVinculados.length >= 2 && pioram === 0);
      // Condição intermediária: há esforço normativo mesmo com indicadores mistos
      const esforcoNormativo = normativosVinculados.length >= 1 && orcamentosVinculados.length >= 1;

      if (pioraGrave) {
        // Só rebaixa em casos graves (piora majoritária + orçamento simbólico + sem normativa)
        if (manual === 'cumprido') statusSugerido = 'parcialmente_cumprido';
        else if (manual === 'parcialmente_cumprido') statusSugerido = 'nao_cumprido';
      } else if (melhoraDetectada) {
        if (manual === 'nao_cumprido') statusSugerido = 'parcialmente_cumprido';
        else if (manual === 'retrocesso') statusSugerido = 'nao_cumprido';
        else if (manual === 'parcialmente_cumprido' && melhoram >= 2 && normativosVinculados.length >= 2) statusSugerido = 'cumprido';
      } else if (esforcoNormativo && manual === 'nao_cumprido') {
        // Reconhece esforço legislativo/institucional mesmo sem melhora nos indicadores
        statusSugerido = 'em_andamento';
      }

      const divergente = statusSugerido !== null && statusSugerido !== manual;
      if (divergente && statusSugerido) {
        signals.push({
          type: 'divergencia',
          severity: pioraGrave ? 'critical' : 'warning',
          message: `Sugestão: reclassificar de "${formatStatus(manual)}" para "${formatStatus(statusSugerido)}"`,
        });
      }

      return {
        lacunaId: lacuna.id,
        statusManual: manual,
        statusSugerido,
        divergente,
        signals,
        linkedIndicadores: indicadoresVinculados.map(i => ({ nome: i.nome, categoria: i.categoria, tendencia: i.tendencia, dados: i.dados })),
        linkedOrcamento: orcamentosVinculados.map(o => ({ programa: o.programa, orgao: o.orgao, ano: o.ano, dotacao_autorizada: o.dotacao_autorizada, pago: o.pago })),
        linkedNormativos: normativosVinculados.map(n => ({ titulo: n.titulo, status: n.status })),
      };
    });
  }, [lacunas, indicadores, orcamento, normativos, indicadoresPorArtigo, orcamentoPorArtigo, normativosPorArtigo]);

  // ── Summary ──────────────────────────────────────────────────────
  const summary = useMemo<DiagnosticSummary>(() => {
    const totalDivergencias = diagnostics.filter(d => d.divergente).length;
    const totalOrcamentoSimbolico = diagnostics.filter(d => d.signals.some(s => s.type === 'orcamento_simbolico')).length;
    const totalTendenciaPiora = diagnostics.filter(d => d.signals.some(s => s.type === 'tendencia' && s.severity === 'critical')).length;
    const totalSemCoberturaNormativa = diagnostics.filter(d => d.signals.some(s => s.type === 'cobertura_normativa' && s.severity === 'warning')).length;

    // Reclassified status counts
    const statusReclassificado = {
      cumprido: 0,
      parcialmente_cumprido: 0,
      nao_cumprido: 0,
      retrocesso: 0,
      em_andamento: 0,
    };

    diagnostics.forEach(d => {
      const effective = d.statusSugerido && d.divergente ? d.statusSugerido : d.statusManual;
      statusReclassificado[effective]++;
    });

    // Progress based on reclassified statuses
    const total = diagnostics.length;
    const progressoSensor = total > 0
      ? Math.round(((statusReclassificado.cumprido * 100) + (statusReclassificado.parcialmente_cumprido * 50)) / total)
      : 0;

    return {
      totalDivergencias,
      totalOrcamentoSimbolico,
      totalTendenciaPiora,
      totalSemCoberturaNormativa,
      statusReclassificado,
      progressoSensor,
    };
  }, [diagnostics]);

  const diagnosticMap = useMemo(() => {
    const map = new Map<string, LacunaDiagnostic>();
    diagnostics.forEach(d => map.set(d.lacunaId, d));
    return map;
  }, [diagnostics]);

  return {
    diagnostics,
    diagnosticMap,
    summary,
    isReady: !!(lacunas && indicadores && orcamento && normativos),
  };
}

// ── Formatting helpers ─────────────────────────────────────────────
function formatStatus(status: ComplianceStatus): string {
  const map: Record<ComplianceStatus, string> = {
    cumprido: 'Cumprido',
    parcialmente_cumprido: 'Parcial',
    nao_cumprido: 'Não Cumprido',
    retrocesso: 'Retrocesso',
    em_andamento: 'Em Andamento',
  };
  return map[status] || status;
}

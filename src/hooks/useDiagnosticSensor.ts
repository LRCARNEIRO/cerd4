import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LacunaIdentificada, ComplianceStatus, ThematicAxis, FocalGroupType } from '@/hooks/useLacunasData';
import { EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';

// ── Types ──────────────────────────────────────────────────────────
export type DiagnosticSignalType = 'tendencia' | 'orcamento_simbolico' | 'cobertura_normativa';

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

export interface AuditScoreBreakdown {
  indicadores: { score: number; total: number; melhoram: number; pioram: number; estaveis: number; justificativa: string };
  orcamento: { score: number; total: number; simbolicos: number; execucaoMedia: number; justificativa: string };
  normativos: { score: number; total: number; justificativa: string };
  scoreGlobal: number;
  statusComputado: ComplianceStatus;
  justificativaCompleta: string;
}

export interface LacunaDiagnostic {
  lacunaId: string;
  statusComputado: ComplianceStatus;
  auditoria: AuditScoreBreakdown;
  signals: DiagnosticSignal[];
  linkedIndicadores: LinkedIndicador[];
  linkedOrcamento: LinkedOrcamento[];
  linkedNormativos: LinkedNormativo[];
}

export interface DiagnosticSummary {
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
        .select('nome, categoria, tendencia, dados, artigos_convencao')
        .neq('categoria', 'common_core');
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

      const indicadoresVinculados = Array.from(new Map([...baseIndicadores, ...keywordIndicadores].map(i => [i.nome, i])).values()).slice(0, 20);
      const orcamentosVinculados = Array.from(new Map([...baseOrcamento, ...keywordOrcamento].map(o => [`${o.programa}-${o.orgao}-${o.ano}`, o])).values()).slice(0, 20);
      const normativosVinculados = Array.from(new Map([...baseNormativos, ...keywordNormativos].map(n => [n.titulo, n])).values()).slice(0, 20);

      // ═══════════════════════════════════════════════════════════
      // MOTOR DE STATUS COMPUTADO — Metodologia Auditável
      // ═══════════════════════════════════════════════════════════
      // Pesos: Indicadores 40% | Orçamento 30% | Normativos 30%
      // Score 0-100 → Status automático com justificativa

      // ── 1. SCORE INDICADORES (0-100, peso 40%) ──
      const tendencias = indicadoresVinculados.map(i => inferTendencia(i));
      const pioram = tendencias.filter(t => t === 'piora').length;
      const melhoram = tendencias.filter(t => t === 'melhora').length;
      const estaveis = tendencias.filter(t => t === 'estavel').length;
      const totalInd = indicadoresVinculados.length;

      let scoreInd = 50; // base neutra
      if (totalInd > 0) {
        const ratioMelhora = melhoram / totalInd;
        const ratioPiora = pioram / totalInd;
        // Melhora puxa para cima, piora puxa para baixo
        scoreInd = Math.round(50 + (ratioMelhora * 50) - (ratioPiora * 50));
        scoreInd = Math.max(0, Math.min(100, scoreInd));
      } else {
        scoreInd = 25; // sem indicadores = incerteza → score baixo
      }

      const justInd = totalInd === 0
        ? 'Nenhum indicador vinculado — sem base estatística para avaliar tendência.'
        : `${totalInd} indicador(es): ${melhoram} melhora(m), ${pioram} piora(m), ${estaveis} estável(is). Score: ${scoreInd}/100.`;

      // Signals for indicators
      if (pioram > 0 && pioram >= melhoram) {
        signals.push({ type: 'tendencia', severity: 'critical', message: `${pioram} indicador(es) com tendência de piora`, detail: indicadoresVinculados.filter(i => inferTendencia(i) === 'piora').map(i => i.nome).slice(0, 4).join(', ') });
      } else if (melhoram > 0) {
        signals.push({ type: 'tendencia', severity: 'info', message: `${melhoram} indicador(es) com tendência de melhora`, detail: indicadoresVinculados.filter(i => inferTendencia(i) === 'melhora').map(i => i.nome).slice(0, 4).join(', ') });
      }

      // ── 2. SCORE ORÇAMENTO (0-100, peso 30%) ──
      const simbolicos = orcamentosVinculados.filter(o => {
        const dotacao = Number(o.dotacao_autorizada) || 0;
        const pago = Number(o.pago) || 0;
        return dotacao > 100000 && pago < dotacao * 0.05;
      });
      const totalOrc = orcamentosVinculados.length;

      let execucaoMedia = 0;
      let scoreOrc = 0;
      if (totalOrc > 0) {
        const totalDotacao = orcamentosVinculados.reduce((s, o) => s + (Number(o.dotacao_autorizada) || 0), 0);
        const totalPago = orcamentosVinculados.reduce((s, o) => s + (Number(o.pago) || 0), 0);
        execucaoMedia = totalDotacao > 0 ? (totalPago / totalDotacao) * 100 : 0;
        // Execução > 70% = score alto, < 5% = score mínimo
        scoreOrc = Math.round(Math.min(100, execucaoMedia * 1.3));
        // Penalidade por simbólicos
        if (simbolicos.length > 0) {
          scoreOrc = Math.max(10, scoreOrc - (simbolicos.length / totalOrc) * 30);
        }
      } else {
        scoreOrc = 20; // sem orçamento vinculado = incerteza
      }
      scoreOrc = Math.round(Math.max(0, Math.min(100, scoreOrc)));

      const justOrc = totalOrc === 0
        ? 'Nenhuma ação orçamentária vinculada — sem evidência de investimento público.'
        : `${totalOrc} ação(ões), execução média ${execucaoMedia.toFixed(1)}%${simbolicos.length > 0 ? `, ${simbolicos.length} simbólica(s) (<5%)` : ''}. Score: ${scoreOrc}/100.`;

      // Signals for budget
      if (simbolicos.length > 0) {
        const totalDotSim = simbolicos.reduce((s, o) => s + (Number(o.dotacao_autorizada) || 0), 0);
        signals.push({ type: 'orcamento_simbolico', severity: 'warning', message: `${simbolicos.length} ação(ões) com orçamento simbólico`, detail: `R$ ${(totalDotSim / 1e6).toFixed(1)}M autorizados com execução < 5%` });
      } else if (totalOrc > 0) {
        signals.push({ type: 'orcamento_simbolico', severity: 'info', message: `${totalOrc} ação(ões) orçamentária(s) vinculada(s)` });
      }

      // ── 3. SCORE NORMATIVOS (0-100, peso 30%) ──
      const totalNorm = normativosVinculados.length;
      let scoreNorm = 0;
      if (totalNorm >= 5) scoreNorm = 100;
      else if (totalNorm >= 3) scoreNorm = 80;
      else if (totalNorm >= 2) scoreNorm = 60;
      else if (totalNorm >= 1) scoreNorm = 40;
      else scoreNorm = 5; // sem normativo = quase zero

      const justNorm = totalNorm === 0
        ? 'Sem cobertura normativa identificada — ausência de marco legal/regulamentar vinculado.'
        : `${totalNorm} instrumento(s) normativo(s) vinculado(s). Score: ${scoreNorm}/100.`;

      // Signals for normatives
      if (totalNorm > 0) {
        signals.push({ type: 'cobertura_normativa', severity: 'info', message: `${totalNorm} norma(s) vinculada(s)`, detail: normativosVinculados.slice(0, 3).map(n => n.titulo).join(', ') });
      } else {
        signals.push({ type: 'cobertura_normativa', severity: 'warning', message: 'Sem cobertura normativa identificada' });
      }

      // ── SCORE GLOBAL (ponderado) ──
      const PESO_IND = 0.40;
      const PESO_ORC = 0.30;
      const PESO_NORM = 0.30;
      const scoreGlobal = Math.round(scoreInd * PESO_IND + scoreOrc * PESO_ORC + scoreNorm * PESO_NORM);

      // ── STATUS COMPUTADO ──
      // Faixas: ≥75 Cumprido | ≥55 Parcial | ≥35 Em Andamento | ≥15 Não Cumprido | <15 Retrocesso
      let statusComputado: ComplianceStatus;
      if (scoreGlobal >= 75) statusComputado = 'cumprido';
      else if (scoreGlobal >= 55) statusComputado = 'parcialmente_cumprido';
      else if (scoreGlobal >= 35) statusComputado = 'em_andamento';
      else if (scoreGlobal >= 15) statusComputado = 'nao_cumprido';
      else statusComputado = 'retrocesso';

      // Ajuste: se maioria dos indicadores piora E sem normativa, não pode ser cumprido
      if (pioram > melhoram && totalNorm === 0 && statusComputado === 'cumprido') {
        statusComputado = 'parcialmente_cumprido';
      }
      // Ajuste: retrocesso requer piora detectada — se não há piora, mínimo é nao_cumprido
      if (statusComputado === 'retrocesso' && pioram === 0) {
        statusComputado = 'nao_cumprido';
      }

      const statusLabels: Record<ComplianceStatus, string> = {
        cumprido: 'Cumprido', parcialmente_cumprido: 'Parcialmente Cumprido',
        em_andamento: 'Em Andamento', nao_cumprido: 'Não Cumprido', retrocesso: 'Retrocesso'
      };

      const justificativaCompleta = [
        `SCORE GLOBAL: ${scoreGlobal}/100 → ${statusLabels[statusComputado]}`,
        ``,
        `📊 INDICADORES (peso ${PESO_IND * 100}%): ${justInd}`,
        `💰 ORÇAMENTO (peso ${PESO_ORC * 100}%): ${justOrc}`,
        `📋 NORMATIVOS (peso ${PESO_NORM * 100}%): ${justNorm}`,
        ``,
        `Faixas: ≥75 Cumprido | ≥55 Parcial | ≥35 Em Andamento | ≥15 Não Cumprido | <15 Retrocesso`,
      ].join('\n');

      const auditoria: AuditScoreBreakdown = {
        indicadores: { score: scoreInd, total: totalInd, melhoram, pioram, estaveis, justificativa: justInd },
        orcamento: { score: scoreOrc, total: totalOrc, simbolicos: simbolicos.length, execucaoMedia: Math.round(execucaoMedia * 10) / 10, justificativa: justOrc },
        normativos: { score: scoreNorm, total: totalNorm, justificativa: justNorm },
        scoreGlobal,
        statusComputado,
        justificativaCompleta,
      };

      return {
        lacunaId: lacuna.id,
        statusComputado,
        auditoria,
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
    const totalOrcamentoSimbolico = diagnostics.filter(d => d.signals.some(s => s.type === 'orcamento_simbolico' && s.severity === 'warning')).length;
    const totalTendenciaPiora = diagnostics.filter(d => d.signals.some(s => s.type === 'tendencia' && s.severity === 'critical')).length;
    const totalSemCoberturaNormativa = diagnostics.filter(d => d.signals.some(s => s.type === 'cobertura_normativa' && s.severity === 'warning')).length;

    // Use status COMPUTADO (não manual) para contagens e progresso
    const statusReclassificado = {
      cumprido: 0,
      parcialmente_cumprido: 0,
      nao_cumprido: 0,
      retrocesso: 0,
      em_andamento: 0,
    };

    diagnostics.forEach(d => {
      statusReclassificado[d.statusComputado]++;
    });

    // Progress based on computed statuses
    const total = diagnostics.length;
    const progressoSensor = total > 0
      ? Math.round((
          (statusReclassificado.cumprido * 100) + 
          (statusReclassificado.parcialmente_cumprido * 60) + 
          (statusReclassificado.em_andamento * 30) +
          (statusReclassificado.nao_cumprido * 5)
        ) / total)
      : 0;

    return {
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

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LacunaIdentificada, ComplianceStatus } from '@/hooks/useLacunasData';

// ── Types ──────────────────────────────────────────────────────────
export type DiagnosticSignalType = 'tendencia' | 'orcamento_simbolico' | 'cobertura_normativa' | 'divergencia';

export interface DiagnosticSignal {
  type: DiagnosticSignalType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  detail?: string;
}

export interface LacunaDiagnostic {
  lacunaId: string;
  statusManual: ComplianceStatus;
  statusSugerido: ComplianceStatus | null;
  divergente: boolean;
  signals: DiagnosticSignal[];
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

// ── Helper: extract artigos from lacuna ────────────────────────────
function getLacunaArtigos(lacuna: LacunaIdentificada): string[] {
  // artigos_convencao is not on the TS interface but exists in DB
  const raw = (lacuna as any).artigos_convencao;
  if (Array.isArray(raw)) return raw.map(String);
  return [];
}

// ── Helper: check indicator tendency ───────────────────────────────
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

  // ── Build indices by artigo ──────────────────────────────────────
  const indicadoresPorArtigo = useMemo(() => {
    if (!indicadores) return {} as Record<string, typeof indicadores>;
    const map: Record<string, typeof indicadores> = {};
    indicadores.forEach(ind => {
      const arts = (ind.artigos_convencao as string[] | null) || [];
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
      const arts = (orc.artigos_convencao as string[] | null) || [];
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
      const arts = (doc.artigos_convencao as string[] | null) || [];
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
      const signals: DiagnosticSignal[] = [];

      // 1. 📊 Tendência dos indicadores
      const indicadoresVinculados = artigos.flatMap(a => indicadoresPorArtigo[a] || []);
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
            .slice(0, 3)
            .join(', '),
        });
      } else if (melhoram > 0) {
        signals.push({
          type: 'tendencia',
          severity: 'info',
          message: `${melhoram} indicador(es) com tendência de melhora`,
        });
      }

      // 2. 💰 Orçamento simbólico
      const orcamentosVinculados = artigos.flatMap(a => orcamentoPorArtigo[a] || []);
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
      }

      // 3. 📋 Cobertura normativa
      const normativosVinculados = artigos.flatMap(a => normativosPorArtigo[a] || []);
      if (normativosVinculados.length > 0) {
        signals.push({
          type: 'cobertura_normativa',
          severity: 'info',
          message: `${normativosVinculados.length} norma(s) vinculada(s)`,
        });
      } else if (artigos.length > 0) {
        signals.push({
          type: 'cobertura_normativa',
          severity: 'warning',
          message: 'Sem cobertura normativa identificada',
        });
      }

      // 4. ⚠️ Sugestão de reclassificação
      let statusSugerido: ComplianceStatus | null = null;
      const manual = lacuna.status_cumprimento;

      if (pioram > 0 && pioram >= melhoram && simbolicos.length > 0) {
        // Indicadores piorando + orçamento simbólico → forte sinal de não cumprimento
        if (manual === 'cumprido' || manual === 'parcialmente_cumprido') {
          statusSugerido = 'nao_cumprido';
        } else if (manual === 'nao_cumprido') {
          statusSugerido = 'retrocesso';
        }
      } else if (pioram > 0 && pioram >= melhoram) {
        // Apenas indicadores piorando
        if (manual === 'cumprido') {
          statusSugerido = 'parcialmente_cumprido';
        } else if (manual === 'parcialmente_cumprido') {
          statusSugerido = 'nao_cumprido';
        }
      } else if (simbolicos.length > 0) {
        // Apenas orçamento simbólico
        if (manual === 'cumprido') {
          statusSugerido = 'parcialmente_cumprido';
        }
      } else if (melhoram > 0 && pioram === 0 && normativosVinculados.length > 0 && simbolicos.length === 0) {
        // Indicadores melhorando + marco normativo + sem orçamento simbólico → possível upgrade
        if (manual === 'nao_cumprido') {
          statusSugerido = 'parcialmente_cumprido';
        } else if (manual === 'parcialmente_cumprido') {
          statusSugerido = 'cumprido';
        }
      }

      const divergente = statusSugerido !== null && statusSugerido !== manual;

      if (divergente && statusSugerido) {
        signals.push({
          type: 'divergencia',
          severity: 'critical',
          message: `Sugestão: reclassificar de "${formatStatus(manual)}" para "${formatStatus(statusSugerido)}"`,
        });
      }

      return {
        lacunaId: lacuna.id,
        statusManual: manual,
        statusSugerido,
        divergente,
        signals,
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

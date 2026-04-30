import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LacunaIdentificada, ComplianceStatus, ThematicAxis } from '@/hooks/useLacunasData';
import { EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { normalizeArticleTag } from '@/utils/normalizeArticleTag';
import { getRecommendationKeywordMatch } from '@/utils/recommendationKeywordMatching';
import { buildIndicadorCodigoMap } from '@/utils/indicadorCodigo';
import type { EvidenceOverride, EvidenceOverrides } from '@/components/shared/EvidenceDrilldownDialog';

// ── Types ──────────────────────────────────────────────────────────
export type DiagnosticSignalType = 'tendencia' | 'orcamento_simbolico' | 'cobertura_normativa';

export interface DiagnosticSignal {
  type: DiagnosticSignalType;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  detail?: string;
}

export interface LinkedIndicador {
  id?: string;
  codigo?: string;
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
  liquidado: number | null;
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

/** Diagnóstico computado de uma recomendação (CERD, RG ou Durban) */
export interface RecomendacaoDiagnostic {
  recomendacaoId: string;
  statusComputado: ComplianceStatus;
  auditoria: AuditScoreBreakdown;
  signals: DiagnosticSignal[];
  linkedIndicadores: LinkedIndicador[];
  linkedOrcamento: LinkedOrcamento[];
  linkedNormativos: LinkedNormativo[];
}

/** @deprecated Use RecomendacaoDiagnostic */
export type LacunaDiagnostic = RecomendacaoDiagnostic;

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

const diagnosticsCache = new Map<string, RecomendacaoDiagnostic[]>();
const DIAGNOSTICS_CACHE_LIMIT = 20;

function setDiagnosticsCache(key: string, value: RecomendacaoDiagnostic[]): RecomendacaoDiagnostic[] {
  diagnosticsCache.set(key, value);
  if (diagnosticsCache.size > DIAGNOSTICS_CACHE_LIMIT) {
    const oldestKey = diagnosticsCache.keys().next().value;
    if (oldestKey !== undefined) diagnosticsCache.delete(oldestKey);
  }
  return value;
}

function arrayDataSignature(values: any[] | undefined, fields: string[]): string {
  if (!values) return 'pending';
  return `${values.length}:${values.map((item) => fields.map((field) => item?.[field] ?? '').join('|')).join('¬')}`;
}

function normalizeArticle(raw: string): ArtigoConvencao | null {
  return normalizeArticleTag(raw);
}

function getRecomendacaoArtigos(rec: LacunaIdentificada): ArtigoConvencao[] {
  const raw = (rec as any).artigos_convencao;
  const explicit = Array.isArray(raw) ? raw.map(normalizeArticle).filter(Boolean) as ArtigoConvencao[] : [];
  if (explicit.length > 0) return [...new Set(explicit)];
  return EIXO_PARA_ARTIGOS[rec.eixo_tematico as ThematicAxis] || [];
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

// ── Main Hook ──────────────────────────────────────────────────────
export function useDiagnosticSensor(recomendacoes: LacunaIdentificada[] | undefined, overrides?: EvidenceOverrides) {
  const SHARED_OPTS = {
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false as const,
    refetchOnWindowFocus: false as const,
    refetchOnReconnect: false as const,
  };

  // Reuse the SAME query keys as useLacunasData hooks to avoid duplicate fetches
  const { data: indicadores } = useQuery({
    queryKey: ['indicadores-analiticos-sem-cc'],
    ...SHARED_OPTS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indicadores_interseccionais')
        .select('*')
        .order('created_at', { ascending: true })
        .order('id', { ascending: true });
      if (error) throw error;
      const all = data || [];
      const codigos = buildIndicadorCodigoMap(all);
      return all
        .map(i => ({ ...i, codigo: codigos.get(i.id) || '' }))
        .filter(i => i.categoria !== 'common_core');
    },
  });

  const { data: orcamento } = useQuery({
    queryKey: ['sensor-orcamento'],
    ...SHARED_OPTS,
    queryFn: async () => {
      let all: any[] = [];
      let page = 0;
      while (true) {
        const { data, error } = await supabase
          .from('dados_orcamentarios')
          .select('programa, orgao, ano, dotacao_autorizada, liquidado, pago, artigos_convencao, descritivo, eixo_tematico, publico_alvo, observacoes, razao_selecao')
          .range(page * 1000, (page + 1) * 1000 - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all = all.concat(data);
        if (data.length < 1000) break;
        page++;
      }
      return all;
    },
  });

  const { data: normativos } = useQuery({
    queryKey: ['sensor-normativos'],
    ...SHARED_OPTS,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos_normativos')
        .select('titulo, artigos_convencao, status, categoria');
      if (error) throw error;
      return data || [];
    },
  });

  // ── Diagnose each recomendação ────────────────────────────────────
  // VINCULAÇÃO HÍBRIDA AUDITÁVEL:
  // evidências só entram se houver coerência temática suficiente com o
  // tema/descrição/texto ONU da recomendação, sem usar eixo ou artigo genérico.
  // Combina frase/termo exato + expansão conceitual + campos textuais auxiliares.
  const diagnostics = useMemo<RecomendacaoDiagnostic[]>(() => {
    if (!recomendacoes || !indicadores || !orcamento || !normativos) return [];

    const cacheKey = JSON.stringify({
      recs: arrayDataSignature(recomendacoes, ['id', 'tema', 'descricao_lacuna', 'grupo_focal', 'updated_at']),
      indicadores: arrayDataSignature(indicadores, ['nome', 'categoria', 'subcategoria', 'updated_at']),
      orcamento: arrayDataSignature(orcamento, ['programa', 'orgao', 'ano', 'dotacao_autorizada', 'pago']),
      normativos: arrayDataSignature(normativos, ['titulo', 'status', 'categoria']),
      overrides,
    });
    const cachedDiagnostics = diagnosticsCache.get(cacheKey);
    if (cachedDiagnostics) return cachedDiagnostics;

    const orcKeyFn = (o: any) => `${o.programa}|${o.orgao}|${o.ano}`;

    const nextDiagnostics = recomendacoes.map(rec => {
      const recOverride = overrides?.[rec.id];
      const signals: DiagnosticSignal[] = [];

      const indicadoresVinculados = indicadores
        .map((ind) => ({
          item: ind,
          match: getRecommendationKeywordMatch(
            rec,
            `${ind.nome} ${ind.categoria} ${ind.subcategoria || ''} ${ind.analise_interseccional || ''} ${Array.isArray(ind.documento_origem) ? ind.documento_origem.join(' ') : ''}`
          ),
        }))
        .filter(({ match }) => match.isRelevant)
        .sort((a, b) => b.match.score - a.match.score || a.item.nome.localeCompare(b.item.nome))
        .map(({ item }) => item)
        .slice(0, 20);

      const orcamentosVinculados = orcamento
        .map((item) => ({
          item,
          match: getRecommendationKeywordMatch(
            rec,
            `${item.programa} ${item.orgao} ${item.descritivo || ''} ${item.eixo_tematico || ''} ${item.publico_alvo || ''} ${item.observacoes || ''} ${item.razao_selecao || ''}`
          ),
        }))
        .filter(({ match }) => match.isRelevant)
        .sort((a, b) => b.match.score - a.match.score || a.item.programa.localeCompare(b.item.programa))
        .map(({ item }) => item)
        .slice(0, 20);

      const normativosVinculados = normativos
        .map((doc) => ({
          item: doc,
          match: getRecommendationKeywordMatch(rec, `${doc.titulo} ${doc.categoria || ''}`),
        }))
        .filter(({ match }) => match.isRelevant)
        .sort((a, b) => b.match.score - a.match.score || a.item.titulo.localeCompare(b.item.titulo))
        .map(({ item }) => item)
        .slice(0, 20);

      // ── Apply manual overrides ──
      let finalIndicadores = indicadoresVinculados;
      let finalOrcamentos = orcamentosVinculados;
      let finalNormativos = normativosVinculados;

      if (recOverride) {
        finalIndicadores = [
          ...finalIndicadores.filter(i => !recOverride.removedIndicadores.includes(i.nome)),
          ...recOverride.addedIndicadores
            .filter(a => !finalIndicadores.some(f => f.nome === a.nome))
            .map(a => ({ ...a, subcategoria: null, analise_interseccional: null, documento_origem: null, artigos_convencao: null } as any)),
        ];
        finalOrcamentos = [
          ...finalOrcamentos.filter(o => !recOverride.removedOrcamento.includes(orcKeyFn(o))),
          ...recOverride.addedOrcamento
            .filter(a => !finalOrcamentos.some(f => orcKeyFn(f) === orcKeyFn(a)))
            .map(a => ({ ...a, descritivo: null, eixo_tematico: null, publico_alvo: null, observacoes: null, razao_selecao: null, artigos_convencao: null } as any)),
        ];
        finalNormativos = [
          ...finalNormativos.filter(n => !recOverride.removedNormativos.includes(n.titulo)),
          ...recOverride.addedNormativos
            .filter(a => !finalNormativos.some(f => f.titulo === a.titulo))
            .map(a => ({ ...a, artigos_convencao: null, categoria: '' } as any)),
        ];
      }

      const totalInd = finalIndicadores.length;
      const totalOrc = finalOrcamentos.length;
      const totalNorm = finalNormativos.length;

      // ═══════════════════════════════════════════════════════════
       // MOTOR DE STATUS COMPUTADO v6 — Cobertura Pura (Esforço Governamental)
      // ═══════════════════════════════════════════════════════════
      // Mede APENAS se o governo buscou responder (existência de evidências).
      // Pesos: Indicadores 40% | Orçamento 30% | Normativos 30%
      // 3 Faixas: ≥65 Cumprido | ≥35 Parcial | <35 Não Cumprido
      // Análise de execução/tendência pertence ao Motor de Evolução.

      // ── 1. SCORE INDICADORES (0-100, peso 40%) — contagem ──
      let scoreInd = 0;
      if (totalInd >= 10) scoreInd = 100;
      else if (totalInd >= 7) scoreInd = 80;
      else if (totalInd >= 5) scoreInd = 65;
      else if (totalInd >= 3) scoreInd = 50;
      else if (totalInd >= 2) scoreInd = 35;
      else if (totalInd >= 1) scoreInd = 20;
      else scoreInd = 0;

      const justInd = totalInd === 0
        ? 'Nenhum indicador vinculado — sem base estatística disponível.'
        : `${totalInd} indicador(es) vinculado(s) por coerência temática → ${scoreInd} pts.`;

      // Tendências informativas (não afetam score de esforço, mas são exibidas)
      const tendencias = finalIndicadores.map(i => inferTendencia(i));
      const pioram = tendencias.filter(t => t === 'piora').length;
      const melhoram = tendencias.filter(t => t === 'melhora').length;
      const estaveis = tendencias.filter(t => t === 'estavel').length;

      // Signals for indicators
      if (pioram > 0 && pioram >= melhoram) {
        signals.push({ type: 'tendencia', severity: 'critical', message: `${pioram} indicador(es) com tendência de piora`, detail: finalIndicadores.filter(i => inferTendencia(i) === 'piora').map(i => i.nome).slice(0, 4).join(', ') });
      } else if (melhoram > 0) {
        signals.push({ type: 'tendencia', severity: 'info', message: `${melhoram} indicador(es) com tendência de melhora`, detail: finalIndicadores.filter(i => inferTendencia(i) === 'melhora').map(i => i.nome).slice(0, 4).join(', ') });
      }

      // ── 2. SCORE ORÇAMENTO (0-100, peso 30%) — CONTAGEM de ações (não execução) ──
      // A análise de execução financeira pertence ao Motor de Evolução.
      let scoreOrc = 0;
      if (totalOrc >= 12) scoreOrc = 100;
      else if (totalOrc >= 8) scoreOrc = 80;
      else if (totalOrc >= 5) scoreOrc = 65;
      else if (totalOrc >= 3) scoreOrc = 50;
      else if (totalOrc >= 2) scoreOrc = 35;
      else if (totalOrc >= 1) scoreOrc = 20;
      else scoreOrc = 0;

      const justOrc = totalOrc === 0
        ? 'Nenhuma ação orçamentária vinculada — sem evidência de investimento público.'
        : `${totalOrc} ação(ões) vinculada(s) por coerência temática → ${scoreOrc} pts.`;

      // Signals for budget
      if (totalOrc > 0) {
        signals.push({ type: 'orcamento_simbolico', severity: 'info', message: `${totalOrc} ação(ões) orçamentária(s) vinculada(s)` });
      }

      // ── 3. SCORE NORMATIVOS (0-100, peso 30%) — contagem ──
      let scoreNorm = 0;
      if (totalNorm >= 6) scoreNorm = 100;
      else if (totalNorm >= 4) scoreNorm = 75;
      else if (totalNorm >= 3) scoreNorm = 55;
      else if (totalNorm >= 2) scoreNorm = 40;
      else if (totalNorm >= 1) scoreNorm = 20;
      else scoreNorm = 0;

      const justNorm = totalNorm === 0
        ? 'Sem cobertura normativa identificada — ausência de marco legal/regulamentar vinculado.'
        : `${totalNorm} instrumento(s) vinculado(s) por coerência temática → ${scoreNorm} pts.`;

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
      let scoreGlobal = Math.round(scoreInd * PESO_IND + scoreOrc * PESO_ORC + scoreNorm * PESO_NORM);

      // ── STATUS COMPUTADO (3 faixas) ──
      let statusComputado: ComplianceStatus;
      if (scoreGlobal >= 65) statusComputado = 'cumprido';
      else if (scoreGlobal >= 35) statusComputado = 'parcialmente_cumprido';
      else statusComputado = 'nao_cumprido';

      const statusLabels: Record<ComplianceStatus, string> = {
        cumprido: 'Cumprido', parcialmente_cumprido: 'Parcialmente Cumprido',
        em_andamento: 'Em Andamento', nao_cumprido: 'Não Cumprido', retrocesso: 'Retrocesso'
      };

      const justificativaCompleta = [
        `SCORE GLOBAL: ${scoreGlobal}/100 → ${statusLabels[statusComputado]}`,
        ``,
         `Motor v6: Cobertura Pura — mede se o governo buscou responder (existência de evidências).`,
         `Palavras-chave extraídas do tema, descrição e texto ONU de cada recomendação.`,
         `A evidência só entra se casar por termo/frase inteira normalizada e atingir coerência temática mínima.`,
         `Todas as 3 dimensões medem CONTAGEM (quantas evidências vinculadas), não qualidade/execução.`,
         `A análise de execução financeira e tendência de indicadores pertence ao Motor de Evolução.`,
        `📊 INDICADORES (peso ${PESO_IND * 100}%): ${justInd}`,
        `💰 ORÇAMENTO (peso ${PESO_ORC * 100}%): ${justOrc}`,
        `📋 NORMATIVOS (peso ${PESO_NORM * 100}%): ${justNorm}`,
        ``,
        `Faixas: ≥65 Cumprido | ≥35 Parcial | <35 Não Cumprido`,
      ].filter(Boolean).join('\n');

      const auditoria: AuditScoreBreakdown = {
        indicadores: { score: scoreInd, total: totalInd, melhoram, pioram, estaveis, justificativa: justInd },
        orcamento: { score: scoreOrc, total: totalOrc, simbolicos: 0, execucaoMedia: 0, justificativa: justOrc },
        normativos: { score: scoreNorm, total: totalNorm, justificativa: justNorm },
        scoreGlobal,
        statusComputado,
        justificativaCompleta,
      };

      return {
        recomendacaoId: rec.id,
        statusComputado,
        auditoria,
        signals,
        linkedIndicadores: finalIndicadores.map(i => ({ id: i.id, codigo: (i as any).codigo, nome: i.nome, categoria: i.categoria, tendencia: i.tendencia, dados: i.dados })),
        linkedOrcamento: finalOrcamentos.map(o => ({ programa: o.programa, orgao: o.orgao, ano: o.ano, dotacao_autorizada: o.dotacao_autorizada, liquidado: o.liquidado, pago: o.pago })),
        linkedNormativos: finalNormativos.map(n => ({ titulo: n.titulo, status: n.status })),
      };
    });

    return setDiagnosticsCache(cacheKey, nextDiagnostics);
  }, [recomendacoes, indicadores, orcamento, normativos, overrides]);

  // ── Summary ──────────────────────────────────────────────────────
  const summary = useMemo<DiagnosticSummary>(() => {
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

    // Progress based on computed statuses (3 faixas)
    const total = diagnostics.length;
    const progressoSensor = total > 0
      ? Math.round((
          (statusReclassificado.cumprido * 100) + 
          (statusReclassificado.parcialmente_cumprido * 50) + 
          (statusReclassificado.em_andamento * 50) +
          (statusReclassificado.nao_cumprido * 10) +
          (statusReclassificado.retrocesso * 10)
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
    const map = new Map<string, RecomendacaoDiagnostic>();
    diagnostics.forEach(d => map.set(d.recomendacaoId, d));
    return map;
  }, [diagnostics]);

  return {
    diagnostics,
    diagnosticMap,
    summary,
    isReady: !!(recomendacoes && indicadores && orcamento && normativos),
    rawIndicadores: indicadores,
    rawOrcamento: orcamento,
    rawNormativos: normativos,
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

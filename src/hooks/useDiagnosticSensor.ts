import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { LacunaIdentificada, ComplianceStatus, ThematicAxis } from '@/hooks/useLacunasData';
import { EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { normalizeArticleTag } from '@/utils/normalizeArticleTag';
import { getRecommendationKeywordMatch } from '@/utils/recommendationKeywordMatching';
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
  // Fetch all three cross-reference sources in parallel
  const { data: indicadores } = useQuery({
    queryKey: ['sensor-indicadores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indicadores_interseccionais')
        .select('nome, categoria, subcategoria, tendencia, dados, artigos_convencao, analise_interseccional, documento_origem')
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
          .select('programa, orgao, ano, dotacao_autorizada, pago, artigos_convencao, descritivo, eixo_tematico, publico_alvo, observacoes, razao_selecao')
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
        .select('titulo, artigos_convencao, status, categoria');
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // ── Diagnose each recomendação ────────────────────────────────────
  // VINCULAÇÃO HÍBRIDA AUDITÁVEL:
  // evidências só entram se houver coerência temática suficiente com o
  // tema/descrição/texto ONU da recomendação, sem usar eixo ou artigo genérico.
  // Combina frase/termo exato + expansão conceitual + campos textuais auxiliares.
  const diagnostics = useMemo<RecomendacaoDiagnostic[]>(() => {
    if (!recomendacoes || !indicadores || !orcamento || !normativos) return [];

    return recomendacoes.map(rec => {
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

      const totalInd = indicadoresVinculados.length;
      const totalOrc = orcamentosVinculados.length;
      const totalNorm = normativosVinculados.length;

      // ═══════════════════════════════════════════════════════════
       // MOTOR DE STATUS COMPUTADO v5 — Vinculação Estrita + Score Temático
      // ═══════════════════════════════════════════════════════════
      // Pesos: Indicadores 40% | Orçamento 30% | Normativos 30%
      // Faixas: ≥80 Cumprido | ≥55 Parcial | ≥35 Em Andamento | ≥15 Não Cumprido | <15 Retrocesso
       // TODAS as evidências vinculadas por termo/frase inteira + score mínimo
      // Cap piora: se indicadores pioram > melhoram, teto global = 55

      // ── 1. SCORE INDICADORES (0-100, peso 40%) ──
      const tendencias = indicadoresVinculados.map(i => inferTendencia(i));
      const pioram = tendencias.filter(t => t === 'piora').length;
      const melhoram = tendencias.filter(t => t === 'melhora').length;
      const estaveis = tendencias.filter(t => t === 'estavel').length;

      let scoreInd = 50;
      if (totalInd > 0) {
        const ratioMelhora = melhoram / totalInd;
        const ratioPiora = pioram / totalInd;
        scoreInd = Math.round(50 + (ratioMelhora * 50) - (ratioPiora * 50));
        scoreInd = Math.max(0, Math.min(100, scoreInd));
      } else {
        scoreInd = 10;
      }

      const justInd = totalInd === 0
        ? 'Nenhum indicador vinculado — sem base estatística para avaliar tendência.'
        : `${totalInd} indicador(es) vinculado(s) por coerência temática: ${melhoram} melhora(m), ${pioram} piora(m), ${estaveis} estável(is). Score: ${scoreInd}/100.`;

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

      let execucaoMedia = 0;
      let scoreOrc = 0;
      if (totalOrc > 0) {
        const totalDotacao = orcamentosVinculados.reduce((s, o) => s + (Number(o.dotacao_autorizada) || 0), 0);
        const totalPago = orcamentosVinculados.reduce((s, o) => s + (Number(o.pago) || 0), 0);
        execucaoMedia = totalDotacao > 0 ? (totalPago / totalDotacao) * 100 : 0;
        scoreOrc = Math.round(Math.min(100, execucaoMedia * 1.3));
        if (simbolicos.length > 0) {
          scoreOrc = Math.max(10, scoreOrc - (simbolicos.length / totalOrc) * 30);
        }
      } else {
        scoreOrc = 10;
      }
      scoreOrc = Math.round(Math.max(0, Math.min(100, scoreOrc)));

      const justOrc = totalOrc === 0
        ? 'Nenhuma ação orçamentária vinculada — sem evidência de investimento público.'
        : `${totalOrc} ação(ões) vinculada(s) por coerência temática, execução média ${execucaoMedia.toFixed(1)}%${simbolicos.length > 0 ? `, ${simbolicos.length} simbólica(s) (<5%)` : ''}. Score: ${scoreOrc}/100.`;

      // Signals for budget
      if (simbolicos.length > 0) {
        const totalDotSim = simbolicos.reduce((s, o) => s + (Number(o.dotacao_autorizada) || 0), 0);
        signals.push({ type: 'orcamento_simbolico', severity: 'warning', message: `${simbolicos.length} ação(ões) com orçamento simbólico`, detail: `R$ ${(totalDotSim / 1e6).toFixed(1)}M autorizados com execução < 5%` });
      } else if (totalOrc > 0) {
        signals.push({ type: 'orcamento_simbolico', severity: 'info', message: `${totalOrc} ação(ões) orçamentária(s) vinculada(s)` });
      }

      // ── 3. SCORE NORMATIVOS (0-100, peso 30%) ──
      let scoreNorm = 0;
      if (totalNorm >= 5) scoreNorm = 100;
      else if (totalNorm >= 3) scoreNorm = 80;
      else if (totalNorm >= 2) scoreNorm = 60;
      else if (totalNorm >= 1) scoreNorm = 40;
      else scoreNorm = 5;

      const justNorm = totalNorm === 0
        ? 'Sem cobertura normativa identificada — ausência de marco legal/regulamentar vinculado.'
        : `${totalNorm} instrumento(s) vinculado(s) por coerência temática. Score: ${scoreNorm}/100.`;

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

      // ── CAP PIORA: se indicadores pioram > melhoram, teto = 55 (Parcial) ──
      const pioraCapped = pioram > melhoram && pioram > 0;
      if (pioraCapped && scoreGlobal > 55) {
        scoreGlobal = 55;
      }

      // ── STATUS COMPUTADO ──
      let statusComputado: ComplianceStatus;
      if (scoreGlobal >= 80) statusComputado = 'cumprido';
      else if (scoreGlobal >= 55) statusComputado = 'parcialmente_cumprido';
      else if (scoreGlobal >= 35) statusComputado = 'em_andamento';
      else if (scoreGlobal >= 15) statusComputado = 'nao_cumprido';
      else statusComputado = 'retrocesso';

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
         `Modelo v5: Vinculação Estrita por Keywords + Score Temático Mínimo`,
         `Palavras-chave extraídas do tema, descrição e texto ONU de cada recomendação.`,
         `A evidência só entra se casar por termo/frase inteira normalizada e atingir coerência temática mínima.`,
         `Para recomendações com grupo focal, exige-se sinal focal explícito (ex.: quilombola, indígena, LGBTQIA+) ou frase específica correlata.`,
         `Termos genéricos como "violência", "proteção" ou "discriminação" não vinculam sozinhos.`,
         `Busca nos campos: nome/categoria de indicadores, programa/órgão/descritivo/eixo/público-alvo de orçamento, título de normativos.`,
        `📊 INDICADORES (peso ${PESO_IND * 100}%): ${justInd}`,
        `💰 ORÇAMENTO (peso ${PESO_ORC * 100}%): ${justOrc}`,
        `📋 NORMATIVOS (peso ${PESO_NORM * 100}%): ${justNorm}`,
        pioraCapped ? `⚠️ CAP PIORA ATIVO: score limitado a 55 (indicadores em piora > melhora)` : '',
        ``,
        `Faixas: ≥80 Cumprido | ≥55 Parcial | ≥35 Em Andamento | ≥15 Não Cumprido | <15 Retrocesso`,
      ].filter(Boolean).join('\n');

      const auditoria: AuditScoreBreakdown = {
        indicadores: { score: scoreInd, total: totalInd, melhoram, pioram, estaveis, justificativa: justInd },
        orcamento: { score: scoreOrc, total: totalOrc, simbolicos: simbolicos.length, execucaoMedia: Math.round(execucaoMedia * 10) / 10, justificativa: justOrc },
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
        linkedIndicadores: indicadoresVinculados.map(i => ({ nome: i.nome, categoria: i.categoria, tendencia: i.tendencia, dados: i.dados })),
        linkedOrcamento: orcamentosVinculados.map(o => ({ programa: o.programa, orgao: o.orgao, ano: o.ano, dotacao_autorizada: o.dotacao_autorizada, pago: o.pago })),
        linkedNormativos: normativosVinculados.map(n => ({ titulo: n.titulo, status: n.status })),
      };
    });
  }, [recomendacoes, indicadores, orcamento, normativos]);

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
    const map = new Map<string, RecomendacaoDiagnostic>();
    diagnostics.forEach(d => map.set(d.recomendacaoId, d));
    return map;
  }, [diagnostics]);

  return {
    diagnostics,
    diagnosticMap,
    summary,
    isReady: !!(recomendacoes && indicadores && orcamento && normativos),
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

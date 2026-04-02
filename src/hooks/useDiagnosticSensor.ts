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

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length >= 5); // ← mínimo 5 letras (evita "terra", "dados", "saude")
}

// ── Stop-words: termos genéricos demais que causam falsos positivos ──
const KEYWORD_STOPWORDS = new Set([
  'sobre', 'entre', 'contra', 'desde', 'ainda', 'outros', 'outras',
  'sendo', 'foram', 'todos', 'todas', 'nivel', 'forma', 'areas',
  'acesso', 'medidas', 'especiais', 'nacional', 'brasil', 'federal',
  'estado', 'governo', 'publico', 'publica', 'sistema', 'programa',
  'politica', 'politicas', 'direitos', 'direito', 'humanos', 'povos',
  'populacao', 'comunidades', 'combate', 'promocao', 'protecao',
  'implementacao', 'garantir', 'inclui', 'impacto', 'social',
]);

/**
 * Keywords específicas por parágrafo — vinculação precisa.
 * Cada recomendação recebe APENAS palavras-chave que descrevem seu tema concreto,
 * sem genéricos de eixo temático que capturam toda a base.
 */
function getRecomendacaoKeywords(rec: LacunaIdentificada): string[] {
  // 1. Extrair tokens significativos do tema + descrição da recomendação (sem stop-words)
  const rawTokens = tokenize(`${rec.tema} ${rec.descricao_lacuna}`)
    .filter(t => !KEYWORD_STOPWORDS.has(t));

  // 2. Keywords específicas por grupo focal (apenas termos discriminantes)
  const grupoSpecific: Record<FocalGroupType, string[]> = {
    negros: ['negros', 'negras', 'racial', 'racismo'],
    indigenas: ['indigena', 'indigenas'],
    quilombolas: ['quilombola', 'quilombolas', 'quilombo'],
    ciganos: ['ciganos', 'cigano', 'romani'],
    religioes_matriz_africana: ['candomble', 'umbanda', 'matriz africana', 'terreiro'],
    juventude_negra: ['juventude negra', 'jovens negros'],
    mulheres_negras: ['mulheres negras', 'mulher negra', 'feminicidio'],
    lgbtqia_negros: ['lgbtqia', 'transexual', 'homofobia', 'transfobia'],
    pcd_negros: ['deficiencia', 'pessoa com deficiencia'],
    idosos_negros: ['idosos negros', 'idosas negras'],
    geral: [],
  };

  return [...new Set([
    ...rawTokens,
    ...(grupoSpecific[rec.grupo_focal as FocalGroupType] || []),
  ])];
}

// ── Main Hook ──────────────────────────────────────────────────────
export function useDiagnosticSensor(recomendacoes: LacunaIdentificada[] | undefined) {
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

  // ── Frequência de cada artigo nos normativos (anti-coringa) ──
  const artigoFrequency = useMemo(() => {
    if (!normativos || normativos.length === 0) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    normativos.forEach(doc => {
      const arts = ((doc.artigos_convencao as string[] | null) || [])
        .map(normalizeArticle)
        .filter(Boolean) as ArtigoConvencao[];
      arts.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
    });
    const total = normativos.length;
    const freq: Record<string, number> = {};
    Object.entries(counts).forEach(([a, c]) => { freq[a] = c / total; });
    return freq;
  }, [normativos]);

  // ── Diagnose each recomendação ────────────────────────────────────
  const diagnostics = useMemo<RecomendacaoDiagnostic[]>(() => {
    if (!recomendacoes || !indicadores || !orcamento || !normativos) return [];

    return recomendacoes.map(rec => {
      const artigos = getRecomendacaoArtigos(rec);
      const keywords = getRecomendacaoKeywords(rec);
      const signals: DiagnosticSignal[] = [];

      // ── Vinculação com modelo híbrido (keyword=100%, eixo=50%) ──
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

      // ── Peso anti-coringa universal ──────────────────────────────
      // Artigos que aparecem em >40% dos normativos recebem peso reduzido
      // proporcional à sua frequência. Ex: Art.V (76%) → eixoWeight = 0.12
      // Art.III (25%) → eixoWeight = 0.50 (sem penalidade)
      const getEixoWeight = (artigos_item: string[] | null): number => {
        const arts = (artigos_item || []).map(normalizeArticle).filter(Boolean) as ArtigoConvencao[];
        if (arts.length === 0) return 0.5;
        // Use the LEAST frequent article as representative (most specific)
        const minFreq = Math.min(...arts.map(a => artigoFrequency[a] || 0));
        // If freq > 0.4, reduce weight: 0.5 * (1 - freq). Floor at 0.10
        if (minFreq > 0.4) {
          return Math.max(0.10, 0.5 * (1 - minFreq));
        }
        return 0.5;
      };

      // Build weight maps: keyword match → 1.0, eixo-only → dynamic (anti-coringa)
      const keywordIndSet = new Set(keywordIndicadores.map(i => i.nome));
      const keywordOrcSet = new Set(keywordOrcamento.map(o => `${o.programa}-${o.orgao}-${o.ano}`));
      const keywordNormSet = new Set(keywordNormativos.map(n => n.titulo));

      const indicadoresVinculados = Array.from(new Map([...baseIndicadores, ...keywordIndicadores].map(i => [i.nome, i])).values()).slice(0, 20);
      const orcamentosVinculados = Array.from(new Map([...baseOrcamento, ...keywordOrcamento].map(o => [`${o.programa}-${o.orgao}-${o.ano}`, o])).values()).slice(0, 20);
      const normativosVinculados = Array.from(new Map([...baseNormativos, ...keywordNormativos].map(n => [n.titulo, n])).values()).slice(0, 20);

      // Match quality weights — keyword=1.0, eixo=dynamic anti-coringa
      const getIndWeight = (i: typeof indicadoresVinculados[0]) =>
        keywordIndSet.has(i.nome) ? 1.0 : getEixoWeight(i.artigos_convencao as string[] | null);
      const getOrcWeight = (o: typeof orcamentosVinculados[0]) =>
        keywordOrcSet.has(`${o.programa}-${o.orgao}-${o.ano}`) ? 1.0 : getEixoWeight(o.artigos_convencao as string[] | null);
      const getNormWeight = (n: typeof normativosVinculados[0]) =>
        keywordNormSet.has(n.titulo) ? 1.0 : getEixoWeight(n.artigos_convencao as string[] | null);

      const totalIndKeyword = indicadoresVinculados.filter(i => keywordIndSet.has(i.nome)).length;
      const totalIndEixo = indicadoresVinculados.length - totalIndKeyword;
      const totalOrcKeyword = orcamentosVinculados.filter(o => keywordOrcSet.has(`${o.programa}-${o.orgao}-${o.ano}`)).length;
      const totalOrcEixo = orcamentosVinculados.length - totalOrcKeyword;
      const totalNormKeyword = normativosVinculados.filter(n => keywordNormSet.has(n.titulo)).length;
      const totalNormEixo = normativosVinculados.length - totalNormKeyword;

      // ═══════════════════════════════════════════════════════════
      // MOTOR DE STATUS COMPUTADO v3 — Calibrado Anti-Coringa
      // ═══════════════════════════════════════════════════════════
      // Pesos: Indicadores 40% | Orçamento 30% | Normativos 30%
      // Faixas: ≥80 Cumprido | ≥55 Parcial | ≥35 Em Andamento | ≥15 Não Cumprido | <15 Retrocesso
      // Anti-coringa: artigos frequentes (>40% da base) recebem peso reduzido
      // Cap piora: se indicadores pioram > melhoram, teto global = 55

      // ── 1. SCORE INDICADORES (0-100, peso 40%) ──
      const weightedTendencias = indicadoresVinculados.map(i => ({ t: inferTendencia(i), w: getIndWeight(i) }));
      const pioramW = weightedTendencias.filter(x => x.t === 'piora').reduce((s, x) => s + x.w, 0);
      const melhoramW = weightedTendencias.filter(x => x.t === 'melhora').reduce((s, x) => s + x.w, 0);
      const totalIndW = weightedTendencias.reduce((s, x) => s + x.w, 0);
      const pioram = weightedTendencias.filter(x => x.t === 'piora').length;
      const melhoram = weightedTendencias.filter(x => x.t === 'melhora').length;
      const estaveis = weightedTendencias.filter(x => x.t === 'estavel').length;
      const totalInd = indicadoresVinculados.length;

      let scoreInd = 50;
      if (totalIndW > 0) {
        const ratioMelhora = melhoramW / totalIndW;
        const ratioPiora = pioramW / totalIndW;
        scoreInd = Math.round(50 + (ratioMelhora * 50) - (ratioPiora * 50));
        scoreInd = Math.max(0, Math.min(100, scoreInd));
      } else {
        scoreInd = 10; // ← Piso reduzido de 25→10 sem evidência
      }

      const avgEixoWeightInd = totalIndEixo > 0
        ? (indicadoresVinculados.filter(i => !keywordIndSet.has(i.nome)).reduce((s, i) => s + getIndWeight(i), 0) / totalIndEixo).toFixed(0)
        : '—';
      const justInd = totalInd === 0
        ? 'Nenhum indicador vinculado — sem base estatística para avaliar tendência.'
        : `${totalInd} indicador(es) [${totalIndKeyword} keyword, ${totalIndEixo} eixo×${avgEixoWeightInd}%]: ${melhoram} melhora(m), ${pioram} piora(m), ${estaveis} estável(is). Score: ${scoreInd}/100.`;

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
        const totalDotacao = orcamentosVinculados.reduce((s, o) => s + (Number(o.dotacao_autorizada) || 0) * getOrcWeight(o), 0);
        const totalPago = orcamentosVinculados.reduce((s, o) => s + (Number(o.pago) || 0) * getOrcWeight(o), 0);
        execucaoMedia = totalDotacao > 0 ? (totalPago / totalDotacao) * 100 : 0;
        scoreOrc = Math.round(Math.min(100, execucaoMedia * 1.3));
        if (simbolicos.length > 0) {
          scoreOrc = Math.max(10, scoreOrc - (simbolicos.length / totalOrc) * 30);
        }
      } else {
        scoreOrc = 10; // ← Piso reduzido de 20→10 sem evidência
      }
      scoreOrc = Math.round(Math.max(0, Math.min(100, scoreOrc)));

      const justOrc = totalOrc === 0
        ? 'Nenhuma ação orçamentária vinculada — sem evidência de investimento público.'
        : `${totalOrc} ação(ões) [${totalOrcKeyword} keyword, ${totalOrcEixo} eixo], execução média ${execucaoMedia.toFixed(1)}%${simbolicos.length > 0 ? `, ${simbolicos.length} simbólica(s) (<5%)` : ''}. Score: ${scoreOrc}/100.`;

      // Signals for budget
      if (simbolicos.length > 0) {
        const totalDotSim = simbolicos.reduce((s, o) => s + (Number(o.dotacao_autorizada) || 0), 0);
        signals.push({ type: 'orcamento_simbolico', severity: 'warning', message: `${simbolicos.length} ação(ões) com orçamento simbólico`, detail: `R$ ${(totalDotSim / 1e6).toFixed(1)}M autorizados com execução < 5%` });
      } else if (totalOrc > 0) {
        signals.push({ type: 'orcamento_simbolico', severity: 'info', message: `${totalOrc} ação(ões) orçamentária(s) vinculada(s)` });
      }

      // ── 3. SCORE NORMATIVOS (0-100, peso 30%) — anti-coringa ──
      const totalNorm = normativosVinculados.length;
      const totalNormW = normativosVinculados.reduce((s, n) => s + getNormWeight(n), 0);
      let scoreNorm = 0;
      if (totalNormW >= 5) scoreNorm = 100;
      else if (totalNormW >= 3) scoreNorm = 80;
      else if (totalNormW >= 2) scoreNorm = 60;
      else if (totalNormW >= 1) scoreNorm = 40;
      else if (totalNormW >= 0.3) scoreNorm = 20;
      else scoreNorm = 5;

      const avgEixoWeightNorm = totalNormEixo > 0
        ? (normativosVinculados.filter(n => !keywordNormSet.has(n.titulo)).reduce((s, n) => s + getNormWeight(n), 0) / totalNormEixo * 100).toFixed(0)
        : '—';
      const justNorm = totalNorm === 0
        ? 'Sem cobertura normativa identificada — ausência de marco legal/regulamentar vinculado.'
        : `${totalNorm} instrumento(s) [${totalNormKeyword} keyword, ${totalNormEixo} eixo×${avgEixoWeightNorm}%], peso efetivo ${totalNormW.toFixed(1)}. Score: ${scoreNorm}/100.`;

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
      const pioraCapped = pioramW > melhoramW && pioramW > 0;
      if (pioraCapped && scoreGlobal > 55) {
        scoreGlobal = 55;
      }

      // ── STATUS COMPUTADO (faixas recalibradas) ──
      // ≥80 Cumprido | ≥55 Parcial | ≥35 Em Andamento | ≥15 Não Cumprido | <15 Retrocesso
      let statusComputado: ComplianceStatus;
      if (scoreGlobal >= 80) statusComputado = 'cumprido';
      else if (scoreGlobal >= 55) statusComputado = 'parcialmente_cumprido';
      else if (scoreGlobal >= 35) statusComputado = 'em_andamento';
      else if (scoreGlobal >= 15) statusComputado = 'nao_cumprido';
      else statusComputado = 'retrocesso';

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
        `Modelo Híbrido v3: keyword=100%, eixo=dinâmico (anti-coringa)`,
        `Anti-coringa: artigos com freq >40% na base recebem peso = 50%×(1−freq)`,
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
  }, [recomendacoes, indicadores, orcamento, normativos, indicadoresPorArtigo, orcamentoPorArtigo, normativosPorArtigo]);

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

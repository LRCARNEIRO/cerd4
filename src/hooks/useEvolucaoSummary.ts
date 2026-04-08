import { useMemo } from 'react';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { normalizeArticleTag } from '@/utils/normalizeArticleTag';
import { useDiagnosticSensor, type LinkedIndicador, type LinkedOrcamento, type LinkedNormativo } from '@/hooks/useDiagnosticSensor';
import { summarizeIndicatorEvolution } from '@/utils/articleIndicatorEvolution';
import { evaluateIndicadorDetailed } from '@/components/conclusoes/evaluateIndicador';

function getArtigos(l: { artigos_convencao?: string[] | null; eixo_tematico: string }): ArtigoConvencao[] {
  const raw = (l as any).artigos_convencao;
  const explicit = Array.isArray(raw) ? raw.map(normalizeArticleTag).filter(Boolean) as ArtigoConvencao[] : [];
  if (explicit.length > 0) return [...new Set(explicit)];
  return EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS] || [];
}

/**
 * Scores per article using the SAME logic as FarolEvolucaoPanel:
 *   R$ Liquidado (35%) + Normativos qtde (35%) + Indicadores com melhoria (30%)
 */
function computeArticleEvolScore(
  indicadores: LinkedIndicador[],
  orcamento: LinkedOrcamento[],
  normativos: LinkedNormativo[],
): number {
  // R$ Liquidado → faixas simples
  const totalLiq = orcamento.reduce((s, o) => s + (Number(o.liquidado) || 0), 0);
  const liqBi = totalLiq / 1e9;
  let scoreOrc = 0;
  if (liqBi >= 10) scoreOrc = 100;
  else if (liqBi >= 5) scoreOrc = 80;
  else if (liqBi >= 1) scoreOrc = 60;
  else if (liqBi >= 0.1) scoreOrc = 40;
  else if (totalLiq > 0) scoreOrc = 20;

  // Normativos → faixas por quantidade
  const normCount = normativos.length;
  let scoreNorm = 0;
  if (normCount >= 10) scoreNorm = 100;
  else if (normCount >= 6) scoreNorm = 75;
  else if (normCount >= 3) scoreNorm = 50;
  else if (normCount >= 1) scoreNorm = 25;

  // Indicadores → % com melhoria (mesma lógica de summarizeIndicatorEvolution)
  const indSummary = summarizeIndicatorEvolution(indicadores);
  const scoreInd = indSummary.score;

  return Math.round(scoreOrc * 0.35 + scoreNorm * 0.35 + scoreInd * 0.30);
}

/**
 * Simplified adherence score matching IcerdAdherencePanel logic:
 * Recomendações ONU (50%) + Normativos (15%) + Orçamento (10%) + Indicadores (15%) + Amplitude (10%)
 */
function computeAdherenceScoreSimple(
  cumpridas: number, total: number, retrocesso: number,
  normCount: number, orcCount: number, indCount: number,
): number {
  let score = 0;
  if (total > 0) {
    const taxaCumprimento = cumpridas / total;
    const retPenalty = retrocesso / total * 0.1;
    score += Math.max(0, (taxaCumprimento - retPenalty)) * 50;
  } else {
    score += 25;
  }
  if (normCount > 0) score += Math.min(15, normCount * 1.5);
  if (orcCount > 0) score += Math.min(10, orcCount * 1.0);
  if (indCount > 0) score += Math.min(15, indCount * 1.2);
  const breadth = [cumpridas > 0, orcCount > 0, indCount > 0, normCount > 0].filter(Boolean).length;
  score += (breadth / 4) * 10;
  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Hook that provides evolution summary consuming evidence from useDiagnosticSensor
 * (same source as Recomendações and Artigos), using the same scoring as FarolEvolucaoPanel.
 * Used by Dashboard and Conclusões panels.
 */
export function useEvolucaoSummary() {
  const { data: recomendacoes, isLoading: l1 } = useLacunasIdentificadas({});
  const { diagnosticMap, isReady: sensorReady } = useDiagnosticSensor(recomendacoes);

  const isLoading = l1 || !sensorReady;

  const { summary, artigosSummary } = useMemo(() => {
    if (!recomendacoes || !sensorReady) {
      return {
        summary: { evolucao: 0, estagnacao: 0, retrocesso: 0 },
        artigosSummary: ARTIGOS_CONVENCAO.map(a => ({
          numero: a.numero, titulo: a.titulo, totalRecs: 0,
          cumpridas: 0, parciais: 0, naoCumpridas: 0, evolScore: 0, aderenciaScore: 0,
        })),
      };
    }

    // ── Per-article: aggregate evidence then score (same as FarolEvolucaoPanel) ──
    const artigosSummary = ARTIGOS_CONVENCAO.map(art => {
      const artNum = art.numero;

      // Find recs linked to this article
      const artRecs = recomendacoes.filter(r => getArtigos(r).includes(artNum));

      // Aggregate deduplicated evidence from all linked recs
      const indMap = new Map<string, LinkedIndicador>();
      const orcMap = new Map<string, LinkedOrcamento>();
      const normMap = new Map<string, LinkedNormativo>();

      artRecs.forEach(r => {
        const diag = diagnosticMap.get(r.id);
        if (!diag) return;
        diag.linkedIndicadores.forEach(ind => { if (!indMap.has(ind.nome)) indMap.set(ind.nome, ind); });
        diag.linkedOrcamento.forEach(orc => {
          const key = `${orc.programa}|${orc.orgao}|${orc.ano}`;
          if (!orcMap.has(key)) orcMap.set(key, orc);
        });
        diag.linkedNormativos.forEach(norm => { if (!normMap.has(norm.titulo)) normMap.set(norm.titulo, norm); });
      });

      const evolScore = computeArticleEvolScore(
        Array.from(indMap.values()),
        Array.from(orcMap.values()),
        Array.from(normMap.values()),
      );

      // Status counts from sensor
      let cumpridas = 0, parciais = 0, naoCumpridas = 0;
      artRecs.forEach(r => {
        const d = diagnosticMap.get(r.id);
        const st = d?.statusComputado ?? r.status_cumprimento;
        if (st === 'cumprido') cumpridas++;
        else if (st === 'parcialmente_cumprido') parciais++;
        else naoCumpridas++;
      });

      // Aderência score (same formula as IcerdAdherencePanel)
      const aderenciaScore = computeAdherenceScoreSimple(
        cumpridas, artRecs.length, 0, normMap.size, orcMap.size, indMap.size,
      );

      return {
        numero: artNum, titulo: art.titulo, totalRecs: artRecs.length,
        cumpridas, parciais, naoCumpridas, evolScore, aderenciaScore,
      };
    });

    // ── Per-recommendation evolution — SAME scoring as EvolucaoRecomendacoesPanel ──
    // Weights: Indicadores 50%, Orçamento 30%, Normativos 20%
    let evolCount = 0, estagCount = 0, retroCount = 0;
    recomendacoes.forEach(rec => {
      const diag = diagnosticMap.get(rec.id);
      if (!diag) { retroCount++; return; }

      const linkedInd = diag.linkedIndicadores;
      const linkedOrc = diag.linkedOrcamento;
      const linkedNorm = diag.linkedNormativos;

      // Indicadores: trend evaluation
      let fav = 0, desfav = 0, novos = 0;
      linkedInd.forEach((ind: any) => {
        const r = evaluateIndicadorDetailed(ind).result;
        if (r === 'favoravel') fav++;
        else if (r === 'desfavoravel') desfav++;
        else if (r === 'novo') novos++;
      });
      const indTotal = linkedInd.length;
      const rawInd = indTotal > 0 ? ((fav + novos * 0.7 - desfav * 0.5) / indTotal) * 100 : 0;
      const scoreInd = Math.max(0, Math.min(100, rawInd));

      // Orçamento: R$ liquidado
      const progs = new Set(linkedOrc.map((o: any) => o.programa)).size;
      const totalLiq = linkedOrc.reduce((s: number, o: any) => s + (Number(o.liquidado) || Number(o.pago) || 0), 0);
      const scoreOrc = Math.min(100, progs > 0 ? 40 + Math.min(60, totalLiq / 1e8) : 0);

      // Normativos: quantity
      const scoreNorm = Math.min(100, linkedNorm.length * 12);

      const scoreFarol = Math.round(scoreInd * 0.50 + scoreOrc * 0.30 + scoreNorm * 0.20);
      if (scoreFarol >= 60) evolCount++;
      else if (scoreFarol >= 35) estagCount++;
      else retroCount++;
    });

    return {
      summary: { evolucao: evolCount, estagnacao: estagCount, retrocesso: retroCount },
      artigosSummary,
    };
  }, [recomendacoes, diagnosticMap, sensorReady]);

  // Expose sensor data so consumers (e.g. Dashboard) don't need their own useDiagnosticSensor
  const { summary: sensorSummary } = useDiagnosticSensor(recomendacoes);

  return { summary, artigosSummary, isLoading, sensorSummary, sensorReady };
}

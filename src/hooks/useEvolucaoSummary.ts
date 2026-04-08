import { useMemo } from 'react';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { evaluateIndicadorDetailed } from '@/components/conclusoes/evaluateIndicador';
import { normalizeArticleTag } from '@/utils/normalizeArticleTag';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';

function normalizeArticle(raw: string): ArtigoConvencao | null {
  return normalizeArticleTag(raw);
}

function getArtigos(l: { artigos_convencao?: string[] | null; eixo_tematico: string }): ArtigoConvencao[] {
  const raw = (l as any).artigos_convencao;
  const explicit = Array.isArray(raw) ? raw.map(normalizeArticle).filter(Boolean) as ArtigoConvencao[] : [];
  if (explicit.length > 0) return [...new Set(explicit)];
  return EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS] || [];
}

/**
 * Hook that provides evolution summary consuming evidence from useDiagnosticSensor
 * (same source as Recomendações), then scoring for trend/impact.
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
          cumpridas: 0, parciais: 0, naoCumpridas: 0, evolScore: 0,
        })),
      };
    }

    let evolCount = 0, estagCount = 0, retroCount = 0;

    // Per-article accumulators
    const artEvolScores: Record<ArtigoConvencao, number[]> = {} as any;
    ARTIGOS_CONVENCAO.forEach(a => { artEvolScores[a.numero] = []; });

    recomendacoes.forEach(rec => {
      const diag = diagnosticMap.get(rec.id);
      const linkedInd = diag?.linkedIndicadores || [];
      const linkedOrc = diag?.linkedOrcamento || [];
      const linkedNorm = diag?.linkedNormativos || [];

      // Indicadores — evaluate trends
      let fav = 0, desfav = 0, novos = 0;
      linkedInd.forEach((ind: any) => {
        const r = evaluateIndicadorDetailed(ind).result;
        if (r === 'favoravel') fav++;
        else if (r === 'desfavoravel') desfav++;
        else if (r === 'novo') novos++;
      });
      const indTotal = linkedInd.length;
      const rawIndScore = indTotal > 0 ? ((fav + novos * 0.7 - desfav * 0.5) / indTotal) * 100 : 0;
      const scoreInd = Math.max(0, Math.min(100, rawIndScore));

      // Orçamento — R$ liquidado
      const progs = new Set(linkedOrc.map((o: any) => o.programa)).size;
      const totalLiq = linkedOrc.reduce((s: number, o: any) => s + (Number(o.liquidado) || Number(o.pago) || 0), 0);
      const scoreOrc = Math.min(100, progs > 0 ? 40 + Math.min(60, totalLiq / 1e8) : 0);

      // Normativos — quantity
      const scoreNorm = Math.min(100, linkedNorm.length * 12);

      const scoreFarol = Math.round(scoreInd * 0.50 + scoreOrc * 0.30 + scoreNorm * 0.20);
      if (scoreFarol >= 60) evolCount++;
      else if (scoreFarol >= 35) estagCount++;
      else retroCount++;

      // Add to article accumulators
      const artigos = getArtigos(rec);
      artigos.forEach(a => { artEvolScores[a]?.push(scoreFarol); });
    });

    const artigosSummary = ARTIGOS_CONVENCAO.map(a => {
      const scores = artEvolScores[a.numero];
      const avgEvol = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;
      
      // Count recs per article for status — use computed status from sensor
      const artRecs = recomendacoes.filter(r => getArtigos(r).includes(a.numero));
      const cumpridas = artRecs.filter(r => {
        const d = diagnosticMap.get(r.id);
        return (d?.statusComputado ?? r.status_cumprimento) === 'cumprido';
      }).length;
      const parciais = artRecs.filter(r => {
        const d = diagnosticMap.get(r.id);
        const st = d?.statusComputado ?? r.status_cumprimento;
        return st === 'parcialmente_cumprido' || st === 'em_andamento';
      }).length;
      const naoCumpridas = artRecs.filter(r => {
        const d = diagnosticMap.get(r.id);
        const st = d?.statusComputado ?? r.status_cumprimento;
        return st === 'nao_cumprido' || st === 'retrocesso';
      }).length;

      return {
        numero: a.numero,
        titulo: a.titulo,
        totalRecs: artRecs.length,
        cumpridas,
        parciais,
        naoCumpridas,
        evolScore: avgEvol,
      };
    });

    return {
      summary: { evolucao: evolCount, estagnacao: estagCount, retrocesso: retroCount },
      artigosSummary,
    };
  }, [recomendacoes, diagnosticMap, sensorReady]);

  return { summary, artigosSummary, isLoading };
}

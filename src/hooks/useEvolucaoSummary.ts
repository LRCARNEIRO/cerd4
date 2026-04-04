import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { EIXO_PARA_ARTIGOS, ARTIGOS_CONVENCAO, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { getSafeIndicadores } from '@/utils/inferArtigosIndicador';
import { evaluateIndicadorDetailed } from '@/components/conclusoes/evaluateIndicador';

const GENERIC_STOPS = ['brasil', 'racial', 'negro', 'negra', 'politica', 'programa', 'geral', 'nacional', 'federal', 'estado', 'governo', 'medida', 'direito', 'parte', 'comite', 'sobre', 'contra', 'entre', 'todas', 'todos', 'forma', 'podem', 'grupo', 'populacao', 'pessoa', 'acoes', 'acordo', 'ainda', 'alem', 'outro', 'outras', 'outros', 'sendo', 'relacao', 'numero', 'dados'];

function normalizeArticle(raw: string): ArtigoConvencao | null {
  const v = String(raw || '').toUpperCase().trim();
  if (v.includes('VII')) return 'VII';
  if (v.includes('VI')) return 'VI';
  if (v.includes('V')) return 'V';
  if (v.includes('IV')) return 'IV';
  if (v.includes('III')) return 'III';
  if (v.includes('II')) return 'II';
  if (v.includes('I')) return 'I';
  return null;
}

function getArtigos(l: { artigos_convencao?: string[] | null; eixo_tematico: string }): ArtigoConvencao[] {
  const raw = (l as any).artigos_convencao;
  const explicit = Array.isArray(raw) ? raw.map(normalizeArticle).filter(Boolean) as ArtigoConvencao[] : [];
  if (explicit.length > 0) return [...new Set(explicit)];
  return EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS] || [];
}

export function useEvolucaoSummary() {
  const { data: recomendacoes, isLoading: l1 } = useLacunasIdentificadas({});

  const { data: indicadores, isLoading: l2 } = useQuery({
    queryKey: ['evolucao-summary-ind'],
    queryFn: async () => {
      const { data } = await supabase.from('indicadores_interseccionais')
        .select('nome, categoria, tendencia, dados, artigos_convencao, subcategoria')
        .neq('categoria', 'common_core');
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: orcamento, isLoading: l3 } = useQuery({
    queryKey: ['evolucao-summary-orc'],
    queryFn: async () => {
      let all: any[] = [];
      let page = 0;
      while (true) {
        const { data } = await supabase.from('dados_orcamentarios')
          .select('programa, orgao, ano, liquidado, descritivo, eixo_tematico, publico_alvo')
          .range(page * 1000, (page + 1) * 1000 - 1);
        if (!data || data.length === 0) break;
        all = all.concat(data);
        if (data.length < 1000) break;
        page++;
      }
      return all;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: normativos, isLoading: l4 } = useQuery({
    queryKey: ['evolucao-summary-norm'],
    queryFn: async () => {
      const { data } = await supabase.from('documentos_normativos').select('titulo, artigos_convencao');
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = l1 || l2 || l3 || l4;

  const { summary, artigosSummary } = useMemo(() => {
    if (!recomendacoes || !indicadores || !orcamento || !normativos) {
      return {
        summary: { evolucao: 0, estagnacao: 0, retrocesso: 0 },
        artigosSummary: ARTIGOS_CONVENCAO.map(a => ({
          numero: a.numero, titulo: a.titulo, totalRecs: 0,
          cumpridas: 0, parciais: 0, naoCumpridas: 0, evolScore: 0,
        })),
      };
    }

    const dedupedInd = getSafeIndicadores(indicadores);
    let evolCount = 0, estagCount = 0, retroCount = 0;

    // Per-article accumulators
    const artEvolScores: Record<ArtigoConvencao, number[]> = {} as any;
    ARTIGOS_CONVENCAO.forEach(a => { artEvolScores[a.numero] = []; });

    recomendacoes.forEach(rec => {
      const rawText = `${rec.tema} ${rec.descricao_lacuna} ${(rec as any).texto_original_onu || ''}`.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const tokens = rawText.split(/\s+/).filter(t => t.length >= 5 && !GENERIC_STOPS.includes(t));

      // Indicadores
      const matchedInd = dedupedInd.filter((ind: any) => {
        const h = `${ind.nome} ${ind.categoria} ${ind.subcategoria || ''}`.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return tokens.some(t => h.includes(t));
      });
      let fav = 0, desfav = 0, novos = 0;
      matchedInd.forEach((ind: any) => {
        const r = evaluateIndicadorDetailed(ind).result;
        if (r === 'favoravel') fav++;
        else if (r === 'desfavoravel') desfav++;
        else if (r === 'novo') novos++;
      });
      const indTotal = matchedInd.length;
      const rawIndScore = indTotal > 0 ? ((fav + novos * 0.7 - desfav * 0.5) / indTotal) * 100 : 0;
      const scoreInd = Math.max(0, Math.min(100, rawIndScore));

      // Orçamento
      const matchedOrc = orcamento.filter((o: any) => {
        const h = `${o.programa} ${o.orgao} ${o.descritivo || ''} ${o.eixo_tematico || ''} ${o.publico_alvo || ''}`.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return tokens.some(t => h.includes(t));
      });
      const progs = new Set(matchedOrc.map((o: any) => o.programa)).size;
      const totalLiq = matchedOrc.reduce((s: number, o: any) => s + (Number(o.liquidado) || 0), 0);
      const scoreOrc = Math.min(100, progs > 0 ? 40 + Math.min(60, totalLiq / 1e8) : 0);

      // Normativos
      const matchedNorm = normativos.filter((d: any) => {
        const h = d.titulo.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return tokens.some(t => h.includes(t));
      });
      const scoreNorm = Math.min(100, matchedNorm.length * 12);

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
      
      // Count recs per article for status
      const artRecs = recomendacoes.filter(r => getArtigos(r).includes(a.numero));
      const cumpridas = artRecs.filter(r => r.status_cumprimento === 'cumprido').length;
      const parciais = artRecs.filter(r => r.status_cumprimento === 'parcialmente_cumprido' || r.status_cumprimento === 'em_andamento').length;
      const naoCumpridas = artRecs.filter(r => r.status_cumprimento === 'nao_cumprido' || r.status_cumprimento === 'retrocesso').length;

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
  }, [recomendacoes, indicadores, orcamento, normativos]);

  return { summary, artigosSummary, isLoading };
}

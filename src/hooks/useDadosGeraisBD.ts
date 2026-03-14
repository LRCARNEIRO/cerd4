/**
 * Hook: useDadosGeraisBD
 * 
 * Consome dados demográficos do banco de dados (indicadores_interseccionais)
 * com fallback automático para StatisticsData.ts (hardcoded).
 * 
 * Padrão SSoT Etapa 1 — Piloto Dados Gerais.
 */

import { useMemo } from 'react';
import { useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import {
  dadosDemograficos as hardcodedDemograficos,
  evolucaoComposicaoRacial as hardcodedEvolucao,
} from '@/components/estatisticas/StatisticsData';

export function useDadosGeraisBD() {
  const { data: indicadores, isLoading, error } = useIndicadoresInterseccionais();

  const result = useMemo(() => {
    // Filter mirror records for 'demografia' category
    const mirrorDemografia = (indicadores || []).filter(
      (i: any) => i.categoria === 'demografia' && 
        (i.documento_origem || []).includes('espelho_estatico')
    );

    // ── Composição Racial (subcategoria: composicao_racial) ──
    const composicaoRecord = mirrorDemografia.find(
      (i: any) => i.subcategoria === 'composicao_racial'
    );

    let dadosDemograficos: typeof hardcodedDemograficos;
    let fonteDemografia: 'bd' | 'hardcoded';

    if (composicaoRecord) {
      const d = composicaoRecord.dados as any;
      dadosDemograficos = {
        populacaoTotal: d.populacaoTotal ?? hardcodedDemograficos.populacaoTotal,
        composicaoRacial: d.composicao ?? hardcodedDemograficos.composicaoRacial,
        populacaoNegra: d.populacaoNegra ?? hardcodedDemograficos.populacaoNegra,
        percentualNegro: d.percentualNegro ?? hardcodedDemograficos.percentualNegro,
        quilombolas: d.quilombolas ?? hardcodedDemograficos.quilombolas,
        fonte: composicaoRecord.fonte ?? hardcodedDemograficos.fonte,
        urlFonte: composicaoRecord.url_fonte ?? hardcodedDemograficos.urlFonte,
      };
      fonteDemografia = 'bd';
    } else {
      dadosDemograficos = hardcodedDemograficos;
      fonteDemografia = 'hardcoded';
    }

    // ── Evolução Composição Racial (subcategoria: evolucao_racial) ──
    const evolucaoRecord = mirrorDemografia.find(
      (i: any) => i.subcategoria === 'evolucao_racial'
    );

    let evolucaoComposicaoRacial: typeof hardcodedEvolucao;
    let fonteEvolucao: 'bd' | 'hardcoded';

    if (evolucaoRecord) {
      const d = evolucaoRecord.dados as any;
      // The mirror stores data as { series: { "2018": { branca, negra }, ... } }
      if (d.series && typeof d.series === 'object') {
        evolucaoComposicaoRacial = Object.entries(d.series)
          .map(([ano, vals]: [string, any]) => ({
            ano: Number(ano),
            branca: vals.branca,
            negra: vals.negra,
          }))
          .sort((a, b) => a.ano - b.ano);
      } else {
        evolucaoComposicaoRacial = hardcodedEvolucao;
      }
      fonteEvolucao = 'bd';
    } else {
      evolucaoComposicaoRacial = hardcodedEvolucao;
      fonteEvolucao = 'hardcoded';
    }

    // ── Metadados CERD (parágrafos) ──
    const paragrafos = composicaoRecord
      ? (composicaoRecord.dados as any).paragrafos_cerd
      : null;
    const artigosConvencao = composicaoRecord?.artigos_convencao || [];

    return {
      dadosDemograficos,
      evolucaoComposicaoRacial,
      fonteDemografia,
      fonteEvolucao,
      paragrafos,
      artigosConvencao,
      usandoBD: fonteDemografia === 'bd' || fonteEvolucao === 'bd',
    };
  }, [indicadores]);

  return { ...result, isLoading, error };
}

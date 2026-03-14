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

    let dadosDemograficos = hardcodedDemograficos;
    let fonteDemografia: 'bd' | 'hardcoded' = 'hardcoded';
    let paragrafos: string | null = null;
    let artigosConvencao: string[] = [];

    if (composicaoRecord) {
      const d = composicaoRecord.dados as any;
      // Merge BD data over hardcoded, keeping all hardcoded fields as fallback
      dadosDemograficos = {
        ...hardcodedDemograficos,
        populacaoTotal: d.populacaoTotal ?? hardcodedDemograficos.populacaoTotal,
        composicaoRacial: d.composicao ?? hardcodedDemograficos.composicaoRacial,
        populacaoNegra: d.populacaoNegra ?? hardcodedDemograficos.populacaoNegra,
        percentualNegro: d.percentualNegro ?? hardcodedDemograficos.percentualNegro,
        quilombolas: d.quilombolas ?? hardcodedDemograficos.quilombolas,
        fonte: composicaoRecord.fonte ?? hardcodedDemograficos.fonte,
        urlFonte: composicaoRecord.url_fonte ?? hardcodedDemograficos.urlFonte,
      };
      fonteDemografia = 'bd';
      paragrafos = d.paragrafos_cerd ?? null;
      artigosConvencao = (composicaoRecord as any).artigos_convencao || [];
    }

    // ── Evolução Composição Racial (subcategoria: evolucao_racial) ──
    const evolucaoRecord = mirrorDemografia.find(
      (i: any) => i.subcategoria === 'evolucao_racial'
    );

    let evolucaoComposicaoRacial = hardcodedEvolucao;
    let fonteEvolucao: 'bd' | 'hardcoded' = 'hardcoded';

    if (evolucaoRecord) {
      const d = evolucaoRecord.dados as any;
      if (d.series && typeof d.series === 'object') {
        evolucaoComposicaoRacial = Object.entries(d.series)
          .map(([ano, vals]: [string, any]) => ({
            ano: Number(ano),
            branca: vals.branca,
            negra: vals.negra,
            fonte: evolucaoRecord.fonte || 'PNAD Contínua',
          }))
          .sort((a, b) => a.ano - b.ano);
      }
      fonteEvolucao = 'bd';
    }

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

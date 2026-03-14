/**
 * Hook: useDadosGeraisBD
 * Wrapper fino sobre useMirrorData() para manter compatibilidade com DadosGeraisTab.
 */

import { useMirrorData } from '@/hooks/useMirrorData';

export function useDadosGeraisBD() {
  const mirror = useMirrorData();

  return {
    dadosDemograficos: mirror.dadosDemograficos,
    evolucaoComposicaoRacial: mirror.evolucaoComposicaoRacial,
    fonteDemografia: mirror.fonteDemografia,
    fonteEvolucao: mirror.fonteEvolucao,
    paragrafos: null as string | null, // paragrafos are embedded in dados
    artigosConvencao: [] as string[],
    usandoBD: mirror.usandoBD,
    isLoading: mirror.isLoading,
    error: mirror.error,
  };
}

/**
 * Hook: useNarrativeData
 * 
 * Wrapper React que injeta dados do useMirrorData no factory createNarrativas.
 * Garante que narrativas usem dados do BD (quando disponíveis) com fallback hardcoded.
 */

import { useMemo } from 'react';
import { useMirrorData } from '@/hooks/useMirrorData';
import { createNarrativas, type NarrativeDataInput } from '@/utils/narrativeHelpers';

export function useNarrativeData() {
  const mirror = useMirrorData();

  const narrativas = useMemo(() => {
    const input: NarrativeDataInput = {
      violenciaInterseccional: mirror.violenciaInterseccional,
      trabalhoRacaGenero: mirror.trabalhoRacaGenero,
      chefiaFamiliarRacaGenero: mirror.chefiaFamiliarRacaGenero,
      saudeMaternaRaca: mirror.saudeMaternaRaca,
      educacaoRacaGenero: mirror.educacaoRacaGenero,
      serieAntraTrans: mirror.serieAntraTrans,
      feminicidioSerie: mirror.feminicidioSerie,
      atlasViolencia2025: mirror.atlasViolencia2025,
      dadosDemograficos: mirror.dadosDemograficos,
      segurancaPublica: mirror.segurancaPublica,
      jovensNegrosViolencia: mirror.jovensNegrosViolencia,
      educacaoSerieHistorica: mirror.educacaoSerieHistorica,
      povosTradicionais: mirror.povosTradicionais,
    };
    return createNarrativas(input);
  }, [
    mirror.violenciaInterseccional, mirror.trabalhoRacaGenero,
    mirror.chefiaFamiliarRacaGenero, mirror.saudeMaternaRaca,
    mirror.educacaoRacaGenero, mirror.serieAntraTrans,
    mirror.feminicidioSerie, mirror.atlasViolencia2025,
    mirror.dadosDemograficos, mirror.segurancaPublica,
    mirror.jovensNegrosViolencia, mirror.educacaoSerieHistorica,
    mirror.povosTradicionais,
  ]);

  return { ...narrativas, isLoading: mirror.isLoading, usandoBD: mirror.usandoBD };
}

// Contagem unificada de todos os indicadores do sistema
// SSoT: aceita dados injetados via computeStatisticsCounts(), com fallback hardcoded

import {
  evolucaoComposicaoRacial,
  indicadoresSocioeconomicos,
  segurancaPublica,
  feminicidioSerie,
  educacaoSerieHistorica,
  saudeSerieHistorica,
  interseccionalidadeTrabalho,
  deficienciaPorRaca,
  serieAntraTrans,
  lgbtqiaPorRaca,
  classePorRaca,
  violenciaInterseccional,
  radarVulnerabilidades,
  evolucaoDesigualdade,
  dadosDemograficos,
} from '@/components/estatisticas/StatisticsData';

import { TOTAL_DADOS_NOVOS } from '@/components/estatisticas/DadosNovosTab';

// Re-exportar para uso em outros módulos
export { TOTAL_DADOS_NOVOS };

// ═══════════════════════════════════════════
// FACTORY — aceita dados injetados (mirror) com fallback hardcoded
// ═══════════════════════════════════════════

export interface CountsInput {
  evolucaoComposicaoRacial?: any[];
  indicadoresSocioeconomicos?: any[];
  segurancaPublica?: any[];
  feminicidioSerie?: any[];
  educacaoSerieHistorica?: any[];
  saudeSerieHistorica?: any[];
  interseccionalidadeTrabalho?: any[];
  deficienciaPorRaca?: any[];
  serieAntraTrans?: any[];
  lgbtqiaPorRaca?: any[];
  classePorRaca?: any[];
  violenciaInterseccional?: any[];
  evolucaoDesigualdade?: any[];
  dadosDemograficos?: any;
}

export function computeStatisticsCounts(input: CountsInput = {}) {
  const series = [
    input.evolucaoComposicaoRacial ?? evolucaoComposicaoRacial,
    input.indicadoresSocioeconomicos ?? indicadoresSocioeconomicos,
    input.segurancaPublica ?? segurancaPublica,
    input.feminicidioSerie ?? feminicidioSerie,
    input.educacaoSerieHistorica ?? educacaoSerieHistorica,
    input.saudeSerieHistorica ?? saudeSerieHistorica,
    input.interseccionalidadeTrabalho ?? interseccionalidadeTrabalho,
    input.deficienciaPorRaca ?? deficienciaPorRaca,
    input.serieAntraTrans ?? serieAntraTrans,
    input.lgbtqiaPorRaca ?? lgbtqiaPorRaca,
    input.classePorRaca ?? classePorRaca,
    input.violenciaInterseccional ?? violenciaInterseccional,
    radarVulnerabilidades, // always hardcoded (no mirror equivalent)
    input.evolucaoDesigualdade ?? evolucaoDesigualdade,
  ];

  const demo = input.dadosDemograficos ?? dadosDemograficos;

  const totalDadosEstatisticas = series.reduce((s, a) => s + a.length, 0)
    + (demo.composicaoRacial?.length ?? 0);

  return { totalDadosEstatisticas };
}

// ═══════════════════════════════════════════
// MODULE-LEVEL EXPORTS (backward compat)
// ═══════════════════════════════════════════

const _defaults = computeStatisticsCounts();

/** Total de dados nas séries de Estatísticas Gerais */
export const TOTAL_DADOS_ESTATISTICAS = _defaults.totalDadosEstatisticas;

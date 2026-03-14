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

import {
  tabelasDemograficas,
  tabelasEconomicas,
  tabelasEducacao,
  tabelasSaude,
  tabelasTrabalho,
  tabelasPobreza,
  tabelasSeguranca,
  tabelasHabitacao,
  tabelasSistemaPolitico,
} from '@/components/estatisticas/CommonCoreTab';

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
  ccTablesFromBD?: any[];
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

  const tabelasCC = [
    ...tabelasDemograficas, ...tabelasEconomicas, ...tabelasEducacao,
    ...tabelasSaude, ...tabelasTrabalho, ...tabelasPobreza,
    ...tabelasSeguranca, ...tabelasHabitacao, ...tabelasSistemaPolitico,
  ];

  const totalDadosEstatisticas = series.reduce((s, a) => s + a.length, 0)
    + (demo.composicaoRacial?.length ?? 0);
  const totalTabelasCommonCore = tabelasCC.length;
  const totalDadosCommonCore = tabelasCC.reduce((s, t) => s + t.dados.rows.length, 0);

  return { totalDadosEstatisticas, totalTabelasCommonCore, totalDadosCommonCore };
}

// ═══════════════════════════════════════════
// MODULE-LEVEL EXPORTS (backward compat)
// ═══════════════════════════════════════════

const _defaults = computeStatisticsCounts();

/** Total de dados nas séries de Estatísticas Gerais */
export const TOTAL_DADOS_ESTATISTICAS = _defaults.totalDadosEstatisticas;

/** Total de tabelas do Common Core */
export const TOTAL_TABELAS_COMMON_CORE = _defaults.totalTabelasCommonCore;

/** Total de dados individuais nas tabelas do Common Core (linhas de dados) */
export const TOTAL_DADOS_COMMON_CORE = _defaults.totalDadosCommonCore;

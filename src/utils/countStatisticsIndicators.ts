// Contagem total de indicadores/séries estatísticas disponíveis
// em StatisticsData.ts (todas as abas da Base Estatística)
import {
  dadosDemograficos,
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
  mulheresChefeFamilia,
  violenciaInterseccional,
  juventudeNegra,
  educacaoInterseccional,
  saudeInterseccional,
  radarVulnerabilidades,
  evolucaoDesigualdade,
} from '@/components/estatisticas/StatisticsData';

const allArrays = [
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
  mulheresChefeFamilia,
  violenciaInterseccional,
  juventudeNegra,
  educacaoInterseccional,
  saudeInterseccional,
  radarVulnerabilidades,
  evolucaoDesigualdade,
];

/** Número de séries temáticas (arrays) + objetos compostos */
export const TOTAL_SERIES = allArrays.length + 3; // +3: dadosDemograficos, povosTradicionais, rendimentosCenso2022

/** Número total de registros/dados individuais em todas as séries */
export const TOTAL_DADOS = allArrays.reduce((sum, arr) => sum + arr.length, 0)
  + dadosDemograficos.composicaoRacial.length; // +5 raças do demográfico

// Contagem unificada de todos os indicadores do sistema
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
  juventudeNegra,
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

// Todas as séries de Estatísticas Gerais
const seriesEstatisticas = [
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

// Todas as tabelas do Common Core (77 tabelas)
const tabelasCommonCore = [
  ...tabelasDemograficas,
  ...tabelasEconomicas,
  ...tabelasEducacao,
  ...tabelasSaude,
  ...tabelasTrabalho,
  ...tabelasPobreza,
  ...tabelasSeguranca,
  ...tabelasHabitacao,
  ...tabelasSistemaPolitico,
];

/** Total de dados nas séries de Estatísticas Gerais */
export const TOTAL_DADOS_ESTATISTICAS = seriesEstatisticas.reduce((s, a) => s + a.length, 0)
  + dadosDemograficos.composicaoRacial.length;

/** Total de tabelas do Common Core */
export const TOTAL_TABELAS_COMMON_CORE = tabelasCommonCore.length;

/** Total de dados individuais nas tabelas do Common Core (linhas de dados) */
export const TOTAL_DADOS_COMMON_CORE = tabelasCommonCore.reduce(
  (s, t) => s + t.dados.rows.length, 0
);

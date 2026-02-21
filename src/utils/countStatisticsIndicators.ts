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

/**
 * Conta o total de séries de indicadores estatísticos disponíveis
 * na Base Estatística (StatisticsData.ts) — todas as abas.
 * 
 * Cada array exportado conta como uma série de indicadores.
 * Objetos compostos (dadosDemograficos, povosTradicionais, etc.)
 * contam seus sub-indicadores.
 */
export function getTotalStatisticsIndicators(): number {
  // Arrays = cada uma é uma série de indicadores
  const arrays = [
    evolucaoComposicaoRacial,      // Evolução composição racial
    indicadoresSocioeconomicos,    // Renda, desemprego, pobreza por raça
    segurancaPublica,              // Homicídio, letalidade policial
    feminicidioSerie,              // Feminicídio série temporal
    educacaoSerieHistorica,        // Educação série temporal
    saudeSerieHistorica,           // Saúde série temporal
    interseccionalidadeTrabalho,   // Trabalho interseccional
    deficienciaPorRaca,            // Deficiência por raça
    serieAntraTrans,               // Violência trans (ANTRA)
    lgbtqiaPorRaca,                // LGBTQIA+ por raça
    classePorRaca,                 // Classe social por raça
    mulheresChefeFamilia,          // Mulheres chefe de família
    violenciaInterseccional,       // Violência interseccional
    juventudeNegra,                // Juventude negra
    educacaoInterseccional,        // Educação interseccional
    saudeInterseccional,           // Saúde interseccional
    radarVulnerabilidades,         // Radar vulnerabilidades
    evolucaoDesigualdade,          // Evolução desigualdade
  ];

  // Contar séries (cada array = 1 série) + sub-indicadores de objetos compostos
  let total = arrays.length; // 18 séries de arrays

  // dadosDemograficos: composição racial (5 raças) + quilombolas + pop negra = 7 indicadores
  total += dadosDemograficos.composicaoRacial.length + 2;

  // Cada série de array com múltiplas métricas por registro conta métricas extras:
  // indicadoresSocioeconomicos: renda, desemprego, pobreza = 3 métricas
  // segurancaPublica: homicídio negro/branco, letalidade, vítimas, razão = 5 métricas
  // saudeSerieHistorica: mort. materna negra/branca, mort. infantil negra/branca = 4 métricas
  // educacaoSerieHistorica: superior negro/branco, analfabetismo negro/branco = 4 métricas
  const metricasExtras = (3 - 1) + (5 - 1) + (4 - 1) + (4 - 1); // -1 pq a série já foi contada

  total += metricasExtras;

  return total;
}

// Valor pré-calculado para uso em componentes sem re-importar tudo
export const TOTAL_STATISTICS_INDICATORS = getTotalStatisticsIndicators();

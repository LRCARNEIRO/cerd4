/**
 * ══════════════════════════════════════════════════════════════════════
 * SNAPSHOT PRÉ-ETAPA 6 — Estado dos Textos Narrativos e Fontes de Dados
 * Gerado em: 2026-03-14
 * ══════════════════════════════════════════════════════════════════════
 *
 * Este arquivo documenta o estado ANTES da migração SSoT da Etapa 6.
 * Após a Etapa 6, um snapshot equivalente será gerado para comparação.
 *
 * OBJETIVO: Verificar se/como os textos de conclusões, fios condutores
 * e narrativas mudam ao trocar a fonte de dados de StatisticsData.ts
 * (hardcoded) para useMirrorData() (BD com fallback).
 */

// ══════════════════════════════════════════════
// 1. MAPA DE FONTES POR COMPONENTE (PRÉ-ETAPA 6)
// ══════════════════════════════════════════════

export const FONTES_PRE_ETAPA6 = {
  // ── COMPONENTES JÁ MIGRADOS (useMirrorData) ──
  migrados: [
    'DadosGeraisTab',
    'InterseccionalTabs (RacaGeneroTab, LgbtqiaTab, DeficienciaTab, JuventudeTab, ClasseSocialTab)',
    'VulnerabilidadesTab',
    'CommonCoreTab',
    'AdmPublicaSection',
    'CovidRacialSection',
    'GruposFocaisTab',
    'ConsolidatedScopeReport',
    'DocumentReportCards (generateCerdIVHTML, generateCommonCoreHTML)',
  ],

  // ── COMPONENTES AINDA EM StatisticsData.ts DIRETO ──
  pendentes: [
    {
      arquivo: 'src/pages/Conclusoes.tsx',
      imports: ['dadosDemograficos', 'resumoExecutivo', 'segurancaPublica', 'feminicidioSerie',
                'educacaoSerieHistorica', 'saudeSerieHistorica', 'indicadoresSocioeconomicos', 'povosTradicionais'],
      uso: 'Geração de PDFs (síntese comparativa, tabelas 2018→2024)',
    },
    {
      arquivo: 'src/components/conclusoes/ComparativeCharts.tsx',
      imports: ['segurancaPublica', 'feminicidioSerie', 'educacaoSerieHistorica', 'saudeSerieHistorica',
                'indicadoresSocioeconomicos', 'evolucaoDesigualdade', 'violenciaInterseccional', 'classePorRaca'],
      uso: 'Gráficos comparativos (recharts) na aba Conclusões',
    },
    {
      arquivo: 'src/components/conclusoes/IcerdAdherencePanel.tsx',
      imports: ['segurancaPublica', 'feminicidioSerie', 'educacaoSerieHistorica', 'saudeSerieHistorica',
                'indicadoresSocioeconomicos', 'povosTradicionais', 'dadosDemograficos'],
      uso: 'Cálculo de aderência ICERD, radar por artigo, vereditos técnicos',
    },
    {
      arquivo: 'src/components/reports/ConclusoesReportGenerator.tsx',
      imports: ['segurancaPublica', 'feminicidioSerie', 'educacaoSerieHistorica', 'saudeSerieHistorica',
                'indicadoresSocioeconomicos', 'povosTradicionais', 'dadosDemograficos'],
      uso: 'Relatório HTML completo de conclusões (imprimível)',
    },
    {
      arquivo: 'src/components/reports/generateConclusoesFullHTML.ts',
      imports: ['segurancaPublica', 'feminicidioSerie', 'educacaoSerieHistorica', 'saudeSerieHistorica',
                'indicadoresSocioeconomicos', 'evolucaoDesigualdade', 'radarVulnerabilidades',
                'violenciaInterseccional', 'classePorRaca', 'povosTradicionais', 'dadosDemograficos'],
      uso: 'Geração HTML do relatório "Completo" de Conclusões',
    },
    {
      arquivo: 'src/components/reports/StatisticsInventoryReport.tsx',
      imports: ['Todas as constantes de StatisticsData.ts para contagem de indicadores'],
      uso: 'Relatório de inventário estatístico (contagem e cobertura)',
    },
    {
      arquivo: 'src/components/grupos-focais/SerieTemporalGrupos.tsx',
      imports: ['indicadoresSocioeconomicos', 'feminicidioSerie', 'povosTradicionais'],
      uso: 'Série temporal nos grupos focais (Quilombolas, Juventude)',
    },
    {
      arquivo: 'src/components/estatisticas/LacunasCerdTab.tsx',
      imports: ['segurancaPublica', 'educacaoSerieHistorica'],
      uso: 'Narrativas de segurança e educação na aba Lacunas CERD',
    },
    {
      arquivo: 'src/utils/narrativeHelpers.ts',
      imports: ['violenciaInterseccional', 'trabalhoRacaGenero', 'chefiaFamiliarRacaGenero',
                'saudeMaternaRaca', 'educacaoRacaGenero', 'serieAntraTrans', 'feminicidioSerie',
                'atlasViolencia2025', 'dadosDemograficos', 'segurancaPublica',
                'jovensNegrosViolencia', 'educacaoSerieHistorica', 'povosTradicionais'],
      uso: 'Geração de TODAS as narrativas textuais derivadas (27+ valores mapeados)',
    },
    {
      arquivo: 'src/utils/countStatisticsIndicators.ts',
      imports: ['Múltiplas constantes para contagem de indicadores por categoria'],
      uso: 'Contagem total de indicadores no sistema (meta de cobertura)',
    },
  ],
};

// ══════════════════════════════════════════════
// 2. VALORES NARRATIVOS ATUAIS (PRÉ-ETAPA 6)
// ══════════════════════════════════════════════
// Estes são os valores EXATOS que aparecem nos textos hoje.
// Após a Etapa 6, se o BD contiver os mesmos dados (via espelhamento),
// os valores devem ser IDÊNTICOS. Se o BD tiver dados atualizados,
// os valores mudarão automaticamente.

export const NARRATIVAS_PRE_ETAPA6 = {
  violencia: {
    fonte: 'StatisticsData.ts → violenciaInterseccional + feminicidioSerie',
    valores: {
      feminicidioNegrasPct: '63,6% (2024)',
      feminicidio2018Pct: '61% (2018)',
    },
    textoGerado: 'Mulheres negras representam 63,6% das vítimas de feminicídio (2024), proporção que cresceu em relação a 2018 (61%).',
  },

  trabalho: {
    fonte: 'StatisticsData.ts → trabalhoRacaGenero',
    valores: {
      razaoRendaPct: '~44%',
      desempregoMulherNegra: '~11,5%',
      desempregoHomemBranco: '~5,3%',
      informalidadeMulherNegra: '~47,5%',
    },
    textoGerado: 'A mulher negra recebe ~44% do rendimento do homem branco...',
  },

  saudeMaterna: {
    fonte: 'StatisticsData.ts → saudeMaternaRaca + dadosDemograficos',
    valores: {
      mortesNegrasPct: '68% (SIM 2022)',
      razaoIEPS: '2,3×',
      taxaPretasIEPS: '~105 por 100mil NV',
      taxaBrancasIEPS: '~45 por 100mil NV',
    },
    textoGerado: 'Mulheres negras constituem 68% das mortes maternas (SIM 2022)...',
  },

  seguranca: {
    fonte: 'StatisticsData.ts → segurancaPublica + atlasViolencia2025',
    valores: {
      vitimasNegras2024: '~78,9%',
      vitimasNegras2018: '~75,7%',
      letalidadePolicial2024: '~82,7%',
      letalidadePolicial2018: '~75,4%',
      riscoRelativo: '2.6×',
    },
  },

  educacao: {
    fonte: 'StatisticsData.ts → educacaoSerieHistorica + educacaoRacaGenero',
    valores: {
      analfabetismoNegro2018: '~9,1%',
      analfabetismoNegroUltimo: '~7,0%',
      superiorMulherNegra: '~14,4%',
      superiorMulherBranca: '~28,3%',
    },
  },

  quilombolas: {
    fonte: 'StatisticsData.ts → povosTradicionais.quilombolas',
    valores: {
      populacao: '1.327.802',
      territoriosTitulados: 55,
      comunidadesCertificadas: 3567,
      taxaTitulacao: '~1,5%',
      aguaRedeGeral: '25,2%',
      esgotamentoAdequado: '4,7%',
    },
  },

  lgbtqia: {
    fonte: 'StatisticsData.ts → serieAntraTrans',
    valores: {
      assassinatos2025: '~117',
      vitimasNegras2025: '~78%',
    },
  },
};

// ══════════════════════════════════════════════
// 3. PONTOS DE ATENÇÃO PARA COMPARAÇÃO PÓS-ETAPA 6
// ══════════════════════════════════════════════

export const PONTOS_COMPARACAO = [
  {
    ponto: 'Valores numéricos nas narrativas',
    expectativa: 'IDÊNTICOS — o BD foi populado via espelhamento dos mesmos dados hardcoded',
    riscoMudanca: 'Apenas se o BD foi manualmente atualizado com dados mais recentes',
  },
  {
    ponto: 'Textos dos fios condutores (useAnalyticalInsights)',
    expectativa: 'SEM MUDANÇA — os fios condutores já são gerados dinamicamente do BD (lacunas, respostas, conclusões)',
    riscoMudanca: 'Nenhum — estes já usam o BD como fonte',
  },
  {
    ponto: 'Gráficos comparativos (ComparativeCharts)',
    expectativa: 'IDÊNTICOS — mesmos dados, apenas a rota de acesso muda (StatisticsData → useMirrorData)',
    riscoMudanca: 'Se o BD tiver valores null/faltantes em alguma série',
  },
  {
    ponto: 'Aderência ICERD (IcerdAdherencePanel)',
    expectativa: 'IDÊNTICOS — mesma lógica de scoring, apenas a fonte muda',
    riscoMudanca: 'Mudança no formato de dados reconstruídos do BD (rebuildSeries)',
  },
  {
    ponto: 'Relatórios PDF gerados (ConclusoesReportGenerator, generateConclusoesFullHTML)',
    expectativa: 'IDÊNTICOS em conteúdo — layout pode ter micro-diferenças se dados forem null',
    riscoMudanca: 'Proteção: fallback garante que hardcoded entra se BD estiver vazio',
  },
  {
    ponto: 'narrativeHelpers.ts (27 valores mapeados)',
    expectativa: 'CASO ESPECIAL — este módulo é importado no nível de módulo (fora de React hooks). Migração requer refatoração para aceitar dados injetados ou converter em hook.',
    riscoMudanca: 'ALTO — refatoração pode alterar API pública do módulo',
  },
];

// ══════════════════════════════════════════════
// 4. CONTADORES DE REFERÊNCIA
// ══════════════════════════════════════════════

export const CONTADORES_PRE_ETAPA6 = {
  totalArquivosImportandoStatisticsData: 15,
  totalArquivosJaMigrados: 5,  // useMirrorData como fonte primária
  totalArquivosPendentes: 10,
  totalNarrativasMapeadas: 27, // em NARRATIVE_DATA_MAP
  totalFontesDistintas: 12,   // FBSP, PNAD, DataSUS, SIDRA, etc.
};

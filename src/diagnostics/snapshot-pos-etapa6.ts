/**
 * ══════════════════════════════════════════════════════════════════════
 * SNAPSHOT PÓS-ETAPA 6 — Estado após migração SSoT completa
 * Gerado em: 2026-03-14
 * ══════════════════════════════════════════════════════════════════════
 */

// ══════════════════════════════════════════════
// 1. MAPA DE FONTES POR COMPONENTE (PÓS-ETAPA 6)
// ══════════════════════════════════════════════

export const FONTES_POS_ETAPA6 = {
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
    // ── NOVOS NA ETAPA 6 ──
    'Conclusoes.tsx',
    'ComparativeCharts.tsx',
    'IcerdAdherencePanel.tsx',
    'ConclusoesReportGenerator.tsx',
    'generateConclusoesFullHTML.ts (via parâmetro mirrorData injetado)',
    'StatisticsInventoryReport.tsx',
    'LacunasCerdTab.tsx',
    'SerieTemporalGrupos.tsx',
  ],

  pendentes: [],
  // ── MIGRADOS NA ETAPA 6B (final) ──
  migradosEtapa6B: [
    'narrativeHelpers.ts (factory createNarrativas + hook useNarrativeData)',
    'countStatisticsIndicators.ts (factory computeStatisticsCounts)',
  ],
};

// ══════════════════════════════════════════════
// 2. COMPARAÇÃO PRÉ × PÓS
// ══════════════════════════════════════════════

export const COMPARACAO = {
  testesNarrativaConsistencia: {
    preEtapa6: 'PASS (4/4)',
    posEtapa6: 'PASS (4/4)',
    divergencias: 0,
  },

  valoresNarrativosMudaram: false,
  motivo: 'O BD foi populado via espelhamento dos mesmos dados hardcoded. Como o fallback retorna os mesmos valores, nenhuma narrativa mudou.',

  fiosCondutores: {
    mudaram: false,
    motivo: 'Fios condutores já usavam BD (useAnalyticalInsights) desde antes da Etapa 6.',
  },

  graficosComparativos: {
    mudaram: false,
    motivo: 'ComparativeCharts agora usa useMirrorData, mas como os dados espelhados são idênticos aos hardcoded, os gráficos permanecem iguais.',
  },

  aderenciaIcerd: {
    mudaram: false,
    motivo: 'IcerdAdherencePanel migrado para useMirrorData com mesma lógica de scoring.',
  },

  relatoriosPDF: {
    mudaram: false,
    motivo: 'generateConclusoesFullHTML recebe mirrorData como parâmetro. Dados idênticos → HTML idêntico.',
  },

  narrativeHelpers: {
    migrado: true,
    motivo: 'Refatorado com factory createNarrativas() + hook useNarrativeData(). Module-level exports preservados para backward compat e testes.',
    impacto: 'Nenhum — testes 3/3 PASS confirmam valores idênticos.',
  },

  countStatisticsIndicators: {
    migrado: true,
    motivo: 'Refatorado com factory computeStatisticsCounts(). Module-level exports preservados.',
  },
};

// ══════════════════════════════════════════════
// 3. CONTADORES DE REFERÊNCIA
// ══════════════════════════════════════════════

export const CONTADORES_POS_ETAPA6 = {
  totalArquivosImportandoStatisticsData: 4,  // narrativeHelpers(factory fallback), countStatisticsIndicators(factory fallback), StatisticsInventoryReport(contagem), useMirrorData(imports)
  totalArquivosUsandoMirrorData: 20,
  totalArquivosPendentes: 0,
  totalNarrativasMapeadas: 27,
  percentualMigrado: 100,
};

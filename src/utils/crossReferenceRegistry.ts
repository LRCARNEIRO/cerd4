/**
 * ═══════════════════════════════════════════════════════════════
 * REGISTRO DE REFERÊNCIAS CRUZADAS DE INDICADORES
 * ═══════════════════════════════════════════════════════════════
 * 
 * REGRA DE PROPAGAÇÃO: Quando um indicador/dado é atualizado em
 * qualquer local do sistema, TODAS as abas e seções que o utilizam
 * devem refletir a mesma atualização. Este registro mapeia onde
 * cada série/constante do StatisticsData.ts é consumida.
 * 
 * USO: Antes de modificar qualquer dado, consulte este registro
 * para identificar todos os pontos de impacto.
 * ═══════════════════════════════════════════════════════════════
 */

export interface IndicatorLocation {
  /** Nome da constante exportada de StatisticsData.ts */
  constante: string;
  /** Descrição legível do indicador */
  descricao: string;
  /** Arquivos que importam/consomem este dado */
  arquivos: {
    arquivo: string;
    aba: string;
    uso: string;
  }[];
}

/**
 * Mapa completo de onde cada série/constante do SSoT (StatisticsData.ts)
 * é consumida no sistema. Atualizar sempre que novos consumidores forem adicionados.
 */
export const CROSS_REFERENCE_REGISTRY: IndicatorLocation[] = [
  {
    constante: 'evolucaoComposicaoRacial',
    descricao: 'Composição racial da população (Censo/PNAD)',
    arquivos: [
      { arquivo: 'DadosGeraisTab.tsx', aba: 'Estatísticas > Dados Gerais', uso: 'Gráfico de composição racial' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total de dados estatísticos' },
    ],
  },
  {
    constante: 'indicadoresSocioeconomicos',
    descricao: 'Indicadores socioeconômicos por raça (renda, pobreza, desemprego)',
    arquivos: [
      { arquivo: 'DadosGeraisTab.tsx', aba: 'Estatísticas > Dados Gerais', uso: 'Tabela e gráficos socioeconômicos' },
      { arquivo: 'ComparativeCharts.tsx', aba: 'Conclusões > Gráficos Comparativos', uso: 'Gráficos de comparação' },
      { arquivo: 'SerieTemporalGrupos.tsx', aba: 'Grupos Focais > Série Temporal', uso: 'Séries por grupo focal' },
      { arquivo: 'Conclusoes.tsx', aba: 'Conclusões', uso: 'Fios condutores e insights' },
      { arquivo: 'ConclusoesReportGenerator.tsx', aba: 'Relatórios > Conclusões', uso: 'Geração de relatório' },
      { arquivo: 'generateConclusoesFullHTML.ts', aba: 'Relatórios > HTML Conclusões', uso: 'Export HTML' },
      { arquivo: 'narrativeHelpers.ts', aba: 'Narrativas', uso: 'Textos analíticos derivados' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total de dados' },
    ],
  },
  {
    constante: 'segurancaPublica',
    descricao: 'Homicídios, letalidade policial, encarceramento por raça',
    arquivos: [
      { arquivo: 'LacunasCerdTab.tsx', aba: 'Estatísticas > Lacunas CERD', uso: 'Gráficos de segurança' },
      { arquivo: 'generateCerdIVHTML.ts', aba: 'Relatórios > CERD IV HTML', uso: 'Export HTML' },
      { arquivo: 'narrativeHelpers.ts', aba: 'Narrativas', uso: 'narrativaSeguranca()' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total de dados' },
    ],
  },
  {
    constante: 'feminicidioSerie',
    descricao: 'Série histórica de feminicídios por raça',
    arquivos: [
      { arquivo: 'SerieTemporalGrupos.tsx', aba: 'Grupos Focais', uso: 'Série temporal feminicídio' },
      { arquivo: 'generateCerdIVHTML.ts', aba: 'Relatórios > CERD IV', uso: 'Export' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total de dados' },
    ],
  },
  {
    constante: 'educacaoSerieHistorica',
    descricao: 'Indicadores educacionais por raça (analfabetismo, superior, abandono)',
    arquivos: [
      { arquivo: 'LacunasCerdTab.tsx', aba: 'Estatísticas > Lacunas CERD', uso: 'Gráficos educação' },
      { arquivo: 'Conclusoes.tsx', aba: 'Conclusões', uso: 'Insights cruzados' },
      { arquivo: 'ConclusoesReportGenerator.tsx', aba: 'Relatórios', uso: 'Relatório conclusões' },
      { arquivo: 'generateCerdIVHTML.ts', aba: 'Relatórios > CERD IV', uso: 'Export' },
      { arquivo: 'narrativeHelpers.ts', aba: 'Narrativas', uso: 'narrativaEducacaoSerie()' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total de dados' },
    ],
  },
  {
    constante: 'saudeSerieHistorica',
    descricao: 'Mortalidade materna/infantil por raça',
    arquivos: [
      { arquivo: 'Conclusoes.tsx', aba: 'Conclusões', uso: 'Fios condutores' },
      { arquivo: 'ConclusoesReportGenerator.tsx', aba: 'Relatórios', uso: 'Relatório' },
      { arquivo: 'generateCommonCoreHTML.ts', aba: 'Relatórios > Common Core', uso: 'Export' },
      { arquivo: 'narrativeHelpers.ts', aba: 'Narrativas', uso: 'Textos derivados' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total de dados' },
    ],
  },
  {
    constante: 'povosTradicionais',
    descricao: 'Dados de quilombolas, indígenas, ciganos, matriz africana',
    arquivos: [
      { arquivo: 'CovidRacialSection.tsx', aba: 'Estatísticas > Covid Racial', uso: 'Dados povos tradicionais' },
      { arquivo: 'SerieTemporalGrupos.tsx', aba: 'Grupos Focais', uso: 'Séries quilombolas/indígenas' },
      { arquivo: 'LacunasCerdTab.tsx', aba: 'Estatísticas > Lacunas CERD', uso: 'Lacunas específicas' },
      { arquivo: 'Conclusoes.tsx', aba: 'Conclusões', uso: 'Fios condutores' },
      { arquivo: 'ConclusoesReportGenerator.tsx', aba: 'Relatórios', uso: 'Relatório' },
      { arquivo: 'generateCommonCoreHTML.ts', aba: 'Relatórios > Common Core', uso: 'Export' },
      { arquivo: 'generateConclusoesFullHTML.ts', aba: 'Relatórios > Conclusões HTML', uso: 'Export' },
      { arquivo: 'narrativeHelpers.ts', aba: 'Narrativas', uso: 'narrativaQuilombolas()' },
      { arquivo: 'StatisticsInventoryReport.tsx', aba: 'Relatórios > Inventário', uso: 'Listagem' },
    ],
  },
  {
    constante: 'violenciaInterseccional',
    descricao: 'Violência cruzada por raça, gênero, idade',
    arquivos: [
      { arquivo: 'InterseccionalTabs.tsx', aba: 'Estatísticas > Interseccional', uso: 'Gráficos' },
      { arquivo: 'ComparativeCharts.tsx', aba: 'Conclusões > Gráficos', uso: 'Comparação' },
      { arquivo: 'generateConclusoesFullHTML.ts', aba: 'Relatórios', uso: 'Export' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total' },
    ],
  },
  {
    constante: 'classePorRaca',
    descricao: 'Distribuição por classe social e raça',
    arquivos: [
      { arquivo: 'InterseccionalTabs.tsx', aba: 'Estatísticas > Interseccional', uso: 'Gráfico classe×raça' },
      { arquivo: 'ComparativeCharts.tsx', aba: 'Conclusões > Gráficos', uso: 'Comparação' },
      { arquivo: 'generateConclusoesFullHTML.ts', aba: 'Relatórios', uso: 'Export' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total' },
    ],
  },
  {
    constante: 'dadosDemograficos',
    descricao: 'Dados demográficos gerais (composição racial, pirâmide etária)',
    arquivos: [
      { arquivo: 'DadosGeraisTab.tsx', aba: 'Estatísticas > Dados Gerais', uso: 'Resumo demográfico' },
      { arquivo: 'ConclusoesReportGenerator.tsx', aba: 'Relatórios', uso: 'Dados base' },
      { arquivo: 'generateConclusoesFullHTML.ts', aba: 'Relatórios', uso: 'Export' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total' },
    ],
  },
  {
    constante: 'evolucaoDesigualdade',
    descricao: 'Evolução do índice de desigualdade racial',
    arquivos: [
      { arquivo: 'ComparativeCharts.tsx', aba: 'Conclusões > Gráficos', uso: 'Gráfico evolução' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total' },
    ],
  },
  {
    constante: 'radarVulnerabilidades',
    descricao: 'Radar multidimensional de vulnerabilidades',
    arquivos: [
      { arquivo: 'VulnerabilidadesTab.tsx', aba: 'Estatísticas > Vulnerabilidades', uso: 'Gráfico radar' },
      { arquivo: 'generateConclusoesFullHTML.ts', aba: 'Relatórios', uso: 'Export' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total' },
    ],
  },
  {
    constante: 'juventudeNegra',
    descricao: 'Indicadores específicos da juventude negra',
    arquivos: [
      { arquivo: 'VulnerabilidadesTab.tsx', aba: 'Estatísticas > Vulnerabilidades', uso: 'Seção juventude' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total' },
    ],
  },
  {
    constante: 'interseccionalidadeTrabalho',
    descricao: 'Trabalho por raça e gênero (informalidade, renda)',
    arquivos: [
      { arquivo: 'InterseccionalTabs.tsx', aba: 'Estatísticas > Interseccional', uso: 'Gráficos trabalho' },
      { arquivo: 'VulnerabilidadesTab.tsx', aba: 'Estatísticas > Vulnerabilidades', uso: 'Dados trabalho' },
      { arquivo: 'StatisticsInventoryReport.tsx', aba: 'Relatórios > Inventário', uso: 'Listagem' },
      { arquivo: 'countStatisticsIndicators.ts', aba: 'Contagem global', uso: 'Total' },
    ],
  },
  {
    constante: 'atlasViolencia2025',
    descricao: 'Atlas da Violência 2025 — dados atualizados',
    arquivos: [
      { arquivo: 'InterseccionalTabs.tsx', aba: 'Estatísticas > Interseccional', uso: 'Bloco Atlas' },
    ],
  },
];

/**
 * Dado o nome de uma constante do StatisticsData.ts, retorna todos os
 * arquivos/abas que a consomem.
 */
export function getImpactedLocations(constante: string): IndicatorLocation | undefined {
  return CROSS_REFERENCE_REGISTRY.find(r => r.constante === constante);
}

/**
 * Dado o nome de um arquivo (ex: 'DadosGeraisTab.tsx'), retorna todas
 * as constantes que ele consome.
 */
export function getIndicatorsInFile(fileName: string): IndicatorLocation[] {
  return CROSS_REFERENCE_REGISTRY.filter(r =>
    r.arquivos.some(a => a.arquivo === fileName)
  );
}

/**
 * Gera um relatório resumido de impacto para uma lista de constantes alteradas.
 * Útil para exibir ao usuário antes de confirmar uma atualização.
 */
export function generateImpactReport(constantesAlteradas: string[]): {
  constante: string;
  descricao: string;
  totalLocais: number;
  abas: string[];
}[] {
  return constantesAlteradas.map(c => {
    const ref = getImpactedLocations(c);
    if (!ref) return { constante: c, descricao: '(não registrada)', totalLocais: 0, abas: [] };
    const abas = [...new Set(ref.arquivos.map(a => a.aba))];
    return {
      constante: c,
      descricao: ref.descricao,
      totalLocais: ref.arquivos.length,
      abas,
    };
  });
}

/**
 * ═══════════════════════════════════════════════════════════════
 * PROTOCOLO DE ATUALIZAÇÃO DE DADOS
 * ═══════════════════════════════════════════════════════════════
 * 
 * Ao atualizar qualquer dado em StatisticsData.ts:
 * 
 * 1. IDENTIFICAR: Consulte CROSS_REFERENCE_REGISTRY para a constante
 *    sendo alterada e obtenha a lista de arquivos impactados.
 * 
 * 2. VERIFICAR: Para cada arquivo listado, confirme que:
 *    - O dado será automaticamente atualizado (importação direta) ✅
 *    - OU precisa de ajuste manual (dado derivado/calculado) ⚠️
 * 
 * 3. NARRATIVAS: Se narrativeHelpers.ts estiver na lista, as narrativas
 *    programáticas se atualizam automaticamente (SSoT v2). Caso contrário,
 *    verifique textos estáticos que referenciem o dado.
 * 
 * 4. RELATÓRIOS: Arquivos generate*HTML.ts e *ReportGenerator.tsx usam
 *    importações diretas — atualizações no SSoT propagam automaticamente.
 * 
 * 5. CONTAGEM: countStatisticsIndicators.ts recalcula automaticamente.
 * 
 * REGRA DE ANO-REFERÊNCIA: Aplique sempre a regra de defasagem
 * documentada em DEFASAGEM_FONTES_OFICIAIS (StatisticsData.ts).
 * ═══════════════════════════════════════════════════════════════
 */

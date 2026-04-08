export type RecommendationConceptBundle = {
  id: string;
  triggerTokens: string[];
  minTriggerMatches: number;
  expansions: string[];
};

export const IMPORTANT_SHORT_KEYWORDS = new Set([
  'raca',
]);

export const RECOMMENDATION_CONCEPT_BUNDLES: RecommendationConceptBundle[] = [
  {
    id: 'dados_desagregados',
    triggerTokens: ['dados', 'coleta', 'coletar', 'desagregados', 'estatisticos', 'demograficos'],
    minTriggerMatches: 2,
    expansions: [
      'censo',
      'censo 2022',
      'demografia',
      'racial',
      'raciais',
      'raca cor',
      'quesito raca cor',
      'genero raca',
      'por raca',
      'por genero',
      'por etnia',
      'registro administrativo',
      'registros administrativos',
    ],
  },
];
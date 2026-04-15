export type RecommendationConceptBundle = {
  id: string;
  triggerTokens: string[];
  minTriggerMatches: number;
  expansions: string[];
};

export const IMPORTANT_SHORT_KEYWORDS = new Set([
  'raca',
  'odio',
  'onu',
  'sus',
  'pcd',
  'lei',
  'ods',
]);

/**
 * Tokens do grupo focal que são tão genéricos que, sozinhos, não devem
 * ativar vinculação — precisam vir acompanhados de keywords temáticas.
 * Ex.: "racial" casa com 90%+ dos indicadores; "negros"/"negras" casa com muitos.
 */
export const UBIQUITOUS_GROUP_TOKENS = new Set([
  'racial',
  'racismo',
  'racista',
  'negros',
  'negras',
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
  {
    id: 'saude_racial',
    triggerTokens: ['saude', 'mortalidade', 'morbidade', 'epidemiologia', 'covid', 'materna', 'infantil', 'hospitalar'],
    minTriggerMatches: 1,
    expansions: ['saude', 'mortalidade', 'datasus', 'morbidade', 'vacinacao', 'pnsipn', 'sus', 'obstetricia', 'gestante', 'parto'],
  },
  {
    id: 'educacao',
    triggerTokens: ['educacao', 'escolar', 'escola', 'ensino', 'cotas', 'alfabetizacao', 'evasao'],
    minTriggerMatches: 1,
    expansions: ['educacao', 'escolar', 'escola', 'ensino', 'ideb', 'enem', 'alfabetizacao', 'evasao', 'matricula', 'cotas', 'distorcao idade serie'],
  },
  {
    id: 'trabalho_renda',
    triggerTokens: ['trabalho', 'emprego', 'renda', 'salarial', 'desemprego', 'mercado', 'pobreza'],
    minTriggerMatches: 1,
    expansions: ['trabalho', 'emprego', 'renda', 'salarial', 'desemprego', 'mercado formal', 'pobreza', 'bolsa familia', 'cadunico'],
  },
  {
    id: 'seguranca_policial',
    triggerTokens: ['policial', 'forca', 'letalidade', 'seguranca', 'homicidio', 'homicidios', 'violencia policial', 'perfilamento'],
    minTriggerMatches: 1,
    expansions: ['policial', 'letalidade', 'homicidio', 'seguranca publica', 'atlas violencia', 'camera corporal', 'cameras corporais', 'custodia', 'audiencia', 'operacao policial', 'abordagem policial'],
  },
  {
    id: 'moradia_habitacao',
    triggerTokens: ['moradia', 'habitacao', 'habitacional', 'favela', 'favelas', 'saneamento', 'segregacao'],
    minTriggerMatches: 1,
    expansions: ['moradia', 'habitacao', 'habitacional', 'favela', 'favelas', 'saneamento', 'deficit habitacional', 'agua', 'esgoto'],
  },
  {
    id: 'terra_territorio',
    triggerTokens: ['terras', 'territorio', 'demarcacao', 'titulacao', 'fundiaria', 'incra', 'funai'],
    minTriggerMatches: 1,
    expansions: ['terras', 'territorio', 'demarcacao', 'titulacao', 'fundiaria', 'incra', 'funai', 'regularizacao'],
  },
  {
    id: 'discurso_odio',
    triggerTokens: ['odio', 'discurso', 'propaganda', 'neonazi', 'extremismo', 'supremacia', 'incitacao'],
    minTriggerMatches: 1,
    expansions: ['odio', 'discurso', 'injuria racial', 'crime racial', 'tipificacao', 'propaganda racista'],
  },
  {
    id: 'institucional',
    triggerTokens: ['institucional', 'ministerio', 'seppir', 'igualdade racial', 'fortalecimento', 'conselho'],
    minTriggerMatches: 1,
    expansions: ['institucional', 'ministerio', 'seppir', 'igualdade racial', 'conselho', 'cnpir', 'estadic', 'munic', 'estrutura'],
  },
  {
    id: 'imigrantes_refugiados',
    triggerTokens: ['imigrantes', 'refugiados', 'apatridas', 'migracao', 'xenofobia', 'migrantes'],
    minTriggerMatches: 1,
    expansions: ['imigrantes', 'refugiados', 'apatridas', 'migracao', 'xenofobia', 'estrangeiros', 'naturalizados'],
  },
  {
    id: 'durban_decada',
    triggerTokens: ['durban', 'decada', 'afrodescendentes', 'plano acao', 'programa durban'],
    minTriggerMatches: 1,
    expansions: ['durban', 'decada', 'afrodescendentes', 'plano acao', 'programa igualdade'],
  },
  {
    id: 'encarceramento',
    triggerTokens: ['encarceramento', 'prisional', 'penitenciario', 'custodia', 'preso', 'presos', 'carceraria', 'depen'],
    minTriggerMatches: 1,
    expansions: ['encarceramento', 'prisional', 'penitenciario', 'custodia', 'preso', 'presos', 'audiencia custodia', 'socioeducativo', 'depen'],
  },
  {
    id: 'politica_representacao',
    triggerTokens: ['representacao', 'parlamento', 'parlamentar', 'candidatura', 'candidaturas', 'vereador', 'eleicao', 'eleicoes', 'politica'],
    minTriggerMatches: 2,
    expansions: ['representacao', 'parlamento', 'vereador', 'candidatura', 'candidaturas', 'eleicao', 'eleicoes', 'assentos locais', 'paridade racial'],
  },
  {
    id: 'afirmativas_cotas',
    triggerTokens: ['afirmativas', 'cotas', 'reserva vagas', 'concurso', 'pronaa', 'cotistas'],
    minTriggerMatches: 1,
    expansions: ['afirmativas', 'cotas', 'reserva vagas', 'concurso', 'pronaa', 'acoes afirmativas', 'lei cotas', 'cotistas'],
  },
  {
    id: 'religiao',
    triggerTokens: ['religiao', 'religiosa', 'religioes', 'intolerancia', 'candomble', 'umbanda', 'terreiro'],
    minTriggerMatches: 1,
    expansions: ['religiao', 'religiosa', 'religioes', 'intolerancia', 'candomble', 'umbanda', 'terreiro', 'matriz africana'],
  },
  {
    id: 'ciganos',
    triggerTokens: ['cigano', 'ciganos', 'romani', 'cigana'],
    minTriggerMatches: 1,
    expansions: ['cigano', 'ciganos', 'romani', 'cigana', 'populacao cigana'],
  },
  {
    id: 'defensores_dh',
    triggerTokens: ['defensores', 'ativistas', 'liderancas', 'direitos humanos'],
    minTriggerMatches: 1,
    expansions: ['defensores', 'ativistas', 'liderancas', 'quilombola', 'indigena', 'lideres'],
  },
  {
    id: 'justica_racial',
    triggerTokens: ['justica', 'vitimas', 'crimes', 'raciais', 'judicial', 'judiciais', 'judiciario', 'treinamento'],
    minTriggerMatches: 2,
    expansions: ['justica', 'judicial', 'judiciais', 'judiciario', 'tribunal', 'defensoria', 'processos', 'racismo', 'crimes raciais', 'injuria racial', 'capacitacao', 'treinamento'],
  },
];
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
  'cnj',
  'stf',
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
    expansions: ['saude', 'mortalidade', 'datasus', 'morbidade', 'vacinacao', 'pnsipn', 'sus', 'obstetricia', 'gestante', 'parto', 'pre natal', 'nascidos vivos', 'mortalidade materna'],
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
    expansions: ['trabalho', 'emprego', 'renda', 'salarial', 'desemprego', 'mercado formal', 'pobreza', 'bolsa familia', 'cadunico', 'trabalho infantil', 'trabalho escravo', 'informalidade'],
  },
  {
    id: 'seguranca_policial',
    triggerTokens: ['policial', 'forca', 'letalidade', 'seguranca', 'homicidio', 'homicidios', 'violencia policial', 'perfilamento'],
    minTriggerMatches: 1,
    expansions: ['policial', 'letalidade', 'homicidio', 'seguranca publica', 'atlas violencia', 'camera corporal', 'cameras corporais', 'operacao policial', 'abordagem policial', 'perfilamento', 'abordagem', 'uso forca'],
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
    expansions: ['terras', 'territorio', 'demarcacao', 'titulacao', 'fundiaria', 'incra', 'funai', 'regularizacao', 'terra indigena', 'terras indigenas'],
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
    expansions: ['institucional', 'ministerio', 'seppir', 'igualdade racial', 'conselho', 'cnpir', 'estadic', 'munic', 'estrutura', 'sinapir'],
  },
  {
    id: 'imigrantes_refugiados',
    triggerTokens: ['imigrantes', 'refugiados', 'apatridas', 'migracao', 'xenofobia', 'migrantes'],
    minTriggerMatches: 1,
    expansions: ['imigrantes', 'refugiados', 'apatridas', 'migracao', 'xenofobia', 'estrangeiros', 'naturalizados', 'asilo'],
  },
  {
    id: 'durban_decada',
    triggerTokens: ['durban', 'decada', 'afrodescendentes', 'plano acao', 'programa durban'],
    minTriggerMatches: 1,
    expansions: ['durban', 'decada', 'afrodescendentes', 'plano acao', 'programa igualdade', 'decenio'],
  },
  {
    id: 'encarceramento',
    triggerTokens: ['encarceramento', 'prisional', 'penitenciario', 'custodia', 'preso', 'presos', 'carceraria', 'depen', 'criminal'],
    minTriggerMatches: 1,
    expansions: ['encarceramento', 'prisional', 'penitenciario', 'custodia', 'preso', 'presos', 'audiencia custodia', 'socioeducativo', 'depen', 'populacao prisional', 'sistema prisional'],
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
    expansions: ['defensores', 'ativistas', 'liderancas', 'quilombola', 'indigena', 'lideres', 'ameacados'],
  },
  {
    id: 'justica_racial',
    triggerTokens: ['justica', 'vitimas', 'crimes', 'raciais', 'judicial', 'judiciais', 'judiciario', 'treinamento', 'criminal'],
    minTriggerMatches: 1,
    expansions: ['justica', 'judicial', 'judiciais', 'judiciario', 'tribunal', 'defensoria', 'processos', 'racismo', 'crimes raciais', 'injuria racial', 'capacitacao', 'treinamento', 'processo judicial', 'processos judiciais', 'cnj', 'ministerio publico', 'perspectiva racial'],
  },
  // §14: Discriminação interseccional contra mulheres afro-brasileiras
  {
    id: 'mulheres_interseccional',
    triggerTokens: ['mulheres', 'interseccoes', 'multipla', 'genero', 'materna', 'feminicidio', 'obstetrica'],
    minTriggerMatches: 2,
    expansions: [
      'mulheres negras', 'mulher negra', 'feminicidio', 'violencia domestica',
      'violencia obstetrica', 'mortalidade materna', 'saude da mulher',
      'chefia monoparental', 'gestante', 'pre natal', 'nascidos vivos',
      'processo judicial', 'processos judiciais', 'cnj', 'racismo',
      'discriminacao', 'desigualdade', 'genero raca', 'por genero',
      'violencia contra mulher', 'lei maria penha',
    ],
  },
  // §48: Desenvolvimento, meio ambiente e DDHH
  {
    id: 'meio_ambiente',
    triggerTokens: ['ambiente', 'ambiental', 'desenvolvimento', 'mineracao', 'garimpo', 'desmatamento', 'biodiversidade'],
    minTriggerMatches: 1,
    expansions: ['ambiental', 'ambiente', 'mineracao', 'garimpo', 'desmatamento', 'biodiversidade', 'sustentavel', 'amazonia', 'florestal', 'clima'],
  },
  // §42: Direito à livre assembleia
  {
    id: 'assembleia_participacao',
    triggerTokens: ['assembleia', 'manifestacao', 'reuniao', 'livre', 'participacao'],
    minTriggerMatches: 2,
    expansions: ['assembleia', 'manifestacao', 'reuniao', 'participacao social', 'sociedade civil', 'consulta', 'consultas'],
  },
  // §60: Combate a preconceitos e legados históricos
  {
    id: 'preconceito_historico',
    triggerTokens: ['preconceitos', 'legados', 'historicas', 'historicos', 'injusticas', 'curriculo', 'curricular', 'escravidao'],
    minTriggerMatches: 1,
    expansions: ['preconceito', 'curriculo', 'curricular', 'didatico', 'educacao antirracista', 'historia cultura', 'afro brasileira', 'memoria', 'verdade', 'reparacao', 'escravidao'],
  },
  // §8: Implementação doméstica da Convenção
  {
    id: 'implementacao_convencao',
    triggerTokens: ['harmonizacao', 'legislativa', 'domestica', 'convencao', 'ratificacao', 'tratados'],
    minTriggerMatches: 1,
    expansions: ['harmonizacao', 'legislativa', 'convencao', 'ratificacao', 'tratados', 'icerd', 'protocolo', 'internacional'],
  },
  // §40: Perfilamento racial
  {
    id: 'perfilamento_racial',
    triggerTokens: ['perfilamento', 'perfil', 'abordagem', 'suspeicao', 'seletividade'],
    minTriggerMatches: 1,
    expansions: ['perfilamento', 'abordagem policial', 'suspeicao', 'seletividade penal', 'reconhecimento facial', 'camera corporal', 'cameras corporais'],
  },
  // §66: Consultas à sociedade civil
  {
    id: 'sociedade_civil',
    triggerTokens: ['sociedade civil', 'consultas', 'dialogo', 'participacao'],
    minTriggerMatches: 1,
    expansions: ['sociedade civil', 'consultas', 'dialogo', 'participacao social', 'conferencia', 'conferencias', 'cnpir'],
  },
];

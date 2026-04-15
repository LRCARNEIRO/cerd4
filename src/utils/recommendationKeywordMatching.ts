import { IMPORTANT_SHORT_KEYWORDS, RECOMMENDATION_CONCEPT_BUNDLES, UBIQUITOUS_GROUP_TOKENS } from '@/utils/recommendationKeywordConcepts';

type RecommendationKeywordSource = {
  tema?: string | null;
  descricao_lacuna?: string | null;
  texto_original_onu?: string | null;
  grupo_focal?: string | null;
};

type RecommendationKeywordProfile = {
  allKeywords: string[];
  phraseKeywords: string[];
  groupKeywords: string[];
  strongKeywords: string[];
  weakKeywords: string[];
};

export type RecommendationKeywordMatch = {
  isRelevant: boolean;
  matchedKeywords: string[];
  matchedPhraseKeywords: string[];
  matchedGroupKeywords: string[];
  matchedStrongKeywords: string[];
  matchedWeakKeywords: string[];
  score: number;
};

const NORMALIZE_CACHE_LIMIT = 5000;
const PROFILE_CACHE_LIMIT = 500;

const normalizedTextCache = new Map<string, string>();
const profileCache = new Map<string, RecommendationKeywordProfile>();

function setCacheValue<T>(cache: Map<string, T>, key: string, value: T, limit: number): T {
  cache.set(key, value);
  if (cache.size > limit) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey !== undefined) cache.delete(oldestKey);
  }
  return value;
}

const KEYWORD_STOPWORDS = new Set([
  'sobre', 'entre', 'contra', 'desde', 'ainda', 'outros', 'outras',
  'sendo', 'foram', 'todos', 'todas', 'nivel', 'forma', 'areas',
  'acesso', 'medidas', 'especiais', 'nacional', 'brasil', 'federal',
  'estado', 'governo', 'publico', 'publica', 'sistema', 'programa',
  'politica', 'politicas', 'direitos', 'direito', 'humanos', 'povos',
  'populacao', 'comunidades', 'combate', 'promocao', 'protecao',
  'implementacao', 'garantir', 'inclui', 'impacto', 'social',
  'grupo', 'grupos', 'norma', 'normas', 'conduta', 'condutas',
  'passados', 'promulgacao', 'constituicao', 'congresso', 'aprovou',
  'violando', 'dever', 'estatal', 'especialmente', 'vulneravel',
  'artigo', 'artigos', 'decreto', 'decretos', 'resolucao', 'resolucoes',
  'federal', 'nacional', 'brasileiro', 'brasileira', 'uniao',
  'comite', 'recomenda', 'recomendacao', 'recomendacoes', 'parte',
  'acelere', 'proteja', 'essas', 'esses', 'essa', 'esse',
]);

const LOW_SIGNAL_KEYWORDS = new Set([
  'violencia', 'ameaca', 'ameacas', 'discriminacao', 'segregacao',
  'protecao', 'combate', 'combater', 'garantia', 'garantias',
  'promocao', 'promover', 'acesso', 'acessos',
]);

const SYNONYMS: Record<string, string[]> = {
  homofobicas: ['homofobia', 'lgbtfobia', 'lgbtqia', 'orientacao sexual', 'homoafetivo'],
  transfobicas: ['transfobia', 'pessoas trans', 'trans', 'transgenero', 'identidade de genero', 'transexualidade'],
  criminalizacao: ['criminalizar', 'criminalizacao', 'tipificacao'],
  quilombolas: ['quilombo', 'quilombola', 'remanescentes', 'territorio quilombola', 'terras quilombolas'],
  quilombola: ['quilombo', 'quilombolas', 'remanescentes', 'territorio quilombola', 'terras quilombolas'],
  homicidios: ['homicidio', 'letalidade', 'mortes violentas'],
  homicidio: ['homicidios', 'letalidade', 'mortes violentas'],
  moradia: ['habitacao', 'habitacional', 'deficit habitacional'],
  segregacao: ['segregacao residencial', 'favelas'],
  demarcacao: ['titulacao', 'regularizacao fundiaria', 'territorio quilombola', 'terras quilombolas'],
  titulacao: ['demarcacao', 'regularizacao fundiaria', 'territorio quilombola', 'terras quilombolas'],
  encarceramento: ['sistema prisional', 'penitenciario', 'custodia', 'depen'],
  prisional: ['encarceramento', 'penitenciario', 'custodia', 'preso', 'detencao', 'depen'],
  detencao: ['encarceramento', 'sistema prisional', 'custodia'],
  custodia: ['encarceramento', 'prisional', 'audiencia custodia'],
  feminicidio: ['violencia domestica', 'violencia mulher'],
  'trabalho infantil': ['erradicacao trabalho infantil'],
  discriminacao: ['preconceito', 'desigualdade'],
  indigena: ['indigenas', 'povos originarios'],
  indigenas: ['indigena', 'povos originarios'],
  racismo: ['racial', 'antirracista', 'racista', 'raciais'],
  racial: ['racismo', 'raciais', 'antirracista'],
  raciais: ['racismo', 'racial', 'antirracista'],
  odio: ['discurso odio', 'crime odio', 'injuria racial', 'tipificacao'],
  supremacia: ['neonazi', 'extremismo', 'propaganda racista'],
  escravidao: ['reparacao', 'reparatorio', 'memoria', 'verdade', 'trabalho escravo', 'trabalho analogo'],
  reparacao: ['escravidao', 'reparatorio', 'memoria', 'comissao verdade'],
  curriculo: ['curricular', 'didatico', 'educacao antirracista'],
  curricular: ['curriculo', 'didatico', 'educacao antirracista'],
  afrodescendentes: ['decada', 'decenio', 'populacao negra'],
  decada: ['afrodescendentes', 'decenio', 'durban'],
  representacao: ['sub representacao', 'cadeiras', 'cargos eletivos', 'parlamento', 'vereador', 'candidatura'],
  eletivos: ['representacao', 'parlamento', 'vereador', 'candidatura'],
  candidatura: ['candidaturas', 'eleicao', 'eleicoes', 'representacao'],
  candidaturas: ['candidatura', 'eleicao', 'eleicoes', 'representacao'],
  coleta: ['censo', 'registro administrativo', 'registros administrativos'],
  coletar: ['censo', 'registro administrativo', 'registros administrativos'],
  estatisticos: ['estatisticas', 'demografia', 'censo'],
  demograficos: ['demografia', 'censo'],
  desagregados: ['desagregacao', 'por raca', 'por genero', 'por etnia', 'raca cor', 'genero raca', 'quesito raca cor'],
  justica: ['judiciario', 'judicial', 'judiciais', 'tribunal', 'defensoria'],
  judicial: ['justica', 'judiciario', 'judiciais', 'tribunal'],
  judiciais: ['justica', 'judiciario', 'judicial', 'tribunal', 'processos'],
  judiciario: ['justica', 'judicial', 'judiciais', 'tribunal'],
  policial: ['policiais', 'forca policial', 'operacao policial', 'camera corporal'],
  policiais: ['policial', 'forca policial', 'camera corporal'],
  cotas: ['cotistas', 'reserva vagas', 'lei cotas', 'acoes afirmativas'],
  escolar: ['escola', 'ensino', 'matricula', 'evasao escolar'],
  evasao: ['abandono escolar', 'evasao escolar', 'distorcao idade serie'],
  mortalidade: ['obitos', 'taxa mortalidade', 'letalidade'],
  materna: ['mortalidade materna', 'obstetricia', 'gestante', 'parto', 'pre natal', 'obstetrica'],
};

const GRUPO_SPECIFIC: Record<string, string[]> = {
  negros: ['negros', 'negras', 'racial', 'racismo'],
  indigenas: ['indigena', 'indigenas'],
  quilombolas: ['quilombola', 'quilombolas', 'quilombo'],
  ciganos: ['ciganos', 'cigano', 'romani'],
  religioes_matriz_africana: ['candomble', 'umbanda', 'matriz africana', 'terreiro'],
  juventude_negra: ['juventude negra', 'jovens negros'],
  mulheres_negras: ['mulheres negras', 'mulher negra', 'feminicidio', 'mortalidade materna', 'violencia obstetrica', 'saude da mulher', 'gestante', 'parto', 'pre natal'],
  lgbtqia_negros: ['lgbtqia', 'pessoas trans', 'trans', 'transexual', 'homofobia', 'transfobia'],
  pcd_negros: ['deficiencia', 'pessoa com deficiencia'],
  idosos_negros: ['idosos negros', 'idosas negras'],
  geral: [],
};

const NOISE_PHRASE_FRAGMENTS = new Set([
  'comite', 'expressa', 'preocupacao', 'recomenda', 'estado', 'parte',
  'acelere', 'proteja', 'abordem', 'integradas', 'sofrida', 'multipla',
]);

export function normalizeSearchText(text: string): string {
  const rawText = String(text || '');
  const cached = normalizedTextCache.get(rawText);
  if (cached !== undefined) return cached;

  const normalized = rawText
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return setCacheValue(normalizedTextCache, rawText, normalized, NORMALIZE_CACHE_LIMIT);
}

function tokenize(text: string): string[] {
  return normalizeSearchText(text)
    .split(' ')
    .filter(word => word.length >= 5 || IMPORTANT_SHORT_KEYWORDS.has(word));
}

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map(normalizeSearchText).filter(Boolean))].sort((a, b) => b.length - a.length);
}

function includesWholeTerm(normalizedHaystack: string, keyword: string): boolean {
  const normalizedKeyword = normalizeSearchText(keyword);
  if (!normalizedKeyword) return false;
  return normalizedHaystack.includes(` ${normalizedKeyword} `);
}

function extractSourceText(rec: RecommendationKeywordSource): string {
  let sourceText = `${rec.tema || ''} ${rec.descricao_lacuna || ''}`;
  const textoOnu = rec.texto_original_onu;

  if (textoOnu && typeof textoOnu === 'string') {
    const isPt = /\b(que|para|como|mais|pelo|pela|dos|das|com|uma|sao)\b/i.test(normalizeSearchText(textoOnu));
    if (isPt) sourceText += ` ${textoOnu}`;
  }

  return sourceText;
}

function extractPhraseKeywords(text: string): string[] {
  const words = normalizeSearchText(text).split(' ').filter(Boolean);
  const phrases: string[] = [];

  for (const size of [3, 2]) {
    for (let index = 0; index <= words.length - size; index += 1) {
      const slice = words.slice(index, index + size);
      const relevantWords = slice.filter((word) => word.length >= 4 && !KEYWORD_STOPWORDS.has(word));
      if (relevantWords.length < 2) continue;
      if (relevantWords.every((word) => LOW_SIGNAL_KEYWORDS.has(word))) continue;
      if (relevantWords.every((word) => NOISE_PHRASE_FRAGMENTS.has(word))) continue;
      phrases.push(slice.join(' '));
    }
  }

  return uniqueNonEmpty(phrases);
}

function extractConceptKeywords(text: string, rawTokens: string[], phraseKeywords: string[]): string[] {
  const normalizedSource = ` ${normalizeSearchText(text)} `;
  const sourceTokenSet = new Set([...rawTokens, ...phraseKeywords.flatMap(tokenize)]);

  return uniqueNonEmpty(
    RECOMMENDATION_CONCEPT_BUNDLES.flatMap((bundle) => {
      const triggerMatches = bundle.triggerTokens.filter(
        (token) => sourceTokenSet.has(token) || includesWholeTerm(normalizedSource, token)
      ).length;

      if (triggerMatches < bundle.minTriggerMatches) return [];
      return bundle.expansions;
    })
  );
}

function getRecommendationKeywordProfile(rec: RecommendationKeywordSource): RecommendationKeywordProfile {
  const sourceText = extractSourceText(rec);
  const cacheKey = `${rec.grupo_focal || ''}::${normalizeSearchText(sourceText)}`;
  const cachedProfile = profileCache.get(cacheKey);
  if (cachedProfile) return cachedProfile;

  const rawTokens = tokenize(sourceText).filter((token) => !KEYWORD_STOPWORDS.has(token));
  const synonymTokens = rawTokens.flatMap((token) => SYNONYMS[token] || []);
  const groupKeywords = uniqueNonEmpty(GRUPO_SPECIFIC[rec.grupo_focal || ''] || []);
  const basePhraseKeywords = uniqueNonEmpty([
    ...extractPhraseKeywords(sourceText),
    ...synonymTokens.filter((token) => normalizeSearchText(token).includes(' ')),
    ...groupKeywords.filter((token) => normalizeSearchText(token).includes(' ')),
  ]);
  const conceptKeywords = extractConceptKeywords(sourceText, rawTokens, basePhraseKeywords);
  const phraseKeywords = basePhraseKeywords;

  const groupKeywordSet = new Set(groupKeywords);
  const allCandidateKeywords = uniqueNonEmpty([...rawTokens, ...synonymTokens, ...groupKeywords, ...conceptKeywords]);
  const weakKeywords = uniqueNonEmpty(
    allCandidateKeywords.filter((keyword) => !groupKeywordSet.has(keyword) && LOW_SIGNAL_KEYWORDS.has(keyword))
  );
  const weakKeywordSet = new Set(weakKeywords);
  const strongKeywords = uniqueNonEmpty(
    allCandidateKeywords.filter((keyword) => !groupKeywordSet.has(keyword) && !weakKeywordSet.has(keyword))
  );

  const profile = {
    allKeywords: uniqueNonEmpty([...phraseKeywords, ...groupKeywords, ...strongKeywords, ...weakKeywords]),
    phraseKeywords,
    groupKeywords,
    strongKeywords,
    weakKeywords,
  };

  return setCacheValue(profileCache, cacheKey, profile, PROFILE_CACHE_LIMIT);
}

export function getRecomendacaoKeywords(rec: RecommendationKeywordSource): string[] {
  return getRecommendationKeywordProfile(rec).allKeywords;
}

export function getKeywordMatches(haystack: string, keywords: string[]): string[] {
  const normalizedHaystack = ` ${normalizeSearchText(haystack)} `;
  if (!normalizedHaystack.trim()) return [];

  return uniqueNonEmpty(
    keywords.filter((keyword) => {
      const normalizedKeyword = normalizeSearchText(keyword);
      if (!normalizedKeyword) return false;
      return normalizedHaystack.includes(` ${normalizedKeyword} `);
    })
  );
}

export function hasKeywordMatch(haystack: string, keywords: string[]): boolean {
  return getKeywordMatches(haystack, keywords).length > 0;
}

export function getRecommendationKeywordMatch(rec: RecommendationKeywordSource, haystack: string): RecommendationKeywordMatch {
  const normalizedHaystack = ` ${normalizeSearchText(haystack)} `;
  if (!normalizedHaystack.trim()) {
    return {
      isRelevant: false,
      matchedKeywords: [],
      matchedPhraseKeywords: [],
      matchedGroupKeywords: [],
      matchedStrongKeywords: [],
      matchedWeakKeywords: [],
      score: 0,
    };
  }

  const profile = getRecommendationKeywordProfile(rec);
  const matchedPhraseKeywords = profile.phraseKeywords.filter((keyword) => includesWholeTerm(normalizedHaystack, keyword));
  const matchedGroupKeywords = profile.groupKeywords.filter((keyword) => includesWholeTerm(normalizedHaystack, keyword));
  const matchedStrongKeywords = profile.strongKeywords.filter((keyword) => includesWholeTerm(normalizedHaystack, keyword));
  const matchedWeakKeywords = profile.weakKeywords.filter((keyword) => includesWholeTerm(normalizedHaystack, keyword));

  const phraseCoveredTokens = new Set(
    matchedPhraseKeywords.flatMap((phrase) => normalizeSearchText(phrase).split(' '))
  );

  const standaloneGroupKeywords = matchedGroupKeywords.filter((keyword) => !phraseCoveredTokens.has(normalizeSearchText(keyword)));
  const standaloneStrongKeywords = matchedStrongKeywords.filter((keyword) => !phraseCoveredTokens.has(normalizeSearchText(keyword)));
  const standaloneWeakKeywords = matchedWeakKeywords.filter((keyword) => !phraseCoveredTokens.has(normalizeSearchText(keyword)));

  const score =
    (matchedPhraseKeywords.length * 3) +
    (standaloneGroupKeywords.length * 2.5) +
    (standaloneStrongKeywords.length * 1.5) +
    (standaloneWeakKeywords.length * 0.5);

  const requiresFocalSignal = profile.groupKeywords.length > 0;

  // Grupo focal com tokens ubíquos (negros/racial) exige critério mais rigoroso:
  // não basta casar "racial" — precisa de phrase match OU strong keyword temático não-ubíquo.
  const groupIsUbiquitous = profile.groupKeywords.every(
    (gk) => UBIQUITOUS_GROUP_TOKENS.has(normalizeSearchText(gk))
  );

  // Para grupos ubíquos, group match só conta se acompanhado de evidência temática específica
  const hasNonUbiquitousGroupMatch = matchedGroupKeywords.some(
    (gk) => !UBIQUITOUS_GROUP_TOKENS.has(normalizeSearchText(gk))
  );
  const hasThematicSignal = matchedPhraseKeywords.length > 0 || standaloneStrongKeywords.length > 0;

  let isRelevant: boolean;
  if (requiresFocalSignal) {
    if (groupIsUbiquitous) {
      // Ex: grupo 'negros' — exige phrase + group OU strong temático ≥3
      isRelevant =
        (matchedGroupKeywords.length > 0 && matchedPhraseKeywords.length > 0 && score >= 3)
        || (matchedPhraseKeywords.length >= 1 && standaloneStrongKeywords.length >= 1 && score >= 4)
        || (matchedGroupKeywords.length > 0 && standaloneStrongKeywords.length >= 1 && score >= 4);
    } else {
      // Ex: grupo 'quilombolas', 'indigenas' — group match + score mínimo suficiente
      isRelevant =
        (matchedGroupKeywords.length > 0 && score >= 2)
        || (matchedPhraseKeywords.length >= 1 && score >= 3);
    }
  } else {
    isRelevant = matchedPhraseKeywords.length > 0 || (matchedStrongKeywords.length > 0 && score >= 3);
  }

  return {
    isRelevant,
    matchedKeywords: uniqueNonEmpty([
      ...matchedPhraseKeywords,
      ...matchedGroupKeywords,
      ...matchedStrongKeywords,
      ...matchedWeakKeywords,
    ]),
    matchedPhraseKeywords,
    matchedGroupKeywords,
    matchedStrongKeywords,
    matchedWeakKeywords,
    score,
  };
}

export function matchesRecommendationEvidence(rec: RecommendationKeywordSource, haystack: string): boolean {
  return getRecommendationKeywordMatch(rec, haystack).isRelevant;
}

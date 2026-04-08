type RecommendationKeywordSource = {
  tema?: string | null;
  descricao_lacuna?: string | null;
  texto_original_onu?: string | null;
  grupo_focal?: string | null;
};

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
]);

const SYNONYMS: Record<string, string[]> = {
  homofobicas: ['homofobia', 'lgbtfobia', 'lgbtqia', 'orientacao sexual', 'homoafetivo'],
  transfobicas: ['transfobia', 'pessoas trans', 'trans', 'transgenero', 'identidade de genero', 'transexualidade'],
  criminalizacao: ['criminalizar', 'criminalizacao', 'tipificacao'],
  quilombolas: ['quilombo', 'quilombola', 'remanescentes'],
  quilombola: ['quilombo', 'quilombolas', 'remanescentes'],
  homicidios: ['homicidio', 'letalidade', 'mortes violentas'],
  homicidio: ['homicidios', 'letalidade', 'mortes violentas'],
  moradia: ['habitacao', 'habitacional', 'deficit habitacional'],
  segregacao: ['segregacao residencial', 'favelas'],
  demarcacao: ['titulacao', 'regularizacao fundiaria'],
  titulacao: ['demarcacao', 'regularizacao fundiaria'],
  encarceramento: ['sistema prisional', 'penitenciario', 'custodia'],
  feminicidio: ['violencia domestica', 'violencia mulher'],
  'trabalho infantil': ['erradicacao trabalho infantil'],
  discriminacao: ['preconceito', 'desigualdade'],
  indigena: ['indigenas', 'povos originarios'],
  indigenas: ['indigena', 'povos originarios'],
  racismo: ['racial', 'antirracista', 'racista'],
};

const GRUPO_SPECIFIC: Record<string, string[]> = {
  negros: ['negros', 'negras', 'racial', 'racismo'],
  indigenas: ['indigena', 'indigenas'],
  quilombolas: ['quilombola', 'quilombolas', 'quilombo'],
  ciganos: ['ciganos', 'cigano', 'romani'],
  religioes_matriz_africana: ['candomble', 'umbanda', 'matriz africana', 'terreiro'],
  juventude_negra: ['juventude negra', 'jovens negros'],
  mulheres_negras: ['mulheres negras', 'mulher negra', 'feminicidio'],
  lgbtqia_negros: ['lgbtqia', 'pessoas trans', 'trans', 'transexual', 'homofobia', 'transfobia'],
  pcd_negros: ['deficiencia', 'pessoa com deficiencia'],
  idosos_negros: ['idosos negros', 'idosas negras'],
  geral: [],
};

export function normalizeSearchText(text: string): string {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text: string): string[] {
  return normalizeSearchText(text)
    .split(' ')
    .filter(word => word.length >= 5);
}

function uniqueNonEmpty(values: string[]): string[] {
  return [...new Set(values.map(normalizeSearchText).filter(Boolean))].sort((a, b) => b.length - a.length);
}

export function getRecomendacaoKeywords(rec: RecommendationKeywordSource): string[] {
  let sourceText = `${rec.tema || ''} ${rec.descricao_lacuna || ''}`;
  const textoOnu = rec.texto_original_onu;

  if (textoOnu && typeof textoOnu === 'string') {
    const isPt = /\b(que|para|como|mais|pelo|pela|dos|das|com|uma|sao)\b/i.test(normalizeSearchText(textoOnu));
    if (isPt) sourceText += ` ${textoOnu}`;
  }

  const rawTokens = tokenize(sourceText).filter(token => !KEYWORD_STOPWORDS.has(token));
  const synonymTokens = rawTokens.flatMap(token => SYNONYMS[token] || []);
  const grupoTokens = GRUPO_SPECIFIC[rec.grupo_focal || ''] || [];

  return uniqueNonEmpty([
    ...rawTokens,
    ...synonymTokens,
    ...grupoTokens,
  ]);
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

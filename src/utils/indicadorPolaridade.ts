/**
 * SSoT de polaridade de indicadores.
 * "Menor é melhor" (maior = pior) — usado em vereditos, razões N/B e tendências.
 * Mantido em um único lugar para evitar divergência entre UI, sensor e narrativas.
 */
export const NEGATIVE_INDICATOR_TERMS: string[] = [
  // núcleo histórico
  'mortalidade', 'homicídio', 'homicidio', 'feminicídio', 'violência', 'assassinato',
  'óbito', 'morte', 'letalidade', 'desemprego', 'desocupa', 'analfabet', 'evasão',
  'abandono', 'déficit', 'deficit', 'pobreza', 'miséria', 'trabalho infantil',
  'trabalho escravo', 'encarceramento', 'aglomerado', 'favela',
  'insegurança', 'intolerância', 'distorção', 'subnotificação', 'desigualdade',
  // ampliação (mapeamento bloco D)
  'socioeducativ', 'carcerári', 'prisional', 'preso', 'privação de liberdade',
  'apreens', 'estupro', 'suicíd', 'autoextermínio', 'tortura', 'lesão corporal',
  'agressão', 'racismo', 'injúria racial', 'discriminação', 'vitimiz',
  'auto de resistência', 'intervenção policial',
  'sem banheiro', 'sem esgoto', 'sem água', 'sem coleta', 'sem saneamento',
  'inadequa', 'precari', 'informalidade', 'trabalho informal', 'subutiliza',
  'internaç', 'hospitaliza', 'adoecimento',
  'fome', 'desnutrição', 'gravidez na adolescência', 'reprova', 'defasagem',
  'sem instrução', 'nem-nem', 'despejo', 'remoção forçada', 'conflito',
  // correções de leitura auditadas (set/2026)
  // denúncias: critério único — quanto mais denúncias, pior
  'denúncia', 'denuncia',
  'baixo peso', 'menores de idade', 'sem ensino superior',
  'até 2 salários', 'ate 2 salarios', 'remuneração abaixo', 'remuneracao abaixo',
  'rmm ', 'mortalidade materna',
];

/**
 * Indicadores de COBERTURA/EXISTÊNCIA de estrutura: medem quantas unidades
 * federativas ou órgãos oferecem o serviço, não a ocorrência da violação.
 * Precedem a lista negativa (ex.: "UFs com Canal de Denúncia Racial" é
 * "maior é melhor", ainda que contenha a palavra "denúncia").
 */
export const POSITIVE_OVERRIDE_TERMS: string[] = [
  'ufs com', 'uf com', 'estados com', 'municípios com', 'municipios com',
  'canal de denúncia', 'canal de denuncia', 'canais de denúncia', 'canais de denuncia',
  'cobertura', 'existência de', 'existencia de',
];

export function isLowerBetterNome(nome: string, categoria?: string): boolean {
  const n = (nome || '').toLowerCase();
  const c = (categoria || '').toLowerCase();
  if (POSITIVE_OVERRIDE_TERMS.some((t) => n.includes(t))) return false;
  return NEGATIVE_INDICATOR_TERMS.some((t) => n.includes(t) || (!!c && c.includes(t)));
}

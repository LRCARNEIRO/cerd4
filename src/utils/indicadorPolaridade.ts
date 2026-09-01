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
];

export function isLowerBetterNome(nome: string, categoria?: string): boolean {
  const n = (nome || '').toLowerCase();
  const c = (categoria || '').toLowerCase();
  return NEGATIVE_INDICATOR_TERMS.some((t) => n.includes(t) || (!!c && c.includes(t)));
}

import type { ArtigoConvencao } from '@/utils/artigosConvencao';

const ARTICLE_PATTERNS: Array<[ArtigoConvencao, RegExp]> = [
  ['VII', /\b(?:ART(?:IGO)?\.?\s*)?(?:VII|7)\b/],
  ['VI', /\b(?:ART(?:IGO)?\.?\s*)?(?:VI|6)\b/],
  ['V', /\b(?:ART(?:IGO)?\.?\s*)?(?:V|5)\b/],
  ['IV', /\b(?:ART(?:IGO)?\.?\s*)?(?:IV|4)\b/],
  ['III', /\b(?:ART(?:IGO)?\.?\s*)?(?:III|3)\b/],
  ['II', /\b(?:ART(?:IGO)?\.?\s*)?(?:II|2)\b/],
  ['I', /\b(?:ART(?:IGO)?\.?\s*)?(?:I|1)\b/],
];

export function normalizeArticleTag(raw: string): ArtigoConvencao | null {
  const value = String(raw || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

  if (!value) return null;

  for (const [article, pattern] of ARTICLE_PATTERNS) {
    if (pattern.test(value)) return article;
  }

  return null;
}
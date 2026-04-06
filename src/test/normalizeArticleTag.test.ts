import { describe, expect, it } from 'vitest';

import { normalizeArticleTag } from '@/utils/normalizeArticleTag';

describe('normalizeArticleTag', () => {
  it('preserva Art. IV sem colapsar para Art. V', () => {
    expect(normalizeArticleTag('Art. IV')).toBe('IV');
  });

  it('normaliza formatos romanos e arábicos', () => {
    expect(normalizeArticleTag('V')).toBe('V');
    expect(normalizeArticleTag('Artigo 4')).toBe('IV');
    expect(normalizeArticleTag('art. 2')).toBe('II');
  });
});
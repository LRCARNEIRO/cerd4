import { describe, expect, it } from 'vitest';
import { getKeywordMatches, getRecomendacaoKeywords } from '@/utils/recommendationKeywordMatching';

const paragrafo4 = {
  tema: 'Criminalização de condutas homofóbicas e transfóbicas',
  descricao_lacuna:
    'Passados mais de 30 anos da promulgação da Constituição de 1988, o Congresso Nacional não aprovou norma que criminalize condutas homofóbicas e transfóbicas, violando o dever estatal de proteção de grupo especialmente vulnerável.',
  texto_original_onu: '',
  grupo_focal: 'lgbtqia_negros',
};

describe('recommendationKeywordMatching', () => {
  it('remove termos jurídicos genéricos do §4', () => {
    const keywords = getRecomendacaoKeywords(paragrafo4);
    expect(keywords).not.toContain('grupo');
    expect(keywords).not.toContain('norma');
    expect(keywords).not.toContain('constituicao');
    expect(keywords).toContain('homofobia');
    expect(keywords).toContain('transfobia');
    expect(keywords).toContain('lgbtqia');
  });

  it('evita falsos positivos por substring e termos genéricos', () => {
    const keywords = getRecomendacaoKeywords(paragrafo4);

    expect(getKeywordMatches('Interseccionalidade COVID impacto por grupo covid_racial', keywords)).toEqual([]);
    expect(getKeywordMatches('Percentual de Nascidos Vivos de Parto Normal', keywords)).toEqual([]);
    expect(getKeywordMatches('Decreto 11 444 2023 Institui Grupo de Trabalho Interministerial Quilombola', keywords)).toEqual([]);
  });

  it('mantem matches corretos do tema LGBTQIA+', () => {
    const keywords = getRecomendacaoKeywords(paragrafo4);

    expect(getKeywordMatches('Violencia contra pessoas trans serie ANTRA 2017 2025 lgbtqia', keywords).length).toBeGreaterThan(0);
    expect(getKeywordMatches('LGBTQIA vitimas por raca 2025', keywords)).toContain('lgbtqia');
  });
});

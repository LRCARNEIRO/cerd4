import { describe, expect, it } from 'vitest';
import { getKeywordMatches, getRecomendacaoKeywords, matchesRecommendationEvidence } from '@/utils/recommendationKeywordMatching';

const paragrafo4 = {
  tema: 'Criminalização de condutas homofóbicas e transfóbicas',
  descricao_lacuna:
    'Passados mais de 30 anos da promulgação da Constituição de 1988, o Congresso Nacional não aprovou norma que criminalize condutas homofóbicas e transfóbicas, violando o dever estatal de proteção de grupo especialmente vulnerável.',
  texto_original_onu: '',
  grupo_focal: 'lgbtqia_negros',
};

const paragrafo25 = {
  tema: 'Titulação de Territórios Quilombolas',
  descricao_lacuna:
    'O Comitê recomenda que o Estado parte acelere a demarcação e titulação de terras quilombolas e proteja essas comunidades de ameaças e violência.',
  texto_original_onu:
    'The Committee recommends accelerating the demarcation and titling of quilombola lands and protecting these communities from threats and violence.',
  grupo_focal: 'quilombolas',
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

  it('exige coerencia tematica estrita no §4', () => {
    expect(matchesRecommendationEvidence(paragrafo4, 'Violencia contra pessoas trans serie ANTRA 2017 2025 lgbtqia')).toBe(true);
    expect(matchesRecommendationEvidence(paragrafo4, 'Interseccionalidade COVID impacto por grupo covid_racial')).toBe(false);
    expect(matchesRecommendationEvidence(paragrafo4, 'Decreto 11 444 2023 Institui Grupo de Trabalho Interministerial Quilombola')).toBe(false);
  });

  it('remove falsos positivos do §25 quilombola', () => {
    expect(matchesRecommendationEvidence(paragrafo25, 'Titulação de territórios quilombolas — INCRA')).toBe(true);
    expect(matchesRecommendationEvidence(paragrafo25, 'Comunidades quilombolas sob ameaça de violência no campo')).toBe(true);
    expect(matchesRecommendationEvidence(paragrafo25, 'Notificações de violência doméstica por raça — mulheres (2024)')).toBe(false);
    expect(matchesRecommendationEvidence(paragrafo25, 'Vítimas negras de violência policial (Disque 100)')).toBe(false);
    expect(matchesRecommendationEvidence(paragrafo25, '0151 PROTECAO DE TERRAS INDIGENAS GESTAO TERRITORIAL E ETNODESENVOLVIMENTO')).toBe(false);
    expect(matchesRecommendationEvidence(paragrafo25, 'Lei nº 14.192/2021 — Combate à violência política contra mulheres')).toBe(false);
  });
});

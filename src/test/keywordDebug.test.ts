import { describe, expect, it } from 'vitest';
import { getRecomendacaoKeywords, matchesRecommendationEvidence } from '@/utils/recommendationKeywordMatching';

const p14 = {
  tema: 'Discriminação interseccional contra mulheres',
  descricao_lacuna: 'O Comitê expressa preocupação com a discriminação múltipla sofrida por mulheres afro-brasileiras, indígenas e quilombolas. Recomenda políticas integradas que abordem as intersecções de raça, gênero e classe. Mortalidade materna de mulheres negras é 2x maior que brancas.',
  texto_original_onu: '',
  grupo_focal: 'mulheres_negras',
};

describe('§14 keyword debug', () => {
  it('extracts keywords', () => {
    const kw = getRecomendacaoKeywords(p14);
    expect(kw.length).toBeGreaterThan(0);
    expect(kw).toContain('mortalidade materna');
    expect(kw).toContain('mulheres negras');
  });

  it('vincula indicadores de mortalidade materna', () => {
    expect(matchesRecommendationEvidence(p14, 'Razão de Mortalidade Materna por 100 mil nascidos vivos ods_racial')).toBe(true);
    expect(matchesRecommendationEvidence(p14, 'Saúde — mortalidade materna e infantil por raça (2018-2024) saude')).toBe(true);
  });

  it('rejeita indicadores sem relação com §14', () => {
    expect(matchesRecommendationEvidence(p14, 'Taxa de Desocupação por Raça (2018-2025)')).toBe(false);
    expect(matchesRecommendationEvidence(p14, 'Moradores de Favelas e Comunidades Urbanas por raca cor Censo 2022')).toBe(false);
  });
});

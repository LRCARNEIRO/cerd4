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
    console.log('Keywords §14:', kw);
    expect(kw.length).toBeGreaterThan(0);
  });

  it('matches mortalidade materna', () => {
    console.log('match mortalidade materna:', matchesRecommendationEvidence(p14, 'Razão de Mortalidade Materna por 100 mil nascidos vivos ods_racial'));
    console.log('match saude materna:', matchesRecommendationEvidence(p14, 'Saúde — mortalidade materna e infantil por raça (2018-2024) saude'));
    console.log('match violencia domestica:', matchesRecommendationEvidence(p14, 'Notificações de violência doméstica por raça — mulheres (2024)'));
    console.log('match violencia policial:', matchesRecommendationEvidence(p14, 'Vítimas negras de violência policial (Disque 100)'));
    expect(matchesRecommendationEvidence(p14, 'Razão de Mortalidade Materna por 100 mil nascidos vivos ods_racial')).toBe(true);
    expect(matchesRecommendationEvidence(p14, 'Saúde — mortalidade materna e infantil por raça (2018-2024) saude')).toBe(true);
  });
});

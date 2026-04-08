import { describe, expect, it } from 'vitest';
import { getRecommendationKeywordMatch, matchesRecommendationEvidence } from '@/utils/recommendationKeywordMatching';

const paragrafo6 = {
  tema: 'Coleta de dados demográficos desagregados',
  descricao_lacuna:
    'O Comitê recomenda que o Brasil melhore a coleta de dados desagregados por raça, cor, etnia, gênero e outras categorias em todos os setores. O Censo 2022 avançou significativamente, mas persistem lacunas em registros administrativos e sistemas de saúde.',
  texto_original_onu: '',
  grupo_focal: 'geral',
};

const paragrafo8 = {
  tema: 'Coleta de Dados Desagregados',
  descricao_lacuna:
    'O Comitê recomenda intensificar esforços para coletar dados estatísticos desagregados por raça, cor, etnia, gênero e outras categorias.',
  texto_original_onu: '',
  grupo_focal: 'geral',
};

describe('recommendation keyword sensitivity', () => {
  it('permite que o §8 recupere evidências centrais também encontradas no §6', () => {
    const evidence = 'Educação — raça × gênero (Censo 2022) genero_raca';

    expect(matchesRecommendationEvidence(paragrafo6, evidence)).toBe(true);
    expect(matchesRecommendationEvidence(paragrafo8, evidence)).toBe(true);
  });

  it('reconhece censo e demografia como proxies válidos para dados desagregados', () => {
    const match = getRecommendationKeywordMatch(paragrafo8, 'Composição racial — Censo 2022 demografia');

    expect(match.isRelevant).toBe(true);
    expect(match.score).toBeGreaterThanOrEqual(3);
  });

  it('vincula normativos sobre coleta obrigatória de raça/cor ao §8', () => {
    expect(
      matchesRecommendationEvidence(
        paragrafo8,
        'Lei nº 14.553/2023 — Coleta obrigatória de dados de raça/cor em registros públicos'
      )
    ).toBe(true);
  });

  it('mantém bloqueio para evidências sem relação com dados desagregados', () => {
    expect(matchesRecommendationEvidence(paragrafo8, 'Decreto nº 11.444/2023 — Institui Grupo de Trabalho Interministerial Quilombola')).toBe(false);
    expect(matchesRecommendationEvidence(paragrafo8, '0151 – PROTECAO DE TERRAS INDIGENAS, GESTAO TERRITORIAL E ETNODESENVOLVIMENTO')).toBe(false);
  });
});
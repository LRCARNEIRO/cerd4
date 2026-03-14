
-- Replace educacao_indigena data with a racially comparable indicator
-- Source: Censo Escolar 2022 / INEP + Censo Demográfico 2022 / IBGE
UPDATE indicadores_interseccionais
SET dados = jsonb_build_object(
  'taxa_alfabetizacao_15_mais_pct', jsonb_build_object(
    'Indígenas em TI', 72.4,
    'Indígenas fora de TI', 88.1,
    'Negros', 93.2,
    'Brancos', 96.5
  ),
  'taxa_frequencia_escolar_6_14_pct', jsonb_build_object(
    'Indígenas em TI', 87.3,
    'Indígenas fora de TI', 96.1,
    'Negros', 97.2,
    'Brancos', 98.1
  ),
  'escolas_em_terra_indigena', 3541,
  'pct_escolas_em_TI_do_total', 1.9,
  'total_escolas_basica', 178300,
  'unidade', '%',
  'nota', 'Censo Demográfico 2022 (IBGE) e Censo Escolar 2022 (INEP). Taxa de alfabetização 15+ e frequência escolar 6-14 anos. Indígenas em TI: 72,4% de alfabetização vs 96,5% brancos (razão 0,75). 3.541 escolas em TIs (1,9% do total nacional).',
  'deep_links', jsonb_build_object(
    'ibge_censo_indigenas', 'https://censo2022.ibge.gov.br/panorama/indicadores.html?localidade=BR',
    'inep_censo_escolar', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/noticias/censo-escolar/educacao-em-terras-indigenas-o-que-diz-o-censo-escolar'
  )
),
nome = 'Educação indígena — Alfabetização e frequência escolar por raça (Censo 2022)',
updated_at = now()
WHERE id = 'd72bc940-6516-4736-ad85-7de214f32616';

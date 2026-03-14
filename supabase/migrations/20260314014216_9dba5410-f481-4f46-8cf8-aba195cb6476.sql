
-- Fix mortalidade infantil indígena: complete non-indigenous rates for all years (NCPI/Agência Brasil 2024)
-- Source: https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2024-04/mortalidade-de-criancas-indigenas-e-mais-que-o-dobro-das-nao-indigenas
-- NCPI Working Paper 12 (2024): children 0-4 years mortality per 1,000 live births
UPDATE indicadores_interseccionais
SET dados = jsonb_build_object(
  'taxa_mortalidade_0_4_indigena_por_mil', jsonb_build_object(
    '2018', 38.9,
    '2019', 37.5,
    '2020', 29.6,
    '2021', 44.8,
    '2022', 34.7
  ),
  'taxa_mortalidade_0_4_nao_indigena_por_mil', jsonb_build_object(
    '2018', 14.4,
    '2019', 13.9,
    '2020', 12.3,
    '2021', 13.1,
    '2022', 14.2
  ),
  'razao_indigena_nao_indigena', jsonb_build_object(
    '2018', 2.70,
    '2019', 2.70,
    '2020', 2.41,
    '2021', 3.42,
    '2022', 2.44
  ),
  'unidade', 'óbitos por 1.000 nascidos vivos (0-4 anos)',
  'nota', 'NCPI Working Paper 12 (2024), dados DataSUS/SIM. Faixa 0-4 anos. Razão = taxa indígena / taxa não indígena. 2021: pico associado à COVID-19 em TIs (razão 3,42). Meta ODS 3.2: < 25‰ — indígenas não alcançaram em nenhum ano. Fonte: Agência Brasil 10/04/2024.',
  'deep_links', jsonb_build_object(
    'ncpi_wp_2024', 'https://ncpi.org.br/wp-content/uploads/2024/07/Desigualdades-em-saude-de-criancas-indigenas.pdf',
    'agencia_brasil', 'https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2024-04/mortalidade-de-criancas-indigenas-e-mais-que-o-dobro-das-nao-indigenas'
  )
),
nome = 'Mortalidade de crianças indígenas (0-4 anos) vs não indígenas — NCPI/DataSUS',
updated_at = now()
WHERE id = '234d5efc-0cf5-4d48-9821-3455a38b4adc';

-- Fix trabalho escravo: add historical racial aggregate and clarify year-by-year availability
-- Sources: Repórter Brasil (66% acumulado), MTE balanço 2025 (83% em 2025)
UPDATE indicadores_interseccionais
SET dados = jsonb_build_object(
  'resgatados_total', jsonb_build_object(
    '2018', 1745,
    '2019', 1054,
    '2020', 936,
    '2021', 1937,
    '2022', 2587,
    '2023', 3190,
    '2024', 1860,
    '2025', 2772
  ),
  'percentual_negros_acumulado_historico', 66,
  'percentual_negros_por_ano', jsonb_build_object(
    '2025', 83
  ),
  'percentual_homens', jsonb_build_object('2025', 86),
  'percentual_baixa_escolaridade', jsonb_build_object('2025', 68),
  'unidade', 'trabalhadores resgatados',
  'nota', 'Série MTE/SIT Radar. Acumulado histórico: 66% dos 22,5 mil+ resgatados são negros (Repórter Brasil, jul/2024). Perfil detalhado por ano (raça, gênero, escolaridade) publicado pelo MTE apenas para 2025. 2023: recorde de resgates em 14 anos.',
  'lacuna_racial', 'Desagregação anual por raça disponível apenas para 2025. Acumulado histórico (66%) calculado pela Repórter Brasil com base no SIT.',
  'deep_links', jsonb_build_object(
    'radar_sit', 'https://sit.trabalho.gov.br/radar/',
    'balanco_2025', 'https://www.gov.br/trabalho-e-emprego/pt-br/noticias-e-conteudo/2026/janeiro/governo-do-brasil-resgata-2-772-trabalhadores-em-acoes-de-combate-ao-trabalho-analogo-a-escravidao-em-2025',
    'reporter_brasil_perfil_racial', 'https://reporterbrasil.org.br/enp-educarb/92-pessoas-negras-sao-66-das-resgatadas-do-trabalho-escravo-no-brasil/'
  )
),
updated_at = now()
WHERE id = '3ac10db9-a5df-4c91-990b-4b394438afd2';

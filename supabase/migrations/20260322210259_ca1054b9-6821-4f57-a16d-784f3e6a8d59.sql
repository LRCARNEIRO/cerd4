-- Fix Encarceramento jovens negros: 67.5→68.7 negros, 30.8→29.9 brancos, source: 19º Anuário FBSP 2025 p.19
UPDATE indicadores_interseccionais 
SET dados = jsonb_set(jsonb_set(jsonb_set(
  dados::jsonb, 
  '{valor_negros}', '68.7'),
  '{valor_brancos}', '29.9'),
  '{nota}', '"19º Anuário FBSP 2025, p.19. Possível subnotificação (cobertura racial: 85,3%)"'),
  fonte = '19º Anuário FBSP 2025, p.19'
WHERE id = 'fe9a5c84-74e2-4b77-a98e-b78f69e0835e';

-- Fix Taxa de homicídio jovens negros: 74.4→28 negros, 30.1→10.6 não negros (por 100 mil)
UPDATE indicadores_interseccionais 
SET dados = jsonb_set(jsonb_set(jsonb_set(
  dados::jsonb,
  '{valor_negros}', '28'),
  '{valor_nao_negros}', '10.6'),
  '{nota}', '"Atlas da Violência 2025, p.79. Taxa por 100 mil hab."'),
  fonte = 'Atlas da Violência 2025, p.79'
WHERE id = '9a34569a-e5b1-4b6d-a848-d99fca5a7e6c';
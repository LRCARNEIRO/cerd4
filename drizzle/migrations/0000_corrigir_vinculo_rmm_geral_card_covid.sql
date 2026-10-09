-- Correção da matriz auditada: 5 vínculos estatísticos citavam o card
-- "Mortalidade materna COVID por raça (2019-2022)" (IND-173) com o rótulo
-- "Mortalidade Materna (por 100 mil NV)", que é a sub do card
-- "Saúde — mortalidade materna e infantil por raça (2018-2024)".
-- Isso fazia o relatório por Artigo colapsar duas evidências distintas
-- (dedup por ref_id + sub) e exibir 248/217 enquanto a tela exibe 249/218.
-- Reposicionar os vínculos para o card correto preserva o nº de registros
-- físicos (2.122) e as contagens de vínculos por base.
UPDATE public.vinculos_evidencia_curados
SET ref_id = '3333eb96-0f73-456d-b8e9-fd83edec1070'::uuid
WHERE base = 'estatistica'
  AND ref_id = 'fe5f272a-3604-471e-b08f-ed6c7d0b94bf'::uuid
  AND sub = 'mortalidade materna'
  AND nome = 'Mortalidade Materna (por 100 mil NV)';

-- Step 1: DELETE spurious/duplicate records (8 records)
DELETE FROM public.lacunas_identificadas WHERE id IN (
  '0403b59a-dcd8-45d7-985c-3b0d8d326dc3',  -- §4 (not a CERD Obs Final)
  'de3bef87-fd89-4e01-8378-00f1da748c75',  -- §9-10 (not a real paragraph)
  'ac69346e-e249-4097-8a0e-f2163305c491',  -- §11-12 (not a real paragraph)
  '48cdd482-07bd-4d54-8eb4-2ecad9859ab7',  -- §25 duplicate (Titulação Quilombolas)
  '68d19b27-e0b9-42f2-840d-e6b1060a7d43',  -- §27 duplicate (Demarcação Terras)
  '158f6f6d-4333-483b-940e-e5f12536ae0f',  -- §29 duplicate (Políticas Ciganos)
  '696396bd-c854-440f-a61c-4260e7c8d196',  -- §40b (merge into §40)
  '968f202e-8cd1-478b-accb-29b6a4f14348'   -- §42b (merge into §42)
);

-- Step 2: UPDATE existing records with correct artigos, temas, prioridades

-- §8: tema was wrong
UPDATE public.lacunas_identificadas SET
  tema = 'Implementação doméstica da Convenção',
  descricao_lacuna = 'Implementação doméstica (nacional) da Convenção, incluindo harmonização legislativa',
  eixo_tematico = 'legislacao_justica',
  prioridade = 'alta'
WHERE id = 'd0362b12-3f38-4679-969c-a6997002ae37';

-- §14: artigos I,V → V only; tema correction
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['V'],
  tema = 'Situação de mulheres afro-brasileiras, indígenas e quilombolas',
  prioridade = 'alta'
WHERE id = '2c455d26-e4fd-4b8d-8f3d-25e9d0f4729e';

-- §19: prioridade alta → critica (prioritária sim)
UPDATE public.lacunas_identificadas SET
  prioridade = 'critica'
WHERE id = '9c54f874-2594-439e-a9a7-be2040648276';

-- §23: tema correction
UPDATE public.lacunas_identificadas SET
  tema = 'Pobreza, trabalho e renda'
WHERE id = '3ae0f764-ea38-4444-aca1-44618e75dc08';

-- §25: fix artigos order, eixo
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['III', 'V'],
  eixo_tematico = 'terra_territorio',
  prioridade = 'alta'
WHERE id = '089fb139-cbd1-422b-8421-37f9095942f1';

-- §29b → §29: rename paragrafo
UPDATE public.lacunas_identificadas SET
  paragrafo = '29',
  artigos_convencao = ARRAY['II'],
  prioridade = 'alta'
WHERE id = 'e9da462f-e72b-468b-9b94-15c9ad89a200';

-- §33: artigos V → VI
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['VI']
WHERE id = 'ebf4a4cf-cb47-4d3d-8aaf-30d21981b2f6';

-- §36: artigos V → VI
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['VI']
WHERE id = '36422f1d-0d56-45bb-94ee-57bc2e560519';

-- §38: artigos V → VI, tema correction
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['VI'],
  tema = 'Justiça criminal'
WHERE id = '2efccb5f-17c6-40a2-af68-71069aba0041';

-- §40: artigos V → VI, tema/eixo/grupo correction (was Intolerância Religiosa, now Perfilamento racial)
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['VI'],
  tema = 'Perfilamento racial',
  descricao_lacuna = 'Perfilamento racial (racial profiling) por forças de segurança',
  eixo_tematico = 'seguranca_publica',
  grupo_focal = 'negros'
WHERE id = '470c83d1-1d71-47f4-bdea-667f2a60b58c';

-- §42: artigos V,I → V, tema/eixo/grupo correction (was Discriminação Interseccional, now assembleia)
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['V'],
  tema = 'Direito à livre assembleia',
  descricao_lacuna = 'Direito à livre assembleia (peaceful assembly)',
  eixo_tematico = 'participacao_social',
  grupo_focal = 'geral',
  prioridade = 'alta'
WHERE id = 'bea218f7-245f-4cea-bab9-24c4bf1b0a3d';

-- §44: artigos V,VII → V only
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['V']
WHERE id = '7504b219-450f-486f-85af-871fa018982a';

-- §46: artigos V,VI → VI only
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['VI']
WHERE id = '7e73a842-eb08-4d50-abb0-ba7190c653f4';

-- §48: artigos V,VI → V only
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['V']
WHERE id = '969d0e69-d7f3-4d4b-b920-6f54476cd6f9';

-- §53: artigos III,V,VI → III,V
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['III', 'V']
WHERE id = 'df9f6fed-4921-4547-abe6-0b212cf7eba1';

-- §55: artigos II,V → V only; tema correction
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['V'],
  tema = 'Imigrantes, refugiados e requerentes de asilo'
WHERE id = '4e3774ec-66f4-4c45-a35b-719e33bd934a';

-- §60: artigos VI,VII,I → VII only; tema correction
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['VII'],
  tema = 'Combate a preconceitos raciais e legados de injustiças históricas'
WHERE id = 'c12352cf-21d4-48bc-9adb-c675b9be79de';

-- §64: keep as is (Durban reference)
-- No changes needed

-- §65: artigos II → I,II
UPDATE public.lacunas_identificadas SET
  artigos_convencao = ARRAY['I', 'II']
WHERE id = '3a599eec-4263-4f79-a00a-33814d3fa3aa';

-- Step 3: INSERT missing paragraphs (7 records)

INSERT INTO public.lacunas_identificadas (paragrafo, documento_onu, tema, descricao_lacuna, artigos_convencao, eixo_tematico, grupo_focal, tipo_observacao, prioridade, status_cumprimento, periodo_analise_inicio, periodo_analise_fim) VALUES
('12', 'CERD/C/BRA/CO/18-20', 'Acesso à justiça por vítimas de crimes raciais', 'Acesso à justiça por vítimas de crimes raciais e treinamento dos profissionais da justiça', ARRAY['VI','VII'], 'legislacao_justica', 'geral', 'recomendacao', 'alta', 'parcialmente_cumprido', 2018, 2026),
('57', 'CERD/C/BRA/CO/18-20', 'Direitos civis e coleta de dados sobre povos ciganos', 'Direitos civis e coleta de dados específicos sobre povos ciganos (Romani)', ARRAY['V'], 'politicas_institucionais', 'ciganos', 'recomendacao', 'alta', 'parcialmente_cumprido', 2018, 2026),
('61', 'CERD/C/BRA/CO/18-20', 'Ratificação de outros tratados internacionais', 'Ratificação de outros tratados internacionais de direitos humanos', ARRAY['II'], 'legislacao_justica', 'geral', 'recomendacao', 'media', 'parcialmente_cumprido', 2018, 2026),
('62', 'CERD/C/BRA/CO/18-20', 'Emenda ao artigo 8º da Convenção', 'Ratificação da emenda ao artigo 8º, §6, da Convenção', ARRAY['I','II'], 'legislacao_justica', 'geral', 'recomendacao', 'media', 'parcialmente_cumprido', 2018, 2026),
('63', 'CERD/C/BRA/CO/18-20', 'Declaração opcional sob o artigo 14', 'Considerar fazer a declaração opcional prevista no artigo 14 da Convenção', ARRAY['I','II'], 'legislacao_justica', 'geral', 'recomendacao', 'media', 'parcialmente_cumprido', 2018, 2026),
('66', 'CERD/C/BRA/CO/18-20', 'Consultas à sociedade civil', 'Ampliação das consultas e diálogo com organizações da sociedade civil', ARRAY['II','V'], 'participacao_social', 'geral', 'recomendacao', 'alta', 'parcialmente_cumprido', 2018, 2026),
('67', 'CERD/C/BRA/CO/18-20', 'Disseminação da informação', 'Disseminação da informação sobre medidas de implementação da Convenção', ARRAY['VII'], 'cultura_patrimonio', 'geral', 'recomendacao', 'media', 'parcialmente_cumprido', 2018, 2026);

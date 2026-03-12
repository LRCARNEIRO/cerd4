
-- =====================================================
-- ODSR (ODS Racial / MIR-UFPB) — 25 novos indicadores
-- Fonte: https://odsr.lema.ufpb.br/visao-geral
-- Todos com desagregação racial (Negra, Branca, Indígena, Amarela)
-- =====================================================

-- 1. SAÚDE — Mortalidade Infantil por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Taxa de Mortalidade Infantil por mil nascidos vivos, por raça/cor',
  'saude', 'mortalidade_infantil',
  'DataSUS/SIM-SINASC via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2022, "fonte_odsr": true, "nota": "Indicador referenciado na Plataforma ODS Racial (MIR/UFPB). Consultar plataforma para valores desagregados por grupo racial."}',
  '{"CERD/C/BRA/CO/18-20", "ODS 3"}',
  '{"Art. 5(e)(iv)"}',
  true, false, true, true, 'estavel'
);

-- 2. SAÚDE — Mortalidade Materna por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Razão de Mortalidade Materna por 100 mil nascidos vivos, por raça/cor',
  'saude', 'mortalidade_materna',
  'DataSUS/SIM-SINASC via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2022, "fonte_odsr": true, "nota": "Indicador referenciado na Plataforma ODS Racial."}',
  '{"CERD/C/BRA/CO/18-20", "ODS 3"}',
  '{"Art. 5(e)(iv)"}',
  true, true, false, true, 'estavel'
);

-- 3. SAÚDE — Mortalidade de Jovens (15-29) por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Taxa de Mortalidade de Jovens (15 a 29 anos) por 100 mil hab., por raça/cor',
  'saude', 'mortalidade_jovens',
  'DataSUS/SIM via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2022, "fonte_odsr": true}',
  '{"CERD/C/BRA/CO/18-20", "ODS 3"}',
  '{"Art. 5(b)", "Art. 5(e)(iv)"}',
  true, false, true, true, 'piora'
);

-- 4. SAÚDE — Taxa de Suicídio por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Taxa de Suicídio por 100 mil habitantes, por raça/cor',
  'saude', 'suicidio',
  'DataSUS/SIM via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2022, "fonte_odsr": true}',
  '{"ODS 3"}',
  '{"Art. 5(e)(iv)"}',
  true, false, true, true, 'piora'
);

-- 5. SAÚDE — Mortalidade por AIDS por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Taxa de Mortalidade por AIDS por 100 mil habitantes, por raça/cor',
  'saude', 'mortalidade_aids',
  'DataSUS/SIM via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2022, "fonte_odsr": true}',
  '{"ODS 3"}',
  '{"Art. 5(e)(iv)"}',
  true, false, false, true, 'melhora'
);

-- 6. SAÚDE — Mortalidade por Diabetes Mellitus por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Taxa de Mortalidade por Diabetes Mellitus por 100 mil hab., por raça/cor',
  'saude', 'mortalidade_diabetes',
  'DataSUS/SIM via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2022, "fonte_odsr": true}',
  '{"ODS 3"}',
  '{"Art. 5(e)(iv)"}',
  true, false, true, true, 'estavel'
);

-- 7. SAÚDE — Pré-natal adequado por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Nascidos vivos de mães com pré-natal adequado (7+ consultas), por raça/cor',
  'saude', 'prenatal',
  'DataSUS/SINASC via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2022, "fonte_odsr": true}',
  '{"ODS 3"}',
  '{"Art. 5(e)(iv)"}',
  true, true, false, true, 'melhora'
);

-- 8. SAÚDE — Mortalidade prematura (30-69) por DCNT
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Taxa de Mortalidade Prematura (30-69 anos) por DCNT por 100 mil hab., por raça/cor',
  'saude', 'mortalidade_dcnt',
  'DataSUS/SIM via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2022, "fonte_odsr": true}',
  '{"ODS 3"}',
  '{"Art. 5(e)(iv)"}',
  true, false, true, true, 'estavel'
);

-- 9. EDUCAÇÃO — IDEB Ensino Fundamental I por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'IDEB — Ensino Fundamental I por predominância racial',
  'educacao', 'ideb',
  'INEP/MEC via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2021, "fonte_odsr": true, "nota": "Critério de predominância racial na composição discente da escola."}',
  '{"CERD/C/BRA/CO/18-20", "ODS 4"}',
  '{"Art. 5(e)(v)"}',
  true, false, true, true, 'melhora'
);

-- 10. EDUCAÇÃO — IDEB Ensino Médio por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'IDEB — Ensino Médio por predominância racial',
  'educacao', 'ideb',
  'INEP/MEC via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2023, "fonte_odsr": true}',
  '{"CERD/C/BRA/CO/18-20", "ODS 4"}',
  '{"Art. 5(e)(v)"}',
  true, false, true, true, 'melhora'
);

-- 11. EDUCAÇÃO — Média ENEM por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Média da Nota Geral no ENEM por predominância racial',
  'educacao', 'enem',
  'INEP/MEC via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2023, "fonte_odsr": true}',
  '{"ODS 4"}',
  '{"Art. 5(e)(v)"}',
  true, false, true, true, 'estavel'
);

-- 12. EDUCAÇÃO — Taxa de Escolarização no Ensino Superior por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Taxa de Escolarização no Ensino Superior por raça/cor',
  'educacao', 'escolarizacao_superior',
  'INEP/IBGE via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2023, "fonte_odsr": true}',
  '{"CERD/C/BRA/CO/18-20", "ODS 4"}',
  '{"Art. 5(e)(v)"}',
  true, false, true, true, 'melhora'
);

-- 13. GÊNERO — Violência física contra mulheres por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Taxa de Violência Física contra Mulheres por 100 mil hab., por raça/cor',
  'seguranca_publica', 'violencia_mulheres',
  'SINAN/DataSUS via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2023, "fonte_odsr": true}',
  '{"CERD/C/BRA/CO/18-20", "ODS 5"}',
  '{"Art. 5(b)", "Art. 5(e)(iv)"}',
  true, true, false, true, 'piora'
);

-- 14. GÊNERO — Violência sexual contra mulheres por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Taxa de Violência Sexual contra Mulheres por 100 mil hab., por raça/cor',
  'seguranca_publica', 'violencia_sexual_mulheres',
  'SINAN/DataSUS via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2023, "fonte_odsr": true}',
  '{"CERD/C/BRA/CO/18-20", "ODS 5"}',
  '{"Art. 5(b)", "Art. 5(e)(iv)"}',
  true, true, false, true, 'piora'
);

-- 15. TRABALHO — Salário Médio por Hora por raça/cor (RAIS)
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Salário Médio por Hora em Vínculos Formais Ativos, por raça/cor',
  'trabalho_renda', 'salario_hora',
  'RAIS/MTE via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2024, "fonte_odsr": true}',
  '{"ODS 8"}',
  '{"Art. 5(e)(i)"}',
  true, false, false, true, 'estavel'
);

-- 16. TRABALHO — Salário Médio Setor Público por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Salário Médio no Setor Público por raça/cor',
  'trabalho_renda', 'salario_setor_publico',
  'RAIS/MTE via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2024, "fonte_odsr": true}',
  '{"ODS 8"}',
  '{"Art. 5(e)(i)"}',
  true, false, false, true, 'estavel'
);

-- 17. TRABALHO — Lesões Ocupacionais por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Taxas de Lesões Ocupacionais Fatais e Não Fatais no Mercado Formal, por raça/cor',
  'trabalho_renda', 'lesoes_ocupacionais',
  'RAIS/MTE via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2024, "fonte_odsr": true}',
  '{"ODS 8"}',
  '{"Art. 5(e)(i)"}',
  true, false, false, true, 'estavel'
);

-- 18. TRABALHO — Vínculos com Ensino Superior por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Percentual de Vínculos Formais Ocupados com Ensino Superior, por raça/cor',
  'trabalho_renda', 'vinculos_ensino_superior',
  'RAIS/MTE via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2024, "fonte_odsr": true}',
  '{"ODS 8", "ODS 10"}',
  '{"Art. 5(e)(i)", "Art. 5(e)(v)"}',
  true, false, false, true, 'melhora'
);

-- 19. INSTITUCIONAL — Paridade Racial na Magistratura
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Paridade Racial de Vínculos Formais de Magistratura em relação à população',
  'legislacao_justica', 'paridade_magistratura',
  'RAIS/MTE via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2024, "fonte_odsr": true}',
  '{"ODS 10", "ODS 16"}',
  '{"Art. 5(a)", "Art. 5(c)"}',
  true, false, false, true, 'estavel'
);

-- 20. INSTITUCIONAL — Paridade Racial Médicos
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Paridade Racial de Vínculos Formais de Médicos em relação à população',
  'saude', 'paridade_medicos',
  'RAIS/MTE via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2024, "fonte_odsr": true}',
  '{"ODS 10"}',
  '{"Art. 5(e)(iv)"}',
  true, false, false, true, 'estavel'
);

-- 21. INSTITUCIONAL — Paridade Racial Delegados de Polícia
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Paridade Racial de Vínculos Formais de Delegados de Polícia em relação à população',
  'seguranca_publica', 'paridade_delegados',
  'RAIS/MTE via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2024, "fonte_odsr": true}',
  '{"ODS 10", "ODS 16"}',
  '{"Art. 5(a)", "Art. 5(b)"}',
  true, false, false, true, 'estavel'
);

-- 22. INSTITUCIONAL — Paridade Racial Oficiais PM
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Paridade Racial de Oficiais da Polícia Militar em relação à população',
  'seguranca_publica', 'paridade_oficiais_pm',
  'RAIS/MTE via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2022, "fonte_odsr": true}',
  '{"ODS 10", "ODS 16"}',
  '{"Art. 5(a)", "Art. 5(b)"}',
  true, false, false, true, 'estavel'
);

-- 23. TRABALHO — Vínculos em Cargos Gerenciais por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Percentual de Vínculos Formais em Cargos Gerenciais, por raça/cor',
  'trabalho_renda', 'cargos_gerenciais',
  'RAIS/MTE via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2024, "fonte_odsr": true}',
  '{"ODS 10"}',
  '{"Art. 5(e)(i)"}',
  true, false, false, true, 'melhora'
);

-- 24. VIOLÊNCIA — Mortalidade por Causas Externas por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Taxa de Mortalidade por Causas Externas por 100 mil hab., por raça/cor',
  'seguranca_publica', 'mortalidade_causas_externas',
  'DataSUS/SIM via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2022, "fonte_odsr": true}',
  '{"ODS 16"}',
  '{"Art. 5(b)"}',
  true, false, true, true, 'melhora'
);

-- 25. VIOLÊNCIA — Violência contra Menores por raça/cor
INSERT INTO indicadores_interseccionais (nome, categoria, subcategoria, fonte, url_fonte, dados, documento_origem, artigos_convencao, desagregacao_raca, desagregacao_genero, desagregacao_idade, desagregacao_territorio, tendencia)
VALUES (
  'Taxa de Violência Física contra Menores por 100 mil hab., por raça/cor',
  'seguranca_publica', 'violencia_menores',
  'SINAN/DataSUS via ODSR',
  'https://odsr.lema.ufpb.br/visao-geral',
  '{"ano_referencia": 2023, "fonte_odsr": true}',
  '{"ODS 16"}',
  '{"Art. 5(b)"}',
  true, false, true, true, 'piora'
);

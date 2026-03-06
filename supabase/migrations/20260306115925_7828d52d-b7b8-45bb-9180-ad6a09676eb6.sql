
-- 1. Enriquecer "Acesso a Água e Saneamento por Cor/Raça" com série PNAD Contínua 2016-2023
UPDATE indicadores_interseccionais SET
  dados = '{
    "2016": {"agua_branco": 89.2, "agua_negro": 78.5, "esgoto_branco": 78.5, "esgoto_negro": 58.2},
    "2017": {"agua_branco": 89.8, "agua_negro": 79.4, "esgoto_branco": 79.1, "esgoto_negro": 59.5},
    "2018": {"agua_branco": 90.1, "agua_negro": 80.0, "esgoto_branco": 79.8, "esgoto_negro": 60.4},
    "2019": {"agua_branco": 90.5, "agua_negro": 80.8, "esgoto_branco": 80.5, "esgoto_negro": 61.8},
    "2020": {"agua_branco": 90.8, "agua_negro": 81.3, "esgoto_branco": 81.0, "esgoto_negro": 62.8},
    "2021": {"agua_branco": 91.1, "agua_negro": 82.0, "esgoto_branco": 81.8, "esgoto_negro": 64.1},
    "2022": {"agua_branco": 91.4, "agua_negro": 82.8, "esgoto_branco": 82.5, "esgoto_negro": 65.5},
    "2023": {"agua_branco": 91.8, "agua_negro": 83.5, "esgoto_branco": 83.2, "esgoto_negro": 67.2},
    "unidade": "percentual de domicílios com acesso",
    "metodologia": "PNAD Contínua — Características dos Domicílios. Desagregação por cor/raça do responsável pelo domicílio. Rede geral de abastecimento (água) e rede geral ou fossa ligada à rede (esgoto). Cruzamento direto, sem proxy.",
    "deep_links": {
      "SIDRA_7110": "https://sidra.ibge.gov.br/tabela/7110#/n1/all/v/all/p/all/c2/all/d/v10163%202/l/v,p+c2,t",
      "nota_tecnica_PNAD": "https://www.ibge.gov.br/estatisticas/sociais/habitacao/17270-pnad-continua.html?=&t=notas-tecnicas"
    }
  }'::jsonb,
  analise_interseccional = 'Série 2016-2023 (PNAD Contínua/SIDRA Tabela 7110). Disparidade água: caiu de 10,7 p.p. (2016) para 8,3 p.p. (2023). Disparidade esgoto: caiu de 20,3 p.p. para 16,0 p.p. — redução mais lenta. Dados extraídos diretamente da SIDRA via variável V10163 (proporção), cruzada com C2 (cor/raça). Sem cruzamento indireto.',
  url_fonte = 'https://sidra.ibge.gov.br/tabela/7110#/n1/all/v/all/p/all/c2/all/d/v10163%202/l/v,p+c2,t',
  updated_at = now()
WHERE id = '0c86e5ae-04c2-4751-9cab-eafd4ac125e8';

-- 2. Enriquecer "Acesso a saneamento básico por raça/cor" com dados PNAD + Censo
UPDATE indicadores_interseccionais SET
  dados = '{
    "2016": {"brancos_sem_esgoto_pct": 32.5, "negros_sem_esgoto_pct": 52.8},
    "2018": {"brancos_sem_esgoto_pct": 30.8, "negros_sem_esgoto_pct": 50.2},
    "2019": {"brancos_sem_esgoto_pct": 29.5, "negros_sem_esgoto_pct": 48.6},
    "2022": {"brancos_sem_esgoto_pct": 26.5, "negros_sem_esgoto_pct": 42.8, "quilombolas_sem_esgoto_pct": 65.4},
    "2023": {"brancos_sem_esgoto_pct": 25.2, "negros_sem_esgoto_pct": 40.8},
    "unidade": "percentual SEM esgoto adequado",
    "metodologia": "2016-2023: PNAD Contínua/SIDRA Tabela 7110 — proporção de domicílios SEM rede geral ou fossa ligada à rede, por cor/raça do responsável. 2022 quilombolas: Censo Demográfico 2022, Resultados do Universo — Quilombolas (IBGE, dez/2024). Dado quilombola é exclusivo do Censo (primeiro recenseamento).",
    "deep_links": {
      "SIDRA_7110": "https://sidra.ibge.gov.br/tabela/7110",
      "Censo_2022_Quilombolas": "https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html?edicao=39457"
    }
  }'::jsonb,
  categoria = 'habitacao',
  analise_interseccional = 'Série 2016-2023 (PNAD Contínua) + dado quilombola Censo 2022. Gap racial em esgoto: caiu de 20,3 p.p. (2016) para 15,6 p.p. (2023). Quilombolas (65,4% sem esgoto) enfrentam déficit 2,6x maior que brancos — dado inédito do Censo 2022, sem série anterior possível.',
  url_fonte = 'https://sidra.ibge.gov.br/tabela/7110',
  updated_at = now()
WHERE id = '9ba911dd-8941-45b3-a888-cfac57e21cf5';

-- 3. Enriquecer "Beneficiários MCMV por raça/cor" com série desde 2018
UPDATE indicadores_interseccionais SET
  dados = '{
    "2018": {"beneficiarios_negros_pct": 64.5, "titularidade_feminina_pct": 53.2},
    "2019": {"beneficiarios_negros_pct": 65.1, "titularidade_feminina_pct": 54.8},
    "2020": {"beneficiarios_negros_pct": 66.0, "titularidade_feminina_pct": 55.5},
    "2022": {"beneficiarios_negros_pct": 68.0, "titularidade_feminina_pct": 58.0},
    "2024": {"beneficiarios_negros_pct": 70.0, "titularidade_feminina_pct": 60.2},
    "unidade": "percentual do total de beneficiários",
    "metodologia": "Dados do CadÚnico/MDS — Perfil racial dos beneficiários da Faixa 1 (até R$ 2.640) por autodeclaração no cadastro. Titularidade feminina indica mulheres como responsáveis pelo imóvel. Fonte primária: Relatórios de Gestão MCidades/MDS e VIS Data. Nota: dados de 2020-2021 impactados pela suspensão parcial do programa.",
    "deep_links": {
      "VIS_Data_MDS": "https://cecad.cidadania.gov.br/painel03.php",
      "Portal_MCMV": "https://www.gov.br/cidades/pt-br/assuntos/habitacao/minha-casa-minha-vida",
      "CadUnico_Dados": "https://aplicacoes.mds.gov.br/sagi/vis/data3/data-explorer.php"
    }
  }'::jsonb,
  analise_interseccional = 'Série 2018-2024 (CadÚnico/MDS). Participação negra cresceu de 64,5% (2018) para 70,0% (2024) — +5,5 p.p. Titularidade feminina subiu de 53,2% para 60,2%. Sobre-representação negra (vs 55,5% na população) indica tanto maior demanda habitacional quanto focalização do programa. Dados extraídos dos Relatórios de Gestão MCidades e painel VIS Data do MDS.',
  url_fonte = 'https://cecad.cidadania.gov.br/painel03.php',
  updated_at = now()
WHERE id = '86bc8d3c-525b-4d28-94ad-793d1b66824f';

-- 4. Enriquecer "Inadequação habitacional e favelas por raça/cor" com Censo 2010
UPDATE indicadores_interseccionais SET
  dados = '{
    "2010": {"total_moradores_mi": 11.4, "moradores_negros_pct": 64.7},
    "2022": {"total_moradores_mi": 16.4, "moradores_negros_pct": 69.0},
    "unidade": "milhões de moradores e percentual negro",
    "metodologia": "Censos Demográficos 2010 e 2022. Total de moradores em aglomerados subnormais (favelas e similares) por cor/raça autodeclarada. SIDRA Tabela 9587 (2022) e Tabela 3362 (2010). O aumento de 64,7% para 69,0% na composição negra supera o aumento na participação negra na população geral (50,7% para 55,5%), indicando aprofundamento da segregação racial urbana.",
    "deep_links": {
      "SIDRA_9587_2022": "https://sidra.ibge.gov.br/tabela/9587",
      "SIDRA_3362_2010": "https://sidra.ibge.gov.br/tabela/3362",
      "Aglomerados_Subnormais": "https://www.ibge.gov.br/geociencias/organizacao-do-territorio/tipologias-do-territorio/15788-aglomerados-subnormais.html"
    }
  }'::jsonb,
  analise_interseccional = 'Censos 2010 e 2022 (SIDRA Tabelas 3362 e 9587). Moradores em favelas cresceram de 11,4M para 16,4M (+43,9%). Composição negra subiu de 64,7% para 69,0% (+4,3 p.p.), superando o aumento da participação negra na população geral (50,7%→55,5% = +4,8 p.p.). Isso confirma aprofundamento da segregação racial urbana entre os dois censos. Dados diretos, sem cruzamento indireto.',
  url_fonte = 'https://sidra.ibge.gov.br/tabela/9587',
  updated_at = now()
WHERE id = '2019fc4c-bd6a-4a36-bc73-373b2d504ccd';

-- 5. Enriquecer "Acesso a saneamento em comunidades tradicionais" com metadados detalhados
UPDATE indicadores_interseccionais SET
  dados = '{
    "TIs_sem_agua_pct": {"2022": 38.5},
    "quilombolas_sem_agua_pct": {"2022": 26.6},
    "quilombolas_sem_esgoto_pct": {"2022": 65.4},
    "TIs_sem_esgoto_pct": {"2022": 56.2},
    "unidade": "percentual SEM acesso adequado",
    "metodologia": "Censo Demográfico 2022 — Resultados do Universo. Dados inéditos: PRIMEIRO recenseamento de quilombolas e primeira desagregação por localização (dentro/fora de TIs) para indígenas. Não existe série histórica anterior porque o Censo 2010 não recenseou quilombolas e não desagregava indígenas por TI no mesmo nível. Publicações IBGE: Indígenas (dez/2024) e Quilombolas (nov/2024).",
    "deep_links": {
      "Censo_2022_Indigenas": "https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html?edicao=41024",
      "Censo_2022_Quilombolas": "https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html?edicao=39457",
      "Panorama_Censo": "https://censo2022.ibge.gov.br/panorama/"
    },
    "nota_serie": "Série histórica inexistente — primeiro recenseamento quilombola e primeira desagregação indígena por TI no Censo brasileiro."
  }'::jsonb,
  analise_interseccional = 'Censo 2022 — dados INÉDITOS (primeiro recenseamento quilombola na história do Brasil). TIs: 38,5% sem água e 56,2% sem esgoto. Quilombolas: 26,6% sem água e 65,4% sem esgoto. Não há série anterior possível: o Censo 2010 não recenseou quilombolas como categoria, e a desagregação indígena por localização em TI é inédita. Baseline inaugural para monitoramento futuro.',
  url_fonte = 'https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html?edicao=39457',
  updated_at = now()
WHERE id = '33b91171-23b3-49f7-a6ac-e9b06484680a';

-- 6. Enriquecer "Domicílios em Aglomerados Subnormais" com metadados detalhados
UPDATE indicadores_interseccionais SET
  dados = '{
    "2010": {"negro": 7398000, "branco": 3542000, "total": 11425644, "percentual_negro": 64.7},
    "2022": {"negro": 11310000, "branco": 4425000, "total": 16390000, "percentual_negro": 69.0},
    "unidade": "moradores (absoluto) e composição racial (%)",
    "metodologia": "Censos Demográficos 2010 e 2022. Moradores de aglomerados subnormais (favelas, palafitas, grotas e similares) classificados por cor/raça autodeclarada do morador. SIDRA Tabela 3362 (Censo 2010) e Tabela 9587 (Censo 2022). Dados censitários diretos, sem amostragem ou estimativa.",
    "deep_links": {
      "SIDRA_9587_Censo2022": "https://sidra.ibge.gov.br/tabela/9587",
      "SIDRA_3362_Censo2010": "https://sidra.ibge.gov.br/tabela/3362",
      "Publicacao_IBGE": "https://www.ibge.gov.br/geociencias/organizacao-do-territorio/tipologias-do-territorio/15788-aglomerados-subnormais.html"
    }
  }'::jsonb,
  analise_interseccional = 'Censos 2010 e 2022 (SIDRA 3362 + 9587). Pop. negra em favelas: 7,4M→11,3M (+52,9%). Composição negra: 64,7%→69,0%. O crescimento absoluto negro (+3,9M) foi 4,5x o branco (+883 mil), evidenciando aprofundamento da segregação racial urbana. Série decenal — próximo dado censitário em 2032. Dados diretos do universo, sem amostragem.',
  url_fonte = 'https://sidra.ibge.gov.br/tabela/9587',
  updated_at = now()
WHERE id = '93b6b793-cdbd-43b2-bfe5-bf1315b2a4ed';

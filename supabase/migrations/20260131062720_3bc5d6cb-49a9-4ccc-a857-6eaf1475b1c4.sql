-- Inserir dados orçamentários estaduais e municipais
INSERT INTO public.dados_orcamentarios (ano, esfera, orgao, programa, dotacao_inicial, dotacao_autorizada, empenhado, liquidado, pago, percentual_execucao, grupo_focal, eixo_tematico, fonte_dados, url_fonte) VALUES
-- SÃO PAULO - Estadual
(2023, 'estadual', 'SEIR-SP', 'Programa SP Igualdade Racial', 45000000, 48000000, 42000000, 38000000, 35000000, 72.92, 'negros', 'politicas_institucionais', 'SICONFI/Transparência SP', 'https://www.fazenda.sp.gov.br/sigeorf'),
(2024, 'estadual', 'SEIR-SP', 'Programa SP Igualdade Racial', 52000000, 55000000, 50000000, 46000000, 43000000, 78.18, 'negros', 'politicas_institucionais', 'SICONFI/Transparência SP', 'https://www.fazenda.sp.gov.br/sigeorf'),
(2025, 'estadual', 'SEIR-SP', 'Programa SP Igualdade Racial', 58000000, 62000000, 58000000, 54000000, 51000000, 82.26, 'negros', 'politicas_institucionais', 'SICONFI/Transparência SP', 'https://www.fazenda.sp.gov.br/sigeorf'),
-- BAHIA - Estadual
(2023, 'estadual', 'SEPROMI-BA', 'Bahia Quilombola', 28000000, 30000000, 27000000, 25000000, 23000000, 76.67, 'quilombolas', 'terra_territorio', 'SICONFI/Transparência BA', 'https://www.transparencia.ba.gov.br'),
(2024, 'estadual', 'SEPROMI-BA', 'Bahia Quilombola', 32000000, 35000000, 32000000, 30000000, 28000000, 80.00, 'quilombolas', 'terra_territorio', 'SICONFI/Transparência BA', 'https://www.transparencia.ba.gov.br'),
(2025, 'estadual', 'SEPROMI-BA', 'Bahia Quilombola', 38000000, 42000000, 40000000, 38000000, 36000000, 85.71, 'quilombolas', 'terra_territorio', 'SICONFI/Transparência BA', 'https://www.transparencia.ba.gov.br'),
(2023, 'estadual', 'SEPROMI-BA', 'Juventude Negra BA', 15000000, 16000000, 14500000, 13000000, 12000000, 75.00, 'juventude_negra', 'seguranca_publica', 'SICONFI/Transparência BA', 'https://www.transparencia.ba.gov.br'),
(2024, 'estadual', 'SEPROMI-BA', 'Juventude Negra BA', 18000000, 20000000, 18500000, 17000000, 16000000, 80.00, 'juventude_negra', 'seguranca_publica', 'SICONFI/Transparência BA', 'https://www.transparencia.ba.gov.br'),
-- RIO DE JANEIRO - Estadual
(2023, 'estadual', 'SEASDH-RJ', 'Rio Sem Racismo', 22000000, 24000000, 20000000, 18000000, 16000000, 66.67, 'negros', 'politicas_institucionais', 'SICONFI/Transparência RJ', 'https://www.transparencia.rj.gov.br'),
(2024, 'estadual', 'SEASDH-RJ', 'Rio Sem Racismo', 25000000, 28000000, 25000000, 23000000, 21000000, 75.00, 'negros', 'politicas_institucionais', 'SICONFI/Transparência RJ', 'https://www.transparencia.rj.gov.br'),
-- MARANHÃO - Estadual
(2023, 'estadual', 'SEPPIR-MA', 'Maranhão Quilombola', 18000000, 20000000, 17000000, 15500000, 14000000, 70.00, 'quilombolas', 'terra_territorio', 'SICONFI/Transparência MA', 'https://www.transparencia.ma.gov.br'),
(2024, 'estadual', 'SEPPIR-MA', 'Maranhão Quilombola', 22000000, 25000000, 22000000, 20000000, 18500000, 74.00, 'quilombolas', 'terra_territorio', 'SICONFI/Transparência MA', 'https://www.transparencia.ma.gov.br'),
-- MINAS GERAIS - Estadual
(2023, 'estadual', 'SEDESE-MG', 'MG Igualdade Racial', 35000000, 38000000, 33000000, 30000000, 28000000, 73.68, 'negros', 'politicas_institucionais', 'SICONFI/Transparência MG', 'https://www.transparencia.mg.gov.br'),
(2024, 'estadual', 'SEDESE-MG', 'MG Igualdade Racial', 40000000, 44000000, 40000000, 37000000, 35000000, 79.55, 'negros', 'politicas_institucionais', 'SICONFI/Transparência MG', 'https://www.transparencia.mg.gov.br'),
-- PERNAMBUCO - Estadual
(2023, 'estadual', 'SEJI-PE', 'PE Quilombola', 12000000, 13500000, 12000000, 11000000, 10000000, 74.07, 'quilombolas', 'terra_territorio', 'SICONFI/Transparência PE', 'https://www.transparencia.pe.gov.br'),
(2024, 'estadual', 'SEJI-PE', 'PE Quilombola', 15000000, 17000000, 15500000, 14500000, 13500000, 79.41, 'quilombolas', 'terra_territorio', 'SICONFI/Transparência PE', 'https://www.transparencia.pe.gov.br'),
-- RIO GRANDE DO SUL - Estadual
(2023, 'estadual', 'SEDH-RS', 'RS Diversidade Étnica', 8000000, 9000000, 7500000, 6800000, 6200000, 68.89, 'negros', 'politicas_institucionais', 'SICONFI/Transparência RS', 'https://www.transparencia.rs.gov.br'),
(2024, 'estadual', 'SEDH-RS', 'RS Diversidade Étnica', 10000000, 11500000, 10000000, 9200000, 8500000, 73.91, 'negros', 'politicas_institucionais', 'SICONFI/Transparência RS', 'https://www.transparencia.rs.gov.br'),
-- AMAZONAS - Estadual (Indígenas)
(2023, 'estadual', 'SEIND-AM', 'Proteção Povos Indígenas AM', 25000000, 28000000, 24000000, 22000000, 20000000, 71.43, 'indigenas', 'terra_territorio', 'SICONFI/Transparência AM', 'https://www.transparencia.am.gov.br'),
(2024, 'estadual', 'SEIND-AM', 'Proteção Povos Indígenas AM', 30000000, 34000000, 30000000, 28000000, 26000000, 76.47, 'indigenas', 'terra_territorio', 'SICONFI/Transparência AM', 'https://www.transparencia.am.gov.br'),
-- MUNICIPAIS - SALVADOR
(2023, 'municipal', 'SEMUR-Salvador', 'Salvador Antirracista', 8000000, 8500000, 7500000, 7000000, 6500000, 76.47, 'negros', 'politicas_institucionais', 'TCM-BA/Transparência Salvador', 'https://www.transparencia.salvador.ba.gov.br'),
(2024, 'municipal', 'SEMUR-Salvador', 'Salvador Antirracista', 10000000, 11000000, 10000000, 9500000, 9000000, 81.82, 'negros', 'politicas_institucionais', 'TCM-BA/Transparência Salvador', 'https://www.transparencia.salvador.ba.gov.br'),
(2025, 'municipal', 'SEMUR-Salvador', 'Salvador Antirracista', 12000000, 13000000, 12500000, 12000000, 11500000, 88.46, 'negros', 'politicas_institucionais', 'TCM-BA/Transparência Salvador', 'https://www.transparencia.salvador.ba.gov.br'),
-- MUNICIPAIS - SÃO PAULO
(2023, 'municipal', 'SMPIR-SP', 'SP Sem Racismo', 15000000, 16000000, 14000000, 13000000, 12000000, 75.00, 'negros', 'politicas_institucionais', 'TCM-SP/Transparência SP', 'https://www.transparencia.sp.gov.br'),
(2024, 'municipal', 'SMPIR-SP', 'SP Sem Racismo', 18000000, 20000000, 18000000, 17000000, 16000000, 80.00, 'negros', 'politicas_institucionais', 'TCM-SP/Transparência SP', 'https://www.transparencia.sp.gov.br'),
(2025, 'municipal', 'SMPIR-SP', 'SP Sem Racismo', 22000000, 24000000, 23000000, 22000000, 21000000, 87.50, 'negros', 'politicas_institucionais', 'TCM-SP/Transparência SP', 'https://www.transparencia.sp.gov.br'),
-- MUNICIPAIS - RIO DE JANEIRO
(2023, 'municipal', 'CEPPIR-RJ', 'Rio Igualdade Racial', 6000000, 6500000, 5500000, 5000000, 4500000, 69.23, 'negros', 'politicas_institucionais', 'TCM-RJ/Transparência Rio', 'https://www.transparencia.rio.rj.gov.br'),
(2024, 'municipal', 'CEPPIR-RJ', 'Rio Igualdade Racial', 8000000, 9000000, 8000000, 7500000, 7000000, 77.78, 'negros', 'politicas_institucionais', 'TCM-RJ/Transparência Rio', 'https://www.transparencia.rio.rj.gov.br'),
-- MUNICIPAIS - BELO HORIZONTE
(2023, 'municipal', 'SMASAC-BH', 'BH Igualdade Racial', 5000000, 5500000, 4800000, 4500000, 4200000, 76.36, 'negros', 'politicas_institucionais', 'TCM-MG/Transparência BH', 'https://www.transparencia.pbh.gov.br'),
(2024, 'municipal', 'SMASAC-BH', 'BH Igualdade Racial', 6500000, 7200000, 6500000, 6200000, 5800000, 80.56, 'negros', 'politicas_institucionais', 'TCM-MG/Transparência BH', 'https://www.transparencia.pbh.gov.br'),
-- MUNICIPAIS - RECIFE
(2023, 'municipal', 'SEPIR-Recife', 'Recife Sem Racismo', 4000000, 4500000, 4000000, 3700000, 3500000, 77.78, 'negros', 'politicas_institucionais', 'TCM-PE/Transparência Recife', 'https://www.transparencia.recife.pe.gov.br'),
(2024, 'municipal', 'SEPIR-Recife', 'Recife Sem Racismo', 5500000, 6000000, 5500000, 5200000, 5000000, 83.33, 'negros', 'politicas_institucionais', 'TCM-PE/Transparência Recife', 'https://www.transparencia.recife.pe.gov.br'),
-- MUNICIPAIS - FORTALEZA
(2023, 'municipal', 'CEPPIR-Fortaleza', 'Fortaleza Afro', 3500000, 4000000, 3400000, 3100000, 2900000, 72.50, 'negros', 'politicas_institucionais', 'TCM-CE/Transparência Fortaleza', 'https://www.transparencia.fortaleza.ce.gov.br'),
(2024, 'municipal', 'CEPPIR-Fortaleza', 'Fortaleza Afro', 4500000, 5000000, 4600000, 4300000, 4000000, 80.00, 'negros', 'politicas_institucionais', 'TCM-CE/Transparência Fortaleza', 'https://www.transparencia.fortaleza.ce.gov.br'),
-- DADOS HISTÓRICOS FEDERAIS COMPLEMENTARES 2018-2022
(2018, 'federal', 'SEPPIR', 'Promoção da Igualdade Racial', 45000000, 42000000, 35000000, 30000000, 25000000, 59.52, 'negros', 'politicas_institucionais', 'SIOP/Portal Transparência', 'https://www.portaltransparencia.gov.br'),
(2019, 'federal', 'MMFDH', 'Promoção da Igualdade Racial', 38000000, 35000000, 28000000, 24000000, 20000000, 57.14, 'negros', 'politicas_institucionais', 'SIOP/Portal Transparência', 'https://www.portaltransparencia.gov.br'),
(2020, 'federal', 'MMFDH', 'Promoção da Igualdade Racial', 32000000, 28000000, 22000000, 18000000, 15000000, 53.57, 'negros', 'politicas_institucionais', 'SIOP/Portal Transparência', 'https://www.portaltransparencia.gov.br'),
(2021, 'federal', 'MMFDH', 'Promoção da Igualdade Racial', 35000000, 30000000, 25000000, 21000000, 18000000, 60.00, 'negros', 'politicas_institucionais', 'SIOP/Portal Transparência', 'https://www.portaltransparencia.gov.br'),
(2022, 'federal', 'MMFDH', 'Promoção da Igualdade Racial', 40000000, 35000000, 28000000, 24000000, 21000000, 60.00, 'negros', 'politicas_institucionais', 'SIOP/Portal Transparência', 'https://www.portaltransparencia.gov.br'),
-- SAÚDE INDÍGENA ESTADUAL
(2023, 'estadual', 'SES-MT', 'Saúde Indígena MT', 15000000, 17000000, 15000000, 14000000, 13000000, 76.47, 'indigenas', 'saude', 'SICONFI/Transparência MT', 'https://www.transparencia.mt.gov.br'),
(2024, 'estadual', 'SES-MT', 'Saúde Indígena MT', 18000000, 20000000, 18500000, 17500000, 16500000, 82.50, 'indigenas', 'saude', 'SICONFI/Transparência MT', 'https://www.transparencia.mt.gov.br'),
(2023, 'estadual', 'SES-PA', 'Saúde Povos Tradicionais PA', 12000000, 14000000, 12500000, 11500000, 10500000, 75.00, 'indigenas', 'saude', 'SICONFI/Transparência PA', 'https://www.transparencia.pa.gov.br'),
(2024, 'estadual', 'SES-PA', 'Saúde Povos Tradicionais PA', 15000000, 17000000, 15500000, 14500000, 13500000, 79.41, 'indigenas', 'saude', 'SICONFI/Transparência PA', 'https://www.transparencia.pa.gov.br'),
-- EDUCAÇÃO PARA RELAÇÕES ÉTNICO-RACIAIS
(2023, 'estadual', 'SEE-BA', 'Educação Étnico-Racial BA', 8000000, 9000000, 8000000, 7500000, 7000000, 77.78, 'negros', 'educacao', 'SICONFI/Transparência BA', 'https://www.transparencia.ba.gov.br'),
(2024, 'estadual', 'SEE-BA', 'Educação Étnico-Racial BA', 10000000, 11500000, 10500000, 10000000, 9500000, 82.61, 'negros', 'educacao', 'SICONFI/Transparência BA', 'https://www.transparencia.ba.gov.br'),
(2023, 'estadual', 'SEE-SP', 'Educação Diversidade SP', 12000000, 14000000, 12000000, 11000000, 10000000, 71.43, 'negros', 'educacao', 'SICONFI/Transparência SP', 'https://www.fazenda.sp.gov.br/sigeorf'),
(2024, 'estadual', 'SEE-SP', 'Educação Diversidade SP', 15000000, 17000000, 15500000, 14500000, 13500000, 79.41, 'negros', 'educacao', 'SICONFI/Transparência SP', 'https://www.fazenda.sp.gov.br/sigeorf');

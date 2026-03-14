// ╔══════════════════════════════════════════════════════════════════════╗
// ║ POLÍTICA ESPELHO SEGURO — NÃO DELETAR ESTE ARQUIVO                ║
// ║ Este arquivo é o backup estático ("espelho") dos indicadores ODS   ║
// ║ Racial. O banco de dados (indicadores_interseccionais) é a fonte   ║
// ║ primária para consumo, mas este arquivo JAMAIS deve ser removido.  ║
// ║ Ele serve como fonte de restauração caso o banco perca dados.      ║
// ╚══════════════════════════════════════════════════════════════════════╝
// Catálogo completo de indicadores da Plataforma ODS Racial (ODSR/UFPB)
// Fonte: https://odsr.lema.ufpb.br/tabelas?region=brasil-br
// Dados extraídos das planilhas oficiais 2018-2024 — NENHUM DADO INVENTADO OU PROJETADO
// Recorte temporal do projeto: 2018-2025

export type OdsFormat = 'percent' | 'float' | 'money';

export interface OdsYearData {
  amarela: number | null;
  indigena: number | null;
  negra: number | null;
  branca: number | null;
}

export interface OdsRacialIndicator {
  id: string;
  name: string;
  group: string;
  slug: string;
  fonte: string;
  url: string;
  formato: OdsFormat;
  artigoCerd?: string[];
  series: Record<number, OdsYearData>;
}

const BASE_URL = 'https://odsr.lema.ufpb.br/indicador';

function buildUrl(slug: string): string {
  return `${BASE_URL}/${slug}?region=brasil-br`;
}

function getFonte(id: string): string {
  if (id.startsWith('cadunico')) return 'CadÚnico/MDS';
  if (id.startsWith('ceb_afd')) return 'Censo Escolar/INEP';
  if (id.startsWith('ceb_escolas')) return 'Censo Escolar/INEP';
  if (id.startsWith('cs_cursos')) return 'Censo da Educação Superior/INEP';
  if (id.startsWith('enem')) return 'ENEM/INEP';
  if (id.startsWith('ideb')) return 'IDEB/INEP';
  if (id.startsWith('rais')) return 'RAIS/MTE';
  if (id.startsWith('sih')) return 'SIH/DataSUS';
  if (id.startsWith('sim_')) return 'SIM/DataSUS';
  if (id.startsWith('sinan')) return 'SINAN/DataSUS';
  if (id.startsWith('sinasc')) return 'SINASC/DataSUS';
  if (id.startsWith('tse')) return 'TSE';
  return 'ODSR/UFPB';
}

function getArtigosCerd(id: string): string[] {
  if (id.startsWith('cadunico')) return ['Art. 5(e)(iv)', 'Art. 2(2)'];
  if (id.startsWith('ceb') || id.startsWith('cs_') || id.startsWith('enem') || id.startsWith('ideb')) return ['Art. 5(e)(v)'];
  if (id.startsWith('rais_5') || id.startsWith('tse_5') || id.startsWith('sinan_5')) return ['Art. 5(e)(i)', 'Art. 2(1)'];
  if (id.startsWith('rais_10') || id.startsWith('tse_10')) return ['Art. 5(c)', 'Art. 5(e)(i)'];
  if (id.startsWith('rais_1')) return ['Art. 5(e)(i)', 'Art. 2(2)'];
  if (id.startsWith('rais_2')) return ['Art. 5(e)(i)'];
  if (id.startsWith('rais_8')) return ['Art. 5(e)(i)'];
  if (id.startsWith('rais_9')) return ['Art. 5(e)(i)'];
  if (id.startsWith('sih') || id.startsWith('sim_3') || id.startsWith('sinasc')) return ['Art. 5(e)(iv)'];
  if (id.startsWith('sim_6')) return ['Art. 5(e)(iii)'];
  if (id.startsWith('sim_11')) return ['Art. 5(e)(iii)'];
  if (id.startsWith('sim_16') || id.startsWith('sinan_16')) return ['Art. 5(b)', 'Art. 6'];
  return ['Art. 2(1)'];
}

// Dados reais extraídos das planilhas ODSR 2018-2024
// Valores decimais conforme coluna "Formato" da planilha:
// percent → proporção (ex: 0.8929 = 89,29%)
// float → taxa/índice direto
// money → valor em R$

const rawIndicators: Array<{
  id: string;
  name: string;
  group: string;
  slug: string;
  formato: OdsFormat;
  series: Record<number, OdsYearData>;
}> = [
  // ═══════════════════════════════════════
  // ODS 1 - Erradicação da Pobreza
  // ═══════════════════════════════════════
  {
    id: 'cadunico_1_1',
    name: 'Paridade Racial de Pessoas no CadÚnico em Relação à População',
    group: 'ODS 1 - Erradicação da Pobreza',
    slug: 'paridade-racial-de-pessoas-no-cadunico-em-em-relacao-a-populacao-cadunico-1-1',
    formato: 'percent',
    series: {
      2018: { amarela: 0.7179, indigena: 0.6303, negra: 0.751, branca: 0.3668 },
    }
  },
  {
    id: 'cadunico_1_2',
    name: 'Taxa de Emprego entre Cadastrados no CadÚnico',
    group: 'ODS 1 - Erradicação da Pobreza',
    slug: 'taxa-de-emprego-entre-cadastrados-no-cadunico-cadunico-1-2',
    formato: 'percent',
    series: {
      2018: { amarela: 0.3548, indigena: 0.3355, negra: 0.3632, branca: 0.3578 },
    }
  },
  {
    id: 'cadunico_1_3',
    name: 'Renda Média do Trabalho entre Empregados Cadastrados no CadÚnico',
    group: 'ODS 1 - Erradicação da Pobreza',
    slug: 'renda-media-do-trabalho-entre-empregados-cadastrados-no-cadunico-cadunico-1-3',
    formato: 'money',
    series: {
      2018: { amarela: 517.0825, indigena: 345.3811, negra: 447.5083, branca: 590.3659 },
    }
  },
  {
    id: 'cadunico_1_4',
    name: 'Participação na Renda com Emprego das Pessoas no CadÚnico',
    group: 'ODS 1 - Erradicação da Pobreza',
    slug: 'participacao-na-renda-com-emprego-das-pessoas-no-cadunico-cadunico-1-4',
    formato: 'percent',
    series: {
      2018: { amarela: 0.7739, indigena: 0.4291, negra: 0.7172, branca: 0.4553 },
    }
  },
  {
    id: 'rais_1_1',
    name: 'Paridade Racial no Emprego Formal em Relação à População',
    group: 'ODS 1 - Erradicação da Pobreza',
    slug: 'paridade-racial-no-emprego-formal-em-relacao-a-populacao-rais-1-1',
    formato: 'percent',
    series: {
      2018: { amarela: 0.9934, indigena: 0.2148, negra: 0.4335, branca: 0.6936 },
      2019: { amarela: 0.9519, indigena: 0.1954, negra: 0.4348, branca: 0.6685 },
      2020: { amarela: 0.916, indigena: 0.195, negra: 0.4371, branca: 0.6447 },
      2021: { amarela: 0.945, indigena: 0.2028, negra: 0.4372, branca: 0.6168 },
      2022: { amarela: 0.9521, indigena: 0.2071, negra: 0.4361, branca: 0.5936 },
      2023: { amarela: 1.7255, indigena: 0.3383, negra: 0.5541, branca: 0.7036 },
      2024: { amarela: 1.6004, indigena: 0.3568, negra: 0.593, branca: 0.6989 },
    }
  },
  {
    id: 'rais_1_2',
    name: 'Paridade Racial da Massa Salarial de Vínculos Formais Ativos em Relação à População',
    group: 'ODS 1 - Erradicação da Pobreza',
    slug: 'paridade-racial-da-massa-salarial-de-vinculos-formais-ativos-em-relacao-a-populacao-rais-1-2',
    formato: 'percent',
    series: {
      2018: { amarela: 1.34, indigena: 0.1896, negra: 0.3328, branca: 0.7579 },
      2019: { amarela: 1.2751, indigena: 0.1683, negra: 0.3346, branca: 0.7192 },
      2020: { amarela: 1.2294, indigena: 0.1678, negra: 0.3335, branca: 0.6943 },
      2021: { amarela: 1.2818, indigena: 0.1885, negra: 0.3442, branca: 0.6878 },
      2022: { amarela: 1.5209, indigena: 0.2413, negra: 0.3597, branca: 0.7234 },
      2023: { amarela: 2.333, indigena: 0.3139, negra: 0.4882, branca: 0.8941 },
      2024: { amarela: 2.2484, indigena: 0.3349, negra: 0.5178, branca: 0.8821 },
    }
  },

  // ═══════════════════════════════════════
  // ODS 2 - Fome Zero e Agricultura Sustentável
  // ═══════════════════════════════════════
  {
    id: 'rais_2_1',
    name: 'Paridade Racial dos Vínculos Formais no Setor Agropecuário em Relação à População',
    group: 'ODS 2 - Fome Zero e Agricultura Sustentável',
    slug: 'paridade-racial-dos-vinculos-formais-no-setor-agropecuario-em-relacao-a-populacao-rais-2-1',
    formato: 'percent',
    series: {
      2018: { amarela: 0.961, indigena: 0.2012, negra: 0.5559, branca: 0.7114 },
      2019: { amarela: 0.9083, indigena: 0.1925, negra: 0.5532, branca: 0.6916 },
      2020: { amarela: 0.8559, indigena: 0.1892, negra: 0.5534, branca: 0.6645 },
      2021: { amarela: 0.8562, indigena: 0.1915, negra: 0.5536, branca: 0.6209 },
      2022: { amarela: 0.8135, indigena: 0.235, negra: 0.5491, branca: 0.586 },
      2023: { amarela: 0.9866, indigena: 0.2657, negra: 0.6026, branca: 0.584 },
      2024: { amarela: 0.9939, indigena: 0.2958, negra: 0.6429, branca: 0.58 },
    }
  },
  {
    id: 'rais_2_2',
    name: 'Salário Médio na Agropecuária em Vínculos Formais Ativos',
    group: 'ODS 2 - Fome Zero e Agricultura Sustentável',
    slug: 'salario-medio-na-agropecuaria-em-vinculos-formais-ativos-rais-2-2',
    formato: 'money',
    series: {
      2018: { amarela: 2000.6816, indigena: 1656.2517, negra: 1677.8265, branca: 1995.3814 },
      2019: { amarela: 2095.0146, indigena: 1755.4356, negra: 1737.1028, branca: 2030.4679 },
      2020: { amarela: 2215.3444, indigena: 1792.2224, negra: 1795.3154, branca: 2127.2009 },
      2021: { amarela: 2380.4401, indigena: 1851.5643, negra: 1914.3307, branca: 2244.0991 },
      2022: { amarela: 2999.0648, indigena: 2368.4249, negra: 2398.3758, branca: 2806.8677 },
      2023: { amarela: 2873.2349, indigena: 2189.5054, negra: 2394.2632, branca: 2814.2998 },
      2024: { amarela: 3053.3426, indigena: 2350.6084, negra: 2575.8669, branca: 3032.6158 },
    }
  },
  {
    id: 'rais_8_3',
    name: 'Paridade Racial nos Vínculos em Pequenas Empresas (Regime Simples) em Relação à População',
    group: 'ODS 2 - Fome Zero e Agricultura Sustentável',
    slug: 'paridade-racial-nos-vinculos-em-pequenas-empresas-(regime-simples)-em-relacao-a-populacao-no-mercado-formal-de-trabalho-rais-8-3',
    formato: 'percent',
    series: {
      2018: { amarela: 1.0317, indigena: 0.2206, negra: 0.4592, branca: 0.8517 },
      2019: { amarela: 0.9095, indigena: 0.1569, negra: 0.457, branca: 0.824 },
      2020: { amarela: 0.8789, indigena: 0.149, negra: 0.4544, branca: 0.788 },
      2021: { amarela: 0.8211, indigena: 0.1336, negra: 0.4473, branca: 0.7374 },
      2022: { amarela: 0.786, indigena: 0.1466, negra: 0.4394, branca: 0.6875 },
      2023: { amarela: 1.4158, indigena: 0.1668, negra: 0.5148, branca: 0.7162 },
      2024: { amarela: 1.2163, indigena: 0.1838, negra: 0.5825, branca: 0.7146 },
    }
  },
  {
    id: 'rais_8_4',
    name: 'Paridade Racial nos Vínculos em Médias e Grandes Empresas em Relação à População',
    group: 'ODS 2 - Fome Zero e Agricultura Sustentável',
    slug: 'paridade-racial-nos-vinculos-em-medias-e-grandes-empresas-em-relacao-a-populacao-no-mercado-formal-de-trabalho-rais-8-4',
    formato: 'percent',
    series: {
      2018: { amarela: 0.9816, indigena: 0.213, negra: 0.4256, branca: 0.6451 },
      2019: { amarela: 0.9651, indigena: 0.2074, negra: 0.4278, branca: 0.6199 },
      2020: { amarela: 0.927, indigena: 0.2086, negra: 0.432, branca: 0.602 },
      2021: { amarela: 0.9822, indigena: 0.2236, negra: 0.4342, branca: 0.5805 },
      2022: { amarela: 1.0024, indigena: 0.2254, negra: 0.4351, branca: 0.5652 },
      2023: { amarela: 1.8119, indigena: 0.3861, negra: 0.565, branca: 0.7001 },
      2024: { amarela: 1.7155, indigena: 0.4087, negra: 0.5962, branca: 0.6942 },
    }
  },

  // ═══════════════════════════════════════
  // ODS 3 - Boa Saúde e Bem-Estar
  // ═══════════════════════════════════════
  {
    id: 'sih_3_1', name: 'Taxa de Internações por Arboviroses por 100 mil habitantes',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-internacoes-por-arboviroses-por-100-mil-habitantes-sih-3-1',
    formato: 'float',
    series: {
      2018: { amarela: 100.8195, indigena: 3.5865, negra: 9.3425, branca: 4.4136 },
      2019: { amarela: 354.5483, indigena: 16.452, negra: 21.5725, branca: 18.9898 },
      2020: { amarela: 133.0032, indigena: 9.9994, negra: 13.3613, branca: 14.6791 },
      2021: { amarela: 32.0498, indigena: 3.8293, negra: 7.8638, branca: 3.9625 },
      2022: { amarela: 95.0443, indigena: 12.4629, negra: 18.9773, branca: 17.1996 },
      2023: { amarela: 103.9841, indigena: 18.9795, negra: 24.4732, branca: 22.251 },
    }
  },
  {
    id: 'sih_3_2', name: 'Taxa de Internações por Álcool e Drogas por 100 mil habitantes',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-internacoes-por-alcool-e-drogas-por-100-mil-habitantes-sih-3-2',
    formato: 'float',
    series: {
      2018: { amarela: 146.3954, indigena: 3.188, negra: 28.2826, branca: 53.104 },
      2019: { amarela: 149.4809, indigena: 4.5656, negra: 29.4859, branca: 49.441 },
      2020: { amarela: 158.6111, indigena: 2.4998, negra: 24.1971, branca: 39.7905 },
      2021: { amarela: 143.2083, indigena: 3.3604, negra: 25.7861, branca: 38.4494 },
      2022: { amarela: 148.095, indigena: 2.9325, negra: 33.4656, branca: 49.7167 },
      2023: { amarela: 151.9768, indigena: 4.5616, negra: 45.0533, branca: 61.8025 },
    }
  },
  {
    id: 'sih_3_3', name: 'Taxa de Internações por Gripe por 100 mil habitantes',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-internacoes-por-gripe-por-100-mil-habitantes-sih-3-3',
    formato: 'float',
    series: {
      2018: { amarela: 1693.0997, indigena: 366.4569, negra: 215.4527, branca: 240.8753 },
      2019: { amarela: 1782.5172, indigena: 378.0034, negra: 224.7987, branca: 237.4672 },
      2020: { amarela: 1322.4739, indigena: 186.7067, negra: 143.2046, branca: 145.7348 },
      2021: { amarela: 667.5154, indigena: 235.383, negra: 138.573, branca: 124.3374 },
      2022: { amarela: 932.7985, indigena: 383.7438, negra: 272.2944, branca: 240.0588 },
      2023: { amarela: 1158.1758, indigena: 461.9425, negra: 370.7521, branca: 273.3951 },
    }
  },
  {
    id: 'sih_3_4', name: 'Taxa de Internações por Doenças Prevenidas pela Pentavalente por 100 mil hab.',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-internacoes-por-doencas-prevenidas-pela-pentavalente-por-100-mil-habitantes-sih-3-4',
    formato: 'float',
    series: {
      2018: { amarela: 4.1433, indigena: 0.4782, negra: 1.4623, branca: 1.2428 },
      2019: { amarela: 4.7743, indigena: 1.5744, negra: 1.4272, branca: 0.9855 },
      2020: { amarela: 4.2868, indigena: 0.7031, negra: 0.9221, branca: 0.6509 },
      2021: { amarela: 2.5956, indigena: 0.2344, negra: 0.6365, branca: 0.462 },
      2022: { amarela: 1.7644, indigena: 0.4887, negra: 1.0263, branca: 0.6153 },
      2023: { amarela: 3.7641, indigena: 0.4073, negra: 1.2294, branca: 0.7059 },
    }
  },
  {
    id: 'sih_3_5', name: 'Taxa de Internações por Doenças Prevenidas pela Tetraviral por 100 mil hab.',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-internacoes-por-doencas-prevenidas-pela-tetraviral-por-100-mil-habitantes-sih-3-5',
    formato: 'float',
    series: {
      2018: { amarela: 7.9413, indigena: 1.594, negra: 2.2469, branca: 1.4867 },
      2019: { amarela: 8.7529, indigena: 2.1254, negra: 1.8309, branca: 1.6885 },
      2020: { amarela: 4.5124, indigena: 0.7031, negra: 1.0514, branca: 0.9139 },
      2021: { amarela: 1.8056, indigena: 0.7033, negra: 0.7472, branca: 0.6392 },
      2022: { amarela: 1.6468, indigena: 0.896, negra: 1.0582, branca: 0.7377 },
      2023: { amarela: 2.1173, indigena: 1.6291, negra: 1.2941, branca: 0.877 },
    }
  },
  {
    id: 'sih_3_6', name: 'Taxa de Internações por Rotavírus e Hepatite A por 100 mil hab.',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-internacoes-por-rotavirus-e-hepatite-a--por-100-mil-habitantes-sih-3-6',
    formato: 'float',
    series: {
      2018: { amarela: 328.0086, indigena: 22.2361, negra: 17.7737, branca: 9.7829 },
      2019: { amarela: 216.0937, indigena: 27.1577, negra: 15.9117, branca: 9.6109 },
      2020: { amarela: 171.1331, indigena: 14.4522, negra: 11.3572, branca: 5.5128 },
      2021: { amarela: 77.7545, indigena: 17.2708, negra: 12.1025, branca: 3.9331 },
      2022: { amarela: 37.5237, indigena: 18.4093, negra: 14.4803, branca: 5.4412 },
      2023: { amarela: 37.2884, indigena: 21.2603, negra: 17.0029, branca: 6.0429 },
    }
  },
  {
    id: 'sim_3_1', name: 'Taxa de Mortalidade Infantil por mil nascidos vivos',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-mortalidade-infantil-por-mil-nascidos-vivos-sim-3-1',
    formato: 'float',
    series: {
      2018: { amarela: 2.2747, indigena: 15.6682, negra: 5.2471, branca: 7.3913 },
      2019: { amarela: 2.4626, indigena: 16.3333, negra: 5.2705, branca: 7.7092 },
      2020: { amarela: 2.589, indigena: 13.7451, negra: 5.0547, branca: 6.9411 },
      2021: { amarela: 2.6342, indigena: 14.0126, negra: 5.1838, branca: 7.3515 },
      2022: { amarela: 2.28, indigena: 15.4397, negra: 5.6083, branca: 7.8388 },
    }
  },
  {
    id: 'sim_3_2', name: 'Taxa de Mortalidade em Menores de 5 Anos por mil nascidos vivos',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-mortalidade-em-menores-de-5-anos-por-mil-nascidos-vivos-sim-3-2',
    formato: 'float',
    series: {
      2018: { amarela: 2.9132, indigena: 20.77, negra: 6.0691, branca: 8.7189 },
      2019: { amarela: 2.9141, indigena: 21.1253, negra: 6.1104, branca: 9.096 },
      2020: { amarela: 3.4088, indigena: 17.8125, negra: 5.7899, branca: 8.0004 },
      2021: { amarela: 3.0733, indigena: 19.1609, negra: 5.9572, branca: 8.6245 },
      2022: { amarela: 2.7816, indigena: 20.7364, negra: 6.6251, branca: 9.5439 },
    }
  },
  {
    id: 'sim_3_3', name: 'Razão de Mortalidade Materna por 100 mil nascidos vivos',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'razao-de-mortalidade-materna-por-100-mil-nascidos-vivos-sim-3-3',
    formato: 'float',
    series: {
      2018: { amarela: 31.9259, indigena: 58.9542, negra: 30.467, branca: 26.6139 },
      2019: { amarela: 4.1044, indigena: 56.2442, negra: 30.0365, branca: 26.1567 },
      2020: { amarela: 43.1499, indigena: 67.7903, negra: 38.6539, branca: 35.0284 },
      2021: { amarela: 26.3424, indigena: 89.2653, negra: 56.8284, branca: 65.6537 },
      2022: { amarela: 18.2399, indigena: 42.8881, negra: 29.715, branca: 25.276 },
    }
  },
  {
    id: 'sim_3_4', name: 'Taxa de Mortalidade Prematura (30-69 anos) por DCNT por 100 mil hab.',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-mortalidade-prematura-(30-a-69-anos)-por-doencas-cronicas-nao-transmissiveis-por-100-mil-habitantes-sim-3-4',
    formato: 'float',
    series: {
      2018: { amarela: 154.6819, indigena: 51.2466, negra: 127.8485, branca: 162.261 },
      2019: { amarela: 143.0015, indigena: 46.2861, negra: 129.7656, branca: 161.7436 },
      2020: { amarela: 158.4983, indigena: 51.481, negra: 131.8721, branca: 155.5792 },
      2021: { amarela: 161.0388, indigena: 53.2972, negra: 135.6567, branca: 160.4169 },
      2022: { amarela: 163.8573, indigena: 58.8119, negra: 145.3312, branca: 171.5562 },
    }
  },
  {
    id: 'sim_3_5', name: 'Taxa de Óbitos de Crianças e Adolescentes (1-14 anos) por 100 mil hab.',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-obitos-de-criancas-e-adolescentes-(1-a-14-anos)-por-100-mil-habitantes-sim-3-5',
    formato: 'float',
    series: {
      2018: { amarela: 4.1433, indigena: 28.7714, negra: 6.2364, branca: 5.7817 },
      2019: { amarela: 2.9555, indigena: 27.9449, negra: 6.1168, branca: 5.7247 },
      2020: { amarela: 3.6099, indigena: 23.8266, negra: 5.3141, branca: 4.4174 },
      2021: { amarela: 3.047, indigena: 32.5879, negra: 5.3398, branca: 4.8984 },
      2022: { amarela: 2.9407, indigena: 33.3159, negra: 6.4245, branca: 6.1982 },
    }
  },
  {
    id: 'sim_3_6', name: 'Taxa de Mortalidade de Jovens (15-29 anos) por 100 mil hab.',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-mortalidade-de-jovens-(15-a-29-anos)-por-100-mil-habitantes-sim-3-6',
    formato: 'float',
    series: {
      2018: { amarela: 18.0692, indigena: 32.2782, negra: 42.2829, branca: 22.5514 },
      2019: { amarela: 13.7545, indigena: 35.7379, negra: 37.9693, branca: 21.4349 },
      2020: { amarela: 20.6443, indigena: 36.2477, negra: 40.699, branca: 21.5742 },
      2021: { amarela: 17.3791, indigena: 41.4968, negra: 40.9836, branca: 24.3737 },
      2022: { amarela: 18.703, indigena: 45.453, negra: 39.789, branca: 22.4176 },
    }
  },
  {
    id: 'sim_3_7', name: 'Taxa de Suicídio por 100 mil hab.',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-suicidio-por-100-mil-habitantes-sim-3-7',
    formato: 'float',
    series: {
      2018: { amarela: 5.2942, indigena: 10.9985, negra: 5.2931, branca: 6.9447 },
      2019: { amarela: 3.5239, indigena: 10.7056, negra: 5.6393, branca: 7.2238 },
      2020: { amarela: 5.9789, indigena: 9.6088, negra: 5.8951, branca: 7.1461 },
      2021: { amarela: 5.4169, indigena: 12.5819, negra: 6.7261, branca: 7.7814 },
      2022: { amarela: 6.7049, indigena: 12.4629, negra: 7.3461, branca: 8.844 },
    }
  },
  {
    id: 'sim_3_8', name: 'Taxa de Mortalidade por Neoplasias Malignas por 100 mil hab.',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-mortalidade-por-neoplasias-malignas-por-100-mil-habitantes-sim-3-8',
    formato: 'float',
    series: {
      2018: { amarela: 167.457, indigena: 33.9519, negra: 77.4233, branca: 140.6941 },
      2019: { amarela: 167.896, indigena: 31.7233, negra: 80.2185, branca: 142.6214 },
      2020: { amarela: 175.5327, indigena: 31.4042, negra: 78.0694, branca: 136.9043 },
      2021: { amarela: 183.1577, indigena: 34.3853, negra: 80.3427, branca: 140.7242 },
      2022: { amarela: 186.9126, indigena: 36.0854, negra: 87.5973, branca: 151.6224 },
    }
  },
  {
    id: 'sim_3_9', name: 'Taxa de Mortalidade por Doenças do Aparelho Circulatório por 100 mil hab.',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-mortalidade-por-doencas-do-aparelho-circulatorio-por-100-mil-habitantes-sim-3-9',
    formato: 'float',
    series: {
      2018: { amarela: 244.6829, indigena: 58.021, negra: 138.4181, branca: 206.3925 },
      2019: { amarela: 229.8482, indigena: 56.9131, negra: 140.6174, branca: 206.5516 },
      2020: { amarela: 242.3163, indigena: 61.7148, negra: 141.1689, branca: 196.1445 },
      2021: { amarela: 264.5234, indigena: 69.7084, negra: 149.188, branca: 212.8017 },
      2022: { amarela: 291.1319, indigena: 77.6285, negra: 163.7027, branca: 232.7876 },
    }
  },
  {
    id: 'sim_3_10', name: 'Taxa de Mortalidade por Diabetes Mellitus por 100 mil hab.',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-mortalidade-por-diabetes-mellitus-por-100-mil-habitantes-sim-3-10',
    formato: 'float',
    series: {
      2018: { amarela: 46.3816, indigena: 11.8752, negra: 26.8316, branca: 35.1702 },
      2019: { amarela: 39.6721, indigena: 12.831, negra: 27.1569, branca: 35.7522 },
      2020: { amarela: 51.5543, indigena: 15.9365, negra: 31.9789, branca: 38.619 },
      2021: { amarela: 57.8927, indigena: 14.6138, negra: 31.8825, branca: 41.627 },
      2022: { amarela: 48.8161, indigena: 13.3589, negra: 32.324, branca: 42.3854 },
    }
  },
  {
    id: 'sim_3_11', name: 'Taxa de Mortalidade por AIDS por 100 mil hab.',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'taxa-de-mortalidade-por-aids-por-100-mil-habitantes-sim-3-11',
    formato: 'float',
    series: {
      2018: { amarela: 4.6036, indigena: 2.7895, negra: 5.6532, branca: 4.7351 },
      2019: { amarela: 3.6376, indigena: 2.3615, negra: 5.5048, branca: 4.2881 },
      2020: { amarela: 3.4971, indigena: 2.4998, negra: 5.4527, branca: 4.2718 },
      2021: { amarela: 3.3855, indigena: 2.8915, negra: 5.8172, branca: 4.7745 },
      2022: { amarela: 4.9404, indigena: 2.5252, negra: 6.099, branca: 4.4985 },
    }
  },
  {
    id: 'sinasc_3_1', name: 'Percentual de Nascidos de Mães Menores de Idade',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'percentual-de-nascidos-de-maes-menores-de-idade-sinasc-3-1',
    formato: 'percent',
    series: {
      2018: { amarela: 0.0558, indigena: 0.1789, negra: 0.0879, branca: 0.0451 },
      2019: { amarela: 0.0469, indigena: 0.1673, negra: 0.0825, branca: 0.0417 },
      2020: { amarela: 0.0489, indigena: 0.1662, negra: 0.0777, branca: 0.0393 },
      2021: { amarela: 0.0478, indigena: 0.1673, negra: 0.0757, branca: 0.0382 },
      2022: { amarela: 0.0437, indigena: 0.1618, negra: 0.0669, branca: 0.0337 },
    }
  },
  {
    id: 'sinasc_3_2', name: 'Percentual de Nascidos Vivos com Baixo Peso (< 2.500g)',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'percentual-de-nascidos-vivos-com-baixo-peso-(inferior-a-2.500g)-sinasc-3-2',
    formato: 'percent',
    series: {
      2018: { amarela: 0.0921, indigena: 0.0812, negra: 0.0843, branca: 0.0858 },
      2019: { amarela: 0.0925, indigena: 0.084, negra: 0.0864, branca: 0.0871 },
      2020: { amarela: 0.0907, indigena: 0.0825, negra: 0.0854, branca: 0.0853 },
      2021: { amarela: 0.0975, indigena: 0.0831, negra: 0.0885, branca: 0.0888 },
      2022: { amarela: 0.0953, indigena: 0.0917, negra: 0.0945, branca: 0.0929 },
    }
  },
  {
    id: 'sinasc_3_3', name: 'Percentual de Nascidos de Mães com Pré-Natal Adequado (7+ consultas)',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'percentual-de-nascidos-vicos-de-maes-com-prenatal-adequado-(7-ou-mais-consultas)-sinasc-3-3',
    formato: 'percent',
    series: {
      2018: { amarela: 0.7468, indigena: 0.4056, negra: 0.6592, branca: 0.8086 },
      2019: { amarela: 0.7547, indigena: 0.4362, negra: 0.6808, branca: 0.8164 },
      2020: { amarela: 0.7424, indigena: 0.425, negra: 0.6648, branca: 0.8099 },
      2021: { amarela: 0.7579, indigena: 0.4573, negra: 0.6946, branca: 0.8215 },
      2022: { amarela: 0.7653, indigena: 0.4827, negra: 0.7181, branca: 0.8239 },
    }
  },
  {
    id: 'sinasc_3_4', name: 'Percentual de Nascidos Vivos de Parto Normal',
    group: 'ODS 3 - Boa Saúde e Bem-Estar',
    slug: 'percentual-de-nascidos-vivos-de-parto-normal-sinasc-3-4',
    formato: 'percent',
    series: {
      2018: { amarela: 0.4408, indigena: 0.7547, negra: 0.4924, branca: 0.3377 },
      2019: { amarela: 0.4278, indigena: 0.7526, negra: 0.4858, branca: 0.3382 },
      2020: { amarela: 0.4312, indigena: 0.7345, negra: 0.4733, branca: 0.3312 },
      2021: { amarela: 0.4194, indigena: 0.7372, negra: 0.47, branca: 0.3391 },
      2022: { amarela: 0.4122, indigena: 0.7182, negra: 0.455, branca: 0.3396 },
    }
  },

  // ═══════════════════════════════════════
  // ODS 4 - Educação de Qualidade
  // ═══════════════════════════════════════
  {
    id: 'ceb_afd_4_1', name: 'Taxa de Adequação da Formação Docente - Ensino Infantil',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'taxa-de-adequacao-da-formacao-docente-no-ensino-infantil-(criterio-de-predominancia)-ceb-afd-4-1',
    formato: 'percent',
    series: {
      2018: { amarela: 0.575, indigena: 0.107, negra: 0.4398, branca: 0.5153 },
      2019: { amarela: 0.7133, indigena: 0.1544, negra: 0.499, branca: 0.575 },
      2020: { amarela: 0.5712, indigena: 0.186, negra: 0.5384, branca: 0.6117 },
      2021: { amarela: 0.6062, indigena: 0.2263, negra: 0.5647, branca: 0.627 },
      2022: { amarela: 0.6492, indigena: 0.2099, negra: 0.5951, branca: 0.6335 },
      2023: { amarela: 0.6295, indigena: 0.2181, negra: 0.6129, branca: 0.6418 },
    }
  },
  {
    id: 'ceb_afd_4_2', name: 'Taxa de Adequação da Formação Docente - Ensino Fundamental I',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'taxa-de-adequacao-da-formacao-docente-no-ensino-fundamental-i-(criterio-de-predominancia)-ceb-afd-4-2',
    formato: 'percent',
    series: {
      2018: { amarela: 0.388, indigena: 0.1168, negra: 0.5103, branca: 0.7041 },
      2019: { amarela: 0.3755, indigena: 0.1649, negra: 0.5575, branca: 0.7328 },
      2020: { amarela: 0.3928, indigena: 0.203, negra: 0.5913, branca: 0.7598 },
      2021: { amarela: 0.463, indigena: 0.2131, negra: 0.6102, branca: 0.7768 },
      2022: { amarela: 0.3978, indigena: 0.2035, negra: 0.65, branca: 0.7989 },
      2023: { amarela: 0.3932, indigena: 0.2245, negra: 0.668, branca: 0.7979 },
    }
  },
  {
    id: 'ceb_afd_4_3', name: 'Taxa de Adequação da Formação Docente - Ensino Fundamental II',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'taxa-de-adequacao-da-formacao-docente-no-ensino-fundamental-ii-(criterio-de-predominancia)-ceb-afd-4-3',
    formato: 'percent',
    series: {
      2018: { amarela: 0.4434, indigena: 0.0486, negra: 0.2703, branca: 0.6028 },
      2019: { amarela: 0.4871, indigena: 0.0601, negra: 0.2987, branca: 0.6077 },
      2020: { amarela: 0.46, indigena: 0.0631, negra: 0.3181, branca: 0.6225 },
      2021: { amarela: 0.509, indigena: 0.0716, negra: 0.3273, branca: 0.648 },
      2022: { amarela: 0.6299, indigena: 0.0788, negra: 0.3539, branca: 0.6486 },
      2023: { amarela: 0.71, indigena: 0.0815, negra: 0.3601, branca: 0.646 },
    }
  },
  {
    id: 'ceb_afd_4_4', name: 'Taxa de Adequação da Formação Docente - Ensino Médio',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'taxa-de-adequacao-da-formacao-docente-no-ensino-medio-(criterio-de-predominancia)-ceb-afd-4-4',
    formato: 'percent',
    series: {
      2018: { amarela: 0.4048, indigena: 0.1872, negra: 0.5525, branca: 0.6694 },
      2019: { amarela: 0.4985, indigena: 0.2018, negra: 0.5934, branca: 0.6666 },
      2020: { amarela: 0.5022, indigena: 0.1988, negra: 0.6175, branca: 0.6822 },
      2021: { amarela: 0.5176, indigena: 0.2087, negra: 0.5993, branca: 0.7215 },
      2022: { amarela: 0.5688, indigena: 0.2242, negra: 0.6531, branca: 0.6809 },
      2023: { amarela: 0.5931, indigena: 0.2329, negra: 0.6547, branca: 0.688 },
    }
  },
  {
    id: 'ceb_escolas_4_1', name: 'Infraestrutura Escolar - Taxa de Escolas com Eletricidade',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'infraestrutura-escolar--taxa-de-escolas-com-acesso-a-eletricidade-(criterio-de-predominancia)-ceb-escolas-4-1',
    formato: 'percent',
    series: {
      2018: { amarela: 0.8929, indigena: 0.4786, negra: 0.8685, branca: 0.9507 },
      2019: { amarela: 0.9259, indigena: 0.4927, negra: 0.86, branca: 0.9434 },
      2020: { amarela: 0.9259, indigena: 0.4927, negra: 0.8598, branca: 0.9375 },
      2021: { amarela: 0.9259, indigena: 0.5114, negra: 0.8572, branca: 0.9247 },
      2022: { amarela: 1.0, indigena: 0.5538, negra: 0.9609, branca: 0.996 },
      2023: { amarela: 1.0, indigena: 0.567, negra: 0.9611, branca: 0.9953 },
    }
  },
  {
    id: 'ceb_escolas_4_2', name: 'Infraestrutura Escolar - Taxa de Escolas com Internet Pedagógica',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'infraestrutura-escolar--taxa-de-escolas-com-internet-para-fins-pedagogicos-(criterio-de-predominancia)-ceb-escolas-4-2',
    formato: 'percent',
    series: {
      2019: { amarela: 0.6667, indigena: 0.0809, negra: 0.2536, branca: 0.6064 },
      2020: { amarela: 0.7407, indigena: 0.0912, negra: 0.2876, branca: 0.685 },
      2021: { amarela: 0.7407, indigena: 0.121, negra: 0.3385, branca: 0.717 },
      2022: { amarela: 0.7308, indigena: 0.1603, negra: 0.465, branca: 0.8067 },
      2023: { amarela: 0.8148, indigena: 0.2295, negra: 0.5317, branca: 0.8339 },
    }
  },
  {
    id: 'ceb_escolas_4_3', name: 'Infraestrutura Escolar - Taxa de Escolas com Lab. Informática',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'infraestrutura-escolar--taxa-de-escolas-com-laboratorio-de-informatica-(criterio-de-predominancia)-ceb-escolas-4-3',
    formato: 'percent',
    series: {
      2018: { amarela: 0.4286, indigena: 0.0677, negra: 0.3078, branca: 0.4449 },
      2019: { amarela: 0.4444, indigena: 0.0651, negra: 0.2712, branca: 0.4223 },
      2020: { amarela: 0.4815, indigena: 0.0632, negra: 0.2661, branca: 0.4172 },
      2021: { amarela: 0.4815, indigena: 0.063, negra: 0.2548, branca: 0.4038 },
      2022: { amarela: 0.4231, indigena: 0.0626, negra: 0.2527, branca: 0.4138 },
      2023: { amarela: 0.4444, indigena: 0.0644, negra: 0.2458, branca: 0.4037 },
    }
  },
  {
    id: 'ceb_escolas_4_4', name: 'Infraestrutura Escolar - Taxa de Escolas com Banheiro Acessível',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'infraestrutura-escolar--taxa-de-escolas-com-banheiro-acessivel-(criterio-de-predominancia)-ceb-escolas-4-4',
    formato: 'percent',
    series: {
      2018: { amarela: 0.3929, indigena: 0.0466, negra: 0.3317, branca: 0.4789 },
      2019: { amarela: 0.4074, indigena: 0.0582, negra: 0.357, branca: 0.5077 },
      2020: { amarela: 0.3704, indigena: 0.0638, negra: 0.3731, branca: 0.5289 },
      2021: { amarela: 0.4074, indigena: 0.0707, negra: 0.39, branca: 0.547 },
      2022: { amarela: 0.3846, indigena: 0.0785, negra: 0.4664, branca: 0.5994 },
      2023: { amarela: 0.5185, indigena: 0.0818, negra: 0.4875, branca: 0.6183 },
    }
  },
  {
    id: 'ceb_escolas_4_5', name: 'Infraestrutura Escolar - Taxa de Escolas com Água Encanada',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'infraestrutura-escolar--taxa-de-escolas-com-agua-encanada-(criterio-de-predominancia)-ceb-escolas-4-5',
    formato: 'percent',
    series: {
      2018: { amarela: 0.6429, indigena: 0.0926, negra: 0.578, branca: 0.8671 },
      2019: { amarela: 0.6667, indigena: 0.1002, negra: 0.5797, branca: 0.8658 },
      2020: { amarela: 0.6667, indigena: 0.1049, negra: 0.5837, branca: 0.8635 },
      2021: { amarela: 0.6667, indigena: 0.1025, negra: 0.5846, branca: 0.8551 },
      2022: { amarela: 0.7308, indigena: 0.1118, negra: 0.6621, branca: 0.9249 },
      2023: { amarela: 0.8889, indigena: 0.1169, negra: 0.6726, branca: 0.9283 },
    }
  },
  {
    id: 'ceb_escolas_4_6', name: 'Infraestrutura Escolar - Taxa de Escolas com Banheiro Infantil',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'infraestrutura-escolar--taxa-de-escolas-com-banheiro-infantil-(criterio-de-predominancia)-ceb-escolas-4-6',
    formato: 'percent',
    series: {
      2018: { amarela: 0.1071, indigena: 0.0234, negra: 0.2053, branca: 0.4966 },
      2019: { amarela: 0.1111, indigena: 0.0357, negra: 0.221, branca: 0.5059 },
      2020: { amarela: 0.0741, indigena: 0.0395, negra: 0.2277, branca: 0.506 },
      2021: { amarela: 0.1111, indigena: 0.0341, negra: 0.2319, branca: 0.5037 },
      2022: { amarela: 0.1923, indigena: 0.0374, negra: 0.2787, branca: 0.5468 },
      2023: { amarela: 0.2222, indigena: 0.038, negra: 0.2885, branca: 0.5525 },
    }
  },
  {
    id: 'cs_cursos_4_1', name: 'Participação Relativa de Ingressantes no Ensino Superior',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'participacao-relativa-de-ingressantes-no-ensino-superior-cs-cursos-4-1',
    formato: 'percent',
    series: {
      2018: { amarela: 2.4274, indigena: 0.4985, negra: 0.4747, branca: 0.6877 },
      2019: { amarela: 2.4083, indigena: 0.427, negra: 0.4937, branca: 0.6769 },
      2020: { amarela: 2.3911, indigena: 0.4379, negra: 0.4677, branca: 0.6585 },
      2021: { amarela: 2.4051, indigena: 0.4637, negra: 0.4373, branca: 0.7038 },
      2022: { amarela: 2.4434, indigena: 0.5282, negra: 0.4538, branca: 0.6296 },
      2023: { amarela: 2.0692, indigena: 0.4604, negra: 0.4672, branca: 0.7314 },
    }
  },
  {
    id: 'cs_cursos_4_3', name: 'Taxa de Escolarização no Ensino Superior',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'taxa-de-escolarizacao-no-ensino-superior-cs-cursos-4-3',
    formato: 'percent',
    series: {
      2018: { amarela: 2.8653, indigena: 0.7864, negra: 0.4745, branca: 0.7084 },
      2019: { amarela: 2.8864, indigena: 0.7207, negra: 0.4966, branca: 0.7082 },
      2020: { amarela: 2.8578, indigena: 0.6545, negra: 0.4924, branca: 0.7096 },
      2021: { amarela: 2.71, indigena: 0.6216, negra: 0.4861, branca: 0.7346 },
      2022: { amarela: 2.6266, indigena: 0.5652, negra: 0.4861, branca: 0.6977 },
      2023: { amarela: 2.454, indigena: 0.5284, negra: 0.4922, branca: 0.7437 },
    }
  },
  {
    id: 'cs_cursos_4_4', name: 'Taxa de Conclusão no Ensino Superior',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'taxa-de-conclusao-no-ensino-superior-cs-cursos-4-4',
    formato: 'percent',
    series: {
      2018: { amarela: 0.4173, indigena: 0.2127, negra: 0.3173, branca: 0.3862 },
      2019: { amarela: 0.374, indigena: 0.1693, negra: 0.309, branca: 0.3807 },
      2020: { amarela: 0.4718, indigena: 0.6242, negra: 0.3513, branca: 0.4024 },
      2021: { amarela: 0.4492, indigena: 0.6015, negra: 0.3988, branca: 0.3833 },
      2022: { amarela: 0.3383, indigena: 0.2865, negra: 0.3073, branca: 0.3394 },
      2023: { amarela: 0.3851, indigena: 0.2691, negra: 0.2971, branca: 0.2903 },
    }
  },
  {
    id: 'enem_4_6', name: 'Média da Nota Geral no ENEM',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'media-da-nota-geral-no-enem-enem-4-6',
    formato: 'float',
    series: {
      2018: { amarela: 417.253, indigena: 355.5423, negra: 380.1634, branca: 417.2269 },
      2019: { amarela: 433.8253, indigena: 381.599, negra: 412.1674, branca: 455.7423 },
      2020: { amarela: 318.2422, indigena: 228.5163, negra: 290.1619, branca: 343.0969 },
      2022: { amarela: 377.6852, indigena: 293.8046, negra: 353.9249, branca: 414.536 },
      2023: { amarela: 374.4837, indigena: 297.4372, negra: 361.7003, branca: 432.5188 },
    }
  },
  {
    id: 'ideb_4_1', name: 'IDEB - Ensino Fundamental I (predominância)',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'ideb--ensino-fundamental-i-(criterio-de-predominancia)-ideb-4-1',
    formato: 'float',
    series: {
      2019: { amarela: 5.2, indigena: 3.5686, negra: 5.2616, branca: 6.449 },
      2021: { amarela: 5.6, indigena: 3.9416, negra: 5.2013, branca: 6.2361 },
      2023: { amarela: null, indigena: 3.8263, negra: 5.3889, branca: 6.4081 },
    }
  },
  {
    id: 'ideb_4_2', name: 'IDEB - Ensino Fundamental II (predominância)',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'ideb--ensino-fundamental-ii-(criterio-de-predominancia)-ideb-4-2',
    formato: 'float',
    series: {
      2019: { amarela: 4.58, indigena: 3.0087, negra: 4.3578, branca: 5.1989 },
      2021: { amarela: 5.275, indigena: 3.3962, negra: 4.6743, branca: 5.3896 },
      2023: { amarela: 5.24, indigena: 3.3042, negra: 4.5098, branca: 5.294 },
    }
  },
  {
    id: 'ideb_4_3', name: 'IDEB - Ensino Médio (predominância)',
    group: 'ODS 4 - Educação de Qualidade',
    slug: 'ideb--ensino-medio-(criterio-de-predominancia)-ideb-4-3',
    formato: 'float',
    series: {
      2019: { amarela: 3.81, indigena: 2.8528, negra: 3.889, branca: 4.6214 },
      2021: { amarela: 3.9571, indigena: 3.3316, negra: 4.1493, branca: 4.6885 },
      2023: { amarela: 4.2091, indigena: 3.2, negra: 4.0263, branca: 4.5906 },
    }
  },

  // ═══════════════════════════════════════
  // ODS 5 - Igualdade de Gênero
  // ═══════════════════════════════════════
  {
    id: 'rais_5_1', name: 'Percentual dos Vínculos Formais Ocupados por Mulheres',
    group: 'ODS 5 - Igualdade de Gênero',
    slug: 'percentual-dos-vinculos-formais-ocupados-por-mulheres-rais-5-1',
    formato: 'percent',
    series: {
      2018: { amarela: 0.4358, indigena: 0.4076, negra: 0.3813, branca: 0.4324 },
      2019: { amarela: 0.4421, indigena: 0.3896, negra: 0.3835, branca: 0.4395 },
      2020: { amarela: 0.4431, indigena: 0.3891, negra: 0.379, branca: 0.4363 },
      2021: { amarela: 0.4609, indigena: 0.3941, negra: 0.3874, branca: 0.4436 },
      2022: { amarela: 0.4614, indigena: 0.3878, negra: 0.3918, branca: 0.4448 },
      2023: { amarela: 0.5014, indigena: 0.4351, negra: 0.4189, branca: 0.4765 },
      2024: { amarela: 0.5047, indigena: 0.4404, negra: 0.4215, branca: 0.4788 },
    }
  },
  {
    id: 'rais_5_2', name: 'Salário Médio das Mulheres em Vínculos Formais Ativos',
    group: 'ODS 5 - Igualdade de Gênero',
    slug: 'salario-medio-das-mulheres-em-vinculos-formais-ativos-rais-5-2',
    formato: 'money',
    series: {
      2018: { amarela: 3164.3863, indigena: 2147.7148, negra: 1814.6967, branca: 2527.6707 },
      2019: { amarela: 3236.9578, indigena: 2175.0184, negra: 1864.2115, branca: 2572.4878 },
      2020: { amarela: 3274.9949, indigena: 2208.0237, negra: 1857.7468, branca: 2594.7039 },
      2021: { amarela: 3446.4708, indigena: 2464.1582, negra: 2024.7536, branca: 2829.6591 },
      2022: { amarela: 5382.7759, indigena: 3583.5234, negra: 2757.8082, branca: 3989.5733 },
      2023: { amarela: 4490.3331, indigena: 3213.3732, negra: 2952.3932, branca: 4155.3059 },
      2024: { amarela: 4898.4932, indigena: 3484.2188, negra: 3078.5715, branca: 4353.2914 },
    }
  },
  {
    id: 'rais_5_3', name: 'Salário Médio dos Homens em Vínculos Formais Ativos',
    group: 'ODS 5 - Igualdade de Gênero',
    slug: 'salario-medio-dos-homens-em-vinculos-formais-ativos-rais-5-3',
    formato: 'money',
    series: {
      2018: { amarela: 4024.9204, indigena: 2554.2666, negra: 2239.1238, branca: 3283.727 },
      2019: { amarela: 4048.474, indigena: 2498.8918, negra: 2278.8655, branca: 3270.3091 },
      2020: { amarela: 4081.0906, indigena: 2502.2063, negra: 2274.6695, branca: 3292.9504 },
      2021: { amarela: 4382.9773, indigena: 2865.503, negra: 2462.7998, branca: 3582.4694 },
      2022: { amarela: 6577.1938, indigena: 4910.4077, negra: 3338.5381, branca: 5083.8787 },
      2023: { amarela: 5227.1788, indigena: 3426.3949, negra: 3318.8267, branca: 4938.4583 },
      2024: { amarela: 5749.0197, indigena: 3608.906, negra: 3471.7826, branca: 5170.3772 },
    }
  },
  {
    id: 'sinan_5_1', name: 'Taxa de Violência Física contra Mulheres por 100 mil hab.',
    group: 'ODS 5 - Igualdade de Gênero',
    slug: 'taxa-de-violencia-fisica-contra-mulheres-por-100-mil-habitantes-sinan-5-1',
    formato: 'float',
    series: {
      2018: { amarela: 114.2851, indigena: 99.624, negra: 57.6015, branca: 55.175 },
      2019: { amarela: 110.4908, indigena: 107.6861, negra: 59.8881, branca: 54.3971 },
      2020: { amarela: 93.8581, indigena: 91.7909, negra: 49.3026, branca: 42.0639 },
      2021: { amarela: 94.4565, indigena: 89.7925, negra: 53.886, branca: 44.4567 },
      2022: { amarela: 156.0938, indigena: 111.8404, negra: 67.1662, branca: 53.8083 },
      2023: { amarela: 206.2038, indigena: 162.0994, negra: 89.8725, branca: 70.9433 },
    }
  },
  {
    id: 'sinan_5_2', name: 'Taxa de Violência Sexual contra Mulheres por 100 mil hab.',
    group: 'ODS 5 - Igualdade de Gênero',
    slug: 'taxa-de-violencia-sexual-contra-mulheres-por-100-mil-habitantes-sinan-5-2',
    formato: 'float',
    series: {
      2018: { amarela: 33.031, indigena: 32.9955, negra: 17.8753, branca: 14.6122 },
      2019: { amarela: 34.6705, indigena: 39.5951, negra: 19.439, branca: 15.7452 },
      2020: { amarela: 35.8736, indigena: 31.4042, negra: 16.6721, branca: 12.8578 },
      2021: { amarela: 42.3192, indigena: 40.2464, negra: 20.225, branca: 15.0182 },
      2022: { amarela: 55.6385, indigena: 56.1239, negra: 26.3048, branca: 19.91 },
      2023: { amarela: 64.2255, indigena: 84.308, negra: 35.841, branca: 28.4163 },
    }
  },
  {
    id: 'tse_5_1', name: 'Percentual de Assentos Ocupados por Mulheres em Parlamentos Locais',
    group: 'ODS 5 - Igualdade de Gênero',
    slug: 'percentual-de-assentos-ocupados-por-mulheres-em-parlamentos-locais-tse-5-1',
    formato: 'percent',
    series: {
      2020: { amarela: 0.2026, indigena: 0.1602, negra: 0.1415, branca: 0.1771 },
      2024: { amarela: 0.1852, indigena: 0.2045, negra: 0.159, branca: 0.1963 },
    }
  },
  {
    id: 'tse_5_4', name: 'Paridade Racial em Candidaturas Femininas aos Parlamentos Locais',
    group: 'ODS 5 - Igualdade de Gênero',
    slug: 'paridade-racial-em-candidaturas-femininas-aos-parlamentos-locais-tse-5-4',
    formato: 'percent',
    series: {
      2020: { amarela: 0.3756, indigena: 0.3362, negra: 0.334, branca: 0.3624 },
      2024: { amarela: 0.4184, indigena: 0.3436, negra: 0.3486, branca: 0.3556 },
    }
  },
  {
    id: 'tse_5_7', name: 'Taxa de Sucesso de Candidaturas Femininas a Parlamentos Locais',
    group: 'ODS 5 - Igualdade de Gênero',
    slug: 'taxa-de-sucesso-de-candidaturas-femininas-a-parlamentos-locais-tse-5-7',
    formato: 'percent',
    series: {
      2020: { amarela: 0.0696, indigena: 0.0411, negra: 0.0417, branca: 0.0623 },
      2024: { amarela: 0.0424, indigena: 0.0672, negra: 0.0533, branca: 0.0853 },
    }
  },

  // ═══════════════════════════════════════
  // ODS 6 - Água Potável e Saneamento
  // ═══════════════════════════════════════
  {
    id: 'sim_6_1', name: 'Taxa de Mortalidade Atribuída à Água, Saneamento e Higiene Inseguros por 100 mil hab.',
    group: 'ODS 6 - Água Potável e Saneamento',
    slug: 'taxa-de-mortalidade-atribuida-a-agua-saneamento-e-higiene-inseguros-por-100-mil-habitantes-sim-6-1',
    formato: 'float',
    series: {
      2018: { amarela: 78.3768, indigena: 43.7549, negra: 31.3114, branca: 57.1761 },
      2019: { amarela: 79.4579, indigena: 46.7584, negra: 32.7371, branca: 58.8823 },
      2020: { amarela: 59.2254, indigena: 37.4976, negra: 28.9369, branca: 45.2446 },
      2021: { amarela: 62.5196, indigena: 43.2942, negra: 28.2225, branca: 46.4015 },
      2022: { amarela: 83.9872, indigena: 56.5311, negra: 37.8012, branca: 62.6331 },
    }
  },

  // ═══════════════════════════════════════
  // ODS 8 - Emprego Decente e Crescimento Econômico
  // ═══════════════════════════════════════
  {
    id: 'rais_8_1', name: 'Salário Médio por Hora em Vínculos Formais Ativos',
    group: 'ODS 8 - Emprego Decente e Crescimento Econômico',
    slug: 'salario-medio-por-hora-em-vinculos-formais-ativos-rais-8-1',
    formato: 'money',
    series: {
      2018: { amarela: 19.9035, indigena: 12.9482, negra: 11.0253, branca: 15.8741 },
      2019: { amarela: 20.1185, indigena: 12.8734, negra: 11.2806, branca: 15.963 },
      2020: { amarela: 20.3721, indigena: 13.0823, negra: 11.3599, branca: 16.2457 },
      2021: { amarela: 21.5664, indigena: 14.8086, negra: 12.2182, branca: 17.5386 },
      2022: { amarela: 32.5071, indigena: 23.5328, negra: 16.4709, branca: 24.6607 },
      2023: { amarela: 25.7494, indigena: 17.1558, negra: 16.5447, branca: 23.9717 },
      2024: { amarela: 28.1789, indigena: 18.4991, negra: 17.2548, branca: 25.0863 },
    }
  },
  {
    id: 'rais_8_2', name: 'Taxas de Frequência de Lesões Ocupacionais Fatais e Não Fatais',
    group: 'ODS 8 - Emprego Decente e Crescimento Econômico',
    slug: 'taxas-de-frequencia-de-lesoes-ocupacionais-fatais-e-nao-fatais-no-mercado-formal-de-trabalho-rais-8-2',
    formato: 'percent',
    series: {
      2018: { amarela: 0.0062, indigena: 0.0059, negra: 0.0065, branca: 0.0067 },
      2019: { amarela: 0.0065, indigena: 0.0053, negra: 0.0067, branca: 0.0069 },
      2020: { amarela: 0.0057, indigena: 0.0048, negra: 0.0059, branca: 0.0059 },
      2021: { amarela: 0.0058, indigena: 0.0058, negra: 0.0064, branca: 0.0065 },
      2022: { amarela: 0.0088, indigena: 0.0089, negra: 0.0098, branca: 0.0098 },
      2023: { amarela: 0.0075, indigena: 0.0096, negra: 0.0111, branca: 0.0115 },
      2024: { amarela: 0.0052, indigena: 0.0061, negra: 0.0065, branca: 0.0076 },
    }
  },
  {
    id: 'rais_8_5', name: 'Percentual de Vínculos sem Ensino Superior no Mercado Formal',
    group: 'ODS 8 - Emprego Decente e Crescimento Econômico',
    slug: 'percentual-de-vinculos-ocupados-com-pessoas-sem-ensino-superior-no-mercado-formal-de-trabalho-rais-8-5',
    formato: 'percent',
    series: {
      2018: { amarela: 0.7076, indigena: 0.8392, negra: 0.885, branca: 0.7831 },
      2019: { amarela: 0.7192, indigena: 0.856, negra: 0.8878, branca: 0.7864 },
      2020: { amarela: 0.7164, indigena: 0.8515, negra: 0.8841, branca: 0.7801 },
      2021: { amarela: 0.7029, indigena: 0.8278, negra: 0.8789, branca: 0.7737 },
      2022: { amarela: 0.6941, indigena: 0.8564, negra: 0.8771, branca: 0.7686 },
      2023: { amarela: 0.6209, indigena: 0.7238, negra: 0.7806, branca: 0.649 },
      2024: { amarela: 0.6141, indigena: 0.7218, negra: 0.787, branca: 0.6533 },
    }
  },
  {
    id: 'rais_8_6', name: 'Percentual de Vínculos com Ensino Superior no Mercado Formal',
    group: 'ODS 8 - Emprego Decente e Crescimento Econômico',
    slug: 'percentual-de-vinculos-ocupados-com-pessoas-com-ensino-superior-no-mercado-formal-de-trabalho-rais-8-6',
    formato: 'percent',
    series: {
      2018: { amarela: 0.2924, indigena: 0.1608, negra: 0.115, branca: 0.2169 },
      2019: { amarela: 0.2808, indigena: 0.144, negra: 0.1122, branca: 0.2136 },
      2020: { amarela: 0.2836, indigena: 0.1485, negra: 0.1159, branca: 0.2199 },
      2021: { amarela: 0.2971, indigena: 0.1722, negra: 0.1211, branca: 0.2263 },
      2022: { amarela: 0.3059, indigena: 0.1436, negra: 0.1229, branca: 0.2314 },
      2023: { amarela: 0.3791, indigena: 0.2762, negra: 0.2194, branca: 0.351 },
      2024: { amarela: 0.3859, indigena: 0.2782, negra: 0.213, branca: 0.3467 },
    }
  },
  {
    id: 'rais_8_24', name: 'Salário Médio no Setor Público',
    group: 'ODS 8 - Emprego Decente e Crescimento Econômico',
    slug: 'salario-medio-no-setor-publico-rais-8-24',
    formato: 'money',
    series: {
      2018: { amarela: 2713.2465, indigena: 2581.0583, negra: 2318.5541, branca: 3202.3309 },
      2019: { amarela: 2871.7792, indigena: 2071.9225, negra: 2416.1884, branca: 3316.684 },
      2020: { amarela: 3294.6066, indigena: 2175.8268, negra: 2497.3761, branca: 3470.6178 },
      2021: { amarela: 2537.4974, indigena: 2161.4095, negra: 2548.3016, branca: 3496.263 },
      2022: { amarela: 3385.4806, indigena: 2534.1955, negra: 2681.9409, branca: 3815.2501 },
      2023: { amarela: 5858.4576, indigena: 4362.5349, negra: 5196.6234, branca: 6909.703 },
      2024: { amarela: 6605.7221, indigena: 4851.3069, negra: 5592.3601, branca: 7376.7821 },
    }
  },
  {
    id: 'rais_8_25', name: 'Salário Médio no Setor Privado',
    group: 'ODS 8 - Emprego Decente e Crescimento Econômico',
    slug: 'salario-medio-no-setor-privado-rais-8-25',
    formato: 'money',
    series: {
      2018: { amarela: 3705.5109, indigena: 2369.0193, negra: 2073.4168, branca: 2950.3067 },
      2019: { amarela: 3737.3302, indigena: 2393.9485, negra: 2114.7539, branca: 2953.1307 },
      2020: { amarela: 3742.6916, indigena: 2406.9197, negra: 2110.2633, branca: 2974.0636 },
      2021: { amarela: 4080.6924, indigena: 2766.1663, negra: 2287.952, branca: 3240.4307 },
      2022: { amarela: 6214.8159, indigena: 4577.3875, negra: 3111.1047, branca: 4645.1156 },
      2023: { amarela: 4456.3447, indigena: 2874.7785, negra: 2762.3876, branca: 4005.1296 },
      2024: { amarela: 4850.9104, indigena: 2994.4552, negra: 2885.4012, branca: 4189.3676 },
    }
  },
  {
    id: 'rais_8_26', name: 'Salário Médio entre Estrangeiros',
    group: 'ODS 8 - Emprego Decente e Crescimento Econômico',
    slug: 'salario-medio-entre-estrangeiros-rais-8-26',
    formato: 'money',
    series: {
      2018: { amarela: 10994.9478, indigena: 5619.5111, negra: 2404.3773, branca: 8300.2743 },
      2019: { amarela: 10393.2742, indigena: 4788.1843, negra: 2292.5428, branca: 6663.3782 },
      2020: { amarela: 9776.4997, indigena: 4472.5315, negra: 2179.2761, branca: 6290.8812 },
      2021: { amarela: 9526.5469, indigena: 5137.8453, negra: 2447.4491, branca: 6330.869 },
      2022: { amarela: 11684.0005, indigena: 5371.8582, negra: 3075.372, branca: 8051.7046 },
      2023: { amarela: 9890.3277, indigena: 4760.0181, negra: 2776.59, branca: 6634.8531 },
      2024: { amarela: 8976.9233, indigena: 4188.2823, negra: 2784.9595, branca: 5960.7976 },
    }
  },
  {
    id: 'rais_10_28', name: 'Paridade Racial nos Vínculos no Setor Público',
    group: 'ODS 8 - Emprego Decente e Crescimento Econômico',
    slug: 'paridade-racial-nos-vinculos-no-setor-publico-rais-10-28',
    formato: 'percent',
    series: {
      2018: { amarela: 1.1215, indigena: 0.2333, negra: 0.5102, branca: 0.8082 },
      2019: { amarela: 1.0772, indigena: 0.2185, negra: 0.5119, branca: 0.7774 },
      2020: { amarela: 1.048, indigena: 0.2135, negra: 0.5134, branca: 0.7478 },
      2021: { amarela: 1.0297, indigena: 0.2177, negra: 0.5097, branca: 0.7104 },
      2022: { amarela: 1.0811, indigena: 0.2292, negra: 0.5033, branca: 0.6859 },
      2023: { amarela: 1.496, indigena: 0.2884, negra: 0.5628, branca: 0.6964 },
      2024: { amarela: 1.405, indigena: 0.3039, negra: 0.6039, branca: 0.6918 },
    }
  },

  // ═══════════════════════════════════════
  // ODS 9 - Indústria, Inovação e Infraestrutura
  // ═══════════════════════════════════════
  {
    id: 'rais_9_1', name: 'Paridade Racial dos Vínculos Formais no Setor Industrial em Relação à População',
    group: 'ODS 9 - Indústria, Inovação e Infraestrutura',
    slug: 'paridade-racial-dos-vinculos-formais-ativos-no-setor-industrial-em-relacao-a-populacao-rais-9-1',
    formato: 'percent',
    series: {
      2018: { amarela: 1.149, indigena: 0.1985, negra: 0.4749, branca: 0.9187 },
      2019: { amarela: 1.1122, indigena: 0.1868, negra: 0.4795, branca: 0.8866 },
      2020: { amarela: 1.08, indigena: 0.1911, negra: 0.4839, branca: 0.8514 },
      2021: { amarela: 1.0208, indigena: 0.2216, negra: 0.4822, branca: 0.8133 },
      2022: { amarela: 1.081, indigena: 0.2275, negra: 0.4833, branca: 0.782 },
      2023: { amarela: 1.3864, indigena: 0.2715, negra: 0.5399, branca: 0.7856 },
      2024: { amarela: 1.3547, indigena: 0.3157, negra: 0.575, branca: 0.7735 },
    }
  },
  {
    id: 'rais_9_2', name: 'Salário Médio na Indústria em Vínculos Formais Ativos',
    group: 'ODS 9 - Indústria, Inovação e Infraestrutura',
    slug: 'salario-medio-na-industria-em-vinculos-formais-ativos-rais-9-2',
    formato: 'money',
    series: {
      2018: { amarela: 4381.1533, indigena: 2829.832, negra: 2444.0, branca: 3430.422 },
      2019: { amarela: 4305.6788, indigena: 2813.8889, negra: 2484.0688, branca: 3408.6353 },
      2020: { amarela: 4211.5725, indigena: 2786.5304, negra: 2477.9138, branca: 3422.0241 },
      2021: { amarela: 4491.9145, indigena: 3747.9629, negra: 2652.4897, branca: 3661.2612 },
      2022: { amarela: 6156.1417, indigena: 3678.7749, negra: 3363.3299, branca: 4888.2076 },
      2023: { amarela: 5052.3998, indigena: 3256.4882, negra: 3202.9795, branca: 4502.6566 },
      2024: { amarela: 5361.2995, indigena: 3207.2328, negra: 3338.2855, branca: 4707.319 },
    }
  },

  // ═══════════════════════════════════════
  // ODS 10 - Redução das Desigualdades
  // ═══════════════════════════════════════
  {
    id: 'rais_10_1', name: 'Salário Médio por Vínculo Formal Ativo',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'salario-medio-por-vinculo-formal-ativo-rais-10-1',
    formato: 'money',
    series: {
      2018: { amarela: 3649.8796, indigena: 2388.5565, negra: 2077.3051, branca: 2956.7818 },
      2019: { amarela: 3689.6983, indigena: 2372.7202, negra: 2119.8314, branca: 2963.5944 },
      2020: { amarela: 3723.9205, indigena: 2387.7519, negra: 2116.6625, branca: 2988.3232 },
      2021: { amarela: 3951.3539, indigena: 2707.32, negra: 2293.0871, branca: 3248.4984 },
      2022: { amarela: 6026.0357, indigena: 4395.8804, negra: 3111.0123, branca: 4597.1457 },
      2023: { amarela: 4857.7086, indigena: 3333.7043, negra: 3165.3111, branca: 4565.2765 },
      2024: { amarela: 5319.736, indigena: 3553.9926, negra: 3306.0257, branca: 4779.1726 },
    }
  },
  {
    id: 'rais_10_2', name: 'Proporção da Massa Salarial de Vínculos até 2 Salários Mínimos',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'proporcao-da-massa-salarial-de-vinculos-formais-com-salario-ate-dois-salarios-minimos-rais-10-2',
    formato: 'percent',
    series: {
      2018: { amarela: 0.1903, indigena: 0.3458, negra: 0.4303, branca: 0.2519 },
      2019: { amarela: 0.1992, indigena: 0.3839, negra: 0.4447, branca: 0.2665 },
      2020: { amarela: 0.2081, indigena: 0.3969, negra: 0.4622, branca: 0.277 },
      2021: { amarela: 0.2058, indigena: 0.3654, negra: 0.4465, branca: 0.2645 },
      2022: { amarela: 0.1378, indigena: 0.2393, negra: 0.3492, branca: 0.1961 },
      2023: { amarela: 0.1851, indigena: 0.3206, negra: 0.3509, branca: 0.1957 },
      2024: { amarela: 0.1775, indigena: 0.3236, negra: 0.3649, branca: 0.2038 },
    }
  },
  {
    id: 'rais_10_3', name: 'Percentual de Vínculos com Remuneração Abaixo de ½ Mediana',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'percentual-de-vinculos-formais-com-remuneracao-abaixo-da-metade-da-remuneracao-mediana-rais-10-3',
    formato: 'percent',
    series: {
      2018: { amarela: 0.6778, indigena: 0.7995, negra: 0.8243, branca: 0.7469 },
      2019: { amarela: 0.6595, indigena: 0.7922, negra: 0.8067, branca: 0.7246 },
      2020: { amarela: 0.7056, indigena: 0.8342, negra: 0.8554, branca: 0.7612 },
      2021: { amarela: 0.6558, indigena: 0.7785, negra: 0.7992, branca: 0.7065 },
      2022: { amarela: 0.6515, indigena: 0.7871, negra: 0.8047, branca: 0.7146 },
      2023: { amarela: 0.0502, indigena: 0.0451, negra: 0.0485, branca: 0.0415 },
      2024: { amarela: 0.0356, indigena: 0.0502, negra: 0.0538, branca: 0.0428 },
    }
  },
  {
    id: 'rais_10_6', name: 'Salário Médio - Ensino Fundamental/Médio em Vínculos Formais',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'salario-medio-de-pessoas-com-ensino-fundamental-ou-medio-em-vinculos-formais-ativos-rais-10-6',
    formato: 'money',
    series: {
      2018: { amarela: 1995.214, indigena: 1852.7548, negra: 1783.0715, branca: 2087.0967 },
      2019: { amarela: 2111.4884, indigena: 1880.2367, negra: 1845.6561, branca: 2165.1925 },
      2020: { amarela: 2076.5468, indigena: 1881.9464, negra: 1828.6835, branca: 2143.3337 },
      2021: { amarela: 2216.2973, indigena: 2005.2368, negra: 1969.8786, branca: 2320.4864 },
      2022: { amarela: 2992.7994, indigena: 3744.4107, negra: 2555.7625, branca: 2969.463 },
      2023: { amarela: 2504.7935, indigena: 2387.3305, negra: 2404.9322, branca: 2757.0496 },
      2024: { amarela: 2770.5762, indigena: 2565.9244, negra: 2542.5196, branca: 2919.7357 },
    }
  },
  {
    id: 'rais_10_7', name: 'Salário Médio - Ensino Superior em Vínculos Formais',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'salario-medio-de-pessoas-com-ensino-superior-em-vinculos-formais-ativos-rais-10-7',
    formato: 'money',
    series: {
      2018: { amarela: 7654.1054, indigena: 5185.8814, negra: 4342.7224, branca: 6096.7072 },
      2019: { amarela: 7731.4642, indigena: 5300.6783, negra: 4290.2622, branca: 5903.3396 },
      2020: { amarela: 7884.9745, indigena: 5287.9895, negra: 4312.9939, branca: 5986.4064 },
      2021: { amarela: 8055.769, indigena: 6081.2678, negra: 4638.6627, branca: 6420.7854 },
      2022: { amarela: 12908.1472, indigena: 8281.6534, negra: 7072.611, branca: 10002.6873 },
      2023: { amarela: 8710.5868, indigena: 5813.305, negra: 5870.1084, branca: 7908.1356 },
      2024: { amarela: 9375.6443, indigena: 6118.0503, negra: 6127.8776, branca: 8283.0935 },
    }
  },
  {
    id: 'rais_10_10', name: 'Percentual de Vínculos Formais em Cargos Gerenciais',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'percentual-de-vinculos-formais-em-cargos-gerenciais-rais-10-10',
    formato: 'percent',
    series: {
      2018: { amarela: 1.3415, indigena: 0.1519, negra: 0.2453, branca: 0.7621 },
      2019: { amarela: 1.2208, indigena: 0.1296, negra: 0.2457, branca: 0.7048 },
      2020: { amarela: 1.2536, indigena: 0.1383, negra: 0.2609, branca: 0.7327 },
      2021: { amarela: 1.2779, indigena: 0.1414, negra: 0.2585, branca: 0.688 },
      2022: { amarela: 1.5248, indigena: 0.1686, negra: 0.2764, branca: 0.7453 },
      2023: { amarela: 2.4023, indigena: 0.3719, negra: 0.4391, branca: 0.9352 },
      2024: { amarela: 2.3918, indigena: 0.356, negra: 0.4722, branca: 0.9442 },
    }
  },
  {
    id: 'rais_10_12', name: 'Paridade Racial - Oficiais da Polícia Militar em Relação à População',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'paridade-racial-de-vinculos-formais-de-oficiais-da-policia-militar-em-relacao-a-populacao-rais-10-12',
    formato: 'percent',
    series: {
      2018: { amarela: null, indigena: null, negra: 0.0006, branca: 0.0085 },
      2019: { amarela: null, indigena: null, negra: 0.0011, branca: 0.0085 },
      2020: { amarela: null, indigena: null, negra: 0.0016, branca: 0.0086 },
      2021: { amarela: null, indigena: null, negra: 0.001, branca: 0.0101 },
      2022: { amarela: 0.0172, indigena: null, negra: 0.0042, branca: 0.0114 },
    }
  },
  {
    id: 'rais_10_16', name: 'Paridade Racial - Magistratura em Relação à População',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'paridade-racial-de-vinculos-formais-de-magistratura-em-relacao-a-populacao-rais-10-16',
    formato: 'percent',
    series: {
      2018: { amarela: null, indigena: null, negra: 0.0015, branca: 0.0027 },
      2019: { amarela: null, indigena: null, negra: 0.0019, branca: 0.0004 },
      2020: { amarela: null, indigena: null, negra: 0.0018, branca: 0.0005 },
      2021: { amarela: null, indigena: null, negra: 0.0022, branca: 0.0013 },
      2022: { amarela: null, indigena: null, negra: 0.0024, branca: 0.0006 },
      2023: { amarela: 2.6706, indigena: 0.2074, negra: 0.2151, branca: 1.5129 },
      2024: { amarela: 2.7348, indigena: 0.1951, negra: 0.221, branca: 1.5264 },
    }
  },
  {
    id: 'rais_10_19', name: 'Paridade Racial - Delegados de Polícia em Relação à População',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'paridade-racial-de-vinculos-formais-de-delegados-de-policia-em-relacao-a-populacao-rais-10-19',
    formato: 'percent',
    series: {
      2018: { amarela: null, indigena: null, negra: 0.0003, branca: 0.001 },
      2019: { amarela: null, indigena: null, negra: 0.0001, branca: 0.0009 },
      2020: { amarela: null, indigena: null, negra: 0.0002, branca: 0.0006 },
      2021: { amarela: null, indigena: null, negra: 0.0002, branca: 0.0006 },
      2022: { amarela: null, indigena: null, negra: 0.0003, branca: 0.0007 },
      2023: { amarela: 1.5581, indigena: 0.1304, negra: 0.3682, branca: 1.045 },
      2024: { amarela: 1.4857, indigena: 0.1155, negra: 0.3858, branca: 1.0296 },
    }
  },
  {
    id: 'rais_10_20', name: 'Paridade Racial - Médicos em Relação à População',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'paridade-racial-de-vinculos-formais-de-medicos-em-relacao-a-populacao-rais-10-20',
    formato: 'percent',
    series: {
      2018: { amarela: 1.5996, indigena: 0.198, negra: 0.1716, branca: 0.5642 },
      2019: { amarela: 1.7116, indigena: 0.2099, negra: 0.1493, branca: 0.5524 },
      2020: { amarela: 1.7113, indigena: 0.1902, negra: 0.1538, branca: 0.553 },
      2021: { amarela: 1.9243, indigena: 0.2199, negra: 0.1662, branca: 0.5692 },
      2022: { amarela: 1.9109, indigena: 0.1302, negra: 0.175, branca: 0.5665 },
      2023: { amarela: 4.1636, indigena: 0.2864, negra: 0.3719, branca: 1.1951 },
      2024: { amarela: 3.985, indigena: 0.2851, negra: 0.3784, branca: 1.2132 },
    }
  },
  {
    id: 'rais_10_24', name: 'Paridade Racial - Advocacia em Relação à População',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'paridade-racial-da-advocacia-em-relacao-a-populacao-em-vinculos-formais-ativos-rais-10-24',
    formato: 'percent',
    series: {
      2018: { amarela: 1.482, indigena: 0.1388, negra: 0.2178, branca: 0.9964 },
      2019: { amarela: 1.3006, indigena: 0.1148, negra: 0.2185, branca: 0.9365 },
      2020: { amarela: 1.3534, indigena: 0.1219, negra: 0.2267, branca: 0.9456 },
      2021: { amarela: 1.2996, indigena: 0.1105, negra: 0.2203, branca: 0.8852 },
      2022: { amarela: 1.4835, indigena: 0.1181, negra: 0.2223, branca: 0.8577 },
      2023: { amarela: 2.4365, indigena: 0.2792, negra: 0.3513, branca: 1.2082 },
      2024: { amarela: 2.3912, indigena: 0.2527, negra: 0.3713, branca: 1.2252 },
    }
  },
  {
    id: 'tse_10_1', name: 'Paridade Racial em Assentos Locais (Vereadores) em Relação à População',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'paridade-racial-em-assentos-locais-(vereadores)-em-relacao-a-populacao-tse-10-1',
    formato: 'float',
    series: {
      2020: { amarela: 0.6592, indigena: 0.3561, negra: 0.5569, branca: 0.8512 },
      2024: { amarela: 0.465, indigena: 0.5247, negra: 0.5676, branca: 0.8291 },
    }
  },
  {
    id: 'tse_10_4', name: 'Paridade Racial em Candidaturas aos Parlamentos Locais',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'paridade-racial-em-candidaturas-aos-parlamentos-locais-tse-10-4',
    formato: 'percent',
    series: {
      2020: { amarela: 0.5484, indigena: 0.4438, negra: 0.6081, branca: 0.7176 },
      2024: { amarela: 0.6218, indigena: 0.5955, negra: 0.6224, branca: 0.687 },
    }
  },
  {
    id: 'tse_10_7', name: 'Taxa de Sucesso em Eleições Locais',
    group: 'ODS 10 - Redução das Desigualdades',
    slug: 'taxa-de-sucesso-em-eleicoes--locais-tse-10-7',
    formato: 'percent',
    series: {
      2020: { amarela: 0.1291, indigena: 0.0862, negra: 0.0984, branca: 0.1274 },
      2024: { amarela: 0.0957, indigena: 0.1128, negra: 0.1168, branca: 0.1545 },
    }
  },

  // ═══════════════════════════════════════
  // ODS 11 - Cidades e Comunidades Sustentáveis
  // ═══════════════════════════════════════
  {
    id: 'sim_11_1', name: 'Taxa de Mortalidade por Acidentes de Transporte Terrestre por 100 mil hab.',
    group: 'ODS 11 - Cidades e Comunidades Sustentáveis',
    slug: 'taxa-de-mortalidade-por-acidentes-de-transporte-terrestre-por-100-mil-habitantes-sim-11-1',
    formato: 'float',
    series: {
      2018: { amarela: 8.0564, indigena: 6.3759, negra: 16.0493, branca: 14.9315 },
      2019: { amarela: 8.2982, indigena: 8.2654, negra: 15.8011, branca: 14.0633 },
      2020: { amarela: 9.5889, indigena: 7.7339, negra: 16.502, branca: 13.7337 },
      2021: { amarela: 8.8024, indigena: 8.3619, negra: 17.0747, branca: 14.23 },
      2022: { amarela: 8.234, indigena: 10.8338, negra: 17.7267, branca: 15.0308 },
    }
  },
  {
    id: 'sim_11_2', name: 'Taxa de Mortalidade Atribuída à Poluição do Ar por 100 mil hab.',
    group: 'ODS 11 - Cidades e Comunidades Sustentáveis',
    slug: 'taxa-de-mortalidade-em-adultos-atribuida-a-poluicao-do-ar-domestico-e-ambiental-por-100-mil-habitantes-sim-11-2',
    formato: 'float',
    series: {
      2018: { amarela: 270.0028, indigena: 62.6436, negra: 131.4753, branca: 222.3916 },
      2019: { amarela: 256.2205, indigena: 58.0938, negra: 135.4967, branca: 223.1991 },
      2020: { amarela: 239.8345, indigena: 61.246, negra: 126.9501, branca: 194.0091 },
      2021: { amarela: 248.2729, indigena: 62.7532, negra: 130.3526, branca: 201.6699 },
      2022: { amarela: 295.7195, indigena: 77.6285, negra: 152.3349, branca: 238.5506 },
    }
  },

  // ═══════════════════════════════════════
  // ODS 16 - Paz, Justiça e Instituições Eficazes
  // ═══════════════════════════════════════
  {
    id: 'sim_16_1', name: 'Taxa de Mortalidade por Causas Externas por 100 mil hab.',
    group: 'ODS 16 - Paz, Justiça e Instituições Eficazes',
    slug: 'taxa-de-mortalidade-por-causas-externas-por-100-mil-habitantes-sim-16-1',
    formato: 'float',
    series: {
      2018: { amarela: 38.3252, indigena: 44.4722, negra: 68.6814, branca: 45.0794 },
      2019: { amarela: 33.9884, indigena: 41.4056, negra: 62.9833, branca: 42.6202 },
      2020: { amarela: 42.7551, indigena: 39.9193, negra: 65.1904, branca: 41.8672 },
      2021: { amarela: 38.0309, indigena: 48.0613, negra: 65.2797, branca: 43.0543 },
      2022: { amarela: 45.0519, indigena: 50.0146, negra: 68.2847, branca: 46.6799 },
    }
  },
  {
    id: 'sim_16_2', name: 'Taxa de Mortalidade por Agressão por 100 mil hab.',
    group: 'ODS 16 - Paz, Justiça e Instituições Eficazes',
    slug: 'taxa-de-mortalidade-por-agressao-por-100-mil-habitantes-sim-16-2',
    formato: 'float',
    series: {
      2018: { amarela: 9.6676, indigena: 19.1278, negra: 36.7599, branca: 13.233 },
      2019: { amarela: 7.5025, indigena: 14.6415, negra: 28.6287, branca: 10.4968 },
      2020: { amarela: 11.5066, indigena: 14.999, negra: 31.1002, branca: 10.7703 },
      2021: { amarela: 6.6582, indigena: 15.6297, negra: 29.8929, branca: 10.1948 },
      2022: { amarela: 10.1161, indigena: 16.6172, negra: 30.1172, branca: 10.7352 },
    }
  },
  {
    id: 'sim_16_3', name: 'Taxa de Homicídios por 100 mil hab.',
    group: 'ODS 16 - Paz, Justiça e Instituições Eficazes',
    slug: 'taxa-de-homicidios-por-100-mil-habitantes-sim-16-3',
    formato: 'float',
    series: {
      2018: { amarela: 10.5883, indigena: 19.1278, negra: 38.0903, branca: 13.7441 },
      2019: { amarela: 7.6161, indigena: 14.6415, negra: 29.5433, branca: 10.9107 },
      2020: { amarela: 11.9579, indigena: 15.0771, negra: 32.5582, branca: 11.2484 },
      2021: { amarela: 7.1096, indigena: 15.6297, negra: 31.4196, branca: 10.6992 },
      2022: { amarela: 10.5866, indigena: 16.6987, negra: 31.5159, branca: 11.2337 },
    }
  },
  {
    id: 'sim_16_4', name: 'Taxa de Homicídios de Mulheres por 100 mil hab.',
    group: 'ODS 16 - Paz, Justiça e Instituições Eficazes',
    slug: 'taxa-de-homicidios-de-mulheres-por-100-mil-habitantes-sim-16-4',
    formato: 'float',
    series: {
      2018: { amarela: 1.0358, indigena: 3.7459, negra: 2.6643, branca: 1.4435 },
      2019: { amarela: 0.9094, indigena: 2.5977, negra: 2.1155, branca: 1.2647 },
      2020: { amarela: 1.0153, indigena: 3.2029, negra: 2.199, branca: 1.2301 },
      2021: { amarela: 0.79, indigena: 2.9696, negra: 2.2134, branca: 1.2458 },
      2022: { amarela: 1.2939, indigena: 3.8285, negra: 2.2406, branca: 1.3246 },
    }
  },
  {
    id: 'sim_16_5', name: 'Taxa de Óbitos por Arma de Fogo por 100 mil hab.',
    group: 'ODS 16 - Paz, Justiça e Instituições Eficazes',
    slug: 'taxa-de-obitos-por-arma-de-fogo-por-100-mil-habitantes-sim-16-5',
    formato: 'float',
    series: {
      2018: { amarela: 7.4809, indigena: 5.818, negra: 29.5115, branca: 10.1698 },
      2019: { amarela: 5.1153, indigena: 4.8018, negra: 21.7576, branca: 7.952 },
      2020: { amarela: 8.5736, indigena: 6.2496, negra: 24.5722, branca: 8.1763 },
      2021: { amarela: 5.304, indigena: 6.7989, negra: 24.165, branca: 7.9619 },
      2022: { amarela: 7.5283, indigena: 7.3311, negra: 23.8062, branca: 8.4021 },
    }
  },
  {
    id: 'sinan_16_1', name: 'Taxa de Violência Física contra Menores por 100 mil hab.',
    group: 'ODS 16 - Paz, Justiça e Instituições Eficazes',
    slug: 'taxa-de-violencia-fisica-contra-menores-por-100-mil-habitantes-sinan-16-1',
    formato: 'float',
    series: {
      2018: { amarela: 28.0821, indigena: 38.5744, negra: 16.0337, branca: 13.1266 },
      2019: { amarela: 22.3937, indigena: 42.429, negra: 15.3862, branca: 12.3846 },
      2020: { amarela: 22.1108, indigena: 29.7637, negra: 10.8536, branca: 7.7938 },
      2021: { amarela: 22.5703, indigena: 25.2419, negra: 11.6064, branca: 8.5848 },
      2022: { amarela: 29.6425, indigena: 38.3662, negra: 15.5713, branca: 12.1481 },
      2023: { amarela: 41.0525, indigena: 50.7477, negra: 20.8028, branca: 16.5424 },
    }
  },
  {
    id: 'sinan_16_2', name: 'Taxa de Violência Sexual contra Menores por 100 mil hab.',
    group: 'ODS 16 - Paz, Justiça e Instituições Eficazes',
    slug: 'taxa-de-violencia-sexual-contra-menores-por-100-mil-habitantes-sinan-16-2',
    formato: 'float',
    series: {
      2018: { amarela: 20.256, indigena: 27.0977, negra: 13.8536, branca: 11.3317 },
      2019: { amarela: 24.3262, indigena: 34.5572, negra: 14.8171, branca: 11.8546 },
      2020: { amarela: 24.367, indigena: 26.6389, negra: 12.469, branca: 9.4499 },
      2021: { amarela: 32.614, indigena: 32.9005, negra: 15.3294, branca: 11.2351 },
      2022: { amarela: 33.0538, indigena: 46.7563, negra: 19.8466, branca: 14.794 },
      2023: { amarela: 39.8763, indigena: 71.5192, negra: 26.9568, branca: 21.4001 },
    }
  },
  {
    id: 'sinan_16_3', name: 'Taxa de Violência Física por 100 mil hab.',
    group: 'ODS 16 - Paz, Justiça e Instituições Eficazes',
    slug: 'taxa-de-violencia-fisica-por-100-mil-habitantes-sinan-16-3',
    formato: 'float',
    series: {
      2018: { amarela: 149.0425, indigena: 174.7803, negra: 77.5492, branca: 71.2373 },
      2019: { amarela: 150.3903, indigena: 192.9376, negra: 83.8315, branca: 73.5817 },
      2020: { amarela: 126.1218, indigena: 159.2866, negra: 68.4604, branca: 56.4094 },
      2021: { amarela: 128.7633, indigena: 149.9668, negra: 74.1996, branca: 58.8465 },
      2022: { amarela: 206.9095, indigena: 199.0808, negra: 93.3264, branca: 72.3597 },
      2023: { amarela: 282.0745, indigena: 275.406, negra: 125.3019, branca: 96.5314 },
    }
  },
  {
    id: 'sinan_16_4', name: 'Taxa de Violência Sexual por 100 mil hab.',
    group: 'ODS 16 - Paz, Justiça e Instituições Eficazes',
    slug: 'taxa-de-violencia-sexual-por-100-mil-habitantes-sinan-16-4',
    formato: 'float',
    series: {
      2018: { amarela: 34.4121, indigena: 35.227, negra: 20.1248, branca: 16.8284 },
      2019: { amarela: 38.7627, indigena: 42.3502, negra: 21.7285, branca: 18.1904 },
      2020: { amarela: 40.386, indigena: 32.8104, negra: 18.5172, branca: 14.6509 },
      2021: { amarela: 47.7361, indigena: 42.9035, negra: 22.3499, branca: 16.9815 },
      2022: { amarela: 61.0495, indigena: 58.9748, negra: 29.0652, branca: 22.6284 },
      2023: { amarela: 71.8714, indigena: 89.0325, negra: 39.8644, branca: 32.3675 },
    }
  },
  {
    id: 'sinan_16_5', name: 'Taxa de Violência Psicológica por 100 mil hab.',
    group: 'ODS 16 - Paz, Justiça e Instituições Eficazes',
    slug: 'taxa-de-violencia-psicologica-por-100-mil-habitantes-sinan-16-5',
    formato: 'float',
    series: {
      2018: { amarela: 60.883, indigena: 52.2827, negra: 33.383, branca: 32.2976 },
      2019: { amarela: 61.6111, indigena: 65.4146, negra: 36.7676, branca: 33.1844 },
      2020: { amarela: 52.3439, indigena: 55.0746, negra: 30.4247, branca: 25.7993 },
      2021: { amarela: 64.7766, indigena: 49.7024, negra: 34.0891, branca: 28.0166 },
      2022: { amarela: 100.5729, indigena: 63.2106, negra: 42.3089, branca: 34.8513 },
      2023: { amarela: 133.2737, indigena: 90.01, negra: 55.7071, branca: 44.3729 },
    }
  },
];

// Processar indicadores adicionando fonte, url e artigoCerd
export const odsRacialIndicators: OdsRacialIndicator[] = rawIndicators.map(ind => ({
  ...ind,
  fonte: getFonte(ind.id),
  url: buildUrl(ind.slug),
  artigoCerd: getArtigosCerd(ind.id),
}));

// Agrupamento por ODS
export const odsGroups = [
  'ODS 1 - Erradicação da Pobreza',
  'ODS 2 - Fome Zero e Agricultura Sustentável',
  'ODS 3 - Boa Saúde e Bem-Estar',
  'ODS 4 - Educação de Qualidade',
  'ODS 5 - Igualdade de Gênero',
  'ODS 6 - Água Potável e Saneamento',
  'ODS 8 - Emprego Decente e Crescimento Econômico',
  'ODS 9 - Indústria, Inovação e Infraestrutura',
  'ODS 10 - Redução das Desigualdades',
  'ODS 11 - Cidades e Comunidades Sustentáveis',
  'ODS 16 - Paz, Justiça e Instituições Eficazes',
] as const;

// Cores oficiais por ODS
export const odsColors: Record<string, string> = {
  'ODS 1': '#E5243B',
  'ODS 2': '#DDA63A',
  'ODS 3': '#4C9F38',
  'ODS 4': '#C5192D',
  'ODS 5': '#FF3A21',
  'ODS 6': '#26BDE2',
  'ODS 8': '#A21942',
  'ODS 9': '#FD6925',
  'ODS 10': '#DD1367',
  'ODS 11': '#FD9D24',
  'ODS 16': '#00689D',
};

export function getOdsColor(group: string): string {
  const odsNum = group.match(/ODS (\d+)/)?.[0] || '';
  return odsColors[odsNum] || '#6B7280';
}

export const TOTAL_ODS_RACIAL = odsRacialIndicators.length;

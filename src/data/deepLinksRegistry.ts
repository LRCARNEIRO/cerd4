/**
 * Registry of all deep links used in "cruzamento indireto" badges.
 * Each entry maps a calculation to its source URLs for health-check validation.
 */
export interface DeepLinkEntry {
  /** Which indicator/calculation uses this link */
  indicador: string;
  /** Which section of the system */
  secao: string;
  /** The URL to test */
  url: string;
  /** Source name */
  fonte: string;
  /** What data this link provides */
  descricao: string;
}

export const deepLinksRegistry: DeepLinkEntry[] = [
  // === GRUPOS FOCAIS ===
  {
    indicador: 'Juventude Negra — estimativa populacional',
    secao: 'Grupos Focais',
    url: 'https://sidra.ibge.gov.br/Tabela/9605',
    fonte: 'SIDRA/IBGE',
    descricao: 'Proporção negra (55,5%) — Censo 2022, Tab. 9605',
  },
  {
    indicador: 'Juventude Negra — estimativa populacional',
    secao: 'Grupos Focais',
    url: 'https://sidra.ibge.gov.br/Tabela/7113',
    fonte: 'SIDRA/IBGE',
    descricao: 'População 15-29 anos — PNAD Contínua, Tab. 7113',
  },
  {
    indicador: 'Mortalidade Materna por raça',
    secao: 'Grupos Focais',
    url: 'https://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def',
    fonte: 'DataSUS/SIM',
    descricao: 'Óbitos maternos por cor/raça — SIM TabNet',
  },
  {
    indicador: 'Mortalidade Materna por raça',
    secao: 'Grupos Focais',
    url: 'https://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def',
    fonte: 'DataSUS/SINASC',
    descricao: 'Nascidos vivos por cor/raça — SINASC TabNet',
  },

  // === INTERSECCIONALIDADE — Trabalho ===
  {
    indicador: 'Mercado de trabalho raça × gênero',
    secao: 'Interseccionalidade',
    url: 'https://www.dieese.org.br/boletimespecial/2024/boletimEspecial02.html',
    fonte: 'DIEESE',
    descricao: 'Boletim Consciência Negra Nov/2024 — rendimento, desemprego, informalidade',
  },

  // === INTERSECCIONALIDADE — Educação ===
  {
    indicador: 'Educação raça × gênero',
    secao: 'Interseccionalidade',
    url: 'https://www.fiocruz.br/sites/fiocruz.br/files/documentos_2/o_que_dizem_os_dados_sobre_a_vida_das_mulheres_negras_no_brasil.pdf',
    fonte: 'Fiocruz/MIR',
    descricao: 'Informe MIR/Fiocruz 2023 — analfabetismo e escolaridade por raça × gênero',
  },
  {
    indicador: 'Educação raça × gênero',
    secao: 'Interseccionalidade',
    url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-escolar',
    fonte: 'INEP',
    descricao: 'Censo Escolar 2022 — matrículas por cor/raça',
  },

  // === INTERSECCIONALIDADE — Saúde ===
  {
    indicador: 'Saúde materna raça × classe',
    secao: 'Interseccionalidade',
    url: 'https://ieps.org.br/wp-content/uploads/2025/07/IEPS_Boletim51.pdf',
    fonte: 'IEPS',
    descricao: 'Boletim IEPS Jul/2025 — mortalidade materna por raça (série até 2023)',
  },
  {
    indicador: 'Saúde materna raça × classe',
    secao: 'Interseccionalidade',
    url: 'https://www.gov.br/mdh/pt-br/assuntos/noticias/2025/marco/governo-federal-lanca-relatorio-anual-socioeconomico-da-mulher',
    fonte: 'RASEAM',
    descricao: 'RASEAM 2025 — mortalidade materna negra (dado SIM 2022)',
  },

  // === COVID RACIAL ===
  {
    indicador: 'Mortalidade materna COVID',
    secao: 'COVID Racial',
    url: 'https://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def',
    fonte: 'DataSUS/SIM',
    descricao: 'Mortalidade materna — série temporal por cor/raça',
  },
  {
    indicador: 'Cobertura vacinal COVID',
    secao: 'COVID Racial',
    url: 'https://sipni.datasus.gov.br',
    fonte: 'SI-PNI/DataSUS',
    descricao: 'Sistema de Informação do PNI — cobertura vacinal',
  },

  // === SÉRIES TEMPORAIS ===
  {
    indicador: 'Homicídio negro — série temporal',
    secao: 'Séries Temporais',
    url: 'https://www.ipea.gov.br/atlasviolencia/',
    fonte: 'IPEA/FBSP',
    descricao: 'Atlas da Violência — taxa de homicídio por raça',
  },
  {
    indicador: 'Desemprego negro — série temporal',
    secao: 'Séries Temporais',
    url: 'https://sidra.ibge.gov.br/Tabela/7113',
    fonte: 'SIDRA/IBGE',
    descricao: 'PNAD Contínua — desemprego por cor/raça',
  },
  {
    indicador: 'Renda média negra — série temporal',
    secao: 'Séries Temporais',
    url: 'https://sidra.ibge.gov.br/Tabela/6800',
    fonte: 'SIDRA/IBGE',
    descricao: 'PNAD Contínua — rendimento mensal por cor/raça',
  },
  {
    indicador: 'Feminicídio mulheres negras',
    secao: 'Séries Temporais',
    url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    fonte: 'FBSP',
    descricao: '19º Anuário FBSP 2025 — feminicídio por raça',
  },
  {
    indicador: 'Terras Indígenas homologadas',
    secao: 'Séries Temporais',
    url: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas',
    fonte: 'FUNAI',
    descricao: 'FUNAI — Coordenação de Geoprocessamento',
  },

  // === DADOS NOVOS ===
  {
    indicador: 'Denúncias discriminação racial',
    secao: 'Dados Novos',
    url: 'https://www.gov.br/mdh/pt-br/ondh/painel-de-dados',
    fonte: 'ONDH/MDH',
    descricao: 'Painel de Dados ONDH 2024 — Disque 100',
  },
  {
    indicador: 'Candidaturas negras TSE',
    secao: 'Dados Novos',
    url: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2024',
    fonte: 'TSE',
    descricao: 'TSE Dados Abertos — candidatos 2024 por cor/raça',
  },
  {
    indicador: 'Sistema prisional',
    secao: 'Dados Novos',
    url: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen',
    fonte: 'SISDEPEN',
    descricao: 'SISDEPEN — população carcerária por raça',
  },
  {
    indicador: 'Déficit habitacional',
    secao: 'Dados Novos',
    url: 'https://fjp.mg.gov.br/deficit-habitacional-no-brasil/',
    fonte: 'FJP',
    descricao: 'Fundação João Pinheiro — déficit habitacional 2022',
  },
];

/**
 * Registry of all deep links used across the system for health-check validation.
 * Each entry maps a data source URL to its section, indicator, and description.
 *
 * Coverage: Dados Gerais, Common Core, Segurança/Saúde/Educação, Interseccionalidade,
 * COVID Racial, Vulnerabilidades, Adm. Pública, Dados Novos, Lacunas CERD,
 * Fontes de Dados, Orçamento, Grupos Focais, Séries Temporais.
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
  // ═══════════════════════════════════════════
  // DADOS GERAIS
  // ═══════════════════════════════════════════
  {
    indicador: 'População total — Censo 2022',
    secao: 'Dados Gerais',
    url: 'https://sidra.ibge.gov.br/Tabela/9514',
    fonte: 'SIDRA/IBGE',
    descricao: 'Tabela 9514 — População residente total (Censo 2022)',
  },
  {
    indicador: 'Composição racial — Censo 2022',
    secao: 'Dados Gerais',
    url: 'https://sidra.ibge.gov.br/Tabela/9605',
    fonte: 'SIDRA/IBGE',
    descricao: 'Tabela 9605 — População por cor/raça (Censo 2022)',
  },
  {
    indicador: 'População indígena — Censo 2022',
    secao: 'Dados Gerais',
    url: 'https://www.ibge.gov.br/brasil-indigena/',
    fonte: 'IBGE',
    descricao: 'IBGE Brasil Indígena — 1.694.836 pessoas indígenas (metodologia ampliada)',
  },
  {
    indicador: 'População quilombola — Censo 2022',
    secao: 'Dados Gerais',
    url: 'https://sidra.ibge.gov.br/Tabela/9578',
    fonte: 'SIDRA/IBGE',
    descricao: 'Tabela 9578 — Primeira contagem oficial de quilombolas',
  },
  {
    indicador: 'Cor/raça PNAD Contínua — série anual',
    secao: 'Dados Gerais',
    url: 'https://sidra.ibge.gov.br/Tabela/6403',
    fonte: 'SIDRA/IBGE',
    descricao: 'Tabela 6403 — PNAD Contínua Anual, população por cor/raça',
  },
  {
    indicador: 'Rendimento médio por cor/raça',
    secao: 'Dados Gerais',
    url: 'https://sidra.ibge.gov.br/tabela/6405',
    fonte: 'SIDRA/IBGE',
    descricao: 'Tabela 6405 — Rendimento mensal médio por cor/raça',
  },
  {
    indicador: 'Desocupação por cor/raça',
    secao: 'Dados Gerais',
    url: 'https://sidra.ibge.gov.br/tabela/6402',
    fonte: 'SIDRA/IBGE',
    descricao: 'Tabela 6402 — Taxa de desocupação por cor/raça',
  },

  // ═══════════════════════════════════════════
  // COMMON CORE
  // ═══════════════════════════════════════════
  {
    indicador: 'Indicadores vitais — mortalidade/fecundidade',
    secao: 'Common Core',
    url: 'https://sidra.ibge.gov.br/tabela/7358',
    fonte: 'SIDRA/IBGE',
    descricao: 'Tabela 7358 — Taxa de mortalidade infantil e fecundidade',
  },

  // ═══════════════════════════════════════════
  // SEGURANÇA / SAÚDE / EDUCAÇÃO
  // ═══════════════════════════════════════════
  {
    indicador: 'Homicídios e violência por raça',
    secao: 'Segurança/Saúde/Educação',
    url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    fonte: 'FBSP',
    descricao: '19º Anuário FBSP 2025 — homepage com dados de segurança pública',
  },
  {
    indicador: 'Homicídios e violência por raça',
    secao: 'Segurança/Saúde/Educação',
    url: 'https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf',
    fonte: 'FBSP',
    descricao: '19º Anuário FBSP 2025 (PDF direto)',
  },
  {
    indicador: 'Atlas da Violência — taxa homicídio por raça',
    secao: 'Segurança/Saúde/Educação',
    url: 'https://www.ipea.gov.br/atlasviolencia/',
    fonte: 'IPEA/FBSP',
    descricao: 'Atlas da Violência — portal',
  },
  {
    indicador: 'Atlas da Violência 2025 — PDF',
    secao: 'Segurança/Saúde/Educação',
    url: 'https://www.ipea.gov.br/atlasviolencia/arquivos/artigos/5999-atlasdaviolencia2025.pdf',
    fonte: 'IPEA/FBSP',
    descricao: 'Atlas da Violência 2025 — PDF direto p. 79 (homicídio por raça)',
  },
  {
    indicador: 'Ensino superior por cor/raça',
    secao: 'Segurança/Saúde/Educação',
    url: 'https://sidra.ibge.gov.br/Tabela/7129',
    fonte: 'SIDRA/IBGE',
    descricao: 'Tabela 7129 — Nível de instrução por cor/raça (PNAD Contínua)',
  },
  {
    indicador: 'PNAD Contínua Educação 2024',
    secao: 'Segurança/Saúde/Educação',
    url: 'https://www.ibge.gov.br/estatisticas/sociais/educacao.html',
    fonte: 'IBGE',
    descricao: 'IBGE — Portal Estatísticas Educação',
  },
  {
    indicador: 'Censo Educação Superior',
    secao: 'Segurança/Saúde/Educação',
    url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-da-educacao-superior',
    fonte: 'INEP',
    descricao: 'INEP — Censo da Educação Superior',
  },
  {
    indicador: 'TabNet/DataSUS — Portal Saúde',
    secao: 'Segurança/Saúde/Educação',
    url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/',
    fonte: 'DataSUS',
    descricao: 'DataSUS TabNet — Portal de informações em saúde',
  },

  // ═══════════════════════════════════════════
  // INTERSECCIONALIDADE
  // ═══════════════════════════════════════════
  {
    indicador: 'Feminicídio mulheres negras',
    secao: 'Interseccionalidade',
    url: 'https://publicacoes.forumseguranca.org.br/items/c3605778-37b3-4ad6-8239-94e4cb236444',
    fonte: 'FBSP',
    descricao: '19º Anuário FBSP 2025 — repositório publicação',
  },
  {
    indicador: 'Quilombolas — Censo 2022',
    secao: 'Interseccionalidade',
    url: 'https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22327-quilombolas.html',
    fonte: 'IBGE',
    descricao: 'IBGE Educa — Quilombolas',
  },
  {
    indicador: 'Indígenas — Censo 2022',
    secao: 'Interseccionalidade',
    url: 'https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22326-indigenas-2.html',
    fonte: 'IBGE',
    descricao: 'IBGE Educa — Indígenas',
  },
  {
    indicador: 'FUNAI — portal',
    secao: 'Interseccionalidade',
    url: 'https://www.gov.br/funai/pt-br',
    fonte: 'FUNAI',
    descricao: 'Fundação Nacional dos Povos Indígenas — portal principal',
  },
  {
    indicador: 'INCRA — Quilombolas',
    secao: 'Interseccionalidade',
    url: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas',
    fonte: 'INCRA',
    descricao: 'INCRA — Governança fundiária quilombola',
  },
  {
    indicador: 'Violência contra pessoas trans',
    secao: 'Interseccionalidade',
    url: 'https://antrabrasil.org/wp-content/uploads/2026/01/dossie-antra-2026.pdf',
    fonte: 'ANTRA',
    descricao: 'Dossiê ANTRA 2026 — assassinatos de pessoas trans (PDF)',
  },
  {
    indicador: 'Violência contra pessoas trans',
    secao: 'Interseccionalidade',
    url: 'https://antrabrasil.org/assassinatos/',
    fonte: 'ANTRA',
    descricao: 'ANTRA — Página de monitoramento de assassinatos',
  },
  {
    indicador: 'Mercado de trabalho raça × gênero',
    secao: 'Interseccionalidade',
    url: 'https://www.dieese.org.br/boletimespecial/2024/boletimEspecial02.html',
    fonte: 'DIEESE',
    descricao: 'Boletim Consciência Negra Nov/2024 — rendimento, desemprego, informalidade',
  },
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
  {
    indicador: 'Dados Disque 100 — LGBTQIA+',
    secao: 'Interseccionalidade',
    url: 'https://www.gov.br/mdh/pt-br/acesso-a-informacao/dados-abertos/disque100',
    fonte: 'ONDH/MDH',
    descricao: 'Disque 100 — dados abertos CSV',
  },
  {
    indicador: 'Pessoas trans — Agência Brasil',
    secao: 'Interseccionalidade',
    url: 'https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2026-01/brasil-ainda-e-o-pais-que-mais-mata-pessoas-trans-e-travestis-no-mundo',
    fonte: 'Agência Brasil',
    descricao: 'Agência Brasil Jan/2026 — mortes de pessoas trans',
  },

  // ═══════════════════════════════════════════
  // COVID RACIAL
  // ═══════════════════════════════════════════
  {
    indicador: 'Raça e Saúde — COVID-19',
    secao: 'COVID Racial',
    url: 'https://www.racaesaude.org.br/',
    fonte: 'Raça e Saúde Pública',
    descricao: 'Portal Raça e Saúde — mortalidade COVID por raça (SIM/DataSUS)',
  },
  {
    indicador: 'Cor da morte na pandemia',
    secao: 'COVID Racial',
    url: 'https://www.scielosp.org/article/physis/2024.v34/e34053/',
    fonte: 'SciELO',
    descricao: 'SciELO — A cor da morte na pandemia (artigo)',
  },
  {
    indicador: 'SIVEP-Gripe / NOIS PUC-Rio',
    secao: 'COVID Racial',
    url: 'https://bigdata-covid19.icict.fiocruz.br/',
    fonte: 'Fiocruz/NOIS',
    descricao: 'Big Data COVID-19 — Fiocruz/PUC-Rio',
  },
  {
    indicador: 'Mortalidade materna COVID',
    secao: 'COVID Racial',
    url: 'https://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def',
    fonte: 'DataSUS/SIM',
    descricao: 'Mortalidade materna — série temporal por cor/raça',
  },
  {
    indicador: 'Mortalidade materna — IEPS',
    secao: 'COVID Racial',
    url: 'https://ieps.org.br/mortalidade-materna-de-mulheres-pretas-e-duas-vezes-maior-do-que-de-brancas/',
    fonte: 'IEPS',
    descricao: 'IEPS — Mortalidade materna por raça (análise)',
  },
  {
    indicador: 'PNAD COVID-19',
    secao: 'COVID Racial',
    url: 'https://covid19.ibge.gov.br/pnad-covid/',
    fonte: 'IBGE',
    descricao: 'PNAD COVID-19 (IBGE, 2020) — impacto socioeconômico',
  },
  {
    indicador: 'Políticas Sociais — IPEA',
    secao: 'COVID Racial',
    url: 'https://repositorio.ipea.gov.br/bitstreams/f8a9b99e-3b0a-4bc7-bd9c-1dc4ec9bb7a8/download',
    fonte: 'IPEA',
    descricao: 'IPEA — Políticas Sociais nº 29, Cap. 8 (igualdade racial e COVID)',
  },
  {
    indicador: 'Cobertura vacinal COVID',
    secao: 'COVID Racial',
    url: 'https://sipni.datasus.gov.br',
    fonte: 'SI-PNI/DataSUS',
    descricao: 'Sistema de Informação do PNI — cobertura vacinal',
  },
  {
    indicador: 'Vacinação e raça — Fiocruz',
    secao: 'COVID Racial',
    url: 'https://www.epsjv.fiocruz.br/podcast/negros-sao-os-que-mais-morrem-por-covid-19-e-os-que-menos-recebem-vacinas-no-brasil',
    fonte: 'Fiocruz/EPSJV',
    descricao: 'Fiocruz — Vacinação e raça (análise)',
  },

  // ═══════════════════════════════════════════
  // VULNERABILIDADES
  // ═══════════════════════════════════════════
  {
    indicador: 'Chefia familiar monoparental negra',
    secao: 'Vulnerabilidades',
    url: 'https://www.gov.br/mulheres/pt-br/observatorio-brasil-da-igualdade-de-genero/raseam/ministeriodasmulheres-obig-raseam-2024.pdf',
    fonte: 'RASEAM',
    descricao: 'RASEAM 2024 — chefia familiar monoparental (PDF)',
  },
  {
    indicador: 'Insegurança alimentar negra',
    secao: 'Vulnerabilidades',
    url: 'https://olheparaafome.com.br/wp-content/uploads/2022/06/Relatorio-II-VIGISAN-2022.pdf',
    fonte: 'II VIGISAN',
    descricao: 'II VIGISAN 2022 — Insegurança Alimentar (PDF)',
  },
  {
    indicador: 'Desocupação por cor/raça',
    secao: 'Vulnerabilidades',
    url: 'https://sidra.ibge.gov.br/Tabela/6381',
    fonte: 'SIDRA/IBGE',
    descricao: 'Tabela 6381 — Desocupação por cor/raça',
  },

  // ═══════════════════════════════════════════
  // ADMINISTRAÇÃO PÚBLICA
  // ═══════════════════════════════════════════
  {
    indicador: 'ESTADIC 2024',
    secao: 'Administração Pública',
    url: 'https://www.ibge.gov.br/estatisticas/sociais/educacao/16770-pesquisa-de-informacoes-basicas-estaduais.html',
    fonte: 'IBGE',
    descricao: 'ESTADIC 2024 — Informações básicas estaduais',
  },
  {
    indicador: 'ESTADIC 2024 — resultados',
    secao: 'Administração Pública',
    url: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/44891-estadic-2024-tres-estados-nao-tem-canal-de-denuncias-de-violacao-de-direitos-raciais',
    fonte: 'IBGE Agência',
    descricao: 'ESTADIC 2024 — matéria sobre canais de denúncia racial',
  },
  {
    indicador: 'MUNIC 2024',
    secao: 'Administração Pública',
    url: 'https://www.ibge.gov.br/estatisticas/sociais/educacao/10586-pesquisa-de-informacoes-basicas-municipais.html',
    fonte: 'IBGE',
    descricao: 'MUNIC 2024 — Informações básicas municipais',
  },
  {
    indicador: 'MUNIC 2024 — divulgação',
    secao: 'Administração Pública',
    url: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/44906-ibge-divulga-dados-ineditos-sobre-politicas-de-igualdade-racial-nas-administracoes-estaduais-e-municipais',
    fonte: 'IBGE Agência',
    descricao: 'IBGE — dados inéditos sobre igualdade racial na adm. pública',
  },
  {
    indicador: 'SINAPIR',
    secao: 'Administração Pública',
    url: 'https://www.gov.br/igualdaderacial/pt-br/assuntos/sinapir',
    fonte: 'MIR',
    descricao: 'SINAPIR — Sistema Nacional de Promoção da Igualdade Racial',
  },
  {
    indicador: 'SINAPIR — lista entes',
    secao: 'Administração Pública',
    url: 'https://www.gov.br/igualdaderacial/pt-br/assuntos/sinapir/20260105SINAPIRGeralAtualizado.pdf',
    fonte: 'MIR',
    descricao: 'SINAPIR — Lista de entes participantes (Jan/2025, PDF)',
  },

  // ═══════════════════════════════════════════
  // LACUNAS CERD
  // ═══════════════════════════════════════════
  {
    indicador: 'Analfabetismo por cor/raça',
    secao: 'Lacunas CERD',
    url: 'https://sidra.ibge.gov.br/Tabela/7125',
    fonte: 'SIDRA/IBGE',
    descricao: 'Tabela 7125 — Analfabetismo por cor/raça',
  },
  {
    indicador: 'Boletim DIEESE — Consciência Negra',
    secao: 'Lacunas CERD',
    url: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf',
    fonte: 'DIEESE',
    descricao: 'DIEESE — Boletim Consciência Negra Nov/2024 (PDF)',
  },
  {
    indicador: 'Quilombolas — INCRA',
    secao: 'Lacunas CERD',
    url: 'https://www.palmares.gov.br/',
    fonte: 'Palmares',
    descricao: 'Fundação Cultural Palmares — certificações quilombolas',
  },

  // ═══════════════════════════════════════════
  // DADOS NOVOS
  // ═══════════════════════════════════════════
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
    indicador: 'Sistema prisional — painéis',
    secao: 'Dados Novos',
    url: 'https://www.gov.br/senappen/pt-br/centrais-de-conteudo/paineis-analise-de-dados',
    fonte: 'SISDEPEN',
    descricao: 'SISDEPEN — painéis de análise de dados',
  },
  {
    indicador: 'Déficit habitacional',
    secao: 'Dados Novos',
    url: 'https://fjp.mg.gov.br/deficit-habitacional-no-brasil/',
    fonte: 'FJP',
    descricao: 'Fundação João Pinheiro — déficit habitacional 2022',
  },
  {
    indicador: 'SINASE — socioeducativo',
    secao: 'Dados Novos',
    url: 'https://www.gov.br/mdh/pt-br/navegue-por-temas/crianca-e-adolescente/sinase',
    fonte: 'SINASE/MDH',
    descricao: 'SINASE — Sistema Nacional de Atendimento Socioeducativo',
  },
  {
    indicador: 'VIGITEL — doenças crônicas',
    secao: 'Dados Novos',
    url: 'https://svs.aids.gov.br/daent/cgdant/vigitel/publicacoes/',
    fonte: 'VIGITEL/DataSUS',
    descricao: 'VIGITEL — publicações sobre fatores de risco e doenças crônicas',
  },
  {
    indicador: 'Distorção idade-série',
    secao: 'Dados Novos',
    url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/indicadores-educacionais/taxas-de-distorcao-idade-serie',
    fonte: 'INEP',
    descricao: 'INEP — Taxas de distorção idade-série',
  },
  {
    indicador: 'Taxas de rendimento escolar',
    secao: 'Dados Novos',
    url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/indicadores-educacionais/taxas-de-rendimento',
    fonte: 'INEP',
    descricao: 'INEP — Taxas de rendimento (aprovação, reprovação, abandono)',
  },
  {
    indicador: 'Microdados Censo Escolar',
    secao: 'Dados Novos',
    url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
    fonte: 'INEP',
    descricao: 'INEP — Microdados do Censo Escolar',
  },
  {
    indicador: 'Microdados ENEM',
    secao: 'Dados Novos',
    url: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem',
    fonte: 'INEP',
    descricao: 'INEP — Microdados do ENEM',
  },
  {
    indicador: 'Terras Indígenas — Geoprocessamento',
    secao: 'Dados Novos',
    url: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas',
    fonte: 'FUNAI',
    descricao: 'FUNAI — Geoprocessamento e mapas de Terras Indígenas',
  },
  {
    indicador: 'Certidões Palmares',
    secao: 'Dados Novos',
    url: 'https://www.gov.br/palmares/pt-br/servicos/certidoes-expedidas',
    fonte: 'Palmares',
    descricao: 'Fundação Cultural Palmares — certidões expedidas',
  },
  {
    indicador: 'Conflitos no campo',
    secao: 'Dados Novos',
    url: 'https://www.cptnacional.org.br/publicacoes/conflitos-no-campo-brasil',
    fonte: 'CPT/CIMI',
    descricao: 'CPT — Conflitos no Campo Brasil',
  },
  {
    indicador: 'Censo 2022 — portal',
    secao: 'Dados Novos',
    url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html',
    fonte: 'IBGE',
    descricao: 'IBGE — Portal Censo Demográfico 2022',
  },

  // ═══════════════════════════════════════════
  // ORÇAMENTO
  // ═══════════════════════════════════════════
  {
    indicador: 'Execução orçamentária federal',
    secao: 'Orçamento',
    url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026',
    fonte: 'CGU',
    descricao: 'Portal da Transparência — Execução Federal 2018-2026',
  },
  {
    indicador: 'SIOP — planejamento orçamentário',
    secao: 'Orçamento',
    url: 'https://www.siop.planejamento.gov.br/siop/',
    fonte: 'MPO',
    descricao: 'SIOP — Sistema Integrado de Planejamento e Orçamento',
  },
  {
    indicador: 'SICONFI — orçamento subnacional',
    secao: 'Orçamento',
    url: 'https://siconfi.tesouro.gov.br/',
    fonte: 'STN',
    descricao: 'SICONFI — Sistema de Informações Contábeis e Fiscais',
  },
  {
    indicador: 'Portal Transparência — MIR',
    secao: 'Orçamento',
    url: 'https://portaldatransparencia.gov.br/orgaos/92000-MINISTERIO-DA-IGUALDADE-RACIAL',
    fonte: 'CGU',
    descricao: 'Portal da Transparência — Ministério da Igualdade Racial',
  },

  // ═══════════════════════════════════════════
  // FONTES DE DADOS (FontesDadosTab)
  // ═══════════════════════════════════════════
  {
    indicador: 'Censo 2022 — portal SIDRA',
    secao: 'Fontes de Dados',
    url: 'https://censo2022.ibge.gov.br',
    fonte: 'IBGE',
    descricao: 'Portal do Censo Demográfico 2022',
  },
  {
    indicador: 'PNAD Contínua — portal SIDRA',
    secao: 'Fontes de Dados',
    url: 'https://sidra.ibge.gov.br/pesquisa/pnadct',
    fonte: 'IBGE',
    descricao: 'PNAD Contínua — pesquisa no SIDRA',
  },
  {
    indicador: 'SINESP',
    secao: 'Fontes de Dados',
    url: 'https://www.gov.br/mj/pt-br/assuntos/sua-seguranca/seguranca-publica/sinesp-1',
    fonte: 'MJSP',
    descricao: 'SINESP — Sistema Nacional de Informações de Segurança Pública',
  },
  {
    indicador: 'Mortalidade materna — TabNet',
    secao: 'Fontes de Dados',
    url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def',
    fonte: 'DataSUS/SIM',
    descricao: 'SIM TabNet — Óbitos maternos por cor/raça',
  },
  {
    indicador: 'Nascidos vivos — TabNet',
    secao: 'Fontes de Dados',
    url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def',
    fonte: 'DataSUS/SINASC',
    descricao: 'SINASC TabNet — Nascidos vivos por cor/raça',
  },
  {
    indicador: 'SESAI — Saúde Indígena',
    secao: 'Fontes de Dados',
    url: 'https://www.gov.br/saude/pt-br/composicao/sesai',
    fonte: 'MS',
    descricao: 'SESAI — Secretaria de Saúde Indígena',
  },
  {
    indicador: 'CadÚnico',
    secao: 'Fontes de Dados',
    url: 'https://aplicacoes.mds.gov.br/sagi/vis/data3/v.php',
    fonte: 'MDS',
    descricao: 'CadÚnico — Cadastro Único para Programas Sociais',
  },
  {
    indicador: 'Portal da Transparência',
    secao: 'Fontes de Dados',
    url: 'https://portaldatransparencia.gov.br/',
    fonte: 'CGU',
    descricao: 'Portal da Transparência — gastos federais',
  },
  {
    indicador: 'Terras Indígenas',
    secao: 'Fontes de Dados',
    url: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas',
    fonte: 'FUNAI',
    descricao: 'FUNAI — Terras Indígenas',
  },

  // ═══════════════════════════════════════════
  // GRUPOS FOCAIS
  // ═══════════════════════════════════════════
  {
    indicador: 'Juventude Negra — estimativa populacional',
    secao: 'Grupos Focais',
    url: 'https://sidra.ibge.gov.br/Tabela/7113',
    fonte: 'SIDRA/IBGE',
    descricao: 'População 15-29 anos — PNAD Contínua, Tab. 7113',
  },

  // ═══════════════════════════════════════════
  // SÉRIES TEMPORAIS
  // ═══════════════════════════════════════════
  {
    indicador: 'Desemprego negro — série temporal',
    secao: 'Séries Temporais',
    url: 'https://sidra.ibge.gov.br/Tabela/6800',
    fonte: 'SIDRA/IBGE',
    descricao: 'PNAD Contínua — rendimento mensal por cor/raça',
  },
];

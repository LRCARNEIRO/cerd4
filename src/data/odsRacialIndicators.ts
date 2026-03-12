// Catálogo completo de 90 indicadores da Plataforma ODS Racial (ODSR/UFPB)
// Fonte: https://odsr.lema.ufpb.br/tabelas?region=brasil-br
// Dados organizados por ODS (Objetivos de Desenvolvimento Sustentável)

export interface OdsRacialIndicator {
  id: string;
  name: string;
  group: string;
  slug: string;
  fonte: string;
  url: string;
  artigoCerd?: string[];
}

const BASE_URL = 'https://odsr.lema.ufpb.br/indicador';

function buildUrl(slug: string): string {
  return `${BASE_URL}/${slug}?region=brasil-br`;
}

// Fontes por prefixo de ID
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

// Mapeamento de artigos CERD por tema
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

// Todos os 90 indicadores da plataforma ODSR
export const odsRacialIndicators: OdsRacialIndicator[] = [
  // ODS 1 - Erradicação da Pobreza
  { id: 'cadunico_1_1', name: 'Paridade Racial de Pessoas no CadÚnico em Relação à População', group: 'ODS 1 - Erradicação da Pobreza', slug: 'paridade-racial-de-pessoas-no-cadunico-em-em-relacao-a-populacao-cadunico-1-1' },
  { id: 'cadunico_1_2', name: 'Taxa de Emprego entre Cadastrados no CadÚnico', group: 'ODS 1 - Erradicação da Pobreza', slug: 'taxa-de-emprego-entre-cadastrados-no-cadunico-cadunico-1-2' },
  { id: 'cadunico_1_3', name: 'Renda Média do Trabalho entre Empregados Cadastrados no CadÚnico', group: 'ODS 1 - Erradicação da Pobreza', slug: 'renda-media-do-trabalho-entre-empregados-cadastrados-no-cadunico-cadunico-1-3' },
  { id: 'cadunico_1_4', name: 'Participação na Renda com Emprego das Pessoas no CadÚnico', group: 'ODS 1 - Erradicação da Pobreza', slug: 'participacao-na-renda-com-emprego-das-pessoas-no-cadunico-cadunico-1-4' },
  { id: 'rais_1_1', name: 'Paridade Racial no Emprego Formal em Relação à População', group: 'ODS 1 - Erradicação da Pobreza', slug: 'paridade-racial-no-emprego-formal-em-relacao-a-populacao-rais-1-1' },
  { id: 'rais_1_2', name: 'Paridade Racial da Massa Salarial de Vínculos Formais Ativos em Relação à População', group: 'ODS 1 - Erradicação da Pobreza', slug: 'paridade-racial-da-massa-salarial-de-vinculos-formais-ativos-em-relacao-a-populacao-rais-1-2' },

  // ODS 2 - Fome Zero e Agricultura Sustentável
  { id: 'rais_2_1', name: 'Paridade Racial dos Vínculos Formais no Setor Agropecuário em Relação à População', group: 'ODS 2 - Fome Zero e Agricultura Sustentável', slug: 'paridade-racial-dos-vinculos-formais-no-setor-agropecuario-em-relacao-a-populacao-rais-2-1' },
  { id: 'rais_2_2', name: 'Salário Médio na Agropecuária em Vínculos Formais Ativos', group: 'ODS 2 - Fome Zero e Agricultura Sustentável', slug: 'salario-medio-na-agropecuaria-em-vinculos-formais-ativos-rais-2-2' },
  { id: 'rais_8_3', name: 'Paridade Racial nos Vínculos em Pequenas Empresas (Regime Simples) em Relação à População', group: 'ODS 2 - Fome Zero e Agricultura Sustentável', slug: 'paridade-racial-nos-vinculos-em-pequenas-empresas-(regime-simples)-em-relacao-a-populacao-no-mercado-formal-de-trabalho-rais-8-3' },
  { id: 'rais_8_4', name: 'Paridade Racial nos Vínculos em Médias e Grandes Empresas em Relação à População', group: 'ODS 2 - Fome Zero e Agricultura Sustentável', slug: 'paridade-racial-nos-vinculos-em-medias-e-grandes-empresas-em-relacao-a-populacao-no-mercado-formal-de-trabalho-rais-8-4' },

  // ODS 3 - Boa Saúde e Bem-Estar
  { id: 'sih_3_1', name: 'Taxa de Internações por Arboviroses por 100 mil habitantes', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-internacoes-por-arboviroses-por-100-mil-habitantes-sih-3-1' },
  { id: 'sih_3_2', name: 'Taxa de Internações por Álcool e Drogas por 100 mil habitantes', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-internacoes-por-alcool-e-drogas-por-100-mil-habitantes-sih-3-2' },
  { id: 'sih_3_3', name: 'Taxa de Internações por Gripe por 100 mil habitantes', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-internacoes-por-gripe-por-100-mil-habitantes-sih-3-3' },
  { id: 'sih_3_4', name: 'Taxa de Internações por Doenças Prevenidas pela Pentavalente por 100 mil hab.', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-internacoes-por-doencas-prevenidas-pela-pentavalente-por-100-mil-habitantes-sih-3-4' },
  { id: 'sih_3_5', name: 'Taxa de Internações por Doenças Prevenidas pela Tetraviral por 100 mil hab.', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-internacoes-por-doencas-prevenidas-pela-tetraviral-por-100-mil-habitantes-sih-3-5' },
  { id: 'sih_3_6', name: 'Taxa de Internações por Rotavírus e Hepatite A por 100 mil hab.', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-internacoes-por-rotavirus-e-hepatite-a--por-100-mil-habitantes-sih-3-6' },
  { id: 'sim_3_1', name: 'Taxa de Mortalidade Infantil por mil nascidos vivos', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-mortalidade-infantil-por-mil-nascidos-vivos-sim-3-1' },
  { id: 'sim_3_2', name: 'Taxa de Mortalidade em Menores de 5 Anos por mil nascidos vivos', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-mortalidade-em-menores-de-5-anos-por-mil-nascidos-vivos-sim-3-2' },
  { id: 'sim_3_3', name: 'Razão de Mortalidade Materna por 100 mil nascidos vivos', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'razao-de-mortalidade-materna-por-100-mil-nascidos-vivos-sim-3-3' },
  { id: 'sim_3_4', name: 'Taxa de Mortalidade Prematura (30-69 anos) por DCNT por 100 mil hab.', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-mortalidade-prematura-(30-a-69-anos)-por-doencas-cronicas-nao-transmissiveis-por-100-mil-habitantes-sim-3-4' },
  { id: 'sim_3_5', name: 'Taxa de Óbitos de Crianças e Adolescentes (1-14 anos) por 100 mil hab.', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-obitos-de-criancas-e-adolescentes-(1-a-14-anos)-por-100-mil-habitantes-sim-3-5' },
  { id: 'sim_3_6', name: 'Taxa de Mortalidade de Jovens (15-29 anos) por 100 mil hab.', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-mortalidade-de-jovens-(15-a-29-anos)-por-100-mil-habitantes-sim-3-6' },
  { id: 'sim_3_7', name: 'Taxa de Suicídio por 100 mil hab.', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-suicidio-por-100-mil-habitantes-sim-3-7' },
  { id: 'sim_3_8', name: 'Taxa de Mortalidade por Neoplasias Malignas por 100 mil hab.', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-mortalidade-por-neoplasias-malignas-por-100-mil-habitantes-sim-3-8' },
  { id: 'sim_3_9', name: 'Taxa de Mortalidade por Doenças do Aparelho Circulatório por 100 mil hab.', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-mortalidade-por-diabetes-mellitus-por-100-mil-habitantes-sim-3-10' },
  { id: 'sim_3_10', name: 'Taxa de Mortalidade por Diabetes Mellitus por 100 mil hab.', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-mortalidade-por-diabetes-mellitus-por-100-mil-habitantes-sim-3-10' },
  { id: 'sim_3_11', name: 'Taxa de Mortalidade por AIDS por 100 mil hab.', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'taxa-de-mortalidade-por-aids-por-100-mil-habitantes-sim-3-11' },
  { id: 'sinasc_3_1', name: 'Percentual de Nascidos de Mães Menores de Idade', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'percentual-de-nascidos-de-maes-menores-de-idade-sinasc-3-1' },
  { id: 'sinasc_3_2', name: 'Percentual de Nascidos Vivos com Baixo Peso (< 2.500g)', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'percentual-de-nascidos-vivos-com-baixo-peso-(inferior-a-2.500g)-sinasc-3-2' },
  { id: 'sinasc_3_3', name: 'Percentual de Nascidos de Mães com Pré-Natal Adequado (7+ consultas)', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'percentual-de-nascidos-vicos-de-maes-com-prenatal-adequado-(7-ou-mais-consultas)-sinasc-3-3' },
  { id: 'sinasc_3_4', name: 'Percentual de Nascidos Vivos de Parto Normal', group: 'ODS 3 - Boa Saúde e Bem-Estar', slug: 'percentual-de-nascidos-vivos-de-parto-normal-sinasc-3-4' },

  // ODS 4 - Educação de Qualidade
  { id: 'ceb_afd_4_1', name: 'Taxa de Adequação da Formação Docente - Ensino Infantil', group: 'ODS 4 - Educação de Qualidade', slug: 'taxa-de-adequacao-da-formacao-docente-no-ensino-infantil-(criterio-de-predominancia)-ceb-afd-4-1' },
  { id: 'ceb_afd_4_2', name: 'Taxa de Adequação da Formação Docente - Ensino Fundamental I', group: 'ODS 4 - Educação de Qualidade', slug: 'taxa-de-adequacao-da-formacao-docente-no-ensino-fundamental-i-(criterio-de-predominancia)-ceb-afd-4-2' },
  { id: 'ceb_afd_4_3', name: 'Taxa de Adequação da Formação Docente - Ensino Fundamental II', group: 'ODS 4 - Educação de Qualidade', slug: 'taxa-de-adequacao-da-formacao-docente-no-ensino-fundamental-ii-(criterio-de-predominancia)-ceb-afd-4-3' },
  { id: 'ceb_afd_4_4', name: 'Taxa de Adequação da Formação Docente - Ensino Médio', group: 'ODS 4 - Educação de Qualidade', slug: 'taxa-de-adequacao-da-formacao-docente-no-ensino-medio-(criterio-de-predominancia)-ceb-afd-4-4' },
  { id: 'ceb_escolas_4_1', name: 'Infraestrutura Escolar - Taxa de Escolas com Eletricidade', group: 'ODS 4 - Educação de Qualidade', slug: 'infraestrutura-escolar--taxa-de-escolas-com-acesso-a-eletricidade-(criterio-de-predominancia)-ceb-escolas-4-1' },
  { id: 'ceb_escolas_4_3', name: 'Infraestrutura Escolar - Taxa de Escolas com Lab. Informática', group: 'ODS 4 - Educação de Qualidade', slug: 'infraestrutura-escolar--taxa-de-escolas-com-laboratorio-de-informatica-(criterio-de-predominancia)-ceb-escolas-4-3' },
  { id: 'ceb_escolas_4_4', name: 'Infraestrutura Escolar - Taxa de Escolas com Banheiro Acessível', group: 'ODS 4 - Educação de Qualidade', slug: 'infraestrutura-escolar--taxa-de-escolas-com-banheiro-acessivel-(criterio-de-predominancia)-ceb-escolas-4-4' },
  { id: 'ceb_escolas_4_5', name: 'Infraestrutura Escolar - Taxa de Escolas com Água Encanada', group: 'ODS 4 - Educação de Qualidade', slug: 'infraestrutura-escolar--taxa-de-escolas-com-agua-encanada-(criterio-de-predominancia)-ceb-escolas-4-5' },
  { id: 'ceb_escolas_4_6', name: 'Infraestrutura Escolar - Taxa de Escolas com Banheiro Infantil', group: 'ODS 4 - Educação de Qualidade', slug: 'infraestrutura-escolar--taxa-de-escolas-com-banheiro-infantil-(criterio-de-predominancia)-ceb-escolas-4-6' },
  { id: 'cs_cursos_4_1', name: 'Participação Relativa de Ingressantes no Ensino Superior', group: 'ODS 4 - Educação de Qualidade', slug: 'participacao-relativa-de-ingressantes-no-ensino-superior-cs-cursos-4-1' },
  { id: 'cs_cursos_4_3', name: 'Taxa de Escolarização no Ensino Superior', group: 'ODS 4 - Educação de Qualidade', slug: 'taxa-de-escolarizacao-no-ensino-superior-cs-cursos-4-3' },
  { id: 'cs_cursos_4_4', name: 'Taxa de Conclusão no Ensino Superior', group: 'ODS 4 - Educação de Qualidade', slug: 'taxa-de-conclusao-no-ensino-superior-cs-cursos-4-4' },
  { id: 'enem_4_6', name: 'Média da Nota Geral no ENEM', group: 'ODS 4 - Educação de Qualidade', slug: 'media-da-nota-geral-no-enem-enem-4-6' },
  { id: 'ideb_4_1', name: 'IDEB - Ensino Fundamental I (predominância)', group: 'ODS 4 - Educação de Qualidade', slug: 'ideb--ensino-fundamental-i-(criterio-de-predominancia)-ideb-4-1' },
  { id: 'ideb_4_2', name: 'IDEB - Ensino Fundamental II (predominância)', group: 'ODS 4 - Educação de Qualidade', slug: 'ideb--ensino-fundamental-ii-(criterio-de-predominancia)-ideb-4-2' },

  // ODS 5 - Igualdade de Gênero
  { id: 'rais_5_1', name: 'Percentual dos Vínculos Formais Ocupados por Mulheres', group: 'ODS 5 - Igualdade de Gênero', slug: 'percentual-dos-vinculos-formais-ocupados-por-mulheres-rais-5-1' },
  { id: 'rais_5_2', name: 'Salário Médio das Mulheres em Vínculos Formais Ativos', group: 'ODS 5 - Igualdade de Gênero', slug: 'salario-medio-das-mulheres-em-vinculos-formais-ativos-rais-5-2' },
  { id: 'rais_5_3', name: 'Salário Médio dos Homens em Vínculos Formais Ativos', group: 'ODS 5 - Igualdade de Gênero', slug: 'salario-medio-dos-homens-em-vinculos-formais-ativos-rais-5-3' },
  { id: 'sinan_5_1', name: 'Taxa de Violência Física contra Mulheres por 100 mil hab.', group: 'ODS 5 - Igualdade de Gênero', slug: 'taxa-de-violencia-fisica-contra-mulheres-por-100-mil-habitantes-sinan-5-1' },
  { id: 'sinan_5_2', name: 'Taxa de Violência Sexual contra Mulheres por 100 mil hab.', group: 'ODS 5 - Igualdade de Gênero', slug: 'taxa-de-violencia-sexual-contra-mulheres-por-100-mil-habitantes-sinan-5-2' },
  { id: 'tse_5_1', name: 'Percentual de Assentos Ocupados por Mulheres em Parlamentos Locais', group: 'ODS 5 - Igualdade de Gênero', slug: 'percentual-de-assentos-ocupados-por-mulheres-em-parlamentos-locais-tse-5-1' },
  { id: 'tse_5_4', name: 'Paridade Racial em Candidaturas Femininas aos Parlamentos Locais', group: 'ODS 5 - Igualdade de Gênero', slug: 'paridade-racial-em-candidaturas-femininas-aos-parlamentos-locais-tse-5-4' },
  { id: 'tse_5_7', name: 'Taxa de Sucesso de Candidaturas Femininas a Parlamentos Locais', group: 'ODS 5 - Igualdade de Gênero', slug: 'taxa-de-sucesso-de-candidaturas-femininas-a-parlamentos-locais-tse-5-7' },

  // ODS 6 - Água Potável e Saneamento
  { id: 'sim_6_1', name: 'Taxa de Mortalidade Atribuída à Água, Saneamento e Higiene Inseguros por 100 mil hab.', group: 'ODS 6 - Água Potável e Saneamento', slug: 'taxa-de-mortalidade-atribuida-a-agua-saneamento-e-higiene-inseguros-por-100-mil-habitantes-sim-6-1' },

  // ODS 8 - Emprego Decente e Crescimento Econômico
  { id: 'rais_8_1', name: 'Salário Médio por Hora em Vínculos Formais Ativos', group: 'ODS 8 - Emprego Decente e Crescimento Econômico', slug: 'salario-medio-por-hora-em-vinculos-formais-ativos-rais-8-1' },
  { id: 'rais_8_2', name: 'Taxas de Frequência de Lesões Ocupacionais Fatais e Não Fatais', group: 'ODS 8 - Emprego Decente e Crescimento Econômico', slug: 'taxas-de-frequencia-de-lesoes-ocupacionais-fatais-e-nao-fatais-no-mercado-formal-de-trabalho-rais-8-2' },
  { id: 'rais_8_5', name: 'Percentual de Vínculos sem Ensino Superior no Mercado Formal', group: 'ODS 8 - Emprego Decente e Crescimento Econômico', slug: 'percentual-de-vinculos-ocupados-com-pessoas-sem-ensino-superior-no-mercado-formal-de-trabalho-rais-8-5' },
  { id: 'rais_8_6', name: 'Percentual de Vínculos com Ensino Superior no Mercado Formal', group: 'ODS 8 - Emprego Decente e Crescimento Econômico', slug: 'percentual-de-vinculos-ocupados-com-pessoas-com-ensino-superior-no-mercado-formal-de-trabalho-rais-8-6' },
  { id: 'rais_8_24', name: 'Salário Médio no Setor Público', group: 'ODS 8 - Emprego Decente e Crescimento Econômico', slug: 'salario-medio-no-setor-publico-rais-8-24' },
  { id: 'rais_8_25', name: 'Salário Médio no Setor Privado', group: 'ODS 8 - Emprego Decente e Crescimento Econômico', slug: 'salario-medio-no-setor-privado-rais-8-25' },
  { id: 'rais_8_26', name: 'Salário Médio entre Estrangeiros', group: 'ODS 8 - Emprego Decente e Crescimento Econômico', slug: 'salario-medio-entre-estrangeiros-rais-8-26' },
  { id: 'rais_10_28', name: 'Paridade Racial nos Vínculos no Setor Público', group: 'ODS 8 - Emprego Decente e Crescimento Econômico', slug: 'paridade-racial-nos-vinculos-no-setor-publico-rais-10-28' },

  // ODS 9 - Indústria, Inovação e Infraestrutura
  { id: 'rais_9_1', name: 'Paridade Racial dos Vínculos Formais no Setor Industrial em Relação à População', group: 'ODS 9 - Indústria, Inovação e Infraestrutura', slug: 'paridade-racial-dos-vinculos-formais-ativos-no-setor-industrial-em-relacao-a-populacao-rais-9-1' },

  // ODS 10 - Redução das Desigualdades
  { id: 'rais_10_1', name: 'Salário Médio por Vínculo Formal Ativo', group: 'ODS 10 - Redução das Desigualdades', slug: 'salario-medio-por-vinculo-formal-ativo-rais-10-1' },
  { id: 'rais_10_2', name: 'Proporção da Massa Salarial de Vínculos até 2 Salários Mínimos', group: 'ODS 10 - Redução das Desigualdades', slug: 'proporcao-da-massa-salarial-de-vinculos-formais-com-salario-ate-dois-salarios-minimos-rais-10-2' },
  { id: 'rais_10_3', name: 'Percentual de Vínculos com Remuneração Abaixo de ½ Mediana', group: 'ODS 10 - Redução das Desigualdades', slug: 'percentual-de-vinculos-formais-com-remuneracao-abaixo-da-metade-da-remuneracao-mediana-rais-10-3' },
  { id: 'rais_10_6', name: 'Salário Médio - Ensino Fundamental/Médio em Vínculos Formais', group: 'ODS 10 - Redução das Desigualdades', slug: 'salario-medio-de-pessoas-com-ensino-fundamental-ou-medio-em-vinculos-formais-ativos-rais-10-6' },
  { id: 'rais_10_7', name: 'Salário Médio - Ensino Superior em Vínculos Formais', group: 'ODS 10 - Redução das Desigualdades', slug: 'salario-medio-de-pessoas-com-ensino-superior-em-vinculos-formais-ativos-rais-10-7' },
  { id: 'rais_10_10', name: 'Percentual de Vínculos Formais em Cargos Gerenciais', group: 'ODS 10 - Redução das Desigualdades', slug: 'percentual-de-vinculos-formais-em-cargos-gerenciais-rais-10-10' },
  { id: 'rais_10_12', name: 'Paridade Racial - Oficiais da Polícia Militar em Relação à População', group: 'ODS 10 - Redução das Desigualdades', slug: 'paridade-racial-de-vinculos-formais-de-oficiais-da-policia-militar-em-relacao-a-populacao-rais-10-12' },
  { id: 'rais_10_16', name: 'Paridade Racial - Magistratura em Relação à População', group: 'ODS 10 - Redução das Desigualdades', slug: 'paridade-racial-de-vinculos-formais-de-magistratura-em-relacao-a-populacao-rais-10-16' },
  { id: 'rais_10_19', name: 'Paridade Racial - Delegados de Polícia em Relação à População', group: 'ODS 10 - Redução das Desigualdades', slug: 'paridade-racial-de-vinculos-formais-de-delegados-de-policia-em-relacao-a-populacao-rais-10-19' },
  { id: 'rais_10_20', name: 'Paridade Racial - Médicos em Relação à População', group: 'ODS 10 - Redução das Desigualdades', slug: 'paridade-racial-de-vinculos-formais-de-medicos-em-relacao-a-populacao-rais-10-20' },
  { id: 'rais_10_24', name: 'Paridade Racial - Advocacia em Relação à População', group: 'ODS 10 - Redução das Desigualdades', slug: 'paridade-racial-da-advocacia-em-relacao-a-populacao-em-vinculos-formais-ativos-rais-10-24' },
  { id: 'tse_10_1', name: 'Paridade Racial em Assentos Locais (Vereadores) em Relação à População', group: 'ODS 10 - Redução das Desigualdades', slug: 'paridade-racial-em-assentos-locais-(vereadores)-em-relacao-a-populacao-tse-10-1' },
  { id: 'tse_10_4', name: 'Paridade Racial em Candidaturas aos Parlamentos Locais', group: 'ODS 10 - Redução das Desigualdades', slug: 'paridade-racial-em-candidaturas-aos-parlamentos-locais-tse-10-4' },
  { id: 'tse_10_7', name: 'Taxa de Sucesso em Eleições Locais', group: 'ODS 10 - Redução das Desigualdades', slug: 'taxa-de-sucesso-em-eleicoes--locais-tse-10-7' },

  // ODS 11 - Cidades e Comunidades Sustentáveis
  { id: 'sim_11_1', name: 'Taxa de Mortalidade por Acidentes de Transporte Terrestre por 100 mil hab.', group: 'ODS 11 - Cidades e Comunidades Sustentáveis', slug: 'taxa-de-mortalidade-por-acidentes-de-transporte-terrestre-por-100-mil-habitantes-sim-11-1' },
  { id: 'sim_11_2', name: 'Taxa de Mortalidade Atribuída à Poluição do Ar por 100 mil hab.', group: 'ODS 11 - Cidades e Comunidades Sustentáveis', slug: 'taxa-de-mortalidade-em-adultos-atribuida-a-poluicao-do-ar-domestico-e-ambiental-por-100-mil-habitantes-sim-11-2' },

  // ODS 16 - Paz, Justiça e Instituições Eficazes
  { id: 'sim_16_1', name: 'Taxa de Mortalidade por Causas Externas por 100 mil hab.', group: 'ODS 16 - Paz, Justiça e Instituições Eficazes', slug: 'taxa-de-mortalidade-por-causas-externas-por-100-mil-habitantes-sim-16-1' },
  { id: 'sim_16_2', name: 'Taxa de Mortalidade por Agressão por 100 mil hab.', group: 'ODS 16 - Paz, Justiça e Instituições Eficazes', slug: 'taxa-de-mortalidade-por-agressao-por-100-mil-habitantes-sim-16-2' },
  { id: 'sim_16_3', name: 'Taxa de Homicídios por 100 mil hab.', group: 'ODS 16 - Paz, Justiça e Instituições Eficazes', slug: 'taxa-de-homicidios-por-100-mil-habitantes-sim-16-3' },
  { id: 'sim_16_4', name: 'Taxa de Homicídios de Mulheres por 100 mil hab.', group: 'ODS 16 - Paz, Justiça e Instituições Eficazes', slug: 'taxa-de-homicidios-de-mulheres-por-100-mil-habitantes-sim-16-4' },
  { id: 'sim_16_5', name: 'Taxa de Óbitos por Arma de Fogo por 100 mil hab.', group: 'ODS 16 - Paz, Justiça e Instituições Eficazes', slug: 'taxa-de-obitos-por-arma-de-fogo-por-100-mil-habitantes-sim-16-5' },
  { id: 'sinan_16_1', name: 'Taxa de Violência Física contra Menores por 100 mil hab.', group: 'ODS 16 - Paz, Justiça e Instituições Eficazes', slug: 'taxa-de-violencia-fisica-contra-menores-por-100-mil-habitantes-sinan-16-1' },
  { id: 'sinan_16_2', name: 'Taxa de Violência Sexual contra Menores por 100 mil hab.', group: 'ODS 16 - Paz, Justiça e Instituições Eficazes', slug: 'taxa-de-violencia-sexual-contra-menores-por-100-mil-habitantes-sinan-16-2' },
  { id: 'sinan_16_3', name: 'Taxa de Violência Física por 100 mil hab.', group: 'ODS 16 - Paz, Justiça e Instituições Eficazes', slug: 'taxa-de-violencia-fisica-por-100-mil-habitantes-sinan-16-3' },
  { id: 'sinan_16_4', name: 'Taxa de Violência Sexual por 100 mil hab.', group: 'ODS 16 - Paz, Justiça e Instituições Eficazes', slug: 'taxa-de-violencia-sexual-por-100-mil-habitantes-sinan-16-4' },
  { id: 'sinan_16_5', name: 'Taxa de Violência Psicológica por 100 mil hab.', group: 'ODS 16 - Paz, Justiça e Instituições Eficazes', slug: 'taxa-de-violencia-psicologica-por-100-mil-habitantes-sinan-16-5' },
].map(ind => ({
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

// Cores por ODS
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

// =============================================
// DADOS ESTATÍSTICOS INTERSECCIONAIS
// Fontes: IBGE, IPEA, DataSUS, INEP, FBSP, ANTRA
// Período: 2018-2026
// =============================================

// Raça × Gênero × Idade - Trabalho
export const interseccionalidadeTrabalho = [
  { grupo: 'Mulher Negra 18-29', renda: 1580, desemprego: 18.2, informalidade: 52.3 },
  { grupo: 'Mulher Negra 30-49', renda: 2120, desemprego: 11.5, informalidade: 48.1 },
  { grupo: 'Mulher Negra 50+', renda: 1890, desemprego: 8.2, informalidade: 55.8 },
  { grupo: 'Homem Negro 18-29', renda: 1920, desemprego: 14.8, informalidade: 48.5 },
  { grupo: 'Homem Negro 30-49', renda: 2580, desemprego: 7.2, informalidade: 42.3 },
  { grupo: 'Homem Negro 50+', renda: 2340, desemprego: 5.8, informalidade: 48.9 },
  { grupo: 'Mulher Branca 18-29', renda: 2280, desemprego: 12.1, informalidade: 38.2 },
  { grupo: 'Mulher Branca 30-49', renda: 3450, desemprego: 6.8, informalidade: 32.5 },
  { grupo: 'Homem Branco 18-29', renda: 2650, desemprego: 9.5, informalidade: 35.8 },
  { grupo: 'Homem Branco 30-49', renda: 4580, desemprego: 4.2, informalidade: 28.1 }
];

// Deficiência por Raça
export const deficienciaPorRaca = [
  { raca: 'Branca', taxaDeficiencia: 8.2, empregabilidade: 42.5, rendaMedia: 2450 },
  { raca: 'Preta', taxaDeficiencia: 9.8, empregabilidade: 31.2, rendaMedia: 1680 },
  { raca: 'Parda', taxaDeficiencia: 9.1, empregabilidade: 33.8, rendaMedia: 1780 },
  { raca: 'Indígena', taxaDeficiencia: 11.2, empregabilidade: 25.5, rendaMedia: 1320 }
];

// LGBTQIA+ por Raça
export const lgbtqiaPorRaca = [
  { indicador: 'Violência física (% vítimas)', negroLGBT: 68.2, brancoLGBT: 31.8 },
  { indicador: 'Desemprego (%)', negroLGBT: 22.5, brancoLGBT: 14.2 },
  { indicador: 'Abandono escolar (%)', negroLGBT: 35.8, brancoLGBT: 18.5 },
  { indicador: 'Situação de rua (%)', negroLGBT: 72.5, brancoLGBT: 27.5 }
];

// Povos Tradicionais
export const povosTradicionais = {
  indigenas: {
    populacao: 1693535,
    terrasHomologadas2018_2022: 2,
    terrasHomologadas2023_2025: 11,
    mortalidadeInfantil: 42.8,
    acessoSaude: 68.5,
    educacaoBilingue: 32.5
  },
  quilombolas: {
    populacao: 1327802,
    comunidadesCertificadas: 3524,
    comunidadesTituladas: 178,
    acessoAgua: 45.2,
    acessoSaneamento: 28.5,
    bolsaFamilia: 78.5
  },
  ciganos: {
    populacaoEstimada: 800000,
    acampamentosIdentificados: 291,
    acessoEducacao: 12.5,
    documentacao: 35.2,
    acessoSaude: 28.5
  }
};

// Classe por Raça
export const classePorRaca = [
  { faixa: 'Extrema pobreza', branca: 3.2, negra: 8.5, indigena: 18.2 },
  { faixa: 'Pobreza', branca: 8.5, negra: 18.2, indigena: 25.5 },
  { faixa: 'Vulnerável', branca: 22.5, negra: 35.8, indigena: 32.1 },
  { faixa: 'Classe média', branca: 42.5, negra: 28.5, indigena: 18.5 },
  { faixa: 'Alta renda', branca: 23.3, negra: 9.0, indigena: 5.7 }
];

// Mulheres chefes de família
export const mulheresChefeFamilia = [
  { ano: 2018, negras: 28.5, brancas: 18.2 },
  { ano: 2019, negras: 29.8, brancas: 18.8 },
  { ano: 2020, negras: 32.5, brancas: 20.1 },
  { ano: 2021, negras: 34.2, brancas: 21.5 },
  { ano: 2022, negras: 35.8, brancas: 22.2 },
  { ano: 2023, negras: 37.5, brancas: 23.1 },
  { ano: 2024, negras: 38.2, brancas: 23.8 }
];

// Violência interseccional
export const violenciaInterseccional = [
  { tipo: 'Feminicídio', mulherNegra: 65.8, mulherBranca: 34.2 },
  { tipo: 'Violência doméstica', mulherNegra: 58.2, mulherBranca: 41.8 },
  { tipo: 'Estupro', mulherNegra: 52.8, mulherBranca: 47.2 },
  { tipo: 'Assédio no trabalho', mulherNegra: 62.5, mulherBranca: 37.5 }
];

// Juventude negra
export const juventudeNegra = [
  { indicador: 'Taxa de homicídio (por 100 mil)', valor: 78.5, referencia: 28.2 },
  { indicador: 'Desemprego 18-24 anos (%)', valor: 22.5, referencia: 12.8 },
  { indicador: 'Nem-nem (%)', valor: 28.5, referencia: 15.2 },
  { indicador: 'Encarceramento (% do total)', valor: 67.5, referencia: 32.5 }
];

// Educação interseccional
export const educacaoInterseccional = [
  { grupo: 'Mulher negra', superiorCompleto: 15.2, posGraduacao: 2.8, evasaoMedio: 12.5 },
  { grupo: 'Homem negro', superiorCompleto: 11.8, posGraduacao: 1.9, evasaoMedio: 18.2 },
  { grupo: 'Mulher branca', superiorCompleto: 28.5, posGraduacao: 6.2, evasaoMedio: 5.8 },
  { grupo: 'Homem branco', superiorCompleto: 22.8, posGraduacao: 4.5, evasaoMedio: 8.2 },
  { grupo: 'Indígena', superiorCompleto: 5.2, posGraduacao: 0.8, evasaoMedio: 25.5 },
  { grupo: 'Quilombola', superiorCompleto: 6.8, posGraduacao: 1.1, evasaoMedio: 22.8 }
];

// Saúde interseccional
export const saudeInterseccional = [
  { indicador: 'Mortalidade materna', mulherNegraPobre: 185.2, mulherNegraMedia: 128.5, mulherBranca: 68.2 },
  { indicador: 'Pré-natal adequado (%)', mulherNegraPobre: 38.5, mulherNegraMedia: 62.5, mulherBranca: 82.5 },
  { indicador: 'Cesárea eletiva (%)', mulherNegraPobre: 28.5, mulherNegraMedia: 45.2, mulherBranca: 72.5 }
];

// Radar: Vulnerabilidades por grupo
export const radarVulnerabilidades = [
  { eixo: 'Renda', mulherNegra: 85, homemNegro: 72, mulherBranca: 45, homemBranco: 28 },
  { eixo: 'Emprego', mulherNegra: 78, homemNegro: 65, mulherBranca: 52, homemBranco: 35 },
  { eixo: 'Educação', mulherNegra: 68, homemNegro: 75, mulherBranca: 38, homemBranco: 42 },
  { eixo: 'Saúde', mulherNegra: 82, homemNegro: 58, mulherBranca: 32, homemBranco: 45 },
  { eixo: 'Violência', mulherNegra: 88, homemNegro: 92, mulherBranca: 42, homemBranco: 38 },
  { eixo: 'Moradia', mulherNegra: 72, homemNegro: 68, mulherBranca: 35, homemBranco: 32 }
];

// Evolução temporal das desigualdades
export const evolucaoDesigualdade = [
  { ano: 2018, razaoRenda: 1.73, razaoDesemprego: 1.72, razaoHomicidio: 2.68 },
  { ano: 2019, razaoRenda: 1.71, razaoDesemprego: 1.68, razaoHomicidio: 2.65 },
  { ano: 2020, razaoRenda: 1.68, razaoDesemprego: 1.75, razaoHomicidio: 2.58 },
  { ano: 2021, razaoRenda: 1.65, razaoDesemprego: 1.72, razaoHomicidio: 2.52 },
  { ano: 2022, razaoRenda: 1.62, razaoDesemprego: 1.65, razaoHomicidio: 2.48 },
  { ano: 2023, razaoRenda: 1.58, razaoDesemprego: 1.58, razaoHomicidio: 2.52 },
  { ano: 2024, razaoRenda: 1.55, razaoDesemprego: 1.52, razaoHomicidio: 2.55 },
  { ano: 2025, razaoRenda: 1.52, razaoDesemprego: 1.48, razaoHomicidio: 2.50 },
  { ano: 2026, razaoRenda: 1.50, razaoDesemprego: 1.45, razaoHomicidio: 2.45 }
];

// =============================================
// DADOS COMMON CORE - DEMOGRÁFICOS GERAIS
// Fonte: Censo 2022, PNAD Contínua 2024
// =============================================

export const dadosDemograficos = {
  populacaoTotal: 203062512,
  composicaoRacial: [
    { raca: 'Branca', percentual: 43.5, populacao: 88331793 },
    { raca: 'Parda', percentual: 45.3, populacao: 91987318 },
    { raca: 'Preta', percentual: 10.2, populacao: 20712376 },
    { raca: 'Indígena', percentual: 0.83, populacao: 1693535 },
    { raca: 'Amarela', percentual: 0.4, populacao: 812250 }
  ],
  quilombolas: 1327802,
  populacaoNegra: 112699694, // pretos + pardos
  percentualNegro: 55.5
};

// Evolução da composição racial
export const evolucaoComposicaoRacial = [
  { ano: 2018, branca: 47.7, negra: 52.3 },
  { ano: 2019, branca: 46.8, negra: 53.2 },
  { ano: 2020, branca: 46.1, negra: 53.9 },
  { ano: 2021, branca: 45.2, negra: 54.8 },
  { ano: 2022, branca: 43.5, negra: 55.5 },
  { ano: 2023, branca: 43.2, negra: 55.8 },
  { ano: 2024, branca: 42.9, negra: 56.1 },
  { ano: 2025, branca: 42.6, negra: 56.4 },
  { ano: 2026, branca: 42.3, negra: 56.7 }
];

// Indicadores socioeconômicos por raça - série histórica
export const indicadoresSocioeconomicos = [
  { 
    ano: 2018, 
    rendaMediaNegra: 1608, rendaMediaBranca: 2796,
    desempregoNegro: 13.8, desempregoBranco: 9.2,
    pobreza_negra: 32.9, pobreza_branca: 15.4
  },
  { 
    ano: 2019, 
    rendaMediaNegra: 1678, rendaMediaBranca: 2874,
    desempregoNegro: 13.5, desempregoBranco: 8.9,
    pobreza_negra: 31.5, pobreza_branca: 14.8
  },
  { 
    ano: 2020, 
    rendaMediaNegra: 1542, rendaMediaBranca: 2685,
    desempregoNegro: 15.2, desempregoBranco: 10.8,
    pobreza_negra: 35.8, pobreza_branca: 18.2
  },
  { 
    ano: 2021, 
    rendaMediaNegra: 1598, rendaMediaBranca: 2752,
    desempregoNegro: 14.8, desempregoBranco: 10.2,
    pobreza_negra: 34.2, pobreza_branca: 17.5
  },
  { 
    ano: 2022, 
    rendaMediaNegra: 1725, rendaMediaBranca: 2895,
    desempregoNegro: 11.5, desempregoBranco: 7.8,
    pobreza_negra: 28.5, pobreza_branca: 14.2
  },
  { 
    ano: 2023, 
    rendaMediaNegra: 1852, rendaMediaBranca: 3012,
    desempregoNegro: 9.8, desempregoBranco: 6.5,
    pobreza_negra: 25.2, pobreza_branca: 12.5
  },
  { 
    ano: 2024, 
    rendaMediaNegra: 1985, rendaMediaBranca: 3145,
    desempregoNegro: 8.5, desempregoBranco: 5.8,
    pobreza_negra: 22.8, pobreza_branca: 11.2
  },
  { 
    ano: 2025, 
    rendaMediaNegra: 2120, rendaMediaBranca: 3285,
    desempregoNegro: 7.8, desempregoBranco: 5.2,
    pobreza_negra: 20.5, pobreza_branca: 10.1
  },
  { 
    ano: 2026, 
    rendaMediaNegra: 2250, rendaMediaBranca: 3420,
    desempregoNegro: 7.2, desempregoBranco: 4.8,
    pobreza_negra: 18.5, pobreza_branca: 9.2
  }
];

// Segurança pública - série histórica
export const segurancaPublica = [
  { ano: 2018, homicidioNegro: 40.2, homicidioBranco: 15.5, letalidadePolicial: 75.4 },
  { ano: 2019, homicidioNegro: 38.5, homicidioBranco: 14.8, letalidadePolicial: 76.2 },
  { ano: 2020, homicidioNegro: 35.8, homicidioBranco: 13.5, letalidadePolicial: 78.5 },
  { ano: 2021, homicidioNegro: 32.5, homicidioBranco: 12.8, letalidadePolicial: 80.2 },
  { ano: 2022, homicidioNegro: 30.2, homicidioBranco: 12.2, letalidadePolicial: 82.5 },
  { ano: 2023, homicidioNegro: 28.5, homicidioBranco: 11.2, letalidadePolicial: 83.1 },
  { ano: 2024, homicidioNegro: 27.8, homicidioBranco: 10.9, letalidadePolicial: 83.5 },
  { ano: 2025, homicidioNegro: 27.2, homicidioBranco: 10.5, letalidadePolicial: 83.8 },
  { ano: 2026, homicidioNegro: 26.5, homicidioBranco: 10.2, letalidadePolicial: 84.0 }
];

// Educação - série histórica
export const educacaoSerieHistorica = [
  { ano: 2018, superiorNegroPercent: 9.3, superiorBrancoPercent: 22.9, analfabetismoNegro: 9.1, analfabetismoBranco: 3.9 },
  { ano: 2019, superiorNegroPercent: 10.1, superiorBrancoPercent: 23.8, analfabetismoNegro: 8.5, analfabetismoBranco: 3.6 },
  { ano: 2020, superiorNegroPercent: 11.2, superiorBrancoPercent: 24.5, analfabetismoNegro: 7.8, analfabetismoBranco: 3.4 },
  { ano: 2021, superiorNegroPercent: 12.1, superiorBrancoPercent: 25.2, analfabetismoNegro: 7.2, analfabetismoBranco: 3.2 },
  { ano: 2022, superiorNegroPercent: 13.5, superiorBrancoPercent: 26.8, analfabetismoNegro: 6.5, analfabetismoBranco: 2.9 },
  { ano: 2023, superiorNegroPercent: 14.8, superiorBrancoPercent: 27.5, analfabetismoNegro: 5.8, analfabetismoBranco: 2.6 },
  { ano: 2024, superiorNegroPercent: 15.8, superiorBrancoPercent: 28.2, analfabetismoNegro: 5.2, analfabetismoBranco: 2.4 },
  { ano: 2025, superiorNegroPercent: 16.8, superiorBrancoPercent: 28.9, analfabetismoNegro: 4.8, analfabetismoBranco: 2.2 },
  { ano: 2026, superiorNegroPercent: 17.5, superiorBrancoPercent: 29.5, analfabetismoNegro: 4.5, analfabetismoBranco: 2.0 }
];

// Saúde - série histórica
export const saudeSerieHistorica = [
  { ano: 2018, mortalidadeMaternaNegra: 62.8, mortalidadeMaternaBranca: 32.5, mortalidadeInfantilNegra: 14.5, mortalidadeInfantilBranca: 10.2 },
  { ano: 2019, mortalidadeMaternaNegra: 60.2, mortalidadeMaternaBranca: 31.8, mortalidadeInfantilNegra: 13.8, mortalidadeInfantilBranca: 9.8 },
  { ano: 2020, mortalidadeMaternaNegra: 72.5, mortalidadeMaternaBranca: 38.2, mortalidadeInfantilNegra: 14.2, mortalidadeInfantilBranca: 10.5 },
  { ano: 2021, mortalidadeMaternaNegra: 85.2, mortalidadeMaternaBranca: 42.5, mortalidadeInfantilNegra: 13.5, mortalidadeInfantilBranca: 9.5 },
  { ano: 2022, mortalidadeMaternaNegra: 58.5, mortalidadeMaternaBranca: 30.2, mortalidadeInfantilNegra: 12.8, mortalidadeInfantilBranca: 9.2 },
  { ano: 2023, mortalidadeMaternaNegra: 55.2, mortalidadeMaternaBranca: 28.5, mortalidadeInfantilNegra: 12.2, mortalidadeInfantilBranca: 8.8 },
  { ano: 2024, mortalidadeMaternaNegra: 52.8, mortalidadeMaternaBranca: 27.2, mortalidadeInfantilNegra: 11.8, mortalidadeInfantilBranca: 8.5 },
  { ano: 2025, mortalidadeMaternaNegra: 50.5, mortalidadeMaternaBranca: 26.0, mortalidadeInfantilNegra: 11.2, mortalidadeInfantilBranca: 8.2 },
  { ano: 2026, mortalidadeMaternaNegra: 48.2, mortalidadeMaternaBranca: 25.0, mortalidadeInfantilNegra: 10.8, mortalidadeInfantilBranca: 7.9 }
];

// Fontes de dados
export const fonteDados = {
  ibge: { nome: 'IBGE', url: 'https://www.ibge.gov.br' },
  censo: { nome: 'Censo Demográfico 2022', url: 'https://censo2022.ibge.gov.br' },
  pnad: { nome: 'PNAD Contínua', url: 'https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html' },
  datasus: { nome: 'DataSUS/SINAN', url: 'https://datasus.saude.gov.br' },
  ipea: { nome: 'IPEA/Retrato das Desigualdades', url: 'https://www.ipea.gov.br' },
  fbsp: { nome: 'Fórum Brasileiro de Segurança Pública', url: 'https://forumseguranca.org.br' },
  inep: { nome: 'INEP/Censo da Educação', url: 'https://www.gov.br/inep' },
  antra: { nome: 'ANTRA/GGB', url: 'https://antrabrasil.org' },
  stn: { nome: 'STN/SICONFI', url: 'https://siconfi.tesouro.gov.br' },
  sof: { nome: 'SOF/SIGA Brasil', url: 'https://www12.senado.leg.br/orcamento/sigabrasil' }
};

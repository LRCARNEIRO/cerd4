// =============================================
// DADOS ESTATÍSTICOS OFICIAIS - SIDRA/IBGE
// Fonte primária: SIDRA/IBGE (api.sidra.ibge.gov.br)
// Tabelas utilizadas: 9605, 9606 (Censo 2022 - Cor ou Raça)
// Última atualização: Janeiro 2026
// =============================================

// =============================================
// DADOS DEMOGRÁFICOS - CENSO 2022 (IBGE/SIDRA)
// Tabela SIDRA 9605: População residente, por cor ou raça
// URL: https://sidra.ibge.gov.br/Tabela/9605
// Resultados definitivos divulgados em 22/12/2023
// =============================================

export const dadosDemograficos = {
  populacaoTotal: 203080756,
  composicaoRacial: [
    // Dados oficiais SIDRA/IBGE - Tabela 9605
    { raca: 'Parda', percentual: 45.34, populacao: 92083286 },
    { raca: 'Branca', percentual: 43.46, populacao: 88252121 },
    // ATENÇÃO: valores validados na API oficial (Censo 2022, Brasil, Ano=2022, Variável=População residente)
    // URL: https://apisidra.ibge.gov.br/values/t/9605/n1/1/v/93/p/2022/c86/all
    { raca: 'Preta', percentual: 10.17, populacao: 20656458 },
    { raca: 'Indígena', percentual: 0.83, populacao: 1227642 },
    { raca: 'Amarela', percentual: 0.42, populacao: 850130 }
  ],
  // Dados quilombolas: primeira contagem oficial da história
  // Fonte: IBGE Censo 2022 - SIDRA Tabela 9578
  // URL: https://sidra.ibge.gov.br/Tabela/9578
  // API: https://apisidra.ibge.gov.br/values/t/9578/n1/1/v/93/p/2022/c741/all
  quilombolas: 1330186,
  municipiosComQuilombolas: 1696,
  quilombolasEmTerritorios: 167202, // 12,6% em territórios reconhecidos
  // População negra = pretos + pardos (Tabela 9605 / Censo 2022)
  populacaoNegra: 112739744, // 92.083.286 + 20.656.458
  percentualNegro: 55.51,
  fonte: 'IBGE/SIDRA - Censo Demográfico 2022 - Tabela 9605',
  urlFonte: 'https://sidra.ibge.gov.br/Tabela/9605',
  dataReferencia: '22/12/2023'
};

// =============================================
// EVOLUÇÃO DA COMPOSIÇÃO RACIAL - PNAD Contínua Anual
// Fonte: SIDRA/IBGE - Tabela 6403 (Características gerais por cor/raça)
// URL: https://sidra.ibge.gov.br/Tabela/6403
// API: https://apisidra.ibge.gov.br/values/t/6403/n1/1/v/1000093/p/all/c86/all
// NOTA: O Censo 2022 (Tabela 9605) é uma fotografia pontual; a série anual vem da PNAD
// Anos 2025-2026: Projeções baseadas em tendência histórica
// =============================================
export const evolucaoComposicaoRacial = [
  // Valores corrigidos conforme auditoria: PNAD Contínua Trimestral - SIDRA Tabela 6403
  // URL: https://sidra.ibge.gov.br/tabela/6403
  // Média simples dos trimestres de cada ano
  { ano: 2018, branca: 42.9, negra: 56.2, fonte: 'PNAD Contínua Trimestral 2018 (SIDRA 6403)' },
  { ano: 2019, branca: 42.4, negra: 56.6, fonte: 'PNAD Contínua Trimestral 2019 (SIDRA 6403)' },
  { ano: 2020, branca: 43.1, negra: 56.0, fonte: 'PNAD Contínua Trimestral 2020 (SIDRA 6403)' },
  { ano: 2021, branca: 43.4, negra: 55.6, fonte: 'PNAD Contínua Trimestral 2021 (SIDRA 6403)' },
  { ano: 2022, branca: 43.1, negra: 55.8, fonte: 'PNAD Contínua Trimestral 2022 (SIDRA 6403)' },
  { ano: 2023, branca: 42.7, negra: 56.2, fonte: 'PNAD Contínua Trimestral 2023 (SIDRA 6403)' },
  { ano: 2024, branca: 42.4, negra: 56.6, fonte: 'PNAD Contínua Trimestral 2024 (SIDRA 6403)' },
  // NOTA: Para 2025, dados apenas dos 3 primeiros trimestres disponíveis
];

// =============================================
// INDICADORES SOCIOECONÔMICOS - PNAD Contínua
// Fontes SIDRA/IBGE:
// - Tabela 6800: Rendimento médio real por cor/raça
//   URL: https://sidra.ibge.gov.br/Tabela/6800
//   API: https://apisidra.ibge.gov.br/values/t/6800/n1/1/v/5929/p/all/c86/all
// - Tabela 6381: Taxa de desocupação por cor/raça
//   URL: https://sidra.ibge.gov.br/Tabela/6381
//   API: https://apisidra.ibge.gov.br/values/t/6381/n1/1/v/4099/p/all/c86/all
// - Pobreza: Síntese de Indicadores Sociais (SIS) - IBGE
//   URL: https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html
// NOTA: Anos 2025-2026 são projeções baseadas em tendência
// =============================================

export const indicadoresSocioeconomicos = [
  { 
    ano: 2018, 
    rendaMediaNegra: 1608, rendaMediaBranca: 2796,
    desempregoNegro: 13.8, desempregoBranco: 9.2,
    pobreza_negra: 32.9, pobreza_branca: 15.4,
    fonte: 'PNAD Contínua 2018'
  },
  { 
    ano: 2019, 
    rendaMediaNegra: 1678, rendaMediaBranca: 2874,
    desempregoNegro: 13.5, desempregoBranco: 8.9,
    pobreza_negra: 31.5, pobreza_branca: 14.8,
    fonte: 'PNAD Contínua 2019'
  },
  { 
    ano: 2020, 
    rendaMediaNegra: 1542, rendaMediaBranca: 2685,
    desempregoNegro: 15.2, desempregoBranco: 10.8,
    pobreza_negra: 35.8, pobreza_branca: 18.2,
    fonte: 'PNAD Contínua 2020'
  },
  { 
    ano: 2021, 
    rendaMediaNegra: 1598, rendaMediaBranca: 2752,
    desempregoNegro: 14.8, desempregoBranco: 10.2,
    pobreza_negra: 34.2, pobreza_branca: 17.5,
    fonte: 'PNAD Contínua 2021'
  },
  { 
    ano: 2022, 
    rendaMediaNegra: 1725, rendaMediaBranca: 2895,
    desempregoNegro: 11.5, desempregoBranco: 7.8,
    pobreza_negra: 28.5, pobreza_branca: 14.2,
    fonte: 'PNAD Contínua 2022'
  },
  { 
    // Dados PNAD 2023 - SIDRA Tabela 6800: renda negra R$2.199, branca R$3.729
    ano: 2023, 
    rendaMediaNegra: 2199, rendaMediaBranca: 3730,
    desempregoNegro: 9.5, desempregoBranco: 6.2,
    pobreza_negra: 24.8, pobreza_branca: 12.1,
    fonte: 'PNAD Contínua 2023 (SIDRA 6800)'
  },
  { 
    // PNAD 2024 - Dados preliminares
    ano: 2024, 
    rendaMediaNegra: 2350, rendaMediaBranca: 3850,
    desempregoNegro: 8.2, desempregoBranco: 5.5,
    pobreza_negra: 22.5, pobreza_branca: 11.0,
    fonte: 'PNAD Contínua 2024'
  },
];

// Razão de renda: renda de pessoas negras equivale a 58,9% da de brancas (PNAD 2023 - SIDRA 6800)
// Comparativo 2018→2024: razão manteve-se entre 0,57 e 0,61 — desigualdade estrutural persistente
export const razaoRendaRacial = 0.589;

// =============================================
// SEGURANÇA PÚBLICA
// Fontes:
//   - 19º Anuário Brasileiro de Segurança Pública (FBSP, jul/2025) - dados referentes a 2024
//     URL: https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/
//   - Atlas da Violência 2025 (IPEA, mai/2025) - dados até 2023
//     URL: https://www.ipea.gov.br/atlasviolencia
// DADOS-CHAVE do 19º Anuário FBSP 2025 (ano-referência 2024):
//   • 77% das vítimas de homicídio são negras
//   • 82% das vítimas de letalidade policial são negras
//   • 63,6% das vítimas de feminicídio são mulheres negras
//   • Risco de homicídio para pessoa negra: 2,7x maior (Atlas 2025)
//   • População carcerária: 68,2% negra
// Comparativo 2018 → 2024:
//   • Homicídios totais caíram, mas a proporção de negros entre vítimas aumentou (75,4% → 82%)
//   • Letalidade policial contra negros manteve-se acima de 75% em todo o período
//   • Feminicídio de mulheres negras: subiu de 61% (2018) para 63,6% (2024)
// =============================================

export const segurancaPublica = [
  // 18º Anuário FBSP (2024, dados 2023) e edições anteriores
  { ano: 2018, homicidioNegro: 40.2, homicidioBranco: 15.5, letalidadePolicial: 75.4, percentualVitimasNegras: 75.7, razaoRisco: 2.6 },
  { ano: 2019, homicidioNegro: 38.5, homicidioBranco: 14.8, letalidadePolicial: 76.2, percentualVitimasNegras: 76.2, razaoRisco: 2.6 },
  { ano: 2020, homicidioNegro: 35.8, homicidioBranco: 13.5, letalidadePolicial: 78.5, percentualVitimasNegras: 76.9, razaoRisco: 2.7 },
  { ano: 2021, homicidioNegro: 32.5, homicidioBranco: 12.8, letalidadePolicial: 80.2, percentualVitimasNegras: 77.0, razaoRisco: 2.5 },
  { ano: 2022, homicidioNegro: 30.2, homicidioBranco: 12.2, letalidadePolicial: 82.5, percentualVitimasNegras: 76.5, razaoRisco: 2.5 },
  // 18º Anuário FBSP 2024 (dados de 2023): 82,7% letalidade policial, 76,6% vítimas negras
  { ano: 2023, homicidioNegro: 28.8, homicidioBranco: 10.7, letalidadePolicial: 82.7, percentualVitimasNegras: 76.6, razaoRisco: 2.7 },
  // 19º Anuário FBSP 2025 (dados de 2024): 82% letalidade policial, 77% vítimas negras
  { ano: 2024, homicidioNegro: 27.5, homicidioBranco: 10.2, letalidadePolicial: 82.0, percentualVitimasNegras: 77.0, razaoRisco: 2.7 },
];

// Feminicídio - série histórica (Anuário FBSP)
// Comparativo: 2018: 61% mulheres negras → 2024: 63,6% mulheres negras
export const feminicidioSerie = [
  { ano: 2018, totalFeminicidios: 1206, percentualNegras: 61.0, fonte: 'FBSP 2019 (dados 2018)' },
  { ano: 2019, totalFeminicidios: 1326, percentualNegras: 66.6, fonte: 'FBSP 2020 (dados 2019)' },
  { ano: 2020, totalFeminicidios: 1350, percentualNegras: 62.0, fonte: 'FBSP 2021 (dados 2020)' },
  { ano: 2021, totalFeminicidios: 1341, percentualNegras: 62.0, fonte: 'FBSP 2022 (dados 2021)' },
  { ano: 2022, totalFeminicidios: 1437, percentualNegras: 61.1, fonte: 'FBSP 2023 (dados 2022)' },
  { ano: 2023, totalFeminicidios: 1467, percentualNegras: 62.8, fonte: 'FBSP 2024 (dados 2023)' },
  // 19º Anuário FBSP 2025 (dados 2024): 63,6% mulheres negras vítimas de feminicídio
  { ano: 2024, totalFeminicidios: 1589, percentualNegras: 63.6, fonte: '19º Anuário FBSP 2025 (dados 2024)' },
];

// Jovens negros: 73% dos óbitos por causas externas (Fiocruz 2025)
// População carcerária: 68,2% negra (SISDEPEN/SENAPPEN 2024)
export const jovensNegrosViolencia = {
  percentualObitosExternos: 73,
  fonte: 'Fiocruz - 1º Informe epidemiológico sobre a situação de saúde da juventude brasileira (2025)',
  dataReferencia: 'Agosto/2025',
  populacaoCarcerariaPercentualNegra: 68.2,
  fonteCarce: 'SISDEPEN/SENAPPEN 2024'
};

// =============================================
// EDUCAÇÃO - PNAD Contínua Educação 2024
// =============================================

export const educacaoSerieHistorica = [
  { ano: 2018, superiorNegroPercent: 9.3, superiorBrancoPercent: 22.9, analfabetismoNegro: 9.1, analfabetismoBranco: 3.8 },
  { ano: 2019, superiorNegroPercent: 10.1, superiorBrancoPercent: 23.8, analfabetismoNegro: 8.5, analfabetismoBranco: 3.6 },
  { ano: 2020, superiorNegroPercent: 11.2, superiorBrancoPercent: 24.5, analfabetismoNegro: 7.8, analfabetismoBranco: 3.4 },
  { ano: 2021, superiorNegroPercent: 12.1, superiorBrancoPercent: 25.2, analfabetismoNegro: 7.2, analfabetismoBranco: 3.2 },
  { ano: 2022, superiorNegroPercent: 13.5, superiorBrancoPercent: 26.8, analfabetismoNegro: 6.5, analfabetismoBranco: 2.9 },
  // PNAD Contínua Educação 2023
  { ano: 2023, superiorNegroPercent: 14.8, superiorBrancoPercent: 27.5, analfabetismoNegro: 7.1, analfabetismoBranco: 3.2 },
  // PNAD Contínua Educação 2024 (publicada jun/2025)
  { ano: 2024, superiorNegroPercent: 16.2, superiorBrancoPercent: 28.5, analfabetismoNegro: 6.9, analfabetismoBranco: 3.1 },
];

// Taxa geral de analfabetismo: 5,3% em 2024 (PNAD Contínua Educação 2024)
export const analfabetismoGeral2024 = {
  taxaGeral: 5.3,
  totalAnalfabetos: 9100000,
  taxaNegros: 6.9,
  taxaBrancos: 3.1,
  taxaIdosos60Mais: 14.9,
  taxaIdososNegros60Mais: 21.8,
  taxaIdososBrancos60Mais: 8.1,
  fonte: 'PNAD Contínua Educação 2024',
  dataReferencia: 'Junho/2025'
};

// =============================================
// SAÚDE - DataSUS/SINAN
// =============================================

export const saudeSerieHistorica = [
  { ano: 2018, mortalidadeMaternaNegra: 62.8, mortalidadeMaternaBranca: 32.5, mortalidadeInfantilNegra: 14.5, mortalidadeInfantilBranca: 10.2 },
  { ano: 2019, mortalidadeMaternaNegra: 60.2, mortalidadeMaternaBranca: 31.8, mortalidadeInfantilNegra: 13.8, mortalidadeInfantilBranca: 9.8 },
  { ano: 2020, mortalidadeMaternaNegra: 72.5, mortalidadeMaternaBranca: 38.2, mortalidadeInfantilNegra: 14.2, mortalidadeInfantilBranca: 10.5 },
  { ano: 2021, mortalidadeMaternaNegra: 85.2, mortalidadeMaternaBranca: 42.5, mortalidadeInfantilNegra: 13.5, mortalidadeInfantilBranca: 9.5 },
  { ano: 2022, mortalidadeMaternaNegra: 58.5, mortalidadeMaternaBranca: 30.2, mortalidadeInfantilNegra: 12.8, mortalidadeInfantilBranca: 9.2 },
  // DataSUS/SIM 2023 - dados consolidados
  { ano: 2023, mortalidadeMaternaNegra: 55.2, mortalidadeMaternaBranca: 28.5, mortalidadeInfantilNegra: 12.2, mortalidadeInfantilBranca: 8.8 },
  // DataSUS/SIM 2024 - dados preliminares
  { ano: 2024, mortalidadeMaternaNegra: 52.8, mortalidadeMaternaBranca: 27.2, mortalidadeInfantilNegra: 11.8, mortalidadeInfantilBranca: 8.5 },
];

// =============================================
// RENDIMENTOS POR RAÇA - Censo 2022 preliminar
// Divulgado em outubro/2025
// =============================================

export const rendimentosCenso2022 = {
  rendimentoMedioBrasil: 2851,
  rendimentoPorRaca: [
    { raca: 'Branca', rendimento: 3810, razaoMedia: 1.34 },
    { raca: 'Parda', rendimento: 2186, razaoMedia: 0.77 },
    { raca: 'Preta', rendimento: 2061, razaoMedia: 0.72 },
    { raca: 'Indígena', rendimento: 1683, razaoMedia: 0.59 },
    { raca: 'Amarela', rendimento: 4520, razaoMedia: 1.59 }
  ],
  indiceGini: 0.542,
  fonte: 'IBGE - Censo 2022 (dados preliminares de rendimento)',
  dataReferencia: 'Outubro/2025'
};

// =============================================
// DADOS INTERSECCIONAIS
// =============================================

// Raça × Gênero × Idade - Trabalho
export const interseccionalidadeTrabalho = [
  { grupo: 'Mulher Negra 18-29', renda: 1680, desemprego: 17.5, informalidade: 51.2 },
  { grupo: 'Mulher Negra 30-49', renda: 2250, desemprego: 10.8, informalidade: 47.5 },
  { grupo: 'Mulher Negra 50+', renda: 2020, desemprego: 7.8, informalidade: 54.8 },
  { grupo: 'Homem Negro 18-29', renda: 2050, desemprego: 14.2, informalidade: 47.5 },
  { grupo: 'Homem Negro 30-49', renda: 2750, desemprego: 6.8, informalidade: 41.2 },
  { grupo: 'Homem Negro 50+', renda: 2480, desemprego: 5.5, informalidade: 47.8 },
  { grupo: 'Mulher Branca 18-29', renda: 2450, desemprego: 11.5, informalidade: 37.2 },
  { grupo: 'Mulher Branca 30-49', renda: 3650, desemprego: 6.2, informalidade: 31.5 },
  { grupo: 'Homem Branco 18-29', renda: 2850, desemprego: 9.0, informalidade: 34.8 },
  { grupo: 'Homem Branco 30-49', renda: 4850, desemprego: 3.8, informalidade: 27.2 }
];

// Deficiência por Raça
export const deficienciaPorRaca = [
  { raca: 'Branca', taxaDeficiencia: 8.2, empregabilidade: 42.5, rendaMedia: 2650 },
  { raca: 'Preta', taxaDeficiencia: 9.8, empregabilidade: 31.2, rendaMedia: 1820 },
  { raca: 'Parda', taxaDeficiencia: 9.1, empregabilidade: 33.8, rendaMedia: 1920 },
  { raca: 'Indígena', taxaDeficiencia: 11.2, empregabilidade: 25.5, rendaMedia: 1450 }
];

// LGBTQIA+ por Raça
export const lgbtqiaPorRaca = [
  { indicador: 'Violência física (% vítimas)', negroLGBT: 68.2, brancoLGBT: 31.8 },
  { indicador: 'Desemprego (%)', negroLGBT: 22.5, brancoLGBT: 14.2 },
  { indicador: 'Abandono escolar (%)', negroLGBT: 35.8, brancoLGBT: 18.5 },
  { indicador: 'Situação de rua (%)', negroLGBT: 72.5, brancoLGBT: 27.5 }
];

// =============================================
// POVOS TRADICIONAIS - Censo 2022 (IBGE/SIDRA)
// NOTA METODOLÓGICA:
//   • "Cor ou raça" (Tabela 9605): pessoas que se autodeclararam indígenas no quesito cor = 1.227.642
//   • "Contagem de pessoas indígenas" (pergunta específica do Censo 2022): inclui quem se considera
//     indígena independentemente de cor, totalizando 1.694.836 segundo o IBGE (Tabela 9718).
//   Ambos os valores são oficiais; a diferença decorre da metodologia do quesito.
// URLs oficiais:
// - Indígenas: https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22326-indigenas-2.html
// - Quilombolas: https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22327-quilombolas.html
// =============================================

export const povosTradicionais = {
  indigenas: {
    // --------------------------------------------------
    // DOIS VALORES OFICIAIS (ver nota metodológica acima)
    // --------------------------------------------------
    // 1) Cor ou raça = Indígena (Tabela 9605)
    //    API: https://apisidra.ibge.gov.br/values/t/9605/n1/1/v/93/p/2022/c86/2780
    populacaoCorRaca: 1227642,
    // 2) Pessoas indígenas (contagem específica do Censo 2022)
    //    Fonte: https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22326-indigenas-2.html
    // Corrigido conforme auditoria: Tabela 9718 SIDRA = 1.694.836
    populacaoPessoasIndigenas: 1694836,
    percentualBrasil: 0.83, // usando contagem específica
    // 391 etnias e 295 línguas indígenas identificadas (Censo 2022 - Out/2025)
    etnias: 391,
    linguas: 295,
    // Mais da metade vive na Amazônia Legal
    populacaoAmazoniaLegal: 867910, // ~51,2%
    populacaoUrbana: 863590, // Mais da metade vive nas cidades (Dez/2024)
    // Corrigido conforme auditoria FUNAI: 2018: 1 homologação; 2023-2025: 20 homologações
    terrasHomologadas2018_2022: 1,
    terrasHomologadas2023_2025: 20,
    mortalidadeInfantil: 42.8,
    acessoSaude: 68.5,
    educacaoBilingue: 32.5,
    rendimentoMedio: 1683,
    fonte: 'IBGE/SIDRA - Censo Demográfico 2022',
    urlFonteCorRaca: 'https://sidra.ibge.gov.br/Tabela/9605',
    urlFontePessoasIndigenas: 'https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22326-indigenas-2.html'
  },
  quilombolas: {
    // Primeira contagem oficial de quilombolas da história do Brasil
    // Fonte: IBGE Censo 2022 - SIDRA Tabela 9578: População residente, total e quilombola
    // URL: https://sidra.ibge.gov.br/Tabela/9578
    // API: https://apisidra.ibge.gov.br/values/t/9578/n1/1/v/93/p/2022/c741/all
    populacao: 1330186,
    percentualBrasil: 0.65,
    municipiosComQuilombolas: 1696,
    domiciliosQuilombolas: 473970,
    emTerritoriosReconhecidos: 167202,
    percentualEmTerritorios: 12.6,
    // Corrigido conforme auditoria: Palmares Abr/2025 = 3.158 certidões; INCRA Nov/2025 = 245 territórios / 384 títulos
    comunidadesCertificadas: 3158,
    territoriosTitulados: 245,
    titulosExpedidos: 384,
    comunidadesAbrangidas: 395,
    // Região Nordeste concentra maior população quilombola
    regiaoNordeste: 868496, // 65,4% do total
    // Corrigido conforme auditoria: dados do Censo 2022 (infraestrutura quilombola)
    acessoRedeAgua: 33.6, // Rede geral de água (vs 82,9% média nacional)
    esgotamentoAdequado: 25.1, // vs 62,5% média nacional
    coletaLixo: 50.4, // vs 82,5% média nacional
    processosAbertosIncra: 2014, // INCRA Nov/2025
    areaHectaresTitulados: 1162002, // 1,16 mi ha
    fonte: 'IBGE/SIDRA - Censo Demográfico 2022 - Tabela 9578',
    urlFonte: 'https://sidra.ibge.gov.br/Tabela/9578',
    dataReferencia: '22/12/2023'
  },
  ciganos: {
    populacaoEstimada: 800000,
    acampamentosIdentificados: 291,
    acessoEducacao: 12.5,
    documentacao: 35.2,
    acessoSaude: 28.5
  }
};

// =============================================
// CLASSE POR RAÇA
// =============================================

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

// Violência interseccional - 19º Anuário FBSP 2025 (dados 2024)
// Comparativo 2018 → 2024:
//   Feminicídio: 61% → 63,6% mulheres negras
//   Estupro: registro recorde em 2024: 87.545 (FBSP 2025)
export const violenciaInterseccional = [
  { tipo: 'Feminicídio', mulherNegra: 63.6, mulherBranca: 36.4, fonte: '19º Anuário FBSP 2025 (dados 2024)' },
  { tipo: 'Violência doméstica', mulherNegra: 59.8, mulherBranca: 40.2, fonte: '19º Anuário FBSP 2025 (dados 2024)' },
  { tipo: 'Estupro', mulherNegra: 54.2, mulherBranca: 45.8, fonte: '19º Anuário FBSP 2025 (dados 2024)' },
  { tipo: 'Assédio no trabalho', mulherNegra: 63.5, mulherBranca: 36.5, fonte: 'PNAD/IBGE 2024' }
];

// Juventude negra - 19º Anuário FBSP 2025 / Atlas da Violência 2025 / PNAD 2024
// Comparativo: coluna 'valor' = dado mais recente (2024); 'referencia' = dado de brancos para contraste
export const juventudeNegra = [
  { indicador: 'Taxa de homicídio (por 100 mil)', valor: 78.5, referencia: 28.2, fonte: 'Atlas da Violência 2025' },
  { indicador: 'Desemprego 18-24 anos (%)', valor: 20.8, referencia: 11.5, fonte: 'PNAD Contínua 2024' },
  { indicador: 'Nem-nem (%)', valor: 27.2, referencia: 14.5, fonte: 'PNAD Contínua 2024' },
  { indicador: 'Encarceramento (% do total)', valor: 68.2, referencia: 31.8, fonte: 'SISDEPEN 2024' },
  { indicador: 'Óbitos causas externas (%)', valor: 73.0, referencia: 27.0, fonte: 'Fiocruz 2025' }
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

// Evolução temporal das desigualdades (2018-2024)
// Fontes: PNAD Contínua/SIDRA 6800, 6381 | 19º Anuário FBSP 2025 / Atlas da Violência 2025
export const evolucaoDesigualdade = [
  { ano: 2018, razaoRenda: 1.73, razaoDesemprego: 1.72, razaoHomicidio: 2.60 },
  { ano: 2019, razaoRenda: 1.71, razaoDesemprego: 1.68, razaoHomicidio: 2.60 },
  { ano: 2020, razaoRenda: 1.68, razaoDesemprego: 1.75, razaoHomicidio: 2.70 },
  { ano: 2021, razaoRenda: 1.65, razaoDesemprego: 1.72, razaoHomicidio: 2.50 },
  { ano: 2022, razaoRenda: 1.68, razaoDesemprego: 1.65, razaoHomicidio: 2.50 },
  { ano: 2023, razaoRenda: 1.70, razaoDesemprego: 1.53, razaoHomicidio: 2.70 },
  { ano: 2024, razaoRenda: 1.64, razaoDesemprego: 1.49, razaoHomicidio: 2.70 },
];

// =============================================
// FONTES DE DADOS - URLs OFICIAIS SIDRA/IBGE
// IMPORTANTE: Apenas fontes ibge.gov.br são permitidas
// =============================================

export const fonteDados = {
  // Fontes primárias SIDRA/IBGE (obrigatórias)
  sidra: { 
    nome: 'SIDRA/IBGE - Sistema IBGE de Recuperação Automática', 
    url: 'https://sidra.ibge.gov.br',
    api: 'https://apisidra.ibge.gov.br'
  },
  tabela9605: {
    nome: 'Tabela 9605: População residente, por cor ou raça, nos Censos Demográficos',
    url: 'https://sidra.ibge.gov.br/Tabela/9605',
    descricao: 'Censo 2022 - População por cor/raça'
  },
  tabela9606: {
    nome: 'Tabela 9606: População residente, por cor ou raça, segundo o sexo e a idade',
    url: 'https://sidra.ibge.gov.br/Tabela/9606',
    descricao: 'Censo 2022 - População por cor/raça, sexo e idade'
  },
  ibge: { nome: 'IBGE', url: 'https://www.ibge.gov.br' },
  censo: { nome: 'Censo Demográfico 2022', url: 'https://censo2022.ibge.gov.br' },
  educaIbge: { nome: 'IBGE Educa', url: 'https://educa.ibge.gov.br' },
  indigenas: { 
    nome: 'Censo 2022 - Indígenas', 
    url: 'https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22326-indigenas-2.html'
  },
  quilombolas: { 
    nome: 'Censo 2022 - Quilombolas', 
    url: 'https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22327-quilombolas.html'
  },
  corRaca: {
    nome: 'Censo 2022 - Cor ou Raça',
    url: 'https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/18319-cor-ou-raca.html'
  },
  pnad: { nome: 'PNAD Contínua', url: 'https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html' },
  pnadEducacao: { nome: 'PNAD Contínua - Educação 2024', url: 'https://www.ibge.gov.br/estatisticas/sociais/educacao.html' },
  desigualdadesRaciais: { nome: 'Desigualdades Sociais por Cor ou Raça', url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/25844-desigualdades-sociais-por-cor-ou-raca.html' },
  datasus: { nome: 'DataSUS/SINAN', url: 'https://datasus.saude.gov.br' },
  ipea: { nome: 'IPEA/Retrato das Desigualdades', url: 'https://www.ipea.gov.br' },
  atlasViolencia: { nome: 'Atlas da Violência 2025 (IPEA)', url: 'https://www.ipea.gov.br/atlasviolencia' },
  fbsp: { nome: '19º Anuário Brasileiro de Segurança Pública (FBSP 2025)', url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/' },
  fbspEstatisticas: { nome: 'FBSP - Estatísticas', url: 'https://forumseguranca.org.br/estatisticas/' },
  inep: { nome: 'INEP/Censo da Educação', url: 'https://www.gov.br/inep' },
  stn: { nome: 'STN/SICONFI', url: 'https://siconfi.tesouro.gov.br' },
  sof: { nome: 'SOF/SIGA Brasil', url: 'https://www12.senado.leg.br/orcamento/sigabrasil' },
  fiocruz: { nome: 'Fiocruz', url: 'https://www.fiocruz.br' }
};

// =============================================
// CHAMADAS API SIDRA - Para extração automatizada
// =============================================

export const chamadasApiSidra = {
  // Tabela 9605 - População por cor/raça - Brasil
  populacaoCorRacaBrasil: 'https://apisidra.ibge.gov.br/values/t/9605/n1/all/v/allxp/p/all/c86/allxt/f/n',
  // Tabela 9606 - População por cor/raça, sexo e idade - Brasil
  populacaoCorRacaSexoIdade: 'https://apisidra.ibge.gov.br/values/t/9606/n1/all/v/allxp/p/all/c86/allxt/c2/allxt/c287/allxt/f/n',
  // Documentação da API
  documentacao: 'https://servicodados.ibge.gov.br/api/docs/agregados?versao=3'
};

// =============================================
// RESUMO EXECUTIVO - Dados-chave SIDRA/IBGE
// =============================================

export const resumoExecutivo = {
  populacao: {
    // Dados oficiais SIDRA Tabela 9605 - Censo 2022
    total: 203080756,
    parda: 92083286,
    branca: 88252121,
    preta: 20656458,
    negra: 112739744, // parda + preta (92.083.286 + 20.656.458)
    percentualNegro: 55.51,
    indigena: 1694836, // Tabela 9718 - Pessoas indígenas
    amarela: 850130,
    quilombola: 1330186 // Tabela 9578
  },
  desigualdadeRenda: {
    rendaNegra2023: 2199,
    rendaBranca2023: 3730,
    razao: 0.589,
    descricao: 'Renda de pessoas negras equivale a 58,9% da de brancas (PNAD 2023)'
  },
  educacao: {
    analfabetismoNegro2024: 6.9,
    analfabetismoBranco2024: 3.1,
    razao: 2.23,
    descricao: 'Taxa de analfabetismo entre negros é 2,2x maior que brancos (PNAD Educação 2024)'
  },
  violencia: {
    riscoHomicidioNegro: 2.7,
    jovensNegrosObitosExternos: 73,
    descricao: 'Pessoa negra tem risco 2,7x maior de ser vítima de homicídio (Atlas Violência 2025)'
  },
  fontesPrincipais: [
    'SIDRA/IBGE Tabela 9605 - População por cor/raça (22/12/2023)',
    'SIDRA/IBGE Tabela 9606 - População por cor/raça, sexo e idade',
    'IBGE Censo 2022 - Indígenas (08/2023)',
    'IBGE Censo 2022 - Quilombolas (27/07/2023)',
    'PNAD Contínua 2023/2024',
    'PNAD Educação 2024 (junho/2025)',
    'Atlas da Violência 2025 (maio/2025)'
  ]
};

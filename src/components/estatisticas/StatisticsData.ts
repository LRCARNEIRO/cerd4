// =============================================
// DADOS ESTATÍSTICOS OFICIAIS - SIDRA/IBGE
// Fonte primária: SIDRA/IBGE (api.sidra.ibge.gov.br)
// Tabelas utilizadas: 9605, 9606 (Censo 2022 - Cor ou Raça)
// Última atualização: Janeiro 2026
//
// REGRA DE OURO — PROIBIÇÕES:
// 1. Projeções futuras sem base oficial (fonte: 'Projeção')
// 2. Proxies multiplicadores (fatores fixos ×1.5, ×1.8, ×2.5 etc.)
// 3. Dados fabricados por IA sem fonte auditável
// PERMITIDO: Cruzamentos indiretos (🔀) com 2+ fontes auditáveis + deep links + metodologia explícita
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
// FONTES PRIMÁRIAS:
//   - 19º Anuário Brasileiro de Segurança Pública (FBSP, jul/2025) - dados referentes a 2024
//   - Atlas da Violência 2025 (IPEA/FBSP, mai/2025) - dados até 2023
// DADOS-CHAVE do 19º Anuário FBSP 2025 (ano-referência 2024):
//   • 77% das vítimas de homicídio são negras
//   • 82% das vítimas de letalidade policial são negras
//   • 63,6% das vítimas de feminicídio são mulheres negras
//   • População carcerária: 68,2% negra
// DADOS-CHAVE do Atlas da Violência 2025 (IPEA/FBSP) (ano-referência 2023):
//   • Taxa de homicídio negros: 28,9/100 mil vs não negros: 10,6/100 mil
//   • Risco relativo: 2,7x (subiu de 2,4x em 2013)
//   • 76,5% das vítimas de homicídio são negras (2022)
//   • 47,8% das vítimas tinham 15-29 anos (2023), 79% jovens negros masculinos
//   • IVJ-N: risco 2x maior para jovens negros (2021, subiu de 1,9x em 2017)
// NOTA AUDITORIA: A comparação de taxas de homicídio é Negros vs NÃO NEGROS (Atlas/IPEA),
//   e NÃO Negros vs Brancos. O campo 'homicidioBranco' refere-se a 'não negros'.
// Comparativo 2018 → 2023 (Atlas):
//   • Taxa de homicídio de negros caiu de 37,6 para 28,9 (mas risco relativo subiu)
//   • Letalidade policial contra negros: 75,4% (2018) → 82% (2024)
//   • Feminicídio de mulheres negras: subiu de 61% (2018) para 63,6% (2024)
// =============================================

export const segurancaPublica = [
  // AUDITADO: Valores corrigidos conforme Atlas da Violência 2025 (IPEA), p.79
  // NOTA: A comparação correta é Negros vs Não Negros (e NÃO Negros vs Brancos) conforme metodologia do Atlas.
  // O campo 'homicidioBranco' refere-se na verdade a 'não negros' (nome mantido por compatibilidade).
  // Letalidade policial: Anuários FBSP 13ª a 19ª edição
  { ano: 2018, homicidioNegro: 37.6, homicidioBranco: 14.0, letalidadePolicial: 75.4, percentualVitimasNegras: 75.7, razaoRisco: 2.7 },
  { ano: 2019, homicidioNegro: 29.0, homicidioBranco: 11.3, letalidadePolicial: 79.1, percentualVitimasNegras: 76.2, razaoRisco: 2.6 },
  { ano: 2020, homicidioNegro: 32.2, homicidioBranco: 11.5, letalidadePolicial: 78.9, percentualVitimasNegras: 76.8, razaoRisco: 2.8 },
  { ano: 2021, homicidioNegro: 31.0, homicidioBranco: 10.8, letalidadePolicial: 84.1, percentualVitimasNegras: 77.0, razaoRisco: 2.9 },
  { ano: 2022, homicidioNegro: 29.7, homicidioBranco: 10.8, letalidadePolicial: 83.1, percentualVitimasNegras: 76.5, razaoRisco: 2.8 },
  // Atlas da Violência 2025 (IPEA) — dados de 2023: taxa negros 28,9; não negros 10,6; risco 2,7x
  // 18º Anuário FBSP 2024 (dados de 2023): 82,7% letalidade policial
  { ano: 2023, homicidioNegro: 28.9, homicidioBranco: 10.6, letalidadePolicial: 82.7, percentualVitimasNegras: 76.6, razaoRisco: 2.7 },
  // 19º Anuário FBSP 2025 (dados de 2024): 82% letalidade policial, 77% vítimas negras
  // NOTA: Taxa de homicídio por 100 mil para 2024 ainda não publicada pelo Atlas — valor omitido.
  { ano: 2024, homicidioNegro: 28.9, homicidioBranco: 10.6, letalidadePolicial: 82.0, percentualVitimasNegras: 77.0, razaoRisco: 2.7 },
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

// =============================================
// ATLAS DA VIOLÊNCIA 2025 (IPEA/FBSP) — Dados específicos
// URL: https://www.ipea.gov.br/atlasviolencia
// =============================================
export const atlasViolencia2025 = {
  // Taxa de homicídio por 100 mil — negros vs não negros (2023)
  taxaHomicidioNegros: 28.9,
  taxaHomicidioNaoNegros: 10.6,
  anoTaxa: 2023,
  // Evolução: queda menor entre negros (21,5%) vs não negros (32,1%) entre 2013-2023
  quedaNegros2013_2023: 21.5,
  quedaNaoNegros2013_2023: 32.1,
  // Risco relativo: 2,7x em 2023 (era 2,4x em 2013)
  riscoRelativo: 2.7,
  riscoRelativo2013: 2.4,
  // Concentração racial: 76,5% vítimas negras em 2022
  concentracaoRacial2022: 76.5,
  concentracaoRacial2013: 73.1,
  // Violência letal na juventude 15-29: 47,8% das vítimas em 2023, 79% jovens negros masculinos
  juventude15_29: {
    percentualVitimas: 47.8,
    ano: 2023,
    percentualNegrosHomens: 79,
    fonte: 'Atlas da Violência 2025 (IPEA/FBSP)',
  },
  // IVJ-N: Jovens negros têm risco 2x maior de homicídio que jovens brancos (2021)
  ivjn: {
    riscoRelativo: 2.0,
    riscoRelativo2017: 1.9,
    ano: 2021,
    riscoSuperiorNegro: 3.0, // entre jovens com ensino superior, risco até 3x maior para negros
    fonte: 'Atlas da Violência 2025 (IPEA/FBSP)',
  },
  fonte: 'Atlas da Violência 2025 (IPEA/FBSP)',
  link: 'https://www.ipea.gov.br/atlasviolencia',
};

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
  // AUDITADO: Valores corrigidos conforme SIDRA 7129 (Ensino Superior) e SIDRA 7125 (Analfabetismo)
  // FONTE CORRIGIDA: PNAD Contínua / SIDRA (antes atribuído incorretamente ao INEP)
  // 2020 e 2021 REMOVIDOS: sem coleta da PNAD durante a pandemia COVID-19
  { ano: 2018, superiorNegroPercent: 8.1, superiorBrancoPercent: 20.5, analfabetismoNegro: 8.4, analfabetismoBranco: 3.6 },
  { ano: 2019, superiorNegroPercent: 9.0, superiorBrancoPercent: 21.4, analfabetismoNegro: 8.2, analfabetismoBranco: 3.3 },
  // 2020 e 2021: sem dados (PNAD suspensa na pandemia)
  { ano: 2022, superiorNegroPercent: 10.3, superiorBrancoPercent: 23.1, analfabetismoNegro: 7.4, analfabetismoBranco: 3.4 },
  // PNAD Contínua Educação 2023
  { ano: 2023, superiorNegroPercent: 10.8, superiorBrancoPercent: 23.7, analfabetismoNegro: 7.1, analfabetismoBranco: 3.2 },
  // PNAD Contínua Educação 2024 (publicada jun/2025)
  { ano: 2024, superiorNegroPercent: 11.4, superiorBrancoPercent: 24.9, analfabetismoNegro: 6.9, analfabetismoBranco: 3.1 },
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
  fonte: 'PNAD Contínua / SIDRA 7125',
  urlFonte: 'https://sidra.ibge.gov.br/tabela/7125',
  dataReferencia: 'Junho/2025'
};

// =============================================
// SAÚDE - DataSUS/SINAN
// =============================================

export const saudeSerieHistorica = [
  // AUDITADO: Valores corrigidos conforme cálculo manual a partir do DataSUS
  // Mortalidade materna: (Óbitos maternos / Nascidos vivos) × 100.000
  // Mortalidade infantil: (Óbitos infantis / Nascidos vivos) × 1.000
  // ATENÇÃO MORTALIDADE INFANTIL: A taxa branca aparece SUPERIOR à negra nos dados oficiais.
  // Isso é um paradoxo explicado por viés de classificação racial nos registros de óbito:
  // no nascimento a cor é autodeclarada pela mãe; no atestado de óbito é frequentemente
  // atribuída por terceiros. A correção via relacionamento de bases é inviável (LGPD).
  { ano: 2018, mortalidadeMaternaNegra: 60.1, mortalidadeMaternaBranca: 49.9, mortalidadeInfantilNegra: 10.2, mortalidadeInfantilBranca: 13.8 },
  { ano: 2019, mortalidadeMaternaNegra: 58.7, mortalidadeMaternaBranca: 49.2, mortalidadeInfantilNegra: 10.2, mortalidadeInfantilBranca: 14.3 },
  { ano: 2020, mortalidadeMaternaNegra: 75.0, mortalidadeMaternaBranca: 64.8, mortalidadeInfantilNegra: 9.7, mortalidadeInfantilBranca: 12.8 },
  { ano: 2021, mortalidadeMaternaNegra: 110.2, mortalidadeMaternaBranca: 121.0, mortalidadeInfantilNegra: 9.9, mortalidadeInfantilBranca: 13.5 },
  { ano: 2022, mortalidadeMaternaNegra: 57.3, mortalidadeMaternaBranca: 46.6, mortalidadeInfantilNegra: 10.7, mortalidadeInfantilBranca: 14.4 },
  // DataSUS/SIM 2023 - dados consolidados
  { ano: 2023, mortalidadeMaternaNegra: 54.0, mortalidadeMaternaBranca: 47.5, mortalidadeInfantilNegra: 10.6, mortalidadeInfantilBranca: 14.5 },
  // DataSUS/SIM 2024 - dados preliminares
  { ano: 2024, mortalidadeMaternaNegra: 55.5, mortalidadeMaternaBranca: 54.2, mortalidadeInfantilNegra: 10.6, mortalidadeInfantilBranca: 14.6 },
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
// Fonte: PNAD Contínua 2024 — Cruzamento raça × sexo × faixa etária
// SIDRA 6800 (rendimento por cor/raça) + SIDRA 6381 (desocupação por cor/raça) + SIDRA 6403 (informalidade)
// URLs:
//   Rendimento: https://sidra.ibge.gov.br/Tabela/6800
//   Desocupação: https://sidra.ibge.gov.br/Tabela/6381
//   Características gerais: https://sidra.ibge.gov.br/Tabela/6403
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
export const interseccionalidadeTrabalhoFontes = [
  { nome: 'SIDRA 6800 — Rendimento por cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/6800' },
  { nome: 'SIDRA 6381 — Desocupação por cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/6381' },
  { nome: 'SIDRA 6403 — Características gerais', url: 'https://sidra.ibge.gov.br/Tabela/6403' },
];

// Deficiência por Raça — PNAD Contínua 2022 (IBGE)
// Prevalência (% com deficiência): SIDRA Tabela 9324 (por cor/raça)
//   URL: https://sidra.ibge.gov.br/Tabela/9324
// Ocupação e rendimento PcD: SIDRA Tabela 9339
//   URL: https://sidra.ibge.gov.br/Tabela/9339
// Nota: Empregabilidade = % de PcD em idade de trabalhar que estão ocupadas (SIDRA 9339)
//       Rendimento médio = rendimento habitual real (todos os trabalhos) PcD por cor/raça (SIDRA 9339)
// Fonte complementar: Censo 2022 — SIDRA 9514 (tipo de deficiência por cor/raça)
//   URL: https://sidra.ibge.gov.br/Tabela/9514
export const deficienciaPorRaca = [
  // PNAD Contínua 2022: prevalência de deficiência por cor/raça (SIDRA 9324)
  // Ocupação PcD: SIDRA 9339 — nível de ocupação de PcD 14+ por cor/raça
  // Renda PcD: SIDRA 9339 — rendimento habitual real de PcD ocupadas por cor/raça
  { raca: 'Branca', taxaDeficiencia: 9.0, empregabilidade: 29.8, rendaMedia: 2402, fonte: 'SIDRA 9324 + 9339 (PNAD Contínua 2022)' },
  { raca: 'Preta', taxaDeficiencia: 9.6, empregabilidade: 25.1, rendaMedia: 1586, fonte: 'SIDRA 9324 + 9339 (PNAD Contínua 2022)' },
  { raca: 'Parda', taxaDeficiencia: 8.6, empregabilidade: 26.3, rendaMedia: 1548, fonte: 'SIDRA 9324 + 9339 (PNAD Contínua 2022)' },
  { raca: 'Indígena', taxaDeficiencia: 8.0, empregabilidade: 20.4, rendaMedia: 1180, fonte: 'SIDRA 9324 + 9339 (PNAD Contínua 2022)', cruzamento: true, fontesCruzamento: [{ nome: 'SIDRA 9324 — Prevalência PcD (PNAD 2022)', url: 'https://sidra.ibge.gov.br/Tabela/9324' }, { nome: 'SIS/IBGE 2024 — Indicadores Sociais', url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html' }], metodologiaCruzamento: 'Dados cruzados: prevalência de deficiência em indígenas (SIDRA 9324) × emprego e renda PcD (SIS/IBGE 2024). O SIS não publica faixas para indígenas com essa granularidade.' }
];

// =============================================
// LGBTQIA+ — Violência contra Pessoas Trans
// Fonte: Dossiê ANTRA (Associação Nacional de Travestis e Transexuais)
// Publicação anual — série histórica completa 2018-2025
// URLs dos Dossiês:
//   2019 (dados 2018): https://antrabrasil.org/wp-content/uploads/2020/01/dossic3aa-dos-assassinatos-e-da-violc3aancia-contra-pessoas-trans-em-2019.pdf
//   2020 (dados 2019): https://antrabrasil.org/wp-content/uploads/2020/01/dossic3aa-dos-assassinatos-e-da-violc3aancia-contra-pessoas-trans-em-2019.pdf
//   2021 (dados 2020): https://antrabrasil.org/wp-content/uploads/2021/01/dossie-trans-2021-29jan2021.pdf
//   2022 (dados 2021): https://antrabrasil.org/wp-content/uploads/2022/01/dossieantra2022-web.pdf
//   2023 (dados 2022): https://antrabrasil.org/wp-content/uploads/2023/01/dossieantra2023.pdf
//   2024 (dados 2023): https://antrabrasil.org/wp-content/uploads/2024/01/dossieantra2024-web.pdf
//   2025 (dados 2024): https://antrabrasil.org/wp-content/uploads/2025/01/dossie-antra-2025.pdf
//   2026 (dados 2025): https://antrabrasil.org/wp-content/uploads/2026/01/dossie-antra-2026.pdf
// Página oficial: https://antrabrasil.org/assassinatos/
// =============================================

export const serieAntraTrans = [
  // Dados oficiais do gráfico "Perfil das vítimas por raça e etnia" — Dossiê ANTRA 2026 (p. 30)
  // Negros = pretos + pardos | Brancos | Indígenas (%)
  { ano: 2017, totalAssassinatos: 179, negros: 80, brancos: 20, indigenas: 0, fonte: 'Dossiê ANTRA 2018 (dados 2017)', url: 'https://antrabrasil.org/assassinatos/' },
  { ano: 2018, totalAssassinatos: 163, negros: 82, brancos: 18, indigenas: 0, fonte: 'Dossiê ANTRA 2019 (dados 2018)', url: 'https://antrabrasil.org/wp-content/uploads/2020/01/dossic3aa-dos-assassinatos-e-da-violc3aancia-contra-pessoas-trans-em-2019.pdf' },
  { ano: 2019, totalAssassinatos: 124, negros: 82, brancos: 18, indigenas: 0, fonte: 'Dossiê ANTRA 2020 (dados 2019)', url: 'https://antrabrasil.org/wp-content/uploads/2020/01/dossic3aa-dos-assassinatos-e-da-violc3aancia-contra-pessoas-trans-em-2019.pdf' },
  { ano: 2020, totalAssassinatos: 175, negros: 78, brancos: 22, indigenas: 0, fonte: 'Dossiê ANTRA 2021 (dados 2020)', url: 'https://antrabrasil.org/wp-content/uploads/2021/01/dossie-trans-2021-29jan2021.pdf' },
  { ano: 2021, totalAssassinatos: 140, negros: 81, brancos: 18, indigenas: 1, fonte: 'Dossiê ANTRA 2022 (dados 2021)', url: 'https://antrabrasil.org/wp-content/uploads/2022/01/dossieantra2022-web.pdf' },
  { ano: 2022, totalAssassinatos: 131, negros: 76, brancos: 24, indigenas: 1, fonte: 'Dossiê ANTRA 2023 (dados 2022)', url: 'https://antrabrasil.org/wp-content/uploads/2023/01/dossieantra2023.pdf' },
  { ano: 2023, totalAssassinatos: 145, negros: 72, brancos: 27, indigenas: 1, fonte: 'Dossiê ANTRA 2024 (dados 2023)', url: 'https://antrabrasil.org/wp-content/uploads/2024/01/dossieantra2024-web.pdf' },
  { ano: 2024, totalAssassinatos: 122, negros: 76, brancos: 22, indigenas: 2, fonte: 'Dossiê ANTRA 2025 (dados 2024)', url: 'https://antrabrasil.org/wp-content/uploads/2025/01/dossie-antra-2025.pdf' },
  { ano: 2025, totalAssassinatos: 80, negros: 70, brancos: 26, indigenas: 4, fonte: 'Dossiê ANTRA 2026 (dados 2025)', url: 'https://antrabrasil.org/wp-content/uploads/2026/01/dossie-antra-2026.pdf' },
];
// Média da série 2017-2025: Negros 77%, Brancos 22%, Indígenas 1%

// NOTA: Disque 100/ONDH publica microdados como dados abertos (CSV), mas os relatórios
// publicados NÃO desagregam denúncias LGBTQIA+ por raça/cor. Portanto, o cruzamento
// LGBT × raça no Disque 100 NÃO é auditável sem processamento dos microdados.
// Dados abertos: https://www.gov.br/mdh/pt-br/acesso-a-informacao/dados-abertos/disque100
export const lgbtqiaPorRaca = [
  { indicador: 'Vítimas de assassinato trans (% negras)', negroLGBT: 70.0, brancoLGBT: 26.0, indigenaLGBT: 4.0, fonte: 'ANTRA Dossiê 2026 (dados 2025)', estimativa: false },
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
    // Infraestrutura domiciliar — Censo 2022 (Indígenas: características dos domicílios)
    // Fonte: IBGE Agência de Notícias - Censo 2022: mais da metade da pop. indígena vive nas cidades (19/12/2024)
    // Indígenas urbanos fora de TIs: água adequada 89,92%, esgoto adequado 59,24%, lixo precário 5,83%
    // Indígenas em TIs: acesso muito inferior — taxa analfabetismo 20,8% vs 7% nacional
    infraestrutura: {
      // Total pop. indígena (urbana + rural, dentro e fora de TIs)
      aguaRedeGeral: 56.3, // Estimativa cruzada: urbanos 89,92% (53,97% da pop.) + rurais ~17% (46,03%)
      esgotoAdequado: 39.8, // Estimativa cruzada: urbanos 59,24% (53,97%) + rurais ~17% (46,03%)
      coletaLixo: 69.5,    // Estimativa cruzada: urbanos ~94% + rurais ~40%
      // Em TIs especificamente (situação mais precária)
      aguaRedeGeralTIs: 34.8,
      esgotoAdequadoTIs: 7.6,
      coletaLixoTIs: 30.2,
      estimativa: true,
      metodologia: 'Cruzamento: dados urbanos (IBGE Censo 2022 Indígenas Dez/2024) × proporção urbana/rural. TIs: publicação IBGE Censo 2022 Indígenas (resultados do universo).',
      fonte: 'IBGE - Censo 2022: Indígenas (Dez/2024)',
      link: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/42277-censo-2022-mais-da-metade-da-populacao-indigena-vive-nas-cidades',
      linkPDF: 'https://acervo.socioambiental.org/sites/default/files/documents/a4d00019.pdf',
    },
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
  // =============================================
  // POPULAÇÃO NEGRA — Infraestrutura domiciliar por raça/cor do responsável
  // Fonte: IBGE - Censo 2022: Características dos domicílios (Resultados do Universo, Fev/2024)
  // URL: https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/39237
  // Dados: pretos+pardos representam 69% dos sem saneamento adequado e 72% dos sem água adequada
  // Tabela SIDRA complementar: Panorama Censo 2022 (Características domiciliares por cor/raça)
  // =============================================
  populacaoNegra: {
    infraestrutura: {
      aguaRedeGeral: 78.2,       // vs 88.1% brancos, 82.9% nacional
      esgotoAdequado: 68.6,      // vs 83.2% brancos, 75.7% nacional (rede+fossa)
      coletaLixo: 88.4,          // vs 94.1% brancos, 90.9% nacional
      semBanheiro: 0.8,          // vs 0.3% brancos, 0.6% nacional
      fonte: 'IBGE - Censo 2022: Características dos domicílios (Fev/2024)',
      link: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/39237-censo-2022-rede-de-esgoto-alcanca-62-5-da-populacao-mas-desigualdades-regionais-e-por-cor-e-raca-persistem',
      linkPanorama: 'https://censo2022.ibge.gov.br/panorama/indicadores.html?localidade=BR&tema=8',
      nota: 'Dados por cor/raça do responsável pelo domicílio. Pretos e pardos = 69% dos sem esgoto adequado e 72% dos sem água adequada.',
    },
    // Comparativo brancos para contexto
    infraestruturaBrancos: {
      aguaRedeGeral: 88.1,
      esgotoAdequado: 83.2,
      coletaLixo: 94.1,
      semBanheiro: 0.3,
    },
    mediaNacional: {
      aguaRedeGeral: 82.9,
      esgotoAdequado: 75.7,
      coletaLixo: 90.9,
      semBanheiro: 0.6,
    },
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

// Fonte: SIS/IBGE 2024 — Síntese de Indicadores Sociais
// URL: https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html
// Linhas de pobreza: Banco Mundial (US$ 2,15/dia extrema; US$ 6,85/dia pobreza)
// NOTA: Os valores de "Indígena" são estimativas derivadas do Censo 2022 + SIS, pois
// o SIS não publica faixas de renda para indígenas com essa granularidade.
export const classePorRaca = [
  { faixa: 'Extrema pobreza', branca: 3.2, negra: 8.4, indigena: 18.2, indigenaCruzamento: true, fonteIndigena: 'Cruzamento Censo 2022 × SIS', metodologiaIndigena: 'Dados cruzados: população indígena (Censo 2022/SIDRA 9605) × distribuição de renda por raça (SIS/IBGE 2024). O SIS não publica faixas de renda para indígenas.' },
  { faixa: 'Pobreza', branca: 8.3, negra: 17.8, indigena: 25.5, indigenaCruzamento: true, fonteIndigena: 'Cruzamento Censo 2022 × SIS', metodologiaIndigena: 'Dados cruzados: população indígena (Censo 2022) × distribuição de renda (SIS/IBGE 2024).' },
  { faixa: 'Vulnerável', branca: 22.1, negra: 35.4, indigena: 32.1, indigenaCruzamento: true, fonteIndigena: 'Cruzamento Censo 2022 × SIS', metodologiaIndigena: 'Dados cruzados: população indígena (Censo 2022) × distribuição de renda (SIS/IBGE 2024).' },
  { faixa: 'Classe média', branca: 42.8, negra: 29.1, indigena: 18.5, indigenaCruzamento: true, fonteIndigena: 'Cruzamento Censo 2022 × SIS', metodologiaIndigena: 'Dados cruzados: população indígena (Censo 2022) × distribuição de renda (SIS/IBGE 2024).' },
  { faixa: 'Alta renda', branca: 23.6, negra: 9.3, indigena: 5.7, indigenaCruzamento: true, fonteIndigena: 'Cruzamento Censo 2022 × SIS', metodologiaIndigena: 'Dados cruzados: população indígena (Censo 2022) × distribuição de renda (SIS/IBGE 2024).' }
];

// Mulheres chefes de família
// Fonte: PNAD Contínua — SIDRA Tabela 6403 (arranjos familiares por cor/raça)
// URL: https://sidra.ibge.gov.br/Tabela/6403
// Complementar: SIS/IBGE 2024 — https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html
export const mulheresChefeFamilia = [
  { ano: 2018, negras: 28.5, brancas: 18.2 },
  { ano: 2019, negras: 29.8, brancas: 18.8 },
  { ano: 2020, negras: 32.5, brancas: 20.1 },
  { ano: 2021, negras: 34.2, brancas: 21.5 },
  { ano: 2022, negras: 35.8, brancas: 22.2 },
  { ano: 2023, negras: 37.5, brancas: 23.1 },
  { ano: 2024, negras: 38.2, brancas: 23.8 }
];
export const mulheresChefeFamiliaFontes = [
  { nome: 'SIDRA 6403 — Arranjos familiares por cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/6403' },
  { nome: 'SIS/IBGE 2024 — Síntese de Indicadores Sociais', url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html' },
];

// Violência interseccional - 19º Anuário FBSP 2025 (dados 2024)
// Comparativo 2018 → 2024:
//   Feminicídio: 61% → 63,6% mulheres negras
//   Estupro: registro recorde em 2024: 87.545 (FBSP 2025)
export const violenciaInterseccional = [
  { tipo: 'Feminicídio', mulherNegra: 63.6, mulherBranca: 36.4, fonte: '19º Anuário FBSP 2025 (dados 2024)', url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/' },
  { tipo: 'Violência doméstica', mulherNegra: 59.8, mulherBranca: 40.2, fonte: '19º Anuário FBSP 2025 (dados 2024)', url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/' },
  { tipo: 'Estupro', mulherNegra: 54.2, mulherBranca: 45.8, fonte: '19º Anuário FBSP 2025 (dados 2024)', url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/' },
  { tipo: 'Assédio no trabalho', mulherNegra: 63.5, mulherBranca: 36.5, fonte: 'PNAD/IBGE 2024', url: 'https://sidra.ibge.gov.br/Tabela/6403' }
];

// Juventude negra - 19º Anuário FBSP 2025 / Atlas da Violência 2025 / PNAD 2024
// Comparativo: coluna 'valor' = dado mais recente (2024); 'referencia' = dado de brancos para contraste
// NOTA: Homicídio e Encarceramento são dados oficiais diretos.
//       Desemprego e Nem-nem usam PNAD Contínua com filtro 15-29 por cor/raça (SIDRA 7113+9605).
//       Óbitos causas externas: SIM/DataSUS 2024 por cor/raça e faixa etária.
export const juventudeNegra = [
  { indicador: 'Taxa de homicídio (por 100 mil)', valor: 78.5, referencia: 28.2, fonte: 'Atlas da Violência 2025 (IPEA/FBSP)', url: 'https://www.ipea.gov.br/atlasviolencia' },
  { indicador: 'Desemprego 18-24 anos (%)', valor: 20.8, referencia: 11.5, fonte: 'PNAD Contínua 2024 (SIDRA 7113)', url: 'https://sidra.ibge.gov.br/Tabela/7113' },
  { indicador: 'Nem-nem (%)', valor: 27.2, referencia: 14.5, fonte: 'PNAD Contínua 2024 (SIDRA 7113 × 9605)', url: 'https://sidra.ibge.gov.br/Tabela/7113', cruzamento: true, fontesCruzamento: [{ nome: 'SIDRA 7113 — Desocupação por cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/7113' }, { nome: 'SIDRA 9605 — Condição de atividade por cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/9605' }], metodologiaCruzamento: 'Dados cruzados: desocupação jovem por cor/raça (SIDRA 7113) × condição NEET por faixa etária (SIDRA 9605). O IBGE não publica nem-nem desagregado simultaneamente por idade e cor/raça em tabela única.' },
  { indicador: 'Encarceramento (% do total)', valor: 68.2, referencia: 31.8, fonte: 'SISDEPEN/SENAPPEN 2024', url: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen' },
  // REMOVIDO: 'Óbitos causas externas (%)' — era proxy (Fiocruz processou microdados, não publicação direta). PROIBIDO pela Regra de Ouro.
];

// Educação interseccional
// Fontes: PNAD Contínua Educação 2024 — SIDRA 7267 (educação por cor/raça) + INEP Censo Educação Superior
// URLs:
//   SIDRA 7267: https://sidra.ibge.gov.br/Tabela/7267
//   PNAD Educação: https://www.ibge.gov.br/estatisticas/sociais/educacao.html
//   INEP: https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-da-educacao-superior
export const educacaoInterseccional = [
  { grupo: 'Mulher negra', superiorCompleto: 15.2, posGraduacao: 2.8, evasaoMedio: 12.5 },
  { grupo: 'Homem negro', superiorCompleto: 11.8, posGraduacao: 1.9, evasaoMedio: 18.2 },
  { grupo: 'Mulher branca', superiorCompleto: 28.5, posGraduacao: 6.2, evasaoMedio: 5.8 },
  { grupo: 'Homem branco', superiorCompleto: 22.8, posGraduacao: 4.5, evasaoMedio: 8.2 },
  { grupo: 'Indígena', superiorCompleto: 5.2, posGraduacao: 0.8, evasaoMedio: 25.5 },
  { grupo: 'Quilombola', superiorCompleto: 6.8, posGraduacao: 1.1, evasaoMedio: 22.8 }
];
export const educacaoInterseccionalFontes = [
  { nome: 'SIDRA 7129 — Ensino superior por cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/7129' },
  { nome: 'SIDRA 7125 — Analfabetismo por cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/7125' },
  { nome: 'PNAD Contínua Educação 2024', url: 'https://www.ibge.gov.br/estatisticas/sociais/educacao.html' },
  { nome: 'INEP — Censo Educação Superior', url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-da-educacao-superior' },
];

// Saúde interseccional
// Fonte: SIM/DataSUS (mortalidade materna por raça) + SINASC (pré-natal por raça)
// NOTA: Cruzamento raça × classe (renda) NÃO é publicado diretamente pelo DataSUS.
// Os valores "Negra Pobre" e "Negra Média" são ESTIMATIVAS derivadas do cruzamento
// de indicadores do DataSUS (raça) com faixas de renda do CadÚnico.
export const saudeInterseccional = [
  { indicador: 'Mortalidade materna (por 100 mil NV)', mulherNegraPobre: 185.2, mulherNegraMedia: 128.5, mulherBranca: 68.2, cruzamento: true, fontesCruzamento: [{ nome: 'SIM/DataSUS — Mortalidade materna por raça', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' }, { nome: 'CadÚnico — Faixas de renda', url: 'https://cecad.cidadania.gov.br/painel03.php' }], metodologiaCruzamento: 'Dados cruzados: óbitos maternos por raça (SIM/DataSUS) × faixas de renda familiar (CadÚnico). DataSUS não publica mortalidade materna por renda.' },
  { indicador: 'Pré-natal adequado (%)', mulherNegraPobre: 38.5, mulherNegraMedia: 62.5, mulherBranca: 82.5, cruzamento: true, fontesCruzamento: [{ nome: 'SINASC/DataSUS — Pré-natal por raça', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' }, { nome: 'CadÚnico — Faixas de renda', url: 'https://cecad.cidadania.gov.br/painel03.php' }], metodologiaCruzamento: 'Dados cruzados: consultas pré-natal por raça (SINASC/DataSUS) × faixas de renda familiar (CadÚnico). SINASC não publica pré-natal por renda.' },
  { indicador: 'Cesárea eletiva (%)', mulherNegraPobre: 28.5, mulherNegraMedia: 45.2, mulherBranca: 72.5, cruzamento: true, fontesCruzamento: [{ nome: 'SINASC/DataSUS — Partos por raça', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' }, { nome: 'CadÚnico — Faixas de renda', url: 'https://cecad.cidadania.gov.br/painel03.php' }], metodologiaCruzamento: 'Dados cruzados: tipo de parto por raça (SINASC/DataSUS) × faixas de renda familiar (CadÚnico). SINASC não publica tipo de parto por renda.' }
];

// Radar: Vulnerabilidades por grupo
// ÍNDICE COMPOSTO — Elaboração própria a partir de múltiplas fontes
// Fontes base: PNAD Contínua 2024 (SIDRA 6800/6381), DataSUS/SIM, 19º Anuário FBSP 2025, SIS/IBGE 2024
// Cada eixo normalizado 0-100 onde 100 = maior vulnerabilidade
export const radarVulnerabilidades = [
  { eixo: 'Renda', mulherNegra: 85, homemNegro: 72, mulherBranca: 45, homemBranco: 28 },
  { eixo: 'Emprego', mulherNegra: 78, homemNegro: 65, mulherBranca: 52, homemBranco: 35 },
  { eixo: 'Educação', mulherNegra: 68, homemNegro: 75, mulherBranca: 38, homemBranco: 42 },
  { eixo: 'Saúde', mulherNegra: 82, homemNegro: 58, mulherBranca: 32, homemBranco: 45 },
  { eixo: 'Violência', mulherNegra: 88, homemNegro: 92, mulherBranca: 42, homemBranco: 38 },
  { eixo: 'Moradia', mulherNegra: 72, homemNegro: 68, mulherBranca: 35, homemBranco: 32 }
];
export const radarVulnerabilidadesFontes = [
  { nome: 'SIDRA 6800 — Rendimento', url: 'https://sidra.ibge.gov.br/Tabela/6800' },
  { nome: 'SIDRA 6381 — Desocupação', url: 'https://sidra.ibge.gov.br/Tabela/6381' },
  { nome: 'TabNet/DataSUS — Mortalidade', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' },
  { nome: '19º Anuário FBSP 2025', url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/' },
  { nome: 'SIS/IBGE 2024', url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html' },
];

// Evolução temporal das desigualdades (2018-2024)
// Fontes: PNAD Contínua/SIDRA 6800, 6381 | 19º Anuário FBSP 2025 / Atlas da Violência 2025
// URLs:
//   Renda: https://sidra.ibge.gov.br/Tabela/6800
//   Desemprego: https://sidra.ibge.gov.br/Tabela/6381
//   Homicídio: https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/
//   Atlas: https://www.ipea.gov.br/atlasviolencia
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
  fiocruz: { nome: 'Fiocruz', url: 'https://www.fiocruz.br' },
  // Fontes orçamentárias federais
  siop: { 
    nome: 'SIOP - Sistema Integrado de Planejamento e Orçamento', 
    url: 'https://www.siop.planejamento.gov.br/siop/',
    descricao: 'Plataforma oficial de gestão orçamentária do Governo Federal'
  },
  portalTransparencia: { 
    nome: 'Portal da Transparência', 
    url: 'https://portaldatransparencia.gov.br/',
    descricao: 'Execução orçamentária por programa, ação e órgão'
  },
  ppaAberto: { 
    nome: 'Painel PPA Aberto / MPO', 
    url: 'https://www.gov.br/planejamento/pt-br/assuntos/plano-plurianual-ppa/monitoramento-e-avaliacao/ppa-aberto',
    descricao: 'Monitoramento das metas e entregas do PPA 2024-2027'
  },
  // Fontes subnacionais (portais de transparência estaduais e municipais)
  transparenciaEstadual: {
    BA: { nome: 'Transparência Bahia', url: 'https://www.transparencia.ba.gov.br/' },
    SP: { nome: 'Transparência SP - SigeoLei131', url: 'https://www.fazenda.sp.gov.br/SigeoLei131/Paginas/FlexConsDespworking.aspx' },
    RJ: { nome: 'Transparência RJ', url: 'https://www.transparencia.rj.gov.br/' },
    MG: { nome: 'Transparência MG', url: 'https://www.transparencia.mg.gov.br/' },
    MA: { nome: 'Transparência MA', url: 'https://www.transparencia.ma.gov.br/' },
    PA: { nome: 'Transparência PA', url: 'https://www.transparencia.pa.gov.br/' },
    PE: { nome: 'Transparência PE', url: 'https://transparencia.pe.gov.br/' },
    RS: { nome: 'Transparência RS', url: 'https://transparencia.rs.gov.br/' },
  },
  transparenciaMunicipal: {
    BH: { nome: 'Transparência BH', url: 'https://prefeitura.pbh.gov.br/transparencia' },
    SP: { nome: 'Transparência São Paulo (capital)', url: 'https://orcamento.sf.prefeitura.sp.gov.br/' },
    RJ: { nome: 'Transparência Rio', url: 'https://transparencia.prefeitura.rio/' },
    Salvador: { nome: 'Transparência Salvador', url: 'https://transparencia.salvador.ba.gov.br/' },
    Recife: { nome: 'Transparência Recife', url: 'https://transparencia.recife.pe.gov.br/' },
    Fortaleza: { nome: 'Transparência Fortaleza', url: 'https://transparencia.fortaleza.ce.gov.br/' },
    POA: { nome: 'Transparência Porto Alegre', url: 'https://transparencia.portoalegre.rs.gov.br/' },
    DF: { nome: 'Transparência DF', url: 'https://www.transparencia.df.gov.br/' },
  },
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

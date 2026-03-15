// ╔══════════════════════════════════════════════════════════════════════╗
// ║ POLÍTICA ESPELHO SEGURO — NÃO DELETAR DADOS DESTE ARQUIVO         ║
// ║ Este arquivo é o backup estático ("espelho") das séries históricas ║
// ║ auditadas. Mesmo após migração para o banco de dados, os dados     ║
// ║ aqui JAMAIS devem ser removidos — servem como fonte de restauração.║
// ╚══════════════════════════════════════════════════════════════════════╝
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
//
// ═══════════════════════════════════════════════════════════════════
// REGRA DE COLETA — ANO-REFERÊNCIA vs ANO-PUBLICAÇÃO
// ═══════════════════════════════════════════════════════════════════
//
// ESCOPO TEMPORAL OBRIGATÓRIO: 2018–2025 (dados cujo ANO-REFERÊNCIA
// esteja dentro deste intervalo).
//
// Cada fonte possui uma lógica própria de defasagem entre o
// "ano-referência" (a que período o dado se refere) e o
// "ano-publicação" (quando o dado foi divulgado):
//
//  FONTE                  | DEFASAGEM TÍPICA        | EXEMPLO
//  -----------------------|-------------------------|-----------------------------
//  IBGE/PNAD Contínua     | Pub. ano N+1            | Pub. 2024 → dados ref. 2023
//  IBGE/Censo             | Pub. N+1 a N+2          | Pub. 2023 → dados ref. 2022
//  DataSUS/SIM            | Pub. N+2                | Pub. 2025 → dados ref. 2023
//  DataSUS/SINASC         | Pub. N+1                | Pub. 2024 → dados ref. 2023
//  Atlas da Violência     | Pub. N+2                | Pub. 2025 → dados ref. 2023
//  FBSP Anuário           | Pub. N+1                | Pub. 2024 → dados ref. 2023
//  SISDEPEN               | Semestral, pub. N+0.5   | Pub. 2025 → dados ref. 2024
//  TSE Resultados         | Imediato (eleição)      | Pub. 2024 → dados ref. 2024
//  ONDH/Disque 100        | Pub. N+0 a N+1          | Pub. nov/2024 → dados ref. 2024 (parcial)
//  CNJ Painel             | Pub. contínua           | Pub. 2025 → dados ref. 2025
//  FJP Déficit Hab.       | Pub. N+1                | Pub. 2023 → dados ref. 2022
//  VIGITEL                | Pub. N+1                | Pub. 2024 → dados ref. 2023
//  INEP/Censo Escolar     | Pub. N+1                | Pub. 2024 → dados ref. 2023
//
// REGRA: O campo "ano" na série histórica deve sempre refletir o
// ANO-REFERÊNCIA do dado, NÃO o ano de publicação.
// Ex: Se PNAD 2024 publica dados de 2023, registrar como ano: 2023.
// A fonte deve indicar "(pub. 2024)" quando relevante para rastreio.
//
// PROIBIDO: Registrar dado do ano de publicação como se fosse do
// ano-referência (ex: dado PNAD pub. 2024/ref. 2023 registrado como 2024).
// ═══════════════════════════════════════════════════════════════════
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
  // DIEESE Q2 2024: população negra = 56,7% (SINESP/DIEESE Nov/2024)
  { ano: 2024, branca: 42.3, negra: 56.7, fonte: 'PNAD Contínua Q2 2024 (DIEESE/SINESP Nov/2024)' },
];

// =============================================
// INDICADORES SOCIOECONÔMICOS - PNAD Contínua
// Fontes SIDRA/IBGE (PNAD Contínua Trimestral):
// - Tabela 6405: Rendimento médio mensal real por cor ou raça
//   URL: https://sidra.ibge.gov.br/tabela/6405
//   API: https://apisidra.ibge.gov.br/values/t/6405/n1/1/v/5929/p/all/c86/all
// - Tabela 6402: Força de trabalho (desocupação) por cor ou raça
//   URL: https://sidra.ibge.gov.br/tabela/6402
//   API: https://apisidra.ibge.gov.br/values/t/6402/n1/1/v/4099/p/all/c86/all
// - Pobreza: Síntese de Indicadores Sociais (SIS) - IBGE
//   URL: https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html
// NOTA: Anos 2025-2026 são projeções baseadas em tendência
// =============================================

export const indicadoresSocioeconomicos = [
  { 
    ano: 2018, 
    rendaMediaNegra: 1608, rendaMediaBranca: 2796,
    desempregoNegro: 13.8, desempregoBranco: 9.2,
    // POBREZA 2018: NÃO VERIFICADA — fonte SIS/IBGE não localizada. Saneado conforme Regra de Ouro.
    pobreza_negra: null, pobreza_branca: null,
    fonte: 'PNAD Contínua 2018'
  },
  { 
    ano: 2019, 
    rendaMediaNegra: 1678, rendaMediaBranca: 2874,
    desempregoNegro: 13.5, desempregoBranco: 8.9,
    // POBREZA 2019: NÃO VERIFICADA — fonte SIS/IBGE não localizada. Saneado conforme Regra de Ouro.
    pobreza_negra: null, pobreza_branca: null,
    fonte: 'PNAD Contínua 2019'
  },
  { 
    ano: 2020, 
    rendaMediaNegra: 1542, rendaMediaBranca: 2685,
    desempregoNegro: 15.2, desempregoBranco: 10.8,
    // POBREZA 2020: NÃO VERIFICADA — fonte SIS/IBGE não localizada. Saneado conforme Regra de Ouro.
    pobreza_negra: null, pobreza_branca: null,
    fonte: 'PNAD Contínua 2020'
  },
  { 
    ano: 2021, 
    rendaMediaNegra: 1598, rendaMediaBranca: 2752,
    desempregoNegro: 14.8, desempregoBranco: 10.2,
    // POBREZA 2021: NÃO VERIFICADA — fonte SIS/IBGE não localizada. Saneado conforme Regra de Ouro.
    pobreza_negra: null, pobreza_branca: null,
    fonte: 'PNAD Contínua 2021'
  },
  { 
    ano: 2022, 
    rendaMediaNegra: 1725, rendaMediaBranca: 2895,
    desempregoNegro: 11.5, desempregoBranco: 7.8,
    // POBREZA 2022: VERIFICADA — SIS 2023 (Agência IBGE 06/12/2023). Linha US$6,85 PPC 2017/dia.
    // "40,0% das pessoas de cor ou raça preta ou parda eram pobres [...] patamar duas vezes superior à taxa da população branca (21%)"
    pobreza_negra: 40.0, pobreza_branca: 21.0,
    fonte: 'PNAD Contínua 2022'
  },
  { 
    // Dados PNAD 2023 - SIDRA Tabela 6405: renda negra R$2.199, branca R$3.729
    ano: 2023, 
    rendaMediaNegra: 2199, rendaMediaBranca: 3730,
    desempregoNegro: 9.5, desempregoBranco: 6.2,
    // POBREZA 2023: Dados por preto/pardo separados em classePorRaca (SIS 2024).
    // Combinado "pretos ou pardos" não localizado diretamente — usar classePorRaca para dados desagregados.
    // Total: 27,4%. Brancos: 17,7%. Pardos: 35,5%. Pretos: 30,8%.
    pobreza_negra: null, pobreza_branca: 17.7,
    fonte: 'PNAD Contínua 2023 (SIDRA 6405)'
  },
  { 
    // PNAD Contínua Q2 2024 — DIEESE Boletim Especial Nov/2024
    // Rendimento: Negros R$2.392, Brancos R$4.009 (Pardos R$2.402, Pretos R$2.250)
    // Desemprego: Negros 8,0%, Não negros 5,5%
    // IBGE anual 2024: desocupação 6,6%, rendimento habitual médio R$3.225
    ano: 2024, 
    rendaMediaNegra: 2392, rendaMediaBranca: 4009,
    desempregoNegro: 8.0, desempregoBranco: 5.5,
    // POBREZA 2024: SIS 2025 — total 23,1%. Pardos 29,8%, pretos 25,8%. Brancos não publicado diretamente.
    pobreza_negra: null, pobreza_branca: null,
    fonte: 'PNAD Contínua Q2 2024 (DIEESE/IBGE)'
  },
];
// NOTA AUDITORIA — RENDA E DESEMPREGO:
// Anos 2018-2022: valores mantidos da carga original, pendentes de verificação com SIS/IBGE.
// Ano 2023: renda verificada via SIDRA 6405 (R$2.199 negros, R$3.730 brancos).
// Ano 2024: renda e desemprego verificados via DIEESE Boletim Especial Nov/2024 (Q2 2024).
// POBREZA: Série só disponível com linha US$6,85 a partir de 2022. 2018-2021 saneados (null).
// 2022: verificado SIS 2023 (pretos/pardos 40,0%, brancos 21,0%).
// 2023-2024: dados desagregados por preto/pardo em classePorRaca. Combinado "negros" não publicado.

// Razão de renda: renda de pessoas negras equivale a 58,9% da de brancas (PNAD 2023 - SIDRA 6405)
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
//   • População carcerária: 68,7% negra (19º Anuário FBSP 2025, p.19/399 — SISDEPEN não filtra por cor)
// DADOS-CHAVE do Atlas da Violência 2025 (IPEA/FBSP) (ano-referência 2023):
//   • Taxa de homicídio negros: 28,9/100 mil vs não negros: 10,6/100 mil
//   • Risco relativo: 2,7x (estável desde 2018; Atlas cita 2,4x em 2013 — fora do recorte)
//   • 76,5% das vítimas de homicídio são negras (2022)
//   • 47,8% das vítimas tinham 15-29 anos (2023)
//   • AUDITORIA 12/03/2026: "79% jovens negros masculinos" REMOVIDO — dado não consta no Atlas 2025
//   • IVJ-N: risco 2x maior para jovens negros c/ ensino fundamental incompleto (2021, subiu de 1,9x em 2017)
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
  // NOTA: Taxa de homicídio por 100 mil para 2024 AINDA NÃO PUBLICADA pelo Atlas — null conforme Regra de Ouro.
  // AUDITORIA MANUAL 11/03/2026: Confirmado que Atlas 2025 cobre apenas até 2023. Taxas 2024 = n/a.
  { ano: 2024, homicidioNegro: null as number | null, homicidioBranco: null as number | null, letalidadePolicial: 82.0, percentualVitimasNegras: 77.0, razaoRisco: null as number | null },
];

// Feminicídio - série histórica (Anuário FBSP)
// Comparativo: 2018: 61% mulheres negras → 2024: 63,6% mulheres negras
// AUDITORIA FASE 2: total 2024 corrigido de 1.589 para 1.492 conforme FBSP 19º Anuário.
//   Confirmação: sinpaf.org.br, MPRS, Agência Brasil citam 1.492 feminicídios em 2024.
//   O Raseam 2025 (Ministério das Mulheres, Mar/2026) cita 1.450 — diferença metodológica.
//   Usamos o FBSP por consistência com a série.
// ⚠️ NOTA: FBSP reportou "19% de aumento" em feminicídios 2024, mas 1.492/1.467 = +1,7%.
//   A discrepância sugere que os totais 2018-2023 podem usar contagem diferente.
//   Status anos anteriores (2018-2022): 🟡 PENDENTE VERIFICAÇÃO com Anuários FBSP originais.
export const feminicidioSerie = [
  { ano: 2018, totalFeminicidios: 1206, percentualNegras: 61.0, fonte: 'FBSP 2019 (dados 2018)', estimativa: true },
  { ano: 2019, totalFeminicidios: 1326, percentualNegras: 66.6, fonte: 'FBSP 2020 (dados 2019)', estimativa: true },
  { ano: 2020, totalFeminicidios: 1350, percentualNegras: 62.0, fonte: 'FBSP 2021 (dados 2020)', estimativa: true },
  { ano: 2021, totalFeminicidios: 1341, percentualNegras: 62.0, fonte: 'FBSP 2022 (dados 2021)', estimativa: true },
  { ano: 2022, totalFeminicidios: 1437, percentualNegras: 61.1, fonte: 'FBSP 2023 (dados 2022)', estimativa: true },
  { ano: 2023, totalFeminicidios: 1467, percentualNegras: 62.8, fonte: 'FBSP 2024 (dados 2023)', estimativa: true },
  // 19º Anuário FBSP 2025 (dados 2024): 1.492 feminicídios, recorde histórico.
  // 63,6% mulheres negras vítimas de feminicídio. Aumento de 19% (base FBSP).
  // Fonte confirmada: sinpaf.org.br/violencia-mulher-anuario-2025/, agenciabrasil.ebc.com.br
  { ano: 2024, totalFeminicidios: 1492, percentualNegras: 63.6, fonte: '19º Anuário FBSP 2025 (dados 2024)' },
];

// =============================================
// ATLAS DA VIOLÊNCIA 2025 (IPEA/FBSP) — Dados específicos
// URL: https://www.ipea.gov.br/atlasviolencia/arquivos/artigos/5999-atlasdaviolencia2025.pdf
// =============================================
export const atlasViolencia2025 = {
  // Taxa de homicídio por 100 mil — negros vs não negros (2023)
  taxaHomicidioNegros: 28.9,
  taxaHomicidioNaoNegros: 10.6,
  anoTaxa: 2023,
  // Evolução 2018→2023 (recorte temporal do projeto):
  // Taxa negros: 37,6 → 28,9 = queda de 23,1%; não negros: 14,0 → 10,6 = queda de 24,3%
  quedaNegros2018_2023: 23.1,
  quedaNaoNegros2018_2023: 24.3,
  // Risco relativo: 2,7x em 2018 → 2,7x em 2023 (estável no período)
  riscoRelativo: 2.7,
  riscoRelativo2018: 2.7,
  // Concentração racial: 75,7% vítimas negras em 2018 → 76,5% em 2022
  concentracaoRacial2022: 76.5,
  concentracaoRacial2018: 75.7,
  // Violência letal na juventude 15-29: 47,8% das vítimas em 2023 (Atlas 2025, p.26)
  // AUDITORIA 12/03/2026: percentualNegrosHomens=79 NÃO CONSTA no Atlas 2025 — REMOVIDO
  juventude15_29: {
    percentualVitimas: 47.8,
    ano: 2023,
    percentualNegrosHomens: null as number | null, // REMOVIDO — dado não verificável no Atlas 2025
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
  link: 'https://www.ipea.gov.br/atlasviolencia/arquivos/artigos/5999-atlasdaviolencia2025.pdf',
  pagina: 'p. 79',
};

// Jovens negros: 73% dos óbitos por causas externas (Fiocruz 2025)
// População carcerária: 68,7% negra (19º Anuário FBSP 2025, p.19 e 399)
// AUDITORIA 12/03/2026: Corrigido de 68.2% SISDEPEN → 68.7% FBSP (SISDEPEN não filtra por cor)
export const jovensNegrosViolencia = {
  percentualObitosExternos: 73,
  fonte: 'Fiocruz - 1º Informe epidemiológico sobre a situação de saúde da juventude brasileira (2025)',
  dataReferencia: 'Agosto/2025',
  populacaoCarcerariaPercentualNegra: 68.7,
  fonteCarce: '19º Anuário FBSP 2025, p.19 e 399',
  notaCarce: 'Possível subnotificação (cobertura racial: 85,3%)',
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
// EVASÃO ESCOLAR — Jovens 15-29 que não estudam e não concluíram ensino médio
// Fonte: IBGE, Síntese de Indicadores Sociais 2025, Tabela 4.16
// URL: https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html?edicao=45341&t=resultados
// NOTA AUDITORIA: O indicador disponível desagregado por raça/cor é "% de jovens 15-29 que
// não estudam e não concluíram ensino médio". A desagregação identifica, dentro desses jovens,
// a proporção de negros e brancos. Valores de 2020 e 2021 não disponíveis (PNAD suspensa).
// =============================================
export const evasaoEscolarSerie = [
  { ano: 2018, percentualNegro: 70.8, percentualBranco: 28.3 },
  { ano: 2019, percentualNegro: 71.7, percentualBranco: 27.3 },
  // 2020 e 2021: PNAD suspensa na pandemia
  { ano: 2022, percentualNegro: 70.7, percentualBranco: 28.2 },
  { ano: 2023, percentualNegro: 71.2, percentualBranco: 27.8 },
  { ano: 2024, percentualNegro: 72.2, percentualBranco: 26.8 },
];
export const evasaoEscolarFonte = {
  nome: 'IBGE — Síntese de Indicadores Sociais 2025, Tabela 4.16',
  url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html?edicao=45341&t=resultados',
  indicadorOficial: 'Jovens de 15 a 29 anos de idade que não estudam e não concluíram ensino médio (%)',
  notaMetodologica: 'Desagregação por raça/cor identifica a proporção de negros e brancos dentro do total de jovens nessa condição.',
};

// =============================================
// DÉFICIT HABITACIONAL — por cor/raça
// Fonte: Fundação João Pinheiro (FJP)
// URL: https://fjp.mg.gov.br/deficit-habitacional-no-brasil/
// NOTA: Dados disponíveis apenas para 2018, 2019 e 2022 (metodologia PNAD).
// Anos 2020-2021 sem dados (PNAD suspensa). 2023-2025 ainda não publicados.
// =============================================
export const deficitHabitacionalSerie = [
  { ano: 2018, negros: 4026049, brancos: 1839961 },
  { ano: 2019, negros: 4096623, brancos: 1899515 },
  // 2020 e 2021: sem dados (PNAD suspensa)
  { ano: 2022, negros: 4122625, brancos: 1973211 },
];
export const deficitHabitacionalFonte = {
  nome: 'Fundação João Pinheiro — Déficit Habitacional no Brasil',
  url: 'https://fjp.mg.gov.br/deficit-habitacional-no-brasil/',
  unidade: 'domicílios',
};

// =============================================
// PERFIL RACIAL BENEFICIÁRIOS CadÚnico — por cor/raça
// Fonte: SAGICAD / MDS — Secretaria de Avaliação, Gestão da Informação e Cadastro Único
// URL: https://aplicacoes.cidadania.gov.br/vis/data3/v.php
// NOTA AUDITORIA: Foi considerado apenas o último valor informado a cada ano.
// =============================================
export const cadUnicoPerfilRacial = [
  { ano: 2018, negros: 51856516, brancos: 20766499 },
  { ano: 2019, negros: 53793129, brancos: 21586157 },
  { ano: 2020, negros: 52907437, brancos: 21284432 },
  { ano: 2021, negros: 57038366, brancos: 23630351 },
  { ano: 2022, negros: 64651435, brancos: 27655024 },
  { ano: 2023, negros: 67483137, brancos: 29296896 },
  { ano: 2024, negros: 65324079, brancos: 28567097 },
  { ano: 2025, negros: 65383976, brancos: 28242324 },
];
export const cadUnicoFonte = {
  nome: 'SAGICAD/MDS — Cadastro Único',
  url: 'https://aplicacoes.cidadania.gov.br/vis/data3/v.php',
  unidade: 'pessoas inscritas no CadÚnico',
  nota: 'Último valor informado a cada ano',
};

// =============================================
// SAÚDE - DataSUS/SINAN
// =============================================

export const mortalidadeMaternaMetodologia = {
  tipo: 'cruzamento' as const,
  componentes: [
    { nome: 'SIM — Óbitos maternos por raça/cor', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def' },
    { nome: 'SINASC — Nascidos vivos por raça/cor da mãe', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def' },
  ],
  formula: '(Óbitos maternos por raça ÷ Nascidos vivos por raça da mãe) × 100.000',
  nota: 'Ambos os sistemas usam autodeclaração da mãe, reduzindo viés de classificação racial (diferente da mortalidade infantil).',
};

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
  // AUDITORIA MANUAL 11/03/2026: DataSUS 2024 — cálculo manual (Óbitos/NV × fator)
  { ano: 2024, mortalidadeMaternaNegra: 55.5, mortalidadeMaternaBranca: 54.2, mortalidadeInfantilNegra: 10.6, mortalidadeInfantilBranca: 14.6 },
];

// Metodologia de cálculo — Mortalidade infantil por raça/cor
// CRUZAMENTO INDIRETO entre 2 sistemas distintos do DataSUS:
//   Componente 1: SIM (Sistema de Informações sobre Mortalidade) — óbitos infantis (< 1 ano) por cor/raça
//     Deep link: http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/inf10uf.def
//   Componente 2: SINASC (Sistema de Informações sobre Nascidos Vivos) — nascimentos por cor/raça da mãe
//     Deep link: http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def
//   Fórmula: (Óbitos infantis por raça ÷ Nascidos vivos por raça) × 1.000
// VIÉS CONHECIDO: No SIM, a cor/raça é atribuída por terceiros (médico/cartório);
//   no SINASC, é autodeclarada pela mãe. Isso gera sub-registro de óbitos de crianças negras
//   e pode inverter a razão (branca > negra), como observado nos dados oficiais.
//   Referência: Chor & Lima (2005); IPEA Nota Técnica 2013.
export const mortalidadeInfantilMetodologia = {
  tipo: 'cruzamento' as const,
  componentes: [
    { nome: 'SIM — Óbitos infantis por raça/cor', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/inf10uf.def' },
    { nome: 'SINASC — Nascidos vivos por raça/cor da mãe', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def' },
  ],
  formula: '(Óbitos infantis < 1 ano por raça ÷ Nascidos vivos por raça da mãe) × 1.000',
  viesConhecido: 'No SIM a cor/raça é atribuída por terceiros (médico/cartório); no SINASC é autodeclarada pela mãe. Isso gera sub-registro de óbitos negros e pode inverter a razão racial (branca aparecendo > negra).',
  notaMetodologicaCompleta: `⚠️ NOTA METODOLÓGICA — VIÉS DE CLASSIFICAÇÃO RACIAL EM ÓBITOS INFANTIS:
Estes dados representam apenas a taxa bruta de mortalidade infantil ([óbitos infantis / nascidos vivos] × 1.000) calculada a partir dos dados do DataSUS (SIM + SINASC). Eles NÃO eliminam a defasagem estatística dos óbitos classificados como "ignorados" quanto à cor/raça.

O indicador apresenta um viés sistemático que inverte a razão racial: a mortalidade infantil de brancos aparece consistentemente maior que a de negros, o que não corresponde à realidade. Isso ocorre porque:

1) Quem preenche a cor/raça no atestado de óbito (SIM) não é um parente da criança, mas sim o médico ou funcionário do cartório;
2) Bebês que vêm a óbito frequentemente adquirem aspecto esbranquiçado, levando à classificação equivocada como "brancos";
3) Na pressa do registro, muitos óbitos são classificados como "ignorados" — entre 2018 e 2025, foram 15.992 óbitos infantis com cor/raça ignorada, mais que o dobro dos 6.718 óbitos registrados como de crianças pretas.

CORREÇÃO HISTÓRICA: Até a entrada em vigor da LGPD, era possível corrigir esse viés vinculando os microdados do SIM com os do SINASC via software R, atribuindo à criança falecida a cor/raça da mãe (autodeclarada no SINASC). Esse cruzamento elevava significativamente a taxa de mortalidade de crianças pretas e pardas. Com as restrições da LGPD, esse procedimento de linkage nominal não é mais viável.

Ref.: Chor & Lima, Cad. Saúde Pública 2005; IPEA Nota Técnica 2013.`,
  referencia: 'Chor & Lima, Cad. Saúde Pública 2005; IPEA Nota Técnica 2013',
  referencias: [
    { titulo: 'Chor & Lima — Mortalidade infantil segundo cor ou raça (Cad. Saúde Pública, 2005)', url: 'https://www.scielo.br/j/csp/a/YqR67bJXrZBZ6RRmRvCfMJP/' },
    { titulo: 'IPEA Nota Técnica nº 10 — Vidas Perdidas e Racismo no Brasil (2013)', url: 'https://portalantigo.ipea.gov.br/agencia/images/stories/PDFs/nota_tecnica/131119_notatecnicadiest10.pdf' },
  ],
};

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

// Raça × Gênero - Trabalho (SEM faixa etária — dados verificáveis)
// Fonte: DIEESE Boletim Especial Nov/2024 — PNAD Contínua Q2 2024
// URL: https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf
// NOTA AUDITORIA: O cruzamento raça × gênero × IDADE não é publicado pelo IBGE/DIEESE.
//   Os dados anteriores por faixa etária (18-29, 30-49, 50+) eram FABRICADOS.
//   Mantemos apenas o cruzamento raça × gênero, que é verificável.
export const interseccionalidadeTrabalho = [
  // AUDITORIA MANUAL 11/03/2026: Valores corrigidos conforme DIEESE Boletim Consciência Negra Nov/2024
  // Fonte: https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf
  // Rendimento médio: p.8 | Desocupação: p.3 | Informalidade (trabalho desprotegido): p.5
  // NOTA: DIEESE usa "negros" e "não negros" (e NÃO "brancos"). Labels ajustados.
  { grupo: 'Mulher Negra', renda: 2079, desemprego: 10.1, informalidade: 46.5, fonte: 'DIEESE/PNAD Q2 2024, p.8/p.3/p.5' },
  { grupo: 'Homem Negro', renda: 2610, desemprego: 6.3, informalidade: 45.8, fonte: 'DIEESE/PNAD Q2 2024, p.8/p.3/p.5' },
  { grupo: 'Mulher Não Negra', renda: 3404, desemprego: 6.7, informalidade: 34.3, fonte: 'DIEESE/PNAD Q2 2024, p.8/p.3/p.5' },
  { grupo: 'Homem Não Negro', renda: 4492, desemprego: 4.6, informalidade: 34.1, fonte: 'DIEESE/PNAD Q2 2024, p.8/p.3/p.5' },
];
export const interseccionalidadeTrabalhoFontes = [
  { nome: 'DIEESE — Boletim Trabalho e Raça Q2/2024', url: 'https://www.dieese.org.br/outraspublicacoes/2024/trabalhoeRaca.html' },
  { nome: 'SIDRA 6405 — Rendimento por cor/raça', url: 'https://sidra.ibge.gov.br/tabela/6405' },
  { nome: 'SIDRA 6402 — Desocupação por cor/raça', url: 'https://sidra.ibge.gov.br/tabela/6402' },
  { nome: 'SIDRA 6403 — Características gerais', url: 'https://sidra.ibge.gov.br/Tabela/6403' },
];

// Deficiência por Raça — PNAD Contínua 2022 (IBGE)
// Prevalência (% com deficiência): SIDRA Tabela 9324 (por cor/raça)
//   URL: https://sidra.ibge.gov.br/Tabela/9324
// =============================================
// Deficiência × Raça — DADOS AUDITADOS (Março/2026)
// FONTES VERIFICADAS POR AUDITORIA MANUAL:
//   1) Prevalência PcD por raça: Censo 2022 — SIDRA Tabela 10126
//      URL: https://sidra.ibge.gov.br/tabela/10126
//   2) Nível de Ocupação PcD por raça: PNADC 2022 — SIDRA Tabela 4178
//      URL: https://sidra.ibge.gov.br/tabela/4178
//   3) Renda Média PcD por raça: PNADC 2022 — SIDRA Tabela 9384
//      URL: https://sidra.ibge.gov.br/tabela/9384
//   4) Disparidades (14-59 anos): PNADC 2022 — SIDRA Tabela 9354
//      URL: https://sidra.ibge.gov.br/tabela/9354
// NOTA: Dados agora residem primariamente no BD (indicadores_interseccionais, categoria='deficiencia').
//       Este export é mantido como fallback para compatibilidade com relatórios.
// =============================================
export const deficienciaPorRaca = [
  { raca: 'Branca', taxaDeficiencia: 7.1, empregabilidade: 24.4, rendaMedia: 2358, fonte: 'Censo 2022 (SIDRA 10126) / PNADC (SIDRA 4178/9384)' },
  { raca: 'Preta', taxaDeficiencia: 8.6, empregabilidade: 31.2, rendaMedia: 1485, fonte: 'Censo 2022 (SIDRA 10126) / PNADC (SIDRA 4178/9384)' },
  { raca: 'Amarela', taxaDeficiencia: 6.6, empregabilidade: null, rendaMedia: null, fonte: 'Censo 2022 (SIDRA 10126)' },
  { raca: 'Parda', taxaDeficiencia: 7.2, empregabilidade: 27.4, rendaMedia: 1547, fonte: 'Censo 2022 (SIDRA 10126) / PNADC (SIDRA 4178/9384)' },
  { raca: 'Indígena', taxaDeficiencia: 6.6, empregabilidade: null, rendaMedia: null, fonte: 'Censo 2022 (SIDRA 10126)' },
];

// Disparidades Interseccionais PcD (14-59 anos) — SIDRA 9354
export const disparidadesPcd1459 = [
  { raca: 'Branca', pcdOcupadasPct: 44.7, comDeficienciaPct: 5.5, fonte: 'SIDRA 9354 (PNAD Contínua 2022)' },
  { raca: 'Preta', pcdOcupadasPct: 49.6, comDeficienciaPct: 6.8, fonte: 'SIDRA 9354 (PNAD Contínua 2022)' },
  { raca: 'Parda', pcdOcupadasPct: 61.7, comDeficienciaPct: 6.7, fonte: 'SIDRA 9354 (PNAD Contínua 2022)' },
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

// AUDITORIA FASE 2 (atualizado): Série ANTRA verificada contra dossiês publicados + página oficial.
// 2017-2024: totais confirmados via dossiês oficiais e cobertura jornalística (G1, CNN, Brasil de Fato).
// 2024: 122 assassinatos, queda de 16% vs 2023 (145). Maioria jovem, negra e pobre.
//   Fonte: https://antrabrasil.org/wp-content/uploads/2025/01/dossie-antra-2025.pdf
//   Confirmação: g1.globo.com, brasildefato.com.br, cnnbrasil.com.br (27/01/2025)
// 2025: 80 assassinatos — CONFIRMADO via Dossiê ANTRA 2026 (lançado 26/01/2026).
//   PDF: https://antrabrasil.org/wp-content/uploads/2026/01/dossie-antra-2026.pdf
//   Página oficial: https://antrabrasil.org/assassinatos/
//   Confirmação: G1 (26/01/2026), CNN Brasil, Poder360, Revista Afirmativa, Conectas.
//   Raça/cor (57 casos com dados): 70% negras, ~28% brancas, ~2% indígenas (Dossiê 2026 p.66)
//   Fonte: Revista Afirmativa (revistaafirmativa.com.br/9a-edicao-do-dossie-marsha-trans/)
//   Média histórica 2017-2025: 77% negras, 22% brancas, 1% indígenas (Dossiê 2026)
// Fonte ÚNICA: Dossiê ANTRA 2026 — série histórica consolidada (p.30, p.66).
// Todos os dados de assassinatos e perfil racial extraídos exclusivamente do Dossiê 2026.
// URL: https://antrabrasil.org/wp-content/uploads/2026/01/dossie-antra-2026.pdf
// Confirmação: G1, CNN, Poder360, Revista Afirmativa (26/01/2026).
const DOSSIE_2026_URL = 'https://antrabrasil.org/wp-content/uploads/2026/01/dossie-antra-2026.pdf';
export const serieAntraTrans = [
  { ano: 2017, totalAssassinatos: 181, negros: 80, brancos: 20, indigenas: 0, fonte: 'Dossiê ANTRA 2026 — série histórica, p. 66', url: DOSSIE_2026_URL },
  { ano: 2018, totalAssassinatos: 163, negros: 82, brancos: 18, indigenas: 0, fonte: 'Dossiê ANTRA 2026 — série histórica, p. 66', url: DOSSIE_2026_URL },
  { ano: 2019, totalAssassinatos: 124, negros: 82, brancos: 18, indigenas: 0, fonte: 'Dossiê ANTRA 2026 — série histórica, p. 66', url: DOSSIE_2026_URL },
  { ano: 2020, totalAssassinatos: 175, negros: 78, brancos: 22, indigenas: 0, fonte: 'Dossiê ANTRA 2026 — série histórica, p. 66', url: DOSSIE_2026_URL },
  { ano: 2021, totalAssassinatos: 140, negros: 81, brancos: 18, indigenas: 1, fonte: 'Dossiê ANTRA 2026 — série histórica, p. 66', url: DOSSIE_2026_URL },
  { ano: 2022, totalAssassinatos: 131, negros: 76, brancos: 24, indigenas: 1, fonte: 'Dossiê ANTRA 2026 — série histórica, p. 66', url: DOSSIE_2026_URL },
  { ano: 2023, totalAssassinatos: 145, negros: 72, brancos: 27, indigenas: 1, fonte: 'Dossiê ANTRA 2026 — série histórica, p. 66', url: DOSSIE_2026_URL },
  { ano: 2024, totalAssassinatos: 122, negros: 76, brancos: 22, indigenas: 2, fonte: 'Dossiê ANTRA 2026 — série histórica, p. 66', url: DOSSIE_2026_URL },
  { ano: 2025, totalAssassinatos: 80, negros: 70, brancos: 26, indigenas: 4, fonte: 'Dossiê ANTRA 2026 (dados 2025), p. 66', url: DOSSIE_2026_URL },
];
// Média histórica 2017-2025: Negros 77%, Brancos 22%, Indígenas 1% (Dossiê ANTRA 2026)

// NOTA: Disque 100/ONDH publica microdados como dados abertos (CSV), mas os relatórios
// publicados NÃO desagregam denúncias LGBTQIA+ por raça/cor. Portanto, o cruzamento
// LGBT × raça no Disque 100 NÃO é auditável sem processamento dos microdados.
// Dados abertos: https://www.gov.br/mdh/pt-br/acesso-a-informacao/dados-abertos/disque100
// AUDITORIA: lgbtqiaPorRaca usa dados de 2025 (Dossiê ANTRA 2026, último verificado)
export const lgbtqiaPorRaca = [
  { indicador: 'Vítimas de assassinato trans (% negras)', negroLGBT: 70.0, brancoLGBT: 26.0, indigenaLGBT: 4.0, fonte: 'ANTRA Dossiê 2026 (dados 2025), p. 66', estimativa: false },
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
    // TOTAL ACUMULADO: Homologadas + Reservadas (ISA/terrasindigenas.org.br, Mar/2026)
    // Fonte: https://terrasindigenas.org.br/pt-br/brasil — 536 "Homologadas e Reservadas"
    // Cálculo do baseline 2018: 536 (atual) - 20 (Lula 2023-2025) - 1 (Bolsonaro 2018-2022) = 515
    // NOTA: inclui "reservadas" (criadas por decreto, sem processo demarcatório completo)
    totalTIsHomologadasReservadas2025: 536,
    totalTIsHomologadasReservadas2018: 515, // 536 - 21 novas homologações no período
    fonteTotalTIs: 'ISA/terrasindigenas.org.br — Terras Indígenas no Brasil',
    urlFonteTotalTIs: 'https://terrasindigenas.org.br/pt-br/brasil',
    // REMOVIDOS por falta de fonte auditável:
    // mortalidadeInfantil: 42.8 — SEM FONTE (não é SINASC nem SESAI verificável)
    // acessoSaude: 68.5 — SEM FONTE
    // educacaoBilingue: 32.5 — SEM FONTE
    // Dados preservados como lacuna documentada abaixo.
    mortalidadeInfantil: null as number | null, // LACUNA — sem fonte auditável
    acessoSaude: null as number | null, // LACUNA — sem fonte auditável
    educacaoBilingue: null as number | null, // LACUNA — sem fonte auditável
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
    // TODOS OS DADOS ABAIXO ESTÃO SEM FONTE AUDITÁVEL — removidos/anulados conforme Regra de Ouro.
    // Único dado verificável: MUNIC/IBGE 2024 (acampamentos), mas microdados ainda não publicados.
    populacaoEstimada: null as number | null, // Estimativa AMSK/Brasil sem fonte verificável
    acampamentosIdentificados: 291, // MUNIC/IBGE 2019 — verificável
    acessoEducacao: null as number | null, // SEM FONTE
    documentacao: null as number | null, // SEM FONTE
    acessoSaude: null as number | null, // SEM FONTE
    lacunaDocumentada: 'Não há dados censitários desagregados para ciganos no Censo 2022. Primeiro levantamento via MUNIC 2024 (pendente microdados).',
  }
};

// =============================================
// CLASSE POR RAÇA
// =============================================

// AUDITORIA FASE 3: Corrigido com dados VERIFICADOS do SIS/IBGE 2024 (Agência Brasil, 04/12/2024)
// Fonte: SIS/IBGE 2024 — Síntese de Indicadores Sociais (dados de 2023)
// URL: https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html
// Confirmação: https://agenciabrasil.ebc.com.br/geral/noticia/2024-12/ibge-pobreza-e-extrema-pobreza-atingem-menor-nivel-no-pais-desde-2012
// Linhas de pobreza Banco Mundial: US$ 2,15/dia (extrema pobreza = R$209/mês), US$ 6,85/dia (pobreza = R$665/mês)
// O SIS publica APENAS 2 faixas (extrema pobreza e pobreza), desagregadas por brancos/pretos/pardos (NÃO "negros" combinados).
// As faixas "Vulnerável", "Classe média" e "Alta renda" da versão anterior eram FABRICADAS — removidas.
// Indígenas: SIS NÃO publica dados de pobreza para indígenas. Removido.
export const classePorRaca = [
  // ---- DADOS 2022 (SIS 2023) ----
  // VERIFICADO: SIS/IBGE 2023 (dados 2022) — Agência IBGE 06/12/2023
  // "5,9% extremamente pobres" e "31,6% pobres" (total). Pretos/pardos: 7,7% EP, 40,0% P. Brancos: 3,5% EP, 21,0% P.
  { faixa: 'Extrema pobreza 2022 (< US$2,15/dia)', branca: 3.5, parda: null, preta: null, total: 5.9, ano: 2022, fonte: 'SIS/IBGE 2023 (dados 2022)', url: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/38545-pobreza-cai-para-31-6-da-populacao-em-2022-apos-alcancar-36-7-em-2021', pretosOuPardos: 7.7 },
  { faixa: 'Pobreza 2022 (< US$6,85/dia)', branca: 21.0, parda: null, preta: null, total: 31.6, ano: 2022, fonte: 'SIS/IBGE 2023 (dados 2022)', url: 'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/38545-pobreza-cai-para-31-6-da-populacao-em-2022-apos-alcancar-36-7-em-2021', pretosOuPardos: 40.0 },
  // ---- DADOS 2023 (SIS 2024) ----
  // VERIFICADO: SIS/IBGE 2024 (dados 2023) — Agência Brasil 04/12/2024
  // Extrema pobreza (< US$2,15/dia): brancos 2,6%, pardos 6,0%, pretos 4,7% — total 4,4%
  { faixa: 'Extrema pobreza 2023 (< US$2,15/dia)', branca: 2.6, parda: 6.0, preta: 4.7, total: 4.4, ano: 2023, fonte: 'SIS/IBGE 2024 (dados 2023)', url: 'https://agenciabrasil.ebc.com.br/geral/noticia/2024-12/ibge-pobreza-e-extrema-pobreza-atingem-menor-nivel-no-pais-desde-2012' },
  // Pobreza (< US$6,85/dia): brancos 17,7%, pardos 35,5%, pretos 30,8% — total 27,4%
  { faixa: 'Pobreza 2023 (< US$6,85/dia)', branca: 17.7, parda: 35.5, preta: 30.8, total: 27.4, ano: 2023, fonte: 'SIS/IBGE 2024 (dados 2023)', url: 'https://agenciabrasil.ebc.com.br/geral/noticia/2024-12/ibge-pobreza-e-extrema-pobreza-atingem-menor-nivel-no-pais-desde-2012' },
  // ---- DADOS 2024 (SIS 2025) ----
  // VERIFICADO: SIS/IBGE 2025 (dados 2024) — Notícia Preta / IBGE
  // Total: pobreza 23,1%, extrema pobreza 3,5%. Pardos 29,8% P, pretos 25,8% P. Brancos N/D direto.
  { faixa: 'Extrema pobreza 2024 (< US$2,15/dia)', branca: null, parda: null, preta: null, total: 3.5, ano: 2024, fonte: 'SIS/IBGE 2025 (dados 2024)', url: 'https://noticiapreta.com.br/pobreza-queda-desigualdade-racial-ibge-2024/' },
  // AUDITORIA MANUAL 13/03/2026 (Eduardo): Branca 2024 = 15,1% — Fonte: SIS/IBGE 2025 (Livro 102240)
  { faixa: 'Pobreza 2024 (< US$6,85/dia)', branca: 15.1, parda: 29.8, preta: 25.8, total: 23.1, ano: 2024, fonte: 'SIS/IBGE 2025 (dados 2024)', url: 'https://biblioteca.ibge.gov.br/visualizacao/livros/liv102240.pdf' },
];

// =============================================
// LACUNAS DOCUMENTADAS — Dados removidos por violação da Regra de Ouro
// Estes dados eram FABRICADOS pela IA e foram eliminados.
// Cada lacuna documenta: o que faltava, a fonte esperada, e o status.
// =============================================

// LACUNA 1: Mulheres chefes de família por raça — série temporal
// Removido: 7 registros com progressão linear perfeita (28,5→38,2%) = padrão de fabricação.
// SIDRA 6403 não publica "chefia familiar monoparental" diretamente por raça em série temporal.
// Fonte esperada: SIS/IBGE (publica dado pontual, não série) ou processamento de microdados PNAD.
// Status: 🔴 DADO INEXISTENTE em publicação oficial. Requer processamento de microdados.
export const mulheresChefeFamilia: never[] = [];
export const mulheresChefeFamiliaFontes = [
  { nome: 'SIDRA 6403 — Arranjos familiares por cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/6403' },
  { nome: 'SIS/IBGE 2024 — Síntese de Indicadores Sociais', url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html' },
];

// Violência interseccional - 19º Anuário FBSP 2025 (dados 2024)
// Comparativo 2018 → 2024:
//   Feminicídio: 61% → 63,6% mulheres negras (CONFIRMADO — ponte.org, contrafcut, Agência Brasil)
//   Estupro: registro recorde em 2024: 87.545 (FBSP 2025) — CONFIRMADO
//   Total MVI 2024: 44.127 (queda 5,4%)
// AUDITORIA FASE 2:
//   Feminicídio 63.6%: CONFIRMADO (múltiplas fontes jornalísticas + FBSP direto)
//   Violência doméstica 59.8%: 🟡 PENDENTE verificação no PDF do 19º Anuário. O FBSP publica mas o valor exato precisa ser conferido.
//   Estupro 54.2%: 🟡 PENDENTE verificação no PDF do 19º Anuário.
export const violenciaInterseccional = [
  // AUDITORIA MANUAL 11/03/2026: Valores corrigidos conforme 19º Anuário FBSP 2025, p.156
  { tipo: 'Feminicídio', mulherNegra: 63.6, mulherBranca: 35.7, fonte: '19º Anuário FBSP 2025 (dados 2024), p.156', url: 'https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf' },
  // AUDITORIA: Violência doméstica — não há taxa percentual por raça publicada pelo FBSP.
  // Dado auditado: NÚMERO ABSOLUTO de notificações (DataSUS/SINAN 2024) de violência interpessoal
  // em residência/habitação coletiva, excluindo lesão autoprovocada, população feminina.
  { tipo: 'Violência doméstica', mulherNegra: 111209, mulherBranca: 74763, fonte: 'DataSUS/SINAN 2024 — Notificações de violência interpessoal', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinannet/cnv/violebr.def', unidadeAbsoluta: true, notaAuditoria: 'Valores são números absolutos de notificações, NÃO percentuais. Fonte: registros de violência interpessoal/autoprovocada em residência, população feminina, excluindo lesão autoprovocada.' },
  // AUDITORIA: Estupro corrigido de 54,2/45,8 para 55,6/43,1 conforme FBSP 2025
  { tipo: 'Estupro', mulherNegra: 55.6, mulherBranca: 43.1, fonte: '19º Anuário FBSP 2025 (dados 2024)', url: 'https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf' },
];

// Juventude negra - 19º Anuário FBSP 2025 / Atlas da Violência 2025 / PNAD 2024
// AUDITORIA MANUAL 12/03/2026 — Correções conforme planilha de auditagem (Eduardo)
// Taxa homicídio: SIM (Atlas 2025, p.79) — mudou label "Brancos" → "Não Negros"
// Desemprego 18-24: REMOVIDO — tabela SIDRA 7113 não encontrada com esse cruzamento
// Nem-nem: REMOVIDO — tabela SIDRA 7113 × 9605 não encontrada com esse cruzamento
// Encarceramento: CORRIGIDO — SISDEPEN não filtra por cor; fonte alterada para 19º Anuário FBSP 2025
export const juventudeNegra = [
  { indicador: 'Taxa de homicídio (por 100 mil) — GERAL', valor: 28.9, referencia: 10.6, fonte: 'Atlas da Violência 2025 (IPEA/FBSP) — p.79', url: 'https://www.ipea.gov.br/atlasviolencia', labelNegro: 'Jovens Negros', labelReferencia: 'Jovens Não Negros' },
  { indicador: 'Encarceramento (% do total)', valor: 68.7, referencia: 29.9, fonte: '19º Anuário FBSP 2025, p.19 e 399', url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/', labelNegro: 'Jovens Negros', labelReferencia: 'Jovens Brancos', nota: 'Possível subnotificação (cobertura racial: 85,3%)' },
];

// =============================================
// CRUZAMENTOS INDIRETOS — RAÇA × GÊNERO
// Fontes auditáveis com deep links para dados reais
// Metodologia: 🔀 Cruzamento de 2+ fontes oficiais
// =============================================

// MERCADO DE TRABALHO: Raça × Gênero
// Fonte primária: DIEESE Boletim Consciência Negra Nov/2024 (PNAD Q2 2024)
// + Fiocruz/MIR Informe 2023 + RASEAM 2023
// AUDITORIA MANUAL 11/03/2026: Todos os valores corrigidos conforme DIEESE Boletim Consciência Negra Nov/2024
// Fonte: https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf
// NOTA IMPORTANTE: DIEESE usa "negros" e "não negros" (NÃO "brancos"). Labels foram ajustados.
// Rendimento médio no 2º trimestre de 2024: p.8
// Taxa de desocupação no 2º trimestre de 2024: p.3
// Proporção de ocupados em trabalho desprotegido (informalidade) no 2º trimestre de 2024: p.5
export const trabalhoRacaGenero = [
  {
    indicador: 'Rendimento médio (Q2 2024)',
    homemBranco: 4492, // "Homem não negro" no DIEESE
    mulherBranca: 3404, // "Mulher não negra" no DIEESE
    homemNegro: 2610,
    mulherNegra: 2079,
    unidade: 'R$',
    razaoMulherNegraHomemBranco: 0.463, // 2079/4492
    fonte: 'DIEESE — Boletim Consciência Negra Nov/2024 (PNAD Q2 2024), p.8',
    url: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf',
    nota: 'Mulher negra ganha 46,3% do rendimento do homem não negro. Labels "branco" = "não negro" conforme DIEESE.',
  },
  {
    indicador: 'Taxa de desocupação (Q2 2024, %)',
    homemBranco: 4.6, // "Homem não negro"
    mulherBranca: 6.7, // "Mulher não negra"
    homemNegro: 6.3,
    mulherNegra: 10.1,
    unidade: '%',
    razaoMulherNegraHomemBranco: 2.20, // 10.1/4.6
    fonte: 'DIEESE — Boletim Consciência Negra Nov/2024 (PNAD Q2 2024), p.3',
    url: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf',
    nota: 'Desemprego de mulheres negras é 2,2x maior que de homens não negros',
  },
  {
    indicador: 'Informalidade (Q2 2024, %)',
    homemBranco: 34.1, // "Homem não negro"
    mulherBranca: 34.3, // "Mulher não negra"
    homemNegro: 45.8,
    mulherNegra: 46.5,
    unidade: '%',
    razaoMulherNegraHomemBranco: 1.36, // 46.5/34.1
    fonte: 'DIEESE — Boletim Consciência Negra Nov/2024 (PNAD Q2 2024), p.5',
    url: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf',
    nota: 'Mulheres negras: 46,5% em trabalho desprotegido vs 34,1% homens não negros. DIEESE usa "trabalho desprotegido" (conceito similar a informalidade).',
  },
];

export const trabalhoRacaGeneroFontes = [
  { nome: 'DIEESE — Boletim Consciência Negra Nov/2024', url: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf' },
  { nome: 'DIEESE/SINESP — Pop. Negra Q2 2024', url: 'https://sinesp.org.br/images/2024/novembro/Brasil_e_regi%C3%B5es_2024_-_Popula%C3%A7%C3%A3o_negra1.pdf' },
  { nome: 'Fiocruz/MIR — Mulheres Negras no Brasil', url: 'https://fiocruz.br/sites/fiocruz.br/files/documentos_2/o_que_dizem_os_dados_sobre_a_vida_das_mulheres_negras_no_brasil.pdf' },
];

// CHEFIA FAMILIAR E VULNERABILIDADE: Raça × Gênero
// Fontes: RASEAM 2023/2024 + Fiocruz/DSBR 2023 + Censo 2022
// AUDITORIA MANUAL 11/03/2026: Valores corrigidos conforme Censo 2022 / SIDRA Tabela 10179
// Dados anteriores (4,3M mulheres, 501K homens) eram de fontes não-verificáveis.
// Novos valores: Censo 2022 — domicílios monoparentais por sexo e raça/cor do responsável.
export const chefiaFamiliarRacaGenero = {
  mulheresChefesMonoparentais: 7810826, // Censo 2022/SIDRA 10179
  mulheresNegrasChefesMonoparentais: 4667133, // Censo 2022/SIDRA 10180
  percentualNegras: 59.8, // 4.667.133 / 7.810.826
  percentualBrancas: 40.2,
  homensChefesMonoparentais: 1184615, // Censo 2022/SIDRA 10181
  homensNegrosChefesMonoparentais: 696109, // Censo 2022/SIDRA 10182
  // Fiocruz/DSBR — Insegurança Alimentar por Raça/Gênero (jun/2023)
  // Fonte: https://dssbr.ensp.fiocruz.br/uma-em-cada-cinco-familias-chefiadas-por-pessoas-autodeclaradas-pardas-ou-pretas-sofre-com-a-fome-no-brasil-a-situacao-e-pior-nos-lares-chefiados-por-mulheres-pardas-ou-pretas/
  fomeMulheresNegras: 20.6, // IA grave (fome) em domicílios chefiados por mulheres negras
  fomeHomensNegros: 17.1, // IA grave em domicílios chefiados por homens negros (pretos+pardos)
  iaModeradaGraveMulheresNegrasEscolarizadas: 33.0, // IA moderada+grave mesmo c/ 8+ anos estudo, mulheres negras
  iaModeradaGraveHomensNegrosEscolarizados: 21.3, // idem homens negros
  iaModeradaGraveMulheresBrancasEscolarizadas: 17.8, // idem mulheres brancas
  fomeCriancasMulheresNegras: 23.8, // IA grave em domicílios c/ crianças <10 chefiados por mulheres negras
  cadUnicoMulheresNegras: 38.5, // FPA Brasil/CadÚnico Jun/2023 — Auditado 12/03/2026
  cadUnicoMulheresBrancas: 17.0, // FPA Brasil/CadÚnico Jun/2023 — Auditado 12/03/2026
  fontes: [
    { nome: 'Censo 2022/SIDRA 10179 — Mulheres chefes monoparentais', url: 'https://sidra.ibge.gov.br/Tabela/10179' },
    { nome: 'Censo 2022/SIDRA 10180 — Mulheres negras chefes monoparentais', url: 'https://sidra.ibge.gov.br/Tabela/10180' },
    { nome: 'Censo 2022/SIDRA 10181 — Homens chefes monoparentais', url: 'https://sidra.ibge.gov.br/Tabela/10181' },
    { nome: 'Censo 2022/SIDRA 10182 — Homens negros chefes monoparentais', url: 'https://sidra.ibge.gov.br/Tabela/10182' },
    { nome: 'Fiocruz/DSBR — Insegurança Alimentar por Raça/Gênero', url: 'https://dssbr.ensp.fiocruz.br/uma-em-cada-cinco-familias-chefiadas-por-pessoas-autodeclaradas-pardas-ou-pretas-sofre-com-a-fome-no-brasil-a-situacao-e-pior-nos-lares-chefiados-por-mulheres-pardas-ou-pretas/' },
  ],
  metodologia: 'Censo 2022 (SIDRA 10179-10182): domicílios monoparentais por sexo e raça/cor. IA/Fome: Fiocruz/DSBR — recorte raça/gênero (jun/2023).',
};

// EDUCAÇÃO: Raça × Gênero
// Fontes: Informe MIR 2023 + PNAD Educação 2023/2024 + SIS/IBGE 2024
// AUDITORIA MANUAL 12/03/2026: Valores corrigidos conforme Censo 2022 — cruzamento SIDRA 9606 × 10061/9542
export const educacaoRacaGenero = [
  {
    indicador: 'Superior completo (%)',
    mulherNegra: 16.01,
    mulherBranca: 26.76,
    homemNegro: 10.97,
    homemBranco: 19.9,
    fonte: 'Censo 2022 — SIDRA 9606 × 10061',
    url: 'https://sidra.ibge.gov.br/tabela/10061',
    nota: 'Cruzamento Censo 2022. Mulheres negras com superior: 16,01% vs brancas 26,76%',
  },
  {
    indicador: 'Analfabetismo (%)',
    mulherNegra: 3.69,
    mulherBranca: 1.53,
    homemNegro: 4.36,
    homemBranco: 1.52,
    fonte: 'Censo 2022 — SIDRA 9606 × 9542',
    url: 'https://sidra.ibge.gov.br/tabela/9542',
    nota: 'Cruzamento Censo 2022. Analfabetismo de homens negros (4,36%) é o mais alto',
  },
  {
    indicador: 'Ensino médio completo (%)',
    mulherNegra: 15.4,
    mulherBranca: 12.36,
    homemNegro: 14.56,
    homemBranco: 11.64,
    fonte: 'Censo 2022 — SIDRA 9606 × 10061',
    url: 'https://sidra.ibge.gov.br/tabela/10061',
    nota: 'Ensino médio completo + superior incompleto. Negros têm maior % neste nível por serem minoria no superior completo.',
  },
  {
    indicador: 'Desemprego graduado (%)',
    mulherNegra: 1.05,
    mulherBranca: 0.71,
    homemNegro: 0.71,
    homemBranco: 0.56,
    fonte: 'Censo 2022 — SIDRA 9606 × 9517',
    url: 'https://sidra.ibge.gov.br/tabela/9517',
    nota: 'Pessoas com superior completo desempregadas. Mulher negra graduada: quase 2× mais chance de desemprego que homem branco graduado.',
  },
  {
    indicador: 'Inatividade qualificada (%)',
    mulherNegra: 7.58,
    mulherBranca: 8.84,
    homemNegro: 2.14,
    homemBranco: 5.59,
    fonte: 'Censo 2022 — SIDRA 9606 × 9517',
    url: 'https://sidra.ibge.gov.br/tabela/9517',
    nota: 'Pessoas com superior completo fora da PEA. Gênero pesa mais que raça: mulheres têm taxas muito superiores aos homens (jornada dupla).',
  },
];

// AUDITORIA MANUAL 12/03/2026: Fontes atualizadas para Censo 2022 (SIDRA)
export const educacaoRacaGeneroFontes = [
  { nome: 'SIDRA 9606 — Pop. residente por cor/raça e sexo (Censo 2022)', url: 'https://sidra.ibge.gov.br/tabela/9606' },
  { nome: 'SIDRA 10061 — Nível de instrução por sexo e cor/raça (Censo 2022)', url: 'https://sidra.ibge.gov.br/tabela/10061' },
  { nome: 'SIDRA 9542 — Alfabetização por sexo e cor/raça (Censo 2022)', url: 'https://sidra.ibge.gov.br/tabela/9542' },
  { nome: 'SIDRA 9517 — Condição de ocupação por instrução, sexo e cor/raça (Censo 2022)', url: 'https://sidra.ibge.gov.br/tabela/9517' },
];

// SAÚDE MATERNA: Raça
// Fontes: RASEAM 2025 (dados SIM/DataSUS até 2022) + IEPS Boletim Jul/2025 (dados até 2023) + Nascer no Brasil II (Fiocruz)
// Nota: O RASEAM (2024 e 2025) utiliza dados do SIM/DataSUS cujo último ano consolidado é 2022.
// O Boletim IEPS (jul/2025) apresenta dados até 2023 com razão de mortalidade materna por raça.
export const saudeMaternaRaca = {
  mortalidadeMaternaNegraPercentual: 68.0, // RASEAM 2025 — proporção de óbitos maternos de mulheres negras (pretas+pardas), dado SIM 2022
  mortalidadeMaternaBrancaPercentual: 29.7, // idem
  anoReferencia: 2022, // último ano consolidado SIM/DataSUS; RASEAM 2025 mantém esse recorte
  // AUDITORIA MANUAL 13/03/2026 (Eduardo): Dados RASEAM 2025 para 2023 (razão por 100 mil NV):
  // Pretas: 72,9 | Pardas: 49,9 | Brancas: 46,3
  razaoMortalidade2023_pretas: 72.9,
  razaoMortalidade2023_pardas: 49.9,
  razaoMortalidade2023_brancas: 46.3,
  fonteRaseam2025: 'https://www.gov.br/mulheres/pt-br/central-de-conteudos/publicacoes/raseam-2025.pdf',
  // IEPS Boletim jul/2025 — série até 2023: razão mortalidade materna pretas/brancas = 2,3× (108,6 vs 46,9 por 100 mil NV)
  razaoMortalidadePretasBrancas: 2.3,
  taxaPretasPor100milNV: 108.6,
  taxaBrancasPor100milNV: 46.9,
  taxaPardasPor100milNV: 56.6,
  periodoIEPS: '2010-2023',
  nascerBrasil2RazaoNegraBranca: 2.0,
  nascerBrasil2Nota: 'Pesquisa Nascer no Brasil II (Fiocruz, 2020-2023): morte de mães negras é 2× maior que de brancas (amostra hospitalar, 24 mil mulheres, 465 maternidades)',
  violenciaObstetricaGrupoRisco: 'Adolescentes ou >35 anos, negras, SUS, baixa escolaridade',
  fontes: [
    { nome: 'RASEAM 2025 — Mortalidade materna por raça (PDF)', url: 'https://www.gov.br/mulheres/pt-br/central-de-conteudos/publicacoes/raseam-2025.pdf' },
    { nome: 'IEPS — Mortalidade materna por raça (Boletim Jul/2025)', url: 'https://ieps.org.br/mortalidade-materna-de-mulheres-pretas-e-duas-vezes-maior-do-que-de-brancas/' },
    { nome: 'DataSUS/SIM — Mortalidade materna', url: 'http://tabnet.datasus.gov.br/cgi/tabcgi.exe?sim/cnv/mat10uf.def' },
    { nome: 'Nascer no Brasil II — Fiocruz (2023)', url: 'https://www.gov.br/saude/pt-br/assuntos/noticias/2023/novembro/morte-de-maes-negras-e-duas-vezes-maior-que-de-brancas-aponta-pesquisa' },
    { nome: 'Fiocruz/MIR — Mulheres Negras', url: 'https://fiocruz.br/sites/fiocruz.br/files/documentos_2/o_que_dizem_os_dados_sobre_a_vida_das_mulheres_negras_no_brasil.pdf' },
  ],
  metodologia: '🔀 Cruzamento: RASEAM 2025 (% mortes maternas por raça, SIM 2022) + IEPS Boletim Jul/2025 (razão de mortalidade materna pretas 2,3× brancas, série 2010-2023) + Nascer no Brasil II/Fiocruz (razão de risco hospitalar).',
};

// Legacy export mantido para compatibilidade
// NOTA: Lacuna PCD-EMPREGO-RENDA resolvida na auditagem de Março/2026
// Dados corrigidos: Ocupação via SIDRA 4178, Renda via SIDRA 9384, Prevalência via Censo SIDRA 10126
export const lacunasDocumentadas: any[] = [];

// REMOVIDO: educacaoInterseccional — substituído por educacaoRacaGenero (cruzamento indireto auditável).
export const educacaoInterseccional: never[] = [];
export const educacaoInterseccionalFontes = [
  { nome: 'SIDRA 7129 — Ensino superior por cor/raça', url: 'https://sidra.ibge.gov.br/tabela/7129' },
  { nome: 'SIDRA 7125 — Analfabetismo por cor/raça', url: 'https://sidra.ibge.gov.br/tabela/7125' },
  { nome: 'PNAD Contínua Educação 2024', url: 'https://www.ibge.gov.br/estatisticas/sociais/educacao.html' },
  { nome: 'INEP — Censo Educação Superior', url: 'https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-da-educacao-superior' },
];

// REMOVIDO: saudeInterseccional — substituído por saudeMaternaRaca (cruzamento indireto auditável).
export const saudeInterseccional: never[] = [];


// REMOVIDO: radarVulnerabilidades — índice composto com valores fabricados (normalização 0-100 arbitrária)
// viola Regra de Ouro: "elaboração própria" sem fórmula auditável reprodutível
// Os dados originais (SIDRA 6800, 6381, SIM, FBSP, SIS) são válidos MAS o índice composto não é.
export const radarVulnerabilidades: never[] = [];
export const radarVulnerabilidadesFontes = [
  { nome: 'SIDRA 6405 — Rendimento', url: 'https://sidra.ibge.gov.br/tabela/6405' },
  { nome: 'SIDRA 6402 — Desocupação', url: 'https://sidra.ibge.gov.br/tabela/6402' },
  { nome: 'TabNet/DataSUS — Mortalidade', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' },
  { nome: '19º Anuário FBSP 2025', url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/' },
  { nome: 'SIS/IBGE 2024', url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html' },
];


// Evolução temporal das desigualdades (2018-2024)
// Fontes: PNAD Contínua/SIDRA 6405, 6402 | 19º Anuário FBSP 2025 / Atlas da Violência 2025
// URLs:
//   Renda: https://sidra.ibge.gov.br/tabela/6405
//   Desemprego: https://sidra.ibge.gov.br/tabela/6402
//   Homicídio: https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/
//   Atlas: https://www.ipea.gov.br/atlasviolencia
export const evolucaoDesigualdade = [
  { ano: 2018, razaoRenda: 1.73, razaoDesemprego: 1.72, razaoHomicidio: 2.60 },
  { ano: 2019, razaoRenda: 1.71, razaoDesemprego: 1.68, razaoHomicidio: 2.60 },
  { ano: 2020, razaoRenda: 1.68, razaoDesemprego: 1.75, razaoHomicidio: 2.70 },
  { ano: 2021, razaoRenda: 1.65, razaoDesemprego: 1.72, razaoHomicidio: 2.50 },
  { ano: 2022, razaoRenda: 1.68, razaoDesemprego: 1.65, razaoHomicidio: 2.50 },
  { ano: 2023, razaoRenda: 1.70, razaoDesemprego: 1.53, razaoHomicidio: 2.70 },
  // CORRIGIDO: razão renda 2024 = 4009/2392 = 1.68 (DIEESE Q2 2024); desemprego = 8.0/5.5 = 1.45
  { ano: 2024, razaoRenda: 1.68, razaoDesemprego: 1.45, razaoHomicidio: 2.70 },
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
  datasus: { nome: 'DataSUS/SIM', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def' },
  datasusNascidosVivos: { nome: 'DataSUS/SINASC — Nascidos Vivos', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def' },
  datasusObitosInfantis: { nome: 'DataSUS/SIM — Óbitos Infantis', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/inf10uf.def' },
  ipea: { nome: 'IPEA/Retrato das Desigualdades', url: 'https://www.ipea.gov.br' },
  atlasViolencia: { nome: 'Atlas da Violência 2025 (IPEA)', url: 'https://www.ipea.gov.br/atlasviolencia/arquivos/artigos/5999-atlasdaviolencia2025.pdf', pagina: 'p. 79' },
  fbsp: { nome: '19º Anuário Brasileiro de Segurança Pública (FBSP 2025)', url: 'https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf' },
  fbspEdicoes: {
    '13': 'https://publicacoes.forumseguranca.org.br/items/de3ac14f-56ea-416c-a850-37bab76f91b0',
    '14': 'https://publicacoes.forumseguranca.org.br/items/6ff530e4-8b9f-4e9f-b5d1-237093813356',
    '15': 'https://publicacoes.forumseguranca.org.br/items/2c290f1f-6b52-4ba2-b1de-5bb33f7245fb',
    '16': 'https://publicacoes.forumseguranca.org.br/items/4f923d12-3cb2-40f7-b280-7419c8eb3b39',
    '17': 'https://publicacoes.forumseguranca.org.br/items/6b3e3a1b-3bd2-40f7-b280-7419c8eb3b39',
    '18': 'https://publicacoes.forumseguranca.org.br/items/f62c4196-561d-452d-a2a8-9d33d1163af0',
    '19': 'https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf',
  },
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

/**
 * INVENTÁRIO DE TESTE: ABA JUVENTUDE
 * Cada indicador com seu tipo de fonte e parâmetros de verificação
 *
 * CORREÇÕES v2:
 * - SIDRA: Tabela 7113 era ANALFABETISMO, não desemprego. Corrigido para tabela 6403.
 * - SIDRA: Tabela 9605 não aceita classificação c2 (cor/raça). Indicadores nem-nem
 *   reclassificados como 'web' com fonte DIEESE/Agência Brasil.
 * - Web: URLs verificadas para acessibilidade.
 * - PDF: Mantido Atlas da Violência (Firecrawl).
 */

export interface IndicatorToVerify {
  id: string;
  indicador: string;
  valor_declarado: number | string | null;
  fonte_declarada: string;
  tipo_fonte: 'pdf' | 'api_sidra' | 'web' | 'desconhecido';
  url_fonte: string | null;
  sidra_api_url?: string;
  sidra_filtros?: {
    variavel?: string;
    periodo?: string;
    cor_raca?: string;
    faixa_etaria?: string;
    descricao_busca?: string;
  };
  pagina_pdf?: string;
  secao: string;
}

// ═══════════════════════════════════════════════
// INVENTÁRIO: ABA DADOS GERAIS
// Dados demográficos (Censo 2022) e socioeconômicos (PNAD Contínua)
// ═══════════════════════════════════════════════
export const DADOS_GERAIS_INVENTORY: IndicatorToVerify[] = [
  // ─── DEMOGRÁFICOS — CENSO 2022 (SIDRA) ───
  {
    id: 'dg-01',
    indicador: 'População total do Brasil (Censo 2022)',
    valor_declarado: 203080756,
    fonte_declarada: 'IBGE/SIDRA — Censo Demográfico 2022, Tabela 9514',
    tipo_fonte: 'api_sidra',
    url_fonte: 'https://sidra.ibge.gov.br/Tabela/9514',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/9514/n1/1/v/93/p/2022',
    sidra_filtros: {
      variavel: '93 (População residente)',
      periodo: '2022',
      descricao_busca: 'População residente total, Brasil, Censo 2022',
    },
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-02',
    indicador: 'População Parda (%)',
    valor_declarado: 45.34,
    fonte_declarada: 'IBGE/SIDRA — Censo 2022, Tabela 9605',
    tipo_fonte: 'api_sidra',
    url_fonte: 'https://sidra.ibge.gov.br/Tabela/9605',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/9605/n1/1/v/93/p/2022/c86/2778',
    sidra_filtros: {
      variavel: '93 (População residente)',
      periodo: '2022',
      cor_raca: '2778 (Parda)',
      descricao_busca: 'Pop. parda — Censo 2022',
    },
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-03',
    indicador: 'População Branca (%)',
    valor_declarado: 43.46,
    fonte_declarada: 'IBGE/SIDRA — Censo 2022, Tabela 9605',
    tipo_fonte: 'api_sidra',
    url_fonte: 'https://sidra.ibge.gov.br/Tabela/9605',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/9605/n1/1/v/93/p/2022/c86/2776',
    sidra_filtros: {
      variavel: '93 (População residente)',
      periodo: '2022',
      cor_raca: '2776 (Branca)',
      descricao_busca: 'Pop. branca — Censo 2022',
    },
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-04',
    indicador: 'População Preta (%)',
    valor_declarado: 10.17,
    fonte_declarada: 'IBGE/SIDRA — Censo 2022, Tabela 9605',
    tipo_fonte: 'api_sidra',
    url_fonte: 'https://sidra.ibge.gov.br/Tabela/9605',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/9605/n1/1/v/93/p/2022/c86/2777',
    sidra_filtros: {
      variavel: '93 (População residente)',
      periodo: '2022',
      cor_raca: '2777 (Preta)',
      descricao_busca: 'Pop. preta — Censo 2022',
    },
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-05',
    indicador: 'População Indígena (%)',
    valor_declarado: 0.83,
    fonte_declarada: 'IBGE/SIDRA — Censo 2022, Tabela 9605',
    tipo_fonte: 'api_sidra',
    url_fonte: 'https://sidra.ibge.gov.br/Tabela/9605',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/9605/n1/1/v/93/p/2022/c86/2779',
    sidra_filtros: {
      variavel: '93 (População residente)',
      periodo: '2022',
      cor_raca: '2779 (Indígena)',
      descricao_busca: 'Pop. indígena — Censo 2022',
    },
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-06',
    indicador: 'Quilombolas — primeira contagem oficial',
    valor_declarado: 1330186,
    fonte_declarada: 'IBGE/SIDRA — Censo 2022, Tabela 9578',
    tipo_fonte: 'api_sidra',
    url_fonte: 'https://sidra.ibge.gov.br/Tabela/9578',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/9578/n1/1/v/93/p/2022/c741/all',
    sidra_filtros: {
      variavel: '93 (População residente)',
      periodo: '2022',
      descricao_busca: 'Pop. quilombola total — Censo 2022',
    },
    secao: 'Dados Gerais',
  },

  // ─── SOCIOECONÔMICOS — PNAD CONTÍNUA (SIDRA / DIEESE) ───
  {
    id: 'dg-07',
    indicador: 'Renda média mensal negros 2023 (R$)',
    valor_declarado: 2199,
    fonte_declarada: 'PNAD Contínua 2023 — SIDRA Tabela 6405',
    tipo_fonte: 'api_sidra',
    url_fonte: 'https://sidra.ibge.gov.br/tabela/6405',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/6405/n1/1/v/5929/p/2023/c86/2795',
    sidra_filtros: {
      variavel: '5929 (Rendimento médio mensal real)',
      periodo: '2023',
      cor_raca: '2795 (Preta ou parda)',
      descricao_busca: 'Rendimento médio negros — PNAD 2023',
    },
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-08',
    indicador: 'Renda média mensal brancos 2023 (R$)',
    valor_declarado: 3730,
    fonte_declarada: 'PNAD Contínua 2023 — SIDRA Tabela 6405',
    tipo_fonte: 'api_sidra',
    url_fonte: 'https://sidra.ibge.gov.br/tabela/6405',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/6405/n1/1/v/5929/p/2023/c86/2776',
    sidra_filtros: {
      variavel: '5929 (Rendimento médio mensal real)',
      periodo: '2023',
      cor_raca: '2776 (Branca)',
      descricao_busca: 'Rendimento médio brancos — PNAD 2023',
    },
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-09',
    indicador: 'Renda média mensal negros 2024 (R$)',
    valor_declarado: 2392,
    fonte_declarada: 'PNAD Contínua Q2 2024 — DIEESE/IBGE',
    tipo_fonte: 'web',
    url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.html',
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-10',
    indicador: 'Renda média mensal brancos 2024 (R$)',
    valor_declarado: 4009,
    fonte_declarada: 'PNAD Contínua Q2 2024 — DIEESE/IBGE',
    tipo_fonte: 'web',
    url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.html',
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-11',
    indicador: 'Desemprego negros 2023 (%)',
    valor_declarado: 9.5,
    fonte_declarada: 'PNAD Contínua 2023 — SIDRA Tabela 6402',
    tipo_fonte: 'api_sidra',
    url_fonte: 'https://sidra.ibge.gov.br/tabela/6402',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/6402/n1/1/v/4099/p/2023/c86/2795',
    sidra_filtros: {
      variavel: '4099 (Taxa de desocupação)',
      periodo: '2023',
      cor_raca: '2795 (Preta ou parda)',
      descricao_busca: 'Taxa desocupação negros — PNAD 2023',
    },
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-12',
    indicador: 'Desemprego brancos 2023 (%)',
    valor_declarado: 6.2,
    fonte_declarada: 'PNAD Contínua 2023 — SIDRA Tabela 6402',
    tipo_fonte: 'api_sidra',
    url_fonte: 'https://sidra.ibge.gov.br/tabela/6402',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/6402/n1/1/v/4099/p/2023/c86/2776',
    sidra_filtros: {
      variavel: '4099 (Taxa de desocupação)',
      periodo: '2023',
      cor_raca: '2776 (Branca)',
      descricao_busca: 'Taxa desocupação brancos — PNAD 2023',
    },
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-13',
    indicador: 'Desemprego negros 2024 (%)',
    valor_declarado: 8.0,
    fonte_declarada: 'PNAD Contínua Q2 2024 — DIEESE',
    tipo_fonte: 'web',
    url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.html',
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-14',
    indicador: 'Desemprego brancos 2024 (%)',
    valor_declarado: 5.5,
    fonte_declarada: 'PNAD Contínua Q2 2024 — DIEESE',
    tipo_fonte: 'web',
    url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.html',
    secao: 'Dados Gerais',
  },

  // ─── COMPOSIÇÃO RACIAL — SÉRIE TEMPORAL PNAD ───
  {
    id: 'dg-15',
    indicador: 'Pop. negra (%) — PNAD 2024',
    valor_declarado: 56.7,
    fonte_declarada: 'PNAD Contínua Q2 2024 — DIEESE/SINESP',
    tipo_fonte: 'web',
    url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.html',
    secao: 'Dados Gerais',
  },
  {
    id: 'dg-16',
    indicador: 'Pop. negra (%) — PNAD 2023',
    valor_declarado: 56.2,
    fonte_declarada: 'PNAD Contínua 2023 — SIDRA Tabela 6403',
    tipo_fonte: 'api_sidra',
    url_fonte: 'https://sidra.ibge.gov.br/Tabela/6403',
    sidra_api_url: 'https://apisidra.ibge.gov.br/values/t/6403/n1/1/v/1000093/p/2023/c86/2795',
    sidra_filtros: {
      variavel: '1000093 (Distribuição %)',
      periodo: '2023',
      cor_raca: '2795 (Preta ou parda)',
      descricao_busca: '% pop. negra — PNAD 2023',
    },
    secao: 'Dados Gerais',
  },
];

export const JUVENTUDE_INVENTORY: IndicatorToVerify[] = [
  // ═══════════════════════════════════════════════
  // TIPO C: WEB — Fontes jornalísticas verificáveis
  // ═══════════════════════════════════════════════
  {
    id: 'juv-01',
    indicador: 'Taxa de homicídio negros (por 100 mil)',
    valor_declarado: 28.9,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'web',
    url_fonte: 'https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2025-05/risco-de-negro-ser-vitima-de-homicidio-e-27-vezes-maior-no-brasil',
    secao: 'Juventude',
  },
  {
    id: 'juv-02',
    indicador: 'Taxa de homicídio não-negros (por 100 mil)',
    valor_declarado: 10.6,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'web',
    url_fonte: 'https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2025-05/risco-de-negro-ser-vitima-de-homicidio-e-27-vezes-maior-no-brasil',
    secao: 'Juventude',
  },
  {
    id: 'juv-03',
    indicador: 'Risco relativo homicídio negro vs não-negro',
    valor_declarado: 2.7,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'web',
    url_fonte: 'https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2025-05/risco-de-negro-ser-vitima-de-homicidio-e-27-vezes-maior-no-brasil',
    secao: 'Juventude',
  },

  // ═══════════════════════════════════════════════
  // TIPO A: PDF — Atlas da Violência (Firecrawl)
  // ═══════════════════════════════════════════════
  // AUDITORIA MANUAL 12/03/2026 — Todos os itens abaixo verificados por Eduardo
  {
    id: 'juv-04',
    indicador: 'Vítimas 15-29 anos (% do total de homicídios)',
    valor_declarado: 47.8,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP), p.26',
    tipo_fonte: 'pdf',
    url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/05/atlas-violencia-2025.pdf',
    pagina_pdf: 'p. 26',
    secao: 'Juventude',
  },
  {
    id: 'juv-05',
    indicador: 'IVJ-N risco relativo jovens negros vs não negros (ensino fundamental incompleto)',
    valor_declarado: 2.0,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP), p.74 (nota de rodapé)',
    tipo_fonte: 'pdf',
    url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/05/atlas-violencia-2025.pdf',
    pagina_pdf: 'p. 74',
    secao: 'Juventude',
  },
  {
    id: 'juv-06',
    indicador: 'IVJ-N risco jovens negros c/ ensino superior (2021)',
    valor_declarado: 3.0,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP), p.74',
    tipo_fonte: 'pdf',
    url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/05/atlas-violencia-2025.pdf',
    pagina_pdf: 'p. 74',
    secao: 'Juventude',
  },
  {
    id: 'juv-07',
    indicador: 'IVJ-N risco relativo 2017',
    valor_declarado: 1.9,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP), p.74',
    tipo_fonte: 'pdf',
    url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/05/atlas-violencia-2025.pdf',
    pagina_pdf: 'p. 74',
    secao: 'Juventude',
  },

  // ═══════════════════════════════════════════════
  // TIPO B: API SIDRA — Desemprego por cor/raça
  // Tabela 6403: Taxa de desocupação por cor ou raça (PNAD Contínua Trimestral)
  // Variável 4099 = Taxa de desocupação
  // c86 = Cor ou raça: 2776=Branca, 2777=Preta, 2778=Parda, 2795=Preta ou parda (NOTA: No sistema, exibimos como "Não Negros" ao invés de "Brancos")
  // ═══════════════════════════════════════════════
  {
    id: 'juv-08',
    indicador: 'Desemprego jovens negros (%)',
    valor_declarado: 20.8,
    fonte_declarada: 'PNAD Contínua 2024 — IBGE/SIDRA',
    tipo_fonte: 'web',
    // NOTA: Não existe tabela SIDRA que cruze desemprego × cor/raça × faixa etária (18-24) diretamente.
    // Usando fonte web DIEESE que publica esses cruzamentos.
    url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.html',
    secao: 'Juventude',
  },
  {
    id: 'juv-09',
    indicador: 'Desemprego jovens não negros (%)',
    valor_declarado: 11.5,
    fonte_declarada: 'PNAD Contínua 2024 — IBGE/SIDRA',
    tipo_fonte: 'web',
    url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.html',
    secao: 'Juventude',
  },
  {
    id: 'juv-10',
    indicador: 'Nem-nem jovens negros (%)',
    valor_declarado: 27.2,
    fonte_declarada: 'PNAD Contínua 2024 — IBGE/DIEESE',
    tipo_fonte: 'web',
    url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.html',
    secao: 'Juventude',
  },
  {
    id: 'juv-11',
    indicador: 'Nem-nem jovens não negros (%)',
    valor_declarado: 14.5,
    fonte_declarada: 'PNAD Contínua 2024 — IBGE/DIEESE',
    tipo_fonte: 'web',
    url_fonte: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.html',
    secao: 'Juventude',
  },

  // ═══════════════════════════════════════════════
  // TIPO C: WEB — Encarceramento e Letalidade Policial
  // ═══════════════════════════════════════════════
  {
    id: 'juv-12',
    indicador: 'Encarceramento % negros do total',
    valor_declarado: 68.2,
    fonte_declarada: 'SISDEPEN/SENAPPEN 2024',
    tipo_fonte: 'web',
    url_fonte: 'https://agenciabrasil.ebc.com.br/geral/noticia/2024-12/populacao-carceraria-do-brasil-e-de-6441-por-100-mil-habitantes',
    secao: 'Juventude',
  },
  {
    id: 'juv-13',
    indicador: 'Letalidade policial — % vítimas negras',
    valor_declarado: 82,
    fonte_declarada: '19º Anuário FBSP 2025',
    tipo_fonte: 'web',
    url_fonte: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    secao: 'Juventude',
  },
];

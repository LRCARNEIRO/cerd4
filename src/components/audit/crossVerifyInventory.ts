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
  {
    id: 'juv-04',
    indicador: 'Vítimas 15-29 anos (% do total de homicídios)',
    valor_declarado: 47.8,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'pdf',
    url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/05/atlas-violencia-2025.pdf',
    pagina_pdf: 'p. 79',
    secao: 'Juventude',
  },
  {
    id: 'juv-05',
    indicador: 'IVJ-N risco relativo jovens negros vs brancos',
    valor_declarado: 2.0,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'pdf',
    url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/05/atlas-violencia-2025.pdf',
    pagina_pdf: 'capítulo IVJ-N',
    secao: 'Juventude',
  },
  {
    id: 'juv-06',
    indicador: 'IVJ-N risco jovens negros c/ ensino superior',
    valor_declarado: 3.0,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'pdf',
    url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/05/atlas-violencia-2025.pdf',
    secao: 'Juventude',
  },
  {
    id: 'juv-07',
    indicador: 'IVJ-N risco relativo 2017',
    valor_declarado: 1.9,
    fonte_declarada: 'Atlas da Violência 2025 (IPEA/FBSP)',
    tipo_fonte: 'pdf',
    url_fonte: 'https://forumseguranca.org.br/wp-content/uploads/2025/05/atlas-violencia-2025.pdf',
    secao: 'Juventude',
  },

  // ═══════════════════════════════════════════════
  // TIPO B: API SIDRA — Desemprego por cor/raça
  // Tabela 6403: Taxa de desocupação por cor ou raça (PNAD Contínua Trimestral)
  // Variável 4099 = Taxa de desocupação
  // c86 = Cor ou raça: 2776=Branca, 2777=Preta, 2778=Parda, 2795=Preta ou parda
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
    indicador: 'Desemprego jovens brancos (%)',
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
    indicador: 'Nem-nem jovens brancos (%)',
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

/**
 * Gerador Dinâmico de Avaliação Técnica por Parágrafo CERD III
 * 
 * Constrói justificativa_avaliacao em tempo real cruzando:
 * - indicadores_interseccionais (base estatística)
 * - dados_orcamentarios (base orçamentária)  
 * - documentos_normativos (base normativa)
 * 
 * Substitui o texto estático do banco por templates dinâmicos
 * que refletem o estado atual do sistema.
 */

interface IndicadorRow {
  nome: string;
  categoria: string;
  subcategoria: string | null;
  dados: any;
  fonte: string;
  tendencia: string | null;
}

interface OrcamentoRow {
  programa: string;
  orgao: string;
  ano: number;
  pago: number | null;
  dotacao_autorizada: number | null;
  percentual_execucao: number | null;
  eixo_tematico: string | null;
  esfera: string;
}

interface NormativoRow {
  titulo: string;
  categoria: string;
  status: string;
  artigos_convencao: string[] | null;
}

// Mapping: parágrafo → categorias de indicadores + eixos orçamentários + artigos
const PARAGRAFO_MAP: Record<string, {
  categorias: string[];
  eixos: string[];
  artigos: string[];
  tema: string;
}> = {
  '12': {
    categorias: ['seguranca_publica', 'legislacao_justica'],
    eixos: ['seguranca_publica', 'legislacao_justica'],
    artigos: ['artigo_4', 'artigo_6'],
    tema: 'discriminação racial e crimes de ódio',
  },
  '14': {
    categorias: ['cultura_patrimonio', 'Cultura'],
    eixos: ['cultura_patrimonio'],
    artigos: ['artigo_7'],
    tema: 'representatividade midiática',
  },
  '16': {
    categorias: ['saude', 'covid_racial'],
    eixos: ['saude'],
    artigos: ['artigo_5'],
    tema: 'saúde e disparidades raciais',
  },
  '18': {
    categorias: ['educacao'],
    eixos: ['educacao'],
    artigos: ['artigo_5', 'artigo_7'],
    tema: 'educação e relações étnico-raciais',
  },
  '20': {
    categorias: ['terra_territorio', 'povos_tradicionais'],
    eixos: ['terra_territorio'],
    artigos: ['artigo_5'],
    tema: 'demarcação de terras indígenas',
  },
  '22': {
    categorias: ['terra_territorio', 'povos_tradicionais'],
    eixos: ['terra_territorio'],
    artigos: ['artigo_5'],
    tema: 'titulação de territórios quilombolas',
  },
  '24': {
    categorias: ['seguranca_publica'],
    eixos: ['seguranca_publica'],
    artigos: ['artigo_5', 'artigo_6'],
    tema: 'violência policial e letalidade',
  },
  '26': {
    categorias: ['seguranca_publica'],
    eixos: ['seguranca_publica', 'legislacao_justica'],
    artigos: ['artigo_5', 'artigo_6'],
    tema: 'encarceramento em massa',
  },
};

function fmt(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

function pct(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${n.toFixed(1)}%`;
}

/**
 * Gera avaliação técnica dinâmica para um parágrafo CERD III
 * usando dados reais do sistema.
 */
export function generateDynamicJustificativa(
  paragrafo: string,
  indicadores: IndicadorRow[],
  orcamento: OrcamentoRow[],
  normativos: NormativoRow[],
): string | null {
  const mapping = PARAGRAFO_MAP[paragrafo];
  if (!mapping) return null;

  // Filter relevant data
  const indsRelevantes = indicadores.filter(i =>
    mapping.categorias.includes(i.categoria) ||
    (i.subcategoria && mapping.categorias.includes(i.subcategoria))
  );

  const orcRelevante = orcamento.filter(o =>
    o.eixo_tematico && mapping.eixos.includes(o.eixo_tematico)
  );

  const normsRelevantes = normativos.filter(n =>
    n.artigos_convencao?.some(a => mapping.artigos.includes(a))
  );

  // Count normative advances vs setbacks
  const normAvances = normsRelevantes.filter(n => n.status === 'analisado' || n.status === 'aprovado').length;

  // Budget summary (latest year)
  const latestOrcYear = orcRelevante.length > 0
    ? Math.max(...orcRelevante.map(o => o.ano))
    : null;
  const latestOrc = latestOrcYear
    ? orcRelevante.filter(o => o.ano === latestOrcYear)
    : [];
  const totalPago = latestOrc.reduce((sum, o) => sum + (o.pago || 0), 0);
  const totalAutorizado = latestOrc.reduce((sum, o) => sum + (o.dotacao_autorizada || 0), 0);
  const execucaoMedia = totalAutorizado > 0 ? (totalPago / totalAutorizado) * 100 : null;

  // Build per-paragraph assessment
  switch (paragrafo) {
    case '12': return buildP12(indsRelevantes, normAvances, execucaoMedia, latestOrcYear);
    case '14': return buildP14(indsRelevantes, normAvances);
    case '16': return buildP16(indsRelevantes, normAvances, execucaoMedia, latestOrcYear, totalPago);
    case '18': return buildP18(indsRelevantes, normAvances, execucaoMedia, latestOrcYear);
    case '20': return buildP20(indsRelevantes, normAvances, orcRelevante, latestOrcYear);
    case '22': return buildP22(indsRelevantes, normAvances, orcRelevante, latestOrcYear);
    case '24': return buildP24(indsRelevantes, normAvances);
    case '26': return buildP26(indsRelevantes, normAvances);
    default: return null;
  }
}

function extractDados(inds: IndicadorRow[], nomeContains: string): any {
  const ind = inds.find(i => i.nome.toLowerCase().includes(nomeContains.toLowerCase()));
  return ind?.dados;
}

function buildP12(inds: IndicadorRow[], normCount: number, execucao: number | null, anoOrc: number | null): string {
  const parts: string[] = [];

  // Hate crimes / discrimination data
  const letalidade = extractDados(inds, 'letalidade policial');
  const homicidio = extractDados(inds, 'homicíd');
  
  if (homicidio?.percentualVitimasNegras) {
    parts.push(`Vítimas negras representam ${pct(homicidio.percentualVitimasNegras)} dos homicídios`);
  }
  if (letalidade?.percentualNegros) {
    parts.push(`letalidade policial incide em ${pct(letalidade.percentualNegros)} sobre negros`);
  }

  if (normCount > 0) {
    parts.push(`${normCount} marco(s) normativo(s) vinculado(s) ao tema`);
  }

  if (parts.length === 0) {
    return `${normCount > 0 ? normCount + ' marcos normativos registrados' : 'Sem indicadores estatísticos disponíveis para avaliação automatizada'}. Tema: ${PARAGRAFO_MAP['12'].tema}.`;
  }

  return parts.join('; ') + '.';
}

function buildP14(inds: IndicadorRow[], normCount: number): string {
  const parts: string[] = [];
  
  // Media/culture indicators
  if (inds.length > 0) {
    parts.push(`${inds.length} indicador(es) de cultura/mídia no sistema`);
  }
  if (normCount > 0) {
    parts.push(`${normCount} marco(s) normativo(s) sobre representatividade`);
  }

  if (parts.length === 0) {
    return 'Indicadores estatísticos limitados sobre representatividade midiática. Lacuna de dados desagregados persiste.';
  }

  return parts.join('; ') + '. Monitoramento de estereótipos raciais requer indicadores específicos.';
}

function buildP16(inds: IndicadorRow[], normCount: number, execucao: number | null, anoOrc: number | null, totalPago: number): string {
  const parts: string[] = [];

  const materna = extractDados(inds, 'mortalidade materna');
  const covid = inds.filter(i => i.categoria === 'covid_racial');

  if (materna?.razaoMortalidadeNegraBranca) {
    parts.push(`Razão de mortalidade materna negra/branca: ${fmt(materna.razaoMortalidadeNegraBranca)}x`);
  }
  if (covid.length > 0) {
    parts.push(`${covid.length} indicador(es) COVID-racial documentados`);
  }
  if (totalPago > 0 && anoOrc) {
    parts.push(`R$ ${fmt(totalPago / 1e6)}M pagos em saúde (${anoOrc}), execução ${execucao ? pct(execucao) : '—'}`);
  }
  if (normCount > 0) {
    parts.push(`${normCount} norma(s) de saúde vinculada(s)`);
  }

  if (parts.length === 0) {
    return 'Disparidades em mortalidade materna e acesso à saúde permanecem, com dados insuficientes para avaliação automatizada completa.';
  }

  return parts.join('; ') + '.';
}

function buildP18(inds: IndicadorRow[], normCount: number, execucao: number | null, anoOrc: number | null): string {
  const parts: string[] = [];

  const analfab = extractDados(inds, 'analfabet');
  const superior = extractDados(inds, 'superior');
  const evasao = extractDados(inds, 'evasão');

  if (analfab?.negros != null && analfab?.brancos != null) {
    parts.push(`Analfabetismo: ${pct(analfab.negros)} negros vs. ${pct(analfab.brancos)} brancos`);
  }
  if (superior?.negros != null) {
    parts.push(`ensino superior negro: ${pct(superior.negros)}`);
  }
  if (normCount > 0) {
    parts.push(`${normCount} marco(s) normativo(s) de educação`);
  }
  if (execucao != null && anoOrc) {
    parts.push(`execução orçamentária educação ${pct(execucao)} (${anoOrc})`);
  }

  if (parts.length === 0) {
    return 'Avanços na produção normativa educacional, mas implementação e dados de impacto ainda limitados no sistema.';
  }

  return parts.join('; ') + '.';
}

function buildP20(inds: IndicadorRow[], normCount: number, orc: OrcamentoRow[], anoOrc: number | null): string {
  const parts: string[] = [];

  const terras = extractDados(inds, 'terras indígenas') || extractDados(inds, 'TIs');
  const povos = inds.find(i => i.subcategoria === 'indigenas' || i.nome.toLowerCase().includes('indígena'));

  if (terras?.terrasTotal) {
    parts.push(`${fmt(terras.terrasTotal)} TIs registradas, ${fmt(terras.terrasHomologadas)} regularizadas`);
  } else if (povos?.dados?.terrasTotal) {
    parts.push(`${fmt(povos.dados.terrasTotal)} TIs registradas, ${fmt(povos.dados.terrasHomologadas)} regularizadas`);
  }

  // Budget for terra_territorio
  const orcTerra = orc.filter(o => o.eixo_tematico === 'terra_territorio');
  if (orcTerra.length > 0 && anoOrc) {
    const totalPagoTerra = orcTerra.filter(o => o.ano === anoOrc).reduce((s, o) => s + (o.pago || 0), 0);
    if (totalPagoTerra > 0) {
      parts.push(`R$ ${fmt(totalPagoTerra / 1e6)}M pagos em terra/território (${anoOrc})`);
    }
  }

  if (normCount > 0) {
    parts.push(`${normCount} marco(s) normativo(s) sobre demarcação`);
  }

  if (parts.length === 0) {
    return 'Reversão da paralisia nas demarcações a partir de 2023, com criação do MPI. Dados quantitativos no sistema em construção.';
  }

  return parts.join('; ') + '. Processos pendentes de homologação persistem como dívida histórica.';
}

function buildP22(inds: IndicadorRow[], normCount: number, orc: OrcamentoRow[], anoOrc: number | null): string {
  const parts: string[] = [];

  const quilombolas = inds.find(i =>
    i.subcategoria === 'quilombolas' || i.nome.toLowerCase().includes('quilombol')
  );

  if (quilombolas?.dados) {
    const d = quilombolas.dados;
    if (d.territoriosTitulados) parts.push(`${fmt(d.territoriosTitulados)} territórios titulados`);
    if (d.comunidadesCertificadas) parts.push(`${fmt(d.comunidadesCertificadas)} comunidades certificadas`);
    if (d.processosAbertosIncra) parts.push(`${fmt(d.processosAbertosIncra)} processos abertos no INCRA`);
  }

  if (normCount > 0) {
    parts.push(`${normCount} norma(s) vinculada(s)`);
  }

  if (parts.length === 0) {
    return 'Período 2019-2022 marcado por paralisia. Ritmo de titulação permanece aquém da demanda. Dados do Censo 2022 trazem primeira contagem oficial.';
  }

  const titulados = quilombolas?.dados?.territoriosTitulados || 0;
  const processos = quilombolas?.dados?.processosAbertosIncra || 1;
  const percentual = processos > 0 ? ((titulados / processos) * 100).toFixed(0) : '—';

  return parts.join('; ') + `. Taxa de titulação: ~${percentual}% dos processos concluídos.`;
}

function buildP24(inds: IndicadorRow[], normCount: number): string {
  const parts: string[] = [];

  const letalidade = extractDados(inds, 'letalidade policial');
  const homicidio = extractDados(inds, 'homicíd');

  if (letalidade?.percentualNegros) {
    parts.push(`Letalidade policial: ${pct(letalidade.percentualNegros)} das vítimas são negras`);
  }
  if (homicidio?.taxaNegros && homicidio?.taxaBrancos) {
    parts.push(`taxa de homicídio negros ${fmt(homicidio.taxaNegros)} vs. brancos ${fmt(homicidio.taxaBrancos)} por 100 mil`);
  }
  if (normCount > 0) {
    parts.push(`${normCount} marco(s) normativo(s) sobre uso da força`);
  }

  if (parts.length === 0) {
    return 'Violência policial letal contra jovens negros persiste como padrão estrutural. Medidas normativas não alteraram o quadro de desproporcionalidade racial.';
  }

  return parts.join('; ') + '. Desproporcionalidade racial na violência institucional persiste.';
}

function buildP26(inds: IndicadorRow[], normCount: number): string {
  const parts: string[] = [];

  const carceraria = inds.find(i =>
    i.nome.toLowerCase().includes('carcerár') || i.nome.toLowerCase().includes('encarcer') || i.nome.toLowerCase().includes('prisional')
  );

  if (carceraria?.dados) {
    const d = carceraria.dados;
    if (d.percentualNegros) {
      parts.push(`Negros representam ${pct(d.percentualNegros)} da população carcerária`);
    }
    if (d.totalNegros && d.totalBrancos) {
      parts.push(`${fmt(d.totalNegros)} negros vs. ${fmt(d.totalBrancos)} brancos encarcerados`);
    }
  }

  if (normCount > 0) {
    parts.push(`${normCount} marco(s) normativo(s) sobre sistema prisional`);
  }

  if (parts.length === 0) {
    return 'Perfil do encarceramento em massa com viés racial permanece inalterado. Dados do sistema em construção para avaliação automatizada.';
  }

  return parts.join('; ') + '. Viés racial no sistema prisional persiste.';
}

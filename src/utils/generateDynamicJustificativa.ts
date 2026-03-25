/**
 * Gerador Dinâmico de Avaliação Técnica por Parágrafo CERD III
 * 
 * Constrói justificativa_avaliacao em tempo real cruzando TODAS as bases:
 * - indicadores_interseccionais (base estatística — todas as categorias)
 * - dados_orcamentarios (base orçamentária)  
 * - documentos_normativos (base normativa)
 * 
 * Usa a MESMA lógica multicamada do Sensor Diagnóstico (useDiagnosticSensor):
 * vinculação por Artigos ICERD + Eixo Temático + Grupo Focal + Keywords.
 */

interface IndicadorRow {
  nome: string;
  categoria: string;
  subcategoria: string | null;
  dados: any;
  fonte: string;
  tendencia: string | null;
  artigos_convencao?: string[] | null;
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
  artigos_convencao?: string[] | null;
}

interface NormativoRow {
  titulo: string;
  categoria: string;
  status: string;
  artigos_convencao: string[] | null;
}

// Mapping: parágrafo → artigos ICERD + eixos + keywords for multi-layer matching
const PARAGRAFO_CONFIG: Record<string, {
  artigos: string[];
  eixos: string[];
  keywords: string[];
  tema: string;
}> = {
  '12': {
    artigos: ['artigo_4', 'artigo_6', 'IV', 'VI'],
    eixos: ['seguranca_publica', 'legislacao_justica'],
    keywords: ['discriminação', 'crime', 'ódio', 'racismo', 'racial', 'denúncia', 'disque', 'ouvidoria', 'homicídio', 'letalidade'],
    tema: 'discriminação racial, crimes de ódio e acesso à justiça',
  },
  '14': {
    artigos: ['artigo_7', 'VII'],
    eixos: ['cultura_patrimonio'],
    keywords: ['mídia', 'cultura', 'representatividade', 'estereótipo', 'patrimônio', 'religião', 'matriz africana', 'terreiro', 'capoeira'],
    tema: 'cultura, patrimônio e representatividade midiática',
  },
  '16': {
    artigos: ['artigo_5', 'V'],
    eixos: ['saude'],
    keywords: ['saúde', 'mortalidade', 'materna', 'infantil', 'covid', 'saneamento', 'sus', 'datasus', 'pré-natal', 'óbito', 'natalidade'],
    tema: 'saúde e disparidades raciais',
  },
  '18': {
    artigos: ['artigo_5', 'artigo_7', 'V', 'VII'],
    eixos: ['educacao'],
    keywords: ['educação', 'escola', 'analfabetismo', 'evasão', 'superior', 'cotas', 'creche', 'alfabetização', 'distorção', 'etnico-racial', 'INEP'],
    tema: 'educação e relações étnico-raciais',
  },
  '20': {
    artigos: ['artigo_5', 'V'],
    eixos: ['terra_territorio'],
    keywords: ['indígena', 'terra', 'demarcação', 'homologação', 'FUNAI', 'TI', 'reserva', 'aldeia', 'yanomami'],
    tema: 'demarcação de terras indígenas',
  },
  '22': {
    artigos: ['artigo_5', 'V'],
    eixos: ['terra_territorio'],
    keywords: ['quilombola', 'quilombo', 'titulação', 'INCRA', 'território', 'certidão', 'palmares', 'comunidade remanescente'],
    tema: 'titulação de territórios quilombolas',
  },
  '24': {
    artigos: ['artigo_5', 'artigo_6', 'V', 'VI'],
    eixos: ['seguranca_publica'],
    keywords: ['violência', 'policial', 'letalidade', 'uso da força', 'arma', 'operação', 'favela', 'periferia', 'jovem negro', 'abordagem'],
    tema: 'violência policial e letalidade',
  },
  '26': {
    artigos: ['artigo_5', 'artigo_6', 'V', 'VI'],
    eixos: ['seguranca_publica', 'legislacao_justica'],
    keywords: ['carcerário', 'encarceramento', 'prisional', 'preso', 'detento', 'penitenciário', 'DEPEN', 'audiência de custódia', 'provisório'],
    tema: 'encarceramento em massa e sistema prisional',
  },
};

function normalizeArticle(raw: string): string {
  return String(raw || '').toLowerCase().trim();
}

function matchesKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return keywords.some(kw => {
    const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return lower.includes(kwNorm);
  });
}

function fmt(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

function pct(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${Number(n).toFixed(1)}%`;
}

const NEGATIVE_INDICATORS = [
  'mortalidade', 'homicídio', 'violência', 'desemprego', 'analfabet',
  'evasão', 'abandono', 'pobreza', 'deficit', 'déficit', 'trabalho infantil',
  'desigualdade', 'letalidade', 'encarceramento', 'insegurança',
];

function isLowerBetter(nome: string): boolean {
  return NEGATIVE_INDICATORS.some(kw => nome.toLowerCase().includes(kw));
}

function inferTendencia(ind: IndicadorRow): string {
  if (!ind.tendencia) return 'desconhecida';
  const t = ind.tendencia.toLowerCase();
  const lowerBetter = isLowerBetter(ind.nome);
  if (t === 'crescente') return lowerBetter ? 'piora' : 'melhora';
  if (t === 'decrescente') return lowerBetter ? 'melhora' : 'piora';
  if (t === 'estavel' || t === 'estável') return 'estável';
  return 'desconhecida';
}

/**
 * Multi-layer matching (same as useDiagnosticSensor):
 * 1. By artigos_convencao
 * 2. By eixo/categoria 
 * 3. By keywords in nome/programa/titulo
 */
function findLinkedIndicadores(indicadores: IndicadorRow[], config: typeof PARAGRAFO_CONFIG['12']): IndicadorRow[] {
  const byArtigo = indicadores.filter(i =>
    (i.artigos_convencao || []).some(a => config.artigos.includes(normalizeArticle(a)))
  );
  const byEixo = indicadores.filter(i =>
    config.eixos.includes(i.categoria) ||
    (i.subcategoria && config.eixos.includes(i.subcategoria))
  );
  const byKeyword = indicadores.filter(i =>
    matchesKeyword(`${i.nome} ${i.categoria} ${i.subcategoria || ''}`, config.keywords)
  );
  // Deduplicate
  return Array.from(new Map([...byArtigo, ...byEixo, ...byKeyword].map(i => [i.nome, i])).values());
}

function findLinkedOrcamento(orcamento: OrcamentoRow[], config: typeof PARAGRAFO_CONFIG['12']): OrcamentoRow[] {
  const byArtigo = orcamento.filter(o =>
    (o.artigos_convencao || []).some(a => config.artigos.includes(normalizeArticle(a)))
  );
  const byEixo = orcamento.filter(o =>
    o.eixo_tematico && config.eixos.includes(o.eixo_tematico)
  );
  const byKeyword = orcamento.filter(o =>
    matchesKeyword(`${o.programa} ${o.orgao}`, config.keywords)
  );
  return Array.from(new Map([...byArtigo, ...byEixo, ...byKeyword].map(o => [`${o.programa}-${o.orgao}-${o.ano}`, o])).values());
}

function findLinkedNormativos(normativos: NormativoRow[], config: typeof PARAGRAFO_CONFIG['12']): NormativoRow[] {
  const byArtigo = normativos.filter(n =>
    (n.artigos_convencao || []).some(a => config.artigos.includes(normalizeArticle(a)))
  );
  const byKeyword = normativos.filter(n =>
    matchesKeyword(n.titulo, config.keywords)
  );
  return Array.from(new Map([...byArtigo, ...byKeyword].map(n => [n.titulo, n])).values());
}

/**
 * Gera avaliação técnica dinâmica para um parágrafo CERD III
 * usando cruzamento multicamada de TODAS as bases do sistema.
 */
export function generateDynamicJustificativa(
  paragrafo: string,
  indicadores: IndicadorRow[],
  orcamento: OrcamentoRow[],
  normativos: NormativoRow[],
): string | null {
  const config = PARAGRAFO_CONFIG[paragrafo];
  if (!config) return null;

  // Multi-layer matching
  const inds = findLinkedIndicadores(indicadores, config);
  const orcs = findLinkedOrcamento(orcamento, config);
  const norms = findLinkedNormativos(normativos, config);

  const parts: string[] = [];

  // ── 1. Indicadores Estatísticos (detalhar dados-chave) ──
  if (inds.length > 0) {
    // Extract key numeric findings from dados
    const findings: string[] = [];
    for (const ind of inds.slice(0, 8)) {
      const d = ind.dados;
      if (!d || typeof d !== 'object') continue;

      // Generic extraction of racial disparity data
      if (d.percentualVitimasNegras != null) {
        findings.push(`${ind.nome}: ${pct(d.percentualVitimasNegras)} de vítimas negras`);
      } else if (d.percentualNegros != null) {
        findings.push(`${ind.nome}: ${pct(d.percentualNegros)} negros`);
      } else if (d.negros != null && d.brancos != null) {
        findings.push(`${ind.nome}: ${typeof d.negros === 'number' && d.negros < 100 ? pct(d.negros) : fmt(d.negros)} negros vs. ${typeof d.brancos === 'number' && d.brancos < 100 ? pct(d.brancos) : fmt(d.brancos)} brancos`);
      } else if (d.razaoMortalidadeNegraBranca != null) {
        findings.push(`${ind.nome}: razão negra/branca ${fmt(d.razaoMortalidadeNegraBranca)}x`);
      } else if (d.terrasTotal != null) {
        findings.push(`${ind.nome}: ${fmt(d.terrasTotal)} registradas, ${fmt(d.terrasHomologadas || d.terrasRegularizadas)} regularizadas`);
      } else if (d.territoriosTitulados != null) {
        findings.push(`${ind.nome}: ${fmt(d.territoriosTitulados)} titulados, ${fmt(d.comunidadesCertificadas)} certificadas`);
      } else if (d.totalNegros != null) {
        findings.push(`${ind.nome}: ${fmt(d.totalNegros)} negros`);
      }
    }

    if (findings.length > 0) {
      parts.push(`Indicadores vinculados (${inds.length} no sistema): ${findings.slice(0, 5).join('; ')}`);
    } else {
      parts.push(`${inds.length} indicador(es) estatístico(s) vinculado(s) ao tema`);
    }

    // Tendência
    const tendencias = inds.map(i => inferTendencia(i));
    const melhoram = tendencias.filter(t => t === 'melhora').length;
    const pioram = tendencias.filter(t => t === 'piora').length;
    if (melhoram > 0 || pioram > 0) {
      parts.push(`Tendências: ${melhoram} melhora(s), ${pioram} piora(s)`);
    }
  } else {
    parts.push('Sem indicadores estatísticos vinculados no sistema');
  }

  // ── 2. Base Orçamentária ──
  if (orcs.length > 0) {
    const latestYear = Math.max(...orcs.map(o => o.ano));
    const latestOrcs = orcs.filter(o => o.ano === latestYear);
    const totalPago = latestOrcs.reduce((s, o) => s + (o.pago || 0), 0);
    const totalAutorizado = latestOrcs.reduce((s, o) => s + (o.dotacao_autorizada || 0), 0);
    const execucao = totalAutorizado > 0 ? (totalPago / totalAutorizado) * 100 : null;

    const orcText = totalPago > 0
      ? `R$ ${fmt(totalPago / 1e6)}M pagos de R$ ${fmt(totalAutorizado / 1e6)}M autorizados (${latestYear}), execução ${execucao ? pct(execucao) : '—'}`
      : `${latestOrcs.length} ação(ões) orçamentária(s) em ${latestYear}`;

    parts.push(`Orçamento (${orcs.length} ações vinculadas): ${orcText}`);

    // Orçamento simbólico warning
    const simbolicos = latestOrcs.filter(o => {
      const dot = Number(o.dotacao_autorizada) || 0;
      const pag = Number(o.pago) || 0;
      return dot > 100000 && pag < dot * 0.05;
    });
    if (simbolicos.length > 0) {
      parts.push(`⚠️ ${simbolicos.length} ação(ões) com execução inferior a 5% (orçamento simbólico)`);
    }
  }

  // ── 3. Base Normativa ──
  if (norms.length > 0) {
    parts.push(`${norms.length} marco(s) normativo(s) vinculado(s): ${norms.slice(0, 3).map(n => n.titulo).join('; ')}`);
  } else {
    parts.push('Sem cobertura normativa identificada');
  }

  if (parts.length === 0) {
    return `Dados insuficientes para avaliação automatizada do tema: ${config.tema}.`;
  }

  return parts.join('. ') + '.';
}

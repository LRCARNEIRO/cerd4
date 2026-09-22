/**
 * Helpers de exibição de documentos normativos nos relatórios de
 * Recomendações e Artigos.
 *
 * - `extractOrgaoNormativo`: deriva o órgão emissor a partir do título
 *   cadastrado (a base `documentos_normativos` não possui coluna de órgão).
 * - `buildNormativoLink`: deep-link para o card exato na aba Normativa.
 */

const SIGLAS = [
  'MIR', 'MDHC', 'SEPPIR', 'STF', 'STJ', 'TSE', 'TST', 'CNJ', 'CNMP', 'AGU',
  'PGR', 'MJSP', 'MJ', 'MPF', 'MEC', 'MS', 'MTE', 'MDS', 'MGI', 'INCRA',
  'FUNAI', 'SESAI', 'IBGE', 'DPU', 'DPF', 'IPHAN', 'CONANDA', 'CONAQ',
  'CNE', 'ANS', 'ANVISA', 'FCP', 'INEP', 'IPEA', 'TCU', 'CGU', 'CNDH',
];

const PADROES: Array<[RegExp, string]> = [
  [/minist[ée]rio\s+d[aeo]s?\s+[^,;.—-]{2,60}/i, ''],
  [/secretaria\s+(nacional\s+|especial\s+)?d[aeo]s?\s+[^,;.—-]{2,60}/i, ''],
  [/presid[êe]ncia\s+da\s+rep[úu]blica/i, 'Presidência da República'],
  [/supremo\s+tribunal\s+federal/i, 'Supremo Tribunal Federal'],
  [/superior\s+tribunal\s+de\s+justi[çc]a/i, 'Superior Tribunal de Justiça'],
  [/conselho\s+nacional\s+de\s+justi[çc]a/i, 'Conselho Nacional de Justiça'],
  [/congresso\s+nacional/i, 'Congresso Nacional'],
  [/senado\s+federal/i, 'Senado Federal'],
  [/c[âa]mara\s+dos\s+deputados/i, 'Câmara dos Deputados'],
  [/defensoria\s+p[úu]blica\s+da\s+uni[ãa]o/i, 'Defensoria Pública da União'],
];

/** Deriva o órgão emissor a partir do título e da categoria cadastrados. */
export function extractOrgaoNormativo(titulo: string, categoria?: string | null): string {
  const t = String(titulo || '');
  if (!t) return '—';

  for (const [re, fixo] of PADROES) {
    const m = t.match(re);
    if (m) {
      const bruto = fixo || m[0];
      return bruto.replace(/\s+/g, ' ').trim().replace(/^./, (c) => c.toUpperCase());
    }
  }

  const up = t.toUpperCase();
  for (const s of SIGLAS) {
    if (new RegExp(`\\b${s}\\b`).test(up)) return s;
  }

  // Leis, decretos e emendas federais sem órgão explícito no título
  if (/\b(lei|decreto|emenda constitucional|medida provis[óo]ria)\b/i.test(t)) {
    return 'Presidência da República / Congresso Nacional';
  }
  if (/\bresolu[çc][ãa]o\b/i.test(t) && categoria) return String(categoria);
  return '—';
}

/** Deep-link para o documento normativo dentro do sistema. */
export function buildNormativoLink(origin: string, id?: string | null, titulo?: string): string {
  if (id) return `${origin}/normativa?tab=acervo#doc-${id}`;
  return `${origin}/normativa?q=${encodeURIComponent(String(titulo || ''))}`;
}

import { EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';

export type MatchQuality = 'explicit' | 'keyword' | 'eixo';

export interface ArtigoMatch {
  artigo: ArtigoConvencao;
  quality: MatchQuality;
  /** Peso: explicit=1.0, keyword=1.0, eixo=0.5 */
  weight: number;
}

export function getSafeIndicadores<T extends { id?: string; categoria?: string | null }>(indicadores: T[]): T[] {
  const seen = new Set<string>();

  return indicadores.filter((ind) => {
    if (ind.categoria === 'common_core') return false;

    const dedupeKey = String(ind.id || '');
    if (!dedupeKey) return true;
    if (seen.has(dedupeKey)) return false;

    seen.add(dedupeKey);
    return true;
  });
}

/** Retorna artigos com qualidade do match (para modelo híbrido) */
export function inferArtigosWithQuality(ind: any): ArtigoMatch[] {
  const explicit = (ind.artigos_convencao || []).filter((a: string) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].includes(a)) as ArtigoConvencao[];
  if (explicit.length > 0) {
    return explicit.map(a => ({ artigo: a, quality: 'explicit' as MatchQuality, weight: 1.0 }));
  }

  const matches = new Map<ArtigoConvencao, ArtigoMatch>();
  const categoria = String(ind.categoria || '').toLowerCase();
  const subcategoria = String(ind.subcategoria || '').toLowerCase();
  const nome = String(ind.nome || '').toLowerCase();
  const origem = Array.isArray(ind.documento_origem) ? ind.documento_origem.join(' ').toLowerCase() : '';
  const texto = [categoria, subcategoria, nome, origem].join(' ');

  // Eixo temático → peso 0.5
  const eixo = categoria as keyof typeof EIXO_PARA_ARTIGOS;
  if (EIXO_PARA_ARTIGOS[eixo]) {
    EIXO_PARA_ARTIGOS[eixo].forEach(a => {
      if (!matches.has(a)) matches.set(a, { artigo: a, quality: 'eixo', weight: 0.5 });
    });
  }

  // Keywords → peso 1.0 (sobrescreve eixo se ambos matcham)
  const keywordRules: [RegExp, ArtigoConvencao[]][] = [
    [/seguran|viol[êe]ncia|homic|letal|pris/, ['V', 'VI']],
    [/educa|ensino|escolar|analfabet/, ['V', 'VII']],
    [/sa[úu]de|materna|covid|hospital/, ['V']],
    [/trabalho|renda|desemprego|pobreza|moradia|habita/, ['V']],
    [/quilomb|ind[ií]gena|indigena|territ[óo]rio|favela|aglomerado/, ['III', 'V']],
    [/racismo|discrimin|igualdade|ação afirmativa|acao afirmativa|dados|estat[íi]st/, ['I', 'II']],
    [/[óo]dio|propaganda.*racis|extremism|neonazi|supremaci|incita[çc]|tipifica[çc]|inj[úu]ria.*racial|crime.*racial|discurso.*[óo]dio/, ['IV']],
    [/justi[çc]a|judici|repara/, ['VI']],
    [/cultura|patrim|lei 10.639|curr[ií]culo/, ['VII']],
  ];

  for (const [regex, artigos] of keywordRules) {
    if (regex.test(texto)) {
      artigos.forEach(a => {
        matches.set(a as ArtigoConvencao, { artigo: a as ArtigoConvencao, quality: 'keyword', weight: 1.0 });
      });
    }
  }

  return [...matches.values()];
}

/** Retorna artigos simples (compatibilidade) */
export function inferArtigosIndicador(ind: any): ArtigoConvencao[] {
  return inferArtigosWithQuality(ind).map(m => m.artigo);
}
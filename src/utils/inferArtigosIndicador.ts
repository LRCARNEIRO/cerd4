import { EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';

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

export function inferArtigosIndicador(ind: any): ArtigoConvencao[] {
  const explicit = (ind.artigos_convencao || []).filter((a: string) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].includes(a)) as ArtigoConvencao[];
  if (explicit.length > 0) return explicit;

  const arts = new Set<ArtigoConvencao>();
  const categoria = String(ind.categoria || '').toLowerCase();
  const subcategoria = String(ind.subcategoria || '').toLowerCase();
  const nome = String(ind.nome || '').toLowerCase();
  const origem = Array.isArray(ind.documento_origem) ? ind.documento_origem.join(' ').toLowerCase() : '';
  const texto = [categoria, subcategoria, nome, origem].join(' ');

  const eixo = categoria as keyof typeof EIXO_PARA_ARTIGOS;
  if (EIXO_PARA_ARTIGOS[eixo]) {
    EIXO_PARA_ARTIGOS[eixo].forEach((a) => arts.add(a));
  }

  if (/seguran|viol[êe]ncia|homic|letal|pris/.test(texto)) { arts.add('V'); arts.add('VI'); }
  if (/educa|ensino|escolar|analfabet/.test(texto)) { arts.add('V'); arts.add('VII'); }
  if (/sa[úu]de|materna|covid|hospital/.test(texto)) arts.add('V');
  if (/trabalho|renda|desemprego|pobreza|moradia|habita/.test(texto)) arts.add('V');
  if (/quilomb|ind[ií]gena|indigena|territ[óo]rio|favela|aglomerado/.test(texto)) { arts.add('III'); arts.add('V'); }
  if (/racismo|discrimin|igualdade|ação afirmativa|acao afirmativa|dados|estat[íi]st/.test(texto)) { arts.add('I'); arts.add('II'); }
  if (/[óo]dio|propaganda.*racis|extremism|neonazi|supremaci|incita[çc]|tipifica[çc]|inj[úu]ria.*racial|crime.*racial|discurso.*[óo]dio/.test(texto)) arts.add('IV');
  if (/justi[çc]a|judici|repara/.test(texto)) arts.add('VI');
  if (/cultura|patrim|lei 10.639|curr[ií]culo/.test(texto)) arts.add('VII');

  return [...arts];
}
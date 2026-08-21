/**
 * orcamentoCanonico.ts — Deduplicação lógica (camada de leitura) da base orçamentária.
 *
 * A base bruta permanece intacta: cada camada de captura mantém sua motivação.
 * Esta camada elege UM registro canônico por (programa/ação + ano + esfera) para
 * que somatórios, cards, vinculação de evidências e relatórios não contem duas
 * vezes a mesma execução orçamentária.
 *
 * Ranking de fontes (menor = mais confiável):
 *  1. API Portal da Transparência — ação específica
 *  2. Programa Temático PPA
 *  3. Captura por órgão / keyword (MIR, MPI, SESAI, FUNAI, INCRA) e SIOP
 *  4. Subfunção 422 (genérica)
 *  5. Agenda Transversal (usada só quando é a única cobertura do grupo)
 */

export interface OrcamentoDedupBase {
  id?: string;
  programa: string;
  ano: number;
  esfera?: string | null;
  fonte_dados?: string | null;
  pago?: number | null;
  dotacao_autorizada?: number | null;
  url_fonte?: string | null;
}

export type Canonizado<T> = T & { is_canonico: boolean; duplicado_de: string | null };

const norm = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();

/** Código do programa + código da ação (quando houver), normalizados. */
export function chaveCanonica(r: OrcamentoDedupBase): string {
  const prog = norm(r.programa || '');
  const partes = prog.split(/\s+\/\s+/);
  const codPrograma = (partes[0].match(/^([0-9A-Z]{4})\b/) || [, partes[0]])[1];
  const acaoRaw = partes[1] || '';
  const codAcao = (acaoRaw.match(/^([0-9A-Z]{4})\b/) || [, acaoRaw])[1] || '';
  const esfera = (r.esfera || 'federal').toLowerCase();
  return `${codPrograma}|${codAcao}|${r.ano}|${esfera}`;
}

export function rankFonte(fonte?: string | null): number {
  const f = norm(fonte || '');
  if (f.includes('AGENDA TRANSVERSAL')) return 5;
  if (f.includes('SUBFUNCAO 422')) return 4;
  if (f.includes('ACAO ')) return 1;
  if (f.includes('PROGRAMA TEMATICO PPA')) return 2;
  if (f.includes('KEYWORD-FIRST') || f.includes('SIOP') || f.includes('MEDIDA PROVISORIA')) return 3;
  return 6;
}

function melhor<T extends OrcamentoDedupBase>(a: T, b: T): T {
  const ra = rankFonte(a.fonte_dados);
  const rb = rankFonte(b.fonte_dados);
  if (ra !== rb) return ra < rb ? a : b;
  const pa = Number(a.pago) || 0;
  const pb = Number(b.pago) || 0;
  if ((pa > 0) !== (pb > 0)) return pa > 0 ? a : b;
  const ua = a.url_fonte ? 1 : 0;
  const ub = b.url_fonte ? 1 : 0;
  if (ua !== ub) return ua > ub ? a : b;
  if (pa !== pb) return pa > pb ? a : b;
  return (a.id || '') <= (b.id || '') ? a : b;
}

export interface DedupResultado<T> {
  canonico: T[];
  anotados: Canonizado<T>[];
  suprimidos: number;
  valorSuprimido: number;
}

/** Aplica a deduplicação lógica. Não altera a base — apenas classifica. */
export function dedupOrcamento<T extends OrcamentoDedupBase>(rows: T[] | null | undefined): DedupResultado<T> {
  const lista = rows || [];
  const grupos = new Map<string, T[]>();
  lista.forEach(r => {
    const k = chaveCanonica(r);
    const g = grupos.get(k);
    if (g) g.push(r); else grupos.set(k, [r]);
  });

  const vencedores = new Map<string, T>();
  grupos.forEach((g, k) => vencedores.set(k, g.reduce(melhor)));

  const anotados: Canonizado<T>[] = lista.map(r => {
    const k = chaveCanonica(r);
    const v = vencedores.get(k)!;
    const ehCanonico = v === r;
    return { ...r, is_canonico: ehCanonico, duplicado_de: ehCanonico ? null : (v.id || k) };
  });

  const valorTotal = lista.reduce((s, r) => s + (Number(r.pago) || Number(r.dotacao_autorizada) || 0), 0);
  const valorCanonico = Array.from(vencedores.values())
    .reduce((s, r) => s + (Number(r.pago) || Number(r.dotacao_autorizada) || 0), 0);

  return {
    canonico: Array.from(vencedores.values()),
    anotados,
    suprimidos: lista.length - vencedores.size,
    valorSuprimido: valorTotal - valorCanonico,
  };
}

export const LEGENDA_DEDUP =
  'Deduplicação lógica: um registro por programa/ação + ano + esfera. ' +
  'Ranking de fontes: (1) API Portal da Transparência — ação específica, (2) Programa Temático PPA, ' +
  '(3) captura por órgão/keyword e SIOP, (4) subfunção 422, (5) Agenda Transversal. ' +
  'Registros duplicados permanecem visíveis na listagem, mas não são somados.';

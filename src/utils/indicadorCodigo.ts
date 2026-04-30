/**
 * indicadorCodigo.ts — Geração estável do código curto IND-NNN para cada
 * indicador, baseada em (created_at ASC, id ASC).
 *
 * Por que existir:
 *  - O `id` UUID dos indicadores é invisível ao usuário e impede citação
 *    rápida em relatórios/PDFs.
 *  - O nome muda com correções ortográficas/abreviações, então não serve
 *    como âncora estável.
 *
 * Regras:
 *  - Numeração contínua começando em IND-001.
 *  - Padding mínimo de 3 dígitos; cresce automaticamente se houver ≥1000.
 *  - Ordenação determinística: created_at ASC, id ASC (tiebreaker).
 *  - Indicadores novos entram sempre no FIM (IND-NNN+1) — códigos antigos
 *    nunca renumeram.
 *
 * Uso:
 *   const codigos = buildIndicadorCodigoMap(rawIndicadores);
 *   codigos.get(indicadorId) // → 'IND-042'
 *   parseIndicadorCodigo('IND-042') // → 42
 */

export interface IndicadorCodigoSource {
  id: string;
  created_at?: string | null;
}

/**
 * Constrói Map<id, codigo> ordenando por (created_at, id).
 * Aceita lista parcial — se passada apenas uma fatia, os códigos refletem
 * a posição DENTRO da fatia. Para códigos canônicos use o hook
 * `useIndicadorCodigos` que busca TODOS os indicadores.
 */
export function buildIndicadorCodigoMap<T extends IndicadorCodigoSource>(
  indicadores: T[],
): Map<string, string> {
  const sorted = [...indicadores].sort((a, b) => {
    const ta = a.created_at ? Date.parse(a.created_at) : 0;
    const tb = b.created_at ? Date.parse(b.created_at) : 0;
    if (ta !== tb) return ta - tb;
    return a.id.localeCompare(b.id);
  });
  const total = sorted.length;
  const padLen = Math.max(3, String(total).length);
  const map = new Map<string, string>();
  sorted.forEach((ind, idx) => {
    const n = (idx + 1).toString().padStart(padLen, '0');
    map.set(ind.id, `IND-${n}`);
  });
  return map;
}

/**
 * Inversa: Map<codigo, id> para resolver deep-links que vêm com o código.
 */
export function buildCodigoToIdMap<T extends IndicadorCodigoSource>(
  indicadores: T[],
): Map<string, string> {
  const codigos = buildIndicadorCodigoMap(indicadores);
  const inv = new Map<string, string>();
  codigos.forEach((codigo, id) => inv.set(codigo, id));
  return inv;
}

/**
 * Faz parse de uma string que pode ser código (IND-042), só número (042 / 42)
 * ou nada — retorna o código canônico normalizado ou null.
 */
export function normalizeCodigoInput(input: string | null | undefined): string | null {
  if (!input) return null;
  const t = input.trim().toUpperCase();
  // IND-042, IND042, ID 042, indicador 042.
  let m = t.match(/^(?:IND|ID|INDICADOR)[\s#:-]?(\d{1,6})$/);
  if (m) return `IND-${m[1].padStart(3, '0')}`;
  // só número (precedido ou não de #)
  m = t.match(/^#?(\d{1,6})$/);
  if (m) return `IND-${m[1].padStart(3, '0')}`;
  return null;
}

export function parseIndicadorCodigo(codigo: string): number | null {
  const m = codigo.match(/^IND-(\d+)$/);
  return m ? parseInt(m[1], 10) : null;
}

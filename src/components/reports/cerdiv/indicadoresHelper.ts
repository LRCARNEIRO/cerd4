/**
 * indicadoresHelper.ts — Renderização SSoT de parágrafos narrativos
 * baseados em `indicadores_interseccionais`.
 *
 * Regra: Nenhum número estatístico aparece hardcoded no relatório.
 * Cada parágrafo consulta a base via matcher (nome/categoria/subcategoria);
 * se o indicador não existir na base, o parágrafo é OMITIDO inteiramente
 * (não há disclaimers — preferimos silêncio à fabricação).
 */

import type { IndicadorInterseccional } from '@/hooks/useLacunasData';

type Ind = IndicadorInterseccional;

/**
 * Procura o primeiro indicador cujo nome/subcategoria/categoria contém
 * todos os tokens informados (case-insensitive).
 */
export function findIndicador(
  indicadores: Ind[] | undefined | null,
  tokens: string[],
  categoria?: string,
): Ind | undefined {
  if (!indicadores?.length) return undefined;
  const lower = (s: unknown) => String(s || '').toLowerCase();
  const matchAll = (haystack: string) => tokens.every((t) => haystack.includes(t.toLowerCase()));
  return indicadores.find((i) => {
    if (categoria && lower(i.categoria) !== categoria.toLowerCase()) return false;
    const blob = `${lower(i.nome)} ${lower(i.subcategoria)} ${lower(i.categoria)}`;
    return matchAll(blob);
  });
}

/** Extrai um valor numérico de um caminho aninhado em dados JSONB. */
export function pickNum(obj: any, path: (string | number)[]): number | undefined {
  let cur = obj;
  for (const k of path) {
    if (cur == null) return undefined;
    cur = cur[k as any];
  }
  const n = Number(cur);
  return Number.isFinite(n) ? n : undefined;
}

/** Renderiza fonte com link, se existir. */
export function fonteLink(ind: Ind | undefined): string {
  if (!ind) return '';
  const url = (ind as any).url_fonte;
  const fonte = ind.fonte || '';
  if (!fonte) return '';
  if (url) return `<span style="font-size:8.5pt;color:#64748b">(Fonte: <a href="${url}" target="_blank">${escapeHtml(fonte)}</a>)</span>`;
  return `<span style="font-size:8.5pt;color:#64748b">(Fonte: ${escapeHtml(fonte)})</span>`;
}

function escapeHtml(s: string): string {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

/**
 * evidenceLinks — resolve links clicáveis de LASTRO para os textos analíticos
 * de Produtos/Conclusões.
 *
 * Regra: nenhum número ou afirmação nos textos de Conclusões/Produtos deve
 * existir sem apontar para a evidência que o sustenta em uma das 3 bases
 * (Estatística, Orçamentária, Normativa). As bases NUNCA são alteradas por
 * aqui — este módulo apenas monta o endereço de leitura.
 */
import { abasDoIndicador } from './indicadorLocator';

export type BaseLastro = 'estatistica' | 'orcamentaria' | 'normativa';

export interface LastroEvidencia {
  base: BaseLastro;
  rotulo: string;
  href: string;
}

const codigoDe = (i: any) => String(i?.codigo_curto || i?.codigo || '').toUpperCase();

/** Link direto para o card auditado do indicador na aba temática. */
export function hrefIndicador(codigo: string, indicadores?: any[] | null): string {
  const cod = String(codigo || '').toUpperCase();
  if (!cod) return '/busca';
  const rec = (indicadores || []).find((i) => codigoDe(i) === cod);
  const aba = rec
    ? abasDoIndicador(rec.categoria, rec.subcategoria, rec.nome, undefined, cod)[0]
    : undefined;
  if (aba) {
    const sub = (aba as any).subTab ? `&sub=${(aba as any).subTab}` : '';
    return `/estatisticas?tab=${aba.tabValue}${sub}&ind=${encodeURIComponent(cod)}#ind-${cod}`;
  }
  return `/busca?q=${encodeURIComponent(cod)}`;
}

/** Link para a Base Orçamentária (opcionalmente com termo de busca). */
export function hrefOrcamento(termo?: string): string {
  return termo ? `/busca?q=${encodeURIComponent(termo)}` : '/orcamento';
}

/** Link para a Base Normativa (opcionalmente com termo de busca). */
export function hrefNormativo(termo?: string): string {
  return termo ? `/busca?q=${encodeURIComponent(termo)}` : '/normativa';
}

/** Monta a lista de lastros de um trecho a partir de códigos IND e bases extras. */
export function montarLastros(opts: {
  codigos?: string[] | null;
  indicadores?: any[] | null;
  orcamento?: string[] | null;
  normativos?: string[] | null;
}): LastroEvidencia[] {
  const out: LastroEvidencia[] = [];
  (opts.codigos || []).forEach((c) => {
    const cod = String(c || '').toUpperCase();
    if (!cod || out.some((l) => l.rotulo === cod)) return;
    out.push({ base: 'estatistica', rotulo: cod, href: hrefIndicador(cod, opts.indicadores) });
  });
  (opts.orcamento || []).forEach((t) => {
    if (out.some((l) => l.rotulo === t)) return;
    out.push({ base: 'orcamentaria', rotulo: t, href: hrefOrcamento(t) });
  });
  (opts.normativos || []).forEach((t) => {
    if (out.some((l) => l.rotulo === t)) return;
    out.push({ base: 'normativa', rotulo: t, href: hrefNormativo(t) });
  });
  return out;
}

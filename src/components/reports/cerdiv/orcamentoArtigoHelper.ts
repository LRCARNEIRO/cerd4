/**
 * orcamentoArtigoHelper.ts — Renderização SSoT do bloco de execução
 * orçamentária por Artigo ICERD para o Relatório CERD IV.
 *
 * Regra: nenhuma cifra hardcoded. Os totais são calculados em tempo real
 * a partir de `dados_orcamentarios` já filtrados por artigo (via
 * `inferArtigosOrcamento`). Se a base não trouxer execução vinculada,
 * o bloco é OMITIDO silenciosamente — sem disclaimers, sem fallbacks.
 */

import type { DadoOrcamentario } from '@/hooks/useLacunasData';
import { fmtBRL } from './chartUtils';

function num(v: unknown): number {
  const p = Number(v);
  return Number.isFinite(p) ? p : 0;
}

/**
 * Renderiza bloco compacto com totais de execução orçamentária
 * vinculados a um Artigo ICERD. Retorna '' se não houver dados.
 */
export function renderOrcamentoArtigoBlock(
  orcDados: DadoOrcamentario[] | undefined | null,
  artigo: string,
  paragrafo: string | number,
  contexto?: string,
): string {
  const dados = orcDados || [];
  if (dados.length === 0) return '';

  const dot = dados.reduce((s, o) => s + num(o.dotacao_autorizada), 0);
  const pago = dados.reduce((s, o) => s + num(o.pago), 0);
  if (dot <= 0 && pago <= 0) return '';

  const exec = dot > 0 ? (pago / dot * 100) : 0;
  const ctx = contexto ? `${contexto} ` : '';
  return `<p>${paragrafo}. ${ctx}Foram rastreadas <strong>${dados.length} ações orçamentárias</strong> com vínculo ao Artigo ${artigo}, totalizando ${fmtBRL(dot)} de dotação autorizada e ${fmtBRL(pago)} pagos (execução de ${exec.toFixed(1)}%). Detalhamento na Base Orçamentária do sistema.</p>`;
}

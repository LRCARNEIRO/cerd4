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
import { calcularExecucaoOrcamentaria } from '@/utils/orcamentoCanonico';

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
  const liquidado = dados.reduce((s, o) => s + num(o.liquidado), 0);
  const pago = dados.reduce((s, o) => s + num(o.pago), 0);
  if (dot <= 0 && liquidado <= 0 && pago <= 0) return '';

  const exec = calcularExecucaoOrcamentaria(dados).percentual;
  const ctx = contexto ? `${contexto} ` : '';
  return `<p>${paragrafo}. ${ctx}Foram rastreadas <strong>${dados.length} ações orçamentárias</strong> com vínculo ao Artigo ${artigo}, totalizando ${fmtBRL(dot)} de dotação autorizada, ${fmtBRL(liquidado)} liquidados e ${fmtBRL(pago)} pagos${exec !== null ? ` (execução de ${exec.toFixed(1)}%, por Liquidado ÷ Dotação Autorizada nas linhas LOA elegíveis)` : ''}. Detalhamento na Base Orçamentária do sistema.</p>`;
}

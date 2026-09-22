/**
 * METODOLOGIA v7 — Esforço Governamental × Impacto Evidenciado
 * ============================================================
 * Fonte: matriz relacional auditada (2.122 endereços Artigo × Recomendação ×
 * Evidência) sobre o inventário canônico de 514 evidências
 * (278 estatísticas · 204 orçamentárias · 32 normativas).
 *
 * ESFORÇO (0–100) — quanta evidência distinta foi efetivamente vinculada,
 * com teto por base (P75 da distribuição observada) e pesos iguais (1/3):
 *
 *   E = [100·min(nEst/31,1) + 100·min(nOrç/25,1) + 100·min(nNorm/4,1)] / 3
 *
 * REALIZAÇÃO (0–100) — quanto dessa resposta se converteu em resultado:
 *   • estatística  = % de indicadores com evolução não desfavorável
 *                    (melhorou ou estável = 1; piorou = 0), sobre os que têm
 *                    tendência mensurável (série histórica);
 *   • orçamentária = Σ Liquidado / Σ Dotação autorizada válida;
 *   • normativa    = 100 quando há norma vinculada; 0 quando não há.
 *
 *   R = (R_est + R_orç + R_norm) / 3
 *
 * IMPACTO EVIDENCIADO:  I = E × R / 100
 *
 * FAIXAS (25/60), iguais para Esforço e Impacto:
 *   Baixo < 25 | Intermediário 25–59,9 | Alto ≥ 60
 */
import { tendenciaPadraoDetalhada } from '@/utils/tendenciaPadronizada';

export const TETOS_ESFORCO = { estatistica: 31, orcamentaria: 25, normativa: 4 } as const;
export const CORTE_INTERMEDIARIO = 25;
export const CORTE_ALTO = 60;

export type Faixa = 'baixo' | 'intermediario' | 'alto';

export const FAIXA_LABEL: Record<Faixa, string> = {
  baixo: 'Baixo',
  intermediario: 'Intermediário',
  alto: 'Alto',
};

export function classificarFaixa(score: number): Faixa {
  if (score >= CORTE_ALTO) return 'alto';
  if (score >= CORTE_INTERMEDIARIO) return 'intermediario';
  return 'baixo';
}

/** Classes utilitárias (tokens semânticos) para as tags de Esforço/Impacto. */
export const FAIXA_CLASSE: Record<Faixa, string> = {
  alto: 'bg-success/15 text-success border-success/30',
  intermediario: 'bg-warning/15 text-warning border-warning/30',
  baixo: 'bg-destructive/15 text-destructive border-destructive/30',
};

export interface EsforcoImpactoEntrada {
  indicadores: { nome?: string | null; categoria?: string | null; dados?: any }[];
  orcamento: { dotacao_autorizada?: number | null; liquidado?: number | null }[];
  normativos: unknown[];
}

export interface EsforcoImpactoResultado {
  esforco: number;
  realizacao: number;
  impacto: number;
  faixaEsforco: Faixa;
  faixaImpacto: Faixa;
  componentes: {
    esforcoEstatistica: number;
    esforcoOrcamentaria: number;
    esforcoNormativa: number;
    realizacaoEstatistica: number;
    realizacaoOrcamentaria: number;
    realizacaoNormativa: number;
  };
  contagens: {
    estatistica: number;
    orcamentaria: number;
    normativa: number;
    comTendencia: number;
    favoraveis: number;
    desfavoraveis: number;
    dotacaoValida: number;
    liquidadoTotal: number;
  };
}

const arred = (n: number) => Math.round(n * 10) / 10;

export function computeEsforcoImpacto(entrada: EsforcoImpactoEntrada): EsforcoImpactoResultado {
  const nEst = entrada.indicadores.length;
  const nOrc = entrada.orcamento.length;
  const nNorm = entrada.normativos.length;

  const esforcoEstatistica = 100 * Math.min(nEst / TETOS_ESFORCO.estatistica, 1);
  const esforcoOrcamentaria = 100 * Math.min(nOrc / TETOS_ESFORCO.orcamentaria, 1);
  const esforcoNormativa = 100 * Math.min(nNorm / TETOS_ESFORCO.normativa, 1);
  const esforco = (esforcoEstatistica + esforcoOrcamentaria + esforcoNormativa) / 3;

  // ── Realização estatística: melhorou + estável = 1; piorou = 0 ──
  let comTendencia = 0;
  let favoraveis = 0;
  let desfavoraveis = 0;
  for (const ind of entrada.indicadores) {
    const t = tendenciaPadraoDetalhada(ind).tendencia;
    if (!t) continue;
    comTendencia++;
    if (t === 'piorou') desfavoraveis++;
    else favoraveis++;
  }
  const realizacaoEstatistica = comTendencia > 0 ? (favoraveis / comTendencia) * 100 : 0;

  // ── Realização orçamentária: Σ Liquidado / Σ Dotação autorizada válida ──
  let dotacaoValida = 0;
  let liquidadoTotal = 0;
  for (const o of entrada.orcamento) {
    const dot = Number(o.dotacao_autorizada) || 0;
    if (dot <= 0) continue;
    dotacaoValida += dot;
    liquidadoTotal += Number(o.liquidado) || 0;
  }
  const realizacaoOrcamentaria = dotacaoValida > 0
    ? Math.max(0, Math.min(100, (liquidadoTotal / dotacaoValida) * 100))
    : 0;

  // ── Realização normativa: presença ──
  const realizacaoNormativa = nNorm > 0 ? 100 : 0;

  const realizacao = (realizacaoEstatistica + realizacaoOrcamentaria + realizacaoNormativa) / 3;
  const impacto = (esforco * realizacao) / 100;

  return {
    esforco: arred(esforco),
    realizacao: arred(realizacao),
    impacto: arred(impacto),
    faixaEsforco: classificarFaixa(esforco),
    faixaImpacto: classificarFaixa(impacto),
    componentes: {
      esforcoEstatistica: arred(esforcoEstatistica),
      esforcoOrcamentaria: arred(esforcoOrcamentaria),
      esforcoNormativa: arred(esforcoNormativa),
      realizacaoEstatistica: arred(realizacaoEstatistica),
      realizacaoOrcamentaria: arred(realizacaoOrcamentaria),
      realizacaoNormativa: arred(realizacaoNormativa),
    },
    contagens: {
      estatistica: nEst,
      orcamentaria: nOrc,
      normativa: nNorm,
      comTendencia,
      favoraveis,
      desfavoraveis,
      dotacaoValida,
      liquidadoTotal,
    },
  };
}

/** Média simples de scores (usada na agregação por Artigo da ICERD). */
export function mediaSimples(valores: number[]): number {
  if (valores.length === 0) return 0;
  return arred(valores.reduce((s, v) => s + v, 0) / valores.length);
}

export function formatScore(n: number): string {
  return n.toFixed(1).replace('.', ',');
}

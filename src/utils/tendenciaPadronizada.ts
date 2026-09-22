/**
 * Tendência canônica e padronizada dos indicadores estatísticos.
 *
 * Regra única (vale para cards, relatórios de Artigos/Recomendações e inventário):
 *  - só existe tendência quando há SÉRIE HISTÓRICA (dois anos medidos distintos);
 *  - a leitura respeita a POLARIDADE do indicador (menor é melhor × maior é melhor);
 *  - vocabulário fixo: "melhorou" | "estável" | "piorou";
 *  - sem série histórica => null (dado único / sem valores comparáveis).
 *
 * Qualquer rótulo gravado no banco (crescente, decrescente, piora, aumento,
 * sub-registro...) é ignorado: a tendência é sempre recalculada a partir dos dados.
 */
import { extractSerieSub } from '@/utils/indicadorDadoUnico';
import { isLowerBetterNome } from '@/utils/indicadorPolaridade';

export type TendenciaPadrao = 'melhorou' | 'estável' | 'piorou' | null;

export interface TendenciaDetalhe {
  tendencia: TendenciaPadrao;
  base: string;
  temSerie: boolean;
  anoAntigo?: string | number;
  anoRecente?: string | number;
  valorAntigo?: number;
  valorRecente?: number;
}

export function tendenciaPadraoDetalhada(ind: {
  nome?: string | null;
  categoria?: string | null;
  dados?: any;
  /** recorte (subindicador) dentro de um registro guarda-chuva */
  sub?: string | null;
}): TendenciaDetalhe {
  const nome = ind?.nome || '';
  const serie: any = extractSerieSub(ind?.dados, ind?.sub ?? undefined, nome);
  let vAnt = serie?.valorAntigo as number | undefined;
  let vRec = serie?.valorRecente as number | undefined;
  let aAnt = serie?.anoAntigo as string | number | undefined;
  let aRec = serie?.anoRecente as string | number | undefined;
  const rot = serie?.rotulo as string | undefined;

  const raw = ind?.dados?.series;
  if (rot && raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const pts = Object.entries(raw)
      .filter(([ano, v]: any) => /^(19|20)\d{2}$/.test(ano) && v && typeof v === 'object' && typeof (v as any)[rot] === 'number')
      .map(([ano, v]: any) => [ano, (v as any)[rot] as number] as [string, number])
      .sort((a, b) => a[0].localeCompare(b[0]));
    if (pts.length >= 2) {
      [aAnt, vAnt] = pts[0];
      [aRec, vRec] = pts[pts.length - 1];
    }
  }

  const temSerie = typeof vAnt === 'number' && typeof vRec === 'number' && String(aAnt) !== String(aRec);
  if (!temSerie) {
    return { tendencia: null, base: 'sem série histórica (ano único ou sem valores comparáveis)', temSerie: false };
  }

  const menorMelhor = isLowerBetterNome(nome, ind?.categoria || undefined);
  const delta = (vRec as number) - (vAnt as number);
  const tendencia: TendenciaPadrao =
    Math.abs(delta) < 1e-9 ? 'estável' : (delta < 0) === menorMelhor ? 'melhorou' : 'piorou';

  return {
    tendencia,
    temSerie: true,
    anoAntigo: aAnt,
    anoRecente: aRec,
    valorAntigo: vAnt,
    valorRecente: vRec,
    base: `${rot || nome}: ${vAnt} (${aAnt}) → ${vRec} (${aRec}); variação ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}; ${menorMelhor ? 'menor é melhor' : 'maior é melhor'}`,
  };
}

export function tendenciaPadrao(ind: { nome?: string | null; categoria?: string | null; dados?: any; sub?: string | null }): TendenciaPadrao {
  return tendenciaPadraoDetalhada(ind).tendencia;
}

/** Rótulo único exibido quando o indicador não tem dois anos medidos. */
export const TENDENCIA_SEM_SERIE = 'sem série histórica';

/** Vocabulário fixo exibido em telas e relatórios. */
export function tendenciaLabelFrom(t: TendenciaPadrao): string {
  return t ?? TENDENCIA_SEM_SERIE;
}

/** Recalcula pelos dados e devolve o rótulo padronizado (nunca texto gravado). */
export function tendenciaLabel(ind: { nome?: string | null; categoria?: string | null; dados?: any; sub?: string | null }): string {
  return tendenciaLabelFrom(tendenciaPadrao(ind));
}

/** Sinal visual associado (↑ favorável, → manutenção, ↓ desfavorável). */
export function tendenciaSeta(t: TendenciaPadrao): string {
  return t === 'melhorou' ? '↑' : t === 'piorou' ? '↓' : t === 'estável' ? '→' : '—';
}

/** Classe de cor semântica para badges. */
export function tendenciaCorClasse(t: TendenciaPadrao): string {
  return t === 'melhorou' ? 'text-success' : t === 'piorou' ? 'text-destructive' : 'text-muted-foreground';
}

/** Substitui o campo `tendencia` de cada registro pelo valor padronizado. */
export function withTendenciaPadrao<T extends { nome?: string | null; categoria?: string | null; dados?: any }>(
  rows: T[] | null | undefined,
): T[] {
  return (rows || []).map((r) => ({ ...r, tendencia: tendenciaPadrao(r) }) as T);
}

import type { OrcamentoDedupBase } from '@/utils/orcamentoCanonico';

export interface DashboardBudgetYear {
  ano: number;
  autorizado: number;
  empenhado: number;
  liquidado: number;
  pago: number;
}

/** Presentation-only split of the canonical inventory; never mix extra-LOA payments with LOA execution. */
export function dashboardBudgetSeries(rows: (OrcamentoDedupBase & { empenhado?: number | null })[]) {
  const loa = new Map<number, DashboardBudgetYear>();
  const extra = new Map<number, DashboardBudgetYear>();
  const num = (v: unknown) => Number.isFinite(Number(v)) ? Number(v) : 0;
  for (const row of rows) {
    const isExtra = row.tipo_dotacao === 'extraorcamentario';
    const group = isExtra ? extra : loa;
    const year = group.get(row.ano) ?? { ano: row.ano, autorizado: 0, empenhado: 0, liquidado: 0, pago: 0 };
    year.pago += num(row.pago);
    if (!isExtra) {
      year.autorizado += num(row.dotacao_autorizada);
      year.empenhado += num(row.empenhado);
      year.liquidado += num(row.liquidado);
    }
    group.set(row.ano, year);
  }
  const sorted = (group: Map<number, DashboardBudgetYear>) => [...group.values()].sort((a, b) => a.ano - b.ano);
  return { orcamentario: sorted(loa), extraorcamentario: sorted(extra) };
}
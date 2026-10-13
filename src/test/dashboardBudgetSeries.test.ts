import { describe, expect, it } from 'vitest';
import { dashboardBudgetSeries } from '@/utils/dashboardBudgetSeries';

describe('Painel Geral — séries orçamentárias', () => {
  it('separates extra-LOA payments and keeps all four LOA amounts without fallbacks', () => {
    const result = dashboardBudgetSeries([
      { programa: 'A', ano: 2024, dotacao_autorizada: 100, empenhado: 90, liquidado: 70, pago: 60 },
      { programa: 'B', ano: 2024, dotacao_autorizada: 20, empenhado: 15, liquidado: 10, pago: 0 },
      { programa: 'C', ano: 2024, tipo_dotacao: 'extraorcamentario', dotacao_autorizada: 500, liquidado: 200, pago: 40 },
      { programa: 'D', ano: 2020, tipo_dotacao: 'extraorcamentario', pago: 0 },
    ]);
    expect(result.orcamentario).toEqual([{ ano: 2024, autorizado: 120, empenhado: 105, liquidado: 80, pago: 60 }]);
    expect(result.extraorcamentario).toEqual([
      { ano: 2020, autorizado: 0, empenhado: 0, liquidado: 0, pago: 0 },
      { ano: 2024, autorizado: 0, empenhado: 0, liquidado: 0, pago: 40 },
    ]);
  });
  it('handles empty input and invalid numeric values', () => {
    expect(dashboardBudgetSeries([])).toEqual({ orcamentario: [], extraorcamentario: [] });
    expect(dashboardBudgetSeries([{ programa: 'A', ano: 2023, pago: NaN, liquidado: null }]).orcamentario[0].pago).toBe(0);
  });
});
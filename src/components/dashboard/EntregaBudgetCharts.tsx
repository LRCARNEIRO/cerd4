import { useMemo } from 'react';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { useOrcamentoCanonico } from '@/hooks/useLacunasData';
import { dashboardBudgetSeries } from '@/utils/dashboardBudgetSeries';

/** Mesmos gráficos do Painel Geral, exibidos como subaba da Base Orçamentária na entrega. */
export function EntregaBudgetCharts() {
  const { data } = useOrcamentoCanonico();
  const s = useMemo(() => dashboardBudgetSeries(data), [data]);
  return <BudgetChart data={s.orcamentario} extraData={s.extraorcamentario} />;
}

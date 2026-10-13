import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ExternalLink, FileText } from 'lucide-react';
import type { DashboardBudgetYear } from '@/utils/dashboardBudgetSeries';

interface BudgetChartProps {
  data: DashboardBudgetYear[];
  extraData: DashboardBudgetYear[];
}

export function BudgetChart({ data, extraData }: BudgetChartProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <div className="data-card h-full">
      <h3 className="font-semibold text-foreground mb-4">Execução Orçamentária - Políticas Raciais</h3>
      <h4 className="text-sm font-medium mb-2">Orçamentários — LOA</h4>
      <div className="h-80">
        {data.length > 0 ? <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="ano" 
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
            />
            <YAxis 
              tickFormatter={formatCurrency}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              axisLine={{ stroke: 'hsl(var(--border))' }}
              width={70}
            />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Legend
              verticalAlign="top"
              height={54}
              formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
            />
            <Bar dataKey="autorizado" name="Autorizado" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="empenhado" name="Empenhado" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="liquidado" name="Liquidado" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            <Bar dataKey="pago" name="Pago" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer> : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Dados orçamentários indisponíveis.
          </div>
        )}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">
        Percentual de execução = Σ Liquidado ÷ Σ Dotação Autorizada, somente nas linhas LOA com dotação positiva. Pago representa o desembolso.
      </p>
      <h4 className="text-sm font-medium mt-6 mb-2">Extraorçamentários — desembolsos pagos</h4>
      <div className="h-56">
        {extraData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={extraData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="ano" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--border))' }} />
              <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={{ stroke: 'hsl(var(--border))' }} width={70} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} labelStyle={{ color: 'hsl(var(--foreground))' }} />
              <Legend verticalAlign="top" height={36} formatter={(value) => <span className="text-xs text-foreground">{value}</span>} />
              <Bar dataKey="pago" name="Pago extraorçamentário" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        ) : <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sem registros extraorçamentários.</div>}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">Registros extraorçamentários não compõem o percentual de execução LOA.</p>
      <div className="mt-3 pt-2 border-t border-border/50 space-y-1">
        <p className="text-[10px] text-muted-foreground">
          Base canônica: registros Ação × Ano, após deduplicação lógica e separação por tipo de dotação. Valores incluem SESAI e não usam dados simulados.
        </p>
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <FileText className="w-3 h-3" /> <strong>Fontes:</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          <a href="https://www.siop.planejamento.gov.br/siop/" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
            <ExternalLink className="w-2.5 h-2.5" /> SIOP — Execução Orçamentária
          </a>
          <a href="https://portaldatransparencia.gov.br/funcoes/14-Direitos-da-Cidadania" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
            <ExternalLink className="w-2.5 h-2.5" /> Portal da Transparência — Função 14
          </a>
          <a href="https://www.tesourotransparente.gov.br/visualizacao/painel-de-monitoramento-dos-gastos-com-covid-19" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
            <ExternalLink className="w-2.5 h-2.5" /> Tesouro Transparente
          </a>
        </div>
      </div>
    </div>
  );
}

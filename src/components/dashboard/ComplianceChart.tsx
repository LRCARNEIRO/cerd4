import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ComplianceChartProps {
  data: {
    cumprido: number;
    parcial: number;
    naoCumprido: number;
    retrocesso?: number;
  };
}

export function ComplianceChart({ data }: ComplianceChartProps) {
  const chartData = [
    { name: 'Cumprido', value: data.cumprido, color: 'hsl(145, 55%, 32%)' },
    { name: 'Parcial', value: data.parcial, color: 'hsl(45, 93%, 47%)' },
    { name: 'Não Cumprido', value: data.naoCumprido, color: 'hsl(0, 72%, 50%)' },
    ...(data.retrocesso ? [{ name: 'Retrocesso', value: data.retrocesso, color: 'hsl(340, 70%, 50%)' }] : [])
  ].filter(item => item.value > 0);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="data-card h-full">
      <h3 className="font-semibold text-foreground mb-4">Status das Recomendações</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(0)}%)`, 'Quantidade']}
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          Total de {total} recomendações analisadas
        </p>
      </div>
    </div>
  );
}

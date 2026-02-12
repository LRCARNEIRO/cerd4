import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ExternalLink, FileText } from 'lucide-react';

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
      <div className="mt-3 pt-2 border-t border-border/50 space-y-1">
        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
          <FileText className="w-3 h-3" /> <strong>Fontes:</strong>
        </p>
        <div className="flex flex-wrap gap-2">
          <a href="https://tbinternet.ohchr.org/_layouts/15/treatybodyexternal/Download.aspx?symbolno=CERD%2FC%2FBRA%2FCO%2F18-20&Lang=en" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
            <ExternalLink className="w-2.5 h-2.5" /> CERD/C/BRA/CO/18-20
          </a>
          <a href="https://tbinternet.ohchr.org/_layouts/15/TreatyBodyExternal/countries.aspx?CountryCode=BRA&Lang=EN" target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5">
            <ExternalLink className="w-2.5 h-2.5" /> OHCHR — Brasil
          </a>
        </div>
      </div>
    </div>
  );
}

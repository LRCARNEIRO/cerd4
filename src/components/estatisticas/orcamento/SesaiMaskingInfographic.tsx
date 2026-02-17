import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, ComposedChart, Area,
} from 'recharts';
import { Eye, EyeOff, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

interface SesaiMaskingProps {
  porAnoDetalhado: Record<number, { pago: number; liquidado: number; dotacao: number }>;
  semSesaiPorAnoDetalhado: Record<number, { pago: number; liquidado: number; dotacao: number }>;
  formatCurrency: (v: number) => string;
  formatCurrencyFull: (v: number) => string;
}

export function SesaiMaskingInfographic({ porAnoDetalhado, semSesaiPorAnoDetalhado, formatCurrency, formatCurrencyFull }: SesaiMaskingProps) {
  // Build year-by-year data with SESAI vs Non-SESAI breakdown
  const anos = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

  const stackedData = anos.map(ano => {
    const total = porAnoDetalhado[ano]?.pago || 0;
    const semSesai = semSesaiPorAnoDetalhado[ano]?.pago || 0;
    const sesai = total - semSesai;
    const pctSesai = total > 0 ? (sesai / total * 100) : 0;
    return { ano, sesai, semSesai, total, pctSesai };
  });

  // Período summaries
  const p1SemSesai = stackedData.filter(d => d.ano >= 2018 && d.ano <= 2022).reduce((s, d) => s + d.semSesai, 0);
  const p2SemSesai = stackedData.filter(d => d.ano >= 2023 && d.ano <= 2025).reduce((s, d) => s + d.semSesai, 0);
  const varSemSesai = p1SemSesai > 0 ? ((p2SemSesai - p1SemSesai) / p1SemSesai * 100) : 0;

  const p1Total = stackedData.filter(d => d.ano >= 2018 && d.ano <= 2022).reduce((s, d) => s + d.total, 0);
  const p2Total = stackedData.filter(d => d.ano >= 2023 && d.ano <= 2025).reduce((s, d) => s + d.total, 0);
  const varTotal = p1Total > 0 ? ((p2Total - p1Total) / p1Total * 100) : 0;

  // Min/max for non-SESAI
  const minSemSesai = Math.min(...stackedData.map(d => d.semSesai));
  const maxSemSesai = Math.max(...stackedData.map(d => d.semSesai));
  const minAno = stackedData.find(d => d.semSesai === minSemSesai)?.ano || 0;
  const maxAno = stackedData.find(d => d.semSesai === maxSemSesai)?.ano || 0;

  return (
    <div className="space-y-6">
      {/* === HERO: O Efeito Mascaramento === */}
      <Card className="border-2 border-warning/50 bg-gradient-to-br from-warning/5 to-background">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-warning/20 rounded-xl shrink-0">
              <EyeOff className="w-8 h-8 text-warning" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-bold text-foreground">
                O Efeito Mascaramento da SESAI
              </h3>
              <p className="text-sm text-muted-foreground">
                A Saúde Indígena (SESAI) representou <strong className="text-foreground">~{stackedData[0]?.pctSesai.toFixed(0)}% do orçamento em {stackedData[0]?.ano}</strong> e
                ainda <strong className="text-foreground">~{stackedData[4]?.pctSesai.toFixed(0)}% em 2022</strong>.
                Seu crescimento orgânico contínuo <em>mascara completamente</em> o desmonte
                das demais políticas raciais entre 2019 e 2022.
              </p>

              {/* Visual comparison arrows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-chart-1" />
                    <p className="text-sm font-bold">Lente 1: Total (com SESAI)</p>
                  </div>
                  <p className="text-3xl font-black text-chart-1">
                    {varTotal >= 0 ? '+' : ''}{varTotal.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(p1Total)} → {formatCurrency(p2Total)}
                  </p>
                  <p className="text-[10px] text-muted-foreground italic">
                    "Crescimento moderado" — esconde a realidade
                  </p>
                </div>
                <div className="p-4 rounded-xl border-2 border-success bg-success/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <EyeOff className="w-5 h-5 text-success" />
                    <p className="text-sm font-bold">Lente 2: Sem SESAI (isolamento analítico)</p>
                  </div>
                  <p className="text-3xl font-black text-success">
                    {varSemSesai >= 0 ? '+' : ''}{varSemSesai.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(p1SemSesai)} → {formatCurrency(p2SemSesai)}
                  </p>
                  <p className="text-[10px] text-success font-medium italic">
                    Revela o desmonte real e a reconstrução exponencial
                  </p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-muted/60 rounded-lg border border-dashed">
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-warning shrink-0" />
                  <strong>A dualidade é uma ferramenta de transparência, não de exclusão.</strong>
                  {' '}A SESAI está integralmente incluída no Total. A perspectiva "sem SESAI" isola
                  as políticas não-saúde para dar visibilidade ao desmonte que seria invisível na lente total.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* === GRÁFICO 1: Barras Empilhadas — Composição do Orçamento === */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-chart-2 inline-block" />
            <span className="w-3 h-3 rounded-sm bg-chart-4 inline-block" />
            Composição Orçamentária: SESAI vs. Políticas Não-Saúde (Pago, R$)
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            A área azul (SESAI) domina os anos 2018–2022. A área verde (políticas raciais não-saúde) só se torna visível a partir de 2023.
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  formatter={(value: number, name: string) => [
                    formatCurrencyFull(value),
                    name === 'sesai' ? 'SESAI (Saúde Indígena)' : 'Políticas Não-Saúde'
                  ]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={36}
                  formatter={(value) => (
                    <span className="text-xs text-foreground">
                      {value === 'sesai' ? '🏥 SESAI (Saúde Indígena)' : '🎯 Políticas Não-Saúde'}
                    </span>
                  )}
                />
                <Bar dataKey="sesai" name="sesai" stackId="a" fill="hsl(var(--chart-2))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="semSesai" name="semSesai" stackId="a" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Annotations below chart */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-6">
              <span>2018–2022: SESAI = <strong className="text-foreground">{stackedData.slice(0, 5).reduce((s, d) => s + d.pctSesai, 0) / 5 > 0 ? (stackedData.slice(0, 5).reduce((s, d) => s + d.pctSesai, 0) / 5).toFixed(0) : '—'}% médio</strong></span>
              <ArrowRight className="w-3 h-3" />
              <span>2023–2025: SESAI = <strong className="text-foreground">{stackedData.slice(5).reduce((s, d) => s + d.pctSesai, 0) / 3 > 0 ? (stackedData.slice(5).reduce((s, d) => s + d.pctSesai, 0) / 3).toFixed(0) : '—'}% médio</strong></span>
            </div>
            <Badge variant="outline" className="text-[10px]">
              Queda da participação = crescimento das demais
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* === GRÁFICO 2: Linha da Proporção SESAI vs Não-SESAI === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">% da SESAI no Total — Tendência de Declínio</CardTitle>
            <p className="text-xs text-muted-foreground">A queda do % não indica corte na SESAI, mas crescimento exponencial das demais políticas.</p>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stackedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                  <YAxis
                    tick={{ fontSize: 10 }}
                    domain={[0, 100]}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, '% SESAI']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pctSesai"
                    name="% SESAI"
                    fill="hsl(var(--chart-2))"
                    fillOpacity={0.15}
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="pctSesai"
                    name="% SESAI"
                    stroke="hsl(var(--chart-2))"
                    strokeWidth={2.5}
                    dot={{ fill: 'hsl(var(--chart-2))', r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge className="bg-chart-2/20 text-chart-2 border-chart-2/30">
                {stackedData[0]?.pctSesai.toFixed(0)}% ({stackedData[0]?.ano})
              </Badge>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Badge className="bg-success/20 text-success border-success/30">
                {stackedData[stackedData.length - 1]?.pctSesai.toFixed(0)}% ({stackedData[stackedData.length - 1]?.ano})
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* === GRÁFICO 3: Evolução Isolada Sem SESAI (Efeito Desmonte) === */}
        <Card className="border-l-4 border-l-chart-4">
          <CardHeader>
            <CardTitle className="text-sm">Políticas Não-Saúde: Desmonte → Reconstrução (Pago, R$)</CardTitle>
            <p className="text-xs text-muted-foreground">A curva revela o que o total com SESAI esconde: colapso em 2021 e explosão a partir de 2023.</p>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stackedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrencyFull(value), 'Não-Saúde (Pago)']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="semSesai"
                    name="Sem SESAI"
                    fill="hsl(var(--chart-4))"
                    fillOpacity={0.2}
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="semSesai"
                    name="Sem SESAI"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2.5}
                    dot={{ fill: 'hsl(var(--chart-4))', r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="p-2 rounded bg-destructive/10">
                <p className="text-[10px] text-muted-foreground">Pior ano</p>
                <p className="text-sm font-bold text-destructive">{minAno}</p>
                <p className="text-[10px] text-muted-foreground">{formatCurrency(minSemSesai)}</p>
              </div>
              <div className="p-2 rounded bg-muted/50">
                <p className="text-[10px] text-muted-foreground">Multiplicador</p>
                <p className="text-sm font-bold text-foreground">
                  {minSemSesai > 0 ? (maxSemSesai / minSemSesai).toFixed(0) : '∞'}x
                </p>
                <p className="text-[10px] text-muted-foreground">pior → melhor</p>
              </div>
              <div className="p-2 rounded bg-success/10">
                <p className="text-[10px] text-muted-foreground">Melhor ano</p>
                <p className="text-sm font-bold text-success">{maxAno}</p>
                <p className="text-[10px] text-muted-foreground">{formatCurrency(maxSemSesai)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

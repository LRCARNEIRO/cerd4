import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ComposedChart, Line, Area,
} from 'recharts';
import { Landmark, Wallet, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';
import { AuditFooter } from '@/components/ui/audit-footer';

const FONTES = [
  { nome: 'Portal da Transparência — Despesas Federais', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' },
  { nome: 'Dados Abertos — LOA (dotação)', url: 'https://dados.gov.br/dados/conjuntos-dados/orcamento-despesa' },
];
const DOCS_REF = ['CERD/C/BRA/CO/18-20 §14', 'Plano de Durban §157-162'];

interface Props {
  orcPorAno: Record<number, { pago: number; liquidado: number; dotacao: number }>;
  extraPorAno: Record<number, { pago: number; liquidado: number; dotacao: number }>;
  totalPorAno: Record<number, { pago: number; liquidado: number; dotacao: number }>;
  orcTotal: number;
  extraTotal: number;
  formatCurrency: (v: number) => string;
  formatCurrencyFull: (v: number) => string;
}

export function ExtraorcamentarioMaskingInfographic({
  orcPorAno, extraPorAno, totalPorAno,
  orcTotal, extraTotal,
  formatCurrency, formatCurrencyFull,
}: Props) {
  const anos = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  const totalGeral = orcTotal + extraTotal;
  const pctExtra = totalGeral > 0 ? (extraTotal / totalGeral * 100) : 0;

  const stackedData = anos.map(ano => {
    const orc = orcPorAno[ano]?.pago || 0;
    const extra = extraPorAno[ano]?.pago || 0;
    const total = orc + extra;
    const pctExtraAno = total > 0 ? (extra / total * 100) : 0;
    return { ano, orc, extra, total, pctExtra: pctExtraAno };
  });

  const p1Orc = stackedData.filter(d => d.ano <= 2022).reduce((s, d) => s + d.orc, 0);
  const p2Orc = stackedData.filter(d => d.ano >= 2023).reduce((s, d) => s + d.orc, 0);
  const varOrc = p1Orc > 0 ? ((p2Orc - p1Orc) / p1Orc * 100) : 0;

  const p1Extra = stackedData.filter(d => d.ano <= 2022).reduce((s, d) => s + d.extra, 0);
  const p2Extra = stackedData.filter(d => d.ano >= 2023).reduce((s, d) => s + d.extra, 0);

  const p1Total = stackedData.filter(d => d.ano <= 2022).reduce((s, d) => s + d.total, 0);
  const p2Total = stackedData.filter(d => d.ano >= 2023).reduce((s, d) => s + d.total, 0);
  const varTotal = p1Total > 0 ? ((p2Total - p1Total) / p1Total * 100) : 0;

  return (
    <div className="space-y-6">
      {/* HERO */}
      <Card className="border-2 border-chart-3/50 bg-gradient-to-br from-chart-3/5 to-background">
        <CardContent className="pt-6 pb-5">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-chart-3/20 rounded-xl shrink-0">
              <Wallet className="w-8 h-8 text-chart-3" />
            </div>
            <div className="flex-1 space-y-3">
              <h3 className="text-lg font-bold text-foreground">
                Orçamentário vs. Extraorçamentário — Natureza do Financiamento
              </h3>
              <p className="text-sm text-muted-foreground">
                O financiamento extraorçamentário (compensações ambientais, royalties, indenizações)
                representa <strong className="text-foreground">~{pctExtra.toFixed(1)}% do total pago</strong>.
                Diferente do orçamentário (LOA), ele <em>não reflete decisão política de investimento</em> aprovada pelo Congresso.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="p-4 rounded-xl border bg-card space-y-2">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-primary" />
                    <p className="text-sm font-bold">Lente 1: Total (com Extraorçamentário)</p>
                  </div>
                  <p className="text-3xl font-black text-primary">
                    {varTotal >= 0 ? '+' : ''}{varTotal.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(p1Total)} → {formatCurrency(p2Total)}
                  </p>
                  <p className="text-[10px] text-muted-foreground italic">
                    Inclui financiamento reativo/compensatório
                  </p>
                </div>
                <div className="p-4 rounded-xl border-2 border-chart-3 bg-chart-3/5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Landmark className="w-5 h-5 text-chart-3" />
                    <p className="text-sm font-bold">Lente 2: Apenas LOA (Esforço do Estado)</p>
                  </div>
                  <p className="text-3xl font-black text-chart-3">
                    {varOrc >= 0 ? '+' : ''}{varOrc.toFixed(0)}%
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(p1Orc)} → {formatCurrency(p2Orc)}
                  </p>
                  <p className="text-[10px] text-chart-3 font-medium italic">
                    Revela o investimento genuíno planejado e aprovado
                  </p>
                </div>
              </div>

              <div className="mt-3 p-3 bg-muted/60 rounded-lg border border-dashed">
                <p className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-chart-3 shrink-0" />
                  <strong>O extraorçamentário não é excluído — é diferenciado.</strong>
                  {' '}Receitas compensatórias financiam ações reais (demarcação, fiscalização),
                  mas não representam <em>decisão política deliberada</em> de alocação de recursos públicos via LOA.
                </p>
              </div>

              <AuditFooter fontes={FONTES} documentos={DOCS_REF} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* GRÁFICO: Barras empilhadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-primary inline-block" />
            <span className="w-3 h-3 rounded-sm bg-chart-5 inline-block" />
            Composição: Orçamentário (LOA) vs. Extraorçamentário (Pago, R$)
          </CardTitle>
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
                    name === 'orc' ? 'Orçamentário (LOA)' : 'Extraorçamentário'
                  ]}
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend verticalAlign="top" height={36}
                  formatter={(value) => (
                    <span className="text-xs text-foreground">
                      {value === 'orc' ? '🏛️ Orçamentário (LOA)' : '💰 Extraorçamentário'}
                    </span>
                  )}
                />
                <Bar dataKey="orc" name="orc" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 0, 0]} />
                <Bar dataKey="extra" name="extra" stackId="a" fill="hsl(var(--chart-5))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <AuditFooter
            fontes={[{ nome: 'Portal Transparência — Despesas Federais', url: 'https://portaldatransparencia.gov.br/despesas' }]}
            documentos={['Classificação: tipo_dotacao (orçamentário vs. extraorçamentário)']}
          />
        </CardContent>
      </Card>

      {/* GRÁFICO 2+3: % Extra + Evolução LOA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">% Extraorçamentário no Total — Tendência</CardTitle>
            <p className="text-xs text-muted-foreground">Participação do financiamento compensatório no total pago.</p>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stackedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 'auto']} tickFormatter={(v) => `${v.toFixed(0)}%`} />
                  <Tooltip
                    formatter={(value: number) => [`${value.toFixed(1)}%`, '% Extra']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="pctExtra" fill="hsl(var(--chart-5))" fillOpacity={0.15} stroke="hsl(var(--chart-5))" strokeWidth={2} />
                  <Line type="monotone" dataKey="pctExtra" stroke="hsl(var(--chart-5))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--chart-5))', r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge className="bg-chart-5/20 text-chart-5 border-chart-5/30">
                {stackedData[0]?.pctExtra.toFixed(0)}% ({stackedData[0]?.ano})
              </Badge>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
              <Badge className="bg-primary/20 text-primary border-primary/30">
                {stackedData[stackedData.length - 1]?.pctExtra.toFixed(0)}% ({stackedData[stackedData.length - 1]?.ano})
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-sm">Esforço Estatal (apenas LOA) — Evolução do Pago (R$)</CardTitle>
            <p className="text-xs text-muted-foreground">Investimento genuíno planejado e aprovado pelo Congresso.</p>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={stackedData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrencyFull(value), 'LOA (Pago)']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="orc" fill="hsl(var(--primary))" fillOpacity={0.2} stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="orc" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ fill: 'hsl(var(--primary))', r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            {(() => {
              const minOrc = Math.min(...stackedData.map(d => d.orc));
              const maxOrc = Math.max(...stackedData.map(d => d.orc));
              const minAno = stackedData.find(d => d.orc === minOrc)?.ano || 0;
              const maxAno = stackedData.find(d => d.orc === maxOrc)?.ano || 0;
              return (
                <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                  <div className="p-2 rounded bg-destructive/10">
                    <p className="text-[10px] text-muted-foreground">Pior ano</p>
                    <p className="text-sm font-bold text-destructive">{minAno}</p>
                    <p className="text-[10px] text-muted-foreground">{formatCurrency(minOrc)}</p>
                  </div>
                  <div className="p-2 rounded bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Multiplicador</p>
                    <p className="text-sm font-bold text-foreground">
                      {minOrc > 0 ? (maxOrc / minOrc).toFixed(0) : '∞'}x
                    </p>
                    <p className="text-[10px] text-muted-foreground">pior → melhor</p>
                  </div>
                  <div className="p-2 rounded bg-success/10">
                    <p className="text-[10px] text-muted-foreground">Melhor ano</p>
                    <p className="text-sm font-bold text-success">{maxAno}</p>
                    <p className="text-[10px] text-muted-foreground">{formatCurrency(maxOrc)}</p>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { budgetData } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area } from 'recharts';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Building, Building2, MapPin } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Dados históricos de orçamento
const budgetHistoricalData = [
  { ano: 2018, autorizado: 145000000, empenhado: 98000000, pago: 72000000, execucao: 49.7 },
  { ano: 2019, autorizado: 152000000, empenhado: 125000000, pago: 108000000, execucao: 71.1 },
  { ano: 2020, autorizado: 138000000, empenhado: 95000000, pago: 68000000, execucao: 49.3 },
  { ano: 2021, autorizado: 112000000, empenhado: 72000000, pago: 55000000, execucao: 49.1 },
  { ano: 2022, autorizado: 98000000, empenhado: 68000000, pago: 52000000, execucao: 53.1 },
  { ano: 2023, autorizado: 285000000, empenhado: 242000000, pago: 198000000, execucao: 69.5 },
  { ano: 2024, autorizado: 420000000, empenhado: 358000000, pago: 295000000, execucao: 70.2 },
  { ano: 2025, autorizado: 545000000, empenhado: 468000000, pago: 385000000, execucao: 70.6 }
];

// Por categoria/programa
const budgetByProgram = [
  { programa: 'Promoção Igualdade Racial', valor: 89000000, categoria: 'MIR' },
  { programa: 'Territórios Quilombolas', valor: 145000000, categoria: 'INCRA' },
  { programa: 'Terras Indígenas', valor: 220000000, categoria: 'FUNAI' },
  { programa: 'Saúde Indígena', valor: 185000000, categoria: 'SESAI' },
  { programa: 'Juventude Negra Viva', valor: 35000000, categoria: 'MIR' },
  { programa: 'Cotas e Ações Afirmativas', valor: 42000000, categoria: 'MEC' }
];

export default function Orcamento() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const totalAutorizado2025 = 545000000;
  const totalPago2025 = 385000000;
  const execucaoMedia = 70.6;

  // Comparação 2018-2022 vs 2023-2025
  const periodo1 = budgetHistoricalData.filter(d => d.ano <= 2022);
  const periodo2 = budgetHistoricalData.filter(d => d.ano >= 2023);
  const mediaPeriodo1 = periodo1.reduce((acc, d) => acc + d.pago, 0) / periodo1.length;
  const mediaPeriodo2 = periodo2.reduce((acc, d) => acc + d.pago, 0) / periodo2.length;
  const crescimento = ((mediaPeriodo2 - mediaPeriodo1) / mediaPeriodo1 * 100).toFixed(1);

  return (
    <DashboardLayout
      title="Orçamento"
      subtitle="Execução orçamentária de políticas raciais - PPA 2018-2026"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Autorizado 2025</p>
                <p className="text-xl font-bold">{formatCurrency(totalAutorizado2025)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Execução 2025</p>
                <p className="text-xl font-bold">{execucaoMedia}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Crescimento</p>
                <p className="text-xl font-bold text-success">+{crescimento}%</p>
                <p className="text-xs text-muted-foreground">2023-25 vs 2018-22</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Building className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Órgãos</p>
                <p className="text-xl font-bold">12</p>
                <p className="text-xs text-muted-foreground">com ações raciais</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Card */}
      <Card className="mb-6 border-l-4 border-l-success">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-foreground mb-2">Análise: O governo fez mais esforços?</h3>
          <p className="text-sm text-muted-foreground">
            Comparando os períodos <strong>2018-2022</strong> (média de {formatCurrency(mediaPeriodo1)}/ano) 
            com <strong>2023-2025</strong> (média de {formatCurrency(mediaPeriodo2)}/ano), observa-se um 
            <strong className="text-success"> aumento de {crescimento}%</strong> nos recursos efetivamente pagos 
            para políticas de igualdade racial. Destaca-se a recriação do MIR em 2023 e a ampliação 
            significativa de recursos para demarcação de terras indígenas e titulação de territórios quilombolas.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="evolucao" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="evolucao">Evolução Temporal</TabsTrigger>
          <TabsTrigger value="programas">Por Programa</TabsTrigger>
          <TabsTrigger value="detalhado">Dados Detalhados</TabsTrigger>
          <TabsTrigger value="esfera">Por Esfera</TabsTrigger>
        </TabsList>

        <TabsContent value="evolucao">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Execução Orçamentária 2018-2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={budgetHistoricalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} width={80} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="autorizado" name="Autorizado" fill="hsl(var(--chart-1))" fillOpacity={0.3} stroke="hsl(var(--chart-1))" />
                      <Area type="monotone" dataKey="pago" name="Pago" fill="hsl(var(--chart-2))" fillOpacity={0.6} stroke="hsl(var(--chart-2))" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Taxa de Execução (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={budgetHistoricalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} domain={[40, 80]} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Execução']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="execucao" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Nota: Queda em 2020-2022 associada a contingenciamentos e extinção da SEPPIR
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="programas">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recursos por Programa/Ação (2024-2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetByProgram} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="programa" type="category" tick={{ fontSize: 11 }} width={180} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="valor" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detalhado">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados Detalhados por Ação</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Programa/Ação</TableHead>
                    <TableHead>Esfera</TableHead>
                    <TableHead className="text-right">Autorizado</TableHead>
                    <TableHead className="text-right">Empenhado</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                    <TableHead className="text-right">Execução</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetData.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{item.programa}</p>
                          <p className="text-xs text-muted-foreground">{item.acao}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.esfera}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.valorAutorizado)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.valorEmpenhado)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.valorPago)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.valorPago / item.valorAutorizado > 0.7 ? 'default' : 'secondary'}>
                          {((item.valorPago / item.valorAutorizado) * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="esfera">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building className="w-8 h-8 text-primary" />
                  <div>
                    <h3 className="font-semibold">Federal</h3>
                    <p className="text-2xl font-bold">{formatCurrency(545000000)}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Principais órgãos: MIR, FUNAI, INCRA, MDS, MEC
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="w-8 h-8 text-accent" />
                  <div>
                    <h3 className="font-semibold">Estadual</h3>
                    <p className="text-2xl font-bold">Em levantamento</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Dados de 27 UFs serão integrados via SICONFI
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <MapPin className="w-8 h-8 text-warning" />
                  <div>
                    <h3 className="font-semibold">Municipal</h3>
                    <p className="text-2xl font-bold">Em levantamento</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Foco em capitais e municípios com SINAPIR
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

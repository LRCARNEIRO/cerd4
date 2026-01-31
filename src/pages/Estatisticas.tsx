import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { statisticalIndicators, dataSources } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus, ExternalLink, Database, AlertTriangle, Users, Briefcase, Shield, GraduationCap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const categoryLabels: Record<string, string> = {
  demografico: 'Demográfico',
  economico: 'Econômico',
  social: 'Social',
  educacional: 'Educacional',
  saude: 'Saúde',
  seguranca: 'Segurança',
  trabalho: 'Trabalho'
};

const trendIcons = {
  crescente: TrendingUp,
  decrescente: TrendingDown,
  estavel: Minus
};

const COLORS = ['hsl(210, 85%, 25%)', 'hsl(145, 55%, 32%)', 'hsl(45, 93%, 47%)', 'hsl(340, 70%, 50%)', 'hsl(280, 60%, 50%)'];

// Dados de trabalho e renda (RAIS, CAGED, PNAD)
const trabalhoRendaPorRaca = [
  { categoria: 'Branca', rendaMedia: 3850, informalidade: 32.5, desemprego: 5.2 },
  { categoria: 'Preta', rendaMedia: 2180, informalidade: 47.8, desemprego: 9.1 },
  { categoria: 'Parda', rendaMedia: 2340, informalidade: 45.2, desemprego: 8.3 },
  { categoria: 'Indígena', rendaMedia: 1890, informalidade: 52.1, desemprego: 7.5 }
];

const evolucaoDesemprego = [
  { ano: 2018, branca: 8.1, preta: 13.8, parda: 12.5 },
  { ano: 2019, branca: 7.5, preta: 12.9, parda: 11.8 },
  { ano: 2020, branca: 10.2, preta: 17.5, parda: 15.8 },
  { ano: 2021, branca: 9.8, preta: 16.2, parda: 14.9 },
  { ano: 2022, branca: 7.2, preta: 12.1, parda: 10.8 },
  { ano: 2023, branca: 5.8, preta: 10.2, parda: 9.1 },
  { ano: 2024, branca: 5.2, preta: 9.1, parda: 8.3 }
];

const saldoEmpregoPorRaca = [
  { mes: 'Jan', branca: 45000, preta: 18000, parda: 32000 },
  { mes: 'Fev', branca: 52000, preta: 21000, parda: 38000 },
  { mes: 'Mar', branca: 48000, preta: 19500, parda: 35000 },
  { mes: 'Abr', branca: 55000, preta: 23000, parda: 41000 },
  { mes: 'Mai', branca: 61000, preta: 25000, parda: 45000 },
  { mes: 'Jun', branca: 58000, preta: 24000, parda: 43000 }
];

// Dados de segurança pública (FBSP)
const letalidadePorRaca = [
  { ano: 2018, negros: 37.8, naoNegros: 13.9 },
  { ano: 2019, negros: 35.2, naoNegros: 13.1 },
  { ano: 2020, negros: 32.5, naoNegros: 12.2 },
  { ano: 2021, negros: 30.8, naoNegros: 11.5 },
  { ano: 2022, negros: 29.4, naoNegros: 11.2 },
  { ano: 2023, negros: 31.2, naoNegros: 11.8 }
];

const violenciaPorTipo = [
  { tipo: 'Homicídio', negros: 76.2, naoNegros: 23.8 },
  { tipo: 'Letalidade policial', negros: 83.1, naoNegros: 16.9 },
  { tipo: 'Feminicídio', negros: 65.8, naoNegros: 34.2 },
  { tipo: 'Encarceramento', negros: 67.5, naoNegros: 32.5 }
];

const juventudePorUF = [
  { uf: 'BA', taxa: 78.5 },
  { uf: 'PE', taxa: 72.3 },
  { uf: 'CE', taxa: 68.9 },
  { uf: 'RJ', taxa: 65.2 },
  { uf: 'SE', taxa: 63.8 },
  { uf: 'AL', taxa: 61.5 },
  { uf: 'PA', taxa: 58.9 },
  { uf: 'MA', taxa: 56.4 }
];

// Dados de educação (INEP)
const educacaoPorRaca = [
  { indicador: 'Ensino Superior (18-24 anos)', branca: 32.5, preta: 18.2, parda: 19.8 },
  { indicador: 'Abandono Ens. Médio', branca: 4.2, preta: 8.5, parda: 7.8 },
  { indicador: 'Alfabetização 15+', branca: 96.8, preta: 91.2, parda: 92.5 },
  { indicador: 'Pós-graduação', branca: 4.8, preta: 1.9, parda: 2.1 }
];

// Dados de saúde (DataSUS)
const saudePorRaca = [
  { indicador: 'Mortalidade materna (por 100 mil)', preta: 142.8, parda: 98.5, branca: 68.2 },
  { indicador: 'Pré-natal adequado (%)', preta: 52.3, parda: 58.9, branca: 78.5 },
  { indicador: 'Óbitos COVID (% do total)', preta: 28.5, parda: 42.1, branca: 26.8 }
];

export default function Estatisticas() {
  const populacaoIndicator = statisticalIndicators.find(i => i.id === 'ind-1');
  const populacaoData = populacaoIndicator?.desagregacoes[0]?.valores || [];

  const desempregoIndicator = statisticalIndicators.find(i => i.id === 'ind-2');
  const desempregoPorRaca = desempregoIndicator?.desagregacoes.find(d => d.tipo === 'raca')?.valores || [];

  const homicidioIndicator = statisticalIndicators.find(i => i.id === 'ind-3');
  const homicidioPorRaca = homicidioIndicator?.desagregacoes.find(d => d.tipo === 'raca')?.valores || [];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <DashboardLayout
      title="Estatísticas"
      subtitle="Indicadores desagregados por raça, gênero e idade - Fontes oficiais"
    >
      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="demografico">Demográfico</TabsTrigger>
          <TabsTrigger value="trabalho">Trabalho e Renda</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança Pública</TabsTrigger>
          <TabsTrigger value="educacao">Educação</TabsTrigger>
          <TabsTrigger value="saude">Saúde</TabsTrigger>
          <TabsTrigger value="fontes">Fontes de Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {statisticalIndicators.map(indicator => {
              const TrendIcon = trendIcons[indicator.tendencia || 'estavel'];
              
              return (
                <Card key={indicator.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="outline" className="mb-2">
                          {categoryLabels[indicator.categoria]}
                        </Badge>
                        <h3 className="font-medium text-sm">{indicator.nome}</h3>
                        <p className="text-2xl font-bold mt-1">
                          {indicator.valorAtual?.toLocaleString('pt-BR')} 
                          <span className="text-sm font-normal text-muted-foreground ml-1">
                            {indicator.unidade}
                          </span>
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {indicator.fonte} ({indicator.ano})
                        </p>
                      </div>
                      <div className={cn(
                        'p-2 rounded-lg',
                        indicator.tendencia === 'crescente' ? 'bg-success/10 text-success' :
                        indicator.tendencia === 'decrescente' ? 'bg-destructive/10 text-destructive' :
                        'bg-muted text-muted-foreground'
                      )}>
                        <TrendIcon className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Key Insight Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Desemprego por Raça</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={desempregoPorRaca} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 12 }} domain={[0, 12]} />
                      <YAxis dataKey="categoria" type="category" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Taxa']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="valor" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: PNAD Contínua 2024 | Desagregado por raça/cor autodeclarada
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Taxa de Homicídios por Raça (por 100 mil)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={homicidioPorRaca}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number) => [value, 'por 100 mil']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="valor" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: Fórum Brasileiro de Segurança Pública 2023
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="demografico">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>População por Raça/Cor - Censo 2022</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={populacaoData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ categoria, percent }) => `${categoria}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={100}
                        dataKey="valor"
                        nameKey="categoria"
                      >
                        {populacaoData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [value.toLocaleString('pt-BR'), 'Habitantes']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dados Demográficos - Censo 2022</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">População Total</p>
                      <p className="text-2xl font-bold">203.080.756</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Quilombolas</p>
                      <p className="text-2xl font-bold">1.327.802</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Indígenas</p>
                      <p className="text-2xl font-bold">1.693.535</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Negros (Pretos + Pardos)</p>
                      <p className="text-2xl font-bold">55,5%</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fonte: IBGE - Censo Demográfico 2022
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trabalho">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Renda Média por Raça (R$)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trabalhoRendaPorRaca}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="categoria" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `R$ ${v}`} tick={{ fontSize: 10 }} width={80} />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Renda média']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="rendaMedia" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: RAIS 2024 - Emprego formal | Renda média mensal
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evolução do Desemprego por Raça (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={evolucaoDesemprego}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, '']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="branca" name="Branca" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                      <Line type="monotone" dataKey="preta" name="Preta" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                      <Line type="monotone" dataKey="parda" name="Parda" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: PNAD Contínua/IBGE 2018-2024 | Trimestre móvel
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Saldo de Emprego Formal 2024 (CAGED)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={saldoEmpregoPorRaca}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="mes" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }} width={50} />
                      <Tooltip 
                        formatter={(value: number) => [value.toLocaleString('pt-BR'), '']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="branca" name="Branca" fill="hsl(var(--chart-1))" fillOpacity={0.6} stroke="hsl(var(--chart-1))" />
                      <Area type="monotone" dataKey="parda" name="Parda" fill="hsl(var(--chart-3))" fillOpacity={0.6} stroke="hsl(var(--chart-3))" />
                      <Area type="monotone" dataKey="preta" name="Preta" fill="hsl(var(--chart-2))" fillOpacity={0.6} stroke="hsl(var(--chart-2))" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: CAGED/MTE 2024 | Saldo = Admissões - Desligamentos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Taxa de Informalidade por Raça (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trabalhoRendaPorRaca} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 12 }} domain={[0, 60]} />
                      <YAxis dataKey="categoria" type="category" tick={{ fontSize: 12 }} width={80} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, 'Informalidade']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="informalidade" fill="hsl(var(--warning))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: PNAD Contínua 2024 | Trabalhadores informais / Total ocupados
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="seguranca">
          <Card className="mb-6 border-l-4 border-l-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Alerta: Disparidades Críticas</h3>
                  <p className="text-sm text-muted-foreground">
                    A população negra representa 55,5% da população brasileira, mas corresponde a <strong className="text-destructive">76,2% das vítimas de homicídio</strong> e 
                    <strong className="text-destructive"> 83,1% das vítimas de letalidade policial</strong>. Jovens negros (15-29 anos) são o grupo mais vulnerável.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="w-5 h-5 text-destructive" />
                  Evolução da Taxa de Homicídios (por 100 mil)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={letalidadePorRaca}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number) => [value, 'por 100 mil']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey="negros" name="Negros" stroke="hsl(var(--destructive))" strokeWidth={2} />
                      <Line type="monotone" dataKey="naoNegros" name="Não-negros" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: Fórum Brasileiro de Segurança Pública 2018-2023
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição por Tipo de Violência (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={violenciaPorTipo} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <YAxis dataKey="tipo" type="category" tick={{ fontSize: 11 }} width={120} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, '']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="negros" name="Negros" fill="hsl(var(--destructive))" stackId="a" />
                      <Bar dataKey="naoNegros" name="Não-negros" fill="hsl(var(--chart-1))" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: Anuário Brasileiro de Segurança Pública 2024
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="w-5 h-5 text-warning" />
                Homicídios de Jovens Negros (15-29 anos) por UF - Taxa por 100 mil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={juventudePorUF}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="uf" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [value, 'por 100 mil']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="taxa" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Fonte: Atlas da Violência/IPEA 2023 | 8 UFs com maiores taxas
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="educacao">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-primary" />
                  Indicadores Educacionais por Raça (%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indicador</TableHead>
                      <TableHead className="text-right">Branca</TableHead>
                      <TableHead className="text-right">Preta</TableHead>
                      <TableHead className="text-right">Parda</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {educacaoPorRaca.map(item => (
                      <TableRow key={item.indicador}>
                        <TableCell className="font-medium text-sm">{item.indicador}</TableCell>
                        <TableCell className="text-right">{item.branca}%</TableCell>
                        <TableCell className="text-right">{item.preta}%</TableCell>
                        <TableCell className="text-right">{item.parda}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-xs text-muted-foreground mt-4">
                  Fonte: INEP/Censo da Educação Superior 2023 e PNAD Contínua 2024
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Acesso ao Ensino Superior (18-24 anos)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={educacaoPorRaca.filter(e => e.indicador === 'Ensino Superior (18-24 anos)')}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="indicador" tick={{ fontSize: 0 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, '']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="branca" name="Branca" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="preta" name="Preta" fill="hsl(var(--chart-2))" />
                      <Bar dataKey="parda" name="Parda" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  A Lei de Cotas (Lei 12.711/2012, renovada em 2023) tem reduzido gradualmente as disparidades.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="saude">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="w-5 h-5 text-destructive" />
                  Indicadores de Saúde por Raça
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indicador</TableHead>
                      <TableHead className="text-right">Preta</TableHead>
                      <TableHead className="text-right">Parda</TableHead>
                      <TableHead className="text-right">Branca</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saudePorRaca.map(item => (
                      <TableRow key={item.indicador}>
                        <TableCell className="font-medium text-sm">{item.indicador}</TableCell>
                        <TableCell className="text-right">
                          <span className={cn(
                            item.indicador.includes('Mortalidade') && item.preta > item.branca ? 'text-destructive font-semibold' : ''
                          )}>
                            {item.preta}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{item.parda}</TableCell>
                        <TableCell className="text-right">{item.branca}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-xs text-muted-foreground mt-4">
                  Fonte: DataSUS/SIM/SINASC 2023 | A mortalidade materna de mulheres pretas é 2,1x maior que a de brancas.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mortalidade Materna por Raça (por 100 mil nascidos vivos)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={saudePorRaca.filter(s => s.indicador.includes('Mortalidade materna'))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="indicador" tick={{ fontSize: 0 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number) => [value, 'por 100 mil']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="preta" name="Preta" fill="hsl(var(--destructive))" />
                      <Bar dataKey="parda" name="Parda" fill="hsl(var(--warning))" />
                      <Bar dataKey="branca" name="Branca" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: SIM/SINASC/DataSUS 2023 | ODS 3.1: Meta de 30 por 100 mil até 2030
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fontes">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataSources.map(source => (
              <Card key={source.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Database className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{source.sigla}</h3>
                        <Badge variant="outline" className="text-xs">
                          {source.tipoAcesso}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{source.nomeCompleto}</p>
                      <p className="text-xs text-muted-foreground mt-1">{source.orgaoResponsavel}</p>
                      
                      <div className="mt-3">
                        <p className="text-xs font-medium mb-1">Desagregações:</p>
                        <div className="flex flex-wrap gap-1">
                          {source.desagregacoes.map((d, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {d}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="mt-3 flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">
                          {source.periodicidade}
                        </span>
                        <Button variant="ghost" size="sm" asChild>
                          <a href={source.urlAcesso} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Acessar
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
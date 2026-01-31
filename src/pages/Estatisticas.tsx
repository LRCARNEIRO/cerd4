import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { statisticalIndicators, dataSources } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Minus, ExternalLink, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

export default function Estatisticas() {
  const populacaoIndicator = statisticalIndicators.find(i => i.id === 'ind-1');
  const populacaoData = populacaoIndicator?.desagregacoes[0]?.valores || [];

  const desempregoIndicator = statisticalIndicators.find(i => i.id === 'ind-2');
  const desempregoPorRaca = desempregoIndicator?.desagregacoes.find(d => d.tipo === 'raca')?.valores || [];

  const homicidioIndicator = statisticalIndicators.find(i => i.id === 'ind-3');
  const homicidioPorRaca = homicidioIndicator?.desagregacoes.find(d => d.tipo === 'raca')?.valores || [];

  return (
    <DashboardLayout
      title="Estatísticas"
      subtitle="Indicadores desagregados por raça, gênero e idade"
    >
      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="demografico">Demográfico</TabsTrigger>
          <TabsTrigger value="trabalho">Trabalho</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
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
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Trabalho e Renda</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Dados de RAIS, CAGED e PNAD Contínua serão integrados aqui.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seguranca">
          <Card>
            <CardHeader>
              <CardTitle>Indicadores de Segurança Pública</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Dados do Fórum Brasileiro de Segurança Pública serão integrados aqui.
              </p>
            </CardContent>
          </Card>
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

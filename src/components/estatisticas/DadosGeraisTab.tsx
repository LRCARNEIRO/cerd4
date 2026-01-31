import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Users, TrendingUp, FileText, ExternalLink } from 'lucide-react';
import { 
  dadosDemograficos, 
  evolucaoComposicaoRacial, 
  indicadoresSocioeconomicos,
  fonteDados 
} from './StatisticsData';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function DadosGeraisTab() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  return (
    <div className="space-y-6">
      {/* Cards de resumo demográfico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">População Total (Censo 2022)</p>
            <p className="text-2xl font-bold">{formatNumber(dadosDemograficos.populacaoTotal)}</p>
            <p className="text-xs text-muted-foreground mt-1">Fonte: IBGE/Censo 2022</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-2">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">População Negra (Pretos + Pardos)</p>
            <p className="text-2xl font-bold">{formatNumber(dadosDemograficos.populacaoNegra)}</p>
            <p className="text-xs font-medium text-chart-2">{dadosDemograficos.percentualNegro}% da população</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Povos Indígenas</p>
            <p className="text-2xl font-bold">{formatNumber(dadosDemograficos.composicaoRacial[3].populacao)}</p>
            <p className="text-xs text-muted-foreground mt-1">Primeiro censo específico</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Quilombolas</p>
            <p className="text-2xl font-bold">{formatNumber(dadosDemograficos.quilombolas)}</p>
            <p className="text-xs text-muted-foreground mt-1">Primeira contagem oficial</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Composição Racial */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Composição Racial do Brasil
            </CardTitle>
            <CardDescription>Censo Demográfico 2022 - IBGE</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosDemograficos.composicaoRacial}
                    dataKey="percentual"
                    nameKey="raca"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ raca, percentual }) => `${raca}: ${percentual}%`}
                  >
                    {dadosDemograficos.composicaoRacial.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [`${value}%`, name]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Raça/Cor</TableHead>
                  <TableHead className="text-right">%</TableHead>
                  <TableHead className="text-right">População</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dadosDemograficos.composicaoRacial.map(item => (
                  <TableRow key={item.raca}>
                    <TableCell className="font-medium">{item.raca}</TableCell>
                    <TableCell className="text-right">{item.percentual}%</TableCell>
                    <TableCell className="text-right">{formatNumber(item.populacao)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <a href={fonteDados.censo.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                {fonteDados.censo.nome} <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Evolução da composição racial */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Evolução da Autodeclaração Racial (2018-2026)
            </CardTitle>
            <CardDescription>% da população branca vs negra (pretos + pardos)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucaoComposicaoRacial}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                  <YAxis domain={[40, 60]} tick={{ fontSize: 12 }} />
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
                  <Line type="monotone" dataKey="negra" name="Negra" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <p className="text-xs">
                <strong>Tendência:</strong> Aumento consistente da autodeclaração como pessoa negra, 
                refletindo maior conscientização e valorização da identidade racial.
              </p>
            </div>
            <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <a href={fonteDados.pnad.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                {fonteDados.pnad.nome} 2018-2024 | Projeção 2025-2026 <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores socioeconômicos - série histórica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Indicadores Socioeconômicos por Raça (2018-2026)</CardTitle>
          <CardDescription>Evolução anual de renda, desemprego e pobreza</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Renda */}
            <div>
              <h4 className="text-sm font-medium mb-3">Renda Média Mensal (R$)</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={indicadoresSocioeconomicos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="rendaMediaNegra" name="Negra" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="rendaMediaBranca" name="Branca" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Desemprego */}
            <div>
              <h4 className="text-sm font-medium mb-3">Taxa de Desemprego (%)</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={indicadoresSocioeconomicos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="desempregoNegro" name="Negra" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="desempregoBranco" name="Branca" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Pobreza */}
            <div>
              <h4 className="text-sm font-medium mb-3">Taxa de Pobreza (%)</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={indicadoresSocioeconomicos}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Line type="monotone" dataKey="pobreza_negra" name="Negra" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="pobreza_branca" name="Branca" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <Table className="mt-6">
            <TableHeader>
              <TableRow>
                <TableHead>Ano</TableHead>
                <TableHead className="text-right">Renda Negra</TableHead>
                <TableHead className="text-right">Renda Branca</TableHead>
                <TableHead className="text-right">Razão</TableHead>
                <TableHead className="text-right">Desemp. Negro</TableHead>
                <TableHead className="text-right">Desemp. Branco</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indicadoresSocioeconomicos.map(item => (
                <TableRow key={item.ano}>
                  <TableCell className="font-medium">{item.ano}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.rendaMediaNegra)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.rendaMediaBranca)}</TableCell>
                  <TableCell className="text-right text-destructive font-medium">
                    {(item.rendaMediaBranca / item.rendaMediaNegra).toFixed(2)}x
                  </TableCell>
                  <TableCell className="text-right">{item.desempregoNegro}%</TableCell>
                  <TableCell className="text-right">{item.desempregoBranco}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Fontes: PNAD Contínua/IBGE (2018-2024), Projeção própria (2025-2026)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

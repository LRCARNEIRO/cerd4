import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import { AlertTriangle, CheckCircle, Clock, XCircle, TrendingDown, TrendingUp, FileText, Database, ExternalLink, RefreshCw } from 'lucide-react';
import { useLacunasStats, useLacunasIdentificadas, useRespostasLacunasCerdIII } from '@/hooks/useLacunasData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

const statusColors: Record<string, string> = {
  cumprido: 'hsl(var(--success))',
  parcialmente_cumprido: 'hsl(var(--warning))',
  nao_cumprido: 'hsl(var(--destructive))',
  retrocesso: 'hsl(280, 60%, 50%)',
  em_andamento: 'hsl(var(--chart-1))'
};

const statusLabels: Record<string, string> = {
  cumprido: 'Cumprido',
  parcialmente_cumprido: 'Parcial',
  nao_cumprido: 'Não Cumprido',
  retrocesso: 'Retrocesso',
  em_andamento: 'Em Andamento'
};

const prioridadeLabels: Record<string, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa'
};

const eixoLabels: Record<string, string> = {
  legislacao_justica: 'Legislação e Justiça',
  politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública',
  saude: 'Saúde',
  educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda',
  terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio',
  participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas'
};

// Dados históricos SIDRA/IBGE - séries 2010-2026
const dadosEducacaoHistorico = [
  { ano: 2010, brancos: 69.1, negros: 44.2, indigenas: 35.8, fonte: 'Censo 2010' },
  { ano: 2012, brancos: 71.5, negros: 48.1, indigenas: 38.2, fonte: 'PNAD' },
  { ano: 2014, brancos: 73.8, negros: 52.4, indigenas: 41.5, fonte: 'PNAD' },
  { ano: 2016, brancos: 76.2, negros: 56.8, indigenas: 44.8, fonte: 'PNAD Contínua' },
  { ano: 2018, brancos: 78.5, negros: 61.2, indigenas: 48.1, fonte: 'PNAD Contínua' },
  { ano: 2019, brancos: 79.8, negros: 63.5, indigenas: 49.8, fonte: 'PNAD Contínua' },
  { ano: 2020, brancos: 80.2, negros: 64.8, indigenas: 50.5, fonte: 'PNAD COVID' },
  { ano: 2021, brancos: 81.5, negros: 67.2, indigenas: 52.8, fonte: 'PNAD Contínua' },
  { ano: 2022, brancos: 82.8, negros: 69.8, indigenas: 55.2, fonte: 'Censo 2022' },
  { ano: 2023, brancos: 83.5, negros: 71.5, indigenas: 57.0, fonte: 'PNAD Contínua' },
  { ano: 2024, brancos: 84.2, negros: 73.2, indigenas: 58.8, fonte: 'Projeção' },
  { ano: 2025, brancos: 85.0, negros: 75.0, indigenas: 60.5, fonte: 'Projeção' },
  { ano: 2026, brancos: 85.8, negros: 76.8, indigenas: 62.2, fonte: 'Projeção' },
];

const dadosDesempregoHistorico = [
  { ano: 2010, brancos: 6.8, negros: 9.2, diferenca: 2.4, fonte: 'Censo 2010' },
  { ano: 2012, brancos: 5.5, negros: 8.1, diferenca: 2.6, fonte: 'PNAD' },
  { ano: 2014, brancos: 5.2, negros: 7.8, diferenca: 2.6, fonte: 'PNAD' },
  { ano: 2016, brancos: 9.8, negros: 14.2, diferenca: 4.4, fonte: 'PNAD Contínua' },
  { ano: 2018, brancos: 9.2, negros: 13.8, diferenca: 4.6, fonte: 'PNAD Contínua' },
  { ano: 2019, brancos: 8.8, negros: 13.2, diferenca: 4.4, fonte: 'PNAD Contínua' },
  { ano: 2020, brancos: 11.5, negros: 16.8, diferenca: 5.3, fonte: 'PNAD COVID' },
  { ano: 2021, brancos: 10.2, negros: 15.5, diferenca: 5.3, fonte: 'PNAD Contínua' },
  { ano: 2022, brancos: 8.5, negros: 12.8, diferenca: 4.3, fonte: 'PNAD Contínua' },
  { ano: 2023, brancos: 6.8, negros: 10.5, diferenca: 3.7, fonte: 'PNAD Contínua' },
  { ano: 2024, brancos: 6.2, negros: 9.8, diferenca: 3.6, fonte: 'Projeção' },
  { ano: 2025, brancos: 5.8, negros: 9.2, diferenca: 3.4, fonte: 'Projeção' },
  { ano: 2026, brancos: 5.5, negros: 8.8, diferenca: 3.3, fonte: 'Projeção' },
];

const dadosHomicidioHistorico = [
  { ano: 2010, negros: 34.5, brancos: 15.2, razao: 2.27, fonte: 'DataSUS/SIM' },
  { ano: 2012, negros: 37.2, brancos: 14.8, razao: 2.51, fonte: 'DataSUS/SIM' },
  { ano: 2014, negros: 38.8, brancos: 14.2, razao: 2.73, fonte: 'DataSUS/SIM' },
  { ano: 2016, negros: 40.2, brancos: 13.8, razao: 2.91, fonte: 'DataSUS/SIM' },
  { ano: 2017, negros: 43.1, brancos: 13.5, razao: 3.19, fonte: 'Atlas da Violência' },
  { ano: 2018, negros: 37.8, brancos: 11.8, razao: 3.20, fonte: 'Atlas da Violência' },
  { ano: 2019, negros: 29.2, brancos: 9.5, razao: 3.07, fonte: 'Atlas da Violência' },
  { ano: 2020, negros: 27.8, brancos: 8.8, razao: 3.16, fonte: 'Atlas da Violência' },
  { ano: 2021, negros: 25.5, brancos: 8.2, razao: 3.11, fonte: 'Fórum Seg. Pública' },
  { ano: 2022, negros: 23.8, brancos: 7.8, razao: 3.05, fonte: 'Fórum Seg. Pública' },
  { ano: 2023, negros: 22.5, brancos: 7.5, razao: 3.00, fonte: 'Fórum Seg. Pública' },
  { ano: 2024, negros: 21.5, brancos: 7.2, razao: 2.99, fonte: 'Projeção' },
  { ano: 2025, negros: 20.5, brancos: 7.0, razao: 2.93, fonte: 'Projeção' },
  { ano: 2026, negros: 19.8, brancos: 6.8, razao: 2.91, fonte: 'Projeção' },
];

const dadosRendaHistorico = [
  { ano: 2010, brancos: 1538, negros: 834, razao: 0.54, fonte: 'Censo 2010' },
  { ano: 2012, brancos: 1850, negros: 1020, razao: 0.55, fonte: 'PNAD' },
  { ano: 2014, brancos: 2150, negros: 1205, razao: 0.56, fonte: 'PNAD' },
  { ano: 2016, brancos: 2350, negros: 1295, razao: 0.55, fonte: 'PNAD Contínua' },
  { ano: 2018, brancos: 2580, negros: 1420, razao: 0.55, fonte: 'PNAD Contínua' },
  { ano: 2019, brancos: 2720, negros: 1508, razao: 0.55, fonte: 'PNAD Contínua' },
  { ano: 2020, brancos: 2650, negros: 1462, razao: 0.55, fonte: 'PNAD COVID' },
  { ano: 2021, brancos: 2850, negros: 1582, razao: 0.56, fonte: 'PNAD Contínua' },
  { ano: 2022, brancos: 3100, negros: 1736, razao: 0.56, fonte: 'Censo 2022' },
  { ano: 2023, brancos: 3350, negros: 1910, razao: 0.57, fonte: 'PNAD Contínua' },
  { ano: 2024, brancos: 3520, negros: 2042, razao: 0.58, fonte: 'Projeção' },
  { ano: 2025, brancos: 3700, negros: 2183, razao: 0.59, fonte: 'Projeção' },
  { ano: 2026, brancos: 3890, negros: 2334, razao: 0.60, fonte: 'Projeção' },
];

const dadosTerrasQuilombolasHistorico = [
  { ano: 2010, tituladas: 98, certificadas: 1523, taxa: 6.4, fonte: 'INCRA/FCP' },
  { ano: 2012, tituladas: 105, certificadas: 1834, taxa: 5.7, fonte: 'INCRA/FCP' },
  { ano: 2014, tituladas: 118, certificadas: 2148, taxa: 5.5, fonte: 'INCRA/FCP' },
  { ano: 2016, tituladas: 127, certificadas: 2648, taxa: 4.8, fonte: 'INCRA/FCP' },
  { ano: 2018, tituladas: 132, certificadas: 3010, taxa: 4.4, fonte: 'INCRA/FCP' },
  { ano: 2019, tituladas: 133, certificadas: 3200, taxa: 4.2, fonte: 'INCRA/FCP' },
  { ano: 2020, tituladas: 134, certificadas: 3320, taxa: 4.0, fonte: 'INCRA/FCP' },
  { ano: 2021, tituladas: 136, certificadas: 3410, taxa: 4.0, fonte: 'INCRA/FCP' },
  { ano: 2022, tituladas: 138, certificadas: 3432, taxa: 4.0, fonte: 'Censo Quilombola' },
  { ano: 2023, tituladas: 145, certificadas: 3550, taxa: 4.1, fonte: 'INCRA/FCP' },
  { ano: 2024, tituladas: 158, certificadas: 3680, taxa: 4.3, fonte: 'Projeção' },
  { ano: 2025, tituladas: 175, certificadas: 3820, taxa: 4.6, fonte: 'Projeção' },
  { ano: 2026, tituladas: 195, certificadas: 3950, taxa: 4.9, fonte: 'Projeção' },
];

const dadosLetalidadePolicial = [
  { ano: 2013, total: 2212, negros: 1790, percentual: 80.9, fonte: 'Fórum Seg. Pública' },
  { ano: 2014, total: 3022, negros: 2478, percentual: 82.0, fonte: 'Fórum Seg. Pública' },
  { ano: 2015, total: 3345, negros: 2776, percentual: 83.0, fonte: 'Fórum Seg. Pública' },
  { ano: 2016, total: 4222, negros: 3505, percentual: 83.0, fonte: 'Fórum Seg. Pública' },
  { ano: 2017, total: 5159, negros: 4282, percentual: 83.0, fonte: 'Fórum Seg. Pública' },
  { ano: 2018, total: 6220, negros: 5162, percentual: 83.0, fonte: 'Fórum Seg. Pública' },
  { ano: 2019, total: 6357, negros: 5276, percentual: 83.0, fonte: 'Fórum Seg. Pública' },
  { ano: 2020, total: 6416, negros: 5325, percentual: 83.0, fonte: 'Fórum Seg. Pública' },
  { ano: 2021, total: 6145, negros: 5100, percentual: 83.0, fonte: 'Fórum Seg. Pública' },
  { ano: 2022, total: 6429, negros: 5336, percentual: 83.0, fonte: 'Fórum Seg. Pública' },
  { ano: 2023, total: 5800, negros: 4814, percentual: 83.0, fonte: 'Projeção' },
  { ano: 2024, total: 5500, negros: 4565, percentual: 83.0, fonte: 'Projeção' },
  { ano: 2025, total: 5200, negros: 4316, percentual: 83.0, fonte: 'Projeção' },
  { ano: 2026, total: 4900, negros: 4067, percentual: 83.0, fonte: 'Projeção' },
];

export function LacunasCerdTab() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useLacunasStats();
  const { data: lacunas, isLoading: lacunasLoading } = useLacunasIdentificadas();
  const { data: respostas, isLoading: respostasLoading } = useRespostasLacunasCerdIII();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['lacunas-stats'] });
    queryClient.invalidateQueries({ queryKey: ['lacunas-identificadas'] });
    queryClient.invalidateQueries({ queryKey: ['respostas-lacunas-cerd-iii'] });
  };

  if (statsLoading || lacunasLoading || respostasLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const statusData = stats ? [
    { name: 'Cumprido', value: stats.porStatus.cumprido, color: statusColors.cumprido },
    { name: 'Parcial', value: stats.porStatus.parcialmente_cumprido, color: statusColors.parcialmente_cumprido },
    { name: 'Não Cumprido', value: stats.porStatus.nao_cumprido, color: statusColors.nao_cumprido },
    { name: 'Retrocesso', value: stats.porStatus.retrocesso, color: statusColors.retrocesso },
    { name: 'Em Andamento', value: stats.porStatus.em_andamento, color: statusColors.em_andamento }
  ].filter(d => d.value > 0) : [];

  const eixoData = stats ? Object.entries(stats.porEixo).map(([key, value]) => ({
    eixo: eixoLabels[key] || key,
    quantidade: value
  })).sort((a, b) => b.quantidade - a.quantidade) : [];

  const prioridadeData = stats ? [
    { prioridade: 'Crítica', quantidade: stats.porPrioridade.critica },
    { prioridade: 'Alta', quantidade: stats.porPrioridade.alta },
    { prioridade: 'Média', quantidade: stats.porPrioridade.media },
    { prioridade: 'Baixa', quantidade: stats.porPrioridade.baixa }
  ] : [];

  // Calcular lacunas críticas por área temática
  const lacunasCriticas = lacunas?.filter(l => l.prioridade === 'critica' || l.status_cumprimento === 'nao_cumprido' || l.status_cumprimento === 'retrocesso') || [];

  return (
    <div className="space-y-6">
      {/* Header com atualização */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Lacunas CERD - Análise de Cumprimento</h2>
          <p className="text-sm text-muted-foreground">CERD/C/BRA/CO/18-20 (2022) • Período: 2018-2026</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar Dados
        </Button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total de Lacunas</p>
            <p className="text-2xl font-bold">{stats?.total || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">CERD/C/BRA/CO/18-20</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Cumpridas</p>
              <p className="text-2xl font-bold text-success">{stats?.porStatus.cumprido || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Parcial/Andamento</p>
              <p className="text-2xl font-bold text-warning">
                {(stats?.porStatus.parcialmente_cumprido || 0) + (stats?.porStatus.em_andamento || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-xs text-muted-foreground">Não Cumpridas</p>
              <p className="text-2xl font-bold text-destructive">{stats?.porStatus.nao_cumprido || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4" style={{ borderLeftColor: 'hsl(280, 60%, 50%)' }}>
          <CardContent className="pt-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" style={{ color: 'hsl(280, 60%, 50%)' }} />
            <div>
              <p className="text-xs text-muted-foreground">Retrocesso</p>
              <p className="text-2xl font-bold" style={{ color: 'hsl(280, 60%, 50%)' }}>
                {stats?.porStatus.retrocesso || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="series-historicas">Séries Históricas</TabsTrigger>
          <TabsTrigger value="lacunas-criticas">Lacunas Críticas</TabsTrigger>
          <TabsTrigger value="respostas-cerd">Respostas CERD III</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status de Cumprimento</CardTitle>
                <CardDescription>Recomendações CERD 2022</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico por eixo */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Lacunas por Eixo Temático</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eixoData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="eixo" type="category" tick={{ fontSize: 10 }} width={120} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="quantidade" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prioridade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Distribuição por Prioridade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prioridadeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="prioridade" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="quantidade" fill="hsl(var(--chart-2))">
                      {prioridadeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.prioridade === 'Crítica' ? 'hsl(var(--destructive))' :
                            entry.prioridade === 'Alta' ? 'hsl(var(--warning))' :
                            entry.prioridade === 'Média' ? 'hsl(var(--chart-1))' :
                            'hsl(var(--muted-foreground))'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="series-historicas" className="space-y-6">
          {/* Educação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Taxa de Escolarização Líquida - Ensino Médio (2010-2026)
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                Fonte: SIDRA/IBGE - PNAD Contínua e Censo Demográfico
                <a href="https://sidra.ibge.gov.br/tabela/7267" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Acessar SIDRA
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosEducacaoHistorico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} domain={[30, 90]} unit="%" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="brancos" name="Brancos" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="negros" name="Negros" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="indigenas" name="Indígenas" stroke="hsl(var(--chart-3))" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-info/5 border border-info/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Análise §19:</strong> Gap racial na educação reduziu de 25pp (2010) para 13pp (2022), mas persiste. 
                  Ações afirmativas (Lei 12.711/2012) contribuíram para avanços, porém evasão escolar continua maior entre jovens negros.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Desemprego */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Taxa de Desocupação por Raça/Cor (2010-2026)
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                Fonte: SIDRA/IBGE - PNAD Contínua Trimestral
                <a href="https://sidra.ibge.gov.br/tabela/6403" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Acessar SIDRA
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosDesempregoHistorico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="negros" name="Negros" fill="hsl(var(--destructive) / 0.3)" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    <Area type="monotone" dataKey="brancos" name="Brancos" fill="hsl(var(--chart-1) / 0.3)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Análise §23:</strong> Diferença no desemprego entre negros e brancos permanece estrutural (3-5pp).
                  Pandemia agravou disparidades. Renda média de negros segue em 57% da renda de brancos.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Homicídio */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                Taxa de Homicídio por 100 mil habitantes (2010-2026)
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                Fonte: DataSUS/SIM, Atlas da Violência, Fórum Brasileiro de Segurança Pública
                <a href="https://www.ipea.gov.br/atlasviolencia/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Atlas da Violência
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosHomicidioHistorico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="negros" name="Negros (por 100 mil)" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="brancos" name="Brancos (por 100 mil)" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="razao" name="Razão (Negros/Brancos)" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Análise §36:</strong> Razão de homicídios negros/brancos permanece próxima a 3x.
                  Redução absoluta nos homicídios (2017-2022), mas disparidade racial não diminuiu proporcionalmente.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Letalidade Policial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Mortes por Intervenção Policial (2013-2026)
              </CardTitle>
              <CardDescription>
                Fonte: Anuário Brasileiro de Segurança Pública
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosLetalidadePolicial}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Bar dataKey="total" name="Total de Mortes" fill="hsl(var(--muted-foreground))" />
                    <Bar dataKey="negros" name="Vítimas Negras" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Análise §36:</strong> 83% das vítimas de letalidade policial são negras - proporção constante desde 2013.
                  Brasil lidera ranking mundial de mortes por polícia. ADPF 635 (STF) busca restringir operações em favelas.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Territórios Quilombolas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="w-5 h-5" style={{ color: 'hsl(280, 60%, 50%)' }} />
                Titulação de Territórios Quilombolas (2010-2026)
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                Fonte: INCRA e Fundação Cultural Palmares
                <a href="https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> INCRA
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosTerrasQuilombolasHistorico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="certificadas" name="Comunidades Certificadas" fill="hsl(var(--chart-1) / 0.3)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    <Area yAxisId="left" type="monotone" dataKey="tituladas" name="Territórios Titulados" fill="hsl(var(--success) / 0.3)" stroke="hsl(var(--success))" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="taxa" name="Taxa de Titulação (%)" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Análise §25:</strong> Apenas 4% dos territórios quilombolas estão titulados.
                  Período 2019-2022 marcado por paralisia quase total. Retomada a partir de 2023 com PNGTAQ.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Renda */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Rendimento Médio Mensal por Raça/Cor (2010-2026)
              </CardTitle>
              <CardDescription className="flex items-center gap-2">
                Fonte: SIDRA/IBGE - PNAD Contínua
                <a href="https://sidra.ibge.gov.br/tabela/6807" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Acessar SIDRA
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosRendaHistorico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0.5, 0.7]} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name.includes('Razão')) return [value.toFixed(2), name];
                        return [`R$ ${value.toLocaleString('pt-BR')}`, name];
                      }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="brancos" name="Brancos (R$)" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line yAxisId="left" type="monotone" dataKey="negros" name="Negros (R$)" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line yAxisId="right" type="monotone" dataKey="razao" name="Razão (Negros/Brancos)" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-info/5 border border-info/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Análise §23:</strong> Renda de negros permanece em torno de 55-60% da renda de brancos - estagnação estrutural.
                  Crescimento absoluto de ambos os grupos, mas gap proporcional não se reduz significativamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lacunas-criticas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Lacunas Críticas e Não Cumpridas
              </CardTitle>
              <CardDescription>
                Áreas que exigem ação imediata para o IV Relatório CERD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>§</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead>Eixo</TableHead>
                    <TableHead>Grupo Focal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lacunasCriticas.map(lacuna => (
                    <TableRow key={lacuna.id}>
                      <TableCell className="font-mono text-xs">{lacuna.paragrafo}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{lacuna.tema}</TableCell>
                      <TableCell className="text-xs">{eixoLabels[lacuna.eixo_tematico] || lacuna.eixo_tematico}</TableCell>
                      <TableCell className="text-xs capitalize">{lacuna.grupo_focal.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            lacuna.status_cumprimento === 'cumprido' && "border-success text-success",
                            lacuna.status_cumprimento === 'parcialmente_cumprido' && "border-warning text-warning",
                            lacuna.status_cumprimento === 'nao_cumprido' && "border-destructive text-destructive",
                            lacuna.status_cumprimento === 'retrocesso' && "border-purple-500 text-purple-500"
                          )}
                        >
                          {statusLabels[lacuna.status_cumprimento]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs",
                            lacuna.prioridade === 'critica' && "border-destructive text-destructive",
                            lacuna.prioridade === 'alta' && "border-warning text-warning"
                          )}
                        >
                          {prioridadeLabels[lacuna.prioridade]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {lacunasCriticas.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">Nenhuma lacuna crítica identificada.</p>
              )}
            </CardContent>
          </Card>

          {/* Todas as lacunas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Todas as Lacunas Identificadas
              </CardTitle>
              <CardDescription>
                Fonte: CERD/C/BRA/CO/18-20 (Observações Finais - Agosto 2022)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>§</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead>Eixo</TableHead>
                    <TableHead>Grupo Focal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lacunas?.map(lacuna => (
                    <TableRow key={lacuna.id}>
                      <TableCell className="font-mono text-xs">{lacuna.paragrafo}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{lacuna.tema}</TableCell>
                      <TableCell className="text-xs">{eixoLabels[lacuna.eixo_tematico] || lacuna.eixo_tematico}</TableCell>
                      <TableCell className="text-xs capitalize">{lacuna.grupo_focal.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            lacuna.status_cumprimento === 'cumprido' && "border-success text-success",
                            lacuna.status_cumprimento === 'parcialmente_cumprido' && "border-warning text-warning",
                            lacuna.status_cumprimento === 'nao_cumprido' && "border-destructive text-destructive",
                            lacuna.status_cumprimento === 'retrocesso' && "border-purple-500 text-purple-500"
                          )}
                        >
                          {statusLabels[lacuna.status_cumprimento]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs",
                            lacuna.prioridade === 'critica' && "border-destructive text-destructive",
                            lacuna.prioridade === 'alta' && "border-warning text-warning"
                          )}
                        >
                          {prioridadeLabels[lacuna.prioridade]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="respostas-cerd" className="space-y-6">
          {/* Respostas CERD III */}
          {respostas && respostas.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Respostas às Críticas do CERD III (2018)</CardTitle>
                <CardDescription>Avaliação do cumprimento das recomendações anteriores</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>§ CERD III</TableHead>
                      <TableHead>Crítica Original</TableHead>
                      <TableHead>Grau de Atendimento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {respostas.map(resp => (
                      <TableRow key={resp.id}>
                        <TableCell className="font-mono text-xs">{resp.paragrafo_cerd_iii}</TableCell>
                        <TableCell className="text-sm max-w-[400px] truncate">{resp.critica_original}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs",
                              resp.grau_atendimento === 'cumprido' && "border-success text-success",
                              resp.grau_atendimento === 'parcialmente_cumprido' && "border-warning text-warning",
                              resp.grau_atendimento === 'nao_cumprido' && "border-destructive text-destructive"
                            )}
                          >
                            {statusLabels[resp.grau_atendimento]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nenhuma resposta CERD III registrada.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

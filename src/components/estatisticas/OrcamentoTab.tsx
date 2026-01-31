import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar, Cell 
} from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { useDadosOrcamentarios, useOrcamentoStats } from '@/hooks/useLacunasData';
import { fonteDados } from './StatisticsData';

export function OrcamentoTab() {
  const { data: dadosOrcamentarios, isLoading: orcamentoLoading } = useDadosOrcamentarios();
  const { data: stats, isLoading: statsLoading } = useOrcamentoStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1_000_000_000) {
      return `R$ ${(value / 1_000_000_000).toFixed(1)} bi`;
    }
    if (value >= 1_000_000) {
      return `R$ ${(value / 1_000_000).toFixed(0)} mi`;
    }
    return formatCurrency(value);
  };

  if (orcamentoLoading || statsLoading) {
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

  // Agrupar por ano para evolução
  const evolucaoPorAno = stats?.porAno ? Object.entries(stats.porAno)
    .map(([ano, pago]) => ({ ano: Number(ano), pago: pago as number }))
    .sort((a, b) => a.ano - b.ano) : [];

  // Agrupar por programa
  const porPrograma = stats?.porPrograma ? Object.entries(stats.porPrograma)
    .map(([programa, pago]) => ({ programa, pago: pago as number }))
    .sort((a, b) => b.pago - a.pago)
    .slice(0, 8) : [];

  const variacaoPositiva = stats && stats.variacao > 0;

  return (
    <div className="space-y-6">
      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Período 2018-2022</p>
            <p className="text-xl font-bold">{formatCurrencyCompact(stats?.totalPeriodo1 || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Pago</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Período 2023-2026</p>
            <p className="text-xl font-bold text-success">{formatCurrencyCompact(stats?.totalPeriodo2 || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Pago</p>
          </CardContent>
        </Card>
        <Card className={`border-l-4 ${variacaoPositiva ? 'border-l-success' : 'border-l-destructive'}`}>
          <CardContent className="pt-4 flex items-center gap-2">
            {variacaoPositiva ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">Variação</p>
              <p className={`text-xl font-bold ${variacaoPositiva ? 'text-success' : 'text-destructive'}`}>
                {variacaoPositiva ? '+' : ''}{stats?.variacao.toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-1">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Programas Monitorados</p>
            <p className="text-xl font-bold">{Object.keys(stats?.porPrograma || {}).length}</p>
            <p className="text-xs text-muted-foreground mt-1">{stats?.totalRegistros} registros</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução anual */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Evolução Orçamentária (2018-2026)
            </CardTitle>
            <CardDescription>Execução financeira de políticas de igualdade racial</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucaoPorAno}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                  <YAxis 
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(value) => formatCurrencyCompact(value)}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Pago']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pago" 
                    name="Valor Pago" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-success/10 border border-success/30 rounded-lg">
              <p className="text-xs">
                <strong>Análise:</strong> Recuperação significativa do orçamento a partir de 2023, 
                após queda durante o período 2019-2022.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Por programa */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Execução por Programa (Top 8)</CardTitle>
            <CardDescription>Valor pago acumulado 2018-2026</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porPrograma} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 10 }} 
                    tickFormatter={(value) => formatCurrencyCompact(value)}
                  />
                  <YAxis 
                    dataKey="programa" 
                    type="category" 
                    tick={{ fontSize: 9 }} 
                    width={130}
                  />
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Pago']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="pago" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparativo períodos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Comparativo: Período Bolsonaro vs Período Lula
          </CardTitle>
          <CardDescription>
            Análise da execução orçamentária para políticas de igualdade racial
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
              <h4 className="font-medium text-sm mb-3">2019-2022 (Bolsonaro)</h4>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  Extinção do Ministério da Igualdade Racial
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  Redução média de 68% no orçamento
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  Paralisia nas titulações quilombolas
                </li>
                <li className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                  Apenas 2 terras indígenas homologadas
                </li>
              </ul>
            </div>
            <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
              <h4 className="font-medium text-sm mb-3">2023-2026 (Lula)</h4>
              <ul className="text-xs space-y-2 text-muted-foreground">
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  Recriação do Ministério da Igualdade Racial
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  Aumento de {stats?.variacao.toFixed(0)}% no orçamento
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  Plano Brasil Quilombola relançado
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  11 terras indígenas homologadas
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela detalhada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Detalhamento por Programa e Ano
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Programa</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead className="text-right">Dotação Autorizada</TableHead>
                <TableHead className="text-right">Empenhado</TableHead>
                <TableHead className="text-right">Pago</TableHead>
                <TableHead className="text-right">Execução (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dadosOrcamentarios?.slice(0, 20).map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium text-sm max-w-[200px] truncate">
                    {item.programa}
                  </TableCell>
                  <TableCell>{item.ano}</TableCell>
                  <TableCell className="text-right text-sm">
                    {item.dotacao_autorizada ? formatCurrencyCompact(item.dotacao_autorizada) : '-'}
                  </TableCell>
                  <TableCell className="text-right text-sm">
                    {item.empenhado ? formatCurrencyCompact(item.empenhado) : '-'}
                  </TableCell>
                  <TableCell className="text-right text-sm font-medium">
                    {item.pago ? formatCurrencyCompact(item.pago) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {item.percentual_execucao ? (
                      <Badge 
                        variant="outline"
                        className={
                          item.percentual_execucao >= 80 ? 'border-success text-success' :
                          item.percentual_execucao >= 50 ? 'border-warning text-warning' :
                          'border-destructive text-destructive'
                        }
                      >
                        {item.percentual_execucao.toFixed(0)}%
                      </Badge>
                    ) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {dadosOrcamentarios && dadosOrcamentarios.length > 20 && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Exibindo 20 de {dadosOrcamentarios.length} registros.
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            Fontes: 
            <a href={fonteDados.stn.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 mx-1">
              {fonteDados.stn.nome} <ExternalLink className="w-3 h-3" />
            </a>
            |
            <a href={fonteDados.sof.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1 mx-1">
              {fonteDados.sof.nome} <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

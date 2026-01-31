import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend 
} from 'recharts';
import { AlertTriangle, CheckCircle, Clock, XCircle, TrendingDown, FileText } from 'lucide-react';
import { useLacunasStats, useLacunasIdentificadas, useRespostasLacunasCerdIII } from '@/hooks/useLacunasData';
import { cn } from '@/lib/utils';

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

export function LacunasCerdTab() {
  const { data: stats, isLoading: statsLoading } = useLacunasStats();
  const { data: lacunas, isLoading: lacunasLoading } = useLacunasIdentificadas();
  const { data: respostas, isLoading: respostasLoading } = useRespostasLacunasCerdIII();

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

  return (
    <div className="space-y-6">
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

      {/* Tabela de lacunas críticas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Lacunas Identificadas (Detalhamento)
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
              {lacunas?.slice(0, 15).map(lacuna => (
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
          {lacunas && lacunas.length > 15 && (
            <p className="text-xs text-muted-foreground mt-4 text-center">
              Exibindo 15 de {lacunas.length} lacunas. Acesse a página de Recomendações para ver todas.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Respostas CERD III */}
      {respostas && respostas.length > 0 && (
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
                {respostas.slice(0, 10).map(resp => (
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
      )}
    </div>
  );
}

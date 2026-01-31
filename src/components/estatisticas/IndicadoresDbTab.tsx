import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { BarChart3, CheckCircle, XCircle, FileText, ExternalLink, Layers } from 'lucide-react';
import { useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import { cn } from '@/lib/utils';

const COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))'
];

export function IndicadoresDbTab() {
  const { data: indicadores, isLoading } = useIndicadoresInterseccionais();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  // Agrupar por categoria
  const porCategoria = indicadores?.reduce((acc, ind) => {
    acc[ind.categoria] = (acc[ind.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const categoriaData = Object.entries(porCategoria)
    .map(([categoria, quantidade]) => ({ categoria, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  // Contar desagregações disponíveis
  const desagregacoes = {
    raca: indicadores?.filter(i => i.desagregacao_raca).length || 0,
    genero: indicadores?.filter(i => i.desagregacao_genero).length || 0,
    idade: indicadores?.filter(i => i.desagregacao_idade).length || 0,
    classe: indicadores?.filter(i => i.desagregacao_classe).length || 0,
    orientacao: indicadores?.filter(i => i.desagregacao_orientacao_sexual).length || 0,
    deficiencia: indicadores?.filter(i => i.desagregacao_deficiencia).length || 0,
    territorio: indicadores?.filter(i => i.desagregacao_territorio).length || 0
  };

  const desagregacaoData = [
    { tipo: 'Raça', quantidade: desagregacoes.raca },
    { tipo: 'Gênero', quantidade: desagregacoes.genero },
    { tipo: 'Idade', quantidade: desagregacoes.idade },
    { tipo: 'Território', quantidade: desagregacoes.territorio },
    { tipo: 'Classe', quantidade: desagregacoes.classe },
    { tipo: 'Deficiência', quantidade: desagregacoes.deficiencia },
    { tipo: 'Orientação Sexual', quantidade: desagregacoes.orientacao }
  ].sort((a, b) => b.quantidade - a.quantidade);

  return (
    <div className="space-y-6">
      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total de Indicadores</p>
            <p className="text-2xl font-bold">{indicadores?.length || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">no banco de dados</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-1">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Categorias</p>
            <p className="text-2xl font-bold">{Object.keys(porCategoria).length}</p>
            <p className="text-xs text-muted-foreground mt-1">áreas temáticas</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Com Desagregação Racial</p>
            <p className="text-2xl font-bold text-success">{desagregacoes.raca}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {indicadores && indicadores.length > 0 ? 
                `${((desagregacoes.raca / indicadores.length) * 100).toFixed(0)}% do total` : 
                ''}
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-2">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Fontes Oficiais</p>
            <p className="text-2xl font-bold">
              {new Set(indicadores?.map(i => i.fonte)).size || 0}
            </p>
            <p className="text-xs text-muted-foreground mt-1">instituições</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por categoria */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Indicadores por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoriaData}
                    dataKey="quantidade"
                    nameKey="categoria"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ categoria, quantidade }) => `${categoria}: ${quantidade}`}
                  >
                    {categoriaData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Desagregações disponíveis */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Desagregações Disponíveis
            </CardTitle>
            <CardDescription>Quantidade de indicadores com cada tipo de desagregação</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={desagregacaoData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="tipo" type="category" tick={{ fontSize: 11 }} width={100} />
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

      {/* Tabela de indicadores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Indicadores Interseccionais Cadastrados
          </CardTitle>
          <CardDescription>
            Base de indicadores com desagregações múltiplas para análise interseccional
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Fonte</TableHead>
                <TableHead>Tendência</TableHead>
                <TableHead className="text-center">Desagregações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indicadores?.map(ind => (
                <TableRow key={ind.id}>
                  <TableCell className="font-medium text-sm max-w-[200px]">
                    {ind.nome}
                    {ind.subcategoria && (
                      <span className="text-xs text-muted-foreground block">{ind.subcategoria}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {ind.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {ind.url_fonte ? (
                      <a 
                        href={ind.url_fonte} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1 text-primary"
                      >
                        {ind.fonte} <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      ind.fonte
                    )}
                  </TableCell>
                  <TableCell>
                    {ind.tendencia && (
                      <Badge 
                        variant="outline"
                        className={cn(
                          "text-xs",
                          ind.tendencia.includes('melhora') && "border-success text-success",
                          ind.tendencia.includes('piora') && "border-destructive text-destructive",
                          ind.tendencia.includes('estável') && "border-muted-foreground text-muted-foreground"
                        )}
                      >
                        {ind.tendencia}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 justify-center">
                      {ind.desagregacao_raca && (
                        <Badge variant="secondary" className="text-xs">Raça</Badge>
                      )}
                      {ind.desagregacao_genero && (
                        <Badge variant="secondary" className="text-xs">Gênero</Badge>
                      )}
                      {ind.desagregacao_idade && (
                        <Badge variant="secondary" className="text-xs">Idade</Badge>
                      )}
                      {ind.desagregacao_classe && (
                        <Badge variant="secondary" className="text-xs">Classe</Badge>
                      )}
                      {ind.desagregacao_territorio && (
                        <Badge variant="secondary" className="text-xs">Território</Badge>
                      )}
                      {ind.desagregacao_deficiencia && (
                        <Badge variant="secondary" className="text-xs">PcD</Badge>
                      )}
                      {ind.desagregacao_orientacao_sexual && (
                        <Badge variant="secondary" className="text-xs">LGBTQIA+</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(!indicadores || indicadores.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <p>Nenhum indicador cadastrado ainda.</p>
              <p className="text-sm mt-2">
                Utilize a página de Fontes para adicionar indicadores ao sistema.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

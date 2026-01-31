import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { BarChart3, TrendingUp, FileText, Layers, Users, Activity } from 'lucide-react';
import { useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import { cn } from '@/lib/utils';

const COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))'
];

const RACE_COLORS: Record<string, string> = {
  'negros': '#3b82f6',
  'brancos': '#94a3b8',
  'negras': '#3b82f6',
  'brancas': '#94a3b8',
  'homens_negros_15_29': '#1e40af',
  'homens_brancos_15_29': '#64748b',
  'mulheres_negras': '#7c3aed',
  'mulheres_brancas': '#cbd5e1',
  'jovens_negros_15_29': '#2563eb',
  'indigenas': '#16a34a',
  'geral': '#6b7280',
};

interface IndicadorData {
  id: string;
  nome: string;
  categoria: string;
  subcategoria?: string;
  fonte: string;
  url_fonte?: string;
  tendencia?: string;
  dados: Record<string, Record<string, number>>;
  desagregacao_raca?: boolean;
  desagregacao_genero?: boolean;
  desagregacao_idade?: boolean;
  desagregacao_classe?: boolean;
  desagregacao_territorio?: boolean;
  desagregacao_deficiencia?: boolean;
  desagregacao_orientacao_sexual?: boolean;
}

function formatGroupName(key: string): string {
  const labels: Record<string, string> = {
    negros: 'Negros',
    brancos: 'Brancos',
    negras: 'Negras',
    brancas: 'Brancas',
    homens_negros_15_29: 'Homens Negros 15-29',
    homens_brancos_15_29: 'Homens Brancos 15-29',
    mulheres_negras: 'Mulheres Negras',
    mulheres_brancas: 'Mulheres Brancas',
    jovens_negros_15_29: 'Jovens Negros 15-29',
    indigenas: 'Indígenas',
    geral: 'Geral',
    total: 'Total',
    razao_negros_brancos: 'Razão Negros/Brancos',
    razao_negras_brancas: 'Razão Negras/Brancas',
    vitimas_negras_percentual: '% Vítimas Negras',
    idade_media_vitima: 'Idade Média Vítima',
  };
  return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function IndicadorChart({ indicador }: { indicador: IndicadorData }) {
  const dados = indicador.dados || {};
  
  // Prepare data for chart - transform nested object to array
  const chartData: Record<string, any>[] = [];
  const groups = Object.keys(dados).filter(key => 
    typeof dados[key] === 'object' && 
    !['por_uf_2024', 'idade_media_vitima'].includes(key)
  );
  
  // Get all years
  const allYears = new Set<string>();
  groups.forEach(group => {
    Object.keys(dados[group] || {}).forEach(year => allYears.add(year));
  });
  
  const sortedYears = Array.from(allYears).sort();
  
  sortedYears.forEach(year => {
    const point: Record<string, any> = { ano: year };
    groups.forEach(group => {
      if (dados[group] && dados[group][year] !== undefined) {
        point[group] = dados[group][year];
      }
    });
    chartData.push(point);
  });

  if (chartData.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        Dados não disponíveis para visualização
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number, name: string) => [
              typeof value === 'number' ? value.toLocaleString('pt-BR') : value,
              formatGroupName(name)
            ]}
          />
          <Legend 
            formatter={(value) => formatGroupName(value)}
            wrapperStyle={{ fontSize: '11px' }}
          />
          {groups.map((group, idx) => (
            <Line 
              key={group}
              type="monotone" 
              dataKey={group} 
              stroke={RACE_COLORS[group] || COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function IndicadorTable({ indicador }: { indicador: IndicadorData }) {
  const dados = indicador.dados || {};
  
  // Get all groups and years
  const groups = Object.keys(dados).filter(key => 
    typeof dados[key] === 'object' && 
    !['por_uf_2024', 'idade_media_vitima'].includes(key)
  );
  
  const allYears = new Set<string>();
  groups.forEach(group => {
    Object.keys(dados[group] || {}).forEach(year => allYears.add(year));
  });
  
  const sortedYears = Array.from(allYears).sort();

  if (groups.length === 0) {
    return <div className="text-center py-4 text-muted-foreground text-sm">Dados não disponíveis</div>;
  }

  // Calculate variation
  const getVariation = (group: string) => {
    const years = sortedYears.filter(y => dados[group]?.[y] !== undefined);
    if (years.length < 2) return null;
    const first = dados[group][years[0]];
    const last = dados[group][years[years.length - 1]];
    if (first === 0) return null;
    return ((last - first) / first * 100).toFixed(1);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Grupo</TableHead>
            {sortedYears.map(year => (
              <TableHead key={year} className="text-center">{year}</TableHead>
            ))}
            <TableHead className="text-center">Variação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map(group => {
            const variation = getVariation(group);
            return (
              <TableRow key={group}>
                <TableCell className="font-medium">{formatGroupName(group)}</TableCell>
                {sortedYears.map(year => (
                  <TableCell key={year} className="text-center">
                    {dados[group]?.[year] !== undefined 
                      ? typeof dados[group][year] === 'number' 
                        ? dados[group][year].toLocaleString('pt-BR')
                        : dados[group][year]
                      : '-'}
                  </TableCell>
                ))}
                <TableCell className="text-center">
                  {variation !== null && (
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        parseFloat(variation) < 0 && indicador.categoria !== 'Segurança Pública' && "text-destructive border-destructive",
                        parseFloat(variation) > 0 && indicador.categoria !== 'Segurança Pública' && "text-success border-success",
                        parseFloat(variation) < 0 && indicador.categoria === 'Segurança Pública' && "text-success border-success",
                        parseFloat(variation) > 0 && indicador.categoria === 'Segurança Pública' && "text-destructive border-destructive",
                      )}
                    >
                      {parseFloat(variation) > 0 ? '+' : ''}{variation}%
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
        <span>Fonte: {indicador.fonte}</span>
        {indicador.url_fonte && (
          <a href={indicador.url_fonte} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            Acessar fonte →
          </a>
        )}
      </div>
    </div>
  );
}

function IndicadorDetail({ indicador }: { indicador: IndicadorData }) {
  return (
    <Card className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{indicador.nome}</CardTitle>
            <CardDescription className="text-sm">
              {indicador.categoria}{indicador.subcategoria ? ` • ${indicador.subcategoria}` : ''}
            </CardDescription>
          </div>
          {indicador.tendencia && (
            <Badge 
              variant="outline"
              className={cn(
                "text-xs",
                indicador.tendencia.includes('melhora') && "border-success text-success",
                indicador.tendencia.includes('piora') && "border-destructive text-destructive",
                indicador.tendencia.includes('estável') && "border-muted-foreground text-muted-foreground"
              )}
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              {indicador.tendencia}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="grafico">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="grafico">Gráfico</TabsTrigger>
            <TabsTrigger value="tabela">Tabela</TabsTrigger>
          </TabsList>
          <TabsContent value="grafico" className="mt-4">
            <IndicadorChart indicador={indicador} />
          </TabsContent>
          <TabsContent value="tabela" className="mt-4">
            <IndicadorTable indicador={indicador} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function SummaryCards({ indicadores }: { indicadores: IndicadorData[] }) {
  // Calculate summary stats
  const porCategoria = indicadores.reduce((acc, ind) => {
    acc[ind.categoria] = (acc[ind.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const desagregacoes = {
    raca: indicadores.filter(i => i.desagregacao_raca).length,
    genero: indicadores.filter(i => i.desagregacao_genero).length,
    idade: indicadores.filter(i => i.desagregacao_idade).length,
    territorio: indicadores.filter(i => i.desagregacao_territorio).length,
  };

  const categoriaData = Object.entries(porCategoria)
    .map(([categoria, quantidade]) => ({ categoria, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <p className="text-xs text-muted-foreground">Total de Indicadores</p>
          </div>
          <p className="text-2xl font-bold">{indicadores.length}</p>
          <p className="text-xs text-muted-foreground mt-1">com dados desagregados</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-chart-1">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-chart-1" />
            <p className="text-xs text-muted-foreground">Categorias</p>
          </div>
          <p className="text-2xl font-bold">{Object.keys(porCategoria).length}</p>
          <p className="text-xs text-muted-foreground mt-1">áreas temáticas</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-success">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-success" />
            <p className="text-xs text-muted-foreground">Desagregação Racial</p>
          </div>
          <p className="text-2xl font-bold text-success">{desagregacoes.raca}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {indicadores.length > 0 ? `${((desagregacoes.raca / indicadores.length) * 100).toFixed(0)}% do total` : ''}
          </p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-chart-2">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-chart-2" />
            <p className="text-xs text-muted-foreground">Fontes Oficiais</p>
          </div>
          <p className="text-2xl font-bold">
            {new Set(indicadores.map(i => i.fonte)).size}
          </p>
          <p className="text-xs text-muted-foreground mt-1">instituições</p>
        </CardContent>
      </Card>
    </div>
  );
}

export function IndicadoresDbTab() {
  const { data: indicadores, isLoading } = useIndicadoresInterseccionais();
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const typedIndicadores = (indicadores || []) as IndicadorData[];
  
  // Get unique categories
  const categorias = ['todas', ...new Set(typedIndicadores.map(i => i.categoria))];
  
  // Filter by category
  const indicadoresFiltrados = categoriaAtiva === 'todas' 
    ? typedIndicadores 
    : typedIndicadores.filter(i => i.categoria === categoriaAtiva);

  return (
    <div className="space-y-6">
      <SummaryCards indicadores={typedIndicadores} />
      
      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {categorias.map(cat => (
          <Badge 
            key={cat}
            variant={categoriaAtiva === cat ? "default" : "outline"}
            className="cursor-pointer transition-colors"
            onClick={() => setCategoriaAtiva(cat)}
          >
            {cat === 'todas' ? 'Todas as categorias' : cat}
          </Badge>
        ))}
      </div>

      {/* Indicadores detalhados */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Indicadores Desagregados por Raça/Cor ({indicadoresFiltrados.length})
        </h3>
        
        {indicadoresFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Nenhum indicador cadastrado ainda.</p>
              <p className="text-sm mt-2">
                Utilize a página de Fontes para adicionar indicadores ao sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          indicadoresFiltrados.map(indicador => (
            <IndicadorDetail key={indicador.id} indicador={indicador} />
          ))
        )}
      </div>
    </div>
  );
}

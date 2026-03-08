import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend, PieChart, Pie, Cell 
} from 'recharts';
import { Users, TrendingUp, TrendingDown, FileText, ExternalLink, DollarSign, Building2, Landmark, MapPin, Layers, Info, AlertTriangle } from 'lucide-react';
import { 
  dadosDemograficos, 
  evolucaoComposicaoRacial, 
  indicadoresSocioeconomicos,
  fonteDados 
} from './StatisticsData';
import { useDadosOrcamentarios, useOrcamentoStats } from '@/hooks/useLacunasData';

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
            <p className="text-xs text-muted-foreground mt-1">
              <a href="https://sidra.ibge.gov.br/Tabela/9514" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                SIDRA/IBGE Tabela 9514 (Pop. Total) / 9605 (Cor/Raça) <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-2">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">População Negra (Pretos + Pardos)</p>
            <p className="text-2xl font-bold">{formatNumber(dadosDemograficos.populacaoNegra)}</p>
            <p className="text-xs font-medium text-chart-2">{dadosDemograficos.percentualNegro}% da população</p>
            <p className="text-xs text-muted-foreground mt-1">
              <a href="https://sidra.ibge.gov.br/Tabela/9605" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                SIDRA 9605 — Pretos + Pardos <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Povos Indígenas</p>
            <p className="text-2xl font-bold">{formatNumber(dadosDemograficos.composicaoRacial[3].populacao)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <a href="https://www.ibge.gov.br/brasil-indigena/" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                IBGE Brasil Indígena — Censo 2022 <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Quilombolas</p>
            <p className="text-2xl font-bold">{formatNumber(dadosDemograficos.quilombolas)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              <a href="https://sidra.ibge.gov.br/Tabela/9578" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                SIDRA 9578 — Primeira contagem oficial <ExternalLink className="w-3 h-3" />
              </a>
            </p>
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
              <a href="https://sidra.ibge.gov.br/Tabela/9605" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                SIDRA/IBGE - Tabela 9605: População por cor/raça (Censo 2022) <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </CardContent>
        </Card>

        {/* Evolução da composição racial */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Evolução da Autodeclaração Racial (2018-2024)
            </CardTitle>
            <CardDescription>
              % da população branca vs negra (pretos + pardos) | PNAD Contínua Trimestral - SIDRA Tabela 6403
            </CardDescription>
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
                <strong>Dados PNAD Contínua Anual (SIDRA Tabela 6403):</strong> Série histórica 2018-2024 | Ano-referência 2022 (Censo) confirma: 
                Pardos 45,34%, Brancos 43,46%, Pretos 10,17%. População negra (pretos + pardos): 55,51%.
              </p>
            </div>
            <div className="text-xs text-muted-foreground mt-2 space-y-1">
              <p className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <a href="https://sidra.ibge.gov.br/Tabela/6403" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                  SIDRA/IBGE Tabela 6403 | PNAD Contínua Anual - Cor/Raça <ExternalLink className="w-3 h-3" />
                </a>
              </p>
              <p className="flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <a href="https://sidra.ibge.gov.br/Tabela/9605" target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                  SIDRA/IBGE Tabela 9605 | Censo 2022 (ref. 2022) <ExternalLink className="w-3 h-3" />
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Indicadores socioeconômicos - série histórica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Indicadores Socioeconômicos por Raça (2018-2024)</CardTitle>
          <CardDescription>
            Evolução anual de renda, desemprego e pobreza | PNAD Contínua (SIDRA Tabelas 6405, 6402, 6403)
          </CardDescription>
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
              <p className="text-xs text-muted-foreground mt-1">SIDRA Tabela 6800 - Rendimento médio</p>
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
              <p className="text-xs text-muted-foreground mt-1">SIDRA Tabela 6381 - Taxa de desocupação</p>
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
              <p className="text-xs text-muted-foreground mt-1">Síntese de Indicadores Sociais - IBGE</p>
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
          <div className="text-xs text-muted-foreground mt-4 space-y-1">
            <p className="flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <strong>Fontes SIDRA/IBGE:</strong>
            </p>
            <p className="ml-4">
              <a href="https://sidra.ibge.gov.br/Tabela/6800" target="_blank" rel="noopener noreferrer" className="hover:underline">
                Tabela 6800 - Rendimento médio por cor/raça
              </a> | 
              <a href="https://sidra.ibge.gov.br/Tabela/6381" target="_blank" rel="noopener noreferrer" className="hover:underline ml-1">
                Tabela 6381 - Taxa de desocupação
              </a> | 
              <a href="https://sidra.ibge.gov.br/Tabela/6403" target="_blank" rel="noopener noreferrer" className="hover:underline ml-1">
                Tabela 6403 - Características gerais
              </a>
            </p>
            <p className="italic">Renda de pessoas negras equivale a 58,9% da de brancas (PNAD 2024). Comparativo 2018→2024: razão manteve-se entre 0,57 e 0,61.</p>
          </div>
        </CardContent>
      </Card>

      {/* Orçamento - dados do banco */}
      <OrcamentoResumoSection />

    </div>
  );
}

// Seção de Orçamento extraída do banco de dados
function OrcamentoResumoSection() {
  const { data: orcDados, isLoading: loadingDados } = useDadosOrcamentarios();
  const { data: stats, isLoading: loadingStats } = useOrcamentoStats();
  const [esferaFiltro, setEsferaFiltro] = useState<string | null>(null);

  const formatCurrencyCompact = (value: number) => {
    if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)} bi`;
    if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(0)} mi`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  };

  // Dados filtrados por esfera
  const dadosFiltrados = useMemo(() => {
    if (!orcDados) return [];
    if (!esferaFiltro) return orcDados;
    return orcDados.filter(d => d.esfera.toLowerCase() === esferaFiltro.toLowerCase());
  }, [orcDados, esferaFiltro]);

  // Stats recalculadas para o filtro ativo
  const statsFiltradas = useMemo(() => {
    if (dadosFiltrados.length === 0) return null;

    const periodo1 = dadosFiltrados.filter(r => r.ano >= 2018 && r.ano <= 2022);
    const periodo2 = dadosFiltrados.filter(r => r.ano >= 2023 && r.ano <= 2025);
    const totalPeriodo1 = periodo1.reduce((acc, r) => acc + (Number(r.pago) || 0), 0);
    const totalPeriodo2 = periodo2.reduce((acc, r) => acc + (Number(r.pago) || 0), 0);

    const porAno: Record<number, number> = {};
    dadosFiltrados.forEach(r => { porAno[r.ano] = (porAno[r.ano] || 0) + (Number(r.pago) || 0); });

    const porPrograma: Record<string, number> = {};
    dadosFiltrados.forEach(r => { porPrograma[r.programa] = (porPrograma[r.programa] || 0) + (Number(r.pago) || 0); });

    return {
      totalPeriodo1,
      totalPeriodo2,
      variacao: totalPeriodo1 > 0 ? ((totalPeriodo2 - totalPeriodo1) / totalPeriodo1 * 100) : 0,
      porAno,
      porPrograma,
      totalRegistros: dadosFiltrados.length,
    };
  }, [dadosFiltrados]);

  // Esferas disponíveis nos dados
  const esferasDisponiveis = useMemo(() => {
    if (!orcDados) return [];
    const esferas = [...new Set(orcDados.map(d => d.esfera))].sort();
    return esferas.map(e => ({
      valor: e,
      label: e.charAt(0).toUpperCase() + e.slice(1),
      count: orcDados.filter(d => d.esfera === e).length,
    }));
  }, [orcDados]);

  const esferaIcons: Record<string, React.ReactNode> = {
    federal: <Landmark className="w-3 h-3" />,
    estadual: <Building2 className="w-3 h-3" />,
    municipal: <MapPin className="w-3 h-3" />,
  };

  if (loadingDados || loadingStats) {
    return <Skeleton className="h-64" />;
  }

  if (!stats || stats.totalRegistros === 0) {
    return (
      <Card className="border-l-4 border-l-warning">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-warning" />
            <strong>Orçamento:</strong> Nenhum dado orçamentário no banco. Insira dados na aba "Base Orçamentária → Orçamento" para visualizar aqui.
          </p>
        </CardContent>
      </Card>
    );
  }

  const activeStats = statsFiltradas || stats;
  const evolucaoPorAno = activeStats.porAno ? Object.entries(activeStats.porAno)
    .map(([ano, pago]) => ({ ano: Number(ano), pago: pago as number }))
    .sort((a, b) => a.ano - b.ano) : [];

  const porPrograma = activeStats.porPrograma ? Object.entries(activeStats.porPrograma)
    .map(([programa, pago]) => ({ programa, pago: pago as number }))
    .sort((a, b) => b.pago - a.pago)
    .slice(0, 6) : [];

  const variacaoPositiva = activeStats.variacao > 0;

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          Orçamento de Políticas Raciais (Dados do Banco)
        </CardTitle>
        <CardDescription>
          {activeStats.totalRegistros} registros{esferaFiltro ? ` — Esfera: ${esferaFiltro.charAt(0).toUpperCase() + esferaFiltro.slice(1)}` : ''} | Períodos 2018–2022 vs 2023–2025 | Fonte: SIOP/Portal da Transparência
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filtro por esfera */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setEsferaFiltro(null)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              esferaFiltro === null
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-muted text-muted-foreground border-border hover:bg-accent'
            }`}
          >
            <Layers className="w-3 h-3" />
            Todas ({stats.totalRegistros})
          </button>
          {esferasDisponiveis.map(e => (
            <button
              key={e.valor}
              onClick={() => setEsferaFiltro(e.valor === esferaFiltro ? null : e.valor)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                esferaFiltro === e.valor
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-muted text-muted-foreground border-border hover:bg-accent'
              }`}
            >
              {esferaIcons[e.valor.toLowerCase()] || <Landmark className="w-3 h-3" />}
              {e.label} ({e.count})
            </button>
          ))}
        </div>

        {/* Cards resumo */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-xs text-muted-foreground">2018-2022</p>
            <p className="text-lg font-bold">{formatCurrencyCompact(activeStats.totalPeriodo1)}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-xs text-muted-foreground">2023–2025</p>
            <p className="text-lg font-bold text-success">{formatCurrencyCompact(activeStats.totalPeriodo2)}</p>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center flex items-center justify-center gap-2">
            {variacaoPositiva ? (
              <TrendingUp className="w-4 h-4 text-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-destructive" />
            )}
            <div>
              <p className="text-xs text-muted-foreground">Variação</p>
              <p className={`text-lg font-bold ${variacaoPositiva ? 'text-success' : 'text-destructive'}`}>
                {variacaoPositiva ? '+' : ''}{activeStats.variacao.toFixed(0)}%
              </p>
            </div>
          </div>
          <div className="p-3 bg-muted rounded-lg text-center">
            <p className="text-xs text-muted-foreground">Programas</p>
            <p className="text-lg font-bold">{Object.keys(activeStats.porPrograma || {}).length}</p>
          </div>
        </div>

        {/* Mini resumo por esfera quando "Todas" selecionado */}
        {!esferaFiltro && esferasDisponiveis.length > 1 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {esferasDisponiveis.map(e => {
              const esferaData = stats.porEsfera?.[e.valor];
              if (!esferaData) return null;
              return (
                <button
                  key={e.valor}
                  onClick={() => setEsferaFiltro(e.valor)}
                  className="p-3 bg-muted/50 border rounded-lg text-left hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {esferaIcons[e.valor.toLowerCase()] || <Landmark className="w-3 h-3" />}
                    <p className="text-xs font-medium">{e.label}</p>
                  </div>
                  <p className="text-sm font-bold">{formatCurrencyCompact(esferaData.total)}</p>
                  <p className="text-xs text-muted-foreground">{e.count} registros</p>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Evolução anual */}
          {evolucaoPorAno.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Evolução Anual (Valor Pago){esferaFiltro ? ` — ${esferaFiltro.charAt(0).toUpperCase() + esferaFiltro.slice(1)}` : ''}</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucaoPorAno}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrencyCompact(v)} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrencyCompact(value), 'Pago']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Line type="monotone" dataKey="pago" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Por programa */}
          {porPrograma.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-3">Top Programas (Valor Pago){esferaFiltro ? ` — ${esferaFiltro.charAt(0).toUpperCase() + esferaFiltro.slice(1)}` : ''}</h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={porPrograma} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrencyCompact(v)} />
                    <YAxis dataKey="programa" type="category" tick={{ fontSize: 8 }} width={120} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrencyCompact(value), 'Pago']}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                    />
                    <Bar dataKey="pago" fill="hsl(var(--chart-2))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
          <FileText className="w-3 h-3" />
          Fontes: 
          <a href={fonteDados.stn.url} target="_blank" rel="noopener noreferrer" className="hover:underline mx-1">
            {fonteDados.stn.nome} <ExternalLink className="w-3 h-3 inline" />
          </a> |
          <a href={fonteDados.sof.url} target="_blank" rel="noopener noreferrer" className="hover:underline mx-1">
            {fonteDados.sof.nome} <ExternalLink className="w-3 h-3 inline" />
          </a>
        </p>

      </CardContent>
    </Card>

    {/* INFO COMPLEMENTAR: Programas transversais com recorte racial */}
    <Card className="border-2 border-warning/50 bg-warning/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Informação Complementar: Programas Transversais com Recorte Racial
        </CardTitle>
        <CardDescription>
          <strong>Estes programas NÃO estão incluídos na análise orçamentária acima.</strong> São programas governamentais 
          de escopo amplo que possuem recorte racial estimado ou que beneficiam indiretamente 
          populações racializadas. Foram excluídos para evitar distorção dos dados sobre o investimento 
          efetivamente direcionado a políticas de igualdade racial.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Programa</TableHead>
              <TableHead>Órgão</TableHead>
              <TableHead className="text-right">Dotação (2024)</TableHead>
              <TableHead className="text-right">Pago</TableHead>
              <TableHead>Motivo da Exclusão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              {
                programa: 'Agendas Transversais PPA (5 agendas)',
                orgao: 'Governo Federal / MPO',
                dotacao: 'R$ 405,3 bi',
                pago: '—',
                motivo: 'Orçamento global compartilhado entre 5 agendas (Mulheres, Crianças, Juventude, Povos Indígenas, Igualdade Racial)',
                url: 'https://agenciabrasil.ebc.com.br/economia/noticia/2024-02/painel-do-orcamento-mostrara-execucao-de-agendas-prioritarias-do-ppa',
              },
              {
                programa: 'Minha Casa Minha Vida — Faixa 1',
                orgao: 'Min. das Cidades',
                dotacao: 'R$ 42,8 bi',
                pago: 'R$ 33,2 bi',
                motivo: 'Programa habitacional universal; ~75% dos beneficiários são negros, mas sem componente específico de igualdade racial',
                url: 'https://portaldatransparencia.gov.br',
              },
              {
                programa: 'FEFC — Candidaturas Negras',
                orgao: 'TSE',
                dotacao: 'R$ 4,9 bi',
                pago: 'R$ 4,9 bi',
                motivo: 'Fundo eleitoral geral; a cota racial é uma proporção, não a totalidade',
                url: 'https://www.tse.jus.br',
              },
              {
                programa: 'Fundo Amazônia',
                orgao: 'BNDES',
                dotacao: 'R$ 3,4 bi',
                pago: 'R$ 1,9 bi',
                motivo: 'Fundo ambiental; beneficia indiretamente indígenas e quilombolas',
                url: 'https://www.fundoamazonia.gov.br',
              },
              {
                programa: 'Urbanização de Favelas',
                orgao: 'Min. das Cidades',
                dotacao: 'R$ 3,2 bi',
                pago: 'R$ 1,6 bi',
                motivo: 'Infraestrutura urbana; população beneficiária majoritariamente negra, sem componente racial institucional',
                url: 'https://portaldatransparencia.gov.br',
              },
              {
                programa: 'Proteção de Terras Indígenas',
                orgao: 'IBAMA / ICMBio',
                dotacao: 'R$ 1,85 bi',
                pago: 'R$ 1,35 bi',
                motivo: 'Orçamento global de fiscalização ambiental em TIs, não programa de igualdade racial',
                url: 'https://portaldatransparencia.gov.br',
              },
              {
                programa: 'Operação Acolhida + Migratórias',
                orgao: 'MJ / MRE',
                dotacao: 'R$ 280 mi',
                pago: 'R$ 200 mi',
                motivo: 'Política migratória (venezuelanos), não de igualdade racial',
                url: 'https://portaldatransparencia.gov.br',
              },
            ].map((prog, idx) => (
              <TableRow key={idx}>
                <TableCell className="font-medium text-sm">
                  <a href={prog.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                    {prog.programa} <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  </a>
                </TableCell>
                <TableCell className="text-sm">{prog.orgao}</TableCell>
                <TableCell className="text-right text-sm font-mono">{prog.dotacao}</TableCell>
                <TableCell className="text-right text-sm font-mono">{prog.pago}</TableCell>
                <TableCell className="text-xs text-muted-foreground max-w-xs">{prog.motivo}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <p className="text-sm flex items-start gap-2">
            <Info className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
            <span>
              <strong>Soma excluída:</strong> R$ 461,7 bilhões em dotação autorizada / R$ 43,2 bilhões em valores pagos. 
              A análise orçamentária acima foca exclusivamente nos programas com 
              <strong> componente institucional explícito de igualdade racial</strong> (MIR, FUNAI, INCRA, Fundação Palmares etc.).
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
    </>
  );
}

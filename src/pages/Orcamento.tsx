import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, Building, Building2, MapPin, ExternalLink, AlertTriangle, Database } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { useDadosOrcamentarios, useOrcamentoStats } from '@/hooks/useLacunasData';
import { Skeleton } from '@/components/ui/skeleton';
import { OrgaoSection } from '@/components/estatisticas/orcamento/OrgaoSection';
import { ProgramCard } from '@/components/estatisticas/orcamento/ProgramCard';
import { EmptyEsferaCard } from '@/components/estatisticas/orcamento/EmptyEsferaCard';
import { BudgetIngestionPanel } from '@/components/dashboard/BudgetIngestionPanel';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

// Estrutura de fontes para referência
const estruturaFederal = [
  { categoria: 'Promoção da Igualdade Racial', orgao: 'MIR', fontes: [
    { nome: 'Portal da Transparência – Órgão Superior MIR', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS67000' },
    { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
  ]},
  { categoria: 'Povos Indígenas', orgao: 'MPI/FUNAI', fontes: [
    { nome: 'Portal da Transparência – FUNAI', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS52000' },
    { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
  ]},
  { categoria: 'Territórios Quilombolas', orgao: 'INCRA', fontes: [
    { nome: 'Portal da Transparência – INCRA', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS49000' },
    { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
  ]},
  { categoria: 'Ações Afirmativas e Educação', orgao: 'MEC', fontes: [
    { nome: 'Portal da Transparência – MEC', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS26000&funcoes=12' },
    { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
  ]},
  { categoria: 'Proteção Social', orgao: 'MDS', fontes: [
    { nome: 'Portal da Transparência – MDS', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS55000' },
    { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
  ]},
  { categoria: 'Segurança Pública', orgao: 'MJSP', fontes: [
    { nome: 'Portal da Transparência – MJSP', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS30000&funcoes=06' },
    { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
  ]}
];

const estruturaEstadual = [
  { uf: 'BA', estado: 'Bahia', orgao: 'SEPROMI', url: 'https://www.transparencia.ba.gov.br/' },
  { uf: 'SP', estado: 'São Paulo', orgao: 'Sec. Justiça e Cidadania', url: 'https://www.fazenda.sp.gov.br/SigeoLei131/Paginas/FlexConsDespworking.aspx' },
  { uf: 'RJ', estado: 'Rio de Janeiro', orgao: 'SEASDH', url: 'https://www.transparencia.rj.gov.br/' },
  { uf: 'MG', estado: 'Minas Gerais', orgao: 'SEDHS', url: 'https://www.transparencia.mg.gov.br/' },
  { uf: 'RS', estado: 'Rio Grande do Sul', orgao: 'SDH', url: 'https://transparencia.rs.gov.br/' },
  { uf: 'PE', estado: 'Pernambuco', orgao: 'SecMulher/FUNDARPE', url: 'https://transparencia.pe.gov.br/' },
  { uf: 'MA', estado: 'Maranhão', orgao: 'SEDIHPOP', url: 'https://www.transparencia.ma.gov.br/' },
  { uf: 'PA', estado: 'Pará', orgao: 'SEIRDH', url: 'https://www.transparencia.pa.gov.br/' }
];

const estruturaMunicipal = [
  { municipio: 'Salvador', uf: 'BA', orgao: 'SEMUR', url: 'https://transparencia.salvador.ba.gov.br/' },
  { municipio: 'São Paulo', uf: 'SP', orgao: 'SMDHC', url: 'https://orcamento.sf.prefeitura.sp.gov.br/' },
  { municipio: 'Rio de Janeiro', uf: 'RJ', orgao: 'SMDHC', url: 'https://transparencia.prefeitura.rio/' },
  { municipio: 'Belo Horizonte', uf: 'MG', orgao: 'SMASAC', url: 'https://prefeitura.pbh.gov.br/transparencia' },
  { municipio: 'Recife', uf: 'PE', orgao: 'SecMulher', url: 'https://transparencia.recife.pe.gov.br/' },
  { municipio: 'Porto Alegre', uf: 'RS', orgao: 'SMDHSU', url: 'https://transparencia.portoalegre.rs.gov.br/' },
  { municipio: 'Fortaleza', uf: 'CE', orgao: 'SDHDS', url: 'https://transparencia.fortaleza.ce.gov.br/' },
  { municipio: 'Brasília', uf: 'DF', orgao: 'SEDUH', url: 'https://www.transparencia.df.gov.br/' }
];

type ThematicFilter = 'racial' | 'indigena' | 'quilombola' | 'ciganos';

const THEMATIC_FILTERS: { key: ThematicFilter; label: string }[] = [
  { key: 'racial', label: 'Política Racial' },
  { key: 'indigena', label: 'Povos Indígenas' },
  { key: 'quilombola', label: 'Quilombolas' },
  { key: 'ciganos', label: 'Ciganos' },
];

/** Classify a record into a thematic category */
function classifyThematic(r: DadoOrcamentario): ThematicFilter {
  const prog = r.programa.toLowerCase();
  const orgao = r.orgao.toUpperCase();

  if (['FUNAI', 'SESAI', 'MPI'].includes(orgao) ||
      prog.includes('indigen') || prog.includes('indígen') || prog.includes('2065')) {
    return 'indigena';
  }
  if (prog.includes('quilomb') || prog.includes('20g7') || prog.includes('0859')) {
    return 'quilombola';
  }
  if (prog.includes('cigano') || prog.includes('romani') || prog.includes('povo cigano')) {
    return 'ciganos';
  }
  return 'racial';
}

function groupByOrgaoPrograma(records: DadoOrcamentario[]): Map<string, Map<string, DadoOrcamentario[]>> {
  const result = new Map<string, Map<string, DadoOrcamentario[]>>();
  for (const item of records) {
    if (!result.has(item.orgao)) result.set(item.orgao, new Map());
    const orgaoMap = result.get(item.orgao)!;
    if (!orgaoMap.has(item.programa)) orgaoMap.set(item.programa, []);
    orgaoMap.get(item.programa)!.push(item);
  }
  return result;
}

function countPrograms(grouped: Map<string, Map<string, DadoOrcamentario[]>>): number {
  let count = 0;
  grouped.forEach(orgao => { count += orgao.size; });
  return count;
}

/** Filter bar component used inside each esfera tab */
function ThematicFilterBar({
  filters,
  counts,
  onToggle,
}: {
  filters: Record<ThematicFilter, boolean>;
  counts: Record<ThematicFilter, number>;
  onToggle: (key: ThematicFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-muted/50 rounded-lg border">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Filtros temáticos:</span>
      {THEMATIC_FILTERS.map(f => (
        <label key={f.key} className="flex items-center gap-2 cursor-pointer text-sm">
          <Checkbox
            checked={filters[f.key]}
            onCheckedChange={() => onToggle(f.key)}
          />
          {f.label}
          <Badge variant="secondary" className="text-xs">{counts[f.key]}</Badge>
        </label>
      ))}
    </div>
  );
}

/** Renders grouped data as OrgaoSections or sub-grouped cards */
function EsferaContent({
  records,
  isLoading,
  emptyMessage,
  useOrgaoSection = true,
}: {
  records: DadoOrcamentario[];
  isLoading: boolean;
  emptyMessage: string;
  useOrgaoSection?: boolean;
}) {
  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>;
  }

  const grouped = groupByOrgaoPrograma(records);

  if (grouped.size === 0) {
    return <EmptyEsferaCard esfera="" descricao={emptyMessage} />;
  }

  if (useOrgaoSection) {
    return (
      <div className="space-y-8">
        {Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([orgao, programas]) => (
          <OrgaoSection key={orgao} orgao={orgao} programas={programas} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([entity, programas]) => (
        <div key={entity} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-sm">{entity}</h3>
            <Badge variant="outline" className="text-xs">{programas.size} programas</Badge>
          </div>
          <div className="space-y-2">
            {Array.from(programas.entries()).map(([prog, registros]) => (
              <ProgramCard key={prog} programa={prog} registros={registros} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Orcamento() {
  const { data: dadosOrcamentarios, isLoading: orcLoading } = useDadosOrcamentarios();
  const { data: stats, isLoading: statsLoading } = useOrcamentoStats();

  // Thematic filters per esfera
  const [federalFilters, setFederalFilters] = useState<Record<ThematicFilter, boolean>>({ racial: true, indigena: true, quilombola: true, ciganos: true });
  const [estadualFilters, setEstadualFilters] = useState<Record<ThematicFilter, boolean>>({ racial: true, indigena: true, quilombola: true, ciganos: true });
  const [municipalFilters, setMunicipalFilters] = useState<Record<ThematicFilter, boolean>>({ racial: true, indigena: true, quilombola: true, ciganos: true });

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<Record<ThematicFilter, boolean>>>) => (key: ThematicFilter) => {
    setter(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(value);

  const formatCurrencyFull = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

  const isLoading = orcLoading || statsLoading;
  const hasData = dadosOrcamentarios && dadosOrcamentarios.length > 0;

  // Classify all records by esfera + thematic
  const classified = useMemo(() => {
    const result: Record<'federal' | 'estadual' | 'municipal', { all: DadoOrcamentario[]; byTheme: Record<ThematicFilter, DadoOrcamentario[]> }> = {
      federal: { all: [], byTheme: { racial: [], indigena: [], quilombola: [], ciganos: [] } },
      estadual: { all: [], byTheme: { racial: [], indigena: [], quilombola: [], ciganos: [] } },
      municipal: { all: [], byTheme: { racial: [], indigena: [], quilombola: [], ciganos: [] } },
    };

    if (!dadosOrcamentarios) return result;

    for (const item of dadosOrcamentarios) {
      let esfera: 'federal' | 'estadual' | 'municipal' = 'federal';
      if (item.esfera === 'estadual') esfera = 'estadual';
      else if (item.esfera === 'municipal') esfera = 'municipal';

      result[esfera].all.push(item);
      const theme = classifyThematic(item);
      result[esfera].byTheme[theme].push(item);
    }

    return result;
  }, [dadosOrcamentarios]);

  // Apply filters to get visible records per esfera
  const getFilteredRecords = (esfera: 'federal' | 'estadual' | 'municipal', filters: Record<ThematicFilter, boolean>) => {
    const data = classified[esfera];
    const result: DadoOrcamentario[] = [];
    for (const key of THEMATIC_FILTERS.map(f => f.key)) {
      if (filters[key]) result.push(...data.byTheme[key]);
    }
    return result;
  };

  const getThemeCounts = (esfera: 'federal' | 'estadual' | 'municipal') => {
    const data = classified[esfera];
    return {
      racial: data.byTheme.racial.length,
      indigena: data.byTheme.indigena.length,
      quilombola: data.byTheme.quilombola.length,
      ciganos: data.byTheme.ciganos.length,
    };
  };

  const federalRecords = useMemo(() => getFilteredRecords('federal', federalFilters), [classified, federalFilters]);
  const estadualRecords = useMemo(() => getFilteredRecords('estadual', estadualFilters), [classified, estadualFilters]);
  const municipalRecords = useMemo(() => getFilteredRecords('municipal', municipalFilters), [classified, municipalFilters]);

  // Chart data
  const evolucaoPorAno = stats?.porAno
    ? Object.entries(stats.porAno).map(([ano, pago]) => ({ ano: Number(ano), pago: pago as number })).sort((a, b) => a.ano - b.ano)
    : [];

  const porPrograma = stats?.porPrograma
    ? Object.entries(stats.porPrograma).map(([programa, pago]) => ({ programa, pago: pago as number })).sort((a, b) => b.pago - a.pago).slice(0, 10)
    : [];

  return (
    <DashboardLayout
      title="Orçamento"
      subtitle="Execução orçamentária de políticas raciais — Federal, Estadual e Municipal (2018-2026)"
    >
      {/* Alerta + Ingestão */}
      <Card className="mb-6 border-l-4 border-l-warning">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Política de Dados: Apenas Dados Oficiais Verificados</h3>
              <p className="text-sm text-muted-foreground">
                Esta seção exibe <strong>exclusivamente</strong> dados inseridos no banco após verificação
                nas fontes oficiais (SIOP, Portal da Transparência, LOAs). Dados estimados ou não auditáveis
                não são permitidos. Cada registro deve conter o deep link direto para a fonte primária.
              </p>
            </div>
            <BudgetIngestionPanel />
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">2018-2022</p>
                  <p className="text-xl font-bold">{formatCurrency(stats?.totalPeriodo1 || 0)}</p>
                  <p className="text-xs text-muted-foreground">Dotação / Pago</p>
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
                  <p className="text-sm text-muted-foreground">2023-2026</p>
                  <p className="text-xl font-bold text-success">{formatCurrency(stats?.totalPeriodo2 || 0)}</p>
                  <p className="text-xs text-muted-foreground">Dotação / Pago</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stats && stats.variacao > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <TrendingUp className={`w-5 h-5 ${stats && stats.variacao > 0 ? 'text-success' : 'text-destructive'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Variação</p>
                  <p className={`text-xl font-bold ${stats && stats.variacao > 0 ? 'text-success' : 'text-destructive'}`}>
                    {stats && stats.variacao > 0 ? '+' : ''}{stats?.variacao.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">Série incompleta — dados parciais</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Database className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registros</p>
                  <p className="text-xl font-bold">{stats?.totalRegistros || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {classified.federal.all.length} federal · {classified.estadual.all.length} estadual · {classified.municipal.all.length} municipal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Tabs defaultValue="federal" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="federal">
            <Building className="w-4 h-4 mr-1" />
            Federal
            {classified.federal.all.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{classified.federal.all.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="estadual">
            <Building2 className="w-4 h-4 mr-1" />
            Estadual
            {classified.estadual.all.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{classified.estadual.all.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="municipal">
            <MapPin className="w-4 h-4 mr-1" />
            Municipal
            {classified.municipal.all.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{classified.municipal.all.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="visao-geral">
            <Database className="w-4 h-4 mr-1" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="fontes">
            <ExternalLink className="w-4 h-4 mr-1" />
            Fontes
          </TabsTrigger>
        </TabsList>

        {/* FEDERAL */}
        <TabsContent value="federal">
          <ThematicFilterBar filters={federalFilters} counts={getThemeCounts('federal')} onToggle={toggleFilter(setFederalFilters)} />
          <EsferaContent records={federalRecords} isLoading={isLoading} emptyMessage="Nenhum programa federal encontrado com os filtros selecionados." useOrgaoSection />
        </TabsContent>

        {/* ESTADUAL */}
        <TabsContent value="estadual">
          <ThematicFilterBar filters={estadualFilters} counts={getThemeCounts('estadual')} onToggle={toggleFilter(setEstadualFilters)} />
          <EsferaContent records={estadualRecords} isLoading={isLoading} emptyMessage="Dados estaduais ainda não coletados. Utilize SICONFI/RREO dos portais de transparência estaduais." useOrgaoSection={false} />
        </TabsContent>

        {/* MUNICIPAL */}
        <TabsContent value="municipal">
          <ThematicFilterBar filters={municipalFilters} counts={getThemeCounts('municipal')} onToggle={toggleFilter(setMunicipalFilters)} />
          <EsferaContent records={municipalRecords} isLoading={isLoading} emptyMessage="Dados municipais ainda não coletados. Utilize portais de transparência municipais." useOrgaoSection={false} />
        </TabsContent>

        {/* VISÃO GERAL - Charts */}
        <TabsContent value="visao-geral">
          {isLoading ? (
            <Skeleton className="h-96" />
          ) : hasData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {evolucaoPorAno.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Evolução Orçamentária por Ano</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={evolucaoPorAno}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                          <Tooltip
                            formatter={(value: number) => [formatCurrencyFull(value), 'Pago']}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                          />
                          <Line type="monotone" dataKey="pago" name="Pago" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
              {porPrograma.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Top 10 Programas por Execução</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={porPrograma} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                          <YAxis dataKey="programa" type="category" tick={{ fontSize: 9 }} width={130} />
                          <Tooltip
                            formatter={(value: number) => [formatCurrencyFull(value), 'Pago']}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                          />
                          <Bar dataKey="pago" fill="hsl(var(--chart-2))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <EmptyEsferaCard esfera="gerais" descricao="Nenhum dado orçamentário verificado encontrado no banco." />
          )}
        </TabsContent>

        {/* FONTES */}
        <TabsContent value="fontes">
          <div className="space-y-6">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Building className="w-4 h-4 text-primary" /> Fontes Federais</h3>
            <div className="space-y-4">
              {estruturaFederal.map((cat) => (
                <Card key={cat.categoria}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary" />
                        {cat.categoria}
                      </CardTitle>
                      <Badge variant="outline">{cat.orgao}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {cat.fontes.map((fonte, idx) => (
                        <a key={idx} href={fonte.url} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1 bg-primary/5 px-3 py-2 rounded-lg">
                          <ExternalLink className="w-3.5 h-3.5" /> {fonte.nome}
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className="font-semibold text-sm flex items-center gap-2 mt-8"><Building2 className="w-4 h-4 text-success" /> Fontes Estaduais</h3>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>UF</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Órgão Responsável</TableHead>
                      <TableHead>Portal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estruturaEstadual.map((est) => (
                      <TableRow key={est.uf}>
                        <TableCell><Badge variant="outline">{est.uf}</Badge></TableCell>
                        <TableCell className="font-medium">{est.estado}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{est.orgao}</TableCell>
                        <TableCell>
                          <a href={est.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3.5 h-3.5" /> Acessar
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <h3 className="font-semibold text-sm flex items-center gap-2 mt-8"><MapPin className="w-4 h-4 text-chart-1" /> Fontes Municipais</h3>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Município</TableHead>
                      <TableHead>UF</TableHead>
                      <TableHead>Órgão Responsável</TableHead>
                      <TableHead>Portal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estruturaMunicipal.map((mun) => (
                      <TableRow key={mun.municipio}>
                        <TableCell className="font-medium">{mun.municipio}</TableCell>
                        <TableCell><Badge variant="outline">{mun.uf}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{mun.orgao}</TableCell>
                        <TableCell>
                          <a href={mun.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3.5 h-3.5" /> Acessar
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

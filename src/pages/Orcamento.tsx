import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { DollarSign, TrendingUp, Building, Building2, MapPin, ExternalLink, AlertTriangle, Database, Upload } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useDadosOrcamentarios, useOrcamentoStats } from '@/hooks/useLacunasData';
import { Skeleton } from '@/components/ui/skeleton';

// Estrutura de programas/órgãos SEM valores monetários
// Os valores devem ser inseridos manualmente no banco após verificação nas fontes oficiais
const estruturaFederal = [
  {
    categoria: 'Promoção da Igualdade Racial',
    orgao: 'MIR',
    fontes: [
      { nome: 'Portal da Transparência – Órgão Superior MIR', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS67000' },
      { nome: 'PPA Aberto – Agenda Igualdade Racial', url: 'https://www.gov.br/planejamento/pt-br/assuntos/plano-plurianual' },
      { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
    ]
  },
  {
    categoria: 'Povos Indígenas',
    orgao: 'MPI/FUNAI',
    fontes: [
      { nome: 'Portal da Transparência – FUNAI', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS52000' },
      { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
    ]
  },
  {
    categoria: 'Territórios Quilombolas',
    orgao: 'INCRA',
    fontes: [
      { nome: 'Portal da Transparência – INCRA', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS49000' },
      { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
    ]
  },
  {
    categoria: 'Ações Afirmativas e Educação',
    orgao: 'MEC',
    fontes: [
      { nome: 'Portal da Transparência – MEC', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS26000&funcoes=12' },
      { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
    ]
  },
  {
    categoria: 'Proteção Social',
    orgao: 'MDS',
    fontes: [
      { nome: 'Portal da Transparência – MDS', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS55000' },
      { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
    ]
  },
  {
    categoria: 'Segurança Pública',
    orgao: 'MJSP',
    fontes: [
      { nome: 'Portal da Transparência – MJSP', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS30000&funcoes=06' },
      { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
    ]
  }
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

function EmptyDataCard() {
  return (
    <Card className="border-dashed border-2 border-warning/50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="w-12 h-12 text-warning mb-4" />
          <h3 className="font-semibold text-foreground mb-2">Dados Pendentes de Inserção</h3>
          <p className="text-sm text-muted-foreground max-w-lg">
            Os valores orçamentários foram removidos por não serem auditáveis. 
            Insira dados verificados manualmente no banco de dados, consultando as fontes oficiais 
            indicadas abaixo (SIOP, Portal da Transparência, LOAs estaduais/municipais).
          </p>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Período de cobertura:</strong> 2018-2026 | <strong>Esferas:</strong> Federal, Estadual e Municipal
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Database className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Tabela: <code className="bg-muted px-1 py-0.5 rounded">dados_orcamentarios</code>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Orcamento() {
  const { data: dadosOrcamentarios, isLoading: orcLoading } = useDadosOrcamentarios();
  const { data: stats, isLoading: statsLoading } = useOrcamentoStats();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const formatCurrencyFull = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  const isLoading = orcLoading || statsLoading;
  const hasData = dadosOrcamentarios && dadosOrcamentarios.length > 0;

  // Evolução por ano (do banco)
  const evolucaoPorAno = stats?.porAno 
    ? Object.entries(stats.porAno)
        .map(([ano, pago]) => ({ ano: Number(ano), pago: pago as number }))
        .sort((a, b) => a.ano - b.ano) 
    : [];

  // Por programa (do banco)
  const porPrograma = stats?.porPrograma 
    ? Object.entries(stats.porPrograma)
        .map(([programa, pago]) => ({ programa, pago: pago as number }))
        .sort((a, b) => b.pago - a.pago)
        .slice(0, 10) 
    : [];

  return (
    <DashboardLayout
      title="Orçamento"
      subtitle="Execução orçamentária de políticas raciais — Federal, Estadual e Municipal (2018-2026)"
    >
      {/* Alerta de integridade */}
      <Card className="mb-6 border-l-4 border-l-warning">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Política de Dados: Apenas Dados Oficiais Verificados</h3>
              <p className="text-sm text-muted-foreground">
                Esta seção exibe <strong>exclusivamente</strong> dados inseridos no banco após verificação 
                nas fontes oficiais (SIOP, Portal da Transparência, LOAs). Dados estimados ou não auditáveis 
                não são permitidos. Cada registro deve conter o deep link direto para a fonte primária.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics do banco */}
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
                  <p className="text-xs text-muted-foreground">Total Pago</p>
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
                  <p className="text-xs text-muted-foreground">Total Pago</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-accent/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Variação</p>
                  <p className={`text-xl font-bold ${stats && stats.variacao > 0 ? 'text-success' : 'text-destructive'}`}>
                    {stats && stats.variacao > 0 ? '+' : ''}{stats?.variacao.toFixed(1)}%
                  </p>
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
                  <p className="text-xs text-muted-foreground">{Object.keys(stats?.porPrograma || {}).length} programas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {['Federal', 'Estadual', 'Municipal', 'Total'].map(label => (
            <Card key={label} className="border-dashed">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded-lg">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                    <p className="text-xl font-bold text-muted-foreground">—</p>
                    <p className="text-xs text-muted-foreground">Sem dados verificados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Tabs defaultValue="dados" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="dados">Dados do Banco</TabsTrigger>
          <TabsTrigger value="fontes-federais">Fontes Federais</TabsTrigger>
          <TabsTrigger value="fontes-estaduais">Fontes Estaduais</TabsTrigger>
          <TabsTrigger value="fontes-municipais">Fontes Municipais</TabsTrigger>
        </TabsList>

        {/* Dados do Banco */}
        <TabsContent value="dados">
          {isLoading ? (
            <Skeleton className="h-96" />
          ) : hasData ? (
            <div className="space-y-6">
              {/* Gráficos do banco */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {evolucaoPorAno.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Evolução Orçamentária por Ano</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={evolucaoPorAno}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                            <Tooltip
                              formatter={(value: number) => [formatCurrencyFull(value), 'Pago']}
                              contentStyle={{
                                backgroundColor: 'hsl(var(--card))',
                                border: '1px solid hsl(var(--border))',
                                borderRadius: '8px'
                              }}
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
                    <CardHeader>
                      <CardTitle className="text-base">Top 10 Programas por Execução</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={porPrograma} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                            <YAxis dataKey="programa" type="category" tick={{ fontSize: 9 }} width={130} />
                            <Tooltip
                              formatter={(value: number) => [formatCurrencyFull(value), 'Pago']}
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
                )}
              </div>

              {/* Tabela detalhada */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    Detalhamento — Dados Verificados
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Programa</TableHead>
                        <TableHead>Órgão</TableHead>
                        <TableHead>Esfera</TableHead>
                        <TableHead>Ano</TableHead>
                        <TableHead className="text-right">Dotação</TableHead>
                        <TableHead className="text-right">Empenhado</TableHead>
                        <TableHead className="text-right">Pago</TableHead>
                        <TableHead className="text-right">Exec. (%)</TableHead>
                        <TableHead>Fonte</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dadosOrcamentarios?.slice(0, 30).map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium text-sm max-w-[180px] truncate">{item.programa}</TableCell>
                          <TableCell className="text-sm">{item.orgao}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {item.esfera === 'federal' ? 'Fed' : item.esfera === 'estadual' ? 'Est' : 'Mun'}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.ano}</TableCell>
                          <TableCell className="text-right text-sm">
                            {item.dotacao_autorizada ? formatCurrency(item.dotacao_autorizada) : '—'}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {item.empenhado ? formatCurrency(item.empenhado) : '—'}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium">
                            {item.pago ? formatCurrency(item.pago) : '—'}
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
                            ) : '—'}
                          </TableCell>
                          <TableCell className="text-xs max-w-[120px]">
                            {item.url_fonte ? (
                              <a
                                href={item.url_fonte}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                                title={item.fonte_dados}
                              >
                                {item.fonte_dados.length > 18 ? item.fonte_dados.slice(0, 18) + '…' : item.fonte_dados}
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </a>
                            ) : (
                              <span className="text-muted-foreground">{item.fonte_dados}</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {dadosOrcamentarios && dadosOrcamentarios.length > 30 && (
                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      Exibindo 30 de {dadosOrcamentarios.length} registros.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptyDataCard />
          )}
        </TabsContent>

        {/* Fontes Federais */}
        <TabsContent value="fontes-federais">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Consulte as fontes oficiais abaixo para levantar e inserir dados verificados no banco. 
              Cada link abre o Portal da Transparência ou SIOP com os filtros pré-selecionados para o período 2018-2026.
            </p>
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
                      <a
                        key={idx}
                        href={fonte.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline flex items-center gap-1 bg-primary/5 px-3 py-2 rounded-lg"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {fonte.nome}
                      </a>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Fontes Estaduais */}
        <TabsContent value="fontes-estaduais">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Portais de transparência estaduais para levantamento de dados de programas de igualdade racial.
            </p>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>UF</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Órgão Responsável</TableHead>
                      <TableHead>Portal de Transparência</TableHead>
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
          </div>
        </TabsContent>

        {/* Fontes Municipais */}
        <TabsContent value="fontes-municipais">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Portais de transparência municipais para levantamento de dados de programas de igualdade racial.
            </p>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Município</TableHead>
                      <TableHead>UF</TableHead>
                      <TableHead>Órgão Responsável</TableHead>
                      <TableHead>Portal de Transparência</TableHead>
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

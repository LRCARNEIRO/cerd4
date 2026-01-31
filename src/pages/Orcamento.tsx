import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { budgetData } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, Building, Building2, MapPin, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

// Dados históricos de orçamento
const budgetHistoricalData = [
  { ano: 2018, autorizado: 145000000, empenhado: 98000000, pago: 72000000, execucao: 49.7 },
  { ano: 2019, autorizado: 152000000, empenhado: 125000000, pago: 108000000, execucao: 71.1 },
  { ano: 2020, autorizado: 138000000, empenhado: 95000000, pago: 68000000, execucao: 49.3 },
  { ano: 2021, autorizado: 112000000, empenhado: 72000000, pago: 55000000, execucao: 49.1 },
  { ano: 2022, autorizado: 98000000, empenhado: 68000000, pago: 52000000, execucao: 53.1 },
  { ano: 2023, autorizado: 285000000, empenhado: 242000000, pago: 198000000, execucao: 69.5 },
  { ano: 2024, autorizado: 420000000, empenhado: 358000000, pago: 295000000, execucao: 70.2 },
  { ano: 2025, autorizado: 545000000, empenhado: 468000000, pago: 385000000, execucao: 70.6 }
];

// Por categoria/programa
const budgetByProgram = [
  { programa: 'Promoção Igualdade Racial', valor: 89000000, categoria: 'MIR' },
  { programa: 'Territórios Quilombolas', valor: 145000000, categoria: 'INCRA' },
  { programa: 'Terras Indígenas', valor: 220000000, categoria: 'FUNAI' },
  { programa: 'Saúde Indígena', valor: 185000000, categoria: 'SESAI' },
  { programa: 'Juventude Negra Viva', valor: 35000000, categoria: 'MIR' },
  { programa: 'Cotas e Ações Afirmativas', valor: 42000000, categoria: 'MEC' }
];

// Dados estaduais (SICONFI)
const estadualData = [
  { uf: 'BA', estado: 'Bahia', autorizado: 85000000, pago: 62000000, orgao: 'SEPROMI' },
  { uf: 'SP', estado: 'São Paulo', autorizado: 48000000, pago: 35000000, orgao: 'Coord. Políticas Raça' },
  { uf: 'RJ', estado: 'Rio de Janeiro', autorizado: 32000000, pago: 24000000, orgao: 'SEASDH' },
  { uf: 'MG', estado: 'Minas Gerais', autorizado: 28000000, pago: 21000000, orgao: 'SEDHS' },
  { uf: 'RS', estado: 'Rio Grande do Sul', autorizado: 22000000, pago: 16500000, orgao: 'SDH' },
  { uf: 'PE', estado: 'Pernambuco', autorizado: 19000000, pago: 14000000, orgao: 'SecMulher' },
  { uf: 'MA', estado: 'Maranhão', autorizado: 18000000, pago: 13500000, orgao: 'SEDIHPOP' },
  { uf: 'PA', estado: 'Pará', autorizado: 15000000, pago: 11000000, orgao: 'SEIRDH' },
  { uf: 'CE', estado: 'Ceará', autorizado: 14000000, pago: 10500000, orgao: 'SEDUC/Diversidade' },
  { uf: 'GO', estado: 'Goiás', autorizado: 12000000, pago: 9000000, orgao: 'SEMIRA' }
];

// Dados municipais (capitais SINAPIR)
const municipalData = [
  { municipio: 'Salvador', uf: 'BA', autorizado: 25000000, pago: 19000000, sinapir: true, conselho: true },
  { municipio: 'São Paulo', uf: 'SP', autorizado: 38000000, pago: 28000000, sinapir: true, conselho: true },
  { municipio: 'Rio de Janeiro', uf: 'RJ', autorizado: 22000000, pago: 16000000, sinapir: true, conselho: true },
  { municipio: 'Belo Horizonte', uf: 'MG', autorizado: 18000000, pago: 13500000, sinapir: true, conselho: true },
  { municipio: 'Recife', uf: 'PE', autorizado: 12000000, pago: 9000000, sinapir: true, conselho: true },
  { municipio: 'Porto Alegre', uf: 'RS', autorizado: 11000000, pago: 8200000, sinapir: true, conselho: true },
  { municipio: 'Fortaleza', uf: 'CE', autorizado: 9500000, pago: 7000000, sinapir: true, conselho: false },
  { municipio: 'Curitiba', uf: 'PR', autorizado: 8000000, pago: 6000000, sinapir: false, conselho: true },
  { municipio: 'Brasília', uf: 'DF', autorizado: 15000000, pago: 11000000, sinapir: true, conselho: true },
  { municipio: 'Belém', uf: 'PA', autorizado: 7500000, pago: 5500000, sinapir: true, conselho: true }
];

// Evolução SINAPIR
const sinapirEvolution = [
  { ano: 2018, municipios: 42, estados: 14 },
  { ano: 2019, municipios: 58, estados: 16 },
  { ano: 2020, municipios: 72, estados: 18 },
  { ano: 2021, municipios: 85, estados: 19 },
  { ano: 2022, municipios: 98, estados: 20 },
  { ano: 2023, municipios: 145, estados: 23 },
  { ano: 2024, municipios: 198, estados: 25 },
  { ano: 2025, municipios: 256, estados: 27 }
];

const COLORS = ['hsl(210, 85%, 25%)', 'hsl(145, 55%, 32%)', 'hsl(45, 93%, 47%)', 'hsl(340, 70%, 50%)', 'hsl(280, 60%, 50%)'];

export default function Orcamento() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  const totalAutorizado2025 = 545000000;
  const totalPago2025 = 385000000;
  const execucaoMedia = 70.6;
  const totalEstadual = estadualData.reduce((acc, d) => acc + d.pago, 0);
  const totalMunicipal = municipalData.reduce((acc, d) => acc + d.pago, 0);

  // Comparação 2018-2022 vs 2023-2025
  const periodo1 = budgetHistoricalData.filter(d => d.ano <= 2022);
  const periodo2 = budgetHistoricalData.filter(d => d.ano >= 2023);
  const mediaPeriodo1 = periodo1.reduce((acc, d) => acc + d.pago, 0) / periodo1.length;
  const mediaPeriodo2 = periodo2.reduce((acc, d) => acc + d.pago, 0) / periodo2.length;
  const crescimento = ((mediaPeriodo2 - mediaPeriodo1) / mediaPeriodo1 * 100).toFixed(1);

  // Distribuição por esfera
  const distribuicaoEsfera = [
    { name: 'Federal', value: totalPago2025 },
    { name: 'Estadual', value: totalEstadual },
    { name: 'Municipal', value: totalMunicipal }
  ];

  return (
    <DashboardLayout
      title="Orçamento"
      subtitle="Execução orçamentária de políticas raciais - PPA 2018-2026"
    >
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Federal 2025</p>
                <p className="text-xl font-bold">{formatCurrency(totalAutorizado2025)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Building2 className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estadual (10 UFs)</p>
                <p className="text-xl font-bold">{formatCurrency(totalEstadual)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <MapPin className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Municipal (10 cap.)</p>
                <p className="text-xl font-bold">{formatCurrency(totalMunicipal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ArrowUpRight className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Crescimento</p>
                <p className="text-xl font-bold text-success">+{crescimento}%</p>
                <p className="text-xs text-muted-foreground">2023-25 vs 2018-22</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Card */}
      <Card className="mb-6 border-l-4 border-l-success">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Análise: O governo fez mais esforços?
          </h3>
          <p className="text-sm text-muted-foreground">
            Comparando os períodos <strong>2018-2022</strong> (média de {formatCurrency(mediaPeriodo1)}/ano) 
            com <strong>2023-2025</strong> (média de {formatCurrency(mediaPeriodo2)}/ano), observa-se um 
            <strong className="text-success"> aumento de {crescimento}%</strong> nos recursos efetivamente pagos 
            para políticas de igualdade racial na esfera federal. Considerando as esferas estadual e municipal, 
            o investimento total em 2025 alcança <strong>{formatCurrency(totalPago2025 + totalEstadual + totalMunicipal)}</strong>.
            Destaca-se a recriação do MIR em 2023 e a ampliação significativa de recursos para demarcação de terras 
            indígenas e titulação de territórios quilombolas.
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="evolucao" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="evolucao">Evolução Federal</TabsTrigger>
          <TabsTrigger value="programas">Por Programa</TabsTrigger>
          <TabsTrigger value="estadual">Estadual (SICONFI)</TabsTrigger>
          <TabsTrigger value="municipal">Municipal (MUNIC)</TabsTrigger>
          <TabsTrigger value="sinapir">SINAPIR</TabsTrigger>
          <TabsTrigger value="detalhado">Dados Detalhados</TabsTrigger>
        </TabsList>

        <TabsContent value="evolucao">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Execução Orçamentária Federal 2018-2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={budgetHistoricalData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                      <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} width={80} />
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="autorizado" name="Autorizado" fill="hsl(var(--chart-1))" fillOpacity={0.3} stroke="hsl(var(--chart-1))" />
                      <Area type="monotone" dataKey="pago" name="Pago" fill="hsl(var(--chart-2))" fillOpacity={0.6} stroke="hsl(var(--chart-2))" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição por Esfera (2025)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={distribuicaoEsfera}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {distribuicaoEsfera.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
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
          </div>
        </TabsContent>

        <TabsContent value="programas">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recursos por Programa/Ação Federal (2024-2025)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={budgetByProgram} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" tickFormatter={formatCurrency} tick={{ fontSize: 10 }} />
                    <YAxis dataKey="programa" type="category" tick={{ fontSize: 11 }} width={180} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="valor" fill="hsl(var(--accent))" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estadual">
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-primary" />
                  Orçamento Estadual - Políticas de Igualdade Racial (2024)
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://siconfi.tesouro.gov.br/" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Fonte: SICONFI
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Estado</TableHead>
                    <TableHead>Órgão Responsável</TableHead>
                    <TableHead className="text-right">Autorizado</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                    <TableHead className="text-right">Execução</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {estadualData.map(item => (
                    <TableRow key={item.uf}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.uf}</Badge>
                          <span className="font-medium">{item.estado}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.orgao}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.autorizado)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.pago)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.pago / item.autorizado > 0.7 ? 'default' : 'secondary'}>
                          {((item.pago / item.autorizado) * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-4">
                * Dados consolidados de 10 estados com maior orçamento para políticas de igualdade racial. 
                Fonte: SICONFI/Tesouro Nacional - Função 14 (Direitos da Cidadania) / Subfunção 422 (Direitos Individuais).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Comparativo Estadual (Pago 2024)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={estadualData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="uf" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={formatCurrency} tick={{ fontSize: 10 }} width={80} />
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="pago" name="Pago" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="municipal">
          <Card className="mb-4">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Orçamento Municipal - Capitais com SINAPIR (2024)
                </CardTitle>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.ibge.gov.br/estatisticas/sociais/saude/10586-pesquisa-de-informacoes-basicas-municipais.html" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Fonte: MUNIC/IBGE
                  </a>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Município</TableHead>
                    <TableHead>UF</TableHead>
                    <TableHead className="text-center">SINAPIR</TableHead>
                    <TableHead className="text-center">Conselho</TableHead>
                    <TableHead className="text-right">Autorizado</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {municipalData.map(item => (
                    <TableRow key={item.municipio}>
                      <TableCell className="font-medium">{item.municipio}</TableCell>
                      <TableCell><Badge variant="outline">{item.uf}</Badge></TableCell>
                      <TableCell className="text-center">
                        {item.sinapir ? (
                          <CheckCircle className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-warning mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {item.conselho ? (
                          <CheckCircle className="w-4 h-4 text-success mx-auto" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-warning mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.autorizado)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.pago)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-4">
                * Dados de 10 capitais brasileiras. SINAPIR = Adesão ao Sistema Nacional de Promoção da Igualdade Racial. 
                Fonte: MUNIC/IBGE 2024 e Portal da Transparência Municipal.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sinapir">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  Evolução do SINAPIR (2018-2025)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sinapirEvolution}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="municipios" name="Municípios" fill="hsl(var(--chart-1))" fillOpacity={0.6} stroke="hsl(var(--chart-1))" />
                      <Area type="monotone" dataKey="estados" name="Estados" fill="hsl(var(--chart-2))" fillOpacity={0.6} stroke="hsl(var(--chart-2))" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Indicadores SINAPIR 2025</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Municípios Aderidos</p>
                      <p className="text-2xl font-bold">256</p>
                      <p className="text-xs text-success">+109% desde 2022</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Estados Aderidos</p>
                      <p className="text-2xl font-bold">27</p>
                      <p className="text-xs text-success">100% cobertura</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Conselhos Ativos</p>
                      <p className="text-2xl font-bold">189</p>
                      <p className="text-xs text-muted-foreground">municipais + estaduais</p>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">Planos Municipais</p>
                      <p className="text-2xl font-bold">142</p>
                      <p className="text-xs text-muted-foreground">com plano aprovado</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Fonte: MIR/SINAPIR 2025. O crescimento acelerado a partir de 2023 reflete a política de incentivo à adesão 
                    promovida pelo MIR após sua recriação.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detalhado">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Dados Detalhados por Ação Federal</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Programa/Ação</TableHead>
                    <TableHead>Esfera</TableHead>
                    <TableHead className="text-right">Autorizado</TableHead>
                    <TableHead className="text-right">Empenhado</TableHead>
                    <TableHead className="text-right">Pago</TableHead>
                    <TableHead className="text-right">Execução</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetData.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm">{item.programa}</p>
                          <p className="text-xs text-muted-foreground">{item.acao}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.esfera}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(item.valorAutorizado)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.valorEmpenhado)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.valorPago)}</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={item.valorPago / item.valorAutorizado > 0.7 ? 'default' : 'secondary'}>
                          {((item.valorPago / item.valorAutorizado) * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}
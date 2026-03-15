import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database, FileCode, CheckCircle2, AlertTriangle, Layers, ExternalLink, 
  BarChart3, Users, Shield, Heart, GraduationCap, Baby, Briefcase, 
  Rainbow, Accessibility, MapPin, Info
} from 'lucide-react';
import { useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════
// INVENTÁRIO CRUZADO: Indicadores Estáticos (StatisticsData.ts) × BD
// Objetivo: mostrar como as duas fontes se complementam
// ═══════════════════════════════════════════════════════════════

interface IndicadorEstatico {
  nome: string;
  categoria: string;
  subcategoria?: string;
  fonte: string;
  urlFonte?: string;
  tipo: 'serie_temporal' | 'tabela' | 'dado_pontual' | 'cruzamento';
  registros: number;
  campos: string[];
  periodoInicio?: number;
  periodoFim?: number;
  grupoFocal?: string;
}

// Mapeamento completo dos indicadores estáticos em StatisticsData.ts
const INDICADORES_ESTATICOS: IndicadorEstatico[] = [
  // ── DADOS DEMOGRÁFICOS ──
  {
    nome: 'Composição Racial (Censo 2022)',
    categoria: 'Demografia',
    fonte: 'IBGE/SIDRA - Tabela 9605',
    urlFonte: 'https://sidra.ibge.gov.br/Tabela/9605',
    tipo: 'tabela',
    registros: 5,
    campos: ['raca', 'percentual', 'populacao'],
  },
  {
    nome: 'Evolução Composição Racial',
    categoria: 'Demografia',
    fonte: 'PNAD Contínua / SIDRA 6403',
    urlFonte: 'https://sidra.ibge.gov.br/Tabela/6403',
    tipo: 'serie_temporal',
    registros: 7,
    campos: ['branca', 'negra'],
    periodoInicio: 2018,
    periodoFim: 2024,
  },
  // ── SOCIOECONÔMICOS ──
  {
    nome: 'Indicadores Socioeconômicos',
    categoria: 'Trabalho e Renda',
    fonte: 'PNAD Contínua / SIDRA 6405, 6402',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/6405',
    tipo: 'serie_temporal',
    registros: 7,
    campos: ['rendaMediaNegra', 'rendaMediaBranca', 'desempregoNegro', 'desempregoBranco', 'pobreza_negra', 'pobreza_branca'],
    periodoInicio: 2018,
    periodoFim: 2024,
  },
  {
    nome: 'Rendimentos Censo 2022',
    categoria: 'Trabalho e Renda',
    fonte: 'IBGE Censo 2022',
    tipo: 'tabela',
    registros: 5,
    campos: ['raca', 'rendimento', 'razaoMedia'],
  },
  {
    nome: 'Trabalho Raça × Gênero',
    categoria: 'Trabalho e Renda',
    subcategoria: 'Interseccional',
    fonte: 'DIEESE 2025',
    urlFonte: 'https://www.dieese.org.br/infografico/2025/conscienciaNegraInfo.html',
    tipo: 'cruzamento',
    registros: 3,
    campos: ['homemBranco', 'mulherBranca', 'homemNegro', 'mulherNegra'],
    grupoFocal: 'Mulheres Negras',
  },
  {
    nome: 'Interseccionalidade Trabalho (4 grupos)',
    categoria: 'Trabalho e Renda',
    subcategoria: 'Interseccional',
    fonte: 'DIEESE 2025',
    tipo: 'tabela',
    registros: 4,
    campos: ['grupo', 'renda', 'desemprego', 'informalidade'],
  },
  // ── SEGURANÇA PÚBLICA ──
  {
    nome: 'Segurança Pública (série)',
    categoria: 'Segurança Pública',
    fonte: 'Atlas da Violência 2025 / FBSP',
    urlFonte: 'https://www.ipea.gov.br/atlasviolencia',
    tipo: 'serie_temporal',
    registros: 7,
    campos: ['homicidioNegro', 'homicidioBranco', 'letalidadePolicial', 'percentualVitimasNegras', 'razaoRisco'],
    periodoInicio: 2018,
    periodoFim: 2024,
  },
  {
    nome: 'Feminicídio (série)',
    categoria: 'Segurança Pública',
    subcategoria: 'Gênero',
    fonte: '19º Anuário FBSP 2025',
    urlFonte: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    tipo: 'serie_temporal',
    registros: 7,
    campos: ['totalFeminicidios', 'percentualNegras'],
    periodoInicio: 2018,
    periodoFim: 2024,
    grupoFocal: 'Mulheres Negras',
  },
  {
    nome: 'Atlas da Violência 2025 (dados estruturados)',
    categoria: 'Segurança Pública',
    fonte: 'IPEA/FBSP',
    urlFonte: 'https://www.ipea.gov.br/atlasviolencia',
    tipo: 'dado_pontual',
    registros: 1,
    campos: ['taxaHomicidio', 'riscoRelativo', 'concentracaoRacial', 'juventude15_29', 'ivjn'],
  },
  {
    nome: 'Violência Interseccional',
    categoria: 'Segurança Pública',
    subcategoria: 'Gênero',
    fonte: '19º Anuário FBSP 2025',
    tipo: 'tabela',
    registros: 3,
    campos: ['tipo', 'mulherNegra', 'mulherBranca'],
    grupoFocal: 'Mulheres Negras',
  },
  {
    nome: 'Juventude Negra (indicadores)',
    categoria: 'Segurança Pública',
    subcategoria: 'Juventude',
    fonte: 'Atlas 2025 / PNAD / SISDEPEN',
    tipo: 'tabela',
    registros: 4,
    campos: ['indicador', 'valor', 'referencia'],
    grupoFocal: 'Juventude Negra',
  },
  // ── EDUCAÇÃO ──
  {
    nome: 'Educação (série histórica)',
    categoria: 'Educação',
    fonte: 'PNAD Contínua / SIDRA 7129, 7125',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7129',
    tipo: 'serie_temporal',
    registros: 5,
    campos: ['superiorNegroPercent', 'superiorBrancoPercent', 'analfabetismoNegro', 'analfabetismoBranco'],
    periodoInicio: 2018,
    periodoFim: 2024,
  },
  {
    nome: 'Educação Raça × Gênero',
    categoria: 'Educação',
    subcategoria: 'Interseccional',
    fonte: 'Informe MIR 2023 / PNAD',
    tipo: 'cruzamento',
    registros: 4,
    campos: ['mulherNegra', 'mulherBranca', 'homemNegro', 'homemBranco'],
    grupoFocal: 'Mulheres Negras',
  },
  // ── SAÚDE ──
  {
    nome: 'Saúde (série histórica)',
    categoria: 'Saúde',
    fonte: 'DataSUS/SIM + SINASC',
    urlFonte: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def',
    tipo: 'serie_temporal',
    registros: 6,
    campos: ['mortalidadeMaternaNegra', 'mortalidadeMaternaBranca', 'mortalidadeInfantilNegra', 'mortalidadeInfantilBranca'],
    periodoInicio: 2018,
    periodoFim: 2023,
  },
  {
    nome: 'Saúde Materna Raça (RASEAM/IEPS)',
    categoria: 'Saúde',
    subcategoria: 'Interseccional',
    fonte: 'RASEAM 2025 / IEPS Jul/2025',
    tipo: 'dado_pontual',
    registros: 1,
    campos: ['mortalidadeMaternaNegraPercentual', 'razaoMortalidadePretasBrancas', 'taxaPretasPor100milNV'],
    grupoFocal: 'Mulheres Negras',
  },
  // ── LGBTQIA+ ──
  {
    nome: 'Violência Trans (série ANTRA)',
    categoria: 'LGBTQIA+',
    fonte: 'Dossiê ANTRA',
    urlFonte: 'https://antrabrasil.org/assassinatos/',
    tipo: 'serie_temporal',
    registros: 9,
    campos: ['totalAssassinatos', 'negros', 'brancos', 'indigenas'],
    periodoInicio: 2017,
    periodoFim: 2025,
    grupoFocal: 'LGBTQIA+ Negros',
  },
  // ── DEFICIÊNCIA ──
  {
    nome: 'Deficiência por Raça',
    categoria: 'Deficiência',
    fonte: 'SIDRA 9324 + 9339 (PNAD 2022)',
    urlFonte: 'https://sidra.ibge.gov.br/Tabela/9324',
    tipo: 'tabela',
    registros: 4,
    campos: ['raca', 'taxaDeficiencia', 'empregabilidade', 'rendaMedia'],
    grupoFocal: 'PcD Negros',
  },
  // ── CLASSE SOCIAL ──
  {
    nome: 'Pobreza por Raça',
    categoria: 'Classe Social',
    fonte: 'SIS/IBGE 2024',
    urlFonte: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html',
    tipo: 'tabela',
    registros: 2,
    campos: ['faixa', 'branca', 'parda', 'preta', 'total'],
  },
  // ── POVOS TRADICIONAIS ──
  {
    nome: 'Indígenas (dados estruturados)',
    categoria: 'Povos Tradicionais',
    fonte: 'IBGE Censo 2022 / FUNAI / ISA',
    urlFonte: 'https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22326-indigenas-2.html',
    tipo: 'dado_pontual',
    registros: 1,
    campos: ['populacao', 'etnias', 'linguas', 'terrasHomologadas', 'infraestrutura'],
    grupoFocal: 'Indígenas',
  },
  {
    nome: 'Quilombolas (dados estruturados)',
    categoria: 'Povos Tradicionais',
    fonte: 'IBGE Censo 2022 / SIDRA 9578',
    urlFonte: 'https://sidra.ibge.gov.br/Tabela/9578',
    tipo: 'dado_pontual',
    registros: 1,
    campos: ['populacao', 'comunidades', 'territorios', 'infraestrutura'],
    grupoFocal: 'Quilombolas',
  },
  {
    nome: 'Pop. Negra — Infraestrutura domiciliar',
    categoria: 'Povos Tradicionais',
    fonte: 'IBGE Censo 2022 (Fev/2024)',
    urlFonte: 'https://censo2022.ibge.gov.br/panorama/indicadores.html?localidade=BR&tema=8',
    tipo: 'dado_pontual',
    registros: 1,
    campos: ['aguaRedeGeral', 'esgotoAdequado', 'coletaLixo'],
    grupoFocal: 'Negros',
  },
  // ── EVOLUÇÃO DESIGUALDADE ──
  {
    nome: 'Evolução Desigualdade (razões)',
    categoria: 'Síntese',
    fonte: 'PNAD / FBSP / Atlas',
    tipo: 'serie_temporal',
    registros: 7,
    campos: ['razaoRenda', 'razaoDesemprego', 'razaoHomicidio'],
    periodoInicio: 2018,
    periodoFim: 2024,
  },
  // ── CHEFIA FAMILIAR ──
  {
    nome: 'Chefia Familiar Raça × Gênero',
    categoria: 'Vulnerabilidade',
    fonte: 'RASEAM 2025 / Fiocruz/DSBR 2023 / SIDRA 9553',
    tipo: 'cruzamento',
    registros: 1,
    campos: ['mulheresChefes', 'percentualNegras', 'insegurancaAlimentar', 'cadUnico'],
    grupoFocal: 'Mulheres Negras',
  },
];

// Mapeamento de categorias a ícones
const CATEGORIA_ICONS: Record<string, React.ReactNode> = {
  'Demografia': <Users className="w-4 h-4" />,
  'Trabalho e Renda': <Briefcase className="w-4 h-4" />,
  'Segurança Pública': <Shield className="w-4 h-4" />,
  'Educação': <GraduationCap className="w-4 h-4" />,
  'Saúde': <Heart className="w-4 h-4" />,
  'LGBTQIA+': <Rainbow className="w-4 h-4" />,
  'Deficiência': <Accessibility className="w-4 h-4" />,
  'Classe Social': <Briefcase className="w-4 h-4" />,
  'Povos Tradicionais': <MapPin className="w-4 h-4" />,
  'Síntese': <BarChart3 className="w-4 h-4" />,
  'Vulnerabilidade': <AlertTriangle className="w-4 h-4" />,
};

const TIPO_LABELS: Record<string, { label: string; color: string }> = {
  serie_temporal: { label: 'Série Temporal', color: 'bg-primary/10 text-primary' },
  tabela: { label: 'Tabela', color: 'bg-chart-2/10 text-chart-2' },
  dado_pontual: { label: 'Dado Pontual', color: 'bg-chart-3/10 text-chart-3' },
  cruzamento: { label: '🔀 Cruzamento', color: 'bg-accent text-accent-foreground' },
};

export function InventarioCruzadoTab() {
  const { data: indicadoresBD, isLoading } = useIndicadoresInterseccionais();
  const [filtroCategoria, setFiltroCategoria] = useState<string>('Todos');

  const indicadoresBDList = useMemo(() => {
    if (!indicadoresBD) return [];
    return indicadoresBD.map((ind: any) => ({
      nome: ind.nome,
      categoria: ind.categoria,
      subcategoria: ind.subcategoria,
      fonte: ind.fonte,
      url_fonte: ind.url_fonte,
      documento_origem: ind.documento_origem,
      tendencia: ind.tendencia,
    }));
  }, [indicadoresBD]);

  // Agrupar estáticos por categoria
  const categoriasEstaticas = useMemo(() => {
    const cats: Record<string, IndicadorEstatico[]> = {};
    INDICADORES_ESTATICOS.forEach(ind => {
      if (!cats[ind.categoria]) cats[ind.categoria] = [];
      cats[ind.categoria].push(ind);
    });
    return cats;
  }, []);

  // Agrupar BD por categoria
  const categoriasBD = useMemo(() => {
    const cats: Record<string, typeof indicadoresBDList> = {};
    indicadoresBDList.forEach(ind => {
      if (!cats[ind.categoria]) cats[ind.categoria] = [];
      cats[ind.categoria].push(ind);
    });
    return cats;
  }, [indicadoresBDList]);

  // Todas as categorias (union)
  const todasCategorias = useMemo(() => {
    const set = new Set([
      ...Object.keys(categoriasEstaticas),
      ...Object.keys(categoriasBD),
    ]);
    return ['Todos', ...Array.from(set).sort()];
  }, [categoriasEstaticas, categoriasBD]);

  // Totais
  const totalRegistrosEstaticos = INDICADORES_ESTATICOS.reduce((s, i) => s + i.registros, 0);
  const totalBD = indicadoresBDList.length;
  const categoriasApenasCodigo = Object.keys(categoriasEstaticas).filter(c => !categoriasBD[c]);
  const categoriasApenasBD = Object.keys(categoriasBD).filter(c => !categoriasEstaticas[c]);
  const categoriasAmbas = Object.keys(categoriasEstaticas).filter(c => categoriasBD[c]);

  // Grupos focais cobertos
  const gruposFocaisEstaticos = new Set(INDICADORES_ESTATICOS.filter(i => i.grupoFocal).map(i => i.grupoFocal!));

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Layers className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Inventário Cruzado — Dados Estáticos × Banco de Dados</h3>
              <p className="text-sm text-muted-foreground">
                Mapeamento de <strong>como as duas fontes de dados se complementam</strong>. 
                Os indicadores estáticos (código-fonte) cobrem séries temporais auditadas com deep links. 
                Os indicadores do BD permitem ingestão dinâmica e atualização contínua.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-primary/10 text-primary gap-1"><FileCode className="w-3 h-3" /> {INDICADORES_ESTATICOS.length} séries estáticas</Badge>
                <Badge className="bg-chart-2/10 text-chart-2 gap-1"><Database className="w-3 h-3" /> {totalBD} indicadores BD</Badge>
                <Badge variant="outline" className="gap-1">~{totalRegistrosEstaticos} registros estáticos</Badge>
                <Badge variant="outline" className="gap-1">{gruposFocaisEstaticos.size} grupos focais cobertos</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo visual */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Categorias com ambas as fontes</p>
            <p className="text-2xl font-bold text-primary">{categoriasAmbas.length}</p>
            <p className="text-xs text-muted-foreground mt-1">complementaridade ativa</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-3">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Apenas no código</p>
            <p className="text-2xl font-bold">{categoriasApenasCodigo.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{categoriasApenasCodigo.join(', ') || '—'}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-2">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Apenas no BD</p>
            <p className="text-2xl font-bold">{categoriasApenasBD.length}</p>
            <p className="text-xs text-muted-foreground mt-1">{categoriasApenasBD.join(', ') || '—'}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Grupos Focais c/ dados</p>
            <p className="text-2xl font-bold text-success">{gruposFocaisEstaticos.size}</p>
            <p className="text-xs text-muted-foreground mt-1 truncate">{Array.from(gruposFocaisEstaticos).join(', ')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtro por categoria */}
      <div className="flex flex-wrap gap-2">
        {todasCategorias.map(cat => (
          <Badge
            key={cat}
            variant={filtroCategoria === cat ? 'default' : 'outline'}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setFiltroCategoria(cat)}
          >
            {cat !== 'Todos' && CATEGORIA_ICONS[cat]}
            {cat}
          </Badge>
        ))}
      </div>

      <Tabs defaultValue="lado-a-lado">
        <TabsList>
          <TabsTrigger value="lado-a-lado">Lado a Lado</TabsTrigger>
          <TabsTrigger value="estaticos">Estáticos ({INDICADORES_ESTATICOS.length})</TabsTrigger>
          <TabsTrigger value="bd">Banco de Dados ({totalBD})</TabsTrigger>
        </TabsList>

        {/* LADO A LADO */}
        <TabsContent value="lado-a-lado">
          <div className="space-y-4">
            {(filtroCategoria === 'Todos' ? Object.keys(categoriasEstaticas).sort() : [filtroCategoria]).filter(c => categoriasEstaticas[c] || categoriasBD[c]).map(cat => (
              <Card key={cat}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    {CATEGORIA_ICONS[cat] || <Layers className="w-4 h-4" />}
                    <CardTitle className="text-base">{cat}</CardTitle>
                    <div className="flex gap-2 ml-auto">
                      {categoriasEstaticas[cat] && <Badge className="bg-primary/10 text-primary text-xs"><FileCode className="w-3 h-3 mr-1" />{categoriasEstaticas[cat].length} estáticos</Badge>}
                      {categoriasBD[cat] && <Badge className="bg-chart-2/10 text-chart-2 text-xs"><Database className="w-3 h-3 mr-1" />{categoriasBD[cat].length} no BD</Badge>}
                      {categoriasEstaticas[cat] && categoriasBD[cat] && <Badge className="bg-success/10 text-success text-xs"><CheckCircle2 className="w-3 h-3 mr-1" />Complementar</Badge>}
                      {categoriasEstaticas[cat] && !categoriasBD[cat] && <Badge variant="outline" className="text-xs text-muted-foreground">Só código</Badge>}
                      {!categoriasEstaticas[cat] && categoriasBD[cat] && <Badge variant="outline" className="text-xs text-muted-foreground">Só BD</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Coluna Estáticos */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><FileCode className="w-3 h-3" /> CÓDIGO-FONTE (StatisticsData.ts)</p>
                      {categoriasEstaticas[cat] ? (
                        <div className="space-y-2">
                          {categoriasEstaticas[cat].map((ind, i) => (
                            <div key={i} className="p-2 rounded-md border bg-card hover:bg-accent/5 transition-colors">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <p className="text-sm font-medium truncate">{ind.nome}</p>
                                  <p className="text-xs text-muted-foreground">{ind.fonte}</p>
                                </div>
                                <Badge className={cn('text-[10px] shrink-0', TIPO_LABELS[ind.tipo].color)}>
                                  {TIPO_LABELS[ind.tipo].label}
                                </Badge>
                              </div>
                              <div className="flex flex-wrap gap-1 mt-1.5">
                                <Badge variant="outline" className="text-[10px]">{ind.registros} reg.</Badge>
                                {ind.periodoInicio && <Badge variant="outline" className="text-[10px]">{ind.periodoInicio}–{ind.periodoFim}</Badge>}
                                {ind.grupoFocal && <Badge className="text-[10px] bg-accent text-accent-foreground">{ind.grupoFocal}</Badge>}
                              </div>
                              {ind.urlFonte && (
                                <a href={ind.urlFonte} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-0.5 mt-1">
                                  <ExternalLink className="w-2.5 h-2.5" /> Fonte
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-md border border-dashed text-center">
                          <p className="text-xs text-muted-foreground">Sem dados estáticos nesta categoria</p>
                        </div>
                      )}
                    </div>

                    {/* Coluna BD */}
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1"><Database className="w-3 h-3" /> BANCO DE DADOS (indicadores_interseccionais)</p>
                      {isLoading ? (
                        <div className="space-y-2">
                          <Skeleton className="h-14 w-full" />
                          <Skeleton className="h-14 w-full" />
                        </div>
                      ) : categoriasBD[cat] ? (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                          {categoriasBD[cat].map((ind, i) => (
                            <div key={i} className="p-2 rounded-md border bg-card hover:bg-accent/5 transition-colors">
                              <p className="text-sm font-medium truncate">{ind.nome}</p>
                              <p className="text-xs text-muted-foreground">{ind.fonte}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {ind.subcategoria && <Badge variant="outline" className="text-[10px]">{ind.subcategoria}</Badge>}
                                {ind.tendencia && <Badge variant="outline" className="text-[10px]">{ind.tendencia}</Badge>}
                                {ind.documento_origem?.map((doc: string, j: number) => (
                                  <Badge key={j} variant="outline" className="text-[10px] bg-muted">{doc}</Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="p-3 rounded-md border border-dashed text-center">
                          <p className="text-xs text-muted-foreground">Sem dados no BD nesta categoria</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Nota de complementaridade */}
                  {categoriasEstaticas[cat] && categoriasBD[cat] && (
                    <div className="mt-3 p-2 bg-success/5 border border-success/20 rounded-md">
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Info className="w-3 h-3 text-success" />
                        <strong>Complementaridade:</strong> O código fornece séries temporais auditadas com deep links. O BD permite atualização dinâmica e ingestão de novas fontes.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ESTÁTICOS */}
        <TabsContent value="estaticos">
          <Card>
            <CardContent className="pt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Indicador</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Registros</TableHead>
                    <TableHead>Período</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Grupo Focal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {INDICADORES_ESTATICOS.filter(i => filtroCategoria === 'Todos' || i.categoria === filtroCategoria).map((ind, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-sm max-w-[200px] truncate">{ind.nome}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">{ind.categoria}</Badge></TableCell>
                      <TableCell><Badge className={cn('text-[10px]', TIPO_LABELS[ind.tipo].color)}>{TIPO_LABELS[ind.tipo].label}</Badge></TableCell>
                      <TableCell className="text-center">{ind.registros}</TableCell>
                      <TableCell className="text-xs">{ind.periodoInicio ? `${ind.periodoInicio}–${ind.periodoFim}` : '—'}</TableCell>
                      <TableCell className="text-xs max-w-[150px] truncate">
                        {ind.urlFonte ? (
                          <a href={ind.urlFonte} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                            <ExternalLink className="w-3 h-3 shrink-0" /> {ind.fonte}
                          </a>
                        ) : ind.fonte}
                      </TableCell>
                      <TableCell>{ind.grupoFocal ? <Badge className="text-[10px] bg-accent text-accent-foreground">{ind.grupoFocal}</Badge> : '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BD */}
        <TabsContent value="bd">
          <Card>
            <CardContent className="pt-4">
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indicador</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Subcategoria</TableHead>
                      <TableHead>Fonte</TableHead>
                      <TableHead>Tendência</TableHead>
                      <TableHead>Docs. Origem</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indicadoresBDList.filter(i => filtroCategoria === 'Todos' || i.categoria === filtroCategoria).map((ind, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-medium text-sm max-w-[200px] truncate">{ind.nome}</TableCell>
                        <TableCell><Badge variant="outline" className="text-xs">{ind.categoria}</Badge></TableCell>
                        <TableCell className="text-xs">{ind.subcategoria || '—'}</TableCell>
                        <TableCell className="text-xs max-w-[150px] truncate">
                          {ind.url_fonte ? (
                            <a href={ind.url_fonte} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                              <ExternalLink className="w-3 h-3 shrink-0" /> {ind.fonte}
                            </a>
                          ) : ind.fonte}
                        </TableCell>
                        <TableCell className="text-xs">{ind.tendencia || '—'}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-0.5">
                            {ind.documento_origem?.map((doc: string, j: number) => (
                              <Badge key={j} variant="outline" className="text-[10px]">{doc}</Badge>
                            )) || '—'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

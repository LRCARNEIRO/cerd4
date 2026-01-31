import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, CheckCircle2, AlertTriangle, Globe, BookOpen, FileCheck, ListChecks, ExternalLink, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useLacunasIdentificadas, useRespostasLacunasCerdIII, useLacunasStats, useConclusoesAnaliticas } from '@/hooks/useLacunasData';

// Estrutura Common Core Document (HRI/CORE/BRA)
const commonCoreEstrutura = [
  {
    secao: 'I',
    titulo: 'General information about the reporting State',
    tituloPortugues: 'Informações gerais sobre o Estado',
    subsecoes: [
      { num: 'A', titulo: 'Demographic, economic, social and cultural characteristics', status: 'atualizado', fontes: ['Censo 2022', 'PNAD', 'PIB/IBGE'] },
      { num: 'B', titulo: 'Constitutional, political and legal structure', status: 'atualizado', fontes: ['Constituição', 'STF', 'TSE'] }
    ]
  },
  {
    secao: 'II',
    titulo: 'General framework for the protection and promotion of human rights',
    tituloPortugues: 'Marco geral de proteção e promoção dos direitos humanos',
    subsecoes: [
      { num: 'A', titulo: 'Acceptance of international human rights norms', status: 'atualizado', fontes: ['MRE', 'ONU'] },
      { num: 'B', titulo: 'Legal framework for the protection of human rights', status: 'parcial', fontes: ['STF', 'MDHC'] },
      { num: 'C', titulo: 'Framework for promotion of human rights at national level', status: 'parcial', fontes: ['MDHC', 'MIR'] },
      { num: 'D', titulo: 'Reporting process at the national level', status: 'atualizado', fontes: ['CDG/UFF', 'MRE'] }
    ]
  },
  {
    secao: 'III',
    titulo: 'Information on non-discrimination, equality and effective remedies',
    tituloPortugues: 'Informações sobre não-discriminação, igualdade e recursos efetivos',
    subsecoes: [
      { num: 'A', titulo: 'Non-discrimination and equality', status: 'atualizado', fontes: ['Constituição', 'Leis antidiscriminação'] },
      { num: 'B', titulo: 'Effective remedies', status: 'parcial', fontes: ['Judiciário', 'Ouvidorias'] }
    ]
  }
];

// Estrutura CERD IV (Relatório Periódico)
const cerdIVEstrutura = [
  { parte: 'I', titulo: 'Introdução', conteudo: 'Metodologia, período de cobertura (2018-2026), participação da sociedade civil', status: 'rascunho' },
  { parte: 'II', titulo: 'Respostas às Observações Finais (CERD/C/BRA/CO/18-20)', conteudo: 'Resposta ponto a ponto às recomendações de 2022', status: 'em_elaboracao' },
  { parte: 'III', titulo: 'Medidas legislativas, judiciárias e administrativas', conteudo: 'Novas leis, decisões judiciais e políticas públicas 2018-2026', status: 'em_elaboracao' },
  { parte: 'IV', titulo: 'Aplicação dos artigos da Convenção', conteudo: 'Art. 2 a 7 - Medidas específicas por artigo', status: 'pendente' },
  { parte: 'V', titulo: 'Dados estatísticos desagregados', conteudo: 'Indicadores interseccionais: raça × gênero × idade × classe × deficiência', status: 'coletado' },
  { parte: 'VI', titulo: 'Povos tradicionais', conteudo: 'Indígenas, quilombolas e ciganos - situação e políticas', status: 'em_elaboracao' },
  { parte: 'VII', titulo: 'Conclusões e compromissos', conteudo: 'Síntese de avanços, lacunas e plano de ação', status: 'pendente' }
];

const statusLabels: Record<string, { label: string; color: string }> = {
  atualizado: { label: 'Atualizado', color: 'bg-success text-success-foreground' },
  parcial: { label: 'Parcial', color: 'bg-warning text-warning-foreground' },
  desatualizado: { label: 'Desatualizado', color: 'bg-destructive text-destructive-foreground' },
  rascunho: { label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  em_elaboracao: { label: 'Em elaboração', color: 'bg-primary/70 text-primary-foreground' },
  pendente: { label: 'Pendente', color: 'bg-destructive/70 text-destructive-foreground' },
  coletado: { label: 'Dados coletados', color: 'bg-success/70 text-success-foreground' },
  cumprido: { label: 'Cumprido', color: 'bg-success text-success-foreground' },
  parcialmente_cumprido: { label: 'Parcial', color: 'bg-warning text-warning-foreground' },
  nao_cumprido: { label: 'Não Cumprido', color: 'bg-destructive text-destructive-foreground' },
  retrocesso: { label: 'Retrocesso', color: 'bg-destructive text-destructive-foreground' },
  em_andamento: { label: 'Em andamento', color: 'bg-primary text-primary-foreground' }
};

export default function GerarRelatorios() {
  const { data: lacunas, isLoading: loadingLacunas } = useLacunasIdentificadas();
  const { data: respostasCerd, isLoading: loadingRespostas } = useRespostasLacunasCerdIII();
  const { data: stats, isLoading: loadingStats } = useLacunasStats();
  const { data: conclusoes, isLoading: loadingConclusoes } = useConclusoesAnaliticas();

  const isLoading = loadingLacunas || loadingRespostas || loadingStats || loadingConclusoes;

  // Calcular progresso baseado nos dados reais
  const totalLacunas = stats?.total || 0;
  const cumpridas = stats?.porStatus.cumprido || 0;
  const parciais = stats?.porStatus.parcialmente_cumprido || 0;
  const progressoReal = totalLacunas > 0 ? Math.round(((cumpridas * 100) + (parciais * 50)) / totalLacunas) : 0;

  const progressoRelatorios = {
    commonCore: {
      nome: 'Common Core Document (HRI/CORE/BRA)',
      periodo: '2018-2026',
      progresso: 72,
      prazo: 'Dezembro 2025',
      responsavel: 'CDG/UFF + MRE'
    },
    cerdIV: {
      nome: 'CERD IV - Relatório Periódico',
      periodo: '2018-2026',
      progresso: progressoReal,
      prazo: 'Março 2026',
      responsavel: 'CDG/UFF + MIR + MRE'
    }
  };

  // Contagem de respostas por status
  const respostasStats = {
    cumprido: respostasCerd?.filter(r => r.grau_atendimento === 'cumprido').length || 0,
    parcialmente_cumprido: respostasCerd?.filter(r => r.grau_atendimento === 'parcialmente_cumprido').length || 0,
    nao_cumprido: respostasCerd?.filter(r => r.grau_atendimento === 'nao_cumprido').length || 0,
    em_andamento: respostasCerd?.filter(r => r.grau_atendimento === 'em_andamento').length || 0,
  };

  return (
    <DashboardLayout
      title="Gerar Relatórios"
      subtitle="Common Core Document (HRI/CORE/BRA) e CERD IV (2018-2026)"
    >
      {/* Status Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-5 h-5 text-primary" />
              {progressoRelatorios.commonCore.nome}
            </CardTitle>
            <CardDescription>Período: {progressoRelatorios.commonCore.periodo}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Progresso</span>
                  <span className="text-sm font-bold">{progressoRelatorios.commonCore.progresso}%</span>
                </div>
                <Progress value={progressoRelatorios.commonCore.progresso} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Prazo:</p>
                  <p className="font-medium">{progressoRelatorios.commonCore.prazo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Responsável:</p>
                  <p className="font-medium">{progressoRelatorios.commonCore.responsavel}</p>
                </div>
              </div>
              <Button className="w-full gap-2">
                <Download className="w-4 h-4" />
                Gerar Rascunho Common Core
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-t-4 border-t-accent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Globe className="w-5 h-5 text-accent" />
              {progressoRelatorios.cerdIV.nome}
            </CardTitle>
            <CardDescription>Período: {progressoRelatorios.cerdIV.periodo}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Progresso (baseado no banco)</span>
                  <span className="text-sm font-bold">{progressoRelatorios.cerdIV.progresso}%</span>
                </div>
                <Progress value={progressoRelatorios.cerdIV.progresso} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Prazo:</p>
                  <p className="font-medium">{progressoRelatorios.cerdIV.prazo}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Lacunas no banco:</p>
                  <p className="font-medium">{totalLacunas}</p>
                </div>
              </div>
              <Button variant="secondary" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Gerar Rascunho CERD IV
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="lacunas-db" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="lacunas-db" className="gap-1">
            <AlertTriangle className="w-4 h-4" /> Lacunas (Banco de Dados)
          </TabsTrigger>
          <TabsTrigger value="respostas-db" className="gap-1">
            <FileCheck className="w-4 h-4" /> Respostas CERD III
          </TabsTrigger>
          <TabsTrigger value="common-core" className="gap-1">
            <BookOpen className="w-4 h-4" /> Estrutura Common Core
          </TabsTrigger>
          <TabsTrigger value="cerd-iv" className="gap-1">
            <FileText className="w-4 h-4" /> Estrutura CERD IV
          </TabsTrigger>
          <TabsTrigger value="guidelines" className="gap-1">
            <ListChecks className="w-4 h-4" /> Guidelines
          </TabsTrigger>
        </TabsList>

        {/* ABA: LACUNAS DO BANCO */}
        <TabsContent value="lacunas-db">
          <Card className="mb-6 border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Lacunas Identificadas para o Relatório CERD IV</h3>
                  <p className="text-sm text-muted-foreground">
                    {totalLacunas} lacunas mapeadas no banco de dados, vinculadas às recomendações do CERD/C/BRA/CO/18-20
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingLacunas ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando lacunas...</span>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {lacunas?.map((lacuna) => (
                  <Card key={lacuna.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-1">
                          <Badge variant="outline" className="font-mono">§{lacuna.paragrafo}</Badge>
                        </div>
                        <div className="md:col-span-2">
                          <p className="font-semibold text-sm">{lacuna.tema}</p>
                          <p className="text-xs text-muted-foreground">{lacuna.eixo_tematico.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="md:col-span-4">
                          <p className="text-xs text-muted-foreground mb-1">Lacuna identificada:</p>
                          <p className="text-sm line-clamp-2">{lacuna.descricao_lacuna}</p>
                        </div>
                        <div className="md:col-span-3">
                          <p className="text-xs text-muted-foreground mb-1">Resposta sugerida (CERD IV):</p>
                          <p className="text-sm line-clamp-2">{lacuna.resposta_sugerida_cerd_iv || 'Em elaboração'}</p>
                        </div>
                        <div className="md:col-span-2 flex flex-col items-end gap-1">
                          <Badge className={statusLabels[lacuna.status_cumprimento]?.color || 'bg-muted'}>
                            {statusLabels[lacuna.status_cumprimento]?.label || lacuna.status_cumprimento}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {lacuna.grupo_focal.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div className="p-3 bg-success/10 rounded-lg">
                      <p className="text-2xl font-bold text-success">{stats?.porStatus.cumprido || 0}</p>
                      <p className="text-xs text-muted-foreground">Cumpridas</p>
                    </div>
                    <div className="p-3 bg-warning/10 rounded-lg">
                      <p className="text-2xl font-bold text-warning">{stats?.porStatus.parcialmente_cumprido || 0}</p>
                      <p className="text-xs text-muted-foreground">Parciais</p>
                    </div>
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <p className="text-2xl font-bold text-destructive">{stats?.porStatus.nao_cumprido || 0}</p>
                      <p className="text-xs text-muted-foreground">Não Cumpridas</p>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-2xl font-bold">{stats?.porPrioridade.critica || 0}</p>
                      <p className="text-xs text-muted-foreground">Críticas</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{conclusoes?.length || 0}</p>
                      <p className="text-xs text-muted-foreground">Conclusões</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ABA: RESPOSTAS CERD III */}
        <TabsContent value="respostas-db">
          <Card className="mb-6 border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FileCheck className="w-6 h-6 text-warning flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Respostas às Lacunas do CERD III</h3>
                  <p className="text-sm text-muted-foreground">
                    {respostasCerd?.length || 0} críticas do relatório anterior com respostas estruturadas
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingRespostas ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {respostasCerd?.map((resposta) => (
                <Card key={resposta.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-1">
                        <Badge variant="outline" className="font-mono">§{resposta.paragrafo_cerd_iii}</Badge>
                      </div>
                      <div className="md:col-span-4">
                        <p className="text-xs text-muted-foreground mb-1">Crítica Original:</p>
                        <p className="text-sm">{resposta.critica_original}</p>
                      </div>
                      <div className="md:col-span-5">
                        <p className="text-xs text-muted-foreground mb-1">Resposta Brasil:</p>
                        <p className="text-sm">{resposta.resposta_brasil}</p>
                        {resposta.lacunas_remanescentes && resposta.lacunas_remanescentes.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-warning">Lacunas remanescentes:</p>
                            <ul className="text-xs text-muted-foreground">
                              {resposta.lacunas_remanescentes.slice(0, 2).map((l, i) => (
                                <li key={i}>• {l}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2 flex items-start justify-end">
                        <Badge className={statusLabels[resposta.grau_atendimento]?.color || 'bg-muted'}>
                          {statusLabels[resposta.grau_atendimento]?.label || resposta.grau_atendimento}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">{respostasStats.cumprido}</p>
                  <p className="text-xs text-muted-foreground">Atendidas</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-warning">{respostasStats.parcialmente_cumprido}</p>
                  <p className="text-xs text-muted-foreground">Parciais</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-2xl font-bold text-destructive">{respostasStats.nao_cumprido}</p>
                  <p className="text-xs text-muted-foreground">Não Atendidas</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{respostasStats.em_andamento}</p>
                  <p className="text-xs text-muted-foreground">Em Andamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: COMMON CORE */}
        <TabsContent value="common-core">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Estrutura do Common Core Document (HRI/CORE/BRA/2026)
              </CardTitle>
              <CardDescription>
                Documento base comum formando parte dos relatórios dos Estados-Parte - Atualização 2018-2026
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://tbinternet.ohchr.org/_layouts/15/treatybodyexternal/Download.aspx?symbolno=HRI%2FCORE%2FBRA%2F2020&Lang=en" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver versão atual (2020)
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://www.ohchr.org/en/treaty-bodies/harmonized-reporting-guidelines-2006" target="_blank" rel="noopener noreferrer">
                    <FileCheck className="w-4 h-4 mr-2" />
                    Guidelines OHCHR
                  </a>
                </Button>
              </div>

              <Accordion type="multiple" className="w-full">
                {commonCoreEstrutura.map((secao) => (
                  <AccordionItem key={secao.secao} value={secao.secao}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-3 flex-1">
                        <Badge variant="outline" className="font-mono">{secao.secao}</Badge>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{secao.titulo}</p>
                          <p className="text-xs text-muted-foreground">{secao.tituloPortugues}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-10 space-y-3">
                        {secao.subsecoes.map((sub) => (
                          <div key={sub.num} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-3">
                              <span className="font-mono text-sm">{secao.secao}.{sub.num}</span>
                              <span className="text-sm">{sub.titulo}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex gap-1">
                                {sub.fontes.map((f, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{f}</Badge>
                                ))}
                              </div>
                              <Badge className={statusLabels[sub.status].color}>
                                {statusLabels[sub.status].label}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: CERD IV */}
        <TabsContent value="cerd-iv">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" />
                Estrutura do CERD IV - Relatório Periódico (2018-2026)
              </CardTitle>
              <CardDescription>
                Relatório do Brasil ao Comitê para a Eliminação da Discriminação Racial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {cerdIVEstrutura.map((parte) => (
                  <div key={parte.parte} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="font-mono text-lg px-3 py-1">{parte.parte}</Badge>
                      <div>
                        <p className="font-medium">{parte.titulo}</p>
                        <p className="text-sm text-muted-foreground">{parte.conteudo}</p>
                      </div>
                    </div>
                    <Badge className={statusLabels[parte.status].color}>
                      {statusLabels[parte.status].label}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: GUIDELINES */}
        <TabsContent value="guidelines">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Common Core Document Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">HRI/GEN/2/Rev.6</p>
                  <p className="text-xs text-muted-foreground">Harmonized guidelines on reporting (2006, revisado)</p>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                    <span>Informações gerais sobre o Estado</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                    <span>Marco jurídico de proteção dos direitos humanos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                    <span>Não-discriminação e igualdade</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                    <span>Recursos efetivos</span>
                  </li>
                </ul>
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <a href="https://www.ohchr.org/en/treaty-bodies/harmonized-reporting-guidelines-2006" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Acessar Guidelines OHCHR
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="w-5 h-5 text-accent" />
                  CERD Reporting Guidelines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm font-medium">CERD/C/2007/1</p>
                  <p className="text-xs text-muted-foreground">Guidelines for CERD-specific document</p>
                </div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                    <span>Resposta às observações finais anteriores</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                    <span>Artigos 1-7 da Convenção</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                    <span>Dados estatísticos desagregados</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                    <span>Medidas legislativas, judiciais e administrativas</span>
                  </li>
                </ul>
                <Button variant="outline" size="sm" className="w-full mt-4" asChild>
                  <a href="https://tbinternet.ohchr.org/_layouts/15/TreatyBodyExternal/Treaty.aspx?Treaty=CERD" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Acessar CERD Treaty Body
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, Download, CheckCircle2, AlertTriangle, Globe, BookOpen, FileCheck, ListChecks, ExternalLink, Clock, Target, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

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
  {
    parte: 'I',
    titulo: 'Introdução',
    conteudo: 'Metodologia, período de cobertura (2018-2026), participação da sociedade civil',
    status: 'rascunho'
  },
  {
    parte: 'II',
    titulo: 'Respostas às Observações Finais (CERD/C/BRA/CO/18-20)',
    conteudo: 'Resposta ponto a ponto às recomendações de 2022',
    status: 'em_elaboracao'
  },
  {
    parte: 'III',
    titulo: 'Medidas legislativas, judiciárias e administrativas',
    conteudo: 'Novas leis, decisões judiciais e políticas públicas 2018-2026',
    status: 'em_elaboracao'
  },
  {
    parte: 'IV',
    titulo: 'Aplicação dos artigos da Convenção',
    conteudo: 'Art. 2 a 7 - Medidas específicas por artigo',
    status: 'pendente'
  },
  {
    parte: 'V',
    titulo: 'Dados estatísticos desagregados',
    conteudo: 'Indicadores interseccionais: raça × gênero × idade × classe × deficiência',
    status: 'coletado'
  },
  {
    parte: 'VI',
    titulo: 'Povos tradicionais',
    conteudo: 'Indígenas, quilombolas e ciganos - situação e políticas',
    status: 'em_elaboracao'
  },
  {
    parte: 'VII',
    titulo: 'Conclusões e compromissos',
    conteudo: 'Síntese de avanços, lacunas e plano de ação',
    status: 'pendente'
  }
];

// Lacunas apontadas pela ONU que precisam ser respondidas
const lacunasONU = [
  {
    paragrafo: '§7-8',
    tema: 'Dados estatísticos',
    critica: 'Falta de dados desagregados por raça, etnia, gênero, idade e outros marcadores',
    resposta: 'Sistema de indicadores interseccionais implementado com dados do Censo 2022, PNAD, RAIS e DataSUS',
    status: 'respondido'
  },
  {
    paragrafo: '§9-10',
    tema: 'Instituição Nacional de Direitos Humanos',
    critica: 'Ausência de instituição com status A dos Princípios de Paris',
    resposta: 'Proposta de criação do Conselho Nacional de Direitos Humanos com autonomia (PL em tramitação)',
    status: 'parcial'
  },
  {
    paragrafo: '§11-12',
    tema: 'Racismo institucional',
    critica: 'Necessidade de combate ao racismo estrutural nas instituições públicas',
    resposta: 'Programa de Enfrentamento ao Racismo Institucional (MIR/2024) e capacitação de servidores',
    status: 'em_andamento'
  },
  {
    paragrafo: '§13-14',
    tema: 'Violência policial',
    critica: 'Letalidade policial desproporcional contra jovens negros',
    resposta: 'Programa de câmeras corporais, revisão de protocolos operacionais e Juventude Negra Viva',
    status: 'insuficiente'
  },
  {
    paragrafo: '§15-16',
    tema: 'Direitos territoriais indígenas',
    critica: 'Paralisia na demarcação de terras e marco temporal',
    resposta: '11 terras homologadas (2023-2025), decisão STF contra marco temporal',
    status: 'respondido'
  },
  {
    paragrafo: '§17-18',
    tema: 'Comunidades quilombolas',
    critica: 'Baixa taxa de titulação e violência fundiária',
    resposta: 'Retomada de processos (12 títulos), Programa Aquilombar, mas déficit estrutural persiste',
    status: 'parcial'
  },
  {
    paragrafo: '§19-20',
    tema: 'Povos ciganos',
    critica: 'Invisibilidade estatística e ausência de políticas',
    resposta: 'Primeiro mapeamento MUNIC (2024), criação do GT Brasil Cigano',
    status: 'iniciado'
  },
  {
    paragrafo: '§21-22',
    tema: 'Mulheres afrodescendentes',
    critica: 'Violência e discriminação interseccional',
    resposta: 'Casas da Mulher com recorte racial, formação interseccional na segurança pública',
    status: 'parcial'
  },
  {
    paragrafo: '§23-24',
    tema: 'Educação antirracista',
    critica: 'Implementação deficiente da Lei 10.639/2003',
    resposta: 'Revisão curricular BNCC, formação de professores e materiais didáticos',
    status: 'em_andamento'
  },
  {
    paragrafo: '§25-26',
    tema: 'Acesso à justiça',
    critica: 'Barreiras para vítimas de discriminação racial',
    resposta: 'Defensorias especializadas, Núcleos de combate ao racismo no MP',
    status: 'parcial'
  }
];

const statusLabels: Record<string, { label: string; color: string }> = {
  atualizado: { label: 'Atualizado', color: 'bg-success text-success-foreground' },
  parcial: { label: 'Parcial', color: 'bg-warning text-warning-foreground' },
  desatualizado: { label: 'Desatualizado', color: 'bg-destructive text-destructive-foreground' },
  rascunho: { label: 'Rascunho', color: 'bg-muted text-muted-foreground' },
  em_elaboracao: { label: 'Em elaboração', color: 'bg-primary/70 text-primary-foreground' },
  pendente: { label: 'Pendente', color: 'bg-destructive/70 text-destructive-foreground' },
  coletado: { label: 'Dados coletados', color: 'bg-success/70 text-success-foreground' },
  respondido: { label: 'Respondido', color: 'bg-success text-success-foreground' },
  em_andamento: { label: 'Em andamento', color: 'bg-primary text-primary-foreground' },
  insuficiente: { label: 'Insuficiente', color: 'bg-destructive text-destructive-foreground' },
  iniciado: { label: 'Iniciado', color: 'bg-warning text-warning-foreground' }
};

// Progresso geral dos relatórios
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
    progresso: 45,
    prazo: 'Março 2026',
    responsavel: 'CDG/UFF + MIR + MRE'
  }
};

export default function GerarRelatorios() {
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
                  <span className="text-sm">Progresso</span>
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
                  <p className="text-muted-foreground">Responsável:</p>
                  <p className="font-medium">{progressoRelatorios.cerdIV.responsavel}</p>
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

      <Tabs defaultValue="lacunas" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="lacunas" className="gap-1">
            <AlertTriangle className="w-4 h-4" /> Lacunas ONU/CERD III
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

        {/* ABA: LACUNAS */}
        <TabsContent value="lacunas">
          <Card className="mb-6 border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Resposta às Observações Finais CERD/C/BRA/CO/18-20 (2022)</h3>
                  <p className="text-sm text-muted-foreground">
                    O Comitê CERD identificou lacunas críticas no relatório brasileiro. Esta seção mapeia cada ponto 
                    e a resposta preparada para o CERD IV.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {lacunasONU.map((item, i) => (
              <Card key={i}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-1">
                      <Badge variant="outline" className="font-mono">{item.paragrafo}</Badge>
                    </div>
                    <div className="md:col-span-2">
                      <p className="font-semibold text-sm">{item.tema}</p>
                    </div>
                    <div className="md:col-span-3">
                      <p className="text-xs text-muted-foreground mb-1">Crítica ONU:</p>
                      <p className="text-sm">{item.critica}</p>
                    </div>
                    <div className="md:col-span-4">
                      <p className="text-xs text-muted-foreground mb-1">Resposta Brasil:</p>
                      <p className="text-sm">{item.resposta}</p>
                    </div>
                    <div className="md:col-span-2 flex items-center justify-end">
                      <Badge className={statusLabels[item.status].color}>
                        {statusLabels[item.status].label}
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
                  <p className="text-2xl font-bold text-success">2</p>
                  <p className="text-xs text-muted-foreground">Respondidos</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">2</p>
                  <p className="text-xs text-muted-foreground">Em andamento</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-warning">4</p>
                  <p className="text-xs text-muted-foreground">Parciais</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-2xl font-bold text-destructive">1</p>
                  <p className="text-xs text-muted-foreground">Insuficiente</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">1</p>
                  <p className="text-xs text-muted-foreground">Iniciado</p>
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
                      <div className="space-y-3 pl-4">
                        {secao.subsecoes.map((sub) => (
                          <div key={sub.num} className="p-4 bg-muted/30 rounded-lg border">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="font-mono text-xs">{secao.secao}.{sub.num}</Badge>
                                <span className="text-sm font-medium">{sub.titulo}</span>
                              </div>
                              <Badge className={statusLabels[sub.status].color}>
                                {statusLabels[sub.status].label}
                              </Badge>
                            </div>
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">Fontes de dados:</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {sub.fontes.map((fonte, i) => (
                                  <Badge key={i} variant="outline" className="text-xs">{fonte}</Badge>
                                ))}
                              </div>
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
                Estrutura do CERD IV - Relatório Periódico do Brasil
              </CardTitle>
              <CardDescription>
                Quarto Relatório Periódico à Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="https://tbinternet.ohchr.org/_layouts/15/treatybodyexternal/Download.aspx?symbolno=CERD%2FC%2FBRA%2F18-20&Lang=en" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Ver CERD III (2018-2020)
                  </a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="https://tbinternet.ohchr.org/_layouts/15/treatybodyexternal/Download.aspx?symbolno=CERD%2FC%2F2007%2F1&Lang=en" target="_blank" rel="noopener noreferrer">
                    <FileCheck className="w-4 h-4 mr-2" />
                    Guidelines CERD
                  </a>
                </Button>
              </div>

              <div className="space-y-4">
                {cerdIVEstrutura.map((parte) => (
                  <Card key={parte.parte} className={cn(
                    'border-l-4',
                    parte.status === 'coletado' || parte.status === 'rascunho' ? 'border-l-success' :
                    parte.status === 'em_elaboracao' ? 'border-l-primary' :
                    'border-l-warning'
                  )}>
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <Badge variant="outline" className="font-mono text-lg px-3 py-1">{parte.parte}</Badge>
                          <div>
                            <h3 className="font-semibold">{parte.titulo}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{parte.conteudo}</p>
                          </div>
                        </div>
                        <Badge className={statusLabels[parte.status].color}>
                          {statusLabels[parte.status].label}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
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
                  Guidelines Common Core Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">HRI/GEN/2/Rev.6 (2009)</p>
                  <ul className="text-xs text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Máximo de 60-80 páginas
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Dados estatísticos desagregados (raça, gênero, idade, região)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Estrutura tripartite: I. Informações gerais, II. Marco de proteção, III. Não-discriminação
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Tabelas e anexos com indicadores socioeconômicos
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Atualização a cada 10 anos ou quando houver mudanças significativas
                    </li>
                  </ul>
                </div>
                <Button variant="outline" className="w-full" asChild>
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
                  Guidelines Relatório CERD
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">CERD/C/2007/1</p>
                  <ul className="text-xs text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Máximo de 40 páginas (+ anexos)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Responder a cada Observação Final do ciclo anterior
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Aplicação artigo por artigo (Art. 2-7 da ICERD)
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Indicadores quantitativos e qualitativos
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      Participação da sociedade civil na elaboração
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                      Atenção especial a: povos indígenas, afrodescendentes, migrantes
                    </li>
                  </ul>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href="https://tbinternet.ohchr.org/_layouts/15/treatybodyexternal/Download.aspx?symbolno=CERD%2FC%2F2007%2F1&Lang=en" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Acessar Guidelines CERD
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 bg-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Próximos Passos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Etapa 1</span>
                      </div>
                      <p className="text-sm font-medium">Finalizar coleta de dados</p>
                      <p className="text-xs text-muted-foreground">Prazo: Outubro 2025</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Etapa 2</span>
                      </div>
                      <p className="text-sm font-medium">Consulta sociedade civil</p>
                      <p className="text-xs text-muted-foreground">Prazo: Novembro 2025</p>
                    </div>
                    <div className="p-3 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">Etapa 3</span>
                      </div>
                      <p className="text-sm font-medium">Submissão à ONU</p>
                      <p className="text-xs text-muted-foreground">Prazo: Março 2026</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

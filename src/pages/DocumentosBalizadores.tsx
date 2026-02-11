import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, FileText, Globe, BookOpen, Scale, AlertTriangle, Shield, Users, Gavel, ClipboardList, Table, FileSearch, PenTool } from 'lucide-react';

interface DocumentoBalizador {
  titulo: string;
  tituloOriginal: string;
  tipo: string;
  data: string;
  sigla: string;
  descricao: string;
  arquivo: string;
  icon: React.ElementType;
  cor: string;
  paragrafosChave?: string[];
}

const documentos: DocumentoBalizador[] = [
  {
    titulo: 'Observações Finais ao Brasil (CERD/C/BRA/CO/18-20)',
    tituloOriginal: 'Concluding observations on the combined 18th to 20th periodic reports of Brazil',
    tipo: 'Observações Finais',
    data: '19/12/2022',
    sigla: 'CERD/C/BRA/CO/18-20',
    descricao: 'Documento central com 70 parágrafos de preocupações e recomendações da ONU ao Brasil. Abrange dados demográficos, marco institucional, acesso à justiça, saúde, educação, trabalho, moradia, representação política, discurso de ódio, violência policial, justiça criminal, perfilamento racial, religiões afro-brasileiras, defensores de direitos humanos, meio ambiente, povos indígenas e quilombolas, migrantes, ciganos e reparações históricas.',
    arquivo: '/documentos/CERD-Observacoes-Brasil-2022.pdf',
    icon: AlertTriangle,
    cor: 'text-destructive',
    paragrafosChave: ['§5-6 Dados', '§7-8 Legislação', '§9-10 Institucional', '§11-12 Justiça', '§13-14 Mulheres', '§15-17 Saúde/COVID', '§18-19 Educação', '§20-23 Trabalho/Renda', '§24-25 Moradia', '§26-27 Representação', '§30-31 Discurso de Ódio', '§32-33 Homicídios', '§34-36 Violência Policial', '§37-38 Justiça Criminal', '§39-40 Perfilamento Racial', '§43-44 Religiões', '§45-46 Defensores DDHH', '§47-48 Meio Ambiente', '§49-53 Indígenas/Quilombolas', '§54-55 Migrantes', '§56-57 Ciganos', '§58-60 Reparações']
  },
  {
    titulo: 'Follow-up do Brasil às Observações (CERD/C/BRA/FCO/18-20)',
    tituloOriginal: 'Information received from Brazil on follow-up to the concluding observations',
    tipo: 'Follow-up',
    data: '14/01/2026',
    sigla: 'CERD/C/BRA/FCO/18-20',
    descricao: 'Resposta do Brasil de janeiro de 2026 às recomendações prioritárias: §17(a) saúde e COVID-19, §19(c) educação, §23(a) pobreza e renda, §36(a-d) uso excessivo de força. Detalha ações do MIR, PRONASCI 2, Estratégia Antirracista de Saúde, PNEERQ, Bolsa Família e regulamentação do uso da força policial.',
    arquivo: '/documentos/CERD-Follow-up-Brasil-2026.pdf',
    icon: FileText,
    cor: 'text-primary',
    paragrafosChave: ['§17(a) Saúde/COVID', '§19(c) Educação', '§23(a) Pobreza', '§36(a-d) Uso de Força']
  },
  {
    titulo: 'Declaração e Plano de Ação de Durban (2001)',
    tituloOriginal: 'Durban Declaration and Programme of Action',
    tipo: 'Marco Internacional',
    data: '2001/2002',
    sigla: 'DDPA',
    descricao: 'Marco fundamental da III Conferência Mundial contra o Racismo. Estabelece compromissos sobre legislação (§114), instituições nacionais de DDHH (§90), educação antirracista (§117), povos indígenas e afrodescendentes. O Plano de Ação detalha medidas concretas em todas as áreas temáticas do sistema.',
    arquivo: '/documentos/Durban-Declaration-Action-Plan-2002.pdf',
    icon: Globe,
    cor: 'text-accent-foreground',
  },
  {
    titulo: 'Recomendações Gerais do CERD - Parágrafos Importantes',
    tituloOriginal: 'General Recommendations - Key Paragraphs',
    tipo: 'Compilação',
    data: '1997-2025',
    sigla: 'RGs CERD',
    descricao: 'Compilação dos parágrafos mais relevantes das Recomendações Gerais: RG 23 (Povos Indígenas), RG 31 (Justiça Criminal), RG 34 (Afrodescendentes), RG 35 (Discurso de Ódio), RG 36 (Perfilamento Racial), RG 37 (Saúde) e RG 38 (Xenofobia/Migrantes). Cada RG estabelece obrigações específicas dos Estados.',
    arquivo: '/documentos/Recomendacoes-Gerais-Paragrafos.docx',
    icon: BookOpen,
    cor: 'text-primary',
    paragrafosChave: ['RG 23 - Indígenas', 'RG 31 - Justiça Criminal', 'RG 34 - Afrodescendentes', 'RG 35 - Discurso de Ódio', 'RG 36 - Perfilamento Racial', 'RG 37 - Saúde', 'RG 38 - Xenofobia']
  },
  {
    titulo: 'Guidelines para Relatórios CERD (CERD/C/2007/1)',
    tituloOriginal: 'Guidelines for the CERD-specific document to be submitted by States parties',
    tipo: 'Diretrizes',
    data: '2007',
    sigla: 'CERD/C/2007/1',
    descricao: 'Diretrizes oficiais para elaboração dos relatórios periódicos dos Estados à CERD. Define a estrutura, conteúdo obrigatório e formato do documento específico CERD, complementar ao Common Core Document.',
    arquivo: '/documentos/CERD-Guidelines-2007.pdf',
    icon: Scale,
    cor: 'text-muted-foreground',
  },
  {
    titulo: 'Common Core Document do Brasil (HRI/CORE/BRA/2020)',
    tituloOriginal: 'Common Core Document - Brazil 2020',
    tipo: 'Common Core',
    data: '2020',
    sigla: 'HRI/CORE/BRA/2020',
    descricao: 'Versão mais recente do documento base do Brasil com 77 tabelas estatísticas cobrindo demografia, economia, indicadores sociais, educação, saúde e sistema de justiça. Base para atualização do período 2018-2026.',
    arquivo: '/documentos/CCD-Brasil-2020.pdf',
    icon: FileText,
    cor: 'text-primary',
  },
  {
    titulo: 'III Relatório CERD do Brasil',
    tituloOriginal: 'Combined 18th to 20th periodic reports of Brazil',
    tipo: 'Relatório Periódico',
    data: '2018-2020',
    sigla: 'CERD/C/BRA/18-20',
    descricao: 'Relatório periódico combinado (18º ao 20º) apresentado pelo Brasil à CERD. Contém as informações e respostas do Estado brasileiro que foram examinadas pelo Comitê em novembro de 2022.',
    arquivo: '/documentos/cerd-iii-relatorio-do-estado-brasileiro.pdf',
    icon: FileText,
    cor: 'text-muted-foreground',
  },
  {
    titulo: 'Compilação HRC - Brasil 2022',
    tituloOriginal: 'Human Rights Council - Compilation of information on Brazil',
    tipo: 'Compilação ONU',
    data: '2022',
    sigla: 'HRC Compilation',
    descricao: 'Compilação do Conselho de Direitos Humanos com informações de todos os órgãos de tratados e procedimentos especiais da ONU sobre o Brasil. Oferece visão transversal das recomendações internacionais.',
    arquivo: '/documentos/HRC-Compilation-Brasil-2022.pdf',
    icon: Shield,
    cor: 'text-muted-foreground',
  },
  {
    titulo: 'Relatório Anual do Comitê CERD 2025',
    tituloOriginal: 'Report of the Committee on the Elimination of Racial Discrimination 2025',
    tipo: 'Relatório Anual',
    data: '2025',
    sigla: 'CERD Report 2025',
    descricao: 'Relatório anual do Comitê CERD à Assembleia Geral da ONU, contendo decisões, recomendações gerais e atividades do período mais recente.',
    arquivo: '/documentos/CERD-Report-2025.pdf',
    icon: Gavel,
    cor: 'text-muted-foreground',
  },
  // --- Documentos analíticos e de trabalho ---
  {
    titulo: 'Quadro de Monitoramento CERD-Brasil (Planilha)',
    tituloOriginal: 'Monitoring Framework CERD-Brazil - Final Version',
    tipo: 'Instrumento Analítico',
    data: '2025',
    sigla: 'Quadro Monitoramento',
    descricao: 'Planilha mestra com 30 colunas cruzando todos os eixos de pesquisa (I-V), questões de investigação, evidências, parágrafos CERD (inglês/português), deficiências identificadas, recomendações de ação, respostas do Brasil, estado de responsividade, dimensão interseccional e lacunas de invisibilidade. Inclui vínculos com ODS 18 e riscos de retrocesso.',
    arquivo: '/documentos/Quadro-Monitoramento-CERD-Brasil.xlsx',
    icon: Table,
    cor: 'text-primary',
    paragrafosChave: ['Eixo I - Normativo/Institucional', 'Eixo II - Violência/Justiça', 'Eixo III - Território/Indígenas', 'Eixo IV - DESCA', 'Eixo V - Grupos Focais']
  },
  {
    titulo: 'Cruzamento: Quadro de Investigação × RGs × Durban',
    tituloOriginal: 'Cross-reference: Investigation Framework × General Recommendations × Durban',
    tipo: 'Instrumento Analítico',
    data: '2025',
    sigla: 'Cruzamento RGs/Durban',
    descricao: 'Quadro de investigação baseado nas Observações Finais CERD 2022, cruzando cada tema com as Recomendações Gerais aplicáveis e o Plano de Ação de Durban. Organizado em 5 eixos com questões de investigação, fontes de evidência e linha do tempo legislativa (2018-2025).',
    arquivo: '/documentos/Cruzamento-Quadro-Investigacao-RGs-Durban.docx',
    icon: FileSearch,
    cor: 'text-primary',
    paragrafosChave: ['Eixo I - Estrutura Normativa', 'Eixo II - Violência Racializada', 'Eixo III - Território', 'Eixo IV - DESCA', 'Eixo V - Grupos Focais']
  },
  {
    titulo: 'Plano de Trabalho CERD (TED MIR/UFF)',
    tituloOriginal: 'Work Plan - CERD Report Production',
    tipo: 'Plano de Trabalho',
    data: '2026',
    sigla: 'PT CERD',
    descricao: 'Plano de Trabalho oficial do TED entre MIR e CDG/UFF para elaboração dos subsídios ao IV Relatório CERD. Define 4 Metas: (1) Contexto e revisão de obrigações, (2) Evolução normativa/institucional 2018-2025, (3) Monitoramento da ação governamental, (4) Consolidação e recomendações. Inclui Quadro de Investigação como anexo metodológico.',
    arquivo: '/documentos/Plano-de-Trabalho-CERD.pdf',
    icon: ClipboardList,
    cor: 'text-primary',
    paragrafosChave: ['Meta 1 - Obrigações', 'Meta 2 - Normativa/Institucional', 'Meta 3 - Monitoramento', 'Meta 4 - Consolidação']
  },
  {
    titulo: 'Índice de Recomendações e Notas (Observações CERD)',
    tituloOriginal: 'Index of Recommendations and Notes - CERD Concluding Observations',
    tipo: 'Documento Analítico',
    data: '2022',
    sigla: 'Índice CERD CO',
    descricao: 'Índice completo das 68+ recomendações diretas do CERD organizadas por tema, com indicação de prioridade (§68 e §69). Identifica 30 temas com número de sub-recomendações, páginas e parágrafos. Inclui anotações sobre conexões entre parágrafos e implicações para o IV Relatório.',
    arquivo: '/documentos/CERD-Conclusoes-Indice-Recomendacoes.docx',
    icon: BookOpen,
    cor: 'text-destructive',
    paragrafosChave: ['30 temas mapeados', '§68 Follow-up prioritário', '§69 Particular importância', '68+ recomendações diretas']
  },
  {
    titulo: 'CCD Brasil 2020 - Dados para Atualização',
    tituloOriginal: 'Common Core Document - Data Update Guide',
    tipo: 'Guia de Atualização',
    data: '2020/2025',
    sigla: 'CCD Atualização',
    descricao: 'Mapeamento de todos os dados do CCD 2020 com última data de atualização e fontes. Identifica que a maioria dos dados param em 2010-2015 (Censo 2010, PNAD 2014-2015). Orienta a atualização para Censo 2022, PNAD Contínua, FBSP 2025, INEP e DataSUS mais recentes.',
    arquivo: '/documentos/CCD-Brasil-2020-Dados-Atualizacao.docx',
    icon: Table,
    cor: 'text-primary',
    paragrafosChave: ['Demografia → Censo 2022', 'Economia → PNAD Contínua', 'Educação → INEP/Censo Escolar', 'Saúde → DataSUS/SIM', 'Segurança → FBSP 2025', 'Justiça → CNJ']
  },
  {
    titulo: 'III Relatório Brasil 2018 - Resumo e Sistematização',
    tituloOriginal: 'III Report Brazil 2018 - Summary and Systematization',
    tipo: 'Documento Analítico',
    data: '2018',
    sigla: 'III Relatório Resumo',
    descricao: 'Sistematização analítica do III Relatório CERD do Brasil (2004-2017) por artigos da Convenção. Destaca: inquéritos por racismo com apenas 4% de condenação (§59), 68% da população de favelas sendo negra, papel do IBGE na classificação racial, e o desafio de segregação espacial e encarceramento em massa.',
    arquivo: '/documentos/III-Relatorio-Brasil-2018-Resumo.docx',
    icon: FileText,
    cor: 'text-muted-foreground',
  },
  {
    titulo: 'Follow-up 2026 - Resumo e Anotações',
    tituloOriginal: 'Follow-up 2026 - Summary and Annotations',
    tipo: 'Documento Analítico',
    data: '2026',
    sigla: 'FCO Anotações',
    descricao: 'Análise crítica da resposta brasileira de janeiro/2026. Destaca que o Brasil respondeu mais com medidas normativas do que com dados empíricos. Ponto forte: ações para quilombolas e regulamentação policial (Decreto 12.341/2024). Ponto fraco: ausência de dados sobre impacto da COVID-19 na população negra com recorte interseccional.',
    arquivo: '/documentos/Follow-up-2026-Resumo-Anotacoes.docx',
    icon: PenTool,
    cor: 'text-primary',
    paragrafosChave: ['Saúde Quilombola (PNASQ)', 'PRONASCI 2', 'Decreto 12.341/2024', 'Bolsa Família (+30% indígenas)', 'Lacuna: dados COVID interseccional']
  },
  {
    titulo: 'Guidelines CERD - Anotações',
    tituloOriginal: 'CERD Guidelines - Annotations',
    tipo: 'Documento Analítico',
    data: '2007/2025',
    sigla: 'Guidelines Anotações',
    descricao: 'Anotações sobre as Guidelines para relatórios CERD (CERD/C/2007/1), orientando a estrutura e conteúdo obrigatório do IV Relatório por artigos da Convenção.',
    arquivo: '/documentos/Guidelines-Anotacoes.docx',
    icon: Scale,
    cor: 'text-muted-foreground',
  },
  {
    titulo: 'Relatório Nacional Brasil ao HRC (UPR 2022)',
    tituloOriginal: 'Human Rights Council - National Report Brazil 2022',
    tipo: 'Relatório Nacional',
    data: '2022',
    sigla: 'HRC National Report',
    descricao: 'Relatório nacional do Brasil ao Conselho de Direitos Humanos da ONU para a Revisão Periódica Universal (UPR). Apresenta a perspectiva oficial do governo sobre as políticas de direitos humanos implementadas.',
    arquivo: '/documentos/HRC-National-Report-Brasil-2022.pdf',
    icon: Globe,
    cor: 'text-muted-foreground',
  },
  {
    titulo: 'Guidelines para Elaboração de Recomendações Gerais',
    tituloOriginal: 'Guidelines on the elaboration of general recommendations',
    tipo: 'Diretrizes ONU',
    data: 'S/D',
    sigla: 'RG Guidelines',
    descricao: 'Diretrizes internas do Comitê CERD para a elaboração de novas recomendações gerais. Útil para compreender a metodologia e os critérios que orientam as recomendações aplicáveis ao Brasil.',
    arquivo: '/documentos/Guidelines-Elaboration-General-Recommendations.pdf',
    icon: Scale,
    cor: 'text-muted-foreground',
  },
];

export default function DocumentosBalizadores() {
  return (
    <DashboardLayout
      title="Documentos Balizadores"
      subtitle="Fontes primárias e marcos normativos que orientam o IV Relatório CERD do Brasil"
    >
      {/* Info */}
      <Card className="mb-6 bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <BookOpen className="w-10 h-10 text-primary-foreground/80 flex-shrink-0" />
            <div>
              <h2 className="font-bold text-lg">Marcos Normativos e Documentos-Base</h2>
              <p className="text-sm text-primary-foreground/80 mt-1">
                Estes são os documentos oficiais da ONU que parametrizam todo o sistema: as observações finais ao Brasil,
                as recomendações gerais do CERD, a Declaração de Durban, as guidelines para relatórios e os documentos
                de referência do próprio Brasil. Todos os dados, metas, recomendações e relatórios do sistema derivam
                destes marcos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download all */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="outline" asChild>
          <a href="/parametros_sistemaCERD1.zip" download>
            <Download className="w-4 h-4 mr-2" />
            Baixar todos os documentos (ZIP)
          </a>
        </Button>
        <span className="text-xs text-muted-foreground">{documentos.length} documentos disponíveis</span>
      </div>

      {/* Documents grid */}
      <div className="space-y-4">
        {documentos.map((doc) => {
          const Icon = doc.icon;
          return (
            <Card key={doc.sigla}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                      <Icon className={`w-5 h-5 ${doc.cor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base leading-tight">{doc.titulo}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1 italic">{doc.tituloOriginal}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">{doc.tipo}</Badge>
                    <Badge variant="outline" className="text-xs">{doc.data}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">{doc.descricao}</p>
                
                {doc.paragrafosChave && (
                  <div className="mb-3">
                    <p className="text-xs font-medium mb-1.5">Temas abrangidos:</p>
                    <div className="flex flex-wrap gap-1">
                      {doc.paragrafosChave.map((p, i) => (
                        <Badge key={i} variant="outline" className="text-xs font-normal">{p}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-mono">{doc.sigla}</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={doc.arquivo} download>
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}

// CERD Dashboard Types
// Sistema de Monitoramento do IV Relatório CERD do Brasil

// Status de cumprimento das recomendações
export type ComplianceStatus = 
  | 'cumprido' 
  | 'parcialmente_cumprido' 
  | 'nao_cumprido' 
  | 'retrocesso' 
  | 'em_andamento';

// Prioridade de ação
export type Priority = 'critica' | 'alta' | 'media' | 'baixa';

// Metas do Plano de Trabalho
export interface WorkPlanMeta {
  id: string;
  numero: number;
  titulo: string;
  descricao: string;
  resultadosEsperados: string[];
  status: 'nao_iniciada' | 'em_andamento' | 'concluida';
  progresso: number;
  prazoInicio: string;
  prazoFim: string;
  responsavel?: string;
}

// Recomendação do Comitê CERD
export interface CERDRecommendation {
  id: string;
  paragrafo: string;
  eixo: string;
  tema: string;
  recomendacao: string;
  statusCumprimento: ComplianceStatus;
  prioridade: Priority;
  acoesBrasil: string[];
  lacunas: string[];
  fontesEvidencia: string[];
  ultimaAtualizacao: string;
}

// Eixos temáticos do Quadro de Investigação
export interface InvestigationAxis {
  id: string;
  numero: number;
  nome: string;
  descricao: string;
  temas: AxisTheme[];
}

export interface AxisTheme {
  id: string;
  nome: string;
  paragrafosONU: string[];
  questoesInvestigacao: string[];
  fontesEvidencia: string[];
  indicadores: string[];
}

// Indicadores estatísticos do Common Core
export interface StatisticalIndicator {
  id: string;
  categoria: 'demografico' | 'economico' | 'social' | 'educacional' | 'saude' | 'seguranca' | 'trabalho';
  nome: string;
  fonte: string;
  urlFonte?: string;
  valorAtual?: number;
  unidade: string;
  ano: number;
  desagregacoes: Disaggregation[];
  tendencia?: 'crescente' | 'decrescente' | 'estavel';
  metaCERD?: string;
}

export interface Disaggregation {
  tipo: 'raca' | 'genero' | 'idade' | 'regiao' | 'uf';
  valores: { categoria: string; valor: number }[];
}

// Grupos focais específicos
export interface FocalGroup {
  id: string;
  nome: string;
  populacao?: number;
  fontePopulacao?: string;
  indicadoresEspecificos: string[];
  politicasEspecificas: string[];
  observacoesONU: string[];
}

// Dados orçamentários
export interface BudgetData {
  id: string;
  programa: string;
  acao: string;
  esfera: 'federal' | 'estadual' | 'municipal';
  uf?: string;
  municipio?: string;
  ano: number;
  valorAutorizado: number;
  valorEmpenhado: number;
  valorLiquidado: number;
  valorPago: number;
  fonteRecurso: string;
  politicaRacial: boolean;
  categoriaRacial?: string;
}

// Fontes de dados oficiais
export interface DataSource {
  id: string;
  sigla: string;
  nomeCompleto: string;
  orgaoResponsavel: string;
  urlAcesso: string;
  tipoAcesso: 'api' | 'download' | 'portal' | 'sidra';
  descricao: string;
  indicadoresDisponiveis: string[];
  desagregacoes: string[];
  periodicidade: string;
  ultimaAtualizacao?: string;
}

// Documento Common Core
export interface CommonCoreSection {
  id: string;
  numero: string;
  titulo: string;
  tituloIngles: string;
  subsecoes: CommonCoreSubsection[];
  statusAtualizacao: 'atualizado' | 'parcial' | 'desatualizado';
  ultimaVersao: number;
  periodoCobertura: string;
}

export interface CommonCoreSubsection {
  id: string;
  numero: string;
  titulo: string;
  conteudoAtual: string;
  indicadoresNecessarios: string[];
  fontesNecessarias: string[];
  statusAtualizacao: 'atualizado' | 'parcial' | 'desatualizado';
  notas?: string;
}

// Timeline do projeto
export interface ProjectTimeline {
  id: string;
  titulo: string;
  descricao: string;
  dataInicio: string;
  dataFim: string;
  status: 'concluido' | 'em_andamento' | 'pendente' | 'atrasado';
  dependencias: string[];
  entregaveis: string[];
}

// Críticas e observações da ONU
export interface UNObservation {
  id: string;
  documento: string;
  dataDocumento: string;
  paragrafo: string;
  tipo: 'preocupacao' | 'recomendacao' | 'solicitacao' | 'elogio';
  tema: string;
  texto: string;
  respostaBrasil?: string;
  statusAtendimento: ComplianceStatus;
  acoesPendentes: string[];
}

// Dashboard Summary Stats
export interface DashboardStats {
  totalRecomendacoes: number;
  recomendacoesCumpridas: number;
  recomendacoesParciais: number;
  recomendacoesNaoCumpridas: number;
  metasPlanoTrabalho: number;
  metasConcluidas: number;
  indicadoresAtualizados: number;
  indicadoresDesatualizados: number;
  ultimaAtualizacao: string;
}

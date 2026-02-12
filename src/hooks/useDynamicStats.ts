import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLacunasStats, useOrcamentoStats, useConclusoesAnaliticas, useIndicadoresInterseccionais, useLacunasIdentificadas, useRespostasLacunasCerdIII } from './useLacunasData';

// Hook para estatísticas dinâmicas do dashboard e acompanhamento gerencial
export function useDashboardStats() {
  const { data: lacunasStats, isLoading: loadingLacunas } = useLacunasStats();
  const { data: orcamentoStats, isLoading: loadingOrcamento } = useOrcamentoStats();
  const { data: indicadores, isLoading: loadingIndicadores } = useIndicadoresInterseccionais();
  const { data: conclusoes, isLoading: loadingConclusoes } = useConclusoesAnaliticas();
  const { data: lacunas, isLoading: loadingLacunasList } = useLacunasIdentificadas();
  const { data: respostasCerd, isLoading: loadingRespostas } = useRespostasLacunasCerdIII();

  const isLoading = loadingLacunas || loadingOrcamento || loadingIndicadores || loadingConclusoes || loadingLacunasList || loadingRespostas;

  // Calcular estatísticas dinâmicas
  const totalRecomendacoes = lacunasStats?.total || 0;
  const cumpridas = lacunasStats?.porStatus.cumprido || 0;
  const parciais = lacunasStats?.porStatus.parcialmente_cumprido || 0;
  const naoCumpridas = lacunasStats?.porStatus.nao_cumprido || 0;
  const retrocesso = lacunasStats?.porStatus.retrocesso || 0;

  // Progresso real baseado nos dados
  const progressoReal = totalRecomendacoes > 0 
    ? Math.round(((cumpridas * 100) + (parciais * 50)) / totalRecomendacoes) 
    : 0;

  // Calcular progresso das metas baseado nos dados
  const metasProgresso = {
    meta1: calcularProgressoMeta1(lacunas || [], respostasCerd || []),
    meta2: calcularProgressoMeta2(lacunas || []),
    meta3: calcularProgressoMeta3(indicadores || [], orcamentoStats),
    meta4: calcularProgressoMeta4(conclusoes || [], lacunasStats),
  };

  const progressoGeral = Math.round(
    (metasProgresso.meta1 + metasProgresso.meta2 + metasProgresso.meta3 + metasProgresso.meta4) / 4
  );

  return {
    isLoading,
    stats: {
      totalRecomendacoes,
      recomendacoesCumpridas: cumpridas,
      recomendacoesParciais: parciais,
      recomendacoesNaoCumpridas: naoCumpridas,
      recomendacoesRetrocesso: retrocesso,
      progressoReal,
      progressoGeral,
      metasProgresso,
      totalIndicadores: indicadores?.length || 0,
      totalConclusoes: conclusoes?.length || 0,
      totalOrcamento: orcamentoStats?.totalRegistros || 0,
      variacaoOrcamento: orcamentoStats?.variacao || 0,
    },
    lacunasStats,
    orcamentoStats,
    indicadores,
    conclusoes,
  };
}

// Total de eixos temáticos definidos na Convenção
const TOTAL_EIXOS = 10;
// Total de parágrafos monitorados (§6-§65 das Observações Finais)
const TOTAL_PARAGRAFOS_OF = 32;

// Calcular progresso da Meta 1: Contexto da Convenção
// Mede: cobertura de parágrafos das OF + respostas ao CERD III
function calcularProgressoMeta1(lacunas: any[], respostas: any[]): number {
  // Cobertura de parágrafos (peso 60%)
  const paragrafosUnicos = new Set(lacunas.map(l => l.paragrafo)).size;
  const coberturaParagrafos = Math.min((paragrafosUnicos / TOTAL_PARAGRAFOS_OF) * 100, 100);
  
  // Respostas ao CERD III (peso 40%)
  const coberturaRespostas = respostas.length > 0 
    ? Math.min(respostas.length * 10, 100)
    : 0;
  
  return Math.round(coberturaParagrafos * 0.6 + coberturaRespostas * 0.4);
}

// Calcular progresso da Meta 2: Evolução Normativa
// Mede: cumprimento das lacunas normativas + cobertura de eixos normativos
function calcularProgressoMeta2(lacunas: any[]): number {
  const eixosNormativos = ['legislacao_justica', 'politicas_institucionais', 'participacao_social'];
  const lacunasNormativas = lacunas.filter(l => eixosNormativos.includes(l.eixo_tematico));
  
  if (lacunasNormativas.length === 0) return 0;
  
  // Cobertura de eixos normativos (peso 30%)
  const eixosCobertos = new Set(lacunasNormativas.map((l: any) => l.eixo_tematico)).size;
  const coberturaEixos = (eixosCobertos / eixosNormativos.length) * 100;
  
  // Status de cumprimento (peso 70%)
  const cumpridas = lacunasNormativas.filter((l: any) => l.status_cumprimento === 'cumprido').length;
  const parciais = lacunasNormativas.filter((l: any) => l.status_cumprimento === 'parcialmente_cumprido').length;
  const statusScore = ((cumpridas * 100) + (parciais * 50)) / lacunasNormativas.length;
  
  return Math.round(coberturaEixos * 0.3 + statusScore * 0.7);
}

// Calcular progresso da Meta 3: Monitoramento
// Mede: cobertura de indicadores por eixo + cobertura orçamentária por eixo
function calcularProgressoMeta3(indicadores: any[], orcamento: any): number {
  // Cobertura de eixos com indicadores (peso 25%)
  const eixosComIndicadores = new Set(indicadores.map((i: any) => i.categoria)).size;
  const coberturaIndicadores = (eixosComIndicadores / TOTAL_EIXOS) * 100;
  
  // Densidade de indicadores: ideal = 3+ por eixo (peso 25%)
  const densidadeIndicadores = Math.min((indicadores.length / (TOTAL_EIXOS * 3)) * 100, 100);
  
  // Cobertura orçamentária (peso 30%)
  const temOrcamento = (orcamento?.totalRegistros || 0) > 0;
  const coberturaOrcamento = temOrcamento ? Math.min((orcamento.totalRegistros / 50) * 100, 100) : 0;
  
  // Série histórica (peso 20%)
  const anosUnicos = orcamento?.porAno ? Object.keys(orcamento.porAno).length : 0;
  const coberturaTemporal = Math.min((anosUnicos / 8) * 100, 100);
  
  return Math.round(
    (coberturaIndicadores * 0.25) + 
    (densidadeIndicadores * 0.25) + 
    (coberturaOrcamento * 0.3) + 
    (coberturaTemporal * 0.2)
  );
}

// Calcular progresso da Meta 4: Consolidação (escopo aberto)
// A Meta 4 não possui roteiro fechado — pesquisadores podem complementar a base
// até o encerramento do projeto. O progresso usa escala assintótica (máx ~90%)
// para refletir que 100% só será definido no fechamento do projeto.
function calcularProgressoMeta4(conclusoes: any[], lacunasStats: any): number {
  if (!lacunasStats && conclusoes.length === 0) return 0;
  
  // Classificação de lacunas por eixo (peso 40%)
  const eixosClassificados = lacunasStats?.porEixo 
    ? Object.values(lacunasStats.porEixo).filter((v: any) => v > 0).length 
    : 0;
  const coberturaClassificacao = (eixosClassificados / TOTAL_EIXOS) * 100;
  
  // Conclusões analíticas — escala assintótica: cresce com volume mas sem teto fixo
  // Fórmula: 90 * (1 - e^(-n/8)), onde n = número de conclusões
  // Com 5 conclusões ≈ 41%, 10 ≈ 63%, 20 ≈ 82%, 30 ≈ 88%
  const coberturaConclusoes = conclusoes.length > 0 
    ? 90 * (1 - Math.exp(-conclusoes.length / 8))
    : 0;
  
  // Relevância marcada nas conclusões (peso 25%)
  const conclusoesRelevantes = conclusoes.filter((c: any) => 
    c.relevancia_cerd_iv || c.relevancia_common_core
  ).length;
  const percentualRelevantes = conclusoes.length > 0 
    ? (conclusoesRelevantes / conclusoes.length) * 100 
    : 0;
  
  // Teto máximo de 90% — os 10% finais só serão alcançados no fechamento do projeto
  const raw = (coberturaClassificacao * 0.4) + 
    (coberturaConclusoes * 0.35) + 
    (percentualRelevantes * 0.25);
  
  return Math.round(Math.min(raw, 90));
}

// Hook para progresso do Common Core
export function useCommonCoreProgress() {
  const { data: indicadores } = useIndicadoresInterseccionais();
  const { data: lacunas } = useLacunasIdentificadas();
  
  // 77 indicadores do Common Core
  const totalIndicadoresCC = 77;
  const indicadoresPreenchidos = indicadores?.length || 0;
  
  // Categorizar status
  const atualizados = indicadores?.filter(i => {
    const updatedAt = new Date(i.updated_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return updatedAt > sixMonthsAgo;
  }).length || 0;
  
  const desatualizados = indicadoresPreenchidos - atualizados;
  
  return {
    total: totalIndicadoresCC,
    preenchidos: indicadoresPreenchidos,
    atualizados,
    parciais: Math.max(0, totalIndicadoresCC - indicadoresPreenchidos - desatualizados),
    desatualizados,
    progresso: Math.round((indicadoresPreenchidos / totalIndicadoresCC) * 100),
  };
}

// Hook para progresso do CERD IV
export function useCerdIVProgress() {
  const { data: lacunasStats } = useLacunasStats();
  const { data: respostas } = useRespostasLacunasCerdIII();
  const { data: conclusoes } = useConclusoesAnaliticas();
  
  const totalLacunas = lacunasStats?.total || 0;
  const cumpridas = lacunasStats?.porStatus.cumprido || 0;
  const parciais = lacunasStats?.porStatus.parcialmente_cumprido || 0;
  
  // Calcular progresso por seção
  const secoes = {
    introducao: 80, // Metodologia definida
    respostasOF: totalLacunas > 0 ? Math.round(((cumpridas + parciais) / totalLacunas) * 100) : 0,
    medidasLegislativas: calcularProgressoSecaoNormativa(lacunasStats),
    aplicacaoArtigos: 30, // Em elaboração
    dadosEstatisticos: calcularProgressoDados(lacunasStats),
    povosTradicionais: calcularProgressoPovos(lacunasStats),
    conclusoes: conclusoes && conclusoes.length > 0 ? 50 : 0,
  };
  
  const progressoGeral = Math.round(
    Object.values(secoes).reduce((a, b) => a + b, 0) / Object.keys(secoes).length
  );
  
  return {
    secoes,
    progressoGeral,
    totalRespostas: respostas?.length || 0,
    totalConclusoes: conclusoes?.length || 0,
  };
}

function calcularProgressoSecaoNormativa(stats: any): number {
  if (!stats) return 0;
  const normativas = (stats.porEixo?.legislacao_justica || 0) + (stats.porEixo?.politicas_institucionais || 0);
  return normativas > 0 ? Math.min(70, normativas * 10) : 0;
}

function calcularProgressoDados(stats: any): number {
  if (!stats) return 0;
  return stats.porEixo?.dados_estatisticas ? Math.min(80, 50 + stats.porEixo.dados_estatisticas * 5) : 30;
}

function calcularProgressoPovos(stats: any): number {
  if (!stats) return 0;
  const grupos = ['quilombolas', 'indigenas', 'ciganos'];
  const comDados = grupos.filter(g => (stats.porGrupo?.[g] || 0) > 0).length;
  return Math.round((comDados / grupos.length) * 100);
}

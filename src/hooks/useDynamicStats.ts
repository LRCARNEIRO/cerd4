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

// Calcular progresso da Meta 1: Contexto da Convenção
function calcularProgressoMeta1(lacunas: any[], respostas: any[]): number {
  // Meta 1: Trajetória + Observações + Revisão CERD III
  const temRespostas = respostas.length > 0;
  const temLacunas = lacunas.length > 0;
  
  if (!temLacunas && !temRespostas) return 0;
  if (temLacunas && temRespostas) return 60;
  if (temLacunas || temRespostas) return 30;
  return 0;
}

// Calcular progresso da Meta 2: Evolução Normativa
function calcularProgressoMeta2(lacunas: any[]): number {
  // Meta 2: Legislação + Institucionalidade + Judiciário
  const lacunasNormativas = lacunas.filter(l => 
    l.eixo_tematico === 'legislacao_justica' || 
    l.eixo_tematico === 'politicas_institucionais'
  );
  
  if (lacunasNormativas.length === 0) return 0;
  
  const cumpridas = lacunasNormativas.filter(l => l.status_cumprimento === 'cumprido').length;
  const parciais = lacunasNormativas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length;
  
  return Math.round(((cumpridas * 100) + (parciais * 50)) / lacunasNormativas.length);
}

// Calcular progresso da Meta 3: Monitoramento
function calcularProgressoMeta3(indicadores: any[], orcamento: any): number {
  // Meta 3: Indicadores + Orçamento
  const temIndicadores = indicadores.length > 0;
  const temOrcamento = (orcamento?.totalRegistros || 0) > 0;
  
  let progresso = 0;
  if (temIndicadores) progresso += 30;
  if (temOrcamento) progresso += 30;
  
  // Bônus por quantidade de dados
  if (indicadores.length > 5) progresso += 10;
  if ((orcamento?.totalRegistros || 0) > 10) progresso += 10;
  
  return Math.min(progresso, 80); // Cap em 80% até conclusão
}

// Calcular progresso da Meta 4: Consolidação
function calcularProgressoMeta4(conclusoes: any[], lacunasStats: any): number {
  // Meta 4: Conclusões + Classificação
  const temConclusoes = conclusoes.length > 0;
  const temClassificacao = (lacunasStats?.total || 0) > 0;
  
  if (!temConclusoes && !temClassificacao) return 0;
  if (temConclusoes && temClassificacao) {
    // Verificar qualidade das conclusões
    const conclusoesRelevantes = conclusoes.filter(c => 
      c.relevancia_cerd_iv || c.relevancia_common_core
    ).length;
    
    const percentualRelevantes = conclusoes.length > 0 
      ? (conclusoesRelevantes / conclusoes.length) * 100 
      : 0;
    
    return Math.round(30 + (percentualRelevantes * 0.5));
  }
  
  return 20;
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

import { useMemo } from 'react';
import { 
  useLacunasIdentificadas, 
  useLacunasStats, 
  useRespostasLacunasCerdIII, 
  useOrcamentoStats, 
  useIndicadoresInterseccionais,
  useDadosOrcamentarios,
  type LacunaIdentificada,
  type RespostaLacunaCerdIII,
  type IndicadorInterseccional,
  type DadoOrcamentario
} from './useLacunasData';

// =============================================
// TIPOS
// =============================================

export interface FioCondutor {
  id: string;
  titulo: string;
  tipo: 'paradoxo' | 'correlacao' | 'tendencia' | 'lacuna_critica' | 'avanco' | 'retrocesso';
  argumento: string;
  evidencias: EvidenciaDinamica[];
  eixos: string[];
  grupos: string[];
  relevancia: 'alta' | 'media' | 'baixa';
  comparativo2018?: string;
}

export interface EvidenciaDinamica {
  texto: string;
  fonte: string;
  tipo: 'quantitativa' | 'qualitativa' | 'orcamentaria' | 'normativa';
  valorAtual?: string;
  valor2018?: string;
  variacao?: string;
}

export interface InsightCruzamento {
  id: string;
  titulo: string;
  descricao: string;
  dados: string[];
  tipo: 'alerta' | 'progresso' | 'contradição' | 'correlação';
}

export interface ConclusaoDinamica {
  id: string;
  tipo: 'lacuna_persistente' | 'avanco' | 'retrocesso';
  titulo: string;
  periodo: string;
  argumento_central: string;
  evidencias: string[];
  eixos: string[];
  fromDatabase: boolean;
  relevancia_common_core: boolean;
  relevancia_cerd_iv: boolean;
  fiosCondutores: string[];
}

// =============================================
// LABELS
// =============================================

const eixoLabels: Record<string, string> = {
  legislacao_justica: 'Legislação e Justiça',
  politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública',
  saude: 'Saúde',
  educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda',
  terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio',
  participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas'
};

const grupoLabels: Record<string, string> = {
  negros: 'População Negra',
  indigenas: 'Povos Indígenas',
  quilombolas: 'Quilombolas',
  ciganos: 'Povos Ciganos',
  religioes_matriz_africana: 'Religiões de Matriz Africana',
  juventude_negra: 'Juventude Negra',
  mulheres_negras: 'Mulheres Negras',
  lgbtqia_negros: 'LGBTQIA+ Negros',
  pcd_negros: 'PcD Negros',
  idosos_negros: 'Idosos Negros',
  geral: 'Geral'
};

const statusLabels: Record<string, string> = {
  cumprido: 'Cumprido',
  parcialmente_cumprido: 'Parcialmente Cumprido',
  nao_cumprido: 'Não Cumprido',
  retrocesso: 'Retrocesso',
  em_andamento: 'Em Andamento'
};

// =============================================
// HOOK PRINCIPAL
// =============================================

export function useAnalyticalInsights() {
  const { data: lacunas, isLoading: l1 } = useLacunasIdentificadas();
  const { data: stats, isLoading: l2 } = useLacunasStats();
  const { data: respostas, isLoading: l3 } = useRespostasLacunasCerdIII();
  const { data: orcStats, isLoading: l4 } = useOrcamentoStats();
  const { data: indicadores, isLoading: l5 } = useIndicadoresInterseccionais();
  const { data: orcDados, isLoading: l6 } = useDadosOrcamentarios();

  const isLoading = l1 || l2 || l3 || l4 || l5 || l6;

  // Gerar fios condutores a partir dos dados reais
  const fiosCondutores = useMemo(() => {
    if (!lacunas || !stats || !respostas) return [];
    return gerarFiosCondutores(lacunas, stats, respostas, orcStats, indicadores || [], orcDados || []);
  }, [lacunas, stats, respostas, orcStats, indicadores, orcDados]);

  // Gerar conclusões dinâmicas
  const conclusoesDinamicas = useMemo(() => {
    if (!lacunas || !stats || !respostas) return [];
    return gerarConclusoesDinamicas(lacunas, stats, respostas, orcStats, indicadores || [], orcDados || [], fiosCondutores);
  }, [lacunas, stats, respostas, orcStats, indicadores, orcDados, fiosCondutores]);

  // Gerar cruzamentos e insights
  const insightsCruzamento = useMemo(() => {
    if (!lacunas || !stats || !respostas) return [];
    return gerarInsightsCruzamento(lacunas, stats, respostas, orcStats, indicadores || [], orcDados || []);
  }, [lacunas, stats, respostas, orcStats, indicadores, orcDados]);

  // Síntese executiva dinâmica
  const sinteseExecutiva = useMemo(() => {
    if (!stats || !respostas || !lacunas) return null;
    return gerarSinteseExecutiva(lacunas, stats, respostas, orcStats, indicadores || []);
  }, [lacunas, stats, respostas, orcStats, indicadores]);

  return {
    isLoading,
    fiosCondutores,
    conclusoesDinamicas,
    insightsCruzamento,
    sinteseExecutiva,
    stats,
    lacunas,
    respostas,
    orcStats,
    indicadores,
    orcDados,
  };
}

// =============================================
// GERAÇÃO DE FIOS CONDUTORES
// =============================================

function gerarFiosCondutores(
  lacunas: LacunaIdentificada[],
  stats: any,
  respostas: RespostaLacunaCerdIII[],
  orcStats: any,
  indicadores: IndicadorInterseccional[],
  orcDados: DadoOrcamentario[]
): FioCondutor[] {
  const fios: FioCondutor[] = [];

  // FIO 1: Paradoxo normativo-implementação
  const lacunasNormativas = lacunas.filter(l => 
    l.eixo_tematico === 'legislacao_justica' || l.eixo_tematico === 'politicas_institucionais'
  );
  const normativasCumpridas = lacunasNormativas.filter(l => 
    l.status_cumprimento === 'cumprido' || l.status_cumprimento === 'parcialmente_cumprido'
  );
  const totalCriticas = lacunas.filter(l => l.prioridade === 'critica').length;
  const criticasNaoCumpridas = lacunas.filter(l => 
    l.prioridade === 'critica' && (l.status_cumprimento === 'nao_cumprido' || l.status_cumprimento === 'retrocesso')
  ).length;

  if (lacunasNormativas.length > 0) {
    const evidencias: EvidenciaDinamica[] = [];
    
    // Extrair evidências reais das lacunas
    lacunasNormativas.forEach(l => {
      l.evidencias_encontradas?.forEach(ev => {
        evidencias.push({ texto: ev, fonte: `§${l.paragrafo} - ${l.tema}`, tipo: 'quantitativa' });
      });
      l.acoes_brasil?.forEach(a => {
        evidencias.push({ texto: a, fonte: `Ação Brasil - §${l.paragrafo}`, tipo: 'normativa' });
      });
    });

    fios.push({
      id: 'paradoxo-normativo',
      titulo: 'Paradoxo Normativo-Implementação',
      tipo: 'paradoxo',
      argumento: `O Brasil possui ${lacunasNormativas.length} observações da ONU no eixo legislação/institucional, das quais ${normativasCumpridas.length} tiveram algum grau de cumprimento. Porém, das ${totalCriticas} lacunas de prioridade crítica, ${criticasNaoCumpridas} (${totalCriticas > 0 ? Math.round(criticasNaoCumpridas/totalCriticas*100) : 0}%) permanecem não cumpridas ou em retrocesso — revelando que avanços normativos não se traduzem em mudança estrutural.`,
      evidencias: evidencias.slice(0, 8),
      eixos: ['legislacao_justica', 'politicas_institucionais'],
      grupos: [...new Set(lacunasNormativas.map(l => l.grupo_focal))],
      relevancia: 'alta',
      comparativo2018: `Período 2019-2022 marcou desmonte institucional; a partir de 2023 houve recriação do MIR e novos marcos legais (Lei 14.532/2023).`
    });
  }

  // FIO 2: Violência racial estrutural
  const lacunasViolencia = lacunas.filter(l => l.eixo_tematico === 'seguranca_publica');
  if (lacunasViolencia.length > 0) {
    const evidViolencia: EvidenciaDinamica[] = [];
    lacunasViolencia.forEach(l => {
      l.evidencias_encontradas?.forEach(ev => {
        evidViolencia.push({ texto: ev, fonte: `§${l.paragrafo} - ${l.tema}`, tipo: 'quantitativa' });
      });
    });

    const respostasViolencia = respostas.filter(r => 
      r.critica_original.toLowerCase().includes('violência') || 
      r.critica_original.toLowerCase().includes('policial') ||
      r.critica_original.toLowerCase().includes('força')
    );
    respostasViolencia.forEach(r => {
      if (r.evidencias_quantitativas) {
        Object.entries(r.evidencias_quantitativas as Record<string, any>).forEach(([k, v]) => {
          evidViolencia.push({ 
            texto: `${k.replace(/_/g, ' ')}: ${v}`, 
            fonte: `Resposta CERD III §${r.paragrafo_cerd_iii}`, 
            tipo: 'quantitativa' 
          });
        });
      }
    });

    const statusViolencia = lacunasViolencia.map(l => l.status_cumprimento);
    const naoCumpridas = statusViolencia.filter(s => s === 'nao_cumprido').length;

    fios.push({
      id: 'violencia-estrutural',
      titulo: 'Violência Racial Estrutural Persistente',
      tipo: 'lacuna_critica',
      argumento: `Das ${lacunasViolencia.length} observações de segurança pública, ${naoCumpridas} permanecem não cumpridas. As evidências coletadas demonstram que a população negra segue sendo alvo desproporcional da violência letal do Estado e da criminalidade, com dados que pouco se alteram entre 2018 e 2024.`,
      evidencias: evidViolencia.slice(0, 8),
      eixos: ['seguranca_publica'],
      grupos: [...new Set(lacunasViolencia.map(l => l.grupo_focal))],
      relevancia: 'alta',
      comparativo2018: `Em 2018, 75,7% das vítimas de homicídio eram negras. Em 2024 (FBSP 2025), são 77% — aumento da desproporção apesar da queda nos números absolutos.`
    });
  }

  // FIO 3: Territórios tradicionais - retrocesso e retomada
  const lacunasTerritorio = lacunas.filter(l => l.eixo_tematico === 'terra_territorio');
  if (lacunasTerritorio.length > 0) {
    const evidTerr: EvidenciaDinamica[] = [];
    lacunasTerritorio.forEach(l => {
      l.evidencias_encontradas?.forEach(ev => {
        evidTerr.push({ texto: ev, fonte: `§${l.paragrafo} - ${l.grupo_focal}`, tipo: 'quantitativa' });
      });
      l.acoes_brasil?.forEach(a => {
        evidTerr.push({ texto: a, fonte: `Ação Brasil - ${grupoLabels[l.grupo_focal]}`, tipo: 'normativa' });
      });
    });

    const retrocessos = lacunasTerritorio.filter(l => l.status_cumprimento === 'retrocesso').length;

    fios.push({
      id: 'territorios-tradicionais',
      titulo: 'Territórios Tradicionais: Retrocesso e Retomada',
      tipo: 'retrocesso',
      argumento: `${retrocessos} de ${lacunasTerritorio.length} lacunas territoriais registram retrocesso. O período 2019-2022 praticamente paralisou demarcações e titulações, com o orçamento do INCRA para quilombolas caindo 90%. A retomada a partir de 2023 é lenta frente à dívida histórica acumulada.`,
      evidencias: evidTerr.slice(0, 8),
      eixos: ['terra_territorio'],
      grupos: [...new Set(lacunasTerritorio.map(l => l.grupo_focal))],
      relevancia: 'alta',
      comparativo2018: `2018: processos em andamento com orçamento regular. 2019-2022: paralisia total. 2023-2024: retomada com apenas 7% dos territórios quilombolas titulados.`
    });
  }

  // FIO 4: Interseccionalidade - mulheres negras
  const lacunasMulheres = lacunas.filter(l => l.grupo_focal === 'mulheres_negras');
  const respostasMulheres = respostas.filter(r =>
    r.critica_original.toLowerCase().includes('mulher') || 
    r.critica_original.toLowerCase().includes('gênero') ||
    r.critica_original.toLowerCase().includes('interseccional')
  );
  
  if (lacunasMulheres.length > 0 || respostasMulheres.length > 0) {
    const evidMulheres: EvidenciaDinamica[] = [];
    lacunasMulheres.forEach(l => {
      l.evidencias_encontradas?.forEach(ev => {
        evidMulheres.push({ texto: ev, fonte: `§${l.paragrafo}`, tipo: 'quantitativa' });
      });
    });

    // Cruzar com lacunas que mencionam interseccionalidade de gênero
    const intersecGenero = lacunas.filter(l => 
      l.interseccionalidades?.includes('gênero')
    );

    fios.push({
      id: 'interseccionalidade-genero',
      titulo: 'Discriminação Interseccional: Mulheres Negras',
      tipo: 'correlacao',
      argumento: `${lacunasMulheres.length} lacuna(s) diretamente sobre mulheres negras e ${intersecGenero.length} lacunas com dimensão de gênero. A intersecção raça-gênero amplifica todas as formas de vulnerabilidade: feminicídio, mortalidade materna, informalidade laboral e violência doméstica atingem desproporcionalmente mulheres negras.`,
      evidencias: evidMulheres.slice(0, 6),
      eixos: [...new Set([...lacunasMulheres.map(l => l.eixo_tematico), ...intersecGenero.map(l => l.eixo_tematico)])],
      grupos: ['mulheres_negras'],
      relevancia: 'alta',
      comparativo2018: `Feminicídio de mulheres negras: 61% em 2018 → 63,6% em 2024 (FBSP 2025). Mortalidade materna negra permanece 2x maior que branca.`
    });
  }

  // FIO 5: Orçamento vs resultados
  if (orcStats && orcStats.totalRegistros > 0) {
    const evidOrc: EvidenciaDinamica[] = [];
    
    if (orcStats.totalPeriodo1 > 0 || orcStats.totalPeriodo2 > 0) {
      evidOrc.push({
        texto: `Período 2018-2022: R$ ${formatBRL(orcStats.totalPeriodo1)} executados`,
        fonte: 'SIOP/Portal da Transparência',
        tipo: 'orcamentaria',
        valor2018: formatBRL(orcStats.totalPeriodo1)
      });
      evidOrc.push({
        texto: `Período 2023-2026: R$ ${formatBRL(orcStats.totalPeriodo2)} executados`,
        fonte: 'SIOP/Portal da Transparência',
        tipo: 'orcamentaria',
        valorAtual: formatBRL(orcStats.totalPeriodo2)
      });
      evidOrc.push({
        texto: `Variação: ${orcStats.variacao >= 0 ? '+' : ''}${orcStats.variacao.toFixed(0)}%`,
        fonte: 'Cálculo baseado nos dados do BD',
        tipo: 'orcamentaria',
        variacao: `${orcStats.variacao.toFixed(0)}%`
      });
    }

    // Top programas
    if (orcStats.porPrograma) {
      Object.entries(orcStats.porPrograma).sort((a: any, b: any) => b[1] - a[1]).slice(0, 3).forEach(([prog, val]: any) => {
        evidOrc.push({
          texto: `${prog}: R$ ${formatBRL(val)}`,
          fonte: 'SIOP',
          tipo: 'orcamentaria'
        });
      });
    }

    fios.push({
      id: 'orcamento-vs-resultados',
      titulo: 'Investimento vs. Resultados: A Lacuna Orçamentária',
      tipo: 'correlacao',
      argumento: `Com ${orcStats.totalRegistros} registros orçamentários analisados, a variação de ${orcStats.variacao >= 0 ? '+' : ''}${orcStats.variacao.toFixed(0)}% entre os períodos 2018-2022 e 2023-2026 ${orcStats.variacao > 0 ? 'indica recuperação, porém insuficiente para reverter a dívida histórica de subfinanciamento' : 'revela continuidade do subfinanciamento das políticas raciais'}. Os dados cruzados com indicadores socioeconômicos mostram que aumentos orçamentários não foram proporcionais à gravidade das lacunas.`,
      evidencias: evidOrc,
      eixos: Object.keys(orcStats.porPrograma || {}),
      grupos: [],
      relevancia: 'alta',
      comparativo2018: `Orçamento para igualdade racial sofreu queda de até 90% entre 2016-2022, com recuperação parcial a partir de 2023.`
    });
  }

  // FIO 6: Dados e invisibilidade
  const lacunasDados = lacunas.filter(l => l.eixo_tematico === 'dados_estatisticas');
  const gruposSemDados = ['ciganos', 'lgbtqia_negros', 'pcd_negros', 'idosos_negros'].filter(
    g => !lacunas.some(l => l.grupo_focal === g)
  );

  fios.push({
    id: 'invisibilidade-dados',
    titulo: 'Invisibilidade Estatística e Lacunas de Dados',
    tipo: 'lacuna_critica',
    argumento: `${lacunasDados.length} observações da ONU sobre dados/estatísticas. ${gruposSemDados.length > 0 ? `Grupos sem representação nos dados: ${gruposSemDados.map(g => grupoLabels[g]).join(', ')}.` : ''} O Censo 2022 foi avanço histórico (primeira contagem de quilombolas), mas persistem lacunas em dados interseccionais sistemáticos — especialmente para povos ciganos, população LGBTQIA+ negra e PcD negros.`,
    evidencias: [
      { texto: `${indicadores.length} indicadores interseccionais no banco`, fonte: 'BD Sistema', tipo: 'quantitativa' },
      { texto: `${lacunasDados.length} lacunas ONU sobre dados`, fonte: 'CERD/C/BRA/CO/18-20', tipo: 'qualitativa' },
      ...gruposSemDados.map(g => ({
        texto: `${grupoLabels[g]}: sem dados sistemáticos desagregados`,
        fonte: 'Análise do BD',
        tipo: 'qualitativa' as const
      }))
    ],
    eixos: ['dados_estatisticas'],
    grupos: gruposSemDados,
    relevancia: 'media'
  });

  // FIO 7: Respostas CERD III - o que o Brasil respondeu e o que falta
  if (respostas.length > 0) {
    const naoCumpridas = respostas.filter(r => r.grau_atendimento === 'nao_cumprido');
    const retrocessos = respostas.filter(r => r.grau_atendimento === 'retrocesso');
    const evidResp: EvidenciaDinamica[] = [];

    naoCumpridas.forEach(r => {
      evidResp.push({
        texto: `§${r.paragrafo_cerd_iii}: ${r.critica_original.substring(0, 100)}...`,
        fonte: 'CERD III',
        tipo: 'qualitativa'
      });
      r.lacunas_remanescentes?.slice(0, 2).forEach(lr => {
        evidResp.push({ texto: lr, fonte: `Lacuna §${r.paragrafo_cerd_iii}`, tipo: 'qualitativa' });
      });
    });

    fios.push({
      id: 'divida-cerd-iii',
      titulo: 'Dívida do CERD III: Críticas Não Respondidas',
      tipo: 'lacuna_critica',
      argumento: `Das ${respostas.length} críticas do relatório anterior (CERD III), ${naoCumpridas.length} permanecem não cumpridas e ${retrocessos.length} registram retrocesso. As lacunas remanescentes indicam áreas onde o Estado brasileiro não conseguiu demonstrar progresso concreto, constituindo passivo a ser endereçado no IV Relatório.`,
      evidencias: evidResp.slice(0, 8),
      eixos: [],
      grupos: [],
      relevancia: 'alta',
      comparativo2018: `O CERD III cobriu até 2017. O período 2018-2024 deveria ter sido o de resposta às críticas, mas muitas permanecem sem avanço.`
    });
  }

  return fios;
}

// =============================================
// GERAÇÃO DE CONCLUSÕES DINÂMICAS
// =============================================

function gerarConclusoesDinamicas(
  lacunas: LacunaIdentificada[],
  stats: any,
  respostas: RespostaLacunaCerdIII[],
  orcStats: any,
  indicadores: IndicadorInterseccional[],
  orcDados: DadoOrcamentario[],
  fios: FioCondutor[]
): ConclusaoDinamica[] {
  const conclusoes: ConclusaoDinamica[] = [];

  // Agrupar lacunas por eixo para conclusões temáticas
  const porEixo: Record<string, LacunaIdentificada[]> = {};
  lacunas.forEach(l => {
    if (!porEixo[l.eixo_tematico]) porEixo[l.eixo_tematico] = [];
    porEixo[l.eixo_tematico].push(l);
  });

  Object.entries(porEixo).forEach(([eixo, lacunasEixo]) => {
    const cumpridas = lacunasEixo.filter(l => l.status_cumprimento === 'cumprido').length;
    const parciais = lacunasEixo.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length;
    const naoCumpridas = lacunasEixo.filter(l => l.status_cumprimento === 'nao_cumprido').length;
    const retrocessos = lacunasEixo.filter(l => l.status_cumprimento === 'retrocesso').length;

    // Determinar tipo
    let tipo: 'lacuna_persistente' | 'avanco' | 'retrocesso';
    if (retrocessos > 0 && retrocessos >= cumpridas) {
      tipo = 'retrocesso';
    } else if (cumpridas > naoCumpridas + retrocessos) {
      tipo = 'avanco';
    } else {
      tipo = 'lacuna_persistente';
    }

    // Coletar evidências das lacunas
    const evidencias: string[] = [];
    lacunasEixo.forEach(l => {
      l.evidencias_encontradas?.forEach(ev => evidencias.push(ev));
    });

    // Coletar ações do Brasil
    const acoes: string[] = [];
    lacunasEixo.forEach(l => {
      l.acoes_brasil?.forEach(a => acoes.push(a));
    });

    // Grupos afetados
    const gruposAfetados = [...new Set(lacunasEixo.map(l => grupoLabels[l.grupo_focal]))];

    // Fios condutores relacionados
    const fiosRelacionados = fios.filter(f => f.eixos.includes(eixo)).map(f => f.id);

    // Argumento construído dinamicamente
    const percentualCumprimento = lacunasEixo.length > 0 
      ? Math.round(((cumpridas * 100) + (parciais * 50)) / lacunasEixo.length) 
      : 0;

    const argumento = construirArgumento(
      eixoLabels[eixo] || eixo,
      lacunasEixo.length,
      { cumpridas, parciais, naoCumpridas, retrocessos },
      percentualCumprimento,
      gruposAfetados,
      acoes,
      evidencias
    );

    conclusoes.push({
      id: `conclusao-${eixo}`,
      tipo,
      titulo: `${eixoLabels[eixo]}: ${tipo === 'avanco' ? 'Avanços Registrados' : tipo === 'retrocesso' ? 'Retrocessos Identificados' : 'Lacunas Persistentes'}`,
      periodo: '2018-2024',
      argumento_central: argumento,
      evidencias: [...evidencias.slice(0, 4), ...acoes.slice(0, 2)],
      eixos: [eixo],
      fromDatabase: true,
      relevancia_common_core: true,
      relevancia_cerd_iv: true,
      fiosCondutores: fiosRelacionados
    });
  });

  // Conclusão transversal: respostas CERD III
  if (respostas.length > 0) {
    const naoCumpridasResp = respostas.filter(r => r.grau_atendimento === 'nao_cumprido');
    const retrocessosResp = respostas.filter(r => r.grau_atendimento === 'retrocesso');
    const parciaisResp = respostas.filter(r => r.grau_atendimento === 'parcialmente_cumprido');
    
    const lacunasRemanescentes: string[] = [];
    respostas.forEach(r => {
      r.lacunas_remanescentes?.forEach(lr => lacunasRemanescentes.push(lr));
    });

    conclusoes.push({
      id: 'conclusao-respostas-cerd-iii',
      tipo: naoCumpridasResp.length + retrocessosResp.length > parciaisResp.length ? 'lacuna_persistente' : 'avanco',
      titulo: 'Balanço das Respostas ao CERD III (2004-2017)',
      periodo: '2018-2024',
      argumento_central: `Das ${respostas.length} críticas do relatório anterior, ${parciaisResp.length} foram parcialmente atendidas, ${naoCumpridasResp.length} permanecem sem cumprimento e ${retrocessosResp.length} registram retrocesso. ${lacunasRemanescentes.length} lacunas remanescentes foram identificadas, demandando atenção prioritária no IV Relatório. A análise revela que o Brasil avançou em marcos legais mas falhou na implementação efetiva.`,
      evidencias: lacunasRemanescentes.slice(0, 6),
      eixos: [],
      fromDatabase: true,
      relevancia_common_core: true,
      relevancia_cerd_iv: true,
      fiosCondutores: ['divida-cerd-iii', 'paradoxo-normativo']
    });
  }

  return conclusoes;
}

// =============================================
// GERAÇÃO DE INSIGHTS DE CRUZAMENTO
// =============================================

function gerarInsightsCruzamento(
  lacunas: LacunaIdentificada[],
  stats: any,
  respostas: RespostaLacunaCerdIII[],
  orcStats: any,
  indicadores: IndicadorInterseccional[],
  orcDados: DadoOrcamentario[]
): InsightCruzamento[] {
  const insights: InsightCruzamento[] = [];

  // Insight 1: Cruzamento prioridade × status
  const criticasNaoCumpridas = lacunas.filter(l => l.prioridade === 'critica' && l.status_cumprimento === 'nao_cumprido');
  if (criticasNaoCumpridas.length > 0) {
    insights.push({
      id: 'criticas-nao-cumpridas',
      titulo: `${criticasNaoCumpridas.length} lacunas CRÍTICAS sem cumprimento`,
      descricao: `Lacunas de prioridade crítica que permanecem não cumpridas representam as maiores falhas do Estado. Concentram-se em: ${[...new Set(criticasNaoCumpridas.map(l => eixoLabels[l.eixo_tematico]))].join(', ')}.`,
      dados: criticasNaoCumpridas.map(l => `§${l.paragrafo}: ${l.tema} (${grupoLabels[l.grupo_focal]})`),
      tipo: 'alerta'
    });
  }

  // Insight 2: Eixos com retrocesso
  const retrocessos = lacunas.filter(l => l.status_cumprimento === 'retrocesso');
  if (retrocessos.length > 0) {
    insights.push({
      id: 'retrocessos-identificados',
      titulo: `${retrocessos.length} áreas em retrocesso`,
      descricao: `Áreas onde a situação piorou em relação ao período anterior. Exigem ação emergencial e reconhecimento no relatório ao Comitê.`,
      dados: retrocessos.map(l => `§${l.paragrafo}: ${l.tema} - ${l.descricao_lacuna.substring(0, 80)}...`),
      tipo: 'alerta'
    });
  }

  // Insight 3: Interseccionalidades mais frequentes
  const intersecContagem: Record<string, number> = {};
  lacunas.forEach(l => {
    l.interseccionalidades?.forEach(i => {
      intersecContagem[i] = (intersecContagem[i] || 0) + 1;
    });
  });
  const intersecOrdenadas = Object.entries(intersecContagem).sort((a, b) => b[1] - a[1]);
  if (intersecOrdenadas.length > 0) {
    insights.push({
      id: 'interseccionalidades-frequentes',
      titulo: 'Interseccionalidades mais frequentes',
      descricao: `As dimensões interseccionais mais citadas nas lacunas revelam onde se concentram as vulnerabilidades múltiplas.`,
      dados: intersecOrdenadas.slice(0, 5).map(([dim, count]) => `${dim}: presente em ${count} de ${lacunas.length} lacunas (${Math.round(count/lacunas.length*100)}%)`),
      tipo: 'correlação'
    });
  }

  // Insight 4: Grupos mais vulneráveis
  const gruposVulneraveis = Object.entries(stats.porGrupo || {})
    .sort((a: any, b: any) => b[1] - a[1])
    .slice(0, 5);
  if (gruposVulneraveis.length > 0) {
    insights.push({
      id: 'grupos-vulneraveis',
      titulo: 'Grupos focais com mais lacunas',
      descricao: `Grupos populacionais com maior concentração de observações não cumpridas ou em retrocesso.`,
      dados: gruposVulneraveis.map(([g, count]: any) => `${grupoLabels[g] || g}: ${count} lacuna(s)`),
      tipo: 'alerta'
    });
  }

  // Insight 5: Contradição orçamento × lacunas
  if (orcStats && orcStats.variacao > 0 && criticasNaoCumpridas.length > 0) {
    insights.push({
      id: 'contradição-orcamento',
      titulo: 'Contradição: Orçamento cresceu, lacunas persistem',
      descricao: `O orçamento para políticas raciais variou ${orcStats.variacao.toFixed(0)}% entre períodos, mas ${criticasNaoCumpridas.length} lacunas críticas permanecem sem cumprimento. Isso sugere que o aumento de recursos não foi direcionado às áreas de maior necessidade.`,
      dados: [
        `Orçamento 2018-2022: R$ ${formatBRL(orcStats.totalPeriodo1)}`,
        `Orçamento 2023-2026: R$ ${formatBRL(orcStats.totalPeriodo2)}`,
        `Lacunas críticas não resolvidas: ${criticasNaoCumpridas.length}`
      ],
      tipo: 'contradição'
    });
  }

  // Insight 6: Fontes de dados coletadas vs necessárias
  const fontesColetadas = new Set<string>();
  lacunas.forEach(l => l.fontes_dados?.forEach(f => fontesColetadas.add(f)));
  if (fontesColetadas.size > 0) {
    insights.push({
      id: 'cobertura-fontes',
      titulo: `${fontesColetadas.size} fontes de dados utilizadas`,
      descricao: `Fontes oficiais que embasam a análise das lacunas. Quanto maior a diversidade de fontes, mais robusta a argumentação.`,
      dados: [...fontesColetadas].slice(0, 8),
      tipo: 'progresso'
    });
  }

  return insights;
}

// =============================================
// SÍNTESE EXECUTIVA DINÂMICA
// =============================================

function gerarSinteseExecutiva(
  lacunas: LacunaIdentificada[],
  stats: any,
  respostas: RespostaLacunaCerdIII[],
  orcStats: any,
  indicadores: IndicadorInterseccional[]
) {
  const total = stats.total;
  const cumpridas = stats.porStatus.cumprido;
  const parciais = stats.porStatus.parcialmente_cumprido;
  const naoCumpridas = stats.porStatus.nao_cumprido;
  const retrocesso = stats.porStatus.retrocesso;

  const percentualPositivo = total > 0 ? Math.round(((cumpridas + parciais) / total) * 100) : 0;
  const percentualNegativo = total > 0 ? Math.round(((naoCumpridas + retrocesso) / total) * 100) : 0;

  // Eixos mais problemáticos
  const eixosMaisProblematicos = Object.entries(stats.porEixo || {})
    .map(([eixo, count]: any) => {
      const naoCumpridasEixo = lacunas.filter(l => l.eixo_tematico === eixo && (l.status_cumprimento === 'nao_cumprido' || l.status_cumprimento === 'retrocesso')).length;
      return { eixo: eixoLabels[eixo], gravidade: count > 0 ? naoCumpridasEixo / count : 0, total: count };
    })
    .sort((a, b) => b.gravidade - a.gravidade);

  // Respostas CERD III
  const respostasNaoCumpridas = respostas.filter(r => r.grau_atendimento === 'nao_cumprido' || r.grau_atendimento === 'retrocesso');

  return {
    totalLacunas: total,
    percentualPositivo,
    percentualNegativo,
    retrocessos: retrocesso,
    eixosMaisProblematicos: eixosMaisProblematicos.slice(0, 3),
    totalRespostasCERDIII: respostas.length,
    respostasPendentes: respostasNaoCumpridas.length,
    totalIndicadores: indicadores.length,
    totalOrcamento: orcStats?.totalRegistros || 0,
    variacaoOrcamento: orcStats?.variacao || 0,
    narrativa: `O Brasil possui ${total} observações/recomendações do Comitê CERD mapeadas. ${percentualPositivo}% tiveram algum grau de cumprimento (${cumpridas} cumpridas + ${parciais} parciais), enquanto ${percentualNegativo}% permanecem não cumpridas (${naoCumpridas}) ou em retrocesso (${retrocesso}). ${respostasNaoCumpridas.length} de ${respostas.length} críticas do relatório anterior seguem sem resposta adequada. ${eixosMaisProblematicos.length > 0 ? `O eixo mais crítico é ${eixosMaisProblematicos[0]?.eixo} com ${Math.round(eixosMaisProblematicos[0]?.gravidade * 100)}% de não-cumprimento.` : ''}`
  };
}

// =============================================
// HELPERS
// =============================================

function construirArgumento(
  eixo: string,
  total: number,
  status: { cumpridas: number; parciais: number; naoCumpridas: number; retrocessos: number },
  percentual: number,
  grupos: string[],
  acoes: string[],
  evidencias: string[]
): string {
  let arg = `No eixo ${eixo}, foram identificadas ${total} observações/recomendações do Comitê CERD. `;
  
  if (status.retrocessos > 0) {
    arg += `ALERTA: ${status.retrocessos} área(s) registram retrocesso. `;
  }
  
  arg += `Grau de cumprimento: ${percentual}% (${status.cumpridas} cumpridas, ${status.parciais} parciais, ${status.naoCumpridas} não cumpridas). `;
  
  if (grupos.length > 0) {
    arg += `\n\nGrupos afetados: ${grupos.join(', ')}. `;
  }
  
  if (acoes.length > 0) {
    arg += `\n\nO Brasil implementou ${acoes.length} ação(ões), entre elas: ${acoes.slice(0, 3).join('; ')}. `;
  }
  
  if (evidencias.length > 0) {
    arg += `\n\nAs evidências coletadas (${evidencias.length} registros) revelam que, apesar das ações, as disparidades estruturais persistem.`;
  }
  
  return arg;
}

function formatBRL(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(2)} bi`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)} mi`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)} mil`;
  return value.toFixed(0);
}

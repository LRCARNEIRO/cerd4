import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type ComplianceStatus = 'cumprido' | 'parcialmente_cumprido' | 'nao_cumprido' | 'retrocesso' | 'em_andamento';
export type PriorityLevel = 'critica' | 'alta' | 'media' | 'baixa';
export type FocalGroupType = 'negros' | 'indigenas' | 'quilombolas' | 'ciganos' | 'religioes_matriz_africana' | 'juventude_negra' | 'mulheres_negras' | 'lgbtqia_negros' | 'pcd_negros' | 'idosos_negros' | 'geral';
export type ThematicAxis = 'legislacao_justica' | 'politicas_institucionais' | 'seguranca_publica' | 'saude' | 'educacao' | 'trabalho_renda' | 'terra_territorio' | 'cultura_patrimonio' | 'participacao_social' | 'dados_estatisticas';

export interface LacunaIdentificada {
  id: string;
  documento_onu: string;
  paragrafo: string;
  data_documento: string;
  eixo_tematico: ThematicAxis;
  grupo_focal: FocalGroupType;
  tipo_observacao: 'preocupacao' | 'recomendacao' | 'solicitacao' | 'elogio';
  tema: string;
  descricao_lacuna: string;
  texto_original_onu: string | null;
  status_cumprimento: ComplianceStatus;
  prioridade: PriorityLevel;
  periodo_analise_inicio: number;
  periodo_analise_fim: number;
  evidencias_encontradas: string[] | null;
  acoes_brasil: string[] | null;
  fontes_dados: string[] | null;
  indicadores_relacionados: Record<string, unknown> | null;
  interseccionalidades: string[] | null;
  resposta_sugerida_common_core: string | null;
  resposta_sugerida_cerd_iv: string | null;
  created_at: string;
  updated_at: string;
}

export interface IndicadorInterseccional {
  id: string;
  nome: string;
  categoria: string;
  subcategoria: string | null;
  fonte: string;
  url_fonte: string | null;
  desagregacao_raca: boolean;
  desagregacao_genero: boolean;
  desagregacao_idade: boolean;
  desagregacao_classe: boolean;
  desagregacao_orientacao_sexual: boolean;
  desagregacao_deficiencia: boolean;
  desagregacao_territorio: boolean;
  dados: Record<string, Record<string, number>>;
  tendencia: string | null;
  analise_interseccional: string | null;
  lacunas_relacionadas: string[] | null;
  documento_origem: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface ConclusaoAnalitica {
  id: string;
  titulo: string;
  tipo: string;
  periodo: string;
  argumento_central: string;
  evidencias: string[] | null;
  indicadores_suporte: Record<string, unknown> | null;
  lacunas_relacionadas: string[] | null;
  eixos_tematicos: ThematicAxis[] | null;
  grupos_focais: FocalGroupType[] | null;
  relevancia_common_core: boolean;
  relevancia_cerd_iv: boolean;
  secao_relatorio: string | null;
  created_at: string;
  updated_at: string;
}

export interface RespostaLacunaCerdIII {
  id: string;
  paragrafo_cerd_iii: string;
  critica_original: string;
  resposta_brasil: string;
  evidencias_quantitativas: Record<string, unknown> | null;
  evidencias_qualitativas: string[] | null;
  grau_atendimento: ComplianceStatus;
  justificativa_avaliacao: string | null;
  lacunas_remanescentes: string[] | null;
  created_at: string;
  updated_at: string;
}

// Hook para buscar lacunas identificadas
export function useLacunasIdentificadas(filters?: {
  eixo?: ThematicAxis;
  grupo?: FocalGroupType;
  status?: ComplianceStatus;
  prioridade?: PriorityLevel;
}) {
  return useQuery({
    queryKey: ['lacunas-identificadas', filters],
    queryFn: async () => {
      let query = supabase
        .from('lacunas_identificadas')
        .select('*')
        .order('prioridade', { ascending: true })
        .order('paragrafo', { ascending: true });

      if (filters?.eixo) {
        query = query.eq('eixo_tematico', filters.eixo);
      }
      if (filters?.grupo) {
        query = query.eq('grupo_focal', filters.grupo);
      }
      if (filters?.status) {
        query = query.eq('status_cumprimento', filters.status);
      }
      if (filters?.prioridade) {
        query = query.eq('prioridade', filters.prioridade);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LacunaIdentificada[];
    },
  });
}

// Hook para buscar indicadores interseccionais
export function useIndicadoresInterseccionais(categoria?: string) {
  return useQuery({
    queryKey: ['indicadores-interseccionais', categoria],
    queryFn: async () => {
      let query = supabase
        .from('indicadores_interseccionais')
        .select('*')
        .order('categoria', { ascending: true });

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as IndicadorInterseccional[];
    },
  });
}

// Hook para buscar conclusões analíticas
export function useConclusoesAnaliticas(periodo?: string) {
  return useQuery({
    queryKey: ['conclusoes-analiticas', periodo],
    queryFn: async () => {
      let query = supabase
        .from('conclusoes_analiticas')
        .select('*')
        .order('created_at', { ascending: false });

      if (periodo) {
        query = query.eq('periodo', periodo);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ConclusaoAnalitica[];
    },
  });
}

// Hook para buscar respostas às lacunas do CERD III
export function useRespostasLacunasCerdIII() {
  return useQuery({
    queryKey: ['respostas-lacunas-cerd-iii'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('respostas_lacunas_cerd_iii')
        .select('*')
        .order('paragrafo_cerd_iii', { ascending: true });

      if (error) throw error;
      return data as RespostaLacunaCerdIII[];
    },
  });
}

// Hook para estatísticas agregadas das lacunas
export function useLacunasStats() {
  return useQuery({
    queryKey: ['lacunas-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lacunas_identificadas')
        .select('status_cumprimento, prioridade, eixo_tematico, grupo_focal');

      if (error) throw error;

      const lacunas = data || [];
      
      return {
        total: lacunas.length,
        porStatus: {
          cumprido: lacunas.filter(l => l.status_cumprimento === 'cumprido').length,
          parcialmente_cumprido: lacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length,
          nao_cumprido: lacunas.filter(l => l.status_cumprimento === 'nao_cumprido').length,
          retrocesso: lacunas.filter(l => l.status_cumprimento === 'retrocesso').length,
          em_andamento: lacunas.filter(l => l.status_cumprimento === 'em_andamento').length,
        },
        porPrioridade: {
          critica: lacunas.filter(l => l.prioridade === 'critica').length,
          alta: lacunas.filter(l => l.prioridade === 'alta').length,
          media: lacunas.filter(l => l.prioridade === 'media').length,
          baixa: lacunas.filter(l => l.prioridade === 'baixa').length,
        },
        porEixo: lacunas.reduce((acc, l) => {
          acc[l.eixo_tematico] = (acc[l.eixo_tematico] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        porGrupo: lacunas.reduce((acc, l) => {
          acc[l.grupo_focal] = (acc[l.grupo_focal] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
      };
    },
  });
}

// Interface para dados orçamentários
export interface DadoOrcamentario {
  id: string;
  programa: string;
  orgao: string;
  esfera: 'federal' | 'estadual' | 'municipal';
  ano: number;
  dotacao_inicial: number | null;
  dotacao_autorizada: number | null;
  empenhado: number | null;
  liquidado: number | null;
  pago: number | null;
  percentual_execucao: number | null;
  grupo_focal: string | null;
  eixo_tematico: string | null;
  fonte_dados: string;
  url_fonte: string | null;
  observacoes: string | null;
  descritivo: string | null;
  publico_alvo: string | null;
  razao_selecao: string | null;
  created_at: string;
  updated_at: string;
}

// Hook para buscar dados orçamentários
export function useDadosOrcamentarios(filters?: {
  programa?: string;
  grupo_focal?: string;
  eixo_tematico?: string;
  ano?: number;
}) {
  return useQuery({
    queryKey: ['dados-orcamentarios', filters],
    queryFn: async () => {
      let allData: any[] = [];
      let page = 0;
      const pageSize = 1000;

      while (true) {
        let query = supabase
          .from('dados_orcamentarios')
          .select('*')
          .order('programa')
          .order('ano')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (filters?.programa) query = query.eq('programa', filters.programa);
        if (filters?.grupo_focal) query = query.eq('grupo_focal', filters.grupo_focal);
        if (filters?.eixo_tematico) query = query.eq('eixo_tematico', filters.eixo_tematico);
        if (filters?.ano) query = query.eq('ano', filters.ano);

        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) break;
        allData = allData.concat(data);
        if (data.length < pageSize) break;
        page++;
      }

      return allData as DadoOrcamentario[];
    },
  });
}

/** Check if a record is SESAI (Saúde Indígena) — must be excluded from racial policy totals */
function isSesaiRecord(r: { orgao: string; programa: string; observacoes?: string | null }): boolean {
  const orgao = r.orgao.toUpperCase();
  const prog = r.programa.toLowerCase();
  const obs = ((r as any).observacoes || '').toLowerCase();
  return orgao === 'SESAI' || obs.includes('saúde indígena') || obs.includes('sesai') ||
    prog.includes('20yp') || prog.includes('7684');
}

/** Check if a 5034/2020 record is a non-racial distortion (exclude only non-MIR, non-racial-keyword actions) */
function is5034Distortion2020(r: { ano: number; programa: string; orgao?: string; descritivo?: string; publico_alvo?: string; observacoes?: string }): boolean {
  if (r.ano !== 2020 || !r.programa.toLowerCase().includes('5034')) return false;
  const texto = [r.programa, r.orgao, r.descritivo, r.publico_alvo, r.observacoes].filter(Boolean).join(' ').toLowerCase();
  const isMIR = r.orgao === 'MIR' || r.orgao === 'SEPPIR';
  const hasRacialKw = ['racial', 'racismo', 'negro', 'negra', 'afro', 'quilombol', 'cigan', 'romani', 'terreiro', 'matriz africana', 'igualdade racial', 'palmares', 'capoeira', 'candomblé', 'umbanda'].some(kw => texto.includes(kw));
  return !isMIR && !hasRacialKw; // only exclude if NOT MIR and NO racial keywords
}

// Hook para estatísticas orçamentárias com dados por esfera
export function useOrcamentoStats() {
  return useQuery({
    queryKey: ['orcamento-stats'],
    queryFn: async () => {
      // Fetch in pages to overcome 1000-row limit
      let allRegistros: any[] = [];
      let page = 0;
      const pageSize = 1000;
      
      while (true) {
        const { data, error } = await supabase
          .from('dados_orcamentarios')
          .select('ano, pago, empenhado, dotacao_autorizada, grupo_focal, programa, esfera, orgao, observacoes, descritivo, publico_alvo')
          .range(page * pageSize, (page + 1) * pageSize - 1);

        if (error) throw error;
        if (!data || data.length === 0) break;
        allRegistros = allRegistros.concat(data);
        if (data.length < pageSize) break;
        page++;
      }

      const registros = allRegistros;
      
      // Exclude SESAI + 2020 Program 5034 distortion from all comparative calculations
      const registrosLimpos = registros.filter(r => !isSesaiRecord(r) && !is5034Distortion2020(r));
      
      // Use pago when available, fallback to dotacao_autorizada
      const valorEfetivo = (r: typeof registros[0]) => 
        Number(r.pago) || Number(r.dotacao_autorizada) || 0;

      const periodo1 = registrosLimpos.filter(r => r.ano >= 2018 && r.ano <= 2022);
      const periodo2 = registrosLimpos.filter(r => r.ano >= 2023 && r.ano <= 2026);

      const totalPeriodo1 = periodo1.reduce((acc, r) => acc + valorEfetivo(r), 0);
      const totalPeriodo2 = periodo2.reduce((acc, r) => acc + valorEfetivo(r), 0);

      const porAno: Record<number, number> = {};
      registrosLimpos.forEach(r => {
        porAno[r.ano] = (porAno[r.ano] || 0) + valorEfetivo(r);
      });

      const porPrograma: Record<string, number> = {};
      registrosLimpos.forEach(r => {
        porPrograma[r.programa] = (porPrograma[r.programa] || 0) + valorEfetivo(r);
      });

      // Por esfera
      const porEsfera: Record<string, { total: number; programas: number }> = {};
      registrosLimpos.forEach(r => {
        if (!porEsfera[r.esfera]) porEsfera[r.esfera] = { total: 0, programas: 0 };
        porEsfera[r.esfera].total += valorEfetivo(r);
        porEsfera[r.esfera].programas++;
      });

      // SESAI stats (informativo)
      const sesaiRegistros = registros.filter(r => isSesaiRecord(r));
      const sesaiTotal = sesaiRegistros.reduce((acc, r) => acc + valorEfetivo(r), 0);

      // 5034-2020 stats (informativo)
      const distorcao5034 = registros.filter(r => is5034Distortion2020(r));
      const distorcao5034Total = distorcao5034.reduce((acc, r) => acc + valorEfetivo(r), 0);

      return {
        totalPeriodo1,
        totalPeriodo2,
        variacao: totalPeriodo1 > 0 ? ((totalPeriodo2 - totalPeriodo1) / totalPeriodo1 * 100) : 0,
        porAno,
        porPrograma,
        porEsfera,
        totalRegistros: registrosLimpos.length,
        sesaiTotal,
        sesaiRegistros: sesaiRegistros.length,
        distorcao5034Total,
        distorcao5034Registros: distorcao5034.length,
      };
    },
  });
}

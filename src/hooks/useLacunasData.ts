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

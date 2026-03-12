import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { OdsRacialIndicator, OdsFormat } from '@/data/odsRacialIndicators';

/**
 * Busca indicadores ODS Racial do banco de dados (indicadores_interseccionais WHERE categoria = 'ods_racial').
 * Transforma o formato do banco para o formato OdsRacialIndicator usado pelo componente.
 */
export function useOdsRacialData() {
  return useQuery({
    queryKey: ['ods-racial-db'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indicadores_interseccionais')
        .select('*')
        .eq('categoria', 'ods_racial')
        .order('subcategoria', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;

      const indicators: OdsRacialIndicator[] = (data || []).map((row) => {
        const dados = row.dados as Record<string, any>;
        return {
          id: dados?.ods_id || row.id,
          name: row.nome,
          group: row.subcategoria || 'Outros',
          slug: dados?.slug || '',
          fonte: row.fonte,
          url: row.url_fonte || '',
          formato: (dados?.formato || 'float') as OdsFormat,
          artigoCerd: row.artigos_convencao || [],
          series: dados?.series || {},
        };
      });

      return indicators;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

/**
 * Busca indicadores de Juventude auditados do banco de dados.
 */
export function useJuventudeAuditados() {
  return useQuery({
    queryKey: ['juventude-auditados-db'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indicadores_interseccionais')
        .select('*')
        .eq('subcategoria', 'juventude')
        .eq('auditado_manualmente', true)
        .order('nome', { ascending: true });

      if (error) throw error;

      return (data || []).map((row) => {
        const dados = row.dados as Record<string, any>;
        return {
          indicador: row.nome,
          valor: dados?.valor_negros ?? 0,
          referencia: dados?.valor_nao_negros ?? dados?.valor_brancos ?? 0,
          fonte: row.fonte,
          url: row.url_fonte || '',
          labelNegro: 'Jovens Negros',
          labelReferencia: row.fonte?.includes('Atlas') ? 'Jovens Não Negros' : 'Jovens Brancos',
          nota: dados?.nota || null,
        };
      });
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

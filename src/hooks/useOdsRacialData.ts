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
 *
 * Os registros do banco têm formatos distintos de `dados`:
 *  - `registros: [{ indicador, valor, referencia, labelNegro, labelReferencia, fonte, url, nota }]`
 *  - `{ valor_negros, valor_nao_negros | valor_brancos }`
 *  - `{ percentual_negros: { ANO: n }, percentual_brancos: { ANO: n } }`
 * Linhas sem par Negro×Branco (ex.: série demográfica) são omitidas —
 * jamais preenchidas com zero (Regra de Ouro).
 */
function ultimoValorPorAno(v: any): number | null {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    const anos = Object.keys(v).filter((k) => /^\d{4}$/.test(k)).sort();
    if (anos.length) return ultimoValorPorAno(v[anos[anos.length - 1]]);
  }
  return null;
}

export function useJuventudeAuditados() {
  return useQuery({
    queryKey: ['juventude-auditados-db-v2'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indicadores_interseccionais')
        .select('*')
        .like('subcategoria', 'juventude%')
        .eq('auditado_manualmente', true)
        .order('nome', { ascending: true });

      if (error) throw error;

      type Item = {
        indicador: string; valor: number; referencia: number;
        fonte: string; url: string; labelNegro: string; labelReferencia: string;
        nota: string | null;
      };
      const out: Item[] = [];

      for (const row of data || []) {
        const dados = (row.dados || {}) as Record<string, any>;

        // Formato 1 — lista de registros comparativos
        if (Array.isArray(dados.registros)) {
          for (const r of dados.registros) {
            const valor = ultimoValorPorAno(r?.valor);
            const referencia = ultimoValorPorAno(r?.referencia);
            if (valor === null || referencia === null) continue;
            out.push({
              indicador: String(r.indicador || row.nome),
              valor, referencia,
              fonte: String(r.fonte || row.fonte || ''),
              url: String(r.url || row.url_fonte || ''),
              labelNegro: String(r.labelNegro || 'Jovens Negros'),
              labelReferencia: String(r.labelReferencia || 'Jovens Brancos'),
              nota: r.nota ? String(r.nota) : null,
            });
          }
          continue;
        }

        // Formatos 2 e 3 — par direto no próprio registro
        const valor = ultimoValorPorAno(dados.valor_negros) ?? ultimoValorPorAno(dados.percentual_negros);
        const referencia =
          ultimoValorPorAno(dados.valor_nao_negros) ??
          ultimoValorPorAno(dados.valor_brancos) ??
          ultimoValorPorAno(dados.percentual_nao_negros) ??
          ultimoValorPorAno(dados.percentual_brancos);
        if (valor === null || referencia === null) continue;

        out.push({
          indicador: row.nome,
          valor, referencia,
          fonte: row.fonte,
          url: row.url_fonte || '',
          labelNegro: 'Jovens Negros',
          labelReferencia: row.fonte?.includes('Atlas') ? 'Jovens Não Negros' : 'Jovens Brancos',
          nota: dados?.nota ? String(dados.nota) : null,
        });
      }

      return out;
    },
    staleTime: Infinity,
    gcTime: Infinity,
  });
}


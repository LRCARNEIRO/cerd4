/**
 * useStaticIndicadorCodigos — resolve `nome → IND-NNN` para indicadores
 * exibidos a partir de fontes estáticas (Complemento CERD III, Common Core,
 * Adm Pública, COVID, Grupos Focais).
 *
 * Os cards estáticos não possuem `id` UUID próprio — o id canônico só
 * existe no banco após a ingestão pelo MirrorIngestionPanel. Este hook
 * consulta a tabela `indicadores_interseccionais`, calcula o código curto
 * com a mesma regra do resto do sistema (created_at ASC, id ASC) e
 * devolve um Map indexado pelo `nome` exato (case-insensitive, trim).
 *
 * Uso:
 *   const codigos = useStaticIndicadorCodigos();
 *   const code = codigos.get(ind.nome.trim().toLowerCase()); // 'IND-203' | undefined
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { buildIndicadorCodigoMap } from '@/utils/indicadorCodigo';

export function useStaticIndicadorCodigos() {
  const { data } = useQuery({
    queryKey: ['static-indicador-codigos'],
    staleTime: 5 * 60 * 1000,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indicadores_interseccionais')
        .select('id, nome, created_at')
        .order('created_at', { ascending: true })
        .order('id', { ascending: true });
      if (error) throw error;
      const all = data || [];
      const codigos = buildIndicadorCodigoMap(all);
      const map = new Map<string, string>();
      for (const ind of all) {
        const code = codigos.get(ind.id);
        if (!code) continue;
        const key = String(ind.nome || '').trim().toLowerCase();
        if (key) map.set(key, code);
      }
      return map;
    },
  });
  return data ?? new Map<string, string>();
}

/** Resolve um único nome para código IND-NNN (helper). */
export function lookupCodigo(map: Map<string, string>, nome: string): string | null {
  return map.get(String(nome || '').trim().toLowerCase()) || null;
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DesempregoSidra {
  ano: number;
  branca: number;
  preta: number;
  parda: number;
  negra: number;
  trimestresUsados: number;
  detalhe: {
    branca_trimestres: number[];
    preta_trimestres: number[];
    parda_trimestres: number[];
  };
  fonte: string;
  apiUrl: string;
}

interface SidraResponse {
  success: boolean;
  timestamp: string;
  tabela: string;
  variavel: string;
  nota_metodologica: string;
  linkAuditoria: string;
  dados: DesempregoSidra[];
}

export function useSidraDesemprego() {
  return useQuery<SidraResponse>({
    queryKey: ['sidra-desemprego-6402'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-sidra-desemprego');
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Falha ao buscar SIDRA');
      return data;
    },
    staleTime: Infinity,   // Dados auditados: nunca expiram na sessão
    gcTime: Infinity,
    retry: 2,
  });
}

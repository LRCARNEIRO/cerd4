import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface RendaSidra {
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

interface SidraRendaResponse {
  success: boolean;
  timestamp: string;
  tabela: string;
  variavel: string;
  nota_metodologica: string;
  linkAuditoria: string;
  dados: RendaSidra[];
}

export function useSidraRenda() {
  return useQuery<SidraRendaResponse>({
    queryKey: ['sidra-renda-6405'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-sidra-renda');
      if (error) throw error;
      if (!data?.success) throw new Error(data?.error || 'Falha ao buscar SIDRA renda');
      return data;
    },
    staleTime: Infinity,   // Dados auditados: nunca expiram na sessão
    gcTime: Infinity,      // Manter em cache permanentemente
    retry: 2,
  });
}

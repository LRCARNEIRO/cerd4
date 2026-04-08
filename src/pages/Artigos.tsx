import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAnalyticalInsights } from '@/hooks/useAnalyticalInsights';
import { IcerdAdherencePanel } from '@/components/conclusoes/IcerdAdherencePanel';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';

export default function Artigos() {
  const { fiosCondutores, conclusoesDinamicas, respostas, orcDados, indicadores, stats, lacunas } = useAnalyticalInsights();

  const { data: normativosCount = 0 } = useQuery({
    queryKey: ['normativos-artigos-count'],
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('documentos_normativos')
        .select('id', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  return (
    <DashboardLayout
      title="Artigos — Aderência ICERD"
      subtitle="Avaliação sistêmica da conformidade com os Artigos I-VII da Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial"
    >
      <div className="flex justify-end mb-4">
        <ExportTabButtons
          targetSelector="#export-artigos-aderencia"
          fileName="artigos-aderencia-icerd"
          compact
        />
      </div>
      <div id="export-artigos-aderencia">
        <IcerdAdherencePanel
          fiosCondutores={fiosCondutores}
          conclusoes={conclusoesDinamicas}
          lacunas={lacunas || []}
          orcamentoRecords={orcDados || []}
          indicadores={indicadores || []}
          stats={stats}
          respostas={respostas || []}
          documentosNormativosCount={normativosCount}
        />
      </div>
    </DashboardLayout>
  );
}

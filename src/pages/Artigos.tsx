import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAnalyticalInsights } from '@/hooks/useAnalyticalInsights';
import { useLacunasIdentificadas, useDadosOrcamentarios, useIndicadoresAnaliticos } from '@/hooks/useLacunasData';
import { IcerdAdherencePanel } from '@/components/conclusoes/IcerdAdherencePanel';

export default function Artigos() {
  const { fiosCondutores, conclusoesDinamicas, respostas, orcDados, indicadores, stats } = useAnalyticalInsights();
  const { data: allLacunas } = useLacunasIdentificadas({});

  const { data: allNormativos } = useQuery({
    queryKey: ['normativos-artigos'],
    queryFn: async () => {
      const { data } = await supabase.from('documentos_normativos').select('*');
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <DashboardLayout
      title="Artigos — Aderência ICERD"
      subtitle="Avaliação sistêmica da conformidade com os Artigos I-VII da Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial"
    >
      <IcerdAdherencePanel
        fiosCondutores={fiosCondutores}
        conclusoes={conclusoesDinamicas}
        lacunas={allLacunas || []}
        orcamentoRecords={orcDados || []}
        indicadores={indicadores || []}
        stats={stats}
        respostas={respostas || []}
        documentosNormativos={allNormativos || []}
      />
    </DashboardLayout>
  );
}

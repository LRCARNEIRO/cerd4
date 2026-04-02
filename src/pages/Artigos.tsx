import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAnalyticalInsights } from '@/hooks/useAnalyticalInsights';
import { useLacunasIdentificadas, useDadosOrcamentarios, useIndicadoresAnaliticos } from '@/hooks/useLacunasData';
import { IcerdAdherencePanel } from '@/components/conclusoes/IcerdAdherencePanel';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { useMemo } from 'react';

export default function Artigos() {
  const { fiosCondutores, conclusoesDinamicas, respostas, orcDados, indicadores, stats } = useAnalyticalInsights();
  const { data: allLacunas } = useLacunasIdentificadas({});
  const { diagnosticMap } = useDiagnosticSensor(allLacunas);

  // Enrich lacunas with computed status
  const enrichedLacunas = useMemo(() => {
    if (!allLacunas) return [];
    return allLacunas.map(l => {
      const diag = diagnosticMap.get(l.id);
      return { ...l, _computedStatus: diag?.statusComputado ?? l.status_cumprimento };
    });
  }, [allLacunas, diagnosticMap]);

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
        lacunas={enrichedLacunas}
        orcamentoRecords={orcDados || []}
        indicadores={indicadores || []}
        stats={stats}
        respostas={respostas || []}
        documentosNormativos={allNormativos || []}
      />
    </DashboardLayout>
  );
}

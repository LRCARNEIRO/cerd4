import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAnalyticalInsights } from '@/hooks/useAnalyticalInsights';
import { IcerdAdherencePanel } from '@/components/conclusoes/IcerdAdherencePanel';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { useEvidenceOverrides } from '@/hooks/useEvidenceOverrides';
import { ExportAllArtigosButton } from '@/components/artigos/ExportArtigoButtons';

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

  // SSoT: mesmas evidências usadas em Recomendações, agora agregadas por Artigo.
  const { data: recomendacoes } = useLacunasIdentificadas({});
  const [evidenceOverrides] = useEvidenceOverrides();
  const { diagnosticMap, isReady: sensorReady, rawIndicadores, rawOrcamento, rawNormativos } =
    useDiagnosticSensor(recomendacoes, evidenceOverrides);

  return (
    <DashboardLayout
      title="Artigos — Aderência ICERD"
      subtitle="Avaliação sistêmica da conformidade com os Artigos I-VII da Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial"
    >
      <div className="flex justify-end gap-2 mb-4">
        <ExportAllArtigosButton
          recomendacoes={recomendacoes || []}
          diagnosticMap={diagnosticMap}
          rawIndicadores={rawIndicadores}
          rawOrcamento={rawOrcamento}
          rawNormativos={rawNormativos}
          disabled={!sensorReady}
        />
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

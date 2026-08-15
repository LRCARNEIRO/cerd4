import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, FileDown, Download, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLacunasIdentificadas, useIndicadoresInterseccionais, useDadosOrcamentarios } from '@/hooks/useLacunasData';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { useEvidenceOverridesReadOnly } from '@/hooks/useEvidenceOverrides';
import { generateProtocoloGovernancaHTML } from './generateProtocoloGovernancaHTML';
import { downloadAsDocx } from '@/utils/reportExportToolbar';
import { openHtmlPreview } from '@/utils/reportPreview';

export function ProtocoloGovernancaReport() {
  const [generating, setGenerating] = useState(false);

  const { data: recomendacoes, isLoading: loadingRec } = useLacunasIdentificadas();
  const { data: indicadores, isLoading: loadingInd } = useIndicadoresInterseccionais();
  const { data: orcDados, isLoading: loadingOrc } = useDadosOrcamentarios();
  const { data: normativos, isLoading: loadingNorm } = useQuery({
    queryKey: ['documentos_normativos_protocolo_governanca'],
    queryFn: async () => {
      const { data } = await supabase.from('documentos_normativos').select('*');
      return data || [];
    },
  });

  const overrides = useEvidenceOverridesReadOnly();
  const { diagnosticMap, isReady } = useDiagnosticSensor(recomendacoes, overrides);

  const loading = loadingRec || loadingInd || loadingOrc || loadingNorm || !isReady;

  const buildHtml = () =>
    generateProtocoloGovernancaHTML({
      indicadores: indicadores || [],
      orcDados: orcDados || [],
      normativos: normativos || [],
      recomendacoes: recomendacoes || [],
      diagnosticMap,
    });

  const handlePreview = () => openHtmlPreview(buildHtml(), 'Protocolo Metodológico de Governança');

  const handleDocx = async () => {
    setGenerating(true);
    try {
      await downloadAsDocx(buildHtml(), 'protocolo-metodologico-governanca');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="w-4 h-4 text-primary" />
              Protocolo Metodológico de Governança — Legado e Método
            </CardTitle>
            <CardDescription className="mt-1">
              Guia metodológico digital: taxonomia, fontes de dados (SIOP/SIAFI, IBGE/SIDRA, CadÚnico e demais),
              fórmulas de cálculo de cada índice, fluxogramas de dados e critérios de classificação. Gerado
              dinamicamente a partir das bases Estatística, Orçamentária e Normativa.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-[10px]">Produto 2</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Indicadores" value={indicadores?.length} />
          <Metric label="Registros orçamentários" value={orcDados?.length} />
          <Metric label="Documentos normativos" value={normativos?.length} />
          <Metric label="Recomendações" value={recomendacoes?.length} />
        </div>

        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
          <li>Seções 1–4: objeto, taxonomia, fluxogramas de ingestão e inventário das fontes em uso.</li>
          <li>Seção 5: fórmulas dos motores de Status, Aderência ICERD, Evolução, Progresso global e IEAT.</li>
          <li>Seção 6: metodologia de vinculação entre recomendações da ONU e dados, com critérios de elegibilidade.</li>
          <li>Seções 7–9: escalas de classificação, governança da qualidade e anexos quantitativos.</li>
        </ul>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={handlePreview} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
            Visualizar / PDF
          </Button>
          <Button size="sm" variant="outline" onClick={handleDocx} disabled={loading || generating} className="gap-1.5">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Baixar DOCX
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3 text-center">
      <p className="text-lg font-bold text-foreground">{value != null ? value.toLocaleString('pt-BR') : '—'}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

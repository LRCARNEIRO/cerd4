import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Landmark, FileDown, Download, Loader2 } from 'lucide-react';
import { useOrcamentoCanonico } from '@/hooks/useLacunasData';
import { generateProtocoloOrcamentarioHTML } from './generateProtocoloOrcamentarioHTML';
import { downloadAsDocx } from '@/utils/reportExportToolbar';
import { openHtmlPreview } from '@/utils/reportPreview';

export function ProtocoloOrcamentarioReport() {
  const [generating, setGenerating] = useState(false);
  const { data: orcDados, isLoading } = useOrcamentoCanonico();

  const stats = useMemo(() => {
    const rows = orcDados || [];
    const pago = rows.reduce((s, r: any) => s + (Number(r.pago) || 0), 0);
    const extra = rows.filter((r: any) => r.tipo_dotacao === 'extraorcamentario').length;
    const anos = [...new Set(rows.map((r: any) => Number(r.ano)).filter(Boolean))].sort((a, b) => a - b);
    return {
      total: rows.length,
      orcament: rows.length - extra,
      extra,
      pago,
      periodo: anos.length ? `${anos[0]}–${anos[anos.length - 1]}` : '—',
    };
  }, [orcDados]);

  const buildHtml = () => generateProtocoloOrcamentarioHTML({ orcDados: orcDados || [] });

  const handlePreview = () => openHtmlPreview(buildHtml(), 'Guia Metodológico da Base Orçamentária');

  const handleDocx = async () => {
    setGenerating(true);
    try {
      await downloadAsDocx(buildHtml(), 'guia-metodologico-base-orcamentaria');
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
              <Landmark className="w-4 h-4 text-primary" />
              Guia Metodológico da Base Orçamentária
            </CardTitle>
            <CardDescription className="mt-1">
              Como a base foi levantada (4 camadas + 3 passos), palavras-chave de seleção, exclusões, deduplicação
              canônica, definição das métricas e os achados analíticos: efeito SESAI, financiamento extraorçamentário,
              comparação entre períodos e orçamento simbólico. Gerado a partir da base viva.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-[10px]">Produto 3</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Metric label="Registros canônicos" value={stats.total.toLocaleString('pt-BR')} />
          <Metric label="Orçamentários" value={stats.orcament.toLocaleString('pt-BR')} />
          <Metric label="Extraorçamentários" value={stats.extra.toLocaleString('pt-BR')} />
          <Metric label="Período" value={stats.periodo} />
        </div>

        <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-5">
          <li>Seções 2–4: estratégia de captura em camadas, vocabulário de palavras-chave e regra de deduplicação.</li>
          <li>Seção 5: o que significam dotação, empenhado, liquidado e pago — e por que o sistema usa "pago".</li>
          <li>Seções 7–10: achados sobre SESAI, extraorçamentário, P1 × P2 e orçamento simbólico.</li>
          <li>Seções 11–12: transições de códigos PPA, limitações declaradas e roteiro de atualização.</li>
        </ul>

        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={handlePreview} disabled={isLoading} className="gap-1.5">
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
            Visualizar / PDF
          </Button>
          <Button size="sm" variant="outline" onClick={handleDocx} disabled={isLoading || generating} className="gap-1.5">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
            Baixar DOCX
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value?: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/30 p-3 text-center">
      <p className="text-lg font-bold text-foreground">{value ?? '—'}</p>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}

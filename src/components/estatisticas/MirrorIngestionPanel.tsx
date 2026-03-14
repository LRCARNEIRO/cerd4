import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { buildMirrorIndicators, getMirrorCategories } from '@/utils/staticToDbTransformer';
import { buildStage4Indicators, getStage4Categories } from '@/utils/stage3Transformers';
import { buildAllStage3Indicators, getStage3Categories } from '@/utils/stage3Transformers';
import { toast } from 'sonner';

export function MirrorIngestionPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inserted: number; errors: number } | null>(null);
  const hasAutoRun = useRef(false);

  const runIngest = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Combine Stage 1+2, Stage 3, and Stage 4 (Complemento CERD 3) indicators
      const stage12 = buildMirrorIndicators();
      const stage3 = buildAllStage3Indicators();
      const stage4 = buildStage4Indicators();
      const indicators = [...stage12, ...stage3, ...stage4];

      const clearCategories = [...getMirrorCategories(), ...getStage3Categories(), ...getStage4Categories()];

      const { data, error } = await supabase.functions.invoke('ingest-static-mirror', {
        body: { indicators, clearCategories },
      });

      if (error) throw error;

      setResult({ inserted: data.inserted, errors: data.errors });
      if (data.inserted > 0) {
        toast.success(`${data.inserted} indicadores espelhados no banco de dados (Etapas 1-3)`);
      }
    } catch (err: any) {
      toast.error(`Erro na ingestão: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Auto-run on mount (once per session)
  useEffect(() => {
    if (!hasAutoRun.current) {
      hasAutoRun.current = true;
      runIngest();
    }
  }, []);

  const totalIndicators = buildMirrorIndicators().length + buildAllStage3Indicators().length + buildStage4Indicators().length;

  return (
    <Card className="border-l-4 border-l-primary/60">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">Espelho Seguro — Migração Estático → BD (Etapas 1-3)</p>
              <p className="text-xs text-muted-foreground">
                {totalIndicators} indicadores · StatisticsData + CommonCore + AdmPública + COVID + GruposFocais
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {loading && (
              <Badge variant="outline" className="gap-1 text-xs">
                <RefreshCw className="w-3 h-3 animate-spin" /> Espelhando...
              </Badge>
            )}
            {result && !loading && (
              <Badge variant={result.errors > 0 ? "destructive" : "default"} className="gap-1">
                {result.errors > 0 ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                {result.inserted} inseridos{result.errors > 0 ? ` · ${result.errors} erros` : ''}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

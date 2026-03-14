import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Database, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { buildMirrorIndicators, getMirrorCategories } from '@/utils/staticToDbTransformer';
import { toast } from 'sonner';

export function MirrorIngestionPanel() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ inserted: number; errors: number } | null>(null);

  const handleIngest = async () => {
    setLoading(true);
    setResult(null);

    try {
      const indicators = buildMirrorIndicators();
      const clearCategories = getMirrorCategories();

      const { data, error } = await supabase.functions.invoke('ingest-static-mirror', {
        body: { indicators, clearCategories },
      });

      if (error) throw error;

      setResult({ inserted: data.inserted, errors: data.errors });
      toast.success(`${data.inserted} indicadores espelhados no banco de dados`);
    } catch (err: any) {
      toast.error(`Erro na ingestão: ${err.message}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalIndicators = buildMirrorIndicators().length;

  return (
    <Card className="border-l-4 border-l-primary/60">
      <CardContent className="pt-4 pb-3">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-semibold">Espelho Seguro — Migração Estático → BD</p>
              <p className="text-xs text-muted-foreground">
                {totalIndicators} indicadores de StatisticsData.ts prontos para espelhar no banco com metadados CERD (§parágrafos, artigos ICERD).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result && (
              <Badge variant={result.errors > 0 ? "destructive" : "default"} className="gap-1">
                {result.errors > 0 ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                {result.inserted} inseridos{result.errors > 0 ? ` · ${result.errors} erros` : ''}
              </Badge>
            )}
            <Button
              size="sm"
              onClick={handleIngest}
              disabled={loading}
              className="gap-1"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              {loading ? 'Espelhando...' : 'Espelhar para BD'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

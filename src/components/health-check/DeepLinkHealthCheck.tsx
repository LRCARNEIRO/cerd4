import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle2, XCircle, Loader2, Activity, ExternalLink, Clock, AlertTriangle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { deepLinksRegistry, type DeepLinkEntry } from '@/data/deepLinksRegistry';
import { cn } from '@/lib/utils';

interface LinkResult {
  url: string;
  status: number | null;
  ok: boolean;
  latencyMs: number;
  error?: string;
}

interface CheckResults {
  summary: { total: number; ok: number; failed: number; checkedAt: string };
  results: LinkResult[];
}

export function DeepLinkHealthCheck() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CheckResults | null>(null);
  const [progress, setProgress] = useState(0);

  const uniqueUrls = [...new Set(deepLinksRegistry.map(d => d.url))];

  const runCheck = async () => {
    setLoading(true);
    setResults(null);
    setProgress(10);

    try {
      // batch in groups of 30
      const allResults: LinkResult[] = [];
      const batches = [];
      for (let i = 0; i < uniqueUrls.length; i += 30) {
        batches.push(uniqueUrls.slice(i, i + 30));
      }

      for (let b = 0; b < batches.length; b++) {
        setProgress(10 + ((b + 1) / batches.length) * 80);
        const { data, error } = await supabase.functions.invoke('check-deep-links', {
          body: { urls: batches[b] },
        });

        if (error) throw error;
        if (data?.results) {
          allResults.push(...data.results);
        }
      }

      const summary = {
        total: allResults.length,
        ok: allResults.filter(r => r.ok).length,
        failed: allResults.filter(r => !r.ok).length,
        checkedAt: new Date().toISOString(),
      };

      setResults({ summary, results: allResults });
      setProgress(100);
    } catch (err) {
      console.error('Health check failed:', err);
      setResults({
        summary: { total: 0, ok: 0, failed: 0, checkedAt: new Date().toISOString() },
        results: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const getResultForUrl = (url: string): LinkResult | undefined =>
    results?.results.find(r => r.url === url);

  // Group registry by secao
  const bySecao = deepLinksRegistry.reduce<Record<string, DeepLinkEntry[]>>((acc, entry) => {
    (acc[entry.secao] ||= []).push(entry);
    return acc;
  }, {});

  const healthPercent = results ? Math.round((results.summary.ok / results.summary.total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Health Check — Deep Links de Cruzamento Indireto
            </CardTitle>
            <CardDescription>
              {uniqueUrls.length} URLs únicas de {deepLinksRegistry.length} referências em {Object.keys(bySecao).length} seções
            </CardDescription>
          </div>
          <Button onClick={runCheck} disabled={loading} size="sm">
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            {loading ? 'Verificando...' : 'Executar Check'}
          </Button>
        </div>

        {loading && (
          <Progress value={progress} className="mt-3" />
        )}

        {results && (
          <div className="flex items-center gap-4 mt-3">
            <Badge variant={healthPercent === 100 ? 'default' : 'destructive'} className="text-sm px-3 py-1">
              {healthPercent}% saudável
            </Badge>
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-success" /> {results.summary.ok} OK
            </span>
            {results.summary.failed > 0 && (
              <span className="text-sm text-destructive flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> {results.summary.failed} falha{results.summary.failed > 1 ? 's' : ''}
              </span>
            )}
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" /> {new Date(results.summary.checkedAt).toLocaleString('pt-BR')}
            </span>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {!results && !loading && (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Clique em "Executar Check" para verificar todos os deep links</p>
            <p className="text-xs mt-1">Testa {uniqueUrls.length} URLs via HEAD/GET request</p>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            {Object.entries(bySecao).map(([secao, entries]) => {
              const secaoResults = entries.map(e => getResultForUrl(e.url)).filter(Boolean) as LinkResult[];
              const secaoOk = secaoResults.filter(r => r.ok).length;
              const secaoTotal = secaoResults.length;
              const allGood = secaoOk === secaoTotal;

              return (
                <div key={secao} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm flex items-center gap-2">
                      {allGood ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-destructive" />
                      )}
                      {secao}
                    </h4>
                    <Badge variant="outline" className={cn(
                      'text-xs',
                      allGood ? 'text-success border-success/30' : 'text-destructive border-destructive/30'
                    )}>
                      {secaoOk}/{secaoTotal}
                    </Badge>
                  </div>

                  <div className="space-y-1.5">
                    {entries.map((entry, idx) => {
                      const result = getResultForUrl(entry.url);
                      if (!result) return null;

                      return (
                        <div key={idx} className={cn(
                          'flex items-center justify-between text-xs rounded px-2 py-1.5',
                          result.ok ? 'bg-success/5' : 'bg-destructive/5'
                        )}>
                          <div className="flex-1 min-w-0">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <p className="font-medium truncate cursor-help">{entry.indicador}</p>
                                </TooltipTrigger>
                                <TooltipContent side="top" className="max-w-sm text-xs">
                                  {entry.descricao}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <p className="text-muted-foreground truncate">{entry.fonte}</p>
                          </div>

                          <div className="flex items-center gap-2 ml-2 shrink-0">
                            <span className="text-muted-foreground">{result.latencyMs}ms</span>
                            {result.ok ? (
                              <Badge variant="outline" className="text-success border-success/30 text-[10px] px-1.5">
                                {result.status}
                              </Badge>
                            ) : (
                              <Badge variant="destructive" className="text-[10px] px-1.5">
                                {result.status || result.error?.slice(0, 20) || 'Erro'}
                              </Badge>
                            )}
                            <a
                              href={entry.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { CheckCircle2, XCircle, Loader2, Activity, ExternalLink, Clock, AlertTriangle, RefreshCw, Search, ArrowRight } from 'lucide-react';
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

interface Suggestion {
  title: string;
  url: string;
  description: string;
}

export function DeepLinkHealthCheck() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CheckResults | null>(null);
  const [progress, setProgress] = useState(0);
  const [suggestionDialog, setSuggestionDialog] = useState<{
    open: boolean;
    entry: DeepLinkEntry | null;
    loading: boolean;
    suggestions: Suggestion[];
    searchQuery: string;
  }>({ open: false, entry: null, loading: false, suggestions: [], searchQuery: '' });

  const uniqueUrls = [...new Set(deepLinksRegistry.map(d => d.url))];

  const runCheck = async () => {
    setLoading(true);
    setResults(null);
    setProgress(10);

    try {
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

  const searchReplacement = async (entry: DeepLinkEntry) => {
    setSuggestionDialog({ open: true, entry, loading: true, suggestions: [], searchQuery: '' });

    try {
      const { data, error } = await supabase.functions.invoke('suggest-link-replacement', {
        body: {
          brokenUrl: entry.url,
          indicador: entry.indicador,
          fonte: entry.fonte,
          descricao: entry.descricao,
        },
      });

      if (error) throw error;

      setSuggestionDialog(prev => ({
        ...prev,
        loading: false,
        suggestions: data?.suggestions || [],
        searchQuery: data?.searchQuery || '',
      }));
    } catch (err) {
      console.error('Suggestion search failed:', err);
      setSuggestionDialog(prev => ({
        ...prev,
        loading: false,
        suggestions: [],
      }));
    }
  };

  const getResultForUrl = (url: string): LinkResult | undefined =>
    results?.results.find(r => r.url === url);

  const bySecao = deepLinksRegistry.reduce<Record<string, DeepLinkEntry[]>>((acc, entry) => {
    (acc[entry.secao] ||= []).push(entry);
    return acc;
  }, {});

  const healthPercent = results ? Math.round((results.summary.ok / results.summary.total) * 100) : 0;

  return (
    <>
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
                                <>
                                  <Badge variant="destructive" className="text-[10px] px-1.5">
                                    {result.status || result.error?.slice(0, 20) || 'Erro'}
                                  </Badge>
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-5 w-5 text-amber-500 hover:text-amber-400"
                                          onClick={() => searchReplacement(entry)}
                                        >
                                          <Search className="w-3.5 h-3.5" />
                                        </Button>
                                      </TooltipTrigger>
                                      <TooltipContent side="top" className="text-xs">
                                        Buscar URL substituta
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                </>
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

      {/* Suggestion Dialog */}
      <Dialog open={suggestionDialog.open} onOpenChange={(open) => setSuggestionDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Search className="w-4 h-4 text-amber-500" />
              Sugestões de URL substituta
            </DialogTitle>
            {suggestionDialog.entry && (
              <DialogDescription className="text-xs space-y-1">
                <span className="block font-medium text-foreground">{suggestionDialog.entry.indicador}</span>
                <span className="block text-destructive">URL quebrada: {suggestionDialog.entry.url}</span>
              </DialogDescription>
            )}
          </DialogHeader>

          {suggestionDialog.loading ? (
            <div className="flex flex-col items-center py-8 gap-3 text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin" />
              <p className="text-sm">Buscando URLs alternativas via Firecrawl...</p>
            </div>
          ) : suggestionDialog.suggestions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">Nenhuma sugestão encontrada.</p>
              <p className="text-xs mt-1">Verifique manualmente se a fonte mudou de domínio.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {suggestionDialog.searchQuery && (
                <p className="text-[10px] text-muted-foreground mb-2">
                  Busca: <code className="bg-muted px-1 rounded">{suggestionDialog.searchQuery}</code>
                </p>
              )}
              {suggestionDialog.suggestions.map((sug, i) => (
                <div key={i} className="border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-tight">{sug.title}</p>
                      {sug.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{sug.description}</p>
                      )}
                      <p className="text-[10px] text-primary mt-1 truncate">{sug.url}</p>
                    </div>
                    <a
                      href={sug.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 mt-1"
                    >
                      <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                        Abrir <ArrowRight className="w-3 h-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              ))}

              <div className="border-t pt-3 mt-3">
                <p className="text-[10px] text-muted-foreground">
                  ⚠️ Valide manualmente cada sugestão antes de atualizar o registro.
                  A substituição deve apontar para o <strong>dado bruto</strong> (tabela, PDF, painel), não para landing pages genéricas.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

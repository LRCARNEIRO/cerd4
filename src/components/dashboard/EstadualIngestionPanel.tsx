import { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle, XCircle, Building2, RefreshCw, Eye, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';

const ESTADOS = [
  { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' }, { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' }, { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' }, { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' }, { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' }, { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' },
];

interface UFResult {
  uf: string;
  success: boolean;
  total: number;
  erros: string[];
  porGrupo: Record<string, number>;
  logConsultas: string[];
  amostra: { programa: string; codigo?: string; grupo: string; criterio: string; ppa?: string; url?: string }[];
}

export function EstadualIngestionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUFs, setSelectedUFs] = useState<string[]>(['BA', 'SP', 'RJ']);
  const [isRunning, setIsRunning] = useState(false);
  const [currentUF, setCurrentUF] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<UFResult[]>([]);
  const [mode, setMode] = useState<'idle' | 'preview' | 'insert' | 'done'>('idle');
  const queryClient = useQueryClient();
  const cancelRef = useRef(false);

  const toggleUF = (uf: string) => setSelectedUFs(prev => prev.includes(uf) ? prev.filter(u => u !== uf) : [...prev, uf]);

  const run = useCallback(async (runMode: 'preview' | 'insert') => {
    if (selectedUFs.length === 0) {
      toast.warning('Selecione pelo menos um estado.');
      return;
    }
    setIsRunning(true);
    setResults([]);
    setProgress(0);
    setMode(runMode);
    cancelRef.current = false;

    const allResults: UFResult[] = [];

    for (let i = 0; i < selectedUFs.length; i++) {
      if (cancelRef.current) {
        toast.info(`Cancelado após ${allResults.length} estados.`);
        break;
      }
      const uf = selectedUFs[i];
      setCurrentUF(uf);
      setProgress(Math.round((i / selectedUFs.length) * 100));

      try {
        const { data, error } = await supabase.functions.invoke('ingest-estadual-siconfi', {
          body: { uf, mode: runMode },
        });

        if (error) {
          allResults.push({ uf, success: false, total: 0, erros: [error.message], porGrupo: {}, logConsultas: [], amostra: [] });
        } else {
          allResults.push({
            uf,
            success: data.success,
            total: runMode === 'preview' ? (data.total_registros ?? 0) : (data.total_inseridos ?? 0),
            erros: data.erros ?? [],
            porGrupo: data.por_grupo_etnico ?? {},
            logConsultas: data.log_consultas ?? [],
            amostra: data.amostra ?? [],
          });
        }
      } catch (err) {
        allResults.push({ uf, success: false, total: 0, erros: [err instanceof Error ? err.message : 'Erro'], porGrupo: {}, logConsultas: [], amostra: [] });
      }

      setResults([...allResults]);
      if (i < selectedUFs.length - 1) await new Promise(r => setTimeout(r, 500));
    }

    setProgress(100);
    setCurrentUF(null);
    setIsRunning(false);
    setMode('done');

    const totalRegs = allResults.reduce((s, r) => s + r.total, 0);
    if (runMode === 'insert') {
      queryClient.invalidateQueries();
      toast.success(`Ingestão: ${totalRegs} ações de ${allResults.filter(r => r.success).length} estados`);
    } else {
      toast.success(`Preview: ${totalRegs} ações encontradas`);
    }
  }, [selectedUFs, queryClient]);

  const reset = useCallback(() => {
    cancelRef.current = true;
    setResults([]);
    setMode('idle');
    setProgress(0);
    setIsRunning(false);
    setCurrentUF(null);
  }, []);

  const totalRegs = results.reduce((s, r) => s + r.total, 0);
  const allGrupos: Record<string, number> = {};
  const allAmostra: UFResult['amostra'] = [];
  const allLogs: string[] = [];
  const allErros: string[] = [];
  for (const r of results) {
    for (const [g, c] of Object.entries(r.porGrupo)) allGrupos[g] = (allGrupos[g] ?? 0) + c;
    allAmostra.push(...r.amostra);
    allLogs.push(...r.logConsultas);
    allErros.push(...r.erros);
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2">
        <Building2 className="w-4 h-4" />
        Ingestão Estadual
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (open && mode === 'done') reset();
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Ingestão Estadual — Scraping de Ações por Palavras-chave
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                Busca nos PPAs estaduais (via Firecrawl) por <strong>nomes de ações e programas</strong> que contenham palavras-chave raciais/étnicas.
                <strong className="ml-1">Sem dados de dotação ou execução</strong> — apenas identificação das ações.
              </p>

              {/* Estados */}
              <div>
                <p className="text-sm font-medium mb-2">Estados ({selectedUFs.length}/27)</p>
                <div className="flex flex-wrap gap-1.5">
                  {ESTADOS.map(e => (
                    <Button key={e.uf} variant={selectedUFs.includes(e.uf) ? 'default' : 'outline'}
                      size="sm" className="h-7 text-xs px-2"
                      onClick={() => toggleUF(e.uf)} disabled={isRunning}>
                      {e.uf}
                    </Button>
                  ))}
                </div>
                <div className="flex gap-1 mt-1">
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedUFs(ESTADOS.map(e => e.uf))} disabled={isRunning}>Todos</Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedUFs([])} disabled={isRunning}>Limpar</Button>
                </div>
              </div>

              {/* Info */}
              {mode === 'idle' && selectedUFs.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  <strong>{selectedUFs.length}</strong> estado(s). Processamento sequencial via Firecrawl.
                </div>
              )}

              {/* Progress */}
              {isRunning && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Processando <strong>{currentUF}</strong>... ({results.length}/{selectedUFs.length})</span>
                    </div>
                    <Button variant="destructive" size="sm" className="h-6 text-xs px-2"
                      onClick={() => { cancelRef.current = true; toast.info('Cancelando...'); }}>
                      <XCircle className="w-3 h-3 mr-1" /> Cancelar
                    </Button>
                  </div>
                  <Progress value={progress} className="h-2" />
                  {results.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {results.map(r => (
                        <Badge key={r.uf} variant={r.success && r.total > 0 ? 'default' : r.success ? 'secondary' : 'destructive'} className="text-[10px]">
                          {r.uf}: {r.total}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Buttons */}
              {mode === 'idle' && (
                <div className="flex gap-2">
                  <Button onClick={() => run('preview')} disabled={isRunning || selectedUFs.length === 0}
                    variant="outline" className="flex-1 gap-2">
                    <Eye className="w-4 h-4" /> Preview
                  </Button>
                  <Button onClick={() => run('insert')} disabled={isRunning || selectedUFs.length === 0}
                    className="flex-1 gap-2">
                    <Upload className="w-4 h-4" /> Inserir no Banco
                  </Button>
                </div>
              )}

              {/* RESULTS */}
              {mode === 'done' && results.length > 0 && (
                <div className="space-y-3">
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">{totalRegs} ações — {results.filter(r => r.success).length}/{results.length} estados</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {results.map(r => (
                      <Badge key={r.uf} variant={r.success && r.total > 0 ? 'default' : r.success ? 'secondary' : 'destructive'} className="text-[10px]">
                        {r.uf}: {r.total}
                      </Badge>
                    ))}
                  </div>

                  {Object.keys(allGrupos).length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Por Grupo Étnico</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(allGrupos).sort((a, b) => b[1] - a[1]).map(([g, c]) => (
                          <Badge key={g} variant="outline" className="text-[10px]">{g}: {c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amostra — sem colunas financeiras */}
                  {allAmostra.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Ações encontradas ({Math.min(allAmostra.length, 30)})</p>
                      <div className="border rounded-lg overflow-auto max-h-60">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-[10px] p-1">Ação/Programa</TableHead>
                              <TableHead className="text-[10px] p-1">Código</TableHead>
                              <TableHead className="text-[10px] p-1">Grupo</TableHead>
                              <TableHead className="text-[10px] p-1">Critério</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allAmostra.slice(0, 30).map((r, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-[10px] p-1 max-w-[200px] truncate" title={r.programa}>{r.programa}</TableCell>
                                <TableCell className="text-[10px] p-1 font-mono">{r.codigo ?? '—'}</TableCell>
                                <TableCell className="text-[10px] p-1">{r.grupo}</TableCell>
                                <TableCell className="text-[10px] p-1 max-w-[150px] truncate" title={r.criterio}>{r.criterio}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {allLogs.length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground">Log ({allLogs.length})</summary>
                      <div className="mt-1 p-2 bg-muted/30 rounded text-[10px] space-y-0.5 max-h-40 overflow-auto">
                        {allLogs.map((l, i) => <p key={i}>{l}</p>)}
                      </div>
                    </details>
                  )}

                  {allErros.length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-destructive">Erros ({allErros.length})</summary>
                      <div className="mt-1 p-2 bg-destructive/5 rounded text-[10px] space-y-0.5 max-h-32 overflow-auto text-destructive">
                        {allErros.map((e, i) => <p key={i}>{e}</p>)}
                      </div>
                    </details>
                  )}

                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={reset}>
                    <RefreshCw className="w-3 h-3" /> Nova Consulta
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

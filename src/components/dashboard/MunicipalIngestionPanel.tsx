import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Play, CheckCircle, XCircle, Home, RefreshCw, AlertTriangle, Eye, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const UFS = [
  { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' }, { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' }, { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' }, { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' }, { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' }, { uf: 'RO', nome: 'Rondônia' }, { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' }, { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' },
];

const ANOS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

interface UFResult {
  uf: string;
  status: 'pending' | 'running' | 'done' | 'error';
  total?: number;
  error?: string;
  porGrupo?: Record<string, number>;
  amostra?: { programa: string; ano: number; grupo: string; criterio: string }[];
}

export function MunicipalIngestionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUFs, setSelectedUFs] = useState<string[]>(['BA', 'SP', 'RJ']);
  const [selectedAnos, setSelectedAnos] = useState<number[]>([2022, 2023, 2024]);
  const [isRunning, setIsRunning] = useState(false);
  const [ufResults, setUfResults] = useState<UFResult[]>([]);
  const [mode, setMode] = useState<'preview' | 'insert'>('preview');
  const queryClient = useQueryClient();

  const toggleUF = (uf: string) => {
    setSelectedUFs(prev => prev.includes(uf) ? prev.filter(u => u !== uf) : [...prev, uf]);
  };
  const toggleAno = (ano: number) => {
    setSelectedAnos(prev => prev.includes(ano) ? prev.filter(a => a !== ano) : [...prev, ano]);
  };

  const run = async (runMode: 'preview' | 'insert') => {
    if (selectedUFs.length === 0 || selectedAnos.length === 0) {
      toast.warning('Selecione pelo menos uma UF e um ano.');
      return;
    }

    setIsRunning(true);
    setMode(runMode);
    const results: UFResult[] = selectedUFs.map(uf => ({ uf, status: 'pending' as const }));
    setUfResults(results);

    let totalFound = 0;
    let totalErrors = 0;

    for (let i = 0; i < selectedUFs.length; i++) {
      const uf = selectedUFs[i];
      setUfResults(prev => prev.map(r => r.uf === uf ? { ...r, status: 'running' } : r));

      try {
        const { data, error } = await supabase.functions.invoke('ingest-municipal-siconfi', {
          body: { ufs: [uf], anos: selectedAnos, mode: runMode },
        });

        if (error) throw error;

        const total = runMode === 'preview' ? (data?.total_registros ?? 0) : (data?.total_inseridos ?? 0);
        totalFound += total;

        setUfResults(prev => prev.map(r =>
          r.uf === uf ? {
            ...r, status: 'done', total,
            porGrupo: data?.por_grupo_etnico,
            amostra: data?.amostra,
          } : r
        ));
      } catch (err) {
        totalErrors++;
        setUfResults(prev => prev.map(r =>
          r.uf === uf ? { ...r, status: 'error', error: err instanceof Error ? err.message : 'Erro' } : r
        ));
      }

      if (i < selectedUFs.length - 1) await new Promise(r => setTimeout(r, 2000));
    }

    setIsRunning(false);
    if (runMode === 'insert') queryClient.invalidateQueries();

    if (totalErrors === 0) {
      toast.success(`${runMode === 'preview' ? 'Preview' : 'Ingestão'}: ${totalFound} ações de ${selectedUFs.length} UFs`);
    } else {
      toast.warning(`${totalFound} ações, ${totalErrors} UFs com erro`);
    }
  };

  const completedUFs = ufResults.filter(r => r.status === 'done' || r.status === 'error').length;
  const progress = ufResults.length > 0 ? (completedUFs / ufResults.length) * 100 : 0;
  const allDone = ufResults.length > 0 && ufResults.every(r => r.status !== 'pending' && r.status !== 'running');

  // Aggregate amostra
  const allAmostra = ufResults.flatMap(r => r.amostra ?? []);
  const allGrupos: Record<string, number> = {};
  for (const r of ufResults) {
    for (const [g, c] of Object.entries(r.porGrupo ?? {})) allGrupos[g] = (allGrupos[g] ?? 0) + c;
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2">
        <Home className="w-4 h-4" />
        Ingestão Municipal
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Ingestão Municipal — Scraping de Ações por Palavras-chave
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Busca nomes de ações orçamentárias no SICONFI (RREO/DCA) cujo título contenha palavras-chave raciais/étnicas.
              <strong className="ml-1">Sem dados de dotação ou execução</strong> — apenas identificação das ações.
            </p>

            <div className="p-2 bg-muted/50 rounded-lg flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <span>Cada UF consulta todos os seus municípios via SICONFI. Pode levar vários minutos.</span>
            </div>

            {/* UFs */}
            <div>
              <p className="text-sm font-medium mb-2">UFs ({selectedUFs.length}/27)</p>
              <div className="flex flex-wrap gap-1.5">
                {UFS.map(e => (
                  <Button key={e.uf} variant={selectedUFs.includes(e.uf) ? 'default' : 'outline'}
                    size="sm" className="h-7 text-xs px-2"
                    onClick={() => toggleUF(e.uf)} disabled={isRunning} title={e.nome}>
                    {e.uf}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1 mt-1">
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedUFs(UFS.map(e => e.uf))} disabled={isRunning}>Todas</Button>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedUFs([])} disabled={isRunning}>Limpar</Button>
              </div>
            </div>

            {/* Anos */}
            <div>
              <p className="text-sm font-medium mb-2">Anos</p>
              <div className="flex flex-wrap gap-2">
                {ANOS.map(ano => (
                  <Button key={ano} variant={selectedAnos.includes(ano) ? 'default' : 'outline'}
                    size="sm" className="h-8 w-16"
                    onClick={() => toggleAno(ano)} disabled={isRunning}>
                    {ano}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1 mt-1">
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedAnos([...ANOS])} disabled={isRunning}>Todos</Button>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedAnos([])} disabled={isRunning}>Limpar</Button>
              </div>
            </div>

            {/* Buttons */}
            {!isRunning && ufResults.length === 0 && (
              <div className="flex gap-2">
                <Button onClick={() => run('preview')} disabled={selectedUFs.length === 0 || selectedAnos.length === 0}
                  variant="outline" className="flex-1 gap-2">
                  <Eye className="w-4 h-4" /> Preview
                </Button>
                <Button onClick={() => run('insert')} disabled={selectedUFs.length === 0 || selectedAnos.length === 0}
                  className="flex-1 gap-2">
                  <Upload className="w-4 h-4" /> Inserir no Banco
                </Button>
              </div>
            )}

            {/* Progress */}
            {ufResults.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{completedUFs}/{ufResults.length} UFs</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* UF results */}
            {ufResults.length > 0 && (
              <ScrollArea className="max-h-32">
                <div className="space-y-1">
                  {ufResults.map(r => (
                    <div key={r.uf} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/30">
                      {r.status === 'pending' && <span className="w-3 h-3 rounded-full bg-muted-foreground/30" />}
                      {r.status === 'running' && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
                      {r.status === 'done' && <CheckCircle className="w-3 h-3 text-green-600" />}
                      {r.status === 'error' && <XCircle className="w-3 h-3 text-destructive" />}
                      <span className="font-medium w-6">{r.uf}</span>
                      {r.status === 'done' && <span className="text-muted-foreground ml-auto">{r.total} ações</span>}
                      {r.status === 'error' && <span className="text-destructive ml-auto truncate max-w-[200px]">{r.error}</span>}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Aggregated results */}
            {allDone && Object.keys(allGrupos).length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Por Grupo Étnico</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(allGrupos).sort((a, b) => b[1] - a[1]).map(([g, c]) => (
                    <Badge key={g} variant="outline" className="text-[10px]">{g}: {c}</Badge>
                  ))}
                </div>
              </div>
            )}

            {allDone && allAmostra.length > 0 && (
              <div>
                <p className="text-xs font-medium mb-1">Ações encontradas ({Math.min(allAmostra.length, 20)})</p>
                <div className="border rounded-lg overflow-auto max-h-48">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px] p-1">Ação</TableHead>
                        <TableHead className="text-[10px] p-1">Ano</TableHead>
                        <TableHead className="text-[10px] p-1">Grupo</TableHead>
                        <TableHead className="text-[10px] p-1">Critério</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allAmostra.slice(0, 20).map((r, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-[10px] p-1 max-w-[180px] truncate" title={r.programa}>{r.programa}</TableCell>
                          <TableCell className="text-[10px] p-1">{r.ano}</TableCell>
                          <TableCell className="text-[10px] p-1">{r.grupo}</TableCell>
                          <TableCell className="text-[10px] p-1 max-w-[120px] truncate" title={r.criterio}>{r.criterio}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {/* Reset */}
            {!isRunning && allDone && (
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setUfResults([])}>
                <RefreshCw className="w-3 h-3" /> Nova Consulta
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

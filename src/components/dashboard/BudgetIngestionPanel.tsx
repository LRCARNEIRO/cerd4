import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Play, CheckCircle, XCircle, Clock, RefreshCw, Trash2, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface BatchJob {
  id: string;
  esfera: string;
  anos: number[];
  status: 'pending' | 'running' | 'done' | 'error';
  result?: string;
  inserted?: number;
}

const ESFERAS = [
  { value: 'federal', label: 'Federal', icon: '🏛️' },
  { value: 'estadual', label: 'Estadual', icon: '🏢' },
  { value: 'municipal', label: 'Municipal', icon: '🏘️' },
];

const ANOS_DISPONIVEIS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

export function BudgetIngestionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedEsferas, setSelectedEsferas] = useState<string[]>(['federal']);
  const [selectedAnos, setSelectedAnos] = useState<number[]>([2024]);
  const [jobs, setJobs] = useState<BatchJob[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const queryClient = useQueryClient();

  const toggleEsfera = (esfera: string) => {
    setSelectedEsferas(prev =>
      prev.includes(esfera) ? prev.filter(e => e !== esfera) : [...prev, esfera]
    );
  };

  const toggleAno = (ano: number) => {
    setSelectedAnos(prev =>
      prev.includes(ano) ? prev.filter(a => a !== ano) : [...prev, ano]
    );
  };

  const selectAllAnos = () => setSelectedAnos([...ANOS_DISPONIVEIS]);
  const clearAnos = () => setSelectedAnos([]);

  const createBatches = useCallback((): BatchJob[] => {
    const batches: BatchJob[] = [];
    for (const esfera of selectedEsferas) {
      // For federal, split into batches of 2 years to avoid timeout
      if (esfera === 'federal') {
        for (let i = 0; i < selectedAnos.length; i += 2) {
          const chunk = selectedAnos.slice(i, i + 2);
          batches.push({
            id: `${esfera}-${chunk.join('-')}`,
            esfera,
            anos: chunk,
            status: 'pending',
          });
        }
      } else {
        // SICONFI is faster, can handle more years
        for (let i = 0; i < selectedAnos.length; i += 4) {
          const chunk = selectedAnos.slice(i, i + 4);
          batches.push({
            id: `${esfera}-${chunk.join('-')}`,
            esfera,
            anos: chunk,
            status: 'pending',
          });
        }
      }
    }
    return batches;
  }, [selectedEsferas, selectedAnos]);

  const runBatches = async () => {
    const batches = createBatches();
    if (batches.length === 0) {
      toast.warning('Selecione pelo menos uma esfera e um ano.');
      return;
    }

    setJobs(batches);
    setIsRunning(true);

    let totalInserted = 0;
    let errors = 0;

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];

      setJobs(prev => prev.map(j =>
        j.id === batch.id ? { ...j, status: 'running' } : j
      ));

      try {
        // Route to the correct edge function per esfera
        const fnName = batch.esfera === 'federal'
          ? 'ingest-federal-orcamento'
          : batch.esfera === 'estadual'
            ? 'ingest-estadual-siconfi'
            : 'ingest-municipal-siconfi';

        const { data, error } = await supabase.functions.invoke(fnName, {
          body: { anos: batch.anos },
        });

        if (error) throw error;

        const inserted = data?.total_inseridos || 0;
        totalInserted += inserted;

        // Para federal, complementar com dotação LOA — chamadas paralelas por ano
        if (batch.esfera === 'federal') {
          console.log(`Iniciando complementação de dotação LOA para ${batch.anos.length} anos...`);
          const dotPromises = batch.anos.map(async (ano) => {
            const invoke = async (attempt: number): Promise<void> => {
              try {
                const { data: dotData, error: dotErr } = await supabase.functions.invoke('ingest-dotacao-loa', {
                  body: { ano },
                });
                if (dotErr) throw dotErr;
                console.log(`Dotação LOA ${ano}: ${dotData?.total_atualizados || 0} atualizados`);
              } catch (err) {
                if (attempt < 2) {
                  console.warn(`Dotação LOA ${ano} tentativa ${attempt + 1} falhou, retentando em 5s...`);
                  await new Promise(r => setTimeout(r, 5000));
                  return invoke(attempt + 1);
                }
                console.warn(`Dotação LOA ${ano} falhou após ${attempt + 1} tentativas:`, err);
              }
            };
            return invoke(0);
          });
          await Promise.all(dotPromises);
        }

        setJobs(prev => prev.map(j =>
          j.id === batch.id
            ? { ...j, status: 'done', inserted, result: `${inserted} registros inseridos` }
            : j
        ));
      } catch (err) {
        errors++;
        const msg = err instanceof Error ? err.message : 'Erro desconhecido';
        setJobs(prev => prev.map(j =>
          j.id === batch.id
            ? { ...j, status: 'error', result: msg }
            : j
        ));
      }

      // Small delay between batches
      if (i < batches.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    setIsRunning(false);
    queryClient.invalidateQueries();

    if (errors === 0) {
      toast.success(`Ingestão completa: ${totalInserted} registros inseridos`);
    } else {
      toast.warning(`Ingestão finalizada: ${totalInserted} registros, ${errors} erros`);
    }
  };

  const handleClearData = async (esfera?: string) => {
    const confirmMsg = esfera
      ? `Apagar todos os dados ${esfera}s?`
      : 'Apagar TODOS os dados orçamentários?';

    if (!confirm(confirmMsg)) return;

    try {
      let query = supabase.from('dados_orcamentarios').delete();
      if (esfera) {
        query = query.eq('esfera', esfera);
      } else {
        query = query.neq('id', '00000000-0000-0000-0000-000000000000'); // delete all
      }
      const { error } = await query;
      if (error) throw error;
      toast.success(`Dados ${esfera || 'todos'} apagados.`);
      queryClient.invalidateQueries();
    } catch (err) {
      toast.error('Erro ao apagar dados');
    }
  };

  const completedJobs = jobs.filter(j => j.status === 'done').length;
  const progress = jobs.length > 0 ? (completedJobs / jobs.length) * 100 : 0;

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="gap-2"
        size="sm"
      >
        <Database className="w-4 h-4" />
        Ingestão por Lotes
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Ingestão Orçamentária por Lotes
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Esfera selection */}
            <div>
              <p className="text-sm font-medium mb-2">Esferas</p>
              <div className="flex gap-2">
                {ESFERAS.map(e => (
                  <Button
                    key={e.value}
                    variant={selectedEsferas.includes(e.value) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleEsfera(e.value)}
                    disabled={isRunning}
                  >
                    {e.icon} {e.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Anos selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">Anos</p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={selectAllAnos} disabled={isRunning}>
                    Todos
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={clearAnos} disabled={isRunning}>
                    Limpar
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {ANOS_DISPONIVEIS.map(ano => (
                  <Button
                    key={ano}
                    variant={selectedAnos.includes(ano) ? 'default' : 'outline'}
                    size="sm"
                    className="h-8 w-16"
                    onClick={() => toggleAno(ano)}
                    disabled={isRunning}
                  >
                    {ano}
                  </Button>
                ))}
              </div>
            </div>

            {/* Batch preview */}
            {selectedEsferas.length > 0 && selectedAnos.length > 0 && !isRunning && jobs.length === 0 && (
              <Card className="bg-muted/50">
                <CardContent className="pt-4 pb-3">
                  <p className="text-xs text-muted-foreground mb-1">
                    Serão criados <strong>{createBatches().length} lote(s)</strong> para evitar timeout:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {createBatches().map(b => (
                      <Badge key={b.id} variant="outline" className="text-xs">
                        {b.esfera} {b.anos.join(', ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action buttons */}
            <div className="flex gap-2">
              <Button
                onClick={runBatches}
                disabled={isRunning || selectedEsferas.length === 0 || selectedAnos.length === 0}
                className="flex-1 gap-2"
              >
                {isRunning ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isRunning ? 'Processando...' : 'Iniciar Ingestão'}
              </Button>
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleClearData()}
                disabled={isRunning}
                title="Apagar todos os dados orçamentários"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Progress */}
            {jobs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{completedJobs}/{jobs.length} lotes</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Job list */}
            {jobs.length > 0 && (
              <ScrollArea className="max-h-48">
                <div className="space-y-1">
                  {jobs.map(job => (
                    <div
                      key={job.id}
                      className="flex items-center gap-2 text-xs p-2 rounded bg-muted/30"
                    >
                      {job.status === 'pending' && <Clock className="w-3 h-3 text-muted-foreground" />}
                      {job.status === 'running' && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
                      {job.status === 'done' && <CheckCircle className="w-3 h-3 text-green-600" />}
                      {job.status === 'error' && <XCircle className="w-3 h-3 text-destructive" />}
                      <span className="font-medium">
                        {job.esfera} {job.anos.join(', ')}
                      </span>
                      {job.result && (
                        <span className="text-muted-foreground ml-auto truncate max-w-[180px]">
                          {job.result}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Reset button after completion */}
            {!isRunning && jobs.length > 0 && jobs.every(j => j.status !== 'pending') && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                onClick={() => setJobs([])}
              >
                <RefreshCw className="w-3 h-3" />
                Nova Ingestão
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

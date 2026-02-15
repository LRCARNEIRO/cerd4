import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Play, CheckCircle, XCircle, Home, RefreshCw, AlertTriangle } from 'lucide-react';
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
  inserted?: number;
  processados?: number;
  total?: number;
  restantes?: number;
  error?: string;
}

export function MunicipalIngestionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUFs, setSelectedUFs] = useState<string[]>(['BA', 'SP', 'RJ']);
  const [selectedAnos, setSelectedAnos] = useState<number[]>([2022, 2023, 2024]);
  const [isRunning, setIsRunning] = useState(false);
  const [ufResults, setUfResults] = useState<UFResult[]>([]);
  const queryClient = useQueryClient();

  const toggleUF = (uf: string) => {
    setSelectedUFs(prev => prev.includes(uf) ? prev.filter(u => u !== uf) : [...prev, uf]);
  };
  const toggleAno = (ano: number) => {
    setSelectedAnos(prev => prev.includes(ano) ? prev.filter(a => a !== ano) : [...prev, ano]);
  };

  const run = async () => {
    if (selectedUFs.length === 0 || selectedAnos.length === 0) {
      toast.warning('Selecione pelo menos uma UF e um ano.');
      return;
    }

    setIsRunning(true);
    const results: UFResult[] = selectedUFs.map(uf => ({ uf, status: 'pending' as const }));
    setUfResults(results);

    let totalInserted = 0;
    let totalErrors = 0;

    // Process one UF at a time to stay within edge function timeout
    for (let i = 0; i < selectedUFs.length; i++) {
      const uf = selectedUFs[i];

      setUfResults(prev => prev.map(r =>
        r.uf === uf ? { ...r, status: 'running' } : r
      ));

      try {
        const { data, error } = await supabase.functions.invoke('ingest-municipal-siconfi', {
          body: { ufs: [uf], anos: selectedAnos },
        });

        if (error) throw error;

        const inserted = data?.total_inseridos || 0;
        totalInserted += inserted;

        setUfResults(prev => prev.map(r =>
          r.uf === uf ? {
            ...r,
            status: 'done',
            inserted,
            processados: data?.municipios_processados,
            total: data?.municipios_total,
            restantes: data?.municipios_restantes,
          } : r
        ));
      } catch (err) {
        totalErrors++;
        const msg = err instanceof Error ? err.message : 'Erro desconhecido';
        setUfResults(prev => prev.map(r =>
          r.uf === uf ? { ...r, status: 'error', error: msg } : r
        ));
      }

      // Delay between UFs
      if (i < selectedUFs.length - 1) {
        await new Promise(r => setTimeout(r, 2000));
      }
    }

    setIsRunning(false);
    queryClient.invalidateQueries();

    if (totalErrors === 0) {
      toast.success(`Ingestão municipal completa: ${totalInserted} registros de ${selectedUFs.length} UFs`);
    } else {
      toast.warning(`Ingestão: ${totalInserted} registros, ${totalErrors} UFs com erro`);
    }
  };

  const completedUFs = ufResults.filter(r => r.status === 'done' || r.status === 'error').length;
  const progress = ufResults.length > 0 ? (completedUFs / ufResults.length) * 100 : 0;

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
              Ingestão Municipal (SICONFI) — 5.570 Municípios
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Busca dados RREO/DCA via API SICONFI do Tesouro Nacional para <strong>todos os municípios</strong> das UFs selecionadas.
              Filtra por Função 14, Subfunções 422/423 e palavras-chave raciais/étnicas. Cada UF é processada em uma chamada separada.
            </p>

            <div className="p-2 bg-muted/50 rounded-lg flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              <span>Cada UF busca <strong>todos</strong> os seus municípios automaticamente via SICONFI. Para 27 UFs, o processo pode levar vários minutos.</span>
            </div>

            {/* UFs */}
            <div>
              <p className="text-sm font-medium mb-2">UFs ({selectedUFs.length}/27)</p>
              <div className="flex flex-wrap gap-1.5">
                {UFS.map(e => (
                  <Button
                    key={e.uf}
                    variant={selectedUFs.includes(e.uf) ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => toggleUF(e.uf)}
                    disabled={isRunning}
                    title={e.nome}
                  >
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
              <div className="flex gap-1 mt-1">
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedAnos([...ANOS])} disabled={isRunning}>Todos</Button>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedAnos([])} disabled={isRunning}>Limpar</Button>
              </div>
            </div>

            {/* Preview */}
            {!isRunning && ufResults.length === 0 && selectedUFs.length > 0 && selectedAnos.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                Serão processadas <strong>{selectedUFs.length} UF(s)</strong> × <strong>{selectedAnos.length} ano(s)</strong>.
                Todos os municípios de cada UF serão consultados automaticamente via SICONFI.
              </div>
            )}

            {/* Run button */}
            <Button onClick={run} disabled={isRunning || selectedUFs.length === 0 || selectedAnos.length === 0} className="w-full gap-2">
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isRunning ? `Processando ${selectedUFs.length} UFs...` : 'Iniciar Ingestão Municipal'}
            </Button>

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
              <ScrollArea className="max-h-52">
                <div className="space-y-1">
                  {ufResults.map(r => (
                    <div key={r.uf} className="flex items-center gap-2 text-xs p-2 rounded bg-muted/30">
                      {r.status === 'pending' && <span className="w-3 h-3 rounded-full bg-muted-foreground/30" />}
                      {r.status === 'running' && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
                      {r.status === 'done' && <CheckCircle className="w-3 h-3 text-green-600" />}
                      {r.status === 'error' && <XCircle className="w-3 h-3 text-destructive" />}
                      <span className="font-medium w-6">{r.uf}</span>
                      {r.status === 'done' && (
                        <span className="text-muted-foreground ml-auto">
                          {r.inserted} registros • {r.processados}/{r.total} municípios
                          {r.restantes ? ` (${r.restantes} pendentes)` : ''}
                        </span>
                      )}
                      {r.status === 'error' && (
                        <span className="text-destructive ml-auto truncate max-w-[200px]">{r.error}</span>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            {/* Reset */}
            {!isRunning && ufResults.length > 0 && ufResults.every(r => r.status !== 'pending' && r.status !== 'running') && (
              <Button variant="outline" size="sm" className="w-full gap-2" onClick={() => setUfResults([])}>
                <RefreshCw className="w-3 h-3" /> Nova Ingestão
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Play, CheckCircle, XCircle, Building2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const ESTADOS = [
  { uf: 'AC', nome: 'Acre' },
  { uf: 'AL', nome: 'Alagoas' },
  { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' },
  { uf: 'BA', nome: 'Bahia' },
  { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' },
  { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' },
  { uf: 'MA', nome: 'Maranhão' },
  { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' },
  { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' },
  { uf: 'PB', nome: 'Paraíba' },
  { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' },
  { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' },
  { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' },
  { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' },
  { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' },
  { uf: 'SE', nome: 'Sergipe' },
  { uf: 'TO', nome: 'Tocantins' },
];

const ANOS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

export function EstadualIngestionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUFs, setSelectedUFs] = useState<string[]>(['BA', 'SP', 'RJ']);
  const [selectedAnos, setSelectedAnos] = useState<number[]>([2022, 2023, 2024, 2025]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const toggleUF = (uf: string) => {
    setSelectedUFs(prev => prev.includes(uf) ? prev.filter(u => u !== uf) : [...prev, uf]);
  };
  const toggleAno = (ano: number) => {
    setSelectedAnos(prev => prev.includes(ano) ? prev.filter(a => a !== ano) : [...prev, ano]);
  };

  const run = async () => {
    if (selectedUFs.length === 0 || selectedAnos.length === 0) {
      toast.warning('Selecione pelo menos um estado e um ano.');
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ingest-estadual-siconfi', {
        body: { ufs: selectedUFs, anos: selectedAnos },
      });

      if (error) throw error;
      setResult(data);
      queryClient.invalidateQueries();

      if (data?.total_inseridos > 0) {
        toast.success(`Ingestão estadual: ${data.total_inseridos} registros inseridos`);
      } else {
        toast.info('Nenhum registro relevante encontrado nos estados/anos selecionados.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro na ingestão estadual: ${msg}`);
      setResult({ success: false, error: msg });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2">
        <Building2 className="w-4 h-4" />
        Ingestão Estadual
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Ingestão Estadual (SICONFI/RREO)
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Busca dados do RREO (Relatório Resumido da Execução Orçamentária) via API SICONFI do Tesouro Nacional.
              Filtra por palavras-chave de política racial/étnica e contas de assistência aos indígenas.
            </p>

            {/* Estados */}
            <div>
              <p className="text-sm font-medium mb-2">Estados</p>
              <div className="flex flex-wrap gap-2">
                {ESTADOS.map(e => (
                  <Button
                    key={e.uf}
                    variant={selectedUFs.includes(e.uf) ? 'default' : 'outline'}
                    size="sm"
                    className="h-8"
                    onClick={() => toggleUF(e.uf)}
                    disabled={isRunning}
                  >
                    {e.uf}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1 mt-1">
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedUFs(ESTADOS.map(e => e.uf))} disabled={isRunning}>Todos</Button>
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
            {!isRunning && !result && selectedUFs.length > 0 && selectedAnos.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                Serão consultados <strong>{selectedUFs.length} estado(s)</strong> × <strong>{selectedAnos.length} ano(s)</strong> = {selectedUFs.length * selectedAnos.length} consultas SICONFI.
              </div>
            )}

            {/* Run button */}
            <Button onClick={run} disabled={isRunning || selectedUFs.length === 0 || selectedAnos.length === 0} className="w-full gap-2">
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Consultando SICONFI...' : 'Iniciar Ingestão Estadual'}
            </Button>

            {/* Results */}
            {result && (
              <div className="p-3 bg-muted/30 rounded-lg space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  {result.success ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-destructive" />}
                  <span className="font-medium">{result.success ? `${result.total_inseridos} registros inseridos` : result.error}</span>
                </div>
                {result.total_brutos > 0 && (
                  <p className="text-muted-foreground">{result.total_brutos} brutos → {result.deduplicados} deduplicados</p>
                )}
                {result.erros?.length > 0 && (
                  <ScrollArea className="max-h-24">
                    {result.erros.map((e: string, i: number) => (
                      <p key={i} className="text-destructive">{e}</p>
                    ))}
                  </ScrollArea>
                )}
                <Button variant="outline" size="sm" className="w-full gap-2 mt-2" onClick={() => setResult(null)}>
                  <RefreshCw className="w-3 h-3" /> Nova Consulta
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

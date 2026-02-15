import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Play, CheckCircle, XCircle, Home, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const CAPITAIS = [
  { ibge: 1100205, nome: "Porto Velho", uf: "RO" },
  { ibge: 1200401, nome: "Rio Branco", uf: "AC" },
  { ibge: 1302603, nome: "Manaus", uf: "AM" },
  { ibge: 1400100, nome: "Boa Vista", uf: "RR" },
  { ibge: 1501402, nome: "Belém", uf: "PA" },
  { ibge: 1600303, nome: "Macapá", uf: "AP" },
  { ibge: 1721000, nome: "Palmas", uf: "TO" },
  { ibge: 2111300, nome: "São Luís", uf: "MA" },
  { ibge: 2211001, nome: "Teresina", uf: "PI" },
  { ibge: 2304400, nome: "Fortaleza", uf: "CE" },
  { ibge: 2408102, nome: "Natal", uf: "RN" },
  { ibge: 2507507, nome: "João Pessoa", uf: "PB" },
  { ibge: 2611606, nome: "Recife", uf: "PE" },
  { ibge: 2704302, nome: "Maceió", uf: "AL" },
  { ibge: 2800308, nome: "Aracaju", uf: "SE" },
  { ibge: 2927408, nome: "Salvador", uf: "BA" },
  { ibge: 5002704, nome: "Campo Grande", uf: "MS" },
  { ibge: 5103403, nome: "Cuiabá", uf: "MT" },
  { ibge: 5208707, nome: "Goiânia", uf: "GO" },
  { ibge: 5300108, nome: "Brasília", uf: "DF" },
  { ibge: 3106200, nome: "Belo Horizonte", uf: "MG" },
  { ibge: 3205309, nome: "Vitória", uf: "ES" },
  { ibge: 3304557, nome: "Rio de Janeiro", uf: "RJ" },
  { ibge: 3550308, nome: "São Paulo", uf: "SP" },
  { ibge: 4106902, nome: "Curitiba", uf: "PR" },
  { ibge: 4205407, nome: "Florianópolis", uf: "SC" },
  { ibge: 4314902, nome: "Porto Alegre", uf: "RS" },
];

const ANOS = [2018, 2019, 2020, 2021, 2022, 2023, 2024];

export function MunicipalIngestionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMunicipios, setSelectedMunicipios] = useState<number[]>(CAPITAIS.map(c => c.ibge));
  const [selectedAnos, setSelectedAnos] = useState<number[]>([2022, 2023, 2024]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const toggleMunicipio = (ibge: number) => {
    setSelectedMunicipios(prev => prev.includes(ibge) ? prev.filter(m => m !== ibge) : [...prev, ibge]);
  };
  const toggleAno = (ano: number) => {
    setSelectedAnos(prev => prev.includes(ano) ? prev.filter(a => a !== ano) : [...prev, ano]);
  };

  const run = async () => {
    if (selectedMunicipios.length === 0 || selectedAnos.length === 0) {
      toast.warning('Selecione pelo menos um município e um ano.');
      return;
    }

    setIsRunning(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('ingest-municipal-siconfi', {
        body: { municipios: selectedMunicipios, anos: selectedAnos },
      });

      if (error) throw error;
      setResult(data);
      queryClient.invalidateQueries();

      if (data?.total_inseridos > 0) {
        toast.success(`Ingestão municipal: ${data.total_inseridos} registros inseridos`);
      } else {
        toast.info('Nenhum registro relevante encontrado nos municípios/anos selecionados.');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro na ingestão municipal: ${msg}`);
      setResult({ success: false, error: msg });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2">
        <Home className="w-4 h-4" />
        Ingestão Municipal
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Home className="w-5 h-5 text-primary" />
              Ingestão Municipal (SICONFI/RREO) — 27 Capitais
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Busca dados do RREO/DCA via API SICONFI do Tesouro Nacional para todas as 27 capitais brasileiras.
              Filtra por Função 14, Subfunções 422/423 e palavras-chave raciais/étnicas.
            </p>

            {/* Capitais */}
            <div>
              <p className="text-sm font-medium mb-2">Capitais ({selectedMunicipios.length}/{CAPITAIS.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {CAPITAIS.map(c => (
                  <Button
                    key={c.ibge}
                    variant={selectedMunicipios.includes(c.ibge) ? 'default' : 'outline'}
                    size="sm"
                    className="h-7 text-xs px-2"
                    onClick={() => toggleMunicipio(c.ibge)}
                    disabled={isRunning}
                  >
                    {c.nome}/{c.uf}
                  </Button>
                ))}
              </div>
              <div className="flex gap-1 mt-1">
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedMunicipios(CAPITAIS.map(c => c.ibge))} disabled={isRunning}>Todas</Button>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setSelectedMunicipios([])} disabled={isRunning}>Limpar</Button>
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
            {!isRunning && !result && selectedMunicipios.length > 0 && selectedAnos.length > 0 && (
              <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                Serão consultadas <strong>{selectedMunicipios.length} capital(is)</strong> × <strong>{selectedAnos.length} ano(s)</strong> = {selectedMunicipios.length * selectedAnos.length} consultas SICONFI.
              </div>
            )}

            {/* Run button */}
            <Button onClick={run} disabled={isRunning || selectedMunicipios.length === 0 || selectedAnos.length === 0} className="w-full gap-2">
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              {isRunning ? 'Consultando SICONFI...' : 'Iniciar Ingestão Municipal'}
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

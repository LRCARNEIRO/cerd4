import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Play, CheckCircle, XCircle, Building2, RefreshCw, Eye, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

const ANOS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

interface PreviewData {
  total_brutos: number;
  total_deduplicados: number;
  por_layer: Record<string, number>;
  por_grupo_etnico: Record<string, number>;
  por_uf: Record<string, number>;
  log_consultas: string[];
  amostra: { programa: string; ano: number; dotacao_inicial: number | null; liquidado: number | null; razao_selecao: string; grupo: string }[];
  erros: string[];
  metodologia: string;
}

export function EstadualIngestionPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedUFs, setSelectedUFs] = useState<string[]>(['BA', 'SP', 'RJ']);
  const [selectedAnos, setSelectedAnos] = useState<number[]>([2022, 2023, 2024, 2025]);
  const [isRunning, setIsRunning] = useState(false);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [insertResult, setInsertResult] = useState<any>(null);
  const queryClient = useQueryClient();

  const toggleUF = (uf: string) => setSelectedUFs(prev => prev.includes(uf) ? prev.filter(u => u !== uf) : [...prev, uf]);
  const toggleAno = (ano: number) => setSelectedAnos(prev => prev.includes(ano) ? prev.filter(a => a !== ano) : [...prev, ano]);

  const run = async (mode: 'preview' | 'insert') => {
    if (selectedUFs.length === 0 || selectedAnos.length === 0) {
      toast.warning('Selecione pelo menos um estado e um ano.');
      return;
    }
    setIsRunning(true);
    if (mode === 'preview') { setPreview(null); setInsertResult(null); }

    try {
      const { data, error } = await supabase.functions.invoke('ingest-estadual-siconfi', {
        body: { ufs: selectedUFs, anos: selectedAnos, mode },
      });
      if (error) throw error;

      if (mode === 'preview') {
        setPreview(data);
        toast.success(`Preview: ${data.total_deduplicados} registros encontrados`);
      } else {
        setInsertResult(data);
        queryClient.invalidateQueries();
        if (data?.total_inseridos > 0) {
          toast.success(`Ingestão: ${data.total_inseridos} registros inseridos`);
        } else {
          toast.info('Nenhum registro inserido.');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(`Erro: ${msg}`);
    } finally {
      setIsRunning(false);
    }
  };

  const fmtCurrency = (v: number | null) => {
    if (v === null || v === undefined) return '—';
    return `R$ ${(v / 1_000_000).toFixed(2)}M`;
  };

  const reset = () => { setPreview(null); setInsertResult(null); };

  return (
    <>
      <Button onClick={() => setIsOpen(true)} variant="outline" size="sm" className="gap-2">
        <Building2 className="w-4 h-4" />
        Ingestão Estadual
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Ingestão Estadual — Metodologia Padrão-Ouro
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground">
                <strong>DCA Anexo I-E</strong> (2018–2024) e <strong>RREO Anexo 02</strong> (2025+).
                Busca por Função 14, Subfunção 422 e radicais unificados (indígen, quilombol, cigan, étnic, palmares, funai, sesai).
              </p>

              {/* Estados */}
              <div>
                <p className="text-sm font-medium mb-2">Estados</p>
                <div className="flex flex-wrap gap-1.5">
                  {ESTADOS.map(e => (
                    <Button
                      key={e.uf}
                      variant={selectedUFs.includes(e.uf) ? 'default' : 'outline'}
                      size="sm" className="h-7 text-xs px-2"
                      onClick={() => toggleUF(e.uf)} disabled={isRunning}
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
                      size="sm" className="h-8 w-16"
                      onClick={() => toggleAno(ano)} disabled={isRunning}
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

              {/* Info */}
              {!isRunning && !preview && !insertResult && selectedUFs.length > 0 && selectedAnos.length > 0 && (
                <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
                  <strong>{selectedUFs.length}</strong> estado(s) × <strong>{selectedAnos.length}</strong> ano(s) = {selectedUFs.length * selectedAnos.length} consultas SICONFI.
                  {selectedAnos.includes(2025) && <span className="ml-1 text-amber-600 font-medium">2025 via RREO (dados parciais).</span>}
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={() => run('preview')}
                  disabled={isRunning || selectedUFs.length === 0 || selectedAnos.length === 0}
                  variant="outline" className="flex-1 gap-2"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  {isRunning ? 'Consultando...' : 'Preview (Testar)'}
                </Button>
                <Button
                  onClick={() => run('insert')}
                  disabled={isRunning || selectedUFs.length === 0 || selectedAnos.length === 0}
                  className="flex-1 gap-2"
                >
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isRunning ? 'Inserindo...' : 'Inserir no Banco'}
                </Button>
              </div>

              {/* PREVIEW RESULTS */}
              {preview && (
                <div className="space-y-3">
                  <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Preview: {preview.total_deduplicados} registros encontrados</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{preview.total_brutos} brutos → {preview.total_deduplicados} deduplicados</p>
                  </div>

                  {/* Por Layer */}
                  {Object.keys(preview.por_layer).length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Por Layer de Match</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(preview.por_layer).map(([layer, count]) => (
                          <Badge key={layer} variant="secondary" className="text-[10px]">{layer}: {count}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Por Grupo */}
                  {Object.keys(preview.por_grupo_etnico).length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Por Grupo Étnico</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(preview.por_grupo_etnico).map(([g, c]) => (
                          <Badge key={g} variant="outline" className="text-[10px]">{g}: {c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Por UF */}
                  {Object.keys(preview.por_uf).length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Por UF</p>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(preview.por_uf).sort((a, b) => b[1] - a[1]).map(([uf, c]) => (
                          <Badge key={uf} variant="outline" className="text-[10px]">{uf}: {c}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Amostra (tabela) */}
                  {preview.amostra.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-1">Amostra ({Math.min(preview.amostra.length, 30)} registros)</p>
                      <div className="border rounded-lg overflow-auto max-h-60">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-[10px] p-1">Programa</TableHead>
                              <TableHead className="text-[10px] p-1">Ano</TableHead>
                              <TableHead className="text-[10px] p-1">Dot. Inicial</TableHead>
                              <TableHead className="text-[10px] p-1">Liquidado</TableHead>
                              <TableHead className="text-[10px] p-1">Razão</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {preview.amostra.map((r, i) => (
                              <TableRow key={i}>
                                <TableCell className="text-[10px] p-1 max-w-[200px] truncate" title={r.programa}>{r.programa}</TableCell>
                                <TableCell className="text-[10px] p-1">{r.ano}</TableCell>
                                <TableCell className="text-[10px] p-1 font-mono">{fmtCurrency(r.dotacao_inicial)}</TableCell>
                                <TableCell className="text-[10px] p-1 font-mono">{fmtCurrency(r.liquidado)}</TableCell>
                                <TableCell className="text-[10px] p-1 max-w-[150px] truncate" title={r.razao_selecao}>{r.razao_selecao}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {/* Log consultas */}
                  {preview.log_consultas.length > 0 && (
                    <details className="text-xs">
                      <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Log de consultas ({preview.log_consultas.length})</summary>
                      <div className="mt-1 p-2 bg-muted/30 rounded text-[10px] space-y-0.5 max-h-40 overflow-auto">
                        {preview.log_consultas.map((l, i) => <p key={i}>{l}</p>)}
                      </div>
                    </details>
                  )}

                  {preview.erros.length > 0 && (
                    <div className="text-xs text-destructive space-y-0.5">
                      {preview.erros.map((e, i) => <p key={i}>{e}</p>)}
                    </div>
                  )}

                  <Button variant="outline" size="sm" className="w-full gap-2" onClick={reset}>
                    <RefreshCw className="w-3 h-3" /> Nova Consulta
                  </Button>
                </div>
              )}

              {/* INSERT RESULTS */}
              {insertResult && (
                <div className="p-3 bg-muted/30 rounded-lg space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    {insertResult.success ? <CheckCircle className="w-4 h-4 text-green-600" /> : <XCircle className="w-4 h-4 text-destructive" />}
                    <span className="font-medium">{insertResult.success ? `${insertResult.total_inseridos} registros inseridos` : insertResult.error}</span>
                  </div>
                  {insertResult.total_brutos > 0 && (
                    <p className="text-muted-foreground">{insertResult.total_brutos} brutos → {insertResult.deduplicados} deduplicados</p>
                  )}
                  {insertResult.erros?.length > 0 && (
                    <ScrollArea className="max-h-24">
                      {insertResult.erros.map((e: string, i: number) => <p key={i} className="text-destructive">{e}</p>)}
                    </ScrollArea>
                  )}
                  <Button variant="outline" size="sm" className="w-full gap-2 mt-2" onClick={reset}>
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

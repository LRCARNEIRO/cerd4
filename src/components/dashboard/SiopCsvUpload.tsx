import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Upload, FileSpreadsheet, CheckCircle, ExternalLink, Info, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

const SIOP_PAINEL_URL = "https://www1.siop.planejamento.gov.br/QvAJAXZfc/opendoc.htm?document=IAS%2FExecucao_Orcamentaria.qvw&host=QVS%40paborc04&anonymous=true";

const PROGRAMAS_INTERESSE = [
  { codigo: "5034", nome: "Igualdade Racial e Superação do Racismo" },
  { codigo: "5803", nome: "Juventude Negra Viva" },
  { codigo: "2065", nome: "Proteção e Promoção dos Direitos dos Povos Indígenas" },
  { codigo: "0153", nome: "Promoção e Defesa dos Direitos da Criança e do Adolescente" },
];

interface PreviewData {
  total_linhas: number;
  registros_validos: number;
  colunas_detectadas: Record<string, string | null>;
  amostra: any[];
  anos: number[];
  programas: string[];
}

interface ImportResult {
  total_processados: number;
  atualizados: number;
  inseridos: number;
  ignorados: number;
  erros: string[];
}

export function SiopCsvUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'guide' | 'upload' | 'preview' | 'importing' | 'done'>('guide');
  const [csvContent, setCsvContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const text = await file.text();
    setCsvContent(text);
    setStep('upload');

    // Auto-preview
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-siop-csv', {
        body: { csvContent: text, mode: 'preview' },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      setPreview(data);
      setStep('preview');
    } catch (err) {
      toast.error(`Erro ao processar CSV: ${err instanceof Error ? err.message : 'Erro'}`);
      setStep('upload');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!csvContent) return;
    setStep('importing');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('import-siop-csv', {
        body: { csvContent, mode: 'import' },
      });
      if (error) throw error;
      if (!data.success) throw new Error(data.error);
      setResult(data);
      setStep('done');
      queryClient.invalidateQueries();
      toast.success(`SIOP importado: ${data.atualizados} atualizados, ${data.inseridos} inseridos`);
    } catch (err) {
      toast.error(`Erro na importação: ${err instanceof Error ? err.message : 'Erro'}`);
      setStep('preview');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep('guide');
    setCsvContent(null);
    setFileName('');
    setPreview(null);
    setResult(null);
    if (fileRef.current) fileRef.current.value = '';
  };

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);

  return (
    <>
      <Button onClick={() => { setIsOpen(true); reset(); }} variant="outline" size="sm" className="gap-2">
        <FileSpreadsheet className="w-4 h-4" />
        Importar CSV SIOP
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
              Importar Dotação do SIOP
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 pr-2">
            <div className="space-y-4 pb-4">

              {/* Step 1: Guide */}
              {step === 'guide' && (
                <>
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="pt-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                        <p className="text-sm">
                          O SIOP é a única fonte oficial de <strong>dotação autorizada</strong> federal.
                          Siga os passos abaixo para exportar o CSV e importá-lo aqui.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Passo a passo:</h4>

                    <div className="space-y-2">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Badge variant="outline" className="shrink-0 mt-0.5">1</Badge>
                        <div className="text-sm">
                          <p className="font-medium">Acesse o Painel do Orçamento do SIOP</p>
                          <a
                            href={SIOP_PAINEL_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline inline-flex items-center gap-1 mt-1"
                          >
                            Abrir SIOP <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Badge variant="outline" className="shrink-0 mt-0.5">2</Badge>
                        <div className="text-sm">
                          <p className="font-medium">Filtre pelos programas de interesse:</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {PROGRAMAS_INTERESSE.map(p => (
                              <Badge key={p.codigo} variant="secondary" className="text-xs">
                                {p.codigo} – {p.nome}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Badge variant="outline" className="shrink-0 mt-0.5">3</Badge>
                        <div className="text-sm">
                          <p className="font-medium">Selecione os exercícios (anos) desejados</p>
                          <p className="text-muted-foreground">Ex: 2018 a 2025</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Badge variant="outline" className="shrink-0 mt-0.5">4</Badge>
                        <div className="text-sm">
                          <p className="font-medium">Exporte: botão direito na tabela → "Exportar…" → CSV</p>
                          <p className="text-muted-foreground">Ou "Enviar para Excel" se preferir converter depois</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                        <Badge variant="outline" className="shrink-0 mt-0.5">5</Badge>
                        <div className="text-sm">
                          <p className="font-medium">Faça upload do arquivo abaixo</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => setStep('upload')} className="flex-1 gap-2">
                      <ArrowRight className="w-4 h-4" />
                      Já tenho o CSV, prosseguir
                    </Button>
                  </div>
                </>
              )}

              {/* Step 2: Upload */}
              {(step === 'upload' || (step === 'guide' && false)) && (
                <div className="space-y-4">
                  <div
                    className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => fileRef.current?.click()}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv,.txt,.tsv"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {isLoading ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Analisando CSV...</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <p className="text-sm font-medium">
                          {fileName || 'Clique para selecionar o arquivo CSV do SIOP'}
                        </p>
                        <p className="text-xs text-muted-foreground">CSV, TSV ou TXT com delimitador</p>
                      </div>
                    )}
                  </div>

                  <Button variant="outline" size="sm" onClick={() => setStep('guide')}>
                    ← Voltar ao guia
                  </Button>
                </div>
              )}

              {/* Step 3: Preview */}
              {step === 'preview' && preview && (
                <div className="space-y-4">
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4 space-y-2">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Arquivo:</span>{' '}
                          <span className="font-medium">{fileName}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Linhas:</span>{' '}
                          <span className="font-medium">{preview.total_linhas}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Registros válidos:</span>{' '}
                          <Badge variant="default">{preview.registros_validos}</Badge>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Anos:</span>{' '}
                          <span className="font-medium">{preview.anos.join(', ')}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Colunas detectadas:</p>
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(preview.colunas_detectadas).map(([key, val]) => (
                            <Badge
                              key={key}
                              variant={val ? 'secondary' : 'outline'}
                              className="text-xs"
                            >
                              {key}: {val || '❌'}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sample data */}
                  {preview.amostra.length > 0 && (
                    <div>
                      <p className="text-xs font-medium mb-2">Amostra (primeiros {preview.amostra.length} registros):</p>
                      <div className="border rounded-lg overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Ano</TableHead>
                              <TableHead className="text-xs">Programa</TableHead>
                              <TableHead className="text-xs text-right">Dot. Autorizada</TableHead>
                              <TableHead className="text-xs text-right">Dot. Inicial</TableHead>
                              <TableHead className="text-xs text-right">Pago</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {preview.amostra.map((row: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell className="text-xs">{row.ano}</TableCell>
                                <TableCell className="text-xs max-w-[200px] truncate">{row.programa}</TableCell>
                                <TableCell className="text-xs text-right">
                                  {row.dotacao_autorizada ? formatCurrency(row.dotacao_autorizada) : '—'}
                                </TableCell>
                                <TableCell className="text-xs text-right">
                                  {row.dotacao_inicial ? formatCurrency(row.dotacao_inicial) : '—'}
                                </TableCell>
                                <TableCell className="text-xs text-right">
                                  {row.pago ? formatCurrency(row.pago) : '—'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" onClick={reset}>
                      ← Voltar
                    </Button>
                    <Button
                      onClick={handleImport}
                      className="flex-1 gap-2"
                      disabled={preview.registros_validos === 0}
                    >
                      <Upload className="w-4 h-4" />
                      Importar {preview.registros_validos} registros
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Importing */}
              {step === 'importing' && (
                <div className="flex flex-col items-center gap-4 py-8">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Importando e enriquecendo dados...</p>
                </div>
              )}

              {/* Step 5: Done */}
              {step === 'done' && result && (
                <div className="space-y-4">
                  <div className="flex flex-col items-center gap-2 py-4">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                    <p className="font-medium">Importação concluída!</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-primary">{result.atualizados}</p>
                        <p className="text-xs text-muted-foreground">Atualizados</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-green-600">{result.inseridos}</p>
                        <p className="text-xs text-muted-foreground">Inseridos</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4 text-center">
                        <p className="text-2xl font-bold text-muted-foreground">{result.ignorados}</p>
                        <p className="text-xs text-muted-foreground">Ignorados</p>
                      </CardContent>
                    </Card>
                  </div>

                  {result.erros.length > 0 && (
                    <Card className="border-destructive/50">
                      <CardContent className="pt-4">
                        <p className="text-xs font-medium text-destructive mb-1">{result.erros.length} erro(s):</p>
                        {result.erros.slice(0, 5).map((e, i) => (
                          <p key={i} className="text-xs text-muted-foreground">{e}</p>
                        ))}
                      </CardContent>
                    </Card>
                  )}

                  <Button onClick={() => { reset(); setIsOpen(false); }} className="w-full">
                    Fechar
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

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, CheckCircle, XCircle, Loader2, Database, BarChart3, AlertTriangle, FileSpreadsheet } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

interface UploadResult {
  success: boolean;
  message: string;
  results?: {
    indicadores_inseridos: number;
    orcamento_inseridos: number;
    lacunas_inseridas: number;
    conclusoes_inseridas: number;
    erros: string[];
  };
  extractedData?: {
    indicadores: number;
    orcamento: number;
    lacunas: number;
    conclusoes: number;
  };
}

export function DataUploadButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const acceptedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv',
    'text/plain',
  ];

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!acceptedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.txt')) {
        toast.error('Tipo de arquivo não suportado', {
          description: 'Envie arquivos PDF, DOCX, XLSX, CSV ou TXT'
        });
        return;
      }
      setSelectedFile(file);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadProgress(10);

    try {
      // Simulate progress stages
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 80));
      }, 1000);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data, error } = await supabase.functions.invoke('process-data-upload', {
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      setResult(data as UploadResult);

      if (data.success) {
        toast.success('Dados importados com sucesso!', {
          description: `${data.results?.indicadores_inseridos || 0} indicadores, ${data.results?.orcamento_inseridos || 0} registros orçamentários`
        });

        // Invalidate all queries to refresh data across the app
        queryClient.invalidateQueries();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao processar arquivo'
      });
      toast.error('Erro ao processar arquivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setResult(null);
    setUploadProgress(0);
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (fileName.endsWith('.docx') || fileName.endsWith('.doc')) return <FileText className="w-8 h-8 text-blue-500" />;
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || fileName.endsWith('.csv')) return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    return <FileText className="w-8 h-8 text-muted-foreground" />;
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)} 
        className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg"
        size="lg"
      >
        <Upload className="w-5 h-5" />
        Importar Novos Dados
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              Importar Dados para o Sistema
            </DialogTitle>
            <DialogDescription>
              Envie documentos (PDF, DOCX, XLSX, CSV) contendo dados estatísticos, orçamentários ou recomendações. 
              O sistema irá extrair e classificar automaticamente as informações.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* File Input Area */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                selectedFile ? 'border-primary bg-primary/5' : 'border-muted-foreground/30 hover:border-primary/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.xlsx,.xls,.csv,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {selectedFile ? (
                <div className="flex items-center justify-center gap-3">
                  {getFileIcon(selectedFile.name)}
                  <div className="text-left">
                    <p className="font-medium text-sm">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm font-medium">Clique para selecionar ou arraste um arquivo</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, DOCX, XLSX, CSV ou TXT (máx. 10MB)
                  </p>
                </>
              )}
            </div>

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm">Processando documento com IA...</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Extraindo indicadores, dados orçamentários e recomendações...
                </p>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div className={`rounded-lg p-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex items-start gap-3">
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'}`}>
                      {result.message}
                    </p>
                    
                    {result.success && result.results && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                            <BarChart3 className="w-3 h-3 mr-1" />
                            {result.results.indicadores_inseridos} indicadores
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-700">
                            <Database className="w-3 h-3 mr-1" />
                            {result.results.orcamento_inseridos} orçamento
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {result.results.lacunas_inseridas} lacunas
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            <FileText className="w-3 h-3 mr-1" />
                            {result.results.conclusoes_inseridas} conclusões
                          </Badge>
                        </div>
                      </div>
                    )}

                    {result.results?.erros && result.results.erros.length > 0 && (
                      <div className="mt-3 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-800 font-medium">Avisos:</p>
                        <ul className="text-xs text-yellow-700 mt-1 space-y-0.5">
                          {result.results.erros.slice(0, 3).map((err, i) => (
                            <li key={i}>• {err}</li>
                          ))}
                          {result.results.erros.length > 3 && (
                            <li>... e mais {result.results.erros.length - 3} avisos</li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-medium">Dados que serão extraídos:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ <strong>Indicadores sociais</strong> - desemprego, educação, saúde por raça/gênero</li>
                <li>✓ <strong>Dados orçamentários</strong> - programas federais, estaduais e municipais</li>
                <li>✓ <strong>Lacunas/Recomendações</strong> - pontos pendentes de relatórios ONU</li>
                <li>✓ <strong>Fontes e referências</strong> - origem, data e URLs dos dados</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                Os dados inseridos atualizam automaticamente estatísticas, gráficos e relatórios.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {result ? 'Fechar' : 'Cancelar'}
            </Button>
            {!result && (
              <Button 
                onClick={handleUpload} 
                disabled={!selectedFile || isProcessing}
                className="gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Processar Documento
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

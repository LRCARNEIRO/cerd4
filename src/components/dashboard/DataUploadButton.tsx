import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, CheckCircle, XCircle, Loader2, Database, BarChart3, AlertTriangle, FileSpreadsheet, Link as LinkIcon, Globe } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { ReviewChanges, type ProposedChange } from './ReviewChanges';

export function DataUploadButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [proposedChanges, setProposedChanges] = useState<ProposedChange[] | null>(null);
  const [importComplete, setImportComplete] = useState(false);
  const [importResult, setImportResult] = useState<string>('');
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
      setProposedChanges(null);
      setImportComplete(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setUploadProgress(10);

    try {
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

      // Convert extracted data to proposed changes for review
      const changes: ProposedChange[] = [];
      let idx = 0;

      if (data.extractedData) {
        // The edge function already inserted the data, but we show what was inserted
        // For future: switch to preview-only mode
      }

      if (data.results) {
        // Show success with what was auto-inserted
        if (data.results.indicadores_inseridos > 0 || data.results.orcamento_inseridos > 0 ||
            data.results.lacunas_inseridas > 0 || data.results.conclusoes_inseridas > 0) {
          toast.success('Dados importados com sucesso!', {
            description: `${data.results.indicadores_inseridos} indicadores, ${data.results.orcamento_inseridos} orçamento, ${data.results.lacunas_inseridas} lacunas, ${data.results.conclusoes_inseridas} conclusões. Snapshot de backup criado automaticamente.`
          });
          queryClient.invalidateQueries();
          setImportComplete(true);
        } else {
          toast.warning('Nenhum dado extraído do documento', {
            description: 'O documento pode não conter dados estruturados reconhecíveis.'
          });
        }

        if (data.results.erros && data.results.erros.length > 0) {
          console.warn('Import warnings:', data.results.erros);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao processar arquivo', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlImport = async () => {
    if (!urlInput.trim()) return;

    setIsProcessing(true);
    setUploadProgress(10);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 15, 85));
      }, 800);

      const { data, error } = await supabase.functions.invoke('import-url', {
        body: { url: urlInput.trim() },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      if (data?.success) {
        const msg = `${data.titulo_pagina || 'Página'}: ${data.total_items || 0} dados extraídos, ${data.inserted || 0} inseridos`;
        setImportResult(msg);
        setImportComplete(true);
        if (data.total_items > 0) {
          toast.success('URL importada com sucesso!', { description: msg });
          queryClient.invalidateQueries();
        } else {
          toast.warning('Nenhum dado estruturado encontrado na URL');
        }
      }
    } catch (error) {
      console.error('URL import error:', error);
      toast.error('Erro ao importar URL', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setUrlInput('');
    setProposedChanges(null);
    setUploadProgress(0);
    setImportComplete(false);
    setImportResult('');
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
              Envie documentos ou cole links de legislação para alimentar o sistema.
              Backup automático antes de cada importação.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
           <Tabs defaultValue="file">
            <TabsList className="w-full">
              <TabsTrigger value="file" className="flex-1 gap-1">
                <Upload className="w-3 h-3" /> Arquivo
              </TabsTrigger>
              <TabsTrigger value="url" className="flex-1 gap-1">
                <Globe className="w-3 h-3" /> URL / Link
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4 mt-4">
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
            </TabsContent>

            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="https://www.planalto.gov.br/ccivil_03/..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Cole o link de uma página com legislação, dados estatísticos ou relatórios.
                  O sistema irá extrair automaticamente as informações relevantes.
                </p>
                <div className="flex flex-wrap gap-1">
                  {['planalto.gov.br', 'ibge.gov.br', 'ipea.gov.br', 'gov.br'].map(domain => (
                    <Badge key={domain} variant="outline" className="text-xs">
                      <Globe className="w-3 h-3 mr-1" />
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
           </Tabs>

            {/* Processing Progress */}
            {isProcessing && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm">Processando com IA...</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            {/* Import Complete */}
            {importComplete && (
              <div className="rounded-lg p-4 bg-green-50 border border-green-200">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Importação concluída!</p>
                    <p className="text-sm text-green-700 mt-1">
                      {importResult || 'Backup automático criado. Use Rollback para restaurar se necessário.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>
              {importComplete ? 'Fechar' : 'Cancelar'}
            </Button>
            {!importComplete && !isProcessing && (
              <>
                {selectedFile && (
                  <Button onClick={handleUpload} className="gap-2">
                    <Upload className="w-4 h-4" />
                    Processar Arquivo
                  </Button>
                )}
                {urlInput.trim() && !selectedFile && (
                  <Button onClick={handleUrlImport} className="gap-2">
                    <Globe className="w-4 h-4" />
                    Importar URL
                  </Button>
                )}
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

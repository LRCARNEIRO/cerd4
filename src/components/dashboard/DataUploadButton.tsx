import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, CheckCircle, Loader2, Database, FileSpreadsheet, Globe } from 'lucide-react';
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
  const [importResult, setImportResult] = useState('');
  const [fileName, setFileName] = useState('');
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
    setFileName(selectedFile.name);

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 5, 85));
      }, 1500);

      const formData = new FormData();
      formData.append('file', selectedFile);

      const { data, error } = await supabase.functions.invoke('process-data-upload', {
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      if (data?.proposedChanges && data.proposedChanges.length > 0) {
        // Show review interface
        const changes: ProposedChange[] = data.proposedChanges.map((c: any) => ({
          ...c,
          accepted: true, // default to accepted
        }));
        setProposedChanges(changes);
        toast.info(`${changes.length} alterações identificadas para revisão`, {
          description: `Indicadores: ${data.summary?.indicadores || 0}, Lacunas: ${data.summary?.lacunas || 0}, Conclusões: ${data.summary?.conclusoes || 0}`
        });
      } else {
        toast.warning('Nenhum dado estruturado extraído do documento', {
          description: 'O documento pode não conter dados reconhecíveis para o sistema.'
        });
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
    setFileName(urlInput.trim());

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

  const handleReviewComplete = () => {
    setImportComplete(true);
    setProposedChanges(null);
    setImportResult('Alterações aprovadas aplicadas com sucesso.');
    queryClient.invalidateQueries();
  };

  const handleReviewCancel = () => {
    setProposedChanges(null);
    toast.info('Revisão cancelada — nenhuma alteração foi aplicada.');
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedFile(null);
    setUrlInput('');
    setProposedChanges(null);
    setUploadProgress(0);
    setImportComplete(false);
    setImportResult('');
    setFileName('');
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (name.endsWith('.docx') || name.endsWith('.doc')) return <FileText className="w-8 h-8 text-blue-500" />;
    if (name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.csv')) return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
    return <FileText className="w-8 h-8 text-muted-foreground" />;
  };

  const showingReview = proposedChanges && proposedChanges.length > 0;

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
        <DialogContent className={showingReview ? 'max-w-2xl' : 'max-w-lg'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              {showingReview ? 'Revisar Alterações Propostas' : 'Importar Dados para o Sistema'}
            </DialogTitle>
            {!showingReview && (
              <p className="text-sm text-muted-foreground">
                Envie documentos ou cole links. A IA extrairá dados e você revisará antes de aplicar.
              </p>
            )}
          </DialogHeader>

          {showingReview ? (
            <ReviewChanges
              changes={proposedChanges}
              fileName={fileName}
              onComplete={handleReviewComplete}
              onCancel={handleReviewCancel}
            />
          ) : (
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

                  {selectedFile && !isProcessing && !importComplete && (
                    <Button onClick={handleUpload} className="w-full gap-2">
                      <Upload className="w-4 h-4" />
                      Processar Arquivo com IA
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="url" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <Input
                      placeholder="https://www.planalto.gov.br/ccivil_03/..."
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole o link de uma página com legislação, dados estatísticos ou relatórios.
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {['planalto.gov.br', 'ibge.gov.br', 'ipea.gov.br', 'gov.br'].map(domain => (
                        <Badge key={domain} variant="outline" className="text-xs">
                          <Globe className="w-3 h-3 mr-1" />
                          {domain}
                        </Badge>
                      ))}
                    </div>
                    {urlInput.trim() && !isProcessing && !importComplete && (
                      <Button onClick={handleUrlImport} className="w-full gap-2">
                        <Globe className="w-4 h-4" />
                        Importar URL
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm">Processando com IA... (PDFs grandes podem levar até 30s)</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}

              {importComplete && (
                <div className="rounded-lg p-4 bg-green-50 border border-green-200">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Importação concluída!</p>
                      <p className="text-sm text-green-700 mt-1">
                        {importResult || 'Dados aplicados com sucesso.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

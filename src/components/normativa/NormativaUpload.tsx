import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, FileText, Loader2, Globe, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { NormativaImpactReview, type ImpactChange } from './NormativaImpactReview';

export function NormativaUpload() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [proposedChanges, setProposedChanges] = useState<ImpactChange[] | null>(null);
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
        toast.error('Tipo de arquivo não suportado', { description: 'Envie PDF, DOCX, XLSX, CSV ou TXT' });
        return;
      }
      setSelectedFile(file);
      setProposedChanges(null);
      setImportComplete(false);
    }
  };

  const enrichWithImpact = (changes: any[]): ImpactChange[] => {
    return changes.map((c: any) => {
      // Determine which metas are impacted based on type/eixo
      const metas: string[] = [];
      const secoes: string[] = [];
      const recomendacoes: string[] = [];

      if (c.tipo === 'lacuna') {
        metas.push('Meta 1 - Legislação', 'Meta 2 - Políticas');
        const eixo = c.dados?.eixo_tematico || '';
        if (['legislacao_justica'].includes(eixo)) {
          secoes.push('Legislação Antidiscriminatória');
          metas.push('Meta 1');
        }
        if (['politicas_institucionais', 'participacao_social'].includes(eixo)) {
          secoes.push('Estrutura Institucional', 'Políticas Públicas');
          metas.push('Meta 2');
        }
        if (['seguranca_publica', 'saude', 'educacao', 'trabalho_renda'].includes(eixo)) {
          secoes.push('Base Estatística');
          metas.push('Meta 3');
        }
        recomendacoes.push(`§${c.dados?.paragrafo || '?'} — ${c.dados?.tema || c.titulo}`);
      }
      if (c.tipo === 'indicador') {
        metas.push('Meta 3 - Dados Estatísticos');
        secoes.push('Estatísticas', 'Indicadores (BD)');
      }
      if (c.tipo === 'orcamento') {
        metas.push('Meta 3 - Base Orçamentária');
        secoes.push('Orçamento');
      }
      if (c.tipo === 'conclusao') {
        metas.push('Meta 4 - Análise Transversal');
        secoes.push('Conclusões Analíticas');
        if (c.dados?.relevancia_cerd_iv) secoes.push('Relatório CERD IV');
        if (c.dados?.relevancia_common_core) secoes.push('Common Core Document');
      }

      return {
        ...c,
        accepted: true,
        metas_impactadas: [...new Set(metas)],
        secoes_impactadas: [...new Set(secoes)],
        recomendacoes_impactadas: [...new Set(recomendacoes)],
      };
    });
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

      const { data, error } = await supabase.functions.invoke('process-data-upload', { body: formData });
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (error) throw error;

      if (data?.proposedChanges?.length > 0) {
        setProposedChanges(enrichWithImpact(data.proposedChanges));
        toast.info(`${data.proposedChanges.length} alterações identificadas para revisão`);
      } else {
        toast.warning('Nenhum dado estruturado extraído do documento');
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

      // Use AI-extracted title instead of raw URL
      setFileName(data?.titulo_pagina || urlInput.trim());

      if (data?.proposedChanges?.length > 0) {
        setProposedChanges(enrichWithImpact(data.proposedChanges));
        toast.info(`${data.proposedChanges.length} alterações identificadas para revisão`);
      } else {
        toast.warning('Nenhum dado estruturado encontrado na URL');
      }
    } catch (error) {
      console.error('URL import error:', error);
      toast.error('Erro ao importar URL');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReviewComplete = async (acceptedChanges: ImpactChange[], snapshotId?: string | null) => {
    // Save document record with snapshot reference
    const metas = [...new Set(acceptedChanges.flatMap(c => c.metas_impactadas))];
    const secoes = [...new Set(acceptedChanges.flatMap(c => c.secoes_impactadas))];
    const recs = [...new Set(acceptedChanges.flatMap(c => c.recomendacoes_impactadas))];

    const resumo: Record<string, number> = {};
    acceptedChanges.forEach(c => { resumo[c.tipo] = (resumo[c.tipo] || 0) + 1; });

    await supabase.from('documentos_normativos').insert({
      titulo: fileName,
      categoria: detectCategoria(acceptedChanges),
      tipo_arquivo: selectedFile ? selectedFile.name.split('.').pop()?.toUpperCase() : 'URL',
      tamanho: selectedFile ? `${(selectedFile.size / 1024).toFixed(0)} KB` : null,
      url_origem: !selectedFile ? urlInput.trim() : null,
      metas_impactadas: metas,
      secoes_impactadas: secoes,
      recomendacoes_impactadas: recs,
      status: 'processado',
      total_itens_extraidos: acceptedChanges.length,
      resumo_impacto: resumo,
      snapshot_id: snapshotId || null,
    });

    setImportComplete(true);
    setProposedChanges(null);
    setImportResult(`${acceptedChanges.length} alterações aprovadas e aplicadas com sucesso.`);
    queryClient.invalidateQueries();
  };

  const detectCategoria = (changes: ImpactChange[]): string => {
    const hasLegislacao = changes.some(c => c.dados?.eixo_tematico === 'legislacao_justica');
    const hasPoliticas = changes.some(c => ['politicas_institucionais', 'participacao_social'].includes(c.dados?.eixo_tematico));
    if (hasLegislacao) return 'legislacao';
    if (hasPoliticas) return 'politicas';
    return 'institucional';
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
        Importar Documento Normativo
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={showingReview ? 'max-w-3xl max-h-[90vh] overflow-y-auto' : 'max-w-lg'}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              {showingReview ? 'Análise de Impacto — Revisão Obrigatória' : 'Importar Documento Normativo'}
            </DialogTitle>
          </DialogHeader>

          {showingReview ? (
            <NormativaImpactReview
              changes={proposedChanges}
              fileName={fileName}
              onComplete={handleReviewComplete}
              onCancel={() => { setProposedChanges(null); toast.info('Revisão cancelada.'); }}
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
                    <input ref={fileInputRef} type="file" accept=".pdf,.docx,.xlsx,.xls,.csv,.txt" onChange={handleFileSelect} className="hidden" />
                    {selectedFile ? (
                      <div className="flex items-center justify-center gap-3">
                        {getFileIcon(selectedFile.name)}
                        <div className="text-left">
                          <p className="font-medium text-sm">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-sm font-medium">Clique para selecionar ou arraste um arquivo</p>
                        <p className="text-xs text-muted-foreground mt-1">PDF, DOCX, XLSX, CSV ou TXT (máx. 10MB)</p>
                      </>
                    )}
                  </div>
                  {selectedFile && !isProcessing && !importComplete && (
                    <Button onClick={handleUpload} className="w-full gap-2">
                      <Upload className="w-4 h-4" /> Processar com IA
                    </Button>
                  )}
                </TabsContent>

                <TabsContent value="url" className="space-y-4 mt-4">
                  <Input placeholder="https://www.planalto.gov.br/..." value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
                  <p className="text-xs text-muted-foreground">Cole o link de legislação, dados estatísticos ou relatórios.</p>
                  <div className="flex flex-wrap gap-1">
                    {['planalto.gov.br', 'ibge.gov.br', 'gov.br'].map(d => (
                      <Badge key={d} variant="outline" className="text-xs"><Globe className="w-3 h-3 mr-1" />{d}</Badge>
                    ))}
                  </div>
                  {urlInput.trim() && !isProcessing && !importComplete && (
                    <Button onClick={handleUrlImport} className="w-full gap-2">
                      <Globe className="w-4 h-4" /> Importar URL
                    </Button>
                  )}
                </TabsContent>
              </Tabs>

              {isProcessing && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-sm">Processando com IA... (pode levar até 30s)</span>
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
                      <p className="text-sm text-green-700 mt-1">{importResult}</p>
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

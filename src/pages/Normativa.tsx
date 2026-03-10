import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SnapshotManager } from '@/components/dashboard/SnapshotManager';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import {
  Upload, FileText, Scale, Building2, FileCheck, AlertCircle,
  CheckCircle2, Clock, Search, FolderOpen, RotateCcw, Globe, Trash2, Loader2, Calendar,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { NormativaUpload } from '@/components/normativa/NormativaUpload';
import { NormativaDocCard } from '@/components/normativa/NormativaDocCard';
import { NormativaBalizadorFilter } from '@/components/normativa/NormativaBalizadorFilter';
import { ArtigoEngagementPanel } from '@/components/normativa/ArtigoEngagementPanel';
import { ArtigoFilter } from '@/components/dashboard/ArtigoFilter';
import { NormativaTimeline } from '@/components/normativa/NormativaTimeline';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';

const categoriasNormativas = [
  { id: 'legislacao', titulo: 'Legislação Antidiscriminatória', descricao: 'Leis, decretos e normas', icon: Scale, meta: 'Meta 1', cor: 'bg-blue-500' },
  { id: 'institucional', titulo: 'Estrutura Institucional', descricao: 'Órgãos, conselhos, comissões', icon: Building2, meta: 'Meta 1', cor: 'bg-green-500' },
  { id: 'politicas', titulo: 'Políticas Públicas', descricao: 'Programas, planos e ações', icon: FileCheck, meta: 'Meta 2', cor: 'bg-purple-500' },
  { id: 'jurisprudencia', titulo: 'Jurisprudência', descricao: 'Decisões judiciais relevantes', icon: FileText, meta: 'Meta 2', cor: 'bg-amber-500' },
];

export default function Normativa() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);
  const [selectedRecomendacao, setSelectedRecomendacao] = useState<string | null>(null);
  const [selectedArtigo, setSelectedArtigo] = useState<ArtigoConvencao | null>(null);
  const [showRestore, setShowRestore] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  // Fetch documents from DB
  const { data: documentos = [] } = useQuery({
    queryKey: ['documentos-normativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos_normativos')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  // Count per category
  const countByCategoria = (cat: string) => documentos.filter(d => d.categoria === cat).length;
  const totalDocumentos = documentos.length;
  const processados = documentos.filter(d => d.status === 'processado').length;
  const percentualCompleto = totalDocumentos > 0 ? Math.round((processados / totalDocumentos) * 100) : 0;

  // Impacted metas summary
  const allMetas = [...new Set(documentos.flatMap(d => d.metas_impactadas || []))];
  const allRecomendacoes = [...new Set(documentos.flatMap(d => d.recomendacoes_impactadas || []))].sort();
  const recomendacaoCoverage = allRecomendacoes.map(r => ({
    recomendacao: r,
    count: documentos.filter(d => d.recomendacoes_impactadas?.includes(r)).length,
  }));

  // Get artigos for a doc: prefer DB field, fallback to derivation
  const getDocArtigos = (doc: any): ArtigoConvencao[] => {
    if (doc.artigos_convencao && doc.artigos_convencao.length > 0) {
      return doc.artigos_convencao as ArtigoConvencao[];
    }
    const eixos: string[] = doc.secoes_impactadas || [];
    const artigos = new Set<ArtigoConvencao>();
    eixos.forEach(eixo => {
      const mapped = EIXO_PARA_ARTIGOS[eixo as keyof typeof EIXO_PARA_ARTIGOS];
      if (mapped) mapped.forEach(a => artigos.add(a));
    });
    return [...artigos];
  };

  // Article coverage counts
  const artigoCounts = ARTIGOS_CONVENCAO.reduce((acc, art) => {
    acc[art.numero] = documentos.filter(d => getDocArtigos(d).includes(art.numero)).length;
    return acc;
  }, {} as Record<ArtigoConvencao, number>);

  const filteredDocs = documentos.filter(doc =>
    doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!selectedCategoria || doc.categoria === selectedCategoria) &&
    (!selectedRecomendacao || doc.recomendacoes_impactadas?.includes(selectedRecomendacao)) &&
    (!selectedArtigo || getDocArtigos(doc).includes(selectedArtigo))
  );
  const handleDeleteDoc = async (doc: any) => {
    setIsDeleting(true);
    try {
      // If document has a snapshot, restore it to undo all changes
      if (doc.snapshot_id) {
        const { data, error } = await supabase.functions.invoke('restore-snapshot', {
          body: { snapshot_id: doc.snapshot_id },
        });
        if (error) throw error;
        if (!data?.success) throw new Error(data?.error || 'Erro ao restaurar snapshot');
      }

      // Delete the document record
      const { error: delError } = await supabase
        .from('documentos_normativos')
        .delete()
        .eq('id', doc.id);
      if (delError) throw delError;

      toast.success('Documento excluído e alterações desfeitas!', {
        description: doc.snapshot_id
          ? 'O banco de dados foi restaurado ao estado anterior.'
          : 'Registro removido (sem snapshot vinculado).',
      });
      queryClient.invalidateQueries();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erro ao excluir documento', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  };

  return (
    <DashboardLayout
      title="Base Normativa/Institucional"
      subtitle="Gestão de dados jurídicos e institucionais para Meta 1 e Meta 2 do CERD IV"
    >
      {/* GoBack button - top right prominent */}
      <div className="flex justify-end mb-4">
        <Button
          variant="destructive"
          size="lg"
          className="gap-2 shadow-lg"
          onClick={() => setShowRestore(true)}
        >
          <RotateCcw className="w-5 h-5" />
          GoBack / Restaurar Versão
        </Button>
      </div>
      {/* Alert */}
      <Card className="mb-6 border-l-4 border-l-amber-500">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-amber-500 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Base em Desenvolvimento Externo</h3>
              <p className="text-sm text-muted-foreground">
                Use o botão abaixo para carregar documentos. A IA analisa o impacto em cada meta e seção antes de inserir no banco de dados.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="outline">Meta 1 - Legislação</Badge>
                <Badge variant="outline">Meta 2 - Políticas</Badge>
                <Badge className="bg-amber-500/10 text-amber-600">Equipe Externa</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upload + Restore */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload de Dados
          </CardTitle>
          <CardDescription>
            Carregue documentos ou links. A IA extrai os dados, mostra o impacto por meta/seção, e você aprova antes de aplicar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
            <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium text-foreground mb-2">Arraste arquivos ou clique para fazer upload</h3>
            <p className="text-sm text-muted-foreground mb-4">PDF, DOCX, XLSX, CSV ou TXT — URLs também aceitas</p>
            <NormativaUpload />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total de Documentos</span>
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-2xl font-bold">{totalDocumentos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Processados</span>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-bold text-green-600">{processados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Pendentes</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-bold text-amber-600">{totalDocumentos - processados}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Progresso</span>
            </div>
            <p className="text-2xl font-bold">{percentualCompleto}%</p>
            <Progress value={percentualCompleto} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Categories - dynamic count */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {categoriasNormativas.map(categoria => {
          const Icon = categoria.icon;
          const count = countByCategoria(categoria.id);
          return (
            <Card
              key={categoria.id}
              className={`cursor-pointer transition-all hover:shadow-md ${selectedCategoria === categoria.id ? 'ring-2 ring-primary' : ''}`}
              onClick={() => setSelectedCategoria(selectedCategoria === categoria.id ? null : categoria.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-lg ${categoria.cor}/10`}>
                    <Icon className={`w-5 h-5 ${categoria.cor.replace('bg-', 'text-')}`} />
                  </div>
                  <Badge variant="outline" className="text-xs">{categoria.meta}</Badge>
                </div>
                <h3 className="font-medium text-sm mb-1">{categoria.titulo}</h3>
                <p className="text-xs text-muted-foreground mb-3">{categoria.descricao}</p>
                <p className="text-lg font-bold">{count} <span className="text-xs font-normal text-muted-foreground">documentos</span></p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtro por Artigo ICERD (I-VII) */}
      <div className="mb-6">
        <ArtigoFilter
          selected={selectedArtigo}
          onSelect={setSelectedArtigo}
          counts={artigoCounts}
          compact
        />
      </div>

      {/* Engajamento por Artigo ICERD */}
      <ArtigoEngagementPanel documentos={documentos} />

      {/* Filtro agrupado por Documento Balizador */}
      <NormativaBalizadorFilter
        recomendacoes={recomendacaoCoverage}
        selectedRecomendacao={selectedRecomendacao}
        onSelectRecomendacao={setSelectedRecomendacao}
      />

      {/* Recent documents from DB */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Documentos Normativos ({filteredDocs.length})</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-9 w-48 h-9" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredDocs.map(doc => (
              <NormativaDocCard key={doc.id} doc={doc} onDelete={setConfirmDelete} />
            ))}
          </div>

          {filteredDocs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum documento encontrado</p>
              <p className="text-xs mt-1">Ajuste os filtros ou importe documentos usando o botão acima.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* CERD requirements */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Requisitos CERD IV - Base Normativa</CardTitle>
          <CardDescription>Exigências do Comitê para Meta 1 (Legislação) e Meta 2 (Políticas Institucionais)</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="meta1">
            <TabsList>
              <TabsTrigger value="meta1">Meta 1 - Legislação</TabsTrigger>
              <TabsTrigger value="meta2">Meta 2 - Políticas</TabsTrigger>
            </TabsList>
            <TabsContent value="meta1" className="mt-4">
              <div className="space-y-3">
                {['Leis antidiscriminatórias federais, estaduais e municipais', 'Legislação específica para povos indígenas e comunidades quilombolas', 'Normas sobre tipificação do crime de racismo', 'Legislação sobre ações afirmativas', 'Tratados internacionais ratificados'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="meta2" className="mt-4">
              <div className="space-y-3">
                {['Instituições nacionais de direitos humanos', 'Órgãos de promoção da igualdade racial', 'Mecanismos de denúncia e reparação', 'Programas de educação em direitos humanos', 'Políticas de combate ao discurso de ódio'].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <CheckCircle2 className="w-5 h-5 text-green-500" /><span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Restore dialog */}
      <Dialog open={showRestore} onOpenChange={setShowRestore}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Restaurar Versão Anterior (GoBack)
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Selecione um snapshot para desfazer todas as alterações feitas após ele. Os dados serão restaurados ao estado anterior.
          </p>
          <SnapshotManager />
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-destructive" />
              Excluir Documento e Desfazer Alterações
            </DialogTitle>
            <DialogDescription>
              Ao excluir este documento, todas as alterações que ele causou no banco de dados (metas, conclusões, indicadores, lacunas) serão desfeitas automaticamente.
            </DialogDescription>
          </DialogHeader>
          {confirmDelete && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium">{confirmDelete.titulo}</p>
              <p className="text-xs text-muted-foreground">
                {confirmDelete.total_itens_extraidos} itens serão removidos
              </p>
              {confirmDelete.metas_impactadas?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {confirmDelete.metas_impactadas.map((m: string) => (
                    <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                  ))}
                </div>
              )}
              {!confirmDelete.snapshot_id && (
                <p className="text-xs text-amber-600 mt-2">
                  ⚠️ Este documento não tem snapshot vinculado. Apenas o registro será removido, sem restauração automática de dados.
                </p>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(null)} disabled={isDeleting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmDelete && handleDeleteDoc(confirmDelete)}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Excluindo...</>
              ) : (
                <><Trash2 className="w-4 h-4" />Excluir e Desfazer</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

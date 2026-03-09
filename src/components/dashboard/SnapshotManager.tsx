import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { History, RotateCcw, Clock, Database, FileText, Loader2, AlertTriangle, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Snapshot {
  id: string;
  nome: string;
  descricao: string | null;
  arquivo_origem: string | null;
  usuario_id: string;
  snapshot_data: Record<string, any[]>;
  tabelas_afetadas: string[];
  total_registros: number;
  created_at: string;
}

const TABLE_LABELS: Record<string, string> = {
  indicadores_interseccionais: 'Indicadores',
  dados_orcamentarios: 'Orçamento',
  lacunas_identificadas: 'Lacunas',
  conclusoes_analiticas: 'Conclusões',
};

const TABLES_TO_SNAPSHOT = [
  'dados_orcamentarios',
  'lacunas_identificadas',
  'conclusoes_analiticas',
  'indicadores_interseccionais',
];

export function SnapshotManager() {
  const [confirmRestore, setConfirmRestore] = useState<Snapshot | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [snapshotName, setSnapshotName] = useState('');
  const queryClient = useQueryClient();

  const { data: snapshots, isLoading } = useQuery({
    queryKey: ['data-snapshots'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('data_snapshots')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data as Snapshot[];
    },
  });

  const handleCreateSnapshot = async () => {
    const nome = snapshotName.trim() || `Backup manual — ${format(new Date(), "dd/MM/yyyy HH:mm")}`;
    setIsCreating(true);
    try {
      // Fetch all tables data
      const snapshotData: Record<string, any[]> = {};
      let totalRegistros = 0;

      for (const table of TABLES_TO_SNAPSHOT) {
        let allRows: any[] = [];
        let from = 0;
        const pageSize = 1000;
        
        while (true) {
          const { data, error } = await supabase
            .from(table as any)
            .select('*')
            .range(from, from + pageSize - 1);
          if (error) throw error;
          if (!data || data.length === 0) break;
          allRows = allRows.concat(data);
          if (data.length < pageSize) break;
          from += pageSize;
        }

        snapshotData[table] = allRows;
        totalRegistros += allRows.length;
      }

      // Insert snapshot via edge function (RLS blocks direct insert)
      const { data, error } = await supabase.functions.invoke('confirm-import', {
        body: {
          action: 'create-snapshot-only',
          snapshot_nome: nome,
          snapshot_descricao: 'Backup manual criado pelo usuário',
          snapshot_data: snapshotData,
          tabelas_afetadas: TABLES_TO_SNAPSHOT,
          total_registros: totalRegistros,
        },
      });

      if (error) throw error;

      toast.success('Snapshot criado com sucesso!', {
        description: `"${nome}" — ${totalRegistros} registros salvos.`,
      });
      setShowCreateForm(false);
      setSnapshotName('');
      queryClient.invalidateQueries({ queryKey: ['data-snapshots'] });
    } catch (error) {
      console.error('Create snapshot error:', error);
      toast.error('Erro ao criar snapshot', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleRestore = async (snapshot: Snapshot) => {
    setIsRestoring(true);
    try {
      const { data, error } = await supabase.functions.invoke('restore-snapshot', {
        body: { snapshot_id: snapshot.id },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Dados restaurados com sucesso!', {
          description: `Versão "${snapshot.nome}" restaurada.`,
        });
        queryClient.invalidateQueries();
      } else {
        throw new Error(data?.error || 'Erro desconhecido');
      }
    } catch (error) {
      console.error('Restore error:', error);
      toast.error('Erro ao restaurar snapshot', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsRestoring(false);
      setConfirmRestore(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">Carregando histórico...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <History className="w-4 h-4" />
              Histórico de Versões ({snapshots?.length || 0})
            </CardTitle>
            <Button
              size="sm"
              variant="default"
              className="gap-1.5"
              onClick={() => setShowCreateForm(true)}
            >
              <Plus className="w-4 h-4" />
              Criar Snapshot
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(!snapshots || snapshots.length === 0) && (
            <p className="text-sm text-muted-foreground">
              Nenhum snapshot disponível. Clique em "Criar Snapshot" para salvar o estado atual dos dados.
            </p>
          )}
          {snapshots?.map((snap) => (
            <div
              key={snap.id}
              className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{snap.nome}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {format(new Date(snap.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {snap.tabelas_afetadas.map((t) => (
                      <Badge key={t} variant="secondary" className="text-xs">
                        {TABLE_LABELS[t] || t}
                      </Badge>
                    ))}
                    <Badge variant="outline" className="text-xs">
                      <Database className="w-3 h-3 mr-1" />
                      {snap.total_registros} registros
                    </Badge>
                  </div>
                  {snap.arquivo_origem && (
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      {snap.arquivo_origem}
                    </div>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1"
                  onClick={() => setConfirmRestore(snap)}
                >
                  <RotateCcw className="w-3 h-3" />
                  Restaurar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dialog: Criar Snapshot */}
      <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Save className="w-5 h-5 text-primary" />
              Criar Snapshot de Backup
            </DialogTitle>
            <DialogDescription>
              Salva o estado atual de todas as tabelas (Orçamento, Lacunas, Conclusões, Indicadores).
              Você poderá restaurar este snapshot a qualquer momento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Nome do snapshot (ex: Backup pré-ingestão)"
              value={snapshotName}
              onChange={(e) => setSnapshotName(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateForm(false)} disabled={isCreating}>
              Cancelar
            </Button>
            <Button onClick={handleCreateSnapshot} disabled={isCreating} className="gap-2">
              {isCreating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Criar Snapshot
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Confirmar Restauração */}
      <Dialog open={!!confirmRestore} onOpenChange={() => setConfirmRestore(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Confirmar Restauração
            </DialogTitle>
            <DialogDescription>
              Esta ação irá substituir os dados atuais pelas versões salvas no snapshot.
              Os dados atuais serão perdidos. Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          {confirmRestore && (
            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <p className="text-sm font-medium">{confirmRestore.nome}</p>
              <p className="text-xs text-muted-foreground">
                Criado em {format(new Date(confirmRestore.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
              </p>
              <div className="flex flex-wrap gap-1">
                {confirmRestore.tabelas_afetadas.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    {TABLE_LABELS[t] || t}: {
                      (confirmRestore.snapshot_data[t] || []).length
                    } registros
                  </Badge>
                ))}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRestore(null)} disabled={isRestoring}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={() => confirmRestore && handleRestore(confirmRestore)}
              disabled={isRestoring}
              className="gap-2"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Restaurando...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  Restaurar Versão
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

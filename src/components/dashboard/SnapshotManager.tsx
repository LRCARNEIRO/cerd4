import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { History, RotateCcw, Clock, Database, FileText, Loader2, AlertTriangle } from 'lucide-react';
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

export function SnapshotManager() {
  const [confirmRestore, setConfirmRestore] = useState<Snapshot | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
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

  if (!snapshots || snapshots.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico de Versões
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Nenhum snapshot disponível. Os snapshots são criados automaticamente antes de cada importação de dados.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="w-4 h-4" />
            Histórico de Versões ({snapshots.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {snapshots.map((snap) => (
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

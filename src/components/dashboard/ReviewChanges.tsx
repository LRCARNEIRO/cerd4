import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, X, ChevronDown, ChevronUp, BarChart3, Database, AlertTriangle, FileText, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export interface ProposedChange {
  id: string;
  tabela: string;
  tipo: 'indicador' | 'orcamento' | 'lacuna' | 'conclusao';
  titulo: string;
  descricao: string;
  impacto: string[];
  dados: Record<string, any>;
  accepted: boolean;
}

interface ReviewChangesProps {
  changes: ProposedChange[];
  fileName: string;
  onComplete: () => void;
  onCancel: () => void;
}

const TIPO_CONFIG = {
  indicador: { label: 'Indicador', icon: BarChart3, color: 'bg-blue-100 text-blue-700' },
  orcamento: { label: 'Orçamento', icon: Database, color: 'bg-green-100 text-green-700' },
  lacuna: { label: 'Lacuna/Recomendação', icon: AlertTriangle, color: 'bg-amber-100 text-amber-700' },
  conclusao: { label: 'Conclusão', icon: FileText, color: 'bg-purple-100 text-purple-700' },
};

const IMPACTO_SECTIONS: Record<string, string> = {
  'estatisticas': 'Estatísticas',
  'orcamento': 'Orçamento',
  'conclusoes': 'Conclusões',
  'relatorios': 'Relatórios',
  'metas': 'Progresso das Metas',
  'grupos_focais': 'Grupos Focais',
  'common_core': 'Common Core Document',
  'cerd_iv': 'Relatório CERD IV',
};

export function ReviewChanges({ changes: initialChanges, fileName, onComplete, onCancel }: ReviewChangesProps) {
  const [changes, setChanges] = useState<ProposedChange[]>(initialChanges);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const queryClient = useQueryClient();

  const acceptedCount = changes.filter(c => c.accepted).length;

  const toggleAccept = (id: string) => {
    setChanges(prev => prev.map(c => c.id === id ? { ...c, accepted: !c.accepted } : c));
  };

  const acceptAll = () => {
    setChanges(prev => prev.map(c => ({ ...c, accepted: true })));
  };

  const rejectAll = () => {
    setChanges(prev => prev.map(c => ({ ...c, accepted: false })));
  };

  const handleConfirm = async () => {
    const accepted = changes.filter(c => c.accepted);
    if (accepted.length === 0) {
      toast.warning('Nenhuma alteração selecionada');
      return;
    }

    setIsConfirming(true);
    try {
      const items = accepted.map(c => ({
        tabela: c.tabela,
        dados: c.dados,
      }));

      const { data, error } = await supabase.functions.invoke('confirm-import', {
        body: { items, file_name: fileName },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`${accepted.length} alterações aplicadas!`, {
          description: data.message,
        });
        queryClient.invalidateQueries();
        onComplete();
      } else {
        throw new Error(data?.error || 'Erro ao confirmar');
      }
    } catch (error) {
      console.error('Confirm error:', error);
      toast.error('Erro ao aplicar alterações');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {acceptedCount} de {changes.length} alterações selecionadas
          </p>
          <p className="text-xs text-muted-foreground">Revise cada alteração antes de aplicar</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={acceptAll} className="text-xs gap-1">
            <Check className="w-3 h-3" /> Aceitar Tudo
          </Button>
          <Button variant="outline" size="sm" onClick={rejectAll} className="text-xs gap-1">
            <X className="w-3 h-3" /> Rejeitar Tudo
          </Button>
        </div>
      </div>

      {/* Changes list */}
      <ScrollArea className="max-h-[400px]">
        <div className="space-y-2 pr-3">
          {changes.map((change) => {
            const config = TIPO_CONFIG[change.tipo];
            const Icon = config.icon;
            const isExpanded = expandedId === change.id;

            return (
              <Card key={change.id} className={`transition-all ${change.accepted ? 'border-primary/50 bg-primary/5' : 'opacity-70'}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={change.accepted}
                      onCheckedChange={() => toggleAccept(change.id)}
                      className="mt-1"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={`text-xs ${config.color}`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {config.label}
                        </Badge>
                        <span className="text-sm font-medium truncate">{change.titulo}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{change.descricao}</p>

                      {/* Impact links */}
                      {change.impacto.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          <span className="text-xs text-muted-foreground">Impacta:</span>
                          {change.impacto.map((imp) => (
                            <Badge key={imp} variant="outline" className="text-xs cursor-pointer hover:bg-primary/10">
                              {IMPACTO_SECTIONS[imp] || imp}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Expandable details */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs mt-1 p-0"
                        onClick={() => setExpandedId(isExpanded ? null : change.id)}
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                        {isExpanded ? 'Ocultar dados' : 'Ver dados'}
                      </Button>

                      {isExpanded && (
                        <div className="mt-2 p-2 bg-muted/50 rounded text-xs font-mono overflow-x-auto max-h-32 overflow-y-auto">
                          <pre>{JSON.stringify(change.dados, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Footer actions */}
      <div className="flex justify-between pt-2 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isConfirming}>
          Cancelar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={acceptedCount === 0 || isConfirming}
          className="gap-2"
        >
          {isConfirming ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Aplicando...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Aplicar {acceptedCount} Alterações
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

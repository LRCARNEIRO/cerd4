import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Check, X, ChevronDown, ChevronUp, BarChart3, Database,
  AlertTriangle, FileText, Loader2, CheckCircle, Target, Layers, BookOpen,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export interface ImpactChange {
  id: string;
  tabela: string;
  tipo: 'indicador' | 'orcamento' | 'lacuna' | 'conclusao';
  titulo: string;
  descricao: string;
  impacto: string[];
  dados: Record<string, any>;
  accepted: boolean;
  metas_impactadas: string[];
  secoes_impactadas: string[];
  recomendacoes_impactadas: string[];
}

interface Props {
  changes: ImpactChange[];
  fileName: string;
  onComplete: (accepted: ImpactChange[], snapshotId?: string | null) => void;
  onCancel: () => void;
}

const TIPO_CONFIG = {
  indicador: { label: 'Indicador', icon: BarChart3, color: 'bg-blue-100 text-blue-700' },
  orcamento: { label: 'Orçamento', icon: Database, color: 'bg-green-100 text-green-700' },
  lacuna: { label: 'Lacuna/Recomendação', icon: AlertTriangle, color: 'bg-amber-100 text-amber-700' },
  conclusao: { label: 'Conclusão', icon: FileText, color: 'bg-purple-100 text-purple-700' },
};

export function NormativaImpactReview({ changes: initialChanges, fileName, onComplete, onCancel }: Props) {
  const [changes, setChanges] = useState<ImpactChange[]>(initialChanges);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const queryClient = useQueryClient();

  const acceptedCount = changes.filter(c => c.accepted).length;

  // Impact summary for accepted items
  const allMetas = [...new Set(changes.filter(c => c.accepted).flatMap(c => c.metas_impactadas))];
  const allSecoes = [...new Set(changes.filter(c => c.accepted).flatMap(c => c.secoes_impactadas))];
  const allRecs = [...new Set(changes.filter(c => c.accepted).flatMap(c => c.recomendacoes_impactadas))];

  const toggleAccept = (id: string) => {
    setChanges(prev => prev.map(c => c.id === id ? { ...c, accepted: !c.accepted } : c));
  };

  const acceptAll = () => setChanges(prev => prev.map(c => ({ ...c, accepted: true })));
  const rejectAll = () => setChanges(prev => prev.map(c => ({ ...c, accepted: false })));

  const handleConfirm = async () => {
    const accepted = changes.filter(c => c.accepted);
    if (accepted.length === 0) { toast.warning('Nenhuma alteração selecionada'); return; }

    setIsConfirming(true);
    try {
      const items = accepted.map(c => ({ tabela: c.tabela, dados: c.dados }));
      const { data, error } = await supabase.functions.invoke('confirm-import', {
        body: { items, file_name: fileName },
      });

      if (error) throw error;
      if (data?.success) {
        toast.success(`${accepted.length} alterações aplicadas com backup automático!`, {
          description: 'Use o botão "Excluir" ou "Restaurar Versão" para desfazer.',
        });
        queryClient.invalidateQueries();
        onComplete(accepted, data.snapshot_id);
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
      {/* Impact summary panel */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Resumo de Impacto ({acceptedCount} itens aceitos)
          </h3>

          {allMetas.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <Layers className="w-3 h-3" /> Metas impactadas:
              </p>
              <div className="flex flex-wrap gap-1">
                {allMetas.map(m => (
                  <Badge key={m} className="text-xs bg-primary/10 text-primary border-primary/30">{m}</Badge>
                ))}
              </div>
            </div>
          )}

          {allSecoes.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Seções atualizadas:
              </p>
              <div className="flex flex-wrap gap-1">
                {allSecoes.map(s => (
                  <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {allRecs.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Recomendações vinculadas:
              </p>
              <div className="flex flex-wrap gap-1">
                {allRecs.slice(0, 8).map(r => (
                  <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                ))}
                {allRecs.length > 8 && <Badge variant="secondary" className="text-xs">+{allRecs.length - 8} mais</Badge>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">{acceptedCount} de {changes.length} alterações selecionadas</p>
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
      <ScrollArea className="max-h-[350px]">
        <div className="space-y-2 pr-3">
          {changes.map((change) => {
            const config = TIPO_CONFIG[change.tipo];
            const Icon = config.icon;
            const isExpanded = expandedId === change.id;

            return (
              <Card key={change.id} className={`transition-all ${change.accepted ? 'border-primary/50 bg-primary/5' : 'opacity-60'}`}>
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <Checkbox checked={change.accepted} onCheckedChange={() => toggleAccept(change.id)} className="mt-1" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className={`text-xs ${config.color}`}>
                          <Icon className="w-3 h-3 mr-1" />{config.label}
                        </Badge>
                        <span className="text-sm font-medium truncate">{change.titulo}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{change.descricao}</p>

                      {/* Meta/section impact badges */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {change.metas_impactadas.slice(0, 3).map(m => (
                          <Badge key={m} variant="outline" className="text-xs border-primary/30 text-primary">
                            <Target className="w-2.5 h-2.5 mr-0.5" />{m}
                          </Badge>
                        ))}
                        {change.secoes_impactadas.slice(0, 2).map(s => (
                          <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                        ))}
                      </div>

                      <Button
                        variant="ghost" size="sm" className="h-6 text-xs mt-1 p-0"
                        onClick={() => setExpandedId(isExpanded ? null : change.id)}
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3 mr-1" /> : <ChevronDown className="w-3 h-3 mr-1" />}
                        {isExpanded ? 'Ocultar' : 'Ver dados'}
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

      {/* Footer */}
      <div className="flex justify-between pt-2 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isConfirming}>Cancelar</Button>
        <Button onClick={handleConfirm} disabled={acceptedCount === 0 || isConfirming} className="gap-2">
          {isConfirming ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Aplicando...</>
          ) : (
            <><CheckCircle className="w-4 h-4" />Aceitar {acceptedCount} Alterações</>
          )}
        </Button>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        ⚡ Um backup automático será criado antes de aplicar. Use "Restaurar Versão" para desfazer.
      </p>
    </div>
  );
}

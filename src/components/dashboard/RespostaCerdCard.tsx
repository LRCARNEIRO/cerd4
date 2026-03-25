import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { CheckCircle2, AlertTriangle, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { RespostaLacunaCerdIII } from '@/hooks/useLacunasData';

interface RespostaCerdCardProps {
  resposta: RespostaLacunaCerdIII;
  onRefreshed?: (paragrafo: string, newText: string) => void;
}

export function RespostaCerdCard({ resposta, onRefreshed }: RespostaCerdCardProps) {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localJustificativa, setLocalJustificativa] = useState<string | null>(null);
  const evidenciasQuant = resposta.evidencias_quantitativas as Record<string, string | number> | null;

  const justificativa = localJustificativa ?? resposta.justificativa_avaliacao;

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-justificativa', {
        body: { paragrafo: resposta.paragrafo_cerd_iii },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setLocalJustificativa(data.justificativa);
      onRefreshed?.(resposta.paragrafo_cerd_iii, data.justificativa);
      toast.success(`§${resposta.paragrafo_cerd_iii} atualizado`, {
        description: `Cruzou ${data.fontes.indicadores} indicadores, ${data.fontes.orcamento} registros orçamentários, ${data.fontes.normativos} normativos`,
      });
    } catch (e: any) {
      console.error(e);
      toast.error('Erro ao regenerar avaliação', { description: e.message });
    } finally {
      setIsRegenerating(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge variant="outline" className="font-mono">
                §{resposta.paragrafo_cerd_iii}
              </Badge>
              <StatusBadge status={resposta.grau_atendimento} size="sm" />
            </div>
            
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg mb-3">
              <p className="text-xs font-medium text-destructive mb-1">Crítica Original (CERD III):</p>
              <p className="text-sm">{resposta.critica_original}</p>
            </div>
            
            <div className="p-3 bg-success/5 border border-success/20 rounded-lg mb-3">
              <p className="text-xs font-medium text-success mb-1">Resposta do Brasil:</p>
              <p className="text-sm">{resposta.resposta_brasil}</p>
            </div>

            {/* Evidências quantitativas */}
            {evidenciasQuant && Object.keys(evidenciasQuant).length > 0 && (
              <div className="p-3 bg-info/5 border border-info/20 rounded-lg mb-3">
                <p className="text-xs font-medium text-info mb-2">Dados Quantitativos:</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(evidenciasQuant).map(([key, value]) => (
                    <div key={key} className="text-center p-2 bg-card rounded border">
                      <p className="text-lg font-bold text-foreground">{value}</p>
                      <p className="text-xs text-muted-foreground">{key.replace(/_/g, ' ')}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Evidências qualitativas */}
            {resposta.evidencias_qualitativas && resposta.evidencias_qualitativas.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Evidências Qualitativas:</p>
                <ul className="text-sm space-y-0.5">
                  {resposta.evidencias_qualitativas.map((ev, i) => (
                    <li key={i} className="flex items-start gap-1 text-muted-foreground">
                      <CheckCircle2 className="w-3 h-3 text-success mt-1 flex-shrink-0" />
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Justificativa / Avaliação Técnica */}
            <div className="p-3 bg-muted rounded-lg mb-3">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Avaliação Técnica:</p>
                  {localJustificativa && (
                    <Badge variant="outline" className="text-[10px] h-4 gap-0.5 border-primary/30 text-primary">
                      <Sparkles className="w-2.5 h-2.5" /> Atualizada
                    </Badge>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs gap-1"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                >
                  {isRegenerating ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <RefreshCw className="w-3 h-3" />
                  )}
                  {isRegenerating ? 'Gerando...' : 'Regenerar'}
                </Button>
              </div>
              {justificativa ? (
                <p className="text-sm">{justificativa}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">Sem avaliação técnica. Clique em "Regenerar" para gerar com base nos dados atuais.</p>
              )}
            </div>

            {/* Lacunas remanescentes */}
            {resposta.lacunas_remanescentes && resposta.lacunas_remanescentes.length > 0 && (
              <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <p className="text-xs font-medium text-warning mb-1">Lacunas Remanescentes:</p>
                <ul className="text-sm space-y-0.5">
                  {resposta.lacunas_remanescentes.map((lacuna, i) => (
                    <li key={i} className="flex items-start gap-1 text-muted-foreground">
                      <AlertTriangle className="w-3 h-3 text-warning mt-1 flex-shrink-0" />
                      {lacuna}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

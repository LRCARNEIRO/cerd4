import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shuffle } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EstimativaBadgeProps {
  /** 'simples' = proxy/fator aplicado a fonte única; 'cruzamento' = cruzamento entre 2+ fontes distintas */
  tipo?: 'simples' | 'cruzamento';
  /** Tooltip com a metodologia usada */
  metodologia?: string;
  className?: string;
}

/**
 * Badge padronizado para marcar dados estimados.
 * Diferencia visualmente estimativas simples (proxy) de cruzamentos indiretos entre fontes.
 */
export function EstimativaBadge({ tipo = 'simples', metodologia, className = '' }: EstimativaBadgeProps) {
  const isCruzamento = tipo === 'cruzamento';

  const badge = (
    <Badge
      variant="outline"
      className={`text-[9px] px-1.5 py-0 gap-0.5 ${
        isCruzamento
          ? 'bg-destructive/10 text-destructive border-destructive/30'
          : 'bg-chart-4/10 text-chart-4 border-chart-4/30'
      } ${className}`}
    >
      {isCruzamento ? <Shuffle className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
      {isCruzamento ? 'Cruzamento indireto' : 'Estimativa'}
    </Badge>
  );

  if (!metodologia) return badge;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-xs">
          {metodologia}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

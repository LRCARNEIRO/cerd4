import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { BarChart3, Banknote, FileText, AlertTriangle } from 'lucide-react';
import type { LacunaDiagnostic, DiagnosticSignal } from '@/hooks/useDiagnosticSensor';

interface DiagnosticBadgesProps {
  diagnostic: LacunaDiagnostic | undefined;
}

const iconMap: Record<string, typeof BarChart3> = {
  tendencia: BarChart3,
  orcamento_simbolico: Banknote,
  cobertura_normativa: FileText,
  
};

const severityClasses: Record<string, string> = {
  info: 'bg-info/10 text-info border-info/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
  critical: 'bg-destructive/10 text-destructive border-destructive/30',
};

export function DiagnosticBadges({ diagnostic }: DiagnosticBadgesProps) {
  if (!diagnostic || diagnostic.signals.length === 0) return null;

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-wrap gap-1 mt-2">
        {diagnostic.signals.map((signal, i) => {
          const Icon = iconMap[signal.type] || AlertTriangle;
          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className={`text-[10px] gap-1 cursor-help border ${severityClasses[signal.severity]}`}
                >
                  <Icon className="w-3 h-3" />
                  {signal.type === 'tendencia' && '📊'}
                  {signal.type === 'orcamento_simbolico' && '💰'}
                  {signal.type === 'cobertura_normativa' && '📋'}
                  {signal.type === 'divergencia' && '⚠️'}
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="font-medium text-xs">{signal.message}</p>
                {signal.detail && (
                  <p className="text-xs text-muted-foreground mt-1">{signal.detail}</p>
                )}
              </TooltipContent>
            </Tooltip>
          );
        })}
        {diagnostic.divergente && (
          <Badge variant="destructive" className="text-[10px] animate-pulse">
            ⚠️ Divergência
          </Badge>
        )}
      </div>
    </TooltipProvider>
  );
}

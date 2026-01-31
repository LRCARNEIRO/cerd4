import { StatusBadge } from '@/components/ui/status-badge';
import { cn } from '@/lib/utils';
import type { CERDRecommendation, Priority } from '@/types/cerd';
import { AlertCircle, AlertTriangle, Info, MinusCircle } from 'lucide-react';

interface RecommendationCardProps {
  recommendation: CERDRecommendation;
}

const priorityConfig: Record<Priority, { icon: typeof AlertCircle; className: string }> = {
  critica: { icon: AlertCircle, className: 'text-destructive' },
  alta: { icon: AlertTriangle, className: 'text-warning' },
  media: { icon: Info, className: 'text-info' },
  baixa: { icon: MinusCircle, className: 'text-muted-foreground' }
};

export function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const priorityInfo = priorityConfig[recommendation.prioridade];
  const PriorityIcon = priorityInfo.icon;
  
  return (
    <div className="data-card">
      <div className="flex items-start gap-3">
        <div className={cn('mt-0.5', priorityInfo.className)}>
          <PriorityIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="text-xs font-semibold bg-muted px-2 py-0.5 rounded">
              Par. {recommendation.paragrafo}
            </span>
            <span className="text-xs font-medium text-primary">
              {recommendation.eixo}
            </span>
            <StatusBadge status={recommendation.statusCumprimento} size="sm" />
          </div>
          
          <h3 className="font-medium text-sm text-foreground">
            {recommendation.tema}
          </h3>
          
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {recommendation.recomendacao}
          </p>
          
          {recommendation.lacunas.length > 0 && (
            <div className="mt-3 p-2 bg-destructive/5 rounded-md border border-destructive/20">
              <p className="text-xs font-medium text-destructive">Lacunas identificadas:</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                {recommendation.lacunas.map((lacuna, i) => (
                  <li key={i} className="flex items-start gap-1">
                    <span className="text-destructive">•</span>
                    {lacuna}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-3 flex flex-wrap gap-1">
            {recommendation.fontesEvidencia.slice(0, 3).map((fonte, i) => (
              <span key={i} className="text-xs bg-muted px-1.5 py-0.5 rounded">
                {fonte}
              </span>
            ))}
            {recommendation.fontesEvidencia.length > 3 && (
              <span className="text-xs text-muted-foreground">
                +{recommendation.fontesEvidencia.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

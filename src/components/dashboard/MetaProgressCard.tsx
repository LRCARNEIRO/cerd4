import { cn } from '@/lib/utils';
import type { WorkPlanMeta } from '@/types/cerd';

interface MetaProgressCardProps {
  meta: WorkPlanMeta;
}

const statusStyles = {
  nao_iniciada: 'text-muted-foreground',
  em_andamento: 'text-info',
  concluida: 'text-success'
};

const statusLabels = {
  nao_iniciada: 'Não Iniciada',
  em_andamento: 'Em Andamento',
  concluida: 'Concluída'
};

export function MetaProgressCard({ meta }: MetaProgressCardProps) {
  return (
    <div className="data-card">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
              Meta {meta.numero}
            </span>
            <span className={cn('text-xs font-medium', statusStyles[meta.status])}>
              {statusLabels[meta.status]}
            </span>
          </div>
          <h3 className="font-semibold text-foreground text-sm truncate">
            {meta.titulo}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {meta.descricao}
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <span className="text-2xl font-bold text-foreground">{meta.progresso}%</span>
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{meta.resultadosEsperados.length} resultados esperados</span>
        <span className="font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded">
          Meta final: 2029
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span>Prazo: {new Date(meta.prazoFim).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  );
}

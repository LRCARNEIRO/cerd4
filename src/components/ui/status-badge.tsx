import { cn } from '@/lib/utils';
import type { ComplianceStatus } from '@/types/cerd';

interface StatusBadgeProps {
  status: ComplianceStatus;
  size?: 'sm' | 'md';
}

const statusConfig: Record<ComplianceStatus, { label: string; className: string }> = {
  cumprido: { label: 'Cumprido', className: 'status-complete border' },
  parcialmente_cumprido: { label: 'Parcial', className: 'status-partial border' },
  nao_cumprido: { label: 'Não Cumprido', className: 'status-critical border' },
  retrocesso: { label: 'Retrocesso', className: 'bg-destructive text-destructive-foreground' },
  em_andamento: { label: 'Em Andamento', className: 'status-pending border' }
};

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1',
        config.className
      )}
    >
      {config.label}
    </span>
  );
}

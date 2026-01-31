import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive?: boolean;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
}

const variantStyles = {
  default: 'bg-card border',
  primary: 'bg-primary text-primary-foreground',
  success: 'bg-success/10 border-success/30 border',
  warning: 'bg-warning/10 border-warning/30 border',
  danger: 'bg-destructive/10 border-destructive/30 border'
};

const iconVariantStyles = {
  default: 'bg-muted text-muted-foreground',
  primary: 'bg-primary-foreground/20 text-primary-foreground',
  success: 'bg-success/20 text-success',
  warning: 'bg-warning/20 text-warning',
  danger: 'bg-destructive/20 text-destructive'
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  const isPrimary = variant === 'primary';
  
  return (
    <div className={cn('rounded-lg p-5 card-shadow transition-all hover:card-shadow-hover', variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={cn('text-sm font-medium', isPrimary ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
            {title}
          </p>
          <p className={cn('text-3xl font-bold mt-1', isPrimary ? 'text-primary-foreground' : 'text-foreground')}>
            {value}
          </p>
          {subtitle && (
            <p className={cn('text-sm mt-1', isPrimary ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm',
              trend.positive ? 'text-success' : 'text-destructive'
            )}>
              <span className="font-medium">
                {trend.positive ? '+' : ''}{trend.value}%
              </span>
              <span className={isPrimary ? 'text-primary-foreground/70' : 'text-muted-foreground'}>
                {trend.label}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={cn('p-3 rounded-lg', iconVariantStyles[variant])}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
}

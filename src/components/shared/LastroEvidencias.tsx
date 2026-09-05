import { Link } from 'react-router-dom';
import { BarChart3, Landmark, Scale } from 'lucide-react';
import { cn } from '@/lib/utils';
import { montarLastros, type BaseLastro, type LastroEvidencia } from '@/utils/evidenceLinks';

const estilo: Record<BaseLastro, { cls: string; Icon: typeof BarChart3; titulo: string }> = {
  estatistica: { cls: 'bg-primary/10 text-primary border-primary/30', Icon: BarChart3, titulo: 'Base Estatística' },
  orcamentaria: { cls: 'bg-warning/10 text-warning border-warning/30', Icon: Landmark, titulo: 'Base Orçamentária' },
  normativa: { cls: 'bg-success/10 text-success border-success/30', Icon: Scale, titulo: 'Base Normativa' },
};

export function LastroChip({ lastro }: { lastro: LastroEvidencia }) {
  const { cls, Icon, titulo } = estilo[lastro.base];
  return (
    <Link
      to={lastro.href}
      title={`Lastro em ${titulo}: ${lastro.rotulo}`}
      className={cn(
        'inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-semibold hover:underline',
        cls,
      )}
    >
      <Icon className="w-2.5 h-2.5" />
      {lastro.rotulo}
    </Link>
  );
}

interface LastroEvidenciasProps {
  codigos?: string[] | null;
  indicadores?: any[] | null;
  orcamento?: string[] | null;
  normativos?: string[] | null;
  className?: string;
  prefixo?: string;
}

/** Faixa de links clicáveis com a evidência que sustenta o número/afirmação. */
export function LastroEvidencias({
  codigos, indicadores, orcamento, normativos, className, prefixo = 'Lastro:',
}: LastroEvidenciasProps) {
  const lastros = montarLastros({ codigos, indicadores, orcamento, normativos });
  if (!lastros.length) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-1', className)}>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{prefixo}</span>
      {lastros.map((l) => (
        <LastroChip key={`${l.base}-${l.rotulo}`} lastro={l} />
      ))}
    </div>
  );
}

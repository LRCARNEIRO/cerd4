import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FAIXA_CLASSE, FAIXA_LABEL, classificarFaixa, formatScore, type Faixa } from '@/utils/esforcoImpacto';

interface TagProps {
  tipo: 'esforco' | 'impacto';
  score: number;
  faixa?: Faixa;
  className?: string;
}

const TIPO_LABEL = { esforco: 'Esforço', impacto: 'Impacto' } as const;

export function EsforcoImpactoTag({ tipo, score, faixa, className }: TagProps) {
  const f = faixa ?? classificarFaixa(score);
  return (
    <Badge
      variant="outline"
      className={cn('text-[10px] px-1.5 py-0 font-medium whitespace-nowrap', FAIXA_CLASSE[f], className)}
      title={`${TIPO_LABEL[tipo]} ${formatScore(score)}/100 — ${FAIXA_LABEL[f]} (faixas: <25 Baixo · 25–59,9 Intermediário · ≥60 Alto)`}
    >
      {TIPO_LABEL[tipo]} {formatScore(score)} · {FAIXA_LABEL[f]}
    </Badge>
  );
}

export function EsforcoImpactoTags({
  esforco, impacto, faixaEsforco, faixaImpacto, className,
}: {
  esforco: number; impacto: number; faixaEsforco?: Faixa; faixaImpacto?: Faixa; className?: string;
}) {
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      <EsforcoImpactoTag tipo="esforco" score={esforco} faixa={faixaEsforco} />
      <EsforcoImpactoTag tipo="impacto" score={impacto} faixa={faixaImpacto} />
    </div>
  );
}

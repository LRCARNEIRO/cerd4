import { Badge } from '@/components/ui/badge';
import type { LeituraImpactoEntry } from '@/data/leituraImpactoV20';
import { leituraCurta } from '@/utils/leituraCanonica';
import { tendenciaSeta, tendenciaCorClasse } from '@/utils/tendenciaPadronizada';

/** Selo com a forma de leitura e a tendência canônicas (v20) de um indicador de impacto. */
export function LeituraCanonicaBadge({ entry, className }: { entry: LeituraImpactoEntry; className?: string }) {
  return (
    <Badge
      variant="outline"
      data-leitura-canonica="1"
      title={`Forma de leitura: ${entry.leitura}\nTendência: ${entry.tendencia}\n${entry.base}`}
      className={`text-[10px] gap-1 ${className || ''}`}
    >
      <span className="text-muted-foreground">Leitura: {leituraCurta(entry.leitura)}</span>
      <span className={`font-semibold ${tendenciaCorClasse(entry.tendencia)}`}>
        {tendenciaSeta(entry.tendencia)} {entry.tendencia}
      </span>
    </Badge>
  );
}

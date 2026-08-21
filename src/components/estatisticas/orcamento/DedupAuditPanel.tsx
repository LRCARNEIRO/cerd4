import { Card, CardContent } from '@/components/ui/card';
import { Layers } from 'lucide-react';
import { LEGENDA_DEDUP } from '@/utils/orcamentoCanonico';

interface Props {
  bruto: number;
  canonico: number;
  valorSuprimido: number;
  formatCurrencyFull: (v: number) => string;
}

export function DedupAuditPanel({ bruto, canonico, valorSuprimido, formatCurrencyFull }: Props) {
  const suprimidos = Math.max(0, bruto - canonico);
  return (
    <Card className="mb-4 border-l-4 border-l-primary">
      <CardContent className="pt-4 pb-3 space-y-3">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Layers className="w-4 h-4 text-primary" />
          Auditoria da deduplicação lógica
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-muted/50 rounded p-3">
            <p className="text-[11px] text-muted-foreground">Registros na base bruta</p>
            <p className="text-lg font-bold text-foreground">{bruto}</p>
          </div>
          <div className="bg-muted/50 rounded p-3">
            <p className="text-[11px] text-muted-foreground">Base canônica (somada)</p>
            <p className="text-lg font-bold text-foreground">{canonico}</p>
          </div>
          <div className="bg-muted/50 rounded p-3">
            <p className="text-[11px] text-muted-foreground">Duplicados suprimidos</p>
            <p className="text-lg font-bold text-warning">{suprimidos}</p>
          </div>
          <div className="bg-muted/50 rounded p-3">
            <p className="text-[11px] text-muted-foreground">Dupla contagem evitada</p>
            <p className="text-lg font-bold text-warning">{formatCurrencyFull(valorSuprimido)}</p>
          </div>
        </div>
        <p className="text-[11px] italic text-muted-foreground">{LEGENDA_DEDUP}</p>
      </CardContent>
    </Card>
  );
}

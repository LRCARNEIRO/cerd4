import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SnapshotData {
  totalLacunas: number;
  cumpridas: number;
  parciais: number;
  naoCumpridas: number;
  retrocesso: number;
  emAndamento: number;
  totalFios: number;
  totalCruzamentos: number;
  totalConclusoes: number;
  lacunasPersistentes: number;
  avancos: number;
  retrocessos: number;
  totalIndicadores: number;
  totalRespostas: number;
  totalOrcRegistros: number;
  timestamp: string;
}

export function captureSnapshot(
  stats: any,
  fiosCondutores: any[],
  insightsCruzamento: any[],
  conclusoesDinamicas: any[],
  indicadores: any[] | undefined,
  respostas: any[] | undefined,
  orcStats: any
): SnapshotData {
  return {
    totalLacunas: stats?.total || 0,
    cumpridas: stats?.cumprido || 0,
    parciais: stats?.parcialmente_cumprido || 0,
    naoCumpridas: stats?.nao_cumprido || 0,
    retrocesso: stats?.retrocesso || 0,
    emAndamento: stats?.em_andamento || 0,
    totalFios: fiosCondutores.length,
    totalCruzamentos: insightsCruzamento.length,
    totalConclusoes: conclusoesDinamicas.length,
    lacunasPersistentes: conclusoesDinamicas.filter((c: any) => c.tipo === 'lacuna_persistente').length,
    avancos: conclusoesDinamicas.filter((c: any) => c.tipo === 'avanco').length,
    retrocessos: conclusoesDinamicas.filter((c: any) => c.tipo === 'retrocesso').length,
    totalIndicadores: indicadores?.length || 0,
    totalRespostas: respostas?.length || 0,
    totalOrcRegistros: orcStats?.totalRegistros || 0,
    timestamp: new Date().toLocaleString('pt-BR'),
  };
}

interface DiffRowProps {
  label: string;
  before: number;
  after: number;
  invert?: boolean; // true = increase is bad (e.g. retrocesso)
}

function DiffRow({ label, before, after, invert = false }: DiffRowProps) {
  const diff = after - before;
  const changed = diff !== 0;
  const isPositive = invert ? diff < 0 : diff > 0;
  const isNegative = invert ? diff > 0 : diff < 0;

  return (
    <div className={cn(
      "flex items-center justify-between py-1.5 px-2 rounded text-sm",
      changed ? "bg-muted/50" : ""
    )}>
      <span className="text-muted-foreground flex-1">{label}</span>
      <div className="flex items-center gap-2 min-w-[160px] justify-end">
        <span className="font-mono text-xs w-8 text-right">{before}</span>
        <ArrowRight className="w-3 h-3 text-muted-foreground" />
        <span className={cn(
          "font-mono text-xs w-8 text-right font-semibold",
          changed && isPositive && "text-success",
          changed && isNegative && "text-destructive",
        )}>
          {after}
        </span>
        {changed ? (
          <Badge
            variant={isPositive ? "default" : "destructive"}
            className="text-[10px] min-w-[40px] justify-center"
          >
            {diff > 0 ? '+' : ''}{diff}
          </Badge>
        ) : (
          <Badge variant="secondary" className="text-[10px] min-w-[40px] justify-center">
            <Minus className="w-2.5 h-2.5" />
          </Badge>
        )}
      </div>
    </div>
  );
}

interface RefreshDiffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  before: SnapshotData | null;
  after: SnapshotData | null;
}

export function RefreshDiffDialog({ open, onOpenChange, before, after }: RefreshDiffDialogProps) {
  if (!before || !after) return null;

  const totalChanges = [
    before.totalLacunas !== after.totalLacunas,
    before.cumpridas !== after.cumpridas,
    before.parciais !== after.parciais,
    before.naoCumpridas !== after.naoCumpridas,
    before.retrocesso !== after.retrocesso,
    before.totalFios !== after.totalFios,
    before.totalCruzamentos !== after.totalCruzamentos,
    before.totalConclusoes !== after.totalConclusoes,
    before.totalIndicadores !== after.totalIndicadores,
    before.totalRespostas !== after.totalRespostas,
    before.totalOrcRegistros !== after.totalOrcRegistros,
  ].filter(Boolean).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-primary" />
            Resultado da Atualização
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {totalChanges > 0 ? (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                {totalChanges} métrica(s) alterada(s)
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                Nenhuma alteração detectada — dados já estavam atualizados
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Timestamps */}
          <div className="flex justify-between text-xs text-muted-foreground bg-muted/30 p-2 rounded">
            <span>Antes: {before.timestamp}</span>
            <span>Depois: {after.timestamp}</span>
          </div>

          {/* Recomendações ONU */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Recomendações ONU</h4>
            <div className="border rounded-lg divide-y">
              <DiffRow label="Total de lacunas" before={before.totalLacunas} after={after.totalLacunas} />
              <DiffRow label="Cumpridas" before={before.cumpridas} after={after.cumpridas} />
              <DiffRow label="Parciais" before={before.parciais} after={after.parciais} />
              <DiffRow label="Não cumpridas" before={before.naoCumpridas} after={after.naoCumpridas} invert />
              <DiffRow label="Retrocesso" before={before.retrocesso} after={after.retrocesso} invert />
              <DiffRow label="Em andamento" before={before.emAndamento} after={after.emAndamento} />
            </div>
          </div>

          {/* Análises */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Análises Geradas</h4>
            <div className="border rounded-lg divide-y">
              <DiffRow label="Fios condutores" before={before.totalFios} after={after.totalFios} />
              <DiffRow label="Cruzamentos" before={before.totalCruzamentos} after={after.totalCruzamentos} />
              <DiffRow label="Conclusões totais" before={before.totalConclusoes} after={after.totalConclusoes} />
              <DiffRow label="↳ Lacunas persistentes" before={before.lacunasPersistentes} after={after.lacunasPersistentes} invert />
              <DiffRow label="↳ Avanços" before={before.avancos} after={after.avancos} />
              <DiffRow label="↳ Retrocessos" before={before.retrocessos} after={after.retrocessos} invert />
            </div>
          </div>

          {/* Fontes */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Base de Dados</h4>
            <div className="border rounded-lg divide-y">
              <DiffRow label="Indicadores interseccionais" before={before.totalIndicadores} after={after.totalIndicadores} />
              <DiffRow label="Respostas CERD III" before={before.totalRespostas} after={after.totalRespostas} />
              <DiffRow label="Registros orçamentários" before={before.totalOrcRegistros} after={after.totalOrcRegistros} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

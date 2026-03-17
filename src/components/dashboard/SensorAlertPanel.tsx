import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BarChart3, Banknote, FileText, Activity } from 'lucide-react';
import type { DiagnosticSummary } from '@/hooks/useDiagnosticSensor';
import { Link } from 'react-router-dom';

interface SensorAlertPanelProps {
  summary: DiagnosticSummary;
  isReady: boolean;
}

export function SensorAlertPanel({ summary, isReady }: SensorAlertPanelProps) {
  if (!isReady) return null;

  const hasAlerts = summary.totalDivergencias > 0 || summary.totalOrcamentoSimbolico > 0 || summary.totalTendenciaPiora > 0;

  if (!hasAlerts) return null;

  return (
    <Card className="border-warning/40 bg-warning/5">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="w-4 h-4 text-warning" />
          Sensor Diagnóstico — Alertas
          <Badge variant="outline" className="text-[10px] ml-auto">
            Nível 1 · Lacunas
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {summary.totalDivergencias > 0 && (
            <Link to="/recomendacoes" className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 hover:bg-destructive/15 transition-colors">
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-destructive">{summary.totalDivergencias} divergência(s)</p>
                <p className="text-[10px] text-muted-foreground">Status manual ≠ sensor</p>
              </div>
            </Link>
          )}
          {summary.totalOrcamentoSimbolico > 0 && (
            <Link to="/recomendacoes" className="flex items-center gap-2 p-2 rounded-lg bg-warning/10 hover:bg-warning/15 transition-colors">
              <Banknote className="w-4 h-4 text-warning flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-warning">{summary.totalOrcamentoSimbolico} orç. simbólico(s)</p>
                <p className="text-[10px] text-muted-foreground">Dotação sem execução</p>
              </div>
            </Link>
          )}
          {summary.totalTendenciaPiora > 0 && (
            <Link to="/recomendacoes" className="flex items-center gap-2 p-2 rounded-lg bg-destructive/10 hover:bg-destructive/15 transition-colors">
              <BarChart3 className="w-4 h-4 text-destructive flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-destructive">{summary.totalTendenciaPiora} piora(s)</p>
                <p className="text-[10px] text-muted-foreground">Indicadores em tendência negativa</p>
              </div>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

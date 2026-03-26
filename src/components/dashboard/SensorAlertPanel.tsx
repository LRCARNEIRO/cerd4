import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, BarChart3, Banknote, Activity, Database, Info } from 'lucide-react';
import type { DiagnosticSummary } from '@/hooks/useDiagnosticSensor';
import { Link } from 'react-router-dom';
import { MethodologyPanel } from '@/components/shared/MethodologyPanel';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface SensorAlertPanelProps {
  summary: DiagnosticSummary;
  isReady: boolean;
  totalIndicadoresBD?: number;
}

export function SensorAlertPanel({ summary, isReady, totalIndicadoresBD = 266 }: SensorAlertPanelProps) {
  const [showCorpusInfo, setShowCorpusInfo] = useState(false);

  if (!isReady) return null;

  const hasAlerts = summary.totalDivergencias > 0 || summary.totalOrcamentoSimbolico > 0 || summary.totalTendenciaPiora > 0;

  // Corpus total estimate: BD indicators + hardcoded series + common core rows
  const totalCorpus = totalIndicadoresBD + 273; // ~273 from hardcoded series + common core

  return (
    <div className="space-y-3">
      {hasAlerts && (
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
            <div className="mt-3">
              <MethodologyPanel variant="sensor" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Corpus Explicativo: 266 vs 539 */}
      <Card className="border-muted/60">
        <Collapsible open={showCorpusInfo} onOpenChange={setShowCorpusInfo}>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-2 pt-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
              <CardTitle className="text-xs flex items-center gap-2 text-muted-foreground">
                <Database className="w-3.5 h-3.5" />
                Corpus Estatístico: {totalIndicadoresBD} indicadores analíticos · ~{totalCorpus} registros totais
                <Info className="w-3 h-3 ml-auto" />
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pb-3 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="font-semibold text-primary mb-1">🔬 {totalIndicadoresBD} Indicadores Analíticos (BD)</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Registros na tabela <code className="text-[10px] bg-muted px-1 rounded">indicadores_interseccionais</code>. 
                    Usados pelo <strong>Sensor Diagnóstico</strong>, <strong>Aderência ICERD</strong> e cruzamentos automatizados 
                    com lacunas, orçamento e normativos.
                  </p>
                </div>
                <div className="p-2.5 rounded-lg bg-secondary/50 border border-border">
                  <p className="font-semibold mb-1">📊 ~{totalCorpus} Corpus Total</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Inclui os {totalIndicadoresBD} do BD + séries hardcoded (Estatísticas Gerais, Vulnerabilidades, 
                    Juventude, LGBTQI+, etc.) + tabelas Common Core (~84 tabelas). 
                    Usados para <strong>relatórios exportados</strong> e visualizações nas abas temáticas.
                  </p>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2 italic">
                💡 Todos os dados passam pela "Regra de Ouro": nenhum valor é estimado ou interpolado — 
                cada número tem fonte oficial verificável.
              </p>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    </div>
  );
}

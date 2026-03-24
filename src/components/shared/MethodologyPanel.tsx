import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, ChevronDown, ChevronUp, Scale, BarChart3, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

type MethodologyVariant = 'sensor' | 'aderencia' | 'full';

interface MethodologyPanelProps {
  variant: MethodologyVariant;
  className?: string;
}

const progressCategories = [
  { label: 'Cumprido', weight: '100%', color: 'bg-emerald-500', desc: 'Recomendação plenamente atendida com evidências e ações documentadas' },
  { label: 'Parcialmente Cumprido', weight: '60%', color: 'bg-amber-500', desc: 'Ações registradas ou 3+ evidências, mas sem cobertura completa' },
  { label: 'Em Andamento', weight: '30%', color: 'bg-blue-500', desc: 'Esforço normativo/institucional identificado (1-2 evidências)' },
  { label: 'Não Cumprido', weight: '5%', color: 'bg-red-500', desc: 'Sem evidências documentadas (reconhece existência do tema)' },
];

const aderenciaWeights = [
  { label: 'Lacunas ONU', weight: '20%', icon: '⚠️' },
  { label: 'Cobertura Normativa', weight: '20%', icon: '📜' },
  { label: 'Respostas CERD III', weight: '15%', icon: '📋' },
  { label: 'Orçamento', weight: '15%', icon: '💰' },
  { label: 'Conclusões Analíticas', weight: '15%', icon: '🔍' },
  { label: 'Amplitude de Evidências', weight: '10%', icon: '📊' },
  { label: 'Séries Estatísticas', weight: '5%', icon: '📈' },
];

export function MethodologyPanel({ variant, className }: MethodologyPanelProps) {
  const [open, setOpen] = useState(false);

  const showSensor = variant === 'sensor' || variant === 'full';
  const showAderencia = variant === 'aderencia' || variant === 'full';

  return (
    <div className={cn('', className)}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5 text-xs border-primary/30 text-primary hover:bg-primary/10"
      >
        <Info className="w-3.5 h-3.5" />
        Metodologia de Cálculo
        {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
      </Button>

      {open && (
        <Card className="mt-2 border-primary/20 bg-primary/5 animate-fade-in">
          <CardContent className="pt-4 pb-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Política de Conformidade Equilibrada</span>
              <Badge variant="outline" className="text-[10px]">v2</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O sistema adota uma interpretação <strong>equilibrada</strong> das recomendações internacionais, 
              reconhecendo que marcos legais e esforços institucionais precedem resultados estatísticos. 
              A reclassificação valoriza a iniciativa do Estado brasileiro sem ignorar lacunas reais.
            </p>

            {showSensor && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Fórmula de Progresso Geral</span>
                </div>
                <div className="bg-background/80 rounded-md p-3 border border-border/50">
                  <p className="text-[11px] font-mono text-muted-foreground mb-2">
                    Progresso = Σ (status × peso) / total_recomendações
                  </p>
                  <div className="space-y-1.5">
                    {progressCategories.map((cat) => (
                      <div key={cat.label} className="flex items-center gap-2">
                        <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', cat.color)} />
                        <span className="text-[11px] font-medium text-foreground min-w-[140px]">{cat.label}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{cat.weight}</Badge>
                        <span className="text-[10px] text-muted-foreground">{cat.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {showAderencia && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <BarChart3 className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Pesos — Aderência ICERD</span>
                </div>
                <div className="bg-background/80 rounded-md p-3 border border-border/50">
                  <div className="grid grid-cols-2 gap-1.5">
                    {aderenciaWeights.map((w) => (
                      <div key={w.label} className="flex items-center gap-1.5">
                        <span className="text-xs">{w.icon}</span>
                        <span className="text-[11px] text-foreground">{w.label}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 ml-auto">{w.weight}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground italic">
              Reclassificação automática: lacunas com ações do Brasil → parcial; com 1-2 evidências → em andamento; 
              parciais com 2+ ações e 3+ evidências → cumprido.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

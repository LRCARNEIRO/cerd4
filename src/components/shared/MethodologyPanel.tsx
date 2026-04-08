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
  { label: 'Recomendações ONU Atendidas', weight: '30%', icon: '⚠️' },
  { label: 'Cobertura Normativa', weight: '20%', icon: '📜' },
  { label: 'Orçamento', weight: '15%', icon: '💰' },
  { label: 'Indicadores + Séries Estatísticas', weight: '25%', icon: '📊' },
  { label: 'Amplitude de Fontes', weight: '10%', icon: '📈' },
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
              <Badge variant="outline" className="text-[10px]">v4</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O sistema utiliza <strong>vinculação estrita por palavras-chave</strong> para associar evidências 
              (indicadores, orçamento e normativos) a cada recomendação. As palavras-chave são extraídas 
              do <em>tema</em>, <em>descrição</em> e <em>texto original da ONU</em> de cada recomendação, 
              aplicando sinônimos temáticos e filtragem de termos genéricos. A busca é realizada nos campos: 
              nome/categoria de indicadores, programa/órgão/descritivo/público-alvo de ações orçamentárias, 
              e título de normativos. <strong>Não</strong> utiliza artigos ICERD ou eixos temáticos genéricos 
              para vincular evidências, evitando falsos positivos.
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
              Vinculação por keywords: tema + descrição + texto ONU → tokenização (mín. 5 letras) → filtro de stop-words → 
              expansão por sinônimos temáticos → busca nos campos de evidências. Pesos do status: Indicadores 40% + Orçamento 30% + Normativos 30%.
              Cap piora: se indicadores em piora &gt; melhora, teto = 55 (Parcial).
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

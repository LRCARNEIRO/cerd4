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
  { label: 'Cumprido', weight: 'Score ≥ 65', color: 'bg-emerald-500', desc: 'Cobertura robusta: 5+ indicadores, 3+ normativos, 5+ ações orçamentárias vinculadas' },
  { label: 'Parcialmente Cumprido', weight: 'Score ≥ 35', color: 'bg-amber-500', desc: 'Cobertura moderada: 2-4 indicadores, 1-2 normativos ou 2-4 ações orçamentárias' },
  { label: 'Não Cumprido', weight: 'Score < 35', color: 'bg-red-500', desc: 'Evidências insuficientes ou ausentes nas 3 dimensões' },
];

const aderenciaWeights = [
  { label: 'Recomendações ONU Cumpridas', weight: '50%', icon: '⚠️' },
  { label: 'Cobertura Normativa', weight: '15%', icon: '📜' },
  { label: 'Orçamento (contagem de ações)', weight: '10%', icon: '💰' },
  { label: 'Indicadores', weight: '15%', icon: '📊' },
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
              <Badge variant="outline" className="text-[10px]">v6</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              O sistema utiliza <strong>vinculação híbrida e auditável por palavras-chave</strong> para associar evidências
              (indicadores, orçamento e normativos) a cada recomendação. As palavras-chave são extraídas
              do <em>tema</em>, <em>descrição</em> e <em>texto original da ONU</em>, com sinônimos temáticos e
              filtro de termos jurídicos/genéricos. O cruzamento combina <strong>termo/frase inteira normalizada</strong>
              com <strong>expansão conceitual controlada</strong> para casos quase equivalentes (ex.: dados desagregados ↔ Censo/raça-gênero),
              mantendo <strong>score temático mínimo</strong> e sem substring solta (ex.: <em>norma</em> não casa com <em>normal</em>).
              Recomendações com grupo focal só aceitam evidências com sinal focal explícito (ex.: quilombola,
              indígena, LGBTQIA+) ou frase específica correlata; termos genéricos como <em>violência</em>, <em>proteção</em>
              e <em>discriminação</em> não vinculam sozinhos. A busca é realizada nos campos: nome/categoria/subcategoria/análise dos indicadores,
              programa/órgão/descritivo/eixo/público-alvo/observações/razão de seleção das ações orçamentárias e título/categoria dos normativos.
              <strong> Não</strong> utiliza artigos ICERD ou eixos temáticos genéricos.
            </p>

            {showSensor && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Fórmula do Score por Recomendação</span>
                </div>
                <div className="bg-background/80 rounded-md p-3 border border-border/50">
                  <p className="text-[11px] font-mono text-muted-foreground mb-1">
                    Score = (Indicadores × 40%) + (Orçamento × 30%) + (Normativos × 30%)
                  </p>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Cada dimensão pontua de 0 a 100 conforme a quantidade de evidências vinculadas por coerência temática.
                    O status final é atribuído pela faixa do score combinado:
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
              Vinculação por keywords: tema + descrição + texto ONU → tokenização → filtro de stop-words → 
              expansão conceitual controlada → frase inteira/termo inteiro + score temático mínimo → busca ampliada.
              Escala de indicadores: 1=20, 2=35, 3=50, 5=65, 7=80, 10+=100. Orçamento (contagem): 1=20, 2=35, 3=50, 5=65, 8=80, 12+=100.
              Normativos: 1=20, 2=40, 3=55, 4=75, 6+=100. Faixas: ≥65 Cumprido | ≥35 Parcial | &lt;35 Não Cumprido.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

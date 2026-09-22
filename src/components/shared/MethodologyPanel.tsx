import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, ChevronDown, ChevronUp, Scale, BarChart3, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TETOS_ESFORCO, CORTE_INTERMEDIARIO, CORTE_ALTO } from '@/utils/esforcoImpacto';
import { MetodologiaDetalhadaButton } from '@/components/shared/MetodologiaDetalhadaButton';

type MethodologyVariant = 'sensor' | 'aderencia' | 'full';

interface MethodologyPanelProps {
  variant: MethodologyVariant;
  className?: string;
}

const faixas = [
  { label: 'Alto', weight: `≥ ${CORTE_ALTO}`, color: 'bg-emerald-500', desc: 'Volume de evidências próximo ou acima do teto de saturação e realização consistente' },
  { label: 'Intermediário', weight: `${CORTE_INTERMEDIARIO} – ${CORTE_ALTO - 0.1}`, color: 'bg-amber-500', desc: 'Esforço visível, mas conversão parcial em realização mensurável' },
  { label: 'Baixo', weight: `< ${CORTE_INTERMEDIARIO}`, color: 'bg-red-500', desc: 'Poucas evidências vinculadas ou realização desfavorável' },
];

const realizacaoBases = [
  { label: 'Estatística', desc: 'Proporção de evidências com evolução não desfavorável (melhorou ou estável = 1; piorou = 0)', icon: '📊' },
  { label: 'Orçamentária', desc: 'Σ Liquidado ÷ Σ Dotação autorizada válida', icon: '💰' },
  { label: 'Normativa', desc: 'Presença de instrumento vinculado = 100; ausência = 0', icon: '📜' },
];

export function MethodologyPanel({ variant, className }: MethodologyPanelProps) {
  const [open, setOpen] = useState(false);

  const showSensor = variant === 'sensor' || variant === 'full';
  const showAderencia = variant === 'aderencia' || variant === 'full';

  return (
    <div className={cn('', className)}>
      <div className="flex flex-wrap items-center gap-2">
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
        <MetodologiaDetalhadaButton />
      </div>

      {open && (
        <Card className="mt-2 border-primary/20 bg-primary/5 animate-fade-in">
          <CardContent className="pt-4 pb-4 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Scale className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Esforço Governamental e Impacto Evidenciado</span>
              <Badge variant="outline" className="text-[10px]">v7</Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              As evidências vêm da <strong>matriz auditada Artigo × Recomendação × Evidência</strong>, validada manualmente
              a partir do inventário canônico das três bases (estatística, orçamentária e normativa). Não há inferência
              automática por palavras-chave: cada vínculo é curado. Para cada recomendação, o sistema apura dois índices
              complementares — o <strong>Esforço</strong> (quanto o Estado mobilizou) e o <strong>Impacto Evidenciado</strong>
              (quanto desse esforço se converteu em realização comprovada).
            </p>

            {showSensor && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">Fórmulas</span>
                </div>
                <div className="bg-background/80 rounded-md p-3 border border-border/50 space-y-2">
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Esforço = [100 × min(nEst/{TETOS_ESFORCO.estatistica}; 1) + 100 × min(nOrç/{TETOS_ESFORCO.orcamentaria}; 1) + 100 × min(nNorm/{TETOS_ESFORCO.normativa}; 1)] ÷ 3
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    R_est = (melhorou + estável) ÷ total com tendência mensurável × 100
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    R_orç = Σ Liquidado ÷ Σ Dotação autorizada válida × 100 &nbsp;·&nbsp; R_norm = presença ? 100 : 0
                  </p>
                  <p className="text-[11px] font-mono text-muted-foreground">
                    Realização = (R_est + R_orç + R_norm) ÷ 3 &nbsp;·&nbsp; Impacto Evidenciado = Esforço × Realização ÷ 100
                  </p>
                  <p className="text-[10px] text-muted-foreground">“Estável” representa manutenção do resultado: melhorou = 1, estável = 1 e somente piorou = 0.</p>
                  <p className="text-[10px] text-muted-foreground">
                    Os tetos de saturação ({TETOS_ESFORCO.estatistica} estatística · {TETOS_ESFORCO.orcamentaria} orçamentária · {TETOS_ESFORCO.normativa} normativa)
                    derivam do percentil 75 das evidências distintas efetivamente vinculadas; as três bases têm peso igual de 1/3.
                  </p>
                  <div className="space-y-1.5 pt-1">
                    {faixas.map((cat) => (
                      <div key={cat.label} className="flex items-center gap-2">
                        <div className={cn('w-2.5 h-2.5 rounded-full shrink-0', cat.color)} />
                        <span className="text-[11px] font-medium text-foreground min-w-[100px]">{cat.label}</span>
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
                  <span className="text-xs font-semibold text-foreground">Composição da Realização</span>
                </div>
                <div className="bg-background/80 rounded-md p-3 border border-border/50 space-y-1.5">
                  {realizacaoBases.map((w) => (
                    <div key={w.label} className="flex items-start gap-1.5">
                      <span className="text-xs">{w.icon}</span>
                      <span className="text-[11px] font-medium text-foreground min-w-[90px]">{w.label}</span>
                      <span className="text-[10px] text-muted-foreground">{w.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <p className="text-[10px] text-muted-foreground italic">
              Por artigo, o Esforço e o Impacto são a média simples dos valores das recomendações associadas
              (mapa relacional somado ao mapa formal), preservando no denominador as recomendações sem evidência,
              que entram como zero. Evidências repetidas para a mesma recomendação em artigos diferentes são contadas uma única vez.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

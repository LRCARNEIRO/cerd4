import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, AlertTriangle, Info } from 'lucide-react';
import { SectionHeader } from './BaseEvidenciasSection';
import { useLacunasStats } from '@/hooks/useLacunasData';

const STATUS_CONFIG = [
  { key: 'cumprido', label: 'Atendida', color: 'hsl(var(--success))', bgClass: 'bg-[hsl(145,55%,32%)]/10', weight: '100%' },
  { key: 'parcialmente_cumprido', label: 'Parcialmente Atendida', color: 'hsl(var(--warning))', bgClass: 'bg-[hsl(45,93%,47%)]/10', weight: '60%' },
  { key: 'em_andamento', label: 'Em Andamento', color: 'hsl(var(--info))', bgClass: 'bg-[hsl(200,80%,50%)]/10', weight: '30%' },
  { key: 'nao_cumprido', label: 'Não Atendida', color: 'hsl(var(--destructive))', bgClass: 'bg-[hsl(0,72%,50%)]/10', weight: '5%' },
  { key: 'retrocesso', label: 'Retrocesso', color: 'hsl(var(--destructive))', bgClass: 'bg-[hsl(0,72%,50%)]/10', weight: '0%' },
];

export default function FarolRecomendacoesSection() {
  const { data: stats, isLoading } = useLacunasStats();

  const total = stats?.total || 87;
  const porStatus = stats?.porStatus || {} as Record<string, number>;

  const cumpridas = porStatus.cumprido || 0;
  const parciais = porStatus.parcialmente_cumprido || 0;
  const emAndamento = porStatus.em_andamento || 0;
  const naoCumpridas = porStatus.nao_cumprido || 0;
  const retrocesso = porStatus.retrocesso || 0;

  const progresso = total > 0
    ? Math.round(((cumpridas * 100) + (parciais * 60) + (emAndamento * 30) + (naoCumpridas * 5)) / total)
    : 0;

  const statusCounts: Record<string, number> = {
    cumprido: cumpridas,
    parcialmente_cumprido: parciais,
    em_andamento: emAndamento,
    nao_cumprido: naoCumpridas,
    retrocesso,
  };

  return (
    <section id="farol-recomendacoes" className="py-14 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          number="03"
          title="Farol de Monitoramento de Recomendações"
          subtitle="Classificação e acompanhamento das 87 recomendações do Comitê CERD com vínculos a indicadores de progresso"
        />

        {/* Progress bar */}
        <Card className="mt-8 border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-foreground">Índice de Progresso Ponderado</span>
              <span className="text-2xl font-bold text-foreground">{isLoading ? '—' : `${progresso}%`}</span>
            </div>
            <div className="w-full h-3 bg-muted rounded-full overflow-hidden flex">
              {!isLoading && STATUS_CONFIG.map((s) => {
                const count = statusCounts[s.key] || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={s.key}
                    className="h-full transition-all"
                    style={{ width: `${pct}%`, backgroundColor: s.color }}
                    title={`${s.label}: ${count}`}
                  />
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
              {STATUS_CONFIG.map((s) => {
                const count = statusCounts[s.key] || 0;
                if (count === 0) return null;
                return (
                  <div key={s.key} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: s.color }} />
                    <span className="text-[10px] text-muted-foreground">
                      {s.label}: <strong className="text-foreground">{count}</strong>
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Methodology note */}
        <div className="mt-4 flex items-start gap-2 bg-muted/50 border border-border/60 rounded-lg p-3">
          <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            <strong className="text-foreground">Metodologia de Classificação:</strong>{' '}
            Cada recomendação é avaliada com base em evidências documentais (ações legislativas,
            programas orçamentários, indicadores estatísticos). Os pesos refletem o ciclo de vida
            das políticas públicas: marcos legais são reconhecidos como "Em Andamento" mesmo sem
            impacto estatístico imediato.{' '}
            <span className="font-medium">
              Pesos: Atendida (100%), Parcial (60%), Em Andamento (30%), Não Atendida (5%).
            </span>
          </div>
        </div>

        <div className="mt-5 flex items-center gap-3">
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link to="/recomendacoes">
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
              Consultar Painel Completo
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" asChild>
            <Link to="/conclusoes">
              Ver Aderência ICERD
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

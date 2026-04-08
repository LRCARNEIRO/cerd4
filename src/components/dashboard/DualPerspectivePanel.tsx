import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Clock, XCircle, AlertTriangle, TrendingUp, Minus, TrendingDown,
  ArrowRight, Scale, ShieldCheck, BarChart3, BookOpen, Landmark, FileText
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ARTIGOS_CONVENCAO, type ArtigoConvencao } from '@/utils/artigosConvencao';

interface DualPerspectivePanelProps {
  statusData: {
    cumprido: number;
    parcial: number;
    naoCumprido: number;
    retrocesso: number;
    emAndamento: number;
  };
  evolucaoData: {
    evolucao: number;
    estagnacao: number;
    retrocesso: number;
  };
  artigosSummary: {
    numero: ArtigoConvencao;
    titulo: string;
    totalRecs: number;
    cumpridas: number;
    parciais: number;
    emAndamento: number;
    naoCumpridas: number;
    evolScore: number;
    aderenciaScore?: number;
  }[];
  isLoading?: boolean;
}

const STATUS_COLORS = {
  cumprido: 'hsl(var(--success))',
  parcial: 'hsl(var(--warning))',
  naoCumprido: 'hsl(var(--destructive))',
};

const EVOL_COLORS = {
  evolucao: 'hsl(var(--success))',
  estagnacao: 'hsl(var(--warning))',
  retrocesso: 'hsl(var(--destructive))',
};

export function DualPerspectivePanel({ statusData, evolucaoData, artigosSummary, isLoading }: DualPerspectivePanelProps) {
  // 3 faixas only for Esforço: Cumprido, Parcial, Não Cumprido
  const totalCumprido = statusData.cumprido;
  const totalParcial = statusData.parcial + statusData.emAndamento;
  const totalNaoCumprido = statusData.naoCumprido + statusData.retrocesso;
  const totalStatus = totalCumprido + totalParcial + totalNaoCumprido;
  const totalEvol = evolucaoData.evolucao + evolucaoData.estagnacao + evolucaoData.retrocesso;

  const statusChartData = [
    { name: 'Cumprido', value: totalCumprido, color: STATUS_COLORS.cumprido },
    { name: 'Parcial', value: totalParcial, color: STATUS_COLORS.parcial },
    { name: 'Não Cumprido', value: totalNaoCumprido, color: STATUS_COLORS.naoCumprido },
  ].filter(d => d.value > 0);

  const evolChartData = [
    { name: 'Evolução', value: evolucaoData.evolucao, color: EVOL_COLORS.evolucao },
    { name: 'Estagnação', value: evolucaoData.estagnacao, color: EVOL_COLORS.estagnacao },
    { name: 'Retrocesso', value: evolucaoData.retrocesso, color: EVOL_COLORS.retrocesso },
  ].filter(d => d.value > 0);

  const pctEsforco = totalStatus > 0 ? Math.round((totalCumprido / totalStatus) * 100) : 0;
  const pctImpacto = totalEvol > 0 ? Math.round((evolucaoData.evolucao / totalEvol) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Narrative intro */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6 pb-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary" />
            Como o Brasil respondeu ao CERD? E qual foi o impacto real?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para avaliar o cumprimento das <strong>43 recomendações</strong> do Comitê para a Eliminação da Discriminação Racial (CERD),
            o sistema utiliza <strong>duas lentes complementares</strong>:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 rounded-lg bg-card border border-border/60">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">1ª Lente — Esforço Governamental</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>O governo procurou responder?</strong> Mede se o Estado brasileiro criou políticas, 
                programas e marcos normativos para atender a cada recomendação. Resultado: <em>Cumprido, Parcial 
                ou Não Cumprido</em>.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border/60">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-success/10">
                  <BarChart3 className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm font-semibold text-foreground">2ª Lente — Impacto Real (Evidências)</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>As ações se efetivaram?</strong> Avalia se, de fato, os indicadores estatísticos melhoraram, 
                se o orçamento foi executado e se os normativos produziram mudanças concretas. Resultado: <em>Evolução, 
                Estagnação ou Retrocesso</em>.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Side-by-side charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: Status / Esforço — 3 faixas */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Esforço Governamental
              </h3>
              <Badge variant="outline" className="text-xs">
                {pctEsforco}% cumpridas
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Das 43 recomendações, quantas o governo brasileiro procurou responder com políticas e ações?
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                    {statusChartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v} (${totalStatus ? ((v / totalStatus) * 100).toFixed(0) : 0}%)`, '']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend verticalAlign="bottom" height={30} formatter={(v) => <span className="text-[10px] text-foreground">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <MiniStat icon={CheckCircle2} label="Cumprido" value={totalCumprido} className="text-success" />
              <MiniStat icon={Clock} label="Parcial" value={totalParcial} className="text-warning" />
              <MiniStat icon={XCircle} label="Não Cumprido" value={totalNaoCumprido} className="text-destructive" />
            </div>
            <div className="mt-3 pt-2 border-t border-border/40">
              <Link to="/recomendacoes" className="text-xs text-primary hover:underline flex items-center gap-1">
                Ver Relação Completa <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT: Evolução / Impacto */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-success" />
                Impacto Real (Evidências)
              </h3>
              <Badge variant="outline" className="text-xs">
                {pctImpacto}% com evolução
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Das 43 recomendações, quantas apresentam melhoria comprovada em indicadores, orçamento e normativos?
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={evolChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                    {evolChartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v} (${totalEvol ? ((v / totalEvol) * 100).toFixed(0) : 0}%)`, '']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend verticalAlign="bottom" height={30} formatter={(v) => <span className="text-[10px] text-foreground">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <MiniStat icon={TrendingUp} label="Evolução" value={evolucaoData.evolucao} className="text-success" />
              <MiniStat icon={Minus} label="Estagnação" value={evolucaoData.estagnacao} className="text-warning" />
              <MiniStat icon={TrendingDown} label="Retrocesso" value={evolucaoData.retrocesso} className="text-destructive" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              Pesos: R$ Liquidado (35%) · Normativos (35%) · Indicadores com melhoria (30%)
            </p>
            <div className="mt-3 pt-2 border-t border-border/40">
              <Link to="/conclusoes" className="text-xs text-primary hover:underline flex items-center gap-1">
                Ver Evolução Recomendações <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Article lens — mirrors Artigos (Aderência) + Evolução Artigos */}
      <Card className="border-border/50">
        <CardContent className="pt-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm mb-2">
            <Scale className="w-4 h-4 text-primary" />
            Lente dos Artigos ICERD — Como ficaram os compromissos?
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
            Cada recomendação está vinculada a um ou mais <strong>Artigos da Convenção (I–VII)</strong>. 
            A etiqueta <strong>Esforço</strong> reflete a <em>Aderência ICERD</em> (Acompanhamento Gerencial → Artigos) 
            e a etiqueta de <strong>Evolução</strong> reflete o <em>Impacto Real</em> (Produtos → Conclusões → Evolução Artigos).
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {artigosSummary.map(art => {
              const aderencia = art.aderenciaScore ?? (art.totalRecs > 0 ? Math.round((art.cumpridas / art.totalRecs) * 100) : 0);
              const evolLabel = art.evolScore >= 60 ? 'Evolução' : art.evolScore >= 35 ? 'Estagnação' : 'Retrocesso';
              const evolColorClass = art.evolScore >= 60 ? 'bg-success text-success-foreground' : art.evolScore >= 35 ? 'bg-warning text-warning-foreground' : 'bg-destructive text-destructive-foreground';
              const aderenciaLabel = aderencia >= 70 ? 'Boa' : aderencia >= 40 ? 'Parcial' : 'Baixa';
              const statusColorClass = aderencia >= 70 ? 'bg-success/15 text-success border-success/30' : aderencia >= 40 ? 'bg-warning/15 text-warning border-warning/30' : 'bg-destructive/15 text-destructive border-destructive/30';

              return (
                <div
                  key={art.numero}
                  className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/50 transition-all"
                >
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <Badge variant="default" className="text-xs">Art. {art.numero}</Badge>
                    <Link to="/artigos">
                      <Badge variant="outline" className={`text-[9px] cursor-pointer hover:opacity-80 ${statusColorClass}`}>
                        Esforço {aderencia}%
                      </Badge>
                    </Link>
                    <Link to="/conclusoes">
                      <Badge className={`text-[9px] cursor-pointer hover:opacity-80 ${evolColorClass}`}>
                        {evolLabel} {art.evolScore}%
                      </Badge>
                    </Link>
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {art.titulo}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Progress value={aderencia} className="h-1.5 flex-1" />
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {art.cumpridas}/{art.totalRecs} cumpr.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, className }: { icon: any; label: string; value: number; className: string }) {
  return (
    <div className="flex items-center gap-1.5 p-1.5 rounded bg-muted/30">
      <Icon className={`w-3.5 h-3.5 ${className}`} />
      <div>
        <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
        <p className={`text-sm font-bold ${className}`}>{value}</p>
      </div>
    </div>
  );
}

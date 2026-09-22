import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import {
  TrendingUp, Minus, TrendingDown, ArrowRight, Scale, ShieldCheck, BarChart3, BookOpen,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { type ArtigoConvencao } from '@/utils/artigosConvencao';
import {
  CORTE_ALTO, CORTE_INTERMEDIARIO, FAIXA_CLASSE, FAIXA_LABEL, TETOS_ESFORCO,
  classificarFaixa, formatScore, type Faixa,
} from '@/utils/esforcoImpacto';

interface FaixaDistribuicao {
  alto: number;
  intermediario: number;
  baixo: number;
}

interface DualPerspectivePanelProps {
  /** Distribuição das recomendações nas faixas de Esforço Governamental */
  esforcoData: FaixaDistribuicao;
  /** Distribuição das recomendações nas faixas de Impacto Evidenciado */
  impactoData: FaixaDistribuicao;
  mediaEsforco: number;
  mediaImpacto: number;
  artigosSummary: {
    numero: ArtigoConvencao;
    titulo: string;
    totalRecs: number;
    esforcoScore: number;
    impactoScore: number;
    faixaEsforco?: Faixa;
    faixaImpacto?: Faixa;
    vinculos?: number;
    vinculosPorBase?: { estatistica: number; normativa: number; orcamentaria: number };
  }[];
  isLoading?: boolean;
}

const FAIXA_COLORS: Record<Faixa, string> = {
  alto: 'hsl(var(--success))',
  intermediario: 'hsl(var(--warning))',
  baixo: 'hsl(var(--destructive))',
};

export function DualPerspectivePanel({
  esforcoData, impactoData, mediaEsforco, mediaImpacto, artigosSummary,
}: DualPerspectivePanelProps) {
  const totalEsforco = esforcoData.alto + esforcoData.intermediario + esforcoData.baixo;
  const totalImpacto = impactoData.alto + impactoData.intermediario + impactoData.baixo;

  const toChart = (d: FaixaDistribuicao) => ([
    { name: 'Alto', value: d.alto, color: FAIXA_COLORS.alto },
    { name: 'Intermediário', value: d.intermediario, color: FAIXA_COLORS.intermediario },
    { name: 'Baixo', value: d.baixo, color: FAIXA_COLORS.baixo },
  ].filter(x => x.value > 0));

  const esforcoChart = toChart(esforcoData);
  const impactoChart = toChart(impactoData);

  return (
    <div className="space-y-6">
      {/* Narrative intro */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardContent className="pt-6 pb-5">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary" />
            Como o Brasil respondeu ao CERD? E qual foi o impacto evidenciado?
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            As <strong>42 recomendações</strong> do Comitê para a Eliminação da Discriminação Racial (CERD) são
            medidas por <strong>dois índices complementares</strong>, calculados sobre a matriz auditada
            Artigo × Recomendação × Evidência:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="p-3 rounded-lg bg-card border border-border/60">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">1º Índice — Esforço Governamental</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>Quanto o Estado mobilizou?</strong> Volume de evidências vinculadas a cada recomendação,
                com tetos por base ({TETOS_ESFORCO.estatistica} estatísticas · {TETOS_ESFORCO.orcamentaria} orçamentárias ·{' '}
                {TETOS_ESFORCO.normativa} normativas) e peso igual de 1/3 entre as bases.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-card border border-border/60">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-success/10">
                  <BarChart3 className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm font-semibold text-foreground">2º Índice — Impacto Evidenciado</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>O esforço se converteu em resultado?</strong> Esforço × Realização, onde a realização combina
                indicadores com evolução não desfavorável, execução orçamentária (liquidado ÷ dotação autorizada)
                e presença normativa.
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            <strong>Faixas (iguais para os dois índices):</strong> Baixo &lt; {CORTE_INTERMEDIARIO} ·
            Intermediário {CORTE_INTERMEDIARIO}–{CORTE_ALTO - 0.1} · Alto ≥ {CORTE_ALTO}
          </p>
        </CardContent>
      </Card>

      {/* Side-by-side charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Esforço Governamental
              </h3>
              <Badge variant="outline" className="text-xs">
                média {formatScore(mediaEsforco)}/100
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Distribuição das {totalEsforco} recomendações conforme o volume de evidências mobilizadas.
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={esforcoChart} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" isAnimationActive={false}>
                    {esforcoChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v} (${totalEsforco ? ((v / totalEsforco) * 100).toFixed(0) : 0}%)`, '']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend verticalAlign="bottom" height={30} formatter={(v) => <span className="text-[10px] text-foreground">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <MiniStat icon={TrendingUp} label="Alto" value={esforcoData.alto} className="text-success" />
              <MiniStat icon={Minus} label="Intermediário" value={esforcoData.intermediario} className="text-warning" />
              <MiniStat icon={TrendingDown} label="Baixo" value={esforcoData.baixo} className="text-destructive" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              Esforço = [100·min(nEst/{TETOS_ESFORCO.estatistica},1) + 100·min(nOrç/{TETOS_ESFORCO.orcamentaria},1) + 100·min(nNorm/{TETOS_ESFORCO.normativa},1)] ÷ 3
            </p>
            <div className="mt-3 pt-2 border-t border-border/40">
              <Link to="/recomendacoes" className="text-xs text-primary hover:underline flex items-center gap-1">
                Ver Relação Completa <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                <BarChart3 className="w-4 h-4 text-success" />
                Impacto Evidenciado
              </h3>
              <Badge variant="outline" className="text-xs">
                média {formatScore(mediaImpacto)}/100
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground mb-3">
              Distribuição das {totalImpacto} recomendações conforme o esforço efetivamente realizado.
            </p>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={impactoChart} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" isAnimationActive={false}>
                    {impactoChart.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => [`${v} (${totalImpacto ? ((v / totalImpacto) * 100).toFixed(0) : 0}%)`, '']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend verticalAlign="bottom" height={30} formatter={(v) => <span className="text-[10px] text-foreground">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-2">
              <MiniStat icon={TrendingUp} label="Alto" value={impactoData.alto} className="text-success" />
              <MiniStat icon={Minus} label="Intermediário" value={impactoData.intermediario} className="text-warning" />
              <MiniStat icon={TrendingDown} label="Baixo" value={impactoData.baixo} className="text-destructive" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-2 italic">
              R_est = (melhorou + estável) ÷ total mensurável × 100 · R_orç = Σ liquidado ÷ Σ dotação válida × 100 · R_norm = presença 100, ausência 0 · Realização = (R_est + R_orç + R_norm) ÷ 3 · Impacto = Esforço × Realização ÷ 100. Estável representa manutenção; somente piora é penalizada.
            </p>
            <div className="mt-3 pt-2 border-t border-border/40">
              <Link to="/conclusoes" className="text-xs text-primary hover:underline flex items-center gap-1">
                Ver Evolução Recomendações <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Article lens */}
      <Card className="border-border/50">
        <CardContent className="pt-5">
          <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm mb-2">
            <Scale className="w-4 h-4 text-primary" />
            Lente dos Artigos ICERD — Como ficaram os compromissos?
          </h3>
          <p className="text-[11px] text-muted-foreground mb-4 leading-relaxed">
            O resultado de cada <strong>Artigo da Convenção (I–VII)</strong> é a <strong>média simples</strong> dos
            índices das recomendações a ele associadas pelo mapa relacional e pelo mapa formal —
            inclusive as recomendações sem evidência vinculada, que entram com zero.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {artigosSummary.map(art => {
              const fe = art.faixaEsforco ?? classificarFaixa(art.esforcoScore);
              const fi = art.faixaImpacto ?? classificarFaixa(art.impactoScore);
              return (
                <div
                  key={art.numero}
                  className="p-3 rounded-lg border border-border hover:border-primary/40 hover:bg-muted/50 transition-all"
                >
                  <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                    <Badge variant="default" className="text-xs">Art. {art.numero}</Badge>
                    <Link to="/artigos">
                      <Badge variant="outline" className={`text-[9px] cursor-pointer hover:opacity-80 ${FAIXA_CLASSE[fe]}`}>
                        Esforço {formatScore(art.esforcoScore)} · {FAIXA_LABEL[fe]}
                      </Badge>
                    </Link>
                    <Link to="/artigos">
                      <Badge variant="outline" className={`text-[9px] cursor-pointer hover:opacity-80 ${FAIXA_CLASSE[fi]}`}>
                        Impacto {formatScore(art.impactoScore)} · {FAIXA_LABEL[fi]}
                      </Badge>
                    </Link>
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-1">
                    {art.titulo}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Progress value={art.impactoScore} className="h-1.5 flex-1" />
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {art.totalRecs} recs.
                    </span>
                  </div>
                  {art.vinculos ? (
                    <p className="text-[9px] text-muted-foreground mt-1 leading-tight">
                      Matriz auditada: {art.vinculos} vínculos ({art.vinculosPorBase?.orcamentaria || 0} orç. · {art.vinculosPorBase?.estatistica || 0} estat. · {art.vinculosPorBase?.normativa || 0} norm.)
                    </p>
                  ) : null}
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

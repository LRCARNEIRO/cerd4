import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scale, CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, inferArtigosOrcamento, type ArtigoConvencao } from '@/utils/artigosConvencao';
import type { FioCondutor, ConclusaoDinamica } from '@/hooks/useAnalyticalInsights';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell
} from 'recharts';

interface IcerdAdherencePanelProps {
  fiosCondutores: FioCondutor[];
  conclusoes: ConclusaoDinamica[];
  lacunas: any[];
  orcamentoRecords: DadoOrcamentario[];
  indicadores: any[];
  stats: any;
}

type ArtigoAnalysis = {
  numero: ArtigoConvencao;
  titulo: string;
  tituloCompleto: string;
  cor: string;
  // Coverage dimensions
  lacunasTotal: number;
  lacunasCumpridas: number;
  lacunasParciais: number;
  lacunasNaoCumpridas: number;
  lacunasRetrocesso: number;
  fiosTotal: number;
  fiosAvanco: number;
  fiosRetrocesso: number;
  conclusoesAvanco: number;
  conclusoesRetrocesso: number;
  conclusoesLacuna: number;
  orcamentoLiquidado: number;
  orcamentoProgramas: number;
  indicadoresCount: number;
  // Computed
  grauAderencia: number; // 0-100
  tendencia: 'melhora' | 'piora' | 'estagnacao';
  veredito: string;
};

const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)} bi`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(0)} mi`;
  return `R$ ${(value / 1_000).toFixed(0)} mil`;
};

function computeAdherenceScore(a: Omit<ArtigoAnalysis, 'grauAderencia' | 'tendencia' | 'veredito'>): number {
  // Weighted score: lacunas compliance (40%), budget coverage (20%), conclusions balance (20%), evidence breadth (20%)
  let score = 0;

  // Lacunas compliance (0-40)
  if (a.lacunasTotal > 0) {
    const cumprimento = (a.lacunasCumpridas * 1 + a.lacunasParciais * 0.5) / a.lacunasTotal;
    const retrocessoPenalty = a.lacunasRetrocesso / a.lacunasTotal * 0.3;
    score += Math.max(0, (cumprimento - retrocessoPenalty)) * 40;
  } else {
    score += 10; // No data = low baseline
  }

  // Budget coverage (0-20)
  if (a.orcamentoProgramas > 0) {
    score += Math.min(20, a.orcamentoProgramas * 3); // Up to 20 for 7+ programs
  }

  // Conclusions balance (0-20)
  const totalConc = a.conclusoesAvanco + a.conclusoesRetrocesso + a.conclusoesLacuna;
  if (totalConc > 0) {
    const avancoRatio = a.conclusoesAvanco / totalConc;
    score += avancoRatio * 20;
  }

  // Evidence breadth (0-20)
  const hasLacunas = a.lacunasTotal > 0;
  const hasFios = a.fiosTotal > 0;
  const hasOrc = a.orcamentoProgramas > 0;
  const hasInd = a.indicadoresCount > 0;
  const breadth = [hasLacunas, hasFios, hasOrc, hasInd].filter(Boolean).length;
  score += (breadth / 4) * 20;

  return Math.round(Math.min(100, Math.max(0, score)));
}

function determineTrend(a: Omit<ArtigoAnalysis, 'grauAderencia' | 'tendencia' | 'veredito'>): 'melhora' | 'piora' | 'estagnacao' {
  const avancos = a.fiosAvanco + a.conclusoesAvanco;
  const retrocessos = a.fiosRetrocesso + a.conclusoesRetrocesso + a.lacunasRetrocesso;
  if (avancos > retrocessos * 1.5) return 'melhora';
  if (retrocessos > avancos * 1.5) return 'piora';
  return 'estagnacao';
}

function generateVerdict(a: ArtigoAnalysis): string {
  if (a.grauAderencia >= 70) return `Boa aderência. O Estado demonstra engajamento significativo com o Art. ${a.numero}, com ${a.lacunasCumpridas + a.lacunasParciais} de ${a.lacunasTotal} obrigações atendidas e ${a.orcamentoProgramas} programas orçamentários dedicados.`;
  if (a.grauAderencia >= 40) return `Aderência parcial. Existem avanços pontuais no Art. ${a.numero} (${a.conclusoesAvanco} avanços identificados), mas ${a.lacunasNaoCumpridas + a.lacunasRetrocesso} obrigações permanecem sem cumprimento adequado. O investimento orçamentário (${a.orcamentoProgramas} programas) não se traduz em resultados proporcionais.`;
  if (a.grauAderencia >= 15) return `Baixa aderência. O Art. ${a.numero} permanece sub-priorizado: ${a.lacunasNaoCumpridas} obrigações não cumpridas, ${a.lacunasRetrocesso} retrocessos e cobertura orçamentária limitada (${a.orcamentoProgramas} programas).`;
  return `Aderência crítica. O Art. ${a.numero} não recebe atenção estatal proporcional às obrigações da Convenção. Lacunas graves persistem sem resposta institucional ou orçamentária adequada.`;
}

export function IcerdAdherencePanel({ fiosCondutores, conclusoes, lacunas, orcamentoRecords, indicadores, stats }: IcerdAdherencePanelProps) {
  const analysis = useMemo<ArtigoAnalysis[]>(() => {
    return ARTIGOS_CONVENCAO.map(art => {
      // Lacunas by article
      const artLacunas = lacunas.filter(l => l.artigos_convencao?.includes(art.numero));
      const cumpridas = artLacunas.filter(l => l.status_cumprimento === 'cumprido').length;
      const parciais = artLacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length;
      const naoCumpridas = artLacunas.filter(l => l.status_cumprimento === 'nao_cumprido').length;
      const retrocesso = artLacunas.filter(l => l.status_cumprimento === 'retrocesso').length;

      // Fios by article
      const artFios = fiosCondutores.filter(f => f.artigosConvencao?.includes(art.numero));
      const fiosAvanco = artFios.filter(f => f.tipo === 'avanco').length;
      const fiosRetrocesso = artFios.filter(f => f.tipo === 'retrocesso' || f.tipo === 'lacuna_critica').length;

      // Conclusões by article
      const artConc = conclusoes.filter(c => c.artigosConvencao?.includes(art.numero));
      const concAvanco = artConc.filter(c => c.tipo === 'avanco').length;
      const concRetrocesso = artConc.filter(c => c.tipo === 'retrocesso').length;
      const concLacuna = artConc.filter(c => c.tipo === 'lacuna_persistente').length;

      // Orçamento by article
      const artOrc = orcamentoRecords.filter(r => {
        const arts = inferArtigosOrcamento(r);
        return arts.includes(art.numero);
      });
      const liquidado = artOrc.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
      const programas = new Set(artOrc.map(r => r.programa)).size;

      // Indicadores by article
      const artInd = indicadores.filter((ind: any) => ind.artigos_convencao?.includes(art.numero));

      const base = {
        numero: art.numero,
        titulo: art.titulo,
        tituloCompleto: art.tituloCompleto,
        cor: art.cor,
        lacunasTotal: artLacunas.length,
        lacunasCumpridas: cumpridas,
        lacunasParciais: parciais,
        lacunasNaoCumpridas: naoCumpridas,
        lacunasRetrocesso: retrocesso,
        fiosTotal: artFios.length,
        fiosAvanco,
        fiosRetrocesso,
        conclusoesAvanco: concAvanco,
        conclusoesRetrocesso: concRetrocesso,
        conclusoesLacuna: concLacuna,
        orcamentoLiquidado: liquidado,
        orcamentoProgramas: programas,
        indicadoresCount: artInd.length,
      };

      const grau = computeAdherenceScore(base);
      const trend = determineTrend(base);
      const result: ArtigoAnalysis = { ...base, grauAderencia: grau, tendencia: trend, veredito: '' };
      result.veredito = generateVerdict(result);
      return result;
    });
  }, [fiosCondutores, conclusoes, lacunas, orcamentoRecords, indicadores]);

  const radarData = analysis.map(a => ({
    artigo: `Art. ${a.numero}`,
    aderencia: a.grauAderencia,
    lacunas: a.lacunasTotal,
    orcamento: Math.min(100, a.orcamentoProgramas * 15),
  }));

  const barData = analysis.map(a => ({
    artigo: `Art. ${a.numero}`,
    cumprido: a.lacunasCumpridas,
    parcial: a.lacunasParciais,
    nao_cumprido: a.lacunasNaoCumpridas,
    retrocesso: a.lacunasRetrocesso,
  }));

  const sorted = [...analysis].sort((a, b) => b.grauAderencia - a.grauAderencia);
  const maisPriorizados = sorted.slice(0, 3);
  const menosPriorizados = sorted.slice(-3).reverse();

  const avgAdherencia = Math.round(analysis.reduce((s, a) => s + a.grauAderencia, 0) / analysis.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Scale className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Aderência do Estado Brasileiro aos Artigos da Convenção ICERD</p>
              <p className="text-sm text-muted-foreground mt-1">
                Avaliação consolidada do grau de cobertura de cada artigo (I-VII) pelo Estado brasileiro,
                cruzando {stats?.total || 0} lacunas ONU, {fiosCondutores.length} fios condutores,
                {conclusoes.length} conclusões analíticas, {orcamentoRecords.length} registros orçamentários
                e {indicadores.length} indicadores interseccionais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-primary/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Aderência Média</p>
            <p className="text-2xl font-bold text-primary">{avgAdherencia}%</p>
            <p className="text-xs text-muted-foreground">dos 7 artigos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Mais Priorizado</p>
            <p className="text-lg font-bold">Art. {maisPriorizados[0]?.numero}</p>
            <p className="text-xs text-success">{maisPriorizados[0]?.grauAderencia}%</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Menos Priorizado</p>
            <p className="text-lg font-bold">Art. {menosPriorizados[0]?.numero}</p>
            <p className="text-xs text-destructive">{menosPriorizados[0]?.grauAderencia}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Art. com Tendência ↑</p>
            <p className="text-lg font-bold">{analysis.filter(a => a.tendencia === 'melhora').length}</p>
            <p className="text-xs text-muted-foreground">de 7 artigos</p>
          </CardContent>
        </Card>
      </div>

      {/* Radar + Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Radar de Aderência por Artigo</CardTitle>
            <CardDescription className="text-xs">
              Escala 0-100 integrando lacunas ONU, orçamento, conclusões e evidências
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="artigo" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar name="Aderência (%)" dataKey="aderencia" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status de Cumprimento por Artigo</CardTitle>
            <CardDescription className="text-xs">
              Distribuição das lacunas ONU vinculadas a cada artigo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="artigo" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="cumprido" name="Cumprido" stackId="a" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="parcial" name="Parcial" stackId="a" fill="hsl(var(--chart-4))" />
                  <Bar dataKey="nao_cumprido" name="Não Cumprido" stackId="a" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="retrocesso" name="Retrocesso" stackId="a" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail per article */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          Avaliação Detalhada por Artigo
        </h3>
        {analysis.map(a => (
          <Card key={a.numero} className="border-l-4" style={{ borderLeftColor: a.cor }}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0"
                    style={{ backgroundColor: a.cor }}
                  >
                    {a.numero}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{a.tituloCompleto}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {a.tendencia === 'melhora' && <Badge className="bg-success/10 text-success border-success/30 text-[10px]" variant="outline"><TrendingUp className="w-3 h-3 mr-1" />Melhora</Badge>}
                      {a.tendencia === 'piora' && <Badge className="bg-destructive/10 text-destructive border-destructive/30 text-[10px]" variant="outline"><TrendingDown className="w-3 h-3 mr-1" />Piora</Badge>}
                      {a.tendencia === 'estagnacao' && <Badge className="bg-muted text-muted-foreground text-[10px]" variant="outline"><Minus className="w-3 h-3 mr-1" />Estagnação</Badge>}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold" style={{ color: a.grauAderencia >= 60 ? 'hsl(var(--chart-2))' : a.grauAderencia >= 30 ? 'hsl(var(--chart-4))' : 'hsl(var(--destructive))' }}>
                    {a.grauAderencia}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">aderência</p>
                </div>
              </div>

              <Progress value={a.grauAderencia} className="h-2 mb-3" />

              {/* Metrics grid */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold">{a.lacunasTotal}</p>
                  <p className="text-[10px] text-muted-foreground">Lacunas ONU</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold text-success">{a.lacunasCumpridas + a.lacunasParciais}</p>
                  <p className="text-[10px] text-muted-foreground">Atendidas</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold">{a.orcamentoProgramas}</p>
                  <p className="text-[10px] text-muted-foreground">Programas</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold">{a.fiosTotal}</p>
                  <p className="text-[10px] text-muted-foreground">Fios Condutores</p>
                </div>
                <div className="bg-muted/50 rounded p-2 text-center">
                  <p className="text-lg font-bold">{a.indicadoresCount}</p>
                  <p className="text-[10px] text-muted-foreground">Indicadores</p>
                </div>
              </div>

              {a.orcamentoLiquidado > 0 && (
                <p className="text-xs text-muted-foreground mb-2">
                  💰 Investimento liquidado vinculado: <strong>{formatCompact(a.orcamentoLiquidado)}</strong>
                </p>
              )}

              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground leading-relaxed">{a.veredito}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary verdict */}
      <Card className="border-2 border-primary">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="w-5 h-5 text-primary" />
            Síntese: Priorização Histórica dos Artigos pelo Estado Brasileiro
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
              <p className="text-xs font-bold text-success mb-2">✓ ARTIGOS MAIS PRIORIZADOS</p>
              <ul className="space-y-1">
                {maisPriorizados.map(a => (
                  <li key={a.numero} className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>Art. {a.numero} — {a.titulo}</span>
                    <Badge variant="outline" className="text-[10px]">{a.grauAderencia}%</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="text-xs font-bold text-destructive mb-2">✗ ARTIGOS MENOS PRIORIZADOS</p>
              <ul className="space-y-1">
                {menosPriorizados.map(a => (
                  <li key={a.numero} className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>Art. {a.numero} — {a.titulo}</span>
                    <Badge variant="destructive" className="text-[10px]">{a.grauAderencia}%</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>⚖️ Conclusão:</strong> A aderência média do Estado brasileiro à Convenção ICERD é de <strong>{avgAdherencia}%</strong>.
              {avgAdherencia < 50
                ? ` Este índice revela que a maioria dos compromissos do tratado permanece sem cobertura adequada em termos de políticas públicas, orçamento e resultados mensuráveis. Os artigos ${menosPriorizados.map(a => a.numero).join(', ')} apresentam as maiores lacunas de implementação.`
                : ` Embora existam avanços em artigos específicos (${maisPriorizados.map(a => a.numero).join(', ')}), a cobertura permanece desigual entre os compromissos, com os artigos ${menosPriorizados.map(a => a.numero).join(', ')} exigindo atenção prioritária.`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

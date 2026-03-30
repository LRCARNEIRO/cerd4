import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Gauge, AlertTriangle, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { SectionHeader } from './BaseEvidenciasSection';

const EIXOS_IEAT = [
  { eixo: 'Saúde', orcamentoVar: 12.3, indicadorVar: -2.1, eficacia: 'Crítica', color: 'destructive' as const, retornoPorReal: -0.17 },
  { eixo: 'Educação', orcamentoVar: 8.7, indicadorVar: 40.7, eficacia: 'Alta', color: 'success' as const, retornoPorReal: 4.68 },
  { eixo: 'Segurança Pública', orcamentoVar: 5.2, indicadorVar: 1.7, eficacia: 'Baixa', color: 'warning' as const, retornoPorReal: 0.33 },
  { eixo: 'Trabalho e Renda', orcamentoVar: 15.1, indicadorVar: 49.0, eficacia: 'Alta', color: 'success' as const, retornoPorReal: 3.25 },
];

const colorMap = {
  success: { bg: 'bg-[hsl(145,55%,32%)]/10', text: 'text-[hsl(145,55%,32%)]', bar: 'hsl(145,55%,32%)' },
  warning: { bg: 'bg-[hsl(45,93%,47%)]/10', text: 'text-[hsl(45,93%,47%)]', bar: 'hsl(45,93%,47%)' },
  destructive: { bg: 'bg-destructive/10', text: 'text-destructive', bar: 'hsl(0,72%,50%)' },
};

function GaugeChart({ value, max, label, color, alert }: { value: number; max: number; label: string; color: string; alert?: boolean }) {
  const clampedValue = Math.max(-max, Math.min(max, value));
  const percentage = ((clampedValue + max) / (2 * max)); // 0 to 1, 0.5 = center
  const angle = -90 + percentage * 180; // -90 to 90 degrees
  const radius = 58;
  const cx = 70;
  const cy = 70;

  // Arc path for background
  const arcPath = (startAngle: number, endAngle: number, r: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const needleRad = (angle * Math.PI) / 180;
  const needleLen = radius - 12;
  const nx = cx + needleLen * Math.cos(needleRad);
  const ny = cy + needleLen * Math.sin(needleRad);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 140 85" className="w-full max-w-[160px]">
        {/* Background arc segments: red, yellow, green */}
        <path d={arcPath(-180, -120, radius)} fill="none" stroke="hsl(0,72%,50%)" strokeWidth="10" strokeLinecap="round" opacity="0.2" />
        <path d={arcPath(-120, -60, radius)} fill="none" stroke="hsl(45,93%,47%)" strokeWidth="10" strokeLinecap="round" opacity="0.2" />
        <path d={arcPath(-60, 0, radius)} fill="none" stroke="hsl(145,55%,32%)" strokeWidth="10" strokeLinecap="round" opacity="0.2" />
        {/* Needle */}
        <line x1={cx} y1={cy} x2={nx} y2={ny} stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <circle cx={cx} cy={cy} r="4" fill={color} />
        {/* Value */}
        <text x={cx} y={cy + 2} textAnchor="middle" fontSize="0" fill="transparent">.</text>
      </svg>
      <div className="text-center -mt-1">
        <span className="text-sm font-bold" style={{ color }}>{value > 0 ? '+' : ''}{value.toFixed(2)}</span>
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
          A cada 1 p.p. de aumento<br/>orçamentário, indicador moveu<br/><strong style={{ color }}>{value > 0 ? '+' : ''}{value.toFixed(2)} p.p.</strong>
        </p>
      </div>
      {alert && (
        <Badge className="bg-destructive/10 text-destructive border-0 text-[9px] gap-1 mt-0.5">
          <AlertTriangle className="w-2.5 h-2.5" />
          Eficiência Crítica
        </Badge>
      )}
    </div>
  );
}

export default function IEATSection() {
  return (
    <section id="ieat-racial" className="py-14 bg-background">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          number="05"
          title="Índice de Eficácia da Agenda Transversal (IEAT-Racial)"
          subtitle="Sistema de Validação da Agenda Transversal — Painel de Linha de Base e Eficiência (Marco Zero PPA 2024-2027)"
        />

        {/* Conceito institucional */}
        <Card className="mt-6 border-border/60 bg-muted/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs text-muted-foreground leading-relaxed space-y-1.5">
                <p className="text-foreground font-medium text-sm">
                  Primeiro sistema de validação da eficácia orçamentária racial do Brasil
                </p>
                <p>
                  2024 marca o primeiro ano em que o Brasil possui dados estruturados sobre quanto se investe
                  especificamente em igualdade racial via Agenda Transversal (PPA 2024-2027). Este módulo está
                  parametrizado para receber esses dados e calcular a eficácia imediata — cruzando a execução
                  orçamentária da Agenda Transversal com os indicadores finalísticos do CERD IV (2018-2024),
                  criando a <strong className="text-foreground">primeira métrica auditável de retorno social do gasto público racial</strong>.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gauge Charts Grid */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {EIXOS_IEAT.map((e) => {
            const c = colorMap[e.color];
            return (
              <Card key={e.eixo} className="border-border/60">
                <CardContent className="p-4 flex flex-col items-center">
                  <h4 className="text-xs font-semibold text-foreground mb-2">{e.eixo}</h4>
                  <GaugeChart
                    value={e.retornoPorReal}
                    max={5}
                    label={e.eixo}
                    color={c.bar}
                    alert={e.color === 'destructive'}
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Tabela resumo */}
        <Card className="mt-6 border-border/60">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="text-left font-medium text-muted-foreground px-4 py-3">Eixo Temático</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-3">Var. Orçamento</th>
                    <th className="text-right font-medium text-muted-foreground px-4 py-3">Var. Indicador</th>
                    <th className="text-center font-medium text-muted-foreground px-4 py-3">IEAT</th>
                    <th className="text-center font-medium text-muted-foreground px-4 py-3">Eficácia</th>
                    <th className="text-center font-medium text-muted-foreground px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {EIXOS_IEAT.map((e) => {
                    const c = colorMap[e.color];
                    const ieat = (e.indicadorVar / e.orcamentoVar).toFixed(2);
                    return (
                      <tr key={e.eixo} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3 font-medium text-foreground">{e.eixo}</td>
                        <td className="px-4 py-3 text-right text-muted-foreground">+{e.orcamentoVar}%</td>
                        <td className="px-4 py-3 text-right">
                          <span className={e.indicadorVar < 0 ? 'text-destructive' : 'text-[hsl(145,55%,32%)]'}>
                            {e.indicadorVar > 0 ? '+' : ''}{e.indicadorVar}%
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono font-semibold" style={{ color: c.bar }}>
                          {ieat}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={`${c.bg} ${c.text} border-0 text-[10px]`}>
                            {e.eficacia}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {e.color === 'destructive' ? (
                            <AlertTriangle className="w-3.5 h-3.5 text-destructive inline" />
                          ) : e.color === 'success' ? (
                            <TrendingUp className="w-3.5 h-3.5 text-[hsl(145,55%,32%)] inline" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-[hsl(45,93%,47%)] inline" />
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Detalhamento Metodológico */}
        <Card className="mt-6 border-border/60">
          <CardContent className="p-5 space-y-4">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Gauge className="w-4 h-4 text-primary" />
              Detalhamento Metodológico do IEAT-Racial
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-muted-foreground leading-relaxed">
              <div className="space-y-2">
                <p className="text-foreground font-medium text-[11px] uppercase tracking-wider">Fórmula de Cálculo</p>
                <div className="bg-muted/50 rounded-lg p-3 font-mono text-[11px]">
                  IEAT = (Δ% Indicador Social) ÷ (Δ% Orçamento Específico)
                </div>
                <p>
                  Quando o orçamento cresce e o indicador social estagna ou retrocede, o sistema emite
                  um <span className="text-destructive font-medium">"Alerta de Eficiência Crítica"</span>.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-foreground font-medium text-[11px] uppercase tracking-wider">Indicadores Selecionados</p>
                <ul className="space-y-1">
                  <li>• <strong className="text-foreground">Saúde:</strong> Mortalidade infantil negra (DataSUS/SIM) — Δ orçamento SESAI/FNS</li>
                  <li>• <strong className="text-foreground">Educação:</strong> % ensino superior negro (INEP/PNAD) — Δ orçamento MEC/SESU</li>
                  <li>• <strong className="text-foreground">Segurança:</strong> Taxa de homicídio negro (FBSP/Atlas) — Δ orçamento MJSP/SENASP</li>
                  <li>• <strong className="text-foreground">Trabalho:</strong> Renda média negra (PNAD Contínua/IBGE) — Δ orçamento MTE</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-foreground font-medium text-[11px] uppercase tracking-wider">Base Orçamentária</p>
                <ul className="space-y-1">
                  <li>• Relatório de Agendas Transversais — MPO 2024</li>
                  <li>• Execução LOA via SIOP/Portal da Transparência</li>
                  <li>• Recorte: dotações específicas por órgão responsável</li>
                  <li>• Período de referência: PPA 2024-2027 (Marco Zero)</li>
                </ul>
              </div>

              <div className="space-y-2">
                <p className="text-foreground font-medium text-[11px] uppercase tracking-wider">Limitações Técnicas</p>
                <ul className="space-y-1">
                  <li>• 2024 é o 1º ano com dados estruturados da Agenda Transversal</li>
                  <li>• Indicadores sociais possuem defasagem de 1-2 anos</li>
                  <li>• Causalidade orçamento→indicador não é direta (multifatorial)</li>
                  <li>• Valores de execução excluem Restos a Pagar</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="mt-5">
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link to="/orcamento">
              <Gauge className="w-3.5 h-3.5 mr-1.5" />
              Ver Módulo Orçamentário Completo
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

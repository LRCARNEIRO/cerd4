import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, AlertTriangle, TrendingUp, TrendingDown, Minus, FileText, CheckCircle2, PlusCircle, Layers } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { complementoCerd3Indicators, COMPLEMENTO_CERD3_STATS, type ComplementoIndicador } from './ComplementoCerd3Data';
import { cn } from '@/lib/utils';

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function TendenciaBadge({ t }: { t?: string }) {
  if (!t) return null;
  const map: Record<string, { icon: React.ReactNode; cls: string }> = {
    melhora: { icon: <TrendingUp className="w-3 h-3" />, cls: 'bg-success/10 text-success border-success/30' },
    piora: { icon: <TrendingDown className="w-3 h-3" />, cls: 'bg-destructive/10 text-destructive border-destructive/30' },
    'estável': { icon: <Minus className="w-3 h-3" />, cls: 'bg-muted text-muted-foreground' },
    'sub-registro': { icon: <AlertTriangle className="w-3 h-3" />, cls: 'bg-chart-4/10 text-chart-4 border-chart-4/30' },
  };
  const m = map[t] || map['estável']!;
  return <Badge variant="outline" className={cn('text-[10px] gap-1', m.cls)}>{m.icon} {t}</Badge>;
}

function extractTimeSeries(dados: Record<string, any>): { keys: string[]; years: string[]; chartData: Record<string, any>[] } | null {
  const excludeMeta = new Set([
    'nota', 'unidade', 'paragrafos_cerd', 'lacuna_desagregacao_racial', 'datamigra_bi_url',
    'escolas_em_territorios', 'alfabetizacao', 'por_regiao', 'religioes_vitimadas_2024',
    'pendente_extracao', 'fonte_extracao', 'marcos', 'pct_justica_estadual',
    'pct_sem_esgoto_adequado', 'pct_sem_agua_canalizada_TIs',
    'TIs_homologadas_total', 'TIs_em_estudo', 'TIs_declaradas_sem_homologacao',
    'titulos_emitidos_total', 'processos_abertos',
    'presos_negros', 'pct_mulheres_negras_presas',
    'processos_pendentes_acumulados',
  ]);

  const seriesKeys: string[] = [];
  const allYears = new Set<string>();

  for (const [k, v] of Object.entries(dados)) {
    if (excludeMeta.has(k)) continue;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      const subKeys = Object.keys(v);
      const yearsOnly = subKeys.filter(s => /^\d{4}$/.test(s));
      if (yearsOnly.length >= 2) {
        const firstVal = v[yearsOnly[0]];
        if (typeof firstVal === 'number' || typeof firstVal === 'string') {
          seriesKeys.push(k);
          yearsOnly.forEach(y => allYears.add(y));
        } else if (typeof firstVal === 'object' && firstVal !== null) {
          seriesKeys.push(k);
          yearsOnly.forEach(y => allYears.add(y));
        }
      }
    }
  }

  if (seriesKeys.length === 0 || allYears.size < 2) return null;

  const sortedYears = Array.from(allYears).sort();
  const flatKeys: string[] = [];

  const chartData = sortedYears.map(year => {
    const point: Record<string, any> = { ano: year };
    for (const sk of seriesKeys) {
      const val = dados[sk]?.[year];
      if (val === undefined || val === null) continue;
      if (typeof val === 'object' && !Array.isArray(val)) {
        for (const [race, rv] of Object.entries(val as Record<string, any>)) {
          const flatKey = `${sk.replace(/_/g, ' ')} — ${race}`;
          if (!flatKeys.includes(flatKey)) flatKeys.push(flatKey);
          if (typeof rv === 'number') point[flatKey] = rv;
        }
      } else {
        if (!flatKeys.includes(sk)) flatKeys.push(sk);
        point[sk] = typeof val === 'number' ? val : parseFloat(String(val));
      }
    }
    return point;
  });

  return { keys: flatKeys.length > 0 ? flatKeys : seriesKeys, years: sortedYears, chartData };
}

/** Renders chart + always renders table below it */
function SeriesChartWithTable({ dados }: { dados: Record<string, any> }) {
  const result = extractTimeSeries(dados);
  if (!result || result.chartData.length < 2) return null;

  return (
    <>
      <div className="h-56 mt-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={result.chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [
                typeof value === 'number' ? value.toLocaleString('pt-BR') : value,
                name.replace(/_/g, ' '),
              ]}
            />
            <Legend wrapperStyle={{ fontSize: '11px' }} formatter={v => v.replace(/_/g, ' ')} />
            {result.keys.map((key, idx) => (
              <Line key={key} type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Data table below chart */}
      <Table className="mt-3">
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Ano</TableHead>
            {result.keys.map(k => (
              <TableHead key={k} className="text-xs text-right">{k.replace(/_/g, ' ')}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.chartData.map((row, i) => (
            <TableRow key={i} className={cn(i % 2 === 0 && 'bg-muted/10')}>
              <TableCell className="text-xs font-bold">{row.ano}</TableCell>
              {result.keys.map(k => (
                <TableCell key={k} className="text-xs text-right tabular-nums font-semibold">
                  {row[k] != null ? (typeof row[k] === 'number' ? row[k].toLocaleString('pt-BR') : row[k]) : '—'}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </>
  );
}

function SnapshotTable({ dados }: { dados: Record<string, any> }) {
  const excludeMeta = new Set([
    'nota', 'unidade', 'paragrafos_cerd', 'lacuna_desagregacao_racial', 'datamigra_bi_url',
    'pendente_extracao', 'fonte_extracao', 'marcos',
  ]);
  const rows: { key: string; value: string }[] = [];

  for (const [k, v] of Object.entries(dados)) {
    if (excludeMeta.has(k)) continue;
    if (typeof v === 'number') {
      rows.push({ key: k.replace(/_/g, ' '), value: v.toLocaleString('pt-BR') });
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      const subKeys = Object.keys(v);
      if (subKeys.length > 0 && subKeys.every(s => /^\d{4}$/.test(s))) continue;
      for (const [sk, sv] of Object.entries(v as Record<string, any>)) {
        if (typeof sv === 'number') {
          rows.push({ key: `${k.replace(/_/g, ' ')} — ${sk.replace(/_/g, ' ')}`, value: sv.toLocaleString('pt-BR') });
        }
      }
    } else if (typeof v === 'boolean') {
      rows.push({ key: k.replace(/_/g, ' '), value: v ? 'Sim' : 'Não' });
    }
  }

  if (rows.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs">Métrica</TableHead>
          <TableHead className="text-xs text-right">Valor</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((r, i) => (
          <TableRow key={i} className={cn(i % 2 === 0 && 'bg-muted/10')}>
            <TableCell className="text-xs">{r.key}</TableCell>
            <TableCell className="text-xs text-right font-semibold tabular-nums">{r.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function MarcosTable({ marcos }: { marcos: { ano: number; descricao: string }[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs w-[15%]">Ano</TableHead>
          <TableHead className="text-xs">Marco</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {marcos.map((m, i) => (
          <TableRow key={i} className={cn(i % 2 === 0 && 'bg-muted/10')}>
            <TableCell className="text-xs font-bold">{m.ano}</TableCell>
            <TableCell className="text-xs">{m.descricao}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const areaLabels: Record<string, string> = {
  trabalho_renda: '⛓️ Trabalho (Infantil & Escravo)',
  cultura_patrimonio: '🙏 Intolerância Religiosa',
  educacao: '📚 Educação (Indígena & Distorção)',
  saude: '🏥 Saúde (Indígena & Materna)',
  legislacao_justica: '⚖️ Judiciário e Justiça Racial',
  participacao_social: '🗳️ Representatividade Política',
  seguranca_publica: '🔒 Sistema Prisional',
  habitacao: '🏠 Habitação, Favelas e Saneamento',
  Demografia: '📊 Censo 2022 — Dados Raciais Inéditos',
  Cultura: '🎭 Cultura',
  demografia: '🌐 Migração (Lacuna)',
  terra_territorio: '🗺️ Terra e Território',
};

function IndicadorCard({ ind }: { ind: ComplementoIndicador }) {
  const hasSeries = extractTimeSeries(ind.dados) !== null;
  const nota = (ind.dados as any).nota;
  const isPending = (ind.dados as any).pendente_extracao;
  const marcos = (ind.dados as any).marcos;

  return (
    <Card className={cn('overflow-hidden', isPending && 'border-l-4 border-l-chart-4')}>
      <CardHeader className="pb-2 border-b border-border/30">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <CardTitle className="text-sm font-semibold">{ind.nome}</CardTitle>
            {isPending && (
              <Badge variant="outline" className="text-[10px] bg-chart-4/10 text-chart-4 border-chart-4/30">
                ⏳ Pendente extração
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <TendenciaBadge t={ind.tendencia} />
            {ind.url_fonte && (
              <a href={ind.url_fonte} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> {ind.fonte}
              </a>
            )}
          </div>
        </div>
        {nota && <CardDescription className="text-xs mt-1">{nota}</CardDescription>}
      </CardHeader>
      <CardContent className="pt-3">
        {marcos && <MarcosTable marcos={marcos} />}
        {!marcos && hasSeries && <SeriesChartWithTable dados={ind.dados} />}
        {!marcos && !hasSeries && !isPending && <SnapshotTable dados={ind.dados} />}
        {isPending && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            <AlertTriangle className="w-5 h-5 mx-auto mb-2 text-chart-4" />
            <p>Dados disponíveis na fonte oficial — pendente extração manual</p>
            <p className="text-xs mt-1">{(ind.dados as any).fonte_extracao}</p>
          </div>
        )}

        <div className="flex flex-wrap gap-1 mt-3">
          {ind.artigos_convencao.map(a => (
            <Badge key={a} variant="outline" className="text-[10px]">{a}</Badge>
          ))}
          {ind.documento_origem.map(d => (
            <Badge key={d} variant="secondary" className="text-[10px]">{d}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AreaSection({ area, indicators }: { area: string; indicators: ComplementoIndicador[] }) {
  return (
    <Card>
      <CardHeader className="py-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{areaLabels[area] || area} ({indicators.length})</CardTitle>
          <div className="flex items-center gap-2">
            {indicators.some(i => (i.dados as any).pendente_extracao) && (
              <Badge variant="outline" className="text-[10px] bg-chart-4/10 text-chart-4">
                ⏳ {indicators.filter(i => (i.dados as any).pendente_extracao).length} pendente(s)
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        {indicators.map((ind, idx) => (
          <IndicadorCard key={idx} ind={ind} />
        ))}
      </CardContent>
    </Card>
  );
}

function groupByArea(indicators: ComplementoIndicador[]): Record<string, ComplementoIndicador[]> {
  const byArea: Record<string, ComplementoIndicador[]> = {};
  for (const ind of indicators) {
    if (!byArea[ind.categoria]) byArea[ind.categoria] = [];
    byArea[ind.categoria].push(ind);
  }
  return byArea;
}

export function ComplementoCerd3Tab() {
  const complementares = complementoCerd3Indicators.filter(i => i.tipo === 'complementar');
  const novos = complementoCerd3Indicators.filter(i => i.tipo === 'novo');

  const complementaresByArea = groupByArea(complementares);
  const novosByArea = groupByArea(novos);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-chart-4">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-chart-4 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Complemento CERD III — Indicadores Exclusivos</h3>
              <p className="text-sm text-muted-foreground">
                Contém <strong>{COMPLEMENTO_CERD3_STATS.total} indicadores</strong> que <strong>NÃO existem</strong> nas
                abas temáticas estáticas, divididos em duas subseções:
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-primary/10 text-primary border-primary/30" variant="outline">
                  <Layers className="w-3 h-3 mr-1" />
                  {complementares.length} Complementares — cobertura 100% CERD III
                </Badge>
                <Badge className="bg-chart-2/10 text-chart-2 border-chart-2/30" variant="outline">
                  <PlusCircle className="w-3 h-3 mr-1" />
                  {novos.length} Dados Novos — sugeridos por recomendações
                </Badge>
                <Badge className="bg-success/10 text-success border-success/30" variant="outline">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {COMPLEMENTO_CERD3_STATS.verificados} verificados
                </Badge>
                {COMPLEMENTO_CERD3_STATS.pendentes > 0 && (
                  <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/30" variant="outline">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {COMPLEMENTO_CERD3_STATS.pendentes} pendentes
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Arquivo-fonte: <code className="bg-muted px-1 rounded">ComplementoCerd3Data.ts</code>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SUBSEÇÃO 1: Complementares */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Layers className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold text-foreground">Dados Complementares ({complementares.length})</h2>
          <Badge variant="outline" className="text-[10px]">Preenche lacunas temáticas para cobertura 100% CERD III</Badge>
        </div>
        {Object.entries(complementaresByArea).map(([area, indicators]) => (
          <AreaSection key={area} area={area} indicators={indicators} />
        ))}
      </div>

      {/* SUBSEÇÃO 2: Dados Novos */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <PlusCircle className="w-5 h-5 text-chart-2" />
          <h2 className="text-lg font-bold text-foreground">Dados Novos ({novos.length})</h2>
          <Badge variant="outline" className="text-[10px]">Sugeridos por recomendações CERD / Observações Finais</Badge>
        </div>
        {Object.entries(novosByArea).map(([area, indicators]) => (
          <AreaSection key={area} area={area} indicators={indicators} />
        ))}
      </div>
    </div>
  );
}

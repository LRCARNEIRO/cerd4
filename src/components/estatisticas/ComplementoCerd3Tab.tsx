import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, AlertTriangle, TrendingUp, TrendingDown, Minus, FileText, CheckCircle2, PlusCircle, Layers } from 'lucide-react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Cell,
} from 'recharts';
import { complementoCerd3Indicators, COMPLEMENTO_CERD3_STATS, type ComplementoIndicador } from './ComplementoCerd3Data';
import { CensoDemografiaMapas } from './maps/CensoDemografiaMapas';
import { cn } from '@/lib/utils';

const COLOR_ABS = 'hsl(var(--chart-1))';
const COLOR_PCT = 'hsl(var(--chart-2))';
const COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--primary))',
];

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

interface DualAxisData {
  years: string[];
  chartData: Record<string, any>[];
  pctKeys: string[];
  absKeys: string[];
  singleScaleKeys: string[];
  singleLabel: string;
}

function isPctKey(key: string): boolean {
  return /^pct_|^razao_|_pct$|_razao$|_ratio$/.test(key);
}

function extractDualAxisData(dados: Record<string, any>): DualAxisData | null {
  const excludeMeta = new Set([
    'nota', 'unidade', 'paragrafos_cerd', 'lacuna_desagregacao_racial', 'datamigra_bi_url',
    'escolas_em_territorios', 'escolas_ensino_basico_em_territorios', 'escolas_ensino_fundamental_em_territorios',
    'alfabetizacao', 'por_regiao', 'religioes_vitimadas_2024',
    'pendente_extracao', 'fonte_extracao', 'marcos', 'pct_justica_estadual',
    'pct_sem_esgoto_adequado', 'pct_sem_agua_canalizada_TIs',
    'TIs_homologadas_total', 'TIs_em_estudo', 'TIs_declaradas_sem_homologacao',
    'TIs_homologadas_e_reservadas_total', 'TIs_em_identificacao',
    'titulos_emitidos_total', 'processos_abertos', 'processos_abertos_total',
    'presos_negros', 'pct_mulheres_negras_presas',
    'processos_pendentes_acumulados',
    'url_fonte_alfabetizacao_indigena', 'url_fonte_alfabetizacao_negros',
    'url_fonte_alfabetizacao_brancos', 'url_fonte_escolas',
    'url_nascidos_vivos', 'url_obitos_infantis',
    'obs_2022', 'lacuna_dados_regionais',
    'total_por_uf', 'em_territorios_por_uf', 'fora_territorios_por_uf',
    'em_TIs_por_uf', 'fora_TIs_por_uf',
    'naturalizados_brasileiros', 'taxa_naturalizados_pct', 'estrangeiros', 'taxa_estrangeiros_pct',
  ]);

  const pctSeriesKeys: string[] = [];
  const absSeriesKeys: string[] = [];
  const allYears = new Set<string>();

  for (const [k, v] of Object.entries(dados)) {
    if (excludeMeta.has(k)) continue;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      const subKeys = Object.keys(v);
      const yearsOnly = subKeys.filter(s => /^\d{4}$/.test(s));
      if (yearsOnly.length >= 2) {
        const firstVal = v[yearsOnly[0]];
        if (typeof firstVal === 'number' || typeof firstVal === 'string' || (typeof firstVal === 'object' && firstVal !== null)) {
          if (isPctKey(k)) pctSeriesKeys.push(k);
          else absSeriesKeys.push(k);
          yearsOnly.forEach(y => allYears.add(y));
        }
      }
    }
  }

  if ((pctSeriesKeys.length + absSeriesKeys.length) === 0 || allYears.size < 2) return null;

  const sortedYears = Array.from(allYears).sort();

  const pctDisplayKeys: string[] = [];
  const absDisplayKeys: string[] = [];

  const chartData = sortedYears.map(year => {
    const point: Record<string, any> = { ano: year };
    for (const sk of [...pctSeriesKeys, ...absSeriesKeys]) {
      const val = dados[sk]?.[year];
      if (val === undefined || val === null) continue;
      const isPct = isPctKey(sk);
      if (typeof val === 'object' && !Array.isArray(val)) {
        for (const [race, rv] of Object.entries(val as Record<string, any>)) {
          const flatKey = `${sk.replace(/_/g, ' ')} — ${race}`;
          if (isPct) { if (!pctDisplayKeys.includes(flatKey)) pctDisplayKeys.push(flatKey); }
          else { if (!absDisplayKeys.includes(flatKey)) absDisplayKeys.push(flatKey); }
          if (typeof rv === 'number') point[flatKey] = rv;
        }
      } else {
        const displayKey = sk.replace(/_/g, ' ');
        if (isPct) { if (!pctDisplayKeys.includes(displayKey)) pctDisplayKeys.push(displayKey); }
        else { if (!absDisplayKeys.includes(displayKey)) absDisplayKeys.push(displayKey); }
        point[displayKey] = typeof val === 'number' ? val : parseFloat(String(val));
      }
    }
    return point;
  });

  return {
    years: sortedYears,
    chartData,
    pctKeys: pctDisplayKeys,
    absKeys: absDisplayKeys,
    singleScaleKeys: pctDisplayKeys.length > 0 && absDisplayKeys.length === 0 ? pctDisplayKeys
      : absDisplayKeys.length > 0 && pctDisplayKeys.length === 0 ? absDisplayKeys : [],
    singleLabel: pctDisplayKeys.length > 0 && absDisplayKeys.length === 0 ? '%'
      : absDisplayKeys.length > 0 && pctDisplayKeys.length === 0 ? 'absoluto' : '',
  };
}

/** Dual-axis chart: bars for absolute (left Y), line for % (right Y). Single-scale fallback for uniform data. */
function DualAxisChart({ data }: { data: DualAxisData }) {
  if (data.chartData.length < 2) return null;

  const isDual = data.pctKeys.length > 0 && data.absKeys.length > 0;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data.chartData} margin={{ top: 8, right: isDual ? 60 : 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="ano" tick={{ fontSize: 11 }} />

          {isDual ? (
            <>
              {/* Left Y — absolute */}
              <YAxis
                yAxisId="abs"
                tick={{ fontSize: 10 }}
                tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
                label={{ value: 'Qtd', angle: -90, position: 'insideLeft', style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }}
              />
              {/* Right Y — % */}
              <YAxis
                yAxisId="pct"
                orientation="right"
                tick={{ fontSize: 10 }}
                tickFormatter={v => `${v}%`}
                domain={[0, 100]}
                label={{ value: '%', angle: 90, position: 'insideRight', style: { fontSize: 10, fill: 'hsl(var(--muted-foreground))' } }}
              />
            </>
          ) : (
            <YAxis
              yAxisId="single"
              tick={{ fontSize: 10 }}
              tickFormatter={v => data.singleLabel === '%' ? `${v}%` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
          )}

          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value: number, name: string) => {
              const isPct = data.pctKeys.includes(name);
              return [
                isPct ? `${value.toLocaleString('pt-BR')}%` : value.toLocaleString('pt-BR'),
                name,
              ];
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />

          {/* Absolute series as bars */}
          {isDual && data.absKeys.map((key, idx) => (
            <Bar key={key} yAxisId="abs" dataKey={key} fill={COLORS[idx % COLORS.length]} fillOpacity={0.7} barSize={28} radius={[4, 4, 0, 0]} />
          ))}
          {/* % series as lines */}
          {isDual && data.pctKeys.map((key, idx) => (
            <Line key={key} yAxisId="pct" type="monotone" dataKey={key} stroke={COLORS[(data.absKeys.length + idx) % COLORS.length]} strokeWidth={2.5} dot={{ r: 4, strokeWidth: 2, fill: 'hsl(var(--card))' }} />
          ))}

          {/* Single-scale fallback: use lines */}
          {!isDual && data.singleScaleKeys.map((key, idx) => (
            <Line key={key} yAxisId="single" type="monotone" dataKey={key} stroke={COLORS[idx % COLORS.length]} strokeWidth={2} dot={{ r: 3 }} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Unified table with all metrics — both % and absolute side by side */
function UnifiedTable({ data }: { data: DualAxisData }) {
  const allKeys = [...data.absKeys, ...data.pctKeys];
  if (data.singleScaleKeys.length > 0 && allKeys.length === 0) {
    allKeys.push(...data.singleScaleKeys);
  }
  if (allKeys.length === 0) return null;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="text-xs w-[60px]">Ano</TableHead>
          {allKeys.map(k => (
            <TableHead key={k} className="text-xs text-right">
              {k}
              {data.pctKeys.includes(k) && <span className="text-muted-foreground ml-1">(%)</span>}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.chartData.map((row, i) => (
          <TableRow key={i} className={cn(i % 2 === 0 && 'bg-muted/10')}>
            <TableCell className="text-xs font-bold">{row.ano}</TableCell>
            {allKeys.map(k => {
              const isPct = data.pctKeys.includes(k);
              return (
                <TableCell key={k} className="text-xs text-right tabular-nums font-semibold">
                  {row[k] != null
                    ? isPct
                      ? `${typeof row[k] === 'number' ? row[k].toLocaleString('pt-BR') : row[k]}%`
                      : typeof row[k] === 'number' ? row[k].toLocaleString('pt-BR') : row[k]
                    : '—'}
                </TableCell>
              );
            })}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

/** Renders a dual-axis chart + unified table */
function SeriesChartWithTable({ dados }: { dados: Record<string, any> }) {
  const data = extractDualAxisData(dados);
  if (!data) return null;

  const isDual = data.pctKeys.length > 0 && data.absKeys.length > 0;

  return (
    <div className="space-y-3 mt-3">
      {isDual && (
        <Badge variant="outline" className="text-[10px]">
          📊 Gráfico duplo eixo — barras = quantitativo · linha = percentual
        </Badge>
      )}
      <DualAxisChart data={data} />
      <UnifiedTable data={data} />
    </div>
  );
}

/** Extract distribution/composition data (non-time-series, race-based breakdowns) for bar charts */
interface DistributionData {
  chartData: { name: string; value: number; pct?: number }[];
  label: string;
  hasPct: boolean;
}

function extractDistributionData(dados: Record<string, any>): DistributionData | null {
  const excludeMeta = new Set([
    'nota', 'unidade', 'paragrafos_cerd', 'lacuna_desagregacao_racial', 'datamigra_bi_url',
    'pendente_extracao', 'fonte_extracao', 'marcos', 'observacao_metodologica',
    'total_moradores', 'pct_negros', 'total_resgatados_2002_2024', 'pct_negros_resgatados_2002_2024',
  ]);

  // Pattern 1: paired abs + pct objects (e.g. resgatados_2002_2024 + pct_resgatados_2002_2024)
  const absKey = Object.keys(dados).find(k =>
    !excludeMeta.has(k) && !k.startsWith('url_') && !isPctKey(k) &&
    typeof dados[k] === 'object' && dados[k] !== null && !Array.isArray(dados[k]) &&
    !Object.keys(dados[k]).every((s: string) => /^\d{4}$/.test(s))
  );

  if (absKey) {
    const absObj = dados[absKey] as Record<string, any>;
    // Check if values are simple numbers (not nested objects)
    const entries = Object.entries(absObj).filter(([, v]) => typeof v === 'number');
    if (entries.length >= 3) {
      // Look for matching pct key
      const pctKey = Object.keys(dados).find(k =>
        isPctKey(k) && typeof dados[k] === 'object' && dados[k] !== null &&
        !Object.keys(dados[k]).every((s: string) => /^\d{4}$/.test(s))
      );
      const pctObj = pctKey ? dados[pctKey] as Record<string, number> : null;

      const chartData = entries.map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value: value as number,
        pct: pctObj?.[name],
      })).sort((a, b) => b.value - a.value);

      return { chartData, label: absKey.replace(/_/g, ' '), hasPct: !!pctObj };
    }
  }

  // Pattern 2: nested { absoluto, pct } objects (e.g. por_raca)
  const nestedKey = Object.keys(dados).find(k =>
    !excludeMeta.has(k) && typeof dados[k] === 'object' && dados[k] !== null &&
    Object.values(dados[k] as Record<string, any>).some(
      (v: any) => typeof v === 'object' && v !== null && 'absoluto' in v && 'pct' in v
    )
  );

  if (nestedKey) {
    const obj = dados[nestedKey] as Record<string, { absoluto: number; pct: number }>;
    const chartData = Object.entries(obj)
      .filter(([, v]) => typeof v === 'object' && 'absoluto' in v)
      .map(([name, v]) => ({
        name: name.replace(/_/g, ' '),
        value: v.absoluto,
        pct: v.pct,
      }))
      .sort((a, b) => b.value - a.value);

    if (chartData.length >= 2) {
      return { chartData, label: nestedKey.replace(/_/g, ' '), hasPct: true };
    }
  }

  // Pattern 3: single pct object with race keys (e.g. pct_sem_esgoto_adequado)
  const pctOnlyKey = Object.keys(dados).find(k =>
    !excludeMeta.has(k) && !k.startsWith('url_') && isPctKey(k) &&
    typeof dados[k] === 'object' && dados[k] !== null && !Array.isArray(dados[k]) &&
    !Object.keys(dados[k]).every((s: string) => /^\d{4}$/.test(s))
  );

  if (pctOnlyKey) {
    const obj = dados[pctOnlyKey] as Record<string, number>;
    const entries = Object.entries(obj).filter(([, v]) => typeof v === 'number');
    if (entries.length >= 2) {
      const chartData = entries.map(([name, value]) => ({
        name: name.replace(/_/g, ' '),
        value,
      })).sort((a, b) => b.value - a.value);
      return { chartData, label: pctOnlyKey.replace(/_/g, ' '), hasPct: false };
    }
  }

  return null;
}

/** Horizontal bar chart for race/category distribution data */
function DistributionChart({ data }: { data: DistributionData }) {
  if (data.chartData.length < 2) return null;

  return (
    <div className="space-y-3 mt-3">
      <Badge variant="outline" className="text-[10px]">
        📊 Distribuição por categoria — {data.label}
      </Badge>
      <div style={{ height: Math.max(200, data.chartData.length * 40 + 60) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.chartData} layout="vertical" margin={{ top: 5, right: 80, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis type="number" tick={{ fontSize: 10 }}
              tickFormatter={v => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
            />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={90} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string, props: any) => {
                const parts: string[] = [value.toLocaleString('pt-BR')];
                if (props.payload?.pct != null) parts.push(`(${props.payload.pct}%)`);
                return [parts.join(' '), name];
              }}
            />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24} label={{ position: 'right', fontSize: 10, formatter: (v: number) => v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v) }}>
              {data.chartData.map((_, idx) => (
                <Cell key={idx} fill={COLORS[idx % COLORS.length]} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* Table below */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs">Categoria</TableHead>
            <TableHead className="text-xs text-right">Valor</TableHead>
            {data.hasPct && <TableHead className="text-xs text-right">%</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.chartData.map((r, i) => (
            <TableRow key={i} className={cn(i % 2 === 0 && 'bg-muted/10')}>
              <TableCell className="text-xs capitalize">{r.name}</TableCell>
              <TableCell className="text-xs text-right font-semibold tabular-nums">{r.value.toLocaleString('pt-BR')}</TableCell>
              {data.hasPct && <TableCell className="text-xs text-right tabular-nums">{r.pct != null ? `${r.pct}%` : '—'}</TableCell>}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function SnapshotTable({ dados }: { dados: Record<string, any> }) {
  const excludeMeta = new Set([
    'nota', 'unidade', 'paragrafos_cerd', 'lacuna_desagregacao_racial', 'datamigra_bi_url',
    'pendente_extracao', 'fonte_extracao', 'marcos', 'observacao_metodologica',
  ]);
  const rows: { key: string; value: string }[] = [];

  for (const [k, v] of Object.entries(dados)) {
    if (excludeMeta.has(k)) continue;
    if (k.startsWith('url_')) continue;
    if (typeof v === 'number') {
      rows.push({ key: k.replace(/_/g, ' '), value: v.toLocaleString('pt-BR') });
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      const subKeys = Object.keys(v);
      if (subKeys.length > 0 && subKeys.every(s => /^\d{4}$/.test(s))) continue;
      // Skip objects already handled by distribution chart
      if (subKeys.some(s => typeof (v as any)[s] === 'object' && (v as any)[s]?.absoluto != null)) continue;
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
  const dualData = extractDualAxisData(ind.dados);
  const hasSeries = dualData !== null;
  const distData = !hasSeries ? extractDistributionData(ind.dados) : null;
  const hasDist = distData !== null;
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
        {!marcos && !hasSeries && hasDist && <DistributionChart data={distData!} />}
        {!marcos && !hasSeries && !hasDist && !isPending && <SnapshotTable dados={ind.dados} />}
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
                  ✅ Auditado Manualmente — 17/03/2026 · {COMPLEMENTO_CERD3_STATS.verificados} verificados
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

      {/* MAPAS INTERATIVOS — Censo 2022 */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
          <h2 className="text-lg font-bold text-foreground">🗺️ Mapas Demográficos — Censo 2022</h2>
          <Badge variant="outline" className="text-[10px]">Quilombolas · Indígenas em TIs</Badge>
        </div>
        <CensoDemografiaMapas />
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

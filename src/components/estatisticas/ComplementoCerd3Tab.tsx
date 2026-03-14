import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink, AlertTriangle, TrendingUp, TrendingDown, Minus, FileText } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { complementoCerd3Indicators } from './ComplementoCerd3Data';
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
  const m = map[t] || map['estável'];
  return <Badge variant="outline" className={cn('text-[10px] gap-1', m.cls)}>{m.icon} {t}</Badge>;
}

function extractTimeSeries(dados: Record<string, any>): { keys: string[]; years: string[]; chartData: Record<string, any>[] } | null {
  const excludeMeta = new Set(['nota', 'unidade', 'paragrafos_cerd', 'lacuna_desagregacao_racial', 'datamigra_bi_url', 'escolas_em_territorios', 'alfabetizacao', 'por_regiao', 'religioes_vitimadas_2024']);
  const seriesKeys: string[] = [];
  const allYears = new Set<string>();

  for (const [k, v] of Object.entries(dados)) {
    if (excludeMeta.has(k)) continue;
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      const subKeys = Object.keys(v);
      const yearsOnly = subKeys.filter(s => /^\d{4}$/.test(s));
      if (yearsOnly.length >= 2) {
        // Check if values under years are primitive
        const firstVal = v[yearsOnly[0]];
        if (typeof firstVal === 'number' || typeof firstVal === 'string') {
          seriesKeys.push(k);
          yearsOnly.forEach(y => allYears.add(y));
        } else if (typeof firstVal === 'object' && firstVal !== null) {
          // Doubly nested (e.g. fundamental -> year -> {race: val})
          seriesKeys.push(k);
          yearsOnly.forEach(y => allYears.add(y));
        }
      }
    }
  }

  if (seriesKeys.length === 0 || allYears.size < 2) return null;

  const sortedYears = Array.from(allYears).sort();
  const flatKeys: string[] = [];

  // Detect doubly nested
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

function SeriesChart({ dados }: { dados: Record<string, any> }) {
  const result = extractTimeSeries(dados);
  if (!result || result.chartData.length < 2) return null;

  return (
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
  );
}

function SnapshotTable({ dados, label }: { dados: Record<string, any>; label: string }) {
  const excludeMeta = new Set(['nota', 'unidade', 'paragrafos_cerd', 'lacuna_desagregacao_racial', 'datamigra_bi_url']);
  const rows: { key: string; value: string }[] = [];

  for (const [k, v] of Object.entries(dados)) {
    if (excludeMeta.has(k)) continue;
    if (typeof v === 'number') {
      rows.push({ key: k.replace(/_/g, ' '), value: v.toLocaleString('pt-BR') });
    } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      const subKeys = Object.keys(v);
      if (subKeys.length > 0 && subKeys.every(s => /^\d{4}$/.test(s))) continue; // skip series
      // Flat object like alfabetizacao or por_regiao
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

export function ComplementoCerd3Tab() {
  // Group by area
  const byArea: Record<string, typeof complementoCerd3Indicators> = {};
  for (const ind of complementoCerd3Indicators) {
    const area = ind.categoria;
    if (!byArea[area]) byArea[area] = [];
    byArea[area].push(ind);
  }

  const areaLabels: Record<string, string> = {
    trabalho_renda: '⛓️ Trabalho (Infantil & Escravo)',
    cultura_patrimonio: '🙏 Cultura e Patrimônio',
    educacao: '📚 Educação',
    saude: '🏥 Saúde',
    legislacao_justica: '⚖️ Legislação e Justiça',
    Demografia: '📊 Demografia (Censo 2022)',
    Cultura: '🎭 Cultura',
    demografia: '🌐 Demografia (Lacunas)',
    terra_territorio: '🗺️ Terra e Território',
  };

  const totalAuditados = complementoCerd3Indicators.length; // all hardcoded = auditados

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
                Contém <strong>{complementoCerd3Indicators.length} indicadores</strong> que <strong>NÃO existem</strong> nas 
                abas temáticas estáticas, preenchendo lacunas específicas identificadas no cruzamento com o III Relatório CERD.
                Todos os dados são espelhados no banco de dados (Espelho Seguro).
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-chart-4/10 text-chart-4 border-chart-4/30" variant="outline">
                  {complementoCerd3Indicators.length} indicadores exclusivos
                </Badge>
                <Badge className="bg-success/10 text-success border-success/30" variant="outline">
                  {totalAuditados} auditados
                </Badge>
                <Badge variant="outline">Lacunas CERD III</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* By area */}
      {Object.entries(byArea).map(([area, indicators]) => (
        <div key={area} className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-1 bg-chart-4 rounded-full" />
            <h3 className="text-lg font-semibold">{areaLabels[area] || area} ({indicators.length})</h3>
          </div>

          {indicators.map((ind, idx) => {
            const hasSeries = extractTimeSeries(ind.dados) !== null;
            const nota = (ind.dados as any).nota;

            return (
              <Card key={idx} className="overflow-hidden">
                <CardHeader className="pb-2 border-b border-border/30">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-sm font-semibold">{ind.nome}</CardTitle>
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
                  <CardDescription className="text-xs mt-1">{nota}</CardDescription>
                </CardHeader>
                <CardContent className="pt-3">
                  {hasSeries && <SeriesChart dados={ind.dados} />}
                  {!hasSeries && <SnapshotTable dados={ind.dados} label={ind.nome} />}

                  {/* Artigos & docs */}
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
          })}
        </div>
      ))}
    </div>
  );
}

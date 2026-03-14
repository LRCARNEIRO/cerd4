import { useState, useRef, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { BarChart3, TrendingUp, FileText, Layers, Users, Activity, ExternalLink, BookOpen, Download, Printer, Search, CheckCircle2, CircleDashed, AlertTriangle, Plus } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { injectExportToolbar } from '@/utils/reportExportToolbar';

const COLORS = [
  'hsl(var(--chart-1))', 
  'hsl(var(--chart-2))', 
  'hsl(var(--chart-3))', 
  'hsl(var(--chart-4))', 
  'hsl(var(--chart-5))'
];

const RACE_COLORS: Record<string, string> = {
  'negros': '#3b82f6',
  'brancos': '#94a3b8',
  'negras': '#3b82f6',
  'brancas': '#94a3b8',
  'homens_negros_15_29': '#1e40af',
  'homens_brancos_15_29': '#64748b',
  'mulheres_negras': '#7c3aed',
  'mulheres_brancas': '#cbd5e1',
  'jovens_negros_15_29': '#2563eb',
  'indigenas': '#16a34a',
  'geral': '#6b7280',
};

interface IndicadorData {
  id: string;
  nome: string;
  categoria: string;
  subcategoria?: string;
  fonte: string;
  url_fonte?: string;
  tendencia?: string;
  dados: Record<string, Record<string, number>>;
  desagregacao_raca?: boolean;
  desagregacao_genero?: boolean;
  desagregacao_idade?: boolean;
  desagregacao_classe?: boolean;
  desagregacao_territorio?: boolean;
  desagregacao_deficiencia?: boolean;
  desagregacao_orientacao_sexual?: boolean;
  documento_origem?: string[];
  auditado_manualmente?: boolean;
  data_auditoria?: string;
}

const DOCUMENTOS_FILTRO = [
  'Todos',
  'CERD Observações Finais 2022',
  'Plano de Durban',
  'Recomendações Gerais (RGs)',
  'Follow-up 2026',
];

function formatGroupName(key: string): string {
  const labels: Record<string, string> = {
    negros: 'Negros',
    brancos: 'Brancos',
    negras: 'Negras',
    brancas: 'Brancas',
    homens_negros_15_29: 'Homens Negros 15-29',
    homens_brancos_15_29: 'Homens Brancos 15-29',
    mulheres_negras: 'Mulheres Negras',
    mulheres_brancas: 'Mulheres Brancas',
    jovens_negros_15_29: 'Jovens Negros 15-29',
    indigenas: 'Indígenas',
    geral: 'Geral',
    total: 'Total',
    razao_negros_brancos: 'Razão Negros/Brancos',
    razao_negras_brancas: 'Razão Negras/Brancas',
    vitimas_negras_percentual: '% Vítimas Negras',
    idade_media_vitima: 'Idade Média Vítima',
  };
  return labels[key] || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// Detect if top-level keys are years (numeric strings like "2016", "2020")
function isYearKey(key: string): boolean {
  return /^\d{4}$/.test(key);
}

// Normalize data: always returns { groups: string[], years: string[], chartData: Record[] }
function normalizeIndicadorData(dados: Record<string, any>) {
  // ODS Racial indicators wrap data inside a "series" key — unwrap it
  const excludeMetaKeys = new Set([
    'por_uf_2024', 'idade_media_vitima', 'unidade', 'slug', 'formato',
    'ods_id', 'nota', 'serie', 'fonte', 'url', 'artigoCerd',
    'regra_ouro', 'status_validacao', 'nota_racial', 'nota_refugio',
    'nota_registros', 'datamigra_bi_url', 'deep_links', 'lacuna_racial',
  ]);

  // If dados has a "series" sub-object with year keys, use that as the effective data
  let effective: Record<string, any> = dados;
  if (dados.series && typeof dados.series === 'object' && !Array.isArray(dados.series)) {
    effective = dados.series;
  }

  const objectKeys = Object.keys(effective).filter(
    key => typeof effective[key] === 'object' && effective[key] !== null && !Array.isArray(effective[key]) && !excludeMetaKeys.has(key)
  );

  if (objectKeys.length === 0) return { groups: [], years: [], chartData: [] };

  const topKeysAreYears = objectKeys.every(isYearKey);

  if (topKeysAreYears) {
    // Transpose: top-level = years, sub-keys = metrics/groups
    const sortedYears = objectKeys.sort();
    const metricsSet = new Set<string>();
    sortedYears.forEach(year => {
      Object.keys(effective[year] || {}).forEach(m => {
        if (!excludeMetaKeys.has(m) && m !== 'nota') metricsSet.add(m);
      });
    });
    const groups = Array.from(metricsSet);
    const chartData = sortedYears.map(year => {
      const point: Record<string, any> = { ano: year };
      groups.forEach(metric => {
        const val = effective[year]?.[metric];
        if (val !== undefined && val !== null) {
          point[metric] = val;
        }
      });
      return point;
    });
    return { groups, years: sortedYears, chartData };
  } else {
    // Standard: top-level = groups, sub-keys = years
    const allYears = new Set<string>();
    objectKeys.forEach(group => {
      Object.keys(effective[group] || {}).forEach(year => {
        if (isYearKey(year)) allYears.add(year);
      });
    });
    const sortedYears = Array.from(allYears).sort();
    const chartData = sortedYears.map(year => {
      const point: Record<string, any> = { ano: year };
      objectKeys.forEach(group => {
        const val = effective[group]?.[year];
        if (val !== undefined && val !== null) {
          point[group] = val;
        }
      });
      return point;
    });
    return { groups: objectKeys, years: sortedYears, chartData };
  }
}

// Detect if indicator has a real time series (≥2 data points)
function hasTimeSeries(dados: Record<string, any>): boolean {
  const { years } = normalizeIndicadorData(dados || {});
  return years.length >= 2;
}

function IndicadorChart({ indicador }: { indicador: IndicadorData }) {
  const { groups, chartData } = normalizeIndicadorData(indicador.dados || {});

  if (chartData.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        Dados não disponíveis para visualização
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '12px'
            }}
            formatter={(value: number, name: string) => [
              typeof value === 'number' ? value.toLocaleString('pt-BR') : value,
              formatGroupName(name)
            ]}
          />
          <Legend 
            formatter={(value) => formatGroupName(value)}
            wrapperStyle={{ fontSize: '11px' }}
          />
          {groups.map((group, idx) => (
            <Line 
              key={group}
              type="monotone" 
              dataKey={group} 
              stroke={RACE_COLORS[group] || COLORS[idx % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ============================
// RETRATO PONTUAL — Quadro comparativo Brancos × Negros
// ============================

interface RacialComparison {
  indicador: IndicadorData;
  ano: string;
  negros: number | null;
  brancos: number | null;
  indigenas: number | null;
  nacional: number | null;
  unidade: string;
  razao: number | null; // negros/brancos ratio
}

function extractRacialComparison(ind: IndicadorData): RacialComparison | null {
  const dados = ind.dados as Record<string, any>;
  if (!dados) return null;

  let negros: number | null = null;
  let brancos: number | null = null;
  let indigenas: number | null = null;
  let nacional: number | null = null;
  let ano = '';
  let unidade = (dados.unidade as string) || '%';

  // Strategy 1: top-level keys like { Negros: { 2022: val }, Brancos: { 2022: val } }
  for (const [key, val] of Object.entries(dados)) {
    const keyLower = key.toLowerCase();
    if (keyLower === 'unidade' || keyLower === 'nota' || keyLower.startsWith('nota_') || keyLower.startsWith('fonte_') || keyLower.endsWith('_url') || keyLower === 'slug' || keyLower === 'formato' || keyLower === 'regra_ouro' || keyLower === 'deep_links' || keyLower === 'lacuna_racial') continue;

    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      // Get last year value
      const entries = Object.entries(val as Record<string, any>)
        .filter(([k, v]) => /^\d{4}$/.test(k) && v !== null && v !== undefined && !String(v).includes('N/D'))
        .sort(([a], [b]) => Number(b) - Number(a));
      
      if (entries.length === 0) continue;
      const [lastYear, lastVal] = entries[0];
      const numVal = typeof lastVal === 'number' ? lastVal : parseFloat(String(lastVal).replace(/\./g, '').replace(',', '.'));
      if (isNaN(numVal)) continue;

      if (!ano || Number(lastYear) > Number(ano)) ano = lastYear;

      if (keyLower.includes('negro') || keyLower.includes('pret') || keyLower.includes('pard')) {
        negros = numVal;
      } else if (keyLower.includes('branco')) {
        brancos = numVal;
      } else if (keyLower.includes('indíg') || keyLower.includes('indigena')) {
        indigenas = numVal;
      } else if (keyLower.includes('nacional') || keyLower.includes('geral') || keyLower.includes('total')) {
        nacional = numVal;
      }
    } else if (typeof val === 'number') {
      // Simple key-value
      if (keyLower.includes('negro') || keyLower.includes('pret')) {
        negros = val;
      } else if (keyLower.includes('branco')) {
        brancos = val;
      } else if (keyLower.includes('indíg') || keyLower.includes('indigena')) {
        indigenas = val;
      } else if (keyLower.includes('nacional') || keyLower.includes('geral') || keyLower.includes('total')) {
        nacional = val;
      }
    }
  }

  // Strategy 2: year-keyed { 2022: { Negros: val, Brancos: val } }
  if (negros === null && brancos === null) {
    const yearKeys = Object.keys(dados).filter(k => /^\d{4}$/.test(k)).sort((a, b) => Number(b) - Number(a));
    for (const yk of yearKeys) {
      const yearData = dados[yk];
      if (typeof yearData !== 'object' || yearData === null) continue;
      for (const [rk, rv] of Object.entries(yearData as Record<string, any>)) {
        const rkLower = rk.toLowerCase();
        const numV = typeof rv === 'number' ? rv : parseFloat(String(rv).replace(/\./g, '').replace(',', '.'));
        if (isNaN(numV)) continue;
        if (rkLower.includes('negro') || rkLower.includes('pret')) negros = numV;
        else if (rkLower.includes('branco')) brancos = numV;
        else if (rkLower.includes('indíg') || rkLower.includes('indigena')) indigenas = numV;
        else if (rkLower.includes('nacional') || rkLower.includes('geral')) nacional = numV;
      }
      if (negros !== null || brancos !== null) { ano = yk; break; }
    }
  }

  if (negros === null && brancos === null && indigenas === null && nacional === null) return null;

  const razao = (negros !== null && brancos !== null && brancos > 0) ? negros / brancos : null;

  return { indicador: ind, ano, negros, brancos, indigenas, nacional, unidade, razao };
}

function formatNum(val: number | null, large = false): string {
  if (val === null) return '—';
  if (large || val >= 10000) return val.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  return val.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

function RetratoPontualSection({ indicadores }: { indicadores: IndicadorData[] }) {
  const { comparisons, noComparison, themeGroups } = useMemo(() => {
    const comps: RacialComparison[] = [];
    const noComp: IndicadorData[] = [];
    for (const ind of indicadores) {
      const comp = extractRacialComparison(ind);
      if (comp) comps.push(comp);
      else noComp.push(ind);
    }
    comps.sort((a, b) => a.indicador.categoria.localeCompare(b.indicador.categoria));

    // Group by subcategoria or categoria for thematic storytelling
    const groups: Record<string, RacialComparison[]> = {};
    for (const c of comps) {
      const theme = c.indicador.subcategoria || c.indicador.categoria;
      if (!groups[theme]) groups[theme] = [];
      groups[theme].push(c);
    }
    return { comparisons: comps, noComparison: noComp, themeGroups: groups };
  }, [indicadores]);

  if (indicadores.length === 0) return null;

  const withRatio = comparisons.filter(c => c.razao !== null);
  const avgRatio = withRatio.length > 0 
    ? withRatio.reduce((sum, c) => sum + c.razao!, 0) / withRatio.length 
    : null;
  const worstDisparity = withRatio.length > 0
    ? withRatio.reduce((worst, c) => Math.abs(c.razao! - 1) > Math.abs(worst.razao! - 1) ? c : worst)
    : null;

  // Theme labels
  const themeLabels: Record<string, string> = {
    saneamento: '🚰 Saneamento Básico',
    saneamento_tradicional: '🏘️ Comunidades Tradicionais',
    deficit_habitacional: '🏠 Déficit Habitacional',
    favelas: '🏙️ Favelas e Aglomerados',
    favelas_aglomerados: '🏙️ Favelas e Aglomerados',
    patrimonio: '🏛️ Patrimônio Cultural',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="h-8 w-1 bg-accent rounded-full" />
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Layers className="w-5 h-5 text-accent" />
            Retrato Racial — Dados Pontuais ({indicadores.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Indicadores que revelam a desigualdade estrutural num instante do tempo
          </p>
        </div>
      </div>

      {/* Hero narrative card */}
      {avgRatio !== null && worstDisparity && (
        <Card className="overflow-hidden border-none shadow-lg">
          <div className="bg-gradient-to-br from-primary/10 via-destructive/5 to-accent/10 p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Key stat */}
              <div className="flex flex-col items-center justify-center text-center">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-medium mb-1">Razão Média de Disparidade</p>
                <p className={cn(
                  "text-5xl font-black tabular-nums",
                  avgRatio > 1.3 ? "text-destructive" : avgRatio > 1.1 ? "text-chart-4" : "text-success"
                )}>
                  {avgRatio.toFixed(2)}×
                </p>
                <p className="text-xs text-muted-foreground mt-1">Negro / Branco</p>
              </div>

              {/* Worst disparity callout */}
              <div className="md:col-span-2 flex flex-col justify-center">
                <p className="text-sm font-semibold text-foreground mb-2">
                  📊 O que os dados contam
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Em <span className="font-bold text-foreground">{withRatio.length} indicadores</span> com dados raciais comparáveis, 
                  a população negra apresenta sistematicamente piores condições. 
                  A maior disparidade está em{' '}
                  <span className="font-bold text-destructive">{worstDisparity.indicador.nome}</span>{' '}
                  (razão {worstDisparity.razao!.toFixed(2)}×), seguida por padrões persistentes em saneamento, 
                  habitação e acesso a serviços básicos — evidência de racismo estrutural que o Estado deve responder ao CERD.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Themed visual cards with horizontal bar charts */}
      {Object.entries(themeGroups).map(([theme, comps]) => {
        const label = themeLabels[theme] || theme.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Build bar data for the group
        const barData = comps.map(c => ({
          nome: c.indicador.nome.replace(/—.*$/, '').trim().slice(0, 35),
          Brancos: c.brancos,
          Negros: c.negros,
          'Indígenas em TIs': c.indigenas,
          Nacional: c.nacional,
          razao: c.razao,
          ano: c.ano,
          url: c.indicador.url_fonte,
          fonte: c.indicador.fonte,
        }));

        // Narrative insight for the group
        const groupWithRatio = comps.filter(c => c.razao !== null);
        const avgGroupRatio = groupWithRatio.length > 0
          ? groupWithRatio.reduce((s, c) => s + c.razao!, 0) / groupWithRatio.length
          : null;
        const hasIndigenas = comps.some(c => c.indigenas !== null);
        const worstInGroup = groupWithRatio.length > 0
          ? groupWithRatio.reduce((w, c) => Math.abs(c.razao! - 1) > Math.abs(w.razao! - 1) ? c : w)
          : null;

        return (
          <Card key={theme} className="overflow-hidden">
            <CardHeader className="pb-2 border-b border-border/30 bg-muted/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{label}</CardTitle>
                <Badge variant="outline" className="text-[10px]">
                  {comps.length} indicador{comps.length > 1 ? 'es' : ''} · {comps[0]?.ano || '—'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              {/* Horizontal bar chart */}
              <div style={{ height: Math.max(comps.length * 60 + 40, 140) }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 16, top: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="nome" width={160} tick={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '11px'
                      }}
                      formatter={(value: number, name: string) => [
                        typeof value === 'number' ? value.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '—',
                        name
                      ]}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Brancos" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={14} />
                    <Bar dataKey="Negros" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />
                    {hasIndigenas && (
                      <Bar dataKey="Indígenas em TIs" fill="#16a34a" radius={[0, 4, 4, 0]} barSize={14} />
                    )}
                    <Bar dataKey="Nacional" fill="#a3a3a3" radius={[0, 4, 4, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Narrative insight box */}
              <div className="rounded-lg border bg-gradient-to-r from-primary/5 to-transparent p-3">
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">💡 Conclusão: </span>
                  {avgGroupRatio !== null && avgGroupRatio > 1 ? (
                    <>
                      Neste eixo, a população negra apresenta indicadores {avgGroupRatio > 1.3 ? 'significativamente' : 'moderadamente'} piores 
                      que a branca (razão média {avgGroupRatio.toFixed(2)}×).
                      {worstInGroup && <> O indicador mais crítico é <strong>{worstInGroup.indicador.nome}</strong> ({worstInGroup.razao!.toFixed(2)}×).</>}
                    </>
                  ) : avgGroupRatio !== null && avgGroupRatio < 1 ? (
                    <>
                      Neste eixo, a população negra apresenta taxa {((1 - avgGroupRatio) * 100).toFixed(0)}% menor que a branca — 
                      indicando déficit de acesso.
                    </>
                  ) : hasIndigenas ? (
                    <>Dados inéditos do Censo 2022 revelam disparidades extremas para populações indígenas em TIs e comunidades quilombolas.</>
                  ) : (
                    <>Dados pontuais sem comparação racial direta disponível.</>
                  )}
                </p>
              </div>

              {/* Source links row */}
              <div className="flex flex-wrap gap-2">
                {comps.map(c => (
                  <div key={c.indicador.id} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <span className="font-medium">{c.indicador.nome.split('—')[0].trim().slice(0, 25)}:</span>
                    {c.indicador.url_fonte ? (
                      <a href={c.indicador.url_fonte} target="_blank" rel="noopener noreferrer" 
                         className="text-primary hover:underline inline-flex items-center gap-0.5">
                        <ExternalLink className="w-2.5 h-2.5" /> {c.indicador.fonte}
                      </a>
                    ) : (
                      <span>{c.indicador.fonte}</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Non-comparable indicators */}
      {noComparison.length > 0 && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-3 bg-muted/20 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-muted-foreground" />
              <CardTitle className="text-sm text-muted-foreground">Sem desagregação racial comparável ({noComparison.length})</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-semibold text-xs w-[35%]">Indicador</TableHead>
                    <TableHead className="text-xs text-center">Ano</TableHead>
                    <TableHead className="text-xs">Valores</TableHead>
                    <TableHead className="text-xs w-[15%]">Fonte</TableHead>
                    <TableHead className="text-xs text-center w-12">🔗</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {noComparison.map((ind, idx) => {
                    const kvs = extractKeyValues(ind.dados || {});
                    const { years } = normalizeIndicadorData(ind.dados || {});
                    return (
                      <TableRow key={ind.id} id={`indicador-${ind.id}`} className={cn(idx % 2 === 0 && 'bg-muted/10')}>
                        <TableCell className="py-2.5">
                          <p className="text-xs font-medium leading-tight">{ind.nome}</p>
                          {ind.subcategoria && <span className="text-[10px] text-muted-foreground">{ind.subcategoria}</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="text-[10px] px-1.5">{years.length > 0 ? years.join(', ') : '—'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {kvs.length > 0 ? kvs.map((kv, i) => (
                              <span key={i} className="inline-flex items-center gap-1 text-[10px] bg-secondary/60 text-secondary-foreground px-1.5 py-0.5 rounded">
                                <span className="font-medium">{kv.label}{kv.sublabel ? ` (${kv.sublabel})` : ''}:</span> {kv.value}
                              </span>
                            )) : <span className="text-[10px] text-muted-foreground italic">⏳ Pendente</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={ind.fonte}>{ind.fonte}</TableCell>
                        <TableCell className="text-center">
                          {ind.url_fonte ? (
                            <a href={ind.url_fonte} target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80">
                              <ExternalLink className="w-3.5 h-3.5 inline" />
                            </a>
                          ) : <span className="text-muted-foreground/50">—</span>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Keep extractKeyValues for the non-comparable table
function extractKeyValues(dados: Record<string, any>): Array<{ label: string; value: string; sublabel?: string }> {
  const results: Array<{ label: string; value: string; sublabel?: string }> = [];
  for (const [key, val] of Object.entries(dados)) {
    if (key === 'unidade' || key === 'nota' || key === 'serie' || key.startsWith('nota_') || key.startsWith('fonte_') || key.endsWith('_url') || key === 'slug' || key === 'formato' || key === 'regra_ouro' || key === 'deep_links' || key === 'lacuna_racial') continue;
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      for (const [subKey, subVal] of Object.entries(val as Record<string, any>)) {
        if (subVal === null || subVal === undefined || String(subVal).includes('N/D')) continue;
        if (typeof subVal === 'number' || (typeof subVal === 'string' && !subVal.startsWith('⏳'))) {
          const formattedVal = typeof subVal === 'number'
            ? subVal >= 1000 ? subVal.toLocaleString('pt-BR') : subVal.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
            : subVal;
          results.push({ label: formatGroupName(key), value: String(formattedVal), sublabel: subKey });
        }
      }
    } else if (typeof val === 'number') {
      results.push({ label: formatGroupName(key), value: val >= 1000 ? val.toLocaleString('pt-BR') : val.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) });
    }
  }
  return results.slice(0, 12);
}

function IndicadorTable({ indicador }: { indicador: IndicadorData }) {
  const { groups, years: sortedYears, chartData } = normalizeIndicadorData(indicador.dados || {});

  if (groups.length === 0) {
    return <div className="text-center py-4 text-muted-foreground text-sm">Dados não disponíveis</div>;
  }

  // Calculate variation per group using normalized chartData
  const getVariation = (group: string) => {
    const values = chartData
      .filter(d => d[group] !== undefined)
      .map(d => d[group] as number);
    if (values.length < 2) return null;
    const first = values[0];
    const last = values[values.length - 1];
    if (first === 0) return null;
    return ((last - first) / first * 100).toFixed(1);
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold">Grupo</TableHead>
            {sortedYears.map(year => (
              <TableHead key={year} className="text-center">{year}</TableHead>
            ))}
            <TableHead className="text-center">Variação</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map(group => {
            const variation = getVariation(group);
            return (
              <TableRow key={group}>
                <TableCell className="font-medium">{formatGroupName(group)}</TableCell>
                {sortedYears.map((year, yi) => {
                  const row = chartData[yi];
                  const val = row?.[group];
                  return (
                    <TableCell key={year} className="text-center">
                      {val !== undefined
                        ? typeof val === 'number'
                          ? val.toLocaleString('pt-BR')
                          : typeof val === 'object' && val !== null
                            ? JSON.stringify(val)
                            : String(val)
                        : '-'}
                    </TableCell>
                  );
                })}
                <TableCell className="text-center">
                  {variation !== null && (
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        parseFloat(variation) < 0 && indicador.categoria !== 'Segurança Pública' && "text-destructive border-destructive",
                        parseFloat(variation) > 0 && indicador.categoria !== 'Segurança Pública' && "text-success border-success",
                        parseFloat(variation) < 0 && indicador.categoria === 'Segurança Pública' && "text-success border-success",
                        parseFloat(variation) > 0 && indicador.categoria === 'Segurança Pública' && "text-destructive border-destructive",
                      )}
                    >
                      {parseFloat(variation) > 0 ? '+' : ''}{variation}%
                    </Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      {/* Interpretação compacta */}
      {groups.length > 0 && sortedYears.length >= 2 && (
        <div className="mt-3 p-3 bg-accent/30 rounded-lg border border-accent/50">
          <p className="text-xs font-semibold text-foreground mb-1">📊 Interpretação ({sortedYears[0]}→{sortedYears[sortedYears.length - 1]}):</p>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {(() => {
              const interpretations = groups.map(group => {
                const vals = chartData.filter(d => d[group] != null).map(d => d[group] as number);
                if (vals.length < 2) return null;
                const first = vals[0];
                const last = vals[vals.length - 1];
                const diff = last - first;
                const pct = first !== 0 ? ((diff / first) * 100).toFixed(1) : null;
                const label = formatGroupName(group);
                const isSeguranca = indicador.categoria === 'Segurança Pública';
                const direction = diff > 0
                  ? (isSeguranca ? 'piorou' : 'melhorou')
                  : diff < 0
                    ? (isSeguranca ? 'melhorou' : 'piorou')
                    : 'manteve-se estável';
                return `${label}: de ${first.toLocaleString('pt-BR')} para ${last.toLocaleString('pt-BR')} (${pct ? `${parseFloat(pct) > 0 ? '+' : ''}${pct}%` : 'var. n/d'}, ${direction})`;
              }).filter(Boolean);
              return interpretations.length > 0
                ? interpretations.join('. ') + '.'
                : 'Dados insuficientes para interpretação.';
            })()}
          </p>
        </div>
      )}
      <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/50 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="w-3.5 h-3.5" />
            <span className="font-medium">Fonte:</span>
            <span>{indicador.fonte}</span>
          </div>
          {indicador.url_fonte && (
            <a 
              href={indicador.url_fonte} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
            >
              <ExternalLink className="w-3 h-3" />
              Verificar na fonte oficial
            </a>
          )}
        </div>
        {indicador.documento_origem && indicador.documento_origem.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              Documento(s) de origem:
            </span>
            {indicador.documento_origem.map((doc, i) => (
              <Badge key={i} variant="outline" className="text-[10px] px-1.5 py-0">
                {doc}
              </Badge>
            ))}
          </div>
        )}
        {indicador.url_fonte && (
          <p className="text-[10px] text-muted-foreground/70 italic truncate">
            🔗 {indicador.url_fonte}
          </p>
        )}
      </div>
    </div>
  );
}

function IndicadorDetail({ indicador, highlighted }: { indicador: IndicadorData; highlighted?: boolean }) {
  return (
    <Card id={`indicador-${indicador.id}`} className={cn("mb-4 indicador-card transition-all duration-700", highlighted && "ring-2 ring-primary shadow-lg shadow-primary/20")}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              {indicador.nome}
              {indicador.auditado_manualmente ? (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5 bg-success/10 text-success border-success/30">
                  <CheckCircle2 className="w-3 h-3" /> Auditado
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 gap-0.5 bg-chart-4/10 text-chart-4 border-chart-4/30">
                  <CircleDashed className="w-3 h-3" /> Pendente
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="text-sm">
              {indicador.categoria}{indicador.subcategoria ? ` • ${indicador.subcategoria}` : ''}
              {' • '}<span className="font-medium">{indicador.fonte}</span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {indicador.tendencia && (
              <Badge 
                variant="outline"
                className={cn(
                  "text-xs",
                  indicador.tendencia.includes('melhora') && "border-success text-success",
                  indicador.tendencia.includes('piora') && "border-destructive text-destructive",
                  indicador.tendencia.includes('estável') && "border-muted-foreground text-muted-foreground"
                )}
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                {indicador.tendencia}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <IndicadorChart indicador={indicador} />
        <IndicadorTable indicador={indicador} />
      </CardContent>
    </Card>
  );
}

function SummaryCards({ indicadores }: { indicadores: IndicadorData[] }) {
  // Calculate summary stats
  const porCategoria = indicadores.reduce((acc, ind) => {
    acc[ind.categoria] = (acc[ind.categoria] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const desagregacoes = {
    raca: indicadores.filter(i => i.desagregacao_raca).length,
    genero: indicadores.filter(i => i.desagregacao_genero).length,
    idade: indicadores.filter(i => i.desagregacao_idade).length,
    territorio: indicadores.filter(i => i.desagregacao_territorio).length,
  };

  const categoriaData = Object.entries(porCategoria)
    .map(([categoria, quantidade]) => ({ categoria, quantidade }))
    .sort((a, b) => b.quantidade - a.quantidade);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <p className="text-xs text-muted-foreground">Total de Indicadores</p>
          </div>
          <p className="text-2xl font-bold">{indicadores.length}</p>
          <p className="text-xs text-muted-foreground mt-1">com dados desagregados</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-chart-1">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-chart-1" />
            <p className="text-xs text-muted-foreground">Categorias</p>
          </div>
          <p className="text-2xl font-bold">{Object.keys(porCategoria).length}</p>
          <p className="text-xs text-muted-foreground mt-1">áreas temáticas</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-success">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-success" />
            <p className="text-xs text-muted-foreground">Desagregação Racial</p>
          </div>
          <p className="text-2xl font-bold text-success">{desagregacoes.raca}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {indicadores.length > 0 ? `${((desagregacoes.raca / indicadores.length) * 100).toFixed(0)}% do total` : ''}
          </p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-chart-2">
        <CardContent className="pt-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-chart-2" />
            <p className="text-xs text-muted-foreground">Fontes Oficiais</p>
          </div>
          <p className="text-2xl font-bold">
            {new Set(indicadores.map(i => i.fonte)).size}
          </p>
          <p className="text-xs text-muted-foreground mt-1">instituições</p>
        </CardContent>
      </Card>
    </div>
  );
}

function generateIndicadoresHTML(indicadores: IndicadorData[]): string {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  
  const categorias = [...new Set(indicadores.map(i => i.categoria))].sort();
  
  let html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Inventário de Indicadores Interseccionais — CERD IV Brasil</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 900px; margin: 0 auto; padding: 24px; color: #1e293b; font-size: 13px; }
  h1 { font-size: 20px; border-bottom: 3px solid #1e3a5f; padding-bottom: 8px; }
  h2 { font-size: 16px; color: #1e3a5f; margin-top: 28px; border-left: 4px solid #1e3a5f; padding-left: 8px; }
  h3 { font-size: 14px; margin-top: 16px; }
  .meta { color: #64748b; font-size: 11px; margin-bottom: 4px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 600; margin-right: 4px; }
  .badge-melhora { background: #dcfce7; color: #166534; }
  .badge-piora { background: #fee2e2; color: #991b1b; }
  .badge-estavel { background: #f1f5f9; color: #475569; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0 4px; font-size: 12px; }
  th, td { border: 1px solid #e2e8f0; padding: 4px 8px; text-align: center; }
  th { background: #f1f5f9; font-weight: 600; }
  td:first-child, th:first-child { text-align: left; }
  .interpretation { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 6px 10px; margin: 6px 0; font-size: 11px; }
  .fonte { font-size: 10px; color: #64748b; margin-top: 4px; }
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 16px; page-break-inside: avoid; }
  .summary { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 20px; }
  .summary-item { flex: 1; min-width: 150px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
  .summary-item .value { font-size: 24px; font-weight: 700; color: #1e3a5f; }
  .summary-item .label { font-size: 11px; color: #64748b; }
  @media print { body { padding: 0; } .no-print { display: none !important; } }
  @page { margin: 1.5cm; }
</style></head><body>
<h1>Inventário de Indicadores Interseccionais</h1>
<p class="meta">IV Relatório Periódico do Brasil ao CERD (2018-2025) — Gerado em ${now}</p>
<p class="meta">${indicadores.length} indicadores em ${categorias.length} categorias temáticas</p>

<div class="summary">
  <div class="summary-item"><div class="value">${indicadores.length}</div><div class="label">Indicadores</div></div>
  <div class="summary-item"><div class="value">${categorias.length}</div><div class="label">Categorias</div></div>
  <div class="summary-item"><div class="value">${indicadores.filter(i => i.desagregacao_raca).length}</div><div class="label">Desagregação Racial</div></div>
  <div class="summary-item"><div class="value">${new Set(indicadores.map(i => i.fonte)).size}</div><div class="label">Fontes Oficiais</div></div>
</div>
`;

  for (const cat of categorias) {
    const catInds = indicadores.filter(i => i.categoria === cat);
    html += `<h2>${cat} (${catInds.length} indicadores)</h2>`;
    
    for (const ind of catInds) {
      const { groups, years, chartData } = normalizeIndicadorData(ind.dados || {});
      const tendBadge = ind.tendencia
        ? `<span class="badge ${ind.tendencia.includes('melhora') ? 'badge-melhora' : ind.tendencia.includes('piora') ? 'badge-piora' : 'badge-estavel'}">${ind.tendencia}</span>`
        : '';
      
      html += `<div class="card">
<h3>${ind.nome} ${tendBadge}</h3>
<p class="meta">${ind.subcategoria ? ind.subcategoria + ' • ' : ''}${ind.fonte}</p>`;
      
      if (groups.length > 0 && years.length > 0) {
        html += `<table><thead><tr><th>Grupo</th>`;
        years.forEach(y => { html += `<th>${y}</th>`; });
        html += `<th>Var.</th></tr></thead><tbody>`;
        
        for (const group of groups) {
          const vals = chartData.filter(d => d[group] !== undefined).map(d => d[group] as number);
          let variation = '';
          if (vals.length >= 2 && vals[0] !== 0) {
            const pct = ((vals[vals.length - 1] - vals[0]) / vals[0] * 100).toFixed(1);
            variation = `${parseFloat(pct) > 0 ? '+' : ''}${pct}%`;
          }
          html += `<tr><td>${formatGroupName(group)}</td>`;
          years.forEach((_, yi) => {
            const val = chartData[yi]?.[group];
            html += `<td>${val !== undefined ? (typeof val === 'number' ? val.toLocaleString('pt-BR') : val) : '-'}</td>`;
          });
          html += `<td>${variation}</td></tr>`;
        }
        html += `</tbody></table>`;
        
        // Interpretation
        if (years.length >= 2) {
          const interps = groups.map(group => {
            const vals = chartData.filter(d => d[group] != null).map(d => d[group] as number);
            if (vals.length < 2) return null;
            const first = vals[0], last = vals[vals.length - 1];
            const diff = last - first;
            const pct = first !== 0 ? ((diff / first) * 100).toFixed(1) : null;
            const isSeg = ind.categoria === 'Segurança Pública';
            const dir = diff > 0 ? (isSeg ? 'piorou' : 'melhorou') : diff < 0 ? (isSeg ? 'melhorou' : 'piorou') : 'estável';
            return `${formatGroupName(group)}: ${first.toLocaleString('pt-BR')} → ${last.toLocaleString('pt-BR')} (${pct ? `${parseFloat(pct) > 0 ? '+' : ''}${pct}%` : 'n/d'}, ${dir})`;
          }).filter(Boolean);
          if (interps.length > 0) {
            html += `<div class="interpretation">📊 <strong>Interpretação (${years[0]}→${years[years.length - 1]}):</strong> ${interps.join('. ')}.</div>`;
          }
        }
      } else {
        html += `<p class="meta">Dados não disponíveis para visualização tabular.</p>`;
      }
      
      html += `<p class="fonte">Fonte: ${ind.fonte}${ind.url_fonte ? ` — ${ind.url_fonte}` : ''}</p>`;
      if (ind.documento_origem?.length) {
        html += `<p class="fonte">Documentos: ${ind.documento_origem.join(', ')}</p>`;
      }
      html += `</div>`;
    }
  }

  html += `</body></html>`;
  return html;
}

interface IndicadoresDbTabProps {
  filtroAuditoria?: 'todos' | 'auditados' | 'pendentes';
}

export function IndicadoresDbTab({ filtroAuditoria = 'todos' }: IndicadoresDbTabProps) {
  const { data: indicadores, isLoading } = useIndicadoresInterseccionais();
  const [categoriaAtiva, setCategoriaAtiva] = useState<string>('todas');
  const [documentoAtivo, setDocumentoAtivo] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const typedIndicadores = (indicadores || []) as IndicadorData[];

  // Search results — must be before early return
  const searchResults = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    const term = searchTerm.toLowerCase();
    return typedIndicadores.filter(i =>
      i.nome.toLowerCase().includes(term) ||
      i.categoria.toLowerCase().includes(term) ||
      (i.subcategoria || '').toLowerCase().includes(term) ||
      i.fonte.toLowerCase().includes(term)
    ).slice(0, 10);
  }, [typedIndicadores, searchTerm]);

  const handleSelectResult = useCallback((ind: IndicadorData) => {
    setCategoriaAtiva('todas');
    setDocumentoAtivo('Todos');
    setSearchTerm('');
    setHighlightedId(ind.id);
    setTimeout(() => {
      const el = document.getElementById(`indicador-${ind.id}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => setHighlightedId(null), 3000);
      }
    }, 100);
  }, []);

  const handleExportPDF = useCallback(() => {
    const html = generateIndicadoresHTML(typedIndicadores);
    const finalHtml = injectExportToolbar(html, 'Inventario-Indicadores-CERD-IV');
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(finalHtml);
      w.document.close();
    }
  }, [typedIndicadores]);

  const handleExportDOCX = useCallback(() => {
    const html = generateIndicadoresHTML(typedIndicadores);
    try {
      const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Inventario-Indicadores-CERD-IV.doc';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      toast.success('Documento DOCX gerado com sucesso');
    } catch (e) {
      toast.error('Erro ao gerar documento');
    }
  }, [typedIndicadores]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  // Get unique categories
  const categorias = ['todas', ...new Set(typedIndicadores.map(i => i.categoria))];
  
  // Filter by category and document
  const indicadoresFiltrados = typedIndicadores.filter(i => {
    const catMatch = categoriaAtiva === 'todas' || i.categoria === categoriaAtiva;
    const docMatch = documentoAtivo === 'Todos' || (i.documento_origem || []).includes(documentoAtivo);
    const auditMatch = filtroAuditoria === 'todos' 
      || (filtroAuditoria === 'auditados' && i.auditado_manualmente)
      || (filtroAuditoria === 'pendentes' && !i.auditado_manualmente);
    return catMatch && docMatch && auditMatch;
  });

  const totalAuditados = typedIndicadores.filter(i => i.auditado_manualmente).length;
  const totalPendentes = typedIndicadores.length - totalAuditados;

  return (
    <div className="space-y-6">
      {/* Export toolbar */}
      <div className="flex items-center justify-end gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
          <Printer className="w-4 h-4" />
          Exportar PDF
        </Button>
        <Button variant="outline" size="sm" onClick={handleExportDOCX} className="gap-2">
          <Download className="w-4 h-4" />
          Exportar DOCX
        </Button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar indicador por nome, categoria ou fonte..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {searchResults.length > 0 && (
          <div className="absolute z-50 mt-1 w-full bg-popover border border-border rounded-md shadow-lg max-h-80 overflow-y-auto">
            {searchResults.map(ind => (
              <button
                key={ind.id}
                className="w-full text-left px-4 py-3 hover:bg-accent/50 border-b border-border/50 last:border-b-0 transition-colors"
                onClick={() => handleSelectResult(ind)}
              >
                <p className="text-sm font-medium text-foreground">{ind.nome}</p>
                <p className="text-xs text-muted-foreground">{ind.categoria} • {ind.fonte}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      <SummaryCards indicadores={typedIndicadores} />

      {/* Audit status summary (filter is now at page root) */}
      
      {/* Document source filter */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Documento de Origem:</p>
        <div className="flex flex-wrap gap-2">
          {DOCUMENTOS_FILTRO.map(doc => (
            <Badge 
              key={doc}
              variant={documentoAtivo === doc ? "default" : "secondary"}
              className="cursor-pointer transition-colors"
              onClick={() => setDocumentoAtivo(doc)}
            >
              {doc}
            </Badge>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">Categoria:</p>
        <div className="flex flex-wrap gap-2">
          {categorias.map(cat => (
            <Badge 
              key={cat}
              variant={categoriaAtiva === cat ? "default" : "outline"}
              className="cursor-pointer transition-colors"
              onClick={() => setCategoriaAtiva(cat)}
            >
              {cat === 'todas' ? 'Todas as categorias' : cat}
            </Badge>
          ))}
        </div>
      </div>

      {/* Novos Indicadores — Lacunas CERD III */}
      {(() => {
         const CERD_GAP_SUBCATS = new Set([
            'Trabalho Infantil', 'Intolerância Religiosa',
            'Distorção Idade-Série', 'Educação Indígena',
            'Saúde Indígena', 'Justiça Racial',
            'favelas_aglomerados', 'ciganos_saude_educacao',
            'quilombolas', 'demarcacao', 'titulacao', 'patrimonio',
            'trabalho_escravo', 'saude_indigena', 'educacao_indigena',
          ]);
        const cerdGapIndicadores = indicadoresFiltrados.filter(i => 
          i.subcategoria && CERD_GAP_SUBCATS.has(i.subcategoria)
        );
        const withData = cerdGapIndicadores.filter(i => {
          const d = i.dados || {};
          const nota = typeof d === 'object' ? (d as any).nota : '';
          return nota ? !String(nota).startsWith('⏳') : true;
        });
        const pending = cerdGapIndicadores.filter(i => {
          const d = i.dados || {};
          const nota = typeof d === 'object' ? (d as any).nota : '';
          return nota ? String(nota).startsWith('⏳') : false;
        });

        if (cerdGapIndicadores.length === 0) return null;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-1 bg-chart-4 rounded-full" />
              <div>
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Plus className="w-5 h-5 text-chart-4" />
                  Novos Indicadores — Lacunas CERD III ({cerdGapIndicadores.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Indicadores coletados para preencher lacunas identificadas no cruzamento CERD III × Sistema · 
                  <span className="text-success font-medium">{withData.length} com dados</span> · 
                  <span className="text-chart-4 font-medium">{pending.length} pendentes de verificação</span>
                </p>
              </div>
            </div>

            {/* With data — show as series or retrato */}
            {withData.map(ind => {
              const hasSeries = hasTimeSeries(ind.dados || {});
              return hasSeries 
                ? <IndicadorDetail key={ind.id} indicador={ind} highlighted={highlightedId === ind.id} />
                : null;
            })}

            {/* Retrato pontual for single-point new indicators */}
            <RetratoPontualSection indicadores={withData.filter(i => !hasTimeSeries(i.dados || {}))} />

            {/* Pending indicators */}
            {pending.length > 0 && (
              <Card className="border-l-4 border-l-chart-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-chart-4" />
                    Indicadores Pendentes de Verificação Humana ({pending.length})
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Deep links e fontes identificados — aguardando extração manual dos dados numéricos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs w-[30%]">Indicador</TableHead>
                        <TableHead className="text-xs">Categoria</TableHead>
                        <TableHead className="text-xs">Fonte</TableHead>
                        <TableHead className="text-xs">Status</TableHead>
                        <TableHead className="text-xs">Deep Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pending.map(ind => (
                        <TableRow key={ind.id}>
                          <TableCell className="text-sm font-medium">{ind.nome}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{ind.categoria}</Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{ind.fonte}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px] bg-chart-4/10 text-chart-4 border-chart-4/30">
                              ⏳ Pendente
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {ind.url_fonte && (
                              <a href={ind.url_fonte} target="_blank" rel="noopener noreferrer" 
                                 className="text-xs text-primary hover:underline flex items-center gap-1">
                                <ExternalLink className="w-3 h-3" /> Fonte
                              </a>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        );
      })()}

      {/* Split indicators: series vs single-point (excluding CERD gap ones already shown above) */}
      {(() => {
          const CERD_GAP_SUBCATS = new Set([
           'Trabalho Infantil', 'Intolerância Religiosa',
           'Distorção Idade-Série', 'Educação Indígena',
           'Saúde Indígena', 'Justiça Racial', 'Vacinação',
           'favelas_aglomerados', 'ciganos_saude_educacao',
           'quilombolas', 'demarcacao', 'titulacao', 'patrimonio',
         ]);
        const nonGap = indicadoresFiltrados.filter(i => !(i.subcategoria && CERD_GAP_SUBCATS.has(i.subcategoria)));
        const withSeries = nonGap.filter(i => hasTimeSeries(i.dados || {}));
        const singlePoint = nonGap.filter(i => !hasTimeSeries(i.dados || {}));
        
        return (
          <>
            {/* Retrato Pontual — single-point indicators grouped by source */}
            <RetratoPontualSection indicadores={singlePoint} />

            {/* Séries Temporais — indicators with time series */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-8 w-1 bg-primary rounded-full" />
                <div>
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    Séries Temporais ({withSeries.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Indicadores com evolução no tempo (2018–2025)
                  </p>
                </div>
              </div>
              
              {withSeries.length === 0 && singlePoint.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    <p>Nenhum indicador cadastrado ainda.</p>
                    <p className="text-sm mt-2">
                      Utilize a página de Fontes para adicionar indicadores ao sistema.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                withSeries.map(indicador => (
                  <IndicadorDetail key={indicador.id} indicador={indicador} highlighted={highlightedId === indicador.id} />
                ))
              )}
            </div>
          </>
        );
      })()}
    </div>
  );
}

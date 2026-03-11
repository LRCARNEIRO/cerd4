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
import { BarChart3, TrendingUp, FileText, Layers, Users, Activity, ExternalLink, BookOpen, Download, Printer, Search } from 'lucide-react';
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
function normalizeIndicadorData(dados: Record<string, Record<string, number>>) {
  const objectKeys = Object.keys(dados).filter(
    key => typeof dados[key] === 'object' && !['por_uf_2024', 'idade_media_vitima', 'unidade'].includes(key)
  );

  if (objectKeys.length === 0) return { groups: [], years: [], chartData: [] };

  const topKeysAreYears = objectKeys.every(isYearKey);

  if (topKeysAreYears) {
    // Transpose: top-level = years, sub-keys = metrics/groups
    const sortedYears = objectKeys.sort();
    const metricsSet = new Set<string>();
    sortedYears.forEach(year => {
      Object.keys(dados[year] || {}).forEach(m => metricsSet.add(m));
    });
    const groups = Array.from(metricsSet);
    const chartData = sortedYears.map(year => {
      const point: Record<string, any> = { ano: year };
      groups.forEach(metric => {
        if (dados[year]?.[metric] !== undefined) {
          point[metric] = dados[year][metric];
        }
      });
      return point;
    });
    return { groups, years: sortedYears, chartData };
  } else {
    // Standard: top-level = groups, sub-keys = years
    const allYears = new Set<string>();
    objectKeys.forEach(group => {
      Object.keys(dados[group] || {}).forEach(year => allYears.add(year));
    });
    const sortedYears = Array.from(allYears).sort();
    const chartData = sortedYears.map(year => {
      const point: Record<string, any> = { ano: year };
      objectKeys.forEach(group => {
        if (dados[group]?.[year] !== undefined) {
          point[group] = dados[group][year];
        }
      });
      return point;
    });
    return { groups: objectKeys, years: sortedYears, chartData };
  }
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
                          : val
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
                const vals = chartData.filter(d => d[group] !== undefined).map(d => d[group] as number);
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

function IndicadorDetail({ indicador }: { indicador: IndicadorData }) {
  return (
    <Card className="mb-4 indicador-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base">{indicador.nome}</CardTitle>
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
            const vals = chartData.filter(d => d[group] !== undefined).map(d => d[group] as number);
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

export function IndicadoresDbTab() {
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
    return catMatch && docMatch;
  });

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

      {/* Indicadores detalhados */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Indicadores Desagregados por Raça/Cor ({indicadoresFiltrados.length})
        </h3>
        
        {indicadoresFiltrados.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Nenhum indicador cadastrado ainda.</p>
              <p className="text-sm mt-2">
                Utilize a página de Fontes para adicionar indicadores ao sistema.
              </p>
            </CardContent>
          </Card>
        ) : (
          indicadoresFiltrados.map(indicador => (
            <IndicadorDetail key={indicador.id} indicador={indicador} />
          ))
        )}
      </div>
    </div>
  );
}

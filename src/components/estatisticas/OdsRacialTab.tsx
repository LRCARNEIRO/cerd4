import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ExternalLink, Search, Globe, Target, FileText, TrendingUp, TrendingDown, Loader2, RefreshCw } from 'lucide-react';
import { 
  odsGroups, 
  getOdsColor, 
  odsRacialIndicators as staticOdsIndicators,
  type OdsRacialIndicator,
  type OdsFormat
} from '@/data/odsRacialIndicators';
import { useOdsRacialData } from '@/hooks/useOdsRacialData';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

function formatValue(value: number | null, formato: OdsFormat): string {
  if (value === null || value === undefined) return 'N/D';
  if (formato === 'percent') return `${(value * 100).toFixed(2)}%`;
  if (formato === 'money') return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  // float
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
}

const raceLabels = [
  { key: 'amarela' as const, label: 'Amarela', color: 'hsl(45, 80%, 50%)' },
  { key: 'indigena' as const, label: 'Indígena', color: 'hsl(25, 70%, 45%)' },
  { key: 'negra' as const, label: 'Negra', color: 'hsl(270, 50%, 40%)' },
  { key: 'branca' as const, label: 'Branca', color: 'hsl(210, 50%, 50%)' },
];

function SeriesTable({ indicator }: { indicator: OdsRacialIndicator }) {
  const years = Object.keys(indicator.series).map(Number).sort();
  if (years.length === 0) return null;

  return (
    <div className="mt-2 overflow-x-auto">
      <table className="w-full text-[11px]">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-1 pr-2 font-medium text-muted-foreground">Ano</th>
            {raceLabels.map(r => (
              <th key={r.key} className="text-right py-1 px-1.5 font-medium" style={{ color: r.color }}>
                {r.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {years.map(year => {
            const d = indicator.series[year];
            return (
              <tr key={year} className="border-b border-border/50 hover:bg-muted/30">
                <td className="py-1 pr-2 font-mono font-medium text-foreground">{year}</td>
                {raceLabels.map(r => (
                  <td key={r.key} className="text-right py-1 px-1.5 font-mono text-muted-foreground">
                    {formatValue(d[r.key], indicator.formato)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function OdsRacialTab() {
  const [search, setSearch] = useState('');
  const [odsFilter, setOdsFilter] = useState<string>('todos');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const { data: odsRacialIndicators = [], isLoading } = useOdsRacialData();

  const TOTAL_ODS_RACIAL = odsRacialIndicators.length;

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Carregando indicadores ODS Racial do banco...</span>
      </div>
    );
  }

  const filtered = odsRacialIndicators.filter(ind => {
    const matchSearch = !search || ind.name.toLowerCase().includes(search.toLowerCase()) || 
      ind.id.toLowerCase().includes(search.toLowerCase()) ||
      ind.fonte.toLowerCase().includes(search.toLowerCase());
    const matchOds = odsFilter === 'todos' || ind.group === odsFilter;
    return matchSearch && matchOds;
  });

  const grouped = odsGroups.reduce((acc, group) => {
    const items = filtered.filter(ind => ind.group === group);
    if (items.length > 0) acc.push({ group, items });
    return acc;
  }, [] as { group: string; items: OdsRacialIndicator[] }[]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4" style={{ borderLeftColor: '#DD1367' }}>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Globe className="w-6 h-6 flex-shrink-0" style={{ color: '#DD1367' }} />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                Plataforma ODS Racial — ODSR/UFPB
              </h3>
              <p className="text-sm text-muted-foreground">
                Catálogo completo de <strong>{TOTAL_ODS_RACIAL} indicadores</strong> de igualdade étnico-racial com séries temporais reais (2018-2024), 
                organizados por Objetivos de Desenvolvimento Sustentável (ODS). 
                Dados desagregados por raça/cor (Amarela, Branca, Negra, Indígena).
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="text-xs" style={{ backgroundColor: '#DD1367', color: 'white' }}>
                  {TOTAL_ODS_RACIAL} Indicadores
                </Badge>
                <Badge variant="outline" className="text-xs">RAIS/MTE</Badge>
                <Badge variant="outline" className="text-xs">DataSUS (SIM/SIH/SINAN/SINASC)</Badge>
                <Badge variant="outline" className="text-xs">INEP (Censo Escolar/IDEB/ENEM)</Badge>
                <Badge variant="outline" className="text-xs">TSE</Badge>
                <Badge variant="outline" className="text-xs">CadÚnico/MDS</Badge>
              </div>
              <a 
                href="https://odsr.lema.ufpb.br/tabelas?region=brasil-br" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs mt-2 hover:underline"
                style={{ color: '#DD1367' }}
              >
                <ExternalLink className="w-3 h-3" /> Acessar plataforma ODSR
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar indicador..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={odsFilter} onValueChange={setOdsFilter}>
          <SelectTrigger className="w-full sm:w-[320px]">
            <SelectValue placeholder="Filtrar por ODS" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os ODS ({TOTAL_ODS_RACIAL})</SelectItem>
            {odsGroups.map(g => {
              const count = odsRacialIndicators.filter(i => i.group === g).length;
              return (
                <SelectItem key={g} value={g}>
                  {g} ({count})
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Contagem */}
      <p className="text-sm text-muted-foreground">
        Exibindo <strong>{filtered.length}</strong> de {TOTAL_ODS_RACIAL} indicadores — 
        clique em um indicador para expandir a série temporal
      </p>

      {/* Indicadores agrupados por ODS */}
      {grouped.map(({ group, items }) => {
        const color = getOdsColor(group);
        const odsNum = group.match(/ODS (\d+)/)?.[1] || '';
        return (
          <Card key={group} className="border-l-4" style={{ borderLeftColor: color }}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span 
                  className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: color }}
                >
                  {odsNum}
                </span>
                {group}
                <Badge variant="outline" className="ml-auto text-xs">{items.length} indicadores</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="divide-y divide-border">
                {items.map(ind => {
                  const isExpanded = expandedIds.has(ind.id);
                  const years = Object.keys(ind.series).map(Number).sort();
                  const yearRange = years.length > 0 ? `${years[0]}-${years[years.length - 1]}` : '';
                  const formatoLabel = ind.formato === 'percent' ? '%' : ind.formato === 'money' ? 'R$' : '№';

                  return (
                    <div key={ind.id} className="py-3 first:pt-0 last:pb-0">
                      <div 
                        className="flex items-start justify-between gap-3 cursor-pointer"
                        onClick={() => toggleExpand(ind.id)}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground leading-tight">
                            {ind.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {ind.fonte}
                            </Badge>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              {formatoLabel}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {yearRange} · {years.length} anos
                            </span>
                            {ind.artigoCerd?.map(art => (
                              <Badge key={art} variant="outline" className="text-[10px] px-1.5 py-0">
                                <FileText className="w-2.5 h-2.5 mr-0.5" />{art}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={ind.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md border border-border hover:bg-accent transition-colors"
                            onClick={e => e.stopPropagation()}
                          >
                            <Target className="w-3 h-3" />
                            <span className="hidden sm:inline">ODSR</span>
                          </a>
                          <span className="text-xs text-muted-foreground">
                            {isExpanded ? '▲' : '▼'}
                          </span>
                        </div>
                      </div>
                      {isExpanded && <SeriesTable indicator={ind} />}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nenhum indicador encontrado para o filtro aplicado.
          </CardContent>
        </Card>
      )}

      {/* Nota metodológica */}
      <Card className="bg-muted/50">
        <CardContent className="py-4">
          <p className="text-xs text-muted-foreground">
            <strong>Nota Metodológica:</strong> Dados extraídos exclusivamente das planilhas oficiais da Plataforma ODS Racial (ODSR/UFPB, 2018-2024). 
            Nenhum dado foi inventado, projetado ou interpolado. Valores ausentes são exibidos como "N/D". 
            Formato: percent = proporção (ex: 0.89 = 89%); float = taxa direta; money = R$. 
            Fontes primárias: RAIS/MTE, DataSUS (SIM/SIH/SINAN/SINASC), INEP, TSE, CadÚnico/MDS. 
            Links diretos apontam para a plataforma ODSR para consulta das metodologias de cálculo.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

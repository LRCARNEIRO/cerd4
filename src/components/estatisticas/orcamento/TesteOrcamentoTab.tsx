import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, FlaskConical, BarChart3, BookOpen, ExternalLink, ChevronDown, ChevronUp, Info, Building, Download, CheckCircle2, XCircle, Loader2, Database } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  classifyTesteThematic,
  testeToDisplayGroup,
  AGENDA_RACIAL_PROGRAMAS,
  AGENDA_INDIGENA_PROGRAMAS,
  type TesteThematicCategory,
  type TesteDisplayGroup,
} from '@/utils/agendaMarkers';
import { OrgaoSection } from '@/components/estatisticas/orcamento/OrgaoSection';
import { ProgramCard } from '@/components/estatisticas/orcamento/ProgramCard';
import { EmptyEsferaCard } from '@/components/estatisticas/orcamento/EmptyEsferaCard';
import { AuditFooter } from '@/components/ui/audit-footer';
import { Skeleton } from '@/components/ui/skeleton';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

interface TesteOrcamentoTabProps {
  allRecords: DadoOrcamentario[];
  isLoading: boolean;
}

type DisplayFilter = TesteDisplayGroup;

const DISPLAY_FILTERS: { key: DisplayFilter; label: string }[] = [
  { key: 'racial', label: 'Igualdade Racial' },
  { key: 'indigena', label: 'Povos Indígenas' },
  { key: 'quilombola', label: 'Quilombolas' },
  { key: 'ciganos', label: 'Ciganos' },
  { key: 'sesai', label: 'SESAI' },
];

function groupByOrgaoPrograma(records: DadoOrcamentario[]) {
  const result = new Map<string, Map<string, DadoOrcamentario[]>>();
  for (const item of records) {
    if (!result.has(item.orgao)) result.set(item.orgao, new Map());
    const orgaoMap = result.get(item.orgao)!;
    if (!orgaoMap.has(item.programa)) orgaoMap.set(item.programa, []);
    orgaoMap.get(item.programa)!.push(item);
  }
  return result;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(value);

const formatCurrencyFull = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

export function TesteOrcamentoTab({ allRecords, isLoading }: TesteOrcamentoTabProps) {
  const [filters, setFilters] = useState<Record<DisplayFilter, boolean>>({
    racial: true, indigena: true, quilombola: true, ciganos: true, sesai: true,
  });
  const [isIngesting, setIsIngesting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Separate TESTE records (from agenda ingestion) from regular ones
  const testeRecords = useMemo(() => 
    allRecords.filter(r => r.fonte_dados === 'Agenda Transversal TESTE'),
    [allRecords]
  );

  const regularRecords = useMemo(() =>
    allRecords.filter(r => r.fonte_dados !== 'Agenda Transversal TESTE'),
    [allRecords]
  );

  // Coverage analysis: which agenda programs have TESTE data?
  const allAgendaPrograms = useMemo(() => {
    const combined = [
      ...AGENDA_RACIAL_PROGRAMAS.map(p => ({ ...p, agenda: 'racial' as const })),
      ...AGENDA_INDIGENA_PROGRAMAS.map(p => ({ ...p, agenda: 'indigena' as const })),
    ];
    // Deduplicate by codigo
    const seen = new Set<string>();
    return combined.filter(p => {
      if (seen.has(p.codigo)) return false;
      seen.add(p.codigo);
      return true;
    });
  }, []);

  const coverageMap = useMemo(() => {
    const map = new Map<string, { hasTesteData: boolean; hasRegularData: boolean; testeCount: number; regularCount: number; totalLiquidado: number }>();
    for (const prog of allAgendaPrograms) {
      const testeMatches = testeRecords.filter(r => r.programa.startsWith(prog.codigo));
      const regularMatches = regularRecords.filter(r => r.programa.startsWith(prog.codigo));
      map.set(prog.codigo, {
        hasTesteData: testeMatches.length > 0,
        hasRegularData: regularMatches.length > 0,
        testeCount: testeMatches.length,
        regularCount: regularMatches.length,
        totalLiquidado: testeMatches.reduce((s, r) => s + (Number(r.liquidado) || 0), 0),
      });
    }
    return map;
  }, [allAgendaPrograms, testeRecords, regularRecords]);

  const coverageStats = useMemo(() => {
    let withTeste = 0, withRegular = 0, newOnly = 0, missing = 0;
    for (const [codigo, info] of coverageMap) {
      if (info.hasTesteData) withTeste++;
      if (info.hasRegularData) withRegular++;
      if (info.hasTesteData && !info.hasRegularData) newOnly++;
      if (!info.hasTesteData) missing++;
    }
    return { withTeste, withRegular, newOnly, missing, total: allAgendaPrograms.length };
  }, [coverageMap, allAgendaPrograms]);

  // Classify ALL records (TESTE + regular for keyword fallback) using TESTE methodology
  const classified = useMemo(() => {
    const result: Record<DisplayFilter, DadoOrcamentario[]> = {
      racial: [], indigena: [], quilombola: [], ciganos: [], sesai: [],
    };
    const matched: DadoOrcamentario[] = [];
    const unmatched: DadoOrcamentario[] = [];
    const agendaMatched: DadoOrcamentario[] = [];
    const keywordMatched: DadoOrcamentario[] = [];

    // Use TESTE records for 2024+ and regular records for pre-2024
    const recordsToClassify = [
      ...testeRecords,
      ...regularRecords.filter(r => r.ano < 2024),
    ];

    const federal = recordsToClassify.filter(r => r.esfera !== 'estadual' && r.esfera !== 'municipal');

    for (const r of federal) {
      const cat = classifyTesteThematic(r as any);
      if (cat === null) {
        unmatched.push(r);
        continue;
      }
      const display = testeToDisplayGroup(cat);
      result[display].push(r);
      matched.push(r);

      if (cat === 'agenda_racial' || cat === 'agenda_indigena') {
        agendaMatched.push(r);
      } else {
        keywordMatched.push(r);
      }
    }

    return { byGroup: result, matched, unmatched, agendaMatched, keywordMatched, total: federal.length };
  }, [testeRecords, regularRecords]);

  const filteredRecords = useMemo(() => {
    const result: DadoOrcamentario[] = [];
    for (const [key, recs] of Object.entries(classified.byGroup)) {
      if (filters[key as DisplayFilter]) result.push(...recs);
    }
    return result;
  }, [classified, filters]);

  const counts = useMemo(() => {
    const c: Record<DisplayFilter, number> = { racial: 0, indigena: 0, quilombola: 0, ciganos: 0, sesai: 0 };
    for (const [key, recs] of Object.entries(classified.byGroup)) {
      c[key as DisplayFilter] = recs.length;
    }
    return c;
  }, [classified]);

  // Stats
  const stats = useMemo(() => {
    const valorLiq = (r: DadoOrcamentario) => Number(r.liquidado) || 0;
    const p1 = filteredRecords.filter(r => r.ano >= 2018 && r.ano <= 2022);
    const p2 = filteredRecords.filter(r => r.ano >= 2023 && r.ano <= 2025);
    const t1 = p1.reduce((s, r) => s + valorLiq(r), 0);
    const t2 = p2.reduce((s, r) => s + valorLiq(r), 0);
    const anos = new Set(filteredRecords.map(r => r.ano));
    const programas = new Set(filteredRecords.map(r => r.programa));
    return {
      totalP1: t1, totalP2: t2,
      variacao: t1 > 0 ? ((t2 - t1) / t1 * 100) : 0,
      totalRegistros: filteredRecords.length,
      totalProgramas: programas.size,
      anosRange: anos.size > 0 ? `${Math.min(...anos)}–${Math.max(...anos)}` : '—',
    };
  }, [filteredRecords]);

  // Year-by-year data
  const porAno = useMemo(() => {
    const map: Record<number, { dotacao: number; liquidado: number; pago: number }> = {};
    for (const r of filteredRecords) {
      if (!map[r.ano]) map[r.ano] = { dotacao: 0, liquidado: 0, pago: 0 };
      map[r.ano].dotacao += Number(r.dotacao_autorizada) || Number(r.dotacao_inicial) || 0;
      map[r.ano].liquidado += Number(r.liquidado) || 0;
      map[r.ano].pago += Number(r.pago) || 0;
    }
    return Object.entries(map).map(([ano, v]) => ({ ano: Number(ano), ...v })).sort((a, b) => a.ano - b.ano);
  }, [filteredRecords]);

  // Comparison: TESTE vs current
  const comparison = useMemo(() => {
    const federal = allRecords.filter(r => r.esfera !== 'estadual' && r.esfera !== 'municipal');
    return {
      currentTotal: federal.length,
      testeMatched: classified.matched.length,
      testeUnmatched: classified.unmatched.length,
      agendaOnly: classified.agendaMatched.length,
      keywordOnly: classified.keywordMatched.length,
      overlap: classified.agendaMatched.filter(r => {
        // Check if keyword would also match
        const prog = r.programa.toLowerCase();
        const racialKws = ['racial', 'racismo', 'negro', 'negra', 'afro', 'quilomb', 'indigen', 'indígen',
          'étnic', 'palmares', 'igualdade racial', 'funai', 'sesai', 'cigano', 'romani'];
        return racialKws.some(kw => prog.includes(kw));
      }).length,
    };
  }, [allRecords, classified]);

  const handleIngestAgenda = async () => {
    setIsIngesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('ingest-agenda-teste', {
        body: { anos: [2024, 2025] },
      });
      if (error) throw error;
      toast({
        title: 'Ingestão concluída',
        description: `${data.total_registros} registros coletados de ${data.programas_consultados} programas.`,
      });
      queryClient.invalidateQueries({ queryKey: ['dados-orcamentarios'] });
    } catch (e: any) {
      toast({ title: 'Erro na ingestão', description: e.message, variant: 'destructive' });
    } finally {
      setIsIngesting(false);
    }
  };

  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-chart-4 bg-gradient-to-r from-chart-4/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-chart-4/10 rounded-xl">
              <FlaskConical className="w-8 h-8 text-chart-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">Metodologia TESTE — Marcadores de Agenda Transversal</h3>
                <Badge variant="outline" className="text-xs border-chart-4 text-chart-4">Experimental</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Metodologia híbrida: para <strong>2024 e 2025</strong>, a lista de ações dos PDFs de Agendas
                Transversais (<em>Igualdade Racial</em> e <em>Povos Indígenas</em>, PPA 2024-2027) baliza a
                coleta de <strong>dotação inicial</strong> e <strong>liquidado</strong> de cada ação listada.
                Para <strong>2018–2023</strong> e <strong>povos ciganos (todos os anos)</strong>,
                permanece a metodologia anterior de seleção por palavras-chave com dados complementares SIOP.
                Os resultados desta seção <strong>não integram</strong> as demais análises do sistema.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="visao-geral"><BarChart3 className="w-4 h-4 mr-1" /> Visão Geral</TabsTrigger>
          <TabsTrigger value="cobertura"><Database className="w-4 h-4 mr-1" /> Cobertura</TabsTrigger>
          <TabsTrigger value="comparativo"><Info className="w-4 h-4 mr-1" /> Comparativo</TabsTrigger>
          <TabsTrigger value="metodologia"><BookOpen className="w-4 h-4 mr-1" /> Metodologia</TabsTrigger>
        </TabsList>

        {/* ===== VISÃO GERAL ===== */}
        <TabsContent value="visao-geral">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-muted/50 rounded-lg border">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Filtros:</span>
            {DISPLAY_FILTERS.map(f => (
              <label key={f.key} className="flex items-center gap-2 cursor-pointer text-sm">
                <Checkbox
                  checked={filters[f.key]}
                  onCheckedChange={() => setFilters(prev => ({ ...prev, [f.key]: !prev[f.key] }))}
                />
                {f.label}
                <Badge variant="secondary" className="text-xs">{counts[f.key]}</Badge>
              </label>
            ))}
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
            <Card className="border-l-4 border-l-primary/60">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">2018–2022</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalP1)}</p>
                <p className="text-[10px] text-muted-foreground">Liquidado · TESTE</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success/60">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">2023–2026</p>
                <p className="text-lg font-bold text-success">{formatCurrency(stats.totalP2)}</p>
                <p className="text-[10px] text-muted-foreground">Liquidado · TESTE</p>
              </CardContent>
            </Card>
            <Card className="border-l-4" style={{ borderLeftColor: stats.variacao >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">Variação</p>
                <p className={`text-lg font-bold ${stats.variacao >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {stats.variacao >= 0 ? '+' : ''}{stats.variacao.toFixed(1)}%
                </p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-muted-foreground/30">
              <CardContent className="pt-4 pb-3">
                <p className="text-xs text-muted-foreground mb-1">Cobertura</p>
                <p className="text-lg font-bold">{stats.totalProgramas} <span className="text-sm font-normal text-muted-foreground">programas</span></p>
                <p className="text-[10px] text-muted-foreground">{stats.totalRegistros} registros · {stats.anosRange}</p>
              </CardContent>
            </Card>
          </div>

          {/* Chart */}
          {porAno.length > 0 && (
            <Card className="mb-6">
              <CardHeader><CardTitle className="text-base">Evolução Anual — TESTE</CardTitle></CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={porAno}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                      <Tooltip
                        formatter={(value: number, name: string) => [formatCurrencyFull(value), name === 'dotacao' ? 'Dotação' : name === 'liquidado' ? 'Liquidado' : 'Pago']}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                      />
                      <Legend verticalAlign="top" height={30} />
                      <Bar dataKey="dotacao" name="Dotação" fill="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="liquidado" name="Liquidado" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="pago" name="Pago" fill="hsl(var(--chart-4))" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Records listing */}
          {(() => {
            const grouped = groupByOrgaoPrograma(filteredRecords);
            if (grouped.size === 0) {
              return <EmptyEsferaCard esfera="" descricao="Nenhum registro encontrado com os filtros selecionados." />;
            }
            return (
              <div className="space-y-8">
                {Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([orgao, programas]) => (
                  <OrgaoSection key={orgao} orgao={orgao} programas={programas} />
                ))}
              </div>
            );
          })()}
        </TabsContent>

        {/* ===== COBERTURA ===== */}
        <TabsContent value="cobertura">
          <div className="space-y-6">
            {/* Ingestion controls */}
            <Card className="border-l-4 border-l-chart-4">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h4 className="font-semibold text-sm mb-1">Ingestão de Dados — Agenda Transversal</h4>
                    <p className="text-xs text-muted-foreground">
                      Busca dados de dotação e execução dos {allAgendaPrograms.length} programas das agendas
                      transversais via API do Portal da Transparência (2024–2025).
                    </p>
                  </div>
                  <Button
                    onClick={handleIngestAgenda}
                    disabled={isIngesting}
                    variant="outline"
                    className="border-chart-4 text-chart-4 hover:bg-chart-4/10"
                  >
                    {isIngesting ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Ingerindo...</>
                    ) : (
                      <><Download className="w-4 h-4 mr-2" /> Ingerir Programas de Agenda</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Card>
                <CardContent className="pt-4 pb-3 text-center">
                  <p className="text-2xl font-bold">{coverageStats.total}</p>
                  <p className="text-xs text-muted-foreground">Programas na Agenda</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-success/60">
                <CardContent className="pt-4 pb-3 text-center">
                  <p className="text-2xl font-bold text-success">{coverageStats.withTeste}</p>
                  <p className="text-xs text-muted-foreground">Com dados TESTE</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-chart-4/60">
                <CardContent className="pt-4 pb-3 text-center">
                  <p className="text-2xl font-bold text-chart-4">{coverageStats.newOnly}</p>
                  <p className="text-xs text-muted-foreground">Novos (sem keyword)</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-destructive/60">
                <CardContent className="pt-4 pb-3 text-center">
                  <p className="text-2xl font-bold text-destructive">{coverageStats.missing}</p>
                  <p className="text-xs text-muted-foreground">Sem dados TESTE</p>
                </CardContent>
              </Card>
            </div>

            {/* Program-by-program table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Cobertura por Programa</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Programa</TableHead>
                      <TableHead>Agenda</TableHead>
                      <TableHead>Órgão</TableHead>
                      <TableHead className="text-center">Dados TESTE</TableHead>
                      <TableHead className="text-center">Dados Keyword</TableHead>
                      <TableHead className="text-right">Registros</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allAgendaPrograms.map(prog => {
                      const info = coverageMap.get(prog.codigo);
                      const isNew = info?.hasTesteData && !info?.hasRegularData;
                      return (
                        <TableRow key={prog.codigo} className={isNew ? 'bg-chart-4/5' : ''}>
                          <TableCell className="font-mono text-xs">{prog.codigo}</TableCell>
                          <TableCell className="text-xs max-w-[200px] truncate">{prog.nome}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-[10px]">{prog.agenda}</Badge>
                          </TableCell>
                          <TableCell className="text-xs">{prog.orgao_nome}</TableCell>
                          <TableCell className="text-center">
                            {info?.hasTesteData ? (
                              <CheckCircle2 className="w-4 h-4 text-success mx-auto" />
                            ) : (
                              <XCircle className="w-4 h-4 text-destructive/50 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            {info?.hasRegularData ? (
                              <CheckCircle2 className="w-4 h-4 text-primary mx-auto" />
                            ) : (
                              <XCircle className="w-4 h-4 text-muted-foreground/30 mx-auto" />
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {info?.testeCount || 0}
                          </TableCell>
                          <TableCell className="text-center">
                            {isNew ? (
                              <Badge className="text-[10px] bg-chart-4/20 text-chart-4 border-chart-4/30">NOVO</Badge>
                            ) : info?.hasTesteData ? (
                              <Badge variant="secondary" className="text-[10px]">OK</Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] text-muted-foreground">Pendente</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {testeRecords.length > 0 && (
              <Card className="bg-success/5 border-success/20">
                <CardContent className="pt-4 pb-3">
                  <p className="text-sm font-medium text-success">
                    ✓ {testeRecords.length} registros TESTE já ingeridos
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Liquidado total TESTE: {formatCurrency(testeRecords.reduce((s, r) => s + (Number(r.liquidado) || 0), 0))}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>


        <TabsContent value="comparativo">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" />
                  Comparativo: Metodologia Atual vs. TESTE
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-foreground">Metodologia Atual (Palavras-chave)</h4>
                    <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total de registros federais:</span>
                        <span className="font-mono font-bold">{comparison.currentTotal}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Busca radicais e palavras-chave nos campos <code>programa</code>, <code>orgao</code> e <code>descritivo</code>
                        para todos os anos.
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-foreground">Metodologia TESTE (Híbrida)</h4>
                    <div className="bg-chart-4/5 rounded-lg p-4 space-y-2 border border-chart-4/20">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Registros classificados:</span>
                        <span className="font-mono font-bold text-chart-4">{comparison.testeMatched}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Via agenda (2024+):</span>
                        <span className="font-mono">{comparison.agendaOnly}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Via palavras-chave:</span>
                        <span className="font-mono">{comparison.keywordOnly}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Não classificados:</span>
                        <span className="font-mono text-destructive">{comparison.testeUnmatched}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delta analysis */}
                <div className="mt-6 p-4 bg-warning/5 rounded-lg border border-warning/20">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-sm">Análise de Divergência</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        A metodologia TESTE pode capturar <strong>mais programas</strong> a partir de 2024 (ex: Bioeconomia, Esporte,
                        Trabalho Decente) que não contêm palavras-chave raciais/étnicas nos títulos, mas foram oficialmente
                        marcados pelo MPO como pertencentes às agendas transversais. Por outro lado, pode <strong>deixar de capturar</strong> ações
                        que contêm palavras-chave mas não foram marcadas nas agendas.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unmatched records */}
                {classified.unmatched.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                      Registros não classificados pela metodologia TESTE ({classified.unmatched.length})
                    </h4>
                    <div className="max-h-60 overflow-auto border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Programa</TableHead>
                            <TableHead>Órgão</TableHead>
                            <TableHead>Ano</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {classified.unmatched.slice(0, 20).map((r, i) => (
                            <TableRow key={i}>
                              <TableCell className="text-xs">{r.programa}</TableCell>
                              <TableCell className="text-xs">{r.orgao}</TableCell>
                              <TableCell className="text-xs font-mono">{r.ano}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      {classified.unmatched.length > 20 && (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          ... e mais {classified.unmatched.length - 20} registros
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ===== METODOLOGIA ===== */}
        <TabsContent value="metodologia">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Metodologia TESTE — Marcadores de Agenda Transversal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-muted-foreground">
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">1. Princípio</h4>
                  <p>
                    A metodologia TESTE propõe uma classificação <strong>híbrida</strong> que combina
                    dois critérios conforme o período:
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                     <div>
                      <h5 className="font-semibold text-foreground">Período 2024–2025 — Marcadores Oficiais do PPA (nível de ação orçamentária)</h5>
                      <p>
                        Os PDFs de Agendas Transversais de
                        <em> Igualdade Racial</em> e <em>Povos Indígenas</em> (PPA 2024-2027,
                        Espelho do Monitoramento do MPO) identificam os <strong>programas</strong> marcados.
                        A coleta via API do Portal da Transparência opera no nível de <strong>ação orçamentária</strong>,
                        aplicando dois critérios distintos:
                      </p>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-xs">
                        <li>
                          <strong>Programas focais</strong> (ex: 5802, 5803, 5804 do MIR; 1617, 5136 do MPI):
                          todas as ações são incluídas integralmente, pois o orçamento total é destinado ao público-alvo.
                        </li>
                        <li>
                          <strong>Programas universais</strong> (ex: 5128 Bolsa Família, 5111 Educação Básica, 5126 Esporte):
                          apenas ações cujo <strong>nome ou descritivo</strong> contenha termos específicos do público-alvo
                          são incluídas (ex: <code>indígen*</code>, <code>quilombol*</code>, <code>racial</code>,
                          <code> cigano</code>, <code>afrodescendente</code>, <code>sesai</code>, <code>funai</code>, etc.).
                          Ações genéricas são descartadas para evitar inflação orçamentária.
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground">Período 2018–2023 — Palavras-chave + SIOP (mesma da metodologia vigente)</h5>
                      <p>
                        Mantém a busca por radicais e palavras-chave nos campos <code>programa</code>,
                        <code> orgao</code> e <code>descritivo</code>, com dados complementares do SIOP.
                      </p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground">Povos Ciganos — Sempre por Palavras-chave (todos os anos)</h5>
                      <p>
                        Não há agenda transversal específica para povos ciganos no PPA 2024-2027.
                        A classificação continua baseada em radicais: <code>cigano</code>, <code>romani</code>,
                        com coleta via metodologia anterior para todos os anos (2018–2025).
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">2. Filtro por Ação Orçamentária (programas universais)</h4>
                  <p>
                    Programas da agenda transversal que atendem populações amplas (ex: Bolsa Família, Educação Básica)
                    têm orçamentos globais de dezenas a centenas de bilhões. Para evitar atribuir esses valores
                    integrais à política racial/indígena, o sistema filtra no nível de <strong>ação orçamentária</strong>,
                    incluindo apenas as ações que mencionam explicitamente o público-alvo.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <h5 className="font-semibold text-foreground text-sm mb-2">Programas focais (inclusão integral)</h5>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {['5802 – Enfrentamento ao Racismo (MIR)', '5803 – Juventude Negra Viva (MIR)',
                        '5804 – Igualdade Étnico-Racial (MIR)', '1617 – Demarcação Territórios (MPI)',
                        '5136 – Proteção Povos Indígenas (MPI)'].map(p => (
                        <Badge key={p} variant="secondary" className="text-[10px]">{p}</Badge>
                      ))}
                    </div>
                    <h5 className="font-semibold text-foreground text-sm mb-2">Keywords de filtragem (programas universais)</h5>
                    <div className="flex flex-wrap gap-1">
                      {['indígen*', 'quilombol*', 'racial', 'racismo', 'negro/a', 'afro*', 'étnic*',
                        'palmares', 'terreiro', 'matriz africana', 'capoeira', 'candomblé', 'umbanda',
                        'afrodescendente', 'cigano', 'romani', 'comunidades tradicionais',
                        'funai', 'sesai', 'saúde indígen*', 'educação indígen*'].map(kw => (
                        <Badge key={kw} variant="outline" className="text-[10px] font-mono">{kw}</Badge>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">3. Programas da Agenda "Igualdade Racial"</h4>
                  <p className="text-xs">
                    Fonte: <code>agenda-racial-completa.pdf</code> — Espelho do PPA 2024-2027
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Programa</TableHead>
                        <TableHead>Órgão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {AGENDA_RACIAL_PROGRAMAS.map(p => (
                        <TableRow key={p.codigo}>
                          <TableCell className="font-mono text-xs">{p.codigo}</TableCell>
                          <TableCell className="text-xs">{p.nome}</TableCell>
                          <TableCell className="text-xs">{p.orgao_nome}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <a href="/documentos/agenda-racial-completa.pdf" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                    <ExternalLink className="w-3 h-3" /> Ver documento original
                  </a>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">4. Programas da Agenda "Povos Indígenas"</h4>
                  <p className="text-xs">
                    Fonte: <code>agenda_indigenas-completa.pdf</code> — Espelho do PPA 2024-2027
                  </p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Código</TableHead>
                        <TableHead>Programa</TableHead>
                        <TableHead>Órgão</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {AGENDA_INDIGENA_PROGRAMAS.map(p => (
                        <TableRow key={p.codigo}>
                          <TableCell className="font-mono text-xs">{p.codigo}</TableCell>
                          <TableCell className="text-xs">{p.nome}</TableCell>
                          <TableCell className="text-xs">{p.orgao_nome}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <a href="/documentos/agenda_indigenas-completa.pdf" target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
                    <ExternalLink className="w-3 h-3" /> Ver documento original
                  </a>
                </section>

                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">5. Limitações e Próximos Passos</h4>
                  <div className="bg-warning/5 rounded-lg p-4 border border-warning/20">
                    <ul className="text-xs space-y-1 list-disc pl-4">
                      <li>Esta é uma visualização <strong>experimental</strong> — os resultados não alimentam as demais seções do sistema.</li>
                      <li>Programas universais da agenda (ex: Bolsa Família, Educação Básica, Esporte) são filtrados por ação: apenas ações com menção explícita ao público-alvo são incluídas. Se nenhuma ação é encontrada, o programa aparece na aba Cobertura como "sem dados TESTE" — isso é esperado e não indica erro.</li>
                      <li>A ausência de agenda específica para povos ciganos é uma lacuna do PPA.</li>
                      <li>A comparação com a metodologia atual permite avaliar ganhos e perdas de cobertura antes de uma eventual substituição.</li>
                      <li>A granularidade de ação orçamentária garante que os totais reflitam apenas o orçamento efetivamente direcionado ao público-alvo, evitando a inflação por inclusão de programas universais inteiros.</li>
                    </ul>
                  </div>
                </section>

                <AuditFooter
                  fontes={[
                    { nome: 'Espelho do PPA 2024-2027 — Agenda Igualdade Racial', url: '/documentos/agenda-racial-completa.pdf' },
                    { nome: 'Espelho do PPA 2024-2027 — Agenda Povos Indígenas', url: '/documentos/agenda_indigenas-completa.pdf' },
                    { nome: 'SIOP — Agendas Transversais', url: 'https://www.siop.planejamento.gov.br/siop/' },
                  ]}
                  documentos={['PPA 2024-2027', 'Espelho do Monitoramento MPO']}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

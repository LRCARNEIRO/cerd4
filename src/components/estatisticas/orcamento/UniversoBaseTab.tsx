import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Database, Layers, Calendar, DollarSign, TrendingUp, Building, Users, TreePine, MapPin, Tent, Info } from 'lucide-react';
import { AuditFooter } from '@/components/ui/audit-footer';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

interface UniversoBaseTabProps {
  records: DadoOrcamentario[];
}

const formatCompact = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const formatFull = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

function classifyThematic(r: DadoOrcamentario): string {
  const prog = r.programa.toLowerCase();
  const orgao = r.orgao.toUpperCase();
  const obs = ((r as any).observacoes || '').toLowerCase();
  if (orgao === 'SESAI' || obs.includes('saúde indígena') || obs.includes('sesai') || prog.includes('20yp') || prog.includes('7684')) return 'sesai';
  if (['FUNAI', 'MPI'].includes(orgao) || prog.includes('indigen') || prog.includes('indígen') || prog.includes('2065')) return 'indigena';
  if (prog.includes('quilomb') || prog.includes('20g7') || prog.includes('0859')) return 'quilombola';
  if (prog.includes('cigano') || prog.includes('romani') || prog.includes('povo cigano')) return 'ciganos';
  return 'racial';
}

export function UniversoBaseTab({ records }: UniversoBaseTabProps) {
  const [anoFilter, setAnoFilter] = useState<string>('todos');

  const anos = useMemo(() => {
    const set = new Set(records.map(r => r.ano));
    return Array.from(set).sort((a, b) => a - b);
  }, [records]);

  const filtered = useMemo(() => {
    if (anoFilter === 'todos') return records;
    return records.filter(r => r.ano === Number(anoFilter));
  }, [records, anoFilter]);

  const summary = useMemo(() => {
    const totalRegistros = filtered.length;
    const programas = new Set(filtered.map(r => r.programa));
    const orgaos = new Set(filtered.map(r => r.orgao));
    const orcRecs = filtered.filter(r => r.tipo_dotacao !== 'extraorcamentario');
    const extraRecs = filtered.filter(r => r.tipo_dotacao === 'extraorcamentario');
    const acoesOrc = new Set(orcRecs.map(r => r.programa)).size;
    const acoesExtra = new Set(extraRecs.map(r => r.programa)).size;
    const totalDotacao = filtered.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0);
    const totalPago = filtered.reduce((s, r) => s + (Number(r.pago) || 0), 0);
    const execucao = totalDotacao > 0 ? (totalPago / totalDotacao * 100) : 0;
    return { totalRegistros, totalProgramas: programas.size, totalOrgaos: orgaos.size, acoesOrc, acoesExtra, totalDotacao, totalPago, execucao };
  }, [filtered]);

  // Panorama by group
  const panoramaRows = useMemo(() => {
    const groups = [
      { key: 'racial', label: 'Negros / Racial', icon: <Users className="w-4 h-4" />, color: 'hsl(var(--primary))' },
      { key: 'indigena', label: 'Indígenas', icon: <TreePine className="w-4 h-4" />, color: 'hsl(var(--success))' },
      { key: 'quilombola', label: 'Quilombolas', icon: <MapPin className="w-4 h-4" />, color: 'hsl(var(--chart-3))' },
      { key: 'ciganos', label: 'Ciganos', icon: <Tent className="w-4 h-4" />, color: 'hsl(var(--chart-4))' },
      { key: 'sesai', label: 'SESAI', icon: <Building className="w-4 h-4" />, color: 'hsl(var(--chart-5))' },
    ];
    return groups.map(g => {
      const recs = filtered.filter(r => classifyThematic(r) === g.key);
      const p1 = recs.filter(r => r.ano >= 2018 && r.ano <= 2022);
      const p2 = recs.filter(r => r.ano >= 2023 && r.ano <= 2025);
      return {
        ...g,
        progP1: new Set(p1.map(r => r.programa)).size,
        progP2: new Set(p2.map(r => r.programa)).size,
        progTotal: new Set(recs.map(r => r.programa)).size,
        acoesP1: p1.length, acoesP2: p2.length, acoesTotal: recs.length,
      };
    });
  }, [filtered]);

  // Evolução por ano
  const evolucaoPorAno = useMemo(() => {
    const map: Record<number, number> = {};
    for (const r of filtered) {
      map[r.ano] = (map[r.ano] || 0) + (Number(r.pago) || 0);
    }
    return Object.entries(map).map(([ano, pago]) => ({ ano: Number(ano), pago })).sort((a, b) => a.ano - b.ano);
  }, [filtered]);

  // Top 10
  const top10 = useMemo(() => {
    const map: Record<string, number> = {};
    for (const r of filtered) {
      map[r.programa] = (map[r.programa] || 0) + (Number(r.pago) || 0);
    }
    return Object.entries(map).map(([programa, pago]) => ({ programa, pago })).sort((a, b) => b.pago - a.pago).slice(0, 10);
  }, [filtered]);

  // Program table
  const programaRows = useMemo(() => {
    const map = new Map<string, { programa: string; orgao: string; tipo: string; anos: Set<number>; dotacao: number; pago: number; registros: number }>();
    for (const r of filtered) {
      const key = r.programa;
      if (!map.has(key)) {
        map.set(key, { programa: r.programa, orgao: r.orgao, tipo: r.tipo_dotacao === 'extraorcamentario' ? 'Extra' : 'Orç.', anos: new Set(), dotacao: 0, pago: 0, registros: 0 });
      }
      const entry = map.get(key)!;
      entry.anos.add(r.ano);
      entry.dotacao += Number(r.dotacao_autorizada) || 0;
      entry.pago += Number(r.pago) || 0;
      entry.registros++;
    }
    return Array.from(map.values()).sort((a, b) => b.pago - a.pago);
  }, [filtered]);

  const cards = [
    { label: 'Registros', value: summary.totalRegistros, icon: Database, color: 'border-l-primary', sub: 'Ação × Ano' },
    { label: 'Programas/Ações', value: summary.totalProgramas, icon: Layers, color: 'border-l-chart-1', sub: 'Distintos' },
    { label: 'Órgãos', value: summary.totalOrgaos, icon: Building, color: 'border-l-chart-2', sub: 'Responsáveis' },
    { label: 'Ações Orçamentárias', value: summary.acoesOrc, icon: DollarSign, color: 'border-l-success', sub: 'LOA/Tesouro' },
    { label: 'Ações Extraorçamentárias', value: summary.acoesExtra, icon: TrendingUp, color: 'border-l-warning', sub: 'Compensatório' },
  ];

  const periodLabels = ['2018–2022', '2023–2025', 'Total'];

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtrar por ano:</span>
        <Select value={anoFilter} onValueChange={setAnoFilter}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os anos</SelectItem>
            {anos.map(a => <SelectItem key={a} value={String(a)}>{a}</SelectItem>)}
          </SelectContent>
        </Select>
        {anoFilter !== 'todos' && <Badge variant="secondary" className="text-xs">{filtered.length} registros em {anoFilter}</Badge>}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {cards.map(c => (
          <Card key={c.label} className={`border-l-4 ${c.color}`}>
            <CardContent className="pt-4 pb-3">
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">{c.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{c.value}</p>
              <p className="text-[10px] text-muted-foreground mt-1">{c.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Financial summary */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4 pb-3">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Dotação Autorizada</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatCompact(summary.totalDotacao)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4 pb-3">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Valor Pago</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatCompact(summary.totalPago)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-3">
          <CardContent className="pt-4 pb-3">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Execução</p>
            <p className={`text-xl font-bold mt-1 ${summary.execucao >= 80 ? 'text-success' : summary.execucao >= 50 ? 'text-warning' : 'text-destructive'}`}>
              {summary.execucao.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Panorama */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Panorama: Programas e Ações por Grupo Focal e Período
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 mb-4">
            <Badge className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/30">{new Set(records.map(r => r.programa)).size} programas distintos</Badge>
            <Badge className="text-sm px-3 py-1 bg-muted text-foreground border-border">{records.length} ações/registros totais</Badge>
          </div>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[160px]">Grupo Focal</TableHead>
                  <TableHead colSpan={3} className="text-center border-l">Programas</TableHead>
                  <TableHead colSpan={3} className="text-center border-l">Ações / Registros</TableHead>
                </TableRow>
                <TableRow>
                  <TableHead />
                  {periodLabels.map(p => <TableHead key={`p-${p}`} className="text-center text-xs border-l">{p}</TableHead>)}
                  {periodLabels.map(p => <TableHead key={`a-${p}`} className="text-center text-xs border-l">{p}</TableHead>)}
                </TableRow>
              </TableHeader>
              <TableBody>
                {panoramaRows.map(row => (
                  <TableRow key={row.key}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span style={{ color: row.color }}>{row.icon}</span>
                        <span className="text-sm">{row.label}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm border-l">{row.progP1}</TableCell>
                    <TableCell className="text-center font-mono text-sm border-l">{row.progP2}</TableCell>
                    <TableCell className="text-center font-mono text-sm font-bold border-l">{row.progTotal}</TableCell>
                    <TableCell className="text-center font-mono text-sm border-l">{row.acoesP1}</TableCell>
                    <TableCell className="text-center font-mono text-sm border-l">{row.acoesP2}</TableCell>
                    <TableCell className="text-center font-mono text-sm font-bold border-l">{row.acoesTotal}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <AuditFooter
            fontes={[
              { nome: 'Portal da Transparência — Despesas', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' },
              { nome: 'SIOP — Execução Orçamentária', url: 'https://www.siop.planejamento.gov.br/siop/' },
            ]}
            documentos={['CERD/C/BRA/CO/18-20 §14', 'Plano de Durban §157-162']}
            compact
          />
        </CardContent>
      </Card>

      {/* Evolução + Top 10 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {evolucaoPorAno.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Evolução Orçamentária por Ano</CardTitle></CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolucaoPorAno}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCompact(v)} />
                    <Tooltip formatter={(value: number) => [formatFull(value), 'Pago']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="pago" name="Pago" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
        {top10.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Top 10 Programas por Execução</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {top10.map((item, idx) => {
                  const maxVal = top10[0]?.pago || 1;
                  const pct = (item.pago / maxVal) * 100;
                  return (
                    <div key={idx} className="group relative">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-muted-foreground w-5 text-right shrink-0">{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2 mb-0.5">
                            <p className="text-xs font-medium truncate" title={item.programa}>{item.programa}</p>
                            <span className="text-xs font-bold text-foreground shrink-0">{formatCompact(item.pago)}</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: 'hsl(var(--chart-2))' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Programs table */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Programas na Base ({programaRows.length})
          </h4>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Programa</TableHead>
                  <TableHead className="text-xs">Órgão</TableHead>
                  <TableHead className="text-xs text-center">Tipo</TableHead>
                  <TableHead className="text-xs text-center">Anos</TableHead>
                  <TableHead className="text-xs text-center">Registros</TableHead>
                  <TableHead className="text-xs text-right">Dotação</TableHead>
                  <TableHead className="text-xs text-right">Pago</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {programaRows.map((row, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs whitespace-normal break-words">{row.programa}</TableCell>
                    <TableCell className="text-xs">{row.orgao}</TableCell>
                    <TableCell className="text-xs text-center">
                      <Badge variant={row.tipo === 'Extra' ? 'outline' : 'secondary'} className="text-[10px]">{row.tipo}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center font-mono">
                      {row.anos.size === 1 ? Array.from(row.anos)[0] : `${Math.min(...row.anos)}–${Math.max(...row.anos)}`}
                    </TableCell>
                    <TableCell className="text-xs text-center">{row.registros}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCompact(row.dotacao)}</TableCell>
                    <TableCell className="text-xs text-right font-mono font-medium">{formatCompact(row.pago)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Actions table (each record = action × year) */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-primary" />
            Ações Detalhadas — Registros ({filtered.length})
          </h4>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Programa / Ação</TableHead>
                  <TableHead className="text-xs">Órgão</TableHead>
                  <TableHead className="text-xs text-center">Ano</TableHead>
                  <TableHead className="text-xs text-center">Tipo</TableHead>
                  <TableHead className="text-xs text-right">Dotação Autorizada</TableHead>
                  <TableHead className="text-xs text-right">Empenhado</TableHead>
                  <TableHead className="text-xs text-right">Liquidado</TableHead>
                  <TableHead className="text-xs text-right">Pago</TableHead>
                  <TableHead className="text-xs text-center">Execução</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.sort((a, b) => a.ano - b.ano || a.programa.localeCompare(b.programa)).map((r, i) => {
                  const dot = Number(r.dotacao_autorizada) || 0;
                  const pg = Number(r.pago) || 0;
                  const exec = dot > 0 ? (pg / dot * 100) : 0;
                  return (
                    <TableRow key={r.id || i}>
                      <TableCell className="text-xs whitespace-normal break-words">{r.programa}</TableCell>
                      <TableCell className="text-xs">{r.orgao}</TableCell>
                      <TableCell className="text-xs text-center font-mono">{r.ano}</TableCell>
                      <TableCell className="text-xs text-center">
                        <Badge variant={r.tipo_dotacao === 'extraorcamentario' ? 'outline' : 'secondary'} className="text-[10px]">
                          {r.tipo_dotacao === 'extraorcamentario' ? 'Extra' : 'Orç.'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCompact(dot)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCompact(Number(r.empenhado) || 0)}</TableCell>
                      <TableCell className="text-xs text-right font-mono">{formatCompact(Number(r.liquidado) || 0)}</TableCell>
                      <TableCell className="text-xs text-right font-mono font-medium">{formatCompact(pg)}</TableCell>
                      <TableCell className={`text-xs text-center font-bold ${exec >= 80 ? 'text-success' : exec >= 50 ? 'text-warning' : 'text-destructive'}`}>
                        {exec.toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

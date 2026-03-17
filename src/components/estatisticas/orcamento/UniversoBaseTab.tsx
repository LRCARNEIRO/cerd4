import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Database, Layers, Calendar, DollarSign, TrendingUp, Building } from 'lucide-react';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

interface UniversoBaseTabProps {
  records: DadoOrcamentario[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

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

  // Summary stats
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

  // Group by programa → aggregate
  const programaRows = useMemo(() => {
    const map = new Map<string, { programa: string; orgao: string; tipo: string; anos: Set<number>; dotacao: number; pago: number; registros: number }>();
    for (const r of filtered) {
      const key = r.programa;
      if (!map.has(key)) {
        map.set(key, {
          programa: r.programa,
          orgao: r.orgao,
          tipo: r.tipo_dotacao === 'extraorcamentario' ? 'Extra' : 'Orç.',
          anos: new Set(),
          dotacao: 0,
          pago: 0,
          registros: 0,
        });
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

  return (
    <div className="space-y-6">
      {/* Filter */}
      <div className="flex items-center gap-3">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filtrar por ano:</span>
        <Select value={anoFilter} onValueChange={setAnoFilter}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os anos</SelectItem>
            {anos.map(a => (
              <SelectItem key={a} value={String(a)}>{a}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {anoFilter !== 'todos' && (
          <Badge variant="secondary" className="text-xs">{filtered.length} registros em {anoFilter}</Badge>
        )}
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
            <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(summary.totalDotacao)}</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4 pb-3">
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Valor Pago</p>
            <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(summary.totalPago)}</p>
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

      {/* Programs table */}
      <Card>
        <CardContent className="pt-4">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" />
            Programas e Ações na Base ({programaRows.length})
          </h4>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Programa / Ação</TableHead>
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
                    <TableCell className="text-xs max-w-[300px] truncate" title={row.programa}>{row.programa}</TableCell>
                    <TableCell className="text-xs">{row.orgao}</TableCell>
                    <TableCell className="text-xs text-center">
                      <Badge variant={row.tipo === 'Extra' ? 'outline' : 'secondary'} className="text-[10px]">
                        {row.tipo}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-center font-mono">
                      {row.anos.size === 1 ? Array.from(row.anos)[0] : `${Math.min(...row.anos)}–${Math.max(...row.anos)}`}
                    </TableCell>
                    <TableCell className="text-xs text-center">{row.registros}</TableCell>
                    <TableCell className="text-xs text-right font-mono">{formatCurrency(row.dotacao)}</TableCell>
                    <TableCell className="text-xs text-right font-mono font-medium">{formatCurrency(row.pago)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

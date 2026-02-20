import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { AlertTriangle, Building2, TrendingUp, TrendingDown, MapPin, Scale } from 'lucide-react';
import { AuditFooter } from '@/components/ui/audit-footer';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

interface Props {
  records: DadoOrcamentario[];
  formatCurrency: (v: number) => string;
  formatCurrencyFull: (v: number) => string;
}

/** Regional block for grouping */
function getRegionalBloco(uf: string): string {
  const map: Record<string, string> = {
    MA: 'NE', BA: 'NE', PE: 'NE', CE: 'NE', PI: 'NE', AL: 'NE', PB: 'NE', RN: 'NE', SE: 'NE',
    PA: 'N', AM: 'N', AC: 'N', AP: 'N', RO: 'N', RR: 'N', TO: 'N',
    SP: 'SE', RJ: 'SE', MG: 'SE', ES: 'SE',
    RS: 'S', PR: 'S', SC: 'S',
    MT: 'CO', MS: 'CO', GO: 'CO', DF: 'CO',
  };
  return map[uf] || 'Outro';
}

const REGIAO_LABELS: Record<string, string> = {
  NE: 'Nordeste', N: 'Norte', SE: 'Sudeste', S: 'Sul', CO: 'Centro-Oeste',
};

export function EstadualResumoComparativo({ records, formatCurrency, formatCurrencyFull }: Props) {
  const analysis = useMemo(() => {
    if (records.length === 0) return null;

    // Group by UF
    const byUF = new Map<string, DadoOrcamentario[]>();
    for (const r of records) {
      const match = r.orgao.match(/\((\w+)\)/);
      const uf = match ? match[1] : r.orgao;
      if (!byUF.has(uf)) byUF.set(uf, []);
      byUF.get(uf)!.push(r);
    }

    // Ano a ano
    const byYear = new Map<number, { dotacao: number; liquidado: number; count: number }>();
    for (const r of records) {
      if (!byYear.has(r.ano)) byYear.set(r.ano, { dotacao: 0, liquidado: 0, count: 0 });
      const y = byYear.get(r.ano)!;
      y.dotacao += Number(r.dotacao_inicial) || 0;
      y.liquidado += Number(r.liquidado) || 0;
      y.count += 1;
    }

    // Period comparison
    const p1 = records.filter(r => r.ano >= 2018 && r.ano <= 2022);
    const p2 = records.filter(r => r.ano >= 2023 && r.ano <= 2025);
    const dotP1 = p1.reduce((s, r) => s + (Number(r.dotacao_inicial) || 0), 0);
    const dotP2 = p2.reduce((s, r) => s + (Number(r.dotacao_inicial) || 0), 0);
    const liqP1 = p1.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
    const liqP2 = p2.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
    const execP1 = dotP1 > 0 ? (liqP1 / dotP1 * 100) : 0;
    const execP2 = dotP2 > 0 ? (liqP2 / dotP2 * 100) : 0;

    // By group
    const byGroup = new Map<string, { dotP1: number; liqP1: number; dotP2: number; liqP2: number; count: number }>();
    for (const r of records) {
      const obs = (r.observacoes || 'Racial/Étnico (geral)');
      if (!byGroup.has(obs)) byGroup.set(obs, { dotP1: 0, liqP1: 0, dotP2: 0, liqP2: 0, count: 0 });
      const g = byGroup.get(obs)!;
      g.count += 1;
      const dot = Number(r.dotacao_inicial) || 0;
      const liq = Number(r.liquidado) || 0;
      if (r.ano <= 2022) { g.dotP1 += dot; g.liqP1 += liq; }
      else { g.dotP2 += dot; g.liqP2 += liq; }
    }

    // UF stats
    const ufStats = Array.from(byUF.entries()).map(([uf, recs]) => {
      const dot = recs.reduce((s, r) => s + (Number(r.dotacao_inicial) || 0), 0);
      const liq = recs.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
      const p1Recs = recs.filter(r => r.ano >= 2018 && r.ano <= 2022);
      const p2Recs = recs.filter(r => r.ano >= 2023 && r.ano <= 2025);
      const dotP1UF = p1Recs.reduce((s, r) => s + (Number(r.dotacao_inicial) || 0), 0);
      const dotP2UF = p2Recs.reduce((s, r) => s + (Number(r.dotacao_inicial) || 0), 0);
      const liqP1UF = p1Recs.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
      const liqP2UF = p2Recs.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
      const regiao = getRegionalBloco(uf);
      return {
        uf, dotacao: dot, liquidado: liq,
        exec: dot > 0 ? (liq / dot * 100) : 0,
        dotP1: dotP1UF, dotP2: dotP2UF, liqP1: liqP1UF, liqP2: liqP2UF,
        execP1: dotP1UF > 0 ? (liqP1UF / dotP1UF * 100) : 0,
        execP2: dotP2UF > 0 ? (liqP2UF / dotP2UF * 100) : 0,
        count: recs.length, regiao,
      };
    }).sort((a, b) => b.dotacao - a.dotacao);

    // Regional aggregates
    const byRegiao = new Map<string, { dot: number; liq: number; count: number }>();
    for (const s of ufStats) {
      if (!byRegiao.has(s.regiao)) byRegiao.set(s.regiao, { dot: 0, liq: 0, count: 0 });
      const r = byRegiao.get(s.regiao)!;
      r.dot += s.dotacao;
      r.liq += s.liquidado;
      r.count += s.count;
    }

    // Vinculado vs Transversal
    const vinculadoKws = ['indígen', 'indigen', 'saúde indígen', 'educação indígen', 'sesai', 'funai'];
    const transversalKws = ['igualdade racial', 'promoção da igualdade', 'quilombol', 'matriz africana', 'afrodescendente'];
    const isVinculado = (r: DadoOrcamentario) => {
      const txt = [r.programa, r.descritivo, r.observacoes].filter(Boolean).join(' ').toLowerCase();
      return vinculadoKws.some(kw => txt.includes(kw));
    };
    const vinculados = records.filter(isVinculado);
    const transversais = records.filter(r => {
      const txt = [r.programa, r.descritivo, r.observacoes].filter(Boolean).join(' ').toLowerCase();
      return transversalKws.some(kw => txt.includes(kw)) && !isVinculado(r);
    });
    const vDot = vinculados.reduce((s, r) => s + (Number(r.dotacao_inicial) || 0), 0);
    const vLiq = vinculados.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
    const tDot = transversais.reduce((s, r) => s + (Number(r.dotacao_inicial) || 0), 0);
    const tLiq = transversais.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);

    return {
      byUF, byYear, dotP1, dotP2, liqP1, liqP2, execP1, execP2,
      varDot: dotP1 > 0 ? ((dotP2 - dotP1) / dotP1 * 100) : 0,
      varLiq: liqP1 > 0 ? ((liqP2 - liqP1) / liqP1 * 100) : 0,
      byGroup, ufStats, totalUFs: byUF.size, byRegiao,
      vinculadoExec: vDot > 0 ? (vLiq / vDot * 100) : 0,
      transversalExec: tDot > 0 ? (tLiq / tDot * 100) : 0,
      vDot, vLiq, tDot, tLiq,
    };
  }, [records]);

  if (!analysis) return null;

  const yearData = Array.from(analysis.byYear.entries())
    .map(([ano, v]) => ({ ano, dotacao: v.dotacao, liquidado: v.liquidado, exec: v.dotacao > 0 ? (v.liquidado / v.dotacao * 100) : 0 }))
    .sort((a, b) => a.ano - b.ano);

  // Top 10 UFs for bar comparison
  const top10UFs = analysis.ufStats.slice(0, 10);

  // Regional radar data
  const radarData = Array.from(analysis.byRegiao.entries()).map(([regiao, v]) => ({
    regiao: REGIAO_LABELS[regiao] || regiao,
    dotacao: v.dot,
    liquidado: v.liq,
    exec: v.dot > 0 ? (v.liq / v.dot * 100) : 0,
  }));

  // UF comparison bar chart data (exec P1 vs P2)
  const ufComparisonData = analysis.ufStats.filter(s => s.dotP1 > 0 || s.dotP2 > 0).slice(0, 12).map(s => ({
    uf: s.uf,
    execP1: s.execP1,
    execP2: s.execP2,
  }));

  return (
    <div className="space-y-6">
      {/* Nota explicativa */}
      <Card className="border-l-4 border-l-chart-2">
        <CardContent className="pt-4 pb-3">
          <div className="flex items-start gap-2">
            <Building2 className="w-5 h-5 text-chart-2 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Resumo Comparativo — Esfera Estadual (2018–2025)</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Dados extraídos via <strong>MSC/PPA (Matriz de Saldos Contábeis)</strong> de {analysis.totalUFs} estados.
                A métrica principal é a <strong>Dotação Inicial</strong>, complementada pela <strong>Liquidação</strong> para medir a efetividade real.
                Dados de 2025 são parciais (até 6º bimestre) e devem ser interpretados com cautela.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards comparativos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-l-4 border-l-primary/60">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Dotação 2018–2022</p>
            <p className="text-lg font-bold">{formatCurrency(analysis.dotP1)}</p>
            <p className="text-[10px] text-muted-foreground">Exec. média: {analysis.execP1.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success/60">
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Dotação 2023–2025</p>
            <p className="text-lg font-bold text-success">{formatCurrency(analysis.dotP2)}</p>
            <p className="text-[10px] text-muted-foreground">Exec. média: {analysis.execP2.toFixed(1)}%</p>
          </CardContent>
        </Card>
        <Card className="border-l-4" style={{ borderLeftColor: analysis.varDot >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Variação Dotação</p>
            <p className={`text-lg font-bold ${analysis.varDot >= 0 ? 'text-success' : 'text-destructive'}`}>
              {analysis.varDot >= 0 ? '+' : ''}{analysis.varDot.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
        <Card className="border-l-4" style={{ borderLeftColor: analysis.varLiq >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
          <CardContent className="pt-4 pb-3">
            <p className="text-xs text-muted-foreground">Variação Liquidado</p>
            <p className={`text-lg font-bold ${analysis.varLiq >= 0 ? 'text-success' : 'text-destructive'}`}>
              {analysis.varLiq >= 0 ? '+' : ''}{analysis.varLiq.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Infográfico: Vinculado vs Transversal */}
      <Card className="border-l-4 border-l-warning">
        <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Scale className="w-4 h-4 text-warning" /> Disparidade: Vinculado vs. Transversal (Omissão Seletiva)</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-success/5 rounded-lg p-4 border border-success/20">
              <p className="font-semibold text-sm text-foreground">Educação/Saúde Indígena (Vinculado)</p>
              <p className="text-2xl font-bold text-success mt-1">{analysis.vinculadoExec.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Dotação: {formatCurrency(analysis.vDot)} · Liquidado: {formatCurrency(analysis.vLiq)}</p>
              <p className="text-[10px] text-muted-foreground mt-2">Repasses federais obrigatórios (fundo a fundo). A máquina estatal <strong>consegue gastar</strong>.</p>
            </div>
            <div className="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
              <p className="font-semibold text-sm text-foreground">Igualdade Racial / Quilombola (Transversal)</p>
              <p className="text-2xl font-bold text-destructive mt-1">{analysis.transversalExec.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">Dotação: {formatCurrency(analysis.tDot)} · Liquidado: {formatCurrency(analysis.tLiq)}</p>
              <p className="text-[10px] text-muted-foreground mt-2">Recursos discricionários. Primeiros a sofrer contingenciamento seletivo.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico evolução anual + taxa execução */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-sm">Evolução Anual — Dotação vs. Liquidação (Estadual)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                  <Tooltip formatter={(value: number, name: string) => [formatCurrencyFull(value), name === 'dotacao' ? 'Dotação Inicial' : 'Liquidado']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend verticalAlign="top" height={30} />
                  <Bar dataKey="dotacao" name="Dotação Inicial" fill="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="liquidado" name="Liquidado" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm">Taxa de Execução Anual (%) — "Gap de Implementação"</CardTitle></CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={yearData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Execução']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="exec" name="% Execução" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ fill: 'hsl(var(--destructive))' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Comparativo UF: Execução P1 vs P2 */}
      {ufComparisonData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              Comparativo por UF: Execução P1 (2018–2022) vs. P2 (2023–2025)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ufComparisonData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis type="category" dataKey="uf" tick={{ fontSize: 11 }} width={40} />
                  <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name === 'execP1' ? '2018–2022' : '2023–2025']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                  <Legend verticalAlign="top" height={30} />
                  <Bar dataKey="execP1" name="2018–2022" fill="hsl(var(--chart-1))" radius={[0, 3, 3, 0]} barSize={12} />
                  <Bar dataKey="execP2" name="2023–2025" fill="hsl(var(--chart-2))" radius={[0, 3, 3, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              * Dados de 2025 são parciais (até 6º bimestre). A execução final pode ser significativamente diferente.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dotação por Região */}
      {radarData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">Distribuição Regional — Dotação e Execução</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={radarData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="regiao" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip formatter={(value: number, name: string) => [name === 'exec' ? `${(value as number).toFixed(1)}%` : formatCurrencyFull(value), name === 'dotacao' ? 'Dotação' : name === 'liquidado' ? 'Liquidado' : '% Exec']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend verticalAlign="top" height={30} />
                    <Bar dataKey="dotacao" name="Dotação" fill="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="liquidado" name="Liquidado" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Região</TableHead>
                      <TableHead className="text-right">Dotação</TableHead>
                      <TableHead className="text-right">Liquidado</TableHead>
                      <TableHead className="text-right">% Exec</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {radarData.sort((a, b) => b.dotacao - a.dotacao).map(r => (
                      <TableRow key={r.regiao}>
                        <TableCell className="font-medium text-xs">{r.regiao}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{formatCurrency(r.dotacao)}</TableCell>
                        <TableCell className="text-right font-mono text-xs">{formatCurrency(r.liquidado)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant={r.exec >= 60 ? 'default' : r.exec >= 30 ? 'secondary' : 'destructive'} className="text-[10px]">
                            {r.exec.toFixed(1)}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking por UF */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Ranking de Execução por Estado (2018–2025)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">#</TableHead>
                <TableHead>UF</TableHead>
                <TableHead>Região</TableHead>
                <TableHead className="text-right">Dotação Total</TableHead>
                <TableHead className="text-right">Liquidado Total</TableHead>
                <TableHead className="text-right">% Execução</TableHead>
                <TableHead className="text-right">Registros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.ufStats.map((s, i) => (
                <TableRow key={s.uf}>
                  <TableCell className="font-mono text-xs">{i + 1}</TableCell>
                  <TableCell><Badge variant="outline">{s.uf}</Badge></TableCell>
                  <TableCell className="text-xs text-muted-foreground">{REGIAO_LABELS[s.regiao] || s.regiao}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatCurrency(s.dotacao)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatCurrency(s.liquidado)}</TableCell>
                  <TableCell className="text-right">
                    <Badge variant={s.exec >= 60 ? 'default' : s.exec >= 30 ? 'secondary' : 'destructive'} className="text-xs">
                      {s.exec.toFixed(1)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs">{s.count}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Análise por Grupo Focal */}
      <Card>
        <CardHeader><CardTitle className="text-sm">Execução por Grupo Étnico-Racial</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                <TableHead className="text-right">Dotação P1</TableHead>
                <TableHead className="text-right">Liquidado P1</TableHead>
                <TableHead className="text-right">% Exec P1</TableHead>
                <TableHead className="text-right">Dotação P2</TableHead>
                <TableHead className="text-right">Liquidado P2</TableHead>
                <TableHead className="text-right">% Exec P2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from(analysis.byGroup.entries()).map(([group, g]) => (
                <TableRow key={group}>
                  <TableCell className="font-medium text-xs">{group}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatCurrency(g.dotP1)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatCurrency(g.liqP1)}</TableCell>
                  <TableCell className="text-right text-xs">{g.dotP1 > 0 ? (g.liqP1 / g.dotP1 * 100).toFixed(1) : '—'}%</TableCell>
                  <TableCell className="text-right font-mono text-xs text-success">{formatCurrency(g.dotP2)}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-success">{formatCurrency(g.liqP2)}</TableCell>
                  <TableCell className="text-right text-xs">{g.dotP2 > 0 ? (g.liqP2 / g.dotP2 * 100).toFixed(1) : '—'}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insights-chave */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-4 pb-3">
          <h4 className="font-semibold text-sm mb-3">🔑 Insights-Chave</h4>
          <div className="text-xs text-muted-foreground space-y-2">
            <div className="bg-destructive/5 rounded p-3 border border-destructive/20">
              <p className="font-semibold text-foreground mb-1">Orçamento Simbólico</p>
              <p>Em estados como MA, PI e RJ, ações de "Promoção da Igualdade Racial" mantêm liquidação inferior a 25% da dotação inicial, caracterizando políticas de baixa efetividade orçamentária.</p>
            </div>
            <div className="bg-warning/5 rounded p-3 border border-warning/20">
              <p className="font-semibold text-foreground mb-1">Dualidade Indígena vs. Racial</p>
              <p>Ações para povos indígenas (AM, MS, MT) mantêm taxas de liquidação superiores às de igualdade racial/quilombola. As políticas de Promoção da Igualdade Racial são as primeiras a sofrer cortes.</p>
            </div>
            <div className="bg-muted/50 rounded p-3">
              <p className="font-semibold text-foreground mb-1">Invisibilidade RJ e DF</p>
              <p>Rio de Janeiro e Distrito Federal apresentam dotações elevadas, mas taxas de liquidação que não acompanham a complexidade das demandas locais.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AuditFooter
        fontes={[
          { nome: 'SICONFI — Tesouro Nacional (MSC/PPA)', url: 'https://siconfi.tesouro.gov.br/siconfi/pages/public/declaracao/declaracao_list.jsf' },
          { nome: 'Portais de Transparência Estaduais', url: 'https://www.tesourotransparente.gov.br/' },
        ]}
        documentos={['CERD/C/BRA/CO/18-20 §14', 'Art. 2º ICERD — Medidas Especiais']}
      />
    </div>
  );
}

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { AlertTriangle, Building2, TrendingUp, TrendingDown, MapPin } from 'lucide-react';
import { AuditFooter } from '@/components/ui/audit-footer';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

interface Props {
  records: DadoOrcamentario[];
  formatCurrency: (v: number) => string;
  formatCurrencyFull: (v: number) => string;
}

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

    // Top/bottom executors
    const ufStats = Array.from(byUF.entries()).map(([uf, recs]) => {
      const dot = recs.reduce((s, r) => s + (Number(r.dotacao_inicial) || 0), 0);
      const liq = recs.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
      return { uf, dotacao: dot, liquidado: liq, exec: dot > 0 ? (liq / dot * 100) : 0, count: recs.length };
    }).sort((a, b) => b.dotacao - a.dotacao);

    return {
      byUF, byYear, dotP1, dotP2, liqP1, liqP2, execP1, execP2,
      varDot: dotP1 > 0 ? ((dotP2 - dotP1) / dotP1 * 100) : 0,
      varLiq: liqP1 > 0 ? ((liqP2 - liqP1) / liqP1 * 100) : 0,
      byGroup, ufStats, totalUFs: byUF.size,
    };
  }, [records]);

  if (!analysis) return null;

  const yearData = Array.from(analysis.byYear.entries())
    .map(([ano, v]) => ({ ano, dotacao: v.dotacao, liquidado: v.liquidado, exec: v.dotacao > 0 ? (v.liquidado / v.dotacao * 100) : 0 }))
    .sort((a, b) => a.ano - b.ano);

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
                Dados de 2025 são parciais (até 6º bimestre).
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

      {/* Gráfico evolução anual */}
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

      {/* Conclusão interpretativa */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-4 pb-3">
          <h4 className="font-semibold text-sm mb-3">📊 Diagnóstico Estadual — "Orçamento de Papel"</h4>
          <div className="text-xs text-muted-foreground space-y-3">
            <div>
              <p className="font-semibold text-foreground mb-1">A. Período da "Trava Institucional" (2018–2022)</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Ações "Zumbis":</strong> Muitas ações de promoção da igualdade racial apareciam no orçamento com valores simbólicos, impedindo qualquer execução real.</li>
                <li><strong>Liquidação Inexistente:</strong> Estados como RJ, RS e MA tiveram anos com 0% de liquidação em ações de fomento à cultura negra.</li>
                <li><strong>Exceção — Vinculados:</strong> A única frente que não "travou" foi a Educação/Saúde Indígena (repasses federais obrigatórios, com execução &gt;80%).</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">B. Período da "Retomada sem Entrega" (2023–2025)</p>
              <ul className="list-disc pl-4 space-y-1">
                <li><strong>Explosão da Dotação:</strong> Novos PPAs (2024-2027) apresentam dotações até 3x maiores que o ciclo anterior.</li>
                <li><strong>Novo Gargalo:</strong> Embora o orçamento exista no papel, a liquidação real em 2025 (até 6º bim) é criticamente baixa, evidenciando que as máquinas estaduais não recuperaram capacidade operacional.</li>
                <li><strong>"Efeito Tesoura":</strong> Em quase todos os 27 estados, a dotação sobe e a liquidação não acompanha, gerando um represamento crescente de recursos.</li>
              </ul>
            </div>
            <div className="bg-muted/50 rounded p-3 mt-3">
              <p className="font-semibold text-foreground mb-1">🔑 Achado Central para o CERD</p>
              <p>O Brasil saiu de um cenário de <strong>negação da política</strong> (2018–2022) para um cenário de <strong>incapacidade de implementação</strong> (2023–2025). O recurso é empenhado para cumprir formalidades, mas não é liquidado. Ações de Igualdade Racial raramente ultrapassam 25% de liquidação, contrastando com Educação Indígena (recursos vinculados) que atinge 80%. Isso demonstra uma <strong>omissão seletiva</strong> — a máquina estatal consegue gastar quando quer.</p>
            </div>
            <div className="mt-3">
              <p className="font-semibold text-foreground mb-1">C. Dualidade Indígena vs. Racial</p>
              <p>Ações voltadas para povos indígenas (AM, MS, MT) mantêm taxas de liquidação superiores às de igualdade racial/quilombola. As políticas de Promoção da Igualdade Racial são as primeiras a sofrer cortes orçamentários (contingenciamento seletivo).</p>
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

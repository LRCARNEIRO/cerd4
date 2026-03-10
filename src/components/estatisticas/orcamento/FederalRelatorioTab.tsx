import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Building, FileText, Scale, TrendingUp, Users, TreePine, MapPin, Tent, ShieldAlert, BookOpen } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { AuditFooter } from '@/components/ui/audit-footer';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';
import { ARTIGOS_CONVENCAO, inferArtigosOrcamento, type ArtigoConvencao } from '@/utils/artigosConvencao';

interface Props {
  records: DadoOrcamentario[];
  sesaiRecords: DadoOrcamentario[];
  summaryStats: {
    pagoPeriodo1: number;
    pagoPeriodo2: number;
    variacaoPago: number;
    totalRegistros: number;
    totalProgramas: number;
    anosCobertura: number[];
    semSesai?: {
      pagoP1: number;
      pagoP2: number;
      variacaoPago: number;
    };
  };
  formatCurrency: (v: number) => string;
  formatCurrencyFull: (v: number) => string;
}

/** Classify thematic category — mirrors Orcamento page logic */
function classifyThematic(r: DadoOrcamentario): 'racial' | 'indigena' | 'quilombola' | 'ciganos' | 'sesai' {
  const prog = r.programa.toLowerCase();
  const orgao = r.orgao.toUpperCase();
  const obs = ((r as any).observacoes || '').toLowerCase();
  if (orgao === 'SESAI' || obs.includes('saúde indígena') || obs.includes('sesai') ||
      prog.includes('20yp') || prog.includes('7684')) return 'sesai';
  if (['FUNAI', 'MPI'].includes(orgao) || prog.includes('indigen') || prog.includes('indígen') || prog.includes('2065')) return 'indigena';
  if (prog.includes('quilomb') || prog.includes('20g7') || prog.includes('0859')) return 'quilombola';
  if (prog.includes('cigano') || prog.includes('romani') || prog.includes('povo cigano')) return 'ciganos';
  return 'racial';
}


const ARTIGO_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))', 'hsl(var(--primary))', 'hsl(var(--chart-2))'];

function IcerdArtigosSection({ records, sesaiRecords, formatCurrency, sectionNumber }: {
  records: DadoOrcamentario[];
  sesaiRecords: DadoOrcamentario[];
  formatCurrency: (v: number) => string;
  sectionNumber: number;
}) {
  const icerdData = useMemo(() => {
    const allRecords = [...records, ...sesaiRecords];
    
    const byArtigo = new Map<ArtigoConvencao, { records: DadoOrcamentario[]; liquidado: number; pago: number; programas: Set<string> }>();
    for (const art of ARTIGOS_CONVENCAO) {
      byArtigo.set(art.numero, { records: [], liquidado: 0, pago: 0, programas: new Set() });
    }

    let unmappedCount = 0;
    for (const r of allRecords) {
      const arts = inferArtigosOrcamento(r);
      if (arts.length === 0) { unmappedCount++; continue; }
      for (const a of arts) {
        const entry = byArtigo.get(a);
        if (entry) {
          entry.records.push(r);
          entry.liquidado += Number(r.liquidado) || 0;
          entry.pago += Number(r.pago) || Number(r.dotacao_autorizada) || 0;
          entry.programas.add(r.programa);
        }
      }
    }

    const totalLiq = allRecords.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
    const chartData = ARTIGOS_CONVENCAO.map((art, i) => {
      const entry = byArtigo.get(art.numero)!;
      return {
        name: `Art. ${art.numero}`,
        titulo: art.titulo,
        liquidado: entry.liquidado,
        pago: entry.pago,
        programas: entry.programas.size,
        registros: entry.records.length,
        pct: totalLiq > 0 ? (entry.liquidado / totalLiq * 100) : 0,
        fill: ARTIGO_COLORS[i],
      };
    }).filter(d => d.registros > 0);

    return { chartData, byArtigo, unmappedCount, totalRecords: allRecords.length, totalLiq };
  }, [records, sesaiRecords]);

  if (icerdData.chartData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          {sectionNumber}. Cruzamento Orçamentário × Artigos da Convenção ICERD
        </CardTitle>
        <p className="text-[10px] text-muted-foreground">
          Mapeamento automático das {icerdData.totalRecords} ações orçamentárias aos artigos I–VII da Convenção.
          {icerdData.unmappedCount > 0 && ` ${icerdData.unmappedCount} registros sem mapeamento.`}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart + Table side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Bar chart */}
          <div>
            <p className="text-xs font-medium text-center mb-2">Liquidado por Artigo da Convenção</p>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={icerdData.chartData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={50} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Liquidado']}
                    labelFormatter={(label) => {
                      const item = icerdData.chartData.find(d => d.name === label);
                      return `${label} — ${item?.titulo || ''}`;
                    }}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Bar dataKey="liquidado" radius={[0, 4, 4, 0]}>
                    {icerdData.chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary table */}
          <div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">Artigo</TableHead>
                  <TableHead className="text-right text-[10px]">Liquidado</TableHead>
                  <TableHead className="text-right text-[10px]">% Total</TableHead>
                  <TableHead className="text-right text-[10px]">Programas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {icerdData.chartData.map((d, i) => (
                  <TableRow key={d.name}>
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                        <div>
                          <span className="text-xs font-medium">{d.name}</span>
                          <p className="text-[10px] text-muted-foreground">{d.titulo}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatCurrency(d.liquidado)}</TableCell>
                    <TableCell className="text-right text-xs">{d.pct.toFixed(1)}%</TableCell>
                    <TableCell className="text-right text-xs">{d.programas}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Analytical insight */}
        <div className="bg-primary/5 rounded p-3 border border-primary/20">
          <p className="text-xs font-semibold text-foreground mb-1">
            <Scale className="w-3.5 h-3.5 inline mr-1" />
            Síntese Analítica
          </p>
          <p className="text-xs text-muted-foreground">
            {(() => {
              const sorted = [...icerdData.chartData].sort((a, b) => b.liquidado - a.liquidado);
              const top = sorted[0];
              const bottom = sorted.filter(d => d.liquidado > 0).pop();
              const zeroArts = ARTIGOS_CONVENCAO.filter(a => {
                const entry = icerdData.byArtigo.get(a.numero);
                return !entry || entry.records.length === 0;
              });
              return (
                <>
                  O <strong>{top?.name} ({top?.titulo})</strong> concentra {top?.pct.toFixed(1)}% do liquidado total,
                  refletindo a predominância de ações em seu escopo temático.
                  {bottom && bottom.name !== top?.name && (
                    <> O <strong>{bottom.name} ({bottom.titulo})</strong> recebe apenas {bottom.pct.toFixed(1)}%, sinalizando subfinanciamento relativo.</>
                  )}
                  {zeroArts.length > 0 && (
                    <> Os artigos {zeroArts.map(a => a.numero).join(', ')} não possuem ações orçamentárias mapeadas, indicando lacunas de cobertura.</>
                  )}
                </>
              );
            })()}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

export function FederalRelatorioTab({ records, sesaiRecords, summaryStats, formatCurrency, formatCurrencyFull }: Props) {
  const analysis = useMemo(() => {
    if (records.length === 0) return null;

    const allRecords = records;
    const nonSesai = allRecords.filter(r => classifyThematic(r) !== 'sesai');

    const valorEfetivo = (r: DadoOrcamentario) => Number(r.pago) || 0;
    const dotacao = (r: DadoOrcamentario) => Number(r.dotacao_inicial) || Number(r.dotacao_autorizada) || 0;
    const liquidado = (r: DadoOrcamentario) => Number(r.liquidado) || 0;

    // Period splits
    const p1 = allRecords.filter(r => r.ano >= 2018 && r.ano <= 2022);
    const p2 = allRecords.filter(r => r.ano >= 2023 && r.ano <= 2025);
    const p1NoSesai = nonSesai.filter(r => r.ano >= 2018 && r.ano <= 2022);
    const p2NoSesai = nonSesai.filter(r => r.ano >= 2023 && r.ano <= 2025);

    const totalPagoP1 = p1.reduce((s, r) => s + valorEfetivo(r), 0);
    const totalPagoP2 = p2.reduce((s, r) => s + valorEfetivo(r), 0);
    const totalDotP1 = p1.reduce((s, r) => s + dotacao(r), 0);
    const totalDotP2 = p2.reduce((s, r) => s + dotacao(r), 0);
    const totalLiqP1 = summaryStats?.liquidadoPeriodo1 ?? p1.reduce((s, r) => s + liquidado(r), 0);
    const totalLiqP2 = summaryStats?.liquidadoPeriodo2 ?? p2.reduce((s, r) => s + liquidado(r), 0);

    const pagoP1NoSesai = p1NoSesai.reduce((s, r) => s + valorEfetivo(r), 0);
    const pagoP2NoSesai = p2NoSesai.reduce((s, r) => s + valorEfetivo(r), 0);
    const dotP1NoSesai = p1NoSesai.reduce((s, r) => s + dotacao(r), 0);
    const dotP2NoSesai = p2NoSesai.reduce((s, r) => s + dotacao(r), 0);
    const liqP1NoSesai = summaryStats?.semSesai?.liquidadoP1 ?? p1NoSesai.reduce((s, r) => s + liquidado(r), 0);
    const liqP2NoSesai = summaryStats?.semSesai?.liquidadoP2 ?? p2NoSesai.reduce((s, r) => s + liquidado(r), 0);

    const sesaiP1 = sesaiRecords.filter(r => r.ano >= 2018 && r.ano <= 2022);
    const sesaiP2 = sesaiRecords.filter(r => r.ano >= 2023 && r.ano <= 2025);
    const sesaiPagoP1 = sesaiP1.reduce((s, r) => s + valorEfetivo(r), 0);
    const sesaiPagoP2 = sesaiP2.reduce((s, r) => s + valorEfetivo(r), 0);
    const sesaiLiqP1 = totalLiqP1 - liqP1NoSesai;
    const sesaiLiqP2 = totalLiqP2 - liqP2NoSesai;
    const sesaiPctP1 = totalLiqP1 > 0 ? (sesaiLiqP1 / totalLiqP1 * 100) : 0;
    const sesaiPctP2 = totalLiqP2 > 0 ? (sesaiLiqP2 / totalLiqP2 * 100) : 0;

    // Thematic breakdown
    type ThemeKey = 'racial' | 'indigena' | 'quilombola' | 'ciganos' | 'sesai';
    const themes: { key: ThemeKey; label: string; icon: string; color: string }[] = [
      { key: 'racial', label: 'Política Racial (MIR/SEPPIR)', icon: '👤', color: 'hsl(var(--primary))' },
      { key: 'indigena', label: 'Povos Indígenas (FUNAI/MPI)', icon: '🌲', color: 'hsl(var(--success))' },
      { key: 'quilombola', label: 'Quilombolas (INCRA)', icon: '📍', color: 'hsl(var(--chart-3))' },
      { key: 'ciganos', label: 'Ciganos/Romani', icon: '⛺', color: 'hsl(var(--chart-4))' },
      { key: 'sesai', label: 'SESAI (Saúde Indígena)', icon: '🏥', color: 'hsl(var(--chart-5))' },
    ];

    const themeData = themes.map(t => {
      const recs = allRecords.filter(r => classifyThematic(r) === t.key);
      const tp1 = recs.filter(r => r.ano >= 2018 && r.ano <= 2022);
      const tp2 = recs.filter(r => r.ano >= 2023 && r.ano <= 2025);
      return {
        ...t,
        pagoP1: tp1.reduce((s, r) => s + valorEfetivo(r), 0),
        pagoP2: tp2.reduce((s, r) => s + valorEfetivo(r), 0),
        liqP1: tp1.reduce((s, r) => s + liquidado(r), 0),
        liqP2: tp2.reduce((s, r) => s + liquidado(r), 0),
        dotP1: tp1.reduce((s, r) => s + dotacao(r), 0),
        dotP2: tp2.reduce((s, r) => s + dotacao(r), 0),
        programas: new Set(recs.map(r => r.programa)).size,
        registros: recs.length,
      };
    });

    // Top programs (non-SESAI)
    const progTotals: Record<string, { liquidado: number; orgao: string; dot: number }> = {};
    nonSesai.forEach(r => {
      const key = r.programa;
      if (!progTotals[key]) progTotals[key] = { liquidado: 0, orgao: r.orgao, dot: 0 };
      progTotals[key].liquidado += liquidado(r);
      progTotals[key].dot += dotacao(r);
    });
    const topPrograms = Object.entries(progTotals)
      .sort((a, b) => b[1].liquidado - a[1].liquidado)
      .slice(0, 10);

    // Annual evolution
    const byYear: Record<number, { dotacao: number; liquidado: number; pago: number; dotSemSesai: number; pagoSemSesai: number }> = {};
    for (const r of allRecords) {
      if (!byYear[r.ano]) byYear[r.ano] = { dotacao: 0, liquidado: 0, pago: 0, dotSemSesai: 0, pagoSemSesai: 0 };
      byYear[r.ano].dotacao += dotacao(r);
      byYear[r.ano].liquidado += liquidado(r);
      byYear[r.ano].pago += valorEfetivo(r);
      if (classifyThematic(r) !== 'sesai') {
        byYear[r.ano].dotSemSesai += dotacao(r);
        byYear[r.ano].pagoSemSesai += valorEfetivo(r);
      }
    }
    const annualData = Object.entries(byYear)
      .map(([ano, v]) => ({ ano: Number(ano), ...v }))
      .sort((a, b) => a.ano - b.ano);

    // Execution rate
    const execP1 = totalDotP1 > 0 ? (totalLiqP1 / totalDotP1 * 100) : 0;
    const execP2 = totalDotP2 > 0 ? (totalLiqP2 / totalDotP2 * 100) : 0;

    const totalProgramas = new Set(allRecords.map(r => r.programa)).size;
    const anos = Array.from(new Set(allRecords.map(r => r.ano))).sort();

    return {
      totalPagoP1, totalPagoP2, totalDotP1, totalDotP2, totalLiqP1, totalLiqP2,
      pagoP1NoSesai, pagoP2NoSesai, dotP1NoSesai, dotP2NoSesai,
      liqP1NoSesai, liqP2NoSesai,
      sesaiPagoP1, sesaiPagoP2, sesaiLiqP1, sesaiLiqP2, sesaiPctP1, sesaiPctP2,
      execP1, execP2,
      themeData, topPrograms, annualData,
      totalProgramas, totalRegistros: allRecords.length, anos,
    };
  }, [records, sesaiRecords, summaryStats]);

  if (!analysis) return null;

  const varLiq = analysis.totalLiqP1 > 0 ? ((analysis.totalLiqP2 - analysis.totalLiqP1) / analysis.totalLiqP1 * 100) : 0;
  const varDot = analysis.totalDotP1 > 0 ? ((analysis.totalDotP2 - analysis.totalDotP1) / analysis.totalDotP1 * 100) : 0;
  const varLiqNoSesai = analysis.liqP1NoSesai > 0 ? ((analysis.liqP2NoSesai - analysis.liqP1NoSesai) / analysis.liqP1NoSesai * 100) : 0;

  return (
    <div className="space-y-6 print:space-y-4">
      {/* ═══ CABEÇALHO ═══ */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-5 pb-4">
          <div className="flex items-start gap-3">
            <FileText className="w-6 h-6 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-base">NOTA TÉCNICA: ANÁLISE DO FLUXO ORÇAMENTÁRIO ÉTNICO-RACIAL — ESFERA FEDERAL (2018–2025)</h3>
              <p className="text-xs text-muted-foreground mt-1">
                <strong>PARA:</strong> Comitê CERD/ONU — IV Relatório do Brasil &nbsp;|&nbsp;
                <strong>ASSUNTO:</strong> Execução Orçamentária de Políticas Raciais e Étnicas &nbsp;|&nbsp;
                <strong>PERÍODO:</strong> {analysis.anos[0]}–{analysis.anos[analysis.anos.length - 1]}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 italic">
                Relatório dinâmico — dados atualizados automaticamente a partir da base orçamentária.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ 1. SUMÁRIO EXECUTIVO ═══ */}
      <Card>
        <CardHeader><CardTitle className="text-sm">1. Sumário Executivo</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-3">
          <p>
            Esta nota analisa o investimento federal em políticas raciais e étnicas no Brasil entre {analysis.anos[0]} e {analysis.anos[analysis.anos.length - 1]},
            compreendendo <strong>{analysis.totalProgramas} programas</strong> e <strong>{analysis.totalRegistros} registros orçamentários</strong>.
            O período divide-se em duas fases estruturalmente distintas.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-l-4 border-l-primary/60">
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Liquidado 2018–2022</p>
                <p className="text-base font-bold">{formatCurrency(analysis.totalLiqP1)}</p>
                <p className="text-[10px]">Exec.: {analysis.execP1.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success/60">
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Liquidado 2023–2025</p>
                <p className="text-base font-bold text-success">{formatCurrency(analysis.totalLiqP2)}</p>
                <p className="text-[10px]">Exec.: {analysis.execP2.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card className="border-l-4" style={{ borderLeftColor: varLiq >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Variação Liquidado</p>
                <p className={`text-base font-bold ${varLiq >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {varLiq >= 0 ? '+' : ''}{varLiq.toFixed(1)}%
                </p>
                <p className="text-[10px]">P1 (5a) → P2 (3a)</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-chart-4">
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Sem SESAI</p>
                <p className={`text-base font-bold ${varLiqNoSesai >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {varLiqNoSesai >= 0 ? '+' : ''}{varLiqNoSesai.toFixed(1)}%
                </p>
                <p className="text-[10px]">Políticas stricto sensu</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-primary/10 rounded p-3 border border-primary/30">
            <p className="text-xs font-semibold text-foreground">
              ⚠️ Assimetria temporal: P1 = 5 anos (2018–2022), P2 = 3 anos (2023–2025). A comparação bruta superestima o crescimento real.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ 2. FUNDAMENTAÇÃO METODOLÓGICA ═══ */}
      <Card>
        <CardHeader><CardTitle className="text-sm">2. Fundamentação Metodológica</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-3">
          <p>A base foi construída através de uma estratégia de <strong>4 camadas de filtragem estrutural + 2 passos complementares de enriquecimento</strong>:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-muted/50 rounded p-3">
              <p className="font-semibold text-foreground text-xs mb-1">Camada 1 — Programas Temáticos PPA</p>
              <p>
                <strong>9 programas históricos</strong> (2034/SEPPIR, 0617/2065/5136 indígenas, 5802/5803/5804 MIR 2024+)
                + <strong>14 programas das Agendas Transversais</strong> do PPA 2024–2027 (Igualdade Racial e Povos Indígenas).
              </p>
              <p className="mt-1">
                <em>Filtro híbrido:</em> programas <strong>focais</strong> (MIR, MPI — ex: 1617, 5136) incluem todas as ações;
                programas <strong>universais</strong> (Bolsa Família, Educação Básica, CT&I, etc.) exigem palavras-chave raciais/étnicas no título da ação.
              </p>
            </div>
            <div className="bg-muted/50 rounded p-3">
              <p className="font-semibold text-foreground text-xs mb-1">Camada 2 — Subfunção 422</p>
              <p>Direitos Individuais, Coletivos e Difusos. Captura ações de igualdade racial em órgãos transversais, validadas por palavras-chave.</p>
            </div>
            <div className="bg-muted/50 rounded p-3">
              <p className="font-semibold text-foreground text-xs mb-1">Camada 3 — Órgãos MIR/MPI</p>
              <p>MIR (67000) e MPI (92000) — todas as despesas desses órgãos, deduplicadas contra Camadas 1 e 2.</p>
            </div>
            <div className="bg-muted/50 rounded p-3">
              <p className="font-semibold text-foreground text-xs mb-1">Camada 4 — SESAI (Saúde Indígena)</p>
              <p>Ações 20YP e 7684 capturadas por código de ação direto, necessário após migração da SESAI para programa genérico de saúde (5022).</p>
            </div>
            <div className="bg-amber-500/5 rounded p-3 border border-amber-500/20">
              <p className="font-semibold text-foreground text-xs mb-1">Passo 5 — Dotação via Dados Abertos (LOA)</p>
              <p>Arquivos ZIP/CSV do portal dados.gov.br complementam dotação inicial e autorizada, matching por chave Programa|Ação.</p>
            </div>
            <div className="bg-amber-500/5 rounded p-3 border border-amber-500/20">
              <p className="font-semibold text-foreground text-xs mb-1">Passo 6 — Ingestão Keyword-First</p>
              <p>Varredura ampla em ~40 subfunções usando 30+ palavras-chave raciais/étnicas para capturar ações dispersas não cobertas pelas 4 camadas estruturais.</p>
            </div>
          </div>

          <div className="bg-destructive/10 rounded p-3 border border-destructive/30 mt-2">
            <p className="text-xs font-semibold text-foreground mb-1">⚠️ Tratamento de Programas Genéricos / Universais</p>
            <p className="text-xs">
              Programas de grande escala como <strong>Minha Casa Minha Vida</strong> (R$ 100+ bi/ano), <strong>Bolsa Família</strong> (R$ 160+ bi/ano), 
              <strong> SUS</strong>, <strong>SUAS</strong> e similares <strong>não são incluídos integralmente</strong>.
              Quando presentes nas Agendas Transversais (ex: programa 5128/Bolsa Família), apenas ações cujo título contenha
              termos raciais/étnicos são retidas — evitando inflação artificial dos totais.
            </p>
            <p className="text-xs mt-2">
              Para o antigo <strong>5034 (MDHC)</strong>, que reunia ações genéricas junto com ações raciais, 
              <strong> somente ações com palavras-chave raciais/étnicas nos campos programa/descritivo</strong> foram retidas.
              Ações administrativas ou de direitos humanos gerais reclassificadas retroativamente pela API foram <strong>excluídas definitivamente</strong>.
            </p>
          </div>

          <div className="bg-primary/10 rounded p-3 border border-primary/30 mt-2">
            <p className="text-xs font-semibold text-foreground mb-1">📌 Diferença para a seção TESTE</p>
            <p className="text-xs">
              Esta seção utiliza a metodologia completa de <strong>4 camadas + 2 passos complementares</strong> (23 programas temáticos expandidos + subfunção 422 + órgãos MIR/MPI + SESAI + dotação LOA + keyword-first).
              A seção <strong>TESTE</strong> utiliza exclusivamente os 18 códigos de programas da <em>Agenda Transversal PPA 2024–2027</em>,
              resultando em cobertura mais restrita por design.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] font-medium text-foreground mr-1">Radicais de busca:</span>
            {['racial', 'quilombol', 'indígen', 'cigan', 'étnic', 'palmares', 'terreiro', 'capoeira', 'matriz africana', 'candomblé', 'umbanda', 'juventude negra'].map(r => (
              <Badge key={r} variant="secondary" className="text-[10px] font-mono">{r}*</Badge>
            ))}
          </div>
          <p className="text-[10px] mt-1">
            <strong>Exclusões definitivas:</strong> Programas genéricos sem recorte racial (Bolsa Família integral, MCMV, SUS, SUAS) e ações genéricas do MDHC (00SN, 0E85, 14XS, 21AR-21AU).
          </p>
        </CardContent>
      </Card>

      {/* ═══ 3. EFEITO MASCARAMENTO SESAI ═══ */}
      <Card>
        <CardHeader><CardTitle className="text-sm">3. O Efeito Mascaramento da SESAI</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-3">
          <p>
            A Saúde Indígena (SESAI) representa uma parcela dominante do orçamento étnico-racial federal.
            Sem sua remoção analítica, as demais políticas tornam-se estatisticamente invisíveis.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="bg-chart-5/5 border-chart-5/30">
              <CardContent className="pt-3 pb-2">
                <p className="font-semibold text-foreground text-xs">SESAI em 2018–2022</p>
                <p className="text-lg font-bold">{analysis.sesaiPctP1.toFixed(1)}%</p>
                <p className="text-[10px]">{formatCurrency(analysis.sesaiLiqP1)} de {formatCurrency(analysis.totalLiqP1)}</p>
              </CardContent>
            </Card>
            <Card className="bg-chart-5/5 border-chart-5/30">
              <CardContent className="pt-3 pb-2">
                <p className="font-semibold text-foreground text-xs">SESAI em 2023–2025</p>
                <p className="text-lg font-bold">{analysis.sesaiPctP2.toFixed(1)}%</p>
                <p className="text-[10px]">{formatCurrency(analysis.sesaiLiqP2)} de {formatCurrency(analysis.totalLiqP2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="pt-3 pb-2">
                <p className="font-semibold text-foreground text-xs">Demais Políticas</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(analysis.liqP1NoSesai)} → {formatCurrency(analysis.liqP2NoSesai)}
                </p>
                <p className="text-[10px]">{varLiqNoSesai >= 0 ? '+' : ''}{varLiqNoSesai.toFixed(1)}% de variação</p>
              </CardContent>
            </Card>
          </div>
          <div className="bg-muted/50 rounded p-3">
            <p className="text-xs">
              <strong>🔑 Insight:</strong> A queda da participação da SESAI ({analysis.sesaiPctP1.toFixed(0)}% → {analysis.sesaiPctP2.toFixed(0)}%)
              reflete o <em>crescimento exponencial das demais políticas</em>, não a redução da saúde indígena.
              Pela primeira vez, as políticas raciais <em>stricto sensu</em> ultrapassaram {formatCurrency(analysis.liqP2NoSesai)} em apenas 3 anos de liquidação acumulada.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ 4. DIAGNÓSTICO COMPARATIVO ═══ */}
      <Card>
        <CardHeader><CardTitle className="text-sm">4. Diagnóstico Comparativo: As Duas Fases</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-4">
          <div className="space-y-3">
            <div className="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
              <p className="font-semibold text-destructive mb-1">A. "Trava Institucional" (2018–2022)</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Dotação total: <strong>{formatCurrency(analysis.totalDotP1)}</strong> | Liquidado: <strong>{formatCurrency(analysis.totalLiqP1)}</strong> | Exec.: <strong>{analysis.execP1.toFixed(1)}%</strong></li>
                <li>Sem SESAI: <strong>{formatCurrency(analysis.liqP1NoSesai)}</strong> liquidados em 5 anos — média de {formatCurrency(analysis.liqP1NoSesai / 5)}/ano.</li>
                <li>As políticas raciais e étnicas não vinculadas à saúde permaneceram em baixa escala e com forte compressão orçamentária.</li>
                <li>FUNAI manteve operação mínima; INCRA com regularização quilombola travada.</li>
              </ul>
            </div>
            <div className="bg-success/5 rounded-lg p-4 border border-success/20">
              <p className="font-semibold text-success mb-1">B. "Retomada sem Entrega" (2023–2025)</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Dotação total: <strong>{formatCurrency(analysis.totalDotP2)}</strong> | Liquidado: <strong>{formatCurrency(analysis.totalLiqP2)}</strong> | Exec.: <strong>{analysis.execP2.toFixed(1)}%</strong></li>
                <li>Sem SESAI: <strong>{formatCurrency(analysis.liqP2NoSesai)}</strong> liquidados em 3 anos — média de {formatCurrency(analysis.liqP2NoSesai / 3)}/ano.</li>
                <li>Criação do MIR (2023) e MPI (2023). Novos programas PPA: 5802, 5803, 5804.</li>
                <li>"Efeito Tesoura": dotação sobe ({varDot >= 0 ? '+' : ''}{varDot.toFixed(1)}%), mas a liquidação não acompanha proporcionalmente.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ 5. DESAGREGAÇÃO POR GRUPO FOCAL ═══ */}
      <Card>
        <CardHeader><CardTitle className="text-sm">5. Desagregação por Grupo Focal e Período</CardTitle></CardHeader>
        <CardContent>
          <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Grupo Focal</TableHead>
                  <TableHead className="text-right">Liquidado 2018–2022</TableHead>
                  <TableHead className="text-right">Liquidado 2023–2025</TableHead>
                  <TableHead className="text-right">Dotação Total</TableHead>
                  <TableHead className="text-right">Programas</TableHead>
                  <TableHead className="text-right">Registros</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.themeData.map(t => (
                  <TableRow key={t.key}>
                    <TableCell className="font-medium text-xs">{t.icon} {t.label}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatCurrency(t.liqP1)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-success">{formatCurrency(t.liqP2)}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatCurrency(t.dotP1 + t.dotP2)}</TableCell>
                    <TableCell className="text-right text-xs">{t.programas}</TableCell>
                    <TableCell className="text-right text-xs">{t.registros}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ═══ 6. EVOLUÇÃO ANUAL ═══ */}
      {analysis.annualData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm">6. Evolução Anual — Dotação vs. Liquidação vs. Pagamento</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-center mb-2">Total (com SESAI)</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.annualData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                      <Tooltip
                        formatter={(value: number, name: string) => [formatCurrencyFull(value), name]}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="dotacao" name="Dotação" fill="hsl(var(--chart-1))" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="liquidado" name="Liquidado" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="pago" name="Pago" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-center mb-2">Sem SESAI</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis.annualData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                      <Tooltip
                        formatter={(value: number, name: string) => [formatCurrencyFull(value), name]}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar dataKey="dotSemSesai" name="Dotação" fill="hsl(var(--chart-4))" radius={[2, 2, 0, 0]} />
                      <Bar dataKey="pagoSemSesai" name="Pago" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ 7. RANKING DE PROGRAMAS ═══ */}
      {analysis.topPrograms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">7. Ranking: Programas com Maior Liquidação (excl. SESAI)</CardTitle>
            <p className="text-[10px] text-muted-foreground">Top {analysis.topPrograms.length} por valor liquidado acumulado ({analysis.anos[0]}–{analysis.anos[analysis.anos.length - 1]})</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {analysis.topPrograms.map(([programa, { liquidado, orgao, dot }], idx) => {
                const maxVal = analysis.topPrograms[0]?.[1].liquidado || 1;
                const pct = (liquidado / maxVal) * 100;
                const execRate = dot > 0 ? (liquidado / dot * 100) : null;
                const colors = ['hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
                return (
                  <div key={programa} className="space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <span className="text-xs font-bold text-muted-foreground w-5 text-right flex-shrink-0">{idx + 1}.</span>
                        <span className="text-xs truncate" title={programa}>{programa}</span>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">{orgao}</Badge>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {execRate !== null && (
                          <Badge variant={execRate >= 60 ? 'default' : execRate >= 25 ? 'secondary' : 'destructive'} className="text-[10px]">
                            {execRate.toFixed(0)}% exec.
                          </Badge>
                        )}
                        <span className="text-xs font-mono font-semibold">{formatCurrency(liquidado)}</span>
                      </div>
                    </div>
                    <div className="ml-7 h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colors[idx % colors.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ 8. CRUZAMENTO ARTIGOS ICERD ═══ */}
      <IcerdArtigosSection records={records} sesaiRecords={sesaiRecords} formatCurrency={formatCurrency} sectionNumber={8} />

      {/* ═══ 9. CONCLUSÃO E VEREDITO TÉCNICO (integra Seção 8 — ICERD) ═══ */}
      {(() => {
        // Compute ICERD data inline for integration into verdict
        const allRecs = [...records, ...sesaiRecords];
        const icerdByArtigo = ARTIGOS_CONVENCAO.map(art => {
          const matched = allRecs.filter(r => inferArtigosOrcamento(r).includes(art.numero));
          const liq = matched.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
          return { numero: art.numero, titulo: art.titulo, liquidado: liq, programas: new Set(matched.map(r => r.programa)).size, registros: matched.length };
        });
        const totalLiqIcerd = allRecs.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
        const artigosComDados = icerdByArtigo.filter(a => a.registros > 0).sort((a, b) => b.liquidado - a.liquidado);
        const artigosSemDados = icerdByArtigo.filter(a => a.registros === 0);
        const topArt = artigosComDados[0];
        const bottomArt = artigosComDados.length > 1 ? artigosComDados[artigosComDados.length - 1] : null;
        const topPct = topArt && totalLiqIcerd > 0 ? (topArt.liquidado / totalLiqIcerd * 100).toFixed(1) : '0';
        const bottomPct = bottomArt && totalLiqIcerd > 0 ? (bottomArt.liquidado / totalLiqIcerd * 100).toFixed(1) : '0';

        return (
          <Card className="border-l-4 border-l-destructive">
            <CardHeader><CardTitle className="text-sm">9. Conclusão e Veredito Técnico</CardTitle></CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-3">
              <div className="bg-destructive/5 rounded p-4 border border-destructive/20 space-y-2">
                <p className="font-bold text-foreground flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-destructive" />
                  Diagnóstico: "Orçamento de Papel"
                </p>
                <p>
                  A análise dos {analysis.totalRegistros} registros orçamentários federais ({analysis.anos[0]}–{analysis.anos[analysis.anos.length - 1]})
                  revela um padrão estrutural de <strong>planejamento sem execução</strong> nas políticas raciais <em>stricto sensu</em>.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <strong>Trava Institucional (2018–2022):</strong> Apenas {formatCurrency(analysis.liqP1NoSesai)} liquidados sem SESAI em 5 anos
                    — média anual de {formatCurrency(analysis.liqP1NoSesai / 5)}.
                  </li>
                  <li>
                    <strong>Retomada sem Entrega (2023–2025):</strong> A dotação cresceu {varDot >= 0 ? '+' : ''}{varDot.toFixed(1)}%,
                    mas a taxa de execução ({analysis.execP2.toFixed(1)}%) evidencia represamento na liquidação.
                  </li>
                  <li>
                    <strong>Evidência central:</strong> A SESAI concentrou {analysis.sesaiPctP1.toFixed(0)}% da liquidação em 2018–2022 e {analysis.sesaiPctP2.toFixed(0)}% em 2023–2025,
                    tornando visível o subfinanciamento relativo das demais políticas quando analisadas sem esse efeito de mascaramento.
                  </li>
                </ul>
              </div>

              {/* ── Integração da Seção 8: Cruzamento ICERD ── */}
              <div className="bg-primary/5 rounded p-4 border border-primary/20 space-y-2">
                <p className="font-bold text-foreground flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  Análise Integrada: Cobertura Orçamentária dos Artigos ICERD (I–VII)
                </p>
                <p>
                  O cruzamento das {allRecs.length} ações orçamentárias com os compromissos da Convenção (Seção 8) revela
                  <strong> assimetrias estruturais</strong> na alocação de recursos por artigo:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  {topArt && (
                    <li>
                      <strong>Art. {topArt.numero} ({topArt.titulo})</strong> concentra <strong>{topPct}%</strong> do liquidado total
                      ({formatCurrency(topArt.liquidado)}), com {topArt.programas} programa(s) mapeado(s)
                      — reflete a predominância temática do eixo saúde/indígena.
                    </li>
                  )}
                  {bottomArt && bottomArt.numero !== topArt?.numero && (
                    <li>
                      <strong>Art. {bottomArt.numero} ({bottomArt.titulo})</strong> recebe apenas <strong>{bottomPct}%</strong> ({formatCurrency(bottomArt.liquidado)})
                      — evidência de <em>subfinanciamento relativo</em> deste compromisso convencional.
                    </li>
                  )}
                  {artigosSemDados.length > 0 && (
                    <li>
                      <strong>{artigosSemDados.length} artigo(s) sem qualquer cobertura orçamentária:</strong>{' '}
                      {artigosSemDados.map(a => `Art. ${a.numero} (${a.titulo})`).join('; ')}
                      — configura <strong>lacuna de implementação</strong> em relação à Convenção.
                    </li>
                  )}
                  {artigosComDados.length >= 3 && (
                    <li>
                      <strong>Índice de concentração:</strong> Os 2 artigos mais financiados absorvem{' '}
                      {totalLiqIcerd > 0
                        ? ((artigosComDados[0].liquidado + artigosComDados[1].liquidado) / totalLiqIcerd * 100).toFixed(0)
                        : 0}% do liquidado total, indicando <em>desequilíbrio na cobertura</em> dos compromissos assumidos pelo Estado.
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-muted/50 rounded p-3 space-y-2">
                <p className="font-semibold text-foreground">Recomendações ao Comitê CERD:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Solicitar ao Brasil metas de <strong>liquidação mínima</strong> (≥70%) para todos os programas raciais do PPA 2024–2027.</li>
                  <li>Exigir <strong>desagregação por ação orçamentária</strong> no próximo relatório periódico, não apenas por função/subfunção.</li>
                  <li>Recomendar <strong>vinculação de receita</strong> para igualdade racial (similar à saúde/educação) para evitar contingenciamento recorrente.</li>
                  <li>Incluir a análise de <strong>dupla perspectiva (com/sem SESAI)</strong> como padrão metodológico em futuros relatórios sombra.</li>
                  {artigosSemDados.length > 0 && (
                    <li>
                      Solicitar <strong>plano de ação específico</strong> para os artigos {artigosSemDados.map(a => a.numero).join(', ')} da Convenção,
                      atualmente sem nenhuma ação orçamentária federal identificada.
                    </li>
                  )}
                  {bottomArt && Number(bottomPct) < 5 && (
                    <li>
                      Recomendar <strong>ampliação do financiamento</strong> ao Art. {bottomArt.numero} ({bottomArt.titulo}),
                      que recebe menos de 5% do liquidado total apesar de sua relevância convencional.
                    </li>
                  )}
                </ol>
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <AuditFooter
        fontes={[
          { nome: 'Portal da Transparência — Despesas Federais', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' },
          { nome: 'Dados Abertos — LOA', url: 'https://dados.gov.br/dados/conjuntos-dados/orcamento-despesa' },
          { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' },
        ]}
        documentos={[
          'CERD/C/BRA/CO/18-20 §14 (Observações Finais)',
          'Plano de Durban §157–162 (Recursos e Meios)',
          'ICERD Art. 2º — Medidas Especiais e Concretas',
        ]}
      />
    </div>
  );
}

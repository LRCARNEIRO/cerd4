import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, Building, FileText, Scale, TrendingUp, Users, TreePine, MapPin, Tent, ShieldAlert, BookOpen, Filter, Info, DollarSign, Layers } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
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

/** Classify thematic category */
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

/** Variation badge helper */
function VarBadge({ value, suffix = '' }: { value: number; suffix?: string }) {
  return (
    <div className={`text-center py-1 rounded text-sm font-bold ${value >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
      {value >= 0 ? '+' : ''}{value.toFixed(1)}%{suffix}
    </div>
  );
}

/** Section number badge */
function SN({ n }: { n: number }) {
  return <Badge variant="outline" className="text-[10px] font-mono px-1.5">{n}</Badge>;
}

export function FederalRelatorioTab({ records, sesaiRecords, summaryStats, formatCurrency, formatCurrencyFull }: Props) {
  const analysis = useMemo(() => {
    if (records.length === 0) return null;

    const allRecords = records;
    const nonSesai = allRecords.filter(r => classifyThematic(r) !== 'sesai');

    const valorEfetivo = (r: DadoOrcamentario) => Number(r.pago) || 0;
    const dotacao = (r: DadoOrcamentario) => Number(r.dotacao_inicial) || Number(r.dotacao_autorizada) || 0;
    const dotAutorizada = (r: DadoOrcamentario) => Number(r.dotacao_autorizada) || 0;
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
    const totalDotAutP1 = p1.reduce((s, r) => s + dotAutorizada(r), 0);
    const totalDotAutP2 = p2.reduce((s, r) => s + dotAutorizada(r), 0);
    const totalLiqP1 = p1.reduce((s, r) => s + liquidado(r), 0);
    const totalLiqP2 = p2.reduce((s, r) => s + liquidado(r), 0);

    const pagoP1NoSesai = p1NoSesai.reduce((s, r) => s + valorEfetivo(r), 0);
    const pagoP2NoSesai = p2NoSesai.reduce((s, r) => s + valorEfetivo(r), 0);
    const dotP1NoSesai = p1NoSesai.reduce((s, r) => s + dotAutorizada(r), 0);
    const dotP2NoSesai = p2NoSesai.reduce((s, r) => s + dotAutorizada(r), 0);
    const liqP1NoSesai = p1NoSesai.reduce((s, r) => s + liquidado(r), 0);
    const liqP2NoSesai = p2NoSesai.reduce((s, r) => s + liquidado(r), 0);

    const sesaiP1 = sesaiRecords.filter(r => r.ano >= 2018 && r.ano <= 2022);
    const sesaiP2 = sesaiRecords.filter(r => r.ano >= 2023 && r.ano <= 2025);
    const sesaiPagoP1 = sesaiP1.reduce((s, r) => s + valorEfetivo(r), 0);
    const sesaiPagoP2 = sesaiP2.reduce((s, r) => s + valorEfetivo(r), 0);
    const sesaiPctP1 = totalPagoP1 > 0 ? (sesaiPagoP1 / totalPagoP1 * 100) : 0;
    const sesaiPctP2 = totalPagoP2 > 0 ? (sesaiPagoP2 / totalPagoP2 * 100) : 0;

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
        dotP1: tp1.reduce((s, r) => s + dotAutorizada(r), 0),
        dotP2: tp2.reduce((s, r) => s + dotAutorizada(r), 0),
        programas: new Set(recs.map(r => r.programa)).size,
        registros: recs.length,
      };
    });

    // Top programs (non-SESAI)
    const progTotals: Record<string, { pago: number; orgao: string; dot: number }> = {};
    nonSesai.forEach(r => {
      const key = r.programa;
      if (!progTotals[key]) progTotals[key] = { pago: 0, orgao: r.orgao, dot: 0 };
      progTotals[key].pago += valorEfetivo(r);
      progTotals[key].dot += dotacao(r);
    });
    const topPrograms = Object.entries(progTotals)
      .sort((a, b) => b[1].pago - a[1].pago)
      .slice(0, 10);

    // Annual evolution
    const byYear: Record<number, { dotacao: number; liquidado: number; pago: number; dotSemSesai: number; pagoSemSesai: number; liqSemSesai: number }> = {};
    for (const r of allRecords) {
      if (!byYear[r.ano]) byYear[r.ano] = { dotacao: 0, liquidado: 0, pago: 0, dotSemSesai: 0, pagoSemSesai: 0, liqSemSesai: 0 };
      byYear[r.ano].dotacao += dotAutorizada(r);
      byYear[r.ano].liquidado += liquidado(r);
      byYear[r.ano].pago += valorEfetivo(r);
      if (classifyThematic(r) !== 'sesai') {
        byYear[r.ano].dotSemSesai += dotAutorizada(r);
        byYear[r.ano].pagoSemSesai += valorEfetivo(r);
        byYear[r.ano].liqSemSesai += liquidado(r);
      }
    }
    const annualData = Object.entries(byYear)
      .map(([ano, v]) => ({ ano: Number(ano), ...v }))
      .sort((a, b) => a.ano - b.ano);

    // Execution rate
    const execP1 = totalDotAutP1 > 0 ? (totalPagoP1 / totalDotAutP1 * 100) : 0;
    const execP2 = totalDotAutP2 > 0 ? (totalPagoP2 / totalDotAutP2 * 100) : 0;

    const totalProgramas = new Set(allRecords.map(r => r.programa)).size;
    const anos = Array.from(new Set(allRecords.map(r => r.ano))).sort();

    // ── Extraorçamentário analysis ──
    const extraRecs = records.filter(r => r.tipo_dotacao === 'extraorcamentario');
    const orcRecs = records.filter(r => r.tipo_dotacao !== 'extraorcamentario');
    const orcP1 = orcRecs.filter(r => r.ano >= 2018 && r.ano <= 2022);
    const orcP2 = orcRecs.filter(r => r.ano >= 2023 && r.ano <= 2025);
    const extraP1recs = extraRecs.filter(r => r.ano >= 2018 && r.ano <= 2022);
    const extraP2recs = extraRecs.filter(r => r.ano >= 2023 && r.ano <= 2025);

    const orcPagoP1 = orcP1.reduce((s, r) => s + valorEfetivo(r), 0);
    const orcPagoP2 = orcP2.reduce((s, r) => s + valorEfetivo(r), 0);
    const orcDotP1 = orcP1.reduce((s, r) => s + dotAutorizada(r), 0);
    const orcDotP2 = orcP2.reduce((s, r) => s + dotAutorizada(r), 0);
    const orcLiqP1 = orcP1.reduce((s, r) => s + liquidado(r), 0);
    const orcLiqP2 = orcP2.reduce((s, r) => s + liquidado(r), 0);
    const extraPagoP1 = extraP1recs.reduce((s, r) => s + valorEfetivo(r), 0);
    const extraPagoP2 = extraP2recs.reduce((s, r) => s + valorEfetivo(r), 0);
    const extraDotP1 = extraP1recs.reduce((s, r) => s + dotAutorizada(r), 0);
    const extraDotP2 = extraP2recs.reduce((s, r) => s + dotAutorizada(r), 0);
    const extraLiqP1 = extraP1recs.reduce((s, r) => s + liquidado(r), 0);
    const extraLiqP2 = extraP2recs.reduce((s, r) => s + liquidado(r), 0);
    const totalExtra = extraRecs.reduce((s, r) => s + valorEfetivo(r), 0);
    const totalOrc = orcRecs.reduce((s, r) => s + valorEfetivo(r), 0);

    // Por ano detalhado orç vs extra
    const orcByYear: Record<number, { pago: number; dotacao: number; liquidado: number }> = {};
    const extraByYear: Record<number, { pago: number; dotacao: number; liquidado: number }> = {};
    for (const r of orcRecs) {
      if (!orcByYear[r.ano]) orcByYear[r.ano] = { pago: 0, dotacao: 0, liquidado: 0 };
      orcByYear[r.ano].pago += valorEfetivo(r);
      orcByYear[r.ano].dotacao += dotAutorizada(r);
      orcByYear[r.ano].liquidado += liquidado(r);
    }
    for (const r of extraRecs) {
      if (!extraByYear[r.ano]) extraByYear[r.ano] = { pago: 0, dotacao: 0, liquidado: 0 };
      extraByYear[r.ano].pago += valorEfetivo(r);
      extraByYear[r.ano].dotacao += dotAutorizada(r);
      extraByYear[r.ano].liquidado += liquidado(r);
    }

    // Subtipo breakdown
    const subtipoMap: Record<string, number> = {};
    for (const r of extraRecs) {
      const st = r.subtipo_extraorcamentario || 'outros';
      subtipoMap[st] = (subtipoMap[st] || 0) + valorEfetivo(r);
    }

    // Masking chart data (stacked area orç vs extra)
    const dualYearData = anos.map(a => ({
      ano: a,
      orcamentario: orcByYear[a]?.pago || 0,
      extraorcamentario: extraByYear[a]?.pago || 0,
      total: (orcByYear[a]?.pago || 0) + (extraByYear[a]?.pago || 0),
    }));

    // SESAI masking chart data (stacked area com vs sem SESAI)
    const sesaiMaskData = annualData.map(d => ({
      ano: d.ano,
      comSesai: d.pago,
      semSesai: d.pagoSemSesai,
      sesai: d.pago - d.pagoSemSesai,
    }));

    return {
      totalPagoP1, totalPagoP2, totalDotP1, totalDotP2, totalDotAutP1, totalDotAutP2,
      totalLiqP1, totalLiqP2,
      pagoP1NoSesai, pagoP2NoSesai, dotP1NoSesai, dotP2NoSesai,
      liqP1NoSesai, liqP2NoSesai,
      sesaiPagoP1, sesaiPagoP2, sesaiPctP1, sesaiPctP2,
      execP1, execP2,
      themeData, topPrograms, annualData,
      totalProgramas, totalRegistros: allRecords.length, anos,
      totalExtra, totalOrc, extraCount: extraRecs.length, orcCount: orcRecs.length,
      orcPagoP1, orcPagoP2, orcDotP1, orcDotP2, orcLiqP1, orcLiqP2,
      extraPagoP1, extraPagoP2, extraDotP1, extraDotP2, extraLiqP1, extraLiqP2,
      subtipoMap, dualYearData, sesaiMaskData,
      orcByYear, extraByYear, byYear,
    };
  }, [records, sesaiRecords, summaryStats]);

  // ICERD data — must be before early return
  const icerdData = useMemo(() => {
    const allRecs = [...records, ...sesaiRecords];
    const byArtigo = new Map<ArtigoConvencao, { records: DadoOrcamentario[]; pago: number; programas: Set<string> }>();
    for (const art of ARTIGOS_CONVENCAO) {
      byArtigo.set(art.numero, { records: [], pago: 0, programas: new Set() });
    }
    let unmappedCount = 0;
    for (const r of allRecs) {
      const arts = inferArtigosOrcamento(r);
      if (arts.length === 0) { unmappedCount++; continue; }
      for (const a of arts) {
        const entry = byArtigo.get(a);
        if (entry) { entry.records.push(r); entry.pago += Number(r.pago) || 0; entry.programas.add(r.programa); }
      }
    }
    const totalPago = allRecs.reduce((s, r) => s + (Number(r.pago) || 0), 0);
    const chartData = ARTIGOS_CONVENCAO.map((art, i) => {
      const entry = byArtigo.get(art.numero)!;
      return {
        name: `Art. ${art.numero}`, titulo: art.titulo, pago: entry.pago,
        programas: entry.programas.size, registros: entry.records.length,
        pct: totalPago > 0 ? (entry.pago / totalPago * 100) : 0, fill: ARTIGO_COLORS[i],
      };
    }).filter(d => d.registros > 0);
    const artigosSemDados = ARTIGOS_CONVENCAO.filter(a => { const e = byArtigo.get(a.numero); return !e || e.records.length === 0; });
    return { chartData, byArtigo, unmappedCount, totalRecords: allRecs.length, totalPago, artigosSemDados };
  }, [records, sesaiRecords]);

  if (!analysis) return null;

  const varPago = analysis.totalPagoP1 > 0 ? ((analysis.totalPagoP2 - analysis.totalPagoP1) / analysis.totalPagoP1 * 100) : 0;
  const varDot = analysis.totalDotAutP1 > 0 ? ((analysis.totalDotAutP2 - analysis.totalDotAutP1) / analysis.totalDotAutP1 * 100) : 0;
  const varLiq = analysis.totalLiqP1 > 0 ? ((analysis.totalLiqP2 - analysis.totalLiqP1) / analysis.totalLiqP1 * 100) : 0;
  const varPagoNoSesai = analysis.pagoP1NoSesai > 0 ? ((analysis.pagoP2NoSesai - analysis.pagoP1NoSesai) / analysis.pagoP1NoSesai * 100) : 0;
  const varDotNoSesai = analysis.dotP1NoSesai > 0 ? ((analysis.dotP2NoSesai - analysis.dotP1NoSesai) / analysis.dotP1NoSesai * 100) : 0;
  const varLiqNoSesai = analysis.liqP1NoSesai > 0 ? ((analysis.liqP2NoSesai - analysis.liqP1NoSesai) / analysis.liqP1NoSesai * 100) : 0;
  const varOrcPago = analysis.orcPagoP1 > 0 ? ((analysis.orcPagoP2 - analysis.orcPagoP1) / analysis.orcPagoP1 * 100) : 0;
  const varExtraPago = analysis.extraPagoP1 > 0 ? ((analysis.extraPagoP2 - analysis.extraPagoP1) / analysis.extraPagoP1 * 100) : 0;
  const pctExtraTotal = (analysis.totalOrc + analysis.totalExtra) > 0 ? (analysis.totalExtra / (analysis.totalOrc + analysis.totalExtra) * 100) : 0;

  let sectionNum = 0;
  const nextSection = () => ++sectionNum;

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
                {analysis.totalRegistros} registros · {analysis.totalProgramas} programas · {analysis.anos.length} anos de cobertura.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ 1. SUMÁRIO EXECUTIVO ═══ */}
      <Card>
        <CardHeader><CardTitle className="text-sm"><SN n={nextSection()} /> Sumário Executivo</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-3">
          <p>
            Esta nota analisa o investimento federal em políticas raciais e étnicas no Brasil entre {analysis.anos[0]} e {analysis.anos[analysis.anos.length - 1]},
            compreendendo <strong>{analysis.totalProgramas} programas</strong> e <strong>{analysis.totalRegistros} registros orçamentários</strong>.
            O período divide-se em duas fases estruturalmente distintas: <strong>P1 (2018–2022, 5 anos)</strong> e <strong>P2 (2023–2025, 3 anos)</strong>.
          </p>

          {/* Comparação inicial Dotação × Pago × Liquidado */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Card className="border-l-4 border-l-chart-1">
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Dotação Autorizada Total</p>
                <p className="text-base font-bold">{formatCurrency(analysis.totalDotAutP1 + analysis.totalDotAutP2)}</p>
                <div className="flex justify-between text-[10px] mt-1">
                  <span>P1: {formatCurrency(analysis.totalDotAutP1)}</span>
                  <span className="text-success">P2: {formatCurrency(analysis.totalDotAutP2)}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-chart-2">
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Liquidado Total</p>
                <p className="text-base font-bold">{formatCurrency(analysis.totalLiqP1 + analysis.totalLiqP2)}</p>
                <div className="flex justify-between text-[10px] mt-1">
                  <span>P1: {formatCurrency(analysis.totalLiqP1)}</span>
                  <span className="text-success">P2: {formatCurrency(analysis.totalLiqP2)}</span>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-chart-3">
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Valor Pago Total</p>
                <p className="text-base font-bold">{formatCurrency(analysis.totalPagoP1 + analysis.totalPagoP2)}</p>
                <div className="flex justify-between text-[10px] mt-1">
                  <span>P1: {formatCurrency(analysis.totalPagoP1)}</span>
                  <span className="text-success">P2: {formatCurrency(analysis.totalPagoP2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card className="border-l-4 border-l-primary/60">
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Pago 2018–2022</p>
                <p className="text-base font-bold">{formatCurrency(analysis.totalPagoP1)}</p>
                <p className="text-[10px]">Exec.: {analysis.execP1.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-success/60">
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Pago 2023–2025</p>
                <p className="text-base font-bold text-success">{formatCurrency(analysis.totalPagoP2)}</p>
                <p className="text-[10px]">Exec.: {analysis.execP2.toFixed(1)}%</p>
              </CardContent>
            </Card>
            <Card className="border-l-4" style={{ borderLeftColor: varPago >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Variação Pago</p>
                <p className={`text-base font-bold ${varPago >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {varPago >= 0 ? '+' : ''}{varPago.toFixed(1)}%
                </p>
                <p className="text-[10px]">P1 (5a) → P2 (3a)</p>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-chart-4">
              <CardContent className="pt-3 pb-2">
                <p className="text-[10px] text-muted-foreground">Sem SESAI</p>
                <p className={`text-base font-bold ${varPagoNoSesai >= 0 ? 'text-success' : 'text-destructive'}`}>
                  {varPagoNoSesai >= 0 ? '+' : ''}{varPagoNoSesai.toFixed(1)}%
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

          {analysis.totalExtra > 0 && (
            <div className="bg-chart-3/5 rounded p-3 border border-chart-3/20">
              <p className="text-xs font-semibold text-foreground mb-1">
                🔎 Nota sobre financiamento extraorçamentário ({analysis.extraCount} registros · {formatCurrency(analysis.totalExtra)})
              </p>
              <p className="text-xs text-muted-foreground">
                O aparente aumento do orçamento indígena após 2023 pode conter um componente de <strong>reclassificação contábil</strong>:
                recursos que antes eram executados como extraorçamentários (compensações BR-163, Belo Monte) passaram a ser incorporados
                em ações formais do orçamento após a criação do MPI e a padronização exigida por TCU/CGU.
                A base inclui {formatCurrency(analysis.totalExtra)} em financiamento compensatório,
                representando {pctExtraTotal.toFixed(1)}% do total.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ═══ 2. FUNDAMENTAÇÃO METODOLÓGICA DETALHADA ═══ */}
      <Card>
        <CardHeader><CardTitle className="text-sm"><SN n={nextSection()} /> Fundamentação Metodológica</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-4">
          <p>
            A construção da base orçamentária seguiu uma <strong>estratégia de 7 passos</strong> (4 camadas estruturais + 3 etapas complementares),
            com deduplicação automática via chave composta <code className="bg-muted px-1 rounded text-foreground">órgão|programa|ano</code>.
            Os totais são divididos em dois baselines históricos: <strong>P1 ({formatCurrency(analysis.totalPagoP1)})</strong> e <strong>P2 ({formatCurrency(analysis.totalPagoP2)})</strong>.
          </p>

          {/* Camadas detalhadas */}
          <div className="space-y-3">
            <div className="bg-muted/50 rounded p-3 border-l-4 border-l-primary">
              <p className="font-semibold text-foreground text-xs mb-1">Camada 1 — Programas Temáticos PPA</p>
              <p>
                <strong>9 programas históricos</strong> (2034/SEPPIR, 0617/2065/5136 indígenas, 5802/5803/5804 MIR 2024+)
                + <strong>14 programas das Agendas Transversais</strong> do PPA 2024–2027 (Igualdade Racial e Povos Indígenas).
              </p>
              <p className="mt-1">
                <em>Filtro híbrido:</em> programas <strong>focais</strong> (MIR, MPI — ex: 1617, 5136) incluem todas as ações;
                programas <strong>universais</strong> (Bolsa Família, Educação Básica, CT&I, etc.) exigem palavras-chave raciais/étnicas no título da ação.
              </p>
              <p className="mt-1 italic text-[10px]">Fundamentação: PPA 2020–2023 (Lei nº 13.971/2019), PPA 2024–2027 (Lei nº 14.802/2024), Agendas Transversais — Igualdade Racial e Povos Indígenas.</p>
            </div>
            <div className="bg-muted/50 rounded p-3 border-l-4 border-l-chart-1">
              <p className="font-semibold text-foreground text-xs mb-1">Camada 2 — Subfunção 422</p>
              <p>Direitos Individuais, Coletivos e Difusos. Captura ações de igualdade racial em órgãos transversais (ex: MDH, MJ, MPF), validadas por palavras-chave raciais.</p>
              <p className="mt-1 italic text-[10px]">Critério: Ações com subfunção 422 + validação por radical no título (quilombol*, indígen*, racial, étnic*, etc.).</p>
            </div>
            <div className="bg-muted/50 rounded p-3 border-l-4 border-l-chart-2">
              <p className="font-semibold text-foreground text-xs mb-1">Camada 3 — Órgãos MIR/MPI</p>
              <p>MIR (67000) e MPI (92000) — <strong>todas as despesas</strong> desses órgãos são consideradas focais por definição institucional. Deduplicadas contra Camadas 1 e 2.</p>
              <p className="mt-1 italic text-[10px]">Nota: MIR criado em jan/2023 (ex-SEPPIR); MPI criado em jan/2023 (ex-competências FUNAI/MJ).</p>
            </div>
            <div className="bg-muted/50 rounded p-3 border-l-4 border-l-chart-3">
              <p className="font-semibold text-foreground text-xs mb-1">Camada 4 — SESAI (Saúde Indígena)</p>
              <p>
                Ações <strong>20YP</strong> (Atenção à Saúde dos Povos Indígenas) e <strong>7684</strong> (Saneamento em Aldeias)
                capturadas por código de ação direto. Necessário após migração da SESAI para programa genérico de saúde (5022), que tornaria a SESAI invisível em filtros por programa.
              </p>
              <p className="mt-1 italic text-[10px]">A SESAI responde por ~{analysis.sesaiPctP1.toFixed(0)}–{analysis.sesaiPctP2.toFixed(0)}% do total, gerando o "efeito mascaramento" analisado na Seção 4.</p>
            </div>
            <div className="bg-warning/5 rounded p-3 border-l-4 border-l-warning">
              <p className="font-semibold text-foreground text-xs mb-1">Passo 5 — Dotação via Dados Abertos (LOA)</p>
              <p>
                Arquivos ZIP/CSV do portal <strong>dados.gov.br</strong> complementam dotação inicial e autorizada para cada ação,
                matching por chave composta <code className="bg-muted px-1 rounded text-foreground">Programa|Ação|Ano</code>.
                Preenche lacunas do Portal da Transparência, que reporta execução mas nem sempre dotação inicial.
              </p>
            </div>
            <div className="bg-warning/5 rounded p-3 border-l-4 border-l-warning">
              <p className="font-semibold text-foreground text-xs mb-1">Passo 6 — Ingestão Keyword-First</p>
              <p>
                Varredura ampla em <strong>~40 subfunções</strong> usando <strong>30+ radicais</strong> raciais/étnicos para capturar ações dispersas
                em órgãos transversais não cobertos pelas 4 camadas estruturais. Exemplos: ações em Cultura (subfunção 392),
                Educação Superior (subfunção 364), Assistência Social (subfunção 244) com termos como "quilombol*", "indígen*", "capoeira", "terreiro".
              </p>
            </div>
            <div className="bg-primary/5 rounded p-3 border-l-4 border-l-primary">
              <p className="font-semibold text-foreground text-xs mb-1">Passo 7 — Complementação Manual SIOP</p>
              <p>
                11 registros manuais (2020–2023) que escaparam dos filtros automatizados devido a redefinições de programação no SIOP
                e migração institucional MDHC→MIR. Exemplos: ICMBio 20WM (Gestão Ambiental em Terras Indígenas),
                SESAI 21CJ (Saneamento em Aldeias Indígenas), MDHC/MIR 21AR/21AT (Promoção da Igualdade Racial).
              </p>
              <p className="mt-1 italic text-[10px]">Cada inclusão manual possui campo 'razao_selecao' documentando a justificativa técnica.</p>
            </div>
          </div>

          {/* Fórmulas e critérios */}
          <div className="bg-muted rounded p-4 border space-y-2">
            <p className="font-semibold text-foreground text-xs">📐 Fórmulas e Critérios Técnicos</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
              <div>
                <p className="font-medium text-foreground">Taxa de Execução:</p>
                <code className="bg-background px-2 py-1 rounded block mt-1">% Execução = (Valor Pago / Dotação Autorizada) × 100</code>
              </div>
              <div>
                <p className="font-medium text-foreground">Deduplicação:</p>
                <code className="bg-background px-2 py-1 rounded block mt-1">Chave = órgão | programa | ano (unique constraint)</code>
              </div>
              <div>
                <p className="font-medium text-foreground">Orçamento Simbólico:</p>
                <code className="bg-background px-2 py-1 rounded block mt-1">Dotação Autorizada &gt; 0 AND Pago ≈ R$ 0</code>
                <p className="mt-0.5 italic">Evidência de hiato entre previsão legal e entrega efetiva.</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Exclusões:</p>
                <p className="mt-1">Restos a Pagar não são contabilizados. Programas universais sem filtro racial são excluídos integralmente.</p>
              </div>
            </div>
          </div>

          {/* Orçamento Simbólico detection */}
          {(() => {
            const simbolicos = records.filter(r => {
              const dot = Number(r.dotacao_autorizada) || 0;
              const pg = Number(r.pago) || 0;
              return dot > 100000 && pg < 1000;
            });
            if (simbolicos.length === 0) return null;
            const totalDotSimb = simbolicos.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0);
            return (
              <div className="bg-destructive/5 rounded p-3 border border-destructive/20">
                <p className="text-xs font-semibold text-foreground mb-1">
                  🚨 Alerta: "Orçamento Simbólico" — {simbolicos.length} ações detectadas
                </p>
                <p className="text-xs">
                  Foram identificadas <strong>{simbolicos.length} ações</strong> com dotação autorizada total de <strong>{formatCurrency(totalDotSimb)}</strong> mas
                  valor pago ≈ R$ 0. Isso evidencia planejamento formal sem execução real — um padrão que o Comitê CERD denomina
                  "medidas de papel" (CERD/C/BRA/CO/18-20 §14).
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {simbolicos.slice(0, 5).map((r, i) => (
                    <Badge key={i} variant="destructive" className="text-[10px]">
                      {r.programa.substring(0, 40)}… ({r.ano}) — Dot: {formatCurrency(Number(r.dotacao_autorizada) || 0)}
                    </Badge>
                  ))}
                  {simbolicos.length > 5 && <Badge variant="outline" className="text-[10px]">+{simbolicos.length - 5} mais</Badge>}
                </div>
              </div>
            );
          })()}

          <div className="bg-destructive/10 rounded p-3 border border-destructive/30">
            <p className="text-xs font-semibold text-foreground mb-1">⚠️ Tratamento de Programas Genéricos / Universais</p>
            <p className="text-xs">
              Programas de grande escala como <strong>Minha Casa Minha Vida</strong> (R$ 100+ bi/ano), <strong>Bolsa Família</strong> (R$ 160+ bi/ano),
              <strong> SUS</strong>, <strong>SUAS</strong> e similares <strong>não são incluídos integralmente</strong>.
              Quando presentes nas Agendas Transversais, apenas ações cujo título contenha termos raciais/étnicos são retidas.
            </p>
          </div>

          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className="text-[10px] font-medium text-foreground mr-1">Radicais de busca:</span>
            {['racial', 'quilombol', 'indígen', 'cigan', 'étnic', 'palmares', 'terreiro', 'capoeira', 'matriz africana', 'candomblé', 'umbanda', 'juventude negra', 'reparação', 'etnodesenvolvimento'].map(r => (
              <Badge key={r} variant="secondary" className="text-[10px] font-mono">{r}*</Badge>
            ))}
          </div>

          {/* Transition summary */}
          <div className="bg-chart-2/10 rounded p-3 border border-chart-2/20 flex items-center gap-3">
            <Info className="w-5 h-5 text-chart-2 shrink-0" />
            <p className="text-xs">
              <strong>Até aqui:</strong> {analysis.totalRegistros} registros capturados por 7 camadas de filtragem, abrangendo {analysis.totalProgramas} programas
              em {analysis.anos.length} anos. Total pago: <strong>{formatCurrency(analysis.totalPagoP1 + analysis.totalPagoP2)}</strong>.
              As próximas seções exploram 3 perspectivas analíticas distintas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ 3. RESUMO COMPARATIVO — PERSPECTIVA 1: TOTAL (COM SESAI) ═══ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <SN n={nextSection()} />
            <Building className="w-4 h-4 text-chart-1" />
            Resumo Comparativo — Perspectiva 1: Investimento Total (com SESAI)
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">
            Inclui a Saúde Indígena (SESAI), que representa a maior parcela do total.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-t-4 border-t-chart-1">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Dotação Autorizada</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-end">
                  <div><p className="text-[10px] text-muted-foreground">2018–2022 (5 anos)</p><p className="text-lg font-bold">{formatCurrency(analysis.totalDotAutP1)}</p></div>
                  <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025 (3 anos)</p><p className="text-lg font-bold text-success">{formatCurrency(analysis.totalDotAutP2)}</p></div>
                </div>
                <VarBadge value={varDot} />
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-chart-2">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pago</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-end">
                  <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(analysis.totalPagoP1)}</p></div>
                  <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(analysis.totalPagoP2)}</p></div>
                </div>
                <VarBadge value={varPago} />
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-chart-3">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Liquidado</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-end">
                  <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(analysis.totalLiqP1)}</p></div>
                  <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(analysis.totalLiqP2)}</p></div>
                </div>
                <VarBadge value={varLiq} />
              </CardContent>
            </Card>
          </div>

          {/* Transition insight after Perspectiva 1 */}
          <div className="bg-chart-1/10 rounded p-3 border border-chart-1/20 flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-chart-1 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong>Destaque:</strong> Em apenas 3 anos (P2), o investimento total atingiu {formatCurrency(analysis.totalPagoP2)},
              equivalente a {analysis.totalPagoP1 > 0 ? ((analysis.totalPagoP2 / analysis.totalPagoP1) * 100).toFixed(0) : '—'}% do
              que foi pago em 5 anos (P1). Média anual: P1 = {formatCurrency(analysis.totalPagoP1 / 5)} → P2 = {formatCurrency(analysis.totalPagoP2 / 3)}
              — multiplicador de {(analysis.totalPagoP1 / 5) > 0 ? ((analysis.totalPagoP2 / 3) / (analysis.totalPagoP1 / 5)).toFixed(1) : '—'}×.
            </p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <SN n={nextSection()} />
            <ShieldAlert className="w-4 h-4 text-chart-5" />
            O Efeito Mascaramento da SESAI
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-4">
          <p>
            A Saúde Indígena (SESAI) representa uma parcela dominante do orçamento étnico-racial federal.
            Sem sua remoção analítica, as demais políticas tornam-se estatisticamente invisíveis.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Card className="bg-chart-5/5 border-chart-5/30">
              <CardContent className="pt-3 pb-2">
                <p className="font-semibold text-foreground text-xs">SESAI em 2018–2022</p>
                <p className="text-lg font-bold">{analysis.sesaiPctP1.toFixed(1)}%</p>
                <p className="text-[10px]">{formatCurrency(analysis.sesaiPagoP1)} de {formatCurrency(analysis.totalPagoP1)}</p>
              </CardContent>
            </Card>
            <Card className="bg-chart-5/5 border-chart-5/30">
              <CardContent className="pt-3 pb-2">
                <p className="font-semibold text-foreground text-xs">SESAI em 2023–2025</p>
                <p className="text-lg font-bold">{analysis.sesaiPctP2.toFixed(1)}%</p>
                <p className="text-[10px]">{formatCurrency(analysis.sesaiPagoP2)} de {formatCurrency(analysis.totalPagoP2)}</p>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/30">
              <CardContent className="pt-3 pb-2">
                <p className="font-semibold text-foreground text-xs">Demais Políticas (Pago)</p>
                <p className="text-lg font-bold text-primary">
                  {formatCurrency(analysis.pagoP1NoSesai)} → {formatCurrency(analysis.pagoP2NoSesai)}
                </p>
                <p className="text-[10px]">{varPagoNoSesai >= 0 ? '+' : ''}{varPagoNoSesai.toFixed(1)}% de variação</p>
              </CardContent>
            </Card>
          </div>

          {/* Infográfico SESAI: Stacked area */}
          {analysis.sesaiMaskData.length > 0 && (
            <div>
              <p className="text-xs font-medium text-center mb-2">Evolução: Com SESAI vs. Sem SESAI (Pago)</p>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analysis.sesaiMaskData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                    <Tooltip formatter={(value: number, name: string) => [formatCurrencyFull(value), name === 'sesai' ? 'SESAI' : name === 'semSesai' ? 'Sem SESAI' : 'Com SESAI']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                    <Legend wrapperStyle={{ fontSize: '10px' }} />
                    <Area type="monotone" dataKey="semSesai" name="Sem SESAI" stackId="1" fill="hsl(var(--primary))" fillOpacity={0.4} stroke="hsl(var(--primary))" />
                    <Area type="monotone" dataKey="sesai" name="SESAI" stackId="1" fill="hsl(var(--chart-5))" fillOpacity={0.4} stroke="hsl(var(--chart-5))" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <div className="bg-muted/50 rounded p-3">
            <p className="text-xs">
              <strong>🔑 Insight:</strong> A queda da participação da SESAI ({analysis.sesaiPctP1.toFixed(0)}% → {analysis.sesaiPctP2.toFixed(0)}%)
              reflete o <em>crescimento exponencial das demais políticas</em>, não a redução da saúde indígena.
              Pela primeira vez, as políticas raciais <em>stricto sensu</em> ultrapassaram {formatCurrency(analysis.pagoP2NoSesai)} em apenas 3 anos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ 5. PERSPECTIVA 2: SEM SESAI ═══ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <SN n={nextSection()} />
            <Users className="w-4 h-4 text-chart-4" />
            Resumo Comparativo — Perspectiva 2: Políticas Raciais <em>stricto sensu</em> (sem SESAI)
          </CardTitle>
          <p className="text-[10px] text-muted-foreground">
            Exclui a SESAI para isolar o investimento específico em igualdade racial, povos indígenas (FUNAI/MPI) e quilombolas.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="border-t-4 border-t-chart-4">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Dotação (sem SESAI)</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-end">
                  <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(analysis.dotP1NoSesai)}</p></div>
                  <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(analysis.dotP2NoSesai)}</p></div>
                </div>
                <VarBadge value={varDotNoSesai} />
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-chart-5">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pago (sem SESAI)</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-end">
                  <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(analysis.pagoP1NoSesai)}</p></div>
                  <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(analysis.pagoP2NoSesai)}</p></div>
                </div>
                <VarBadge value={varPagoNoSesai} />
              </CardContent>
            </Card>
            <Card className="border-t-4 border-t-primary">
              <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Liquidado (sem SESAI)</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between items-end">
                  <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(analysis.liqP1NoSesai)}</p></div>
                  <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(analysis.liqP2NoSesai)}</p></div>
                </div>
                <VarBadge value={varLiqNoSesai} />
              </CardContent>
            </Card>
          </div>

          {/* Year-by-year table: Total vs Sem SESAI */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Ano</TableHead>
                <TableHead className="text-right">Total (com SESAI)</TableHead>
                <TableHead className="text-right">SESAI</TableHead>
                <TableHead className="text-right">Sem SESAI</TableHead>
                <TableHead className="text-right">% SESAI</TableHead>
                <TableHead>Interpretação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.annualData.map((d, i) => {
                const sesaiVal = d.pago - d.pagoSemSesai;
                const pctSesai = d.pago > 0 ? (sesaiVal / d.pago * 100) : 0;
                const prev = i > 0 ? analysis.annualData[i - 1].pagoSemSesai : 0;
                const varPctSS = prev > 0 ? ((d.pagoSemSesai - prev) / prev * 100) : 0;
                const interpretacao = d.ano <= 2022
                  ? `Sem SESAI: ${formatCurrency(d.pagoSemSesai)}${i > 0 ? ` (${varPctSS >= 0 ? '+' : ''}${varPctSS.toFixed(0)}%)` : ''}.`
                  : d.ano === 2023
                    ? `Reconstrução: criação do MIR. Sem SESAI: ${formatCurrency(d.pagoSemSesai)}.`
                    : `Expansão: sem SESAI = ${formatCurrency(d.pagoSemSesai)} (${varPctSS >= 0 ? '+' : ''}${varPctSS.toFixed(0)}%).`;
                return (
                  <TableRow key={d.ano} className={d.ano === 2023 ? 'border-t-2 border-t-chart-2' : ''}>
                    <TableCell className="font-bold">{d.ano}</TableCell>
                    <TableCell className="text-right font-mono text-xs">{formatCurrencyFull(d.pago)}</TableCell>
                    <TableCell className="text-right font-mono text-xs text-muted-foreground">{formatCurrencyFull(sesaiVal)}</TableCell>
                    <TableCell className="text-right font-mono text-xs font-semibold">{formatCurrencyFull(d.pagoSemSesai)}</TableCell>
                    <TableCell className="text-right text-xs">{pctSesai.toFixed(0)}%</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[250px]">{interpretacao}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {/* Transition insight after Perspectiva 2 */}
          <div className="bg-chart-4/10 rounded p-3 border border-chart-4/20 flex items-center gap-3 mt-3">
            <Info className="w-5 h-5 text-chart-4 shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong>Curiosidade:</strong> Sem SESAI, a média anual de pagamento subiu de {formatCurrency(analysis.pagoP1NoSesai / 5)}/ano (P1) para
              {' '}{formatCurrency(analysis.pagoP2NoSesai / 3)}/ano (P2) — um multiplicador de {analysis.pagoP1NoSesai > 0 ? ((analysis.pagoP2NoSesai / 3) / (analysis.pagoP1NoSesai / 5)).toFixed(1) : '—'}×.
              Este é o melhor indicador do <em>esforço genuíno</em> do Estado em políticas raciais, isolado do peso da saúde indígena.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ 6. PERSPECTIVA 3: ORÇAMENTÁRIO vs EXTRAORÇAMENTÁRIO ═══ */}
      {analysis.totalExtra > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <SN n={nextSection()} />
              <Scale className="w-4 h-4 text-chart-3" />
              Resumo Comparativo — Perspectiva 3: Esforço do Estado (LOA) vs. Financiamento Compensatório
            </CardTitle>
            <p className="text-[10px] text-muted-foreground">
              Diferencia recursos aprovados na Lei Orçamentária Anual (esforço genuíno do Estado)
              de financiamento compensatório/reativo (compensações ambientais, royalties, indenizações — {analysis.extraCount} registros).
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 3 cards: Orçamentário, Extraorçamentário, Total */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card className="border-t-4 border-t-primary">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">🏛️ Orçamentário (LOA)</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div><p className="text-[10px] text-muted-foreground">Pago P1</p><p className="text-lg font-bold">{formatCurrency(analysis.orcPagoP1)}</p></div>
                    <div className="text-right"><p className="text-[10px] text-muted-foreground">Pago P2</p><p className="text-lg font-bold text-success">{formatCurrency(analysis.orcPagoP2)}</p></div>
                  </div>
                  <VarBadge value={varOrcPago} />
                  <p className="text-[10px] text-muted-foreground text-center">{analysis.orcCount} registros</p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-chart-4">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">🔄 Extraorçamentário</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div><p className="text-[10px] text-muted-foreground">Pago P1</p><p className="text-lg font-bold">{formatCurrency(analysis.extraPagoP1)}</p></div>
                    <div className="text-right"><p className="text-[10px] text-muted-foreground">Pago P2</p><p className="text-lg font-bold text-chart-4">{formatCurrency(analysis.extraPagoP2)}</p></div>
                  </div>
                  <VarBadge value={varExtraPago} />
                  <p className="text-[10px] text-muted-foreground text-center">{analysis.extraCount} registros</p>
                </CardContent>
              </Card>
              <Card className="border-t-4 border-t-chart-3">
                <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">📊 Financiamento Total</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div><p className="text-[10px] text-muted-foreground">Pago P1</p><p className="text-lg font-bold">{formatCurrency(analysis.totalPagoP1)}</p></div>
                    <div className="text-right"><p className="text-[10px] text-muted-foreground">Pago P2</p><p className="text-lg font-bold text-success">{formatCurrency(analysis.totalPagoP2)}</p></div>
                  </div>
                  <div className="text-center py-1 rounded text-sm font-bold bg-chart-3/10 text-chart-3">{pctExtraTotal.toFixed(1)}% extraorçam.</div>
                </CardContent>
              </Card>
            </div>

            {/* LOA-only Dotação + Liquidado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Dotação Autorizada — Apenas LOA</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-base font-bold">{formatCurrency(analysis.orcDotP1)}</p></div>
                    <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-base font-bold text-success">{formatCurrency(analysis.orcDotP2)}</p></div>
                  </div>
                  {(() => { const v = analysis.orcDotP1 > 0 ? ((analysis.orcDotP2 - analysis.orcDotP1) / analysis.orcDotP1 * 100) : 0; return <VarBadge value={v} />; })()}
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Liquidado — Apenas LOA</CardTitle></CardHeader>
                <CardContent>
                  <div className="flex justify-between items-end">
                    <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-base font-bold">{formatCurrency(analysis.orcLiqP1)}</p></div>
                    <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-base font-bold text-success">{formatCurrency(analysis.orcLiqP2)}</p></div>
                  </div>
                  {(() => { const v = analysis.orcLiqP1 > 0 ? ((analysis.orcLiqP2 - analysis.orcLiqP1) / analysis.orcLiqP1 * 100) : 0; return <VarBadge value={v} />; })()}
                </CardContent>
              </Card>
            </div>

            {/* Composição Extraorçamentário */}
            {Object.keys(analysis.subtipoMap).length > 0 && (
              <div>
                <p className="text-xs font-medium mb-2">Composição do Financiamento Extraorçamentário por Subtipo</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(analysis.subtipoMap).sort((a, b) => b[1] - a[1]).map(([tipo, valor]) => {
                    const labels: Record<string, string> = {
                      compensacao_ambiental: 'Compensação Ambiental', indenizacao: 'Indenização',
                      royalties: 'Royalties', convenio: 'Convênio', receita_propria: 'Receita Própria', outros: 'Outros',
                    };
                    return <Badge key={tipo} variant="secondary" className="text-xs">{labels[tipo] || tipo}: {formatCurrency(valor)}</Badge>;
                  })}
                </div>
              </div>
            )}

            {/* Stacked area chart: Orçamentário vs Extra */}
            {analysis.dualYearData.length > 0 && (
              <div>
                <p className="text-xs font-medium text-center mb-2">Evolução: Orçamentário vs. Extraorçamentário (Pago)</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={analysis.dualYearData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                      <Tooltip formatter={(value: number, name: string) => [formatCurrencyFull(value), name === 'orcamentario' ? 'Orçamentário (LOA)' : 'Extraorçamentário']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Area type="monotone" dataKey="orcamentario" name="Orçamentário (LOA)" stackId="1" fill="hsl(var(--primary))" fillOpacity={0.4} stroke="hsl(var(--primary))" />
                      <Area type="monotone" dataKey="extraorcamentario" name="Extraorçamentário" stackId="1" fill="hsl(var(--chart-4))" fillOpacity={0.4} stroke="hsl(var(--chart-4))" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Year-by-year table */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Ano</TableHead>
                  <TableHead className="text-right">Orçamentário (LOA)</TableHead>
                  <TableHead className="text-right">Extraorçamentário</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">% Extra</TableHead>
                  <TableHead>Interpretação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysis.annualData.map((d, i) => {
                  const orcVal = analysis.orcByYear[d.ano]?.pago || 0;
                  const extraVal = analysis.extraByYear[d.ano]?.pago || 0;
                  const total = orcVal + extraVal;
                  const pctExtra = total > 0 ? (extraVal / total * 100) : 0;
                  const prevOrc = i > 0 ? (analysis.orcByYear[analysis.annualData[i - 1].ano]?.pago || 0) : 0;
                  const varOrc = prevOrc > 0 ? ((orcVal - prevOrc) / prevOrc * 100) : 0;
                  const interpretacao = extraVal === 0
                    ? `LOA puro: ${formatCurrency(orcVal)}${i > 0 ? ` (${varOrc >= 0 ? '+' : ''}${varOrc.toFixed(0)}%)` : ''}.`
                    : `LOA: ${formatCurrency(orcVal)} + Extra: ${formatCurrency(extraVal)} (${pctExtra.toFixed(0)}% compensatório).`;
                  return (
                    <TableRow key={d.ano} className={d.ano === 2023 ? 'border-t-2 border-t-chart-3' : ''}>
                      <TableCell className="font-bold">{d.ano}</TableCell>
                      <TableCell className="text-right font-mono text-xs">{formatCurrencyFull(orcVal)}</TableCell>
                      <TableCell className="text-right font-mono text-xs text-chart-4">{formatCurrencyFull(extraVal)}</TableCell>
                      <TableCell className="text-right font-mono text-xs font-semibold">{formatCurrencyFull(total)}</TableCell>
                      <TableCell className="text-right text-xs">{pctExtra.toFixed(0)}%</TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[250px]">{interpretacao}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* LOA evolution charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Evolução Anual — Orçamentário (LOA)</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysis.annualData.map(d => ({ ano: d.ano, dotacao: analysis.orcByYear[d.ano]?.dotacao || 0, liquidado: analysis.orcByYear[d.ano]?.liquidado || 0, pago: analysis.orcByYear[d.ano]?.pago || 0 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip formatter={(value: number, name: string) => [formatCurrencyFull(value), name]} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="dotacao" name="Dotação" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="liquidado" name="Liquidado" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="pago" name="Pago" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-sm">Evolução Anual — Extraorçamentário</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analysis.annualData.map(d => ({ ano: d.ano, dotacao: analysis.extraByYear[d.ano]?.dotacao || 0, pago: analysis.extraByYear[d.ano]?.pago || 0 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip formatter={(value: number, name: string) => [formatCurrencyFull(value), name]} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        <Bar dataKey="dotacao" name="Dotação" fill="hsl(var(--chart-4))" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="pago" name="Pago" fill="hsl(var(--chart-5))" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Insight */}
            <div className="bg-chart-3/5 rounded p-3 border border-chart-3/20">
              <p className="text-xs font-semibold text-foreground mb-1">
                🔎 Insight — "Financiamento Quase Invisível"
              </p>
              <p className="text-xs text-muted-foreground">
                Os {analysis.extraCount} registros extraorçamentários representam ações cujo financiamento
                <strong> não passa pela aprovação do Congresso via LOA</strong>. São compensações ambientais (BR-163, Belo Monte),
                royalties, indenizações e receitas próprias da FUNAI. O financiamento compensatório representa
                {' '}{pctExtraTotal.toFixed(1)}% do total pago.
                {analysis.totalExtra > 0 && <> Sem ele, o investimento em políticas indígenas seria {formatCurrency(analysis.totalOrc)}.</>}
              </p>
            </div>

            {/* Transition insight after Perspectiva 3 */}
            <div className="bg-chart-3/10 rounded p-3 border border-chart-3/20 flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-chart-3 shrink-0" />
              <p className="text-xs text-muted-foreground">
                <strong>Resumo das 3 perspectivas:</strong> (1) Total com SESAI = {formatCurrency(analysis.totalPagoP1 + analysis.totalPagoP2)};
                (2) Sem SESAI = {formatCurrency(analysis.pagoP1NoSesai + analysis.pagoP2NoSesai)};
                (3) Apenas LOA = {formatCurrency(analysis.totalOrc)}.
                A diferença entre (1) e (3) ({formatCurrency((analysis.totalPagoP1 + analysis.totalPagoP2) - analysis.totalOrc)})
                revela o <em>gap</em> entre o financiamento total e o esforço legislativo do Estado.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ 7. DIAGNÓSTICO COMPARATIVO ═══ */}
      <Card>
        <CardHeader><CardTitle className="text-sm"><SN n={nextSection()} /> Diagnóstico Comparativo: As Duas Fases</CardTitle></CardHeader>
        <CardContent className="text-xs text-muted-foreground space-y-4">
          <div className="space-y-3">
            <div className="bg-destructive/5 rounded-lg p-4 border border-destructive/20">
              <p className="font-semibold text-destructive mb-1">A. "Trava Institucional" (2018–2022)</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Dotação total: <strong>{formatCurrency(analysis.totalDotAutP1)}</strong> | Pago: <strong>{formatCurrency(analysis.totalPagoP1)}</strong> | Exec.: <strong>{analysis.execP1.toFixed(1)}%</strong></li>
                <li>Sem SESAI: <strong>{formatCurrency(analysis.pagoP1NoSesai)}</strong> pagos em 5 anos — média de {formatCurrency(analysis.pagoP1NoSesai / 5)}/ano.</li>
                <li>As políticas raciais e étnicas não vinculadas à saúde permaneceram em baixa escala e com forte compressão orçamentária.</li>
                <li>FUNAI manteve operação mínima; INCRA com regularização quilombola travada.</li>
              </ul>
            </div>
            <div className="bg-success/5 rounded-lg p-4 border border-success/20">
              <p className="font-semibold text-success mb-1">B. "Retomada sem Entrega" (2023–2025)</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Dotação total: <strong>{formatCurrency(analysis.totalDotAutP2)}</strong> | Pago: <strong>{formatCurrency(analysis.totalPagoP2)}</strong> | Exec.: <strong>{analysis.execP2.toFixed(1)}%</strong></li>
                <li>Sem SESAI: <strong>{formatCurrency(analysis.pagoP2NoSesai)}</strong> pagos em 3 anos — média de {formatCurrency(analysis.pagoP2NoSesai / 3)}/ano.</li>
                <li>Criação do MIR (2023) e MPI (2023). Novos programas PPA: 5802, 5803, 5804.</li>
                <li>"Efeito Tesoura": dotação sobe ({varDot >= 0 ? '+' : ''}{varDot.toFixed(1)}%), mas o pagamento não acompanha proporcionalmente.</li>
              </ul>
            </div>
          </div>

          {/* Conclusão Interpretativa dinâmica */}
          {(() => {
            const pad = analysis.byYear;
            const val = (ano: number) => pad[ano]?.pagoSemSesai || 0;
            const valTotal = (ano: number) => pad[ano]?.pago || 0;
            const pctSesaiAno = (ano: number) => {
              const t = valTotal(ano);
              return t > 0 ? (((t - val(ano)) / t) * 100).toFixed(0) : '0';
            };
            const p1Anos = analysis.annualData.filter(d => d.ano >= 2018 && d.ano <= 2022);
            const p1Min = p1Anos.length > 0 ? Math.min(...p1Anos.map(d => d.pagoSemSesai)) : 0;
            const p1Max = p1Anos.length > 0 ? Math.max(...p1Anos.map(d => d.pagoSemSesai)) : 0;
            const anoPrimeiroBi = analysis.annualData.find(d => d.pagoSemSesai >= 1_000_000_000);
            const firstYear = analysis.anos[0] || 2018;
            const lastYear = analysis.anos[analysis.anos.length - 1] || 2025;

            return (
              <div className="bg-primary/5 rounded p-4 border border-primary/20 mt-2">
                <p className="font-semibold text-foreground text-xs mb-2">📊 Conclusão Interpretativa</p>
                <ul className="list-disc pl-4 space-y-1 text-xs">
                  <li><strong>2018–2022:</strong> O investimento racial (sem SESAI) oscilou entre {formatCurrency(p1Min)} e {formatCurrency(p1Max)}/ano.</li>
                  {analysis.annualData.filter(d => d.ano >= 2023).map(d => (
                    <li key={d.ano}><strong>{d.ano}:</strong> Sem SESAI, o pago atingiu {formatCurrency(d.pagoSemSesai)}.</li>
                  ))}
                  {anoPrimeiroBi && <li><strong>Marco:</strong> Em {anoPrimeiroBi.ano}, políticas raciais sem SESAI superaram R$ 1 bilhão pela primeira vez.</li>}
                </ul>
                <div className="bg-muted/50 rounded p-3 mt-2">
                  <p className="text-xs"><strong>🔑 Achado Central:</strong> A SESAI representou ~{pctSesaiAno(firstYear)}% em {firstYear} e ~{pctSesaiAno(lastYear)}% em {lastYear}. A queda percentual reflete o crescimento exponencial das demais políticas.</p>
                </div>
              </div>
            );
          })()}
        </CardContent>
      </Card>

      {/* ═══ 8. DESAGREGAÇÃO POR GRUPO FOCAL ═══ */}
      <Card>
        <CardHeader><CardTitle className="text-sm"><SN n={nextSection()} /> Desagregação por Grupo Focal e Período</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo Focal</TableHead>
                <TableHead className="text-right">Pago 2018–2022</TableHead>
                <TableHead className="text-right">Pago 2023–2025</TableHead>
                <TableHead className="text-right">Dotação Total</TableHead>
                <TableHead className="text-right">Programas</TableHead>
                <TableHead className="text-right">Registros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysis.themeData.map(t => (
                <TableRow key={t.key}>
                  <TableCell className="font-medium text-xs">{t.icon} {t.label}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatCurrency(t.pagoP1)}</TableCell>
                  <TableCell className="text-right font-mono text-xs text-success">{formatCurrency(t.pagoP2)}</TableCell>
                  <TableCell className="text-right font-mono text-xs">{formatCurrency(t.dotP1 + t.dotP2)}</TableCell>
                  <TableCell className="text-right text-xs">{t.programas}</TableCell>
                  <TableCell className="text-right text-xs">{t.registros}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="bg-muted/50 rounded p-3 mt-3">
            <p className="text-xs"><strong>💡 Curiosidade:</strong> {(() => {
              const sorted = [...analysis.themeData].sort((a, b) => (b.pagoP2 - b.pagoP1) - (a.pagoP2 - a.pagoP1));
              const topGrowth = sorted[0];
              const topGrowthPct = topGrowth.pagoP1 > 0 ? ((topGrowth.pagoP2 - topGrowth.pagoP1) / topGrowth.pagoP1 * 100) : 0;
              const smallest = [...analysis.themeData].sort((a, b) => (a.pagoP1 + a.pagoP2) - (b.pagoP1 + b.pagoP2))[0];
              return <>O grupo <strong>{topGrowth.label}</strong> apresentou o maior crescimento absoluto entre períodos ({topGrowthPct >= 0 ? '+' : ''}{topGrowthPct.toFixed(0)}%). Já o grupo <strong>{smallest.label}</strong> possui o menor volume acumulado ({formatCurrency(smallest.pagoP1 + smallest.pagoP2)}).</>;
            })()}</p>
          </div>
        </CardContent>
      </Card>

      {/* ═══ 9. EVOLUÇÃO ANUAL ═══ */}
      {analysis.annualData.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-sm"><SN n={nextSection()} /> Evolução Anual — Dotação vs. Liquidação vs. Pagamento</CardTitle></CardHeader>
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
                      <Tooltip formatter={(value: number, name: string) => [formatCurrencyFull(value), name]} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
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
                      <Tooltip formatter={(value: number, name: string) => [formatCurrencyFull(value), name]} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }} />
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

      {/* ═══ 10. RANKING DE PROGRAMAS ═══ */}
      {analysis.topPrograms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm"><SN n={nextSection()} /> Ranking: Programas com Maior Pagamento (excl. SESAI)</CardTitle>
            <p className="text-[10px] text-muted-foreground">Top {analysis.topPrograms.length} por valor pago acumulado ({analysis.anos[0]}–{analysis.anos[analysis.anos.length - 1]})</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2.5">
              {analysis.topPrograms.map(([programa, { pago, orgao, dot }], idx) => {
                const maxVal = analysis.topPrograms[0]?.[1].pago || 1;
                const pct = (pago / maxVal) * 100;
                const execRate = dot > 0 ? (pago / dot * 100) : null;
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
                        <span className="text-xs font-mono font-semibold">{formatCurrency(pago)}</span>
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

      {/* ═══ 11. CRUZAMENTO ARTIGOS ICERD ═══ */}
      {icerdData.chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <SN n={nextSection()} />
              <Scale className="w-4 h-4 text-primary" />
              Cruzamento Orçamentário × Artigos da Convenção ICERD
            </CardTitle>
            <p className="text-[10px] text-muted-foreground">
              Mapeamento automático das {icerdData.totalRecords} ações orçamentárias aos artigos I–VII da Convenção.
              {icerdData.unmappedCount > 0 && ` ${icerdData.unmappedCount} registros sem mapeamento.`}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-center mb-2">Pago por Artigo da Convenção</p>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={icerdData.chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={50} />
                      <Tooltip
                        formatter={(value: number) => [formatCurrency(value), 'Pago']}
                        labelFormatter={(label) => { const item = icerdData.chartData.find(d => d.name === label); return `${label} — ${item?.titulo || ''}`; }}
                        contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Bar dataKey="pago" radius={[0, 4, 4, 0]}>
                        {icerdData.chartData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-[10px]">Artigo</TableHead>
                      <TableHead className="text-right text-[10px]">Pago</TableHead>
                      <TableHead className="text-right text-[10px]">% Total</TableHead>
                      <TableHead className="text-right text-[10px]">Programas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {icerdData.chartData.map(d => (
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
                        <TableCell className="text-right font-mono text-xs">{formatCurrency(d.pago)}</TableCell>
                        <TableCell className="text-right text-xs">{d.pct.toFixed(1)}%</TableCell>
                        <TableCell className="text-right text-xs">{d.programas}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="bg-primary/5 rounded p-3 border border-primary/20">
              <p className="text-xs font-semibold text-foreground mb-1"><Scale className="w-3.5 h-3.5 inline mr-1" />Síntese Analítica</p>
              <p className="text-xs text-muted-foreground">
                {(() => {
                  const sorted = [...icerdData.chartData].sort((a, b) => b.pago - a.pago);
                  const top = sorted[0];
                  const bottom = sorted.filter(d => d.pago > 0).pop();
                  return (<>
                    O <strong>{top?.name} ({top?.titulo})</strong> concentra {top?.pct.toFixed(1)}% do total pago.
                    {bottom && bottom.name !== top?.name && <> O <strong>{bottom.name} ({bottom.titulo})</strong> recebe apenas {bottom.pct.toFixed(1)}%, sinalizando subfinanciamento relativo.</>}
                    {icerdData.artigosSemDados.length > 0 && <> Os artigos {icerdData.artigosSemDados.map(a => a.numero).join(', ')} não possuem ações orçamentárias mapeadas.</>}
                  </>);
                })()}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ═══ 12. CONCLUSÃO E VEREDITO TÉCNICO ═══ */}
      {(() => {
        const allRecs = [...records, ...sesaiRecords];
        const artigosComDados = icerdData.chartData.sort((a, b) => b.pago - a.pago);
        const topArt = artigosComDados[0];
        const bottomArt = artigosComDados.length > 1 ? artigosComDados[artigosComDados.length - 1] : null;
        const topPct = topArt ? topArt.pct.toFixed(1) : '0';
        const bottomPct = bottomArt ? bottomArt.pct.toFixed(1) : '0';

        return (
          <Card className="border-l-4 border-l-destructive">
            <CardHeader><CardTitle className="text-sm"><SN n={nextSection()} /> Conclusão e Veredito Técnico</CardTitle></CardHeader>
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
                  <li><strong>Trava Institucional (2018–2022):</strong> Apenas {formatCurrency(analysis.pagoP1NoSesai)} pagos sem SESAI em 5 anos — média anual de {formatCurrency(analysis.pagoP1NoSesai / 5)}.</li>
                  <li><strong>Retomada sem Entrega (2023–2025):</strong> A dotação cresceu {varDot >= 0 ? '+' : ''}{varDot.toFixed(1)}%, mas a taxa de execução ({analysis.execP2.toFixed(1)}%) evidencia represamento.</li>
                  <li><strong>Evidência central:</strong> A SESAI concentrou {analysis.sesaiPctP1.toFixed(0)}% em 2018–2022 e {analysis.sesaiPctP2.toFixed(0)}% em 2023–2025.</li>
                  {analysis.totalExtra > 0 && (
                    <li><strong>Financiamento compensatório:</strong> {formatCurrency(analysis.totalExtra)} ({pctExtraTotal.toFixed(1)}% do total) são recursos reativos (royalties, indenizações) que não refletem decisão política de investimento.</li>
                  )}
                </ul>
              </div>

              <div className="bg-primary/5 rounded p-4 border border-primary/20 space-y-2">
                <p className="font-bold text-foreground flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  Análise Integrada: Cobertura Orçamentária dos Artigos ICERD (I–VII)
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  {topArt && <li><strong>{topArt.name} ({topArt.titulo})</strong> concentra <strong>{topPct}%</strong> do total pago ({formatCurrency(topArt.pago)}).</li>}
                  {bottomArt && bottomArt.name !== topArt?.name && <li><strong>{bottomArt.name} ({bottomArt.titulo})</strong> recebe apenas <strong>{bottomPct}%</strong> — subfinanciamento relativo.</li>}
                  {icerdData.artigosSemDados.length > 0 && <li><strong>{icerdData.artigosSemDados.length} artigo(s) sem cobertura:</strong> {icerdData.artigosSemDados.map(a => `Art. ${a.numero}`).join(', ')} — lacuna de implementação.</li>}
                  {artigosComDados.length >= 3 && <li><strong>Concentração:</strong> Os 2 artigos mais financiados absorvem {icerdData.totalPago > 0 ? ((artigosComDados[0].pago + artigosComDados[1].pago) / icerdData.totalPago * 100).toFixed(0) : 0}% do total.</li>}
                </ul>
              </div>

              <div className="bg-muted/50 rounded p-3 space-y-2">
                <p className="font-semibold text-foreground">Recomendações ao Comitê CERD:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Solicitar ao Brasil metas de <strong>liquidação mínima</strong> (≥70%) para todos os programas raciais do PPA 2024–2027.</li>
                  <li>Exigir <strong>desagregação por ação orçamentária</strong> no próximo relatório periódico.</li>
                  <li>Recomendar <strong>vinculação de receita</strong> para igualdade racial (similar à saúde/educação).</li>
                  <li>Incluir a análise de <strong>dupla perspectiva (com/sem SESAI)</strong> como padrão metodológico.</li>
                  <li>Incluir a análise de <strong>tripla perspectiva (LOA vs. Compensatório)</strong> para distinguir esforço genuíno do Estado.</li>
                  {icerdData.artigosSemDados.length > 0 && <li>Solicitar <strong>plano de ação</strong> para os artigos {icerdData.artigosSemDados.map(a => a.numero).join(', ')} sem cobertura orçamentária.</li>}
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

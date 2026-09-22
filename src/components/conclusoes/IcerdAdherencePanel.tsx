import { useMemo, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scale, CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown, Minus, FileText, Database, BarChart3, BookOpen, Users, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ARTIGOS_CONVENCAO, inferArtigosDocumentoNormativo, inferArtigosOrcamento, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { getSafeIndicadores, inferArtigosIndicador } from '@/utils/inferArtigosIndicador';
import { normalizeArticleTag } from '@/utils/normalizeArticleTag';
import { MethodologyPanel } from '@/components/shared/MethodologyPanel';
import { ArtigoAdherenceDrilldownDialog } from '@/components/shared/ArtigoAdherenceDrilldownDialog';
import type { LinkedIndicador, LinkedOrcamento, LinkedNormativo } from '@/hooks/useDiagnosticSensor';
import type { FioCondutor, ConclusaoDinamica } from '@/hooks/useAnalyticalInsights';
import type { DadoOrcamentario, RespostaLacunaCerdIII } from '@/hooks/useLacunasData';
import { useEvidenceOverridesReadOnly } from '@/hooks/useEvidenceOverrides';
import { useIndicadoresAnaliticos } from '@/hooks/useLacunasData';
import { useIcerdArtigoAnalysis, useCountStatSeriesPerArticle, type ArtigoAnalysis } from '@/hooks/useIcerdArtigoAnalysis';
import { useMirrorData } from '@/hooks/useMirrorData';
import { buildRolEstatistico } from '@/utils/rolEstatisticoCanonico';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

interface IcerdAdherencePanelProps {
  fiosCondutores: FioCondutor[];
  conclusoes: ConclusaoDinamica[];
  lacunas: any[];
  orcamentoRecords: DadoOrcamentario[];
  indicadores: any[];
  stats: any;
  respostas: RespostaLacunaCerdIII[];
  documentosNormativosCount: number;
}


/**
 * Infer which articles a normative document covers based on secoes_impactadas
 */
function inferArtigosNormativo(doc: any): ArtigoConvencao[] {
  return inferArtigosDocumentoNormativo(doc as Parameters<typeof inferArtigosDocumentoNormativo>[0]);
}

const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)} bi`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(0)} mi`;
  return `R$ ${(value / 1_000).toFixed(0)} mil`;
};


export function IcerdAdherencePanel({ fiosCondutores, conclusoes, lacunas, orcamentoRecords, indicadores, stats, respostas, documentosNormativosCount }: IcerdAdherencePanelProps) {
  const [drilldownArtigo, setDrilldownArtigo] = useState<ArtigoConvencao | null>(null);
  const [drilldownFocus, setDrilldownFocus] = useState<'recomendacoes' | 'indicadores' | 'orcamento' | 'normativos' | null>(null);
  const statSeriesPerArticle = useCountStatSeriesPerArticle();
  // SSoT compartilhada com os relatórios (aba Conclusões / Produtos)
  const { analysis, diagnosticMap, artigoEvidencia, curadosTotal } = useIcerdArtigoAnalysis({
    lacunas, fiosCondutores, conclusoes, respostas,
  });


  // Filter out common_core and deduplicate indicators (safety net)
  const safeIndicadores = useMemo(() => {
    return getSafeIndicadores(indicadores);
  }, [indicadores]);

  // Rol canônico da Base Estatística (guarda-chuvas sem duplicidade + subindicadores)
  const rolEstatistico = useMemo(() => buildRolEstatistico(safeIndicadores), [safeIndicadores]);


  // Evidências do artigo para o drilldown — mesma curadoria Artigo × Rec × Evidência
  const drilldownData = useMemo(() => {
    if (!drilldownArtigo) return { recomendacoes: [] as { paragrafo: string; tema: string; status: string }[], normativos: [] as LinkedNormativo[], orcamentos: [] as LinkedOrcamento[], indicadores: [] as LinkedIndicador[] };
    // SSoT: apenas vínculos confirmados em artigos_convencao — sem inferência por eixo temático
    const artLacunas = lacunas.filter(l =>
      ((l.artigos_convencao || []) as string[])
        .map(normalizeArticleTag)
        .filter(Boolean)
        .includes(drilldownArtigo)
    );
    const recomendacoes = artLacunas.map(l => {
      const diag = diagnosticMap.get(l.id);
      const s = diag?.statusComputado || l._computedStatus || l.status_cumprimento;
      return { paragrafo: l.paragrafo, tema: l.tema, status: s };
    });

    const curado = artigoEvidencia.get(drilldownArtigo);
    if (curado) {
      return { recomendacoes, normativos: curado.normativos, orcamentos: curado.orcamento, indicadores: curado.indicadores };
    }

    // Fallback (sem curadoria): união das recomendações do artigo
    const indMap = new Map<string, LinkedIndicador>();
    const orcMap = new Map<string, LinkedOrcamento>();
    const normMap = new Map<string, LinkedNormativo>();
    for (const l of artLacunas) {
      const diag = diagnosticMap.get(l.id);
      if (!diag) continue;
      for (const ind of diag.linkedIndicadores) { if (!indMap.has(ind.nome)) indMap.set(ind.nome, ind); }
      for (const orc of diag.linkedOrcamento) { const k = `${orc.programa}|${orc.orgao}|${orc.ano}`; if (!orcMap.has(k)) orcMap.set(k, orc); }
      for (const norm of diag.linkedNormativos) { if (!normMap.has(norm.titulo)) normMap.set(norm.titulo, norm); }
    }

    return { recomendacoes, normativos: Array.from(normMap.values()), orcamentos: Array.from(orcMap.values()), indicadores: Array.from(indMap.values()) };
  }, [drilldownArtigo, lacunas, diagnosticMap, artigoEvidencia]);


  const radarData = analysis.map(a => ({
    artigo: `Art. ${a.numero}`,
    esforco: Number(a.esforcoArtigo.toFixed(1)),
    impacto: Number(a.impactoArtigo.toFixed(1)),
  }));

  const barData = analysis.map(a => ({
    artigo: `Art. ${a.numero}`,
    cumprido: a.lacunasCumpridas,
    parcial: a.lacunasParciais,
    nao_cumprido: a.lacunasNaoCumpridas,
  }));

  const sorted = [...analysis].sort((a, b) => b.impactoArtigo - a.impactoArtigo);
  const maisPriorizados = sorted.slice(0, 3);
  const menosPriorizados = sorted.slice(-3).reverse();

  const avgEsforco = analysis.reduce((s, a) => s + a.esforcoArtigo, 0) / (analysis.length || 1);
  const avgImpacto = analysis.reduce((s, a) => s + a.impactoArtigo, 0) / (analysis.length || 1);
  const avgAdherencia = Math.round(avgEsforco);

  // Total data sources summary
  const totalNormativos = documentosNormativosCount;
  const totalRespostas = respostas.length;
  const totalStatSeries = Object.values(statSeriesPerArticle).reduce((s, v) => s + v, 0);

  // Totais da matriz auditada (ocorrências Artigo × Recomendação × Evidência)
  const matrizTotals = useMemo(() => {
    let orc = 0, est = 0, norm = 0;
    artigoEvidencia.forEach(v => {
      orc += v.vinculosPorBase?.orcamentaria || 0;
      est += v.vinculosPorBase?.estatistica || 0;
      norm += v.vinculosPorBase?.normativa || 0;
    });
    return { orc, est, norm, all: orc + est + norm };
  }, [artigoEvidencia]);

  // ── Annex download ──
  const downloadAnnex = useCallback(() => {
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Anexo — Aderência ICERD Detalhada</title>
<style>
body{font-family:Arial,sans-serif;max-width:1000px;margin:20px auto;color:#222;font-size:13px}
h1{font-size:18px;border-bottom:2px solid #1e40af;padding-bottom:8px}
h2{font-size:15px;margin-top:24px;color:#1e40af}
.badge{display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:bold}
.green{background:#dcfce7;color:#166534}.yellow{background:#fef9c3;color:#854d0e}
.red{background:#fee2e2;color:#991b1b}.blue{background:#dbeafe;color:#1e40af}
table{width:100%;border-collapse:collapse;margin:8px 0}
th,td{border:1px solid #ddd;padding:6px 8px;text-align:left;font-size:12px}
th{background:#f1f5f9}
.score{font-size:24px;font-weight:bold}
.section{margin:12px 0;padding:12px;background:#f8fafc;border-radius:6px;border-left:4px solid}
.nota{font-size:11px;color:#666;margin-top:4px}
</style></head><body>
<h1>⚖️ Anexo Analítico — Esforço e Impacto por Artigo (ICERD)</h1>
<p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
<p><strong>Esforço Médio:</strong> ${formatScore(avgEsforco)} · <strong>Impacto Evidenciado Médio:</strong> ${formatScore(avgImpacto)}</p>
<p><strong>Fontes:</strong> ${stats?.total || 0} recomendações ONU, ${totalNormativos} normativos, ${orcamentoRecords.length} registros orçamentários, ${totalRespostas} respostas CERD III, ${rolEstatistico.total} evidências estatísticas, ${totalStatSeries} séries estatísticas.</p>
<p><strong>Matriz auditada:</strong> ${matrizTotals.all.toLocaleString('pt-BR')} vínculos Artigo × Recomendação × Evidência (${matrizTotals.orc.toLocaleString('pt-BR')} orçamentária · ${matrizTotals.est.toLocaleString('pt-BR')} estatística · ${matrizTotals.norm.toLocaleString('pt-BR')} normativa), correspondentes a ${curadosTotal.toLocaleString('pt-BR')} registros físicos da base curada (planilha CERD_42_BASE auditada).</p>
<p class="nota"><strong>Nota:</strong> <em>Indicadores</em> = dados pontuais do banco (registros com título, valores e fonte, ex: "Taxa de homicídio negro"). <em>Séries estatísticas</em> = conjuntos temporais temáticos do espelho de dados (ex: série histórica de segurança pública 2018-2025).</p>
<hr/>
${analysis.map(a => {
  const cls = (f: string) => f === 'alto' ? 'green' : f === 'intermediario' ? 'yellow' : 'red';
  const naoCumpridasTotal = a.lacunasNaoCumpridas + a.lacunasRetrocesso;
  return `
<h2>Artigo ${a.numero} — ${a.titulo}</h2>
<p>${a.tituloCompleto}</p>
<p><span class="score">${formatScore(a.esforcoArtigo)}</span> <span class="badge ${cls(a.faixaEsforco)}">Esforço ${FAIXA_LABEL[a.faixaEsforco]}</span>
&nbsp;&nbsp;<span class="score">${formatScore(a.impactoArtigo)}</span> <span class="badge ${cls(a.faixaImpacto)}">Impacto ${FAIXA_LABEL[a.faixaImpacto]}</span></p>

<table>
<tr><th>Dimensão</th><th>Valor</th><th>Detalhe</th></tr>
<tr><td>Recomendações ONU</td><td>${a.lacunasTotal}</td><td>✓ ${a.lacunasCumpridas} cumprida(s), ~ ${a.lacunasParciais} parcial(is), ✗ ${naoCumpridasTotal} não cumprida(s)</td></tr>
<tr><td>Ações Orçamentárias Vinculadas</td><td>${a.orcamentoProgramas}</td><td>Nº de ações/programas mapeados por palavras-chave</td></tr>
<tr><td>Instrumentos Normativos</td><td>${a.normativosCount}</td><td>Leis, decretos, portarias vinculados</td></tr>
<tr><td>Respostas CERD III</td><td>${a.respostasTotal}</td><td>${a.respostasCumpridas} satisfatória(s), ${a.respostasNaoCumpridas} insatisfatória(s)</td></tr>
<tr><td>Indicadores (BD)</td><td>${a.indicadoresCount}</td><td>Registros com título, valores e fonte</td></tr>
<tr><td>Séries Estatísticas</td><td>${a.seriesEstatisticas}</td><td>Conjuntos temporais temáticos</td></tr>
<tr><td>Fios Condutores</td><td>${a.fiosTotal}</td><td>${a.fiosAvanco} avanço(s), ${a.fiosRetrocesso} retrocesso(s)</td></tr>
<tr><td>Conclusões Analíticas</td><td>${a.conclusoesAvanco + a.conclusoesRetrocesso + a.conclusoesLacuna}</td><td>${a.conclusoesAvanco} avanço(s), ${a.conclusoesRetrocesso} retrocesso(s), ${a.conclusoesLacuna} lacuna(s)</td></tr>
</table>

<div class="section" style="border-color:${a.cor}">
<strong>Veredito:</strong> ${a.veredito}
</div>
`;
}).join('')}

<hr/>
<h2>Metodologia de Cálculo — Aderência ICERD</h2>
<p><strong>Objetivo:</strong> Medir se o sistema possui dados externos suficientes (orçamento, normativos, indicadores, séries estatísticas) para avaliar cada artigo. <em>Respostas CERD III</em> e <em>Conclusões Analíticas</em> foram removidas por serem outputs interpretativos do próprio sistema, não evidências externas.</p>
<table>
<tr><th>Dimensão</th><th>Peso</th><th>Descrição</th></tr>
<tr><td>Recomendações ONU Cumpridas</td><td>50%</td><td>Taxa relativa: cumpridas/total × 50. Peso dominante — reflete diretamente o grau de resposta do Estado ao Comitê CERD.</td></tr>
<tr><td>Cobertura Normativa</td><td>15%</td><td>Instrumentos legislativos/institucionais vinculados ao artigo</td></tr>
<tr><td>Cobertura Orçamentária</td><td>10%</td><td>Quantidade de ações/programas vinculados por palavras-chave (sem considerar valores em R$)</td></tr>
<tr><td>Indicadores</td><td>15%</td><td>Registros estatísticos do BD vinculados ao artigo</td></tr>
<tr><td>Amplitude de Fontes</td><td>10%</td><td>Diversidade de tipos de evidência disponíveis (recom. cumpridas, orçamento, indicadores, normativos)</td></tr>
</table>
<p class="nota"><strong>Distinção Aderência vs. Evolução:</strong> A <em>Aderência ICERD</em> é uma visão <strong>gerencial</strong> — mede se o Estado está respondendo às obrigações do Comitê CERD (por isso o peso maior para recomendações atendidas). A <em>Evolução dos Artigos</em> é uma visão de <strong>evidências</strong> — avalia se orçamento, normativos e indicadores melhoraram ou pioraram ao longo do período.</p>
</body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `anexo-aderencia-icerd-${new Date().toISOString().slice(0,10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }, [analysis, avgAdherencia, stats, totalNormativos, totalRespostas, totalStatSeries, orcamentoRecords.length, rolEstatistico.total, matrizTotals, curadosTotal]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Scale className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Aderência do Estado Brasileiro aos Artigos da Convenção ICERD</p>
              <p className="text-sm text-muted-foreground mt-1">
                Avalia se o sistema possui <strong>dados externos suficientes</strong> para fundamentar cada artigo:
                {' '}{stats?.total || 0} recomendações ONU, {totalNormativos} instrumentos normativos,
                {' '}{orcamentoRecords.length} registros orçamentários,
                {' '}{rolEstatistico.total} evidências estatísticas e {totalStatSeries} séries estatísticas oficiais.
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 italic">
                Nota: Respostas CERD III e Conclusões Analíticas são exibidas como informação contextual, mas <strong>não</strong> compõem o score — são outputs do próprio sistema, não evidências externas.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <MethodologyPanel variant="aderencia" />
                <Button size="sm" variant="outline" onClick={downloadAnnex} className="text-xs gap-1">
                  <Download className="w-3 h-3" /> Baixar Anexo Detalhado
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-2">
                <strong>Evidências estatísticas</strong> = rol canônico vinculável (guarda-chuvas sem duplicidade + subindicadores auditados nas abas temáticas). 
                <strong>Séries Estatísticas</strong> = conjuntos temporais temáticos (segurança, saúde, educação etc.) do espelho de dados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources Inventory */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        <Card className="border-chart-1/30">
          <CardContent className="pt-2 pb-2 text-center">
            <Database className="w-4 h-4 mx-auto text-chart-1 mb-1" />
            <p className="text-lg font-bold">{stats?.total || 0}</p>
            <p className="text-[10px] text-muted-foreground">Recomendações ONU</p>
          </CardContent>
        </Card>
        <Card className="border-chart-2/30">
          <CardContent className="pt-2 pb-2 text-center">
            <BarChart3 className="w-4 h-4 mx-auto text-chart-2 mb-1" />
            <p className="text-lg font-bold">{orcamentoRecords.length}</p>
            <p className="text-[10px] text-muted-foreground">Registros Orçam.</p>
          </CardContent>
        </Card>
        <Card className="border-chart-3/30">
          <CardContent className="pt-2 pb-2 text-center">
            <FileText className="w-4 h-4 mx-auto text-chart-3 mb-1" />
            <p className="text-lg font-bold">{totalNormativos}</p>
            <p className="text-[10px] text-muted-foreground">Normativos</p>
          </CardContent>
        </Card>
        <Card className="border-chart-4/30">
          <CardContent className="pt-2 pb-2 text-center">
            <BookOpen className="w-4 h-4 mx-auto text-chart-4 mb-1" />
            <p className="text-lg font-bold">{totalRespostas}</p>
            <p className="text-[10px] text-muted-foreground">Respostas CERD III</p>
          </CardContent>
        </Card>
        <Card className="border-chart-5/30">
          <CardContent className="pt-2 pb-2 text-center">
            <Users className="w-4 h-4 mx-auto text-chart-5 mb-1" />
            <p className="text-lg font-bold">{rolEstatistico.total}</p>
            <p className="text-[10px] text-muted-foreground">Evidências Estatísticas</p>
          </CardContent>
        </Card>
        <Card className="border-primary/30">
          <CardContent className="pt-2 pb-2 text-center">
            <BarChart3 className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-lg font-bold">{totalStatSeries}</p>
            <p className="text-[10px] text-muted-foreground">Séries Estatísticas</p>
          </CardContent>
        </Card>
      </div>

      {/* Score Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-primary/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Aderência Média</p>
            <p className="text-2xl font-bold text-primary">{avgAdherencia}%</p>
            <p className="text-xs text-muted-foreground">dos 7 artigos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Mais Priorizado</p>
            <p className="text-lg font-bold">Art. {maisPriorizados[0]?.numero}</p>
            <p className="text-xs text-success">{maisPriorizados[0]?.grauAderencia}%</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Menos Priorizado</p>
            <p className="text-lg font-bold">Art. {menosPriorizados[0]?.numero}</p>
            <p className="text-xs text-destructive">{menosPriorizados[0]?.grauAderencia}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Art. com Boa Aderência</p>
            <p className="text-lg font-bold">{analysis.filter(a => a.grauAderencia >= 70).length}</p>
            <p className="text-xs text-muted-foreground">≥ 70% de aderência</p>
          </CardContent>
        </Card>
      </div>

      {/* Radar + Bar charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Radar de Aderência por Artigo</CardTitle>
            <CardDescription className="text-xs">
              Escala 0-100 integrando recomendações ONU, normativos, orçamento, indicadores e séries estatísticas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="artigo" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }} />
                  <Radar name="Aderência (%)" dataKey="aderencia" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} strokeWidth={2} isAnimationActive={false} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Status de Cumprimento por Artigo</CardTitle>
            <CardDescription className="text-xs">
              Distribuição das recomendações ONU vinculadas a cada artigo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="artigo" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '10px' }} />
                  <Bar dataKey="cumprido" name="Cumprido" stackId="a" fill="hsl(var(--chart-2))" isAnimationActive={false} />
                  <Bar dataKey="parcial" name="Parcial" stackId="a" fill="hsl(var(--chart-4))" isAnimationActive={false} />
                  <Bar dataKey="nao_cumprido" name="Não Cumprido" stackId="a" fill="hsl(var(--chart-1))" isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail per article */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Scale className="w-4 h-4 text-primary" />
            Avaliação Detalhada por Artigo
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Esta seção mostra <strong>aderência</strong> — cobertura de dados e capacidade de resposta do Estado. Leituras de melhora, piora ou estagnação pertencem ao painel <strong>Evolução dos Artigos</strong>, não a este score.
          </p>
        </div>
        {analysis.map(a => (
          <Card key={a.numero} className="border-l-4" style={{ borderLeftColor: a.cor }}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-primary-foreground shrink-0"
                    style={{ backgroundColor: a.cor }}
                  >
                    {a.numero}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{a.tituloCompleto}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={() => setDrilldownArtigo(a.numero)}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        title="Clique para ver evidências detalhadas"
                      >
                        <Badge
                          className={`text-[10px] ${
                            a.grauAderencia >= 70
                              ? 'bg-success/10 text-success border-success/30'
                              : a.grauAderencia >= 40
                                ? 'bg-warning/10 text-warning border-warning/30'
                                : 'bg-destructive/10 text-destructive border-destructive/30'
                          }`}
                          variant="outline"
                        >
                          {a.grauAderencia >= 70 ? 'Boa Aderência' : a.grauAderencia >= 40 ? 'Aderência Parcial' : 'Baixa Aderência'} 🔍
                        </Badge>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold" style={{ color: a.grauAderencia >= 60 ? 'hsl(var(--chart-2))' : a.grauAderencia >= 30 ? 'hsl(var(--chart-4))' : 'hsl(var(--destructive))' }}>
                    {a.grauAderencia}%
                  </p>
                  <p className="text-[10px] text-muted-foreground">aderência</p>
                </div>
              </div>

              <Progress value={a.grauAderencia} className="h-2 mb-3" />

              {/* Metrics grid - expanded with new dimensions */}
              {(() => {
                const cur = artigoEvidencia.get(a.numero);
                const vb = cur?.vinculosPorBase;
                return (
                  <>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-3">
                <button onClick={() => { setDrilldownArtigo(a.numero); setDrilldownFocus('recomendacoes'); }} className="bg-muted/50 rounded p-2 text-center hover:bg-muted/80 transition-colors cursor-pointer">
                  <p className="text-lg font-bold">{a.lacunasTotal}</p>
                  <p className="text-[10px] text-muted-foreground">Recom. ONU 🔍</p>
                </button>
                <button onClick={() => { setDrilldownArtigo(a.numero); setDrilldownFocus('recomendacoes'); }} className="bg-muted/50 rounded p-2 text-center hover:bg-muted/80 transition-colors cursor-pointer">
                  <p className="text-lg font-bold text-success">{a.lacunasCumpridas}/{a.lacunasTotal}</p>
                  <p className="text-[10px] text-muted-foreground">Cumpridas ({a.lacunasTotal > 0 ? Math.round((a.lacunasCumpridas / a.lacunasTotal) * 100) : 0}%) 🔍</p>
                </button>
                <button onClick={() => { setDrilldownArtigo(a.numero); setDrilldownFocus('orcamento'); }} className="bg-muted/50 rounded p-2 text-center hover:bg-muted/80 transition-colors cursor-pointer">
                  <p className="text-lg font-bold">{vb ? vb.orcamentaria : a.orcamentoProgramas}</p>
                  <p className="text-[10px] text-muted-foreground">Vínc. Orçam. 🔍</p>
                  <p className="text-[9px] text-muted-foreground/70">{a.orcamentoProgramas} ações distintas</p>
                </button>
                <button onClick={() => { setDrilldownArtigo(a.numero); setDrilldownFocus('normativos'); }} className="bg-muted/50 rounded p-2 text-center hover:bg-muted/80 transition-colors cursor-pointer">
                  <p className="text-lg font-bold">{vb ? vb.normativa : a.normativosCount}</p>
                  <p className="text-[10px] text-muted-foreground">Vínc. Normat. 🔍</p>
                  <p className="text-[9px] text-muted-foreground/70">{a.normativosCount} normativos distintos</p>
                </button>
                <button onClick={() => { setDrilldownArtigo(a.numero); setDrilldownFocus('indicadores'); }} className="bg-muted/50 rounded p-2 text-center hover:bg-muted/80 transition-colors cursor-pointer">
                  <p className="text-lg font-bold">{vb ? vb.estatistica : a.indicadoresCount}</p>
                  <p className="text-[10px] text-muted-foreground">Vínc. Estat. 🔍</p>
                  <p className="text-[9px] text-muted-foreground/70">{a.indicadoresCount} indicadores distintos</p>
                </button>
              </div>

              {cur && vb && (
                  <p className="text-[10px] text-muted-foreground mb-3">
                    Matriz auditada: <strong>{cur.vinculos}</strong> vínculos Artigo × Recomendação × Evidência
                    {' '}({vb.orcamentaria} orçamentária · {vb.estatistica} estatística · {vb.normativa} normativa).
                    A segunda linha de cada bloco conta cada evidência uma única vez.
                  </p>
              )}
                  </>
                );
              })()}





              <div className="p-3 bg-muted/30 rounded-lg">
                <p className="text-xs text-muted-foreground leading-relaxed">{a.veredito}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary verdict */}
      <Card className="border-2 border-primary">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2 text-base">
            <Scale className="w-5 h-5 text-primary" />
            Síntese: Priorização Histórica dos Artigos pelo Estado Brasileiro
          </CardTitle>
          <CardDescription className="text-xs">
            Painel informativo com {stats?.total || 0} recomendações ONU, {totalNormativos} normativos, {orcamentoRecords.length} registros orçamentários, {rolEstatistico.total} evidências estatísticas e {totalStatSeries} séries estatísticas; respostas CERD III entram apenas como contexto narrativo e não compõem o score.
            {' '}Matriz auditada: <strong>{matrizTotals.all.toLocaleString('pt-BR')} vínculos</strong> Artigo × Recomendação × Evidência ({matrizTotals.orc.toLocaleString('pt-BR')} orçamentária · {matrizTotals.est.toLocaleString('pt-BR')} estatística · {matrizTotals.norm.toLocaleString('pt-BR')} normativa), correspondentes a {curadosTotal.toLocaleString('pt-BR')} registros físicos da base curada.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
              <p className="text-xs font-bold text-success mb-2">✓ ARTIGOS MAIS PRIORIZADOS</p>
              <ul className="space-y-1">
                {maisPriorizados.map(a => (
                  <li key={a.numero} className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>Art. {a.numero} — {a.titulo}</span>
                    <Badge variant="outline" className="text-[10px]">{a.grauAderencia}%</Badge>
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
              <p className="text-xs font-bold text-destructive mb-2">✗ ARTIGOS MENOS PRIORIZADOS</p>
              <ul className="space-y-1">
                {menosPriorizados.map(a => (
                  <li key={a.numero} className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>Art. {a.numero} — {a.titulo}</span>
                    <Badge variant="destructive" className="text-[10px]">{a.grauAderencia}%</Badge>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3 bg-warning/5 border border-warning/20 rounded-lg">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong>⚖️ Conclusão:</strong> A aderência média do Estado brasileiro à Convenção ICERD é de <strong>{avgAdherencia}%</strong>.
              {avgAdherencia < 50
                ? ` Este índice revela que a maioria dos compromissos do tratado permanece sem cobertura adequada em termos de políticas públicas, orçamento e resultados mensuráveis. Os artigos ${menosPriorizados.map(a => a.numero).join(', ')} apresentam as maiores lacunas de implementação.`
                : ` Embora existam avanços em artigos específicos (${maisPriorizados.map(a => a.numero).join(', ')}), a cobertura permanece desigual entre os compromissos, com os artigos ${menosPriorizados.map(a => a.numero).join(', ')} exigindo atenção prioritária.`
              }
            </p>
          </div>

          <div className="p-3 bg-muted/30 rounded-lg space-y-2">
            <p className="text-[10px] text-muted-foreground">
              <strong>Nota metodológica:</strong> O score de aderência (0-100%) pondera: recomendações ONU cumpridas — taxa relativa cumpridas/total (50%), cobertura normativa (15%), cobertura orçamentária — contagem de ações (10%), indicadores (15%) e amplitude de fontes (10%). Respostas CERD III, fios condutores e conclusões analíticas podem aparecer como contexto narrativo, mas não compõem o cálculo. O orçamento não considera valores em R$. Base Normativa inclui {totalNormativos} instrumentos legislativos e institucionais (2018-2025).
            </p>
            <div className="text-[10px] text-muted-foreground">
              <strong>Faixas de Status de Aderência:</strong>
              <ul className="list-disc pl-4 mt-1 space-y-0.5">
                <li><strong>Boa Aderência</strong> — Score ≥ 70%: Cobertura ampla com evidências em múltiplas dimensões e alta taxa de cumprimento das recomendações ONU.</li>
                <li><strong>Aderência Parcial</strong> — Score 40–69%: Cobertura intermediária com esforços visíveis, mas lacunas persistentes em ao menos uma dimensão relevante.</li>
                <li><strong>Baixa Aderência</strong> — Score &lt; 40%: Cobertura insuficiente com poucas evidências de resposta do Estado às obrigações da Convenção.</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Artigo Adherence Drilldown Dialog */}
      <ArtigoAdherenceDrilldownDialog
        open={!!drilldownArtigo}
        onOpenChange={(open) => { if (!open) { setDrilldownArtigo(null); setDrilldownFocus(null); } }}
        artigo={drilldownArtigo ? analysis.find(a => a.numero === drilldownArtigo) || null : null}
        recomendacoes={drilldownData.recomendacoes}
        normativos={drilldownData.normativos}
        orcamentos={drilldownData.orcamentos}
        indicadores={drilldownData.indicadores}
        focusTab={drilldownFocus}
      />
    </div>
  );
}
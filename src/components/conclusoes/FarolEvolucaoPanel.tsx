import { useMemo, useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scale, CheckCircle2, AlertTriangle, XCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { FarolDrilldownDialog } from './FarolDrilldownDialog';
import { normalizeArticleTag } from '@/utils/normalizeArticleTag';
import { useDiagnosticSensor, type LinkedIndicador, type LinkedOrcamento, type LinkedNormativo } from '@/hooks/useDiagnosticSensor';
import { useEvidenceOverridesReadOnly } from '@/hooks/useEvidenceOverrides';
import { summarizeIndicatorEvolution } from '@/utils/articleIndicatorEvolution';

interface FarolEvolucaoPanelProps {
  lacunas: any[];
  orcamentoRecords: any[];
  indicadores: any[];
  stats: any;
  documentosNormativos: any[];
  respostasCerdIII?: any[];
}

type FarolArtigoResult = {
  numero: ArtigoConvencao;
  titulo: string;
  tituloCompleto: string;
  cor: string;
  programasCount: number;
  acoesVinculadas: number;
  totalLiquidado: number;
  normativosCount: number;
  indicadoresFavoraveis: number;
  indicadoresDesfavoraveis: number;
  indicadoresNovos: number;
  indicadoresNeutros: number;
  indicadoresTotal: number;
  scoreOrcamento: number;
  scoreNormativa: number;
  scoreIndicadores: number;
  scoreFarol: number;
  sinal: 'verde' | 'amarelo' | 'vermelho';
  resumo: string;
  rawIndicadores: any[];
  rawNormativos: any[];
  rawOrcamento: any[];
};

export function FarolEvolucaoPanel({ lacunas, orcamentoRecords, indicadores, stats, documentosNormativos, respostasCerdIII }: FarolEvolucaoPanelProps) {

  const [drilldown, setDrilldown] = useState<{ art: FarolArtigoResult; tab: string } | null>(null);

  // Use the same diagnostic sensor as Recomendações and Artigos (Aderência)
  const overrides = useEvidenceOverridesReadOnly();
  const { diagnosticMap } = useDiagnosticSensor(lacunas, overrides);

  const artigoResults = useMemo<FarolArtigoResult[]>(() => {
    return ARTIGOS_CONVENCAO.map(art => {
      const artNum = art.numero;

      // ── Find recommendations linked to this article (same logic as IcerdAdherencePanel) ──
      const artLacunas = lacunas.filter(l => {
        if (l.artigos_convencao && l.artigos_convencao.length > 0) {
          const explicit = l.artigos_convencao
            .map(normalizeArticleTag)
            .filter(Boolean) as ArtigoConvencao[];
          return explicit.includes(artNum);
        }
        const mapped = EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS];
        return mapped ? mapped.includes(artNum) : false;
      });

      // ── Aggregate evidence from diagnosticMap (same source as Recomendações) ──
      const indMap = new Map<string, LinkedIndicador>();
      const orcMap = new Map<string, LinkedOrcamento>();
      const normMap = new Map<string, LinkedNormativo>();

      for (const l of artLacunas) {
        const diag = diagnosticMap.get(l.id);
        if (!diag) continue;
        for (const ind of diag.linkedIndicadores) {
          if (!indMap.has(ind.nome)) indMap.set(ind.nome, ind);
        }
        for (const orc of diag.linkedOrcamento) {
          const key = `${orc.programa}|${orc.orgao}|${orc.ano}`;
          if (!orcMap.has(key)) orcMap.set(key, orc);
        }
        for (const norm of diag.linkedNormativos) {
          if (!normMap.has(norm.titulo)) normMap.set(norm.titulo, norm);
        }
      }

      const artigoOrc = Array.from(orcMap.values());
      const artigoNorm = Array.from(normMap.values());
      const artigoInd = Array.from(indMap.values());

      const programasCount = new Set(artigoOrc.map(o => o.programa)).size;
      const acoesVinculadas = artigoOrc.length;
      const totalLiquidado = artigoOrc.reduce((s, o) => s + (Number(o.liquidado) || 0), 0);
      const normativosCount = artigoNorm.length;

      // Evolution scoring uses trend analysis on indicators
      const indicadoresSummary = summarizeIndicatorEvolution(artigoInd);
      const indicadoresFavoraveis = indicadoresSummary.favoraveis;
      const indicadoresDesfavoraveis = indicadoresSummary.desfavoraveis;
      const indicadoresNovos = indicadoresSummary.novos;
      const indicadoresNeutros = indicadoresSummary.neutros;

      // ═══════════════════════════════════════════════════════
      // SCORING — Evolução (Resultados do Esforço)
      // ═══════════════════════════════════════════════════════

      // Orçamento (0-100): faixas por R$ liquidado total
      // Avalia se houve investimento real (resultado financeiro)
      const liqBi = totalLiquidado / 1e9;
      let scoreOrcamento = 0;
      if (liqBi >= 10) scoreOrcamento = 100;
      else if (liqBi >= 5) scoreOrcamento = 80;
      else if (liqBi >= 1) scoreOrcamento = 60;
      else if (liqBi >= 0.1) scoreOrcamento = 40;
      else if (totalLiquidado > 0) scoreOrcamento = 20;

      // Normativos (0-100): faixas por quantidade de instrumentos
      let scoreNormativa = 0;
      if (normativosCount >= 10) scoreNormativa = 100;
      else if (normativosCount >= 6) scoreNormativa = 75;
      else if (normativosCount >= 3) scoreNormativa = 50;
      else if (normativosCount >= 1) scoreNormativa = 25;

      // Indicadores (0-100): % de indicadores com melhoria em relação ao total
      // Favoráveis pontuam 100%, novos 40%, desfavoráveis penalizam 1:1
      const scoreIndicadores = indicadoresSummary.score;

      const scoreFarol = Math.round(
        scoreOrcamento * 0.35 +
        scoreNormativa * 0.35 +
        scoreIndicadores * 0.30
      );

      const sinal: 'verde' | 'amarelo' | 'vermelho' = scoreFarol >= 60 ? 'verde' : scoreFarol >= 35 ? 'amarelo' : 'vermelho';

      const partes: string[] = [];
      if (programasCount > 0) partes.push(`${programasCount} programa(s), ${acoesVinculadas} ação(ões), R$ ${(totalLiquidado / 1e9).toFixed(2)} bi → Orç: ${scoreOrcamento}/100`);
      if (normativosCount > 0) partes.push(`${normativosCount} normativo(s) → Norm: ${scoreNormativa}/100`);
      if (artigoInd.length > 0) {
        partes.push(`${artigoInd.length} indicador(es): ${indicadoresFavoraveis}↑ ${indicadoresNovos}★ ${indicadoresDesfavoraveis}↓ ${indicadoresNeutros}= → Ind: ${scoreIndicadores}/100`);
      }

      return {
        numero: artNum, titulo: art.titulo, tituloCompleto: art.tituloCompleto, cor: art.cor,
        programasCount, acoesVinculadas, totalLiquidado, normativosCount,
        indicadoresFavoraveis, indicadoresDesfavoraveis, indicadoresNovos, indicadoresNeutros,
        indicadoresTotal: artigoInd.length, scoreOrcamento, scoreNormativa, scoreIndicadores,
        scoreFarol, sinal,
        resumo: partes.join('. ') + '.',
        rawIndicadores: artigoInd, rawNormativos: artigoNorm, rawOrcamento: artigoOrc,
      };
    });
  }, [lacunas, diagnosticMap]);

  const mediaGeral = Math.round(artigoResults.reduce((s, a) => s + a.scoreFarol, 0) / artigoResults.length);

  const downloadAnnex = useCallback(() => {
    const rows = artigoResults.map(a => `
      <tr>
        <td><strong>Art. ${a.numero}</strong></td>
        <td>${a.titulo}</td>
        <td style="text-align:center">${a.programasCount} prog. / ${a.acoesVinculadas} ações (R$ ${(a.totalLiquidado/1e9).toFixed(2)} bi)</td>
        <td style="text-align:center">${a.normativosCount}</td>
        <td style="text-align:center">${a.indicadoresFavoraveis}↑ ${a.indicadoresNovos}★ ${a.indicadoresDesfavoraveis}↓</td>
        <td style="text-align:center;font-weight:bold;color:${a.sinal === 'verde' ? '#16a34a' : a.sinal === 'amarelo' ? '#ca8a04' : '#dc2626'}">${a.scoreFarol}%</td>
      </tr>
    `).join('');
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Evolução dos Artigos ICERD</title>
    <style>body{font-family:system-ui;padding:2rem;max-width:1200px;margin:auto}table{width:100%;border-collapse:collapse;margin-top:1rem}th,td{border:1px solid #ddd;padding:8px;font-size:12px}th{background:#f5f5f5;font-weight:600}</style></head>
    <body><h1>Evolução dos Artigos I-VII ICERD</h1>
    <p>Avaliação baseada em: Programas Orçamentários (35%) + Instrumentos Normativos (35%) + Indicadores com evolução (30%)</p>
    <p><strong>Fonte:</strong> Evidências agregadas das recomendações vinculadas a cada artigo (mesma base do Acompanhamento Gerencial).</p>
    <p><strong>Score Médio:</strong> ${mediaGeral}%</p>
    <table><thead><tr><th>Artigo</th><th>Tema</th><th>Orçamento</th><th>Normativos</th><th>Indicadores</th><th>Score</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <h2>Metodologia</h2>
    <ul>
      <li><strong>Orçamento (35%):</strong> Programas com execução rastreável</li>
      <li><strong>Normativa (35%):</strong> Instrumentos normativos vinculados ao artigo</li>
      <li><strong>Indicadores (30%):</strong> Somente indicadores com melhoria em série histórica ou recém-mensurados contam a favor</li>
    </ul>
    <p style="font-size:10px;color:#999">Gerado em ${new Date().toLocaleString('pt-BR')}</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'evolucao-artigos-icerd.html'; a.click();
    URL.revokeObjectURL(url);
  }, [artigoResults, mediaGeral]);

  const sinalIcon = (sinal: string) => {
    if (sinal === 'verde') return <CheckCircle2 className="w-5 h-5 text-success" />;
    if (sinal === 'amarelo') return <AlertTriangle className="w-5 h-5 text-warning" />;
    return <XCircle className="w-5 h-5 text-destructive" />;
  };

  const sinalColor = (sinal: string) => {
    if (sinal === 'verde') return 'bg-success/10 border-success/30 text-success';
    if (sinal === 'amarelo') return 'bg-warning/10 border-warning/30 text-warning';
    return 'bg-destructive/10 border-destructive/30 text-destructive';
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-6 h-6 text-primary" />
              Evolução dos Artigos — Políticas Raciais por Artigo ICERD
            </CardTitle>
            <Button variant="outline" size="sm" onClick={downloadAnnex} className="gap-1">
              <Download className="w-3 h-3" /> Baixar Anexo
            </Button>
          </div>
          <CardDescription>
            Avalia exclusivamente: Programas Orçamentários (35%) + Instrumentos Normativos (35%) + Indicadores com evolução (30%).
            <br/>
            <span className="text-[10px] italic">Fonte: mesma base de evidências mapeadas em Acompanhamento Gerencial → Recomendações, agregada por artigo.</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Score Médio Geral:</span>
              <Badge className={`text-lg px-3 py-1 ${mediaGeral >= 60 ? 'bg-success/20 text-success' : mediaGeral >= 35 ? 'bg-warning/20 text-warning' : 'bg-destructive/20 text-destructive'}`}>
                {mediaGeral}%
              </Badge>
            </div>
            <div className="flex gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-success" />≥60% Evolução</span>
              <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-warning" />35-59% Estagnação</span>
              <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-destructive" />&lt;35% Retrocesso</span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Critério de Indicadores:</strong> Somente indicadores com melhoria comprovada em série histórica contam plenamente a favor. Novos (sem série para comparar) contam apenas 40%. Indicadores com piora penalizam 1:1. Neutros não pontuam.
          </p>
          <div className="mt-3 p-3 bg-muted/30 rounded-lg text-[10px] text-muted-foreground space-y-1">
            <p className="font-semibold text-xs text-foreground">Metodologia de Cálculo — Evolução por Artigo</p>
            <p><strong>Score = R$ Liquidado (35%) + Normativos (35%) + Indicadores com melhoria (30%)</strong></p>
            <p>• <strong>R$ Liquidado (0-100):</strong> Faixas: &gt;0=20, ≥R$100mi=40, ≥R$1bi=60, ≥R$5bi=80, ≥R$10bi=100.</p>
            <p>• <strong>Normativos (0-100):</strong> Faixas: 1=25, 3=50, 6=75, 10+=100.</p>
            <p>• <strong>Indicadores (0-100):</strong> % com melhoria comprovada vs total. Novos contam 40%; piora penaliza 1:1.</p>
            <p>• <strong>Faixas:</strong> ≥60% Evolução (verde) | 35-59% Estagnação (amarelo) | &lt;35% Retrocesso (vermelho)</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {artigoResults.map(art => (
          <Card key={art.numero} className="border-l-4" style={{ borderLeftColor: art.cor }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  {sinalIcon(art.sinal)}
                  Art. {art.numero} — {art.titulo}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${sinalColor(art.sinal)}`}>
                    {art.sinal === 'verde' ? 'Evolução' : art.sinal === 'amarelo' ? 'Estagnação' : 'Retrocesso'}
                  </Badge>
                  <Badge className={`font-bold ${sinalColor(art.sinal)}`}>
                    {art.scoreFarol}%
                  </Badge>
                </div>
              </div>
              <p className="text-[10px] text-muted-foreground">{art.tituloCompleto}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={art.scoreFarol} className="h-2" />

              {/* Score breakdown — transparência total */}
              <div className="text-[10px] text-muted-foreground bg-muted/20 rounded p-2">
                <span className="font-medium">Composição:</span>{' '}
                Orç <strong>{art.scoreOrcamento}</strong>/100 × 35% = {Math.round(art.scoreOrcamento * 0.35)}{' | '}
                Norm <strong>{art.scoreNormativa}</strong>/100 × 35% = {Math.round(art.scoreNormativa * 0.35)}{' | '}
                Ind <strong>{art.scoreIndicadores}</strong>/100 × 30% = {Math.round(art.scoreIndicadores * 0.30)}{' '}
                → <strong>{art.scoreFarol}%</strong>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setDrilldown({ art, tab: 'orcamento' })}
                  className="p-2 bg-muted/30 rounded text-xs text-left hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <p className="font-medium mb-1">💰 Orçamento <span className="text-[10px] font-normal text-muted-foreground">({art.scoreOrcamento}/100)</span></p>
                  <p className="text-muted-foreground">
                    {art.programasCount} programa(s)<br/>
                    {art.acoesVinculadas} ação(ões)<br/>
                    R$ {(art.totalLiquidado / 1e9).toFixed(2)} bi
                  </p>
                </button>
                <button
                  onClick={() => setDrilldown({ art, tab: 'normativos' })}
                  className="p-2 bg-muted/30 rounded text-xs text-left hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <p className="font-medium mb-1">⚖️ Normativos <span className="text-[10px] font-normal text-muted-foreground">({art.scoreNormativa}/100)</span></p>
                  <p className="text-muted-foreground">{art.normativosCount} instrumento(s)</p>
                </button>
                <button
                  onClick={() => setDrilldown({ art, tab: 'indicadores' })}
                  className="p-2 bg-muted/30 rounded text-xs text-left hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <p className="font-medium mb-1">📊 Indicadores <span className="text-[10px] font-normal text-muted-foreground">({art.scoreIndicadores}/100)</span></p>
                  <p className="text-muted-foreground">
                    {art.indicadoresTotal} total:
                    <span className="text-success"> {art.indicadoresFavoraveis}↑</span>
                    <span className="text-primary"> {art.indicadoresNovos}★</span>
                    {art.indicadoresNeutros > 0 && <span> {art.indicadoresNeutros}=</span>}
                    {art.indicadoresDesfavoraveis > 0 && <span className="text-destructive"> {art.indicadoresDesfavoraveis}↓</span>}
                  </p>
                </button>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">{art.resumo}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {drilldown && (
        <FarolDrilldownDialog
          open={!!drilldown}
          onOpenChange={(open) => !open && setDrilldown(null)}
          artigoNumero={drilldown.art.numero}
          artigoTitulo={drilldown.art.titulo}
          indicadores={drilldown.art.rawIndicadores}
          normativos={drilldown.art.rawNormativos}
          orcamento={drilldown.art.rawOrcamento}
          initialTab={drilldown.tab}
        />
      )}
    </div>
  );
}

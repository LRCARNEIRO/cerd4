import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Scale, CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown, Minus, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, inferArtigosDocumentoNormativo, inferArtigosOrcamento, type ArtigoConvencao } from '@/utils/artigosConvencao';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

interface FarolEvolucaoPanelProps {
  lacunas: any[];
  orcamentoRecords: DadoOrcamentario[];
  indicadores: any[];
  stats: any;
  documentosNormativos: any[];
}

type FarolArtigoResult = {
  numero: ArtigoConvencao;
  titulo: string;
  tituloCompleto: string;
  cor: string;
  // Lacunas ONU
  lacunasTotal: number;
  lacunasCumpridas: number;
  lacunasParciais: number;
  lacunasEmAndamento: number;
  lacunasNaoCumpridas: number;
  lacunasRetrocesso: number;
  // Orçamento
  programasCount: number;
  totalLiquidado: number;
  // Normativa
  normativosCount: number;
  // Indicadores (only those with improvement or newly measured)
  indicadoresFavoraveis: number;
  indicadoresDesfavoraveis: number;
  indicadoresNovos: number;
  indicadoresTotal: number;
  // Score
  scoreFarol: number; // 0-100
  sinal: 'verde' | 'amarelo' | 'vermelho';
  resumo: string;
};

/**
 * Evaluates whether an indicator counts as "favorable" for the farol.
 * Favorable = has time series showing improvement, OR is newly measured (single data point).
 */
function evaluateIndicador(ind: any): 'favoravel' | 'desfavoravel' | 'novo' | 'neutro' {
  const dados = ind.dados;
  if (!dados) return 'neutro';

  // Check if dados has series (array of values over time)
  const series = dados.serie || dados.series || dados.historico;
  if (Array.isArray(series) && series.length >= 2) {
    // Compare first and last values
    const first = typeof series[0] === 'object' ? (series[0].valor ?? series[0].value) : series[0];
    const last = typeof series[series.length - 1] === 'object' ? (series[series.length - 1].valor ?? series[series.length - 1].value) : series[series.length - 1];
    if (typeof first === 'number' && typeof last === 'number') {
      // For negative indicators (homicide, inequality), decrease = favorable
      const nome = (ind.nome || '').toLowerCase();
      const isNegative = nome.includes('homicíd') || nome.includes('letalidade') || nome.includes('analfabet') ||
        nome.includes('mortalidade') || nome.includes('evasão') || nome.includes('desemprego') ||
        nome.includes('encarcer') || nome.includes('feminicíd') || nome.includes('violência');
      
      if (isNegative) {
        return last < first ? 'favoravel' : last > first ? 'desfavoravel' : 'neutro';
      }
      return last > first ? 'favoravel' : last < first ? 'desfavoravel' : 'neutro';
    }
  }

  // Single data point = newly measured = favorable (being measured is progress)
  if (Array.isArray(series) && series.length === 1) return 'novo';
  
  // Check for snapshot-style data (single values)
  if (typeof dados === 'object' && !Array.isArray(dados)) {
    const keys = Object.keys(dados);
    if (keys.length > 0) return 'novo';
  }

  return 'neutro';
}

export function FarolEvolucaoPanel({ lacunas, orcamentoRecords, indicadores, stats, documentosNormativos }: FarolEvolucaoPanelProps) {
  
  const artigoResults = useMemo<FarolArtigoResult[]>(() => {
    return ARTIGOS_CONVENCAO.map(art => {
      const artNum = art.numero;

      // ── LACUNAS ONU ──
      const artigoLacunas = lacunas.filter(l => {
        const explicit = l.artigos_convencao?.filter((a: string) => a)?.length > 0;
        if (explicit) return l.artigos_convencao.includes(artNum);
        const mapped = EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS] || [];
        return mapped.includes(artNum);
      });
      const lacunasTotal = artigoLacunas.length;
      const lacunasCumpridas = artigoLacunas.filter(l => l.status_cumprimento === 'cumprido').length;
      const lacunasParciais = artigoLacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length;
      const lacunasEmAndamento = artigoLacunas.filter(l => l.status_cumprimento === 'em_andamento').length;
      const lacunasNaoCumpridas = artigoLacunas.filter(l => l.status_cumprimento === 'nao_cumprido').length;
      const lacunasRetrocesso = artigoLacunas.filter(l => l.status_cumprimento === 'retrocesso').length;

      // ── ORÇAMENTO ──
      const artigoOrc = orcamentoRecords.filter(o => {
        if (o.artigos_convencao?.includes(artNum)) return true;
        return inferArtigosOrcamento(o).includes(artNum);
      });
      const programasCount = new Set(artigoOrc.map(o => o.programa)).size;
      const totalLiquidado = artigoOrc.reduce((s, o) => s + (Number(o.liquidado) || 0), 0);

      // ── NORMATIVA ──
      const artigoNorm = documentosNormativos.filter(d => {
        if (d.artigos_convencao?.includes(artNum)) return true;
        return inferArtigosDocumentoNormativo(d).includes(artNum);
      });
      const normativosCount = artigoNorm.length;

      // ── INDICADORES (favorability logic) ──
      const artigoInd = indicadores.filter((ind: any) => {
        if (ind.artigos_convencao?.includes(artNum)) return true;
        const mapped = EIXO_PARA_ARTIGOS[ind.categoria as keyof typeof EIXO_PARA_ARTIGOS] || [];
        return mapped.includes(artNum);
      });

      let indicadoresFavoraveis = 0;
      let indicadoresDesfavoraveis = 0;
      let indicadoresNovos = 0;
      artigoInd.forEach((ind: any) => {
        const result = evaluateIndicador(ind);
        if (result === 'favoravel') indicadoresFavoraveis++;
        else if (result === 'desfavoravel') indicadoresDesfavoraveis++;
        else if (result === 'novo') indicadoresNovos++;
      });

      // ── SCORE FAROL ──
      // Weights: Lacunas 30%, Orçamento 25%, Normativa 25%, Indicadores 20%
      let scoreLacunas = 0;
      if (lacunasTotal > 0) {
        scoreLacunas = ((lacunasCumpridas * 1.0 + lacunasParciais * 0.6 + lacunasEmAndamento * 0.3) / lacunasTotal) * 100;
      }

      const scoreOrcamento = Math.min(100, programasCount > 0 ? 40 + Math.min(60, totalLiquidado / 1e8) : 0);
      const scoreNormativa = Math.min(100, normativosCount * 12);
      
      const totalIndEval = indicadoresFavoraveis + indicadoresDesfavoraveis + indicadoresNovos;
      let scoreIndicadores = 0;
      if (totalIndEval > 0) {
        scoreIndicadores = ((indicadoresFavoraveis + indicadoresNovos * 0.7) / totalIndEval) * 100;
      }

      const scoreFarol = Math.round(
        scoreLacunas * 0.30 +
        scoreOrcamento * 0.25 +
        scoreNormativa * 0.25 +
        scoreIndicadores * 0.20
      );

      const sinal: 'verde' | 'amarelo' | 'vermelho' = scoreFarol >= 60 ? 'verde' : scoreFarol >= 35 ? 'amarelo' : 'vermelho';

      // Resumo textual
      const partes: string[] = [];
      if (lacunasTotal > 0) {
        const pctAtendido = Math.round(((lacunasCumpridas + lacunasParciais + lacunasEmAndamento) / lacunasTotal) * 100);
        partes.push(`${pctAtendido}% das ${lacunasTotal} recomendações ONU em andamento/atendidas`);
      }
      if (programasCount > 0) partes.push(`${programasCount} programa(s) orçamentário(s) (R$ ${(totalLiquidado / 1e9).toFixed(2)} bi liquidado)`);
      if (normativosCount > 0) partes.push(`${normativosCount} instrumento(s) normativo(s)`);
      if (indicadoresFavoraveis + indicadoresNovos > 0) {
        partes.push(`${indicadoresFavoraveis + indicadoresNovos} indicador(es) com evolução positiva ou recém-mensurados`);
      }
      if (indicadoresDesfavoraveis > 0) {
        partes.push(`${indicadoresDesfavoraveis} indicador(es) com piora`);
      }

      return {
        numero: artNum,
        titulo: art.titulo,
        tituloCompleto: art.tituloCompleto,
        cor: art.cor,
        lacunasTotal, lacunasCumpridas, lacunasParciais, lacunasEmAndamento, lacunasNaoCumpridas, lacunasRetrocesso,
        programasCount, totalLiquidado,
        normativosCount,
        indicadoresFavoraveis, indicadoresDesfavoraveis, indicadoresNovos,
        indicadoresTotal: artigoInd.length,
        scoreFarol, sinal,
        resumo: partes.join('. ') + '.',
      };
    });
  }, [lacunas, orcamentoRecords, indicadores, documentosNormativos]);

  const mediaGeral = Math.round(artigoResults.reduce((s, a) => s + a.scoreFarol, 0) / artigoResults.length);

  const downloadAnnex = useCallback(() => {
    const rows = artigoResults.map(a => `
      <tr>
        <td><strong>Art. ${a.numero}</strong></td>
        <td>${a.titulo}</td>
        <td style="text-align:center">${a.lacunasTotal} (${a.lacunasCumpridas}✓ ${a.lacunasParciais}◐ ${a.lacunasEmAndamento}⟳ ${a.lacunasNaoCumpridas}✗ ${a.lacunasRetrocesso}↓)</td>
        <td style="text-align:center">${a.programasCount} prog. (R$ ${(a.totalLiquidado/1e9).toFixed(2)} bi)</td>
        <td style="text-align:center">${a.normativosCount}</td>
        <td style="text-align:center">${a.indicadoresFavoraveis}↑ ${a.indicadoresNovos}★ ${a.indicadoresDesfavoraveis}↓</td>
        <td style="text-align:center;font-weight:bold;color:${a.sinal === 'verde' ? '#16a34a' : a.sinal === 'amarelo' ? '#ca8a04' : '#dc2626'}">${a.scoreFarol}%</td>
      </tr>
    `).join('');
    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Farol de Evolução por Artigo ICERD</title>
    <style>body{font-family:system-ui;padding:2rem;max-width:1200px;margin:auto}table{width:100%;border-collapse:collapse;margin-top:1rem}th,td{border:1px solid #ddd;padding:8px;font-size:12px}th{background:#f5f5f5;font-weight:600}</style></head>
    <body><h1>Farol de Evolução — Artigos I-VII ICERD</h1>
    <p>Avaliação baseada em: Lacunas ONU, Programas Orçamentários, Instrumentos Normativos e Indicadores com série temporal.</p>
    <p><strong>Score Médio:</strong> ${mediaGeral}%</p>
    <table><thead><tr><th>Artigo</th><th>Tema</th><th>Lacunas ONU</th><th>Orçamento</th><th>Normativos</th><th>Indicadores</th><th>Score</th></tr></thead>
    <tbody>${rows}</tbody></table>
    <h2>Metodologia</h2>
    <ul>
      <li><strong>Lacunas ONU (30%):</strong> Cumpridas=100%, Parciais=60%, Em Andamento=30%, Não Cumpridas/Retrocesso=0%</li>
      <li><strong>Orçamento (25%):</strong> Programas com execução rastreável</li>
      <li><strong>Normativa (25%):</strong> Instrumentos normativos vinculados ao artigo</li>
      <li><strong>Indicadores (20%):</strong> Somente indicadores com melhoria em série histórica ou recém-mensurados contam a favor</li>
    </ul>
    <p style="font-size:10px;color:#999">Gerado em ${new Date().toLocaleString('pt-BR')}</p></body></html>`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'farol-evolucao-icerd.html'; a.click();
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
      {/* Header */}
      <Card className="border-2 border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="flex items-center gap-2">
              <Scale className="w-6 h-6 text-primary" />
              Farol de Evolução das Políticas Raciais por Artigo ICERD
            </CardTitle>
            <Button variant="outline" size="sm" onClick={downloadAnnex} className="gap-1">
              <Download className="w-3 h-3" /> Baixar Anexo
            </Button>
          </div>
          <CardDescription>
            Avalia exclusivamente: Lacunas ONU (30%) + Programas Orçamentários (25%) + Instrumentos Normativos (25%) + Indicadores com evolução (20%)
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
            <strong>Critério de Indicadores:</strong> Somente indicadores com melhoria comprovada em série histórica ou recém-mensurados (inclusão = progresso) contam a favor. Indicadores com piora penalizam o score.
          </p>
        </CardContent>
      </Card>

      {/* Cards por artigo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {artigoResults.map(art => (
          <Card key={art.numero} className="border-l-4" style={{ borderLeftColor: art.cor }}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  {sinalIcon(art.sinal)}
                  Art. {art.numero} — {art.titulo}
                </CardTitle>
                <Badge className={`font-bold ${sinalColor(art.sinal)}`}>
                  {art.scoreFarol}%
                </Badge>
              </div>
              <p className="text-[10px] text-muted-foreground">{art.tituloCompleto}</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={art.scoreFarol} className="h-2" />

              <div className="grid grid-cols-2 gap-2">
                {/* Lacunas */}
                <div className="p-2 bg-muted/30 rounded text-xs">
                  <p className="font-medium mb-1">📋 Lacunas ONU</p>
                  <p className="text-muted-foreground">
                    {art.lacunasTotal} total: {art.lacunasCumpridas}✓ {art.lacunasParciais}◐ {art.lacunasEmAndamento}⟳ {art.lacunasNaoCumpridas}✗
                    {art.lacunasRetrocesso > 0 && <span className="text-destructive"> {art.lacunasRetrocesso}↓</span>}
                  </p>
                </div>
                {/* Orçamento */}
                <div className="p-2 bg-muted/30 rounded text-xs">
                  <p className="font-medium mb-1">💰 Orçamento</p>
                  <p className="text-muted-foreground">
                    {art.programasCount} programa(s)<br/>
                    R$ {(art.totalLiquidado / 1e9).toFixed(2)} bi liquidado
                  </p>
                </div>
                {/* Normativa */}
                <div className="p-2 bg-muted/30 rounded text-xs">
                  <p className="font-medium mb-1">⚖️ Normativos</p>
                  <p className="text-muted-foreground">{art.normativosCount} instrumento(s)</p>
                </div>
                {/* Indicadores */}
                <div className="p-2 bg-muted/30 rounded text-xs">
                  <p className="font-medium mb-1">📊 Indicadores</p>
                  <p className="text-muted-foreground">
                    {art.indicadoresTotal} total:
                    <span className="text-success"> {art.indicadoresFavoraveis}↑</span>
                    <span className="text-primary"> {art.indicadoresNovos}★</span>
                    {art.indicadoresDesfavoraveis > 0 && <span className="text-destructive"> {art.indicadoresDesfavoraveis}↓</span>}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">{art.resumo}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function useCallback(fn: () => void, deps: any[]) {
  return useMemo(() => fn, deps);
}

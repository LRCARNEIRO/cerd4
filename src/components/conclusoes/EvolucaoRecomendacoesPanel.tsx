import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { classificarOrigemLacuna, ORIGEM_CONFIG, type OrigemLacuna } from '@/utils/classificarOrigemLacuna';
import { Loader2, TrendingUp, BarChart3, TrendingDown, Minus, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { useMemo, useCallback, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EIXO_PARA_ARTIGOS, inferArtigosDocumentoNormativo, inferArtigosOrcamento, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { getSafeIndicadores, inferArtigosIndicador } from '@/utils/inferArtigosIndicador';
import { evaluateIndicadorDetailed } from '@/components/conclusoes/evaluateIndicador';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';
import { FarolDrilldownDialog } from './FarolDrilldownDialog';

const eixoLabels: Record<string, string> = {
  legislacao_justica: 'Legislação e Justiça',
  politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública',
  saude: 'Saúde',
  educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda',
  terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio',
  participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas',
};

function normalizeArticle(raw: string): ArtigoConvencao | null {
  const value = String(raw || '').toUpperCase().trim();
  if (value.includes('VII')) return 'VII';
  if (value.includes('VI')) return 'VI';
  if (value.includes('V')) return 'V';
  if (value.includes('IV')) return 'IV';
  if (value.includes('III')) return 'III';
  if (value.includes('II')) return 'II';
  if (value.includes('I')) return 'I';
  return null;
}

function getArtigosFromRecomendacao(l: { artigos_convencao?: string[] | null; eixo_tematico: string }): ArtigoConvencao[] {
  const raw = (l as any).artigos_convencao;
  const explicit = Array.isArray(raw) ? raw.map(normalizeArticle).filter(Boolean) as ArtigoConvencao[] : [];
  if (explicit.length > 0) return [...new Set(explicit)];
  return EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS] || [];
}

type EvolucaoResult = {
  id: string;
  paragrafo: string;
  tema: string;
  eixo_tematico: string;
  artigos: ArtigoConvencao[];
  prioridade: string;
  scoreOrcamento: number;
  scoreNormativa: number;
  scoreIndicadores: number;
  scoreFarol: number;
  sinal: 'verde' | 'amarelo' | 'vermelho';
  programasCount: number;
  acoesVinculadas: number;
  totalLiquidado: number;
  normativosCount: number;
  indicadoresFavoraveis: number;
  indicadoresDesfavoraveis: number;
  indicadoresNovos: number;
  indicadoresTotal: number;
  // raw data for drilldown
  rawIndicadores: any[];
  rawNormativos: any[];
  rawOrcamento: any[];
};

/**
 * Evolução das Recomendações — avalia se evidências vinculadas melhoraram (2018-2025).
 * Pesos: Indicadores (50%) + Orçamento (30%) + Normativos (20%)
 * Semáforo: ≥60% Evolução | 35-59% Estagnação | <35% Retrocesso
 */
export function EvolucaoRecomendacoesPanel() {
  const { data: recomendacoes, isLoading: loadingRecs } = useLacunasIdentificadas({});
  const [drilldown, setDrilldown] = useState<{ rec: EvolucaoResult; tab: string } | null>(null);

  const { data: indicadores, isLoading: loadingInd } = useQuery({
    queryKey: ['evolucao-rec-indicadores'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indicadores_interseccionais')
        .select('nome, categoria, tendencia, dados, artigos_convencao')
        .neq('categoria', 'common_core');
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: orcamento, isLoading: loadingOrc } = useQuery({
    queryKey: ['evolucao-rec-orcamento'],
    queryFn: async () => {
      let all: any[] = [];
      let page = 0;
      while (true) {
        const { data, error } = await supabase
          .from('dados_orcamentarios')
          .select('programa, orgao, ano, dotacao_autorizada, liquidado, pago, artigos_convencao')
          .range(page * 1000, (page + 1) * 1000 - 1);
        if (error) throw error;
        if (!data || data.length === 0) break;
        all = all.concat(data);
        if (data.length < 1000) break;
        page++;
      }
      return all;
    },
    staleTime: 5 * 60 * 1000,
  });

  const { data: normativos, isLoading: loadingNorm } = useQuery({
    queryKey: ['evolucao-rec-normativos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('documentos_normativos')
        .select('titulo, artigos_convencao, status');
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const isLoading = loadingRecs || loadingInd || loadingOrc || loadingNorm;

  const results = useMemo<EvolucaoResult[]>(() => {
    if (!recomendacoes || !indicadores || !orcamento || !normativos) return [];

    const dedupedIndicadores = getSafeIndicadores(indicadores);

    return recomendacoes.map(rec => {
      const artigos = getArtigosFromRecomendacao(rec);

      // Build keyword tokens from recommendation tema + description + texto_original_onu
      const GENERIC_STOPS = ['brasil', 'racial', 'negro', 'negra', 'politica', 'programa', 'geral', 'nacional', 'federal', 'estado', 'governo', 'medida', 'direito', 'parte', 'comite', 'sobre', 'contra', 'entre', 'todas', 'todos', 'forma', 'podem', 'grupo', 'populacao', 'pessoa', 'acoes', 'acordo', 'ainda', 'alem', 'outro', 'outras', 'outros', 'sendo', 'relacao', 'numero', 'dados'];
      const rawText = `${rec.tema} ${rec.descricao_lacuna} ${(rec as any).texto_original_onu || ''}`.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      const temaTokens = rawText
        .split(/\s+/).filter(t => t.length >= 5 && !GENERIC_STOPS.includes(t));

      // Also check if normativo/orcamento explicitly references this recommendation paragraph
      const paragrafoRef = String(rec.paragrafo || '').replace(/[^0-9a-zA-Z]/g, '').toLowerCase();

      // --- ORÇAMENTO: keyword-only + explicit paragraph reference ---
      const orcByKeyword = orcamento.filter((o: any) => {
        const h = `${o.programa} ${o.orgao}`.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return temaTokens.filter(t => !GENERIC_STOPS.includes(t))
          .some(t => h.includes(t));
      });
      const allOrc = Array.from(new Map(orcByKeyword.map((o: any) => [`${o.programa}-${o.orgao}-${o.ano}`, o])).values());

      const programasCount = new Set(allOrc.map((o: any) => o.programa)).size;
      const acoesVinculadas = allOrc.length;
      const totalLiquidado = allOrc.reduce((s: number, o: any) => s + (Number(o.liquidado) || 0), 0);

      // --- NORMATIVOS: keyword-only matching (no broad article matching) ---
      const allNorm = normativos.filter((d: any) => {
        const h = d.titulo.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return temaTokens.filter(t => !GENERIC_STOPS.includes(t))
          .some(t => h.includes(t));
      });
      const normativosCount = allNorm.length;

      // --- INDICADORES: keyword-only matching (same as normativos — no article-level matching) ---
      const allInd = dedupedIndicadores.filter((ind: any) => {
        const h = `${ind.nome} ${ind.categoria} ${ind.subcategoria || ''}`.toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return temaTokens.filter(t => !GENERIC_STOPS.includes(t))
          .some(t => h.includes(t));
      });

      // Evaluate indicator trends
      let favoraveis = 0, desfavoraveis = 0, novos = 0;
      allInd.forEach((ind: any) => {
        const result = evaluateIndicadorDetailed(ind).result;
        if (result === 'favoravel') favoraveis++;
        else if (result === 'desfavoravel') desfavoraveis++;
        else if (result === 'novo') novos++;
      });

      const indicadoresTotal = allInd.length;
      const rawIndScore = indicadoresTotal > 0
        ? ((favoraveis + novos * 0.7 - desfavoraveis * 0.5) / indicadoresTotal) * 100
        : 0;
      const scoreIndicadores = Math.max(0, Math.min(100, rawIndScore));

      // NEW WEIGHTS: Indicadores 50%, Orçamento 30%, Normativos 20%
      const scoreOrcamento = Math.min(100, programasCount > 0 ? 40 + Math.min(60, totalLiquidado / 1e8) : 0);
      const scoreNormativa = Math.min(100, normativosCount * 12);

      const scoreFarol = Math.round(
        scoreIndicadores * 0.50 +
        scoreOrcamento * 0.30 +
        scoreNormativa * 0.20
      );

      const sinal: 'verde' | 'amarelo' | 'vermelho' = scoreFarol >= 60 ? 'verde' : scoreFarol >= 35 ? 'amarelo' : 'vermelho';

      return {
        id: rec.id,
        paragrafo: rec.paragrafo,
        tema: rec.tema,
        eixo_tematico: rec.eixo_tematico,
        artigos,
        prioridade: rec.prioridade,
        scoreOrcamento: Math.round(scoreOrcamento),
        scoreNormativa: Math.round(scoreNormativa),
        scoreIndicadores: Math.round(scoreIndicadores),
        scoreFarol,
        sinal,
        programasCount,
        acoesVinculadas,
        totalLiquidado,
        normativosCount,
        indicadoresFavoraveis: favoraveis,
        indicadoresDesfavoraveis: desfavoraveis,
        indicadoresNovos: novos,
        indicadoresTotal,
        rawIndicadores: allInd,
        rawNormativos: allNorm,
        rawOrcamento: allOrc,
      };
    });
  }, [recomendacoes, indicadores, orcamento, normativos]);

  const grouped = useMemo(() => {
    const r: Record<OrigemLacuna, EvolucaoResult[]> = { cerd: [], rg: [], durban: [] };
    results.forEach(item => {
      r[classificarOrigemLacuna(item.paragrafo)].push(item);
    });
    r.cerd.sort((a, b) => (parseInt(a.paragrafo.replace(/\D/g, '')) || 0) - (parseInt(b.paragrafo.replace(/\D/g, '')) || 0));
    r.rg.sort((a, b) => a.paragrafo.localeCompare(b.paragrafo));
    r.durban.sort((a, b) => a.paragrafo.localeCompare(b.paragrafo));
    return r;
  }, [results]);

  const mediaGeral = results.length > 0 ? Math.round(results.reduce((s, r) => s + r.scoreFarol, 0) / results.length) : 0;
  const sinaisCount = useMemo(() => {
    return { verde: results.filter(r => r.sinal === 'verde').length, amarelo: results.filter(r => r.sinal === 'amarelo').length, vermelho: results.filter(r => r.sinal === 'vermelho').length };
  }, [results]);

  const generateExportHTML = useCallback(() => {
    if (results.length === 0) return '<html><body>Sem dados</body></html>';

    const renderDetailRows = (items: EvolucaoResult[]) => items.map(r => {
      const corSinal = r.sinal === 'verde' ? '#16a34a' : r.sinal === 'amarelo' ? '#ca8a04' : '#dc2626';
      const labelSinal = r.sinal === 'verde' ? 'Evolução' : r.sinal === 'amarelo' ? 'Estagnação' : 'Retrocesso';

      // Evidence details for export
      const indDetails = r.rawIndicadores.map((ind: any) => {
        const ev = evaluateIndicadorDetailed(ind);
        const trendLabel = ev.result === 'favoravel' ? '↑ Melhoria' : ev.result === 'desfavoravel' ? '↓ Piora' : ev.result === 'novo' ? '★ Novo' : '— Neutro';
        return `<li>${ind.nome} (${ind.fonte || ind.categoria}) — <strong>${trendLabel}</strong></li>`;
      }).join('');

      const normDetails = r.rawNormativos.map((n: any) => `<li>${n.titulo}</li>`).join('');

      const orcDetails = r.rawOrcamento.slice(0, 15).map((o: any) =>
        `<li>${o.programa} — ${o.orgao} (${o.ano}) — R$ ${((Number(o.liquidado) || 0) / 1e6).toFixed(1)}M liquidado</li>`
      ).join('');

      return `<tr>
        <td style="font-family:monospace;font-weight:bold;vertical-align:top">${r.paragrafo}</td>
        <td style="vertical-align:top">${r.tema}</td>
        <td style="color:${corSinal};font-weight:bold;vertical-align:top">${labelSinal} (${r.scoreFarol}%)</td>
        <td style="font-size:10px;vertical-align:top">
          <strong>Indicadores (${r.scoreIndicadores}pts — 50%):</strong> ${r.indicadoresTotal} total: ${r.indicadoresFavoraveis}↑ ${r.indicadoresNovos}★ ${r.indicadoresDesfavoraveis}↓
          ${indDetails ? `<ul style="margin:4px 0;padding-left:16px">${indDetails}</ul>` : '<p>Nenhum indicador vinculado</p>'}
          <strong>Orçamento (${r.scoreOrcamento}pts — 30%):</strong> ${r.programasCount} programa(s), R$ ${(r.totalLiquidado / 1e9).toFixed(2)} bi
          ${orcDetails ? `<ul style="margin:4px 0;padding-left:16px">${orcDetails}</ul>` : '<p>Nenhuma ação orçamentária vinculada</p>'}
          ${r.rawOrcamento.length > 15 ? `<p style="font-style:italic">... e mais ${r.rawOrcamento.length - 15} ações</p>` : ''}
          <strong>Normativos (${r.scoreNormativa}pts — 20%):</strong> ${r.normativosCount} instrumento(s)
          ${normDetails ? `<ul style="margin:4px 0;padding-left:16px">${normDetails}</ul>` : '<p>Nenhum instrumento normativo vinculado</p>'}
        </td>
      </tr>`;
    }).join('');

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Evolução das Recomendações — Tendência de Evidências 2018-2025</title>
<style>
body{font-family:Arial,sans-serif;max-width:1400px;margin:20px auto;color:#222;font-size:12px}
h1{font-size:18px;border-bottom:2px solid #1e40af;padding-bottom:8px}
h2{font-size:14px;margin-top:20px;color:#1e40af}
table{width:100%;border-collapse:collapse;margin:8px 0}
th,td{border:1px solid #ddd;padding:5px 7px;text-align:left;font-size:11px}
th{background:#f1f5f9;font-size:10px}
ul{font-size:10px}
.methodology{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px;margin:12px 0}
.summary-box{display:flex;gap:20px;margin:12px 0;padding:10px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px}
.nota{font-size:10px;color:#666}
</style></head><body>
<h1>📈 Evolução das Recomendações — Tendência de Evidências (2018-2025)</h1>
<p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>

<div class="summary-box">
  <div><strong>Score Médio:</strong> ${mediaGeral}%</div>
  <div style="color:#16a34a"><strong>${sinaisCount.verde}</strong> Evolução (≥60%)</div>
  <div style="color:#ca8a04"><strong>${sinaisCount.amarelo}</strong> Estagnação (35-59%)</div>
  <div style="color:#dc2626"><strong>${sinaisCount.vermelho}</strong> Retrocesso (&lt;35%)</div>
  <div><strong>Total:</strong> ${results.length} recomendações</div>
</div>

<div class="methodology">
<h2>📐 Metodologia</h2>
<p>Avalia se as evidências vinculadas a cada recomendação <strong>melhoraram</strong> no período 2018-2025.</p>
<table>
<tr><th>Dimensão</th><th>Peso</th><th>O que mede</th><th>Justificativa</th></tr>
<tr><td><strong>Indicadores</strong></td><td><strong>50%</strong></td><td>Tendência na série histórica (somente variação positiva pontua)</td><td>Termômetro real da efetividade — demonstra se a política alcançou a ponta</td></tr>
<tr><td><strong>Orçamento</strong></td><td><strong>30%</strong></td><td>Programas com execução rastreável + R$ liquidado</td><td>Demonstra investimento concreto, embora não garanta resultado na ponta</td></tr>
<tr><td><strong>Normativos</strong></td><td><strong>20%</strong></td><td>Instrumentos legislativos vinculados</td><td>Inicia o ciclo de políticas, mas é o mais distante do resultado final</td></tr>
</table>
<p class="nota"><strong>Semáforo:</strong> ≥60% Evolução (verde) | 35-59% Estagnação (amarelo) | &lt;35% Retrocesso (vermelho)</p>
<p class="nota"><strong>Diferença vs. Status (Relação Completa):</strong> O <em>Status</em> avalia se a recomendação foi cumprida (cobertura de dados). A <em>Evolução</em> avalia se os dados mostram melhora no período.</p>
</div>

<h2>Detalhamento por Recomendação (com evidências)</h2>
<table>
<tr><th>§</th><th>Tema</th><th>Sinal</th><th>Evidências (Indicadores / Orçamento / Normativos)</th></tr>
${renderDetailRows([...grouped.cerd, ...grouped.rg, ...grouped.durban])}
</table>

<p class="nota" style="margin-top:16px">Documento gerado pelo Sistema de Monitoramento CERD IV — ${new Date().toLocaleDateString('pt-BR')}</p>
</body></html>`;
  }, [results, grouped, mediaGeral, sinaisCount]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getSinalIcon = (sinal: 'verde' | 'amarelo' | 'vermelho') => {
    if (sinal === 'verde') return <TrendingUp className="w-3.5 h-3.5 text-success" />;
    if (sinal === 'amarelo') return <Minus className="w-3.5 h-3.5 text-warning" />;
    return <TrendingDown className="w-3.5 h-3.5 text-destructive" />;
  };

  const getSinalLabel = (sinal: 'verde' | 'amarelo' | 'vermelho') => {
    if (sinal === 'verde') return 'Evolução';
    if (sinal === 'amarelo') return 'Estagnação';
    return 'Retrocesso';
  };

  const getSinalColor = (sinal: 'verde' | 'amarelo' | 'vermelho') => {
    if (sinal === 'verde') return 'text-success';
    if (sinal === 'amarelo') return 'text-warning';
    return 'text-destructive';
  };

  const renderGroup = (key: OrigemLacuna, items: EvolucaoResult[]) => {
    const config = ORIGEM_CONFIG[key];
    if (items.length === 0) return null;

    const sinais = { verde: items.filter(i => i.sinal === 'verde').length, amarelo: items.filter(i => i.sinal === 'amarelo').length, vermelho: items.filter(i => i.sinal === 'vermelho').length };

    return (
      <Card key={key} className="border-l-4" style={{ borderLeftColor: key === 'cerd' ? 'hsl(var(--primary))' : key === 'rg' ? '#d97706' : '#7c3aed' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            {config.label}
            <Badge variant="secondary" className="ml-auto">{items.length} recomendações</Badge>
          </CardTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            {sinais.verde > 0 && <Badge variant="outline" className="text-success border-success/30 text-xs">{sinais.verde} Evolução</Badge>}
            {sinais.amarelo > 0 && <Badge variant="outline" className="text-warning border-warning/30 text-xs">{sinais.amarelo} Estagnação</Badge>}
            {sinais.vermelho > 0 && <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">{sinais.vermelho} Retrocesso</Badge>}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">§</TableHead>
                  <TableHead>Tema</TableHead>
                  <TableHead className="w-[100px]">Artigos</TableHead>
                  <TableHead className="w-[110px]">Sinal</TableHead>
                  <TableHead className="w-[60px]">Score</TableHead>
                  <TableHead className="w-[130px]">Indicadores (50%)</TableHead>
                  <TableHead className="w-[130px]">Orçamento (30%)</TableHead>
                  <TableHead className="w-[100px]">Normativos (20%)</TableHead>
                  <TableHead className="w-[80px]">Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono font-semibold text-xs">{r.paragrafo}</TableCell>
                    <TableCell className="text-sm">{r.tema}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-0.5">
                        {r.artigos.map(a => (
                          <Badge key={a} variant="outline" className="text-[10px] px-1 py-0">{a}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {getSinalIcon(r.sinal)}
                        <span className={`text-xs font-semibold ${getSinalColor(r.sinal)}`}>{getSinalLabel(r.sinal)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-mono font-bold ${r.sinal === 'verde' ? 'text-success' : r.sinal === 'amarelo' ? 'text-warning' : 'text-destructive'}`}>
                        {r.scoreFarol}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setDrilldown({ rec: r, tab: 'indicadores' })}
                        className="text-[10px] text-left hover:bg-muted/50 rounded p-1 cursor-pointer transition-colors w-full"
                      >
                        {r.indicadoresTotal > 0 ? (
                          <>
                            <span className="text-success">{r.indicadoresFavoraveis}↑</span>{' '}
                            <span className="text-primary">{r.indicadoresNovos}★</span>{' '}
                            <span className="text-destructive">{r.indicadoresDesfavoraveis}↓</span>
                            <div className="text-[9px] text-muted-foreground">({r.scoreIndicadores}pts) — clique p/ detalhes</div>
                          </>
                        ) : <span className="text-muted-foreground">—</span>}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setDrilldown({ rec: r, tab: 'orcamento' })}
                        className="text-[10px] text-left hover:bg-muted/50 rounded p-1 cursor-pointer transition-colors w-full"
                      >
                        {r.programasCount > 0 ? (
                          <>
                            {r.programasCount} prog. / R$ {(r.totalLiquidado / 1e9).toFixed(2)}bi
                            <div className="text-[9px] text-muted-foreground">({r.scoreOrcamento}pts) — clique p/ detalhes</div>
                          </>
                        ) : <span className="text-muted-foreground">—</span>}
                      </button>
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => setDrilldown({ rec: r, tab: 'normativos' })}
                        className="text-[10px] text-left hover:bg-muted/50 rounded p-1 cursor-pointer transition-colors w-full"
                      >
                        {r.normativosCount > 0 ? (
                          <>
                            {r.normativosCount} instr.
                            <div className="text-[9px] text-muted-foreground">({r.scoreNormativa}pts) — clique p/ detalhes</div>
                          </>
                        ) : <span className="text-muted-foreground">—</span>}
                      </button>
                    </TableCell>
                    <TableCell>
                      <Badge variant={r.prioridade === 'critica' ? 'destructive' : 'outline'} className="text-xs capitalize">
                        {r.prioridade}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary infographic */}
      <div className="bg-muted/30 rounded-lg border p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Evolução das Recomendações — Tendência de Evidências (2018-2025)
          </h3>
          <ExportTabButtons
            generateHTML={generateExportHTML}
            fileName="evolucao-recomendacoes"
            label="Exportar"
            compact
          />
        </div>

        {/* Status summary gauge */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          <div className="bg-card rounded-lg border p-3 text-center">
            <span className={`text-3xl font-bold ${mediaGeral >= 60 ? 'text-success' : mediaGeral >= 35 ? 'text-warning' : 'text-destructive'}`}>
              {mediaGeral}%
            </span>
            <p className="text-[10px] text-muted-foreground mt-1">Score Médio</p>
          </div>
          <div className="bg-card rounded-lg border p-3 text-center">
            <span className="text-2xl font-bold text-foreground">{results.length}</span>
            <p className="text-[10px] text-muted-foreground mt-1">Total Recomendações</p>
          </div>
          <div className="bg-success/10 rounded-lg border border-success/20 p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-success" />
              <span className="text-2xl font-bold text-success">{sinaisCount.verde}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Evolução (≥60%)</p>
            <Progress value={results.length > 0 ? (sinaisCount.verde / results.length) * 100 : 0} className="h-1.5 mt-1" />
          </div>
          <div className="bg-warning/10 rounded-lg border border-warning/20 p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <span className="text-2xl font-bold text-warning">{sinaisCount.amarelo}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Estagnação (35-59%)</p>
            <Progress value={results.length > 0 ? (sinaisCount.amarelo / results.length) * 100 : 0} className="h-1.5 mt-1" />
          </div>
          <div className="bg-destructive/10 rounded-lg border border-destructive/20 p-3 text-center">
            <div className="flex items-center justify-center gap-1">
              <XCircle className="w-4 h-4 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{sinaisCount.vermelho}</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Retrocesso (&lt;35%)</p>
            <Progress value={results.length > 0 ? (sinaisCount.vermelho / results.length) * 100 : 0} className="h-1.5 mt-1" />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Avalia se as evidências vinculadas a cada recomendação <strong>melhoraram</strong> no período, com pesos:
          <strong> Indicadores (50%)</strong> — termômetro real de efetividade;
          <strong> Orçamento (30%)</strong> — investimento concreto;
          <strong> Normativos (20%)</strong> — início do ciclo de políticas.
          <em> Clique nos contadores para auditar as evidências.</em>
        </p>
      </div>

      {renderGroup('cerd', grouped.cerd)}
      {renderGroup('rg', grouped.rg)}
      {renderGroup('durban', grouped.durban)}

      <div className="bg-muted/20 rounded-lg border p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Legenda do Semáforo:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success" /> <strong>Evolução (≥60%):</strong> Evidências mostram melhora no período</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> <strong>Estagnação (35-59%):</strong> Pouca variação detectada</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> <strong>Retrocesso (&lt;35%):</strong> Indicadores em piora ou sem evidências</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          <strong>Pesos:</strong> Indicadores (50%) — verdadeiro termômetro da efetividade |
          Orçamento (30%) — investimento concreto, mas não garante resultado na ponta |
          Normativos (20%) — início do ciclo, menor peso pois não significa alcance.
        </p>
        <p className="text-[10px] text-muted-foreground mt-1 italic">
          <strong>Diferença vs. Status (Relação Completa):</strong> O Status avalia se a recomendação foi cumprida (cobertura). A Evolução avalia se os dados mostram melhora.
        </p>
      </div>

      {/* Drilldown dialog reusing FarolDrilldownDialog */}
      {drilldown && (
        <FarolDrilldownDialog
          open={!!drilldown}
          onOpenChange={(open) => !open && setDrilldown(null)}
          artigoNumero={`§${drilldown.rec.paragrafo}`}
          artigoTitulo={drilldown.rec.tema}
          indicadores={drilldown.rec.rawIndicadores}
          normativos={drilldown.rec.rawNormativos}
          orcamento={drilldown.rec.rawOrcamento}
          initialTab={drilldown.tab}
        />
      )}
    </div>
  );
}

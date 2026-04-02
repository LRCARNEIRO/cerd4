import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { classificarOrigemLacuna, ORIGEM_CONFIG, type OrigemLacuna } from '@/utils/classificarOrigemLacuna';
import { Loader2, TrendingUp, BarChart3, TrendingDown, Minus } from 'lucide-react';
import { useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { EIXO_PARA_ARTIGOS, inferArtigosDocumentoNormativo, inferArtigosOrcamento, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { getSafeIndicadores, inferArtigosIndicador } from '@/utils/inferArtigosIndicador';
import { evaluateIndicadorDetailed } from '@/components/conclusoes/evaluateIndicador';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';
import { MethodologyPanel } from '@/components/shared/MethodologyPanel';

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
  // Evolution scores (same methodology as FarolEvolucaoPanel)
  scoreOrcamento: number;
  scoreNormativa: number;
  scoreIndicadores: number;
  scoreFarol: number;
  sinal: 'verde' | 'amarelo' | 'vermelho';
  // Details
  programasCount: number;
  acoesVinculadas: number;
  totalLiquidado: number;
  normativosCount: number;
  indicadoresFavoraveis: number;
  indicadoresDesfavoraveis: number;
  indicadoresNovos: number;
  indicadoresTotal: number;
};

/**
 * Evolução das Recomendações — mesma metodologia de Evolução dos Artigos.
 * Avalia se as evidências vinculadas a cada recomendação melhoraram no período 2018-2025.
 * Orçamento (35%): programas + R$ liquidado
 * Normativa (35%): instrumentos normativos vinculados
 * Indicadores (30%): tendência favorável na série histórica
 * Semáforo: ≥60% Evolução | 35-59% Estagnação | <35% Retrocesso
 */
export function EvolucaoRecomendacoesPanel() {
  const { data: recomendacoes, isLoading: loadingRecs } = useLacunasIdentificadas({});

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

      // Find linked evidence by article tags
      const artigoOrc = orcamento.filter((o: any) => {
        const oArts = ((o.artigos_convencao || []) as string[]).map(normalizeArticle).filter(Boolean);
        return artigos.some(a => oArts.includes(a));
      });
      // Also match by keyword in tema/descricao
      const temaTokens = `${rec.tema} ${rec.descricao_lacuna}`.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .split(/\s+/).filter(t => t.length >= 5);
      const orcByKeyword = orcamento.filter((o: any) => {
        const h = `${o.programa} ${o.orgao}`.toLowerCase();
        return temaTokens.some(t => h.includes(t));
      });
      const allOrc = Array.from(new Map([...artigoOrc, ...orcByKeyword].map((o: any) => [`${o.programa}-${o.orgao}-${o.ano}`, o])).values());

      const programasCount = new Set(allOrc.map((o: any) => o.programa)).size;
      const acoesVinculadas = allOrc.length;
      const totalLiquidado = allOrc.reduce((s: number, o: any) => s + (Number(o.liquidado) || 0), 0);

      // Normativos linked by article
      const artigoNorm = normativos.filter((d: any) => {
        const dArts = ((d.artigos_convencao || []) as string[]).map(normalizeArticle).filter(Boolean);
        return artigos.some(a => dArts.includes(a));
      });
      const normByKeyword = normativos.filter((d: any) => {
        const h = d.titulo.toLowerCase();
        return temaTokens.some(t => h.includes(t));
      });
      const allNorm = Array.from(new Map([...artigoNorm, ...normByKeyword].map((n: any) => [n.titulo, n])).values());
      const normativosCount = allNorm.length;

      // Indicadores linked by article
      const artigoInd = dedupedIndicadores.filter((ind: any) => {
        return artigos.some((a: ArtigoConvencao) => {
          if (ind.artigos_convencao?.includes(a)) return true;
          return inferArtigosIndicador(ind).includes(a);
        });
      });
      const indByKeyword = dedupedIndicadores.filter((ind: any) => {
        const h = `${ind.nome} ${ind.categoria}`.toLowerCase();
        return temaTokens.some(t => h.includes(t));
      });
      const allInd = Array.from(new Map([...artigoInd, ...indByKeyword].map((i: any) => [i.nome, i])).values());

      // Evaluate indicator trends (same as FarolEvolucaoPanel)
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

      // Scores — same formula as FarolEvolucaoPanel
      const scoreOrcamento = Math.min(100, programasCount > 0 ? 40 + Math.min(60, totalLiquidado / 1e8) : 0);
      const scoreNormativa = Math.min(100, normativosCount * 12);

      const scoreFarol = Math.round(
        scoreOrcamento * 0.35 +
        scoreNormativa * 0.35 +
        scoreIndicadores * 0.30
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

    const renderRows = (items: EvolucaoResult[]) => items.map(r => {
      const corSinal = r.sinal === 'verde' ? '#16a34a' : r.sinal === 'amarelo' ? '#ca8a04' : '#dc2626';
      const labelSinal = r.sinal === 'verde' ? 'Evolução' : r.sinal === 'amarelo' ? 'Estagnação' : 'Retrocesso';
      return `<tr>
        <td style="font-family:monospace;font-weight:bold">${r.paragrafo}</td>
        <td>${r.tema}</td>
        <td>${r.artigos.map(a => `<span style="display:inline-block;padding:1px 5px;border:1px solid #ccc;border-radius:3px;font-size:10px;margin:1px">Art.${a}</span>`).join(' ')}</td>
        <td style="color:${corSinal};font-weight:bold">${labelSinal} (${r.scoreFarol}%)</td>
        <td style="font-size:10px">${r.programasCount} prog. / ${r.acoesVinculadas} ações (R$ ${(r.totalLiquidado / 1e9).toFixed(2)} bi)</td>
        <td style="font-size:10px">${r.normativosCount} instrumento(s)</td>
        <td style="font-size:10px">${r.indicadoresFavoraveis}↑ ${r.indicadoresNovos}★ ${r.indicadoresDesfavoraveis}↓ (${r.indicadoresTotal} total)</td>
        <td style="font-size:10px">${eixoLabels[r.eixo_tematico] || r.eixo_tematico}</td>
      </tr>`;
    }).join('');

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Evolução das Recomendações — Tendência de Evidências 2018-2025</title>
<style>
body{font-family:Arial,sans-serif;max-width:1200px;margin:20px auto;color:#222;font-size:12px}
h1{font-size:18px;border-bottom:2px solid #1e40af;padding-bottom:8px}
h2{font-size:14px;margin-top:20px;color:#1e40af}
table{width:100%;border-collapse:collapse;margin:8px 0}
th,td{border:1px solid #ddd;padding:5px 7px;text-align:left;font-size:11px}
th{background:#f1f5f9;font-size:10px}
.methodology{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px;margin:12px 0}
.nota{font-size:10px;color:#666}
</style></head><body>
<h1>📈 Evolução das Recomendações — Tendência de Evidências (2018-2025)</h1>
<p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
<p><strong>Score Médio:</strong> ${mediaGeral}% | ${sinaisCount.verde} Evolução | ${sinaisCount.amarelo} Estagnação | ${sinaisCount.vermelho} Retrocesso</p>

<div class="methodology">
<h2>📐 Metodologia (idêntica à Evolução dos Artigos)</h2>
<p>Avalia se as evidências vinculadas a cada recomendação <strong>melhoraram</strong> no período 2018-2025.</p>
<table>
<tr><th>Dimensão</th><th>Peso</th><th>O que mede</th></tr>
<tr><td>Orçamento</td><td>35%</td><td>Programas com execução rastreável + R$ liquidado</td></tr>
<tr><td>Normativa</td><td>35%</td><td>Instrumentos legislativos vinculados</td></tr>
<tr><td>Indicadores</td><td>30%</td><td>Tendência na série histórica (somente variação positiva pontua)</td></tr>
</table>
<p class="nota"><strong>Semáforo:</strong> ≥60% Evolução (verde) | 35-59% Estagnação (amarelo) | &lt;35% Retrocesso (vermelho)</p>
<p class="nota"><strong>Diferença vs. Status (Relação Completa):</strong> O <em>Status</em> avalia se a recomendação foi cumprida (cobertura de dados). A <em>Evolução</em> avalia se os dados mostram melhora no período.</p>
</div>

<h2>Detalhamento por Recomendação</h2>
<table>
<tr><th>§</th><th>Tema</th><th>Artigos</th><th>Sinal</th><th>Orçamento</th><th>Normativos</th><th>Indicadores</th><th>Eixo</th></tr>
${renderRows([...grouped.cerd, ...grouped.rg, ...grouped.durban])}
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
                  <TableHead className="w-[130px]">Orçamento (35%)</TableHead>
                  <TableHead className="w-[100px]">Normativos (35%)</TableHead>
                  <TableHead className="w-[130px]">Indicadores (30%)</TableHead>
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
                    <TableCell className="text-[10px] text-muted-foreground">
                      {r.programasCount > 0 ? `${r.programasCount} prog. / R$ ${(r.totalLiquidado / 1e9).toFixed(2)}bi` : '—'}
                      <div className="text-[9px]">({r.scoreOrcamento}pts)</div>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">
                      {r.normativosCount > 0 ? `${r.normativosCount} instr.` : '—'}
                      <div className="text-[9px]">({r.scoreNormativa}pts)</div>
                    </TableCell>
                    <TableCell className="text-[10px] text-muted-foreground">
                      {r.indicadoresTotal > 0 ? `${r.indicadoresFavoraveis}↑ ${r.indicadoresNovos}★ ${r.indicadoresDesfavoraveis}↓` : '—'}
                      <div className="text-[9px]">({r.scoreIndicadores}pts)</div>
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
      <div className="bg-muted/30 rounded-lg border p-4">
        <div className="flex items-center justify-between mb-2">
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
        <p className="text-xs text-muted-foreground">
          Avalia se as evidências vinculadas a cada recomendação <strong>melhoraram</strong> no período, usando a mesma metodologia
          da Evolução dos Artigos: Orçamento (35%), Normativa (35%), Indicadores (30%).
        </p>
        <div className="flex items-center gap-4 mt-3">
          <div className="text-center">
            <span className={`text-2xl font-bold ${mediaGeral >= 60 ? 'text-success' : mediaGeral >= 35 ? 'text-warning' : 'text-destructive'}`}>{mediaGeral}%</span>
            <p className="text-[10px] text-muted-foreground">Score Médio</p>
          </div>
          <div className="flex flex-wrap gap-3 text-xs">
            <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-success" /> {sinaisCount.verde} Evolução (≥60%)</span>
            <span className="flex items-center gap-1"><Minus className="w-3 h-3 text-warning" /> {sinaisCount.amarelo} Estagnação (35-59%)</span>
            <span className="flex items-center gap-1"><TrendingDown className="w-3 h-3 text-destructive" /> {sinaisCount.vermelho} Retrocesso (&lt;35%)</span>
          </div>
        </div>
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
        <p className="text-[10px] text-muted-foreground mt-2 italic">
          <strong>Diferença vs. Status (Relação Completa):</strong> O Status avalia se a recomendação foi cumprida (cobertura). A Evolução avalia se os dados mostram melhora.
        </p>
      </div>
    </div>
  );
}

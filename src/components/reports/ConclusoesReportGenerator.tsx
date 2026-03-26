import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileDown, Download, Scale, Loader2 } from 'lucide-react';
import { useAnalyticalInsights } from '@/hooks/useAnalyticalInsights';
import { svgLineChart, svgBarChart } from '@/components/reports/cerdiv/chartUtils';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { getExportToolbarHTML, downloadAsDocx } from '@/utils/reportExportToolbar';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, inferArtigosOrcamento, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { useMirrorData } from '@/hooks/useMirrorData';

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
  dados_estatisticas: 'Dados e Estatísticas'
};

export function ConclusoesReportGenerator() {
  const {
    isLoading, fiosCondutores, conclusoesDinamicas, insightsCruzamento,
    sinteseExecutiva, stats, lacunas, respostas, orcStats, indicadores, orcDados,
  } = useAnalyticalInsights();
  const { segurancaPublica, feminicidioSerie, educacaoSerieHistorica, saudeSerieHistorica, indicadoresSocioeconomicos, povosTradicionais, dadosDemograficos } = useMirrorData();

  const { data: documentosNormativos } = useQuery({
    queryKey: ['documentos_normativos_report'],
    queryFn: async () => {
      const { data } = await supabase.from('documentos_normativos').select('*');
      return data || [];
    },
  });

  const seg2018 = segurancaPublica[0];
  const seg2024 = segurancaPublica[segurancaPublica.length - 1];
  const edu2018 = educacaoSerieHistorica[0];
  const edu2024 = educacaoSerieHistorica[educacaoSerieHistorica.length - 1];
  const eco2018 = indicadoresSocioeconomicos[0];
  const eco2024 = indicadoresSocioeconomicos[indicadoresSocioeconomicos.length - 1];
  const fem2018 = feminicidioSerie[0];
  const fem2024 = feminicidioSerie[feminicidioSerie.length - 1];
  const sau2018 = saudeSerieHistorica[0];
  const sau2024 = saudeSerieHistorica[saudeSerieHistorica.length - 1];

  const avancos = conclusoesDinamicas.filter(c => c.tipo === 'avanco');
  const retrocessos = conclusoesDinamicas.filter(c => c.tipo === 'retrocesso');
  const lacunasPersist = conclusoesDinamicas.filter(c => c.tipo === 'lacuna_persistente');

  const totalLacunas = stats?.total || 0;
  const cumpridas = stats?.porStatus?.cumprido || 0;
  const parciais = stats?.porStatus?.parcialmente_cumprido || 0;
  const naoCumpridas = stats?.porStatus?.nao_cumprido || 0;
  const retrocessosLac = stats?.porStatus?.retrocesso || 0;

  // Compute ICERD adherence per article (simplified)
  const computeIcerdData = () => {
    return ARTIGOS_CONVENCAO.map(art => {
      const artLacunas = (lacunas || []).filter((l: any) => {
        const artsFromEixo = EIXO_PARA_ARTIGOS[l.eixo_tematico] || [];
        const artsFromField = l.artigos_convencao || [];
        return [...artsFromEixo, ...artsFromField].includes(art.numero);
      });
      const cumpr = artLacunas.filter((l: any) => l.status_cumprimento === 'cumprido').length;
      const parc = artLacunas.filter((l: any) => l.status_cumprimento === 'parcialmente_cumprido').length;
      const nao = artLacunas.filter((l: any) => l.status_cumprimento === 'nao_cumprido').length;
      const retro = artLacunas.filter((l: any) => l.status_cumprimento === 'retrocesso').length;
      const total = artLacunas.length;
      const score = total > 0 ? Math.round(((cumpr * 1 + parc * 0.5) / total) * 100) : 50;
      return { ...art, total, cumpr, parc, nao, retro, score };
    });
  };

  const generateFullHTML = () => {
    const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const systemUrl = window.location.origin;
    const icerdData = computeIcerdData();

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório Integral de Conclusões — Sistema CERD IV</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 210mm; margin: 0 auto; padding: 20px; font-size: 11px; line-height: 1.6; color: #1a1a2e; }
  h1 { font-size: 22px; color: #0f3460; border-bottom: 3px solid #0f3460; padding-bottom: 8px; }
  h2 { font-size: 17px; color: #16213e; margin-top: 30px; border-left: 4px solid #0f3460; padding-left: 12px; page-break-after: avoid; }
  h3 { font-size: 13px; color: #0f3460; margin-top: 18px; }
  .header { text-align: center; margin-bottom: 28px; border: 2px solid #0f3460; padding: 20px; border-radius: 10px; background: linear-gradient(135deg, #f0f4ff, #e8eeff); }
  .header p { margin: 3px 0; color: #555; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
  .kpi-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin: 14px 0; }
  .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
  .kpi .value { font-size: 24px; font-weight: 700; }
  .kpi .label { font-size: 9px; color: #64748b; margin-top: 2px; }
  .kpi .sub { font-size: 9px; color: #94a3b8; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10px; }
  th { background: #0f3460; color: white; padding: 7px 10px; text-align: left; font-weight: 600; }
  td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 10px 0; page-break-inside: avoid; }
  .card-avanco { border-left: 4px solid #16a34a; }
  .card-retrocesso { border-left: 4px solid #dc2626; }
  .card-lacuna { border-left: 4px solid #f59e0b; }
  .card-paradoxo { border-left: 4px solid #7c3aed; }
  .card-correlacao { border-left: 4px solid #0ea5e9; }
  .card-alerta { border-left: 4px solid #dc2626; }
  .card-progresso { border-left: 4px solid #16a34a; }
  .card h4 { margin: 0 0 6px; font-size: 13px; color: #0f3460; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; margin-right: 4px; }
  .badge-success { background: #dcfce7; color: #166534; }
  .badge-destructive { background: #fef2f2; color: #991b1b; }
  .badge-warning { background: #fef3c7; color: #92400e; }
  .badge-info { background: #e0f2fe; color: #0369a1; }
  .badge-purple { background: #ede9fe; color: #5b21b6; }
  .highlight { background: #fffbeb; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; margin: 10px 0; font-size: 10px; }
  .piora-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 10px; }
  .avanco-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 10px; }
  .paradoxo-box { background: #fefce8; border: 1px solid #fde047; border-radius: 6px; padding: 10px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; margin: 12px 0; }
  .aderencia-bar { background: #e2e8f0; border-radius: 4px; height: 20px; position: relative; margin: 4px 0; }
  .aderencia-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding-right: 6px; font-size: 9px; font-weight: 700; color: white; }
  .evidence { font-size: 10px; color: #475569; padding: 2px 0; }
  .link { color: #2563eb; text-decoration: underline; font-size: 9px; }
  .source { font-size: 9px; color: #94a3b8; font-style: italic; }
  .toc { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .toc a { color: #2563eb; text-decoration: none; display: block; padding: 3px 0; font-size: 11px; }
  .toc a:hover { text-decoration: underline; }
  .stat-pos { color: #16a34a; font-weight: 600; }
  .stat-neg { color: #dc2626; font-weight: 600; }
  .chart-inline { margin: 10px 0; page-break-inside: avoid; }
  @media print { .no-print { display: none; } body { padding: 0; } .card { page-break-inside: avoid; } }
  @page { size: A4; margin: 2cm; @bottom-center { content: counter(page) " / " counter(pages); font-size: 9pt; color: #64748b; } }
  @page :first { @bottom-center { content: none; } }
</style></head><body>
${getExportToolbarHTML('Conclusoes-Integral-CERD-IV')}

<div class="header">
  <h1>📊 Relatório Integral de Conclusões Analíticas</h1>
  <p><strong>Sistema de Subsídios ao IV Relatório Periódico do Brasil ao CERD</strong></p>
  <p>Consolidação de todas as seções: Infográficos, Síntese, Fios Condutores, Cruzamentos, Lacunas, Avanços, Retrocessos e Aderência ICERD</p>
  <p>Gerado em: ${now}</p>
</div>

<!-- SUMÁRIO -->
<div class="toc">
  <h3 style="margin-top:0">📑 Sumário</h3>
  <a href="#sec1">1. Dados-Chave do Escopo (2018→2024)</a>
  <a href="#sec2">2. Síntese Executiva</a>
  <a href="#sec3">3. Infográficos Comparativos — Tabela Síntese</a>
  <a href="#sec4">4. Fios Condutores (${fiosCondutores.length})</a>
  <a href="#sec5">5. Cruzamentos Analíticos (${insightsCruzamento.length})</a>
  <a href="#sec6">6. Lacunas Persistentes (${lacunasPersist.length})</a>
  <a href="#sec7">7. Avanços Identificados (${avancos.length})</a>
  <a href="#sec8">8. Retrocessos Identificados (${retrocessos.length})</a>
  <a href="#sec9">9. Aderência ICERD — Artigos I a VII</a>
  <a href="#sec10">10. Veredito Consolidado</a>
</div>

<!-- 1. DADOS-CHAVE -->
<h2 id="sec1">1. Dados-Chave do Escopo (2018→2024)</h2>
<div class="kpi-6">
  <div class="kpi"><div class="value">${dadosDemograficos.percentualNegro}%</div><div class="label">Pop. negra</div><div class="sub">${(dadosDemograficos.populacaoNegra/1e6).toFixed(0)}M</div></div>
  <div class="kpi"><div class="value" style="color:#dc2626">${seg2024.percentualVitimasNegras}%</div><div class="label">Homicídio negro</div><div class="sub">2018: ${seg2018.percentualVitimasNegras}%</div></div>
  <div class="kpi"><div class="value" style="color:#dc2626">${fem2024.percentualNegras}%</div><div class="label">Feminicídio negro</div><div class="sub">2018: ${fem2018.percentualNegras}%</div></div>
  <div class="kpi"><div class="value" style="color:#16a34a">${edu2024.superiorNegroPercent}%</div><div class="label">Superior negro</div><div class="sub">2018: ${edu2018.superiorNegroPercent}%</div></div>
  <div class="kpi"><div class="value">R$ ${eco2024.rendaMediaNegra}</div><div class="label">Renda negra</div><div class="sub">+${((eco2024.rendaMediaNegra/eco2018.rendaMediaNegra-1)*100).toFixed(0)}% vs 2018</div></div>
  <div class="kpi"><div class="value" style="color:#f59e0b">${(eco2024.rendaMediaBranca/eco2024.rendaMediaNegra).toFixed(2)}x</div><div class="label">Razão renda</div><div class="sub">branco/negro</div></div>
</div>

<!-- 2. SÍNTESE EXECUTIVA -->
<h2 id="sec2">2. Síntese Executiva</h2>
<div class="grid-2">
  <div class="piora-box">
    <p style="font-size:11px;font-weight:700;color:#991b1b;margin-bottom:6px;">⚠️ PIORA RELATIVA (2018→2024)</p>
    <ul style="margin:0;padding-left:16px;font-size:10px;">
      <li>Homicídio negro: ${seg2018.percentualVitimasNegras}% → ${seg2024.percentualVitimasNegras}% (<span class="stat-neg">+${(seg2024.percentualVitimasNegras-seg2018.percentualVitimasNegras).toFixed(1)}pp</span>)</li>
      <li>Letalidade policial negra: ${seg2018.letalidadePolicial}% → ${seg2024.letalidadePolicial}% (<span class="stat-neg">+${(seg2024.letalidadePolicial-seg2018.letalidadePolicial).toFixed(1)}pp</span>)</li>
      <li>Feminicídio mulheres negras: ${fem2018.percentualNegras}% → ${fem2024.percentualNegras}% (<span class="stat-neg">+${(fem2024.percentualNegras-fem2018.percentualNegras).toFixed(1)}pp</span>)</li>
      <li>Risco homicídio negro: persistente em ${seg2024.razaoRisco}x maior</li>
      <li>Gap absoluto renda: R$ ${eco2018.rendaMediaBranca-eco2018.rendaMediaNegra} → R$ ${eco2024.rendaMediaBranca-eco2024.rendaMediaNegra} (<span class="stat-neg">ampliou</span>)</li>
    </ul>
  </div>
  <div class="avanco-box">
    <p style="font-size:11px;font-weight:700;color:#166534;margin-bottom:6px;">✓ AVANÇOS (2018→2024)</p>
    <ul style="margin:0;padding-left:16px;font-size:10px;">
      <li>Superior negro: ${edu2018.superiorNegroPercent}% → ${edu2024.superiorNegroPercent}% (<span class="stat-pos">+${(edu2024.superiorNegroPercent-edu2018.superiorNegroPercent).toFixed(1)}pp</span>)</li>
      <li>Analfabetismo negro: ${edu2018.analfabetismoNegro}% → ${edu2024.analfabetismoNegro}% (<span class="stat-pos">${(edu2024.analfabetismoNegro-edu2018.analfabetismoNegro).toFixed(1)}pp</span>)</li>
      <li>Desemprego negro: ${eco2018.desempregoNegro}% → ${eco2024.desempregoNegro}% (<span class="stat-pos">${(eco2024.desempregoNegro-eco2018.desempregoNegro).toFixed(1)}pp</span>)</li>
      <li>Renda média negra: R$ ${eco2018.rendaMediaNegra} → R$ ${eco2024.rendaMediaNegra} (<span class="stat-pos">+${((eco2024.rendaMediaNegra/eco2018.rendaMediaNegra-1)*100).toFixed(0)}%</span>)</li>
      <li>Censo 2022: primeira contagem quilombolas (${povosTradicionais.quilombolas.populacao.toLocaleString('pt-BR')})</li>
      <li>Recriação do MIR e Lei 14.532/2023</li>
    </ul>
  </div>
</div>

${sinteseExecutiva && sinteseExecutiva.eixosMaisProblematicos.length > 0 ? `
<div class="highlight">
  <p style="font-weight:700;margin-bottom:6px;">⚡ EIXOS MAIS CRÍTICOS (lacunas ONU não cumpridas)</p>
  <table><tr><th>Eixo</th><th>Lacunas</th><th>% Não Cumprido</th></tr>
  ${sinteseExecutiva.eixosMaisProblematicos.map(e => `<tr><td>${e.eixo}</td><td>${e.total}</td><td class="stat-neg">${Math.round(e.gravidade*100)}%</td></tr>`).join('')}
  </table>
</div>` : ''}

<!-- 3. TABELA SÍNTESE -->
<h2 id="sec3">3. Infográficos Comparativos — Tabela Síntese</h2>
<p class="source">Dados extraídos da Base Estatística: FBSP 2025, PNAD 2024, DataSUS, SIDRA/IBGE, Censo 2022. <a class="link" href="${systemUrl}/conclusoes">→ Ver gráficos interativos no sistema</a></p>
<table>
  <thead><tr><th>Indicador</th><th>2018</th><th>2024</th><th>Variação</th><th>Avaliação</th></tr></thead>
  <tbody>
    <tr><td>Vítimas negras homicídio (%)</td><td>${seg2018.percentualVitimasNegras}%</td><td>${seg2024.percentualVitimasNegras}%</td><td class="stat-neg">+${(seg2024.percentualVitimasNegras-seg2018.percentualVitimasNegras).toFixed(1)}pp</td><td><span class="badge badge-destructive">Retrocesso</span></td></tr>
    <tr><td>Letalidade policial negra (%)</td><td>${seg2018.letalidadePolicial}%</td><td>${seg2024.letalidadePolicial}%</td><td class="stat-neg">+${(seg2024.letalidadePolicial-seg2018.letalidadePolicial).toFixed(1)}pp</td><td><span class="badge badge-destructive">Retrocesso</span></td></tr>
    <tr><td>Feminicídio mulheres negras (%)</td><td>${fem2018.percentualNegras}%</td><td>${fem2024.percentualNegras}%</td><td class="stat-neg">+${(fem2024.percentualNegras-fem2018.percentualNegras).toFixed(1)}pp</td><td><span class="badge badge-destructive">Retrocesso</span></td></tr>
    <tr><td>Risco relativo homicídio negro (×)</td><td>${seg2018.razaoRisco}x</td><td>${seg2024.razaoRisco}x</td><td>${seg2024.razaoRisco > seg2018.razaoRisco ? '<span class="stat-neg">Piorou</span>' : seg2024.razaoRisco < seg2018.razaoRisco ? '<span class="stat-pos">Melhorou</span>' : 'Estável'}</td><td><span class="badge badge-warning">Persistente</span></td></tr>
    <tr><td>Superior completo negro (%)</td><td>${edu2018.superiorNegroPercent}%</td><td>${edu2024.superiorNegroPercent}%</td><td class="stat-pos">+${(edu2024.superiorNegroPercent-edu2018.superiorNegroPercent).toFixed(1)}pp</td><td><span class="badge badge-success">Avanço</span></td></tr>
    <tr><td>Analfabetismo negro (%)</td><td>${edu2018.analfabetismoNegro}%</td><td>${edu2024.analfabetismoNegro}%</td><td class="stat-pos">${(edu2024.analfabetismoNegro-edu2018.analfabetismoNegro).toFixed(1)}pp</td><td><span class="badge badge-success">Avanço</span></td></tr>
    <tr><td>Mortalidade materna negra (/100mil NV)</td><td>${sau2018.mortalidadeMaternaNegra}</td><td>${sau2024.mortalidadeMaternaNegra}</td><td class="stat-pos">${(sau2024.mortalidadeMaternaNegra-sau2018.mortalidadeMaternaNegra).toFixed(1)}</td><td><span class="badge badge-warning">Parcial</span></td></tr>
    <tr><td>Renda média negra (R$)</td><td>R$ ${eco2018.rendaMediaNegra}</td><td>R$ ${eco2024.rendaMediaNegra}</td><td class="stat-pos">+${((eco2024.rendaMediaNegra/eco2018.rendaMediaNegra-1)*100).toFixed(0)}%</td><td><span class="badge badge-success">Avanço</span></td></tr>
    <tr><td>Razão renda branca/negra</td><td>${(eco2018.rendaMediaBranca/eco2018.rendaMediaNegra).toFixed(2)}x</td><td>${(eco2024.rendaMediaBranca/eco2024.rendaMediaNegra).toFixed(2)}x</td><td>${(eco2024.rendaMediaBranca/eco2024.rendaMediaNegra) < (eco2018.rendaMediaBranca/eco2018.rendaMediaNegra) ? '<span class="stat-pos">Reduziu</span>' : '<span class="stat-neg">Ampliou</span>'}</td><td><span class="badge badge-warning">Persistente</span></td></tr>
    <tr><td>Desemprego negro (%)</td><td>${eco2018.desempregoNegro}%</td><td>${eco2024.desempregoNegro}%</td><td class="stat-pos">${(eco2024.desempregoNegro-eco2018.desempregoNegro).toFixed(1)}pp</td><td><span class="badge badge-success">Avanço</span></td></tr>
    <tr><td>Gap absoluto renda (R$)</td><td>R$ ${eco2018.rendaMediaBranca-eco2018.rendaMediaNegra}</td><td>R$ ${eco2024.rendaMediaBranca-eco2024.rendaMediaNegra}</td><td class="stat-neg">+R$ ${(eco2024.rendaMediaBranca-eco2024.rendaMediaNegra)-(eco2018.rendaMediaBranca-eco2018.rendaMediaNegra)}</td><td><span class="badge badge-destructive">Retrocesso</span></td></tr>
  </tbody>
</table>

<div class="grid-2">
  <div class="chart-inline">
    <h3 style="font-size:11px;color:#0f3460;">Segurança Pública — Série 2018→2024</h3>
    ${svgLineChart({
      label: segurancaPublica.map((d: any) => String(d.ano)).join(','),
      series: [
        { name: 'Vítimas Negras (%)', color: '#dc2626', values: segurancaPublica.map((d: any) => d.percentualVitimasNegras) },
        { name: 'Letalidade Policial (%)', color: '#7c3aed', values: segurancaPublica.map((d: any) => d.letalidadePolicial) },
      ]
    }, 450, 200)}
  </div>
  <div class="chart-inline">
    <h3 style="font-size:11px;color:#0f3460;">Educação — Série 2018→2024</h3>
    ${svgLineChart({
      label: educacaoSerieHistorica.map((d: any) => String(d.ano)).join(','),
      series: [
        { name: 'Analfab. Negro', color: '#dc2626', values: educacaoSerieHistorica.map((d: any) => d.analfabetismoNegro) },
        { name: 'Superior Negro', color: '#16a34a', values: educacaoSerieHistorica.map((d: any) => d.superiorNegroPercent) },
      ]
    }, 450, 200)}
  </div>
</div>
<div class="grid-2">
  <div class="chart-inline">
    <h3 style="font-size:11px;color:#0f3460;">Saúde Materna — Mortalidade por 100mil NV</h3>
    ${svgLineChart({
      label: saudeSerieHistorica.map((d: any) => String(d.ano)).join(','),
      series: [
        { name: 'Negra', color: '#dc2626', values: saudeSerieHistorica.map((d: any) => d.mortalidadeMaternaNegra) },
        { name: 'Branca', color: '#3b82f6', values: saudeSerieHistorica.map((d: any) => d.mortalidadeMaternaBranca) },
      ]
    }, 450, 200)}
  </div>
  <div class="chart-inline">
    <h3 style="font-size:11px;color:#0f3460;">Feminicídio — % Mulheres Negras</h3>
    ${svgLineChart({
      label: feminicidioSerie.map((d: any) => String(d.ano)).join(','),
      series: [
        { name: '% Negras', color: '#dc2626', values: feminicidioSerie.map((d: any) => d.percentualNegras) },
      ]
    }, 450, 200)}
  </div>
</div>

<!-- 4. FIOS CONDUTORES -->
<h2 id="sec4">4. Fios Condutores (${fiosCondutores.length})</h2>
<p style="font-size:10px;color:#64748b;margin-bottom:12px;">
  Argumentos transversais gerados pelo cruzamento: Base Estatística × ${totalLacunas} lacunas ONU × ${respostas?.length || 0} respostas CERD III × ${orcStats?.totalRegistros || 0} registros orçamentários.
  <a class="link" href="${systemUrl}/conclusoes">→ Ver no sistema</a>
</p>
${fiosCondutores.map(fio => {
  const cardClass = fio.tipo === 'avanco' ? 'card-avanco' : fio.tipo === 'retrocesso' || fio.tipo === 'lacuna_critica' ? 'card-retrocesso' : fio.tipo === 'paradoxo' ? 'card-paradoxo' : 'card-correlacao';
  const badgeClass = fio.tipo === 'avanco' ? 'badge-success' : fio.tipo === 'retrocesso' || fio.tipo === 'lacuna_critica' ? 'badge-destructive' : fio.tipo === 'paradoxo' ? 'badge-purple' : 'badge-info';
  return `
<div class="card ${cardClass}">
  <h4>${fio.titulo} <span class="badge ${badgeClass}">${fio.tipo.replace(/_/g, ' ')}</span> <span class="badge badge-info">${fio.relevancia}</span></h4>
  <p style="font-size:10px;margin:6px 0;">${fio.argumento}</p>
  ${fio.comparativo2018 ? `<div style="background:#eff6ff;padding:6px;border-radius:4px;font-size:10px;margin:6px 0;"><strong>📊 Comparativo 2018→2024:</strong> ${fio.comparativo2018}</div>` : ''}
  ${fio.evidencias.length > 0 ? `<div style="font-size:10px;margin:4px 0;">
    <strong>Evidências (${fio.evidencias.length}):</strong>
    <ul style="margin:4px 0;padding-left:16px;">${fio.evidencias.slice(0, 8).map(ev => `<li><strong>${ev.texto}</strong> <span class="source">(${ev.fonte})</span></li>`).join('')}</ul>
  </div>` : ''}
  <div style="margin-top:6px;">${(fio.artigosConvencao || []).map(a => `<span class="badge badge-purple">Art. ${a}</span>`).join('')} ${fio.eixos.map(e => `<span class="badge badge-info">${eixoLabels[e] || e}</span>`).join('')}</div>
</div>`;
}).join('')}

<!-- 5. CRUZAMENTOS -->
<h2 id="sec5">5. Cruzamentos Analíticos (${insightsCruzamento.length})</h2>
<p style="font-size:10px;color:#64748b;margin-bottom:12px;">
  Insights gerados pelo cruzamento: lacunas ONU × orçamento × indicadores FBSP/PNAD × respostas CERD III.
  <a class="link" href="${systemUrl}/conclusoes">→ Ver no sistema</a>
</p>
${insightsCruzamento.map(ins => {
  const cardClass = ins.tipo === 'alerta' ? 'card-alerta' : ins.tipo === 'progresso' ? 'card-progresso' : ins.tipo === 'contradição' ? 'card-lacuna' : 'card-correlacao';
  const badgeClass = ins.tipo === 'alerta' ? 'badge-destructive' : ins.tipo === 'progresso' ? 'badge-success' : ins.tipo === 'contradição' ? 'badge-warning' : 'badge-info';
  return `
<div class="card ${cardClass}">
  <h4>${ins.titulo} <span class="badge ${badgeClass}">${ins.tipo}</span></h4>
  <p style="font-size:10px;margin:6px 0;">${ins.descricao}</p>
  <ul style="font-size:10px;padding-left:16px;margin:4px 0;">${ins.dados.slice(0, 6).map(d => `<li>${d}</li>`).join('')}</ul>
</div>`;
}).join('')}

<!-- CONCLUSÃO-SÍNTESE -->
<div class="card" style="border:2px solid #0f3460;margin-top:16px;">
  <h4 style="color:#0f3460;">⚖️ Conclusão-Síntese: O Estado Brasileiro Avançou nas Políticas Raciais (2018–2025)?</h4>
  <div class="paradoxo-box" style="margin:8px 0;">
    <p style="font-size:11px;font-weight:700;color:#92400e;">Veredicto: Avanço normativo-institucional real, porém insuficiente para reverter desigualdades estruturais</p>
  </div>
  <div class="grid-3" style="margin-top:10px;">
    <div class="avanco-box">
      <p style="font-size:10px;font-weight:700;color:#166534;">✓ ONDE AVANÇOU</p>
      <ul style="font-size:9px;padding-left:14px;margin:4px 0;">
        <li>Marco legal antirracista</li>
        <li>Recriação do MIR</li>
        <li>Educação superior negra</li>
        <li>Execução orçamentária 2023-25</li>
        <li>Censo quilombola inédito</li>
      </ul>
    </div>
    <div class="piora-box">
      <p style="font-size:10px;font-weight:700;color:#991b1b;">✗ ONDE NÃO AVANÇOU</p>
      <ul style="font-size:9px;padding-left:14px;margin:4px 0;">
        <li>Violência letal racial</li>
        <li>Feminicídio negro</li>
        <li>Letalidade policial</li>
        <li>Gap absoluto de renda</li>
        <li>Demarcação territorial</li>
      </ul>
    </div>
    <div class="paradoxo-box">
      <p style="font-size:10px;font-weight:700;color:#92400e;">⚠ PARADOXO CENTRAL</p>
      <ul style="font-size:9px;padding-left:14px;margin:4px 0;">
        <li>Leis avançam, implementação não</li>
        <li>Orçamento cresce, resultados limitados</li>
        <li>Federal avança, municipal estagna</li>
        <li>Renda sobe, desigualdade persiste</li>
      </ul>
    </div>
  </div>
</div>

<!-- 6. LACUNAS PERSISTENTES -->
<h2 id="sec6">6. Lacunas Persistentes (${lacunasPersist.length})</h2>
${lacunasPersist.map(c => `
<div class="card card-lacuna">
  <h4>${c.titulo} <span class="badge badge-warning">${c.periodo}</span></h4>
  <p style="font-size:10px;margin:6px 0;">${c.argumento_central}</p>
  ${c.evidencias.length > 0 ? `<ul style="font-size:10px;padding-left:16px;margin:4px 0;">${c.evidencias.slice(0, 6).map(ev => `<li>${ev}</li>`).join('')}</ul>` : ''}
  <div style="margin-top:4px;">${(c.artigosConvencao || []).map(a => `<span class="badge badge-purple">Art. ${a}</span>`).join('')} ${c.eixos.map(e => `<span class="badge badge-info">${eixoLabels[e] || e}</span>`).join('')} ${c.relevancia_cerd_iv ? '<span class="badge badge-destructive">CERD IV</span>' : ''}</div>
</div>`).join('')}

<!-- 7. AVANÇOS -->
<h2 id="sec7">7. Avanços Identificados (${avancos.length})</h2>
${avancos.map(c => `
<div class="card card-avanco">
  <h4>${c.titulo} <span class="badge badge-success">${c.periodo}</span></h4>
  <p style="font-size:10px;margin:6px 0;">${c.argumento_central}</p>
  ${c.evidencias.length > 0 ? `<ul style="font-size:10px;padding-left:16px;margin:4px 0;">${c.evidencias.slice(0, 6).map(ev => `<li>${ev}</li>`).join('')}</ul>` : ''}
  <div style="margin-top:4px;">${(c.artigosConvencao || []).map(a => `<span class="badge badge-purple">Art. ${a}</span>`).join('')} ${c.eixos.map(e => `<span class="badge badge-info">${eixoLabels[e] || e}</span>`).join('')}</div>
</div>`).join('')}

<!-- 8. RETROCESSOS -->
<h2 id="sec8">8. Retrocessos Identificados (${retrocessos.length})</h2>
${retrocessos.map(c => `
<div class="card card-retrocesso">
  <h4>${c.titulo} <span class="badge badge-destructive">${c.periodo}</span></h4>
  <p style="font-size:10px;margin:6px 0;">${c.argumento_central}</p>
  ${c.evidencias.length > 0 ? `<ul style="font-size:10px;padding-left:16px;margin:4px 0;">${c.evidencias.slice(0, 6).map(ev => `<li>${ev}</li>`).join('')}</ul>` : ''}
  <div style="margin-top:4px;">${(c.artigosConvencao || []).map(a => `<span class="badge badge-purple">Art. ${a}</span>`).join('')} ${c.eixos.map(e => `<span class="badge badge-info">${eixoLabels[e] || e}</span>`).join('')}</div>
</div>`).join('')}

<!-- 9. ADERÊNCIA ICERD -->
<h2 id="sec9">9. Aderência ICERD — Artigos I a VII</h2>
<p style="font-size:10px;color:#64748b;margin-bottom:12px;">
  Avaliação sistêmica da conformidade do Brasil com cada artigo da Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial.
  <a class="link" href="${systemUrl}/conclusoes">→ Ver painel interativo no sistema</a>
</p>
<table>
  <thead><tr><th>Artigo</th><th>Título</th><th>Lacunas</th><th>Cumpr.</th><th>Parcial</th><th>Não Cumpr.</th><th>Retro.</th><th>Aderência</th></tr></thead>
  <tbody>
  ${icerdData.map(a => {
    const color = a.score >= 60 ? '#16a34a' : a.score >= 40 ? '#f59e0b' : '#dc2626';
    return `<tr>
      <td><strong>Art. ${a.numero}</strong></td>
      <td>${a.titulo}</td>
      <td>${a.total}</td>
      <td style="color:#16a34a">${a.cumpr}</td>
      <td style="color:#f59e0b">${a.parc}</td>
      <td style="color:#dc2626">${a.nao}</td>
      <td style="color:#7f1d1d">${a.retro}</td>
      <td><div class="aderencia-bar"><div class="aderencia-fill" style="width:${a.score}%;background:${color}">${a.score}%</div></div></td>
    </tr>`;
  }).join('')}
  </tbody>
</table>

${icerdData.map(a => `
<div class="card" style="border-left:4px solid ${a.cor};">
  <h4>Art. ${a.numero} — ${a.tituloCompleto}</h4>
  <p style="font-size:10px;color:#64748b;">${a.total} lacunas vinculadas | Aderência: <strong style="color:${a.score >= 60 ? '#16a34a' : a.score >= 40 ? '#f59e0b' : '#dc2626'}">${a.score}%</strong></p>
  <div class="aderencia-bar"><div class="aderencia-fill" style="width:${a.score}%;background:${a.score >= 60 ? '#16a34a' : a.score >= 40 ? '#f59e0b' : '#dc2626'}">${a.score}%</div></div>
</div>`).join('')}

<!-- 10. VEREDITO -->
<h2 id="sec10">10. Veredito Consolidado</h2>
<div class="card" style="border:2px solid #0f3460;background:#f8faff;">
  <h4 style="color:#0f3460;">Diagnóstico Final — IV Relatório Periódico</h4>
  <div class="kpi-grid">
    <div class="kpi"><div class="value">${totalLacunas}</div><div class="label">Lacunas ONU</div></div>
    <div class="kpi"><div class="value" style="color:#dc2626">${naoCumpridas + retrocessosLac}</div><div class="label">Não cumpridas + retrocessos</div></div>
    <div class="kpi"><div class="value">${fiosCondutores.length}</div><div class="label">Fios condutores</div></div>
    <div class="kpi"><div class="value">${conclusoesDinamicas.length}</div><div class="label">Conclusões analíticas</div></div>
  </div>
  <p style="font-size:10px;margin-top:10px;">
    Das ${totalLacunas} recomendações do Comitê CERD (CERD/C/BRA/CO/18-20), <strong>${cumpridas}</strong> foram cumpridas (${totalLacunas > 0 ? Math.round(cumpridas/totalLacunas*100) : 0}%), 
    <strong>${parciais}</strong> parcialmente cumpridas (${totalLacunas > 0 ? Math.round(parciais/totalLacunas*100) : 0}%), 
    <strong>${naoCumpridas}</strong> não cumpridas (${totalLacunas > 0 ? Math.round(naoCumpridas/totalLacunas*100) : 0}%) e 
    <strong>${retrocessosLac}</strong> apresentam retrocesso.
    O sistema identificou <strong>${avancos.length}</strong> avanço(s), <strong>${lacunasPersist.length}</strong> lacuna(s) persistente(s) e 
    <strong>${retrocessos.length}</strong> retrocesso(s) como conclusões analíticas.
  </p>
  <p style="font-size:10px;margin-top:8px;">
    A aderência média ICERD é de <strong>${icerdData.length > 0 ? Math.round(icerdData.reduce((s, a) => s + a.score, 0) / icerdData.length) : 0}%</strong> — 
    evidenciando que o Brasil avançou no plano normativo-institucional, porém os indicadores estruturais de violência racial, 
    desigualdade de renda e acesso a direitos fundamentais permanecem aquém das obrigações assumidas perante o tratado.
  </p>
</div>

<div class="source" style="margin-top:24px;padding-top:12px;border-top:2px solid #0f3460;">
  📋 Relatório Integral de Conclusões gerado pelo Sistema de Subsídios CERD IV — ${now}<br/>
  Fontes integradas: FBSP 2025, PNAD 2024, DataSUS, SIDRA/IBGE, Censo 2022, SIOP, MUNIC/ESTADIC 2024, ${totalLacunas} lacunas ONU, ${respostas?.length || 0} respostas CERD III, ${indicadores?.length || 0} indicadores BD<br/>
  🔗 Sistema: <a class="link" href="${systemUrl}">${systemUrl}</a>
</div>
</body></html>`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Carregando dados de Conclusões...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="mb-6 border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Scale className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Relatório Integral de Conclusões Analíticas</h3>
                <p className="text-sm text-muted-foreground">
                  Consolida TODAS as abas de Conclusões: Infográficos, Síntese, Fios Condutores, Cruzamentos, Lacunas, Avanços, Retrocessos e Aderência ICERD
                </p>
                <div className="flex gap-2 mt-2 flex-wrap">
                  <Badge variant="outline" className="text-xs">{fiosCondutores.length} fios condutores</Badge>
                  <Badge variant="outline" className="text-xs">{insightsCruzamento.length} cruzamentos</Badge>
                  <Badge variant="outline" className="text-xs">{lacunasPersist.length} lacunas</Badge>
                  <Badge variant="outline" className="text-xs">{avancos.length} avanços</Badge>
                  <Badge variant="outline" className="text-xs">{retrocessos.length} retrocessos</Badge>
                  <Badge variant="outline" className="text-xs">7 artigos ICERD</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" className="gap-1" onClick={() => {
                const html = generateFullHTML();
                const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                window.open(URL.createObjectURL(blob), '_blank');
              }}>
                <FileDown className="w-3 h-3" /> PDF/HTML
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                downloadAsDocx(generateFullHTML(), 'Conclusoes-Integral-CERD-IV');
              }}>
                <Download className="w-3 h-3" /> DOCX
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Fios Condutores</p>
            <p className="text-xl font-bold">{fiosCondutores.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Cruzamentos</p>
            <p className="text-xl font-bold">{insightsCruzamento.length}</p>
          </CardContent>
        </Card>
        <Card className="border-warning/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Lacunas</p>
            <p className="text-xl font-bold text-warning">{lacunasPersist.length}</p>
          </CardContent>
        </Card>
        <Card className="border-success/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Avanços</p>
            <p className="text-xl font-bold text-success">{avancos.length}</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Retrocessos</p>
            <p className="text-xl font-bold text-destructive">{retrocessos.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Aderência ICERD</p>
            <p className="text-xl font-bold">{computeIcerdData().length > 0 ? Math.round(computeIcerdData().reduce((s, a) => s + a.score, 0) / computeIcerdData().length) : 0}%</p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

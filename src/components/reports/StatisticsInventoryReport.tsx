import { buildRolEstatistico } from '@/utils/rolEstatisticoCanonico';
import { isLowerBetterNome } from '@/utils/indicadorPolaridade';
import { useState } from 'react';
import { tendenciaPadrao, tendenciaLabelFrom } from '@/utils/tendenciaPadronizada';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, Loader2, Database, BarChart3, Printer } from 'lucide-react';
import { useIndicadoresInterseccionais, useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { useJuventudeAuditados } from '@/hooks/useOdsRacialData';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { useEvidenceOverridesReadOnly } from '@/hooks/useEvidenceOverrides';
import { inferArtigosIndicador } from '@/utils/inferArtigosIndicador';
import { isEvidenceEligibleIndicator, isMethodologicalGapPlaceholder } from '@/utils/indicatorEvidenceGuards';
import { getExportToolbarHTML } from '@/utils/reportExportToolbar';
import { downloadAsDocx } from '@/utils/reportExportToolbar';
import { useRegisterExport } from '@/utils/exportRegistry';
import { useMirrorData } from '@/hooks/useMirrorData';
import { openHtmlPreview } from '@/utils/reportPreview';
import { svgLineChart, svgBarChart } from '@/components/reports/cerdiv/chartUtils';
import {
  radarVulnerabilidades,
  atlasViolencia2025,
  dadosDemograficos as hcDadosDemograficos,
  evolucaoComposicaoRacial as hcEvolucaoComposicaoRacial,
  indicadoresSocioeconomicos as hcIndicadoresSocioeconomicos,
  rendimentosCenso2022 as hcRendimentosCenso2022,
  segurancaPublica as hcSegurancaPublica,
  feminicidioSerie as hcFeminicidioSerie,
  educacaoSerieHistorica as hcEducacaoSerieHistorica,
  analfabetismoGeral2024 as hcAnalfabetismoGeral2024,
  saudeSerieHistorica as hcSaudeSerieHistorica,
  interseccionalidadeTrabalho as hcInterseccionalidadeTrabalho,
  jovensNegrosViolencia,
  razaoRendaRacial,
  interseccionalidadeTrabalhoFontes,
  violenciaInterseccional as hcViolenciaInterseccional,
  serieAntraTrans as hcSerieAntraTrans,
  lgbtqiaPorRaca as hcLgbtqiaPorRaca,
  deficienciaPorRaca as hcDeficienciaPorRaca,
  classePorRaca as hcClassePorRaca,
  evolucaoDesigualdade as hcEvolucaoDesigualdade,
  povosTradicionais as hcPovosTradicionais,
} from '@/components/estatisticas/StatisticsData';
import { TOTAL_DADOS_NOVOS, categoriasDadosNovos } from '@/components/estatisticas/DadosNovosTab';
import { TOTAL_DADOS_ESTATISTICAS } from '@/utils/countStatisticsIndicators';

import { prepareHtmlPreview } from '@/utils/reportPreview';
import { toast } from 'sonner';

// Safe number formatter — prevents null/undefined crashes
function safeNum(n: any): string {
  if (n == null) return '—';
  if (typeof n === 'number') return n.toLocaleString('pt-BR');
  return String(n);
}

// Cita somente o recorte auditado do indicador canônico, nunca o espelho ou um valor fixo.
function ensinoSuperiorNegroAuditado(indicadores: any[]): string {
  const ind = indicadores.find(i => i.codigo === 'IND-129' && isEvidenceEligibleIndicator(i));
  const series = ind?.dados?.series;
  if (!series || typeof series !== 'object') return '';
  const anos = Object.keys(series).filter(ano => /^\d{4}$/.test(ano)).sort();
  const ano = anos.reverse().find(ano => typeof series[ano]?.superiorNegroPercent === 'number' && Number.isFinite(series[ano].superiorNegroPercent));
  if (!ano) return '';
  const valor = series[ano].superiorNegroPercent as number;
  const fonte = String(ind.fonte || 'PNAD Contínua');
  return `Entre a população negra, o percentual com ensino superior completo é de <strong>${valor.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%</strong> em ${ano} (${fonte}; ${ind.codigo}, recorte “superiorNegroPercent”).`;
}

// ─── Helper: render any array of objects as HTML table ───
function arrayToHTMLTable(data: any[], title?: string): string {
  if (!data || data.length === 0) return '';
  const keys = Object.keys(data[0]).filter(k => k !== 'fonte' && k !== 'urlFonte' && k !== 'url');
  const formatVal = (v: any) => {
    if (v === null || v === undefined) return '—';
    if (typeof v === 'number') return v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    return String(v);
  };
  const formatKey = (k: string) => k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return `${title ? `<h3>${title}</h3>` : ''}
<table><thead><tr>${keys.map(k => `<th>${formatKey(k)}</th>`).join('')}</tr></thead>
<tbody>${data.map(row => `<tr>${keys.map(k => `<td>${formatVal(row[k])}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

// ─── Helper: render indicadores BD with interpretation ───
function indicadorToHTML(ind: any): string {
  const dados = ind.dados || {};
  const objectKeys = Object.keys(dados).filter(k => typeof dados[k] === 'object' && !['por_uf_2024','idade_media_vitima','unidade'].includes(k));
  if (objectKeys.length === 0) return '';

  const topKeysAreYears = objectKeys.every((k: string) => /^\d{4}$/.test(k));
  let groups: string[], years: string[], chartData: Record<string, any>[];

  if (topKeysAreYears) {
    years = objectKeys.sort();
    const metricsSet = new Set<string>();
    years.forEach(y => Object.keys(dados[y] || {}).forEach(m => metricsSet.add(m)));
    groups = Array.from(metricsSet);
    chartData = years.map(y => {
      const p: Record<string, any> = { ano: y };
      groups.forEach(m => { if (dados[y]?.[m] !== undefined) p[m] = dados[y][m]; });
      return p;
    });
  } else {
    const allYears = new Set<string>();
    objectKeys.forEach(g => Object.keys(dados[g] || {}).forEach(y => allYears.add(y)));
    years = Array.from(allYears).sort();
    groups = objectKeys;
    chartData = years.map(y => {
      const p: Record<string, any> = { ano: y };
      objectKeys.forEach(g => { if (dados[g]?.[y] !== undefined) p[g] = dados[g][y]; });
      return p;
    });
  }

  const formatGroup = (k: string) => k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  // Tendência sempre recalculada pelos dados do próprio indicador
  // (série histórica + polaridade) — nunca o rótulo gravado.
  const tendCalc = tendenciaPadrao(ind as any);
  const tendBadge = `<span class="badge ${tendCalc === 'melhorou' ? 'badge-green' : tendCalc === 'piorou' ? 'badge-red' : 'badge-amber'}">${tendenciaLabelFrom(tendCalc)}</span>`;
  // Código curto IND-NNN (canônico, gerado em useIndicadoresInterseccionais)
  // — facilita citação cruzada em relatórios e auditoria humana.
  const codigoBadge = ind.codigo
    ? `<span class="badge badge-blue" style="font-family:ui-monospace,Menlo,monospace;letter-spacing:.05em">${ind.codigo}</span> `
    : '';

  let html = `<div class="card"${ind.codigo ? ` id="ind-${ind.codigo}"` : ''}><h4>${codigoBadge}${ind.nome} ${tendBadge}</h4>
<p class="meta">${ind.subcategoria ? ind.subcategoria + ' • ' : ''}${ind.fonte}</p>
<table><thead><tr><th>Grupo</th>${years.map(y => `<th>${y}</th>`).join('')}<th>Var.</th></tr></thead><tbody>`;

  for (const g of groups) {
    const vals = chartData.filter(d => d[g] !== undefined).map(d => d[g] as number);
    let variation = '';
    if (vals.length >= 2 && vals[0] !== 0) {
      const pct = ((vals[vals.length - 1] - vals[0]) / vals[0] * 100).toFixed(1);
      variation = `${parseFloat(pct) > 0 ? '+' : ''}${pct}%`;
    }
    html += `<tr><td>${formatGroup(g)}</td>${years.map((_, yi) => {
      const v = chartData[yi]?.[g];
      return `<td>${v !== undefined && v !== null ? (typeof v === 'number' ? v.toLocaleString('pt-BR') : v) : '—'}</td>`;
    }).join('')}<td>${variation}</td></tr>`;
  }
  html += `</tbody></table>`;

  // Interpretation
  if (years.length >= 2) {
    const interps = groups.map(g => {
      const vals = chartData.filter(d => d[g] !== undefined).map(d => d[g] as number);
      if (vals.length < 2) return null;
      const first = vals[0], last = vals[vals.length - 1], diff = last - first;
      const pct = first !== 0 ? ((diff / first) * 100).toFixed(1) : null;
      const isSeg = isLowerBetterNome(ind.nome, ind.categoria);
      const dir = diff > 0 ? (isSeg ? 'piorou' : 'melhorou') : diff < 0 ? (isSeg ? 'melhorou' : 'piorou') : 'estável';
      return `${formatGroup(g)}: ${safeNum(first)} → ${safeNum(last)} (${pct ? `${parseFloat(pct) > 0 ? '+' : ''}${pct}%` : 'n/d'}, ${dir})`;
    }).filter(Boolean);
    if (interps.length > 0) {
      html += `<div class="interpretation">📊 <strong>Interpretação (${years[0]}→${years[years.length - 1]}):</strong> ${interps.join('. ')}.</div>`;
    }
  }

  html += `<p class="meta">Fonte: ${ind.fonte}${ind.url_fonte ? ` — <a href="${ind.url_fonte}">${ind.url_fonte}</a>` : ''}</p>`;
  if (ind.documento_origem?.length) {
    html += `<p class="meta">Documentos: ${ind.documento_origem.join(', ')}</p>`;
  }
  html += `</div>`;
  return html;
}

function generateFullStatisticsHTML(indicadoresBD: any[], juventudeNegraBD: any[], m: any) {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const systemBaseUrl = window.location.origin;
  // SSoT: destructure from mirror data
  const dadosDemograficos = m?.dadosDemograficos || hcDadosDemograficos;
  const evolucaoComposicaoRacial = m?.evolucaoComposicaoRacial || hcEvolucaoComposicaoRacial;
  const indicadoresSocioeconomicos = m?.indicadoresSocioeconomicos?.length ? m.indicadoresSocioeconomicos : hcIndicadoresSocioeconomicos;
  const rendimentosCenso2022 = m?.rendimentosCenso2022 || hcRendimentosCenso2022;
  const segurancaPublica = m?.segurancaPublica?.length ? m.segurancaPublica : hcSegurancaPublica;
  const feminicidioSerie = m?.feminicidioSerie?.length ? m.feminicidioSerie : hcFeminicidioSerie;
  const educacaoSerieHistorica = m?.educacaoSerieHistorica?.length ? m.educacaoSerieHistorica : hcEducacaoSerieHistorica;
  const analfabetismoGeral2024 = m?.analfabetismoGeral2024 || hcAnalfabetismoGeral2024;
  const saudeSerieHistorica = m?.saudeSerieHistorica?.length ? m.saudeSerieHistorica : hcSaudeSerieHistorica;
  const interseccionalidadeTrabalho = m?.interseccionalidadeTrabalho?.length ? m.interseccionalidadeTrabalho : hcInterseccionalidadeTrabalho;
  const violenciaInterseccional = m?.violenciaInterseccional?.length ? m.violenciaInterseccional : hcViolenciaInterseccional;
  const serieAntraTrans = m?.serieAntraTrans?.length ? m.serieAntraTrans : hcSerieAntraTrans;
  const lgbtqiaPorRaca = m?.lgbtqiaPorRaca?.length ? m.lgbtqiaPorRaca : hcLgbtqiaPorRaca;
  const deficienciaPorRaca = m?.deficienciaPorRaca?.length ? m.deficienciaPorRaca : hcDeficienciaPorRaca;
  const classePorRaca = m?.classePorRaca?.length ? m.classePorRaca : hcClassePorRaca;
  const evolucaoDesigualdade = m?.evolucaoDesigualdade?.length ? m.evolucaoDesigualdade : hcEvolucaoDesigualdade;
  const povosTradicionais = m?.povosTradicionais || hcPovosTradicionais;

  const rolFull = buildRolEstatistico(indicadoresBD || []);


  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório Completo — Base Estatística CERD IV</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 1100px; margin: 0 auto; padding: 20px; color: #1a1a2e; line-height: 1.5; font-size: 12px; }
  h1 { font-size: 20px; border-bottom: 3px solid #1e3a5f; padding-bottom: 8px; }
  h2 { font-size: 16px; color: #1e3a5f; margin-top: 30px; border-left: 4px solid #1e3a5f; padding-left: 10px; page-break-after: avoid; }
  h3 { font-size: 13px; margin-top: 16px; color: #0f3460; page-break-after: avoid; }
  h4 { font-size: 12px; margin: 8px 0 4px; }
  .meta { font-size: 11px; color: #64748b; }
  .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin: 14px 0; }
  .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
  .stat-card .value { font-size: 24px; font-weight: 800; color: #1e3a5f; }
  .stat-card .label { font-size: 10px; color: #666; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 11px; }
  th { background: #1e3a5f; color: white; padding: 5px 8px; text-align: left; font-weight: 600; font-size: 10px; }
  td { padding: 4px 8px; border-bottom: 1px solid #e8e8e8; }
  tr:nth-child(even) { background: #f8f9fc; }
  .badge { display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 9px; font-weight: 600; margin-right: 3px; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-amber { background: #fef3c7; color: #92400e; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-purple { background: #f3e8ff; color: #6b21a8; }
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; margin-bottom: 12px; page-break-inside: avoid; }
  .interpretation { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 6px 10px; margin: 6px 0; font-size: 10px; }
  .section-summary { background: #f0f4ff; border-left: 3px solid #1e3a5f; padding: 8px 12px; margin: 8px 0; font-size: 11px; }
  .footer { margin-top: 30px; padding-top: 12px; border-top: 2px solid #e8e8e8; font-size: 10px; color: #888; }
  @media print { .no-print { display: none !important; } body { padding: 10px; } }
  @page { margin: 1.5cm; size: A4; @bottom-center { content: counter(page) " / " counter(pages); font-size: 9pt; color: #64748b; } }
  @page :first { @bottom-center { content: none; } }
  .chart-inline { margin: 10px 0; page-break-inside: avoid; }
</style></head><body>
${getExportToolbarHTML('Relatorio-Completo-Base-Estatistica-CERD-IV')}

<h1>📊 Relatório Completo — Base Estatística</h1>
<p class="meta">IV Relatório Periódico do Brasil ao CERD (2018-2025) — Gerado em ${now}</p>

<div class="stats-grid">
  <div class="stat-card"><div class="value">${rolFull.registrosBrutos}</div><div class="label">INDICADORES (IND-NNN)</div></div>
  <div class="stat-card"><div class="value">${rolFull.total}</div><div class="label">EVIDÊNCIAS ESTATÍSTICAS (INVENTÁRIO CANÔNICO)</div></div>
  <div class="stat-card"><div class="value">${TOTAL_DADOS_NOVOS}</div><div class="label">DADOS NOVOS</div></div>
</div>


<!-- ═══════════════════════════════════════ -->
<h2>1. DADOS GERAIS — Demografia e Indicadores Socioeconômicos</h2>

<h3>1.1. Composição Racial do Brasil (Censo 2022)</h3>
${arrayToHTMLTable(dadosDemograficos.composicaoRacial, '')}

<h3>1.2. Evolução da Composição Racial — PNAD Contínua (2018-2024)</h3>
${arrayToHTMLTable(evolucaoComposicaoRacial, '')}

<h3>1.3. Indicadores Socioeconômicos por Raça/Cor</h3>
${arrayToHTMLTable(indicadoresSocioeconomicos, '')}
<div class="section-summary">Razão de renda negros/brancos: <strong>${razaoRendaRacial}</strong> — desigualdade estrutural persistente.</div>

<h3>1.4. Rendimentos Médios por Raça (Censo 2022)</h3>
${arrayToHTMLTable(rendimentosCenso2022.rendimentoPorRaca || [], '')}

<!-- ═══════════════════════════════════════ -->
<h2>2. SEGURANÇA PÚBLICA, SAÚDE e EDUCAÇÃO</h2>

<h3>2.1. Segurança Pública — Série Histórica (FBSP)</h3>
${arrayToHTMLTable(segurancaPublica, '')}
<div class="chart-inline">${svgLineChart({
  label: segurancaPublica.map((d: any) => String(d.ano)).join(','),
  series: [
    { name: 'Vítimas Negras (%)', color: '#dc2626', values: segurancaPublica.map((d: any) => d.percentualVitimasNegras) },
    { name: 'Letalidade Policial (%)', color: '#7c3aed', values: segurancaPublica.map((d: any) => d.letalidadePolicial) },
  ]
}, 700, 240)}</div>

<h3>2.2. Feminicídio — Série Histórica</h3>
${arrayToHTMLTable(feminicidioSerie, '')}
<div class="chart-inline">${svgLineChart({
  label: feminicidioSerie.map((d: any) => String(d.ano)).join(','),
  series: [
    { name: 'Total', color: '#0f3460', values: feminicidioSerie.map((d: any) => d.total) },
    { name: '% Negras', color: '#dc2626', values: feminicidioSerie.map((d: any) => d.percentualNegras) },
  ]
}, 700, 240)}</div>

<h3>2.3. Educação — Série Histórica</h3>
${arrayToHTMLTable(educacaoSerieHistorica, '')}
${ensinoSuperiorNegroAuditado(indicadoresBD) ? `<div class="section-summary">${ensinoSuperiorNegroAuditado(indicadoresBD)}</div>` : ''}
<div class="chart-inline">${svgLineChart({
  label: educacaoSerieHistorica.map((d: any) => String(d.ano)).join(','),
  series: [
    { name: 'Analfab. Negro (%)', color: '#dc2626', values: educacaoSerieHistorica.map((d: any) => d.analfabetismoNegro) },
    { name: 'Analfab. Branco (%)', color: '#3b82f6', values: educacaoSerieHistorica.map((d: any) => d.analfabetismoBranco) },
    { name: 'Superior Negro (%)', color: '#16a34a', values: educacaoSerieHistorica.map((d: any) => d.superiorNegroPercent) },
  ]
}, 700, 240)}</div>
<div class="section-summary">Analfabetismo geral 2024: <strong>${analfabetismoGeral2024.taxaGeral}%</strong> (${safeNum(analfabetismoGeral2024.totalAnalfabetos)} pessoas).</div>

<h3>2.4. Saúde — Série Histórica (DataSUS)</h3>
${arrayToHTMLTable(saudeSerieHistorica, '')}
<div class="chart-inline">${svgLineChart({
  label: saudeSerieHistorica.map((d: any) => String(d.ano)).join(','),
  series: [
    { name: 'Mort. Materna Negra', color: '#dc2626', values: saudeSerieHistorica.map((d: any) => d.mortalidadeMaternaNegra) },
    { name: 'Mort. Materna Branca', color: '#3b82f6', values: saudeSerieHistorica.map((d: any) => d.mortalidadeMaternaBranca) },
  ]
}, 700, 240)}</div>

<!-- ═══════════════════════════════════════ -->
<h2>3. INTERSECCIONALIDADES</h2>

<h3>3.1. Raça × Gênero — Trabalho (PNAD Contínua)</h3>
${arrayToHTMLTable(interseccionalidadeTrabalho, '')}

<h3>3.2. Violência Interseccional</h3>
${arrayToHTMLTable(violenciaInterseccional, '')}

<h3>3.3. Juventude Negra</h3>
${juventudeNegraBD.length > 0 ? `<table><thead><tr><th>Indicador</th><th>Negros</th><th>Não Negros</th><th>Fonte</th></tr></thead><tbody>${juventudeNegraBD.map((j: any) => `<tr><td>${j.indicador}</td><td style="font-weight:600;color:#991b1b;">${j.valor}</td><td>${j.referencia}</td><td><a href="${j.url}">${j.fonte}</a></td></tr>`).join('')}</tbody></table>` : '<p class="meta">⏳ Carregando dados do banco...</p>'}
<div class="section-summary">Jovens negros: <strong>${jovensNegrosViolencia.percentualObitosExternos}%</strong> dos óbitos por causas externas (Fiocruz 2025). Pop. carcerária: <strong>${jovensNegrosViolencia.populacaoCarcerariaPercentualNegra}%</strong> negra.</div>

<h3>3.4. LGBTQIA+ — Assassinatos Trans (ANTRA)</h3>
${arrayToHTMLTable(serieAntraTrans, '')}

<h3>3.5. LGBTQIA+ × Raça</h3>
${arrayToHTMLTable(lgbtqiaPorRaca, '')}

<h3>3.6. Deficiência × Raça</h3>
${arrayToHTMLTable(deficienciaPorRaca, '')}

<h3>3.7. Classe Social × Raça</h3>
${arrayToHTMLTable(classePorRaca, '')}

<!-- ═══════════════════════════════════════ -->
<h2>4. VULNERABILIDADES</h2>

<h3>4.1. Radar de Vulnerabilidades</h3>
${arrayToHTMLTable(radarVulnerabilidades, '')}

<h3>4.2. Evolução da Desigualdade</h3>
${arrayToHTMLTable(evolucaoDesigualdade, '')}
<div class="chart-inline">${svgLineChart({
  label: evolucaoDesigualdade.map((d: any) => String(d.ano)).join(','),
  series: [
    { name: 'Renda Negra (R$)', color: '#dc2626', values: evolucaoDesigualdade.map((d: any) => d.rendaMediaNegra || d.rendaNegra || 0) },
    { name: 'Renda Branca (R$)', color: '#3b82f6', values: evolucaoDesigualdade.map((d: any) => d.rendaMediaBranca || d.rendaBranca || 0) },
  ]
}, 700, 240)}</div>

<!-- ═══════════════════════════════════════ -->
<h2>5. INFRAESTRUTURA POR GRUPO ÉTNICO-RACIAL (Censo 2022)</h2>
<div class="section-summary">
  <strong>📍 Origem no sistema:</strong> <a href="${systemBaseUrl}/estatisticas">Base Estatística → Dados Gerais</a> | <a href="${systemBaseUrl}/grupos-focais">Grupos Focais</a>
</div>
<table>
  <tr><th>Indicador</th><th>Quilombolas</th><th>Pop. Negra</th><th>Indígenas</th><th>Média Nacional</th></tr>
  <tr><td>Água rede geral (%)</td><td>${povosTradicionais.quilombolas.acessoRedeAgua}%</td><td>${povosTradicionais.populacaoNegra.infraestrutura.aguaRedeGeral}%</td><td>${povosTradicionais.indigenas.infraestrutura.aguaRedeGeral}%</td><td>${povosTradicionais.populacaoNegra.mediaNacional.aguaRedeGeral}%</td></tr>
  <tr><td>Esgoto adequado (%)</td><td>${povosTradicionais.quilombolas.esgotamentoAdequado}%</td><td>${povosTradicionais.populacaoNegra.infraestrutura.esgotoAdequado}%</td><td>${povosTradicionais.indigenas.infraestrutura.esgotoAdequado}%</td><td>${povosTradicionais.populacaoNegra.mediaNacional.esgotoAdequado}%</td></tr>
  <tr><td>Coleta de lixo (%)</td><td>${povosTradicionais.quilombolas.coletaLixo}%</td><td>${povosTradicionais.populacaoNegra.infraestrutura.coletaLixo}%</td><td>${povosTradicionais.indigenas.infraestrutura.coletaLixo}%</td><td>${povosTradicionais.populacaoNegra.mediaNacional.coletaLixo}%</td></tr>
</table>
<p class="meta">Fontes: IBGE Censo 2022 — Panorama Quilombola (<a href="${povosTradicionais.populacaoNegra.infraestrutura.linkPanorama}">Panorama Censo</a>); Indígenas (<a href="${povosTradicionais.indigenas.infraestrutura.link}">Censo 2022 Indígenas</a>).</p>

<!-- ═══════════════════════════════════════ -->
<h2>6. GRUPOS FOCAIS — Diagnóstico por Grupo Étnico-Racial</h2>
<div class="section-summary">
  <strong>📍 Origem no sistema:</strong> <a href="${systemBaseUrl}/grupos-focais">Escopo → Base Estatística → Grupos Focais</a><br>
  Cada grupo focal possui diagnóstico com série temporal (2018-2024/2025), vinculação a parágrafos das Observações Finais do CERD e políticas públicas específicas.
</div>

<h3>6.1. Quilombolas — ${safeNum(povosTradicionais.quilombolas.populacao)} pessoas</h3>
<div class="section-summary">📍 <a href="${systemBaseUrl}/grupos-focais">Grupos Focais → Quilombolas</a> | Observações ONU: §47, §48, §49</div>
<div class="stats-grid">
  <div class="stat-card"><div class="value">${safeNum(povosTradicionais.quilombolas.populacao)}</div><div class="label">População (Censo 2022)</div></div>
  <div class="stat-card"><div class="value">${safeNum(povosTradicionais.quilombolas.municipiosComQuilombolas)}</div><div class="label">Municípios</div></div>
  <div class="stat-card"><div class="value">${safeNum(povosTradicionais.quilombolas.comunidadesCertificadas)}</div><div class="label">Certidões FCP</div></div>
  <div class="stat-card"><div class="value">${povosTradicionais.quilombolas.territoriosTitulados}</div><div class="label">Territórios Titulados</div></div>
</div>
<table>
  <tr><th>Indicador</th><th>Valor</th><th>Fonte</th></tr>
  <tr><td>Títulos expedidos (INCRA)</td><td>${povosTradicionais.quilombolas.titulosExpedidos}</td><td><a href="https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/andamentotitulacao.pdf">INCRA PDF</a></td></tr>
  <tr><td>Processos abertos (INCRA)</td><td>${safeNum(povosTradicionais.quilombolas.processosAbertosIncra)}</td><td><a href="https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas">INCRA Quilombolas</a></td></tr>
  <tr><td>Área titulada (ha)</td><td>${safeNum(povosTradicionais.quilombolas.areaHectaresTitulados)}</td><td><a href="https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/andamentotitulacao.pdf">INCRA PDF</a></td></tr>
  <tr><td>Em territórios reconhecidos</td><td>${safeNum(povosTradicionais.quilombolas.emTerritoriosReconhecidos)} (${povosTradicionais.quilombolas.percentualEmTerritorios}%)</td><td><a href="${povosTradicionais.quilombolas.urlFonte}">SIDRA 9578</a></td></tr>
  <tr><td>Água rede geral</td><td>${povosTradicionais.quilombolas.acessoRedeAgua}%</td><td>Censo 2022</td></tr>
  <tr><td>Esgoto adequado</td><td>${povosTradicionais.quilombolas.esgotamentoAdequado}%</td><td>Censo 2022</td></tr>
  <tr><td>Coleta de lixo</td><td>${povosTradicionais.quilombolas.coletaLixo}%</td><td>Censo 2022</td></tr>
</table>
<p class="meta">Fonte primária: <a href="${povosTradicionais.quilombolas.urlFonte}">SIDRA 9578</a> | <a href="https://www.gov.br/palmares/pt-br/departamentos/protecao-preservacao-e-articulacao/certificacao-quilombola">Palmares Certificação</a></p>

<h3>6.2. Indígenas — ${safeNum(povosTradicionais.indigenas.populacaoPessoasIndigenas)} pessoas</h3>
<div class="section-summary">📍 <a href="${systemBaseUrl}/grupos-focais">Grupos Focais → Indígenas</a> | Observações ONU: §50, §51, §52, §53</div>
<div class="stats-grid">
  <div class="stat-card"><div class="value">${safeNum(povosTradicionais.indigenas.populacaoPessoasIndigenas)}</div><div class="label">Pessoas Indígenas</div></div>
  <div class="stat-card"><div class="value">${safeNum(povosTradicionais.indigenas.populacaoCorRaca)}</div><div class="label">Cor/Raça Indígena</div></div>
  <div class="stat-card"><div class="value">${povosTradicionais.indigenas.etnias}</div><div class="label">Etnias</div></div>
  <div class="stat-card"><div class="value">${povosTradicionais.indigenas.linguas}</div><div class="label">Línguas Vivas</div></div>
</div>
<table>
  <tr><th>Indicador</th><th>Valor</th><th>Fonte</th></tr>
  <tr><td>Pop. Amazônia Legal</td><td>${safeNum(povosTradicionais.indigenas.populacaoAmazoniaLegal)} (~51%)</td><td><a href="${povosTradicionais.indigenas.urlFontePessoasIndigenas}">IBGE Brasil Indígena</a></td></tr>
  <tr><td>Pop. Urbana</td><td>${safeNum(povosTradicionais.indigenas.populacaoUrbana)}</td><td><a href="${povosTradicionais.indigenas.infraestrutura.link}">IBGE Censo 2022</a></td></tr>
  <tr><td>TIs Homologadas 2018-2022</td><td>${povosTradicionais.indigenas.terrasHomologadas2018_2022}</td><td>FUNAI</td></tr>
  <tr><td>TIs Homologadas 2023-2025</td><td>${povosTradicionais.indigenas.terrasHomologadas2023_2025}</td><td>FUNAI</td></tr>
  <tr><td>Mortalidade infantil</td><td>${povosTradicionais.indigenas.mortalidadeInfantil} p/1000 NV</td><td>DataSUS/SESAI</td></tr>
  <tr><td>Educação bilíngue</td><td>${povosTradicionais.indigenas.educacaoBilingue}%</td><td>INEP/Censo Educação</td></tr>
  <tr><td>Rendimento médio</td><td>R$ ${safeNum(povosTradicionais.indigenas.rendimentoMedio)}</td><td><a href="${povosTradicionais.indigenas.urlFonteCorRaca}">SIDRA 9605</a></td></tr>
</table>
<p class="meta">Fontes: <a href="${povosTradicionais.indigenas.urlFontePessoasIndigenas}">IBGE Brasil Indígena</a> | <a href="${povosTradicionais.indigenas.urlFonteCorRaca}">SIDRA 9605</a> | <a href="https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas">FUNAI Geoprocessamento</a></p>


<div class="footer">
  <p>📋 Relatório gerado pelo Sistema de Subsídios CERD IV — ${now}</p>
  <p>Todos os dados seguem a Regra de Ouro: apenas fontes oficiais auditáveis.</p>
</div>
</body></html>`;
}

function generateInventoryHTML(
  indicadoresBDRaw: any[],
  juventudeNegraBD: any[],
  m: any,
  recsByNomeLower: Map<string, string[]>,
) {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const systemBaseUrl = window.location.origin;

  // Helper: render badges com § de recomendações vinculadas a um indicador (busca case-insensitive)
  const recsBadges = (nome: string): string => {
    const recs = recsByNomeLower.get(String(nome || '').trim().toLowerCase()) || [];
    if (!recs.length) return '<span style="color:#94a3b8;font-size:10px;">—</span>';
    const head = recs.slice(0, 8).map(p => `<span class="badge badge-amber" style="font-family:ui-monospace,Menlo,monospace;">§${p}</span>`).join(' ');
    return recs.length > 8 ? `${head} <span style="font-size:10px;color:#64748b;">+${recs.length - 8}</span>` : head;
  };
  // Helper: badges de Artigos ICERD inferidos
  const artigosBadges = (ind: any): string => {
    const arts = inferArtigosIndicador(ind);
    if (!arts.length) return '<span style="color:#94a3b8;font-size:10px;">—</span>';
    return arts.map(a => `<span class="badge badge-purple">Art. ${a}</span>`).join(' ');
  };

  // Regra de Ouro: Common Core e indicadores descartados não podem constar
  // no inventário de evidências aptas.
  const indicadoresBD = (indicadoresBDRaw || []).filter(i => isEvidenceEligibleIndicator(i) && !isMethodologicalGapPlaceholder(i));

  const { dadosDemograficos, evolucaoComposicaoRacial, indicadoresSocioeconomicos,
    segurancaPublica, feminicidioSerie, educacaoSerieHistorica, saudeSerieHistorica,
    interseccionalidadeTrabalho, violenciaInterseccional, serieAntraTrans,
    lgbtqiaPorRaca, deficienciaPorRaca, classePorRaca, evolucaoDesigualdade } = m;

  // ── Consolidação das séries temporais em indicadores auditáveis ──
  // Regra: raça/cor, gênero, idade etc. entram em coluna própria de
  // DESAGREGAÇÕES. Não se cria uma linha para "Branca" e outra para "Negra",
  // pois o indicador é único e as categorias são recortes internos.
  type SubInd = {
    nome: string;
    serie: string;
    fonte: string;
    periodo: string;
    registros: number;
    metricKeys: string[];
    rows: any[];
    tab: string;
    anchor: string;
    desagregacoes: string[];
    lookupNomes: string[];
  };

  const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
  const hasMetric = (rows: any[], key: string) => rows?.some(r => r?.[key] !== undefined && r?.[key] !== null);
  const makeSerie = (
    nome: string,
    serie: string,
    fonte: string,
    periodo: string,
    rows: any[],
    tab: string,
    anchor: string,
    metricDefs: { key: string; desag: string[] }[],
    lookupExtra: string[] = [],
  ): SubInd | null => {
    const present = metricDefs.filter(mdef => hasMetric(rows, mdef.key));
    if (!rows?.length || !present.length) return null;
    return {
      nome,
      serie,
      fonte,
      periodo,
      registros: rows.length,
      metricKeys: present.map(mdef => mdef.key),
      rows,
      tab,
      anchor,
      desagregacoes: uniq(present.flatMap(mdef => mdef.desag)),
      lookupNomes: uniq([nome, serie, ...present.map(mdef => mdef.key), ...lookupExtra]),
    };
  };

  const pobrezaRows = classePorRaca.filter((r: any) => /^Pobreza\s+\d{4}/i.test(String(r.faixa || '')));
  const extremaPobrezaRows = classePorRaca.filter((r: any) => /^Extrema pobreza/i.test(String(r.faixa || '')));
  const violenciaPorTipo = violenciaInterseccional.map((row: any) => ({
    nome: row.tipo === 'Feminicídio' ? 'Feminicídio de mulheres' : `${row.tipo} contra mulheres`,
    serie: 'Violência Interseccional',
    fonte: row.fonte || 'FBSP / DataSUS',
    periodo: '2024',
    registros: 1,
    metricKeys: ['mulherNegra', 'mulherBranca'].filter(k => row[k] !== undefined && row[k] !== null),
    rows: [row],
    tab: 'raca-genero',
    anchor: 'serie-violencia-interseccional',
    desagregacoes: ['Mulher Negra', 'Mulher Branca'],
    lookupNomes: uniq([row.tipo, `${row.tipo} mulheres negras`, `${row.tipo} mulher negra`, 'violência contra mulheres por raça']),
  })).filter(s => s.metricKeys.length > 0) as SubInd[];

  const seriesExpandidas: SubInd[] = [
    makeSerie('Composição racial da população — Censo 2022', 'Dados Demográficos Censo', 'SIDRA/IBGE 9605', '2022', dadosDemograficos.composicaoRacial || [], 'dados-gerais', 'serie-composicao-racial-censo', [
      { key: 'raca', desag: ['Branca', 'Parda', 'Preta', 'Indígena', 'Amarela'] },
    ]),
    makeSerie('Composição racial da população — PNAD Contínua', 'Composição Racial PNAD', 'SIDRA/IBGE 6403', '2018-2025', evolucaoComposicaoRacial, 'dados-gerais', 'serie-composicao-racial', [
      { key: 'branca', desag: ['Branca'] }, { key: 'negra', desag: ['Negra'] },
    ]),
    makeSerie('Renda média mensal', 'Indicadores Socioeconômicos', 'SIDRA/IBGE 6405', '2018-2025', indicadoresSocioeconomicos, 'dados-gerais', 'serie-socioeconomicos', [
      { key: 'rendaMediaNegra', desag: ['Negra'] }, { key: 'rendaMediaBranca', desag: ['Branca'] }, { key: 'rendaPreta', desag: ['Preta'] }, { key: 'rendaParda', desag: ['Parda'] },
    ]),
    makeSerie('Taxa de desocupação', 'Indicadores Socioeconômicos', 'SIDRA/IBGE 6402', '2018-2025', indicadoresSocioeconomicos, 'dados-gerais', 'serie-socioeconomicos', [
      { key: 'desempregoNegro', desag: ['Negra'] }, { key: 'desempregoBranco', desag: ['Branca'] }, { key: 'desempregoPreta', desag: ['Preta'] }, { key: 'desempregoParda', desag: ['Parda'] },
    ], ['desemprego', 'desocupação']),
    makeSerie('Taxa de pobreza', 'Indicadores Socioeconômicos', 'SIS/IBGE', '2018-2024', indicadoresSocioeconomicos, 'dados-gerais', 'serie-socioeconomicos', [
      { key: 'pobreza_negra', desag: ['Negra'] }, { key: 'pobreza_branca', desag: ['Branca'] },
    ]),
    makeSerie('Taxa de homicídio', 'Segurança Pública', 'Atlas da Violência / FBSP', '2018-2024', segurancaPublica, 'seguranca-saude-educacao', 'serie-seguranca-publica', [
      { key: 'homicidioNegro', desag: ['Negros'] }, { key: 'homicidioBranco', desag: ['Não Negros'] },
    ]),
    makeSerie('Letalidade policial', 'Segurança Pública', 'FBSP', '2018-2024', segurancaPublica, 'seguranca-saude-educacao', 'serie-seguranca-publica', [
      { key: 'letalidadePolicial', desag: ['Negros entre vítimas'] },
    ]),
    makeSerie('Vítimas de homicídio', 'Segurança Pública', 'FBSP', '2018-2024', segurancaPublica, 'seguranca-saude-educacao', 'serie-seguranca-publica', [
      { key: 'percentualVitimasNegras', desag: ['Negros entre vítimas'] },
    ]),
    makeSerie('Risco relativo de homicídio', 'Segurança Pública', 'Atlas da Violência', '2018-2024', segurancaPublica, 'seguranca-saude-educacao', 'serie-seguranca-publica', [
      { key: 'razaoRisco', desag: ['Negros vs Não Negros'] },
    ]),
    makeSerie('Feminicídio', 'Feminicídio', 'FBSP', '2018-2024', feminicidioSerie, 'raca-genero', 'serie-violencia-interseccional', [
      { key: 'percentualNegras', desag: ['Mulheres Negras'] },
    ]),
    makeSerie('Ensino superior completo', 'Educação Histórica', 'INEP / PNAD', '2018-2024', educacaoSerieHistorica, 'seguranca-saude-educacao', 'serie-educacao', [
      { key: 'superiorNegroPercent', desag: ['Negros'] }, { key: 'superiorBrancoPercent', desag: ['Brancos'] },
    ]),
    makeSerie('Taxa de analfabetismo', 'Educação Histórica', 'PNAD Educação', '2018-2024', educacaoSerieHistorica, 'seguranca-saude-educacao', 'serie-educacao', [
      { key: 'analfabetismoNegro', desag: ['Negros'] }, { key: 'analfabetismoBranco', desag: ['Brancos'] },
    ]),
    makeSerie('Mortalidade materna', 'Saúde Histórica', 'DataSUS / SIM / SINASC', '2018-2024', saudeSerieHistorica, 'seguranca-saude-educacao', 'serie-saude', [
      { key: 'mortalidadeMaternaNegra', desag: ['Negra'] }, { key: 'mortalidadeMaternaBranca', desag: ['Branca'] }, { key: 'mortalidadeMaternaPretas', desag: ['Preta'] }, { key: 'mortalidadeMaternaPardas', desag: ['Parda'] },
    ]),
    makeSerie('Mortalidade infantil', 'Saúde Histórica', 'DataSUS / SIM / SINASC', '2018-2024', saudeSerieHistorica, 'seguranca-saude-educacao', 'serie-saude', [
      { key: 'mortalidadeInfantilNegra', desag: ['Negra'] }, { key: 'mortalidadeInfantilBranca', desag: ['Branca'] },
    ]),
    makeSerie('Renda do trabalho', 'Trabalho Interseccional', 'DIEESE / PNAD Contínua', '2024-2025', interseccionalidadeTrabalho, 'raca-genero', 'serie-trabalho-interseccional', [
      { key: 'renda', desag: ['Raça × Gênero'] },
    ]),
    makeSerie('Desocupação no trabalho', 'Trabalho Interseccional', 'DIEESE / PNAD Contínua', '2024-2025', interseccionalidadeTrabalho, 'raca-genero', 'serie-trabalho-interseccional', [
      { key: 'desemprego', desag: ['Raça × Gênero'] },
    ]),
    makeSerie('Informalidade no trabalho', 'Trabalho Interseccional', 'DIEESE / PNAD Contínua', '2024-2025', interseccionalidadeTrabalho, 'raca-genero', 'serie-trabalho-interseccional', [
      { key: 'informalidade', desag: ['Raça × Gênero'] },
    ]),
    makeSerie('Pessoas com deficiência', 'Deficiência × Raça', 'IBGE / Censo 2022', '2022', deficienciaPorRaca, 'deficiencia', 'serie-deficiencia', [
      { key: 'taxaDeficiencia', desag: ['Branca', 'Preta', 'Amarela', 'Parda', 'Indígena'] },
    ]),
    makeSerie('Empregabilidade de pessoas com deficiência', 'Deficiência × Raça', 'PNAD Contínua', '2022', deficienciaPorRaca, 'deficiencia', 'serie-deficiencia', [
      { key: 'empregabilidade', desag: ['Branca', 'Preta', 'Parda'] },
    ]),
    makeSerie('Renda média de pessoas com deficiência', 'Deficiência × Raça', 'PNAD Contínua', '2022', deficienciaPorRaca, 'deficiencia', 'serie-deficiencia', [
      { key: 'rendaMedia', desag: ['Branca', 'Preta', 'Parda'] },
    ]),
    makeSerie('Assassinatos de pessoas trans e travestis', 'LGBTQIA+ ANTRA', 'ANTRA', '2017-2025', serieAntraTrans, 'lgbtqia', 'serie-lgbtqia', [
      { key: 'negros', desag: ['Negros'] }, { key: 'brancos', desag: ['Brancos'] }, { key: 'indigenas', desag: ['Indígenas'] },
    ]),
    makeSerie('Vítimas LGBTQIA+ por raça/cor', 'LGBTQIA+ × Raça', 'ANTRA', '2025', lgbtqiaPorRaca, 'lgbtqia', 'serie-lgbtqia', [
      { key: 'negroLGBT', desag: ['Negra'] }, { key: 'brancoLGBT', desag: ['Branca'] }, { key: 'indigenaLGBT', desag: ['Indígena'] },
    ]),
    makeSerie('Pobreza por raça/cor', 'Classe × Raça', 'SIS/IBGE', '2018-2024', pobrezaRows, 'classe', 'serie-classe', [
      { key: 'branca', desag: ['Branca'] }, { key: 'parda', desag: ['Parda'] }, { key: 'preta', desag: ['Preta'] }, { key: 'pretosOuPardos', desag: ['Pretos ou Pardos'] },
    ]),
    makeSerie('Extrema pobreza por raça/cor', 'Classe × Raça', 'SIS/IBGE', '2022-2024', extremaPobrezaRows, 'classe', 'serie-classe', [
      { key: 'branca', desag: ['Branca'] }, { key: 'parda', desag: ['Parda'] }, { key: 'preta', desag: ['Preta'] }, { key: 'pretosOuPardos', desag: ['Pretos ou Pardos'] },
    ]),
    ...violenciaPorTipo,
    makeSerie('Razão de renda', 'Evolução Desigualdade', 'IBGE / PNAD', '2018-2024', evolucaoDesigualdade, 'vulnerabilidades', 'serie-evolucao-desigualdade', [
      { key: 'razaoRenda', desag: ['Brancos / Negros'] },
    ]),
    makeSerie('Razão de desocupação', 'Evolução Desigualdade', 'IBGE / PNAD', '2018-2024', evolucaoDesigualdade, 'vulnerabilidades', 'serie-evolucao-desigualdade', [
      { key: 'razaoDesemprego', desag: ['Negros / Brancos'] },
    ]),
    makeSerie('Razão de homicídio', 'Evolução Desigualdade', 'Atlas / FBSP', '2018-2024', evolucaoDesigualdade, 'vulnerabilidades', 'serie-evolucao-desigualdade', [
      { key: 'razaoHomicidio', desag: ['Negros / Não Negros'] },
    ]),
  ].filter(Boolean) as SubInd[];

  // Dados Novos individualmente
  const dadosNovosIndividuais = categoriasDadosNovos.flatMap((c: any) =>
    c.indicadores.map((ind: any) => ({
      id: ind.id,
      nome: ind.nome,
      categoria: c.nome,
      fonte: ind.fonte,
      sigla: ind.siglaFonte,
      url: ind.urlFonte,
      prioridade: ind.prioridade,
    }))
  );

  const rol = buildRolEstatistico(indicadoresBDRaw || []);
  const ponteRol = `<strong>🔗 Universo único:</strong> a Base Estatística tem <strong>${rol.registrosBrutos} indicadores</strong> (IND-NNN), que formam o <strong>inventário canônico de ${rol.total} evidências estatísticas</strong>: ${rol.totalGuardaChuvas} indicadores sem subdivisão + ${rol.totalSubindicadores} subindicadores (os ${rol.consolidados} registros-mãe com subindicadores são substituídos por seus recortes, evitando dupla contagem).`;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Inventário — Base Estatística CERD IV</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 1100px; margin: 0 auto; padding: 20px; color: #1a1a2e; line-height: 1.6; font-size: 13px; }
  h1 { color: #1a1a2e; border-bottom: 3px solid #e94560; padding-bottom: 10px; }
  h2 { color: #e94560; margin-top: 30px; border-left: 4px solid #e94560; padding-left: 12px; }
  h3 { color: #0f3460; margin-top: 20px; }
  .meta-box { background: #f0f4ff; border: 1px solid #d0d8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
  .stat-card { background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 14px; text-align: center; }
  .stat-card .value { font-size: 28px; font-weight: 800; color: #e94560; }
  .stat-card .label { font-size: 11px; color: #666; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 13px; }
  th { background: #1a1a2e; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
  td { padding: 6px 10px; border-bottom: 1px solid #e8e8e8; }
  tr:nth-child(even) { background: #f8f9fc; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 600; margin-right: 4px; }
  .badge-blue { background: #dbeafe; color: #1e40af; }
  .badge-red { background: #fee2e2; color: #991b1b; }
  .badge-green { background: #dcfce7; color: #166534; }
  .badge-purple { background: #f3e8ff; color: #6b21a8; }
  .badge-amber { background: #fef3c7; color: #92400e; }
  .section-summary { background: #fafafa; border-left: 3px solid #0f3460; padding: 10px 14px; margin: 10px 0; font-size: 13px; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 2px solid #e8e8e8; font-size: 11px; color: #888; }
  @media print { .no-print { display: none !important; } body { padding: 10px; } }
</style>
</head>
<body>
${getExportToolbarHTML('Inventario-Base-Estatistica-CERD-IV')}

<h1>📊 Inventário — Base Estatística CERD IV</h1>
<p style="color:#666;">Sistema de Subsídios para o IV Relatório CERD — Gerado em ${now}</p>

<div class="meta-box">
  <strong>Objetivo:</strong> Consolidar a dimensão total dos <em>indicadores aptos a serem utilizados como evidências</em>
  na Base Estatística do sistema (séries temporais, indicadores do banco de dados e dados novos auditáveis).
  Todos os dados seguem a <em>Regra de Ouro</em>: apenas fontes oficiais auditáveis e com recorte racial.
  <br><br>
  <strong>🔢 Reconciliação de contagens:</strong> O painel <em>"Espelho Seguro"</em> da página <em>Estatísticas e Indicadores</em>
  é apenas painel administrativo de curadoria e pode exibir um número maior de registros candidatos.
  Já este inventário lista apenas os <strong>indicadores aptos como evidência</strong>: exclui registros do tipo
  "espelho_estático" (que duplicariam séries já hardcoded) e consolida cada série em indicadores únicos,
  mantendo raça/cor, gênero, idade e PCD na coluna de desagregações. Total: <strong>${rol.registrosBrutos} indicadores</strong>, desagregados em ${rol.total} evidências.
  <br><br>
  ${ponteRol}

</div>

<div class="stats-grid">
  <div class="stat-card">
    <div class="value">${rol.registrosBrutos}</div>
    <div class="label">INDICADORES (IND-NNN) NA BASE ESTATÍSTICA</div>
  </div>
  <div class="stat-card">
    <div class="value">${rol.total}</div>
    <div class="label">EVIDÊNCIAS ESTATÍSTICAS (INVENTÁRIO CANÔNICO)</div>
  </div>
  <div class="stat-card">
    <div class="value">${rol.totalGuardaChuvas}</div>
    <div class="label">INDICADORES SEM SUBDIVISÃO</div>
  </div>
  <div class="stat-card">
    <div class="value">${rol.totalSubindicadores}</div>
    <div class="label">SUBINDICADORES (recortes de ${rol.consolidados} registros-mãe)</div>
  </div>
</div>

<div class="section-summary">
  <strong>Como o total é composto:</strong> a Base Estatística tem <strong>${rol.registrosBrutos} indicadores</strong> com código IND-NNN, que se desagregam no inventário canônico de <strong>${rol.total} evidências</strong>
  (${rol.totalGuardaChuvas} indicadores sem subdivisão + ${rol.totalSubindicadores} subindicadores).
  A seção 1 apresenta esses indicadores organizados pelas séries das abas; a seção 2 lista os ${indicadoresBDUnicos.length} indicadores complementares que não aparecem nas séries da seção 1, evitando repetição.
  Cada item abaixo é listado uma vez; as categorias internas aparecem como desagregações.
</div>

<h2>1. Indicadores de Séries Históricas — ${seriesExpandidas.length}</h2>
${ensinoSuperiorNegroAuditado(indicadoresBD) ? `<div class="section-summary">${ensinoSuperiorNegroAuditado(indicadoresBD)}</div>` : ''}
<p style="font-size:11px;color:#64748b;margin:4px 0 12px;">
  💡 Cada linha representa <strong>um indicador</strong>; as categorias internas (Branca, Negra, Preta, Parda, gênero, PCD etc.) aparecem na coluna <strong>Desagregações</strong>.
  O link <strong>↗ abrir no sistema</strong> leva à <em>aba específica</em> da <a href="${systemBaseUrl}/estatisticas">Base Estatística</a> onde o gráfico/tabela do indicador é renderizado (não há replicação de valores aqui — para auditar, abra no sistema).
  As colunas <strong>Artigos ICERD</strong> e <strong>Recomendações (§)</strong> mostram a vinculação derivada via SSoT (useDiagnosticSensor) e do classificador de artigos.
</p>
<table>
  <thead>
    <tr><th>#</th><th>Código</th><th>Indicador</th><th>Desagregações</th><th>Série</th><th>Fonte</th><th>Período</th><th>Pontos</th><th>Artigos ICERD</th><th>Recomendações (§)</th><th>Ver no sistema</th></tr>
  </thead>
  <tbody>
    ${seriesExpandidas.map((s, i) => {
      // Mapeia variações do nome para tentar achar evidências vinculadas via SSoT
      const recsAgg = new Set<string>();
      for (const n of s.lookupNomes) {
        const k = String(n || '').trim().toLowerCase();
        const r = recsByNomeLower.get(k);
        if (r) r.forEach(p => recsAgg.add(p));
      }
      const recsArr = Array.from(recsAgg);
      const recsCell = recsArr.length
        ? recsArr.slice(0, 8).map(p => `<span class="badge badge-amber" style="font-family:ui-monospace,Menlo,monospace;">§${p}</span>`).join(' ') + (recsArr.length > 8 ? ` <span style="font-size:10px;color:#64748b;">+${recsArr.length - 8}</span>` : '')
        : '<span style="color:#94a3b8;font-size:10px;">—</span>';
      const arts = artigosBadges({ nome: s.nome, categoria: s.serie, subcategoria: s.metricKeys.join(' ') });
      const linkSistema = `<a href="${systemBaseUrl}/estatisticas?tab=${encodeURIComponent(s.tab)}&serie=${encodeURIComponent(s.anchor)}#${encodeURIComponent(s.anchor)}" target="_blank" rel="noopener" style="font-size:10px;color:#1e40af;text-decoration:underline;font-weight:600;">↗ abrir no sistema</a>`;
      const desagCell = s.desagregacoes.length
        ? s.desagregacoes.map(d => `<span class="badge badge-blue" style="font-size:9px;">${d}</span>`).join(' ')
        : '<span style="color:#94a3b8;font-size:10px;">—</span>';
      const codigo = `S-${String(i + 1).padStart(3, '0')}`;
      return `<tr>
      <td>${i + 1}</td>
      <td><span class="badge" style="background:#fef3c7;color:#92400e;font-family:ui-monospace,Menlo,monospace;font-size:11px;font-weight:700;letter-spacing:.05em;">${codigo}</span></td>
      <td style="font-weight:500;">${s.nome}</td>
      <td>${desagCell}</td>
      <td style="font-size:11px;color:#64748b;">${s.serie}</td>
      <td style="font-size:11px;">${s.fonte}</td>
      <td>${s.periodo}</td>
      <td>${s.registros}</td>
      <td>${arts}</td>
      <td>${recsCell}</td>
      <td>${linkSistema}</td>
    </tr>`;
    }).join('')}
  </tbody>
</table>

<h2>2. Indicadores complementares (fora das séries da seção 1) — ${indicadoresBDUnicos.length}</h2>
<p style="font-size:11px;color:#64748b;margin:4px 0 12px;">
  💡 Clique no código <strong>IND-NNN</strong> para abrir o indicador na Base Estatística (rola até a posição exata).
  Indicadores tipo "espelho_estático" foram excluídos para não duplicar as séries temporais já listadas na seção 1.
  A coluna <strong>Recomendações</strong> mostra as §§ que vinculam este indicador como evidência (via SSoT do diagnóstico).
</p>
${Object.entries(bdCategorias).sort((a, b) => b[1].length - a[1].length).map(([cat, inds]) => `
<h3>${catLabels[cat] || cat} (${inds.length})</h3>
<table>
  <thead>
    <tr><th>Código</th><th>Indicador</th><th>Fonte</th><th>Artigos ICERD</th><th>Recomendações (§)</th><th>Desagregações</th></tr>
  </thead>
  <tbody>
    ${inds.map((ind: any) => {
      const desags = [];
      if (ind.desagregacao_raca) desags.push('Raça');
      if (ind.desagregacao_genero) desags.push('Gênero');
      if (ind.desagregacao_idade) desags.push('Idade');
      if (ind.desagregacao_territorio) desags.push('Território');
      if (ind.desagregacao_classe) desags.push('Classe');
      if (ind.desagregacao_deficiencia) desags.push('Deficiência');
      const artsDb = (ind.artigos_convencao || []).filter((a: string) => ['I','II','III','IV','V','VI','VII'].includes(a));
      const arts = artsDb.length
        ? artsDb.map((a: string) => `<span class="badge badge-purple">Art. ${a}</span>`).join(' ')
        : artigosBadges(ind);
      const codigo = ind.codigo || '';
      const codigoCell = codigo
        ? `<a href="${systemBaseUrl}/estatisticas?ind=${encodeURIComponent(codigo)}#ind-${encodeURIComponent(codigo)}" target="_blank" rel="noopener" style="display:inline-block;padding:3px 8px;background:#dbeafe;color:#1e40af;border-radius:4px;font-family:ui-monospace,Menlo,monospace;font-size:11px;font-weight:700;text-decoration:none;letter-spacing:.05em;">${codigo}</a>`
        : '<span style="color:#94a3b8;">—</span>';
      return `<tr id="ind-${codigo}">
        <td>${codigoCell}</td>
        <td>${ind.nome}</td>
        <td>${ind.fonte}</td>
        <td>${arts || '—'}</td>
        <td>${recsBadges(ind.nome)}</td>
        <td>${desags.map(d => `<span class="badge badge-blue">${d}</span>`).join('')}</td>
      </tr>`;
    }).join('')}
  </tbody>
</table>`).join('')}

<h2>3. Dados Novos — ${dadosNovosIndividuais.length}</h2>
<p style="font-size:11px;color:#64748b;margin:4px 0 12px;">
  Indicadores auditáveis listados na aba "Dados Novos" da Base Estatística, com link direto à fonte oficial.
  Vinculação a Artigos ICERD inferida pelo classificador; vinculação a recomendações via SSoT do diagnóstico.
</p>
<table>
  <thead>
    <tr><th>#</th><th>ID</th><th>Indicador</th><th>Categoria</th><th>Fonte</th><th>Artigos ICERD</th><th>Recomendações (§)</th><th>Prioridade</th></tr>
  </thead>
  <tbody>
    ${dadosNovosIndividuais.map((d: any, i: number) => {
      const arts = artigosBadges({ nome: d.nome, categoria: d.categoria, subcategoria: d.sigla });
      return `<tr>
      <td>${i + 1}</td>
      <td><span class="badge badge-green" style="font-family:ui-monospace,Menlo,monospace;">${d.id}</span></td>
      <td>${d.url ? `<a href="${d.url}" target="_blank" rel="noopener">${d.nome}</a>` : d.nome}</td>
      <td>${d.categoria}</td>
      <td>${d.sigla || d.fonte}</td>
      <td>${arts}</td>
      <td>${recsBadges(d.nome)}</td>
      <td><span class="badge badge-${d.prioridade === 'alta' ? 'red' : d.prioridade === 'media' ? 'amber' : 'blue'}">${d.prioridade}</span></td>
    </tr>`;
    }).join('')}
  </tbody>
</table>


<div class="footer">
  <p>📋 Inventário gerado pelo Sistema CERD IV — ${now}</p>
  <p>Base composta apenas por indicadores aptos como evidência (com recorte racial e fonte oficial auditável).</p>
</div>

</body>
</html>`;
}

export function StatisticsInventoryReport() {
  const { data: indicadoresBD } = useIndicadoresInterseccionais();
  const { data: juventudeNegraBD } = useJuventudeAuditados();
  const { data: recomendacoes } = useLacunasIdentificadas();
  const overrides = useEvidenceOverridesReadOnly();
  const { diagnosticMap } = useDiagnosticSensor(recomendacoes, overrides);
  const mirror = useMirrorData();
  const [generating, setGenerating] = useState<string | null>(null);

  // Constrói mapa: nome do indicador (lowercase) → lista de §recomendações vinculadas
  // Usa o SSoT do diagnóstico (mesma fonte do popup de evidências) para garantir
  // paridade exata com o sistema.
  const recsByNomeLower = (() => {
    const map = new Map<string, string[]>();
    if (!recomendacoes || !diagnosticMap) return map;
    for (const rec of recomendacoes) {
      const diag = diagnosticMap.get(rec.id);
      const par = String(rec.paragrafo || '').trim();
      if (!diag || !par) continue;
      for (const li of diag.linkedIndicadores || []) {
        const k = String(li.nome || '').trim().toLowerCase();
        if (!k) continue;
        const arr = map.get(k) || [];
        if (!arr.includes(par)) arr.push(par);
        map.set(k, arr);
      }
    }
    return map;
  })();

  const handleFullReport = async (format: 'html' | 'docx') => {
    setGenerating(`full-${format}`);
    const previewWindow = format === 'html'
      ? prepareHtmlPreview('Relatorio-Completo-Base-Estatistica-CERD-IV')
      : null;

    try {
      const html = generateFullStatisticsHTML(indicadoresBD || [], juventudeNegraBD || [], mirror);
      if (format === 'docx') {
        await downloadAsDocx(html, 'Relatorio-Completo-Base-Estatistica-CERD-IV');
      } else {
        openHtmlPreview(html, 'Relatorio-Completo-Base-Estatistica-CERD-IV', previewWindow);
      }
    } catch (error) {
      console.error('Erro ao exportar relatório completo da Base Estatística:', error);
      toast.error('Falha ao gerar o relatório de Base Estatística');
      previewWindow?.close();
    } finally {
      setGenerating(null);
    }
  };

  const handleInventory = async (format: 'html' | 'docx') => {
    setGenerating(`inv-${format}`);
    const previewWindow = format === 'html'
      ? prepareHtmlPreview('Inventario-Base-Estatistica-CERD-IV')
      : null;

    try {
      const html = generateInventoryHTML(indicadoresBD || [], juventudeNegraBD || [], mirror, recsByNomeLower);
      if (format === 'docx') {
        await downloadAsDocx(html, 'Inventario-Base-Estatistica-CERD-IV');
      } else {
        openHtmlPreview(html, 'Inventario-Base-Estatistica-CERD-IV', previewWindow);
      }
    } catch (error) {
      console.error('Erro ao exportar inventário da Base Estatística:', error);
      toast.error('Falha ao gerar o inventário da Base Estatística');
      previewWindow?.close();
    } finally {
      setGenerating(null);
    }
  };

  useRegisterExport('inv-est', 'Inventário de Estatísticas', 140, !!(indicadoresBD && juventudeNegraBD && recomendacoes), () => generateInventoryHTML(indicadoresBD || [], juventudeNegraBD || [], mirror, recsByNomeLower));

  // Aptos como evidência: BD sem Common Core + Dados Novos.
  const indicadoresBDSemCC = (indicadoresBD || []).filter(isEvidenceEligibleIndicator);
  const indicadoresBDUnicos = indicadoresBDSemCC.filter((i: any) => !(i.documento_origem || []).includes('espelho_estatico'));
  const rolCard = buildRolEstatistico(indicadoresBD || []);

  return (
    <Card className="border-l-4 border-l-chart-3">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Database className="w-5 h-5 text-chart-3" />
          Base Estatística — Relatórios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Gere o <strong>relatório completo</strong> com todos os dados de todas as abas 
          (séries, {indicadoresBDSemCC.length} indicadores, 
          interseccionalidades, vulnerabilidades) ou o inventário resumido.

        </p>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">{rolCard.total.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">Evidências estatísticas (inventário canônico)</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">{indicadoresBDSemCC.length}</p>
            <p className="text-xs text-muted-foreground">Indicadores (13 subabas)</p>
          </div>

        </div>

        {/* Full report */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-foreground">📊 Relatório Completo (todas as abas)</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="default" size="sm" className="gap-1.5" onClick={() => handleFullReport('html')} disabled={!!generating}>
              {generating === 'full-html' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
              PDF / HTML
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleFullReport('docx')} disabled={!!generating}>
              {generating === 'full-docx' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              DOCX
            </Button>
          </div>
        </div>

        {/* Inventory */}
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-foreground">📋 Inventário (listagem resumida)</p>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleInventory('html')} disabled={!!generating}>
              {generating === 'inv-html' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Printer className="w-3.5 h-3.5" />}
              PDF / HTML
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => handleInventory('docx')} disabled={!!generating}>
              {generating === 'inv-docx' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
              DOCX
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

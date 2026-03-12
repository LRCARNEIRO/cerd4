import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileDown, Loader2, Database, BarChart3, Printer } from 'lucide-react';
import { useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import { getExportToolbarHTML } from '@/utils/reportExportToolbar';
import { toast } from 'sonner';
import {
  dadosDemograficos,
  evolucaoComposicaoRacial,
  indicadoresSocioeconomicos,
  segurancaPublica,
  feminicidioSerie,
  educacaoSerieHistorica,
  saudeSerieHistorica,
  interseccionalidadeTrabalho,
  deficienciaPorRaca,
  serieAntraTrans,
  lgbtqiaPorRaca,
  classePorRaca,
  violenciaInterseccional,
  juventudeNegra,
  radarVulnerabilidades,
  evolucaoDesigualdade,
  atlasViolencia2025,
  rendimentosCenso2022,
  analfabetismoGeral2024,
  jovensNegrosViolencia,
  razaoRendaRacial,
  interseccionalidadeTrabalhoFontes,
  povosTradicionais,
} from '@/components/estatisticas/StatisticsData';
import {
  tabelasDemograficas,
  tabelasEconomicas,
  tabelasEducacao,
  tabelasSaude,
  tabelasTrabalho,
  tabelasPobreza,
  tabelasSeguranca,
  tabelasHabitacao,
  tabelasSistemaPolitico,
} from '@/components/estatisticas/CommonCoreTab';
import { TOTAL_DADOS_NOVOS } from '@/components/estatisticas/DadosNovosTab';
import { TOTAL_DADOS_ESTATISTICAS, TOTAL_TABELAS_COMMON_CORE, TOTAL_DADOS_COMMON_CORE } from '@/utils/countStatisticsIndicators';

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
  if (objectKeys.length === 0) return `<div class="card"><h4>${ind.nome}</h4><p class="meta">${ind.fonte} — Dados não disponíveis para tabulação</p></div>`;

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
  const tendBadge = ind.tendencia
    ? `<span class="badge ${ind.tendencia.includes('melhora') ? 'badge-green' : ind.tendencia.includes('piora') ? 'badge-red' : 'badge-amber'}">${ind.tendencia}</span>`
    : '';

  let html = `<div class="card"><h4>${ind.nome} ${tendBadge}</h4>
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
      return `<td>${v !== undefined ? (typeof v === 'number' ? v.toLocaleString('pt-BR') : v) : '—'}</td>`;
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
      const isSeg = ind.categoria === 'Segurança Pública' || ind.categoria === 'seguranca_publica';
      const dir = diff > 0 ? (isSeg ? 'piorou' : 'melhorou') : diff < 0 ? (isSeg ? 'melhorou' : 'piorou') : 'estável';
      return `${formatGroup(g)}: ${first.toLocaleString('pt-BR')} → ${last.toLocaleString('pt-BR')} (${pct ? `${parseFloat(pct) > 0 ? '+' : ''}${pct}%` : 'n/d'}, ${dir})`;
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

function generateFullStatisticsHTML(indicadoresBD: any[]) {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const systemBaseUrl = window.location.origin;

  const bdCategorias: Record<string, any[]> = {};
  indicadoresBD.forEach(i => {
    const cat = i.categoria || 'outros';
    if (!bdCategorias[cat]) bdCategorias[cat] = [];
    bdCategorias[cat].push(i);
  });

  const catLabels: Record<string, string> = {
    seguranca_publica: 'Segurança Pública', saude: 'Saúde', educacao: 'Educação',
    terra_territorio: 'Terras e Territórios', trabalho_renda: 'Trabalho e Renda',
    politicas_institucionais: 'Políticas Institucionais', legislacao_justica: 'Legislação e Justiça',
    participacao_social: 'Participação Social', dados_estatisticas: 'Dados e Estatísticas',
    cultura_patrimonio: 'Cultura e Patrimônio', habitacao: 'Habitação',
  };

  // Common Core categories
  const ccCategorias = [
    { nome: 'Demográficas', tabelas: tabelasDemograficas },
    { nome: 'Econômicas', tabelas: tabelasEconomicas },
    { nome: 'Educação', tabelas: tabelasEducacao },
    { nome: 'Saúde', tabelas: tabelasSaude },
    { nome: 'Trabalho', tabelas: tabelasTrabalho },
    { nome: 'Pobreza', tabelas: tabelasPobreza },
    { nome: 'Segurança', tabelas: tabelasSeguranca },
    { nome: 'Habitação', tabelas: tabelasHabitacao },
    { nome: 'Sistema Político', tabelas: tabelasSistemaPolitico },
  ];

  const totalGeral = TOTAL_DADOS_ESTATISTICAS + TOTAL_DADOS_COMMON_CORE + TOTAL_DADOS_NOVOS + indicadoresBD.length;

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
  @page { margin: 1.5cm; size: A4; }
</style></head><body>
${getExportToolbarHTML('Relatorio-Completo-Base-Estatistica-CERD-IV')}

<h1>📊 Relatório Completo — Base Estatística</h1>
<p class="meta">IV Relatório Periódico do Brasil ao CERD (2018-2025) — Gerado em ${now}</p>

<div class="stats-grid">
  <div class="stat-card"><div class="value">${totalGeral.toLocaleString('pt-BR')}</div><div class="label">TOTAL GERAL</div></div>
  <div class="stat-card"><div class="value">${TOTAL_TABELAS_COMMON_CORE}</div><div class="label">TABELAS COMMON CORE</div></div>
  <div class="stat-card"><div class="value">${indicadoresBD.length}</div><div class="label">INDICADORES BD</div></div>
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

<h3>2.2. Feminicídio — Série Histórica</h3>
${arrayToHTMLTable(feminicidioSerie, '')}

<h3>2.3. Educação — Série Histórica</h3>
${arrayToHTMLTable(educacaoSerieHistorica, '')}
<div class="section-summary">Analfabetismo geral 2024: <strong>${analfabetismoGeral2024.taxaGeral}%</strong> (${analfabetismoGeral2024.totalAnalfabetos?.toLocaleString('pt-BR')} pessoas).</div>

<h3>2.4. Saúde — Série Histórica (DataSUS)</h3>
${arrayToHTMLTable(saudeSerieHistorica, '')}

<!-- ═══════════════════════════════════════ -->
<h2>3. INTERSECCIONALIDADES</h2>

<h3>3.1. Raça × Gênero — Trabalho (PNAD Contínua)</h3>
${arrayToHTMLTable(interseccionalidadeTrabalho, '')}

<h3>3.2. Mulheres Chefes de Família</h3>
<div class="lacuna-box">⚠️ <strong>LACUNA:</strong> Dados removidos — SIDRA 6403 não publica série temporal de chefia monoparental por raça. Requer processamento de microdados PNAD.</div>

<h3>3.3. Violência Interseccional</h3>
${arrayToHTMLTable(violenciaInterseccional, '')}

<h3>3.4. Juventude Negra</h3>
${arrayToHTMLTable(juventudeNegra, '')}
<div class="section-summary">Jovens negros: <strong>${jovensNegrosViolencia.percentualObitosExternos}%</strong> dos óbitos por causas externas (Fiocruz 2025). Pop. carcerária: <strong>${jovensNegrosViolencia.populacaoCarcerariaPercentualNegra}%</strong> negra.</div>

<h3>3.5. Educação Interseccional</h3>
<div class="lacuna-box">⚠️ <strong>LACUNA:</strong> Dados removidos — IBGE/INEP não publica educação superior desagregada por raça × gênero. Dado real: negros com superior 11,4% (PNAD 2024).</div>

<h3>3.6. Saúde Interseccional</h3>
<div class="lacuna-box">⚠️ <strong>LACUNA:</strong> Dados numéricos removidos — DataSUS não cruza mortalidade materna por renda. Série DataSUS/SIM: razão negra/branca = ${(saudeSerieHistorica[saudeSerieHistorica.length - 1].mortalidadeMaternaNegra / saudeSerieHistorica[saudeSerieHistorica.length - 1].mortalidadeMaternaBranca).toFixed(1)}x em ${saudeSerieHistorica[saudeSerieHistorica.length - 1].ano}. Pesquisa Nascer no Brasil II (Nov/2023) reporta ~2x com metodologia própria.</div>

<h3>3.7. LGBTQIA+ — Assassinatos Trans (ANTRA)</h3>
${arrayToHTMLTable(serieAntraTrans, '')}

<h3>3.8. LGBTQIA+ × Raça</h3>
${arrayToHTMLTable(lgbtqiaPorRaca, '')}

<h3>3.9. Deficiência × Raça</h3>
${arrayToHTMLTable(deficienciaPorRaca, '')}

<h3>3.10. Classe Social × Raça</h3>
${arrayToHTMLTable(classePorRaca, '')}

<!-- ═══════════════════════════════════════ -->
<h2>4. VULNERABILIDADES</h2>

<h3>4.1. Radar de Vulnerabilidades</h3>
${arrayToHTMLTable(radarVulnerabilidades, '')}

<h3>4.2. Evolução da Desigualdade</h3>
${arrayToHTMLTable(evolucaoDesigualdade, '')}

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

<h3>6.1. Quilombolas — ${povosTradicionais.quilombolas.populacao.toLocaleString('pt-BR')} pessoas</h3>
<div class="section-summary">📍 <a href="${systemBaseUrl}/grupos-focais">Grupos Focais → Quilombolas</a> | Observações ONU: §47, §48, §49</div>
<div class="stats-grid">
  <div class="stat-card"><div class="value">${povosTradicionais.quilombolas.populacao.toLocaleString('pt-BR')}</div><div class="label">População (Censo 2022)</div></div>
  <div class="stat-card"><div class="value">${povosTradicionais.quilombolas.municipiosComQuilombolas.toLocaleString('pt-BR')}</div><div class="label">Municípios</div></div>
  <div class="stat-card"><div class="value">${povosTradicionais.quilombolas.comunidadesCertificadas.toLocaleString('pt-BR')}</div><div class="label">Certidões FCP</div></div>
  <div class="stat-card"><div class="value">${povosTradicionais.quilombolas.territoriosTitulados}</div><div class="label">Territórios Titulados</div></div>
</div>
<table>
  <tr><th>Indicador</th><th>Valor</th><th>Fonte</th></tr>
  <tr><td>Títulos expedidos (INCRA)</td><td>${povosTradicionais.quilombolas.titulosExpedidos}</td><td><a href="https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/andamentotitulacao.pdf">INCRA PDF</a></td></tr>
  <tr><td>Processos abertos (INCRA)</td><td>${povosTradicionais.quilombolas.processosAbertosIncra.toLocaleString('pt-BR')}</td><td><a href="https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas">INCRA Quilombolas</a></td></tr>
  <tr><td>Área titulada (ha)</td><td>${povosTradicionais.quilombolas.areaHectaresTitulados.toLocaleString('pt-BR')}</td><td><a href="https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/andamentotitulacao.pdf">INCRA PDF</a></td></tr>
  <tr><td>Em territórios reconhecidos</td><td>${povosTradicionais.quilombolas.emTerritoriosReconhecidos.toLocaleString('pt-BR')} (${povosTradicionais.quilombolas.percentualEmTerritorios}%)</td><td><a href="${povosTradicionais.quilombolas.urlFonte}">SIDRA 9578</a></td></tr>
  <tr><td>Água rede geral</td><td>${povosTradicionais.quilombolas.acessoRedeAgua}%</td><td>Censo 2022</td></tr>
  <tr><td>Esgoto adequado</td><td>${povosTradicionais.quilombolas.esgotamentoAdequado}%</td><td>Censo 2022</td></tr>
  <tr><td>Coleta de lixo</td><td>${povosTradicionais.quilombolas.coletaLixo}%</td><td>Censo 2022</td></tr>
</table>
<p class="meta">Fonte primária: <a href="${povosTradicionais.quilombolas.urlFonte}">SIDRA 9578</a> | <a href="https://www.gov.br/palmares/pt-br/departamentos/protecao-preservacao-e-articulacao/certificacao-quilombola">Palmares Certificação</a></p>

<h3>6.2. Indígenas — ${povosTradicionais.indigenas.populacaoPessoasIndigenas.toLocaleString('pt-BR')} pessoas</h3>
<div class="section-summary">📍 <a href="${systemBaseUrl}/grupos-focais">Grupos Focais → Indígenas</a> | Observações ONU: §50, §51, §52, §53</div>
<div class="stats-grid">
  <div class="stat-card"><div class="value">${povosTradicionais.indigenas.populacaoPessoasIndigenas.toLocaleString('pt-BR')}</div><div class="label">Pessoas Indígenas</div></div>
  <div class="stat-card"><div class="value">${povosTradicionais.indigenas.populacaoCorRaca.toLocaleString('pt-BR')}</div><div class="label">Cor/Raça Indígena</div></div>
  <div class="stat-card"><div class="value">${povosTradicionais.indigenas.etnias}</div><div class="label">Etnias</div></div>
  <div class="stat-card"><div class="value">${povosTradicionais.indigenas.linguas}</div><div class="label">Línguas Vivas</div></div>
</div>
<table>
  <tr><th>Indicador</th><th>Valor</th><th>Fonte</th></tr>
  <tr><td>Pop. Amazônia Legal</td><td>${povosTradicionais.indigenas.populacaoAmazoniaLegal.toLocaleString('pt-BR')} (~51%)</td><td><a href="${povosTradicionais.indigenas.urlFontePessoasIndigenas}">IBGE Brasil Indígena</a></td></tr>
  <tr><td>Pop. Urbana</td><td>${povosTradicionais.indigenas.populacaoUrbana.toLocaleString('pt-BR')}</td><td><a href="${povosTradicionais.indigenas.infraestrutura.link}">IBGE Censo 2022</a></td></tr>
  <tr><td>TIs Homologadas 2018-2022</td><td>${povosTradicionais.indigenas.terrasHomologadas2018_2022}</td><td>FUNAI</td></tr>
  <tr><td>TIs Homologadas 2023-2025</td><td>${povosTradicionais.indigenas.terrasHomologadas2023_2025}</td><td>FUNAI</td></tr>
  <tr><td>Mortalidade infantil</td><td>${povosTradicionais.indigenas.mortalidadeInfantil} p/1000 NV</td><td>DataSUS/SESAI</td></tr>
  <tr><td>Educação bilíngue</td><td>${povosTradicionais.indigenas.educacaoBilingue}%</td><td>INEP/Censo Educação</td></tr>
  <tr><td>Rendimento médio</td><td>R$ ${povosTradicionais.indigenas.rendimentoMedio.toLocaleString('pt-BR')}</td><td><a href="${povosTradicionais.indigenas.urlFonteCorRaca}">SIDRA 9605</a></td></tr>
</table>
<p class="meta">Fontes: <a href="${povosTradicionais.indigenas.urlFontePessoasIndigenas}">IBGE Brasil Indígena</a> | <a href="${povosTradicionais.indigenas.urlFonteCorRaca}">SIDRA 9605</a> | <a href="https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas">FUNAI Geoprocessamento</a></p>

<h3>6.3. Ciganos/Roma — Lacuna Crítica</h3>
<div class="section-summary">📍 <a href="${systemBaseUrl}/grupos-focais">Grupos Focais → Ciganos</a> | Observações ONU: §54, §55</div>
<div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:10px;margin:8px 0;">
  <p style="font-size:11px;color:#991b1b;font-weight:600;">⚠️ LACUNA CRÍTICA: Censo 2022 não incluiu pergunta específica para Ciganos/Roma</p>
  <p style="font-size:10px;color:#7f1d1d;">Estimativa não-oficial: ~${povosTradicionais.ciganos.populacaoEstimada.toLocaleString('pt-BR')} pessoas | ${povosTradicionais.ciganos.acampamentosIdentificados} acampamentos identificados</p>
  <p style="font-size:10px;color:#7f1d1d;">O CERD expressou preocupação específica (§54-55) sobre a ausência de dados oficiais. MUNIC 2024 registra apenas presença/ausência de acampamentos por município.</p>
</div>

<h3>6.4. Juventude Negra (15-29 anos)</h3>
<div class="section-summary">📍 <a href="${systemBaseUrl}/grupos-focais">Grupos Focais → Juventude Negra</a> | <a href="${systemBaseUrl}/estatisticas">Base Estatística → Interseccionalidades</a> | ONU: §32-§36</div>
<table>
  <tr><th>Indicador</th><th>Negros</th><th>Não Negros</th><th>Fonte</th></tr>
  ${juventudeNegra.map(j => '<tr>' +
    '<td>' + j.indicador + '</td>' +
    '<td style="font-weight:600;color:#991b1b;">' + j.valor + '</td>' +
    '<td>' + j.referencia + '</td>' +
    '<td><a href="' + j.url + '">' + j.fonte + '</a></td>' +
  '</tr>').join('')}
</table>
<div class="interpretation">📊 Jovens negros: ${jovensNegrosViolencia.percentualObitosExternos}% dos óbitos por causas externas (${jovensNegrosViolencia.fonte}). Pop. carcerária: ${jovensNegrosViolencia.populacaoCarcerariaPercentualNegra}% negra (${jovensNegrosViolencia.fonteCarce}).</div>

<h3>6.5. Mulheres Negras — Violência e Saúde</h3>
<div class="section-summary">📍 <a href="${systemBaseUrl}/estatisticas">Base Estatística → Interseccionalidades</a> | <a href="${systemBaseUrl}/grupos-focais">Grupos Focais → Mulheres Negras</a> | ONU: §15, §17, §23, §28</div>
<h4>Violência contra Mulheres Negras</h4>
${arrayToHTMLTable(violenciaInterseccional, '')}
<h4>Saúde Interseccional (Raça × Classe)</h4>
<div class="lacuna-box">⚠️ <strong>LACUNA:</strong> Dados numéricos removidos — DataSUS não publica mortalidade materna por faixa de renda. Dado verificado: mortalidade materna negra ${saudeSerieHistorica[saudeSerieHistorica.length - 1].mortalidadeMaternaNegra} vs branca ${saudeSerieHistorica[saudeSerieHistorica.length - 1].mortalidadeMaternaBranca} por 100 mil NV (${saudeSerieHistorica[saudeSerieHistorica.length - 1].ano}), razão ${(saudeSerieHistorica[saudeSerieHistorica.length - 1].mortalidadeMaternaNegra / saudeSerieHistorica[saudeSerieHistorica.length - 1].mortalidadeMaternaBranca).toFixed(1)}x (DataSUS/SIM).</div>
<h4>Mulheres Chefes de Família — Série Histórica</h4>
<div class="lacuna-box">⚠️ <strong>LACUNA:</strong> Dados removidos — SIDRA 6403 não publica série temporal de chefia monoparental por raça.</div>

<h3>6.6. População Negra — Infraestrutura Domiciliar</h3>
<div class="section-summary">📍 <a href="${systemBaseUrl}/grupos-focais">Grupos Focais → População Negra</a> | <a href="${systemBaseUrl}/estatisticas">Base Estatística → Dados Gerais</a></div>
<table>
  <tr><th>Indicador</th><th>Pop. Negra</th><th>Pop. Branca</th><th>Média Nacional</th></tr>
  <tr><td>Água rede geral</td><td>${povosTradicionais.populacaoNegra.infraestrutura.aguaRedeGeral}%</td><td>${povosTradicionais.populacaoNegra.infraestruturaBrancos.aguaRedeGeral}%</td><td>${povosTradicionais.populacaoNegra.mediaNacional.aguaRedeGeral}%</td></tr>
  <tr><td>Esgoto adequado</td><td>${povosTradicionais.populacaoNegra.infraestrutura.esgotoAdequado}%</td><td>${povosTradicionais.populacaoNegra.infraestruturaBrancos.esgotoAdequado}%</td><td>${povosTradicionais.populacaoNegra.mediaNacional.esgotoAdequado}%</td></tr>
  <tr><td>Coleta de lixo</td><td>${povosTradicionais.populacaoNegra.infraestrutura.coletaLixo}%</td><td>${povosTradicionais.populacaoNegra.infraestruturaBrancos.coletaLixo}%</td><td>${povosTradicionais.populacaoNegra.mediaNacional.coletaLixo}%</td></tr>
  <tr><td>Sem banheiro</td><td>${povosTradicionais.populacaoNegra.infraestrutura.semBanheiro}%</td><td>${povosTradicionais.populacaoNegra.infraestruturaBrancos.semBanheiro}%</td><td>${povosTradicionais.populacaoNegra.mediaNacional.semBanheiro}%</td></tr>
</table>
<p class="meta">Fonte: <a href="${povosTradicionais.populacaoNegra.infraestrutura.link}">IBGE Censo 2022 — Características dos domicílios (Fev/2024)</a> | <a href="${povosTradicionais.populacaoNegra.infraestrutura.linkPanorama}">Panorama Censo 2022</a></p>
<div class="interpretation">📊 ${povosTradicionais.populacaoNegra.infraestrutura.nota}</div>

<!-- ═══════════════════════════════════════ -->
<h2>7. ABAS ESPECIAIS</h2>

<h3>7.1. COVID-19 e Desigualdade Racial</h3>
<div class="section-summary">📍 <a href="${systemBaseUrl}/estatisticas">Base Estatística → COVID-19</a> | Dados de mortalidade COVID-19 por raça/cor (DataSUS/SIVEP-Gripe 2020-2023).</div>

<h3>7.2. Administração Pública (MUNIC/ESTADIC)</h3>
<div class="section-summary">📍 <a href="${systemBaseUrl}/estatisticas">Base Estatística → Adm. Pública</a> | Dados MUNIC/IBGE sobre órgãos municipais de igualdade racial e adesão ao SINAPIR.</div>

<!-- ═══════════════════════════════════════ -->
<h2>8. COMMON CORE — ${TOTAL_TABELAS_COMMON_CORE} Tabelas (HRI/CORE/BRA)</h2>

${ccCategorias.map(cat => `
<h3>${cat.nome} (${cat.tabelas.length} tabelas)</h3>
${cat.tabelas.map(t => `
<div class="card">
<h4>${t.numero}. ${t.titulo}</h4>
<p class="meta">${t.fonte} | ${t.periodoAtualizado} | <span class="badge ${t.statusAtualizacao === 'atualizado' ? 'badge-green' : t.statusAtualizacao === 'parcial' ? 'badge-amber' : 'badge-red'}">${t.statusAtualizacao}</span></p>
<table><thead><tr>${t.dados.headers.map((h: string) => `<th>${h}</th>`).join('')}</tr></thead>
<tbody>${t.dados.rows.map((row: string[]) => `<tr>${row.map((c: string) => `<td>${c}</td>`).join('')}</tr>`).join('')}</tbody></table>
</div>`).join('')}`).join('')}

<!-- ═══════════════════════════════════════ -->
<h2>9. INDICADORES DO BANCO DE DADOS — ${indicadoresBD.length} registros</h2>

${Object.entries(bdCategorias).sort((a, b) => b[1].length - a[1].length).map(([cat, inds]) => `
<h3>${catLabels[cat] || cat} (${inds.length})</h3>
${inds.map((ind: any) => indicadorToHTML(ind)).join('')}
`).join('')}

<!-- ═══════════════════════════════════════ -->
<h2>Resumo Executivo</h2>
<div class="stats-grid">
  <div class="stat-card"><div class="value">${totalGeral.toLocaleString('pt-BR')}</div><div class="label">TOTAL GERAL</div></div>
  <div class="stat-card"><div class="value">${TOTAL_TABELAS_COMMON_CORE}</div><div class="label">Tabelas CC</div></div>
  <div class="stat-card"><div class="value">${indicadoresBD.length}</div><div class="label">Indicadores BD</div></div>
  <div class="stat-card"><div class="value">${Object.keys(bdCategorias).length}</div><div class="label">Categorias</div></div>
</div>

<div class="footer">
  <p>📋 Relatório gerado pelo Sistema de Subsídios CERD IV — ${now}</p>
  <p>Todos os dados seguem a Regra de Ouro: apenas fontes oficiais auditáveis.</p>
</div>
</body></html>`;
}

function generateInventoryHTML(indicadoresBD: any[]) {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Series data
  const series = [
    { nome: 'Composição Racial (PNAD)', registros: evolucaoComposicaoRacial.length, fonte: 'SIDRA/IBGE Tab. 6403', periodo: '2018-2024' },
    { nome: 'Dados Demográficos (Censo 2022)', registros: dadosDemograficos.composicaoRacial.length, fonte: 'SIDRA/IBGE Tab. 9605', periodo: '2022' },
    { nome: 'Indicadores Socioeconômicos', registros: indicadoresSocioeconomicos.length, fonte: 'PNAD Contínua', periodo: '2018-2024' },
    { nome: 'Segurança Pública', registros: segurancaPublica.length, fonte: 'FBSP / SIM-DataSUS', periodo: '2018-2024' },
    { nome: 'Feminicídio', registros: feminicidioSerie.length, fonte: 'FBSP', periodo: '2018-2024' },
    { nome: 'Educação — Série Histórica', registros: educacaoSerieHistorica.length, fonte: 'INEP / PNAD', periodo: '2018-2024' },
    { nome: 'Saúde — Série Histórica', registros: saudeSerieHistorica.length, fonte: 'DataSUS / SIM / SINASC', periodo: '2018-2024' },
    { nome: 'Trabalho Interseccional', registros: interseccionalidadeTrabalho.length, fonte: 'PNAD Contínua', periodo: '2018-2024' },
    { nome: 'Deficiência × Raça', registros: deficienciaPorRaca.length, fonte: 'IBGE / Censo 2022', periodo: '2022' },
    { nome: 'LGBTQIA+ — ANTRA/Trans', registros: serieAntraTrans.length, fonte: 'ANTRA / FBSP', periodo: '2018-2024' },
    { nome: 'LGBTQIA+ × Raça', registros: lgbtqiaPorRaca.length, fonte: 'Pesquisa Sexualidade IBGE', periodo: '2022' },
    { nome: 'Classe Social × Raça', registros: classePorRaca.length, fonte: 'PNAD Contínua / SIS', periodo: '2022' },
    { nome: 'Mulheres Chefes de Família', registros: 0, fonte: '🔴 LACUNA — SIDRA 6403 não publica por raça', periodo: 'N/A' },
    { nome: 'Violência Interseccional', registros: violenciaInterseccional.length, fonte: 'FBSP / DataSUS', periodo: '2018-2024' },
    { nome: 'Juventude Negra', registros: juventudeNegra.length, fonte: 'FBSP / PNAD', periodo: '2018-2024' },
    { nome: 'Educação Interseccional', registros: 0, fonte: '🔴 LACUNA — IBGE/INEP não publica raça×gênero', periodo: 'N/A' },
    { nome: 'Saúde Interseccional', registros: 0, fonte: '🔴 LACUNA — DataSUS não cruza raça×renda', periodo: 'N/A' },
    { nome: 'Radar de Vulnerabilidades', registros: radarVulnerabilidades.length, fonte: 'Múltiplas', periodo: '2022-2024' },
    { nome: 'Evolução da Desigualdade', registros: evolucaoDesigualdade.length, fonte: 'IBGE / PNAD', periodo: '2018-2024' },
  ];

  const totalSeriesRegistros = series.reduce((s, a) => s + a.registros, 0);

  // Common Core tables by category
  const ccCategorias = [
    { nome: 'Demográficas', tabelas: tabelasDemograficas },
    { nome: 'Econômicas', tabelas: tabelasEconomicas },
    { nome: 'Educação', tabelas: tabelasEducacao },
    { nome: 'Saúde', tabelas: tabelasSaude },
    { nome: 'Trabalho', tabelas: tabelasTrabalho },
    { nome: 'Pobreza', tabelas: tabelasPobreza },
    { nome: 'Segurança', tabelas: tabelasSeguranca },
    { nome: 'Habitação', tabelas: tabelasHabitacao },
    { nome: 'Sistema Político', tabelas: tabelasSistemaPolitico },
  ];

  // BD indicators by category
  const bdCategorias: Record<string, any[]> = {};
  indicadoresBD.forEach(i => {
    const cat = i.categoria || 'outros';
    if (!bdCategorias[cat]) bdCategorias[cat] = [];
    bdCategorias[cat].push(i);
  });

  const catLabels: Record<string, string> = {
    seguranca_publica: 'Segurança Pública',
    saude: 'Saúde',
    educacao: 'Educação',
    terra_territorio: 'Terras e Territórios',
    trabalho_renda: 'Trabalho e Renda',
    politicas_institucionais: 'Políticas Institucionais',
    legislacao_justica: 'Legislação e Justiça',
    participacao_social: 'Participação Social',
    dados_estatisticas: 'Dados e Estatísticas',
    cultura_patrimonio: 'Cultura e Patrimônio',
    habitacao: 'Habitação',
  };

  const totalGeral = totalSeriesRegistros + TOTAL_DADOS_COMMON_CORE + TOTAL_DADOS_NOVOS + indicadoresBD.length;

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
  <strong>Objetivo:</strong> Consolidar a dimensão total dos dados disponíveis na Base Estatística do sistema, 
  incluindo séries temporais, tabelas do Common Core (HRI/CORE), indicadores do banco de dados e dados novos auditáveis.
  Todos os dados seguem a <em>Regra de Ouro</em>: apenas fontes oficiais auditáveis.
</div>

<div class="stats-grid">
  <div class="stat-card">
    <div class="value">${totalGeral.toLocaleString('pt-BR')}</div>
    <div class="label">TOTAL GERAL</div>
  </div>
  <div class="stat-card">
    <div class="value">${TOTAL_TABELAS_COMMON_CORE}</div>
    <div class="label">TABELAS COMMON CORE</div>
  </div>
  <div class="stat-card">
    <div class="value">${indicadoresBD.length}</div>
    <div class="label">INDICADORES BD</div>
  </div>
  <div class="stat-card">
    <div class="value">${TOTAL_DADOS_NOVOS}</div>
    <div class="label">DADOS NOVOS</div>
  </div>
</div>

<h2>1. Séries Temporais</h2>
<table>
  <thead>
    <tr><th>#</th><th>Série</th><th>Registros</th><th>Fonte</th><th>Período</th></tr>
  </thead>
  <tbody>
    ${series.map((s, i) => `<tr><td>${i + 1}</td><td>${s.nome}</td><td><strong>${s.registros}</strong></td><td>${s.fonte}</td><td>${s.periodo}</td></tr>`).join('')}
  </tbody>
  <tfoot>
    <tr style="background:#f0f4ff;font-weight:600;">
      <td colspan="2">Total</td>
      <td>${totalSeriesRegistros}</td>
      <td colspan="2">${series.length} séries</td>
    </tr>
  </tfoot>
</table>

<h2>2. Common Core — ${TOTAL_TABELAS_COMMON_CORE} Tabelas</h2>
${ccCategorias.map(cat => `
<h3>${cat.nome} (${cat.tabelas.length})</h3>
<table>
  <thead>
    <tr><th>Nº</th><th>Título</th><th>Fonte</th><th>Período</th><th>Status</th><th>Linhas</th></tr>
  </thead>
  <tbody>
    ${cat.tabelas.map(t => `<tr>
      <td>${t.numero}</td>
      <td>${t.titulo}</td>
      <td>${t.fonte}</td>
      <td>${t.periodoAtualizado}</td>
      <td><span class="badge ${t.statusAtualizacao === 'atualizado' ? 'badge-green' : t.statusAtualizacao === 'parcial' ? 'badge-amber' : 'badge-red'}">${t.statusAtualizacao}</span></td>
      <td>${t.dados.rows.length}</td>
    </tr>`).join('')}
  </tbody>
</table>`).join('')}

<h2>3. Indicadores BD — ${indicadoresBD.length}</h2>
${Object.entries(bdCategorias).sort((a, b) => b[1].length - a[1].length).map(([cat, inds]) => `
<h3>${catLabels[cat] || cat} (${inds.length})</h3>
<table>
  <thead>
    <tr><th>Indicador</th><th>Fonte</th><th>Artigos ICERD</th><th>Desagregações</th></tr>
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
      const arts = (ind.artigos_convencao || []).map((a: string) => `<span class="badge badge-purple">Art. ${a}</span>`).join('');
      return `<tr>
        <td>${ind.nome}</td>
        <td>${ind.fonte}</td>
        <td>${arts || '—'}</td>
        <td>${desags.map(d => `<span class="badge badge-blue">${d}</span>`).join('')}</td>
      </tr>`;
    }).join('')}
  </tbody>
</table>`).join('')}

<h2>4. Dados Novos — ${TOTAL_DADOS_NOVOS}</h2>
<div class="section-summary">
  <strong>${TOTAL_DADOS_NOVOS} indicadores auditáveis</strong> em 9 categorias temáticas com deep links para fontes oficiais.
</div>

<div class="footer">
  <p>📋 Inventário gerado pelo Sistema CERD IV — ${now}</p>
</div>

</body>
</html>`;
}

function downloadDOCX(html: string, fileName: string) {
  try {
    const blob = new Blob(['\ufeff' + html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast.success('Documento DOCX gerado com sucesso');
  } catch (e) {
    toast.error('Erro ao gerar documento');
  }
}

export function StatisticsInventoryReport() {
  const { data: indicadoresBD } = useIndicadoresInterseccionais();
  const [generating, setGenerating] = useState<string | null>(null);

  const handleFullReport = (format: 'html' | 'docx') => {
    setGenerating(`full-${format}`);
    try {
      const html = generateFullStatisticsHTML(indicadoresBD || []);
      if (format === 'docx') {
        downloadDOCX(html, 'Relatorio-Completo-Base-Estatistica-CERD-IV');
      } else {
        const w = window.open('', '_blank');
        if (w) { w.document.write(html); w.document.close(); }
      }
    } finally {
      setGenerating(null);
    }
  };

  const handleInventory = (format: 'html' | 'docx') => {
    setGenerating(`inv-${format}`);
    try {
      const html = generateInventoryHTML(indicadoresBD || []);
      if (format === 'docx') {
        downloadDOCX(html, 'Inventario-Base-Estatistica-CERD-IV');
      } else {
        const w = window.open('', '_blank');
        if (w) { w.document.write(html); w.document.close(); }
      }
    } finally {
      setGenerating(null);
    }
  };

  const totalGeral = TOTAL_DADOS_ESTATISTICAS + TOTAL_DADOS_COMMON_CORE + TOTAL_DADOS_NOVOS + (indicadoresBD?.length || 0);

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
          (séries, {TOTAL_TABELAS_COMMON_CORE} tabelas CC, {indicadoresBD?.length || 0} indicadores BD, 
          interseccionalidades, vulnerabilidades) ou o inventário resumido.
        </p>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">{totalGeral.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">Registros totais</p>
          </div>
          <div className="p-2 bg-muted/50 rounded-lg">
            <p className="text-lg font-bold text-foreground">{TOTAL_TABELAS_COMMON_CORE + 19 + 9}</p>
            <p className="text-xs text-muted-foreground">Tabelas + Séries + Abas</p>
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

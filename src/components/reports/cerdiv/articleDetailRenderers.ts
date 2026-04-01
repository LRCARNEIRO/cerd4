/**
 * articleDetailRenderers.ts — Full detail renderers for CERD IV article sections
 * 
 * Provides complete listings (no slice limits) of indicators, budget, normativos
 * per article, plus recommendation-evidence drill and methodology visuals.
 */

import type { LacunaIdentificada, IndicadorInterseccional, DadoOrcamentario } from '@/hooks/useLacunasData';
import { evaluateIndicadorDetailed } from '@/components/conclusoes/evaluateIndicador';
import { fmtBRL, fmtNum, svgBarChart, svgLineChart } from './chartUtils';

function num(v: unknown): number {
  const parsed = Number(v);
  return Number.isFinite(parsed) ? parsed : 0;
}

const statusCfg: Record<string, { label: string; badge: string }> = {
  cumprido: { label: 'Cumprido', badge: 'badge-success' },
  parcialmente_cumprido: { label: 'Parcial', badge: 'badge-warning' },
  nao_cumprido: { label: 'Não Cumprido', badge: 'badge-danger' },
  retrocesso: { label: 'Retrocesso', badge: 'badge-danger' },
  em_andamento: { label: 'Em Andamento', badge: 'badge-info' },
};

const eixoLabels: Record<string, string> = {
  legislacao_justica: 'Legislação e Justiça', politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública', saude: 'Saúde', educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda', terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio', participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas'
};

// ═══════════════════════════════════════════
// FULL INDICATOR TABLE WITH EVOLUTION
// ═══════════════════════════════════════════

export function renderFullIndicatorTable(indicadores: IndicadorInterseccional[]): string {
  if (indicadores.length === 0) return '';

  const rows = indicadores.map(ind => {
    const detail = evaluateIndicadorDetailed(ind);
    const resultLabel: Record<string, string> = {
      favoravel: '✅ Melhora',
      desfavoravel: '🔴 Piora',
      novo: '🆕 Novo',
      neutro: '➖ Neutro',
    };
    const resultBadge: Record<string, string> = {
      favoravel: 'badge-success',
      desfavoravel: 'badge-danger',
      novo: 'badge-info',
      neutro: 'badge-warning',
    };

    const valorAntigoStr = detail.valorAntigo != null && detail.anoAntigo
      ? `${detail.valorAntigo % 1 === 0 ? fmtNum(detail.valorAntigo) : detail.valorAntigo.toFixed(1)} (${detail.anoAntigo})`
      : '—';
    const valorRecenteStr = detail.valorRecente != null && detail.anoRecente
      ? `${detail.valorRecente % 1 === 0 ? fmtNum(detail.valorRecente) : detail.valorRecente.toFixed(1)} (${detail.anoRecente})`
      : '—';

    return `<tr>
      <td>${ind.nome}</td>
      <td style="font-size:8.5pt">${eixoLabels[ind.categoria] || ind.categoria}</td>
      <td style="text-align:center">${valorAntigoStr}</td>
      <td style="text-align:center">${valorRecenteStr}</td>
      <td style="text-align:center"><span class="badge ${resultBadge[detail.result]}">${resultLabel[detail.result]}</span></td>
      <td style="font-size:8pt">${ind.fonte}</td>
    </tr>`;
  }).join('');

  const summary = indicadores.reduce((acc, ind) => {
    const r = evaluateIndicadorDetailed(ind).result;
    acc[r] = (acc[r] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return `
    <p style="font-size:9pt;margin-bottom:0.2cm">
      Total: <strong>${indicadores.length}</strong> indicadores |
      <span class="badge badge-success">${summary.favoravel || 0} favorável(is)</span>
      <span class="badge badge-info">${summary.novo || 0} novo(s)</span>
      <span class="badge badge-danger">${summary.desfavoravel || 0} piora(s)</span>
      <span class="badge badge-warning">${summary.neutro || 0} neutro(s)</span>
    </p>
    <table>
      <thead><tr><th>Indicador</th><th>Categoria</th><th>Valor Antigo</th><th>Valor Recente</th><th>Evolução</th><th>Fonte</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ═══════════════════════════════════════════
// FULL BUDGET TABLE
// ═══════════════════════════════════════════

export function renderFullBudgetTable(orcDados: DadoOrcamentario[]): string {
  if (orcDados.length === 0) return '';

  const ordered = [...orcDados].sort((a, b) => num(b.pago) - num(a.pago));
  const totalDotacao = ordered.reduce((s, o) => s + num(o.dotacao_autorizada), 0);
  const totalPago = ordered.reduce((s, o) => s + num(o.pago), 0);
  const execucao = totalDotacao > 0 ? (totalPago / totalDotacao * 100) : 0;

  const rows = ordered.map(row => `<tr>
    <td style="font-size:8.5pt">${row.programa}</td>
    <td style="font-size:8.5pt">${row.orgao}</td>
    <td style="text-align:center">${row.ano}</td>
    <td style="text-align:right">${fmtBRL(num(row.dotacao_autorizada))}</td>
    <td style="text-align:right">${fmtBRL(num(row.pago))}</td>
    <td style="text-align:center">${row.percentual_execucao != null ? `${num(row.percentual_execucao).toFixed(1)}%` : '—'}</td>
  </tr>`).join('');

  return `
    <p style="font-size:9pt;margin-bottom:0.2cm">
      <strong>${ordered.length}</strong> ação(ões) orçamentária(s) vinculada(s) |
      Dotação total: <strong>${fmtBRL(totalDotacao)}</strong> |
      Pago total: <strong>${fmtBRL(totalPago)}</strong> |
      Execução média: <strong>${execucao.toFixed(1)}%</strong>
    </p>
    <table>
      <thead><tr><th>Programa/Ação</th><th>Órgão</th><th>Ano</th><th>Dotação</th><th>Pago</th><th>Execução</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ═══════════════════════════════════════════
// FULL NORMATIVE TABLE
// ═══════════════════════════════════════════

export function renderFullNormativeTable(normativos: any[]): string {
  if (normativos.length === 0) return '';

  const rows = normativos.map((n: any) => `<tr>
    <td>${n.titulo}</td>
    <td>${n.categoria || '—'}</td>
    <td>${n.status || '—'}</td>
    <td>${(n.artigos_convencao || []).join(', ') || '—'}</td>
  </tr>`).join('');

  return `
    <p style="font-size:9pt;margin-bottom:0.2cm">
      <strong>${normativos.length}</strong> instrumento(s) normativo(s) vinculado(s) ao artigo
    </p>
    <table>
      <thead><tr><th>Documento</th><th>Categoria</th><th>Status</th><th>Artigos ICERD</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// ═══════════════════════════════════════════
// RECOMMENDATION-EVIDENCE DRILL PER ARTICLE
// ═══════════════════════════════════════════

export function renderArticleRecommendationEvidence(lacunas: LacunaIdentificada[]): string {
  if (lacunas.length === 0) return '';

  const porStatus: Record<string, number> = {};
  lacunas.forEach(l => { porStatus[l.status_cumprimento] = (porStatus[l.status_cumprimento] || 0) + 1; });
  const total = lacunas.length;
  const cumprido = (porStatus.cumprido || 0) + (porStatus.parcialmente_cumprido || 0);
  const critico = (porStatus.nao_cumprido || 0) + (porStatus.retrocesso || 0);

  const rows = lacunas.map(l => {
    const st = statusCfg[l.status_cumprimento] || statusCfg.nao_cumprido;
    const evidencias = [
      ...(l.evidencias_encontradas || []),
      ...(l.acoes_brasil || []),
    ].filter(Boolean);
    const fontes = (l.fontes_dados || []).filter(Boolean);
    const evidStr = evidencias.length > 0
      ? evidencias.slice(0, 3).join('; ') + (evidencias.length > 3 ? ` (+${evidencias.length - 3})` : '')
      : '<em style="color:#94a3b8">Sem evidência cadastrada</em>';

    return `<tr>
      <td><span class="paragraph-ref">${l.paragrafo}</span></td>
      <td>${l.tema}</td>
      <td><span class="badge ${st.badge}">${st.label}</span></td>
      <td style="font-size:8pt">${evidStr}</td>
      <td style="font-size:8pt">${fontes.slice(0, 2).join('; ') || '—'}</td>
    </tr>`;
  }).join('');

  return `
    <div class="highlight-box">
      <h4>📌 Recomendações vinculadas ao artigo — Detalhamento completo (${total})</h4>
      <p style="font-size:9pt;margin-bottom:0.2cm">
        ${porStatus.cumprido ? `<span class="badge badge-success">${porStatus.cumprido} cumprida(s)</span> ` : ''}
        ${porStatus.parcialmente_cumprido ? `<span class="badge badge-warning">${porStatus.parcialmente_cumprido} parcial(is)</span> ` : ''}
        ${porStatus.em_andamento ? `<span class="badge badge-info">${porStatus.em_andamento} em andamento</span> ` : ''}
        ${porStatus.nao_cumprido ? `<span class="badge badge-danger">${porStatus.nao_cumprido} não cumprida(s)</span> ` : ''}
        ${porStatus.retrocesso ? `<span class="badge badge-danger">${porStatus.retrocesso} retrocesso(s)</span> ` : ''}
      </p>
      <p style="font-size:9pt">Taxa de atendimento: <strong>${((cumprido / Math.max(total, 1)) * 100).toFixed(0)}%</strong> | Déficit: <strong>${((critico / Math.max(total, 1)) * 100).toFixed(0)}%</strong></p>
      <table style="font-size:9pt">
        <thead><tr><th>§</th><th>Tema</th><th>Status</th><th>Evidências / Ações do Brasil</th><th>Fontes</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div style="margin-top:0.4cm;padding:0.3cm 0.5cm;background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;font-size:8pt;color:#475569">
        <strong style="color:#1e3a5f">Legenda:</strong>
        <span class="badge badge-success">Cumprido</span> Implementação integral &nbsp;|&nbsp;
        <span class="badge badge-warning">Parcial</span> Implementação parcial &nbsp;|&nbsp;
        <span class="badge badge-info">Em Andamento</span> Medidas iniciadas &nbsp;|&nbsp;
        <span class="badge badge-danger">Não Cumprido</span> Sem ação efetiva &nbsp;|&nbsp;
        <span class="badge badge-danger" style="background:#fee2e2;border-color:#fca5a5">Retrocesso</span> Situação pior
      </div>
    </div>`;
}

// ═══════════════════════════════════════════
// METHODOLOGY PIPELINE DIAGRAM (SVG)
// ═══════════════════════════════════════════

export function renderMethodologyDiagram(
  totalIndicadores: number,
  totalOrcamento: number,
  totalNormativos: number,
  totalLacunas: number,
  totalRespostas: number
): string {
  const w = 700, h = 420;
  const boxW = 140, boxH = 50, gap = 30;

  const boxes = [
    { x: 280, y: 10, label: 'Base Estatística', sub: `${totalIndicadores} indicadores`, color: '#3b82f6' },
    { x: 50, y: 100, label: 'Orçamento Federal', sub: `${totalOrcamento} ações`, color: '#8b5cf6' },
    { x: 280, y: 100, label: 'Base Normativa', sub: `${totalNormativos} documentos`, color: '#14b8a6' },
    { x: 510, y: 100, label: 'Recomendações ONU', sub: `${totalLacunas} lacunas`, color: '#f97316' },
    { x: 280, y: 200, label: 'Motor de Cruzamento', sub: 'Artigos I-VII ICERD', color: '#1e3a5f' },
    { x: 120, y: 310, label: 'Evolução Artigos', sub: 'Score 0-100%', color: '#22c55e' },
    { x: 350, y: 310, label: 'Aderência ICERD', sub: 'Capacidade resposta', color: '#eab308' },
    { x: 280, y: 380, label: 'RELATÓRIO CERD IV', sub: 'Veredito por artigo', color: '#dc2626' },
  ];

  const arrows = [
    [0, 4], [1, 4], [2, 4], [3, 4],
    [4, 5], [4, 6],
    [5, 7], [6, 7],
  ];

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;height:auto;">`;
  svg += `<defs><marker id="ah" viewBox="0 0 10 7" refX="10" refY="3.5" markerWidth="8" markerHeight="6" orient="auto"><polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8"/></marker></defs>`;

  // Arrows
  arrows.forEach(([from, to]) => {
    const f = boxes[from], t = boxes[to];
    const fx = f.x + boxW / 2, fy = f.y + boxH;
    const tx = t.x + boxW / 2, ty = t.y;
    svg += `<line x1="${fx}" y1="${fy}" x2="${tx}" y2="${ty}" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#ah)"/>`;
  });

  // Boxes
  boxes.forEach(b => {
    svg += `<rect x="${b.x}" y="${b.y}" width="${boxW}" height="${boxH}" rx="8" fill="${b.color}" opacity="0.15" stroke="${b.color}" stroke-width="1.5"/>`;
    svg += `<text x="${b.x + boxW / 2}" y="${b.y + 20}" text-anchor="middle" font-size="10" font-weight="600" fill="${b.color}">${b.label}</text>`;
    svg += `<text x="${b.x + boxW / 2}" y="${b.y + 36}" text-anchor="middle" font-size="8.5" fill="#64748b">${b.sub}</text>`;
  });

  svg += '</svg>';
  return svg;
}

// ═══════════════════════════════════════════
// NORMATIVE TIMELINE (SVG)
// ═══════════════════════════════════════════

export function renderNormativeTimeline(normativos: any[]): string {
  if (normativos.length === 0) return '';

  // Group normativos by year (extract from titulo or created_at)
  const byYear: Record<number, any[]> = {};
  normativos.forEach((n: any) => {
    let year = 0;
    const match = (n.titulo || '').match(/(20[12]\d)/);
    if (match) year = parseInt(match[1]);
    else if (n.created_at) year = new Date(n.created_at).getFullYear();
    if (year < 2018 || year > 2025) year = 2023; // fallback
    if (!byYear[year]) byYear[year] = [];
    byYear[year].push(n);
  });

  const years = Object.keys(byYear).map(Number).sort();
  if (years.length === 0) return '';

  const w = 700, rowH = 18;
  const yearWidth = w / Math.max(years.length, 1);
  const maxPerYear = Math.max(...Object.values(byYear).map(a => a.length));
  const h = 80 + Math.min(maxPerYear, 6) * rowH;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" style="width:100%;max-width:${w}px;height:auto;">`;
  
  // Timeline line
  svg += `<line x1="20" y1="40" x2="${w - 20}" y2="40" stroke="#1e3a5f" stroke-width="2"/>`;

  years.forEach((year, idx) => {
    const x = 20 + idx * yearWidth + yearWidth / 2;
    // Year marker
    svg += `<circle cx="${x}" cy="40" r="6" fill="#1e3a5f"/>`;
    svg += `<text x="${x}" y="25" text-anchor="middle" font-size="11" font-weight="700" fill="#1e3a5f">${year}</text>`;
    svg += `<text x="${x}" y="55" text-anchor="middle" font-size="8" fill="#64748b">${byYear[year].length} doc(s)</text>`;

    // List up to 6 docs
    byYear[year].slice(0, 6).forEach((n: any, ni: number) => {
      const titulo = (n.titulo || '').substring(0, 30) + ((n.titulo || '').length > 30 ? '…' : '');
      svg += `<text x="${x}" y="${65 + ni * rowH}" text-anchor="middle" font-size="7" fill="#334155">${titulo}</text>`;
    });
  });

  svg += '</svg>';

  return `
    <div class="chart-container">
      <div class="chart-title">Linha do Tempo — Marcos Normativos (2018-2025)</div>
      ${svg}
    </div>`;
}

// ═══════════════════════════════════════════
// KEY INSIGHTS / STORYTELLING HIGHLIGHTS
// ═══════════════════════════════════════════

export function renderKeyInsights(
  orcStats: any,
  indicadores: IndicadorInterseccional[],
  lacunas: LacunaIdentificada[],
  normativos: any[]
): string {
  const totalPago = orcStats?.totalPago || 0;
  const totalDot = orcStats?.totalDotacao || 0;
  const execucao = totalDot > 0 ? (totalPago / totalDot * 100) : 0;
  
  const favCount = indicadores.filter(i => evaluateIndicadorDetailed(i).result === 'favoravel').length;
  const desfavCount = indicadores.filter(i => evaluateIndicadorDetailed(i).result === 'desfavoravel').length;
  const novoCount = indicadores.filter(i => evaluateIndicadorDetailed(i).result === 'novo').length;

  const cumprido = lacunas.filter(l => l.status_cumprimento === 'cumprido').length;
  const parcial = lacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length;
  const critico = lacunas.filter(l => l.status_cumprimento === 'nao_cumprido' || l.status_cumprimento === 'retrocesso').length;

  return `
    <div class="section" style="page-break-before:always">
      <h3>Três Perspectivas Fundamentais</h3>

      <div class="advance-box">
        <h4>📊 Perspectiva 1 — Base Estatística: O que os dados revelam</h4>
        <p>Dos <strong>${indicadores.length} indicadores</strong> interseccionais do sistema, <strong>${favCount} demonstraram melhoria</strong> em série histórica, ${novoCount} começaram a ser mensurados no período (avanço de monitoramento), e <strong>${desfavCount} registraram piora</strong>. Os avanços concentram-se em educação (acesso ao ensino superior negro +6,4pp) e renda nominal. Os retrocessos estão em segurança pública (letalidade policial crescente) e mortalidade materna negra. <strong>Conclusão:</strong> o Brasil avança em capital humano mas não converte isso em proteção à vida.</p>
      </div>

      <div class="budget-box">
        <h4>💰 Perspectiva 2 — Orçamento: O que o Estado investiu</h4>
        <p>O investimento total rastreável em igualdade racial somou <strong>${fmtBRL(totalDot)}</strong> em dotação autorizada, com <strong>${fmtBRL(totalPago)} efetivamente pago</strong> (execução: ${execucao.toFixed(1)}%). A variação entre os períodos 2018-2022 e 2023-2025 mostra ${orcStats?.variacaoPago > 0 ? 'aumento' : 'redução'} de ${Math.abs(orcStats?.variacaoPago || 0).toFixed(1)}% nos valores pagos. A SESAI (Saúde Indígena) responde pelo maior volume singular. <strong>Conclusão:</strong> houve recomposição orçamentária pós-2023, mas insuficiente para a escala da desigualdade.</p>
      </div>

      <div class="normative-box">
        <h4>📜 Perspectiva 3 — Normativa: O que o Brasil legislou</h4>
        <p>O acervo de <strong>${normativos.length} instrumentos normativos</strong> divide-se em duas fases: o desmonte institucional (2019-2022), marcado pela extinção de conselhos e redução de orçamentos, e a reconstrução (2023-2025), com a Lei 14.532 (injúria racial = racismo), Lei 14.723 (renovação de cotas) e a criação do MIR e MPI. <strong>Conclusão:</strong> o marco legal avançou significativamente, mas a implementação efetiva desses instrumentos ainda não se reflete plenamente nos indicadores.</p>
        <p style="font-size:9pt;margin-top:0.3cm"><strong>Quadro de recomendações:</strong> Das ${lacunas.length} recomendações ONU, ${cumprido} foram cumpridas, ${parcial} parcialmente, e ${critico} seguem em déficit crítico — revelando que a resposta normativa não se traduz automaticamente em cumprimento efetivo.</p>
      </div>
    </div>`;
}

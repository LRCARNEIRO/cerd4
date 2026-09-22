/**
 * Gera o HTML de auditoria de UMA recomendação no mesmo layout do
 * FarolDrilldownDialog (Indicadores · Normativos · Orçamento), reusando
 * as evidências já vinculadas pelo SSoT (diagnostic.linkedXxx).
 *
 * Usado pelo botão "Baixar TODOS os relatórios (.zip)" da aba
 * Acompanhamento Gerencial — gera 1 HTML por recomendação.
 */
import type { RecomendacaoDiagnostic } from '@/hooks/useDiagnosticSensor';
import { isLinkedEvidenceEligible } from '@/utils/indicatorEvidenceGuards';
import { resolveIndicadorReportData } from '@/utils/resolveIndicadorReportData';
import { FAIXA_LABEL, TETOS_ESFORCO, formatScore } from '@/utils/esforcoImpacto';

function fmtNum(v: number | undefined): string {
  if (v === undefined || v === null || Number.isNaN(v)) return '—';
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}k`;
  if (v % 1 !== 0) return v.toFixed(4);
  return v.toLocaleString('pt-BR');
}

function extractAno(d: any): string {
  if (!d) return '—';
  const m = String(d).match(/(19|20)\d{2}/);
  return m ? m[0] : '—';
}

function extractOrgao(titulo: string): string {
  if (!titulo) return '—';
  const t = titulo.toUpperCase();
  const siglas = ['MIR', 'MDHC', 'SEPPIR', 'STF', 'STJ', 'TSE', 'TST', 'CNJ', 'CNMP', 'AGU', 'PGR', 'MJ', 'MPF', 'MEC', 'MS', 'INCRA', 'FUNAI', 'SESAI', 'IBGE', 'DPU', 'DPF', 'IPHAN', 'CONANDA', 'CONAQ'];
  for (const s of siglas) {
    if (new RegExp(`\\b${s}\\b`).test(t)) return s;
  }
  return '—';
}

/**
 * Monta o deep-link p/ um indicador. Prefere o código curto (IND-NNN), que
 * é estável, audit-friendly e independente do UUID. O UUID entra como
 * fallback redundante (`?ind=`) p/ resolução determinística.
 */
function buildIndicadorLink(id: string, codigo: string | undefined, origin: string, sub?: string): string {
  const subParam = sub ? `&sub=${encodeURIComponent(sub)}` : '';
  if (codigo) return `${origin}/estatisticas?ind=${encodeURIComponent(codigo)}&tab=indicadores-db&q=${encodeURIComponent(codigo)}${subParam}#ind-${codigo}`;
  return `${origin}/estatisticas?ind=${id}#indicador-${id}`;
}

interface Args {
  recomendacao: {
    id: string;
    paragrafo: string;
    tema: string;
    eixo_tematico?: string;
    prioridade?: string;
    artigos_convencao?: string[] | null;
    descricao_lacuna?: string | null;
    texto_original_onu?: string | null;
    status_cumprimento: string;
  };
  diagnostic: RecomendacaoDiagnostic | undefined;
  /** Mapa nome → id dos indicadores (do raw da DB) p/ resolver deep-link. */
  indicadorIdByNome: Map<string, string>;
  /**
   * Mapa nome → código curto (IND-NNN). Quando informado, o link e o
   * cabeçalho de cada indicador exibem o código antes do nome — facilita
   * citação em PDF/auditoria humana.
   */
  indicadorCodigoByNome?: Map<string, string>;
  /** Registro completo para recuperar dados de cards fixos e subindicadores. */
  indicadorRegByNome: Map<string, { id?: string; codigo?: string | null; nome?: string; dados?: any; tendencia?: string | null }>;
  /** Mapa título → metadata do normativo p/ resolver url_origem, categoria. */
  normativoMetaByTitulo: Map<string, { url_origem?: string | null; categoria?: string | null; created_at?: string | null }>;
  /** Mapa composto orçamento → metadata p/ resolver dotação, execução. */
  orcamentoMetaByKey: Map<string, any>;
  orcamentoMetaById: Map<string, any>;
  origin: string;
}

function orcKey(o: { programa?: string; orgao?: string; ano?: number | string }): string {
  return `${o.programa || ''}|${o.orgao || ''}|${o.ano ?? ''}`;
}

export function generateRecomendacaoAuditHTML({
  recomendacao,
  diagnostic,
  indicadorIdByNome,
  indicadorCodigoByNome,
  indicadorRegByNome,
  normativoMetaByTitulo,
  orcamentoMetaByKey,
  orcamentoMetaById,
  origin,
}: Args): string {
  // ⚠️ REGRA DE OURO: defesa redundante ao sensor — bloqueia Common Core e
  // indicadores descartados por falta de fonte racial auditável, inclusive
  // se vierem de override manual antigo (localStorage).
  const linkedInd = (diagnostic?.linkedIndicadores || []).filter(isLinkedEvidenceEligible);
  const linkedOrc = diagnostic?.linkedOrcamento || [];
  const linkedNorm = diagnostic?.linkedNormativos || [];

  const auditoria = diagnostic?.auditoria;
  const ei = auditoria?.esforcoImpacto;

  // ── Indicadores ────────────────────────────────────────────────
  const indEvals = linkedInd.map(li => {
    const { id, codigo, detail, unico } = resolveIndicadorReportData(li, {
      indicadorIdByNome,
      indicadorCodigoByNome: indicadorCodigoByNome || new Map<string, string>(),
      indicadorRegByNome,
    });
    return { id, codigo, nome: li.nome, sub: li.sub, detail, unico };
  });

  const indRows = indEvals.map(({ id, codigo, nome, sub, detail, unico }) => {
    const link = (id || codigo) ? buildIndicadorLink(id, codigo, origin, sub) : '';
    const codigoBadge = codigo
      ? `<span style="display:inline-block;font-family:ui-monospace,Menlo,monospace;font-size:9px;letter-spacing:0.05em;padding:2px 5px;border-radius:3px;background:#dbeafe;color:#1e40af;border:1px solid #93c5fd;margin-right:6px">${codigo}</span>`
      : '';
    const nomeCell = link
      ? `${codigoBadge}<a href="${link}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline">${codigo ? `${codigo} — ` : ''}${nome}</a>`
      : `${codigoBadge}${nome}`;
    const temUnico = !!(unico && (unico.valor !== undefined || unico.texto));
    const resultColor = detail.result === 'favoravel' ? '#16a34a' : detail.result === 'desfavoravel' ? '#dc2626' : detail.result === 'novo' ? '#2563eb' : temUnico ? '#0f766e' : '#6b7280';
    const resultLabel = detail.result === 'favoravel' ? '↑ Melhoria' : detail.result === 'desfavoravel' ? '↓ Piora' : detail.result === 'novo' ? '★ Novo' : temUnico ? '• Dado único' : '— Neutro';
    const anoRecente = detail.anoRecente ?? unico?.ano;
    const valorRecente = detail.valorRecente !== undefined ? detail.valorRecente : unico?.valor;
    const unidade = unico?.unidade ? ` ${unico.unidade}` : '';
    const celulaRecente = valorRecente !== undefined
      ? `${fmtNum(valorRecente)}${unidade}`
      : (unico?.texto || '—');
    return `<tr>
      <td>${nomeCell}</td>
      <td style="text-align:center">${detail.anoAntigo ?? '—'}</td>
      <td style="text-align:right">${detail.valorAntigo !== undefined ? fmtNum(detail.valorAntigo) : '—'}</td>
      <td style="text-align:center">${anoRecente ?? '—'}</td>
      <td style="text-align:right">${celulaRecente}</td>
      <td style="text-align:center;color:${resultColor};font-weight:600">${resultLabel}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:12px">Sem indicadores vinculados.</td></tr>`;

  // ── Normativos ─────────────────────────────────────────────────
  const normRows = linkedNorm.map(n => {
    const meta = normativoMetaByTitulo.get(n.titulo) || {};
    const ano = extractAno(meta.created_at) !== '—' ? extractAno(meta.created_at) : extractAno(n.titulo);
    const orgao = extractOrgao(n.titulo);
    const tipo = meta.categoria || '—';
    const titulo = meta.url_origem
      ? `<a href="${meta.url_origem}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline">${n.titulo}</a>`
      : n.titulo;
    return `<tr><td style="text-align:center">${ano}</td><td>${orgao}</td><td style="text-transform:capitalize">${tipo}</td><td>${titulo}</td></tr>`;
  }).join('') || `<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:12px">Sem normativos vinculados.</td></tr>`;

  // ── Orçamento ──────────────────────────────────────────────────
  const orcRows = linkedOrc.map(o => {
    const meta = (o.id ? orcamentoMetaById.get(o.id) : undefined) || orcamentoMetaByKey.get(orcKey(o)) || {};
    const dot = Number(meta.dotacao_autorizada ?? o.dotacao_autorizada ?? 0);
    const emp = Number(meta.empenhado ?? (o as any).empenhado ?? 0);
    const liq = Number(meta.liquidado ?? o.liquidado ?? 0);
    const pago = Number(meta.pago ?? o.pago ?? 0);
    const exec = Number(meta.percentual_execucao);
    const execStr = Number.isFinite(exec) && exec > 0
      ? `${exec.toFixed(1)}%`
      : (dot > 0 ? `${(pago / dot * 100).toFixed(1)}%` : '—');
    return `<tr>
      <td style="text-align:center">${o.ano ?? '—'}</td>
      <td>${o.programa || '—'}</td>
      <td>${o.orgao || '—'}</td>
      <td style="text-align:right">R$ ${(dot / 1e6).toFixed(2)}M</td>
      <td style="text-align:right">R$ ${(emp / 1e6).toFixed(2)}M</td>
      <td style="text-align:right">R$ ${(liq / 1e6).toFixed(2)}M</td>
      <td style="text-align:right">R$ ${(pago / 1e6).toFixed(2)}M</td>
      <td style="text-align:center;font-weight:600">${execStr}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:12px">Sem ações orçamentárias vinculadas.</td></tr>`;

  const artigos = (recomendacao.artigos_convencao || []).join(', ') || '—';
  const textoOriginal = (recomendacao.texto_original_onu || recomendacao.descricao_lacuna || '').trim();

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Auditoria — §${recomendacao.paragrafo} · ${recomendacao.tema}</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;padding:2rem;max-width:1400px;margin:auto;color:#1e293b}
  h1{font-size:18px;border-bottom:3px solid #1e40af;padding-bottom:8px;margin-bottom:6px}
  h2{margin-top:1.8rem;color:#1e40af;font-size:15px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
  .meta{font-size:11px;color:#64748b;margin-bottom:12px}
  .metric-pill{display:inline-block;padding:3px 10px;border-radius:12px;font-weight:600;font-size:11px;background:#e2e8f0;color:#1e293b;margin-right:5px}
  .summary{background:#f8fafc;border-left:4px solid #1e40af;padding:10px 14px;margin:12px 0;border-radius:4px;font-size:12px}
  .summary p{margin:3px 0}
  table{width:100%;border-collapse:collapse;margin:8px 0}
  th,td{border:1px solid #e2e8f0;padding:6px 8px;font-size:11px;vertical-align:top}
  th{background:#f1f5f9;font-weight:600;text-align:left}
  tr:nth-child(even) td{background:#fafafa}
  .quote{background:#fefce8;border-left:3px solid #ca8a04;padding:8px 12px;font-size:11px;font-style:italic;color:#3f3f46;margin:8px 0}
  .footer{margin-top:2rem;padding-top:10px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;text-align:center}
</style></head><body>

<h1>Auditoria — §${recomendacao.paragrafo}: ${recomendacao.tema}</h1>
<div class="meta">Artigos ICERD: <strong>${artigos}</strong> · Prioridade cadastrada: <strong>${recomendacao.prioridade || '—'}</strong></div>
<div class="meta">Gerado em ${new Date().toLocaleString('pt-BR')}</div>

${textoOriginal ? `<div class="quote">${textoOriginal}</div>` : ''}

${ei ? `<div class="summary">
  <p><span class="metric-pill">Esforço ${formatScore(ei.esforco)} · ${FAIXA_LABEL[ei.faixaEsforco]}</span><span class="metric-pill">Impacto ${formatScore(ei.impacto)} · ${FAIXA_LABEL[ei.faixaImpacto]}</span></p>
  <p><strong>Realização: ${formatScore(ei.realizacao)}</strong> · estatística ${formatScore(ei.componentes.realizacaoEstatistica)}% · orçamentária ${formatScore(ei.componentes.realizacaoOrcamentaria)}% · normativa ${formatScore(ei.componentes.realizacaoNormativa)}%</p>
  <p>📊 ${ei.contagens.favoraveis} indicador(es) com evolução não desfavorável entre ${ei.contagens.comTendencia} com tendência mensurável · 💰 ${ei.contagens.orcamentaria} ações · ⚖️ ${ei.contagens.normativa} normativos.</p>
</div>` : ''}

<h2>Metodologia de Cálculo — Esforço e Impacto</h2>
<p><strong>Esforço:</strong> E = [100 × min(nEst/${TETOS_ESFORCO.estatistica}; 1) + 100 × min(nOrç/${TETOS_ESFORCO.orcamentaria}; 1) + 100 × min(nNorm/${TETOS_ESFORCO.normativa}; 1)] ÷ 3.</p>
<p><strong>Realização:</strong> R = [% de indicadores com evolução não desfavorável + %(Σ Liquidado ÷ Σ Dotação autorizada válida) + %(presença normativa)] ÷ 3. A presença normativa vale 100 e a ausência vale 0.</p>
<p><strong>Componente estatístico:</strong> (indicadores que melhoraram + indicadores estáveis) ÷ total de indicadores com tendência mensurável × 100. “Estável” representa manutenção do resultado e recebe 1; somente a piora é penalizada com 0.</p>
<p><strong>Impacto Evidenciado:</strong> I = E × R ÷ 100.</p>

<h2>📊 Indicadores (${linkedInd.length})</h2>
<p style="font-size:10px;color:#64748b;margin:4px 0">Clique no nome do indicador para abrir o registro exato no sistema (com rolagem automática).</p>
<table>
  <thead><tr>
    <th>Indicador</th><th style="text-align:center">Ano Antigo</th><th style="text-align:right">Valor Antigo</th>
    <th style="text-align:center">Ano Recente</th><th style="text-align:right">Valor Recente</th><th style="text-align:center">Resultado</th>
  </tr></thead>
  <tbody>${indRows}</tbody>
</table>

<h2>⚖️ Normativos (${linkedNorm.length})</h2>
<table>
  <thead><tr><th style="text-align:center">Ano</th><th>Órgão</th><th>Tipo</th><th>Título</th></tr></thead>
  <tbody>${normRows}</tbody>
</table>

<h2>💰 Orçamento (${linkedOrc.length} ações)</h2>
<table>
  <thead><tr>
    <th style="text-align:center">Ano</th><th>Programa</th><th>Órgão</th>
    <th style="text-align:right">Dotação Autorizada</th><th style="text-align:right">Empenhado</th><th style="text-align:right">Liquidado</th>
    <th style="text-align:right">Pago</th><th style="text-align:center">Execução (%)</th>
  </tr></thead>
  <tbody>${orcRows}</tbody>
</table>

<div class="footer">Sistema de Subsídios CERD IV — Evidências espelhadas do gerenciador de recomendações (SSoT)</div>
</body></html>`;
}

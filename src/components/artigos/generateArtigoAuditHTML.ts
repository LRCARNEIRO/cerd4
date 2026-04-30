/**
 * Gera o HTML de auditoria de UM Artigo ICERD agregando todas as
 * recomendações vinculadas a ele e a UNIÃO deduplicada das evidências
 * (indicadores, normativos e orçamento).
 *
 * Mesma linguagem visual do `generateRecomendacaoAuditHTML.ts`,
 * para o usuário ler ambos os relatórios sem fricção cognitiva.
 *
 * Vinculação:
 *  - Recomendações herdam Artigos via `artigos_convencao` (tag DB
 *    explícita) ou via `EIXO_PARA_ARTIGOS[eixo_tematico]` (fallback).
 *  - Evidências = união dos `linkedXxx` de todas as recomendações
 *    pertencentes ao Artigo, sem duplo conto (chave por id/título/triplo).
 */
import { evaluateIndicadorDetailed } from '@/components/conclusoes/evaluateIndicador';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';
import type { RecomendacaoDiagnostic } from '@/hooks/useDiagnosticSensor';
import type { ExportLookupMaps } from '@/components/recomendacoes/recomendacaoExportShared';

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
  for (const s of siglas) if (new RegExp(`\\b${s}\\b`).test(t)) return s;
  return '—';
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  cumprido: { label: 'Cumprida', color: '#16a34a' },
  parcialmente_cumprido: { label: 'Parcial', color: '#ca8a04' },
  em_andamento: { label: 'Parcial', color: '#ca8a04' },
  nao_cumprido: { label: 'Não Cumprida', color: '#dc2626' },
  retrocesso: { label: 'Não Cumprida', color: '#dc2626' },
};

function buildIndicadorLink(id: string, codigo: string | undefined, origin: string): string {
  if (codigo) return `${origin}/estatisticas?ind=${encodeURIComponent(codigo)}&tab=indicadores-db&q=${encodeURIComponent(codigo)}#ind-${codigo}`;
  return `${origin}/estatisticas?ind=${id}#indicador-${id}`;
}

/** Lista de Artigos vinculados a uma recomendação (DB explícito ou eixo). */
function getArtigosOf(rec: { artigos_convencao?: string[] | null; eixo_tematico?: string }): ArtigoConvencao[] {
  if (rec.artigos_convencao && rec.artigos_convencao.length > 0) {
    return rec.artigos_convencao.filter((a): a is ArtigoConvencao => /^(I{1,3}|IV|V|VI|VII)$/.test(a));
  }
  return EIXO_PARA_ARTIGOS[rec.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS] || [];
}

interface Args {
  artigo: ArtigoConvencao;
  recomendacoes: any[];
  diagnosticMap: Map<string, RecomendacaoDiagnostic>;
  lookups: ExportLookupMaps;
}

export function generateArtigoAuditHTML({ artigo, recomendacoes, diagnosticMap, lookups }: Args): string {
  const { indicadorIdByNome, indicadorCodigoByNome, normativoMetaByTitulo, orcamentoMetaByKey, origin } = lookups;
  const def = ARTIGOS_CONVENCAO.find(a => a.numero === artigo);

  // Filtrar recomendações vinculadas ao Artigo
  const recsDoArtigo = recomendacoes.filter(r => getArtigosOf(r).includes(artigo));

  // Dedup das evidências (união)
  const indByNome = new Map<string, { id?: string; codigo?: string; nome: string; categoria?: string; tendencia?: string; dados: any; recomendacoes: string[] }>();
  const normByTitulo = new Map<string, { titulo: string; recomendacoes: string[] }>();
  const orcByKey = new Map<string, { o: any; recomendacoes: string[] }>();

  let countCumprida = 0, countParcial = 0, countNaoCumprida = 0;

  for (const rec of recsDoArtigo) {
    const diag = diagnosticMap.get(rec.id);
    const status = diag?.statusComputado || rec.status_cumprimento;
    if (status === 'cumprido') countCumprida++;
    else if (status === 'parcialmente_cumprido' || status === 'em_andamento') countParcial++;
    else countNaoCumprida++;

    const tag = `§${rec.paragrafo}`;

    for (const li of diag?.linkedIndicadores || []) {
      const cur = indByNome.get(li.nome);
      if (cur) cur.recomendacoes.push(tag);
      else indByNome.set(li.nome, { ...li, recomendacoes: [tag] });
    }
    for (const ln of diag?.linkedNormativos || []) {
      const cur = normByTitulo.get(ln.titulo);
      if (cur) cur.recomendacoes.push(tag);
      else normByTitulo.set(ln.titulo, { titulo: ln.titulo, recomendacoes: [tag] });
    }
    for (const lo of diag?.linkedOrcamento || []) {
      const k = `${lo.programa || ''}|${lo.orgao || ''}|${lo.ano ?? ''}`;
      const cur = orcByKey.get(k);
      if (cur) cur.recomendacoes.push(tag);
      else orcByKey.set(k, { o: lo, recomendacoes: [tag] });
    }
  }

  // ── Tabela de recomendações ──
  const recRows = recsDoArtigo.map(rec => {
    const diag = diagnosticMap.get(rec.id);
    const status = diag?.statusComputado || rec.status_cumprimento;
    const info = STATUS_LABEL[status] || STATUS_LABEL.nao_cumprido;
    const ind = diag?.linkedIndicadores?.length || 0;
    const norm = diag?.linkedNormativos?.length || 0;
    const orc = diag?.linkedOrcamento?.length || 0;
    return `<tr>
      <td style="font-family:monospace">§${rec.paragrafo}</td>
      <td>${rec.tema || '—'}</td>
      <td><span style="display:inline-block;padding:2px 8px;border-radius:10px;background:${info.color};color:white;font-size:10px;font-weight:600">${info.label}</span></td>
      <td style="text-align:center">${ind}</td>
      <td style="text-align:center">${norm}</td>
      <td style="text-align:center">${orc}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:12px">Nenhuma recomendação vinculada a este Artigo.</td></tr>`;

  // ── Indicadores (união dedup) ──
  const indRows = Array.from(indByNome.values()).map(li => {
    const id = li.id || indicadorIdByNome.get(li.nome) || '';
    const codigo = li.codigo || indicadorCodigoByNome.get(li.nome);
    const detail = evaluateIndicadorDetailed({ nome: li.nome, categoria: li.categoria, tendencia: li.tendencia, dados: li.dados });
    const link = (id || codigo) ? buildIndicadorLink(id, codigo, origin) : '';
    const codigoBadge = codigo
      ? `<span style="display:inline-block;font-family:ui-monospace,Menlo,monospace;font-size:9px;letter-spacing:0.05em;padding:2px 5px;border-radius:3px;background:#dbeafe;color:#1e40af;border:1px solid #93c5fd;margin-right:6px">${codigo}</span>`
      : '';
    const nomeCell = link
      ? `${codigoBadge}<a href="${link}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline">${codigo ? `${codigo} — ` : ''}${li.nome}</a>`
      : `${codigoBadge}${li.nome}`;
    const resultColor = detail.result === 'favoravel' ? '#16a34a' : detail.result === 'desfavoravel' ? '#dc2626' : detail.result === 'novo' ? '#2563eb' : '#6b7280';
    const resultLabel = detail.result === 'favoravel' ? '↑ Melhoria' : detail.result === 'desfavoravel' ? '↓ Piora' : detail.result === 'novo' ? '★ Novo' : '— Neutro';
    const recsTag = li.recomendacoes.slice(0, 6).join(' ') + (li.recomendacoes.length > 6 ? ` +${li.recomendacoes.length - 6}` : '');
    return `<tr>
      <td>${nomeCell}<div style="font-size:9px;color:#64748b;margin-top:2px;font-family:monospace">vinculado por: ${recsTag}</div></td>
      <td style="text-align:center">${detail.anoAntigo ?? '—'}</td>
      <td style="text-align:right">${detail.valorAntigo !== undefined ? fmtNum(detail.valorAntigo) : '—'}</td>
      <td style="text-align:center">${detail.anoRecente ?? '—'}</td>
      <td style="text-align:right">${detail.valorRecente !== undefined ? fmtNum(detail.valorRecente) : '—'}</td>
      <td style="text-align:center;color:${resultColor};font-weight:600">${resultLabel}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:12px">Sem indicadores agregados.</td></tr>`;

  // ── Normativos ──
  const normRows = Array.from(normByTitulo.values()).map(({ titulo, recomendacoes }) => {
    const meta = normativoMetaByTitulo.get(titulo) || {};
    const ano = extractAno(meta.created_at) !== '—' ? extractAno(meta.created_at) : extractAno(titulo);
    const orgao = extractOrgao(titulo);
    const tipo = meta.categoria || '—';
    const cell = meta.url_origem
      ? `<a href="${meta.url_origem}" target="_blank" rel="noopener" style="color:#2563eb;text-decoration:underline">${titulo}</a>`
      : titulo;
    const recsTag = recomendacoes.slice(0, 6).join(' ') + (recomendacoes.length > 6 ? ` +${recomendacoes.length - 6}` : '');
    return `<tr>
      <td style="text-align:center">${ano}</td>
      <td>${orgao}</td>
      <td style="text-transform:capitalize">${tipo}</td>
      <td>${cell}<div style="font-size:9px;color:#64748b;margin-top:2px;font-family:monospace">vinculado por: ${recsTag}</div></td>
    </tr>`;
  }).join('') || `<tr><td colspan="4" style="text-align:center;color:#94a3b8;padding:12px">Sem normativos agregados.</td></tr>`;

  // ── Orçamento ──
  const orcRows = Array.from(orcByKey.values()).map(({ o, recomendacoes }) => {
    const meta = orcamentoMetaByKey.get(`${o.programa || ''}|${o.orgao || ''}|${o.ano ?? ''}`) || {};
    const dot = Number(meta.dotacao_autorizada ?? o.dotacao_autorizada ?? 0);
    const emp = Number(meta.empenhado ?? o.empenhado ?? 0);
    const liq = Number(meta.liquidado ?? o.liquidado ?? 0);
    const pago = Number(meta.pago ?? o.pago ?? 0);
    const exec = Number(meta.percentual_execucao);
    const execStr = Number.isFinite(exec) && exec > 0
      ? `${exec.toFixed(1)}%`
      : (dot > 0 ? `${(pago / dot * 100).toFixed(1)}%` : '—');
    const recsTag = recomendacoes.slice(0, 6).join(' ') + (recomendacoes.length > 6 ? ` +${recomendacoes.length - 6}` : '');
    return `<tr>
      <td style="text-align:center">${o.ano ?? '—'}</td>
      <td>${o.programa || '—'}<div style="font-size:9px;color:#64748b;margin-top:2px;font-family:monospace">vinculado por: ${recsTag}</div></td>
      <td>${o.orgao || '—'}</td>
      <td style="text-align:right">R$ ${(dot / 1e6).toFixed(2)}M</td>
      <td style="text-align:right">R$ ${(emp / 1e6).toFixed(2)}M</td>
      <td style="text-align:right">R$ ${(liq / 1e6).toFixed(2)}M</td>
      <td style="text-align:right">R$ ${(pago / 1e6).toFixed(2)}M</td>
      <td style="text-align:center;font-weight:600">${execStr}</td>
    </tr>`;
  }).join('') || `<tr><td colspan="8" style="text-align:center;color:#94a3b8;padding:12px">Sem ações orçamentárias agregadas.</td></tr>`;

  const totalRecs = recsDoArtigo.length;

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Auditoria — Artigo ${artigo} ICERD · ${def?.titulo || ''}</title>
<style>
  body{font-family:system-ui,-apple-system,sans-serif;padding:2rem;max-width:1400px;margin:auto;color:#1e293b}
  h1{font-size:18px;border-bottom:3px solid #1e40af;padding-bottom:8px;margin-bottom:6px}
  h2{margin-top:1.8rem;color:#1e40af;font-size:15px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
  .meta{font-size:11px;color:#64748b;margin-bottom:12px}
  .summary{background:#f8fafc;border-left:4px solid #1e40af;padding:10px 14px;margin:12px 0;border-radius:4px;font-size:12px}
  .summary p{margin:3px 0}
  table{width:100%;border-collapse:collapse;margin:8px 0}
  th,td{border:1px solid #e2e8f0;padding:6px 8px;font-size:11px;vertical-align:top}
  th{background:#f1f5f9;font-weight:600;text-align:left}
  tr:nth-child(even) td{background:#fafafa}
  .desc{background:#fefce8;border-left:3px solid #ca8a04;padding:8px 12px;font-size:11px;color:#3f3f46;margin:8px 0}
  .footer{margin-top:2rem;padding-top:10px;border-top:1px solid #e2e8f0;font-size:10px;color:#94a3b8;text-align:center}
  .legend{font-size:10px;color:#64748b;margin:6px 0}
</style></head><body>

<h1>Auditoria — Artigo ${artigo} da Convenção ICERD</h1>
<div class="meta"><strong>${def?.tituloCompleto || ''}</strong> · Gerado em ${new Date().toLocaleString('pt-BR')}</div>
${def?.descricao ? `<div class="desc">${def.descricao}</div>` : ''}

<div class="summary">
  <p><strong>Total de recomendações vinculadas a este Artigo:</strong> ${totalRecs}</p>
  <p>✅ Cumpridas: ${countCumprida} · 🟡 Parciais: ${countParcial} · 🔴 Não Cumpridas: ${countNaoCumprida}</p>
  <p>📊 ${indByNome.size} indicador(es) · ⚖️ ${normByTitulo.size} normativo(s) · 💰 ${orcByKey.size} ação(ões) orçamentária(s) — agregados sem duplo conto.</p>
</div>

<h2>📜 Recomendações vinculadas ao Artigo ${artigo} (${totalRecs})</h2>
<p class="legend">Recomendações da ONU monitoradas que herdam (por tag explícita ou eixo temático) o Artigo ${artigo}.</p>
<table>
  <thead><tr><th style="width:80px">§</th><th>Tema</th><th style="width:110px">Status</th><th style="text-align:center;width:70px">📊 Ind.</th><th style="text-align:center;width:70px">⚖️ Norm.</th><th style="text-align:center;width:70px">💰 Orç.</th></tr></thead>
  <tbody>${recRows}</tbody>
</table>

<h2>📊 Indicadores agregados (${indByNome.size})</h2>
<p class="legend">União das evidências estatísticas vinculadas a qualquer recomendação acima. A coluna "vinculado por" mostra quais §/recomendações trazem este indicador.</p>
<table>
  <thead><tr>
    <th>Indicador</th><th style="text-align:center">Ano Antigo</th><th style="text-align:right">Valor Antigo</th>
    <th style="text-align:center">Ano Recente</th><th style="text-align:right">Valor Recente</th><th style="text-align:center">Resultado</th>
  </tr></thead>
  <tbody>${indRows}</tbody>
</table>

<h2>⚖️ Normativos agregados (${normByTitulo.size})</h2>
<table>
  <thead><tr><th style="text-align:center">Ano</th><th>Órgão</th><th>Tipo</th><th>Título</th></tr></thead>
  <tbody>${normRows}</tbody>
</table>

<h2>💰 Orçamento agregado (${orcByKey.size} ações)</h2>
<table>
  <thead><tr>
    <th style="text-align:center">Ano</th><th>Programa</th><th>Órgão</th>
    <th style="text-align:right">Dotação Autorizada</th><th style="text-align:right">Empenhado</th><th style="text-align:right">Liquidado</th>
    <th style="text-align:right">Pago</th><th style="text-align:center">Execução (%)</th>
  </tr></thead>
  <tbody>${orcRows}</tbody>
</table>

<div class="footer">Sistema de Subsídios CERD IV — Agregação de evidências por Artigo ICERD via SSoT (useDiagnosticSensor)</div>
</body></html>`;
}

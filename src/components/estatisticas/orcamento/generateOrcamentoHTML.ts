/**
 * HTML generators for Orçamento sub-tabs export.
 */
import { generateTabReportHTML } from '@/utils/generateTabReportHTML';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

const fmtBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', minimumFractionDigits: 2 }).format(v);

const fmtBRLFull = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(v);

/* ─────────── helpers ─────────── */
function buildAnoTable(records: DadoOrcamentario[]): string {
  const byAno: Record<number, { dotacao: number; pago: number; liquidado: number }> = {};
  records.forEach(r => {
    if (!byAno[r.ano]) byAno[r.ano] = { dotacao: 0, pago: 0, liquidado: 0 };
    byAno[r.ano].dotacao += Number(r.dotacao_autorizada) || 0;
    byAno[r.ano].pago += Number(r.pago) || 0;
    byAno[r.ano].liquidado += Number(r.liquidado) || 0;
  });
  const anos = Object.keys(byAno).map(Number).sort();
  const rows = anos.map(a => {
    const d = byAno[a];
    const exec = d.dotacao > 0 ? (d.pago / d.dotacao * 100).toFixed(1) : '—';
    return `<tr${a === 2023 ? ' style="border-top:3px solid #2563eb"' : ''}>
      <td style="font-weight:bold">${a}</td>
      <td style="text-align:right;font-family:monospace;font-size:9pt">${fmtBRLFull(d.dotacao)}</td>
      <td style="text-align:right;font-family:monospace;font-size:9pt">${fmtBRLFull(d.liquidado)}</td>
      <td style="text-align:right;font-family:monospace;font-size:9pt">${fmtBRLFull(d.pago)}</td>
      <td style="text-align:center">${exec}%</td>
    </tr>`;
  }).join('');
  return `<table><tr><th>Ano</th><th>Dotação Autorizada</th><th>Liquidado</th><th>Pago</th><th>Execução</th></tr>${rows}</table>`;
}

function periodSummary(records: DadoOrcamentario[]) {
  const p1 = records.filter(r => r.ano >= 2018 && r.ano <= 2022);
  const p2 = records.filter(r => r.ano >= 2023 && r.ano <= 2025);
  const dotP1 = p1.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0);
  const dotP2 = p2.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0);
  const pagoP1 = p1.reduce((s, r) => s + (Number(r.pago) || 0), 0);
  const pagoP2 = p2.reduce((s, r) => s + (Number(r.pago) || 0), 0);
  const varDot = dotP1 > 0 ? ((dotP2 - dotP1) / dotP1 * 100) : 0;
  const varPago = pagoP1 > 0 ? ((pagoP2 - pagoP1) / pagoP1 * 100) : 0;
  return { dotP1, dotP2, pagoP1, pagoP2, varDot, varPago };
}

/* ─────────── VISÃO GERAL ─────────── */
export function generateVisaoGeralHTML(records: DadoOrcamentario[]): string {
  const s = periodSummary(records);
  const totalDot = s.dotP1 + s.dotP2;
  const totalPago = s.pagoP1 + s.pagoP2;
  const exec = totalDot > 0 ? (totalPago / totalDot * 100).toFixed(1) : '—';
  const programas = new Set(records.map(r => r.programa)).size;
  const orgaos = new Set(records.map(r => r.orgao)).size;

  return generateTabReportHTML({
    title: 'Orçamento — Visão Geral',
    subtitle: `Execução orçamentária de políticas raciais — Esfera Federal (2018–2025)`,
    fileName: 'Orcamento-Visao-Geral',
    content: `
      <div class="data-grid">
        <div class="data-card"><div class="data-card-value">${fmtBRL(totalDot)}</div><div class="data-card-label">Dotação Total</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#166534">${fmtBRL(totalPago)}</div><div class="data-card-label">Total Pago</div></div>
        <div class="data-card"><div class="data-card-value">${exec}%</div><div class="data-card-label">Execução</div></div>
        <div class="data-card"><div class="data-card-value">${programas}</div><div class="data-card-label">Programas</div></div>
        <div class="data-card"><div class="data-card-value">${orgaos}</div><div class="data-card-label">Órgãos</div></div>
      </div>

      <h2>Dotação por Período</h2>
      <div class="data-grid">
        <div class="data-card"><div class="data-card-value">${fmtBRL(s.dotP1)}</div><div class="data-card-label">Dotação 2018–2022</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#166534">${fmtBRL(s.dotP2)}</div><div class="data-card-label">Dotação 2023–2025</div></div>
        <div class="data-card"><div class="data-card-value" style="color:${s.varDot >= 0 ? '#166534' : '#991b1b'}">${s.varDot >= 0 ? '+' : ''}${s.varDot.toFixed(1)}%</div><div class="data-card-label">Variação Dotação</div></div>
      </div>

      <h2>Pago por Período</h2>
      <div class="data-grid">
        <div class="data-card"><div class="data-card-value">${fmtBRL(s.pagoP1)}</div><div class="data-card-label">Pago 2018–2022</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#166534">${fmtBRL(s.pagoP2)}</div><div class="data-card-label">Pago 2023–2025</div></div>
        <div class="data-card"><div class="data-card-value" style="color:${s.varPago >= 0 ? '#166534' : '#991b1b'}">${s.varPago >= 0 ? '+' : ''}${s.varPago.toFixed(1)}%</div><div class="data-card-label">Variação Pago</div></div>
      </div>

      <h2>Evolução Ano a Ano</h2>
      ${buildAnoTable(records)}

      <h2>Programas por Órgão</h2>
      ${(() => {
        const orgMap: Record<string, Set<string>> = {};
        records.forEach(r => {
          if (!orgMap[r.orgao]) orgMap[r.orgao] = new Set();
          orgMap[r.orgao].add(r.programa);
        });
        return Object.entries(orgMap).sort(([a], [b]) => a.localeCompare(b)).map(([org, progs]) =>
          `<h3>${org} (${progs.size} programas)</h3><ul>${Array.from(progs).map(p => `<li>${p}</li>`).join('')}</ul>`
        ).join('');
      })()}
    `,
  });
}

/* ─────────── UNIVERSO DA BASE ─────────── */
export function generateUniversoBaseHTML(records: DadoOrcamentario[]): string {
  const orgaos = new Set(records.map(r => r.orgao));
  const programas = new Set(records.map(r => r.programa));
  const anos = [...new Set(records.map(r => r.ano))].sort();
  const orcRecs = records.filter(r => r.tipo_dotacao !== 'extraorcamentario');
  const extraRecs = records.filter(r => r.tipo_dotacao === 'extraorcamentario');

  const rows = records.map(r =>
    `<tr><td>${r.orgao}</td><td>${r.programa}</td><td>${r.ano}</td><td>${r.tipo_dotacao}</td><td style="text-align:right;font-family:monospace">${fmtBRLFull(Number(r.pago) || 0)}</td></tr>`
  ).join('');

  return generateTabReportHTML({
    title: 'Orçamento — Universo da Base',
    subtitle: `${records.length} registros · ${orgaos.size} órgãos · ${programas.size} programas · ${anos[0]}–${anos[anos.length - 1]}`,
    fileName: 'Orcamento-Universo-Base',
    content: `
      <div class="data-grid">
        <div class="data-card"><div class="data-card-value">${records.length}</div><div class="data-card-label">Total Registros</div></div>
        <div class="data-card"><div class="data-card-value">${orgaos.size}</div><div class="data-card-label">Órgãos</div></div>
        <div class="data-card"><div class="data-card-value">${programas.size}</div><div class="data-card-label">Programas</div></div>
        <div class="data-card"><div class="data-card-value">${orcRecs.length}</div><div class="data-card-label">Orçamentários</div></div>
        <div class="data-card"><div class="data-card-value">${extraRecs.length}</div><div class="data-card-label">Extraorçamentários</div></div>
      </div>
      <h2>Listagem Completa</h2>
      <table><tr><th>Órgão</th><th>Programa</th><th>Ano</th><th>Tipo</th><th>Pago</th></tr>${rows}</table>
    `,
  });
}

/* ─────────── RESUMO COMPARATIVO ─────────── */
export function generateResumoComparativoHTML(records: DadoOrcamentario[]): string {
  const s = periodSummary(records);

  // SESAI split
  const isSesai = (r: DadoOrcamentario) => {
    const prog = r.programa.toLowerCase();
    const orgao = r.orgao.toUpperCase();
    const obs = ((r as any).observacoes || '').toLowerCase();
    return orgao === 'SESAI' || obs.includes('sesai') || prog.includes('20yp') || prog.includes('7684');
  };
  const nonSesai = records.filter(r => !isSesai(r));
  const sNS = periodSummary(nonSesai);

  return generateTabReportHTML({
    title: 'Orçamento — Resumo Comparativo',
    subtitle: 'Dupla Perspectiva: Total (com SESAI) vs. Políticas Raciais stricto sensu (sem SESAI)',
    fileName: 'Orcamento-Resumo-Comparativo',
    content: `
      <h2>Perspectiva 1 — Total (com SESAI)</h2>
      <div class="data-grid">
        <div class="data-card"><div class="data-card-value">${fmtBRL(s.dotP1)}</div><div class="data-card-label">Dotação 2018–2022</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#166534">${fmtBRL(s.dotP2)}</div><div class="data-card-label">Dotação 2023–2025</div></div>
        <div class="data-card"><div class="data-card-value" style="color:${s.varDot >= 0 ? '#166534' : '#991b1b'}">${s.varDot >= 0 ? '+' : ''}${s.varDot.toFixed(1)}%</div><div class="data-card-label">Variação</div></div>
      </div>
      <div class="data-grid" style="margin-top:0.3cm">
        <div class="data-card"><div class="data-card-value">${fmtBRL(s.pagoP1)}</div><div class="data-card-label">Pago 2018–2022</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#166534">${fmtBRL(s.pagoP2)}</div><div class="data-card-label">Pago 2023–2025</div></div>
        <div class="data-card"><div class="data-card-value" style="color:${s.varPago >= 0 ? '#166534' : '#991b1b'}">${s.varPago >= 0 ? '+' : ''}${s.varPago.toFixed(1)}%</div><div class="data-card-label">Variação</div></div>
      </div>

      <h2>Perspectiva 2 — Sem SESAI</h2>
      <div class="data-grid">
        <div class="data-card"><div class="data-card-value">${fmtBRL(sNS.dotP1)}</div><div class="data-card-label">Dotação 2018–2022</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#166534">${fmtBRL(sNS.dotP2)}</div><div class="data-card-label">Dotação 2023–2025</div></div>
        <div class="data-card"><div class="data-card-value" style="color:${sNS.varDot >= 0 ? '#166534' : '#991b1b'}">${sNS.varDot >= 0 ? '+' : ''}${sNS.varDot.toFixed(1)}%</div><div class="data-card-label">Variação</div></div>
      </div>
      <div class="data-grid" style="margin-top:0.3cm">
        <div class="data-card"><div class="data-card-value">${fmtBRL(sNS.pagoP1)}</div><div class="data-card-label">Pago 2018–2022</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#166534">${fmtBRL(sNS.pagoP2)}</div><div class="data-card-label">Pago 2023–2025</div></div>
        <div class="data-card"><div class="data-card-value" style="color:${sNS.varPago >= 0 ? '#166534' : '#991b1b'}">${sNS.varPago >= 0 ? '+' : ''}${sNS.varPago.toFixed(1)}%</div><div class="data-card-label">Variação</div></div>
      </div>

      <h2>Evolução Ano a Ano — Total</h2>
      ${buildAnoTable(records)}

      <h2>Evolução Ano a Ano — Sem SESAI</h2>
      ${buildAnoTable(nonSesai)}
    `,
  });
}

/* ─────────── RELATÓRIO ─────────── */
export function generateRelatorioHTML(records: DadoOrcamentario[]): string {
  const s = periodSummary(records);
  const programas = new Set(records.map(r => r.programa));

  return generateTabReportHTML({
    title: 'Relatório Orçamentário Federal',
    subtitle: `Análise da execução orçamentária de políticas raciais (2018–2025) — ${programas.size} programas`,
    fileName: 'Relatorio-Orcamentario-Federal',
    content: `
      <div class="data-grid">
        <div class="data-card"><div class="data-card-value">${fmtBRL(s.pagoP1)}</div><div class="data-card-label">Pago 2018–2022</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#166534">${fmtBRL(s.pagoP2)}</div><div class="data-card-label">Pago 2023–2025</div></div>
        <div class="data-card"><div class="data-card-value" style="color:${s.varPago >= 0 ? '#166534' : '#991b1b'}">${s.varPago >= 0 ? '+' : ''}${s.varPago.toFixed(1)}%</div><div class="data-card-label">Variação</div></div>
      </div>
      <h2>Detalhamento Ano a Ano</h2>
      ${buildAnoTable(records)}

      <h2>Programas</h2>
      <table>
        <tr><th>Programa</th><th>Órgão</th><th>Pago Total</th></tr>
        ${(() => {
          const progMap: Record<string, { orgao: string; pago: number }> = {};
          records.forEach(r => {
            if (!progMap[r.programa]) progMap[r.programa] = { orgao: r.orgao, pago: 0 };
            progMap[r.programa].pago += Number(r.pago) || 0;
          });
          return Object.entries(progMap).sort((a, b) => b[1].pago - a[1].pago).map(([prog, { orgao, pago }]) =>
            `<tr><td>${prog}</td><td>${orgao}</td><td style="text-align:right;font-family:monospace">${fmtBRLFull(pago)}</td></tr>`
          ).join('');
        })()}
      </table>
    `,
  });
}

/* ─────────── METODOLOGIA ─────────── */
export function generateMetodologiaHTML(): string {
  return generateTabReportHTML({
    title: 'Metodologia de Levantamento Orçamentário',
    subtitle: 'Critérios de seleção, fontes e classificação — Esfera Federal',
    fileName: 'Orcamento-Metodologia',
    content: `
      <h2>Critérios de Seleção</h2>
      <h3>✅ Incluído</h3>
      <ul>
        <li><strong>SESAI:</strong> Ações 20YP e 7684</li>
        <li><strong>FUNAI / MPI:</strong> Programas 2065 → 0617 → 5136</li>
        <li><strong>MIR (2023+):</strong> Programas 5802, 5803, 5804</li>
        <li><strong>SEPPIR (2018-2019):</strong> Programa 2034</li>
      </ul>
      <h3>❌ Excluído</h3>
      <ul>
        <li><strong>5034/MDHC genérico:</strong> Ações sem palavras-chave raciais</li>
        <li><strong>Transversais:</strong> Bolsa Família, MCMV, SUS, SUAS</li>
        <li><strong>MIR retroativo pré-2023</strong></li>
      </ul>

      <h2>Fontes de Dados</h2>
      <table>
        <tr><th>Fonte</th><th>Tipo</th></tr>
        <tr><td>Portal da Transparência — Despesas Federais</td><td>Orçamentário (LOA)</td></tr>
        <tr><td>Dados Abertos — LOA</td><td>Dotação Inicial</td></tr>
        <tr><td>SIOP</td><td>Complementar</td></tr>
      </table>

      <h2>Métricas</h2>
      <div class="highlight-box">
        <p><strong>Métrica principal: "Pago"</strong> — mede a transferência efetiva de recursos do Tesouro para os beneficiários finais.</p>
        <p><strong>Dotação Autorizada</strong> — previsão na LOA, incluindo créditos adicionais.</p>
        <p><strong>Liquidado</strong> — obrigação assumida pelo Estado.</p>
      </div>

      <h2>Assimetria Temporal</h2>
      <p><strong>P1 = 5 anos (2018–2022)</strong> e <strong>P2 = 3 anos (2023–2025)</strong>. Comparações diretas devem considerar esta diferença.</p>
    `,
  });
}

/* ─────────── ARTIGOS ICERD ─────────── */
export function generateArtigosCruzamentoHTML(records: DadoOrcamentario[]): string {
  return generateTabReportHTML({
    title: 'Cruzamento Orçamentário × Artigos ICERD',
    subtitle: 'Mapeamento dos programas orçamentários aos artigos da Convenção Internacional',
    fileName: 'Orcamento-Artigos-ICERD',
    content: `
      <h2>Base de Dados</h2>
      <p>${records.length} registros orçamentários mapeados para artigos da Convenção ICERD.</p>

      <h2>Detalhamento por Programa</h2>
      <table>
        <tr><th>Programa</th><th>Órgão</th><th>Pago Total</th><th>Artigos</th></tr>
        ${(() => {
          const progMap: Record<string, { orgao: string; pago: number; artigos: Set<string> }> = {};
          records.forEach(r => {
            if (!progMap[r.programa]) progMap[r.programa] = { orgao: r.orgao, pago: 0, artigos: new Set() };
            progMap[r.programa].pago += Number(r.pago) || 0;
            (r.artigos_convencao || []).forEach(a => progMap[r.programa].artigos.add(a));
          });
          return Object.entries(progMap).sort((a, b) => b[1].pago - a[1].pago).map(([prog, { orgao, pago, artigos }]) =>
            `<tr><td>${prog}</td><td>${orgao}</td><td style="text-align:right;font-family:monospace">${fmtBRLFull(pago)}</td><td>${Array.from(artigos).join(', ') || '—'}</td></tr>`
          ).join('');
        })()}
      </table>
    `,
  });
}

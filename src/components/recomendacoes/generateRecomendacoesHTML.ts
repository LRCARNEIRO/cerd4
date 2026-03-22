/**
 * HTML generators for Recomendações sub-tabs export.
 */
import { generateTabReportHTML } from '@/utils/generateTabReportHTML';
import type { LacunaIdentificada, RespostaLacunaCerdIII } from '@/hooks/useLacunasData';

const statusLabels: Record<string, { label: string; icon: string }> = {
  cumprido: { label: 'Cumprido', icon: '✅' },
  parcialmente_cumprido: { label: 'Parcial', icon: '⚠️' },
  nao_cumprido: { label: 'Não Cumprido', icon: '❌' },
  retrocesso: { label: 'Retrocesso', icon: '🔴' },
  em_andamento: { label: 'Em Andamento', icon: '🔄' },
};

export function generateObservacoesFinaisHTML(): string {
  const indice = [
    { tema: 'Coleta de dados demográficos desagregados', paragrafo: '6', numRec: '1', prio: false },
    { tema: 'Implementação doméstica da Convenção', paragrafo: '8', numRec: '3 (a-c)', prio: false },
    { tema: 'Estrutura institucional', paragrafo: '10', numRec: '1', prio: false },
    { tema: 'Acesso à justiça', paragrafo: '12', numRec: '1', prio: false },
    { tema: 'Mulheres afro-brasileiras, indígenas e quilombolas', paragrafo: '14', numRec: '1', prio: false },
    { tema: 'Direito à saúde e COVID-19', paragrafo: '17', numRec: '6 (a-f)', prio: true },
    { tema: 'Disparidades no acesso à educação', paragrafo: '19', numRec: '3 (a-c)', prio: true },
    { tema: 'Pobreza, trabalho e renda', paragrafo: '23', numRec: '6 (a-f)', prio: true },
    { tema: 'Discriminação na moradia', paragrafo: '25', numRec: '1', prio: false },
    { tema: 'Representação política', paragrafo: '27', numRec: '3 (a-c)', prio: true },
    { tema: 'Medidas especiais', paragrafo: '29', numRec: '1', prio: false },
    { tema: 'Discurso de ódio racista', paragrafo: '31', numRec: '6 (a-f)', prio: false },
    { tema: 'Homicídios motivados pela raça', paragrafo: '33', numRec: '3 (a-c)', prio: true },
    { tema: 'Uso excessivo de força policial', paragrafo: '36', numRec: '8 (a-h)', prio: true },
    { tema: 'Justiça criminal', paragrafo: '38', numRec: '1', prio: false },
    { tema: 'Perfilamento racial', paragrafo: '40', numRec: '4 (a-d)', prio: false },
    { tema: 'Reunião pacífica', paragrafo: '42', numRec: '1', prio: false },
    { tema: 'Religiões afro-brasileiras', paragrafo: '44', numRec: '5 (a-e)', prio: false },
    { tema: 'Defensores de DH', paragrafo: '46', numRec: '1', prio: true },
    { tema: 'Desenvolvimento e meio-ambiente', paragrafo: '48', numRec: '5 (a-e)', prio: true },
    { tema: 'Comunidades indígenas e quilombolas', paragrafo: '50', numRec: '4 (a-d)', prio: true },
    { tema: 'Proteção legal de terras', paragrafo: '53', numRec: '1', prio: true },
    { tema: 'Imigrantes e refugiados', paragrafo: '55', numRec: '1', prio: false },
    { tema: 'Povos ciganos', paragrafo: '57', numRec: '1', prio: false },
    { tema: 'Combate a preconceitos históricos', paragrafo: '60', numRec: '5 (a-e)', prio: true },
  ];

  const tableRows = indice.map(r =>
    `<tr${r.prio ? ' style="background:#fefce8"' : ''}>
      <td>${r.tema}</td><td style="text-align:center;font-family:monospace">§${r.paragrafo}</td>
      <td style="text-align:center">${r.numRec}</td>
      <td style="text-align:center">${r.prio ? '<span class="badge badge-warning">Prioritária</span>' : ''}</td>
    </tr>`
  ).join('');

  return generateTabReportHTML({
    title: 'Observações Finais — CERD/C/BRA/CO/18-20',
    subtitle: 'Índice Completo de Recomendações ao Brasil (19/12/2022)',
    fileName: 'Observacoes-Finais-CERD',
    content: `
      <h2>Índice de Recomendações</h2>
      <p>${indice.length} temas com recomendações diretas, ${indice.filter(r => r.prio).length} prioritárias (§68-69).</p>
      <table>
        <tr><th>Tema</th><th>§</th><th>Nº Rec.</th><th>Status</th></tr>
        ${tableRows}
      </table>
      <div class="highlight-box" style="margin-top:1cm">
        <h4>⚠️ Follow-up obrigatório (§68)</h4>
        <p>O Brasil deveria ter respondido em 1 ano (até dez/2023) sobre: §17(a) saúde/COVID-19, §19(c) educação, §23(a) pobreza/trabalho e §36(a-d) uso de força policial. A resposta foi submetida em janeiro de 2026 (CERD/C/BRA/FCO/18-20).</p>
      </div>
    `,
  });
}

export function generateLacunasExportHTML(lacunas: LacunaIdentificada[], stats: any): string {
  const tableRows = (lacunas || []).map(l => {
    const st = statusLabels[l.status_cumprimento] || statusLabels.nao_cumprido;
    return `<tr>
      <td style="font-family:monospace">§${l.paragrafo}</td>
      <td>${l.tema}</td>
      <td>${l.eixo_tematico.replace(/_/g, ' ')}</td>
      <td>${st.icon} ${st.label}</td>
      <td>${l.prioridade}</td>
      <td style="font-size:8pt">${l.descricao_lacuna.substring(0, 200)}${l.descricao_lacuna.length > 200 ? '…' : ''}</td>
    </tr>`;
  }).join('');

  return generateTabReportHTML({
    title: 'Lacunas Identificadas — Recomendações ONU',
    subtitle: `${lacunas?.length || 0} lacunas mapeadas com análise de cumprimento`,
    fileName: 'Lacunas-ONU-CERD',
    content: `
      <div class="data-grid">
        <div class="data-card"><div class="data-card-value" style="color:#166534">${stats?.porStatus?.cumprido || 0}</div><div class="data-card-label">Cumpridas</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#92400e">${stats?.porStatus?.parcialmente_cumprido || 0}</div><div class="data-card-label">Parciais</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#991b1b">${stats?.porStatus?.nao_cumprido || 0}</div><div class="data-card-label">Não Cumpridas</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#7f1d1d">${stats?.porStatus?.retrocesso || 0}</div><div class="data-card-label">Retrocessos</div></div>
      </div>
      <h2>Todas as Lacunas (${lacunas?.length || 0})</h2>
      <table>
        <tr><th>§</th><th>Tema</th><th>Eixo</th><th>Status</th><th>Prior.</th><th>Descrição</th></tr>
        ${tableRows}
      </table>
    `,
  });
}

export function generateRespostasCerdIIIExportHTML(respostas: RespostaLacunaCerdIII[]): string {
  const porStatus: Record<string, number> = {};
  (respostas || []).forEach(r => { porStatus[r.grau_atendimento] = (porStatus[r.grau_atendimento] || 0) + 1; });

  const detailHTML = (respostas || []).map(r => {
    const st = statusLabels[r.grau_atendimento] || statusLabels.nao_cumprido;
    return `
      <div class="highlight-box" style="margin-bottom:0.3cm">
        <h4>§${r.paragrafo_cerd_iii} — ${st.icon} ${st.label}</h4>
        <p><strong>Crítica:</strong> ${r.critica_original}</p>
        <p><strong>Resposta:</strong> ${r.resposta_brasil}</p>
        ${r.justificativa_avaliacao ? `<p style="font-size:9pt;color:#64748b"><em>${r.justificativa_avaliacao}</em></p>` : ''}
      </div>`;
  }).join('');

  return generateTabReportHTML({
    title: 'Respostas CERD III — Balanço Analítico',
    subtitle: `${respostas?.length || 0} críticas analisadas`,
    fileName: 'Respostas-CERD-III',
    content: `
      <div class="data-grid">
        <div class="data-card"><div class="data-card-value" style="color:#166534">${porStatus.cumprido || 0}</div><div class="data-card-label">Atendidas</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#92400e">${porStatus.parcialmente_cumprido || 0}</div><div class="data-card-label">Parciais</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#991b1b">${porStatus.nao_cumprido || 0}</div><div class="data-card-label">Não Atendidas</div></div>
        <div class="data-card"><div class="data-card-value" style="color:#1e40af">${porStatus.em_andamento || 0}</div><div class="data-card-label">Em Andamento</div></div>
      </div>
      <h2>Análise Detalhada</h2>
      ${detailHTML}
    `,
  });
}

export function generateDurbanExportHTML(): string {
  const cruzamento = [
    { eixo: 'Legislação e Justiça', temas: ['Criminalização de discriminação racial (Plano §90)', 'Implementação da Convenção (CERD §7-8)', 'Acesso à justiça (CERD §11-12)'] },
    { eixo: 'Políticas Institucionais', temas: ['Instituições independentes de DDHH (Plano §90)', 'Ações Afirmativas (Decreto 11.785/2023)', 'MIR como ator estratégico'] },
    { eixo: 'Segurança Pública', temas: ['Desmilitarização policial (CERD §36a)', 'Câmeras corporais (CERD §34)', 'Perfilamento racial (RG 36 §35)'] },
    { eixo: 'Saúde', temas: ['COVID-19 racial (CERD §15-17)', 'Saúde reprodutiva (RG 37 §44)', 'Saúde mental (CERD §16f)'] },
    { eixo: 'Educação', temas: ['Cotas (CERD §18-19)', 'Educação antirracista (Plano §117)', 'Materiais didáticos (RG 34 §61)'] },
    { eixo: 'Terra e Território', temas: ['Demarcação de terras (CERD §51-53)', 'Marco Temporal', 'Yanomami (CERD §49a)'] },
    { eixo: 'Trabalho e Renda', temas: ['Pobreza extrema (CERD §20-23)', 'Discriminação trabalhista (RG 34 §53)', 'Migrantes indígenas (RG 38 §57)'] },
    { eixo: 'Cultura e Patrimônio', temas: ['Religiões afro (CERD §43-44)', 'Identidade cultural (RG 34 §4b)', 'Memória e verdade (RG 35 §35)'] },
  ];

  return generateTabReportHTML({
    title: 'Declaração e Plano de Ação de Durban',
    subtitle: 'Cruzamento com Recomendações Gerais e Observações Finais ao Brasil',
    fileName: 'Durban-Cruzamento',
    content: `
      <h2>Cruzamento: Durban × RGs × Observações Finais</h2>
      <p>Mapeamento dos temas da agenda de Durban com as Recomendações Gerais e Observações Finais ao Brasil (CERD/C/BRA/CO/18-20).</p>
      ${cruzamento.map(c => `
        <h3>${c.eixo}</h3>
        <ul>${c.temas.map(t => `<li>${t}</li>`).join('')}</ul>
      `).join('')}
    `,
  });
}

export function generateRecomendacoesGeraisHTML(): string {
  const rgs = [
    { num: 'RG 23', ano: 1997, titulo: 'Direitos dos Povos Indígenas' },
    { num: 'RG 31', ano: 2005, titulo: 'Prevenção à Discriminação no Sistema de Justiça Criminal' },
    { num: 'RG 34', ano: 2011, titulo: 'Discriminação Racial contra Afrodescendentes' },
    { num: 'RG 35', ano: 2013, titulo: 'Combate ao Discurso de Ódio Racista' },
    { num: 'RG 36', ano: 2020, titulo: 'Combate ao Perfilamento Racial' },
    { num: 'RG 37', ano: 2024, titulo: 'Igualdade no Direito à Saúde' },
    { num: 'RG 38', ano: 2025, titulo: 'Combate à Xenofobia contra Imigrantes' },
  ];

  return generateTabReportHTML({
    title: 'Recomendações Gerais do CERD',
    subtitle: 'Parâmetros normativos que orientam a análise do cumprimento da ICERD pelo Brasil',
    fileName: 'Recomendacoes-Gerais-CERD',
    content: `
      <h2>Recomendações Gerais Aplicáveis</h2>
      <table>
        <tr><th>Nº</th><th>Ano</th><th>Título</th></tr>
        ${rgs.map(r => `<tr><td style="font-family:monospace">${r.num}</td><td>${r.ano}</td><td>${r.titulo}</td></tr>`).join('')}
      </table>
      <p style="margin-top:1cm;font-style:italic;color:#64748b">Para o texto completo de cada Recomendação Geral, consulte o sistema online ou o site do OHCHR.</p>
    `,
  });
}

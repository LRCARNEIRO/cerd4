import type { LacunaIdentificada, IndicadorInterseccional } from '@/hooks/useLacunasData';
import { getExportToolbarHTML } from '@/utils/reportExportToolbar';
import {
  dadosDemograficos, indicadoresSocioeconomicos, educacaoSerieHistorica,
  saudeSerieHistorica, segurancaPublica, povosTradicionais
} from '@/components/estatisticas/StatisticsData';
import {
  tabelasDemograficas, tabelasEconomicas, tabelasEducacao,
  tabelasSaude, tabelasTrabalho, tabelasPobreza,
  tabelasSeguranca, tabelasHabitacao, tabelasSistemaPolitico,
  tabelasMoradia,
  type CommonCoreTable
} from '@/components/estatisticas/CommonCoreTab';

const STYLES = `
@page { size: A4; margin: 2.5cm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Open Sans', sans-serif; font-size: 10pt; line-height: 1.5; color: #1a1a2e; max-width: 21cm; margin: 0 auto; padding: 2cm; background: white; }
.header { text-align: center; margin-bottom: 2cm; border-bottom: 3px solid #1e3a5f; padding-bottom: 1.5cm; }
.header h1 { font-family: 'Merriweather', serif; font-size: 18pt; font-weight: 700; color: #1e3a5f; text-transform: uppercase; letter-spacing: 1px; }
.header .subtitle { font-size: 14pt; margin-top: 0.5cm; color: #2c5282; }
.header .date { font-size: 12pt; margin-top: 0.5cm; font-style: italic; color: #64748b; }
.un-logo { text-align: center; font-size: 32pt; margin-bottom: 1cm; }
h2 { font-family: 'Merriweather', serif; font-size: 14pt; font-weight: 700; margin-top: 1.5cm; margin-bottom: 0.5cm; color: #1e3a5f; border-bottom: 2px solid #c7a82b; padding-bottom: 0.3cm; page-break-after: avoid; }
h3 { font-family: 'Merriweather', serif; font-size: 12pt; font-weight: 700; margin-top: 1cm; margin-bottom: 0.3cm; color: #2c5282; }
h4 { font-size: 11pt; font-weight: 600; margin-top: 0.8cm; margin-bottom: 0.2cm; color: #334155; }
p { text-align: justify; margin-bottom: 0.5cm; }
.section { margin-bottom: 1.5cm; page-break-inside: avoid; }
.highlight-box { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 0.6cm; margin: 0.5cm 0; border-left: 4px solid #1e3a5f; border-radius: 0 8px 8px 0; }
table { width: 100%; border-collapse: collapse; margin: 0.5cm 0; font-size: 9pt; }
th, td { border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; }
th { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; font-weight: 600; }
tr:nth-child(even) { background: #f8fafc; }
.badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 8pt; font-weight: 600; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-danger { background: #fee2e2; color: #991b1b; }
.data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5cm; margin: 0.5cm 0; }
.data-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.5cm; text-align: center; }
.data-card-value { font-size: 20pt; font-weight: 700; color: #1e3a5f; }
.data-card-label { font-size: 8pt; color: #64748b; margin-top: 0.1cm; }
.trend-up { color: #22c55e; } .trend-down { color: #ef4444; } .trend-stable { color: #64748b; }
.footer { margin-top: 2cm; padding-top: 1cm; border-top: 2px solid #1e3a5f; font-size: 8pt; text-align: center; color: #64748b; }
.toc { margin: 1cm 0; padding: 0.8cm; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.toc h3 { margin-top: 0; color: #1e3a5f; }
.toc ul { list-style: none; padding-left: 0; }
.toc li { margin: 0.2cm 0; padding-left: 1cm; position: relative; font-size: 10pt; }
.toc li::before { content: "→"; position: absolute; left: 0; color: #c7a82b; }
ul, ol { margin-left: 1cm; margin-bottom: 0.5cm; }
li { margin-bottom: 0.2cm; }
.eixo-header { background: #1e3a5f; color: white; padding: 0.4cm 0.6cm; margin: 1cm 0 0.5cm 0; border-radius: 4px; }
.eixo-header h3 { color: white; margin: 0; font-size: 12pt; }
.table-meta { font-size: 8pt; color: #64748b; margin-top: 0.2cm; }
.table-meta a { color: #2563eb; text-decoration: underline; }
.print-instructions { background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); padding: 0.8cm; margin-bottom: 1cm; border: 1px solid #3b82f6; border-radius: 8px; }
.print-instructions strong { color: #1e40af; }
@media print { .print-instructions { display: none; } body { padding: 0; } }
`;

function formatNum(n: number): string {
  return n.toLocaleString('pt-BR');
}

function renderTable(t: CommonCoreTable): string {
  const trendIcon = t.tendencia === 'crescente' ? '↑' : t.tendencia === 'decrescente' ? '↓' : '→';
  const statusBadge = t.statusAtualizacao === 'atualizado'
    ? '<span class="badge badge-success">Atualizado</span>'
    : t.statusAtualizacao === 'parcial'
      ? '<span class="badge badge-warning">Parcial</span>'
      : '<span class="badge badge-danger">Desatualizado</span>';

  const headerCells = t.dados.headers.map(h => `<th>${h}</th>`).join('');
  const bodyRows = t.dados.rows.map(row =>
    `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
  ).join('');

  return `
    <div style="page-break-inside: avoid; margin-bottom: 0.8cm;">
      <h4>Tabela ${t.numero}: ${t.titulo} ${trendIcon} ${statusBadge}</h4>
      <p style="font-size: 9pt; font-style: italic; color: #475569; margin-bottom: 0.2cm;">${t.tituloIngles}</p>
      ${t.descricao ? `<p style="font-size: 9pt;">${t.descricao}</p>` : ''}
      <table>
        <thead><tr>${headerCells}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
      <div class="table-meta">
        <strong>Fonte:</strong> ${t.fonteCompleta || t.fonte}
        ${t.tabelaSidra ? ` | <strong>SIDRA:</strong> ${t.tabelaSidra}` : ''}
        | <strong>Período:</strong> ${t.periodoAtualizado}
        ${t.urlFonte ? ` | <a href="${t.urlFonte}" target="_blank">Ver fonte oficial</a>` : ''}
      </div>
      ${t.notas ? `<p style="font-size: 8pt; color: #92400e; margin-top: 0.2cm;"><em>Nota: ${t.notas}</em></p>` : ''}
    </div>
  `;
}

function renderEixo(titulo: string, numero: string, tabelas: CommonCoreTable[]): string {
  return `
    <div class="eixo-header"><h3>Eixo ${numero} — ${titulo} (${tabelas.length} tabelas)</h3></div>
    ${tabelas.map(t => renderTable(t)).join('')}
  `;
}

export function generateCommonCoreHTML(
  indicadores: IndicadorInterseccional[],
  lacunas: LacunaIdentificada[],
  stats: any,
  orcStats: any
): string {
  const eco2024 = indicadoresSocioeconomicos[indicadoresSocioeconomicos.length - 1];
  const seg2024 = segurancaPublica[segurancaPublica.length - 1];

  const cumpridas = stats?.porStatus?.cumprido || 0;
  const parciais = stats?.porStatus?.parcialmente_cumprido || 0;
  const naoCumpridas = stats?.porStatus?.nao_cumprido || 0;
  const total = stats?.total || 0;

  // Indicadores interseccionais by category
  const categorias: Record<string, IndicadorInterseccional[]> = {};
  indicadores.forEach(ind => {
    if (!categorias[ind.categoria]) categorias[ind.categoria] = [];
    categorias[ind.categoria].push(ind);
  });

  const catLabels: Record<string, string> = {
    seguranca_publica: 'Segurança Pública',
    educacao: 'Educação',
    saude: 'Saúde',
    trabalho_renda: 'Trabalho e Renda',
  };

  const indicadoresHTML = Object.entries(categorias).map(([cat, inds]) => {
    const rows = inds.map(ind => {
      const dados = ind.dados as Record<string, Record<string, number>>;
      const latest = dados['2024'] || dados['2023'] || {};
      const negro = latest.negro ?? latest.negra ?? 'N/D';
      const branco = latest.branco ?? latest.branca ?? 'N/D';
      const tendLabel = ind.tendencia === 'piora' ? '↑ piora' : ind.tendencia === 'melhoria' ? '↓ melhoria' : '→ estável';
      const tendClass = ind.tendencia === 'piora' ? 'trend-down' : ind.tendencia === 'melhoria' ? 'trend-up' : 'trend-stable';
      return `<tr>
        <td><strong>${ind.nome}</strong></td>
        <td>${ind.fonte}</td>
        <td>${negro}</td>
        <td>${branco}</td>
        <td class="${tendClass}">${tendLabel}</td>
      </tr>`;
    }).join('');

    const analise = inds.find(i => i.analise_interseccional)?.analise_interseccional || '';

    return `
      <h4>${catLabels[cat] || cat}</h4>
      <table>
        <thead><tr><th>Indicador</th><th>Fonte</th><th>Negros</th><th>Brancos</th><th>Tendência</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${analise ? `<div class="highlight-box"><h4>📈 Análise Interseccional</h4><p>${analise}</p></div>` : ''}
    `;
  }).join('');

  // Count all 77 tables
  const allTables = [
    ...tabelasDemograficas, ...tabelasEconomicas, ...tabelasEducacao,
    ...tabelasSaude, ...tabelasTrabalho, ...tabelasPobreza,
    ...tabelasSeguranca, ...tabelasHabitacao, ...tabelasSistemaPolitico,
    ...tabelasMoradia
  ];
  const totalTabelas = allTables.length;
  const atualizadas = allTables.filter(t => t.statusAtualizacao === 'atualizado').length;

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>HRI/CORE/BRA/2026 - Documento Básico Comum</title>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>${STYLES}</style>
</head>
<body>
  <div class="print-instructions">
    <strong>📄 Para salvar como PDF:</strong> Use Ctrl+P (ou Cmd+P no Mac) e selecione "Salvar como PDF" como destino.
    <br>
    <strong>📝 Para salvar como DOCX:</strong> Copie todo o conteúdo (Ctrl+A) e cole no Microsoft Word ou Google Docs.
  </div>

  <div class="header">
    <div class="un-logo">🇺🇳</div>
    <h1>Documento Básico Comum</h1>
    <div class="subtitle">HRI/CORE/BRA/2026</div>
    <div class="subtitle">Parte integrante dos relatórios dos Estados-partes</div>
    <div class="date">Brasil - Atualização 2018-2026</div>
  </div>

  <div class="toc">
    <h3>Sumário</h3>
    <ul>
      <li><strong>I.</strong> Informações gerais sobre o Estado</li>
      <li><strong>II.</strong> Marco geral de proteção e promoção dos direitos humanos</li>
      <li><strong>III.</strong> Informações sobre não discriminação e igualdade</li>
      <li><strong>IV.</strong> Dados Estatísticos Desagregados — ${totalTabelas} Tabelas em 9 Dimensões</li>
      <li style="padding-left: 2cm;">IV.1 Demografia (${tabelasDemograficas.length})</li>
      <li style="padding-left: 2cm;">IV.2 Economia (${tabelasEconomicas.length})</li>
      <li style="padding-left: 2cm;">IV.3 Educação (${tabelasEducacao.length})</li>
      <li style="padding-left: 2cm;">IV.4 Saúde (${tabelasSaude.length})</li>
      <li style="padding-left: 2cm;">IV.5 Trabalho (${tabelasTrabalho.length})</li>
      <li style="padding-left: 2cm;">IV.6 Pobreza e Desigualdade (${tabelasPobreza.length})</li>
      <li style="padding-left: 2cm;">IV.7 Segurança Pública (${tabelasSeguranca.length})</li>
      <li style="padding-left: 2cm;">IV.8 Sistema Eleitoral (${tabelasHabitacao.length})</li>
      <li style="padding-left: 2cm;">IV.9 Participação Social (${tabelasSistemaPolitico.length})</li>
      <li style="padding-left: 2cm;">IV.10 Habitação e Moradia — Art. V(e)(iii) (${tabelasMoradia.length})</li>
      <li><strong>Anexos:</strong> Indicadores interseccionais e análise CERD</li>
    </ul>
  </div>

  <h2>I. Informações Gerais sobre o Estado</h2>
  <div class="section">
    <h3>A. Características demográficas, econômicas, sociais e culturais</h3>
    <div class="highlight-box">
      <h4>📊 População (Censo 2022 - IBGE)</h4>
      <p>O Censo 2022 representa um marco histórico na coleta de dados demográficos brasileiros, 
      incluindo pela primeira vez categorias específicas para comunidades quilombolas e povos ciganos.</p>
    </div>
    <table>
      <thead><tr><th>Categoria</th><th>População</th><th>Percentual</th><th>Observação</th></tr></thead>
      <tbody>
        <tr><td><strong>População Total</strong></td><td>${formatNum(dadosDemograficos.populacaoTotal)}</td><td>100%</td><td>Base censitária 2022</td></tr>
        <tr><td><strong>Negros (Pretos e Pardos)</strong></td><td>${formatNum(dadosDemograficos.populacaoNegra)}</td><td>${dadosDemograficos.percentualNegro}%</td><td>Maioria da população</td></tr>
        <tr><td><strong>Brancos</strong></td><td>${formatNum(dadosDemograficos.composicaoRacial[1].populacao)}</td><td>${dadosDemograficos.composicaoRacial[1].percentual}%</td><td>-</td></tr>
        <tr><td><strong>Povos Indígenas</strong></td><td>${formatNum(povosTradicionais.indigenas.populacaoPessoasIndigenas)}</td><td>0,83%</td><td>${povosTradicionais.indigenas.etnias} etnias, ${povosTradicionais.indigenas.linguas} línguas</td></tr>
        <tr><td><strong>Quilombolas</strong></td><td>${formatNum(povosTradicionais.quilombolas.populacao)}</td><td>0,65%</td><td>Primeira contagem censitária</td></tr>
        <tr><td><strong>Povos Ciganos</strong></td><td>~${formatNum(povosTradicionais.ciganos.populacaoEstimada)}</td><td>0,02%</td><td>Estimativa (subnotificação)</td></tr>
      </tbody>
    </table>

    <h3>B. Indicadores Socioeconômicos (2024)</h3>
    <div class="data-grid">
      <div class="data-card">
        <div class="data-card-value">R$ ${formatNum(eco2024.rendaMediaNegra)}</div>
        <div class="data-card-label">Renda média mensal negra</div>
      </div>
      <div class="data-card">
        <div class="data-card-value">R$ ${formatNum(eco2024.rendaMediaBranca)}</div>
        <div class="data-card-label">Renda média mensal branca</div>
      </div>
      <div class="data-card">
        <div class="data-card-value" style="color:#ef4444">${(eco2024.rendaMediaBranca / eco2024.rendaMediaNegra).toFixed(2)}x</div>
        <div class="data-card-label">Razão renda branca/negra</div>
      </div>
      <div class="data-card">
        <div class="data-card-value">${eco2024.desempregoNegro}%</div>
        <div class="data-card-label">Desemprego negro</div>
      </div>
    </div>
  </div>

  <h2>II. Marco Geral de Proteção e Promoção dos Direitos Humanos</h2>
  <div class="section">
    <h3>A. Marco Institucional (2018-2025)</h3>
    <div class="highlight-box">
      <h4>🏛️ Período 2023-2025: Reconstrução Institucional</h4>
      <ul>
        <li><strong>Ministério da Igualdade Racial (MIR)</strong> - Criado em janeiro de 2023</li>
        <li><strong>Ministério dos Povos Indígenas (MPI)</strong> - Criado em janeiro de 2023</li>
        <li><strong>Crescimento orçamentário:</strong> ${orcStats?.variacao ? `${orcStats.variacao.toFixed(0)}%` : 'N/D'} em relação ao período 2018-2022</li>
        <li><strong>Demarcação de terras:</strong> 11 territórios indígenas homologados</li>
      </ul>
    </div>
    <table>
      <thead><tr><th>Lei/Decreto</th><th>Ano</th><th>Objeto</th></tr></thead>
      <tbody>
        <tr><td>Lei 14.532</td><td>2023</td><td>Equipara injúria racial a crime de racismo (2-5 anos)</td></tr>
        <tr><td>Lei 14.723</td><td>2023</td><td>Renova cotas no ensino superior por mais 10 anos</td></tr>
        <tr><td>Decreto 11.956</td><td>2024</td><td>Institui Programa Juventude Negra Viva</td></tr>
        <tr><td>Decreto 11.786</td><td>2023</td><td>Política Nacional de Gestão Territorial Quilombola (PNGTAQ)</td></tr>
      </tbody>
    </table>
  </div>

  <h2>III. Informações sobre Não Discriminação, Igualdade e Recursos Efetivos</h2>
  <div class="section">
    <h3>A. Cumprimento das Recomendações do CERD</h3>
    <div class="data-grid">
      <div class="data-card"><div class="data-card-value">${total}</div><div class="data-card-label">Recomendações Analisadas</div></div>
      <div class="data-card"><div class="data-card-value" style="color:#22c55e">${cumpridas}</div><div class="data-card-label">Cumpridas</div></div>
      <div class="data-card"><div class="data-card-value" style="color:#eab308">${parciais}</div><div class="data-card-label">Parcialmente Cumpridas</div></div>
      <div class="data-card"><div class="data-card-value" style="color:#ef4444">${naoCumpridas}</div><div class="data-card-label">Não Cumpridas</div></div>
    </div>

    <h3>B. Indicadores Interseccionais por Categoria</h3>
    ${indicadoresHTML}
  </div>

  <h2>IV. Dados Estatísticos Desagregados — ${totalTabelas} Tabelas Oficiais</h2>
  <div class="section">
    <div class="highlight-box">
      <h4>📋 Resumo das ${totalTabelas} Tabelas do Common Core</h4>
      <p>${atualizadas} tabelas atualizadas (${Math.round(atualizadas/totalTabelas*100)}%) | Fontes: IBGE/SIDRA, DataSUS, INEP, FBSP, TSE, MDS/SUAS, BCB</p>
      <p>Período de cobertura: 1980-2024 | Dados mais recentes: 2023/2024</p>
    </div>

    ${renderEixo('Características Demográficas', 'I', tabelasDemograficas)}
    ${renderEixo('Características Econômicas', 'II', tabelasEconomicas)}
    ${renderEixo('Educação', 'III', tabelasEducacao)}
    ${renderEixo('Saúde', 'IV', tabelasSaude)}
    ${renderEixo('Trabalho e Previdência', 'V', tabelasTrabalho)}
    ${renderEixo('Pobreza e Desigualdade', 'VI', tabelasPobreza)}
    ${renderEixo('Segurança Pública', 'VII', tabelasSeguranca)}
    ${renderEixo('Sistema Eleitoral', 'VIII', tabelasHabitacao)}
    ${renderEixo('Participação Social', 'IX', tabelasSistemaPolitico)}
    ${renderEixo('Habitação e Moradia — Art. V(e)(iii) ICERD', 'X', tabelasMoradia)}
  </div>

  <div class="footer">
    <p>HRI/CORE/BRA/2026 — Documento Básico Comum do Brasil</p>
    <p>${totalTabelas} tabelas estatísticas oficiais em 9 dimensões temáticas</p>
    <p>Elaborado pelo Grupo de Pesquisa CDG/UFF em parceria com MIR e MRE</p>
    <p>Gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')} — Dados de fontes oficiais (IBGE, FBSP, DataSUS, SIOP)</p>
  </div>
  ${getExportToolbarHTML('Common-Core-HRI-CORE-BRA-2026')}
</body>
</html>`;
}

import type { LacunaIdentificada, IndicadorInterseccional } from '@/hooks/useLacunasData';
import {
  dadosDemograficos, indicadoresSocioeconomicos, educacaoSerieHistorica,
  saudeSerieHistorica, segurancaPublica, povosTradicionais
} from '@/components/estatisticas/StatisticsData';

const STYLES = `
@page { size: A4; margin: 2.5cm; }
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: 'Open Sans', sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a2e; max-width: 21cm; margin: 0 auto; padding: 2cm; background: white; }
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
.highlight-box { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 0.8cm; margin: 0.5cm 0; border-left: 4px solid #1e3a5f; border-radius: 0 8px 8px 0; }
table { width: 100%; border-collapse: collapse; margin: 0.5cm 0; font-size: 10pt; }
th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; }
th { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; font-weight: 600; }
tr:nth-child(even) { background: #f8fafc; }
.badge { display: inline-block; padding: 3px 10px; border-radius: 12px; font-size: 9pt; font-weight: 600; }
.badge-success { background: #dcfce7; color: #166534; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-danger { background: #fee2e2; color: #991b1b; }
.badge-info { background: #dbeafe; color: #1e40af; }
.data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1cm; margin: 0.5cm 0; }
.data-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.8cm; text-align: center; }
.data-card-value { font-size: 24pt; font-weight: 700; color: #1e3a5f; }
.data-card-label { font-size: 9pt; color: #64748b; margin-top: 0.2cm; }
.trend-up { color: #22c55e; } .trend-down { color: #ef4444; } .trend-stable { color: #64748b; }
.footer { margin-top: 2cm; padding-top: 1cm; border-top: 2px solid #1e3a5f; font-size: 9pt; text-align: center; color: #64748b; }
.toc { margin: 1cm 0; padding: 1cm; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
.toc h3 { margin-top: 0; color: #1e3a5f; }
.toc ul { list-style: none; padding-left: 0; }
.toc li { margin: 0.3cm 0; padding-left: 1cm; position: relative; }
.toc li::before { content: "→"; position: absolute; left: 0; color: #c7a82b; }
ul, ol { margin-left: 1cm; margin-bottom: 0.5cm; }
li { margin-bottom: 0.2cm; }
.print-instructions { background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%); padding: 1cm; margin-bottom: 1cm; border: 1px solid #3b82f6; border-radius: 8px; }
.print-instructions strong { color: #1e40af; }
@media print { .print-instructions { display: none; } body { padding: 0; } }
`;

function formatNum(n: number): string {
  return n.toLocaleString('pt-BR');
}

export function generateCommonCoreHTML(
  indicadores: IndicadorInterseccional[],
  lacunas: LacunaIdentificada[],
  stats: any,
  orcStats: any
): string {
  const eco2024 = indicadoresSocioeconomicos[indicadoresSocioeconomicos.length - 1];
  const edu2024 = educacaoSerieHistorica[educacaoSerieHistorica.length - 1];
  const seg2024 = segurancaPublica[segurancaPublica.length - 1];
  const saude2024 = saudeSerieHistorica[saudeSerieHistorica.length - 1];

  const cumpridas = stats?.porStatus?.cumprido || 0;
  const parciais = stats?.porStatus?.parcialmente_cumprido || 0;
  const naoCumpridas = stats?.porStatus?.nao_cumprido || 0;
  const total = stats?.total || 0;

  // Build indicadores by category
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
      <h3>${catLabels[cat] || cat}</h3>
      <table>
        <thead><tr><th>Indicador</th><th>Fonte</th><th>Negros</th><th>Brancos</th><th>Tendência</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${analise ? `<div class="highlight-box"><h4>📈 Análise Interseccional</h4><p>${analise}</p></div>` : ''}
    `;
  }).join('');

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
      <li><strong>IV.</strong> Dados estatísticos desagregados</li>
      <li><strong>Anexos:</strong> Indicadores interseccionais e gráficos</li>
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
    <h3>A. Marco Institucional (2018-2026)</h3>
    <p>O período 2018-2026 registrou mudanças institucionais significativas no marco brasileiro de promoção da igualdade racial:</p>
    <div class="highlight-box">
      <h4>🏛️ Período 2023-2026: Reconstrução Institucional</h4>
      <ul>
        <li><strong>Ministério da Igualdade Racial (MIR)</strong> - Criado em janeiro de 2023</li>
        <li><strong>Ministério dos Povos Indígenas (MPI)</strong> - Criado em janeiro de 2023</li>
        <li><strong>Crescimento orçamentário:</strong> ${orcStats?.variacao ? `${orcStats.variacao.toFixed(0)}%` : 'N/D'} em relação ao período 2018-2022</li>
        <li><strong>Demarcação de terras:</strong> 11 territórios indígenas homologados</li>
      </ul>
    </div>
    <h4>Principais marcos legislativos</h4>
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
    <table>
      <thead><tr><th>Status</th><th>Quantidade</th><th>Percentual</th></tr></thead>
      <tbody>
        <tr><td><span class="badge badge-success">Cumprido</span></td><td>${cumpridas}</td><td>${total > 0 ? Math.round(cumpridas/total*100) : 0}%</td></tr>
        <tr><td><span class="badge badge-warning">Parcialmente Cumprido</span></td><td>${parciais}</td><td>${total > 0 ? Math.round(parciais/total*100) : 0}%</td></tr>
        <tr><td><span class="badge badge-danger">Não Cumprido</span></td><td>${naoCumpridas}</td><td>${total > 0 ? Math.round(naoCumpridas/total*100) : 0}%</td></tr>
      </tbody>
    </table>
  </div>

  <h2>IV. Dados Estatísticos Desagregados</h2>
  <div class="section">
    <p>Em resposta à solicitação do Comitê por dados desagregados abrangentes (parágrafo 7 das observações finais), o Brasil apresenta os seguintes indicadores interseccionais:</p>
    ${indicadoresHTML}

    <h3>Educação (Dados do Escopo)</h3>
    <table>
      <thead><tr><th>Indicador</th><th>Negro 2024</th><th>Branco 2024</th><th>Tendência</th></tr></thead>
      <tbody>
        <tr><td>Ensino Superior Completo (%)</td><td>${edu2024.superiorNegroPercent}%</td><td>${edu2024.superiorBrancoPercent}%</td><td class="trend-up">↑ melhoria</td></tr>
        <tr><td>Analfabetismo (%)</td><td>${edu2024.analfabetismoNegro}%</td><td>${edu2024.analfabetismoBranco}%</td><td class="trend-up">↓ decrescente</td></tr>
      </tbody>
    </table>

    <h3>Segurança Pública (Dados do Escopo)</h3>
    <table>
      <thead><tr><th>Indicador</th><th>2024</th><th>Tendência</th></tr></thead>
      <tbody>
        <tr><td>Vítimas negras de homicídio (%)</td><td>${seg2024.percentualVitimasNegras}%</td><td class="trend-down">↑ piora</td></tr>
        <tr><td>Letalidade policial negra (%)</td><td>${seg2024.letalidadePolicial}%</td><td class="trend-down">↑ piora</td></tr>
        <tr><td>Risco homicídio negro (razão)</td><td>${seg2024.razaoRisco}x</td><td class="trend-stable">→ estável</td></tr>
      </tbody>
    </table>

    <h3>Saúde (Dados do Escopo)</h3>
    <table>
      <thead><tr><th>Indicador</th><th>Negra 2024</th><th>Branca 2024</th><th>Tendência</th></tr></thead>
      <tbody>
        <tr><td>Mortalidade materna (por 100 mil NV)</td><td>${saude2024.mortalidadeMaternaNegra}</td><td>${saude2024.mortalidadeMaternaBranca}</td><td class="trend-up">↓ melhoria</td></tr>
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>HRI/CORE/BRA/2026 — Documento Básico Comum do Brasil</p>
    <p>Elaborado pelo Grupo de Pesquisa CDG/UFF em parceria com MIR e MRE</p>
    <p>Gerado automaticamente em ${new Date().toLocaleDateString('pt-BR')} — Dados de fontes oficiais (IBGE, FBSP, DataSUS, SIOP)</p>
  </div>
</body>
</html>`;
}

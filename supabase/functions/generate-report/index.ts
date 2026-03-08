import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ReportRequest {
  type: 'common-core' | 'cerd-iv';
  format: 'pdf' | 'docx' | 'html';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log(`Authenticated user: ${claimsData.claims.sub}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, format } = await req.json() as ReportRequest;

    // Input validation
    const validTypes = ['common-core', 'cerd-iv'];
    const validFormats = ['pdf', 'docx', 'html'];
    if (!type || !validTypes.includes(type)) {
      return new Response(JSON.stringify({ error: 'Invalid type parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (format && !validFormats.includes(format)) {
      return new Response(JSON.stringify({ error: 'Invalid format parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Gerando relatório ${type} em formato ${format}`);

    const [lacunasResult, respostasResult, conclusoesResult, indicadoresResult] = await Promise.all([
      supabase.from('lacunas_identificadas').select('*').order('paragrafo'),
      supabase.from('respostas_lacunas_cerd_iii').select('*').order('paragrafo_cerd_iii'),
      supabase.from('conclusoes_analiticas').select('*').order('created_at'),
      supabase.from('indicadores_interseccionais').select('*').order('categoria'),
    ]);

    if (lacunasResult.error) throw lacunasResult.error;
    if (respostasResult.error) throw respostasResult.error;
    if (conclusoesResult.error) throw conclusoesResult.error;
    if (indicadoresResult.error) throw indicadoresResult.error;

    const lacunas = lacunasResult.data || [];
    const respostas = respostasResult.data || [];
    const conclusoes = conclusoesResult.data || [];
    const indicadores = indicadoresResult.data || [];

    console.log(`Dados: ${lacunas.length} lacunas, ${respostas.length} respostas, ${conclusoes.length} conclusões, ${indicadores.length} indicadores`);

    let htmlContent = '';
    let title = '';

    if (type === 'common-core') {
      title = 'HRI/CORE/BRA/2026 - Documento Básico Comum';
      htmlContent = generateCommonCoreHTML(lacunas, indicadores, conclusoes);
    } else {
      title = 'CERD/C/BRA/21-23 - Relatório Periódico';
      htmlContent = generateCERDIVHTML(lacunas, respostas, conclusoes, indicadores);
    }

    const fullHTML = generateFullHTML(title, htmlContent, type, indicadores, lacunas);

    return new Response(fullHTML, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao gerar relatório:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateFullHTML(title: string, content: string, type: string, indicadores: any[], lacunas: any[]): string {
  const chartScripts = generateChartScripts(indicadores, lacunas, type);
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page {
      size: A4;
      margin: 2.5cm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Open Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a2e;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 2cm;
      border-bottom: 3px solid #1e3a5f;
      padding-bottom: 1.5cm;
    }
    
    .header h1 {
      font-family: 'Merriweather', serif;
      font-size: 18pt;
      font-weight: 700;
      margin: 0;
      color: #1e3a5f;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .header .subtitle {
      font-size: 14pt;
      margin-top: 0.5cm;
      color: #2c5282;
    }
    
    .header .date {
      font-size: 12pt;
      margin-top: 0.5cm;
      font-style: italic;
      color: #64748b;
    }
    
    .un-logo {
      text-align: center;
      font-size: 32pt;
      margin-bottom: 1cm;
    }
    
    h2 {
      font-family: 'Merriweather', serif;
      font-size: 14pt;
      font-weight: 700;
      margin-top: 1.5cm;
      margin-bottom: 0.5cm;
      color: #1e3a5f;
      border-bottom: 2px solid #c7a82b;
      padding-bottom: 0.3cm;
      page-break-after: avoid;
    }
    
    h3 {
      font-family: 'Merriweather', serif;
      font-size: 12pt;
      font-weight: 700;
      margin-top: 1cm;
      margin-bottom: 0.3cm;
      color: #2c5282;
    }
    
    h4 {
      font-size: 11pt;
      font-weight: 600;
      margin-top: 0.8cm;
      margin-bottom: 0.2cm;
      color: #334155;
    }
    
    p {
      text-align: justify;
      margin-bottom: 0.5cm;
    }
    
    .paragraph-ref {
      font-weight: 700;
      color: #1e3a5f;
      font-family: monospace;
      background: #f1f5f9;
      padding: 2px 6px;
      border-radius: 4px;
    }
    
    .section {
      margin-bottom: 1.5cm;
      page-break-inside: avoid;
    }
    
    .highlight-box {
      background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
      padding: 0.8cm;
      margin: 0.5cm 0;
      border-left: 4px solid #1e3a5f;
      border-radius: 0 8px 8px 0;
    }
    
    .recommendation {
      background: #f8fafc;
      padding: 0.5cm;
      margin: 0.5cm 0;
      border-left: 4px solid #64748b;
      border-radius: 0 4px 4px 0;
    }
    
    .response {
      background: #ecfdf5;
      padding: 0.5cm;
      margin: 0.5cm 0;
      border-left: 4px solid #22c55e;
      border-radius: 0 4px 4px 0;
    }
    
    .gap {
      background: #fffbeb;
      padding: 0.5cm;
      margin: 0.5cm 0;
      border-left: 4px solid #eab308;
      border-radius: 0 4px 4px 0;
    }
    
    .critical {
      background: #fef2f2;
      padding: 0.5cm;
      margin: 0.5cm 0;
      border-left: 4px solid #ef4444;
      border-radius: 0 4px 4px 0;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.5cm 0;
      font-size: 10pt;
    }
    
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
    }
    
    th {
      background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%);
      color: white;
      font-weight: 600;
    }
    
    tr:nth-child(even) {
      background: #f8fafc;
    }
    
    tr:hover {
      background: #e2e8f0;
    }
    
    .status-cumprido { color: #166534; font-weight: 600; }
    .status-parcial { color: #ca8a04; font-weight: 600; }
    .status-nao-cumprido { color: #dc2626; font-weight: 600; }
    
    .badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 12px;
      font-size: 9pt;
      font-weight: 600;
    }
    
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    
    .footer {
      margin-top: 2cm;
      padding-top: 1cm;
      border-top: 2px solid #1e3a5f;
      font-size: 9pt;
      text-align: center;
      color: #64748b;
    }
    
    .toc {
      margin: 1cm 0;
      padding: 1cm;
      background: #f8fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    
    .toc h3 {
      margin-top: 0;
      color: #1e3a5f;
    }
    
    .toc ul {
      list-style: none;
      padding-left: 0;
    }
    
    .toc li {
      margin: 0.3cm 0;
      padding-left: 1cm;
      position: relative;
    }
    
    .toc li::before {
      content: "→";
      position: absolute;
      left: 0;
      color: #c7a82b;
    }
    
    .chart-container {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1cm;
      margin: 0.5cm 0;
      page-break-inside: avoid;
    }
    
    .chart-title {
      font-weight: 600;
      color: #1e3a5f;
      margin-bottom: 0.5cm;
      text-align: center;
    }
    
    .chart-wrapper {
      position: relative;
      height: 300px;
      max-height: 300px;
    }
    
    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1cm;
      margin: 0.5cm 0;
    }
    
    .data-card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 0.8cm;
      text-align: center;
    }
    
    .data-card-value {
      font-size: 24pt;
      font-weight: 700;
      color: #1e3a5f;
    }
    
    .data-card-label {
      font-size: 9pt;
      color: #64748b;
      margin-top: 0.2cm;
    }
    
    .data-card-trend {
      font-size: 10pt;
      margin-top: 0.2cm;
    }
    
    .trend-up { color: #22c55e; }
    .trend-down { color: #ef4444; }
    .trend-stable { color: #64748b; }
    
    .print-instructions {
      background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
      padding: 1cm;
      margin-bottom: 1cm;
      border: 1px solid #3b82f6;
      border-radius: 8px;
    }
    
    .print-instructions strong {
      color: #1e40af;
    }
    
    ul, ol {
      margin-left: 1cm;
      margin-bottom: 0.5cm;
    }
    
    li {
      margin-bottom: 0.2cm;
    }
    
    @media print {
      .print-instructions { display: none; }
      body { padding: 0; }
      .chart-wrapper { max-height: 250px; }
    }
  </style>
</head>
<body>
  <div class="print-instructions">
    <strong>📄 Para salvar como PDF:</strong> Use Ctrl+P (ou Cmd+P no Mac) e selecione "Salvar como PDF" como destino.
    <br>
    <strong>📝 Para salvar como DOCX:</strong> Copie todo o conteúdo (Ctrl+A) e cole no Microsoft Word ou Google Docs.
  </div>
  
  ${content}
  
  <div class="footer">
    <p><strong>Documento gerado automaticamente pelo Sistema de Monitoramento CERD Brasil</strong></p>
    <p>Data de geração: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    <p style="margin-top: 0.5cm;">
      <strong>CDG/UFF</strong> • Grupo de Pesquisa sobre Tratados de Direitos Humanos
      <br>
      <strong>MIR</strong> • Ministério da Igualdade Racial
      <br>
      <strong>MRE</strong> • Ministério das Relações Exteriores
    </p>
  </div>
  
  <script>
    ${chartScripts}
  </script>
</body>
</html>`;
}

function generateChartScripts(indicadores: any[], lacunas: any[], type: string): string {
  // Prepare data for charts
  const statusCounts = {
    cumprido: lacunas.filter(l => l.status_cumprimento === 'cumprido').length,
    parcial: lacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length,
    naoCumprido: lacunas.filter(l => l.status_cumprimento === 'nao_cumprido').length,
    retrocesso: lacunas.filter(l => l.status_cumprimento === 'retrocesso').length,
  };

  const eixoCounts: Record<string, number> = {};
  lacunas.forEach(l => {
    eixoCounts[l.eixo_tematico] = (eixoCounts[l.eixo_tematico] || 0) + 1;
  });

  const eixoLabels: Record<string, string> = {
    legislacao_justica: 'Legislação',
    politicas_institucionais: 'Políticas',
    seguranca_publica: 'Segurança',
    saude: 'Saúde',
    educacao: 'Educação',
    trabalho_renda: 'Trabalho',
    terra_territorio: 'Território',
    cultura_patrimonio: 'Cultura',
    participacao_social: 'Participação',
    dados_estatisticas: 'Dados'
  };

  // Extract indicator data for charts
  const indicadorData = indicadores.slice(0, 6).map(ind => {
    const dados = ind.dados || {};
    return {
      nome: ind.nome,
      negros: extractLatestValue(dados.negros || dados.negras),
      brancos: extractLatestValue(dados.brancos || dados.brancas),
    };
  }).filter(d => d.negros !== null && d.brancos !== null);

  return `
    document.addEventListener('DOMContentLoaded', function() {
      // Gráfico de Status de Cumprimento
      const statusCtx = document.getElementById('statusChart');
      if (statusCtx) {
        new Chart(statusCtx, {
          type: 'doughnut',
          data: {
            labels: ['Cumprido', 'Parcialmente Cumprido', 'Não Cumprido', 'Retrocesso'],
            datasets: [{
              data: [${statusCounts.cumprido}, ${statusCounts.parcial}, ${statusCounts.naoCumprido}, ${statusCounts.retrocesso}],
              backgroundColor: ['#22c55e', '#eab308', '#ef4444', '#991b1b'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { padding: 20, font: { size: 11 } }
              }
            }
          }
        });
      }
      
      // Gráfico por Eixo Temático
      const eixoCtx = document.getElementById('eixoChart');
      if (eixoCtx) {
        new Chart(eixoCtx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(Object.keys(eixoCounts).map(k => eixoLabels[k] || k))},
            datasets: [{
              label: 'Recomendações',
              data: ${JSON.stringify(Object.values(eixoCounts))},
              backgroundColor: 'rgba(30, 58, 95, 0.8)',
              borderColor: '#1e3a5f',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              y: { beginAtZero: true, ticks: { stepSize: 1 } }
            }
          }
        });
      }
      
      // Gráfico Comparativo de Indicadores
      const indicadorCtx = document.getElementById('indicadorChart');
      if (indicadorCtx) {
        new Chart(indicadorCtx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(indicadorData.map(d => d.nome.substring(0, 20) + (d.nome.length > 20 ? '...' : '')))},
            datasets: [
              {
                label: 'Negros',
                data: ${JSON.stringify(indicadorData.map(d => d.negros))},
                backgroundColor: 'rgba(30, 58, 95, 0.8)',
                borderColor: '#1e3a5f',
                borderWidth: 1
              },
              {
                label: 'Brancos',
                data: ${JSON.stringify(indicadorData.map(d => d.brancos))},
                backgroundColor: 'rgba(199, 168, 43, 0.8)',
                borderColor: '#c7a82b',
                borderWidth: 1
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { padding: 15 }
              }
            },
            scales: {
              y: { beginAtZero: true }
            }
          }
        });
      }
    });
  `;
}

function extractLatestValue(data: any): number | null {
  if (!data) return null;
  const years = Object.keys(data).sort().reverse();
  return years.length > 0 ? data[years[0]] : null;
}

function generateCommonCoreHTML(lacunas: any[], indicadores: any[], conclusoes: any[]): string {
  const stats = {
    total: lacunas.length,
    cumpridas: lacunas.filter(l => l.status_cumprimento === 'cumprido').length,
    parciais: lacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length,
    naoCumpridas: lacunas.filter(l => l.status_cumprimento === 'nao_cumprido').length,
  };

  const taxaCumprimento = stats.total > 0 
    ? Math.round(((stats.cumpridas * 100) + (stats.parciais * 50)) / stats.total) 
    : 0;

  // Group indicators by category
  const indicadoresPorCategoria: Record<string, any[]> = {};
  indicadores.forEach(ind => {
    if (!indicadoresPorCategoria[ind.categoria]) {
      indicadoresPorCategoria[ind.categoria] = [];
    }
    indicadoresPorCategoria[ind.categoria].push(ind);
  });

  return `
    <div class="header">
      <div class="un-logo">🇺🇳</div>
      <h1>Documento Básico Comum</h1>
      <div class="subtitle">HRI/CORE/BRA/2025</div>
      <div class="subtitle">Parte integrante dos relatórios dos Estados-partes</div>
      <div class="date">Brasil - Atualização 2018-2025</div>
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
        <h4>📊 População (SIDRA/IBGE - Censo 2022)</h4>
        <p>Fonte oficial: <a href="https://sidra.ibge.gov.br/Tabela/9605" target="_blank">SIDRA/IBGE Tabela 9605</a> - Divulgado em 22/12/2023</p>
        <p>O Censo 2022 representa um marco histórico na coleta de dados demográficos brasileiros, 
        incluindo pela primeira vez categorias específicas para comunidades quilombolas e povos ciganos.</p>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Categoria</th>
            <th>População</th>
            <th>Percentual</th>
            <th>Observação</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>População Total</strong></td>
            <td>203.080.756</td>
            <td>100%</td>
            <td>Censo 2022 - resultado definitivo</td>
          </tr>
          <tr>
            <td><strong>Pardos</strong></td>
            <td>92.083.286</td>
            <td>45,34%</td>
            <td>Pela 1ª vez desde 1991, maior grupo racial</td>
          </tr>
          <tr>
            <td><strong>Brancos</strong></td>
            <td>88.252.121</td>
            <td>43,46%</td>
            <td>Segundo maior grupo</td>
          </tr>
          <tr>
            <td><strong>Pretos</strong></td>
            <td>20.656.458</td>
            <td>10,17%</td>
            <td>Tabela 9605 (cor/raça)</td>
          </tr>
          <tr>
            <td><strong>Total Negros (Pretos + Pardos)</strong></td>
            <td>112.739.744</td>
            <td>55,51%</td>
            <td>Maioria da população brasileira</td>
          </tr>
          <tr>
            <td><strong>Povos Indígenas (cor/raça)</strong></td>
            <td>1.227.642</td>
            <td>0,60%</td>
            <td>Tabela 9605 - quesito cor ou raça</td>
          </tr>
          <tr>
            <td><strong>Povos Indígenas (contagem específica)</strong></td>
            <td>1.693.535</td>
            <td>0,83%</td>
            <td>Censo 2022 - pergunta específica (391 etnias, 295 línguas)</td>
          </tr>
          <tr>
            <td><strong>Quilombolas</strong></td>
            <td>1.327.802</td>
            <td>0,65%</td>
            <td>Primeira contagem censitária oficial (1.696 municípios)</td>
          </tr>
          <tr>
            <td><strong>Amarelos</strong></td>
            <td>850.130</td>
            <td>0,42%</td>
            <td>Tabela 9605</td>
          </tr>
        </tbody>
      </table>
      
      <p style="font-size: 9pt; color: #64748b; margin-top: 0.3cm;">
        <strong>Fontes oficiais SIDRA/IBGE:</strong><br>
        • Tabela 9605: <a href="https://sidra.ibge.gov.br/Tabela/9605" target="_blank">https://sidra.ibge.gov.br/Tabela/9605</a><br>
        • Indígenas: <a href="https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22326-indigenas-2.html" target="_blank">IBGE Educa - Indígenas</a><br>
        • Quilombolas: <a href="https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22327-quilombolas.html" target="_blank">IBGE Educa - Quilombolas</a>
      </p>
      
      <div class="highlight-box">
        <h4>📈 Dados de Desigualdade Racial (PNAD 2023-2024 - IBGE)</h4>
        <ul>
          <li><strong>Renda:</strong> Pessoas negras ganham em média 58,9% do que ganham pessoas brancas (R$ 2.199 vs R$ 3.730)</li>
          <li><strong>Analfabetismo:</strong> Taxa entre negros (6,9%) é mais que o dobro da de brancos (3,1%) - PNAD Educação 2024</li>
          <li><strong>Violência:</strong> Risco de homicídio para negros é 2,7x maior (Atlas da Violência 2025 - IPEA/FBSP)</li>
          <li><strong>Juventude:</strong> 73% dos óbitos por causas externas são de jovens negros (Fiocruz 2025)</li>
        </ul>
      </div>
    </div>

    <h2>II. Marco Geral de Proteção e Promoção dos Direitos Humanos</h2>
    
    <div class="section">
      <h3>A. Marco Institucional (2018-2025)</h3>
      
      <p>O período 2018-2025 registrou mudanças institucionais significativas no marco brasileiro 
      de promoção da igualdade racial:</p>
      
      <div class="highlight-box">
        <h4>🏛️ Período 2023-2025: Reconstrução Institucional</h4>
        <ul>
          <li><strong>Ministério da Igualdade Racial (MIR)</strong> - Criado em janeiro de 2023</li>
          <li><strong>Ministério dos Povos Indígenas (MPI)</strong> - Criado em janeiro de 2023</li>
          <li><strong>Crescimento orçamentário:</strong> 533% em relação ao período 2018-2022</li>
          <li><strong>Demarcação de terras:</strong> 11 territórios indígenas homologados</li>
        </ul>
      </div>
      
      <h4>Principais marcos legislativos</h4>
      <table>
        <thead>
          <tr>
            <th>Lei/Decreto</th>
            <th>Ano</th>
            <th>Objeto</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Lei 14.532</td>
            <td>2023</td>
            <td>Equipara injúria racial a crime de racismo (2-5 anos)</td>
          </tr>
          <tr>
            <td>Lei 14.723</td>
            <td>2023</td>
            <td>Renova cotas no ensino superior por mais 10 anos</td>
          </tr>
          <tr>
            <td>Decreto 11.956</td>
            <td>2024</td>
            <td>Institui Programa Juventude Negra Viva</td>
          </tr>
          <tr>
            <td>Decreto 11.786</td>
            <td>2023</td>
            <td>Política Nacional de Gestão Territorial Quilombola (PNGTAQ)</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>III. Informações sobre Não Discriminação, Igualdade e Recursos Efetivos</h2>
    
    <div class="section">
      <h3>A. Cumprimento das Recomendações do CERD</h3>
      
      <div class="data-grid">
        <div class="data-card">
          <div class="data-card-value">${stats.total}</div>
          <div class="data-card-label">Recomendações Analisadas</div>
        </div>
        <div class="data-card">
          <div class="data-card-value" style="color: #22c55e;">${stats.cumpridas}</div>
          <div class="data-card-label">Cumpridas</div>
        </div>
        <div class="data-card">
          <div class="data-card-value" style="color: #eab308;">${stats.parciais}</div>
          <div class="data-card-label">Parcialmente Cumpridas</div>
        </div>
        <div class="data-card">
          <div class="data-card-value" style="color: #ef4444;">${stats.naoCumpridas}</div>
          <div class="data-card-label">Não Cumpridas</div>
        </div>
      </div>
      
      <div class="chart-container">
        <div class="chart-title">Distribuição do Cumprimento das Recomendações</div>
        <div class="chart-wrapper">
          <canvas id="statusChart"></canvas>
        </div>
      </div>
      
      <table>
        <thead>
          <tr>
            <th>Status</th>
            <th>Quantidade</th>
            <th>Percentual</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><span class="badge badge-success">Cumprido</span></td>
            <td>${stats.cumpridas}</td>
            <td>${stats.total > 0 ? Math.round(stats.cumpridas / stats.total * 100) : 0}%</td>
          </tr>
          <tr>
            <td><span class="badge badge-warning">Parcialmente Cumprido</span></td>
            <td>${stats.parciais}</td>
            <td>${stats.total > 0 ? Math.round(stats.parciais / stats.total * 100) : 0}%</td>
          </tr>
          <tr>
            <td><span class="badge badge-danger">Não Cumprido</span></td>
            <td>${stats.naoCumpridas}</td>
            <td>${stats.total > 0 ? Math.round(stats.naoCumpridas / stats.total * 100) : 0}%</td>
          </tr>
        </tbody>
      </table>
    </div>

    <h2>IV. Dados Estatísticos Desagregados</h2>
    
    <div class="section">
      <p>Em resposta à solicitação do Comitê por dados desagregados abrangentes (parágrafo 7 das 
      observações finais), o Brasil apresenta os seguintes indicadores interseccionais:</p>
      
      <div class="chart-container">
        <div class="chart-title">Comparativo de Indicadores: População Negra vs Branca</div>
        <div class="chart-wrapper">
          <canvas id="indicadorChart"></canvas>
        </div>
      </div>
      
      ${Object.entries(indicadoresPorCategoria).map(([categoria, inds]) => `
        <h3>${categoria}</h3>
        <table>
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Fonte</th>
              <th>Negros</th>
              <th>Brancos</th>
              <th>Tendência</th>
            </tr>
          </thead>
          <tbody>
            ${inds.map((ind: any) => {
              const dados = ind.dados || {};
              const negros = extractLatestValue(dados.negros || dados.negras);
              const brancos = extractLatestValue(dados.brancos || dados.brancas);
              const tendenciaIcon = ind.tendencia === 'crescente' ? '↑' : ind.tendencia === 'decrescente' ? '↓' : '→';
              const tendenciaClass = ind.tendencia === 'crescente' ? 'trend-up' : ind.tendencia === 'decrescente' ? 'trend-down' : 'trend-stable';
              
              return `
                <tr>
                  <td><strong>${ind.nome}</strong></td>
                  <td>${ind.fonte}</td>
                  <td>${negros !== null ? negros : 'N/D'}</td>
                  <td>${brancos !== null ? brancos : 'N/D'}</td>
                  <td class="${tendenciaClass}">${tendenciaIcon} ${ind.tendencia || 'N/D'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        ${inds.length > 0 && inds[0].analise_interseccional ? `
          <div class="highlight-box">
            <h4>📈 Análise Interseccional</h4>
            <p>${inds.map((ind: any) => ind.analise_interseccional).filter(Boolean).join(' ')}</p>
          </div>
        ` : ''}
      `).join('')}
    </div>

    <h2>V. Recomendações por Eixo Temático</h2>
    
    <div class="section">
      <div class="chart-container">
        <div class="chart-title">Distribuição de Recomendações por Eixo Temático</div>
        <div class="chart-wrapper">
          <canvas id="eixoChart"></canvas>
        </div>
      </div>
    </div>

    ${conclusoes.length > 0 ? `
    <h2>VI. Conclusões Analíticas</h2>
    
    <div class="section">
      ${conclusoes.filter(c => c.relevancia_common_core).map(c => `
        <div class="${c.tipo === 'avanco' ? 'response' : c.tipo === 'lacuna_persistente' ? 'gap' : 'critical'}">
          <h4>${c.tipo === 'avanco' ? '✓' : c.tipo === 'lacuna_persistente' ? '⚠' : '✕'} ${c.titulo}</h4>
          <p>${c.argumento_central}</p>
        </div>
      `).join('')}
    </div>
    ` : ''}
  `;
}

function generateCERDIVHTML(lacunas: any[], respostas: any[], conclusoes: any[], indicadores: any[]): string {
  const statusLabels: Record<string, string> = {
    cumprido: 'Cumprido',
    parcialmente_cumprido: 'Parcialmente Cumprido',
    nao_cumprido: 'Não Cumprido',
    retrocesso: 'Retrocesso',
    em_andamento: 'Em Andamento'
  };

  const getStatusClass = (status: string) => {
    if (status === 'cumprido') return 'status-cumprido';
    if (status === 'parcialmente_cumprido') return 'status-parcial';
    return 'status-nao-cumprido';
  };

  const prioridadeLabels: Record<string, string> = {
    critica: 'Crítica',
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa'
  };

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

  const grupoLabels: Record<string, string> = {
    negros: 'População Negra',
    indigenas: 'Povos Indígenas',
    quilombolas: 'Quilombolas',
    ciganos: 'Povos Ciganos',
    religioes_matriz_africana: 'Religiões de Matriz Africana',
    juventude_negra: 'Juventude Negra',
    mulheres_negras: 'Mulheres Negras',
    lgbtqia_negros: 'LGBTQIA+ Negros',
    pcd_negros: 'PcD Negros',
    idosos_negros: 'Idosos Negros',
    geral: 'Geral'
  };

  // Group lacunas by thematic axis
  const lacunasByEixo = lacunas.reduce((acc, l) => {
    const eixo = l.eixo_tematico;
    if (!acc[eixo]) acc[eixo] = [];
    acc[eixo].push(l);
    return acc;
  }, {} as Record<string, any[]>);

  // Stats
  const stats = {
    total: lacunas.length,
    cumpridas: lacunas.filter(l => l.status_cumprimento === 'cumprido').length,
    parciais: lacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length,
    naoCumpridas: lacunas.filter(l => l.status_cumprimento === 'nao_cumprido').length,
    criticas: lacunas.filter(l => l.prioridade === 'critica').length,
  };

  // Group indicators by category
  const indicadoresPorCategoria: Record<string, any[]> = {};
  indicadores.forEach(ind => {
    if (!indicadoresPorCategoria[ind.categoria]) {
      indicadoresPorCategoria[ind.categoria] = [];
    }
    indicadoresPorCategoria[ind.categoria].push(ind);
  });

  return `
    <div class="header">
      <div class="un-logo">🇺🇳</div>
      <h1>Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial</h1>
      <div class="subtitle">CERD/C/BRA/21-23</div>
      <div class="subtitle">Relatórios periódicos combinados (21º a 23º) do Brasil</div>
      <div class="date">Período de cobertura: 2018-2025</div>
    </div>

    <div class="toc">
      <h3>Sumário</h3>
      <ul>
        <li><strong>I.</strong> Introdução e Metodologia</li>
        <li><strong>II.</strong> Respostas às Observações Finais (CERD/C/BRA/CO/18-20)</li>
        <li><strong>III.</strong> Medidas Legislativas, Judiciais e Administrativas</li>
        <li><strong>IV.</strong> Implementação por Eixo Temático</li>
        <li><strong>V.</strong> Dados Estatísticos Desagregados</li>
        <li><strong>VI.</strong> Povos Tradicionais</li>
        <li><strong>VII.</strong> Conclusões e Compromissos</li>
      </ul>
    </div>

    <h2>I. Introdução</h2>
    
    <div class="section">
      <p>A República Federativa do Brasil submete seus relatórios periódicos combinados (21º a 23º) 
      ao Comitê para a Eliminação da Discriminação Racial, cobrindo o período de 2018 a 2026.</p>
      
      <div class="highlight-box">
        <h4>📋 Metodologia</h4>
        <p>Este relatório foi elaborado com participação de organizações da sociedade civil, 
        instituições acadêmicas e órgãos governamentais, coordenado pelo Grupo de Pesquisa sobre 
        Tratados de Direitos Humanos da Universidade Federal Fluminense (CDG/UFF), em parceria 
        com o Ministério da Igualdade Racial (MIR) e o Ministério das Relações Exteriores (MRE).</p>
      </div>
      
      <div class="data-grid">
        <div class="data-card">
          <div class="data-card-value">${stats.total}</div>
          <div class="data-card-label">Recomendações Analisadas</div>
        </div>
        <div class="data-card">
          <div class="data-card-value" style="color: #22c55e;">${stats.cumpridas}</div>
          <div class="data-card-label">Cumpridas</div>
        </div>
        <div class="data-card">
          <div class="data-card-value" style="color: #eab308;">${stats.parciais}</div>
          <div class="data-card-label">Parciais</div>
        </div>
        <div class="data-card">
          <div class="data-card-value" style="color: #ef4444;">${stats.naoCumpridas}</div>
          <div class="data-card-label">Não Cumpridas</div>
        </div>
      </div>
      
      <div class="chart-container">
        <div class="chart-title">Status de Cumprimento das Recomendações</div>
        <div class="chart-wrapper">
          <canvas id="statusChart"></canvas>
        </div>
      </div>
    </div>

    <h2>II. Respostas às Observações Finais (CERD/C/BRA/CO/18-20)</h2>
    
    <div class="section">
      <p>Em resposta às observações finais do Comitê de agosto de 2022, o Brasil apresenta 
      as seguintes informações sobre as medidas adotadas para implementar as recomendações:</p>
      
      ${respostas.map(r => `
        <div class="recommendation">
          <h4><span class="paragraph-ref">Parágrafo ${r.paragrafo_cerd_iii}</span></h4>
          <p><strong>Crítica original:</strong> ${r.critica_original}</p>
        </div>
        <div class="response">
          <p><strong>Resposta do Brasil:</strong> ${r.resposta_brasil}</p>
          <p><strong>Avaliação:</strong> <span class="${getStatusClass(r.grau_atendimento)}">${statusLabels[r.grau_atendimento] || r.grau_atendimento}</span></p>
          ${r.lacunas_remanescentes && r.lacunas_remanescentes.length > 0 ? `
            <div class="gap">
              <p><strong>Lacunas remanescentes:</strong></p>
              <ul>
                ${r.lacunas_remanescentes.map((l: string) => `<li>${l}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      `).join('')}
    </div>

    <h2>III. Medidas Legislativas, Judiciais e Administrativas (2018-2025)</h2>
    
    <div class="section">
      <h3>A. Principais Avanços Legislativos</h3>
      <table>
        <thead>
          <tr>
            <th>Norma</th>
            <th>Ano</th>
            <th>Descrição</th>
            <th>Impacto</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Lei 14.532/2023</strong></td>
            <td>2023</td>
            <td>Equipara injúria racial ao crime de racismo</td>
            <td><span class="badge badge-success">Alto</span></td>
          </tr>
          <tr>
            <td><strong>Lei 14.723/2023</strong></td>
            <td>2023</td>
            <td>Renova sistema de cotas no ensino superior por 10 anos</td>
            <td><span class="badge badge-success">Alto</span></td>
          </tr>
          <tr>
            <td><strong>Decreto 11.956/2024</strong></td>
            <td>2024</td>
            <td>Programa Juventude Negra Viva</td>
            <td><span class="badge badge-info">Médio</span></td>
          </tr>
          <tr>
            <td><strong>Decreto 11.786/2023</strong></td>
            <td>2023</td>
            <td>Política Nacional de Gestão Territorial Quilombola (PNGTAQ)</td>
            <td><span class="badge badge-success">Alto</span></td>
          </tr>
        </tbody>
      </table>

      <h3>B. Mudanças Institucionais</h3>
      <ul>
        <li>Criação do Ministério da Igualdade Racial (MIR) - Janeiro de 2023</li>
        <li>Criação do Ministério dos Povos Indígenas (MPI) - Janeiro de 2023</li>
        <li>Reestruturação da FUNAI e fortalecimento do INCRA</li>
        <li>Recomposição do Conselho Nacional de Direitos Humanos (CNDH)</li>
      </ul>
    </div>

    <h2>IV. Implementação por Eixo Temático</h2>
    
    <div class="section">
      <div class="chart-container">
        <div class="chart-title">Distribuição de Recomendações por Eixo</div>
        <div class="chart-wrapper">
          <canvas id="eixoChart"></canvas>
        </div>
      </div>
      
      ${Object.entries(lacunasByEixo).map(([eixo, items]) => `
        <h3>${eixoLabels[eixo] || eixo}</h3>
        
        <table>
          <thead>
            <tr>
              <th>§</th>
              <th>Tema</th>
              <th>Grupo Focal</th>
              <th>Status</th>
              <th>Prioridade</th>
            </tr>
          </thead>
          <tbody>
            ${(items as any[]).map(l => `
              <tr>
                <td><span class="paragraph-ref">${l.paragrafo}</span></td>
                <td>
                  <strong>${l.tema}</strong>
                  <br><small style="color: #64748b;">${l.descricao_lacuna.substring(0, 80)}...</small>
                </td>
                <td>${grupoLabels[l.grupo_focal] || l.grupo_focal}</td>
                <td>
                  <span class="badge ${l.status_cumprimento === 'cumprido' ? 'badge-success' : l.status_cumprimento === 'parcialmente_cumprido' ? 'badge-warning' : 'badge-danger'}">
                    ${statusLabels[l.status_cumprimento] || l.status_cumprimento}
                  </span>
                </td>
                <td>${prioridadeLabels[l.prioridade] || l.prioridade}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `).join('')}
    </div>

    <h2>V. Dados Estatísticos Desagregados</h2>
    
    <div class="section">
      <p>Em resposta à solicitação do Comitê por dados desagregados abrangentes, o Brasil apresenta 
      os seguintes indicadores interseccionais:</p>
      
      <div class="chart-container">
        <div class="chart-title">Comparativo de Indicadores: Desigualdade Racial</div>
        <div class="chart-wrapper">
          <canvas id="indicadorChart"></canvas>
        </div>
      </div>
      
      ${Object.entries(indicadoresPorCategoria).map(([categoria, inds]) => `
        <h3>${categoria}</h3>
        <table>
          <thead>
            <tr>
              <th>Indicador</th>
              <th>Fonte</th>
              <th>Negros</th>
              <th>Brancos</th>
              <th>Razão N/B</th>
              <th>Tendência</th>
            </tr>
          </thead>
          <tbody>
            ${inds.map((ind: any) => {
              const dados = ind.dados || {};
              const negros = extractLatestValue(dados.negros || dados.negras);
              const brancos = extractLatestValue(dados.brancos || dados.brancas);
              const razao = (negros && brancos && brancos !== 0) ? (negros / brancos).toFixed(2) : 'N/D';
              const tendenciaIcon = ind.tendencia === 'crescente' ? '↑' : ind.tendencia === 'decrescente' ? '↓' : '→';
              
              return `
                <tr>
                  <td><strong>${ind.nome}</strong></td>
                  <td>${ind.fonte}</td>
                  <td>${negros !== null ? negros : 'N/D'}</td>
                  <td>${brancos !== null ? brancos : 'N/D'}</td>
                  <td><strong>${razao}</strong></td>
                  <td>${tendenciaIcon} ${ind.tendencia || 'N/D'}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        ${inds[0]?.analise_interseccional ? `
          <div class="highlight-box">
            <h4>📊 Análise Interseccional</h4>
            <p>${inds.map((ind: any) => ind.analise_interseccional).filter(Boolean).join(' ')}</p>
          </div>
        ` : ''}
      `).join('')}
    </div>

    <h2>VI. Povos Tradicionais</h2>
    
    <div class="section">
      <h3>A. Povos Indígenas</h3>
      <div class="highlight-box">
        <p>O Censo 2022 identificou <strong>1.693.535 pessoas indígenas</strong> no Brasil, representando 
        <strong>305 diferentes etnias</strong> falando <strong>274 línguas</strong>. Durante 2023-2025, 
        <strong>11 territórios indígenas foram demarcados</strong>, revertendo a paralisia do período 2019-2022.</p>
      </div>
      
      <h3>B. Comunidades Quilombolas</h3>
      <div class="highlight-box">
        <p>O primeiro Censo Quilombola (2022) identificou <strong>1.327.802 quilombolas</strong> em 
        aproximadamente <strong>3.500 comunidades certificadas</strong>. A Política Nacional de Gestão 
        Territorial Quilombola (PNGTAQ) foi estabelecida em 2023.</p>
      </div>
      
      <h3>C. Povos Ciganos (Roma)</h3>
      <div class="highlight-box">
        <p>Rompendo com a invisibilidade histórica, o Censo 2022 incluiu os povos ciganos pela primeira vez. 
        O Programa Brasil Cigano foi estabelecido em 2024 com secretaria dedicada no MIR.</p>
      </div>
    </div>

    <h2>VII. Conclusões e Compromissos</h2>
    
    <div class="section">
      ${conclusoes.filter(c => c.tipo === 'lacuna_persistente').map(c => `
        <div class="gap">
          <h4>⚠️ ${c.titulo}</h4>
          <p>${c.argumento_central}</p>
        </div>
      `).join('')}
      
      ${conclusoes.filter(c => c.tipo === 'avanco').map(c => `
        <div class="response">
          <h4>✓ ${c.titulo}</h4>
          <p>${c.argumento_central}</p>
        </div>
      `).join('')}
      
      <h3>Compromissos para o Próximo Ciclo</h3>
      <div class="highlight-box">
        <p>O Brasil se compromete a:</p>
        <ul>
          <li>Acelerar a demarcação de territórios indígenas e quilombolas</li>
          <li>Implementar medidas efetivas para reduzir a letalidade policial contra jovens negros</li>
          <li>Fortalecer a implementação da Lei 10.639/2003 sobre ensino de história afro-brasileira</li>
          <li>Continuar a produção de dados estatísticos desagregados sobre todos os grupos protegidos</li>
          <li>Expandir políticas interseccionais que abordem discriminações múltiplas</li>
        </ul>
      </div>
    </div>
  `;
}

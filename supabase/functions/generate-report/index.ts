import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReportRequest {
  type: 'common-core' | 'cerd-iv';
  format: 'pdf' | 'docx' | 'html';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, format } = await req.json() as ReportRequest;
    
    console.log(`Generating ${type} report in ${format} format`);

    // Fetch data from database
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

    console.log(`Fetched: ${lacunas.length} lacunas, ${respostas.length} respostas, ${conclusoes.length} conclusoes, ${indicadores.length} indicadores`);

    // Generate HTML content based on report type
    let htmlContent = '';
    let title = '';
    let filename = '';

    if (type === 'common-core') {
      title = 'HRI/CORE/BRA/2026 - Common Core Document';
      filename = 'common-core-brazil-2026';
      htmlContent = generateCommonCoreHTML(lacunas, indicadores, conclusoes);
    } else {
      title = 'CERD/C/BRA/21-23 - Fourth Periodic Report';
      filename = 'cerd-iv-brazil-2026';
      htmlContent = generateCERDIVHTML(lacunas, respostas, conclusoes, indicadores);
    }

    // For HTML format, return directly
    if (format === 'html') {
      return new Response(htmlContent, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.html"`,
        },
      });
    }

    // For PDF/DOCX, we'll return HTML with styling that can be converted client-side
    // or provide a well-formatted HTML that browsers can print to PDF
    const fullHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @page {
      size: A4;
      margin: 2.5cm;
    }
    
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000;
      max-width: 21cm;
      margin: 0 auto;
      padding: 2cm;
      background: white;
    }
    
    .header {
      text-align: center;
      margin-bottom: 2cm;
      border-bottom: 2px solid #000;
      padding-bottom: 1cm;
    }
    
    .header h1 {
      font-size: 16pt;
      font-weight: bold;
      margin: 0;
      text-transform: uppercase;
    }
    
    .header .subtitle {
      font-size: 14pt;
      margin-top: 0.5cm;
    }
    
    .header .date {
      font-size: 12pt;
      margin-top: 0.5cm;
      font-style: italic;
    }
    
    .un-logo {
      text-align: center;
      font-size: 24pt;
      margin-bottom: 1cm;
    }
    
    h2 {
      font-size: 14pt;
      font-weight: bold;
      margin-top: 1.5cm;
      margin-bottom: 0.5cm;
      border-bottom: 1px solid #333;
      padding-bottom: 0.3cm;
    }
    
    h3 {
      font-size: 13pt;
      font-weight: bold;
      margin-top: 1cm;
      margin-bottom: 0.3cm;
    }
    
    h4 {
      font-size: 12pt;
      font-weight: bold;
      margin-top: 0.8cm;
      margin-bottom: 0.2cm;
    }
    
    p {
      text-align: justify;
      margin-bottom: 0.5cm;
    }
    
    .paragraph-ref {
      font-weight: bold;
      color: #333;
    }
    
    .section {
      margin-bottom: 1.5cm;
      page-break-inside: avoid;
    }
    
    .recommendation {
      background: #f5f5f5;
      padding: 0.5cm;
      margin: 0.5cm 0;
      border-left: 3px solid #333;
    }
    
    .response {
      background: #e8f5e9;
      padding: 0.5cm;
      margin: 0.5cm 0;
      border-left: 3px solid #4caf50;
    }
    
    .gap {
      background: #fff3e0;
      padding: 0.5cm;
      margin: 0.5cm 0;
      border-left: 3px solid #ff9800;
    }
    
    .critical {
      background: #ffebee;
      padding: 0.5cm;
      margin: 0.5cm 0;
      border-left: 3px solid #f44336;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 0.5cm 0;
      font-size: 11pt;
    }
    
    th, td {
      border: 1px solid #333;
      padding: 0.3cm;
      text-align: left;
    }
    
    th {
      background: #f0f0f0;
      font-weight: bold;
    }
    
    .status-cumprido { color: #2e7d32; font-weight: bold; }
    .status-parcial { color: #f57c00; font-weight: bold; }
    .status-nao-cumprido { color: #c62828; font-weight: bold; }
    
    .footer {
      margin-top: 2cm;
      padding-top: 1cm;
      border-top: 1px solid #333;
      font-size: 10pt;
      text-align: center;
    }
    
    .toc {
      margin: 1cm 0;
      padding: 1cm;
      background: #fafafa;
    }
    
    .toc h3 {
      margin-top: 0;
    }
    
    .toc ul {
      list-style: none;
      padding-left: 0;
    }
    
    .toc li {
      margin: 0.3cm 0;
    }
    
    .print-instructions {
      background: #e3f2fd;
      padding: 1cm;
      margin-bottom: 1cm;
      border: 1px solid #2196f3;
      border-radius: 4px;
    }
    
    @media print {
      .print-instructions { display: none; }
      body { padding: 0; }
    }
  </style>
</head>
<body>
  <div class="print-instructions">
    <strong>📄 Para salvar como PDF:</strong> Use Ctrl+P (ou Cmd+P no Mac) e selecione "Salvar como PDF" como destino da impressão.
    <br>
    <strong>📝 Para salvar como DOCX:</strong> Copie todo o conteúdo (Ctrl+A) e cole no Microsoft Word ou Google Docs.
  </div>
  
  ${htmlContent}
  
  <div class="footer">
    <p>Documento gerado automaticamente pelo Sistema CERD Brasil</p>
    <p>Data de geração: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
    <p>CDG/UFF • MIR • MRE</p>
  </div>
</body>
</html>`;

    return new Response(fullHTML, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating report:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateCommonCoreHTML(lacunas: any[], indicadores: any[], conclusoes: any[]): string {
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

  // Count statistics
  const stats = {
    total: lacunas.length,
    cumpridas: lacunas.filter(l => l.status_cumprimento === 'cumprido').length,
    parciais: lacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length,
    naoCumpridas: lacunas.filter(l => l.status_cumprimento === 'nao_cumprido').length,
  };

  return `
    <div class="header">
      <div class="un-logo">🇺🇳</div>
      <h1>Common Core Document</h1>
      <div class="subtitle">HRI/CORE/BRA/2026</div>
      <div class="subtitle">Forming part of the reports of States parties</div>
      <div class="date">Brazil - Update 2018-2026</div>
    </div>

    <div class="toc">
      <h3>Table of Contents</h3>
      <ul>
        <li><strong>I.</strong> General information about the reporting State</li>
        <li><strong>II.</strong> General framework for the protection of human rights</li>
        <li><strong>III.</strong> Information on non-discrimination and equality</li>
        <li><strong>Annexes:</strong> Statistical indicators with intersectional disaggregation</li>
      </ul>
    </div>

    <h2>I. General Information about the Reporting State</h2>
    
    <div class="section">
      <h3>A. Demographic, economic, social and cultural characteristics</h3>
      
      <h4>Population (Census 2022)</h4>
      <table>
        <tr>
          <th>Category</th>
          <th>Population</th>
          <th>Percentage</th>
        </tr>
        <tr>
          <td>Total Population</td>
          <td>203,062,512</td>
          <td>100%</td>
        </tr>
        <tr>
          <td>Black and Brown (Negros)</td>
          <td>112,674,596</td>
          <td>55.5%</td>
        </tr>
        <tr>
          <td>White (Brancos)</td>
          <td>88,252,121</td>
          <td>43.5%</td>
        </tr>
        <tr>
          <td>Indigenous Peoples</td>
          <td>1,693,535</td>
          <td>0.83%</td>
        </tr>
        <tr>
          <td>Quilombola Communities</td>
          <td>1,327,802</td>
          <td>0.65%</td>
        </tr>
      </table>
      
      <p>The 2022 Census represents a historic milestone in Brazilian demographic data collection, 
      including for the first time specific categories for quilombola communities and Roma peoples 
      (ciganos), addressing a long-standing gap in statistical visibility for traditional populations.</p>
    </div>

    <h2>II. General Framework for the Protection and Promotion of Human Rights</h2>
    
    <div class="section">
      <h3>A. Institutional Framework (2018-2026)</h3>
      
      <p>The period 2018-2026 witnessed significant institutional changes in Brazil's framework 
      for racial equality promotion:</p>
      
      <h4>Period 2023-2025: Institutional Reconstruction</h4>
      <ul>
        <li><strong>Ministry of Racial Equality (MIR)</strong> - Created in January 2023</li>
        <li><strong>Ministry of Indigenous Peoples (MPI)</strong> - Created in January 2023</li>
        <li><strong>Budget increase:</strong> 533% growth compared to 2018-2022 period</li>
        <li><strong>Land demarcation:</strong> 11 indigenous territories homologated</li>
      </ul>
    </div>

    <h2>III. Information on Non-discrimination, Equality and Effective Remedies</h2>
    
    <div class="section">
      <h3>A. Compliance with CERD Recommendations</h3>
      
      <table>
        <tr>
          <th>Status</th>
          <th>Count</th>
          <th>Percentage</th>
        </tr>
        <tr>
          <td class="status-cumprido">Fully Implemented</td>
          <td>${stats.cumpridas}</td>
          <td>${Math.round(stats.cumpridas / stats.total * 100)}%</td>
        </tr>
        <tr>
          <td class="status-parcial">Partially Implemented</td>
          <td>${stats.parciais}</td>
          <td>${Math.round(stats.parciais / stats.total * 100)}%</td>
        </tr>
        <tr>
          <td class="status-nao-cumprido">Not Implemented</td>
          <td>${stats.naoCumpridas}</td>
          <td>${Math.round(stats.naoCumpridas / stats.total * 100)}%</td>
        </tr>
      </table>
    </div>

    <h2>Annex: Statistical Indicators with Intersectional Disaggregation</h2>
    
    <div class="section">
      ${indicadores.map(ind => `
        <h4>${ind.nome}</h4>
        <p><strong>Source:</strong> ${ind.fonte} | <strong>Category:</strong> ${ind.categoria}</p>
        <p>${ind.analise_interseccional || ''}</p>
        <p><strong>Available disaggregations:</strong> 
          ${ind.desagregacao_raca ? 'Race/Ethnicity, ' : ''}
          ${ind.desagregacao_genero ? 'Gender, ' : ''}
          ${ind.desagregacao_idade ? 'Age, ' : ''}
          ${ind.desagregacao_classe ? 'Class, ' : ''}
          ${ind.desagregacao_territorio ? 'Territory' : ''}
        </p>
      `).join('')}
    </div>
  `;
}

function generateCERDIVHTML(lacunas: any[], respostas: any[], conclusoes: any[], indicadores: any[]): string {
  const statusLabels: Record<string, string> = {
    cumprido: 'Fully Implemented',
    parcialmente_cumprido: 'Partially Implemented',
    nao_cumprido: 'Not Implemented',
    retrocesso: 'Regression',
    em_andamento: 'In Progress'
  };

  const getStatusClass = (status: string) => {
    if (status === 'cumprido') return 'status-cumprido';
    if (status === 'parcialmente_cumprido') return 'status-parcial';
    return 'status-nao-cumprido';
  };

  const priorityLabels: Record<string, string> = {
    critica: 'Critical',
    alta: 'High',
    media: 'Medium',
    baixa: 'Low'
  };

  // Group lacunas by thematic axis
  const lacunasByEixo = lacunas.reduce((acc, l) => {
    const eixo = l.eixo_tematico;
    if (!acc[eixo]) acc[eixo] = [];
    acc[eixo].push(l);
    return acc;
  }, {} as Record<string, any[]>);

  const eixoLabels: Record<string, string> = {
    legislacao_justica: 'Legislation and Justice',
    politicas_institucionais: 'Institutional Policies',
    seguranca_publica: 'Public Security',
    saude: 'Health',
    educacao: 'Education',
    trabalho_renda: 'Employment and Income',
    terra_territorio: 'Land and Territory',
    cultura_patrimonio: 'Culture and Heritage',
    participacao_social: 'Social Participation',
    dados_estatisticas: 'Data and Statistics'
  };

  return `
    <div class="header">
      <div class="un-logo">🇺🇳</div>
      <h1>International Convention on the Elimination of All Forms of Racial Discrimination</h1>
      <div class="subtitle">CERD/C/BRA/21-23</div>
      <div class="subtitle">Combined twenty-first to twenty-third periodic reports submitted by Brazil under article 9 of the Convention</div>
      <div class="date">Coverage period: 2018-2026</div>
    </div>

    <div class="toc">
      <h3>Contents</h3>
      <ul>
        <li><strong>I.</strong> Introduction and Methodology</li>
        <li><strong>II.</strong> Response to the Concluding Observations (CERD/C/BRA/CO/18-20)</li>
        <li><strong>III.</strong> Legislative, Judicial and Administrative Measures</li>
        <li><strong>IV.</strong> Implementation of Articles 2-7 of the Convention</li>
        <li><strong>V.</strong> Disaggregated Statistical Data</li>
        <li><strong>VI.</strong> Traditional Peoples</li>
        <li><strong>VII.</strong> Conclusions and Commitments</li>
      </ul>
    </div>

    <h2>I. Introduction</h2>
    
    <div class="section">
      <p>The Federative Republic of Brazil submits its combined twenty-first to twenty-third 
      periodic reports to the Committee on the Elimination of Racial Discrimination, covering 
      the period from 2018 to 2026.</p>
      
      <p>This report was prepared with the participation of civil society organizations, 
      academic institutions, and government bodies, coordinated by the Research Group on 
      Human Rights Treaties at the Federal Fluminense University (CDG/UFF), in partnership 
      with the Ministry of Racial Equality (MIR) and the Ministry of Foreign Affairs (MRE).</p>
    </div>

    <h2>II. Response to the Concluding Observations (CERD/C/BRA/CO/18-20)</h2>
    
    <div class="section">
      <p>In response to the Committee's concluding observations of August 2022, Brazil 
      provides the following information on measures taken to implement the recommendations:</p>
      
      ${respostas.map(r => `
        <div class="recommendation">
          <h4><span class="paragraph-ref">Paragraph ${r.paragrafo_cerd_iii}:</span> ${r.critica_original}</h4>
        </div>
        <div class="response">
          <p><strong>Brazil's Response:</strong> ${r.resposta_brasil}</p>
          <p><strong>Assessment:</strong> <span class="${getStatusClass(r.grau_atendimento)}">${statusLabels[r.grau_atendimento] || r.grau_atendimento}</span></p>
          ${r.lacunas_remanescentes && r.lacunas_remanescentes.length > 0 ? `
            <p><strong>Remaining Gaps:</strong></p>
            <ul>
              ${r.lacunas_remanescentes.map((l: string) => `<li>${l}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      `).join('')}
    </div>

    <h2>III. Legislative, Judicial and Administrative Measures (2018-2026)</h2>
    
    <div class="section">
      <h3>A. Major Legislative Advances</h3>
      <ul>
        <li><strong>Law 14.532/2023:</strong> Equates racial slur (injúria racial) with the crime of racism, with penalties of 2-5 years imprisonment</li>
        <li><strong>Law 14.723/2023:</strong> Renews the affirmative action quota system in higher education for 10 additional years</li>
        <li><strong>Decree 11.956/2024:</strong> Establishes the Black Youth Alive Program (Juventude Negra Viva)</li>
        <li><strong>Decree 11.786/2023:</strong> Institutes the National Policy for Quilombola Territorial and Environmental Management (PNGTAQ)</li>
      </ul>

      <h3>B. Institutional Changes</h3>
      <ul>
        <li>Creation of the Ministry of Racial Equality (MIR) - January 2023</li>
        <li>Creation of the Ministry of Indigenous Peoples (MPI) - January 2023</li>
        <li>Restructuring of FUNAI and strengthening of INCRA</li>
        <li>Recomposition of the National Human Rights Council (CNDH)</li>
      </ul>
    </div>

    <h2>IV. Implementation of the Convention by Thematic Axis</h2>
    
    ${Object.entries(lacunasByEixo).map(([eixo, items]) => `
      <div class="section">
        <h3>${eixoLabels[eixo] || eixo}</h3>
        
        <table>
          <tr>
            <th>§</th>
            <th>Theme</th>
            <th>Status</th>
            <th>Priority</th>
          </tr>
          ${(items as any[]).map(l => `
            <tr>
              <td>${l.paragrafo}</td>
              <td>
                <strong>${l.tema}</strong><br>
                <small>${l.descricao_lacuna.substring(0, 100)}...</small>
              </td>
              <td class="${getStatusClass(l.status_cumprimento)}">${statusLabels[l.status_cumprimento] || l.status_cumprimento}</td>
              <td>${priorityLabels[l.prioridade] || l.prioridade}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `).join('')}

    <h2>V. Disaggregated Statistical Data</h2>
    
    <div class="section">
      <p>In response to the Committee's request for comprehensive disaggregated data 
      (paragraph 7 of the concluding observations), Brazil presents the following 
      intersectional indicators:</p>
      
      <table>
        <tr>
          <th>Indicator</th>
          <th>Category</th>
          <th>Source</th>
          <th>Disaggregation Available</th>
        </tr>
        ${indicadores.map(ind => `
          <tr>
            <td>${ind.nome}</td>
            <td>${ind.categoria}</td>
            <td>${ind.fonte}</td>
            <td>
              ${ind.desagregacao_raca ? '✓ Race ' : ''}
              ${ind.desagregacao_genero ? '✓ Gender ' : ''}
              ${ind.desagregacao_idade ? '✓ Age ' : ''}
              ${ind.desagregacao_classe ? '✓ Class ' : ''}
              ${ind.desagregacao_deficiencia ? '✓ Disability ' : ''}
            </td>
          </tr>
        `).join('')}
      </table>
    </div>

    <h2>VI. Traditional Peoples</h2>
    
    <div class="section">
      <h3>A. Indigenous Peoples</h3>
      <p>The 2022 Census identified 1,693,535 indigenous persons in Brazil, representing 
      305 different ethnic groups speaking 274 languages. During 2023-2025, 11 indigenous 
      territories were demarcated, reversing the paralysis of the 2019-2022 period.</p>
      
      <h3>B. Quilombola Communities</h3>
      <p>The first-ever Quilombola Census (2022) identified 1,327,802 quilombolas across 
      approximately 3,500 certified communities. The National Policy for Quilombola 
      Territorial Management (PNGTAQ) was established in 2023.</p>
      
      <h3>C. Roma Peoples (Ciganos)</h3>
      <p>Breaking with historical invisibility, the 2022 Census included Roma peoples for 
      the first time. The Brazil Cigano Program was established in 2024 with a dedicated 
      secretariat within the Ministry of Racial Equality.</p>
    </div>

    <h2>VII. Conclusions and Commitments</h2>
    
    <div class="section">
      ${conclusoes.filter(c => c.tipo === 'lacuna_persistente').map(c => `
        <div class="gap">
          <h4>${c.titulo}</h4>
          <p>${c.argumento_central}</p>
        </div>
      `).join('')}
      
      <h3>Commitments for the Next Cycle</h3>
      <p>Brazil commits to:</p>
      <ul>
        <li>Accelerate the demarcation of indigenous and quilombola territories</li>
        <li>Implement effective measures to reduce police lethality against Black youth</li>
        <li>Strengthen the implementation of Law 10.639/2003 on Afro-Brazilian history education</li>
        <li>Continue the production of disaggregated statistical data on all protected groups</li>
        <li>Expand intersectional policies addressing multiple discrimination</li>
      </ul>
    </div>
  `;
}

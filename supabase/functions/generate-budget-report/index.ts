import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BudgetReportRequest {
  programa?: string;
  grupo_focal?: string;
  eixo_tematico?: string;
  esfera?: string;
}

const esferaLabels: Record<string, string> = {
  federal: 'Federal',
  estadual: 'Estadual',
  municipal: 'Municipal',
};

const grupoLabels: Record<string, string> = {
  negros: 'População Negra',
  indigenas: 'Povos Indígenas',
  quilombolas: 'Comunidades Quilombolas',
  ciganos: 'Povos Ciganos (Roma)',
  juventude_negra: 'Juventude Negra',
  mulheres_negras: 'Mulheres Negras',
  lgbtqia_negros: 'LGBTQIA+ Negros',
  religioes_matriz_africana: 'Religiões de Matriz Africana',
  pcd_negros: 'PcD Negros',
  idosos_negros: 'Idosos Negros',
  geral: 'Geral',
  outros: 'Outros Grupos',
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
  dados_estatisticas: 'Dados e Estatísticas',
};

function formatCurrency(value: number): string {
  if (!value) return 'R$ 0';
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(2)} bi`;
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)} mi`;
  if (value >= 1000) return `${(value / 1000).toFixed(0)} mil`;
  return value.toFixed(0);
}

function formatFullCurrency(value: number): string {
  if (!value) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Public endpoint - no authentication required (read-only data access)
    console.log('Generating budget report (public access)');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({})) as BudgetReportRequest;

    // Input validation
    const validEsferas = ['federal', 'estadual', 'municipal'];
    if (body.esfera && !validEsferas.includes(body.esfera)) {
      return new Response(JSON.stringify({ error: 'Invalid esfera parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (body.programa && (typeof body.programa !== 'string' || body.programa.length > 500)) {
      return new Response(JSON.stringify({ error: 'Invalid programa parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (body.grupo_focal && (typeof body.grupo_focal !== 'string' || body.grupo_focal.length > 100)) {
      return new Response(JSON.stringify({ error: 'Invalid grupo_focal parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (body.eixo_tematico && (typeof body.eixo_tematico !== 'string' || body.eixo_tematico.length > 100)) {
      return new Response(JSON.stringify({ error: 'Invalid eixo_tematico parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log('Gerando relatório orçamentário completo');

    // Fetch all data
    let orcamentoQuery = supabase.from('dados_orcamentarios').select('*').order('esfera').order('programa').order('ano');
    
    if (body.programa) orcamentoQuery = orcamentoQuery.eq('programa', body.programa);
    if (body.grupo_focal) orcamentoQuery = orcamentoQuery.eq('grupo_focal', body.grupo_focal);
    if (body.eixo_tematico) orcamentoQuery = orcamentoQuery.eq('eixo_tematico', body.eixo_tematico);
    if (body.esfera) orcamentoQuery = orcamentoQuery.eq('esfera', body.esfera);

    const [orcamentoResult, indicadoresResult, lacunasResult] = await Promise.all([
      orcamentoQuery,
      supabase.from('indicadores_interseccionais').select('*').order('categoria'),
      supabase.from('lacunas_identificadas').select('*').order('eixo_tematico'),
    ]);

    if (orcamentoResult.error) throw orcamentoResult.error;
    if (indicadoresResult.error) throw indicadoresResult.error;
    if (lacunasResult.error) throw lacunasResult.error;

    const orcamento = orcamentoResult.data || [];
    const indicadores = indicadoresResult.data || [];
    const lacunas = lacunasResult.data || [];

    console.log(`Dados: ${orcamento.length} registros orçamentários, ${indicadores.length} indicadores, ${lacunas.length} lacunas`);

    // Group data by multiple dimensions
    const byEsfera: Record<string, any[]> = { federal: [], estadual: [], municipal: [] };
    const byPrograma: Record<string, any[]> = {};
    const byGrupo: Record<string, any[]> = {};
    const byAno: Record<number, any[]> = {};
    const byEixo: Record<string, any[]> = {};

    orcamento.forEach(o => {
      const esfera = o.esfera || 'federal';
      if (!byEsfera[esfera]) byEsfera[esfera] = [];
      byEsfera[esfera].push(o);

      if (!byPrograma[o.programa]) byPrograma[o.programa] = [];
      byPrograma[o.programa].push(o);

      const grupo = o.grupo_focal || 'geral';
      if (!byGrupo[grupo]) byGrupo[grupo] = [];
      byGrupo[grupo].push(o);

      if (!byAno[o.ano]) byAno[o.ano] = [];
      byAno[o.ano].push(o);

      const eixo = o.eixo_tematico || 'outros';
      if (!byEixo[eixo]) byEixo[eixo] = [];
      byEixo[eixo].push(o);
    });

    // Calculate statistics
    const anos = Object.keys(byAno).map(Number).sort();
    const periodo1 = orcamento.filter(o => o.ano >= 2018 && o.ano <= 2022);
    const periodo2 = orcamento.filter(o => o.ano >= 2023 && o.ano <= 2025);

    const stats: {
      totalGeral: number;
      totalPeriodo1: number;
      totalPeriodo2: number;
      totalProgramas: number;
      totalFederal: number;
      totalEstadual: number;
      totalMunicipal: number;
      variacao: number;
    } = {
      totalGeral: orcamento.reduce((acc, o) => acc + parseFloat(o.pago || 0), 0),
      totalPeriodo1: periodo1.reduce((acc, o) => acc + parseFloat(o.pago || 0), 0),
      totalPeriodo2: periodo2.reduce((acc, o) => acc + parseFloat(o.pago || 0), 0),
      totalProgramas: Object.keys(byPrograma).length,
      totalFederal: byEsfera.federal.reduce((acc, o) => acc + parseFloat(o.pago || 0), 0),
      totalEstadual: byEsfera.estadual.reduce((acc, o) => acc + parseFloat(o.pago || 0), 0),
      totalMunicipal: byEsfera.municipal.reduce((acc, o) => acc + parseFloat(o.pago || 0), 0),
      variacao: 0,
    };

    stats.variacao = stats.totalPeriodo1 > 0 
      ? ((stats.totalPeriodo2 - stats.totalPeriodo1) / stats.totalPeriodo1 * 100) 
      : 0;

    // Generate year-by-year evolution data
    const evolucaoAnual = anos.map(ano => ({
      ano,
      total: byAno[ano]?.reduce((acc, o) => acc + parseFloat(o.pago || 0), 0) || 0,
      federal: byAno[ano]?.filter(o => o.esfera === 'federal').reduce((acc, o) => acc + parseFloat(o.pago || 0), 0) || 0,
      estadual: byAno[ano]?.filter(o => o.esfera === 'estadual').reduce((acc, o) => acc + parseFloat(o.pago || 0), 0) || 0,
      municipal: byAno[ano]?.filter(o => o.esfera === 'municipal').reduce((acc, o) => acc + parseFloat(o.pago || 0), 0) || 0,
    }));

    // Generate insights crossing budget with indicators
    const insights = generateInsights(orcamento, indicadores, lacunas, stats);

    // Get unique sources
    const fontes = [...new Set(orcamento.map(o => o.fonte_dados).filter(Boolean))];
    const urls = [...new Set(orcamento.map(o => o.url_fonte).filter(Boolean))];

    const htmlContent = generateFullHTML(
      stats, 
      evolucaoAnual, 
      byEsfera, 
      byPrograma, 
      byGrupo, 
      byEixo,
      insights, 
      indicadores,
      lacunas,
      fontes,
      urls
    );

    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao gerar relatório orçamentário:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function generateInsights(orcamento: any[], indicadores: any[], lacunas: any[], stats: any): string[] {
  const insights: string[] = [];

  // Budget variation insight
  if (stats.variacao > 50) {
    insights.push(`📈 <strong>Aumento expressivo de ${stats.variacao.toFixed(0)}%</strong> no orçamento entre os períodos 2018-2022 e 2023-2026, sinalizando priorização das políticas de igualdade racial no atual governo.`);
  } else if (stats.variacao < -20) {
    insights.push(`📉 <strong>Redução de ${Math.abs(stats.variacao).toFixed(0)}%</strong> no orçamento executado entre os períodos, indicando possível desinvestimento em políticas raciais.`);
  }

  // Federal vs state/municipal
  const totalSubnacional = stats.totalEstadual + stats.totalMunicipal;
  if (totalSubnacional > 0) {
    const proporcaoSubnacional = (totalSubnacional / stats.totalGeral * 100).toFixed(1);
    insights.push(`🏛️ Os entes subnacionais (estados e municípios) representam <strong>${proporcaoSubnacional}%</strong> do orçamento total mapeado, evidenciando a importância da articulação federativa.`);
  } else {
    insights.push(`⚠️ <strong>Ausência de dados orçamentários estaduais e municipais</strong> no sistema. Recomenda-se a coleta junto às Secretarias de Promoção da Igualdade Racial estaduais.`);
  }

  // Cross with indicators
  const desempregoIndicador = indicadores.find(i => i.nome?.toLowerCase().includes('desemprego'));
  if (desempregoIndicador?.dados) {
    const dados = desempregoIndicador.dados;
    const negros = dados.negros || dados.negras || {};
    const brancos = dados.brancos || dados.brancas || {};
    const anos = Object.keys(negros).sort();
    if (anos.length >= 2) {
      const primeiro = parseFloat(negros[anos[0]]) || 0;
      const ultimo = parseFloat(negros[anos[anos.length - 1]]) || 0;
      if (primeiro > 0 && ultimo > 0) {
        const variacao = ((ultimo - primeiro) / primeiro * 100).toFixed(1);
        insights.push(`📊 Taxa de desemprego da população negra variou <strong>${variacao}%</strong> entre ${anos[0]} e ${anos[anos.length - 1]}, segundo ${desempregoIndicador.fonte}.`);
      }
    }
  }

  // Cross with lacunas
  const lacunasTrabalho = lacunas.filter(l => l.eixo_tematico === 'trabalho_renda');
  if (lacunasTrabalho.length > 0) {
    const naoCumpridas = lacunasTrabalho.filter(l => l.status_cumprimento === 'nao_cumprido').length;
    insights.push(`⚠️ Das ${lacunasTrabalho.length} recomendações da ONU sobre Trabalho e Renda, <strong>${naoCumpridas} ainda não foram cumpridas</strong>, apesar dos investimentos realizados.`);
  }

  return insights;
}

function generateFullHTML(
  stats: any, 
  evolucaoAnual: any[], 
  byEsfera: Record<string, any[]>, 
  byPrograma: Record<string, any[]>,
  byGrupo: Record<string, any[]>,
  byEixo: Record<string, any[]>,
  insights: string[], 
  indicadores: any[],
  lacunas: any[],
  fontes: string[],
  urls: string[]
): string {
  const dataGeracao = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Relatório Orçamentário - Políticas de Igualdade Racial (2018-2025)</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #047857;
      --primary-dark: #065f46;
      --accent: #c7a82b;
      --success: #22c55e;
      --warning: #eab308;
      --danger: #ef4444;
      --text: #1a1a2e;
      --text-muted: #64748b;
      --bg: #f8fafc;
      --card: #ffffff;
      --border: #e2e8f0;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      font-size: 11pt;
    }
    
    .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
    
    .print-header {
      background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
      padding: 16px 24px;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      margin: 20px 24px;
    }
    
    .print-header strong { color: #1e40af; }
    
    .hero {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 50%, #064e3b 100%);
      color: white;
      padding: 60px 0;
      position: relative;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      inset: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    
    .hero-content { position: relative; z-index: 1; }
    
    .hero-badge {
      display: inline-block;
      background: rgba(199, 168, 43, 0.2);
      border: 1px solid var(--accent);
      color: var(--accent);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 20px;
    }
    
    .hero h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.8rem, 4vw, 2.5rem);
      font-weight: 800;
      margin-bottom: 12px;
    }
    
    .hero p { font-size: 1rem; opacity: 0.9; max-width: 800px; }
    
    .hero-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 16px;
      margin-top: 32px;
    }
    
    .hero-stat {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      padding: 16px;
      text-align: center;
    }
    
    .hero-stat-value {
      font-size: 1.5rem;
      font-weight: 800;
      display: block;
    }
    
    .hero-stat-label { font-size: 0.75rem; opacity: 0.8; margin-top: 4px; }
    
    .section { padding: 40px 0; }
    .section-alt { background: white; }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 12px;
      border-bottom: 2px solid var(--primary);
    }
    
    .section-icon {
      width: 40px;
      height: 40px;
      background: var(--primary);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.2rem;
    }
    
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.3rem;
      color: var(--primary);
    }
    
    .section-subtitle { font-size: 0.8rem; color: var(--text-muted); }
    
    .table-container {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      margin-bottom: 24px;
    }
    
    .table-header {
      background: var(--primary);
      color: white;
      padding: 16px 20px;
    }
    
    .table-header h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 4px;
    }
    
    .table-header p {
      font-size: 0.75rem;
      opacity: 0.8;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.85rem;
    }
    
    th, td { 
      padding: 10px 14px; 
      text-align: left; 
      border-bottom: 1px solid var(--border); 
    }
    
    th {
      background: #f1f5f9;
      color: var(--text);
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    tr:hover { background: #f8fafc; }
    
    .table-footer {
      background: #f8fafc;
      padding: 12px 20px;
      font-size: 0.75rem;
      color: var(--text-muted);
      border-top: 1px solid var(--border);
    }
    
    .table-footer a { color: var(--primary); text-decoration: none; }
    .table-footer a:hover { text-decoration: underline; }
    
    .trend-up { color: var(--success); font-weight: 600; }
    .trend-down { color: var(--danger); font-weight: 600; }
    .trend-stable { color: var(--text-muted); }
    
    .chart-container {
      background: white;
      border-radius: 12px;
      padding: 20px;
      border: 1px solid var(--border);
      margin-bottom: 20px;
    }
    
    .chart-header {
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--border);
    }
    
    .chart-title {
      font-weight: 600;
      color: var(--primary);
      font-size: 1rem;
      margin-bottom: 4px;
    }
    
    .chart-subtitle {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .chart-source {
      font-size: 0.7rem;
      color: var(--text-muted);
      margin-top: 12px;
      font-style: italic;
      padding-top: 8px;
      border-top: 1px solid var(--border);
    }
    
    .chart-wrapper { height: 300px; position: relative; }
    
    .insight-card {
      background: linear-gradient(135deg, #fef3c7 0%, #fef9c3 100%);
      border: 1px solid #fbbf24;
      border-radius: 10px;
      padding: 16px;
      margin-bottom: 12px;
    }
    
    .insight-card p { color: #78350f; font-size: 0.9rem; line-height: 1.5; }
    
    .grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    
    .stat-card {
      background: white;
      border-radius: 10px;
      padding: 16px;
      border: 1px solid var(--border);
      text-align: center;
    }
    
    .stat-card-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--primary);
    }
    
    .stat-card-label {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin-top: 4px;
    }
    
    .footer {
      background: #0f172a;
      color: white;
      padding: 40px 0;
      margin-top: 40px;
    }
    
    .footer-content { text-align: center; }
    .footer p { opacity: 0.7; font-size: 0.8rem; margin-bottom: 8px; }
    .footer strong { opacity: 1; }
    
    .sources-section {
      background: #f1f5f9;
      padding: 24px;
      border-radius: 12px;
      margin-top: 24px;
    }
    
    .sources-section h4 {
      font-size: 1rem;
      color: var(--primary);
      margin-bottom: 12px;
    }
    
    .sources-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 8px;
    }
    
    .sources-list li {
      font-size: 0.8rem;
      color: var(--text-muted);
      list-style: none;
      padding-left: 16px;
      position: relative;
    }
    
    .sources-list li::before {
      content: "→";
      position: absolute;
      left: 0;
      color: var(--primary);
    }
    
    @media print {
      .print-header { display: none; }
      body { font-size: 10pt; }
      .hero { padding: 30px 0; }
      .section { padding: 20px 0; page-break-inside: avoid; }
      .chart-wrapper { height: 200px; }
      .table-container { page-break-inside: avoid; }
    }
    
    @media (max-width: 768px) {
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
      .hero-stats { grid-template-columns: repeat(2, 1fr); }
    }
  </style>
</head>
<body>
  <div class="print-header">
    <strong>📄 Para salvar como PDF:</strong> Use Ctrl+P (ou Cmd+P no Mac) → Destino: "Salvar como PDF"<br>
    <strong>📝 Para salvar como Word:</strong> Copie todo o conteúdo (Ctrl+A) e cole no Microsoft Word
  </div>

  <section class="hero">
    <div class="container hero-content">
      <span class="hero-badge">💰 Análise Orçamentária Integrada</span>
      <h1>Orçamento das Políticas de Igualdade Racial</h1>
      <p>Análise consolidada da execução orçamentária dos programas de promoção da igualdade racial nas esferas federal, estadual e municipal, com evolução ano a ano (2018-2026) e cruzamento com indicadores socioeconômicos.</p>
      
      <div class="hero-stats">
        <div class="hero-stat">
          <span class="hero-stat-value">R$ ${formatCurrency(stats.totalGeral)}</span>
          <span class="hero-stat-label">Total Executado</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value">R$ ${formatCurrency(stats.totalPeriodo1)}</span>
          <span class="hero-stat-label">2018-2022</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value">R$ ${formatCurrency(stats.totalPeriodo2)}</span>
          <span class="hero-stat-label">2023-2026</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value" style="color: ${stats.variacao >= 0 ? '#22c55e' : '#ef4444'};">
            ${stats.variacao >= 0 ? '+' : ''}${stats.variacao.toFixed(0)}%
          </span>
          <span class="hero-stat-label">Variação</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value">${stats.totalProgramas}</span>
          <span class="hero-stat-label">Programas</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Sumário Executivo -->
  <section class="section">
    <div class="container">
      <div class="section-header">
        <div class="section-icon">📋</div>
        <div>
          <h2 class="section-title">Sumário Executivo</h2>
          <p class="section-subtitle">Principais achados e insights da análise orçamentária</p>
        </div>
      </div>
      
      ${insights.map(insight => `
        <div class="insight-card">
          <p>${insight}</p>
        </div>
      `).join('')}
      
      <div class="grid-3" style="margin-top: 24px;">
        <div class="stat-card">
          <div class="stat-card-value" style="color: #1e40af;">R$ ${formatCurrency(stats.totalFederal)}</div>
          <div class="stat-card-label">Esfera Federal</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" style="color: #7c3aed;">R$ ${formatCurrency(stats.totalEstadual)}</div>
          <div class="stat-card-label">Esfera Estadual</div>
        </div>
        <div class="stat-card">
          <div class="stat-card-value" style="color: #059669;">R$ ${formatCurrency(stats.totalMunicipal)}</div>
          <div class="stat-card-label">Esfera Municipal</div>
        </div>
      </div>
    </div>
  </section>

  <!-- Evolução Ano a Ano -->
  <section class="section section-alt">
    <div class="container">
      <div class="section-header">
        <div class="section-icon">📈</div>
        <div>
          <h2 class="section-title">Evolução Orçamentária Ano a Ano</h2>
          <p class="section-subtitle">Total executado (pago) por ano, discriminado por esfera de governo</p>
        </div>
      </div>
      
      <div class="chart-container">
        <div class="chart-header">
          <div class="chart-title">Execução Orçamentária por Esfera (2018-2026)</div>
          <div class="chart-subtitle">Valores em milhões de reais - Federal, Estadual e Municipal</div>
        </div>
        <div class="chart-wrapper">
          <canvas id="evolucaoChart"></canvas>
        </div>
        <p class="chart-source">
          <strong>Fontes:</strong> ${fontes.slice(0, 3).join(', ') || 'SIOP/Portal da Transparência'} | 
          <strong>Elaboração:</strong> CDG/UFF - Sistema de Monitoramento CERD | 
          <strong>Data:</strong> ${dataGeracao}
        </p>
      </div>

      <!-- Tabela de Evolução Anual -->
      <div class="table-container">
        <div class="table-header">
          <h3>Tabela 1: Evolução da Execução Orçamentária por Ano e Esfera (2018-2026)</h3>
          <p>Valores em reais - Consolidação de todos os programas de políticas raciais</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>Ano</th>
              <th>Federal</th>
              <th>Estadual</th>
              <th>Municipal</th>
              <th>Total</th>
              <th>Variação Anual</th>
            </tr>
          </thead>
          <tbody>
            ${evolucaoAnual.map((ano, idx) => {
              const anterior = idx > 0 ? evolucaoAnual[idx - 1].total : 0;
              const variacao = anterior > 0 ? ((ano.total - anterior) / anterior * 100) : 0;
              return `
                <tr>
                  <td><strong>${ano.ano}</strong></td>
                  <td>${formatFullCurrency(ano.federal)}</td>
                  <td>${formatFullCurrency(ano.estadual)}</td>
                  <td>${formatFullCurrency(ano.municipal)}</td>
                  <td><strong>${formatFullCurrency(ano.total)}</strong></td>
                  <td class="${variacao > 0 ? 'trend-up' : variacao < 0 ? 'trend-down' : 'trend-stable'}">
                    ${idx === 0 ? '-' : `${variacao >= 0 ? '+' : ''}${variacao.toFixed(1)}%`}
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        <div class="table-footer">
          <strong>Fonte:</strong> ${fontes.slice(0, 2).join(', ') || 'SIOP/Portal da Transparência'} | 
          <strong>Nota:</strong> Valores referentes ao montante efetivamente pago (empenhado e liquidado)
        </div>
      </div>
    </div>
  </section>

  <!-- Análise por Esfera -->
  ${Object.entries(byEsfera).filter(([_, registros]) => registros.length > 0).map(([esfera, registros]) => {
    const programasEsfera: Record<string, any[]> = {};
    registros.forEach((r: any) => {
      if (!programasEsfera[r.programa]) programasEsfera[r.programa] = [];
      programasEsfera[r.programa].push(r);
    });
    
    const totalEsfera = registros.reduce((acc: number, o: any) => acc + parseFloat(o.pago || 0), 0);
    
    return `
    <section class="section">
      <div class="container">
        <div class="section-header">
          <div class="section-icon">${esfera === 'federal' ? '🏛️' : esfera === 'estadual' ? '🗺️' : '🏙️'}</div>
          <div>
            <h2 class="section-title">Esfera ${esferaLabels[esfera] || esfera}</h2>
            <p class="section-subtitle">Total: R$ ${formatCurrency(totalEsfera)} | ${Object.keys(programasEsfera).length} programas</p>
          </div>
        </div>
        
        ${Object.entries(programasEsfera).map(([programa, regs], idx) => `
          <div class="table-container">
            <div class="table-header">
              <h3>Tabela ${idx + 2}: ${programa}</h3>
              <p>Órgão: ${(regs as any[])[0]?.orgao || '-'} | Grupo Focal: ${grupoLabels[(regs as any[])[0]?.grupo_focal] || 'Geral'}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Ano</th>
                  <th>Dotação Autorizada</th>
                  <th>Empenhado</th>
                  <th>Liquidado</th>
                  <th>Pago</th>
                  <th>Execução</th>
                </tr>
              </thead>
              <tbody>
                ${(regs as any[]).sort((a, b) => a.ano - b.ano).map((r: any) => `
                  <tr>
                    <td><strong>${r.ano}</strong></td>
                    <td>${formatFullCurrency(r.dotacao_autorizada || 0)}</td>
                    <td>${formatFullCurrency(r.empenhado || 0)}</td>
                    <td>${formatFullCurrency(r.liquidado || 0)}</td>
                    <td><strong>${formatFullCurrency(r.pago || 0)}</strong></td>
                    <td class="${(r.percentual_execucao || 0) >= 75 ? 'trend-up' : (r.percentual_execucao || 0) < 50 ? 'trend-down' : ''}">${r.percentual_execucao || 0}%</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="table-footer">
              <strong>Fonte:</strong> ${(regs as any[])[0]?.fonte_dados || 'SIOP'} | 
              ${(regs as any[])[0]?.url_fonte ? `<a href="${(regs as any[])[0]?.url_fonte}" target="_blank">Acessar fonte original</a> | ` : ''}
              ${(regs as any[])[0]?.observacoes ? `<strong>Obs:</strong> ${(regs as any[])[0]?.observacoes}` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </section>
    `;
  }).join('')}

  <!-- Análise por Grupo Focal -->
  <section class="section section-alt">
    <div class="container">
      <div class="section-header">
        <div class="section-icon">👥</div>
        <div>
          <h2 class="section-title">Distribuição por Grupo Focal</h2>
          <p class="section-subtitle">Orçamento destinado a cada grupo populacional específico</p>
        </div>
      </div>
      
      <div class="grid-2">
        <div class="chart-container">
          <div class="chart-header">
            <div class="chart-title">Distribuição por Grupo Focal</div>
            <div class="chart-subtitle">Total executado (2018-2026)</div>
          </div>
          <div class="chart-wrapper">
            <canvas id="grupoChart"></canvas>
          </div>
        </div>
        
        <div class="table-container">
          <div class="table-header">
            <h3>Comparativo 2018-2022 vs 2023-2026 por Grupo</h3>
            <p>Variação percentual entre os períodos</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Grupo Focal</th>
                <th>2018-2022</th>
                <th>2023-2026</th>
                <th>Variação</th>
              </tr>
            </thead>
            <tbody>
              ${Object.entries(byGrupo).map(([grupo, regs]) => {
                const p1 = (regs as any[]).filter((r: any) => r.ano <= 2022).reduce((acc: number, r: any) => acc + parseFloat(r.pago || 0), 0);
                const p2 = (regs as any[]).filter((r: any) => r.ano >= 2023).reduce((acc: number, r: any) => acc + parseFloat(r.pago || 0), 0);
                const variacao = p1 > 0 ? ((p2 - p1) / p1 * 100) : (p2 > 0 ? 100 : 0);
                return `
                  <tr>
                    <td>${grupoLabels[grupo] || grupo}</td>
                    <td>${formatFullCurrency(p1)}</td>
                    <td>${formatFullCurrency(p2)}</td>
                    <td class="${variacao > 0 ? 'trend-up' : variacao < 0 ? 'trend-down' : ''}">${variacao >= 0 ? '+' : ''}${variacao.toFixed(0)}%</td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>

  <!-- Cruzamento com Indicadores -->
  <section class="section">
    <div class="container">
      <div class="section-header">
        <div class="section-icon">🔗</div>
        <div>
          <h2 class="section-title">Cruzamento: Orçamento × Indicadores Sociais</h2>
          <p class="section-subtitle">Correlação entre investimento público e evolução dos indicadores da população negra</p>
        </div>
      </div>
      
      <div class="table-container">
        <div class="table-header">
          <h3>Tabela: Indicadores Socioeconômicos da População Negra × Execução Orçamentária</h3>
          <p>Valores desagregados por raça com evolução temporal e análise comparativa</p>
        </div>
        <table>
          <thead>
            <tr>
              <th style="width: 15%;">Indicador</th>
              <th style="width: 10%;">Categoria</th>
              <th style="width: 18%;">Pop. Negra (valores)</th>
              <th style="width: 18%;">Pop. Branca (valores)</th>
              <th style="width: 8%;">Tendência</th>
              <th style="width: 31%;">Análise Interseccional</th>
            </tr>
          </thead>
          <tbody>
            ${indicadores.slice(0, 15).map((ind: any) => {
              // Extrair dados por raça do indicador
              const dados = ind.dados || {};
              const negros = dados.negros || dados.negras || dados.pretos_pardos || {};
              const brancos = dados.brancos || dados.brancas || {};
              
              // Pegar anos disponíveis
              const anosNegros = Object.keys(negros).filter(k => !isNaN(Number(k))).sort();
              const anosBrancos = Object.keys(brancos).filter(k => !isNaN(Number(k))).sort();
              
              // Formatar valores da pop negra
              let valoresNegros = '-';
              if (anosNegros.length > 0) {
                const ultimoAno = anosNegros[anosNegros.length - 1];
                const penultimoAno = anosNegros.length > 1 ? anosNegros[anosNegros.length - 2] : null;
                const valorAtual = negros[ultimoAno];
                const valorAnterior = penultimoAno ? negros[penultimoAno] : null;
                
                if (valorAnterior !== null) {
                  valoresNegros = '<strong>' + ultimoAno + ':</strong> ' + valorAtual + '%<br><span style="color: var(--text-muted);">' + penultimoAno + ': ' + valorAnterior + '%</span>';
                } else {
                  valoresNegros = '<strong>' + ultimoAno + ':</strong> ' + valorAtual + '%';
                }
              }
              
              // Formatar valores da pop branca
              let valoresBrancos = '-';
              if (anosBrancos.length > 0) {
                const ultimoAno = anosBrancos[anosBrancos.length - 1];
                const penultimoAno = anosBrancos.length > 1 ? anosBrancos[anosBrancos.length - 2] : null;
                const valorAtual = brancos[ultimoAno];
                const valorAnterior = penultimoAno ? brancos[penultimoAno] : null;
                
                if (valorAnterior !== null) {
                  valoresBrancos = '<strong>' + ultimoAno + ':</strong> ' + valorAtual + '%<br><span style="color: var(--text-muted);">' + penultimoAno + ': ' + valorAnterior + '%</span>';
                } else {
                  valoresBrancos = '<strong>' + ultimoAno + ':</strong> ' + valorAtual + '%';
                }
              }
              
              return '<tr>' +
                '<td><strong>' + ind.nome + '</strong><br><span style="font-size: 0.7rem; color: var(--text-muted);">Fonte: ' + ind.fonte + '</span></td>' +
                '<td>' + ind.categoria + '</td>' +
                '<td style="font-size: 0.85rem;">' + valoresNegros + '</td>' +
                '<td style="font-size: 0.85rem;">' + valoresBrancos + '</td>' +
                '<td class="' + (ind.tendencia === 'reducao' ? 'trend-up' : ind.tendencia === 'aumento' ? 'trend-down' : '') + '">' + (ind.tendencia || '-') + '</td>' +
                '<td style="font-size: 0.8rem; line-height: 1.4;">' + (ind.analise_interseccional || '-') + '</td>' +
              '</tr>';
            }).join('')}
          </tbody>
        </table>
        <div class="table-footer">
          <strong>Fontes:</strong> IBGE/PNAD Contínua, IPEA, DataSUS/SIM, INEP/Censo Escolar, MDS/CadÚnico | 
          <strong>Período:</strong> 2018-2026 | 
          <strong>Nota:</strong> Valores percentuais referentes às taxas oficiais publicadas pelos órgãos de origem
        </div>
      </div>
    </div>
  </section>

  <!-- Fontes e Referências -->
  <section class="section section-alt">
    <div class="container">
      <div class="sources-section">
        <h4>📚 Fontes de Dados e Referências</h4>
        <ul class="sources-list">
          ${fontes.map(f => `<li>${f}</li>`).join('')}
          ${urls.slice(0, 5).map(u => `<li><a href="${u}" target="_blank">${u}</a></li>`).join('')}
          <li>Sistema Integrado de Planejamento e Orçamento (SIOP)</li>
          <li>Portal da Transparência do Governo Federal</li>
          <li>Secretarias Estaduais de Promoção da Igualdade Racial</li>
          <li>Lei Orçamentária Anual (LOA) 2018-2026</li>
        </ul>
      </div>
    </div>
  </section>

  <footer class="footer">
    <div class="container footer-content">
      <p><strong>Relatório Orçamentário - Políticas de Igualdade Racial (2018-2026)</strong></p>
      <p>Gerado automaticamente pelo Sistema de Monitoramento CERD Brasil</p>
      <p style="margin-top: 12px;">
        <strong>CDG/UFF</strong> • Grupo de Pesquisa sobre Tratados de Direitos Humanos<br>
        <strong>MIR</strong> • Ministério da Igualdade Racial<br>
        <strong>MRE</strong> • Ministério das Relações Exteriores
      </p>
      <p style="margin-top: 12px; opacity: 0.5;">Data de geração: ${dataGeracao}</p>
    </div>
  </footer>

  <script>
    document.addEventListener('DOMContentLoaded', function() {
      // Gráfico de Evolução por Esfera
      const evolucaoCtx = document.getElementById('evolucaoChart');
      if (evolucaoCtx) {
        new Chart(evolucaoCtx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(evolucaoAnual.map(a => a.ano))},
            datasets: [
              {
                label: 'Federal',
                data: ${JSON.stringify(evolucaoAnual.map(a => a.federal / 1000000))},
                backgroundColor: '#1e40af',
                stack: 'Stack 0',
              },
              {
                label: 'Estadual',
                data: ${JSON.stringify(evolucaoAnual.map(a => a.estadual / 1000000))},
                backgroundColor: '#7c3aed',
                stack: 'Stack 0',
              },
              {
                label: 'Municipal',
                data: ${JSON.stringify(evolucaoAnual.map(a => a.municipal / 1000000))},
                backgroundColor: '#059669',
                stack: 'Stack 0',
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'bottom' },
              title: { display: false }
            },
            scales: {
              y: {
                beginAtZero: true,
                stacked: true,
                title: { display: true, text: 'Milhões (R$)' }
              },
              x: { stacked: true }
            }
          }
        });
      }

      // Gráfico por Grupo Focal
      const grupoData = ${JSON.stringify(Object.entries(byGrupo).map(([g, regs]) => ({
        label: grupoLabels[g] || g,
        value: (regs as any[]).reduce((acc: number, r: any) => acc + parseFloat(r.pago || 0), 0) / 1000000
      })))};
      
      const grupoCtx = document.getElementById('grupoChart');
      if (grupoCtx) {
        new Chart(grupoCtx, {
          type: 'doughnut',
          data: {
            labels: grupoData.map(g => g.label),
            datasets: [{
              data: grupoData.map(g => g.value),
              backgroundColor: ['#047857', '#1e40af', '#7c3aed', '#dc2626', '#eab308', '#ec4899', '#06b6d4', '#f97316'],
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'right', labels: { font: { size: 10 } } }
            }
          }
        });
      }
    });
  </script>
</body>
</html>`;
}

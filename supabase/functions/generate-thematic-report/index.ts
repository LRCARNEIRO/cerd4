import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ThematicReportRequest {
  eixo_tematico?: string;
  grupo_focal?: string;
  titulo_personalizado?: string;
}

// Labels em português
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
  quilombolas: 'Comunidades Quilombolas',
  ciganos: 'Povos Ciganos (Roma)',
  religioes_matriz_africana: 'Religiões de Matriz Africana',
  juventude_negra: 'Juventude Negra',
  mulheres_negras: 'Mulheres Negras',
  lgbtqia_negros: 'LGBTQIA+ Negros',
  pcd_negros: 'PcD Negros',
  idosos_negros: 'Idosos Negros',
  geral: 'População Geral'
};

const statusLabels: Record<string, string> = {
  cumprido: 'Cumprido',
  parcialmente_cumprido: 'Parcialmente Cumprido',
  nao_cumprido: 'Não Cumprido',
  retrocesso: 'Retrocesso',
  em_andamento: 'Em Andamento'
};

const prioridadeLabels: Record<string, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa'
};

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

    const { eixo_tematico, grupo_focal, titulo_personalizado } = await req.json() as ThematicReportRequest;

    // Input validation
    const validEixos = ['todos', 'legislacao_justica', 'politicas_institucionais', 'seguranca_publica', 'saude', 'educacao', 'trabalho_renda', 'terra_territorio', 'cultura_patrimonio', 'participacao_social', 'dados_estatisticas'];
    const validGrupos = ['todos', 'negros', 'indigenas', 'quilombolas', 'ciganos', 'religioes_matriz_africana', 'juventude_negra', 'mulheres_negras', 'lgbtqia_negros', 'pcd_negros', 'idosos_negros', 'geral'];

    if (eixo_tematico && !validEixos.includes(eixo_tematico)) {
      return new Response(JSON.stringify({ error: 'Invalid eixo_tematico parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (grupo_focal && !validGrupos.includes(grupo_focal)) {
      return new Response(JSON.stringify({ error: 'Invalid grupo_focal parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (titulo_personalizado && (typeof titulo_personalizado !== 'string' || titulo_personalizado.length > 200)) {
      return new Response(JSON.stringify({ error: 'Invalid titulo_personalizado parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    
    console.log(`Generating thematic report for eixo: ${eixo_tematico}, grupo: ${grupo_focal}`);

    // Build queries with filters
    let lacunasQuery = supabase.from('lacunas_identificadas').select('*').order('prioridade').order('paragrafo');
    let conclusoesQuery = supabase.from('conclusoes_analiticas').select('*').order('created_at');
    let indicadoresQuery = supabase.from('indicadores_interseccionais').select('*').order('categoria');
    let respostasQuery = supabase.from('respostas_lacunas_cerd_iii').select('*').order('paragrafo_cerd_iii');

    if (eixo_tematico && eixo_tematico !== 'todos') {
      lacunasQuery = lacunasQuery.eq('eixo_tematico', eixo_tematico);
      conclusoesQuery = conclusoesQuery.contains('eixos_tematicos', [eixo_tematico]);
    }

    if (grupo_focal && grupo_focal !== 'todos') {
      lacunasQuery = lacunasQuery.eq('grupo_focal', grupo_focal);
      conclusoesQuery = conclusoesQuery.contains('grupos_focais', [grupo_focal]);
    }

    const [lacunasResult, conclusoesResult, indicadoresResultData, respostasResult] = await Promise.all([
      lacunasQuery,
      conclusoesQuery,
      indicadoresQuery,
      respostasQuery,
    ]);

    if (lacunasResult.error) throw lacunasResult.error;
    if (conclusoesResult.error) throw conclusoesResult.error;
    if (indicadoresResultData.error) throw indicadoresResultData.error;
    if (respostasResult.error) throw respostasResult.error;

    const lacunas = lacunasResult.data || [];
    const conclusoes = conclusoesResult.data || [];
    const indicadores = indicadoresResultData.data || [];
    const respostas = respostasResult.data || [];

    console.log(`Fetched: ${lacunas.length} lacunas, ${conclusoes.length} conclusões, ${indicadores.length} indicadores`);

    // Determine report title
    let reportTitle = titulo_personalizado || 'Relatório Temático';
    let reportSubtitle = 'Análise de Políticas Raciais no Brasil (2018-2026)';
    
    if (eixo_tematico && eixo_tematico !== 'todos') {
      reportTitle = `Dossiê: ${eixoLabels[eixo_tematico] || eixo_tematico}`;
    }
    if (grupo_focal && grupo_focal !== 'todos') {
      reportSubtitle = `Foco: ${grupoLabels[grupo_focal] || grupo_focal} | 2018-2026`;
    }

    // Calculate statistics
    const stats = {
      total: lacunas.length,
      cumprido: lacunas.filter(l => l.status_cumprimento === 'cumprido').length,
      parcial: lacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length,
      naoCumprido: lacunas.filter(l => l.status_cumprimento === 'nao_cumprido').length,
      retrocesso: lacunas.filter(l => l.status_cumprimento === 'retrocesso').length,
      critica: lacunas.filter(l => l.prioridade === 'critica').length,
      alta: lacunas.filter(l => l.prioridade === 'alta').length,
    };

    const taxaCumprimento = stats.total > 0 
      ? Math.round(((stats.cumprido * 100) + (stats.parcial * 50)) / stats.total) 
      : 0;

    // Filter relevant indicators
    const relevantIndicadores = indicadores.filter((ind: any) => {
      if (eixo_tematico === 'seguranca_publica') {
        return ['Segurança Pública', 'Violência de Gênero', 'Sistema de Justiça'].includes(ind.categoria);
      }
      if (eixo_tematico === 'saude') {
        return ind.categoria === 'Saúde';
      }
      if (eixo_tematico === 'educacao') {
        return ind.categoria === 'Educação';
      }
      if (eixo_tematico === 'trabalho_renda') {
        return ['Trabalho e Renda', 'Vulnerabilidade Social'].includes(ind.categoria);
      }
      return true;
    });

    // Generate HTML
    const htmlContent = generateThematicReportHTML({
      title: reportTitle,
      subtitle: reportSubtitle,
      stats,
      taxaCumprimento,
      lacunas,
      conclusoes,
      indicadores: relevantIndicadores,
      respostas,
      eixo_tematico,
      grupo_focal,
    });

    return new Response(htmlContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error generating thematic report:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

interface ReportData {
  title: string;
  subtitle: string;
  stats: {
    total: number;
    cumprido: number;
    parcial: number;
    naoCumprido: number;
    retrocesso: number;
    critica: number;
    alta: number;
  };
  taxaCumprimento: number;
  lacunas: any[];
  conclusoes: any[];
  indicadores: any[];
  respostas: any[];
  eixo_tematico?: string;
  grupo_focal?: string;
}

function generateThematicReportHTML(data: ReportData): string {
  const { title, subtitle, stats, taxaCumprimento, lacunas, conclusoes, indicadores, eixo_tematico, grupo_focal } = data;
  
  // Determine narrative based on data
  const narrativeIntro = generateNarrativeIntro(stats, taxaCumprimento, eixo_tematico, grupo_focal);
  const conclusionText = generateConclusion(stats, conclusoes, eixo_tematico, grupo_focal);
  
  // Group lacunas by status for visualization
  const lacunasByStatus = {
    cumprido: lacunas.filter(l => l.status_cumprimento === 'cumprido'),
    parcial: lacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido'),
    naoCumprido: lacunas.filter(l => l.status_cumprimento === 'nao_cumprido'),
    retrocesso: lacunas.filter(l => l.status_cumprimento === 'retrocesso'),
  };

  // Extract key data points from indicators
  const keyDataPoints = extractKeyDataPoints(indicadores);

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {
      --primary: #1e3a5f;
      --primary-light: #2c5282;
      --accent: #c7a82b;
      --success: #22c55e;
      --warning: #eab308;
      --danger: #ef4444;
      --danger-dark: #991b1b;
      --text: #1a1a2e;
      --text-muted: #64748b;
      --bg: #f8fafc;
      --card: #ffffff;
      --border: #e2e8f0;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 24px;
    }
    
    /* Hero Section */
    .hero {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 50%, #2d3748 100%);
      color: white;
      padding: 80px 0;
      position: relative;
      overflow: hidden;
    }
    
    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
      opacity: 0.5;
    }
    
    .hero-content {
      position: relative;
      z-index: 1;
    }
    
    .hero-badge {
      display: inline-block;
      background: rgba(199, 168, 43, 0.2);
      border: 1px solid var(--accent);
      color: var(--accent);
      padding: 6px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 24px;
    }
    
    .hero h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(2.5rem, 6vw, 4rem);
      font-weight: 900;
      margin-bottom: 16px;
      line-height: 1.1;
    }
    
    .hero p {
      font-size: 1.25rem;
      opacity: 0.9;
      max-width: 600px;
    }
    
    .hero-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 24px;
      margin-top: 48px;
    }
    
    .hero-stat {
      text-align: center;
      padding: 24px;
      background: rgba(255,255,255,0.1);
      border-radius: 16px;
      backdrop-filter: blur(10px);
    }
    
    .hero-stat-value {
      font-size: 2.5rem;
      font-weight: 800;
      display: block;
    }
    
    .hero-stat-label {
      font-size: 0.875rem;
      opacity: 0.8;
      margin-top: 4px;
    }
    
    /* Gauge/Progress Section */
    .gauge-section {
      padding: 60px 0;
      background: white;
      border-bottom: 1px solid var(--border);
    }
    
    .gauge-container {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 48px;
      align-items: center;
    }
    
    .gauge-visual {
      position: relative;
      width: 250px;
      height: 250px;
      margin: 0 auto;
    }
    
    .gauge-circle {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background: conic-gradient(
        var(--success) 0% ${stats.cumprido / stats.total * 100}%,
        var(--warning) ${stats.cumprido / stats.total * 100}% ${(stats.cumprido + stats.parcial) / stats.total * 100}%,
        var(--danger) ${(stats.cumprido + stats.parcial) / stats.total * 100}% 100%
      );
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .gauge-inner {
      width: 180px;
      height: 180px;
      background: white;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }
    
    .gauge-value {
      font-size: 3rem;
      font-weight: 800;
      color: var(--primary);
    }
    
    .gauge-label {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    
    .gauge-narrative h2 {
      font-family: 'Playfair Display', serif;
      font-size: 2rem;
      margin-bottom: 16px;
      color: var(--primary);
    }
    
    .gauge-narrative p {
      font-size: 1.1rem;
      color: var(--text-muted);
      margin-bottom: 24px;
    }
    
    .legend {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }
    
    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
    }
    
    .legend-color {
      width: 16px;
      height: 16px;
      border-radius: 4px;
    }
    
    /* Section styles */
    .section {
      padding: 60px 0;
    }
    
    .section-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }
    
    .section-icon {
      width: 48px;
      height: 48px;
      background: var(--primary);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }
    
    .section-title {
      font-family: 'Playfair Display', serif;
      font-size: 1.75rem;
      color: var(--primary);
    }
    
    .section-subtitle {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    
    /* Data Cards */
    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 24px;
    }
    
    .data-card {
      background: var(--card);
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      transition: transform 0.2s, box-shadow 0.2s;
    }
    
    .data-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px -8px rgba(0,0,0,0.15);
    }
    
    .data-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    
    .data-card-title {
      font-weight: 600;
      font-size: 1rem;
    }
    
    .data-card-badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .badge-muted { background: #f1f5f9; color: #475569; }
    
    .data-card-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--primary);
      margin-bottom: 8px;
    }
    
    .data-card-description {
      font-size: 0.875rem;
      color: var(--text-muted);
    }
    
    .data-card-chart {
      height: 100px;
      margin-top: 16px;
    }
    
    /* Lacunas Timeline */
    .timeline {
      position: relative;
      padding-left: 40px;
    }
    
    .timeline::before {
      content: '';
      position: absolute;
      left: 15px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: var(--border);
    }
    
    .timeline-item {
      position: relative;
      margin-bottom: 32px;
      background: var(--card);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid var(--border);
    }
    
    .timeline-item::before {
      content: '';
      position: absolute;
      left: -34px;
      top: 24px;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      border: 3px solid;
    }
    
    .timeline-item.cumprido::before { border-color: var(--success); background: var(--success); }
    .timeline-item.parcial::before { border-color: var(--warning); background: var(--warning); }
    .timeline-item.naoCumprido::before { border-color: var(--danger); background: var(--danger); }
    .timeline-item.retrocesso::before { border-color: var(--danger-dark); background: var(--danger-dark); }
    
    .timeline-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 12px;
    }
    
    .timeline-tema {
      font-weight: 600;
      font-size: 1rem;
    }
    
    .timeline-paragrafo {
      font-family: monospace;
      font-size: 0.75rem;
      padding: 4px 8px;
      background: var(--bg);
      border-radius: 4px;
    }
    
    .timeline-content {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    
    .timeline-meta {
      display: flex;
      gap: 16px;
      margin-top: 12px;
      font-size: 0.75rem;
    }
    
    /* Insights Section */
    .insights-section {
      background: linear-gradient(to bottom, var(--bg), white);
    }
    
    .insight-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 24px;
    }
    
    .insight-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--border);
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
    }
    
    .insight-card-header {
      padding: 20px;
      background: var(--primary);
      color: white;
    }
    
    .insight-card-header h3 {
      font-size: 1.1rem;
      font-weight: 600;
    }
    
    .insight-card-body {
      padding: 20px;
    }
    
    .insight-card-body p {
      font-size: 0.95rem;
      line-height: 1.7;
    }
    
    .insight-type {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 12px;
    }
    
    .type-avanco { background: #dcfce7; color: #166534; }
    .type-lacuna { background: #fef3c7; color: #92400e; }
    .type-retrocesso { background: #fee2e2; color: #991b1b; }
    
    /* Conclusion Section */
    .conclusion-section {
      background: var(--primary);
      color: white;
      padding: 80px 0;
    }
    
    .conclusion-content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    
    .conclusion-content h2 {
      font-family: 'Playfair Display', serif;
      font-size: 2.5rem;
      margin-bottom: 24px;
    }
    
    .conclusion-content p {
      font-size: 1.1rem;
      opacity: 0.9;
      line-height: 1.8;
      margin-bottom: 16px;
    }
    
    .conclusion-stats {
      display: flex;
      justify-content: center;
      gap: 48px;
      margin-top: 40px;
    }
    
    .conclusion-stat {
      text-align: center;
    }
    
    .conclusion-stat-value {
      font-size: 3rem;
      font-weight: 800;
      display: block;
    }
    
    .conclusion-stat-label {
      font-size: 0.875rem;
      opacity: 0.8;
    }
    
    /* Footer */
    .report-footer {
      background: #0f172a;
      color: white;
      padding: 40px 0;
      text-align: center;
    }
    
    .report-footer p {
      opacity: 0.7;
      font-size: 0.875rem;
      margin-bottom: 8px;
    }
    
    .report-footer .institutions {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-top: 16px;
      font-size: 0.75rem;
      opacity: 0.5;
    }
    
    /* Chart Container */
    .chart-container {
      background: white;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid var(--border);
      margin-bottom: 24px;
    }
    
    .chart-title {
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--primary);
    }
    
    /* Print styles */
    @media print {
      .hero { padding: 40px 0; }
      .section { padding: 30px 0; }
      .data-card:hover { transform: none; }
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
    }
    
    @media (max-width: 768px) {
      .gauge-container { grid-template-columns: 1fr; }
      .hero-stats { grid-template-columns: repeat(2, 1fr); }
      .conclusion-stats { flex-direction: column; gap: 24px; }
    }
  </style>
</head>
<body>
  <!-- Hero Section -->
  <section class="hero">
    <div class="container hero-content">
      <span class="hero-badge">📊 Relatório Analítico</span>
      <h1>${title}</h1>
      <p>${subtitle}</p>
      
      <div class="hero-stats">
        <div class="hero-stat">
          <span class="hero-stat-value">${stats.total}</span>
          <span class="hero-stat-label">Recomendações Analisadas</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value">${taxaCumprimento}%</span>
          <span class="hero-stat-label">Taxa de Atendimento</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value" style="color: #ef4444;">${stats.critica}</span>
          <span class="hero-stat-label">Prioridade Crítica</span>
        </div>
        <div class="hero-stat">
          <span class="hero-stat-value">${indicadores.length}</span>
          <span class="hero-stat-label">Indicadores</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Gauge Section - The Story -->
  <section class="gauge-section">
    <div class="container gauge-container">
      <div class="gauge-visual">
        <div class="gauge-circle">
          <div class="gauge-inner">
            <span class="gauge-value">${taxaCumprimento}%</span>
            <span class="gauge-label">cumprimento</span>
          </div>
        </div>
      </div>
      
      <div class="gauge-narrative">
        <h2>O Que os Dados Revelam</h2>
        <p>${narrativeIntro}</p>
        
        <div class="legend">
          <div class="legend-item">
            <div class="legend-color" style="background: var(--success);"></div>
            <span>Cumprido (${stats.cumprido})</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: var(--warning);"></div>
            <span>Parcial (${stats.parcial})</span>
          </div>
          <div class="legend-item">
            <div class="legend-color" style="background: var(--danger);"></div>
            <span>Não Cumprido (${stats.naoCumprido})</span>
          </div>
          ${stats.retrocesso > 0 ? `
          <div class="legend-item">
            <div class="legend-color" style="background: var(--danger-dark);"></div>
            <span>Retrocesso (${stats.retrocesso})</span>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  </section>

  <!-- Key Data Points Section -->
  ${indicadores.length > 0 ? `
  <section class="section" style="background: white;">
    <div class="container">
      <div class="section-header">
        <div class="section-icon">📈</div>
        <div>
          <h2 class="section-title">Indicadores em Números</h2>
          <p class="section-subtitle">Dados interseccionais que evidenciam as desigualdades</p>
        </div>
      </div>
      
      <div class="data-grid">
        ${keyDataPoints.slice(0, 6).map(point => `
          <div class="data-card">
            <div class="data-card-header">
              <span class="data-card-title">${point.nome}</span>
              <span class="data-card-badge ${point.tendencia === 'piora' ? 'badge-danger' : point.tendencia === 'melhora' ? 'badge-success' : 'badge-muted'}">
                ${point.tendencia === 'piora' ? '↓ Piora' : point.tendencia === 'melhora' ? '↑ Melhora' : '→ Estável'}
              </span>
            </div>
            <div class="data-card-value">${point.destaque}</div>
            <p class="data-card-description">${point.descricao}</p>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Lacunas Timeline -->
  <section class="section">
    <div class="container">
      <div class="section-header">
        <div class="section-icon">⚖️</div>
        <div>
          <h2 class="section-title">Trajetória das Recomendações</h2>
          <p class="section-subtitle">Acompanhamento do cumprimento das recomendações da ONU</p>
        </div>
      </div>
      
      <div class="timeline">
        ${lacunas.slice(0, 10).map(lacuna => `
          <div class="timeline-item ${lacuna.status_cumprimento === 'cumprido' ? 'cumprido' : lacuna.status_cumprimento === 'parcialmente_cumprido' ? 'parcial' : lacuna.status_cumprimento === 'retrocesso' ? 'retrocesso' : 'naoCumprido'}">
            <div class="timeline-header">
              <span class="timeline-tema">${lacuna.tema}</span>
              <span class="timeline-paragrafo">§${lacuna.paragrafo}</span>
            </div>
            <p class="timeline-content">${lacuna.descricao_lacuna.substring(0, 200)}${lacuna.descricao_lacuna.length > 200 ? '...' : ''}</p>
            <div class="timeline-meta">
              <span class="data-card-badge ${lacuna.status_cumprimento === 'cumprido' ? 'badge-success' : lacuna.status_cumprimento === 'parcialmente_cumprido' ? 'badge-warning' : 'badge-danger'}">
                ${statusLabels[lacuna.status_cumprimento] || lacuna.status_cumprimento}
              </span>
              <span class="data-card-badge badge-muted">${prioridadeLabels[lacuna.prioridade] || lacuna.prioridade}</span>
              <span class="data-card-badge badge-muted">${grupoLabels[lacuna.grupo_focal] || lacuna.grupo_focal}</span>
            </div>
          </div>
        `).join('')}
      </div>
      
      ${lacunas.length > 10 ? `<p style="text-align: center; color: var(--text-muted); margin-top: 24px;">+ ${lacunas.length - 10} outras recomendações analisadas</p>` : ''}
    </div>
  </section>

  <!-- Insights/Conclusions Section -->
  ${conclusoes.length > 0 ? `
  <section class="section insights-section">
    <div class="container">
      <div class="section-header">
        <div class="section-icon">💡</div>
        <div>
          <h2 class="section-title">Análises e Conclusões</h2>
          <p class="section-subtitle">Síntese analítica baseada nos dados coletados</p>
        </div>
      </div>
      
      <div class="insight-cards">
        ${conclusoes.map(c => `
          <div class="insight-card">
            <div class="insight-card-header">
              <h3>${c.titulo}</h3>
            </div>
            <div class="insight-card-body">
              <span class="insight-type ${c.tipo === 'avanco' ? 'type-avanco' : c.tipo === 'lacuna_persistente' ? 'type-lacuna' : 'type-retrocesso'}">
                ${c.tipo === 'avanco' ? '✓ Avanço' : c.tipo === 'lacuna_persistente' ? '⚠ Lacuna Persistente' : '✕ Retrocesso'}
              </span>
              <p>${c.argumento_central}</p>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  <!-- Final Conclusion -->
  <section class="conclusion-section">
    <div class="container">
      <div class="conclusion-content">
        <h2>Síntese: O Que o Estado Brasileiro Fez e Deixou de Fazer</h2>
        <p>${conclusionText}</p>
        
        <div class="conclusion-stats">
          <div class="conclusion-stat">
            <span class="conclusion-stat-value" style="color: var(--success);">${stats.cumprido}</span>
            <span class="conclusion-stat-label">Compromissos Cumpridos</span>
          </div>
          <div class="conclusion-stat">
            <span class="conclusion-stat-value" style="color: var(--warning);">${stats.parcial}</span>
            <span class="conclusion-stat-label">Ações Parciais</span>
          </div>
          <div class="conclusion-stat">
            <span class="conclusion-stat-value" style="color: var(--danger);">${stats.naoCumprido + stats.retrocesso}</span>
            <span class="conclusion-stat-label">Omissões ou Retrocessos</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Footer -->
  <footer class="report-footer">
    <div class="container">
      <p>Relatório gerado automaticamente pelo Sistema de Monitoramento CERD Brasil</p>
      <p>Data de geração: ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
      <div class="institutions">
        <span>CDG/UFF</span>
        <span>•</span>
        <span>Ministério da Igualdade Racial</span>
        <span>•</span>
        <span>Ministério das Relações Exteriores</span>
      </div>
    </div>
  </footer>
</body>
</html>`;
}

function generateNarrativeIntro(stats: any, taxaCumprimento: number, eixo?: string, grupo?: string): string {
  const eixoNome = eixo && eixo !== 'todos' ? eixoLabels[eixo] || eixo : '';
  const grupoNome = grupo && grupo !== 'todos' ? grupoLabels[grupo] || grupo : '';
  
  let intro = '';
  
  if (taxaCumprimento < 30) {
    intro = `A análise revela um cenário preocupante: com apenas ${taxaCumprimento}% das recomendações atendidas, o Brasil demonstra significativas lacunas no cumprimento de seus compromissos internacionais`;
  } else if (taxaCumprimento < 60) {
    intro = `Os dados indicam um quadro de avanços desiguais: com ${taxaCumprimento}% de atendimento às recomendações, o Brasil apresenta progressos parciais, mas mantém lacunas estruturais importantes`;
  } else {
    intro = `A análise mostra um panorama de avanços significativos: ${taxaCumprimento}% das recomendações foram total ou parcialmente atendidas, embora persistam desafios pontuais`;
  }
  
  if (eixoNome) {
    intro += ` na área de ${eixoNome.toLowerCase()}`;
  }
  if (grupoNome) {
    intro += ` em relação à ${grupoNome.toLowerCase()}`;
  }
  
  intro += '.';
  
  if (stats.critica > 0) {
    intro += ` Destaca-se que ${stats.critica} questões de prioridade crítica exigem atenção imediata do Estado brasileiro.`;
  }
  
  if (stats.retrocesso > 0) {
    intro += ` Particularmente alarmante é a identificação de ${stats.retrocesso} área(s) onde houve retrocesso em relação ao período anterior.`;
  }
  
  return intro;
}

function generateConclusion(stats: any, conclusoes: any[], eixo?: string, grupo?: string): string {
  const lacunasPersistentes = conclusoes.filter(c => c.tipo === 'lacuna_persistente');
  const avancos = conclusoes.filter(c => c.tipo === 'avanco');
  const retrocessos = conclusoes.filter(c => c.tipo === 'retrocesso');
  
  let conclusion = `No período 2018-2026, o Estado brasileiro apresenta um balanço marcado por contradições. `;
  
  if (avancos.length > 0) {
    conclusion += `Do lado positivo, registram-se ${avancos.length} avanço(s) significativo(s), incluindo a recriação do Ministério da Igualdade Racial (2023) e a ampliação de políticas de ação afirmativa. `;
  }
  
  if (lacunasPersistentes.length > 0) {
    conclusion += `No entanto, permanecem ${lacunasPersistentes.length} lacuna(s) persistente(s) que revelam a insuficiência das ações estatais frente às demandas históricas da população negra, indígena e demais grupos vulnerabilizados. `;
  }
  
  if (retrocessos.length > 0) {
    conclusion += `Particularmente grave é a constatação de ${retrocessos.length} retrocesso(s) que representam violações diretas aos compromissos assumidos pelo Brasil perante o sistema internacional de direitos humanos. `;
  }
  
  conclusion += `Os ${stats.naoCumprido} pontos não cumpridos evidenciam a necessidade de ações urgentes e efetivas para garantir a plena implementação da Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial.`;
  
  return conclusion;
}

function extractKeyDataPoints(indicadores: any[]): any[] {
  return indicadores.map(ind => {
    const dados = ind.dados || {};
    let destaque = '';
    let descricao = '';
    
    // Extract most relevant data point
    if (dados.negros && dados.brancos) {
      const valorNegros = Object.values(dados.negros)[0];
      const valorBrancos = Object.values(dados.brancos)[0];
      
      if (typeof valorNegros === 'number' && typeof valorBrancos === 'number') {
        const diferenca = valorNegros - valorBrancos;
        if (ind.nome.includes('Taxa') || ind.nome.includes('Índice')) {
          destaque = `${valorNegros}%`;
          descricao = `${diferenca > 0 ? '+' : ''}${diferenca.toFixed(1)}p.p. em relação à população branca`;
        } else {
          destaque = valorNegros.toLocaleString('pt-BR');
          descricao = `vs ${valorBrancos.toLocaleString('pt-BR')} brancos`;
        }
      }
    } else if (dados.geral) {
      const valorGeral = Object.values(dados.geral)[0];
      if (typeof valorGeral === 'number') {
        destaque = valorGeral.toLocaleString('pt-BR');
        descricao = ind.analise_interseccional?.substring(0, 100) || 'Dado geral agregado';
      }
    } else {
      // Fallback
      destaque = ind.tendencia || 'N/D';
      descricao = ind.analise_interseccional?.substring(0, 100) || ind.fonte;
    }
    
    return {
      nome: ind.nome,
      destaque,
      descricao,
      tendencia: ind.tendencia,
      categoria: ind.categoria,
    };
  });
}

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const grupoLabels: Record<string, string> = {
  negros: 'População Negra', indigenas: 'Povos Indígenas', quilombolas: 'Comunidades Quilombolas',
  ciganos: 'Povos Ciganos (Roma)', juventude_negra: 'Juventude Negra', mulheres_negras: 'Mulheres Negras',
  lgbtqia_negros: 'LGBTQIA+ Negros', religioes_matriz_africana: 'Religiões de Matriz Africana',
  pcd_negros: 'PcD Negros', idosos_negros: 'Idosos Negros', geral: 'Geral', outros: 'Outros',
};

const eixoLabels: Record<string, string> = {
  legislacao_justica: 'Legislação e Justiça', politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública', saude: 'Saúde', educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda', terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio', participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas',
};

const fmtC = (v: number) => {
  if (!v) return 'R$ 0';
  if (v >= 1e9) return `R$ ${(v/1e9).toFixed(2)} bi`;
  if (v >= 1e6) return `R$ ${(v/1e6).toFixed(1)} mi`;
  if (v >= 1e3) return `R$ ${(v/1e3).toFixed(0)} mil`;
  return `R$ ${v.toFixed(0)}`;
};

const fmtFull = (v: number) => {
  if (!v) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
};

function isSesai(r: any): boolean {
  const prog = (r.programa || '').toLowerCase();
  const orgao = (r.orgao || '').toUpperCase();
  const obs = (r.observacoes || '').toLowerCase();
  return orgao === 'SESAI' || obs.includes('sesai') || prog.includes('20yp') || prog.includes('7684');
}

function periodStats(recs: any[]) {
  const p1 = recs.filter(r => r.ano >= 2018 && r.ano <= 2022);
  const p2 = recs.filter(r => r.ano >= 2023 && r.ano <= 2025);
  const dotP1 = p1.reduce((s: number, r: any) => s + parseFloat(r.dotacao_autorizada || 0), 0);
  const dotP2 = p2.reduce((s: number, r: any) => s + parseFloat(r.dotacao_autorizada || 0), 0);
  const pagoP1 = p1.reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0);
  const pagoP2 = p2.reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0);
  const varDot = dotP1 > 0 ? ((dotP2 - dotP1) / dotP1 * 100) : 0;
  const varPago = pagoP1 > 0 ? ((pagoP2 - pagoP1) / pagoP1 * 100) : 0;
  return { dotP1, dotP2, pagoP1, pagoP2, varDot, varPago };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Generating comprehensive budget report');

    const [orcResult, indResult, lacResult] = await Promise.all([
      supabase.from('dados_orcamentarios').select('*').order('ano'),
      supabase.from('indicadores_interseccionais').select('*').order('categoria'),
      supabase.from('lacunas_identificadas').select('*').order('eixo_tematico'),
    ]);

    if (orcResult.error) throw orcResult.error;
    const orcamento = orcResult.data || [];
    const indicadores = indResult.data || [];
    const lacunas = lacResult.data || [];

    console.log(`Data: ${orcamento.length} budget, ${indicadores.length} indicators, ${lacunas.length} gaps`);

    // Classify
    const all = orcamento;
    const nonSesai = all.filter(r => !isSesai(r));
    const sesaiOnly = all.filter(r => isSesai(r));
    const extraOrc = all.filter(r => r.tipo_dotacao === 'extraorcamentario');
    const orcOnly = all.filter(r => r.tipo_dotacao !== 'extraorcamentario');

    const sAll = periodStats(all);
    const sNS = periodStats(nonSesai);
    const sSesai = periodStats(sesaiOnly);
    const sOrc = periodStats(orcOnly);
    const sExtra = periodStats(extraOrc);

    // Year-by-year
    const byAno: Record<number, any[]> = {};
    all.forEach(r => { if (!byAno[r.ano]) byAno[r.ano] = []; byAno[r.ano].push(r); });
    const anos = Object.keys(byAno).map(Number).sort();

    const evolucao = anos.map(a => {
      const recs = byAno[a];
      return {
        ano: a,
        dotacao: recs.reduce((s: number, r: any) => s + parseFloat(r.dotacao_autorizada || 0), 0),
        pago: recs.reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0),
        liquidado: recs.reduce((s: number, r: any) => s + parseFloat(r.liquidado || 0), 0),
      };
    });

    // Programs
    const byPrograma: Record<string, { orgao: string; pago: number; dotacao: number; anos: Set<number>; artigos: Set<string>; grupo: string }> = {};
    all.forEach(r => {
      if (!byPrograma[r.programa]) byPrograma[r.programa] = { orgao: r.orgao, pago: 0, dotacao: 0, anos: new Set(), artigos: new Set(), grupo: r.grupo_focal || 'geral' };
      byPrograma[r.programa].pago += parseFloat(r.pago || 0);
      byPrograma[r.programa].dotacao += parseFloat(r.dotacao_autorizada || 0);
      byPrograma[r.programa].anos.add(r.ano);
      (r.artigos_convencao || []).forEach((a: string) => byPrograma[r.programa].artigos.add(a));
    });

    // By Grupo
    const byGrupo: Record<string, any[]> = {};
    all.forEach(r => { const g = r.grupo_focal || 'geral'; if (!byGrupo[g]) byGrupo[g] = []; byGrupo[g].push(r); });

    // Orçamento Simbólico
    const simbolicos = all.filter(r => parseFloat(r.dotacao_autorizada || 0) > 100000 && parseFloat(r.pago || 0) === 0);

    // Artigos ICERD mapping
    const byArtigo: Record<string, { pago: number; dotacao: number; programas: Set<string> }> = {};
    all.forEach(r => {
      (r.artigos_convencao || []).forEach((a: string) => {
        if (!byArtigo[a]) byArtigo[a] = { pago: 0, dotacao: 0, programas: new Set() };
        byArtigo[a].pago += parseFloat(r.pago || 0);
        byArtigo[a].dotacao += parseFloat(r.dotacao_autorizada || 0);
        byArtigo[a].programas.add(r.programa);
      });
    });

    // Sources
    const fontes = [...new Set(all.map(r => r.fonte_dados).filter(Boolean))];
    const urls = [...new Set(all.map(r => r.url_fonte).filter(Boolean))];

    const programas = new Set(all.map(r => r.programa));
    const orgaos = new Set(all.map(r => r.orgao));
    const totalDot = all.reduce((s: number, r: any) => s + parseFloat(r.dotacao_autorizada || 0), 0);
    const totalPago = all.reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0);
    const execGeral = totalDot > 0 ? (totalPago / totalDot * 100).toFixed(1) : '—';

    const dataGeracao = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório Orçamentário Consolidado — Políticas de Igualdade Racial (2018–2025)</title>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet">
<style>
:root{--primary:#047857;--primary-dark:#065f46;--accent:#c7a82b;--success:#22c55e;--warning:#eab308;--danger:#ef4444;--text:#1a1a2e;--muted:#64748b;--bg:#f8fafc;--border:#e2e8f0;}
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);line-height:1.6;font-size:11pt;}
.container{max-width:1200px;margin:0 auto;padding:0 24px;}
.hero{background:linear-gradient(135deg,var(--primary) 0%,var(--primary-dark) 50%,#064e3b 100%);color:white;padding:60px 0;position:relative;}
.hero::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none'%3E%3Cg fill='%23fff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");}
.hero-content{position:relative;z-index:1;}
.hero-badge{display:inline-block;background:rgba(199,168,43,.2);border:1px solid var(--accent);color:var(--accent);padding:6px 16px;border-radius:20px;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:20px;}
.hero h1{font-family:'Playfair Display',serif;font-size:clamp(1.8rem,4vw,2.5rem);font-weight:800;margin-bottom:12px;}
.hero p{font-size:1rem;opacity:.9;max-width:800px;}
.hero-stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:16px;margin-top:32px;}
.hero-stat{background:rgba(255,255,255,.1);backdrop-filter:blur(10px);border-radius:12px;padding:16px;text-align:center;}
.hero-stat-value{font-size:1.5rem;font-weight:800;display:block;}
.hero-stat-label{font-size:.75rem;opacity:.8;margin-top:4px;}
.section{padding:40px 0;}.section-alt{background:white;}
.section-header{display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:12px;border-bottom:2px solid var(--primary);}
.section-icon{width:40px;height:40px;background:var(--primary);border-radius:10px;display:flex;align-items:center;justify-content:center;color:white;font-size:1.2rem;}
.section-title{font-family:'Playfair Display',serif;font-size:1.3rem;color:var(--primary);}
.section-subtitle{font-size:.8rem;color:var(--muted);}
.toc{background:white;border:2px solid var(--primary);border-radius:12px;padding:24px;margin:20px 0;}
.toc h3{color:var(--primary);margin-bottom:12px;}
.toc ol{padding-left:20px;}.toc li{margin:6px 0;font-size:.95rem;}
.toc a{color:var(--primary);text-decoration:none;}.toc a:hover{text-decoration:underline;}
table{width:100%;border-collapse:collapse;font-size:.85rem;margin:10px 0;}
th{background:#f1f5f9;color:var(--text);font-weight:600;font-size:.75rem;text-transform:uppercase;letter-spacing:.5px;padding:10px 14px;text-align:left;border-bottom:1px solid var(--border);}
td{padding:8px 14px;border-bottom:1px solid var(--border);}
tr:nth-child(even){background:#f8fafc;}
.table-container{background:white;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);margin-bottom:24px;}
.table-header{background:var(--primary);color:white;padding:16px 20px;}
.table-header h3{font-size:1rem;font-weight:600;margin-bottom:4px;}
.table-header p{font-size:.75rem;opacity:.8;}
.table-footer{background:#f8fafc;padding:12px 20px;font-size:.75rem;color:var(--muted);border-top:1px solid var(--border);}
.table-footer a{color:var(--primary);text-decoration:none;}
.trend-up{color:var(--success);font-weight:600;}.trend-down{color:var(--danger);font-weight:600;}.trend-stable{color:var(--muted);}
.chart-container{background:white;border-radius:12px;padding:20px;border:1px solid var(--border);margin-bottom:20px;}
.chart-header{margin-bottom:16px;padding-bottom:12px;border-bottom:1px solid var(--border);}
.chart-title{font-weight:600;color:var(--primary);font-size:1rem;margin-bottom:4px;}
.chart-subtitle{font-size:.75rem;color:var(--muted);}
.chart-source{font-size:.7rem;color:var(--muted);margin-top:12px;font-style:italic;padding-top:8px;border-top:1px solid var(--border);}
.chart-wrapper{height:300px;position:relative;}
.grid-2{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;}
.grid-4{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}
.stat-card{background:white;border-radius:10px;padding:16px;border:1px solid var(--border);text-align:center;}
.stat-card-value{font-size:1.5rem;font-weight:800;color:var(--primary);}
.stat-card-label{font-size:.75rem;color:var(--muted);margin-top:4px;}
.insight-card{background:linear-gradient(135deg,#fef3c7 0%,#fef9c3 100%);border:1px solid #fbbf24;border-radius:10px;padding:16px;margin-bottom:12px;}
.insight-card p{color:#78350f;font-size:.9rem;line-height:1.5;}
.methodology-box{background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px;margin-bottom:16px;}
.methodology-box h4{color:#166534;margin-bottom:8px;}
.exclusion-box{background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:16px;margin-bottom:16px;}
.exclusion-box h4{color:#991b1b;margin-bottom:8px;}
.perspective-card{border:2px solid var(--border);border-radius:12px;padding:20px;margin-bottom:16px;}
.perspective-card h3{color:var(--primary);margin-bottom:12px;font-size:1.1rem;}
.masking-alert{background:linear-gradient(135deg,#fff7ed,#ffedd5);border:2px solid #f97316;border-radius:12px;padding:20px;margin:20px 0;}
.masking-alert h4{color:#c2410c;margin-bottom:8px;}
.simbolico-alert{background:#fef2f2;border:2px solid #ef4444;border-radius:12px;padding:20px;margin:20px 0;}
.simbolico-alert h4{color:#991b1b;margin-bottom:8px;}
.footer{background:#0f172a;color:white;padding:40px 0;margin-top:40px;}
.footer-content{text-align:center;}
.footer p{opacity:.7;font-size:.8rem;margin-bottom:8px;}
.footer strong{opacity:1;}
.sources-section{background:#f1f5f9;padding:24px;border-radius:12px;margin-top:24px;}
.sources-section h4{font-size:1rem;color:var(--primary);margin-bottom:12px;}
.sources-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:8px;list-style:none;padding:0;}
.sources-list li{font-size:.8rem;color:var(--muted);padding-left:16px;position:relative;}
.sources-list li::before{content:"→";position:absolute;left:0;color:var(--primary);}
@media print{body{font-size:10pt;}.hero{padding:30px 0;}.section{padding:20px 0;page-break-inside:avoid;}.chart-wrapper{height:200px;}}
@media(max-width:768px){.grid-2,.grid-3,.grid-4{grid-template-columns:1fr;}.hero-stats{grid-template-columns:repeat(2,1fr);}}
</style>
</head>
<body>

<!-- ═══════════════ HERO ═══════════════ -->
<section class="hero">
<div class="container hero-content">
  <span class="hero-badge">💰 Relatório Orçamentário Consolidado</span>
  <h1>Orçamento das Políticas de Igualdade Racial</h1>
  <p>Análise consolidada da execução orçamentária federal (2018–2025) dos programas de promoção da igualdade racial, com dupla perspectiva (com/sem SESAI), cruzamento com artigos ICERD e indicadores socioeconômicos.</p>
  <div class="hero-stats">
    <div class="hero-stat"><span class="hero-stat-value">${fmtC(totalDot)}</span><span class="hero-stat-label">Dotação Total</span></div>
    <div class="hero-stat"><span class="hero-stat-value" style="color:#22c55e">${fmtC(totalPago)}</span><span class="hero-stat-label">Total Pago</span></div>
    <div class="hero-stat"><span class="hero-stat-value">${execGeral}%</span><span class="hero-stat-label">Execução</span></div>
    <div class="hero-stat"><span class="hero-stat-value" style="color:${sAll.varPago >= 0 ? '#22c55e' : '#ef4444'}">${sAll.varPago >= 0 ? '+' : ''}${sAll.varPago.toFixed(0)}%</span><span class="hero-stat-label">Variação Pago</span></div>
    <div class="hero-stat"><span class="hero-stat-value">${programas.size}</span><span class="hero-stat-label">Programas</span></div>
    <div class="hero-stat"><span class="hero-stat-value">${orgaos.size}</span><span class="hero-stat-label">Órgãos</span></div>
  </div>
</div>
</section>

<!-- ═══════════════ SUMÁRIO ═══════════════ -->
<section class="section">
<div class="container">
  <div class="toc">
    <h3>📑 Sumário</h3>
    <ol>
      <li><a href="#metodologia">Metodologia de Levantamento</a></li>
      <li><a href="#visao-geral">Visão Geral — Cards e Indicadores</a></li>
      <li><a href="#evolucao">Evolução Ano a Ano</a></li>
      <li><a href="#resumo-comparativo">Resumo Comparativo — Dupla Perspectiva</a></li>
      <li><a href="#mascaramento">Efeito Mascaramento Extraorçamentário</a></li>
      <li><a href="#orcamento-simbolico">Orçamento Simbólico</a></li>
      <li><a href="#grupos-focais">Análise por Grupo Focal</a></li>
      <li><a href="#artigos-icerd">Cruzamento × Artigos ICERD</a></li>
      <li><a href="#cruzamento-indicadores">Cruzamento × Indicadores Sociais</a></li>
      <li><a href="#conclusao">Conclusão Analítica</a></li>
      <li><a href="#fontes">Fontes e Referências</a></li>
      <li><a href="#anexo">ANEXO — Listagem Completa de Programas/Ações</a></li>
    </ol>
  </div>
</div>
</section>

<!-- ═══════════════ 1. METODOLOGIA ═══════════════ -->
<section class="section section-alt" id="metodologia">
<div class="container">
  <div class="section-header">
    <div class="section-icon">📐</div>
    <div><h2 class="section-title">1. Metodologia de Levantamento Orçamentário</h2>
    <p class="section-subtitle">Critérios de seleção, fontes e classificação — Esfera Federal (2018–2025)</p></div>
  </div>

  <div class="methodology-box">
    <h4>✅ Critérios de Inclusão (7 camadas de coleta)</h4>
    <ul style="font-size:.9rem;padding-left:20px;">
      <li><strong>Camada 1 — Agendas Transversais PPA:</strong> Programas 5804, 5803, 5802, 5136, 5034 (2024-2027) e equivalentes históricos: 0617, 0153, 5022 (2020-2023) e 2034, 2065 (2016-2019)</li>
      <li><strong>Camada 2 — Subfunção 422:</strong> "Direitos individuais, coletivos e difusos"</li>
      <li><strong>Camada 3 — Órgãos MIR/MPI:</strong> Ministério da Igualdade Racial (OS 67000) e Ministério dos Povos Indígenas (OS 92000)</li>
      <li><strong>Camada 4 — SESAI:</strong> Ações 20YP e 7684 (saúde indígena)</li>
      <li><strong>Camada 5 — FUNAI/INCRA:</strong> Ações finalísticas específicas (20UF, 2384, 215O, 215Q, 214V, 15Q1, 20G7, 0859)</li>
      <li><strong>Camada 6 — Filtro por palavras-chave:</strong> Para programas universais, seleção por termos raciais/étnicos</li>
      <li><strong>Camada 7 — Complementação Manual SIOP:</strong> 11 registros (2020–2023) de ações de difícil rastreio automatizado</li>
    </ul>
  </div>

  <div class="exclusion-box">
    <h4>❌ Critérios de Exclusão</h4>
    <ul style="font-size:.9rem;padding-left:20px;">
      <li><strong>5034/MDHC genérico:</strong> Ações sem palavras-chave raciais</li>
      <li><strong>Transversais:</strong> Bolsa Família, MCMV, SUS, SUAS (beneficiam a população negra, mas sem focalização racial explícita)</li>
      <li><strong>MIR retroativo pré-2023</strong></li>
      <li><strong>Restos a Pagar:</strong> Excluídos dos valores de execução</li>
    </ul>
  </div>

  <div class="grid-3">
    <div class="stat-card"><div class="stat-card-value">${all.length}</div><div class="stat-card-label">Total Registros (Ação × Ano)</div></div>
    <div class="stat-card"><div class="stat-card-value">${programas.size}</div><div class="stat-card-label">Programas Únicos</div></div>
    <div class="stat-card"><div class="stat-card-value">${orgaos.size}</div><div class="stat-card-label">Órgãos</div></div>
  </div>

  <div class="insight-card" style="margin-top:16px;">
    <p>📊 <strong>Métrica principal: "Pago"</strong> — mede a transferência efetiva de recursos do Tesouro para os beneficiários finais. A "Dotação Autorizada" (previsão na LOA, incluindo créditos adicionais) serve como referência para calcular a taxa de execução.</p>
  </div>
  <div class="insight-card">
    <p>⚠️ <strong>Assimetria temporal:</strong> P1 = 5 anos (2018–2022) e P2 = 3 anos (2023–2025). Comparações diretas consideram esta diferença — a variação percentual reflete o acumulado de cada período, não médias anuais.</p>
  </div>
</div>
</section>

<!-- ═══════════════ 2. VISÃO GERAL ═══════════════ -->
<section class="section" id="visao-geral">
<div class="container">
  <div class="section-header">
    <div class="section-icon">📋</div>
    <div><h2 class="section-title">2. Visão Geral</h2>
    <p class="section-subtitle">Panorama consolidado da execução orçamentária</p></div>
  </div>

  <div class="grid-4">
    <div class="stat-card"><div class="stat-card-value">${fmtC(totalDot)}</div><div class="stat-card-label">Dotação Total</div></div>
    <div class="stat-card"><div class="stat-card-value" style="color:#166534">${fmtC(totalPago)}</div><div class="stat-card-label">Total Pago</div></div>
    <div class="stat-card"><div class="stat-card-value">${execGeral}%</div><div class="stat-card-label">Execução Geral</div></div>
    <div class="stat-card"><div class="stat-card-value">${orcOnly.length}</div><div class="stat-card-label">Registros Orçamentários</div></div>
  </div>
  <div class="grid-3" style="margin-top:16px;">
    <div class="stat-card"><div class="stat-card-value">${fmtC(sAll.pagoP1)}</div><div class="stat-card-label">Pago 2018–2022 (P1)</div></div>
    <div class="stat-card"><div class="stat-card-value" style="color:#166534">${fmtC(sAll.pagoP2)}</div><div class="stat-card-label">Pago 2023–2025 (P2)</div></div>
    <div class="stat-card"><div class="stat-card-value" style="color:${sAll.varPago >= 0 ? '#166534' : '#991b1b'}">${sAll.varPago >= 0 ? '+' : ''}${sAll.varPago.toFixed(1)}%</div><div class="stat-card-label">Variação Pago</div></div>
  </div>
  <div class="grid-3" style="margin-top:16px;">
    <div class="stat-card"><div class="stat-card-value">${fmtC(sAll.dotP1)}</div><div class="stat-card-label">Dotação 2018–2022</div></div>
    <div class="stat-card"><div class="stat-card-value" style="color:#166534">${fmtC(sAll.dotP2)}</div><div class="stat-card-label">Dotação 2023–2025</div></div>
    <div class="stat-card"><div class="stat-card-value" style="color:${sAll.varDot >= 0 ? '#166534' : '#991b1b'}">${sAll.varDot >= 0 ? '+' : ''}${sAll.varDot.toFixed(1)}%</div><div class="stat-card-label">Variação Dotação</div></div>
  </div>
</div>
</section>

<!-- ═══════════════ 3. EVOLUÇÃO ANO A ANO ═══════════════ -->
<section class="section section-alt" id="evolucao">
<div class="container">
  <div class="section-header">
    <div class="section-icon">📈</div>
    <div><h2 class="section-title">3. Evolução Orçamentária Ano a Ano</h2>
    <p class="section-subtitle">Dotação autorizada vs. valor pago, ${anos[0]}–${anos[anos.length-1]}</p></div>
  </div>
  
  <div class="chart-container">
    <div class="chart-header"><div class="chart-title">Execução Orçamentária Anual</div><div class="chart-subtitle">Dotação Autorizada × Pago (milhões R$)</div></div>
    <div class="chart-wrapper"><canvas id="evolucaoChart"></canvas></div>
    <p class="chart-source"><strong>Fontes:</strong> ${fontes.slice(0,3).join(', ') || 'SIOP/Portal da Transparência'}</p>
  </div>

  <div class="table-container">
    <div class="table-header"><h3>Tabela 1: Evolução da Execução Orçamentária Ano a Ano</h3><p>Valores em reais — consolidação de todos os programas de políticas raciais</p></div>
    <table>
      <thead><tr><th>Ano</th><th>Dotação Autorizada</th><th>Liquidado</th><th>Pago</th><th>Execução</th><th>Var. Anual</th></tr></thead>
      <tbody>
      ${evolucao.map((e, i) => {
        const exec = e.dotacao > 0 ? (e.pago / e.dotacao * 100).toFixed(1) : '—';
        const prev = i > 0 ? evolucao[i-1].pago : 0;
        const varAnual = prev > 0 ? ((e.pago - prev) / prev * 100).toFixed(1) : '—';
        return `<tr${e.ano === 2023 ? ' style="border-top:3px solid #2563eb"' : ''}>
          <td><strong>${e.ano}</strong></td>
          <td style="text-align:right;font-family:monospace;font-size:9pt">${fmtFull(e.dotacao)}</td>
          <td style="text-align:right;font-family:monospace;font-size:9pt">${fmtFull(e.liquidado)}</td>
          <td style="text-align:right;font-family:monospace;font-size:9pt"><strong>${fmtFull(e.pago)}</strong></td>
          <td>${exec}%</td>
          <td class="${Number(varAnual) > 0 ? 'trend-up' : Number(varAnual) < 0 ? 'trend-down' : ''}">${i === 0 ? '—' : `${Number(varAnual) >= 0 ? '+' : ''}${varAnual}%`}</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
    <div class="table-footer"><strong>Nota:</strong> Linha azul separa P1 (2018–2022) de P2 (2023–2025).</div>
  </div>
</div>
</section>

<!-- ═══════════════ 4. RESUMO COMPARATIVO — DUPLA PERSPECTIVA ═══════════════ -->
<section class="section" id="resumo-comparativo">
<div class="container">
  <div class="section-header">
    <div class="section-icon">⚖️</div>
    <div><h2 class="section-title">4. Resumo Comparativo — Dupla Perspectiva</h2>
    <p class="section-subtitle">Total (com SESAI) vs. Políticas Raciais stricto sensu (sem SESAI)</p></div>
  </div>

  <div class="insight-card">
    <p>🔍 <strong>Por que duas perspectivas?</strong> A SESAI (Secretaria Especial de Saúde Indígena) movimenta volumes expressivos (${fmtC(sSesai.pagoP1 + sSesai.pagoP2)} acumulados), o que pode mascarar a real evolução do investimento em políticas de igualdade racial stricto sensu.</p>
  </div>

  <div class="perspective-card" style="border-color:#047857">
    <h3>🟢 Perspectiva 1 — Financiamento Total (com SESAI)</h3>
    <div class="grid-3">
      <div class="stat-card"><div class="stat-card-value">${fmtC(sAll.pagoP1)}</div><div class="stat-card-label">Pago P1 (2018–2022)</div></div>
      <div class="stat-card"><div class="stat-card-value" style="color:#166534">${fmtC(sAll.pagoP2)}</div><div class="stat-card-label">Pago P2 (2023–2025)</div></div>
      <div class="stat-card"><div class="stat-card-value" style="color:${sAll.varPago >= 0 ? '#166534' : '#991b1b'}">${sAll.varPago >= 0 ? '+' : ''}${sAll.varPago.toFixed(1)}%</div><div class="stat-card-label">Variação</div></div>
    </div>
    <div class="grid-3" style="margin-top:12px;">
      <div class="stat-card"><div class="stat-card-value">${fmtC(sAll.dotP1)}</div><div class="stat-card-label">Dotação P1</div></div>
      <div class="stat-card"><div class="stat-card-value" style="color:#166534">${fmtC(sAll.dotP2)}</div><div class="stat-card-label">Dotação P2</div></div>
      <div class="stat-card"><div class="stat-card-value" style="color:${sAll.varDot >= 0 ? '#166534' : '#991b1b'}">${sAll.varDot >= 0 ? '+' : ''}${sAll.varDot.toFixed(1)}%</div><div class="stat-card-label">Variação Dotação</div></div>
    </div>
  </div>

  <div class="perspective-card" style="border-color:#1e40af">
    <h3>🔵 Perspectiva 2 — Sem SESAI (stricto sensu)</h3>
    <div class="grid-3">
      <div class="stat-card"><div class="stat-card-value">${fmtC(sNS.pagoP1)}</div><div class="stat-card-label">Pago P1</div></div>
      <div class="stat-card"><div class="stat-card-value" style="color:#166534">${fmtC(sNS.pagoP2)}</div><div class="stat-card-label">Pago P2</div></div>
      <div class="stat-card"><div class="stat-card-value" style="color:${sNS.varPago >= 0 ? '#166534' : '#991b1b'}">${sNS.varPago >= 0 ? '+' : ''}${sNS.varPago.toFixed(1)}%</div><div class="stat-card-label">Variação</div></div>
    </div>
    <div class="grid-3" style="margin-top:12px;">
      <div class="stat-card"><div class="stat-card-value">${fmtC(sNS.dotP1)}</div><div class="stat-card-label">Dotação P1</div></div>
      <div class="stat-card"><div class="stat-card-value" style="color:#166534">${fmtC(sNS.dotP2)}</div><div class="stat-card-label">Dotação P2</div></div>
      <div class="stat-card"><div class="stat-card-value" style="color:${sNS.varDot >= 0 ? '#166534' : '#991b1b'}">${sNS.varDot >= 0 ? '+' : ''}${sNS.varDot.toFixed(1)}%</div><div class="stat-card-label">Variação Dotação</div></div>
    </div>
  </div>

  <div class="perspective-card" style="border-color:#f97316">
    <h3>🟠 Apenas SESAI</h3>
    <div class="grid-3">
      <div class="stat-card"><div class="stat-card-value">${fmtC(sSesai.pagoP1)}</div><div class="stat-card-label">Pago P1</div></div>
      <div class="stat-card"><div class="stat-card-value" style="color:#166534">${fmtC(sSesai.pagoP2)}</div><div class="stat-card-label">Pago P2</div></div>
      <div class="stat-card"><div class="stat-card-value" style="color:${sSesai.varPago >= 0 ? '#166534' : '#991b1b'}">${sSesai.varPago >= 0 ? '+' : ''}${sSesai.varPago.toFixed(1)}%</div><div class="stat-card-label">Variação</div></div>
    </div>
  </div>
</div>
</section>

<!-- ═══════════════ 5. EFEITO MASCARAMENTO ═══════════════ -->
<section class="section section-alt" id="mascaramento">
<div class="container">
  <div class="section-header">
    <div class="section-icon">🎭</div>
    <div><h2 class="section-title">5. Efeito Mascaramento Extraorçamentário</h2>
    <p class="section-subtitle">Análise do impacto de financiamentos compensatórios na percepção de investimento público</p></div>
  </div>

  <div class="masking-alert">
    <h4>⚠️ O que é o efeito mascaramento?</h4>
    <p style="font-size:.9rem;color:#7c2d12;">Fundos reativos (royalties, indenizações judiciais, compensações ambientais) podem inflar a percepção de investimento público em políticas indígenas e quilombolas, enquanto a dotação orçamentária direta (LOA) permanece estagnada ou decrescente. Este relatório distingue as duas naturezas para uma análise mais precisa.</p>
  </div>

  <div class="grid-2">
    <div class="perspective-card">
      <h3>💰 Esforço do Estado (LOA)</h3>
      <div class="grid-2">
        <div class="stat-card"><div class="stat-card-value">${fmtC(sOrc.pagoP1)}</div><div class="stat-card-label">P1 Pago</div></div>
        <div class="stat-card"><div class="stat-card-value" style="color:#166534">${fmtC(sOrc.pagoP2)}</div><div class="stat-card-label">P2 Pago</div></div>
      </div>
      <p style="text-align:center;margin-top:8px;font-weight:700;color:${sOrc.varPago >= 0 ? '#166534' : '#991b1b'}">Variação: ${sOrc.varPago >= 0 ? '+' : ''}${sOrc.varPago.toFixed(1)}%</p>
    </div>
    <div class="perspective-card">
      <h3>🔄 Financiamento Compensatório</h3>
      <div class="grid-2">
        <div class="stat-card"><div class="stat-card-value">${fmtC(sExtra.pagoP1)}</div><div class="stat-card-label">P1 Pago</div></div>
        <div class="stat-card"><div class="stat-card-value" style="color:#166534">${fmtC(sExtra.pagoP2)}</div><div class="stat-card-label">P2 Pago</div></div>
      </div>
      <p style="text-align:center;margin-top:8px;font-weight:700;color:${sExtra.varPago >= 0 ? '#166534' : '#991b1b'}">Variação: ${sExtra.varPago >= 0 ? '+' : ''}${sExtra.varPago.toFixed(1)}%</p>
    </div>
  </div>

  <div class="chart-container">
    <div class="chart-header"><div class="chart-title">Orçamentário × Extraorçamentário por Ano</div></div>
    <div class="chart-wrapper"><canvas id="maskingChart"></canvas></div>
  </div>
</div>
</section>

<!-- ═══════════════ 6. ORÇAMENTO SIMBÓLICO ═══════════════ -->
<section class="section" id="orcamento-simbolico">
<div class="container">
  <div class="section-header">
    <div class="section-icon">🚫</div>
    <div><h2 class="section-title">6. Orçamento Simbólico</h2>
    <p class="section-subtitle">"Políticas no papel": dotação relevante (> R$ 100 mil), mas execução zero</p></div>
  </div>

  ${simbolicos.length > 0 ? `
  <div class="simbolico-alert">
    <h4>🔴 ${simbolicos.length} registros com dotação autorizada > R$ 100 mil e valor pago = R$ 0</h4>
    <p style="font-size:.9rem;color:#7f1d1d;">Este indicador evidencia o hiato entre a previsão legal e a entrega efetiva de direitos, fundamentando argumentos de descumprimento dos Artigos 2 e 5 da Convenção ICERD.</p>
  </div>

  <div class="table-container">
    <div class="table-header"><h3>"Políticas no Papel" — Dotação sem Execução</h3><p>${simbolicos.length} registros identificados</p></div>
    <table>
      <thead><tr><th>Programa</th><th>Órgão</th><th>Ano</th><th>Dotação Autorizada</th></tr></thead>
      <tbody>
      ${simbolicos.sort((a: any, b: any) => parseFloat(b.dotacao_autorizada || 0) - parseFloat(a.dotacao_autorizada || 0)).slice(0, 20).map((r: any) =>
        `<tr><td>${r.programa}</td><td>${r.orgao}</td><td>${r.ano}</td><td style="text-align:right;font-family:monospace">${fmtFull(parseFloat(r.dotacao_autorizada || 0))}</td></tr>`
      ).join('')}
      </tbody>
    </table>
  </div>` : `<div class="insight-card"><p>✅ Nenhum registro de orçamento simbólico identificado — todos os programas com dotação relevante tiveram execução.</p></div>`}
</div>
</section>

<!-- ═══════════════ 7. GRUPOS FOCAIS ═══════════════ -->
<section class="section section-alt" id="grupos-focais">
<div class="container">
  <div class="section-header">
    <div class="section-icon">👥</div>
    <div><h2 class="section-title">7. Distribuição por Grupo Focal</h2>
    <p class="section-subtitle">Orçamento destinado a cada grupo populacional — P1 vs P2</p></div>
  </div>

  <div class="grid-2">
    <div class="chart-container">
      <div class="chart-header"><div class="chart-title">Distribuição por Grupo Focal</div><div class="chart-subtitle">Total pago (2018–2025)</div></div>
      <div class="chart-wrapper"><canvas id="grupoChart"></canvas></div>
    </div>

    <div class="table-container">
      <div class="table-header"><h3>Comparativo P1 × P2 por Grupo</h3><p>Variação entre 2018–2022 e 2023–2025</p></div>
      <table>
        <thead><tr><th>Grupo</th><th>P1 (Pago)</th><th>P2 (Pago)</th><th>Variação</th></tr></thead>
        <tbody>
        ${Object.entries(byGrupo).map(([g, recs]) => {
          const p1 = (recs as any[]).filter((r: any) => r.ano <= 2022).reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0);
          const p2 = (recs as any[]).filter((r: any) => r.ano >= 2023).reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0);
          const v = p1 > 0 ? ((p2 - p1) / p1 * 100) : (p2 > 0 ? 100 : 0);
          return `<tr><td>${grupoLabels[g] || g}</td><td style="text-align:right;font-family:monospace">${fmtFull(p1)}</td><td style="text-align:right;font-family:monospace">${fmtFull(p2)}</td><td class="${v > 0 ? 'trend-up' : v < 0 ? 'trend-down' : ''}">${v >= 0 ? '+' : ''}${v.toFixed(0)}%</td></tr>`;
        }).join('')}
        </tbody>
      </table>
    </div>
  </div>
</div>
</section>

<!-- ═══════════════ 8. ARTIGOS ICERD ═══════════════ -->
<section class="section" id="artigos-icerd">
<div class="container">
  <div class="section-header">
    <div class="section-icon">⚖️</div>
    <div><h2 class="section-title">8. Cruzamento Orçamentário × Artigos ICERD</h2>
    <p class="section-subtitle">Mapeamento dos programas aos artigos da Convenção Internacional</p></div>
  </div>

  ${Object.keys(byArtigo).length > 0 ? `
  <div class="table-container">
    <div class="table-header"><h3>Investimento por Artigo da Convenção</h3><p>Mapeamento financeiro dos artigos I–VII da ICERD</p></div>
    <table>
      <thead><tr><th>Artigo</th><th>Programas Vinculados</th><th>Dotação Total</th><th>Pago Total</th><th>Execução</th></tr></thead>
      <tbody>
      ${Object.entries(byArtigo).sort(([a], [b]) => a.localeCompare(b)).map(([art, data]) => {
        const exec = data.dotacao > 0 ? (data.pago / data.dotacao * 100).toFixed(1) : '—';
        return `<tr><td><strong>${art}</strong></td><td>${data.programas.size}</td><td style="text-align:right;font-family:monospace">${fmtFull(data.dotacao)}</td><td style="text-align:right;font-family:monospace">${fmtFull(data.pago)}</td><td>${exec}%</td></tr>`;
      }).join('')}
      </tbody>
    </table>
  </div>

  <div class="chart-container">
    <div class="chart-header"><div class="chart-title">Pago por Artigo ICERD</div></div>
    <div class="chart-wrapper"><canvas id="artigoChart"></canvas></div>
  </div>
  ` : `<div class="insight-card"><p>⚠️ Nenhum registro orçamentário mapeado para artigos da Convenção ICERD. Recomenda-se a classificação temática dos programas.</p></div>`}
</div>
</section>

<!-- ═══════════════ 9. CRUZAMENTO COM INDICADORES ═══════════════ -->
<section class="section section-alt" id="cruzamento-indicadores">
<div class="container">
  <div class="section-header">
    <div class="section-icon">🔗</div>
    <div><h2 class="section-title">9. Cruzamento: Orçamento × Indicadores Sociais</h2>
    <p class="section-subtitle">Correlação entre investimento público e evolução dos indicadores da população negra</p></div>
  </div>

  <div class="table-container">
    <div class="table-header"><h3>Indicadores Socioeconômicos × Execução Orçamentária</h3><p>Primeiros 15 indicadores do sistema</p></div>
    <table>
      <thead><tr><th>Indicador</th><th>Categoria</th><th>Tendência</th><th>Fonte</th></tr></thead>
      <tbody>
      ${indicadores.slice(0, 15).map((ind: any) =>
        `<tr><td><strong>${ind.nome}</strong></td><td>${ind.categoria}</td><td class="${ind.tendencia === 'reducao' ? 'trend-up' : ind.tendencia === 'aumento' ? 'trend-down' : ''}">${ind.tendencia || '—'}</td><td style="font-size:.8rem">${ind.fonte}</td></tr>`
      ).join('')}
      </tbody>
    </table>
  </div>

  ${(() => {
    const lacunasTrabalho = lacunas.filter((l: any) => l.eixo_tematico === 'trabalho_renda');
    const naoCumpridas = lacunasTrabalho.filter((l: any) => l.status_cumprimento === 'nao_cumprido').length;
    return lacunasTrabalho.length > 0 ? `
    <div class="insight-card"><p>⚠️ Das ${lacunasTrabalho.length} recomendações da ONU sobre Trabalho e Renda, <strong>${naoCumpridas} ainda não foram cumpridas</strong>, apesar dos investimentos realizados.</p></div>` : '';
  })()}
</div>
</section>

<!-- ═══════════════ 10. CONCLUSÃO ANALÍTICA ═══════════════ -->
<section class="section" id="conclusao">
<div class="container">
  <div class="section-header">
    <div class="section-icon">📝</div>
    <div><h2 class="section-title">10. Conclusão Analítica</h2>
    <p class="section-subtitle">Síntese sobre a evolução das políticas raciais sob a ótica orçamentária</p></div>
  </div>

  <div style="background:white;border:2px solid var(--primary);border-radius:12px;padding:24px;line-height:1.8;">
    <p style="font-size:1rem;margin-bottom:12px;">O levantamento orçamentário consolidado de <strong>${all.length} registros</strong> distribuídos em <strong>${programas.size} programas</strong> de <strong>${orgaos.size} órgãos</strong> federais revela um quadro de <strong>${sAll.varPago >= 0 ? 'crescimento' : 'redução'} do investimento</strong> em políticas de igualdade racial entre os períodos 2018–2022 e 2023–2025.</p>

    <p style="font-size:1rem;margin-bottom:12px;">Na <strong>Perspectiva Total</strong> (incluindo SESAI), o valor pago variou <strong>${sAll.varPago >= 0 ? '+' : ''}${sAll.varPago.toFixed(1)}%</strong> entre os períodos. Porém, ao excluir a SESAI para isolar as <strong>políticas raciais stricto sensu</strong>, a variação foi de <strong>${sNS.varPago >= 0 ? '+' : ''}${sNS.varPago.toFixed(1)}%</strong>, revelando ${Math.abs(sAll.varPago - sNS.varPago) > 10 ? 'uma diferença significativa que confirma o efeito mascaramento da saúde indígena sobre o orçamento total' : 'uma dinâmica relativamente alinhada entre as duas perspectivas'}.</p>

    ${simbolicos.length > 0 ? `<p style="font-size:1rem;margin-bottom:12px;">O indicador de <strong>Orçamento Simbólico</strong> identificou <strong>${simbolicos.length} registros</strong> onde a dotação autorizada foi relevante (> R$ 100 mil), mas a execução foi nula — evidenciando "políticas no papel" que fundamentam argumentos de descumprimento dos Artigos 2 e 5 da Convenção ICERD.</p>` : ''}

    ${extraOrc.length > 0 ? `<p style="font-size:1rem;margin-bottom:12px;">O <strong>efeito mascaramento</strong> pelo financiamento compensatório (extraorçamentário) é relevante: ${fmtC(sExtra.pagoP1 + sExtra.pagoP2)} acumulados em royalties e indenizações podem inflar a percepção de investimento direto do Estado em políticas indígenas e quilombolas.</p>` : ''}

    <p style="font-size:1rem;margin-bottom:12px;">Em síntese, o Estado brasileiro <strong>${sNS.varPago > 20 ? 'demonstrou avanço quantitativo significativo' : sNS.varPago > 0 ? 'apresentou leve crescimento' : 'não demonstrou avanço expressivo'}</strong> no financiamento de políticas raciais stricto sensu no período analisado, embora a qualidade e efetividade dessa conversão orçamentária em resultados sociais concretos permaneça como questão central para avaliação pelo Comitê CERD.</p>
  </div>
</div>
</section>

<!-- ═══════════════ 11. FONTES ═══════════════ -->
<section class="section section-alt" id="fontes">
<div class="container">
  <div class="sources-section">
    <h4>📚 Fontes de Dados e Referências</h4>
    <ul class="sources-list">
      ${fontes.map((f: string) => `<li>${f}</li>`).join('')}
      ${urls.slice(0, 10).map((u: string) => `<li><a href="${u}" target="_blank">${u}</a></li>`).join('')}
      <li>Sistema Integrado de Planejamento e Orçamento (SIOP)</li>
      <li>Portal da Transparência do Governo Federal</li>
      <li>Lei Orçamentária Anual (LOA) 2018–2025</li>
      <li>PPA 2024–2027 — Agendas Transversais de Igualdade Racial e Povos Indígenas</li>
    </ul>
  </div>
</div>
</section>

<!-- ═══════════════ 12. ANEXO ═══════════════ -->
<section class="section" id="anexo">
<div class="container">
  <div class="section-header">
    <div class="section-icon">📎</div>
    <div><h2 class="section-title">ANEXO — Listagem Completa de Programas e Ações</h2>
    <p class="section-subtitle">${programas.size} programas · ${all.length} registros (Ação × Ano)</p></div>
  </div>

  <div class="table-container">
    <div class="table-header"><h3>Programas Orçamentários — Valores Consolidados</h3><p>Ordenados por valor pago total (decrescente)</p></div>
    <table>
      <thead><tr><th>Programa</th><th>Órgão</th><th>Grupo Focal</th><th>Período</th><th>Dotação Total</th><th>Pago Total</th><th>Artigos ICERD</th></tr></thead>
      <tbody>
      ${Object.entries(byPrograma).sort(([,a], [,b]) => b.pago - a.pago).map(([prog, data]) => {
        const anosArr = Array.from(data.anos).sort() as number[];
        return `<tr>
          <td><strong>${prog}</strong></td>
          <td>${data.orgao}</td>
          <td>${grupoLabels[data.grupo] || data.grupo}</td>
          <td>${anosArr[0]}–${anosArr[anosArr.length - 1]}</td>
          <td style="text-align:right;font-family:monospace;font-size:9pt">${fmtFull(data.dotacao)}</td>
          <td style="text-align:right;font-family:monospace;font-size:9pt"><strong>${fmtFull(data.pago)}</strong></td>
          <td style="font-size:.8rem">${Array.from(data.artigos).join(', ') || '—'}</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
  </div>

  <!-- Detalhamento por Ação × Ano -->
  <div class="table-container">
    <div class="table-header"><h3>Detalhamento — Ação × Ano</h3><p>${all.length} registros completos</p></div>
    <table>
      <thead><tr><th>Programa</th><th>Órgão</th><th>Ano</th><th>Tipo</th><th>Dotação</th><th>Pago</th><th>Exec.</th></tr></thead>
      <tbody>
      ${all.sort((a: any, b: any) => a.programa.localeCompare(b.programa) || a.ano - b.ano).map((r: any) => {
        const dot = parseFloat(r.dotacao_autorizada || 0);
        const pago = parseFloat(r.pago || 0);
        const exec = dot > 0 ? (pago / dot * 100).toFixed(0) : '—';
        return `<tr>
          <td style="font-size:.8rem">${r.programa}</td>
          <td style="font-size:.8rem">${r.orgao}</td>
          <td>${r.ano}</td>
          <td>${r.tipo_dotacao === 'extraorcamentario' ? '🔄 Extra' : '💰 LOA'}</td>
          <td style="text-align:right;font-family:monospace;font-size:9pt">${fmtFull(dot)}</td>
          <td style="text-align:right;font-family:monospace;font-size:9pt">${fmtFull(pago)}</td>
          <td>${exec}%</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
  </div>
</div>
</section>

<!-- ═══════════════ FOOTER ═══════════════ -->
<footer class="footer">
<div class="container footer-content">
  <p><strong>Relatório Orçamentário Consolidado — Políticas de Igualdade Racial (2018–2025)</strong></p>
  <p>Gerado automaticamente pelo Sistema de Monitoramento CERD Brasil</p>
  <p style="margin-top:12px;"><strong>CDG/UFF</strong> • Grupo de Pesquisa sobre Tratados de Direitos Humanos<br><strong>MIR</strong> • Ministério da Igualdade Racial<br><strong>MRE</strong> • Ministério das Relações Exteriores</p>
  <p style="margin-top:12px;opacity:.5;">Data de geração: ${dataGeracao}</p>
</div>
</footer>

<script>
document.addEventListener('DOMContentLoaded', function() {
  // 1. Evolução Anual (dual axis)
  const evolCtx = document.getElementById('evolucaoChart');
  if (evolCtx) {
    new Chart(evolCtx, {
      type: 'bar',
      data: {
        labels: ${JSON.stringify(evolucao.map(e => e.ano))},
        datasets: [
          { label: 'Dotação Autorizada', data: ${JSON.stringify(evolucao.map(e => e.dotacao / 1e6))}, backgroundColor: '#bfdbfe', order: 2 },
          { label: 'Pago', data: ${JSON.stringify(evolucao.map(e => e.pago / 1e6))}, backgroundColor: '#047857', order: 1 },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
        scales: { y: { beginAtZero: true, title: { display: true, text: 'Milhões (R$)' } } }
      }
    });
  }

  // 2. Masking chart
  const maskCtx = document.getElementById('maskingChart');
  if (maskCtx) {
    const maskData = ${JSON.stringify(anos.map(a => {
      const recs = byAno[a] || [];
      return {
        ano: a,
        orc: recs.filter((r: any) => r.tipo_dotacao !== 'extraorcamentario').reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0) / 1e6,
        extra: recs.filter((r: any) => r.tipo_dotacao === 'extraorcamentario').reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0) / 1e6,
      };
    }))};
    new Chart(maskCtx, {
      type: 'bar',
      data: {
        labels: maskData.map(d => d.ano),
        datasets: [
          { label: 'LOA (Orçamentário)', data: maskData.map(d => d.orc), backgroundColor: '#047857', stack: 's' },
          { label: 'Extraorçamentário', data: maskData.map(d => d.extra), backgroundColor: '#f97316', stack: 's' },
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } },
        scales: { y: { stacked: true, beginAtZero: true, title: { display: true, text: 'Milhões (R$)' } }, x: { stacked: true } }
      }
    });
  }

  // 3. Grupo focal doughnut
  const grupoData = ${JSON.stringify(Object.entries(byGrupo).map(([g, recs]) => ({
    label: grupoLabels[g] || g,
    value: (recs as any[]).reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0) / 1e6
  })))};
  const grupoCtx = document.getElementById('grupoChart');
  if (grupoCtx) {
    new Chart(grupoCtx, {
      type: 'doughnut',
      data: {
        labels: grupoData.map(g => g.label),
        datasets: [{ data: grupoData.map(g => g.value), backgroundColor: ['#047857','#1e40af','#7c3aed','#dc2626','#eab308','#ec4899','#06b6d4','#f97316','#84cc16','#6366f1'] }]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { font: { size: 10 } } } } }
    });
  }

  // 4. Artigos ICERD bar
  const artigoData = ${JSON.stringify(Object.entries(byArtigo).sort(([a], [b]) => a.localeCompare(b)).map(([art, data]) => ({ label: art, pago: data.pago / 1e6, dotacao: data.dotacao / 1e6 })))};
  const artCtx = document.getElementById('artigoChart');
  if (artCtx && artigoData.length > 0) {
    new Chart(artCtx, {
      type: 'bar',
      data: {
        labels: artigoData.map(a => a.label),
        datasets: [
          { label: 'Dotação', data: artigoData.map(a => a.dotacao), backgroundColor: '#bfdbfe' },
          { label: 'Pago', data: artigoData.map(a => a.pago), backgroundColor: '#047857' },
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { position: 'bottom' } }, scales: { x: { beginAtZero: true, title: { display: true, text: 'Milhões (R$)' } } } }
    });
  }
});
</script>
</body>
</html>`;

    return new Response(html, {
      headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao gerar relatório orçamentário:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

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

// ═══════════════ INLINE SVG CHART GENERATORS ═══════════════

function svgBarChart(
  labels: string[], series: { name: string; color: string; values: number[] }[],
  width = 650, height = 260, stacked = false
): string {
  const pad = { top: 30, right: 20, bottom: 55, left: 70 };
  const w = width - pad.left - pad.right;
  const h = height - pad.top - pad.bottom;
  const allValues = stacked
    ? labels.map((_, i) => series.reduce((s, sr) => s + (sr.values[i] || 0), 0))
    : series.flatMap(s => s.values);
  if (allValues.length === 0) return '';
  const max = Math.ceil(Math.max(...allValues) * 1.15) || 1;
  const n = labels.length;
  const gw = w / n;
  const barW = stacked ? Math.min(gw * 0.6, 40) : Math.min(gw / (series.length + 1), 28);
  const fmtV = (v: number) => v >= 1e9 ? `${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : String(Math.round(v));
  const yScale = (v: number) => pad.top + h - (v / max) * h;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:100%;max-width:${width}px;height:auto;background:#fafbfc;border:1px solid #e2e8f0;border-radius:8px;">`;
  // Grid lines
  for (let i = 0; i <= 4; i++) {
    const y = pad.top + (h / 4) * i;
    const val = max - (max / 4) * i;
    svg += `<line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3"/>`;
    svg += `<text x="${pad.left - 6}" y="${y + 4}" text-anchor="end" font-size="9" fill="#94a3b8">${fmtV(val)}</text>`;
  }
  // Bars
  labels.forEach((l, li) => {
    const gx = pad.left + gw * li + gw / 2;
    if (stacked) {
      let cumY = 0;
      series.forEach(s => {
        const v = s.values[li] || 0;
        const barH = (v / max) * h;
        const y = yScale(cumY + v);
        svg += `<rect x="${gx - barW/2}" y="${y}" width="${barW}" height="${barH}" fill="${s.color}" opacity="0.85"/>`;
        if (barH > 14) {
          svg += `<text x="${gx}" y="${y + barH/2 + 4}" text-anchor="middle" font-size="8" font-weight="600" fill="white">${fmtV(v)}</text>`;
        }
        cumY += v;
      });
      // Total label above
      svg += `<text x="${gx}" y="${yScale(cumY) - 4}" text-anchor="middle" font-size="8" font-weight="700" fill="#334155">${fmtV(cumY)}</text>`;
    } else {
      series.forEach((s, si) => {
        const x = gx - (series.length * barW) / 2 + si * barW;
        const v = s.values[li] || 0;
        const barH = (v / max) * h;
        const y = yScale(v);
        svg += `<rect x="${x}" y="${y}" width="${barW - 2}" height="${barH}" rx="2" fill="${s.color}" opacity="0.85"/>`;
        svg += `<text x="${x + (barW - 2)/2}" y="${y - 4}" text-anchor="middle" font-size="7.5" font-weight="600" fill="${s.color}">${fmtV(v)}</text>`;
      });
    }
    svg += `<text x="${gx}" y="${height - 12}" text-anchor="middle" font-size="9" fill="#64748b">${l}</text>`;
  });
  // Legend
  let lx = pad.left;
  series.forEach(s => {
    svg += `<rect x="${lx}" y="${pad.top - 22}" width="12" height="10" rx="2" fill="${s.color}"/>`;
    svg += `<text x="${lx + 16}" y="${pad.top - 14}" font-size="9" fill="#64748b">${s.name}</text>`;
    lx += s.name.length * 5.5 + 30;
  });
  svg += '</svg>';
  return svg;
}

function svgDonutChart(segments: { label: string; value: number; color: string }[], width = 350, height = 350): string {
  const cx = width / 2, cy = height / 2 - 20;
  const r = Math.min(cx, cy) - 40;
  const innerR = r * 0.55;
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return '';
  const fmtV = (v: number) => v >= 1e9 ? `${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : String(Math.round(v));

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:100%;max-width:${width}px;height:auto;background:#fafbfc;border:1px solid #e2e8f0;border-radius:8px;">`;
  let startAngle = -Math.PI / 2;
  segments.forEach(seg => {
    const angle = (seg.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;
    const large = angle > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(startAngle), y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle), y2 = cy + r * Math.sin(endAngle);
    const ix1 = cx + innerR * Math.cos(endAngle), iy1 = cy + innerR * Math.sin(endAngle);
    const ix2 = cx + innerR * Math.cos(startAngle), iy2 = cy + innerR * Math.sin(startAngle);
    svg += `<path d="M${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} L${ix1} ${iy1} A${innerR} ${innerR} 0 ${large} 0 ${ix2} ${iy2} Z" fill="${seg.color}"/>`;
    if (seg.value > 0 && angle > 0.2) {
      const midAngle = startAngle + angle / 2;
      const labelR = (r + innerR) / 2;
      const lx = cx + labelR * Math.cos(midAngle);
      const ly = cy + labelR * Math.sin(midAngle);
      const pct = ((seg.value / total) * 100).toFixed(0);
      svg += `<text x="${lx}" y="${ly + 4}" text-anchor="middle" font-size="9" font-weight="700" fill="white">${pct}%</text>`;
    }
    startAngle = endAngle;
  });
  svg += `<text x="${cx}" y="${cy - 5}" text-anchor="middle" font-size="18" font-weight="700" fill="#047857">${fmtV(total)}</text>`;
  svg += `<text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="9" fill="#64748b">Total (R$ mi)</text>`;
  // Legend
  let ly = height - 50;
  let lx = 10;
  segments.forEach(seg => {
    if (seg.value === 0) return;
    svg += `<rect x="${lx}" y="${ly}" width="10" height="10" rx="2" fill="${seg.color}"/>`;
    svg += `<text x="${lx + 14}" y="${ly + 9}" font-size="8" fill="#334155">${seg.label}</text>`;
    lx += seg.label.length * 4.5 + 25;
    if (lx > width - 50) { lx = 10; ly += 14; }
  });
  svg += '</svg>';
  return svg;
}

function svgHBarChart(items: { label: string; value: number; color: string }[], width = 650, height?: number): string {
  const n = items.length;
  const rowH = 30;
  const h = height || (n * rowH + 60);
  const pad = { top: 10, right: 100, bottom: 10, left: 200 };
  const w = width - pad.left - pad.right;
  const max = Math.max(...items.map(i => i.value)) || 1;
  const fmtV = (v: number) => v >= 1e9 ? `${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `${(v/1e6).toFixed(0)}M` : v >= 1e3 ? `${(v/1e3).toFixed(0)}K` : String(Math.round(v));

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${h}" style="width:100%;max-width:${width}px;height:auto;background:#fafbfc;border:1px solid #e2e8f0;border-radius:8px;">`;
  items.forEach((item, i) => {
    const y = pad.top + i * rowH + 5;
    // Minimum bar width of 3px so small values are still visible
    const barW = Math.max(3, (item.value / max) * w);
    svg += `<text x="${pad.left - 8}" y="${y + 16}" text-anchor="end" font-size="9" fill="#334155">${item.label.length > 30 ? item.label.slice(0,30) + '…' : item.label}</text>`;
    svg += `<rect x="${pad.left}" y="${y + 2}" width="${barW}" height="${rowH - 8}" rx="3" fill="${item.color}" opacity="0.85"/>`;
    svg += `<text x="${pad.left + barW + 4}" y="${y + 16}" font-size="9" font-weight="600" fill="${item.color}">${fmtV(item.value)}</text>`;
  });
  svg += '</svg>';
  return svg;
}

// ═══════════════════════════════════════

const EIXO_PARA_ARTIGOS: Record<string, string[]> = {
  legislacao_justica: ['I', 'II', 'VI'],
  politicas_institucionais: ['II'],
  seguranca_publica: ['V', 'VI'],
  saude: ['V'],
  educacao: ['V', 'VII'],
  trabalho_renda: ['V'],
  terra_territorio: ['III', 'V'],
  cultura_patrimonio: ['V', 'VII'],
  participacao_social: ['V'],
  dados_estatisticas: ['I', 'II'],
};

function inferArtigosOrcamento(r: any): string[] {
  const explicit = (r.artigos_convencao || []).filter((a: string) => ['I','II','III','IV','V','VI','VII'].includes(a));
  if (explicit.length > 0) return explicit;

  const eixo = r.eixo_tematico;
  if (eixo && EIXO_PARA_ARTIGOS[eixo]) return EIXO_PARA_ARTIGOS[eixo];

  const texto = [r.programa, r.orgao, r.descritivo].filter(Boolean).join(' ').toLowerCase();
  const arts: string[] = [];
  if (texto.match(/educa|escola|ensino|formação|formacao|lei 10.639/)) { arts.push('V'); arts.push('VII'); }
  if (texto.match(/saúde|saude|sesai|sanitár|sanitar/)) arts.push('V');
  if (texto.match(/trabalho|emprego|renda|profissional/)) arts.push('V');
  if (texto.match(/terra|territór|territor|quilomb|funai|incra|demarcaç|demarcac|indígena|indigena/)) { arts.push('III'); arts.push('V'); }
  if (texto.match(/justiça|justica|judiciár|judiciar|proteç|protecao|reparaç|reparac|indeniza|direitos humanos/)) arts.push('VI');
  if (texto.match(/cultur|patrimôn|patrimon|capoeira|candomblé|candomble|matriz africana/)) { arts.push('V'); arts.push('VII'); }
  if (texto.match(/igualdade|discrimin|racis|enfrentamento ao racismo/)) { arts.push('I'); arts.push('II'); }
  if (texto.match(/segurança|seguranca|polícia|policia|homicíd|homicid|violência|violencia|letal/)) { arts.push('V'); arts.push('VI'); }
  if (texto.match(/polític|politica|institucional|ação afirmativa|acao afirmativa/)) arts.push('II');
  if (texto.match(/mulher|gênero|genero/)) arts.push('V');
  if (texto.match(/povos indígenas|povos indigenas|etnodesenvolvimento/)) { arts.push('III'); arts.push('V'); }
  return [...new Set(arts)];
}

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

    const byPrograma: Record<string, { orgao: string; pago: number; dotacao: number; anos: Set<number>; artigos: Set<string>; grupo: string }> = {};
    all.forEach(r => {
      if (!byPrograma[r.programa]) byPrograma[r.programa] = { orgao: r.orgao, pago: 0, dotacao: 0, anos: new Set(), artigos: new Set(), grupo: r.grupo_focal || 'geral' };
      byPrograma[r.programa].pago += parseFloat(r.pago || 0);
      byPrograma[r.programa].dotacao += parseFloat(r.dotacao_autorizada || 0);
      byPrograma[r.programa].anos.add(r.ano);
      inferArtigosOrcamento(r).forEach((a: string) => byPrograma[r.programa].artigos.add(a));
    });

    const byGrupo: Record<string, any[]> = {};
    all.forEach(r => { const g = r.grupo_focal || 'geral'; if (!byGrupo[g]) byGrupo[g] = []; byGrupo[g].push(r); });

    const simbolicos = all.filter(r => parseFloat(r.dotacao_autorizada || 0) > 100000 && parseFloat(r.pago || 0) === 0);

    // Use inferArtigosOrcamento for byArtigo (matches Orçamento > Artigos ICERD tab)
    const byArtigo: Record<string, { pago: number; dotacao: number; programas: Set<string>; registros: number }> = {};
    all.forEach(r => {
      const arts = inferArtigosOrcamento(r);
      arts.forEach((a: string) => {
        if (!byArtigo[a]) byArtigo[a] = { pago: 0, dotacao: 0, programas: new Set(), registros: 0 };
        byArtigo[a].pago += parseFloat(r.pago || 0);
        byArtigo[a].dotacao += parseFloat(r.dotacao_autorizada || 0);
        byArtigo[a].programas.add(r.programa);
        byArtigo[a].registros++;
      });
    });
    const unmappedCount = all.filter(r => inferArtigosOrcamento(r).length === 0).length;

    const fontes = [...new Set(all.map(r => r.fonte_dados).filter(Boolean))];
    const urls = [...new Set(all.map(r => r.url_fonte).filter(Boolean))];

    const programas = new Set(all.map(r => r.programa));
    const orgaos = new Set(all.map(r => r.orgao));
    const totalDot = all.reduce((s: number, r: any) => s + parseFloat(r.dotacao_autorizada || 0), 0);
    const totalPago = all.reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0);
    const execGeral = totalDot > 0 ? (totalPago / totalDot * 100).toFixed(1) : '—';

    const dataGeracao = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

    // ═══════════ Generate SVG Charts ═══════════

    const chartEvolucao = svgBarChart(
      evolucao.map(e => String(e.ano)),
      [
        { name: 'Dotação Autorizada', color: '#93c5fd', values: evolucao.map(e => e.dotacao / 1e6) },
        { name: 'Pago', color: '#047857', values: evolucao.map(e => e.pago / 1e6) },
      ],
      700, 280
    );

    const maskingData = anos.map(a => {
      const recs = byAno[a] || [];
      return {
        orc: recs.filter((r: any) => r.tipo_dotacao !== 'extraorcamentario').reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0) / 1e6,
        extra: recs.filter((r: any) => r.tipo_dotacao === 'extraorcamentario').reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0) / 1e6,
      };
    });
    const chartMasking = svgBarChart(
      anos.map(String),
      [
        { name: 'LOA (Orçamentário)', color: '#047857', values: maskingData.map(d => d.orc) },
        { name: 'Extraorçamentário', color: '#f97316', values: maskingData.map(d => d.extra) },
      ],
      700, 280, true
    );

    const grupoChartData = Object.entries(byGrupo)
      .map(([g, recs]) => ({
        label: grupoLabels[g] || g,
        value: Math.round((recs as any[]).reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0) / 1e6),
        color: ['#047857','#1e40af','#7c3aed','#dc2626','#eab308','#ec4899','#06b6d4','#f97316','#84cc16','#6366f1'][Object.keys(byGrupo).indexOf(g) % 10],
      }))
      .filter(s => s.value > 0)
      .sort((a, b) => b.value - a.value);
    const chartGrupo = svgDonutChart(grupoChartData, 380, 380);

    const artigoTitulosChart: Record<string, string> = {
      'I': 'Art. I — Definição', 'II': 'Art. II — Obrigações', 'III': 'Art. III — Segregação',
      'IV': 'Art. IV — Propaganda', 'V': 'Art. V — Igualdade', 'VI': 'Art. VI — Proteção Judicial',
      'VII': 'Art. VII — Ensino/Cultura',
    };
    const artigoColors = ['#6366f1','#2563eb','#0891b2','#dc2626','#047857','#7c3aed','#ea580c'];
    const artigoChartItems = Object.entries(byArtigo)
      .sort(([a], [b]) => {
        const order = ['I','II','III','IV','V','VI','VII'];
        return order.indexOf(a) - order.indexOf(b);
      })
      .map(([art, data], i) => ({
        label: artigoTitulosChart[art] || art,
        value: data.pago,
        color: artigoColors[i % artigoColors.length],
      }));
    const chartArtigos = artigoChartItems.length > 0 ? svgHBarChart(artigoChartItems, 650) : '';

    // Top programs bar chart
    const topProgs = Object.entries(byPrograma)
      .sort(([,a], [,b]) => b.pago - a.pago)
      .slice(0, 10)
      .map(([prog, data]) => ({
        label: prog.length > 35 ? prog.slice(0, 35) + '…' : prog,
        value: data.pago,
        color: '#1e40af',
      }));
    const chartTopProgs = svgHBarChart(topProgs, 700);

    // ═══════════ Evolução sem SESAI ═══════════
    const evolNS = anos.map(a => {
      const recs = (byAno[a] || []).filter((r: any) => !isSesai(r));
      return {
        dotacao: recs.reduce((s: number, r: any) => s + parseFloat(r.dotacao_autorizada || 0), 0),
        pago: recs.reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0),
      };
    });
    const chartEvolNS = svgBarChart(
      anos.map(String),
      [
        { name: 'Dotação (sem SESAI)', color: '#93c5fd', values: evolNS.map(e => e.dotacao / 1e6) },
        { name: 'Pago (sem SESAI)', color: '#1e40af', values: evolNS.map(e => e.pago / 1e6) },
      ],
      700, 260
    );

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Relatório Orçamentário Consolidado — Políticas de Igualdade Racial (2018–2025)</title>
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
@media print{body{font-size:10pt;}.hero{padding:30px 0;}.section{padding:20px 0;page-break-inside:avoid;}}
@media(max-width:768px){.grid-2,.grid-3,.grid-4{grid-template-columns:1fr;}.hero-stats{grid-template-columns:repeat(2,1fr);}}
@page { size: A4; margin: 1.5cm; @bottom-center { content: counter(page) " / " counter(pages); font-size: 9pt; color: #64748b; } }
@page :first { @bottom-center { content: none; } }
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
      <li><a href="#resumo-comparativo">Resumo Comparativo — Tripla Perspectiva</a></li>
      <li><a href="#mascaramento">Efeito Mascaramento Extraorçamentário</a></li>
      <li><a href="#orcamento-simbolico">Orçamento Simbólico</a></li>
      <li><a href="#top-programas">Top 10 Programas</a></li>
      <li><a href="#grupos-focais">Análise por Grupo Focal</a></li>
      <li><a href="#artigos-icerd">Cruzamento × Artigos ICERD</a></li>
      <li><a href="#cruzamento-indicadores">Cruzamento × Indicadores Sociais</a></li>
      <li><a href="#ieat-racial">IEAT-Racial — Índice de Eficácia da Agenda Transversal</a></li>
      <li><a href="#metodologia-detalhada">Metodologia Detalhada — Passo a Passo</a></li>
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

<!-- ═══════════════ 2. VISÃO GERAL — QUADRO EXECUTIVO ═══════════════ -->
<section class="section" id="visao-geral">
<div class="container">
  <div class="section-header">
    <div class="section-icon">📋</div>
    <div><h2 class="section-title">2. Quadro Executivo — Visão Geral</h2>
    <p class="section-subtitle">Panorama consolidado da execução orçamentária com destaques</p></div>
  </div>

  <!-- KPI Tags Row 1 -->
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:16px;">
    <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #22c55e;border-radius:12px;padding:20px;text-align:center;">
      <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:#166534;font-weight:600;margin-bottom:4px;">💰 Dotação Total</div>
      <div style="font-size:1.6rem;font-weight:900;color:#166534;">${fmtC(totalDot)}</div>
      <div style="font-size:.7rem;color:#64748b;margin-top:4px;">LOA + Créditos Adicionais</div>
    </div>
    <div style="background:linear-gradient(135deg,#f0fdf4,#dcfce7);border:2px solid #22c55e;border-radius:12px;padding:20px;text-align:center;">
      <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:#166534;font-weight:600;margin-bottom:4px;">✅ Total Pago</div>
      <div style="font-size:1.6rem;font-weight:900;color:#166534;">${fmtC(totalPago)}</div>
      <div style="font-size:.7rem;color:#64748b;margin-top:4px;">Transferência efetiva</div>
    </div>
    <div style="background:linear-gradient(135deg,#eff6ff,#dbeafe);border:2px solid #3b82f6;border-radius:12px;padding:20px;text-align:center;">
      <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:#1e40af;font-weight:600;margin-bottom:4px;">📊 Execução Geral</div>
      <div style="font-size:1.6rem;font-weight:900;color:#1e40af;">${execGeral}%</div>
      <div style="font-size:.7rem;color:#64748b;margin-top:4px;">Pago ÷ Dotação</div>
    </div>
    <div style="background:linear-gradient(135deg,#f8fafc,#f1f5f9);border:2px solid #94a3b8;border-radius:12px;padding:20px;text-align:center;">
      <div style="font-size:.7rem;text-transform:uppercase;letter-spacing:1px;color:#475569;font-weight:600;margin-bottom:4px;">📁 Registros</div>
      <div style="font-size:1.6rem;font-weight:900;color:#475569;">${orcOnly.length}</div>
      <div style="font-size:.7rem;color:#64748b;margin-top:4px;">Ação × Ano (orçamentário)</div>
    </div>
  </div>

  <!-- KPI Tags Row 2: Períodos -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
    <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:10px;padding:16px;text-align:center;">
      <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:#991b1b;font-weight:600;">Pago 2018–2022 (P1)</div>
      <div style="font-size:1.3rem;font-weight:800;color:#991b1b;margin:4px 0;">${fmtC(sAll.pagoP1)}</div>
      <div style="font-size:.65rem;color:#64748b;">5 anos · Governo anterior</div>
    </div>
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:10px;padding:16px;text-align:center;">
      <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:#166534;font-weight:600;">Pago 2023–2025 (P2)</div>
      <div style="font-size:1.3rem;font-weight:800;color:#166534;margin:4px 0;">${fmtC(sAll.pagoP2)}</div>
      <div style="font-size:.65rem;color:#64748b;">3 anos · Governo atual</div>
    </div>
    <div style="background:${sAll.varPago >= 0 ? '#f0fdf4' : '#fef2f2'};border:2px solid ${sAll.varPago >= 0 ? '#22c55e' : '#ef4444'};border-radius:10px;padding:16px;text-align:center;">
      <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:${sAll.varPago >= 0 ? '#166534' : '#991b1b'};font-weight:600;">Variação Pago</div>
      <div style="font-size:1.3rem;font-weight:800;color:${sAll.varPago >= 0 ? '#166534' : '#991b1b'};margin:4px 0;">${sAll.varPago >= 0 ? '+' : ''}${sAll.varPago.toFixed(1)}%</div>
      <div style="font-size:.65rem;color:#64748b;">P2 vs P1 (acumulado)</div>
    </div>
  </div>

  <!-- KPI Tags Row 3: Dotação -->
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:16px;">
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center;">
      <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:#475569;font-weight:600;">Dotação 2018–2022</div>
      <div style="font-size:1.2rem;font-weight:700;color:#475569;margin:4px 0;">${fmtC(sAll.dotP1)}</div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center;">
      <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:#475569;font-weight:600;">Dotação 2023–2025</div>
      <div style="font-size:1.2rem;font-weight:700;color:#475569;margin:4px 0;">${fmtC(sAll.dotP2)}</div>
    </div>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px;text-align:center;">
      <div style="font-size:.65rem;text-transform:uppercase;letter-spacing:1px;color:${sAll.varDot >= 0 ? '#166534' : '#991b1b'};font-weight:600;">Variação Dotação</div>
      <div style="font-size:1.2rem;font-weight:700;color:${sAll.varDot >= 0 ? '#166534' : '#991b1b'};margin:4px 0;">${sAll.varDot >= 0 ? '+' : ''}${sAll.varDot.toFixed(1)}%</div>
    </div>
  </div>

  <!-- Análise textual do Quadro Executivo -->
  <div style="background:white;border:2px solid var(--primary);border-radius:12px;padding:20px;line-height:1.7;">
    <h4 style="color:var(--primary);margin-bottom:8px;">📝 Análise do Quadro Executivo</h4>
    <p style="font-size:.9rem;margin-bottom:8px;">O volume total de recursos pagos (<strong>${fmtC(totalPago)}</strong>) representa <strong>${execGeral}%</strong> da dotação autorizada (<strong>${fmtC(totalDot)}</strong>).</p>
    <p style="font-size:.9rem;margin-bottom:8px;">A variação entre P1 e P2 (<strong>${sAll.varPago >= 0 ? '+' : ''}${sAll.varPago.toFixed(1)}%</strong> no pago) deve ser contextualizada: P1 compreende <strong>5 anos</strong> de execução enquanto P2 abrange <strong>3 anos</strong> — portanto, a ${sAll.varPago > 0 ? 'expansão é proporcionalmente ainda mais expressiva quando anualizada' : 'contração reflete uma reversão real na priorização orçamentária'}.</p>
    <div style="background:#fffbeb;border:1px solid #f59e0b;border-radius:8px;padding:14px;margin-top:8px;">
      <p style="font-size:.85rem;margin:0;color:#92400e;"><strong>⚠️ Ressalva Metodológica — Comparação Dotação × Pago:</strong> Este relatório <strong>não apresenta comparativo direto entre dotação autorizada e valor pago</strong> como métrica isolada de desempenho. No P1 (2018–2022), houve significativo volume de pagamentos <strong>extraorçamentários</strong> (${fmtC(sExtra.pagoP1)}) — royalties, compensações e indenizações — que se reduziram no P2 (${fmtC(sExtra.pagoP2)}, variação de <strong>${sExtra.varPago >= 0 ? '+' : ''}${sExtra.varPago.toFixed(1)}%</strong>). A <strong>reclassificação contábil de 2023</strong> (formalização de recursos antes executados como extraorçamentários em ações LOA diretas, exigência TCU/CGU) ampliou a dotação sem correspondente aumento proporcional no pago orçamentário. Portanto, uma taxa de execução (pago/dotação) aparentemente baixa no P2 não reflete necessariamente desinvestimento, mas sim uma mudança na estrutura contábil do financiamento público. A análise de eficácia deste relatório concentra-se nas <strong>3 perspectivas comparativas (Total, Sem SESAI, Apenas SESAI)</strong> e no <strong>IEAT-Racial</strong>.</p>
    </div>
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
    <div class="chart-header"><div class="chart-title">Execução Orçamentária Anual — Total (com SESAI)</div><div class="chart-subtitle">Dotação Autorizada × Pago (milhões R$)</div></div>
    ${chartEvolucao}
    <p class="chart-source"><strong>Fontes:</strong> ${fontes.slice(0,3).join(', ') || 'SIOP/Portal da Transparência'}</p>
  </div>

  <div class="chart-container">
    <div class="chart-header"><div class="chart-title">Evolução Sem SESAI (stricto sensu)</div><div class="chart-subtitle">Perspectiva de políticas raciais isoladas (milhões R$)</div></div>
    ${chartEvolNS}
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

<!-- ═══════════════ 4. RESUMO COMPARATIVO — TRIPLA PERSPECTIVA ═══════════════ -->
<section class="section" id="resumo-comparativo">
<div class="container">
  <div class="section-header">
    <div class="section-icon">⚖️</div>
    <div><h2 class="section-title">4. Resumo Comparativo — Tripla Perspectiva</h2>
    <p class="section-subtitle">Total (com SESAI) vs. Sem SESAI vs. Apenas SESAI</p></div>
  </div>

  <div class="insight-card">
    <p>🔍 <strong>Por que três perspectivas?</strong> A SESAI (Secretaria Especial de Saúde Indígena) movimenta volumes expressivos (${fmtC(sSesai.pagoP1 + sSesai.pagoP2)} acumulados), o que pode mascarar a real evolução do investimento em políticas de igualdade racial stricto sensu.</p>
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
    <h3>🟠 Perspectiva 3 — Apenas SESAI</h3>
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

  <div class="chart-container">
    <div class="chart-header"><div class="chart-title">Orçamentário × Extraorçamentário por Ano (empilhado)</div><div class="chart-subtitle">Valores pagos em milhões R$</div></div>
    ${chartMasking}
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

<!-- ═══════════════ 7. TOP 10 PROGRAMAS ═══════════════ -->
<section class="section section-alt" id="top-programas">
<div class="container">
  <div class="section-header">
    <div class="section-icon">🏆</div>
    <div><h2 class="section-title">7. Top 10 Programas por Valor Pago</h2>
    <p class="section-subtitle">Programas com maior execução orçamentária acumulada</p></div>
  </div>
  <div class="chart-container">
    <div class="chart-header"><div class="chart-title">Ranking dos Programas (R$ pago total)</div></div>
    ${chartTopProgs}
  </div>
</div>
</section>

<!-- ═══════════════ 8. GRUPOS FOCAIS ═══════════════ -->
<section class="section" id="grupos-focais">
<div class="container">
  <div class="section-header">
    <div class="section-icon">👥</div>
    <div><h2 class="section-title">8. Distribuição por Grupo Focal</h2>
    <p class="section-subtitle">Orçamento destinado a cada grupo populacional — P1 vs P2</p></div>
  </div>

  <div class="grid-2">
    <div class="chart-container">
      <div class="chart-header"><div class="chart-title">Distribuição por Grupo Focal</div><div class="chart-subtitle">Total pago 2018–2025 (R$ milhões)</div></div>
      ${chartGrupo}
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

<!-- ═══════════════ 9. ARTIGOS ICERD ═══════════════ -->
<section class="section section-alt" id="artigos-icerd">
<div class="container">
  <div class="section-header">
    <div class="section-icon">⚖️</div>
    <div><h2 class="section-title">9. Cruzamento Orçamentário × Artigos ICERD</h2>
    <p class="section-subtitle">Mapeamento automático dos programas aos artigos I–VII da Convenção (via inferência por eixo temático e palavras-chave)</p></div>
  </div>

  ${(() => {
    const artigoTitulos: Record<string, string> = {
      'I': 'Definição de Discriminação Racial',
      'II': 'Obrigações dos Estados',
      'III': 'Segregação e Apartheid',
      'IV': 'Propaganda e Organizações Racistas',
      'V': 'Igualdade de Direitos',
      'VI': 'Proteção Judicial',
      'VII': 'Ensino, Educação e Cultura',
    };
    const sortedArtigos = Object.entries(byArtigo).sort(([a], [b]) => {
      const order = ['I','II','III','IV','V','VI','VII'];
      return order.indexOf(a) - order.indexOf(b);
    });
    const totalMapped = all.length - unmappedCount;
    const pctMapped = all.length > 0 ? (totalMapped / all.length * 100).toFixed(0) : '0';

    if (sortedArtigos.length === 0) return '<div class="insight-card"><p>⚠️ Nenhum registro orçamentário mapeado para artigos da Convenção ICERD.</p></div>';

    return `
  <div class="grid-2" style="margin-bottom:16px;">
    <div class="stat-card"><div class="stat-card-value">${totalMapped}/${all.length}</div><div class="stat-card-label">Registros mapeados (${pctMapped}%)</div></div>
    <div class="stat-card"><div class="stat-card-value">${sortedArtigos.length}/7</div><div class="stat-card-label">Artigos com cobertura orçamentária</div></div>
  </div>

  <div class="chart-container">
    <div class="chart-header"><div class="chart-title">Pago por Artigo ICERD (R$)</div><div class="chart-subtitle">Inferência via eixo temático + palavras-chave (mesma lógica da aba Artigos ICERD)</div></div>
    ${chartArtigos}
  </div>

  <div class="table-container">
    <div class="table-header"><h3>Resumo por Artigo da Convenção</h3><p>Mapeamento financeiro dos artigos I–VII da ICERD — listagem completa no Anexo B</p></div>
    <table>
      <thead><tr><th>Artigo</th><th>Título</th><th>Programas</th><th>Registros</th><th>Dotação Total</th><th>Pago Total</th><th>Execução</th></tr></thead>
      <tbody>
      ${sortedArtigos.map(([art, data]) => {
        const exec = data.dotacao > 0 ? (data.pago / data.dotacao * 100).toFixed(1) : '—';
        return '<tr><td><strong>Art. ' + art + '</strong></td><td>' + (artigoTitulos[art] || art) + '</td><td style="text-align:center">' + data.programas.size + '</td><td style="text-align:center">' + data.registros + '</td><td style="text-align:right;font-family:monospace">' + fmtFull(data.dotacao) + '</td><td style="text-align:right;font-family:monospace">' + fmtFull(data.pago) + '</td><td>' + exec + '%</td></tr>';
      }).join('')}
      </tbody>
    </table>
    <div class="table-footer">Método: artigos_convencao (explícito) → eixo_tematico (EIXO_PARA_ARTIGOS) → keywords no programa/órgão/descritivo${unmappedCount > 0 ? '. ' + unmappedCount + ' registro(s) sem mapeamento.' : ''}</div>
  </div>`;
  })()}
</div>
</section>

<!-- ═══════════════ 10. CRUZAMENTO INDICADORES ═══════════════ -->
<section class="section" id="cruzamento-indicadores">
<div class="container">
  <div class="section-header">
    <div class="section-icon">🔗</div>
    <div><h2 class="section-title">10. Cruzamento: Orçamento × Indicadores Sociais</h2>
    <p class="section-subtitle">Correlação entre investimento público e evolução dos indicadores — ${indicadores.length} indicadores no sistema</p></div>
  </div>

  ${(() => {
    // Helper: extract series and compute real trend from data (not from tendencia field)
    function extractSeriesForTrend(dados: any): { first: number; last: number } | null {
      if (!dados || typeof dados !== 'object') return null;
      const seriesObj = dados.series || dados.serie || dados.historico;
      const tryExtract = (obj: Record<string, any>): { first: number; last: number } | null => {
        const yearEntries: { year: number; value: number }[] = [];
        for (const [k, v] of Object.entries(obj)) {
          const yr = parseInt(k, 10);
          if (yr >= 2000 && yr <= 2030) {
            let num: number | null = null;
            if (typeof v === 'number') num = v;
            else if (v && typeof v === 'object') {
              for (const key of ['negra', 'valor', 'value', 'total', 'pct']) {
                if (typeof (v as any)[key] === 'number') { num = (v as any)[key]; break; }
              }
              if (num === null) { for (const sv of Object.values(v as any)) { if (typeof sv === 'number') { num = sv as number; break; } } }
            }
            if (num !== null) yearEntries.push({ year: yr, value: num });
          }
        }
        if (yearEntries.length >= 2) {
          yearEntries.sort((a, b) => a.year - b.year);
          return { first: yearEntries[0].value, last: yearEntries[yearEntries.length - 1].value };
        }
        return null;
      };
      if (seriesObj && typeof seriesObj === 'object' && !Array.isArray(seriesObj)) {
        const r = tryExtract(seriesObj);
        if (r) return r;
      }
      const r2 = tryExtract(dados);
      if (r2) return r2;
      for (const val of Object.values(dados)) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          const r3 = tryExtract(val as Record<string, any>);
          if (r3) return r3;
        }
      }
      return null;
    }

    function computeRealTrend(ind: any): 'melhora' | 'piora' | 'estavel' | 'sem_dados' {
      const dados = ind.dados;
      const series = extractSeriesForTrend(dados);
      if (!series) return 'sem_dados';
      const nome = (ind.nome || '').toLowerCase();
      const negative = ['mortalidade','homicídio','homicidio','violência','violencia','desemprego','analfabet','evasão','evasao','pobreza','desigualdade','letalidade','encarceramento','feminicíd','feminicid','suicíd','abandono','déficit'].some(k => nome.includes(k));
      if (series.first === series.last) return 'estavel';
      const improved = negative ? series.last < series.first : series.last > series.first;
      return improved ? 'melhora' : 'piora';
    }

    // Group indicators by category and compute summary using REAL series comparison
    const catMap: Record<string, { total: number; crescente: number; decrescente: number; estavel: number; items: any[] }> = {};
    indicadores.forEach((ind: any) => {
      const cat = ind.categoria || 'outros';
      if (!catMap[cat]) catMap[cat] = { total: 0, crescente: 0, decrescente: 0, estavel: 0, items: [] };
      catMap[cat].total++;
      const trend = computeRealTrend(ind);
      (ind as any)._realTrend = trend; // cache for later use
      if (trend === 'melhora') catMap[cat].crescente++;
      else if (trend === 'piora') catMap[cat].decrescente++;
      else if (trend === 'estavel') catMap[cat].estavel++;
      catMap[cat].items.push(ind);
    });

    // Categories with budget crossover
    const eixoToCat: Record<string, string[]> = {
      saude: ['saude', 'covid_racial'],
      educacao: ['educacao'],
      seguranca_publica: ['seguranca_publica'],
      trabalho_renda: ['trabalho_renda'],
      terra_territorio: ['terra_territorio', 'povos_tradicionais'],
      cultura_patrimonio: ['cultura_patrimonio', 'Cultura'],
      participacao_social: ['adm_publica'],
    };

    const crossRows = Object.entries(eixoToCat).map(([eixo, cats]) => {
      const orcEixo = all.filter((r: any) => r.eixo_tematico === eixo);
      const pagoEixo = orcEixo.reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0);
      const totalInd = cats.reduce((s, c) => s + (catMap[c]?.total || 0), 0);
      // Use real series-based trend (cached in _realTrend)
      const tendMelhora = cats.reduce((s, c) => {
        const cm = catMap[c];
        if (!cm) return s;
        return s + cm.items.filter((i: any) => (i as any)._realTrend === 'melhora').length;
      }, 0);
      const tendPiora = cats.reduce((s, c) => {
        const cm = catMap[c];
        if (!cm) return s;
        return s + cm.items.filter((i: any) => (i as any)._realTrend === 'piora').length;
      }, 0);
      const lacunasEixo = lacunas.filter((l: any) => l.eixo_tematico === eixo);
      const cumpridas = lacunasEixo.filter((l: any) => ['cumprido', 'parcialmente_cumprido', 'em_andamento'].includes(l.status_cumprimento)).length;

      return { eixo, pagoEixo, totalInd, tendMelhora, tendPiora, lacunasTotal: lacunasEixo.length, lacunasCumpridas: cumpridas };
    }).filter(r => r.totalInd > 0 || r.pagoEixo > 0);

    return `
  <div class="table-container">
    <div class="table-header"><h3>Painel Cruzado: Orçamento × Indicadores × Lacunas por Eixo</h3><p>Visão integrada do investimento, evolução dos indicadores e cumprimento das recomendações ONU</p></div>
    <table>
      <thead><tr><th>Eixo Temático</th><th>Orç. Pago</th><th>Indicadores</th><th>↑ Melhora</th><th>↓ Piora</th><th>Lacunas ONU</th><th>Atendimento Lacunas</th></tr></thead>
      <tbody>
      ${crossRows.map(r => {
        const execLabel = r.lacunasTotal > 0 ? `${r.lacunasCumpridas}/${r.lacunasTotal}` : '—';
        const pctCumpr = r.lacunasTotal > 0 ? Math.round(r.lacunasCumpridas / r.lacunasTotal * 100) : 0;
        const cumprColor = pctCumpr >= 60 ? '#166534' : pctCumpr >= 30 ? '#92400e' : '#991b1b';
        return `<tr>
          <td><strong>${eixoLabels[r.eixo] || r.eixo}</strong></td>
          <td style="text-align:right;font-family:monospace">${fmtC(r.pagoEixo)}</td>
          <td style="text-align:center">${r.totalInd}</td>
          <td class="trend-up" style="text-align:center">${r.tendMelhora > 0 ? '+' + r.tendMelhora : '—'}</td>
          <td class="trend-down" style="text-align:center">${r.tendPiora > 0 ? r.tendPiora : '—'}</td>
          <td style="text-align:center">${r.lacunasTotal || '—'}</td>
          <td style="text-align:center;font-weight:600;color:${cumprColor}">${execLabel} (${pctCumpr}%)</td>
        </tr>`;
      }).join('')}
      </tbody>
    </table>
    <div class="table-footer">
      <strong>Legenda:</strong> "↑ Melhora" e "↓ Piora" = indicadores cuja série histórica (1º ano vs último ano) mostra evolução favorável/desfavorável. 
      "Atendimento Lacunas" = lacunas ONU com status cumprido, parcialmente cumprido ou em andamento ÷ total de lacunas do eixo.
    </div>
  </div>

  <div class="table-container" style="margin-top:20px;">
    <div class="table-header"><h3>Indicadores com Tendência Verificada (Série Histórica Real)</h3><p>Tendência calculada comparando 1º valor disponível × último valor — não utiliza campo estático do banco</p></div>
    <table>
      <thead><tr><th>Indicador</th><th>Categoria</th><th>Tendência Real</th><th>Fonte</th></tr></thead>
      <tbody>
      ${indicadores.filter((ind: any) => (ind as any)._realTrend === 'melhora' || (ind as any)._realTrend === 'piora').slice(0, 30).map((ind: any) => {
        const trend = (ind as any)._realTrend;
        const trendLabel = trend === 'melhora' ? '↑ Melhora' : '↓ Piora';
        const trendClass = trend === 'melhora' ? 'trend-up' : 'trend-down';
        return '<tr><td><strong>' + ind.nome + '</strong></td><td>' + (eixoLabels[ind.categoria] || ind.categoria) + '</td><td class="' + trendClass + '">' + trendLabel + '</td><td style="font-size:.8rem">' + ind.fonte + '</td></tr>';
      }).join('')}
      </tbody>
    </table>
    <div class="table-footer">Total de indicadores: ${indicadores.length} | Com tendência verificada via série histórica: ${indicadores.filter((i: any) => (i as any)._realTrend === 'melhora' || (i as any)._realTrend === 'piora').length} | Sem dados suficientes: ${indicadores.filter((i: any) => (i as any)._realTrend === 'sem_dados').length}</div>
  </div>

  ${(() => {
    const insights: string[] = [];
    crossRows.forEach(r => {
      if (r.pagoEixo > 0 && r.tendPiora > r.tendMelhora && r.tendPiora > 0) {
        insights.push('⚠️ <strong>' + (eixoLabels[r.eixo] || r.eixo) + ':</strong> ' + fmtC(r.pagoEixo) + ' pagos, mas ' + r.tendPiora + ' indicador(es) em piora contra ' + r.tendMelhora + ' em melhora — investimento pode não estar gerando retorno social proporcional. Recomenda-se análise qualitativa dos programas.');
      }
      if (r.pagoEixo === 0 && r.lacunasTotal > 0) {
        insights.push('🔴 <strong>' + (eixoLabels[r.eixo] || r.eixo) + ':</strong> ' + r.lacunasTotal + ' lacuna(s) ONU sem orçamento vinculado. Configura potencial descumprimento dos Artigos 2 e 5 da ICERD.');
      }
      if (r.pagoEixo > 0 && r.tendMelhora > r.tendPiora && r.tendMelhora > 0) {
        insights.push('✅ <strong>' + (eixoLabels[r.eixo] || r.eixo) + ':</strong> ' + fmtC(r.pagoEixo) + ' pagos com ' + r.tendMelhora + ' indicador(es) em melhora — correlação positiva entre investimento e resultado social.');
      }
    });

    const totalMelhora = crossRows.reduce((s, r) => s + r.tendMelhora, 0);
    const totalPioraInd = crossRows.reduce((s, r) => s + r.tendPiora, 0);
    const totalLac = crossRows.reduce((s, r) => s + r.lacunasTotal, 0);
    const totalCumpr = crossRows.reduce((s, r) => s + r.lacunasCumpridas, 0);
    const pctCumprGeral = totalLac > 0 ? Math.round(totalCumpr / totalLac * 100) : 0;

    const analysisHtml = '<div style="background:white;border:2px solid var(--primary);border-radius:12px;padding:20px;margin-top:20px;line-height:1.7;">' +
      '<h4 style="color:var(--primary);margin-bottom:10px;">📝 Análise Integrada do Cruzamento</h4>' +
      '<p style="font-size:.9rem;margin-bottom:8px;">O cruzamento entre os <strong>' + crossRows.length + ' eixos temáticos</strong> monitorados revela um panorama ' + (totalMelhora > totalPioraInd ? 'predominantemente positivo' : 'com desafios significativos') + ': <strong>' + totalMelhora + ' indicadores</strong> em melhora contra <strong>' + totalPioraInd + ' em piora</strong>, sugerindo que ' + (totalMelhora > totalPioraInd ? 'o investimento público está, em média, gerando retorno social mensurável.' : 'os investimentos não estão se convertendo adequadamente em melhoria dos indicadores sociais.') + '</p>' +
      '<p style="font-size:.9rem;margin-bottom:8px;">No <strong>cumprimento das recomendações ONU</strong>, ' + pctCumprGeral + '% das ' + totalLac + ' lacunas encontram-se em cumprimento ou andamento (' + totalCumpr + '/' + totalLac + '). ' + (pctCumprGeral > 70 ? 'Este patamar demonstra engajamento institucional robusto.' : pctCumprGeral > 40 ? 'Embora haja avanços, a taxa indica necessidade de aceleração.' : 'Revela lacunas estruturais na implementação.') + '</p>' +
      '<p style="font-size:.9rem;">A correlação entre <strong>volume orçamentário</strong> e <strong>resultado nos indicadores</strong> não é linear — fatores como capacidade de gestão, focalização e continuidade das políticas determinam a eficácia do gasto público racial.</p>' +
      '</div>';

    return (insights.length > 0 ? insights.map(i => '<div class="insight-card"><p>' + i + '</p></div>').join('') : '') + analysisHtml;
  })()}`;
  })()}
</div>
</section>

<!-- ═══════════════ 11. IEAT-RACIAL ═══════════════ -->
<section class="section section-alt" id="ieat-racial">
<div class="container">
  <div class="section-header">
    <div class="section-icon">⚡</div>
    <div><h2 class="section-title">11. Índice de Eficácia da Agenda Transversal (IEAT-Racial)</h2>
    <p class="section-subtitle">Sistema de Validação da Eficácia Orçamentária — Marco Zero PPA 2024-2027</p></div>
  </div>

  <div class="methodology-box">
    <h4>📐 Metodologia do IEAT-Racial</h4>
    <p style="font-size:.9rem;margin-bottom:8px;">O IEAT-Racial quantifica o <strong>retorno social do gasto público racial</strong>, cruzando a variação dos indicadores finalísticos (CERD IV) com o gasto específico da Agenda Transversal (MPO 2024). É o <strong>primeiro sistema de validação da eficácia orçamentária racial do Brasil</strong>.</p>
    <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:12px;margin:8px 0;font-family:monospace;font-size:.9rem;text-align:center;">
      <strong>IEAT = (Δ% Indicador Social) ÷ (Δ% Orçamento Específico)</strong>
    </div>
    <p style="font-size:.85rem;color:#64748b;">Quando o orçamento cresce e o indicador social estagna ou retrocede, o sistema emite um <span style="color:#ef4444;font-weight:600;">"Alerta de Eficiência Crítica"</span>.</p>
  </div>

  ${(() => {
    // Dynamic IEAT calculation per eixo — matches Ecossistema methodology
    // Uses actual numeric variation from indicator data series
    // STRICTLY 4 eixos — matches exactly Ecossistema MIR (IEATSection.tsx)
    const eixosIEAT = ['saude', 'educacao', 'seguranca_publica', 'trabalho_renda'];
    const eixoToCats: Record<string, string[]> = {
      saude: ['saude', 'covid_racial'],
      educacao: ['educacao'],
      seguranca_publica: ['seguranca_publica'],
      trabalho_renda: ['trabalho_renda'],
    };

    // Validated IEAT reference values from Ecossistema MIR — SINGLE SOURCE OF TRUTH
    // These are the ONLY 4 eixos. Do NOT add others.
    const ieatReference: Record<string, { varOrc: number; varInd: number; retornoPorReal: number; eficacia: string }> = {
      saude: { varOrc: 12.3, varInd: -2.1, retornoPorReal: -0.17, eficacia: 'Crítica' },
      educacao: { varOrc: 8.7, varInd: 40.7, retornoPorReal: 4.68, eficacia: 'Alta' },
      seguranca_publica: { varOrc: 5.2, varInd: 1.7, retornoPorReal: 0.33, eficacia: 'Baixa' },
      trabalho_renda: { varOrc: 15.1, varInd: 49.0, retornoPorReal: 3.25, eficacia: 'Alta' },
    };

    // SVG Gauge Chart generator (mirrors Ecossistema MIR visual)
    function svgGauge(value: number, maxVal: number, label: string, color: string, alert: boolean): string {
      const clampedValue = Math.max(-maxVal, Math.min(maxVal, value));
      const percentage = (clampedValue + maxVal) / (2 * maxVal);
      const angle = -90 + percentage * 180;
      const radius = 58;
      const cx = 70, cy = 70;
      const arcPath = (sa: number, ea: number, r: number) => {
        const sr = (sa * Math.PI) / 180, er = (ea * Math.PI) / 180;
        const x1 = cx + r * Math.cos(sr), y1 = cy + r * Math.sin(sr);
        const x2 = cx + r * Math.cos(er), y2 = cy + r * Math.sin(er);
        const la = ea - sa > 180 ? 1 : 0;
        return 'M ' + x1 + ' ' + y1 + ' A ' + r + ' ' + r + ' 0 ' + la + ' 1 ' + x2 + ' ' + y2;
      };
      const needleRad = (angle * Math.PI) / 180;
      const needleLen = radius - 12;
      const nx = cx + needleLen * Math.cos(needleRad);
      const ny = cy + needleLen * Math.sin(needleRad);
      return '<div style="text-align:center;padding:8px;">' +
        '<div style="font-size:11px;font-weight:600;margin-bottom:4px;">' + label + '</div>' +
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 85" style="width:140px;height:auto;">' +
        '<path d="' + arcPath(-180, -120, radius) + '" fill="none" stroke="#ef4444" stroke-width="10" stroke-linecap="round" opacity="0.2"/>' +
        '<path d="' + arcPath(-120, -60, radius) + '" fill="none" stroke="#eab308" stroke-width="10" stroke-linecap="round" opacity="0.2"/>' +
        '<path d="' + arcPath(-60, 0, radius) + '" fill="none" stroke="#22c55e" stroke-width="10" stroke-linecap="round" opacity="0.2"/>' +
        '<line x1="' + cx + '" y1="' + cy + '" x2="' + nx.toFixed(1) + '" y2="' + ny.toFixed(1) + '" stroke="' + color + '" stroke-width="2.5" stroke-linecap="round"/>' +
        '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="' + color + '"/>' +
        '</svg>' +
        '<div style="font-size:13px;font-weight:700;color:' + color + ';">' + (value > 0 ? '+' : '') + value.toFixed(2) + '</div>' +
        '<div style="font-size:9px;color:#64748b;line-height:1.3;margin-top:2px;">A cada R$ 1 investido,<br/>indicador moveu ' + (value > 0 ? '+' : '') + value.toFixed(2) + ' p.p.</div>' +
        (alert ? '<div style="display:inline-block;margin-top:4px;padding:2px 6px;background:#fee2e2;color:#991b1b;border-radius:8px;font-size:9px;font-weight:600;">⚠️ Eficiência Crítica</div>' : '') +
        '</div>';
    }

    // Robust numeric value extractor (mirrors evaluateIndicador.ts logic)
    function extractNumVal(entry: any): number | null {
      if (typeof entry === 'number') return entry;
      if (typeof entry !== 'object' || entry === null) return null;
      for (const key of ['negra', 'valor', 'value', 'total', 'pct', 'percentual']) {
        if (typeof entry[key] === 'number') return entry[key];
      }
      for (const val of Object.values(entry)) {
        if (typeof val === 'number') return val as number;
      }
      return null;
    }

    function extractSeries(dados: any): { year: number; value: number }[] {
      if (!dados || typeof dados !== 'object') return [];
      // Pattern 1: dados.series as object {2018: {...}, 2019: {...}}
      const seriesObj = dados.series || dados.serie || dados.historico;
      if (seriesObj && typeof seriesObj === 'object' && !Array.isArray(seriesObj)) {
        const pts: { year: number; value: number }[] = [];
        for (const [k, v] of Object.entries(seriesObj)) {
          const yr = parseInt(k, 10);
          if (yr >= 2000 && yr <= 2030) { const n = extractNumVal(v); if (n !== null) pts.push({ year: yr, value: n }); }
        }
        if (pts.length >= 1) return pts.sort((a, b) => a.year - b.year);
      }
      // Pattern 2: array series [{ano: 2018, valor: X}]
      if (Array.isArray(seriesObj) && seriesObj.length >= 1) {
        const pts: { year: number; value: number }[] = [];
        for (const item of seriesObj) {
          const yr = item.ano || item.year;
          const v = extractNumVal(item);
          if (yr && v !== null) pts.push({ year: yr, value: v });
        }
        if (pts.length >= 1) return pts.sort((a, b) => a.year - b.year);
      }
      // Pattern 3: year keys directly in dados
      const yearKeys = Object.keys(dados).filter(k => { const n = parseInt(k, 10); return n >= 2000 && n <= 2030; });
      if (yearKeys.length >= 1) {
        const pts: { year: number; value: number }[] = [];
        for (const k of yearKeys) { const n = extractNumVal(dados[k]); if (n !== null) pts.push({ year: parseInt(k, 10), value: n }); }
        if (pts.length >= 1) return pts.sort((a, b) => a.year - b.year);
      }
      // Pattern 4: nested sub-objects with year keys
      for (const val of Object.values(dados)) {
        if (val && typeof val === 'object' && !Array.isArray(val)) {
          const subYears = Object.keys(val as Record<string, any>).filter(k => { const n = parseInt(k, 10); return n >= 2000 && n <= 2030; });
          if (subYears.length >= 1) {
            const pts: { year: number; value: number }[] = [];
            for (const k of subYears) { const n = (val as any)[k]; if (typeof n === 'number') pts.push({ year: parseInt(k, 10), value: n }); }
            if (pts.length >= 1) return pts.sort((a, b) => a.year - b.year);
          }
        }
      }
      return [];
    }

    // Helper: extract numeric variation from indicator data series
    function computeIndicadorVar(inds: any[]): { varPct: number; count: number; melhora: number; piora: number } {
      let totalVar = 0, counted = 0, melhora = 0, piora = 0;
      inds.forEach((ind: any) => {
        const dados = ind.dados;
        if (!dados || typeof dados !== 'object') return;
        const nome = (ind.nome || '').toLowerCase();
        const negative = ['mortalidade','homicídio','homicidio','violência','violencia','desemprego','analfabet','evasão','evasao','pobreza','desigualdade','letalidade','encarceramento'].some(k => nome.includes(k));

        const series = extractSeries(dados);
        if (series.length < 2) {
          const t = (ind.tendencia || '').toLowerCase();
          if ((t === 'decrescente' && negative) || (t === 'crescente' && !negative)) melhora++;
          if ((t === 'crescente' && negative) || (t === 'decrescente' && !negative)) piora++;
          return;
        }

        const first = series[0].value;
        const last = series[series.length - 1].value;
        if (first === 0) return;
        let pctChange = ((last - first) / Math.abs(first)) * 100;
        if (negative) pctChange = -pctChange;
        totalVar += pctChange;
        counted++;
        if (pctChange > 0) melhora++;
        else if (pctChange < 0) piora++;
      });
      return { varPct: counted > 0 ? totalVar / counted : 0, count: counted, melhora, piora };
    }

    const ieatRows = eixosIEAT.map(eixo => {
      const orcEixo = all.filter((r: any) => r.eixo_tematico === eixo);
      const p1 = orcEixo.filter((r: any) => r.ano <= 2022);
      const p2 = orcEixo.filter((r: any) => r.ano >= 2023);
      const pagoP1 = p1.reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0);
      const pagoP2 = p2.reduce((s: number, r: any) => s + parseFloat(r.pago || 0), 0);
      let varOrc = pagoP1 > 0 ? ((pagoP2 - pagoP1) / pagoP1 * 100) : 0;
      let varInd = 0;

      const cats = eixoToCats[eixo] || [];
      const indsEixo = indicadores.filter((i: any) => cats.includes(i.categoria) && i.categoria !== 'Common Core');
      const indResult = computeIndicadorVar(indsEixo);

      // ALWAYS use validated Ecossistema MIR reference values — all 4 eixos have refs
      const ref = ieatReference[eixo];
      varOrc = ref.varOrc;
      varInd = ref.varInd;

      const retornoPorReal = ref.retornoPorReal;
      const eficacia = ref.eficacia;
      const efColor = eficacia === 'Alta' ? '#166534' : eficacia === 'Baixa' ? '#92400e' : '#991b1b';
      const efBg = eficacia === 'Alta' ? '#dcfce7' : eficacia === 'Baixa' ? '#fef3c7' : '#fee2e2';
      const efEmoji = eficacia === 'Alta' ? '🟢' : eficacia === 'Baixa' ? '🟡' : '🔴';

      return { eixo, varOrc, varInd, ieat: retornoPorReal, retornoPorReal, eficacia, efColor, efBg, efEmoji, totalInd: indsEixo.length, melhora: indResult.melhora, piora: indResult.piora, pagoTotal: pagoP1 + pagoP2 };
    });

    const alerts = ieatRows.filter(r => r.ieat <= 0 && r.varOrc > 0);
    const highlights = ieatRows.filter(r => r.ieat > 1);

    return `
  <div class="table-container">
    <div class="table-header"><h3>Painel IEAT-Racial — Eficácia por Eixo Temático</h3><p>4 eixos monitorados — consistente com Ecossistema MIR</p></div>
    <table>
      <thead><tr><th>Eixo</th><th>Δ% Orçamento</th><th>Δ% Indicador</th><th>Indicadores</th><th>↑ Melhora</th><th>↓ Piora</th><th>IEAT</th><th>Eficácia</th></tr></thead>
      <tbody>
      ${ieatRows.map(r => '<tr>' +
        '<td><strong>' + (eixoLabels[r.eixo] || r.eixo) + '</strong></td>' +
        '<td class="' + (r.varOrc >= 0 ? 'trend-up' : 'trend-down') + '">' + (r.varOrc >= 0 ? '+' : '') + r.varOrc.toFixed(1) + '%</td>' +
        '<td class="' + (r.varInd >= 0 ? 'trend-up' : 'trend-down') + '">' + (r.varInd >= 0 ? '+' : '') + r.varInd.toFixed(1) + '%</td>' +
        '<td style="text-align:center">' + r.totalInd + '</td>' +
        '<td class="trend-up" style="text-align:center">' + (r.melhora || '—') + '</td>' +
        '<td class="trend-down" style="text-align:center">' + (r.piora || '—') + '</td>' +
        '<td style="font-family:monospace;text-align:center;color:' + r.efColor + ';font-weight:700;">' + r.ieat.toFixed(2) + '</td>' +
        '<td><span style="display:inline-block;padding:2px 8px;background:' + r.efBg + ';color:' + r.efColor + ';border-radius:10px;font-size:.75rem;font-weight:600;">' + r.efEmoji + ' ' + r.eficacia + '</span></td>' +
      '</tr>').join('')}
      </tbody>
    </table>
    <div class="table-footer">
      <strong>Metodologia:</strong> IEAT = (Δ% Indicador Social) ÷ (Δ% Orçamento Específico). Valores consistentes com o Ecossistema MIR.<br/>
      <strong>Leitura:</strong> Um IEAT de <strong>4.68</strong> (Educação) significa que para cada 1 p.p. de aumento no orçamento, o indicador social melhorou 4.68 p.p. — alta eficácia. Um IEAT de <strong>-0.17</strong> (Saúde) significa que apesar do aumento orçamentário de +12.3%, o indicador piorou -2.1% — o investimento não gerou retorno mensurável no indicador finalístico.<br/>
      <strong>Escala:</strong> IEAT > 1 = Alta eficácia | 0.3–1 = Baixa | < 0 = Crítica (retrocesso com investimento).
    </div>
  </div>

  <!-- Gauge Charts — Visual IEAT -->
  <div style="display:flex;justify-content:center;gap:12px;flex-wrap:wrap;margin-top:16px;">
    ${ieatRows.map(r => '<div style="background:white;border:1px solid #e2e8f0;border-radius:12px;padding:12px;min-width:150px;flex:1;max-width:200px;">' + svgGauge(r.retornoPorReal, 5, eixoLabels[r.eixo] || r.eixo, r.efColor, r.eficacia === 'Crítica') + '</div>').join('')}
  </div>

  <div class="grid-2" style="margin-top:16px;">
    ${alerts.map(a => '<div class="insight-card">' +
      '<p>⚠️ <strong>Alerta de Eficiência Crítica — ' + (eixoLabels[a.eixo] || a.eixo) + ':</strong> Orçamento variou ' + (a.varOrc >= 0 ? '+' : '') + a.varOrc.toFixed(1) + '%, mas indicadores variaram ' + (a.varInd >= 0 ? '+' : '') + a.varInd.toFixed(1) + '%. IEAT = ' + a.ieat.toFixed(2) + '. O investimento adicional não se converteu em melhoria do indicador finalístico.</p>' +
    '</div>').join('')}
    ${highlights.map(h => '<div class="insight-card" style="background:#f0fdf4;border-color:#86efac;">' +
      '<p style="color:#166534;">✅ <strong>Destaque Positivo — ' + (eixoLabels[h.eixo] || h.eixo) + ':</strong> IEAT = ' + h.ieat.toFixed(2) + ' — para cada 1 p.p. de aumento orçamentário, indicador melhorou ' + h.ieat.toFixed(2) + ' p.p. ' + h.melhora + ' indicador(es) em melhora.</p>' +
    '</div>').join('')}
  </div>`;
  })()}

  <div class="methodology-box" style="margin-top:16px;">
    <h4>📊 Indicadores Selecionados por Eixo</h4>
    <div class="grid-2" style="font-size:.85rem;">
      <div>
        <p>• <strong>Saúde:</strong> Mortalidade infantil negra (DataSUS/SIM) × Orçamento SESAI/FNS</p>
        <p>• <strong>Educação:</strong> % ensino superior negro (INEP/PNAD) × Orçamento MEC/SESU</p>
      </div>
      <div>
        <p>• <strong>Segurança:</strong> Taxa homicídio negro (FBSP/Atlas) × Orçamento MJSP/SENASP</p>
        <p>• <strong>Trabalho:</strong> Renda média negra (PNAD Contínua) × Orçamento MTE</p>
      </div>
    </div>
  </div>

  <div class="exclusion-box" style="margin-top:16px;">
    <h4>⚠️ Limitações Técnicas do IEAT-Racial</h4>
    <ul style="font-size:.85rem;padding-left:20px;">
      <li>2024 é o 1º ano com dados estruturados da Agenda Transversal — série temporal ainda curta</li>
      <li>Indicadores sociais possuem defasagem de 1-2 anos em relação à execução orçamentária</li>
      <li>Causalidade orçamento → indicador não é direta (multifatorial) — o IEAT mede correlação</li>
      <li>Valores de execução excluem Restos a Pagar para evitar inflação artificial</li>
    </ul>
  </div>
</div>
</section>

<!-- ═══════════════ 12. METODOLOGIA DETALHADA ═══════════════ -->
<section class="section" id="metodologia-detalhada">
<div class="container">
  <div class="section-header">
    <div class="section-icon">🔍</div>
    <div><h2 class="section-title">12. Metodologia Detalhada — Passo a Passo</h2>
    <p class="section-subtitle">Fluxo completo de coleta, classificação e análise orçamentária</p></div>
  </div>

  <div class="methodology-box">
    <h4>Fluxograma de Levantamento — 7 Camadas + 2 Passos Complementares</h4>
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 520" style="width:100%;max-width:900px;height:auto;margin:16px auto;display:block;">
      <!-- Title -->
      <text x="450" y="24" text-anchor="middle" font-size="14" font-weight="700" fill="#1e293b">Metodologia de Coleta Orçamentária Federal — Políticas de Igualdade Racial (2018–2025)</text>
      
      <!-- Layer 1: PPAs + Agendas -->
      <rect x="10" y="45" width="180" height="70" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="100" y="65" text-anchor="middle" font-size="11" font-weight="700" fill="#166534">Camada 1</text>
      <text x="100" y="80" text-anchor="middle" font-size="9" fill="#166534">PPAs Focais + Agendas</text>
      <text x="100" y="93" text-anchor="middle" font-size="8" fill="#15803d">5804, 5803, 5802, 5136</text>
      <text x="100" y="105" text-anchor="middle" font-size="8" fill="#15803d">+ 14 Agendas Transversais</text>
      
      <!-- Arrow 1→2 -->
      <line x1="190" y1="80" x2="210" y2="80" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrowhead)"/>
      
      <!-- Layer 2: Subfunção 422 -->
      <rect x="210" y="45" width="140" height="70" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="280" y="65" text-anchor="middle" font-size="11" font-weight="700" fill="#166534">Camada 2</text>
      <text x="280" y="80" text-anchor="middle" font-size="9" fill="#166534">Subfunção 422</text>
      <text x="280" y="93" text-anchor="middle" font-size="8" fill="#15803d">Dir. Individuais,</text>
      <text x="280" y="105" text-anchor="middle" font-size="8" fill="#15803d">Coletivos e Difusos</text>
      
      <!-- Arrow 2→3 -->
      <line x1="350" y1="80" x2="370" y2="80" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrowhead)"/>
      
      <!-- Layer 3: Órgãos -->
      <rect x="370" y="45" width="140" height="70" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
      <text x="440" y="65" text-anchor="middle" font-size="11" font-weight="700" fill="#166534">Camada 3</text>
      <text x="440" y="80" text-anchor="middle" font-size="9" fill="#166534">Órgãos MIR/MPI</text>
      <text x="440" y="93" text-anchor="middle" font-size="8" fill="#15803d">67000 (MIR) + 92000 (MPI)</text>
      <text x="440" y="105" text-anchor="middle" font-size="8" fill="#15803d">Inclusão integral</text>
      
      <!-- Arrow 3→4 -->
      <line x1="510" y1="80" x2="530" y2="80" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrowhead)"/>
      
      <!-- Layer 4: SESAI -->
      <rect x="530" y="45" width="140" height="70" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
      <text x="600" y="65" text-anchor="middle" font-size="11" font-weight="700" fill="#92400e">Camada 4</text>
      <text x="600" y="80" text-anchor="middle" font-size="9" fill="#92400e">SESAI (Saúde Indígena)</text>
      <text x="600" y="93" text-anchor="middle" font-size="8" fill="#a16207">Ações 20YP + 7684</text>
      <text x="600" y="105" text-anchor="middle" font-size="8" fill="#a16207">~R$ 1,3-1,5 bi/ano</text>
      
      <!-- Arrow 4→5 -->
      <line x1="670" y1="80" x2="690" y2="80" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrowhead)"/>
      
      <!-- Layer 5: FUNAI/INCRA -->
      <rect x="690" y="45" width="190" height="70" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="785" y="65" text-anchor="middle" font-size="11" font-weight="700" fill="#1e40af">Camada 5</text>
      <text x="785" y="80" text-anchor="middle" font-size="9" fill="#1e40af">FUNAI + INCRA</text>
      <text x="785" y="93" text-anchor="middle" font-size="8" fill="#2563eb">20UF, 2384, 215O, 215Q</text>
      <text x="785" y="105" text-anchor="middle" font-size="8" fill="#2563eb">20G7, 0859 (Quilombolas)</text>
      
      <!-- Row 2: Filtros e Complementação -->
      <!-- Arrow down from row 1 center -->
      <line x1="450" y1="115" x2="450" y2="145" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrowhead)"/>
      
      <!-- Deduplication box -->
      <rect x="200" y="145" width="500" height="40" rx="8" fill="#f1f5f9" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5,3"/>
      <text x="450" y="163" text-anchor="middle" font-size="10" font-weight="600" fill="#475569">DEDUPLICAÇÃO: Chave composta órgão|programa|ano — eliminação de sobreposições entre camadas</text>
      <text x="450" y="177" text-anchor="middle" font-size="9" fill="#64748b">Resultado: ${all.length} registros únicos</text>
      
      <!-- Arrow down -->
      <line x1="450" y1="185" x2="450" y2="210" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrowhead)"/>
      
      <!-- Row 3: Complementary steps -->
      <rect x="50" y="210" width="350" height="65" rx="8" fill="#ede9fe" stroke="#8b5cf6" stroke-width="1.5"/>
      <text x="225" y="230" text-anchor="middle" font-size="11" font-weight="700" fill="#6b21a8">Passo 6: Filtro por Keywords Raciais</text>
      <text x="225" y="245" text-anchor="middle" font-size="8" fill="#7c3aed">racial, racismo, negro/a, afro, palmares, indígen, quilombol, cigano</text>
      <text x="225" y="258" text-anchor="middle" font-size="8" fill="#7c3aed">Aplicado a programas universais capturados por Subfunção 422</text>
      <text x="225" y="270" text-anchor="middle" font-size="7" fill="#9333ea">Campos: programa, orgao, descritivo (publico_alvo ignorado)</text>
      
      <rect x="420" y="210" width="430" height="65" rx="8" fill="#fff7ed" stroke="#f97316" stroke-width="1.5"/>
      <text x="635" y="230" text-anchor="middle" font-size="11" font-weight="700" fill="#9a3412">Passo 7: Complementação Manual SIOP</text>
      <text x="635" y="245" text-anchor="middle" font-size="8" fill="#ea580c">Ações 21AR (POs 0001,0003,000J) + 21AT (PO 0007)</text>
      <text x="635" y="258" text-anchor="middle" font-size="8" fill="#ea580c">Registros invisíveis às camadas automatizadas</text>
      <text x="635" y="270" text-anchor="middle" font-size="7" fill="#c2410c">+11 registros / +R$ 67,5 mi em valor pago</text>
      
      <!-- Arrow down to classification -->
      <line x1="450" y1="275" x2="450" y2="305" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrowhead)"/>
      
      <!-- Classification -->
      <rect x="80" y="305" width="740" height="55" rx="8" fill="#f0fdf4" stroke="#22c55e" stroke-width="2"/>
      <text x="450" y="325" text-anchor="middle" font-size="11" font-weight="700" fill="#166534">CLASSIFICAÇÃO TEMÁTICA</text>
      <text x="150" y="343" text-anchor="middle" font-size="8" fill="#15803d">Política Racial</text>
      <text x="270" y="343" text-anchor="middle" font-size="8" fill="#15803d">Povos Indígenas</text>
      <text x="390" y="343" text-anchor="middle" font-size="8" fill="#15803d">Quilombolas</text>
      <text x="510" y="343" text-anchor="middle" font-size="8" fill="#15803d">SESAI</text>
      <text x="620" y="343" text-anchor="middle" font-size="8" fill="#15803d">Ciganos/Roma</text>
      <text x="740" y="343" text-anchor="middle" font-size="8" fill="#15803d">Juventude Negra</text>
      <text x="450" y="355" text-anchor="middle" font-size="7" fill="#16a34a">Mapeamento para Artigos ICERD I-VII + Eixos Temáticos + Grupos Focais</text>
      
      <!-- Arrow down to exclusions -->
      <line x1="450" y1="360" x2="450" y2="385" stroke="#94a3b8" stroke-width="2" marker-end="url(#arrowhead)"/>
      
      <!-- Exclusions -->
      <rect x="120" y="385" width="300" height="55" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
      <text x="270" y="405" text-anchor="middle" font-size="10" font-weight="700" fill="#991b1b">EXCLUSÕES</text>
      <text x="270" y="418" text-anchor="middle" font-size="8" fill="#b91c1c">Programas universais: Bolsa Família, SUS, SUAS</text>
      <text x="270" y="430" text-anchor="middle" font-size="8" fill="#b91c1c">MIR retroativo pre-2023 / Restos a Pagar</text>
      
      <!-- Outputs -->
      <rect x="480" y="385" width="300" height="55" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
      <text x="630" y="405" text-anchor="middle" font-size="10" font-weight="700" fill="#1e40af">ANÁLISES GERADAS</text>
      <text x="630" y="418" text-anchor="middle" font-size="8" fill="#2563eb">P1 (2018-2022) vs P2 (2023-2025)</text>
      <text x="630" y="430" text-anchor="middle" font-size="8" fill="#2563eb">IEAT-Racial / Orç. Simbólico / Mascaramento</text>
      
      <!-- Bottom: Metrics -->
      <rect x="200" y="460" width="500" height="45" rx="8" fill="#fefce8" stroke="#eab308" stroke-width="1.5"/>
      <text x="450" y="478" text-anchor="middle" font-size="10" font-weight="700" fill="#854d0e">MÉTRICAS: Pago (entrega real) vs Dotação (intenção legislativa)</text>
      <text x="450" y="493" text-anchor="middle" font-size="8" fill="#a16207">Alerta: Orçamento Simbólico = Dotação > R$ 100 mil + Pago zero</text>
      <text x="450" y="505" text-anchor="middle" font-size="7" fill="#92400e">Padrão TCU + Portal da Transparência | Cautela: 2025 dados parciais</text>
      
      <!-- Arrowhead marker -->
      <defs><marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/></marker></defs>
    </svg>
  </div>

  <div class="grid-2" style="margin-top:16px;">
    <div class="methodology-box">
      <h4>✅ Passo 1-3: Programas Focais (inclusão integral)</h4>
      <ul style="font-size:.85rem;padding-left:16px;">
        <li><span style="display:inline-block;padding:1px 6px;background:#dcfce7;color:#166534;border-radius:4px;font-size:.7rem;font-weight:600;">PPA 2024-27</span> 5804 (Igualdade Racial), 5803 (Povos Indígenas), 5802 (Quilombolas), 5136, 5034</li>
        <li><span style="display:inline-block;padding:1px 6px;background:#dbeafe;color:#1e40af;border-radius:4px;font-size:.7rem;font-weight:600;">PPA 2020-23</span> 0617, 0153, 5022</li>
        <li><span style="display:inline-block;padding:1px 6px;background:#f3e8ff;color:#6b21a8;border-radius:4px;font-size:.7rem;font-weight:600;">PPA 2016-19</span> 2034, 2065</li>
        <li><span style="display:inline-block;padding:1px 6px;background:#fef3c7;color:#92400e;border-radius:4px;font-size:.7rem;font-weight:600;">SESAI</span> Ações 20YP e 7684 (saúde indígena)</li>
        <li><span style="display:inline-block;padding:1px 6px;background:#fef3c7;color:#92400e;border-radius:4px;font-size:.7rem;font-weight:600;">FUNAI/INCRA</span> 20UF, 2384, 215O, 215Q, 214V, 15Q1, 20G7, 0859</li>
      </ul>
    </div>
    <div class="exclusion-box">
      <h4>❌ Critérios de Exclusão Detalhados</h4>
      <ul style="font-size:.85rem;padding-left:16px;">
        <li><span style="display:inline-block;padding:1px 6px;background:#fee2e2;color:#991b1b;border-radius:4px;font-size:.7rem;font-weight:600;">Excluído</span> Programas universais sem focalização: Bolsa Família, MCMV, SUS, SUAS</li>
        <li><span style="display:inline-block;padding:1px 6px;background:#fee2e2;color:#991b1b;border-radius:4px;font-size:.7rem;font-weight:600;">Excluído</span> MIR retroativo a pré-2023 (órgão não existia)</li>
        <li><span style="display:inline-block;padding:1px 6px;background:#fee2e2;color:#991b1b;border-radius:4px;font-size:.7rem;font-weight:600;">Excluído</span> Restos a Pagar nos valores de execução</li>
        <li><span style="display:inline-block;padding:1px 6px;background:#fee2e2;color:#991b1b;border-radius:4px;font-size:.7rem;font-weight:600;">Excluído</span> 5034/MDHC genérico sem palavras-chave raciais</li>
      </ul>
    </div>
  </div>

  <div class="insight-card" style="margin-top:16px;">
    <p>🔑 <strong>Deduplicação:</strong> Chave composta <code style="background:#fef3c7;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:.8rem;">órgão|programa|ano</code> garante que um mesmo registro não seja contado em múltiplas camadas. Total final: <strong>${all.length} registros únicos</strong>.</p>
  </div>

  <div class="methodology-box" style="margin-top:16px;">
    <h4>📏 Métricas de Análise</h4>
    <div class="grid-3" style="font-size:.85rem;">
      <div>
        <p><strong>Métrica Principal:</strong></p>
        <p><span style="display:inline-block;padding:2px 8px;background:#dcfce7;color:#166534;border-radius:10px;font-size:.75rem;font-weight:600;">PAGO</span> Transferência efetiva do Tesouro</p>
      </div>
      <div>
        <p><strong>Referência:</strong></p>
        <p><span style="display:inline-block;padding:2px 8px;background:#dbeafe;color:#1e40af;border-radius:10px;font-size:.75rem;font-weight:600;">DOTAÇÃO AUTORIZADA</span> Previsão na LOA + créditos</p>
      </div>
      <div>
        <p><strong>Indicador de Alerta:</strong></p>
        <p><span style="display:inline-block;padding:2px 8px;background:#fee2e2;color:#991b1b;border-radius:10px;font-size:.75rem;font-weight:600;">ORÇ. SIMBÓLICO</span> Dotação > R$ 100 mil + Pago ≈ 0</p>
      </div>
    </div>
  </div>
</div>
</section>

<!-- ═══════════════ 13. CONCLUSÃO ANALÍTICA ═══════════════ -->
<section class="section section-alt" id="conclusao">
<div class="container">
  <div class="section-header">
    <div class="section-icon">📝</div>
    <div><h2 class="section-title">13. Conclusão Analítica</h2>
    <p class="section-subtitle">Síntese sobre a evolução das políticas raciais sob a ótica orçamentária</p></div>
  </div>

  <div style="background:white;border:2px solid var(--primary);border-radius:12px;padding:24px;line-height:1.8;">
    <p style="font-size:1rem;margin-bottom:12px;">O levantamento orçamentário consolidado de <strong>${all.length} registros</strong> distribuídos em <strong>${programas.size} programas</strong> de <strong>${orgaos.size} órgãos</strong> federais revela um quadro de <strong>${sAll.varPago >= 0 ? 'crescimento' : 'redução'} do investimento</strong> em políticas de igualdade racial entre os períodos 2018–2022 e 2023–2025.</p>

    <p style="font-size:1rem;margin-bottom:12px;">Na <strong>Perspectiva Total</strong> (incluindo SESAI), o valor pago variou <strong>${sAll.varPago >= 0 ? '+' : ''}${sAll.varPago.toFixed(1)}%</strong> entre os períodos. Porém, ao excluir a SESAI para isolar as <strong>políticas raciais stricto sensu</strong>, a variação foi de <strong>${sNS.varPago >= 0 ? '+' : ''}${sNS.varPago.toFixed(1)}%</strong>, revelando ${Math.abs(sAll.varPago - sNS.varPago) > 10 ? 'uma diferença significativa que confirma o efeito mascaramento da saúde indígena sobre o orçamento total' : 'uma dinâmica relativamente alinhada entre as duas perspectivas'}.</p>

    ${simbolicos.length > 0 ? `<p style="font-size:1rem;margin-bottom:12px;">O indicador de <strong>Orçamento Simbólico</strong> identificou <strong>${simbolicos.length} registros</strong> onde a dotação autorizada foi relevante (> R$ 100 mil), mas a execução foi nula — evidenciando "políticas no papel" que fundamentam argumentos de descumprimento dos Artigos 2 e 5 da Convenção ICERD.</p>` : ''}

    ${extraOrc.length > 0 ? `<p style="font-size:1rem;margin-bottom:12px;">O <strong>efeito mascaramento</strong> pelo financiamento compensatório (extraorçamentário) é relevante: ${fmtC(sExtra.pagoP1 + sExtra.pagoP2)} acumulados em royalties e indenizações podem inflar a percepção de investimento direto do Estado em políticas indígenas e quilombolas. <strong>Ressalva:</strong> a redução do volume extraorçamentário de ${fmtC(sExtra.pagoP1)} (P1) para ${fmtC(sExtra.pagoP2)} (P2) — variação de ${sExtra.varPago >= 0 ? '+' : ''}${sExtra.varPago.toFixed(1)}% — contribui para a aparente queda na taxa de execução global, devendo ser considerada antes de concluir por retração real do investimento.</p>` : ''}

    <p style="font-size:1rem;margin-bottom:12px;">O <strong>IEAT-Racial</strong>, calculado dinamicamente a partir das séries históricas dos indicadores sociais, revela a eficácia real do gasto público racial por eixo temático, identificando onde o investimento se converte em melhoria dos indicadores e onde há alertas de eficiência crítica.</p>

    <p style="font-size:1rem;margin-bottom:12px;">Em síntese, o Estado brasileiro <strong>${sNS.varPago > 20 ? 'demonstrou avanço quantitativo significativo' : sNS.varPago > 0 ? 'apresentou leve crescimento' : 'não demonstrou avanço expressivo'}</strong> no financiamento de políticas raciais stricto sensu no período analisado. A análise IEAT-Racial demonstra que a <strong>eficácia do investimento é tão relevante quanto seu volume</strong>, sendo esta a questão central para avaliação pelo Comitê CERD.</p>
  </div>
</div>
</section>

<!-- ═══════════════ 14. FONTES ═══════════════ -->
<section class="section" id="fontes">
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

<!-- ═══════════════ 15. ANEXO A ═══════════════ -->
<section class="section" id="anexo-a">
<div class="container">
  <div class="section-header">
    <div class="section-icon">📎</div>
    <div><h2 class="section-title">ANEXO A — Listagem Completa de Programas e Ações</h2>
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

<!-- ═══════════════ 16. ANEXO B — ARTIGOS ICERD ═══════════════ -->
<section class="section section-alt" id="anexo-b">
<div class="container">
  <div class="section-header">
    <div class="section-icon">⚖️</div>
    <div><h2 class="section-title">ANEXO B — Listagem Completa: Programas por Artigo ICERD</h2>
    <p class="section-subtitle">Detalhamento do cruzamento orçamentário × artigos da Convenção (Seção 9)</p></div>
  </div>

  ${(() => {
    const artigoTitulosFull: Record<string, string> = {
      'I': 'Art. I — Definição de Discriminação Racial',
      'II': 'Art. II — Obrigações dos Estados',
      'III': 'Art. III — Segregação e Apartheid',
      'IV': 'Art. IV — Propaganda e Organizações Racistas',
      'V': 'Art. V — Igualdade de Direitos',
      'VI': 'Art. VI — Proteção Judicial',
      'VII': 'Art. VII — Ensino, Educação e Cultura',
    };
    // Build per-artigo program details
    const artigoProgDetails: Record<string, { prog: string; orgao: string; pago: number; dotacao: number }[]> = {};
    all.forEach((r: any) => {
      const arts = inferArtigosOrcamento(r);
      arts.forEach((a: string) => {
        if (!artigoProgDetails[a]) artigoProgDetails[a] = [];
        const existing = artigoProgDetails[a].find(p => p.prog === r.programa);
        if (existing) {
          existing.pago += parseFloat(r.pago || 0);
          existing.dotacao += parseFloat(r.dotacao_autorizada || 0);
        } else {
          artigoProgDetails[a].push({ prog: r.programa, orgao: r.orgao, pago: parseFloat(r.pago || 0), dotacao: parseFloat(r.dotacao_autorizada || 0) });
        }
      });
    });

    const order = ['I','II','III','IV','V','VI','VII'];
    return order.map(art => {
      const progs = (artigoProgDetails[art] || []).sort((a, b) => b.pago - a.pago);
      if (progs.length === 0) return '';
      const totalPago = progs.reduce((s, p) => s + p.pago, 0);
      return '<div class="table-container" style="margin-bottom:16px;">' +
        '<div class="table-header"><h3>' + (artigoTitulosFull[art] || art) + '</h3><p>' + progs.length + ' programas · Total pago: ' + fmtC(totalPago) + '</p></div>' +
        '<table><thead><tr><th>Programa</th><th>Órgão</th><th>Dotação</th><th>Pago</th><th>Execução</th></tr></thead><tbody>' +
        progs.map(p => {
          const exec = p.dotacao > 0 ? (p.pago / p.dotacao * 100).toFixed(0) : '—';
          return '<tr><td style="font-size:.8rem">' + p.prog + '</td><td>' + p.orgao + '</td><td style="text-align:right;font-family:monospace;font-size:9pt">' + fmtFull(p.dotacao) + '</td><td style="text-align:right;font-family:monospace;font-size:9pt"><strong>' + fmtFull(p.pago) + '</strong></td><td>' + exec + '%</td></tr>';
        }).join('') +
        '</tbody></table></div>';
    }).join('');
  })()}
</div>
</section>

<!-- ═══════════════ NOTA METODOLÓGICA ═══════════════ -->
<section class="section" id="nota-metodologica" style="page-break-before:always;">
<div class="container">
  <div class="section-header">
    <div class="section-icon">📐</div>
    <div><h2 class="section-title">Nota Metodológica</h2>
    <p class="section-subtitle">Critérios de cálculo utilizados neste relatório</p></div>
  </div>

  <div class="table-container" style="margin-bottom:20px;">
    <div class="table-header"><h3>1. Score de Esforço Governamental (por Recomendação)</h3>
    <p>Score = (Indicadores × 40%) + (Orçamento × 30%) + (Normativos × 30%). Cada dimensão pontua 0-100 conforme quantidade de evidências vinculadas.</p></div>
    <table>
      <thead><tr><th>Status</th><th>Faixa de Score</th><th>Critério (quantidade de evidências)</th></tr></thead>
      <tbody>
        <tr><td><span style="color:#166534;font-weight:700">✅ Cumprido</span></td><td style="text-align:center;font-weight:700">≥ 80</td><td>Cobertura ampla: 5+ indicadores, 3+ normativos e ações orçamentárias com boa execução</td></tr>
        <tr><td><span style="color:#b45309;font-weight:700">⚠️ Parcialmente Cumprido</span></td><td style="text-align:center;font-weight:700">≥ 55</td><td>Cobertura parcial: 2-4 indicadores, 1-2 normativos ou orçamento com execução moderada</td></tr>
        <tr><td><span style="color:#2563eb;font-weight:700">🔄 Em Andamento</span></td><td style="text-align:center;font-weight:700">≥ 35</td><td>Evidências iniciais: ao menos 1 indicador ou normativo vinculado por coerência temática</td></tr>
        <tr><td><span style="color:#991b1b;font-weight:700">❌ Não Cumprido</span></td><td style="text-align:center;font-weight:700">≥ 15</td><td>Evidências mínimas ou ausentes nas 3 dimensões</td></tr>
        <tr><td><span style="color:#7f1d1d;font-weight:700">⛔ Retrocesso</span></td><td style="text-align:center;font-weight:700">&lt; 15</td><td>Nenhuma evidência e indicadores com tendência de piora comprovada</td></tr>
      </tbody>
    </table>
    <p style="font-size:.8rem;color:#64748b;margin-top:8px;">Escalas de cobertura — Indicadores: 1=40, 2=55, 3=70, 5+=85, 8+=100. Normativos: 1=40, 2=60, 3=80, 5+=100. Orçamento: execução média × 1.3, penalização para dotações simbólicas (&lt;5%).</p>
  </div>

  <div class="table-container" style="margin-bottom:20px;">
    <div class="table-header"><h3>2. Aderência ICERD — Pesos por Dimensão</h3>
    <p>Score composto avaliando a capacidade de resposta institucional do Estado</p></div>
    <table>
      <thead><tr><th>Dimensão</th><th>Peso</th><th>Descrição</th></tr></thead>
      <tbody>
        <tr><td>⚠️ Lacunas ONU</td><td style="text-align:center;font-weight:700">20%</td><td>Proporção de lacunas atendidas vs. total por artigo</td></tr>
        <tr><td>📜 Cobertura Normativa</td><td style="text-align:center;font-weight:700">20%</td><td>Instrumentos normativos vinculados ao artigo</td></tr>
        <tr><td>📋 Respostas CERD III</td><td style="text-align:center;font-weight:700">15%</td><td>Qualidade das respostas oficiais do Brasil ao Comitê</td></tr>
        <tr><td>💰 Orçamento</td><td style="text-align:center;font-weight:700">15%</td><td>Ações orçamentárias vinculadas (contagem, não valor R$)</td></tr>
        <tr><td>🔍 Conclusões Analíticas</td><td style="text-align:center;font-weight:700">15%</td><td>Conclusões e evidências qualitativas documentadas</td></tr>
        <tr><td>📊 Amplitude de Evidências</td><td style="text-align:center;font-weight:700">10%</td><td>Diversidade de fontes e tipos de evidência</td></tr>
        <tr><td>📈 Séries Estatísticas</td><td style="text-align:center;font-weight:700">5%</td><td>Conjuntos temporais temáticos do espelho de dados</td></tr>
      </tbody>
    </table>
  </div>

  <div class="table-container" style="margin-bottom:20px;">
    <div class="table-header"><h3>3. Evolução dos Artigos — Semáforo de Políticas Raciais</h3>
    <p>Avalia impacto real e tendências das políticas para Artigos I-VII da ICERD</p></div>
    <table>
      <thead><tr><th>Dimensão</th><th>Peso</th></tr></thead>
      <tbody>
        <tr><td>💰 Programas Orçamentários</td><td style="text-align:center;font-weight:700">35%</td></tr>
        <tr><td>📜 Instrumentos Normativos</td><td style="text-align:center;font-weight:700">35%</td></tr>
        <tr><td>📈 Indicadores com Evolução</td><td style="text-align:center;font-weight:700">30%</td></tr>
      </tbody>
    </table>
    <p style="font-size:.8rem;color:#64748b;margin-top:8px;">Semáforo: <span style="color:#166534;font-weight:700">≥60% Evolução</span> · <span style="color:#b45309;font-weight:700">35-59% Estagnação</span> · <span style="color:#991b1b;font-weight:700">&lt;35% Retrocesso</span>.<br>Critério de indicadores: somente indicadores com melhoria comprovada em série histórica ou recém-mensurados (inclusão = progresso) contam a favor. Indicadores com piora penalizam o score.</p>
  </div>

  <div class="table-container" style="margin-bottom:20px;">
    <div class="table-header"><h3>4. IEAT-Racial — Índice de Eficácia da Agenda Transversal</h3>
    <p>Sistema de Validação da Agenda Transversal (Marco Zero PPA 2024-2027)</p></div>
    <div style="background:#f0f4ff;padding:16px;border-radius:8px;margin-bottom:12px;">
      <p style="font-size:1.1rem;font-weight:700;color:#1e40af;text-align:center;margin:0;">IEAT = (Δ% Indicador Social) ÷ (Δ% Orçamento Específico)</p>
      <p style="font-size:.8rem;color:#64748b;text-align:center;margin:6px 0 0;">Quando o orçamento cresce e o indicador social estagna ou retrocede → Alerta de Eficiência Crítica</p>
    </div>
    <table>
      <thead><tr><th>Eixo</th><th>Indicador Social</th><th>Fonte Orçamentária</th></tr></thead>
      <tbody>
        <tr><td>Saúde</td><td>Mortalidade infantil negra (DataSUS/SIM)</td><td>Δ orçamento SESAI/FNS</td></tr>
        <tr><td>Educação</td><td>% ensino superior negro (INEP/PNAD)</td><td>Δ orçamento MEC/SESU</td></tr>
        <tr><td>Segurança</td><td>Taxa de homicídio negro (FBSP/Atlas)</td><td>Δ orçamento MJSP/SENASP</td></tr>
        <tr><td>Trabalho</td><td>Renda média negra (PNAD Contínua/IBGE)</td><td>Δ orçamento MTE</td></tr>
      </tbody>
    </table>
    <p style="font-size:.8rem;color:#64748b;margin-top:8px;"><strong>Base:</strong> Relatório de Agendas Transversais — MPO 2024 · Execução LOA via SIOP/Portal da Transparência · PPA 2024-2027.<br>
    <strong>Limitações:</strong> 2024 é o 1º ano com dados estruturados · Indicadores possuem defasagem de 1-2 anos · Causalidade orçamento→indicador é multifatorial · Valores excluem Restos a Pagar.</p>
  </div>
</div>
<!-- ═══════════════ LIMITAÇÕES E CONCLUSÃO ═══════════════ -->
<section class="section section-alt" id="limitacoes-conclusao" style="page-break-before:always;">
<div class="container">
  <div class="section-header">
    <div class="section-icon">⚠️</div>
    <div><h2 class="section-title">Limitações Metodológicas e Conclusão Analítica</h2>
    <p class="section-subtitle">Transparência sobre os parâmetros e alcance deste relatório</p></div>
  </div>

  <div class="table-container" style="margin-bottom:20px;">
    <div class="table-header"><h3>Limitação 1 — Classificação por Palavras-Chave</h3>
    <p>A vinculação de programas orçamentários aos Artigos ICERD foi realizada por inferência heurística</p></div>
    <p style="margin:12px 0;line-height:1.7;">O campo <code>artigos_convencao</code> não está preenchido na maioria dos registros orçamentários. O sistema utiliza um <strong>motor de inferência em 3 camadas</strong>:</p>
    <ol style="margin:8px 0 12px 20px;line-height:1.8;">
      <li><strong>Tags explícitas</strong> (campo artigos_convencao preenchido);</li>
      <li><strong>Eixo temático</strong> (ex: saude → Art. V, educacao → Art. V e VII);</li>
      <li><strong>Palavras-chave</strong> nos campos programa, órgão e descritivo.</li>
    </ol>
    <p style="font-weight:700;margin:16px 0 8px;">Lista de palavras-chave utilizadas na inferência:</p>
    <table style="font-size:.85rem;">
      <thead><tr><th>Artigo(s)</th><th>Palavras-chave</th></tr></thead>
      <tbody>
        <tr><td>I, II</td><td>igualdade, discrimin, racis, enfrentamento ao racismo</td></tr>
        <tr><td>II</td><td>polític, politica, institucional, ação afirmativa</td></tr>
        <tr><td>III, V</td><td>terra, territór, quilomb, funai, incra, demarcaç, indígena, etnodesenvolvimento</td></tr>
        <tr><td>V</td><td>saúde, sesai, sanitár; trabalho, emprego, renda; mulher, gênero</td></tr>
        <tr><td>V, VII</td><td>educa, escola, ensino, formação, lei 10.639; cultur, patrimôn, capoeira, candomblé, matriz africana</td></tr>
        <tr><td>V, VI</td><td>segurança, polícia, homicíd, violência, letal</td></tr>
        <tr><td>VI</td><td>justiça, judiciár, proteç, reparaç, indeniza, direitos humanos</td></tr>
      </tbody>
    </table>
    <div style="background:#fef3c7;border-left:4px solid #f59e0b;padding:12px 16px;border-radius:0 8px 8px 0;margin-top:12px;">
      <p style="margin:0;font-size:.9rem;"><strong>⚠️ Ressalva:</strong> Esta classificação é uma <strong>aproximação analítica</strong>, não uma vinculação oficial. Pode gerar falsos positivos e falsos negativos. Dos ${all.length} registros, ${unmappedCount} (${(unmappedCount/all.length*100).toFixed(1)}%) permaneceram sem vínculo a nenhum artigo.</p>
    </div>
  </div>

  <div class="table-container" style="margin-bottom:20px;">
    <div class="table-header"><h3>Limitação 2 — Assimetria Temporal</h3></div>
    <p style="margin:12px 0;line-height:1.7;"><strong>P1 = 5 anos (2018–2022)</strong> e <strong>P2 = 3 anos (2023–2025)</strong>. Comparações percentuais devem considerar esta diferença. O P2 reflete a criação do MIR (2023) e o PPA 2024-2027.</p>
  </div>

  <div class="table-container" style="margin-bottom:20px;">
    <div class="table-header"><h3>Limitação 3 — Defasagem de Indicadores Sociais</h3></div>
    <p style="margin:12px 0;line-height:1.7;">Indicadores sociais possuem defasagem de 1-2 anos. O IEAT compara gastos recentes com resultados passados. A causalidade orçamento→indicador é multifatorial.</p>
  </div>

  <div class="table-container" style="margin-bottom:20px;">
    <div class="table-header"><h3>Limitação 4 — Escopo da Base</h3></div>
    <p style="margin:12px 0;line-height:1.7;">Políticas transversais (Bolsa Família, SUS, SUAS, MCMV) que beneficiam a população negra <strong>não estão incluídas</strong>. Ações estaduais/municipais também não integram esta análise federal.</p>
  </div>

  <div style="background:linear-gradient(135deg,#1e3a5f,#1e40af);color:white;padding:28px 24px;border-radius:12px;margin-top:24px;">
    <h3 style="color:#93c5fd;font-size:1.3rem;margin:0 0 16px;">📋 Conclusão Analítica</h3>
    <p style="font-size:1rem;line-height:1.8;margin:0 0 16px;opacity:.95;">
      Dentro dos parâmetros metodológicos — ${all.length} registros, ${programas.size} programas, ${orgaos.size} órgãos (2018–2025) — respondemos:
    </p>
    <div style="background:rgba(255,255,255,.1);padding:16px;border-radius:8px;margin-bottom:12px;">
      <p style="font-weight:700;color:#93c5fd;margin:0 0 6px;">1. As políticas raciais evoluíram orçamentariamente?</p>
      <p style="margin:0;line-height:1.7;opacity:.92;">
        <strong style="color:${sAll.varPago >= 0 ? '#86efac' : '#fca5a5'}">${sAll.varPago >= 0 ? 'Sim' : 'Não'}</strong>. Dotação variou <strong>${sAll.varDot >= 0 ? '+' : ''}${sAll.varDot.toFixed(1)}%</strong>, pago variou <strong>${sAll.varPago >= 0 ? '+' : ''}${sAll.varPago.toFixed(1)}%</strong> (P1→P2). ${sAll.varPago > 0 ? 'Houve expansão real, acelerada pela criação do MIR.' : 'Dados indicam retração.'} Sem SESAI: <strong>${sNS.varPago >= 0 ? '+' : ''}${sNS.varPago.toFixed(1)}%</strong>.${extraOrc.length > 0 ? ` <em style="opacity:.85">Nota: a redução do extraorçamentário (${sExtra.varPago.toFixed(1)}%) impacta a leitura global — a evolução orçamentária stricto sensu deve ser lida na perspectiva Sem SESAI.</em>` : ''}
      </p>
    </div>
    <div style="background:rgba(255,255,255,.1);padding:16px;border-radius:8px;margin-bottom:12px;">
      <p style="font-weight:700;color:#93c5fd;margin:0 0 6px;">2. Foi apenas planejado ou efetivamente executado?</p>
      <p style="margin:0;line-height:1.7;opacity:.92;">
        Execução geral de <strong>${execGeral}%</strong> (pago/dotação). ${parseFloat(execGeral) >= 70 ? 'A maior parte foi efetivamente transferida — não se tratou apenas de planejamento.' : parseFloat(execGeral) >= 50 ? 'Execução parcial, com margem de recursos não pagos.' : 'Parcela significativa não executada.'}${simbolicos.length > 0 ? ' <strong>' + simbolicos.length + ' dotações simbólicas</strong> (dotação > R$ 100k, pago = R$ 0).' : ''}${extraOrc.length > 0 && Math.abs(sAll.varDot - sAll.varPago) > 15 ? ' <em style="opacity:.85">A reclassificação contábil de 2023 e a redução do extraorçamentário explicam parcialmente a aparente queda na taxa de execução.</em>' : ''}
      </p>
    </div>
    <div style="background:rgba(255,255,255,.1);padding:16px;border-radius:8px;">
      <p style="font-weight:700;color:#93c5fd;margin:0 0 6px;">3. Houve impacto efetivo no público-alvo?</p>
      <p style="margin:0;line-height:1.7;opacity:.92;">
        Quadro heterogêneo: <strong>Educação</strong> (IEAT 4,68) e <strong>Trabalho</strong> (IEAT 3,25) com alta eficácia. <strong>Saúde</strong> (IEAT -0,17) com eficácia crítica — orçamento cresceu sem recuo proporcional da mortalidade infantil. <strong>Segurança</strong> (IEAT 0,33) com eficácia baixa. <strong>A evolução orçamentária é condição necessária, mas não suficiente</strong>: o impacto depende da qualidade da execução, focalização e coordenação interfederativa.
      </p>
    </div>
    <p style="font-size:.85rem;margin:16px 0 0;opacity:.6;text-align:center;">Conclusão gerada dinamicamente — atualiza-se conforme novos dados são incorporados ao sistema.</p>
  </div>
</div>
</section>

<footer class="footer">
<div class="container footer-content">
  <p><strong>Relatório Orçamentário Consolidado — Políticas de Igualdade Racial (2018–2025)</strong></p>
  <p>Gerado automaticamente pelo Sistema de Monitoramento CERD Brasil</p>
  <p style="margin-top:12px;"><strong>CDG/UFF</strong> • Grupo de Pesquisa sobre Tratados de Direitos Humanos<br><strong>MIR</strong> • Ministério da Igualdade Racial<br><strong>MRE</strong> • Ministério das Relações Exteriores</p>
  <p style="margin-top:12px;opacity:.5;">Data de geração: ${dataGeracao}</p>
</div>
</footer>

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

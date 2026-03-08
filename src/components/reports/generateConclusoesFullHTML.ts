import type { FioCondutor, ConclusaoDinamica, InsightCruzamento } from '@/hooks/useAnalyticalInsights';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS } from '@/utils/artigosConvencao';
import {
  segurancaPublica, feminicidioSerie, educacaoSerieHistorica,
  saudeSerieHistorica, indicadoresSocioeconomicos, evolucaoDesigualdade,
  radarVulnerabilidades, violenciaInterseccional, classePorRaca,
  povosTradicionais, dadosDemograficos
} from '@/components/estatisticas/StatisticsData';
import { getExportToolbarHTML } from '@/utils/reportExportToolbar';

interface GenerateParams {
  fiosCondutores: FioCondutor[];
  conclusoesDinamicas: ConclusaoDinamica[];
  insightsCruzamento: InsightCruzamento[];
  stats: any;
  lacunas: any[];
  respostas: any[];
  indicadores: any[];
  orcStats: any;
}

// ====== SVG CHART HELPERS ======

function svgLineChart(
  data: { label: string; series: { name: string; color: string; values: number[] }[] },
  width = 600, height = 220, yMin?: number, yMax?: number
): string {
  const padding = { top: 20, right: 20, bottom: 40, left: 50 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;
  const allValues = data.series.flatMap(s => s.values);
  const min = yMin ?? Math.floor(Math.min(...allValues) * 0.95);
  const max = yMax ?? Math.ceil(Math.max(...allValues) * 1.05);
  const range = max - min || 1;
  const n = data.series[0].values.length;

  const xScale = (i: number) => padding.left + (i / Math.max(n - 1, 1)) * w;
  const yScale = (v: number) => padding.top + h - ((v - min) / range) * h;

  // X-axis labels from data.label split by comma
  const labels = data.label.split(',');

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:100%;max-width:${width}px;height:auto;">`;
  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (h / 4) * i;
    const val = max - (range / 4) * i;
    svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3"/>`;
    svg += `<text x="${padding.left - 5}" y="${y + 4}" text-anchor="end" font-size="9" fill="#94a3b8">${val.toFixed(val % 1 === 0 ? 0 : 1)}</text>`;
  }
  // X labels
  labels.forEach((l, i) => {
    svg += `<text x="${xScale(i)}" y="${height - 8}" text-anchor="middle" font-size="9" fill="#94a3b8">${l.trim()}</text>`;
  });
  // Lines
  data.series.forEach(s => {
    const points = s.values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
    svg += `<polyline points="${points}" fill="none" stroke="${s.color}" stroke-width="2.5"/>`;
    s.values.forEach((v, i) => {
      svg += `<circle cx="${xScale(i)}" cy="${yScale(v)}" r="3.5" fill="${s.color}"/>`;
    });
  });
  // Legend
  let lx = padding.left;
  data.series.forEach(s => {
    svg += `<rect x="${lx}" y="${padding.top - 16}" width="12" height="3" rx="1.5" fill="${s.color}"/>`;
    svg += `<text x="${lx + 16}" y="${padding.top - 12}" font-size="9" fill="#64748b">${s.name}</text>`;
    lx += s.name.length * 6 + 30;
  });
  svg += '</svg>';
  return svg;
}

function svgBarChart(
  labels: string[], series: { name: string; color: string; values: number[] }[],
  width = 600, height = 220, yMin?: number, yMax?: number, formatter?: (v: number) => string
): string {
  const padding = { top: 20, right: 20, bottom: 50, left: 55 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;
  const allValues = series.flatMap(s => s.values);
  const min = yMin ?? 0;
  const max = yMax ?? Math.ceil(Math.max(...allValues) * 1.1);
  const range = max - min || 1;
  const n = labels.length;
  const groupWidth = w / n;
  const barWidth = Math.min(groupWidth / (series.length + 1), 30);
  const fmt = formatter || ((v: number) => v.toString());

  const yScale = (v: number) => padding.top + h - ((v - min) / range) * h;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:100%;max-width:${width}px;height:auto;">`;
  // Grid
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (h / 4) * i;
    const val = max - (range / 4) * i;
    svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3"/>`;
    svg += `<text x="${padding.left - 5}" y="${y + 4}" text-anchor="end" font-size="9" fill="#94a3b8">${fmt(val)}</text>`;
  }
  // Bars
  labels.forEach((l, li) => {
    const groupX = padding.left + groupWidth * li + groupWidth / 2;
    series.forEach((s, si) => {
      const x = groupX - (series.length * barWidth) / 2 + si * barWidth;
      const barH = ((s.values[li] - min) / range) * h;
      svg += `<rect x="${x}" y="${yScale(s.values[li])}" width="${barWidth - 2}" height="${barH}" rx="2" fill="${s.color}"/>`;
    });
    svg += `<text x="${groupX}" y="${height - 10}" text-anchor="middle" font-size="9" fill="#94a3b8">${l}</text>`;
  });
  // Legend
  let lx = padding.left;
  series.forEach(s => {
    svg += `<rect x="${lx}" y="${padding.top - 16}" width="12" height="10" rx="2" fill="${s.color}"/>`;
    svg += `<text x="${lx + 16}" y="${padding.top - 8}" font-size="9" fill="#64748b">${s.name}</text>`;
    lx += s.name.length * 6 + 30;
  });
  svg += '</svg>';
  return svg;
}

function svgHorizontalBarChart(
  data: { label: string; values: { name: string; color: string; value: number }[] }[],
  width = 600, height?: number
): string {
  const barH = 18;
  const gap = 6;
  const rowH = data[0].values.length * (barH + 2) + gap + 14;
  const totalH = height || (data.length * rowH + 40);
  const padding = { left: 120, right: 30, top: 20 };
  const w = width - padding.left - padding.right;
  const maxVal = Math.max(...data.flatMap(d => d.values.map(v => v.value)));

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${totalH}" style="width:100%;max-width:${width}px;height:auto;">`;
  data.forEach((d, di) => {
    const baseY = padding.top + di * rowH;
    svg += `<text x="${padding.left - 5}" y="${baseY + barH}" text-anchor="end" font-size="10" fill="#334155" font-weight="500">${d.label}</text>`;
    d.values.forEach((v, vi) => {
      const y = baseY + vi * (barH + 2);
      const bw = (v.value / maxVal) * w;
      svg += `<rect x="${padding.left}" y="${y}" width="${bw}" height="${barH}" rx="3" fill="${v.color}" opacity="0.85"/>`;
      svg += `<text x="${padding.left + bw + 4}" y="${y + 13}" font-size="9" fill="#64748b">${v.value}%</text>`;
    });
  });
  // Legend
  const uniqueNames = [...new Set(data[0].values.map(v => v.name))];
  let lx = padding.left;
  uniqueNames.forEach((name, i) => {
    const color = data[0].values.find(v => v.name === name)?.color || '#999';
    svg += `<rect x="${lx}" y="4" width="12" height="10" rx="2" fill="${color}"/>`;
    svg += `<text x="${lx + 16}" y="12" font-size="9" fill="#64748b">${name}</text>`;
    lx += name.length * 6 + 30;
  });
  svg += '</svg>';
  return svg;
}

function svgRadarChart(
  axes: string[], series: { name: string; color: string; values: number[] }[],
  width = 400, height = 350
): string {
  const cx = width / 2, cy = height / 2 - 10;
  const r = Math.min(cx, cy) - 40;
  const n = axes.length;
  const angleStep = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;

  const getPoint = (i: number, val: number) => {
    const angle = startAngle + angleStep * i;
    return { x: cx + (val / 100) * r * Math.cos(angle), y: cy + (val / 100) * r * Math.sin(angle) };
  };

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:100%;max-width:${width}px;height:auto;">`;
  // Grid circles
  [20, 40, 60, 80, 100].forEach(v => {
    const pts = axes.map((_, i) => { const p = getPoint(i, v); return `${p.x},${p.y}`; }).join(' ');
    svg += `<polygon points="${pts}" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>`;
  });
  // Axis lines & labels
  axes.forEach((a, i) => {
    const p = getPoint(i, 100);
    svg += `<line x1="${cx}" y1="${cy}" x2="${p.x}" y2="${p.y}" stroke="#e2e8f0" stroke-width="0.5"/>`;
    const lp = getPoint(i, 115);
    svg += `<text x="${lp.x}" y="${lp.y + 3}" text-anchor="middle" font-size="9" fill="#64748b">${a}</text>`;
  });
  // Series polygons
  series.forEach(s => {
    const pts = s.values.map((v, i) => { const p = getPoint(i, v); return `${p.x},${p.y}`; }).join(' ');
    svg += `<polygon points="${pts}" fill="${s.color}" fill-opacity="0.15" stroke="${s.color}" stroke-width="1.5"/>`;
    s.values.forEach((v, i) => {
      const p = getPoint(i, v);
      svg += `<circle cx="${p.x}" cy="${p.y}" r="2.5" fill="${s.color}"/>`;
    });
  });
  // Legend
  let lx = 10;
  series.forEach(s => {
    svg += `<rect x="${lx}" y="${height - 15}" width="10" height="3" rx="1.5" fill="${s.color}"/>`;
    svg += `<text x="${lx + 14}" y="${height - 10}" font-size="8" fill="#64748b">${s.name}</text>`;
    lx += s.name.length * 5.5 + 24;
  });
  svg += '</svg>';
  return svg;
}

// ====== MAIN GENERATOR ======

export function generateConclusoesFullHTML(params: GenerateParams): string {
  const { fiosCondutores, conclusoesDinamicas, insightsCruzamento, stats, lacunas, respostas, indicadores, orcStats } = params;
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const systemUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const seg2018 = segurancaPublica[0];
  const seg2024 = segurancaPublica[segurancaPublica.length - 1];
  const edu2018 = educacaoSerieHistorica[0];
  const edu2024 = educacaoSerieHistorica[educacaoSerieHistorica.length - 1];
  const eco2018 = indicadoresSocioeconomicos[0];
  const eco2024 = indicadoresSocioeconomicos[indicadoresSocioeconomicos.length - 1];
  const fem2018 = feminicidioSerie[0];
  const fem2024 = feminicidioSerie[feminicidioSerie.length - 1];
  const sau2018 = saudeSerieHistorica[0];
  const sau2024 = saudeSerieHistorica[saudeSerieHistorica.length - 1];

  const avancos = conclusoesDinamicas.filter(c => c.tipo === 'avanco');
  const retrocessos = conclusoesDinamicas.filter(c => c.tipo === 'retrocesso');
  const lacunasPersist = conclusoesDinamicas.filter(c => c.tipo === 'lacuna_persistente');

  const totalLacunas = stats?.total || 0;
  const cumpridas = stats?.porStatus?.cumprido || 0;
  const parciais = stats?.porStatus?.parcialmente_cumprido || 0;
  const naoCumpridas = stats?.porStatus?.nao_cumprido || 0;
  const retrocessosLac = stats?.porStatus?.retrocesso || 0;

  const icerdData = ARTIGOS_CONVENCAO.map(art => {
    const artLacunas = lacunas.filter((l: any) => {
      const artsFromEixo = EIXO_PARA_ARTIGOS[l.eixo_tematico] || [];
      const artsFromField = l.artigos_convencao || [];
      return [...artsFromEixo, ...artsFromField].includes(art.numero);
    });
    const cumpr = artLacunas.filter((l: any) => l.status_cumprimento === 'cumprido').length;
    const parc = artLacunas.filter((l: any) => l.status_cumprimento === 'parcialmente_cumprido').length;
    const nao = artLacunas.filter((l: any) => l.status_cumprimento === 'nao_cumprido').length;
    const retro = artLacunas.filter((l: any) => l.status_cumprimento === 'retrocesso').length;
    const total = artLacunas.length;
    const score = total > 0 ? Math.round(((cumpr * 1 + parc * 0.5) / total) * 100) : 50;
    return { ...art, total, cumpr, parc, nao, retro, score };
  });

  const badgeHTML = (tipo: string) => {
    const map: Record<string, [string, string]> = {
      avanco: ['badge-success', '✓ Avanço'], retrocesso: ['badge-destructive', '✗ Retrocesso'],
      lacuna_persistente: ['badge-warning', '⚠ Lacuna'], paradoxo: ['badge-purple', '◈ Paradoxo'],
      correlacao: ['badge-info', '↔ Correlação'], tendencia: ['badge-info', '→ Tendência'],
      lacuna_critica: ['badge-destructive', '⚠ Lacuna Crítica'], alerta: ['badge-destructive', '⚠ Alerta'],
      progresso: ['badge-success', '✓ Progresso'], 'contradição': ['badge-purple', '◈ Contradição'],
      'correlação': ['badge-info', '↔ Correlação'],
    };
    const [cls, label] = map[tipo] || ['badge-info', tipo];
    return `<span class="badge ${cls}">${label}</span>`;
  };

  const cardCls = (tipo: string) => {
    const map: Record<string, string> = {
      avanco: 'card-avanco', retrocesso: 'card-retrocesso', lacuna_persistente: 'card-lacuna',
      paradoxo: 'card-paradoxo', correlacao: 'card-correlacao', tendencia: 'card-correlacao',
      lacuna_critica: 'card-retrocesso', alerta: 'card-alerta', progresso: 'card-progresso',
      'contradição': 'card-paradoxo', 'correlação': 'card-correlacao',
    };
    return map[tipo] || '';
  };

  const barColor = (score: number) => score >= 70 ? '#16a34a' : score >= 40 ? '#f59e0b' : '#dc2626';

  // ====== BUILD INLINE SVG CHARTS ======

  // 1. Violência Racial line chart
  const anos = segurancaPublica.map(s => s.ano.toString());
  const violenciaChart = svgLineChart({
    label: anos.join(','),
    series: [
      { name: '% Vítimas negras', color: '#dc2626', values: segurancaPublica.map(s => s.percentualVitimasNegras) },
      { name: '% Letalidade policial', color: '#f59e0b', values: segurancaPublica.map(s => s.letalidadePolicial) },
    ]
  }, 580, 200, 60, 90);

  // 2. Feminicídio bar chart
  const femChart = svgBarChart(
    feminicidioSerie.map(f => f.ano.toString()),
    [{ name: '% Mulheres negras', color: '#dc2626', values: feminicidioSerie.map(f => f.percentualNegras) }],
    580, 200, 55, 70, v => `${v.toFixed(0)}%`
  );

  // 3. Educação line chart
  const eduChart = svgLineChart({
    label: educacaoSerieHistorica.map(e => e.ano.toString()).join(','),
    series: [
      { name: 'Negro (%)', color: '#2563eb', values: educacaoSerieHistorica.map(e => e.superiorNegroPercent) },
      { name: 'Branco (%)', color: '#94a3b8', values: educacaoSerieHistorica.map(e => e.superiorBrancoPercent) },
    ]
  }, 580, 200);

  // 4. Saúde line chart
  const sauChart = svgLineChart({
    label: saudeSerieHistorica.map(s => s.ano.toString()).join(','),
    series: [
      { name: 'Negra', color: '#dc2626', values: saudeSerieHistorica.map(s => s.mortalidadeMaternaNegra) },
      { name: 'Branca', color: '#94a3b8', values: saudeSerieHistorica.map(s => s.mortalidadeMaternaBranca) },
    ]
  }, 580, 200);

  // 5. Renda bar chart
  const rendaChart = svgBarChart(
    indicadoresSocioeconomicos.map(i => i.ano.toString()),
    [
      { name: 'Negra', color: '#2563eb', values: indicadoresSocioeconomicos.map(i => i.rendaMediaNegra) },
      { name: 'Branca', color: '#94a3b8', values: indicadoresSocioeconomicos.map(i => i.rendaMediaBranca) },
    ],
    580, 200, 0, undefined, v => `R$${v.toFixed(0)}`
  );

  // 6. Evolução desigualdade line chart
  const desigChart = svgLineChart({
    label: evolucaoDesigualdade.map(d => d.ano.toString()).join(','),
    series: [
      { name: 'Renda (branco/negro)', color: '#2563eb', values: evolucaoDesigualdade.map(d => d.razaoRenda) },
      { name: 'Desemprego (negro/branco)', color: '#f59e0b', values: evolucaoDesigualdade.map(d => d.razaoDesemprego) },
      { name: 'Homicídio (negro/branco)', color: '#dc2626', values: evolucaoDesigualdade.map(d => d.razaoHomicidio) },
    ]
  }, 580, 200, 1, 3);

  // 7. Violência interseccional horizontal bar
  const viChart = svgHorizontalBarChart(
    violenciaInterseccional.map(v => ({
      label: v.tipo,
      values: [
        { name: 'Mulher negra', color: '#dc2626', value: v.mulherNegra },
        { name: 'Mulher branca', color: '#94a3b8', value: v.mulherBranca },
      ]
    })), 580
  );

  // 8. Radar vulnerabilidades — REMOVIDO (índice fabricado)
  const radarChart = '<p><em>Índice de vulnerabilidade removido — normalização arbitrária viola Regra de Ouro.</em></p>';

  // 9. Classe por raça bar chart (SIS/IBGE 2024 — apenas brancos/pardos/pretos)
  const classeChart = svgBarChart(
    classePorRaca.map(c => c.faixa),
    [
      { name: 'Branca', color: '#94a3b8', values: classePorRaca.map(c => c.branca) },
      { name: 'Parda', color: '#2563eb', values: classePorRaca.map(c => c.parda) },
      { name: 'Preta', color: '#1e3a5f', values: classePorRaca.map(c => c.preta) },
    ],
    620, 220, 0, undefined, v => `${v.toFixed(0)}%`
  );

  // Tabela Síntese data
  const sinteseRows = [
    { ind: 'Vítimas negras homicídio (%)', v18: `${seg2018.percentualVitimasNegras}%`, v24: `${seg2024.percentualVitimasNegras}%`, var: `+${(seg2024.percentualVitimasNegras-seg2018.percentualVitimasNegras).toFixed(1)}pp`, tend: 'piora', fonte: 'FBSP 2025' },
    { ind: 'Letalidade policial negra (%)', v18: `${seg2018.letalidadePolicial}%`, v24: `${seg2024.letalidadePolicial}%`, var: `+${(seg2024.letalidadePolicial-seg2018.letalidadePolicial).toFixed(1)}pp`, tend: 'piora', fonte: 'FBSP 2025' },
    { ind: 'Feminicídio mulheres negras (%)', v18: `${fem2018.percentualNegras}%`, v24: `${fem2024.percentualNegras}%`, var: `+${(fem2024.percentualNegras-fem2018.percentualNegras).toFixed(1)}pp`, tend: 'piora', fonte: 'FBSP 2025' },
    { ind: 'Risco homicídio negro (×)', v18: `${seg2018.razaoRisco}x`, v24: `${seg2024.razaoRisco}x`, var: `+${(seg2024.razaoRisco-seg2018.razaoRisco).toFixed(1)}x`, tend: 'piora', fonte: 'Atlas 2025' },
    { ind: 'Renda média negra (R$)', v18: `R$ ${eco2018.rendaMediaNegra}`, v24: `R$ ${eco2024.rendaMediaNegra}`, var: `+${((eco2024.rendaMediaNegra/eco2018.rendaMediaNegra-1)*100).toFixed(0)}%`, tend: 'melhora', fonte: 'PNAD 2024' },
    { ind: 'Razão renda branca/negra', v18: `${(eco2018.rendaMediaBranca/eco2018.rendaMediaNegra).toFixed(2)}x`, v24: `${(eco2024.rendaMediaBranca/eco2024.rendaMediaNegra).toFixed(2)}x`, var: (eco2024.rendaMediaBranca/eco2024.rendaMediaNegra) < (eco2018.rendaMediaBranca/eco2018.rendaMediaNegra) ? '↓ Reduziu' : '↑ Ampliou', tend: (eco2024.rendaMediaBranca/eco2024.rendaMediaNegra) < (eco2018.rendaMediaBranca/eco2018.rendaMediaNegra) ? 'melhora' : 'piora', fonte: 'PNAD 2024' },
    { ind: 'Desemprego negro (%)', v18: `${eco2018.desempregoNegro}%`, v24: `${eco2024.desempregoNegro}%`, var: `${(eco2024.desempregoNegro-eco2018.desempregoNegro).toFixed(1)}pp`, tend: 'melhora', fonte: 'PNAD 2024' },
    { ind: 'Superior completo negro (%)', v18: `${edu2018.superiorNegroPercent}%`, v24: `${edu2024.superiorNegroPercent}%`, var: `+${(edu2024.superiorNegroPercent-edu2018.superiorNegroPercent).toFixed(1)}pp`, tend: 'melhora', fonte: 'PNAD Edu 2024' },
    { ind: 'Analfabetismo negro (%)', v18: `${edu2018.analfabetismoNegro}%`, v24: `${edu2024.analfabetismoNegro}%`, var: `${(edu2024.analfabetismoNegro-edu2018.analfabetismoNegro).toFixed(1)}pp`, tend: 'melhora', fonte: 'PNAD Edu 2024' },
    { ind: 'Mortalidade materna negra (/100mil NV)', v18: `${sau2018.mortalidadeMaternaNegra}`, v24: `${sau2024.mortalidadeMaternaNegra}`, var: `${((sau2024.mortalidadeMaternaNegra/sau2018.mortalidadeMaternaNegra-1)*100).toFixed(0)}%`, tend: 'melhora', fonte: 'DataSUS' },
    { ind: 'Razão mort. materna negra/branca', v18: `${(sau2018.mortalidadeMaternaNegra/sau2018.mortalidadeMaternaBranca).toFixed(1)}x`, v24: `${(sau2024.mortalidadeMaternaNegra/sau2024.mortalidadeMaternaBranca).toFixed(1)}x`, var: 'Persistente', tend: 'piora', fonte: 'DataSUS' },
  ];

  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relatório Integral de Conclusões — Sistema CERD IV</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 210mm; margin: 0 auto; padding: 20px; font-size: 11px; line-height: 1.6; color: #1a1a2e; }
  h1 { font-size: 22px; color: #0f3460; border-bottom: 3px solid #0f3460; padding-bottom: 8px; }
  h2 { font-size: 17px; color: #16213e; margin-top: 30px; border-left: 4px solid #0f3460; padding-left: 12px; page-break-after: avoid; }
  h3 { font-size: 13px; color: #0f3460; margin-top: 18px; }
  .header { text-align: center; margin-bottom: 28px; border: 2px solid #0f3460; padding: 20px; border-radius: 10px; background: linear-gradient(135deg, #f0f4ff, #e8eeff); }
  .header p { margin: 3px 0; color: #555; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
  .kpi-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin: 14px 0; }
  .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; text-align: center; }
  .kpi .value { font-size: 24px; font-weight: 700; }
  .kpi .label { font-size: 9px; color: #64748b; margin-top: 2px; }
  .kpi .sub { font-size: 9px; color: #94a3b8; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10px; }
  th { background: #0f3460; color: white; padding: 7px 10px; text-align: left; font-weight: 600; }
  td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  .card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; margin: 10px 0; page-break-inside: avoid; }
  .card-avanco { border-left: 4px solid #16a34a; }
  .card-retrocesso { border-left: 4px solid #dc2626; }
  .card-lacuna { border-left: 4px solid #f59e0b; }
  .card-paradoxo { border-left: 4px solid #7c3aed; }
  .card-correlacao { border-left: 4px solid #0ea5e9; }
  .card-alerta { border-left: 4px solid #dc2626; }
  .card-progresso { border-left: 4px solid #16a34a; }
  .card h4 { margin: 0 0 6px; font-size: 13px; color: #0f3460; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; margin-right: 4px; }
  .badge-success { background: #dcfce7; color: #166534; }
  .badge-destructive { background: #fef2f2; color: #991b1b; }
  .badge-warning { background: #fef3c7; color: #92400e; }
  .badge-info { background: #e0f2fe; color: #0369a1; }
  .badge-purple { background: #ede9fe; color: #5b21b6; }
  .piora-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 10px; }
  .avanco-box { background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 10px; }
  .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
  .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin: 12px 0; }
  .highlight { background: #fffbeb; border: 1px solid #f59e0b; border-radius: 6px; padding: 12px; margin: 10px 0; font-size: 10px; }
  .chart-container { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 12px 0; background: #fafbfc; page-break-inside: avoid; }
  .chart-title { font-size: 12px; font-weight: 700; color: #0f3460; margin-bottom: 4px; }
  .chart-subtitle { font-size: 9px; color: #94a3b8; margin-bottom: 10px; }
  .aderencia-bar { background: #e2e8f0; border-radius: 4px; height: 20px; position: relative; margin: 4px 0; }
  .aderencia-fill { height: 100%; border-radius: 4px; display: flex; align-items: center; justify-content: flex-end; padding-right: 6px; font-size: 9px; font-weight: 700; color: white; }
  .stat-pos { color: #16a34a; font-weight: 600; }
  .stat-neg { color: #dc2626; font-weight: 600; }
  .link { color: #2563eb; text-decoration: underline; font-size: 9px; }
  .source { font-size: 9px; color: #94a3b8; font-style: italic; }
  .toc { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0; }
  .toc a { color: #2563eb; text-decoration: none; display: block; padding: 3px 0; font-size: 11px; }
  .toc a:hover { text-decoration: underline; }
  .tab-header { background: linear-gradient(135deg, #f0f4ff, #e8eeff); border: 1px solid #c7d2fe; border-radius: 8px; padding: 12px 16px; margin: 24px 0 12px; }
  .tab-header h2 { margin: 0; border: none; padding: 0; }
  .tab-header p { font-size: 10px; color: #64748b; margin: 4px 0 0; }
  .stat-card-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin: 10px 0; }
  .stat-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center; }
  .stat-card .val { font-size: 18px; font-weight: 700; }
  .stat-card .lbl { font-size: 9px; color: #64748b; }
  .stat-card .sub { font-size: 8px; color: #94a3b8; }
  @media print { .no-print { display: none; } body { padding: 0; } .card, .chart-container { page-break-inside: avoid; } }
  @page { size: A4; margin: 2cm; }
</style></head><body>
${getExportToolbarHTML('Conclusoes-Integral-CERD-IV')}

<div class="header">
  <h1>📊 Relatório Integral de Conclusões Analíticas</h1>
  <p><strong>Sistema de Subsídios ao IV Relatório Periódico do Brasil ao CERD</strong></p>
  <p>Consolidação completa de todas as 8 abas: Infográficos Comparativos, Tabela Síntese, Fios Condutores, Cruzamentos, Lacunas, Avanços, Retrocessos e Aderência ICERD</p>
  <p>Gerado em: ${now}</p>
</div>

<div class="toc">
  <h3 style="margin-top:0">📑 Sumário</h3>
  <a href="#tab1">1. Infográficos Comparativos (9 gráficos)</a>
  <a href="#tab2">2. Tabela Síntese Comparativa (${sinteseRows.length} indicadores)</a>
  <a href="#tab3">3. Fios Condutores (${fiosCondutores.length})</a>
  <a href="#tab4">4. Cruzamentos Analíticos (${insightsCruzamento.length})</a>
  <a href="#tab5">5. Lacunas Persistentes (${lacunasPersist.length})</a>
  <a href="#tab6">6. Avanços Identificados (${avancos.length})</a>
  <a href="#tab7">7. Retrocessos Identificados (${retrocessos.length})</a>
  <a href="#tab8">8. Aderência ICERD — Artigos I a VII</a>
  <a href="#verdict">9. Veredito Consolidado</a>
</div>

<!-- ============================================ -->
<!-- ABA 1: INFOGRÁFICOS COMPARATIVOS -->
<!-- ============================================ -->
<div class="tab-header">
  <h2 id="tab1">📊 1. Infográficos Comparativos</h2>
  <p>Gráficos comparativos 2018→2024 — Base Estatística: FBSP 2025, PNAD 2024, DataSUS, SIDRA/IBGE, Censo 2022</p>
</div>

<div class="kpi-6">
  <div class="kpi"><div class="value">${dadosDemograficos.percentualNegro}%</div><div class="label">Pop. negra</div><div class="sub">${(dadosDemograficos.populacaoNegra/1e6).toFixed(0)}M</div></div>
  <div class="kpi"><div class="value" style="color:#dc2626">${seg2024.percentualVitimasNegras}%</div><div class="label">Homicídio negro</div><div class="sub">2018: ${seg2018.percentualVitimasNegras}%</div></div>
  <div class="kpi"><div class="value" style="color:#dc2626">${fem2024.percentualNegras}%</div><div class="label">Feminicídio negro</div><div class="sub">2018: ${fem2018.percentualNegras}%</div></div>
  <div class="kpi"><div class="value" style="color:#16a34a">${edu2024.superiorNegroPercent}%</div><div class="label">Superior negro</div><div class="sub">2018: ${edu2018.superiorNegroPercent}%</div></div>
  <div class="kpi"><div class="value">R$ ${eco2024.rendaMediaNegra}</div><div class="label">Renda negra</div><div class="sub">+${((eco2024.rendaMediaNegra/eco2018.rendaMediaNegra-1)*100).toFixed(0)}% vs 2018</div></div>
  <div class="kpi"><div class="value" style="color:#f59e0b">${(eco2024.rendaMediaBranca/eco2024.rendaMediaNegra).toFixed(2)}x</div><div class="label">Razão renda</div><div class="sub">branco/negro</div></div>
</div>

<!-- Gráfico 1: Violência Racial -->
<div class="chart-container">
  <div class="chart-title">Violência Racial: Evolução 2018→2024</div>
  <div class="chart-subtitle">Fontes: 19º Anuário FBSP 2025 / Atlas da Violência 2025</div>
  <div class="stat-card-row">
    <div class="stat-card" style="border-left:3px solid #dc2626"><div class="lbl">Vítimas negras homicídio</div><div class="val" style="color:#dc2626">${seg2018.percentualVitimasNegras}% → ${seg2024.percentualVitimasNegras}%</div><div class="sub">+${(seg2024.percentualVitimasNegras-seg2018.percentualVitimasNegras).toFixed(1)}pp</div></div>
    <div class="stat-card" style="border-left:3px solid #dc2626"><div class="lbl">Letalidade policial negra</div><div class="val" style="color:#dc2626">${seg2018.letalidadePolicial}% → ${seg2024.letalidadePolicial}%</div><div class="sub">+${(seg2024.letalidadePolicial-seg2018.letalidadePolicial).toFixed(1)}pp</div></div>
    <div class="stat-card" style="border-left:3px solid #f59e0b"><div class="lbl">Risco homicídio negro</div><div class="val">${seg2024.razaoRisco}x</div><div class="sub">Persistente</div></div>
  </div>
  ${violenciaChart}
</div>

<!-- Gráfico 2: Feminicídio -->
<div class="chart-container">
  <div class="chart-title">Feminicídio por Raça: 2018→2024</div>
  <div class="chart-subtitle">Fonte: 19º Anuário FBSP 2025 — ${fem2018.percentualNegras}% → ${fem2024.percentualNegras}% mulheres negras</div>
  <div class="stat-card-row" style="grid-template-columns:1fr 1fr">
    <div class="stat-card" style="border-left:3px solid #dc2626"><div class="lbl">Mulheres negras vítimas</div><div class="val" style="color:#dc2626">${fem2024.percentualNegras}%</div><div class="sub">2018: ${fem2018.percentualNegras}% (+${(fem2024.percentualNegras-fem2018.percentualNegras).toFixed(1)}pp)</div></div>
    <div class="stat-card"><div class="lbl">Total feminicídios 2024</div><div class="val">${fem2024.totalFeminicidios.toLocaleString('pt-BR')}</div><div class="sub">2018: ${fem2018.totalFeminicidios.toLocaleString('pt-BR')}</div></div>
  </div>
  ${femChart}
</div>

<!-- Gráfico 3: Violência Interseccional -->
<div class="chart-container">
  <div class="chart-title">Violência Interseccional: Mulheres Negras</div>
  <div class="chart-subtitle">Fonte: 19º Anuário FBSP 2025 (dados 2024)</div>
  ${viChart}
</div>

<!-- Gráfico 4: Radar Vulnerabilidades -->
<div class="chart-container">
  <div class="chart-title">Radar de Vulnerabilidades por Grupo</div>
  <div class="chart-subtitle">Índice de vulnerabilidade relativa (0-100) — Fontes: PNAD/FBSP/DataSUS 2024</div>
  <div style="text-align:center">${radarChart}</div>
</div>

<!-- Gráfico 5: Educação -->
<div class="chart-container">
  <div class="chart-title">Educação: Ensino Superior por Raça 2018→2024</div>
  <div class="chart-subtitle">Fonte: PNAD Contínua Educação 2024 — Negro: ${edu2018.superiorNegroPercent}% → ${edu2024.superiorNegroPercent}% | Branco: ${edu2018.superiorBrancoPercent}% → ${edu2024.superiorBrancoPercent}%</div>
  <div class="stat-card-row" style="grid-template-columns:1fr 1fr">
    <div class="stat-card" style="border-left:3px solid #16a34a"><div class="lbl">Superior completo (negro)</div><div class="val" style="color:#16a34a">${edu2024.superiorNegroPercent}%</div><div class="sub">2018: ${edu2018.superiorNegroPercent}% (+${(edu2024.superiorNegroPercent-edu2018.superiorNegroPercent).toFixed(1)}pp)</div></div>
    <div class="stat-card"><div class="lbl">Razão branco/negro</div><div class="val">${(edu2024.superiorBrancoPercent/edu2024.superiorNegroPercent).toFixed(1)}x</div><div class="sub">2018: ${(edu2018.superiorBrancoPercent/edu2018.superiorNegroPercent).toFixed(1)}x</div></div>
  </div>
  ${eduChart}
</div>

<!-- Gráfico 6: Saúde -->
<div class="chart-container">
  <div class="chart-title">Saúde: Mortalidade Materna por Raça 2018→2024</div>
  <div class="chart-subtitle">Fonte: DataSUS/SIM — Negra: ${sau2018.mortalidadeMaternaNegra} → ${sau2024.mortalidadeMaternaNegra} por 100 mil NV</div>
  <div class="stat-card-row" style="grid-template-columns:1fr 1fr">
    <div class="stat-card" style="border-left:3px solid #f59e0b"><div class="lbl">Razão mortalidade negra/branca</div><div class="val" style="color:#f59e0b">${(sau2024.mortalidadeMaternaNegra/sau2024.mortalidadeMaternaBranca).toFixed(1)}x</div><div class="sub">2018: ${(sau2018.mortalidadeMaternaNegra/sau2018.mortalidadeMaternaBranca).toFixed(1)}x</div></div>
    <div class="stat-card" style="border-left:3px solid #16a34a"><div class="lbl">Redução mortalidade negra</div><div class="val" style="color:#16a34a">-${((1-sau2024.mortalidadeMaternaNegra/sau2018.mortalidadeMaternaNegra)*100).toFixed(0)}%</div><div class="sub">${sau2018.mortalidadeMaternaNegra} → ${sau2024.mortalidadeMaternaNegra}</div></div>
  </div>
  ${sauChart}
</div>

<!-- Gráfico 7: Renda -->
<div class="chart-container">
  <div class="chart-title">Renda Média Mensal por Raça: 2018→2024</div>
  <div class="chart-subtitle">Fonte: PNAD Contínua (SIDRA 6405)</div>
  <div class="stat-card-row">
    <div class="stat-card"><div class="lbl">Renda negra 2024</div><div class="val">R$ ${eco2024.rendaMediaNegra.toLocaleString('pt-BR')}</div><div class="sub">+${((eco2024.rendaMediaNegra/eco2018.rendaMediaNegra-1)*100).toFixed(0)}% vs 2018</div></div>
    <div class="stat-card"><div class="lbl">Renda branca 2024</div><div class="val">R$ ${eco2024.rendaMediaBranca.toLocaleString('pt-BR')}</div><div class="sub">+${((eco2024.rendaMediaBranca/eco2018.rendaMediaBranca-1)*100).toFixed(0)}% vs 2018</div></div>
    <div class="stat-card" style="border-left:3px solid #f59e0b"><div class="lbl">Gap absoluto</div><div class="val" style="color:#f59e0b">R$ ${(eco2024.rendaMediaBranca-eco2024.rendaMediaNegra).toLocaleString('pt-BR')}</div><div class="sub">2018: R$ ${(eco2018.rendaMediaBranca-eco2018.rendaMediaNegra).toLocaleString('pt-BR')}</div></div>
  </div>
  ${rendaChart}
</div>

<!-- Gráfico 8: Evolução Desigualdade -->
<div class="chart-container">
  <div class="chart-title">Evolução das Razões de Desigualdade 2018→2024</div>
  <div class="chart-subtitle">Razão branco/negro em renda, desemprego e homicídio — Fontes: PNAD/SIDRA, FBSP 2025, Atlas 2025</div>
  ${desigChart}
  <div style="background:#fef2f2;border:1px solid #fca5a5;border-radius:6px;padding:8px;margin-top:8px;font-size:10px;">
    <strong>Conclusão:</strong> Apesar de melhorias pontuais em renda e emprego, a razão de homicídio permanece estável em ~2,7x. A desigualdade estrutural se mantém mesmo com políticas afirmativas.
  </div>
</div>

<!-- Gráfico 9: Classe por Raça -->
<div class="chart-container">
  <div class="chart-title">Distribuição por Classe e Raça</div>
  <div class="chart-subtitle">Fonte: PNAD Contínua / SIS-IBGE 2024</div>
  ${classeChart}
</div>

<!-- ============================================ -->
<!-- ABA 2: TABELA SÍNTESE -->
<!-- ============================================ -->
<div class="tab-header">
  <h2 id="tab2">📋 2. Tabela Síntese Comparativa</h2>
  <p>Indicadores-chave 2018→2024 — Dados oficiais das fontes primárias — Base para argumentação CERD IV</p>
</div>

<table>
  <thead><tr><th>Indicador</th><th>2018</th><th>2024</th><th>Variação</th><th>Tendência</th><th>Fonte</th></tr></thead>
  <tbody>
  ${sinteseRows.map(r => `<tr>
    <td style="font-weight:500">${r.ind}</td>
    <td style="text-align:center">${r.v18}</td>
    <td style="text-align:center;font-weight:700">${r.v24}</td>
    <td style="text-align:center" class="${r.tend === 'melhora' ? 'stat-pos' : 'stat-neg'}">${r.var}</td>
    <td style="text-align:center"><span class="badge ${r.tend === 'melhora' ? 'badge-success' : 'badge-destructive'}">${r.tend === 'melhora' ? '↑ Melhora' : '↓ Piora'}</span></td>
    <td style="text-align:center;font-size:9px;color:#94a3b8">${r.fonte}</td>
  </tr>`).join('')}
  </tbody>
</table>
<div style="background:#f0f4ff;border:1px solid #c7d2fe;border-radius:6px;padding:10px;margin-top:8px;font-size:10px;">
  <strong>Fio Condutor:</strong> Os dados revelam avanços em educação e emprego (resultado de políticas afirmativas), mas a violência racial (homicídio, letalidade policial, feminicídio) <strong>piorou em termos relativos</strong>. A desigualdade de renda persiste estruturalmente.
</div>

<!-- ============================================ -->
<!-- ABA 3: FIOS CONDUTORES -->
<!-- ============================================ -->
<div class="tab-header">
  <h2 id="tab3">🔗 3. Fios Condutores (${fiosCondutores.length})</h2>
  <p>Argumentos transversais: Base Estatística × ${totalLacunas} lacunas ONU × ${respostas.length} respostas CERD III × ${orcStats?.totalRegistros || 0} registros orçamentários</p>
</div>

${fiosCondutores.map(fio => `
<div class="card ${cardCls(fio.tipo)}">
  <h4>${fio.titulo} ${badgeHTML(fio.tipo)}</h4>
  <p style="font-size:10px;">${fio.argumento}</p>
  ${fio.evidencias.length > 0 ? `<div style="font-size:9px;margin-top:6px;"><strong>Evidências:</strong><ul style="margin:4px 0;padding-left:16px;">${fio.evidencias.map(e => `<li><strong>${e.texto}</strong> (${e.fonte}${e.variacao ? ` — ${e.variacao}` : ''})</li>`).join('')}</ul></div>` : ''}
  ${fio.comparativo2018 ? `<div style="font-size:9px;background:#f1f5f9;padding:6px 10px;border-radius:4px;margin-top:4px;">📊 <strong>Comparativo 2018→2024:</strong> ${fio.comparativo2018}</div>` : ''}
  ${fio.eixos.length > 0 ? `<div style="margin-top:4px;">${fio.eixos.map(e => `<span class="badge badge-info">${e.replace(/_/g, ' ')}</span>`).join('')}</div>` : ''}
</div>`).join('')}

<!-- ============================================ -->
<!-- ABA 4: CRUZAMENTOS -->
<!-- ============================================ -->
<div class="tab-header">
  <h2 id="tab4">⚡ 4. Cruzamentos Analíticos (${insightsCruzamento.length})</h2>
  <p>Insights: lacunas ONU × orçamento × indicadores FBSP/PNAD × respostas CERD III</p>
</div>

${insightsCruzamento.map(ins => `
<div class="card ${cardCls(ins.tipo)}">
  <h4>${ins.titulo} ${badgeHTML(ins.tipo)}</h4>
  <p style="font-size:10px;">${ins.descricao}</p>
  ${ins.dados.length > 0 ? `<ul style="margin:6px 0;padding-left:16px;font-size:9px;">${ins.dados.map(d => `<li>${d}</li>`).join('')}</ul>` : ''}
</div>`).join('')}

<!-- ============================================ -->
<!-- ABA 5: LACUNAS PERSISTENTES -->
<!-- ============================================ -->
<div class="tab-header">
  <h2 id="tab5">⚠️ 5. Lacunas Persistentes (${lacunasPersist.length})</h2>
  <p>Lacunas que persistem entre o III e o IV relatório</p>
</div>

${lacunasPersist.map(c => `
<div class="card card-lacuna">
  <h4>⚠ ${c.titulo} <span class="badge badge-warning">${c.periodo}</span></h4>
  <p style="font-size:10px;">${c.argumento_central}</p>
  ${c.evidencias.length > 0 ? `<div style="font-size:9px;margin-top:4px;"><strong>Evidências:</strong> ${c.evidencias.join('; ')}</div>` : ''}
  ${c.eixos.length > 0 ? `<div style="margin-top:4px;">${c.eixos.map(e => `<span class="badge badge-info">${e.replace(/_/g, ' ')}</span>`).join('')}${c.relevancia_cerd_iv ? ' <span class="badge badge-purple">CERD IV</span>' : ''}</div>` : ''}
</div>`).join('')}

<!-- ============================================ -->
<!-- ABA 6: AVANÇOS -->
<!-- ============================================ -->
<div class="tab-header">
  <h2 id="tab6">📈 6. Avanços Identificados (${avancos.length})</h2>
  <p>Progressos verificados no período 2018-2024</p>
</div>

${avancos.map(c => `
<div class="card card-avanco">
  <h4>✓ ${c.titulo} <span class="badge badge-success">${c.periodo}</span></h4>
  <p style="font-size:10px;">${c.argumento_central}</p>
  ${c.evidencias.length > 0 ? `<div style="font-size:9px;margin-top:4px;"><strong>Evidências:</strong> ${c.evidencias.join('; ')}</div>` : ''}
  ${c.eixos.length > 0 ? `<div style="margin-top:4px;">${c.eixos.map(e => `<span class="badge badge-info">${e.replace(/_/g, ' ')}</span>`).join('')}</div>` : ''}
</div>`).join('')}

<!-- ============================================ -->
<!-- ABA 7: RETROCESSOS -->
<!-- ============================================ -->
<div class="tab-header">
  <h2 id="tab7">📉 7. Retrocessos Identificados (${retrocessos.length})</h2>
  <p>Indicadores que pioraram no período 2018-2024</p>
</div>

${retrocessos.map(c => `
<div class="card card-retrocesso">
  <h4>✗ ${c.titulo} <span class="badge badge-destructive">${c.periodo}</span></h4>
  <p style="font-size:10px;">${c.argumento_central}</p>
  ${c.evidencias.length > 0 ? `<div style="font-size:9px;margin-top:4px;"><strong>Evidências:</strong> ${c.evidencias.join('; ')}</div>` : ''}
  ${c.eixos.length > 0 ? `<div style="margin-top:4px;">${c.eixos.map(e => `<span class="badge badge-info">${e.replace(/_/g, ' ')}</span>`).join('')}</div>` : ''}
</div>`).join('')}

<!-- ============================================ -->
<!-- ABA 8: ADERÊNCIA ICERD -->
<!-- ============================================ -->
<div class="tab-header">
  <h2 id="tab8">⚖️ 8. Aderência ICERD — Artigos I a VII</h2>
  <p>Avaliação sistêmica da conformidade com a Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial</p>
</div>

<table>
  <tr><th>Artigo</th><th>Tema</th><th>Lacunas</th><th>Cumpr.</th><th>Parcial</th><th>Não Cumpr.</th><th>Retro.</th><th>Score</th></tr>
  ${icerdData.map(a => `<tr>
    <td><strong>${a.numero}</strong></td>
    <td>${a.titulo}</td>
    <td style="text-align:center">${a.total}</td>
    <td style="text-align:center" class="stat-pos">${a.cumpr}</td>
    <td style="text-align:center">${a.parc}</td>
    <td style="text-align:center" class="stat-neg">${a.nao}</td>
    <td style="text-align:center" class="stat-neg">${a.retro}</td>
    <td style="text-align:center;font-weight:700">${a.score}%</td>
  </tr>`).join('')}
</table>

<h3>Barras de Aderência por Artigo</h3>
${icerdData.map(a => `
<div style="margin:10px 0;">
  <div style="font-size:11px;font-weight:600;margin-bottom:2px;">${a.numero} — ${a.titulo} (${a.score}%)</div>
  <div class="aderencia-bar"><div class="aderencia-fill" style="width:${Math.max(a.score, 5)}%;background:${barColor(a.score)}">${a.score}%</div></div>
  <div style="font-size:8px;color:#94a3b8;">✅ ${a.cumpr} cumprido | ⚠️ ${a.parc} parcial | ❌ ${a.nao} não cumprido | 🔴 ${a.retro} retrocesso | Total: ${a.total} lacunas</div>
</div>`).join('')}

<!-- ============================================ -->
<!-- VEREDITO CONSOLIDADO -->
<!-- ============================================ -->
<div class="tab-header" style="background:linear-gradient(135deg,#fef3c7,#fefce8);border-color:#fde047;">
  <h2 id="verdict" style="color:#92400e">⚖️ 9. Veredito Consolidado</h2>
  <p style="color:#92400e;">Conclusão geral baseada no cruzamento exaustivo de todas as fontes e módulos</p>
</div>

<div class="kpi-grid">
  <div class="kpi"><div class="value" style="color:#166534">${cumpridas}</div><div class="label">Lacunas cumpridas</div></div>
  <div class="kpi"><div class="value" style="color:#92400e">${parciais}</div><div class="label">Parciais</div></div>
  <div class="kpi"><div class="value" style="color:#991b1b">${naoCumpridas}</div><div class="label">Não cumpridas</div></div>
  <div class="kpi"><div class="value" style="color:#7f1d1d">${retrocessosLac}</div><div class="label">Retrocessos</div></div>
</div>

<div class="grid-2">
  <div class="piora-box">
    <p style="font-size:11px;font-weight:700;color:#991b1b;margin-bottom:6px;">⚠️ PIORA RELATIVA (2018→2024)</p>
    <ul style="margin:0;padding-left:16px;font-size:10px;">
      <li>Homicídio negro: ${seg2018.percentualVitimasNegras}% → ${seg2024.percentualVitimasNegras}% (<span class="stat-neg">+${(seg2024.percentualVitimasNegras-seg2018.percentualVitimasNegras).toFixed(1)}pp</span>)</li>
      <li>Letalidade policial negra: ${seg2018.letalidadePolicial}% → ${seg2024.letalidadePolicial}%</li>
      <li>Feminicídio mulheres negras: ${fem2018.percentualNegras}% → ${fem2024.percentualNegras}%</li>
      <li>Gap absoluto renda: R$ ${eco2018.rendaMediaBranca-eco2018.rendaMediaNegra} → R$ ${eco2024.rendaMediaBranca-eco2024.rendaMediaNegra}</li>
    </ul>
  </div>
  <div class="avanco-box">
    <p style="font-size:11px;font-weight:700;color:#166534;margin-bottom:6px;">✓ AVANÇOS (2018→2024)</p>
    <ul style="margin:0;padding-left:16px;font-size:10px;">
      <li>Superior negro: ${edu2018.superiorNegroPercent}% → ${edu2024.superiorNegroPercent}%</li>
      <li>Desemprego negro: ${eco2018.desempregoNegro}% → ${eco2024.desempregoNegro}%</li>
      <li>Renda média negra: R$ ${eco2018.rendaMediaNegra} → R$ ${eco2024.rendaMediaNegra}</li>
      <li>Censo 2022: ${povosTradicionais.quilombolas.populacao.toLocaleString('pt-BR')} quilombolas</li>
      <li>Recriação MIR + Lei 14.532/2023</li>
    </ul>
  </div>
</div>

<div class="highlight" style="margin-top:16px;">
  <p style="font-weight:700;margin-bottom:6px;font-size:12px;">⚖️ Avaliação Geral</p>
  <p style="font-size:10px;line-height:1.7;">O Estado brasileiro apresenta um padrão de <strong>paradoxo normativo-implementação</strong>: avanços legislativos significativos 
  (Lei 14.532/2023, recriação do MIR, cotas ampliadas) coexistem com <strong>agravamento de indicadores estruturais</strong> 
  (violência letal, feminicídio, disparidade de renda). A média de aderência ICERD é de 
  <strong>${icerdData.length > 0 ? Math.round(icerdData.reduce((s, a) => s + a.score, 0) / icerdData.length) : 0}%</strong>, 
  indicando cumprimento parcial das obrigações convencionais. Foram identificados <strong>${fiosCondutores.length} fios condutores</strong>, 
  <strong>${insightsCruzamento.length} cruzamentos analíticos</strong>, <strong>${avancos.length} avanços</strong>, 
  <strong>${retrocessos.length} retrocessos</strong> e <strong>${lacunasPersist.length} lacunas persistentes</strong> 
  no período 2018–2024.</p>
</div>

<div class="source" style="margin-top:20px;padding-top:10px;border-top:1px solid #e2e8f0;">
  📋 Relatório gerado pelo Sistema de Subsídios CERD IV — ${now} | 
  <a class="link" href="${systemUrl}/conclusoes">→ Acessar Conclusões no sistema</a>
</div>
</body></html>`;
}

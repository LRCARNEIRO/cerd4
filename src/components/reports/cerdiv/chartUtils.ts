/**
 * Inline SVG chart generators for static HTML reports.
 * Used by the CERD IV report generator.
 */

export function svgLineChart(
  data: { label: string; series: { name: string; color: string; values: number[] }[] },
  width = 600, height = 220, yMin?: number, yMax?: number
): string {
  const padding = { top: 24, right: 20, bottom: 40, left: 55 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;
  const allValues = data.series.flatMap(s => s.values);
  if (allValues.length === 0) return '';
  const min = yMin ?? Math.floor(Math.min(...allValues) * 0.95);
  const max = yMax ?? Math.ceil(Math.max(...allValues) * 1.05);
  const range = max - min || 1;
  const n = data.series[0].values.length;
  const xScale = (i: number) => padding.left + (i / Math.max(n - 1, 1)) * w;
  const yScale = (v: number) => padding.top + h - ((v - min) / range) * h;
  const labels = data.label.split(',');

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:100%;max-width:${width}px;height:auto;">`;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (h / 4) * i;
    const val = max - (range / 4) * i;
    svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3"/>`;
    svg += `<text x="${padding.left - 5}" y="${y + 4}" text-anchor="end" font-size="9" fill="#94a3b8">${val.toFixed(val % 1 === 0 ? 0 : 1)}</text>`;
  }
  labels.forEach((l, i) => {
    svg += `<text x="${xScale(i)}" y="${height - 8}" text-anchor="middle" font-size="9" fill="#94a3b8">${l.trim()}</text>`;
  });
  data.series.forEach(s => {
    const points = s.values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
    svg += `<polyline points="${points}" fill="none" stroke="${s.color}" stroke-width="2.5"/>`;
    s.values.forEach((v, i) => {
      svg += `<circle cx="${xScale(i)}" cy="${yScale(v)}" r="3.5" fill="${s.color}"/>`;
      // Data label above each point
      const labelY = yScale(v) - 8;
      svg += `<text x="${xScale(i)}" y="${labelY}" text-anchor="middle" font-size="8" font-weight="600" fill="${s.color}">${v % 1 === 0 ? v : v.toFixed(1)}</text>`;
    });
  });
  let lx = padding.left;
  data.series.forEach(s => {
    svg += `<rect x="${lx}" y="${padding.top - 18}" width="12" height="3" rx="1.5" fill="${s.color}"/>`;
    svg += `<text x="${lx + 16}" y="${padding.top - 13}" font-size="9" fill="#64748b">${s.name}</text>`;
    lx += s.name.length * 6 + 30;
  });
  svg += '</svg>';
  return svg;
}

export function svgBarChart(
  labels: string[], series: { name: string; color: string; values: number[] }[],
  width = 600, height = 220, yMin?: number, yMax?: number, formatter?: (v: number) => string
): string {
  const padding = { top: 24, right: 20, bottom: 50, left: 60 };
  const w = width - padding.left - padding.right;
  const h = height - padding.top - padding.bottom;
  const allValues = series.flatMap(s => s.values);
  if (allValues.length === 0) return '';
  const min = yMin ?? 0;
  const max = yMax ?? Math.ceil(Math.max(...allValues) * 1.1);
  const range = max - min || 1;
  const n = labels.length;
  const groupWidth = w / n;
  const barWidth = Math.min(groupWidth / (series.length + 1), 30);
  const fmt = formatter || ((v: number) => v >= 1e9 ? `${(v/1e9).toFixed(1)}B` : v >= 1e6 ? `${(v/1e6).toFixed(1)}M` : v.toString());
  const yScale = (v: number) => padding.top + h - ((v - min) / range) * h;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:100%;max-width:${width}px;height:auto;">`;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (h / 4) * i;
    const val = max - (range / 4) * i;
    svg += `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#e2e8f0" stroke-dasharray="3,3"/>`;
    svg += `<text x="${padding.left - 5}" y="${y + 4}" text-anchor="end" font-size="9" fill="#94a3b8">${fmt(val)}</text>`;
  }
  labels.forEach((l, li) => {
    const groupX = padding.left + groupWidth * li + groupWidth / 2;
    series.forEach((s, si) => {
      const x = groupX - (series.length * barWidth) / 2 + si * barWidth;
      const barH = ((s.values[li] - min) / range) * h;
      const barY = yScale(s.values[li]);
      svg += `<rect x="${x}" y="${barY}" width="${barWidth - 2}" height="${barH}" rx="2" fill="${s.color}" opacity="0.85"/>`;
      // Data label above bar
      const labelVal = fmt(s.values[li]);
      svg += `<text x="${x + (barWidth - 2) / 2}" y="${barY - 4}" text-anchor="middle" font-size="7.5" font-weight="600" fill="${s.color}">${labelVal}</text>`;
    });
    svg += `<text x="${groupX}" y="${height - 10}" text-anchor="middle" font-size="9" fill="#94a3b8">${l}</text>`;
  });
  let lx = padding.left;
  series.forEach(s => {
    svg += `<rect x="${lx}" y="${padding.top - 18}" width="12" height="10" rx="2" fill="${s.color}"/>`;
    svg += `<text x="${lx + 16}" y="${padding.top - 10}" font-size="9" fill="#64748b">${s.name}</text>`;
    lx += s.name.length * 6 + 30;
  });
  svg += '</svg>';
  return svg;
}

export function svgDonutChart(
  segments: { label: string; value: number; color: string }[],
  width = 300, height = 300
): string {
  const cx = width / 2, cy = height / 2;
  const r = Math.min(cx, cy) - 50;
  const innerR = r * 0.55;
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return '';

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" style="width:100%;max-width:${width}px;height:auto;">`;
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
    startAngle = endAngle;
  });
  // Center text
  svg += `<text x="${cx}" y="${cy - 5}" text-anchor="middle" font-size="18" font-weight="700" fill="#1e3a5f">${total}</text>`;
  svg += `<text x="${cx}" y="${cy + 12}" text-anchor="middle" font-size="9" fill="#64748b">total</text>`;
  // Legend below
  let ly = height - 35;
  let lx = 10;
  segments.forEach(seg => {
    const pct = ((seg.value / total) * 100).toFixed(1);
    svg += `<rect x="${lx}" y="${ly}" width="10" height="10" rx="2" fill="${seg.color}"/>`;
    svg += `<text x="${lx + 14}" y="${ly + 9}" font-size="9" fill="#334155">${seg.label} (${pct}%)</text>`;
    lx += seg.label.length * 5 + 70;
    if (lx > width - 60) { lx = 10; ly += 16; }
  });
  svg += '</svg>';
  return svg;
}

/** Format BRL currency */
export function fmtBRL(v: number): string {
  if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(2)} bi`;
  if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1)} mi`;
  if (v >= 1e3) return `R$ ${(v / 1e3).toFixed(0)} mil`;
  return `R$ ${v.toFixed(0)}`;
}

/** Format number with pt-BR locale */
export function fmtNum(v: number): string {
  return v.toLocaleString('pt-BR');
}

/** Create a data-card grid HTML */
export function dataCards(items: { value: string; label: string; color?: string }[]): string {
  return `<div class="data-grid">${items.map(i =>
    `<div class="data-card"><div class="data-card-value" style="${i.color ? `color:${i.color}` : ''}">${i.value}</div><div class="data-card-label">${i.label}</div></div>`
  ).join('')}</div>`;
}

/** Trend arrow */
export function trend(val: number, invertedGood = false): string {
  const improved = invertedGood ? val < 0 : val > 0;
  const arrow = val > 0 ? '↑' : val < 0 ? '↓' : '→';
  const color = improved ? '#22c55e' : '#ef4444';
  return `<span style="color:${color};font-weight:600">${arrow} ${Math.abs(val).toFixed(1)}%</span>`;
}

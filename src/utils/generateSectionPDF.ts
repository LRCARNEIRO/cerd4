// Utility to generate printable PDF from section data
import { getExportToolbarHTML } from './reportExportToolbar';

interface PDFSection {
  titulo: string;
  subtitulo?: string;
  dataGeracao: string;
  conteudo: string; // HTML string
}

export function generateSectionPDF(section: PDFSection) {
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${section.titulo} — Sistema CERD IV</title>
  <style>
    @page { margin: 2cm 2.5cm; size: A4; @bottom-center { content: counter(page); font-size: 9pt; color: #64748b; } }
    @page :first { @bottom-center { content: none; } }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 11pt; line-height: 1.6; color: #1a1a2e; }
    .header { border-bottom: 3px solid #1a1a2e; padding-bottom: 12px; margin-bottom: 20px; }
    .header h1 { font-size: 18pt; font-weight: 700; color: #1a1a2e; }
    .header .subtitle { font-size: 10pt; color: #555; margin-top: 4px; }
    .header .meta { font-size: 8pt; color: #888; margin-top: 8px; }
    .section-title { font-size: 13pt; font-weight: 700; color: #1a1a2e; margin: 18px 0 8px; border-left: 4px solid #1a1a2e; padding-left: 10px; }
    .card { border: 1px solid #ddd; border-radius: 6px; padding: 14px; margin-bottom: 14px; page-break-inside: avoid; }
    .card-title { font-size: 11pt; font-weight: 700; margin-bottom: 6px; }
    .card-badge { display: inline-block; background: #f0f0f0; border-radius: 10px; padding: 2px 8px; font-size: 8pt; margin-right: 4px; }
    .card-badge.destructive { background: #fee2e2; color: #991b1b; }
    .card-badge.success { background: #dcfce7; color: #166534; }
    .card-badge.warning { background: #fef3c7; color: #92400e; }
    .card-badge.info { background: #dbeafe; color: #1e40af; }
    .card-body { font-size: 10pt; color: #333; white-space: pre-line; }
    .evidence-list { margin: 8px 0; padding-left: 0; list-style: none; }
    .evidence-list li { font-size: 9pt; color: #444; padding: 3px 0; padding-left: 14px; position: relative; }
    .evidence-list li::before { content: "›"; position: absolute; left: 0; color: #1a1a2e; font-weight: bold; }
    .comparativo { background: #f8f9fa; border: 1px solid #e2e8f0; border-radius: 4px; padding: 8px 10px; margin: 8px 0; font-size: 9pt; }
    .comparativo strong { color: #1a1a2e; }
    .tags { margin-top: 8px; }
    .tag { display: inline-block; border: 1px solid #ccc; border-radius: 10px; padding: 1px 8px; font-size: 8pt; margin: 2px 2px; color: #555; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .stat-card { text-align: center; border: 1px solid #ddd; border-radius: 6px; padding: 10px; }
    .stat-value { font-size: 16pt; font-weight: 700; }
    .stat-label { font-size: 8pt; color: #888; }
    .stat-change { font-size: 8pt; }
    .stat-change.negative { color: #dc2626; }
    .stat-change.positive { color: #16a34a; }
    table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 9pt; }
    th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
    th { background: #f5f5f5; font-weight: 600; }
    .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #ccc; font-size: 8pt; color: #888; text-align: center; }
    @media print {
      .no-print { display: none !important; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${section.titulo}</h1>
    ${section.subtitulo ? `<div class="subtitle">${section.subtitulo}</div>` : ''}
    <div class="meta">Sistema de Monitoramento CERD IV — Gerado em ${section.dataGeracao}</div>
  </div>
  ${section.conteudo}
  <div class="footer">
    Sistema de Monitoramento do IV Relatório CERD do Brasil — Documento gerado automaticamente em ${section.dataGeracao}
  </div>
  ${getExportToolbarHTML(section.titulo.replace(/\s+/g, '-'))}
</body>
</html>`;

  const win = window.open('', '_blank');
  if (win) {
    win.document.write(html);
    win.document.close();
  }
}

// Helpers for building HTML content

export function cardHTML(title: string, body: string, badge?: { text: string; type?: string }, extras?: string): string {
  const badgeClass = badge?.type || '';
  return `
    <div class="card">
      <div class="card-title">
        ${badge ? `<span class="card-badge ${badgeClass}">${badge.text}</span> ` : ''}${title}
      </div>
      <div class="card-body">${body}</div>
      ${extras || ''}
    </div>`;
}

export function evidenceListHTML(items: string[]): string {
  if (items.length === 0) return '';
  return `<ul class="evidence-list">${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
}

export function tagsHTML(tags: string[]): string {
  if (tags.length === 0) return '';
  return `<div class="tags">${tags.map(t => `<span class="tag">${t}</span>`).join('')}</div>`;
}

export function sectionTitleHTML(title: string): string {
  return `<div class="section-title">${title}</div>`;
}

export function statCardHTML(label: string, value: string, change?: string, changeType?: 'positive' | 'negative'): string {
  return `
    <div class="stat-card">
      <div class="stat-label">${label}</div>
      <div class="stat-value">${value}</div>
      ${change ? `<div class="stat-change ${changeType || ''}">${change}</div>` : ''}
    </div>`;
}

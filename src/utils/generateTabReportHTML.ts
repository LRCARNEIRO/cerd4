/**
 * Generates a generic HTML report from the currently rendered tab content.
 * Used by ExportTabButtons for sub-tabs that display data inline.
 */
import { getExportToolbarHTML } from '@/utils/reportExportToolbar';

interface TabReportOptions {
  title: string;
  subtitle?: string;
  date?: string;
  content: string;
  fileName?: string;
}

export function generateTabReportHTML(opts: TabReportOptions): string {
  const now = opts.date || new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const safeName = opts.fileName || opts.title.replace(/[^a-zA-Z0-9_-]/g, '_');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${opts.title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4; margin: 2cm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Open Sans', sans-serif; font-size: 10.5pt; line-height: 1.65; color: #1a1a2e; max-width: 21cm; margin: 0 auto; padding: 2cm; background: white; }
    .header { text-align: center; margin-bottom: 1.5cm; border-bottom: 3px solid #1e3a5f; padding-bottom: 1cm; }
    .header h1 { font-family: 'Merriweather', serif; font-size: 16pt; font-weight: 700; color: #1e3a5f; }
    .header .subtitle { font-size: 12pt; margin-top: 0.3cm; color: #2c5282; }
    .header .date { font-size: 10pt; margin-top: 0.3cm; font-style: italic; color: #64748b; }
    h2 { font-family: 'Merriweather', serif; font-size: 13pt; font-weight: 700; margin-top: 1.2cm; margin-bottom: 0.4cm; color: #1e3a5f; border-bottom: 2px solid #c7a82b; padding-bottom: 0.2cm; }
    h3 { font-size: 11pt; font-weight: 700; margin-top: 0.8cm; margin-bottom: 0.3cm; color: #2c5282; }
    h4 { font-size: 10.5pt; font-weight: 600; margin-top: 0.5cm; margin-bottom: 0.2cm; color: #334155; }
    p { text-align: justify; margin-bottom: 0.3cm; }
    table { width: 100%; border-collapse: collapse; margin: 0.5cm 0; font-size: 9.5pt; }
    th, td { border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; }
    th { background: linear-gradient(135deg, #1e3a5f 0%, #2c5282 100%); color: white; font-weight: 600; }
    tr:nth-child(even) { background: #f8fafc; }
    .highlight-box { background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); padding: 0.6cm; margin: 0.4cm 0; border-left: 4px solid #1e3a5f; border-radius: 0 8px 8px 0; }
    .data-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.4cm; margin: 0.4cm 0; }
    .data-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.5cm; text-align: center; }
    .data-card-value { font-size: 18pt; font-weight: 700; color: #1e3a5f; }
    .data-card-label { font-size: 8pt; color: #64748b; margin-top: 0.15cm; }
    ul, ol { margin-left: 1cm; margin-bottom: 0.3cm; }
    li { margin-bottom: 0.1cm; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 8.5pt; font-weight: 600; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .footer { margin-top: 1.5cm; padding-top: 0.8cm; border-top: 2px solid #1e3a5f; font-size: 8pt; text-align: center; color: #64748b; }
    @media print { .export-toolbar, .print-instructions { display: none !important; } body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>${opts.title}</h1>
    ${opts.subtitle ? `<div class="subtitle">${opts.subtitle}</div>` : ''}
    <div class="date">Gerado em: ${now}</div>
  </div>

  ${opts.content}

  <div class="footer">
    <p>Sistema de Subsídios CERD IV — Gerado em ${now}</p>
  </div>
  ${getExportToolbarHTML(safeName)}
</body>
</html>`;
}

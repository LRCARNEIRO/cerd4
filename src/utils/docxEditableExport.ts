/**
 * Generates editable .doc files using the Microsoft Word HTML format.
 * Unlike the image-based approach, this preserves text, tables, and formatting
 * as fully editable Word content. Charts/SVGs are converted to inline images.
 */

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
}

/** Convert all SVGs in a cloned DOM to inline PNG images */
function convertSvgsToImages(container: HTMLElement): void {
  const svgs = Array.from(container.querySelectorAll('svg'));
  svgs.forEach((svg) => {
    try {
      const vb = svg.getAttribute('viewBox');
      const w = parseInt(svg.getAttribute('width') || (vb ? vb.split(' ')[2] : '400'));
      const h = parseInt(svg.getAttribute('height') || (vb ? vb.split(' ')[3] : '200'));
      const canvas = document.createElement('canvas');
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        ctx.scale(2, 2);
        try { ctx.drawImage(img, 0, 0, w, h); } catch { /* cross-origin fallback */ }
        const imgEl = document.createElement('img');
        imgEl.src = canvas.toDataURL('image/png');
        imgEl.style.cssText = `width:${w}px;max-width:100%;height:auto;`;
        svg.parentNode?.replaceChild(imgEl, svg);
      }
    } catch (e) {
      console.warn('SVG conversion error:', e);
    }
  });
}

/** Extract inline styles from computed styles for key elements */
function getDocStyles(): string {
  const styles: string[] = [];
  const styleSheets = document.querySelectorAll('style');
  styleSheets.forEach((s) => {
    let text = s.textContent || '';
    // Remove print-only and @page rules
    text = text.replace(/@media\s+print\s*\{[^}]*\}/g, '');
    text = text.replace(/@page\s*\{[^}]*\}/g, '');
    styles.push(text);
  });
  return styles.join('\n');
}

/** Build an MS Word-compatible HTML document from an HTML string */
function buildWordHtml(bodyHtml: string, title: string): string {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="UTF-8">
<meta name="ProgId" content="Word.Document">
<meta name="Generator" content="CERD IV System">
<!--[if gte mso 9]>
<xml><w:WordDocument><w:View>Print</w:View></w:WordDocument></xml>
<![endif]-->
<title>${title}</title>
<style>
  @page { size: A4; margin: 2cm; }
  body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; font-size: 11pt; line-height: 1.5; color: #1a1a2e; max-width: none; padding: 0; }
  h1 { font-size: 18pt; color: #0f3460; border-bottom: 2px solid #0f3460; padding-bottom: 6px; }
  h2 { font-size: 15pt; color: #16213e; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-top: 18pt; }
  h3 { font-size: 13pt; color: #0f3460; margin-top: 14pt; }
  h4 { font-size: 11pt; color: #333; margin-top: 10pt; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; font-size: 9pt; }
  th { background: #0f3460; color: white; padding: 5px 7px; text-align: left; font-weight: 600; }
  td { padding: 4px 7px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  img { max-width: 100%; height: auto; }
  .data-grid, .kpi-grid { display: block; }
  .data-card, .kpi { display: inline-block; width: 23%; margin: 4px; vertical-align: top; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px; text-align: center; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 8pt; font-weight: 600; }
  .source { font-size: 8pt; color: #94a3b8; font-style: italic; }
</style>
</head>
<body>${bodyHtml}</body></html>`;
}

/** Download editable .doc from a rendered DOM element */
export async function downloadElementAsEditableDoc(element: HTMLElement, fileName: string) {
  const clone = element.cloneNode(true) as HTMLElement;
  
  // Remove export-ignore elements and toolbars
  clone.querySelectorAll('[data-export-ignore="true"]').forEach((n) => n.remove());
  clone.querySelectorAll('.export-toolbar, .print-instructions').forEach((n) => n.remove());
  
  // Convert SVGs to images
  convertSvgsToImages(clone);
  
  const docContent = buildWordHtml(clone.innerHTML, fileName.replace(/-/g, ' '));
  
  const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${sanitizeFileName(fileName)}.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** Download editable .doc from an HTML string */
export async function downloadHtmlAsEditableDoc(html: string, fileName: string) {
  // Render in hidden iframe to get computed content and convert SVGs
  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-20000px;top:0;width:1440px;height:9000px;opacity:0;pointer-events:none;';
  document.body.appendChild(iframe);

  try {
    await new Promise<void>((resolve) => {
      iframe.onload = () => resolve();
      iframe.srcdoc = html;
    });

    const iframeDoc = iframe.contentDocument;
    if (!iframeDoc) throw new Error('Falha ao preparar o conteúdo do documento.');

    // Wait for fonts/images
    if (iframeDoc.fonts?.ready) {
      try { await iframeDoc.fonts.ready; } catch { /* ignore */ }
    }
    await new Promise((r) => requestAnimationFrame(() => r(null)));

    // Remove toolbars
    iframeDoc.querySelector('.export-toolbar')?.remove();
    iframeDoc.querySelector('.print-instructions')?.remove();

    const target = (iframeDoc.querySelector('.export-captured-content') || iframeDoc.querySelector('main') || iframeDoc.body) as HTMLElement;
    
    // Convert SVGs
    convertSvgsToImages(target);

    const docContent = buildWordHtml(target.innerHTML, fileName.replace(/-/g, ' '));
    
    const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sanitizeFileName(fileName)}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  } finally {
    iframe.remove();
  }
}

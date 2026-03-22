/**
 * Injects a floating toolbar with PDF and DOCX export buttons into generated HTML reports.
 * Call getExportToolbarHTML() to get the CSS + HTML + JS to insert before </body>.
 * Call injectExportToolbar() to inject toolbar into an existing HTML string.
 */
import { toast } from 'sonner';

/**
 * Convert SVG elements in HTML to inline PNG data-URIs for Word compatibility.
 * Word cannot render SVGs, so we convert them to canvas-based images.
 */
async function convertSvgsToImages(html: string): Promise<string> {
  // Create a temporary container to parse HTML
  const container = document.createElement('div');
  container.innerHTML = html;
  
  const svgs = container.querySelectorAll('svg');
  
  for (const svg of Array.from(svgs)) {
    try {
      // Get SVG dimensions
      const width = parseInt(svg.getAttribute('width') || svg.getAttribute('viewBox')?.split(' ')[2] || '600');
      const height = parseInt(svg.getAttribute('height') || svg.getAttribute('viewBox')?.split(' ')[3] || '300');
      
      // Serialize SVG to string
      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      // Draw to canvas
      const canvas = document.createElement('canvas');
      canvas.width = width * 2; // 2x for retina quality
      canvas.height = height * 2;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0, width, height);
            resolve();
          };
          img.onerror = reject;
          img.src = url;
        });
        
        const dataUri = canvas.toDataURL('image/png');
        const imgEl = document.createElement('img');
        imgEl.src = dataUri;
        imgEl.style.cssText = `width:${width}px;max-width:100%;height:auto;`;
        imgEl.alt = 'Gráfico';
        svg.parentNode?.replaceChild(imgEl, svg);
      }
      
      URL.revokeObjectURL(url);
    } catch (e) {
      // If conversion fails, leave SVG as-is (will be blank in Word but won't crash)
      console.warn('SVG conversion failed:', e);
    }
  }
  
  return container.innerHTML;
}

/** Download any HTML string as a .doc file, converting SVGs to images first */
export async function downloadAsDocx(html: string, fileName: string) {
  try {
    toast.info('Convertendo gráficos para DOCX...', { duration: 2000 });
    
    // Parse out body content and styles
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    
    let bodyContent = bodyMatch ? bodyMatch[1] : html;
    let styles = '';
    if (styleMatch) {
      styles = styleMatch.map(s => {
        const inner = s.replace(/<\/?style[^>]*>/gi, '');
        // Remove @media print and @page and export-toolbar for DOCX
        return inner
          .replace(/@media\s+print\s*\{[^}]*\}/g, '')
          .replace(/@page\s*\{[^}]*\}/g, '')
          .replace(/\.export-toolbar[\s\S]*?\}/g, '');
      }).join('\n');
    }
    
    // Remove toolbar from body
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = bodyContent;
    const toolbar = tempDiv.querySelector('.export-toolbar');
    if (toolbar) toolbar.remove();
    const printInstructions = tempDiv.querySelector('.print-instructions');
    if (printInstructions) printInstructions.remove();
    
    // Convert SVGs to images
    const convertedBody = await convertSvgsToImages(tempDiv.innerHTML);
    
    // Build Word-compatible HTML
    const docContent = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:w="urn:schemas-microsoft-com:office:word" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="UTF-8">
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    ${styles}
    /* DOCX-specific overrides */
    body { max-width: none; padding: 0; }
    .data-grid { display: block; }
    .data-card { display: inline-block; width: 30%; margin: 4px; vertical-align: top; }
    .two-col { display: block; }
    .chart-container { page-break-inside: avoid; }
    img { max-width: 100%; }
  </style>
</head>
<body>${convertedBody}</body>
</html>`;
    
    const blob = new Blob(['\ufeff' + docContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/[^a-zA-Z0-9_-]/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    toast.success('Documento DOCX gerado com sucesso');
  } catch (e) {
    console.error('DOCX generation error:', e);
    toast.error('Erro ao gerar documento DOCX');
  }
}

export function injectExportToolbar(html: string, fileName: string = 'relatorio'): string {
  const toolbar = getExportToolbarHTML(fileName);
  if (html.includes('</body>')) {
    return html.replace('</body>', toolbar + '\n</body>');
  }
  return html + toolbar;
}

export function getExportToolbarHTML(fileName: string = 'relatorio'): string {
  const safeFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');

  return `
  <style>
    .export-toolbar {
      position: fixed;
      top: 16px;
      right: 16px;
      display: flex;
      gap: 8px;
      z-index: 9999;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 8px 12px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.12);
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    .export-toolbar button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
      font-family: inherit;
    }
    .export-toolbar button:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .export-toolbar .btn-pdf {
      background: #dc2626;
      color: white;
      border-color: #dc2626;
    }
    .export-toolbar .btn-pdf:hover { background: #b91c1c; }
    .export-toolbar .btn-docx {
      background: #2563eb;
      color: white;
      border-color: #2563eb;
    }
    .export-toolbar .btn-docx:hover { background: #1d4ed8; }
    .export-toolbar .btn-print {
      background: #f8fafc;
      color: #334155;
    }
    .export-toolbar .btn-print:hover { background: #f1f5f9; }
    @media print {
      .export-toolbar { display: none !important; }
    }
  </style>

  <div class="export-toolbar no-print">
    <button class="btn-pdf" onclick="exportPDF()" title="Salvar como PDF (via impressão)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
      Salvar PDF
    </button>
    <button class="btn-docx" onclick="exportDOCX()" title="Baixar como documento Word (.docx)">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
      Salvar DOCX
    </button>
  </div>

  <script>
    function exportPDF() {
      window.print();
    }

    function exportDOCX() {
      var btn = document.querySelector('.btn-docx');
      var origText = btn.innerHTML;
      btn.innerHTML = '⏳ Gerando...';
      btn.disabled = true;

      try {
        // Clone the document body, removing the toolbar
        var clone = document.body.cloneNode(true);
        var toolbar = clone.querySelector('.export-toolbar');
        if (toolbar) toolbar.remove();
        var printInst = clone.querySelector('.print-instructions');
        if (printInst) printInst.remove();

        // Convert SVGs to canvas images
        var svgs = clone.querySelectorAll('svg');
        svgs.forEach(function(svg) {
          try {
            var vb = svg.getAttribute('viewBox');
            var w = parseInt(svg.getAttribute('width') || (vb ? vb.split(' ')[2] : '400'));
            var h = parseInt(svg.getAttribute('height') || (vb ? vb.split(' ')[3] : '200'));
            var canvas = document.createElement('canvas');
            canvas.width = w * 2;
            canvas.height = h * 2;
            var ctx = canvas.getContext('2d');
            if (ctx) {
              var svgData = new XMLSerializer().serializeToString(svg);
              var img = new Image();
              img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
              ctx.scale(2, 2);
              ctx.drawImage(img, 0, 0, w, h);
              var imgEl = document.createElement('img');
              imgEl.src = canvas.toDataURL('image/png');
              imgEl.style.cssText = 'width:' + w + 'px;max-width:100%;height:auto;';
              svg.parentNode.replaceChild(imgEl, svg);
            }
          } catch(e) { console.warn('SVG conv err', e); }
        });

        // Get all styles
        var styles = '';
        var styleSheets = document.querySelectorAll('style');
        styleSheets.forEach(function(s) {
          var text = s.textContent || '';
          text = text.replace(/@media\\s+print\\s*\\{[^}]*\\}/g, '');
          text = text.replace(/@page\\s*\\{[^}]*\\}/g, '');
          styles += text;
        });

        var docContent = '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>' + styles + ' body{max-width:none;padding:0;} .data-grid{display:block;} .data-card{display:inline-block;width:30%;margin:4px;vertical-align:top;} img{max-width:100%;}</style></head><body>' + clone.innerHTML + '</body></html>';

        var blob = new Blob(['\\ufeff' + docContent], { type: 'application/msword' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = '${safeFileName}.doc';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function() { URL.revokeObjectURL(url); }, 5000);
      } catch(e) {
        alert('Erro ao gerar DOCX: ' + e.message);
      } finally {
        btn.innerHTML = origText;
        btn.disabled = false;
      }
    }
  </script>`;
}

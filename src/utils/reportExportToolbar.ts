/**
 * Injects a floating toolbar with PDF and DOCX export buttons into generated HTML reports.
 * Call getExportToolbarHTML() to get the CSS + HTML + JS to insert before </body>.
 * Call injectExportToolbar() to inject toolbar into an existing HTML string.
 */
import { toast } from 'sonner';
import { downloadElementAsEditableDoc, downloadHtmlAsEditableDoc } from '@/utils/docxEditableExport';
import { createExportClone } from '@/utils/exportLayoutSnapshot';

function getCurrentDocumentHeadMarkup(): string {
  const styleTags = Array.from(document.querySelectorAll('style'))
    .map((style) => style.outerHTML)
    .join('\n');

  const stylesheetLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
    .map((link) => link.outerHTML)
    .join('\n');

  return `${stylesheetLinks}\n${styleTags}`;
}

/** Resolve CSS custom properties to computed values for standalone HTML export */
function getResolvedCssVariables(): string {
  const root = document.documentElement;
  const computed = getComputedStyle(root);
  const vars: string[] = [];
  
  // Collect all CSS custom properties from :root
  const knownVars = [
    '--background', '--foreground', '--card', '--card-foreground',
    '--popover', '--popover-foreground', '--primary', '--primary-foreground',
    '--secondary', '--secondary-foreground', '--muted', '--muted-foreground',
    '--accent', '--accent-foreground', '--destructive', '--destructive-foreground',
    '--border', '--input', '--ring',
    '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5',
    '--sidebar-background', '--sidebar-foreground',
  ];
  
  knownVars.forEach((v) => {
    const val = computed.getPropertyValue(v).trim();
    if (val) {
      vars.push(`  ${v}: ${val};`);
    }
  });
  
  if (vars.length === 0) return '';
  return `:root {\n${vars.join('\n')}\n}`;
}

export function buildExportHtmlFromElement(target: HTMLElement, fileName: string, title?: string): string {
  const clone = createExportClone(target);

  // Resolve CSS variables on original SVGs so they render correctly in standalone HTML
  const resolvedVars = getResolvedCssVariables();

  return `<!DOCTYPE html>
<html lang="pt-BR" class="${document.documentElement.className}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || fileName}</title>
  ${getCurrentDocumentHeadMarkup()}
  <style>
    ${resolvedVars}
    @page { size: A4; margin: 1.6cm; @bottom-center { content: counter(page); font-size: 9pt; color: #64748b; } }
    @page :first { @bottom-center { content: none; } }
    body {
      margin: 0;
      padding: 24px;
      background: hsl(var(--background));
      color: hsl(var(--foreground));
    }
    .export-captured-content {
      width: ${Math.max(1, Math.round(target.getBoundingClientRect().width || target.scrollWidth || 1440))}px;
      max-width: 100%;
      margin: 0 auto;
    }
    .export-captured-content img,
    .export-captured-content svg,
    .export-captured-content canvas {
      max-width: 100% !important;
      height: auto;
    }
    .export-captured-content table {
      width: 100% !important;
      table-layout: fixed;
    }
    @media print {
      .export-toolbar { display: none !important; }
      body { padding: 0; }
    }
  </style>
</head>
<body class="${document.body.className}">
  <main class="export-captured-content">${clone.outerHTML}</main>
  ${getExportToolbarHTML(fileName)}
</body>
</html>`;
}

export async function downloadRenderedElementAsDocx(element: HTMLElement, fileName: string) {
  try {
    toast.info('Gerando documento Word editável...', { duration: 2000 });
    await downloadElementAsEditableDoc(element, fileName);
    toast.success('Documento Word gerado com sucesso');
  } catch (e) {
    console.error('DOCX element generation error:', e);
    toast.error('Erro ao gerar documento Word');
  }
}

/** Download any HTML string as a .doc file preserving editable text and tables */
export async function downloadAsDocx(html: string, fileName: string) {
  try {
    toast.info('Gerando documento Word editável...', { duration: 2000 });
    await downloadHtmlAsEditableDoc(html, fileName);
    toast.success('Documento Word gerado com sucesso');
  } catch (e) {
    console.error('DOCX generation error:', e);
    toast.error('Erro ao gerar documento Word');
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
    <button class="btn-docx" onclick="exportDOCX()" title="Baixar como documento Word (.doc) editável">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6a2 2 0 0 0-2 2z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 18 15 15"/></svg>
      Salvar DOCX
    </button>
  </div>

  <script>
    function exportPDF() {
      window.print();
    }

    function resolveSvgColors(svg) {
      var allEls = svg.querySelectorAll('*');
      for (var i = 0; i < allEls.length; i++) {
        var el = allEls[i];
        var cs = getComputedStyle(el);
        var fill = el.getAttribute('fill');
        if (fill && fill.indexOf('var(') !== -1) {
          el.setAttribute('fill', cs.fill || fill);
        }
        var stroke = el.getAttribute('stroke');
        if (stroke && stroke.indexOf('var(') !== -1) {
          el.setAttribute('stroke', cs.stroke || stroke);
        }
        // Also inline CSS-only fills
        if (!fill && cs.fill && cs.fill !== 'none' && cs.fill !== 'rgb(0, 0, 0)') {
          el.setAttribute('fill', cs.fill);
        }
        if (!stroke && cs.stroke && cs.stroke !== 'none') {
          el.setAttribute('stroke', cs.stroke);
        }
        // Handle style properties
        if (el.style) {
          for (var j = 0; j < el.style.length; j++) {
            var prop = el.style[j];
            var val = el.style.getPropertyValue(prop);
            if (val && val.indexOf('var(') !== -1) {
              el.style.setProperty(prop, cs.getPropertyValue(prop));
            }
          }
        }
      }
    }

    function exportDOCX() {
      var btn = document.querySelector('.btn-docx');
      var origText = btn.innerHTML;
      btn.innerHTML = '⏳ Gerando...';
      btn.disabled = true;

      try {
        // Step 1: Resolve colors on original SVGs and collect their dimensions
        var origSvgs = document.querySelectorAll('svg');
        var svgDims = [];
        origSvgs.forEach(function(svg) {
          resolveSvgColors(svg);
          var rect = svg.getBoundingClientRect();
          var vb = svg.getAttribute('viewBox');
          var vbParts = vb ? vb.split(/[\\s,]+/) : [];
          var w = rect.width > 1 ? Math.round(rect.width) : (parseInt(svg.getAttribute('width')) || (vbParts[2] ? parseInt(vbParts[2]) : 400));
          var h = rect.height > 1 ? Math.round(rect.height) : (parseInt(svg.getAttribute('height')) || (vbParts[3] ? parseInt(vbParts[3]) : 240));
          svgDims.push({ w: Math.min(w, 660), h: Math.round(Math.min(w, 660) * h / Math.max(w, 1)) });
        });

        // Step 2: Clone AFTER resolving
        var clone = document.body.cloneNode(true);
        var toolbar = clone.querySelector('.export-toolbar');
        if (toolbar) toolbar.remove();
        var printInst = clone.querySelector('.print-instructions');
        if (printInst) printInst.remove();

        // Step 3: Convert cloned SVGs using pre-collected dimensions from originals
        var clonedSvgs = clone.querySelectorAll('svg');
        var idx = 0;
        // Convert SVGs to PNG images with proper async handling
        var svgPromises = [];
        clonedSvgs.forEach(function(svg) {
          var dims = svgDims[idx] || { w: 400, h: 240 };
          idx++;
          var w = dims.w;
          var h = dims.h;
          var promise = new Promise(function(resolve) {
            try {
              var canvas = document.createElement('canvas');
              canvas.width = w * 2;
              canvas.height = h * 2;
              var ctx = canvas.getContext('2d');
              if (ctx) {
                svg.setAttribute('width', w);
                svg.setAttribute('height', h);
                if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                var svgData = new XMLSerializer().serializeToString(svg);
                var img = new Image();
                img.onload = function() {
                  ctx.scale(2, 2);
                  ctx.drawImage(img, 0, 0, w, h);
                  var imgEl = document.createElement('img');
                  imgEl.src = canvas.toDataURL('image/png');
                  imgEl.setAttribute('width', w);
                  imgEl.setAttribute('height', h);
                  imgEl.style.cssText = 'display:block;width:' + w + 'px;height:' + h + 'px;max-width:100%;object-fit:contain;page-break-inside:avoid;';
                  svg.parentNode.replaceChild(imgEl, svg);
                  resolve();
                };
                img.onerror = function() { resolve(); };
                img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
              } else { resolve(); }
            } catch(e) { console.warn('SVG conv err', e); resolve(); }
          });
          svgPromises.push(promise);
        });

        Promise.all(svgPromises).then(function() {
        var docContent = '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>@page{size:A4;margin:2cm} body{font-family:Calibri,Arial,sans-serif;font-size:11pt;line-height:1.5;max-width:none;padding:0} h1{font-size:18pt;color:#0f3460;border-bottom:2px solid #0f3460;padding-bottom:6px} h2{font-size:15pt;color:#16213e;border-bottom:1px solid #e2e8f0;margin-top:18pt} h3{font-size:13pt;color:#0f3460;margin-top:14pt} table{width:100%;border-collapse:collapse;margin:8px 0;font-size:9pt} th{background:#0f3460;color:white;padding:5px 7px;text-align:left} td{padding:4px 7px;border-bottom:1px solid #e2e8f0} tr:nth-child(even){background:#f8fafc} img{display:block;max-width:660px;height:auto;object-fit:contain}</style></head><body>' + clone.innerHTML + '</body></html>';

          var blob = new Blob(['\\ufeff' + docContent], { type: 'application/msword' });
          var url = URL.createObjectURL(blob);
          var a = document.createElement('a');
          a.href = url;
          a.download = '${safeFileName}.doc';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(function() { URL.revokeObjectURL(url); }, 5000);
          btn.innerHTML = origText;
          btn.disabled = false;
        }).catch(function(e) {
          alert('Erro ao gerar DOCX: ' + e.message);
          btn.innerHTML = origText;
          btn.disabled = false;
        });
      } catch(e) {
        alert('Erro ao gerar DOCX: ' + e.message);
        btn.innerHTML = origText;
        btn.disabled = false;
      }
    }
  </script>`;
}

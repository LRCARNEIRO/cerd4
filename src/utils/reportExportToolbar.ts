/**
 * Injects a floating toolbar with PDF and DOCX export buttons into generated HTML reports.
 * Call getExportToolbarHTML() to get the CSS + HTML + JS to insert before </body>.
 * Call injectExportToolbar() to inject toolbar into an existing HTML string.
 */

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

        // Get all styles
        var styles = '';
        var styleSheets = document.querySelectorAll('style');
        styleSheets.forEach(function(s) {
          var text = s.textContent || '';
          // Remove @media print and @page rules for DOCX
          text = text.replace(/@media\\s+print\\s*\\{[^}]*\\}/g, '');
          text = text.replace(/@page\\s*\\{[^}]*\\}/g, '');
          styles += text;
        });

        var docContent = '<!DOCTYPE html><html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>' + styles + '</style></head><body>' + clone.innerHTML + '</body></html>';

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

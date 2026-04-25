import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Download, Loader2 } from 'lucide-react';

interface ExportTabButtonsProps {
  /** Function that generates the HTML content for export */
  generateHTML?: () => string;
  /** Optional DOM target selector to export exactly the rendered content */
  targetSelector?: string;
  /** Base filename for the export (no extension) */
  fileName: string;
  /** Optional label override */
  label?: string;
  /** Compact mode — smaller buttons */
  compact?: boolean;
}

/**
 * Reusable export buttons (PDF/HTML + DOCX) for any tab.
 * Pass a generateHTML function and fileName.
 */
export function ExportTabButtons({ generateHTML, targetSelector, fileName, label, compact }: ExportTabButtonsProps) {
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [generatingDocx, setGeneratingDocx] = useState(false);

  const resolveHtml = async () => {
    if (targetSelector) {
      const target = document.querySelector<HTMLElement>(targetSelector);
      if (target) {
        const { buildExportHtmlFromElement } = await import('@/utils/reportExportToolbar');
        return buildExportHtmlFromElement(target, fileName, fileName.replace(/-/g, ' '));
      }
    }

    if (!generateHTML) {
      throw new Error('Nenhum conteúdo de exportação foi configurado.');
    }

    return generateHTML();
  };

  const handlePdfHtml = async () => {
    setGeneratingPdf(true);
    try {
      const html = await resolveHtml();
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      window.open(URL.createObjectURL(blob), '_blank');
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleDocx = async () => {
    setGeneratingDocx(true);
    try {
      const { downloadAsDocx, downloadRenderedElementAsDocx } = await import('@/utils/reportExportToolbar');
      if (targetSelector) {
        const target = document.querySelector<HTMLElement>(targetSelector);
        if (target) {
          await downloadRenderedElementAsDocx(target, fileName);
          return;
        }
      }

      const html = await resolveHtml();
      await downloadAsDocx(html, fileName);
    } finally {
      setGeneratingDocx(false);
    }
  };

  const size = compact ? 'sm' : 'default';

  return (
    <div className="flex gap-2">
      <Button size={size} className="gap-1.5" onClick={handlePdfHtml} disabled={generatingPdf}>
        {generatingPdf ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
        {label ? `${label} PDF/HTML` : 'PDF / HTML'}
      </Button>
      <Button size={size} variant="outline" className="gap-1.5" onClick={handleDocx} disabled={generatingDocx}>
        {generatingDocx ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        DOCX
      </Button>
    </div>
  );
}

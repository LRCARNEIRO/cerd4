import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { BookOpen, Download, Loader2 } from 'lucide-react';
import { generateMetodologiaDetalhadaHTML } from './generateMetodologiaDetalhadaHTML';

/**
 * Baixa/abre a metodologia COMPLETA (fórmulas, explicações para leigos,
 * exemplos e classificação). Complementa o resumo do MethodologyPanel.
 */
export function MetodologiaDetalhadaButton({ compact = true }: { compact?: boolean }) {
  const [gerando, setGerando] = useState(false);

  const abrirHtml = () => {
    const html = generateMetodologiaDetalhadaHTML();
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    window.open(URL.createObjectURL(blob), '_blank');
  };

  const baixarDocx = async () => {
    setGerando(true);
    try {
      const { downloadAsDocx } = await import('@/utils/reportExportToolbar');
      await downloadAsDocx(generateMetodologiaDetalhadaHTML(), 'metodologia-detalhada-esforco-impacto');
    } finally {
      setGerando(false);
    }
  };

  const size = compact ? 'sm' : 'default';

  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="outline" size={size} className="gap-1.5 text-xs" onClick={abrirHtml}>
        <BookOpen className="w-3.5 h-3.5" />
        Metodologia detalhada (PDF/HTML)
      </Button>
      <Button variant="ghost" size={size} className="gap-1.5 text-xs" onClick={baixarDocx} disabled={gerando}>
        {gerando ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
        DOCX
      </Button>
    </div>
  );
}

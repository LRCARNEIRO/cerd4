/**
 * Botão compacto que gera o relatório HTML de UMA recomendação
 * (mesmo conteúdo que cada arquivo do .zip "Baixar TODOS"), para
 * uso na própria linha da tabela de Recomendações.
 *
 * Reusa `generateRecomendacaoAuditHTML` e `buildExportLookups` —
 * zero divergência em relação ao acumulador geral.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateRecomendacaoAuditHTML } from './generateRecomendacaoAuditHTML';
import { buildExportLookups, safeFileName, triggerDownload } from './recomendacaoExportShared';
import type { RecomendacaoDiagnostic } from '@/hooks/useDiagnosticSensor';

interface Props {
  recomendacao: any;
  diagnostic: RecomendacaoDiagnostic | undefined;
  rawIndicadores: any[];
  rawOrcamento: any[];
  rawNormativos: any[];
  disabled?: boolean;
  variant?: 'icon' | 'button';
}

export function ExportSingleRecomendacaoButton({
  recomendacao, diagnostic, rawIndicadores, rawOrcamento, rawNormativos, disabled, variant = 'icon',
}: Props) {
  const [busy, setBusy] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!recomendacao) return;
    setBusy(true);
    try {
      const lookups = buildExportLookups(rawIndicadores || [], rawOrcamento || [], rawNormativos || []);
      const html = generateRecomendacaoAuditHTML({
        recomendacao,
        diagnostic,
        ...lookups,
      });
      const fileName = `paragrafo-${safeFileName(recomendacao.paragrafo)}-${safeFileName(recomendacao.tema)}.html`;
      triggerDownload(new Blob([html], { type: 'text/html;charset=utf-8' }), fileName);
      toast.success(`Relatório §${recomendacao.paragrafo} gerado.`);
    } catch (err: any) {
      console.error('[ExportSingle]', err);
      toast.error(`Falha ao gerar relatório: ${err?.message || err}`);
    } finally {
      setBusy(false);
    }
  };

  if (variant === 'icon') {
    return (
      <Button
        size="icon"
        variant="ghost"
        onClick={handleClick}
        disabled={disabled || busy}
        title={`Baixar relatório HTML — §${recomendacao.paragrafo}`}
        className="h-7 w-7"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
      </Button>
    );
  }

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={disabled || busy} className="gap-1.5">
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      Baixar relatório
    </Button>
  );
}

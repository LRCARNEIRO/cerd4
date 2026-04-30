/**
 * Botão que gera 1 relatório HTML por recomendação (mesmo layout do
 * Farol Drilldown) e empacota tudo em um único .zip.
 *
 * Reusa as evidências já vinculadas pelo SSoT (`diagnosticMap`),
 * garantindo paridade exata com o popup de gerenciamento de evidências.
 */
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Archive, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateRecomendacaoAuditHTML } from './generateRecomendacaoAuditHTML';
import type { RecomendacaoDiagnostic } from '@/hooks/useDiagnosticSensor';
import { buildExportLookups, safeFileName, triggerDownload } from './recomendacaoExportShared';

interface Props {
  recomendacoes: any[];
  diagnosticMap: Map<string, RecomendacaoDiagnostic>;
  rawIndicadores: any[];
  rawOrcamento: any[];
  rawNormativos: any[];
  disabled?: boolean;
}

export function ExportAllRecomendacoesButton({
  recomendacoes, diagnosticMap, rawIndicadores, rawOrcamento, rawNormativos, disabled,
}: Props) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!recomendacoes?.length) return;
    setBusy(true);
    try {
      const { indicadorIdByNome, indicadorCodigoByNome, normativoMetaByTitulo, orcamentoMetaByKey, origin } =
        buildExportLookups(rawIndicadores || [], rawOrcamento || [], rawNormativos || []);

      console.time('[ExportAll] total');
      console.log('[ExportAll] start', {
        recomendacoes: recomendacoes.length,
        diagnosticMapSize: diagnosticMap?.size,
        rawIndicadores: rawIndicadores?.length,
        rawOrcamento: rawOrcamento?.length,
        rawNormativos: rawNormativos?.length,
      });

      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      // Index file
      const indexRows: string[] = [];
      const errors: string[] = [];

      for (let i = 0; i < recomendacoes.length; i++) {
        const rec = recomendacoes[i];
        // Yield to the UI thread between iterations so the spinner repaints
        // and the browser does not appear "frozen" on slow devices.
        if (i % 3 === 0) await new Promise(r => setTimeout(r, 0));

        const diag = diagnosticMap.get(rec.id);
        let html = '';
        try {
          html = generateRecomendacaoAuditHTML({
            recomendacao: rec,
            diagnostic: diag,
            indicadorIdByNome,
            indicadorCodigoByNome,
            normativoMetaByTitulo,
            orcamentoMetaByKey,
            origin,
          });
        } catch (err: any) {
          const msg = `Falha em §${rec.paragrafo} (${rec.tema}): ${err?.message || err}`;
          console.error('[ExportAll]', msg, err);
          errors.push(msg);
          html = `<!DOCTYPE html><html><body><h1>Erro ao gerar relatório</h1><pre>${msg}</pre></body></html>`;
        }
        const fileName = `paragrafo-${safeFileName(rec.paragrafo || String(i))}-${safeFileName(rec.tema || 'sem-tema')}.html`;
        zip.file(fileName, html);

        const status = diag?.statusComputado || rec.status_cumprimento;
        const statusLabel = status === 'cumprido' ? 'Cumprida' : status === 'parcialmente_cumprido' || status === 'em_andamento' ? 'Parcial' : 'Não Cumprida';
        indexRows.push(`<tr>
          <td style="font-family:monospace">§${rec.paragrafo}</td>
          <td>${rec.tema}</td>
          <td>${statusLabel}</td>
          <td>${diag?.linkedIndicadores?.length || 0}</td>
          <td>${diag?.linkedNormativos?.length || 0}</td>
          <td>${diag?.linkedOrcamento?.length || 0}</td>
          <td><a href="./${fileName}" style="color:#2563eb">Abrir</a></td>
        </tr>`);
      }

      const indexHtml = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Índice — Auditoria das Recomendações ONU</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:1200px;margin:2rem auto;padding:0 2rem;color:#1e293b}
  h1{font-size:20px;border-bottom:3px solid #1e40af;padding-bottom:8px}
  table{width:100%;border-collapse:collapse;margin-top:1rem}
  th,td{border:1px solid #e2e8f0;padding:6px 10px;font-size:12px;text-align:left}
  th{background:#f1f5f9}
  tr:nth-child(even) td{background:#fafafa}
</style></head><body>
<h1>📋 Índice — Auditoria das Recomendações ONU</h1>
<p style="font-size:11px;color:#64748b">${recomendacoes.length} recomendações · Gerado em ${new Date().toLocaleString('pt-BR')}</p>
<p style="font-size:11px;color:#64748b">Cada recomendação possui um relatório HTML individual com Indicadores, Normativos e Orçamento vinculados (mesmo layout do Farol Drilldown). Clique em "Abrir" para visualizar.</p>
<table>
  <thead><tr><th>§</th><th>Tema</th><th>Status</th><th>📊 Ind.</th><th>⚖️ Norm.</th><th>💰 Orç.</th><th>Relatório</th></tr></thead>
  <tbody>${indexRows.join('')}</tbody>
</table>
</body></html>`;
      zip.file('00-INDICE.html', indexHtml);

      console.log('[ExportAll] generating zip blob…', { files: Object.keys(zip.files).length, errors: errors.length });
      const blob = await zip.generateAsync({ type: 'blob' }, (meta) => {
        if (Math.round(meta.percent) % 20 === 0) {
          console.log(`[ExportAll] zip ${meta.percent.toFixed(0)}% — ${meta.currentFile || ''}`);
        }
      });
      console.log('[ExportAll] blob ready', { size: blob.size });

      triggerDownload(blob, `auditoria-recomendacoes-${new Date().toISOString().split('T')[0]}.zip`);

      console.timeEnd('[ExportAll] total');
      if (errors.length) {
        toast.warning(`${recomendacoes.length - errors.length}/${recomendacoes.length} relatórios gerados. ${errors.length} com erro — veja o console.`);
      } else {
        toast.success(`${recomendacoes.length} relatórios gerados em .zip`);
      }
    } catch (e: any) {
      console.error('[ExportAll] FATAL', e);
      toast.error(`Falha ao gerar .zip: ${e?.message || e}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={disabled || busy} className="gap-1.5">
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
      Baixar TODOS (.zip)
    </Button>
  );
}

/**
 * Botões de exportação por Artigo ICERD:
 *  - `ExportSingleArtigoButton`: gera UM HTML do Artigo informado.
 *  - `ExportAllArtigosButton`: empacota .zip com 1 HTML por Artigo
 *    (I-VII) + um índice no topo.
 *
 * Reusa `useDiagnosticSensor` para herdar exatamente o mesmo conjunto
 * de evidências usado em todas as demais visões.
 */
import { useState } from 'react';
import JSZip from 'jszip';
import { Button } from '@/components/ui/button';
import { Archive, FileDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateArtigoAuditHTML } from './generateArtigoAuditHTML';
import { ARTIGOS_CONVENCAO, type ArtigoConvencao } from '@/utils/artigosConvencao';
import {
  buildExportLookups,
  safeFileName,
  triggerDownload,
} from '@/components/recomendacoes/recomendacaoExportShared';
import type { RecomendacaoDiagnostic } from '@/hooks/useDiagnosticSensor';

interface CommonProps {
  recomendacoes: any[];
  diagnosticMap: Map<string, RecomendacaoDiagnostic>;
  rawIndicadores: any[];
  rawOrcamento: any[];
  rawNormativos: any[];
  disabled?: boolean;
}

export function ExportSingleArtigoButton({
  artigo, ...common
}: CommonProps & { artigo: ArtigoConvencao }) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      const lookups = buildExportLookups(common.rawIndicadores || [], common.rawOrcamento || [], common.rawNormativos || []);
      const html = generateArtigoAuditHTML({
        artigo,
        recomendacoes: common.recomendacoes || [],
        diagnosticMap: common.diagnosticMap,
        lookups,
      });
      triggerDownload(new Blob([html], { type: 'text/html;charset=utf-8' }), `artigo-${artigo}-icerd.html`);
      toast.success(`Relatório do Artigo ${artigo} gerado.`);
    } catch (err: any) {
      console.error('[ExportArtigo]', err);
      toast.error(`Falha ao gerar relatório do Artigo ${artigo}: ${err?.message || err}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={common.disabled || busy} className="gap-1.5">
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
      Baixar Artigo {artigo}
    </Button>
  );
}

export function ExportAllArtigosButton(common: CommonProps) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      console.time('[ExportAllArtigos] total');
      const lookups = buildExportLookups(common.rawIndicadores || [], common.rawOrcamento || [], common.rawNormativos || []);

      const zip = new JSZip();
      const indexRows: string[] = [];
      const errors: string[] = [];

      for (const def of ARTIGOS_CONVENCAO) {
        try {
          const html = generateArtigoAuditHTML({
            artigo: def.numero,
            recomendacoes: common.recomendacoes || [],
            diagnosticMap: common.diagnosticMap,
            lookups,
          });
          const fileName = `artigo-${def.numero}-${safeFileName(def.titulo)}.html`;
          zip.file(fileName, html);
          indexRows.push(`<tr>
            <td style="font-family:monospace;font-weight:600">Art. ${def.numero}</td>
            <td>${def.titulo}</td>
            <td><a href="./${fileName}" style="color:#2563eb">Abrir</a></td>
          </tr>`);
        } catch (err: any) {
          console.error('[ExportAllArtigos]', def.numero, err);
          errors.push(`Art. ${def.numero}: ${err?.message || err}`);
        }
      }

      const indexHtml = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Índice — Auditoria por Artigo ICERD</title>
<style>
  body{font-family:system-ui,sans-serif;max-width:1100px;margin:2rem auto;padding:0 2rem;color:#1e293b}
  h1{font-size:20px;border-bottom:3px solid #1e40af;padding-bottom:8px}
  table{width:100%;border-collapse:collapse;margin-top:1rem}
  th,td{border:1px solid #e2e8f0;padding:6px 10px;font-size:12px;text-align:left}
  th{background:#f1f5f9}
  tr:nth-child(even) td{background:#fafafa}
</style></head><body>
<h1>📋 Índice — Auditoria por Artigo ICERD</h1>
<p style="font-size:11px;color:#64748b">${ARTIGOS_CONVENCAO.length} Artigos · Gerado em ${new Date().toLocaleString('pt-BR')}</p>
<p style="font-size:11px;color:#64748b">Cada Artigo possui um relatório HTML que agrega TODAS as recomendações vinculadas a ele e a UNIÃO deduplicada das evidências (indicadores, normativos e orçamento).</p>
<table>
  <thead><tr><th>Artigo</th><th>Tema</th><th>Relatório</th></tr></thead>
  <tbody>${indexRows.join('')}</tbody>
</table>
</body></html>`;
      zip.file('00-INDICE.html', indexHtml);

      const blob = await zip.generateAsync({ type: 'blob' });
      triggerDownload(blob, `auditoria-artigos-icerd-${new Date().toISOString().split('T')[0]}.zip`);
      console.timeEnd('[ExportAllArtigos] total');

      if (errors.length) toast.warning(`${ARTIGOS_CONVENCAO.length - errors.length}/${ARTIGOS_CONVENCAO.length} relatórios. ${errors.length} com erro — ver console.`);
      else toast.success(`${ARTIGOS_CONVENCAO.length} relatórios por Artigo gerados em .zip`);
    } catch (err: any) {
      console.error('[ExportAllArtigos] FATAL', err);
      toast.error(`Falha ao gerar .zip: ${err?.message || err}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button size="sm" variant="outline" onClick={handleClick} disabled={common.disabled || busy} className="gap-1.5">
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Archive className="w-4 h-4" />}
      Baixar TODOS Artigos (.zip)
    </Button>
  );
}

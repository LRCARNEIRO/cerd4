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

interface Props {
  recomendacoes: any[];
  diagnosticMap: Map<string, RecomendacaoDiagnostic>;
  rawIndicadores: any[];
  rawOrcamento: any[];
  rawNormativos: any[];
  disabled?: boolean;
}

function safeFileName(s: string): string {
  return s
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

export function ExportAllRecomendacoesButton({
  recomendacoes, diagnosticMap, rawIndicadores, rawOrcamento, rawNormativos, disabled,
}: Props) {
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!recomendacoes?.length) return;
    setBusy(true);
    try {
      // ── Construir mapas de lookup uma única vez ──
      const indicadorIdByNome = new Map<string, string>();
      for (const i of rawIndicadores || []) if (i?.nome && i?.id) indicadorIdByNome.set(i.nome, i.id);

      const normativoMetaByTitulo = new Map<string, any>();
      for (const n of rawNormativos || []) {
        if (n?.titulo) normativoMetaByTitulo.set(n.titulo, {
          url_origem: n.url_origem, categoria: n.categoria, created_at: n.created_at,
        });
      }

      const orcamentoMetaByKey = new Map<string, any>();
      for (const o of rawOrcamento || []) {
        const key = `${o?.programa || ''}|${o?.orgao || ''}|${o?.ano ?? ''}`;
        if (!orcamentoMetaByKey.has(key)) orcamentoMetaByKey.set(key, o);
      }

      const origin = typeof window !== 'undefined' ? window.location.origin : '';

      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();

      // Index file
      const indexRows: string[] = [];

      for (const rec of recomendacoes) {
        const diag = diagnosticMap.get(rec.id);
        const html = generateRecomendacaoAuditHTML({
          recomendacao: rec,
          diagnostic: diag,
          indicadorIdByNome,
          normativoMetaByTitulo,
          orcamentoMetaByKey,
          origin,
        });
        const fileName = `paragrafo-${safeFileName(rec.paragrafo)}-${safeFileName(rec.tema)}.html`;
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

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `auditoria-recomendacoes-${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      toast.success(`${recomendacoes.length} relatórios gerados em .zip`);
    } catch (e: any) {
      console.error(e);
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

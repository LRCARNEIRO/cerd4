import { classificarOrigemLacuna } from '@/utils/classificarOrigemLacuna';

const origemOrder = { cerd: 0, rg: 1, durban: 2 };

/** Same ordering for the screen, index, individual files and unified report. */
export function ordenarRecomendacoes<T extends { paragrafo: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const group = origemOrder[classificarOrigemLacuna(a.paragrafo)] - origemOrder[classificarOrigemLacuna(b.paragrafo)];
    return group || a.paragrafo.localeCompare(b.paragrafo, 'pt-BR', { numeric: true });
  });
}

export interface RecomendacaoReportDocument {
  fileName: string;
  html: string;
}

/** Assemble the already-generated reports, never regenerate evidence or scores. */
export function unirAuditoriasRecomendacoes(indexHTML: string, reports: RecomendacaoReportDocument[]): string {
  const body = (html: string) => html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || '';
  const styles = [...new Set([indexHTML, ...reports.map(r => r.html)]
    .flatMap(html => [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].map(match => match[1])))].join('\n');
  let indexBody = body(indexHTML);
  const sections = reports.map((report, i) => {
    const anchor = `auditoria-${String(i + 1).padStart(3, '0')}`;
    indexBody = indexBody.split(`href="./${report.fileName}"`).join(`href="#${anchor}"`);
    return `<section class="auditoria-unificada" id="${anchor}">${body(report.html)}<p><a href="#indice-auditorias">Voltar ao índice</a></p></section>`;
  });
  return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Auditoria unificada — Recomendações ONU</title>
<style>${styles}
.auditoria-unificada{margin-top:3rem;padding-top:1rem;border-top:2px solid #e2e8f0;scroll-margin-top:1rem}
@media print{.auditoria-unificada{break-before:page}thead{display:table-header-group}tr{break-inside:avoid}}
</style></head><body><section id="indice-auditorias">${indexBody}</section>${sections.join('\n')}</body></html>`;
}
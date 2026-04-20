/**
 * normativosHelper.ts — Renderização SSoT de marcos normativos para o
 * Relatório CERD IV. Substitui qualquer menção hardcoded a leis, decretos,
 * PLs, portarias ou resoluções por listagem dinâmica do que está
 * efetivamente cadastrado em `documentos_normativos`.
 *
 * Princípio: Nenhum número de norma jurídica pode aparecer no relatório
 * sem ter um registro auditável na base. Se a base não tem, o relatório
 * apenas faz referência genérica ("legislação vigente", "marcos
 * normativos do período", etc).
 */

export interface NormativoRecord {
  id?: string;
  titulo: string;
  categoria?: string;
  artigos_convencao?: string[] | null;
  url_origem?: string | null;
  status?: string;
  created_at?: string;
}

/**
 * Filtra normativos cadastrados que estão vinculados a um Artigo ICERD.
 */
export function filtrarNormativosPorArtigo(
  normativos: NormativoRecord[] | undefined | null,
  artigo: string
): NormativoRecord[] {
  if (!normativos?.length) return [];
  return normativos.filter((n) =>
    Array.isArray(n.artigos_convencao) &&
    n.artigos_convencao.some((a) => String(a).trim().toUpperCase() === artigo.toUpperCase())
  );
}

/**
 * Renderiza tabela HTML com os normativos cadastrados vinculados a um Artigo.
 * Se não houver registros, exibe nota transparente em vez de inventar referências.
 */
export function renderNormativosVinculados(
  normativos: NormativoRecord[] | undefined | null,
  artigo: string,
  opts: { titulo?: string; max?: number } = {}
): string {
  const filtrados = filtrarNormativosPorArtigo(normativos, artigo);
  const titulo = opts.titulo || `Marcos normativos cadastrados — Artigo ${artigo}`;
  const max = opts.max || 50;

  if (filtrados.length === 0) {
    return `
    <div class="section" style="font-size:9pt;color:#64748b;border-left:3px solid #cbd5e1;padding-left:0.5cm">
      <p><em>${titulo}: nenhum documento normativo cadastrado na base do sistema vinculado a este Artigo. As menções a marcos legais nesta seção foram suprimidas até cadastro auditável em <code>documentos_normativos</code>.</em></p>
    </div>`;
  }

  const items = filtrados.slice(0, max);
  return `
  <table>
    <thead><tr><th style="width:65%">Documento (cadastrado na base do sistema)</th><th>Categoria</th><th>Fonte</th></tr></thead>
    <tbody>
      ${items.map((n) => `
        <tr>
          <td>${escapeHtml(n.titulo)}</td>
          <td style="font-size:8.5pt">${escapeHtml(n.categoria || '—')}</td>
          <td style="font-size:8pt">${
            n.url_origem
              ? `<a href="${escapeAttr(n.url_origem)}" target="_blank" rel="noopener">link</a>`
              : '<em style="color:#94a3b8">sem URL</em>'
          }</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <p style="font-size:8pt;color:#64748b;margin-top:0.15cm">
    Total cadastrado vinculado ao Artigo ${artigo}: <strong>${filtrados.length}</strong>
    ${filtrados.length > max ? ` (exibindo ${max} primeiros)` : ''}.
    Fonte: tabela <code>documentos_normativos</code> do sistema.
  </p>`;
}

/**
 * Renderiza parágrafo narrativo curto que cita o número de normativos cadastrados
 * por artigo, sem inventar nomes de leis. Usado para abrir seções que antes
 * tinham parágrafos com leis hardcoded.
 */
export function renderNormativosResumoParagrafo(
  normativos: NormativoRecord[] | undefined | null,
  artigo: string,
  contextoSecao: string
): string {
  const filtrados = filtrarNormativosPorArtigo(normativos, artigo);
  if (filtrados.length === 0) {
    return `<p>${contextoSecao} O sistema não possui, no presente momento, documentos normativos cadastrados na base auditável vinculados ao Artigo ${artigo}. Esta seção será atualizada à medida que a Base Normativa for alimentada com instrumentos legais formais com URL oficial verificável.</p>`;
  }
  return `<p>${contextoSecao} O sistema CERD4 tem, atualmente, <strong>${filtrados.length} documentos normativos cadastrados</strong> com vínculo auditável ao Artigo ${artigo} da Convenção, todos rastreáveis na Base Normativa do sistema. A relação completa, com URL oficial quando disponível, é apresentada na tabela abaixo.</p>`;
}

function escapeHtml(s: string): string {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;');
}

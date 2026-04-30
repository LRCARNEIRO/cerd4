/**
 * Lógica de preparação compartilhada entre os exportadores de UMA
 * recomendação (botão por parágrafo), TODAS as recomendações (zip
 * geral) e os relatórios por Artigo ICERD (zip de Artigos).
 *
 * Centralizar evita divergência de mapas de lookup e garante que
 * todos os geradores leem das mesmas fontes SSoT (rawIndicadores /
 * rawOrcamento / rawNormativos do useDiagnosticSensor).
 */
import type { RecomendacaoDiagnostic } from '@/hooks/useDiagnosticSensor';
import { buildIndicadorCodigoMap } from '@/utils/indicadorCodigo';

export interface ExportLookupMaps {
  indicadorIdByNome: Map<string, string>;
  indicadorCodigoByNome: Map<string, string>;
  normativoMetaByTitulo: Map<string, { url_origem?: string | null; categoria?: string | null; created_at?: string | null }>;
  orcamentoMetaByKey: Map<string, any>;
  origin: string;
}

function getReportLinkOrigin(): string {
  const publicOrigin = 'https://cerd4.lovable.app';
  if (typeof window === 'undefined') return publicOrigin;
  const { origin, hostname } = window.location;
  // Relatórios HTML são abertos fora do preview/editor. Portanto, links
  // internos devem apontar sempre para o domínio publicado, evitando o
  // domínio auth-gated lovableproject.com que pede login Lovable.
  if (hostname === 'cerd4.lovable.app') return origin;
  return publicOrigin;
}

/**
 * Constrói os mapas de lookup uma única vez e devolve a origem atual.
 * Isso mantém os deep-links apontando para a mesma versão do app que
 * gerou o relatório (preview → preview; publicado → publicado).
 */
export function buildExportLookups(
  rawIndicadores: any[],
  rawOrcamento: any[],
  rawNormativos: any[],
): ExportLookupMaps {
  const codigosById = buildIndicadorCodigoMap(
    (rawIndicadores || []).filter(i => i?.id && i?.created_at),
  );
  const indicadorIdByNome = new Map<string, string>();
  const indicadorCodigoByNome = new Map<string, string>();
  for (const i of rawIndicadores || []) {
    if (i?.nome && i?.id) {
      indicadorIdByNome.set(i.nome, i.id);
      const c = i.codigo || codigosById.get(i.id);
      if (c) indicadorCodigoByNome.set(i.nome, c);
    }
  }

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

  const origin = getReportLinkOrigin();

  return { indicadorIdByNome, indicadorCodigoByNome, normativoMetaByTitulo, orcamentoMetaByKey, origin };
}

export function safeFileName(s: string): string {
  return (s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 80);
}

/** Dispara o download de um Blob (HTML/ZIP) sem exigir interação extra. */
export function triggerDownload(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export type DiagnosticMap = Map<string, RecomendacaoDiagnostic>;

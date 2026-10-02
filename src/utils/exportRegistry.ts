import { useEffect, useRef } from 'react';

/**
 * Registro global de geradores de relatório usado pelo botão "Baixar tudo".
 * Cada relatório registra seu gerador (o mesmo usado nos botões PDF/HTML/DOCX)
 * somente quando seus dados estão prontos. Fica em `window` para que o
 * "Baixar tudo" leia também páginas carregadas em iframe oculto.
 */
export type ExportEntry = { titulo: string; ordem: number; html: () => string | Promise<string> | Promise<string[]> | string[] };
type Registry = Map<string, ExportEntry>;

declare global {
  interface Window { __cerdExports?: Registry; __cerdCapture?: string[] }
}

export function getExportRegistry(win: Window = window): Registry {
  if (!win.__cerdExports) win.__cerdExports = new Map();
  return win.__cerdExports;
}

export function useRegisterExport(key: string, titulo: string, ordem: number, ready: boolean, html: () => string | Promise<string>) {
  const ref = useRef(html);
  ref.current = html;
  useEffect(() => {
    if (!ready) return;
    const reg = getExportRegistry();
    reg.set(key, { titulo, ordem, html: () => ref.current() });
    return () => { reg.delete(key); };
  }, [key, titulo, ordem, ready]);
}

/** Executa geradores que chamam generateSectionPDF capturando o HTML em vez de abrir janela. */
export function captureSectionPDF(fn: () => void): string {
  const prev = window.__cerdCapture;
  const buf: string[] = [];
  window.__cerdCapture = buf;
  try { fn(); } finally { window.__cerdCapture = prev; }
  return buf.join('\n');
}

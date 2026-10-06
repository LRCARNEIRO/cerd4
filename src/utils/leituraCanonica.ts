/**
 * Consulta à leitura canônica (forma de leitura + tendência) dos indicadores
 * de IMPACTO auditados na planilha v20. Prevalece sobre a heurística por nome.
 */
import { LEITURA_IMPACTO_V20, type LeituraImpactoEntry } from '@/data/leituraImpactoV20';

const norm = (s?: string | null) =>
  String(s ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();

const byNomeSub = new Map<string, LeituraImpactoEntry>();
const byCodigo = new Map<string, LeituraImpactoEntry[]>();
for (const e of LEITURA_IMPACTO_V20) {
  byNomeSub.set(`${norm(e.nome)}|${norm(e.sub)}`, e);
  byNomeSub.set(`${norm(e.titulo)}|`, byNomeSub.get(`${norm(e.titulo)}|`) ?? e);
  const arr = byCodigo.get(e.codigo) ?? [];
  arr.push(e);
  byCodigo.set(e.codigo, arr);
}

export function getLeituraCanonica(nome?: string | null, sub?: string | null): LeituraImpactoEntry | undefined {
  if (!nome) return undefined;
  return byNomeSub.get(`${norm(nome)}|${norm(sub)}`);
}

export function getLeiturasPorCodigo(codigo?: string | null): LeituraImpactoEntry[] {
  return codigo ? byCodigo.get(codigo) ?? [] : [];
}

export function leituraCurta(l: string): string {
  return l.startsWith('mais próximo de 1') ? 'paridade (alvo = 1)' : l;
}

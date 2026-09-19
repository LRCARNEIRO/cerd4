import { evaluateIndicadorDetailed } from '@/components/conclusoes/evaluateIndicador';
import { extractDadoUnico, extractSerieSub, resolveRegistroEstatico, type DadoUnico } from '@/utils/indicadorDadoUnico';

interface LinkedIndicadorReport {
  id?: string;
  codigo?: string;
  nome: string;
  categoria?: string;
  tendencia?: string | null;
  dados?: any;
  sub?: string;
}

interface IndicadorReportLookups {
  indicadorIdByNome: Map<string, string>;
  indicadorCodigoByNome: Map<string, string>;
  indicadorRegByNome: Map<string, { id?: string; codigo?: string | null; nome?: string; dados?: any; tendencia?: string | null }>;
}

/**
 * Fonte única da apresentação estatística nos relatórios de Artigos e
 * Recomendações. Recupera o registro original, resolve subindicadores e usa
 * o dado pontual quando não existe série histórica.
 */
export function resolveIndicadorReportData(li: LinkedIndicadorReport, lookups: IndicadorReportLookups) {
  const fallback = (!li.codigo || !li.dados)
    ? resolveRegistroEstatico(li.nome, lookups.indicadorRegByNome)
    : { registro: undefined, codigoCongelado: undefined };
  const reg = fallback.registro;
  const id = li.id || lookups.indicadorIdByNome.get(li.nome) || reg?.id || '';
  const codigo = li.codigo || lookups.indicadorCodigoByNome.get(li.nome) || reg?.codigo || fallback.codigoCongelado || undefined;
  const dados = li.dados ?? reg?.dados;
  const base = evaluateIndicadorDetailed({
    nome: li.nome,
    categoria: li.categoria,
    tendencia: li.tendencia ?? reg?.tendencia,
    dados,
  });
  const serieSub = extractSerieSub(dados, li.sub, li.nome);
  const detail = serieSub?.valorRecente !== undefined
    ? { ...base, ...serieSub, result: base.result }
    : base;
  const unico: DadoUnico | undefined = (detail.valorRecente === undefined && detail.valorAntigo === undefined)
    ? extractDadoUnico(dados, li.sub, li.nome)
    : undefined;

  return { id, codigo, detail, unico };
}
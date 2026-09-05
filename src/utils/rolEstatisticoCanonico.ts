/**
 * rolEstatisticoCanonico.ts — Fonte única do "rol vinculável" da Base Estatística.
 *
 * Regra canônica (a mesma da busca, do inventário e dos relatórios):
 *  - guarda-chuva SEM subindicadores e que não seja duplicata → entra como evidência;
 *  - guarda-chuva COM subindicadores → NÃO entra (evita dupla contagem);
 *    entram, no lugar, os seus subindicadores.
 *
 * Qualquer painel que precise contar ou listar "evidências estatísticas"
 * deve usar este módulo, nunca contar linhas cruas do banco.
 */
import { SUB_INDICADORES, hasSubIndicadores } from '@/utils/indicadorSubs';
import { isDuplicata } from '@/utils/indicadorAliases';

export type EvidenciaEstatistica = {
  key: string;
  codigo: string;
  titulo: string;
  detalhe: string;
  fonte: string;
  tendencia: string;
  artigos: string;
  categoria: string;
  searchText: string;
  tipo: 'guarda-chuva' | 'subindicador';
};

export interface RolEstatistico {
  itens: EvidenciaEstatistica[];
  guardaChuvas: EvidenciaEstatistica[];
  subindicadores: EvidenciaEstatistica[];
  total: number;
  totalGuardaChuvas: number;
  totalSubindicadores: number;
  /** guarda-chuvas suprimidos do rol por já estarem representados por subindicadores */
  consolidados: number;
  /** registros descartados por serem duplicata declarada */
  duplicatas: number;
  /** total de linhas cruas recebidas do banco */
  registrosBrutos: number;
}

export function buildRolEstatistico(indicadores: any[] | null | undefined): RolEstatistico {
  const all = indicadores || [];

  const guardaChuvas: EvidenciaEstatistica[] = all
    .filter((i) => !hasSubIndicadores(i.nome) && !isDuplicata(i.codigo))
    .map((i) => ({
      key: i.id,
      codigo: i.codigo || '',
      titulo: i.nome,
      detalhe: i.subcategoria || '—',
      fonte: i.fonte || '',
      tendencia: i.tendencia || '—',
      artigos: (i.artigos_convencao || []).join(', ') || '—',
      categoria: i.categoria || 'outros',
      searchText: [i.nome, i.subcategoria, i.fonte, i.analise_interseccional].filter(Boolean).join(' '),
      tipo: 'guarda-chuva' as const,
    }));

  const subindicadores: EvidenciaEstatistica[] = SUB_INDICADORES.map((s) => {
    const umbrella = all.find((i) => i.nome === s.guardaChuva);
    return {
      key: `sub-${s.codigo}-${s.sub}`,
      codigo: `${s.codigo} · sub`,
      titulo: s.titulo,
      detalhe: `sub: ${s.sub} — ${s.guardaChuva}`,
      fonte: umbrella?.fonte || '',
      tendencia: '—',
      artigos: (umbrella?.artigos_convencao || []).join(', ') || '—',
      categoria: s.abaLabel || 'outros',
      searchText: [s.titulo, s.sub, s.guardaChuva, ...(s.aliases || [])].filter(Boolean).join(' '),
      tipo: 'subindicador' as const,
    };
  });

  const consolidados = all.filter((i) => hasSubIndicadores(i.nome)).length;
  const duplicatas = all.filter((i) => !hasSubIndicadores(i.nome) && isDuplicata(i.codigo)).length;

  return {
    itens: [...guardaChuvas, ...subindicadores],
    guardaChuvas,
    subindicadores,
    total: guardaChuvas.length + subindicadores.length,
    totalGuardaChuvas: guardaChuvas.length,
    totalSubindicadores: subindicadores.length,
    consolidados,
    duplicatas,
    registrosBrutos: all.length,
  };
}

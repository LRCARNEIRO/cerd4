/**
 * matrizAuditada.ts — leitura da matriz Artigo × Recomendação × Evidência
 * (`vinculos_evidencia_curados`). Fonte única para contagens da matriz e para
 * os artigos ICERD de cada registro orçamentário.
 */
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface MatrizAuditada {
  enderecos: number;
  relacoes: { total: number; est: number; orc: number; norm: number };
  /** ref_id do registro orçamentário → artigos ICERD da matriz */
  artigosPorOrcamento: Map<string, string[]>;
}

const ORDEM = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

export async function fetchMatrizAuditada(): Promise<MatrizAuditada> {
  const rows: any[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await supabase
      .from('vinculos_evidencia_curados')
      .select('recomendacao_id, base, ref_id, sub, nome, artigo')
      .range(from, from + 999);
    if (error) throw error;
    rows.push(...(data || []));
    if (!data || data.length < 1000) break;
  }
  const rel = { est: new Set<string>(), orc: new Set<string>(), norm: new Set<string>() };
  const arts = new Map<string, Set<string>>();
  for (const r of rows) {
    const key = `${r.recomendacao_id}|${r.ref_id || r.nome}|${r.sub || ''}`;
    if (r.base === 'estatistica') rel.est.add(key);
    else if (r.base === 'orcamentaria') {
      rel.orc.add(key);
      const s = arts.get(r.ref_id) || new Set<string>();
      String(r.artigo || '').split(',').map((a: string) => a.trim()).filter(Boolean).forEach((a: string) => s.add(a));
      arts.set(r.ref_id, s);
    } else if (r.base === 'normativa') rel.norm.add(key);
  }
  const artigosPorOrcamento = new Map<string, string[]>();
  arts.forEach((s, k) => artigosPorOrcamento.set(k, [...s].sort((a, b) => ORDEM.indexOf(a) - ORDEM.indexOf(b))));
  return {
    enderecos: rows.length,
    relacoes: { total: rel.est.size + rel.orc.size + rel.norm.size, est: rel.est.size, orc: rel.orc.size, norm: rel.norm.size },
    artigosPorOrcamento,
  };
}

export function useMatrizAuditada() {
  return useQuery({ queryKey: ['matriz-auditada'], queryFn: fetchMatrizAuditada, staleTime: 5 * 60 * 1000 });
}

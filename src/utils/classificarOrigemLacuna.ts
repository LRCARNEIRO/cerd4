/**
 * Classifica a origem de uma lacuna/recomendação com base no padrão do parágrafo.
 * 
 * - CERD: parágrafos numéricos (§4-§65) do CERD/C/BRA/CO/18-20
 * - CNJ: parágrafos com prefixo "p." do Relatório CNJ sobre Audiências de Custódia
 * - STF: parágrafos "RESUMO DO CASO" ou "Tese:" da ADO 26
 */

export type OrigemLacuna = 'cerd' | 'cnj' | 'stf';

export interface OrigemConfig {
  label: string;
  labelCurto: string;
  documento: string;
  cor: string;
}

export const ORIGEM_CONFIG: Record<OrigemLacuna, OrigemConfig> = {
  cerd: {
    label: 'CERD/C/BRA/CO/18-20 — Observações Finais',
    labelCurto: 'CERD',
    documento: 'Comitê CERD — ONU (2022)',
    cor: 'bg-primary/10 text-primary border-primary/30',
  },
  cnj: {
    label: 'Relatório CNJ — Audiências de Custódia',
    labelCurto: 'CNJ',
    documento: 'Conselho Nacional de Justiça',
    cor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  stf: {
    label: 'STF — ADO 26 (Criminalização da Homofobia)',
    labelCurto: 'STF/ADO 26',
    documento: 'Supremo Tribunal Federal',
    cor: 'bg-violet-100 text-violet-800 border-violet-300',
  },
};

export function classificarOrigemLacuna(paragrafo: string): OrigemLacuna {
  if (paragrafo.startsWith('p.') || paragrafo.startsWith('p ')) return 'cnj';
  if (paragrafo.startsWith('RESUMO') || paragrafo.startsWith('Tese')) return 'stf';
  return 'cerd';
}

export function contarPorOrigem(lacunas: { paragrafo: string }[]): Record<OrigemLacuna, number> {
  const counts: Record<OrigemLacuna, number> = { cerd: 0, cnj: 0, stf: 0 };
  for (const l of lacunas) {
    counts[classificarOrigemLacuna(l.paragrafo)]++;
  }
  return counts;
}

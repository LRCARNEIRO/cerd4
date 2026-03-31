/**
 * Classifica a origem de uma lacuna/recomendação com base no padrão do parágrafo.
 * 
 * - CERD: parágrafos numéricos (§4-§65) do CERD/C/BRA/CO/18-20
 * - RG: Recomendações Gerais do CERD (RG23, RG31, etc.)
 * - Durban: Declaração e Plano de Ação de Durban
 */

export type OrigemLacuna = 'cerd' | 'rg' | 'durban';

export interface OrigemConfig {
  label: string;
  labelCurto: string;
  documento: string;
  cor: string;
}

export const ORIGEM_CONFIG: Record<OrigemLacuna, OrigemConfig> = {
  cerd: {
    label: 'CERD/C/BRA/CO/18-20 — Observações Finais',
    labelCurto: 'Obs. Finais',
    documento: 'Comitê CERD — ONU (2022)',
    cor: 'bg-primary/10 text-primary border-primary/30',
  },
  rg: {
    label: 'Recomendações Gerais do CERD',
    labelCurto: 'Rec. Gerais',
    documento: 'Comitê CERD — ONU',
    cor: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  durban: {
    label: 'Declaração e Plano de Ação de Durban',
    labelCurto: 'Durban',
    documento: 'Conferência de Durban (2001)',
    cor: 'bg-violet-100 text-violet-800 border-violet-300',
  },
};

export function classificarOrigemLacuna(paragrafo: string): OrigemLacuna {
  if (paragrafo.startsWith('RG')) return 'rg';
  if (paragrafo.startsWith('Durban')) return 'durban';
  return 'cerd';
}

export function contarPorOrigem(lacunas: { paragrafo: string }[]): Record<OrigemLacuna, number> {
  const counts: Record<OrigemLacuna, number> = { cerd: 0, rg: 0, durban: 0 };
  for (const l of lacunas) {
    counts[classificarOrigemLacuna(l.paragrafo)]++;
  }
  return counts;
}


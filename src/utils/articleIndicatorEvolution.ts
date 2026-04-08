import { evaluateIndicadorDetailed } from '@/components/conclusoes/evaluateIndicador';

export interface IndicatorEvolutionSummary {
  linkedTotal: number;
  favoraveis: number;
  desfavoraveis: number;
  novos: number;
  neutros: number;
  score: number;
}

export function summarizeIndicatorEvolution(indicadores: any[]): IndicatorEvolutionSummary {
  let favoraveis = 0;
  let desfavoraveis = 0;
  let novos = 0;
  let neutros = 0;

  indicadores.forEach((ind) => {
    const result = evaluateIndicadorDetailed(ind).result;

    if (result === 'favoravel') favoraveis += 1;
    else if (result === 'desfavoravel') desfavoraveis += 1;
    else if (result === 'novo') novos += 1;
    else neutros += 1;
  });

  const linkedTotal = indicadores.length;

  // Score rigoroso: somente melhorias comprovadas pontuam plenamente.
  // Novos contam apenas 40% (existência ≠ evolução).
  // Desfavoráveis penalizam com peso 1.0 (não 0.5).
  // Neutros não pontuam.
  const rawScore = linkedTotal > 0
    ? ((favoraveis + novos * 0.4 - desfavoraveis * 1.0) / linkedTotal) * 100
    : 0;

  return {
    linkedTotal,
    favoraveis,
    desfavoraveis,
    novos,
    neutros,
    score: Math.round(Math.max(0, Math.min(100, rawScore))),
  };
}
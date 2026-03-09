/**
 * ═══════════════════════════════════════════════════════════════════
 * TESTE DE CONSISTÊNCIA NARRATIVA × DADOS
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Este teste verifica automaticamente que TODOS os valores numéricos
 * utilizados nos textos analíticos (narrativas) correspondem exatamente
 * aos dados das constantes oficiais em StatisticsData.ts.
 * 
 * Se um dado mudar em StatisticsData.ts, o texto analítico será
 * automaticamente atualizado (pois usa narrativeHelpers.ts).
 * Este teste garante que o mapa de derivação está correto.
 * ═══════════════════════════════════════════════════════════════════
 */

import { describe, it, expect } from 'vitest';
import { NARRATIVE_DATA_MAP } from '@/utils/narrativeHelpers';

describe('Consistência Narrativa × Dados Oficiais', () => {
  it('todos os valores narrativos devem corresponder exatamente aos dados-fonte', () => {
    const failures: string[] = [];

    for (const entry of NARRATIVE_DATA_MAP) {
      if (entry.narrativeValue !== entry.sourceValue) {
        failures.push(
          `❌ ${entry.label}: narrativa=${entry.narrativeValue} ≠ fonte=${entry.sourceValue} (${entry.source})`
        );
      }
    }

    if (failures.length > 0) {
      throw new Error(
        `\n\n🚨 DIVERGÊNCIAS NARRATIVA × DADOS DETECTADAS:\n\n${failures.join('\n')}\n\n` +
        `Corrija os valores em StatisticsData.ts ou atualize o mapa em narrativeHelpers.ts.\n`
      );
    }

    expect(failures).toHaveLength(0);
  });

  it('o mapa de validação deve conter pelo menos 28 entradas (cobertura completa)', () => {
    expect(NARRATIVE_DATA_MAP.length).toBeGreaterThanOrEqual(28);
  });

  it('nenhum valor narrativo deve ser NaN ou undefined', () => {
    for (const entry of NARRATIVE_DATA_MAP) {
      expect(entry.narrativeValue, `${entry.label} é NaN/undefined`).not.toBeNaN();
      expect(entry.narrativeValue, `${entry.label} é undefined`).not.toBeUndefined();
    }
  });
});

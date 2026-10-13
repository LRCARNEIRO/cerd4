import { describe, expect, it } from 'vitest';
import { nomeCanonico } from '@/utils/indicadorAliases';
import { cardFixoSerie, resolveRegistroEstatico } from '@/utils/indicadorDadoUnico';
import { abasDoIndicador } from '@/utils/indicadorLocator';

describe('renomeação dos indicadores revisados', () => {
  const casos = [
    ['IND-009', 'Taxa de desemprego graduado por raça e gênero — Censo 2022 (%)', 'Taxa de desocupação (superior completo) (%)', 3.96],
    ['IND-010', 'Taxa de inatividade qualificada por raça e gênero — Censo 2022 (%)', 'Proporção fora da força de trabalho (superior completo) (%)', 22.25],
  ] as const;

  for (const [codigo, antigo, novo, valor] of casos) {
    it(`preserva identidade, dado único e localização de ${codigo}`, () => {
      const registro = { id: `uuid-${codigo}`, codigo, nome: novo };
      const porNome = new Map([[novo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(), registro]]);
      expect(nomeCanonico(antigo)).toBe(novo);
      expect(resolveRegistroEstatico(antigo, porNome).registro).toBe(registro);
      expect(resolveRegistroEstatico(novo, porNome).registro).toBe(registro);
      expect(cardFixoSerie(novo)).toEqual(cardFixoSerie(antigo));
      expect(cardFixoSerie(novo)?.valorRecente).toBe(valor);
      expect(abasDoIndicador(null, null, novo, null, codigo)[0]?.tabValue).toBe('raca-genero');
    });
  }
});
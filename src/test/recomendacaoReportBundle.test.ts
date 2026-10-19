import { describe, expect, it } from 'vitest';
import { ordenarRecomendacoes } from '@/utils/recomendacaoReportBundle';

describe('ordem das auditorias de recomendações', () => {
  it('coloca Observações Finais antes de RG e Durban', () => {
    const items = ['Durban 2', 'RG23', '67', '6'].map(paragrafo => ({ paragrafo }));
    expect(ordenarRecomendacoes(items).map(r => r.paragrafo)).toEqual(['6', '67', 'RG23', 'Durban 2']);
    expect(items.map(r => r.paragrafo)).toEqual(['Durban 2', 'RG23', '67', '6']);
  });
  it('ordena numericamente dentro de cada documento, inclusive RG e Durban', () => {
    const items = ['RG31', 'Durban 10', '19', 'RG9', '6', 'Durban 2', 'RG23', '53', 'Durban 100'];
    expect(ordenarRecomendacoes(items.map(paragrafo => ({ paragrafo }))).map(r => r.paragrafo))
      .toEqual(['6', '19', '53', 'RG9', 'RG23', 'RG31', 'Durban 2', 'Durban 10', 'Durban 100']);
  });
});
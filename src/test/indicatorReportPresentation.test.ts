import { describe, expect, it } from 'vitest';
import { generateArtigoAuditHTML } from '@/components/artigos/generateArtigoAuditHTML';
import { generateRecomendacaoAuditHTML } from '@/components/recomendacoes/generateRecomendacaoAuditHTML';
import { renderFullIndicatorTable } from '@/components/reports/cerdiv/articleDetailRenderers';
import { ARTIGOS_CONVENCAO } from '@/utils/artigosConvencao';

const lookups = {
  indicadorIdByNome: new Map<string, string>(),
  indicadorCodigoByNome: new Map<string, string>(),
  indicadorRegByNome: new Map(),
  normativoMetaByTitulo: new Map(),
  orcamentoMetaByKey: new Map(),
  orcamentoMetaById: new Map(),
  origin: 'https://example.com',
};
const indicator = {
  id: 'test-indicator', codigo: 'IND-202', nome: 'Candidatos por raça/cor — Eleições',
  dados: { series: { 2018: { negra: 46 }, 2024: { negra: 52 } } },
};

function indicatorTable(html: string) {
  const document = new DOMParser().parseFromString(html, 'text/html');
  const table = Array.from(document.querySelectorAll('table')).find(t => t.querySelector('th')?.textContent === 'Indicador');
  if (!table) throw new Error('Tabela de indicadores ausente');
  return table;
}

describe('Apresentação de indicadores nos relatórios', () => {
  for (const artigo of ARTIGOS_CONVENCAO) {
    it(`Artigo ${artigo.numero}: mantém identificação e Resultado sem valores simplificados`, () => {
      const html = generateArtigoAuditHTML({
        artigo: artigo.numero, recomendacoes: [], diagnosticMap: new Map(), lookups,
        artigoEvidencia: new Map([[artigo.numero, { indicadores: [indicator], normativos: [], orcamento: [] }]]),
      });
      const table = indicatorTable(html);
      expect(Array.from(table.querySelectorAll('th')).map(t => t.textContent)).toEqual(['Indicador', 'Resultado']);
      expect(table.querySelectorAll('tbody td')).toHaveLength(2);
      expect(table.textContent).toContain('IND-202');
      expect(table.querySelector('a')?.getAttribute('href')).toContain('IND-202');
      expect(table.textContent).toContain('Melhoria');
      expect(table.textContent).not.toContain('2018');
      expect(table.textContent).not.toContain('2024');
    });
  }

  it('Recomendação sem evidências mantém tabela de duas colunas', () => {
    const html = generateRecomendacaoAuditHTML({
      recomendacao: { id: 'r', paragrafo: '42', tema: 'Teste', status_cumprimento: 'nao_cumprido' },
      diagnostic: undefined, ...lookups,
    });
    const table = indicatorTable(html);
    expect(table.querySelectorAll('th')).toHaveLength(2);
    expect(table.querySelector('td')?.getAttribute('colspan')).toBe('2');
  });

  it('Relatório integral mantém Resultado, categoria e fonte, sem antigo/recente', () => {
    const table = indicatorTable(renderFullIndicatorTable([{ ...indicator, categoria: 'educacao', fonte: 'Fonte auditada' } as never]));
    expect(Array.from(table.querySelectorAll('th')).map(t => t.textContent)).toEqual(['Indicador', 'Categoria', 'Resultado', 'Fonte']);
    expect(table.querySelectorAll('tbody td')).toHaveLength(4);
    expect(table.textContent).toContain('Melhora');
  });
});
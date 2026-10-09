import { describe, it, expect } from 'vitest';
import { construirCatalogoFontes, agruparFontesPorPortal } from '@/utils/fontesCatalogo';

describe('Diretório de fontes citadas', () => {
  it('agrega tabelas SIDRA sem perder denominações ou links individuais', () => {
    const fontes = construirCatalogoFontes([
      { nome: 'IBGE/SIDRA Tabela 1', base: 'Estatística', url: 'https://sidra.ibge.gov.br/tabela/1' },
      { nome: 'IBGE/SIDRA Tabela 2', base: 'Estatística', url: 'https://sidra.ibge.gov.br/tabela/2' },
    ]);
    const grupos = agruparFontesPorPortal(fontes);
    expect(grupos).toHaveLength(1);
    expect(grupos[0].fontes.map(f => f.nome)).toEqual(fontes.map(f => f.nome));
    expect(grupos[0].fontes.flatMap(f => f.urls)).toHaveLength(2);
  });
  it('separa portais e bases sem criar cartões para fontes sem endereço', () => {
    const grupos = agruparFontesPorPortal(construirCatalogoFontes([
      { nome: 'IBGE', base: 'Estatística', url: 'https://sidra.ibge.gov.br/tabela/1' },
      { nome: 'IBGE', base: 'Estatística', url: 'https://www.ibge.gov.br/publicacao' },
      { nome: 'IBGE', base: 'Orçamentária', url: 'https://sidra.ibge.gov.br/tabela/1' },
      { nome: 'Sem endereço', base: 'Normativa' },
    ]));
    expect(grupos).toHaveLength(3);
    expect(grupos.flatMap(g => g.fontes.flatMap(f => f.urls))).toHaveLength(3);
    expect(grupos.some(g => g.base === 'Normativa')).toBe(false);
  });
  it('mantém fontes primárias diferentes servidas pelo mesmo portal', () => {
    const catalogo = construirCatalogoFontes([
      { nome: 'RAIS/MTE', base: 'Estatística', url: 'https://odsr.lema.ufpb.br/rais' },
      { nome: 'Censo Escolar/INEP', base: 'Estatística', url: 'https://odsr.lema.ufpb.br/censo' },
      { nome: 'RAIS/MTE', base: 'Estatística', url: 'https://odsr.lema.ufpb.br/rais' },
    ]);
    expect(catalogo).toHaveLength(2);
    expect(catalogo.find(f => f.nome === 'RAIS/MTE')?.instituicao).toBe('Ministério do Trabalho e Emprego');
    expect(catalogo.every(f => f.portais[0]?.nome === 'Portal ODS Racial')).toBe(true);
  });
  it('preserva fontes sem URL, variações e combinações', () => {
    const catalogo = construirCatalogoFontes([
      { nome: 'IBGE/Censo 2022', base: 'Estatística' },
      { nome: 'IBGE — Censo 2022', base: 'Estatística' },
      { nome: 'INCRA/Fundação Cultural Palmares', base: 'Estatística', url: null },
    ]);
    expect(catalogo).toHaveLength(3);
    expect(catalogo.every(f => f.urls.length === 0)).toBe(true);
    expect(catalogo.find(f => f.nome.startsWith('INCRA'))?.instituicao).toBe('Fontes combinadas');
  });
  it('separa referências por base e mantém títulos normativos sem endereço', () => {
    const catalogo = construirCatalogoFontes([
      { nome: 'SIOP', base: 'Orçamentária' },
      { nome: 'SIOP', base: 'Estatística' },
      { nome: 'ADO 26 STF', base: 'Normativa' },
    ]);
    expect(catalogo).toHaveLength(3);
    expect(catalogo.find(f => f.base === 'Normativa')?.instituicao).toBe('Supremo Tribunal Federal');
  });
});
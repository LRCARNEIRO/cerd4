import { describe, it, expect } from 'vitest';
import { construirCatalogoFontes } from '@/utils/fontesCatalogo';

describe('Diretório de fontes citadas', () => {
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
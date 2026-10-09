import { describe, it, expect } from 'vitest';
import { buildFontesWorkbook } from '@/utils/exportFontesWorkbook';
import { construirCatalogoFontes } from '@/utils/fontesCatalogo';

describe('Datas na planilha de fontes', () => {
  it('preserva datas individuais, agrega intervalos e não inventa coleta', async () => {
    const fonte = { nome: 'IBGE', base: 'Estatística' as const, url: 'https://sidra.ibge.gov.br/tabela/1' };
    const wb = await buildFontesWorkbook(construirCatalogoFontes([fonte]), [
      { base: fonte.base, fonte: fonte.nome, url: fonte.url, codigo: 'IND-001', nome: 'Indicador A', dataCadastro: '2026-03-12T12:00:00-03:00', dataAtualizacao: '2026-10-09T22:00:00Z' },
      { base: fonte.base, fonte: fonte.nome, url: fonte.url, codigo: 'IND-002', nome: 'Indicador B', dataCadastro: '2026-04-01T00:00:00Z', dataConsulta: '2026-03-30T00:00:00Z' },
    ]);
    expect(wb.getWorksheet('Evidências por fonte')?.getCell('J2').value).toBe('Não registrada');
    expect(wb.getWorksheet('Evidências por fonte')?.getCell('K2').value).toBe('Não registrada');
    expect(wb.getWorksheet('Evidências por fonte')?.getCell('L2').value).toBe('2026-03-12T15:00:00.000Z');
    expect(wb.getWorksheet('Fontes')?.getCell('H2').value).toBe('2026-03-12T15:00:00.000Z até 2026-04-01T00:00:00.000Z');
    expect(wb.getWorksheet('Endereços')?.getCell('F2').value).toBe(wb.getWorksheet('Fontes')?.getCell('H2').value);
    expect(wb.getWorksheet('Endereços')?.getCell('A2').value).toMatchObject({ hyperlink: fonte.url });
    expect(wb.getWorksheet('Resumo')?.getCell('B5').value).toMatchObject({ result: 1 });
    const { Workbook } = await import('exceljs');
    const reopened = new Workbook();
    await reopened.xlsx.load(await wb.xlsx.writeBuffer());
    expect(reopened.getWorksheet('Evidências por fonte')?.getCell('L2').value).toBe('2026-03-12T15:00:00.000Z');
  });
  it('mantém fontes sem endereço e trata datas inválidas como não registradas', async () => {
    const wb = await buildFontesWorkbook(construirCatalogoFontes([{ nome: 'Norma', base: 'Normativa' }]), [
      { base: 'Normativa', fonte: 'Norma', url: '', codigo: 'N1', nome: 'Norma', dataCadastro: 'inválida' },
    ]);
    expect(wb.getWorksheet('Fontes')?.getCell('H2').value).toBe('Não registrada');
    expect(wb.getWorksheet('Evidências por fonte')?.getCell('L2').value).toBe('Não registrada');
  });
});
import type { FonteCatalogo, BaseFonte } from './fontesCatalogo';

export interface VinculoFonteExport {
  base: BaseFonte;
  fonte: string;
  url: string;
  codigo: string;
  nome: string;
  programa?: string;
  orgao?: string;
  ano?: number;
  detalhe?: string;
  dataColeta?: string | null;
  dataConsulta?: string | null;
  dataCadastro?: string | null;
  dataAtualizacao?: string | null;
}

function dataUTC(valor?: string | null): string {
  if (!valor) return 'Não registrada';
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? 'Não registrada' : data.toISOString();
}

function datasAgrupadas(vinculos: VinculoFonteExport[]) {
  return (['dataColeta', 'dataConsulta', 'dataCadastro', 'dataAtualizacao'] as const).map(campo => {
    const datas = [...new Set(vinculos.map(v => dataUTC(v[campo])).filter(d => d !== 'Não registrada'))].sort();
    if (!datas.length) return 'Não registrada';
    return datas.length === 1 ? datas[0] : `${datas[0]} até ${datas[datas.length - 1]}`;
  });
}

const colunasDatas = ['Coleta documentada (UTC)', 'Consulta documentada (UTC)', 'Cadastro do registro no sistema (UTC)', 'Última alteração do registro no sistema (UTC)'];

export async function buildFontesWorkbook(fontes: FonteCatalogo[], vinculos: VinculoFonteExport[]) {
  const { Workbook } = await import('exceljs');
  const wb = new Workbook();
  wb.creator = 'CERD Brasil';
  wb.created = new Date();
  function sheet(nome: string, headers: string[], rows: (string | number)[][], urlCol?: number) {
    const ws = wb.addWorksheet(nome);
    ws.addRow(headers);
    rows.forEach(row => ws.addRow(row));
    ws.views = [{ state: 'frozen', ySplit: 1 }];
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: rows.length + 1, column: headers.length } };
    ws.columns.forEach((col, i) => { col.width = i === 0 ? 20 : 45; });
    ws.eachRow((row, index) => {
      row.font = { name: 'Arial', size: 11, bold: index === 1 };
      row.alignment = { vertical: 'top', wrapText: true };
      if (index === 1) row.height = 30;
      if (urlCol && index > 1) {
        const cell = row.getCell(urlCol);
        const url = String(cell.value || '');
        if (/^https?:\/\//i.test(url)) {
          cell.value = { text: url, hyperlink: url };
          cell.font = { name: 'Arial', size: 11, color: { argb: 'FF0563C1' }, underline: true };
        }
      }
    });
    return ws;
  }
  sheet('Fontes', ['Base', 'Fonte conforme inventário', 'Instituição', 'Portais de acesso', 'Endereços registrados', ...colunasDatas],
    fontes.map(f => [f.base, f.nome, f.instituicao, f.portais.map(p => p.nome).join('; '), f.urls.length,
      ...datasAgrupadas(vinculos.filter(v => v.base === f.base && v.fonte.trim() === f.nome.trim()))]));
  const urls = [...new Set(fontes.flatMap(f => f.urls))].sort();
  sheet('Endereços', ['Endereço de acesso', 'Bases', 'Fontes associadas', ...colunasDatas], urls.map(url => {
    const associadas = fontes.filter(f => f.urls.includes(url));
    return [url, [...new Set(associadas.map(f => f.base))].join('; '), [...new Set(associadas.map(f => f.nome))].join('; '),
      ...datasAgrupadas(vinculos.filter(v => v.url.trim() === url))];
  }), 1);
  sheet('Evidências por fonte', ['Base', 'Fonte conforme inventário', 'Link de acesso', 'Código / identificação', 'Indicador / ação / norma', 'Programa', 'Órgão', 'Ano', 'Detalhe', ...colunasDatas],
    vinculos.map(v => [v.base, v.fonte, v.url, v.codigo, v.nome, v.programa || '', v.orgao || '', v.ano || '', v.detalhe || '',
      dataUTC(v.dataColeta), dataUTC(v.dataConsulta), dataUTC(v.dataCadastro), dataUTC(v.dataAtualizacao)]), 3);
  const resumo = sheet('Resumo', ['Universo', 'Total'], [
    ['Denominações estatísticas', ''], ['Denominações orçamentárias', ''], ['Referências normativas', ''],
    ['Denominações nas três bases', ''], ['Endereços distintos', ''], ['Relações evidência–fonte', ''],
    ['Extraído em (UTC)', new Date().toISOString()],
    ['Critério', 'Catálogo completo, independentemente dos filtros da tela. Fontes sem URL preservadas. Repetições de endereço entre evidências são mantidas na aba Evidências por fonte.'],
    ['Significado das datas', 'Coleta e consulta somente quando documentadas. Cadastro corresponde à criação do registro atual no sistema (created_at), não à publicação no portal nem necessariamente ao primeiro envio histórico. Última alteração corresponde a updated_at e pode ser uma correção administrativa, não uma nova coleta.'],
    ['Datas agrupadas', 'Fontes e Endereços mostram a data única ou o intervalo mínimo–máximo dos registros associados. As datas individuais estão em Evidências por fonte. Todas em UTC.'],
    ['Datas ausentes', 'Não registrada = não há data documentada disponível. Ano da evidência e data de geração desta planilha não são datas de coleta/consulta ou atualização do portal de origem.'],
  ]);
  ['Estatística', 'Orçamentária', 'Normativa'].forEach((base, i) => {
    resumo.getCell(i + 2, 2).value = { formula: `COUNTIF(Fontes!A2:A${fontes.length + 1},"${base}")`, result: fontes.filter(f => f.base === base).length };
  });
  resumo.getCell('B5').value = { formula: 'SUM(B2:B4)', result: fontes.length };
  resumo.getCell('B6').value = { formula: `COUNTA('Endereços'!A2:A${urls.length + 1})`, result: urls.length };
  resumo.getCell('B7').value = { formula: `COUNTA('Evidências por fonte'!A2:A${vinculos.length + 1})`, result: vinculos.length };
  return wb;
}

export async function exportFontesWorkbook(fontes: FonteCatalogo[], vinculos: VinculoFonteExport[]) {
  const wb = await buildFontesWorkbook(fontes, vinculos);
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Fontes-completas-CERD-${new Date().toISOString().slice(0, 10)}.xlsx`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
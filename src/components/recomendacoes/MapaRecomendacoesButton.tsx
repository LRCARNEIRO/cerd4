import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSpreadsheet, FileText, Map as MapIcon } from 'lucide-react';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { useEvidenceOverrides } from '@/hooks/useEvidenceOverrides';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { classificarOrigemLacuna } from '@/utils/classificarOrigemLacuna';
import { FAIXA_LABEL, formatScore } from '@/utils/esforcoImpacto';

export interface MapaLinha {
  ordem: number; rec: string; titulo: string; artigos: string;
  est: number; norm: number; orc: number; total: number;
  esforco: number; classeEsforco: string; impacto: number; classeImpacto: string;
}

export function useMapaRecomendacoes() {
  const { data: recs } = useLacunasIdentificadas({});
  const [overrides] = useEvidenceOverrides();
  const { diagnosticMap, isReady } = useDiagnosticSensor(recs, overrides);
  const linhas = useMemo<MapaLinha[]>(() => {
    if (!recs) return [];
    const g = { cerd: [] as typeof recs, rg: [] as typeof recs, durban: [] as typeof recs };
    recs.forEach(l => g[classificarOrigemLacuna(l.paragrafo)].push(l));
    g.cerd.sort((a, b) => (parseInt(a.paragrafo.replace(/\D/g, '')) || 0) - (parseInt(b.paragrafo.replace(/\D/g, '')) || 0));
    g.rg.sort((a, b) => a.paragrafo.localeCompare(b.paragrafo));
    g.durban.sort((a, b) => a.paragrafo.localeCompare(b.paragrafo));
    return [...g.cerd, ...g.rg, ...g.durban].map((l, i) => {
      const ei = diagnosticMap.get(l.id)?.auditoria.esforcoImpacto;
      const est = ei?.contagens.estatistica ?? 0, norm = ei?.contagens.normativa ?? 0, orc = ei?.contagens.orcamentaria ?? 0;
      const p = l.paragrafo.trim();
      return {
        ordem: i + 1, rec: p.startsWith('§') ? p : `§${p}`, titulo: l.tema,
        artigos: (l.artigos_convencao || []).join(', '),
        est, norm, orc, total: est + norm + orc,
        esforco: ei?.esforco ?? 0, classeEsforco: ei ? FAIXA_LABEL[ei.faixaEsforco] : '—',
        impacto: ei?.impacto ?? 0, classeImpacto: ei ? FAIXA_LABEL[ei.faixaImpacto] : '—',
      };
    });
  }, [recs, diagnosticMap]);
  return { linhas, isReady: isReady && linhas.length > 0 };
}

const dataHoje = () => new Date().toLocaleDateString('pt-BR');

function baixar(blob: Blob, nome: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nome; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

function baixarCSV(linhas: MapaLinha[]) {
  const esc = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const num = (n: number) => formatScore(n);
  const t1 = [['Ordem', 'Rec.', 'Título', 'Artigo(s)', 'Est.', 'Norm.', 'Orç.', 'Total'],
    ...linhas.map(l => [l.ordem, l.rec, l.titulo, l.artigos, l.est, l.norm, l.orc, l.total])];
  const t2 = [['Recomendação', 'Esforço', 'Classe', 'Impacto', 'Classe'],
    ...linhas.map(l => [l.rec, num(l.esforco), l.classeEsforco, num(l.impacto), l.classeImpacto])];
  const csv = ['Mapa das 42 Recomendações e Artigos ICERD', ...t1.map(r => r.map(esc).join(';')), '',
    'Resultados por recomendação', ...t2.map(r => r.map(esc).join(';'))].join('\r\n');
  baixar(new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' }), 'Mapa-42-Recomendacoes.csv');
}

async function baixarDOCX(linhas: MapaLinha[]) {
  const d = await import('docx');
  const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, HeadingLevel, AlignmentType } = d;
  const b = { style: BorderStyle.SINGLE, size: 1, color: 'BBBBBB' };
  const borders = { top: b, bottom: b, left: b, right: b };
  const cell = (t: string, w: number, head = false) => new TableCell({
    borders, width: { size: w, type: WidthType.DXA },
    shading: head ? { fill: 'E7ECF2', type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: [new Paragraph({ children: [new TextRun({ text: t, bold: head, size: 18 })] })],
  });
  const tabela = (cols: number[], cab: string[], rows: string[][]) => new Table({
    width: { size: cols.reduce((a, c) => a + c, 0), type: WidthType.DXA }, columnWidths: cols,
    rows: [new TableRow({ tableHeader: true, children: cab.map((c, i) => cell(c, cols[i], true)) }),
      ...rows.map(r => new TableRow({ children: r.map((c, i) => cell(c, cols[i])) }))],
  });
  const c1 = [700, 1200, 3826, 1100, 600, 600, 600, 700];
  const c2 = [2626, 1600, 1600, 1600, 1600];
  const doc = new Document({
    styles: { default: { document: { run: { font: 'Arial', size: 20 } } } },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Mapa das 42 Recomendações e Artigos ICERD')] }),
        new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: `Gerado automaticamente a partir dos dados vigentes do sistema em ${dataHoje()}. Contagens = evidências distintas vinculadas a cada recomendação (estatísticas, normativas e registros orçamentários Ação×Ano).`, size: 18 })] }),
        tabela(c1, ['Ordem', 'Rec.', 'Título', 'Artigo(s)', 'Est.', 'Norm.', 'Orç.', 'Total'],
          linhas.map(l => [String(l.ordem), l.rec, l.titulo, l.artigos, String(l.est), String(l.norm), String(l.orc), String(l.total)])),
        new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 360 }, children: [new TextRun('Resultados por recomendação')] }),
        new Paragraph({ spacing: { after: 160 }, children: [new TextRun({ text: 'Tetos 31/25/4, pesos iguais, regra estatística melhorou/estável = 1 e piorou = 0, faixas 25/60.', size: 18 })] }),
        tabela(c2, ['Recomendação', 'Esforço', 'Classe', 'Impacto', 'Classe'],
          linhas.map(l => [l.rec, formatScore(l.esforco), l.classeEsforco, formatScore(l.impacto), l.classeImpacto])),
        new Paragraph({ alignment: AlignmentType.LEFT, children: [] }),
      ],
    }],
  });
  baixar(await Packer.toBlob(doc), 'Mapa-42-Recomendacoes.docx');
}

export function MapaRecomendacoesButton() {
  const [open, setOpen] = useState(false);
  const { linhas, isReady } = useMapaRecomendacoes();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5"><MapIcon className="w-4 h-4" /> Mapa das 42 Recomendações</Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>Mapa das 42 Recomendações e Artigos ICERD</DialogTitle></DialogHeader>
        <div className="flex gap-2 mb-2">
          <Button size="sm" disabled={!isReady} onClick={() => baixarDOCX(linhas)} className="gap-1.5"><FileText className="w-4 h-4" /> Baixar DOCX</Button>
          <Button size="sm" variant="outline" disabled={!isReady} onClick={() => baixarCSV(linhas)} className="gap-1.5"><FileSpreadsheet className="w-4 h-4" /> Baixar planilha (CSV)</Button>
        </div>
        {!isReady ? <p className="text-sm text-muted-foreground">Calculando…</p> : (
          <>
            <UITable data-testid="mapa-tabela-1">
              <TableHeader><TableRow>{['Ordem', 'Rec.', 'Título', 'Artigo(s)', 'Est.', 'Norm.', 'Orç.', 'Total'].map(h => <TableHead key={h}>{h}</TableHead>)}</TableRow></TableHeader>
              <TableBody>{linhas.map(l => (
                <TableRow key={l.rec}><TableCell>{l.ordem}</TableCell><TableCell className="font-mono">{l.rec}</TableCell><TableCell>{l.titulo}</TableCell><TableCell>{l.artigos}</TableCell><TableCell>{l.est}</TableCell><TableCell>{l.norm}</TableCell><TableCell>{l.orc}</TableCell><TableCell className="font-semibold">{l.total}</TableCell></TableRow>
              ))}</TableBody>
            </UITable>
            <h3 className="font-semibold mt-6 mb-2">Resultados por recomendação</h3>
            <UITable data-testid="mapa-tabela-2">
              <TableHeader><TableRow>{['Recomendação', 'Esforço', 'Classe', 'Impacto', 'Classe'].map((h, i) => <TableHead key={i}>{h}</TableHead>)}</TableRow></TableHeader>
              <TableBody>{linhas.map(l => (
                <TableRow key={l.rec}><TableCell className="font-mono">{l.rec}</TableCell><TableCell>{formatScore(l.esforco)}</TableCell><TableCell>{l.classeEsforco}</TableCell><TableCell>{formatScore(l.impacto)}</TableCell><TableCell>{l.classeImpacto}</TableCell></TableRow>
              ))}</TableBody>
            </UITable>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

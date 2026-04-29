import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, Minus, Star } from 'lucide-react';
import { evaluateIndicadorDetailed, type IndicadorEvalDetail } from './evaluateIndicador';

interface FarolDrilldownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artigoNumero: string;
  artigoTitulo: string;
  indicadores: any[];
  normativos: any[];
  orcamento: any[];
  initialTab?: string;
}

function ResultIcon({ result }: { result: string }) {
  if (result === 'favoravel') return <TrendingUp className="w-4 h-4 text-success" />;
  if (result === 'desfavoravel') return <TrendingDown className="w-4 h-4 text-destructive" />;
  if (result === 'novo') return <Star className="w-4 h-4 text-primary" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function ResultBadge({ result }: { result: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    favoravel: { label: 'Melhoria ↑', cls: 'bg-success/20 text-success' },
    desfavoravel: { label: 'Piora ↓', cls: 'bg-destructive/20 text-destructive' },
    novo: { label: 'Novo ★', cls: 'bg-primary/20 text-primary' },
    neutro: { label: 'Neutro', cls: 'bg-muted text-muted-foreground' },
  };
  const { label, cls } = map[result] || map.neutro;
  return <Badge className={cls}>{label}</Badge>;
}

function fmtNum(v: number | undefined): string {
  if (v === undefined) return '—';
  if (Math.abs(v) >= 1e6) return `${(v / 1e6).toFixed(2)}M`;
  if (Math.abs(v) >= 1e3) return `${(v / 1e3).toFixed(1)}k`;
  if (v % 1 !== 0) return v.toFixed(4);
  return v.toLocaleString('pt-BR');
}

function downloadReport(title: string, content: string) {
  const blob = new Blob([content], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `auditoria-${title.replace(/\s+/g, '-').toLowerCase()}.html`; a.click();
  URL.revokeObjectURL(url);
}

/** Extrai ano de uma data ISO ou de string contendo 4 dígitos. */
function extractAno(d: any): string {
  if (!d) return '—';
  const s = String(d);
  const m = s.match(/(19|20)\d{2}/);
  return m ? m[0] : '—';
}

/** Heurística para extrair órgão do título do normativo (siglas comuns). */
function extractOrgao(titulo: string): string {
  if (!titulo) return '—';
  const t = titulo.toUpperCase();
  const siglas = ['MIR', 'MDHC', 'SEPPIR', 'STF', 'STJ', 'TSE', 'TST', 'CNJ', 'CNMP', 'AGU', 'PGR', 'MJ', 'MPF', 'MEC', 'MS', 'INCRA', 'FUNAI', 'SESAI', 'IBGE', 'DPU', 'DPF', 'IPHAN', 'CONANDA', 'CONAQ'];
  for (const s of siglas) {
    const re = new RegExp(`\\b${s}\\b`);
    if (re.test(t)) return s;
  }
  return '—';
}

/** Constrói URL absoluta para o indicador, com âncora p/ scroll automático. */
function buildIndicadorLink(id: string): string {
  if (typeof window === 'undefined') return `/estatisticas?ind=${id}#indicador-${id}`;
  return `${window.location.origin}/estatisticas?ind=${id}#indicador-${id}`;
}

export function FarolDrilldownDialog({ open, onOpenChange, artigoNumero, artigoTitulo, indicadores, normativos, orcamento, initialTab = 'indicadores' }: FarolDrilldownDialogProps) {

  const indEvals = indicadores.map(ind => ({
    ind,
    detail: evaluateIndicadorDetailed(ind),
  }));

  const handleDownload = () => {
    const indRows = indEvals.map(({ ind, detail }) => `
      <tr>
        <td>${ind.nome}</td>
        <td>${ind.categoria}</td>
        <td>${ind.fonte || '—'}</td>
        <td style="text-align:center">${detail.anoAntigo ?? '—'}</td>
        <td style="text-align:right">${detail.valorAntigo !== undefined ? fmtNum(detail.valorAntigo) : '—'}</td>
        <td style="text-align:center">${detail.anoRecente ?? '—'}</td>
        <td style="text-align:right">${detail.valorRecente !== undefined ? fmtNum(detail.valorRecente) : '—'}</td>
        <td style="text-align:center;color:${detail.result === 'favoravel' ? '#16a34a' : detail.result === 'desfavoravel' ? '#dc2626' : '#6b7280'}">${detail.result === 'favoravel' ? '↑ Melhoria' : detail.result === 'desfavoravel' ? '↓ Piora' : detail.result === 'novo' ? '★ Novo' : '— Neutro'}</td>
      </tr>`).join('');

    const normRows = normativos.map(d => `
      <tr><td>${d.titulo}</td><td>${d.categoria}</td><td>${d.status}</td><td>${(d.artigos_convencao || []).join(', ')}</td></tr>`).join('');

    const orcRows = orcamento.map(o => `
      <tr><td>${o.programa}</td><td>${o.orgao}</td><td>${o.esfera}</td><td style="text-align:right">R$ ${((o.dotacao_autorizada || 0) / 1e6).toFixed(2)}M</td><td style="text-align:right">R$ ${((o.liquidado || 0) / 1e6).toFixed(2)}M</td><td style="text-align:right">R$ ${((o.pago || 0) / 1e6).toFixed(2)}M</td></tr>`).join('');

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Auditoria Art. ${artigoNumero}</title>
      <style>body{font-family:system-ui;padding:2rem;max-width:1400px;margin:auto}table{width:100%;border-collapse:collapse;margin:1rem 0}th,td{border:1px solid #ddd;padding:6px 8px;font-size:11px}th{background:#f5f5f5;font-weight:600}h2{margin-top:2rem;color:#333}h3{color:#555}</style></head>
      <body>
      <h1>Auditoria — Art. ${artigoNumero}: ${artigoTitulo}</h1>
      <p>Gerado em ${new Date().toLocaleString('pt-BR')}</p>

      <h2>📊 Indicadores (${indicadores.length})</h2>
      <p>${indEvals.filter(e => e.detail.result === 'favoravel').length} com melhoria, ${indEvals.filter(e => e.detail.result === 'desfavoravel').length} com piora, ${indEvals.filter(e => e.detail.result === 'novo').length} recém-mensurados, ${indEvals.filter(e => e.detail.result === 'neutro').length} neutros</p>
      <table><thead><tr><th>Indicador</th><th>Categoria</th><th>Fonte</th><th>Ano Antigo</th><th>Valor Antigo</th><th>Ano Recente</th><th>Valor Recente</th><th>Resultado</th></tr></thead>
      <tbody>${indRows}</tbody></table>

      <h2>⚖️ Normativos (${normativos.length})</h2>
      <table><thead><tr><th>Título</th><th>Categoria</th><th>Status</th><th>Artigos</th></tr></thead>
      <tbody>${normRows}</tbody></table>

      <h2>💰 Orçamento (${orcamento.length} ações)</h2>
      <table><thead><tr><th>Programa</th><th>Órgão</th><th>Esfera</th><th>Dotação Autorizada</th><th>Liquidado</th><th>Pago</th></tr></thead>
      <tbody>${orcRows}</tbody></table>
      </body></html>`;

    downloadReport(`art-${artigoNumero}`, html);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base">
            Auditoria — Art. {artigoNumero}: {artigoTitulo}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            {indicadores.length} indicadores · {normativos.length} normativos · {orcamento.length} ações orçamentárias
            <Button variant="outline" size="sm" onClick={handleDownload} className="ml-auto gap-1">
              <Download className="w-3 h-3" /> Baixar Relatório
            </Button>
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={initialTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="indicadores">📊 Indicadores ({indicadores.length})</TabsTrigger>
            <TabsTrigger value="normativos">⚖️ Normativos ({normativos.length})</TabsTrigger>
            <TabsTrigger value="orcamento">💰 Orçamento ({orcamento.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="indicadores" className="mt-3">
            <div className="flex gap-2 mb-3 flex-wrap text-xs">
              <Badge className="bg-success/20 text-success">{indEvals.filter(e => e.detail.result === 'favoravel').length} melhoria</Badge>
              <Badge className="bg-destructive/20 text-destructive">{indEvals.filter(e => e.detail.result === 'desfavoravel').length} piora</Badge>
              <Badge className="bg-primary/20 text-primary">{indEvals.filter(e => e.detail.result === 'novo').length} novo</Badge>
              <Badge className="bg-muted text-muted-foreground">{indEvals.filter(e => e.detail.result === 'neutro').length} neutro</Badge>
            </div>
            <div className="overflow-auto max-h-[50vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Indicador</TableHead>
                    <TableHead className="text-xs">Categoria</TableHead>
                    <TableHead className="text-xs text-center">Ano Antigo</TableHead>
                    <TableHead className="text-xs text-right">Valor</TableHead>
                    <TableHead className="text-xs text-center">Ano Recente</TableHead>
                    <TableHead className="text-xs text-right">Valor</TableHead>
                    <TableHead className="text-xs text-center">Resultado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {indEvals.map(({ ind, detail }) => (
                    <TableRow key={ind.id}>
                      <TableCell className="text-xs max-w-[200px] truncate" title={ind.nome}>{ind.nome}</TableCell>
                      <TableCell className="text-xs">{ind.categoria}</TableCell>
                      <TableCell className="text-xs text-center">{detail.anoAntigo ?? '—'}</TableCell>
                      <TableCell className="text-xs text-right">{detail.valorAntigo !== undefined ? fmtNum(detail.valorAntigo) : '—'}</TableCell>
                      <TableCell className="text-xs text-center">{detail.anoRecente ?? '—'}</TableCell>
                      <TableCell className="text-xs text-right">{detail.valorRecente !== undefined ? fmtNum(detail.valorRecente) : '—'}</TableCell>
                      <TableCell className="text-xs text-center"><ResultBadge result={detail.result} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="normativos" className="mt-3">
            <div className="overflow-auto max-h-[50vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Título</TableHead>
                    <TableHead className="text-xs">Categoria</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-xs">Artigos</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {normativos.map(d => (
                    <TableRow key={d.id}>
                      <TableCell className="text-xs max-w-[250px] truncate" title={d.titulo}>{d.titulo}</TableCell>
                      <TableCell className="text-xs">{d.categoria}</TableCell>
                      <TableCell className="text-xs">{d.status}</TableCell>
                      <TableCell className="text-xs">{(d.artigos_convencao || []).join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="orcamento" className="mt-3">
            <div className="overflow-auto max-h-[50vh]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Programa</TableHead>
                    <TableHead className="text-xs">Órgão</TableHead>
                    <TableHead className="text-xs">Esfera</TableHead>
                    <TableHead className="text-xs text-right">Dotação Aut.</TableHead>
                    <TableHead className="text-xs text-right">Liquidado</TableHead>
                    <TableHead className="text-xs text-right">Pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamento.map(o => (
                    <TableRow key={o.id}>
                      <TableCell className="text-xs max-w-[200px] truncate" title={o.programa}>{o.programa}</TableCell>
                      <TableCell className="text-xs">{o.orgao}</TableCell>
                      <TableCell className="text-xs">{o.esfera}</TableCell>
                      <TableCell className="text-xs text-right">R$ {((o.dotacao_autorizada || 0) / 1e6).toFixed(2)}M</TableCell>
                      <TableCell className="text-xs text-right">R$ {((o.liquidado || 0) / 1e6).toFixed(2)}M</TableCell>
                      <TableCell className="text-xs text-right">R$ {((o.pago || 0) / 1e6).toFixed(2)}M</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

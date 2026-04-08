import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { TrendingUp, TrendingDown, Minus, FileText, DollarSign, BarChart3 } from 'lucide-react';
import type { RecomendacaoDiagnostic } from '@/hooks/useDiagnosticSensor';

interface EvidenceDrilldownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paragrafo: string;
  tema: string;
  diagnostic: RecomendacaoDiagnostic | undefined;
}

export function EvidenceDrilldownDialog({ open, onOpenChange, paragrafo, tema, diagnostic }: EvidenceDrilldownDialogProps) {
  if (!diagnostic) return null;

  const { auditoria, linkedIndicadores, linkedOrcamento, linkedNormativos } = diagnostic;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            §{paragrafo} — {tema}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Evidências cruzadas que fundamentam o status computado
          </DialogDescription>
        </DialogHeader>

        {/* Score Summary */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold">{auditoria.scoreGlobal}</p>
            <p className="text-[10px] text-muted-foreground">Score</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <StatusBadge status={auditoria.statusComputado} size="sm" />
          <div className="flex-1 text-xs text-muted-foreground">
            Indicadores: {auditoria.indicadores.score}/100 (40%) · 
            Orçamento: {auditoria.orcamento.score}/100 (30%) · 
            Normativos: {auditoria.normativos.score}/100 (30%)
          </div>
        </div>

        {/* Indicadores */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-4 h-4 text-chart-1" />
            Indicadores ({linkedIndicadores.length})
          </h4>
          {linkedIndicadores.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Nenhum indicador vinculado</p>
          ) : (
            <div className="rounded-md border overflow-auto max-h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Indicador</TableHead>
                    <TableHead className="text-[10px] w-24">Categoria</TableHead>
                    <TableHead className="text-[10px] w-24">Tendência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedIndicadores.map((ind, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{ind.nome}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{ind.categoria}</TableCell>
                      <TableCell>
                        {ind.tendencia === 'crescente' ? (
                          <span className="flex items-center gap-1 text-[10px] text-success"><TrendingUp className="w-3 h-3" /> Crescente</span>
                        ) : ind.tendencia === 'decrescente' ? (
                          <span className="flex items-center gap-1 text-[10px] text-destructive"><TrendingDown className="w-3 h-3" /> Decrescente</span>
                        ) : (
                          <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Minus className="w-3 h-3" /> {ind.tendencia || 'N/D'}</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground mt-1">{auditoria.indicadores.justificativa}</p>
        </div>

        {/* Orçamento */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
            <DollarSign className="w-4 h-4 text-chart-2" />
            Ações Orçamentárias ({linkedOrcamento.length})
          </h4>
          {linkedOrcamento.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Nenhuma ação orçamentária vinculada</p>
          ) : (
            <div className="rounded-md border overflow-auto max-h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Programa</TableHead>
                    <TableHead className="text-[10px] w-28">Órgão</TableHead>
                    <TableHead className="text-[10px] w-16">Ano</TableHead>
                    <TableHead className="text-[10px] w-24">Pago</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedOrcamento.map((orc, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{orc.programa}</TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">{orc.orgao}</TableCell>
                      <TableCell className="text-[10px]">{orc.ano}</TableCell>
                      <TableCell className="text-[10px]">
                        {orc.pago ? `R$ ${(Number(orc.pago) / 1e6).toFixed(1)}M` : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground mt-1">{auditoria.orcamento.justificativa}</p>
        </div>

        {/* Normativos */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
            <FileText className="w-4 h-4 text-chart-3" />
            Normativos ({linkedNormativos.length})
          </h4>
          {linkedNormativos.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Nenhum normativo vinculado</p>
          ) : (
            <div className="rounded-md border overflow-auto max-h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Título</TableHead>
                    <TableHead className="text-[10px] w-24">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linkedNormativos.map((norm, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{norm.titulo}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px]">{norm.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          <p className="text-[10px] text-muted-foreground mt-1">{auditoria.normativos.justificativa}</p>
        </div>

        {/* Methodology note */}
        <div className="p-2 bg-muted/30 rounded text-[10px] text-muted-foreground">
          <strong>Faixas:</strong> ≥80 Cumprido | ≥55 Parcial | ≥35 Em Andamento | ≥15 Não Cumprido | &lt;15 Retrocesso.
          Pesos: Indicadores 40% | Orçamento 30% | Normativos 30%.
        </div>
      </DialogContent>
    </Dialog>
  );
}

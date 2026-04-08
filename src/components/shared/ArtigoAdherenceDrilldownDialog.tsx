import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Clock, AlertTriangle, FileText, DollarSign, BarChart3, Scale } from 'lucide-react';

interface ArtigoData {
  numero: string;
  tituloCompleto: string;
  grauAderencia: number;
  lacunasTotal: number;
  lacunasCumpridas: number;
  lacunasParciais: number;
  lacunasNaoCumpridas: number;
  lacunasRetrocesso: number;
  orcamentoProgramas: number;
  normativosCount: number;
  indicadoresCount: number;
  seriesEstatisticas: number;
  respostasTotal: number;
  respostasCumpridas: number;
  respostasNaoCumpridas: number;
  veredito: string;
}

interface RecomendacaoDetail {
  paragrafo: string;
  tema: string;
  status: string;
}

interface ArtigoAdherenceDrilldownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artigo: ArtigoData | null;
  recomendacoes: RecomendacaoDetail[];
  normativos: { titulo: string; status: string }[];
  orcamentos: { programa: string; orgao: string; ano: number }[];
}

export function ArtigoAdherenceDrilldownDialog({ open, onOpenChange, artigo, recomendacoes, normativos, orcamentos }: ArtigoAdherenceDrilldownDialogProps) {
  if (!artigo) return null;

  const emAndamento = artigo.lacunasTotal - artigo.lacunasCumpridas - artigo.lacunasParciais - artigo.lacunasNaoCumpridas - artigo.lacunasRetrocesso;
  const badgeLabel = artigo.grauAderencia >= 70 ? 'Boa Aderência' : artigo.grauAderencia >= 40 ? 'Aderência Parcial' : 'Baixa Aderência';
  const badgeColor = artigo.grauAderencia >= 70 ? 'bg-success/10 text-success border-success/30' : artigo.grauAderencia >= 40 ? 'bg-warning/10 text-warning border-warning/30' : 'bg-destructive/10 text-destructive border-destructive/30';

  const statusLabels: Record<string, { label: string; icon: typeof CheckCircle2 }> = {
    cumprido: { label: 'Cumprido', icon: CheckCircle2 },
    parcialmente_cumprido: { label: 'Parcial', icon: Clock },
    em_andamento: { label: 'Em Andamento', icon: Clock },
    nao_cumprido: { label: 'Não Cumprido', icon: XCircle },
    retrocesso: { label: 'Retrocesso', icon: AlertTriangle },
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Art. {artigo.numero} — {artigo.tituloCompleto}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Detalhamento de todas as evidências que compõem a aderência deste artigo
          </DialogDescription>
        </DialogHeader>

        {/* Score Summary */}
        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="text-center">
            <p className="text-2xl font-bold">{artigo.grauAderencia}%</p>
            <p className="text-[10px] text-muted-foreground">Aderência</p>
          </div>
          <div className="h-8 w-px bg-border" />
          <Badge variant="outline" className={`text-xs ${badgeColor}`}>{badgeLabel}</Badge>
          <Progress value={artigo.grauAderencia} className="h-2 flex-1" />
        </div>

        {/* Composição do Score */}
        <div className="grid grid-cols-5 gap-2 text-center">
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-sm font-bold">{artigo.lacunasCumpridas}/{artigo.lacunasTotal}</p>
            <p className="text-[10px] text-muted-foreground">Recom. Cumpr. (50%)</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-sm font-bold">{artigo.normativosCount}</p>
            <p className="text-[10px] text-muted-foreground">Normativos (15%)</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-sm font-bold">{artigo.orcamentoProgramas}</p>
            <p className="text-[10px] text-muted-foreground">Orçamento (10%)</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-sm font-bold">{artigo.indicadoresCount}</p>
            <p className="text-[10px] text-muted-foreground">Indicadores (15%)</p>
          </div>
          <div className="p-2 bg-muted/30 rounded">
            <p className="text-sm font-bold">{artigo.seriesEstatisticas}</p>
            <p className="text-[10px] text-muted-foreground">Amplitude (10%)</p>
          </div>
        </div>

        {/* Recomendações ONU vinculadas */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
            <BarChart3 className="w-4 h-4 text-chart-1" />
            Recomendações ONU Vinculadas ({recomendacoes.length})
          </h4>
          <div className="flex flex-wrap gap-2 mb-2">
            <Badge variant="outline" className="text-[10px] text-success border-success/30">✓ {artigo.lacunasCumpridas} Cumprida(s)</Badge>
            <Badge variant="outline" className="text-[10px] text-warning border-warning/30">~ {artigo.lacunasParciais} Parcial(is)</Badge>
            {emAndamento > 0 && <Badge variant="outline" className="text-[10px] text-info border-info/30">⏳ {emAndamento} Em Andamento</Badge>}
            <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">✗ {artigo.lacunasNaoCumpridas} Não Cumprida(s)</Badge>
            {artigo.lacunasRetrocesso > 0 && <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">↓ {artigo.lacunasRetrocesso} Retrocesso(s)</Badge>}
          </div>
          {recomendacoes.length > 0 && (
            <div className="rounded-md border overflow-auto max-h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px] w-16">§</TableHead>
                    <TableHead className="text-[10px]">Tema</TableHead>
                    <TableHead className="text-[10px] w-28">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recomendacoes.map((r, i) => {
                    const st = statusLabels[r.status] || statusLabels.nao_cumprido;
                    return (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-xs">{r.paragrafo}</TableCell>
                        <TableCell className="text-xs">{r.tema}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-[10px]">{st.label}</Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Normativos */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
            <FileText className="w-4 h-4 text-chart-3" />
            Instrumentos Normativos ({normativos.length})
          </h4>
          {normativos.length === 0 ? (
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
                  {normativos.slice(0, 20).map((n, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{n.titulo}</TableCell>
                      <TableCell><Badge variant="outline" className="text-[10px]">{n.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Orçamento */}
        <div>
          <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
            <DollarSign className="w-4 h-4 text-chart-2" />
            Ações Orçamentárias ({orcamentos.length})
          </h4>
          {orcamentos.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Nenhuma ação orçamentária vinculada</p>
          ) : (
            <div className="rounded-md border overflow-auto max-h-48">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[10px]">Programa</TableHead>
                    <TableHead className="text-[10px] w-28">Órgão</TableHead>
                    <TableHead className="text-[10px] w-16">Ano</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orcamentos.slice(0, 20).map((o, i) => (
                    <TableRow key={i}>
                      <TableCell className="text-xs">{o.programa}</TableCell>
                      <TableCell className="text-[10px]">{o.orgao}</TableCell>
                      <TableCell className="text-[10px]">{o.ano}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>

        {/* Veredito */}
        <div className="p-3 bg-muted/30 rounded-lg">
          <p className="text-xs text-muted-foreground leading-relaxed"><strong>Veredito:</strong> {artigo.veredito}</p>
        </div>

        {/* Methodology */}
        <div className="p-2 bg-muted/30 rounded text-[10px] text-muted-foreground">
          <strong>Metodologia:</strong> Recomendações ONU (30%), Normativos (20%), Orçamento — contagem de ações (15%), Indicadores + Séries (25%), Amplitude de Fontes (10%). O orçamento não considera valores em R$.
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCircle2, XCircle, Clock, AlertTriangle, FileText, DollarSign, BarChart3, Scale, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { LinkedIndicador, LinkedOrcamento, LinkedNormativo } from '@/hooks/useDiagnosticSensor';

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
  normativos: LinkedNormativo[];
  orcamentos: LinkedOrcamento[];
  indicadores?: LinkedIndicador[];
  /** Which tab to focus on open */
  focusTab?: 'recomendacoes' | 'indicadores' | 'orcamento' | 'normativos' | null;
}

export function ArtigoAdherenceDrilldownDialog({
  open, onOpenChange, artigo, recomendacoes, normativos, orcamentos, indicadores = [], focusTab
}: ArtigoAdherenceDrilldownDialogProps) {
  const [maximized, setMaximized] = useState(false);

  if (!artigo) return null;

  const badgeLabel = artigo.grauAderencia >= 70 ? 'Boa Aderência' : artigo.grauAderencia >= 40 ? 'Aderência Parcial' : 'Baixa Aderência';
  const badgeColor = artigo.grauAderencia >= 70 ? 'bg-success/10 text-success border-success/30' : artigo.grauAderencia >= 40 ? 'bg-warning/10 text-warning border-warning/30' : 'bg-destructive/10 text-destructive border-destructive/30';

  const statusLabels: Record<string, { label: string }> = {
    cumprido: { label: 'Cumprido' },
    parcialmente_cumprido: { label: 'Parcial' },
    em_andamento: { label: 'Parcial' },
    nao_cumprido: { label: 'Não Cumprido' },
    retrocesso: { label: 'Não Cumprido' },
  };

  const naoCumpridasTotal = artigo.lacunasNaoCumpridas + artigo.lacunasRetrocesso;

  // Order sections based on focusTab
  const sections = ['recomendacoes', 'indicadores', 'orcamento', 'normativos'] as const;
  const ordered = focusTab ? [focusTab, ...sections.filter(s => s !== focusTab)] : sections;

  const renderRecomendacoes = () => (
    <div>
      <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
        <BarChart3 className="w-4 h-4 text-chart-1" />
        Recomendações ONU Vinculadas ({recomendacoes.length})
      </h4>
      <div className="flex flex-wrap gap-2 mb-2">
        <Badge variant="outline" className="text-[10px] text-success border-success/30">✓ {artigo.lacunasCumpridas} Cumprida(s)</Badge>
        <Badge variant="outline" className="text-[10px] text-warning border-warning/30">~ {artigo.lacunasParciais} Parcial(is)</Badge>
        <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">✗ {naoCumpridasTotal} Não Cumprida(s)</Badge>
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
                    <TableCell><Badge variant="outline" className="text-[10px]">{st.label}</Badge></TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );

  const renderIndicadores = () => (
    <div>
      <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
        <BarChart3 className="w-4 h-4 text-chart-5" />
        Indicadores ({indicadores.length})
      </h4>
      {indicadores.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">Nenhum indicador vinculado via recomendações</p>
      ) : (
        <div className="rounded-md border overflow-auto max-h-48">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-[10px]">Nome</TableHead>
                <TableHead className="text-[10px] w-28">Categoria</TableHead>
                <TableHead className="text-[10px] w-24">Tendência</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {indicadores.map((ind, i) => (
                <TableRow key={i}>
                  <TableCell className="text-xs">{ind.nome}</TableCell>
                  <TableCell className="text-[10px]">{ind.categoria}</TableCell>
                  <TableCell className="text-[10px]">{ind.tendencia || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );

  const renderOrcamento = () => (
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
              {orcamentos.slice(0, 30).map((o, i) => (
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
  );

  const renderNormativos = () => (
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
              {normativos.slice(0, 30).map((n, i) => (
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
  );

  const sectionRenderers: Record<string, () => JSX.Element> = {
    recomendacoes: renderRecomendacoes,
    indicadores: renderIndicadores,
    orcamento: renderOrcamento,
    normativos: renderNormativos,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={maximized ? 'w-[95vw] max-w-[95vw] h-[95vh] max-h-[95vh]' : 'max-w-3xl max-h-[85vh]'}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base flex items-center gap-2">
              <Scale className="w-5 h-5" />
              Art. {artigo.numero} — {artigo.tituloCompleto}
            </DialogTitle>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setMaximized(!maximized)}>
              {maximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
          <DialogDescription className="text-xs">
            Evidências agregadas das recomendações vinculadas a este artigo (mesma base do Acompanhamento Gerencial)
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className={maximized ? 'h-[calc(95vh-120px)]' : 'max-h-[calc(85vh-120px)]'}>
          <div className="space-y-4 pr-4">
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
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="p-2 bg-muted/30 rounded">
                <p className="text-sm font-bold">{artigo.lacunasCumpridas}/{artigo.lacunasTotal}</p>
                <p className="text-[10px] text-muted-foreground">Recom. Cumpr. (50%)</p>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <p className="text-sm font-bold">{indicadores.length}</p>
                <p className="text-[10px] text-muted-foreground">Indicadores (15%)</p>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <p className="text-sm font-bold">{orcamentos.length}</p>
                <p className="text-[10px] text-muted-foreground">Orçamento (10%)</p>
              </div>
              <div className="p-2 bg-muted/30 rounded">
                <p className="text-sm font-bold">{normativos.length}</p>
                <p className="text-[10px] text-muted-foreground">Normativos (15%)</p>
              </div>
            </div>

            {/* Render sections in order (focused tab first) */}
            {ordered.map(section => (
              <div key={section}>{sectionRenderers[section]()}</div>
            ))}

            {/* Veredito */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <p className="text-xs text-muted-foreground leading-relaxed"><strong>Veredito:</strong> {artigo.veredito}</p>
            </div>

            {/* Methodology */}
            <div className="p-2 bg-muted/30 rounded text-[10px] text-muted-foreground">
              <strong>Fonte:</strong> Evidências agregadas das recomendações vinculadas a este artigo (mesma base do motor diagnóstico em Recomendações). Recomendações ONU cumpridas — taxa relativa (50%), Normativos (15%), Orçamento — contagem de ações (10%), Indicadores (15%), Amplitude de Fontes (10%).
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

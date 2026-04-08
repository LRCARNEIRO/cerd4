import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface ParagraphTextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paragrafo: string;
  tema: string;
  textoCompleto: string;
}

export function ParagraphTextDialog({ open, onOpenChange, paragrafo, tema, textoCompleto }: ParagraphTextDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">§ {paragrafo}</Badge>
            <DialogTitle className="text-base">Texto integral da recomendação</DialogTitle>
          </div>
          <DialogDescription className="text-xs">
            Use este conteúdo para auditar se o tema resumido está coerente com o parágrafo original.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-[11px] font-medium text-muted-foreground mb-1">Tema resumido</p>
            <p className="text-sm font-medium text-foreground">{tema}</p>
          </div>

          <div className="rounded-lg border bg-background">
            <div className="border-b px-3 py-2">
              <p className="text-[11px] font-medium text-muted-foreground">Parágrafo integral</p>
            </div>
            <ScrollArea className="max-h-[52vh] px-4 py-3">
              <p className="text-sm leading-6 whitespace-pre-wrap text-foreground">
                {textoCompleto || 'Texto integral não disponível para este parágrafo.'}
              </p>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ARTIGOS_CONVENCAO, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { Scale } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ArtigoFilterProps {
  selected: ArtigoConvencao | null;
  onSelect: (artigo: ArtigoConvencao | null) => void;
  counts?: Record<ArtigoConvencao, number>;
  compact?: boolean;
}

export function ArtigoFilter({ selected, onSelect, counts, compact }: ArtigoFilterProps) {
  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        <Badge
          variant={selected === null ? 'default' : 'outline'}
          className="cursor-pointer text-xs"
          onClick={() => onSelect(null)}
        >
          Todos
        </Badge>
        {ARTIGOS_CONVENCAO.map((art) => (
          <Badge
            key={art.numero}
            variant={selected === art.numero ? 'default' : 'outline'}
            className="cursor-pointer text-xs"
            onClick={() => onSelect(selected === art.numero ? null : art.numero)}
          >
            Art. {art.numero}
            {counts?.[art.numero] !== undefined && (
              <span className="ml-1 opacity-70">({counts[art.numero]})</span>
            )}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Scale className="w-4 h-4 text-primary" />
          Artigos da Convenção ICERD
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {ARTIGOS_CONVENCAO.map((art) => (
            <button
              key={art.numero}
              onClick={() => onSelect(selected === art.numero ? null : art.numero)}
              className={cn(
                'text-left p-3 rounded-lg border transition-all text-xs',
                selected === art.numero
                  ? 'border-primary bg-primary/10 ring-1 ring-primary'
                  : 'border-border hover:border-primary/40 hover:bg-muted/50'
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-primary">Art. {art.numero}</span>
                {counts?.[art.numero] !== undefined && (
                  <Badge variant="secondary" className="text-[10px] h-5">
                    {counts[art.numero]}
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground line-clamp-2">{art.titulo}</p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

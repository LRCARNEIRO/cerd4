import { Badge } from '@/components/ui/badge';

const PRODUCTS = [
  { id: 'base-evidencias', number: '01', name: 'Base de Evidências' },
  { id: 'sumario-executivo', number: '02', name: 'Sumário Executivo' },
  { id: 'farol-recomendacoes', number: '03', name: 'Farol de Recomendações' },
  { id: 'protocolo-metodologico', number: '04', name: 'Protocolo Metodológico' },
  { id: 'ieat-racial', number: '05', name: 'Índice IEAT-Racial' },
];

export default function ProductNav() {
  return (
    <section className="sticky top-14 z-40 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest mr-3 flex-shrink-0 font-medium">
            Produtos
          </span>
          {PRODUCTS.map((p) => (
            <a
              key={p.id}
              href={`#${p.id}`}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono border-border">
                {p.number}
              </Badge>
              {p.name}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

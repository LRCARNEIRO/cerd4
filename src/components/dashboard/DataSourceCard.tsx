import { ExternalLink, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { DataSource } from '@/types/cerd';

interface DataSourceCardProps {
  source: DataSource;
}

const accessTypeLabels = {
  api: 'API',
  download: 'Download',
  portal: 'Portal Web',
  sidra: 'SIDRA'
};

export function DataSourceCard({ source }: DataSourceCardProps) {
  return (
    <div className="data-card">
      <div className="flex items-start gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <Database className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground">{source.sigla}</h3>
            <span className="text-xs bg-muted px-2 py-0.5 rounded">
              {accessTypeLabels[source.tipoAcesso]}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">{source.nomeCompleto}</p>
          <p className="text-xs text-muted-foreground mt-1">{source.orgaoResponsavel}</p>
          
          <div className="mt-3">
            <p className="text-xs font-medium text-foreground mb-1">Desagregações disponíveis:</p>
            <div className="flex flex-wrap gap-1">
              {source.desagregacoes.map((d, i) => (
                <span key={i} className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded">
                  {d}
                </span>
              ))}
            </div>
          </div>
          
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              Atualização: {source.periodicidade}
            </span>
            <Button variant="ghost" size="sm" asChild>
              <a href={source.urlAcesso} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Acessar
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

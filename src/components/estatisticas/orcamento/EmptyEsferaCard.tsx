import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, Database } from 'lucide-react';

interface EmptyEsferaCardProps {
  esfera: string;
  descricao: string;
}

export function EmptyEsferaCard({ esfera, descricao }: EmptyEsferaCardProps) {
  return (
    <Card className="border-dashed border-2 border-warning/50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <AlertTriangle className="w-10 h-10 text-warning mb-3" />
          <h3 className="font-semibold text-foreground mb-2">
            Sem dados {esfera} verificados
          </h3>
          <p className="text-sm text-muted-foreground max-w-lg">
            {descricao}
          </p>
          <div className="flex items-center gap-2 mt-4">
            <Database className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Tabela: <code className="bg-muted px-1 py-0.5 rounded">dados_orcamentarios</code>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

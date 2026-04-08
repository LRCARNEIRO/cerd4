import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight, XCircle } from 'lucide-react';

interface Props {
  diagnosticMap?: Map<string, any>;
  sensorReady: boolean;
}

export function CriticalRecommendationsSummary({ diagnosticMap, sensorReady }: Props) {
  const naoCumpridas = useMemo(() => {
    if (!sensorReady || !diagnosticMap) return [];
    const results: { paragrafo: string; tema: string; score: number }[] = [];
    diagnosticMap.forEach((diag, id) => {
      if (diag.statusReclassificado === 'nao_cumprido') {
        results.push({
          paragrafo: diag.paragrafo || id,
          tema: diag.tema || 'Sem tema',
          score: diag.score ?? 0,
        });
      }
    });
    return results.sort((a, b) => a.score - b.score).slice(0, 5);
  }, [diagnosticMap, sensorReady]);

  if (!sensorReady) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <XCircle className="w-5 h-5 text-destructive" />
          Recomendações Não Cumpridas
        </h2>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/recomendacoes">
            Ver todas
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>

      {naoCumpridas.length === 0 ? (
        <Card className="border-success/30 bg-success/5">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Nenhuma recomendação com status "Não Cumprido" no momento.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {naoCumpridas.map((rec, i) => (
            <Card key={i} className="border-destructive/20 hover:border-destructive/40 transition-colors">
              <CardContent className="p-3 flex items-center gap-3">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {rec.paragrafo}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{rec.tema}</p>
                </div>
                <Badge variant="destructive" className="text-xs shrink-0">
                  Score {rec.score}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

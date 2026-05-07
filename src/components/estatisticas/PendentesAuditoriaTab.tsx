import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import { useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import { isPendingAuditIndicator } from '@/utils/indicatorEvidenceGuards';

/**
 * Aba de quarentena: indicadores exclusivos do BD (não-espelhos de abas
 * estáticas e fora do corpus ODS Racial) que ainda não passaram por
 * auditoria manual. Estão BLOQUEADOS como evidência até serem auditados.
 */
export function PendentesAuditoriaTab() {
  const { data: indicadores = [], isLoading } = useIndicadoresInterseccionais();

  const pendentes = useMemo(
    () => (indicadores as any[]).filter(isPendingAuditIndicator),
    [indicadores],
  );

  const porCategoria = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const ind of pendentes) {
      const k = ind.categoria || 'sem_categoria';
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(ind);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [pendentes]);

  if (isLoading) return <p className="text-sm text-muted-foreground">Carregando…</p>;

  return (
    <div className="space-y-6">
      <Alert className="border-l-4 border-l-chart-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Quarentena metodológica — {pendentes.length} indicadores</AlertTitle>
        <AlertDescription className="text-sm space-y-1">
          <p>
            Esta aba lista indicadores exclusivos do banco que <strong>ainda não passaram por auditoria manual</strong>.
            Enquanto não auditados, estão <strong>bloqueados como evidência</strong> em recomendações,
            artigos da ICERD, popups de drilldown e relatórios PDF/HTML/DOCX.
          </p>
          <p className="text-xs text-muted-foreground">
            Critério de quarentena: registros sem <code>auditado_manualmente=true</code>, fora dos espelhos de abas estáticas
            e fora da categoria <code>ods_racial</code> (corpus auditado em bloco).
          </p>
        </AlertDescription>
      </Alert>

      {porCategoria.map(([cat, lista]) => (
        <Card key={cat}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/30">
                {cat}
              </Badge>
              <span className="text-muted-foreground text-sm font-normal">{lista.length} pendente(s)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground text-left">
                    <th className="py-2 pr-3 w-24">Código</th>
                    <th className="py-2 pr-3">Indicador</th>
                    <th className="py-2 pr-3 w-64">Fonte</th>
                    <th className="py-2 pr-3 w-20 text-center">Fonte ↗</th>
                  </tr>
                </thead>
                <tbody>
                  {lista.map((ind) => (
                    <tr key={ind.id} className="border-b last:border-b-0 hover:bg-muted/30">
                      <td className="py-2 pr-3 font-mono text-xs">{ind.codigo || '—'}</td>
                      <td className="py-2 pr-3">{ind.nome}</td>
                      <td className="py-2 pr-3 text-xs text-muted-foreground">{ind.fonte}</td>
                      <td className="py-2 pr-3 text-center">
                        {ind.url_fonte ? (
                          <a
                            href={ind.url_fonte}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}

      {pendentes.length === 0 && (
        <p className="text-sm text-muted-foreground">Nenhum indicador pendente de auditoria. ✅</p>
      )}
    </div>
  );
}

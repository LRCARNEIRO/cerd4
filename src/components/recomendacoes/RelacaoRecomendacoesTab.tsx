import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { classificarOrigemLacuna, ORIGEM_CONFIG, type OrigemLacuna } from '@/utils/classificarOrigemLacuna';
import { Loader2, ListChecks } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { useMemo } from 'react';
import { useDiagnosticSensor, type LacunaDiagnostic } from '@/hooks/useDiagnosticSensor';
import { EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';
import type { ComplianceStatus } from '@/hooks/useLacunasData';

const eixoLabels: Record<string, string> = {
  legislacao_justica: 'Legislação e Justiça',
  politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública',
  saude: 'Saúde',
  educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda',
  terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio',
  participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas',
};

function getArtigosFromLacuna(l: { artigos_convencao?: string[] | null; eixo_tematico: string }): string[] {
  if (l.artigos_convencao && l.artigos_convencao.length > 0) return l.artigos_convencao;
  return EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS] || [];
}

export function RelacaoRecomendacoesTab() {
  const { data: lacunas, isLoading } = useLacunasIdentificadas({});
  const { diagnosticMap, isReady: sensorReady } = useDiagnosticSensor(lacunas);

  const grouped = useMemo(() => {
    if (!lacunas) return { cerd: [], rg: [], durban: [] };
    const result: Record<OrigemLacuna, typeof lacunas> = { cerd: [], rg: [], durban: [] };
    for (const l of lacunas) {
      result[classificarOrigemLacuna(l.paragrafo)].push(l);
    }
    result.cerd.sort((a, b) => {
      const na = parseInt(a.paragrafo.replace(/\D/g, '')) || 0;
      const nb = parseInt(b.paragrafo.replace(/\D/g, '')) || 0;
      return na - nb;
    });
    result.rg.sort((a, b) => a.paragrafo.localeCompare(b.paragrafo));
    result.durban.sort((a, b) => a.paragrafo.localeCompare(b.paragrafo));
    return result;
  }, [lacunas]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const getEffectiveStatus = (l: { id: string; status_cumprimento: ComplianceStatus }): ComplianceStatus => {
    const diag = diagnosticMap.get(l.id);
    return diag?.statusComputado ?? l.status_cumprimento;
  };

  const renderGroup = (key: OrigemLacuna, items: typeof lacunas extends (infer T)[] ? T[] : never[]) => {
    const config = ORIGEM_CONFIG[key];
    if (items.length === 0) return null;

    // Status summary using COMPUTED status
    const statusCount: Record<string, number> = {};
    items.forEach(l => {
      const eff = getEffectiveStatus(l);
      statusCount[eff] = (statusCount[eff] || 0) + 1;
    });

    return (
      <Card key={key} className="border-l-4" style={{ borderLeftColor: key === 'cerd' ? 'hsl(var(--primary))' : key === 'rg' ? '#d97706' : '#7c3aed' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            {config.label}
            <Badge variant="secondary" className="ml-auto">{items.length} recomendações</Badge>
          </CardTitle>
          <p className="text-xs text-muted-foreground">{config.documento}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {statusCount.cumprido > 0 && <Badge variant="outline" className="text-success border-success/30 text-xs">{statusCount.cumprido} Cumprida(s)</Badge>}
            {statusCount.parcialmente_cumprido > 0 && <Badge variant="outline" className="text-warning border-warning/30 text-xs">{statusCount.parcialmente_cumprido} Parcial(is)</Badge>}
            {statusCount.em_andamento > 0 && <Badge variant="outline" className="text-info border-info/30 text-xs">{statusCount.em_andamento} Em Andamento</Badge>}
            {statusCount.nao_cumprido > 0 && <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">{statusCount.nao_cumprido} Não Cumprida(s)</Badge>}
            {statusCount.retrocesso > 0 && <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">{statusCount.retrocesso} Retrocesso(s)</Badge>}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-md border overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">§</TableHead>
                  <TableHead>Tema</TableHead>
                  <TableHead className="w-[100px]">Artigos ICERD</TableHead>
                  <TableHead className="w-[140px]">Eixo Temático</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[60px]">Score</TableHead>
                  <TableHead className="w-[80px]">Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(l => {
                  const diag = diagnosticMap.get(l.id);
                  const effectiveStatus = diag?.statusComputado ?? l.status_cumprimento;
                  const artigos = getArtigosFromLacuna(l);
                  const score = diag?.auditoria?.scoreGlobal;

                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono font-semibold text-xs">{l.paragrafo}</TableCell>
                      <TableCell className="text-sm">{l.tema}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-0.5">
                          {artigos.map(a => (
                            <Badge key={a} variant="outline" className="text-[10px] px-1 py-0">{a}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{eixoLabels[l.eixo_tematico] || l.eixo_tematico}</TableCell>
                      <TableCell>
                        <StatusBadge status={effectiveStatus} size="sm" />
                      </TableCell>
                      <TableCell>
                        {score != null && (
                          <span className={`text-xs font-mono font-bold ${score >= 75 ? 'text-success' : score >= 55 ? 'text-warning' : score >= 35 ? 'text-orange-500' : 'text-destructive'}`}>
                            {score}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={l.prioridade === 'critica' ? 'destructive' : 'outline'} className="text-xs capitalize">
                          {l.prioridade}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted/30 rounded-lg border p-4">
        <h3 className="font-semibold text-sm mb-2">Relação Consolidada de Recomendações Monitoradas</h3>
        <p className="text-xs text-muted-foreground">
          Total de <strong>{lacunas?.length || 0}</strong> recomendações ativas com status calculado automaticamente (Score 0-100).
          Distribuídas em: Observações Finais ({grouped.cerd.length}), Recomendações Gerais ({grouped.rg.length}) e Durban ({grouped.durban.length}).
        </p>
        {sensorReady && (
          <p className="text-[10px] text-muted-foreground mt-1">
            Metodologia: Indicadores (40%) + Orçamento (30%) + Normativos (30%) → Faixas: ≥75 Cumprido | ≥55 Parcial | ≥35 Em Andamento | ≥15 Não Cumprido | &lt;15 Retrocesso
          </p>
        )}
      </div>

      {renderGroup('cerd', grouped.cerd)}
      {renderGroup('rg', grouped.rg)}
      {renderGroup('durban', grouped.durban)}

      {/* Status legend */}
      <div className="bg-muted/20 rounded-lg border p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Legenda de Status:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success" /> <strong>Cumprido (≥75):</strong> Evidências indicam cumprimento integral</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> <strong>Parcial (≥55):</strong> Avanço significativo, lacunas remanescentes</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-info" /> <strong>Em Andamento (≥35):</strong> Esforço institucional detectado</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> <strong>Não Cumprido (≥15):</strong> Evidências insuficientes de ação</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> <strong>Retrocesso (&lt;15):</strong> Piora detectada nos indicadores</span>
        </div>
      </div>
    </div>
  );
}

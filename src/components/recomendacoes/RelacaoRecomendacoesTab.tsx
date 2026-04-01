import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { classificarOrigemLacuna, ORIGEM_CONFIG, type OrigemLacuna } from '@/utils/classificarOrigemLacuna';
import { Loader2, ListChecks } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { useMemo } from 'react';

const statusCfg: Record<string, { label: string; color: string }> = {
  cumprido: { label: 'Cumprido', color: 'text-success' },
  parcialmente_cumprido: { label: 'Parcial', color: 'text-warning' },
  nao_cumprido: { label: 'Não Cumprido', color: 'text-destructive' },
  retrocesso: { label: 'Retrocesso', color: 'text-destructive' },
  em_andamento: { label: 'Em Andamento', color: 'text-info' },
};

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

export function RelacaoRecomendacoesTab() {
  const { data: lacunas, isLoading } = useLacunasIdentificadas({});

  const grouped = useMemo(() => {
    if (!lacunas) return { cerd: [], rg: [], durban: [] };
    const result: Record<OrigemLacuna, typeof lacunas> = { cerd: [], rg: [], durban: [] };
    for (const l of lacunas) {
      result[classificarOrigemLacuna(l.paragrafo)].push(l);
    }
    // Sort within each group
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

  const renderGroup = (key: OrigemLacuna, items: typeof lacunas extends (infer T)[] ? T[] : never[]) => {
    const config = ORIGEM_CONFIG[key];
    if (items.length === 0) return null;

    // Status summary
    const statusCount: Record<string, number> = {};
    items.forEach(l => {
      statusCount[l.status_cumprimento] = (statusCount[l.status_cumprimento] || 0) + 1;
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
                  <TableHead className="w-[140px]">Eixo Temático</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[80px]">Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map(l => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono font-semibold text-xs">{l.paragrafo}</TableCell>
                    <TableCell className="text-sm">{l.tema}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{eixoLabels[l.eixo_tematico] || l.eixo_tematico}</TableCell>
                    <TableCell><StatusBadge status={l.status_cumprimento} size="sm" /></TableCell>
                    <TableCell>
                      <Badge variant={l.prioridade === 'critica' ? 'destructive' : 'outline'} className="text-xs capitalize">
                        {l.prioridade}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
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
          Total de <strong>{lacunas?.length || 0}</strong> recomendações ativas, distribuídas em três categorias de origem: 
          Observações Finais do CERD ({grouped.cerd.length}), Recomendações Gerais ({grouped.rg.length}) e Declaração de Durban ({grouped.durban.length}).
        </p>
      </div>

      {renderGroup('cerd', grouped.cerd)}
      {renderGroup('rg', grouped.rg)}
      {renderGroup('durban', grouped.durban)}

      {/* Status legend */}
      <div className="bg-muted/20 rounded-lg border p-3">
        <p className="text-xs font-semibold text-muted-foreground mb-2">Legenda de Status:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-success" /> <strong>Cumprido:</strong> Implementação integral verificada</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-warning" /> <strong>Parcial:</strong> Implementação parcial ou em estágio avançado</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-info" /> <strong>Em Andamento:</strong> Medidas iniciadas, sem conclusão</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> <strong>Não Cumprido:</strong> Sem ação efetiva identificada</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-destructive" /> <strong>Retrocesso:</strong> Situação pior que o período anterior</span>
        </div>
      </div>
    </div>
  );
}

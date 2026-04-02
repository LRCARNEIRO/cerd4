import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { classificarOrigemLacuna, ORIGEM_CONFIG, type OrigemLacuna } from '@/utils/classificarOrigemLacuna';
import { Loader2, ListChecks } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { useMemo, useCallback } from 'react';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { EIXO_PARA_ARTIGOS } from '@/utils/artigosConvencao';
import type { ComplianceStatus } from '@/hooks/useLacunasData';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';
import { MethodologyPanel } from '@/components/shared/MethodologyPanel';

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

const ARTIGO_DESCRICOES: Record<string, string> = {
  I: 'Definição de Discriminação Racial',
  II: 'Obrigações dos Estados',
  III: 'Segregação e Apartheid',
  IV: 'Propaganda e Organizações Racistas',
  V: 'Igualdade de Direitos (DESCA)',
  VI: 'Proteção Judicial',
  VII: 'Ensino, Educação e Cultura',
};

function getArtigosFromRecomendacao(l: { artigos_convencao?: string[] | null; eixo_tematico: string }): string[] {
  if (l.artigos_convencao && l.artigos_convencao.length > 0) return l.artigos_convencao;
  return EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS] || [];
}

function getVinculacaoJustificativa(l: { artigos_convencao?: string[] | null; eixo_tematico: string }): string {
  if (l.artigos_convencao && l.artigos_convencao.length > 0) {
    return 'Tag explícita (BD)';
  }
  const mapped = EIXO_PARA_ARTIGOS[l.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS];
  if (mapped && mapped.length > 0) {
    return `Eixo: ${eixoLabels[l.eixo_tematico] || l.eixo_tematico}`;
  }
  return 'Sem vinculação';
}

/**
 * Relação Completa — visão institucional com vinculação + status computado.
 * Restaurada com colunas de status, score e breakdown por dimensão.
 */
export function RelacaoRecomendacoesTab() {
  const { data: recomendacoes, isLoading } = useLacunasIdentificadas({});
  const { diagnosticMap, isReady: sensorReady } = useDiagnosticSensor(recomendacoes);

  const grouped = useMemo(() => {
    if (!recomendacoes) return { cerd: [] as typeof recomendacoes, rg: [] as typeof recomendacoes, durban: [] as typeof recomendacoes };
    const result: Record<OrigemLacuna, typeof recomendacoes> = { cerd: [], rg: [], durban: [] };
    for (const l of recomendacoes) {
      result[classificarOrigemLacuna(l.paragrafo)].push(l);
    }
    result.cerd.sort((a, b) => (parseInt(a.paragrafo.replace(/\D/g, '')) || 0) - (parseInt(b.paragrafo.replace(/\D/g, '')) || 0));
    result.rg.sort((a, b) => a.paragrafo.localeCompare(b.paragrafo));
    result.durban.sort((a, b) => a.paragrafo.localeCompare(b.paragrafo));
    return result;
  }, [recomendacoes]);

  const statusSummary = useMemo(() => {
    if (!recomendacoes) return { cumprido: 0, parcialmente_cumprido: 0, em_andamento: 0, nao_cumprido: 0, retrocesso: 0 };
    const counts: Record<string, number> = {};
    recomendacoes.forEach(l => {
      const diag = diagnosticMap.get(l.id);
      const eff = diag?.statusComputado ?? l.status_cumprimento;
      counts[eff] = (counts[eff] || 0) + 1;
    });
    return counts;
  }, [recomendacoes, diagnosticMap]);

  const generateExportHTML = useCallback(() => {
    if (!recomendacoes) return '<html><body>Sem dados</body></html>';
    const allItems = [...grouped.cerd, ...grouped.rg, ...grouped.durban];

    const renderRows = (items: typeof allItems) => items.map(l => {
      const diag = diagnosticMap.get(l.id);
      const effectiveStatus = diag?.statusComputado ?? l.status_cumprimento;
      const score = diag?.auditoria?.scoreGlobal;
      const artigos = getArtigosFromRecomendacao(l);
      const justificativa = getVinculacaoJustificativa(l);
      const statusColor = effectiveStatus === 'cumprido' ? '#16a34a' : effectiveStatus === 'parcialmente_cumprido' ? '#ca8a04' : effectiveStatus === 'em_andamento' ? '#2563eb' : '#dc2626';
      const statusLabel = effectiveStatus === 'cumprido' ? 'Cumprido' : effectiveStatus === 'parcialmente_cumprido' ? 'Parcial' : effectiveStatus === 'em_andamento' ? 'Em Andamento' : effectiveStatus === 'retrocesso' ? 'Retrocesso' : 'Não Cumprido';

      return `<tr>
        <td style="font-family:monospace;font-weight:bold">${l.paragrafo}</td>
        <td>${l.tema}</td>
        <td>${artigos.map(a => `<span style="display:inline-block;padding:1px 5px;border:1px solid #ccc;border-radius:3px;font-size:10px;margin:1px">Art.${a}</span>`).join(' ')}</td>
        <td style="font-size:10px;color:#555">${justificativa}</td>
        <td style="color:${statusColor};font-weight:bold">${statusLabel}</td>
        <td style="font-size:10px;text-transform:capitalize">${l.prioridade}</td>
      </tr>`;
    }).join('');

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relação Completa — Recomendações, Vinculações e Status</title>
<style>
body{font-family:Arial,sans-serif;max-width:1200px;margin:20px auto;color:#222;font-size:12px}
h1{font-size:18px;border-bottom:2px solid #1e40af;padding-bottom:8px}
h2{font-size:14px;margin-top:20px;color:#1e40af}
table{width:100%;border-collapse:collapse;margin:8px 0}
th,td{border:1px solid #ddd;padding:5px 7px;text-align:left;font-size:11px}
th{background:#f1f5f9;font-size:10px}
.methodology{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px;margin:12px 0}
.nota{font-size:10px;color:#666}
.summary{display:flex;gap:12px;margin:12px 0}
.summary span{padding:4px 10px;border-radius:4px;font-size:11px;font-weight:bold}
</style></head><body>
<h1>📋 Relação Completa — Recomendações, Vinculações e Status</h1>
<p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
<p><strong>Total:</strong> ${recomendacoes.length} recomendações — CERD (${grouped.cerd.length}), RG (${grouped.rg.length}), Durban (${grouped.durban.length})</p>

<div class="summary">
<span style="background:#dcfce7;color:#166534">✓ ${statusSummary.cumprido || 0} Cumprida(s)</span>
<span style="background:#fef9c3;color:#854d0e">~ ${statusSummary.parcialmente_cumprido || 0} Parcial(is)</span>
<span style="background:#dbeafe;color:#1e40af">⏳ ${statusSummary.em_andamento || 0} Em Andamento</span>
<span style="background:#fee2e2;color:#991b1b">✗ ${statusSummary.nao_cumprido || 0} Não Cumprida(s)</span>
<span style="background:#fee2e2;color:#991b1b">↓ ${statusSummary.retrocesso || 0} Retrocesso(s)</span>
</div>

<div class="methodology">
<h2>🔗 Metodologia de Vinculação</h2>
<p><strong>Vinculação Recomendação → Artigo:</strong> Tags explícitas no banco de dados (prioridade) ou inferência por eixo temático (fallback).</p>
<table>
<tr><th>Artigo</th><th>Escopo</th></tr>
${Object.entries(ARTIGO_DESCRICOES).map(([k, v]) => `<tr><td><strong>Art. ${k}</strong></td><td>${v}</td></tr>`).join('')}
</table>
<p class="nota"><strong>Status:</strong> Avaliação computada disponível em Produtos → Conclusões → Evolução Recomendações.</p>
</div>

<h2>Detalhamento</h2>
<table>
<tr><th>§</th><th>Tema</th><th>Artigos</th><th>Justificativa</th><th>Status</th><th>Prioridade</th></tr>
${renderRows(allItems)}
</table>

<p class="nota" style="margin-top:16px">Documento gerado pelo Sistema de Monitoramento CERD IV — ${new Date().toLocaleDateString('pt-BR')}</p>
</body></html>`;
  }, [recomendacoes, grouped, diagnosticMap, statusSummary]);

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

  const renderGroup = (key: OrigemLacuna, items: any[]) => {
    const config = ORIGEM_CONFIG[key];
    if (items.length === 0) return null;

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
                  <TableHead className="w-[120px]">Artigos</TableHead>
                  <TableHead className="w-[150px]">Justificativa</TableHead>
                  <TableHead className="w-[120px]">Status</TableHead>
                  <TableHead className="w-[90px]">Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((l: any) => {
                  const diag = diagnosticMap.get(l.id);
                  const effectiveStatus = diag?.statusComputado ?? l.status_cumprimento;
                  const artigos = getArtigosFromRecomendacao(l);
                  const justificativa = getVinculacaoJustificativa(l);
                  const score = diag?.auditoria?.scoreGlobal;
                  const ind = diag?.auditoria?.indicadores;
                  const orc = diag?.auditoria?.orcamento;
                  const norm = diag?.auditoria?.normativos;

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
                      <TableCell className="text-[10px] text-muted-foreground">{justificativa}</TableCell>
                      <TableCell>
                        <StatusBadge status={effectiveStatus} size="sm" />
                      </TableCell>
                      <TableCell>
                        {score != null && (
                          <span className={`text-xs font-mono font-bold ${score >= 80 ? 'text-success' : score >= 55 ? 'text-warning' : score >= 35 ? 'text-orange-500' : 'text-destructive'}`}>
                            {score}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {ind ? `${ind.total} (${ind.score}pts)` : '—'}
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {orc ? `${orc.total} (${orc.score}pts)` : '—'}
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground">
                        {norm ? `${norm.total} (${norm.score}pts)` : '—'}
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
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            Relação Completa — Recomendações, Vinculações e Status
          </h3>
          <ExportTabButtons
            generateHTML={generateExportHTML}
            fileName="relacao-completa-recomendacoes"
            label="Exportar"
            compact
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Total de <strong>{recomendacoes?.length || 0}</strong> recomendações monitoradas com vinculações aos Artigos I-VII e status computado (Score 0-100).
        </p>
        <div className="flex flex-wrap gap-3 mt-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> {statusSummary.cumprido || 0} Cumprida(s)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> {statusSummary.parcialmente_cumprido || 0} Parcial(is)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-info" /> {statusSummary.em_andamento || 0} Em Andamento</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> {(statusSummary.nao_cumprido || 0) + (statusSummary.retrocesso || 0)} Não Cumprida(s)/Retrocesso(s)</span>
        </div>
        {sensorReady && (
          <div className="mt-2">
            <MethodologyPanel variant="sensor" />
          </div>
        )}
      </div>

      {renderGroup('cerd', grouped.cerd)}
      {renderGroup('rg', grouped.rg)}
      {renderGroup('durban', grouped.durban)}
    </div>
  );
}

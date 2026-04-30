import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { classificarOrigemLacuna, ORIGEM_CONFIG, type OrigemLacuna } from '@/utils/classificarOrigemLacuna';
import { Loader2, ListChecks } from 'lucide-react';
import { StatusBadge } from '@/components/ui/status-badge';
import { lazy, Suspense, useMemo, useCallback, useState } from 'react';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { EIXO_PARA_ARTIGOS } from '@/utils/artigosConvencao';
import type { ComplianceStatus } from '@/hooks/useLacunasData';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';
import { ParagraphTextDialog } from '@/components/shared/ParagraphTextDialog';
import { useEvidenceOverrides } from '@/hooks/useEvidenceOverrides';
import { ExportAllRecomendacoesButton } from './ExportAllRecomendacoesButton';
import { ExportSingleRecomendacaoButton } from './ExportSingleRecomendacaoButton';

const MethodologyPanel = lazy(() => import('@/components/shared/MethodologyPanel').then(m => ({ default: m.MethodologyPanel })));
const EvidenceDrilldownDialog = lazy(() => import('@/components/shared/EvidenceDrilldownDialog').then(m => ({ default: m.EvidenceDrilldownDialog })));

const emptyOverride = () => ({
  removedIndicadores: [],
  removedOrcamento: [],
  removedNormativos: [],
  addedIndicadores: [],
  addedOrcamento: [],
  addedNormativos: [],
});

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

function getPrioridadeLabel(prioridade: string): string {
  if (prioridade === 'critica') return 'Crítica';
  if (prioridade === 'alta') return 'Alta';
  if (prioridade === 'media') return 'Média';
  if (prioridade === 'baixa') return 'Baixa';
  return prioridade;
}

export function RelacaoRecomendacoesTab() {
  const { data: recomendacoes, isLoading } = useLacunasIdentificadas({});
  const [evidenceOverrides, setEvidenceOverrides] = useEvidenceOverrides();
  const { diagnosticMap, isReady: sensorReady, rawIndicadores, rawOrcamento, rawNormativos } = useDiagnosticSensor(recomendacoes, evidenceOverrides);
  const [drilldownId, setDrilldownId] = useState<string | null>(null);
  const [paragraphDialogId, setParagraphDialogId] = useState<string | null>(null);

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

  // Drilldown data
  const drilldownRec = recomendacoes?.find(r => r.id === drilldownId);
  const drilldownDiag = drilldownId ? diagnosticMap.get(drilldownId) : undefined;
  const paragraphDialogRec = recomendacoes?.find(r => r.id === paragraphDialogId);

  const getTextoIntegral = (l: { descricao_lacuna?: string | null; texto_original_onu?: string | null }) => {
    const descricao = l.descricao_lacuna?.trim();
    const textoOriginal = l.texto_original_onu?.trim();
    return descricao || textoOriginal || '';
  };

  const generateExportHTML = useCallback(() => {
    if (!recomendacoes) return '<html><body>Sem dados</body></html>';
    const allItems = [...grouped.cerd, ...grouped.rg, ...grouped.durban];

    const renderRows = (items: typeof allItems) => items.map(l => {
      const diag = diagnosticMap.get(l.id);
      const effectiveStatus = diag?.statusComputado ?? l.status_cumprimento;
      const artigos = getArtigosFromRecomendacao(l);
      const justificativa = getVinculacaoJustificativa(l);
      const prioridadeLabel = getPrioridadeLabel(l.prioridade);
      const statusColor = effectiveStatus === 'cumprido' ? '#16a34a' : effectiveStatus === 'parcialmente_cumprido' || effectiveStatus === 'em_andamento' ? '#ca8a04' : '#dc2626';
      const statusLabel = effectiveStatus === 'cumprido' ? 'Cumprido' : effectiveStatus === 'parcialmente_cumprido' || effectiveStatus === 'em_andamento' ? 'Parcial' : 'Não Cumprido';

      // Evidence details for export
      const auditoria = diag?.auditoria;
      const evidenceHtml = auditoria ? `
        <div style="font-size:9px;color:#555;margin-top:4px">
          <strong>Score: ${auditoria.scoreGlobal}/100</strong><br/>
          📊 Ind: ${auditoria.indicadores.total} (${auditoria.indicadores.melhoram}↑ ${auditoria.indicadores.pioram}↓) · Score: ${auditoria.indicadores.score}<br/>
          💰 Orç: ${auditoria.orcamento.total} ações, exec ${auditoria.orcamento.execucaoMedia}% · Score: ${auditoria.orcamento.score}<br/>
          📋 Norm: ${auditoria.normativos.total} · Score: ${auditoria.normativos.score}<br/>
          ${diag?.linkedIndicadores?.slice(0, 5).map(i => `• ${i.nome} (${i.tendencia || 'N/D'})`).join('<br/>') || ''}
          ${diag?.linkedNormativos?.slice(0, 5).map(n => `• ${n.titulo}`).join('<br/>') || ''}
          ${diag?.linkedOrcamento?.slice(0, 5).map(o => `• ${o.programa} (${o.orgao}, ${o.ano})`).join('<br/>') || ''}
        </div>
      ` : '<span style="font-size:9px;color:#999">Sem auditoria</span>';

      return `<tr>
        <td style="font-family:monospace;font-weight:bold">${l.paragrafo}</td>
        <td>${l.tema}</td>
        <td>${artigos.map(a => `<span style="display:inline-block;padding:1px 5px;border:1px solid #ccc;border-radius:3px;font-size:10px;margin:1px">Art.${a}</span>`).join(' ')}</td>
        <td style="font-size:10px;color:#555">${justificativa}</td>
        <td style="color:${statusColor};font-weight:bold">${statusLabel}</td>
        <td style="font-size:10px">${prioridadeLabel}</td>
        <td>${evidenceHtml}</td>
      </tr>`;
    }).join('');

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Relação Completa — Recomendações, Vinculações, Status e Evidências</title>
<style>
body{font-family:Arial,sans-serif;max-width:1400px;margin:20px auto;color:#222;font-size:12px}
h1{font-size:18px;border-bottom:2px solid #1e40af;padding-bottom:8px}
h2{font-size:14px;margin-top:20px;color:#1e40af}
table{width:100%;border-collapse:collapse;margin:8px 0}
th,td{border:1px solid #ddd;padding:5px 7px;text-align:left;font-size:11px;vertical-align:top}
th{background:#f1f5f9;font-size:10px}
.methodology{background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:14px;margin:12px 0}
.nota{font-size:10px;color:#666}
.summary{display:flex;gap:12px;margin:12px 0;flex-wrap:wrap}
.summary span{padding:4px 10px;border-radius:4px;font-size:11px;font-weight:bold}
</style></head><body>
<h1>📋 Relação Completa — Recomendações, Vinculações, Status e Evidências</h1>
<p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
<p><strong>Total:</strong> ${recomendacoes.length} recomendações — CERD (${grouped.cerd.length}), RG (${grouped.rg.length}), Durban (${grouped.durban.length})</p>

<div class="summary">
<span style="background:#dcfce7;color:#166534">✓ ${statusSummary.cumprido || 0} Cumprida(s)</span>
<span style="background:#fef9c3;color:#854d0e">~ ${(statusSummary.parcialmente_cumprido || 0) + (statusSummary.em_andamento || 0)} Parcial(is)</span>
<span style="background:#fee2e2;color:#991b1b">✗ ${(statusSummary.nao_cumprido || 0) + (statusSummary.retrocesso || 0)} Não Cumprida(s)</span>
</div>

        <div class="methodology">
        <h2>🔗 Metodologia de Vinculação e Cálculo de Status (v5.2)</h2>
        <p><strong>Vinculação Evidências → Recomendação:</strong> Híbrida e auditável por palavras-chave, com <strong>score temático mínimo</strong>. Termos extraídos do tema, descrição e texto original ONU (tokenização ≥5 letras, com exceções curtas relevantes como <em>raça</em>, + stop-words + sinônimos), combinando correspondência por <em>termo/frase inteira normalizada</em> com <em>expansão conceitual controlada</em> para casos semanticamente muito próximos (ex.: dados desagregados ↔ Censo/raça-gênero), sem substring solta. Recomendações com grupo focal exigem sinal focal explícito (ex.: quilombola, indígena, LGBTQIA+) ou frase específica correlata; termos genéricos como <em>violência</em>, <em>proteção</em> e <em>discriminação</em> não vinculam sozinhos. Busca nos campos: nome/categoria/subcategoria/análise/documentos de origem dos indicadores, programa/órgão/descritivo/eixo/público-alvo/observações/razão de seleção do orçamento, título/categoria de normativos. <em>Não</em> utiliza artigos ICERD ou eixos genéricos.</p>
<p><strong>Vinculação Recomendação → Artigo:</strong> Tags explícitas no banco de dados (prioridade) ou inferência por eixo temático (fallback). Apenas para classificação temática.</p>
<p><strong>Cálculo do Status:</strong> Indicadores 40% + Orçamento 30% + Normativos 30%. Todas as dimensões medem contagem (cobertura).</p>
<p><strong>Faixas:</strong> ≥65 Cumprido | ≥35 Parcial | &lt;35 Não Cumprido</p>
<table>
<tr><th>Artigo</th><th>Escopo</th></tr>
${Object.entries(ARTIGO_DESCRICOES).map(([k, v]) => `<tr><td><strong>Art. ${k}</strong></td><td>${v}</td></tr>`).join('')}
</table>
</div>

<h2>Detalhamento com Evidências</h2>
<table>
<tr><th>§</th><th>Tema</th><th>Artigos</th><th>Justificativa</th><th>Status</th><th>Prioridade</th><th>Evidências (Indicadores, Orçamento, Normativos)</th></tr>
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
            {(statusCount.parcialmente_cumprido + statusCount.em_andamento) > 0 && <Badge variant="outline" className="text-warning border-warning/30 text-xs">{statusCount.parcialmente_cumprido + statusCount.em_andamento} Parcial(is)</Badge>}
            {(statusCount.nao_cumprido + statusCount.retrocesso) > 0 && <Badge variant="outline" className="text-destructive border-destructive/30 text-xs">{statusCount.nao_cumprido + statusCount.retrocesso} Não Cumprida(s)</Badge>}
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
                  <TableHead className="w-[140px]">Prioridade cadastrada</TableHead>
                  <TableHead className="w-[60px] text-center">Relatório</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((l: any) => {
                  const effectiveStatus = getEffectiveStatus(l);
                  const artigos = getArtigosFromRecomendacao(l);
                  const justificativa = getVinculacaoJustificativa(l);

                  return (
                    <TableRow key={l.id}>
                      <TableCell className="font-mono font-semibold text-xs">
                        <button
                          onClick={() => setParagraphDialogId(l.id)}
                          className="underline-offset-2 hover:underline text-left"
                          title="Clique para ver o texto integral do parágrafo"
                        >
                          {l.paragrafo}
                        </button>
                      </TableCell>
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
                        <button
                          onClick={() => setDrilldownId(l.id)}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                          title="Clique para ver evidências"
                        >
                          <StatusBadge status={effectiveStatus} size="sm" />
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge variant={l.prioridade === 'critica' ? 'destructive' : 'outline'} className="text-xs">
                          {getPrioridadeLabel(l.prioridade)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <ExportSingleRecomendacaoButton
                          recomendacao={l}
                          diagnostic={diagnosticMap.get(l.id)}
                          rawIndicadores={rawIndicadores}
                          rawOrcamento={rawOrcamento}
                          rawNormativos={rawNormativos}
                          disabled={!sensorReady}
                        />
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
          <div className="flex items-center gap-2">
            <ExportAllRecomendacoesButton
              recomendacoes={recomendacoes || []}
              diagnosticMap={diagnosticMap}
              rawIndicadores={rawIndicadores}
              rawOrcamento={rawOrcamento}
              rawNormativos={rawNormativos}
              disabled={!sensorReady}
            />
            <ExportTabButtons
              generateHTML={generateExportHTML}
              fileName="relacao-completa-recomendacoes"
              label="Exportar"
              compact
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Total de <strong>{recomendacoes?.length || 0}</strong> recomendações monitoradas com vinculações aos Artigos I-VII da ICERD.
          <strong className="ml-1">Clique no status de cada recomendação</strong> para ver as evidências que fundamentam a classificação.
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          <strong>Prioridade cadastrada:</strong> este campo vem pronto da base de recomendações e não é calculado pelo sensor nem por esta tela.
        </p>
        <div className="flex flex-wrap gap-3 mt-2 text-xs">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> {statusSummary.cumprido || 0} Cumprida(s)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> {(statusSummary.parcialmente_cumprido || 0) + (statusSummary.em_andamento || 0)} Parcial(is)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> {(statusSummary.nao_cumprido || 0) + (statusSummary.retrocesso || 0)} Não Cumprida(s)</span>
        </div>
        {sensorReady && (
          <div className="mt-2">
            <Suspense fallback={null}>
              <MethodologyPanel variant="sensor" />
            </Suspense>
          </div>
        )}
      </div>

      {renderGroup('cerd', grouped.cerd)}
      {renderGroup('rg', grouped.rg)}
      {renderGroup('durban', grouped.durban)}

      {/* Evidence Drilldown Dialog */}
      {drilldownId && (
        <Suspense fallback={null}>
          <EvidenceDrilldownDialog
            open={!!drilldownId}
            onOpenChange={(open) => { if (!open) setDrilldownId(null); }}
            paragrafo={drilldownRec?.paragrafo || ''}
            tema={drilldownRec?.tema || ''}
            diagnostic={drilldownDiag}
            recomendacaoId={drilldownId || undefined}
            allIndicadores={rawIndicadores}
            allOrcamento={rawOrcamento}
            allNormativos={rawNormativos}
            overrides={evidenceOverrides[drilldownId] || emptyOverride()}
            onOverridesChange={(ov) => setEvidenceOverrides(prev => ({ ...prev, [drilldownId]: ov }))}
          />
        </Suspense>
      )}

      <ParagraphTextDialog
        open={!!paragraphDialogId}
        onOpenChange={(open) => { if (!open) setParagraphDialogId(null); }}
        paragrafo={paragraphDialogRec?.paragrafo || ''}
        tema={paragraphDialogRec?.tema || ''}
        textoCompleto={paragraphDialogRec ? getTextoIntegral(paragraphDialogRec) : ''}
      />
    </div>
  );
}

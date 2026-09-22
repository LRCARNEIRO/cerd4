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
  return l.artigos_convencao || [];
}

function getVinculacaoJustificativa(l: { artigos_convencao?: string[] | null; eixo_tematico: string }): string {
  if (l.artigos_convencao && l.artigos_convencao.length > 0) {
    return 'Tag explícita (BD)';
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

  /** v7 — distribuição nas faixas 25/60 de Esforço e Impacto */
  const faixaSummary = useMemo(() => {
    const esforco = { alto: 0, intermediario: 0, baixo: 0 };
    const impacto = { alto: 0, intermediario: 0, baixo: 0 };
    (recomendacoes || []).forEach(l => {
      const ei = diagnosticMap.get(l.id)?.auditoria.esforcoImpacto;
      if (!ei) return;
      esforco[ei.faixaEsforco]++;
      impacto[ei.faixaImpacto]++;
    });
    return { esforco, impacto };
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
      const artigos = getArtigosFromRecomendacao(l);
      const justificativa = getVinculacaoJustificativa(l);
      const prioridadeLabel = getPrioridadeLabel(l.prioridade);
      const ei = diag?.auditoria.esforcoImpacto;
      const corFaixa = (f?: string) => f === 'alto' ? '#16a34a' : f === 'intermediario' ? '#ca8a04' : '#dc2626';

      const auditoria = diag?.auditoria;
      const evidenceHtml = auditoria && ei ? `
        <div style="font-size:9px;color:#555;margin-top:4px">
          <strong>Esforço ${formatScore(ei.esforco)} · Realização ${formatScore(ei.realizacao)} · Impacto ${formatScore(ei.impacto)}</strong><br/>
          📊 Est: ${ei.contagens.estatistica} (${ei.contagens.favoraveis} não desfavorável(is) de ${ei.contagens.comTendencia} com série)<br/>
          💰 Orç: ${ei.contagens.orcamentaria} ações, execução ${formatScore(ei.componentes.realizacaoOrcamentaria)}%<br/>
          📋 Norm: ${ei.contagens.normativa}<br/>
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
        <td style="font-size:10px;font-weight:bold">
          <span style="color:${corFaixa(ei?.faixaEsforco)}">Esforço ${ei ? formatScore(ei.esforco) : '—'} · ${ei ? FAIXA_LABEL[ei.faixaEsforco] : '—'}</span><br/>
          <span style="color:${corFaixa(ei?.faixaImpacto)}">Impacto ${ei ? formatScore(ei.impacto) : '—'} · ${ei ? FAIXA_LABEL[ei.faixaImpacto] : '—'}</span>
        </td>
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
<h1>📋 Relação Completa — Recomendações, Vinculações, Esforço × Impacto e Evidências</h1>
<p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')}</p>
<p><strong>Total:</strong> ${recomendacoes.length} recomendações (Observações Finais, Recomendações Gerais e Durban)</p>

<div class="summary">
<span style="background:#e0e7ff;color:#3730a3">Esforço Governamental</span>
<span style="background:#dcfce7;color:#166534">${faixaSummary.esforco.alto} Alto</span>
<span style="background:#fef9c3;color:#854d0e">${faixaSummary.esforco.intermediario} Intermediário</span>
<span style="background:#fee2e2;color:#991b1b">${faixaSummary.esforco.baixo} Baixo</span>
</div>
<div class="summary">
<span style="background:#e0e7ff;color:#3730a3">Impacto Evidenciado</span>
<span style="background:#dcfce7;color:#166534">${faixaSummary.impacto.alto} Alto</span>
<span style="background:#fef9c3;color:#854d0e">${faixaSummary.impacto.intermediario} Intermediário</span>
<span style="background:#fee2e2;color:#991b1b">${faixaSummary.impacto.baixo} Baixo</span>
</div>

        <div class="methodology">
        <h2>🔗 Metodologia de Vinculação e Cálculo (v7 — Esforço × Impacto)</h2>
        <p><strong>Vinculação Evidências → Recomendação:</strong> matriz relacional auditada Artigo × Recomendação × Evidência (2.122 endereços válidos), sobre o inventário canônico de 514 evidências (278 estatísticas, 204 orçamentárias e 32 normativas). Após deduplicação da mesma evidência para a mesma recomendação entre artigos, restam 1.658 relações distintas Recomendação × Evidência (734 estatísticas, 845 orçamentárias e 79 normativas).</p>
<p><strong>Vinculação Recomendação → Artigo:</strong> mapa relacional combinado com o mapa formal, preservando recomendações sem evidência — Art. I = 6 · II = 7 · III = 4 · IV = 2 · V = 21 · VI = 6 · VII = 4.</p>
<p><strong>Esforço Governamental (0–100):</strong> [100 × min(nEst/${TETOS_ESFORCO.estatistica}, 1) + 100 × min(nOrç/${TETOS_ESFORCO.orcamentaria}, 1) + 100 × min(nNorm/${TETOS_ESFORCO.normativa}, 1)] ÷ 3. Tetos derivados do P75 das evidências efetivamente vinculadas; pesos iguais de 1/3 por base.</p>
<p><strong>Realização (0–100):</strong> média simples das bases presentes — estatística: proporção de indicadores com evolução não desfavorável (melhorou ou estável = 1; piorou = 0); orçamentária: Σ Liquidado ÷ Σ Dotação autorizada válida; normativa: presença = 100, ausência = 0.</p>
<p><strong>Impacto Evidenciado:</strong> Esforço × Realização ÷ 100.</p>
<p><strong>Faixas (iguais para os dois índices):</strong> Baixo &lt; 25 | Intermediário 25–59,9 | Alto ≥ 60</p>
<table>
<tr><th>Artigo</th><th>Escopo</th></tr>
${Object.entries(ARTIGO_DESCRICOES).map(([k, v]) => `<tr><td><strong>Art. ${k}</strong></td><td>${v}</td></tr>`).join('')}
</table>
</div>

<h2>Detalhamento com Evidências</h2>
<table>
<tr><th>§</th><th>Tema</th><th>Artigos</th><th>Justificativa</th><th>Esforço / Impacto</th><th>Prioridade</th><th>Evidências (Indicadores, Orçamento, Normativos)</th></tr>
${renderRows(allItems)}
</table>

<p class="nota" style="margin-top:16px">Documento gerado pelo Sistema de Monitoramento CERD IV — ${new Date().toLocaleDateString('pt-BR')}</p>
</body></html>`;
  }, [recomendacoes, grouped, diagnosticMap, faixaSummary]);

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

    const grupoEsforco = { alto: 0, intermediario: 0, baixo: 0 };
    const grupoImpacto = { alto: 0, intermediario: 0, baixo: 0 };
    items.forEach(l => {
      const ei = diagnosticMap.get(l.id)?.auditoria.esforcoImpacto;
      if (!ei) return;
      grupoEsforco[ei.faixaEsforco]++;
      grupoImpacto[ei.faixaImpacto]++;
    });

    return (
      <Card key={key} className="border-l-4" style={{ borderLeftColor: key === 'cerd' ? 'hsl(var(--primary))' : key === 'rg' ? '#d97706' : '#7c3aed' }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <ListChecks className="w-4 h-4" />
            {config.label}
            <Badge variant="secondary" className="ml-auto">{items.length} recomendações</Badge>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <strong className="text-foreground">Esforço:</strong>
              {grupoEsforco.alto} Alto · {grupoEsforco.intermediario} Intermediário · {grupoEsforco.baixo} Baixo
            </span>
            <span className="flex items-center gap-1">
              <strong className="text-foreground">Impacto:</strong>
              {grupoImpacto.alto} Alto · {grupoImpacto.intermediario} Intermediário · {grupoImpacto.baixo} Baixo
            </span>
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
                  <TableHead className="w-[170px]">Esforço / Impacto</TableHead>
                  <TableHead className="w-[140px]">Prioridade cadastrada</TableHead>
                  <TableHead className="w-[60px] text-center">Relatório</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((l: any) => {
                  const ei = diagnosticMap.get(l.id)?.auditoria.esforcoImpacto;
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
                          className="cursor-pointer hover:opacity-80 transition-opacity text-left"
                          title="Clique para ver evidências"
                        >
                          {ei ? (
                            <EsforcoImpactoTags
                              esforco={ei.esforco}
                              impacto={ei.impacto}
                              faixaEsforco={ei.faixaEsforco}
                              faixaImpacto={ei.faixaImpacto}
                              className="flex-col items-start"
                            />
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
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
          Cada recomendação é medida por dois índices: <strong>Esforço Governamental</strong> (volume de evidências vinculadas)
          e <strong>Impacto Evidenciado</strong> (esforço × realização).
          <strong className="ml-1">Clique nas tags de cada recomendação</strong> para ver as evidências que fundamentam os índices.
        </p>
        <p className="text-[10px] text-muted-foreground mt-1">
          <strong>Prioridade cadastrada:</strong> este campo vem pronto da base de recomendações e não é calculado pelo sensor nem por esta tela.
        </p>
        <div className="flex flex-wrap gap-4 mt-2 text-xs">
          <span className="flex items-center gap-1.5">
            <strong className="text-foreground">Esforço:</strong>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> {faixaSummary.esforco.alto} Alto</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> {faixaSummary.esforco.intermediario} Intermediário</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> {faixaSummary.esforco.baixo} Baixo</span>
          </span>
          <span className="flex items-center gap-1.5">
            <strong className="text-foreground">Impacto:</strong>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-success" /> {faixaSummary.impacto.alto} Alto</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-warning" /> {faixaSummary.impacto.intermediario} Intermediário</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-destructive" /> {faixaSummary.impacto.baixo} Baixo</span>
          </span>
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

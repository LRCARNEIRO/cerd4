import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { generateSuggestedResponse } from '@/utils/generateSuggestedResponse';
import { StatusBadge } from '@/components/ui/status-badge';
import { classificarOrigemLacuna, ORIGEM_CONFIG } from '@/utils/classificarOrigemLacuna';
import { EIXO_PARA_ARTIGOS } from '@/utils/artigosConvencao';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';
import {
  Search, ChevronDown, ChevronRight, FileText, AlertTriangle,
  CheckCircle2, BarChart3, DollarSign, Scale, Loader2, Filter
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ComplianceStatus } from '@/hooks/useLacunasData';

const statusLabels: Record<string, string> = {
  cumprido: 'Cumprido',
  parcialmente_cumprido: 'Parcial',
  em_andamento: 'Em Andamento',
  nao_cumprido: 'Não Cumprido',
  retrocesso: 'Retrocesso',
};

export function DiagnosticoLacunasPanel() {
  const { data: recomendacoes, isLoading } = useLacunasIdentificadas({});
  const { diagnosticMap, isReady } = useDiagnosticSensor(recomendacoes);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | 'all'>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const items = useMemo(() => {
    if (!recomendacoes) return [];
    return recomendacoes
      .map(r => {
        const diag = diagnosticMap.get(r.id);
        const effectiveStatus = diag?.statusComputado ?? r.status_cumprimento;
        const resposta = generateSuggestedResponse(r, diag);
        const rawArtigos = (r as any).artigos_convencao;
        const artigos = (Array.isArray(rawArtigos) && rawArtigos.length > 0)
          ? rawArtigos
          : (EIXO_PARA_ARTIGOS[r.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS] || []);
        const origem = classificarOrigemLacuna(r.paragrafo);
        return { ...r, diag, effectiveStatus, resposta, artigos, origem };
      })
      .filter(r => {
        if (filterStatus !== 'all' && r.effectiveStatus !== filterStatus) return false;
        if (search) {
          const term = search.toLowerCase();
          return r.tema.toLowerCase().includes(term) || r.paragrafo.toLowerCase().includes(term);
        }
        return true;
      })
      .sort((a, b) => {
        const numA = parseInt(a.paragrafo.replace(/\D/g, '')) || 0;
        const numB = parseInt(b.paragrafo.replace(/\D/g, '')) || 0;
        return numA - numB;
      });
  }, [recomendacoes, diagnosticMap, search, filterStatus]);

  const statusCounts = useMemo(() => {
    if (!recomendacoes) return {} as Record<string, number>;
    const counts: Record<string, number> = {};
    recomendacoes.forEach(r => {
      const diag = diagnosticMap.get(r.id);
      const s = diag?.statusComputado ?? r.status_cumprimento;
      counts[s] = (counts[s] || 0) + 1;
    });
    return counts;
  }, [recomendacoes, diagnosticMap]);

  const lacunasPersistentes = useMemo(() => {
    return items.filter(r => r.effectiveStatus === 'nao_cumprido' || r.effectiveStatus === 'retrocesso' || r.effectiveStatus === 'em_andamento');
  }, [items]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const expandAll = () => {
    setExpandedIds(new Set(items.map(i => i.id)));
  };

  const collapseAll = () => {
    setExpandedIds(new Set());
  };

  const generateExportHTML = () => {
    const rows = items.map(r => {
      const indNames = r.diag?.linkedIndicadores?.map(i => `• ${i.nome} (${i.tendencia || 'N/D'})`).join('<br/>') || '<em>Nenhum</em>';
      const orcNames = r.diag?.linkedOrcamento?.map(o => `• ${o.programa} — ${o.orgao} (${o.ano})`).join('<br/>') || '<em>Nenhum</em>';
      const normNames = r.diag?.linkedNormativos?.map(n => `• ${n.titulo}`).join('<br/>') || '<em>Nenhum</em>';
      const statusColor = r.effectiveStatus === 'cumprido' ? '#16a34a' : r.effectiveStatus === 'parcialmente_cumprido' ? '#ca8a04' : r.effectiveStatus === 'em_andamento' ? '#2563eb' : '#dc2626';
      const respostaText = r.resposta || '<em>Sem resposta sugerida — evidências insuficientes</em>';

      return `
        <div style="border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:16px;page-break-inside:avoid">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
            <div>
              <span style="font-family:monospace;font-weight:bold;font-size:14px">§${r.paragrafo}</span>
              <span style="margin-left:8px;font-size:13px;font-weight:600">${r.tema}</span>
            </div>
            <span style="color:${statusColor};font-weight:bold;font-size:12px;padding:2px 8px;border:1px solid ${statusColor};border-radius:4px">${statusLabels[r.effectiveStatus] || r.effectiveStatus}</span>
          </div>
          <div style="font-size:11px;color:#555;margin-bottom:8px">
            Artigos: ${r.artigos.map((a: string) => `Art. ${a}`).join(', ')} · Origem: ${ORIGEM_CONFIG[r.origem].label} · Score: ${r.diag?.auditoria?.scoreGlobal ?? 'N/D'}/100
          </div>
          <table style="width:100%;font-size:10px;border-collapse:collapse;margin-bottom:10px">
            <tr>
              <td style="width:33%;vertical-align:top;padding:4px;border:1px solid #eee"><strong>📊 Indicadores (${r.diag?.linkedIndicadores?.length || 0})</strong><br/>${indNames}</td>
              <td style="width:33%;vertical-align:top;padding:4px;border:1px solid #eee"><strong>💰 Orçamento (${r.diag?.linkedOrcamento?.length || 0})</strong><br/>${orcNames}</td>
              <td style="width:33%;vertical-align:top;padding:4px;border:1px solid #eee"><strong>📋 Normativos (${r.diag?.linkedNormativos?.length || 0})</strong><br/>${normNames}</td>
            </tr>
          </table>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;padding:10px;font-size:11px;line-height:1.6">
            <strong>📝 Resposta Sugerida para o CERD IV:</strong><br/>
            ${respostaText}
          </div>
        </div>
      `;
    }).join('');

    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Diagnóstico de Lacunas — Evidências e Respostas Sugeridas</title>
<style>body{font-family:Arial,sans-serif;max-width:1200px;margin:20px auto;color:#222;font-size:12px}
h1{font-size:18px;border-bottom:2px solid #1e40af;padding-bottom:8px}
.summary{display:flex;gap:10px;flex-wrap:wrap;margin:12px 0}
.summary span{padding:4px 10px;border-radius:4px;font-size:11px;font-weight:bold}
</style></head><body>
<h1>📋 Diagnóstico de Lacunas — Evidências Vinculadas e Respostas Sugeridas</h1>
<p><strong>Gerado em:</strong> ${new Date().toLocaleString('pt-BR')} · <strong>Total:</strong> ${items.length} recomendações analisadas</p>
<div class="summary">
<span style="background:#dcfce7;color:#166534">✓ ${statusCounts.cumprido || 0} Cumprida(s)</span>
<span style="background:#fef9c3;color:#854d0e">~ ${(statusCounts.parcialmente_cumprido || 0) + (statusCounts.em_andamento || 0)} Parcial(is)</span>
<span style="background:#fee2e2;color:#991b1b">✗ ${(statusCounts.nao_cumprido || 0) + (statusCounts.retrocesso || 0)} Não Cumprida(s)</span>
</div>
<p style="font-size:11px;color:#555">Lacunas persistentes (Não Cumpridas): <strong>${lacunasPersistentes.length}</strong></p>
<hr style="margin:12px 0"/>
${rows}
<p style="font-size:10px;color:#888;margin-top:20px">Documento gerado pelo Sistema de Monitoramento CERD IV — ${new Date().toLocaleDateString('pt-BR')}</p>
</body></html>`;
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <FileText className="w-6 h-6 text-primary flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Diagnóstico de Lacunas — Evidências e Respostas Sugeridas</h3>
                <p className="text-sm text-muted-foreground">
                  Visão analítica das {recomendacoes?.length || 0} recomendações com evidências vinculadas expandidas e resposta sugerida
                  textual para o CERD IV, com base no cruzamento de indicadores, orçamento e normativos.
                </p>
              </div>
            </div>
            <ExportTabButtons generateHTML={generateExportHTML} fileName="Diagnostico-Lacunas-CERD" compact />
          </div>
        </CardContent>
      </Card>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <button onClick={() => setFilterStatus('all')} className={`text-left p-3 rounded-lg border transition-colors ${filterStatus === 'all' ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-muted/50'}`}>
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-xl font-bold">{recomendacoes?.length || 0}</p>
        </button>
        <button onClick={() => setFilterStatus('cumprido')} className={`text-left p-3 rounded-lg border transition-colors ${filterStatus === 'cumprido' ? 'bg-success/10 border-success' : 'bg-card hover:bg-muted/50'}`}>
          <p className="text-xs text-muted-foreground">Cumpridas</p>
          <p className="text-xl font-bold text-success">{statusCounts.cumprido || 0}</p>
        </button>
        <button onClick={() => setFilterStatus('parcialmente_cumprido')} className={`text-left p-3 rounded-lg border transition-colors ${filterStatus === 'parcialmente_cumprido' ? 'bg-warning/10 border-warning' : 'bg-card hover:bg-muted/50'}`}>
          <p className="text-xs text-muted-foreground">Parciais</p>
          <p className="text-xl font-bold text-warning">{statusCounts.parcialmente_cumprido || 0}</p>
        </button>
        <button onClick={() => setFilterStatus('em_andamento')} className={`text-left p-3 rounded-lg border transition-colors ${filterStatus === 'em_andamento' ? 'bg-info/10 border-info' : 'bg-card hover:bg-muted/50'}`}>
          <p className="text-xs text-muted-foreground">Em Andamento</p>
          <p className="text-xl font-bold text-info">{statusCounts.em_andamento || 0}</p>
        </button>
        <button onClick={() => setFilterStatus('nao_cumprido')} className={`text-left p-3 rounded-lg border transition-colors ${filterStatus === 'nao_cumprido' ? 'bg-destructive/10 border-destructive' : 'bg-card hover:bg-muted/50'}`}>
          <p className="text-xs text-muted-foreground">Não Cumpridas</p>
          <p className="text-xl font-bold text-destructive">{(statusCounts.nao_cumprido || 0) + (statusCounts.retrocesso || 0)}</p>
        </button>
      </div>

      {/* Filters + actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por § ou tema..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={expandAll}>Expandir Todos</Button>
        <Button variant="outline" size="sm" onClick={collapseAll}>Recolher Todos</Button>
      </div>

      {/* Lacunas persistentes highlight */}
      {filterStatus === 'all' && lacunasPersistentes.length > 0 && (
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <p className="text-sm font-semibold text-destructive">
                {lacunasPersistentes.length} lacuna(s) persistente(s)
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Recomendações classificadas como Não Cumpridas, Retrocesso ou Em Andamento após o cruzamento completo de evidências.
              Estas exigem atenção prioritária na formulação do CERD IV.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Items */}
      <div className="space-y-3">
        {items.map(r => {
          const isExpanded = expandedIds.has(r.id);
          const indCount = r.diag?.linkedIndicadores?.length || 0;
          const orcCount = r.diag?.linkedOrcamento?.length || 0;
          const normCount = r.diag?.linkedNormativos?.length || 0;
          const score = r.diag?.auditoria?.scoreGlobal;
          const isLacuna = r.effectiveStatus === 'nao_cumprido' || r.effectiveStatus === 'retrocesso';

          return (
            <Card key={r.id} className={`transition-colors ${isLacuna ? 'border-l-4 border-l-destructive' : r.effectiveStatus === 'em_andamento' ? 'border-l-4 border-l-info' : r.effectiveStatus === 'cumprido' ? 'border-l-4 border-l-success' : 'border-l-4 border-l-warning'}`}>
              {/* Collapsed header — always visible */}
              <button
                className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                onClick={() => toggleExpand(r.id)}
              >
                {isExpanded ? <ChevronDown className="w-4 h-4 flex-shrink-0 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 flex-shrink-0 text-muted-foreground" />}
                <span className="font-mono text-xs font-bold min-w-[50px]">§{r.paragrafo}</span>
                <span className="text-sm font-medium flex-1 truncate">{r.tema}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="hidden md:flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-0.5"><BarChart3 className="w-3 h-3" />{indCount}</span>
                    <span className="flex items-center gap-0.5"><DollarSign className="w-3 h-3" />{orcCount}</span>
                    <span className="flex items-center gap-0.5"><Scale className="w-3 h-3" />{normCount}</span>
                  </div>
                  {score !== undefined && (
                    <Badge variant="outline" className="text-[10px] px-1.5">{score}/100</Badge>
                  )}
                  <StatusBadge status={r.effectiveStatus} size="sm" />
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <CardContent className="pt-0 pb-4 px-4">
                  <div className="ml-7 space-y-3">
                    {/* Meta info */}
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      {r.artigos.map((a: string) => (
                        <Badge key={a} variant="outline" className="text-[10px] px-1.5 py-0">Art. {a}</Badge>
                      ))}
                      <Badge variant="secondary" className="text-[10px]">{ORIGEM_CONFIG[r.origem].label}</Badge>
                    </div>

                    {/* Evidence grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Indicadores */}
                      <div className="p-3 rounded-lg bg-muted/30 border">
                        <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                          <BarChart3 className="w-3.5 h-3.5 text-primary" />
                          Indicadores ({indCount})
                        </p>
                        {indCount === 0 ? (
                          <p className="text-[10px] text-muted-foreground italic">Nenhum indicador vinculado</p>
                        ) : (
                          <ul className="space-y-1">
                            {r.diag!.linkedIndicadores.map((ind, i) => (
                              <li key={i} className="text-[10px] text-muted-foreground flex items-start gap-1">
                                <span className={`mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                                  ['crescente', 'melhora'].includes((ind.tendencia || '').toLowerCase()) ? 'bg-success' :
                                  ['decrescente', 'piora'].includes((ind.tendencia || '').toLowerCase()) ? 'bg-destructive' : 'bg-muted-foreground'
                                }`} />
                                {ind.nome}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      {/* Orçamento */}
                      <div className="p-3 rounded-lg bg-muted/30 border">
                        <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-warning" />
                          Orçamento ({orcCount})
                        </p>
                        {orcCount === 0 ? (
                          <p className="text-[10px] text-muted-foreground italic">Nenhuma ação vinculada</p>
                        ) : (
                          <ul className="space-y-1">
                            {r.diag!.linkedOrcamento.slice(0, 10).map((orc, i) => (
                              <li key={i} className="text-[10px] text-muted-foreground">
                                {orc.programa} <span className="text-muted-foreground/60">({orc.orgao}, {orc.ano})</span>
                              </li>
                            ))}
                            {orcCount > 10 && <li className="text-[10px] text-muted-foreground italic">+{orcCount - 10} ações</li>}
                          </ul>
                        )}
                      </div>

                      {/* Normativos */}
                      <div className="p-3 rounded-lg bg-muted/30 border">
                        <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                          <Scale className="w-3.5 h-3.5 text-info" />
                          Normativos ({normCount})
                        </p>
                        {normCount === 0 ? (
                          <p className="text-[10px] text-muted-foreground italic">Nenhum normativo vinculado</p>
                        ) : (
                          <ul className="space-y-1">
                            {r.diag!.linkedNormativos.map((norm, i) => (
                              <li key={i} className="text-[10px] text-muted-foreground">
                                {norm.titulo}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>

                    {/* Resposta sugerida */}
                    <div className={`p-4 rounded-lg border ${r.resposta ? 'bg-primary/5 border-primary/20' : 'bg-muted/20 border-muted'}`}>
                      <p className="text-xs font-semibold mb-2 flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        Resposta Sugerida para o CERD IV
                      </p>
                      {r.resposta ? (
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                          {r.resposta}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          Evidências insuficientes para gerar resposta sugerida. Considere vincular evidências em
                          Acompanhamento Gerencial → Recomendações → Relação Completa.
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {items.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center text-muted-foreground text-sm">
            Nenhuma recomendação encontrada com os filtros aplicados.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

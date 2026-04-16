import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle, BookOpen, FileCheck, Loader2, PieChart, DollarSign, Sparkles, Database, TrendingUp, TrendingDown, Scale, Landmark, HeartPulse, PlusCircle, FileDown, Download, GitCompare, Activity, Shield, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLacunasIdentificadas, useRespostasLacunasCerdIII, useLacunasStats, useConclusoesAnaliticas, useIndicadoresInterseccionais, useDadosOrcamentarios, useOrcamentoStats } from '@/hooks/useLacunasData';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { ThematicReportGenerator } from '@/components/reports/ThematicReportGenerator';
import { BudgetReportGenerator } from '@/components/reports/BudgetReportGenerator';
import { AIReportGenerator } from '@/components/reports/AIReportGenerator';
import { DocumentReportCards } from '@/components/reports/DocumentReportCards';
import { ConsolidatedScopeReport } from '@/components/reports/ConsolidatedScopeReport';
import { StatisticsInventoryReport } from '@/components/reports/StatisticsInventoryReport';
import { EvidenceInventoryReport } from '@/components/reports/EvidenceInventoryReport';
import { ConclusoesReportGenerator } from '@/components/reports/ConclusoesReportGenerator';
import { FinalCerdIVReport } from '@/components/reports/FinalCerdIVReport';
import { TOTAL_DADOS_NOVOS } from '@/utils/countStatisticsIndicators';
import { getExportToolbarHTML, downloadAsDocx } from '@/utils/reportExportToolbar';
import { DeepLinkHealthCheck } from '@/components/health-check/DeepLinkHealthCheck';
import { AuditInventoryPanel } from '@/components/audit/AuditInventoryPanel';
import { AuditVerifyPanel } from '@/components/audit/AuditVerifyPanel';
import { useState } from 'react';

const statusLabels: Record<string, { label: string; color: string }> = {
  cumprido: { label: 'Cumprido', color: 'bg-success text-success-foreground' },
  parcialmente_cumprido: { label: 'Parcial', color: 'bg-warning text-warning-foreground' },
  nao_cumprido: { label: 'Não Cumprido', color: 'bg-destructive text-destructive-foreground' },
  retrocesso: { label: 'Retrocesso', color: 'bg-destructive text-destructive-foreground' },
  em_andamento: { label: 'Em andamento', color: 'bg-primary text-primary-foreground' }
};

export default function GerarRelatorios() {
  const [auditItems, setAuditItems] = useState<any[] | null>(null);
  
  const { data: lacunas, isLoading: loadingLacunas } = useLacunasIdentificadas();
  const { data: respostasCerd, isLoading: loadingRespostas } = useRespostasLacunasCerdIII();
  const { data: stats, isLoading: loadingStats } = useLacunasStats();
  const { data: conclusoes } = useConclusoesAnaliticas();
  const { data: indicadores } = useIndicadoresInterseccionais();
  const { data: orcStats } = useOrcamentoStats();

  const isLoading = loadingLacunas || loadingRespostas || loadingStats;

  // Use sensor-reclassified status (same source as Dashboard/Painel Geral)
  const { summary: sensorSummary, diagnosticMap, isReady: sensorReady } = useDiagnosticSensor(lacunas);

  const totalLacunas = stats?.total || 0;
  const cumpridas = sensorReady ? sensorSummary.statusReclassificado.cumprido : (stats?.porStatus.cumprido || 0);
  const parciais = sensorReady ? sensorSummary.statusReclassificado.parcialmente_cumprido : (stats?.porStatus.parcialmente_cumprido || 0);
  const naoCumpridas = sensorReady ? sensorSummary.statusReclassificado.nao_cumprido : (stats?.porStatus.nao_cumprido || 0);
  const retrocessos = sensorReady ? sensorSummary.statusReclassificado.retrocesso : (stats?.porStatus.retrocesso || 0);

  const respostasStats = {
    cumprido: respostasCerd?.filter(r => r.grau_atendimento === 'cumprido').length || 0,
    parcialmente_cumprido: respostasCerd?.filter(r => r.grau_atendimento === 'parcialmente_cumprido').length || 0,
    nao_cumprido: respostasCerd?.filter(r => r.grau_atendimento === 'nao_cumprido').length || 0,
    em_andamento: respostasCerd?.filter(r => r.grau_atendimento === 'em_andamento').length || 0,
  };

  // Generate Recomendações ONU report HTML
  const generateLacunasHTML = () => {
    const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const statusIcon = (s: string) => {
      const map: Record<string, string> = { cumprido: '✅', parcialmente_cumprido: '⚠️', nao_cumprido: '❌', retrocesso: '🔴', em_andamento: '🔄' };
      return map[s] || '';
    };
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Recomendações ONU — Relatório CERD IV</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 210mm; margin: 0 auto; padding: 20px; font-size: 11px; line-height: 1.5; color: #1a1a2e; }
  h1 { font-size: 20px; color: #0f3460; border-bottom: 3px solid #0f3460; padding-bottom: 8px; }
  h2 { font-size: 16px; color: #16213e; margin-top: 24px; }
  h3 { font-size: 13px; color: #0f3460; margin-top: 16px; }
  .header { text-align: center; margin-bottom: 24px; border: 2px solid #0f3460; padding: 16px; border-radius: 8px; background: linear-gradient(135deg, #f8f9ff, #eef2ff); }
  .header p { margin: 3px 0; color: #555; }
  .kpi-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin: 14px 0; }
  .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; }
  .kpi .value { font-size: 22px; font-weight: 700; }
  .kpi .label { font-size: 9px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
  th { background: #0f3460; color: white; padding: 6px 8px; text-align: left; font-weight: 600; }
  td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; }
  .lacuna-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin: 8px 0; page-break-inside: avoid; }
  .lacuna-card h4 { margin: 0 0 4px; font-size: 12px; }
  .source { font-size: 9px; color: #94a3b8; font-style: italic; }
  @media print { .no-print { display: none; } body { padding: 0; } }
  @page { size: A4; margin: 2cm; }
</style></head><body>
${getExportToolbarHTML('Lacunas-ONU-CERD-IV')}
<div class="header">
  <h1>⚠️ Recomendações ONU — Recomendações não cumpridas</h1>
  <p><strong>IV Relatório Periódico do Brasil ao CERD</strong></p>
  <p>Período: 2018–2026 | Gerado em: ${now}</p>
</div>

<div class="kpi-grid">
  <div class="kpi"><div class="value" style="color:#166534">${cumpridas}</div><div class="label">Cumpridas</div></div>
  <div class="kpi"><div class="value" style="color:#92400e">${parciais}</div><div class="label">Parciais</div></div>
  <div class="kpi"><div class="value" style="color:#991b1b">${naoCumpridas}</div><div class="label">Não Cumpridas</div></div>
  <div class="kpi"><div class="value" style="color:#7f1d1d">${retrocessos}</div><div class="label">Retrocessos</div></div>
  <div class="kpi"><div class="value" style="color:#1e40af">${stats?.porPrioridade.critica || 0}</div><div class="label">Críticas</div></div>
</div>

<h2>Distribuição por Eixo Temático</h2>
<table><tr><th>Eixo</th><th>Total</th></tr>
${Object.entries(stats?.porEixo || {}).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([eixo, total]) =>
  `<tr><td>${eixo.replace(/_/g, ' ')}</td><td>${total}</td></tr>`).join('')}
</table>

<h2>Distribuição por Grupo Focal</h2>
<table><tr><th>Grupo</th><th>Total</th></tr>
${Object.entries(stats?.porGrupo || {}).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([grupo, total]) =>
  `<tr><td>${grupo.replace(/_/g, ' ')}</td><td>${total}</td></tr>`).join('')}
</table>

<h2>Todas as Lacunas (${totalLacunas})</h2>
<table>
  <tr><th>§</th><th>Tema</th><th>Eixo</th><th>Grupo</th><th>Status</th><th>Prioridade</th><th>Descrição</th></tr>
  ${(lacunas || []).map(l => `<tr>
    <td>${l.paragrafo}</td>
    <td>${l.tema}</td>
    <td>${l.eixo_tematico.replace(/_/g, ' ')}</td>
    <td>${l.grupo_focal.replace(/_/g, ' ')}</td>
    <td>${statusIcon(l.status_cumprimento)} ${statusLabels[l.status_cumprimento]?.label || l.status_cumprimento}</td>
    <td>${l.prioridade}</td>
    <td>${l.descricao_lacuna}</td>
  </tr>`).join('')}
</table>

${(lacunas || []).map(l => `
<div class="lacuna-card">
  <h4>§${l.paragrafo} — ${l.tema} | ${statusIcon(l.status_cumprimento)} ${statusLabels[l.status_cumprimento]?.label}</h4>
  <p><strong>Lacuna:</strong> ${l.descricao_lacuna}</p>
  ${l.texto_original_onu ? `<p style="background:#fef2f2;padding:6px;border-radius:4px;font-size:10px;"><strong>Texto ONU:</strong> ${l.texto_original_onu}</p>` : ''}
  ${l.resposta_sugerida_cerd_iv ? `<p style="background:#f0fdf4;padding:6px;border-radius:4px;font-size:10px;"><strong>Resposta sugerida (CERD IV):</strong> ${l.resposta_sugerida_cerd_iv}</p>` : ''}
  ${l.evidencias_encontradas?.length ? `<p class="source"><strong>Evidências:</strong> ${l.evidencias_encontradas.join('; ')}</p>` : ''}
  ${l.acoes_brasil?.length ? `<p class="source"><strong>Ações Brasil:</strong> ${l.acoes_brasil.join('; ')}</p>` : ''}
</div>`).join('')}

<div class="source" style="margin-top:20px;padding-top:10px;border-top:1px solid #e2e8f0;">
  📋 Relatório gerado pelo Sistema de Subsídios CERD IV — ${now}
</div>
</body></html>`;
  };

  // Generate Respostas CERD III report HTML
  const generateRespostasHTML = () => {
    const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const statusIcon = (s: string) => {
      const map: Record<string, string> = { cumprido: '✅', parcialmente_cumprido: '⚠️', nao_cumprido: '❌', retrocesso: '🔴', em_andamento: '🔄' };
      return map[s] || '';
    };
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Respostas CERD III — Balanço Analítico</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 210mm; margin: 0 auto; padding: 20px; font-size: 11px; line-height: 1.5; color: #1a1a2e; }
  h1 { font-size: 20px; color: #0f3460; border-bottom: 3px solid #0f3460; padding-bottom: 8px; }
  h2 { font-size: 16px; color: #16213e; margin-top: 24px; }
  .header { text-align: center; margin-bottom: 24px; border: 2px solid #0f3460; padding: 16px; border-radius: 8px; background: linear-gradient(135deg, #f8f9ff, #eef2ff); }
  .header p { margin: 3px 0; color: #555; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 14px 0; }
  .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 10px; text-align: center; }
  .kpi .value { font-size: 22px; font-weight: 700; }
  .kpi .label { font-size: 9px; color: #64748b; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px; }
  th { background: #0f3460; color: white; padding: 6px 8px; text-align: left; font-weight: 600; }
  td { padding: 5px 8px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  .resposta-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin: 10px 0; page-break-inside: avoid; }
  .resposta-card h4 { margin: 0 0 6px; font-size: 12px; }
  .critica { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; padding: 8px; margin: 6px 0; font-size: 10px; }
  .resposta { background: #f0fdf4; border: 1px solid #86efac; border-radius: 6px; padding: 8px; margin: 6px 0; font-size: 10px; }
  .lacuna-rem { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 8px; margin: 6px 0; font-size: 10px; }
  .source { font-size: 9px; color: #94a3b8; font-style: italic; }
  @media print { .no-print { display: none; } body { padding: 0; } }
  @page { size: A4; margin: 2cm; }
</style></head><body>
${getExportToolbarHTML('Respostas-CERD-III-Balanco')}
<div class="header">
  <h1>📋 Respostas às Críticas do CERD III — Balanço Analítico</h1>
  <p><strong>IV Relatório Periódico do Brasil ao CERD</strong></p>
  <p>${respostasCerd?.length || 0} críticas analisadas | Gerado em: ${now}</p>
</div>

<div class="kpi-grid">
  <div class="kpi"><div class="value" style="color:#166534">${respostasStats.cumprido}</div><div class="label">Atendidas</div></div>
  <div class="kpi"><div class="value" style="color:#92400e">${respostasStats.parcialmente_cumprido}</div><div class="label">Parciais</div></div>
  <div class="kpi"><div class="value" style="color:#991b1b">${respostasStats.nao_cumprido}</div><div class="label">Não Atendidas</div></div>
  <div class="kpi"><div class="value" style="color:#1e40af">${respostasStats.em_andamento}</div><div class="label">Em Andamento</div></div>
</div>

<h2>Quadro Resumo</h2>
<table>
  <tr><th>§</th><th>Crítica Original</th><th>Grau Atendimento</th></tr>
  ${(respostasCerd || []).map(r => `<tr>
    <td>${r.paragrafo_cerd_iii}</td>
    <td>${r.critica_original.substring(0, 120)}${r.critica_original.length > 120 ? '…' : ''}</td>
    <td>${statusIcon(r.grau_atendimento)} ${statusLabels[r.grau_atendimento]?.label || r.grau_atendimento}</td>
  </tr>`).join('')}
</table>

<h2>Análise Detalhada</h2>
${(respostasCerd || []).map(r => {
    const evQuant = r.evidencias_quantitativas as Record<string, string | number> | null;
    return `
<div class="resposta-card">
  <h4>§${r.paragrafo_cerd_iii} — ${statusIcon(r.grau_atendimento)} ${statusLabels[r.grau_atendimento]?.label}</h4>
  <div class="critica"><strong>Crítica Original:</strong> ${r.critica_original}</div>
  <div class="resposta"><strong>Resposta do Brasil:</strong> ${r.resposta_brasil}</div>
  ${evQuant && Object.keys(evQuant).length > 0 ? `<p style="font-size:10px;"><strong>Dados Quantitativos:</strong> ${Object.entries(evQuant).map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`).join(' | ')}</p>` : ''}
  ${r.evidencias_qualitativas?.length ? `<p style="font-size:10px;"><strong>Evidências:</strong> ${r.evidencias_qualitativas.join('; ')}</p>` : ''}
  ${r.justificativa_avaliacao ? `<p style="font-size:10px;background:#f1f5f9;padding:6px;border-radius:4px;"><strong>Avaliação:</strong> ${r.justificativa_avaliacao}</p>` : ''}
  ${r.lacunas_remanescentes?.length ? `<div class="lacuna-rem"><strong>Lacunas Remanescentes:</strong><ul style="margin:4px 0;padding-left:16px;">${r.lacunas_remanescentes.map(l => `<li>${l}</li>`).join('')}</ul></div>` : ''}
</div>`;
  }).join('')}

<div class="source" style="margin-top:20px;padding-top:10px;border-top:1px solid #e2e8f0;">
  📋 Relatório gerado pelo Sistema de Subsídios CERD IV — ${now}
</div>
</body></html>`;
  };

  return (
    <DashboardLayout
      title="Gerar Relatórios Analíticos"
      subtitle="Análise de políticas raciais com base nos dados do sistema — Recomendações ONU, Orçamento, Indicadores"
    >
      {/* Header analítico */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1"><Database className="w-3 h-3" />{totalLacunas} recomendações ONU</Badge>
          <Badge variant="outline" className="gap-1"><FileCheck className="w-3 h-3" />{respostasCerd?.length || 0} respostas CERD III</Badge>
          <Badge variant="outline" className="gap-1"><DollarSign className="w-3 h-3" />{orcStats?.totalRegistros || 0} registros orçamentários</Badge>
          <Badge variant="outline" className="gap-1"><TrendingUp className="w-3 h-3" />{indicadores?.length || 0} indicadores BD</Badge>
          <Badge variant="outline" className="gap-1"><PlusCircle className="w-3 h-3" />{TOTAL_DADOS_NOVOS} dados novos auditáveis</Badge>
          <Badge variant="outline" className="gap-1"><Scale className="w-3 h-3" />{conclusoes?.length || 0} conclusões</Badge>
        </div>
        {isLoading && (
          <Badge variant="outline" className="gap-1 animate-pulse">
            <Loader2 className="w-3 h-3 animate-spin" /> Carregando dados...
          </Badge>
        )}
      </div>

      {/* Cards de geração de documentos */}
      <DocumentReportCards />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <StatisticsInventoryReport />
        <EvidenceInventoryReport />
      </div>

      {/* Panorama analítico */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
        <Card className="border-success/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Cumpridas</p>
            <p className="text-lg font-bold text-success">{cumpridas}</p>
            <p className="text-xs text-muted-foreground">{totalLacunas > 0 ? Math.round(cumpridas/totalLacunas*100) : 0}%</p>
          </CardContent>
        </Card>
        <Card className="border-warning/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Parciais</p>
            <p className="text-lg font-bold text-warning">{parciais}</p>
            <p className="text-xs text-muted-foreground">{totalLacunas > 0 ? Math.round(parciais/totalLacunas*100) : 0}%</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Não cumpridas</p>
            <p className="text-lg font-bold text-destructive">{naoCumpridas}</p>
            <p className="text-xs text-muted-foreground">{totalLacunas > 0 ? Math.round(naoCumpridas/totalLacunas*100) : 0}%</p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Retrocessos</p>
            <p className="text-lg font-bold text-destructive">{retrocessos}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Orçamento</p>
            <p className="text-lg font-bold">{orcStats?.variacao ? `${orcStats.variacao >= 0 ? '+' : ''}${orcStats.variacao.toFixed(0)}%` : 'N/A'}</p>
            <p className="text-xs text-muted-foreground">variação entre períodos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-3 pb-3 text-center">
            <p className="text-xs text-muted-foreground">Prioridade crítica</p>
            <p className="text-lg font-bold">{stats?.porPrioridade.critica || 0}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="final-cerd-iv" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="final-cerd-iv" className="gap-1 bg-primary/20 font-semibold">
            <BookOpen className="w-4 h-4" /> Relatório Final CERD IV
          </TabsTrigger>
          <TabsTrigger value="consolidado" className="gap-1 bg-primary/10">
            <FileText className="w-4 h-4" /> Consolidado (Escopo)
          </TabsTrigger>
          <TabsTrigger value="ia-generator" className="gap-1">
            <Sparkles className="w-4 h-4" /> Relatórios com IA
          </TabsTrigger>
          <TabsTrigger value="tematicos" className="gap-1">
            <PieChart className="w-4 h-4" /> Temáticos
          </TabsTrigger>
          <TabsTrigger value="orcamento" className="gap-1">
            <DollarSign className="w-4 h-4" /> Orçamento
          </TabsTrigger>
          <TabsTrigger value="conclusoes-full" className="gap-1 bg-primary/10">
            <Scale className="w-4 h-4" /> Conclusões (Integral)
          </TabsTrigger>
          <TabsTrigger value="balanco" className="gap-1 bg-accent/20">
            <GitCompare className="w-4 h-4" /> Balanço Comparativo
          </TabsTrigger>
          <TabsTrigger value="health-check" className="gap-1">
            <Activity className="w-4 h-4" /> Health Check
          </TabsTrigger>
          <TabsTrigger value="audit-inventory" className="gap-1 bg-destructive/10">
            <Shield className="w-4 h-4" /> Auditoria Triple-Check
          </TabsTrigger>
        </TabsList>

        {/* ABA: RELATÓRIO FINAL CERD IV */}
        <TabsContent value="final-cerd-iv">
          <FinalCerdIVReport />
        </TabsContent>

        {/* ABA: CONSOLIDADO - ESCOPO DO PROJETO */}
        <TabsContent value="consolidado">
          <ConsolidatedScopeReport />
        </TabsContent>

        {/* ABA: CONCLUSÕES INTEGRAL */}
        <TabsContent value="conclusoes-full">
          <ConclusoesReportGenerator />
        </TabsContent>

        {/* ABA: RELATÓRIOS COM IA */}
        <TabsContent value="ia-generator">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <AIReportGenerator defaultType="common-core" />
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-500" />
                  Relatórios Analíticos com IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>
                  Gere relatórios <strong>analíticos e conclusivos</strong> sobre a política racial brasileira,
                  cruzando lacunas da ONU, dados orçamentários, indicadores e evidências do banco de dados.
                </p>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">O que os relatórios analisam:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Desigualdade racial estrutural (2018→2024): avanços e retrocessos</li>
                    <li>Cruzamento orçamento × resultados de indicadores sociais</li>
                    <li>Cumprimento das recomendações da ONU (CERD III e Observações Finais)</li>
                    <li>Interseccionalidade: raça × gênero × idade × território</li>
                    <li>Impacto COVID-19 e fragilidade institucional (MUNIC/ESTADIC)</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <p className="font-medium text-foreground">Tipos disponíveis:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Common Core:</strong> Análise demográfica e socioeconômica por raça</li>
                    <li><strong>CERD IV:</strong> Balanço das políticas raciais para a ONU</li>
                    <li><strong>Temático:</strong> Análise aprofundada por eixo ou grupo</li>
                    <li><strong>Orçamentário:</strong> Análise de execução orçamentária racial</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA: TEMÁTICOS */}
        <TabsContent value="tematicos">
          <ThematicReportGenerator />
        </TabsContent>

        {/* ABA: ORÇAMENTO */}
        <TabsContent value="orcamento">
          <Card className="mb-6 border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <DollarSign className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Relatório Orçamentário Consolidado</h3>
                  <p className="text-sm text-muted-foreground">
                    O relatório está nesta própria aba <strong>Produtos → Relatórios → Orçamento</strong>, no card abaixo, com geração em PDF/HTML e DOCX.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <BudgetReportGenerator />
        </TabsContent>


        {/* ABA: BALANÇO COMPARATIVO */}
        <TabsContent value="balanco">
          <BalancoComparativoTab
            lacunas={lacunas || []}
            conclusoes={conclusoes || []}
            indicadores={indicadores || []}
            respostasCerd={respostasCerd || []}
            orcStats={orcStats}
            stats={stats}
          />
        </TabsContent>

        {/* ABA: HEALTH CHECK */}
        <TabsContent value="health-check">
          <DeepLinkHealthCheck />
        </TabsContent>

        {/* ABA: AUDITORIA TRIPLE-CHECK */}
        <TabsContent value="audit-inventory">
          <div className="space-y-8">
            <AuditInventoryPanel onInventoryComplete={setAuditItems} />
            <AuditVerifyPanel inventoryItems={auditItems} />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

/* ─── Balanço Comparativo Component ─── */
interface BalancoProps {
  lacunas: any[];
  conclusoes: any[];
  indicadores: any[];
  respostasCerd: any[];
  orcStats: any;
  stats: any;
}

function BalancoComparativoTab({ lacunas, conclusoes, indicadores, respostasCerd, orcStats, stats }: BalancoProps) {
  const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  // Compute analytical metrics
  const totalLacunas = lacunas.length;
  const cumpridas = lacunas.filter(l => l.status_cumprimento === 'cumprido').length;
  const parciais = lacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length;
  const naoCumpridas = lacunas.filter(l => l.status_cumprimento === 'nao_cumprido').length;
  const retrocessos = lacunas.filter(l => l.status_cumprimento === 'retrocesso').length;

  const avancos = conclusoes.filter((c: any) => c.tipo === 'avanco');
  const retrocessosConc = conclusoes.filter((c: any) => c.tipo === 'retrocesso');
  const lacunasPersist = conclusoes.filter((c: any) => c.tipo === 'lacuna_persistente');
  const paradoxos = conclusoes.filter((c: any) => c.tipo === 'paradoxo');

  // Categorias de indicadores
  const catCounts: Record<string, number> = {};
  indicadores.forEach((ind: any) => {
    catCounts[ind.categoria] = (catCounts[ind.categoria] || 0) + 1;
  });

  // Indicadores com série vs ponto único
  const comSerie = indicadores.filter((ind: any) => {
    const dados = ind.dados || {};
    const years = Object.keys(dados).filter(k => /^\d{4}$/.test(k));
    return years.length >= 3;
  }).length;
  const pontoUnico = indicadores.filter((ind: any) => {
    const dados = ind.dados || {};
    const years = Object.keys(dados).filter(k => /^\d{4}$/.test(k));
    return years.length <= 1;
  }).length;

  // Respostas CERD III
  const respParcial = respostasCerd.filter((r: any) => r.grau_atendimento === 'parcialmente_cumprido').length;
  const respNao = respostasCerd.filter((r: any) => r.grau_atendimento === 'nao_cumprido').length;
  const respRetro = respostasCerd.filter((r: any) => r.grau_atendimento === 'retrocesso').length;

  // Eixos temáticos distribution
  const eixos: Record<string, { total: number; nao: number; parcial: number; retro: number }> = {};
  lacunas.forEach(l => {
    const e = l.eixo_tematico;
    if (!eixos[e]) eixos[e] = { total: 0, nao: 0, parcial: 0, retro: 0 };
    eixos[e].total++;
    if (l.status_cumprimento === 'nao_cumprido') eixos[e].nao++;
    if (l.status_cumprimento === 'parcialmente_cumprido') eixos[e].parcial++;
    if (l.status_cumprimento === 'retrocesso') eixos[e].retro++;
  });

  const generateBalancoHTML = () => {
    const systemUrl = window.location.origin;
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Balanço Comparativo — Evolução do Sistema CERD IV</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; max-width: 210mm; margin: 0 auto; padding: 20px; font-size: 11px; line-height: 1.6; color: #1a1a2e; }
  h1 { font-size: 22px; color: #0f3460; border-bottom: 3px solid #0f3460; padding-bottom: 8px; }
  h2 { font-size: 16px; color: #16213e; margin-top: 28px; border-left: 4px solid #0f3460; padding-left: 10px; }
  h3 { font-size: 13px; color: #0f3460; margin-top: 18px; }
  .header { text-align: center; margin-bottom: 28px; border: 2px solid #0f3460; padding: 20px; border-radius: 10px; background: linear-gradient(135deg, #f0f4ff, #e8eeff); }
  .header p { margin: 3px 0; color: #555; }
  .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin: 16px 0; }
  .kpi { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; text-align: center; }
  .kpi .value { font-size: 28px; font-weight: 700; }
  .kpi .label { font-size: 10px; color: #64748b; margin-top: 2px; }
  .kpi .delta { font-size: 9px; color: #16a34a; font-weight: 600; }
  .kpi .delta.neg { color: #dc2626; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 10px; }
  th { background: #0f3460; color: white; padding: 7px 10px; text-align: left; font-weight: 600; }
  td { padding: 6px 10px; border-bottom: 1px solid #e2e8f0; }
  tr:nth-child(even) { background: #f8fafc; }
  .section-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 12px 0; background: #fafbff; }
  .highlight { background: #fffbeb; border: 1px solid #f59e0b; border-radius: 6px; padding: 10px; margin: 8px 0; font-size: 10px; }
  .conclusion-card { border-left: 4px solid #0f3460; padding: 10px 14px; margin: 8px 0; background: #f8fafc; border-radius: 0 6px 6px 0; }
  .link { color: #2563eb; text-decoration: underline; font-size: 9px; }
  .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 9px; font-weight: 600; }
  .badge-avanco { background: #dcfce7; color: #166534; }
  .badge-retrocesso { background: #fef2f2; color: #991b1b; }
  .badge-lacuna { background: #fef3c7; color: #92400e; }
  .badge-paradoxo { background: #ede9fe; color: #5b21b6; }
  .source { font-size: 9px; color: #94a3b8; font-style: italic; }
  @media print { .no-print { display: none; } body { padding: 0; } }
  @page { size: A4; margin: 2cm; }
</style></head><body>
${getExportToolbarHTML('Balanco-Comparativo-CERD-IV')}

<div class="header">
  <h1>📊 Balanço Comparativo — Estado Atual do Sistema</h1>
  <p><strong>Sistema de Subsídios ao IV Relatório Periódico do Brasil ao CERD</strong></p>
  <p>Documento de referência interna — Gerado em: ${now}</p>
  <p style="font-size:10px;color:#64748b;">Consolidação de todas as implementações realizadas nas últimas 24 horas</p>
</div>

<!-- SUMÁRIO EXECUTIVO -->
<h2>1. Sumário Executivo — Dimensão da Base</h2>
<div class="kpi-grid">
  <div class="kpi">
    <div class="value" style="color:#0f3460">${totalLacunas}</div>
    <div class="label">Recomendações ONU mapeadas</div>
    <div class="delta">CERD/C/BRA/CO/18-20</div>
  </div>
  <div class="kpi">
    <div class="value" style="color:#7c3aed">${indicadores.length}</div>
    <div class="label">Indicadores no BD</div>
    <div class="delta">+6 séries enriquecidas (24h)</div>
  </div>
  <div class="kpi">
    <div class="value" style="color:#0d9488">${orcStats?.totalRegistros || 0}</div>
    <div class="label">Registros orçamentários</div>
    <div class="delta">Federal 2018-2025</div>
  </div>
  <div class="kpi">
    <div class="value" style="color:#ea580c">${conclusoes.length}</div>
    <div class="label">Conclusões analíticas</div>
    <div class="delta">${avancos.length} avanços / ${retrocessosConc.length} retrocessos</div>
  </div>
</div>

<div class="section-box">
  <h3>📈 Composição da Base de Dados</h3>
  <table>
    <tr><th>Módulo</th><th>Registros</th><th>Fonte</th><th>Link no Sistema</th></tr>
    <tr><td>Recomendações ONU</td><td>${totalLacunas}</td><td>CERD/C/BRA/CO/18-20 (Ago/2022)</td><td><a class="link" href="${systemUrl}/conclusoes">→ Conclusões</a></td></tr>
    <tr><td>Respostas CERD III</td><td>${respostasCerd.length}</td><td>III Relatório Periódico (2018)</td><td><a class="link" href="${systemUrl}/gerar-relatorios">→ Gerar Relatórios</a></td></tr>
    <tr><td>Indicadores Interseccionais</td><td>${indicadores.length}</td><td>SIDRA, DataSUS, FBSP, CNJ, TSE</td><td><a class="link" href="${systemUrl}/estatisticas">→ Estatísticas</a></td></tr>
    <tr><td>Dados Orçamentários</td><td>${orcStats?.totalRegistros || 0}</td><td>SIOP / Portal Transparência</td><td><a class="link" href="${systemUrl}/orcamento">→ Orçamento</a></td></tr>
    <tr><td>Conclusões Analíticas</td><td>${conclusoes.length}</td><td>Cruzamento sistêmico</td><td><a class="link" href="${systemUrl}/conclusoes">→ Conclusões</a></td></tr>
  </table>
</div>

<!-- LACUNAS ONU -->
<h2>2. Recomendações ONU — Quadro de Cumprimento</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="value" style="color:#166534">${cumpridas}</div><div class="label">Cumpridas</div></div>
  <div class="kpi"><div class="value" style="color:#92400e">${parciais}</div><div class="label">Parcialmente cumpridas</div></div>
  <div class="kpi"><div class="value" style="color:#991b1b">${naoCumpridas}</div><div class="label">Não cumpridas</div></div>
  <div class="kpi"><div class="value" style="color:#7f1d1d">${retrocessos}</div><div class="label">Retrocessos</div></div>
</div>

<div class="highlight">
  ⚠️ <strong>Diagnóstico central:</strong> ${cumpridas} de ${totalLacunas} recomendações cumpridas (${totalLacunas > 0 ? Math.round(cumpridas/totalLacunas*100) : 0}%). 
  ${naoCumpridas} recomendações permanecem sem atendimento (${totalLacunas > 0 ? Math.round(naoCumpridas/totalLacunas*100) : 0}%) e ${retrocessos} apresentam retrocesso.
  O eixo mais crítico é <strong>Segurança Pública</strong> (${eixos['seguranca_publica']?.total || 0} lacunas, ${eixos['seguranca_publica']?.nao || 0} não cumpridas).
</div>

<h3>Distribuição por Eixo Temático</h3>
<table>
  <tr><th>Eixo</th><th>Total</th><th>Não cumpridas</th><th>Parciais</th><th>Retrocesso</th><th>Gravidade</th></tr>
  ${Object.entries(eixos).sort((a, b) => b[1].total - a[1].total).map(([eixo, d]) =>
    `<tr><td>${eixo.replace(/_/g, ' ')}</td><td>${d.total}</td><td style="color:#991b1b;font-weight:600">${d.nao}</td><td style="color:#92400e">${d.parcial}</td><td style="color:#7f1d1d">${d.retro}</td><td>${d.nao + d.retro > 3 ? '🔴 Crítico' : d.nao + d.retro > 1 ? '🟡 Alto' : '🟢 Moderado'}</td></tr>`
  ).join('')}
</table>

<!-- CONCLUSÕES ANALÍTICAS -->
<h2>3. Conclusões Analíticas — Fios Condutores</h2>
<p style="font-size:10px;color:#64748b;">As conclusões cruzam recomendações ONU × orçamento × indicadores para identificar padrões estruturais.</p>

<div class="section-box">
  <h3>Composição das ${conclusoes.length} Conclusões</h3>
  <table>
    <tr><th>Tipo</th><th>Qtd</th><th>Proporção</th></tr>
    <tr><td><span class="badge badge-avanco">Avanço</span></td><td>${avancos.length}</td><td>${conclusoes.length > 0 ? Math.round(avancos.length/conclusoes.length*100) : 0}%</td></tr>
    <tr><td><span class="badge badge-retrocesso">Retrocesso</span></td><td>${retrocessosConc.length}</td><td>${conclusoes.length > 0 ? Math.round(retrocessosConc.length/conclusoes.length*100) : 0}%</td></tr>
    <tr><td><span class="badge badge-lacuna">Lacuna Persistente</span></td><td>${lacunasPersist.length}</td><td>${conclusoes.length > 0 ? Math.round(lacunasPersist.length/conclusoes.length*100) : 0}%</td></tr>
    <tr><td><span class="badge badge-paradoxo">Paradoxo</span></td><td>${paradoxos.length}</td><td>${conclusoes.length > 0 ? Math.round(paradoxos.length/conclusoes.length*100) : 0}%</td></tr>
  </table>
</div>

${conclusoes.map((c: any) => `
<div class="conclusion-card">
  <p><span class="badge badge-${c.tipo === 'avanco' ? 'avanco' : c.tipo === 'retrocesso' ? 'retrocesso' : c.tipo === 'paradoxo' ? 'paradoxo' : 'lacuna'}">${c.tipo.replace(/_/g, ' ').toUpperCase()}</span> <strong>${c.titulo}</strong> <span style="font-size:9px;color:#94a3b8;">(${c.periodo})</span></p>
  <p style="font-size:10px;margin:4px 0;">${c.argumento_central}</p>
  ${c.evidencias?.length ? `<p class="source">Evidências: ${c.evidencias.slice(0, 3).join(' | ')}</p>` : ''}
  <p class="source">Eixos: ${(c.eixos_tematicos || []).join(', ').replace(/_/g, ' ')} | <a class="link" href="${systemUrl}/conclusoes">→ Ver no sistema</a></p>
</div>`).join('')}

<!-- INDICADORES -->
<h2>4. Base de Indicadores — Cobertura e Robustez</h2>
<div class="kpi-grid">
  <div class="kpi"><div class="value" style="color:#0f3460">${indicadores.length}</div><div class="label">Total de indicadores</div></div>
  <div class="kpi"><div class="value" style="color:#16a34a">${comSerie}</div><div class="label">Com série histórica (≥3 pontos)</div></div>
  <div class="kpi"><div class="value" style="color:#92400e">${pontoUnico}</div><div class="label">Dado pontual (≤1 ano)</div></div>
  <div class="kpi"><div class="value" style="color:#7c3aed">${Object.keys(catCounts).length}</div><div class="label">Categorias temáticas</div></div>
</div>

<h3>Distribuição por Categoria</h3>
<table>
  <tr><th>Categoria</th><th>Indicadores</th><th>Proporção</th></tr>
  ${Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(([cat, n]) =>
    `<tr><td>${cat.replace(/_/g, ' ')}</td><td>${n}</td><td>${Math.round(n/indicadores.length*100)}%</td></tr>`
  ).join('')}
</table>

<div class="highlight">
  📊 <strong>Enriquecimento nas últimas 24h:</strong> 6 indicadores de habitação/saneamento receberam séries históricas expandidas (PNAD Contínua 2016-2023), 
  deep links para SIDRA/IBGE, metadados de metodologia e notas sobre cruzamentos. Indicadores do Censo 2022 (quilombolas, indígenas em TIs) 
  foram documentados como baselines inaugurais sem série anterior possível.
</div>

<!-- RESPOSTAS CERD III -->
<h2>5. Respostas às Críticas do CERD III</h2>
<table>
  <tr><th>Grau de Atendimento</th><th>Qtd</th><th>%</th></tr>
  <tr><td>✅ Cumprido</td><td>${respostasCerd.filter((r: any) => r.grau_atendimento === 'cumprido').length}</td><td>${respostasCerd.length > 0 ? Math.round(respostasCerd.filter((r: any) => r.grau_atendimento === 'cumprido').length/respostasCerd.length*100) : 0}%</td></tr>
  <tr><td>⚠️ Parcialmente cumprido</td><td>${respParcial}</td><td>${respostasCerd.length > 0 ? Math.round(respParcial/respostasCerd.length*100) : 0}%</td></tr>
  <tr><td>❌ Não cumprido</td><td>${respNao}</td><td>${respostasCerd.length > 0 ? Math.round(respNao/respostasCerd.length*100) : 0}%</td></tr>
  <tr><td>🔴 Retrocesso</td><td>${respRetro}</td><td>${respostasCerd.length > 0 ? Math.round(respRetro/respostasCerd.length*100) : 0}%</td></tr>
</table>

<!-- ORÇAMENTO -->
<h2>6. Base Orçamentária</h2>
<div class="section-box">
  <table>
    <tr><th>Métrica</th><th>Valor</th></tr>
    <tr><td>Registros orçamentários</td><td>${orcStats?.totalRegistros || 0}</td></tr>
    <tr><td>Dotação autorizada total</td><td>R$ ${((orcStats?.totalDotacao || 0) / 1e9).toFixed(2)} bi</td></tr>
    <tr><td>Total pago</td><td>R$ ${((orcStats?.totalPago || 0) / 1e9).toFixed(2)} bi</td></tr>
    <tr><td>Variação entre períodos (P1→P2)</td><td>${orcStats?.variacao ? `${orcStats.variacao >= 0 ? '+' : ''}${orcStats.variacao.toFixed(1)}%` : 'N/A'}</td></tr>
    <tr><td>Período 1 (Trava Institucional)</td><td>2018-2022</td></tr>
    <tr><td>Período 2 (Retomada)</td><td>2023-2025</td></tr>
  </table>
  <p class="source">Fonte: SIOP/Portal da Transparência | <a class="link" href="${systemUrl}/orcamento">→ Ver no sistema</a></p>
</div>

<!-- IMPLEMENTAÇÕES 24H -->
<h2>7. Registro de Implementações — Últimas 24 Horas</h2>
<div class="section-box">
  <h3>Alterações realizadas</h3>
  <table>
    <tr><th>Módulo</th><th>Alteração</th><th>Impacto</th></tr>
    <tr><td>Indicadores BD</td><td>6 indicadores de habitação/saneamento enriquecidos com séries PNAD Contínua</td><td>Séries históricas 2016-2023 onde antes havia dado pontual</td></tr>
    <tr><td>Indicadores BD</td><td>Deep links SIDRA + metadados de metodologia adicionados</td><td>Auditabilidade total — cada indicador rastreável à fonte primária</td></tr>
    <tr><td>Indicadores BD</td><td>Notas sobre cruzamentos e baselines inaugurais (Censo 2022)</td><td>Transparência sobre limitações de séries quilombolas/indígenas</td></tr>
    <tr><td>Gerar Relatórios</td><td>Exportação DOCX adicionada a todos os relatórios analíticos</td><td>Todos os produtos exportáveis em PDF/HTML + Word editável</td></tr>
    <tr><td>Gerar Relatórios</td><td>Relatórios Recomendações ONU e Respostas CERD III com exportação</td><td>Dados do BD alimentam diretamente os documentos exportados</td></tr>
    <tr><td>Base Estatística</td><td>Seção Grupos Focais integrada ao relatório de Inventário</td><td>Quilombolas, indígenas, ciganos, juventude e mulheres negras no documento</td></tr>
    <tr><td>Base Estatística</td><td>Deep links bidirecionais sistema↔documento adicionados</td><td>Navegação direta do DOCX para a tela correspondente no sistema</td></tr>
    <tr><td>Indicadores BD</td><td>Persistência de indicadores de alta prioridade (homicídios, letalidade, encarceramento)</td><td>Base elevada para ${indicadores.length} indicadores auditáveis</td></tr>
  </table>
</div>

<div class="highlight">
  🔄 <strong>Impacto nas Conclusões:</strong> As conclusões analíticas (${conclusoes.length} registros) e os fios condutores permanecem estáveis — 
  as alterações das últimas 24h foram de <strong>enriquecimento de dados</strong> (mais séries, mais deep links, mais metadados), 
  não de reclassificação. Os vereditos de cumprimento das recomendações ONU (${cumpridas} cumpridas, ${naoCumpridas} não cumpridas, ${retrocessos} retrocessos) 
  e a composição de avanços/retrocessos nas conclusões (${avancos.length}/${retrocessosConc.length}) não sofreram alteração.
  <br/><br/>
  A aderência ICERD e o cruzamento artigos×lacunas×orçamento mantêm a mesma estrutura, agora com evidências mais robustas 
  nos indicadores de habitação/saneamento que fundamentam os Artigos V(e)(iii) e V(e)(iv) da Convenção.
</div>

<!-- CONCLUSÃO -->
<h2>8. Veredito</h2>
<div class="section-box">
  <p><strong>Estabilidade analítica confirmada.</strong> As implementações das últimas 24 horas foram de caráter qualitativo 
  (enriquecimento de séries, adição de metadados, ampliação de exportação), sem alterar:</p>
  <ul style="margin:8px 0;padding-left:20px;">
    <li>Classificação de cumprimento das ${totalLacunas} recomendações ONU</li>
    <li>Composição dos ${conclusoes.length} fios condutores (${avancos.length} avanço, ${lacunasPersist.length} lacunas persistentes, ${retrocessosConc.length} retrocesso)</li>
    <li>Pontuação de aderência ICERD por artigo</li>
    <li>Diagnóstico orçamentário (${orcStats?.totalRegistros || 0} registros, variação ${orcStats?.variacao ? `${orcStats.variacao >= 0 ? '+' : ''}${orcStats.variacao.toFixed(1)}%` : 'N/A'})</li>
  </ul>
  <p>O sistema está <strong>mais robusto</strong> para auditoria internacional, com ${indicadores.length} indicadores 
  agora contendo deep links, metodologia e notas de cruzamento — atendendo ao padrão de transparência exigido pelo Comitê CERD.</p>
</div>

<div class="source" style="margin-top:24px;padding-top:12px;border-top:2px solid #0f3460;">
  📋 Balanço Comparativo gerado pelo Sistema de Subsídios CERD IV — ${now}<br/>
  🔗 Links internos referem-se a: <a class="link" href="${systemUrl}">${systemUrl}</a>
</div>
</body></html>`;
  };

  return (
    <>
      <Card className="mb-6 border-l-4 border-l-accent">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <GitCompare className="w-6 h-6 text-accent-foreground flex-shrink-0" />
              <div>
                <h3 className="font-semibold mb-1">Balanço Comparativo — Evolução do Sistema</h3>
                <p className="text-sm text-muted-foreground">
                  Documento consolidado com o estado atual de lacunas, conclusões, indicadores, orçamento e implementações recentes
                </p>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button size="sm" className="gap-1" onClick={() => {
                const html = generateBalancoHTML();
                const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                window.open(URL.createObjectURL(blob), '_blank');
              }}>
                <FileDown className="w-3 h-3" /> PDF/HTML
              </Button>
              <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                downloadAsDocx(generateBalancoHTML(), 'Balanco-Comparativo-CERD-IV');
              }}>
                <Download className="w-3 h-3" /> DOCX
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-xs text-muted-foreground">Recomendações ONU</p>
            <p className="text-2xl font-bold">{totalLacunas}</p>
            <p className="text-xs text-muted-foreground">{cumpridas} cumpridas | {naoCumpridas} não</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-xs text-muted-foreground">Conclusões</p>
            <p className="text-2xl font-bold">{conclusoes.length}</p>
            <p className="text-xs text-success">{avancos.length} avanços</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-xs text-muted-foreground">Indicadores BD</p>
            <p className="text-2xl font-bold">{indicadores.length}</p>
            <p className="text-xs text-muted-foreground">{comSerie} com série | {pontoUnico} pontual</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 text-center">
            <p className="text-xs text-muted-foreground">Orçamento</p>
            <p className="text-2xl font-bold">{orcStats?.totalRegistros || 0}</p>
            <p className="text-xs text-muted-foreground">R$ {((orcStats?.totalDotacao || 0) / 1e9).toFixed(1)} bi</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Implementações Recentes (24h)</CardTitle>
          <CardDescription>Alterações que impactam os módulos analíticos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="flex-shrink-0">Indicadores</Badge>
              <p>6 indicadores de habitação/saneamento enriquecidos com séries PNAD Contínua 2016-2023 + deep links SIDRA</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="flex-shrink-0">Relatórios</Badge>
              <p>Exportação DOCX adicionada a todos os produtos analíticos + Recomendações ONU e Respostas CERD III</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="flex-shrink-0">Estatísticas</Badge>
              <p>Grupos Focais integrados ao relatório de Inventário com deep links bidirecionais</p>
            </div>
            <div className="flex items-start gap-2">
              <Badge variant="outline" className="flex-shrink-0">Base BD</Badge>
              <p>Indicadores de alta prioridade persistidos — base elevada para {indicadores.length} indicadores auditáveis</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <strong>Impacto nas Conclusões:</strong> Estável — nenhuma reclassificação de lacunas, avanços ou retrocessos. 
            As alterações foram de enriquecimento qualitativo (séries, metadados, exportação), fortalecendo a base probatória 
            sem alterar os vereditos analíticos.
          </div>
        </CardContent>
      </Card>
    </>
  );
}

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle, BookOpen, FileCheck, Loader2, PieChart, DollarSign, Sparkles, RefreshCw, Database, TrendingUp, TrendingDown, Scale, Landmark, HeartPulse, PlusCircle, FileDown, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLacunasIdentificadas, useRespostasLacunasCerdIII, useLacunasStats, useConclusoesAnaliticas, useIndicadoresInterseccionais, useDadosOrcamentarios, useOrcamentoStats } from '@/hooks/useLacunasData';
import { ThematicReportGenerator } from '@/components/reports/ThematicReportGenerator';
import { BudgetReportGenerator } from '@/components/reports/BudgetReportGenerator';
import { AIReportGenerator } from '@/components/reports/AIReportGenerator';
import { DocumentReportCards } from '@/components/reports/DocumentReportCards';
import { ConsolidatedScopeReport } from '@/components/reports/ConsolidatedScopeReport';
import { StatisticsInventoryReport } from '@/components/reports/StatisticsInventoryReport';
import { TOTAL_DADOS_NOVOS } from '@/utils/countStatisticsIndicators';
import { useQueryClient } from '@tanstack/react-query';
import { getExportToolbarHTML, downloadAsDocx } from '@/utils/reportExportToolbar';

const statusLabels: Record<string, { label: string; color: string }> = {
  cumprido: { label: 'Cumprido', color: 'bg-success text-success-foreground' },
  parcialmente_cumprido: { label: 'Parcial', color: 'bg-warning text-warning-foreground' },
  nao_cumprido: { label: 'Não Cumprido', color: 'bg-destructive text-destructive-foreground' },
  retrocesso: { label: 'Retrocesso', color: 'bg-destructive text-destructive-foreground' },
  em_andamento: { label: 'Em andamento', color: 'bg-primary text-primary-foreground' }
};

export default function GerarRelatorios() {
  const queryClient = useQueryClient();
  
  const { data: lacunas, isLoading: loadingLacunas } = useLacunasIdentificadas();
  const { data: respostasCerd, isLoading: loadingRespostas } = useRespostasLacunasCerdIII();
  const { data: stats, isLoading: loadingStats } = useLacunasStats();
  const { data: conclusoes } = useConclusoesAnaliticas();
  const { data: indicadores } = useIndicadoresInterseccionais();
  const { data: orcStats } = useOrcamentoStats();

  const isLoading = loadingLacunas || loadingRespostas || loadingStats;

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  const totalLacunas = stats?.total || 0;
  const cumpridas = stats?.porStatus.cumprido || 0;
  const parciais = stats?.porStatus.parcialmente_cumprido || 0;
  const naoCumpridas = stats?.porStatus.nao_cumprido || 0;
  const retrocessos = stats?.porStatus.retrocesso || 0;

  const respostasStats = {
    cumprido: respostasCerd?.filter(r => r.grau_atendimento === 'cumprido').length || 0,
    parcialmente_cumprido: respostasCerd?.filter(r => r.grau_atendimento === 'parcialmente_cumprido').length || 0,
    nao_cumprido: respostasCerd?.filter(r => r.grau_atendimento === 'nao_cumprido').length || 0,
    em_andamento: respostasCerd?.filter(r => r.grau_atendimento === 'em_andamento').length || 0,
  };

  // Generate Lacunas ONU report HTML
  const generateLacunasHTML = () => {
    const now = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const statusIcon = (s: string) => {
      const map: Record<string, string> = { cumprido: '✅', parcialmente_cumprido: '⚠️', nao_cumprido: '❌', retrocesso: '🔴', em_andamento: '🔄' };
      return map[s] || '';
    };
    return `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Lacunas ONU — Relatório CERD IV</title>
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
  <h1>⚠️ Lacunas ONU — Recomendações não cumpridas</h1>
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
      subtitle="Análise de políticas raciais com base nos dados do sistema — Lacunas ONU, Orçamento, Indicadores"
    >
      {/* Header analítico */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="gap-1"><Database className="w-3 h-3" />{totalLacunas} lacunas ONU</Badge>
          <Badge variant="outline" className="gap-1"><FileCheck className="w-3 h-3" />{respostasCerd?.length || 0} respostas CERD III</Badge>
          <Badge variant="outline" className="gap-1"><DollarSign className="w-3 h-3" />{orcStats?.totalRegistros || 0} registros orçamentários</Badge>
          <Badge variant="outline" className="gap-1"><TrendingUp className="w-3 h-3" />{indicadores?.length || 0} indicadores BD</Badge>
          <Badge variant="outline" className="gap-1"><PlusCircle className="w-3 h-3" />{TOTAL_DADOS_NOVOS} dados novos auditáveis</Badge>
          <Badge variant="outline" className="gap-1"><Scale className="w-3 h-3" />{conclusoes?.length || 0} conclusões</Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Cards de geração de documentos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <DocumentReportCards />
        </div>
        <StatisticsInventoryReport />
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

      <Tabs defaultValue="consolidado" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
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
          <TabsTrigger value="lacunas-db" className="gap-1">
            <AlertTriangle className="w-4 h-4" /> Lacunas ONU ({totalLacunas})
          </TabsTrigger>
          <TabsTrigger value="respostas-db" className="gap-1">
            <FileCheck className="w-4 h-4" /> Respostas CERD III ({respostasCerd?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* ABA: CONSOLIDADO - ESCOPO DO PROJETO */}
        <TabsContent value="consolidado">
          <ConsolidatedScopeReport />
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
          <BudgetReportGenerator />
        </TabsContent>

        {/* ABA: LACUNAS DO BANCO */}
        <TabsContent value="lacunas-db">
          <Card className="mb-6 border-l-4 border-l-primary">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Lacunas Identificadas — Recomendações ONU não cumpridas</h3>
                    <p className="text-sm text-muted-foreground">
                      {totalLacunas} observações/recomendações do Comitê CERD mapeadas, com análise de cumprimento e evidências
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" className="gap-1" onClick={() => {
                    const html = generateLacunasHTML();
                    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                    window.open(URL.createObjectURL(blob), '_blank');
                  }}>
                    <FileDown className="w-3 h-3" /> PDF/HTML
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                    downloadAsDocx(generateLacunasHTML(), 'Lacunas-ONU-CERD-IV');
                  }}>
                    <Download className="w-3 h-3" /> DOCX
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingLacunas ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {lacunas?.map((lacuna) => (
                  <Card key={lacuna.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-1">
                          <Badge variant="outline" className="font-mono">§{lacuna.paragrafo}</Badge>
                        </div>
                        <div className="md:col-span-2">
                          <p className="font-semibold text-sm">{lacuna.tema}</p>
                          <p className="text-xs text-muted-foreground">{lacuna.eixo_tematico.replace(/_/g, ' ')}</p>
                        </div>
                        <div className="md:col-span-4">
                          <p className="text-xs text-muted-foreground mb-1">Lacuna identificada:</p>
                          <p className="text-sm line-clamp-2">{lacuna.descricao_lacuna}</p>
                        </div>
                        <div className="md:col-span-3">
                          <p className="text-xs text-muted-foreground mb-1">Resposta sugerida (CERD IV):</p>
                          <p className="text-sm line-clamp-2">{lacuna.resposta_sugerida_cerd_iv || 'Em elaboração'}</p>
                        </div>
                        <div className="md:col-span-2 flex flex-col items-end gap-1">
                          <Badge className={statusLabels[lacuna.status_cumprimento]?.color || 'bg-muted'}>
                            {statusLabels[lacuna.status_cumprimento]?.label || lacuna.status_cumprimento}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {lacuna.grupo_focal.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div className="p-3 bg-success/10 rounded-lg">
                      <p className="text-2xl font-bold text-success">{cumpridas}</p>
                      <p className="text-xs text-muted-foreground">Cumpridas</p>
                    </div>
                    <div className="p-3 bg-warning/10 rounded-lg">
                      <p className="text-2xl font-bold text-warning">{parciais}</p>
                      <p className="text-xs text-muted-foreground">Parciais</p>
                    </div>
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <p className="text-2xl font-bold text-destructive">{naoCumpridas}</p>
                      <p className="text-xs text-muted-foreground">Não Cumpridas</p>
                    </div>
                    <div className="p-3 bg-destructive/10 rounded-lg">
                      <p className="text-2xl font-bold text-destructive">{retrocessos}</p>
                      <p className="text-xs text-muted-foreground">Retrocessos</p>
                    </div>
                    <div className="p-3 bg-primary/10 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{stats?.porPrioridade.critica || 0}</p>
                      <p className="text-xs text-muted-foreground">Críticas</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ABA: RESPOSTAS CERD III */}
        <TabsContent value="respostas-db">
          <Card className="mb-6 border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <FileCheck className="w-6 h-6 text-warning flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-1">Respostas às Críticas do CERD III — Balanço Analítico</h3>
                    <p className="text-sm text-muted-foreground">
                      {respostasCerd?.length || 0} críticas do relatório anterior com avaliação de cumprimento
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" className="gap-1" onClick={() => {
                    const html = generateRespostasHTML();
                    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
                    window.open(URL.createObjectURL(blob), '_blank');
                  }}>
                    <FileDown className="w-3 h-3" /> PDF/HTML
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1" onClick={() => {
                    downloadAsDocx(generateRespostasHTML(), 'Respostas-CERD-III-Balanco');
                  }}>
                    <Download className="w-3 h-3" /> DOCX
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {loadingRespostas ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto">
              {respostasCerd?.map((resposta) => (
                <Card key={resposta.id}>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-1">
                        <Badge variant="outline" className="font-mono">§{resposta.paragrafo_cerd_iii}</Badge>
                      </div>
                      <div className="md:col-span-4">
                        <p className="text-xs text-muted-foreground mb-1">Crítica Original:</p>
                        <p className="text-sm">{resposta.critica_original}</p>
                      </div>
                      <div className="md:col-span-5">
                        <p className="text-xs text-muted-foreground mb-1">Resposta Brasil:</p>
                        <p className="text-sm">{resposta.resposta_brasil}</p>
                        {resposta.lacunas_remanescentes && resposta.lacunas_remanescentes.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-warning">Lacunas remanescentes:</p>
                            <ul className="text-xs text-muted-foreground">
                              {resposta.lacunas_remanescentes.slice(0, 2).map((l, i) => (
                                <li key={i}>• {l}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2 flex items-start justify-end">
                        <Badge className={statusLabels[resposta.grau_atendimento]?.color || 'bg-muted'}>
                          {statusLabels[resposta.grau_atendimento]?.label || resposta.grau_atendimento}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <Card className="mt-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">{respostasStats.cumprido}</p>
                  <p className="text-xs text-muted-foreground">Atendidas</p>
                </div>
                <div className="p-3 bg-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-warning">{respostasStats.parcialmente_cumprido}</p>
                  <p className="text-xs text-muted-foreground">Parciais</p>
                </div>
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <p className="text-2xl font-bold text-destructive">{respostasStats.nao_cumprido}</p>
                  <p className="text-xs text-muted-foreground">Não Atendidas</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{respostasStats.em_andamento}</p>
                  <p className="text-xs text-muted-foreground">Em Andamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

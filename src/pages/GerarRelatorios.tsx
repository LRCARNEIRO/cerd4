import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, AlertTriangle, BookOpen, FileCheck, Loader2, PieChart, DollarSign, Sparkles, RefreshCw, Database, TrendingUp, TrendingDown, Scale, Landmark, HeartPulse, PlusCircle } from 'lucide-react';
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
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Lacunas Identificadas — Recomendações ONU não cumpridas</h3>
                  <p className="text-sm text-muted-foreground">
                    {totalLacunas} observações/recomendações do Comitê CERD mapeadas, com análise de cumprimento e evidências
                  </p>
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
              <div className="flex items-start gap-3">
                <FileCheck className="w-6 h-6 text-warning flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Respostas às Críticas do CERD III — Balanço Analítico</h3>
                  <p className="text-sm text-muted-foreground">
                    {respostasCerd?.length || 0} críticas do relatório anterior com avaliação de cumprimento
                  </p>
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

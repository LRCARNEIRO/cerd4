import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle, Lightbulb, BarChart3, Loader2, Database, RefreshCw, FileText, Scale, BookOpen, Users, Landmark, Link2, Zap, Eye, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useAnalyticalInsights } from '@/hooks/useAnalyticalInsights';
import type { FioCondutor, InsightCruzamento, ConclusaoDinamica } from '@/hooks/useAnalyticalInsights';

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
  dados_estatisticas: 'Dados e Estatísticas'
};

export default function Conclusoes() {
  const queryClient = useQueryClient();
  const {
    isLoading,
    fiosCondutores,
    conclusoesDinamicas,
    insightsCruzamento,
    sinteseExecutiva,
    stats,
    lacunas,
    respostas,
    orcStats,
    indicadores,
  } = useAnalyticalInsights();

  const handleRefresh = () => {
    queryClient.invalidateQueries();
  };

  // Agrupar conclusões por tipo
  const conclusoesAgrupadas = {
    lacuna_persistente: conclusoesDinamicas.filter(c => c.tipo === 'lacuna_persistente'),
    avanco: conclusoesDinamicas.filter(c => c.tipo === 'avanco'),
    retrocesso: conclusoesDinamicas.filter(c => c.tipo === 'retrocesso'),
  };

  // Cumprimento por eixo
  const cumprimentoPorEixo = Object.entries(stats?.porEixo || {}).map(([eixo, total]) => {
    const cumpridas = lacunas?.filter(l => l.eixo_tematico === eixo && l.status_cumprimento === 'cumprido').length || 0;
    const parciais = lacunas?.filter(l => l.eixo_tematico === eixo && l.status_cumprimento === 'parcialmente_cumprido').length || 0;
    const percentual = (total as number) > 0 ? Math.round(((cumpridas * 100) + (parciais * 50)) / (total as number)) : 0;
    return { eixo: eixoLabels[eixo] || eixo, cumprimento: percentual };
  }).sort((a, b) => b.cumprimento - a.cumprimento);

  return (
    <DashboardLayout
      title="Conclusões Analíticas"
      subtitle="Meta 4: O que o Estado brasileiro fez e deixou de fazer (2018-2024) — Atualizado automaticamente"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="gap-1">
            <Database className="w-3 h-3" />
            {indicadores?.length || 0} indicadores
          </Badge>
          <Badge variant="outline" className="gap-1">
            <FileText className="w-3 h-3" />
            {stats?.total || 0} lacunas ONU
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Scale className="w-3 h-3" />
            {respostas?.length || 0} respostas CERD III
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Landmark className="w-3 h-3" />
            {orcStats?.totalRegistros || 0} reg. orçamentários
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
          Atualizar
        </Button>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Carregando e cruzando dados...</span>
        </div>
      )}

      {!isLoading && sinteseExecutiva && (
        <>
          {/* Status Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Database className="w-5 h-5 text-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Lacunas</p>
                  <p className="text-xl font-bold">{sinteseExecutiva.totalLacunas}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cumprimento</p>
                  <p className="text-xl font-bold text-success">{sinteseExecutiva.percentualPositivo}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className="p-2 bg-destructive/10 rounded-lg">
                  <XCircle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Não cumprido</p>
                  <p className="text-xl font-bold text-destructive">{sinteseExecutiva.percentualNegativo}%</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className="p-2 bg-warning/10 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Retrocessos</p>
                  <p className="text-xl font-bold text-warning">{sinteseExecutiva.retrocessos}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-4 flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Fios Condutores</p>
                  <p className="text-xl font-bold">{fiosCondutores.length}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Síntese Executiva Dinâmica */}
          <Card className="mb-6 border-2 border-primary">
            <CardHeader className="bg-primary/5">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-primary" />
                Síntese Executiva (Gerada a partir do Banco de Dados)
              </CardTitle>
              <CardDescription>
                Atualizada automaticamente com base em {sinteseExecutiva.totalLacunas} lacunas, {sinteseExecutiva.totalRespostasCERDIII} respostas CERD III, {sinteseExecutiva.totalIndicadores} indicadores e {sinteseExecutiva.totalOrcamento} registros orçamentários
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-sm leading-relaxed text-muted-foreground">{sinteseExecutiva.narrativa}</p>
              
              {sinteseExecutiva.eixosMaisProblematicos.length > 0 && (
                <div className="mt-4 p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
                  <p className="text-xs font-semibold text-destructive mb-2">⚠️ Eixos mais críticos (maior % não-cumprimento):</p>
                  <div className="space-y-2">
                    {sinteseExecutiva.eixosMaisProblematicos.map((e, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm">{e.eixo} ({e.total} lacunas)</span>
                        <Badge variant="destructive">{Math.round(e.gravidade * 100)}% não cumprido</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="fios" className="w-full">
            <TabsList className="mb-6 flex-wrap h-auto gap-1">
              <TabsTrigger value="fios" className="gap-1">
                <Link2 className="w-4 h-4" /> Fios Condutores
              </TabsTrigger>
              <TabsTrigger value="cruzamentos" className="gap-1">
                <Zap className="w-4 h-4" /> Cruzamentos & Insights
              </TabsTrigger>
              <TabsTrigger value="lacunas" className="gap-1">
                <AlertTriangle className="w-4 h-4" /> Lacunas Persistentes ({conclusoesAgrupadas.lacuna_persistente.length})
              </TabsTrigger>
              <TabsTrigger value="avancos" className="gap-1">
                <TrendingUp className="w-4 h-4" /> Avanços ({conclusoesAgrupadas.avanco.length})
              </TabsTrigger>
              <TabsTrigger value="retrocessos" className="gap-1">
                <TrendingDown className="w-4 h-4" /> Retrocessos ({conclusoesAgrupadas.retrocesso.length})
              </TabsTrigger>
              <TabsTrigger value="cumprimento" className="gap-1">
                <BarChart3 className="w-4 h-4" /> Por Eixo
              </TabsTrigger>
            </TabsList>

            {/* ABA: FIOS CONDUTORES */}
            <TabsContent value="fios">
              <div className="space-y-6">
                <Card className="bg-primary/5 border-primary/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <Link2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-sm">O que são Fios Condutores?</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          São argumentos transversais que conectam diferentes eixos temáticos, evidências e dados orçamentários 
                          para formar uma narrativa coerente sobre a atuação do Estado brasileiro na agenda racial. Cada fio é 
                          gerado automaticamente pelo cruzamento das {sinteseExecutiva.totalLacunas} lacunas, {sinteseExecutiva.totalRespostasCERDIII} respostas CERD III 
                          e {sinteseExecutiva.totalOrcamento} registros orçamentários do banco de dados.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {fiosCondutores.map((fio) => (
                  <FioCondutorCard key={fio.id} fio={fio} />
                ))}
              </div>
            </TabsContent>

            {/* ABA: CRUZAMENTOS & INSIGHTS */}
            <TabsContent value="cruzamentos">
              <div className="space-y-4">
                <Card className="bg-muted/30">
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground">
                      Insights gerados pelo cruzamento automático de lacunas ONU × orçamento × indicadores × respostas CERD III. 
                      Estes alertas e correlações ajudam a identificar padrões e contradições na política racial brasileira.
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {insightsCruzamento.map((insight) => (
                    <InsightCard key={insight.id} insight={insight} />
                  ))}
                </div>
              </div>
            </TabsContent>

            {/* ABA: LACUNAS PERSISTENTES */}
            <TabsContent value="lacunas">
              <div className="space-y-4">
                {conclusoesAgrupadas.lacuna_persistente.length === 0 ? (
                  <EmptyState message="Nenhuma lacuna persistente identificada com os dados atuais." />
                ) : (
                  conclusoesAgrupadas.lacuna_persistente.map((c) => (
                    <ConclusaoCard key={c.id} conclusao={c} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* ABA: AVANÇOS */}
            <TabsContent value="avancos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {conclusoesAgrupadas.avanco.length === 0 ? (
                  <EmptyState message="Nenhum avanço identificado com os dados atuais." />
                ) : (
                  conclusoesAgrupadas.avanco.map((c) => (
                    <ConclusaoCard key={c.id} conclusao={c} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* ABA: RETROCESSOS */}
            <TabsContent value="retrocessos">
              <div className="space-y-4">
                {conclusoesAgrupadas.retrocesso.length === 0 ? (
                  <EmptyState message="Nenhum retrocesso identificado com os dados atuais." />
                ) : (
                  conclusoesAgrupadas.retrocesso.map((c) => (
                    <ConclusaoCard key={c.id} conclusao={c} />
                  ))
                )}
              </div>
            </TabsContent>

            {/* ABA: CUMPRIMENTO POR EIXO */}
            <TabsContent value="cumprimento">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Grau de Cumprimento por Eixo Temático
                    </CardTitle>
                    <CardDescription>
                      Baseado nas {stats?.total || 0} lacunas do banco de dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {cumprimentoPorEixo.length > 0 ? (
                      <div className="space-y-4">
                        {cumprimentoPorEixo.map((item, i) => (
                          <div key={i}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium">{item.eixo}</span>
                              <span className={cn(
                                'text-sm font-bold',
                                item.cumprimento >= 50 && 'text-success',
                                item.cumprimento >= 30 && item.cumprimento < 50 && 'text-warning',
                                item.cumprimento < 30 && 'text-destructive'
                              )}>
                                {item.cumprimento}%
                              </span>
                            </div>
                            <Progress 
                              value={item.cumprimento} 
                              className={cn(
                                'h-3',
                                item.cumprimento >= 50 && '[&>div]:bg-success',
                                item.cumprimento >= 30 && item.cumprimento < 50 && '[&>div]:bg-warning',
                                item.cumprimento < 30 && '[&>div]:bg-destructive'
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState message="Insira dados de lacunas para visualizar o cumprimento por eixo." />
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Distribuição por Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-success/10 rounded-lg text-center">
                        <p className="text-3xl font-bold text-success">{stats?.porStatus.cumprido || 0}</p>
                        <p className="text-sm text-muted-foreground">Cumpridas</p>
                      </div>
                      <div className="p-4 bg-warning/10 rounded-lg text-center">
                        <p className="text-3xl font-bold text-warning">{stats?.porStatus.parcialmente_cumprido || 0}</p>
                        <p className="text-sm text-muted-foreground">Parcialmente</p>
                      </div>
                      <div className="p-4 bg-destructive/10 rounded-lg text-center">
                        <p className="text-3xl font-bold text-destructive">{stats?.porStatus.nao_cumprido || 0}</p>
                        <p className="text-sm text-muted-foreground">Não Cumpridas</p>
                      </div>
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <p className="text-3xl font-bold">{stats?.porStatus.retrocesso || 0}</p>
                        <p className="text-sm text-muted-foreground">Retrocesso</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="mt-6 bg-primary/5">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <RefreshCw className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Atualização Automática</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Todas as conclusões, fios condutores e cruzamentos são recalculados automaticamente 
                        a cada atualização dos dados no banco. Insira ou corrija dados nas bases Estatística, 
                        Orçamentária e Normativa e clique "Atualizar" para ver o impacto.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </DashboardLayout>
  );
}

// =============================================
// COMPONENTES AUXILIARES
// =============================================

function FioCondutorCard({ fio }: { fio: FioCondutor }) {
  const tipoConfig = {
    paradoxo: { icon: Scale, color: 'border-l-primary', bg: 'bg-primary/5', label: 'Paradoxo' },
    correlacao: { icon: Link2, color: 'border-l-accent', bg: 'bg-accent/5', label: 'Correlação' },
    tendencia: { icon: TrendingUp, color: 'border-l-success', bg: 'bg-success/5', label: 'Tendência' },
    lacuna_critica: { icon: AlertTriangle, color: 'border-l-destructive', bg: 'bg-destructive/5', label: 'Lacuna Crítica' },
    avanco: { icon: CheckCircle2, color: 'border-l-success', bg: 'bg-success/5', label: 'Avanço' },
    retrocesso: { icon: TrendingDown, color: 'border-l-destructive', bg: 'bg-destructive/5', label: 'Retrocesso' },
  };

  const config = tipoConfig[fio.tipo];
  const Icon = config.icon;

  return (
    <Card className={cn('border-l-4', config.color)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="w-5 h-5" />
            {fio.titulo}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{config.label}</Badge>
            <Badge className={fio.relevancia === 'alta' ? 'bg-destructive text-destructive-foreground' : 'bg-muted text-muted-foreground'}>
              {fio.relevancia}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4 whitespace-pre-line">{fio.argumento}</p>

        {fio.comparativo2018 && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg mb-4">
            <p className="text-xs font-semibold text-primary mb-1">📊 Comparativo 2018 → 2024:</p>
            <p className="text-xs text-muted-foreground">{fio.comparativo2018}</p>
          </div>
        )}

        {fio.evidencias.length > 0 && (
          <div className={cn('p-3 rounded-lg mb-3', config.bg)}>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Evidências do banco ({fio.evidencias.length}):
            </p>
            <ul className="space-y-1">
              {fio.evidencias.slice(0, 6).map((ev, i) => (
                <li key={i} className="text-xs flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <span>
                    <strong>{ev.texto}</strong>
                    <span className="text-muted-foreground ml-1">({ev.fonte})</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {fio.eixos.map((e, i) => (
            <Badge key={i} variant="outline" className="text-xs">{eixoLabels[e] || e}</Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function InsightCard({ insight }: { insight: InsightCruzamento }) {
  const tipoConfig = {
    alerta: { color: 'border-l-destructive', icon: AlertTriangle, iconColor: 'text-destructive' },
    progresso: { color: 'border-l-success', icon: CheckCircle2, iconColor: 'text-success' },
    contradição: { color: 'border-l-warning', icon: Zap, iconColor: 'text-warning' },
    correlação: { color: 'border-l-primary', icon: Link2, iconColor: 'text-primary' },
  };

  const config = tipoConfig[insight.tipo];
  const Icon = config.icon;

  return (
    <Card className={cn('border-l-4', config.color)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className={cn('w-4 h-4', config.iconColor)} />
          {insight.titulo}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-3">{insight.descricao}</p>
        <ul className="space-y-1">
          {insight.dados.slice(0, 5).map((d, i) => (
            <li key={i} className="text-xs flex items-start gap-1.5">
              <span className="text-muted-foreground">•</span>
              <span>{d}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

function ConclusaoCard({ conclusao }: { conclusao: ConclusaoDinamica }) {
  return (
    <Card className={cn(
      'border-l-4',
      conclusao.tipo === 'avanco' && 'border-l-success',
      conclusao.tipo === 'retrocesso' && 'border-l-destructive',
      conclusao.tipo === 'lacuna_persistente' && 'border-l-warning'
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="text-base flex items-center gap-2">
            {conclusao.tipo === 'avanco' && <TrendingUp className="w-5 h-5 text-success" />}
            {conclusao.tipo === 'retrocesso' && <TrendingDown className="w-5 h-5 text-destructive" />}
            {conclusao.tipo === 'lacuna_persistente' && <AlertTriangle className="w-5 h-5 text-warning" />}
            {conclusao.titulo}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{conclusao.periodo}</Badge>
            {conclusao.fromDatabase && (
              <Badge className="bg-primary/10 text-primary text-xs">Dinâmico</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">{conclusao.argumento_central}</p>
        
        {conclusao.evidencias.length > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg mb-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Evidências ({conclusao.evidencias.length}):</p>
            <ul className="text-sm space-y-1">
              {conclusao.evidencias.slice(0, 6).map((ev, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-1">•</span>
                  <span className="text-xs">{ev}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {conclusao.fiosCondutores.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            <Link2 className="w-3 h-3 text-primary" />
            <span className="text-xs text-primary font-medium">
              Conectado a: {conclusao.fiosCondutores.join(', ')}
            </span>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {conclusao.eixos.map((eixo, i) => (
            <Badge key={i} variant="outline" className="text-xs">
              {eixoLabels[eixo] || eixo.replace(/_/g, ' ')}
            </Badge>
          ))}
          {conclusao.relevancia_cerd_iv && (
            <Badge className="bg-accent/10 text-accent-foreground text-xs">CERD IV</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground col-span-full">
      <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
      <p>{message}</p>
    </div>
  );
}

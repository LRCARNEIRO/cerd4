import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle, Scale, Target, Lightbulb, BarChart3, ArrowRight, Loader2, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useConclusoesAnaliticas, useLacunasStats, useLacunasIdentificadas } from '@/hooks/useLacunasData';

export default function Conclusoes() {
  const { data: conclusoes, isLoading: loadingConclusoes } = useConclusoesAnaliticas();
  const { data: stats, isLoading: loadingStats } = useLacunasStats();
  const { data: lacunas, isLoading: loadingLacunas } = useLacunasIdentificadas();

  const isLoading = loadingConclusoes || loadingStats || loadingLacunas;

  // Agrupar conclusões por tipo
  const conclusoesAgrupadas = {
    lacuna_persistente: conclusoes?.filter(c => c.tipo === 'lacuna_persistente') || [],
    avanco: conclusoes?.filter(c => c.tipo === 'avanco') || [],
    retrocesso: conclusoes?.filter(c => c.tipo === 'retrocesso') || [],
  };

  // Calcular cumprimento por eixo temático baseado nos dados reais
  const cumprimentoPorEixo = Object.entries(stats?.porEixo || {}).map(([eixo, total]) => {
    const cumpridas = lacunas?.filter(l => l.eixo_tematico === eixo && l.status_cumprimento === 'cumprido').length || 0;
    const parciais = lacunas?.filter(l => l.eixo_tematico === eixo && l.status_cumprimento === 'parcialmente_cumprido').length || 0;
    const percentual = total > 0 ? Math.round(((cumpridas * 100) + (parciais * 50)) / total) : 0;
    
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

    return {
      eixo: eixoLabels[eixo] || eixo,
      cumprimento: percentual
    };
  }).sort((a, b) => b.cumprimento - a.cumprimento);

  // Tese central da análise
  const teseCentral = conclusoesAgrupadas.lacuna_persistente.find(c => 
    c.titulo.includes('Paradoxo')
  );

  return (
    <DashboardLayout
      title="Conclusões"
      subtitle="Análise: O que o Estado brasileiro fez e deixou de fazer (2018-2026)"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Database className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Lacunas</p>
              <p className="text-xl font-bold">{isLoading ? '...' : stats?.total || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cumpridas</p>
              <p className="text-xl font-bold text-success">{isLoading ? '...' : stats?.porStatus.cumprido || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Parciais</p>
              <p className="text-xl font-bold text-warning">{isLoading ? '...' : stats?.porStatus.parcialmente_cumprido || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Não Cumpridas</p>
              <p className="text-xl font-bold text-destructive">{isLoading ? '...' : stats?.porStatus.nao_cumprido || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conclusões</p>
              <p className="text-xl font-bold">{isLoading ? '...' : conclusoes?.length || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tese Central */}
      {teseCentral && (
        <Card className="mb-6 border-2 border-primary">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-primary" />
              {teseCentral.titulo}
            </CardTitle>
            <CardDescription>
              Fio condutor da análise baseada no conjunto de dados 2018-2026
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="text-sm leading-relaxed whitespace-pre-line">{teseCentral.argumento_central}</p>
            </div>
            {teseCentral.evidencias && teseCentral.evidencias.length > 0 && (
              <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-xs font-medium text-muted-foreground mb-2">Evidências:</p>
                <ul className="space-y-1">
                  {teseCentral.evidencias.map((ev, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      {ev}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="analises" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="analises" className="gap-1">
            <Lightbulb className="w-4 h-4" /> Análises do Banco
          </TabsTrigger>
          <TabsTrigger value="avancos" className="gap-1">
            <CheckCircle2 className="w-4 h-4" /> Avanços (2023-2025)
          </TabsTrigger>
          <TabsTrigger value="retrocessos" className="gap-1">
            <TrendingDown className="w-4 h-4" /> Retrocessos (2018-2022)
          </TabsTrigger>
          <TabsTrigger value="cumprimento" className="gap-1">
            <BarChart3 className="w-4 h-4" /> Cumprimento por Eixo
          </TabsTrigger>
        </TabsList>

        {/* ABA: ANÁLISES DO BANCO */}
        <TabsContent value="analises">
          {loadingConclusoes ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando análises do banco...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {conclusoes?.map((conclusao) => (
                <Card key={conclusao.id} className={cn(
                  'border-l-4',
                  conclusao.tipo === 'avanco' && 'border-l-success',
                  conclusao.tipo === 'retrocesso' && 'border-l-destructive',
                  conclusao.tipo === 'lacuna_persistente' && 'border-l-warning',
                  conclusao.tipo === 'omissao' && 'border-l-destructive'
                )}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        {conclusao.tipo === 'avanco' && <TrendingUp className="w-5 h-5 text-success" />}
                        {conclusao.tipo === 'retrocesso' && <TrendingDown className="w-5 h-5 text-destructive" />}
                        {conclusao.tipo === 'lacuna_persistente' && <AlertTriangle className="w-5 h-5 text-warning" />}
                        {conclusao.tipo === 'omissao' && <XCircle className="w-5 h-5 text-destructive" />}
                        {conclusao.titulo}
                      </CardTitle>
                      <Badge variant="outline">{conclusao.periodo}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3">{conclusao.argumento_central}</p>
                    
                    {conclusao.evidencias && conclusao.evidencias.length > 0 && (
                      <div className="p-3 bg-muted/50 rounded-lg mb-3">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Evidências:</p>
                        <ul className="text-sm space-y-0.5">
                          {conclusao.evidencias.slice(0, 4).map((ev, i) => (
                            <li key={i} className="flex items-start gap-1">
                              <span className="text-primary">•</span>
                              {ev}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2">
                      {conclusao.eixos_tematicos?.map((eixo, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {eixo.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                      {conclusao.grupos_focais?.map((grupo, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {grupo.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>

                    {(conclusao.relevancia_common_core || conclusao.relevancia_cerd_iv) && (
                      <div className="mt-3 flex gap-2">
                        {conclusao.relevancia_common_core && (
                          <Badge className="bg-primary/10 text-primary text-xs">
                            Relevante para Common Core
                          </Badge>
                        )}
                        {conclusao.relevancia_cerd_iv && (
                          <Badge className="bg-accent/10 text-accent text-xs">
                            Relevante para CERD IV
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {(!conclusoes || conclusoes.length === 0) && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma conclusão analítica encontrada no banco de dados.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* ABA: AVANÇOS */}
        <TabsContent value="avancos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conclusoesAgrupadas.avanco.map((conclusao) => (
              <Card key={conclusao.id} className="border-t-4 border-t-success">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    {conclusao.titulo}
                  </CardTitle>
                  <CardDescription>{conclusao.periodo}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{conclusao.argumento_central}</p>
                  
                  {conclusao.evidencias && (
                    <ul className="space-y-1">
                      {conclusao.evidencias.slice(0, 3).map((ev, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-success mt-1" />
                          {ev}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ABA: RETROCESSOS */}
        <TabsContent value="retrocessos">
          <div className="space-y-4">
            {conclusoesAgrupadas.retrocesso.map((conclusao) => (
              <Card key={conclusao.id} className="border-l-4 border-l-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <TrendingDown className="w-6 h-6 text-destructive flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{conclusao.titulo}</h3>
                        <Badge variant="outline">{conclusao.periodo}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{conclusao.argumento_central}</p>
                      
                      {conclusao.evidencias && (
                        <div className="p-3 bg-destructive/5 rounded-lg">
                          <ul className="space-y-1">
                            {conclusao.evidencias.map((ev, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <XCircle className="w-3 h-3 text-destructive mt-1 flex-shrink-0" />
                                {ev}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ABA: CUMPRIMENTO */}
        <TabsContent value="cumprimento">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Grau de Cumprimento das Recomendações por Eixo Temático
              </CardTitle>
              <CardDescription>
                Baseado nas {stats?.total || 0} lacunas identificadas no banco de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>

          {/* Resumo por status */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-base">Distribuição por Status de Cumprimento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-4 bg-success/10 rounded-lg">
                  <p className="text-3xl font-bold text-success">{stats?.porStatus.cumprido || 0}</p>
                  <p className="text-sm text-muted-foreground">Cumpridas</p>
                </div>
                <div className="p-4 bg-warning/10 rounded-lg">
                  <p className="text-3xl font-bold text-warning">{stats?.porStatus.parcialmente_cumprido || 0}</p>
                  <p className="text-sm text-muted-foreground">Parcialmente</p>
                </div>
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-3xl font-bold text-destructive">{stats?.porStatus.nao_cumprido || 0}</p>
                  <p className="text-sm text-muted-foreground">Não Cumpridas</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-3xl font-bold">{stats?.porPrioridade.critica || 0}</p>
                  <p className="text-sm text-muted-foreground">Prioridade Crítica</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

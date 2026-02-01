import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MetaProgressCard } from '@/components/dashboard/MetaProgressCard';
import { workPlanMetas, investigationAxes } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Target, Users, FileText, CheckCircle2, RefreshCw, Loader2, Database } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDashboardStats } from '@/hooks/useDynamicStats';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function PlanoTrabalho() {
  const queryClient = useQueryClient();
  const { stats, isLoading } = useDashboardStats();

  // Metas com progresso dinâmico
  const metasComProgresso = workPlanMetas.map((meta, index) => ({
    ...meta,
    progresso: isLoading ? meta.progresso : stats.metasProgresso[`meta${index + 1}` as keyof typeof stats.metasProgresso] || meta.progresso,
    status: getStatusFromProgresso(stats.metasProgresso[`meta${index + 1}` as keyof typeof stats.metasProgresso] || 0)
  }));

  function getStatusFromProgresso(progresso: number): 'nao_iniciada' | 'em_andamento' | 'concluida' {
    if (progresso === 0) return 'nao_iniciada';
    if (progresso >= 100) return 'concluida';
    return 'em_andamento';
  }

  const progressoGeral = isLoading ? 0 : stats.progressoGeral;

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    toast.success('Dados atualizados!', { description: 'O progresso foi recalculado com base nos dados do banco.' });
  };

  return (
    <DashboardLayout
      title="Plano de Trabalho"
      subtitle="TED - Elaboração de subsídios para o IV Relatório CERD"
    >
      {/* Overview - Dinâmico */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Metas</p>
                <p className="text-2xl font-bold">{workPlanMetas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={progressoGeral > 50 ? 'border-success/50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progresso Geral</p>
                <p className="text-2xl font-bold">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${progressoGeral}%`}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-info/10 rounded-lg">
                <Calendar className="w-5 h-5 text-info" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prazo Final</p>
                <p className="text-2xl font-bold">Fev/26</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Database className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dados no BD</p>
                <p className="text-lg font-bold">{isLoading ? '...' : `${stats.totalRecomendacoes + stats.totalIndicadores}`}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar - Dinâmico */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Progresso do Projeto (Dinâmico)</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">{progressoGeral}% concluído</span>
              <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <Progress value={progressoGeral} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Janeiro 2026</span>
            <span>Fevereiro 2026</span>
          </div>
          <div className="mt-3 p-2 bg-muted rounded text-xs text-muted-foreground">
            <p>O progresso é calculado automaticamente com base nos dados inseridos no banco:</p>
            <ul className="list-disc list-inside mt-1">
              <li>Meta 1: Lacunas e Respostas CERD III ({stats.metasProgresso.meta1}%)</li>
              <li>Meta 2: Normativas e Institucional ({stats.metasProgresso.meta2}%)</li>
              <li>Meta 3: Indicadores e Orçamento ({stats.metasProgresso.meta3}%)</li>
              <li>Meta 4: Conclusões e Classificação ({stats.metasProgresso.meta4}%)</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Metas - Dinâmicas */}
      <h2 className="text-lg font-semibold text-foreground mb-4">Metas do Plano (Progresso Automático)</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {metasComProgresso.map(meta => (
          <MetaProgressCard key={meta.id} meta={meta} />
        ))}
      </div>

      {/* Quadro de Investigação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Quadro de Investigação
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Baseado nas Observações Finais do CERD (2022) - Ciclo 18º-20º
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {investigationAxes.map(eixo => (
              <AccordionItem key={eixo.id} value={eixo.id}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-primary/10">
                      Eixo {eixo.numero}
                    </Badge>
                    <span className="font-medium">{eixo.nome}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-sm text-muted-foreground mb-4">{eixo.descricao}</p>
                  <div className="space-y-4">
                    {eixo.temas.map(tema => (
                      <div key={tema.id} className="border rounded-lg p-4 bg-muted/30">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-sm">{tema.nome}</h4>
                          <div className="flex gap-1">
                            {tema.paragrafosONU.map(p => (
                              <Badge key={p} variant="secondary" className="text-xs">
                                §{p}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="space-y-2 text-sm">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Questões de Investigação:</p>
                            <ul className="list-disc list-inside text-foreground space-y-1">
                              {tema.questoesInvestigacao.map((q, i) => (
                                <li key={i} className="text-xs">{q}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-1">Fontes de Evidência:</p>
                            <div className="flex flex-wrap gap-1">
                              {tema.fontesEvidencia.map((f, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {f}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

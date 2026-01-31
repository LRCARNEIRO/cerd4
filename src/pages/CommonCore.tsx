import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { commonCoreSections } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { AlertCircle, CheckCircle2, Clock, FileText, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const statusConfig = {
  atualizado: { label: 'Atualizado', icon: CheckCircle2, className: 'text-success bg-success/10' },
  parcial: { label: 'Parcial', icon: Clock, className: 'text-warning bg-warning/10' },
  desatualizado: { label: 'Desatualizado', icon: AlertCircle, className: 'text-destructive bg-destructive/10' }
};

export default function CommonCore() {
  const totalSubsections = commonCoreSections.reduce(
    (acc, s) => acc + s.subsecoes.length, 0
  );
  const atualizadas = commonCoreSections.reduce(
    (acc, s) => acc + s.subsecoes.filter(sub => sub.statusAtualizacao === 'atualizado').length, 0
  );
  const progressoAtualizacao = Math.round((atualizadas / totalSubsections) * 100);

  return (
    <DashboardLayout
      title="Common Core Document"
      subtitle="HRI/CORE/BRA - Atualização 2018-2026"
    >
      {/* Header Info */}
      <Card className="mb-6 bg-primary text-primary-foreground">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold">HRI/CORE/BRA/2020</h2>
              <p className="text-sm text-primary-foreground/80">
                Common core document forming part of the reports of States parties
              </p>
              <p className="text-xs text-primary-foreground/60 mt-1">
                Última versão: 2020 | Período: até 2020 | Necessário atualizar: 2018-2026
              </p>
            </div>
            <Button variant="secondary" size="sm" asChild>
              <a 
                href="https://tbinternet.ohchr.org/_layouts/15/treatybodyexternal/Download.aspx?symbolno=HRI%2FCORE%2FBRA%2F2020&Lang=en" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Ver Documento Original
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progresso da Atualização</span>
              <span className="text-sm text-muted-foreground">{progressoAtualizacao}%</span>
            </div>
            <Progress value={progressoAtualizacao} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <FileText className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Seções</p>
              <p className="text-xl font-bold">{commonCoreSections.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-warning" />
            <div>
              <p className="text-sm text-muted-foreground">Pendentes</p>
              <p className="text-xl font-bold">{totalSubsections - atualizadas}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sections */}
      <Card>
        <CardHeader>
          <CardTitle>Estrutura do Documento</CardTitle>
          <p className="text-sm text-muted-foreground">
            Seções do Common Core com status de atualização
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {commonCoreSections.map(section => {
              const status = statusConfig[section.statusAtualizacao];
              const StatusIcon = status.icon;
              
              return (
                <AccordionItem key={section.id} value={section.id}>
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge variant="outline" className="font-mono">
                        {section.numero}
                      </Badge>
                      <span className="font-medium flex-1 text-left">{section.titulo}</span>
                      <Badge className={cn('gap-1', status.className)}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                      </Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      <span className="font-medium">Inglês:</span> {section.tituloIngles}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Período atual: {section.periodoCobertura} | Versão: {section.ultimaVersao}
                    </p>
                    
                    <div className="space-y-3">
                      {section.subsecoes.map(sub => {
                        const subStatus = statusConfig[sub.statusAtualizacao];
                        const SubStatusIcon = subStatus.icon;
                        
                        return (
                          <div key={sub.id} className="border rounded-lg p-4 bg-muted/30">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="font-mono text-xs">
                                  {sub.numero}
                                </Badge>
                                <h4 className="font-medium text-sm">{sub.titulo}</h4>
                              </div>
                              <Badge variant="outline" className={cn('gap-1 text-xs', subStatus.className)}>
                                <SubStatusIcon className="w-3 h-3" />
                                {subStatus.label}
                              </Badge>
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-3">
                              {sub.conteudoAtual}
                            </p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div>
                                <p className="text-xs font-medium text-foreground mb-1">
                                  Indicadores Necessários:
                                </p>
                                <ul className="space-y-0.5">
                                  {sub.indicadoresNecessarios.map((ind, i) => (
                                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                                      <span className="text-primary">•</span>
                                      {ind}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-foreground mb-1">
                                  Fontes Necessárias:
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {sub.fontesNecessarias.map((fonte, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">
                                      {fonte}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            {sub.notas && (
                              <div className="mt-3 p-2 bg-warning/10 border border-warning/30 rounded text-xs">
                                <span className="font-medium text-warning">Nota:</span>{' '}
                                <span className="text-foreground">{sub.notas}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}

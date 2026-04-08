import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Map, ArrowRight, BarChart3, Scale, TrendingUp, FileText,
  ClipboardCheck, Layers, Eye, Target, BookOpen, CheckCircle2
} from 'lucide-react';

export function SystemGuidePanel() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Map className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Guia de Navegação do Sistema
            </h2>
            <p className="text-sm text-muted-foreground">
              Como as abas se conectam e retroalimentam para garantir coerência analítica
            </p>
          </div>
        </div>

        {/* Visual Flow Diagram */}
        <div className="relative mb-6">
          {/* Main flow */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <FlowCard
              step={1}
              icon={<ClipboardCheck className="w-5 h-5" />}
              title="Base de Evidências"
              subtitle="Acompanhamento Gerencial → Recomendações"
              description="Ponto de partida: as 43 recomendações ONU com evidências vinculadas (indicadores, orçamento e normativos). Edições manuais aqui propagam automaticamente."
              color="primary"
            />
            {/* Arrow */}
            <div className="hidden md:flex items-center justify-center absolute left-[33%] top-1/2 -translate-y-1/2 z-10">
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
            {/* Step 2 */}
            <FlowCard
              step={2}
              icon={<Layers className="w-5 h-5" />}
              title="Análises Derivadas"
              subtitle="Alimentadas automaticamente"
              description="Artigos (aderência ICERD), Evolução Recomendações (impacto real), Evolução Artigos (tendência) e Diagnóstico de Lacunas recebem os mesmos dados."
              color="secondary"
            />
            <div className="hidden md:flex items-center justify-center absolute left-[66%] top-1/2 -translate-y-1/2 z-10">
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>
            {/* Step 3 */}
            <FlowCard
              step={3}
              icon={<Eye className="w-5 h-5" />}
              title="Painel Geral"
              subtitle="Espelho consolidado"
              description="Este painel reflete os resultados finais: Esforço (status), Impacto (evolução) e Lente dos Artigos (aderência + evolução por artigo)."
              color="accent"
            />
          </div>
        </div>

        {/* Detailed accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="flow" className="border-border/50">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Fluxo Detalhado: O que encontrar em cada aba
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 text-sm">
                <DetailRow
                  icon={<ClipboardCheck className="w-4 h-4 text-primary" />}
                  title="Recomendações (Acompanhamento Gerencial)"
                  items={[
                    "43 recomendações ONU com score de esforço (0-100)",
                    "Evidências vinculadas: indicadores, ações orçamentárias, normativos",
                    "Edição manual (incluir/excluir) → recálculo instantâneo em todo o sistema",
                    "Status: Cumprido (≥65), Parcial (≥35), Não Cumprido (<35)"
                  ]}
                />
                <DetailRow
                  icon={<Scale className="w-4 h-4 text-primary" />}
                  title="Artigos ICERD (Acompanhamento Gerencial)"
                  items={[
                    "Consolida recomendações por artigo da Convenção",
                    "Score de Aderência = Rec. 50% + Normativos 15% + Orçamento 10% + Indicadores 15% + Amplitude 10%",
                    "Mesmas evidências de Recomendações, filtradas por artigo",
                    "Pop-up de auditagem ao clicar em cada tag de evidência"
                  ]}
                />
                <DetailRow
                  icon={<TrendingUp className="w-4 h-4 text-emerald-500" />}
                  title="Evolução Recomendações (Produtos → Conclusões)"
                  items={[
                    "Avalia se o esforço gerou resultado no período 2018-2025",
                    "Pesos: Indicadores 50% (variação positiva) + Orçamento 30% (R$ liquidado) + Normativos 20%",
                    "Classifica: Evolução (≥60), Estagnação (35-59), Retrocesso (<35)",
                    "Base de evidências idêntica à de Recomendações"
                  ]}
                />
                <DetailRow
                  icon={<BarChart3 className="w-4 h-4 text-blue-500" />}
                  title="Evolução Artigos (Produtos → Conclusões)"
                  items={[
                    "Avalia impacto por artigo: Orçamento 35% + Normativos 35% + Indicadores 30%",
                    "Orçamento por faixas de valor liquidado; Normativos por estoque; Indicadores por tendência",
                    "Complementa a Aderência com a dimensão de resultado efetivo"
                  ]}
                />
                <DetailRow
                  icon={<BookOpen className="w-4 h-4 text-amber-500" />}
                  title="Diagnóstico de Lacunas (Produtos → Conclusões)"
                  items={[
                    "Mesma base de Recomendações, com visualização focada nas lacunas remanescentes",
                    "Resposta sugerida textual que amarra as evidências encontradas",
                    "Atualiza automaticamente ao editar evidências em Recomendações"
                  ]}
                />
                <DetailRow
                  icon={<Eye className="w-4 h-4 text-muted-foreground" />}
                  title="Painel Geral (este painel)"
                  items={[
                    "Esforço Governamental ← status consolidado de Recomendações",
                    "Impacto Real ← resultado consolidado de Evolução Recomendações",
                    "Lente dos Artigos: Esforço% ← Aderência ICERD | Evolução% ← Evolução Artigos",
                    "Nenhum cálculo próprio — espelho puro dos motores analíticos"
                  ]}
                />
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="methodology" className="border-border/50">
            <AccordionTrigger className="text-sm font-semibold py-3 hover:no-underline">
              <span className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                Princípio de Retroalimentação Automática
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>
                  O sistema opera sob o princípio de <strong>Single Source of Truth</strong>: 
                  toda evidência cadastrada ou editada na aba <em>Recomendações</em> propaga 
                  automaticamente para todas as abas dependentes via invalidação de cache (React Query).
                </p>
                <p>
                  <strong>Na prática:</strong> ao incluir ou excluir um indicador, ação orçamentária 
                  ou normativo no pop-up de auditagem de uma recomendação, os seguintes painéis 
                  recalculam instantaneamente:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Score e status de cada recomendação</li>
                  <li>Aderência por artigo ICERD</li>
                  <li>Score de evolução por recomendação e por artigo</li>
                  <li>Diagnóstico de lacunas remanescentes</li>
                  <li>Gráficos e badges deste Painel Geral</li>
                </ul>
                <p className="text-xs text-primary/70 mt-2">
                  <CheckCircle2 className="w-3 h-3 inline mr-1" />
                  Nenhuma intervenção manual adicional é necessária — a sinergia é automática.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}

function FlowCard({
  step,
  icon,
  title,
  subtitle,
  description,
  color,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  color: string;
}) {
  return (
    <div className="relative p-4 rounded-lg border border-border/50 bg-card hover:border-primary/30 transition-colors">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="text-xs font-bold px-2 py-0.5">
          {step}
        </Badge>
        <span className="text-primary">{icon}</span>
      </div>
      <h3 className="font-semibold text-sm text-foreground">{title}</h3>
      <p className="text-xs text-primary/70 mb-1">{subtitle}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}

function DetailRow({
  icon,
  title,
  items,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
}) {
  return (
    <div className="p-3 rounded-md bg-muted/30 border border-border/30">
      <div className="flex items-center gap-2 mb-1.5">
        {icon}
        <span className="font-medium text-foreground">{title}</span>
      </div>
      <ul className="list-disc pl-7 text-muted-foreground space-y-0.5">
        {items.map((item, i) => (
          <li key={i} className="text-xs leading-relaxed">{item}</li>
        ))}
      </ul>
    </div>
  );
}

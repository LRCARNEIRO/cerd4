import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowDown, Database, Layers, Link2, Gauge, Scale, FileText,
  BookOpen, ShieldCheck, BarChart3,
} from 'lucide-react';

/** Etapas do fluxo lógico apresentado no Sumário Executivo. */
const ETAPAS = [
  { label: 'Fontes públicas e oficiais', icon: Database },
  { label: '3 bases canônicas', icon: Layers },
  { label: 'Vínculo evidência × recomendação', icon: Link2 },
  { label: 'Esforço / Realização / Impacto Evidenciado', icon: Gauge },
  { label: 'Agregação por artigos ICERD', icon: Scale },
  { label: 'Subsídio à redação do IV Relatório do Brasil ao CERD', icon: FileText },
];

function Etapa({ etapa, numero, mostrarConector }: {
  etapa: (typeof ETAPAS)[number];
  numero: number;
  mostrarConector: boolean;
}) {
  const Icon = etapa.icon;
  return (
    <li>
      <div className="flex items-center gap-3 p-2.5 rounded-md border border-border/70 bg-muted/30">
        <Badge variant="outline" className="text-[10px] font-bold px-1.5 py-0 shrink-0">{numero}</Badge>
        <Icon className="w-4 h-4 text-primary shrink-0" />
        <p className="text-[11px] font-semibold uppercase tracking-wide text-foreground leading-snug">
          {etapa.label}
        </p>
      </div>
      {mostrarConector && (
        <div className="flex justify-center text-muted-foreground py-0.5" aria-hidden>
          <ArrowDown className="w-4 h-4" />
        </div>
      )}
    </li>
  );
}

/**
 * Resumo rápido da dinâmica metodológica integrada ao sistema.
 * Exibido apenas na versão produto (/entrega), logo após a visão integrada do Painel Geral.
 */
export function EntregaResumoMetodologico() {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="pt-6 pb-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10 shrink-0">
            <BookOpen className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground leading-snug">
              Resumo rápido — dinâmica metodológica integrada ao sistema
            </h2>
          </div>
        </div>

        {/* Arquitetura */}
        <p className="text-sm text-foreground/90 leading-relaxed">
          A arquitetura do sistema é <strong>sequencial e cumulativa</strong>: fontes oficiais e públicas
          alimentam três bases canônicas; cada registro é descrito em ficha padronizada; cada evidência é
          testada materialmente frente às recomendações do CERD selecionadas para serem nosso objeto de
          estudo; os vínculos aprovados formam a camada relacional; por fim, as recomendações recebem medidas
          sintéticas de <strong>Esforço</strong> e <strong>Impacto Evidenciado</strong>, posteriormente
          agregadas por artigos da ICERD.
        </p>

        {/* Fluxo lógico */}
        <div className="mt-5 p-4 rounded-lg border border-border/60 bg-card">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-3">
            <h3 className="text-sm font-semibold text-foreground">Fluxo lógico do sistema</h3>
            <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
              Sumário Executivo
            </Badge>
          </div>
          <ol className="flex flex-col">
            {ETAPAS.map((etapa, i) => (
              <Etapa
                key={etapa.label}
                etapa={etapa}
                numero={i + 1}
                mostrarConector={i < ETAPAS.length - 1}
              />
            ))}
          </ol>
        </div>

        {/* Camadas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <div className="p-4 rounded-lg border border-border/60 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">As três bases: camada de entrada</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              As três bases independentes — <strong>Estatística</strong>, <strong>Orçamentária</strong> e{' '}
              <strong>Normativa</strong> — funcionam como camada de entrada. Essas bases não produzem,
              isoladamente, um juízo de cumprimento. O significado analítico surge quando uma evidência é
              vinculada a uma recomendação específica.
            </p>
          </div>
          <div className="p-4 rounded-lg border border-border/60 bg-card">
            <div className="flex items-center gap-2 mb-2">
              <Link2 className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">As recomendações: núcleo lógico</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              As recomendações, portanto, constituem o <strong>núcleo lógico do sistema</strong>; os artigos da
              ICERD organizam as recomendações segundo a obrigação convencional correspondente. As{' '}
              <strong>42 recomendações selecionadas</strong> são as unidades monitoradas: demandas e parâmetros
              de acompanhamento identificados no conjunto de documentos do Comitê para a Eliminação da
              Discriminação Racial e na agenda de Durban.
            </p>
          </div>
        </div>

        {/* Os dois índices */}
        <div className="mt-5">
          <h3 className="text-sm font-semibold text-foreground mb-1">Os dois índices: leitura conceitual</h3>
          <p className="text-[11px] text-muted-foreground mb-3">
            O que cada medida pretende dizer antes de qualquer cálculo.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-primary/25 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                </div>
                <span className="text-sm font-semibold text-foreground">Esforço</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Identifica quanto o governo, ao menos, realizou o <strong>esforço de medir</strong> determinado
                objeto, tornando-o estatisticamente visível e passível de acompanhamento.
              </p>
            </div>
            <div className="p-4 rounded-lg border border-success/25 bg-success/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-md bg-success/10">
                  <BarChart3 className="w-4 h-4 text-success" />
                </div>
                <span className="text-sm font-semibold text-foreground">Impacto</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Permite verificar, entre os objetos para os quais existe <strong>informação temporal
                comparável</strong>, o que efetivamente ocorreu com o fenômeno medido ao longo do período: se
                houve melhora, piora ou estabilidade.
              </p>
            </div>
          </div>
        </div>

        {/* Lentes */}
        <div className="mt-5 p-4 rounded-lg border border-border/60 bg-muted/20">
          <p className="text-sm text-foreground/90 leading-relaxed">
            A lente <strong>Esforço Governamental</strong> mede a intensidade da resposta estatal documentada
            nas três bases. A lente <strong>Impacto Evidenciado</strong> mede quanto desse esforço encontra
            correspondência em resultados não desfavoráveis, execução financeira e institucionalização
            normativa.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, BookOpen, Calculator, Layers, FileCheck, Scale } from 'lucide-react';
import { SectionHeader } from './BaseEvidenciasSection';
import { TETOS_ESFORCO, CORTE_INTERMEDIARIO, CORTE_ALTO } from '@/utils/esforcoImpacto';

const PROTOCOLS = [
  {
    icon: Calculator,
    title: 'Esforço Governamental (0–100)',
    description: `Mede o volume de evidências distintas vinculadas a cada recomendação, com tetos de saturação derivados do percentil 75 da matriz auditada: ${TETOS_ESFORCO.estatistica} estatística, ${TETOS_ESFORCO.orcamentaria} orçamentária e ${TETOS_ESFORCO.normativa} normativa, com peso igual de 1/3 por base.`,
    sources: ['Base Estatística', 'Base Orçamentária', 'Base Normativa'],
  },
  {
    icon: Scale,
    title: 'Impacto Evidenciado (0–100)',
    description: 'Impacto = Esforço × Realização ÷ 100. A Realização é a média das três bases: estatística (proporção de evidências com evolução não desfavorável), orçamentária (Liquidado ÷ Dotação autorizada válida) e normativa (presença = 100, ausência = 0).',
    sources: ['Tendência padronizada', 'Execução orçamentária', 'Presença normativa'],
  },
  {
    icon: Layers,
    title: `Faixas de Classificação (Baixo · Intermediário · Alto)`,
    description: `As mesmas faixas se aplicam ao Esforço e ao Impacto: Baixo abaixo de ${CORTE_INTERMEDIARIO}, Intermediário de ${CORTE_INTERMEDIARIO} a ${CORTE_ALTO - 0.1} e Alto a partir de ${CORTE_ALTO}. Por artigo, ambos são a média simples das recomendações associadas, incluindo as sem evidência.`,
    sources: ['CERD/C/BRA/CO/18-20', 'Matriz auditada'],
  },
  {
    icon: FileCheck,
    title: 'Matriz Auditada de Evidências',
    description: 'Todos os vínculos Artigo × Recomendação × Evidência são curados manualmente a partir do inventário canônico das três bases. Não há inferência automática por palavras-chave; evidências repetidas para a mesma recomendação em artigos diferentes contam uma única vez.',
    sources: ['Inventário canônico', 'Curadoria manual'],
  },
];
export default function ProtocoloMetodologicoSection() {
  return (
    <section id="protocolo-metodologico" className="py-14 bg-muted/30">
      <div className="max-w-7xl mx-auto px-6">
        <SectionHeader
          number="04"
          title="Protocolo Metodológico Digital"
          subtitle="Documentação das fórmulas, fontes de dados e limitações técnicas de cada métrica utilizada na plataforma"
        />

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROTOCOLS.map((p) => {
            const Icon = p.icon;
            return (
              <Card key={p.title} className="border-border/60">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded bg-primary/8 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-foreground">{p.title}</h3>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {p.sources.map((s) => (
                          <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0 font-normal">
                            {s}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-5">
          <Button variant="outline" size="sm" className="text-xs" asChild>
            <Link to="/conclusoes">
              <BookOpen className="w-3.5 h-3.5 mr-1.5" />
              Ver Detalhamento Metodológico Completo
              <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

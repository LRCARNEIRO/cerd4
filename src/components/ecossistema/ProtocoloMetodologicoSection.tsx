import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, BookOpen, Calculator, Layers, FileCheck, Scale } from 'lucide-react';
import { SectionHeader } from './BaseEvidenciasSection';

const PROTOCOLS = [
  {
    icon: Calculator,
    title: 'Score de Esforço Governamental',
    description: 'Cada recomendação recebe um score 0-100 composto por 3 dimensões de evidências: Indicadores (40%), Orçamento (30%) e Normativos (30%). O status final (Cumprido ≥80, Parcial ≥55, Em Andamento ≥35, Não Cumprido ≥15) reflete a quantidade e qualidade das evidências vinculadas.',
    sources: ['Base Estatística', 'Base Orçamentária', 'Base Normativa'],
  },
  {
    icon: Scale,
    title: 'Score de Aderência ICERD',
    description: 'Avaliação multidimensional em 7 eixos: Recomendações ONU (20%), Cobertura Normativa (20%), Respostas CERD III (15%), Orçamento (15%), Conclusões Analíticas (15%), Amplitude de Evidências (10%), Séries Estatísticas (5%).',
    sources: ['IcerdAdherencePanel', '7 dimensões integradas'],
  },
  {
    icon: Layers,
    title: 'Classificação de Lacunas e Status',
    description: 'Política de conformidade equilibrada: reclassificação baseada em ações legislativas, cobertura orçamentária e evidências documentais. Esforços normativos são reconhecidos como "Em Andamento".',
    sources: ['CERD/C/BRA/CO/18-20', 'Base Normativa'],
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

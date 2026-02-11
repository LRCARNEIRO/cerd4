import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ExternalLink, Globe, FileText, Landmark } from 'lucide-react';

interface DurbanSection {
  id: string;
  titulo: string;
  tipo: 'declaracao' | 'plano';
  icon: React.ElementType;
  paragrafos: { num: string; texto: string }[];
}

const durbanSections: DurbanSection[] = [
  {
    id: 'declaracao',
    titulo: 'Declaração de Durban (2002)',
    tipo: 'declaracao',
    icon: Landmark,
    paragrafos: [
      {
        num: '114',
        texto: 'Reconhecemos o papel primordial dos parlamentos no combate ao racismo, discriminação racial, xenofobia e intolerâncias correlatas, por meio de legislação apropriada, supervisão de sua implementação e alocação dos recursos financeiros necessários.'
      },
    ]
  },
  {
    id: 'plano-acao',
    titulo: 'Plano de Ação de Durban (2002)',
    tipo: 'plano',
    icon: FileText,
    paragrafos: [
      {
        num: '90',
        texto: 'Insta os Estados a estabelecer, fortalecer e revisar instituições nacionais independentes de direitos humanos, particularmente sobre racismo e discriminação racial, em conformidade com os Princípios de Paris (Resolução 48/134), dotando-as de recursos financeiros adequados e capacidade de investigação, pesquisa, educação e conscientização pública.'
      },
      {
        num: '117',
        texto: 'Insta os Estados a comprometer recursos financeiros para educação antirracista e campanhas de mídia que promovam aceitação, tolerância, diversidade e respeito pelas culturas de todos os povos indígenas. Os Estados devem promover compreensão precisa das histórias e culturas dos povos indígenas.'
      },
    ]
  },
];

const cruzamentoDurbanEixos = [
  {
    eixo: 'Legislação e Justiça',
    temas: [
      'Criminalização efetiva de todas as formas de discriminação racial (Plano §90)',
      'Implementação doméstica da Convenção (CERD §7-8)',
      'Acesso à justiça para vítimas de discriminação racial (CERD §11-12)',
    ]
  },
  {
    eixo: 'Políticas Institucionais',
    temas: [
      'Instituições nacionais independentes de DDHH (Plano §90, CERD §9-10)',
      'Programa Federal de Ações Afirmativas (Decreto 11.785/2023)',
      'Ministério da Igualdade Racial como ator estratégico',
    ]
  },
  {
    eixo: 'Segurança Pública',
    temas: [
      'Desmilitarização da atividade policial (CERD §36a)',
      'Câmeras corporais em policiais (CERD §34)',
      'Combate ao perfilamento racial (RG 31 §20, RG 36 §35)',
    ]
  },
  {
    eixo: 'Saúde',
    temas: [
      'Impacto racial da COVID-19 (CERD §15-17)',
      'Saúde reprodutiva e mortalidade materna (RG 37 §44)',
      'Saúde mental de comunidades em luto (CERD §16f)',
    ]
  },
  {
    eixo: 'Educação',
    temas: [
      'Cotas e ações afirmativas no ensino superior (CERD §18-19)',
      'Educação antirracista e diversidade curricular (Plano §117, RG 34 §28)',
      'Revisão de materiais didáticos estereotipados (RG 34 §61)',
    ]
  },
  {
    eixo: 'Terra e Território',
    temas: [
      'Demarcação de terras indígenas e quilombolas (CERD §51-53)',
      'Tese do Marco Temporal e seus desdobramentos',
      'Genocídio Yanomami e violência em territórios (CERD §49a)',
    ]
  },
  {
    eixo: 'Trabalho e Renda',
    temas: [
      'Insegurança alimentar e pobreza extrema (CERD §20-23)',
      'Discriminação no mercado de trabalho (RG 34 §53, 58)',
      'Trabalho decente para trabalhadores indígenas migrantes (RG 38 §57)',
    ]
  },
  {
    eixo: 'Cultura e Patrimônio',
    temas: [
      'Perseguição a religiões de matriz africana (CERD §43-44)',
      'Preservação da identidade cultural afrodescendente (RG 34 §4b)',
      'Dias de memória e comissões de verdade (RG 35 §35)',
    ]
  },
];

export function DurbanTab() {
  return (
    <div className="space-y-6">
      {/* Declaração e Plano de Ação */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            Declaração e Plano de Ação de Durban (2002)
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Marco fundamental da luta internacional contra o racismo. O CERD recomenda expressamente ao Brasil (§64) 
            que implemente a Declaração e o Programa de Ação de Durban, conforme a Recomendação Geral nº 33 (2009).
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="space-y-2">
            {durbanSections.map((section) => {
              const Icon = section.icon;
              return (
                <AccordionItem key={section.id} value={section.id} className="border rounded-lg px-4">
                  <AccordionTrigger className="hover:no-underline py-3">
                    <div className="flex items-center gap-3 text-left">
                      <Icon className="w-5 h-5 text-primary" />
                      <div>
                        <h3 className="font-medium text-sm">{section.titulo}</h3>
                        <p className="text-xs text-muted-foreground">
                          {section.paragrafos.length} parágrafo(s) de referência
                        </p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-2 pb-2">
                      {section.paragrafos.map((p) => (
                        <div key={p.num} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                          <span className="text-xs font-mono font-bold text-primary whitespace-nowrap mt-0.5">§{p.num}</span>
                          <p className="text-sm text-foreground">{p.texto}</p>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>

          <a
            href="/documentos/Durban-Declaration-Action-Plan-2002.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-4"
          >
            <ExternalLink className="w-3 h-3" />
            Baixar texto completo da Declaração e Plano de Ação de Durban
          </a>
        </CardContent>
      </Card>

      {/* Cruzamento Durban × Eixos Temáticos */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Cruzamento: Durban × RGs × Observações Finais</CardTitle>
          <p className="text-sm text-muted-foreground">
            Mapeamento dos temas da agenda de Durban com as Recomendações Gerais e as Observações Finais 
            ao Brasil (CERD/C/BRA/CO/18-20), organizado por eixo temático.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cruzamentoDurbanEixos.map((item) => (
              <div key={item.eixo} className="p-4 bg-muted/30 rounded-lg border">
                <Badge className="mb-3">{item.eixo}</Badge>
                <ul className="space-y-2">
                  {item.temas.map((tema, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-2">
                      <span className="text-primary font-bold mt-0.5">›</span>
                      {tema}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

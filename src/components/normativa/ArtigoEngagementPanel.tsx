import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { CheckCircle2, AlertTriangle, MinusCircle, FileText } from 'lucide-react';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';

interface DocRow {
  id: string;
  titulo: string;
  categoria: string;
  status: string;
  secoes_impactadas?: string[] | null;
  recomendacoes_impactadas?: string[] | null;
  metas_impactadas?: string[] | null;
  resumo_impacto?: any;
}

interface ArtigoEngagementProps {
  documentos: DocRow[];
}

/** Metas de cobertura mínima por artigo (nº de docs esperados) */
const META_COBERTURA: Record<ArtigoConvencao, number> = {
  I: 4,
  II: 8,
  III: 5,
  IV: 5,
  V: 15,
  VI: 6,
  VII: 6,
};

/** Temas-chave que o Estado brasileiro deve demonstrar engajamento por artigo */
const COMPROMISSOS_ARTIGO: Record<ArtigoConvencao, string[]> = {
  I: [
    'Definição ampla de discriminação racial na legislação interna',
    'Reconhecimento de discriminação indireta e estrutural',
    'Inclusão de interseccionalidades (gênero, classe, deficiência)',
    'Coleta de dados desagregados por raça/cor/etnia',
  ],
  II: [
    'Revisão e fortalecimento de legislação antidiscriminatória',
    'Estrutura institucional de promoção da igualdade racial (MIR)',
    'Ações afirmativas no ensino superior e serviço público',
    'Políticas transversais de enfrentamento ao racismo',
    'Mecanismos de monitoramento e avaliação',
    'Orçamento dedicado a políticas de igualdade racial',
  ],
  III: [
    'Combate à segregação espacial/territorial',
    'Regularização de territórios quilombolas',
    'Políticas habitacionais para comunidades negras e indígenas',
    'Enfrentamento do racismo ambiental',
  ],
  IV: [
    'Tipificação e punição de discurso de ódio racial',
    'Combate à propaganda racista na internet',
    'Criminalização de organizações racistas',
    'Capacitação do judiciário para crimes de ódio',
  ],
  V: [
    'Redução da letalidade policial contra jovens negros',
    'Equidade no acesso à saúde (Política Nacional de Saúde da Pop. Negra)',
    'Implementação da Lei 10.639/2003 (história afro-brasileira)',
    'Igualdade no mercado de trabalho e renda',
    'Direitos políticos e participação social da pop. negra',
    'Segurança alimentar em comunidades vulneráveis',
    'Proteção de defensores de direitos humanos',
  ],
  VI: [
    'Acesso ampliado às defensorias públicas',
    'Equiparação de injúria racial a crime de racismo',
    'Mecanismos de reparação para vítimas de discriminação',
    'Inspeções em unidades judiciárias',
    'Combate ao racismo institucional no sistema de justiça',
  ],
  VII: [
    'Implementação efetiva da Lei 10.639/2003',
    'Formação docente em educação antirracista',
    'Promoção da cultura afro-brasileira e indígena',
    'Programas de educação em direitos humanos',
    'Combate ao racismo na mídia e informação',
  ],
};

function getDocArtigos(doc: DocRow): ArtigoConvencao[] {
  const eixos: string[] = doc.secoes_impactadas || [];
  const artigos = new Set<ArtigoConvencao>();
  eixos.forEach(eixo => {
    const mapped = EIXO_PARA_ARTIGOS[eixo as keyof typeof EIXO_PARA_ARTIGOS];
    if (mapped) mapped.forEach(a => artigos.add(a));
  });
  return [...artigos];
}

function getEngagementLevel(count: number, meta: number): { label: string; color: string; icon: typeof CheckCircle2 } {
  const ratio = count / meta;
  if (ratio >= 0.8) return { label: 'Cobertura substancial', color: 'text-green-600', icon: CheckCircle2 };
  if (ratio >= 0.4) return { label: 'Cobertura parcial', color: 'text-amber-600', icon: AlertTriangle };
  return { label: 'Cobertura insuficiente', color: 'text-destructive', icon: MinusCircle };
}

export function ArtigoEngagementPanel({ documentos }: ArtigoEngagementProps) {
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">
          Engajamento do Estado Brasileiro por Artigo ICERD (I-VII)
        </CardTitle>
        <CardDescription>
          Documentos normativos agrupados por compromisso da Convenção — resultados parciais e atualizáveis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" defaultValue={['V', 'II']} className="space-y-2">
          {ARTIGOS_CONVENCAO.map(artigo => {
            const docsArtigo = documentos.filter(d => getDocArtigos(d).includes(artigo.numero));
            const meta = META_COBERTURA[artigo.numero];
            const engagement = getEngagementLevel(docsArtigo.length, meta);
            const EngIcon = engagement.icon;
            const progressPct = Math.min(100, Math.round((docsArtigo.length / meta) * 100));
            const compromissos = COMPROMISSOS_ARTIGO[artigo.numero];

            // Match docs to compromissos heuristically
            const compromissoStatus = compromissos.map(comp => {
              const matched = docsArtigo.filter(d =>
                d.titulo.toLowerCase().includes(comp.substring(0, 15).toLowerCase()) ||
                d.recomendacoes_impactadas?.some(r => r.toLowerCase().includes(comp.substring(0, 12).toLowerCase()))
              );
              return { compromisso: comp, docs: matched, coberto: matched.length > 0 || docsArtigo.length >= meta };
            });

            return (
              <AccordionItem key={artigo.numero} value={artigo.numero} className="border rounded-lg px-1">
                <AccordionTrigger className="text-sm py-3 hover:no-underline">
                  <div className="flex items-center gap-3 flex-1 min-w-0 pr-2">
                    <Badge
                      variant="outline"
                      className="shrink-0 font-bold text-xs px-2"
                      style={{ borderColor: artigo.cor, color: artigo.cor }}
                    >
                      Art. {artigo.numero}
                    </Badge>
                    <div className="flex-1 min-w-0 text-left">
                      <span className="font-semibold truncate block">{artigo.titulo}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <EngIcon className={`w-4 h-4 ${engagement.color}`} />
                      <span className={`text-xs font-medium ${engagement.color}`}>
                        {docsArtigo.length}/{meta}
                      </span>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-4 space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{engagement.label}</span>
                      <span>{progressPct}%</span>
                    </div>
                    <Progress value={progressPct} className="h-2" />
                  </div>

                  {/* Compromissos checklist */}
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Compromissos-chave
                    </p>
                    {compromissoStatus.map(({ compromisso, coberto }, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        {coberto ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                        ) : (
                          <MinusCircle className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        )}
                        <span className={coberto ? 'text-foreground' : 'text-muted-foreground'}>{compromisso}</span>
                      </div>
                    ))}
                  </div>

                  {/* Sampled documents */}
                  {docsArtigo.length > 0 ? (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        Documentos vinculados ({docsArtigo.length})
                      </p>
                      <div className="space-y-1">
                        {docsArtigo.map(doc => (
                          <div key={doc.id} className="flex items-start gap-2 p-2 rounded-md bg-muted/50 text-xs">
                            <FileText className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{doc.titulo}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                  {doc.categoria}
                                </Badge>
                                {doc.recomendacoes_impactadas?.slice(0, 2).map(r => (
                                  <Badge key={r} variant="outline" className="text-[9px] px-1 py-0">
                                    {r.split(' - ')[0]}
                                  </Badge>
                                ))}
                                {(doc.recomendacoes_impactadas?.length || 0) > 2 && (
                                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                                    +{(doc.recomendacoes_impactadas?.length || 0) - 2}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-3">
                      <p className="text-xs text-muted-foreground">
                        Nenhum documento normativo vinculado a este artigo ainda.
                      </p>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}

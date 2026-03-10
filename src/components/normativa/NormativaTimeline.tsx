import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Scale, Building2, FileCheck, FileText, BookOpen, ExternalLink,
  TrendingUp, TrendingDown, Minus, Star, Calendar, ChevronDown, ChevronUp,
} from 'lucide-react';
import { format, parseISO, getYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ArtigoConvencao } from '@/utils/artigosConvencao';

const categoriaConfig: Record<string, { label: string; icon: typeof Scale; dotColor: string; bgColor: string }> = {
  legislacao: { label: 'Legislação', icon: Scale, dotColor: 'bg-blue-500', bgColor: 'bg-blue-500/10 border-blue-200 text-blue-800' },
  institucional: { label: 'Institucional', icon: Building2, dotColor: 'bg-emerald-500', bgColor: 'bg-emerald-500/10 border-emerald-200 text-emerald-800' },
  politicas: { label: 'Políticas Públicas', icon: FileCheck, dotColor: 'bg-violet-500', bgColor: 'bg-violet-500/10 border-violet-200 text-violet-800' },
  jurisprudencia: { label: 'Jurisprudência', icon: BookOpen, dotColor: 'bg-amber-500', bgColor: 'bg-amber-500/10 border-amber-200 text-amber-800' },
};

/** Detect highlight-worthy docs based on title keywords */
function isHighlight(titulo: string): boolean {
  const keywords = [
    'constituição', 'constituicao', 'lei nº', 'decreto nº', 'adpf',
    'ministério', 'ministerio', 'programa nacional', 'plano nacional',
    'convenção', 'convencao', 'injúria racial', 'injuria racial',
    'ações afirmativas', 'acoes afirmativas', 'igualdade racial',
    'demarcação', 'demarcacao', 'quilombola', 'indígena', 'indigena',
  ];
  const t = titulo.toLowerCase();
  return keywords.some(k => t.includes(k));
}

/** Assign a trend direction based on document category & context */
function getTrend(doc: any): 'avanço' | 'retrocesso' | 'manutenção' {
  const t = doc.titulo.toLowerCase();
  if (t.match(/revoga|extingue|suspende|reduz|desmonte|retrocesso/)) return 'retrocesso';
  if (t.match(/cria|institui|estabelece|amplia|fortalece|recria|relança|reestabelece|programa|plano/)) return 'avanço';
  return 'manutenção';
}

const trendConfig = {
  'avanço': { icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200', label: 'Avanço' },
  'retrocesso': { icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50 border-red-200', label: 'Retrocesso' },
  'manutenção': { icon: Minus, color: 'text-muted-foreground', bg: 'bg-muted/50 border-muted', label: 'Manutenção' },
};

/** Extract a date from the document — prefer title-embedded dates, fallback to created_at */
function extractDate(doc: any): Date {
  // Try to parse year from title like "2024", "2023", etc.
  const yearMatch = doc.titulo.match(/\b(20[12]\d)\b/);
  if (yearMatch) {
    return new Date(parseInt(yearMatch[1]), 5, 15); // mid-year approximation
  }
  return parseISO(doc.created_at);
}

interface NormativaTimelineProps {
  documentos: any[];
}

export function NormativaTimeline({ documentos }: NormativaTimelineProps) {
  const [expandedYears, setExpandedYears] = useState<Set<number>>(new Set());
  const [showAll, setShowAll] = useState(false);

  const timelineData = useMemo(() => {
    // Group by year
    const byYear: Record<number, { doc: any; date: Date; trend: string; highlight: boolean }[]> = {};

    documentos.forEach(doc => {
      const date = extractDate(doc);
      const year = getYear(date);
      const trend = getTrend(doc);
      const highlight = isHighlight(doc.titulo);

      if (!byYear[year]) byYear[year] = [];
      byYear[year].push({ doc, date, trend, highlight });
    });

    // Sort years descending, items within year by date
    const years = Object.keys(byYear)
      .map(Number)
      .sort((a, b) => b - a);

    years.forEach(y => {
      byYear[y].sort((a, b) => b.date.getTime() - a.date.getTime());
    });

    return { byYear, years };
  }, [documentos]);

  // Summary stats
  const totalAvancos = documentos.filter(d => getTrend(d) === 'avanço').length;
  const totalRetrocessos = documentos.filter(d => getTrend(d) === 'retrocesso').length;
  const totalDestaque = documentos.filter(d => isHighlight(d.titulo)).length;
  const yearsSpan = timelineData.years.length > 0
    ? `${timelineData.years[timelineData.years.length - 1]}–${timelineData.years[0]}`
    : '';

  const toggleYear = (year: number) => {
    setExpandedYears(prev => {
      const next = new Set(prev);
      if (next.has(year)) next.delete(year);
      else next.add(year);
      return next;
    });
  };

  const displayYears = showAll ? timelineData.years : timelineData.years.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Summary header */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Calendar className="w-5 h-5 text-primary" />
            Linha do Tempo Normativa
          </CardTitle>
          <CardDescription>
            Evolução do marco normativo-institucional brasileiro no combate à discriminação racial ({yearsSpan})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-foreground">{documentos.length}</p>
              <p className="text-xs text-muted-foreground">Instrumentos normativos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30">
              <p className="text-2xl font-bold text-emerald-600">{totalAvancos}</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Avanços identificados</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-red-50 dark:bg-red-950/30">
              <p className="text-2xl font-bold text-red-600">{totalRetrocessos}</p>
              <p className="text-xs text-red-700 dark:text-red-400">Retrocessos</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <p className="text-2xl font-bold text-amber-600">{totalDestaque}</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Marcos de destaque</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-primary via-primary/50 to-muted hidden md:block" />

        {displayYears.map((year, yearIdx) => {
          const items = timelineData.byYear[year];
          const isExpanded = expandedYears.has(year);
          const displayItems = isExpanded ? items : items.slice(0, 3);
          const hasMore = items.length > 3;
          const yearAvancos = items.filter(i => i.trend === 'avanço').length;
          const yearRetrocessos = items.filter(i => i.trend === 'retrocesso').length;

          return (
            <div key={year} className="relative mb-8">
              {/* Year marker */}
              <div className="flex items-center gap-3 mb-4">
                <div className="relative z-10 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-lg">
                  {year}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    {items.length} documento{items.length > 1 ? 's' : ''}
                  </Badge>
                  {yearAvancos > 0 && (
                    <Badge className="text-[10px] bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100">
                      <TrendingUp className="w-3 h-3 mr-0.5" />{yearAvancos} avanço{yearAvancos > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {yearRetrocessos > 0 && (
                    <Badge className="text-[10px] bg-red-100 text-red-700 border-red-200 hover:bg-red-100">
                      <TrendingDown className="w-3 h-3 mr-0.5" />{yearRetrocessos}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="md:ml-16 space-y-3">
                {displayItems.map(({ doc, date, trend, highlight }) => {
                  const cat = categoriaConfig[doc.categoria] || categoriaConfig.legislacao;
                  const CatIcon = cat.icon;
                  const trendCfg = trendConfig[trend as keyof typeof trendConfig];
                  const TrendIcon = trendCfg.icon;
                  const artigos: string[] = doc.artigos_convencao || [];

                  return (
                    <div
                      key={doc.id}
                      className={`relative group rounded-xl border p-4 transition-all hover:shadow-md ${
                        highlight
                          ? 'border-primary/40 bg-primary/5 shadow-sm ring-1 ring-primary/20'
                          : 'border-border bg-card'
                      }`}
                    >
                      {/* Highlight star */}
                      {highlight && (
                        <div className="absolute -top-2 -right-2 z-10">
                          <div className="w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center shadow-md">
                            <Star className="w-3.5 h-3.5 text-white fill-white" />
                          </div>
                        </div>
                      )}

                      {/* Dot connector (desktop) */}
                      <div className={`absolute -left-[2.85rem] top-5 w-3 h-3 rounded-full ${cat.dotColor} ring-2 ring-background shadow-sm hidden md:block`} />

                      <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                        {/* Icon */}
                        <div className={`p-2 rounded-lg ${cat.dotColor}/10 shrink-0 self-start`}>
                          <CatIcon className={`w-4 h-4 ${cat.dotColor.replace('bg-', 'text-')}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className={`text-sm font-semibold leading-tight ${highlight ? 'text-primary' : 'text-foreground'}`}>
                              {doc.titulo || 'Documento sem título'}
                            </h4>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${trendCfg.bg}`}>
                                <TrendIcon className={`w-3 h-3 mr-0.5 ${trendCfg.color}`} />
                                {trendCfg.label}
                              </Badge>
                            </div>
                          </div>

                          {/* Tags row */}
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className={`text-[10px] ${cat.bgColor}`}>
                              {cat.label}
                            </Badge>
                            {artigos.map(a => (
                              <Badge key={a} variant="outline" className="text-[10px] font-bold border-accent bg-accent/10 text-accent-foreground">
                                Art. {a}
                              </Badge>
                            ))}
                            {doc.metas_impactadas?.slice(0, 2).map((m: string) => (
                              <Badge key={m} className="text-[10px] bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                {m}
                              </Badge>
                            ))}
                          </div>

                          {/* Racial summary */}
                          {doc.resumo_impacto?.resumo_racial && (
                            <p className="text-xs text-muted-foreground line-clamp-2 italic">
                              "{doc.resumo_impacto.resumo_racial}"
                            </p>
                          )}

                          {/* Footer: date + link */}
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                            <span>{format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</span>
                            {doc.url_origem && (
                              <a
                                href={doc.url_origem}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-primary hover:underline"
                              >
                                <ExternalLink className="w-3 h-3" /> Ver documento
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Expand/collapse */}
                {hasMore && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground gap-1"
                    onClick={() => toggleYear(year)}
                  >
                    {isExpanded ? (
                      <><ChevronUp className="w-3.5 h-3.5" /> Recolher</>
                    ) : (
                      <><ChevronDown className="w-3.5 h-3.5" /> Ver mais {items.length - 3} documento{items.length - 3 > 1 ? 's' : ''} de {year}</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          );
        })}

        {/* Show all years button */}
        {!showAll && timelineData.years.length > 5 && (
          <div className="text-center pt-4">
            <Button variant="outline" onClick={() => setShowAll(true)} className="gap-2">
              <Calendar className="w-4 h-4" />
              Ver todos os {timelineData.years.length} anos
            </Button>
          </div>
        )}
      </div>

      {/* Conclusive analysis */}
      <Card className="border-t-4 border-t-primary bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <CardTitle className="text-base">Análise Conclusiva da Evolução Normativa</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            A linha do tempo revela <strong className="text-foreground">{totalAvancos} avanços normativos</strong> contra{' '}
            <strong className="text-foreground">{totalRetrocessos} retrocesso{totalRetrocessos !== 1 ? 's' : ''}</strong> no período {yearsSpan}.
            {totalAvancos > totalRetrocessos * 2 && (
              <> A tendência geral é de <strong className="text-emerald-600">fortalecimento progressivo</strong> do marco legal antidiscriminatório.</>
            )}
          </p>
          <p>
            Dos {documentos.length} instrumentos normativos mapeados, <strong className="text-foreground">{totalDestaque}</strong> foram
            classificados como marcos de destaque — incluindo leis estruturantes, decisões paradigmáticas do STF e criação de órgãos
            ministeriais dedicados.
          </p>
          {timelineData.years.includes(2023) && timelineData.years.includes(2024) && (
            <p>
              O biênio <strong className="text-foreground">2023–2024</strong> concentra{' '}
              <strong className="text-foreground">
                {(timelineData.byYear[2023]?.length || 0) + (timelineData.byYear[2024]?.length || 0)}
              </strong>{' '}
              instrumentos — o maior volume normativo do período analisado, refletindo a reconstrução institucional pós-2023.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ShieldCheck, FileText } from 'lucide-react';

/**
 * Maps recommendation paragraph patterns to their source Balizador document.
 * §§X.Y → CERD Observações Finais (sub-numbered paragraphs)
 * §§XX with long thematic titles → HRC Compilation
 * Others → General/Unknown
 */
interface BalizadorGroup {
  sigla: string;
  titulo: string;
  recomendacoes: { rec: string; count: number }[];
}

const BALIZADOR_LABELS: Record<string, { sigla: string; titulo: string }> = {
  'cerd-co': { sigla: 'CERD/C/BRA/CO/18-20', titulo: 'Observações Finais ao Brasil' },
  'hrc': { sigla: 'HRC Compilation', titulo: 'Compilação HRC — Brasil 2022' },
  'ddpa': { sigla: 'DDPA', titulo: 'Declaração e Plano de Ação de Durban' },
  'other': { sigla: 'Outros', titulo: 'Outras fontes balizadoras' },
};

function classifyRecommendation(rec: string): string {
  // §§X.Y pattern (sub-numbered) → CERD Observações Finais
  if (/^§§\d+\.\d+/.test(rec)) return 'cerd-co';
  // §§XX with long thematic descriptions (HRC style)
  if (/^§§\d+\s*—\s*.+/.test(rec)) {
    const num = parseInt(rec.match(/^§§(\d+)/)?.[1] || '0');
    // Single-digit plain numbers (§§2, §§5, §§6) could be either; 
    // numbers ≥ 10 are typically HRC
    if (num >= 10) return 'hrc';
    // §§2, §§5, §§6 with long titles → HRC
    const theme = rec.split('—')[1]?.trim() || '';
    if (theme.length > 30) return 'hrc';
    return 'cerd-co';
  }
  return 'other';
}

/** Sub-group CERD CO recs by their section number (§§1.x, §§2.x, etc.) */
function getCerdSection(rec: string): string {
  const match = rec.match(/^§§(\d+)\./);
  if (!match) return 'Geral';
  const sectionMap: Record<string, string> = {
    '1': '§1 — Coleta de Dados',
    '2': '§2 — Ações Afirmativas e Políticas',
    '3': '§3 — Segurança e Moradia',
    '4': '§4 — Discurso de Ódio',
    '5': '§5 — Direitos Civis, Sociais e Culturais',
    '6': '§6 — Acesso à Justiça e Reparação',
  };
  return sectionMap[match[1]] || `§${match[1]}`;
}

interface NormativaBalizadorFilterProps {
  recomendacoes: { recomendacao: string; count: number }[];
  selectedRecomendacao: string | null;
  onSelectRecomendacao: (rec: string | null) => void;
}

export function NormativaBalizadorFilter({
  recomendacoes,
  selectedRecomendacao,
  onSelectRecomendacao,
}: NormativaBalizadorFilterProps) {
  // Group recommendations by balizador source
  const groups: Record<string, BalizadorGroup> = {};

  recomendacoes.forEach(({ recomendacao, count }) => {
    const key = classifyRecommendation(recomendacao);
    if (!groups[key]) {
      const label = BALIZADOR_LABELS[key] || BALIZADOR_LABELS.other;
      groups[key] = { sigla: label.sigla, titulo: label.titulo, recomendacoes: [] };
    }
    groups[key].recomendacoes.push({ rec: recomendacao, count });
  });

  // For CERD CO, further sub-group by section
  const cerdGroup = groups['cerd-co'];
  const cerdSections: Record<string, { rec: string; count: number }[]> = {};
  if (cerdGroup) {
    cerdGroup.recomendacoes.forEach(r => {
      const section = getCerdSection(r.rec);
      if (!cerdSections[section]) cerdSections[section] = [];
      cerdSections[section].push(r);
    });
  }

  const orderedKeys = ['cerd-co', 'hrc', 'ddpa', 'other'].filter(k => groups[k]);

  if (recomendacoes.length === 0) {
    return (
      <Card className="mb-6">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Nenhuma recomendação vinculada a documentos normativos ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary" />
          Filtro por Documento Balizador
        </CardTitle>
        <CardDescription>
          Recomendações agrupadas pelo documento balizador de origem — clique para filtrar
        </CardDescription>
      </CardHeader>
      <CardContent>
        {selectedRecomendacao && (
          <div className="mb-3">
            <Badge
              variant="default"
              className="cursor-pointer gap-1 text-xs"
              onClick={() => onSelectRecomendacao(null)}
            >
              ✕ Limpar filtro: {selectedRecomendacao}
            </Badge>
          </div>
        )}

        <Accordion type="multiple" defaultValue={['cerd-co']} className="space-y-1">
          {orderedKeys.map(key => {
            const group = groups[key];
            const totalCount = group.recomendacoes.reduce((s, r) => s + r.count, 0);

            return (
              <AccordionItem key={key} value={key} className="border rounded-lg px-1">
                <AccordionTrigger className="text-sm py-2 hover:no-underline">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span className="font-semibold truncate">{group.sigla}</span>
                    <span className="text-xs text-muted-foreground truncate hidden sm:inline">
                      — {group.titulo}
                    </span>
                    <Badge variant="secondary" className="text-[10px] ml-auto shrink-0">
                      {group.recomendacoes.length} rec · {totalCount} docs
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-1 pb-3">
                  {key === 'cerd-co' && Object.keys(cerdSections).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(cerdSections)
                        .sort(([a], [b]) => a.localeCompare(b))
                        .map(([section, recs]) => (
                          <div key={section}>
                            <p className="text-xs font-medium text-muted-foreground mb-1.5">{section}</p>
                            <div className="flex flex-wrap gap-1">
                              {recs.map(({ rec, count }) => (
                                <Badge
                                  key={rec}
                                  variant={selectedRecomendacao === rec ? 'default' : 'outline'}
                                  className="cursor-pointer text-[10px] gap-1 transition-all hover:shadow-sm"
                                  onClick={() => onSelectRecomendacao(selectedRecomendacao === rec ? null : rec)}
                                >
                                  {rec.split('—')[0].trim()}
                                  <span className="opacity-70">({count})</span>
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {group.recomendacoes.map(({ rec, count }) => (
                        <Badge
                          key={rec}
                          variant={selectedRecomendacao === rec ? 'default' : 'outline'}
                          className="cursor-pointer text-[10px] gap-1 transition-all hover:shadow-sm"
                          onClick={() => onSelectRecomendacao(selectedRecomendacao === rec ? null : rec)}
                        >
                          {rec.length > 60 ? rec.substring(0, 57) + '…' : rec}
                          <span className="opacity-70">({count})</span>
                        </Badge>
                      ))}
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

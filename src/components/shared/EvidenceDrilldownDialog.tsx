import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TrendingUp, TrendingDown, Minus, FileText, DollarSign, BarChart3, Trash2, Plus, Search, Maximize2, Minimize2 } from 'lucide-react';
import type { RecomendacaoDiagnostic, LinkedIndicador, LinkedOrcamento, LinkedNormativo } from '@/hooks/useDiagnosticSensor';
import { useState, useMemo } from 'react';
import { isEvidenceEligibleIndicator, isLinkedEvidenceEligible } from '@/utils/indicatorEvidenceGuards';
import { expandIndicadorEvidencia } from '@/hooks/useDiagnosticSensor';
import { EsforcoImpactoTags } from '@/components/shared/EsforcoImpactoTags';
import { TETOS_ESFORCO, formatScore } from '@/utils/esforcoImpacto';

// ── Override types ─────────────────────────────────────────────
export interface EvidenceOverride {
  removedIndicadores: string[];   // nomes removed
  removedOrcamento: string[];     // `${programa}|${orgao}|${ano}` keys removed
  removedNormativos: string[];    // titulos removed
  addedIndicadores: LinkedIndicador[];
  addedOrcamento: LinkedOrcamento[];
  addedNormativos: LinkedNormativo[];
}

export type EvidenceOverrides = Record<string, EvidenceOverride>;

export function emptyOverride(): EvidenceOverride {
  return { removedIndicadores: [], removedOrcamento: [], removedNormativos: [], addedIndicadores: [], addedOrcamento: [], addedNormativos: [] };
}

function orcKey(o: LinkedOrcamento) {
  return `${o.programa}|${o.orgao}|${o.ano}`;
}

// ── Props ──────────────────────────────────────────────────────
interface EvidenceDrilldownDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paragrafo: string;
  tema: string;
  diagnostic: RecomendacaoDiagnostic | undefined;
  recomendacaoId?: string;
  // Full databases for add-search
  allIndicadores?: any[];
  allOrcamento?: any[];
  allNormativos?: any[];
  // Override management
  overrides?: EvidenceOverride;
  onOverridesChange?: (override: EvidenceOverride) => void;
}

export function EvidenceDrilldownDialog({
  open, onOpenChange, paragrafo, tema, diagnostic,
  recomendacaoId,
  allIndicadores, allOrcamento, allNormativos,
  overrides, onOverridesChange,
}: EvidenceDrilldownDialogProps) {
  const [searchInd, setSearchInd] = useState('');
  const [searchOrc, setSearchOrc] = useState('');
  const [searchNorm, setSearchNorm] = useState('');
  const [maximized, setMaximized] = useState(false);

  const isEditable = !!onOverridesChange && !!overrides;

  const auditoria = diagnostic?.auditoria;
  const linkedIndicadores = diagnostic?.linkedIndicadores || [];
  const linkedOrcamento = diagnostic?.linkedOrcamento || [];
  const linkedNormativos = diagnostic?.linkedNormativos || [];

  // ── Effective lists (with overrides applied) ──
  const effectiveIndicadores = useMemo(() => {
    const eligibleLinked = linkedIndicadores.filter(isLinkedEvidenceEligible);
    if (!overrides) return eligibleLinked;
    const base = eligibleLinked.filter(i => !overrides.removedIndicadores.includes(i.nome));
    const added = overrides.addedIndicadores.filter(isEvidenceEligibleIndicator).filter(a => !base.some(b => b.nome === a.nome));
    return [...base, ...added];
  }, [linkedIndicadores, overrides]);

  const effectiveOrcamento = useMemo(() => {
    if (!overrides) return linkedOrcamento;
    const base = linkedOrcamento.filter(o => !overrides.removedOrcamento.includes(orcKey(o)));
    const added = overrides.addedOrcamento.filter(a => !base.some(b => orcKey(b) === orcKey(a)));
    return [...base, ...added];
  }, [linkedOrcamento, overrides]);

  const effectiveNormativos = useMemo(() => {
    if (!overrides) return linkedNormativos;
    const base = linkedNormativos.filter(n => !overrides.removedNormativos.includes(n.titulo));
    const added = overrides.addedNormativos.filter(a => !base.some(b => b.titulo === a.titulo));
    return [...base, ...added];
  }, [linkedNormativos, overrides]);

  const searchIndResults = useMemo(() => {
    if (!searchInd || searchInd.length < 1) return [];
    const term = searchInd.toLowerCase();
    // ⚠️ REGRA DE OURO: indicadores excluídos ou Common Core JAMAIS aparecem
    // como opção de inserção manual.
    // ⚠️ Guarda-chuva COM subindicadores não é ofertado: apenas seus subs,
    // que carregam o título temático e os valores.
    return (allIndicadores || [])
      .filter(isEvidenceEligibleIndicator)
      .flatMap((i: any) => expandIndicadorEvidencia({ nome: i.nome, categoria: i.categoria, tendencia: i.tendencia, dados: i.dados, id: i.id, codigo: i.codigo })
        .map(e => ({ ...e, _busca: `${i.nome} ${i.categoria} ${i.subcategoria || ''} ${e.sub || ''}` })))
      .filter((e: any) => e._busca.toLowerCase().includes(term) && !effectiveIndicadores.some(x => x.nome === e.nome))
      .slice(0, 15)
      .map(({ _busca, ...e }: any) => e);
  }, [searchInd, allIndicadores, effectiveIndicadores]);

  const searchOrcResults = useMemo(() => {
    if (!searchOrc || searchOrc.length < 1) return [];
    const term = searchOrc.toLowerCase();
    return (allOrcamento || [])
      .filter((o: any) => {
        const text = `${o.programa} ${o.orgao} ${o.descritivo || ''}`.toLowerCase();
        const key = `${o.programa}|${o.orgao}|${o.ano}`;
        return text.includes(term) && !effectiveOrcamento.some(e => orcKey(e) === key);
      })
      .slice(0, 15)
      .map((o: any) => ({ id: o.id, programa: o.programa, orgao: o.orgao, ano: o.ano, dotacao_autorizada: o.dotacao_autorizada, empenhado: o.empenhado, liquidado: o.liquidado, pago: o.pago }));
  }, [searchOrc, allOrcamento, effectiveOrcamento]);

  const searchNormResults = useMemo(() => {
    if (!searchNorm || searchNorm.length < 1) return [];
    const term = searchNorm.toLowerCase();
    return (allNormativos || [])
      .filter((n: any) => {
        const text = `${n.titulo} ${n.categoria || ''}`.toLowerCase();
        return text.includes(term) && !effectiveNormativos.some(e => e.titulo === n.titulo);
      })
      .slice(0, 15)
      .map((n: any) => ({ titulo: n.titulo, status: n.status }));
  }, [searchNorm, allNormativos, effectiveNormativos]);

  // ── Handlers ──
  const removeIndicador = (nome: string) => {
    if (!overrides || !onOverridesChange) return;
    const isAdded = overrides.addedIndicadores.some(a => a.nome === nome);
    if (isAdded) {
      onOverridesChange({ ...overrides, addedIndicadores: overrides.addedIndicadores.filter(a => a.nome !== nome) });
    } else {
      onOverridesChange({ ...overrides, removedIndicadores: [...overrides.removedIndicadores, nome] });
    }
  };

  const removeOrcamento = (key: string) => {
    if (!overrides || !onOverridesChange) return;
    const isAdded = overrides.addedOrcamento.some(a => orcKey(a) === key);
    if (isAdded) {
      onOverridesChange({ ...overrides, addedOrcamento: overrides.addedOrcamento.filter(a => orcKey(a) !== key) });
    } else {
      onOverridesChange({ ...overrides, removedOrcamento: [...overrides.removedOrcamento, key] });
    }
  };

  const removeNormativo = (titulo: string) => {
    if (!overrides || !onOverridesChange) return;
    const isAdded = overrides.addedNormativos.some(a => a.titulo === titulo);
    if (isAdded) {
      onOverridesChange({ ...overrides, addedNormativos: overrides.addedNormativos.filter(a => a.titulo !== titulo) });
    } else {
      onOverridesChange({ ...overrides, removedNormativos: [...overrides.removedNormativos, titulo] });
    }
  };

  const addIndicador = (ind: LinkedIndicador) => {
    if (!overrides || !onOverridesChange) return;
    // If it was previously removed, un-remove it
    if (overrides.removedIndicadores.includes(ind.nome)) {
      onOverridesChange({ ...overrides, removedIndicadores: overrides.removedIndicadores.filter(n => n !== ind.nome) });
    } else {
      onOverridesChange({ ...overrides, addedIndicadores: [...overrides.addedIndicadores, ind] });
    }
  };

  const addOrcamentoItem = (orc: LinkedOrcamento) => {
    if (!overrides || !onOverridesChange) return;
    const key = orcKey(orc);
    if (overrides.removedOrcamento.includes(key)) {
      onOverridesChange({ ...overrides, removedOrcamento: overrides.removedOrcamento.filter(k => k !== key) });
    } else {
      onOverridesChange({ ...overrides, addedOrcamento: [...overrides.addedOrcamento, orc] });
    }
  };

  const addNormativoItem = (norm: LinkedNormativo) => {
    if (!overrides || !onOverridesChange) return;
    if (overrides.removedNormativos.includes(norm.titulo)) {
      onOverridesChange({ ...overrides, removedNormativos: overrides.removedNormativos.filter(t => t !== norm.titulo) });
    } else {
      onOverridesChange({ ...overrides, addedNormativos: [...overrides.addedNormativos, norm] });
    }
  };

  const hasOverrides = overrides && (
    overrides.removedIndicadores.length > 0 || overrides.removedOrcamento.length > 0 || overrides.removedNormativos.length > 0 ||
    overrides.addedIndicadores.length > 0 || overrides.addedOrcamento.length > 0 || overrides.addedNormativos.length > 0
  );

  if (!diagnostic || !auditoria) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`overflow-hidden flex flex-col transition-all ${maximized ? 'max-w-[95vw] max-h-[95vh] w-[95vw] h-[95vh]' : 'max-w-4xl max-h-[90vh]'}`}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base flex items-center gap-2">
              §{paragrafo} — {tema}
            </DialogTitle>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => setMaximized(!maximized)} title={maximized ? 'Reduzir' : 'Maximizar'}>
              {maximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
          <DialogDescription className="text-xs">
            {isEditable
              ? 'Evidências vinculadas — remova ou adicione itens para ajustar a avaliação.'
               : 'Evidências que fundamentam os índices de Esforço e Impacto'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-2">
          <div className="space-y-4">
            {/* Esforço e Impacto */}
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <EsforcoImpactoTags
                esforco={auditoria.esforcoImpacto.esforco}
                impacto={auditoria.esforcoImpacto.impacto}
                faixaEsforco={auditoria.esforcoImpacto.faixaEsforco}
                faixaImpacto={auditoria.esforcoImpacto.faixaImpacto}
              />
              <div className="flex-1 text-xs text-muted-foreground space-y-0.5">
                <p>Realização {formatScore(auditoria.esforcoImpacto.realizacao)} · Estatística {formatScore(auditoria.esforcoImpacto.componentes.realizacaoEstatistica)}% · Orçamentária {formatScore(auditoria.esforcoImpacto.componentes.realizacaoOrcamentaria)}% · Normativa {formatScore(auditoria.esforcoImpacto.componentes.realizacaoNormativa)}%</p>
                <p className="text-[10px]">Tetos do Esforço: {TETOS_ESFORCO.estatistica} estatísticas · {TETOS_ESFORCO.orcamentaria} orçamentárias · {TETOS_ESFORCO.normativa} normativas.</p>
              </div>
              {hasOverrides && (
                <Badge variant="secondary" className="text-[10px] bg-accent/20 text-accent">
                  Ajustes manuais aplicados
                </Badge>
              )}
            </div>

            {/* Indicadores */}
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                <BarChart3 className="w-4 h-4 text-chart-1" />
                Indicadores ({effectiveIndicadores.length})
              </h4>
              {effectiveIndicadores.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Nenhum indicador vinculado</p>
              ) : (
                <div className="rounded-md border overflow-auto max-h-48">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px]">Indicador</TableHead>
                        <TableHead className="text-[10px] w-24">Categoria</TableHead>
                        <TableHead className="text-[10px] w-24">Tendência</TableHead>
                        {isEditable && <TableHead className="text-[10px] w-10" />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {effectiveIndicadores.map((ind, i) => {
                        const isManual = overrides?.addedIndicadores.some(a => a.nome === ind.nome);
                        return (
                          <TableRow key={i} className={isManual ? 'bg-accent/10' : ''}>
                            <TableCell className="text-xs">
                              {ind.nome}
                              {ind.sub && (
                                <Badge variant="outline" className="ml-1 font-mono text-[8px] px-1 py-0">
                                  {ind.codigo ? `${ind.codigo} · sub: ${ind.sub}` : `sub: ${ind.sub}`}
                                </Badge>
                              )}
                              {isManual && <Badge variant="outline" className="ml-1 text-[8px] px-1 py-0 text-accent">manual</Badge>}
                            </TableCell>
                            <TableCell className="text-[10px] text-muted-foreground">{ind.categoria}</TableCell>
                            <TableCell>
                              {ind.tendencia === 'crescente' ? (
                                <span className="flex items-center gap-1 text-[10px] text-success"><TrendingUp className="w-3 h-3" /> Crescente</span>
                              ) : ind.tendencia === 'decrescente' ? (
                                <span className="flex items-center gap-1 text-[10px] text-destructive"><TrendingDown className="w-3 h-3" /> Decrescente</span>
                              ) : (
                                <span className="flex items-center gap-1 text-[10px] text-muted-foreground"><Minus className="w-3 h-3" /> {ind.tendencia || 'N/D'}</span>
                              )}
                            </TableCell>
                            {isEditable && (
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={() => removeIndicador(ind.nome)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">{auditoria.indicadores.justificativa}</p>
              {isEditable && (
                <div className="mt-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar indicador para adicionar..."
                      value={searchInd}
                      onChange={(e) => setSearchInd(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                  {searchInd.length >= 1 && (
                    <div className="rounded-md border mt-1 max-h-32 overflow-auto bg-background">
                      {searchIndResults.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground p-2">Nenhum resultado.</p>
                      ) : (
                        <Table>
                          <TableBody>
                            {searchIndResults.map((ind: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell className="text-[10px] py-1">
                                  {ind.nome}
                                  {ind.sub && (
                                    <Badge variant="outline" className="ml-1 font-mono text-[8px] px-1 py-0">
                                      {ind.codigo ? `${ind.codigo} · sub: ${ind.sub}` : `sub: ${ind.sub}`}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell className="text-[10px] text-muted-foreground w-16 py-1">{ind.categoria}</TableCell>
                                <TableCell className="w-8 py-1">
                                  <Button variant="ghost" size="icon" className="h-5 w-5 text-accent" onClick={() => { addIndicador(ind); setSearchInd(''); }}>
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Orçamento */}
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                <DollarSign className="w-4 h-4 text-chart-2" />
                Ações Orçamentárias ({effectiveOrcamento.length})
              </h4>
              {effectiveOrcamento.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Nenhuma ação orçamentária vinculada</p>
              ) : (
                <div className="rounded-md border overflow-auto max-h-48">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px]">Programa</TableHead>
                        <TableHead className="text-[10px] w-28">Órgão</TableHead>
                        <TableHead className="text-[10px] w-16">Ano</TableHead>
                        <TableHead className="text-[10px] w-24">Empenhado</TableHead>
                        <TableHead className="text-[10px] w-24">Liquidado</TableHead>
                        {isEditable && <TableHead className="text-[10px] w-10" />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {effectiveOrcamento.map((orc, i) => {
                        const isManual = overrides?.addedOrcamento.some(a => orcKey(a) === orcKey(orc));
                        return (
                          <TableRow key={i} className={isManual ? 'bg-accent/10' : ''}>
                            <TableCell className="text-xs">
                              {orc.programa}
                              {isManual && <Badge variant="outline" className="ml-1 text-[8px] px-1 py-0 text-accent">manual</Badge>}
                            </TableCell>
                            <TableCell className="text-[10px] text-muted-foreground">{orc.orgao}</TableCell>
                            <TableCell className="text-[10px]">{orc.ano}</TableCell>
                            <TableCell className="text-[10px]">
                              {orc.empenhado != null ? `R$ ${(Number(orc.empenhado) / 1e6).toFixed(1)}M` : '—'}
                            </TableCell>
                            <TableCell className="text-[10px]">{orc.liquidado != null ? `R$ ${(Number(orc.liquidado) / 1e6).toFixed(1)}M` : '—'}</TableCell>
                            {isEditable && (
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={() => removeOrcamento(orcKey(orc))}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">{auditoria.orcamento.justificativa}</p>
              {isEditable && (
                <div className="mt-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar ação orçamentária para adicionar..."
                      value={searchOrc}
                      onChange={(e) => setSearchOrc(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                  {searchOrc.length >= 1 && (
                    <div className="rounded-md border mt-1 max-h-32 overflow-auto bg-background">
                      {searchOrcResults.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground p-2">Nenhum resultado.</p>
                      ) : (
                        <Table>
                          <TableBody>
                            {searchOrcResults.map((orc: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell className="text-[10px] py-1">{orc.programa}</TableCell>
                                <TableCell className="text-[10px] text-muted-foreground w-16 py-1">{orc.orgao}</TableCell>
                                <TableCell className="text-[10px] w-10 py-1">{orc.ano}</TableCell>
                                <TableCell className="w-8 py-1">
                                  <Button variant="ghost" size="icon" className="h-5 w-5 text-accent" onClick={() => { addOrcamentoItem(orc); setSearchOrc(''); }}>
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Normativos */}
            <div>
              <h4 className="text-sm font-semibold flex items-center gap-1.5 mb-2">
                <FileText className="w-4 h-4 text-chart-3" />
                Normativos ({effectiveNormativos.length})
              </h4>
              {effectiveNormativos.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Nenhum normativo vinculado</p>
              ) : (
                <div className="rounded-md border overflow-auto max-h-48">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[10px]">Título</TableHead>
                        <TableHead className="text-[10px] w-24">Status</TableHead>
                        {isEditable && <TableHead className="text-[10px] w-10" />}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {effectiveNormativos.map((norm, i) => {
                        const isManual = overrides?.addedNormativos.some(a => a.titulo === norm.titulo);
                        return (
                          <TableRow key={i} className={isManual ? 'bg-accent/10' : ''}>
                            <TableCell className="text-xs">
                              {norm.titulo}
                              {isManual && <Badge variant="outline" className="ml-1 text-[8px] px-1 py-0 text-accent">manual</Badge>}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-[10px]">{norm.status}</Badge>
                            </TableCell>
                            {isEditable && (
                              <TableCell>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive/70 hover:text-destructive" onClick={() => removeNormativo(norm.titulo)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
              <p className="text-[10px] text-muted-foreground mt-1">{auditoria.normativos.justificativa}</p>
              {isEditable && (
                <div className="mt-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Buscar normativo para adicionar..."
                      value={searchNorm}
                      onChange={(e) => setSearchNorm(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                  {searchNorm.length >= 1 && (
                    <div className="rounded-md border mt-1 max-h-32 overflow-auto bg-background">
                      {searchNormResults.length === 0 ? (
                        <p className="text-[10px] text-muted-foreground p-2">Nenhum resultado.</p>
                      ) : (
                        <Table>
                          <TableBody>
                            {searchNormResults.map((norm: any, i: number) => (
                              <TableRow key={i}>
                                <TableCell className="text-[10px] py-1">{norm.titulo}</TableCell>
                                <TableCell className="w-8 py-1">
                                  <Button variant="ghost" size="icon" className="h-5 w-5 text-accent" onClick={() => { addNormativoItem(norm); setSearchNorm(''); }}>
                                    <Plus className="w-3 h-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Methodology note */}
            <div className="p-3 bg-muted/30 rounded text-[10px] text-muted-foreground space-y-1">
              <p><strong>Metodologia — Esforço e Impacto Evidenciado:</strong></p>
              <p><strong>Esforço:</strong> [100 × min(nEst/{TETOS_ESFORCO.estatistica};1) + 100 × min(nOrç/{TETOS_ESFORCO.orcamentaria};1) + 100 × min(nNorm/{TETOS_ESFORCO.normativa};1)] ÷ 3.</p>
              <p><strong>Realização:</strong> [% de indicadores com evolução não desfavorável + %(Σ Liquidado ÷ Σ Dotação autorizada válida) + %(presença normativa)] ÷ 3.</p>
              <p><strong>Componente estatístico:</strong> (melhorou + estável) ÷ total com tendência mensurável × 100. Estável representa manutenção; somente piora recebe 0.</p>
              <p><strong>Impacto Evidenciado:</strong> Esforço × Realização ÷ 100. Faixas: Baixo &lt;25 · Intermediário 25–59,9 · Alto ≥60.</p>
              {isEditable && (
                <p className="mt-1"><strong>Nota:</strong> Ajustes manuais (inclusão/exclusão) são aplicados em tempo real e recalculam o status automaticamente.</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

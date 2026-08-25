import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, ChevronRight, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMirrorData } from '@/hooks/useMirrorData';
import { useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import { normalizeCodigoInput } from '@/utils/indicadorCodigo';
import { abasDoIndicador, focusIndicadorNaAba, ABA_ESPELHO, type AbaLocalizacao } from '@/utils/indicadorLocator';
import { SUB_INDICADORES } from '@/utils/indicadorSubs';


interface SearchResult {
  id?: string;
  codigo?: string;
  nome?: string;
  titulo: string;
  valor?: string;
  fonte?: string;
  aba: string;
  abaValue: string;
  categoria?: string;
  abas?: AbaLocalizacao[];
  /** quando é sub-indicador de guarda-chuva: título do bloco a localizar na aba */
  subTitulo?: string;
}

// Static data catalog — searches across all sub-tabs
function buildSearchCatalog(mirror: any, indicadoresDb: any[]): SearchResult[] {
  const results: SearchResult[] = [];

  (indicadoresDb || []).forEach((ind: any) => {
    results.push({
      id: ind.id,
      codigo: ind.codigo,
      nome: ind.nome,
      titulo: `${ind.codigo ? `${ind.codigo} — ` : ''}${ind.nome}`,
      fonte: ind.fonte,
      aba: 'Espelho Seguro (BD)',
      abaValue: 'indicadores-db',
      categoria: ind.subcategoria || ind.categoria,
      abas: abasDoIndicador(ind.categoria, ind.subcategoria, ind.nome, ind.documento_origem),
    });
  });

  // Sub-indicadores de guarda-chuvas (ex.: "Renda Média Mensal" dentro de
  // "Indicadores socioeconômicos por raça") — localizáveis pelo próprio
  // título, sempre citando o código canônico do guarda-chuva (sem inventar
  // código novo — Regra de Ouro).
  SUB_INDICADORES.forEach((sub) => {
    const umbrella = (indicadoresDb || []).find((i: any) => i.nome === sub.guardaChuva);
    if (!umbrella?.codigo) return;
    results.push({
      id: umbrella.id,
      codigo: umbrella.codigo,
      nome: `${sub.titulo} — dentro de "${sub.guardaChuva}"`,
      titulo: `${umbrella.codigo} · sub: ${sub.sub} — ${sub.titulo}`,
      fonte: umbrella.fonte,
      aba: sub.abaLabel,
      abaValue: sub.tabValue,
      categoria: 'Sub-indicador',
      subTitulo: sub.titulo,
      abas: [
        { label: sub.abaLabel, tabValue: sub.tabValue },
        { ...ABA_ESPELHO },
      ],
    });
  });


  // Segurança Pública
  (mirror.segurancaPublica || []).forEach((s: any) => {
    results.push({
      titulo: `Segurança Pública ${s.ano} — Homicídio Negro: ${s.homicidioNegro}/100mil, Vítimas Negras: ${s.percentualVitimasNegras}%`,
      valor: `Letalidade Policial: ${s.letalidadePolicial}%`,
      fonte: 'FBSP / Atlas da Violência',
      aba: 'Segurança/Saúde/Educação',
      abaValue: 'seguranca-saude-educacao',
      categoria: 'Segurança Pública',
    });
  });

  // Educação
  (mirror.educacaoSerieHistorica || []).forEach((s: any) => {
    results.push({
      titulo: `Educação ${s.ano} — Superior Negro: ${s.superiorNegroPercent}%, Analfabetismo Negro: ${s.analfabetismoNegro}%`,
      fonte: 'PNAD Contínua / INEP',
      aba: 'Segurança/Saúde/Educação',
      abaValue: 'seguranca-saude-educacao',
      categoria: 'Educação',
    });
  });

  // Socioeconômicos
  (mirror.indicadoresSocioeconomicos || []).forEach((s: any) => {
    results.push({
      titulo: `Socioeconômico ${s.ano} — Desemprego Negro: ${s.desempregoNegro}%, Renda Média Negra: R$${s.rendaMediaNegra}`,
      fonte: 'PNAD Contínua',
      aba: 'Dados Gerais',
      abaValue: 'dados-gerais',
      categoria: 'Trabalho e Renda',
    });
  });

  // Feminicídio
  (mirror.feminicidioSerie || []).forEach((s: any) => {
    results.push({
      titulo: `Feminicídio ${s.ano} — Vítimas Negras: ${s.percentualNegras}%`,
      fonte: 'FBSP',
      aba: 'Segurança/Saúde/Educação',
      abaValue: 'seguranca-saude-educacao',
      categoria: 'Feminicídio',
    });
  });

  // Saúde
  (mirror.saudeSerieHistorica || []).forEach((s: any) => {
    results.push({
      titulo: `Saúde ${s.ano} — Mortalidade Materna Negra: ${s.mortalidadeMaternaNegra}/100mil NV`,
      fonte: 'DataSUS',
      aba: 'Segurança/Saúde/Educação',
      abaValue: 'seguranca-saude-educacao',
      categoria: 'Saúde',
    });
  });

  // Déficit Habitacional
  (mirror.deficitHabitacionalSerie || []).forEach((s: any) => {
    results.push({
      titulo: `Déficit Habitacional ${s.ano} — Negros: ${s.negros}%, Brancos: ${s.brancos}%`,
      fonte: 'FJP/IBGE',
      aba: 'Vulnerabilidades',
      abaValue: 'vulnerabilidades',
      categoria: 'Habitação',
    });
  });

  // Povos Tradicionais
  const pt = mirror.povosTradicionais;
  if (pt?.indigenas) {
    results.push({
      titulo: `Povos Indígenas — População: ${pt.indigenas.populacaoPessoasIndigenas?.toLocaleString('pt-BR')}, TIs: ${pt.indigenas.terrasTotal}, Homologadas: ${pt.indigenas.terrasHomologadas}`,
      fonte: 'FUNAI / IBGE Censo 2022',
      aba: 'Grupos Focais',
      abaValue: 'grupos-focais',
      categoria: 'Povos Tradicionais',
    });
  }
  if (pt?.quilombolas) {
    results.push({
      titulo: `Quilombolas — População: ${pt.quilombolas.populacao?.toLocaleString('pt-BR')}, Territórios Titulados: ${pt.quilombolas.territoriosTitulados}`,
      fonte: 'INCRA / IBGE Censo 2022',
      aba: 'Grupos Focais',
      abaValue: 'grupos-focais',
      categoria: 'Povos Tradicionais',
    });
  }

  // Atlas Violência
  const atlas = mirror.atlasViolencia2025;
  if (atlas) {
    results.push({
      titulo: `Atlas da Violência 2025 — Taxa Homicídio Negros: ${atlas.taxaHomicidioNegros}/100mil, Risco: ${atlas.riscoRelativo}x`,
      fonte: 'IPEA/FBSP',
      aba: 'Grupos Focais',
      abaValue: 'grupos-focais',
      categoria: 'Vulnerabilidade',
    });
  }

  // Juventude Negra
  const jov = mirror.jovensNegrosViolencia;
  if (jov) {
    results.push({
      titulo: `Juventude Negra — Encarceramento: ${jov.encarceramento}%, Medidas Socioeducativas: ${jov.medidasSocioeducativas}%`,
      fonte: 'FBSP / Atlas da Violência 2025',
      aba: 'Juventude',
      abaValue: 'juventude',
      categoria: 'Juventude Negra',
    });
  }

  // População carcerária
  (mirror.populacaoCarcerariaData || []).forEach((s: any) => {
    results.push({
      titulo: `População Carcerária ${s.ano} — Total: ${s.total?.toLocaleString('pt-BR')}, Negros: ${s.negros?.toLocaleString('pt-BR')} (${s.percentualNegros}%)`,
      fonte: 'FBSP / DEPEN',
      aba: 'Vulnerabilidades',
      abaValue: 'vulnerabilidades',
      categoria: 'Sistema Prisional',
    });
  });

  // Classe por raça
  (mirror.classePorRaca || []).forEach((s: any) => {
    results.push({
      titulo: `Classe Social — ${s.faixa}: Negros ${s.negros}%, Brancos ${s.brancos}%`,
      fonte: 'IBGE/PNAD',
      aba: 'Classe Social',
      abaValue: 'classe',
      categoria: 'Classe Social',
    });
  });

  // Evasão escolar
  (mirror.evasaoEscolarSerie || []).forEach((s: any) => {
    results.push({
      titulo: `Evasão Escolar ${s.ano} — Negros: ${s.negros}%, Brancos: ${s.brancos}%`,
      fonte: 'INEP',
      aba: 'Segurança/Saúde/Educação',
      abaValue: 'seguranca-saude-educacao',
      categoria: 'Educação',
    });
  });

  return results;
}

interface KeywordSearchProps {
  onNavigateTab?: (tabValue: string) => void;
}

export function KeywordSearch({ onNavigateTab }: KeywordSearchProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const mirror = useMirrorData();
  const { data: indicadoresDb = [] } = useIndicadoresInterseccionais();

  const catalog = useMemo(() => buildSearchCatalog(mirror, indicadoresDb), [mirror, indicadoresDb]);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const codigoNorm = normalizeCodigoInput(query);
    return catalog.filter(item => {
      const text = `${item.titulo} ${item.categoria || ''} ${item.fonte || ''}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      if (codigoNorm && item.codigo === codigoNorm) return true;
      return text.includes(q);
    }).slice(0, 20);
  }, [query, catalog]);

  const handleSelect = useCallback((result: SearchResult, aba?: AbaLocalizacao) => {
    const alvo: AbaLocalizacao = aba || { label: result.aba, tabValue: result.abaValue };
    if (alvo.href) {
      const anchor = result.codigo ? `#ind-${result.codigo}` : '';
      window.open(`${alvo.href}${anchor}`, '_blank', 'noopener');
      return;
    }
    onNavigateTab?.(alvo.tabValue);
    // Sub-indicador em aba temática: localiza pelo TÍTULO do bloco (o código
    // do guarda-chuva apontaria para o título-mãe, não para o gráfico).
    const irPorSub = !!result.subTitulo && alvo.tabValue !== 'indicadores-db';
    focusIndicadorNaAba({
      codigo: irPorSub ? undefined : result.codigo,
      id: result.id,
      nome: irPorSub ? result.subTitulo : result.nome,
      tabValue: alvo.tabValue,
    });
    setQuery('');
    setIsOpen(false);
  }, [onNavigateTab]);


  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar indicador por palavra-chave (ex: carcerária, feminicídio, quilombola...)"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
            onFocus={() => setIsOpen(true)}
            className="pl-9 pr-9"
          />
          {query && (
            <button
              onClick={() => { setQuery(''); setIsOpen(false); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <Badge variant="outline" className="text-xs whitespace-nowrap">
          <Database className="w-3 h-3 mr-1" />
          {catalog.length} itens indexados
        </Badge>
      </div>

      {isOpen && query.length >= 2 && (
        <Card className="absolute z-50 w-full mt-1 max-h-[60vh] overflow-y-auto shadow-xl border-2 border-primary/20">
          <CardContent className="p-3">
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                Nenhum resultado para "{query}"
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground">
                  {results.length} resultado(s) — clique na aba desejada para abrir no ponto exato do indicador
                </p>
                {results.map((item, idx) => {
                  const abas = item.abas && item.abas.length
                    ? item.abas
                    : [{ label: item.aba, tabValue: item.abaValue } as AbaLocalizacao];
                  return (
                    <div
                      key={idx}
                      className={cn(
                        'p-2 rounded border border-transparent hover:border-primary/20 hover:bg-muted/60 transition-colors',
                      )}
                    >
                      <div className="flex items-start gap-2">
                        {item.codigo ? (
                          <Badge variant="default" className="text-[10px] px-1.5 py-0 font-mono shrink-0">{item.codigo}</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0 text-muted-foreground" title="Bloco agregado — ainda sem ID no espelho do banco">
                            sem ID
                          </Badge>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium leading-tight">
                            {item.nome || item.titulo}
                          </p>
                          {item.fonte && (
                            <p className="text-xs text-muted-foreground truncate">{item.fonte}</p>
                          )}
                          <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                            <span className="text-[10px] text-muted-foreground">Aparece em:</span>
                            {abas.map(aba => (
                              <button
                                key={aba.tabValue}
                                onClick={() => handleSelect(item, aba)}
                                className={cn(
                                  'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] transition-colors',
                                  aba.canonica
                                    ? 'border-primary/40 bg-primary/10 text-primary hover:bg-primary/20'
                                    : 'border-border hover:bg-muted',
                                )}
                              >
                                {aba.label}
                                <ChevronRight className="w-3 h-3" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </CardContent>
        </Card>
      )}
    </div>
  );
}

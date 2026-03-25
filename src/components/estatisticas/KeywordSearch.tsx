import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, X, ChevronRight, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMirrorData } from '@/hooks/useMirrorData';

interface SearchResult {
  titulo: string;
  valor?: string;
  fonte?: string;
  aba: string;
  abaValue: string;
  categoria?: string;
}

// Static data catalog — searches across all sub-tabs
function buildSearchCatalog(mirror: any): SearchResult[] {
  const results: SearchResult[] = [];

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

  const catalog = useMemo(() => buildSearchCatalog(mirror), [mirror]);

  const results = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return catalog.filter(item => {
      const text = `${item.titulo} ${item.categoria || ''} ${item.fonte || ''}`
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      return text.includes(q);
    }).slice(0, 20);
  }, [query, catalog]);

  const handleSelect = useCallback((result: SearchResult) => {
    if (onNavigateTab) {
      onNavigateTab(result.abaValue);
    }
    setQuery('');
    setIsOpen(false);
  }, [onNavigateTab]);

  // Group results by tab
  const grouped = useMemo(() => {
    const map = new Map<string, SearchResult[]>();
    results.forEach(r => {
      const arr = map.get(r.aba) || [];
      arr.push(r);
      map.set(r.aba, arr);
    });
    return map;
  }, [results]);

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
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">{results.length} resultado(s) encontrado(s)</p>
                {Array.from(grouped.entries()).map(([aba, items]) => (
                  <div key={aba}>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className="text-xs bg-primary/10 text-primary">{aba}</Badge>
                      <span className="text-xs text-muted-foreground">({items.length})</span>
                    </div>
                    <div className="space-y-1">
                      {items.map((item, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelect(item)}
                          className={cn(
                            "w-full text-left p-2 rounded hover:bg-muted/80 transition-colors",
                            "border border-transparent hover:border-primary/20"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{item.titulo}</p>
                              {item.fonte && (
                                <p className="text-xs text-muted-foreground truncate">{item.fonte}</p>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

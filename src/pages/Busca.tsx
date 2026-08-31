import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ExternalLink, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { deepLinksRegistry } from '@/data/deepLinksRegistry';
import { buildIndicadorCodigoMap } from '@/utils/indicadorCodigo';
import { getSubIndicadorAnchor, SUB_INDICADORES, hasSubIndicadores } from '@/utils/indicadorSubs';
import { abasDoIndicador } from '@/utils/indicadorLocator';
import { isDuplicata } from '@/utils/indicadorAliases';
import { searchableMatches } from '@/utils/searchText';

interface Hit {
  titulo: string;
  trecho?: string;
  secao: string;
  base: string;
  link: string;
  externo?: boolean;
  fonte?: string;
}

function norm(s: unknown) {
  return String(s ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const t = String(text ?? '');
  const i = norm(t).indexOf(norm(q));
  if (i < 0) return t;
  return (
    <>
      {t.slice(0, i)}
      <mark className="bg-yellow-200 dark:bg-yellow-700/60 rounded px-0.5">{t.slice(i, i + q.length)}</mark>
      {t.slice(i + q.length)}
    </>
  );
}

function useGlobalData() {
  return useQuery({
    queryKey: ['global-search-corpus'],
    queryFn: async () => {
      const [ind, lac, norma, orc, conc] = await Promise.all([
        supabase.from('indicadores_interseccionais').select('id,nome,fonte,url_fonte,categoria,subcategoria,analise_interseccional,dados,artigos_convencao,created_at,codigo_curto'),
        supabase.from('lacunas_identificadas').select('id,tema,descricao_lacuna,texto_original_onu,paragrafo,grupo_focal,eixo_tematico,artigos_convencao,documento_onu'),
        supabase.from('documentos_normativos').select('id,titulo,categoria,url_origem,artigos_convencao,status'),
        supabase.from('dados_orcamentarios').select('id,programa,orgao,esfera,ano,fonte_dados,url_fonte,descritivo,eixo_tematico,grupo_focal,artigos_convencao'),
        supabase.from('conclusoes_analiticas').select('id,titulo,tipo,argumento_central,secao_relatorio,eixos_tematicos,artigos_convencao'),
      ]);
      return {
        ind: ind.data || [],
        lac: lac.data || [],
        norma: norma.data || [],
        orc: orc.data || [],
        conc: conc.data || [],
      };
    },
    staleTime: 5 * 60 * 1000,
  });
}

export default function Busca() {
  const [params, setParams] = useSearchParams();
  const initial = params.get('q') || '';
  const [q, setQ] = useState(initial);
  const [debounced, setDebounced] = useState(initial);
  const { data, isLoading } = useGlobalData();

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 200);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    if (debounced !== (params.get('q') || '')) {
      const next = new URLSearchParams(params);
      if (debounced) next.set('q', debounced);
      else next.delete('q');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const hits = useMemo<Hit[]>(() => {
    if (!debounced || !data) return [];
    const match = (...fields: unknown[]) => searchableMatches(debounced, ...fields);
    const out: Hit[] = [];

    const codigoMap = buildIndicadorCodigoMap(data.ind as any);
    for (const i of data.ind) {
      // Guarda-chuva COM subindicadores não é localizável nem vinculável:
      // quem representa o assunto (título + valores) é o subindicador.
      if (hasSubIndicadores(i.nome)) continue;
      if (isDuplicata(codigoMap.get(i.id))) continue;
      const dados = (i as any).dados;
      const dadosStr = typeof dados === 'string' ? dados : JSON.stringify(dados ?? {});
      if (match(i.nome, i.fonte, i.categoria, i.subcategoria, (i as any).analise_interseccional, dadosStr, (i as any).artigos_convencao?.join(' '))) {
        out.push({
          titulo: i.nome,
          trecho: (i as any).analise_interseccional || i.subcategoria || i.categoria || '',
          secao: `Estatísticas › ${abasDoIndicador(i.categoria, i.subcategoria, i.nome, undefined, codigoMap.get(i.id))[0]?.label || 'Somente na base (sem bloco visual)'}`,
          base: 'indicadores_interseccionais',
          fonte: i.fonte,
          link: (() => {
            const codigo = codigoMap.get(i.id);
            const aba = abasDoIndicador(i.categoria, i.subcategoria, i.nome, undefined, codigo)[0];
            return aba && codigo
              ? `/estatisticas?tab=${aba.tabValue}&ind=${encodeURIComponent(codigo)}#ind-${codigo}`
              : `/estatisticas?tab=indicadores-db&ind=${encodeURIComponent(codigo || i.id)}`;
          })(),
        });
      }
    }
    // Sub-indicadores de guarda-chuvas (ex.: "Renda Média Mensal") —
    // encontráveis pelo próprio título, citando o código do guarda-chuva.
    for (const sub of SUB_INDICADORES) {
      const umbrella = data.ind.find((i) => i.nome === sub.guardaChuva);
      const codigo = umbrella ? (codigoMap.get(umbrella.id) || sub.codigo) : sub.codigo;
      if (match(sub.titulo, sub.sub, sub.guardaChuva, codigo, ...(sub.aliases || []))) {
        out.push({
          titulo: `${codigo} · sub: ${sub.sub} — ${sub.titulo}`,
          trecho: `Sub-indicador do registro guarda-chuva "${sub.guardaChuva}"`,
          secao: `Estatísticas › ${sub.abaLabel}`,
          base: 'indicadores_interseccionais',
          fonte: umbrella?.fonte,
          link: `/estatisticas?tab=${sub.tabValue}&serie=${encodeURIComponent(getSubIndicadorAnchor(codigo, sub.sub))}#${getSubIndicadorAnchor(codigo, sub.sub)}`,
        });
      }
    }
    for (const l of data.lac) {
      if (match(l.tema, l.descricao_lacuna, (l as any).texto_original_onu, l.paragrafo, l.grupo_focal, l.eixo_tematico, (l as any).artigos_convencao?.join(' '), l.documento_onu)) {
        out.push({
          titulo: `§${l.paragrafo} — ${l.tema}`,
          trecho: l.descricao_lacuna,
          secao: 'Recomendações ONU',
          base: 'lacunas_identificadas',
          link: `/recomendacoes?id=${encodeURIComponent(l.id)}`,
        });
      }
    }
    for (const n of data.norma) {
      if (match(n.titulo, n.categoria, n.url_origem, (n as any).artigos_convencao?.join(' '))) {
        out.push({
          titulo: n.titulo,
          trecho: `Categoria: ${n.categoria} · Status: ${(n as any).status}`,
          secao: 'Base Normativa',
          base: 'documentos_normativos',
          link: `/normativa?doc=${encodeURIComponent(n.id)}`,
        });
      }
    }
    for (const o of data.orc) {
      if (match(o.programa, o.orgao, o.esfera, o.fonte_dados, (o as any).descritivo, o.eixo_tematico, o.grupo_focal, (o as any).artigos_convencao?.join(' '))) {
        out.push({
          titulo: `${o.programa} — ${o.orgao}`,
          trecho: `${o.esfera} · ${o.ano} · ${(o as any).descritivo || ''}`,
          secao: 'Orçamento',
          base: 'dados_orcamentarios',
          fonte: o.fonte_dados,
          link: `/orcamento?id=${encodeURIComponent(o.id)}`,
        });
      }
    }
    for (const c of data.conc) {
      if (match(c.titulo, c.tipo, (c as any).argumento_central, c.secao_relatorio, (c as any).eixos_tematicos?.join(' '))) {
        out.push({
          titulo: c.titulo,
          trecho: (c as any).argumento_central,
          secao: 'Conclusões Analíticas',
          base: 'conclusoes_analiticas',
          link: `/conclusoes?id=${encodeURIComponent(c.id)}`,
        });
      }
    }
    for (const d of deepLinksRegistry) {
      if (match(d.indicador, d.secao, d.fonte, d.descricao, d.url)) {
        out.push({
          titulo: d.indicador,
          trecho: d.descricao,
          secao: d.secao,
          base: 'Registro de Fontes (deep links)',
          fonte: d.fonte,
          link: d.url,
          externo: true,
        });
      }
    }
    return out;
  }, [debounced, data]);

  const byBase = useMemo(() => {
    const map: Record<string, Hit[]> = {};
    for (const h of hits) (map[h.base] ||= []).push(h);
    return map;
  }, [hits]);

  return (
    <DashboardLayout title="Busca global" subtitle="Pesquise qualquer palavra do sistema — indicadores, recomendações, normativos, orçamento, conclusões e fontes">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Ex.: feminicídio, ADPF 709, Lei 14.553, juventude negra, ODS 18.2…"
              className="pl-11 h-12 text-base"
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {isLoading ? 'Carregando corpus…' : debounced ? `${hits.length} resultado(s) para "${debounced}"` : 'Digite para buscar em todas as bases do sistema.'}
          </p>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</div>
      )}

      {!isLoading && debounced && hits.length === 0 && (
        <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhum resultado encontrado.</CardContent></Card>
      )}

      <div className="space-y-6">
        {Object.entries(byBase).map(([base, items]) => (
          <Card key={base}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center justify-between">
                <span>{base}</span>
                <Badge variant="outline">{items.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.slice(0, 50).map((h, idx) => (
                <div key={idx} className="border-l-2 border-primary/40 pl-3 py-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {highlight(h.titulo, debounced)}
                      </div>
                      {h.trecho && (
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {highlight(h.trecho, debounced)}
                        </div>
                      )}
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        <Badge variant="secondary" className="text-[10px]">{h.secao}</Badge>
                        {h.fonte && <Badge variant="outline" className="text-[10px]">{h.fonte}</Badge>}
                      </div>
                    </div>
                    {h.externo ? (
                      <Button asChild size="sm" variant="ghost">
                        <a href={h.link} target="_blank" rel="noopener noreferrer">
                          Abrir <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    ) : (
                      <Button asChild size="sm" variant="ghost">
                        <Link to={h.link}>Ir para seção</Link>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {items.length > 50 && (
                <p className="text-xs text-muted-foreground">+ {items.length - 50} resultados adicionais nesta base.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}

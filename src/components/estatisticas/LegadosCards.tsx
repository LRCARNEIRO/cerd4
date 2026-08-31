/**
 * LegadosCards — dá endereço próprio (bloco visual) aos registros canônicos
 * que existiam apenas na Base Estatística (sem card em aba temática).
 *
 * Regra de Ouro: NADA é digitado aqui. Os valores vêm exclusivamente de
 * `indicadores_interseccionais` (coluna `dados`), renderizados de forma
 * genérica. Se o registro não existir no banco, o card simplesmente não
 * aparece — nunca inventamos número, ano ou fonte.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface LegadoRow {
  codigo_curto: string | null;
  nome: string;
  fonte: string | null;
  url_fonte: string | null;
  dados: Record<string, unknown> | null;
}

const META_KEYS = new Set(['nota', 'unidade', 'deep_links', 'slug', 'ods_id', 'formato', 'ano', 'ano_referencia']);

const humanize = (key: string) =>
  key
    .replace(/_/g, ' ')
    .replace(/\bpct\b/gi, '%')
    .replace(/\babs\b/gi, '(absoluto)')
    .replace(/^./, c => c.toUpperCase());

const fmt = (v: unknown) => {
  if (typeof v === 'number') {
    return v.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }
  return String(v);
};

interface Linha {
  rotulo: string;
  valor: string;
}

/** Achata o JSON auditado em linhas rótulo → valor, sem transformar números. */
function flatten(dados: Record<string, unknown> | null): Linha[] {
  if (!dados) return [];
  const linhas: Linha[] = [];
  for (const [key, value] of Object.entries(dados)) {
    if (META_KEYS.has(key)) continue;
    if (value === null || value === undefined) continue;
    if (typeof value === 'object' && !Array.isArray(value)) {
      for (const [sub, subValue] of Object.entries(value as Record<string, unknown>)) {
        if (subValue === null || subValue === undefined || typeof subValue === 'object') continue;
        linhas.push({ rotulo: `${humanize(key)} · ${sub}`, valor: fmt(subValue) });
      }
    } else if (!Array.isArray(value)) {
      linhas.push({ rotulo: humanize(key), valor: fmt(value) });
    }
  }
  return linhas;
}

function useLegados(codigos: string[]) {
  return useQuery({
    queryKey: ['legados-cards', codigos.join(',')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indicadores_interseccionais')
        .select('codigo_curto, nome, fonte, url_fonte, dados')
        .in('codigo_curto', codigos);
      if (error) throw error;
      return (data || []) as unknown as LegadoRow[];
    },
    staleTime: 5 * 60 * 1000,
  });
}

interface LegadosBlocoProps {
  /** códigos canônicos (IND-NNN) exibidos nesta aba */
  codigos: string[];
  titulo?: string;
  descricao?: string;
}

export function LegadosBloco({ codigos, titulo = 'Registros complementares da Base Estatística', descricao }: LegadosBlocoProps) {
  const { data = [] } = useLegados(codigos);
  if (!data.length) return null;

  const ordenados = [...data].sort((a, b) =>
    String(a.codigo_curto).localeCompare(String(b.codigo_curto)),
  );

  return (
    <section className="mt-6 space-y-3">
      <div>
        <h3 className="text-base font-semibold">{titulo}</h3>
        <p className="text-xs text-muted-foreground">
          {descricao ||
            'Indicadores auditados que passam a ter endereço próprio nesta aba, podendo ser localizados na busca e vinculados como evidência.'}
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {ordenados.map(row => {
          const codigo = row.codigo_curto || '';
          const linhas = flatten(row.dados);
          const nota = typeof row.dados?.nota === 'string' ? (row.dados.nota as string) : null;
          const unidade = typeof row.dados?.unidade === 'string' ? (row.dados.unidade as string) : null;
          const ano = row.dados?.ano_referencia ?? row.dados?.ano;

          return (
            <Card key={codigo} id={`ind-${codigo}`} data-codigo={codigo} className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-sm leading-snug">{row.nome}</CardTitle>
                  <Badge
                    data-codigo={codigo}
                    data-ind-badge="1"
                    variant="outline"
                    className="font-mono text-[10px] shrink-0"
                    title={`Código canônico do indicador na Base Estatística (${row.nome})`}
                  >
                    {codigo}
                  </Badge>
                </div>
                {(unidade || ano) && (
                  <p className="text-[11px] text-muted-foreground">
                    {[unidade, ano ? `ref. ${ano}` : null].filter(Boolean).join(' · ')}
                  </p>
                )}
              </CardHeader>
              <CardContent className="space-y-2">
                {linhas.length > 0 && (
                  <table className="w-full text-xs">
                    <tbody>
                      {linhas.map(linha => (
                        <tr key={linha.rotulo} className="border-b border-border/50 last:border-0">
                          <td className="py-1 pr-2 text-muted-foreground">{linha.rotulo}</td>
                          <td className="py-1 text-right font-semibold tabular-nums">{linha.valor}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {nota && <p className="text-[11px] text-muted-foreground leading-relaxed">{nota}</p>}
                {row.fonte && (
                  <p className="text-[11px] text-muted-foreground">
                    Fonte: {row.fonte}{' '}
                    {row.url_fonte && (
                      <a
                        href={row.url_fonte}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        abrir <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

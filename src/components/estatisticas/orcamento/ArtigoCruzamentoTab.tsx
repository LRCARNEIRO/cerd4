import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

interface ArtigoCruzamentoTabProps {
  records: DadoOrcamentario[];
}

const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)} bi`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(0)} mi`;
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

/** Infer articles from eixo_tematico when artigos_convencao is empty */
function inferArtigos(r: DadoOrcamentario): ArtigoConvencao[] {
  const explicit = (r.artigos_convencao || []).filter(a => ['I','II','III','IV','V','VI','VII'].includes(a)) as ArtigoConvencao[];
  if (explicit.length > 0) return explicit;

  const eixo = r.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS | undefined;
  if (eixo && EIXO_PARA_ARTIGOS[eixo]) return EIXO_PARA_ARTIGOS[eixo];

  // Keyword-based fallback
  const texto = [r.programa, r.orgao, r.descritivo].filter(Boolean).join(' ').toLowerCase();
  const arts: ArtigoConvencao[] = [];
  if (texto.match(/educa|escola|ensino|formação|lei 10.639/)) arts.push('V', 'VII');
  if (texto.match(/saúde|saude|sesai|sanitár/)) arts.push('V');
  if (texto.match(/trabalho|emprego|renda|profissional/)) arts.push('V');
  if (texto.match(/terra|territór|quilomb|funai|incra|demarcaç/)) arts.push('III', 'V');
  if (texto.match(/justiça|justice|judiciár|proteç|reparaç/)) arts.push('VI');
  if (texto.match(/cultur|patrimôn|capoeira|candomblé|matriz africana/)) arts.push('V', 'VII');
  if (texto.match(/igualdade|discrimin|racis/)) arts.push('I', 'II');
  if (texto.match(/segurança|polícia|homicíd|violência|letal/)) arts.push('V', 'VI');
  if (texto.match(/polític|institucional|ação afirmativa/)) arts.push('II');
  return [...new Set(arts)];
}

function ArtigoGroup({ artigo, records }: { artigo: typeof ARTIGOS_CONVENCAO[0]; records: DadoOrcamentario[] }) {
  const [open, setOpen] = useState(false);

  const programas = useMemo(() => {
    const map = new Map<string, { liquidado: number; pago: number; anos: Set<number>; orgao: string }>();
    for (const r of records) {
      const key = r.programa;
      const existing = map.get(key) || { liquidado: 0, pago: 0, anos: new Set<number>(), orgao: r.orgao };
      existing.liquidado += Number(r.liquidado) || 0;
      existing.pago += Number(r.pago) || 0;
      existing.anos.add(r.ano);
      map.set(key, existing);
    }
    return Array.from(map.entries())
      .map(([prog, data]) => ({ prog, ...data }))
      .sort((a, b) => b.liquidado - a.liquidado);
  }, [records]);

  const totalLiq = programas.reduce((s, p) => s + p.liquidado, 0);
  const sample = open ? programas : programas.slice(0, 5);

  return (
    <Card>
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left p-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
              style={{ backgroundColor: artigo.cor }}
            >
              {artigo.numero}
            </span>
            <div>
              <p className="font-semibold text-sm">{artigo.tituloCompleto}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {programas.length} programas/ações · Liquidado total: {formatCompact(totalLiq)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{records.length} reg.</Badge>
            {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </button>

      {(open || programas.length <= 5) && (
        <CardContent className="pt-0 border-t">
          <div className="divide-y">
            {sample.map(p => (
              <div key={p.prog} className="py-2 flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{p.prog}</p>
                  <p className="text-[10px] text-muted-foreground">{p.orgao} · {Array.from(p.anos).sort().join(', ')}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs font-semibold">{formatCompact(p.liquidado)}</p>
                  <p className="text-[10px] text-muted-foreground">liquidado</p>
                </div>
              </div>
            ))}
          </div>
          {!open && programas.length > 5 && (
            <button onClick={() => setOpen(true)} className="text-xs text-primary hover:underline mt-2">
              Ver todos os {programas.length} programas
            </button>
          )}
        </CardContent>
      )}
    </Card>
  );
}

export function ArtigoCruzamentoTab({ records }: ArtigoCruzamentoTabProps) {
  const byArtigo = useMemo(() => {
    const map = new Map<ArtigoConvencao, DadoOrcamentario[]>();
    for (const art of ARTIGOS_CONVENCAO) map.set(art.numero, []);

    for (const r of records) {
      const arts = inferArtigos(r);
      for (const a of arts) {
        map.get(a)?.push(r);
      }
    }
    return map;
  }, [records]);

  const unmapped = useMemo(() => {
    return records.filter(r => inferArtigos(r).length === 0);
  }, [records]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Scale className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-sm">Cruzamento Orçamento × Artigos da Convenção ICERD</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Mapeamento automático dos programas e ações orçamentárias aos artigos I–VII da Convenção,
        baseado nos eixos temáticos e palavras-chave. Facilita a análise sem alterar os dados encontrados.
      </p>

      <div className="space-y-3">
        {ARTIGOS_CONVENCAO.map(art => {
          const recs = byArtigo.get(art.numero) || [];
          if (recs.length === 0) return (
            <Card key={art.numero} className="opacity-50">
              <CardContent className="py-3 flex items-center gap-3">
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-primary-foreground"
                  style={{ backgroundColor: art.cor }}
                >
                  {art.numero}
                </span>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{art.titulo}</p>
                  <p className="text-xs text-muted-foreground">Nenhum programa mapeado</p>
                </div>
              </CardContent>
            </Card>
          );
          return <ArtigoGroup key={art.numero} artigo={art} records={recs} />;
        })}
      </div>

      {unmapped.length > 0 && (
        <Card className="border-dashed">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs text-muted-foreground">
              {unmapped.length} registros sem mapeamento automático
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {[...new Set(unmapped.map(r => r.programa))].slice(0, 10).map(p => (
                <Badge key={p} variant="outline" className="text-[10px]">{p}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

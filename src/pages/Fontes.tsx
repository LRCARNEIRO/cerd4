import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { useIndicadoresInterseccionais, useOrcamentoCanonico } from '@/hooks/useLacunasData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { buildRolEstatistico } from '@/utils/rolEstatisticoCanonico';
import { portalFromUrl, hostFromUrl } from '@/utils/fonteOrigem';
import { construirCatalogoFontes, type BaseFonte } from '@/utils/fontesCatalogo';
import { isDuplicata } from '@/utils/indicadorAliases';
import { Search, Globe, Download, ExternalLink, Library, ChevronDown, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';
import inventarioAsset from '@/assets/inventario-v19.xlsx.asset.json';

function enderecoLegivel(url: string) {
  try {
    const endereco = new URL(url);
    const caminho = decodeURIComponent(endereco.pathname).replace(/\/$/, '');
    return `${hostFromUrl(url)}${caminho === '' ? '' : caminho}`;
  } catch { return url; }
}

type Base = BaseFonte;

export default function Fontes() {
  const [searchTerm, setSearchTerm] = useState('');
  const [baseSelecionada, setBaseSelecionada] = useState<Base | 'Todas'>('Todas');
  const { data: indicadores = [], isLoading: loadingIndicadores } = useIndicadoresInterseccionais();

  const { data: orcamento = [], isLoading: loadingOrc } = useOrcamentoCanonico();
  const { data: normativos = [], isLoading: loadingNorm } = useQuery({
    queryKey: ['fontes-normativos'],
    queryFn: async () => (await supabase.from('documentos_normativos').select('titulo, url_origem')).data || [],
  });
  const rol = useMemo(() => buildRolEstatistico(indicadores as any[]), [indicadores]);

  const fontesDaBase = useMemo(() => construirCatalogoFontes([
    ...indicadores.filter(ind => !isDuplicata(ind.codigo)).map(ind => ({ nome: ind.fonte, url: ind.url_fonte, base: 'Estatística' as const })),
    ...orcamento.map(o => ({ nome: o.fonte_dados, url: o.url_fonte, base: 'Orçamentária' as const })),
    ...normativos.map(n => ({ nome: n.titulo, url: n.url_origem, base: 'Normativa' as const })),
  ]), [indicadores, orcamento, normativos]);
  const porBase = (b: Base) => fontesDaBase.filter(f => f.base === b).length;
  const carregandoBases = loadingIndicadores || loadingOrc || loadingNorm;
  const termo = searchTerm.trim().toLocaleLowerCase('pt-BR');
  const fontesFiltradas = fontesDaBase.filter(fonte => {
    if (baseSelecionada !== 'Todas' && fonte.base !== baseSelecionada) return false;
    return !termo || [fonte.nome, fonte.instituicao, ...fonte.urls,
      ...fonte.portais.flatMap(portal => [portal.nome, portal.orgao])]
      .some(texto => texto.toLocaleLowerCase('pt-BR').includes(termo));
  });
  const totalEnderecos = new Set(fontesDaBase.flatMap(fonte => fonte.urls)).size;
  const totalPortais = new Set(fontesDaBase.flatMap(fonte => fonte.portais.map(p => p.host))).size;
  const semEndereco = fontesDaBase.filter(fonte => fonte.urls.length === 0).length;
  const grupos = [...new Set(fontesFiltradas.map(f => f.instituicao))].sort((a, b) => {
    const prioritarios = ['IBGE', 'INEP', 'DataSUS / Ministério da Saúde'];
    const ia = prioritarios.indexOf(a), ib = prioritarios.indexOf(b);
    if (ia >= 0 || ib >= 0) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    return a.localeCompare(b, 'pt-BR');
  });
  const totalInventario = rol.total + orcamento.length + normativos.length;
  const filtros: Array<Base | 'Todas'> = ['Todas', 'Estatística', 'Orçamentária', 'Normativa'];

  return (
    <DashboardLayout title="Fontes de Dados" subtitle="Instituições, portais e publicações utilizados nas três bases de evidências">
      <div className="flex justify-end mb-3">
        <ExportTabButtons targetSelector="#export-fontes-dados" fileName="Fontes-de-Dados" compact />
      </div>
      <div id="export-fontes-dados">
        <section className="border-b pb-6 mb-6">
          <div className="flex items-center gap-2 text-primary mb-3">
            <Library className="h-5 w-5" />
            <span className="text-xs font-semibold uppercase tracking-normal">Acervo de fontes · CERD IV</span>
          </div>
          <h2 className="text-3xl font-bold mb-3">Fontes que sustentam as evidências</h2>
          <p className="text-muted-foreground max-w-3xl">
            Instituições e endereços de origem das evidências estatísticas, orçamentárias e normativas do inventário.
          </p>
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-6">
            {[
              ['Denominações estatísticas', porBase('Estatística')],
              ['Portais de acesso', totalPortais],
              ['Endereços de origem', totalEnderecos],
              ['Evidências no inventário', totalInventario],
            ].map(([rotulo, valor]) => (
              <div key={rotulo} className="border-l-2 border-primary/30 pl-4">
                <dd className="text-3xl font-semibold text-primary tabular-nums">{carregandoBases ? '…' : valor}</dd>
                <dt className="text-sm text-muted-foreground mt-1">{rotulo}</dt>
              </div>
            ))}
          </dl>
        </section>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filtrar fontes por base">
            {filtros.map(base => (
              <Button key={base} variant={baseSelecionada === base ? 'default' : 'outline'}
                aria-pressed={baseSelecionada === base} onClick={() => setBaseSelecionada(base)}>
                {base} <span className="ml-2 text-xs tabular-nums">{carregandoBases ? '…' : base === 'Todas' ? fontesDaBase.length : porBase(base)}</span>
              </Button>
            ))}
          </div>
          <div className="relative w-full xl:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input aria-label="Buscar fontes" placeholder="Buscar fonte, instituição ou portal…"
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-9" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 mb-4">
          <h3 className="text-lg font-semibold">{baseSelecionada === 'Todas' ? 'Diretório de fontes' : `Fontes da Base ${baseSelecionada}`}</h3>
          <span className="text-sm text-muted-foreground" aria-live="polite">{carregandoBases ? 'Carregando…' : `${fontesFiltradas.length} ${fontesFiltradas.length === 1 ? 'referência' : 'referências'}`}</span>
        </div>
        {carregandoBases && <p className="py-12 text-center text-muted-foreground">Carregando fontes das três bases…</p>}
        {!carregandoBases && fontesFiltradas.length === 0 && <p className="py-12 text-center text-muted-foreground">Nenhuma fonte encontrada.</p>}
        <div className="space-y-8">
          {grupos.map(grupo => <section key={grupo} aria-label={grupo}>
            <div className="flex items-center gap-3 border-b pb-3 mb-4">
              <Landmark className="h-5 w-5 text-primary shrink-0" />
              <h3 className="text-lg font-semibold break-words">{grupo}</h3>
              <Badge variant="secondary" className="ml-auto shrink-0">{fontesFiltradas.filter(f => f.instituicao === grupo).length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {fontesFiltradas.filter(f => f.instituicao === grupo).map(fonte => {
            const urls = [...fonte.urls];
            const principal = urls[0];
            return (
              <Card key={fonte.chave} data-source-base={fonte.base} className="flex flex-col overflow-hidden hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                      {fonte.base === 'Normativa' ? <Landmark className="h-6 w-6" /> : <Library className="h-6 w-6" />}
                    </div>
                    <div className="flex flex-wrap justify-end gap-1">
                      <Badge variant="outline" className="text-xs">{fonte.base}</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-snug break-words">{fonte.nome}</CardTitle>
                  {fonte.portais.map(portal => <p key={portal.host} className="text-xs text-muted-foreground break-words flex items-start gap-2"><Globe className="h-3.5 w-3.5 shrink-0 mt-0.5" />Disponível por {portal.nome}</p>)}
                  {!principal && <Badge variant="outline" className="text-warning border-warning/40 w-fit">Endereço não registrado</Badge>}
                </CardHeader>
                <CardContent className="flex flex-col flex-1 pt-0">
                  <div className="flex items-center justify-between gap-3 mt-auto border-t pt-4">
                    <span className="text-xs text-muted-foreground">{urls.length > 0 ? `${urls.length} ${urls.length === 1 ? 'endereço' : 'endereços'}` : 'Fonte preservada no inventário'}</span>
                    {principal && <Button variant="outline" size="sm" asChild>
                      <a href={principal} target="_blank" rel="noopener noreferrer" aria-label={`Acessar ${fonte.nome}`}>
                        Acessar fonte <ExternalLink className="h-3.5 w-3.5 ml-2" />
                      </a>
                    </Button>}
                  </div>
                  {principal && <details className="mt-4 group">
                    <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-primary list-none">
                      Endereços consultados <ChevronDown className="h-4 w-4 group-open:rotate-180 transition-transform" />
                    </summary>
                    <ul className="mt-3 space-y-3 max-h-64 overflow-auto">
                      {urls.map(url => (
                        <li key={url}>
                          <a href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-start gap-2 text-xs text-muted-foreground hover:text-primary">
                            <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                            <span className="break-all">{enderecoLegivel(url)}</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>}
                </CardContent>
              </Card>
            );
          })}
            </div>
          </section>)}
        </div>
        <section className="border-t mt-8 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-semibold">Inventário das três bases</h3>
            <p className="text-sm text-muted-foreground mt-1">Evidências estatísticas, orçamentárias e normativas na planilha auditada.</p>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <a href={inventarioAsset.url} download={inventarioAsset.original_filename}>
              <Download className="h-4 w-4 mr-2" /> Baixar inventário (XLSX)
            </a>
          </Button>
        </section>
        {!carregandoBases && semEndereco > 0 && (
          <p className="text-xs text-muted-foreground mt-4">{semEndereco} referências sem endereço registrado, preservadas no diretório.</p>
        )}
      </div>
    </DashboardLayout>
  );
}

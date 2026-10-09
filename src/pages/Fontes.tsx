import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { useIndicadoresInterseccionais, useOrcamentoCanonico } from '@/hooks/useLacunasData';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { buildRolEstatistico } from '@/utils/rolEstatisticoCanonico';
import { hostFromUrl } from '@/utils/fonteOrigem';
import { construirCatalogoFontes, agruparFontesPorPortal, type BaseFonte } from '@/utils/fontesCatalogo';
import { isDuplicata } from '@/utils/indicadorAliases';
import { Search, Globe, Download, ExternalLink, Library, Landmark, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';
import inventarioAsset from '@/assets/inventario-v19.xlsx.asset.json';
import { exportFontesWorkbook, type VinculoFonteExport } from '@/utils/exportFontesWorkbook';
import { toast } from 'sonner';

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
  const [exportando, setExportando] = useState(false);
  const [baseSelecionada, setBaseSelecionada] = useState<Base | 'Todas'>('Todas');
  const { data: indicadores = [], isLoading: loadingIndicadores } = useIndicadoresInterseccionais();

  const { data: orcamento = [], isLoading: loadingOrc } = useOrcamentoCanonico();
  const { data: normativos = [], isLoading: loadingNorm } = useQuery({
    queryKey: ['fontes-normativos-completos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('documentos_normativos').select('id, titulo, url_origem');
      if (error) throw error;
      return data || [];
    },
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
  const portaisFiltrados = agruparFontesPorPortal(fontesFiltradas);
  const grupos = [...new Set(portaisFiltrados.map(f => f.instituicao))].sort((a, b) => {
    const prioritarios = ['IBGE', 'INEP', 'DataSUS / Ministério da Saúde'];
    const ia = prioritarios.indexOf(a), ib = prioritarios.indexOf(b);
    if (ia >= 0 || ib >= 0) return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
    return a.localeCompare(b, 'pt-BR');
  });
  const totalInventario = rol.total + orcamento.length + normativos.length;
  const filtros: Array<Base | 'Todas'> = ['Todas', 'Estatística', 'Orçamentária', 'Normativa'];
  async function baixarFontes() {
    setExportando(true);
    try {
      const estatisticas: VinculoFonteExport[] = rol.itens.map(item => {
        const registro = indicadores.find(ind => ind.id === item.key || ind.codigo === item.codigo.split(' · ')[0]);
        return { base: 'Estatística', fonte: item.fonte, url: registro?.url_fonte || '', codigo: item.codigo,
          nome: item.titulo, detalhe: item.detalhe };
      });
      await exportFontesWorkbook(fontesDaBase, [
        ...estatisticas,
        ...orcamento.map(o => ({ base: 'Orçamentária' as const, fonte: o.fonte_dados, url: o.url_fonte || '',
          codigo: o.programa, nome: o.descritivo || o.programa, programa: o.programa, orgao: o.orgao, ano: o.ano })),
        ...normativos.map(n => ({ base: 'Normativa' as const, fonte: n.titulo, url: n.url_origem || '', codigo: n.id, nome: n.titulo })),
      ]);
    } catch { toast.error('Não foi possível gerar a planilha de fontes. Tente novamente.'); }
    finally { setExportando(false); }
  }

  return (
    <DashboardLayout title="Fontes de Dados" subtitle="Instituições, portais e publicações utilizados nas três bases de evidências">
      <div className="flex flex-wrap justify-end gap-2 mb-3">
        <Button variant="outline" size="sm" disabled={carregandoBases || exportando} onClick={baixarFontes}>
          <Download className="h-4 w-4 mr-2" />{exportando ? 'Gerando planilha…' : 'Baixar fontes completas (XLSX)'}
        </Button>
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
              <Badge variant="secondary" className="ml-auto shrink-0">{portaisFiltrados.filter(f => f.instituicao === grupo).length} cartões</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {portaisFiltrados.filter(f => f.instituicao === grupo).map(portal => {
            return (
              <Card key={portal.chave} data-source-base={portal.base} className="flex h-[420px] flex-col overflow-hidden hover:border-primary/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-secondary text-primary">
                      <Globe className="h-6 w-6" />
                    </div>
                    <div className="flex flex-wrap justify-end gap-1">
                      <Badge variant="outline" className="text-xs">{portal.base}</Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-snug break-words line-clamp-2 min-h-12" title={portal.nome}>{portal.nome}</CardTitle>
                  <p className="text-xs text-muted-foreground">{portal.fontes.length} {portal.fontes.length === 1 ? 'denominação de fonte' : 'denominações de fontes'}</p>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 min-h-0 pt-0">
                  <ul className="divide-y border-t flex-1 min-h-0 overflow-y-auto pr-2" aria-label={`Fontes de ${portal.nome}`}>
                    {portal.fontes.map(fonte => <li key={fonte.chave} className="py-4 space-y-2">
                      <h4 className="text-sm font-semibold break-words">{fonte.nome}</h4>
                      {fonte.urls.length === 0 && <span className="text-xs text-warning">Endereço não registrado</span>}
                      {fonte.urls.map(url => <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                        aria-label={`Acessar ${fonte.nome}: ${enderecoLegivel(url)}`}
                        className="flex items-start gap-2 text-xs text-primary hover:underline">
                        <ExternalLink className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span className="break-all">{enderecoLegivel(url)}</span>
                      </a>)}
                    </li>)}
                  </ul>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="mt-3 w-full shrink-0" aria-label={`Ver todas as fontes de ${portal.nome}`}>
                        <List className="h-4 w-4 mr-2" />Ver todas ({portal.fontes.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl w-[calc(100%-2rem)] max-h-[85vh] flex flex-col">
                      <DialogHeader className="shrink-0 pr-6">
                        <DialogTitle className="leading-snug tracking-normal">{portal.nome}</DialogTitle>
                        <DialogDescription>{portal.base} · {portal.fontes.length} denominações de fontes</DialogDescription>
                      </DialogHeader>
                      <ul className="divide-y overflow-y-auto min-h-0 pr-2">
                        {portal.fontes.map(fonte => <li key={fonte.chave} className="py-4 space-y-2">
                          <h4 className="text-sm font-semibold break-words">{fonte.nome}</h4>
                          {fonte.urls.map(url => <a key={url} href={url} target="_blank" rel="noopener noreferrer"
                            className="flex items-start gap-2 text-sm text-primary hover:underline">
                            <ExternalLink className="h-4 w-4 shrink-0 mt-0.5" />
                            <span className="break-all">{enderecoLegivel(url)}</span>
                          </a>)}
                        </li>)}
                      </ul>
                    </DialogContent>
                  </Dialog>
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

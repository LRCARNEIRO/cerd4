import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Building2, MapPin, Users, TreePine, Tent, AlertTriangle, Info } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useDadosOrcamentarios, useOrcamentoStats } from '@/hooks/useLacunasData';
import { OrgaoSection } from './orcamento/OrgaoSection';
import { ProgramCard } from './orcamento/ProgramCard';
import { EmptyEsferaCard } from './orcamento/EmptyEsferaCard';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

/** Classify a record into thematic categories based on orgao + program name */
function classifyRecord(r: DadoOrcamentario): string[] {
  const cats: string[] = [];
  const prog = r.programa.toLowerCase();
  const orgao = r.orgao.toUpperCase();
  const obs = (r.observacoes || '').toLowerCase();

  // SESAI — segregated from indigenous total
  if (orgao === 'SESAI' || obs.includes('saúde indígena') || obs.includes('sesai') ||
      prog.includes('20yp') || prog.includes('7684')) {
    cats.push('sesai');
    cats.push('federal_geral'); // SESAI compõe o somatório federal
    return cats;
  }

  // Indígena (excluding SESAI)
  if (['FUNAI', 'MPI'].includes(orgao) ||
      prog.includes('indigen') || prog.includes('indígen') ||
      prog.includes('2065') || prog.includes('0617') || prog.includes('5136')) {
    cats.push('indigena');
  }

  // Quilombola
  if (prog.includes('quilomb') || prog.includes('20g7') || prog.includes('0859')) {
    cats.push('quilombola');
  }

  // Ciganos/Romani
  if (prog.includes('cigano') || prog.includes('romani') || prog.includes('povo cigano')) {
    cats.push('ciganos');
  }

  // If no thematic match, it's general federal
  if (cats.length === 0) cats.push('federal_geral');

  return cats;
}

/** Group records: orgao → programa → records[] */
function groupByOrgaoPrograma(records: DadoOrcamentario[]): Map<string, Map<string, DadoOrcamentario[]>> {
  const result = new Map<string, Map<string, DadoOrcamentario[]>>();
  for (const item of records) {
    if (!result.has(item.orgao)) result.set(item.orgao, new Map());
    const orgaoMap = result.get(item.orgao)!;
    if (!orgaoMap.has(item.programa)) orgaoMap.set(item.programa, []);
    orgaoMap.get(item.programa)!.push(item);
  }
  return result;
}

function countPrograms(grouped: Map<string, Map<string, DadoOrcamentario[]>>): number {
  let count = 0;
  grouped.forEach(orgao => { count += orgao.size; });
  return count;
}

function sumField(records: DadoOrcamentario[], field: 'pago' | 'dotacao_autorizada' | 'empenhado'): number {
  return records.reduce((acc, r) => acc + ((r as any)[field] || 0), 0);
}

function sumPago(records: DadoOrcamentario[]): number {
  return sumField(records, 'pago');
}

function sumDotacao(records: DadoOrcamentario[]): number {
  return sumField(records, 'dotacao_autorizada');
}

const formatCompact = (value: number) => {
  if (value >= 1_000_000_000) return `R$ ${(value / 1_000_000_000).toFixed(1)} bi`;
  if (value >= 1_000_000) return `R$ ${(value / 1_000_000).toFixed(0)} mi`;
  if (value === 0) return 'R$ 0';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
};

interface TabConfig {
  value: string;
  label: string;
  icon: React.ReactNode;
  emptyDesc: string;
}

const TABS: TabConfig[] = [
  { value: 'federal', label: 'Programas Federais', icon: <Building className="w-4 h-4" />, emptyDesc: 'Nenhum dado federal encontrado.' },
  { value: 'indigena', label: 'Povos Indígenas', icon: <TreePine className="w-4 h-4" />, emptyDesc: 'Nenhum programa com foco em povos indígenas encontrado.' },
  { value: 'quilombola', label: 'Quilombolas', icon: <Users className="w-4 h-4" />, emptyDesc: 'Nenhum programa com foco em quilombolas encontrado.' },
  { value: 'ciganos', label: 'Ciganos', icon: <Tent className="w-4 h-4" />, emptyDesc: 'Nenhum programa com foco em povos ciganos encontrado.' },
  { value: 'sesai', label: 'SESAI (Saúde Indígena)', icon: <AlertTriangle className="w-4 h-4" />, emptyDesc: 'Nenhum dado SESAI encontrado.' },
  { value: 'estadual', label: 'Estaduais', icon: <Building2 className="w-4 h-4" />, emptyDesc: 'Dados estaduais ainda não coletados. Utilize SICONFI/RREO dos portais de transparência estaduais.' },
  { value: 'municipal', label: 'Municipais', icon: <MapPin className="w-4 h-4" />, emptyDesc: 'Dados municipais ainda não coletados. Utilize portais de transparência municipais.' },
];

export function OrcamentoTab() {
  const { data: dadosOrcamentarios, isLoading: orcLoading } = useDadosOrcamentarios();
  const { data: stats, isLoading: statsLoading } = useOrcamentoStats();

  const categorized = useMemo(() => {
    if (!dadosOrcamentarios) return {
      federal: [] as DadoOrcamentario[],
      indigena: [] as DadoOrcamentario[],
      quilombola: [] as DadoOrcamentario[],
      ciganos: [] as DadoOrcamentario[],
      sesai: [] as DadoOrcamentario[],
      estadual: [] as DadoOrcamentario[],
      municipal: [] as DadoOrcamentario[],
    };

    const buckets: Record<string, DadoOrcamentario[]> = {
      federal: [], indigena: [], quilombola: [], ciganos: [], sesai: [], estadual: [], municipal: [],
    };

    for (const item of dadosOrcamentarios) {
      // Esfera-based routing
      if (item.esfera === 'estadual') { buckets.estadual.push(item); continue; }
      if (item.esfera === 'municipal') { buckets.municipal.push(item); continue; }

      const cats = classifyRecord(item);

      // SESAI goes to sesai bucket AND to federal total (included in calculations)
      if (cats.includes('sesai')) {
        buckets.sesai.push(item);
        buckets.federal.push(item);
        continue;
      }

      // SEPPIR always included. MIR bypass only for ano >= 2023.
      const orgaoUpper = (item.orgao || '').toUpperCase();
      const isSeppir = orgaoUpper === 'SEPPIR';
      const isMirLike = orgaoUpper === 'MIR' || orgaoUpper.includes('IGUALDADE RACIAL') || orgaoUpper.includes('MIR/');
      const isMirPost2023 = isMirLike && item.ano >= 2023;

      // Program 5034: exclude non-racial actions unless from SEPPIR or MIR post-2023
      if (item.programa.toLowerCase().includes('5034') && !isSeppir && !isMirPost2023) {
        // Pre-2023 "MIR": publico_alvo unreliable (ingestion error) — check only programa+descritivo
        const isMirPre2023 = isMirLike && item.ano < 2023;
        const campos = isMirPre2023 ? [item.programa, item.descritivo] : [item.programa, item.descritivo, item.publico_alvo, item.observacoes];
        const texto = campos.filter(Boolean).join(' ').toLowerCase();
        const hasRacialKw = ['racial', 'racismo', 'negro', 'negra', 'afro', 'quilomb', 'indigen', 'cigan', 'romani', 'terreiro', 'matriz africana', 'igualdade racial', 'palmares', 'capoeira', 'candomblé', 'umbanda'].some(kw => texto.includes(kw));
        if (!hasRacialKw) continue;
      }

      // Federal: all non-SESAI, non-5034/2020 go to federal tab + thematic tabs
      buckets.federal.push(item);

      for (const cat of cats) {
        if (cat !== 'federal_geral' && buckets[cat]) {
          buckets[cat].push(item);
        }
      }
    }

    return buckets;
  }, [dadosOrcamentarios]);

  const grouped = useMemo(() => {
    const result: Record<string, Map<string, Map<string, DadoOrcamentario[]>>> = {};
    for (const [key, records] of Object.entries(categorized)) {
      result[key] = groupByOrgaoPrograma(records);
    }
    return result;
  }, [categorized]);

  const isLoading = orcLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary cards — nuanced with dotação vs pago */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Política Racial (Federal)', sub: 'Inclui SESAI', dotacao: sumDotacao(categorized.federal), pago: sumPago(categorized.federal), count: categorized.federal.length, color: 'border-l-primary' },
          { label: 'Povos Indígenas', sub: 'FUNAI / MPI', dotacao: sumDotacao(categorized.indigena), pago: sumPago(categorized.indigena), count: categorized.indigena.length, color: 'border-l-chart-2' },
          { label: 'Quilombolas', sub: 'INCRA / Ações 20G7', dotacao: sumDotacao(categorized.quilombola), pago: sumPago(categorized.quilombola), count: categorized.quilombola.length, color: 'border-l-chart-3' },
          { label: 'Ciganos', sub: 'Povo Cigano / Romani', dotacao: sumDotacao(categorized.ciganos), pago: sumPago(categorized.ciganos), count: categorized.ciganos.length, color: 'border-l-chart-4' },
          { label: 'Variação 2018-22 vs 23-26', sub: 'Dotação comparada', dotacao: null, pago: null, count: null, variacao: stats?.variacao, color: stats && stats.variacao > 0 ? 'border-l-success' : 'border-l-destructive' },
        ].map((card, i) => (
          <Card key={i} className={`border-l-4 ${card.color}`}>
            <CardContent className="pt-3 pb-3 px-4">
              <p className="text-[11px] font-medium text-foreground leading-tight">{card.label}</p>
              <p className="text-[10px] text-muted-foreground">{card.sub}</p>
              {card.variacao !== undefined ? (
                <>
                  <p className="text-lg font-bold mt-1">{card.variacao && card.variacao > 0 ? '+' : ''}{card.variacao?.toFixed(1)}%</p>
                </>
              ) : (
                <div className="mt-1.5 space-y-0.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-muted-foreground">Dotação</span>
                    <span className="text-xs font-semibold">{formatCompact(card.dotacao || 0)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-[10px] text-muted-foreground">Pago</span>
                    <span className="text-xs font-bold text-primary">{formatCompact(card.pago || 0)}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{card.count} registros</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Nota Metodológica */}
      <Collapsible>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4 pb-3">
            <CollapsibleTrigger className="flex items-start gap-2 w-full text-left">
              <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-foreground">Nota Metodológica — Série Orçamentária</h4>
                <p className="text-xs text-muted-foreground mt-1">Clique para expandir limitações e contexto interpretativo dos dados.</p>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3 ml-7 space-y-3">
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Estratégia de Coleta — 4 Camadas Independentes
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li><strong>Camada 1 — Programas Temáticos do PPA:</strong> Consulta direta por código de programa finalístico: 2034 (SEPPIR, PPA 2016-2019), 5034 (MDHC/MIR, desde 2020), 0617 (Povos Indígenas PPA 2020-2023), 2065 (Povos Indígenas PPA 2012-2019), 5136 (Povos Indígenas PPA 2024+), 5802/5803/5804 (MIR, desde 2024), 0153 (Criança/Adolescente).</li>
                  <li><strong>Camada 2 — Subfunção 422:</strong> Direitos Individuais, Coletivos e Difusos. Captura ações não vinculadas aos programas acima, validadas por palavras-chave raciais/étnicas.</li>
                  <li><strong>Camada 3 — Órgãos com Mandato Direto:</strong> MIR (67000) e MPI (92000). Captura toda despesa desses órgãos, deduplicada contra camadas anteriores.</li>
                  <li><strong>Camada 4 — Ações Específicas SESAI:</strong> Consulta direta por código de ação (20YP e 7684). Necessária porque a SESAI migrou do programa indígena (2065/0617) para o programa de saúde (5022) no PPA 2020-2023, ficando fora das Camadas 1-3.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Transição de Códigos de Programa — PPA a PPA
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li><strong>Povos Indígenas:</strong> 2065 (PPA 2012-2019) → 0617 (PPA 2020-2023) → 5136 (PPA 2024-2027). Auditoria confirmou que o programa 2065 não retorna dados após 2019 na API; o código 0617 foi identificado como substituto exato.</li>
                  <li><strong>SESAI (Saúde Indígena):</strong> Ações 20YP/7684 estavam sob programa 2065 em 2018-2019. No PPA 2020-2023 migraram para programa 5022 (Saúde). A Camada 4 resolve isso buscando diretamente por código de ação.</li>
                  <li><strong>Política Racial:</strong> 2034 (SEPPIR, PPA 2016-2019) → 5034 (MDHC guarda-chuva, PPA 2020-2023) → 5804 (MIR, PPA 2024+). O 5034 exige filtragem por palavras-chave raciais para excluir ações genéricas do MDHC.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Padrão da Série (2018–2025)
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li><strong>2018–2019:</strong> Base de R$ 93–123 mi (excluindo SESAI) — política racial modesta sob SEPPIR/MMFDH. SESAI: ~R$ 1,37–1,47 bi (20YP) + R$ 23–29 mi (7684). FUNAI: 5 ações, ~R$ 30–38 mi.</li>
                  <li><strong>2020–2023:</strong> Programa 5034 era guarda-chuva do MDHC; apenas ações com palavras-chave raciais incluídas. FUNAI/MPI: capturados via programa 0617. SESAI: capturada via Camada 4 (ação 20YP/7684 → programa 5022).</li>
                  <li><strong>2021–2022:</strong> Queda real de dotação para R$ 161–173 mi — desmonte institucional da pauta racial.</li>
                  <li><strong>2023:</strong> Salto para R$ 457 mi — criação do MIR e reconstrução da pauta racial.</li>
                  <li><strong>2024–2025:</strong> Novos programas focalizados: 5802 (Quilombolas/Ciganos), 5803 (Juventude Negra), 5804 (Igualdade Étnico-Racial). FUNAI/MPI: programa 5136.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Tratamento de Distorções
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li><strong>Bypass Temporal MIR pré-2023:</strong> A API retroativamente rotula registros do MDHC como MIR (órgão 67000). Para anos &lt; 2023, ações genéricas do MDHC (0E85, 14XS, 00SN, 21AR, 21AS, 21AT, 21AU) são excluídas; demais ações exigem palavras-chave raciais nos campos programa/ação.</li>
                  <li><strong>SESAI Incluída no Cálculo:</strong> Com a correção da cobertura 2020-2023 (Camada 4), os dados de saúde indígena (~R$ 1,3–1,5 bi/ano) são computados nos totais de política racial federal e exibidos também em aba separada para análise detalhada.</li>
                  <li><strong>Programa 5113 (Educação Superior):</strong> Excluído por ser genérico (R$ 14 bi).</li>
                  <li><strong>Programas Transversais:</strong> Bolsa Família (2068), MCMV (2049), SUS (2012), SUAS (2015) e Fundo Eleitoral (6012) excluídos como falsos positivos.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" /> Dotação LOA — Complementação via Dados Abertos
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li>A API REST do Portal da Transparência não fornece valores de <strong>Dotação Inicial (LOA)</strong>.</li>
                  <li>Os valores são obtidos dos arquivos ZIP/CSV do Portal de Dados Abertos, processados pela função <em>ingest-dotacao-loa</em>.</li>
                  <li>Matching entre execução (API) e dotação (CSV) por chave composta <strong>Código Programa | Código Ação</strong>.</li>
                  <li>Proporção de dotação distribuída entre ações com base no peso relativo do valor pago.</li>
                </ul>
              </div>

              <p className="text-[10px] text-muted-foreground italic mt-2">
                Fonte: API Portal da Transparência + Dados Abertos (CSV/ZIP). Filtro: racial, racismo, indígena, quilombola, cigano, romani, afro, palmares, terreiro, matriz africana. Deduplicação cross-layer por chave orgao|programa|ano.
              </p>
            </CollapsibleContent>
          </CardContent>
        </Card>
      </Collapsible>

      {/* Tabs */}
      <Tabs defaultValue="federal" className="w-full">
        <TabsList className="mb-4 flex-wrap h-auto gap-1">
          {TABS.map(tab => {
            const records = categorized[tab.value] || [];
            const progCount = countPrograms(grouped[tab.value] || new Map());
            return (
              <TabsTrigger key={tab.value} value={tab.value} className="gap-1.5">
                {tab.icon}
                {tab.label}
                {progCount > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">{progCount}</Badge>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {TABS.map(tab => {
          const tabGrouped = grouped[tab.value] || new Map();
          return (
            <TabsContent key={tab.value} value={tab.value}>
              {tabGrouped.size > 0 ? (
                <div className="space-y-8">
                  {Array.from(tabGrouped.entries())
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([orgao, programas]) => (
                      <OrgaoSection key={orgao} orgao={orgao} programas={programas} />
                    ))}
                </div>
              ) : (
                <EmptyEsferaCard
                  esfera={tab.label.toLowerCase()}
                  descricao={tab.emptyDesc}
                />
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

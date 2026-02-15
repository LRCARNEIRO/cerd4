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
    return cats; // SESAI is always separate
  }

  // Indígena (excluding SESAI)
  if (['FUNAI', 'MPI'].includes(orgao) ||
      prog.includes('indigen') || prog.includes('indígen') ||
      prog.includes('2065')) {
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

      // SESAI goes only to sesai bucket, NOT to federal total
      if (cats.includes('sesai')) {
        buckets.sesai.push(item);
        continue;
      }

      // MIR/SEPPIR programs are ALWAYS included — skip ALL exclusion filters
      const orgaoUpper = (item.orgao || '').toUpperCase();
      const isMirSeppir = orgaoUpper === 'MIR' || orgaoUpper === 'SEPPIR' || orgaoUpper.includes('IGUALDADE RACIAL') || orgaoUpper.includes('MIR/');

      // Program 5034 from MDHC (any year): exclude unless action has racial keywords
      if (item.programa.toLowerCase().includes('5034') && !isMirSeppir) {
        const texto = [item.programa, item.descritivo, item.publico_alvo, item.observacoes].filter(Boolean).join(' ').toLowerCase();
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
          { label: 'Política Racial (Federal)', sub: 'Exclui SESAI', dotacao: sumDotacao(categorized.federal), pago: sumPago(categorized.federal), count: categorized.federal.length, color: 'border-l-primary' },
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
                  <Info className="w-3.5 h-3.5" /> Padrão da Série (2018–2025)
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li><strong>2018–2019:</strong> Base de R$ 93–123 mi (excluindo SESAI) — política racial modesta sob SEPPIR/MMFDH.</li>
                  <li><strong>2020:</strong> Dotação de R$ 215 mi, mas pago de R$ 578 mi — o programa 5034 era guarda-chuva do MDHC (incluía políticas de mulheres, idosos, etc., nem tudo racial).</li>
                  <li><strong>2021–2022:</strong> Queda real para R$ 161–173 mi de dotação — desmonte institucional.</li>
                  <li><strong>2023:</strong> Salto para R$ 457 mi de dotação — criação do MIR e reconstrução da pauta racial.</li>
                  <li><strong>2024–2025:</strong> Dotação de R$ 132–157 mi, mas com novos programas focalizados (5802 Quilombolas, 5803 Juventude Negra, 5804 Igualdade Étnico-Racial) e execução recorde (~99%).</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="text-xs font-semibold text-destructive flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Limitações Identificadas
                </h5>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                  <li><strong>Povos Indígenas (FUNAI/MPI):</strong> Faltam dados de execução para 2020–2023 na API consultada. Lacuna sendo preenchida manualmente via CSV do Portal da Transparência.</li>
                  <li><strong>Quilombolas (INCRA):</strong> Dados de ações 20G7/0859 ausentes para 2020–2023 nos endpoints consultados.</li>
                  <li><strong>SESAI (Saúde Indígena):</strong> Aparece somente em 2018–2019. Dados segregados do total de política racial (informativo).</li>
                  <li><strong>Programa 5034 (2020):</strong> Incluídas apenas ações do MIR ou com palavras-chave raciais; demais ações do guarda-chuva MDHC são excluídas.</li>
                  <li><strong>Programa 5113 (Educação Superior):</strong> Explicitamente excluído por ser genérico e distorcer totais (R$ 14 bi).</li>
                </ul>
                <p className="text-[10px] text-muted-foreground italic mt-2">
                  Série incompleta — dados parciais. Variações percentuais extremas podem refletir hiatos na coleta e não alterações reais de dotação.
                </p>
              </div>
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

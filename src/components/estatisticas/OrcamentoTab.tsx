import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Building, Building2, MapPin, Users, TreePine, Tent } from 'lucide-react';
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

  // Indígena
  if (['FUNAI', 'SESAI', 'MPI'].includes(orgao) ||
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

function sumPago(records: DadoOrcamentario[]): number {
  return records.reduce((acc, r) => acc + (r.pago || 0), 0);
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
      estadual: [] as DadoOrcamentario[],
      municipal: [] as DadoOrcamentario[],
    };

    const buckets: Record<string, DadoOrcamentario[]> = {
      federal: [], indigena: [], quilombola: [], ciganos: [], estadual: [], municipal: [],
    };

    for (const item of dadosOrcamentarios) {
      // Esfera-based routing
      if (item.esfera === 'estadual') { buckets.estadual.push(item); continue; }
      if (item.esfera === 'municipal') { buckets.municipal.push(item); continue; }

      // Federal: all go to federal tab + thematic tabs
      buckets.federal.push(item);

      const cats = classifyRecord(item);
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
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Federal', value: formatCompact(sumPago(categorized.federal)), count: categorized.federal.length, color: 'border-l-primary' },
          { label: 'Povos Indígenas', value: formatCompact(sumPago(categorized.indigena)), count: categorized.indigena.length, color: 'border-l-chart-2' },
          { label: 'Quilombolas', value: formatCompact(sumPago(categorized.quilombola)), count: categorized.quilombola.length, color: 'border-l-chart-3' },
          { label: 'Variação 2018-22 vs 23-26', value: `${stats && stats.variacao > 0 ? '+' : ''}${stats?.variacao.toFixed(1)}%`, count: null, color: stats && stats.variacao > 0 ? 'border-l-success' : 'border-l-destructive' },
        ].map((card, i) => (
          <Card key={i} className={`border-l-4 ${card.color}`}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{card.label}</p>
              <p className="text-xl font-bold">{card.value}</p>
              {card.count !== null && (
                <p className="text-xs text-muted-foreground">{card.count} registros</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

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

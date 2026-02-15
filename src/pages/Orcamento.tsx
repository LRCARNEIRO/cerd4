import { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { DollarSign, TrendingUp, Building, Building2, MapPin, ExternalLink, AlertTriangle, Database, TreePine, Tent, Users, Info, BookOpen, PieChart, EyeOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Checkbox } from '@/components/ui/checkbox';
import { useDadosOrcamentarios, useOrcamentoStats } from '@/hooks/useLacunasData';
import { Skeleton } from '@/components/ui/skeleton';
import { OrgaoSection } from '@/components/estatisticas/orcamento/OrgaoSection';
import { ProgramCard } from '@/components/estatisticas/orcamento/ProgramCard';
import { EmptyEsferaCard } from '@/components/estatisticas/orcamento/EmptyEsferaCard';

import { FederalIngestionPanel } from '@/components/dashboard/FederalIngestionPanel';
import { EstadualIngestionPanel } from '@/components/dashboard/EstadualIngestionPanel';
import { MunicipalIngestionPanel } from '@/components/dashboard/MunicipalIngestionPanel';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';

// Estrutura de fontes para referência
const estruturaFederal = [
  { categoria: 'Promoção da Igualdade Racial', orgao: 'MIR', fontes: [
    { nome: 'Portal da Transparência – Órgão Superior MIR', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS67000' },
    { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
  ]},
  { categoria: 'Povos Indígenas', orgao: 'MPI/FUNAI', fontes: [
    { nome: 'Portal da Transparência – FUNAI', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS52000' },
    { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
  ]},
  { categoria: 'Territórios Quilombolas', orgao: 'INCRA', fontes: [
    { nome: 'Portal da Transparência – INCRA', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS49000' },
    { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
  ]},
  { categoria: 'Ações Afirmativas e Educação', orgao: 'MEC', fontes: [
    { nome: 'Portal da Transparência – MEC', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS26000&funcoes=12' },
    { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
  ]},
  { categoria: 'Proteção Social', orgao: 'MDS', fontes: [
    { nome: 'Portal da Transparência – MDS', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS55000' },
    { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
  ]},
  { categoria: 'Segurança Pública', orgao: 'MJSP', fontes: [
    { nome: 'Portal da Transparência – MJSP', url: 'https://portaldatransparencia.gov.br/despesas?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS30000&funcoes=06' },
    { nome: 'SIOP', url: 'https://www.siop.planejamento.gov.br/siop/' }
  ]}
];

const estruturaEstadual = [
  { uf: 'BA', estado: 'Bahia', orgao: 'SEPROMI', url: 'https://www.transparencia.ba.gov.br/' },
  { uf: 'SP', estado: 'São Paulo', orgao: 'Sec. Justiça e Cidadania', url: 'https://www.fazenda.sp.gov.br/SigeoLei131/Paginas/FlexConsDespworking.aspx' },
  { uf: 'RJ', estado: 'Rio de Janeiro', orgao: 'SEASDH', url: 'https://www.transparencia.rj.gov.br/' },
  { uf: 'MG', estado: 'Minas Gerais', orgao: 'SEDHS', url: 'https://www.transparencia.mg.gov.br/' },
  { uf: 'RS', estado: 'Rio Grande do Sul', orgao: 'SDH', url: 'https://transparencia.rs.gov.br/' },
  { uf: 'PE', estado: 'Pernambuco', orgao: 'SecMulher/FUNDARPE', url: 'https://transparencia.pe.gov.br/' },
  { uf: 'MA', estado: 'Maranhão', orgao: 'SEDIHPOP', url: 'https://www.transparencia.ma.gov.br/' },
  { uf: 'PA', estado: 'Pará', orgao: 'SEIRDH', url: 'https://www.transparencia.pa.gov.br/' }
];

const estruturaMunicipal = [
  // NORTE
  { municipio: 'Porto Velho', uf: 'RO', orgao: 'SMDH', url: 'https://transparencia.portovelho.ro.gov.br/' },
  { municipio: 'Rio Branco', uf: 'AC', orgao: 'SMDH', url: 'https://transparencia.riobranco.ac.gov.br/' },
  { municipio: 'Manaus', uf: 'AM', orgao: 'SEMDIH', url: 'https://transparencia.manaus.am.gov.br/' },
  { municipio: 'Boa Vista', uf: 'RR', orgao: 'SMDH', url: 'https://transparencia.boavista.rr.gov.br/' },
  { municipio: 'Belém', uf: 'PA', orgao: 'CONEN', url: 'https://transparencia.belem.pa.gov.br/' },
  { municipio: 'Macapá', uf: 'AP', orgao: 'SMDH', url: 'https://transparencia.macapa.ap.gov.br/' },
  { municipio: 'Palmas', uf: 'TO', orgao: 'SMDH', url: 'https://transparencia.palmas.to.gov.br/' },
  // NORDESTE
  { municipio: 'São Luís', uf: 'MA', orgao: 'SEIR', url: 'https://transparencia.saoluis.ma.gov.br/' },
  { municipio: 'Teresina', uf: 'PI', orgao: 'SEMCASPI', url: 'https://transparencia.teresina.pi.gov.br/' },
  { municipio: 'Fortaleza', uf: 'CE', orgao: 'Coord. Igualdade Racial', url: 'https://transparencia.fortaleza.ce.gov.br/' },
  { municipio: 'Natal', uf: 'RN', orgao: 'SEMJIDH', url: 'https://transparencia.natal.rn.gov.br/' },
  { municipio: 'João Pessoa', uf: 'PB', orgao: 'Coord. Igualdade Racial', url: 'https://transparencia.joaopessoa.pb.gov.br/' },
  { municipio: 'Recife', uf: 'PE', orgao: 'Ger. Igualdade Racial', url: 'https://transparencia.recife.pe.gov.br/' },
  { municipio: 'Maceió', uf: 'AL', orgao: 'SMDH', url: 'https://transparencia.maceio.al.gov.br/' },
  { municipio: 'Aracaju', uf: 'SE', orgao: 'SMDH', url: 'https://transparencia.aracaju.se.gov.br/' },
  { municipio: 'Salvador', uf: 'BA', orgao: 'SEMUR', url: 'https://transparencia.salvador.ba.gov.br/' },
  // CENTRO-OESTE
  { municipio: 'Campo Grande', uf: 'MS', orgao: 'SMDH', url: 'https://transparencia.campogrande.ms.gov.br/' },
  { municipio: 'Cuiabá', uf: 'MT', orgao: 'SMDH', url: 'https://transparencia.cuiaba.mt.gov.br/' },
  { municipio: 'Goiânia', uf: 'GO', orgao: 'SMDH', url: 'https://transparencia.goiania.go.gov.br/' },
  { municipio: 'Brasília', uf: 'DF', orgao: 'Sec. Justiça e Cidadania', url: 'https://www.transparencia.df.gov.br/' },
  // SUDESTE
  { municipio: 'Belo Horizonte', uf: 'MG', orgao: 'SMADC', url: 'https://prefeitura.pbh.gov.br/transparencia' },
  { municipio: 'Vitória', uf: 'ES', orgao: 'SMDH', url: 'https://transparencia.vitoria.es.gov.br/' },
  { municipio: 'Rio de Janeiro', uf: 'RJ', orgao: 'SMDHC', url: 'https://transparencia.prefeitura.rio/' },
  { municipio: 'São Paulo', uf: 'SP', orgao: 'SMDHC', url: 'https://orcamento.sf.prefeitura.sp.gov.br/' },
  // SUL
  { municipio: 'Curitiba', uf: 'PR', orgao: 'FCC/SMDH', url: 'https://transparencia.curitiba.pr.gov.br/' },
  { municipio: 'Florianópolis', uf: 'SC', orgao: 'SMDH', url: 'https://transparencia.florianopolis.sc.gov.br/' },
  { municipio: 'Porto Alegre', uf: 'RS', orgao: 'SMDH', url: 'https://transparencia.portoalegre.rs.gov.br/' },
];

type ThematicFilter = 'racial' | 'indigena' | 'quilombola' | 'ciganos';

const THEMATIC_FILTERS: { key: ThematicFilter; label: string }[] = [
  { key: 'racial', label: 'Política Racial' },
  { key: 'indigena', label: 'Povos Indígenas' },
  { key: 'quilombola', label: 'Quilombolas' },
  { key: 'ciganos', label: 'Ciganos' },
];

/** Classify a record into a thematic category — SESAI is separate */
function classifyThematic(r: DadoOrcamentario): ThematicFilter | 'sesai' {
  const prog = r.programa.toLowerCase();
  const orgao = r.orgao.toUpperCase();
  const obs = ((r as any).observacoes || '').toLowerCase();

  // SESAI always separate
  if (orgao === 'SESAI' || obs.includes('saúde indígena') || obs.includes('sesai') ||
      prog.includes('20yp') || prog.includes('7684')) {
    return 'sesai';
  }

  if (['FUNAI', 'MPI'].includes(orgao) ||
      prog.includes('indigen') || prog.includes('indígen') || prog.includes('2065')) {
    return 'indigena';
  }
  if (prog.includes('quilomb') || prog.includes('20g7') || prog.includes('0859')) {
    return 'quilombola';
  }
  if (prog.includes('cigano') || prog.includes('romani') || prog.includes('povo cigano')) {
    return 'ciganos';
  }
  return 'racial';
}

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

/** Filter bar component used inside each esfera tab */
function ThematicFilterBar({
  filters,
  counts,
  onToggle,
}: {
  filters: Record<ThematicFilter, boolean>;
  counts: Record<ThematicFilter, number>;
  onToggle: (key: ThematicFilter) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-muted/50 rounded-lg border">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Filtros temáticos:</span>
      {THEMATIC_FILTERS.map(f => (
        <label key={f.key} className="flex items-center gap-2 cursor-pointer text-sm">
          <Checkbox
            checked={filters[f.key]}
            onCheckedChange={() => onToggle(f.key)}
          />
          {f.label}
          <Badge variant="secondary" className="text-xs">{counts[f.key]}</Badge>
        </label>
      ))}
    </div>
  );
}

/** Check if records are excluded from calculations */
function getRecordExclusion(registros: DadoOrcamentario[]): { excluded: boolean; reason?: string } | null {
  // Check SESAI
  const orgao = registros[0]?.orgao?.toUpperCase() || '';
  const prog = registros[0]?.programa?.toLowerCase() || '';
  const obs = ((registros[0] as any)?.observacoes || '').toLowerCase();
  
  if (orgao === 'SESAI' || obs.includes('saúde indígena') || obs.includes('sesai') ||
      prog.includes('20yp') || prog.includes('7684')) {
    return { excluded: true, reason: 'SESAI segregada — excluída dos cálculos de política racial' };
  }

  // Check 5034 — the program itself is a catch-all umbrella (especially 2020)
  if (prog.includes('5034')) {
    const has2020 = registros.some(r => r.ano === 2020);
    if (has2020) {
      return { excluded: true, reason: 'Prog. 5034/2020 — guarda-chuva MDHC, inclui políticas de mulheres, idosos, etc.' };
    }
  }

  return null;
}

/** Renders grouped data as OrgaoSections or sub-grouped cards */
function EsferaContent({
  records,
  isLoading,
  emptyMessage,
  useOrgaoSection = true,
  showExclusions = false,
}: {
  records: DadoOrcamentario[];
  isLoading: boolean;
  emptyMessage: string;
  useOrgaoSection?: boolean;
  showExclusions?: boolean;
}) {
  if (isLoading) {
    return <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}</div>;
  }

  const grouped = groupByOrgaoPrograma(records);

  if (grouped.size === 0) {
    return <EmptyEsferaCard esfera="" descricao={emptyMessage} />;
  }

  if (useOrgaoSection) {
    return (
      <div className="space-y-8">
        {Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([orgao, programas]) => (
          <OrgaoSection
            key={orgao}
            orgao={orgao}
            programas={programas}
            getExclusion={showExclusions ? getRecordExclusion : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([entity, programas]) => (
        <div key={entity} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <MapPin className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold text-sm">{entity}</h3>
            <Badge variant="outline" className="text-xs">{programas.size} programas</Badge>
          </div>
          <div className="space-y-2">
            {Array.from(programas.entries()).map(([prog, registros]) => (
              <ProgramCard key={prog} programa={prog} registros={registros} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Summary cards for a given esfera */
function EsferaSummaryCards({
  stats,
  esferaLabel,
  formatCurrency,
}: {
  stats: { totalPeriodo1: number; totalPeriodo2: number; variacao: number; totalRegistros: number; totalProgramas: number; anosCobertura: number[] };
  esferaLabel: string;
  formatCurrency: (v: number) => string;
}) {
  if (stats.totalRegistros === 0) return null;
  const anosRange = stats.anosCobertura.length > 0
    ? `${stats.anosCobertura[0]}–${stats.anosCobertura[stats.anosCobertura.length - 1]}`
    : '—';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <Card className="border-l-4 border-l-primary/60">
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground mb-1">2018–2022</p>
          <p className="text-lg font-bold">{formatCurrency(stats.totalPeriodo1)}</p>
          <p className="text-[10px] text-muted-foreground">{esferaLabel}</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-success/60">
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground mb-1">2023–2026</p>
          <p className="text-lg font-bold text-success">{formatCurrency(stats.totalPeriodo2)}</p>
          <p className="text-[10px] text-muted-foreground">{esferaLabel}</p>
        </CardContent>
      </Card>
      <Card className="border-l-4" style={{ borderLeftColor: stats.variacao >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground mb-1">Variação</p>
          <p className={`text-lg font-bold ${stats.variacao >= 0 ? 'text-success' : 'text-destructive'}`}>
            {stats.variacao >= 0 ? '+' : ''}{stats.variacao.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground">Entre períodos</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-muted-foreground/30">
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground mb-1">Cobertura</p>
          <p className="text-lg font-bold">{stats.totalProgramas} <span className="text-sm font-normal text-muted-foreground">programas</span></p>
          <p className="text-[10px] text-muted-foreground">{stats.totalRegistros} registros · {anosRange}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function Orcamento() {
  const { data: dadosOrcamentarios, isLoading: orcLoading } = useDadosOrcamentarios();
  const { data: stats, isLoading: statsLoading } = useOrcamentoStats();
  const queryClient = useQueryClient();

  // Thematic filters per esfera
  const [federalFilters, setFederalFilters] = useState<Record<ThematicFilter, boolean>>({ racial: true, indigena: true, quilombola: true, ciganos: true });
  const [estadualFilters, setEstadualFilters] = useState<Record<ThematicFilter, boolean>>({ racial: true, indigena: true, quilombola: true, ciganos: true });
  const [municipalFilters, setMunicipalFilters] = useState<Record<ThematicFilter, boolean>>({ racial: true, indigena: true, quilombola: true, ciganos: true });
  const [includeExcludedInCalc, setIncludeExcludedInCalc] = useState(false);

  const handleResetEsfera = async (esfera: string, label: string) => {
    if (!confirm(`Apagar todos os dados orçamentários da esfera "${label}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const { error } = await supabase.from('dados_orcamentarios').delete().eq('esfera', esfera);
      if (error) throw error;
      toast.success(`Dados ${label} apagados com sucesso.`);
      queryClient.invalidateQueries();
    } catch {
      toast.error(`Erro ao apagar dados ${label}.`);
    }
  };

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<Record<ThematicFilter, boolean>>>) => (key: ThematicFilter) => {
    setter(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', maximumFractionDigits: 1 }).format(value);

  const formatCurrencyFull = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);

  const isLoading = orcLoading || statsLoading;
  const hasData = dadosOrcamentarios && dadosOrcamentarios.length > 0;

  // Classify all records by esfera + thematic (SESAI segregated)
  const classified = useMemo(() => {
    const result: Record<'federal' | 'estadual' | 'municipal', { all: DadoOrcamentario[]; byTheme: Record<ThematicFilter, DadoOrcamentario[]> }> & { sesai: DadoOrcamentario[] } = {
      federal: { all: [], byTheme: { racial: [], indigena: [], quilombola: [], ciganos: [] } },
      estadual: { all: [], byTheme: { racial: [], indigena: [], quilombola: [], ciganos: [] } },
      municipal: { all: [], byTheme: { racial: [], indigena: [], quilombola: [], ciganos: [] } },
      sesai: [],
    };

    if (!dadosOrcamentarios) return result;

    for (const item of dadosOrcamentarios) {
      const theme = classifyThematic(item);
      
      // SESAI goes to its dedicated tab
      if (theme === 'sesai') {
        result.sesai.push(item);
        // Also include in federal.all for display (will be visually marked as excluded)
        if (item.esfera !== 'estadual' && item.esfera !== 'municipal') {
          result.federal.all.push(item);
        }
        continue;
      }

      let esfera: 'federal' | 'estadual' | 'municipal' = 'federal';
      if (item.esfera === 'estadual') esfera = 'estadual';
      else if (item.esfera === 'municipal') esfera = 'municipal';

      result[esfera].all.push(item);
      result[esfera].byTheme[theme].push(item);
    }

    return result;
  }, [dadosOrcamentarios]);

  // Apply filters to get visible records per esfera — federal always includes all records
  const getFilteredRecords = (esfera: 'federal' | 'estadual' | 'municipal', filters: Record<ThematicFilter, boolean>) => {
    const data = classified[esfera];
    const result: DadoOrcamentario[] = [];
    for (const key of THEMATIC_FILTERS.map(f => f.key)) {
      if (filters[key]) result.push(...data.byTheme[key]);
    }
    // For federal: always include SESAI records (visually marked as excluded)
    if (esfera === 'federal') {
      const sesaiInFederal = data.all.filter(r => classifyThematic(r) === 'sesai');
      result.push(...sesaiInFederal);
    }
    return result;
  };

  const getThemeCounts = (esfera: 'federal' | 'estadual' | 'municipal') => {
    const data = classified[esfera];
    return {
      racial: data.byTheme.racial.length,
      indigena: data.byTheme.indigena.length,
      quilombola: data.byTheme.quilombola.length,
      ciganos: data.byTheme.ciganos.length,
    };
  };

  const federalRecords = useMemo(() => getFilteredRecords('federal', federalFilters), [classified, federalFilters]);
  const estadualRecords = useMemo(() => getFilteredRecords('estadual', estadualFilters), [classified, estadualFilters]);
  const municipalRecords = useMemo(() => getFilteredRecords('municipal', municipalFilters), [classified, municipalFilters]);

  /** Compute per-esfera summary stats */
  const esferaStats = useMemo(() => {
    const compute = (records: DadoOrcamentario[], excludeSesaiAnd5034: boolean) => {
      const valorEfetivo = (r: DadoOrcamentario) => Number(r.pago) || Number(r.dotacao_autorizada) || 0;
      const clean = excludeSesaiAnd5034
        ? records.filter(r => classifyThematic(r) !== 'sesai' && !(r.ano === 2020 && r.programa.toLowerCase().includes('5034')))
        : records;
      const p1 = clean.filter(r => r.ano >= 2018 && r.ano <= 2022);
      const p2 = clean.filter(r => r.ano >= 2023 && r.ano <= 2026);
      const t1 = p1.reduce((s, r) => s + valorEfetivo(r), 0);
      const t2 = p2.reduce((s, r) => s + valorEfetivo(r), 0);
      const anos = new Set(clean.map(r => r.ano));
      const programas = new Set(clean.map(r => r.programa));
      return {
        totalPeriodo1: t1,
        totalPeriodo2: t2,
        variacao: t1 > 0 ? ((t2 - t1) / t1 * 100) : 0,
        totalRegistros: clean.length,
        totalProgramas: programas.size,
        anosCobertura: Array.from(anos).sort(),
      };
    };
    return {
      federal: compute(classified.federal.all, !includeExcludedInCalc),
      estadual: compute(classified.estadual.all, false),
      municipal: compute(classified.municipal.all, false),
    };
  }, [classified, includeExcludedInCalc]);

  // Dynamic stats based on toggle — when includeExcludedInCalc is true, add SESAI + 5034/2020 to totals
  const dynamicStats = useMemo(() => {
    if (!stats) return null;
    if (!includeExcludedInCalc) {
      // Default: use the hook stats which already exclude SESAI + 5034/2020
      return {
        totalPeriodo1: stats.totalPeriodo1,
        totalPeriodo2: stats.totalPeriodo2,
        variacao: stats.variacao,
        totalRegistros: stats.totalRegistros,
        label: 'Exclui SESAI e 5034/2020',
      };
    }
    // Include excluded: add SESAI + 5034/2020 totals back in
    const valorEfetivo = (r: DadoOrcamentario) => Number(r.pago) || Number(r.dotacao_autorizada) || 0;
    const allExcluded = dadosOrcamentarios?.filter(r => {
      const theme = classifyThematic(r);
      if (theme === 'sesai') return true;
      if (r.ano === 2020 && r.programa.toLowerCase().includes('5034')) return true;
      return false;
    }) || [];
    const excl1 = allExcluded.filter(r => r.ano >= 2018 && r.ano <= 2022).reduce((s, r) => s + valorEfetivo(r), 0);
    const excl2 = allExcluded.filter(r => r.ano >= 2023 && r.ano <= 2026).reduce((s, r) => s + valorEfetivo(r), 0);
    const t1 = stats.totalPeriodo1 + excl1;
    const t2 = stats.totalPeriodo2 + excl2;
    return {
      totalPeriodo1: t1,
      totalPeriodo2: t2,
      variacao: t1 > 0 ? ((t2 - t1) / t1 * 100) : 0,
      totalRegistros: stats.totalRegistros + allExcluded.length,
      label: 'Inclui todos os registros',
    };
  }, [stats, includeExcludedInCalc, dadosOrcamentarios]);

  // Chart data
  const evolucaoPorAno = stats?.porAno
    ? Object.entries(stats.porAno).map(([ano, pago]) => ({ ano: Number(ano), pago: pago as number })).sort((a, b) => a.ano - b.ano)
    : [];

  const porPrograma = stats?.porPrograma
    ? Object.entries(stats.porPrograma).map(([programa, pago]) => ({ programa, pago: pago as number })).sort((a, b) => b.pago - a.pago).slice(0, 10)
    : [];

  return (
    <DashboardLayout
      title="Orçamento"
      subtitle="Execução orçamentária de políticas raciais — Federal, Estadual e Municipal (2018-2026)"
    >
      {/* Alerta + Ingestão */}
      <Card className="mb-6 border-l-4 border-l-warning">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Política de Dados: Apenas Dados Oficiais Verificados</h3>
              <p className="text-sm text-muted-foreground">
                Esta seção exibe <strong>exclusivamente</strong> dados inseridos no banco após verificação
                nas fontes oficiais (SIOP, Portal da Transparência, LOAs). Dados estimados ou não auditáveis
                não são permitidos. Cada registro deve conter o deep link direto para a fonte primária.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              <FederalIngestionPanel />
              <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleResetEsfera('federal', 'Federal')}>
                <Trash2 className="w-3.5 h-3.5" /> Reset Federal
              </Button>
              <EstadualIngestionPanel />
              <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleResetEsfera('estadual', 'Estadual')}>
                <Trash2 className="w-3.5 h-3.5" /> Reset Estadual
              </Button>
              <MunicipalIngestionPanel />
              <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleResetEsfera('municipal', 'Municipal')}>
                <Trash2 className="w-3.5 h-3.5" /> Reset Municipal
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : hasData ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">2018-2022</p>
                  <p className="text-xl font-bold">{formatCurrency(dynamicStats?.totalPeriodo1 || 0)}</p>
                  <p className="text-xs text-muted-foreground">{dynamicStats?.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">2023-2026</p>
                  <p className="text-xl font-bold text-success">{formatCurrency(dynamicStats?.totalPeriodo2 || 0)}</p>
                  <p className="text-xs text-muted-foreground">{dynamicStats?.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${dynamicStats && dynamicStats.variacao > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                  <TrendingUp className={`w-5 h-5 ${dynamicStats && dynamicStats.variacao > 0 ? 'text-success' : 'text-destructive'}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Variação</p>
                  <p className={`text-xl font-bold ${dynamicStats && dynamicStats.variacao > 0 ? 'text-success' : 'text-destructive'}`}>
                    {dynamicStats && dynamicStats.variacao > 0 ? '+' : ''}{dynamicStats?.variacao.toFixed(1)}%
                  </p>
                  <p className="text-xs text-muted-foreground">{dynamicStats?.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-muted rounded-lg">
                  <Database className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registros</p>
                  <p className="text-xl font-bold">{dynamicStats?.totalRegistros || 0}</p>
                  <p className="text-xs text-muted-foreground">
                    {classified.federal.all.length} federal · {classified.estadual.all.length} estadual · {classified.municipal.all.length} municipal
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      <Tabs defaultValue="federal" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="federal">
            <Building className="w-4 h-4 mr-1" />
            Federal
            {classified.federal.all.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{classified.federal.all.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="estadual">
            <Building2 className="w-4 h-4 mr-1" />
            Estadual
            {classified.estadual.all.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{classified.estadual.all.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="municipal">
            <MapPin className="w-4 h-4 mr-1" />
            Municipal
            {classified.municipal.all.length > 0 && <Badge variant="secondary" className="ml-1 text-xs">{classified.municipal.all.length}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="visao-geral">
            <Database className="w-4 h-4 mr-1" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="fontes">
            <ExternalLink className="w-4 h-4 mr-1" />
            Fontes
          </TabsTrigger>
          <TabsTrigger value="resumo">
            <PieChart className="w-4 h-4 mr-1" />
            Resumo Comparativo
          </TabsTrigger>
          <TabsTrigger value="metodologia">
            <BookOpen className="w-4 h-4 mr-1" />
            Metodologia
          </TabsTrigger>
        </TabsList>

        {/* FEDERAL */}
        <TabsContent value="federal">
          <EsferaSummaryCards stats={esferaStats.federal} esferaLabel="Federal" formatCurrency={formatCurrency} />
          <ThematicFilterBar filters={federalFilters} counts={getThemeCounts('federal')} onToggle={toggleFilter(setFederalFilters)} />
          <div className="mb-4 p-3 bg-muted/40 rounded-lg border border-dashed flex items-center gap-2 text-xs text-muted-foreground justify-between">
            <div className="flex items-center gap-2">
              <EyeOff className="w-4 h-4 flex-shrink-0" />
              <span>Programas com <Badge variant="outline" className="text-[10px] border-warning text-warning mx-1">Excluído do cálculo</Badge> são exibidos para transparência. O toggle ao lado controla se entram nos totais e variação percentual.</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap text-sm font-medium shrink-0">
              <Checkbox
                checked={includeExcludedInCalc}
                onCheckedChange={(checked) => setIncludeExcludedInCalc(!!checked)}
              />
              Incluir excluídos no cálculo
            </label>
          </div>
          <EsferaContent records={federalRecords} isLoading={isLoading} emptyMessage="Nenhum programa federal encontrado com os filtros selecionados." useOrgaoSection showExclusions />
        </TabsContent>

        {/* ESTADUAL */}
        <TabsContent value="estadual">
          <EsferaSummaryCards stats={esferaStats.estadual} esferaLabel="Estadual" formatCurrency={formatCurrency} />
          <ThematicFilterBar filters={estadualFilters} counts={getThemeCounts('estadual')} onToggle={toggleFilter(setEstadualFilters)} />
          <EsferaContent records={estadualRecords} isLoading={isLoading} emptyMessage="Dados estaduais ainda não coletados. Utilize SICONFI/RREO dos portais de transparência estaduais." useOrgaoSection={false} />
        </TabsContent>

        {/* MUNICIPAL */}
        <TabsContent value="municipal">
          <EsferaSummaryCards stats={esferaStats.municipal} esferaLabel="Municipal" formatCurrency={formatCurrency} />
          <ThematicFilterBar filters={municipalFilters} counts={getThemeCounts('municipal')} onToggle={toggleFilter(setMunicipalFilters)} />
          <EsferaContent records={municipalRecords} isLoading={isLoading} emptyMessage="Dados municipais ainda não coletados. Utilize portais de transparência municipais." useOrgaoSection={false} />
        </TabsContent>

        {/* VISÃO GERAL - Charts */}
        <TabsContent value="visao-geral">
          {isLoading ? (
            <Skeleton className="h-96" />
          ) : hasData ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {evolucaoPorAno.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Evolução Orçamentária por Ano (Exclui SESAI e 5034/2020)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={evolucaoPorAno}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                          <Tooltip
                            formatter={(value: number) => [formatCurrencyFull(value), 'Pago']}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                          />
                          <Line type="monotone" dataKey="pago" name="Pago" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
              {porPrograma.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Top 10 Programas por Execução (Exclui SESAI e 5034/2020)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={porPrograma} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                          <YAxis dataKey="programa" type="category" tick={{ fontSize: 9 }} width={130} />
                          <Tooltip
                            formatter={(value: number) => [formatCurrencyFull(value), 'Pago']}
                            contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                          />
                          <Bar dataKey="pago" fill="hsl(var(--chart-2))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <EmptyEsferaCard esfera="gerais" descricao="Nenhum dado orçamentário verificado encontrado no banco." />
          )}
        </TabsContent>

        {/* FONTES */}
        <TabsContent value="fontes">
          <div className="space-y-6">
            <h3 className="font-semibold text-sm flex items-center gap-2"><Building className="w-4 h-4 text-primary" /> Fontes Federais</h3>
            <div className="space-y-4">
              {estruturaFederal.map((cat) => (
                <Card key={cat.categoria}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Building className="w-5 h-5 text-primary" />
                        {cat.categoria}
                      </CardTitle>
                      <Badge variant="outline">{cat.orgao}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-3">
                      {cat.fontes.map((fonte, idx) => (
                        <a key={idx} href={fonte.url} target="_blank" rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1 bg-primary/5 px-3 py-2 rounded-lg">
                          <ExternalLink className="w-3.5 h-3.5" /> {fonte.nome}
                        </a>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <h3 className="font-semibold text-sm flex items-center gap-2 mt-8"><Building2 className="w-4 h-4 text-success" /> Fontes Estaduais</h3>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>UF</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Órgão Responsável</TableHead>
                      <TableHead>Portal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estruturaEstadual.map((est) => (
                      <TableRow key={est.uf}>
                        <TableCell><Badge variant="outline">{est.uf}</Badge></TableCell>
                        <TableCell className="font-medium">{est.estado}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{est.orgao}</TableCell>
                        <TableCell>
                          <a href={est.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3.5 h-3.5" /> Acessar
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <h3 className="font-semibold text-sm flex items-center gap-2 mt-8"><MapPin className="w-4 h-4 text-chart-1" /> Fontes Municipais</h3>
            <Card>
              <CardContent className="pt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Município</TableHead>
                      <TableHead>UF</TableHead>
                      <TableHead>Órgão Responsável</TableHead>
                      <TableHead>Portal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {estruturaMunicipal.map((mun) => (
                      <TableRow key={mun.municipio}>
                        <TableCell className="font-medium">{mun.municipio}</TableCell>
                        <TableCell><Badge variant="outline">{mun.uf}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{mun.orgao}</TableCell>
                        <TableCell>
                          <a href={mun.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline flex items-center gap-1">
                            <ExternalLink className="w-3.5 h-3.5" /> Acessar
                          </a>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* RESUMO COMPARATIVO */}
        <TabsContent value="resumo">
          <div className="space-y-6">
            <Card className="border-l-4 border-l-warning">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm">Exclusões Aplicadas aos Cálculos Comparativos</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Todos os valores nesta seção <strong>excluem</strong>: (1) <strong>SESAI</strong> (Saúde Indígena — distorce totais por volume);
                      (2) <strong>Programa 5034 de 2020</strong> (guarda-chuva do MDHC — incluía políticas de mulheres, idosos, etc., nem tudo racial;
                      Dotação R$ 215 mi / Pago R$ 578 mi). Ambos são mantidos em abas dedicadas para consulta informativa.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Infográfico comparativo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="text-base">Período 2018–2022 (Retrocesso/Desmonte)</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-destructive">{formatCurrency(stats?.totalPeriodo1 || 0)}</div>
                  <p className="text-xs text-muted-foreground">Valor executado total (exclui SESAI e Prog. 5034/2020)</p>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 mt-3">
                    <li><strong>2018–2019:</strong> Base modesta de R$ 93–123 mi sob SEPPIR/MMFDH (segmentando SESAI)</li>
                    <li><strong>2020:</strong> Programa 5034 <strong>excluído do cálculo</strong> — era guarda-chuva do MDHC (R$ 578 mi pagos incluíam políticas de mulheres, idosos, etc.)</li>
                    <li><strong>2021–2022:</strong> Queda real para R$ 161–173 mi de dotação — desmonte institucional confirmado</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader><CardTitle className="text-base">Período 2023–2026 (Reconstrução)</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-3xl font-bold text-success">{formatCurrency(stats?.totalPeriodo2 || 0)}</div>
                  <p className="text-xs text-muted-foreground">Valor executado total (exclui SESAI e Prog. 5034/2020)</p>
                  <ul className="text-xs text-muted-foreground space-y-1.5 list-disc pl-4 mt-3">
                    <li><strong>2023:</strong> Salto para R$ 457 mi de dotação — criação do MIR e reconstrução da pauta racial</li>
                    <li><strong>2024–2025:</strong> Novos programas PPA (5802 Quilombolas, 5803 Juventude Negra, 5804 Igualdade Étnico-Racial)</li>
                    <li><strong>Execução recorde:</strong> MIR com ~99% de execução em 2024/2025</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Variação */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stats && stats.variacao > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <TrendingUp className={`w-8 h-8 ${stats && stats.variacao > 0 ? 'text-success' : 'text-destructive'}`} />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Variação 2018-22 → 2023-26</p>
                    <p className={`text-3xl font-bold ${stats && stats.variacao > 0 ? 'text-success' : 'text-destructive'}`}>
                      {stats && stats.variacao > 0 ? '+' : ''}{stats?.variacao.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Série incompleta — dados parciais. Variações extremas podem refletir hiatos na coleta.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evolução por ano */}
            {evolucaoPorAno.length > 0 && (
              <Card>
                <CardHeader><CardTitle className="text-base">Evolução Anual — Valor Executado (Exclui SESAI e Prog. 5034/2020)</CardTitle></CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={evolucaoPorAno}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                        <Tooltip
                          formatter={(value: number) => [formatCurrencyFull(value), 'Executado']}
                          contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                        />
                        <Bar dataKey="pago" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* METODOLOGIA */}
        <TabsContent value="metodologia">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Metodologia de Levantamento Orçamentário
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-muted-foreground">
                {/* 1. Estratégia de Coleta */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">1. Estratégia Híbrida de Coleta de Dados</h4>
                  <p>A base orçamentária federal (2018–2025) utiliza uma estratégia híbrida de coleta:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>API REST do Portal da Transparência (CGU):</strong> Fornece dados de execução orçamentária — valor empenhado, liquidado e pago — com granularidade por ação, programa e órgão.</li>
                    <li><strong>Arquivos ZIP/CSV do portal de dados abertos (LOA):</strong> Complementam a base com dados de dotação (inicial e autorizada), processados pela Edge Function <code>ingest-dotacao-loa</code>.</li>
                    <li><strong>Upload manual via CSV:</strong> Permite preenchimento de lacunas identificadas na API, com rastreabilidade total (fonte, URL, observações).</li>
                  </ul>
                  <p className="text-xs italic">Esta abordagem substitui a dependência do SIOP SPARQL, que se mostrou tecnicamente inviável devido a bloqueios de segurança (Cloudflare 403) e defasagem de dados.</p>
                </section>

                {/* 2. Camadas de Filtragem */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">2. Metodologia de Filtragem em Três Camadas</h4>
                  <p>A ingestão de dados utiliza filtragem em três camadas auditáveis:</p>
                  
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div>
                      <h5 className="font-semibold text-foreground">Camada 1 — Programas PPA</h5>
                      <p>Códigos incluídos: <code>5034</code> (Igualdade Racial), <code>5802</code> (Quilombolas e Ciganos), <code>5803</code> (Juventude Negra), <code>5804</code> (Igualdade Étnico-Racial), <code>2065</code> (Povos Indígenas), <code>0153</code> e <code>2034</code>.</p>
                      <p className="text-destructive font-medium mt-1">Exclusão explícita: Programa <code>5113</code> (Educação Superior com recorte racial) — genérico, distorce totais (R$ 14 bi).</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground">Camada 2 — Subfunção 422</h5>
                      <p>Captura ações da Subfunção 422 (Direitos Individuais e Coletivos) validadas por palavras-chave: <code>racial</code>, <code>quilombol</code>, <code>cigan</code>, <code>terreiro</code>, <code>SESAI</code>.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground">Camada 3 — Órgãos Específicos</h5>
                      <p>Ingestão direta dos Ministérios: MIR (código 67000) e MPI (código 92000). Para o período 2018–2022, os dados vêm das instituições predecessoras (SEPPIR, FUNAI vinculada ao MJ, INCRA).</p>
                    </div>
                  </div>
                </section>

                {/* 3. Classificação Temática */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">3. Classificação Temática Dinâmica</h4>
                  <p>Os registros são classificados em quatro categorias temáticas com base no mapeamento de órgãos, códigos de ação e palavras-chave:</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Critérios de Identificação</TableHead>
                        <TableHead>Observações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">Política Racial</TableCell>
                        <TableCell>MIR, MDHC, SEPPIR; Programas 5034, 5804</TableCell>
                        <TableCell>Exclui SESAI e programas transversais</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Povos Indígenas</TableCell>
                        <TableCell>FUNAI, MPI; Programa 2065</TableCell>
                        <TableCell>Lacuna: dados 2020–2023 ausentes na API</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Quilombolas</TableCell>
                        <TableCell>INCRA; Ações 20G7, 0859; Programa 5802</TableCell>
                        <TableCell>Lacuna: dados 2020–2023 ausentes</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Ciganos/Romani</TableCell>
                        <TableCell>Palavras-chave: cigano, romani</TableCell>
                        <TableCell>Dados escassos em toda a série</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </section>

                {/* 4. Segregação SESAI */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">4. Segregação Mandatória da SESAI</h4>
                  <p>Os gastos da SESAI (Saúde Indígena — Ações 20YP e 7684) são <strong>obrigatoriamente segregados</strong> de todos os cálculos:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Excluídos dos cards de resumo (Política Racial, Povos Indígenas, Quilombolas, Ciganos)</li>
                    <li>Excluídos dos gráficos de evolução temporal e comparativos</li>
                    <li>Excluídos do cálculo de variação percentual 2018-22 vs 2023-26</li>
                    <li>Mantidos em aba dedicada apenas para fins informativos</li>
                  </ul>
                  <p><strong>Justificativa:</strong> O elevado orçamento de saúde indígena (que chega a bilhões) mascara as variações reais da política racial finalística, impedindo a identificação precisa do desmonte institucional de 2021-2022.</p>
                </section>

                {/* 4b. Exclusão do Programa 5034 (2020) */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">4b. Exclusão do Programa 5034 — Ano 2020</h4>
                  <p>O Programa 5034 ("Proteção à Vida, Fortalecimento da Família, Promoção e Defesa dos Direitos Humanos") em 2020 funcionava como <strong>guarda-chuva do MDHC</strong>, agregando:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Políticas de igualdade racial</li>
                    <li>Políticas para mulheres, idosos, pessoas com deficiência</li>
                    <li>Proteção social genérica</li>
                  </ul>
                  <p className="mt-2"><strong>Dados brutos de 2020:</strong> Dotação de R$ 215 mi, mas Pago de R$ 578 mi — valor que <strong>não é exclusivamente racial</strong>.</p>
                  <p><strong>Decisão metodológica:</strong> O Programa 5034 de 2020 é <strong>excluído de todos os cálculos comparativos</strong> (totais, variação percentual, gráficos), assim como a SESAI. Os registros permanecem acessíveis na aba Federal para consulta individualizada.</p>
                  <div className="bg-destructive/10 rounded-lg p-3 mt-2">
                    <p className="text-xs text-destructive font-medium">⚠ Sem esta exclusão, o total 2018-2022 seria artificialmente inflado por R$ 578 mi de gastos multi-temáticos, mascarando o desmonte real da política racial finalística.</p>
                  </div>
                </section>

                {/* 5. Padrão Nuançado da Série */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">5. Padrão Nuançado da Série 2018–2025</h4>
                  <p>Após as exclusões de SESAI e Programa 5034/2020, a série revela um padrão mais nuançado:</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Período</TableHead>
                        <TableHead>Dotação (R$)</TableHead>
                        <TableHead>Contexto</TableHead>
                        <TableHead>Interpretação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">2018–2019</TableCell>
                        <TableCell>R$ 93–123 mi</TableCell>
                        <TableCell>SEPPIR/MMFDH, SESAI segregada</TableCell>
                        <TableCell><Badge variant="outline">Política modesta</Badge></TableCell>
                      </TableRow>
                      <TableRow className="bg-destructive/5">
                        <TableCell className="font-medium">2020</TableCell>
                        <TableCell className="line-through text-muted-foreground">R$ 215 mi / R$ 578 mi pago</TableCell>
                        <TableCell>Prog. 5034 guarda-chuva MDHC</TableCell>
                        <TableCell><Badge variant="destructive">Excluído — distorção</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">2021–2022</TableCell>
                        <TableCell>R$ 161–173 mi</TableCell>
                        <TableCell>Desmonte institucional</TableCell>
                        <TableCell><Badge variant="destructive">Queda real confirmada</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">2023</TableCell>
                        <TableCell>R$ 457 mi</TableCell>
                        <TableCell>Criação do MIR</TableCell>
                        <TableCell><Badge className="bg-success text-success-foreground">Reconstrução</Badge></TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">2024–2025</TableCell>
                        <TableCell>R$ 132–157 mi</TableCell>
                        <TableCell>Novos programas: 5802, 5803, 5804</TableCell>
                        <TableCell><Badge variant="outline">Focalização com execução recorde (~99%)</Badge></TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <p className="text-xs italic mt-2">A aparente redução de dotação em 2024-2025 reflete a transição para programas focalizados (quilombolas, juventude negra, igualdade étnico-racial), com execução orçamentária recorde que demonstra eficiência institucional superior ao período anterior.</p>
                </section>

                {/* 6. Exclusões Deliberadas */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">6. Exclusões Deliberadas</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    <li><strong>Programas transversais de grande escala:</strong> Minha Casa Minha Vida, Fundo Eleitoral, Bolsa Família — inflam artificialmente os dados</li>
                    <li><strong>Programa 5113 (Educação Superior):</strong> Genérico, inclui toda a educação superior sem focalização racial suficiente (R$ 14 bi)</li>
                    <li><strong>Unidades Orçamentárias administrativas:</strong> ANVISA, Polícia Federal e similares — representam estruturas burocráticas, não políticas temáticas</li>
                    <li><strong>Metadados técnicos de planilhas:</strong> Códigos de colunas e identificadores internos são sistematicamente removidos</li>
                  </ul>
                </section>

                {/* 7. Cálculo de Execução */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">7. Cálculo de Execução Orçamentária</h4>
                  <p>O sistema mapeia cinco métricas financeiras essenciais:</p>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li><strong>Dotação Inicial (PLOA/LOA)</strong> — Valor previsto na Lei Orçamentária Anual</li>
                    <li><strong>Dotação Autorizada</strong> — Valor após créditos adicionais (suplementares, especiais, extraordinários)</li>
                    <li><strong>Valor Empenhado</strong> — Compromisso de gasto autorizado</li>
                    <li><strong>Valor Liquidado</strong> — Confirmação de entrega/serviço</li>
                    <li><strong>Valor Pago</strong> — Desembolso efetivo do Tesouro</li>
                  </ol>
                  <p className="mt-2">O percentual de execução prioriza a <strong>Dotação Autorizada</strong> como denominador, recorrendo à Dotação Inicial apenas em caso de ausência do valor atualizado.</p>
                </section>

                {/* 8. Cobertura Subnacional */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">8. Cobertura Subnacional (Estadual e Municipal)</h4>
                  <div className="bg-primary/10 rounded-lg p-4 space-y-3 border border-primary/30">
                    <p className="font-medium text-foreground">A base orçamentária abrange <strong>três esferas federativas</strong> com coleta automatizada, cobrindo a <strong>totalidade do território nacional</strong>:</p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li><strong>Federal (2018–2025):</strong> API do Portal da Transparência + CSV LOA, com as 3 camadas de filtragem (Programas PPA, Subfunção 422, Órgãos).</li>
                      <li><strong>Estadual (2018–2025):</strong> Todas as <strong>27 UFs</strong> via RREO/DCA do SICONFI, filtradas por Função 14 e Subfunção 422 com palavras-chave raciais.</li>
                      <li><strong>Municipal (2018–2025):</strong> Todos os <strong>5.570 municípios brasileiros</strong> via RREO/DCA do SICONFI, com os mesmos filtros e campos do estadual. A lista de municípios é obtida dinamicamente do endpoint <code className="bg-muted px-1 rounded">/entes</code> do SICONFI, garantindo cobertura total e atualizada.</li>
                    </ul>
                    <p className="text-xs">Todos os registros incluem: órgão responsável, descritivo da conta, público-alvo, razão de seleção (critério de inclusão), fonte de dados e link direto para o SICONFI. A ingestão municipal é orquestrada por UF (1 chamada por estado), permitindo processamento incremental e controle de progresso.</p>
                    
                    <div className="mt-3 space-y-2">
                      <h5 className="font-semibold text-foreground text-sm">Palavras-chave raciais/étnicas utilizadas no filtro subnacional:</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "racial", "racismo", "igualdade racial", "igualdade étnica",
                          "quilombola", "indígena", "cigano", "romani",
                          "terreiro", "matriz africana", "afro",
                          "direitos humanos", "cidadania", "promoção da igualdade",
                          "capoeira", "cultura negra", "negro", "candomblé", "umbanda",
                          "povos tradicionais", "comunidades tradicionais",
                        ].map(kw => (
                          <code key={kw} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{kw}</code>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Além das palavras-chave, são capturadas contas RREO/DCA cujas descrições incluem: <code className="bg-muted px-1 rounded">direitos da cidadania</code>, <code className="bg-muted px-1 rounded">direitos individuais coletivos</code>, <code className="bg-muted px-1 rounded">assistência aos indígenas</code>, <code className="bg-muted px-1 rounded">assistência comunitária</code>. Registros são incluídos quando coincidem com pelo menos um critério, e a razão de seleção é registrada no campo <em>razao_selecao</em> de cada ficha.</p>
                    </div>
                  </div>
                </section>

                {/* 9. Limitações */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base text-destructive">9. Limitações Conhecidas</h4>
                  <ul className="list-disc pl-5 space-y-1.5">
                    <li><strong>Povos Indígenas (FUNAI/MPI):</strong> Faltam dados de execução para 2020–2023 na API consultada. Lacuna sendo preenchida via CSV do Portal da Transparência.</li>
                    <li><strong>Quilombolas (INCRA):</strong> Dados de ações 20G7/0859 ausentes para 2020–2023.</li>
                    <li><strong>SESAI (Saúde Indígena):</strong> Aparece somente em 2018–2019 nos endpoints consultados. Segregada em aba dedicada.</li>
                    <li><strong>Programa 5034 (2020):</strong> <strong>Excluído dos cálculos comparativos</strong> — guarda-chuva multi-temático do MDHC que inflaciona artificialmente o total 2018-2022.</li>
                    <li><strong>Esferas estadual e municipal (SICONFI):</strong> Os dados RREO/DCA refletem <strong>função/subfunção</strong> (agregados), não programas específicos do PPA local. A granularidade é menor que a federal.</li>
                    <li><strong>Série incompleta:</strong> Variações percentuais extremas (ex: quedas de -90%) podem refletir hiatos na coleta, não alterações reais de dotação.</li>
                  </ul>
                </section>

                {/* 9. Identificação de Órgãos */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">10. Identificação de Órgãos Federais</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Órgão</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Período</TableHead>
                        <TableHead>Predecessores</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell className="font-medium">MIR (Igualdade Racial)</TableCell>
                        <TableCell><code>OS67000</code></TableCell>
                        <TableCell>2023–presente</TableCell>
                        <TableCell>SEPPIR, MMFDH</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">MPI (Povos Indígenas)</TableCell>
                        <TableCell><code>92000</code></TableCell>
                        <TableCell>2023–presente</TableCell>
                        <TableCell>FUNAI (vinculada ao MJ)</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">FUNAI</TableCell>
                        <TableCell><code>OS52000</code></TableCell>
                        <TableCell>2018–2022</TableCell>
                        <TableCell>—</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">INCRA</TableCell>
                        <TableCell><code>OS49000</code></TableCell>
                        <TableCell>2018–presente</TableCell>
                        <TableCell>—</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </section>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
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
import { SesaiMaskingInfographic } from '@/components/estatisticas/orcamento/SesaiMaskingInfographic';
import { AuditFooter } from '@/components/ui/audit-footer';

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
  const orgao = registros[0]?.orgao?.toUpperCase() || '';
  const prog = registros[0]?.programa?.toLowerCase() || '';
  const obs = ((registros[0] as any)?.observacoes || '').toLowerCase();
  
  // Check SESAI
  if (orgao === 'SESAI' || obs.includes('saúde indígena') || obs.includes('sesai') ||
      prog.includes('20yp') || prog.includes('7684')) {
    return null; // SESAI agora INCLUÍDA nos cálculos de política racial
  }

  // SEPPIR always included (real pre-2023 organ)
  if (orgao === 'SEPPIR') return null;

  // MIR bypass only for 2023+ (pre-2023 "MIR" is retroactive API reclassification of MDHC)
  if (orgao === 'MIR' || orgao.includes('IGUALDADE RACIAL') || orgao.includes('MIR/')) {
    const allPre2023 = registros.every(r => r.ano < 2023);
    if (!allPre2023) return null;
    // Pre-2023 "MIR" falls through to 5034 keyword check below
  }

  // Check 5034 — exclude unless racial keywords present in programa+descritivo (real API fields only)
  // publico_alvo is NEVER used — it's fabricated by ingestion, not from the API
  if (prog.includes('5034')) {
    const texto = registros.map(r => {
      return [r.programa, r.descritivo].filter(Boolean).join(' ');
    }).join(' ').toLowerCase();
    const hasRacialKw = ['racial', 'racismo', 'negro', 'negra', 'afro', 'quilomb', 'indigen', 'cigan', 'romani', 'terreiro', 'matriz africana', 'igualdade racial', 'palmares', 'capoeira', 'candomblé', 'umbanda'].some(kw => texto.includes(kw));
    if (!hasRacialKw) {
      return { excluded: true, reason: 'Prog. 5034/MDHC — ação sem palavras-chave raciais/étnicas (MIR pré-2023 = reclassificação retroativa)' };
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
      const { data, error } = await supabase.functions.invoke('reset-orcamento', {
        body: { esfera },
      });
      if (error) throw error;
      toast.success(data?.message || `Dados ${label} apagados com sucesso.`);
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

  // Classify all records by esfera + thematic (SESAI included in federal totals + separate tab)
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
      
      // SESAI goes to its dedicated tab AND to federal (included in calculations)
      if (theme === 'sesai') {
        result.sesai.push(item);
        if (item.esfera !== 'estadual' && item.esfera !== 'municipal') {
          result.federal.all.push(item);
          result.federal.byTheme.indigena.push(item); // SESAI = saúde indígena
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

  // Apply filters to get visible records per esfera
  const getFilteredRecords = (esfera: 'federal' | 'estadual' | 'municipal', filters: Record<ThematicFilter, boolean>) => {
    const data = classified[esfera];
    const result: DadoOrcamentario[] = [];
    for (const key of THEMATIC_FILTERS.map(f => f.key)) {
      if (filters[key]) result.push(...data.byTheme[key]);
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

  /** Check if a record is a non-racial 5034 action (should be excluded from calc).
   *  SEPPIR always included. MIR bypass only for ano >= 2023 (pre-2023 "MIR" = retroactive MDHC).
   *  Only checks real API fields: programa + descritivo. publico_alvo is fabricated and NEVER used. */
  const is5034NonRacial = (r: DadoOrcamentario): boolean => {
    if (!r.programa.toLowerCase().includes('5034')) return false;
    const orgUpper = (r.orgao || '').toUpperCase();
    if (orgUpper === 'SEPPIR') return false;
    if ((orgUpper === 'MIR' || orgUpper.includes('IGUALDADE RACIAL') || orgUpper.includes('MIR/')) && r.ano >= 2023) return false;
    const racialKws = ['racial', 'racismo', 'negro', 'negra', 'afro', 'quilomb', 'indigen', 'cigan', 'romani', 'terreiro', 'matriz africana', 'igualdade racial', 'palmares', 'capoeira', 'candomblé', 'umbanda'];
    const texto = [r.programa, r.descritivo].filter(Boolean).join(' ').toLowerCase();
    return !racialKws.some(kw => texto.includes(kw));
  };

  /** Compute per-esfera summary stats */
  const esferaStats = useMemo(() => {
    const compute = (records: DadoOrcamentario[], exclude5034Only: boolean) => {
      const valorEfetivo = (r: DadoOrcamentario) => Number(r.pago) || Number(r.dotacao_autorizada) || 0;
      const clean = exclude5034Only
        ? records.filter(r => !is5034NonRacial(r))
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

  // Dynamic stats based on toggle — when includeExcludedInCalc is true, add non-racial 5034 to totals
  // SESAI is ALWAYS included in totals now
  const dynamicStats = useMemo(() => {
    if (!stats) return null;
    if (!includeExcludedInCalc) {
      return {
        totalPeriodo1: stats.totalPeriodo1,
        totalPeriodo2: stats.totalPeriodo2,
        variacao: stats.variacao,
        totalRegistros: stats.totalRegistros,
        label: 'Inclui SESAI · Exclui 5034 não-racial',
      };
    }
    // Include excluded: add non-racial 5034 totals back in
    const valorEfetivo = (r: DadoOrcamentario) => Number(r.pago) || Number(r.dotacao_autorizada) || 0;
    const allExcluded = dadosOrcamentarios?.filter(r => is5034NonRacial(r)) || [];
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

      {/* Audit footer for top-level summary cards */}
      {hasData && !isLoading && (
        <div className="mb-4 -mt-4 px-1">
          <AuditFooter
            fontes={[
              { nome: 'Portal da Transparência — Execução Federal', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' },
              { nome: 'SIOP — Dotação Orçamentária', url: 'https://www.siop.planejamento.gov.br/siop/' },
            ]}
            documentos={['CERD/C/BRA/CO/18-20 §14', 'Plano de Durban §157-162']}
            compact
          />
        </div>
      )}

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
              <span>Ações 5034/MDHC sem palavras-chave raciais são marcadas como <Badge variant="outline" className="text-[10px] border-warning text-warning mx-1">Excluído do cálculo</Badge>. O toggle ao lado controla se entram nos totais. SESAI está sempre incluída.</span>
            </div>
            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap text-sm font-medium shrink-0">
              <Checkbox
                checked={includeExcludedInCalc}
                onCheckedChange={(checked) => setIncludeExcludedInCalc(!!checked)}
              />
              Incluir 5034 não-racial no cálculo
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
            <div className="space-y-6">
            {/* Infográfico: Programas e Ações por Grupo Focal */}
            {(() => {
              const allFederal = classified.federal.all.filter(r => !is5034NonRacial(r));
              const groups: { key: string; label: string; icon: React.ReactNode; color: string }[] = [
                { key: 'racial', label: 'Negros / Racial', icon: <Users className="w-4 h-4" />, color: 'hsl(var(--primary))' },
                { key: 'indigena', label: 'Indígenas', icon: <TreePine className="w-4 h-4" />, color: 'hsl(var(--success))' },
                { key: 'quilombola', label: 'Quilombolas', icon: <MapPin className="w-4 h-4" />, color: 'hsl(var(--chart-3))' },
                { key: 'ciganos', label: 'Ciganos', icon: <Tent className="w-4 h-4" />, color: 'hsl(var(--chart-4))' },
                { key: 'sesai', label: 'SESAI', icon: <Building className="w-4 h-4" />, color: 'hsl(var(--chart-5))' },
              ];
              const periodLabels = ['2018–2022', '2023–2025', 'Total'];
              const getGroupRecords = (key: string) => {
                if (key === 'sesai') return classified.sesai;
                return classified.federal.byTheme[key as ThematicFilter] || [];
              };

              const rows = groups.map(g => {
                const recs = getGroupRecords(g.key).filter(r => !is5034NonRacial(r));
                const p1 = recs.filter(r => r.ano >= 2018 && r.ano <= 2022);
                const p2 = recs.filter(r => r.ano >= 2023 && r.ano <= 2025);
                const progTotal = new Set(recs.map(r => r.programa)).size;
                const progP1 = new Set(p1.map(r => r.programa)).size;
                const progP2 = new Set(p2.map(r => r.programa)).size;
                const acoesTotal = recs.length;
                const acoesP1 = p1.length;
                const acoesP2 = p2.length;
                return { ...g, progP1, progP2, progTotal, acoesP1, acoesP2, acoesTotal };
              });

              const totalPrograms = new Set(allFederal.map(r => r.programa)).size;
              const totalActions = allFederal.length;

              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Info className="w-4 h-4 text-primary" />
                      Panorama: Programas e Ações por Grupo Focal e Período
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                      Quantidade de programas distintos e registros de ações orçamentárias classificados por grupo focal — esfera federal
                    </p>
                  </CardHeader>
                  <CardContent>
                    {/* Summary badges */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      <Badge className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/30">
                        {totalPrograms} programas distintos
                      </Badge>
                      <Badge className="text-sm px-3 py-1 bg-muted text-foreground border-border">
                        {totalActions} ações/registros totais
                      </Badge>
                    </div>

                    {/* Table */}
                    <div className="overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[160px]">Grupo Focal</TableHead>
                            <TableHead colSpan={3} className="text-center border-l">Programas</TableHead>
                            <TableHead colSpan={3} className="text-center border-l">Ações / Registros</TableHead>
                          </TableRow>
                          <TableRow>
                            <TableHead />
                            {periodLabels.map(p => <TableHead key={`p-${p}`} className="text-center text-xs border-l">{p}</TableHead>)}
                            {periodLabels.map(p => <TableHead key={`a-${p}`} className="text-center text-xs border-l">{p}</TableHead>)}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map(row => (
                            <TableRow key={row.key}>
                              <TableCell className="font-medium">
                                <div className="flex items-center gap-2">
                                  <span style={{ color: row.color }}>{row.icon}</span>
                                  <span className="text-sm">{row.label}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-center font-mono text-sm border-l">{row.progP1}</TableCell>
                              <TableCell className="text-center font-mono text-sm border-l">{row.progP2}</TableCell>
                              <TableCell className="text-center font-mono text-sm font-bold border-l">{row.progTotal}</TableCell>
                              <TableCell className="text-center font-mono text-sm border-l">{row.acoesP1}</TableCell>
                              <TableCell className="text-center font-mono text-sm border-l">{row.acoesP2}</TableCell>
                              <TableCell className="text-center font-mono text-sm font-bold border-l">{row.acoesTotal}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <AuditFooter
                      fontes={[
                        { nome: 'Portal da Transparência — Despesas', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' },
                        { nome: 'SIOP — Execução Orçamentária', url: 'https://www.siop.planejamento.gov.br/siop/' },
                      ]}
                      documentos={['CERD/C/BRA/CO/18-20 §14', 'Plano de Durban §157-162']}
                      compact
                    />
                  </CardContent>
                </Card>
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {evolucaoPorAno.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Evolução Orçamentária por Ano (Inclui SESAI · Exclui 5034 não-racial)</CardTitle></CardHeader>
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
                    <AuditFooter
                      fontes={[
                        { nome: 'Portal da Transparência — Despesas', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' },
                        { nome: 'Dados Abertos — LOA', url: 'https://dados.gov.br/dados/conjuntos-dados/orcamento-despesa' },
                      ]}
                      documentos={['CERD/C/BRA/CO/18-20 §14']}
                      compact
                    />
                  </CardContent>
                </Card>
              )}
              {porPrograma.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-base">Top 10 Programas por Execução (Inclui SESAI · Exclui 5034 não-racial)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {porPrograma.map((item: { programa: string; pago: number }, idx: number) => {
                        const maxVal = porPrograma[0]?.pago || 1;
                        const pct = (item.pago / maxVal) * 100;
                        return (
                          <div key={idx} className="group relative">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-mono text-muted-foreground w-5 text-right shrink-0">{idx + 1}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                  <p className="text-xs font-medium truncate" title={item.programa}>{item.programa}</p>
                                  <span className="text-xs font-bold text-foreground shrink-0">{formatCurrency(item.pago)}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2.5">
                                  <div
                                    className="h-2.5 rounded-full transition-all"
                                    style={{ width: `${pct}%`, backgroundColor: 'hsl(var(--chart-2))' }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <AuditFooter
                      fontes={[{ nome: 'Portal da Transparência — Programas', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' }]}
                      compact
                    />
                  </CardContent>
                </Card>
              )}
            </div>
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
            {/* Nota Explicativa */}
            <Card className="border-l-4 border-l-warning">
              <CardContent className="pt-4 pb-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">Nota Explicativa — Critérios e Dupla Perspectiva</h4>
                    <p className="text-xs text-muted-foreground">
                      Os valores utilizam <strong>exclusivamente campos reais da API</strong> (<code className="bg-muted px-1 rounded">programa</code> e <code className="bg-muted px-1 rounded">descritivo</code>). Campos internos (<code className="bg-muted px-1 rounded">publico_alvo</code>, <code className="bg-muted px-1 rounded">observacoes</code>) são ignorados.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      <strong>⚠️ Assimetria temporal:</strong> O Período 1 abrange <strong>5 anos</strong> (2018–2022) e o Período 2 apenas <strong>3 anos</strong> (2023–2025, sem dados de 2026). As variações percentuais comparam totais acumulados, não médias anuais.
                    </p>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-foreground">✅ Incluído:</p>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                          <li><strong>SESAI:</strong> Ações 20YP e 7684 (~R$ 1,3–2,7 bi/ano)</li>
                          <li><strong>FUNAI / MPI:</strong> Programas 2065 → 0617 → 5136</li>
                          <li><strong>MIR (2023+):</strong> Programas 5802, 5803, 5804</li>
                          <li><strong>SEPPIR (2018-2019):</strong> Programa 2034</li>
                        </ul>
                      </div>
                      <div className="space-y-1.5">
                        <p className="text-xs font-semibold text-destructive">❌ Excluído:</p>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                          <li><strong>5034/MDHC genérico:</strong> Ações sem palavras-chave raciais</li>
                          <li><strong>Transversais:</strong> Bolsa Família, MCMV, SUS, SUAS</li>
                          <li><strong>MIR retroativo pré-2023:</strong> Reclassificações da API filtradas</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ===== INFOGRÁFICO: EFEITO MASCARAMENTO SESAI ===== */}
            {stats?.porAnoDetalhado && stats?.semSesai?.porAnoDetalhado && (
              <SesaiMaskingInfographic
                porAnoDetalhado={stats.porAnoDetalhado}
                semSesaiPorAnoDetalhado={stats.semSesai.porAnoDetalhado}
                formatCurrency={formatCurrency}
                formatCurrencyFull={formatCurrencyFull}
              />
            )}

            {/* ===== PERSPECTIVA 1: TOTAL (COM SESAI) ===== */}
            <div>
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <Building className="w-5 h-5 text-chart-1" />
                Perspectiva 1 — Investimento Federal Total (com SESAI)
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Inclui a Saúde Indígena (SESAI), que representa <strong>~90% do total em 2018–2022</strong> e <strong>~60-85% em 2023–2025</strong>. A SESAI cresceu de forma contínua e independente da política racial, mascarando o desmonte institucional de 2019–2022.
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-t-4 border-t-chart-1">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Dotação Autorizada</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div><p className="text-[10px] text-muted-foreground">2018–2022 (5 anos)</p><p className="text-lg font-bold">{formatCurrency(stats?.dotacaoPeriodo1 || 0)}</p></div>
                      <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025 (3 anos)</p><p className="text-lg font-bold text-success">{formatCurrency(stats?.dotacaoPeriodo2 || 0)}</p></div>
                    </div>
                    <div className={`text-center py-1 rounded text-sm font-bold ${(stats?.variacaoDotacao || 0) >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {(stats?.variacaoDotacao || 0) >= 0 ? '+' : ''}{(stats?.variacaoDotacao || 0).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-t-4 border-t-chart-2">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Liquidado</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(stats?.liquidadoPeriodo1 || 0)}</p></div>
                      <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(stats?.liquidadoPeriodo2 || 0)}</p></div>
                    </div>
                    <div className={`text-center py-1 rounded text-sm font-bold ${(stats?.variacaoLiquidado || 0) >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {(stats?.variacaoLiquidado || 0) >= 0 ? '+' : ''}{(stats?.variacaoLiquidado || 0).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-t-4 border-t-chart-3">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pago</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(stats?.pagoPeriodo1 || 0)}</p></div>
                      <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(stats?.pagoPeriodo2 || 0)}</p></div>
                    </div>
                    <div className={`text-center py-1 rounded text-sm font-bold ${(stats?.variacaoPago || 0) >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {(stats?.variacaoPago || 0) >= 0 ? '+' : ''}{(stats?.variacaoPago || 0).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>
              <AuditFooter
                fontes={[
                  { nome: 'Portal da Transparência — Despesas Federais', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' },
                  { nome: 'Dados Abertos — LOA (dotação)', url: 'https://dados.gov.br/dados/conjuntos-dados/orcamento-despesa' },
                ]}
                documentos={['CERD/C/BRA/CO/18-20 §14', 'Plano de Durban §157']}
              />
            </div>

            {/* ===== PERSPECTIVA 2: SEM SESAI ===== */}
            <div>
              <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-chart-4" />
                Perspectiva 2 — Políticas Raciais <em>stricto sensu</em> (sem SESAI)
              </h3>
              <p className="text-xs text-muted-foreground mb-4">
                Exclui a SESAI para isolar o investimento específico em igualdade racial, povos indígenas (FUNAI/MPI) e quilombolas. <strong>Esta é a perspectiva que revela o real desmonte (2019–2022) e a reconstrução (2023+).</strong>
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card className="border-t-4 border-t-chart-4">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Dotação (sem SESAI)</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(stats?.semSesai?.dotacaoP1 || 0)}</p></div>
                      <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(stats?.semSesai?.dotacaoP2 || 0)}</p></div>
                    </div>
                    <div className={`text-center py-1 rounded text-sm font-bold ${(stats?.semSesai?.variacaoDotacao || 0) >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {(stats?.semSesai?.variacaoDotacao || 0) >= 0 ? '+' : ''}{(stats?.semSesai?.variacaoDotacao || 0).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-t-4 border-t-chart-5">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Liquidado (sem SESAI)</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(stats?.semSesai?.liquidadoP1 || 0)}</p></div>
                      <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(stats?.semSesai?.liquidadoP2 || 0)}</p></div>
                    </div>
                    <div className={`text-center py-1 rounded text-sm font-bold ${(stats?.semSesai?.variacaoLiquidado || 0) >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {(stats?.semSesai?.variacaoLiquidado || 0) >= 0 ? '+' : ''}{(stats?.semSesai?.variacaoLiquidado || 0).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-t-4 border-t-primary">
                  <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pago (sem SESAI)</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between items-end">
                      <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(stats?.semSesai?.pagoP1 || 0)}</p></div>
                      <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(stats?.semSesai?.pagoP2 || 0)}</p></div>
                    </div>
                    <div className={`text-center py-1 rounded text-sm font-bold ${(stats?.semSesai?.variacaoPago || 0) >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                      {(stats?.semSesai?.variacaoPago || 0) >= 0 ? '+' : ''}{(stats?.semSesai?.variacaoPago || 0).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>
              </div>
              <AuditFooter
                fontes={[
                  { nome: 'Portal Transparência — MIR (OS67000)', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS67000' },
                  { nome: 'Portal Transparência — FUNAI (OS52000)', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026&orgaos=OS52000' },
                ]}
                documentos={['Cálculo: Total − SESAI (20YP+7684)']}
              />
            </div>

            {/* ===== RESUMO INFORMATIVO: PROGRAMAS E AÇÕES POR GRUPO FOCAL ===== */}
            {dadosOrcamentarios && dadosOrcamentarios.length > 0 && (() => {
              // Classify into focal groups using classifyThematic
              type FocalKey = 'racial' | 'indigena' | 'quilombola' | 'ciganos' | 'sesai';
              const focalLabels: Record<FocalKey, string> = {
                racial: 'Política Racial (Negros)',
                indigena: 'Povos Indígenas (FUNAI/MPI)',
                quilombola: 'Quilombolas',
                ciganos: 'Ciganos/Romani',
                sesai: 'SESAI (Saúde Indígena)',
              };

              const cleanRecords = dadosOrcamentarios.filter(r => !is5034NonRacial(r));
              const anos = Array.from(new Set(cleanRecords.map(r => r.ano))).sort();

              // Build stats per focal group per year
              const focalData: Record<FocalKey, Record<number, { programas: Set<string>; acoes: number; dotacao: number; liquidado: number }>> = {
                racial: {}, indigena: {}, quilombola: {}, ciganos: {}, sesai: {},
              };

              for (const r of cleanRecords) {
                const theme = classifyThematic(r) as FocalKey;
                if (!focalData[theme]) continue;
                if (!focalData[theme][r.ano]) {
                  focalData[theme][r.ano] = { programas: new Set(), acoes: 0, dotacao: 0, liquidado: 0 };
                }
                const entry = focalData[theme][r.ano];
                entry.programas.add(r.programa);
                entry.acoes += 1;
                entry.dotacao += Number(r.dotacao_autorizada) || 0;
                entry.liquidado += Number(r.liquidado) || 0;
              }

              // Period totals
              const periodTotals = (focal: FocalKey, startYear: number, endYear: number) => {
                const yearEntries = Object.entries(focalData[focal]).filter(([y]) => Number(y) >= startYear && Number(y) <= endYear);
                const allProgs = new Set<string>();
                let acoes = 0, dotacao = 0, liquidado = 0;
                for (const [, v] of yearEntries) {
                  v.programas.forEach(p => allProgs.add(p));
                  acoes += v.acoes;
                  dotacao += v.dotacao;
                  liquidado += v.liquidado;
                }
                return { programas: allProgs.size, acoes, dotacao, liquidado };
              };

              const focalKeys: FocalKey[] = ['racial', 'indigena', 'quilombola', 'ciganos', 'sesai'];

              return (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-5 h-5 text-primary" />
                      Resumo por Grupo Focal — Programas, Ações e Execução
                    </CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      Quantidade de programas e ações orçamentárias por grupo focal, com valores de dotação autorizada vs. liquidado (R$).
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Totais por período */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Totais por Período</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Grupo Focal</TableHead>
                            <TableHead className="text-center" colSpan={4}>2018–2022</TableHead>
                            <TableHead className="text-center" colSpan={4}>2023–2025</TableHead>
                          </TableRow>
                          <TableRow>
                            <TableHead></TableHead>
                            <TableHead className="text-right text-[10px]">Prog.</TableHead>
                            <TableHead className="text-right text-[10px]">Ações</TableHead>
                            <TableHead className="text-right text-[10px]">Dotação</TableHead>
                            <TableHead className="text-right text-[10px]">Liquidado</TableHead>
                            <TableHead className="text-right text-[10px]">Prog.</TableHead>
                            <TableHead className="text-right text-[10px]">Ações</TableHead>
                            <TableHead className="text-right text-[10px]">Dotação</TableHead>
                            <TableHead className="text-right text-[10px]">Liquidado</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {focalKeys.map(key => {
                            const p1 = periodTotals(key, 2018, 2022);
                            const p2 = periodTotals(key, 2023, 2026);
                            if (p1.acoes === 0 && p2.acoes === 0) return null;
                            return (
                              <TableRow key={key}>
                                <TableCell className="font-medium text-xs">{focalLabels[key]}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{p1.programas}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{p1.acoes}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{formatCurrency(p1.dotacao)}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{formatCurrency(p1.liquidado)}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{p2.programas}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{p2.acoes}</TableCell>
                                <TableCell className="text-right font-mono text-xs text-success">{formatCurrency(p2.dotacao)}</TableCell>
                                <TableCell className="text-right font-mono text-xs text-success">{formatCurrency(p2.liquidado)}</TableCell>
                              </TableRow>
                            );
                          })}
                          {/* Total row */}
                          {(() => {
                            const allP1 = focalKeys.reduce((acc, k) => {
                              const t = periodTotals(k, 2018, 2022);
                              return { programas: acc.programas + t.programas, acoes: acc.acoes + t.acoes, dotacao: acc.dotacao + t.dotacao, liquidado: acc.liquidado + t.liquidado };
                            }, { programas: 0, acoes: 0, dotacao: 0, liquidado: 0 });
                            const allP2 = focalKeys.reduce((acc, k) => {
                              const t = periodTotals(k, 2023, 2026);
                              return { programas: acc.programas + t.programas, acoes: acc.acoes + t.acoes, dotacao: acc.dotacao + t.dotacao, liquidado: acc.liquidado + t.liquidado };
                            }, { programas: 0, acoes: 0, dotacao: 0, liquidado: 0 });
                            return (
                              <TableRow className="border-t-2 font-bold">
                                <TableCell className="text-xs">TOTAL</TableCell>
                                <TableCell className="text-right font-mono text-xs">{allP1.programas}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{allP1.acoes}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{formatCurrency(allP1.dotacao)}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{formatCurrency(allP1.liquidado)}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{allP2.programas}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{allP2.acoes}</TableCell>
                                <TableCell className="text-right font-mono text-xs text-success">{formatCurrency(allP2.dotacao)}</TableCell>
                                <TableCell className="text-right font-mono text-xs text-success">{formatCurrency(allP2.liquidado)}</TableCell>
                              </TableRow>
                            );
                          })()}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Ano a ano por grupo focal */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3">Detalhamento Ano a Ano</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-12">Ano</TableHead>
                            {focalKeys.filter(k => {
                              return Object.keys(focalData[k]).length > 0;
                            }).map(key => (
                              <TableHead key={key} className="text-center text-[10px]" colSpan={2}>{focalLabels[key].split('(')[0].trim()}</TableHead>
                            ))}
                          </TableRow>
                          <TableRow>
                            <TableHead></TableHead>
                            {focalKeys.filter(k => Object.keys(focalData[k]).length > 0).map(key => (
                              <React.Fragment key={key}>
                                <TableHead className="text-right text-[9px] text-muted-foreground">Dotação</TableHead>
                                <TableHead className="text-right text-[9px] text-muted-foreground">Liquidado</TableHead>
                              </React.Fragment>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {anos.map(ano => {
                            const activeFocals = focalKeys.filter(k => Object.keys(focalData[k]).length > 0);
                            return (
                              <TableRow key={ano} className={ano === 2023 ? 'border-t-2 border-t-chart-2' : ''}>
                                <TableCell className="font-bold text-xs">{ano}</TableCell>
                                {activeFocals.map(key => {
                                  const d = focalData[key][ano];
                                  return (
                                    <React.Fragment key={key}>
                                      <TableCell className="text-right font-mono text-[10px]">{d ? formatCurrency(d.dotacao) : '—'}</TableCell>
                                      <TableCell className="text-right font-mono text-[10px]">{d ? formatCurrency(d.liquidado) : '—'}</TableCell>
                                    </React.Fragment>
                                  );
                                })}
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    <AuditFooter
                      fontes={[
                        { nome: 'Portal da Transparência — Execução Federal', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' },
                        { nome: 'SIOP — Dotação Orçamentária', url: 'https://www.siop.planejamento.gov.br/siop/' },
                      ]}
                      documentos={['CERD/C/BRA/CO/18-20 §14', 'Plano de Durban §157-162']}
                    />
                  </CardContent>
                </Card>
              );
            })()}

            {/* ===== TABELA ANO A ANO ===== */}
            {stats?.porAnoDetalhado && stats?.semSesai?.porAnoDetalhado && (
              <Card>
                <CardHeader><CardTitle className="text-base">Evolução Ano a Ano — Total vs. Sem SESAI (Pago, R$)</CardTitle></CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Ano</TableHead>
                        <TableHead className="text-right">Total (com SESAI)</TableHead>
                        <TableHead className="text-right">SESAI</TableHead>
                        <TableHead className="text-right">Sem SESAI</TableHead>
                        <TableHead className="text-right">% SESAI</TableHead>
                        <TableHead>Interpretação</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map(ano => {
                        const total = stats.porAnoDetalhado[ano]?.pago || 0;
                        const semSesaiVal = stats.semSesai?.porAnoDetalhado[ano]?.pago || 0;
                        const sesaiVal = total - semSesaiVal;
                        const pctSesai = total > 0 ? (sesaiVal / total * 100) : 0;
                        const interpretacoes: Record<number, string> = {
                          2018: 'Base: SEPPIR ativa + FUNAI com 5 ações. SESAI domina.',
                          2019: 'Queda real sem SESAI: extinção da SEPPIR, MDHC assume.',
                          2020: 'Programa 5034 genérico (filtrado). MPI aparece. SESAI estável.',
                          2021: 'Vale do desmonte: apenas FUNAI + MPI residual.',
                          2022: 'Ponto mais baixo relativo. SESAI cresce independentemente.',
                          2023: 'Reconstrução: criação do MIR. Salto de +70% sem SESAI.',
                          2024: 'Expansão: MPI R$ 307 mi + MIR execução recorde (~99%).',
                          2025: 'Explosão: MPI R$ 1,4 bi + MIR R$ 103 mi. Recorde histórico.',
                        };
                        return (
                          <TableRow key={ano} className={ano === 2023 ? 'border-t-2 border-t-chart-2' : ''}>
                            <TableCell className="font-bold">{ano}</TableCell>
                            <TableCell className="text-right font-mono text-xs">{formatCurrencyFull(total)}</TableCell>
                            <TableCell className="text-right font-mono text-xs text-muted-foreground">{formatCurrencyFull(sesaiVal)}</TableCell>
                            <TableCell className="text-right font-mono text-xs font-semibold">{formatCurrencyFull(semSesaiVal)}</TableCell>
                            <TableCell className="text-right text-xs">{pctSesai.toFixed(0)}%</TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-[250px]">{interpretacoes[ano]}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <AuditFooter
                    fontes={[
                      { nome: 'Portal da Transparência — Execução por Ano', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' },
                      { nome: 'SESAI — Ações 20YP/7684', url: 'https://portaldatransparencia.gov.br/despesas/consulta?de=01%2F01%2F2018&ate=31%2F12%2F2026&paginacaoSimples=true' },
                    ]}
                    documentos={['CERD/C/BRA/CO/18-20', 'Plano de Durban §157-162']}
                  />
                </CardContent>
              </Card>
            )}

            {/* ===== CONCLUSÃO INTERPRETATIVA ===== */}
            <Card className="border-l-4 border-l-primary">
              <CardContent className="pt-4 pb-3">
                <h4 className="font-semibold text-sm mb-3">📊 Conclusão Interpretativa</h4>
                <div className="text-xs text-muted-foreground space-y-3">
                  <div>
                    <p className="font-semibold text-foreground mb-1">A divisão em dois períodos é válida?</p>
                    <p><strong>Sim, mas com ressalvas fundamentais.</strong> A fronteira 2022→2023 marca a criação do MIR e o reinício da política racial institucional. Porém, a análise ano a ano revela nuances que o comparativo binário oculta:</p>
                  </div>
                  <ul className="list-disc pl-4 space-y-1.5">
                    <li><strong>2018–2019 (Base modesta):</strong> A SEPPIR operou com R$ 5–20 mi/ano de execução real. Não é um "período de ouro" — é o ponto de partida frágil.</li>
                    <li><strong>2020 (Ano atípico):</strong> O programa 5034 gerou distorção estatística. MPI aparece como novo órgão. Dados filtrados para evitar inflação artificial.</li>
                    <li><strong>2021–2022 (Vale do desmonte):</strong> O investimento racial (sem SESAI) caiu para R$ 60–63 mi. A SESAI cresceu independentemente, mascarando a queda.</li>
                    <li><strong>2023 (Reconstrução):</strong> Criação do MIR. Sem SESAI, o pago subiu para ~R$ 107 mi (+70% sobre 2022).</li>
                    <li><strong>2024–2025 (Salto histórico):</strong> O MPI explodiu para R$ 307 mi (2024) e R$ 1,4 bi (2025). O MIR atingiu ~99% de execução. <strong>Pela primeira vez, as políticas raciais sem SESAI superam R$ 1 bilhão.</strong></li>
                  </ul>
                  <div className="bg-muted/50 rounded p-3 mt-3">
                    <p className="font-semibold text-foreground mb-1">🔑 Achado Central</p>
                    <p>A SESAI representou <strong>~95% do total em 2018–2019</strong> e <strong>~56% em 2025</strong>. A queda percentual da SESAI não indica redução, mas sim o <em>crescimento exponencial das demais políticas</em> — evidência robusta de reconstrução institucional. O desmonte de 2019–2022 só é visível ao isolar a SESAI, o que torna a dupla perspectiva analiticamente indispensável.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* SESAI — Detalhamento */}
            <Card className="border-l-4 border-l-chart-2">
              <CardContent className="pt-4 pb-3">
                <h4 className="font-semibold text-sm flex items-center gap-2 mb-2">
                  <TreePine className="w-4 h-4 text-chart-2" />
                  SESAI (Saúde Indígena) — Papel no Cálculo
                </h4>
                <div className="text-xs text-muted-foreground space-y-2">
                  <p>A SESAI é <strong>incluída integralmente</strong> nos totais federais (Perspectiva 1), mas apresentada separadamente (Perspectiva 2) para revelar a dinâmica real das políticas raciais.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="bg-muted/50 rounded p-2">
                      <p className="font-semibold text-foreground text-[11px]">P1 (2018–2022): ~R$ {formatCurrency(stats?.sesaiPagoP1 || 0)}</p>
                      <p className="text-[10px]">Crescimento orgânico de R$ 1,40 bi → R$ 1,54 bi. Independente de decisões de política racial.</p>
                    </div>
                    <div className="bg-muted/50 rounded p-2">
                      <p className="font-semibold text-foreground text-[11px]">P2 (2023–2025): ~R$ {formatCurrency(stats?.sesaiPagoP2 || 0)}</p>
                      <p className="text-[10px]">Salto para R$ 1,96–2,71 bi. Crescimento acelerado, mas estruturalmente separado da pauta racial.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Variação consolidada */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stats && stats.variacao > 0 ? 'bg-success/10' : 'bg-destructive/10'}`}>
                    <TrendingUp className={`w-8 h-8 ${stats && stats.variacao > 0 ? 'text-success' : 'text-destructive'}`} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">Variação Consolidada 2018-22 → 2023-25</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <div>
                        <p className="text-[10px] text-muted-foreground">Pago (com SESAI)</p>
                        <p className={`text-xl font-bold ${(stats?.variacaoPago || 0) > 0 ? 'text-success' : 'text-destructive'}`}>
                          {(stats?.variacaoPago || 0) > 0 ? '+' : ''}{(stats?.variacaoPago || 0).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground font-semibold">Pago (sem SESAI)</p>
                        <p className={`text-xl font-bold ${(stats?.semSesai?.variacaoPago || 0) > 0 ? 'text-success' : 'text-destructive'}`}>
                          {(stats?.semSesai?.variacaoPago || 0) > 0 ? '+' : ''}{(stats?.semSesai?.variacaoPago || 0).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Liquidado (sem SESAI)</p>
                        <p className={`text-xl font-bold ${(stats?.semSesai?.variacaoLiquidado || 0) > 0 ? 'text-success' : 'text-destructive'}`}>
                          {(stats?.semSesai?.variacaoLiquidado || 0) > 0 ? '+' : ''}{(stats?.semSesai?.variacaoLiquidado || 0).toFixed(1)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground">Dotação (sem SESAI)</p>
                        <p className={`text-xl font-bold ${(stats?.semSesai?.variacaoDotacao || 0) > 0 ? 'text-success' : 'text-destructive'}`}>
                          {(stats?.semSesai?.variacaoDotacao || 0) > 0 ? '+' : ''}{(stats?.semSesai?.variacaoDotacao || 0).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      ⚠️ P1 = 5 anos · P2 = 3 anos. Variação de totais acumulados, não de médias anuais.
                    </p>
                  </div>
                  <AuditFooter
                    fontes={[{ nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' }]}
                    documentos={['CERD/C/BRA/CO/18-20 §14']}
                    compact
                  />
                </div>
              </CardContent>
            </Card>

            {/* Evolução por ano — Gráfico duplo */}
            {stats?.porAnoDetalhado && stats?.semSesai?.porAnoDetalhado && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Evolução Anual — Total (com SESAI)</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(stats.porAnoDetalhado).map(([ano, v]) => ({ ano: Number(ano), ...v })).sort((a, b) => a.ano - b.ano)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                          <Tooltip formatter={(value: number, name: string) => [formatCurrencyFull(value), name === 'dotacao' ? 'Dotação' : name === 'liquidado' ? 'Liquidado' : 'Pago']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                          <Legend verticalAlign="top" height={30} />
                          <Bar dataKey="dotacao" name="Dotação" fill="hsl(var(--chart-1))" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="liquidado" name="Liquidado" fill="hsl(var(--chart-2))" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="pago" name="Pago" fill="hsl(var(--chart-3))" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <AuditFooter fontes={[{ nome: 'Portal da Transparência', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' }]} compact />
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-sm">Evolução Anual — Sem SESAI</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={Object.entries(stats.semSesai.porAnoDetalhado).map(([ano, v]) => ({ ano: Number(ano), ...v })).sort((a, b) => a.ano - b.ano)}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                          <Tooltip formatter={(value: number, name: string) => [formatCurrencyFull(value), name === 'dotacao' ? 'Dotação' : name === 'liquidado' ? 'Liquidado' : 'Pago']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                          <Legend verticalAlign="top" height={30} />
                          <Bar dataKey="dotacao" name="Dotação" fill="hsl(var(--chart-4))" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="liquidado" name="Liquidado" fill="hsl(var(--chart-5))" radius={[3, 3, 0, 0]} />
                          <Bar dataKey="pago" name="Pago" fill="hsl(var(--primary))" radius={[3, 3, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <AuditFooter fontes={[{ nome: 'Portal da Transparência — Sem SESAI', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' }]} documentos={['Cálculo: Total − SESAI']} compact />
                  </CardContent>
                </Card>
              </div>
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
                  <h4 className="font-semibold text-foreground text-base">2. Metodologia de Filtragem em Quatro Camadas</h4>
                  <p>A ingestão de dados utiliza filtragem em quatro camadas auditáveis:</p>
                  
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div>
                      <h5 className="font-semibold text-foreground">Camada 1 — Programas Temáticos do PPA</h5>
                      <p>Consulta direta por código de programa finalístico: <code>2034</code> (SEPPIR, PPA 2016-2019), <code>5034</code> (MDHC/MIR, desde 2020), <code>0617</code> (Povos Indígenas PPA 2020-2023), <code>2065</code> (Povos Indígenas PPA 2012-2019), <code>5136</code> (Povos Indígenas PPA 2024+), <code>5802</code>/<code>5803</code>/<code>5804</code> (MIR, desde 2024), <code>0153</code> (Criança/Adolescente).</p>
                      <p className="text-destructive font-medium mt-1">Exclusão explícita: Programa <code>5113</code> (Educação Superior) — genérico, distorce totais (R$ 14 bi).</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground">Camada 2 — Subfunção 422</h5>
                      <p>Direitos Individuais, Coletivos e Difusos. Captura ações não vinculadas aos programas acima, validadas por palavras-chave raciais/étnicas.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground">Camada 3 — Órgãos com Mandato Direto</h5>
                      <p>MIR (código 67000) e MPI (código 92000). Captura toda despesa desses órgãos, deduplicada contra camadas anteriores. Para 2018–2022, dados vêm de SEPPIR, FUNAI e INCRA.</p>
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground">Camada 4 — Ações Específicas SESAI</h5>
                      <p>Consulta direta por código de ação (<code>20YP</code> e <code>7684</code>). Necessária porque a SESAI migrou do programa indígena (2065/0617) para o programa de saúde (5022) no PPA 2020-2023, ficando fora das Camadas 1-3.</p>
                    </div>
                  </div>
                </section>

                {/* 3. Classificação Temática */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">3. Classificação Temática — Campos Reais da API</h4>
                  <p>A classificação utiliza <strong>exclusivamente</strong> campos reais retornados pela API oficial: <code className="bg-muted px-1 rounded">programa</code> e <code className="bg-muted px-1 rounded">descritivo</code>. Campos como <code className="bg-muted px-1 rounded">publico_alvo</code>, <code className="bg-muted px-1 rounded">observacoes</code> e <code className="bg-muted px-1 rounded">razao_selecao</code> são metadados internos gerados pelo sistema de ingestão e <strong>não são usados</strong> na lógica de inclusão/exclusão.</p>
                  <div className="bg-destructive/10 rounded-lg p-3 mt-2 mb-3">
                    <p className="text-xs text-destructive font-medium">⚠ Correção aplicada: O campo <code>publico_alvo</code> era fabricado pela função de ingestão com um fallback genérico ("População em situação de vulnerabilidade racial/étnica"), causando falsos positivos como a ação 00SO (Socioeducativo). Todos os registros foram corrigidos com <code>publico_alvo = NULL</code>.</p>
                  </div>
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
                        <TableCell className="font-medium">Política Racial (Federal)</TableCell>
                        <TableCell>MIR, MDHC, SEPPIR; Programas 2034, 5034 (com filtro), 5804; Subfunção 422</TableCell>
                        <TableCell>Inclui SESAI nos totais; 5034 filtrado por palavras-chave</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Povos Indígenas</TableCell>
                        <TableCell>FUNAI, MPI; Programas 2065 → 0617 → 5136</TableCell>
                        <TableCell>Transição entre PPAs rastreada</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Quilombolas</TableCell>
                        <TableCell>INCRA; Ações 20G7, 0859; Programa 5802</TableCell>
                        <TableCell>Lacuna: dados 2020–2023 parciais</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">Ciganos/Romani</TableCell>
                        <TableCell>Palavras-chave: cigano, romani, povo cigano</TableCell>
                        <TableCell>Dados escassos em toda a série</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="font-medium">SESAI (Saúde Indígena)</TableCell>
                        <TableCell>Ações 20YP (Atenção à Saúde) e 7684 (Saneamento em Aldeias)</TableCell>
                        <TableCell>~R$ 1,3–1,5 bi/ano; Camada 4 dedicada</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                  <p className="text-xs mt-2"><strong>Palavras-chave de inclusão:</strong> racial, racismo, negro/a, afro, quilomb*, indigen*, indígen*, cigan*, romani, terreiro, matriz africana, igualdade racial, palmares, capoeira, candomblé, umbanda.</p>
                </section>

                {/* 4. SESAI — Detalhamento Técnico */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">4. SESAI (Saúde Indígena) — Detalhamento Técnico</h4>
                  <p>A Secretaria Especial de Saúde Indígena representa o maior volume financeiro individual da política indígena. Sua captura exigiu ajustes significativos:</p>
                  
                  <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                    <div>
                      <h5 className="font-semibold text-foreground">Mudanças de Código entre PPAs</h5>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li><strong>PPA 2016-2019 (Programa 2065):</strong> Ações 20YP e 7684 vinculadas ao programa temático de Povos Indígenas. Captura automática pela Camada 1.</li>
                        <li><strong>PPA 2020-2023 (Migração → Programa 5022):</strong> A SESAI foi reclassificada para o programa genérico de Saúde, <strong>saindo da órbita dos programas indígenas</strong> (0617). As Camadas 1-3 não capturavam mais esses dados. A <strong>Camada 4</strong> foi criada especificamente para resolver isso.</li>
                        <li><strong>PPA 2024-2027 (Programa 5022 mantido):</strong> Estrutura mantida sob programa de saúde. Camada 4 continua necessária.</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground">Ações Capturadas</h5>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li><strong>20YP</strong> — Atenção à Saúde dos Povos Indígenas (~R$ 1,37–1,47 bi/ano pago)</li>
                        <li><strong>7684</strong> — Saneamento Básico em Aldeias para Prevenção de Agravos (~R$ 23–29 mi/ano pago)</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-semibold text-foreground">Tratamento no Cálculo</h5>
                      <p className="mt-1">Registros SESAI são alocados simultaneamente na aba "SESAI (Saúde Indígena)" para análise detalhada <strong>e</strong> nos totais de "Política Racial (Federal)", garantindo que o investimento componha o somatório consolidado.</p>
                    </div>
                  </div>
                </section>

                {/* 4b. Exclusões do Programa 5034 */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">4b. Exclusões do Programa 5034/MDHC</h4>
                  <p>O Programa 5034 funcionava como <strong>guarda-chuva do MDHC</strong>, agregando políticas de igualdade racial, mulheres, idosos e proteção social genérica. Apenas ações com palavras-chave raciais nos campos <code className="bg-muted px-1 rounded">programa</code> ou <code className="bg-muted px-1 rounded">descritivo</code> são incluídas.</p>
                  <div className="bg-destructive/10 rounded-lg p-3 mt-2 space-y-2">
                    <p className="text-xs text-destructive font-semibold">Ações explicitamente excluídas:</p>
                    <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                      <li><strong>0E85</strong> — Subsídios a operações em fundos de saúde (genérica)</li>
                      <li><strong>14XS</strong> — Gestão administrativa (overhead)</li>
                      <li><strong>00SN</strong> — Casas da Mulher Brasileira (política de gênero, não racial)</li>
                      <li><strong>00SO</strong> — Unidades de Atendimento Socioeducativo (genérica; era incluída erroneamente pelo campo fabricado <code>publico_alvo</code> — corrigida)</li>
                      <li><strong>21AR, 21AS, 21AT, 21AU</strong> — Ações administrativas e de gestão do MDHC</li>
                    </ul>
                    <p className="text-xs text-destructive font-semibold mt-2">Bypass Temporal MIR pré-2023:</p>
                    <p className="text-xs text-muted-foreground">A API retroativamente rotula registros do MDHC (2020-2022) como MIR (órgão 67000). Ações genéricas são excluídas; apenas mantidas se contêm palavras-chave raciais nos campos reais.</p>
                  </div>
                </section>

                {/* 5. Padrão Nuançado da Série */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base">5. Padrão Nuançado da Série 2018–2025</h4>
                  <p>Após a exclusão de ações não-raciais do Programa 5034/MDHC, a série revela um padrão mais nuançado (SESAI incluída):</p>
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
                      <li><strong>Federal (2018–2025):</strong> API do Portal da Transparência + CSV LOA, com as 4 camadas de filtragem (Programas PPA, Subfunção 422, Órgãos, Ações SESAI).</li>
                      <li><strong>Estadual (2018–2025):</strong> Todas as <strong>27 UFs</strong> via RREO/DCA do SICONFI, filtradas exclusivamente por <strong>palavras-chave raciais/étnicas</strong> e contas específicas (<code className="bg-muted px-1 rounded">assistência aos indígenas</code>). <span className="text-xs italic">Nota: Função 14 e Subfunção 422 são referências estruturais da classificação orçamentária, mas não são usadas como filtros independentes na ingestão estadual/municipal — seus descritivos genéricos ("Direitos da Cidadania", "Direitos Individuais, Coletivos e Difusos") gerariam falsos positivos.</span></li>
                      <li><strong>Municipal (2018–2025):</strong> Todos os <strong>5.570 municípios brasileiros</strong> via RREO/DCA do SICONFI, com os mesmos critérios de filtragem do estadual (palavras-chave + contas específicas). A lista de municípios é obtida dinamicamente do endpoint <code className="bg-muted px-1 rounded">/entes</code> do SICONFI, garantindo cobertura total e atualizada.</li>
                    </ul>
                    <p className="text-xs">Todos os registros incluem: órgão responsável, descritivo da conta, público-alvo, razão de seleção (critério de inclusão), fonte de dados e link direto para o SICONFI. A ingestão municipal é orquestrada por UF (1 chamada por estado), permitindo processamento incremental e controle de progresso.</p>
                    
                    <div className="mt-3 space-y-2">
                      <h5 className="font-semibold text-foreground text-sm">Palavras-chave raciais/étnicas utilizadas no filtro subnacional:</h5>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "racial", "racismo", "igualdade racial", "igualdade étnica",
                          "quilombola", "indígena", "cigano", "romani",
                          "terreiro", "matriz africana", "afro",
                          "promoção da igualdade", "cultura negra",
                          "capoeira", "negro", "negra", "candomblé", "umbanda",
                          "povos tradicionais", "comunidades tradicionais",
                        ].map(kw => (
                          <code key={kw} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{kw}</code>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 font-semibold">Radicais adicionais utilizados na filtragem (capturam variações):</p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "indígen / indigen", "quilombol", "cigan", "étnic / etnia",
                          "palmares", "funai", "sesai",
                        ].map(kw => (
                          <code key={kw} className="bg-primary/10 border border-primary/30 px-1.5 py-0.5 rounded text-xs font-mono">{kw}</code>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">Os radicais capturam todas as variações morfológicas (ex: <code className="bg-muted px-1 rounded">indígen</code> → "indígena", "indígenas", "indigenista"; <code className="bg-muted px-1 rounded">quilombol</code> → "quilombola", "quilombolas", "quilombos"). Além das palavras-chave, contas RREO/DCA cujas descrições incluem <code className="bg-muted px-1 rounded">assistência aos indígenas</code> são capturadas automaticamente. A razão de seleção é registrada no campo <em>razao_selecao</em> de cada ficha para auditoria.</p>
                    </div>
                  </div>
                </section>

                {/* 9. Limitações */}
                <section className="space-y-2">
                  <h4 className="font-semibold text-foreground text-base text-destructive">9. Limitações Conhecidas</h4>
                  <p className="text-sm text-muted-foreground italic">Atualizado em fev/2026 com base na auditoria da base de dados.</p>
                  
                  <div className="space-y-3">
                    <div className="p-3 rounded-md border border-green-500/30 bg-green-500/5">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">✅ Limitações Superadas</p>
                      <ul className="list-disc pl-5 space-y-1.5 text-sm">
                        <li><strong>Povos Indígenas (FUNAI/MPI):</strong> <span className="line-through text-muted-foreground">Faltavam dados de execução para 2020–2023.</span> <strong className="text-green-700 dark:text-green-400">Resolvido</strong> — FUNAI possui registros de execução (pago + liquidado) para todos os anos de 2018 a 2023; MPI cobre 2020–2025 com dados completos incluindo o salto de R$ 1,4 bi em 2025.</li>
                        <li><strong>SESAI (Saúde Indígena):</strong> <span className="line-through text-muted-foreground">Dados parciais ou ausentes.</span> <strong className="text-green-700 dark:text-green-400">Resolvido</strong> — Cobertura completa 2018–2025 via Camada 4 (ações 20YP e 7684). Série contínua com dados de execução para todos os anos. Incluída integralmente nos totais federais.</li>
                      </ul>
                    </div>

                    <div className="p-3 rounded-md border border-amber-500/30 bg-amber-500/5">
                      <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ Limitações Persistentes</p>
                      <ul className="list-disc pl-5 space-y-1.5 text-sm">
                        <li><strong>Quilombolas (INCRA):</strong> Ações específicas 20G7 (Regularização de Territórios Quilombolas) e 0859 (Indenização de Benfeitorias) <strong>não foram localizadas</strong> na base. Possíveis causas: encerramento das ações, reclassificação sob outro código no PPA 2024-2027, ou ausência nos endpoints consultados. Impacto: o investimento federal específico em regularização fundiária quilombola pode estar subrepresentado.</li>
                        <li><strong>Programa 5034 (2020–2023):</strong> Registros existem na base ({`${16 + 10 + 9 + 10}`} registros), mas são <strong>filtrados dos cálculos comparativos</strong> pela função <code>is5034Distortion()</code>. Motivo: o 5034 foi um guarda-chuva multi-temático do MDHC que englobava ações genéricas de direitos humanos (0083, 00SN, 00SO, 0E85, 14XS, 21AR–21AU) sem caráter racial. Apenas ações com palavras-chave raciais explícitas no campo <code>descritivo</code> são preservadas.</li>
                        <li><strong>Esferas estadual e municipal (SICONFI):</strong> Ainda sem registros na base. Os dados RREO/DCA do Tesouro Nacional refletem <strong>função/subfunção</strong> (agregados contábeis), não programas específicos do PPA local. A granularidade é estruturalmente inferior à federal, dificultando a identificação de políticas raciais específicas.</li>
                        <li><strong>Série incompleta:</strong> Variações percentuais extremas (ex: quedas de -90%) podem refletir hiatos na coleta ou na disponibilidade de dados nos endpoints da API, não necessariamente alterações reais de dotação ou execução.</li>
                      </ul>
                    </div>
                  </div>
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

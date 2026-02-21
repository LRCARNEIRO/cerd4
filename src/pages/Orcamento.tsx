import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { DollarSign, TrendingUp, Building, Building2, MapPin, ExternalLink, AlertTriangle, Database, TreePine, Tent, Users, Info, BookOpen, PieChart, EyeOff, Trash2, FileText } from 'lucide-react';
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
import { EstadualResumoComparativo } from '@/components/estatisticas/orcamento/EstadualResumoComparativo';
import { EstadualRelatorioTab } from '@/components/estatisticas/orcamento/EstadualRelatorioTab';
import { FederalRelatorioTab } from '@/components/estatisticas/orcamento/FederalRelatorioTab';

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
  
  if (orgao === 'SESAI' || obs.includes('saúde indígena') || obs.includes('sesai') ||
      prog.includes('20yp') || prog.includes('7684')) {
    return null;
  }

  if (orgao === 'SEPPIR') return null;

  if (orgao === 'MIR' || orgao.includes('IGUALDADE RACIAL') || orgao.includes('MIR/')) {
    const allPre2023 = registros.every(r => r.ano < 2023);
    if (!allPre2023) return null;
  }

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
  stats: { totalPeriodo1: number; totalPeriodo2: number; variacao: number; totalRegistros: number; totalProgramas: number; anosCobertura: number[]; metricaLabel?: string };
  esferaLabel: string;
  formatCurrency: (v: number) => string;
}) {
  if (stats.totalRegistros === 0) return null;
  const anosRange = stats.anosCobertura.length > 0
    ? `${stats.anosCobertura[0]}–${stats.anosCobertura[stats.anosCobertura.length - 1]}`
    : '—';
  const metrica = stats.metricaLabel || 'Pago/Dotação Autorizada';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <Card className="border-l-4 border-l-primary/60">
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground mb-1">2018–2022</p>
          <p className="text-lg font-bold">{formatCurrency(stats.totalPeriodo1)}</p>
          <p className="text-[10px] text-muted-foreground">{esferaLabel} · {metrica}</p>
        </CardContent>
      </Card>
      <Card className="border-l-4 border-l-success/60">
        <CardContent className="pt-4 pb-3">
          <p className="text-xs text-muted-foreground mb-1">2023–2026</p>
          <p className="text-lg font-bold text-success">{formatCurrency(stats.totalPeriodo2)}</p>
          <p className="text-[10px] text-muted-foreground">{esferaLabel} · {metrica}</p>
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

type Esfera = 'federal' | 'estadual' | 'municipal';

export default function Orcamento() {
  const { data: dadosOrcamentarios, isLoading: orcLoading } = useDadosOrcamentarios();
  const { data: stats, isLoading: statsLoading } = useOrcamentoStats();
  const queryClient = useQueryClient();

  const [esfera, setEsfera] = useState<Esfera>('federal');

  // Thematic filters per esfera
  const [federalFilters, setFederalFilters] = useState<Record<ThematicFilter, boolean>>({ racial: true, indigena: true, quilombola: true, ciganos: true });
  const [estadualFilters, setEstadualFilters] = useState<Record<ThematicFilter, boolean>>({ racial: true, indigena: true, quilombola: true, ciganos: true });
  const [municipalFilters, setMunicipalFilters] = useState<Record<ThematicFilter, boolean>>({ racial: true, indigena: true, quilombola: true, ciganos: true });
  const [includeExcludedInCalc, setIncludeExcludedInCalc] = useState(false);

  const handleResetEsfera = async (esferaKey: string, label: string) => {
    if (!confirm(`Apagar todos os dados orçamentários da esfera "${label}"? Esta ação não pode ser desfeita.`)) return;
    try {
      const { data, error } = await supabase.functions.invoke('reset-orcamento', {
        body: { esfera: esferaKey },
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

  // Classify all records by esfera + thematic
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
      
      if (theme === 'sesai') {
        result.sesai.push(item);
        if (item.esfera !== 'estadual' && item.esfera !== 'municipal') {
          result.federal.all.push(item);
          result.federal.byTheme.indigena.push(item);
        }
        continue;
      }

      let esferaKey: 'federal' | 'estadual' | 'municipal' = 'federal';
      if (item.esfera === 'estadual') esferaKey = 'estadual';
      else if (item.esfera === 'municipal') esferaKey = 'municipal';

      result[esferaKey].all.push(item);
      result[esferaKey].byTheme[theme].push(item);
    }

    return result;
  }, [dadosOrcamentarios]);

  // Apply filters to get visible records per esfera
  const getFilteredRecords = (esferaKey: Esfera, filters: Record<ThematicFilter, boolean>) => {
    const data = classified[esferaKey];
    const result: DadoOrcamentario[] = [];
    for (const key of THEMATIC_FILTERS.map(f => f.key)) {
      if (filters[key]) result.push(...data.byTheme[key]);
    }
    return result;
  };

  const getThemeCounts = (esferaKey: Esfera) => {
    const data = classified[esferaKey];
    return {
      racial: data.byTheme.racial.length,
      indigena: data.byTheme.indigena.length,
      quilombola: data.byTheme.quilombola.length,
      ciganos: data.byTheme.ciganos.length,
    };
  };

  const currentFilters = esfera === 'federal' ? federalFilters : esfera === 'estadual' ? estadualFilters : municipalFilters;
  const currentToggle = esfera === 'federal' ? toggleFilter(setFederalFilters) : esfera === 'estadual' ? toggleFilter(setEstadualFilters) : toggleFilter(setMunicipalFilters);

  const currentRecords = useMemo(() => getFilteredRecords(esfera, currentFilters), [classified, esfera, currentFilters]);

  /** Check if a record is a non-racial 5034 action */
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
    const compute = (records: DadoOrcamentario[], exclude5034Only: boolean, useDotacaoInicial = false) => {
      const valorEfetivo = useDotacaoInicial
        ? (r: DadoOrcamentario) => Number(r.dotacao_inicial) || Number(r.dotacao_autorizada) || Number(r.pago) || 0
        : (r: DadoOrcamentario) => Number(r.pago) || Number(r.dotacao_autorizada) || 0;
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
        metricaLabel: useDotacaoInicial ? 'Dotação Inicial' : 'Pago/Dotação Autorizada',
      };
    };
    return {
      federal: compute(classified.federal.all, !includeExcludedInCalc, true),
      estadual: compute(classified.estadual.all, false, true),
      municipal: compute(classified.municipal.all, false, true),
    };
  }, [classified, includeExcludedInCalc]);

  // Dynamic stats based on toggle
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

  const esferaLabel = esfera === 'federal' ? 'Federal' : esfera === 'estadual' ? 'Estadual' : 'Municipal';
  const EsferaIcon = esfera === 'federal' ? Building : esfera === 'estadual' ? Building2 : MapPin;

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
                não são permitidos.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap items-center">
              {/* FederalIngestionPanel e Reset Federal ocultados — base já organizada. Reativar se necessário. */}
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

      {/* ===== SELETOR DE ESFERA ===== */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground mr-2">Esfera:</span>
        {([
          { key: 'federal' as Esfera, label: 'Federal', icon: Building, count: classified.federal.all.length },
          { key: 'estadual' as Esfera, label: 'Estadual', icon: Building2, count: classified.estadual.all.length },
          { key: 'municipal' as Esfera, label: 'Municipal', icon: MapPin, count: classified.municipal.all.length },
        ]).map(e => (
          <Button
            key={e.key}
            variant={esfera === e.key ? 'default' : 'outline'}
            size="sm"
            className="gap-1.5"
            onClick={() => setEsfera(e.key)}
          >
            <e.icon className="w-4 h-4" />
            {e.label}
            {e.count > 0 && <Badge variant={esfera === e.key ? 'secondary' : 'outline'} className="ml-1 text-xs">{e.count}</Badge>}
          </Button>
        ))}
      </div>

      {/* Key Metrics for selected esfera */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <EsferaSummaryCards stats={esferaStats[esfera]} esferaLabel={esferaLabel} formatCurrency={formatCurrency} />
      )}

      {/* ===== SUB-ABAS filtradas pela esfera selecionada ===== */}
      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="visao-geral">
            <EsferaIcon className="w-4 h-4 mr-1" />
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
          <TabsTrigger value="relatorio">
            <FileText className="w-4 h-4 mr-1" />
            Relatório
          </TabsTrigger>
          <TabsTrigger value="metodologia">
            <BookOpen className="w-4 h-4 mr-1" />
            Metodologia
          </TabsTrigger>
        </TabsList>

        {/* ===== VISÃO GERAL ===== */}
        <TabsContent value="visao-geral">
          {/* Thematic filter bar */}
          <ThematicFilterBar filters={currentFilters} counts={getThemeCounts(esfera)} onToggle={currentToggle} />

          {/* Federal-specific: 5034 toggle */}
          {esfera === 'federal' && (
            <div className="mb-4 p-3 bg-muted/40 rounded-lg border border-dashed flex items-center gap-2 text-xs text-muted-foreground justify-between">
              <div className="flex items-center gap-2">
                <EyeOff className="w-4 h-4 flex-shrink-0" />
                <span>Ações 5034/MDHC sem palavras-chave raciais são marcadas como <Badge variant="outline" className="text-[10px] border-warning text-warning mx-1">Excluído do cálculo</Badge>.</span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap text-sm font-medium shrink-0">
                <Checkbox
                  checked={includeExcludedInCalc}
                  onCheckedChange={(checked) => setIncludeExcludedInCalc(!!checked)}
                />
                Incluir 5034 não-racial no cálculo
              </label>
            </div>
          )}

          {/* Data listing */}
          <EsferaContent
            records={currentRecords}
            isLoading={isLoading}
            emptyMessage={`Nenhum programa ${esferaLabel.toLowerCase()} encontrado com os filtros selecionados.`}
            useOrgaoSection={esfera === 'federal'}
            showExclusions={esfera === 'federal'}
          />

          {/* Federal-specific: charts */}
          {esfera === 'federal' && hasData && !isLoading && (
            <div className="mt-6 space-y-6">
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
                  return { ...g, progP1, progP2, progTotal, acoesP1: p1.length, acoesP2: p2.length, acoesTotal: recs.length };
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
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-3 mb-4">
                        <Badge className="text-sm px-3 py-1 bg-primary/10 text-primary border-primary/30">{totalPrograms} programas distintos</Badge>
                        <Badge className="text-sm px-3 py-1 bg-muted text-foreground border-border">{totalActions} ações/registros totais</Badge>
                      </div>
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
                    <CardHeader><CardTitle className="text-base">Evolução Orçamentária por Ano</CardTitle></CardHeader>
                    <CardContent>
                      <div className="h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={evolucaoPorAno}>
                            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                            <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} />
                            <Tooltip formatter={(value: number) => [formatCurrencyFull(value), 'Pago']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                            <Line type="monotone" dataKey="pago" name="Pago" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: 'hsl(var(--primary))' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {porPrograma.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle className="text-base">Top 10 Programas por Execução</CardTitle></CardHeader>
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
                                    <div className="h-2.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: 'hsl(var(--chart-2))' }} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ===== FONTES ===== */}
        <TabsContent value="fontes">
          <div className="space-y-6">
            {esfera === 'federal' && (
              <>
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
              </>
            )}

            {esfera === 'estadual' && (
              <>
                <h3 className="font-semibold text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-success" /> Fontes Estaduais</h3>
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
                <Card className="border-l-4 border-l-chart-2">
                  <CardContent className="pt-4 pb-3">
                    <p className="text-xs text-muted-foreground">
                      <strong>Fonte principal estadual:</strong> Matriz de Saldos Contábeis (MSC) via SICONFI/Tesouro Nacional. A API SICONFI (RREO/DCA) retorna apenas dados agregados por função/subfunção. Os dados granulares por ação PPA foram mapeados manualmente a partir dos códigos de ação estaduais.
                    </p>
                  </CardContent>
                </Card>
              </>
            )}

            {esfera === 'municipal' && (
              <>
                <h3 className="font-semibold text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-chart-1" /> Fontes Municipais</h3>
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
              </>
            )}
          </div>
        </TabsContent>

        {/* ===== RESUMO COMPARATIVO ===== */}
        <TabsContent value="resumo">
          {esfera === 'federal' && (
            <div className="space-y-6">
              {/* Nota Explicativa Federal */}
              <Card className="border-l-4 border-l-warning">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Nota Explicativa — Critérios e Dupla Perspectiva (Federal)</h4>
                      <p className="text-xs text-muted-foreground">
                        Os valores utilizam <strong>exclusivamente campos reais da API</strong> (<code className="bg-muted px-1 rounded">programa</code> e <code className="bg-muted px-1 rounded">descritivo</code>).
                      </p>
                      <p className="text-xs text-muted-foreground">
                        <strong>⚠️ Assimetria temporal:</strong> P1 = <strong>5 anos</strong> (2018–2022), P2 = <strong>3 anos</strong> (2023–2025).
                      </p>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <p className="text-xs font-semibold text-foreground">✅ Incluído:</p>
                          <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-0.5">
                            <li><strong>SESAI:</strong> Ações 20YP e 7684</li>
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
                            <li><strong>MIR retroativo pré-2023</strong></li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* INFOGRÁFICO: EFEITO MASCARAMENTO SESAI */}
              {stats?.porAnoDetalhado && stats?.semSesai?.porAnoDetalhado && (
                <SesaiMaskingInfographic
                  porAnoDetalhado={stats.porAnoDetalhado}
                  semSesaiPorAnoDetalhado={stats.semSesai.porAnoDetalhado}
                  formatCurrency={formatCurrency}
                  formatCurrencyFull={formatCurrencyFull}
                />
              )}

              {/* PERSPECTIVA 1: TOTAL (COM SESAI) */}
              <div>
                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                  <Building className="w-5 h-5 text-chart-1" />
                  Perspectiva 1 — Investimento Federal Total (com SESAI)
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Inclui a Saúde Indígena (SESAI), que representa <strong>~90% do total em 2018–2022</strong> e <strong>~60-85% em 2023–2025</strong>.
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

              {/* PERSPECTIVA 2: SEM SESAI */}
              <div>
                <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-chart-4" />
                  Perspectiva 2 — Políticas Raciais <em>stricto sensu</em> (sem SESAI)
                </h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Exclui a SESAI para isolar o investimento específico em igualdade racial, povos indígenas (FUNAI/MPI) e quilombolas.
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
                  fontes={[{ nome: 'Portal da Transparência — Sem SESAI', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' }]}
                  documentos={['Cálculo: Total − SESAI']}
                />
              </div>

              {/* Detalhamento por Grupo Focal Federal — omitted if stats unavailable */}

              {/* Tabela Ano a Ano — Federal */}
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
                            2018: 'Base: SEPPIR ativa + FUNAI com 5 ações.',
                            2019: 'Queda real sem SESAI: extinção da SEPPIR.',
                            2020: 'Programa 5034 genérico (filtrado).',
                            2021: 'Vale do desmonte.',
                            2022: 'Ponto mais baixo relativo.',
                            2023: 'Reconstrução: criação do MIR.',
                            2024: 'Expansão: MPI R$ 307 mi + MIR recorde.',
                            2025: 'Explosão: MPI R$ 1,4 bi + MIR R$ 103 mi.',
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
                  </CardContent>
                </Card>
              )}

              {/* Conclusão Interpretativa Federal */}
              <Card className="border-l-4 border-l-primary">
                <CardContent className="pt-4 pb-3">
                  <h4 className="font-semibold text-sm mb-3">📊 Conclusão Interpretativa — Federal</h4>
                  <div className="text-xs text-muted-foreground space-y-3">
                    <div>
                      <p className="font-semibold text-foreground mb-1">A divisão em dois períodos é válida?</p>
                      <p><strong>Sim, mas com ressalvas fundamentais.</strong> A fronteira 2022→2023 marca a criação do MIR e o reinício da política racial institucional.</p>
                    </div>
                    <ul className="list-disc pl-4 space-y-1.5">
                      <li><strong>2018–2019:</strong> A SEPPIR operou com R$ 5–20 mi/ano de execução real.</li>
                      <li><strong>2021–2022:</strong> O investimento racial (sem SESAI) caiu para R$ 60–63 mi.</li>
                      <li><strong>2023:</strong> Criação do MIR. Sem SESAI, o pago subiu para ~R$ 107 mi.</li>
                      <li><strong>2024–2025:</strong> MPI explodiu para R$ 307 mi (2024) e R$ 1,4 bi (2025). <strong>Pela primeira vez, as políticas raciais sem SESAI superam R$ 1 bilhão.</strong></li>
                    </ul>
                    <div className="bg-muted/50 rounded p-3 mt-3">
                      <p className="font-semibold text-foreground mb-1">🔑 Achado Central</p>
                      <p>A SESAI representou <strong>~95% do total em 2018–2019</strong> e <strong>~56% em 2025</strong>. A queda percentual da SESAI reflete o <em>crescimento exponencial das demais políticas</em>.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* RANKING: Gastos por Programa (Não-Saúde) */}
              {(() => {
                const nonSesai = classified.federal.all.filter(r => classifyThematic(r) !== 'sesai');
                const progTotals: Record<string, { pago: number; orgao: string }> = {};
                nonSesai.forEach(r => {
                  const key = r.programa;
                  if (!progTotals[key]) progTotals[key] = { pago: 0, orgao: r.orgao };
                  progTotals[key].pago += Number(r.pago) || 0;
                });
                const sorted = Object.entries(progTotals)
                  .sort((a, b) => b[1].pago - a[1].pago)
                  .slice(0, 12);
                const maxVal = sorted[0]?.[1].pago || 1;

                if (sorted.length === 0) return null;

                const colors = [
                  'hsl(var(--primary))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))',
                  'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))',
                ];

                return (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-chart-4" />
                        Ranking de Gastos por Programa — Políticas Não-Saúde (Pago Acumulado)
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        Top {sorted.length} programas federais por valor pago acumulado (2018–2025), excluindo SESAI.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {sorted.map(([programa, { pago, orgao }], idx) => {
                          const pct = maxVal > 0 ? (pago / maxVal) * 100 : 0;
                          return (
                            <div key={programa} className="space-y-1">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  <span className="text-xs font-bold text-muted-foreground w-5 text-right flex-shrink-0">
                                    {idx + 1}.
                                  </span>
                                  <span className="text-xs truncate" title={programa}>{programa}</span>
                                  <Badge variant="outline" className="text-[10px] flex-shrink-0">{orgao}</Badge>
                                </div>
                                <span className="text-xs font-mono font-semibold flex-shrink-0">
                                  {formatCurrency(pago)}
                                </span>
                              </div>
                              <div className="ml-7 h-2.5 bg-muted rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-500"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: colors[idx % colors.length],
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4">
                        <AuditFooter
                          fontes={[{ nome: 'Portal da Transparência — Despesas Federais', url: 'https://portaldatransparencia.gov.br/despesas' }]}
                          documentos={['Cálculo: Pago acumulado por programa, excluindo SESAI']}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

              {/* Gráficos comparativos Federal */}
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
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}

          {esfera === 'estadual' && (
            <div className="space-y-6">
              {classified.estadual.all.length > 0 ? (
                <EstadualResumoComparativo
                  records={classified.estadual.all}
                  formatCurrency={formatCurrency}
                  formatCurrencyFull={formatCurrencyFull}
                />
              ) : (
                <EmptyEsferaCard esfera="Estadual" descricao="Dados estaduais ainda não disponíveis para o Resumo Comparativo. Insira dados via MSC/PPA." />
              )}
            </div>
          )}

          {esfera === 'municipal' && (
            <EmptyEsferaCard esfera="Municipal" descricao="Dados municipais ainda não disponíveis para o Resumo Comparativo. Utilize portais de transparência municipais." />
          )}
        </TabsContent>

        {/* ===== RELATÓRIO ===== */}
        <TabsContent value="relatorio">
          {esfera === 'estadual' && (
            <div className="space-y-6">
              {classified.estadual.all.length > 0 ? (
                <EstadualRelatorioTab
                  records={classified.estadual.all}
                  formatCurrency={formatCurrency}
                  formatCurrencyFull={formatCurrencyFull}
                />
              ) : (
                <EmptyEsferaCard esfera="Estadual" descricao="Dados estaduais não disponíveis para o Relatório. Insira dados via MSC/PPA." />
              )}
            </div>
          )}

          {esfera === 'federal' && (
            <div className="space-y-6">
              {classified.federal.all.length > 0 ? (
                <FederalRelatorioTab
                  records={classified.federal.all}
                  sesaiRecords={classified.sesai}
                  stats={stats}
                  formatCurrency={formatCurrency}
                  formatCurrencyFull={formatCurrencyFull}
                  includeExcludedInCalc={includeExcludedInCalc}
                />
              ) : (
                <EmptyEsferaCard esfera="Federal" descricao="Dados federais não disponíveis para o Relatório. Insira dados via Portal da Transparência." />
              )}
            </div>
          )}

          {esfera === 'municipal' && (
            <EmptyEsferaCard esfera="Municipal" descricao="Relatório Municipal em elaboração. Dados ainda insuficientes." />
          )}
        </TabsContent>

        {/* ===== METODOLOGIA ===== */}
        <TabsContent value="metodologia">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Metodologia de Levantamento Orçamentário — {esferaLabel}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-muted-foreground">
                {esfera === 'federal' && (
                  <>
                    {/* 1. Estratégia de Coleta em 4 Camadas */}
                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">1. Estratégia de Coleta em 4 Camadas</h4>
                      <p>A base orçamentária federal (2018–2025) utiliza uma estratégia híbrida de coleta:</p>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div>
                          <h5 className="font-semibold text-foreground">Camada 1 — Programas Temáticos do PPA</h5>
                          <p>Consulta direta por código de programa finalístico: <code>2034</code> (SEPPIR), <code>5034</code> (MDHC), <code>0617</code>/<code>2065</code>/<code>5136</code> (indígenas), <code>5802</code>/<code>5803</code>/<code>5804</code> (MIR 2024+).</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-foreground">Camada 2 — Órgãos com Mandato Direto</h5>
                          <p>MIR (67000), MPI (92000), SEPPIR, FUNAI, INCRA. Para 2018–2022: órgãos predecessores.</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-foreground">Camada 3 — Ações Estratégicas</h5>
                          <p>SESAI (<code>20YP</code> e <code>7684</code>), Quilombolas (<code>20G7</code>, <code>0859</code>, <code>6440</code>), Subfunção 422.</p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-foreground">Camada 4 — Dotação via Dados Abertos</h5>
                          <p>Arquivos ZIP/CSV do portal de dados abertos (LOA) complementam a base com dotação (inicial e autorizada), processados pela edge function <code>ingest-dotacao-loa</code>.</p>
                        </div>
                      </div>
                      <p className="text-xs mt-2">A mesclagem ocorre por par <strong>Programa–Ação × Ano</strong>, consolidando valores de execução (API) e dotação (LOA) em um único registro.</p>
                    </section>

                    {/* 2. Classificação por Campos Reais */}
                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">2. Classificação Temática — Campos Reais da API</h4>
                      <p>A classificação utiliza <strong>exclusivamente</strong> campos reais: <code className="bg-muted px-1 rounded">programa</code>, <code className="bg-muted px-1 rounded">orgao</code> e <code className="bg-muted px-1 rounded">descritivo</code>. O campo <code className="bg-muted px-1 rounded">publico_alvo</code> é <strong>ignorado</strong> por conter dados inconsistentes na API.</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Critérios</TableHead>
                            <TableHead>Radicais de Filtragem</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Política Racial</TableCell>
                            <TableCell>MIR, MDHC, SEPPIR; 5034 filtrado por palavras-chave</TableCell>
                            <TableCell><code className="text-xs">racial, racismo, negro/a, afro, palmares, igualdade racial</code></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Povos Indígenas</TableCell>
                            <TableCell>FUNAI, MPI; Programas 2065 → 0617 → 5136</TableCell>
                            <TableCell><code className="text-xs">indígen, funai, etnodesenvolvimento</code></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Quilombolas</TableCell>
                            <TableCell>INCRA; Ações 20G7, 0859, 6440; Programa 5802</TableCell>
                            <TableCell><code className="text-xs">quilombol, palmares, terreiro, matriz africana</code></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">SESAI (separada)</TableCell>
                            <TableCell>Ações 20YP e 7684 (~R$ 1,3–1,5 bi/ano)</TableCell>
                            <TableCell><code className="text-xs">saúde indígena, sesai</code></TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Ciganos/Romani</TableCell>
                            <TableCell>Ações com radicais específicos</TableCell>
                            <TableCell><code className="text-xs">cigano, romani, povo cigano</code></TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>

                      {/* Listagem completa de palavras-chave */}
                      <div className="bg-muted/50 rounded-lg p-4 space-y-4 mt-4">
                        <h5 className="font-semibold text-foreground">📋 Listagem Completa de Radicais e Palavras-Chave</h5>
                        
                        <div className="space-y-3">
                          <div>
                            <p className="font-semibold text-foreground text-xs mb-1">Radicais Unificados (capturam variações morfológicas)</p>
                            <div className="flex flex-wrap gap-1.5">
                              {['indígen', 'quilombol', 'cigan', 'étnic', 'palmares', 'funai', 'sesai'].map(r => (
                                <Badge key={r} variant="secondary" className="text-xs font-mono">{r}*</Badge>
                              ))}
                            </div>
                            <p className="text-xs mt-1 italic">Ex: <code>indígen*</code> captura: indígena, indigenista, indígenas, indigenismo.</p>
                          </div>

                          <div>
                            <p className="font-semibold text-foreground text-xs mb-1">Palavras-Chave Específicas (busca exata)</p>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                'igualdade racial', 'promoção da igualdade', 'racismo', 'racial',
                                'negro', 'negra', 'afro', 'afrodescendente',
                                'candomblé', 'umbanda', 'matriz africana', 'terreiro',
                                'povos tradicionais', 'comunidades tradicionais',
                                'etnodesenvolvimento', 'saúde indígena',
                                'povo cigano', 'romani'
                              ].map(k => (
                                <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold text-destructive text-xs mb-1">🚫 Termos Genéricos Excluídos (evitam falsos positivos)</p>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                'direitos da cidadania', 'direitos individuais coletivos',
                                'assistência comunitária', 'gestão administrativa',
                                'administração geral', 'previdência social'
                              ].map(e => (
                                <Badge key={e} variant="destructive" className="text-xs opacity-70">{e}</Badge>
                              ))}
                            </div>
                            <p className="text-xs mt-1 italic">Esses termos aparecem em Função/Subfunção genéricas e incluiriam programas universais sem relação com política racial.</p>
                          </div>
                        </div>

                        <div className="bg-primary/10 rounded p-3 border border-primary/30 mt-2">
                          <p className="text-xs"><strong>Campo de aplicação:</strong> Os radicais e palavras-chave são aplicados exclusivamente sobre os campos <code>programa</code>, <code>orgao</code> e <code>descritivo</code> retornados pela API do Portal da Transparência. O campo <code>publico_alvo</code> é ignorado por conter dados inconsistentes e não-auditáveis. O campo <code>razao_selecao</code> documenta qual critério foi responsável pela inclusão de cada registro.</p>
                        </div>
                      </div>
                    </section>

                    {/* 3. Exclusões Explícitas */}
                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">3. Exclusões Explícitas</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-destructive/10 rounded-lg p-4 space-y-2 border border-destructive/30">
                          <p className="text-sm font-semibold text-destructive">❌ Programas Universais Excluídos</p>
                          <ul className="text-xs list-disc pl-4 space-y-0.5">
                            <li><strong>Bolsa Família / Auxílio Brasil</strong></li>
                            <li><strong>Minha Casa Minha Vida</strong></li>
                            <li><strong>Educação Superior (genérico)</strong></li>
                            <li><strong>SUS / SUAS (não-SESAI)</strong></li>
                          </ul>
                        </div>
                        <div className="bg-destructive/10 rounded-lg p-4 space-y-2 border border-destructive/30">
                          <p className="text-sm font-semibold text-destructive">❌ Ações Genéricas do MDHC (2020–2022)</p>
                          <ul className="text-xs list-disc pl-4 space-y-0.5">
                            <li><strong>00SN</strong> — Casas da Mulher Brasileira</li>
                            <li><strong>00SO</strong> — Socioeducativo</li>
                            <li><strong>0E85</strong> — Subsídios genéricos</li>
                            <li><strong>14XS</strong> — Gestão administrativa</li>
                            <li><strong>21AR–21AU</strong> — Ações sem palavras-chave raciais</li>
                          </ul>
                          <p className="text-xs italic mt-2">Bypass temporal: ações rotuladas retroativamente como MIR na API, mas sem caráter racial, são filtradas.</p>
                        </div>
                      </div>
                    </section>

                    {/* 4. Detalhamento Técnico SESAI */}
                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">4. SESAI — Detalhamento Técnico e Integração</h4>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div>
                          <h5 className="font-semibold text-foreground">Mudanças de Código entre PPAs</h5>
                          <ul className="list-disc pl-5 space-y-1 mt-1">
                            <li><strong>PPA 2016-2019 (Programa 2065):</strong> SESAI vinculada ao programa indígena geral.</li>
                            <li><strong>PPA 2020-2023 (Programa 5022):</strong> Migrou para programa genérico de Saúde. Camada 3 criada especificamente para capturar por código de ação.</li>
                            <li><strong>PPA 2024-2027 (Programa 5022):</strong> Estrutura mantida. Captura por ações 20YP e 7684.</li>
                          </ul>
                        </div>
                        <div className="bg-primary/10 rounded p-3 border border-primary/30 mt-2">
                          <p className="text-xs"><strong>Efeito Mascaramento:</strong> A SESAI representou ~95% do total em 2018–2019 e ~56% em 2025. A inclusão/exclusão da SESAI altera fundamentalmente a interpretação do investimento racial federal. Por isso, o sistema apresenta <strong>duas perspectivas</strong> (com e sem SESAI).</p>
                        </div>
                      </div>
                    </section>

                    {/* 5. Transições de Códigos PPA (2018–2027) */}
                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">5. Transições de Códigos PPA (2018–2027)</h4>
                      <p>O rastreio da série histórica exigiu o mapeamento de transições entre três ciclos de PPA:</p>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tema</TableHead>
                            <TableHead>PPA 2016–2019</TableHead>
                            <TableHead>PPA 2020–2023</TableHead>
                            <TableHead>PPA 2024–2027</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell className="font-medium">Igualdade Racial</TableCell>
                            <TableCell><code>2034</code> (SEPPIR)</TableCell>
                            <TableCell><code>5034</code> (MDHC guarda-chuva)</TableCell>
                            <TableCell><code>5802, 5803, 5804</code> (MIR)</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Povos Indígenas</TableCell>
                            <TableCell><code>2065</code> (FUNAI/MJ)</TableCell>
                            <TableCell><code>0617</code> (FUNAI)</TableCell>
                            <TableCell><code>5136</code> (MPI)</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">SESAI</TableCell>
                            <TableCell><code>2065</code> (dentro do prog. indígena)</TableCell>
                            <TableCell><code>5022</code> (prog. Saúde genérico)</TableCell>
                            <TableCell><code>5022</code> (mantido)</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Quilombolas</TableCell>
                            <TableCell><code>2034</code> (via SEPPIR)</TableCell>
                            <TableCell><code>5034</code> (via INCRA)</TableCell>
                            <TableCell><code>5802</code> (MIR)</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">Órgão Líder</TableCell>
                            <TableCell>SEPPIR + FUNAI</TableCell>
                            <TableCell>MDHC + FUNAI</TableCell>
                            <TableCell>MIR + MPI</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </section>

                    {/* 6. Padrão da Série Histórica (2018–2025) */}
                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">6. Padrão Nuançado da Série Histórica (2018–2025)</h4>
                      <p>A série revela um padrão de <strong>"Trava Institucional" (2018–2022)</strong> seguida de <strong>"Retomada sem Entrega" (2023–2025)</strong>:</p>
                      <div className="space-y-3">
                        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                          <h5 className="font-semibold text-foreground">2018–2019 — Base Modesta</h5>
                          <p>SEPPIR ativa com R$ 5–20 mi/ano de execução real (sem SESAI). Dotação total: R$ 93–123 mi. FUNAI operante com 5 ações finalísticas.</p>
                        </div>
                        <div className="bg-destructive/10 rounded-lg p-4 space-y-2 border border-destructive/30">
                          <h5 className="font-semibold text-destructive">2020 — Distorção pelo 5034</h5>
                          <p>O programa 5034 (MDHC) inflou artificialmente o total com ações genéricas sem caráter racial. Aplicado filtro de exclusão.</p>
                        </div>
                        <div className="bg-destructive/10 rounded-lg p-4 space-y-2 border border-destructive/30">
                          <h5 className="font-semibold text-destructive">2021–2022 — Vale do Desmonte</h5>
                          <p>Queda real para R$ 60–63 mi (sem SESAI). Dotações simbólicas com liquidação zero em igualdade racial. Ponto mais baixo relativo da série.</p>
                        </div>
                        <div className="bg-success/10 rounded-lg p-4 space-y-2 border border-success/30">
                          <h5 className="font-semibold text-success">2023 — Reconstrução Institucional</h5>
                          <p>Criação do MIR. Sem SESAI, o pago subiu para ~R$ 107 mi. Dotação total: R$ 457 mi (salto de +180%).</p>
                        </div>
                        <div className="bg-primary/10 rounded-lg p-4 space-y-2 border border-primary/30">
                          <h5 className="font-semibold text-primary">2024–2025 — Novos Programas PPA</h5>
                          <p>MPI explodiu para R$ 307 mi (2024) e R$ 1,4 bi (2025). MIR com dotação de R$ 132–157 mi (programas 5802, 5803, 5804). <strong>Pela primeira vez, políticas raciais sem SESAI superam R$ 1 bilhão.</strong></p>
                        </div>
                      </div>
                      <div className="bg-muted/50 rounded p-3 mt-3">
                        <p className="text-xs"><strong>🔑 Achado Central:</strong> A SESAI representou ~95% do total em 2018–2019 e ~56% em 2025. A queda percentual da SESAI reflete o <em>crescimento exponencial das demais políticas</em>, não a redução da saúde indígena.</p>
                      </div>
                    </section>

                    {/* 7. Dotação via Dados Abertos e SICONFI */}
                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">7. Dotação via Dados Abertos (LOA) e Limitações</h4>
                      <p>Os valores de <strong>dotação inicial</strong> e <strong>dotação autorizada</strong> não estão disponíveis na API REST do Portal da Transparência. A complementação ocorre por:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li><strong>Arquivos LOA (dados.gov.br):</strong> ZIP/CSV com dotação por ação, processados pela edge function <code>ingest-dotacao-loa</code>.</li>
                        <li><strong>Upload manual CSV:</strong> Para preenchimento de lacunas específicas (ex: INCRA/Quilombolas).</li>
                        <li><strong>SIOP (consulta manual):</strong> Para validação cruzada quando disponível.</li>
                      </ul>

                      <div className="space-y-3 mt-3">
                        <div className="p-3 rounded-md border border-green-500/30 bg-green-500/5">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">✅ Limitações Superadas</p>
                          <ul className="list-disc pl-5 space-y-1.5 text-sm">
                            <li><strong>Povos Indígenas (FUNAI/MPI):</strong> Cobertura completa 2018–2025.</li>
                            <li><strong>SESAI:</strong> Cobertura completa via Camada 3 (ações 20YP/7684).</li>
                            <li><strong>MIR (2023+):</strong> Programas 5802/5803/5804 com dados completos.</li>
                          </ul>
                        </div>
                        <div className="p-3 rounded-md border border-amber-500/30 bg-amber-500/5">
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ Limitações Persistentes</p>
                          <ul className="list-disc pl-5 space-y-1.5 text-sm">
                            <li><strong>Quilombolas (INCRA):</strong> Ações 20G7/0859/6440 com cobertura parcial.</li>
                            <li><strong>5034 (2020–2023):</strong> Filtrados dos cálculos comparativos por impossibilidade de desagregação confiável.</li>
                          </ul>
                        </div>
                      </div>

                      <h5 className="font-semibold text-foreground mt-4">Identificação de Órgãos Federais</h5>
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
                            <TableCell className="font-medium">MIR</TableCell>
                            <TableCell><code>OS67000</code></TableCell>
                            <TableCell>2023–presente</TableCell>
                            <TableCell>SEPPIR → MMFDH</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell className="font-medium">MPI</TableCell>
                            <TableCell><code>92000</code></TableCell>
                            <TableCell>2023–presente</TableCell>
                            <TableCell>FUNAI (MJ)</TableCell>
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
                          <TableRow>
                            <TableCell className="font-medium">SESAI/MS</TableCell>
                            <TableCell><code>36000</code></TableCell>
                            <TableCell>2018–presente</TableCell>
                            <TableCell>—</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </section>
                  </>
                )}

                {esfera === 'estadual' && (
                  <>
                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">1. Estratégia de Coleta Estadual em 4 Camadas</h4>
                      <p>A base orçamentária estadual (2018–2025) é construída em 4 camadas obrigatórias, consultando a API SICONFI estado por estado. O período cobre <strong>3 ciclos de PPA</strong> (2016-2019, 2020-2023, 2024-2027).</p>
                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div>
                          <h5 className="font-semibold text-foreground">Camada 1 — Identificação de Ações dos PPAs Estaduais</h5>
                          <p>Busca por <strong>radicais e palavras-chave</strong> em todos os campos descritivos das ações orçamentárias (título, nome, justificativa, objetivo — campos <code>conta</code>, <code>rotulo</code>, <code>cod_conta</code> e <code>coluna</code> no SICONFI). A API SICONFI não expõe os PPAs diretamente, mas as ações do PPA se manifestam nos dados de execução orçamentária do <strong>DCA Anexo I-E</strong> (2018–2024) e <strong>RREO Anexo 02</strong> (2025+).</p>
                          <p className="mt-1">Uma vez identificadas, capturam-se os <strong>códigos de ação</strong> e a <strong>dotação inicial</strong> de cada programa/ação selecionado.</p>
                        </div>

                        {/* Palavras-chave */}
                        <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border/50">
                          <p className="font-semibold text-foreground text-sm">📋 Palavras-Chave e Radicais</p>
                          
                          <div>
                            <p className="font-semibold text-foreground text-xs mb-1">Radicais Unificados (capturam variações morfológicas)</p>
                            <div className="flex flex-wrap gap-1.5">
                              {['indígen', 'indigen', 'quilombol', 'cigan', 'étnic', 'etnic', 'palmares', 'funai', 'sesai'].map(r => (
                                <Badge key={r} variant="secondary" className="text-xs font-mono">{r}*</Badge>
                              ))}
                            </div>
                            <p className="text-xs mt-1 italic">Ex: <code>quilombol*</code> captura: quilombola, quilombolas, quilombos.</p>
                          </div>

                          <div>
                            <p className="font-semibold text-foreground text-xs mb-1">Palavras-Chave Específicas</p>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                'igualdade racial', 'promoção da igualdade', 'racismo', 'racial',
                                'negro', 'negra', 'afro', 'afrodescendente', 'consciência negra',
                                'matriz africana', 'capoeira', 'candomblé', 'umbanda', 'terreiro', 'seppir',
                                'povos originários', 'terra indígena',
                                'povos tradicionais', 'comunidades tradicionais',
                                'povo cigano', 'romani', 'discriminação racial'
                              ].map(k => (
                                <Badge key={k} variant="outline" className="text-xs">{k}</Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <p className="font-semibold text-destructive text-xs mb-1">🚫 Termos Genéricos Excluídos</p>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                'direitos da cidadania', 'direitos individuais coletivos',
                                'assistência comunitária', 'direitos individuais',
                                'gestão administrativa', 'administração geral'
                              ].map(e => (
                                <Badge key={e} variant="destructive" className="text-xs opacity-70">{e}</Badge>
                              ))}
                            </div>
                            <p className="text-xs mt-1 italic">Capturam programas universais sem relação com política racial/étnica.</p>
                          </div>

                          <div className="bg-primary/10 rounded p-3 border border-primary/30">
                            <p className="text-xs"><strong>Campo de aplicação:</strong> Os radicais são aplicados sobre todos os campos descritivos retornados pelo SICONFI (conta, rotulo, cod_conta, coluna). O campo <code>razao_selecao</code> documenta o critério de inclusão de cada registro.</p>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-semibold text-foreground">Camada 3 — Cruzamento MSC/SICONFI (obrigatório)</h5>
                          <p>Os <strong>códigos de ação</strong> identificados na Camada 1 são rastreados na <strong>Matriz de Saldos Contábeis</strong> (MSC Orçamentária, classe 5 — despesa, mês 12) para capturar <strong>empenho e liquidação real</strong>, mesmo que o SICONFI omita descritivos textuais nos dados contábeis. Este cruzamento é obrigatório e executado automaticamente para todos os estados (2018–2024).</p>
                        </div>

                        <div>
                          <h5 className="font-semibold text-foreground">Camada 4 — Transição de Códigos entre PPAs</h5>
                          <p>Quando o código de ação de um PPA anterior é diferente do código no ciclo seguinte (ex: 2016-2019 → 2020-2023 → 2024-2027), os registros são rastreados por <strong>similaridade de descrição</strong> para garantir a continuidade da série histórica. Na prática, a deduplicação por par <strong>programa × ano</strong> preserva o registro com maior dotação inicial quando há sobreposição.</p>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">2. Processamento em Lotes</h4>
                      <div className="bg-primary/10 rounded-lg p-4 space-y-2 border border-primary/30">
                        <p>Para evitar limites de CPU (WORKER_LIMIT), a ingestão processa <strong>1 estado por chamada</strong>. O frontend orquestra as chamadas sequencialmente com barra de progresso, permitindo processar todos os 27 estados sem timeout.</p>
                        <p className="text-xs italic">Cada chamada executa as 4 camadas completas (DCA/RREO → MSC → deduplicação) para todos os anos selecionados de um único estado.</p>
                      </div>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">3. Fontes de Dados por Período</h4>
                      <div className="space-y-3">
                        <div className="p-3 rounded-md border border-green-500/30 bg-green-500/5">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">DCA Anexo I-E (2018–2024)</p>
                          <p className="text-sm">Declaração de Contas Anuais — dados consolidados anuais com dotação, empenho, liquidação e pagamento. Contém os descritivos das ações do PPA.</p>
                        </div>
                        <div className="p-3 rounded-md border border-amber-500/30 bg-amber-500/5">
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">RREO Anexo 02 (2025+)</p>
                          <p className="text-sm">Relatório Resumido de Execução Orçamentária — dados bimestrais (consulta do 6º ao 1º bimestre até encontrar dados). Valores parciais sujeitos a ajustes até o fechamento do Balanço Geral.</p>
                        </div>
                        <div className="p-3 rounded-md border border-blue-500/30 bg-blue-500/5">
                          <p className="text-sm font-semibold text-blue-700 dark:text-blue-400 mb-1">MSC Orçamentária (obrigatória)</p>
                          <p className="text-sm">Matriz de Saldos Contábeis — classe 5 (despesa), mês 12. Complementa dados de empenho/liquidação quando ausentes no DCA, usando os códigos de ação identificados na Camada 1.</p>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">4. Cobertura</h4>
                      <div className="space-y-3">
                        <div className="p-3 rounded-md border border-green-500/30 bg-green-500/5">
                          <p className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">✅ 27 estados + DF</p>
                          <p className="text-sm">Todos os estados são consultados na API SICONFI. A quantidade de registros capturados depende de cada estado possuir programas com termos raciais/étnicos nos descritivos contábeis.</p>
                        </div>
                        <div className="p-3 rounded-md border border-amber-500/30 bg-amber-500/5">
                          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ Limitação da API SICONFI</p>
                          <p className="text-sm">O DCA/RREO retorna dados de Função/Subfunção (agregados contábeis). A identificação de programas raciais depende da presença de palavras-chave nos campos descritivos. Ações dos PPAs sem descritivos textuais no SICONFI podem não ser capturadas na Camada 1, mas o cruzamento MSC (Camada 3) mitiga essa limitação.</p>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">5. Dados de 2025</h4>
                      <p>Os valores de 2025 refletem o acumulado do 6º Bimestre (Janeiro a Dezembro de 2025). Valores de "Liquidação" podem sofrer ajustes marginais até o fechamento definitivo do Balanço Geral em março de 2026.</p>
                    </section>
                  </>
                )}

                {esfera === 'municipal' && (
                  <>
                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">1. Estratégia de Coleta Municipal</h4>
                      <p>A coleta municipal abrange potencialmente <strong>5.570 municípios</strong> via RREO/DCA do SICONFI, com os mesmos critérios de filtragem do estadual (palavras-chave + contas específicas).</p>
                      <p>A lista de municípios é obtida dinamicamente do endpoint <code className="bg-muted px-1 rounded">/entes</code> do SICONFI.</p>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base">2. Palavras-chave de Filtragem</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          "racial", "racismo", "igualdade racial", "quilombola",
                          "indígena", "cigano", "romani", "terreiro",
                          "matriz africana", "afro", "promoção da igualdade",
                          "cultura negra", "capoeira", "negro", "negra",
                          "candomblé", "umbanda", "povos tradicionais",
                        ].map(kw => (
                          <code key={kw} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{kw}</code>
                        ))}
                      </div>
                    </section>

                    <section className="space-y-2">
                      <h4 className="font-semibold text-foreground text-base text-destructive">3. Limitações</h4>
                      <div className="p-3 rounded-md border border-amber-500/30 bg-amber-500/5">
                        <p className="text-sm font-semibold text-amber-700 dark:text-amber-400 mb-1">⚠️ Status Atual</p>
                        <p className="text-sm">Dados municipais ainda não detalhados na base. Portais de transparência municipais exigem coleta individualizada.</p>
                      </div>
                    </section>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

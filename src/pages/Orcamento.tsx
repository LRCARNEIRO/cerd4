import React, { useMemo, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';
import { Building, ExternalLink, AlertTriangle, TreePine, Tent, Users, Info, BookOpen, PieChart, FileText, Scale, MapPin, Layers } from 'lucide-react';
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
import { ExtraorcamentarioMaskingInfographic } from '@/components/estatisticas/orcamento/ExtraorcamentarioMaskingInfographic';
import { AuditFooter } from '@/components/ui/audit-footer';
import { MetodologiaFederalSection } from '@/components/estatisticas/orcamento/MetodologiaFederalSection';
import { FederalRelatorioTab } from '@/components/estatisticas/orcamento/FederalRelatorioTab';
import { ArtigoCruzamentoTab } from '@/components/estatisticas/orcamento/ArtigoCruzamentoTab';
import { UniversoBaseTab } from '@/components/estatisticas/orcamento/UniversoBaseTab';
import { ArtigoFilter } from '@/components/dashboard/ArtigoFilter';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Filter } from 'lucide-react';


import { KeywordIngestionPanel } from '@/components/dashboard/KeywordIngestionPanel';
import type { DadoOrcamentario } from '@/hooks/useLacunasData';
import { inferArtigosOrcamento, type ArtigoConvencao } from '@/utils/artigosConvencao';

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
  const metrica = stats.metricaLabel || 'Pago';

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
          <p className="text-xs text-muted-foreground mb-1">2023–2025</p>
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

type Esfera = 'federal';

export default function Orcamento() {
  const { data: dadosOrcamentarios, isLoading: orcLoading } = useDadosOrcamentarios();
  const { data: stats, isLoading: statsLoading } = useOrcamentoStats();
  const queryClient = useQueryClient();

  // Thematic filters
  const [federalFilters, setFederalFilters] = useState<Record<ThematicFilter, boolean>>({ racial: true, indigena: true, quilombola: true, ciganos: true });
  
  const [artigoFilter, setArtigoFilter] = useState<ArtigoConvencao | null>(null);
  const [incluirExtra, setIncluirExtra] = useState(true);
  const [semSesaiMode, setSemSesaiMode] = useState(false);

  const handleResetFederal = async () => {
    if (!confirm('Apagar todos os dados orçamentários federais? Esta ação não pode ser desfeita.')) return;
    try {
      const { data, error } = await supabase.functions.invoke('reset-orcamento', {
        body: { esfera: 'federal' },
      });
      if (error) throw error;
      toast.success(data?.message || 'Dados federais apagados com sucesso.');
      queryClient.invalidateQueries();
    } catch {
      toast.error('Erro ao apagar dados federais.');
    }
  };

  const toggleFilter = (setter: React.Dispatch<React.SetStateAction<Record<ThematicFilter, boolean>>>) => (key: ThematicFilter) => {
    setter(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

  const formatCurrencyFull = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

  const isLoading = orcLoading || statsLoading;
  const hasData = dadosOrcamentarios && dadosOrcamentarios.length > 0;

  // Classify federal records by thematic
  const classified = useMemo(() => {
    const result: { federal: { all: DadoOrcamentario[]; byTheme: Record<ThematicFilter, DadoOrcamentario[]> }; sesai: DadoOrcamentario[] } = {
      federal: { all: [], byTheme: { racial: [], indigena: [], quilombola: [], ciganos: [] } },
      sesai: [],
    };

    if (!dadosOrcamentarios) return result;

    for (const item of dadosOrcamentarios) {
      // Skip non-federal records
      if (item.esfera === 'estadual' || item.esfera === 'municipal') continue;

      const theme = classifyThematic(item);
      
      if (theme === 'sesai') {
        result.sesai.push(item);
        result.federal.all.push(item);
        result.federal.byTheme.indigena.push(item);
        continue;
      }

      result.federal.all.push(item);
      result.federal.byTheme[theme].push(item);
    }

    return result;
  }, [dadosOrcamentarios]);

  const getThemeCounts = () => ({
    racial: classified.federal.byTheme.racial.length,
    indigena: classified.federal.byTheme.indigena.length,
    quilombola: classified.federal.byTheme.quilombola.length,
    ciganos: classified.federal.byTheme.ciganos.length,
  });

  const currentRecords = useMemo(() => {
    const result: DadoOrcamentario[] = [];
    for (const key of THEMATIC_FILTERS.map(f => f.key)) {
      if (federalFilters[key]) result.push(...classified.federal.byTheme[key]);
    }
    return result;
  }, [classified, federalFilters]);


  /** Compute per-esfera summary stats — single source of truth for all tabs */
  const esferaStats = useMemo(() => {
    const compute = (records: DadoOrcamentario[]) => {
      const p1 = records.filter(r => r.ano >= 2018 && r.ano <= 2022);
      const p2 = records.filter(r => r.ano >= 2023 && r.ano <= 2025);

      const liqP1 = p1.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
      const liqP2 = p2.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
      const dotP1 = p1.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0);
      const dotP2 = p2.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0);
      const pagoP1 = p1.reduce((s, r) => s + (Number(r.pago) || 0), 0);
      const pagoP2 = p2.reduce((s, r) => s + (Number(r.pago) || 0), 0);

      const anos = new Set(records.map(r => r.ano));
      const programas = new Set(records.map(r => r.programa));

      // Sem SESAI
      const nonSesai = records.filter(r => classifyThematic(r) !== 'sesai');
      const nsP1 = nonSesai.filter(r => r.ano >= 2018 && r.ano <= 2022);
      const nsP2 = nonSesai.filter(r => r.ano >= 2023 && r.ano <= 2025);
      const semSesai = {
        dotacaoP1: nsP1.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0),
        dotacaoP2: nsP2.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0),
        liquidadoP1: nsP1.reduce((s, r) => s + (Number(r.liquidado) || 0), 0),
        liquidadoP2: nsP2.reduce((s, r) => s + (Number(r.liquidado) || 0), 0),
        pagoP1: nsP1.reduce((s, r) => s + (Number(r.pago) || 0), 0),
        pagoP2: nsP2.reduce((s, r) => s + (Number(r.pago) || 0), 0),
        variacaoDotacao: 0, variacaoLiquidado: 0, variacaoPago: 0,
        porAnoDetalhado: {} as Record<number, { pago: number; liquidado: number; dotacao: number }>,
      };
      semSesai.variacaoDotacao = semSesai.dotacaoP1 > 0 ? ((semSesai.dotacaoP2 - semSesai.dotacaoP1) / semSesai.dotacaoP1 * 100) : 0;
      semSesai.variacaoLiquidado = semSesai.liquidadoP1 > 0 ? ((semSesai.liquidadoP2 - semSesai.liquidadoP1) / semSesai.liquidadoP1 * 100) : 0;
      semSesai.variacaoPago = semSesai.pagoP1 > 0 ? ((semSesai.pagoP2 - semSesai.pagoP1) / semSesai.pagoP1 * 100) : 0;
      nonSesai.forEach(r => {
        if (!semSesai.porAnoDetalhado[r.ano]) semSesai.porAnoDetalhado[r.ano] = { pago: 0, liquidado: 0, dotacao: 0 };
        semSesai.porAnoDetalhado[r.ano].pago += Number(r.pago) || 0;
        semSesai.porAnoDetalhado[r.ano].liquidado += Number(r.liquidado) || 0;
        semSesai.porAnoDetalhado[r.ano].dotacao += Number(r.dotacao_autorizada) || 0;
      });

      // Por ano detalhado (com SESAI)
      const porAnoDetalhado: Record<number, { pago: number; liquidado: number; dotacao: number }> = {};
      records.forEach(r => {
        if (!porAnoDetalhado[r.ano]) porAnoDetalhado[r.ano] = { pago: 0, liquidado: 0, dotacao: 0 };
        porAnoDetalhado[r.ano].pago += Number(r.pago) || 0;
        porAnoDetalhado[r.ano].liquidado += Number(r.liquidado) || 0;
        porAnoDetalhado[r.ano].dotacao += Number(r.dotacao_autorizada) || 0;
      });

      // Orçamentário vs Extraorçamentário split
      const orcRecs = records.filter(r => r.tipo_dotacao !== 'extraorcamentario');
      const extraRecs = records.filter(r => r.tipo_dotacao === 'extraorcamentario');
      const orcP1 = orcRecs.filter(r => r.ano >= 2018 && r.ano <= 2022);
      const orcP2 = orcRecs.filter(r => r.ano >= 2023 && r.ano <= 2025);
      const extraP1 = extraRecs.filter(r => r.ano >= 2018 && r.ano <= 2022);
      const extraP2 = extraRecs.filter(r => r.ano >= 2023 && r.ano <= 2025);
      const orcStats = {
        total: orcRecs.length,
        pagoP1: orcP1.reduce((s, r) => s + (Number(r.pago) || 0), 0),
        pagoP2: orcP2.reduce((s, r) => s + (Number(r.pago) || 0), 0),
        dotP1: orcP1.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0),
        dotP2: orcP2.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0),
        liqP1: orcP1.reduce((s, r) => s + (Number(r.liquidado) || 0), 0),
        liqP2: orcP2.reduce((s, r) => s + (Number(r.liquidado) || 0), 0),
        porAnoDetalhado: {} as Record<number, { pago: number; liquidado: number; dotacao: number }>,
      };
      orcRecs.forEach(r => {
        if (!orcStats.porAnoDetalhado[r.ano]) orcStats.porAnoDetalhado[r.ano] = { pago: 0, liquidado: 0, dotacao: 0 };
        orcStats.porAnoDetalhado[r.ano].pago += Number(r.pago) || 0;
        orcStats.porAnoDetalhado[r.ano].liquidado += Number(r.liquidado) || 0;
        orcStats.porAnoDetalhado[r.ano].dotacao += Number(r.dotacao_autorizada) || 0;
      });
      const extraStats = {
        total: extraRecs.length,
        pagoP1: extraP1.reduce((s, r) => s + (Number(r.pago) || 0), 0),
        pagoP2: extraP2.reduce((s, r) => s + (Number(r.pago) || 0), 0),
        dotP1: extraP1.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0),
        dotP2: extraP2.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0),
        liqP1: extraP1.reduce((s, r) => s + (Number(r.liquidado) || 0), 0),
        liqP2: extraP2.reduce((s, r) => s + (Number(r.liquidado) || 0), 0),
        porAnoDetalhado: {} as Record<number, { pago: number; liquidado: number; dotacao: number }>,
        subtipoMap: {} as Record<string, number>,
      };
      extraRecs.forEach(r => {
        if (!extraStats.porAnoDetalhado[r.ano]) extraStats.porAnoDetalhado[r.ano] = { pago: 0, liquidado: 0, dotacao: 0 };
        extraStats.porAnoDetalhado[r.ano].pago += Number(r.pago) || 0;
        extraStats.porAnoDetalhado[r.ano].liquidado += Number(r.liquidado) || 0;
        extraStats.porAnoDetalhado[r.ano].dotacao += Number(r.dotacao_autorizada) || 0;
        const st = r.subtipo_extraorcamentario || 'outros';
        extraStats.subtipoMap[st] = (extraStats.subtipoMap[st] || 0) + (Number(r.pago) || 0);
      });

      return {
        // Pago (métrica principal — mede entrega real)
        totalPeriodo1: pagoP1,
        totalPeriodo2: pagoP2,
        variacao: pagoP1 > 0 ? ((pagoP2 - pagoP1) / pagoP1 * 100) : 0,
        // Dotação Inicial
        dotacaoPeriodo1: dotP1,
        dotacaoPeriodo2: dotP2,
        variacaoDotacao: dotP1 > 0 ? ((dotP2 - dotP1) / dotP1 * 100) : 0,
        // Liquidado (secondary)
        liquidadoPeriodo1: liqP1,
        liquidadoPeriodo2: liqP2,
        variacaoLiquidado: liqP1 > 0 ? ((liqP2 - liqP1) / liqP1 * 100) : 0,
        // Pago explicit
        pagoPeriodo1: pagoP1,
        pagoPeriodo2: pagoP2,
        variacaoPago: pagoP1 > 0 ? ((pagoP2 - pagoP1) / pagoP1 * 100) : 0,
        // Meta
        totalRegistros: records.length,
        totalProgramas: programas.size,
        anosCobertura: Array.from(anos).sort(),
        metricaLabel: 'Pago',
        // Detalhado
        porAnoDetalhado,
        semSesai,
        // Orçamentário vs Extraorçamentário
        orcamentario: orcStats,
        extraorcamentario: extraStats,
      };
    };
    return {
      federal: compute(classified.federal.all),
    };
  }, [classified]);

  // Stats label
  const dynamicStats = useMemo(() => {
    if (!stats) return null;
    return {
      totalPeriodo1: stats.totalPeriodo1,
      totalPeriodo2: stats.totalPeriodo2,
      variacao: stats.variacao,
      totalRegistros: stats.totalRegistros,
      label: 'Inclui SESAI · Apenas ações com recorte racial/étnico',
    };
  }, [stats]);

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
      subtitle="Execução orçamentária de políticas raciais — Esfera Federal (2018–2025)"
    >

      {/* ===== SUB-ABAS ===== */}
      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="visao-geral">
            <Building className="w-4 h-4 mr-1" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="universo">
            <Layers className="w-4 h-4 mr-1" />
            Universo da Base
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
          <TabsTrigger value="artigos">
            <Scale className="w-4 h-4 mr-1" />
            Artigos ICERD
          </TabsTrigger>
        </TabsList>

        {/* ===== VISÃO GERAL ===== */}
        <TabsContent value="visao-geral">
          {/* 1) Dynamic Summary Cards — react to both toggles */}
          {hasData && !isLoading && (() => {
            const recs = artigoFilter ? currentRecords.filter(r => inferArtigosOrcamento(r).includes(artigoFilter)) : currentRecords;
            let filtered = incluirExtra ? recs : recs.filter(r => r.tipo_dotacao !== 'extraorcamentario');
            if (semSesaiMode) filtered = filtered.filter(r => classifyThematic(r) !== 'sesai');

            // Totals
            const totalDotacao = filtered.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0);
            const totalPago = filtered.reduce((s, r) => s + (Number(r.pago) || 0), 0);
            const totalLiquidado = filtered.reduce((s, r) => s + (Number(r.liquidado) || 0), 0);
            const execucao = totalDotacao > 0 ? (totalPago / totalDotacao * 100) : 0;
            const razao = totalDotacao > 0 ? (totalPago / totalDotacao) : 0;

            // Period splits
            const p1 = filtered.filter(r => r.ano >= 2018 && r.ano <= 2022);
            const p2 = filtered.filter(r => r.ano >= 2023 && r.ano <= 2025);
            const dotP1 = p1.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0);
            const dotP2 = p2.reduce((s, r) => s + (Number(r.dotacao_autorizada) || 0), 0);
            const pagoP1 = p1.reduce((s, r) => s + (Number(r.pago) || 0), 0);
            const pagoP2 = p2.reduce((s, r) => s + (Number(r.pago) || 0), 0);
            const varDot = dotP1 > 0 ? ((dotP2 - dotP1) / dotP1 * 100) : 0;
            const varPago = pagoP1 > 0 ? ((pagoP2 - pagoP1) / pagoP1 * 100) : 0;

            // Structure
            const programas = new Set(filtered.map(r => r.programa)).size;
            const orgaos = new Set(filtered.map(r => r.orgao)).size;
            const anosCobertura = [...new Set(filtered.map(r => r.ano))].sort();
            const anosRange = anosCobertura.length > 0 ? `${anosCobertura[0]}–${anosCobertura[anosCobertura.length - 1]}` : '—';

            // Cenário label
            const cenarioLabel = `${semSesaiMode ? 'Sem SESAI' : 'Com SESAI'} · ${incluirExtra ? 'Total' : 'Apenas LOA'}`;

            return (
              <div className="space-y-5 mb-6">
                {/* Cenário badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs px-3 py-1">{cenarioLabel}</Badge>
                  <span className="text-[10px] text-muted-foreground">{filtered.length} registros · {anosRange}</span>
                </div>

                {/* ROW 0: Contagem de Registros e Ações */}
                {(() => {
                  const orcRecs = filtered.filter(r => r.tipo_dotacao !== 'extraorcamentario');
                  const extraRecs = filtered.filter(r => r.tipo_dotacao === 'extraorcamentario');
                  const acoesOrc = new Set(orcRecs.map(r => `${r.programa}|${r.orgao}`)).size;
                  const acoesExtra = new Set(extraRecs.map(r => `${r.programa}|${r.orgao}`)).size;
                  return (
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-1">🗂️ Composição da Base</p>
                      <div className="grid grid-cols-3 gap-4">
                        <Card className="border-l-4 border-l-primary">
                          <CardContent className="pt-4 pb-3">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Total de Registros</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{filtered.length}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">Ação × Ano</p>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-success">
                          <CardContent className="pt-4 pb-3">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Ações Orçamentárias</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{acoesOrc}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{orcRecs.length} registros · LOA/Tesouro</p>
                          </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-warning">
                          <CardContent className="pt-4 pb-3">
                            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Ações Extraorçamentárias</p>
                            <p className="text-2xl font-bold text-foreground mt-1">{acoesExtra}</p>
                            <p className="text-[10px] text-muted-foreground mt-1">{extraRecs.length} registros · Compensatório</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  );
                })()}

                {/* ROW 1: A narrativa Planejamento → Execução */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-1">📊 Planejamento vs. Execução (acumulado)</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-primary">
                      <CardContent className="pt-4 pb-3">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Dotação Autorizada</p>
                        <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(totalDotacao)}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">O que foi planejado</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-success">
                      <CardContent className="pt-4 pb-3">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Valor Pago</p>
                        <p className="text-xl font-bold text-foreground mt-1">{formatCurrency(totalPago)}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">O que foi entregue</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-chart-1">
                      <CardContent className="pt-4 pb-3">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Execução</p>
                        <p className={`text-xl font-bold mt-1 ${execucao >= 80 ? 'text-success' : execucao >= 50 ? 'text-warning' : 'text-destructive'}`}>
                          {execucao.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {razao >= 1 ? `${razao.toFixed(1)}x acima da dotação` : `${razao.toFixed(2)}x da dotação executada`}
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-muted-foreground/40">
                      <CardContent className="pt-4 pb-3">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Estrutura</p>
                        <p className="text-xl font-bold text-foreground mt-1">{programas} <span className="text-sm font-normal text-muted-foreground">prog.</span></p>
                        <p className="text-[10px] text-muted-foreground mt-1">{orgaos} órgãos · {filtered.length} registros</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* ROW 2: Comparação P1 vs P2 */}
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-1">📅 Dotação por Período</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-primary/60">
                      <CardContent className="pt-4 pb-3">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">2018–2022 (5 anos)</p>
                        <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(dotP1)}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Dotação autorizada</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-success/60">
                      <CardContent className="pt-4 pb-3">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">2023–2025 (3 anos)</p>
                        <p className="text-lg font-bold text-success mt-1">{formatCurrency(dotP2)}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Dotação autorizada</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4" style={{ borderLeftColor: varDot >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
                      <CardContent className="pt-4 pb-3">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Variação Dotação</p>
                        <p className={`text-lg font-bold mt-1 ${varDot >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {varDot >= 0 ? '+' : ''}{varDot.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {Math.abs(varDot) > 100 ? `${(dotP2 / (dotP1 || 1)).toFixed(1)}x` : `${varDot >= 0 ? 'aumento' : 'queda'}`} entre períodos
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2 px-1">💰 Pago por Período</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-chart-2/60">
                      <CardContent className="pt-4 pb-3">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">2018–2022 (5 anos)</p>
                        <p className="text-lg font-bold text-foreground mt-1">{formatCurrency(pagoP1)}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Valor pago</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-chart-3/60">
                      <CardContent className="pt-4 pb-3">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">2023–2025 (3 anos)</p>
                        <p className="text-lg font-bold text-success mt-1">{formatCurrency(pagoP2)}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Valor pago</p>
                      </CardContent>
                    </Card>
                    <Card className="border-l-4" style={{ borderLeftColor: varPago >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
                      <CardContent className="pt-4 pb-3">
                        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Variação Pago</p>
                        <p className={`text-lg font-bold mt-1 ${varPago >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {varPago >= 0 ? '+' : ''}{varPago.toFixed(1)}%
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {Math.abs(varPago) > 100 ? `${(pagoP2 / (pagoP1 || 1)).toFixed(1)}x` : `${varPago >= 0 ? 'aumento' : 'queda'}`} entre períodos
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 3) Toggles — Perspectiva Orçamentária + SESAI */}
          <Card className="mb-4 border-l-4 border-l-chart-1">
            <CardContent className="py-3 px-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-chart-1" />
                  <div>
                    <p className="text-sm font-semibold">Cenários Analíticos</p>
                    <p className="text-xs text-muted-foreground">
                      Alterne para ver o impacto nos cards acima
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 flex-wrap">
                  {/* Toggle: Extraorçamentário */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="extra-toggle-orc" className="text-xs cursor-pointer">
                      {incluirExtra ? 'Com extraorçamentário' : 'Sem extraorçamentário'}
                    </Label>
                    <Switch 
                      id="extra-toggle-orc" 
                      checked={incluirExtra} 
                      onCheckedChange={setIncluirExtra} 
                    />
                  </div>
                  {/* Toggle: SESAI */}
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sesai-toggle" className="text-xs cursor-pointer">
                      {semSesaiMode ? 'Sem SESAI' : 'Com SESAI'}
                    </Label>
                    <Switch 
                      id="sesai-toggle" 
                      checked={!semSesaiMode} 
                      onCheckedChange={(v) => setSemSesaiMode(!v)} 
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* 4) Thematic filter bar */}
          <ThematicFilterBar filters={federalFilters} counts={getThemeCounts()} onToggle={toggleFilter(setFederalFilters)} />

          {/* 5) Article filter */}
          <div className="mb-4">
            <ArtigoFilter selected={artigoFilter} onSelect={setArtigoFilter} compact />
          </div>

          {/* 6) Content */}
          <EsferaContent
            records={artigoFilter ? currentRecords.filter(r => inferArtigosOrcamento(r).includes(artigoFilter)) : currentRecords}
            isLoading={isLoading}
            emptyMessage="Nenhum programa federal encontrado com os filtros selecionados."
            useOrgaoSection={true}
            showExclusions={true}
          />
        </TabsContent>

        {/* ===== UNIVERSO DA BASE ===== */}
        <TabsContent value="universo">
          <UniversoBaseTab records={currentRecords} />
        </TabsContent>

        {/* ===== RESUMO COMPARATIVO ===== */}
                <TabsContent value="resumo">
          <div className="space-y-6">
            <div className="space-y-6">
              {/* Nota Explicativa Federal */}
              <Card className="border-l-4 border-l-warning">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Nota Explicativa — Critérios e Dupla Perspectiva (Federal)</h4>
                      <p className="text-xs text-muted-foreground">
                        A métrica principal é <strong>"Pago"</strong> (transferência efetiva de recursos), comparada à <strong>"Dotação Inicial"</strong> (previsão na LOA).
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
              {esferaStats.federal.porAnoDetalhado && esferaStats.federal.semSesai?.porAnoDetalhado && (
                <SesaiMaskingInfographic
                  porAnoDetalhado={esferaStats.federal.porAnoDetalhado}
                  semSesaiPorAnoDetalhado={esferaStats.federal.semSesai.porAnoDetalhado}
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
                  Inclui a Saúde Indígena (SESAI), que representa a maior parcela do total — ver infográfico de mascaramento acima.
                </p>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <Card className="border-t-4 border-t-chart-1">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Dotação Autorizada</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div><p className="text-[10px] text-muted-foreground">2018–2022 (5 anos)</p><p className="text-lg font-bold">{formatCurrency(esferaStats.federal.dotacaoPeriodo1)}</p></div>
                        <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025 (3 anos)</p><p className="text-lg font-bold text-success">{formatCurrency(esferaStats.federal.dotacaoPeriodo2)}</p></div>
                      </div>
                      <div className={`text-center py-1 rounded text-sm font-bold ${esferaStats.federal.variacaoDotacao >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {esferaStats.federal.variacaoDotacao >= 0 ? '+' : ''}{esferaStats.federal.variacaoDotacao.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-chart-2">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pago</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(esferaStats.federal.pagoPeriodo1)}</p></div>
                        <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(esferaStats.federal.pagoPeriodo2)}</p></div>
                      </div>
                      <div className={`text-center py-1 rounded text-sm font-bold ${esferaStats.federal.variacaoPago >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {esferaStats.federal.variacaoPago >= 0 ? '+' : ''}{esferaStats.federal.variacaoPago.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-chart-3">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Liquidado</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(esferaStats.federal.liquidadoPeriodo1)}</p></div>
                        <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(esferaStats.federal.liquidadoPeriodo2)}</p></div>
                      </div>
                      <div className={`text-center py-1 rounded text-sm font-bold ${esferaStats.federal.variacaoLiquidado >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {esferaStats.federal.variacaoLiquidado >= 0 ? '+' : ''}{esferaStats.federal.variacaoLiquidado.toFixed(1)}%
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
                        <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(esferaStats.federal.semSesai.dotacaoP1)}</p></div>
                        <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(esferaStats.federal.semSesai.dotacaoP2)}</p></div>
                      </div>
                      <div className={`text-center py-1 rounded text-sm font-bold ${esferaStats.federal.semSesai.variacaoDotacao >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {esferaStats.federal.semSesai.variacaoDotacao >= 0 ? '+' : ''}{esferaStats.federal.semSesai.variacaoDotacao.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-chart-5">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Pago (sem SESAI)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(esferaStats.federal.semSesai.pagoP1)}</p></div>
                        <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(esferaStats.federal.semSesai.pagoP2)}</p></div>
                      </div>
                      <div className={`text-center py-1 rounded text-sm font-bold ${esferaStats.federal.semSesai.variacaoPago >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {esferaStats.federal.semSesai.variacaoPago >= 0 ? '+' : ''}{esferaStats.federal.semSesai.variacaoPago.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="border-t-4 border-t-primary">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Liquidado (sem SESAI)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between items-end">
                        <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-lg font-bold">{formatCurrency(esferaStats.federal.semSesai.liquidadoP1)}</p></div>
                        <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(esferaStats.federal.semSesai.liquidadoP2)}</p></div>
                      </div>
                      <div className={`text-center py-1 rounded text-sm font-bold ${esferaStats.federal.semSesai.variacaoLiquidado >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {esferaStats.federal.semSesai.variacaoLiquidado >= 0 ? '+' : ''}{esferaStats.federal.semSesai.variacaoLiquidado.toFixed(1)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <AuditFooter
                  fontes={[{ nome: 'Portal da Transparência — Sem SESAI', url: 'https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F2018&ate=31%2F12%2F2026' }]}
                  documentos={['Cálculo: Total − SESAI']}
                />
              </div>

              {/* INFOGRÁFICO: EFEITO MASCARAMENTO EXTRAORÇAMENTÁRIO */}
              {esferaStats.federal.extraorcamentario.total > 0 && esferaStats.federal.orcamentario.porAnoDetalhado && esferaStats.federal.extraorcamentario.porAnoDetalhado && (
                <ExtraorcamentarioMaskingInfographic
                  orcPorAno={esferaStats.federal.orcamentario.porAnoDetalhado}
                  extraPorAno={esferaStats.federal.extraorcamentario.porAnoDetalhado}
                  totalPorAno={esferaStats.federal.porAnoDetalhado}
                  orcTotal={esferaStats.federal.orcamentario.pagoP1 + esferaStats.federal.orcamentario.pagoP2}
                  extraTotal={esferaStats.federal.extraorcamentario.pagoP1 + esferaStats.federal.extraorcamentario.pagoP2}
                  formatCurrency={formatCurrency}
                  formatCurrencyFull={formatCurrencyFull}
                />
              )}

              {/* PERSPECTIVA 3: ORÇAMENTÁRIO vs EXTRAORÇAMENTÁRIO */}
              {esferaStats.federal.extraorcamentario.total > 0 && (
                <div>
                  <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                    <Scale className="w-5 h-5 text-chart-3" />
                    Perspectiva 3 — Esforço do Estado (LOA) vs. Financiamento Compensatório
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4">
                    Diferencia recursos aprovados na Lei Orçamentária Anual (esforço genuíno do Estado) 
                    de financiamento compensatório/reativo (compensações ambientais, royalties, indenizações — {esferaStats.federal.extraorcamentario.total} registros).
                  </p>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <Card className="border-t-4 border-t-primary">
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">🏛️ Orçamentário (LOA)</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-end">
                          <div><p className="text-[10px] text-muted-foreground">Pago 2018–2022</p><p className="text-lg font-bold">{formatCurrency(esferaStats.federal.orcamentario.pagoP1)}</p></div>
                          <div className="text-right"><p className="text-[10px] text-muted-foreground">Pago 2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(esferaStats.federal.orcamentario.pagoP2)}</p></div>
                        </div>
                        {(() => {
                          const v = esferaStats.federal.orcamentario.pagoP1 > 0 ? ((esferaStats.federal.orcamentario.pagoP2 - esferaStats.federal.orcamentario.pagoP1) / esferaStats.federal.orcamentario.pagoP1 * 100) : 0;
                          return <div className={`text-center py-1 rounded text-sm font-bold ${v >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{v >= 0 ? '+' : ''}{v.toFixed(1)}%</div>;
                        })()}
                        <p className="text-[10px] text-muted-foreground text-center">{esferaStats.federal.orcamentario.total} registros</p>
                      </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-chart-4">
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">🔄 Extraorçamentário (Compensatório)</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-end">
                          <div><p className="text-[10px] text-muted-foreground">Pago 2018–2022</p><p className="text-lg font-bold">{formatCurrency(esferaStats.federal.extraorcamentario.pagoP1)}</p></div>
                          <div className="text-right"><p className="text-[10px] text-muted-foreground">Pago 2023–2025</p><p className="text-lg font-bold text-chart-4">{formatCurrency(esferaStats.federal.extraorcamentario.pagoP2)}</p></div>
                        </div>
                        {(() => {
                          const v = esferaStats.federal.extraorcamentario.pagoP1 > 0 ? ((esferaStats.federal.extraorcamentario.pagoP2 - esferaStats.federal.extraorcamentario.pagoP1) / esferaStats.federal.extraorcamentario.pagoP1 * 100) : 0;
                          return <div className={`text-center py-1 rounded text-sm font-bold ${v >= 0 ? 'bg-chart-4/10 text-chart-4' : 'bg-destructive/10 text-destructive'}`}>{v >= 0 ? '+' : ''}{v.toFixed(1)}%</div>;
                        })()}
                        <p className="text-[10px] text-muted-foreground text-center">{esferaStats.federal.extraorcamentario.total} registros</p>
                      </CardContent>
                    </Card>
                    <Card className="border-t-4 border-t-chart-3">
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">📊 Financiamento Total</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        <div className="flex justify-between items-end">
                          <div><p className="text-[10px] text-muted-foreground">Pago 2018–2022</p><p className="text-lg font-bold">{formatCurrency(esferaStats.federal.pagoPeriodo1)}</p></div>
                          <div className="text-right"><p className="text-[10px] text-muted-foreground">Pago 2023–2025</p><p className="text-lg font-bold text-success">{formatCurrency(esferaStats.federal.pagoPeriodo2)}</p></div>
                        </div>
                        {(() => {
                          const totalPago = esferaStats.federal.orcamentario.pagoP1 + esferaStats.federal.orcamentario.pagoP2 + esferaStats.federal.extraorcamentario.pagoP1 + esferaStats.federal.extraorcamentario.pagoP2;
                          const totalExtra = esferaStats.federal.extraorcamentario.pagoP1 + esferaStats.federal.extraorcamentario.pagoP2;
                          const pctExtra = totalPago > 0 ? (totalExtra / totalPago * 100) : 0;
                          return <div className="text-center py-1 rounded text-sm font-bold bg-chart-3/10 text-chart-3">{pctExtra.toFixed(1)}% extraorçam.</div>;
                        })()}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Dotação Orçamentário vs Extra */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Dotação Autorizada — Apenas LOA</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-end">
                          <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-base font-bold">{formatCurrency(esferaStats.federal.orcamentario.dotP1)}</p></div>
                          <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-base font-bold text-success">{formatCurrency(esferaStats.federal.orcamentario.dotP2)}</p></div>
                        </div>
                        {(() => {
                          const v = esferaStats.federal.orcamentario.dotP1 > 0 ? ((esferaStats.federal.orcamentario.dotP2 - esferaStats.federal.orcamentario.dotP1) / esferaStats.federal.orcamentario.dotP1 * 100) : 0;
                          return <div className={`text-center py-1 rounded text-xs font-semibold mt-1 ${v >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{v >= 0 ? '+' : ''}{v.toFixed(1)}% variação dotação LOA</div>;
                        })()}
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm">Liquidado — Apenas LOA</CardTitle></CardHeader>
                      <CardContent>
                        <div className="flex justify-between items-end">
                          <div><p className="text-[10px] text-muted-foreground">2018–2022</p><p className="text-base font-bold">{formatCurrency(esferaStats.federal.orcamentario.liqP1)}</p></div>
                          <div className="text-right"><p className="text-[10px] text-muted-foreground">2023–2025</p><p className="text-base font-bold text-success">{formatCurrency(esferaStats.federal.orcamentario.liqP2)}</p></div>
                        </div>
                        {(() => {
                          const v = esferaStats.federal.orcamentario.liqP1 > 0 ? ((esferaStats.federal.orcamentario.liqP2 - esferaStats.federal.orcamentario.liqP1) / esferaStats.federal.orcamentario.liqP1 * 100) : 0;
                          return <div className={`text-center py-1 rounded text-xs font-semibold mt-1 ${v >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>{v >= 0 ? '+' : ''}{v.toFixed(1)}% variação liquidado LOA</div>;
                        })()}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Composição Extraorçamentário */}
                  {Object.keys(esferaStats.federal.extraorcamentario.subtipoMap).length > 0 && (
                    <Card className="mb-4">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Composição do Financiamento Extraorçamentário por Subtipo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(esferaStats.federal.extraorcamentario.subtipoMap)
                            .sort((a, b) => b[1] - a[1])
                            .map(([tipo, valor]) => {
                              const labels: Record<string, string> = {
                                compensacao_ambiental: 'Compensação Ambiental',
                                indenizacao: 'Indenização',
                                royalties: 'Royalties',
                                convenio: 'Convênio',
                                receita_propria: 'Receita Própria',
                                outros: 'Outros',
                              };
                              return (
                                <Badge key={tipo} variant="secondary" className="text-xs">
                                  {labels[tipo] || tipo}: {formatCurrency(valor)}
                                </Badge>
                              );
                            })}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Tabela Ano a Ano — Orçamentário vs Extra */}
                  <Card className="mb-4">
                    <CardHeader><CardTitle className="text-base">Evolução Ano a Ano — Orçamentário vs. Extraorçamentário (Pago, R$)</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Ano</TableHead>
                            <TableHead className="text-right">Orçamentário (LOA)</TableHead>
                            <TableHead className="text-right">Extraorçamentário</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">% Extra</TableHead>
                            <TableHead>Interpretação</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {[2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map(ano => {
                            const orcVal = esferaStats.federal.orcamentario.porAnoDetalhado[ano]?.pago || 0;
                            const extraVal = esferaStats.federal.extraorcamentario.porAnoDetalhado[ano]?.pago || 0;
                            const total = orcVal + extraVal;
                            const pctExtra = total > 0 ? (extraVal / total * 100) : 0;
                            const prevOrc = ano > 2018 ? (esferaStats.federal.orcamentario.porAnoDetalhado[ano - 1]?.pago || 0) : 0;
                            const varOrc = prevOrc > 0 ? ((orcVal - prevOrc) / prevOrc * 100) : 0;
                            const interpretacao = extraVal === 0
                              ? `LOA puro: ${formatCurrency(orcVal)}${ano > 2018 ? ` (${varOrc >= 0 ? '+' : ''}${varOrc.toFixed(0)}%)` : ''}.`
                              : `LOA: ${formatCurrency(orcVal)} + Extra: ${formatCurrency(extraVal)} (${pctExtra.toFixed(0)}% compensatório).`;
                            return (
                              <TableRow key={ano} className={ano === 2023 ? 'border-t-2 border-t-chart-3' : ''}>
                                <TableCell className="font-bold">{ano}</TableCell>
                                <TableCell className="text-right font-mono text-xs">{formatCurrencyFull(orcVal)}</TableCell>
                                <TableCell className="text-right font-mono text-xs text-chart-4">{formatCurrencyFull(extraVal)}</TableCell>
                                <TableCell className="text-right font-mono text-xs font-semibold">{formatCurrencyFull(total)}</TableCell>
                                <TableCell className="text-right text-xs">{pctExtra.toFixed(0)}%</TableCell>
                                <TableCell className="text-xs text-muted-foreground max-w-[250px]">{interpretacao}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Gráficos comparativos Orçamentário vs Extra */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Evolução Anual — Orçamentário (LOA)</CardTitle></CardHeader>
                      <CardContent>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.entries(esferaStats.federal.orcamentario.porAnoDetalhado).map(([ano, v]) => ({ ano: Number(ano), ...v })).sort((a, b) => a.ano - b.ano)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                              <Tooltip formatter={(value: number, name: string) => [formatCurrencyFull(value), name === 'dotacao' ? 'Dotação' : name === 'liquidado' ? 'Liquidado' : 'Pago']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                              <Legend wrapperStyle={{ fontSize: '10px' }} />
                              <Bar dataKey="dotacao" name="Dotação" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="liquidado" name="Liquidado" fill="hsl(var(--chart-2))" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="pago" name="Pago" fill="hsl(var(--chart-3))" radius={[2, 2, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader><CardTitle className="text-sm">Evolução Anual — Extraorçamentário</CardTitle></CardHeader>
                      <CardContent>
                        <div className="h-56">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={Object.entries(esferaStats.federal.extraorcamentario.porAnoDetalhado).map(([ano, v]) => ({ ano: Number(ano), ...v })).sort((a, b) => a.ano - b.ano)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                              <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 9 }} tickFormatter={(v) => formatCurrency(v)} />
                              <Tooltip formatter={(value: number, name: string) => [formatCurrencyFull(value), name === 'dotacao' ? 'Dotação' : name === 'liquidado' ? 'Liquidado' : 'Pago']} contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }} />
                              <Legend wrapperStyle={{ fontSize: '10px' }} />
                              <Bar dataKey="dotacao" name="Dotação" fill="hsl(var(--chart-4))" radius={[2, 2, 0, 0]} />
                              <Bar dataKey="pago" name="Pago" fill="hsl(var(--chart-5))" radius={[2, 2, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Insight analítico */}
                  <Card className="border-l-4 border-l-chart-3">
                    <CardContent className="pt-4 pb-3">
                      <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                        <Scale className="w-4 h-4 text-chart-3" />
                        🔎 Insight — "Financiamento Quase Invisível"
                      </h4>
                      <div className="text-xs text-muted-foreground space-y-2">
                        <p>
                          Os {esferaStats.federal.extraorcamentario.total} registros extraorçamentários representam ações cujo financiamento 
                          <strong> não passa pela aprovação do Congresso via LOA</strong>. São compensações ambientais (BR-163, Belo Monte),
                          royalties, indenizações e receitas próprias da FUNAI — recursos que financiam atividades reais (demarcação, fiscalização)
                          mas que <em>não refletem decisão política de investimento</em>.
                        </p>
                        <p>
                          <strong>Implicação para o Comitê CERD:</strong> Ao analisar o esforço do Estado brasileiro em políticas indígenas,
                          deve-se distinguir entre o que foi <strong>planejado e aprovado democraticamente</strong> (LOA) e o que é 
                          <strong>financiamento reativo/compensatório</strong>. A perspectiva "apenas LOA" revela o <em>esforço genuíno</em>,
                          enquanto a perspectiva "total" revela a <em>realidade operacional</em>.
                        </p>
                        {(() => {
                          const totalPago = esferaStats.federal.orcamentario.pagoP1 + esferaStats.federal.orcamentario.pagoP2 + esferaStats.federal.extraorcamentario.pagoP1 + esferaStats.federal.extraorcamentario.pagoP2;
                          const extraTotal = esferaStats.federal.extraorcamentario.pagoP1 + esferaStats.federal.extraorcamentario.pagoP2;
                          return (
                            <div className="bg-chart-3/5 rounded p-3 border border-chart-3/20">
                              <p className="text-xs font-semibold text-foreground">
                                O financiamento compensatório representa {totalPago > 0 ? (extraTotal / totalPago * 100).toFixed(1) : '0'}% do total pago.
                                {extraTotal > 0 && <> Sem ele, o investimento em políticas indígenas seria {formatCurrency(totalPago - extraTotal)}.</>}
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </CardContent>
                  </Card>

                  <AuditFooter
                    fontes={[
                      { nome: 'Portal da Transparência — Despesas Federais', url: 'https://portaldatransparencia.gov.br/despesas' },
                      { nome: 'Dados Abertos — LOA', url: 'https://dados.gov.br/dados/conjuntos-dados/orcamento-despesa' },
                    ]}
                    documentos={['Classificação: tipo_dotacao (orçamentário vs. extraorçamentário)', 'FUNAI Programa 0151 — ações com dotação zero']}
                  />
                </div>
              )}

              {/* Detalhamento por Grupo Focal Federal — omitted if stats unavailable */}

              {/* Tabela Ano a Ano — Federal */}
              {esferaStats.federal.porAnoDetalhado && esferaStats.federal.semSesai?.porAnoDetalhado && (
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
                          const total = esferaStats.federal.porAnoDetalhado[ano]?.pago || 0;
                          const semSesaiVal = esferaStats.federal.semSesai?.porAnoDetalhado[ano]?.pago || 0;
                          const sesaiVal = total - semSesaiVal;
                          const pctSesai = total > 0 ? (sesaiVal / total * 100) : 0;
                          // Interpretações dinâmicas baseadas nos dados
                          const semSVal = esferaStats.federal.semSesai?.porAnoDetalhado[ano]?.pago || 0;
                          const prevSemS = ano > 2018 ? (esferaStats.federal.semSesai?.porAnoDetalhado[ano - 1]?.pago || 0) : 0;
                          const varPct = prevSemS > 0 ? ((semSVal - prevSemS) / prevSemS * 100) : 0;
                          const interpretacao = ano === 2018
                            ? `Base: sem SESAI = ${formatCurrency(semSVal)}.`
                            : ano <= 2022
                              ? `Sem SESAI: ${formatCurrency(semSVal)} (${varPct >= 0 ? '+' : ''}${varPct.toFixed(0)}% vs. ${ano - 1}).`
                              : ano === 2023
                                ? `Reconstrução: criação do MIR. Sem SESAI: ${formatCurrency(semSVal)} (${varPct >= 0 ? '+' : ''}${varPct.toFixed(0)}%).`
                                : `Expansão: sem SESAI = ${formatCurrency(semSVal)} (${varPct >= 0 ? '+' : ''}${varPct.toFixed(0)}% vs. ${ano - 1}).`;
                          return (
                            <TableRow key={ano} className={ano === 2023 ? 'border-t-2 border-t-chart-2' : ''}>
                              <TableCell className="font-bold">{ano}</TableCell>
                              <TableCell className="text-right font-mono text-xs">{formatCurrencyFull(total)}</TableCell>
                              <TableCell className="text-right font-mono text-xs text-muted-foreground">{formatCurrencyFull(sesaiVal)}</TableCell>
                              <TableCell className="text-right font-mono text-xs font-semibold">{formatCurrencyFull(semSesaiVal)}</TableCell>
                              <TableCell className="text-right text-xs">{pctSesai.toFixed(0)}%</TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-[250px]">{interpretacao}</TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}

              {/* Conclusão Interpretativa Federal — DINÂMICA */}
              {(() => {
                const fc = formatCurrency;
                const semS = esferaStats.federal.semSesai;
                const comS = esferaStats.federal;
                const pad = semS?.porAnoDetalhado || {};
                const padTotal = comS.porAnoDetalhado || {};

                const val = (ano: number) => pad[ano]?.pago || 0;
                const valTotal = (ano: number) => padTotal[ano]?.pago || 0;
                const pctSesai = (ano: number) => {
                  const t = valTotal(ano);
                  return t > 0 ? (((t - val(ano)) / t) * 100).toFixed(0) : '0';
                };

                // Identify year where non-SESAI first exceeds 1 bi
                const anos = Object.keys(pad).map(Number).sort();
                const anoPrimeiroBi = anos.find(a => val(a) >= 1_000_000_000);

                // P1 non-SESAI range
                const p1Anos = anos.filter(a => a >= 2018 && a <= 2022);
                const p1Min = p1Anos.length > 0 ? Math.min(...p1Anos.map(val)) : 0;
                const p1Max = p1Anos.length > 0 ? Math.max(...p1Anos.map(val)) : 0;

                // First & last year SESAI %
                const firstYear = anos[0] || 2018;
                const lastYear = anos[anos.length - 1] || 2025;

                return (
                  <Card className="border-l-4 border-l-primary">
                    <CardContent className="pt-4 pb-3">
                      <h4 className="font-semibold text-sm mb-3">📊 Conclusão Interpretativa — Federal</h4>
                      <div className="text-xs text-muted-foreground space-y-3">
                        <div>
                          <p className="font-semibold text-foreground mb-1">A divisão em dois períodos é válida?</p>
                          <p><strong>Sim, mas com ressalvas fundamentais.</strong> A fronteira 2022→2023 marca a criação do MIR e o reinício da política racial institucional.</p>
                        </div>
                        <ul className="list-disc pl-4 space-y-1.5">
                          <li><strong>2018–2022:</strong> O investimento racial (sem SESAI) oscilou entre {fc(p1Min)} e {fc(p1Max)}/ano.</li>
                          <li><strong>2023:</strong> Criação do MIR. Sem SESAI, o pago subiu para {fc(val(2023))}.</li>
                          <li><strong>2024:</strong> Expansão significativa: sem SESAI, o pago atingiu {fc(val(2024))}.</li>
                          <li><strong>2025:</strong> Sem SESAI, o pago alcançou {fc(val(2025))}.{anoPrimeiroBi ? <strong> Pela primeira vez ({anoPrimeiroBi}), as políticas raciais sem SESAI superam R$ 1 bilhão.</strong> : null}</li>
                        </ul>
                        <div className="bg-muted/50 rounded p-3 mt-3">
                          <p className="font-semibold text-foreground mb-1">🔑 Achado Central</p>
                          <p>A SESAI representou <strong>~{pctSesai(firstYear)}% do total em {firstYear}</strong> e <strong>~{pctSesai(lastYear)}% em {lastYear}</strong>. A queda percentual da SESAI reflete o <em>crescimento exponencial das demais políticas</em>.</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })()}

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
                        <Building className="w-5 h-5 text-chart-4" />
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
          </div>
        </TabsContent>

        {/* ===== RELATÓRIO ===== */}
        <TabsContent value="relatorio">
          <div className="space-y-6">
            {classified.federal.all.length > 0 ? (
              <FederalRelatorioTab
                records={classified.federal.all}
                sesaiRecords={classified.sesai}
                summaryStats={esferaStats.federal}
                formatCurrency={formatCurrency}
                formatCurrencyFull={formatCurrencyFull}
              />
            ) : (
              <EmptyEsferaCard esfera="Federal" descricao="Dados federais não disponíveis para o Relatório. Insira dados via Portal da Transparência." />
            )}
          </div>
        </TabsContent>

        {/* ===== ARTIGOS ICERD ===== */}
        <TabsContent value="artigos">
          <ArtigoCruzamentoTab records={currentRecords} />
        </TabsContent>

        {/* ===== METODOLOGIA ===== */}
        <TabsContent value="metodologia">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Metodologia de Levantamento Orçamentário — Federal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-sm text-muted-foreground">
                <MetodologiaFederalSection />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

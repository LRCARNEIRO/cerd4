import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';

import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { ComplianceChart } from '@/components/dashboard/ComplianceChart';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { DataUploadButton } from '@/components/dashboard/DataUploadButton';
import { SnapshotManager } from '@/components/dashboard/SnapshotManager';
import { SensorAlertPanel } from '@/components/dashboard/SensorAlertPanel';
import { cerdRecommendations } from '@/data/mockData';
import { ARTIGOS_CONVENCAO, EIXO_PARA_ARTIGOS, inferArtigosOrcamento, inferArtigosDocumentoNormativo, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { getSafeIndicadores, inferArtigosIndicador } from '@/utils/inferArtigosIndicador';
import { summarizeIndicatorEvolution } from '@/utils/articleIndicatorEvolution';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  BarChart3, 
  Database,
  ArrowRight,
  FileText,
  RefreshCw,
  Loader2,
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { Scale } from 'lucide-react';
import { DualPerspectivePanel } from '@/components/dashboard/DualPerspectivePanel';
import { useEvolucaoSummary } from '@/hooks/useEvolucaoSummary';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDynamicStats';
import { useLacunasIdentificadas, useDadosOrcamentarios, useIndicadoresAnaliticos } from '@/hooks/useLacunasData';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { TOTAL_DADOS_ESTATISTICAS, TOTAL_TABELAS_COMMON_CORE, TOTAL_DADOS_COMMON_CORE, TOTAL_DADOS_NOVOS } from '@/utils/countStatisticsIndicators';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';


export default function Index() {
  const [showRollback, setShowRollback] = useState(false);
  const queryClient = useQueryClient();
  const { stats, isLoading, lacunasStats, orcamentoStats, indicadores } = useDashboardStats();
  const { data: allLacunas } = useLacunasIdentificadas();
  const { data: allOrcamento } = useDadosOrcamentarios();
  const { data: allIndicadores } = useIndicadoresAnaliticos();
  const { data: allNormativos } = useQuery({
    queryKey: ['normativos-index'],
    queryFn: async () => {
      const { data } = await supabase.from('documentos_normativos').select('titulo, artigos_convencao, categoria, secoes_impactadas, recomendacoes_impactadas');
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
  const { summary: sensorSummary, diagnosticMap, isReady: sensorReady } = useDiagnosticSensor(allLacunas);
  const criticalRecommendations = cerdRecommendations.filter(r => r.prioridade === 'critica');
  const { summary: evolSummary, isLoading: loadingEvol } = useEvolucaoSummary();
  const dashboardStatusData = sensorReady ? {
    cumprido: sensorSummary.statusReclassificado.cumprido,
    parcial: sensorSummary.statusReclassificado.parcialmente_cumprido,
    naoCumprido: sensorSummary.statusReclassificado.nao_cumprido,
    retrocesso: sensorSummary.statusReclassificado.retrocesso,
    emAndamento: sensorSummary.statusReclassificado.em_andamento || 0,
  } : {
    cumprido: stats.recomendacoesCumpridas,
    parcial: stats.recomendacoesParciais,
    naoCumprido: stats.recomendacoesNaoCumpridas,
    retrocesso: stats.recomendacoesRetrocesso,
    emAndamento: 0,
  };

  // Build per-article summary using SAME sources as detailed panels
  const artigosSummary = useMemo(() => {
    if (!allLacunas || !allOrcamento || !allIndicadores || !allNormativos) {
      return ARTIGOS_CONVENCAO.map(a => ({
        numero: a.numero, titulo: a.titulo, totalRecs: 0,
        cumpridas: 0, parciais: 0, emAndamento: 0, naoCumpridas: 0, evolScore: 0,
      }));
    }

    const dedupedInd = getSafeIndicadores(allIndicadores);

    return ARTIGOS_CONVENCAO.map(art => {
      const artNum = art.numero;

      // === COMPLIANCE: from diagnostic sensor (same as Esforço Governamental) ===
      const artRecs = allLacunas.filter(r => {
        const raw = (r as any).artigos_convencao;
        const explicit = Array.isArray(raw)
          ? raw.map((v: string) => {
              const u = String(v || '').toUpperCase().trim();
              if (u.includes('VII')) return 'VII';
              if (u.includes('VI')) return 'VI';
              if (u.includes('V')) return 'V';
              if (u.includes('IV')) return 'IV';
              if (u.includes('III')) return 'III';
              if (u.includes('II')) return 'II';
              if (u.includes('I')) return 'I';
              return null;
            }).filter(Boolean) as ArtigoConvencao[]
          : [];
        const arts = explicit.length > 0
          ? [...new Set(explicit)]
          : (EIXO_PARA_ARTIGOS[r.eixo_tematico as keyof typeof EIXO_PARA_ARTIGOS] || []);
        return arts.includes(artNum);
      });

      let cumpridas = 0, parciais = 0, emAndamento = 0, naoCumpridas = 0;
      artRecs.forEach(r => {
        const diag = diagnosticMap.get(r.id);
        const status = diag?.statusComputado ?? r.status_cumprimento;
        if (status === 'cumprido') cumpridas++;
        else if (status === 'parcialmente_cumprido') parciais++;
        else if (status === 'em_andamento') emAndamento++;
        else naoCumpridas++;
      });

      // === EVOLUTION: same logic as FarolEvolucaoPanel (35/35/30) ===
      const artigoOrc = (allOrcamento as any[]).filter((o: any) => {
        if (o.artigos_convencao?.includes(artNum)) return true;
        return inferArtigosOrcamento(o).includes(artNum);
      });
      const programasCount = new Set(artigoOrc.map((o: any) => o.programa)).size;
      const totalLiquidado = artigoOrc.reduce((s: number, o: any) => s + (Number(o.liquidado) || 0), 0);

      const artigoNorm = allNormativos.filter((d: any) => {
        if (d.artigos_convencao?.includes(artNum)) return true;
        return inferArtigosDocumentoNormativo(d).includes(artNum);
      });

      const artigoInd = dedupedInd.filter((ind: any) => {
        if (ind.artigos_convencao?.includes(artNum)) return true;
        return inferArtigosIndicador(ind).includes(artNum);
      });

      const indSummary = summarizeIndicatorEvolution(artigoInd);
      const scoreOrc = Math.min(100, programasCount > 0 ? 40 + Math.min(60, totalLiquidado / 1e8) : 0);
      const scoreNorm = Math.min(100, artigoNorm.length * 12);
      const scoreInd = indSummary.score;
      const evolScore = Math.round(scoreOrc * 0.35 + scoreNorm * 0.35 + scoreInd * 0.30);

      return {
        numero: artNum, titulo: art.titulo, totalRecs: artRecs.length,
        cumpridas, parciais, emAndamento, naoCumpridas, evolScore,
      };
    });
  }, [allLacunas, allOrcamento, allIndicadores, allNormativos, diagnosticMap]);




  const handleRefresh = () => {
    queryClient.invalidateQueries();
    toast.success('Dados atualizados!', { description: 'Todas as estatísticas foram recarregadas.' });
  };

  // Dados do gráfico de orçamento baseados no banco
  const activeSource = orcamentoStats?.porAnoDetalhado;

  const budgetTrendData = activeSource
    ? Object.entries(activeSource).map(([ano, v]) => ({
        ano: parseInt(ano),
        autorizado: v.dotacao || 0,
        empenhado: v.liquidado || 0,
        pago: v.pago || 0
      })).sort((a, b) => a.ano - b.ano)
    : [
        { ano: 2018, autorizado: 45000000, empenhado: 38000000, pago: 32000000 },
        { ano: 2019, autorizado: 52000000, empenhado: 45000000, pago: 40000000 },
        { ano: 2020, autorizado: 48000000, empenhado: 35000000, pago: 28000000 },
        { ano: 2021, autorizado: 42000000, empenhado: 32000000, pago: 25000000 },
        { ano: 2022, autorizado: 38000000, empenhado: 28000000, pago: 22000000 },
        { ano: 2023, autorizado: 85000000, empenhado: 72000000, pago: 58000000 },
        { ano: 2024, autorizado: 120000000, empenhado: 98000000, pago: 85000000 },
        { ano: 2025, autorizado: 145000000, empenhado: 115000000, pago: 95000000 }
      ];

  return (
    <DashboardLayout 
      title="Painel de Monitoramento CERD" 
      subtitle="IV Relatório do Brasil à Convenção sobre Eliminação de Discriminação Racial (2018-2025)"
    >
      {/* Hero Section */}
      <div className="header-gradient rounded-lg p-6 mb-6 animate-fade-in">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">
              Sistema de Subsídios para o IV Relatório CERD
            </h2>
            <p className="text-white/80 mt-1 max-w-2xl">
              Elaboração de evidências para o Estado brasileiro no ciclo de monitoramento 2018–2026, 
              conforme artigo 9º da Convenção Internacional sobre Eliminação de Discriminação Racial.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <DataUploadButton />
              <Button variant="secondary" size="lg" asChild>
                <Link to="/recomendacoes">
                  Ver Recomendações
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
                <Link to="/gerar-relatorios">
                  <FileText className="w-4 h-4 mr-2" />
                  Gerar Relatórios
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block text-right">
            <div className="flex items-center gap-2 justify-end mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white hover:bg-white/20 gap-1"
                onClick={() => setShowRollback(true)}
              >
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs">Rollback</span>
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white/80 hover:text-white hover:bg-white/20"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-white/60 text-sm">Última atualização</p>
            <p className="text-white font-medium">
              {new Date().toLocaleDateString('pt-BR')}
            </p>
            <div className="mt-2 text-xs text-white/60">
              <p>{stats.totalRecomendacoes} lacunas | {stats.totalIndicadores} indicadores</p>
              <p>{stats.totalOrcamento} registros orçamentários</p>
            </div>
          </div>
        </div>
      </div>


      {/* Sensor Diagnóstico — Alertas */}
      <div className="mb-6">
        <SensorAlertPanel summary={sensorSummary} isReady={sensorReady} />
      </div>

      {/* Stats Grid - Dinâmico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Recomendações ONU"
          value={isLoading ? '...' : stats.totalRecomendacoes}
          subtitle={`${dashboardStatusData.cumprido} classificadas como cumpridas`}
          icon={AlertTriangle}
          variant="warning"
          sourceInfo={{ label: 'CERD/C/BRA/CO/18-20 — OHCHR', url: 'https://tbinternet.ohchr.org/_layouts/15/treatybodyexternal/Download.aspx?symbolno=CERD%2FC%2FBRA%2FCO%2F18-20&Lang=en' }}
        />
        <StatCard
          title="Progresso Geral"
          value={isLoading ? '...' : `${sensorReady ? sensorSummary.progressoSensor : stats.progressoGeral}%`}
          subtitle="baseado nos dados"
          icon={ClipboardCheck}
          variant="default"
          sourceInfo={{ label: 'Sensor Diagnóstico — Nível 1', url: '/recomendacoes' }}
        />
        <StatCard
          title="Indicadores"
          value={isLoading ? '...' : TOTAL_DADOS_ESTATISTICAS + TOTAL_DADOS_COMMON_CORE + TOTAL_DADOS_NOVOS + stats.totalIndicadores}
          subtitle={`${TOTAL_TABELAS_COMMON_CORE} tabelas CC · ${TOTAL_DADOS_NOVOS} dados novos · ${stats.totalIndicadores} no BD`}
          icon={BarChart3}
          variant="success"
          sourceInfo={{ label: 'SIDRA/IBGE + DataSUS + FBSP', url: 'https://sidra.ibge.gov.br/home/pnadct/brasil' }}
        />
        <StatCard
          title="Registros Orçamentários"
          value={isLoading ? '...' : stats.totalOrcamento}
          subtitle={`${orcamentoStats?.porEsfera ? Object.keys(orcamentoStats.porEsfera).length : 0} esferas`}
          icon={Database}
          variant="default"
          sourceInfo={{ label: 'SIOP + Portal da Transparência', url: 'https://portaldatransparencia.gov.br/funcoes/14-Direitos-da-Cidadania' }}
        />
      </div>




      {/* Dual Perspective Panel — Storytelling */}
      <div className="mb-6">
        <DualPerspectivePanel
          statusData={dashboardStatusData}
          evolucaoData={evolSummary}
          artigosSummary={artigosSummary}
          isLoading={isLoading || loadingEvol}
        />
      </div>

      {/* Budget and Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Chart */}
        <BudgetChart data={budgetTrendData} />

        {/* Critical Recommendations */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Recomendações Críticas
            </h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/recomendacoes">
                Ver todas
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="space-y-3">
            {criticalRecommendations.slice(0, 3).map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
        </div>
      </div>




      {/* Quick Access */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickAccessCard
          title="SIDRA/IBGE"
          description="Tabelas por cor/raça"
          href="https://sidra.ibge.gov.br/Tabela/9605"
          detail="Tab. 9605 — População por cor/raça"
          external
        />
        <QuickAccessCard
          title="RAIS/CAGED"
          description="Emprego formal por raça"
          href="https://bi.mte.gov.br/bgcaged/"
          detail="BI do MTE — Painel CAGED/RAIS"
          external
        />
        <QuickAccessCard
          title="CadÚnico"
          description="Proteção social"
          href="https://aplicacoes.mds.gov.br/sagi/vis/data3/v.php?q[]=zExdOwJbFwcNXR0mJC0%3D&q[]=pOjvAAA%3D"
          detail="VIS Data — Famílias por raça"
          external
        />
        <QuickAccessCard
          title="DataSUS/TabNet"
          description="Mortalidade por raça/cor"
          href="http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/obt10uf.def"
          detail="SIM — Óbitos por causa e raça"
          external
        />
      </div>

      {/* Histórico de Versões */}
      <SnapshotManager />

      {/* Rollback Dialog */}
      <Dialog open={showRollback} onOpenChange={setShowRollback}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Restaurar Versão Anterior
            </DialogTitle>
          </DialogHeader>
          <SnapshotManager />
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

function QuickAccessCard({ 
  title, 
  description, 
  href, 
  detail,
  external 
}: { 
  title: string; 
  description: string; 
  href: string; 
  detail?: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className="data-card flex flex-col items-center text-center p-4 hover:border-primary/50 transition-colors group"
    >
      <Database className="w-8 h-8 text-primary mb-2 group-hover:scale-110 transition-transform" />
      <h3 className="font-medium text-sm text-foreground">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
      {detail && (
        <p className="text-[10px] text-primary/70 mt-1 flex items-center gap-0.5">
          <ExternalLink className="w-2.5 h-2.5" />
          {detail}
        </p>
      )}
    </a>
  );
}

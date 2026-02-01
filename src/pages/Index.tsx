import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { MetaProgressCard } from '@/components/dashboard/MetaProgressCard';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { ComplianceChart } from '@/components/dashboard/ComplianceChart';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { DataUploadButton } from '@/components/dashboard/DataUploadButton';
import { workPlanMetas, cerdRecommendations } from '@/data/mockData';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  BarChart3, 
  Database,
  ArrowRight,
  FileText,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDynamicStats';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function Index() {
  const queryClient = useQueryClient();
  const { stats, isLoading, lacunasStats, orcamentoStats, indicadores } = useDashboardStats();
  const criticalRecommendations = cerdRecommendations.filter(r => r.prioridade === 'critica');

  // Metas com progresso dinâmico
  const metasComProgresso = workPlanMetas.map((meta, index) => ({
    ...meta,
    progresso: isLoading ? meta.progresso : stats.metasProgresso[`meta${index + 1}` as keyof typeof stats.metasProgresso] || meta.progresso,
    status: getStatusFromProgresso(stats.metasProgresso[`meta${index + 1}` as keyof typeof stats.metasProgresso] || 0)
  }));

  function getStatusFromProgresso(progresso: number): 'nao_iniciada' | 'em_andamento' | 'concluida' {
    if (progresso === 0) return 'nao_iniciada';
    if (progresso >= 100) return 'concluida';
    return 'em_andamento';
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    toast.success('Dados atualizados!', { description: 'Todas as estatísticas foram recarregadas.' });
  };

  // Dados do gráfico de orçamento baseados no banco
  const budgetTrendData = orcamentoStats?.porAno 
    ? Object.entries(orcamentoStats.porAno).map(([ano, valor]) => ({
        ano: parseInt(ano),
        autorizado: valor * 1.2,
        empenhado: valor * 1.1,
        pago: valor
      }))
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
      subtitle="IV Relatório do Brasil à Convenção sobre Eliminação de Discriminação Racial (2018-2026)"
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
                <Link to="/plano-trabalho">
                  Ver Plano de Trabalho
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

      {/* Stats Grid - Dinâmico */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Recomendações ONU"
          value={isLoading ? '...' : stats.totalRecomendacoes}
          subtitle={`${stats.recomendacoesCumpridas} cumpridas`}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Progresso Geral"
          value={isLoading ? '...' : `${stats.progressoGeral}%`}
          subtitle="baseado nos dados"
          icon={ClipboardCheck}
          variant="default"
        />
        <StatCard
          title="Indicadores"
          value={isLoading ? '...' : stats.totalIndicadores}
          subtitle="no banco de dados"
          icon={BarChart3}
          variant="success"
        />
        <StatCard
          title="Fontes de Dados"
          value="12"
          subtitle="bases oficiais SIDRA"
          icon={Database}
          variant="default"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Metas Progress - Dinâmico */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Progresso das Metas (Dinâmico)</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/plano-trabalho">
                Ver todas
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metasComProgresso.map(meta => (
              <MetaProgressCard key={meta.id} meta={meta} />
            ))}
          </div>
        </div>

        {/* Compliance Chart - Dinâmico */}
        <div>
          <ComplianceChart 
            data={{
              cumprido: stats.recomendacoesCumpridas,
              parcial: stats.recomendacoesParciais,
              naoCumprido: stats.recomendacoesNaoCumpridas,
              retrocesso: stats.recomendacoesRetrocesso
            }}
          />
        </div>
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
          description="Dados oficiais agregados"
          href="https://sidra.ibge.gov.br/"
          external
        />
        <QuickAccessCard
          title="RAIS/CAGED"
          description="Emprego formal"
          href="http://bi.mte.gov.br/bgcaged/"
          external
        />
        <QuickAccessCard
          title="CadÚnico"
          description="Proteção social"
          href="https://aplicacoes.mds.gov.br/sagi/vis/data3/v.php"
          external
        />
        <QuickAccessCard
          title="DataSUS"
          description="Saúde pública"
          href="https://datasus.saude.gov.br/"
          external
        />
      </div>
    </DashboardLayout>
  );
}

function QuickAccessCard({ 
  title, 
  description, 
  href, 
  external 
}: { 
  title: string; 
  description: string; 
  href: string; 
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
    </a>
  );
}

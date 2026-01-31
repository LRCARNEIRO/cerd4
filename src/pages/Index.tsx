import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { MetaProgressCard } from '@/components/dashboard/MetaProgressCard';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { ComplianceChart } from '@/components/dashboard/ComplianceChart';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { 
  dashboardStats, 
  workPlanMetas, 
  cerdRecommendations 
} from '@/data/mockData';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  BarChart3, 
  Database,
  ArrowRight,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const budgetTrendData = [
  { ano: 2018, autorizado: 45000000, empenhado: 38000000, pago: 32000000 },
  { ano: 2019, autorizado: 52000000, empenhado: 45000000, pago: 40000000 },
  { ano: 2020, autorizado: 48000000, empenhado: 35000000, pago: 28000000 },
  { ano: 2021, autorizado: 42000000, empenhado: 32000000, pago: 25000000 },
  { ano: 2022, autorizado: 38000000, empenhado: 28000000, pago: 22000000 },
  { ano: 2023, autorizado: 85000000, empenhado: 72000000, pago: 58000000 },
  { ano: 2024, autorizado: 120000000, empenhado: 98000000, pago: 85000000 },
  { ano: 2025, autorizado: 145000000, empenhado: 115000000, pago: 95000000 }
];

export default function Index() {
  const criticalRecommendations = cerdRecommendations.filter(r => r.prioridade === 'critica');

  return (
    <DashboardLayout 
      title="Painel de Monitoramento CERD" 
      subtitle="IV Relatório do Brasil à Convenção sobre Eliminação de Discriminação Racial (2018-2025)"
    >
      {/* Hero Section */}
      <div className="header-gradient rounded-lg p-6 mb-6 animate-fade-in">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              Sistema de Subsídios para o IV Relatório CERD
            </h2>
            <p className="text-white/80 mt-1 max-w-2xl">
              Elaboração de evidências para o Estado brasileiro no ciclo de monitoramento 2018–2025, 
              conforme artigo 9º da Convenção Internacional sobre Eliminação de Discriminação Racial.
            </p>
            <div className="flex gap-3 mt-4">
              <Button variant="secondary" size="sm" asChild>
                <Link to="/plano-trabalho">
                  Ver Plano de Trabalho
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20" asChild>
                <Link to="/recomendacoes">
                  <FileText className="w-4 h-4 mr-2" />
                  Recomendações ONU
                </Link>
              </Button>
            </div>
          </div>
          <div className="hidden lg:block text-right">
            <p className="text-white/60 text-sm">Última atualização</p>
            <p className="text-white font-medium">
              {new Date(dashboardStats.ultimaAtualizacao).toLocaleDateString('pt-BR')}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Recomendações ONU"
          value={dashboardStats.totalRecomendacoes}
          subtitle={`${dashboardStats.recomendacoesCumpridas} cumpridas`}
          icon={AlertTriangle}
          variant="warning"
        />
        <StatCard
          title="Metas do Plano"
          value={`${dashboardStats.metasConcluidas}/${dashboardStats.metasPlanoTrabalho}`}
          subtitle="em execução"
          icon={ClipboardCheck}
          variant="default"
        />
        <StatCard
          title="Indicadores Atualizados"
          value={dashboardStats.indicadoresAtualizados}
          subtitle={`${dashboardStats.indicadoresDesatualizados} pendentes`}
          icon={BarChart3}
          variant="success"
        />
        <StatCard
          title="Fontes de Dados"
          value="12"
          subtitle="bases oficiais integradas"
          icon={Database}
          variant="default"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Metas Progress */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Progresso das Metas</h2>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/plano-trabalho">
                Ver todas
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workPlanMetas.map(meta => (
              <MetaProgressCard key={meta.id} meta={meta} />
            ))}
          </div>
        </div>

        {/* Compliance Chart */}
        <div>
          <ComplianceChart 
            data={{
              cumprido: dashboardStats.recomendacoesCumpridas,
              parcial: dashboardStats.recomendacoesParciais,
              naoCumprido: dashboardStats.recomendacoesNaoCumpridas,
              retrocesso: 4
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
          title="Censo 2022"
          description="Dados demográficos"
          href="https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html"
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

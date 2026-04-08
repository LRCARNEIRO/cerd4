import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DataUploadButton } from '@/components/dashboard/DataUploadButton';
import { SnapshotManager } from '@/components/dashboard/SnapshotManager';
import { BudgetChart } from '@/components/dashboard/BudgetChart';
import { DualPerspectivePanel } from '@/components/dashboard/DualPerspectivePanel';

import { MethodologyExportButton } from '@/components/dashboard/MethodologyExportButton';
import { ARTIGOS_CONVENCAO } from '@/utils/artigosConvencao';
import {
  ArrowRight, RefreshCw, Loader2, RotateCcw
} from 'lucide-react';
import { useEvolucaoSummary } from '@/hooks/useEvolucaoSummary';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Link } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDynamicStats';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { History } from 'lucide-react';

export default function Index() {
  const [showRollback, setShowRollback] = useState(false);
  const [historyAccordionValue, setHistoryAccordionValue] = useState('');
  const queryClient = useQueryClient();
  const { stats, isLoading, orcamentoStats } = useDashboardStats();
  // Single source: useEvolucaoSummary already runs useDiagnosticSensor internally
  const { summary: evolSummary, artigosSummary: evolArtigosSummary, isLoading: loadingEvol, sensorSummary, sensorReady } = useEvolucaoSummary();

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

  const artigosSummary = useMemo(() => {
    if (!evolArtigosSummary) {
      return ARTIGOS_CONVENCAO.map(a => ({
        numero: a.numero, titulo: a.titulo, totalRecs: 0,
        cumpridas: 0, parciais: 0, emAndamento: 0, naoCumpridas: 0, evolScore: 0,
      }));
    }
    return evolArtigosSummary.map(a => ({
      ...a,
      emAndamento: 0,
    }));
  }, [evolArtigosSummary]);

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    toast.success('Dados atualizados!', { description: 'Todas as estatísticas foram recarregadas.' });
  };

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
          </div>
        </div>
      </div>

      {/* Dual Perspective Panel */}
      <div className="mb-6">
        <DualPerspectivePanel
          statusData={dashboardStatusData}
          evolucaoData={evolSummary}
          artigosSummary={artigosSummary}
          isLoading={isLoading || loadingEvol}
        />
      </div>

      {/* Budget */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <BudgetChart data={budgetTrendData} />
      </div>

      {/* Methodology Export Button */}
      <div className="mb-6">
        <MethodologyExportButton />
      </div>

      {/* Histórico de Versões — collapsible */}
      <Accordion type="single" collapsible className="mb-6" value={historyAccordionValue} onValueChange={setHistoryAccordionValue}>
        <AccordionItem value="snapshots" className="border rounded-lg">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <span className="flex items-center gap-2 text-base font-semibold">
              <History className="w-5 h-5 text-primary" />
              Histórico de Versões
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-4 pb-4">
              {historyAccordionValue === 'snapshots' ? <SnapshotManager /> : null}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

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

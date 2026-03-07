import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TesteOrcamentoTab } from '@/components/estatisticas/orcamento/TesteOrcamentoTab';
import { useDadosOrcamentarios } from '@/hooks/useLacunasData';

export default function OrcamentoTeste() {
  const { data: dadosOrcamentarios, isLoading } = useDadosOrcamentarios();

  return (
    <DashboardLayout
      title="Orçamento — TESTE"
      subtitle="Metodologia experimental híbrida: marcadores de agenda transversal (2024–2025) + palavras-chave (2018–2023 e ciganos)"
    >
      <TesteOrcamentoTab
        allRecords={dadosOrcamentarios || []}
        isLoading={isLoading}
      />
    </DashboardLayout>
  );
}

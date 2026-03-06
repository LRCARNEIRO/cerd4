import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, TrendingUp, TrendingDown, DollarSign, BarChart3, PieChart, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { injectExportToolbar, downloadAsDocx } from '@/utils/reportExportToolbar';
import { useOrcamentoStats } from '@/hooks/useLacunasData';

export function BudgetReportGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGeneratedHtml, setLastGeneratedHtml] = useState<string | null>(null);
  const { data: stats, isLoading } = useOrcamentoStats();

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      toast.info('Gerando relatório orçamentário...', { 
        description: 'Agregando dados e cruzando com indicadores sociais.' 
      });

      const { data, error } = await supabase.functions.invoke('generate-budget-report', {
        body: {}
      });

      if (error) throw error;

      const htmlWithToolbar = injectExportToolbar(data, 'Relatorio-Orcamentario-CERD-IV');
      setLastGeneratedHtml(htmlWithToolbar);
      const blob = new Blob([htmlWithToolbar], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');

      if (newWindow) {
        toast.success('Relatório gerado com sucesso!', {
          description: 'O relatório foi aberto em uma nova aba.'
        });
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-orcamentario-${Date.now()}.html`;
        link.click();
        toast.success('Relatório baixado!');
      }

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating budget report:', error);
      toast.error('Erro ao gerar relatório', {
        description: error instanceof Error ? error.message : 'Tente novamente.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000000) {
      return 'R$ ' + (value / 1000000000).toFixed(2) + ' bi';
    } else if (value >= 1000000) {
      return 'R$ ' + (value / 1000000).toFixed(1) + ' mi';
    } else if (value >= 1000) {
      return 'R$ ' + (value / 1000).toFixed(0) + ' mil';
    }
    return 'R$ ' + value.toFixed(0);
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-l-4 border-l-emerald-600 bg-gradient-to-r from-emerald-50 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <DollarSign className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Relatório Orçamentário</h3>
              <p className="text-sm text-muted-foreground">
                Análise comparativa da execução orçamentária dos programas de políticas raciais (2018-2026), 
                com cruzamento de dados estatísticos para identificar correlações e insights.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stats Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingDown className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-red-600">
                    {isLoading ? '...' : formatCurrency(stats?.totalPeriodo1 || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">2018-2022</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-lg font-bold text-emerald-600">
                    {isLoading ? '...' : formatCurrency(stats?.totalPeriodo2 || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">2023-2026</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${(stats?.variacao || 0) >= 0 ? 'bg-emerald-100' : 'bg-red-100'}`}>
                  <BarChart3 className={`w-5 h-5 ${(stats?.variacao || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                </div>
                <div>
                  <p className={`text-lg font-bold ${(stats?.variacao || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isLoading ? '...' : `${(stats?.variacao || 0) >= 0 ? '+' : ''}${(stats?.variacao || 0).toFixed(0)}%`}
                  </p>
                  <p className="text-xs text-muted-foreground">Variação</p>
                </div>
              </div>
            </Card>
            
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <PieChart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-bold">
                    {isLoading ? '...' : stats?.totalRegistros || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Registros</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Programs breakdown */}
          {stats?.porPrograma && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Programas Analisados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(stats.porPrograma)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 6)
                    .map(([programa, valor]) => (
                      <div key={programa} className="flex items-center justify-between">
                        <span className="text-sm truncate max-w-[200px]">{programa}</span>
                        <Badge variant="outline">{formatCurrency(valor)}</Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Generate Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5" />
              Gerar Relatório
            </CardTitle>
            <CardDescription>
              Relatório completo com gráficos e análises
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-muted/50 rounded-lg space-y-2">
              <h4 className="text-sm font-medium">O relatório incluirá:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>✓ Evolução ano a ano (2018-2026)</li>
                <li>✓ Comparativo 2018-2022 vs 2023-2026</li>
                <li>✓ Análise por programa</li>
                <li>✓ Análise por grupo focal</li>
                <li>✓ Cruzamento com indicadores sociais</li>
                <li>✓ Insights e correlações</li>
                <li>✓ Fontes e referências</li>
              </ul>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button 
                className="gap-2 bg-emerald-600 hover:bg-emerald-700" 
                size="lg"
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Gerando...</>
                ) : (
                  <><DollarSign className="w-5 h-5" /> PDF / HTML</>
                )}
              </Button>
              <Button 
                variant="outline"
                className="gap-2" 
                size="lg"
                onClick={async () => {
                  if (lastGeneratedHtml) {
                    downloadAsDocx(lastGeneratedHtml, 'Relatorio-Orcamentario-CERD-IV');
                  } else {
                    setIsGenerating(true);
                    try {
                      const { data, error } = await supabase.functions.invoke('generate-budget-report', { body: {} });
                      if (error) throw error;
                      const html = injectExportToolbar(data, 'Relatorio-Orcamentario-CERD-IV');
                      setLastGeneratedHtml(html);
                      downloadAsDocx(html, 'Relatorio-Orcamentario-CERD-IV');
                    } catch (e) {
                      toast.error('Erro ao gerar relatório');
                    } finally {
                      setIsGenerating(false);
                    }
                  }
                }}
                disabled={isGenerating}
              >
                <Download className="w-5 h-5" /> DOCX
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

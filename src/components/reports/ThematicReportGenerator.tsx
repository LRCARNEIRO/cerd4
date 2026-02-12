import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, BarChart3, Users, MapPin, BookOpen, Briefcase, Heart, Scale, Shield, Landmark, PieChart, TrendingUp, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { injectExportToolbar } from '@/utils/reportExportToolbar';
import { useLacunasStats, useIndicadoresInterseccionais, useConclusoesAnaliticas } from '@/hooks/useLacunasData';

const eixoOptions = [
  { value: 'todos', label: 'Todos os Eixos', icon: PieChart },
  { value: 'legislacao_justica', label: 'Legislação e Justiça', icon: Scale },
  { value: 'politicas_institucionais', label: 'Políticas Institucionais', icon: Landmark },
  { value: 'seguranca_publica', label: 'Segurança Pública', icon: Shield },
  { value: 'saude', label: 'Saúde', icon: Heart },
  { value: 'educacao', label: 'Educação', icon: BookOpen },
  { value: 'trabalho_renda', label: 'Trabalho e Renda', icon: Briefcase },
  { value: 'terra_territorio', label: 'Terra e Território', icon: MapPin },
  { value: 'cultura_patrimonio', label: 'Cultura e Patrimônio', icon: BookOpen },
  { value: 'participacao_social', label: 'Participação Social', icon: Users },
  { value: 'dados_estatisticas', label: 'Dados e Estatísticas', icon: BarChart3 },
];

const grupoOptions = [
  { value: 'todos', label: 'Todos os Grupos', icon: Users },
  { value: 'negros', label: 'População Negra', icon: Users },
  { value: 'indigenas', label: 'Povos Indígenas', icon: Users },
  { value: 'quilombolas', label: 'Comunidades Quilombolas', icon: MapPin },
  { value: 'ciganos', label: 'Povos Ciganos (Roma)', icon: Users },
  { value: 'religioes_matriz_africana', label: 'Religiões de Matriz Africana', icon: Heart },
  { value: 'juventude_negra', label: 'Juventude Negra', icon: Users },
  { value: 'mulheres_negras', label: 'Mulheres Negras', icon: Users },
  { value: 'lgbtqia_negros', label: 'LGBTQIA+ Negros', icon: Users },
  { value: 'pcd_negros', label: 'PcD Negros', icon: Users },
  { value: 'idosos_negros', label: 'Idosos Negros', icon: Users },
  { value: 'geral', label: 'População Geral', icon: Users },
];

export function ThematicReportGenerator() {
  const [eixo, setEixo] = useState('todos');
  const [grupo, setGrupo] = useState('todos');
  const [tituloPersonalizado, setTituloPersonalizado] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: stats } = useLacunasStats();
  const { data: indicadores } = useIndicadoresInterseccionais();
  const { data: conclusoes } = useConclusoesAnaliticas();

  // Calculate preview stats based on filters
  const getFilteredStats = () => {
    if (!stats) return { total: 0, eixo: 0, grupo: 0 };
    
    return {
      total: stats.total,
      eixo: eixo !== 'todos' ? (stats.porEixo[eixo] || 0) : stats.total,
      grupo: grupo !== 'todos' ? (stats.porGrupo[grupo] || 0) : stats.total,
    };
  };

  const filteredStats = getFilteredStats();

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    try {
      toast.info('Gerando relatório temático...', { 
        description: 'Aguarde enquanto agregamos os dados e criamos as visualizações.' 
      });

      const { data, error } = await supabase.functions.invoke('generate-thematic-report', {
        body: {
          eixo_tematico: eixo,
          grupo_focal: grupo,
          titulo_personalizado: tituloPersonalizado || undefined,
        }
      });

      if (error) throw error;

      // Open HTML in new tab with export toolbar
      const htmlWithToolbar = injectExportToolbar(data, `Relatorio-Tematico-${eixo}-${grupo}`);
      const blob = new Blob([htmlWithToolbar], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const newWindow = window.open(url, '_blank');

      if (newWindow) {
        toast.success('Relatório gerado com sucesso!', {
          description: 'O relatório foi aberto em uma nova aba. Use Ctrl+P para salvar como PDF.'
        });
      } else {
        // Fallback: download
        const link = document.createElement('a');
        link.href = url;
        link.download = `relatorio-tematico-${eixo}-${grupo}-${Date.now()}.html`;
        link.click();
        toast.success('Relatório baixado!');
      }

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating thematic report:', error);
      toast.error('Erro ao gerar relatório', {
        description: error instanceof Error ? error.message : 'Tente novamente.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedEixo = eixoOptions.find(e => e.value === eixo);
  const selectedGrupo = grupoOptions.find(g => g.value === grupo);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="border-l-4 border-l-accent bg-gradient-to-r from-accent/5 to-transparent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <FileText className="w-8 h-8 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-1">Relatórios Temáticos Narrativos</h3>
              <p className="text-sm text-muted-foreground">
                Gere dossiês visuais focados em eixos temáticos ou grupos focais específicos. 
                Os relatórios agregam dados, indicadores e conclusões para contar a história 
                das políticas raciais no Brasil (2018-2026).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-5 h-5" />
              Configurar Relatório
            </CardTitle>
            <CardDescription>
              Selecione os filtros para gerar um relatório focado
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Eixo Temático */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Eixo Temático</Label>
              <Select value={eixo} onValueChange={setEixo}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um eixo temático" />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  {eixoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4 text-muted-foreground" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {eixo !== 'todos' && (
                <p className="text-xs text-muted-foreground">
                  {filteredStats.eixo} lacuna(s) identificada(s) neste eixo
                </p>
              )}
            </div>

            {/* Grupo Focal */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Grupo Focal</Label>
              <Select value={grupo} onValueChange={setGrupo}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um grupo focal" />
                </SelectTrigger>
                <SelectContent className="bg-background border">
                  {grupoOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4 text-muted-foreground" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {grupo !== 'todos' && (
                <p className="text-xs text-muted-foreground">
                  {filteredStats.grupo} lacuna(s) relacionada(s) a este grupo
                </p>
              )}
            </div>

            {/* Título Personalizado */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Título Personalizado (opcional)</Label>
              <Input
                placeholder="Ex: Dossiê sobre Violência Policial contra Juventude Negra"
                value={tituloPersonalizado}
                onChange={(e) => setTituloPersonalizado(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Deixe em branco para usar o título padrão baseado nos filtros
              </p>
            </div>

            {/* Generate Button */}
            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={handleGenerateReport}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando relatório...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Gerar Relatório Temático
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-5 h-5" />
              Preview do Relatório
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected Filters Preview */}
            <div className="p-4 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center gap-2">
                {selectedEixo && <selectedEixo.icon className="w-4 h-4 text-primary" />}
                <span className="text-sm font-medium">{selectedEixo?.label || 'Todos os Eixos'}</span>
              </div>
              <div className="flex items-center gap-2">
                {selectedGrupo && <selectedGrupo.icon className="w-4 h-4 text-accent" />}
                <span className="text-sm font-medium">{selectedGrupo?.label || 'Todos os Grupos'}</span>
              </div>
            </div>

            {/* Data Summary */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-muted-foreground">Dados incluídos:</h4>
              
              <div className="flex items-center justify-between p-2 bg-primary/5 rounded">
                <span className="text-sm">Lacunas analisadas</span>
                <Badge variant="outline">{filteredStats.total}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-accent/5 rounded">
                <span className="text-sm">Indicadores</span>
                <Badge variant="outline">{indicadores?.length || 0}</Badge>
              </div>
              
              <div className="flex items-center justify-between p-2 bg-success/5 rounded">
                <span className="text-sm">Conclusões</span>
                <Badge variant="outline">{conclusoes?.length || 0}</Badge>
              </div>
            </div>

            {/* Report Features */}
            <div className="pt-4 border-t space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">O relatório incluirá:</h4>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Visualização de cumprimento
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Indicadores interseccionais
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Timeline de recomendações
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Síntese narrativa
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                  Conclusões analíticas
                </li>
              </ul>
            </div>

            {/* Warning for empty filters */}
            {(eixo !== 'todos' && filteredStats.eixo === 0) || (grupo !== 'todos' && filteredStats.grupo === 0) ? (
              <div className="p-3 bg-warning/10 border border-warning/20 rounded-lg flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                <p className="text-xs text-warning">
                  Poucos dados disponíveis para os filtros selecionados. O relatório pode ficar incompleto.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.porStatus.cumprido || 0}</p>
              <p className="text-xs text-muted-foreground">Cumpridas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.porStatus.parcialmente_cumprido || 0}</p>
              <p className="text-xs text-muted-foreground">Parciais</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats?.porStatus.nao_cumprido || 0}</p>
              <p className="text-xs text-muted-foreground">Não Cumpridas</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{indicadores?.length || 0}</p>
              <p className="text-xs text-muted-foreground">Indicadores</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

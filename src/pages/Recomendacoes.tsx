import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState, useMemo } from 'react';
import { Search, AlertTriangle, CheckCircle2, Clock, XCircle, Database, Loader2, Activity, Sparkles } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLacunasIdentificadas, useLacunasStats, useRespostasLacunasCerdIII, useDadosOrcamentarios, useIndicadoresAnaliticos, type ComplianceStatus, type PriorityLevel, type ThematicAxis, type FocalGroupType } from '@/hooks/useLacunasData';
import { generateDynamicJustificativa } from '@/utils/generateDynamicJustificativa';

import { LacunaCard } from '@/components/dashboard/LacunaCard';
import { RespostaCerdCard } from '@/components/dashboard/RespostaCerdCard';
import { RecomendacoesGeraisTab } from '@/components/recomendacoes/RecomendacoesGeraisTab';
import { DurbanTab } from '@/components/recomendacoes/DurbanTab';
import { ObservacoesFinaisTab } from '@/components/recomendacoes/ObservacoesFinaisTab';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';
import {
  generateObservacoesFinaisHTML, generateLacunasExportHTML,
  generateRespostasCerdIIIExportHTML, generateDurbanExportHTML,
  generateRecomendacoesGeraisHTML,
} from '@/components/recomendacoes/generateRecomendacoesHTML';
import { generateFollowUpHTML } from '@/components/recomendacoes/generateFollowUpHTML';
import { ArtigoFilter } from '@/components/dashboard/ArtigoFilter';
import { EIXO_PARA_ARTIGOS, type ArtigoConvencao } from '@/utils/artigosConvencao';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { MethodologyPanel } from '@/components/shared/MethodologyPanel';

const eixoLabels: Record<ThematicAxis, string> = {
  legislacao_justica: 'Legislação e Justiça',
  politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública',
  saude: 'Saúde',
  educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda',
  terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio',
  participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas'
};

const grupoLabels: Record<FocalGroupType, string> = {
  negros: 'População Negra',
  indigenas: 'Povos Indígenas',
  quilombolas: 'Comunidades Quilombolas',
  ciganos: 'Povos Ciganos',
  religioes_matriz_africana: 'Religiões de Matriz Africana',
  juventude_negra: 'Juventude Negra',
  mulheres_negras: 'Mulheres Negras',
  lgbtqia_negros: 'LGBTQIA+ Negros',
  pcd_negros: 'PcD Negros',
  idosos_negros: 'Idosos Negros',
  geral: 'Geral'
};

export default function Recomendacoes() {
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<PriorityLevel | 'all'>('all');
  const [filterEixo, setFilterEixo] = useState<ThematicAxis | 'all'>('all');
  const [filterGrupo, setFilterGrupo] = useState<FocalGroupType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterArtigo, setFilterArtigo] = useState<ArtigoConvencao | null>(null);
  

  const { data: lacunas, isLoading: loadingLacunas } = useLacunasIdentificadas({
    eixo: filterEixo !== 'all' ? filterEixo : undefined,
    grupo: filterGrupo !== 'all' ? filterGrupo : undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    prioridade: filterPriority !== 'all' ? filterPriority : undefined,
  });

  const { data: stats, isLoading: loadingStats } = useLacunasStats();
  const { data: respostasCerd, isLoading: loadingRespostas } = useRespostasLacunasCerdIII();
  const { data: allIndicadores } = useIndicadoresAnaliticos();
  const { data: allOrcamento } = useDadosOrcamentarios();

  // Fetch normativos for dynamic cross-referencing
  const { data: allNormativos } = useQuery({
    queryKey: ['normativos-justificativa'],
    queryFn: async () => {
      const { data } = await supabase.from('documentos_normativos').select('titulo, categoria, status, artigos_convencao');
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  // Build dynamic justificativas from ALL three bases (indicadores + orçamento + normativos)
  const dynamicJustificativas = useMemo(() => {
    if (!allIndicadores || !allOrcamento) return {};
    const map: Record<string, string | null> = {};
    const paragrafos = ['12', '14', '16', '18', '20', '22', '24', '26'];
    for (const p of paragrafos) {
      map[p] = generateDynamicJustificativa(p, allIndicadores as any, allOrcamento as any, allNormativos || []);
    }
    return map;
  }, [allIndicadores, allOrcamento, allNormativos]);

  // Diagnostic Sensor — Level 1
  const { diagnosticMap, summary: sensorSummary, isReady: sensorReady } = useDiagnosticSensor(lacunas);

  const filteredLacunas = lacunas?.filter(lacuna => {
    // Filtro por artigo da Convenção
    if (filterArtigo) {
      const artigosDoEixo = EIXO_PARA_ARTIGOS[lacuna.eixo_tematico] || [];
      if (!artigosDoEixo.includes(filterArtigo)) return false;
    }
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      lacuna.tema.toLowerCase().includes(term) ||
      lacuna.descricao_lacuna.toLowerCase().includes(term) ||
      lacuna.paragrafo.toLowerCase().includes(term)
    );
  }) || [];

  // Contagens por artigo para o filtro
  const artigoCounts = lacunas?.reduce((acc, l) => {
    const artigos = EIXO_PARA_ARTIGOS[l.eixo_tematico] || [];
    artigos.forEach(a => { acc[a] = (acc[a] || 0) + 1; });
    return acc;
  }, {} as Record<ArtigoConvencao, number>) || {} as Record<ArtigoConvencao, number>;

  const isLoading = loadingLacunas || loadingStats;

  return (
    <DashboardLayout
      title="Recomendações"
      subtitle="Observações Finais, Recomendações Gerais, Durban e Follow-up — Análise de Cumprimento 2018-2025"
    >
      {/* Metodologia + Stats */}
      <div className="mb-4">
        <MethodologyPanel variant="sensor" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <Database className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Lacunas</p>
              <p className="text-xl font-bold">{isLoading ? '...' : stats?.total || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cumpridas</p>
              <p className="text-xl font-bold text-success">{isLoading ? '...' : stats?.porStatus.cumprido || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Parciais</p>
              <p className="text-xl font-bold text-warning">{isLoading ? '...' : stats?.porStatus.parcialmente_cumprido || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Não Cumpridas</p>
              <p className="text-xl font-bold text-destructive">{isLoading ? '...' : stats?.porStatus.nao_cumprido || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Críticas</p>
              <p className="text-xl font-bold">{isLoading ? '...' : stats?.porPrioridade.critica || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="observacoes" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="observacoes">Observações Finais</TabsTrigger>
          <TabsTrigger value="lacunas">Lacunas Identificadas</TabsTrigger>
          <TabsTrigger value="respostas">Respostas CERD III</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-up 2026</TabsTrigger>
          <TabsTrigger value="rgs">Recomendações Gerais</TabsTrigger>
          <TabsTrigger value="durban">Durban</TabsTrigger>
        </TabsList>

        <TabsContent value="observacoes">
          <div className="flex justify-end mb-3" data-export-ignore="true">
            <ExportTabButtons targetSelector="#export-recomendacoes-observacoes" generateHTML={generateObservacoesFinaisHTML} fileName="Observacoes-Finais-CERD" compact />
          </div>
          <div id="export-recomendacoes-observacoes">
            <ObservacoesFinaisTab />
          </div>
        </TabsContent>

        <TabsContent value="lacunas">
          <div className="flex justify-end mb-3" data-export-ignore="true">
            <ExportTabButtons targetSelector="#export-recomendacoes-lacunas" generateHTML={() => generateLacunasExportHTML(filteredLacunas, stats)} fileName="Lacunas-ONU-CERD" compact />
          </div>
          <div id="export-recomendacoes-lacunas">
          {/* Sensor Diagnóstico — Resumo */}
          {sensorReady && sensorSummary.totalDivergencias > 0 && (
            <Card className="mb-4 border-warning/40 bg-warning/5">
              <CardContent className="py-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <Activity className="w-5 h-5 text-warning" />
                  <span className="text-sm font-semibold">Sensor Diagnóstico Ativo</span>
                  <Badge variant="destructive" className="text-xs">
                    {sensorSummary.totalDivergencias} divergência(s)
                  </Badge>
                  {sensorSummary.totalOrcamentoSimbolico > 0 && (
                    <Badge variant="outline" className="text-xs border-warning/40 text-warning">
                      💰 {sensorSummary.totalOrcamentoSimbolico} orç. simbólico(s)
                    </Badge>
                  )}
                  {sensorSummary.totalTendenciaPiora > 0 && (
                    <Badge variant="outline" className="text-xs border-destructive/40 text-destructive">
                      📊 {sensorSummary.totalTendenciaPiora} tendência(s) de piora
                    </Badge>
                  )}
                  {sensorSummary.totalSemCoberturaNormativa > 0 && (
                    <Badge variant="outline" className="text-xs border-muted-foreground/40">
                      📋 {sensorSummary.totalSemCoberturaNormativa} sem cobertura normativa
                    </Badge>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    Progresso Sensor: {sensorSummary.progressoSensor}%
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filtro por Artigos da Convenção ICERD */}
          <div className="mb-4">
            <ArtigoFilter selected={filterArtigo} onSelect={setFilterArtigo} counts={artigoCounts} compact />
          </div>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tema, parágrafo ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterEixo} onValueChange={(v) => setFilterEixo(v as ThematicAxis | 'all')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Eixo Temático" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os eixos</SelectItem>
                {Object.entries(eixoLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterGrupo} onValueChange={(v) => setFilterGrupo(v as FocalGroupType | 'all')}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Grupo Focal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os grupos</SelectItem>
                {Object.entries(grupoLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as ComplianceStatus | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="cumprido">Cumprido</SelectItem>
                <SelectItem value="parcialmente_cumprido">Parcialmente Cumprido</SelectItem>
                <SelectItem value="nao_cumprido">Não Cumprido</SelectItem>
                <SelectItem value="retrocesso">Retrocesso</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as PriorityLevel | 'all')}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Prioridade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as prioridades</SelectItem>
                <SelectItem value="critica">Crítica</SelectItem>
                <SelectItem value="alta">Alta</SelectItem>
                <SelectItem value="media">Média</SelectItem>
                <SelectItem value="baixa">Baixa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {loadingLacunas ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando lacunas do banco de dados...</span>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredLacunas.map(lacuna => (
                  <LacunaCard key={lacuna.id} lacuna={lacuna} diagnostic={diagnosticMap.get(lacuna.id)} />
                ))}
              </div>
              
              {filteredLacunas.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">Nenhuma lacuna encontrada com os filtros selecionados.</p>
                </div>
              )}
            </>
          )}
          </div>
        </TabsContent>

        <TabsContent value="respostas">
          <div className="flex items-center justify-between mb-3" data-export-ignore="true">
            <Badge variant="outline" className="gap-1 text-xs border-primary/30 text-primary">
              <Sparkles className="w-3 h-3" /> Avaliações técnicas geradas dinamicamente a partir dos dados atuais
            </Badge>
            <ExportTabButtons targetSelector="#export-recomendacoes-respostas" generateHTML={() => generateRespostasCerdIIIExportHTML(respostasCerd || [])} fileName="Respostas-CERD-III" compact />
          </div>
          <div id="export-recomendacoes-respostas">
          {loadingRespostas ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Carregando respostas...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {respostasCerd?.map(resposta => (
                <RespostaCerdCard
                  key={resposta.id}
                  resposta={resposta}
                  dynamicJustificativa={dynamicJustificativas[resposta.paragrafo_cerd_iii] || null}
                />
              ))}
            </div>
          )}
          </div>
        </TabsContent>

        <TabsContent value="follow-up">
          <div className="flex justify-end mb-3" data-export-ignore="true">
            <ExportTabButtons targetSelector="#export-recomendacoes-followup" generateHTML={generateFollowUpHTML} fileName="Follow-Up-CERD-2026" compact />
          </div>
          <div id="export-recomendacoes-followup">
          <Card>
            <CardHeader>
              <CardTitle>CERD/C/BRA/FCO/18-20 - Follow-up Janeiro 2026</CardTitle>
              <p className="text-sm text-muted-foreground">
                Informações recebidas do Brasil sobre o acompanhamento das observações finais
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg">
                  <h4 className="font-medium mb-2">Parágrafos de "particular importância"</h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    O Comitê solicitou resposta prioritária sobre:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-card rounded border">
                      <Badge className="mb-2">§17(a)</Badge>
                      <p className="text-sm">Direito à saúde e efeitos da COVID-19</p>
                    </div>
                    <div className="p-3 bg-card rounded border">
                      <Badge className="mb-2">§19(c)</Badge>
                      <p className="text-sm">Disparidades no acesso à educação</p>
                    </div>
                    <div className="p-3 bg-card rounded border">
                      <Badge className="mb-2">§23(a)</Badge>
                      <p className="text-sm">Pobreza, trabalho e renda</p>
                    </div>
                    <div className="p-3 bg-card rounded border">
                      <Badge className="mb-2">§36(a-d)</Badge>
                      <p className="text-sm">Uso excessivo de força por agentes da lei</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                  <h4 className="font-medium text-accent mb-2">Destaque: Ministério da Igualdade Racial</h4>
                  <p className="text-sm text-foreground">
                    O MIR desempenha papel estratégico na formulação e implementação de políticas públicas 
                    de promoção da igualdade racial. Principais marcos regulatórios:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                      <span>Programa Juventude Negra Viva (Decreto 11.956/2024)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                      <span>Programa Federal de Ações Afirmativas (Decreto 11.785/2023)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />
                      <span>PNGTAQ - Política Nacional de Gestão Territorial Quilombola (Decreto 11.786/2023)</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        </TabsContent>

        <TabsContent value="rgs">
          <div className="flex justify-end mb-3" data-export-ignore="true">
            <ExportTabButtons targetSelector="#export-recomendacoes-rgs" generateHTML={generateRecomendacoesGeraisHTML} fileName="Recomendacoes-Gerais-CERD" compact />
          </div>
          <div id="export-recomendacoes-rgs">
            <RecomendacoesGeraisTab />
          </div>
        </TabsContent>

        <TabsContent value="durban">
          <div className="flex justify-end mb-3" data-export-ignore="true">
            <ExportTabButtons targetSelector="#export-recomendacoes-durban" generateHTML={generateDurbanExportHTML} fileName="Durban-Cruzamento" compact />
          </div>
          <div id="export-recomendacoes-durban">
            <DurbanTab />
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

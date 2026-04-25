import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useMemo } from 'react';
import { AlertTriangle, CheckCircle2, Clock, XCircle, Database, Filter } from 'lucide-react';
import { useLacunasIdentificadas, useLacunasStats, useRespostasLacunasCerdIII, type ComplianceStatus, type PriorityLevel, type ThematicAxis, type FocalGroupType } from '@/hooks/useLacunasData';
import { contarPorOrigem, ORIGEM_CONFIG, type OrigemLacuna } from '@/utils/classificarOrigemLacuna';

import { LacunaCard } from '@/components/dashboard/LacunaCard';
import { RespostaCerdCard } from '@/components/dashboard/RespostaCerdCard';
import { RecomendacoesGeraisTab } from '@/components/recomendacoes/RecomendacoesGeraisTab';
import { DurbanTab } from '@/components/recomendacoes/DurbanTab';
import { ObservacoesFinaisTab } from '@/components/recomendacoes/ObservacoesFinaisTab';
import { RelacaoRecomendacoesTab } from '@/components/recomendacoes/RelacaoRecomendacoesTab';
import { ExportTabButtons } from '@/components/reports/ExportTabButtons';
import {
  generateObservacoesFinaisHTML, generateLacunasExportHTML,
  generateRespostasCerdIIIExportHTML, generateDurbanExportHTML,
  generateRecomendacoesGeraisHTML,
} from '@/components/recomendacoes/generateRecomendacoesHTML';
import { generateFollowUpHTML } from '@/components/recomendacoes/generateFollowUpHTML';
import type { ArtigoConvencao } from '@/utils/artigosConvencao';

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
  const [filterArtigo, setFilterArtigo] = useState<ArtigoConvencao | null>(null);
  const [activeTab, setActiveTab] = useState('relacao');
  

  const { data: lacunas, isLoading: loadingLacunas } = useLacunasIdentificadas({
    eixo: filterEixo !== 'all' ? filterEixo : undefined,
    grupo: filterGrupo !== 'all' ? filterGrupo : undefined,
    status: filterStatus !== 'all' ? filterStatus : undefined,
    prioridade: filterPriority !== 'all' ? filterPriority : undefined,
  });

  const { data: stats, isLoading: loadingStats } = useLacunasStats();
  const { data: respostasCerd, isLoading: loadingRespostas } = useRespostasLacunasCerdIII();

  const isLoading = loadingLacunas || loadingStats;
  const statusStats = stats?.porStatus;

  return (
    <DashboardLayout
      title="Recomendações"
      subtitle="Observações Finais, Recomendações Gerais, Durban e Follow-up — Análise de Cumprimento 2018-2025"
    >
      {/* Stats */}
      {(() => {
        const origemCounts = contarPorOrigem(lacunas || []);
        const totalGeral = (lacunas?.length) || 0;
        return (
          <>
             <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
               <Card>
                 <CardContent className="pt-4 pb-4 flex items-center gap-3">
                   <div className="p-2 bg-muted rounded-lg">
                     <Database className="w-5 h-5 text-foreground" />
                   </div>
                   <div>
                     <p className="text-xs text-muted-foreground">Total Monitoradas</p>
                     <p className="text-xl font-bold">{isLoading ? '...' : totalGeral}</p>
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
                     <p className="text-xl font-bold text-success">{isLoading ? '...' : sensorReady ? sensorSummary?.statusReclassificado.cumprido || 0 : stats?.porStatus.cumprido || 0}</p>
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
                     <p className="text-xl font-bold text-warning">{isLoading ? '...' : sensorReady ? sensorSummary?.statusReclassificado.parcialmente_cumprido || 0 : stats?.porStatus.parcialmente_cumprido || 0}</p>
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
                      <p className="text-xl font-bold text-destructive">{isLoading ? '...' : sensorReady ? (sensorSummary?.statusReclassificado.nao_cumprido || 0) + (sensorSummary?.statusReclassificado.retrocesso || 0) + (sensorSummary?.statusReclassificado.em_andamento || 0) : stats?.porStatus.nao_cumprido || 0}</p>
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

            {/* Resumo por origem */}
            <div className="flex flex-wrap items-center gap-3 mb-6 p-3 bg-muted/30 rounded-lg border">
              <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Composição:
              </span>
              {(['cerd', 'rg', 'durban'] as OrigemLacuna[]).map(o => (
                <Badge key={o} variant="outline" className={`text-xs border ${ORIGEM_CONFIG[o].cor}`}>
                  {ORIGEM_CONFIG[o].labelCurto}: {origemCounts[o]}
                </Badge>
              ))}
              <Badge variant="secondary" className="text-xs font-semibold">
                Total: {totalGeral} recomendações com avaliação de status
              </Badge>
            </div>
          </>
        );
      })()}


      <Tabs defaultValue="relacao" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="relacao">📋 Relação Completa</TabsTrigger>
          <TabsTrigger value="observacoes">Observações Finais</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-up 2026</TabsTrigger>
          <TabsTrigger value="rgs">Recomendações Gerais</TabsTrigger>
          <TabsTrigger value="durban">Durban</TabsTrigger>
          <TabsTrigger value="respostas-cerd">Respostas às Críticas ({respostasCerd?.length || 0})</TabsTrigger>
        </TabsList>

        <TabsContent value="relacao">
          <RelacaoRecomendacoesTab />
        </TabsContent>

        <TabsContent value="observacoes">
          <div className="flex justify-end mb-3" data-export-ignore="true">
            <ExportTabButtons targetSelector="#export-recomendacoes-observacoes" generateHTML={generateObservacoesFinaisHTML} fileName="Observacoes-Finais-CERD" compact />
          </div>
          <div id="export-recomendacoes-observacoes">
            <ObservacoesFinaisTab />
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

        <TabsContent value="respostas-cerd">
          <Card className="mb-4 border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-warning flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Respostas às Críticas do CERD III</h3>
                  <p className="text-sm text-muted-foreground">
                    {respostasCerd?.length || 0} respostas oficiais com avaliação dinâmica de cumprimento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-4">
            {(respostasCerd || []).map(resposta => (
              <RespostaCerdCard
                key={resposta.id}
                resposta={resposta}
                dynamicJustificativa={dynamicJustificativas[resposta.paragrafo_cerd_iii] || null}
              />
            ))}
          </div>
        </TabsContent>

      </Tabs>
    </DashboardLayout>
  );
}

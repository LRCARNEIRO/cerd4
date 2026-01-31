import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { cerdRecommendations, unObservations } from '@/data/mockData';
import { RecommendationCard } from '@/components/dashboard/RecommendationCard';
import { StatusBadge } from '@/components/ui/status-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search, AlertTriangle, CheckCircle2, Clock, XCircle, MessageSquare } from 'lucide-react';
import type { ComplianceStatus, Priority } from '@/types/cerd';

export default function Recomendacoes() {
  const [filterStatus, setFilterStatus] = useState<ComplianceStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRecommendations = cerdRecommendations.filter(rec => {
    const matchesStatus = filterStatus === 'all' || rec.statusCumprimento === filterStatus;
    const matchesPriority = filterPriority === 'all' || rec.prioridade === filterPriority;
    const matchesSearch = searchTerm === '' || 
      rec.tema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.recomendacao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.eixo.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPriority && matchesSearch;
  });

  // Contagens para os stats
  const stats = {
    total: cerdRecommendations.length,
    cumpridas: cerdRecommendations.filter(r => r.statusCumprimento === 'cumprido').length,
    parciais: cerdRecommendations.filter(r => r.statusCumprimento === 'parcialmente_cumprido').length,
    naoCumpridas: cerdRecommendations.filter(r => r.statusCumprimento === 'nao_cumprido').length,
    criticas: cerdRecommendations.filter(r => r.prioridade === 'critica').length
  };

  return (
    <DashboardLayout
      title="Recomendações ONU"
      subtitle="CERD/C/BRA/CO/18-20 - Observações Finais de 2022"
    >
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="pt-4 pb-4 flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg">
              <MessageSquare className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-xl font-bold">{stats.total}</p>
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
              <p className="text-xl font-bold text-success">{stats.cumpridas}</p>
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
              <p className="text-xl font-bold text-warning">{stats.parciais}</p>
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
              <p className="text-xl font-bold text-destructive">{stats.naoCumpridas}</p>
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
              <p className="text-xl font-bold">{stats.criticas}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recomendacoes" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="recomendacoes">Recomendações Priorizadas</TabsTrigger>
          <TabsTrigger value="observacoes">Observações Detalhadas</TabsTrigger>
          <TabsTrigger value="follow-up">Follow-up 2026</TabsTrigger>
        </TabsList>

        <TabsContent value="recomendacoes">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tema, eixo ou conteúdo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
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
            <Select value={filterPriority} onValueChange={(v) => setFilterPriority(v as Priority | 'all')}>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredRecommendations.map(rec => (
              <RecommendationCard key={rec.id} recommendation={rec} />
            ))}
          </div>
          
          {filteredRecommendations.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Nenhuma recomendação encontrada com os filtros selecionados.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="observacoes">
          <div className="space-y-4">
            {unObservations.map(obs => (
              <Card key={obs.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">§{obs.paragrafo}</Badge>
                        <Badge 
                          variant={obs.tipo === 'preocupacao' ? 'destructive' : 
                                   obs.tipo === 'elogio' ? 'default' : 'secondary'}
                        >
                          {obs.tipo === 'preocupacao' ? 'Preocupação' :
                           obs.tipo === 'recomendacao' ? 'Recomendação' :
                           obs.tipo === 'solicitacao' ? 'Solicitação' : 'Elogio'}
                        </Badge>
                        <StatusBadge status={obs.statusAtendimento} size="sm" />
                      </div>
                      <h3 className="font-medium">{obs.tema}</h3>
                      <p className="text-sm text-muted-foreground mt-2">{obs.texto}</p>
                      
                      {obs.respostaBrasil && (
                        <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg">
                          <p className="text-xs font-medium text-success mb-1">Resposta do Brasil:</p>
                          <p className="text-sm text-foreground">{obs.respostaBrasil}</p>
                        </div>
                      )}
                      
                      {obs.acoesPendentes.length > 0 && (
                        <div className="mt-3">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Ações pendentes:</p>
                          <ul className="text-sm space-y-0.5">
                            {obs.acoesPendentes.map((acao, i) => (
                              <li key={i} className="flex items-center gap-1 text-warning">
                                <span>•</span> {acao}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="follow-up">
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
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

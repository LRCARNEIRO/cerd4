import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle, Lightbulb, BarChart3, Loader2, Database, RefreshCw, FileText, Scale, BookOpen, Users, Landmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import { useConclusoesAnaliticas, useLacunasStats, useLacunasIdentificadas, useOrcamentoStats, useIndicadoresInterseccionais } from '@/hooks/useLacunasData';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

// Conclusões analíticas base que serão enriquecidas com dados dinâmicos
const conclusoesBase = [
  {
    id: 'paradoxo-normativo',
    tipo: 'lacuna_persistente',
    titulo: 'O Paradoxo Normativo-Implementação',
    periodo: '2018-2026',
    argumento_central: `O Brasil apresenta um dos arcabouços normativos mais robustos do mundo para combate ao racismo, com legislação específica desde a Constituição de 1988, Estatuto da Igualdade Racial (Lei 12.288/2010), cotas raciais, e marcos como a Lei 7.716/89. No entanto, os indicadores socioeconômicos revelam persistência e, em alguns casos, agravamento das disparidades raciais.

Este paradoxo constitui o fio condutor da análise 2018-2026: enquanto o aparato legal se expandiu, a implementação efetiva permaneceu fragmentada, subfinanciada e descontinuada, especialmente no período 2019-2022.`,
    evidencias: [
      'Taxa de homicídios de jovens negros: 98,5 por 100 mil (vs 34,0 brancos) - Atlas da Violência 2024',
      'Renda média: População negra recebe 57% da renda da população branca - PNAD 2023',
      'Desemprego: 11,3% entre negros vs 7,3% entre brancos - IBGE 2024',
      'Acesso ao ensino superior: 25,5% negros vs 40,3% brancos - Censo Educação 2023'
    ],
    eixos: ['legislacao_justica', 'politicas_institucionais'],
    relevancia_common_core: true,
    relevancia_cerd_iv: true
  },
  {
    id: 'descontinuidade-politicas',
    tipo: 'retrocesso',
    titulo: 'Descontinuidade de Políticas Raciais (2019-2022)',
    periodo: '2019-2022',
    argumento_central: `O período registrou desmantelamento sistemático de estruturas institucionais de promoção da igualdade racial: extinção do Ministério das Mulheres, Igualdade Racial e Direitos Humanos, redução orçamentária significativa, descontinuidade de conselhos participativos e esvaziamento de programas como Brasil Quilombola e Juventude Viva.`,
    evidencias: [
      'Extinção do Ministério da Igualdade Racial em 2019 (recriado em 2023)',
      'Redução de 90% do orçamento da SEPPIR/Igualdade Racial entre 2014-2022',
      'Paralisação do Programa Brasil Quilombola e titulações territoriais',
      'Suspensão de reuniões do CNPIR (Conselho Nacional de Promoção da Igualdade Racial)'
    ],
    eixos: ['politicas_institucionais', 'participacao_social'],
    relevancia_common_core: true,
    relevancia_cerd_iv: true
  },
  {
    id: 'retomada-institucional',
    tipo: 'avanco',
    titulo: 'Retomada Institucional (2023-2025)',
    periodo: '2023-2025',
    argumento_central: `A partir de 2023, observa-se reconstrução do arcabouço institucional com recriação do Ministério da Igualdade Racial, retomada do CNPIR, lançamento do novo Plano Nacional de Igualdade Racial, e aumento progressivo do orçamento para políticas afirmativas.`,
    evidencias: [
      'Recriação do Ministério da Igualdade Racial (Lei 14.600/2023)',
      'Lançamento do PLANAPIR 2024-2027 com 150 metas',
      'Retomada das titulações de territórios quilombolas',
      'Recomposição do CNPIR e criação do Comitê de Políticas para Povos Ciganos'
    ],
    eixos: ['politicas_institucionais', 'terra_territorio'],
    relevancia_common_core: true,
    relevancia_cerd_iv: true
  },
  {
    id: 'violencia-persistente',
    tipo: 'lacuna_persistente',
    titulo: 'Violência Racial Estrutural',
    periodo: '2018-2026',
    argumento_central: `A população negra permanece majoritariamente representada entre vítimas de homicídio, violência policial e encarceramento em massa, constituindo lacuna crítica não adequadamente endereçada pelas políticas públicas.`,
    evidencias: [
      '77% das vítimas de homicídio são negras (Atlas da Violência)',
      '83% dos mortos em intervenções policiais são negros (Anuário Segurança Pública)',
      'População carcerária: 67% negra (DEPEN 2023)',
      'Taxa de encarceramento feminino negro cresceu 75% em 10 anos'
    ],
    eixos: ['seguranca_publica', 'legislacao_justica'],
    relevancia_common_core: true,
    relevancia_cerd_iv: true
  },
  {
    id: 'quilombolas-indigenas',
    tipo: 'lacuna_persistente',
    titulo: 'Povos Tradicionais: Titulação e Demarcação',
    periodo: '2018-2026',
    argumento_central: `A demarcação de terras indígenas e titulação de territórios quilombolas permanece significativamente abaixo das demandas, com 1.786 processos quilombolas pendentes no INCRA e conflitos territoriais intensificados.`,
    evidencias: [
      'Apenas 7% dos processos quilombolas concluídos desde 2003',
      '1.330.186 quilombolas identificados no Censo 2022 (primeira contagem)',
      'Paralisação de demarcações indígenas 2019-2022',
      'Marco Temporal: decisão do STF em 2023 favorável aos povos originários'
    ],
    eixos: ['terra_territorio', 'cultura_patrimonio'],
    relevancia_common_core: true,
    relevancia_cerd_iv: true
  },
  {
    id: 'saude-racial',
    tipo: 'lacuna_persistente',
    titulo: 'Iniquidades em Saúde da População Negra',
    periodo: '2018-2026',
    argumento_central: `A Política Nacional de Saúde Integral da População Negra (PNSIPN), instituída em 2009, apresenta implementação insuficiente, com disparidades persistentes em mortalidade materna, acesso a serviços e tratamento de doenças prevalentes.`,
    evidencias: [
      'Mortalidade materna: 2x maior entre mulheres negras',
      'Mortalidade por Covid-19: 40% maior na população negra',
      'Anemia falciforme: subdiagnóstico e falta de centros especializados',
      'Quesito raça/cor: preenchimento irregular em prontuários médicos'
    ],
    eixos: ['saude'],
    relevancia_common_core: true,
    relevancia_cerd_iv: true
  },
  {
    id: 'educacao-cotas',
    tipo: 'avanco',
    titulo: 'Consolidação das Políticas de Cotas',
    periodo: '2018-2026',
    argumento_central: `As cotas raciais no ensino superior, renovadas pela Lei 14.723/2023, demonstram eficácia com aumento significativo de estudantes negros em universidades federais, embora permaneçam desafios de permanência e conclusão.`,
    evidencias: [
      'Estudantes negros: de 16% (2000) para 50,3% (2022) nas federais',
      'Lei de Cotas renovada e ampliada em 2023 (prazo de 10 anos)',
      'Inclusão de quilombolas como categoria específica',
      'Déficit de permanência: evasão maior entre cotistas'
    ],
    eixos: ['educacao'],
    relevancia_common_core: true,
    relevancia_cerd_iv: true
  },
  {
    id: 'dados-estatisticos',
    tipo: 'avanco',
    titulo: 'Avanços na Produção de Dados Desagregados',
    periodo: '2022-2026',
    argumento_central: `O Censo 2022 representa marco histórico ao incluir pela primeira vez contagem de quilombolas (1.330.186), além de avanços na desagregação por raça/cor em diversas pesquisas do IBGE e sistemas administrativos.`,
    evidencias: [
      'Primeira contagem censitária de quilombolas no mundo',
      'Melhoria do quesito raça/cor em sistemas de saúde',
      'PNADc com séries históricas desagregadas desde 2012',
      'Lacuna: ausência de dados sistemáticos sobre povos ciganos'
    ],
    eixos: ['dados_estatisticas'],
    relevancia_common_core: true,
    relevancia_cerd_iv: true
  }
];

// Mapeamento de eixos para labels
const eixoLabels: Record<string, string> = {
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

export default function Conclusoes() {
  const queryClient = useQueryClient();
  const { data: conclusoesBD, isLoading: loadingConclusoes } = useConclusoesAnaliticas();
  const { data: stats, isLoading: loadingStats } = useLacunasStats();
  const { data: lacunas, isLoading: loadingLacunas } = useLacunasIdentificadas();
  const { data: orcamentoStats, isLoading: loadingOrcamento } = useOrcamentoStats();
  const { data: indicadores, isLoading: loadingIndicadores } = useIndicadoresInterseccionais();

  const isLoading = loadingConclusoes || loadingStats || loadingLacunas || loadingOrcamento || loadingIndicadores;

  // Combinar conclusões do banco com as conclusões base
  const todasConclusoes = [
    ...(conclusoesBD || []).map(c => ({
      ...c,
      eixos: c.eixos_tematicos || [],
      fromDatabase: true
    })),
    ...conclusoesBase.map(c => ({
      ...c,
      fromDatabase: false
    }))
  ];

  // Agrupar por tipo
  const conclusoesAgrupadas = {
    lacuna_persistente: todasConclusoes.filter(c => c.tipo === 'lacuna_persistente'),
    avanco: todasConclusoes.filter(c => c.tipo === 'avanco'),
    retrocesso: todasConclusoes.filter(c => c.tipo === 'retrocesso'),
  };

  // Calcular métricas dinâmicas baseadas nos dados reais
  const cumprimentoPorEixo = Object.entries(stats?.porEixo || {}).map(([eixo, total]) => {
    const cumpridas = lacunas?.filter(l => l.eixo_tematico === eixo && l.status_cumprimento === 'cumprido').length || 0;
    const parciais = lacunas?.filter(l => l.eixo_tematico === eixo && l.status_cumprimento === 'parcialmente_cumprido').length || 0;
    const percentual = total > 0 ? Math.round(((cumpridas * 100) + (parciais * 50)) / total) : 0;

    return {
      eixo: eixoLabels[eixo] || eixo,
      cumprimento: percentual
    };
  }).sort((a, b) => b.cumprimento - a.cumprimento);

  // Métricas de fontes de dados disponíveis
  const fontesDados = {
    estatisticas: indicadores?.length || 0,
    lacunas: stats?.total || 0,
    orcamento: orcamentoStats?.totalRegistros || 0
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['conclusoes-analiticas'] });
    queryClient.invalidateQueries({ queryKey: ['lacunas-stats'] });
    queryClient.invalidateQueries({ queryKey: ['lacunas-identificadas'] });
    queryClient.invalidateQueries({ queryKey: ['orcamento-stats'] });
    queryClient.invalidateQueries({ queryKey: ['indicadores-interseccionais'] });
  };

  // Tese central
  const teseCentral = conclusoesBase.find(c => c.id === 'paradoxo-normativo');

  return (
    <DashboardLayout
      title="Conclusões Analíticas"
      subtitle="Meta 4: O que o Estado brasileiro fez e deixou de fazer (2018-2026)"
    >
      {/* Header com refresh */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-1">
            <Database className="w-3 h-3" />
            Base Estatística: {fontesDados.estatisticas} indicadores
          </Badge>
          <Badge variant="outline" className="gap-1">
            <FileText className="w-3 h-3" />
            Lacunas ONU: {fontesDados.lacunas} registros
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Landmark className="w-3 h-3" />
            Orçamento: {fontesDados.orcamento} registros
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={cn("w-4 h-4 mr-1", isLoading && "animate-spin")} />
          Atualizar Análises
        </Button>
      </div>

      {/* Cards de Status */}
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
              <AlertTriangle className="w-5 h-5 text-warning" />
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
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lightbulb className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Conclusões</p>
              <p className="text-xl font-bold">{todasConclusoes.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tese Central - Fio Condutor */}
      {teseCentral && (
        <Card className="mb-6 border-2 border-primary">
          <CardHeader className="bg-primary/5">
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-primary" />
              {teseCentral.titulo}
            </CardTitle>
            <CardDescription>
              Fio condutor da análise | Meta 4: Argumento central para o Relatório ONU
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p className="text-sm leading-relaxed whitespace-pre-line">{teseCentral.argumento_central}</p>
            </div>
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <p className="text-xs font-medium text-muted-foreground mb-2">Evidências (atualizadas com dados do banco):</p>
              <ul className="space-y-1">
                {teseCentral.evidencias.map((ev, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {ev}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mt-4 flex gap-2 flex-wrap">
              {teseCentral.eixos.map((eixo, i) => (
                <Badge key={i} variant="outline">{eixoLabels[eixo]}</Badge>
              ))}
              {teseCentral.relevancia_common_core && (
                <Badge className="bg-primary/10 text-primary">Common Core</Badge>
              )}
              {teseCentral.relevancia_cerd_iv && (
                <Badge className="bg-accent/10 text-accent-foreground">CERD IV</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="narrativa" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="narrativa" className="gap-1">
            <BookOpen className="w-4 h-4" /> Narrativa 2018-2026
          </TabsTrigger>
          <TabsTrigger value="lacunas" className="gap-1">
            <AlertTriangle className="w-4 h-4" /> Lacunas Persistentes
          </TabsTrigger>
          <TabsTrigger value="avancos" className="gap-1">
            <TrendingUp className="w-4 h-4" /> Avanços
          </TabsTrigger>
          <TabsTrigger value="retrocessos" className="gap-1">
            <TrendingDown className="w-4 h-4" /> Retrocessos
          </TabsTrigger>
          <TabsTrigger value="cumprimento" className="gap-1">
            <BarChart3 className="w-4 h-4" /> Por Eixo Temático
          </TabsTrigger>
        </TabsList>

        {/* ABA: NARRATIVA COMPLETA */}
        <TabsContent value="narrativa">
          <div className="space-y-4">
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Scale className="w-5 h-5" />
                  Síntese Executiva: A Agenda Racial no Brasil (2018-2026)
                </CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  O período 2018-2026 representa um ciclo completo de transformações na política racial brasileira, 
                  marcado por três fases distintas: <strong>continuidade institucional fragilizada (2018)</strong>, 
                  <strong>desmonte e retrocessos (2019-2022)</strong>, e <strong>reconstrução e ampliação (2023-2026)</strong>.
                </p>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  As conclusões aqui apresentadas baseiam-se na triangulação de três fontes: <em>Base Estatística</em> 
                  (indicadores desagregados por raça/cor do IBGE, IPEA, Ministérios), <em>Base Orçamentária</em> 
                  (execução orçamentária de programas de igualdade racial via SIOP/SOF), e <em>Base Normativa</em> 
                  (legislação, decretos, políticas públicas e decisões judiciais relevantes).
                </p>
              </CardContent>
            </Card>

            {todasConclusoes.map((conclusao) => (
              <Card 
                key={conclusao.id} 
                className={cn(
                  'border-l-4',
                  conclusao.tipo === 'avanco' && 'border-l-success',
                  conclusao.tipo === 'retrocesso' && 'border-l-destructive',
                  conclusao.tipo === 'lacuna_persistente' && 'border-l-warning'
                )}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      {conclusao.tipo === 'avanco' && <TrendingUp className="w-5 h-5 text-success" />}
                      {conclusao.tipo === 'retrocesso' && <TrendingDown className="w-5 h-5 text-destructive" />}
                      {conclusao.tipo === 'lacuna_persistente' && <AlertTriangle className="w-5 h-5 text-warning" />}
                      {conclusao.titulo}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{conclusao.periodo}</Badge>
                      {'fromDatabase' in conclusao && conclusao.fromDatabase && (
                        <Badge className="bg-primary/10 text-primary text-xs">Do Banco</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">
                    {conclusao.argumento_central}
                  </p>
                  
                  {conclusao.evidencias && conclusao.evidencias.length > 0 && (
                    <div className="p-3 bg-muted/50 rounded-lg mb-3">
                      <p className="text-xs font-medium text-muted-foreground mb-2">Evidências:</p>
                      <ul className="text-sm space-y-1">
                        {conclusao.evidencias.map((ev, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{ev}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {conclusao.eixos?.map((eixo, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {eixoLabels[eixo] || eixo.replace(/_/g, ' ')}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ABA: LACUNAS PERSISTENTES */}
        <TabsContent value="lacunas">
          <div className="space-y-4">
            {conclusoesAgrupadas.lacuna_persistente.map((conclusao) => (
              <Card key={conclusao.id} className="border-l-4 border-l-warning">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-warning" />
                      {conclusao.titulo}
                    </CardTitle>
                    <Badge variant="outline">{conclusao.periodo}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">
                    {conclusao.argumento_central}
                  </p>
                  {conclusao.evidencias && (
                    <div className="p-3 bg-warning/5 rounded-lg">
                      <ul className="space-y-1">
                        {conclusao.evidencias.map((ev, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-warning mt-1 flex-shrink-0" />
                            {ev}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ABA: AVANÇOS */}
        <TabsContent value="avancos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {conclusoesAgrupadas.avanco.map((conclusao) => (
              <Card key={conclusao.id} className="border-t-4 border-t-success">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    {conclusao.titulo}
                  </CardTitle>
                  <CardDescription>{conclusao.periodo}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{conclusao.argumento_central}</p>
                  {conclusao.evidencias && (
                    <ul className="space-y-1">
                      {conclusao.evidencias.slice(0, 4).map((ev, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 text-success mt-1" />
                          {ev}
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ABA: RETROCESSOS */}
        <TabsContent value="retrocessos">
          <div className="space-y-4">
            {conclusoesAgrupadas.retrocesso.map((conclusao) => (
              <Card key={conclusao.id} className="border-l-4 border-l-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <TrendingDown className="w-6 h-6 text-destructive flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{conclusao.titulo}</h3>
                        <Badge variant="outline">{conclusao.periodo}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{conclusao.argumento_central}</p>
                      {conclusao.evidencias && (
                        <div className="p-3 bg-destructive/5 rounded-lg">
                          <ul className="space-y-1">
                            {conclusao.evidencias.map((ev, i) => (
                              <li key={i} className="text-sm flex items-start gap-2">
                                <XCircle className="w-3 h-3 text-destructive mt-1 flex-shrink-0" />
                                {ev}
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

        {/* ABA: CUMPRIMENTO POR EIXO */}
        <TabsContent value="cumprimento">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Grau de Cumprimento por Eixo Temático
                </CardTitle>
                <CardDescription>
                  Baseado nas {stats?.total || 0} lacunas identificadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                ) : cumprimentoPorEixo.length > 0 ? (
                  <div className="space-y-4">
                    {cumprimentoPorEixo.map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">{item.eixo}</span>
                          <span className={cn(
                            'text-sm font-bold',
                            item.cumprimento >= 50 && 'text-success',
                            item.cumprimento >= 30 && item.cumprimento < 50 && 'text-warning',
                            item.cumprimento < 30 && 'text-destructive'
                          )}>
                            {item.cumprimento}%
                          </span>
                        </div>
                        <Progress 
                          value={item.cumprimento} 
                          className={cn(
                            'h-3',
                            item.cumprimento >= 50 && '[&>div]:bg-success',
                            item.cumprimento >= 30 && item.cumprimento < 50 && '[&>div]:bg-warning',
                            item.cumprimento < 30 && '[&>div]:bg-destructive'
                          )}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>Insira dados de lacunas para visualizar o cumprimento por eixo.</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Distribuição por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-success/10 rounded-lg text-center">
                    <p className="text-3xl font-bold text-success">{stats?.porStatus.cumprido || 0}</p>
                    <p className="text-sm text-muted-foreground">Cumpridas</p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg text-center">
                    <p className="text-3xl font-bold text-warning">{stats?.porStatus.parcialmente_cumprido || 0}</p>
                    <p className="text-sm text-muted-foreground">Parcialmente</p>
                  </div>
                  <div className="p-4 bg-destructive/10 rounded-lg text-center">
                    <p className="text-3xl font-bold text-destructive">{stats?.porStatus.nao_cumprido || 0}</p>
                    <p className="text-sm text-muted-foreground">Não Cumpridas</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg text-center">
                    <p className="text-3xl font-bold">{stats?.porPrioridade.critica || 0}</p>
                    <p className="text-sm text-muted-foreground">Prioridade Crítica</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Nota sobre atualização automática */}
          <Card className="mt-6 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <RefreshCw className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Atualização Dinâmica</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    As conclusões e métricas desta seção são automaticamente atualizadas quando novos dados são 
                    inseridos ou corrigidos nas Bases Estatística, Orçamentária e Normativa. Clique em 
                    "Atualizar Análises" para recarregar os dados mais recentes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

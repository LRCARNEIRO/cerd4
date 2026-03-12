import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  LineChart, Line, Area, AreaChart
} from 'recharts';
import { AlertTriangle, CheckCircle, Clock, XCircle, TrendingDown, TrendingUp, FileText, Database, ExternalLink, RefreshCw } from 'lucide-react';
import { useLacunasStats, useLacunasIdentificadas, useRespostasLacunasCerdIII } from '@/hooks/useLacunasData';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { AuditFooter } from '@/components/ui/audit-footer';

// FONTE ÚNICA: StatisticsData.ts — elimina duplicidade de séries hardcoded
import {
  indicadoresSocioeconomicos,
  segurancaPublica,
  educacaoSerieHistorica,
} from '@/components/estatisticas/StatisticsData';
import { narrativaSeguranca, narrativaEducacaoSerie, narrativaQuilombolas, fmt } from '@/utils/narrativeHelpers';

const statusColors: Record<string, string> = {
  cumprido: 'hsl(var(--success))',
  parcialmente_cumprido: 'hsl(var(--warning))',
  nao_cumprido: 'hsl(var(--destructive))',
  retrocesso: 'hsl(280, 60%, 50%)',
  em_andamento: 'hsl(var(--chart-1))'
};

const statusLabels: Record<string, string> = {
  cumprido: 'Cumprido',
  parcialmente_cumprido: 'Parcial',
  nao_cumprido: 'Não Cumprido',
  retrocesso: 'Retrocesso',
  em_andamento: 'Em Andamento'
};

const prioridadeLabels: Record<string, string> = {
  critica: 'Crítica',
  alta: 'Alta',
  media: 'Média',
  baixa: 'Baixa'
};

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

// =============================================
// SÉRIES DERIVADAS de StatisticsData.ts (fonte única)
// Eliminam a duplicidade anterior que causava inconsistências
// =============================================

// Educação: ensino superior e analfabetismo por raça (PNAD Contínua / SIDRA 7129 + 7125)
const dadosEducacaoHistorico = educacaoSerieHistorica.map(d => ({
  ano: d.ano,
  superiorNegro: d.superiorNegroPercent,
  superiorBranco: d.superiorBrancoPercent,
  analfabetismoNegro: d.analfabetismoNegro,
  analfabetismoBranco: d.analfabetismoBranco,
  gapSuperior: +(d.superiorBrancoPercent - d.superiorNegroPercent).toFixed(1),
}));

// Desemprego: derivado de indicadoresSocioeconomicos (PNAD Contínua / SIDRA 6381)
const dadosDesempregoHistorico = indicadoresSocioeconomicos.map(d => ({
  ano: d.ano,
  negros: d.desempregoNegro,
  brancos: d.desempregoBranco,
  diferenca: +(d.desempregoNegro - d.desempregoBranco).toFixed(1),
  fonte: d.fonte,
}));

// Homicídio: derivado de segurancaPublica (Atlas da Violência / FBSP)
// NOTA: "brancos" na verdade = "não negros" (metodologia Atlas/IPEA)
const dadosHomicidioHistorico = segurancaPublica.map(d => ({
  ano: d.ano,
  negros: d.homicidioNegro,
  naoNegros: d.homicidioBranco, // campo renomeado para clareza
  razao: d.razaoRisco,
  fonte: d.ano <= 2023 ? 'Atlas da Violência 2025' : '19º Anuário FBSP 2025',
}));

// Letalidade policial: derivado de segurancaPublica (Anuário FBSP)
const dadosLetalidadePolicial = segurancaPublica.map(d => ({
  ano: d.ano,
  percentualNegros: d.letalidadePolicial,
  percentualVitimasNegras: d.percentualVitimasNegras,
  fonte: 'Anuário FBSP',
}));

// Renda: derivado de indicadoresSocioeconomicos (PNAD Contínua / SIDRA 6800)
const dadosRendaHistorico = indicadoresSocioeconomicos.map(d => ({
  ano: d.ano,
  brancos: d.rendaMediaBranca,
  negros: d.rendaMediaNegra,
  razao: +(d.rendaMediaNegra / d.rendaMediaBranca).toFixed(2),
  fonte: d.fonte,
}));

// Quilombolas: sem equivalente em StatisticsData.ts — mantido localmente
// AUDITADO: Certificadas corrigidas conforme FCP (DadosNovosTab ter-2: 2.523 em 2018 → 3.158 em 2025)
// Tituladas: INCRA. Nota: "245 territórios titulados" refere-se a processos concluídos acumulados;
// "384 títulos" inclui múltiplos títulos por território. Usando contagem de territórios.
const dadosTerrasQuilombolasHistorico = [
  { ano: 2018, tituladas: 174, certificadas: 2523, taxa: 6.9, fonte: 'INCRA/FCP' },
  { ano: 2019, tituladas: 176, certificadas: 2745, taxa: 6.4, fonte: 'INCRA/FCP' },
  { ano: 2020, tituladas: 178, certificadas: 2809, taxa: 6.3, fonte: 'INCRA/FCP' },
  { ano: 2021, tituladas: 180, certificadas: 2871, taxa: 6.3, fonte: 'INCRA/FCP' },
  { ano: 2022, tituladas: 182, certificadas: 2948, taxa: 6.2, fonte: 'INCRA/FCP + Censo Quilombola 2022' },
  { ano: 2023, tituladas: 200, certificadas: 3050, taxa: 6.6, fonte: 'INCRA/FCP' },
  { ano: 2024, tituladas: 230, certificadas: 3120, taxa: 7.4, fonte: 'INCRA/FCP' },
  { ano: 2025, tituladas: 245, certificadas: 3158, taxa: 7.8, fonte: 'INCRA/FCP (acumulado)' },
];

export function LacunasCerdTab() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useLacunasStats();
  const { data: lacunas, isLoading: lacunasLoading } = useLacunasIdentificadas();
  const { data: respostas, isLoading: respostasLoading } = useRespostasLacunasCerdIII();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['lacunas-stats'] });
    queryClient.invalidateQueries({ queryKey: ['lacunas-identificadas'] });
    queryClient.invalidateQueries({ queryKey: ['respostas-lacunas-cerd-iii'] });
  };

  if (statsLoading || lacunasLoading || respostasLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const statusData = stats ? [
    { name: 'Cumprido', value: stats.porStatus.cumprido, color: statusColors.cumprido },
    { name: 'Parcial', value: stats.porStatus.parcialmente_cumprido, color: statusColors.parcialmente_cumprido },
    { name: 'Não Cumprido', value: stats.porStatus.nao_cumprido, color: statusColors.nao_cumprido },
    { name: 'Retrocesso', value: stats.porStatus.retrocesso, color: statusColors.retrocesso },
    { name: 'Em Andamento', value: stats.porStatus.em_andamento, color: statusColors.em_andamento }
  ].filter(d => d.value > 0) : [];

  const eixoData = stats ? Object.entries(stats.porEixo).map(([key, value]) => ({
    eixo: eixoLabels[key] || key,
    quantidade: value
  })).sort((a, b) => b.quantidade - a.quantidade) : [];

  const prioridadeData = stats ? [
    { prioridade: 'Crítica', quantidade: stats.porPrioridade.critica },
    { prioridade: 'Alta', quantidade: stats.porPrioridade.alta },
    { prioridade: 'Média', quantidade: stats.porPrioridade.media },
    { prioridade: 'Baixa', quantidade: stats.porPrioridade.baixa }
  ] : [];

  // Calcular lacunas críticas por área temática
  const lacunasCriticas = lacunas?.filter(l => l.prioridade === 'critica' || l.status_cumprimento === 'nao_cumprido' || l.status_cumprimento === 'retrocesso') || [];

  return (
    <div className="space-y-6">
      {/* Header com atualização */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Lacunas CERD - Análise de Cumprimento</h2>
          <p className="text-sm text-muted-foreground">CERD/C/BRA/CO/18-20 (2022) • Período: 2018-2025</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar Dados
        </Button>
      </div>

      {/* Cards resumo */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Total de Lacunas</p>
            <p className="text-2xl font-bold">{stats?.total || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">CERD/C/BRA/CO/18-20</p>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardContent className="pt-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            <div>
              <p className="text-xs text-muted-foreground">Cumpridas</p>
              <p className="text-2xl font-bold text-success">{stats?.porStatus.cumprido || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" />
            <div>
              <p className="text-xs text-muted-foreground">Parcial/Andamento</p>
              <p className="text-2xl font-bold text-warning">
                {(stats?.porStatus.parcialmente_cumprido || 0) + (stats?.porStatus.em_andamento || 0)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4 flex items-center gap-2">
            <XCircle className="w-5 h-5 text-destructive" />
            <div>
              <p className="text-xs text-muted-foreground">Não Cumpridas</p>
              <p className="text-2xl font-bold text-destructive">{stats?.porStatus.nao_cumprido || 0}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4" style={{ borderLeftColor: 'hsl(280, 60%, 50%)' }}>
          <CardContent className="pt-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5" style={{ color: 'hsl(280, 60%, 50%)' }} />
            <div>
              <p className="text-xs text-muted-foreground">Retrocesso</p>
              <p className="text-2xl font-bold" style={{ color: 'hsl(280, 60%, 50%)' }}>
                {stats?.porStatus.retrocesso || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para diferentes visualizações */}
      <Tabs defaultValue="visao-geral" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="series-historicas">Séries Históricas</TabsTrigger>
          <TabsTrigger value="lacunas-criticas">Lacunas Críticas</TabsTrigger>
          <TabsTrigger value="respostas-cerd">Respostas CERD III</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico de status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Status de Cumprimento</CardTitle>
                <CardDescription>Recomendações CERD 2022</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Gráfico por eixo */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Lacunas por Eixo Temático</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={eixoData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" tick={{ fontSize: 12 }} />
                      <YAxis dataKey="eixo" type="category" tick={{ fontSize: 10 }} width={120} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="quantidade" fill="hsl(var(--primary))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Prioridade */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Distribuição por Prioridade
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prioridadeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="prioridade" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="quantidade" fill="hsl(var(--chart-2))">
                      {prioridadeData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={
                            entry.prioridade === 'Crítica' ? 'hsl(var(--destructive))' :
                            entry.prioridade === 'Alta' ? 'hsl(var(--warning))' :
                            entry.prioridade === 'Média' ? 'hsl(var(--chart-1))' :
                            'hsl(var(--muted-foreground))'
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="series-historicas" className="space-y-6">
          {/* Educação — fonte única: StatisticsData.ts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-success" />
                Ensino Superior e Analfabetismo por Raça (2018-2024)
              </CardTitle>
              <CardDescription>Fonte única: PNAD Contínua / SIDRA 7129 + 7125</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosEducacaoHistorico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="superiorBranco" name="Superior — Não Negros" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="superiorNegro" name="Superior — Negros" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="analfabetismoNegro" name="Analfabetismo — Negros" stroke="hsl(var(--destructive))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="analfabetismoBranco" name="Analfabetismo — Não Negros" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-info/5 border border-info/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Análise §19:</strong> Gap no ensino superior: {dadosEducacaoHistorico[0]?.gapSuperior}pp em 2018 → {dadosEducacaoHistorico[dadosEducacaoHistorico.length - 1]?.gapSuperior}pp em {dadosEducacaoHistorico[dadosEducacaoHistorico.length - 1]?.ano}. 
                  Analfabetismo negro recuou de {narrativaEducacaoSerie.analfabetismoNegro2018}% para {narrativaEducacaoSerie.analfabetismoNegroUltimo}%, mas segue {narrativaEducacaoSerie.razaoAnalfabetismo}x maior que o branco.
                </p>
              </div>
              <AuditFooter 
                fontes={[
                  { nome: 'SIDRA 7129 — Ensino superior por cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/7129' },
                  { nome: 'SIDRA 7125 — Analfabetismo por cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/7125' },
                ]}
                documentos={['CERD 2022 §19', 'Common Core']}
                compact
              />
            </CardContent>
          </Card>

          {/* Desemprego — fonte única: StatisticsData.ts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Taxa de Desocupação por Raça/Cor (2018-2024)
              </CardTitle>
              <CardDescription>Fonte única: PNAD Contínua / SIDRA 6381 + DIEESE 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosDesempregoHistorico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="negros" name="Negros" fill="hsl(var(--destructive) / 0.3)" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    <Area type="monotone" dataKey="brancos" name="Não Negros" fill="hsl(var(--chart-1) / 0.3)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                   <strong>Análise §23:</strong> Diferença desemprego negros vs não negros: {dadosDesempregoHistorico[0]?.diferenca}pp (2018) → {dadosDesempregoHistorico[dadosDesempregoHistorico.length - 1]?.diferenca}pp ({dadosDesempregoHistorico[dadosDesempregoHistorico.length - 1]?.ano}).
                   Pandemia agravou disparidades. Razão de renda negra/não negra ≈ 59%.
                </p>
              </div>
              <AuditFooter 
                fontes={[
                  { nome: 'SIDRA 6381 — Desocupação por cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/6381' },
                  { nome: 'DIEESE — Boletim Consciência Negra Nov/2024', url: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf' },
                ]}
                documentos={['CERD 2022 §23']}
                compact
              />
            </CardContent>
          </Card>

          {/* Homicídio — fonte única: StatisticsData.ts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <XCircle className="w-5 h-5 text-destructive" />
                Taxa de Homicídio por 100 mil — Negros vs Não Negros (2018-2024)
              </CardTitle>
              <CardDescription>Fonte única: Atlas da Violência 2025 (IPEA) + 19º Anuário FBSP 2025</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosHomicidioHistorico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="negros" name="Negros (por 100 mil)" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="naoNegros" name="Não Negros (por 100 mil)" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="razao" name="Risco Relativo (×)" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Análise §36:</strong> Risco relativo estável em 2,7× (2018→2023). Taxa negros caiu de 37,6 para 28,9, 
                  mas disparidade racial não reduziu. NOTA: comparação é Negros vs Não Negros (metodologia Atlas/IPEA).
                </p>
              </div>
              <AuditFooter 
                fontes={[
                  { nome: 'Atlas da Violência 2025 (IPEA) — p. 79', url: 'https://www.ipea.gov.br/atlasviolencia/arquivos/artigos/5999-atlasdaviolencia2025.pdf' },
                  { nome: '19º Anuário FBSP 2025', url: 'https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf' },
                ]}
                documentos={['CERD 2022 §36', 'Durban §32-36']}
                compact
              />
            </CardContent>
          </Card>

          {/* Letalidade Policial — fonte única: StatisticsData.ts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Letalidade Policial — % Vítimas Negras (2018-2024)
              </CardTitle>
              <CardDescription>Fonte única: Anuário Brasileiro de Segurança Pública (13ª a 19ª edição)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosLetalidadePolicial}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="%" domain={[70, 90]} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => [`${value}%`, '']}
                    />
                    <Legend />
                    <Bar dataKey="percentualNegros" name="% Vítimas Negras — Letalidade Policial" fill="hsl(var(--destructive))" />
                    <Bar dataKey="percentualVitimasNegras" name="% Vítimas Negras — Homicídio Total" fill="hsl(var(--muted-foreground))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Análise §36:</strong> Letalidade policial contra negros subiu de {narrativaSeguranca.letalidadePolicial2018}% (2018) para {narrativaSeguranca.letalidadePolicial2024}% (2024).
                  ADPF 635 (STF) busca restringir operações em favelas. Brasil lidera ranking mundial.
                </p>
              </div>
              <AuditFooter 
                fontes={[{ nome: '19º Anuário FBSP 2025', url: 'https://publicacoes.forumseguranca.org.br/items/c3605778-37b3-4ad6-8239-94e4cb236444' }]}
                documentos={['CERD 2022 §36', 'ADPF 635']}
                compact
              />
            </CardContent>
          </Card>

          {/* Territórios Quilombolas — dados locais (sem equivalente em StatisticsData.ts) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingDown className="w-5 h-5" style={{ color: 'hsl(280, 60%, 50%)' }} />
                Titulação de Territórios Quilombolas (2018-2023)
              </CardTitle>
              <CardDescription>Fonte: INCRA + Fundação Cultural Palmares (2018-2025)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dadosTerrasQuilombolasHistorico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="certificadas" name="Comunidades Certificadas" fill="hsl(var(--chart-1) / 0.3)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    <Area yAxisId="left" type="monotone" dataKey="tituladas" name="Territórios Titulados" fill="hsl(var(--success) / 0.3)" stroke="hsl(var(--success))" strokeWidth={2} />
                    <Line yAxisId="right" type="monotone" dataKey="taxa" name="Taxa de Titulação (%)" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Análise §25:</strong> Apenas {narrativaQuilombolas.taxaTitulacao}% dos territórios quilombolas estão titulados ({narrativaQuilombolas.territoriosTitulados} de ~{narrativaQuilombolas.comunidadesCertificadas.toLocaleString('pt-BR')} comunidades certificadas).
                  Período 2019-2022 marcado por paralisia quase total. Retomada a partir de 2023 com PNGTAQ (Dec. 11.786/2023).
                </p>
              </div>
              <AuditFooter 
                fontes={[
                  { nome: 'INCRA — Quilombolas', url: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas' },
                  { nome: 'Fundação Cultural Palmares', url: 'https://www.palmares.gov.br/' },
                ]}
                documentos={['CERD 2022 §25', 'Durban']}
                compact
              />
            </CardContent>
          </Card>

          {/* Renda — fonte única: StatisticsData.ts */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                Rendimento Médio Mensal por Raça/Cor (2018-2024)
              </CardTitle>
              <CardDescription>Fonte única: PNAD Contínua / SIDRA 6800 + DIEESE 2024</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosRendaHistorico}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} domain={[0.4, 0.7]} />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number, name: string) => {
                        if (name.includes('Razão')) return [value.toFixed(2), name];
                        return [`R$ ${value.toLocaleString('pt-BR')}`, name];
                      }}
                    />
                    <Legend />
                     <Line yAxisId="left" type="monotone" dataKey="brancos" name="Não Negros (R$)" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={{ r: 3 }} />
                     <Line yAxisId="left" type="monotone" dataKey="negros" name="Negros (R$)" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={{ r: 3 }} />
                     <Line yAxisId="right" type="monotone" dataKey="razao" name="Razão (Negros/Não Negros)" stroke="hsl(var(--warning))" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 p-3 bg-info/5 border border-info/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  <strong>Análise §23:</strong> Razão renda negra/branca: {dadosRendaHistorico[0]?.razao} (2018) → {dadosRendaHistorico[dadosRendaHistorico.length - 1]?.razao} ({dadosRendaHistorico[dadosRendaHistorico.length - 1]?.ano}).
                  Renda negra cresceu de R${dadosRendaHistorico[0]?.negros} para R${dadosRendaHistorico[dadosRendaHistorico.length - 1]?.negros}, mas gap proporcional não se reduz.
                </p>
              </div>
              <AuditFooter 
                fontes={[
                  { nome: 'SIDRA 6405 — Rendimento por cor/raça', url: 'https://sidra.ibge.gov.br/tabela/6405' },
                  { nome: 'DIEESE — Boletim Consciência Negra Nov/2024', url: 'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf' },
                ]}
                documentos={['CERD 2022 §23']}
                compact
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lacunas-criticas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Lacunas Críticas e Não Cumpridas
              </CardTitle>
              <CardDescription>
                Áreas que exigem ação imediata para o IV Relatório CERD
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>§</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead>Eixo</TableHead>
                    <TableHead>Grupo Focal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lacunasCriticas.map(lacuna => (
                    <TableRow key={lacuna.id}>
                      <TableCell className="font-mono text-xs">{lacuna.paragrafo}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{lacuna.tema}</TableCell>
                      <TableCell className="text-xs">{eixoLabels[lacuna.eixo_tematico] || lacuna.eixo_tematico}</TableCell>
                      <TableCell className="text-xs capitalize">{lacuna.grupo_focal.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            lacuna.status_cumprimento === 'cumprido' && "border-success text-success",
                            lacuna.status_cumprimento === 'parcialmente_cumprido' && "border-warning text-warning",
                            lacuna.status_cumprimento === 'nao_cumprido' && "border-destructive text-destructive",
                            lacuna.status_cumprimento === 'retrocesso' && "border-purple-500 text-purple-500"
                          )}
                        >
                          {statusLabels[lacuna.status_cumprimento]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs",
                            lacuna.prioridade === 'critica' && "border-destructive text-destructive",
                            lacuna.prioridade === 'alta' && "border-warning text-warning"
                          )}
                        >
                          {prioridadeLabels[lacuna.prioridade]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {lacunasCriticas.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">Nenhuma lacuna crítica identificada.</p>
              )}
            </CardContent>
          </Card>

          {/* Todas as lacunas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Todas as Lacunas Identificadas
              </CardTitle>
              <CardDescription>
                Fonte: CERD/C/BRA/CO/18-20 (Observações Finais - Agosto 2022)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>§</TableHead>
                    <TableHead>Tema</TableHead>
                    <TableHead>Eixo</TableHead>
                    <TableHead>Grupo Focal</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prioridade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lacunas?.map(lacuna => (
                    <TableRow key={lacuna.id}>
                      <TableCell className="font-mono text-xs">{lacuna.paragrafo}</TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{lacuna.tema}</TableCell>
                      <TableCell className="text-xs">{eixoLabels[lacuna.eixo_tematico] || lacuna.eixo_tematico}</TableCell>
                      <TableCell className="text-xs capitalize">{lacuna.grupo_focal.replace(/_/g, ' ')}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "text-xs",
                            lacuna.status_cumprimento === 'cumprido' && "border-success text-success",
                            lacuna.status_cumprimento === 'parcialmente_cumprido' && "border-warning text-warning",
                            lacuna.status_cumprimento === 'nao_cumprido' && "border-destructive text-destructive",
                            lacuna.status_cumprimento === 'retrocesso' && "border-purple-500 text-purple-500"
                          )}
                        >
                          {statusLabels[lacuna.status_cumprimento]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline"
                          className={cn(
                            "text-xs",
                            lacuna.prioridade === 'critica' && "border-destructive text-destructive",
                            lacuna.prioridade === 'alta' && "border-warning text-warning"
                          )}
                        >
                          {prioridadeLabels[lacuna.prioridade]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="respostas-cerd" className="space-y-6">
          {/* Respostas CERD III */}
          {respostas && respostas.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Respostas às Críticas do CERD III (2018)</CardTitle>
                <CardDescription>Avaliação do cumprimento das recomendações anteriores</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>§ CERD III</TableHead>
                      <TableHead>Crítica Original</TableHead>
                      <TableHead>Grau de Atendimento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {respostas.map(resp => (
                      <TableRow key={resp.id}>
                        <TableCell className="font-mono text-xs">{resp.paragrafo_cerd_iii}</TableCell>
                        <TableCell className="text-sm max-w-[400px] truncate">{resp.critica_original}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline"
                            className={cn(
                              "text-xs",
                              resp.grau_atendimento === 'cumprido' && "border-success text-success",
                              resp.grau_atendimento === 'parcialmente_cumprido' && "border-warning text-warning",
                              resp.grau_atendimento === 'nao_cumprido' && "border-destructive text-destructive"
                            )}
                          >
                            {statusLabels[resp.grau_atendimento]}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Nenhuma resposta CERD III registrada.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

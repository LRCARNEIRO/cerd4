import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar 
} from 'recharts';
import { Shield, Heart, GraduationCap, AlertTriangle, FileText, ExternalLink, Database, HardDrive } from 'lucide-react';
import { fonteDados, mortalidadeInfantilMetodologia, mortalidadeMaternaMetodologia, evasaoEscolarFonte } from './StatisticsData';
import { fmt } from '@/utils/narrativeHelpers';
import { useNarrativeData } from '@/hooks/useNarrativeData';
import { EstimativaBadge } from '@/components/ui/estimativa-badge';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Info, Minus } from 'lucide-react';
import { useMirrorData } from '@/hooks/useMirrorData';

export function SegurancaSaudeEducacaoTab() {
  const {
    segurancaPublica, fonteSeguranca, paragrafosSeguranca,
    educacaoSerieHistorica, fonteEducacao, paragrafosEducacao,
    saudeSerieHistorica, fonteSaude, paragrafosSaude,
    atlasViolencia2025, fonteAtlas,
    evasaoEscolarSerie, fonteEvasao,
    usandoBD,
  } = useMirrorData();
  const { narrativaSeguranca } = useNarrativeData();
  return (
    <div className="space-y-6">
      {/* Segurança Pública */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            Segurança Pública - Violência Letal por Raça (2018-2024)
          </CardTitle>
          <CardDescription>Taxa de homicídio por 100 mil habitantes e letalidade policial</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Taxa de Homicídio (por 100 mil)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={segurancaPublica}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(1), '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="homicidioNegro" name="Negros" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    <Line type="monotone" dataKey="homicidioBranco" name="Não Negros" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Fonte: <a href="https://www.ipea.gov.br/atlasviolencia" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">Atlas da Violência 2025 (IPEA/FBSP) <ExternalLink className="w-2.5 h-2.5" /></a>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Letalidade Policial - % de Negros entre Vítimas</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={segurancaPublica}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                    <YAxis domain={[70, 90]} tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="letalidadePolicial" name="% Negros" fill="hsl(var(--destructive))" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Fonte: <a href="https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">19º Anuário FBSP 2025 <ExternalLink className="w-2.5 h-2.5" /></a>
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">19º Anuário FBSP 2025 (dados 2024) + Atlas da Violência 2025</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pessoa negra tem <strong>risco {fmt(narrativaSeguranca.riscoRelativo)}x maior</strong> de ser vítima de homicídio (Atlas da Violência 2025/IPEA). 
                  <strong>{narrativaSeguranca.vitimasNegras2024}% das vítimas</strong> de homicídio em 2024 são negras (FBSP 2025). Em 2018, eram {narrativaSeguranca.vitimasNegras2018}%.
                  Letalidade policial: <strong>{narrativaSeguranca.letalidadePolicial2024}% das vítimas são negras</strong> (FBSP 2025). Em 2018: {narrativaSeguranca.letalidadePolicial2018}%.
                  Jovens negros: <strong>{narrativaSeguranca.jovensObitosExternos}% dos óbitos por causas externas</strong> (Fiocruz 2025).
                </p>
              </div>
            </div>
          </div>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Ano</TableHead>
                <TableHead className="text-right">Homic. Negros</TableHead>
                <TableHead className="text-right">Homic. Não Negros</TableHead>
                <TableHead className="text-right">Razão</TableHead>
                <TableHead className="text-right">Letalidade Policial (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {segurancaPublica.map(item => (
                <TableRow key={item.ano}>
                  <TableCell className="font-medium">{item.ano}</TableCell>
                  <TableCell className="text-right text-destructive">{item.homicidioNegro}</TableCell>
                  <TableCell className="text-right">{item.homicidioBranco}</TableCell>
                  <TableCell className="text-right font-medium text-destructive">
                    {(item.homicidioNegro / item.homicidioBranco).toFixed(2)}x
                  </TableCell>
                  <TableCell className="text-right">{item.letalidadePolicial}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
            <FileText className="w-3 h-3" /> Fontes da tabela: Atlas da Violência 2025 (IPEA) — homicídios | 19º Anuário FBSP 2025 — letalidade policial
          </p>

          {/* Atlas da Violência 2025 — 4 Indicadores Complementares */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-destructive" />
              <h4 className="text-sm font-semibold">Atlas da Violência 2025 (IPEA/FBSP) — Indicadores de Desigualdade Racial</h4>
              <Badge variant="outline" className="text-xs">§23 §32-36</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 1. Evolução do Risco Relativo */}
              <Card className="border-l-4 border-l-destructive">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Vulnerabilidade Letal (Risco Relativo)</p>
                  <p className="text-3xl font-bold text-destructive">{atlasViolencia2025.riscoRelativo}x</p>
                  <p className="text-xs text-muted-foreground mb-3">chance de assassinato para negros vs não negros</p>
                  <div className="flex items-center gap-1 text-xs text-warning">
                    <Minus className="w-3 h-3" />
                    <span>{atlasViolencia2025.riscoRelativo2018}x (2018) → {atlasViolencia2025.riscoRelativo}x (2023)</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Risco relativo <strong>estável</strong> no período 2018→2023</p>
                </CardContent>
              </Card>

              {/* 2. Queda Diferencial */}
              <Card className="border-l-4 border-l-warning">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Queda de Homicídios (2018→2023)</p>
                  <div className="flex gap-3 items-end mb-3">
                    <div>
                      <p className="text-2xl font-bold text-warning">-{atlasViolencia2025.quedaNegros2018_2023}%</p>
                      <p className="text-xs text-muted-foreground">Negros</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-success">-{atlasViolencia2025.quedaNaoNegros2018_2023}%</p>
                      <p className="text-xs text-muted-foreground">Não negros</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Info className="w-3 h-3" />
                    Quedas proporcionais similares no período (-1,2 p.p.)
                  </p>
                </CardContent>
              </Card>
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <a href={atlasViolencia2025.link} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
                Atlas da Violência 2025 (IPEA/FBSP) <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Educação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Educação - Indicadores por Raça (2018-2024)
          </CardTitle>
          <CardDescription>Ensino superior completo e analfabetismo por raça</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Ensino Superior Completo (%)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={educacaoSerieHistorica}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="superiorNegroPercent" name="Negros" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="superiorBrancoPercent" name="Brancos" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Fonte: <a href="https://sidra.ibge.gov.br/Tabela/7129" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">SIDRA 7129 / PNAD Contínua Educação (IBGE) <ExternalLink className="w-2.5 h-2.5" /></a>
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Taxa de Analfabetismo (%)</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={educacaoSerieHistorica}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [`${value}%`, '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="analfabetismoNegro" name="Negros" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="analfabetismoBranco" name="Brancos" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
              <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> Fonte: <a href="https://www.ibge.gov.br/estatisticas/sociais/educacao.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-0.5">PNAD Contínua Educação 2024 (IBGE) <ExternalLink className="w-2.5 h-2.5" /></a>
              </p>
            </div>

          <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg">
            <p className="text-xs">
              <strong>PNAD Contínua Educação 2024:</strong> Analfabetismo entre negros caiu de 9,1% (2018) para 6,9% (2024), mas segue mais que o dobro de brancos (3,1%). 
              Entre idosos negros de 60+ anos, a taxa chega a 21,8%, contra 8,1% entre brancos.
              Ensino superior entre negros: de 9,3% (2018) para 16,2% (2024) — avanço de 74%.
            </p>
          </div>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Ano</TableHead>
                <TableHead className="text-right">Superior Negro</TableHead>
                <TableHead className="text-right">Superior Branco</TableHead>
                <TableHead className="text-right">Gap</TableHead>
                <TableHead className="text-right">Analf. Negro</TableHead>
                <TableHead className="text-right">Analf. Branco</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {educacaoSerieHistorica.map(item => (
                <TableRow key={item.ano}>
                  <TableCell className="font-medium">{item.ano}</TableCell>
                  <TableCell className="text-right">{item.superiorNegroPercent}%</TableCell>
                  <TableCell className="text-right">{item.superiorBrancoPercent}%</TableCell>
                  <TableCell className="text-right text-warning">
                    {(item.superiorBrancoPercent - item.superiorNegroPercent).toFixed(1)} p.p.
                  </TableCell>
                  <TableCell className="text-right">{item.analfabetismoNegro}%</TableCell>
                  <TableCell className="text-right">{item.analfabetismoBranco}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" /> <strong>Fontes oficiais:</strong>
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <a href="https://sidra.ibge.gov.br/Tabela/7129" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> SIDRA 7129 — Ensino superior por cor/raça
              </a>
              <a href="https://www.ibge.gov.br/estatisticas/sociais/educacao.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> PNAD Contínua Educação 2024
              </a>
              <a href="https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-da-educacao-superior" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> INEP — Censo Educação Superior
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Evasão Escolar */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-600" />
            Evasão Escolar — Jovens 15-29 anos sem Ensino Médio (2018-2024)
          </CardTitle>
          <CardDescription>
            Jovens de 15 a 29 anos que não estudam e não concluíram o ensino médio (%), por raça/cor.
            Valores de 2020 e 2021 indisponíveis (PNAD suspensa na pandemia).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Série Temporal — Evasão por Raça</h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evasaoEscolarSerie}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} domain={[20, 80]} unit="%" />
                    <Tooltip
                      formatter={(value: number) => [`${value.toFixed(1)}%`, '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="percentualNegro" name="Negros" stroke="hsl(var(--destructive))" strokeWidth={2} connectNulls />
                    <Line type="monotone" dataKey="percentualBranco" name="Brancos" stroke="hsl(var(--chart-1))" strokeWidth={2} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Tabela de Dados</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ano</TableHead>
                    <TableHead>Negros (%)</TableHead>
                    <TableHead>Brancos (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {evasaoEscolarSerie.map(item => (
                    <TableRow key={item.ano}>
                      <TableCell className="font-medium">{item.ano}</TableCell>
                      <TableCell>{item.percentualNegro?.toFixed(1) ?? 'N/D'}</TableCell>
                      <TableCell>{item.percentualBranco?.toFixed(1) ?? 'N/D'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
          <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" /> <strong>Fonte:</strong>
            </p>
            <a href={evasaoEscolarFonte.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
              <ExternalLink className="w-3 h-3" /> {evasaoEscolarFonte.nome}
            </a>
            <p className="text-[10px] text-muted-foreground mt-1">
              <Badge variant="outline" className="text-[10px] mr-1">✅ Auditado</Badge>
              Indicador: "Jovens de 15 a 29 anos que não estudam e não concluíram ensino médio". A desagregação identifica a proporção de negros e brancos nesse universo.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Saúde */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive" />
            Saúde - Indicadores por Raça (2018-2023)
          </CardTitle>
          <CardDescription>Mortalidade materna e infantil por raça</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                Mortalidade Materna (por 100 mil NV)
                <EstimativaBadge 
                  tipo="cruzamento" 
                  metodologia={`${mortalidadeMaternaMetodologia.formula}. ${mortalidadeMaternaMetodologia.nota}`}
                />
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={saudeSerieHistorica}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(1), '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="mortalidadeMaternaNegra" name="Negras (agregado)" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    <Line type="monotone" dataKey="mortalidadeMaternaBranca" name="Brancas" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    <Line type="monotone" dataKey="mortalidadeMaternaPretas" name="Pretas" stroke="hsl(var(--chart-5, 0 0% 20%))" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="mortalidadeMaternaPardas" name="Pardas" stroke="hsl(var(--chart-4, 30 80% 55%))" strokeWidth={2} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 p-2 bg-muted/60 rounded text-xs text-muted-foreground">
                <strong>Cruzamento:</strong> {mortalidadeMaternaMetodologia.formula}
                <div className="mt-1 flex flex-wrap gap-2">
                  {mortalidadeMaternaMetodologia.componentes.map((c, i) => (
                    <a key={i} href={c.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-0.5">
                      <ExternalLink className="w-2.5 h-2.5" /> {c.nome}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                Mortalidade Infantil (por mil nascidos vivos)
                <EstimativaBadge 
                  tipo="cruzamento" 
                  metodologia={`${mortalidadeInfantilMetodologia.formula}. ${mortalidadeInfantilMetodologia.viesConhecido}`}
                />
              </h4>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={saudeSerieHistorica}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip 
                      formatter={(value: number) => [value.toFixed(1), '']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="mortalidadeInfantilNegra" name="Negras" stroke="hsl(var(--chart-2))" strokeWidth={2} />
                    <Line type="monotone" dataKey="mortalidadeInfantilBranca" name="Brancas" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              {/* Caixa metodológica — cruzamento SIM × SINASC */}
              <div className="mt-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg space-y-2">
                <p className="text-xs font-semibold flex items-center gap-1 text-destructive">
                  <AlertTriangle className="w-3 h-3" /> Metodologia: Cruzamento indireto SIM × SINASC
                </p>
                <p className="text-xs text-muted-foreground">
                  <strong>Fórmula:</strong> {mortalidadeInfantilMetodologia.formula}
                </p>
                <div className="text-xs text-muted-foreground">
                  <strong>Fontes componentes:</strong>
                  <ul className="list-disc list-inside ml-2 mt-1 space-y-0.5">
                    {mortalidadeInfantilMetodologia.componentes.map((c, i) => (
                      <li key={i}>
                        <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {c.nome} <ExternalLink className="w-2.5 h-2.5 inline" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <details className="mt-2">
                  <summary className="text-xs text-destructive/80 italic cursor-pointer hover:text-destructive">
                    ⚠ Viés de classificação racial — clique para ver nota completa
                  </summary>
                  <div className="mt-2 p-3 bg-destructive/5 border border-destructive/20 rounded-lg text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                    {mortalidadeInfantilMetodologia.notaMetodologicaCompleta}
                  </div>
                </details>
                <div className="flex flex-wrap gap-3 mt-1">
                  {mortalidadeInfantilMetodologia.referencias.map((ref, i) => (
                    <a key={i} href={ref.url} target="_blank" rel="noopener noreferrer" className="text-[10px] text-primary hover:underline flex items-center gap-1">
                      <ExternalLink className="w-2.5 h-2.5" /> {ref.titulo}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-xs">
              <strong>Atenção:</strong> A pandemia COVID-19 (2020-2021) causou pico de mortalidade materna, 
              afetando ambos os grupos. Razão negra/branca varia de 1,2x (2018) a ~1,0x (2024) na série DataSUS/SIM. Pesquisa Nascer no Brasil II (2023) reporta ~2x com metodologia própria.
            </p>
            <p className="text-xs mt-2">
              <strong>⚠ Nota sobre 2021:</strong> Em 2021, a mortalidade materna de mulheres brancas ultrapassou a média geral de mulheres negras (agregado pretas+pardas).
              Isso ocorre porque a categoria "negras" junta pretas e pardas. Como o número de nascimentos de pardas é muito maior e sua taxa de mortalidade foi a menor naquele ano,
              esse volume acabou "puxando" a média do grupo inteiro para baixo. Separando os dados, mulheres <strong>pretas</strong> isoladamente enfrentaram taxa de <strong>194,8/100 mil NV</strong> — muito superior a todas as demais categorias.
            </p>
          </div>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Ano</TableHead>
                <TableHead className="text-right">MM Negra</TableHead>
                <TableHead className="text-right">MM Pretas</TableHead>
                <TableHead className="text-right">MM Pardas</TableHead>
                <TableHead className="text-right">MM Branca</TableHead>
                <TableHead className="text-right">Razão N/B</TableHead>
                <TableHead className="text-right">MI Negra</TableHead>
                <TableHead className="text-right">MI Branca</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saudeSerieHistorica.map(item => (
                <TableRow key={item.ano}>
                  <TableCell className="font-medium">{item.ano}</TableCell>
                  <TableCell className="text-right text-destructive">{item.mortalidadeMaternaNegra}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">{(item as any).mortalidadeMaternaPretas ?? '—'}</TableCell>
                  <TableCell className="text-right">{(item as any).mortalidadeMaternaPardas ?? '—'}</TableCell>
                  <TableCell className="text-right">{item.mortalidadeMaternaBranca}</TableCell>
                  <TableCell className="text-right font-medium">
                    {(item.mortalidadeMaternaNegra / item.mortalidadeMaternaBranca).toFixed(2)}x
                  </TableCell>
                  <TableCell className="text-right">{item.mortalidadeInfantilNegra}</TableCell>
                  <TableCell className="text-right">{item.mortalidadeInfantilBranca}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" /> <strong>Fontes oficiais:</strong>
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <a href="https://datasus.saude.gov.br/informacoes-de-saude-tabnet/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> TabNet/DataSUS — Portal
              </a>
              <a href="http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> SIM — Mortalidade materna por raça/cor
              </a>
              <a href="http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/inf10uf.def" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> SIM — Mortalidade infantil por raça/cor
              </a>
              <a href="http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> SINASC — Nascidos vivos
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

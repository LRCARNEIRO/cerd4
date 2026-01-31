import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar 
} from 'recharts';
import { Shield, Heart, GraduationCap, AlertTriangle, FileText, ExternalLink } from 'lucide-react';
import { segurancaPublica, educacaoSerieHistorica, saudeSerieHistorica, fonteDados } from './StatisticsData';

export function SegurancaSaudeEducacaoTab() {
  return (
    <div className="space-y-6">
      {/* Segurança Pública */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            Segurança Pública - Violência Letal por Raça (2018-2026)
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
                    <Line type="monotone" dataKey="homicidioBranco" name="Brancos" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
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
            </div>
          </div>

          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Dados Atualizados - Atlas da Violência 2025</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Pessoa negra tem <strong>risco 2,7x maior</strong> de ser vítima de homicídio (IPEA/FBSP 2025). 
                  Jovens negros representam <strong>73% dos óbitos por causas externas</strong> (Fiocruz 2025).
                  Letalidade policial: mais de 83% das vítimas são negras.
                </p>
              </div>
            </div>
          </div>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Ano</TableHead>
                <TableHead className="text-right">Homic. Negros</TableHead>
                <TableHead className="text-right">Homic. Brancos</TableHead>
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
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <a href={fonteDados.fbsp.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              {fonteDados.fbsp.nome} / Atlas da Violência <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Educação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-primary" />
            Educação - Indicadores por Raça (2018-2026)
          </CardTitle>
          <CardDescription>Ensino superior completo e analfabetismo</CardDescription>
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
          </div>

          <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg">
            <p className="text-xs">
              <strong>Dados PNAD Contínua 2024:</strong> Analfabetismo entre negros (6,9%) é mais que o dobro de brancos (3,1%). 
              Entre idosos negros de 60+ anos, a taxa chega a 21,8%, contra 8,1% entre brancos da mesma faixa.
              A proporção de negros com ensino superior dobrou de 9,3% (2018) para 18,5% (2026).
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
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <a href={fonteDados.inep.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              {fonteDados.inep.nome} e PNAD Contínua <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </CardContent>
      </Card>

      {/* Saúde */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="w-5 h-5 text-destructive" />
            Saúde - Indicadores por Raça (2018-2026)
          </CardTitle>
          <CardDescription>Mortalidade materna e infantil por 100 mil nascidos vivos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium mb-3">Mortalidade Materna (por 100 mil)</h4>
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
                    <Line type="monotone" dataKey="mortalidadeMaternaNegra" name="Negras" stroke="hsl(var(--destructive))" strokeWidth={2} />
                    <Line type="monotone" dataKey="mortalidadeMaternaBranca" name="Brancas" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-3">Mortalidade Infantil (por mil nascidos vivos)</h4>
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
            </div>
          </div>

          <div className="mt-4 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-xs">
              <strong>Atenção:</strong> A pandemia COVID-19 (2020-2021) causou pico de mortalidade materna, 
              afetando desproporcionalmente mulheres negras. Razão de mortalidade materna negra/branca: 1,9x (persistente).
            </p>
          </div>

          <Table className="mt-4">
            <TableHeader>
              <TableRow>
                <TableHead>Ano</TableHead>
                <TableHead className="text-right">Mort. Materna Negra</TableHead>
                <TableHead className="text-right">Mort. Materna Branca</TableHead>
                <TableHead className="text-right">Razão</TableHead>
                <TableHead className="text-right">Mort. Infantil Negra</TableHead>
                <TableHead className="text-right">Mort. Infantil Branca</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {saudeSerieHistorica.map(item => (
                <TableRow key={item.ano}>
                  <TableCell className="font-medium">{item.ano}</TableCell>
                  <TableCell className="text-right text-destructive">{item.mortalidadeMaternaNegra}</TableCell>
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
          <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <a href={fonteDados.datasus.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-1">
              {fonteDados.datasus.nome} / SIM / SINASC <ExternalLink className="w-3 h-3" />
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

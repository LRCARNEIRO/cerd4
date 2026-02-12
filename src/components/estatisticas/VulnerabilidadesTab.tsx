import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { Layers, Filter, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  radarVulnerabilidades, 
  evolucaoDesigualdade, 
  interseccionalidadeTrabalho 
} from './StatisticsData';

export function VulnerabilidadesTab() {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-primary" />
              Índice de Vulnerabilidade por Grupo (0-100)
            </CardTitle>
            <CardDescription>
              Quanto maior o valor, maior a vulnerabilidade em cada eixo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarVulnerabilidades}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="eixo" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Radar name="Mulher Negra" dataKey="mulherNegra" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.3} />
                  <Radar name="Homem Negro" dataKey="homemNegro" stroke="hsl(var(--warning))" fill="hsl(var(--warning))" fillOpacity={0.3} />
                  <Radar name="Mulher Branca" dataKey="mulherBranca" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.3} />
                  <Radar name="Homem Branco" dataKey="homemBranco" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.3} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <strong>Fontes:</strong> Síntese de indicadores IBGE/IPEA/DataSUS 2024 | Elaboração própria
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                <a href="https://www.ibge.gov.br/estatisticas/sociais/populacao/25844-desigualdades-sociais-por-cor-ou-raca.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Desigualdades por Cor/Raça (IBGE)
                </a>
                <a href="https://www.ipea.gov.br/retrato/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Retrato das Desigualdades (IPEA)
                </a>
                <a href="https://datasus.saude.gov.br/informacoes-de-saude-tabnet/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> TabNet/DataSUS
                </a>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Evolução das Razões de Desigualdade Racial (2018-2026)</CardTitle>
            <CardDescription>
              Razão entre indicadores de negros e brancos (1.0 = igualdade)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={evolucaoDesigualdade}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                  <YAxis domain={[1, 3]} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    formatter={(value: number) => [value.toFixed(2), '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="razaoRenda" name="Renda (brancos/negros)" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                  <Line type="monotone" dataKey="razaoDesemprego" name="Desemprego (negros/brancos)" stroke="hsl(var(--warning))" strokeWidth={2} />
                  <Line type="monotone" dataKey="razaoHomicidio" name="Homicídio (negros/brancos)" stroke="hsl(var(--destructive))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <p className="text-xs font-medium">Interpretação (19º Anuário FBSP 2025, Atlas da Violência 2025, PNAD 2024):</p>
              <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                <li>• <strong>Renda:</strong> Pessoas negras ganham 58,9% do que ganham pessoas brancas (PNAD Contínua 2024)</li>
                <li>• <strong>Desemprego:</strong> Negros têm 1,5x mais desemprego que brancos (PNAD 2024)</li>
                <li>• <strong>Homicídio:</strong> 77% das vítimas são negras; risco 2,7x maior (19º Anuário FBSP 2025 / Atlas 2025)</li>
              </ul>
            </div>
            <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <strong>Fontes oficiais:</strong>
              </p>
              <div className="flex flex-wrap gap-3 text-xs">
                <a href="https://sidra.ibge.gov.br/Tabela/6800" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> SIDRA 6800 — Renda por cor/raça
                </a>
                <a href="https://sidra.ibge.gov.br/Tabela/6381" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> SIDRA 6381 — Desocupação
                </a>
                <a href="https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> 19º Anuário FBSP 2025
                </a>
                <a href="https://www.ipea.gov.br/atlasviolencia" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" /> Atlas da Violência 2025
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            Cruzamento Completo: Raça × Gênero × Faixa Etária (Trabalho)
          </CardTitle>
          <CardDescription>
            Dados de 2024 - PNAD Contínua/IBGE
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grupo</TableHead>
                <TableHead className="text-right">Renda Média</TableHead>
                <TableHead className="text-right">Desemprego (%)</TableHead>
                <TableHead className="text-right">Informalidade (%)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interseccionalidadeTrabalho.map(item => (
                <TableRow key={item.grupo}>
                  <TableCell className="font-medium text-sm">{item.grupo}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.renda)}</TableCell>
                  <TableCell className={cn("text-right", item.desemprego > 15 && "text-destructive font-semibold")}>
                    {item.desemprego}%
                  </TableCell>
                  <TableCell className={cn("text-right", item.informalidade > 50 && "text-warning font-semibold")}>
                    {item.informalidade}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" />
              <strong>Fonte:</strong> PNAD Contínua/IBGE 2024 — Microanálise por raça/cor × sexo × faixa etária
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <a href="https://sidra.ibge.gov.br/Tabela/6800" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> SIDRA 6800 — Rendimento
              </a>
              <a href="https://sidra.ibge.gov.br/Tabela/6381" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> SIDRA 6381 — Desocupação
              </a>
              <a href="https://sidra.ibge.gov.br/Tabela/6403" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> SIDRA 6403 — Características gerais
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

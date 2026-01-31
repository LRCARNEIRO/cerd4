import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, Users, Briefcase, Shield, GraduationCap, Heart, Accessibility, Rainbow, Baby, Layers, Filter, Info, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

const COLORS = ['hsl(210, 85%, 25%)', 'hsl(145, 55%, 32%)', 'hsl(45, 93%, 47%)', 'hsl(340, 70%, 50%)', 'hsl(280, 60%, 50%)', 'hsl(200, 70%, 45%)'];

// =============================================
// DADOS INTERSECCIONAIS: RAÇA × GÊNERO × IDADE
// =============================================

const interseccionalidadeTrabalho = [
  { grupo: 'Mulher Negra 18-29', renda: 1580, desemprego: 18.2, informalidade: 52.3 },
  { grupo: 'Mulher Negra 30-49', renda: 2120, desemprego: 11.5, informalidade: 48.1 },
  { grupo: 'Mulher Negra 50+', renda: 1890, desemprego: 8.2, informalidade: 55.8 },
  { grupo: 'Homem Negro 18-29', renda: 1920, desemprego: 14.8, informalidade: 48.5 },
  { grupo: 'Homem Negro 30-49', renda: 2580, desemprego: 7.2, informalidade: 42.3 },
  { grupo: 'Homem Negro 50+', renda: 2340, desemprego: 5.8, informalidade: 48.9 },
  { grupo: 'Mulher Branca 18-29', renda: 2280, desemprego: 12.1, informalidade: 38.2 },
  { grupo: 'Mulher Branca 30-49', renda: 3450, desemprego: 6.8, informalidade: 32.5 },
  { grupo: 'Homem Branco 18-29', renda: 2650, desemprego: 9.5, informalidade: 35.8 },
  { grupo: 'Homem Branco 30-49', renda: 4580, desemprego: 4.2, informalidade: 28.1 }
];

const deficienciaPorRaca = [
  { raca: 'Branca', taxaDeficiencia: 8.2, empregabilidade: 42.5, rendaMedia: 2450 },
  { raca: 'Preta', taxaDeficiencia: 9.8, empregabilidade: 31.2, rendaMedia: 1680 },
  { raca: 'Parda', taxaDeficiencia: 9.1, empregabilidade: 33.8, rendaMedia: 1780 },
  { raca: 'Indígena', taxaDeficiencia: 11.2, empregabilidade: 25.5, rendaMedia: 1320 }
];

const lgbtqiaPorRaca = [
  { indicador: 'Violência física (% vítimas)', negroLGBT: 68.2, brancoLGBT: 31.8 },
  { indicador: 'Desemprego (%)', negroLGBT: 22.5, brancoLGBT: 14.2 },
  { indicador: 'Abandono escolar (%)', negroLGBT: 35.8, brancoLGBT: 18.5 },
  { indicador: 'Situação de rua (%)', negroLGBT: 72.5, brancoLGBT: 27.5 }
];

// Povos Tradicionais
const povosTradicionais = {
  indigenas: {
    populacao: 1693535,
    terrasHomologadas2018_2022: 2,
    terrasHomologadas2023_2025: 11,
    mortalidadeInfantil: 42.8, // por mil nascidos vivos
    acessoSaude: 68.5, // % com acesso regular
    educacaoBilingue: 32.5 // % escolas indígenas com educação bilíngue
  },
  quilombolas: {
    populacao: 1327802,
    comunidadesCertificadas: 3524,
    comunidadesTituladas: 178,
    acessoAgua: 45.2, // %
    acessoSaneamento: 28.5, // %
    bolsaFamilia: 78.5 // % beneficiários
  },
  ciganos: {
    populacaoEstimada: 800000,
    acampamentosIdentificados: 291,
    acessoEducacao: 12.5, // % com ensino médio completo
    documentacao: 35.2, // % com documentação completa
    acessoSaude: 28.5 // % com atendimento regular
  }
};

// CLASSE: Renda x Raça
const classePorRaca = [
  { faixa: 'Extrema pobreza', branca: 3.2, negra: 8.5, indigena: 18.2 },
  { faixa: 'Pobreza', branca: 8.5, negra: 18.2, indigena: 25.5 },
  { faixa: 'Vulnerável', branca: 22.5, negra: 35.8, indigena: 32.1 },
  { faixa: 'Classe média', branca: 42.5, negra: 28.5, indigena: 18.5 },
  { faixa: 'Alta renda', branca: 23.3, negra: 9.0, indigena: 5.7 }
];

// Mulheres chefes de família
const mulheresChefeFamilia = [
  { ano: 2018, negras: 28.5, brancas: 18.2 },
  { ano: 2019, negras: 29.8, brancas: 18.8 },
  { ano: 2020, negras: 32.5, brancas: 20.1 },
  { ano: 2021, negras: 34.2, brancas: 21.5 },
  { ano: 2022, negras: 35.8, brancas: 22.2 },
  { ano: 2023, negras: 37.5, brancas: 23.1 },
  { ano: 2024, negras: 38.2, brancas: 23.8 }
];

// Violência interseccional
const violenciaInterseccional = [
  { tipo: 'Feminicídio', mulherNegra: 65.8, mulherBranca: 34.2 },
  { tipo: 'Violência doméstica', mulherNegra: 58.2, mulherBranca: 41.8 },
  { tipo: 'Estupro', mulherNegra: 52.8, mulherBranca: 47.2 },
  { tipo: 'Assédio no trabalho', mulherNegra: 62.5, mulherBranca: 37.5 }
];

// Juventude negra
const juventudeNegra = [
  { indicador: 'Taxa de homicídio (por 100 mil)', valor: 78.5, referencia: 28.2 },
  { indicador: 'Desemprego 18-24 anos (%)', valor: 22.5, referencia: 12.8 },
  { indicador: 'Nem-nem (%)', valor: 28.5, referencia: 15.2 },
  { indicador: 'Encarceramento (% do total)', valor: 67.5, referencia: 32.5 }
];

// Educação interseccional
const educacaoInterseccional = [
  { grupo: 'Mulher negra', superiorCompleto: 15.2, posGraduacao: 2.8, evasaoMedio: 12.5 },
  { grupo: 'Homem negro', superiorCompleto: 11.8, posGraduacao: 1.9, evasaoMedio: 18.2 },
  { grupo: 'Mulher branca', superiorCompleto: 28.5, posGraduacao: 6.2, evasaoMedio: 5.8 },
  { grupo: 'Homem branco', superiorCompleto: 22.8, posGraduacao: 4.5, evasaoMedio: 8.2 },
  { grupo: 'Indígena', superiorCompleto: 5.2, posGraduacao: 0.8, evasaoMedio: 25.5 },
  { grupo: 'Quilombola', superiorCompleto: 6.8, posGraduacao: 1.1, evasaoMedio: 22.8 }
];

// Saúde interseccional
const saudeInterseccional = [
  { indicador: 'Mortalidade materna', mulherNegraPobre: 185.2, mulherNegraMedia: 128.5, mulherBranca: 68.2 },
  { indicador: 'Pré-natal adequado (%)', mulherNegraPobre: 38.5, mulherNegraMedia: 62.5, mulherBranca: 82.5 },
  { indicador: 'Cesárea eletiva (%)', mulherNegraPobre: 28.5, mulherNegraMedia: 45.2, mulherBranca: 72.5 }
];

// Radar: Vulnerabilidades por grupo
const radarVulnerabilidades = [
  { eixo: 'Renda', mulherNegra: 85, homemNegro: 72, mulherBranca: 45, homemBranco: 28 },
  { eixo: 'Emprego', mulherNegra: 78, homemNegro: 65, mulherBranca: 52, homemBranco: 35 },
  { eixo: 'Educação', mulherNegra: 68, homemNegro: 75, mulherBranca: 38, homemBranco: 42 },
  { eixo: 'Saúde', mulherNegra: 82, homemNegro: 58, mulherBranca: 32, homemBranco: 45 },
  { eixo: 'Violência', mulherNegra: 88, homemNegro: 92, mulherBranca: 42, homemBranco: 38 },
  { eixo: 'Moradia', mulherNegra: 72, homemNegro: 68, mulherBranca: 35, homemBranco: 32 }
];

// Evolução temporal
const evolucaoDesigualdade = [
  { ano: 2018, razaoRenda: 1.73, razaoDesemprego: 1.72, razaoHomicidio: 2.68 },
  { ano: 2019, razaoRenda: 1.71, razaoDesemprego: 1.68, razaoHomicidio: 2.65 },
  { ano: 2020, razaoRenda: 1.68, razaoDesemprego: 1.75, razaoHomicidio: 2.58 },
  { ano: 2021, razaoRenda: 1.65, razaoDesemprego: 1.72, razaoHomicidio: 2.52 },
  { ano: 2022, razaoRenda: 1.62, razaoDesemprego: 1.65, razaoHomicidio: 2.48 },
  { ano: 2023, razaoRenda: 1.58, razaoDesemprego: 1.58, razaoHomicidio: 2.52 },
  { ano: 2024, razaoRenda: 1.55, razaoDesemprego: 1.52, razaoHomicidio: 2.55 }
];

export default function Estatisticas() {
  const [openSections, setOpenSections] = useState<string[]>(['intro']);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <DashboardLayout
      title="Estatísticas Interseccionais"
      subtitle="Cruzamentos: Raça × Gênero × Idade × Classe × Orientação Sexual × Deficiência"
    >
      {/* Alerta Metodológico */}
      <Card className="mb-6 border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Layers className="w-6 h-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Abordagem Interseccional</h3>
              <p className="text-sm text-muted-foreground">
                Esta seção apresenta dados com <strong>cruzamentos múltiplos</strong> para revelar como as desigualdades se sobrepõem e se intensificam. 
                A análise segue a metodologia do IBGE, IPEA e recomendações do Comitê CERD da ONU, priorizando:
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-primary/10 text-primary">Raça/Cor</Badge>
                <Badge className="bg-primary/10 text-primary">Gênero</Badge>
                <Badge className="bg-primary/10 text-primary">Faixa Etária</Badge>
                <Badge className="bg-primary/10 text-primary">Classe/Renda</Badge>
                <Badge className="bg-primary/10 text-primary">Orientação Sexual</Badge>
                <Badge className="bg-primary/10 text-primary">Deficiência</Badge>
                <Badge className="bg-accent text-accent-foreground">Povos Tradicionais</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="vulnerabilidades" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="vulnerabilidades" className="gap-1">
            <Layers className="w-4 h-4" /> Vulnerabilidades
          </TabsTrigger>
          <TabsTrigger value="raca-genero" className="gap-1">
            <Users className="w-4 h-4" /> Raça × Gênero
          </TabsTrigger>
          <TabsTrigger value="povos-tradicionais" className="gap-1">
            <Users className="w-4 h-4" /> Povos Tradicionais
          </TabsTrigger>
          <TabsTrigger value="lgbtqia" className="gap-1">
            <Rainbow className="w-4 h-4" /> LGBTQIA+
          </TabsTrigger>
          <TabsTrigger value="deficiencia" className="gap-1">
            <Accessibility className="w-4 h-4" /> Deficiência
          </TabsTrigger>
          <TabsTrigger value="juventude" className="gap-1">
            <Baby className="w-4 h-4" /> Juventude
          </TabsTrigger>
          <TabsTrigger value="classe" className="gap-1">
            <Briefcase className="w-4 h-4" /> Classe Social
          </TabsTrigger>
        </TabsList>

        {/* ABA: VULNERABILIDADES CRUZADAS */}
        <TabsContent value="vulnerabilidades">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: Síntese de indicadores IBGE/IPEA/DataSUS 2024 | Elaboração própria
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Evolução das Razões de Desigualdade Racial (2018-2024)</CardTitle>
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
                  <p className="text-xs font-medium">Interpretação:</p>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• <strong>Renda:</strong> Brancos ganham 1,55x mais que negros (melhoria de 10% desde 2018)</li>
                    <li>• <strong>Desemprego:</strong> Negros têm 1,52x mais desemprego (melhoria de 12%)</li>
                    <li>• <strong>Homicídio:</strong> Negros são assassinados 2,55x mais (estagnação)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela resumo interseccional */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="w-5 h-5 text-primary" />
                Cruzamento Completo: Raça × Gênero × Faixa Etária (Trabalho)
              </CardTitle>
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
              <p className="text-xs text-muted-foreground mt-4">
                Fonte: PNAD Contínua/IBGE 2024 | Microanálise por raça/cor × sexo × faixa etária
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: RAÇA × GÊNERO */}
        <TabsContent value="raca-genero">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Heart className="w-5 h-5 text-destructive" />
                  Violência contra Mulheres por Raça (%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={violenciaInterseccional} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                      <YAxis dataKey="tipo" type="category" tick={{ fontSize: 11 }} width={130} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, '']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="mulherNegra" name="Mulher Negra" fill="hsl(var(--destructive))" stackId="a" />
                      <Bar dataKey="mulherBranca" name="Mulher Branca" fill="hsl(var(--chart-1))" stackId="a" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: Fórum Brasileiro de Segurança Pública 2024 | Mulheres negras são 65,8% das vítimas de feminicídio
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Mulheres Chefes de Família Monoparental (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mulheresChefeFamilia}>
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
                      <Line type="monotone" dataKey="negras" name="Negras" stroke="hsl(var(--destructive))" strokeWidth={2} />
                      <Line type="monotone" dataKey="brancas" name="Brancas" stroke="hsl(var(--chart-1))" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: PNAD/IBGE 2018-2024 | Crescimento de 34% em famílias chefiadas por mulheres negras
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                Educação por Raça × Gênero (%)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Grupo</TableHead>
                    <TableHead className="text-right">Ensino Superior</TableHead>
                    <TableHead className="text-right">Pós-graduação</TableHead>
                    <TableHead className="text-right">Evasão Ens. Médio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {educacaoInterseccional.map(item => (
                    <TableRow key={item.grupo}>
                      <TableCell className="font-medium">{item.grupo}</TableCell>
                      <TableCell className="text-right">{item.superiorCompleto}%</TableCell>
                      <TableCell className="text-right">{item.posGraduacao}%</TableCell>
                      <TableCell className={cn("text-right", item.evasaoMedio > 15 && "text-destructive font-semibold")}>
                        {item.evasaoMedio}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-4">
                Fonte: INEP/Censo da Educação Superior 2023 e PNAD Contínua 2024
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: POVOS TRADICIONAIS */}
        <TabsContent value="povos-tradicionais">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Indígenas */}
            <Card className="border-t-4 border-t-accent">
              <CardHeader>
                <CardTitle className="text-base">Povos Indígenas</CardTitle>
                <CardDescription>Censo 2022: {povosTradicionais.indigenas.populacao.toLocaleString('pt-BR')} pessoas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Terras Homologadas 2018-2022</p>
                    <p className="text-xl font-bold text-destructive">{povosTradicionais.indigenas.terrasHomologadas2018_2022}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Terras Homologadas 2023-2025</p>
                    <p className="text-xl font-bold text-success">{povosTradicionais.indigenas.terrasHomologadas2023_2025}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Mortalidade infantil (‰)</span>
                    <span className="font-semibold text-destructive">{povosTradicionais.indigenas.mortalidadeInfantil}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Acesso regular à saúde</span>
                    <span className="font-semibold">{povosTradicionais.indigenas.acessoSaude}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Educação bilíngue</span>
                    <span className="font-semibold text-warning">{povosTradicionais.indigenas.educacaoBilingue}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quilombolas */}
            <Card className="border-t-4 border-t-primary">
              <CardHeader>
                <CardTitle className="text-base">Comunidades Quilombolas</CardTitle>
                <CardDescription>Censo 2022: {povosTradicionais.quilombolas.populacao.toLocaleString('pt-BR')} pessoas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Certificadas</p>
                    <p className="text-xl font-bold">{povosTradicionais.quilombolas.comunidadesCertificadas.toLocaleString('pt-BR')}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">Tituladas</p>
                    <p className="text-xl font-bold text-warning">{povosTradicionais.quilombolas.comunidadesTituladas}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Acesso à água</span>
                    <span className="font-semibold text-warning">{povosTradicionais.quilombolas.acessoAgua}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Saneamento básico</span>
                    <span className="font-semibold text-destructive">{povosTradicionais.quilombolas.acessoSaneamento}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Bolsa Família</span>
                    <span className="font-semibold">{povosTradicionais.quilombolas.bolsaFamilia}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ciganos */}
            <Card className="border-t-4 border-t-warning">
              <CardHeader>
                <CardTitle className="text-base">Povos Ciganos (Rom, Calon, Sinti)</CardTitle>
                <CardDescription>Estimativa: {povosTradicionais.ciganos.populacaoEstimada.toLocaleString('pt-BR')} pessoas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                  <p className="text-xs font-medium text-warning">⚠️ Dados Precários</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Primeiro levantamento sistemático apenas em 2024 (MUNIC/IBGE)
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Acampamentos identificados</span>
                    <span className="font-semibold">{povosTradicionais.ciganos.acampamentosIdentificados}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Ensino médio completo</span>
                    <span className="font-semibold text-destructive">{povosTradicionais.ciganos.acessoEducacao}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Documentação completa</span>
                    <span className="font-semibold text-destructive">{povosTradicionais.ciganos.documentacao}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Atendimento saúde regular</span>
                    <span className="font-semibold text-destructive">{povosTradicionais.ciganos.acessoSaude}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="border-l-4 border-l-warning">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Lacunas Críticas Identificadas pelo Comitê CERD</h3>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• <strong>Indígenas:</strong> Paralisia na demarcação de terras (2019-2022) e aumento de conflitos fundiários</li>
                    <li>• <strong>Quilombolas:</strong> Apenas 5% das comunidades certificadas foram tituladas; déficit de infraestrutura básica</li>
                    <li>• <strong>Ciganos:</strong> Ausência de políticas específicas até 2024; inexistência de dados desagregados no Censo</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: LGBTQIA+ */}
        <TabsContent value="lgbtqia">
          <Card className="mb-6 border-l-4 border-l-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Intersecção LGBTQIA+ × Raça</h3>
                  <p className="text-sm text-muted-foreground">
                    Pessoas LGBTQIA+ negras enfrentam <strong>dupla discriminação</strong>. Em 2024, 68,2% das vítimas de violência LGBTfóbica eram negras. 
                    O Brasil segue líder mundial em assassinatos de pessoas trans, com mulheres trans negras sendo as mais vulneráveis.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Rainbow className="w-5 h-5 text-primary" />
                  Indicadores LGBTQIA+ por Raça (%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={lgbtqiaPorRaca} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis type="number" domain={[0, 80]} tick={{ fontSize: 12 }} />
                      <YAxis dataKey="indicador" type="category" tick={{ fontSize: 10 }} width={140} />
                      <Tooltip 
                        formatter={(value: number) => [`${value}%`, '']}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="negroLGBT" name="LGBT Negro" fill="hsl(var(--destructive))" />
                      <Bar dataKey="brancoLGBT" name="LGBT Branco" fill="hsl(var(--chart-1))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: ANTRA/GGB 2024 | Dossiê de Mortes e Violências LGBTI+
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dados-Chave</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
                    <p className="text-xs text-muted-foreground">Assassinatos Trans (2024)</p>
                    <p className="text-2xl font-bold text-destructive">145</p>
                    <p className="text-xs text-muted-foreground">79% negras</p>
                  </div>
                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/30">
                    <p className="text-xs text-muted-foreground">Expectativa de vida Trans</p>
                    <p className="text-2xl font-bold text-warning">35 anos</p>
                    <p className="text-xs text-muted-foreground">vs. 76 anos pop. geral</p>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium mb-2">Lacunas nos Dados:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Ausência de campo orientação sexual no Censo</li>
                    <li>• Subnotificação de violência LGBTfóbica</li>
                    <li>• Não há pesquisa oficial sobre emprego LGBTQIA+</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA: DEFICIÊNCIA */}
        <TabsContent value="deficiencia">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Accessibility className="w-5 h-5 text-primary" />
                  Pessoas com Deficiência por Raça
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Raça/Cor</TableHead>
                      <TableHead className="text-right">% com Deficiência</TableHead>
                      <TableHead className="text-right">Empregabilidade</TableHead>
                      <TableHead className="text-right">Renda Média</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deficienciaPorRaca.map(item => (
                      <TableRow key={item.raca}>
                        <TableCell className="font-medium">{item.raca}</TableCell>
                        <TableCell className="text-right">{item.taxaDeficiencia}%</TableCell>
                        <TableCell className={cn("text-right", item.empregabilidade < 35 && "text-destructive font-semibold")}>
                          {item.empregabilidade}%
                        </TableCell>
                        <TableCell className="text-right">{formatCurrency(item.rendaMedia)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <p className="text-xs text-muted-foreground mt-4">
                  Fonte: Censo 2022 e PNAD Contínua 2024 | Metodologia do Grupo de Washington
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Disparidades Interseccionais</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={deficienciaPorRaca}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="raca" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'rendaMedia' ? formatCurrency(value) : `${value}%`,
                          name === 'rendaMedia' ? 'Renda' : name === 'empregabilidade' ? 'Empregabilidade' : 'Taxa'
                        ]}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Legend />
                      <Bar dataKey="empregabilidade" name="Empregabilidade (%)" fill="hsl(var(--primary))" />
                      <Bar dataKey="taxaDeficiencia" name="% com Deficiência" fill="hsl(var(--warning))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-xs">
                    <strong>Dupla desvantagem:</strong> Pessoas negras com deficiência têm taxa de emprego 26% menor que brancos com deficiência, 
                    e renda 31% inferior.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA: JUVENTUDE */}
        <TabsContent value="juventude">
          <Card className="mb-6 border-l-4 border-l-destructive">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Genocídio da Juventude Negra</h3>
                  <p className="text-sm text-muted-foreground">
                    Jovens negros (15-29 anos) representam <strong>56% das vítimas de homicídio</strong> no Brasil. 
                    A taxa de homicídio de jovens negros é <strong>2,78 vezes maior</strong> que a de jovens brancos.
                    Este é o principal ponto de crítica do Comitê CERD.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Baby className="w-5 h-5 text-warning" />
                  Indicadores da Juventude Negra vs. Branca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {juventudeNegra.map(item => (
                    <div key={item.indicador} className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">{item.indicador}</p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Jovens Negros</span>
                            <span className="font-bold text-destructive">{item.valor}</span>
                          </div>
                          <div className="h-2 bg-destructive/20 rounded-full">
                            <div 
                              className="h-2 bg-destructive rounded-full" 
                              style={{ width: `${Math.min((item.valor / 100) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Jovens Brancos</span>
                            <span className="font-bold">{item.referencia}</span>
                          </div>
                          <div className="h-2 bg-primary/20 rounded-full">
                            <div 
                              className="h-2 bg-primary rounded-full" 
                              style={{ width: `${Math.min((item.referencia / 100) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Programa Juventude Negra Viva (2023-2025)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-success/10 border border-success/30 rounded-lg">
                  <p className="text-sm font-medium text-success mb-2">Avanços 2023-2025:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Orçamento: R$ 45M → R$ 285M (aumento de 533%)</li>
                    <li>• 15 estados aderiram ao programa</li>
                    <li>• 180 municípios com ações focalizadas</li>
                    <li>• Criação do Plano Nacional (Decreto 11.786/2023)</li>
                  </ul>
                </div>
                <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
                  <p className="text-sm font-medium text-warning mb-2">Desafios Persistentes:</p>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Taxa de homicídio ainda 2,55x maior</li>
                    <li>• Letalidade policial: 83% das vítimas são negras</li>
                    <li>• Encarceramento massivo de jovens negros</li>
                    <li>• Evasão escolar 2x maior</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ABA: CLASSE SOCIAL */}
        <TabsContent value="classe">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-primary" />
                  Distribuição por Faixa de Renda × Raça (%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={classePorRaca}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="faixa" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" height={60} />
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
                      <Bar dataKey="branca" name="Branca" fill="hsl(var(--chart-1))" />
                      <Bar dataKey="negra" name="Negra" fill="hsl(var(--chart-2))" />
                      <Bar dataKey="indigena" name="Indígena" fill="hsl(var(--chart-3))" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Fonte: PNAD Contínua 2024 | Linhas de pobreza: Banco Mundial
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Saúde × Raça × Classe</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Indicador</TableHead>
                      <TableHead className="text-right">Negra Pobre</TableHead>
                      <TableHead className="text-right">Negra Média</TableHead>
                      <TableHead className="text-right">Branca</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {saudeInterseccional.map(item => (
                      <TableRow key={item.indicador}>
                        <TableCell className="font-medium text-sm">{item.indicador}</TableCell>
                        <TableCell className={cn("text-right", item.mulherNegraPobre > 100 && "text-destructive font-semibold")}>
                          {item.mulherNegraPobre}
                        </TableCell>
                        <TableCell className="text-right">{item.mulherNegraMedia}</TableCell>
                        <TableCell className="text-right">{item.mulherBranca}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
                  <p className="text-xs">
                    <strong>Intersecção crítica:</strong> Mulheres negras pobres têm mortalidade materna 2,7x maior que mulheres brancas, 
                    evidenciando como raça e classe se combinam.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Mobilidade Social Intergeracional por Raça</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Chance de filho de pais pobres ser classe média</p>
                  <div className="flex justify-center gap-6 mt-2">
                    <div>
                      <p className="text-2xl font-bold text-primary">28%</p>
                      <p className="text-xs text-muted-foreground">Branco</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-destructive">12%</p>
                      <p className="text-xs text-muted-foreground">Negro</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">Gerações para sair da pobreza</p>
                  <div className="flex justify-center gap-6 mt-2">
                    <div>
                      <p className="text-2xl font-bold text-primary">4</p>
                      <p className="text-xs text-muted-foreground">Branco</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-destructive">9</p>
                      <p className="text-xs text-muted-foreground">Negro</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-xs text-muted-foreground mb-1">% no 1% mais rico</p>
                  <div className="flex justify-center gap-6 mt-2">
                    <div>
                      <p className="text-2xl font-bold text-primary">82%</p>
                      <p className="text-xs text-muted-foreground">Branco</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-destructive">18%</p>
                      <p className="text-xs text-muted-foreground">Negro</p>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-4 text-center">
                Fonte: IPEA/Retrato das Desigualdades 2024 | Estudo de coortes 1980-2020
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

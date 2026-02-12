import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { 
  Heart, GraduationCap, Users, AlertTriangle, Baby, Briefcase, Rainbow, Accessibility, FileText, ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  violenciaInterseccional, 
  mulheresChefeFamilia, 
  educacaoInterseccional,
  saudeInterseccional,
  lgbtqiaPorRaca,
  deficienciaPorRaca,
  juventudeNegra,
  classePorRaca,
  povosTradicionais,
  fonteDados
} from './StatisticsData';

export function RacaGeneroTab() {
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
              <Heart className="w-5 h-5 text-destructive" />
              Violência contra Mulheres por Raça (%)
            </CardTitle>
            <CardDescription>19º Anuário FBSP 2025 (dados 2024)</CardDescription>
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
              <FileText className="w-3 h-3 inline mr-1" />
              Mulheres negras são 63,6% das vítimas de feminicídio (19º Anuário FBSP 2025, dados 2024). Em 2018: 61%.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Mulheres Chefes de Família Monoparental (%)</CardTitle>
            <CardDescription>Evolução 2018-2024</CardDescription>
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
              <FileText className="w-3 h-3 inline mr-1" />
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
          <CardDescription>INEP/Censo da Educação Superior 2023 e PNAD Contínua 2024</CardDescription>
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
        </CardContent>
      </Card>
    </div>
  );
}

export function PovosTradicionaisTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Indígenas */}
        <Card className="border-t-4 border-t-accent">
          <CardHeader>
            <CardTitle className="text-base">Povos Indígenas</CardTitle>
            <CardDescription>
              Censo 2022: {povosTradicionais.indigenas.populacaoPessoasIndigenas.toLocaleString('pt-BR')} pessoas indígenas
              <br />
              <span className="text-xs">(cor/raça: {povosTradicionais.indigenas.populacaoCorRaca.toLocaleString('pt-BR')})</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Terras 2018-2022</p>
                <p className="text-xl font-bold text-destructive">{povosTradicionais.indigenas.terrasHomologadas2018_2022}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground">Terras 2023-2025</p>
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
                <p className="text-xs text-muted-foreground">Territórios Titulados</p>
                <p className="text-xl font-bold text-warning">{povosTradicionais.quilombolas.territoriosTitulados}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Rede geral de água</span>
                <span className="font-semibold text-warning">{povosTradicionais.quilombolas.acessoRedeAgua}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Esgotamento adequado</span>
                <span className="font-semibold text-destructive">{povosTradicionais.quilombolas.esgotamentoAdequado}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Coleta de lixo</span>
                <span className="font-semibold">{povosTradicionais.quilombolas.coletaLixo}%</span>
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
    </div>
  );
}

export function LgbtqiaTab() {
  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-destructive">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Intersecção LGBTQIA+ × Raça</h3>
              <p className="text-sm text-muted-foreground">
                Pessoas LGBTQIA+ negras enfrentam <strong>dupla discriminação</strong>. Em 2024, 68,2% das vítimas de violência LGBTfóbica eram negras (ANTRA 2025). 
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
            <CardDescription>ANTRA/GGB 2024 | Dossiê de Mortes e Violências LGBTI+</CardDescription>
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
    </div>
  );
}

export function DeficienciaTab() {
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
              <Accessibility className="w-5 h-5 text-primary" />
              Pessoas com Deficiência por Raça
            </CardTitle>
            <CardDescription>Censo 2022 e PNAD Contínua 2024 | Metodologia do Grupo de Washington</CardDescription>
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
                      ''
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
    </div>
  );
}

export function JuventudeTab() {
  return (
    <div className="space-y-6">
      <Card className="border-l-4 border-l-destructive">
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
    </div>
  );
}

export function ClasseSocialTab() {
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
              <Briefcase className="w-5 h-5 text-primary" />
              Distribuição por Faixa de Renda × Raça (%)
            </CardTitle>
            <CardDescription>PNAD Contínua 2024 | Linhas de pobreza: Banco Mundial</CardDescription>
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
          <CardDescription>IPEA/Retrato das Desigualdades 2024 | Estudo de coortes 1980-2020</CardDescription>
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
        </CardContent>
      </Card>
    </div>
  );
}

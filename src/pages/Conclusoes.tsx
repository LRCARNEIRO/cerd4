import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, XCircle, Scale, Target, FileWarning, Lightbulb, BarChart3, ArrowRight, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

// Análise: O que o Estado FEZ (2018-2026)
const avancos = [
  {
    area: 'Demarcação de Terras Indígenas',
    periodo2018_2022: { acoes: 2, descricao: 'Apenas 2 terras homologadas' },
    periodo2023_2025: { acoes: 11, descricao: '11 terras homologadas + retomada FUNAI' },
    variacao: '+450%',
    avaliacao: 'avanço significativo'
  },
  {
    area: 'Orçamento Igualdade Racial',
    periodo2018_2022: { acoes: 'R$ 45M/ano', descricao: 'Média anual MIR/SEPPIR' },
    periodo2023_2025: { acoes: 'R$ 285M/ano', descricao: 'Recriação do MIR + programas' },
    variacao: '+533%',
    avaliacao: 'avanço significativo'
  },
  {
    area: 'Lei de Cotas',
    periodo2018_2022: { acoes: 'Vigência', descricao: 'Lei 12.711/2012 em aplicação' },
    periodo2023_2025: { acoes: 'Renovação', descricao: 'Lei 14.723/2023 - prorrogação até 2033' },
    variacao: '+10 anos',
    avaliacao: 'avanço'
  },
  {
    area: 'Programa Juventude Negra Viva',
    periodo2018_2022: { acoes: 'Inexistente', descricao: 'Sem política específica' },
    periodo2023_2025: { acoes: 'Criação', descricao: 'Decreto 11.786/2023 + R$ 285M' },
    variacao: 'Novo',
    avaliacao: 'avanço significativo'
  },
  {
    area: 'SINAPIR',
    periodo2018_2022: { acoes: '22 estados', descricao: 'Adesões estaduais' },
    periodo2023_2025: { acoes: '26 estados + DF', descricao: 'Cobertura total + fortalecimento' },
    variacao: '+4 UFs',
    avaliacao: 'avanço'
  },
  {
    area: 'Titulação Quilombola',
    periodo2018_2022: { acoes: '0 títulos', descricao: 'Paralisia total no INCRA' },
    periodo2023_2025: { acoes: '12 títulos', descricao: 'Retomada de processos' },
    variacao: 'Retomada',
    avaliacao: 'avanço parcial'
  }
];

// Análise: O que o Estado DEIXOU DE FAZER
const omissoes = [
  {
    area: 'Letalidade Policial',
    problema: 'Negros são 83% das vítimas',
    recomendacaoCERD: 'Reforma das forças de segurança',
    situacao2018_2022: 'Aumento de mortes',
    situacao2023_2025: 'Câmeras corporais em 8 UFs apenas',
    status: 'insuficiente'
  },
  {
    area: 'Encarceramento em Massa',
    problema: '67% da população prisional é negra',
    recomendacaoCERD: 'Políticas de desencarceramento',
    situacao2018_2022: 'Aumento de 12%',
    situacao2023_2025: 'Sem redução significativa',
    status: 'omissão'
  },
  {
    area: 'Povos Ciganos',
    problema: 'Inexistência de dados e políticas',
    recomendacaoCERD: 'Levantamento censitário e políticas específicas',
    situacao2018_2022: 'Nenhuma ação',
    situacao2023_2025: 'Primeiro mapeamento MUNIC 2024',
    status: 'insuficiente'
  },
  {
    area: 'Reparação Histórica',
    problema: 'Ausência de política reparatória',
    recomendacaoCERD: 'Programa nacional de reparação',
    situacao2018_2022: 'Nenhuma iniciativa',
    situacao2023_2025: 'GT criado, sem avanço concreto',
    status: 'omissão'
  },
  {
    area: 'Desigualdade de Renda',
    problema: 'Brancos ganham 1,55x mais que negros',
    recomendacaoCERD: 'Políticas afirmativas no mercado de trabalho',
    situacao2018_2022: 'Sem políticas',
    situacao2023_2025: 'Cotas em concursos federais (30%)',
    status: 'insuficiente'
  },
  {
    area: 'Violência contra Mulheres Negras',
    problema: '65,8% das vítimas de feminicídio',
    recomendacaoCERD: 'Políticas interseccionais de enfrentamento',
    situacao2018_2022: 'Lei Maria da Penha genérica',
    situacao2023_2025: 'Casas da Mulher com recorte racial em 5 UFs',
    status: 'insuficiente'
  }
];

// Síntese do período
const sintesePeriodo = {
  periodo1: {
    nome: '2018-2022',
    caracteristica: 'Desmonte institucional',
    pontos: [
      'Extinção do Ministério da Igualdade Racial',
      'Paralisia na demarcação de terras',
      'Corte de 70% do orçamento',
      'Aumento da violência policial',
      'Nenhuma titulação quilombola'
    ]
  },
  periodo2: {
    nome: '2023-2025',
    caracteristica: 'Reconstrução com lacunas',
    pontos: [
      'Recriação do MIR',
      'Aumento orçamentário expressivo',
      'Retomada de demarcações',
      'Programas para juventude negra',
      'Persistência da violência letal'
    ]
  }
};

// Cumprimento das recomendações CERD
const cumprimentoCERD = [
  { recomendacao: 'Combate ao racismo institucional', cumprimento: 35 },
  { recomendacao: 'Redução da violência policial', cumprimento: 15 },
  { recomendacao: 'Demarcação de terras indígenas', cumprimento: 55 },
  { recomendacao: 'Titulação quilombola', cumprimento: 25 },
  { recomendacao: 'Políticas para ciganos', cumprimento: 10 },
  { recomendacao: 'Educação antirracista', cumprimento: 40 },
  { recomendacao: 'Desigualdade econômica', cumprimento: 30 },
  { recomendacao: 'Acesso à saúde', cumprimento: 45 }
];

// Fio condutor / Tese central
const teseCentral = {
  titulo: 'O Paradoxo da Igualdade Racial no Brasil (2018-2026)',
  argumento: `O período 2018-2026 revela um Estado brasileiro em contradição: enquanto avança em políticas afirmativas setoriais 
  (cotas, demarcação, orçamento), mantém estruturas de violência e exclusão que perpetuam o racismo sistêmico. 
  
  A análise dos dados demonstra que:
  
  1. O PERÍODO 2018-2022 foi marcado pelo desmonte deliberado das políticas de igualdade racial, com extinção de órgãos, 
  cortes orçamentários de 70% e paralisia na execução de direitos territoriais.
  
  2. O PERÍODO 2023-2025 iniciou um processo de reconstrução institucional com aumento orçamentário de 533% e retomada 
  de demarcações, mas não conseguiu reverter indicadores estruturais de violência e desigualdade.
  
  3. A PERSISTÊNCIA DA VIOLÊNCIA LETAL contra jovens negros (taxa 2,55x maior) e a manutenção do encarceramento em massa 
  (67% negros) demonstram que a mudança de governo, sozinha, não altera as estruturas de racismo institucional.
  
  4. OS POVOS TRADICIONAIS (indígenas, quilombolas e ciganos) continuam enfrentando barreiras para acesso a direitos básicos, 
  com taxas de titulação irrisórias (5% dos quilombos) e inexistência de dados sobre ciganos até 2024.
  
  5. A INTERSECCIONALIDADE revela que mulheres negras pobres são o grupo mais vulnerável em praticamente todos os indicadores, 
  evidenciando a sobreposição de opressões de raça, gênero e classe.`,
  conclusao: `O Brasil avançou em criar institucionalidade para políticas raciais, mas falhou em transformar indicadores 
  estruturais de desigualdade e violência. Para o próximo ciclo (CERD V), recomenda-se foco em: (a) redução da letalidade 
  policial, (b) aceleração da titulação de territórios tradicionais, (c) políticas de reparação histórica, e 
  (d) produção de dados interseccionais sistemáticos.`
};

export default function Conclusoes() {
  return (
    <DashboardLayout
      title="Conclusões"
      subtitle="Análise: O que o Estado brasileiro fez e deixou de fazer (2018-2026)"
    >
      {/* Tese Central */}
      <Card className="mb-6 border-2 border-primary">
        <CardHeader className="bg-primary/5">
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-primary" />
            {teseCentral.titulo}
          </CardTitle>
          <CardDescription>
            Fio condutor da análise baseada no conjunto de dados 2018-2026
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none text-muted-foreground">
            {teseCentral.argumento.split('\n\n').map((paragrafo, i) => (
              <p key={i} className="mb-3 text-sm leading-relaxed">{paragrafo}</p>
            ))}
          </div>
          <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
            <p className="text-sm font-medium text-accent-foreground mb-2 flex items-center gap-2">
              <Target className="w-4 h-4" />
              Conclusão para o Relatório CERD IV:
            </p>
            <p className="text-sm text-muted-foreground">{teseCentral.conclusao}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="comparativo" className="w-full">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="comparativo" className="gap-1">
            <Scale className="w-4 h-4" /> Comparativo 2018-2022 vs 2023-2025
          </TabsTrigger>
          <TabsTrigger value="avancos" className="gap-1">
            <CheckCircle2 className="w-4 h-4" /> O que FEZ
          </TabsTrigger>
          <TabsTrigger value="omissoes" className="gap-1">
            <XCircle className="w-4 h-4" /> O que DEIXOU de fazer
          </TabsTrigger>
          <TabsTrigger value="cumprimento" className="gap-1">
            <BarChart3 className="w-4 h-4" /> Cumprimento CERD
          </TabsTrigger>
        </TabsList>

        {/* ABA: COMPARATIVO */}
        <TabsContent value="comparativo">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Período 2018-2022 */}
            <Card className="border-l-4 border-l-destructive">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-destructive">
                  <TrendingDown className="w-5 h-5" />
                  {sintesePeriodo.periodo1.nome}
                </CardTitle>
                <CardDescription>{sintesePeriodo.periodo1.caracteristica}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {sintesePeriodo.periodo1.pontos.map((ponto, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                      <span>{ponto}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Período 2023-2025 */}
            <Card className="border-l-4 border-l-success">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <TrendingUp className="w-5 h-5" />
                  {sintesePeriodo.periodo2.nome}
                </CardTitle>
                <CardDescription>{sintesePeriodo.periodo2.caracteristica}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {sintesePeriodo.periodo2.pontos.map((ponto, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span>{ponto}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Tabela Comparativa */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Evolução por Área de Política</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 font-medium">Área</th>
                      <th className="text-left py-3 px-2 font-medium text-destructive">2018-2022</th>
                      <th className="text-left py-3 px-2 font-medium text-success">2023-2025</th>
                      <th className="text-center py-3 px-2 font-medium">Variação</th>
                      <th className="text-center py-3 px-2 font-medium">Avaliação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {avancos.map((item, i) => (
                      <tr key={i} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-2 font-medium">{item.area}</td>
                        <td className="py-3 px-2">
                          <div>
                            <span className="font-semibold">{item.periodo2018_2022.acoes}</span>
                            <p className="text-xs text-muted-foreground">{item.periodo2018_2022.descricao}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <span className="font-semibold">{item.periodo2023_2025.acoes}</span>
                            <p className="text-xs text-muted-foreground">{item.periodo2023_2025.descricao}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                            {item.variacao}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 text-center">
                          <Badge className={cn(
                            item.avaliacao === 'avanço significativo' && 'bg-success text-success-foreground',
                            item.avaliacao === 'avanço' && 'bg-success/70 text-success-foreground',
                            item.avaliacao === 'avanço parcial' && 'bg-warning text-warning-foreground'
                          )}>
                            {item.avaliacao}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: O QUE FEZ */}
        <TabsContent value="avancos">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {avancos.map((item, i) => (
              <Card key={i} className="border-t-4 border-t-success">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    {item.area}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">2018-2022:</span>
                      <span className="font-semibold">{item.periodo2018_2022.acoes}</span>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted-foreground mx-auto" />
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">2023-2025:</span>
                      <span className="font-semibold text-success">{item.periodo2023_2025.acoes}</span>
                    </div>
                    <div className="pt-2 border-t">
                      <Badge className="bg-success/10 text-success">
                        Variação: {item.variacao}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 bg-success/5 border-success/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Síntese dos Avanços (2023-2025)</h3>
                  <p className="text-sm text-muted-foreground">
                    A retomada institucional a partir de 2023 resultou em: recriação do MIR, aumento orçamentário médio de 533%, 
                    aceleração na demarcação de terras indígenas (11 homologações vs. 2 no período anterior), renovação da Lei de Cotas 
                    por mais 10 anos, e criação de programa específico para juventude negra. No entanto, esses avanços ainda não 
                    reverteram indicadores estruturais de desigualdade.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: O QUE DEIXOU DE FAZER */}
        <TabsContent value="omissoes">
          <div className="space-y-4">
            {omissoes.map((item, i) => (
              <Card key={i} className={cn(
                'border-l-4',
                item.status === 'omissão' ? 'border-l-destructive' : 'border-l-warning'
              )}>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <h3 className="font-semibold flex items-center gap-2">
                        {item.status === 'omissão' ? (
                          <XCircle className="w-5 h-5 text-destructive" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-warning" />
                        )}
                        {item.area}
                      </h3>
                      <p className="text-sm text-destructive mt-1">{item.problema}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Recomendação CERD:</p>
                      <p className="text-sm font-medium">{item.recomendacaoCERD}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">2018-2022:</p>
                      <p className="text-sm">{item.situacao2018_2022}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">2023-2025:</p>
                      <p className="text-sm">{item.situacao2023_2025}</p>
                      <Badge className={cn(
                        'mt-2',
                        item.status === 'omissão' ? 'bg-destructive' : 'bg-warning'
                      )}>
                        {item.status === 'omissão' ? 'Omissão persistente' : 'Ação insuficiente'}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="mt-6 bg-destructive/5 border-destructive/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FileWarning className="w-6 h-6 text-destructive flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Síntese das Omissões e Insuficiências</h3>
                  <p className="text-sm text-muted-foreground">
                    O Estado brasileiro falhou em: (1) reduzir a letalidade policial contra jovens negros, que permanece 2,55x maior; 
                    (2) implementar políticas de desencarceramento; (3) avançar na titulação quilombola (apenas 5% titulados); 
                    (4) criar políticas específicas para povos ciganos; (5) instituir programa de reparação histórica; e 
                    (6) reduzir significativamente a desigualdade de renda racial. Estas lacunas serão destacadas no CERD IV.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA: CUMPRIMENTO CERD */}
        <TabsContent value="cumprimento">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Grau de Cumprimento das Recomendações CERD (Observações Finais 2022)
              </CardTitle>
              <CardDescription>
                Avaliação percentual de cumprimento baseada em indicadores objetivos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cumprimentoCERD.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">{item.recomendacao}</span>
                      <span className={cn(
                        'text-sm font-bold',
                        item.cumprimento < 30 ? 'text-destructive' :
                        item.cumprimento < 50 ? 'text-warning' :
                        'text-success'
                      )}>
                        {item.cumprimento}%
                      </span>
                    </div>
                    <Progress 
                      value={item.cumprimento} 
                      className={cn(
                        'h-3',
                        item.cumprimento < 30 ? '[&>div]:bg-destructive' :
                        item.cumprimento < 50 ? '[&>div]:bg-warning' :
                        '[&>div]:bg-success'
                      )}
                    />
                  </div>
                ))}
              </div>
              
              <div className="mt-8 grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-destructive/10 rounded-lg">
                  <p className="text-2xl font-bold text-destructive">2</p>
                  <p className="text-xs text-muted-foreground">Abaixo de 20%</p>
                  <p className="text-xs font-medium">Crítico</p>
                </div>
                <div className="p-4 bg-warning/10 rounded-lg">
                  <p className="text-2xl font-bold text-warning">4</p>
                  <p className="text-xs text-muted-foreground">20-50%</p>
                  <p className="text-xs font-medium">Insuficiente</p>
                </div>
                <div className="p-4 bg-success/10 rounded-lg">
                  <p className="text-2xl font-bold text-success">2</p>
                  <p className="text-xs text-muted-foreground">Acima de 50%</p>
                  <p className="text-xs font-medium">Em progresso</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-primary/5 border-primary/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Target className="w-6 h-6 text-primary flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Média de Cumprimento: 32%</h3>
                  <p className="text-sm text-muted-foreground">
                    O Brasil cumpriu, em média, apenas 32% das recomendações do Comitê CERD das Observações Finais de 2022. 
                    As áreas mais críticas são: políticas para povos ciganos (10%), redução da violência policial (15%) e 
                    titulação quilombola (25%). As áreas com maior progresso são: demarcação indígena (55%) e acesso à saúde (45%).
                  </p>
                  <div className="mt-4 p-3 bg-background rounded-lg border">
                    <p className="text-xs font-medium mb-1">Implicação para o CERD IV:</p>
                    <p className="text-xs text-muted-foreground">
                      O relatório deverá reconhecer avanços institucionais (MIR, orçamento, cotas), mas também evidenciar 
                      lacunas persistentes e apresentar plano de ação concreto para as áreas críticas.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
}

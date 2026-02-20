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
import { AuditFooter } from '@/components/ui/audit-footer';
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
            <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
              <p className="text-xs text-muted-foreground">
                <FileText className="w-3 h-3 inline mr-1" />
                Mulheres negras são 63,6% das vítimas de feminicídio (19º Anuário FBSP 2025, dados 2024). Em 2018: 61%.
              </p>
              <a href="https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> 19º Anuário FBSP 2025
              </a>
            </div>
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
            <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
              <p className="text-xs text-muted-foreground">
                <FileText className="w-3 h-3 inline mr-1" />
                Fonte: PNAD/IBGE 2018-2024 | Crescimento de 34% em famílias chefiadas por mulheres negras
              </p>
              <a href="https://sidra.ibge.gov.br/tabela/7106" target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> SIDRA 7106 — Arranjos familiares
              </a>
            </div>
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
          <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <FileText className="w-3 h-3" /> <strong>Fontes:</strong>
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              <a href="https://www.gov.br/inep/pt-br/areas-de-atuacao/pesquisas-estatisticas-e-indicadores/censo-da-educacao-superior" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> INEP — Censo Educação Superior 2023
              </a>
              <a href="https://sidra.ibge.gov.br/Tabela/7267" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> SIDRA 7267 — Educação por cor/raça
              </a>
            </div>
          </div>
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

      {/* Fontes oficiais Povos Tradicionais */}
      <div className="p-3 bg-muted/40 rounded-lg border border-border/50 space-y-1">
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <FileText className="w-3 h-3" /> <strong>Fontes oficiais:</strong>
        </p>
        <div className="flex flex-wrap gap-3 text-xs">
          <a href="https://sidra.ibge.gov.br/Tabela/9605" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> SIDRA 9605 — Cor/raça
          </a>
          <a href="https://sidra.ibge.gov.br/Tabela/9578" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> SIDRA 9578 — Quilombolas
          </a>
          <a href="https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22326-indigenas-2.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> IBGE — Indígenas
          </a>
          <a href="https://educa.ibge.gov.br/jovens/conheca-o-brasil/populacao/22327-quilombolas.html" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> IBGE — Quilombolas
          </a>
          <a href="https://www.gov.br/funai/pt-br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> FUNAI
          </a>
          <a href="https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
            <ExternalLink className="w-3 h-3" /> INCRA — Quilombolas
          </a>
        </div>
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
                Pessoas LGBTQIA+ negras enfrentam <strong>dupla discriminação</strong>. Em 2024, 78% das vítimas de assassinatos de pessoas trans eram negras (ANTRA 2024). 
                O Brasil segue líder mundial em assassinatos de pessoas trans, com mulheres trans negras sendo as mais vulneráveis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-l-4 border-l-warning">
        <CardContent className="pt-6">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-warning flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              <strong>Limitação metodológica:</strong> Não existem pesquisas oficiais brasileiras que cruzem orientação sexual/identidade de gênero com raça/cor de forma sistemática. 
              Os dados de violência vêm da ANTRA e Disque 100; indicadores de emprego e educação LGBT por raça <strong>não são coletados oficialmente</strong>. 
              Itens marcados com <Badge variant="outline" className="text-[9px] bg-warning/10 text-warning border-warning/30 mx-1">Estimativa</Badge> 
              são derivados de fontes não-governamentais ou cruzamentos indiretos.
            </p>
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
            <CardDescription>ANTRA 2024 / Disque 100 (ONDH) 2024</CardDescription>
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
            <div className="mt-2 space-y-1">
              {lgbtqiaPorRaca.filter((item: any) => item.estimativa).map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-1 text-[10px] text-warning">
                  <AlertTriangle className="w-3 h-3" />
                  <span>"{item.indicador}" — {item.fonte}</span>
                </div>
              ))}
            </div>
            <AuditFooter
              fontes={[
                { nome: 'ANTRA — Dossiê de Assassinatos Trans 2024', url: 'https://antrabrasil.org/assassinatos/' },
                { nome: 'Disque 100/ONDH — Painel de Dados', url: 'https://www.gov.br/mdh/pt-br/ondh/painel-de-dados' },
                { nome: 'GGB — Relatório Mortes LGBTI+', url: 'https://grupogaydabahia.com.br/' },
              ]}
              documentos={['CERD 2022']}
            />
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
                <p className="text-xs text-muted-foreground">78% negras</p>
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
                <li>• Não há pesquisa oficial sobre emprego LGBTQIA+ por raça</li>
              </ul>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'ANTRA — Dossiê Trans 2024', url: 'https://antrabrasil.org/assassinatos/' },
              ]}
            />
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
            <CardDescription>PNAD Contínua 2022 (IBGE) | Metodologia do Grupo de Washington</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Raça/Cor</TableHead>
                  <TableHead className="text-right">% com Deficiência</TableHead>
                  <TableHead className="text-right">Nível Ocupação PcD</TableHead>
                  <TableHead className="text-right">Renda Média PcD</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deficienciaPorRaca.map(item => (
                  <TableRow key={item.raca}>
                    <TableCell className="font-medium">
                      {item.raca}
                      {(item as any).estimativa && (
                        <Badge variant="outline" className="ml-2 text-[9px] bg-warning/10 text-warning border-warning/30">Estimativa</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">{item.taxaDeficiencia}%</TableCell>
                    <TableCell className={cn("text-right", item.empregabilidade < 25 && "text-destructive font-semibold")}>
                      {item.empregabilidade}%
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(item.rendaMedia)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AuditFooter
              fontes={[
                { nome: 'SIDRA 9324 — Prevalência PcD por cor/raça (PNAD 2022)', url: 'https://sidra.ibge.gov.br/Tabela/9324' },
                { nome: 'SIDRA 9339 — Ocupação e rendimento PcD (PNAD 2022)', url: 'https://sidra.ibge.gov.br/Tabela/9339' },
              ]}
              documentos={['CERD 2022', 'Common Core']}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Disparidades Interseccionais PcD</CardTitle>
            <CardDescription>Nível de ocupação e prevalência por cor/raça — PNAD Contínua 2022</CardDescription>
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
                  <Bar dataKey="empregabilidade" name="Nível Ocupação PcD (%)" fill="hsl(var(--primary))" />
                  <Bar dataKey="taxaDeficiencia" name="% com Deficiência" fill="hsl(var(--warning))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-3 p-3 bg-muted rounded-lg">
              <p className="text-xs">
                <strong>Dupla desvantagem:</strong> Pessoas pretas com deficiência têm nível de ocupação 16% menor
                e renda 34% inferior às pessoas brancas com deficiência (SIDRA 9339, PNAD 2022).
              </p>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'SIDRA 9324 — Prevalência PcD (PNAD 2022)', url: 'https://sidra.ibge.gov.br/Tabela/9324' },
                { nome: 'SIDRA 9339 — Ocupação PcD (PNAD 2022)', url: 'https://sidra.ibge.gov.br/Tabela/9339' },
                { nome: 'SIDRA 9514 — PcD por tipo de deficiência e cor (Censo 2022)', url: 'https://sidra.ibge.gov.br/Tabela/9514' },
              ]}
              documentos={['CERD 2022']}
            />
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
                Jovens negros (12-29 anos) representam <strong>56% das vítimas de homicídio</strong> no Brasil (19º Anuário FBSP 2025). 
                A taxa de homicídio de jovens negros é <strong>2,78 vezes maior</strong> que a de jovens brancos (Atlas da Violência 2025).
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
                  <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm font-medium">{item.indicador}</p>
                    {(item as any).estimativa && (
                      <Badge variant="outline" className="text-[9px] bg-warning/10 text-warning border-warning/30">Estimativa</Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">Fonte: {item.fonte}</p>
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
            <AuditFooter
              fontes={[
                { nome: 'Atlas da Violência 2025 (IPEA/FBSP)', url: 'https://www.ipea.gov.br/atlasviolencia' },
                { nome: '19º Anuário FBSP 2025', url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/' },
                { nome: 'SIDRA 7113 — Desocupação por idade e cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/7113' },
                { nome: 'SISDEPEN/SENAPPEN', url: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen' },
                { nome: 'SIM/DataSUS — Mortalidade por causas externas', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' },
              ]}
              documentos={['CERD 2022', '19º Anuário FBSP 2025']}
            />
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
                <li>• Criação do Plano Nacional (Decreto 11.786/2023)</li>
                <li className="flex items-center gap-1">
                  • Orçamento: R$ 45M → R$ 285M (aumento de 533%)
                  <Badge variant="outline" className="text-[9px] bg-warning/10 text-warning border-warning/30 ml-1">Sem deep link SIOP</Badge>
                </li>
                <li className="flex items-center gap-1">
                  • 15 estados aderiram ao programa
                  <Badge variant="outline" className="text-[9px] bg-warning/10 text-warning border-warning/30 ml-1">Sem fonte oficial</Badge>
                </li>
                <li className="flex items-center gap-1">
                  • 180 municípios com ações focalizadas
                  <Badge variant="outline" className="text-[9px] bg-warning/10 text-warning border-warning/30 ml-1">Sem fonte oficial</Badge>
                </li>
              </ul>
            </div>
            <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <p className="text-sm font-medium text-warning mb-2">Desafios Persistentes:</p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Taxa de homicídio ainda 2,78x maior (Atlas 2025)</li>
                <li>• Letalidade policial: 83% das vítimas são negras (19º Anuário FBSP 2025)</li>
                <li>• Encarceramento: 68,2% dos presos são negros (SISDEPEN 2024)</li>
                <li className="flex items-center gap-1">
                  • Evasão escolar 2x maior
                  <Badge variant="outline" className="text-[9px] bg-warning/10 text-warning border-warning/30 ml-1">Estimativa</Badge>
                </li>
              </ul>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'Decreto 11.786/2023 — Planalto', url: 'https://www.planalto.gov.br/ccivil_03/_ato2023-2026/2023/decreto/D11786.htm' },
              ]}
              documentos={['CERD 2022']}
            />
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
            <CardDescription>SIS/IBGE 2024 | Linhas de pobreza: Banco Mundial</CardDescription>
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
                  <Bar dataKey="indigena" name="Indígena ⚠️" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex items-center gap-1 text-[10px] text-warning">
              <AlertTriangle className="w-3 h-3" />
              <span>Dados "Indígena" são estimativas (Censo 2022 + SIS); o SIS não publica faixas de renda para indígenas com essa granularidade.</span>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'SIS/IBGE 2024 — Síntese de Indicadores Sociais', url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html' },
                { nome: 'SIDRA 6800 — Rendimento por cor/raça', url: 'https://sidra.ibge.gov.br/Tabela/6800' },
              ]}
              documentos={['CERD 2022', 'Common Core']}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              Saúde × Raça × Classe
              <Badge variant="outline" className="text-[9px] bg-warning/10 text-warning border-warning/30">Estimativas</Badge>
            </CardTitle>
            <CardDescription>Cruzamento raça × classe não é publicado diretamente pelo DataSUS</CardDescription>
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
            <div className="mt-2 flex items-center gap-1 text-[10px] text-warning">
              <AlertTriangle className="w-3 h-3" />
              <span>Valores "Negra Pobre" e "Negra Média" são estimativas derivadas do cruzamento DataSUS (raça) × CadÚnico (renda). O DataSUS publica mortalidade materna por raça, mas não por faixa de renda.</span>
            </div>
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <p className="text-xs">
                <strong>Intersecção crítica:</strong> Mulheres negras têm mortalidade materna 2,7x maior que mulheres brancas (SIM/DataSUS 2024), 
                evidenciando como raça se combina com determinantes sociais.
              </p>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'SIM/DataSUS — Mortalidade materna por raça', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' },
                { nome: 'SINASC/DataSUS — Pré-natal por raça', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' },
              ]}
              documentos={['CERD 2022']}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Mobilidade Social Intergeracional por Raça
            <Badge variant="outline" className="text-[9px] bg-warning/10 text-warning border-warning/30">Estimativa</Badge>
          </CardTitle>
          <CardDescription>
            Dados derivados de estudos do IPEA e Banco Mundial. Não há publicação oficial com esses valores exatos em formato tabular.
          </CardDescription>
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
          <div className="mt-2 flex items-center gap-1 text-[10px] text-warning">
            <AlertTriangle className="w-3 h-3" />
            <span>Valores derivados de estudos acadêmicos (IPEA/Retrato das Desigualdades + Banco Mundial "A Broken Social Elevator"). Não há publicação oficial brasileira com esses indicadores exatos.</span>
          </div>
          <AuditFooter
            fontes={[
              { nome: 'IPEA — Retrato das Desigualdades', url: 'https://www.ipea.gov.br/retrato/' },
              { nome: 'SIS/IBGE — Síntese de Indicadores Sociais', url: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html' },
            ]}
            documentos={['CERD 2022']}
          />
        </CardContent>
      </Card>
    </div>
  );
}

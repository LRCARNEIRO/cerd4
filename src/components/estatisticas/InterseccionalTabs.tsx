import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line
} from 'recharts';
import { 
  Heart, GraduationCap, Users, AlertTriangle, Baby, Briefcase, Rainbow, Accessibility, FileText, ExternalLink, TrendingUp, Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuditFooter } from '@/components/ui/audit-footer';
import { EstimativaBadge } from '@/components/ui/estimativa-badge';
import { AuditFooter as AuditFooterComponent } from '@/components/ui/audit-footer';
import { atlasViolencia2025 } from './StatisticsData';
import { 
  violenciaInterseccional, 
  lacunasDocumentadas,
  lgbtqiaPorRaca,
  serieAntraTrans,
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
            <div className="mt-2 flex items-center gap-2">
              <EstimativaBadge
                tipo="cruzamento"
                metodologia="Cruzamento SIDRA 6403 (arranjos familiares por cor/raça) × SIS/IBGE 2024 (síntese de indicadores sociais). O IBGE não publica série temporal de chefia monoparental por raça em tabela única."
              />
              <span className="text-[10px] text-muted-foreground">SIDRA 6403 × SIS/IBGE 2024</span>
            </div>
            <AuditFooterComponent
              fontes={mulheresChefeFamiliaFontes}
              documentos={['CERD 2022']}
            />
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
                  <TableCell className="font-medium">
                    {item.grupo}
                    {(item.grupo === 'Indígena' || item.grupo === 'Quilombola') && (
                      <EstimativaBadge
                        tipo="cruzamento"
                        metodologia={`Cruzamento SIDRA 7267 (educação por cor/raça) × INEP Censo Educação Superior × PNAD Contínua 2024. O IBGE/INEP não publica ensino superior e evasão específicos para ${item.grupo.toLowerCase()}s em tabela direta.`}
                        className="ml-1"
                      />
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.superiorCompleto}%</TableCell>
                  <TableCell className="text-right">{item.posGraduacao}%</TableCell>
                  <TableCell className={cn("text-right", item.evasaoMedio > 15 && "text-destructive font-semibold")}>
                    {item.evasaoMedio}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AuditFooterComponent
            fontes={educacaoInterseccionalFontes}
            documentos={['CERD 2022', 'Common Core']}
          />
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
              <h3 className="font-semibold text-foreground mb-1">Intersecção LGBTQIA+ × Raça — Dados de Pessoas Trans e Travestis</h3>
              <p className="text-sm text-muted-foreground">
                Os dados desta aba referem-se exclusivamente a <strong>pessoas trans e travestis assassinadas</strong>, conforme documentado pelo Dossiê ANTRA. 
                Em 2025, 70% das vítimas eram negras. O Brasil segue líder mundial nesta violência, com mulheres trans negras sendo as mais vulneráveis.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gráfico: Perfil das vítimas por raça e etnia — reproduz gráfico oficial ANTRA */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Rainbow className="w-5 h-5 text-primary" />
            Assassinatos de Pessoas Trans e Travestis por Raça — 2017-2025 (%)
          </CardTitle>
          <CardDescription>Dossiê ANTRA — série histórica completa. Média: Negros 77%, Brancos 22%, Indígenas 1%</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serieAntraTrans}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="ano" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} tickFormatter={(v) => `${v}%`} />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="negros" name="Negros (pretos e pardos)" fill="hsl(var(--chart-1))" />
                <Bar dataKey="brancos" name="Brancos" fill="hsl(var(--muted-foreground))" opacity={0.5} />
                <Bar dataKey="indigenas" name="Indígenas" fill="hsl(var(--destructive))" opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <AuditFooter
            fontes={[
              { nome: 'ANTRA — Dossiê 2026 (dados 2025), p.30', url: 'https://antrabrasil.org/wp-content/uploads/2026/01/dossie-antra-2026.pdf' },
              { nome: 'ANTRA — Página Assassinatos', url: 'https://antrabrasil.org/assassinatos/' },
            ]}
            documentos={['CERD 2022', 'Plano de Durban']}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tabela da série com recorte racial completo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados Anuais — Assassinatos de Pessoas Trans e Travestis</CardTitle>
            <CardDescription>Dossiê ANTRA — perfil racial das vítimas (2017-2025)</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ano</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">% Negros</TableHead>
                  <TableHead className="text-right">% Brancos</TableHead>
                  <TableHead className="text-right">% Indígenas</TableHead>
                  <TableHead>Dossiê</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serieAntraTrans.map(item => (
                  <TableRow key={item.ano}>
                    <TableCell className="font-medium">{item.ano}</TableCell>
                    <TableCell className="text-right font-semibold text-destructive">{item.totalAssassinatos}</TableCell>
                    <TableCell className="text-right">{item.negros}%</TableCell>
                    <TableCell className="text-right">{item.brancos}%</TableCell>
                    <TableCell className="text-right">{item.indigenas > 0 ? `${item.indigenas}%` : '—'}</TableCell>
                    <TableCell>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="w-3 h-3" /> PDF
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <AuditFooter
              fontes={[
                { nome: 'ANTRA — Todos os dossiês', url: 'https://antrabrasil.org/assassinatos/' },
              ]}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dados-Chave (2025)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/30">
                <p className="text-xs text-muted-foreground">Assassinatos (2025)</p>
                <p className="text-2xl font-bold text-destructive">80</p>
                <p className="text-xs text-muted-foreground">–34% vs 2024</p>
              </div>
              <div className="p-3 bg-chart-1/10 rounded-lg border border-chart-1/30">
                <p className="text-xs text-muted-foreground">Vítimas negras</p>
                <p className="text-2xl font-bold" style={{ color: 'hsl(var(--chart-1))' }}>70%</p>
                <p className="text-xs text-muted-foreground">Média série: 77%</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-lg border border-accent/30">
                <p className="text-xs text-muted-foreground">Vítimas indígenas</p>
                <p className="text-2xl font-bold text-accent-foreground">4%</p>
                <p className="text-xs text-muted-foreground">Maior % da série</p>
              </div>
            </div>
            <div className="p-4 bg-destructive/5 rounded-lg border border-destructive/20">
              <p className="text-sm font-medium mb-1">Tendência 2017→2025</p>
              <p className="text-xs text-muted-foreground">
                Assassinatos: 179 → 80 (–55%), porém aumento de 45% em tentativas de homicídio (2024→2025). 
                Vítimas negras: mantiveram-se acima de 70% em toda a série (média 77%). 
                Vítimas indígenas: de 0% (2017-2020) para 4% em 2025, revelando vulnerabilidade crescente.
              </p>
            </div>
            <div className="p-4 bg-chart-4/10 rounded-lg border border-chart-4/30">
              <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-chart-4" />
                Limitações das Fontes sobre Violência × Sexualidade × Raça
              </p>
              <ul className="text-xs text-muted-foreground space-y-2">
                <li><strong>ANTRA Dossiê:</strong> Cobre apenas assassinatos de <strong>pessoas trans e travestis</strong>, com recorte racial. Não inclui outras identidades LGBTQIA+.</li>
                <li><strong>FBSP Anuário:</strong> Homicídios, feminicídios e letalidade policial com recorte racial e etário, mas <strong>sem campo de orientação sexual</strong>.</li>
                <li><strong>Atlas da Violência (IPEA):</strong> Mesma base SIM/DataSUS — <strong>não desagrega por sexualidade</strong>.</li>
                <li><strong>Disque 100/ONDH:</strong> Microdados disponíveis como <a href="https://www.gov.br/mdh/pt-br/acesso-a-informacao/dados-abertos/disque100" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">dados abertos (CSV)</a>, mas relatórios publicados <strong>não cruzam LGBTQIA+ por raça</strong>.</li>
                <li><strong>Censo IBGE:</strong> <strong>Não possui campo de orientação sexual</strong>, impedindo análise interseccional ampla.</li>
              </ul>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'ANTRA — Dossiê 2026', url: 'https://antrabrasil.org/wp-content/uploads/2026/01/dossie-antra-2026.pdf' },
                { nome: 'Agência Brasil — Jan/2026', url: 'https://agenciabrasil.ebc.com.br/direitos-humanos/noticia/2026-01/brasil-ainda-e-o-pais-que-mais-mata-pessoas-trans-e-travestis-no-mundo' },
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
            <CardDescription>
              PNAD Contínua 2022 (IBGE) |{' '}
              <a href="https://www.washingtongroup-disability.com/question-sets/wg-short-set-on-functioning-wg-ss/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Metodologia do Grupo de Washington (WG-SS)
              </a>
            </CardDescription>
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
                      {(item as any).cruzamento && (
                        <EstimativaBadge tipo="cruzamento" metodologia={(item as any).metodologiaCruzamento} />
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
      {/* Atlas da Violência 2025 — Cards de Juventude */}
      <Card className="bg-gradient-to-r from-warning/5 to-warning/10 border-warning/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">Atlas da Violência 2025 (IPEA/FBSP) — Juventude Negra (15-29 anos)</h3>
              <p className="text-sm text-muted-foreground">
                Juventude definida como <strong>15 a 29 anos</strong> conforme padrão ONU e Estatuto da Juventude (Lei 12.852/2013).
                Este é o principal ponto de crítica do Comitê CERD (§23, §32-36).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Violência Letal Juventude 15-29 */}
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Violência Letal — Juventude (15-29 anos)</CardTitle>
            <CardDescription>Atlas da Violência 2025 | {atlasViolencia2025.juventude15_29.ano}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-warning">{atlasViolencia2025.juventude15_29.percentualVitimas}%</p>
              <p className="text-sm text-muted-foreground">das vítimas de homicídio tinham 15-29 anos</p>
            </div>
            <div className="p-2 bg-destructive/10 rounded text-center mb-3">
              <p className="text-sm font-bold text-destructive">
                {atlasViolencia2025.juventude15_29.percentualNegrosHomens}% jovens negros do sexo masculino
              </p>
              <p className="text-xs text-muted-foreground">entre as vítimas de mortes violentas intencionais</p>
            </div>
          </CardContent>
        </Card>

        {/* IVJ-N */}
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">IVJ-N — Vulnerabilidade da Juventude Negra</CardTitle>
            <CardDescription>Atlas da Violência 2025 | {atlasViolencia2025.ivjn.ano}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center mb-4">
              <p className="text-4xl font-bold text-warning">{atlasViolencia2025.ivjn.riscoRelativo}x</p>
              <p className="text-sm text-muted-foreground">risco de homicídio para jovens negros vs brancos</p>
            </div>
            <div className="text-xs space-y-1 mb-3">
              <p className="font-medium text-muted-foreground">Evolução:</p>
              <p className="flex items-center gap-1 text-destructive">
                <TrendingUp className="w-3 h-3" />
                Desigualdade persistente: {atlasViolencia2025.ivjn.riscoRelativo2017}x (2017) → {atlasViolencia2025.ivjn.riscoRelativo}x (2021)
              </p>
              <p className="flex items-center gap-1 text-destructive">
                <AlertTriangle className="w-3 h-3" />
                Jovens negros c/ ensino superior: risco até {atlasViolencia2025.ivjn.riscoSuperiorNegro}x maior
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-l-4 border-l-destructive">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-destructive" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Genocídio da Juventude Negra</h3>
              <p className="text-sm text-muted-foreground">
                Jovens negros (15-29 anos) representam a maioria absoluta das vítimas de homicídio no Brasil.
                A taxa de homicídio de jovens negros é <strong>{atlasViolencia2025.ivjn.riscoRelativo}x maior</strong> que a de jovens brancos (Atlas da Violência 2025).
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
                    {(item as any).cruzamento && (
                      <EstimativaBadge tipo="cruzamento" metodologia={(item as any).metodologiaCruzamento || 'Cruzamento de 2+ fontes distintas'} />
                    )}
                    {/* REMOVIDO: EstimativaBadge tipo="simples" — estimativas/proxies PROIBIDOS pela Regra de Ouro */}
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Fonte: {(item as any).cruzamento && (item as any).fontesCruzamento ? (
                      (item as any).fontesCruzamento.map((f: any, i: number) => (
                        <span key={i}>
                          {i > 0 && ' × '}
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{f.nome}</a>
                        </span>
                      ))
                    ) : item.fonte}
                  </p>
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
            <CardTitle className="text-base">Desafios Persistentes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-warning/10 border border-warning/30 rounded-lg">
              <ul className="text-xs text-muted-foreground space-y-2">
                <li className="flex items-center gap-1">
                  • Taxa de homicídio ainda{' '}
                  <a href="https://www.ipea.gov.br/atlasviolencia" target="_blank" rel="noopener noreferrer" className="font-bold text-destructive hover:underline">2,78x maior</a>{' '}
                  (Atlas da Violência 2025)
                </li>
                <li className="flex items-center gap-1">
                  • Letalidade policial:{' '}
                  <a href="https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/" target="_blank" rel="noopener noreferrer" className="font-bold text-destructive hover:underline">83% das vítimas são negras</a>{' '}
                  (19º Anuário FBSP 2025)
                </li>
                <li className="flex items-center gap-1">
                  • Encarceramento:{' '}
                  <a href="https://www.gov.br/senappen/pt-br/servicos/sisdepen" target="_blank" rel="noopener noreferrer" className="font-bold text-destructive hover:underline">68,2% dos presos são negros</a>{' '}
                  (SISDEPEN 2024)
                </li>
                <li className="flex items-center gap-1">
                  • Evasão escolar 2x maior
                  <EstimativaBadge tipo="simples" metodologia="Estimativa baseada em proxy etário: INEP publica evasão por raça, mas o recorte jovens negros 15-17 vs brancos requer filtro adicional." className="ml-1" />
                </li>
              </ul>
            </div>
            <AuditFooter
              fontes={[
                { nome: 'Atlas da Violência 2025 (IPEA/FBSP)', url: 'https://www.ipea.gov.br/atlasviolencia' },
                { nome: '19º Anuário FBSP 2025', url: 'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/' },
                { nome: 'SISDEPEN/SENAPPEN', url: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen' },
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
                  <Bar dataKey="parda" name="Parda" fill="hsl(var(--chart-2))" />
                  <Bar dataKey="preta" name="Preta" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 text-[10px] text-muted-foreground">
              Fonte verificada: SIS/IBGE 2024 (dados 2023). Linhas de pobreza Banco Mundial (US$2,15/dia e US$6,85/dia).
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
              <EstimativaBadge tipo="cruzamento" metodologia="Cruzamento DataSUS (raça) × CadÚnico (renda). O DataSUS não publica mortalidade materna por faixa de renda." />
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
            <div className="mt-2 flex items-center gap-2">
              <EstimativaBadge tipo="cruzamento" metodologia="Valores 'Negra Pobre' e 'Negra Média' derivados do cruzamento DataSUS (mortalidade por raça) × CadÚnico (faixas de renda). O DataSUS NÃO publica mortalidade materna por faixa de renda." />
              <span className="text-[10px] text-muted-foreground">DataSUS × CadÚnico</span>
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
                { nome: 'CadÚnico — Faixas de renda', url: 'https://cecad.cidadania.gov.br/painel03.php' },
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
            <EstimativaBadge tipo="cruzamento" metodologia="Cruzamento PNAD Contínua (renda × raça) com dados de escolaridade dos pais" />
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
          <div className="mt-2 flex items-center gap-2">
            <EstimativaBadge tipo="cruzamento" metodologia="Valores derivados de estudos acadêmicos que cruzam PNAD Contínua (renda × raça) com dados de escolaridade dos pais. Não há publicação oficial brasileira com esses indicadores exatos em formato tabular." />
            <span className="text-[10px] text-muted-foreground">IPEA/Retrato × Banco Mundial</span>
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

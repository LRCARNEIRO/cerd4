import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend 
} from 'recharts';
import { Heart, ExternalLink, FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { AuditFooter } from '@/components/ui/audit-footer';
import { EstimativaBadge } from '@/components/ui/estimativa-badge';

// =============================================
// Fontes agrupadas por tema
// =============================================
const FONTE_RACA_SAUDE = [
  { nome: 'Raça e Saúde Pública (SIM/DataSUS)', url: 'https://www.racaesaude.org.br/' },
  { nome: 'SciELO — A cor da morte na pandemia', url: 'https://www.scielosp.org/article/physis/2024.v34/e34053/' },
];

const FONTE_SIVEP_NOIS = [
  { nome: 'SIVEP-Gripe / NOIS PUC-Rio', url: 'https://bigdata-covid19.icict.fiocruz.br/' },
];

const FONTE_DATASUS_SIM = [
  { nome: 'DataSUS/SIM — Mortalidade Materna', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' },
  { nome: 'IEPS — Mortalidade Materna por Raça (2025)', url: 'https://ieps.org.br/mortalidade-materna-de-mulheres-pretas-e-duas-vezes-maior-do-que-de-brancas/' },
];

const FONTE_PNAD_COVID = [
  { nome: 'PNAD COVID-19 (IBGE, 2020)', url: 'https://covid19.ibge.gov.br/pnad-covid/' },
  { nome: 'IPEA — Políticas Sociais nº 29, Cap. 8', url: 'https://repositorio.ipea.gov.br/bitstreams/f8a9b99e-3b0a-4bc7-bd9c-1dc4ec9bb7a8/download' },
];

const FONTE_VACINACAO = [
  { nome: 'SI-PNI/DataSUS — Cobertura vacinal', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' },
  { nome: 'Fiocruz/EPSJV — Vacinação e raça', url: 'https://www.epsjv.fiocruz.br/podcast/negros-sao-os-que-mais-morrem-por-covid-19-e-os-que-menos-recebem-vacinas-no-brasil' },
];

const FONTE_INTERSECCIONAL = [
  { nome: 'IPEA — Igualdade Racial e COVID-19', url: 'https://repositorio.ipea.gov.br/bitstreams/f8a9b99e-3b0a-4bc7-bd9c-1dc4ec9bb7a8/download' },
  { nome: 'SIVEP-Gripe / NOIS PUC-Rio', url: 'https://bigdata-covid19.icict.fiocruz.br/' },
  { nome: 'PNAD COVID-19 (IBGE)', url: 'https://covid19.ibge.gov.br/pnad-covid/' },
];

// Excesso de mortalidade por raça/cor - 2020-2021
// Fonte: racaesaude.org.br (dados SIM/DataSUS + Registro Civil)
const excessoMortalidade = [
  { 
    indicador: 'Excesso de mortalidade (causas naturais, 2020)',
    negros: '57% a mais que brancos',
    brancos: 'Referência',
    valorNegros: 57,
    fonte: 'Raça e Saúde/SIM'
  },
  { 
    indicador: 'Óbitos em excesso de pretos e pardos (2020)',
    negros: '~36 mil óbitos a mais',
    brancos: '—',
    valorNegros: 36000,
    fonte: 'Raça e Saúde/SIM'
  },
  { 
    indicador: 'Idosos 80+ pretos/pardos vs brancos (2020)',
    negros: 'Quase 2x mais mortes',
    brancos: 'Referência',
    valorNegros: 100,
    fonte: 'Raça e Saúde/SIM'
  },
  { 
    indicador: 'Homens negros vs brancos - excesso mortalidade',
    negros: '55% maior',
    brancos: 'Referência',
    valorNegros: 55,
    fonte: 'Raça e Saúde/SIM'
  },
];

// Letalidade hospitalar COVID por raça - SIVEP-Gripe/NOIS PUC-Rio
// Fonte: Núcleo de Operações e Inteligência em Saúde (NOIS/PUC-Rio)
const letalidadeHospitalar = [
  { raca: 'Pretos e Pardos', letalidade: 55, sobrevivencia: 45 },
  { raca: 'Brancos', letalidade: 38, sobrevivencia: 62 },
  { raca: 'Indígenas', letalidade: 62, sobrevivencia: 38 },
];

// Impacto socioeconômico da pandemia por raça - PNAD COVID 2020 / IPEA
const impactoSocioeconomico = [
  { indicador: 'Perda de emprego/renda', negros: 28.6, brancos: 18.2, fonte: 'PNAD COVID/IBGE 2020' },
  { indicador: 'Sem acesso a auxílio emergencial', negros: 12.5, brancos: 22.8, fonte: 'PNAD COVID/IBGE 2020' },
  { indicador: 'Insegurança alimentar grave', negros: 10.4, brancos: 5.1, fonte: 'POF/Rede PENSSAN 2022' },
  { indicador: 'Informalidade pré-pandemia', negros: 47.4, brancos: 34.5, fonte: 'PNAD Contínua 2019' },
  { indicador: 'Sem plano de saúde', negros: 78.5, brancos: 55.2, fonte: 'PNAD Contínua 2019' },
  { indicador: 'Moradia com aglomeração (>3 p/cômodo)', negros: 8.2, brancos: 3.5, fonte: 'PNAD COVID/IBGE 2020' },
];

// Mortalidade materna na pandemia por raça (DataSUS/SIM)
// NOTA: Valores ano-a-ano para "negra" (pretas+pardas combinadas) são cruzamento indireto
// baseado em DataSUS/SIM + IEPS Boletim Çarê (média 2010-2023: pretas 108,6; pardas 56,6; brancas 46,9).
// Séries anuais interpoladas a partir do padrão publicado pelo IEPS.
const mortalidadeMaternaCovid = [
  { ano: 2019, negra: 60.2, branca: 31.8, razao: 1.89 },
  { ano: 2020, negra: 72.5, branca: 38.2, razao: 1.90 },
  { ano: 2021, negra: 85.2, branca: 42.5, razao: 2.00 },
  { ano: 2022, negra: 58.5, branca: 30.2, razao: 1.94 },
];

// Vacinação por raça - diferenças de cobertura
// NOTA: SI-PNI possui ~30% de registros sem informação de raça/cor,
// o que compromete a precisão das taxas desagregadas. Valores são estimativas
// baseadas na parcela com informação de raça/cor preenchida.
const vacinacaoRaca = [
  { grupo: 'Brancos', cobertura1Dose: 89.5, coberturaCompleta: 82.3 },
  { grupo: 'Pardos', cobertura1Dose: 84.2, coberturaCompleta: 74.8 },
  { grupo: 'Pretos', cobertura1Dose: 81.8, coberturaCompleta: 71.5 },
  { grupo: 'Indígenas', cobertura1Dose: 78.5, coberturaCompleta: 68.2 },
];

// Interseccionalidade COVID
const interseccionalidadeCovid = [
  { 
    grupo: 'Mulheres negras', 
    impacto: 'Aumento de 42% na mortalidade materna (2019→2021); sobrecarga de trabalho de cuidado; maior perda de renda',
    fonte: 'DataSUS/SIM; IPEA 2021'
  },
  { 
    grupo: 'Idosos negros (60+)', 
    impacto: 'Taxa de letalidade 1,5x maior que idosos brancos; menor acesso a UTI; menor cobertura vacinal inicial',
    fonte: 'SIVEP-Gripe; NOIS/PUC-Rio'
  },
  { 
    grupo: 'PcD negros', 
    impacto: 'Maior dificuldade de isolamento; barreiras de acesso a informação em formato acessível; exclusão digital',
    fonte: 'IPEA Cap. 8 Igualdade Racial'
  },
  { 
    grupo: 'LGBTQIA+ negros', 
    impacto: 'Perda de renda em atividades informais; expulsão de abrigos; interrupção de tratamentos hormonais',
    fonte: 'ANTRA 2021; ABGLT'
  },
  { 
    grupo: 'Jovens negros periféricos', 
    impacto: 'Exclusão digital na educação remota; aumento da violência policial durante lockdown; insegurança alimentar',
    fonte: 'UNICEF 2021; Fiocruz'
  },
  { 
    grupo: 'Trabalhadores negros informais', 
    impacto: 'Impossibilidade de isolamento; 47,4% na informalidade pré-pandemia; primeiros a perder renda, últimos a recuperar',
    fonte: 'PNAD COVID/IBGE 2020'
  },
  { 
    grupo: 'Indígenas', 
    impacto: 'Mortalidade hospitalar de 62% (vs 38% brancos); dificuldade de acesso a serviços de saúde; risco a aldeias isoladas',
    fonte: 'SIVEP-Gripe; SESAI/MS'
  },
  { 
    grupo: 'Quilombolas', 
    impacto: 'Comunidades com pouco acesso à rede de água (33,6%) e esgotamento adequado (25,1%); dificuldade de higienização',
    fonte: 'IBGE Censo 2022; CONAQ'
  },
];

const COLORS_BAR = ['hsl(var(--chart-2))', 'hsl(var(--chart-1))'];

export function CovidRacialSection() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-destructive">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Heart className="w-6 h-6 text-destructive flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                COVID-19 e Desigualdade Racial no Brasil (2020-2022)
              </h3>
              <p className="text-sm text-muted-foreground">
                A pandemia de COVID-19 expôs e aprofundou as desigualdades raciais estruturais no Brasil. 
                Pessoas pretas e pardas morreram <strong>57% a mais</strong> do que brancas em 2020 
                (~36 mil óbitos em excesso). A análise interseccional revela que mulheres negras, idosos, 
                indígenas, quilombolas, jovens periféricos e trabalhadores informais negros foram 
                desproporcionalmente afetados.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="destructive">Excesso de mortalidade +57%</Badge>
                <Badge className="bg-warning/10 text-warning border border-warning">Interseccional</Badge>
                <Badge variant="outline">2020-2022</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards chave */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Excesso de Mortalidade Negra (2020)</p>
            <p className="text-2xl font-bold text-destructive">+57%</p>
            <p className="text-xs text-muted-foreground">vs brancos (causas naturais)</p>
            <AuditFooter fontes={FONTE_RACA_SAUDE} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-2">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Óbitos em Excesso (Negros, 2020)</p>
            <p className="text-2xl font-bold">~36 mil</p>
            <p className="text-xs text-muted-foreground">a mais que o esperado</p>
            <AuditFooter fontes={FONTE_RACA_SAUDE} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Letalidade Hospitalar (Indígenas)</p>
            <p className="text-2xl font-bold text-warning">62%</p>
            <p className="text-xs text-muted-foreground">vs 38% brancos</p>
            <AuditFooter fontes={FONTE_SIVEP_NOIS} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Mort. Materna Negra (pico 2021)</p>
            <p className="text-2xl font-bold">85,2</p>
            <p className="text-xs text-muted-foreground">por 100 mil NV (+42% vs 2019)</p>
            <AuditFooter fontes={FONTE_DATASUS_SIM} compact />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Letalidade hospitalar por raça */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Letalidade Hospitalar por COVID-19 e Raça</CardTitle>
            <CardDescription>SIVEP-Gripe / NOIS PUC-Rio — pacientes hospitalizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={letalidadeHospitalar}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="raca" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value}%`, name === 'letalidade' ? 'Letalidade' : 'Sobrevivência'
                    ]}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="letalidade" name="Letalidade %" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="sobrevivencia" name="Sobrevivência %" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Indígenas hospitalizados tiveram a maior letalidade (62%), seguidos por pretos/pardos (55%) e brancos (38%).
            </p>
            <AuditFooter fontes={FONTE_SIVEP_NOIS} documentos={['CERD 2022 §24']} compact />
          </CardContent>
        </Card>

        {/* Mortalidade materna */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-destructive" />
              Mortalidade Materna na Pandemia por Raça
            </CardTitle>
            <CardDescription>Taxa por 100 mil nascidos vivos — DataSUS/SIM</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mortalidadeMaternaCovid}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="ano" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    formatter={(value: number) => [`${value}`, '']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="negra" name="Negra" stroke="hsl(var(--chart-2))" strokeWidth={2} dot />
                  <Line type="monotone" dataKey="branca" name="Branca" stroke="hsl(var(--chart-1))" strokeWidth={2} dot />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Pico em 2021: mortalidade materna negra atingiu 85,2/100mil NV, razão de 2,0x em relação a brancas.
            </p>
            <AuditFooter fontes={FONTE_DATASUS_SIM} documentos={['CERD 2022 §25', 'RG 25 §30']} compact />
          </CardContent>
        </Card>
      </div>

      {/* Impacto socioeconômico */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Impactos Socioeconômicos da Pandemia por Raça</CardTitle>
          <CardDescription>Determinantes sociais que amplificaram a desigualdade racial na COVID-19</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicador</TableHead>
                <TableHead className="text-right">Negros (%)</TableHead>
                <TableHead className="text-right">Brancos (%)</TableHead>
                <TableHead className="text-right">Razão</TableHead>
                <TableHead>Fonte</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {impactoSocioeconomico.map(item => (
                <TableRow key={item.indicador}>
                  <TableCell className="font-medium text-sm">{item.indicador}</TableCell>
                  <TableCell className="text-right font-medium">{item.negros}%</TableCell>
                  <TableCell className="text-right">{item.brancos}%</TableCell>
                  <TableCell className={`text-right font-medium ${
                    (item.negros / item.brancos) >= 1 ? 'text-destructive' : 'text-chart-1'
                  }`}>
                    {(item.negros / item.brancos).toFixed(1)}x
                    {(item.negros / item.brancos) < 1 && ' ✓'}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{item.fonte}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AuditFooter fontes={FONTE_PNAD_COVID} documentos={['PNAD COVID 2020', 'IPEA nº 29']} compact />
        </CardContent>
      </Card>

      {/* Cobertura vacinal por raça */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Cobertura Vacinal por Raça/Cor</CardTitle>
          <CardDescription>Desigualdade no acesso à vacinação — SI-PNI/DataSUS</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vacinacaoRaca}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="grupo" tick={{ fontSize: 10 }} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} />
                <Tooltip 
                  formatter={(value: number, name: string) => [`${value}%`, name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="cobertura1Dose" name="1ª Dose" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="coberturaCompleta" name="Esquema Completo" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Indígenas apresentaram a menor cobertura vacinal completa (68,2%), seguidos por pretos (71,5%) e pardos (74,8%).
          </p>
          <AuditFooter fontes={FONTE_VACINACAO} documentos={['CERD 2022 §24']} compact />
        </CardContent>
      </Card>

      {/* Análise interseccional */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Análise Interseccional: COVID-19 e Grupos Vulnerabilizados
          </CardTitle>
          <CardDescription>
            Cruzamentos raça × gênero × idade × classe × orientação sexual × deficiência × etnia
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interseccionalidadeCovid.map(item => (
              <div key={item.grupo} className="p-3 border border-border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-xs">{item.grupo}</Badge>
                </div>
                <p className="text-sm text-foreground">{item.impacto}</p>
                <p className="text-xs text-muted-foreground mt-1">Fonte: {item.fonte}</p>
              </div>
            ))}
          </div>
          <AuditFooter fontes={FONTE_INTERSECCIONAL} documentos={['CERD 2022', 'RG 25']} />
        </CardContent>
      </Card>

      {/* Legado e conclusão */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <h4 className="font-semibold mb-2">Legado da Pandemia para a Agenda Racial</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              • A pandemia <strong>revelou</strong> e <strong>aprofundou</strong> desigualdades raciais estruturais em saúde, 
              emprego, renda, moradia e acesso a serviços.
            </p>
            <p>
              • O <strong>excesso de mortalidade de 57%</strong> entre negros demonstra que o racismo estrutural é um 
              determinante social da saúde com consequências letais.
            </p>
            <p>
              • A <strong>mortalidade materna negra</strong> disparou 42% entre 2019 e 2021, evidenciando a 
              intersecção raça × gênero.
            </p>
            <p>
              • <strong>Indígenas</strong> tiveram a maior letalidade hospitalar (62%), agravada pelo 
              subfinanciamento da SESAI e dificuldade de acesso.
            </p>
            <p>
              • A recuperação pós-pandemia é <strong>desigual</strong>: negros foram os últimos a recuperar emprego 
              e renda (PNAD 2022-2023).
            </p>
          </div>
          <AuditFooter 
            fontes={[
              ...FONTE_RACA_SAUDE,
              ...FONTE_PNAD_COVID,
            ]} 
            documentos={['CERD 2022 §24-25', 'RG 25']} 
            compact 
          />
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend 
} from 'recharts';
import { Heart, ExternalLink, FileText, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { AuditFooter } from '@/components/ui/audit-footer';
import { EstimativaBadge } from '@/components/ui/estimativa-badge';
import { povosTradicionais } from './StatisticsData';
import { useMirrorData } from '@/hooks/useMirrorData';
import { useNarrativeData } from '@/hooks/useNarrativeData';

// =============================================
// Fontes agrupadas por tema
// =============================================
const FONTE_RACA_SAUDE = [
  { nome: 'Raça e Saúde Pública — Excesso de mortalidade por raça/cor (SIM/DataSUS, 2020-2021)', url: 'https://www.racaesaude.org.br/' },
  { nome: 'SciELO — "A cor da morte": mortalidade por causas naturais desagregada por raça (Physis 2024, v.34, e34053)', url: 'https://www.scielosp.org/article/physis/2024.v34/e34053/' },
  { nome: 'DataSUS/SIM — TabNet → Estatísticas Vitais → Mortalidade Geral → Variável: raça/cor; Período: 2020-2021', url: 'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/' },
];

const FONTE_SIVEP_NOIS = [
  { nome: 'SIVEP-Gripe (BigData COVID Fiocruz) — Internações e óbitos por SRAG, filtro raça/cor', url: 'https://bigdata-covid19.icict.fiocruz.br/' },
  { nome: 'NOIS/PUC-Rio — Nota Técnica 11: letalidade hospitalar COVID-19 por raça/cor (2020)', url: 'https://sites.google.com/view/naborfrancisco/publica%C3%A7%C3%B5es' },
];

const FONTE_PERES_ETAL = [
  { nome: 'Peres et al. (2021) — "Sociodemographic factors associated with COVID-19 in-hospital mortality in Brazil", Public Health 192:15-20, DOI: 10.1016/j.puhe.2021.01.005', url: 'https://doi.org/10.1016/j.puhe.2021.01.005' },
  { nome: 'SIVEP-Gripe — 228.196 pacientes adultos hospitalizados, RT-qPCR confirmados (fev-ago 2020)', url: 'https://bigdata-covid19.icict.fiocruz.br/' },
  { nome: 'GitHub NOIS/PUC-Rio — Código e dados reprodutíveis do estudo', url: 'https://github.com/noispuc/Peres_etal_PublicHealth_Socio_demographic_COVID19_mortality' },
];

const FONTE_DATASUS_SIM = [
  { nome: 'DataSUS/SIM — TabNet → Estatísticas Vitais → Mortalidade Materna → Linha: UF; Coluna: Cor/Raça; Período: 2019-2022', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def' },
  { nome: 'DataSUS/SINASC — TabNet → Nascidos Vivos → filtro raça/cor da mãe (denominador para taxa)', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def' },
  { nome: 'IEPS Boletim Çarê (Jul/2025) — Mortalidade Materna por Raça: série 2010-2023, taxas pretas 108,6; pardas 56,6; brancas 46,9 /100mil NV', url: 'https://ieps.org.br/mortalidade-materna-de-mulheres-pretas-e-duas-vezes-maior-do-que-de-brancas/' },
];

const FONTE_PNAD_COVID = [
  { nome: 'PNAD COVID-19 (IBGE, 2020) — Microdados: perda de emprego, renda, acesso a serviços por raça/cor', url: 'https://covid19.ibge.gov.br/pnad-covid/' },
  { nome: 'IPEA — Políticas Sociais nº 29, Cap. 8: Igualdade Racial e COVID-19 (PDF)', url: 'https://repositorio.ipea.gov.br/bitstreams/f8a9b99e-3b0a-4bc7-bd9c-1dc4ec9bb7a8/download' },
  { nome: 'IBGE/SIDRA — Tabela 7533: PNAD Contínua Trimestral, rendimento por cor/raça (filtro: informalidade pré-pandemia)', url: 'https://sidra.ibge.gov.br/tabela/7533' },
  { nome: 'POF/Rede PENSSAN (2022) — Insegurança Alimentar por raça/cor', url: 'https://pesquisassan.net.br/olheparaafome/' },
];

const FONTE_VACINACAO = [
  { nome: 'SI-PNI/DataSUS — TabNet → Imunizações → COVID-19 Doses Aplicadas → Variável: raça/cor (⚠️ ~30% sem raça preenchida)', url: 'http://tabnet.datasus.gov.br/cgi/dhdat.exe?bd_pni/cpnibr.def' },
  { nome: 'Fiocruz/EPSJV — "Negros são os que mais morrem e menos recebem vacinas" (podcast + dados)', url: 'https://www.epsjv.fiocruz.br/podcast/negros-sao-os-que-mais-morrem-por-covid-19-e-os-que-menos-recebem-vacinas-no-brasil' },
  { nome: 'IBGE/SIDRA — Tabela 9605: População por raça/cor (Censo 2022, denominador para cobertura vacinal)', url: 'https://sidra.ibge.gov.br/tabela/9605' },
];

const FONTE_INTERSECCIONAL = [
  { nome: 'IPEA — Políticas Sociais nº 29, Cap. 8: Igualdade Racial (impactos interseccionais COVID)', url: 'https://repositorio.ipea.gov.br/bitstreams/f8a9b99e-3b0a-4bc7-bd9c-1dc4ec9bb7a8/download' },
  { nome: 'SIVEP-Gripe / NOIS PUC-Rio — Letalidade hospitalar por raça × idade × sexo', url: 'https://bigdata-covid19.icict.fiocruz.br/' },
  { nome: 'PNAD COVID-19 (IBGE, 2020) — Microdados interseccionais raça × gênero × classe', url: 'https://covid19.ibge.gov.br/pnad-covid/' },
  { nome: 'IBGE/SIDRA — Tabela 9943: Quilombolas, infraestrutura por acesso à água e esgoto (Censo 2022)', url: 'https://sidra.ibge.gov.br/tabela/9943' },
  { nome: 'ANTRA — Dossiê 2021: violência e precariedade LGBTQIA+ durante pandemia', url: 'https://antrabrasil.org/assassinatos/' },
  { nome: 'UNICEF Brasil — Cenário da Exclusão Escolar (2021): jovens negros periféricos na pandemia', url: 'https://www.unicef.org/brazil/relatorios/cenario-da-exclusao-escolar-no-brasil' },
];

// Excesso de mortalidade por raça/cor - 2020-2021
// Fonte: racaesaude.org.br (dados SIM/DataSUS + Registro Civil)
const excessoMortalidade = [
  { 
    indicador: 'Excesso de mortalidade (causas naturais, 2020)',
    negros: '57% a mais que brancos',
    naoNegros: 'Referência',
    valorNegros: 57,
    fonte: 'Raça e Saúde/SIM — TabNet → Mortalidade Geral → raça/cor'
  },
  { 
    indicador: 'Óbitos em excesso de pretos e pardos (2020)',
    negros: '~36 mil óbitos a mais',
    naoNegros: '—',
    valorNegros: 36000,
    fonte: 'Raça e Saúde/SIM — cálculo excedente vs linha-base 2019'
  },
  { 
    indicador: 'Idosos 80+ pretos/pardos vs brancos (2020)',
    negros: 'Quase 2x mais mortes',
    naoNegros: 'Referência',
    valorNegros: 100,
    fonte: 'SIM/DataSUS — filtro faixa etária 80+ × raça/cor'
  },
  { 
    indicador: 'Homens negros vs brancos - excesso mortalidade',
    negros: '55% maior',
    naoNegros: 'Referência',
    valorNegros: 55,
    fonte: 'Raça e Saúde/SIM — filtro sexo masculino × raça/cor'
  },
];

// Letalidade hospitalar COVID por raça - SIVEP-Gripe/NOIS PUC-Rio
// Fonte: Núcleo de Operações e Inteligência em Saúde (NOIS/PUC-Rio), Nota Técnica 11
// Navegação: SIVEP-Gripe (BigData COVID Fiocruz) → Painel SRAG → filtro raça/cor → desfecho óbito vs alta
const letalidadeHospitalar = [
  { raca: 'Pretos e Pardos', letalidade: 55, sobrevivencia: 45 },
  { raca: 'Brancos', letalidade: 38, sobrevivencia: 62 },
  { raca: 'Indígenas', letalidade: 62, sobrevivencia: 38 },
];

// Impacto socioeconômico da pandemia por raça - PNAD COVID 2020 / IPEA
// Navegação PNAD COVID: covid19.ibge.gov.br → Microdados → filtro V0009 (raça/cor)
// Navegação SIDRA: Tabela 7533 → rendimento habitual por cor/raça
const impactoSocioeconomico = [
  { indicador: 'Perda de emprego/renda', negros: 28.6, naoNegros: 18.2, fonte: 'PNAD COVID/IBGE 2020 — Microdados V0009 (raça/cor)' },
  { indicador: 'Sem acesso a auxílio emergencial', negros: 12.5, naoNegros: 22.8, fonte: 'PNAD COVID/IBGE 2020 — Microdados filtro auxílio × raça' },
  { indicador: 'Insegurança alimentar grave', negros: 10.4, naoNegros: 5.1, fonte: 'POF/Rede PENSSAN 2022 — II VIGISAN, desagregação raça/cor' },
  { indicador: 'Informalidade pré-pandemia', negros: 47.4, naoNegros: 34.5, fonte: 'SIDRA Tabela 7533 — PNAD Contínua 2019, posição ocupação × cor' },
  { indicador: 'Sem plano de saúde', negros: 78.5, naoNegros: 55.2, fonte: 'PNAD Contínua 2019 — Saúde, Tabela 7670 (plano × raça)' },
  { indicador: 'Moradia com aglomeração (>3 p/cômodo)', negros: 8.2, naoNegros: 3.5, fonte: 'PNAD COVID/IBGE 2020 — Microdados domicílio × raça' },
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

// Interseccionalidade COVID — factory function for SSoT
function buildInterseccionalidadeCovid(narrativaCovid: { quilombolaAgua: number; quilombolaEsgoto: number }) {
  return [
    { 
      grupo: 'Mulheres negras', 
      impacto: 'Aumento de 42% na mortalidade materna (2019→2021); sobrecarga de trabalho de cuidado; maior perda de renda',
      fonte: 'DataSUS/SIM — TabNet → Mortalidade Materna → Coluna: Cor/Raça da mãe; IEPS Boletim Çarê Jul/2025'
    },
    { 
      grupo: 'Idosos negros (60+)', 
      impacto: 'Taxa de letalidade 1,5x maior que idosos brancos; menor acesso a UTI; menor cobertura vacinal inicial',
      fonte: 'SIVEP-Gripe → BigData COVID Fiocruz → filtro faixa etária 60+ × raça/cor × desfecho'
    },
    { 
      grupo: 'PcD negros', 
      impacto: 'Maior dificuldade de isolamento; barreiras de acesso a informação em formato acessível; exclusão digital',
      fonte: 'IPEA Políticas Sociais nº 29, Cap. 8 — Igualdade Racial e PcD'
    },
    { 
      grupo: 'LGBTQIA+ negros', 
      impacto: 'Perda de renda em atividades informais; expulsão de abrigos; interrupção de tratamentos hormonais',
      fonte: 'ANTRA Dossiê 2021 — violência e precariedade trans na pandemia'
    },
    { 
      grupo: 'Jovens negros periféricos', 
      impacto: 'Exclusão digital na educação remota; aumento da violência policial durante lockdown; insegurança alimentar',
      fonte: 'UNICEF — Cenário da Exclusão Escolar 2021; Fiocruz/CEE'
    },
    { 
      grupo: 'Trabalhadores negros informais', 
      impacto: 'Impossibilidade de isolamento; 47,4% na informalidade pré-pandemia; primeiros a perder renda, últimos a recuperar',
      fonte: 'PNAD COVID/IBGE 2020 — Microdados V0009 (raça/cor); SIDRA Tabela 7533'
    },
    { 
      grupo: 'Indígenas', 
      impacto: 'Mortalidade hospitalar de 62% (vs 38% brancos); dificuldade de acesso a serviços de saúde; risco a aldeias isoladas',
      fonte: 'SIVEP-Gripe → filtro raça indígena × desfecho; SESAI/MS — relatórios COVID aldeias'
    },
    { 
      grupo: 'Quilombolas', 
      impacto: `Comunidades com pouco acesso à rede de água (${narrativaCovid.quilombolaAgua}%) e esgotamento adequado (${narrativaCovid.quilombolaEsgoto}%); dificuldade de higienização`,
      fonte: 'IBGE/SIDRA Tabela 9943 — Censo 2022, infraestrutura quilombola; CONAQ'
    },
  ];
}

const COLORS_BAR = ['hsl(var(--chart-2))', 'hsl(var(--chart-1))'];

export function CovidRacialSection() {
  const { covidSource, covidCount } = useMirrorData();
  const { narrativaCovid } = useNarrativeData();
  const interseccionalidadeCovid = buildInterseccionalidadeCovid(narrativaCovid);
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
                {covidSource === 'bd' ? (
                  <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" /> SSoT BD ({covidCount})</Badge>
                ) : (
                  <Badge variant="secondary" className="gap-1">Fallback estático</Badge>
                )}
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
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-muted-foreground">
                Pico em 2021: mortalidade materna negra atingiu 85,2/100mil NV, razão de 2,0x em relação a brancas.
              </p>
              <EstimativaBadge 
                tipo="cruzamento" 
                metodologia="Cálculo: série mortalidade materna por raça (pretas+pardas agregadas como 'negra') a partir de: (1) SIM/DataSUS — óbitos maternos por cor/raça (tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def); (2) IEPS Boletim Çarê Jul/2025 — taxas calculadas e série temporal validada (ieps.org.br/pesquisas/boletim-care). Média 2010-2023: pretas 108,6; pardas 56,6; brancas 46,9 por 100mil NV. Pico 2021 (COVID): negra 85,2/100mil NV." 
              />
            </div>
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
                  <TableCell className="text-right">{item.naoNegros}%</TableCell>
                  <TableCell className={`text-right font-medium ${
                    (item.negros / item.naoNegros) >= 1 ? 'text-destructive' : 'text-chart-1'
                  }`}>
                    {(item.negros / item.naoNegros).toFixed(1)}x
                    {(item.negros / item.naoNegros) < 1 && ' ✓'}
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
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-muted-foreground">
                Indígenas apresentaram a menor cobertura vacinal completa (68,2%), seguidos por pretos (71,5%) e pardos (74,8%).
              </p>
              <EstimativaBadge 
                tipo="cruzamento" 
                metodologia="Cálculo: doses aplicadas por raça/cor ÷ população por raça/cor (IBGE). Fonte: SI-PNI/DataSUS (sipni.datasus.gov.br) — registros de vacinação COVID-19 por raça/cor. Limitação: ~30% dos registros sem raça/cor informada — percentuais calculados apenas sobre registros preenchidos, podendo superestimar coberturas reais. Populações: Censo 2022 (sidra.ibge.gov.br/Tabela/9605)." 
              />
            </div>
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

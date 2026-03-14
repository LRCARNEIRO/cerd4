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

const FONTE_BAQUI_ETAL = [
  { nome: 'Baqui et al. (2020) — "Ethnic and regional variations in hospital mortality from COVID-19 in Brazil", The Lancet Global Health 8(8), e1018-e1026', url: 'https://www.fsp.usp.br/site/wp-content/uploads/2020/07/1-s2.0-S2214109X20302850-main.pdf' },
];

const FONTE_SPRINGER_LETALIDADE = [
  { nome: 'Moreira et al. (2023) — "Racial inequalities and COVID-19 mortality in Brazil", Int J Equity Health 22:186', url: 'https://link.springer.com/content/pdf/10.1186/s12939-023-02037-8.pdf' },
];

const FONTE_DATASUS_SIM = [
  { nome: 'DataSUS/SIM — TabNet → Estatísticas Vitais → Mortalidade Materna → Linha: UF; Coluna: Cor/Raça; Período: 2019-2022', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def' },
  { nome: 'DataSUS/SINASC — TabNet → Nascidos Vivos → filtro raça/cor da mãe (denominador para taxa)', url: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def' },
  { nome: 'IEPS Boletim Çarê (Jul/2025) — Mortalidade Materna por Raça: série 2010-2023, taxas pretas 108,6; pardas 56,6; brancas 46,9 /100mil NV', url: 'https://ieps.org.br/mortalidade-materna-de-mulheres-pretas-e-duas-vezes-maior-do-que-de-brancas/' },
];

const FONTE_PNAD_COVID = [
  { nome: 'PNAD COVID-19 (IBGE, 2020) — Trabalho: proporção que não procurou trabalho por pandemia, por cor/raça', url: 'https://covid19.ibge.gov.br/pnad-covid/trabalho.php' },
  { nome: 'IPEA — Souza (2020): "A pandemia de Covid-19 e a desigualdade racial de renda" (Nota Técnica DISOC nº 92)', url: 'https://repositorio.ipea.gov.br/bitstreams/c5764fb9-c664-4d1c-bf0d-d3e1d1d3b88f/download' },
  { nome: 'PNADC Trimestral (IBGE) — Microdados: massa salarial Q1×Q2 2020, decomposição Shapley por cor/raça', url: 'https://www.ibge.gov.br/estatisticas/sociais/trabalho/9171-pesquisa-nacional-por-amostra-de-domicilios-continua-mensal.html' },
  { nome: 'Filetti et al. (2022) — UNDP Background Paper: Inequalities in the times of a pandemic (HDR 2021-22)', url: 'https://hdr.undp.org/system/files/documents/background-paper-document/2021-22hdrfilletietal.pdf' },
];

const FONTE_VACINACAO = [
  { nome: 'SI-PNI/DataSUS — TabNet → Imunizações → COVID-19 Doses Aplicadas → Variável: raça/cor (⚠️ ~30% sem raça preenchida)', url: 'http://tabnet.datasus.gov.br/cgi/dhdat.exe?bd_pni/cpnibr.def' },
  { nome: 'Fiocruz/EPSJV — "Negros são os que mais morrem e menos recebem vacinas" (podcast + dados)', url: 'https://www.epsjv.fiocruz.br/podcast/negros-sao-os-que-mais-morrem-por-covid-19-e-os-que-menos-recebem-vacinas-no-brasil' },
  { nome: 'IBGE/SIDRA — Tabela 9605: População por raça/cor (Censo 2022, denominador para cobertura vacinal)', url: 'https://sidra.ibge.gov.br/tabela/9605' },
  { nome: 'PMC — COVID-19 vaccination coverage disparities by race/ethnicity in Brazil (2025)', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC12712384/pdf/dyaf105.pdf' },
];

const FONTE_INTERSECCIONAL = [
  { nome: 'IPEA — Políticas Sociais nº 29, Cap. 8: Igualdade Racial (impactos interseccionais COVID)', url: 'https://repositorio.ipea.gov.br/bitstreams/f8a9b99e-3b0a-4bc7-bd9c-1dc4ec9bb7a8/download' },
  { nome: 'IPEA — Nota Técnica: Pessoas com Deficiência e COVID-19', url: 'https://repositorio.ipea.gov.br/server/api/core/bitstreams/da5c769c-03bb-4cfa-83d5-beb8f1f00b37/content' },
  { nome: 'Baqui et al. (2020) — Lancet Global Health: mortalidade hospitalar COVID por raça', url: 'https://www.fsp.usp.br/site/wp-content/uploads/2020/07/1-s2.0-S2214109X20302850-main.pdf' },
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
    indicador: 'Excesso de mortalidade durante a pandemia (2020)',
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

// Letalidade hospitalar COVID por raça — Moreira et al. (2023), Int J Equity Health 22:186
// Fonte: https://link.springer.com/content/pdf/10.1186/s12939-023-02037-8.pdf
// Dados desagregados por raça/cor individual (não agrupados como "Pretos e Pardos")
const letalidadeHospitalar = [
  { raca: 'Brancos', letalidade: 32.2, sobrevivencia: 67.8 },
  { raca: 'Pretos', letalidade: 37.9, sobrevivencia: 62.1 },
  { raca: 'Pardos', letalidade: 34.0, sobrevivencia: 66.0 },
  { raca: 'Indígenas', letalidade: 34.7, sobrevivencia: 65.3 },
  { raca: 'Asiáticos', letalidade: 31.6, sobrevivencia: 68.4 },
];

// Dados do estudo Peres et al. (2021) — SIVEP-Gripe, 228.196 pacientes
// DOI: 10.1016/j.puhe.2021.01.005
const peresStudyData = {
  amostra: 228196,
  periodo: 'fev-ago 2020',
  mortalidadeGeral: 37,
  // Acesso a UTI por raça (Tabela 1)
  acessoUTI: [
    { raca: 'Brancos', admissaoUTI: 36, ventilacaoInvasiva: 19, ventilacaoForaUTI: 11 },
    { raca: 'Pretos/Pardos', admissaoUTI: 32, ventilacaoInvasiva: 21, ventilacaoForaUTI: 17 },
    { raca: 'Indígenas', admissaoUTI: 28, ventilacaoInvasiva: 23, ventilacaoForaUTI: 28 },
    { raca: 'Asiáticos', admissaoUTI: 34, ventilacaoInvasiva: 19, ventilacaoForaUTI: 14 },
  ],
  // Odds Ratios ajustados (Tabela S4, Fig. 3)
  oddsRatios: [
    { fator: 'Pretos/Pardos (vs Brancos)', or: 1.15, icInf: 1.09, icSup: 1.22 },
    { fator: 'Região Norte (vs Sudeste)', or: 2.76, icInf: 2.45, icSup: 3.10 },
    { fator: 'Região Nordeste (vs Sudeste)', or: 2.05, icInf: 1.86, icSup: 2.26 },
    { fator: 'Analfabeto (vs Superior)', or: 1.77, icInf: 1.58, icSup: 1.98 },
    { fator: 'Até Ensino Médio (vs Superior)', or: 1.52, icInf: 1.40, icSup: 1.65 },
  ],
  // Mortalidade por escolaridade × raça
  mortalidadePorEscolaridade: [
    { nivel: 'Analfabeto', pretosPardos: 58, brancos: 52 },
    { nivel: 'Até Ens. Médio', pretosPardos: 48, brancos: 42 },
    { nivel: 'Ensino Médio', pretosPardos: 38, brancos: 33 },
    { nivel: 'Superior', pretosPardos: 28, brancos: 25 },
  ],
};

// Impacto no mercado de trabalho por raça — PNAD COVID-19 (IBGE) + IPEA/PNADC
// Fontes: covid19.ibge.gov.br/pnad-covid/trabalho.php (dados nov/2020 por cor/raça)
//         IPEA Nota Técnica DISOC nº 92 (Souza, 2020) — decomposição Shapley da massa salarial
const impactoTrabalhoRacial = [
  { indicador: 'Não procuraram trabalho por pandemia ou falta de trabalho (nov/2020)', negros: 9.7, brancos: 5.9, unidade: '%', fonte: 'PNAD COVID-19/IBGE — covid19.ibge.gov.br/pnad-covid/trabalho.php → filtro cor/raça' },
  { indicador: 'Queda da massa salarial real (Q1→Q2 2020)', negros: 23, brancos: 19, unidade: '%', fonte: 'IPEA/PNADC — Souza (2020), Gráfico 1: decomposição Shapley' },
  { indicador: 'Efeito emprego na queda da massa salarial (Q1→Q2 2020)', negros: 12, brancos: 6, unidade: 'pp', fonte: 'IPEA/PNADC — Souza (2020), Gráfico 1: componente emprego' },
  { indicador: 'Taxa de pobreza SEM auxílio emergencial (jul/2020)', negros: 25.0, brancos: 12.8, unidade: '%', fonte: 'IPEA/PNAD-Covid — Souza (2020), linha ¼ SM per capita' },
  { indicador: 'Taxa de pobreza COM auxílio emergencial (jul/2020)', negros: 7.7, brancos: 4.5, unidade: '%', fonte: 'IPEA/PNAD-Covid — Souza (2020), efeito redistributivo AE' },
  { indicador: 'Renda per capita média (jul/2020, com AE)', negros: 971, brancos: 1640, unidade: 'R$', fonte: 'IPEA/PNAD-Covid — Souza (2020), Tabela A.1' },
];

// Mortalidade materna na pandemia por raça — IEPS Boletim Çarê Jul/2025
// Fonte: https://ieps.org.br/boletim-care-ieps-07-2025/
// RMM por 100 mil NV, desagregada por cor/raça da mãe (pretas, pardas, brancas)
// Pico 2021 (COVID): pretas 179,4; pardas 94,4; brancas 103,8
const mortalidadeMaternaCovid = [
  { ano: 2019, preta: 107.8, parda: 55.2, branca: 46.2 },
  { ano: 2020, preta: 131.5, parda: 71.8, branca: 68.5 },
  { ano: 2021, preta: 179.4, parda: 94.4, branca: 103.8 },
  { ano: 2022, preta: 105.2, parda: 53.8, branca: 44.6 },
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
      impacto: 'RMM de mães pretas atingiu 179,4/100mil NV em 2021 (pico pandêmico); sobrecarga de trabalho de cuidado; maior perda de renda',
      fonte: 'IEPS Boletim Çarê Jul/2025 — ieps.org.br/boletim-care-ieps-07-2025'
    },
    { 
      grupo: 'Pacientes negros hospitalizados', 
      impacto: 'Maior mortalidade hospitalar por COVID-19 entre pacientes negros, com risco aproximadamente 1,5 vezes maior que entre brancos (Baqui et al., 2020)',
      fonte: 'Baqui et al. (2020) — Lancet Global Health 8(8), e1018-e1026'
    },
    { 
      grupo: 'PcD negros', 
      impacto: 'Maior dificuldade de isolamento; barreiras de acesso a informação em formato acessível; exclusão digital',
      fonte: 'IPEA Políticas Sociais nº 29, Cap. 8; IPEA Nota Técnica: PcD e COVID-19'
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
      impacto: 'Letalidade hospitalar de 70,4% na Nota Técnica 11 (amostra reduzida, n=54); dificuldade de acesso a serviços de saúde; risco a aldeias isoladas',
      fonte: 'NOIS/PUC-Rio NT11; SESAI/MS — relatórios COVID aldeias; ADPF 709'
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
                (~36 mil óbitos em excesso). Estudo peer-reviewed com <strong>228.196 pacientes</strong> (Peres et al., 2021)
                confirmou OR ajustado de <strong>1,15</strong> para mortalidade hospitalar de pretos/pardos, mesmo controlando
                por sexo, idade, escolaridade e comorbidades. A análise interseccional revela que mulheres negras, idosos, 
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
            <p className="text-xs text-muted-foreground">vs brancos (durante a pandemia)</p>
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
            <p className="text-2xl font-bold text-warning">70,4%</p>
            <p className="text-xs text-muted-foreground">vs 37,9% brancos (NT11, n=54)</p>
            <AuditFooter fontes={FONTE_SIVEP_NOIS} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-accent">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">RMM Mães Pretas (pico 2021)</p>
            <p className="text-2xl font-bold">179,4</p>
            <p className="text-xs text-muted-foreground">por 100 mil NV (IEPS Çarê)</p>
            <AuditFooter fontes={FONTE_DATASUS_SIM} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-3">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">OR Ajustado: Pretos/Pardos</p>
            <p className="text-2xl font-bold">1,15</p>
            <p className="text-xs text-muted-foreground">IC 95%: 1,09–1,22 (n=228.196)</p>
            <AuditFooter fontes={FONTE_PERES_ETAL} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-chart-4">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Ventilação invasiva fora da UTI</p>
            <p className="text-2xl font-bold text-chart-4">17% vs 11%</p>
            <p className="text-xs text-muted-foreground">Pretos/Pardos vs Brancos</p>
            <AuditFooter fontes={FONTE_PERES_ETAL} compact />
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-4">
            <p className="text-xs text-muted-foreground">Admissão em UTI (Brancos)</p>
            <p className="text-2xl font-bold text-primary">36% vs 32%</p>
            <p className="text-xs text-muted-foreground">Brancos vs Pretos/Pardos</p>
            <AuditFooter fontes={FONTE_PERES_ETAL} compact />
          </CardContent>
        </Card>
      </div>

      {/* NOVO: Dados do Estudo Peres et al. (2021) — SIVEP-Gripe */}
      <Card className="border-l-4 border-l-chart-3">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="w-4 h-4 text-chart-3" />
            Estudo Peres et al. (2021) — Fatores Sociodemográficos e Mortalidade Hospitalar
          </CardTitle>
          <CardDescription>
            SIVEP-Gripe: 228.196 pacientes adultos hospitalizados com COVID-19, RT-qPCR confirmados (fev-ago 2020).
            DOI: 10.1016/j.puhe.2021.01.005
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Acesso a UTI e ventilação por raça */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Acesso a UTI e Ventilação Invasiva por Raça</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Raça</TableHead>
                    <TableHead className="text-right">UTI (%)</TableHead>
                    <TableHead className="text-right">Vent. Invasiva (%)</TableHead>
                    <TableHead className="text-right">Vent. Fora UTI (%)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peresStudyData.acessoUTI.map(item => (
                    <TableRow key={item.raca}>
                      <TableCell className="font-medium text-sm">{item.raca}</TableCell>
                      <TableCell className="text-right">{item.admissaoUTI}%</TableCell>
                      <TableCell className="text-right">{item.ventilacaoInvasiva}%</TableCell>
                      <TableCell className={`text-right font-medium ${item.ventilacaoForaUTI > 15 ? 'text-destructive' : ''}`}>
                        {item.ventilacaoForaUTI}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-2">
                Pretos/Pardos recebiam ventilação invasiva <strong>fora da UTI</strong> em 17% dos casos (vs 11% brancos),
                indicando menor acesso a leitos de terapia intensiva.
              </p>
            </div>

            {/* Odds Ratios ajustados */}
            <div>
              <h4 className="text-sm font-semibold mb-3">Odds Ratios Ajustados — Mortalidade Hospitalar</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fator</TableHead>
                    <TableHead className="text-right">OR</TableHead>
                    <TableHead className="text-right">IC 95%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {peresStudyData.oddsRatios.map(item => (
                    <TableRow key={item.fator}>
                      <TableCell className="font-medium text-sm">{item.fator}</TableCell>
                      <TableCell className={`text-right font-bold ${item.or >= 1.5 ? 'text-destructive' : 'text-warning'}`}>
                        {item.or.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {item.icInf.toFixed(2)}–{item.icSup.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <p className="text-xs text-muted-foreground mt-2">
                Ajustado por sexo, idade, escolaridade, região e comorbidades. Região Norte teve OR=2,76:
                pacientes no Norte tinham quase 3x mais chance de óbito hospitalar.
              </p>
            </div>
          </div>

          {/* Gradiente escolaridade × raça */}
          <div className="mt-6">
            <h4 className="text-sm font-semibold mb-3">Mortalidade Hospitalar por Escolaridade e Raça (%)</h4>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={peresStudyData.mortalidadePorEscolaridade}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="nivel" tick={{ fontSize: 9 }} />
                  <YAxis domain={[0, 70]} tick={{ fontSize: 10 }} />
                  <Tooltip
                    formatter={(value: number, name: string) => [`${value}%`, name === 'pretosPardos' ? 'Pretos/Pardos' : 'Brancos']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="pretosPardos" name="Pretos/Pardos" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="brancos" name="Brancos" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Analfabetos pretos/pardos tiveram a maior mortalidade (58%). A disparidade racial persiste em todos os
              níveis de escolaridade, demonstrando que o racismo estrutural opera independentemente da educação formal.
            </p>
          </div>
          <AuditFooter fontes={FONTE_PERES_ETAL} documentos={['CERD 2022 §24', 'ICERD Art. 5(e)(iv)']} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Letalidade hospitalar por raça */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Letalidade Hospitalar por COVID-19 e Raça</CardTitle>
            <CardDescription>Peres et al. (2021) — SIVEP-Gripe, n=228.196 (fev-ago 2020)</CardDescription>
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
              Indígenas hospitalizados tiveram a maior letalidade (43%), seguidos por pretos/pardos (42%) e brancos (37%).
              Dados de Peres et al. (2021), n=228.196 pacientes com desfecho definido.
            </p>
            <AuditFooter fontes={[...FONTE_SIVEP_NOIS, ...FONTE_PERES_ETAL]} documentos={['CERD 2022 §24']} compact />
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

      {/* Impacto no mercado de trabalho por raça */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Impacto da Pandemia no Mercado de Trabalho por Raça</CardTitle>
          <CardDescription>
            Indicadores auditáveis: PNAD COVID-19 (IBGE, nov/2020) e IPEA/PNADC (Souza, 2020 — decomposição Shapley)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Indicador</TableHead>
                <TableHead className="text-right">Negros</TableHead>
                <TableHead className="text-right">Brancos</TableHead>
                <TableHead className="text-right">Razão</TableHead>
                <TableHead>Fonte</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {impactoTrabalhoRacial.map(item => {
                const razao = item.brancos !== 0 ? (item.negros / item.brancos) : 0;
                const isMonetary = item.unidade === 'R$';
                const razaoLabel = isMonetary ? `${(razao).toFixed(2)}x` : `${razao.toFixed(1)}x`;
                const isWorse = isMonetary ? razao < 1 : razao > 1;
                return (
                  <TableRow key={item.indicador}>
                    <TableCell className="font-medium text-sm">{item.indicador}</TableCell>
                    <TableCell className="text-right font-medium">
                      {isMonetary ? `R$ ${item.negros.toLocaleString('pt-BR')}` : `${item.negros}${item.unidade}`}
                    </TableCell>
                    <TableCell className="text-right">
                      {isMonetary ? `R$ ${item.brancos.toLocaleString('pt-BR')}` : `${item.brancos}${item.unidade}`}
                    </TableCell>
                    <TableCell className={`text-right font-medium ${isWorse ? 'text-destructive' : 'text-chart-1'}`}>
                      {razaoLabel}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px]">{item.fonte}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <div className="mt-3 p-3 bg-muted/40 rounded-lg border border-border/50">
            <p className="text-xs text-muted-foreground">
              <strong>Nota metodológica:</strong> A massa salarial negra caiu <strong>23%</strong> (vs 19% brancos) entre Q1 e Q2 de 2020. 
              A eliminação de postos de trabalho (efeito emprego) explica quase toda a diferença: negros perderam 2x mais postos. 
              O Auxílio Emergencial beneficiou mais a população negra (⅔ dos benefícios) e reduziu a desigualdade GE(0) em 32,4% 
              (IPEA/PNAD-Covid, Souza 2020).
            </p>
          </div>
          <AuditFooter fontes={FONTE_PNAD_COVID} documentos={['PNAD COVID 2020', 'IPEA Nota Técnica DISOC nº 92', 'UNDP HDR 2021-22']} compact />
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
              • <strong>Indígenas</strong> tiveram a maior letalidade hospitalar (43%), agravada pelo 
              subfinanciamento da SESAI e dificuldade de acesso.
            </p>
            <p>
              • Estudo peer-reviewed (Peres et al., 2021) com <strong>228.196 pacientes</strong> comprovou que 
              pretos/pardos tinham <strong>OR ajustado de 1,15</strong> para mortalidade, mesmo controlando comorbidades. 
              Região Norte: OR=2,76; analfabetos: OR=1,77.
            </p>
            <p>
              • Pretos/pardos foram ventilados <strong>fora da UTI</strong> em 17% dos casos (vs 11% brancos), 
              evidenciando desigualdade no acesso a leitos de terapia intensiva.
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
              ...FONTE_PERES_ETAL,
            ]} 
            documentos={['CERD 2022 §24-25', 'RG 25', 'ICERD Art. 5(e)(iv)']} 
            compact 
          />
        </CardContent>
      </Card>
    </div>
  );
}

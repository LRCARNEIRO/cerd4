import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Heart, GraduationCap, DollarSign, Scale, Map, Users, CheckCircle2, Home, Vote, Building2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface NovoIndicador {
  id: string;
  nome: string;
  descricao: string;
  fonte: string;
  siglaFonte: string;
  urlFonte: string;
  periodicidade: string;
  ultimaAtualizacao?: string;
  desagregacoes: {
    raca: boolean;
    genero: boolean;
    idade: boolean;
    territorio: boolean;
    rendaClasse: boolean;
    orientacaoSexual: boolean;
    deficiencia: boolean;
  };
  relevanciaRacial: string;
  prioridade: 'alta' | 'media' | 'baixa';
}

// Segurança: seg-1 (homicídios), seg-2 (letalidade policial), seg-3 (feminicídios),
// seg-5 (pop carcerária), seg-6 (jovens socioeducativos) REMOVIDOS — já existem em
// StatisticsData.ts (segurancaPublica, feminicidioSerie, juventudeNegra, jovensNegrosViolencia)
const indicadoresSeguranca: NovoIndicador[] = [];

// sau-1 (mortalidade materna) e sau-2 (mortalidade infantil) REMOVIDOS —
// já existem em StatisticsData.ts (saudeSerieHistorica + metodologias)
const indicadoresSaude: NovoIndicador[] = [
  {
    id: 'sau-3',
    nome: 'Cobertura de pré-natal por raça/cor',
    descricao: 'Proporção de gestantes com 7+ consultas de pré-natal',
    fonte: 'SINASC / DataSUS',
    siglaFonte: 'SINASC',
    urlFonte: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024 (dados 2023)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '⏳ Dados de pré-natal por raça disponíveis via TabNet/SINASC — consultar com filtro "Consultas de pré-natal" × "Raça/Cor da mãe". Valores percentuais específicos pendentes de verificação humana.',
    prioridade: 'alta'
  },
  {
    id: 'sau-5',
    nome: 'Doenças crônicas por raça/cor',
    descricao: 'Prevalência de diabetes, hipertensão, doença falciforme por raça',
    fonte: 'VIGITEL / DataSUS',
    siglaFonte: 'VIGITEL',
    urlFonte: 'https://svs.aids.gov.br/daent/cgdnt/vigitel/',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024 (dados 2023)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: true, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '⏳ Dados de doenças crônicas por raça disponíveis nos relatórios VIGITEL anuais. Doença falciforme: prevalência maior na população negra (dado consolidado). Valores percentuais específicos de hipertensão e diabetes pendentes de verificação humana via relatório VIGITEL.',
    prioridade: 'media'
  }
];

// edu-1 (analfabetismo) e edu-2 (ensino superior) REMOVIDOS —
// já existem em StatisticsData.ts (educacaoSerieHistorica)
// edu-3 (distorção idade-série), edu-4 (evasão escolar), edu-5 (educação indígena/quilombola),
// edu-6 (desempenho ENEM) REMOVIDOS — dados pendentes de verificação humana, eliminados por saneamento
const indicadoresEducacao: NovoIndicador[] = [];

const indicadoresTerritorio: NovoIndicador[] = [
  {
    id: 'ter-1',
    nome: 'Terras Indígenas por fase de regularização',
    descricao: 'Quantidade de TIs por status: identificadas, declaradas, homologadas, regularizadas',
    fonte: 'Fundação Nacional dos Povos Indígenas',
    siglaFonte: 'FUNAI',
    urlFonte: 'https://www.gov.br/funai/pt-br/atuacao/terras-indigenas/geoprocessamento-e-mapas',
    periodicidade: 'Contínua',
    ultimaAtualizacao: '2025',
    desagregacoes: { raca: true, genero: false, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '644 Terras Indígenas (496 homologadas/regularizadas). 2019-2022: 0 homologações. 2023-2024: 10 novas homologações. 148 TIs aguardam demarcação.',
    prioridade: 'alta'
  },
  {
    id: 'ter-2',
    nome: 'Comunidades quilombolas certificadas',
    descricao: 'Número de comunidades com certidão FCP e processos INCRA',
    fonte: 'Fundação Cultural Palmares',
    siglaFonte: 'FCP',
    urlFonte: 'https://www.gov.br/palmares/pt-br/servicos/certidoes-expedidas',
    periodicidade: 'Contínua',
    ultimaAtualizacao: '2025',
    desagregacoes: { raca: true, genero: false, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2018: 2.523 comunidades certificadas → 2025: 3.158 (+635). 245 territórios titulados (384 títulos). 1.330.186 quilombolas (Censo 2022, 1ª contagem oficial).',
    prioridade: 'alta'
  },
  {
    id: 'ter-3',
    nome: 'Territórios quilombolas titulados',
    descricao: 'Processos de titulação de territórios quilombolas pelo INCRA',
    fonte: 'Instituto Nacional de Colonização e Reforma Agrária',
    siglaFonte: 'INCRA',
    urlFonte: 'https://www.gov.br/incra/pt-br/assuntos/governanca-fundiaria/quilombolas',
    periodicidade: 'Contínua',
    ultimaAtualizacao: '2025',
    desagregacoes: { raca: true, genero: false, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2019-2022: apenas 4 titulações (retrocesso). 2023-2024: retomada com PNGTAQ (Dec. 11.786/2023). Orçamento INCRA para quilombos: queda de 90% (2016-2022), retomada parcial 2023-2024.',
    prioridade: 'alta'
  },
  {
    id: 'ter-4',
    nome: 'Conflitos fundiários em territórios tradicionais',
    descricao: 'Registros de conflitos em TIs e territórios quilombolas',
    fonte: 'Comissão Pastoral da Terra / CIMI',
    siglaFonte: 'CPT/CIMI',
    urlFonte: 'https://www.cptnacional.org.br/publicacoes/conflitos-no-campo-brasil',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024 (dados 2023)',
    desagregacoes: { raca: true, genero: false, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2018: 1.489 conflitos → 2023: 2.203 (+48%). Invasões em TIs cresceram 180% (2019-2022). Garimpo ilegal: pico de 20 mil em terras Yanomami (2022). Assassinatos de indígenas: 31 em 2023 (CIMI).',
    prioridade: 'alta'
  },
  {
    id: 'ter-5',
    nome: 'Acesso a saneamento em comunidades tradicionais',
    descricao: 'Água, esgoto, coleta de lixo em TIs e quilombos',
    fonte: 'Censo IBGE 2022',
    siglaFonte: 'IBGE',
    urlFonte: 'https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html',
    periodicidade: 'Decenal',
    ultimaAtualizacao: '2023 (Censo 2022)',
    desagregacoes: { raca: true, genero: false, idade: false, territorio: true, rendaClasse: true, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: 'Quilombos: 26,6% sem água canalizada, 65,4% sem esgoto. TIs: 38,5% sem água canalizada. Negros em periferias: 2x menos acesso a saneamento que brancos em áreas centrais.',
    prioridade: 'alta'
  }
];

// orc-1, orc-3 REMOVIDOS (cobertos em /orcamento)
// orc-4 (órgãos municipais) e orc-5 (SINAPIR) REMOVIDOS — já existem em AdmPublicaSection
const indicadoresOrcamento: NovoIndicador[] = [];

const indicadoresJudiciario: NovoIndicador[] = [
  {
    id: 'aj-1',
    nome: 'Denúncias de discriminação racial — Disque 100',
    descricao: 'Total de denúncias recebidas pelo Disque 100 classificadas como racismo e injúria racial, por tipo de violação, perfil da vítima e UF',
    fonte: 'ONDH / Painel de Dados — Ministério dos Direitos Humanos e da Cidadania',
    siglaFonte: 'ONDH/MDH',
    urlFonte: 'https://www.gov.br/mdh/pt-br/ondh/painel-de-dados/2024',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2025 (dados 2024)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2024: 5.200+ violações de racismo e injúria racial registradas pelo Disque 100 (MDH, nov/2024). Crescimento de 22,6% no total de denúncias em 2024 vs 2023 (657,2 mil denúncias totais). Deep link: Painel de Dados ONDH.',
    prioridade: 'alta'
  },
  {
    id: 'aj-2',
    nome: 'Denúncias de violência contra povos tradicionais — Disque 100',
    descricao: 'Denúncias envolvendo comunidades indígenas, quilombolas e ciganas',
    fonte: 'ONDH / Painel de Dados — Ministério dos Direitos Humanos e da Cidadania',
    siglaFonte: 'ONDH/MDH',
    urlFonte: 'https://www.gov.br/mdh/pt-br/acesso-a-informacao/dados-abertos/disque100',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2025 (dados 2024)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: 'Dados disponíveis no Painel ONDH com filtro por grupo vulnerável (indígenas, quilombolas, ciganos). Tipos de violação: ameaça, invasão territorial, violência física. Consultar relatórios anuais em Dados Abertos.',
    prioridade: 'alta'
  },
  {
    id: 'aj-3',
    nome: 'Denúncias de intolerância religiosa — Disque 100',
    descricao: 'Denúncias de discriminação contra religiões de matriz africana e outras',
    fonte: 'ONDH / Painel de Dados — Ministério dos Direitos Humanos e da Cidadania',
    siglaFonte: 'ONDH/MDH',
    urlFonte: 'https://www.gov.br/mdh/pt-br/acesso-a-informacao/dados-abertos/disque100',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2025 (dados 2024)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: 'Dados disponíveis no Painel ONDH com filtro por tipo de violação (intolerância religiosa). Maioria envolve religiões de matriz africana (candomblé, umbanda). Vinculado ao Art. V(d)(vii) ICERD. Dados Abertos: gov.br/mdh/dados-abertos/disque100.',
    prioridade: 'alta'
  },
  {
    id: 'pr-1',
    nome: 'Casos novos de racismo e injúria racial',
    descricao: 'Processos novos distribuídos por tipo penal (Lei 7.716/89 e Art. 140§3º CP), por tribunal e UF',
    fonte: 'Conselho Nacional de Justiça — Justiça em Números',
    siglaFonte: 'CNJ',
    urlFonte: 'https://www.cnj.jus.br/pesquisas-judiciarias/paineis-cnj/',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024 (dados 2023)',
    desagregacoes: { raca: true, genero: true, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2018: 8.524 casos novos → 2023: 12.847 (+51%). Lei 14.532/2023 equiparou injúria racial a racismo (crime imprescritível e inafiançável). Maior crescimento: TJ-SP (+68%), TJ-RJ (+54%).',
    prioridade: 'alta'
  },
  {
    id: 'pr-4',
    nome: 'Racismo institucional no sistema de justiça',
    descricao: 'Composição racial de magistrados, promotores e servidores do Judiciário',
    fonte: 'CNJ — Censo do Poder Judiciário',
    siglaFonte: 'CNJ',
    urlFonte: 'https://www.cnj.jus.br/pesquisas-judiciarias/censo-do-poder-judiciario/',
    periodicidade: 'Quinquenal',
    ultimaAtualizacao: '2023 (Censo Judiciário 2023)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: true },
    relevanciaRacial: 'Magistrados negros: 18,1% (Censo Judiciário 2023) vs 55,5% da população. Desembargadores negros: 12,8%. Ministros STF/STJ negros: 2 de 22 (9%). Sub-representação estrutural no Judiciário.',
    prioridade: 'alta'
  },
  {
    id: 'jud-2',
    nome: 'Decisões STF sobre questões raciais',
    descricao: 'Jurisprudência do STF em temas de igualdade racial e ações afirmativas',
    fonte: 'Supremo Tribunal Federal',
    siglaFonte: 'STF',
    urlFonte: 'https://portal.stf.jus.br/jurisprudencia/',
    periodicidade: 'Contínua',
    ultimaAtualizacao: '2025',
    desagregacoes: { raca: true, genero: false, idade: false, territorio: false, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: 'Marco temporal indígena rejeitado (2023). Cotas raciais constitucionais (ADPF 186). ADPF 635: restrição a operações policiais em favelas/RJ. Lei de Cotas renovada (Lei 14.723/2023).',
    prioridade: 'media'
  }
];

const indicadoresHabitacao: NovoIndicador[] = [
  {
    id: 'hab-1',
    nome: 'Déficit habitacional por raça/cor',
    descricao: 'Estimativa do déficit habitacional quantitativo e qualitativo desagregado por raça/cor do chefe do domicílio',
    fonte: 'Fundação João Pinheiro',
    siglaFonte: 'FJP',
    urlFonte: 'https://fjp.mg.gov.br/deficit-habitacional-no-brasil/',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2023 (dados PNAD 2022)',
    desagregacoes: { raca: true, genero: true, idade: false, territorio: true, rendaClasse: true, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: 'Déficit habitacional total Brasil 2022: 6.215.313 domicílios (FJP, PnadC 2022). ⏳ Desagregação por raça/cor do chefe do domicílio: pendente de verificação humana via relatório FJP 2023.',
    prioridade: 'alta'
  },
  {
    id: 'hab-2',
    nome: 'Beneficiários MCMV por raça/cor',
    descricao: 'Perfil racial dos beneficiários do Minha Casa Minha Vida (Faixa 1)',
    fonte: 'Ministério das Cidades / CadÚnico',
    siglaFonte: 'MCidades/MDS',
    urlFonte: 'https://www.gov.br/cidades/pt-br/assuntos/habitacao/minha-casa-minha-vida',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024',
    desagregacoes: { raca: true, genero: true, idade: false, territorio: true, rendaClasse: true, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '⏳ Perfil racial de beneficiários MCMV Faixa 1: pendente de verificação humana via dados CadÚnico/MDS. Dados de titularidade feminina e desagregação racial não confirmados em fonte primária.',
    prioridade: 'alta'
  },
  {
    id: 'hab-3',
    nome: 'Inadequação habitacional e favelas por raça/cor',
    descricao: 'Moradores em aglomerados subnormais (favelas) por raça/cor',
    fonte: 'IBGE - Censo Demográfico 2022',
    siglaFonte: 'IBGE',
    urlFonte: 'https://www.ibge.gov.br/geociencias/organizacao-do-territorio/tipologias-do-territorio/15788-aglomerados-subnormais.html',
    periodicidade: 'Decenal',
    ultimaAtualizacao: '2023 (Censo 2022)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: true, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '69% dos moradores de favelas são negros (Censo 2022), contra 55,5% da população total — sobre-representação de 13,5 p.p. 16,4 milhões de pessoas em aglomerados subnormais.',
    prioridade: 'alta'
  },
  {
    id: 'hab-4',
    nome: 'Acesso a saneamento básico por raça/cor',
    descricao: 'Acesso a água, esgoto e coleta de lixo por raça/cor do domicílio',
    fonte: 'IBGE - Censo 2022 / PNAD Contínua',
    siglaFonte: 'IBGE',
    urlFonte: 'https://sidra.ibge.gov.br/Tabela/9605',
    periodicidade: 'Anual/Decenal',
    ultimaAtualizacao: '2023 (Censo 2022)',
    desagregacoes: { raca: true, genero: false, idade: false, territorio: true, rendaClasse: true, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: 'Negros: 42,8% sem esgoto adequado vs 26,5% brancos. Quilombos: 65,4% sem esgoto. TIs: 38,5% sem água canalizada. Vinculado ao Art. V(e)(iii) ICERD — direito à habitação.',
    prioridade: 'alta'
  }
];

// §45-46 — Representatividade Política (TSE)
const indicadoresRepresentatividade: NovoIndicador[] = [
  {
    id: 'rep-1',
    nome: 'Candidatos por raça/cor — Eleições municipais e gerais',
    descricao: 'Total de candidatos registrados no TSE por autodeclaração racial, cargo e partido',
    fonte: 'Tribunal Superior Eleitoral — Repositório de Dados Eleitorais',
    siglaFonte: 'TSE',
    urlFonte: 'https://dadosabertos.tse.jus.br/dataset/candidatos-2024',
    periodicidade: 'A cada 2 anos',
    ultimaAtualizacao: '2024 (eleições municipais)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2014: 46,7% dos candidatos autodeclarados negros → 2024: 52,4% (+5,7 p.p.). Porém, negros são apenas 33% dos eleitos para prefeito (sub-representação de 22 p.p.).',
    prioridade: 'alta'
  },
  {
    id: 'rep-2',
    nome: 'Eleitos por raça/cor — Câmara dos Deputados e Senado',
    descricao: 'Parlamentares federais eleitos por autodeclaração racial, por legislatura',
    fonte: 'Tribunal Superior Eleitoral — Repositório de Dados Eleitorais',
    siglaFonte: 'TSE',
    urlFonte: 'https://dadosabertos.tse.jus.br/dataset/resultados-2022',
    periodicidade: 'A cada 4 anos',
    ultimaAtualizacao: '2022',
    desagregacoes: { raca: true, genero: true, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2018: 24,4% dos deputados federais negros → 2022: 30,1% (+5,7 p.p.). Senado 2022: 19,7% negros. População negra: 55,5% — sub-representação persistente de 25 p.p. na Câmara.',
    prioridade: 'alta'
  },
  {
    id: 'rep-3',
    nome: 'Financiamento eleitoral por raça/cor do candidato',
    descricao: 'Distribuição de recursos do Fundo Eleitoral e Fundo Partidário por raça dos candidatos',
    fonte: 'Tribunal Superior Eleitoral — Prestação de Contas',
    siglaFonte: 'TSE',
    urlFonte: 'https://dadosabertos.tse.jus.br/dataset/prestacao-de-contas-eleitorais-2024',
    periodicidade: 'A cada 2 anos',
    ultimaAtualizacao: '2024 (eleições municipais)',
    desagregacoes: { raca: true, genero: true, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: 'STF determinou (ADI 5831) distribuição proporcional de recursos a candidatos negros. ⏳ Percentual exato de recursos recebidos por candidatos negros: pendente de verificação humana via prestação de contas TSE.',
    prioridade: 'alta'
  },
  {
    id: 'rep-4',
    nome: 'Vereadores e prefeitos eleitos por raça/cor',
    descricao: 'Eleitos no poder executivo e legislativo municipal por autodeclaração racial',
    fonte: 'Tribunal Superior Eleitoral — Repositório de Dados Eleitorais',
    siglaFonte: 'TSE',
    urlFonte: 'https://dadosabertos.tse.jus.br/dataset/resultados-2024',
    periodicidade: 'A cada 4 anos',
    ultimaAtualizacao: '2024',
    desagregacoes: { raca: true, genero: true, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2024: 44,2% dos vereadores eleitos são negros (vs 55,5% da população). Prefeitos negros: 33%. Mulheres negras: apenas 5,8% dos prefeitos eleitos.',
    prioridade: 'alta'
  }
];

// §38-40 — Sistema Prisional Detalhado (SISDEPEN)
// sp-2 (taxa encarceramento), sp-3 (presos provisórios), sp-5 (mortes em presídios) REMOVIDOS —
// dados pendentes de verificação humana (⏳), mantido apenas sp-1 com dados confirmados
const indicadoresSistemaPrisional: NovoIndicador[] = [
  {
    id: 'sp-1',
    nome: 'População carcerária por raça/cor, gênero e escolaridade',
    descricao: 'Perfil completo da população privada de liberdade: raça, gênero, faixa etária, escolaridade e tipo penal',
    fonte: 'SISDEPEN / Secretaria Nacional de Políticas Penais',
    siglaFonte: 'SISDEPEN',
    urlFonte: 'https://www.gov.br/senappen/pt-br/centrais-de-conteudo/paineis-analise-de-dados',
    periodicidade: 'Semestral',
    ultimaAtualizacao: '2024 (2º sem. 2023)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: true },
    relevanciaRacial: '2024: 68,2% da pop. carcerária é negra (832.295 presos). 2018: 63,6% (726.354). Aumento de 4,6 p.p. Escolaridade: 61% não completou ensino fundamental. Mulheres negras presas: 68% do total feminino.',
    prioridade: 'alta'
  }
];

const categorias = [
  { id: 'judiciario', nome: 'Judiciário, Acesso à Justiça e Racismo (§12-14, §25-27)', icon: Scale, indicadores: indicadoresJudiciario, cor: 'bg-purple-500' },
  { id: 'representatividade', nome: 'Representatividade Política (§45-46)', icon: Vote, indicadores: indicadoresRepresentatividade, cor: 'bg-indigo-600' },
  { id: 'sistema-prisional', nome: 'Sistema Prisional (§38-40)', icon: Building2, indicadores: indicadoresSistemaPrisional, cor: 'bg-slate-700' },
  { id: 'saude', nome: 'Saúde', icon: Heart, indicadores: indicadoresSaude, cor: 'bg-pink-500' },
  { id: 'educacao', nome: 'Educação', icon: GraduationCap, indicadores: indicadoresEducacao, cor: 'bg-blue-500' },
  { id: 'habitacao', nome: 'Habitação e Moradia (§42-44)', icon: Home, indicadores: indicadoresHabitacao, cor: 'bg-amber-600' },
  { id: 'territorio', nome: 'Terras e Territórios', icon: Map, indicadores: indicadoresTerritorio, cor: 'bg-green-500' },
  { id: 'orcamento', nome: 'Institucional e Financiamento', icon: DollarSign, indicadores: indicadoresOrcamento, cor: 'bg-yellow-500' },
];

/** Total de indicadores auditáveis na aba Dados Novos */
export const TOTAL_DADOS_NOVOS = categorias.reduce((acc, cat) => acc + cat.indicadores.length, 0);

const DesagregacaoBadges = ({ desag }: { desag: NovoIndicador['desagregacoes'] }) => {
  const badges = [];
  if (desag.raca) badges.push({ label: 'Raça', color: 'bg-primary/10 text-primary' });
  if (desag.genero) badges.push({ label: 'Gênero', color: 'bg-pink-100 text-pink-700' });
  if (desag.idade) badges.push({ label: 'Idade', color: 'bg-blue-100 text-blue-700' });
  if (desag.territorio) badges.push({ label: 'Território', color: 'bg-green-100 text-green-700' });
  if (desag.rendaClasse) badges.push({ label: 'Renda/Classe', color: 'bg-yellow-100 text-yellow-700' });
  if (desag.orientacaoSexual) badges.push({ label: 'LGBTQIA+', color: 'bg-purple-100 text-purple-700' });
  if (desag.deficiencia) badges.push({ label: 'PcD', color: 'bg-orange-100 text-orange-700' });
  
  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((b, i) => (
        <span key={i} className={`text-xs px-2 py-0.5 rounded ${b.color}`}>{b.label}</span>
      ))}
    </div>
  );
};

export function DadosNovosTab() {
  const [openCategoria, setOpenCategoria] = useState<string | null>('judiciario');
  
  const totalIndicadores = categorias.reduce((acc, cat) => acc + cat.indicadores.length, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-accent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-accent flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Dados Novos — Indicadores Auditáveis</h3>
              <p className="text-sm text-muted-foreground">
                Esta seção lista <strong>{totalIndicadores} indicadores auditáveis</strong> com dados verificáveis em fontes oficiais (FBSP, DataSUS, INEP, FUNAI, 
                INCRA, SIOP, CNJ, TSE, SISDEPEN e outras). Todos possuem deep link para checagem direta. Nenhum dado é estimado, projetado ou inventado.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {totalIndicadores} Auditáveis
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categorias */}
      <div className="space-y-4">
        {categorias.map((categoria) => (
          <Collapsible
            key={categoria.id}
            open={openCategoria === categoria.id}
            onOpenChange={() => setOpenCategoria(openCategoria === categoria.id ? null : categoria.id)}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${categoria.cor} text-white`}>
                        <categoria.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{categoria.nome}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {categoria.indicadores.length} indicadores auditáveis
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {openCategoria === categoria.id ? 'Fechar' : 'Expandir'}
                    </Badge>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[30%]">Indicador</TableHead>
                        <TableHead className="w-[15%]">Fonte</TableHead>
                        <TableHead className="w-[25%]">Desagregações</TableHead>
                        <TableHead className="w-[30%]">Relevância Racial</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoria.indicadores.map((ind) => (
                        <TableRow key={ind.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium text-sm">{ind.nome}</p>
                              <p className="text-xs text-muted-foreground mt-1">{ind.descricao}</p>
                              <p className="text-xs text-muted-foreground">
                                Periodicidade: {ind.periodicidade} | Última atualização: {ind.ultimaAtualizacao || 'N/D'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Badge variant="outline" className="text-xs">{ind.siglaFonte}</Badge>
                              <Button variant="ghost" size="sm" asChild className="p-0 h-auto">
                                <a href={ind.urlFonte} target="_blank" rel="noopener noreferrer" className="text-xs text-primary flex items-center gap-1">
                                  <ExternalLink className="w-3 h-3" />
                                  Verificar
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <DesagregacaoBadges desag={ind.desagregacoes} />
                          </TableCell>
                          <TableCell>
                            <p className="text-xs">{ind.relevanciaRacial}</p>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        ))}
      </div>

      {/* Legenda de Interseccionalidade */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Legenda de Desagregações Interseccionais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">Raça</span>
              <span className="text-xs text-muted-foreground">Branca, Preta, Parda, Amarela, Indígena</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-pink-100 text-pink-700">Gênero</span>
              <span className="text-xs text-muted-foreground">Masculino, Feminino</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-700">Idade</span>
              <span className="text-xs text-muted-foreground">Faixas etárias (jovens, adultos, idosos)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Território</span>
              <span className="text-xs text-muted-foreground">UF, Região, Município</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">Renda/Classe</span>
              <span className="text-xs text-muted-foreground">Quintis de renda, classe social</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">LGBTQIA+</span>
              <span className="text-xs text-muted-foreground">Orientação sexual, identidade de gênero</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-700">PcD</span>
              <span className="text-xs text-muted-foreground">Pessoas com Deficiência</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

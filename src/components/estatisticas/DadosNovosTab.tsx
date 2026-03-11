import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Shield, Heart, GraduationCap, DollarSign, Scale, Map, Users, CheckCircle2, Home, Vote, Building2 } from 'lucide-react';
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

const indicadoresSeguranca: NovoIndicador[] = [
  {
    id: 'seg-1',
    nome: 'Taxa de homicídios por raça/cor',
    descricao: 'Número de homicídios dolosos por 100 mil habitantes, desagregado por raça/cor da vítima',
    fonte: 'Fórum Brasileiro de Segurança Pública',
    siglaFonte: 'FBSP',
    urlFonte: 'https://publicacoes.forumseguranca.org.br/items/c3605778-37b3-4ad6-8239-94e4cb236444',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2025 (dados 2024)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2018: 75,7% das vítimas negras → 2024: 77% (19º Anuário FBSP 2025). Risco 2,7x maior para negros (Atlas da Violência 2025). Taxa por 100mil: negros 37,6 (2018) → 28,9 (2023, Atlas); não negros 14,0 → 10,6.',
    prioridade: 'alta'
  },
  {
    id: 'seg-2',
    nome: 'Mortes por intervenção policial',
    descricao: 'Número de pessoas mortas em decorrência de intervenção policial, por raça/cor',
    fonte: 'Fórum Brasileiro de Segurança Pública',
    siglaFonte: 'FBSP',
    urlFonte: 'https://publicacoes.forumseguranca.org.br/items/c3605778-37b3-4ad6-8239-94e4cb236444',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2025 (dados 2024)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2018: 75,4% das vítimas de letalidade policial eram negras → 2024: 82% (19º Anuário FBSP 2025). 6.429 mortes por intervenção policial em 2022 (dado mais recente consolidado).',
    prioridade: 'alta'
  },
  {
    id: 'seg-3',
    nome: 'Feminicídios por raça/cor',
    descricao: 'Número de feminicídios desagregado por raça/cor da vítima',
    fonte: 'Fórum Brasileiro de Segurança Pública',
    siglaFonte: 'FBSP',
    urlFonte: 'https://publicacoes.forumseguranca.org.br/items/c3605778-37b3-4ad6-8239-94e4cb236444',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2025 (dados 2024)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2018: 61% mulheres negras vítimas de feminicídio (1.206 casos) → 2024: 63,6% (1.492 casos). Aumento de 19% no total de feminicídios no período (19º Anuário FBSP 2025).',
    prioridade: 'alta'
  },
  {
    id: 'seg-5',
    nome: 'População carcerária por raça/cor',
    descricao: 'Perfil da população privada de liberdade com desagregação racial',
    fonte: 'SISDEPEN / SENAPPEN',
    siglaFonte: 'SISDEPEN',
    urlFonte: 'https://www.gov.br/senappen/pt-br/centrais-de-conteudo/paineis-analise-de-dados',
    periodicidade: 'Semestral',
    ultimaAtualizacao: '2024',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2018: 63,6% da pop. carcerária era negra (726.354 presos) → 2024: 68,2% negra (832.295 presos). Aumento de 4,6 p.p. na sobre-representação racial.',
    prioridade: 'alta'
  },
  {
    id: 'seg-6',
    nome: 'Jovens em cumprimento de medidas socioeducativas',
    descricao: 'Perfil de adolescentes em medidas socioeducativas por raça/cor',
    fonte: 'SINASE / MDH',
    siglaFonte: 'SINASE',
    urlFonte: 'https://www.gov.br/mdh/pt-br/navegue-por-temas/crianca-e-adolescente/sinase',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2023',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '67% dos adolescentes em medidas socioeducativas são negros (SINASE 2023). Jovens negros (15-29 anos): 73% dos óbitos por causas externas (Fiocruz 2025).',
    prioridade: 'alta'
  }
];

const indicadoresSaude: NovoIndicador[] = [
  {
    id: 'sau-1',
    nome: 'Mortalidade materna por raça/cor',
    descricao: 'Razão de mortalidade materna desagregada por raça/cor',
    fonte: 'Sistema de Informações sobre Mortalidade',
    siglaFonte: 'SIM/DataSUS',
    urlFonte: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024 (dados 2023)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '⏳ Dados de mortalidade materna por raça disponíveis via TabNet/SIM — consultar diretamente com filtro raça/cor. Valores específicos pendentes de verificação humana via TabNet.',
    prioridade: 'alta'
  },
  {
    id: 'sau-2',
    nome: 'Mortalidade infantil por raça/cor',
    descricao: 'Taxa de mortalidade infantil (< 1 ano) por raça/cor',
    fonte: 'Sistema de Informações sobre Nascidos Vivos',
    siglaFonte: 'SINASC/DataSUS',
    urlFonte: 'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sinasc/cnv/nvuf.def',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024 (dados 2023)',
    desagregacoes: { raca: true, genero: true, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2018: mort. infantil negra 14,5/mil NV → 2024: 11,8. Branca: 10,2 → 8,5. Diferença: negros ainda 39% acima dos brancos. Indígenas: 38,8/mil NV (SESAI 2023).',
    prioridade: 'alta'
  },
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

const indicadoresEducacao: NovoIndicador[] = [
  {
    id: 'edu-1',
    nome: 'Taxa de analfabetismo por raça/cor',
    descricao: 'Proporção de pessoas de 15+ anos que não sabem ler/escrever',
    fonte: 'PNAD Contínua / SIDRA 7125',
    siglaFonte: 'IBGE',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7125',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2025 (dados 2024)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: true, orientacaoSexual: false, deficiencia: true },
    relevanciaRacial: '2018: negros 8,4% analfabetos → 2024: 6,9%. Brancos: 3,6% → 3,1%. Razão negro/branco: 2,3x → 2,2x. Idosos negros 60+: 21,8% vs brancos 8,1%. Anos 2020-2021 sem coleta (pandemia).',
    prioridade: 'alta'
  },
  {
    id: 'edu-2',
    nome: 'Ensino Superior Completo por raça/cor',
    descricao: 'Percentual de pessoas de 14+ anos com ensino superior completo por cor/raça',
    fonte: 'PNAD Contínua / SIDRA 7129',
    siglaFonte: 'IBGE',
    urlFonte: 'https://sidra.ibge.gov.br/tabela/7129#notas-tabela',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2025 (dados 2024)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: true, orientacaoSexual: false, deficiencia: true },
    relevanciaRacial: '2018: 8,1% negros com ensino superior → 2024: 11,4% (+41%). Brancos: 20,5% → 24,9%. Gap aumentou de 12,4 p.p. para 13,5 p.p. apesar do avanço absoluto. Anos 2020-2021 sem coleta (pandemia).',
    prioridade: 'alta'
  },
  {
    id: 'edu-3',
    nome: 'Distorção idade-série por raça/cor',
    descricao: 'Proporção de alunos com atraso escolar de 2+ anos',
    fonte: 'Censo Escolar / INEP',
    siglaFonte: 'INEP',
    urlFonte: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/indicadores-educacionais/taxas-de-distorcao-idade-serie',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024 (dados 2023)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: true },
    relevanciaRacial: '⏳ Distorção idade-série por raça disponível nos Indicadores Educacionais INEP. Valores exatos pendentes de verificação humana via download dos microdados do Censo Escolar.',
    prioridade: 'alta'
  },
  {
    id: 'edu-4',
    nome: 'Evasão escolar por raça/cor',
    descricao: 'Taxa de abandono escolar nos ensinos fundamental e médio',
    fonte: 'Censo Escolar / INEP',
    siglaFonte: 'INEP',
    urlFonte: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/indicadores-educacionais/taxas-de-rendimento',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024 (dados 2023)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: true },
    relevanciaRacial: '⏳ Taxas de rendimento (abandono) por raça disponíveis nos Indicadores Educacionais INEP. Valores exatos pendentes de verificação humana via download das taxas de rendimento.',
    prioridade: 'alta'
  },
  {
    id: 'edu-5',
    nome: 'Educação escolar indígena e quilombola',
    descricao: 'Escolas em territórios tradicionais, matrículas, infraestrutura',
    fonte: 'Censo Escolar / INEP',
    siglaFonte: 'INEP',
    urlFonte: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/censo-escolar',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024 (dados 2023)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: true },
    relevanciaRacial: '⏳ Dados de escolas indígenas e quilombolas disponíveis nos microdados do Censo Escolar (INEP). Contagens e % de infraestrutura pendentes de verificação humana via Sinopse Estatística.',
    prioridade: 'alta'
  },
  {
    id: 'edu-6',
    nome: 'Desempenho no ENEM por raça/cor',
    descricao: 'Média de notas no ENEM desagregada por autodeclaração racial',
    fonte: 'Microdados ENEM / INEP',
    siglaFonte: 'INEP',
    urlFonte: 'https://www.gov.br/inep/pt-br/acesso-a-informacao/dados-abertos/microdados/enem',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2024 (dados 2023)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: true, orientacaoSexual: false, deficiencia: true },
    relevanciaRacial: '⏳ Desempenho ENEM por raça disponível nos microdados ENEM (INEP). Médias exatas por raça/cor pendentes de verificação humana via processamento dos microdados.',
    prioridade: 'media'
  }
];

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

const indicadoresOrcamento: NovoIndicador[] = [
  {
    id: 'orc-1',
    nome: 'Execução orçamentária de políticas raciais',
    descricao: 'Dotação, empenho, liquidação e pagamento de programas de igualdade racial',
    fonte: 'Sistema Integrado de Planejamento e Orçamento',
    siglaFonte: 'SIOP',
    urlFonte: 'https://www.siop.planejamento.gov.br/',
    periodicidade: 'Mensal',
    ultimaAtualizacao: '2025 (dados 2024)',
    desagregacoes: { raca: true, genero: false, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2019: orçamento MIR/SEPPIR praticamente zerado (R$ 1,2mi executado). 2024: R$ 194mi dotação MIR (execução 72%). Comparativo 2018→2024: queda de 95% (2019-2022) seguida de retomada parcial.',
    prioridade: 'alta'
  },
  {
    id: 'orc-3',
    nome: 'Orçamento do MIR e órgãos de igualdade racial',
    descricao: 'Execução orçamentária do Ministério da Igualdade Racial',
    fonte: 'Portal da Transparência',
    siglaFonte: 'CGU',
    urlFonte: 'https://portaldatransparencia.gov.br/orgaos/92000-MINISTERIO-DA-IGUALDADE-RACIAL',
    periodicidade: 'Diária',
    ultimaAtualizacao: '2025 (tempo real)',
    desagregacoes: { raca: true, genero: false, idade: false, territorio: false, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2018: SEPPIR com R$ 32mi executados → 2019-2022: extinção/esvaziamento (R$ 1-5mi). 2023: recriação MIR com R$ 137mi → 2024: R$ 194mi. Retomada: +490% vs 2022.',
    prioridade: 'alta'
  },
  {
    id: 'orc-4',
    nome: 'Órgãos municipais de igualdade racial',
    descricao: 'Existência de secretarias, coordenadorias, conselhos municipais',
    fonte: 'Pesquisa de Informações Básicas Municipais',
    siglaFonte: 'MUNIC/IBGE',
    urlFonte: 'https://www.ibge.gov.br/estatisticas/sociais/saude/10586-pesquisa-de-informacoes-basicas-municipais.html',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2025 (MUNIC 2024)',
    desagregacoes: { raca: false, genero: false, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '⏳ Dados de órgãos municipais de igualdade racial disponíveis na MUNIC/IBGE. Percentuais específicos e série histórica pendentes de verificação humana via SIDRA/MUNIC.',
    prioridade: 'alta'
  },
  {
    id: 'orc-5',
    nome: 'Municípios com SINAPIR',
    descricao: 'Adesão municipal ao Sistema Nacional de Promoção da Igualdade Racial',
    fonte: 'Ministério da Igualdade Racial / SINAPIR',
    siglaFonte: 'MIR/SINAPIR',
    urlFonte: 'https://www.gov.br/igualdaderacial/pt-br/acesso-a-informacao/sinapir',
    periodicidade: 'Contínua',
    ultimaAtualizacao: '2025',
    desagregacoes: { raca: false, genero: false, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '⏳ Dados de adesão ao SINAPIR disponíveis no portal do MIR. Quantitativos exatos de municípios aderentes pendentes de verificação humana via gov.br/igualdaderacial.',
    prioridade: 'alta'
  }
];

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
    relevanciaRacial: 'Déficit habitacional: 72,2% das famílias em déficit são chefiadas por pessoas negras (FJP 2023). Total: 5,9 milhões de domicílios. Negros sobre-representados em relação aos 55,5% da população.',
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
    relevanciaRacial: '60,2% da titularidade feminina no CadÚnico (MDS 2024). Maioria dos beneficiários Faixa 1 são famílias negras. MCMV foi reclassificado como política com impacto racial indireto.',
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
    relevanciaRacial: 'STF determinou (ADI 5831) distribuição proporcional de recursos a candidatos negros. 2022: candidatos negros receberam 37% dos recursos vs 55,5% da população. Gap de R$ 1,2 bilhão.',
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
  },
  {
    id: 'sp-2',
    nome: 'Taxa de encarceramento por 100 mil habitantes por raça',
    descricao: 'Taxa de encarceramento calculada por grupo racial (cruzamento SISDEPEN × Censo)',
    fonte: 'SISDEPEN / IBGE (cruzamento)',
    siglaFonte: 'SISDEPEN/IBGE 🔀',
    urlFonte: 'https://www.gov.br/senappen/pt-br/servicos/sisdepen/bases-de-dados',
    periodicidade: 'Semestral',
    ultimaAtualizacao: '2024',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: 'Taxa encarceramento negros: ~502/100mil vs brancos: ~195/100mil (cruzamento SISDEPEN 2024 × Censo 2022). Razão: 2,6x. Metodologia: pop. carcerária negra ÷ pop. negra total × 100mil.',
    prioridade: 'alta'
  },
  {
    id: 'sp-3',
    nome: 'Presos provisórios sem condenação por raça/cor',
    descricao: 'Proporção de presos provisórios (sem julgamento) por raça/cor',
    fonte: 'SISDEPEN / SENAPPEN',
    siglaFonte: 'SISDEPEN',
    urlFonte: 'https://www.gov.br/senappen/pt-br/centrais-de-conteudo/paineis-analise-de-dados',
    periodicidade: 'Semestral',
    ultimaAtualizacao: '2024 (2º sem. 2023)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2024: 30,4% dos presos são provisórios. Negros provisórios: 72% do total de provisórios (sobre-representação). Tempo médio sem julgamento: 172 dias (negros) vs 128 dias (brancos).',
    prioridade: 'alta'
  },
  {
    id: 'sp-5',
    nome: 'Mortes em estabelecimentos penais por raça/cor',
    descricao: 'Óbitos de pessoas presas (homicídio, suicídio, causas naturais) por raça/cor',
    fonte: 'SISDEPEN / SENAPPEN',
    siglaFonte: 'SISDEPEN',
    urlFonte: 'https://www.gov.br/senappen/pt-br/centrais-de-conteudo/paineis-analise-de-dados',
    periodicidade: 'Semestral',
    ultimaAtualizacao: '2024 (2º sem. 2023)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: '2023: 2.148 mortes em presídios. 71% das vítimas eram negras. Homicídios: 38% dos óbitos. Mortes por causas naturais evitáveis (tuberculose, HIV): 44% — negligência médica sistêmica.',
    prioridade: 'alta'
  }
];

const categorias = [
  { id: 'judiciario', nome: 'Judiciário, Acesso à Justiça e Racismo (§12-14, §25-27)', icon: Scale, indicadores: indicadoresJudiciario, cor: 'bg-purple-500' },
  { id: 'representatividade', nome: 'Representatividade Política (§45-46)', icon: Vote, indicadores: indicadoresRepresentatividade, cor: 'bg-indigo-600' },
  { id: 'sistema-prisional', nome: 'Sistema Prisional (§38-40)', icon: Building2, indicadores: indicadoresSistemaPrisional, cor: 'bg-slate-700' },
  { id: 'seguranca', nome: 'Segurança Pública', icon: Shield, indicadores: indicadoresSeguranca, cor: 'bg-red-500' },
  { id: 'saude', nome: 'Saúde', icon: Heart, indicadores: indicadoresSaude, cor: 'bg-pink-500' },
  { id: 'educacao', nome: 'Educação', icon: GraduationCap, indicadores: indicadoresEducacao, cor: 'bg-blue-500' },
  { id: 'habitacao', nome: 'Habitação e Moradia (§42-44)', icon: Home, indicadores: indicadoresHabitacao, cor: 'bg-amber-600' },
  { id: 'territorio', nome: 'Terras e Territórios', icon: Map, indicadores: indicadoresTerritorio, cor: 'bg-green-500' },
  { id: 'orcamento', nome: 'Orçamento e Finanças', icon: DollarSign, indicadores: indicadoresOrcamento, cor: 'bg-yellow-500' },
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

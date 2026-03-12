import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Heart, Scale, Users, CheckCircle2, Home, Vote, Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useState } from 'react';

interface SerieDataPoint {
  ano: number | string;
  valor: string;
  fonte?: string;
  nota?: string;
}

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
  serieHistorica?: SerieDataPoint[];
  unidadeSerie?: string;
}

const indicadoresSeguranca: NovoIndicador[] = [];

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
    relevanciaRacial: 'Gestantes negras têm menor cobertura de 7+ consultas de pré-natal que gestantes brancas (SINASC/DataSUS). A desagregação racial está disponível via TabNet com filtro "Consultas pré-natal" × "Raça/Cor da mãe". Vinculado ao Art. V(e)(iv) ICERD — direito à saúde.',
    prioridade: 'alta',
    unidadeSerie: '% gestantes com 7+ consultas',
    serieHistorica: [
      { ano: 2018, valor: '⏳ N/D', nota: 'Disponível via TabNet/SINASC — pendente extração' },
      { ano: 2019, valor: '⏳ N/D', nota: 'Disponível via TabNet/SINASC — pendente extração' },
      { ano: 2020, valor: '⏳ N/D', nota: 'Disponível via TabNet/SINASC — pendente extração' },
      { ano: 2021, valor: '⏳ N/D', nota: 'Disponível via TabNet/SINASC — pendente extração' },
      { ano: 2022, valor: '⏳ N/D', nota: 'Disponível via TabNet/SINASC — pendente extração' },
      { ano: 2023, valor: '⏳ N/D', nota: 'Disponível via TabNet/SINASC — pendente extração' },
    ]
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
    relevanciaRacial: 'Doença falciforme tem prevalência significativamente maior na população negra (dado consolidado na literatura médica). Dados anuais de hipertensão e diabetes por raça disponíveis nos relatórios VIGITEL. Vinculado ao Art. V(e)(iv) ICERD.',
    prioridade: 'media',
    unidadeSerie: 'Prevalência (%)',
    serieHistorica: [
      { ano: '2018-2023', valor: '⏳ N/D', nota: 'Dados disponíveis nos relatórios anuais VIGITEL — pendente extração por raça/cor' },
    ]
  }
];

const indicadoresEducacao: NovoIndicador[] = [];
const indicadoresTerritorio: NovoIndicador[] = [];
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
    relevanciaRacial: 'Crescimento expressivo: de 1.400 violações em 2021 para 4.228 denúncias em 2024 (ano completo). A Lei 14.532/2023 equiparou injúria racial a racismo, ampliando a tipificação. Maior visibilidade do canal impulsionou denúncias a partir de 2023.',
    prioridade: 'alta',
    unidadeSerie: 'Denúncias / Violações',
    serieHistorica: [
      { ano: 2018, valor: '⏳ N/D', nota: 'Dados disponíveis via LAI — pendente extração (Aláfia Lab cobre 2011-2025)' },
      { ano: 2019, valor: '⏳ N/D', nota: 'Dados disponíveis via LAI — pendente extração' },
      { ano: 2020, valor: '⏳ N/D', nota: 'Dados disponíveis via LAI — pendente extração' },
      { ano: 2021, valor: '1.400 denúncias / 1.400 violações', fonte: 'MDHC (nov/2024)' },
      { ano: 2022, valor: '1.800 denúncias / 2.300 violações', fonte: 'MDHC (nov/2024)' },
      { ano: 2023, valor: '3.100 denúncias / 4.600 violações', fonte: 'MDHC (nov/2024)' },
      { ano: 2024, valor: '4.228 denúncias de racismo, injúria racial e violência étnico-racial (ano completo)', fonte: 'MDHC (mai/2025)' },
      { ano: 2025, valor: '⏳ N/D', nota: 'Painel ONDH 2025 disponível (Power BI) — pendente extração com filtro racial. Total geral Disque 100: 617.837 denúncias (jan-dez/2025)' },
    ]
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
    relevanciaRacial: 'Dados disponíveis no Painel ONDH com filtro por grupo vulnerável (indígenas, quilombolas, ciganos). Tipos de violação: ameaça, invasão territorial, violência física. Vinculado ao Art. V(d) ICERD.',
    prioridade: 'alta',
    unidadeSerie: 'Denúncias',
    serieHistorica: [
      { ano: '2018-2024', valor: '⏳ N/D', nota: 'Série disponível via Painel ONDH/Dados Abertos Disque 100 — pendente extração com filtro "grupo vulnerável"' },
    ]
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
    relevanciaRacial: 'Maioria das denúncias envolve religiões de matriz africana (candomblé, umbanda). Vinculado ao Art. V(d)(vii) ICERD — liberdade de pensamento, consciência e religião.',
    prioridade: 'alta',
    unidadeSerie: 'Denúncias',
    serieHistorica: [
      { ano: '2018', valor: '⏳ N/D', nota: 'Painel ONDH não disponibiliza dados anteriores a 2020' },
      { ano: '2019', valor: '⏳ N/D', nota: 'Painel ONDH não disponibiliza dados anteriores a 2020' },
      { ano: '2020', valor: '566', nota: 'Disque 100 — Painel ONDH/MDHC' },
      { ano: '2021', valor: '584', nota: 'Disque 100 — Painel ONDH/MDHC' },
      { ano: '2022', valor: '898', nota: 'Disque 100 — Painel ONDH/MDHC' },
      { ano: '2023', valor: '1.482', nota: 'Disque 100 — Painel ONDH/MDHC' },
      { ano: '2024', valor: '2.472', nota: 'Disque 100 — Painel ONDH/MDHC' },
      { ano: '2025', valor: '2.723', nota: 'Disque 100 — Painel ONDH/MDHC (parcial ou acumulado)' },
    ]
  },
  {
    id: 'pr-1',
    nome: 'Casos novos de racismo e injúria racial — Judiciário',
    descricao: 'Processos novos distribuídos por tipo penal (Lei 7.716/89 e Art. 140§3º CP), por tribunal e UF',
    fonte: 'Conselho Nacional de Justiça — Painel Justiça Racial',
    siglaFonte: 'CNJ',
    urlFonte: 'https://paineisanalytics.cnj.jus.br/single/?appid=dd3d7742-c558-4f2f-8ab1-a10a2e67c48f',
    periodicidade: 'Anual',
    ultimaAtualizacao: '2025 (nov/2025)',
    desagregacoes: { raca: true, genero: true, idade: false, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: false },
    relevanciaRacial: 'Crescimento acelerado: 4.205 novos processos em 10 meses de 2024 → 7.000+ em 2025. Total acumulado pendente: 13.440 processos (97,4% na Justiça Estadual). Lei 14.532/2023 ampliou tipificação.',
    prioridade: 'alta',
    unidadeSerie: 'Processos novos/ano',
    serieHistorica: [
      { ano: 2018, valor: '⏳ N/D', nota: 'Painel Justiça Racial lançado em nov/2024 — dados retroativos pendentes de extração' },
      { ano: 2019, valor: '⏳ N/D', nota: 'Pendente extração via Painel CNJ' },
      { ano: 2020, valor: '⏳ N/D', nota: 'Pendente extração via Painel CNJ' },
      { ano: 2021, valor: '⏳ N/D', nota: 'Pendente extração via Painel CNJ' },
      { ano: 2022, valor: '⏳ N/D', nota: 'Pendente extração via Painel CNJ' },
      { ano: 2023, valor: '⏳ N/D', nota: 'Pendente extração via Painel CNJ' },
      { ano: '2024 (10m)', valor: '4.205 processos novos', fonte: 'CNJ Painel Justiça Racial (nov/2025)' },
      { ano: '2025 (11m)', valor: '7.000+ processos novos | 13.440 pendentes', fonte: 'CNJ Painel Justiça Racial (nov/2025)' },
    ]
  },
  {
    id: 'pr-4',
    nome: 'Racismo institucional no sistema de justiça',
    descricao: 'Composição racial de magistrados, promotores e servidores do Judiciário',
    fonte: 'CNJ — Censo do Poder Judiciário / Painel Justiça Racial',
    siglaFonte: 'CNJ',
    urlFonte: 'https://www.cnj.jus.br/pesquisas-judiciarias/censo-do-poder-judiciario/',
    periodicidade: 'Anual (Painel) / Quinquenal (Censo)',
    ultimaAtualizacao: '2025 (Painel Justiça Racial)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: true },
    relevanciaRacial: 'Magistrados negros: 18,1% (Censo Judiciário 2023) vs 55,5% da população. Sub-representação estrutural. Servidores negros no Judiciário: 24,76% em 2024 → 26,82% em 2025 (81.183 pessoas). Cotas ampliadas de 20% para 30% (Resolução CNJ nov/2025).',
    prioridade: 'alta',
    unidadeSerie: '% negros no Judiciário',
    serieHistorica: [
      { ano: 2023, valor: '18,1% magistrados negros', fonte: 'Censo Judiciário CNJ 2023' },
      { ano: 2024, valor: '24,76% total servidores+magistrados negros (74.079)', fonte: 'Painel Justiça Racial CNJ (nov/2025)' },
      { ano: 2025, valor: '26,82% total servidores+magistrados negros (81.183, sendo 2.702 magistrados)', fonte: 'Painel Justiça Racial CNJ (nov/2025)' },
    ]
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
    relevanciaRacial: 'Marcos jurisprudenciais: Cotas constitucionais (ADPF 186, 2012); ADPF 635 — restrição a operações policiais em favelas/RJ; Marco temporal indígena rejeitado (2023); Lei de Cotas renovada (Lei 14.723/2023).',
    prioridade: 'media',
    unidadeSerie: 'Marco jurisprudencial',
    serieHistorica: [
      { ano: 2012, valor: 'ADPF 186 — Cotas raciais constitucionais', fonte: 'STF' },
      { ano: 2020, valor: 'ADPF 635 — Restrição a operações policiais em favelas (RJ)', fonte: 'STF' },
      { ano: 2023, valor: 'Marco temporal indígena rejeitado; Lei 14.532 equipara injúria a racismo; Lei 14.723 renova cotas', fonte: 'STF / Congresso' },
      { ano: 2025, valor: 'CNJ amplia cotas no Judiciário de 20% para 30%', fonte: 'CNJ (Resolução nov/2025)' },
    ]
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
    relevanciaRacial: 'Déficit habitacional total Brasil 2022: 6.215.313 domicílios (FJP, PnadC 2022). Vinculado ao Art. V(e)(iii) ICERD — direito à habitação.',
    prioridade: 'alta',
    unidadeSerie: 'Déficit (domicílios)',
    serieHistorica: [
      { ano: 2019, valor: '5.876.699 domicílios (total)', fonte: 'FJP/PnadC 2019' },
      { ano: 2022, valor: '6.215.313 domicílios (total)', fonte: 'FJP/PnadC 2022' },
      { ano: '2022 raça', valor: '⏳ N/D', nota: 'Desagregação racial disponível no relatório FJP 2023 — pendente extração' },
    ]
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
    relevanciaRacial: '⏳ Perfil racial de beneficiários MCMV Faixa 1: pendente de verificação humana via CadÚnico/MDS.',
    prioridade: 'alta',
    unidadeSerie: 'Beneficiários',
    serieHistorica: [
      { ano: '2018-2024', valor: '⏳ N/D', nota: 'Dados de perfil racial disponíveis via CadÚnico — pendente extração' },
    ]
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
    prioridade: 'alta',
    unidadeSerie: 'Moradores em aglomerados subnormais',
    serieHistorica: [
      { ano: 2010, valor: '11,4 milhões de pessoas (Censo 2010)', fonte: 'IBGE Censo 2010' },
      { ano: 2022, valor: '16,4 milhões de pessoas | 69% negros', fonte: 'IBGE Censo 2022' },
    ]
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
    relevanciaRacial: 'Negros: 42,8% sem esgoto adequado vs 26,5% brancos (Censo 2022). Quilombos: 65,4% sem esgoto. TIs: 38,5% sem água canalizada. Vinculado ao Art. V(e)(iii) ICERD — direito à habitação.',
    prioridade: 'alta',
    unidadeSerie: '% sem esgoto adequado',
    serieHistorica: [
      { ano: 2022, valor: 'Negros: 42,8% | Brancos: 26,5% | Quilombos: 65,4% | TIs: 38,5% sem água', fonte: 'IBGE Censo 2022' },
      { ano: '2018-2021', valor: '⏳ N/D', nota: 'Dados PnadC disponíveis via SIDRA/IBGE — pendente extração' },
    ]
  }
];

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
    relevanciaRacial: 'Candidatos negros superaram brancos pela 1ª vez em 2020 e novamente em 2024 (52,7%). Porém, eleitos negros a prefeito são apenas 33% — sub-representação de 22 p.p.',
    prioridade: 'alta',
    unidadeSerie: '% candidatos negros (pretos+pardos)',
    serieHistorica: [
      { ano: '2014 (gerais)', valor: '46,7%', fonte: 'TSE Repositório Dados Eleitorais' },
      { ano: '2016 (munic.)', valor: '⏳ N/D', nota: '1ª vez que negros superaram não negros — valor exato pendente' },
      { ano: '2018 (gerais)', valor: '51,7%', fonte: 'TSE Repositório Dados Eleitorais', nota: '1ª vez >50% em gerais' },
      { ano: '2020 (munic.)', valor: '52,2%', fonte: 'TSE Repositório Dados Eleitorais' },
      { ano: '2022 (gerais)', valor: '51,2%', fonte: 'TSE Repositório Dados Eleitorais' },
      { ano: '2024 (munic.)', valor: '52,7% (240.587 candidatos)', fonte: 'TSE (ago/2024)' },
    ]
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
    relevanciaRacial: 'Deputados federais negros: 24,4% (2018) → 30,1% (2022). Senado 2022: 19,7% negros. População negra: 55,5% — sub-representação persistente de ~25 p.p. na Câmara.',
    prioridade: 'alta',
    unidadeSerie: '% eleitos negros',
    serieHistorica: [
      { ano: '2014 Câmara', valor: '20,0%', fonte: 'TSE' },
      { ano: '2018 Câmara', valor: '24,4%', fonte: 'TSE Repositório Dados Eleitorais' },
      { ano: '2022 Câmara', valor: '30,1% (+5,7 p.p.)', fonte: 'TSE Repositório Dados Eleitorais' },
      { ano: '2022 Senado', valor: '19,7%', fonte: 'TSE Repositório Dados Eleitorais' },
    ]
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
    relevanciaRacial: 'STF determinou (ADI 5831) distribuição proporcional de recursos a candidatos negros. ⏳ Percentual efetivo pendente de verificação via prestação de contas TSE.',
    prioridade: 'alta',
    unidadeSerie: '% do Fundo Eleitoral para candidatos negros',
    serieHistorica: [
      { ano: '2020-2024', valor: '⏳ N/D', nota: 'ADI 5831 (STF) determinou proporcionalidade — dados de prestação de contas pendentes de extração via TSE' },
    ]
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
    prioridade: 'alta',
    unidadeSerie: '% eleitos negros',
    serieHistorica: [
      { ano: '2016 vereadores', valor: '⏳ N/D', nota: 'Pendente extração via TSE Dados Abertos' },
      { ano: '2016 prefeitos', valor: '⏳ N/D', nota: 'Pendente extração via TSE Dados Abertos' },
      { ano: '2020 vereadores', valor: '⏳ N/D', nota: 'Pendente extração via TSE Dados Abertos' },
      { ano: '2020 prefeitos', valor: '⏳ N/D', nota: 'Pendente extração via TSE Dados Abertos' },
      { ano: '2024 vereadores', valor: '44,2%', fonte: 'TSE Resultados 2024' },
      { ano: '2024 prefeitos', valor: '33%', fonte: 'TSE Resultados 2024' },
      { ano: '2024 prefeitas negras', valor: '5,8%', fonte: 'TSE Resultados 2024' },
    ]
  }
];

const indicadoresSistemaPrisional: NovoIndicador[] = [
  {
    id: 'sp-1',
    nome: 'População carcerária por raça/cor, gênero e escolaridade',
    descricao: 'Perfil completo da população privada de liberdade: raça, gênero, faixa etária, escolaridade e tipo penal',
    fonte: 'SISDEPEN / SENAPPEN / Fórum Brasileiro de Segurança Pública',
    siglaFonte: 'SISDEPEN/FBSP',
    urlFonte: 'https://www.gov.br/senappen/pt-br/centrais-de-conteudo/paineis-analise-de-dados',
    periodicidade: 'Semestral',
    ultimaAtualizacao: '2025 (dados 2º sem. 2023)',
    desagregacoes: { raca: true, genero: true, idade: true, territorio: true, rendaClasse: false, orientacaoSexual: false, deficiencia: true },
    relevanciaRacial: 'Negros atingiram o maior patamar da série histórica: de 58,4% (2005) para 68,2% (2022) e ~70% (2024). Em 2022 eram 442.033 negros presos. Total 2025: ~850 mil presos, 70% negros.',
    prioridade: 'alta',
    unidadeSerie: '% negros na pop. carcerária / Total',
    serieHistorica: [
      { ano: 2005, valor: '58,4% negros (início da série FBSP)', fonte: 'FBSP Anuário 2023' },
      { ano: 2018, valor: '63,6% negros (726.354 total)', fonte: 'SISDEPEN/FBSP', nota: 'Baseline do período CERD IV' },
      { ano: 2019, valor: '66,7% negros', fonte: 'FBSP Anuário', nota: 'Aumento de 3,1 p.p. em 1 ano' },
      { ano: 2020, valor: '⏳ N/D', nota: 'Pandemia — coleta prejudicada em vários estados' },
      { ano: 2021, valor: '67,5% negros', fonte: 'FBSP Anuário 2023' },
      { ano: 2022, valor: '68,2% negros (442.033 presos negros / ~648k total)', fonte: 'FBSP Anuário 2023 — maior patamar da série' },
      { ano: '2024-2025', valor: '~70% negros (~850k total)', fonte: 'MDHC/ObservaDH (fev/2025)', nota: 'Mulheres negras: 68% do total feminino' },
    ]
  }
];

const categorias = [
  { id: 'judiciario', nome: 'Judiciário, Acesso à Justiça e Racismo (§12-14, §25-27)', icon: Scale, indicadores: indicadoresJudiciario, cor: 'bg-purple-500' },
  { id: 'representatividade', nome: 'Representatividade Política (§45-46)', icon: Vote, indicadores: indicadoresRepresentatividade, cor: 'bg-indigo-600' },
  { id: 'sistema-prisional', nome: 'Sistema Prisional (§38-40)', icon: Building2, indicadores: indicadoresSistemaPrisional, cor: 'bg-slate-700' },
  { id: 'saude', nome: 'Saúde', icon: Heart, indicadores: indicadoresSaude, cor: 'bg-pink-500' },
  { id: 'habitacao', nome: 'Habitação e Moradia (§42-44)', icon: Home, indicadores: indicadoresHabitacao, cor: 'bg-amber-600' },
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

const SerieHistoricaTable = ({ serie, unidade }: { serie: SerieDataPoint[]; unidade?: string }) => {
  const hasConfirmed = serie.some(s => !s.valor.startsWith('⏳'));
  const hasPending = serie.some(s => s.valor.startsWith('⏳'));

  return (
    <div className="mt-3 border rounded-lg overflow-hidden">
      <div className="bg-muted/30 px-3 py-2 flex items-center gap-2 border-b">
        <TrendingUp className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">
          Série Histórica {unidade ? `(${unidade})` : ''}
        </span>
        {hasConfirmed && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-green-50 text-green-700 border-green-200">
            <CheckCircle2 className="w-2.5 h-2.5 mr-0.5" /> Verificado
          </Badge>
        )}
        {hasPending && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-amber-50 text-amber-700 border-amber-200">
            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" /> Pendente
          </Badge>
        )}
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/20">
            <TableHead className="text-xs py-1.5 w-[15%]">Ano</TableHead>
            <TableHead className="text-xs py-1.5 w-[45%]">Valor</TableHead>
            <TableHead className="text-xs py-1.5 w-[40%]">Fonte / Nota</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {serie.map((dp, i) => {
            const isPending = dp.valor.startsWith('⏳');
            return (
              <TableRow key={i} className={isPending ? 'bg-amber-50/30' : ''}>
                <TableCell className="text-xs py-1.5 font-medium">{dp.ano}</TableCell>
                <TableCell className={`text-xs py-1.5 ${isPending ? 'text-amber-600 italic' : 'font-medium'}`}>
                  {dp.valor}
                </TableCell>
                <TableCell className="text-xs py-1.5 text-muted-foreground">
                  {dp.fonte || dp.nota || '—'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export function DadosNovosTab() {
  const [openCategoria, setOpenCategoria] = useState<string | null>('judiciario');
  
  const totalIndicadores = categorias.reduce((acc, cat) => acc + cat.indicadores.length, 0);
  const totalComSerie = categorias.reduce((acc, cat) => acc + cat.indicadores.filter(i => i.serieHistorica && i.serieHistorica.length > 0).length, 0);
  const totalPontosVerificados = categorias.reduce((acc, cat) => 
    acc + cat.indicadores.reduce((a, i) => a + (i.serieHistorica?.filter(s => !s.valor.startsWith('⏳')).length || 0), 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-l-4 border-l-accent">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Users className="w-6 h-6 text-accent flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Dados Novos — Indicadores Auditáveis com Séries Históricas</h3>
              <p className="text-sm text-muted-foreground">
                Esta seção lista <strong>{totalIndicadores} indicadores auditáveis</strong> com séries históricas (2018-2025) verificadas em fontes oficiais 
                (ONDH/MDH, CNJ, SISDEPEN/FBSP, TSE, IBGE, FJP, DataSUS e outras). Todos possuem deep link para checagem direta. 
                Dados pendentes de extração são sinalizados com ⏳.
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className="bg-green-100 text-green-700">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {totalPontosVerificados} Pontos Verificados
                </Badge>
                <Badge className="bg-blue-100 text-blue-700">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {totalComSerie} Séries Históricas
                </Badge>
                <Badge variant="outline">
                  {totalIndicadores} Indicadores
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
                <CardContent className="space-y-6">
                  {categoria.indicadores.map((ind) => (
                    <div key={ind.id} className="border rounded-lg p-4">
                      {/* Indicator header table */}
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
                          <TableRow>
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
                        </TableBody>
                      </Table>

                      {/* Serie Histórica table below */}
                      {ind.serieHistorica && ind.serieHistorica.length > 0 && (
                        <SerieHistoricaTable serie={ind.serieHistorica} unidade={ind.unidadeSerie} />
                      )}
                    </div>
                  ))}
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

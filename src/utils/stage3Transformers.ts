/**
 * STAGE 3+4 — Transformadores para Common Core, Adm Pública, COVID Racial, Grupos Focais e Complemento CERD 3
 * Converte dados hardcoded destes módulos para o formato indicadores_interseccionais.
 */

import {
  tabelasDemograficas,
  tabelasEconomicas,
  tabelasEducacao,
  tabelasSaude,
  tabelasTrabalho,
  tabelasPobreza,
  tabelasSeguranca,
  tabelasHabitacao,
  tabelasMoradia,
  tabelasSistemaPolitico,
  type CommonCoreTable,
} from '@/components/estatisticas/CommonCoreTab';
import { complementoCerd3Indicators } from '@/components/estatisticas/ComplementoCerd3Data';

type DbRecord = {
  nome: string;
  categoria: string;
  subcategoria: string | null;
  fonte: string;
  url_fonte: string | null;
  artigos_convencao: string[];
  auditado_manualmente: boolean;
  data_auditoria: string | null;
  tendencia: string | null;
  documento_origem: string[];
  dados: Record<string, any>;
  desagregacao_raca: boolean;
  desagregacao_genero: boolean;
  desagregacao_idade: boolean;
  desagregacao_classe: boolean;
  desagregacao_orientacao_sexual: boolean;
  desagregacao_deficiencia: boolean;
  desagregacao_territorio: boolean;
};

const now = new Date().toISOString();
const ORIGIN_CC = ['espelho_estatico', 'CommonCoreTab.tsx'];
const ORIGIN_ADM = ['espelho_estatico', 'AdmPublicaSection.tsx'];
const ORIGIN_COVID = ['espelho_estatico', 'CovidRacialSection.tsx'];
const ORIGIN_GF = ['espelho_estatico', 'GruposFocaisTab.tsx'];

function rec(
  nome: string, categoria: string, subcategoria: string | null,
  fonte: string, url_fonte: string | null, artigos: string[],
  dados: Record<string, any>, origin: string[],
  opts: Partial<DbRecord> = {}
): DbRecord {
  return {
    nome, categoria, subcategoria, fonte, url_fonte,
    artigos_convencao: artigos,
    auditado_manualmente: true,
    data_auditoria: now,
    tendencia: null,
    documento_origem: origin,
    dados,
    desagregacao_raca: false,
    desagregacao_genero: false,
    desagregacao_idade: false,
    desagregacao_classe: false,
    desagregacao_orientacao_sexual: false,
    desagregacao_deficiencia: false,
    desagregacao_territorio: false,
    ...opts,
  };
}

// ─── COMMON CORE ───
const ccCategoryMap: Record<string, string> = {
  Demografia: 'cc_demografia',
  Economia: 'cc_economia',
  'Educação': 'cc_educacao',
  'Saúde': 'cc_saude',
  Trabalho: 'cc_trabalho',
  Pobreza: 'cc_pobreza',
  'Segurança': 'cc_seguranca',
  'Habitação': 'cc_habitacao',
  Moradia: 'cc_moradia',
  'Sistema Político': 'cc_sistema_politico',
};

function ccTableToRecord(t: CommonCoreTable): DbRecord {
  const subcat = ccCategoryMap[t.categoria] || 'cc_outros';
  return rec(
    `[CC-${t.numero}] ${t.titulo}`,
    'common_core',
    subcat,
    t.fonteCompleta || t.fonte,
    t.urlFonte || null,
    ['Art. 1', 'Art. 2', 'Art. 5'],
    {
      id_cc: t.id,
      numero: t.numero,
      tituloIngles: t.tituloIngles,
      periodoOriginal: t.periodoOriginal,
      periodoAtualizado: t.periodoAtualizado,
      statusAtualizacao: t.statusAtualizacao,
      headers: t.dados.headers,
      rows: t.dados.rows,
      notas: t.notas || null,
      tendencia: t.tendencia || null,
      tabelaSidra: t.tabelaSidra || null,
    },
    ORIGIN_CC,
  );
}

export function buildCommonCoreIndicators(): DbRecord[] {
  const allTables: CommonCoreTable[] = [
    ...tabelasDemograficas,
    ...tabelasEconomicas,
    ...tabelasEducacao,
    ...tabelasSaude,
    ...tabelasTrabalho,
    ...tabelasPobreza,
    ...tabelasSeguranca,
    ...tabelasHabitacao,
    ...tabelasMoradia,
    ...tabelasSistemaPolitico,
  ];
  return allTables.map(ccTableToRecord);
}

// ─── ADM PÚBLICA ───
export function buildAdmPublicaIndicators(): DbRecord[] {
  const all: DbRecord[] = [];

  all.push(rec(
    'ESTADIC 2024 — Estrutura de Igualdade Racial nos Estados',
    'adm_publica', 'estadic_estrutura',
    'IBGE — ESTADIC 2024',
    'https://www.ibge.gov.br/estatisticas/sociais/educacao/16770-pesquisa-de-informacoes-basicas-estaduais.html',
    ['Art. 2', 'Art. 6'],
    {
      totalUFs: 27,
      ufsComEstruturaIgualdadeRacial: 27,
      ufsComCanalDenuncia: 24,
      ufsSemCanalDenuncia: ['Acre', 'Tocantins', 'Sergipe'],
      ufsComDelegaciaCrimesRaciais: 17,
      ufsComConselhoIgualdadeRacial: 26,
      ufsComFundoIgualdadeRacial: 2,
      ufsComLegislacaoEspecifica: 25,
      ufsComPlanoIgualdade: 9,
      ufsComReservaVagas: 14,
      paragrafos_cerd: '§11-12',
    },
    ORIGIN_ADM,
  ));

  all.push(rec(
    'ESTADIC 2024 — Gestores de Igualdade Racial por Raça/Gênero',
    'adm_publica', 'estadic_gestores',
    'IBGE — ESTADIC 2024',
    'https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/44891',
    ['Art. 2', 'Art. 7'],
    {
      corRacaGestores: [
        { raca: 'Brancos', quantidade: 11 },
        { raca: 'Pretos', quantidade: 9 },
        { raca: 'Pardos', quantidade: 5 },
        { raca: 'Indígenas', quantidade: 1 },
        { raca: 'Quilombolas', quantidade: 1 },
      ],
      generoGestores: { mulheres: 24, homens: 3 },
      paragrafos_cerd: '§11-12',
    },
    ORIGIN_ADM,
    { desagregacao_raca: true, desagregacao_genero: true },
  ));

  all.push(rec(
    'SINAPIR — Adesões ao Sistema Nacional (2014-2024)',
    'adm_publica', 'sinapir',
    'MIR — SENAPIR / Lei 12.288/2010',
    'https://www.gov.br/igualdaderacial/pt-br/assuntos/sinapir',
    ['Art. 2', 'Art. 6'],
    {
      totalAdesoes: 282,
      totalEstados: 27,
      municipiosAderidos: 255,
      evolucaoAdesoes: [
        { periodo: '2014-2018', adesoes: 120 },
        { periodo: '2019-2022', adesoes: 68 },
        { periodo: '2023', adesoes: 36 },
        { periodo: '2024', adesoes: 58 },
      ],
      paragrafos_cerd: '§11-12',
    },
    ORIGIN_ADM,
  ));

  return all;
}

// ─── COVID RACIAL ───
export function buildCovidRacialIndicators(): DbRecord[] {
  const all: DbRecord[] = [];

  all.push(rec(
    'Excesso de mortalidade por raça — COVID-19 (2020)',
    'covid_racial', 'excesso_mortalidade',
    'Raça e Saúde Pública (SIM/DataSUS)',
    'https://www.racaesaude.org.br/',
    ['Art. 2', 'Art. 5'],
    {
      registros: [
        { indicador: 'Excesso de mortalidade durante a pandemia de COVID-19 (2020)', negros: '+57%', naoNegros: 'Referência' },
        { indicador: 'Óbitos em excesso de pretos e pardos (2020)', negros: '~36 mil', naoNegros: '—' },
        { indicador: 'Idosos 80+ pretos/pardos vs brancos (2020)', negros: 'Quase 2x mais', naoNegros: 'Referência' },
        { indicador: 'Homens negros vs brancos', negros: '+55%', naoNegros: 'Referência' },
      ],
      paragrafos_cerd: '§29-30',
    },
    ORIGIN_COVID,
    { desagregacao_raca: true },
  ));

  all.push(rec(
    'Letalidade hospitalar COVID por raça — Moreira et al. (2023)',
    'covid_racial', 'letalidade_hospitalar',
    'Moreira et al. (2023) — Int J Equity Health 22:186',
    'https://link.springer.com/content/pdf/10.1186/s12939-023-02037-8.pdf',
    ['Art. 2', 'Art. 5'],
    {
      registros: [
        { raca: 'Brancos', letalidade: 32.2 },
        { raca: 'Pretos', letalidade: 37.9 },
        { raca: 'Pardos', letalidade: 34.0 },
        { raca: 'Indígenas', letalidade: 34.7 },
        { raca: 'Asiáticos', letalidade: 31.6 },
      ],
      paragrafos_cerd: '§29-30',
    },
    ORIGIN_COVID,
    { desagregacao_raca: true },
  ));

  all.push(rec(
    'Impacto socioeconômico COVID por raça — PNAD COVID 2020',
    'covid_racial', 'impacto_socioeconomico',
    'PNAD COVID-19 (IBGE, 2020) / IPEA',
    'https://covid19.ibge.gov.br/pnad-covid/',
    ['Art. 2', 'Art. 5'],
    {
      registros: [
        { indicador: 'Não procuraram trabalho por pandemia (nov/2020)', negros: 9.7, brancos: 5.9, unidade: '%' },
        { indicador: 'Queda da massa salarial real (Q1→Q2 2020)', negros: 23, brancos: 19, unidade: '%' },
        { indicador: 'Efeito emprego na queda da massa salarial', negros: 12, brancos: 6, unidade: 'pp' },
        { indicador: 'Taxa de pobreza SEM auxílio emergencial (jul/2020)', negros: 25.0, brancos: 12.8, unidade: '%' },
        { indicador: 'Taxa de pobreza COM auxílio emergencial (jul/2020)', negros: 7.7, brancos: 4.5, unidade: '%' },
        { indicador: 'Renda per capita média (jul/2020, com AE)', negros: 971, brancos: 1640, unidade: 'R$' },
      ],
      paragrafos_cerd: '§31-32',
    },
    ORIGIN_COVID,
    { desagregacao_raca: true },
  ));

  all.push(rec(
    'Mortalidade materna COVID por raça (2019-2022)',
    'covid_racial', 'mortalidade_materna',
    'IEPS Boletim Çarê Jul/2025',
    'https://ieps.org.br/boletim-care-ieps-07-2025/',
    ['Art. 2', 'Art. 5'],
    {
      series: {
        '2019': { preta: 107.8, parda: 55.2, branca: 46.2 },
        '2020': { preta: 131.5, parda: 71.8, branca: 68.5 },
        '2021': { preta: 179.4, parda: 94.4, branca: 103.8 },
        '2022': { preta: 105.2, parda: 53.8, branca: 44.6 },
      },
      paragrafos_cerd: '§29-30',
    },
    ORIGIN_COVID,
    { desagregacao_raca: true, desagregacao_genero: true },
  ));

  all.push(rec(
    'Vacinação COVID por raça — SI-PNI/DataSUS',
    'covid_racial', 'vacinacao_raca',
    'SI-PNI/DataSUS',
    'https://datasus.saude.gov.br/informacoes-de-saude-tabnet/',
    ['Art. 2', 'Art. 5'],
    {
      registros: [
        { grupo: 'Brancos', cobertura1Dose: 89.5, coberturaCompleta: 82.3 },
        { grupo: 'Pardos', cobertura1Dose: 84.2, coberturaCompleta: 74.8 },
        { grupo: 'Pretos', cobertura1Dose: 81.8, coberturaCompleta: 71.5 },
        { grupo: 'Indígenas', cobertura1Dose: 78.5, coberturaCompleta: 68.2 },
      ],
      paragrafos_cerd: '§29-30',
    },
    ORIGIN_COVID,
    { desagregacao_raca: true },
  ));

  all.push(rec(
    'Interseccionalidade COVID — impacto por grupo',
    'covid_racial', 'interseccionalidade',
    'IPEA / SIVEP-Gripe / PNAD COVID / ANTRA',
    'https://repositorio.ipea.gov.br/bitstreams/f8a9b99e-3b0a-4bc7-bd9c-1dc4ec9bb7a8/download',
    ['Art. 2', 'Art. 5'],
    {
      grupos: [
        'Mulheres negras', 'Idosos negros (60+)', 'PcD negros',
        'LGBTQIA+ negros', 'Jovens negros periféricos',
        'Trabalhadores negros informais', 'Indígenas', 'Quilombolas',
      ],
      paragrafos_cerd: '§29-30, §31-32',
    },
    ORIGIN_COVID,
    { desagregacao_raca: true, desagregacao_genero: true, desagregacao_idade: true },
  ));

  return all;
}

// ─── GRUPOS FOCAIS ───
export function buildGruposFocaisIndicators(): DbRecord[] {
  const all: DbRecord[] = [];

  all.push(rec(
    'Quilombolas — dados demográficos Censo 2022',
    'grupos_focais', 'quilombolas_demo',
    'IBGE — Censo Demográfico 2022',
    'https://sidra.ibge.gov.br/tabela/9578',
    ['Art. 2', 'Art. 5'],
    {
      populacao: 1330186,
      serieTemporal: [{ ano: 2022, valor: 1330186 }],
      observacoesONU: ['47', '48', '49'],
      paragrafos_cerd: '§33-36',
    },
    ORIGIN_GF,
  ));

  all.push(rec(
    'Indígenas — dados demográficos Censo 2022',
    'grupos_focais', 'indigenas_demo',
    'IBGE — Censo Demográfico 2022 (Pessoas Indígenas)',
    'https://www.ibge.gov.br/brasil-indigena/',
    ['Art. 2', 'Art. 5'],
    {
      populacao: 1227642,
      populacaoPessoasIndigenas: 1227642,
      populacaoCorRaca: 1227642,
      serieTemporal: [
        { ano: 2010, valor: 896917 },
        { ano: 2022, valor: 1227642 },
      ],
      etnias: 391,
      linguas: 295,
      observacoesONU: ['50', '51', '52', '53'],
      paragrafos_cerd: '§21-22, §54-55',
    },
    ORIGIN_GF,
  ));

  all.push(rec(
    'Ciganos/Roma — lacuna de dados',
    'grupos_focais', 'ciganos',
    'Lacuna crítica — Censo 2022 não incluiu pergunta específica',
    'https://www.ibge.gov.br/estatisticas/sociais/populacao/22827-censo-demografico-2022.html',
    ['Art. 2', 'Art. 5'],
    {
      populacao: null,
      observacoesONU: ['54', '55'],
      paragrafos_cerd: '§33-36',
    },
    ORIGIN_GF,
  ));

  all.push(rec(
    'Juventude Negra (15-29) — dados demográficos',
    'grupos_focais', 'juventude_negra',
    'Estimativa IBGE Censo 2022 × PNAD Contínua',
    'https://sidra.ibge.gov.br/tabela/7113',
    ['Art. 2', 'Art. 5'],
    {
      populacao: 25800000,
      serieTemporal: [
        { ano: 2018, valor: 26200000 },
        { ano: 2019, valor: 26100000 },
        { ano: 2020, valor: 25900000 },
        { ano: 2021, valor: 25800000 },
        { ano: 2022, valor: 25700000 },
        { ano: 2023, valor: 25800000 },
      ],
      observacoesONU: ['32', '33', '34', '35', '36'],
      paragrafos_cerd: '§23-24',
    },
    ORIGIN_GF,
    { desagregacao_idade: true, desagregacao_raca: true },
  ));

  all.push(rec(
    'População Negra (Preta + Parda) — Censo 2022',
    'grupos_focais', 'populacao_negra',
    'IBGE — Censo Demográfico 2022',
    'https://sidra.ibge.gov.br/tabela/9605',
    ['Art. 1', 'Art. 2', 'Art. 5'],
    {
      populacao: 112739744,
      detalhamento: { preta: 20656458, parda: 92083286 },
      serieTemporal: [
        { ano: 2010, valor: 97171614 },
        { ano: 2022, valor: 112739744 },
      ],
      paragrafos_cerd: '§7-8',
    },
    ORIGIN_GF,
    { desagregacao_raca: true },
  ));

  all.push(rec(
    'Mulheres Negras — dados estimados',
    'grupos_focais', 'mulheres_negras',
    'Estimativa IBGE Censo 2022 (Tab. 9605 × Tab. 9514)',
    'https://sidra.ibge.gov.br/tabela/9605',
    ['Art. 2', 'Art. 5'],
    {
      populacao: 59000000,
      observacoesONU: ['15', '17', '23', '28'],
      paragrafos_cerd: '§25-26',
    },
    ORIGIN_GF,
    { desagregacao_raca: true, desagregacao_genero: true },
  ));

  return all;
}

/** All Stage 3 categories for clearing before re-insert */
export function getStage3Categories(): string[] {
  return ['common_core', 'adm_publica', 'covid_racial', 'grupos_focais'];
}

/** Stage 4 categories (Complemento CERD 3) — must include ALL categories used by complementoCerd3Indicators */
export function getStage4Categories(): string[] {
  return [
    'trabalho_renda', 'cultura_patrimonio', 'legislacao_justica',
    'terra_territorio', 'Cultura', 'participacao_social',
    'saude', 'educacao', 'seguranca_publica', 'habitacao',
    'Demografia', 'Infraestrutura',
  ];
}

/** Build Stage 4 indicators from ComplementoCerd3Data */
export function buildStage4Indicators(): DbRecord[] {
  return complementoCerd3Indicators.map((ind) => rec(
    ind.nome, ind.categoria, ind.subcategoria,
    ind.fonte, ind.url_fonte, ind.artigos_convencao,
    ind.dados,
    ['espelho_estatico', 'ComplementoCerd3Data.ts'],
    {
      tendencia: ind.tendencia || null,
      desagregacao_raca: true,
    },
  ));
}

/** Build all Stage 3 indicators */
export function buildAllStage3Indicators(): DbRecord[] {
  return [
    ...buildCommonCoreIndicators(),
    ...buildAdmPublicaIndicators(),
    ...buildCovidRacialIndicators(),
    ...buildGruposFocaisIndicators(),
  ];
}

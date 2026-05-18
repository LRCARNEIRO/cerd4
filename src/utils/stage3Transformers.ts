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

/** Stage 4 categories (Complemento CERD 3) — must include ALL categories used by complementoCerd3Indicators.
 * IMPORTANT: any new `categoria` added in ComplementoCerd3Data.ts MUST be added here,
 * otherwise the corresponding mirror records won't be re-inserted on refresh.
 * Inclui formas com case alternativo (Demografia/demografia) e Cultura/cultura_patrimonio.
 */
export function getStage4Categories(): string[] {
  return [
    'trabalho_renda', 'cultura_patrimonio', 'legislacao_justica',
    'terra_territorio', 'Cultura', 'cultura', 'participacao_social',
    'saude', 'educacao', 'seguranca_publica', 'habitacao',
    'Demografia', 'demografia', 'Infraestrutura',
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

// ─── STAGE 5 — DADOS NOVOS (DadosNovosTab.tsx) — apenas pontos numéricos auditáveis ───
const ORIGIN_DN = ['espelho_estatico', 'DadosNovosTab.tsx'];

export function getStage5Categories(): string[] {
  return ['legislacao_justica'];
}

/** Build Stage 5 indicators (séries com valores reais já presentes em DadosNovosTab) */
export function buildStage5Indicators(): DbRecord[] {
  const out: DbRecord[] = [];

  // aj-1 — Denúncias de discriminação racial Disque 100 (2021-2024 com valores)
  out.push(rec(
    'Denúncias de discriminação racial — Disque 100 (racismo e injúria racial)',
    'legislacao_justica',
    'denuncias_disque100',
    'ONDH / Painel de Dados — Ministério dos Direitos Humanos e da Cidadania',
    'https://www.gov.br/mdh/pt-br/ondh/painel-de-dados/2024',
    ['Art. 2', 'Art. 4', 'Art. 6'],
    {
      unidade: 'denuncias_ano',
      series: {
        '2021': { denuncias: 1400, violacoes: 1400, fonte: 'MDHC (nov/2024)' },
        '2022': { denuncias: 1800, violacoes: 2300, fonte: 'MDHC (nov/2024)' },
        '2023': { denuncias: 3100, violacoes: 4600, fonte: 'MDHC (nov/2024)' },
        '2024': { denuncias: 4228, fonte: 'MDHC (mai/2025) — racismo, injúria racial e violência étnico-racial (ano completo)' },
      },
      nota: 'Crescimento expressivo pós Lei 14.532/2023 (equiparou injúria racial a racismo). Dados pré-2021 e 2025 ainda pendentes de extração via LAI.',
    },
    ORIGIN_DN,
    { tendencia: 'aumento', desagregacao_raca: true, desagregacao_genero: true, desagregacao_territorio: true },
  ));

  // aj-3 — Denúncias de intolerância religiosa (2020-2025)
  out.push(rec(
    'Denúncias de intolerância religiosa — Disque 100',
    'legislacao_justica',
    'denuncias_disque100',
    'ONDH / Painel de Dados — Ministério dos Direitos Humanos e da Cidadania',
    'https://www.gov.br/mdh/pt-br/acesso-a-informacao/dados-abertos/disque100',
    ['Art. 2', 'Art. 5', 'Art. 6'],
    {
      unidade: 'denuncias_ano',
      series: {
        '2020': { denuncias: 566, fonte: 'Disque 100 — Painel ONDH/MDHC' },
        '2021': { denuncias: 584, fonte: 'Disque 100 — Painel ONDH/MDHC' },
        '2022': { denuncias: 898, fonte: 'Disque 100 — Painel ONDH/MDHC' },
        '2023': { denuncias: 1482, fonte: 'Disque 100 — Painel ONDH/MDHC' },
        '2024': { denuncias: 2472, fonte: 'Disque 100 — Painel ONDH/MDHC' },
        '2025': { denuncias: 2723, fonte: 'Disque 100 — Painel ONDH/MDHC (parcial/acumulado)' },
      },
      nota: 'Maioria das denúncias envolve religiões de matriz africana (candomblé, umbanda). Vinculado ao Art. V(d)(vii) ICERD — liberdade de pensamento, consciência e religião.',
    },
    ORIGIN_DN,
    { tendencia: 'aumento', desagregacao_raca: true, desagregacao_genero: true, desagregacao_territorio: true },
  ));

  // pr-1 — Casos novos racismo no Judiciário (CNJ Painel Justiça Racial)
  out.push(rec(
    'Casos novos de racismo e injúria racial no Judiciário — CNJ Painel Justiça Racial',
    'legislacao_justica',
    'judiciario_justica_racial',
    'Conselho Nacional de Justiça — Painel Justiça Racial',
    'https://paineisanalytics.cnj.jus.br/single/?appid=dd3d7742-c558-4f2f-8ab1-a10a2e67c48f',
    ['Art. 2', 'Art. 4', 'Art. 6'],
    {
      unidade: 'processos_novos_ano',
      series: {
        '2024': { processos_novos: 4205, periodo_referencia: '10 meses', fonte: 'CNJ Painel Justiça Racial (nov/2025)' },
        '2025': { processos_novos: 7000, processos_pendentes_acumulados: 13440, periodo_referencia: '11 meses', percentual_justica_estadual: 97.4, fonte: 'CNJ Painel Justiça Racial (nov/2025)' },
      },
      nota: 'Painel Justiça Racial lançado em nov/2024. Lei 7.716/89 e Art. 140§3º CP. Crescimento acelerado após Lei 14.532/2023.',
    },
    ORIGIN_DN,
    { tendencia: 'aumento', desagregacao_raca: true, desagregacao_genero: true, desagregacao_territorio: true },
  ));

  // pr-4 — Composição racial do Judiciário
  out.push(rec(
    'Composição racial do Judiciário — magistrados e servidores negros',
    'legislacao_justica',
    'judiciario_composicao_racial',
    'CNJ — Censo do Poder Judiciário / Painel Justiça Racial',
    'https://www.cnj.jus.br/pesquisas-judiciarias/censo-do-poder-judiciario/',
    ['Art. 1', 'Art. 2', 'Art. 5'],
    {
      unidade: 'percentual',
      series: {
        '2023': { percentual_magistrados_negros: 18.1, fonte: 'Censo Judiciário CNJ 2023' },
        '2024': { percentual_total_negros_judiciario: 24.76, total_pessoas: 74079, fonte: 'Painel Justiça Racial CNJ (nov/2025)' },
        '2025': { percentual_total_negros_judiciario: 26.82, total_pessoas: 81183, total_magistrados_negros: 2702, fonte: 'Painel Justiça Racial CNJ (nov/2025)' },
      },
      nota: 'Sub-representação estrutural: 18,1% de magistrados negros vs 55,5% da população (Censo IBGE 2022). Cotas ampliadas de 20% para 30% pela Resolução CNJ nov/2025.',
    },
    ORIGIN_DN,
    { tendencia: 'melhora', desagregacao_raca: true, desagregacao_genero: true, desagregacao_territorio: true },
  ));

  return out;
}

/**
 * TRANSFORMADOR ESPELHO SEGURO
 * Converte todas as exportações de StatisticsData.ts para o formato
 * da tabela indicadores_interseccionais, incluindo metadados CERD.
 *
 * Mapeamento CERD 2022 (Observações Finais):
 *   §7-8    → Demografia
 *   §17-18  → Segurança (homicídio, letalidade)
 *   §19-20  → LGBTQIA+/Trans (ANTRA)
 *   §21-22  → Povos Tradicionais (indígenas)
 *   §23-24  → Juventude negra
 *   §25-26  → Violência de gênero (feminicídio)
 *   §27-28  → Educação
 *   §29-30  → Saúde
 *   §31-32  → Socioeconômico, trabalho, habitação
 *   §33-36  → Quilombolas, ciganos
 *   §37-38  → Deficiência
 *   §54-55  → Terra e território
 */

import {
  dadosDemograficos,
  evolucaoComposicaoRacial,
  indicadoresSocioeconomicos,
  segurancaPublica,
  feminicidioSerie,
  atlasViolencia2025,
  jovensNegrosViolencia,
  educacaoSerieHistorica,
  analfabetismoGeral2024,
  evasaoEscolarSerie,
  deficitHabitacionalSerie,
  cadUnicoPerfilRacial,
  saudeSerieHistorica,
  rendimentosCenso2022,
  interseccionalidadeTrabalho,
  deficienciaPorRaca,
  disparidadesPcd1459,
  serieAntraTrans,
  lgbtqiaPorRaca,
  povosTradicionais,
  classePorRaca,
  violenciaInterseccional,
  juventudeNegra,
  trabalhoRacaGenero,
  educacaoRacaGenero,
  chefiaFamiliarRacaGenero,
  saudeMaternaRaca,
  evolucaoDesigualdade,
} from '@/components/estatisticas/StatisticsData';

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
const ORIGIN = ['espelho_estatico', 'StatisticsData.ts'];

function serieToObj(serie: any[], yearKey = 'ano'): Record<string, any> {
  const obj: Record<string, any> = {};
  for (const row of serie) {
    const year = row[yearKey];
    const rest = { ...row };
    delete rest[yearKey];
    delete rest.fonte;
    obj[String(year)] = rest;
  }
  return obj;
}

function rec(
  nome: string,
  categoria: string,
  subcategoria: string | null,
  fonte: string,
  url_fonte: string | null,
  artigos: string[],
  dados: Record<string, any>,
  opts: Partial<DbRecord> = {}
): DbRecord {
  return {
    nome,
    categoria,
    subcategoria,
    fonte,
    url_fonte,
    artigos_convencao: artigos,
    auditado_manualmente: true,
    data_auditoria: now,
    tendencia: null,
    documento_origem: ORIGIN,
    dados,
    desagregacao_raca: true,
    desagregacao_genero: false,
    desagregacao_idade: false,
    desagregacao_classe: false,
    desagregacao_orientacao_sexual: false,
    desagregacao_deficiencia: false,
    desagregacao_territorio: false,
    ...opts,
  };
}

export function buildMirrorIndicators(): DbRecord[] {
  const all: DbRecord[] = [];

  // ─── DEMOGRAFIA §7-8 ───
  all.push(rec(
    'Composição racial — Censo 2022',
    'demografia', 'composicao_racial',
    dadosDemograficos.fonte,
    dadosDemograficos.urlFonte,
    ['Art. 1', 'Art. 2'],
    {
      populacaoTotal: dadosDemograficos.populacaoTotal,
      composicao: dadosDemograficos.composicaoRacial,
      populacaoNegra: dadosDemograficos.populacaoNegra,
      percentualNegro: dadosDemograficos.percentualNegro,
      quilombolas: dadosDemograficos.quilombolas,
      paragrafos_cerd: '§7-8',
    }
  ));

  all.push(rec(
    'Evolução composição racial (2018-2024)',
    'demografia', 'evolucao_racial',
    'PNAD Contínua Trimestral — SIDRA 6403',
    'https://sidra.ibge.gov.br/tabela/6403',
    ['Art. 1'],
    { series: serieToObj(evolucaoComposicaoRacial), paragrafos_cerd: '§7-8' }
  ));

  // ─── SOCIOECONÔMICO §31-32 ───
  all.push(rec(
    'Indicadores socioeconômicos por raça (2018-2024)',
    'trabalho_renda', 'socioeconomico',
    'PNAD Contínua / SIDRA 6405, 6402 / SIS',
    'https://sidra.ibge.gov.br/tabela/6405',
    ['Art. 2', 'Art. 5'],
    { series: serieToObj(indicadoresSocioeconomicos), paragrafos_cerd: '§31-32' }
  ));

  all.push(rec(
    'Rendimentos por raça — Censo 2022',
    'trabalho_renda', 'rendimentos_censo',
    rendimentosCenso2022.fonte,
    null,
    ['Art. 5'],
    { ...rendimentosCenso2022, paragrafos_cerd: '§31-32' }
  ));

  // ─── SEGURANÇA §17-18 ───
  all.push(rec(
    'Segurança pública — homicídio por raça (2018-2024)',
    'seguranca_publica', 'homicidio_raca',
    'Atlas da Violência 2025 (IPEA) / Anuário FBSP',
    'https://www.ipea.gov.br/atlasviolencia',
    ['Art. 2', 'Art. 5', 'Art. 6'],
    { series: serieToObj(segurancaPublica), paragrafos_cerd: '§17-18' }
  ));

  all.push(rec(
    'Atlas da Violência 2025 — dados-chave',
    'seguranca_publica', 'atlas_violencia',
    atlasViolencia2025.fonte,
    atlasViolencia2025.link,
    ['Art. 2', 'Art. 5'],
    { ...atlasViolencia2025, paragrafos_cerd: '§17-18' }
  ));

  // ─── FEMINICÍDIO §25-26 ───
  all.push(rec(
    'Feminicídio — série histórica (2018-2024)',
    'seguranca_publica', 'feminicidio',
    '19º Anuário FBSP 2025',
    'https://forumseguranca.org.br/anuario-brasileiro-seguranca-publica/',
    ['Art. 2', 'Art. 5'],
    { series: serieToObj(feminicidioSerie), paragrafos_cerd: '§25-26' },
    { desagregacao_genero: true }
  ));

  all.push(rec(
    'Violência interseccional — gênero e raça (2024)',
    'seguranca_publica', 'violencia_interseccional',
    '19º Anuário FBSP 2025 / DataSUS/SINAN',
    'https://forumseguranca.org.br/wp-content/uploads/2025/09/anuario-2025.pdf',
    ['Art. 2', 'Art. 5'],
    { registros: violenciaInterseccional, paragrafos_cerd: '§25-26' },
    { desagregacao_genero: true }
  ));

  // ─── JUVENTUDE §23-24 ───
  all.push(rec(
    'Jovens negros — violência e encarceramento',
    'seguranca_publica', 'juventude_violencia',
    jovensNegrosViolencia.fonte,
    null,
    ['Art. 2', 'Art. 5'],
    { ...jovensNegrosViolencia, paragrafos_cerd: '§23-24' },
    { desagregacao_idade: true }
  ));

  all.push(rec(
    'Juventude negra — indicadores comparativos',
    'seguranca_publica', 'juventude_comparativo',
    'Atlas da Violência 2025 / PNAD 2024',
    null,
    ['Art. 2', 'Art. 5'],
    { registros: juventudeNegra, paragrafos_cerd: '§23-24' },
    { desagregacao_idade: true }
  ));

  // ─── EDUCAÇÃO §27-28 ───
  all.push(rec(
    'Educação — série histórica por raça (2018-2024)',
    'educacao', 'serie_historica',
    'PNAD Contínua / SIDRA 7129, 7125',
    'https://sidra.ibge.gov.br/tabela/7129',
    ['Art. 5', 'Art. 7'],
    { series: serieToObj(educacaoSerieHistorica), paragrafos_cerd: '§27-28' }
  ));

  all.push(rec(
    'Analfabetismo geral — 2024',
    'educacao', 'analfabetismo',
    analfabetismoGeral2024.fonte,
    analfabetismoGeral2024.urlFonte,
    ['Art. 5', 'Art. 7'],
    { ...analfabetismoGeral2024, paragrafos_cerd: '§27-28' }
  ));

  all.push(rec(
    'Evasão escolar por raça (2018-2024)',
    'educacao', 'evasao_escolar',
    'IBGE — SIS 2025, Tabela 4.16',
    'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html',
    ['Art. 5', 'Art. 7'],
    { series: serieToObj(evasaoEscolarSerie), paragrafos_cerd: '§27-28' },
    { desagregacao_idade: true }
  ));

  // ─── SAÚDE §29-30 ───
  all.push(rec(
    'Saúde — mortalidade materna e infantil por raça (2018-2024)',
    'saude', 'serie_historica',
    'DataSUS/SIM + SINASC',
    'http://tabnet.datasus.gov.br/cgi/deftohtm.exe?sim/cnv/mat10uf.def',
    ['Art. 5'],
    { series: serieToObj(saudeSerieHistorica), paragrafos_cerd: '§29-30' }
  ));

  all.push(rec(
    'Saúde materna — raça e gênero',
    'saude', 'saude_materna',
    'RASEAM 2025 / IEPS / Nascer no Brasil II',
    saudeMaternaRaca.fonteRaseam2025,
    ['Art. 5'],
    {
      mortalidadeMaternaNegraPercentual: saudeMaternaRaca.mortalidadeMaternaNegraPercentual,
      mortalidadeMaternaBrancaPercentual: saudeMaternaRaca.mortalidadeMaternaBrancaPercentual,
      razaoMortalidadePretasBrancas: saudeMaternaRaca.razaoMortalidadePretasBrancas,
      taxaPretasPor100milNV: saudeMaternaRaca.taxaPretasPor100milNV,
      taxaBrancasPor100milNV: saudeMaternaRaca.taxaBrancasPor100milNV,
      paragrafos_cerd: '§29-30',
    },
    { desagregacao_genero: true }
  ));

  // ─── HABITAÇÃO §31-32 ───
  all.push(rec(
    'Déficit habitacional por raça (2018-2022)',
    'habitacao', 'deficit_racial',
    'Fundação João Pinheiro',
    'https://fjp.mg.gov.br/deficit-habitacional-no-brasil/',
    ['Art. 5'],
    { series: serieToObj(deficitHabitacionalSerie), paragrafos_cerd: '§31-32' }
  ));

  all.push(rec(
    'CadÚnico — perfil racial beneficiários (2018-2025)',
    'trabalho_renda', 'cadunico_racial',
    'SAGICAD/MDS — CadÚnico',
    'https://aplicacoes.cidadania.gov.br/vis/data3/v.php',
    ['Art. 2', 'Art. 5'],
    { series: serieToObj(cadUnicoPerfilRacial), paragrafos_cerd: '§31-32' }
  ));

  // ─── RAÇA × GÊNERO §25-26 ───
  all.push(rec(
    'Interseccionalidade trabalho — raça × gênero (Q2 2024)',
    'genero_raca', 'trabalho_interseccional',
    'DIEESE — Boletim Consciência Negra Nov/2024',
    'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf',
    ['Art. 2', 'Art. 5'],
    { registros: interseccionalidadeTrabalho, paragrafos_cerd: '§25-26, §31-32' },
    { desagregacao_genero: true }
  ));

  all.push(rec(
    'Trabalho — indicadores raça × gênero',
    'genero_raca', 'trabalho_raca_genero',
    'DIEESE / PNAD Q2 2024',
    'https://www.dieese.org.br/boletimespecial/2024/conscienciaNegra.pdf',
    ['Art. 2', 'Art. 5'],
    { registros: trabalhoRacaGenero, paragrafos_cerd: '§31-32' },
    { desagregacao_genero: true }
  ));

  all.push(rec(
    'Educação — raça × gênero (Censo 2022)',
    'genero_raca', 'educacao_raca_genero',
    'Censo 2022 — SIDRA 9606 × 10061 / 9542',
    'https://sidra.ibge.gov.br/tabela/10061',
    ['Art. 5', 'Art. 7'],
    { registros: educacaoRacaGenero, paragrafos_cerd: '§27-28' },
    { desagregacao_genero: true }
  ));

  all.push(rec(
    'Chefia familiar monoparental — raça × gênero',
    'genero_raca', 'chefia_familiar',
    'Censo 2022 / SIDRA 10179-10182 + II VIGISAN',
    'https://sidra.ibge.gov.br/Tabela/10179',
    ['Art. 2', 'Art. 5'],
    { ...chefiaFamiliarRacaGenero, fontes: undefined, paragrafos_cerd: '§25-26, §31-32' },
    { desagregacao_genero: true }
  ));

  // ─── DEFICIÊNCIA §37-38 ───
  all.push(rec(
    'Deficiência por raça — Censo 2022 / PNADC',
    'deficiencia', 'prevalencia_raca',
    'Censo 2022 (SIDRA 10126) / PNADC (SIDRA 4178/9384)',
    'https://sidra.ibge.gov.br/tabela/10126',
    ['Art. 2', 'Art. 5'],
    { registros: deficienciaPorRaca, paragrafos_cerd: '§37-38' },
    { desagregacao_deficiencia: true }
  ));

  all.push(rec(
    'Disparidades PcD 14-59 anos por raça',
    'deficiencia', 'disparidades_1459',
    'SIDRA 9354 (PNAD Contínua 2022)',
    'https://sidra.ibge.gov.br/tabela/9354',
    ['Art. 2', 'Art. 5'],
    { registros: disparidadesPcd1459, paragrafos_cerd: '§37-38' },
    { desagregacao_deficiencia: true }
  ));

  // ─── LGBTQIA+ §19-20 ───
  all.push(rec(
    'Violência contra pessoas trans — série ANTRA (2017-2025)',
    'lgbtqia', 'antra_trans',
    'Dossiê ANTRA 2026',
    'https://antrabrasil.org/wp-content/uploads/2026/01/dossie-antra-2026.pdf',
    ['Art. 2', 'Art. 5'],
    { series: serieToObj(serieAntraTrans), paragrafos_cerd: '§19-20' },
    { desagregacao_orientacao_sexual: true }
  ));

  all.push(rec(
    'LGBTQIA+ — vítimas por raça (2025)',
    'lgbtqia', 'vitimas_raca',
    'ANTRA Dossiê 2026 (dados 2025)',
    null,
    ['Art. 2', 'Art. 5'],
    { registros: lgbtqiaPorRaca, paragrafos_cerd: '§19-20' },
    { desagregacao_orientacao_sexual: true }
  ));

  // ─── POVOS TRADICIONAIS §21-22, §33-36, §54-55 ───
  all.push(rec(
    'Povos indígenas — Censo 2022',
    'povos_tradicionais', 'indigenas_censo',
    'IBGE/SIDRA — Censo 2022',
    povosTradicionais.indigenas.urlFonteCorRaca,
    ['Art. 2', 'Art. 5'],
    {
      populacaoCorRaca: povosTradicionais.indigenas.populacaoCorRaca,
      populacaoPessoasIndigenas: povosTradicionais.indigenas.populacaoPessoasIndigenas,
      etnias: povosTradicionais.indigenas.etnias,
      linguas: povosTradicionais.indigenas.linguas,
      populacaoUrbana: povosTradicionais.indigenas.populacaoUrbana,
      terrasHomologadas2018_2022: povosTradicionais.indigenas.terrasHomologadas2018_2022,
      terrasHomologadas2023_2025: povosTradicionais.indigenas.terrasHomologadas2023_2025,
      totalTIsHomologadasReservadas2025: povosTradicionais.indigenas.totalTIsHomologadasReservadas2025,
      rendimentoMedio: povosTradicionais.indigenas.rendimentoMedio,
      paragrafos_cerd: '§21-22, §54-55',
    }
  ));

  all.push(rec(
    'Comunidades quilombolas — Censo 2022',
    'povos_tradicionais', 'quilombolas_censo',
    povosTradicionais.quilombolas.fonte,
    povosTradicionais.quilombolas.urlFonte,
    ['Art. 2', 'Art. 5'],
    {
      populacao: povosTradicionais.quilombolas.populacao,
      municipiosComQuilombolas: povosTradicionais.quilombolas.municipiosComQuilombolas,
      emTerritoriosReconhecidos: povosTradicionais.quilombolas.emTerritoriosReconhecidos,
      comunidadesCertificadas: povosTradicionais.quilombolas.comunidadesCertificadas,
      territoriosTitulados: povosTradicionais.quilombolas.territoriosTitulados,
      acessoRedeAgua: povosTradicionais.quilombolas.acessoRedeAgua,
      esgotamentoAdequado: povosTradicionais.quilombolas.esgotamentoAdequado,
      coletaLixo: povosTradicionais.quilombolas.coletaLixo,
      paragrafos_cerd: '§33-36',
    }
  ));

  all.push(rec(
    'População negra — infraestrutura domiciliar',
    'povos_tradicionais', 'pop_negra_infra',
    'IBGE — Censo 2022: Características dos domicílios (Fev/2024)',
    povosTradicionais.populacaoNegra.infraestrutura.link,
    ['Art. 2', 'Art. 5'],
    {
      negros: povosTradicionais.populacaoNegra.infraestrutura,
      brancos: povosTradicionais.populacaoNegra.infraestruturaBrancos,
      mediaNacional: povosTradicionais.populacaoNegra.mediaNacional,
      paragrafos_cerd: '§31-32',
    }
  ));

  all.push(rec(
    'Povos ciganos/Romani — dados disponíveis',
    'povos_tradicionais', 'ciganos',
    'MUNIC/IBGE 2019',
    null,
    ['Art. 2', 'Art. 5'],
    {
      acampamentosIdentificados: povosTradicionais.ciganos.acampamentosIdentificados,
      lacunaDocumentada: povosTradicionais.ciganos.lacunaDocumentada,
      paragrafos_cerd: '§33-36',
    }
  ));

  // ─── CLASSE §31-32 ───
  all.push(rec(
    'Pobreza por raça — SIS/IBGE (2022-2024)',
    'trabalho_renda', 'classe_raca',
    'SIS/IBGE 2023-2025',
    'https://www.ibge.gov.br/estatisticas/sociais/populacao/9221-sintese-de-indicadores-sociais.html',
    ['Art. 2', 'Art. 5'],
    { registros: classePorRaca, paragrafos_cerd: '§31-32' },
    { desagregacao_classe: true }
  ));

  // ─── EVOLUÇÃO DESIGUALDADE ───
  all.push(rec(
    'Evolução das desigualdades raciais (2018-2024)',
    'trabalho_renda', 'evolucao_desigualdade',
    'PNAD Contínua/SIDRA 6405, 6402 / Atlas Violência / FBSP',
    'https://sidra.ibge.gov.br/tabela/6405',
    ['Art. 2', 'Art. 5'],
    { series: serieToObj(evolucaoDesigualdade), paragrafos_cerd: '§7-8, §17-18, §31-32' }
  ));

  return all;
}

/** Categorias únicas usadas pelos registros espelhados (Etapa 1+2) */
export function getMirrorCategories(): string[] {
  return [
    'demografia',
    'trabalho_renda',
    'seguranca_publica',
    'educacao',
    'saude',
    'habitacao',
    'genero_raca',
    'deficiencia',
    'lgbtqia',
    'povos_tradicionais',
  ];
}

/** Todas as categorias combinadas (Etapas 1-3) */
export function getAllMirrorCategories(): string[] {
  const { getStage3Categories } = require('@/utils/stage3Transformers');
  return [...getMirrorCategories(), ...getStage3Categories()];
}

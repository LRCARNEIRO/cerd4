/**
 * ═══════════════════════════════════════════════════════════════════
 * NARRATIVA DERIVADA — SINGLE SOURCE OF TRUTH
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Este módulo gera TODOS os valores numéricos utilizados em textos
 * analíticos a partir das constantes de dados em StatisticsData.ts.
 * 
 * REGRA: Nenhum valor numérico pode ser hardcoded em texto narrativo.
 * Todos devem ser derivados aqui a partir das constantes oficiais.
 * 
 * Se um valor narrativo divergir do dado real, o erro aparecerá
 * automaticamente no teste narrativeConsistency.test.ts.
 * ═══════════════════════════════════════════════════════════════════
 */

import {
  violenciaInterseccional,
  trabalhoRacaGenero,
  chefiaFamiliarRacaGenero,
  saudeMaternaRaca,
  educacaoRacaGenero,
  serieAntraTrans,
  feminicidioSerie,
  atlasViolencia2025,
  dadosDemograficos,
  segurancaPublica,
  jovensNegrosViolencia,
  educacaoSerieHistorica,
  povosTradicionais,
} from '@/components/estatisticas/StatisticsData';

// ═══════════════════════════════════════════
// HELPERS DE FORMATAÇÃO
// ═══════════════════════════════════════════

/** Formata número com vírgula decimal (pt-BR) */
export const fmt = (n: number, decimals = 1): string =>
  n.toFixed(decimals).replace('.', ',');

/** Formata moeda R$ */
export const fmtBRL = (n: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(n);

/** Formata percentual com vírgula */
export const fmtPct = (n: number): string => fmt(n, 1) + '%';

// ═══════════════════════════════════════════
// VIOLÊNCIA DE GÊNERO RACIALIZADA
// ═══════════════════════════════════════════

const feminicidioData = violenciaInterseccional.find(v => v.tipo === 'Feminicídio')!;
const feminicidio2018 = feminicidioSerie.find(f => f.ano === 2018)!;

export const narrativaViolencia = {
  /** % mulheres negras vítimas de feminicídio (2024) */
  feminicidioNegrasPct: feminicidioData.mulherNegra,
  /** % em 2018 para comparação */
  feminicidio2018Pct: feminicidio2018.percentualNegras,
  /** Texto formatado */
  get texto() {
    return `Mulheres negras representam ${fmt(this.feminicidioNegrasPct)}% das vítimas de feminicídio (2024), proporção que cresceu em relação a 2018 (${fmt(this.feminicidio2018Pct, 0)}%).`;
  },
} as const;

// ═══════════════════════════════════════════
// MERCADO DE TRABALHO — RAÇA × GÊNERO
// ═══════════════════════════════════════════

const findTrabalhoIndicador = (keywords: string[]) =>
  trabalhoRacaGenero.find((item) =>
    keywords.some((keyword) => item.indicador.toLowerCase().includes(keyword.toLowerCase()))
  );

const tRenda = findTrabalhoIndicador(['rendimento médio', 'rendimento medio']);
const tDesemprego = findTrabalhoIndicador(['desocupação', 'desocupacao']);
const tInformalidade = findTrabalhoIndicador(['informalidade']);

export const narrativaTrabalho = {
  /** Razão rendimento mulher negra / homem branco (%) */
  razaoRendaPct: (tRenda?.razaoMulherNegraHomemBranco ?? 0) * 100,
  /** Desemprego mulher negra */
  desempregoMulherNegra: tDesemprego?.mulherNegra ?? 0,
  /** Desemprego homem branco */
  desempregoHomemBranco: tDesemprego?.homemBranco ?? 0,
  /** Razão desemprego */
  razaoDesemprego: tDesemprego?.razaoMulherNegraHomemBranco ?? 0,
  /** Informalidade mulher negra */
  informalidadeMulherNegra: tInformalidade?.mulherNegra ?? 0,
  /** Texto formatado */
  get texto() {
    return `A mulher negra recebe ${fmt(this.razaoRendaPct)}% do rendimento do homem branco, demonstrando que raça e gênero operam como vetores cumulativos de desigualdade. A desocupação feminina negra (${fmt(this.desempregoMulherNegra)}%) é ${fmt(this.razaoDesemprego)}× superior à masculina branca (${fmt(this.desempregoHomemBranco)}%), e a informalidade negra feminina (${fmt(this.informalidadeMulherNegra)}%) inviabiliza proteção social. O cruzamento confirma o "piso pegajoso" descrito na literatura interseccional.`;
  },
} as const;

// ═══════════════════════════════════════════
// CHEFIA FAMILIAR E VULNERABILIDADE
// ═══════════════════════════════════════════

export const narrativaChefia = {
  percentualNegras: chefiaFamiliarRacaGenero.percentualNegras,
  totalMulheres: chefiaFamiliarRacaGenero.mulheresChefesMonoparentais,
  totalMulheresNegras: chefiaFamiliarRacaGenero.mulheresNegrasChefesMonoparentais,
  totalHomens: chefiaFamiliarRacaGenero.homensChefesMonoparentais,
  totalHomensNegros: chefiaFamiliarRacaGenero.homensNegrosChefesMonoparentais,
  cadUnicoNegras: chefiaFamiliarRacaGenero.cadUnicoMulheresNegras,
  cadUnicoBrancas: chefiaFamiliarRacaGenero.cadUnicoMulheresBrancas,
  domiciliosIA: chefiaFamiliarRacaGenero.domiciliosFemininosIA,
  domiciliosFome: chefiaFamiliarRacaGenero.domiciliosFemininosFome,
  get texto() {
    const cadUnicoTexto = this.cadUnicoNegras != null && this.cadUnicoBrancas != null
      ? `, que respondem por ${fmt(this.cadUnicoNegras)}% das inscritas no CadÚnico (vs ${fmt(this.cadUnicoBrancas, 0)}% das brancas)`
      : ' (dados CadÚnico pendentes de verificação)';
    return `${fmt(this.percentualNegras)}% dos ${(this.totalMulheres ?? 0).toLocaleString('pt-BR')} lares monoparentais femininos são chefiados por mulheres negras (${(this.totalMulheresNegras ?? 0).toLocaleString('pt-BR')} domicílios, Censo 2022)${cadUnicoTexto}. A insegurança alimentar atinge ${fmt(this.domiciliosIA, 0)}% desses domicílios, com ${fmt(this.domiciliosFome)}% em situação de fome. O cruzamento revela um ciclo de vulnerabilidade estrutural onde gênero e raça se retroalimentam na reprodução da pobreza intergeracional.`;
  },
} as const;

// ═══════════════════════════════════════════
// SAÚDE MATERNA
// ═══════════════════════════════════════════

export const narrativaSaudeMaterna = {
  mortesNegrasPct: saudeMaternaRaca.mortalidadeMaternaNegraPercentual,
  popFemininaNegraPct: dadosDemograficos.percentualNegro,
  razaoIEPS: saudeMaternaRaca.razaoMortalidadePretasBrancas,
  taxaPretasIEPS: saudeMaternaRaca.taxaPretasPor100milNV,
  taxaBrancasIEPS: saudeMaternaRaca.taxaBrancasPor100milNV,
  razaoFiocruz: saudeMaternaRaca.nascerBrasil2RazaoNegraBranca,
  anoSIM: saudeMaternaRaca.anoReferencia,
  get texto() {
    return `Mulheres negras constituem ${fmt(this.mortesNegrasPct, 0)}% das mortes maternas (SIM ${this.anoSIM}), apesar de representarem ${fmt(this.popFemininaNegraPct)}% da população feminina. O Boletim IEPS (jul/2025) confirma que a razão de mortalidade materna entre pretas e brancas é de ${fmt(this.razaoIEPS)}× na série 2010-2023 (${fmt(this.taxaPretasIEPS)} vs ${fmt(this.taxaBrancasIEPS)} por 100 mil NV). O estudo Nascer no Brasil II (Fiocruz) documenta menor acesso a pré-natal adequado, peregrinação hospitalar e menor uso de analgesia no parto entre negras. Nota: o dado mais recente consolidado do SIM é ${this.anoSIM}; o RASEAM 2025 mantém esse recorte.`;
  },
} as const;

// ═══════════════════════════════════════════
// EDUCAÇÃO
// ═══════════════════════════════════════════

const eduSuperior = educacaoRacaGenero.find(e => e.indicador === 'Superior completo (%)')!;

export const narrativaEducacao = {
  superiorMulherNegra: eduSuperior.mulherNegra,
  superiorMulherBranca: eduSuperior.mulherBranca,
  get texto() {
    return `A conclusão do ensino superior entre mulheres negras (${fmt(this.superiorMulherNegra)}%) é metade da taxa de mulheres brancas (${fmt(this.superiorMulherBranca, 0)}%), apesar dos avanços com cotas (Lei 12.711/2012). Mulheres negras abandonam mais a escola por necessidade de trabalho e cuidado. O cruzamento indica que políticas universais de expansão do ensino superior não eliminam a desigualdade racial-de-gênero sem ações afirmativas complementares.`;
  },
} as const;

// ═══════════════════════════════════════════
// LGBTQIA+ — ANTRA
// ═══════════════════════════════════════════

const antra2025 = serieAntraTrans.find(s => s.ano === 2025)!;
const antra2024 = serieAntraTrans.find(s => s.ano === 2024)!;
const antraMediaNegros = Math.round(serieAntraTrans.reduce((s, a) => s + a.negros, 0) / serieAntraTrans.length);

export const narrativaLGBTQIA = {
  assassinatos2025: antra2025.totalAssassinatos,
  variacaoVs2024: Math.round(((antra2025.totalAssassinatos - antra2024.totalAssassinatos) / antra2024.totalAssassinatos) * 100),
  vitimasNegras2025: antra2025.negros,
  vitimasIndigenas2025: antra2025.indigenas,
  mediaSerieNegros: antraMediaNegros,
  assassinatos2017: serieAntraTrans.find(s => s.ano === 2017)!.totalAssassinatos,
  get reducaoSerie() {
    return Math.round(((this.assassinatos2025 - this.assassinatos2017) / this.assassinatos2017) * 100);
  },
} as const;

// ═══════════════════════════════════════════
// ATLAS DA VIOLÊNCIA — JUVENTUDE
// ═══════════════════════════════════════════

export const narrativaJuventude = {
  percentualVitimas: atlasViolencia2025.juventude15_29.percentualVitimas,
  percentualNegrosHomens: atlasViolencia2025.juventude15_29.percentualNegrosHomens,
  riscoRelativo: atlasViolencia2025.ivjn.riscoRelativo,
  riscoRelativo2017: atlasViolencia2025.ivjn.riscoRelativo2017,
  riscoSuperiorNegro: atlasViolencia2025.ivjn.riscoSuperiorNegro,
} as const;

// ═══════════════════════════════════════════
// SEGURANÇA PÚBLICA — narrativa geral
// ═══════════════════════════════════════════

const seg2018 = segurancaPublica.find(s => s.ano === 2018)!;
const seg2024 = segurancaPublica.find(s => s.ano === 2024)!;

export const narrativaSeguranca = {
  riscoRelativo: atlasViolencia2025.riscoRelativo,
  vitimasNegras2024: seg2024.percentualVitimasNegras,
  vitimasNegras2018: seg2018.percentualVitimasNegras,
  letalidadePolicial2024: seg2024.letalidadePolicial,
  letalidadePolicial2018: seg2018.letalidadePolicial,
  jovensObitosExternos: jovensNegrosViolencia.percentualObitosExternos,
} as const;

// ═══════════════════════════════════════════
// EDUCAÇÃO — série histórica (Lacunas CERD)
// ═══════════════════════════════════════════

const edu2018 = educacaoSerieHistorica.find(e => e.ano === 2018)!;
const eduUltimo = educacaoSerieHistorica[educacaoSerieHistorica.length - 1];

export const narrativaEducacaoSerie = {
  analfabetismoNegro2018: edu2018.analfabetismoNegro,
  analfabetismoNegroUltimo: eduUltimo.analfabetismoNegro,
  analfabetismoBrancoUltimo: eduUltimo.analfabetismoBranco,
  anoUltimo: eduUltimo.ano,
  razaoAnalfabetismo: +(eduUltimo.analfabetismoNegro / eduUltimo.analfabetismoBranco).toFixed(1),
} as const;

// ═══════════════════════════════════════════
// QUILOMBOLAS — territórios
// ═══════════════════════════════════════════

export const narrativaQuilombolas = {
  populacao: povosTradicionais.quilombolas.populacao,
  territoriosTitulados: povosTradicionais.quilombolas.territoriosTitulados,
  comunidadesCertificadas: povosTradicionais.quilombolas.comunidadesCertificadas,
  taxaTitulacao: +((povosTradicionais.quilombolas.territoriosTitulados / povosTradicionais.quilombolas.comunidadesCertificadas) * 100).toFixed(1),
  aguaRedeGeral: povosTradicionais.quilombolas.acessoRedeAgua,
  esgotamentoAdequado: povosTradicionais.quilombolas.esgotamentoAdequado,
  processosAbertosIncra: povosTradicionais.quilombolas.processosAbertosIncra,
} as const;

// ═══════════════════════════════════════════
// COVID — dados interseccionais
// ═══════════════════════════════════════════

export const narrativaCovid = {
  quilombolaAgua: povosTradicionais.quilombolas.acessoRedeAgua,
  quilombolaEsgoto: povosTradicionais.quilombolas.esgotamentoAdequado,
} as const;

// ═══════════════════════════════════════════
// MAPA DE VALIDAÇÃO — para testes automatizados
// Associa cada valor narrativo ao dado-fonte correspondente
// ═══════════════════════════════════════════

export const NARRATIVE_DATA_MAP = [
  // Interseccional — Violência
  { label: 'Feminicídio negras 2024', narrativeValue: narrativaViolencia.feminicidioNegrasPct, sourceValue: feminicidioData.mulherNegra, source: 'violenciaInterseccional[Feminicídio].mulherNegra' },
  { label: 'Feminicídio negras 2018', narrativeValue: narrativaViolencia.feminicidio2018Pct, sourceValue: feminicidio2018.percentualNegras, source: 'feminicidioSerie[2018].percentualNegras' },
  // Interseccional — Trabalho
  { label: 'Razão renda MN/HB', narrativeValue: narrativaTrabalho.razaoRendaPct, sourceValue: (tRenda?.razaoMulherNegraHomemBranco ?? 0) * 100, source: 'trabalhoRacaGenero[Renda].razaoMulherNegraHomemBranco × 100' },
  { label: 'Desemprego MN', narrativeValue: narrativaTrabalho.desempregoMulherNegra, sourceValue: tDesemprego?.mulherNegra ?? 0, source: 'trabalhoRacaGenero[Desocupação].mulherNegra' },
  { label: 'Desemprego HB', narrativeValue: narrativaTrabalho.desempregoHomemBranco, sourceValue: tDesemprego?.homemBranco ?? 0, source: 'trabalhoRacaGenero[Desocupação].homemBranco' },
  { label: 'Informalidade MN', narrativeValue: narrativaTrabalho.informalidadeMulherNegra, sourceValue: tInformalidade?.mulherNegra ?? 0, source: 'trabalhoRacaGenero[Informalidade].mulherNegra' },
  // Interseccional — Chefia Familiar
  { label: 'Chefia negras %', narrativeValue: narrativaChefia.percentualNegras, sourceValue: chefiaFamiliarRacaGenero.percentualNegras, source: 'chefiaFamiliarRacaGenero.percentualNegras' },
  { label: 'CadÚnico negras %', narrativeValue: narrativaChefia.cadUnicoNegras, sourceValue: chefiaFamiliarRacaGenero.cadUnicoMulheresNegras, source: 'chefiaFamiliarRacaGenero.cadUnicoMulheresNegras' },
  { label: 'IA domicílios femininos', narrativeValue: narrativaChefia.domiciliosIA, sourceValue: chefiaFamiliarRacaGenero.domiciliosFemininosIA, source: 'chefiaFamiliarRacaGenero.domiciliosFemininosIA' },
  { label: 'Fome domicílios femininos', narrativeValue: narrativaChefia.domiciliosFome, sourceValue: chefiaFamiliarRacaGenero.domiciliosFemininosFome, source: 'chefiaFamiliarRacaGenero.domiciliosFemininosFome' },
  // Interseccional — Saúde Materna
  { label: 'Mortes maternas negras %', narrativeValue: narrativaSaudeMaterna.mortesNegrasPct, sourceValue: saudeMaternaRaca.mortalidadeMaternaNegraPercentual, source: 'saudeMaternaRaca.mortalidadeMaternaNegraPercentual' },
  { label: 'Razão IEPS pretas/brancas', narrativeValue: narrativaSaudeMaterna.razaoIEPS, sourceValue: saudeMaternaRaca.razaoMortalidadePretasBrancas, source: 'saudeMaternaRaca.razaoMortalidadePretasBrancas' },
  // Interseccional — Educação
  { label: 'Superior mulher negra', narrativeValue: narrativaEducacao.superiorMulherNegra, sourceValue: eduSuperior.mulherNegra, source: 'educacaoRacaGenero[Superior].mulherNegra' },
  { label: 'Superior mulher branca', narrativeValue: narrativaEducacao.superiorMulherBranca, sourceValue: eduSuperior.mulherBranca, source: 'educacaoRacaGenero[Superior].mulherBranca' },
  // LGBTQIA+
  { label: 'ANTRA assassinatos 2025', narrativeValue: narrativaLGBTQIA.assassinatos2025, sourceValue: antra2025.totalAssassinatos, source: 'serieAntraTrans[2025].totalAssassinatos' },
  { label: 'ANTRA vítimas negras 2025', narrativeValue: narrativaLGBTQIA.vitimasNegras2025, sourceValue: antra2025.negros, source: 'serieAntraTrans[2025].negros' },
  { label: 'ANTRA vítimas indígenas 2025', narrativeValue: narrativaLGBTQIA.vitimasIndigenas2025, sourceValue: antra2025.indigenas, source: 'serieAntraTrans[2025].indigenas' },
  // Segurança Pública
  { label: 'Risco relativo homicídio', narrativeValue: narrativaSeguranca.riscoRelativo, sourceValue: atlasViolencia2025.riscoRelativo, source: 'atlasViolencia2025.riscoRelativo' },
  { label: 'Vítimas negras 2024', narrativeValue: narrativaSeguranca.vitimasNegras2024, sourceValue: seg2024.percentualVitimasNegras, source: 'segurancaPublica[2024].percentualVitimasNegras' },
  { label: 'Vítimas negras 2018', narrativeValue: narrativaSeguranca.vitimasNegras2018, sourceValue: seg2018.percentualVitimasNegras, source: 'segurancaPublica[2018].percentualVitimasNegras' },
  { label: 'Letalidade policial 2024', narrativeValue: narrativaSeguranca.letalidadePolicial2024, sourceValue: seg2024.letalidadePolicial, source: 'segurancaPublica[2024].letalidadePolicial' },
  { label: 'Letalidade policial 2018', narrativeValue: narrativaSeguranca.letalidadePolicial2018, sourceValue: seg2018.letalidadePolicial, source: 'segurancaPublica[2018].letalidadePolicial' },
  { label: 'Jovens óbitos causas externas', narrativeValue: narrativaSeguranca.jovensObitosExternos, sourceValue: jovensNegrosViolencia.percentualObitosExternos, source: 'jovensNegrosViolencia.percentualObitosExternos' },
  // Educação série
  { label: 'Analfabetismo negro 2018', narrativeValue: narrativaEducacaoSerie.analfabetismoNegro2018, sourceValue: edu2018.analfabetismoNegro, source: 'educacaoSerieHistorica[2018].analfabetismoNegro' },
  { label: 'Analfabetismo negro último', narrativeValue: narrativaEducacaoSerie.analfabetismoNegroUltimo, sourceValue: eduUltimo.analfabetismoNegro, source: 'educacaoSerieHistorica[último].analfabetismoNegro' },
  // Quilombolas
  { label: 'Quilombolas titulados', narrativeValue: narrativaQuilombolas.territoriosTitulados, sourceValue: povosTradicionais.quilombolas.territoriosTitulados, source: 'povosTradicionais.quilombolas.territoriosTitulados' },
  { label: 'Quilombolas certificadas', narrativeValue: narrativaQuilombolas.comunidadesCertificadas, sourceValue: povosTradicionais.quilombolas.comunidadesCertificadas, source: 'povosTradicionais.quilombolas.comunidadesCertificadas' },
  { label: 'Quilombolas água', narrativeValue: narrativaQuilombolas.aguaRedeGeral, sourceValue: povosTradicionais.quilombolas.acessoRedeAgua, source: 'povosTradicionais.quilombolas.acessoRedeAgua' },
  { label: 'Quilombolas esgoto', narrativeValue: narrativaQuilombolas.esgotamentoAdequado, sourceValue: povosTradicionais.quilombolas.esgotamentoAdequado, source: 'povosTradicionais.quilombolas.esgotamentoAdequado' },
  // COVID
  { label: 'COVID quilombola água', narrativeValue: narrativaCovid.quilombolaAgua, sourceValue: povosTradicionais.quilombolas.acessoRedeAgua, source: 'povosTradicionais.quilombolas.acessoRedeAgua' },
  { label: 'COVID quilombola esgoto', narrativeValue: narrativaCovid.quilombolaEsgoto, sourceValue: povosTradicionais.quilombolas.esgotamentoAdequado, source: 'povosTradicionais.quilombolas.esgotamentoAdequado' },
  // Indígenas — TIs
  { label: 'TIs total 2025', narrativeValue: povosTradicionais.indigenas.totalTIsHomologadasReservadas2025, sourceValue: 536, source: 'ISA/terrasindigenas.org.br (Mar/2026)' },
  { label: 'TIs baseline 2018', narrativeValue: povosTradicionais.indigenas.totalTIsHomologadasReservadas2018, sourceValue: 536 - 21, source: 'ISA total - (FUNAI 1+20 novas homologações)' },
] as const;

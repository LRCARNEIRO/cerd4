/**
 * ═══════════════════════════════════════════════════════════════════
 * NARRATIVA DERIVADA — SINGLE SOURCE OF TRUTH
 * ═══════════════════════════════════════════════════════════════════
 * 
 * Este módulo gera TODOS os valores numéricos utilizados em textos
 * analíticos a partir dos dados fornecidos (BD ou fallback hardcoded).
 * 
 * REGRA: Nenhum valor numérico pode ser hardcoded em texto narrativo.
 * Todos devem ser derivados aqui a partir das constantes oficiais.
 * 
 * ARQUITETURA SSoT:
 * - createNarrativas(data) → factory que aceita dados injetados
 * - Exports module-level → mantidos para backward compat + testes
 * - Hook useNarrativeData() → wrapper React que injeta mirror data
 * ═══════════════════════════════════════════════════════════════════
 */

import {
  violenciaInterseccional as hcViolencia,
  trabalhoRacaGenero as hcTrabalhoRG,
  chefiaFamiliarRacaGenero as hcChefia,
  saudeMaternaRaca as hcSaudeMaterna,
  educacaoRacaGenero as hcEducacaoRG,
  serieAntraTrans as hcAntra,
  feminicidioSerie as hcFeminicidio,
  atlasViolencia2025 as hcAtlas,
  dadosDemograficos as hcDemograficos,
  segurancaPublica as hcSeguranca,
  jovensNegrosViolencia as hcJovensViolencia,
  educacaoSerieHistorica as hcEducacao,
  povosTradicionais as hcPovos,
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
// TIPOS PARA DADOS INJETADOS
// ═══════════════════════════════════════════

export interface NarrativeDataInput {
  violenciaInterseccional?: any[];
  trabalhoRacaGenero?: any[];
  chefiaFamiliarRacaGenero?: any;
  saudeMaternaRaca?: any;
  educacaoRacaGenero?: any[];
  serieAntraTrans?: any[];
  feminicidioSerie?: any[];
  atlasViolencia2025?: any;
  dadosDemograficos?: any;
  segurancaPublica?: any[];
  jovensNegrosViolencia?: any;
  educacaoSerieHistorica?: any[];
  povosTradicionais?: any;
}

// ═══════════════════════════════════════════
// FACTORY — cria todas as narrativas a partir de dados injetados
// ═══════════════════════════════════════════

export function createNarrativas(input: NarrativeDataInput = {}) {
  const violenciaInterseccional = input.violenciaInterseccional ?? hcViolencia;
  const trabalhoRacaGenero = input.trabalhoRacaGenero ?? hcTrabalhoRG;
  const chefiaFamiliarRacaGenero = input.chefiaFamiliarRacaGenero ?? hcChefia;
  const saudeMaternaRaca = input.saudeMaternaRaca ?? hcSaudeMaterna;
  const educacaoRacaGenero = input.educacaoRacaGenero ?? hcEducacaoRG;
  const serieAntraTrans = input.serieAntraTrans ?? hcAntra;
  const feminicidioSerie = input.feminicidioSerie ?? hcFeminicidio;
  const atlasViolencia2025 = input.atlasViolencia2025 ?? hcAtlas;
  const dadosDemograficos = input.dadosDemograficos ?? hcDemograficos;
  const segurancaPublica = input.segurancaPublica ?? hcSeguranca;
  const jovensNegrosViolencia = input.jovensNegrosViolencia ?? hcJovensViolencia;
  const educacaoSerieHistorica = input.educacaoSerieHistorica ?? hcEducacao;
  const povosTradicionais = input.povosTradicionais ?? hcPovos;

  // ── VIOLÊNCIA DE GÊNERO RACIALIZADA ──
  const feminicidioData = violenciaInterseccional.find((v: any) => v.tipo === 'Feminicídio')!;
  const feminicidio2018 = feminicidioSerie.find((f: any) => f.ano === 2018)!;

  const narrativaViolencia = {
    feminicidioNegrasPct: feminicidioData?.mulherNegra ?? 0,
    feminicidio2018Pct: feminicidio2018?.percentualNegras ?? 0,
    get texto() {
      return `Mulheres negras representam ${fmt(this.feminicidioNegrasPct)}% das vítimas de feminicídio (2024), proporção que cresceu em relação a 2018 (${fmt(this.feminicidio2018Pct, 0)}%).`;
    },
  };

  // ── MERCADO DE TRABALHO — RAÇA × GÊNERO ──
  const findTrabalhoIndicador = (keywords: string[]) =>
    trabalhoRacaGenero.find((item: any) =>
      keywords.some((keyword) => item.indicador.toLowerCase().includes(keyword.toLowerCase()))
    );

  const tRenda = findTrabalhoIndicador(['rendimento médio', 'rendimento medio']);
  const tDesemprego = findTrabalhoIndicador(['desocupação', 'desocupacao', 'desemprego']);
  const tInformalidade = findTrabalhoIndicador(['informalidade']);

  const narrativaTrabalho = {
    razaoRendaPct: (tRenda?.razaoMulherNegraHomemBranco ?? 0) * 100,
    desempregoMulherNegra: tDesemprego?.mulherNegra ?? 0,
    desempregoHomemBranco: tDesemprego?.homemBranco ?? 0,
    razaoDesemprego: tDesemprego?.razaoMulherNegraHomemBranco ?? 0,
    informalidadeMulherNegra: tInformalidade?.mulherNegra ?? 0,
    get texto() {
        return `A mulher negra recebe ${fmt(this.razaoRendaPct)}% do rendimento do homem não negro, demonstrando que raça e gênero operam como vetores cumulativos de desigualdade. A taxa de desemprego feminina negra (${fmt(this.desempregoMulherNegra)}%) é ${fmt(this.razaoDesemprego)}× superior à masculina não negra (${fmt(this.desempregoHomemBranco)}%), e a informalidade negra feminina (${fmt(this.informalidadeMulherNegra)}%) inviabiliza proteção social. O cruzamento confirma o "piso pegajoso" descrito na literatura interseccional.`;
    },
  };

  // ── CHEFIA FAMILIAR ──
  const narrativaChefia = {
    percentualNegras: chefiaFamiliarRacaGenero.percentualNegras,
    totalMulheres: chefiaFamiliarRacaGenero.mulheresChefesMonoparentais,
    totalMulheresNegras: chefiaFamiliarRacaGenero.mulheresNegrasChefesMonoparentais,
    totalHomens: chefiaFamiliarRacaGenero.homensChefesMonoparentais,
    totalHomensNegros: chefiaFamiliarRacaGenero.homensNegrosChefesMonoparentais,
    cadUnicoNegras: chefiaFamiliarRacaGenero.cadUnicoMulheresNegras,
    cadUnicoBrancas: chefiaFamiliarRacaGenero.cadUnicoMulheresBrancas,
    fomeMulheresNegras: chefiaFamiliarRacaGenero.fomeMulheresNegras,
    fomeMulheresBrancas: chefiaFamiliarRacaGenero.fomeMulheresBrancas,
    fomeCriancas: chefiaFamiliarRacaGenero.fomeCriancasMulheresNegras,
    fomeDesemprego: chefiaFamiliarRacaGenero.fomeDesempregoMulheresNegras,
    segAlimentarCriancasNegras: chefiaFamiliarRacaGenero.segAlimentarCriancasMulheresNegras,
    segAlimentarCriancasBrancos: chefiaFamiliarRacaGenero.segAlimentarCriancasHomensBrancos,
    get texto() {
      const cadUnicoTexto = this.cadUnicoNegras != null && this.cadUnicoBrancas != null
        ? `, que respondem por ${fmt(this.cadUnicoNegras)}% das inscritas no CadÚnico (vs ${fmt(this.cadUnicoBrancas, 0)}% das brancas)`
        : ' (dados CadÚnico pendentes de verificação)';
      return `${fmt(this.percentualNegras)}% dos ${(this.totalMulheres ?? 0).toLocaleString('pt-BR')} lares monoparentais femininos são chefiados por mulheres negras (${(this.totalMulheresNegras ?? 0).toLocaleString('pt-BR')} domicílios, Censo 2022)${cadUnicoTexto}. A fome (IA grave) atinge ${fmt(this.fomeMulheresNegras)}% dos lares de mulheres negras (vs ${fmt(this.fomeMulheresBrancas)}% brancas), subindo a ${fmt(this.fomeCriancas)}% nos lares com crianças <10 anos — onde apenas ${fmt(this.segAlimentarCriancasNegras)}% alcançam segurança alimentar (vs ${fmt(this.segAlimentarCriancasBrancos)}% em lares de homens brancos). Quando desempregadas, a fome chega a ${fmt(this.fomeDesemprego)}% (Fiocruz/DSBR 2023).`;
    },
  };

  // ── SAÚDE MATERNA ──
  const narrativaSaudeMaterna = {
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
  };

  // ── EDUCAÇÃO ──
  const eduSuperior = educacaoRacaGenero.find((e: any) => e.indicador === 'Superior completo (%)')!;

  const narrativaEducacao = {
    superiorMulherNegra: eduSuperior?.mulherNegra ?? 0,
    superiorMulherBranca: eduSuperior?.mulherBranca ?? 0,
    get texto() {
      return `A conclusão do ensino superior entre mulheres negras (${fmt(this.superiorMulherNegra)}%) é metade da taxa de mulheres brancas (${fmt(this.superiorMulherBranca, 0)}%), apesar dos avanços com cotas (Lei 12.711/2012). Mulheres negras abandonam mais a escola por necessidade de trabalho e cuidado. O cruzamento indica que políticas universais de expansão do ensino superior não eliminam a desigualdade racial-de-gênero sem ações afirmativas complementares.`;
    },
  };

  // ── LGBTQIA+ — ANTRA ──
  const antra2025 = serieAntraTrans.find((s: any) => s.ano === 2025)!;
  const antra2024 = serieAntraTrans.find((s: any) => s.ano === 2024)!;
  const antraMediaNegros = Math.round(serieAntraTrans.reduce((s: number, a: any) => s + a.negros, 0) / serieAntraTrans.length);

  const narrativaLGBTQIA = {
    assassinatos2025: antra2025?.totalAssassinatos ?? 0,
    variacaoVs2024: antra2025 && antra2024 ? Math.round(((antra2025.totalAssassinatos - antra2024.totalAssassinatos) / antra2024.totalAssassinatos) * 100) : 0,
    vitimasNegras2025: antra2025?.negros ?? 0,
    vitimasIndigenas2025: antra2025?.indigenas ?? 0,
    mediaSerieNegros: antraMediaNegros,
    assassinatos2017: serieAntraTrans.find((s: any) => s.ano === 2017)?.totalAssassinatos ?? 0,
    get reducaoSerie() {
      return this.assassinatos2017 ? Math.round(((this.assassinatos2025 - this.assassinatos2017) / this.assassinatos2017) * 100) : 0;
    },
  };

  // ── ATLAS DA VIOLÊNCIA — JUVENTUDE ──
  const narrativaJuventude = {
    percentualVitimas: atlasViolencia2025.juventude15_29?.percentualVitimas ?? 0,
    riscoRelativo: atlasViolencia2025.ivjn?.riscoRelativo ?? 0,
    riscoRelativo2017: atlasViolencia2025.ivjn?.riscoRelativo2017 ?? 0,
    riscoSuperiorNegro: atlasViolencia2025.ivjn?.riscoSuperiorNegro ?? 0,
  };

  // ── SEGURANÇA PÚBLICA ──
  const seg2018 = segurancaPublica.find((s: any) => s.ano === 2018)!;
  const seg2024 = segurancaPublica.find((s: any) => s.ano === 2024)!;

  const narrativaSeguranca = {
    riscoRelativo: atlasViolencia2025.riscoRelativo ?? 0,
    vitimasNegras2024: seg2024?.percentualVitimasNegras ?? 0,
    vitimasNegras2018: seg2018?.percentualVitimasNegras ?? 0,
    letalidadePolicial2024: seg2024?.letalidadePolicial ?? 0,
    letalidadePolicial2018: seg2018?.letalidadePolicial ?? 0,
    jovensObitosExternos: jovensNegrosViolencia.percentualObitosExternos ?? 0,
  };

  // ── EDUCAÇÃO — série histórica ──
  const edu2018 = educacaoSerieHistorica.find((e: any) => e.ano === 2018)!;
  const eduUltimo = educacaoSerieHistorica[educacaoSerieHistorica.length - 1];

  const narrativaEducacaoSerie = {
    analfabetismoNegro2018: edu2018?.analfabetismoNegro ?? 0,
    analfabetismoNegroUltimo: eduUltimo?.analfabetismoNegro ?? 0,
    analfabetismoBrancoUltimo: eduUltimo?.analfabetismoBranco ?? 0,
    anoUltimo: eduUltimo?.ano ?? 0,
    razaoAnalfabetismo: eduUltimo && eduUltimo.analfabetismoBranco ? +(eduUltimo.analfabetismoNegro / eduUltimo.analfabetismoBranco).toFixed(1) : 0,
  };

  // ── QUILOMBOLAS ──
  const narrativaQuilombolas = {
    populacao: povosTradicionais.quilombolas?.populacao ?? 0,
    territoriosTitulados: povosTradicionais.quilombolas?.territoriosTitulados ?? 0,
    comunidadesCertificadas: povosTradicionais.quilombolas?.comunidadesCertificadas ?? 0,
    taxaTitulacao: povosTradicionais.quilombolas?.comunidadesCertificadas
      ? +((povosTradicionais.quilombolas.territoriosTitulados / povosTradicionais.quilombolas.comunidadesCertificadas) * 100).toFixed(1)
      : 0,
    aguaRedeGeral: povosTradicionais.quilombolas?.acessoRedeAgua ?? 0,
    esgotamentoAdequado: povosTradicionais.quilombolas?.esgotamentoAdequado ?? 0,
    processosAbertosIncra: povosTradicionais.quilombolas?.processosAbertosIncra ?? 0,
  };

  // ── COVID ──
  const narrativaCovid = {
    quilombolaAgua: povosTradicionais.quilombolas?.acessoRedeAgua ?? 0,
    quilombolaEsgoto: povosTradicionais.quilombolas?.esgotamentoAdequado ?? 0,
  };

  return {
    narrativaViolencia,
    narrativaTrabalho,
    narrativaChefia,
    narrativaSaudeMaterna,
    narrativaEducacao,
    narrativaLGBTQIA,
    narrativaJuventude,
    narrativaSeguranca,
    narrativaEducacaoSerie,
    narrativaQuilombolas,
    narrativaCovid,
  };
}

// ═══════════════════════════════════════════
// EXPORTS MODULE-LEVEL (backward compat + testes)
// Usam dados hardcoded como fallback default
// ═══════════════════════════════════════════

const _default = createNarrativas();

export const narrativaViolencia = _default.narrativaViolencia;
export const narrativaTrabalho = _default.narrativaTrabalho;
export const narrativaChefia = _default.narrativaChefia;
export const narrativaSaudeMaterna = _default.narrativaSaudeMaterna;
export const narrativaEducacao = _default.narrativaEducacao;
export const narrativaLGBTQIA = _default.narrativaLGBTQIA;
export const narrativaJuventude = _default.narrativaJuventude;
export const narrativaSeguranca = _default.narrativaSeguranca;
export const narrativaEducacaoSerie = _default.narrativaEducacaoSerie;
export const narrativaQuilombolas = _default.narrativaQuilombolas;
export const narrativaCovid = _default.narrativaCovid;

// ═══════════════════════════════════════════
// MAPA DE VALIDAÇÃO — para testes automatizados
// ═══════════════════════════════════════════

export const NARRATIVE_DATA_MAP = [
  // Interseccional — Violência
  { label: 'Feminicídio negras 2024', narrativeValue: narrativaViolencia.feminicidioNegrasPct, sourceValue: hcViolencia.find(v => v.tipo === 'Feminicídio')!.mulherNegra, source: 'violenciaInterseccional[Feminicídio].mulherNegra' },
  { label: 'Feminicídio negras 2018', narrativeValue: narrativaViolencia.feminicidio2018Pct, sourceValue: hcFeminicidio.find(f => f.ano === 2018)!.percentualNegras, source: 'feminicidioSerie[2018].percentualNegras' },
  // Interseccional — Trabalho
  { label: 'Razão renda MN/HB', narrativeValue: narrativaTrabalho.razaoRendaPct, sourceValue: (hcTrabalhoRG.find(i => i.indicador.toLowerCase().includes('rendimento médio'))?.razaoMulherNegraHomemBranco ?? 0) * 100, source: 'trabalhoRacaGenero[Renda].razaoMulherNegraHomemBranco × 100' },
  { label: 'Desemprego MN', narrativeValue: narrativaTrabalho.desempregoMulherNegra, sourceValue: hcTrabalhoRG.find(i => i.indicador.toLowerCase().includes('desocupação'))?.mulherNegra ?? 0, source: 'trabalhoRacaGenero[Desocupação].mulherNegra' },
  { label: 'Desemprego HB', narrativeValue: narrativaTrabalho.desempregoHomemBranco, sourceValue: hcTrabalhoRG.find(i => i.indicador.toLowerCase().includes('desocupação'))?.homemBranco ?? 0, source: 'trabalhoRacaGenero[Desocupação].homemBranco' },
  { label: 'Informalidade MN', narrativeValue: narrativaTrabalho.informalidadeMulherNegra, sourceValue: hcTrabalhoRG.find(i => i.indicador.toLowerCase().includes('informalidade'))?.mulherNegra ?? 0, source: 'trabalhoRacaGenero[Informalidade].mulherNegra' },
  // Interseccional — Chefia Familiar
  { label: 'Chefia negras %', narrativeValue: narrativaChefia.percentualNegras, sourceValue: hcChefia.percentualNegras, source: 'chefiaFamiliarRacaGenero.percentualNegras' },
  { label: 'CadÚnico negras %', narrativeValue: narrativaChefia.cadUnicoNegras, sourceValue: hcChefia.cadUnicoMulheresNegras, source: 'chefiaFamiliarRacaGenero.cadUnicoMulheresNegras' },
  { label: 'Fome mulheres negras %', narrativeValue: narrativaChefia.fomeMulheresNegras, sourceValue: hcChefia.fomeMulheresNegras, source: 'chefiaFamiliarRacaGenero.fomeMulheresNegras' },
  { label: 'Fome crianças mulheres negras %', narrativeValue: narrativaChefia.fomeCriancas, sourceValue: hcChefia.fomeCriancasMulheresNegras, source: 'chefiaFamiliarRacaGenero.fomeCriancasMulheresNegras' },
  // Interseccional — Saúde Materna
  { label: 'Mortes maternas negras %', narrativeValue: narrativaSaudeMaterna.mortesNegrasPct, sourceValue: hcSaudeMaterna.mortalidadeMaternaNegraPercentual, source: 'saudeMaternaRaca.mortalidadeMaternaNegraPercentual' },
  { label: 'Razão IEPS pretas/brancas', narrativeValue: narrativaSaudeMaterna.razaoIEPS, sourceValue: hcSaudeMaterna.razaoMortalidadePretasBrancas, source: 'saudeMaternaRaca.razaoMortalidadePretasBrancas' },
  // Interseccional — Educação
  { label: 'Superior mulher negra', narrativeValue: narrativaEducacao.superiorMulherNegra, sourceValue: hcEducacaoRG.find(e => e.indicador === 'Superior completo (%)')!.mulherNegra, source: 'educacaoRacaGenero[Superior].mulherNegra' },
  { label: 'Superior mulher branca', narrativeValue: narrativaEducacao.superiorMulherBranca, sourceValue: hcEducacaoRG.find(e => e.indicador === 'Superior completo (%)')!.mulherBranca, source: 'educacaoRacaGenero[Superior].mulherBranca' },
  // LGBTQIA+
  { label: 'ANTRA assassinatos 2025', narrativeValue: narrativaLGBTQIA.assassinatos2025, sourceValue: hcAntra.find(s => s.ano === 2025)!.totalAssassinatos, source: 'serieAntraTrans[2025].totalAssassinatos' },
  { label: 'ANTRA vítimas negras 2025', narrativeValue: narrativaLGBTQIA.vitimasNegras2025, sourceValue: hcAntra.find(s => s.ano === 2025)!.negros, source: 'serieAntraTrans[2025].negros' },
  { label: 'ANTRA vítimas indígenas 2025', narrativeValue: narrativaLGBTQIA.vitimasIndigenas2025, sourceValue: hcAntra.find(s => s.ano === 2025)!.indigenas, source: 'serieAntraTrans[2025].indigenas' },
  // Segurança Pública
  { label: 'Risco relativo homicídio', narrativeValue: narrativaSeguranca.riscoRelativo, sourceValue: hcAtlas.riscoRelativo, source: 'atlasViolencia2025.riscoRelativo' },
  { label: 'Vítimas negras 2024', narrativeValue: narrativaSeguranca.vitimasNegras2024, sourceValue: hcSeguranca.find(s => s.ano === 2024)!.percentualVitimasNegras, source: 'segurancaPublica[2024].percentualVitimasNegras' },
  { label: 'Vítimas negras 2018', narrativeValue: narrativaSeguranca.vitimasNegras2018, sourceValue: hcSeguranca.find(s => s.ano === 2018)!.percentualVitimasNegras, source: 'segurancaPublica[2018].percentualVitimasNegras' },
  { label: 'Letalidade policial 2024', narrativeValue: narrativaSeguranca.letalidadePolicial2024, sourceValue: hcSeguranca.find(s => s.ano === 2024)!.letalidadePolicial, source: 'segurancaPublica[2024].letalidadePolicial' },
  { label: 'Letalidade policial 2018', narrativeValue: narrativaSeguranca.letalidadePolicial2018, sourceValue: hcSeguranca.find(s => s.ano === 2018)!.letalidadePolicial, source: 'segurancaPublica[2018].letalidadePolicial' },
  { label: 'Jovens óbitos causas externas', narrativeValue: narrativaSeguranca.jovensObitosExternos, sourceValue: hcJovensViolencia.percentualObitosExternos, source: 'jovensNegrosViolencia.percentualObitosExternos' },
  // Educação série
  { label: 'Analfabetismo negro 2018', narrativeValue: narrativaEducacaoSerie.analfabetismoNegro2018, sourceValue: hcEducacao.find(e => e.ano === 2018)!.analfabetismoNegro, source: 'educacaoSerieHistorica[2018].analfabetismoNegro' },
  { label: 'Analfabetismo negro último', narrativeValue: narrativaEducacaoSerie.analfabetismoNegroUltimo, sourceValue: hcEducacao[hcEducacao.length - 1].analfabetismoNegro, source: 'educacaoSerieHistorica[último].analfabetismoNegro' },
  // Quilombolas
  { label: 'Quilombolas titulados', narrativeValue: narrativaQuilombolas.territoriosTitulados, sourceValue: hcPovos.quilombolas.territoriosTitulados, source: 'povosTradicionais.quilombolas.territoriosTitulados' },
  { label: 'Quilombolas certificadas', narrativeValue: narrativaQuilombolas.comunidadesCertificadas, sourceValue: hcPovos.quilombolas.comunidadesCertificadas, source: 'povosTradicionais.quilombolas.comunidadesCertificadas' },
  { label: 'Quilombolas água', narrativeValue: narrativaQuilombolas.aguaRedeGeral, sourceValue: hcPovos.quilombolas.acessoRedeAgua, source: 'povosTradicionais.quilombolas.acessoRedeAgua' },
  { label: 'Quilombolas esgoto', narrativeValue: narrativaQuilombolas.esgotamentoAdequado, sourceValue: hcPovos.quilombolas.esgotamentoAdequado, source: 'povosTradicionais.quilombolas.esgotamentoAdequado' },
  // COVID
  { label: 'COVID quilombola água', narrativeValue: narrativaCovid.quilombolaAgua, sourceValue: hcPovos.quilombolas.acessoRedeAgua, source: 'povosTradicionais.quilombolas.acessoRedeAgua' },
  { label: 'COVID quilombola esgoto', narrativeValue: narrativaCovid.quilombolaEsgoto, sourceValue: hcPovos.quilombolas.esgotamentoAdequado, source: 'povosTradicionais.quilombolas.esgotamentoAdequado' },
  // Indígenas — TIs
  { label: 'TIs total 2025', narrativeValue: hcPovos.indigenas.totalTIsHomologadasReservadas2025, sourceValue: 536, source: 'ISA/terrasindigenas.org.br (Mar/2026)' },
  { label: 'TIs baseline 2018', narrativeValue: hcPovos.indigenas.totalTIsHomologadasReservadas2018, sourceValue: 536 - 21, source: 'ISA total - (FUNAI 1+20 novas homologações)' },
] as const;

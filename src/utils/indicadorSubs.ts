/**
 * indicadorSubs — Registro SSoT dos SUB-INDICADORES (chaves internas de
 * registros guarda-chuva) que possuem bloco visual próprio nas abas
 * temáticas de Estatísticas.
 *
 * Por que existir:
 *  - Registros guarda-chuva (ex.: "Indicadores socioeconômicos por raça")
 *    concentram VÁRIOS gráficos sob um único código IND-NNN. O selo
 *    "IND-NNN · sub: ..." identifica o bloco, mas a busca só indexava o
 *    nome do guarda-chuva — o usuário não encontrava "renda média mensal".
 *  - Este registro torna cada sub-indicador LOCALIZÁVEL pelo próprio
 *    título (busca por palavra-chave + busca global), sempre apontando
 *    para o código canônico do guarda-chuva. NENHUM código novo é
 *    inventado (Regra de Ouro).
 *
 * Manutenção: ao adicionar um `sub=` em um <IndCodeBadge>, cadastre aqui
 * a entrada correspondente (nome do guarda-chuva EXATAMENTE como gravado
 * em `indicadores_interseccionais.nome`).
 */

export interface SubIndicadorEntry {
  /** código persistido e congelado do guarda-chuva */
  codigo: string;
  /** nome EXATO do registro guarda-chuva no BD */
  guardaChuva: string;
  /** rótulo curto exibido no selo (mesmo valor do prop `sub`) */
  sub: string;
  /** título do bloco/gráfico na aba — texto usado para busca e localização */
  titulo: string;
  /** aba onde o bloco é exibido */
  tabValue: string;
  abaLabel: string;
  /**
   * Sinônimos/descrições que aparecem no corpo do bloco (ex.: "chance de
   * assassinato para negros vs não negros") — só ampliam a BUSCA; nunca
   * são usados para localizar o bloco (isso é papel do `titulo`).
   */
  aliases?: string[];
}

/** Âncora estável do bloco visual, usada pela busca e pelo inventário. */
export function getSubIndicadorAnchor(codigo: string, sub: string): string {
  const slug = sub
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `ind-${codigo}-sub-${slug}`;
}

export const SUB_INDICADORES: SubIndicadorEntry[] = [
  // ── Guarda-chuva: Indicadores socioeconômicos por raça (Dados Gerais) ──
  {
    codigo: 'IND-119',
    guardaChuva: 'Indicadores socioeconômicos por raça (2018-2024)',
    sub: 'renda média mensal',
    titulo: 'Renda Média Mensal (R$)',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  {
    codigo: 'IND-119',
    guardaChuva: 'Indicadores socioeconômicos por raça (2018-2024)',
    sub: 'taxa de desocupação',
    titulo: 'Taxa de Desemprego (%)',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  {
    codigo: 'IND-119',
    guardaChuva: 'Indicadores socioeconômicos por raça (2018-2024)',
    sub: 'taxa de pobreza',
    titulo: 'Taxa de Pobreza: Negros × Brancos (%)',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  // ── Cards de resumo demográfico (Dados Gerais) ──
  {
    codigo: 'IND-130',
    guardaChuva: 'Composição racial — Censo 2022',
    sub: 'população total',
    titulo: 'População Total (Censo 2022)',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  {
    codigo: 'IND-130',
    guardaChuva: 'Composição racial — Censo 2022',
    sub: 'população negra',
    titulo: 'População Negra (Pretos + Pardos)',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  {
    codigo: 'IND-177',
    guardaChuva: 'Indígenas — dados demográficos Censo 2022',
    sub: 'população',
    titulo: 'Povos Indígenas (Censo 2022)',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  {
    codigo: 'IND-169',
    guardaChuva: 'Quilombolas — dados demográficos Censo 2022',
    sub: 'população',
    titulo: 'Quilombolas',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  // ── Guarda-chuva: Segurança pública — homicídio por raça (Segurança/Saúde/Educação) ──
  {
    codigo: 'IND-117',
    guardaChuva: 'Segurança pública — homicídio por raça (2018-2024)',
    sub: 'taxa de homicídio',
    titulo: 'Taxa de Homicídio (por 100 mil)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
  },
  {
    codigo: 'IND-117',
    guardaChuva: 'Segurança pública — homicídio por raça (2018-2024)',
    sub: 'letalidade policial',
    titulo: 'Letalidade Policial - % de Negros entre Vítimas',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
    aliases: ['vítimas de intervenção policial', 'mortes por ação policial', '% negros entre vítimas'],
  },
  // ── Guarda-chuva: Atlas da Violência 2025 — dados-chave (Segurança/Saúde/Educação) ──
  {
    codigo: 'IND-110',
    guardaChuva: 'Atlas da Violência 2025 — dados-chave',
    sub: 'risco relativo',
    titulo: 'Vulnerabilidade Letal (Risco Relativo)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
    aliases: ['chance de assassinato para negros vs não negros', 'risco de homicídio relativo', 'razão de vitimização'],
  },
  {
    codigo: 'IND-110',
    guardaChuva: 'Atlas da Violência 2025 — dados-chave',
    sub: 'queda de homicídios',
    titulo: 'Queda de Homicídios (2018→2023)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
  },
  // ── Guarda-chuva: Educação — série histórica por raça (Segurança/Saúde/Educação) ──
  {
    codigo: 'IND-129',
    guardaChuva: 'Educação — série histórica por raça (2018-2024)',
    sub: 'ensino superior completo',
    titulo: 'Ensino Superior Completo (%)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
  },
  {
    codigo: 'IND-129',
    guardaChuva: 'Educação — série histórica por raça (2018-2024)',
    sub: 'taxa de analfabetismo',
    titulo: 'Taxa de Analfabetismo (%)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
  },
  // ── Guarda-chuva: Saúde — mortalidade materna e infantil por raça (Segurança/Saúde/Educação) ──
  {
    codigo: 'IND-122',
    guardaChuva: 'Saúde — mortalidade materna e infantil por raça (2018-2024)',
    sub: 'mortalidade materna',
    titulo: 'Mortalidade Materna (por 100 mil NV)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
  },
  {
    codigo: 'IND-122',
    guardaChuva: 'Saúde — mortalidade materna e infantil por raça (2018-2024)',
    sub: 'mortalidade infantil',
    titulo: 'Mortalidade Infantil (por mil nascidos vivos)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
  },
  // ── Vulnerabilidades ──
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'vulnerabilidade multidimensional', titulo: 'Vulnerabilidade Multidimensional — Raça × Gênero × Renda', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades' },
  { codigo: 'IND-161', guardaChuva: 'Evolução das desigualdades raciais (2018-2024)', sub: 'razões de desigualdade racial', titulo: 'Evolução das Razões de Desigualdade Racial (2018-2024)', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades' },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'chefia e proteção social', titulo: 'Chefia Familiar e Proteção Social', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades' },
  { codigo: 'IND-113', guardaChuva: 'Interseccionalidade trabalho — raça × gênero (Q2 2024)', sub: 'cruzamento trabalho', titulo: 'Cruzamento: Raça × Gênero (Trabalho)', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades' },
  // ── Raça × Gênero ──
  { codigo: 'IND-126', guardaChuva: 'Violência interseccional — gênero e raça (2024)', sub: 'violência contra mulheres', titulo: 'Violência contra Mulheres por Raça', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-123', guardaChuva: 'Trabalho — indicadores raça × gênero (DIEESE 2025)', sub: 'mercado de trabalho', titulo: 'Mercado de Trabalho por Raça × Gênero', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'chefia e vulnerabilidade', titulo: 'Chefia Familiar e Vulnerabilidade por Raça × Gênero', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-118', guardaChuva: 'Saúde materna — raça e gênero', sub: 'saúde materna', titulo: 'Saúde Materna por Raça', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-125', guardaChuva: 'CadÚnico — perfil racial beneficiários (2018-2025)', sub: 'perfil racial', titulo: 'Perfil Racial dos Beneficiários do CadÚnico', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-116', guardaChuva: 'Educação — raça × gênero (Censo 2022)', sub: 'educação raça e gênero', titulo: 'Educação por Raça × Gênero', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  // ── LGBTQIA+, Deficiência, Juventude e Classe ──
  { codigo: 'IND-120', guardaChuva: 'Violência contra pessoas trans — série ANTRA (2017-2025)', sub: 'assassinatos trans e travestis', titulo: 'Assassinatos de Pessoas Trans e Travestis por Raça — 2017-2025 (%)', tabValue: 'lgbtqia', abaLabel: 'LGBTQIA+' },
  { codigo: 'IND-132', guardaChuva: 'Deficiência por raça — Censo 2022 / PNADC', sub: 'pessoas com deficiência', titulo: 'Pessoas com Deficiência por Raça', tabValue: 'deficiencia', abaLabel: 'Deficiência' },
  { codigo: 'IND-132', guardaChuva: 'Deficiência por raça — Censo 2022 / PNADC', sub: 'disparidades pcd', titulo: 'Disparidades Interseccionais PcD', tabValue: 'deficiencia', abaLabel: 'Deficiência' },
  { codigo: 'IND-114', guardaChuva: 'Juventude negra — indicadores comparativos', sub: 'comparativo juventude negra', titulo: 'Indicadores da Juventude Negra — Comparativo', tabValue: 'juventude', abaLabel: 'Juventude' },
  { codigo: 'IND-121', guardaChuva: 'Jovens negros — violência e encarceramento', sub: 'violência letal juventude', titulo: 'Violência Letal — Juventude', tabValue: 'juventude', abaLabel: 'Juventude' },
  { codigo: 'IND-121', guardaChuva: 'Jovens negros — violência e encarceramento', sub: 'ivj-n', titulo: 'IVJ-N — Vulnerabilidade da Juventude Negra', tabValue: 'juventude', abaLabel: 'Juventude' },
  // ── Administração Pública ──
  { codigo: 'IND-180', guardaChuva: 'ESTADIC 2024 — Gestores de Igualdade Racial por Raça/Gênero', sub: 'perfil dos gestores', titulo: 'Cor/Raça dos Gestores de Igualdade Racial (ESTADIC 2024)', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-179', guardaChuva: 'ESTADIC 2024 — Estrutura de Igualdade Racial nos Estados', sub: 'legislação estadual', titulo: 'Legislação Estadual sobre Igualdade Racial', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-179', guardaChuva: 'ESTADIC 2024 — Estrutura de Igualdade Racial nos Estados', sub: 'grupos não contemplados', titulo: 'Lacunas: Grupos Não Contemplados por Programas Estaduais', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-179', guardaChuva: 'ESTADIC 2024 — Estrutura de Igualdade Racial nos Estados', sub: 'estrutura institucional', titulo: 'Estrutura Institucional Estadual', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-176', guardaChuva: 'SINAPIR — Adesões ao Sistema Nacional (2014-2024)', sub: 'evolução das adesões', titulo: 'Evolução das Adesões ao SINAPIR', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-176', guardaChuva: 'SINAPIR — Adesões ao Sistema Nacional (2014-2024)', sub: 'modalidades de gestão', titulo: 'Modalidades de Gestão do SINAPIR', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-176', guardaChuva: 'SINAPIR — Adesões ao Sistema Nacional (2014-2024)', sub: 'capitais aderidas', titulo: 'Capitais que Aderiram em 2024', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-176', guardaChuva: 'SINAPIR — Adesões ao Sistema Nacional (2014-2024)', sub: 'estados com mais adesões', titulo: 'Estados com Mais Adesões Municipais (2024)', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  // ── COVID ──
  { codigo: 'IND-178', guardaChuva: 'Excesso de mortalidade por raça — COVID-19 (2020)', sub: 'excesso de mortalidade', titulo: 'Excesso de Mortalidade Negra (2020)', tabValue: 'covid-racial', abaLabel: 'COVID' },
  { codigo: 'IND-175', guardaChuva: 'Letalidade hospitalar COVID por raça — Moreira et al. (2023)', sub: 'letalidade hospitalar', titulo: 'Letalidade Hospitalar por COVID-19 e Raça', tabValue: 'covid-racial', abaLabel: 'COVID' },
  { codigo: 'IND-173', guardaChuva: 'Mortalidade materna COVID por raça (2019-2022)', sub: 'mortalidade materna', titulo: 'Mortalidade Materna na Pandemia por Raça', tabValue: 'covid-racial', abaLabel: 'COVID' },
  { codigo: 'IND-172', guardaChuva: 'Impacto socioeconômico COVID por raça — PNAD COVID 2020', sub: 'mercado de trabalho', titulo: 'Impacto da Pandemia no Mercado de Trabalho por Raça', tabValue: 'covid-racial', abaLabel: 'COVID' },
  { codigo: 'IND-171', guardaChuva: 'Vacinação COVID por raça — SI-PNI/DataSUS', sub: 'cobertura vacinal', titulo: 'Cobertura Vacinal por Raça/Cor', tabValue: 'covid-racial', abaLabel: 'COVID' },
  { codigo: 'IND-168', guardaChuva: 'Interseccionalidade COVID — impacto por grupo', sub: 'impacto interseccional', titulo: 'Análise Interseccional: COVID-19 e Grupos Vulnerabilizados', tabValue: 'covid-racial', abaLabel: 'COVID' },
  // ── Grupos Focais ──
  { codigo: 'IND-169', guardaChuva: 'Quilombolas — dados demográficos Censo 2022', sub: 'população focal', titulo: 'Quilombolas', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais' },
  { codigo: 'IND-177', guardaChuva: 'Indígenas — dados demográficos Censo 2022', sub: 'população focal', titulo: 'Indígenas', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais' },
  { codigo: 'IND-159', guardaChuva: 'Povos ciganos/Romani — dados disponíveis', sub: 'população focal', titulo: 'Ciganos/Roma', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais' },
  { codigo: 'IND-170', guardaChuva: 'Juventude Negra (15-29) — dados demográficos', sub: 'população focal', titulo: 'Juventude Negra (15-29 anos)', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais' },
  { codigo: 'IND-162', guardaChuva: 'Terras quilombolas — série histórica (2018-2025)', sub: 'situação territorial', titulo: 'Situação Territorial - Quilombolas', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais' },
  { codigo: 'IND-182', guardaChuva: 'Demarcação de Terras Indígenas — situação fundiária', sub: 'situação territorial', titulo: 'Situação Territorial - Povos Indígenas', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais' },
];

// ── Regra "guarda-chuva com subs não é evidência" ─────────────────────
// Quando um registro canônico possui blocos visuais próprios (subindicadores),
// é neles que estão o título temático e os valores. Nesses casos o
// guarda-chuva deixa de ser exibido na busca, no inventário e no rol de
// evidências — apenas os subindicadores aparecem. Nenhum código novo é
// criado: cada sub carrega o código congelado do pai (IND-NNN · sub: …).

const _norm = (s: string) => String(s || '').trim().toLowerCase();

const GUARDA_CHUVAS_COM_SUBS = new Set(SUB_INDICADORES.map((s) => _norm(s.guardaChuva)));

/** true quando o registro canônico possui subindicadores visuais próprios. */
export function hasSubIndicadores(nome: string): boolean {
  return GUARDA_CHUVAS_COM_SUBS.has(_norm(nome));
}

/** Subindicadores de um guarda-chuva (vazio quando não houver). */
export function getSubsForGuardaChuva(nome: string): SubIndicadorEntry[] {
  return SUB_INDICADORES.filter((s) => _norm(s.guardaChuva) === _norm(nome));
}

/** Chave única de evidência: guarda-chuva sem subs → nome; sub → "nome#sub". */
export function evidenceKey(nome: string, sub?: string | null): string {
  return sub ? `${nome}#${sub}` : nome;
}

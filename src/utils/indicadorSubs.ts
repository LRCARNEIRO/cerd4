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
  /**
   * Outras abas onde o MESMO bloco visual é reexibido (ex.: a série de
   * homicídios aparece em Segurança/Saúde/Educação e em Grupos Focais).
   * Evita duplicar a entrada no registro (e no inventário).
   */
  tambemEm?: Array<{ tabValue: string; abaLabel: string }>;

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
  // Cada card do bloco "Vulnerabilidade Multidimensional" é um dado próprio
  // (fonte e recorte distintos) — por isso cada um é um subindicador
  // localizável/vinculável, e não um único sub agregador.
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'chefia monoparental feminina negra', titulo: 'Chefia monoparental feminina negra', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades', aliases: ['famílias monoparentais chefiadas por mulheres negras', 'Censo 2022 SIDRA 10179'] },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'fome em lares de mulheres negras', titulo: 'Fome — domicílios chefiados por mulheres negras', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades', aliases: ['Fome em lares de mulheres negras', 'insegurança alimentar grave', 'Fiocruz DSBR 2023'], tambemEm: [{ tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' }] },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'segurança alimentar em lares de mulheres negras', titulo: 'Segurança alimentar — domicílios chefiados por mulheres negras', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades', aliases: ['Segurança alimentar c/ crianças — mulheres negras vs homens brancos', 'segurança alimentar por raça e gênero'], tambemEm: [{ tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' }] },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'taxa de vulnerabilidade de famílias chefiadas por mulheres negras', titulo: 'Taxa de Vulnerabilidade — famílias chefiadas por mulheres negras', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades', aliases: ['rendimento per capita até 1/2 salário mínimo'] },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'escolaridade não protege mulheres negras', titulo: 'Escolaridade não protege (mulheres negras)', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades', aliases: ['IA mod.+grave c/ 8+ anos estudo (mulheres negras vs homens brancos)', 'insegurança alimentar moderada e grave com 8+ anos de estudo'], tambemEm: [{ tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' }] },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'cadúnico mulheres negras', titulo: 'CadÚnico — mulheres negras', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades', aliases: ['Mulheres negras no CadÚnico', 'beneficiárias do Cadastro Único por raça'], tambemEm: [{ tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' }] },
  { codigo: 'IND-161', guardaChuva: 'Evolução das desigualdades raciais (2018-2024)', sub: 'razões de desigualdade racial', titulo: 'Evolução das Razões de Desigualdade Racial (2018-2024)', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades' },
  { codigo: 'IND-113', guardaChuva: 'Interseccionalidade trabalho — raça × gênero (Q2 2024)', sub: 'cruzamento trabalho', titulo: 'Cruzamento: Raça × Gênero (Trabalho)', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades' },
  // ── Raça × Gênero ──
  { codigo: 'IND-118', guardaChuva: 'Saúde materna — raça e gênero', sub: 'saúde materna', titulo: 'Saúde Materna por Raça', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero', aliases: ['Saúde × Raça × Classe'], tambemEm: [{ tabValue: 'classe', abaLabel: 'Classe Social' }] },
  { codigo: 'IND-125', guardaChuva: 'CadÚnico — perfil racial beneficiários (2018-2025)', sub: 'perfil racial', titulo: 'Perfil Racial dos Beneficiários do CadÚnico', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero', aliases: ['Perfil Racial dos Beneficiários do CadÚnico — Negros × Brancos (2018–2025)'] },
  { codigo: 'IND-116', guardaChuva: 'Educação — raça × gênero (Censo 2022)', sub: 'educação raça e gênero', titulo: 'Educação por Raça × Gênero', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  // ── LGBTQIA+, Deficiência, Juventude e Classe ──
  { codigo: 'IND-120', guardaChuva: 'Violência contra pessoas trans — série ANTRA (2017-2025)', sub: 'assassinatos trans e travestis', titulo: 'Assassinatos de Pessoas Trans e Travestis por Raça — 2017-2025 (%)', tabValue: 'lgbtqia', abaLabel: 'LGBTQIA+' },
  { codigo: 'IND-132', guardaChuva: 'Deficiência por raça — Censo 2022 / PNADC', sub: 'pessoas com deficiência', titulo: 'Pessoas com Deficiência por Raça', tabValue: 'deficiencia', abaLabel: 'Deficiência' },
  { codigo: 'IND-132', guardaChuva: 'Deficiência por raça — Censo 2022 / PNADC', sub: 'disparidades pcd', titulo: 'Disparidades Interseccionais PcD', tabValue: 'deficiencia', abaLabel: 'Deficiência', aliases: ['Disparidades Interseccionais PcD (14-59 anos)'] },
  { codigo: 'IND-121', guardaChuva: 'Jovens negros — violência e encarceramento', sub: 'violência letal juventude', titulo: 'Violência Letal — Juventude', tabValue: 'juventude', abaLabel: 'Juventude', aliases: ['Violência Letal — Juventude (15-29 anos)'] },
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
  { codigo: 'IND-178', guardaChuva: 'Excesso de mortalidade por raça — COVID-19 (2020)', sub: 'óbitos em excesso', titulo: 'Óbitos em Excesso (Negros, 2020)', tabValue: 'covid-racial', abaLabel: 'COVID', aliases: ['mortes acima do esperado entre negros na pandemia'] },
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
  // ── Grupos Focais › Série Temporal (cada linha é um dado próprio) ──
  { codigo: 'IND-117', guardaChuva: 'Segurança pública — homicídio por raça (2018-2024)', sub: 'vítimas negras de homicídio', titulo: 'Vítimas negras de homicídio (%)', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais', aliases: ['% de negros entre vítimas de homicídio', 'FBSP'] },
  { codigo: 'IND-197', guardaChuva: 'População carcerária por raça/cor', sub: 'encarceramento juvenil negro', titulo: 'Encarceramento juvenil negro (%)', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais', aliases: ['jovens negros na população carcerária', '19º Anuário FBSP 2025'] },
  { codigo: 'IND-112', guardaChuva: 'Feminicídio — série histórica (2018-2024)', sub: 'feminicídio mulheres negras', titulo: 'Feminicídio mulheres negras (%)', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais', aliases: ['% de mulheres negras entre vítimas de feminicídio'] },
  { codigo: 'IND-182', guardaChuva: 'Demarcação de Terras Indígenas — situação fundiária', sub: 'tis homologadas e reservadas', titulo: 'TIs homologadas + reservadas (acumulado)', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais', aliases: ['ISA terrasindigenas.org.br', 'homologações FUNAI'] },
  // ── Grupos Focais › Direitos Territoriais (Quilombolas — IND-162) ──
  { codigo: 'IND-162', guardaChuva: 'Terras quilombolas — série histórica (2018-2025)', sub: 'territórios titulados', titulo: 'Territórios Titulados', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais', aliases: ['títulos expedidos INCRA'] },
  { codigo: 'IND-162', guardaChuva: 'Terras quilombolas — série histórica (2018-2025)', sub: 'territórios em processo', titulo: 'Territórios em Processo (INCRA)', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais', aliases: ['processos abertos INCRA'] },
  { codigo: 'IND-162', guardaChuva: 'Terras quilombolas — série histórica (2018-2025)', sub: 'certidões fcp', titulo: 'Certidões FCP (Palmares)', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais', aliases: ['comunidades certificadas Fundação Palmares'] },
  { codigo: 'IND-162', guardaChuva: 'Terras quilombolas — série histórica (2018-2025)', sub: 'área titulada', titulo: 'Área Titulada (hectares)', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais' },
  { codigo: 'IND-162', guardaChuva: 'Terras quilombolas — série histórica (2018-2025)', sub: 'evolução territorial quilombola', titulo: 'Evolução Territorial Quilombola 2018→2025', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais', aliases: ['titulados 155 → 245', 'certidões 2.523 → 3.158'] },
  // ── Grupos Focais › Direitos Territoriais (Indígenas — IND-182) ──
  { codigo: 'IND-182', guardaChuva: 'Demarcação de Terras Indígenas — situação fundiária', sub: 'total de tis registradas', titulo: 'Total de TIs Registradas', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais', aliases: ['FUNAI Geoprocessamento'] },
  { codigo: 'IND-182', guardaChuva: 'Demarcação de Terras Indígenas — situação fundiária', sub: 'tis homologadas ou regularizadas', titulo: 'TIs Homologadas/Regularizadas', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais' },
  { codigo: 'IND-182', guardaChuva: 'Demarcação de Terras Indígenas — situação fundiária', sub: 'etnias reconhecidas', titulo: 'Etnias (Censo 2022)', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais' },
  { codigo: 'IND-182', guardaChuva: 'Demarcação de Terras Indígenas — situação fundiária', sub: 'línguas vivas', titulo: 'Línguas (Censo 2022)', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais' },
  { codigo: 'IND-182', guardaChuva: 'Demarcação de Terras Indígenas — situação fundiária', sub: 'fases do processo demarcatório', titulo: 'Avanços por Fase do Processo Demarcatório (FUNAI)', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais', aliases: ['em estudo, delimitada, declarada, homologada'] },
  { codigo: 'IND-182', guardaChuva: 'Demarcação de Terras Indígenas — situação fundiária', sub: 'evolução territorial indígena', titulo: 'Evolução Territorial Indígena 2018→2025', tabValue: 'grupos-focais', abaLabel: 'Grupos Focais', aliases: ['homologadas 487 → 496', 'total TIs 626 → 646'] },
  // ── Blocos com dado próprio identificados na varredura de abas (v22) ──
  // Cada card com número próprio é um bloco autônomo (evita selo duplicado).
  { codigo: 'IND-179', guardaChuva: 'ESTADIC 2024 — Estrutura de Igualdade Racial nos Estados', sub: 'ufs com estrutura', titulo: 'UFs com Estrutura de Igualdade Racial', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-179', guardaChuva: 'ESTADIC 2024 — Estrutura de Igualdade Racial nos Estados', sub: 'ufs com legislação', titulo: 'UFs com Legislação Específica', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-176', guardaChuva: 'SINAPIR — Adesões ao Sistema Nacional (2014-2024)', sub: 'total de adesões', titulo: 'Total de Adesões', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-176', guardaChuva: 'SINAPIR — Adesões ao Sistema Nacional (2014-2024)', sub: 'novas adesões 2024', titulo: 'Novas Adesões em 2024', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-176', guardaChuva: 'SINAPIR — Adesões ao Sistema Nacional (2014-2024)', sub: 'estados aderidos', titulo: 'Estados Aderidos', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-176', guardaChuva: 'SINAPIR — Adesões ao Sistema Nacional (2014-2024)', sub: 'cobertura municipal', titulo: 'Cobertura Municipal', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-175', guardaChuva: 'Letalidade hospitalar COVID por raça — Moreira et al. (2023)', sub: 'letalidade hospitalar indígenas', titulo: 'Letalidade Hospitalar (Indígenas)', tabValue: 'covid-racial', abaLabel: 'COVID' },
  { codigo: 'IND-173', guardaChuva: 'Mortalidade materna COVID por raça (2019-2022)', sub: 'rmm mães pretas', titulo: 'RMM Mães Pretas (pico 2021)', tabValue: 'covid-racial', abaLabel: 'COVID' },
  { codigo: 'IND-120', guardaChuva: 'Violência contra pessoas trans — série ANTRA (2017-2025)', sub: 'série anual antra', titulo: 'Dados Anuais — Assassinatos de Pessoas Trans e Travestis', tabValue: 'lgbtqia', abaLabel: 'LGBTQIA+' },
  { codigo: 'IND-179', guardaChuva: 'ESTADIC 2024 — Estrutura de Igualdade Racial nos Estados', sub: 'canal de denúncia racial', titulo: 'UFs com Canal de Denúncia Racial', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-179', guardaChuva: 'ESTADIC 2024 — Estrutura de Igualdade Racial nos Estados', sub: 'fundo de igualdade racial', titulo: 'UFs com Fundo de Igualdade Racial', tabValue: 'adm-publica', abaLabel: 'Adm Pública' },
  { codigo: 'IND-109', guardaChuva: 'LGBTQIA+ — vítimas por raça (2025)', sub: 'assassinatos 2025', titulo: 'Assassinatos de pessoas trans e travestis (2025)', tabValue: 'lgbtqia', abaLabel: 'LGBTQIA+', aliases: ['Assassinatos (2025)'] },
  { codigo: 'IND-109', guardaChuva: 'LGBTQIA+ — vítimas por raça (2025)', sub: 'vítimas negras', titulo: 'Vítimas negras entre pessoas trans assassinadas (%)', tabValue: 'lgbtqia', abaLabel: 'LGBTQIA+', aliases: ['Vítimas negras'] },
  { codigo: 'IND-109', guardaChuva: 'LGBTQIA+ — vítimas por raça (2025)', sub: 'vítimas indígenas', titulo: 'Vítimas indígenas entre pessoas trans assassinadas', tabValue: 'lgbtqia', abaLabel: 'LGBTQIA+', aliases: ['Vítimas indígenas'] },
  { codigo: 'IND-120', guardaChuva: 'Violência contra pessoas trans — série ANTRA (2017-2025)', sub: 'tendência da série antra', titulo: 'Tendência da série ANTRA 2017→2025', tabValue: 'lgbtqia', abaLabel: 'LGBTQIA+', aliases: ['Tendência 2017→2025'] },
  { codigo: 'IND-110', guardaChuva: 'Atlas da Violência 2025 — dados-chave', sub: 'juventude negra atlas', titulo: 'Atlas da Violência 2025 (IPEA/FBSP) — Juventude Negra (15-29 anos)', tabValue: 'juventude', abaLabel: 'Juventude' },
  { codigo: 'IND-014', guardaChuva: 'População quilombola por região — Censo 2022', sub: 'quilombolas por uf', titulo: 'População Quilombola por UF — Censo 2022', tabValue: 'complemento-cerd3', abaLabel: 'Complemento CERD III' },
  // ── Cotas Raciais (Adm Pública) — registro canônico IND-211 ──
  { codigo: 'IND-211', guardaChuva: 'Cotas Raciais — Ações Afirmativas no Serviço Público e Educação Superior', sub: 'cotas no serviço público federal', titulo: 'Cotas Raciais no Serviço Público Federal', tabValue: 'adm-publica', abaLabel: 'Adm Pública', aliases: ['Lei 12.990/2014 → Lei 15.142/2025'] },
  { codigo: 'IND-211', guardaChuva: 'Cotas Raciais — Ações Afirmativas no Serviço Público e Educação Superior', sub: 'ingresso por cotas nas universidades federais', titulo: 'Ingresso por Cotas Raciais em Universidades Federais', tabValue: 'adm-publica', abaLabel: 'Adm Pública', aliases: ['Crescimento de 493% no critério étnico-racial (2012→2022)'] },
  // ── v24: granularidade por DADO (cada número/gráfico ganha seu próprio selo) ──
  // COVID › Estudo Peres et al. (2021) — IND-212
  { codigo: 'IND-212', guardaChuva: 'Acesso a UTI e mortalidade hospitalar COVID por raça — Peres et al. (2021)', sub: 'acesso a uti e ventilação invasiva', titulo: 'Acesso a UTI e Ventilação Invasiva por Raça', tabValue: 'covid-racial', abaLabel: 'COVID' },
  { codigo: 'IND-212', guardaChuva: 'Acesso a UTI e mortalidade hospitalar COVID por raça — Peres et al. (2021)', sub: 'odds ratios de mortalidade hospitalar', titulo: 'Odds Ratios Ajustados — Mortalidade Hospitalar', tabValue: 'covid-racial', abaLabel: 'COVID' },
  { codigo: 'IND-212', guardaChuva: 'Acesso a UTI e mortalidade hospitalar COVID por raça — Peres et al. (2021)', sub: 'mortalidade por escolaridade e raça', titulo: 'Mortalidade Hospitalar por Escolaridade e Raça (%)', tabValue: 'covid-racial', abaLabel: 'COVID' },
  // Raça × Gênero › Violência contra Mulheres — IND-126
  { codigo: 'IND-126', guardaChuva: 'Violência interseccional — gênero e raça (2024)', sub: 'proporção de vítimas por raça', titulo: 'Proporção de vítimas por raça (%)', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero', aliases: ['feminicídio e estupro por raça da vítima'] },
  { codigo: 'IND-126', guardaChuva: 'Violência interseccional — gênero e raça (2024)', sub: 'notificações de violência doméstica', titulo: 'Notificações — dados absolutos', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero', aliases: ['violência doméstica DataSUS/SINAN'] },
  // Raça × Gênero › Mercado de Trabalho (DIEESE 2025) — IND-123
  { codigo: 'IND-123', guardaChuva: 'Trabalho — indicadores raça × gênero (DIEESE 2025)', sub: 'rendimento médio', titulo: 'Rendimento médio (DIEESE 2025)', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-123', guardaChuva: 'Trabalho — indicadores raça × gênero (DIEESE 2025)', sub: 'taxa de desemprego', titulo: 'Taxa de desemprego (DIEESE 2025, %)', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-123', guardaChuva: 'Trabalho — indicadores raça × gênero (DIEESE 2025)', sub: 'informalidade', titulo: 'Informalidade (DIEESE 2025, %)', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  // Raça × Gênero › Chefia Familiar e Vulnerabilidade — IND-128
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'mulheres chefes monoparentais', titulo: 'Mulheres chefes monoparentais', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'homens chefes monoparentais', titulo: 'Homens chefes monoparentais', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'fome em lares com crianças menores de 10', titulo: 'Fome em lares c/ crianças <10 (mulheres negras)', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'fome e desemprego', titulo: 'Fome + desemprego (mulheres negras)', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'cadúnico mulheres brancas', titulo: 'Mulheres brancas no CadÚnico', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'total em fome no brasil', titulo: 'Contexto: total em fome no Brasil (2022)', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  // Vulnerabilidades › Chefia Familiar e Proteção Social — IND-128
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'famílias monoparentais femininas', titulo: 'Famílias monoparentais femininas', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades' },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'chefia feminina negra (sidra 10179)', titulo: 'Chefiadas por mulheres negras (SIDRA 10179)', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades' },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'cadúnico mulheres negras vs brancas', titulo: 'CadÚnico (mulheres)', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades' },
  { codigo: 'IND-128', guardaChuva: 'Chefia familiar monoparental — raça × gênero', sub: 'chefia monoparental negras vs brancas', titulo: 'Chefia monoparental', tabValue: 'vulnerabilidades', abaLabel: 'Vulnerabilidades' },
  // Raça × Gênero › Saúde Materna — IND-118
  { codigo: 'IND-118', guardaChuva: 'Saúde materna — raça e gênero', sub: 'mortes maternas negras', titulo: 'Mortes maternas negras', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  { codigo: 'IND-118', guardaChuva: 'Saúde materna — raça e gênero', sub: 'mortes maternas brancas', titulo: 'Mortes maternas brancas', tabValue: 'raca-genero', abaLabel: 'Raça × Gênero' },
  // Juventude › Indicadores da Juventude Negra (cada linha é um dado próprio) — IND-114
  { codigo: 'IND-114', guardaChuva: 'Juventude negra — indicadores comparativos', sub: 'homicídio juventude (geral)', titulo: 'Taxa de homicídio (por 100 mil) — GERAL', tabValue: 'juventude', abaLabel: 'Juventude' },
  { codigo: 'IND-114', guardaChuva: 'Juventude negra — indicadores comparativos', sub: 'encarceramento juvenil', titulo: 'Encarceramento (% do total)', tabValue: 'juventude', abaLabel: 'Juventude' },
  { codigo: 'IND-114', guardaChuva: 'Juventude negra — indicadores comparativos', sub: 'analfabetismo 15-29', titulo: 'Analfabetismo jovens negros 15-29 (%)', tabValue: 'juventude', abaLabel: 'Juventude' },
  { codigo: 'IND-114', guardaChuva: 'Juventude negra — indicadores comparativos', sub: 'desemprego 18-24', titulo: 'Desemprego jovens negros 18-24 (%)', tabValue: 'juventude', abaLabel: 'Juventude' },
  { codigo: 'IND-114', guardaChuva: 'Juventude negra — indicadores comparativos', sub: 'medidas socioeducativas (%)', titulo: 'Jovens em medidas socioeducativas (%)', tabValue: 'juventude', abaLabel: 'Juventude' },
  { codigo: 'IND-114', guardaChuva: 'Juventude negra — indicadores comparativos', sub: 'adolescentes em medidas socioeducativas', titulo: 'Jovens em medidas socioeducativas', tabValue: 'juventude', abaLabel: 'Juventude', aliases: ['Alma Preta — Adolescentes em unidades socioeducativas'] },
  { codigo: 'IND-114', guardaChuva: 'Juventude negra — indicadores comparativos', sub: 'vítimas de homicídio', titulo: 'Vítimas de homicídio jovens negros (%)', tabValue: 'juventude', abaLabel: 'Juventude' },
  // Classe Social › Mobilidade Social Intergeracional — IND-213
  { codigo: 'IND-213', guardaChuva: 'Mobilidade social intergeracional e concentração de renda por raça', sub: 'gerações para alcançar renda média', titulo: 'Gerações para família pobre alcançar renda média', tabValue: 'classe', abaLabel: 'Classe Social' },
  { codigo: 'IND-213', guardaChuva: 'Mobilidade social intergeracional e concentração de renda por raça', sub: 'rendimento por hora negros vs brancos', titulo: 'Rendimento/hora negros vs brancos', tabValue: 'classe', abaLabel: 'Classe Social' },
  { codigo: 'IND-213', guardaChuva: 'Mobilidade social intergeracional e concentração de renda por raça', sub: 'concentração de riqueza no 1% mais rico', titulo: '1% mais rico detém', tabValue: 'classe', abaLabel: 'Classe Social' },
];


// Blocos já cadastrados em outra aba que TAMBÉM são exibidos em Grupos Focais
// (Série Temporal). Reexibição não cria código nem entrada nova — só amplia a
// localização do mesmo bloco.
const GF_ABA = { tabValue: 'grupos-focais', abaLabel: 'Grupos Focais' };
const REEXIBIDOS_EM_GRUPOS_FOCAIS = new Set([
  'IND-117#taxa de homicídio',
  'IND-117#letalidade policial',
  'IND-119#renda média mensal',
  'IND-119#taxa de desocupação',
  'IND-119#taxa de pobreza',
  'IND-129#ensino superior completo',
  'IND-129#taxa de analfabetismo',
  'IND-122#mortalidade materna',
  'IND-121#violência letal juventude',
  'IND-121#ivj-n',
]);

// Blocos reexibidos em Classe Social (mesmo card, outra aba).
const CLASSE_ABA = { tabValue: 'classe', abaLabel: 'Classe Social' };
SUB_INDICADORES.forEach((s) => {
  if (s.codigo === 'IND-122' && s.sub === 'mortalidade materna') {
    s.aliases = [...(s.aliases || []), 'Mortalidade Materna por Raça'];
    s.tambemEm = [...(s.tambemEm || []), CLASSE_ABA];
  }
});
SUB_INDICADORES.forEach((s) => {
  if (REEXIBIDOS_EM_GRUPOS_FOCAIS.has(`${s.codigo}#${s.sub}`)) {
    s.tambemEm = [...(s.tambemEm || []), GF_ABA];
  }
});

/** Todas as abas onde o bloco visual do sub-indicador é exibido. */
export function abasDoSub(sub: SubIndicadorEntry) {
  return [{ tabValue: sub.tabValue, abaLabel: sub.abaLabel }, ...(sub.tambemEm || [])];
}


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

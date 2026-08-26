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

export const SUB_INDICADORES: SubIndicadorEntry[] = [
  // ── Guarda-chuva: Indicadores socioeconômicos por raça (Dados Gerais) ──
  {
    guardaChuva: 'Indicadores socioeconômicos por raça (2018-2024)',
    sub: 'renda média mensal',
    titulo: 'Renda Média Mensal (R$)',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  {
    guardaChuva: 'Indicadores socioeconômicos por raça (2018-2024)',
    sub: 'taxa de desocupação',
    titulo: 'Taxa de Desemprego (%)',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  {
    guardaChuva: 'Indicadores socioeconômicos por raça (2018-2024)',
    sub: 'taxa de pobreza',
    titulo: 'Taxa de Pobreza: Negros × Brancos (%)',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  // ── Cards de resumo demográfico (Dados Gerais) ──
  {
    guardaChuva: 'Composição racial — Censo 2022',
    sub: 'população total',
    titulo: 'População Total (Censo 2022)',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  {
    guardaChuva: 'Composição racial — Censo 2022',
    sub: 'população negra',
    titulo: 'População Negra (Pretos + Pardos)',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  {
    guardaChuva: 'Indígenas — dados demográficos Censo 2022',
    sub: 'população',
    titulo: 'Povos Indígenas (Censo 2022)',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  {
    guardaChuva: 'Quilombolas — dados demográficos Censo 2022',
    sub: 'população',
    titulo: 'Quilombolas',
    tabValue: 'dados-gerais',
    abaLabel: 'Dados Gerais',
  },
  // ── Guarda-chuva: Segurança pública — homicídio por raça (Segurança/Saúde/Educação) ──
  {
    guardaChuva: 'Segurança pública — homicídio por raça (2018-2024)',
    sub: 'taxa de homicídio',
    titulo: 'Taxa de Homicídio (por 100 mil)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
  },
  {
    guardaChuva: 'Segurança pública — homicídio por raça (2018-2024)',
    sub: 'letalidade policial',
    titulo: 'Letalidade Policial - % de Negros entre Vítimas',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
    aliases: ['vítimas de intervenção policial', 'mortes por ação policial', '% negros entre vítimas'],
  },
  // ── Guarda-chuva: Atlas da Violência 2025 — dados-chave (Segurança/Saúde/Educação) ──
  {
    guardaChuva: 'Atlas da Violência 2025 — dados-chave',
    sub: 'risco relativo',
    titulo: 'Vulnerabilidade Letal (Risco Relativo)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
    aliases: ['chance de assassinato para negros vs não negros', 'risco de homicídio relativo', 'razão de vitimização'],
  },
  {
    guardaChuva: 'Atlas da Violência 2025 — dados-chave',
    sub: 'queda de homicídios',
    titulo: 'Queda de Homicídios (2018→2023)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
  },
  // ── Guarda-chuva: Educação — série histórica por raça (Segurança/Saúde/Educação) ──
  {
    guardaChuva: 'Educação — série histórica por raça (2018-2024)',
    sub: 'ensino superior completo',
    titulo: 'Ensino Superior Completo (%)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
  },
  {
    guardaChuva: 'Educação — série histórica por raça (2018-2024)',
    sub: 'taxa de analfabetismo',
    titulo: 'Taxa de Analfabetismo (%)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
  },
  // ── Guarda-chuva: Saúde — mortalidade materna e infantil por raça (Segurança/Saúde/Educação) ──
  {
    guardaChuva: 'Saúde — mortalidade materna e infantil por raça (2018-2024)',
    sub: 'mortalidade materna',
    titulo: 'Mortalidade Materna (por 100 mil NV)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
  },
  {
    guardaChuva: 'Saúde — mortalidade materna e infantil por raça (2018-2024)',
    sub: 'mortalidade infantil',
    titulo: 'Mortalidade Infantil (por mil nascidos vivos)',
    tabValue: 'seguranca-saude-educacao',
    abaLabel: 'Segurança/Saúde/Educação',
  },
];

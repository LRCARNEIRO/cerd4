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
];

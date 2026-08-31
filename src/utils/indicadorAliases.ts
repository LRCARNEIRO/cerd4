/**
 * indicadorAliases — pontes entre o TÍTULO exibido em um bloco visual e o
 * NOME exato do registro canônico gravado em `indicadores_interseccionais`.
 *
 * Uso restrito a casos em que o card já existe na aba, mas foi rotulado com
 * uma redação ligeiramente diferente da usada na Base Estatística. Nunca
 * serve para inventar código: o alias só aponta para um registro real.
 */

const norm = (s: string) =>
  String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/\s+/g, ' ').trim();

/** título exibido → nome canônico no banco */
const ALIASES: Record<string, string> = {};

/**
 * Registros DUPLICADOS na base: descrevem exatamente o mesmo dado de um
 * registro que já possui card próprio nas abas. Ficam fora do rol de
 * evidências (busca e inventário) para impedir dupla vinculação.
 * duplicado → código canônico que permanece válido.
 */
export const DUPLICATAS: Record<string, string> = {
  'IND-206': 'IND-192', // Denúncias de intolerância religiosa (Disque 100)
  'IND-207': 'IND-181', // Processos judiciais — racismo e injúria racial (CNJ)
  'IND-208': 'IND-203', // Denúncias por discriminação, injúria racial e étnica e racismo
  'IND-210': 'IND-205', // Composição racial do Judiciário — magistrados e servidores
};

/** true quando o código é duplicata de outro registro já visível em aba. */
export function isDuplicata(codigo?: string | null): boolean {
  return !!codigo && codigo in DUPLICATAS;
}

const ALIASES_NORM = new Map(Object.entries(ALIASES).map(([k, v]) => [norm(k), v]));

/** Resolve o nome canônico de um título exibido (ou devolve o próprio nome). */
export function nomeCanonico(nome: string): string {
  return ALIASES_NORM.get(norm(nome)) || nome;
}

export const INDICADOR_ALIASES = ALIASES;

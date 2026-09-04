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

/**
 * Registros CONSOLIDADOS: recortes de raça/território que deixaram de ser
 * indicadores independentes e passaram a ser subindicadores do guarda-chuva
 * temático (Censo 2022 — infraestrutura domiciliar). Ficam fora da busca e
 * do inventário; o dado continua visível na tabela, sob o código do pai.
 */
export const CONSOLIDADOS: Record<string, string> = {
  // Rede geral de água → IND-137
  'IND-155': 'IND-137', 'IND-143': 'IND-137', 'IND-148': 'IND-137',
  'IND-140': 'IND-137', 'IND-133': 'IND-137', 'IND-136': 'IND-137',
  // Esgotamento sanitário adequado → IND-150
  'IND-149': 'IND-150', 'IND-157': 'IND-150', 'IND-147': 'IND-150',
  'IND-156': 'IND-150', 'IND-138': 'IND-150', 'IND-141': 'IND-150',
  // Coleta de lixo → IND-145
  'IND-144': 'IND-145', 'IND-151': 'IND-145', 'IND-142': 'IND-145',
  'IND-134': 'IND-145', 'IND-139': 'IND-145', 'IND-135': 'IND-145',
  // Sem banheiro de uso exclusivo → IND-153
  'IND-154': 'IND-153', 'IND-164': 'IND-153', 'IND-165': 'IND-153',
  'IND-158': 'IND-153', 'IND-163': 'IND-153', 'IND-166': 'IND-153',
  // Recortes "— Nacional": o dado nacional já é coluna da tabela canônica
  // do guarda-chuva na aba Grupos Focais › Direitos Territoriais.
  'IND-214': 'IND-137', 'IND-215': 'IND-150', 'IND-216': 'IND-145', 'IND-217': 'IND-153',
};

/** true quando o código é duplicata/consolidado de outro registro visível. */
export function isDuplicata(codigo?: string | null): boolean {
  return !!codigo && (codigo in DUPLICATAS || codigo in CONSOLIDADOS);
}


const ALIASES_NORM = new Map(Object.entries(ALIASES).map(([k, v]) => [norm(k), v]));

/** Resolve o nome canônico de um título exibido (ou devolve o próprio nome). */
export function nomeCanonico(nome: string): string {
  return ALIASES_NORM.get(norm(nome)) || nome;
}

export const INDICADOR_ALIASES = ALIASES;

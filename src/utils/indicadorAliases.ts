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
const ALIASES: Record<string, string> = {
  'Denúncias de intolerância religiosa (Disque 100)':
    'Denúncias de intolerância religiosa — Disque 100',
  'Denúncias por discriminação, injúria racial e étnica e racismo':
    'Denúncias de discriminação racial — Disque 100 (racismo e injúria racial)',
  'Processos judiciais — racismo e injúria racial (CNJ)':
    'Casos novos de racismo e injúria racial no Judiciário — CNJ Painel Justiça Racial',
  'Composição racial do Judiciário — magistrados e servidores':
    'Composição racial do Judiciário — magistrados e servidores negros',
};

const ALIASES_NORM = new Map(Object.entries(ALIASES).map(([k, v]) => [norm(k), v]));

/** Resolve o nome canônico de um título exibido (ou devolve o próprio nome). */
export function nomeCanonico(nome: string): string {
  return ALIASES_NORM.get(norm(nome)) || nome;
}

export const INDICADOR_ALIASES = ALIASES;

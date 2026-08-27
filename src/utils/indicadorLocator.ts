/**
 * indicadorLocator — resolve EM QUAIS ABAS de Escopo do Projeto › Base
 * Estatística um indicador (IND-NNN) é exibido e faz o scroll/realce até ele.
 *
 * Regras:
 *  - Todo indicador do banco aparece SEMPRE na aba "Espelho Seguro (BD)"
 *    (fonte canônica, com âncora `#ind-IND-NNN` / `[data-codigo]`).
 *  - As demais abas são exibições temáticas do MESMO registro; a
 *    correspondência é derivada da `categoria`/`subcategoria` gravada na
 *    ingestão (staticToDbTransformer), nunca inventada.
 *  - Se a categoria não tiver aba temática mapeada, só o Espelho é listado.
 */

export interface AbaLocalizacao {
  label: string;
  tabValue: string;
  /** true = fonte canônica com âncora garantida */
  canonica?: boolean;
  /** quando a exibição não é uma aba de /estatisticas, e sim outra página */
  href?: string;
}

export const ABA_ESPELHO: AbaLocalizacao = {
  label: 'Espelho Seguro (BD)',
  tabValue: 'indicadores-db',
  canonica: true,
};

/** categoria (BD) → abas temáticas onde o indicador também é exibido */
const CATEGORIA_ABAS: Record<string, AbaLocalizacao[]> = {
  ods_racial: [{ label: 'ODS Racial', tabValue: 'ods-racial' }],


  // habitação: não há bloco visual em Vulnerabilidades — os registros de
  // déficit habitacional só são exibidos no Espelho Seguro (BD) e, quando
  // for o caso, no Complemento CERD III (via subcategoria). Apontar para
  // Vulnerabilidades levava o usuário a uma aba sem o indicador.
  habitacao: [],
  seguranca_publica: [{ label: 'Segurança/Saúde/Educação', tabValue: 'seguranca-saude-educacao' }],
  saude: [{ label: 'Segurança/Saúde/Educação', tabValue: 'seguranca-saude-educacao' }],
  educacao: [{ label: 'Segurança/Saúde/Educação', tabValue: 'seguranca-saude-educacao' }],
  trabalho_renda: [
    { label: 'Dados Gerais', tabValue: 'dados-gerais' },
    { label: 'Classe Social', tabValue: 'classe' },
  ],
  genero_raca: [{ label: 'Raça × Gênero', tabValue: 'raca-genero' }],
  demografia: [{ label: 'Dados Gerais', tabValue: 'dados-gerais' }],
  covid_racial: [{ label: 'COVID', tabValue: 'covid-racial' }],
  adm_publica: [{ label: 'Adm Pública', tabValue: 'adm-publica' }],
  participacao_social: [{ label: 'Adm Pública', tabValue: 'adm-publica' }],
  povos_tradicionais: [{ label: 'Grupos Focais', tabValue: 'grupos-focais' }],
  terra_territorio: [{ label: 'Grupos Focais', tabValue: 'grupos-focais' }],
  grupos_focais: [{ label: 'Grupos Focais', tabValue: 'grupos-focais' }],
  lgbtqia: [{ label: 'LGBTQIA+', tabValue: 'lgbtqia' }],
  deficiencia: [{ label: 'Deficiência', tabValue: 'deficiencia' }],
  // legislação/justiça e cultura/patrimônio só têm bloco visual no
  // Complemento CERD III — apontar para Vulnerabilidades/Dados Gerais levava
  // o usuário a abas sem o indicador.
  legislacao_justica: [{ label: 'Complemento CERD III', tabValue: 'complemento-cerd3' }],
  cultura: [{ label: 'Complemento CERD III', tabValue: 'complemento-cerd3' }],
  cultura_patrimonio: [{ label: 'Complemento CERD III', tabValue: 'complemento-cerd3' }],
  vulnerabilidade: [{ label: 'Vulnerabilidades', tabValue: 'vulnerabilidades' }],
  vulnerabilidades: [{ label: 'Vulnerabilidades', tabValue: 'vulnerabilidades' }],
  juventude: [{ label: 'Juventude', tabValue: 'juventude' }],
  classe_social: [{ label: 'Classe Social', tabValue: 'classe' }],
};

const SUBCATEGORIA_ABAS: Array<{ match: RegExp; aba: AbaLocalizacao }> = [
  { match: /juvent/i, aba: { label: 'Juventude', tabValue: 'juventude' } },
  { match: /quilombola|indigena|indígena|territor/i, aba: { label: 'Grupos Focais', tabValue: 'grupos-focais' } },
  { match: /cerd\s*iii|complemento/i, aba: { label: 'Complemento CERD III', tabValue: 'complemento-cerd3' } },
];

/**
 * PROCEDÊNCIA (sinal primário e auditável): `documento_origem[1]` grava o
 * arquivo estático de onde o registro foi espelhado na ingestão. Se existe
 * arquivo de aba, o indicador COMPROVADAMENTE já é exibido naquela aba —
 * independentemente de o título renderizado bater com o `nome` do banco.
 * Nunca inferir ausência por não achar selo IND-NNN no DOM.
 */
const ARQUIVO_ABAS: Record<string, AbaLocalizacao> = {
  'statisticsdata.ts': { label: 'Dados Gerais', tabValue: 'dados-gerais' },
  'complementocerd3data.ts': { label: 'Complemento CERD III', tabValue: 'complemento-cerd3' },
  'covidracialsection.tsx': { label: 'COVID', tabValue: 'covid-racial' },
  'gruposfocaistab.tsx': { label: 'Grupos Focais', tabValue: 'grupos-focais' },
  'dadosnovostab.tsx': { label: 'Dados Novos', tabValue: 'dados-novos' },
  'admpublicasection.tsx': { label: 'Adm Pública', tabValue: 'adm-publica' },
};

/** Procedência gravada na ingestão → aba comprovada (ou null). */
export function abaPorProcedencia(documentoOrigem?: string[] | null): AbaLocalizacao | null {
  const arq = (documentoOrigem || []).map(s => String(s || '').toLowerCase()).find(s => ARQUIVO_ABAS[s]);
  return arq ? ARQUIVO_ABAS[arq] : null;
}

/** true = registro cuja exibição em aba é comprovada pela procedência de ingestão. */
export function temCoberturaComprovada(categoria?: string | null, documentoOrigem?: string[] | null): boolean {
  if (abaPorProcedencia(documentoOrigem)) return true;
  // ODS Racial é ingerido sem documento_origem, mas 100% dos 93 têm selo na aba.
  return String(categoria || '').toLowerCase() === 'ods_racial';
}

/** Abas onde o indicador aparece — Espelho sempre primeiro. */
export function abasDoIndicador(
  categoria?: string | null,
  subcategoria?: string | null,
  nome?: string | null,
  documentoOrigem?: string[] | null,
): AbaLocalizacao[] {
  const out: AbaLocalizacao[] = [ABA_ESPELHO];
  const push = (a: AbaLocalizacao) => {
    if (!out.some(x => x.tabValue === a.tabValue)) out.push(a);
  };
  const proc = abaPorProcedencia(documentoOrigem);
  if (proc) push(proc);
  (CATEGORIA_ABAS[String(categoria || '').toLowerCase()] || []).forEach(push);
  const hay = `${subcategoria || ''} ${nome || ''}`;
  SUBCATEGORIA_ABAS.forEach(({ match, aba }) => { if (match.test(hay)) push(aba); });
  return out;
}


function highlight(el: HTMLElement) {
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  el.classList.add('ring-2', 'ring-primary', 'bg-primary/10', 'transition-all', 'duration-700');
  window.setTimeout(() => {
    el.classList.remove('ring-2', 'ring-primary', 'bg-primary/10');
  }, 6000);
}

const norm = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

function findEl(codigo?: string | null, nome?: string | null): HTMLElement | null {
  // A própria faixa de deep-link exibe o nome do indicador — se ela entrasse na
  // varredura, todo link daria "✓ Realçado" mesmo sem bloco real na aba.
  const foraDaFaixa = (el: HTMLElement) => !el.closest('[data-deeplink-banner]');

  if (codigo) {
    const esc = codigo.replace(/"/g, '\\"');
    const byId = document.getElementById(`ind-${codigo}`);
    if (byId && foraDaFaixa(byId)) return byId;
    const byAttr = Array.from(document.querySelectorAll<HTMLElement>(`[data-codigo="${esc}"]`)).find(foraDaFaixa);
    if (byAttr) return byAttr;
  }
  if (nome) {
    const alvo = norm(nome);
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('h2,h3,h4,h5,p,td,th,span,div[data-indicador-id]'))
      .filter(foraDaFaixa);
    // 1) correspondência direta pelo nome completo
    const hit = nodes.find(n => {
      const t = norm(n.textContent || '');
      return t.includes(alvo) && t.length < alvo.length + 160;
    });
    if (hit) return hit;
    // 2) correspondência por tokens fortes (>=4 letras): exige ao menos 3
    //    tokens e que TODOS apareçam no mesmo bloco curto — evita falso
    //    positivo em cards que só compartilham palavras genéricas.
    const tokens = alvo.split(/[^a-z0-9]+/).filter(t => t.length >= 4).slice(0, 6);
    if (tokens.length >= 3) {
      const hit2 = nodes.find(n => {
        const t = norm(n.textContent || '');
        return t.length < 300 && tokens.every(tk => t.includes(tk));
      });
      if (hit2) return hit2;
    }
  }
  return null;
}


/**
 * Rola até o indicador na aba já ativa. Faz polling (a aba pode montar
 * depois da troca) e realça o elemento. `onResult` informa se encontrou.
 */
export function focusIndicadorNaAba(opts: {
  codigo?: string | null;
  id?: string | null;
  nome?: string | null;
  tabValue: string;
  onResult?: (found: boolean) => void;
}) {
  const { codigo, id, nome, tabValue, onResult } = opts;
  if (typeof window === 'undefined') return;

  if (tabValue === 'indicadores-db') {
    [250, 800].forEach(delay => window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent('indicador-focus', { detail: { id, codigo } }));
    }, delay));
    onResult?.(true);
    return;
  }

  let tries = 0;
  const timer = window.setInterval(() => {
    tries++;
    const el = findEl(codigo, nome);
    if (el) {
      highlight(el);
      window.clearInterval(timer);
      onResult?.(true);
    } else if (tries > 40) {
      window.clearInterval(timer);
      onResult?.(false);
    }
  }, 200);
}


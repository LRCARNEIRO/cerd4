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
  common_core: [{ label: 'Common Core', tabValue: 'common-core', href: '/common-core' }],

  habitacao: [{ label: 'Vulnerabilidades', tabValue: 'vulnerabilidades' }],
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
  legislacao_justica: [{ label: 'Vulnerabilidades', tabValue: 'vulnerabilidades' }],
  cultura: [{ label: 'Dados Gerais', tabValue: 'dados-gerais' }],
  cultura_patrimonio: [{ label: 'Dados Gerais', tabValue: 'dados-gerais' }],
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

/** Abas onde o indicador aparece — Espelho sempre primeiro. */
export function abasDoIndicador(categoria?: string | null, subcategoria?: string | null, nome?: string | null): AbaLocalizacao[] {
  const out: AbaLocalizacao[] = [ABA_ESPELHO];
  const push = (a: AbaLocalizacao) => {
    if (!out.some(x => x.tabValue === a.tabValue)) out.push(a);
  };
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
  if (codigo) {
    const esc = codigo.replace(/"/g, '\\"');
    const byId = document.getElementById(`ind-${codigo}`);
    if (byId) return byId;
    const byAttr = document.querySelector<HTMLElement>(`[data-codigo="${esc}"]`);
    if (byAttr) return byAttr;
  }
  if (nome) {
    const alvo = norm(nome);
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('h2,h3,h4,h5,p,td,th,span,div[data-indicador-id]'));
    // 1) correspondência direta pelo nome completo
    const hit = nodes.find(n => {
      const t = norm(n.textContent || '');
      return t.includes(alvo) && t.length < alvo.length + 160;
    });
    if (hit) return hit;
    // 2) correspondência por tokens significativos (>=4 letras), sem inventar dado:
    //    exige que TODOS os tokens fortes apareçam no mesmo bloco curto de texto.
    const tokens = alvo.split(/[^a-z0-9]+/).filter(t => t.length >= 4).slice(0, 5);
    if (tokens.length >= 2) {
      const hit2 = nodes.find(n => {
        const t = norm(n.textContent || '');
        return t.length < 400 && tokens.every(tk => t.includes(tk));
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


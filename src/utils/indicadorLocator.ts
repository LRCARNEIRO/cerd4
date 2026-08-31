/**
 * indicadorLocator — resolve EM QUAIS ABAS de Escopo do Projeto › Base
 * Estatística um indicador (IND-NNN) é exibido e faz o scroll/realce até ele.
 *
 * Regras:
 *  - Todo indicador do banco aparece SEMPRE na aba "Espelho Seguro (BD)"
 *    (fonte canônica, com âncora `#ind-IND-NNN` / `[data-codigo]`).
 *  - Uma aba temática só é anunciada quando existe declaração explícita de
 *    um bloco real. Categoria, subcategoria e arquivo de ingestão NÃO são
 *    prova de que o indicador está renderizado na interface.
 *  - Sem declaração explícita, só o Espelho é listado.
 */

import { abasDoSub, getSubsForGuardaChuva } from '@/utils/indicadorSubs';
import { complementoCerd3Indicators } from '@/components/estatisticas/ComplementoCerd3Data';



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

/**
 * Exibição CONFIRMADA por código (auditada no componente que renderiza o
 * bloco). Quando presente, substitui qualquer heurística de categoria.
 */
export const ABAS_POR_CODIGO: Record<string, AbaLocalizacao[]> = {
  // Renderizados em ComplementoCerd3Tab › CensoDemografiaMapas
  'IND-012': [{ label: 'Complemento CERD III', tabValue: 'complemento-cerd3' }],
  'IND-014': [{ label: 'Complemento CERD III', tabValue: 'complemento-cerd3' }],
};

const DADOS_GERAIS: AbaLocalizacao = { label: 'Dados Gerais', tabValue: 'dados-gerais' };
const SEGURANCA_SAUDE_EDUCACAO: AbaLocalizacao = { label: 'Segurança/Saúde/Educação', tabValue: 'seguranca-saude-educacao' };
const CLASSE_SOCIAL: AbaLocalizacao = { label: 'Classe Social', tabValue: 'classe' };
const COMPLEMENTO_CERD3: AbaLocalizacao = { label: 'Complemento CERD III', tabValue: 'complemento-cerd3' };
const ODS_RACIAL: AbaLocalizacao = { label: 'ODS Racial', tabValue: 'ods-racial' };
const COVID_RACIAL: AbaLocalizacao = { label: 'COVID Racial', tabValue: 'covid-racial' };

/**
 * Blocos diretos comprovados no JSX. O nome é o mesmo usado pelo componente
 * para resolver o código persistido; portanto não há inferência temática.
 */
export const ABAS_POR_NOME: Record<string, AbaLocalizacao[]> = {
  'Composição racial — Censo 2022': [DADOS_GERAIS],
  'Evolução composição racial (2018-2024)': [DADOS_GERAIS],
  'Evasão escolar por raça (2018-2024)': [SEGURANCA_SAUDE_EDUCACAO],
  'Rendimentos por raça — Censo 2022': [CLASSE_SOCIAL],
  'Pobreza por raça — SIS/IBGE (2022-2024)': [CLASSE_SOCIAL],
  'Mobilidade social intergeracional e concentração de renda por raça': [CLASSE_SOCIAL],
  'Acesso a UTI e mortalidade hospitalar COVID por raça — Peres et al. (2021)': [COVID_RACIAL],
  ...Object.fromEntries(complementoCerd3Indicators.map(ind => [ind.nome, [COMPLEMENTO_CERD3]])),
};

const normKey = (value?: string | null) => String(value || '').normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const ABAS_POR_NOME_NORMALIZADO = new Map(
  Object.entries(ABAS_POR_NOME).map(([nome, abas]) => [normKey(nome), abas]),
);

/** Confirma se um bloco direto está explicitamente registrado naquela aba. */
export function indicadorDiretoExisteNaAba(nome: string, codigo: string | null | undefined, tabValue: string): boolean {
  const porCodigo = codigo ? ABAS_POR_CODIGO[codigo] : undefined;
  const porNome = ABAS_POR_NOME_NORMALIZADO.get(normKey(nome));
  return [...(porCodigo || []), ...(porNome || [])].some(aba => aba.tabValue === tabValue);
}

/** Abas onde o indicador aparece — Espelho sempre primeiro. */
export function abasDoIndicador(
  categoria?: string | null,
  subcategoria?: string | null,
  nome?: string | null,
  documentoOrigem?: string[] | null,
  codigo?: string | null,
): AbaLocalizacao[] {
  const out: AbaLocalizacao[] = [ABA_ESPELHO];
  const push = (a: AbaLocalizacao) => {
    if (!out.some(x => x.tabValue === a.tabValue)) out.push(a);
  };

  // 1) Exibição confirmada por código — encerra aqui (sem heurística).
  const confirmadas = codigo ? ABAS_POR_CODIGO[codigo] : undefined;
  if (confirmadas) {
    confirmadas.forEach(push);
    return out;
  }

  // 2) Blocos visuais cadastrados (sub-indicadores) do próprio registro.
  const subs = nome ? getSubsForGuardaChuva(nome) : [];
  if (subs.length) {
    subs.forEach(s => abasDoSub(s).forEach(a => push({ label: a.abaLabel, tabValue: a.tabValue })));
    return out;
  }

  // 3) Bloco direto explicitamente comprovado. ODS é uma coleção dinâmica:
  // cada registro da categoria é renderizado com seu próprio código na aba.
  if (String(categoria || '').toLowerCase() === 'ods_racial') push(ODS_RACIAL);
  const diretas = ABAS_POR_NOME_NORMALIZADO.get(normKey(nome));
  diretas?.forEach(push);
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
  anchor?: string | null;
  onResult?: (found: boolean) => void;
}) {
  const { codigo, id, nome, tabValue, anchor, onResult } = opts;
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
    const el = (anchor ? document.getElementById(anchor) : null) || findEl(codigo, nome);
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


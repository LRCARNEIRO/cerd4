/**
 * indCodeAutoTag — carimba o código canônico IND-NNN nos títulos das abas
 * temáticas de Estatísticas.
 *
 * Regra de Ouro: NUNCA inventa código. Só carimba quando o texto do título
 * é EXATAMENTE igual (após normalização de acentos/caixa/espaços) ao `nome`
 * gravado em `indicadores_interseccionais`. Sem correspondência exata →
 * nenhum selo é exibido.
 *
 * Efeito colateral desejado: cada título carimbado ganha `data-codigo` e
 * `id="ind-IND-NNN"`, o que dá âncora real para os deep-links da planilha
 * (`?tab=<aba>&ind=IND-NNN`).
 */

import { abasDoSub, getSubIndicadorAnchor, SUB_INDICADORES } from '@/utils/indicadorSubs';
import { indicadorDiretoExisteNaAba } from '@/utils/indicadorLocator';

const norm = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const SELECTOR = 'h2,h3,h4,h5,p,span,div,td,th,[data-ind-nome]';
const BADGE_CLASS = 'ind-auto-code-badge';

export function autoTagIndCodes(
  codigos: Map<string, string>,
  root: ParentNode = document,
  activeTab?: string,
): number {
  if (!codigos.size) return 0;
  // Map normalizado nome → codigo (a chave do hook já vem lowercase/trim).
  const byNorm = new Map<string, string>();
  codigos.forEach((codigo, nome) => byNorm.set(norm(nome), codigo));

  let tagged = 0;
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR)).filter(el => {
    if (el.closest('[data-deeplink-banner]')) return false;
    if (el.dataset.codigo) return true; // já carimbado — só para registrar em `usados`
    // Bloco já possui selo explícito <IndCodeBadge> (inclusive sub) — não
    // carimbar de novo para não gerar selo duplo/aproximado ao lado do real.
    if (el.parentElement?.querySelector('[data-ind-badge="1"]')) return false;
    if (el.querySelector('[data-ind-badge="1"]')) return false;
    const heading = /^H[2-5]$/.test(el.tagName) || el.hasAttribute('data-ind-nome');
    // Fora dos títulos, só folhas de texto (o nome do indicador costuma ser
    // renderizado em <span>/<div> dentro de cards temáticos).
    if (!heading && el.children.length > 0) return false;
    return (el.textContent || '').trim().length > 8;
  });
  const usados = new Set<string>();

  // Blocos visuais cadastrados como sub-indicadores usam os códigos
  // congelados do registro SSoT. Eles são carimbados antes dos guarda-chuvas
  // e não entram em `usados`, pois um mesmo IND pode possuir vários blocos.
  for (const sub of SUB_INDICADORES) {
    // Só carimba o sub na aba onde ele realmente existe. Sem esse filtro,
    // títulos curtos ("Indígenas", "Quilombolas") recebiam selo em abas
    // alheias (ex.: COVID), sugerindo evidência inexistente.
    if (activeTab && !abasDoSub(sub).some(a => a.tabValue === activeTab)) continue;
    // O mesmo bloco pode ser rotulado de formas diferentes na aba (ex.: card
    // "UFs com Legislação Específica" para o sub "legislação estadual"). Os
    // `aliases` são rótulos EXATOS já auditados — nunca correspondência solta.
    const rotulos = [sub.titulo, ...(sub.aliases || [])]
      .map(norm)
      .filter(t => t.length >= 9);
    if (!rotulos.length) continue;
    const alvo = nodes.find(el => {
      if (el.dataset.subIndicador || el.querySelector('[data-ind-badge="1"]')) return false;
      return rotulos.includes(norm(el.textContent || ''));
    });
    if (!alvo) continue;
    const codigoBanco = codigos.get(sub.guardaChuva.toLowerCase().trim());
    if (codigoBanco && codigoBanco !== sub.codigo) continue;
    alvo.dataset.codigo = sub.codigo;
    alvo.dataset.subIndicador = sub.sub;
    alvo.dataset.autoCodigo = '1';
    alvo.id = getSubIndicadorAnchor(sub.codigo, sub.sub);
    const badge = document.createElement('span');
    badge.dataset.indBadge = '1';
    badge.className =
      `${BADGE_CLASS} ml-2 align-middle inline-flex items-center rounded border border-border ` +
      'px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground';
    badge.textContent = `${sub.codigo} · sub: ${sub.sub}`;
    badge.title = `Bloco visual vinculado ao indicador canônico ${sub.codigo} (${sub.guardaChuva})`;
    alvo.appendChild(badge);
    tagged++;
  }

  const stamp = (el: HTMLElement, codigo: string) => {
    usados.add(codigo);
    el.dataset.codigo = codigo;
    el.dataset.autoCodigo = '1';
    if (!document.getElementById(`ind-${codigo}`)) el.id = `ind-${codigo}`;
    const badge = document.createElement('span');
    badge.className =
      `${BADGE_CLASS} ml-2 align-middle inline-flex items-center rounded border border-border ` +
      'px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground';
    badge.textContent = codigo;
    badge.title = 'Código canônico do indicador na Base Estatística (Espelho Seguro — BD)';
    el.appendChild(badge);
    tagged++;
  };

  // Passe 1 — título IDÊNTICO ao nome canônico gravado no banco.
  for (const el of nodes) {
    if (el.dataset.codigo) { usados.add(el.dataset.codigo); continue; }
    const explicito = el.getAttribute('data-ind-nome');
    const nome = explicito ?? el.textContent ?? '';
    const codigo = byNorm.get(norm(nome));
    if (!codigo || usados.has(codigo)) continue;
    if (activeTab && !indicadorDiretoExisteNaAba(nome, codigo, activeTab)) continue;
    stamp(el, codigo);
  }

  return tagged;
}



/** Remove selos injetados (usado antes de re-carimbar em troca de aba). */
export function clearAutoTags(root: ParentNode = document) {
  root.querySelectorAll(`.${BADGE_CLASS}`).forEach(n => n.remove());
  root.querySelectorAll<HTMLElement>('[data-auto-codigo="1"]').forEach(el => {
    delete el.dataset.codigo;
    delete el.dataset.subIndicador;
    delete el.dataset.autoCodigo;
    if (el.id.startsWith('ind-IND-') && el.id.includes('-sub-')) el.removeAttribute('id');
  });
}

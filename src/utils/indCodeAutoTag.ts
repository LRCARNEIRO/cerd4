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

const norm = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();

const SELECTOR = 'h2,h3,h4,h5,[data-ind-nome]';
const BADGE_CLASS = 'ind-auto-code-badge';

export function autoTagIndCodes(codigos: Map<string, string>, root: ParentNode = document): number {
  if (!codigos.size) return 0;
  // Map normalizado nome → codigo (a chave do hook já vem lowercase/trim).
  const byNorm = new Map<string, string>();
  codigos.forEach((codigo, nome) => byNorm.set(norm(nome), codigo));

  let tagged = 0;
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(SELECTOR))
    .filter(el => !el.closest('[data-deeplink-banner]'));
  const usados = new Set<string>();

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
    const codigo = byNorm.get(norm(explicito ?? el.textContent ?? ''));
    if (!codigo || usados.has(codigo)) continue;
    stamp(el, codigo);
  }

  // Passe 2 — título que CONTÉM integralmente o nome canônico (mesma regra
  // usada pelo localizador de deep-link). Continua sendo correspondência
  // textual literal: sem nome do banco no título, nenhum selo é criado.
  for (const [nomeNorm, codigo] of byNorm) {
    if (usados.has(codigo) || nomeNorm.length < 12) continue;
    const alvo = nodes.find(el => {
      if (el.dataset.codigo) return false;
      const t = norm(el.textContent || '');
      return t.includes(nomeNorm) && t.length < nomeNorm.length + 80;
    });
    if (alvo) stamp(alvo, codigo);
  }

  return tagged;
}


/** Remove selos injetados (usado antes de re-carimbar em troca de aba). */
export function clearAutoTags(root: ParentNode = document) {
  root.querySelectorAll(`.${BADGE_CLASS}`).forEach(n => n.remove());
  root.querySelectorAll<HTMLElement>('[data-auto-codigo="1"]').forEach(el => {
    delete el.dataset.codigo;
    delete el.dataset.autoCodigo;
  });
}

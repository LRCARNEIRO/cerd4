import { ComponentType, Suspense, startTransition, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ENTREGA_SEQUENCIA } from './EntregaContext';
import { lazyWithRetry } from '@/utils/lazyWithRetry';

const EntregaCapa = lazyWithRetry(() => import('@/pages/EntregaCapa'));
const Painel = lazyWithRetry(() => import('@/pages/Index'));
const Recomendacoes = lazyWithRetry(() => import('@/pages/Recomendacoes'));
const Artigos = lazyWithRetry(() => import('@/pages/Artigos'));
const Estatisticas = lazyWithRetry(() => import('@/pages/Estatisticas'));
const Orcamento = lazyWithRetry(() => import('@/pages/Orcamento'));
const Normativa = lazyWithRetry(() => import('@/pages/Normativa'));
const NotFound = lazyWithRetry(() => import('@/pages/NotFound'));

/** Páginas de conteúdo da entrega (sem a capa), na ordem da sequência. */
const PAGINAS: Array<{ href: string; C: ComponentType }> = [
  { href: '/entrega/painel', C: Painel },
  { href: '/entrega/recomendacoes', C: Recomendacoes },
  { href: '/entrega/artigos', C: Artigos },
  { href: '/entrega/estatisticas', C: Estatisticas },
  { href: '/entrega/orcamento', C: Orcamento },
  { href: '/entrega/normativa', C: Normativa },
];

const Aguardando = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

/** Roteador da entrega: capa em /entrega e conteúdo keep-alive nas demais rotas. */
export function EntregaRouter() {
  const { pathname } = useLocation();
  if (pathname === '/entrega') {
    return <Suspense fallback={<Aguardando />}><EntregaCapa /></Suspense>;
  }
  return <EntregaPaginas />;
}

/**
 * Mantém cada tela da entrega montada após a primeira visita (display:none quando inativa),
 * para que voltar a uma tela seja instantâneo, e pré-monta a próxima tela da sequência em
 * segundo plano durante a leitura da atual. Os dados buscados continuam em cache no React Query.
 */
function EntregaPaginas() {
  const { pathname } = useLocation();
  const [visitadas, setVisitadas] = useState<string[]>([]);
  const idx = ENTREGA_SEQUENCIA.findIndex(s => s.href === pathname);

  // Registra a tela atual como visitada a partir da primeira exibição.
  useEffect(() => {
    if (idx < 1) return;
    const alvo = ENTREGA_SEQUENCIA[idx].href;
    setVisitadas(v => (v.includes(alvo) ? v : [...v, alvo]));
  }, [idx]);

  // Pré-carrega a próxima tela em segundo plano (quando o navegador estiver ocioso).
  useEffect(() => {
    if (idx < 1) return;
    const prox = ENTREGA_SEQUENCIA[idx + 1];
    if (!prox) return;
    const agendar =
      (window as unknown as { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback
      ?? ((cb: () => void) => window.setTimeout(cb, 1200));
    const cancelar =
      (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback
      ?? ((id: number) => window.clearTimeout(id));
    const id = agendar(() => {
      startTransition(() => setVisitadas(v => (v.includes(prox.href) ? v : [...v, prox.href])));
    });
    return () => cancelar(id);
  }, [idx]);

  if (idx < 0) {
    return <Suspense fallback={<Aguardando />}><NotFound /></Suspense>;
  }

  return (
    <>
      {PAGINAS.map(({ href, C }) =>
        visitadas.includes(href) ? (
          <div key={href} style={{ display: pathname === href ? undefined : 'none' }} aria-hidden={pathname !== href}>
            <Suspense fallback={<Aguardando />}>
              <C />
            </Suspense>
          </div>
        ) : null
      )}
    </>
  );
}

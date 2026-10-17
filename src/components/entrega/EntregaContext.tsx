import { createContext, ReactNode, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** Marca as telas renderizadas dentro da versão de entrega (/entregaMIR). */
const EntregaCtx = createContext(false);

/** Sequência de navegação da entrega (capa → painel → produtos). */
export const ENTREGA_SEQUENCIA = [
  { href: '/entregaMIR', titulo: 'Capa' },
  { href: '/entregaMIR/painel', titulo: 'Painel Geral' },
  { href: '/entregaMIR/recomendacoes', titulo: 'Recomendações' },
  { href: '/entregaMIR/artigos', titulo: 'Artigos I–VII' },
  { href: '/entregaMIR/estatisticas', titulo: 'Base Estatística' },
  { href: '/entregaMIR/orcamento', titulo: 'Base Orçamentária' },
  { href: '/entregaMIR/normativa', titulo: 'Base Normativa' },
];

/** Telas do sistema completo que têm equivalente na entrega. */
const MAPA: Record<string, string> = {
  '/': '/entregaMIR/painel',
  '/recomendacoes': '/entregaMIR/recomendacoes',
  '/artigos': '/entregaMIR/artigos',
  '/estatisticas': '/entregaMIR/estatisticas',
  '/orcamento': '/entregaMIR/orcamento',
  '/normativa': '/entregaMIR/normativa',
};

/**
 * Traduz, só no momento do clique e só dentro da entrega, links internos
 * para a rota equivalente da entrega. Nenhuma URL salva, relatório ou planilha muda.
 */
export function EntregaProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const a = (e.target as HTMLElement)?.closest?.('a');
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.startsWith('/entregaMIR')) return;
      const destino = MAPA[url.pathname];
      if (!destino) return;
      e.preventDefault();
      e.stopPropagation();
      navigate(destino + url.search + url.hash);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [navigate]);
  return <EntregaCtx.Provider value={true}>{children}</EntregaCtx.Provider>;
}

export const useIsEntrega = () => useContext(EntregaCtx);

export const ENTREGA_TITULO =
  'Elaboração de subsídios destinados a apoiar o Estado brasileiro na preparação do IV Relatório do Brasil à Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial (CERD), relativo ao ciclo de monitoramento 2018–2025';

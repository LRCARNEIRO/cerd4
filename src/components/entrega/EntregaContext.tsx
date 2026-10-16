import { createContext, ReactNode, useContext } from 'react';

/** Marca as telas renderizadas dentro da versão de entrega (/entrega). */
const EntregaCtx = createContext(false);

export function EntregaProvider({ children }: { children: ReactNode }) {
  return <EntregaCtx.Provider value={true}>{children}</EntregaCtx.Provider>;
}

export const useIsEntrega = () => useContext(EntregaCtx);

export const ENTREGA_TITULO =
  'Elaboração de subsídios destinados a apoiar o Estado brasileiro na preparação do IV Relatório do Brasil à Convenção Internacional sobre a Eliminação de Todas as Formas de Discriminação Racial (CERD), relativo ao ciclo de monitoramento 2018–2025';

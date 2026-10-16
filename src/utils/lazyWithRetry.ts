import { lazy, ComponentType } from 'react';

/**
 * Após um novo deploy, o HTML em cache pode apontar para chunks que não existem mais.
 * Nesse caso recarregamos a página uma única vez para buscar o manifesto atualizado.
 */
const RELOAD_KEY = 'chunk-reload-attempt';

export function lazyWithRetry<T extends ComponentType<unknown>>(factory: () => Promise<{ default: T }>) {
  return lazy(async () => {
    try {
      const mod = await factory();
      window.sessionStorage.removeItem(RELOAD_KEY);
      return mod;
    } catch (error) {
      if (!window.sessionStorage.getItem(RELOAD_KEY)) {
        window.sessionStorage.setItem(RELOAD_KEY, '1');
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw error;
    }
  });
}

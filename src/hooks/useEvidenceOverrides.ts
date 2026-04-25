/**
 * useEvidenceOverrides — Hook compartilhado para overrides manuais de evidências
 * vinculadas às recomendações ONU (human-in-the-loop).
 *
 * - Persistência: localStorage (chave única do sistema).
 * - Reatividade cross-component: emite/escuta `storage` event (entre abas)
 *   e um CustomEvent local (mesma aba, entre componentes).
 * - Consumido por: RelacaoRecomendacoesTab (edição), useAnalyticalInsights
 *   e FinalCerdIVReport (consumo no relatório CERD IV) — garantindo que
 *   qualquer alteração de evidência atualize imediatamente o relatório.
 */
import { useCallback, useEffect, useState } from 'react';
import type { EvidenceOverride, EvidenceOverrides } from '@/components/shared/EvidenceDrilldownDialog';

export const OVERRIDES_STORAGE_KEY = 'cerd-evidence-overrides-v1';
const OVERRIDES_EVENT = 'cerd-evidence-overrides-changed';

function readFromStorage(): EvidenceOverrides {
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return {};
}

function isNonEmpty(v: EvidenceOverride): boolean {
  return !!(
    v.addedIndicadores.length || v.removedIndicadores.length ||
    v.addedOrcamento.length || v.removedOrcamento.length ||
    v.addedNormativos.length || v.removedNormativos.length
  );
}

function writeToStorage(ov: EvidenceOverrides) {
  try {
    const filtered: EvidenceOverrides = {};
    for (const [k, v] of Object.entries(ov)) if (isNonEmpty(v)) filtered[k] = v;
    if (Object.keys(filtered).length > 0) {
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(filtered));
    } else {
      localStorage.removeItem(OVERRIDES_STORAGE_KEY);
    }
    // Broadcast para listeners na mesma aba (storage event não dispara local).
    try { window.dispatchEvent(new CustomEvent(OVERRIDES_EVENT)); } catch { /* noop */ }
  } catch { /* quota */ }
}

/**
 * Hook completo: leitura + escrita + sincronização reativa.
 * Use em telas de edição (ex.: RelacaoRecomendacoesTab).
 */
export function useEvidenceOverrides(): [EvidenceOverrides, (updater: EvidenceOverrides | ((prev: EvidenceOverrides) => EvidenceOverrides)) => void] {
  const [overrides, setOverridesState] = useState<EvidenceOverrides>(readFromStorage);

  const setOverrides = useCallback((updater: EvidenceOverrides | ((prev: EvidenceOverrides) => EvidenceOverrides)) => {
    setOverridesState((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: EvidenceOverrides) => EvidenceOverrides)(prev) : updater;
      writeToStorage(next);
      return next;
    });
  }, []);

  useEffect(() => {
    const sync = () => setOverridesState(readFromStorage());
    const onStorage = (e: StorageEvent) => { if (e.key === OVERRIDES_STORAGE_KEY) sync(); };
    window.addEventListener('storage', onStorage);
    window.addEventListener(OVERRIDES_EVENT, sync as EventListener);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener(OVERRIDES_EVENT, sync as EventListener);
    };
  }, []);

  return [overrides, setOverrides];
}

/**
 * Hook somente-leitura — mesma reatividade, sem expor setter.
 * Use em consumidores (ex.: useAnalyticalInsights, FinalCerdIVReport).
 */
export function useEvidenceOverridesReadOnly(): EvidenceOverrides {
  const [overrides] = useEvidenceOverrides();
  return overrides;
}

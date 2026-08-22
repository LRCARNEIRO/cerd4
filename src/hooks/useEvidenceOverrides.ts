/**
 * useEvidenceOverrides — Hook compartilhado para overrides manuais de evidências
 * vinculadas às recomendações ONU (human-in-the-loop).
 *
 * - Persistência PRIMÁRIA: banco (tabela `evidence_overrides`) — decisão
 *   metodológica auditável, compartilhada por toda a equipe.
 * - Trilha de auditoria: cada inclusão/remoção individual grava uma linha em
 *   `evidence_override_log` (quem, quando, o quê, em qual base).
 * - localStorage passa a ser apenas CACHE de leitura instantânea + migração
 *   única do que ficou salvo localmente antes desta versão.
 * - Reatividade cross-component: CustomEvent local + `storage` event.
 * - Consumido por: RelacaoRecomendacoesTab (edição), useAnalyticalInsights
 *   e FinalCerdIVReport (consumo no relatório CERD IV).
 */
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { EvidenceOverride, EvidenceOverrides } from '@/components/shared/EvidenceDrilldownDialog';
import type { LinkedIndicador, LinkedOrcamento, LinkedNormativo } from '@/hooks/useDiagnosticSensor';
import { isEvidenceEligibleIndicator, isInvalidEvidenceIndicator } from '@/utils/indicatorEvidenceGuards';

export const OVERRIDES_STORAGE_KEY = 'cerd-evidence-overrides-v1';
const MIGRATION_FLAG_KEY = 'cerd-evidence-overrides-migrated-v1';
const OVERRIDES_EVENT = 'cerd-evidence-overrides-changed';

/** Cache em memória compartilhado entre instâncias do hook. */
let memoryCache: EvidenceOverrides | null = null;
let dbLoadPromise: Promise<void> | null = null;

const EMPTY_OVERRIDE: EvidenceOverride = {
  addedIndicadores: [], removedIndicadores: [],
  addedOrcamento: [], removedOrcamento: [],
  addedNormativos: [], removedNormativos: [],
};

function readFromStorage(): EvidenceOverrides {
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    if (raw) return sanitizeOverrides(JSON.parse(raw));
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

function sanitizeOverride(v: EvidenceOverride): EvidenceOverride {
  const removedIndicadores = Array.isArray(v?.removedIndicadores) ? v.removedIndicadores : [];
  const addedIndicadores = Array.isArray(v?.addedIndicadores) ? v.addedIndicadores : [];
  return {
    ...v,
    removedIndicadores: removedIndicadores.filter((nome) => !isInvalidEvidenceIndicator({ nome })),
    addedIndicadores: addedIndicadores.filter(isEvidenceEligibleIndicator),
    removedOrcamento: Array.isArray(v?.removedOrcamento) ? v.removedOrcamento : [],
    addedOrcamento: Array.isArray(v?.addedOrcamento) ? v.addedOrcamento : [],
    removedNormativos: Array.isArray(v?.removedNormativos) ? v.removedNormativos : [],
    addedNormativos: Array.isArray(v?.addedNormativos) ? v.addedNormativos : [],
  };
}

function sanitizeOverrides(overrides: EvidenceOverrides): EvidenceOverrides {
  const clean: EvidenceOverrides = {};
  for (const [k, v] of Object.entries(overrides || {})) {
    const sanitized = sanitizeOverride(v);
    if (isNonEmpty(sanitized)) clean[k] = sanitized;
  }
  return clean;
}

function writeCache(ov: EvidenceOverrides) {
  memoryCache = ov;
  try {
    if (Object.keys(ov).length > 0) {
      localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(ov));
    } else {
      localStorage.removeItem(OVERRIDES_STORAGE_KEY);
    }
  } catch { /* quota */ }
  try { window.dispatchEvent(new CustomEvent(OVERRIDES_EVENT)); } catch { /* noop */ }
}

// ─────────────────────────── Banco ───────────────────────────

type DbRow = {
  recomendacao_key: string;
  added_indicadores: unknown;
  removed_indicadores: string[] | null;
  added_orcamento: unknown;
  removed_orcamento: string[] | null;
  added_normativos: unknown;
  removed_normativos: string[] | null;
};

function asArray<T>(v: unknown): T[] {
  return Array.isArray(v) ? (v as T[]) : [];
}

function rowToOverride(r: DbRow): EvidenceOverride {
  return sanitizeOverride({
    addedIndicadores: asArray<LinkedIndicador>(r.added_indicadores),
    removedIndicadores: r.removed_indicadores ?? [],
    addedOrcamento: asArray<LinkedOrcamento>(r.added_orcamento),
    removedOrcamento: r.removed_orcamento ?? [],
    addedNormativos: asArray<LinkedNormativo>(r.added_normativos),
    removedNormativos: r.removed_normativos ?? [],
  });
}

type OverrideRow = {
  recomendacao_key: string;
  added_indicadores: unknown;
  removed_indicadores: string[];
  added_orcamento: unknown;
  removed_orcamento: string[];
  added_normativos: unknown;
  removed_normativos: string[];
  updated_by: string | null;
};

function overrideToRow(key: string, v: EvidenceOverride, userId: string | null): OverrideRow {
  return {
    recomendacao_key: key,
    added_indicadores: v.addedIndicadores,
    removed_indicadores: v.removedIndicadores,
    added_orcamento: v.addedOrcamento,
    removed_orcamento: v.removedOrcamento,
    added_normativos: v.addedNormativos,
    removed_normativos: v.removedNormativos,
    updated_by: userId,
  };
}

async function fetchFromDb(): Promise<EvidenceOverrides> {
  const { data, error } = await supabase
    .from('evidence_overrides')
    .select('recomendacao_key, added_indicadores, removed_indicadores, added_orcamento, removed_orcamento, added_normativos, removed_normativos');
  if (error) throw error;
  const out: EvidenceOverrides = {};
  for (const row of (data ?? []) as DbRow[]) {
    const ov = rowToOverride(row);
    if (isNonEmpty(ov)) out[row.recomendacao_key] = ov;
  }
  return out;
}

/** Migração única: sobe para o banco o que estava só no navegador. */
async function migrateLocalOnce(local: EvidenceOverrides, remote: EvidenceOverrides, userId: string | null) {
  try {
    if (localStorage.getItem(MIGRATION_FLAG_KEY)) return;
    const pending = Object.entries(local).filter(([k]) => !remote[k]);
    if (pending.length > 0) {
      const rows: OverrideRow[] = pending.map(([k, v]) => overrideToRow(k, v, userId));
      const { error } = await supabase.from('evidence_overrides').upsert(rows, { onConflict: 'recomendacao_key' });
      if (error) throw error;
      for (const [k, v] of pending) {
        remote[k] = v;
        await logDiff(k, EMPTY_OVERRIDE, v, userId, 'Migração do registro local para a base compartilhada');
      }
    }
    localStorage.setItem(MIGRATION_FLAG_KEY, new Date().toISOString());
  } catch { /* sem permissão de escrita: mantém local como cache */ }
}

type LogRow = {
  recomendacao_key: string;
  acao: 'incluir' | 'remover' | 'reverter';
  tipo_evidencia: 'indicador' | 'orcamento' | 'normativo';
  item: string;
  justificativa: string | null;
  autor: string | null;
  autor_email: string | null;
};

/** Rótulo textual estável de um item incluído, por tipo de base. */
function labelOf(tipo: string, item: unknown): string {
  const o = item as Record<string, unknown>;
  if (tipo === 'indicador') return String(o?.nome ?? '');
  if (tipo === 'normativo') return String(o?.titulo ?? '');
  return `${o?.programa ?? ''}|${o?.orgao ?? ''}|${o?.ano ?? ''}`;
}

const LOG_FIELDS: Array<{ added: keyof EvidenceOverride; removed: keyof EvidenceOverride; tipo: 'indicador' | 'orcamento' | 'normativo' }> = [
  { added: 'addedIndicadores', removed: 'removedIndicadores', tipo: 'indicador' },
  { added: 'addedOrcamento', removed: 'removedOrcamento', tipo: 'orcamento' },
  { added: 'addedNormativos', removed: 'removedNormativos', tipo: 'normativo' },
];

/** Grava na trilha de auditoria cada item que entrou/saiu entre dois estados. */
async function logDiff(
  key: string,
  prev: EvidenceOverride,
  next: EvidenceOverride,
  userId: string | null,
  justificativa?: string,
  autorEmail?: string | null,
) {
  const entries: LogRow[] = [];
  for (const { added, removed, tipo } of LOG_FIELDS) {
    const push = (item: string, acao: 'incluir' | 'remover' | 'reverter') => {
      if (!item) return;
      entries.push({
        recomendacao_key: key, acao, tipo_evidencia: tipo, item,
        justificativa: justificativa ?? null, autor: userId, autor_email: autorEmail ?? null,
      });
    };
    const prevAdded = asArray<unknown>(prev[added]).map((i) => labelOf(tipo, i));
    const nextAdded = asArray<unknown>(next[added]).map((i) => labelOf(tipo, i));
    const prevRemoved = asArray<string>(prev[removed]);
    const nextRemoved = asArray<string>(next[removed]);
    for (const it of nextAdded.filter((i) => !prevAdded.includes(i))) push(it, 'incluir');
    for (const it of nextRemoved.filter((i) => !prevRemoved.includes(i))) push(it, 'remover');
    for (const it of prevAdded.filter((i) => !nextAdded.includes(i))) push(it, 'reverter');
    for (const it of prevRemoved.filter((i) => !nextRemoved.includes(i))) push(it, 'reverter');
  }
  if (entries.length === 0) return;
  try { await supabase.from('evidence_override_log').insert(entries); } catch { /* noop */ }
}

/** Sincroniza o estado completo com o banco (upsert dos alterados, delete dos zerados). */
async function persistToDb(prev: EvidenceOverrides, next: EvidenceOverrides) {
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id ?? null;
  const email = userData?.user?.email ?? null;

  const keys = new Set([...Object.keys(prev), ...Object.keys(next)]);
  const upserts: OverrideRow[] = [];
  const deletes: string[] = [];

  for (const key of keys) {
    const before = prev[key] ?? EMPTY_OVERRIDE;
    const after = next[key];
    if (JSON.stringify(before) === JSON.stringify(after ?? EMPTY_OVERRIDE)) continue;
    if (after && isNonEmpty(after)) upserts.push(overrideToRow(key, after, userId));
    else deletes.push(key);
    await logDiff(key, before, after ?? EMPTY_OVERRIDE, userId, undefined, email);
  }

  if (upserts.length) {
    const { error } = await supabase.from('evidence_overrides').upsert(upserts, { onConflict: 'recomendacao_key' });
    if (error) throw error;
  }
  if (deletes.length) {
    const { error } = await supabase.from('evidence_overrides').delete().in('recomendacao_key', deletes);
    if (error) throw error;
  }
}

/** Carrega do banco uma única vez por sessão de página e funde com o cache local. */
function ensureDbLoaded(onLoaded: () => void) {
  if (dbLoadPromise) { dbLoadPromise.then(onLoaded); return; }
  dbLoadPromise = (async () => {
    const local = readFromStorage();
    try {
      const remote = await fetchFromDb();
      const { data: userData } = await supabase.auth.getUser();
      await migrateLocalOnce(local, remote, userData?.user?.id ?? null);
      writeCache(sanitizeOverrides(remote));
    } catch {
      writeCache(local); // offline / sem acesso: segue com o cache
    }
  })();
  dbLoadPromise.then(onLoaded);
}

// ─────────────────────────── Hooks ───────────────────────────

/**
 * Hook completo: leitura + escrita + sincronização reativa.
 * Use em telas de edição (ex.: RelacaoRecomendacoesTab).
 */
export function useEvidenceOverrides(): [EvidenceOverrides, (updater: EvidenceOverrides | ((prev: EvidenceOverrides) => EvidenceOverrides)) => void] {
  const [overrides, setOverridesState] = useState<EvidenceOverrides>(() => memoryCache ?? readFromStorage());

  const setOverrides = useCallback((updater: EvidenceOverrides | ((prev: EvidenceOverrides) => EvidenceOverrides)) => {
    setOverridesState((prev) => {
      const raw = typeof updater === 'function' ? (updater as (p: EvidenceOverrides) => EvidenceOverrides)(prev) : updater;
      const next = sanitizeOverrides(raw);
      writeCache(next);            // otimista: UI e cache imediatos
      void persistToDb(prev, next) // fonte da verdade + trilha de auditoria
        .catch(() => { /* silencioso: cache preserva a edição */ });
      return next;
    });
  }, []);

  useEffect(() => {
    const sync = () => setOverridesState(memoryCache ?? readFromStorage());
    ensureDbLoaded(sync);
    const onStorage = (e: StorageEvent) => { if (e.key === OVERRIDES_STORAGE_KEY) { memoryCache = null; sync(); } };
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

/** Histórico de auditoria de um vínculo (ou de todos, se sem chave). */
export async function fetchEvidenceOverrideLog(recomendacaoKey?: string) {
  let query = supabase
    .from('evidence_override_log')
    .select('recomendacao_key, acao, tipo_evidencia, item, justificativa, autor_email, created_at')
    .order('created_at', { ascending: false })
    .limit(500);
  if (recomendacaoKey) query = query.eq('recomendacao_key', recomendacaoKey);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

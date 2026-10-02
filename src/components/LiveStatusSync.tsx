import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useLacunasIdentificadas } from '@/hooks/useLacunasData';
import { useDiagnosticSensor } from '@/hooks/useDiagnosticSensor';
import { useEvidenceOverridesReadOnly } from '@/hooks/useEvidenceOverrides';

/**
 * Mantém o status de cumprimento das recomendações sempre igual ao cálculo ao vivo
 * (sensor sobre a matriz auditada). Sobrepõe o valor no cache de dados — assim todo
 * relatório e o "Baixar tudo" leem o status atual — e, quando a sessão tem permissão,
 * grava as diferenças no banco para manter funções do servidor alinhadas.
 */
export function LiveStatusSync() {
  const qc = useQueryClient();
  const { data: lacunas, dataUpdatedAt } = useLacunasIdentificadas();
  const overrides = useEvidenceOverridesReadOnly();
  const { diagnosticMap, isReady } = useDiagnosticSensor(lacunas, overrides);
  const persisted = useRef<string>('');

  useEffect(() => {
    if (!isReady || !lacunas?.length) return;
    const live = new Map<string, string>();
    const entries: [string, any][] = diagnosticMap instanceof Map ? [...diagnosticMap.entries()] : Object.entries(diagnosticMap || {});
    for (const [id, d] of entries) if (d?.statusComputado) live.set(id, d.statusComputado);
    if (!live.size) return;

    const patch = (rows: any) => Array.isArray(rows) && rows.some((r: any) => live.has(r.id) && r.status_cumprimento !== live.get(r.id))
      ? rows.map((r: any) => (live.has(r.id) && r.status_cumprimento !== live.get(r.id) ? { ...r, status_cumprimento: live.get(r.id) } : r))
      : rows;
    qc.setQueriesData({ queryKey: ['lacunas-identificadas'] }, patch);

    const counts: Record<string, number> = { cumprido: 0, parcialmente_cumprido: 0, nao_cumprido: 0, retrocesso: 0, em_andamento: 0 };
    for (const l of lacunas) { const s = live.get(l.id) || l.status_cumprimento; counts[s] = (counts[s] || 0) + 1; }
    qc.setQueriesData({ queryKey: ['lacunas-stats'] }, (old: any) => (old && JSON.stringify(old.porStatus) !== JSON.stringify(counts) ? { ...old, porStatus: counts } : old));

    const diffs = lacunas.filter(l => live.has(l.id) && l.status_cumprimento !== live.get(l.id));
    const sig = diffs.map(d => `${d.id}:${live.get(d.id)}`).join('|');
    if (diffs.length && sig !== persisted.current) {
      persisted.current = sig;
      Promise.all(diffs.map(d => supabase.from('lacunas_identificadas')
        .update({ status_cumprimento: live.get(d.id) as any }).eq('id', d.id))).catch(() => {});
    }
  }, [isReady, diagnosticMap, dataUpdatedAt, lacunas, qc]);

  return null;
}

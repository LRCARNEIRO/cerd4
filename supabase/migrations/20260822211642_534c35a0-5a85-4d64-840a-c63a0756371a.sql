-- evidence_overrides: escrita liberada para qualquer usuário autenticado
DROP POLICY IF EXISTS "Moderators can insert overrides" ON public.evidence_overrides;
DROP POLICY IF EXISTS "Moderators can update overrides" ON public.evidence_overrides;
DROP POLICY IF EXISTS "Moderators can delete overrides" ON public.evidence_overrides;
DROP POLICY IF EXISTS "Admins can insert overrides" ON public.evidence_overrides;
DROP POLICY IF EXISTS "Admins can update overrides" ON public.evidence_overrides;
DROP POLICY IF EXISTS "Admins can delete overrides" ON public.evidence_overrides;

CREATE POLICY "Authenticated can insert overrides"
ON public.evidence_overrides FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated can update overrides"
ON public.evidence_overrides FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated can delete overrides"
ON public.evidence_overrides FOR DELETE TO authenticated USING (true);

-- evidence_override_log: qualquer autenticado grava; ninguém edita/apaga
DROP POLICY IF EXISTS "Moderators can insert log" ON public.evidence_override_log;
DROP POLICY IF EXISTS "Admins can insert log" ON public.evidence_override_log;

CREATE POLICY "Authenticated can insert log"
ON public.evidence_override_log FOR INSERT TO authenticated WITH CHECK (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_overrides TO authenticated;
GRANT SELECT, INSERT ON public.evidence_override_log TO authenticated;
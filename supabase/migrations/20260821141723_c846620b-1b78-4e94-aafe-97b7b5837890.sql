-- 1) documentos_normativos: remove política "ALL true"
DROP POLICY IF EXISTS "Allow all access to documentos_normativos" ON public.documentos_normativos;

CREATE POLICY "Public read access for documentos_normativos"
ON public.documentos_normativos FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Moderators can insert documentos_normativos"
ON public.documentos_normativos FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Moderators can update documentos_normativos"
ON public.documentos_normativos FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete documentos_normativos"
ON public.documentos_normativos FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT ON public.documentos_normativos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos_normativos TO authenticated;
GRANT ALL ON public.documentos_normativos TO service_role;

-- 2) data_snapshots: leitura apenas para admins
DROP POLICY IF EXISTS "Snapshots are viewable by everyone" ON public.data_snapshots;

CREATE POLICY "Admins can view snapshots"
ON public.data_snapshots FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

REVOKE ALL ON public.data_snapshots FROM anon;
GRANT SELECT ON public.data_snapshots TO authenticated;
GRANT ALL ON public.data_snapshots TO service_role;

-- 3) has_role: não deve ser executável diretamente via API
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM anon, authenticated, public;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;
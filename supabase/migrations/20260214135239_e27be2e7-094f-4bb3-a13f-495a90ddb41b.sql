
-- Drop the restrictive SELECT policy and recreate as permissive
DROP POLICY IF EXISTS "Public read access for dados_orcamentarios" ON public.dados_orcamentarios;
CREATE POLICY "Public read access for dados_orcamentarios"
  ON public.dados_orcamentarios
  FOR SELECT
  USING (true);

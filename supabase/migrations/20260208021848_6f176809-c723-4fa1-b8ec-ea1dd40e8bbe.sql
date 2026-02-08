
-- Fix 2: Replace permissive write policies with role-based access
-- Only admins and moderators can INSERT/UPDATE; only admins can DELETE

-- conclusoes_analiticas
DROP POLICY IF EXISTS "Authenticated users can insert conclusoes" ON public.conclusoes_analiticas;
DROP POLICY IF EXISTS "Authenticated users can update conclusoes" ON public.conclusoes_analiticas;
DROP POLICY IF EXISTS "Authenticated users can delete conclusoes" ON public.conclusoes_analiticas;

CREATE POLICY "Moderators can insert conclusoes"
  ON public.conclusoes_analiticas FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Moderators can update conclusoes"
  ON public.conclusoes_analiticas FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete conclusoes"
  ON public.conclusoes_analiticas FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- dados_orcamentarios
DROP POLICY IF EXISTS "Authenticated users can insert dados_orcamentarios" ON public.dados_orcamentarios;
DROP POLICY IF EXISTS "Authenticated users can update dados_orcamentarios" ON public.dados_orcamentarios;
DROP POLICY IF EXISTS "Authenticated users can delete dados_orcamentarios" ON public.dados_orcamentarios;

CREATE POLICY "Moderators can insert dados_orcamentarios"
  ON public.dados_orcamentarios FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Moderators can update dados_orcamentarios"
  ON public.dados_orcamentarios FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete dados_orcamentarios"
  ON public.dados_orcamentarios FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- indicadores_interseccionais
DROP POLICY IF EXISTS "Authenticated users can insert indicadores" ON public.indicadores_interseccionais;
DROP POLICY IF EXISTS "Authenticated users can update indicadores" ON public.indicadores_interseccionais;
DROP POLICY IF EXISTS "Authenticated users can delete indicadores" ON public.indicadores_interseccionais;

CREATE POLICY "Moderators can insert indicadores"
  ON public.indicadores_interseccionais FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Moderators can update indicadores"
  ON public.indicadores_interseccionais FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete indicadores"
  ON public.indicadores_interseccionais FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- lacunas_identificadas
DROP POLICY IF EXISTS "Authenticated users can insert lacunas" ON public.lacunas_identificadas;
DROP POLICY IF EXISTS "Authenticated users can update lacunas" ON public.lacunas_identificadas;
DROP POLICY IF EXISTS "Authenticated users can delete lacunas" ON public.lacunas_identificadas;

CREATE POLICY "Moderators can insert lacunas"
  ON public.lacunas_identificadas FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Moderators can update lacunas"
  ON public.lacunas_identificadas FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete lacunas"
  ON public.lacunas_identificadas FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- respostas_lacunas_cerd_iii
DROP POLICY IF EXISTS "Authenticated users can insert respostas" ON public.respostas_lacunas_cerd_iii;
DROP POLICY IF EXISTS "Authenticated users can update respostas" ON public.respostas_lacunas_cerd_iii;
DROP POLICY IF EXISTS "Authenticated users can delete respostas" ON public.respostas_lacunas_cerd_iii;

CREATE POLICY "Moderators can insert respostas"
  ON public.respostas_lacunas_cerd_iii FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Moderators can update respostas"
  ON public.respostas_lacunas_cerd_iii FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'))
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'moderator'));

CREATE POLICY "Admins can delete respostas"
  ON public.respostas_lacunas_cerd_iii FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

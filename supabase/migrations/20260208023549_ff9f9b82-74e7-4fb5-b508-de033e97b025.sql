
-- Drop restrictive SELECT policies and replace with public read access
-- These tables contain public analytical/report data, not user-specific data

-- conclusoes_analiticas
DROP POLICY IF EXISTS "Authenticated users can view conclusoes" ON public.conclusoes_analiticas;
CREATE POLICY "Public read access for conclusoes" ON public.conclusoes_analiticas FOR SELECT USING (true);

-- dados_orcamentarios
DROP POLICY IF EXISTS "Authenticated users can view dados_orcamentarios" ON public.dados_orcamentarios;
CREATE POLICY "Public read access for dados_orcamentarios" ON public.dados_orcamentarios FOR SELECT USING (true);

-- indicadores_interseccionais
DROP POLICY IF EXISTS "Authenticated users can view indicadores" ON public.indicadores_interseccionais;
CREATE POLICY "Public read access for indicadores" ON public.indicadores_interseccionais FOR SELECT USING (true);

-- lacunas_identificadas
DROP POLICY IF EXISTS "Authenticated users can view lacunas" ON public.lacunas_identificadas;
CREATE POLICY "Public read access for lacunas" ON public.lacunas_identificadas FOR SELECT USING (true);

-- respostas_lacunas_cerd_iii
DROP POLICY IF EXISTS "Authenticated users can view respostas" ON public.respostas_lacunas_cerd_iii;
CREATE POLICY "Public read access for respostas" ON public.respostas_lacunas_cerd_iii FOR SELECT USING (true);

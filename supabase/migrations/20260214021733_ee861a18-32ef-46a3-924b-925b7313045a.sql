
-- Fix: Drop restrictive SELECT policies and recreate as PERMISSIVE
DROP POLICY IF EXISTS "Authenticated users can read dados_orcamentarios" ON public.dados_orcamentarios;
DROP POLICY IF EXISTS "Public read access for dados_orcamentarios" ON public.dados_orcamentarios;

CREATE POLICY "Public read access for dados_orcamentarios"
ON public.dados_orcamentarios
FOR SELECT
USING (true);

-- Same fix for other tables with the same issue
DROP POLICY IF EXISTS "Authenticated users can read lacunas" ON public.lacunas_identificadas;
DROP POLICY IF EXISTS "Public read access for lacunas" ON public.lacunas_identificadas;

CREATE POLICY "Public read access for lacunas"
ON public.lacunas_identificadas
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can read indicadores" ON public.indicadores_interseccionais;
DROP POLICY IF EXISTS "Public read access for indicadores" ON public.indicadores_interseccionais;

CREATE POLICY "Public read access for indicadores"
ON public.indicadores_interseccionais
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can read conclusoes" ON public.conclusoes_analiticas;
DROP POLICY IF EXISTS "Public read access for conclusoes" ON public.conclusoes_analiticas;

CREATE POLICY "Public read access for conclusoes"
ON public.conclusoes_analiticas
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Authenticated users can read respostas" ON public.respostas_lacunas_cerd_iii;
DROP POLICY IF EXISTS "Public read access for respostas" ON public.respostas_lacunas_cerd_iii;

CREATE POLICY "Public read access for respostas"
ON public.respostas_lacunas_cerd_iii
FOR SELECT
USING (true);

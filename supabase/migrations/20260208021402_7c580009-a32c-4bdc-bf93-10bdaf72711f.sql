
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    unique (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS on user_roles: users can read their own roles
CREATE POLICY "Users can read own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can manage roles
CREATE POLICY "Admins can manage roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Drop existing overly permissive SELECT policies and replace with authenticated-only
DROP POLICY IF EXISTS "Conclusões são públicas para leitura" ON public.conclusoes_analiticas;
DROP POLICY IF EXISTS "Dados orçamentários são públicos para leitura" ON public.dados_orcamentarios;
DROP POLICY IF EXISTS "Indicadores são públicos para leitura" ON public.indicadores_interseccionais;
DROP POLICY IF EXISTS "Lacunas são públicas para leitura" ON public.lacunas_identificadas;
DROP POLICY IF EXISTS "Respostas CERD III são públicas para leitura" ON public.respostas_lacunas_cerd_iii;

-- New SELECT policies: authenticated users only
CREATE POLICY "Authenticated users can read conclusoes"
ON public.conclusoes_analiticas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read dados_orcamentarios"
ON public.dados_orcamentarios FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read indicadores"
ON public.indicadores_interseccionais FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read lacunas"
ON public.lacunas_identificadas FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can read respostas"
ON public.respostas_lacunas_cerd_iii FOR SELECT TO authenticated USING (true);

-- INSERT policies: authenticated users
CREATE POLICY "Authenticated users can insert conclusoes"
ON public.conclusoes_analiticas FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can insert dados_orcamentarios"
ON public.dados_orcamentarios FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can insert indicadores"
ON public.indicadores_interseccionais FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can insert lacunas"
ON public.lacunas_identificadas FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can insert respostas"
ON public.respostas_lacunas_cerd_iii FOR INSERT TO authenticated WITH CHECK (true);

-- UPDATE policies: authenticated users
CREATE POLICY "Authenticated users can update conclusoes"
ON public.conclusoes_analiticas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can update dados_orcamentarios"
ON public.dados_orcamentarios FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can update indicadores"
ON public.indicadores_interseccionais FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can update lacunas"
ON public.lacunas_identificadas FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Authenticated users can update respostas"
ON public.respostas_lacunas_cerd_iii FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- DELETE policies: authenticated users
CREATE POLICY "Authenticated users can delete conclusoes"
ON public.conclusoes_analiticas FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete dados_orcamentarios"
ON public.dados_orcamentarios FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete indicadores"
ON public.indicadores_interseccionais FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete lacunas"
ON public.lacunas_identificadas FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete respostas"
ON public.respostas_lacunas_cerd_iii FOR DELETE TO authenticated USING (true);

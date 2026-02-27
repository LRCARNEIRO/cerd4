
-- Adicionar coluna artigos_convencao (array de text) às tabelas principais
-- Mapeia cada registro aos artigos I-VII da Convenção ICERD

ALTER TABLE public.lacunas_identificadas 
ADD COLUMN IF NOT EXISTS artigos_convencao text[] DEFAULT '{}';

ALTER TABLE public.indicadores_interseccionais 
ADD COLUMN IF NOT EXISTS artigos_convencao text[] DEFAULT '{}';

ALTER TABLE public.conclusoes_analiticas 
ADD COLUMN IF NOT EXISTS artigos_convencao text[] DEFAULT '{}';

ALTER TABLE public.dados_orcamentarios 
ADD COLUMN IF NOT EXISTS artigos_convencao text[] DEFAULT '{}';

-- Índices GIN para buscas eficientes por artigo
CREATE INDEX IF NOT EXISTS idx_lacunas_artigos ON public.lacunas_identificadas USING GIN(artigos_convencao);
CREATE INDEX IF NOT EXISTS idx_indicadores_artigos ON public.indicadores_interseccionais USING GIN(artigos_convencao);
CREATE INDEX IF NOT EXISTS idx_conclusoes_artigos ON public.conclusoes_analiticas USING GIN(artigos_convencao);
CREATE INDEX IF NOT EXISTS idx_orcamento_artigos ON public.dados_orcamentarios USING GIN(artigos_convencao);

-- Criar tabela de referência dos documentos balizadores para validação
CREATE TABLE IF NOT EXISTS public.documentos_balizadores_ref (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sigla text NOT NULL UNIQUE,
  titulo text NOT NULL,
  tipo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.documentos_balizadores_ref ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Documentos balizadores são públicos" 
ON public.documentos_balizadores_ref 
FOR SELECT USING (true);

CREATE POLICY "Apenas admins gerenciam balizadores" 
ON public.documentos_balizadores_ref 
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

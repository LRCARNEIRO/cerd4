ALTER TABLE public.vinculos_evidencia_curados ADD COLUMN IF NOT EXISTS artigo text;
DROP INDEX IF EXISTS public.vinculos_curados_unq;
CREATE UNIQUE INDEX vinculos_curados_unq ON public.vinculos_evidencia_curados (recomendacao_id, base, ref_id, COALESCE(sub, ''), COALESCE(artigo, ''));
CREATE INDEX IF NOT EXISTS vinculos_curados_artigo_idx ON public.vinculos_evidencia_curados (artigo);
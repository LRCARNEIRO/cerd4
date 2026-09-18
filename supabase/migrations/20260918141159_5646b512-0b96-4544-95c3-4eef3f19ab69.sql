ALTER TABLE public.vinculos_evidencia_curados ADD COLUMN IF NOT EXISTS linha integer;

DROP INDEX IF EXISTS public.vinculos_evidencia_curados_uniq;
DROP INDEX IF EXISTS public.uniq_vinculo_curado;

CREATE UNIQUE INDEX IF NOT EXISTS uniq_vinculo_curado_linha
  ON public.vinculos_evidencia_curados (
    recomendacao_id, base, ref_id, COALESCE(sub,''), COALESCE(artigo,''), COALESCE(linha, 0)
  );
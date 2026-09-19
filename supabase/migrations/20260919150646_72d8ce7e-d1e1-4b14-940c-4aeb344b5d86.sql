ALTER TABLE public.vinculos_evidencia_curados
  ADD COLUMN IF NOT EXISTS tipo_evidencia text,
  ADD COLUMN IF NOT EXISTS funcao_metodo text;

CREATE INDEX IF NOT EXISTS idx_vinculos_tipo_evidencia
  ON public.vinculos_evidencia_curados (tipo_evidencia);
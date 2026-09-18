CREATE TABLE public.vinculos_evidencia_curados (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recomendacao_id uuid NOT NULL REFERENCES public.lacunas_identificadas(id) ON DELETE CASCADE,
  base text NOT NULL CHECK (base IN ('estatistica','normativa','orcamentaria')),
  ref_id uuid NOT NULL,
  sub text,
  nome text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX vinculos_curados_unq ON public.vinculos_evidencia_curados (recomendacao_id, base, ref_id, COALESCE(sub, ''));
CREATE INDEX vinculos_curados_rec_idx ON public.vinculos_evidencia_curados (recomendacao_id);

GRANT SELECT ON public.vinculos_evidencia_curados TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vinculos_evidencia_curados TO authenticated;
GRANT ALL ON public.vinculos_evidencia_curados TO service_role;

ALTER TABLE public.vinculos_evidencia_curados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vinculos curados sao publicos para leitura"
  ON public.vinculos_evidencia_curados FOR SELECT USING (true);

CREATE POLICY "Autenticados podem gerenciar vinculos curados"
  ON public.vinculos_evidencia_curados FOR ALL TO authenticated
  USING (true) WITH CHECK (true);
CREATE TABLE public.evidence_overrides (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recomendacao_key text NOT NULL UNIQUE,
  added_indicadores text[] NOT NULL DEFAULT '{}',
  removed_indicadores text[] NOT NULL DEFAULT '{}',
  added_orcamento text[] NOT NULL DEFAULT '{}',
  removed_orcamento text[] NOT NULL DEFAULT '{}',
  added_normativos text[] NOT NULL DEFAULT '{}',
  removed_normativos text[] NOT NULL DEFAULT '{}',
  updated_by uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.evidence_overrides TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.evidence_overrides TO authenticated;
GRANT ALL ON public.evidence_overrides TO service_role;

ALTER TABLE public.evidence_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for evidence_overrides"
  ON public.evidence_overrides FOR SELECT
  USING (true);

CREATE POLICY "Moderators can insert evidence_overrides"
  ON public.evidence_overrides FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Moderators can update evidence_overrides"
  ON public.evidence_overrides FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));

CREATE POLICY "Admins can delete evidence_overrides"
  ON public.evidence_overrides FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_evidence_overrides_updated_at
  BEFORE UPDATE ON public.evidence_overrides
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.evidence_override_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recomendacao_key text NOT NULL,
  acao text NOT NULL CHECK (acao IN ('incluir', 'remover', 'reverter')),
  tipo_evidencia text NOT NULL CHECK (tipo_evidencia IN ('indicador', 'orcamento', 'normativo')),
  item text NOT NULL,
  justificativa text,
  autor uuid,
  autor_email text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_evidence_override_log_key ON public.evidence_override_log (recomendacao_key, created_at DESC);

GRANT SELECT ON public.evidence_override_log TO anon;
GRANT SELECT, INSERT ON public.evidence_override_log TO authenticated;
GRANT ALL ON public.evidence_override_log TO service_role;

ALTER TABLE public.evidence_override_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for evidence_override_log"
  ON public.evidence_override_log FOR SELECT
  USING (true);

CREATE POLICY "Moderators can insert evidence_override_log"
  ON public.evidence_override_log FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'moderator'::app_role));
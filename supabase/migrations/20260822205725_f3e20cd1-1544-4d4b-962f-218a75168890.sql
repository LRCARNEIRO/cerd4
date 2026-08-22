ALTER TABLE public.evidence_overrides
  ALTER COLUMN added_indicadores DROP DEFAULT,
  ALTER COLUMN added_orcamento DROP DEFAULT,
  ALTER COLUMN added_normativos DROP DEFAULT;

ALTER TABLE public.evidence_overrides
  ALTER COLUMN added_indicadores TYPE jsonb USING to_jsonb(added_indicadores),
  ALTER COLUMN added_orcamento TYPE jsonb USING to_jsonb(added_orcamento),
  ALTER COLUMN added_normativos TYPE jsonb USING to_jsonb(added_normativos);

ALTER TABLE public.evidence_overrides
  ALTER COLUMN added_indicadores SET DEFAULT '[]'::jsonb,
  ALTER COLUMN added_orcamento SET DEFAULT '[]'::jsonb,
  ALTER COLUMN added_normativos SET DEFAULT '[]'::jsonb;
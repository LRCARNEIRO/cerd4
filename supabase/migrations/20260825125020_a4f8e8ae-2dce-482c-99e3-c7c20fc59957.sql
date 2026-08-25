ALTER TABLE public.indicadores_interseccionais ADD COLUMN IF NOT EXISTS codigo_curto text;

WITH o AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC, id ASC) AS rn
  FROM public.indicadores_interseccionais
)
UPDATE public.indicadores_interseccionais t
SET codigo_curto = 'IND-' || lpad(o.rn::text, 3, '0')
FROM o
WHERE o.id = t.id AND t.codigo_curto IS NULL;

ALTER TABLE public.indicadores_interseccionais
  ADD CONSTRAINT indicadores_codigo_curto_unique UNIQUE (codigo_curto);

CREATE SEQUENCE IF NOT EXISTS public.indicador_codigo_seq;

SELECT setval('public.indicador_codigo_seq',
  (SELECT COALESCE(MAX(CAST(substring(codigo_curto FROM 5) AS integer)), 0)
   FROM public.indicadores_interseccionais));

CREATE OR REPLACE FUNCTION public.assign_indicador_codigo()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.codigo_curto IS NULL THEN
    NEW.codigo_curto := 'IND-' || lpad(nextval('public.indicador_codigo_seq')::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_assign_indicador_codigo
BEFORE INSERT ON public.indicadores_interseccionais
FOR EACH ROW EXECUTE FUNCTION public.assign_indicador_codigo();
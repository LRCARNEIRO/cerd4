-- Expandir limites de varchar em indicadores_interseccionais para acomodar
-- fontes longas (institucionais com URLs descritivas) e categorias compostas.
ALTER TABLE public.indicadores_interseccionais
  ALTER COLUMN fonte TYPE varchar(500),
  ALTER COLUMN categoria TYPE varchar(200),
  ALTER COLUMN subcategoria TYPE varchar(200);
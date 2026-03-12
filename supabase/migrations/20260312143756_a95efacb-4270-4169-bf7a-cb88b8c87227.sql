CREATE OR REPLACE FUNCTION public.temp_bulk_insert_ods(sql_text text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  EXECUTE sql_text;
END;
$$;
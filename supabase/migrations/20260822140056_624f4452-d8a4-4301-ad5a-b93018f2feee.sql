-- 1. Chaves normalizadas + restauração da dotação integral no registro vencedor
WITH base AS (
  SELECT id, ano, esfera,
         substring(programa from '^([0-9A-Z]{4})') AS cod_prog,
         (regexp_match(programa, '/\s*([0-9A-Z]{4})'))[1] AS cod_acao,
         dotacao_inicial, dotacao_autorizada, pago
  FROM public.dados_orcamentarios
  WHERE substring(programa from '^([0-9A-Z]{4})') IS NOT NULL
),
grupos AS (
  SELECT ano, esfera, cod_prog, cod_acao,
         MAX(dotacao_inicial) AS max_ini,
         MAX(dotacao_autorizada) AS max_aut
  FROM base
  GROUP BY 1,2,3,4
  HAVING COUNT(*) > 1
),
ranked AS (
  SELECT b.id, b.ano, b.esfera, b.cod_prog, b.cod_acao, g.max_ini, g.max_aut,
         ROW_NUMBER() OVER (
           PARTITION BY b.ano, b.esfera, b.cod_prog, b.cod_acao
           ORDER BY b.dotacao_inicial DESC NULLS LAST,
                    b.dotacao_autorizada DESC NULLS LAST,
                    b.pago DESC NULLS LAST,
                    b.id
         ) AS rn
  FROM base b
  JOIN grupos g USING (ano, esfera, cod_prog, cod_acao)
)
UPDATE public.dados_orcamentarios d
SET dotacao_inicial = r.max_ini,
    dotacao_autorizada = r.max_aut,
    percentual_execucao = CASE
      WHEN COALESCE(r.max_aut, r.max_ini) > 0 AND d.pago IS NOT NULL
        THEN LEAST(ROUND((d.pago / COALESCE(r.max_aut, r.max_ini)) * 100, 2), 99999.99)
      ELSE d.percentual_execucao END,
    updated_at = now()
FROM ranked r
WHERE d.id = r.id AND r.rn = 1;

-- 2. Exclusão física das linhas redundantes
WITH base AS (
  SELECT id, ano, esfera,
         substring(programa from '^([0-9A-Z]{4})') AS cod_prog,
         (regexp_match(programa, '/\s*([0-9A-Z]{4})'))[1] AS cod_acao,
         dotacao_inicial, dotacao_autorizada, pago
  FROM public.dados_orcamentarios
  WHERE substring(programa from '^([0-9A-Z]{4})') IS NOT NULL
),
ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY ano, esfera, cod_prog, cod_acao
           ORDER BY dotacao_inicial DESC NULLS LAST,
                    dotacao_autorizada DESC NULLS LAST,
                    pago DESC NULLS LAST,
                    id
         ) AS rn
  FROM base
)
DELETE FROM public.dados_orcamentarios d
USING ranked r
WHERE d.id = r.id AND r.rn > 1;

-- 3. Trava física contra novas duplicatas (apenas linhas com código de programa)
CREATE UNIQUE INDEX IF NOT EXISTS dados_orcamentarios_acao_unica
ON public.dados_orcamentarios (
  ano,
  lower(coalesce(esfera, 'federal')),
  substring(programa from '^([0-9A-Z]{4})'),
  coalesce((regexp_match(programa, '/\s*([0-9A-Z]{4})'))[1], '')
)
WHERE substring(programa from '^([0-9A-Z]{4})') IS NOT NULL;
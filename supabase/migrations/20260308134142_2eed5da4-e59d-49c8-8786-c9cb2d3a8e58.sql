DELETE FROM dados_orcamentarios
WHERE id IN (
  SELECT id FROM (
    SELECT id,
      ROW_NUMBER() OVER (
        PARTITION BY programa, descritivo, orgao, ano, esfera
        ORDER BY updated_at DESC
      ) AS rn
    FROM dados_orcamentarios
  ) ranked
  WHERE rn > 1
);
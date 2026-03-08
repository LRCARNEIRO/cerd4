
-- Delete 5034 non-racial records: actions from program 5034 that lack racial keywords
-- These are false positives from retroactive API reclassification
DELETE FROM dados_orcamentarios
WHERE programa ILIKE '%5034%'
  AND orgao NOT IN ('SEPPIR')
  AND NOT (orgao IN ('MIR') AND ano >= 2023)
  AND NOT (
    LOWER(COALESCE(programa, '') || ' ' || COALESCE(descritivo, '')) ~ 
    '(racial|racismo|negro|negra|afro|quilomb|indigen|cigan|romani|terreiro|matriz africana|igualdade racial|palmares|capoeira|candomblé|umbanda)'
  );

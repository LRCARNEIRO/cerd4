-- Remove Art. IV from §40b (perfilamento racial = Art. V, não propaganda)
UPDATE lacunas_identificadas 
SET artigos_convencao = ARRAY['V']
WHERE paragrafo = '40b';

-- Remove Art. IV from RG34 (discriminação ampla = Art. II/V, não propaganda específica)
UPDATE lacunas_identificadas 
SET artigos_convencao = ARRAY['II', 'V']
WHERE paragrafo = 'RG34';
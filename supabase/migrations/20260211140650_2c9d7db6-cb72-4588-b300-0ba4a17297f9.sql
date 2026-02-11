-- Add documento_origem field to track which base documents each indicator relates to
ALTER TABLE public.indicadores_interseccionais 
ADD COLUMN documento_origem text[] DEFAULT '{}';

-- Populate based on existing categories mapping to known documents
-- Security/Health/Education indicators → CERD Observations
UPDATE public.indicadores_interseccionais 
SET documento_origem = ARRAY['CERD Observações Finais 2022']
WHERE categoria IN ('seguranca_publica', 'saude', 'educacao', 'trabalho_renda');

-- Legislation/Justice → CERD + Durban
UPDATE public.indicadores_interseccionais 
SET documento_origem = ARRAY['CERD Observações Finais 2022', 'Plano de Durban']
WHERE categoria = 'legislacao_justica';

-- Institutional policies → CERD + Follow-up
UPDATE public.indicadores_interseccionais 
SET documento_origem = ARRAY['CERD Observações Finais 2022', 'Follow-up 2026']
WHERE categoria = 'politicas_institucionais';

-- Land/Territory → CERD + Durban
UPDATE public.indicadores_interseccionais 
SET documento_origem = ARRAY['CERD Observações Finais 2022', 'Plano de Durban']
WHERE categoria = 'terra_territorio';

-- Culture → CERD + RG 23-38
UPDATE public.indicadores_interseccionais 
SET documento_origem = ARRAY['CERD Observações Finais 2022', 'Recomendações Gerais (RGs)']
WHERE categoria = 'cultura_patrimonio';

-- Social participation → CERD + Durban
UPDATE public.indicadores_interseccionais 
SET documento_origem = ARRAY['CERD Observações Finais 2022', 'Plano de Durban']
WHERE categoria = 'participacao_social';

-- Data/Statistics → CERD + Follow-up
UPDATE public.indicadores_interseccionais 
SET documento_origem = ARRAY['CERD Observações Finais 2022', 'Follow-up 2026']
WHERE categoria = 'dados_estatisticas';

-- Create enum for budget classification
CREATE TYPE public.tipo_dotacao AS ENUM ('orcamentario', 'extraorcamentario');

-- Add column to dados_orcamentarios with default 'orcamentario'
ALTER TABLE public.dados_orcamentarios 
ADD COLUMN tipo_dotacao public.tipo_dotacao NOT NULL DEFAULT 'orcamentario';

-- Add column for sub-classification of extraorçamentário
ALTER TABLE public.dados_orcamentarios 
ADD COLUMN subtipo_extraorcamentario TEXT;

-- Update existing FUNAI Program 0151 records as extraorçamentário
UPDATE public.dados_orcamentarios 
SET tipo_dotacao = 'extraorcamentario',
    subtipo_extraorcamentario = CASE 
      WHEN LOWER(programa) LIKE '%compensação%' OR LOWER(descritivo) LIKE '%compensação%' THEN 'compensacao_ambiental'
      WHEN LOWER(programa) LIKE '%indenização%' OR LOWER(descritivo) LIKE '%indenização%' OR LOWER(programa) LIKE '%belo monte%' THEN 'indenizacao'
      WHEN LOWER(programa) LIKE '%royalt%' OR LOWER(descritivo) LIKE '%royalt%' THEN 'royalties'
      WHEN LOWER(programa) LIKE '%convênio%' OR LOWER(descritivo) LIKE '%convênio%' OR LOWER(programa) LIKE '%cvrd%' OR LOWER(descritivo) LIKE '%vale%' THEN 'convenio'
      ELSE 'receita_propria'
    END
WHERE programa LIKE '%0151%' 
  AND (dotacao_inicial IS NULL OR dotacao_inicial = 0) 
  AND (dotacao_autorizada IS NULL OR dotacao_autorizada = 0);

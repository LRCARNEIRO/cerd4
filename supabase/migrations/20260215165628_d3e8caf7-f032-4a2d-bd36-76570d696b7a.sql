
-- Add descriptive metadata columns to dados_orcamentarios
ALTER TABLE public.dados_orcamentarios
  ADD COLUMN IF NOT EXISTS descritivo text,
  ADD COLUMN IF NOT EXISTS publico_alvo text,
  ADD COLUMN IF NOT EXISTS razao_selecao text;

-- Add comment for documentation
COMMENT ON COLUMN public.dados_orcamentarios.descritivo IS 'Descrição da ação/programa orçamentário';
COMMENT ON COLUMN public.dados_orcamentarios.publico_alvo IS 'Público-alvo da ação (ex: população negra, quilombolas, ciganos)';
COMMENT ON COLUMN public.dados_orcamentarios.razao_selecao IS 'Justificativa técnica da inclusão: camada PPA, subfunção 422, órgão específico ou palavra-chave';

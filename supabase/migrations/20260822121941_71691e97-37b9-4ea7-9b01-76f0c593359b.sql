CREATE TABLE public.orcamento_api_raw (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ano integer NOT NULL,
  codigo_programa text NOT NULL DEFAULT '',
  nome_programa text,
  codigo_acao text NOT NULL DEFAULT '',
  nome_acao text,
  codigo_orgao text NOT NULL DEFAULT '',
  nome_orgao text,
  codigo_unidade_orcamentaria text NOT NULL DEFAULT '',
  nome_unidade_orcamentaria text,
  codigo_funcao text,
  nome_funcao text,
  codigo_subfuncao text,
  nome_subfuncao text,
  dotacao_inicial numeric,
  dotacao_atualizada numeric,
  empenhado numeric,
  liquidado numeric,
  pago numeric,
  consulta_parametro text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  coletado_em timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT orcamento_api_raw_chave UNIQUE (ano, codigo_programa, codigo_acao, codigo_orgao, codigo_unidade_orcamentaria)
);

CREATE INDEX idx_orcamento_api_raw_ano ON public.orcamento_api_raw (ano);
CREATE INDEX idx_orcamento_api_raw_prog ON public.orcamento_api_raw (codigo_programa, codigo_acao);

GRANT SELECT ON public.orcamento_api_raw TO anon;
GRANT SELECT ON public.orcamento_api_raw TO authenticated;
GRANT ALL ON public.orcamento_api_raw TO service_role;

ALTER TABLE public.orcamento_api_raw ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access for orcamento_api_raw"
  ON public.orcamento_api_raw FOR SELECT USING (true);
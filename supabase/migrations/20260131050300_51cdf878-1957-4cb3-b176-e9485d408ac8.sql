-- Tabela para dados orçamentários de políticas raciais
CREATE TABLE public.dados_orcamentarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  programa VARCHAR NOT NULL,
  orgao VARCHAR NOT NULL,
  esfera VARCHAR NOT NULL CHECK (esfera IN ('federal', 'estadual', 'municipal')),
  ano INTEGER NOT NULL CHECK (ano >= 2018 AND ano <= 2026),
  dotacao_inicial DECIMAL(15,2),
  dotacao_autorizada DECIMAL(15,2),
  empenhado DECIMAL(15,2),
  liquidado DECIMAL(15,2),
  pago DECIMAL(15,2),
  percentual_execucao DECIMAL(5,2),
  grupo_focal VARCHAR,
  eixo_tematico VARCHAR,
  fonte_dados VARCHAR NOT NULL,
  url_fonte TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para consultas eficientes
CREATE INDEX idx_orcamento_ano ON public.dados_orcamentarios(ano);
CREATE INDEX idx_orcamento_programa ON public.dados_orcamentarios(programa);
CREATE INDEX idx_orcamento_esfera ON public.dados_orcamentarios(esfera);
CREATE INDEX idx_orcamento_eixo ON public.dados_orcamentarios(eixo_tematico);

-- Habilitar RLS
ALTER TABLE public.dados_orcamentarios ENABLE ROW LEVEL SECURITY;

-- Política de leitura pública
CREATE POLICY "Dados orçamentários são públicos para leitura"
ON public.dados_orcamentarios
FOR SELECT
USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_dados_orcamentarios_updated_at
BEFORE UPDATE ON public.dados_orcamentarios
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Comentários
COMMENT ON TABLE public.dados_orcamentarios IS 'Dados orçamentários de programas de políticas raciais 2018-2026';
COMMENT ON COLUMN public.dados_orcamentarios.dotacao_inicial IS 'Valor inicialmente previsto na LOA';
COMMENT ON COLUMN public.dados_orcamentarios.dotacao_autorizada IS 'Valor após créditos adicionais';
COMMENT ON COLUMN public.dados_orcamentarios.empenhado IS 'Valor empenhado no exercício';
COMMENT ON COLUMN public.dados_orcamentarios.liquidado IS 'Valor liquidado no exercício';
COMMENT ON COLUMN public.dados_orcamentarios.pago IS 'Valor efetivamente pago';
COMMENT ON COLUMN public.dados_orcamentarios.percentual_execucao IS 'Percentual de execução (pago/autorizado)';

-- Tabela para armazenar documentos normativos enviados
CREATE TABLE public.documentos_normativos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  categoria TEXT NOT NULL DEFAULT 'legislacao',
  tipo_arquivo TEXT,
  tamanho TEXT,
  url_origem TEXT,
  metas_impactadas TEXT[] DEFAULT '{}',
  secoes_impactadas TEXT[] DEFAULT '{}',
  recomendacoes_impactadas TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pendente',
  snapshot_id UUID REFERENCES public.data_snapshots(id),
  total_itens_extraidos INTEGER DEFAULT 0,
  resumo_impacto JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.documentos_normativos ENABLE ROW LEVEL SECURITY;

-- Public read/write for now (no auth in this system)
CREATE POLICY "Allow all access to documentos_normativos"
  ON public.documentos_normativos
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Trigger for updated_at
CREATE TRIGGER update_documentos_normativos_updated_at
  BEFORE UPDATE ON public.documentos_normativos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

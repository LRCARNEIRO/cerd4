
-- Table to store data snapshots before imports
CREATE TABLE public.data_snapshots (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  descricao TEXT,
  arquivo_origem TEXT,
  usuario_id TEXT DEFAULT 'anonymous',
  snapshot_data JSONB NOT NULL,
  tabelas_afetadas TEXT[] NOT NULL,
  total_registros INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.data_snapshots ENABLE ROW LEVEL SECURITY;

-- Public read access for dashboard
CREATE POLICY "Snapshots are viewable by everyone"
ON public.data_snapshots FOR SELECT
USING (true);

-- Insert only via service role (edge function)
CREATE POLICY "Only service role can insert snapshots"
ON public.data_snapshots FOR INSERT
WITH CHECK (false);

-- Delete only via service role
CREATE POLICY "Only service role can delete snapshots"
ON public.data_snapshots FOR DELETE
USING (false);

-- Index for quick lookups
CREATE INDEX idx_snapshots_created_at ON public.data_snapshots(created_at DESC);

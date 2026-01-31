-- Tipos enumerados para categorização
CREATE TYPE public.compliance_status AS ENUM (
  'cumprido', 
  'parcialmente_cumprido', 
  'nao_cumprido', 
  'retrocesso', 
  'em_andamento'
);

CREATE TYPE public.priority_level AS ENUM (
  'critica', 
  'alta', 
  'media', 
  'baixa'
);

CREATE TYPE public.observation_type AS ENUM (
  'preocupacao', 
  'recomendacao', 
  'solicitacao', 
  'elogio'
);

CREATE TYPE public.focal_group_type AS ENUM (
  'negros',
  'indigenas', 
  'quilombolas',
  'ciganos',
  'religioes_matriz_africana',
  'juventude_negra',
  'mulheres_negras',
  'lgbtqia_negros',
  'pcd_negros',
  'idosos_negros',
  'geral'
);

CREATE TYPE public.thematic_axis AS ENUM (
  'legislacao_justica',
  'politicas_institucionais',
  'seguranca_publica',
  'saude',
  'educacao',
  'trabalho_renda',
  'terra_territorio',
  'cultura_patrimonio',
  'participacao_social',
  'dados_estatisticas'
);

-- Tabela principal de lacunas identificadas
CREATE TABLE public.lacunas_identificadas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referência ao documento ONU
  documento_onu VARCHAR(100) NOT NULL DEFAULT 'CERD/C/BRA/CO/18-20',
  paragrafo VARCHAR(20) NOT NULL,
  data_documento DATE NOT NULL DEFAULT '2022-08-30',
  
  -- Categorização
  eixo_tematico thematic_axis NOT NULL,
  grupo_focal focal_group_type NOT NULL DEFAULT 'geral',
  tipo_observacao observation_type NOT NULL,
  
  -- Conteúdo
  tema VARCHAR(255) NOT NULL,
  descricao_lacuna TEXT NOT NULL,
  texto_original_onu TEXT,
  
  -- Análise de cumprimento
  status_cumprimento compliance_status NOT NULL DEFAULT 'nao_cumprido',
  prioridade priority_level NOT NULL DEFAULT 'media',
  
  -- Período de análise
  periodo_analise_inicio INTEGER NOT NULL DEFAULT 2018,
  periodo_analise_fim INTEGER NOT NULL DEFAULT 2026,
  
  -- Evidências e ações
  evidencias_encontradas TEXT[],
  acoes_brasil TEXT[],
  fontes_dados TEXT[],
  
  -- Indicadores quantitativos
  indicadores_relacionados JSONB,
  
  -- Interseccionalidades
  interseccionalidades TEXT[],
  
  -- Para relatórios
  resposta_sugerida_common_core TEXT,
  resposta_sugerida_cerd_iv TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de indicadores interseccionais
CREATE TABLE public.indicadores_interseccionais (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  nome VARCHAR(255) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  subcategoria VARCHAR(100),
  
  -- Fonte
  fonte VARCHAR(100) NOT NULL,
  url_fonte TEXT,
  
  -- Desagregações disponíveis
  desagregacao_raca BOOLEAN DEFAULT true,
  desagregacao_genero BOOLEAN DEFAULT true,
  desagregacao_idade BOOLEAN DEFAULT true,
  desagregacao_classe BOOLEAN DEFAULT false,
  desagregacao_orientacao_sexual BOOLEAN DEFAULT false,
  desagregacao_deficiencia BOOLEAN DEFAULT false,
  desagregacao_territorio BOOLEAN DEFAULT true,
  
  -- Dados por período
  dados JSONB NOT NULL,
  
  -- Análise
  tendencia VARCHAR(20),
  analise_interseccional TEXT,
  
  -- Vinculação a lacunas
  lacunas_relacionadas UUID[],
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de conclusões analíticas
CREATE TABLE public.conclusoes_analiticas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  titulo VARCHAR(255) NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'avanco', 'retrocesso', 'lacuna_persistente', 'omissao'
  
  -- Período
  periodo VARCHAR(50) NOT NULL, -- '2018-2022', '2023-2025', '2018-2026'
  
  -- Conteúdo
  argumento_central TEXT NOT NULL,
  evidencias TEXT[],
  indicadores_suporte JSONB,
  
  -- Vinculações
  lacunas_relacionadas UUID[],
  eixos_tematicos thematic_axis[],
  grupos_focais focal_group_type[],
  
  -- Para relatórios
  relevancia_common_core BOOLEAN DEFAULT true,
  relevancia_cerd_iv BOOLEAN DEFAULT true,
  secao_relatorio VARCHAR(50),
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de respostas às lacunas do CERD III
CREATE TABLE public.respostas_lacunas_cerd_iii (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referência à crítica original
  paragrafo_cerd_iii VARCHAR(20) NOT NULL,
  critica_original TEXT NOT NULL,
  
  -- Resposta estruturada
  resposta_brasil TEXT NOT NULL,
  evidencias_quantitativas JSONB,
  evidencias_qualitativas TEXT[],
  
  -- Avaliação
  grau_atendimento compliance_status NOT NULL,
  justificativa_avaliacao TEXT,
  
  -- Lacunas remanescentes
  lacunas_remanescentes TEXT[],
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.lacunas_identificadas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indicadores_interseccionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conclusoes_analiticas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respostas_lacunas_cerd_iii ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (dados do relatório são públicos)
CREATE POLICY "Lacunas são públicas para leitura" 
ON public.lacunas_identificadas FOR SELECT USING (true);

CREATE POLICY "Indicadores são públicos para leitura" 
ON public.indicadores_interseccionais FOR SELECT USING (true);

CREATE POLICY "Conclusões são públicas para leitura" 
ON public.conclusoes_analiticas FOR SELECT USING (true);

CREATE POLICY "Respostas CERD III são públicas para leitura" 
ON public.respostas_lacunas_cerd_iii FOR SELECT USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_lacunas_updated_at
BEFORE UPDATE ON public.lacunas_identificadas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_indicadores_updated_at
BEFORE UPDATE ON public.indicadores_interseccionais
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_conclusoes_updated_at
BEFORE UPDATE ON public.conclusoes_analiticas
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_respostas_updated_at
BEFORE UPDATE ON public.respostas_lacunas_cerd_iii
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
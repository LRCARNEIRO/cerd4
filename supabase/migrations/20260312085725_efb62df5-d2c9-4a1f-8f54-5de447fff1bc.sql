
-- Add audit tracking column
ALTER TABLE indicadores_interseccionais 
ADD COLUMN auditado_manualmente boolean DEFAULT false,
ADD COLUMN data_auditoria timestamp with time zone DEFAULT null;

-- Mark as audited: indicators matching Dados Gerais categories
UPDATE indicadores_interseccionais 
SET auditado_manualmente = true, data_auditoria = now()
WHERE categoria IN ('Demografia', 'trabalho_renda', 'Trabalho e Renda', 'habitacao', 'Habitação e Moradia');

-- Mark as audited: indicators matching Segurança/Saúde/Educação
UPDATE indicadores_interseccionais 
SET auditado_manualmente = true, data_auditoria = now()
WHERE categoria IN ('seguranca_publica', 'Segurança Pública', 'Sistema de Justiça Criminal', 'Sistema Prisional', 'saude', 'Saúde', 'educacao');

-- Mark as audited: Raça × Gênero related (subcategoria or intersectional analysis involving gender+race)
UPDATE indicadores_interseccionais 
SET auditado_manualmente = true, data_auditoria = now()
WHERE desagregacao_raca = true AND desagregacao_genero = true
AND categoria IN ('trabalho_renda', 'Trabalho e Renda', 'educacao', 'saude', 'Saúde');

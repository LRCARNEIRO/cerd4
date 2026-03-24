-- Reclassificação permissiva das lacunas (Política de Conformidade Equilibrada v2)

-- 1. nao_cumprido COM ações do Brasil → parcialmente_cumprido
UPDATE lacunas_identificadas 
SET status_cumprimento = 'parcialmente_cumprido', updated_at = now()
WHERE status_cumprimento = 'nao_cumprido' 
AND acoes_brasil IS NOT NULL AND array_length(acoes_brasil, 1) > 0;

-- 2. nao_cumprido COM 3+ evidências (sem ações) → parcialmente_cumprido
UPDATE lacunas_identificadas 
SET status_cumprimento = 'parcialmente_cumprido', updated_at = now()
WHERE status_cumprimento = 'nao_cumprido' 
AND evidencias_encontradas IS NOT NULL AND array_length(evidencias_encontradas, 1) >= 3
AND (acoes_brasil IS NULL OR array_length(acoes_brasil, 1) IS NULL);

-- 3. nao_cumprido COM 1-2 evidências → em_andamento
UPDATE lacunas_identificadas 
SET status_cumprimento = 'em_andamento', updated_at = now()
WHERE status_cumprimento = 'nao_cumprido' 
AND evidencias_encontradas IS NOT NULL 
AND array_length(evidencias_encontradas, 1) >= 1
AND array_length(evidencias_encontradas, 1) < 3
AND (acoes_brasil IS NULL OR array_length(acoes_brasil, 1) IS NULL);

-- 4. parcialmente_cumprido COM 2+ ações E 3+ evidências → cumprido
UPDATE lacunas_identificadas 
SET status_cumprimento = 'cumprido', updated_at = now()
WHERE status_cumprimento = 'parcialmente_cumprido' 
AND acoes_brasil IS NOT NULL AND array_length(acoes_brasil, 1) >= 2
AND evidencias_encontradas IS NOT NULL AND array_length(evidencias_encontradas, 1) >= 3;
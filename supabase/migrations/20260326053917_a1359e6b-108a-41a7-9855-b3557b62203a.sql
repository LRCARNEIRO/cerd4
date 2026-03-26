-- Auditoria do Sensor Diagnóstico: aceitar posição mais favorável ao Brasil
-- quando há evidência de esforço normativo + orçamentário

-- 1. Retrocesso → Não Cumprido (2 lacunas com cobertura normativa e orçamentária)
UPDATE lacunas_identificadas 
SET status_cumprimento = 'nao_cumprido'
WHERE id IN (
  '48cdd482-07bd-4d54-8eb4-2ecad9859ab7',
  '68d19b27-e0b9-42f2-840d-e6b1060a7d43'
) AND status_cumprimento = 'retrocesso';

-- 2. Não Cumprido → Em Andamento (lacunas com evidência de esforço normativo/orçamentário)
UPDATE lacunas_identificadas 
SET status_cumprimento = 'em_andamento'
WHERE id IN (
  '089fb139-cbd1-422b-8421-37f9095942f1',
  '394fd054-8e01-40b6-b9cb-db730886aa49',
  '132f0570-56b5-4db7-a85f-8a59addd4f26',
  'ebf4a4cf-cb47-4d3d-8aaf-30d21981b2f6',
  '696396bd-c854-440f-a61c-4260e7c8d196',
  '7504b219-450f-486f-85af-871fa018982a',
  '7e73a842-eb08-4d50-abb0-ba7190c653f4',
  '969d0e69-d7f3-4d4b-b920-6f54476cd6f9',
  'c12352cf-21d4-48bc-9adb-c675b9be79de',
  '7a36f4e7-7190-41df-8e90-b672cc3db522',
  'd594fbf0-9118-455f-9215-2c5121d308db',
  '365526a0-34e4-4c2c-b1a4-cf395b410a21',
  '98a72ef1-b8dd-48e0-b68e-205a7c2fb8c2',
  '654cfa02-7de5-48cc-b9bf-68e39f43efe9',
  '8b44e777-dc08-4c13-a9f8-2426790ec072',
  'ec51e723-0026-4faf-9c0f-0ac9a3499484',
  '48672a4c-cd77-4063-bf1d-3845bd9b8610',
  '8a8c0b2c-f20c-4db7-a2cc-41a1df9f9b31',
  '5f6ce8d5-7d3c-4303-bb4d-9971501add6b',
  'b9be9680-ade0-45a4-a4c1-a67631229779',
  '1fee711a-1e26-466d-8266-14d3b6773f09',
  '031a6270-0a56-48b5-95b5-702995830be5',
  '34d75902-ee94-4cf3-b773-66b7a8b6ce33'
) AND status_cumprimento = 'nao_cumprido';
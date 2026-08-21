UPDATE public.dados_orcamentarios d
SET
  observacoes = CASE WHEN coalesce(d.observacoes,'') = '' THEN 'orgao_origem: ' || d.orgao
                     ELSE d.observacoes || ' | orgao_origem: ' || d.orgao END,
  orgao = CASE
    WHEN split_part(split_part(d.programa,' / ',2),' – ',1) = '155L' THEN 'FUNAI'
    WHEN split_part(d.programa,' – ',1) = '0151' THEN 'FUNAI'
    WHEN split_part(split_part(d.programa,' / ',2),' – ',1) = '21C0' THEN 'SESAI'
    WHEN split_part(split_part(d.programa,' / ',2),' – ',1) IN ('21BO','21FL','21HW','00WO') THEN 'MPI'
    WHEN split_part(split_part(d.programa,' / ',2),' – ',1) = '00WL' THEN 'MRE'
    WHEN split_part(split_part(d.programa,' / ',2),' – ',1) = '21EN' THEN 'ICMBio'
    WHEN split_part(split_part(d.programa,' / ',2),' – ',1) IN ('20VQ','21F2') THEN 'MMA'
    WHEN split_part(split_part(d.programa,' / ',2),' – ',1) = '21EM' THEN 'MD'
    WHEN split_part(split_part(d.programa,' / ',2),' – ',1) IN ('210R','210T') THEN 'INCRA'
    WHEN split_part(d.programa,' – ',1) = '2034' AND d.ano <= 2022 THEN 'SEPPIR'
    WHEN split_part(split_part(d.programa,' / ',2),' – ',1) IN ('210H','213Q','214D','6440','21FE','21FF','21FB','21FC','21FD','21FG','21HN') THEN 'MIR'
    ELSE 'NAO_IDENTIFICADO'
  END
WHERE d.orgao = 'Federal';

UPDATE public.dados_orcamentarios
SET observacoes = CASE WHEN coalesce(observacoes,'') = '' THEN 'orgao_origem: ' || orgao
                       ELSE observacoes || ' | orgao_origem: ' || orgao END,
    orgao = 'MC'
WHERE orgao = 'Ministério da Cidadania - Administração Direta';

UPDATE public.dados_orcamentarios
SET observacoes = CASE WHEN coalesce(observacoes,'') = '' THEN 'orgao_origem: ' || orgao
                       ELSE observacoes || ' | orgao_origem: ' || orgao END,
    orgao = 'INEP'
WHERE orgao LIKE 'Ministério da Educação - Instituto Nacional%';

UPDATE public.dados_orcamentarios
SET observacoes = CASE WHEN coalesce(observacoes,'') = '' THEN 'orgao_origem: ' || orgao
                       ELSE observacoes || ' | orgao_origem: ' || orgao END,
    orgao = 'SESAI'
WHERE orgao = 'SESAI/FNS';
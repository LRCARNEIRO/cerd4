# Base orçamentária: órgão canônico + deduplicação lógica

Duas frentes complementares, executadas nesta ordem. A base bruta continua completa (cada camada mantém sua motivação de captura); o que muda é que **somatórios, cards e a listagem de evidências passam a usar somente o conjunto deduplicado**.

## Passo 1 — Normalizar `orgao` para sigla canônica em toda a base

- Criar um dicionário canônico único (`src/utils/orgaoCanonico.ts`): "Ministério dos Direitos Humanos e da Cidadania" → MDHC, "Ministério da Igualdade Racial" → MIR, "Federal" (genérico) → resolvido pelo código do órgão/ação quando existir, senão mantido como `NAO_IDENTIFICADO`.
- Migração one-shot de `UPDATE` em `dados_orcamentarios` aplicando o dicionário, para que exportações brutas e planilhas de auditoria saiam limpas.
- Guardar o rótulo original em `observacoes` (prefixo `orgao_origem:`) para não perder rastro de auditoria.
- Aplicar o mesmo dicionário na escrita das funções de ingestão, para que novas cargas já entrem normalizadas.

## Passo 2 — Camada de deduplicação lógica (leitura)

- Novo hook `useOrcamentoCanonico()` que carrega todos os registros e devolve dois conjuntos: `todos` (bruto, para a listagem completa) e `canonico` (um registro por grupo).
- **Chave de agrupamento:** `programa/ação normalizados + ano + esfera`. O `orgao` já normalizado entra como critério de desempate, não como parte da chave — assim variações residuais não voltam a quebrar a colisão.
- **Ranking de fonte** para eleger o vencedor de cada grupo:
  1. API Portal da Transparência (ação específica)
  2. Programa PPA (Camada 1)
  3. Órgãos MIR/MPI (Camada 3) e SESAI/FUNAI/INCRA (Camada 4)
  4. Subfunção 422 (Camada 2 — genérica)
  5. Carga Agenda Transversal (usada só quando é a única cobertura do grupo)
- Empate no ranking: vence o registro com `pago` preenchido e `url_fonte` presente.
- Cada registro recebe `is_canonico: boolean` e `duplicado_de: id`, para exibição transparente.

## Passo 3 — Ligar os consumidores ao conjunto canônico

- Cards e totalizadores da página Orçamento: total de registros, ações orçamentárias e extraorçamentárias, programas distintos, Σ dotação, Σ pago, Σ execução, e os recortes por período (P1 2018-2022 / P2 2023-2025) passam a somar apenas `canonico`.
- Execução recalculada como `Σ pago / Σ dotação` do conjunto canônico, eliminando o sentinela de 99.999,99% que vinha de divisão por dotação zero.
- Seletor de evidências e o sensor de diagnóstico (`useDiagnosticSensor`) passam a enxergar apenas `canonico`, para que uma mesma ação não seja vinculada duas vezes à mesma recomendação.
- Geradores de relatório (CERD IV, Orçamentário, Protocolo de Governança) usam a mesma fonte, mantendo a paridade UI × relatório.

## Passo 4 — Transparência e legenda

- Listagem completa continua exibindo todos os registros, com selo "duplicado — não somado" e tooltip apontando o registro canônico e a camada de origem.
- Filtro rápido "Somente base canônica" na listagem.
- Legenda metodológica fixa explicando a chave de deduplicação e o ranking de fontes, replicada nas exportações.

## Passo 5 — Verificação

- Painel de auditoria mostra: nº bruto vs canônico, valor bruto vs canônico e a diferença suprimida (hoje ~R$ 664 mi de dupla contagem).
- Conferência dos totais na página Orçamento, na Home e no relatório orçamentário para garantir que os três batem.

## Nota técnica

A deduplicação permanece em camada de leitura, não em constraint de banco: nenhum dado é apagado, e a regra pode ser recalibrada sem nova migração. Se mais adiante quiser transformar a regra em garantia do banco, um índice único sobre a chave canônica pode ser adicionado sem conflitar com esta implementação.

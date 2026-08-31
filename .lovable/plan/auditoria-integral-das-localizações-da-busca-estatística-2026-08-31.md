# Auditoria integral das localizações da busca estatística

## Objetivo
Eliminar indicações incorretas de abas para todo o catálogo, fazendo a busca anunciar somente localizações comprovadas por blocos reais e identificáveis na interface.

## Implementação
1. **Unificar a fonte de localização**
   - Remover da busca as inferências amplas por categoria, subcategoria e procedência que podem anunciar uma aba sem garantir a existência do bloco.
   - Usar um registro explícito por evidência: código, título/alias, aba real e âncora estável.
   - Manter “Espelho Seguro (BD)” como localização canônica garantida para os guarda-chuvas sem subindicadores.

2. **Auditar as 12 abas por completo**
   - Confrontar todos os `IND-NNN` e subindicadores indexados com os componentes efetivamente renderizados.
   - Corrigir localizações extras, ausentes ou conflitantes.
   - Identificar blocos visuais ainda sem ID e vinculá-los somente quando houver correspondência exata com a base auditada, sem criar códigos ou dados.

3. **Tornar navegação e carimbo determinísticos**
   - Fazer cada resultado temático navegar por sua âncora explícita, sem busca aproximada por tokens.
   - Impedir colisões de aliases e carimbos em abas erradas.
   - Preservar a regra de que guarda-chuva com subs não aparece como evidência separada.

4. **Adicionar validação automatizada exaustiva**
   - Criar uma auditoria que percorra todo o registro e detecte: aba inválida, âncora duplicada, alias conflitante, sub sem guarda-chuva canônico e localização sem marcador correspondente.
   - Integrar testes de regressão para todos os IDs, incluindo IND-012/IND-014, e não apenas amostras.

5. **Validar no site**
   - Executar a auditoria e os testes.
   - Conferir no navegador buscas representativas de todas as abas e o clique até o bloco/ID correto.
   - Reportar o total de IDs verificados e qualquer pendência que não possa ser resolvida sem violar a Regra de Ouro.

## Limites de dados
- Nenhum valor estatístico será alterado.
- Nenhum ID será inventado ou recalculado.
- Common Core continuará excluído.

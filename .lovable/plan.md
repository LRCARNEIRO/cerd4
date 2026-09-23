# Alinhar a listagem orçamentária ao inventário canônico

## Objetivo
Fazer a Visão Geral, os cartões de Programa/Ação e os cálculos de execução reproduzirem exatamente as 204 linhas da Base Orçamentária do inventário canônico.

## Diagnóstico confirmado
- A base do sistema e a planilha canônica já têm as mesmas 204 linhas e os mesmos totais.
- Das 204 linhas, 114 são orçamentárias e 90 são extraorçamentárias.
- As 90 extraorçamentárias não possuem dotação LOA por definição; não podem receber dotação inventada nem compor o denominador da execução.
- Entre as 114 orçamentárias, somente 2 linhas documentais de 2020 não têm valores financeiros no próprio inventário.
- A Visão Geral mistura hoje valores extraorçamentários no numerador e os cartões usam um percentual gravado, causando leitura incorreta ou ausência de execução.

## Alterações
1. Centralizar a regra financeira canônica:
   - execução = soma do liquidado ÷ soma da dotação autorizada;
   - considerar no cálculo somente linhas orçamentárias com dotação positiva;
   - não substituir dotação ausente por empenhado ou pago.
2. Aplicar essa regra à Visão Geral e aos cartões de Programa/Ação, calculando a execução ao vivo em vez de usar percentual antigo gravado.
3. Identificar claramente cada linha/cartão como `Orçamentário`, `Extraorçamentário — execução não se aplica` ou `Sem valor financeiro no inventário`.
4. Manter na listagem os 90 registros extraorçamentários e as 2 linhas documentais, pois fazem parte das 204 evidências canônicas, sem deixá-los distorcer a execução.
5. Ajustar os resumos e exportações da página para seguirem a mesma regra.

## Validação
- Conferir na tela: 204 registros = 114 orçamentários + 90 extraorçamentários.
- Conferir os totais contra o inventário: dotação R$ 21.617.731.836,00; empenhado R$ 21.577.816.569,05; liquidado R$ 17.636.892.826,87; pago R$ 17.367.858.819,56.
- Verificar que apenas 2 linhas orçamentárias ficam sem dotação e que nenhuma linha extraorçamentária recebe percentual de execução.
- Testar Visão Geral e Universo da Base no navegador, além da validação automática do projeto.

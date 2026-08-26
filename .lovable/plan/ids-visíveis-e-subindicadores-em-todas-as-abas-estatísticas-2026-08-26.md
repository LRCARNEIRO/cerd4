# IDs visíveis e subindicadores em todas as abas estatísticas

## Objetivo
Garantir que todo gráfico, card ou tabela com conteúdo estatístico próprio tenha um identificador visível e possa ser encontrado e selecionado como evidência, não apenas em Dados Gerais e Segurança/Saúde/Educação.

## Implementação
1. **Corrigir a visibilidade já implementada**
   - Manter o código congelado do indicador guarda-chuva como fonte canônica.
   - Exibir o selo no título do bloco mesmo durante o carregamento da base, usando somente o código persistido já conhecido — sem gerar códigos novos.
   - Usar âncoras estáveis por subindicador para que a busca leve ao gráfico/card exato.

2. **Inventariar e identificar todas as abas**
   - Cobrir: Vulnerabilidades, Raça × Gênero, LGBTQIA+, Deficiência, Juventude, Classe Social, Administração Pública, COVID, Grupos Focais, ODS Racial e Complemento CERD III.
   - Para cada bloco visual independente, vincular o nome exato do guarda-chuva auditado e adicionar `IND-NNN · sub: título curto` quando houver mais de um bloco sob o mesmo indicador.
   - Indicadores que já são registros individuais recebem apenas o seu `IND-NNN`, sem criar subindicador artificial.
   - Se não houver correspondência canônica exata, o bloco permanece explicitamente pendente; nenhum ID será estimado ou herdado.

3. **Busca e seleção de evidências**
   - Centralizar todos os novos subindicadores no registro único de busca.
   - Indexar título visível e sinônimos relevantes.
   - Remover resultados estáticos duplicados “sem ID” quando o mesmo conteúdo já estiver coberto por indicador/subindicador canônico.
   - Validar que o clique destaca e posiciona no bloco exato.

4. **Inventário v16 atualizado**
   - Regenerar a planilha com todos os subindicadores visuais efetivamente implantados em todas as abas.
   - Preservar integralmente os 210 registros auditados, 382 chaves internas, códigos congelados e valores estatísticos.
   - Separar claramente: indicadores canônicos, chaves internas e referências visuais localizáveis.

5. **Validação**
   - Testar uma amostra de cada aba no desktop: selo visível, busca, navegação e realce.
   - Conferir ausência de Common Core e ausência de alterações nos dados auditados.
   - Verificar build e erros de execução/rede.
   - Atualizar a versão pública para que `cerd4.lovable.app` reflita os IDs validados.

## Nota técnica
A quantidade final de subindicadores será derivada do inventário real dos blocos visuais e informada após a implementação; não será fixada previamente nem confundida com as 382 chaves internas.

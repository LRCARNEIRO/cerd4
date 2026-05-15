## Objetivo

Garantir que **toda evidência numérica visível em qualquer aba** seja também um registro discreto em `indicadores_interseccionais` — com ID, código IND-NNN, indexada na busca global, e selecionável como evidência em recomendações/artigos.

---

## Etapa 1 — Inventário (apresentar antes de mexer)

Gerar e exibir uma lista comparativa:

| Local na UI | Métrica | Grupo | Valor visível | Existe no BD? |
|---|---|---|---|---|
| GruposFocaisTab §quilombolas.infraestrutura | água | quilombolas | 73,4% | ✅ campo no agregado, ❌ sem registro próprio |
| GruposFocaisTab §quilombolas.infraestrutura | esgoto | quilombolas | 29,47% | ❌ sem registro próprio |
| GruposFocaisTab §quilombolas.infraestrutura | lixo | quilombolas | 51,28% | ❌ |
| GruposFocaisTab §quilombolas.infraestrutura | sem banheiro | quilombolas | 70,53% | ✅ no novo registro 33b91171, mas mistura com TIs |
| GruposFocaisTab §indigenas (urbanos) | água/esgoto/lixo | Indígenas urbanos | 89,92% / 59,24% / 5,83% | ❌ |
| GruposFocaisTab — pretos isolado | esgoto | Pretos | 7,61% | ❌ (só agregado "Pop. Negra") |
| GruposFocaisTab — pardos isolado | esgoto | Pardos | 31,23% | ❌ |
| GruposFocaisTab — pretos | coleta lixo | Pretos | 9,24% | ❌ |
| ... | ... | ... | ... | ... |

Escopo do varrimento: `GruposFocaisTab.tsx`, `VulnerabilidadesTab.tsx`, `DadosNovosTab.tsx`, `SegurancaSaudeEducacaoTab.tsx`, `ComplementoCerd3Tab.tsx`, `OdsRacialTab.tsx`. Foco em valores numéricos/% que já apareçam como dados oficiais (não em texto descritivo).

Entrego em `/mnt/documents/inventario-evidencias-faltantes.csv` para você revisar.

---

## Etapa 2 — Expansão do transformador (após sua aprovação do CSV)

No `src/utils/staticToDbTransformer.ts`, substituir o bloco único `'População negra — infraestrutura domiciliar'` por **8-12 registros granulares**, padrão:

- `IND — Esgoto adequado — Pretos` (subcategoria `saneamento`)
- `IND — Esgoto adequado — Pardos`
- `IND — Coleta de lixo — Pretos`
- `IND — Coleta de lixo — Pardos`
- `IND — Acesso à rede de água — Pretos`
- `IND — Acesso à rede de água — Pardos`
- `IND — Sem banheiro — Pretos`
- `IND — Sem banheiro — Pardos`

E para territórios:

- `IND — Acesso à água — Quilombolas` (separar do agregado atual)
- `IND — Coleta de lixo — Quilombolas`
- `IND — Sem banheiro — Quilombolas`
- `IND — Acesso à água — Indígenas urbanos`
- `IND — Esgoto adequado — Indígenas urbanos`

Cada registro com `dados` mínimo (`{ano, valor, grupo, comparador_nacional}`), `categoria='habitacao'`, `subcategoria='saneamento'`, `artigos_convencao=['Art. 5']`, fonte SIDRA correta.

Re-executar o **MirrorIngestionPanel** automaticamente puxa os novos registros.

---

## Etapa 3 — Sweep mirror↔BD (o "sim" anterior)

Script de auditoria que:

1. Lê todos os indicadores do BD que tenham `dados.valor` ou `dados.{ano}.{grupo}`.
2. Compara contra o valor correspondente nos arquivos mirror TS.
3. Reporta divergências em `/mnt/documents/sweep-mirror-vs-bd.csv` com colunas: `IND-código | nome | campo | valor_mirror | valor_BD | divergente?`.

Sem corrigir nada automaticamente — só listo, você decide quais corrigir.

---

## Etapa 4 — Prevenção contínua

Adicionar no `MirrorIngestionPanel` (ou novo `ConsistencyAuditPanel`):

- Botão "Verificar consistência mirror↔BD" que roda a comparação on-demand.
- Badge vermelho se houver divergência > 0,1pp em qualquer campo.

---

## Detalhes técnicos

- Arquivos editados: `src/utils/staticToDbTransformer.ts` (expansão), novo `src/utils/mirrorBdConsistency.ts` (sweep), opcionalmente novo `src/components/estatisticas/ConsistencyAuditPanel.tsx`.
- Arquivos NÃO editados: `StatisticsData.ts` (continua sendo SSoT do mirror), `GruposFocaisTab.tsx` (UI permanece igual — só passa a refletir mais registros indexados).
- Migrações DB: nenhuma — só novos INSERTs via re-ingestão do espelho.
- Risco: a re-ingestão pode duplicar registros se as `clearCategories` não cobrirem `'habitacao'`. Vou verificar antes da Etapa 2.

---

## Decisões que preciso de você

1. **Granularidade:** quebrar por (métrica × grupo) como acima [12 registros], ou por (métrica × grupo × ano) [muito maior]? **Sugestão: só por grupo, ano fica dentro de `dados.series`.**
2. **Escopo do inventário Etapa 1:** todas as 6 abas listadas, ou começar só por Grupos Focais para validar o método?
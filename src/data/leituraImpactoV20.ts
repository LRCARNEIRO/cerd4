/**
 * Leitura canônica dos 130 indicadores de IMPACTO da Base Estatística
 * (Inventário v20 — IMPACTO 130 recalculados, metodologia simplificada).
 * GERADO a partir da planilha auditada; não editar à mão.
 * Contagem: 73 melhorou · 55 piorou · 2 estável.
 */
export type LeituraCanonica = 'maior é melhor' | 'menor é melhor' | 'mais próximo de 1 (100% de paridade) é melhor' | 'sem polaridade';
export interface LeituraImpactoEntry {
  codigo: string; sub: string | null; nome: string; titulo: string;
  leitura: LeituraCanonica; tendencia: 'melhorou' | 'piorou' | 'estável';
  /** tendência na versão-base anterior ao recálculo */
  anterior: 'melhorou' | 'piorou' | 'estável' | null;
  base: string;
}
export const LEITURA_IMPACTO_V20: LeituraImpactoEntry[] = [
 {
  "codigo": "IND-011",
  "sub": null,
  "nome": "Mortalidade de crianças indígenas (0-4 anos) vs não indígenas — NCPI/DataSUS",
  "titulo": "Mortalidade de crianças indígenas (0-4 anos) vs não indígenas — NCPI/DataSUS",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série do grupo-alvo: 38,90 (2018) → 34,70 (2022) = -10.80%. Como menor é melhor → melhorou."
 },
 {
  "codigo": "IND-015",
  "sub": null,
  "nome": "Paridade Racial nos Vínculos em Pequenas Empresas (Regime Simples) em Relação à População",
  "titulo": "Paridade Racial nos Vínculos em Pequenas Empresas (Regime Simples) em Relação à População",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2018 = (0,5408 + 0,0317 + 0,7794)/3 = 0,4506; 2024 = (0,4175 + 0,2163 + 0,8162)/3 = 0,4833. Aumentou 0,0327 → piorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-016",
  "sub": null,
  "nome": "Taxa de Internações por Álcool e Drogas por 100 mil habitantes",
  "titulo": "Taxa de Internações por Álcool e Drogas por 100 mil habitantes",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra +59.30%; amarela +3.81%; indigena +43.09%. Média = +35.40%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-017",
  "sub": null,
  "nome": "Taxa de Mortalidade Prematura (30-69 anos) por DCNT por 100 mil hab.",
  "titulo": "Taxa de Mortalidade Prematura (30-69 anos) por DCNT por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +13.67%; amarela +5.93%; indigena +14.76%. Média = +11.46%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-019",
  "sub": null,
  "nome": "Taxa de Internações por Rotavírus e Hepatite A por 100 mil hab.",
  "titulo": "Taxa de Internações por Rotavírus e Hepatite A por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2023: negra -4.34%; amarela -88.63%; indigena -4.39%. Média = -32.45%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-020",
  "sub": null,
  "nome": "Razão de Mortalidade Materna por 100 mil nascidos vivos",
  "titulo": "Razão de Mortalidade Materna por 100 mil nascidos vivos",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2022: negra -2.47%; amarela -42.87%; indigena -27.25%. Média = -24.20%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-022",
  "sub": null,
  "nome": "Taxa de Internações por Doenças Prevenidas pela Pentavalente por 100 mil hab.",
  "titulo": "Taxa de Internações por Doenças Prevenidas pela Pentavalente por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2023: negra -15.93%; amarela -9.15%; indigena -14.83%. Média = -13.30%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-023",
  "sub": null,
  "nome": "Taxa de Internações por Arboviroses por 100 mil habitantes",
  "titulo": "Taxa de Internações por Arboviroses por 100 mil habitantes",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra +161.96%; amarela +3.14%; indigena +429.19%. Média = +198.10%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-024",
  "sub": null,
  "nome": "Paridade Racial nos Vínculos em Médias e Grandes Empresas em Relação à População",
  "titulo": "Paridade Racial nos Vínculos em Médias e Grandes Empresas em Relação à População",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2018 = (0,5744 + 0,0184 + 0,7870)/3 = 0,4599; 2024 = (0,4038 + 0,7155 + 0,5913)/3 = 0,5702. Aumentou 0,1103 → piorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-025",
  "sub": null,
  "nome": "Paridade Racial da Massa Salarial de Vínculos Formais Ativos em Relação à População",
  "titulo": "Paridade Racial da Massa Salarial de Vínculos Formais Ativos em Relação à População",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2018 = (0,6672 + 0,3400 + 0,8104)/3 = 0,6059; 2024 = (0,4822 + 1,2484 + 0,6651)/3 = 0,7986. Aumentou 0,1927 → piorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-026",
  "sub": null,
  "nome": "Taxa de Internações por Doenças Prevenidas pela Tetraviral por 100 mil hab.",
  "titulo": "Taxa de Internações por Doenças Prevenidas pela Tetraviral por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2023: negra -42.41%; amarela -73.34%; indigena +2.20%. Média = -37.85%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-027",
  "sub": null,
  "nome": "Taxa de Mortalidade em Menores de 5 Anos por mil nascidos vivos",
  "titulo": "Taxa de Mortalidade em Menores de 5 Anos por mil nascidos vivos",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +9.16%; amarela -4.52%; indigena -0.16%. Média = +1.49%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-028",
  "sub": null,
  "nome": "Taxa de Mortalidade Infantil por mil nascidos vivos",
  "titulo": "Taxa de Mortalidade Infantil por mil nascidos vivos",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +6.88%; amarela +0.23%; indigena -1.46%. Média = +1.89%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-031",
  "sub": null,
  "nome": "Paridade Racial no Emprego Formal em Relação à População",
  "titulo": "Paridade Racial no Emprego Formal em Relação à População",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2018 = (0,5665 + 0,0066 + 0,7852)/3 = 0,4528; 2024 = (0,4070 + 0,6004 + 0,6432)/3 = 0,5502. Aumentou 0,0974 → piorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-032",
  "sub": null,
  "nome": "Taxa de Internações por Gripe por 100 mil habitantes",
  "titulo": "Taxa de Internações por Gripe por 100 mil habitantes",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra +72.08%; amarela -31.59%; indigena +26.06%. Média = +22.18%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-033",
  "sub": null,
  "nome": "Paridade Racial dos Vínculos Formais no Setor Agropecuário em Relação à População",
  "titulo": "Paridade Racial dos Vínculos Formais no Setor Agropecuário em Relação à População",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2018 = (0,4441 + 0,0390 + 0,7988)/3 = 0,4273; 2024 = (0,3571 + 0,0061 + 0,7042)/3 = 0,3558. Diminuiu 0,0715 → melhorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-034",
  "sub": null,
  "nome": "Salário Médio na Agropecuária em Vínculos Formais Ativos",
  "titulo": "Salário Médio na Agropecuária em Vínculos Formais Ativos",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +53.52%; amarela +52.62%; indigena +41.92%. Média = +49.35%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-035",
  "sub": null,
  "nome": "Infraestrutura Escolar - Taxa de Escolas com Internet Pedagógica",
  "titulo": "Infraestrutura Escolar - Taxa de Escolas com Internet Pedagógica",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2019→2023: negra +109.66%; amarela +22.21%; indigena +183.68%. Média = +105.19%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-036",
  "sub": null,
  "nome": "Percentual de Nascidos de Mães com Pré-Natal Adequado (7+ consultas)",
  "titulo": "Percentual de Nascidos de Mães com Pré-Natal Adequado (7+ consultas)",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2022: negra +8.94%; amarela +2.48%; indigena +19.01%. Média = +10.14%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-037",
  "sub": null,
  "nome": "Taxa de Adequação da Formação Docente - Ensino Fundamental II",
  "titulo": "Taxa de Adequação da Formação Docente - Ensino Fundamental II",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2023: negra +33.22%; amarela +60.13%; indigena +67.70%. Média = +53.68%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-038",
  "sub": null,
  "nome": "Taxa de Mortalidade de Jovens (15-29 anos) por 100 mil hab.",
  "titulo": "Taxa de Mortalidade de Jovens (15-29 anos) por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2022: negra -5.90%; amarela +3.51%; indigena +40.82%. Média = +12.81%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-039",
  "sub": null,
  "nome": "Taxa de Adequação da Formação Docente - Ensino Médio",
  "titulo": "Taxa de Adequação da Formação Docente - Ensino Médio",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2023: negra +18.50%; amarela +46.52%; indigena +24.41%. Média = +29.81%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-040",
  "sub": null,
  "nome": "Taxa de Mortalidade por Diabetes Mellitus por 100 mil hab.",
  "titulo": "Taxa de Mortalidade por Diabetes Mellitus por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +20.47%; amarela +5.25%; indigena +12.49%. Média = +12.74%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-041",
  "sub": null,
  "nome": "Infraestrutura Escolar - Taxa de Escolas com Água Encanada",
  "titulo": "Infraestrutura Escolar - Taxa de Escolas com Água Encanada",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2023: negra +16.37%; amarela +38.26%; indigena +26.24%. Média = +26.96%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-042",
  "sub": null,
  "nome": "Percentual de Nascidos Vivos de Parto Normal",
  "titulo": "Percentual de Nascidos Vivos de Parto Normal",
  "leitura": "maior é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra -7.60%; amarela -6.49%; indigena -4.84%. Média = -6.31%. Como maior é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-043",
  "sub": null,
  "nome": "Taxa de Mortalidade por Doenças do Aparelho Circulatório por 100 mil hab.",
  "titulo": "Taxa de Mortalidade por Doenças do Aparelho Circulatório por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +18.27%; amarela +18.98%; indigena +33.79%. Média = +23.68%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-044",
  "sub": null,
  "nome": "Infraestrutura Escolar - Taxa de Escolas com Banheiro Acessível",
  "titulo": "Infraestrutura Escolar - Taxa de Escolas com Banheiro Acessível",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2023: negra +46.97%; amarela +31.97%; indigena +75.54%. Média = +51.49%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-045",
  "sub": null,
  "nome": "Taxa de Adequação da Formação Docente - Ensino Fundamental I",
  "titulo": "Taxa de Adequação da Formação Docente - Ensino Fundamental I",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2023: negra +30.90%; amarela +1.34%; indigena +92.21%. Média = +41.48%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-046",
  "sub": null,
  "nome": "Infraestrutura Escolar - Taxa de Escolas com Eletricidade",
  "titulo": "Infraestrutura Escolar - Taxa de Escolas com Eletricidade",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2023: negra +10.66%; amarela +11.99%; indigena +18.47%. Média = +13.71%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-047",
  "sub": null,
  "nome": "Infraestrutura Escolar - Taxa de Escolas com Lab. Informática",
  "titulo": "Infraestrutura Escolar - Taxa de Escolas com Lab. Informática",
  "leitura": "maior é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra -20.14%; amarela +3.69%; indigena -4.87%. Média = -7.11%. Como maior é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-048",
  "sub": null,
  "nome": "Taxa de Mortalidade por Neoplasias Malignas por 100 mil hab.",
  "titulo": "Taxa de Mortalidade por Neoplasias Malignas por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +13.14%; amarela +11.62%; indigena +6.28%. Média = +10.35%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-049",
  "sub": null,
  "nome": "Taxa de Mortalidade por AIDS por 100 mil hab.",
  "titulo": "Taxa de Mortalidade por AIDS por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +7.89%; amarela +7.32%; indigena -9.47%. Média = +1.91%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-050",
  "sub": null,
  "nome": "Taxa de Adequação da Formação Docente - Ensino Infantil",
  "titulo": "Taxa de Adequação da Formação Docente - Ensino Infantil",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2023: negra +39.36%; amarela +9.48%; indigena +103.83%. Média = +50.89%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-051",
  "sub": null,
  "nome": "Percentual de Nascidos Vivos com Baixo Peso (< 2.500g)",
  "titulo": "Percentual de Nascidos Vivos com Baixo Peso (< 2.500g)",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +12.10%; amarela +3.47%; indigena +12.93%. Média = +9.50%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-052",
  "sub": null,
  "nome": "Taxa de Óbitos de Crianças e Adolescentes (1-14 anos) por 100 mil hab.",
  "titulo": "Taxa de Óbitos de Crianças e Adolescentes (1-14 anos) por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +3.02%; amarela -29.03%; indigena +15.80%. Média = -3.40%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-053",
  "sub": null,
  "nome": "Percentual de Nascidos de Mães Menores de Idade",
  "titulo": "Percentual de Nascidos de Mães Menores de Idade",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2022: negra -23.89%; amarela -21.68%; indigena -9.56%. Média = -18.38%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-054",
  "sub": null,
  "nome": "Taxa de Suicídio por 100 mil hab.",
  "titulo": "Taxa de Suicídio por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +38.79%; amarela +26.65%; indigena +13.31%. Média = +26.25%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-055",
  "sub": null,
  "nome": "Percentual de Assentos Ocupados por Mulheres em Parlamentos Locais",
  "titulo": "Percentual de Assentos Ocupados por Mulheres em Parlamentos Locais",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2020→2024: negra +12.37%; amarela -8.59%; indigena +27.65%. Média = +10.48%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-056",
  "sub": null,
  "nome": "Taxa de Mortalidade Atribuída à Água, Saneamento e Higiene Inseguros por 100 mil hab.",
  "titulo": "Taxa de Mortalidade Atribuída à Água, Saneamento e Higiene Inseguros por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +20.73%; amarela +7.16%; indigena +29.20%. Média = +19.03%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-057",
  "sub": null,
  "nome": "Média da Nota Geral no ENEM",
  "titulo": "Média da Nota Geral no ENEM",
  "leitura": "maior é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra -4.86%; amarela -10.25%; indigena -16.34%. Média = -10.48%. Como maior é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-058",
  "sub": null,
  "nome": "IDEB - Ensino Fundamental II (predominância)",
  "titulo": "IDEB - Ensino Fundamental II (predominância)",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2019→2023: negra +3.49%; amarela +14.41%; indigena +9.82%. Média = +9.24%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-059",
  "sub": null,
  "nome": "IDEB - Ensino Fundamental I (predominância)",
  "titulo": "IDEB - Ensino Fundamental I (predominância)",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2019→2021: negra -1.15%; amarela +7.69%; indigena +10.45%. Média = +5.67%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-060",
  "sub": null,
  "nome": "Taxa de Violência Sexual contra Mulheres por 100 mil hab.",
  "titulo": "Taxa de Violência Sexual contra Mulheres por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra +100.51%; amarela +94.44%; indigena +155.51%. Média = +116.82%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-061",
  "sub": null,
  "nome": "Taxas de Frequência de Lesões Ocupacionais Fatais e Não Fatais",
  "titulo": "Taxas de Frequência de Lesões Ocupacionais Fatais e Não Fatais",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "estável",
  "base": "Variações 2018→2024: negra +0.00%; amarela -16.13%; indigena +3.39%. Média = -4.25%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-062",
  "sub": null,
  "nome": "Infraestrutura Escolar - Taxa de Escolas com Banheiro Infantil",
  "titulo": "Infraestrutura Escolar - Taxa de Escolas com Banheiro Infantil",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2023: negra +40.53%; amarela +107.47%; indigena +62.39%. Média = +70.13%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-063",
  "sub": null,
  "nome": "Taxa de Escolarização no Ensino Superior",
  "titulo": "Taxa de Escolarização no Ensino Superior",
  "leitura": "maior é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2023: negra +3.73%; amarela -14.35%; indigena -32.81%. Média = -14.48%. Como maior é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-064",
  "sub": null,
  "nome": "Percentual dos Vínculos Formais Ocupados por Mulheres",
  "titulo": "Percentual dos Vínculos Formais Ocupados por Mulheres",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +10.54%; amarela +15.81%; indigena +8.05%. Média = +11.47%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-065",
  "sub": null,
  "nome": "Taxa de Violência Física contra Mulheres por 100 mil hab.",
  "titulo": "Taxa de Violência Física contra Mulheres por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra +56.02%; amarela +80.43%; indigena +62.71%. Média = +66.39%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-066",
  "sub": null,
  "nome": "Percentual de Vínculos sem Ensino Superior no Mercado Formal",
  "titulo": "Percentual de Vínculos sem Ensino Superior no Mercado Formal",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra -11.07%; amarela -13.21%; indigena -13.99%. Média = -12.76%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-067",
  "sub": null,
  "nome": "Taxa de Sucesso de Candidaturas Femininas a Parlamentos Locais",
  "titulo": "Taxa de Sucesso de Candidaturas Femininas a Parlamentos Locais",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2020→2024: negra +27.82%; amarela -39.08%; indigena +63.50%. Média = +17.41%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-068",
  "sub": null,
  "nome": "Taxa de Conclusão no Ensino Superior",
  "titulo": "Taxa de Conclusão no Ensino Superior",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra -6.37%; amarela -7.72%; indigena +26.52%. Média = +4.14%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-069",
  "sub": null,
  "nome": "Participação Relativa de Ingressantes no Ensino Superior",
  "titulo": "Participação Relativa de Ingressantes no Ensino Superior",
  "leitura": "maior é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra -1.58%; amarela -14.76%; indigena -7.64%. Média = -7.99%. Como maior é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-070",
  "sub": null,
  "nome": "IDEB - Ensino Médio (predominância)",
  "titulo": "IDEB - Ensino Médio (predominância)",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2019→2023: negra +3.53%; amarela +10.48%; indigena +12.17%. Média = +8.73%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-071",
  "sub": null,
  "nome": "Salário Médio das Mulheres em Vínculos Formais Ativos",
  "titulo": "Salário Médio das Mulheres em Vínculos Formais Ativos",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +69.65%; amarela +54.80%; indigena +62.23%. Média = +62.23%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-072",
  "sub": null,
  "nome": "Salário Médio por Hora em Vínculos Formais Ativos",
  "titulo": "Salário Médio por Hora em Vínculos Formais Ativos",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +56.50%; amarela +41.58%; indigena +42.87%. Média = +46.98%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-073",
  "sub": null,
  "nome": "Salário Médio dos Homens em Vínculos Formais Ativos",
  "titulo": "Salário Médio dos Homens em Vínculos Formais Ativos",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +55.05%; amarela +42.84%; indigena +41.29%. Média = +46.39%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-074",
  "sub": null,
  "nome": "Paridade Racial em Candidaturas Femininas aos Parlamentos Locais",
  "titulo": "Paridade Racial em Candidaturas Femininas aos Parlamentos Locais",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2020 = (0,6660 + 0,6244 + 0,6638)/3 = 0,6514; 2024 = (0,6514 + 0,5816 + 0,6564)/3 = 0,6298. Diminuiu 0,0216 → melhorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-075",
  "sub": null,
  "nome": "Salário Médio - Ensino Fundamental/Médio em Vínculos Formais",
  "titulo": "Salário Médio - Ensino Fundamental/Médio em Vínculos Formais",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +42.59%; amarela +38.86%; indigena +38.49%. Média = +39.98%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-076",
  "sub": null,
  "nome": "Salário Médio entre Estrangeiros",
  "titulo": "Salário Médio entre Estrangeiros",
  "leitura": "maior é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +15.83%; amarela -18.35%; indigena -25.47%. Média = -9.33%. Como maior é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-077",
  "sub": null,
  "nome": "Salário Médio no Setor Privado",
  "titulo": "Salário Médio no Setor Privado",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +39.16%; amarela +30.91%; indigena +26.40%. Média = +32.16%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-078",
  "sub": null,
  "nome": "Paridade Racial - Advocacia em Relação à População",
  "titulo": "Paridade Racial - Advocacia em Relação à População",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2018 = (0,7822 + 0,4820 + 0,8612)/3 = 0,7085; 2024 = (0,6287 + 1,3912 + 0,7473)/3 = 0,9224. Aumentou 0,2139 → piorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-079",
  "sub": null,
  "nome": "Percentual de Vínculos com Ensino Superior no Mercado Formal",
  "titulo": "Percentual de Vínculos com Ensino Superior no Mercado Formal",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +85.22%; amarela +31.98%; indigena +73.01%. Média = +63.40%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-080",
  "sub": null,
  "nome": "Paridade Racial - Médicos em Relação à População",
  "titulo": "Paridade Racial - Médicos em Relação à População",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2018 = (0,8284 + 0,5996 + 0,8020)/3 = 0,7433; 2024 = (0,6216 + 2,9850 + 0,7149)/3 = 1,4405. Aumentou 0,6972 → piorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-081",
  "sub": null,
  "nome": "Paridade Racial - Delegados de Polícia em Relação à População",
  "titulo": "Paridade Racial - Delegados de Polícia em Relação à População",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2023 = (0,6318 + 0,5581 + 0,8696)/3 = 0,6865; 2024 = (0,6142 + 0,4857 + 0,8845)/3 = 0,6615. Diminuiu 0,0250 → melhorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-082",
  "sub": null,
  "nome": "Percentual de Vínculos Formais em Cargos Gerenciais",
  "titulo": "Percentual de Vínculos Formais em Cargos Gerenciais",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +92.50%; amarela +78.29%; indigena +134.36%. Média = +101.72%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-083",
  "sub": null,
  "nome": "Proporção da Massa Salarial de Vínculos até 2 Salários Mínimos",
  "titulo": "Proporção da Massa Salarial de Vínculos até 2 Salários Mínimos",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra -15.20%; amarela -6.73%; indigena -6.42%. Média = -9.45%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-084",
  "sub": null,
  "nome": "Salário Médio por Vínculo Formal Ativo",
  "titulo": "Salário Médio por Vínculo Formal Ativo",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +59.15%; amarela +45.75%; indigena +48.79%. Média = +51.23%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-085",
  "sub": null,
  "nome": "Salário Médio - Ensino Superior em Vínculos Formais",
  "titulo": "Salário Médio - Ensino Superior em Vínculos Formais",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +41.11%; amarela +22.49%; indigena +17.98%. Média = +27.19%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-086",
  "sub": null,
  "nome": "Paridade Racial - Oficiais da Polícia Militar em Relação à População",
  "titulo": "Paridade Racial - Oficiais da Polícia Militar em Relação à População",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2018 = (0,9994)/1 = 0,9994; 2022 = (0,9958)/1 = 0,9958. Diminuiu 0,0036 → melhorou. Grupos: negra; branca fora da média."
 },
 {
  "codigo": "IND-087",
  "sub": null,
  "nome": "Salário Médio no Setor Público",
  "titulo": "Salário Médio no Setor Público",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +141.20%; amarela +143.46%; indigena +87.96%. Média = +124.21%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-088",
  "sub": null,
  "nome": "Salário Médio na Indústria em Vínculos Formais Ativos",
  "titulo": "Salário Médio na Indústria em Vínculos Formais Ativos",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra +36.59%; amarela +22.37%; indigena +13.34%. Média = +24.10%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-089",
  "sub": null,
  "nome": "Percentual de Vínculos com Remuneração Abaixo de ½ Mediana",
  "titulo": "Percentual de Vínculos com Remuneração Abaixo de ½ Mediana",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2024: negra -93.47%; amarela -94.75%; indigena -93.72%. Média = -93.98%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-090",
  "sub": null,
  "nome": "Paridade Racial nos Vínculos no Setor Público",
  "titulo": "Paridade Racial nos Vínculos no Setor Público",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2018 = (0,4898 + 0,1215 + 0,7667)/3 = 0,4593; 2024 = (0,3961 + 0,4050 + 0,6961)/3 = 0,4991. Aumentou 0,0397 → piorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-091",
  "sub": null,
  "nome": "Paridade Racial - Magistratura em Relação à População",
  "titulo": "Paridade Racial - Magistratura em Relação à População",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2023 = (0,7849 + 1,6706 + 0,7926)/3 = 1,0827; 2024 = (0,7790 + 1,7348 + 0,8049)/3 = 1,1062. Aumentou 0,0235 → piorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-092",
  "sub": null,
  "nome": "Paridade Racial em Assentos Locais (Vereadores) em Relação à População",
  "titulo": "Paridade Racial em Assentos Locais (Vereadores) em Relação à População",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2020 = (0,4431 + 0,3408 + 0,6439)/3 = 0,4759; 2024 = (0,4324 + 0,5350 + 0,4753)/3 = 0,4809. Aumentou 0,0050 → piorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-093",
  "sub": null,
  "nome": "Paridade Racial dos Vínculos Formais no Setor Industrial em Relação à População",
  "titulo": "Paridade Racial dos Vínculos Formais no Setor Industrial em Relação à População",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2018 = (0,5251 + 0,1490 + 0,8015)/3 = 0,4919; 2024 = (0,4250 + 0,3547 + 0,6843)/3 = 0,4880. Diminuiu 0,0039 → melhorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-094",
  "sub": null,
  "nome": "Paridade Racial em Candidaturas aos Parlamentos Locais",
  "titulo": "Paridade Racial em Candidaturas aos Parlamentos Locais",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2020 = (0,3919 + 0,4516 + 0,5562)/3 = 0,4666; 2024 = (0,3776 + 0,3782 + 0,4045)/3 = 0,3868. Diminuiu 0,0798 → melhorou. Grupos: negra, amarela, indigena; branca fora da média."
 },
 {
  "codigo": "IND-095",
  "sub": null,
  "nome": "Taxa de Violência Física por 100 mil hab.",
  "titulo": "Taxa de Violência Física por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra +61.58%; amarela +89.26%; indigena +57.57%. Média = +69.47%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-096",
  "sub": null,
  "nome": "Taxa de Mortalidade por Agressão por 100 mil hab.",
  "titulo": "Taxa de Mortalidade por Agressão por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2022: negra -18.07%; amarela +4.64%; indigena -13.13%. Média = -8.85%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-097",
  "sub": null,
  "nome": "Taxa de Violência Sexual por 100 mil hab.",
  "titulo": "Taxa de Violência Sexual por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra +98.09%; amarela +108.86%; indigena +152.74%. Média = +119.89%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-098",
  "sub": null,
  "nome": "Taxa de Sucesso em Eleições Locais",
  "titulo": "Taxa de Sucesso em Eleições Locais",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2020→2024: negra +18.70%; amarela -25.87%; indigena +30.86%. Média = +7.90%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-099",
  "sub": null,
  "nome": "Taxa de Mortalidade por Causas Externas por 100 mil hab.",
  "titulo": "Taxa de Mortalidade por Causas Externas por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2022: negra -0.58%; amarela +17.55%; indigena +12.46%. Média = +9.81%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-100",
  "sub": null,
  "nome": "Taxa de Violência Psicológica por 100 mil hab.",
  "titulo": "Taxa de Violência Psicológica por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra +66.87%; amarela +118.90%; indigena +72.16%. Média = +85.98%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-101",
  "sub": null,
  "nome": "Taxa de Violência Sexual contra Menores por 100 mil hab.",
  "titulo": "Taxa de Violência Sexual contra Menores por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra +94.58%; amarela +96.86%; indigena +163.93%. Média = +118.46%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-102",
  "sub": null,
  "nome": "Taxa de Homicídios por 100 mil hab.",
  "titulo": "Taxa de Homicídios por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2022: negra -17.26%; amarela -0.02%; indigena -12.70%. Média = -9.99%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-103",
  "sub": null,
  "nome": "Taxa de Homicídios de Mulheres por 100 mil hab.",
  "titulo": "Taxa de Homicídios de Mulheres por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2022: negra -15.90%; amarela +24.92%; indigena +2.21%. Média = +3.74%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-104",
  "sub": null,
  "nome": "Taxa de Mortalidade por Acidentes de Transporte Terrestre por 100 mil hab.",
  "titulo": "Taxa de Mortalidade por Acidentes de Transporte Terrestre por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +10.45%; amarela +2.20%; indigena +69.92%. Média = +27.52%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-105",
  "sub": null,
  "nome": "Taxa de Mortalidade Atribuída à Poluição do Ar por 100 mil hab.",
  "titulo": "Taxa de Mortalidade Atribuída à Poluição do Ar por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +15.87%; amarela +9.52%; indigena +23.92%. Média = +16.44%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-106",
  "sub": null,
  "nome": "Taxa de Violência Física contra Menores por 100 mil hab.",
  "titulo": "Taxa de Violência Física contra Menores por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2023: negra +29.74%; amarela +46.19%; indigena +31.56%. Média = +35.83%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-107",
  "sub": null,
  "nome": "Taxa de Óbitos por Arma de Fogo por 100 mil hab.",
  "titulo": "Taxa de Óbitos por Arma de Fogo por 100 mil hab.",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Variações 2018→2022: negra -19.33%; amarela +0.63%; indigena +26.01%. Média = +2.44%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-124",
  "sub": null,
  "nome": "Analfabetismo geral — 2024",
  "titulo": "Analfabetismo geral — 2024",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série do grupo-alvo: 8,40 (2018) → 6,90 (2024) = -17.86%. Como menor é melhor → melhorou."
 },
 {
  "codigo": "IND-108",
  "sub": null,
  "nome": "Evolução composição racial (2018-2024)",
  "titulo": "Evolução composição racial (2018-2024)",
  "leitura": "sem polaridade",
  "tendencia": "estável",
  "anterior": "estável",
  "base": "Sem polaridade: leitura apenas descritiva. Por regra da base, K = estável."
 },
 {
  "codigo": "IND-127",
  "sub": null,
  "nome": "Déficit habitacional por raça (2018-2022)",
  "titulo": "Déficit habitacional por raça (2018-2022)",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações 2018→2022: negra +2.40%. Média = +2.40%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-131",
  "sub": null,
  "nome": "Evasão escolar por raça (2018-2024)",
  "titulo": "Evasão escolar por raça (2018-2024)",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Série do grupo-alvo: 70,80 (2018) → 72,20 (2024) = +1.98%. Como menor é melhor → piorou."
 },
 {
  "codigo": "IND-204",
  "sub": null,
  "nome": "Trabalho infantil por raça/cor",
  "titulo": "Trabalho infantil por raça/cor",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Série do grupo-alvo: 64,10 (2016) → 66,00 (2024) = +2.96%. Como menor é melhor → piorou."
 },
 {
  "codigo": "IND-199",
  "sub": null,
  "nome": "Óbitos por causas evitáveis por raça/cor",
  "titulo": "Óbitos por causas evitáveis por raça/cor",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações: negra +18.40%; indígena +33.91%. Média = +26.16%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-188",
  "sub": null,
  "nome": "Denúncias e violações contra povos tradicionais — Disque 100",
  "titulo": "Denúncias e violações contra povos tradicionais — Disque 100",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série total: 825,00 (2020) → 290,00 (2025) = -64.85%. Como menor é melhor → melhorou."
 },
 {
  "codigo": "IND-203",
  "sub": null,
  "nome": "Denúncias por discriminação, injúria racial e étnica e racismo",
  "titulo": "Denúncias por discriminação, injúria racial e étnica e racismo",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Série total: 3.535 (2022) → 16.245 (2025) = +359.55%. Como menor é melhor → piorou."
 },
 {
  "codigo": "IND-186",
  "sub": null,
  "nome": "Distorção idade-série por raça (Fundamental e Médio)",
  "titulo": "Distorção idade-série por raça (Fundamental e Médio)",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações por dimensão: médio-negros -42.39%; médio-indígenas -25.00%; fundamental-negros -43.92%; fundamental-indígenas -43.50%. Média = -38.70%. Como menor é melhor → melhorou."
 },
 {
  "codigo": "IND-194",
  "sub": null,
  "nome": "Mortalidade infantil indígena — razão vs. não-indígena",
  "titulo": "Mortalidade infantil indígena — razão vs. não-indígena",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série do grupo-alvo: 26,35 (2018) → 24,43 (2024) = -7.29%. Como menor é melhor → melhorou."
 },
 {
  "codigo": "IND-202",
  "sub": null,
  "nome": "Candidatos por raça/cor — Eleições",
  "titulo": "Candidatos por raça/cor — Eleições",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série do grupo-alvo: 46,00 (2018) → 52,00 (2024) = +13.04%. Como maior é melhor → melhorou."
 },
 {
  "codigo": "IND-193",
  "sub": null,
  "nome": "Eleitos por raça/cor — Câmara, Senado, Prefeituras, Câmaras Municipais",
  "titulo": "Eleitos por raça/cor — Câmara, Senado, Prefeituras, Câmaras Municipais",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações por dimensão: deputados negros +50.50%; prefeitos negros +4.39%. Média = +27.44%. Como maior é melhor → melhorou."
 },
 {
  "codigo": "IND-181",
  "sub": null,
  "nome": "Processos judiciais — racismo e injúria racial (CNJ)",
  "titulo": "Processos judiciais — racismo e injúria racial (CNJ)",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Série total: 50,00 (2020) → 4.633 (2025) = +9166.00%. Como menor é melhor → piorou."
 },
 {
  "codigo": "IND-192",
  "sub": null,
  "nome": "Denúncias de intolerância religiosa (Disque 100)",
  "titulo": "Denúncias de intolerância religiosa (Disque 100)",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Série total: 566,00 (2020) → 2.723 (2025) = +381.10%. Como menor é melhor → piorou."
 },
 {
  "codigo": "IND-198",
  "sub": null,
  "nome": "Déficit habitacional por raça/cor",
  "titulo": "Déficit habitacional por raça/cor",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Variações: parda -17.54%; preta +28.90%. Média = +5.68%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-185",
  "sub": null,
  "nome": "Mães que tiveram acesso ao pré-natal por raça/cor",
  "titulo": "Mães que tiveram acesso ao pré-natal por raça/cor",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "piorou",
  "base": "Variações: negra -1.32%; indígena +59.63%. Média = +29.16%. Como maior é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-119",
  "sub": "renda média mensal",
  "nome": "Indicadores socioeconômicos por raça (2018-2024)",
  "titulo": "Renda Média Mensal (R$)",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série do grupo-alvo: 1.608 (2018) → 2.643 (2025) = +64.37%. Como maior é melhor → melhorou."
 },
 {
  "codigo": "IND-119",
  "sub": "taxa de desocupação",
  "nome": "Indicadores socioeconômicos por raça (2018-2024)",
  "titulo": "Taxa de Desemprego (%)",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série do grupo-alvo: 13,80 (2018) → 6,74 (2025) = -51.16%. Como menor é melhor → melhorou."
 },
 {
  "codigo": "IND-119",
  "sub": "taxa de pobreza",
  "nome": "Indicadores socioeconômicos por raça (2018-2024)",
  "titulo": "Taxa de Pobreza: Negros × Brancos (%)",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série do grupo-alvo: 42,30 (2018) → 29,00 (2024) = -31.44%. Como menor é melhor → melhorou."
 },
 {
  "codigo": "IND-117",
  "sub": "taxa de homicídio",
  "nome": "Segurança pública — homicídio por raça (2018-2024)",
  "titulo": "Taxa de Homicídio (por 100 mil)",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série do grupo-alvo: 37,60 (2018) → 28,90 (2023) = -23.14%. Como menor é melhor → melhorou."
 },
 {
  "codigo": "IND-117",
  "sub": "letalidade policial",
  "nome": "Segurança pública — homicídio por raça (2018-2024)",
  "titulo": "Letalidade Policial - % de Negros entre Vítimas",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Série do grupo-alvo: 75,40 (2018) → 82,00 (2024) = +8.75%. Como menor é melhor → piorou."
 },
 {
  "codigo": "IND-129",
  "sub": "ensino superior completo",
  "nome": "Educação — série histórica por raça (2018-2024)",
  "titulo": "Ensino Superior Completo (%)",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série do grupo-alvo: 8,10 (2018) → 11,40 (2024) = +40.74%. Como maior é melhor → melhorou."
 },
 {
  "codigo": "IND-129",
  "sub": "taxa de analfabetismo",
  "nome": "Educação — série histórica por raça (2018-2024)",
  "titulo": "Taxa de Analfabetismo (%)",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série do grupo-alvo: 8,40 (2018) → 6,90 (2024) = -17.86%. Como menor é melhor → melhorou."
 },
 {
  "codigo": "IND-122",
  "sub": "mortalidade materna",
  "nome": "Saúde — mortalidade materna e infantil por raça (2018-2024)",
  "titulo": "Mortalidade Materna (por 100 mil NV)",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série do grupo-alvo: 60,10 (2018) → 55,50 (2024) = -7.65%. Como menor é melhor → melhorou."
 },
 {
  "codigo": "IND-122",
  "sub": "mortalidade infantil",
  "nome": "Saúde — mortalidade materna e infantil por raça (2018-2024)",
  "titulo": "Mortalidade Infantil (por mil nascidos vivos)",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Série do grupo-alvo: 10,20 (2018) → 10,60 (2024) = +3.92%. Como menor é melhor → piorou."
 },
 {
  "codigo": "IND-161",
  "sub": "razões de desigualdade racial",
  "nome": "Evolução das desigualdades raciais (2018-2024)",
  "titulo": "Evolução das Razões de Desigualdade Racial (2018-2024)",
  "leitura": "mais próximo de 1 (100% de paridade) é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Distância média ao alvo 1: 2018 = (0,73 + 1,60 + 0,72)/3 = 1,02; 2024 = (0,68 + 1,70 + 0,45)/3 = 0,94. Diminuiu 0,07 → melhorou."
 },
 {
  "codigo": "IND-125",
  "sub": "perfil racial",
  "nome": "CadÚnico — perfil racial beneficiários (2018-2025)",
  "titulo": "Perfil Racial dos Beneficiários do CadÚnico",
  "leitura": "sem polaridade",
  "tendencia": "estável",
  "anterior": "estável",
  "base": "Sem polaridade: leitura apenas descritiva. Por regra da base, K = estável."
 },
 {
  "codigo": "IND-120",
  "sub": "assassinatos trans e travestis",
  "nome": "Violência contra pessoas trans — série ANTRA (2017-2025)",
  "titulo": "Assassinatos de Pessoas Trans e Travestis por Raça — 2017-2025 (%)",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "melhorou",
  "base": "Variações 2017→2025: negra -12.50%; indigena +200.00%. Média = +93.75%. Como menor é melhor → piorou. Branca fora da média."
 },
 {
  "codigo": "IND-173",
  "sub": "mortalidade materna",
  "nome": "Mortalidade materna COVID por raça (2019-2022)",
  "titulo": "Mortalidade Materna na Pandemia por Raça",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2019→2022: preta -2.41%; parda -2.54%. Média = -2.47%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-117",
  "sub": "vítimas negras de homicídio",
  "nome": "Segurança pública — homicídio por raça (2018-2024)",
  "titulo": "Vítimas negras de homicídio (%)",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Série do grupo-alvo: 75,70 (2018) → 77,00 (2024) = +1.72%. Como menor é melhor → piorou."
 },
 {
  "codigo": "IND-197",
  "sub": "população carcerária negra",
  "nome": "População carcerária por raça/cor",
  "titulo": "População carcerária negra (%)",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Série do grupo-alvo: 66,00 (2018) → 68,70 (2024) = +4.09%. Como menor é melhor → piorou."
 },
 {
  "codigo": "IND-112",
  "sub": "feminicídio mulheres negras",
  "nome": "Feminicídio — série histórica (2018-2024)",
  "titulo": "Feminicídio mulheres negras (%)",
  "leitura": "menor é melhor",
  "tendencia": "piorou",
  "anterior": "piorou",
  "base": "Série do grupo-alvo: 61,00 (2018) → 63,60 (2024) = +4.26%. Como menor é melhor → piorou."
 },
 {
  "codigo": "IND-162",
  "sub": "territórios titulados",
  "nome": "Terras quilombolas — série histórica (2018-2025)",
  "titulo": "Territórios Titulados",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série específica: 174,00 (2018) → 245,00 (2025) = +40.80%. Maior é melhor → melhorou."
 },
 {
  "codigo": "IND-162",
  "sub": "territórios em processo",
  "nome": "Terras quilombolas — série histórica (2018-2025)",
  "titulo": "Territórios em Processo (INCRA)",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Valores exibidos: 6,90 (2018) → 7,80 (2025) = +13.04%. Maior é melhor → melhorou."
 },
 {
  "codigo": "IND-162",
  "sub": "certidões fcp",
  "nome": "Terras quilombolas — série histórica (2018-2025)",
  "titulo": "Certidões FCP (Palmares)",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série específica: 2.523 (2018) → 3.158 (2025) = +25.17%. Maior é melhor → melhorou."
 },
 {
  "codigo": "IND-162",
  "sub": "área titulada",
  "nome": "Terras quilombolas — série histórica (2018-2025)",
  "titulo": "Área Titulada (hectares)",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Valores exibidos: 174,00 (2018) → 245,00 (2025) = +40.80%. Maior é melhor → melhorou."
 },
 {
  "codigo": "IND-162",
  "sub": "evolução territorial quilombola",
  "nome": "Terras quilombolas — série histórica (2018-2025)",
  "titulo": "Evolução Territorial Quilombola 2018→2025",
  "leitura": "maior é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações por dimensão: taxa +13.04%; tituladas +40.80%; certificadas +25.17%. Média = +26.34%. Como maior é melhor → melhorou."
 },
 {
  "codigo": "IND-173",
  "sub": "rmm mães pretas",
  "nome": "Mortalidade materna COVID por raça (2019-2022)",
  "titulo": "RMM Mães Pretas (pico 2021)",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Variações 2019→2022: preta -2.41%; parda -2.54%. Média = -2.47%. Como menor é melhor → melhorou. Branca fora da média."
 },
 {
  "codigo": "IND-120",
  "sub": "série anual antra",
  "nome": "Violência contra pessoas trans — série ANTRA (2017-2025)",
  "titulo": "Dados Anuais — Assassinatos de Pessoas Trans e Travestis",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série total: 181,00 (2017) → 80,00 (2025) = -55.80%. Como menor é melhor → melhorou."
 },
 {
  "codigo": "IND-120",
  "sub": "tendência da série antra",
  "nome": "Violência contra pessoas trans — série ANTRA (2017-2025)",
  "titulo": "Tendência da série ANTRA 2017→2025",
  "leitura": "menor é melhor",
  "tendencia": "melhorou",
  "anterior": "melhorou",
  "base": "Série total: 181,00 (2017) → 80,00 (2025) = -55.80%. Como menor é melhor → melhorou."
 }
];

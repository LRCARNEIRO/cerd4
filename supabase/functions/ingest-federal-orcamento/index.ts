import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ================================================================
 * METODOLOGIA DE INGESTÃO ORÇAMENTÁRIA FEDERAL — POLÍTICAS RACIAIS
 * ================================================================
 * 
 * OBJETIVO: Coletar dados de execução orçamentária federal (2018–2025) de
 * programas e ações voltados a políticas raciais, indígenas, quilombolas e ciganas.
 * 
 * FONTE: API do Portal da Transparência (api.portaldatransparencia.gov.br)
 * ENDPOINT: despesas/por-funcional-programatica
 * 
 * ESTRATÉGIA DE FILTRO (4 camadas independentes, depois deduplicadas):
 * 
 * CAMADA 1 — PROGRAMAS TEMÁTICOS DO PPA
 *   Códigos de programa finalísticos, com transição entre PPAs:
 *   - Política Racial: 2034 (SEPPIR, PPA 2016-2019) → 5034 (MDHC guarda-chuva, PPA 2020-2023)
 *     → 5804 (MIR, PPA 2024+). O 5034 exige filtragem por palavras-chave raciais para
 *     excluir ações genéricas do MDHC.
 *   - Povos Indígenas: 2065 (PPA 2012-2019) → 0617 (PPA 2020-2023) → 5136 (PPA 2024-2027).
 *     Auditoria confirmou que 2065 não retorna dados após 2019; 0617 é o substituto exato.
 *   - Novos programas MIR (PPA 2024+): 5802 (Quilombolas/Ciganos), 5803 (Juventude Negra).
 *   - 0153: Criança e Adolescente (MDHC, desde 2004).
 * 
 * CAMADA 2 — SUBFUNÇÃO 422 (Direitos Individuais, Coletivos e Difusos)
 *   Captura ações não vinculadas aos programas acima, validadas por palavras-chave
 *   raciais/étnicas.
 * 
 * CAMADA 3 — ÓRGÃOS COM MANDATO DIRETO
 *   Despesas dos órgãos superiores:
 *   - 67000: Ministério da Igualdade Racial (MIR, criado em jan/2023)
 *   - 92000: Ministério dos Povos Indígenas (MPI, criado em jan/2023)
 *   Captura toda despesa desses órgãos, deduplicada contra camadas anteriores.
 * 
 * CAMADA 4 — AÇÕES ESPECÍFICAS SESAI (Saúde Indígena)
 *   Consulta direta por código de ação: 20YP (Saúde Indígena) e 7684 (Saneamento em Aldeias).
 *   Necessária porque a SESAI migrou do programa indígena (2065) para o programa de
 *   saúde (5022) no PPA 2020-2023, ficando fora das Camadas 1-3. Os dados SESAI são
 *   incluídos nos totais de política racial federal.
 * 
 * TRANSIÇÃO DE CÓDIGOS — PPA A PPA:
 *   - Povos Indígenas: 2065 (PPA 2012-2019) → 0617 (PPA 2020-2023) → 5136 (PPA 2024-2027)
 *   - SESAI: Ações 20YP/7684 sob programa 2065 (2018-2019) → programa 5022 (2020-2023)
 *     → programa 5136 (2024+). Camada 4 resolve capturando por código de ação.
 *   - Política Racial: 2034 (SEPPIR) → 5034 (MDHC) → 5804 (MIR)
 * 
 * PADRÃO DA SÉRIE (2018-2025):
 *   2018-2019: Base modesta sob SEPPIR/MMFDH. SESAI: ~R$ 1,37-1,47 bi. FUNAI: ~R$ 30-38 mi.
 *   2020-2023: Programa 0617 (Povos Indígenas). SESAI via Camada 4 (programa 5022).
 *   2021-2022: Queda real de dotação — desmonte institucional da pauta racial.
 *   2023: Salto com criação do MIR e reconstrução da pauta racial.
 *   2024-2025: Novos programas focalizados: 5802, 5803, 5804, 5136.
 * 
 * TRATAMENTO DE DISTORÇÕES:
 *   - Bypass Temporal MIR pré-2023: API retroativamente rotula MDHC como MIR (67000).
 *     Para anos < 2023, ações genéricas do MDHC são excluídas; demais exigem keywords raciais.
 *   - Programa 5034: Guarda-chuva MDHC, filtrado por palavras-chave raciais.
 *   - Programas Transversais: Bolsa Família, MCMV, SUS, SUAS, Fundo Eleitoral excluídos.
 *   - Programa 5113 (Educação Superior): Excluído por ser genérico (R$ 14 bi).
 * 
 * COMPLEMENTAÇÃO DE DOTAÇÃO (via Edge Function ingest-dotacao-loa):
 *   A API REST não fornece Dotação Inicial (LOA). Os valores são obtidos dos arquivos
 *   ZIP/CSV do Portal de Dados Abertos, matching por chave composta Código Programa | Código Ação.
 * 
 * CAMPOS COLETADOS:
 *   programa (código + nome), ação (código + nome), dotação inicial/autorizada,
 *   empenhado, liquidado, pago, percentual de execução, órgão (resolvido por mapeamento).
 * ================================================================
 */

// ===== CAMADA 1: Programas temáticos do PPA =====
// Inclui programas historicamente mapeados E programas das Agendas Transversais
// do PPA 2024-2027 (Igualdade Racial e Povos Indígenas). Programas universais
// (Bolsa Família, MCMV, etc.) exigem validação por keywords; programas focais
// do MIR/MPI/SESAI são incluídos integralmente.
const PROGRAMAS_TEMATICOS = [
  // === Programas historicamente mapeados (metodologia original) ===
  // 5034 existia desde 2020 como guarda-chuva MDHC. Orgao fallback = "MDHC" para evitar
  // que a API retroativamente rotule como MIR. O buildRecord aplica bypass temporal.
  { codigo: "5034", nome: "Igualdade Racial e Superação do Racismo", orgao: "MDHC", desde: 2020 },
  { codigo: "5802", nome: "Direitos dos Povos Quilombolas e Ciganos", orgao: "MIR", desde: 2024 },
  { codigo: "5803", nome: "Juventude Negra Viva", orgao: "MIR", desde: 2024 },
  { codigo: "5804", nome: "Igualdade Étnico-Racial e Superação do Racismo", orgao: "MIR", desde: 2024 },
  // 5136: Programa de Povos Indígenas no PPA 2024-2027 (substitui 0617 a partir de 2024)
  { codigo: "5136", nome: "Proteção e Promoção dos Direitos dos Povos Indígenas", orgao: "MPI", desde: 2024 },
  // 0617: Programa de Povos Indígenas no PPA 2020-2023 (substitui 2065)
  { codigo: "0617", nome: "Proteção e Promoção dos Direitos dos Povos Indígenas", orgao: "MPI", desde: 2020 },
  // 2065: Programa histórico de Povos Indígenas (PPA 2012-2019)
  { codigo: "2065", nome: "Proteção e Promoção dos Direitos dos Povos Indígenas", orgao: "MPI", desde: 2012 },
  { codigo: "0153", nome: "Promoção e Defesa dos Direitos da Criança e do Adolescente", orgao: "MDHC", desde: 2004 },
  { codigo: "2034", nome: "Promoção da Igualdade Racial e Superação do Racismo (PPA 2016-2019)", orgao: "SEPPIR", desde: 2016 },

  // === Programas das Agendas Transversais PPA 2024-2027 (descobertos pela TESTE) ===
  // Estes programas constam oficialmente nas Agendas "Igualdade Racial" e/ou "Povos Indígenas"
  // do Espelho do Monitoramento do PPA. Suas ações passam pelo filtro de keywords para
  // garantir que apenas ações com recorte racial/étnico explícito sejam incluídas.
  { codigo: "1617", nome: "Demarcação e Gestão dos Territórios Indígenas", orgao: "MPI", desde: 2024 },
  { codigo: "1189", nome: "Bioeconomia para um Novo Ciclo de Prosperidade", orgao: "MMA", desde: 2024 },
  { codigo: "2224", nome: "Planejamento e Orçamento para o Desenvolvimento Sustentável e Inclusivo", orgao: "MPO", desde: 2024 },
  { codigo: "2301", nome: "Transformação do Estado para a Cidadania e o Desenvolvimento", orgao: "MGI", desde: 2024 },
  { codigo: "2304", nome: "Ciência, Tecnologia e Inovação para o Desenvolvimento Social", orgao: "MCTI", desde: 2024 },
  { codigo: "2308", nome: "Consolidação do SNCTI", orgao: "MCTI", desde: 2024 },
  { codigo: "2310", nome: "Promoção do Trabalho Decente, Emprego e Renda", orgao: "MTE", desde: 2024 },
  { codigo: "2316", nome: "Relações Internacionais e Assistência a Brasileiros no Exterior", orgao: "MRE", desde: 2024 },
  { codigo: "5111", nome: "Educação Básica Democrática, com Qualidade e Equidade", orgao: "MEC", desde: 2024 },
  { codigo: "5121", nome: "Gestão, Trabalho, Educação e Transformação Digital na Saúde", orgao: "MS", desde: 2024 },
  { codigo: "5123", nome: "Vigilância em Saúde e Ambiente", orgao: "MS", desde: 2024 },
  { codigo: "5126", nome: "Esporte para a Vida", orgao: "ME", desde: 2024 },
  { codigo: "5128", nome: "Bolsa Família", orgao: "MDS", desde: 2024 },
  { codigo: "5129", nome: "Inclusão de Famílias em Situação de Vulnerabilidade no Cadastro Único", orgao: "MDS", desde: 2024 },
];

// ===== CAMADA 2: Subfunção 422 =====
const SUBFUNCAO_DIREITOS = "422";

// ===== CAMADA 3: Órgãos com mandato direto =====
const ORGAOS_MANDATO = [
  { codigo: "67000", sigla: "MIR" },
  { codigo: "92000", sigla: "MPI" },
];

// ===== CAMADA 4: Ações específicas de saúde indígena (SESAI) =====
// SESAI é órgão do MS (36000) e em PPA 2020-2023 suas ações migraram do programa 2065
// para programas de saúde. Consultar por ação diretamente garante cobertura.
const ACOES_ESPECIFICAS_INDIGENAS = [
  { codigo: "20YP", nome: "Promoção, Proteção e Recuperação da Saúde Indígena", orgao: "SESAI" },
  { codigo: "7684", nome: "Saneamento Básico em Aldeias Indígenas", orgao: "SESAI" },
];

// ===== Filtro de relevância pós-coleta =====
const KEYWORDS_RELEVANCIA = [
  "racial", "racismo", "indígen", "indigen", "quilombol", "cigan", "romani",
  "afro", "palmares", "igualdade racial", "funai", "sesai", "etnia", "étnic",
  "povos tradicionais", "comunidades tradicionais", "terreiro", "matriz africana",
  "discriminaç", "preconceito racial", "capoeira", "cultura negra", "negro",
  "povo de santo", "candomblé", "umbanda", "juventude negra",
];

// Programas transversais a excluir (falsos positivos)
const PROGRAMAS_EXCLUIDOS = [
  "2068", // Bolsa Família / Cadastro Único
  "2049", // Moradia Digna / MCMV
  "2012", // Fortalecimento SUS
  "2015", // Fortalecimento SUAS
  "6012", // Fundo Eleitoral
  "5029", // Fundo Amazônia
];

// Mapeamento de órgão superior para sigla
const SIGLA_MAP: Record<string, string> = {
  "67000": "MIR", "92000": "MPI", "26000": "MEC", "36000": "MS",
  "55000": "MDS", "30000": "MJSP", "44000": "MDHC", "47000": "MDHC",
  "37000": "FUNAI/MJ", "22000": "INCRA", "36901": "SESAI",
  "20000": "Presidência", "52000": "MDIC", "54000": "MTE",
};

// Mapeamento de ações específicas para órgão executor
const ACAO_ORGAO_MAP: Record<string, string> = {
  "20YP": "SESAI", "7684": "SESAI", "20UF": "FUNAI", "2384": "FUNAI",
  "215O": "FUNAI", "215Q": "FUNAI", "8635": "FUNAI", "15Q1": "INCRA",
  "214V": "FUNAI", "20G7": "INCRA", "0859": "INCRA", "21CS": "MIR",
};

// Ações da SESAI — classificadas como "Saúde Indígena" (incluídas nos totais federais)
const ACOES_SESAI = ["20YP", "7684"];

// Ações genéricas do MDHC pré-2023 que a API retroativamente rotula como MIR
// Estas NÃO são políticas raciais e devem ser excluídas
const ACOES_GENERICAS_MDHC = [
  "0E85", // Tecnologia Assistiva (PcD)
  "14XS", // Casa da Mulher Brasileira
  "00SN", // Casa da Mulher / Centros de Referência
  "21AR", // Promoção e Defesa de Direitos Humanos (genérico)
  "21AS", // Fortalecimento da Família
  "21AT", // Conselhos e Comissões de Direitos Humanos
  "21AU", // SINDH - Sistema Nacional de Direitos Humanos
];

// Palavras-chave raciais/étnicas para bypass temporal MIR pré-2023
const KEYWORDS_RACIAIS_BYPASS = [
  "racial", "racismo", "negro", "negra", "quilombol", "cigan", "romani",
  "afro", "palmares", "étnic", "etnic", "igualdade racial", "capoeira",
  "terreiro", "matriz africana", "candomblé", "umbanda", "juventude negra",
  "discriminaç", "preconceito racial",
];

function classificarGrupoFocal(item: any, orgao: string): string | null {
  const codAcao = item.codigoAcao || "";
  const texto = [item.programa, item.nomePrograma, item.acao, item.nomeAcao].filter(Boolean).join(" ").toLowerCase();

  // SESAI = Saúde Indígena (segregado)
  if (ACOES_SESAI.includes(codAcao) || orgao === "SESAI") return "saude_indigena";
  if (orgao === "FUNAI" || orgao === "MPI" || texto.includes("indígen") || texto.includes("indigen")) return "indigenas";
  if (codAcao === "20G7" || codAcao === "0859" || texto.includes("quilombol")) return "quilombolas";
  if (texto.includes("cigan") || texto.includes("romani")) return "ciganos";
  if (texto.includes("juventude negra")) return "juventude_negra";
  if (orgao === "MIR" || orgao === "SEPPIR" || texto.includes("racial") || texto.includes("racismo") || texto.includes("negro") || texto.includes("afro")) return "negros";
  return null;
}

function classificarEixoTematico(grupo: string | null): string | null {
  if (!grupo) return null;
  if (grupo === "saude_indigena") return "saude";
  if (grupo === "indigenas") return "terra_territorio";
  if (grupo === "quilombolas") return "terra_territorio";
  return "politicas_institucionais";
}

const API_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";

function parseBRL(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val || null;
  const s = String(val).trim();
  if (!s || s === "0" || s === "0,00") return null;
  const num = Number(s.replace(/\./g, "").replace(",", "."));
  return isNaN(num) || num === 0 ? null : num;
}

function resolveOrgao(item: any, fallback: string): string {
  const codAcao = item.codigoAcao || "";
  if (codAcao && ACAO_ORGAO_MAP[codAcao]) return ACAO_ORGAO_MAP[codAcao];
  const codOrg = item.codigoOrgaoSuperior || item.codigoOrgao || "";
  if (codOrg && SIGLA_MAP[codOrg]) return SIGLA_MAP[codOrg];
  return fallback;
}

function isRelevant(item: any): boolean {
  const codProg = item.codigoPrograma || "";
  if (PROGRAMAS_EXCLUIDOS.includes(codProg)) return false;

  // Items from Camada 1 (programa temático) are always relevant
  if (PROGRAMAS_TEMATICOS.some(p => p.codigo === codProg)) return true;

  // For Camada 2/3 results, check keywords
  const text = [
    item.programa, item.nomePrograma, item.acao, item.nomeAcao,
    item.nomeOrgaoSuperior, item.nomeFuncao, item.nomeSubfuncao,
  ].filter(Boolean).join(" ").toLowerCase();

  return KEYWORDS_RELEVANCIA.some(kw => text.includes(kw));
}

function resolveDescritivo(item: any): string | null {
  const nomeAcao = item.acao || item.nomeAcao || "";
  const nomeProg = item.programa || item.nomePrograma || "";
  // Prefer action name as it's more specific
  return nomeAcao || nomeProg || null;
}

/** publico_alvo is NOT available from the API — set to null.
 *  The PPA defines público-alvo at program level only (generic), not per action.
 *  All filtering must use real API fields: programa, ação (descritivo), orgão. */
function resolvePublicoAlvo(_grupoFocal: string | null, _item: any): null {
  return null;
}

function resolveRazaoSelecao(item: any, camada: string, orgao: string): string {
  const codProg = item.codigoPrograma || "";
  const codAcao = item.codigoAcao || "";
  const subfuncao = item.codigoSubfuncao || item.subfuncao || "";
  const parts: string[] = [];

  // Identify the layer
  if (camada.includes("Programa Temático")) {
    const prog = PROGRAMAS_TEMATICOS.find(p => p.codigo === codProg);
    parts.push(`Camada PPA: Programa ${codProg}${prog ? ` (${prog.nome})` : ""}`);
  } else if (camada.includes("Subfunção")) {
    parts.push(`Subfunção 422 (Direitos Individuais, Coletivos e Difusos)`);
  } else if (camada.includes("Órgão")) {
    parts.push(`Órgão com mandato direto: ${orgao}`);
  }

  // Keywords that matched
  const text = [item.programa, item.nomePrograma, item.acao, item.nomeAcao].filter(Boolean).join(" ").toLowerCase();
  const matched = KEYWORDS_RELEVANCIA.filter(kw => text.includes(kw));
  if (matched.length > 0) parts.push(`Palavras-chave: ${matched.slice(0, 3).join(", ")}`);

  // Action-specific mapping
  if (codAcao && ACAO_ORGAO_MAP[codAcao]) parts.push(`Ação finalística ${codAcao} → ${ACAO_ORGAO_MAP[codAcao]}`);

  return parts.join(" | ") || `Camada: ${camada}`;
}

function buildRecord(item: any, fallbackOrgao: string, ano: number, camada: string) {
  const codProg = item.codigoPrograma || "";
  const nomeProg = item.programa || item.nomePrograma || "";
  const codAcao = item.codigoAcao || "";
  const nomeAcao = item.acao || item.nomeAcao || "";

  if (!codProg && !nomeProg) return null;

  const orgao = resolveOrgao(item, fallbackOrgao);

  // ===== BYPASS TEMPORAL MIR PRÉ-2023 =====
  // A API retroativamente rotula registros do antigo MDHC como MIR (órgão 67000).
  // Para anos < 2023 (quando o MIR ainda não existia), só incluir se:
  // 1. A ação NÃO é genérica do MDHC, E
  // 2. O programa/ação contém palavras-chave raciais/étnicas
  // Exceção: SEPPIR é sempre incluída
  if (orgao === "MIR" && ano < 2023) {
    // Ações genéricas do MDHC → excluir sempre
    if (ACOES_GENERICAS_MDHC.includes(codAcao)) {
      console.log(`  BYPASS: excluindo ${codAcao} (${nomeAcao.substring(0, 40)}) ${ano} — ação genérica MDHC`);
      return null;
    }
    // Para demais ações, exigir palavras-chave raciais no programa/ação (NÃO em publico_alvo/observacoes)
    const textoFiltro = [nomeProg, nomeAcao, codProg, codAcao].filter(Boolean).join(" ").toLowerCase();
    const temKeywordRacial = KEYWORDS_RACIAIS_BYPASS.some(kw => textoFiltro.includes(kw));
    if (!temKeywordRacial) {
      console.log(`  BYPASS: excluindo ${codAcao} (${nomeAcao.substring(0, 40)}) ${ano} — sem keyword racial`);
      return null;
    }
    // Ação passou no filtro racial mas o MIR não existia → reclassificar como MDHC
    // (preserva a ação para análise histórica, mas com orgao correto)
    console.log(`  BYPASS: reclassificando ${codAcao} ${ano} de MIR → MDHC (MIR não existia)`);
    // Override orgao below when building record
  }

  let programa = codProg ? `${codProg} – ${nomeProg}` : nomeProg;
  if (codAcao) programa += ` / ${codAcao} – ${nomeAcao}`;

  const dotacaoInicial = parseBRL(item.dotacaoInicial || item.valorDotacaoInicial);
  const dotacaoAutorizada = parseBRL(item.dotacaoAtualizada || item.valorDotacaoAtualizada);
  const empenhado = parseBRL(item.empenhado || item.valorEmpenhado);
  const liquidado = parseBRL(item.liquidado || item.valorLiquidado);
  const pago = parseBRL(item.pago || item.valorPago);

  if (!dotacaoInicial && !dotacaoAutorizada && !empenhado && !liquidado && !pago) return null;

  // Corrigir orgao: MIR pré-2023 → MDHC (MIR só foi criado em jan/2023)
  const orgaoFinal = (orgao === "MIR" && ano < 2023) ? "MDHC" : orgao;

  const grupoFocal = classificarGrupoFocal(item, orgaoFinal);
  const eixoTematico = classificarEixoTematico(grupoFocal);
  const dotacaoRef = dotacaoAutorizada || dotacaoInicial;
  const percentual = dotacaoRef && pago ? Math.round((pago / dotacaoRef) * 10000) / 100 : null;

  return {
    programa: programa.substring(0, 250),
    orgao: orgaoFinal,
    esfera: "federal",
    ano,
    dotacao_inicial: dotacaoInicial,
    dotacao_autorizada: dotacaoAutorizada,
    empenhado,
    liquidado,
    pago,
    percentual_execucao: percentual,
    fonte_dados: `API Portal da Transparência (${camada})`,
    url_fonte: `https://portaldatransparencia.gov.br/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01/01/${ano}&ate=31/12/${ano}&programa=${codProg}`,
    observacoes: grupoFocal === "saude_indigena" ? `Camada: ${camada} | Saúde Indígena (SESAI)` : `Camada: ${camada}`,
    eixo_tematico: eixoTematico,
    grupo_focal: grupoFocal,
    descritivo: resolveDescritivo(item),
    publico_alvo: resolvePublicoAlvo(grupoFocal, item),
    razao_selecao: resolveRazaoSelecao(item, camada, orgao),
  };
}

/** Pre-aggregate API rows by programa+ação within a single fetch.
 *  The API returns one row per localizador; we SUM execution fields and MAX dotação. */
function aggregateApiRows(items: any[]): any[] {
  const map = new Map<string, any>();
  for (const item of items) {
    const codProg = item.codigoPrograma || "";
    const codAcao = item.codigoAcao || "";
    const key = `${codProg}|${codAcao}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...item });
    } else {
      // SUM execution fields across localizadores
      for (const [rawField, parsedField] of [
        ["empenhado", "valorEmpenhado"], ["liquidado", "valorLiquidado"], ["pago", "valorPago"],
      ]) {
        const eVal = parseBRL(existing[rawField] || existing[parsedField]) || 0;
        const iVal = parseBRL(item[rawField] || item[parsedField]) || 0;
        const sum = eVal + iVal;
        existing[rawField] = sum > 0 ? sum : null;
        existing[parsedField] = sum > 0 ? sum : null;
      }
      // MAX dotação fields (same value repeated per localizador)
      for (const [rawField, parsedField] of [
        ["dotacaoInicial", "valorDotacaoInicial"], ["dotacaoAtualizada", "valorDotacaoAtualizada"],
      ]) {
        const eVal = parseBRL(existing[rawField] || existing[parsedField]) || 0;
        const iVal = parseBRL(item[rawField] || item[parsedField]) || 0;
        const max = Math.max(eVal, iVal);
        existing[rawField] = max > 0 ? max : null;
        existing[parsedField] = max > 0 ? max : null;
      }
      map.set(key, existing);
    }
  }
  return Array.from(map.values());
}

/** Cross-layer merge: MAX for all fields (same data seen from different query angles) */
function mergeFinancials(existing: any, incoming: any): any {
  const merged = { ...existing };
  const fields = ["dotacao_inicial", "dotacao_autorizada", "empenhado", "liquidado", "pago"] as const;
  for (const f of fields) {
    const eVal = Number(existing[f]) || 0;
    const iVal = Number(incoming[f]) || 0;
    merged[f] = Math.max(eVal, iVal) || null;
  }
  // Recalculate percentual_execucao
  const dotRef = merged.dotacao_autorizada || merged.dotacao_inicial;
  merged.percentual_execucao = dotRef && merged.pago ? Math.round((merged.pago / dotRef) * 10000) / 100 : null;
  return merged;
}

async function fetchPaginated(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<any[]> {
  const all: any[] = [];
  let page = 1;

  while (page <= 50) {
    const url = new URL(`${API_BASE}/${endpoint}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    url.searchParams.set("pagina", String(page));

    if (page === 1) console.log(`  → ${url}`);

    try {
      const res = await fetch(url.toString(), {
        headers: { "chave-api-dados": apiKey, Accept: "application/json" },
      });

      if (res.status === 429) {
        console.log(`  Rate limited p${page}, waiting 30s...`);
        await new Promise(r => setTimeout(r, 30000));
        continue;
      }
      if (!res.ok) {
        console.error(`  API ${res.status}: ${(await res.text()).substring(0, 200)}`);
        break;
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      all.push(...data);
      if (data.length < 15) break;
      page++;
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`  Fetch error p${page}:`, e);
      break;
    }
  }
  return all;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos: number[] = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    let camadas: string[] = ["programas", "subfuncao", "orgaos"];
    try {
      const body = await req.json();
      if (body.anos) anos = body.anos;
      if (body.camadas) camadas = body.camadas;
    } catch { /* defaults */ }

    const apiKey = Deno.env.get("PORTAL_TRANSPARENCIA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "PORTAL_TRANSPARENCIA_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const erros: string[] = [];
    const registrosMap = new Map<string, any>();
    const logCamadas: Record<string, { brutos: number; relevantes: number }> = {};

    console.log(`=== INGESTÃO FEDERAL MULTI-CAMADA ===`);
    console.log(`Anos: ${anos.join(", ")}`);
    console.log(`Camadas: ${camadas.join(", ")}`);

    // ===== CAMADA 1: Programas Temáticos =====
    if (camadas.includes("programas")) {
      console.log(`\n--- CAMADA 1: Programas Temáticos do PPA ---`);
      let brutos = 0, relevantes = 0;

      for (const prog of PROGRAMAS_TEMATICOS) {
        for (const ano of anos) {
          if (ano < prog.desde) continue;
          console.log(`  ${prog.codigo} (${prog.nome}) ${ano}...`);

          try {
            const dados = await fetchPaginated(
              "despesas/por-funcional-programatica",
              { ano: String(ano), programa: prog.codigo },
              apiKey,
            );
            brutos += dados.length;

            const aggregated = aggregateApiRows(dados);

            for (const item of aggregated) {
              if (!isRelevant(item)) continue;
              const record = buildRecord(item, prog.orgao, ano, "Programa Temático PPA");
              if (record) {
                const key = `${record.orgao}|${record.programa}|${record.ano}`;
                const existing = registrosMap.get(key);
                if (!existing) {
                  registrosMap.set(key, record);
                  relevantes++;
                } else {
                  registrosMap.set(key, mergeFinancials(existing, record));
                }
              }
            }
          } catch (e) {
            erros.push(`Camada1 ${prog.codigo}/${ano}: ${e instanceof Error ? e.message : "?"}`);
          }
          await new Promise(r => setTimeout(r, 500));
        }
      }
      logCamadas["programas"] = { brutos, relevantes };
      console.log(`  Camada 1 totais: ${brutos} brutos → ${relevantes} relevantes`);
    }

    // ===== CAMADA 2: Subfunção 422 =====
    if (camadas.includes("subfuncao")) {
      console.log(`\n--- CAMADA 2: Subfunção 422 (Direitos Individuais) ---`);
      let brutos = 0, relevantes = 0;

      for (const ano of anos) {
        console.log(`  Subfunção 422, ano ${ano}...`);
        try {
          const dados = await fetchPaginated(
            "despesas/por-funcional-programatica",
            { ano: String(ano), subfuncao: SUBFUNCAO_DIREITOS },
            apiKey,
          );
          brutos += dados.length;
          const aggregated = aggregateApiRows(dados);

          for (const item of aggregated) {
            if (!isRelevant(item)) continue;
            const record = buildRecord(item, "MDHC", ano, "Subfunção 422");
            if (record) {
              const key = `${record.orgao}|${record.programa}|${record.ano}`;
              const existing = registrosMap.get(key);
              if (!existing) {
                registrosMap.set(key, record);
                relevantes++;
              } else {
                registrosMap.set(key, mergeFinancials(existing, record));
              }
            }
          }
        } catch (e) {
          erros.push(`Camada2 subfuncao422/${ano}: ${e instanceof Error ? e.message : "?"}`);
        }
        await new Promise(r => setTimeout(r, 500));
      }
      logCamadas["subfuncao"] = { brutos, relevantes };
      console.log(`  Camada 2 totais: ${brutos} brutos → ${relevantes} relevantes`);
    }

    // ===== CAMADA 3: Órgãos com Mandato Direto =====
    if (camadas.includes("orgaos")) {
      console.log(`\n--- CAMADA 3: Órgãos MIR (67000) e MPI (92000) ---`);
      let brutos = 0, relevantes = 0;

      for (const org of ORGAOS_MANDATO) {
        for (const ano of anos) {
          console.log(`  Órgão ${org.sigla} (${org.codigo}), ano ${ano}...`);
          try {
            const dados = await fetchPaginated(
              "despesas/por-funcional-programatica",
              { ano: String(ano), orgaoSuperior: org.codigo },
              apiKey,
            );
            brutos += dados.length;
            const aggregated = aggregateApiRows(dados);

            for (const item of aggregated) {
              const record = buildRecord(item, org.sigla, ano, `Órgão ${org.sigla}`);
              if (record) {
                const key = `${record.orgao}|${record.programa}|${record.ano}`;
                const existing = registrosMap.get(key);
                if (!existing) {
                  registrosMap.set(key, record);
                  relevantes++;
                } else {
                  registrosMap.set(key, mergeFinancials(existing, record));
                }
              }
            }
          } catch (e) {
            erros.push(`Camada3 ${org.sigla}/${ano}: ${e instanceof Error ? e.message : "?"}`);
          }
          await new Promise(r => setTimeout(r, 500));
        }
      }
      logCamadas["orgaos"] = { brutos, relevantes };
      console.log(`  Camada 3 totais: ${brutos} brutos → ${relevantes} relevantes`);
    }

    // ===== CAMADA 4: Ações Específicas SESAI =====
    if (camadas.includes("acoes_sesai") || camadas.includes("programas")) {
      console.log(`\n--- CAMADA 4: Ações Específicas SESAI (20YP, 7684) ---`);
      let brutos = 0, relevantes = 0;

      for (const acao of ACOES_ESPECIFICAS_INDIGENAS) {
        for (const ano of anos) {
          console.log(`  Ação ${acao.codigo} (${acao.nome}) ${ano}...`);
          try {
            const dados = await fetchPaginated(
              "despesas/por-funcional-programatica",
              { ano: String(ano), acao: acao.codigo },
              apiKey,
            );
            brutos += dados.length;
            const aggregated = aggregateApiRows(dados);

            for (const item of aggregated) {
              const record = buildRecord(item, acao.orgao, ano, `Ação SESAI ${acao.codigo}`);
              if (record) {
                const key = `${record.orgao}|${record.programa}|${record.ano}`;
                const existing = registrosMap.get(key);
                if (!existing) {
                  registrosMap.set(key, record);
                  relevantes++;
                } else {
                  registrosMap.set(key, mergeFinancials(existing, record));
                }
              }
            }
          } catch (e) {
            erros.push(`Camada4 ${acao.codigo}/${ano}: ${e instanceof Error ? e.message : "?"}`);
          }
          await new Promise(r => setTimeout(r, 500));
        }
      }
      logCamadas["acoes_sesai"] = { brutos, relevantes };
      console.log(`  Camada 4 totais: ${brutos} brutos → ${relevantes} relevantes`);
    }

    // ===== COMPLEMENTAÇÃO: Movimentação Líquida (liquidado/pago reais) =====
    // O endpoint por-funcional-programatica frequentemente retorna liquidado=0 e pago=0
    // mesmo quando há execução real. O endpoint movimentacao-liquida traz os valores corretos.
    console.log(`\n--- COMPLEMENTAÇÃO: Movimentação Líquida ---`);
    
    const progCodesUsed = new Set<string>();
    for (const record of registrosMap.values()) {
      const codMatch = record.programa.match(/^(\d{4})\s*[–-]/);
      if (codMatch) progCodesUsed.add(codMatch[1]);
    }
    
    let movLiquidaComplementados = 0;
    for (const progCode of progCodesUsed) {
      for (const ano of anos) {
        try {
          const movData = await fetchPaginated(
            "despesas/por-funcional-programatica/movimentacao-liquida",
            { ano: String(ano), programa: progCode },
            apiKey,
          );
          
          if (movData.length === 0) continue;
          
          console.log(`  MovLiquida ${progCode}/${ano}: ${movData.length} registros brutos`);
          // Log unique action codes
          const acoes = new Set(movData.map((d: any) => d.codigoAcao || "?"));
          console.log(`  MovLiquida ações: ${Array.from(acoes).join(", ")}`);
          
          // Aggregate by programa+acao (sum across grupo/elemento/modalidade)
          const movAgg = new Map<string, { empenhado: number; liquidado: number; pago: number }>();
          for (const item of movData) {
            const codAcao = item.codigoAcao || "";
            const key = `${progCode}|${codAcao}`;
            const existing = movAgg.get(key) || { empenhado: 0, liquidado: 0, pago: 0 };
            existing.empenhado += parseBRL(item.empenhado) || 0;
            existing.liquidado += parseBRL(item.liquidado) || 0;
            existing.pago += parseBRL(item.pago) || 0;
            movAgg.set(key, existing);
          }
          // Log aggregated 00SO
          const so = movAgg.get(`${progCode}|00SO`);
          if (so) console.log(`  MovLiquida 00SO agg: emp=${so.empenhado} liq=${so.liquidado} pago=${so.pago}`);
          
          // Update registrosMap entries
          for (const [regKey, record] of registrosMap.entries()) {
            const progMatch = record.programa.match(/^(\d{4})\s*[–-]/);
            const acaoMatch = record.programa.match(/\/\s*(\w{4})\s*[–-]/);
            if (!progMatch || progMatch[1] !== progCode) continue;
            if (record.ano !== ano) continue;
            
            const codAcao = acaoMatch ? acaoMatch[1] : "";
            const movKey = `${progCode}|${codAcao}`;
            const movValues = movAgg.get(movKey);
            if (!movValues) {
              if (record.programa.includes("00SO")) {
                console.log(`  DEBUG 00SO match attempt: codAcao="${codAcao}" movKey="${movKey}" keys=${Array.from(movAgg.keys()).filter(k => k.includes("00")).join(",")}`);
              }
              continue;
            }
            
            let updated = false;
            const currentLiq = Number(record.liquidado) || 0;
            const currentPago = Number(record.pago) || 0;
            const currentEmp = Number(record.empenhado) || 0;
            
            if (movValues.liquidado > currentLiq) { record.liquidado = movValues.liquidado; updated = true; }
            if (movValues.pago > currentPago) { record.pago = movValues.pago; updated = true; }
            if (movValues.empenhado > currentEmp) { record.empenhado = movValues.empenhado; updated = true; }
            
            if (updated) {
              const dotRef = record.dotacao_autorizada || record.dotacao_inicial;
              record.percentual_execucao = dotRef && record.pago 
                ? Math.round((record.pago / dotRef) * 10000) / 100 
                : null;
              registrosMap.set(regKey, record);
              movLiquidaComplementados++;
              console.log(`  Complementado: ${record.programa.substring(0, 60)} ${ano} → liq=${record.liquidado} pago=${record.pago}`);
            }
          }
        } catch (e) {
          console.warn(`  MovLiquida ${progCode}/${ano}: ${e instanceof Error ? e.message : "?"}`);
        }
        await new Promise(r => setTimeout(r, 300));
      }
    }
    console.log(`  Movimentação líquida: ${movLiquidaComplementados} registros complementados`);

    // ===== INSERÇÃO NO BANCO =====
    const batch = Array.from(registrosMap.values());
    let totalInserted = 0;
    const BATCH_SIZE = 50;

    console.log(`\n=== Inserindo ${batch.length} registros deduplicados ===`);

    for (let i = 0; i < batch.length; i += BATCH_SIZE) {
      const chunk = batch.slice(i, i + BATCH_SIZE);
      const { error: insErr } = await supabase.from("dados_orcamentarios").insert(chunk);
      if (insErr) {
        erros.push(`Insert batch ${i}: ${insErr.message}`);
        console.error(`Insert error batch ${i}:`, insErr.message);
      } else {
        totalInserted += chunk.length;
      }
    }

    const resultado = {
      success: true,
      total_inseridos: totalInserted,
      total_deduplicados: batch.length,
      anos,
      camadas_executadas: camadas,
      detalhes_camadas: logCamadas,
      erros: erros.slice(0, 20),
      metodologia: {
        descricao: "Ingestão multi-camada com 4 filtros independentes deduplicados",
        camada_1: "Programas temáticos PPA: " + PROGRAMAS_TEMATICOS.map(p => p.codigo).join(", "),
        camada_2: "Subfunção 422 (Direitos Individuais, Coletivos e Difusos)",
        camada_3: "Órgãos MIR (67000) e MPI (92000)",
        camada_4: "Ações específicas SESAI (20YP, 7684)",
        filtro_relevancia: "Palavras-chave: " + KEYWORDS_RELEVANCIA.slice(0, 10).join(", ") + "...",
        exclusoes: "Programas transversais excluídos: " + PROGRAMAS_EXCLUIDOS.join(", "),
        fonte: "API Portal da Transparência (api.portaldatransparencia.gov.br)",
      },
    };

    console.log(`\n=== CONCLUÍDO: ${totalInserted} inseridos, ${erros.length} erros ===`);

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

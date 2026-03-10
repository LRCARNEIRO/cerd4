import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ================================================================
 * INGESTÃO FEDERAL ALTERNATIVA — KEYWORD-FIRST
 * ================================================================
 * 
 * METODOLOGIA INVERTIDA:
 * 1º Passo: Buscar TODAS as ações orçamentárias federais via API,
 *   filtrando por SUBFUNÇÕES amplas e depois por palavras-chave.
 *   Não pré-filtrar por códigos de programa.
 * 2º Passo: Aplicar os filtros de relevância da metodologia original.
 * 3º Passo: Deduplica contra a base existente — insere APENAS novos.
 * ================================================================
 */

const KEYWORDS = [
  "racial", "racismo", "indígen", "indigen", "quilombol", "cigan", "romani",
  "afro", "palmares", "igualdade racial", "funai", "sesai", "etnia", "étnic",
  "povos tradicionais", "comunidades tradicionais", "terreiro", "matriz africana",
  "discriminaç", "preconceito racial", "capoeira", "cultura negra", "negro",
  "povo de santo", "candomblé", "umbanda", "juventude negra",
  "quilombo", "remanescente", "autodeclarad", "afrodescend",
  "ação afirmativa", "cotas raciais", "diversidade étnica",
];

// Programas transversais a excluir (falsos positivos volumosos)
const PROGRAMAS_EXCLUIDOS = new Set([
  "2068", "2049", "2012", "2015", "6012", "5029", "5113",
]);

// Subfunções que podem conter ações raciais/étnicas dispersas
const SUBFUNCOES_VARREDURA = [
  "122", // Administração Geral
  "128", // Formação de Recursos Humanos
  "131", // Comunicação Social
  "241", // Assistência ao Idoso
  "242", // Assistência ao Portador de Deficiência
  "243", // Assistência à Criança e ao Adolescente
  "244", // Assistência Comunitária
  "271", // Previdência Básica
  "301", // Atenção Básica
  "302", // Assistência Hospitalar e Ambulatorial
  "304", // Vigilância Sanitária
  "305", // Vigilância Epidemiológica
  "306", // Alimentação e Nutrição
  "331", // Proteção e Benefícios ao Trabalhador
  "334", // Fomento ao Trabalho
  "361", // Ensino Fundamental
  "362", // Ensino Médio
  "363", // Ensino Profissional
  "364", // Ensino Superior
  "365", // Educação Infantil
  "366", // Educação de Jovens e Adultos
  "367", // Educação Especial
  "391", // Patrimônio Histórico, Artístico e Arqueológico
  "392", // Difusão Cultural
  "421", // Relações de Trabalho
  "422", // Direitos Individuais, Coletivos e Difusos
  "423", // Assistência aos Povos Indígenas
  "541", // Preservação e Conservação Ambiental
  "542", // Controle Ambiental
  "571", // Desenvolvimento Científico
  "573", // Difusão do Conhecimento Científico e Tecnológico
  "812", // Desporto Comunitário
  "846", // Outros Encargos Especiais
];

const API_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";

const SIGLA_MAP: Record<string, string> = {
  "67000": "MIR", "92000": "MPI", "26000": "MEC", "36000": "MS",
  "55000": "MDS", "30000": "MJSP", "44000": "MDHC", "47000": "MPO",
  "37000": "FUNAI/MJ", "22000": "INCRA", "36901": "SESAI",
  "20000": "Presidência", "52000": "MDIC", "54000": "MTE",
  "24000": "MCTI", "35000": "MRE", "46000": "MGI", "51000": "ME",
  "84000": "MPI",
};

const ACAO_ORGAO_MAP: Record<string, string> = {
  "20YP": "SESAI", "7684": "SESAI", "20UF": "FUNAI", "2384": "FUNAI",
  "215O": "FUNAI", "215Q": "FUNAI", "8635": "FUNAI", "15Q1": "INCRA",
  "214V": "FUNAI", "20G7": "INCRA", "0859": "INCRA", "21CS": "MIR",
};

const ACOES_SESAI = ["20YP", "7684"];

function parseBRL(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val || null;
  const s = String(val).trim();
  if (!s || s === "0" || s === "0,00") return null;
  const num = Number(s.replace(/\./g, "").replace(",", "."));
  return isNaN(num) || num === 0 ? null : num;
}

function resolveOrgao(item: any): string {
  const codAcao = item.codigoAcao || "";
  if (codAcao && ACAO_ORGAO_MAP[codAcao]) return ACAO_ORGAO_MAP[codAcao];
  const codOrg = item.codigoOrgaoSuperior || item.codigoOrgao || "";
  if (codOrg && SIGLA_MAP[codOrg]) return SIGLA_MAP[codOrg];
  return item.nomeOrgaoSuperior?.substring(0, 30) || "Federal";
}

function classificarGrupoFocal(item: any, orgao: string): string | null {
  const codAcao = item.codigoAcao || "";
  const texto = [item.programa, item.nomePrograma, item.acao, item.nomeAcao].filter(Boolean).join(" ").toLowerCase();
  if (ACOES_SESAI.includes(codAcao) || orgao === "SESAI") return "saude_indigena";
  if (orgao === "FUNAI" || orgao === "MPI" || texto.includes("indígen") || texto.includes("indigen")) return "indigenas";
  if (texto.includes("quilombol")) return "quilombolas";
  if (texto.includes("cigan") || texto.includes("romani")) return "ciganos";
  if (texto.includes("juventude negra")) return "juventude_negra";
  if (orgao === "MIR" || texto.includes("racial") || texto.includes("racismo") || texto.includes("negro") || texto.includes("afro")) return "negros";
  return null;
}

function classificarEixoTematico(grupo: string | null): string | null {
  if (!grupo) return null;
  if (grupo === "saude_indigena") return "saude";
  if (grupo === "indigenas" || grupo === "quilombolas") return "terra_territorio";
  return "politicas_institucionais";
}

function matchesKeywords(item: any): string[] {
  const text = [
    item.programa, item.nomePrograma, item.acao, item.nomeAcao,
    item.nomeOrgaoSuperior, item.nomeFuncao, item.nomeSubfuncao,
    item.objetivo, item.descricao, item.nomeUnidadeOrcamentaria,
    item.nomeLocalizador, item.nomeResultadoPrimario,
    item.nomePlanoOrcamentario, item.descricaoPlanoOrcamentario,
  ].filter(Boolean).join(" ").toLowerCase();
  return KEYWORDS.filter(kw => text.includes(kw));
}

async function fetchPaginated(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<any[]> {
  const all: any[] = [];
  let page = 1;
  while (page <= 80) {
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
      await new Promise(r => setTimeout(r, 350));
    } catch (e) {
      console.error(`  Fetch error p${page}:`, e);
      break;
    }
  }
  return all;
}

function aggregateApiRows(items: any[]): any[] {
  const map = new Map<string, any>();
  for (const item of items) {
    const key = `${item.codigoPrograma || ""}|${item.codigoAcao || ""}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...item });
    } else {
      for (const f of ["empenhado", "valorEmpenhado", "liquidado", "valorLiquidado", "pago", "valorPago"]) {
        const eVal = parseBRL(existing[f]) || 0;
        const iVal = parseBRL(item[f]) || 0;
        existing[f] = (eVal + iVal) || null;
      }
      for (const f of ["dotacaoInicial", "valorDotacaoInicial", "dotacaoAtualizada", "valorDotacaoAtualizada"]) {
        const eVal = parseBRL(existing[f]) || 0;
        const iVal = parseBRL(item[f]) || 0;
        existing[f] = Math.max(eVal, iVal) || null;
      }
      map.set(key, existing);
    }
  }
  return Array.from(map.values());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos: number[] = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    try {
      const body = await req.json();
      if (body.anos) anos = body.anos;
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

    console.log(`=== INGESTÃO FEDERAL ALTERNATIVA (KEYWORD-FIRST) ===`);
    console.log(`Anos: ${anos.join(", ")}`);
    console.log(`Subfunções a varrer: ${SUBFUNCOES_VARREDURA.length}`);

    // ===== PASSO 1: Varrer subfunções e filtrar por keywords =====
    let totalBrutos = 0;
    let totalComKeyword = 0;

    for (const ano of anos) {
      console.log(`\n--- Ano ${ano} ---`);

      for (const subfuncao of SUBFUNCOES_VARREDURA) {
        try {
          const dados = await fetchPaginated(
            "despesas/por-funcional-programatica",
            { ano: String(ano), subfuncao },
            apiKey,
          );

          if (dados.length === 0) continue;
          totalBrutos += dados.length;

          const aggregated = aggregateApiRows(dados);

          for (const item of aggregated) {
            const codProg = item.codigoPrograma || "";
            if (PROGRAMAS_EXCLUIDOS.has(codProg)) continue;

            const matched = matchesKeywords(item);
            if (matched.length === 0) continue;
            totalComKeyword++;

            const codAcao = item.codigoAcao || "";
            const nomeProg = item.programa || item.nomePrograma || "";
            const nomeAcao = item.acao || item.nomeAcao || "";

            const orgao = resolveOrgao(item);
            let programa = codProg ? `${codProg} – ${nomeProg}` : nomeProg;
            if (codAcao) programa += ` / ${codAcao} – ${nomeAcao}`;

            const dotacaoInicial = parseBRL(item.dotacaoInicial || item.valorDotacaoInicial);
            const dotacaoAutorizada = parseBRL(item.dotacaoAtualizada || item.valorDotacaoAtualizada);
            const empenhado = parseBRL(item.empenhado || item.valorEmpenhado);
            const liquidado = parseBRL(item.liquidado || item.valorLiquidado);
            const pago = parseBRL(item.pago || item.valorPago);

            if (!dotacaoInicial && !dotacaoAutorizada && !empenhado && !liquidado && !pago) continue;

            const grupoFocal = classificarGrupoFocal(item, orgao);
            const eixoTematico = classificarEixoTematico(grupoFocal);
            const dotRef = dotacaoAutorizada || dotacaoInicial;
            const percentual = dotRef && pago ? Math.round((pago / dotRef) * 10000) / 100 : null;

            const key = `${orgao}|${programa.substring(0, 250)}|${ano}`;
            if (!registrosMap.has(key)) {
              registrosMap.set(key, {
                programa: programa.substring(0, 250),
                orgao,
                esfera: "federal",
                ano,
                dotacao_inicial: dotacaoInicial,
                dotacao_autorizada: dotacaoAutorizada,
                empenhado,
                liquidado,
                pago,
                percentual_execucao: percentual,
                fonte_dados: `API Portal Transparência (Keyword-First, subfunção ${subfuncao})`,
                url_fonte: `https://portaldatransparencia.gov.br/despesas/programa-e-acao?de=01/01/${ano}&ate=31/12/${ano}&programa=${codProg}`,
                observacoes: `Keyword-First | Subfunção ${subfuncao} | Keywords: ${matched.slice(0, 3).join(", ")}`,
                eixo_tematico: eixoTematico,
                grupo_focal: grupoFocal,
                descritivo: nomeAcao || nomeProg || null,
                publico_alvo: null,
                razao_selecao: `Keyword-First: ${matched.slice(0, 4).join(", ")} | Subfunção ${subfuncao}`,
              });
            }
          }
        } catch (e) {
          erros.push(`Subfunção ${subfuncao}/${ano}: ${e instanceof Error ? e.message : "?"}`);
        }
        // Small delay between subfunção calls
        await new Promise(r => setTimeout(r, 300));
      }
    }

    console.log(`\nPasso 1 concluído: ${totalBrutos} brutos → ${totalComKeyword} com keyword → ${registrosMap.size} únicos`);

    // ===== PASSO 2: Deduplica contra base existente =====
    console.log(`\n--- Deduplicação contra base existente ---`);

    // Fetch existing federal records to deduplicate
    const { data: existentes, error: fetchErr } = await supabase
      .from("dados_orcamentarios")
      .select("orgao, programa, ano")
      .eq("esfera", "federal");

    if (fetchErr) {
      erros.push(`Erro ao buscar existentes: ${fetchErr.message}`);
    }

    const existingKeys = new Set<string>();
    if (existentes) {
      for (const e of existentes) {
        existingKeys.add(`${e.orgao}|${e.programa}|${e.ano}`);
      }
    }
    console.log(`  ${existingKeys.size} registros federais existentes na base`);

    // Filter out duplicates
    const novos: any[] = [];
    for (const [key, record] of registrosMap.entries()) {
      if (!existingKeys.has(key)) {
        novos.push(record);
      }
    }
    console.log(`  ${registrosMap.size - novos.length} duplicados removidos → ${novos.length} novos registros`);

    // ===== PASSO 3: Inserir novos =====
    let totalInserted = 0;
    const BATCH_SIZE = 50;

    for (let i = 0; i < novos.length; i += BATCH_SIZE) {
      const chunk = novos.slice(i, i + BATCH_SIZE);
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
      total_brutos: totalBrutos,
      total_com_keyword: totalComKeyword,
      total_unicos: registrosMap.size,
      total_duplicados: registrosMap.size - novos.length,
      total_inseridos: totalInserted,
      anos,
      subfuncoes_varridas: SUBFUNCOES_VARREDURA.length,
      erros: erros.slice(0, 20),
      metodologia: {
        descricao: "Keyword-First: Varredura de subfunções com filtro por palavras-chave raciais/étnicas",
        passo_1: "Buscar todas as ações por subfunção na API",
        passo_2: "Filtrar por palavras-chave raciais/étnicas",
        passo_3: "Deduplicar contra base existente",
        passo_4: "Inserir apenas registros novos (complementares)",
        keywords: KEYWORDS.slice(0, 15).join(", ") + "...",
        subfuncoes: SUBFUNCOES_VARREDURA.length + " subfunções varridas",
      },
    };

    console.log(`\n=== CONCLUÍDO: ${totalInserted} novos inseridos, ${erros.length} erros ===`);

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

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Programas temáticos federais de política racial/indígena.
 * Estratégia: buscar por código de programa na API do Portal da Transparência.
 * Cada programa é mapeado ao órgão responsável principal.
 */
const PROGRAMAS = [
  { codigo: "5034", nome: "Igualdade Racial e Superação do Racismo", orgao: "MIR", desde: 2020 },
  { codigo: "5803", nome: "Juventude Negra Viva", orgao: "MIR", desde: 2024 },
  { codigo: "2065", nome: "Proteção e Promoção dos Direitos dos Povos Indígenas", orgao: "MPI", desde: 2012 },
  { codigo: "0153", nome: "Promoção e Defesa dos Direitos da Criança e do Adolescente", orgao: "MDHC", desde: 2004 },
];

// Mapeamento de códigos de órgão superior para siglas
const SIGLA_MAP: Record<string, string> = {
  "67000": "MIR", "92000": "MPI", "26000": "MEC", "36000": "MS",
  "55000": "MDS", "30000": "MJSP", "44000": "MDHC", "47000": "MDHC",
  "37000": "FUNAI/MJ", "22000": "INCRA", "36901": "SESAI",
  "20000": "Presidência", "52000": "MDIC", "54000": "MTE",
};

const API_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";
const SIOP_SPARQL = "https://www1.siop.planejamento.gov.br/sparql";

const BROWSER_HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Accept": "application/sparql-results+json, application/json, text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
  "Accept-Encoding": "gzip, deflate, br",
  "Referer": "https://www1.siop.planejamento.gov.br/",
  "Origin": "https://www1.siop.planejamento.gov.br",
  "Connection": "keep-alive",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-origin",
  "DNT": "1",
  "Cache-Control": "no-cache",
  "Pragma": "no-cache",
};

// Parse Brazilian-formatted numbers: "15.106.612,40" → 15106612.40
function parseBRL(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val || null;
  const s = String(val).trim();
  if (!s || s === "0" || s === "0,00") return null;
  const num = Number(s.replace(/\./g, "").replace(",", "."));
  return isNaN(num) || num === 0 ? null : num;
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
        await new Promise((r) => setTimeout(r, 30000));
        continue;
      }
      if (!res.ok) {
        const err = await res.text();
        console.error(`  API ${res.status}: ${err.substring(0, 200)}`);
        break;
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;

      all.push(...data);
      if (data.length < 15) break;
      page++;
      await new Promise((r) => setTimeout(r, 300));
    } catch (e) {
      console.error(`  Fetch error p${page}:`, e);
      break;
    }
  }
  return all;
}

// Map specific budget actions to their executing organ
const ACAO_ORGAO_MAP: Record<string, string> = {
  "20YP": "SESAI",  // Saúde Indígena
  "7684": "SESAI",  // Saneamento em Aldeias
  "20UF": "FUNAI",  // Regularização Fundiária Indígena
  "2384": "FUNAI",  // Direitos Sociais e Culturais
  "215O": "FUNAI",  // Gestão Ambiental e Etnodesenvolvimento
  "215Q": "FUNAI",  // Povos de Recente Contato
  "8635": "FUNAI",  // Preservação Cultural
  "15Q1": "INCRA",  // Aquisição Imóvel Rural / Reserva Indígena
  "214V": "FUNAI",  // Fiscalização Territórios
  "20G7": "INCRA",  // Reforma Agrária / Quilombolas
  "0859": "INCRA",  // Indenização Quilombolas
};

function resolveOrgao(item: any, fallbackOrgao: string): string {
  // First: check action code for specific organ mapping
  const codAcao = item.codigoAcao || "";
  if (codAcao && ACAO_ORGAO_MAP[codAcao]) return ACAO_ORGAO_MAP[codAcao];
  
  // Then: try organ code from API response
  const codOrgSup = item.codigoOrgaoSuperior || item.codigoOrgao || "";
  if (codOrgSup && SIGLA_MAP[codOrgSup]) return SIGLA_MAP[codOrgSup];
  return fallbackOrgao;
}

function buildRecord(item: any, fallbackOrgao: string, ano: number) {
  const codProg = item.codigoPrograma || "";
  const nomeProg = item.programa || item.nomePrograma || "";
  const codAcao = item.codigoAcao || "";
  const nomeAcao = item.acao || item.nomeAcao || "";

  if (!codProg && !nomeProg) return null;

  let programa = codProg ? `${codProg} – ${nomeProg}` : nomeProg;
  if (codAcao) programa += ` / ${codAcao} – ${nomeAcao}`;

  const empenhado = parseBRL(item.empenhado || item.valorEmpenhado);
  const liquidado = parseBRL(item.liquidado || item.valorLiquidado);
  const pago = parseBRL(item.pago || item.valorPago);
  // Note: API por-funcional-programatica does NOT return dotação
  // dotação would require SIOP integration
  const dotacao = parseBRL(item.dotacaoAtualizada || item.valorDotacaoAtualizada || item.dotacaoInicial || item.valorDotacaoInicial);

  // Skip records with zero financial data
  if (!dotacao && !empenhado && !liquidado && !pago) return null;

  const orgao = resolveOrgao(item, fallbackOrgao);
  const percentual = dotacao && pago ? Math.round((pago / dotacao) * 10000) / 100 : null;

  return {
    programa: programa.substring(0, 250),
    orgao,
    esfera: "federal",
    ano,
    dotacao_autorizada: dotacao,
    empenhado,
    liquidado,
    pago,
    percentual_execucao: percentual,
    fonte_dados: `API Portal da Transparência`,
    url_fonte: `https://portaldatransparencia.gov.br/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01/01/${ano}&ate=31/12/${ano}&programa=${codProg}`,
    observacoes: null,
    eixo_tematico: null,
    grupo_focal: null,
  };
}

/**
 * Tenta buscar dotação autorizada do SIOP via SPARQL usando Firecrawl como proxy
 * (contorna Cloudflare WAF). Retorna Map<"codPrograma|ano", dotacao> ou vazio.
 */
async function fetchSiopDotacao(programas: string[], anos: number[]): Promise<{ dotacoes: Map<string, number>, diagnostico: string }> {
  const result = new Map<string, number>();
  const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

  if (!firecrawlKey) {
    return { dotacoes: result, diagnostico: "FIRECRAWL_API_KEY não configurada - proxy indisponível" };
  }

  // Named graphs go up to 2016 in SIOP. Check if data exists for recent years.
  // The SIOP SPARQL uses named graphs: http://orcamento.dados.gov.br/{ano}/
  
  for (const codProg of programas) {
    for (const ano of anos) {
      // Use GRAPH clause targeting the specific year's named graph
      // Simple query without GRAPH clause (faster, avoids timeout)
      const query = `
        PREFIX loa: <http://vocab.e.gov.br/2013/09/loa#>
        SELECT ?dot WHERE {
          ?item loa:temExercicio "${ano}" ;
                loa:temPrograma <http://orcamento.dados.gov.br/id/programa/${codProg}> ;
                loa:temDotacaoAtualizada ?dot .
        } LIMIT 20
      `;

      const sparqlUrl = `${SIOP_SPARQL}?query=${encodeURIComponent(query.trim())}&format=json`;
      console.log(`SIOP via Firecrawl: programa ${codProg} ano ${ano}`);

      try {
        await new Promise(r => setTimeout(r, 500));

        const fcRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${firecrawlKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: sparqlUrl,
            formats: ["markdown"],
            onlyMainContent: false,
            waitFor: 3000,
          }),
        });

        if (!fcRes.ok) {
          const errText = await fcRes.text();
          console.error(`  Firecrawl error ${fcRes.status}: ${errText.substring(0, 200)}`);
          continue;
        }

        const fcData = await fcRes.json();
        const markdown = fcData?.data?.markdown || fcData?.markdown || "";
        const html = fcData?.data?.html || fcData?.html || "";
        const statusCode = fcData?.data?.metadata?.statusCode;
        
        console.log(`  Firecrawl statusCode: ${statusCode}, markdown length: ${markdown.length}`);

        // Try to parse the SPARQL JSON response from the markdown/html
        // Firecrawl wraps JSON responses in markdown code blocks or returns as-is
        let jsonStr = markdown
          .replace(/\\\[/g, "[").replace(/\\\]/g, "]")  // unescape markdown brackets
          .replace(/\\\\/g, "\\")
          .trim();
        
        // Try to extract JSON from the content
        const jsonMatch = jsonStr.match(/\{[\s\S]*"results"[\s\S]*"bindings"[\s\S]*\}/);
        if (!jsonMatch) {
          console.log(`  Não foi possível extrair JSON SPARQL da resposta (${jsonStr.substring(0, 200)})`);
          // If we got a Cloudflare page or empty results, note it
          if (jsonStr.includes("cloudflare") || jsonStr.includes("Just a moment")) {
            return { dotacoes: result, diagnostico: "Cloudflare WAF detectado mesmo via Firecrawl" };
          }
          if (jsonStr.includes('"bindings": []') || jsonStr.includes('"bindings" : []') || jsonStr.includes("bindings\": \\[")) {
            console.log(`  Bindings vazios para ${codProg}/${ano} - grafo pode não existir`);
            continue;
          }
          continue;
        }

        const sparqlData = JSON.parse(jsonMatch[0]);
        const bindings = sparqlData?.results?.bindings || [];
        console.log(`  SIOP ${codProg}/${ano}: ${bindings.length} resultados`);

        let totalDot = 0;
        for (const b of bindings) {
          const val = parseFloat(b?.dot?.value || "0");
          if (val > 0) totalDot += val;
        }

        if (totalDot > 0) {
          result.set(`${codProg}|${ano}`, totalDot);
          console.log(`  → Dotação total: R$ ${totalDot.toLocaleString("pt-BR")}`);
        }
      } catch (e) {
        console.error(`  SIOP/Firecrawl error ${codProg}/${ano}:`, e);
      }
    }
  }

  const diagnostico = result.size > 0
    ? `SIOP acessível via Firecrawl: ${result.size} dotações obtidas`
    : "SIOP acessível mas sem dados de dotação para os programas/anos solicitados (grafos podem estar limitados a 2000-2016)";
  
  return { dotacoes: result, diagnostico };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos: number[] | undefined;
    let testSiop = false;
    try {
      const body = await req.json();
      anos = body.anos;
      testSiop = body.testSiop === true;
    } catch { /* defaults */ }

    // === SIOP-only test mode ===
    if (testSiop) {
      console.log("=== Modo teste SIOP SPARQL via Firecrawl ===");
      const testAnos = anos || [2015];
      const testProgs = PROGRAMAS.map(p => p.codigo).slice(0, 1); // test one program only
      const { dotacoes, diagnostico } = await fetchSiopDotacao(testProgs, testAnos);
      return new Response(
        JSON.stringify({
          success: true,
          mode: "siop_test_firecrawl",
          dotacoes_encontradas: dotacoes.size,
          dados: Object.fromEntries(dotacoes),
          diagnostico,
          grafos_testados: testAnos.map(a => `http://orcamento.dados.gov.br/${a}/`),
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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

    const anosRange = anos || [2020, 2021, 2022, 2023, 2024, 2025];
    const erros: string[] = [];
    let totalInserted = 0;
    const registros: any[] = [];

    console.log(`=== Ingestão Federal: anos ${anosRange.join(", ")} ===`);
    console.log(`=== Programas: ${PROGRAMAS.map((p) => p.codigo).join(", ")} ===`);

    for (const prog of PROGRAMAS) {
      for (const ano of anosRange) {
        if (ano < prog.desde) continue;

        console.log(`\nBuscando ${prog.codigo} (${prog.nome}) ${ano}...`);

        try {
          const dados = await fetchPaginated(
            "despesas/por-funcional-programatica",
            { ano: String(ano), programa: prog.codigo },
            apiKey,
          );
          console.log(`  → ${dados.length} registros brutos`);

          if (dados.length > 0) {
            console.log(`  KEYS: ${Object.keys(dados[0]).join(", ")}`);
            console.log(`  SAMPLE: ${JSON.stringify(dados[0]).substring(0, 500)}`);
          }

          let added = 0;
          for (const item of dados) {
            const record = buildRecord(item, prog.orgao, ano);
            if (record) {
              registros.push(record);
              added++;
            }
          }
          console.log(`  → ${added} registros com dados financeiros`);
        } catch (error) {
          const msg = `${prog.codigo} ${ano}: ${error instanceof Error ? error.message : "Unknown"}`;
          erros.push(msg);
          console.error(msg);
        }

        await new Promise((r) => setTimeout(r, 500));
      }
    }


    // Deduplicate by orgao+programa+ano (keep highest pago)
    const deduped = new Map<string, any>();
    for (const r of registros) {
      const key = `${r.orgao}|${r.programa}|${r.ano}`;
      const existing = deduped.get(key);
      if (!existing || (r.pago && (!existing.pago || r.pago > existing.pago))) {
        deduped.set(key, r);
      }
    }
    console.log(`\nDeduplicação: ${registros.length} → ${deduped.size} registros`);

    // Batch insert
    const batch = Array.from(deduped.values());
    const BATCH_SIZE = 50;
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

    console.log(`\n=== Concluído: ${totalInserted} inseridos, ${erros.length} erros ===`);

    return new Response(
      JSON.stringify({
        success: true,
        total_inseridos: totalInserted,
        total_brutos: registros.length,
        deduplicados: deduped.size,
        anos: anosRange,
        programas: PROGRAMAS.map((p) => p.codigo),
        erros: erros.slice(0, 20),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

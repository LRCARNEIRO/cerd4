import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ================================================================
 * ENRIQUECIMENTO DE DOTAÇÃO — OPÇÃO A
 * ================================================================
 * 
 * Para registros federais que possuem valores de execução (pago, liquidado)
 * mas NÃO possuem dotação (inicial ou autorizada), esta função:
 * 
 * 1. Busca todos os registros sem dotação na base
 * 2. Extrai codigoPrograma e codigoAcao do campo "programa"
 * 3. Re-consulta a API do Portal da Transparência filtrando por
 *    programa + ação (que sabemos retornar campos de dotação)
 * 4. Atualiza os registros com dotação_inicial e dotacao_autorizada
 * 
 * Processa UM ANO por chamada para evitar timeouts.
 * ================================================================
 */

const API_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";

function parseBRL(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val || null;
  const s = String(val).trim();
  if (!s || s === "0" || s === "0,00") return null;
  const num = Number(s.replace(/\./g, "").replace(",", "."));
  return isNaN(num) || num === 0 ? null : num;
}

/** Extract program code (first 4 digits) from "5804 – NOME..." */
function extractCodPrograma(programa: string): string {
  const m = programa.match(/^(\d{4})/);
  return m ? m[1] : "";
}

/** Extract action code from "... / XXXX – NOME..." */
function extractCodAcao(programa: string): string {
  const m = programa.match(/\/\s*([A-Z0-9]{3,5})\s*[–-]/);
  return m ? m[1] : "";
}

async function fetchWithRetry(
  url: string,
  apiKey: string,
  maxRetries = 2,
): Promise<any[]> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "chave-api-dados": apiKey, Accept: "application/json" },
      });

      if (res.status === 429) {
        console.log(`  Rate limited, waiting 30s...`);
        await new Promise(r => setTimeout(r, 30000));
        continue;
      }
      if (!res.ok) {
        console.error(`  API ${res.status}: ${(await res.text()).substring(0, 200)}`);
        return [];
      }

      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch (e) {
      console.error(`  Fetch error (attempt ${attempt}):`, e);
      if (attempt < maxRetries) await new Promise(r => setTimeout(r, 2000));
    }
  }
  return [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let ano = 2024;
    let limit = 50; // max records per call
    try {
      const body = await req.json();
      if (body.ano) ano = body.ano;
      if (body.limit) limit = Math.min(body.limit, 100);
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

    console.log(`\n=== ENRIQUECIMENTO DE DOTAÇÃO — ANO ${ano} ===`);

    // Step 1: Fetch records missing dotação
    const { data: records, error: qErr } = await supabase
      .from("dados_orcamentarios")
      .select("id, programa, orgao, pago, liquidado")
      .eq("esfera", "federal")
      .eq("ano", ano)
      .is("dotacao_inicial", null)
      .is("dotacao_autorizada", null)
      .limit(limit);

    if (qErr) {
      return new Response(
        JSON.stringify({ success: false, error: `Query error: ${qErr.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!records || records.length === 0) {
      console.log(`  Nenhum registro sem dotação para ${ano}`);
      return new Response(
        JSON.stringify({ success: true, ano, total_sem_dotacao: 0, atualizados: 0, message: "Todos os registros já possuem dotação" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`  ${records.length} registros sem dotação encontrados`);

    // Step 2: Group by programa+ação to avoid redundant API calls
    const queryGroups = new Map<string, { ids: string[]; pago: number; liquidado: number }>();
    for (const rec of records) {
      const codProg = extractCodPrograma(rec.programa);
      const codAcao = extractCodAcao(rec.programa);
      if (!codProg) {
        console.log(`  Skipping (no codProg): ${rec.programa.substring(0, 60)}`);
        continue;
      }
      const key = `${codProg}|${codAcao}`;
      const existing = queryGroups.get(key);
      if (existing) {
        existing.ids.push(rec.id);
        existing.pago += Number(rec.pago) || 0;
        existing.liquidado += Number(rec.liquidado) || 0;
      } else {
        queryGroups.set(key, {
          ids: [rec.id],
          pago: Number(rec.pago) || 0,
          liquidado: Number(rec.liquidado) || 0,
        });
      }
    }

    console.log(`  ${queryGroups.size} consultas únicas à API necessárias`);

    // Step 3: Query API for each programa+ação
    let updated = 0;
    let apiCalls = 0;
    let noData = 0;
    const erros: string[] = [];

    for (const [key, group] of queryGroups) {
      const [codProg, codAcao] = key.split("|");

      // Build API URL — the API uses "programa" and "acao" as param names (NOT "codigoPrograma")
      const params: Record<string, string> = {
        ano: String(ano),
        programa: codProg,
      };
      if (codAcao) params.acao = codAcao;

      const url = new URL(`${API_BASE}/despesas/por-funcional-programatica`);
      for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
      url.searchParams.set("pagina", "1");

      console.log(`  API: ${codProg}/${codAcao || "*"} (${group.ids.length} registros)`);
      apiCalls++;

      const data = await fetchWithRetry(url.toString(), apiKey);

      if (data.length === 0) {
        noData++;
        console.log(`    → Sem dados da API`);
        continue;
      }

      // Log first item keys to debug field names
      if (apiCalls <= 3) {
        const firstItem = data[0];
        const dotFields = Object.keys(firstItem).filter(k => 
          k.toLowerCase().includes("dot") || k.toLowerCase().includes("valor") || 
          k.toLowerCase().includes("orc") || k.toLowerCase().includes("cred")
        );
        console.log(`    → ${data.length} items. Dot fields: ${dotFields.join(", ") || "NONE"}`);
        console.log(`    → Sample values: ${dotFields.map(f => `${f}=${firstItem[f]}`).join(", ")}`);
        console.log(`    → All keys: ${Object.keys(firstItem).join(", ")}`);
      }

      // Aggregate dotação across localizadores (MAX for dotação)
      let dotInicial = 0;
      let dotAutorizada = 0;

      for (const item of data) {
        const itemCodAcao = item.codigoAcao || "";
        // If we filtered by ação, only match that ação
        if (codAcao && itemCodAcao !== codAcao) continue;

        const di = parseBRL(item.dotacaoInicial || item.valorDotacaoInicial) || 0;
        const da = parseBRL(item.dotacaoAtualizada || item.valorDotacaoAtualizada) || 0;

        // For dotação: use MAX across localizadores (same value repeated)
        dotInicial = Math.max(dotInicial, di);
        dotAutorizada = Math.max(dotAutorizada, da);
      }

      if (dotInicial === 0 && dotAutorizada === 0) {
        noData++;
        console.log(`    → Dotação = 0 na API (campos ausentes)`);
        continue;
      }

      console.log(`    → Dot.Inicial: R$ ${(dotInicial / 1e6).toFixed(2)}mi | Dot.Autorizada: R$ ${(dotAutorizada / 1e6).toFixed(2)}mi`);

      // Step 4: Update all records in this group
      for (const id of group.ids) {
        const updateData: Record<string, number | null> = {};
        if (dotInicial > 0) updateData.dotacao_inicial = dotInicial;
        if (dotAutorizada > 0) updateData.dotacao_autorizada = dotAutorizada;

        // Recalculate percentual_execucao
        const rec = records.find(r => r.id === id);
        const pago = Number(rec?.pago) || 0;
        const dotRef = dotAutorizada || dotInicial;
        if (dotRef > 0 && pago > 0) {
          updateData.percentual_execucao = Math.min(
            Math.round((pago / dotRef) * 10000) / 100,
            99999.99,
          );
        }

        if (Object.keys(updateData).length === 0) continue;

        const { error: uErr } = await supabase
          .from("dados_orcamentarios")
          .update(updateData)
          .eq("id", id);

        if (uErr) {
          erros.push(`Update ${id}: ${uErr.message}`);
        } else {
          updated++;
        }
      }

      // Rate limit: 350ms between API calls
      await new Promise(r => setTimeout(r, 350));
    }

    console.log(`\n=== CONCLUÍDO ${ano}: ${updated} atualizados, ${noData} sem dados na API, ${erros.length} erros ===`);

    return new Response(
      JSON.stringify({
        success: true,
        ano,
        total_sem_dotacao: records.length,
        consultas_api: apiCalls,
        sem_dados_api: noData,
        atualizados: updated,
        erros: erros.slice(0, 20),
        message: `Enriquecimento ${ano}: ${updated}/${records.length} registros atualizados com dotação`,
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

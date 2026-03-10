import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ================================================================
 * ENRIQUECIMENTO DE DOTAÇÃO — ESTRATÉGIA DUPLA
 * ================================================================
 *
 * ESTRATÉGIA 1: CSV/LOA (Dados Abertos)
 *   - Baixa ZIP da LOA, indexa por codPrograma|codAcao
 *   - Funciona bem para 2024-2025, menor cobertura para anos anteriores
 *
 * ESTRATÉGIA 2: API por Programa (COMPLEMENTAR — NOVA)
 *   - Para registros AINDA sem dotação após CSV,
 *     re-consulta a API usando codigoPrograma (que RETORNA dotação)
 *   - Resolve o problema: subfunção não retorna dotação, mas programa sim
 *
 * Processa UM ANO por chamada para evitar timeouts.
 * ================================================================
 */

const API_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";

function parseBRL(val: string): number | null {
  if (!val) return null;
  const s = val.replace(/"/g, "").trim();
  if (!s || s === "0" || s === "0.00" || s === "0,00") return null;
  const num = Number(s.replace(/\./g, "").replace(",", "."));
  return isNaN(num) || num === 0 ? null : num;
}

function parseBRLApi(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val || null;
  const s = String(val).trim();
  if (!s || s === "0" || s === "0,00") return null;
  const num = Number(s.replace(/\./g, "").replace(",", "."));
  return isNaN(num) || num === 0 ? null : num;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') { inQuotes = !inQuotes; }
    else if (c === ";" && !inQuotes) { result.push(current); current = ""; }
    else { current += c; }
  }
  result.push(current);
  return result;
}

/** Extract programa code from "5804 – NOME..." */
function extractCodPrograma(programa: string): string {
  const m = programa.match(/^(\d{4})/);
  return m ? m[1] : "";
}

/** Extract action code from "... / XXXX – NOME..." */
function extractCodAcao(programa: string): string {
  const m = programa.match(/\/\s*([A-Z0-9]{3,5})\s*[–-]/);
  return m ? m[1] : "";
}

// ===== ESTRATÉGIA 1: CSV/LOA =====
async function enrichViaCSV(
  records: any[],
  ano: number,
  supabase: any,
): Promise<{ updated: number; remaining: any[]; erros: string[]; matchLog: string[] }> {
  let updated = 0;
  const erros: string[] = [];
  const matchLog: string[] = [];

  // Download ZIP
  const url = `https://portaldatransparencia.gov.br/download-de-dados/orcamento-despesa/${ano}`;
  console.log(`  [CSV] Baixando ZIP: ${url}`);

  let zipBytes: Uint8Array;
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CERD-IV/1.0)", Accept: "*/*" },
      redirect: "follow",
    });
    if (!res.ok) {
      console.log(`  [CSV] HTTP ${res.status} — pulando estratégia CSV`);
      return { updated: 0, remaining: records, erros: [`CSV HTTP ${res.status}`], matchLog: [] };
    }
    zipBytes = new Uint8Array(await res.arrayBuffer());
    console.log(`  [CSV] ZIP: ${(zipBytes.length / 1024 / 1024).toFixed(2)} MB`);
  } catch (e) {
    console.log(`  [CSV] Falha no download: ${e}`);
    return { updated: 0, remaining: records, erros: [`CSV download: ${e}`], matchLog: [] };
  }

  let unzipped: Record<string, Uint8Array>;
  try {
    unzipped = unzipSync(zipBytes);
  } catch (e) {
    console.log(`  [CSV] Falha no unzip: ${e}`);
    return { updated: 0, remaining: records, erros: [`CSV unzip: ${e}`], matchLog: [] };
  }

  const csvFile = Object.keys(unzipped).find(f => f.toLowerCase().endsWith(".csv"));
  if (!csvFile) {
    return { updated: 0, remaining: records, erros: ["No CSV in ZIP"], matchLog: [] };
  }

  const csvBytes = unzipped[csvFile];
  let csvText = new TextDecoder("utf-8").decode(csvBytes);
  if (csvText.includes("�")) {
    csvText = new TextDecoder("latin1").decode(csvBytes);
  }

  const lines = csvText.split("\n");
  if (lines.length < 2) {
    return { updated: 0, remaining: records, erros: ["CSV vazio"], matchLog: [] };
  }

  // Parse header
  const headerCols = parseCSVLine(lines[0]);
  const h: Record<string, number> = {};
  for (let i = 0; i < headerCols.length; i++) {
    h[headerCols[i].replace(/"/g, "").trim().toUpperCase()] = i;
  }

  const dotInicialCol = h["ORÇAMENTO INICIAL (R$)"] ?? h["ORCAMENTO INICIAL (R$)"] ?? h["DOTAÇÃO INICIAL (R$)"] ?? h["DOTACAO INICIAL (R$)"] ?? -1;
  const dotAtualizadaCol = h["ORÇAMENTO ATUALIZADO (R$)"] ?? h["ORCAMENTO ATUALIZADO (R$)"] ?? h["DOTAÇÃO ATUALIZADA (R$)"] ?? h["DOTACAO ATUALIZADA (R$)"] ?? h["CRÉDITO DISPONÍVEL (R$)"] ?? -1;
  const codProgCol = h["CÓDIGO PROGRAMA ORÇAMENTÁRIO"] ?? h["CODIGO PROGRAMA ORÇAMENTÁRIO"] ?? h["CODIGO PROGRAMA ORCAMENTARIO"] ?? h["CÓDIGO PROGRAMA"] ?? h["CODIGO PROGRAMA"] ?? -1;
  const codAcaoCol = h["CÓDIGO AÇÃO"] ?? h["CODIGO AÇÃO"] ?? h["CODIGO ACAO"] ?? -1;

  console.log(`  [CSV] Columns: dotInicial=${dotInicialCol}, dotAtualizada=${dotAtualizadaCol}, codProg=${codProgCol}, codAcao=${codAcaoCol}`);

  if (dotInicialCol === -1 && dotAtualizadaCol === -1) {
    return { updated: 0, remaining: records, erros: ["Colunas de dotação não encontradas no CSV"], matchLog: [] };
  }
  if (codProgCol === -1) {
    return { updated: 0, remaining: records, erros: ["Coluna de código programa não encontrada"], matchLog: [] };
  }

  // Build index
  const dotIndex = new Map<string, { dotInicial: number; dotAtualizada: number }>();
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const cols = parseCSVLine(lines[i]);
    const codProg = codProgCol >= 0 ? cols[codProgCol]?.replace(/"/g, "").trim() : "";
    const codAcao = codAcaoCol >= 0 ? cols[codAcaoCol]?.replace(/"/g, "").trim() : "";
    if (!codProg) continue;

    const dotI = dotInicialCol >= 0 ? parseBRL(cols[dotInicialCol] || "") : null;
    const dotA = dotAtualizadaCol >= 0 ? parseBRL(cols[dotAtualizadaCol] || "") : null;

    for (const key of [`${codProg}|${codAcao}`, `${codProg}|`]) {
      const existing = dotIndex.get(key);
      if (existing) {
        if (dotI) existing.dotInicial += dotI;
        if (dotA) existing.dotAtualizada += dotA;
      } else {
        dotIndex.set(key, { dotInicial: dotI || 0, dotAtualizada: dotA || 0 });
      }
    }
  }

  console.log(`  [CSV] Indexado: ${dotIndex.size} chaves`);

  // Match
  const remaining: any[] = [];
  for (const rec of records) {
    const codProg = extractCodPrograma(rec.programa);
    const codAcao = extractCodAcao(rec.programa);

    if (!codProg) { remaining.push(rec); continue; }

    let dot = dotIndex.get(`${codProg}|${codAcao}`);
    let matchType = "exact";
    if (!dot || (dot.dotInicial === 0 && dot.dotAtualizada === 0)) {
      dot = dotIndex.get(`${codProg}|`);
      matchType = "prog-only";
    }
    if (!dot || (dot.dotInicial === 0 && dot.dotAtualizada === 0)) {
      remaining.push(rec);
      continue;
    }

    const updateData: Record<string, number | null> = {};
    if (dot.dotInicial > 0) updateData.dotacao_inicial = dot.dotInicial;
    if (dot.dotAtualizada > 0) updateData.dotacao_autorizada = dot.dotAtualizada;

    const pago = Number(rec.pago) || 0;
    const dotRef = dot.dotAtualizada || dot.dotInicial;
    if (dotRef > 0 && pago > 0) {
      updateData.percentual_execucao = Math.min(Math.round((pago / dotRef) * 10000) / 100, 99999.99);
    }
    if (Object.keys(updateData).length === 0) { remaining.push(rec); continue; }

    let { error: uErr } = await supabase.from("dados_orcamentarios").update(updateData).eq("id", rec.id);
    if (uErr && uErr.message.includes("numeric field overflow") && updateData.percentual_execucao != null) {
      delete updateData.percentual_execucao;
      const retry = await supabase.from("dados_orcamentarios").update(updateData).eq("id", rec.id);
      uErr = retry.error;
    }
    if (uErr) {
      erros.push(`CSV update ${rec.id}: ${uErr.message}`);
      remaining.push(rec);
    } else {
      updated++;
      if (matchLog.length < 3) matchLog.push(`${codProg}|${codAcao} (${matchType})`);
    }
  }

  console.log(`  [CSV] ${updated} atualizados, ${remaining.length} restantes`);
  return { updated, remaining, erros, matchLog };
}

// ===== ESTRATÉGIA 2: API por Programa/Ação =====
async function enrichViaAPI(
  records: any[],
  ano: number,
  supabase: any,
  apiKey: string,
): Promise<{ updated: number; noMatch: number; erros: string[]; matchLog: string[] }> {
  let updated = 0;
  let noMatch = 0;
  const erros: string[] = [];
  const matchLog: string[] = [];

  // Group records by codPrograma to minimize API calls
  const byProgram = new Map<string, any[]>();
  for (const rec of records) {
    const codProg = extractCodPrograma(rec.programa);
    if (!codProg) { noMatch++; continue; }
    const existing = byProgram.get(codProg) || [];
    existing.push(rec);
    byProgram.set(codProg, existing);
  }

  console.log(`  [API] ${byProgram.size} programas únicos a consultar para ${records.length} registros`);

  // For each unique program, query API (which DOES return dotação when filtered by programa)
  let progCount = 0;
  for (const [codProg, recs] of byProgram.entries()) {
    progCount++;
    // Fetch paginated data for this program+year
    const dotMap = new Map<string, { dotInicial: number; dotAtualizada: number }>();

    let page = 1;
    while (page <= 30) {
      const url = `${API_BASE}/despesas/por-funcional-programatica?ano=${ano}&codigoPrograma=${codProg}&pagina=${page}`;
      if (page === 1 && progCount <= 5) console.log(`  [API] ${url}`);

      try {
        const res = await fetch(url, {
          headers: { "chave-api-dados": apiKey, Accept: "application/json" },
        });

        if (res.status === 429) {
          console.log(`  [API] Rate limited, esperando 30s...`);
          await new Promise(r => setTimeout(r, 30000));
          continue;
        }
        if (!res.ok) {
          if (page === 1) erros.push(`API ${res.status} prog ${codProg}`);
          break;
        }

        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) break;

        for (const item of data) {
          const codAcao = item.codigoAcao || "";
          const dotI = parseBRLApi(item.dotacaoInicial || item.valorDotacaoInicial);
          const dotA = parseBRLApi(item.dotacaoAtualizada || item.valorDotacaoAtualizada);

          // Index by exact acao key and also prog-only
          for (const key of [codAcao, ""]) {
            const existing = dotMap.get(key);
            if (existing) {
              if (dotI) existing.dotInicial = Math.max(existing.dotInicial, dotI);
              if (dotA) existing.dotAtualizada = Math.max(existing.dotAtualizada, dotA);
            } else {
              dotMap.set(key, { dotInicial: dotI || 0, dotAtualizada: dotA || 0 });
            }
          }
        }

        if (data.length < 15) break;
        page++;
        await new Promise(r => setTimeout(r, 350));
      } catch (e) {
        erros.push(`API fetch prog ${codProg} p${page}: ${e}`);
        break;
      }
    }

    // Now match each record in this program
    for (const rec of recs) {
      const codAcao = extractCodAcao(rec.programa);

      let dot = dotMap.get(codAcao);
      let matchType = "api-exact";
      if (!dot || (dot.dotInicial === 0 && dot.dotAtualizada === 0)) {
        dot = dotMap.get("");
        matchType = "api-prog";
      }
      if (!dot || (dot.dotInicial === 0 && dot.dotAtualizada === 0)) {
        noMatch++;
        continue;
      }

      const updateData: Record<string, number | null> = {};
      if (dot.dotInicial > 0) updateData.dotacao_inicial = dot.dotInicial;
      if (dot.dotAtualizada > 0) updateData.dotacao_autorizada = dot.dotAtualizada;

      const pago = Number(rec.pago) || 0;
      const dotRef = dot.dotAtualizada || dot.dotInicial;
      if (dotRef > 0 && pago > 0) {
        updateData.percentual_execucao = Math.min(Math.round((pago / dotRef) * 10000) / 100, 99999.99);
      }
      if (Object.keys(updateData).length === 0) { noMatch++; continue; }

      let { error: uErr } = await supabase.from("dados_orcamentarios").update(updateData).eq("id", rec.id);
      if (uErr && uErr.message.includes("numeric field overflow") && updateData.percentual_execucao != null) {
        delete updateData.percentual_execucao;
        const retry = await supabase.from("dados_orcamentarios").update(updateData).eq("id", rec.id);
        uErr = retry.error;
      }
      if (uErr) {
        erros.push(`API update ${rec.id}: ${uErr.message}`);
      } else {
        updated++;
        if (matchLog.length < 5) matchLog.push(`${codProg}|${codAcao} (${matchType}): R$${((dot.dotAtualizada || dot.dotInicial)/1e6).toFixed(2)}mi`);
      }
    }

    // Delay between programs
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`  [API] ${updated} atualizados, ${noMatch} sem match`);
  return { updated, noMatch, erros, matchLog };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let ano = 2024;
    try {
      const body = await req.json();
      if (body.ano) ano = body.ano;
    } catch { /* defaults */ }

    const apiKey = Deno.env.get("PORTAL_TRANSPARENCIA_API_KEY") || "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    console.log(`\n=== ENRIQUECIMENTO DOTAÇÃO — ANO ${ano} (ESTRATÉGIA DUPLA) ===`);

    // Fetch records missing dotação
    const { data: records, error: qErr } = await supabase
      .from("dados_orcamentarios")
      .select("id, programa, pago")
      .eq("esfera", "federal")
      .eq("ano", ano)
      .is("dotacao_inicial", null)
      .is("dotacao_autorizada", null);

    if (qErr) {
      return new Response(
        JSON.stringify({ success: false, error: `Query error: ${qErr.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!records || records.length === 0) {
      return new Response(
        JSON.stringify({ success: true, ano, total_sem_dotacao: 0, atualizados: 0, message: "Todos os registros já possuem dotação" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`  ${records.length} registros sem dotação`);

    // ===== ESTRATÉGIA 1: CSV/LOA =====
    console.log(`\n--- Estratégia 1: CSV/LOA ---`);
    const csv = await enrichViaCSV(records, ano, supabase);

    // ===== ESTRATÉGIA 2: API por Programa (para registros restantes) =====
    let api = { updated: 0, noMatch: 0, erros: [] as string[], matchLog: [] as string[] };
    if (csv.remaining.length > 0 && apiKey) {
      console.log(`\n--- Estratégia 2: API por Programa (${csv.remaining.length} restantes) ---`);
      api = await enrichViaAPI(csv.remaining, ano, supabase, apiKey);
    } else if (csv.remaining.length > 0 && !apiKey) {
      console.log(`  [API] PORTAL_TRANSPARENCIA_API_KEY não configurada — pulando estratégia 2`);
    }

    const totalUpdated = csv.updated + api.updated;
    const totalErros = [...csv.erros, ...api.erros];

    console.log(`\n=== CONCLUÍDO ${ano}: ${totalUpdated}/${records.length} atualizados (CSV: ${csv.updated}, API: ${api.updated}) ===`);

    return new Response(
      JSON.stringify({
        success: true,
        ano,
        total_sem_dotacao: records.length,
        atualizados_csv: csv.updated,
        atualizados_api: api.updated,
        atualizados_total: totalUpdated,
        sem_match_final: api.noMatch,
        erros: totalErros.slice(0, 20),
        exemplos_csv: csv.matchLog,
        exemplos_api: api.matchLog,
        message: `Enriquecimento ${ano}: ${totalUpdated}/${records.length} (CSV: ${csv.updated}, API: ${api.updated})`,
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

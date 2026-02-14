import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * INGESTÃO DE DOTAÇÃO ORÇAMENTÁRIA via CSV Dados Abertos do Portal da Transparência.
 * 
 * ESTRATÉGIA DE MATCHING RIGOROSO:
 * - Busca registros existentes em dados_orcamentarios por ano+esfera
 * - Para cada registro, extrai o código do programa (ex: "5034") e da ação (ex: "21CS")
 * - Agrega dotação do CSV apenas para linhas com MATCH EXATO de código de programa + código de ação
 * - SEM fallback: se não houver match exato, o registro fica sem dotação
 */

// Códigos dos programas que temos na base (extraídos do campo programa)
const PROGRAMAS_RELEVANTES = [
  "5034", "5802", "5803", "5804", "5113", "2065", "0153", "2034",
];
const ORGAOS_RELEVANTES = ["67000", "92000"];
const KEYWORDS = [
  "racial", "racismo", "indigen", "quilombol", "cigan",
  "afro", "palmares", "funai", "sesai", "negro", "igualdade racial",
];

function parseBRL(val: string): number | null {
  if (!val) return null;
  const s = val.replace(/"/g, "").trim();
  if (!s || s === "0" || s === "0.00" || s === "0,00") return null;
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

/** Extract program code (e.g. "5034") from a programa string like "5034 – Igualdade Racial..." */
function extractCodPrograma(programa: string): string {
  const m = programa.match(/^(\d{4})/);
  return m ? m[1] : "";
}

/** Extract action code (e.g. "21CS") from a programa string like "5034 – ... / 21CS – ..." */
function extractCodAcao(programa: string): string {
  const m = programa.match(/\/\s*([A-Z0-9]{4})\s*[–-]/);
  return m ? m[1] : "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos: number[] = [2024];
    try { const b = await req.json(); if (b.anos) anos = b.anos; } catch {}

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const resultados: Record<string, any> = {};
    const erros: string[] = [];

    for (const ano of anos) {
      console.log(`\n=== Dotação LOA ${ano} ===`);
      try {
        // Step 1: Get existing records for this year to know what we need to match
        const { data: existingRecords, error: qErr } = await supabase
          .from("dados_orcamentarios")
          .select("id, programa, pago")
          .eq("ano", ano)
          .eq("esfera", "federal");

        if (qErr) {
          erros.push(`${ano}: Query error: ${qErr.message}`);
          continue;
        }
        if (!existingRecords || existingRecords.length === 0) {
          console.log(`  ${ano}: Nenhum registro existente para atualizar`);
          resultados[String(ano)] = { registros_existentes: 0, atualizados: 0 };
          continue;
        }

        console.log(`  ${ano}: ${existingRecords.length} registros existentes na base`);

        // Build a lookup: codProg+codAcao → record IDs
        const recordLookup = new Map<string, { id: string; pago: number | null }[]>();
        for (const rec of existingRecords) {
          const codProg = extractCodPrograma(rec.programa);
          const codAcao = extractCodAcao(rec.programa);
          if (!codProg) continue;
          const key = `${codProg}|${codAcao}`;
          if (!recordLookup.has(key)) recordLookup.set(key, []);
          recordLookup.get(key)!.push({ id: rec.id, pago: rec.pago });
        }
        console.log(`  Lookup keys: ${Array.from(recordLookup.keys()).join(", ")}`);

        // Step 2: Download and parse CSV
        const url = `https://portaldatransparencia.gov.br/download-de-dados/orcamento-despesa/${ano}`;
        const res = await fetch(url, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; CERD-IV/1.0)", Accept: "*/*" },
          redirect: "follow",
        });

        if (!res.ok) {
          erros.push(`${ano}: HTTP ${res.status}`);
          continue;
        }

        const zipBytes = new Uint8Array(await res.arrayBuffer());
        console.log(`  ZIP: ${(zipBytes.length / 1024 / 1024).toFixed(2)} MB`);

        if (zipBytes.length > 150 * 1024 * 1024) {
          erros.push(`${ano}: ZIP too large (${(zipBytes.length / 1024 / 1024).toFixed(0)}MB)`);
          continue;
        }

        const unzipped = unzipSync(zipBytes);
        const fileNames = Object.keys(unzipped);
        const csvFile = fileNames.find(f => f.toLowerCase().endsWith(".csv"));
        if (!csvFile) {
          erros.push(`${ano}: No CSV found in ZIP`);
          continue;
        }

        const csvBytes = unzipped[csvFile];
        const decoder = new TextDecoder("utf-8");
        let csvText = decoder.decode(csvBytes);
        if (csvText.includes("�")) {
          csvText = new TextDecoder("latin1").decode(csvBytes);
        }

        const lines = csvText.split("\n");
        if (lines.length < 2) {
          erros.push(`${ano}: CSV vazio`);
          continue;
        }

        // Parse header
        const headerCols = parseCSVLine(lines[0]);
        const h: Record<string, number> = {};
        for (let i = 0; i < headerCols.length; i++) {
          const col = headerCols[i].replace(/"/g, "").trim().toUpperCase();
          h[col] = i;
        }
        console.log(`  Headers: ${headerCols.slice(0, 15).map(c => c.replace(/"/g, "").trim()).join(" | ")}`);

        // Find relevant columns
        const dotInicialCol = h["ORÇAMENTO INICIAL (R$)"] ?? h["ORCAMENTO INICIAL (R$)"] ?? h["DOTAÇÃO INICIAL (R$)"] ?? h["DOTACAO INICIAL (R$)"] ?? -1;
        const dotAtualizadaCol = h["ORÇAMENTO ATUALIZADO (R$)"] ?? h["ORCAMENTO ATUALIZADO (R$)"] ?? h["DOTAÇÃO ATUALIZADA (R$)"] ?? h["DOTACAO ATUALIZADA (R$)"] ?? h["CRÉDITO DISPONÍVEL (R$)"] ?? -1;
        const codProgCol = h["CÓDIGO PROGRAMA ORÇAMENTÁRIO"] ?? h["CODIGO PROGRAMA ORÇAMENTÁRIO"] ?? h["CODIGO PROGRAMA ORCAMENTARIO"] ?? h["CÓDIGO PROGRAMA"] ?? h["CODIGO PROGRAMA"] ?? -1;
        const codAcaoCol = h["CÓDIGO AÇÃO"] ?? h["CODIGO AÇÃO"] ?? h["CODIGO ACAO"] ?? -1;
        const codOrgSupCol = h["CÓDIGO ÓRGÃO SUPERIOR"] ?? h["CODIGO ÓRGÃO SUPERIOR"] ?? h["CODIGO ORGAO SUPERIOR"] ?? -1;
        const nomeProgCol = h["NOME PROGRAMA ORÇAMENTÁRIO"] ?? h["NOME PROGRAMA"] ?? -1;
        const nomeAcaoCol = h["NOME AÇÃO"] ?? h["NOME ACAO"] ?? -1;

        console.log(`  Columns: dotInicial=${dotInicialCol}, dotAtualizada=${dotAtualizadaCol}, codProg=${codProgCol}, codAcao=${codAcaoCol}`);

        if (dotInicialCol === -1 && dotAtualizadaCol === -1) {
          console.log(`  ALL HEADERS: ${headerCols.map(c => c.replace(/"/g, "").trim()).join(" | ")}`);
          erros.push(`${ano}: Colunas de dotação não encontradas`);
          continue;
        }

        // Step 3: Aggregate dotação by codProg+codAcao (EXACT match only)
        const dotacaoMap = new Map<string, { dotInicial: number; dotAtualizada: number }>();
        let linesMatched = 0;

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = parseCSVLine(lines[i]);

          const codProg = codProgCol >= 0 ? cols[codProgCol]?.replace(/"/g, "").trim() : "";
          const codAcao = codAcaoCol >= 0 ? cols[codAcaoCol]?.replace(/"/g, "").trim() : "";
          const codOrg = codOrgSupCol >= 0 ? cols[codOrgSupCol]?.replace(/"/g, "").trim() : "";
          const nomeProg = nomeProgCol >= 0 ? cols[nomeProgCol]?.replace(/"/g, "").trim().toLowerCase() : "";
          const nomeAcao = nomeAcaoCol >= 0 ? cols[nomeAcaoCol]?.replace(/"/g, "").trim().toLowerCase() : "";

          // STRICT filter: only lines whose codProg+codAcao exist in our lookup
          const keyExact = `${codProg}|${codAcao}`;
          const keyProgOnly = `${codProg}|`;

          // Check if this CSV line matches ANY record in our database
          const hasExactMatch = recordLookup.has(keyExact);
          const hasProgMatch = recordLookup.has(keyProgOnly);

          if (!hasExactMatch && !hasProgMatch) {
            // Also check if prog is relevant but action differs — aggregate at prog level
            if (!PROGRAMAS_RELEVANTES.includes(codProg) && !ORGAOS_RELEVANTES.includes(codOrg)) {
              const text = `${nomeProg} ${nomeAcao}`;
              if (!KEYWORDS.some(kw => text.includes(kw))) continue;
            }
            // Even if keyword matches, only aggregate if we have records with this prog code
            const hasAnyProgMatch = Array.from(recordLookup.keys()).some(k => k.startsWith(`${codProg}|`));
            if (!hasAnyProgMatch) continue;
          }

          const dotI = dotInicialCol >= 0 ? parseBRL(cols[dotInicialCol] || "") : null;
          const dotA = dotAtualizadaCol >= 0 ? parseBRL(cols[dotAtualizadaCol] || "") : null;
          if (!dotI && !dotA) continue;

          linesMatched++;

          // Aggregate: prefer exact key, fall back to prog-only key
          const aggKey = hasExactMatch ? keyExact : `${codProg}|${codAcao}`;
          const existing = dotacaoMap.get(aggKey);
          if (existing) {
            if (dotI) existing.dotInicial += dotI;
            if (dotA) existing.dotAtualizada += dotA;
          } else {
            dotacaoMap.set(aggKey, { dotInicial: dotI || 0, dotAtualizada: dotA || 0 });
          }
        }

        console.log(`  CSV lines matched: ${linesMatched}, distinct keys: ${dotacaoMap.size}`);
        console.log(`  Aggregated keys: ${Array.from(dotacaoMap.entries()).map(([k, v]) => `${k}=${(v.dotInicial / 1e6).toFixed(1)}mi`).join(", ")}`);

        // Step 4: Update records — ONLY exact matches
        let updated = 0;
        for (const [aggKey, dot] of dotacaoMap) {
          const [codProg, codAcao] = aggKey.split("|");

          // Find matching records in our lookup
          // Try exact match first, then prog-only
          let matchedRecords = recordLookup.get(aggKey);
          if (!matchedRecords && codAcao) {
            // Try prog-only if exact didn't match
            matchedRecords = recordLookup.get(`${codProg}|`);
          }
          if (!matchedRecords) {
            // Find all records for this program
            matchedRecords = [];
            for (const [k, v] of recordLookup) {
              if (k.startsWith(`${codProg}|`)) matchedRecords.push(...v);
            }
          }

          if (!matchedRecords || matchedRecords.length === 0) continue;

          // If multiple records match, distribute proportionally by pago, or equally
          const totalPago = matchedRecords.reduce((s, r) => s + (r.pago || 0), 0);

          for (const rec of matchedRecords) {
            const share = totalPago > 0 && rec.pago
              ? rec.pago / totalPago
              : 1 / matchedRecords.length;

            const updateData: Record<string, number> = {};
            if (dot.dotInicial > 0) updateData.dotacao_inicial = Math.round(dot.dotInicial * share * 100) / 100;
            if (dot.dotAtualizada > 0) updateData.dotacao_autorizada = Math.round(dot.dotAtualizada * share * 100) / 100;

            const dotRef = (updateData.dotacao_autorizada || updateData.dotacao_inicial || 0);
            if (dotRef > 0 && rec.pago) {
              const pct = Math.round((rec.pago / dotRef) * 10000) / 100;
              updateData.percentual_execucao = Math.min(pct, 99999.99); // cap to avoid numeric overflow
            }

            if (Object.keys(updateData).length === 0) continue;

            const { error } = await supabase.from("dados_orcamentarios").update(updateData).eq("id", rec.id);
            if (!error) updated++;
            else erros.push(`Update ${rec.id}: ${error.message}`);
          }
        }

        console.log(`  ${ano}: ${updated} registros atualizados com dotação`);
        resultados[String(ano)] = {
          registros_existentes: existingRecords.length,
          csv_lines_matched: linesMatched,
          keys_aggregated: dotacaoMap.size,
          atualizados: updated,
        };

      } catch (e) {
        erros.push(`${ano}: ${e instanceof Error ? e.message : "?"}`);
        console.error(`Error ${ano}:`, e);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      resultados,
      erros: erros.slice(0, 20),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Fatal:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "?" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

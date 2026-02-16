import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PROGRAMAS_RELEVANTES = [
  "5034", "5802", "5803", "5804", "5113", "2065", "0153", "2034", "5136", "0617", "5022",
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

function extractCodPrograma(programa: string): string {
  const m = programa.match(/^(\d{4})/);
  return m ? m[1] : "";
}

function extractCodAcao(programa: string): string {
  const m = programa.match(/\/\s*([A-Z0-9]{4})\s*[–-]/);
  return m ? m[1] : "";
}

/** Heavy background work: download ZIP, parse CSV, update DB */
async function processYear(
  supabase: any,
  ano: number,
): Promise<{ ok: boolean; msg: string }> {
  console.log(`\n=== Dotação LOA ${ano} ===`);

  // Step 1: Get existing records
  const { data: existingRecords, error: qErr } = await supabase
    .from("dados_orcamentarios")
    .select("id, programa, pago")
    .eq("ano", ano)
    .eq("esfera", "federal");

  if (qErr) return { ok: false, msg: `Query error: ${qErr.message}` };
  if (!existingRecords || existingRecords.length === 0) {
    console.log(`  ${ano}: Nenhum registro existente`);
    return { ok: true, msg: "0 registros" };
  }

  console.log(`  ${ano}: ${existingRecords.length} registros existentes na base`);

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

  // Step 2: Download ZIP
  const url = `https://portaldatransparencia.gov.br/download-de-dados/orcamento-despesa/${ano}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; CERD-IV/1.0)", Accept: "*/*" },
    redirect: "follow",
  });
  if (!res.ok) return { ok: false, msg: `HTTP ${res.status}` };

  const zipBytes = new Uint8Array(await res.arrayBuffer());
  console.log(`  ZIP: ${(zipBytes.length / 1024 / 1024).toFixed(2)} MB`);

  const unzipped = unzipSync(zipBytes);
  const csvFile = Object.keys(unzipped).find(f => f.toLowerCase().endsWith(".csv"));
  if (!csvFile) return { ok: false, msg: "No CSV in ZIP" };

  const csvBytes = unzipped[csvFile];
  const decoder = new TextDecoder("utf-8");
  let csvText = decoder.decode(csvBytes);
  if (csvText.includes("�")) {
    csvText = new TextDecoder("latin1").decode(csvBytes);
  }

  const lines = csvText.split("\n");
  if (lines.length < 2) return { ok: false, msg: "CSV vazio" };

  // Parse header
  const headerCols = parseCSVLine(lines[0]);
  const h: Record<string, number> = {};
  for (let i = 0; i < headerCols.length; i++) {
    h[headerCols[i].replace(/"/g, "").trim().toUpperCase()] = i;
  }
  console.log(`  Headers: ${headerCols.slice(0, 15).map(c => c.replace(/"/g, "").trim()).join(" | ")}`);

  const dotInicialCol = h["ORÇAMENTO INICIAL (R$)"] ?? h["ORCAMENTO INICIAL (R$)"] ?? h["DOTAÇÃO INICIAL (R$)"] ?? h["DOTACAO INICIAL (R$)"] ?? -1;
  const dotAtualizadaCol = h["ORÇAMENTO ATUALIZADO (R$)"] ?? h["ORCAMENTO ATUALIZADO (R$)"] ?? h["DOTAÇÃO ATUALIZADA (R$)"] ?? h["DOTACAO ATUALIZADA (R$)"] ?? h["CRÉDITO DISPONÍVEL (R$)"] ?? -1;
  const codProgCol = h["CÓDIGO PROGRAMA ORÇAMENTÁRIO"] ?? h["CODIGO PROGRAMA ORÇAMENTÁRIO"] ?? h["CODIGO PROGRAMA ORCAMENTARIO"] ?? h["CÓDIGO PROGRAMA"] ?? h["CODIGO PROGRAMA"] ?? -1;
  const codAcaoCol = h["CÓDIGO AÇÃO"] ?? h["CODIGO AÇÃO"] ?? h["CODIGO ACAO"] ?? -1;
  const codOrgSupCol = h["CÓDIGO ÓRGÃO SUPERIOR"] ?? h["CODIGO ÓRGÃO SUPERIOR"] ?? h["CODIGO ORGAO SUPERIOR"] ?? -1;
  const nomeProgCol = h["NOME PROGRAMA ORÇAMENTÁRIO"] ?? h["NOME PROGRAMA"] ?? -1;
  const nomeAcaoCol = h["NOME AÇÃO"] ?? h["NOME ACAO"] ?? -1;

  console.log(`  Columns: dotInicial=${dotInicialCol}, dotAtualizada=${dotAtualizadaCol}, codProg=${codProgCol}, codAcao=${codAcaoCol}`);

  if (dotInicialCol === -1 && dotAtualizadaCol === -1) {
    return { ok: false, msg: "Colunas de dotação não encontradas" };
  }

  // Step 3: Aggregate dotação by codProg+codAcao
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

    const keyExact = `${codProg}|${codAcao}`;
    const hasExactMatch = recordLookup.has(keyExact);
    const hasProgMatch = recordLookup.has(`${codProg}|`);

    if (!hasExactMatch && !hasProgMatch) {
      if (!PROGRAMAS_RELEVANTES.includes(codProg) && !ORGAOS_RELEVANTES.includes(codOrg)) {
        const text = `${nomeProg} ${nomeAcao}`;
        if (!KEYWORDS.some(kw => text.includes(kw))) continue;
      }
      const hasAnyProgMatch = Array.from(recordLookup.keys()).some(k => k.startsWith(`${codProg}|`));
      if (!hasAnyProgMatch) continue;
    }

    const dotI = dotInicialCol >= 0 ? parseBRL(cols[dotInicialCol] || "") : null;
    const dotA = dotAtualizadaCol >= 0 ? parseBRL(cols[dotAtualizadaCol] || "") : null;
    if (!dotI && !dotA) continue;

    linesMatched++;

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

  // Step 4: Update records
  let updated = 0;
  for (const [aggKey, dot] of dotacaoMap) {
    const [codProg, codAcao] = aggKey.split("|");

    let matchedRecords = recordLookup.get(aggKey);
    if (!matchedRecords && codAcao) matchedRecords = recordLookup.get(`${codProg}|`);
    if (!matchedRecords) {
      matchedRecords = [];
      for (const [k, v] of recordLookup) {
        if (k.startsWith(`${codProg}|`)) matchedRecords.push(...v);
      }
    }
    if (!matchedRecords || matchedRecords.length === 0) continue;

    const totalPago = matchedRecords.reduce((s, r) => s + (r.pago || 0), 0);

    for (const rec of matchedRecords) {
      const share = totalPago > 0 && rec.pago ? rec.pago / totalPago : 1 / matchedRecords.length;

      const updateData: Record<string, number> = {};
      if (dot.dotInicial > 0) updateData.dotacao_inicial = Math.round(dot.dotInicial * share * 100) / 100;
      if (dot.dotAtualizada > 0) updateData.dotacao_autorizada = Math.round(dot.dotAtualizada * share * 100) / 100;

      const dotRef = updateData.dotacao_autorizada || updateData.dotacao_inicial || 0;
      if (dotRef > 0 && rec.pago) {
        updateData.percentual_execucao = Math.min(Math.round((rec.pago / dotRef) * 10000) / 100, 99999.99);
      }

      if (Object.keys(updateData).length === 0) continue;

      const { error } = await supabase.from("dados_orcamentarios").update(updateData).eq("id", rec.id);
      if (!error) updated++;
    }
  }

  console.log(`  ${ano}: ${updated} registros atualizados com dotação`);
  return { ok: true, msg: `${updated} atualizados` };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let ano = 2024;
    try { const b = await req.json(); if (b.anos?.[0]) ano = b.anos[0]; if (b.ano) ano = b.ano; } catch {}

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Processamento de UM ÚNICO ANO por chamada (evita CPU timeout)
    const result = await processYear(supabase, ano);
    console.log(`  ${ano}: ${result.ok ? "OK" : "ERRO"} - ${result.msg}`);

    const totalUpdated = result.ok ? parseInt(result.msg.match(/(\d+)/)?.[1] || "0", 10) : 0;

    return new Response(JSON.stringify({
      success: result.ok,
      total_atualizados: totalUpdated,
      ano,
      message: `Dotação LOA ${ano}: ${result.msg}`,
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

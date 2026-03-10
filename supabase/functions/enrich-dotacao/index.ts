import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ================================================================
 * ENRIQUECIMENTO DE DOTAÇÃO — VIA CSV/LOA (Dados Abertos)
 * ================================================================
 *
 * O endpoint API `despesas/por-funcional-programatica` NÃO retorna
 * campos de dotação. A única fonte é o CSV/ZIP da LOA dos Dados Abertos.
 *
 * Esta função melhora o matching do ingest-dotacao-loa original:
 * 1. Baixa o ZIP da LOA do ano
 * 2. Indexa TODAS as linhas por codPrograma|codAcao
 * 3. Para cada registro sem dotação na base, busca match direto
 * 4. Atualiza dotacao_inicial, dotacao_autorizada e percentual_execucao
 *
 * Processa UM ANO por chamada para evitar timeouts.
 * ================================================================
 */

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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    console.log(`\n=== ENRIQUECIMENTO DOTAÇÃO LOA — ANO ${ano} ===`);

    // Step 1: Fetch records missing dotação
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

    // Step 2: Download ZIP from Portal de Dados Abertos
    const url = `https://portaldatransparencia.gov.br/download-de-dados/orcamento-despesa/${ano}`;
    console.log(`  Baixando ZIP: ${url}`);

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; CERD-IV/1.0)", Accept: "*/*" },
      redirect: "follow",
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `HTTP ${res.status} ao baixar ZIP` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const zipBytes = new Uint8Array(await res.arrayBuffer());
    console.log(`  ZIP: ${(zipBytes.length / 1024 / 1024).toFixed(2)} MB`);

    const unzipped = unzipSync(zipBytes);
    const csvFile = Object.keys(unzipped).find(f => f.toLowerCase().endsWith(".csv"));
    if (!csvFile) {
      return new Response(
        JSON.stringify({ success: false, error: "No CSV in ZIP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Decode CSV
    const csvBytes = unzipped[csvFile];
    let csvText = new TextDecoder("utf-8").decode(csvBytes);
    if (csvText.includes("�")) {
      csvText = new TextDecoder("latin1").decode(csvBytes);
    }

    const lines = csvText.split("\n");
    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "CSV vazio" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 3: Parse header and find column indices
    const headerCols = parseCSVLine(lines[0]);
    const h: Record<string, number> = {};
    for (let i = 0; i < headerCols.length; i++) {
      h[headerCols[i].replace(/"/g, "").trim().toUpperCase()] = i;
    }

    const dotInicialCol = h["ORÇAMENTO INICIAL (R$)"] ?? h["ORCAMENTO INICIAL (R$)"] ?? h["DOTAÇÃO INICIAL (R$)"] ?? h["DOTACAO INICIAL (R$)"] ?? -1;
    const dotAtualizadaCol = h["ORÇAMENTO ATUALIZADO (R$)"] ?? h["ORCAMENTO ATUALIZADO (R$)"] ?? h["DOTAÇÃO ATUALIZADA (R$)"] ?? h["DOTACAO ATUALIZADA (R$)"] ?? h["CRÉDITO DISPONÍVEL (R$)"] ?? -1;
    const codProgCol = h["CÓDIGO PROGRAMA ORÇAMENTÁRIO"] ?? h["CODIGO PROGRAMA ORÇAMENTÁRIO"] ?? h["CODIGO PROGRAMA ORCAMENTARIO"] ?? h["CÓDIGO PROGRAMA"] ?? h["CODIGO PROGRAMA"] ?? -1;
    const codAcaoCol = h["CÓDIGO AÇÃO"] ?? h["CODIGO AÇÃO"] ?? h["CODIGO ACAO"] ?? -1;

    console.log(`  Columns: dotInicial=${dotInicialCol}, dotAtualizada=${dotAtualizadaCol}, codProg=${codProgCol}, codAcao=${codAcaoCol}`);
    console.log(`  Headers sample: ${headerCols.slice(0, 20).map(c => c.replace(/"/g, "").trim()).join(" | ")}`);

    if (dotInicialCol === -1 && dotAtualizadaCol === -1) {
      return new Response(
        JSON.stringify({ success: false, error: "Colunas de dotação não encontradas no CSV", headers: headerCols.map(c => c.replace(/"/g, "").trim()) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (codProgCol === -1) {
      return new Response(
        JSON.stringify({ success: false, error: "Coluna de código programa não encontrada", headers: headerCols.map(c => c.replace(/"/g, "").trim()) }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Step 4: Build dotação index from CSV — key: codProg|codAcao → aggregated dotação
    const dotIndex = new Map<string, { dotInicial: number; dotAtualizada: number }>();

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const cols = parseCSVLine(lines[i]);

      const codProg = codProgCol >= 0 ? cols[codProgCol]?.replace(/"/g, "").trim() : "";
      const codAcao = codAcaoCol >= 0 ? cols[codAcaoCol]?.replace(/"/g, "").trim() : "";
      if (!codProg) continue;

      const dotI = dotInicialCol >= 0 ? parseBRL(cols[dotInicialCol] || "") : null;
      const dotA = dotAtualizadaCol >= 0 ? parseBRL(cols[dotAtualizadaCol] || "") : null;

      // Index by exact key (prog|acao) AND by prog-only key (prog|)
      for (const key of [`${codProg}|${codAcao}`, `${codProg}|`]) {
        const existing = dotIndex.get(key);
        if (existing) {
          // SUM dotação across localizadores for same prog|acao
          if (dotI) existing.dotInicial += dotI;
          if (dotA) existing.dotAtualizada += dotA;
        } else {
          dotIndex.set(key, {
            dotInicial: dotI || 0,
            dotAtualizada: dotA || 0,
          });
        }
      }
    }

    console.log(`  CSV indexado: ${dotIndex.size} chaves (prog|acao + prog-only)`);

    // Step 5: Match records against CSV index
    let updated = 0;
    let noMatch = 0;
    const erros: string[] = [];
    const matchLog: string[] = [];

    for (const rec of records) {
      const codProg = extractCodPrograma(rec.programa);
      const codAcao = extractCodAcao(rec.programa);

      if (!codProg) {
        noMatch++;
        continue;
      }

      // Try exact match first, then prog-only
      let dot = dotIndex.get(`${codProg}|${codAcao}`);
      let matchType = "exact";
      if (!dot || (dot.dotInicial === 0 && dot.dotAtualizada === 0)) {
        dot = dotIndex.get(`${codProg}|`);
        matchType = "prog-only";
      }

      if (!dot || (dot.dotInicial === 0 && dot.dotAtualizada === 0)) {
        noMatch++;
        if (noMatch <= 5) console.log(`    No match: ${codProg}|${codAcao} (${rec.programa.substring(0, 50)})`);
        continue;
      }

      const updateData: Record<string, number | null> = {};
      if (dot.dotInicial > 0) updateData.dotacao_inicial = dot.dotInicial;
      if (dot.dotAtualizada > 0) updateData.dotacao_autorizada = dot.dotAtualizada;

      // Recalculate percentual_execucao
      const pago = Number(rec.pago) || 0;
      const dotRef = dot.dotAtualizada || dot.dotInicial;
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
        .eq("id", rec.id);

      if (uErr) {
        erros.push(`Update ${rec.id}: ${uErr.message}`);
      } else {
        updated++;
        if (matchLog.length < 5) {
          matchLog.push(`${codProg}|${codAcao} (${matchType}): R$ ${(dot.dotInicial/1e6).toFixed(2)}mi ini / R$ ${(dot.dotAtualizada/1e6).toFixed(2)}mi aut`);
        }
      }
    }

    console.log(`\n=== CONCLUÍDO ${ano}: ${updated} atualizados, ${noMatch} sem match, ${erros.length} erros ===`);
    if (matchLog.length > 0) console.log(`  Exemplos: ${matchLog.join(" | ")}`);

    return new Response(
      JSON.stringify({
        success: true,
        ano,
        total_sem_dotacao: records.length,
        atualizados: updated,
        sem_match: noMatch,
        erros: erros.slice(0, 20),
        exemplos_match: matchLog,
        message: `Enriquecimento ${ano}: ${updated}/${records.length} registros atualizados com dotação LOA`,
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

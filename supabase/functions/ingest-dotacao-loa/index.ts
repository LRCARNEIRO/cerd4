import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * INGESTÃO DE DOTAÇÃO ORÇAMENTÁRIA via CSV Dados Abertos do Portal da Transparência.
 * O Portal retorna um ZIP contendo CSV com dotação inicial e atualizada.
 * Esta função faz UPDATE nos registros existentes em dados_orcamentarios.
 */

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

        // Decompress ZIP
        const unzipped = unzipSync(zipBytes);
        const fileNames = Object.keys(unzipped);
        console.log(`  Files in ZIP: ${fileNames.join(", ")}`);

        // Find the CSV file
        const csvFile = fileNames.find(f => f.toLowerCase().endsWith(".csv"));
        if (!csvFile) {
          erros.push(`${ano}: No CSV found in ZIP (files: ${fileNames.join(", ")})`);
          continue;
        }

        const csvBytes = unzipped[csvFile];
        const decoder = new TextDecoder("utf-8");
        let csvText = decoder.decode(csvBytes);
        
        // Try latin1 if UTF-8 produces garbage
        if (csvText.includes("�")) {
          const latin1Decoder = new TextDecoder("latin1");
          csvText = latin1Decoder.decode(csvBytes);
        }

        console.log(`  CSV ${csvFile}: ${csvText.length} chars`);

        const lines = csvText.split("\n");
        if (lines.length < 2) {
          erros.push(`${ano}: CSV vazio`);
          continue;
        }

        // Parse header - find column indices
        const headerCols = parseCSVLine(lines[0]);
        const h: Record<string, number> = {};
        for (let i = 0; i < headerCols.length; i++) {
          const col = headerCols[i].replace(/"/g, "").trim().toUpperCase();
          h[col] = i;
        }
        console.log(`  Headers (${headerCols.length}): ${headerCols.slice(0, 15).map(c => c.replace(/"/g, "").trim()).join(" | ")}`);

        // Identify dotação columns
        const dotInicialCol = h["ORÇAMENTO INICIAL (R$)"] ?? h["ORCAMENTO INICIAL (R$)"] ?? h["DOTAÇÃO INICIAL (R$)"] ?? h["DOTACAO INICIAL (R$)"] ?? -1;
        const dotAtualizadaCol = h["ORÇAMENTO ATUALIZADO (R$)"] ?? h["ORCAMENTO ATUALIZADO (R$)"] ?? h["DOTAÇÃO ATUALIZADA (R$)"] ?? h["DOTACAO ATUALIZADA (R$)"] ?? h["CRÉDITO DISPONÍVEL (R$)"] ?? -1;
        const codProgCol = h["CÓDIGO PROGRAMA"] ?? h["CODIGO PROGRAMA"] ?? -1;
        const codAcaoCol = h["CÓDIGO AÇÃO"] ?? h["CODIGO AÇÃO"] ?? h["CODIGO ACAO"] ?? -1;
        const codOrgSupCol = h["CÓDIGO ÓRGÃO SUPERIOR"] ?? h["CODIGO ÓRGÃO SUPERIOR"] ?? h["CODIGO ORGAO SUPERIOR"] ?? -1;
        const nomeProgCol = h["NOME PROGRAMA"] ?? -1;
        const nomeAcaoCol = h["NOME AÇÃO"] ?? h["NOME ACAO"] ?? -1;

        console.log(`  Columns: dotInicial=${dotInicialCol}, dotAtualizada=${dotAtualizadaCol}, codProg=${codProgCol}, codAcao=${codAcaoCol}, codOrg=${codOrgSupCol}`);

        if (dotInicialCol === -1 && dotAtualizadaCol === -1) {
          // Log all headers for debugging
          console.log(`  ALL HEADERS: ${headerCols.map(c => c.replace(/"/g, "").trim()).join(" | ")}`);
          erros.push(`${ano}: Colunas de dotação não encontradas`);
          continue;
        }

        // Aggregate dotação by programa+ação
        const dotacaoMap = new Map<string, { dotInicial: number; dotAtualizada: number }>();
        let matched = 0;

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const cols = parseCSVLine(lines[i]);

          const codProg = codProgCol >= 0 ? cols[codProgCol]?.replace(/"/g, "").trim() : "";
          const codAcao = codAcaoCol >= 0 ? cols[codAcaoCol]?.replace(/"/g, "").trim() : "";
          const codOrg = codOrgSupCol >= 0 ? cols[codOrgSupCol]?.replace(/"/g, "").trim() : "";
          const nomeProg = nomeProgCol >= 0 ? cols[nomeProgCol]?.replace(/"/g, "").trim().toLowerCase() : "";
          const nomeAcao = nomeAcaoCol >= 0 ? cols[nomeAcaoCol]?.replace(/"/g, "").trim().toLowerCase() : "";

          // Filter relevance
          const isRelProg = PROGRAMAS_RELEVANTES.includes(codProg);
          const isRelOrg = ORGAOS_RELEVANTES.includes(codOrg);
          if (!isRelProg && !isRelOrg) {
            const text = `${nomeProg} ${nomeAcao}`;
            if (!KEYWORDS.some(kw => text.includes(kw))) continue;
          }

          const dotI = dotInicialCol >= 0 ? parseBRL(cols[dotInicialCol] || "") : null;
          const dotA = dotAtualizadaCol >= 0 ? parseBRL(cols[dotAtualizadaCol] || "") : null;
          if (!dotI && !dotA) continue;

          matched++;
          const key = `${codProg}|${codAcao}`;
          const existing = dotacaoMap.get(key);
          if (existing) {
            if (dotI) existing.dotInicial += dotI;
            if (dotA) existing.dotAtualizada += dotA;
          } else {
            dotacaoMap.set(key, { dotInicial: dotI || 0, dotAtualizada: dotA || 0 });
          }
        }

        console.log(`  Relevantes: ${matched} linhas, ${dotacaoMap.size} programa/ação distintos`);

        // Update existing records
        let updated = 0;
        for (const [key, dot] of dotacaoMap) {
          const [codProg, codAcao] = key.split("|");
          
          // Match: programa starts with codProg and optionally contains codAcao
          const pattern = codAcao 
            ? `${codProg}%${codAcao}%` 
            : `${codProg}%`;

          const { data: records, error: qErr } = await supabase
            .from("dados_orcamentarios")
            .select("id, pago")
            .eq("ano", ano)
            .eq("esfera", "federal")
            .ilike("programa", pattern)
            .limit(10);

          if (qErr) {
            console.log(`  Query error for ${pattern}: ${qErr.message}`);
            // Fallback: try without codAcao
            if (codAcao) {
              const { data: fallback } = await supabase
                .from("dados_orcamentarios")
                .select("id, pago")
                .eq("ano", ano)
                .eq("esfera", "federal")
                .ilike("programa", `${codProg}%`)
                .limit(10);
              if (fallback && fallback.length > 0) {
                for (const rec of fallback) {
                  const updateData: any = {};
                  if (dot.dotInicial > 0) updateData.dotacao_inicial = dot.dotInicial;
                  if (dot.dotAtualizada > 0) updateData.dotacao_autorizada = dot.dotAtualizada;
                  const dotRef = dot.dotAtualizada || dot.dotInicial;
                  if (dotRef > 0 && rec.pago) updateData.percentual_execucao = Math.round((rec.pago / dotRef) * 10000) / 100;
                  const { error } = await supabase.from("dados_orcamentarios").update(updateData).eq("id", rec.id);
                  if (!error) updated++;
                }
              }
            }
            continue;
          }

          if (records && records.length > 0) {
            for (const rec of records) {
              const updateData: any = {};
              if (dot.dotInicial > 0) updateData.dotacao_inicial = dot.dotInicial;
              if (dot.dotAtualizada > 0) updateData.dotacao_autorizada = dot.dotAtualizada;
              
              const dotRef = dot.dotAtualizada || dot.dotInicial;
              if (dotRef > 0 && rec.pago) {
                updateData.percentual_execucao = Math.round((rec.pago / dotRef) * 10000) / 100;
              }

              const { error } = await supabase
                .from("dados_orcamentarios")
                .update(updateData)
                .eq("id", rec.id);
              
              if (!error) updated++;
              else erros.push(`Update ${rec.id}: ${error.message}`);
            }
          } else if (codAcao) {
            // No match with action code, try just program code
            const { data: fallback } = await supabase
              .from("dados_orcamentarios")
              .select("id, pago")
              .eq("ano", ano)
              .eq("esfera", "federal")
              .ilike("programa", `${codProg}%`)
              .is("dotacao_inicial", null)
              .limit(5);
            
            if (fallback && fallback.length > 0) {
              // Distribute dotação equally among matching records without dotação
              for (const rec of fallback) {
                const updateData: any = {};
                if (dot.dotInicial > 0) updateData.dotacao_inicial = dot.dotInicial;
                if (dot.dotAtualizada > 0) updateData.dotacao_autorizada = dot.dotAtualizada;
                const dotRef = dot.dotAtualizada || dot.dotInicial;
                if (dotRef > 0 && rec.pago) updateData.percentual_execucao = Math.round((rec.pago / dotRef) * 10000) / 100;
                const { error } = await supabase.from("dados_orcamentarios").update(updateData).eq("id", rec.id);
                if (!error) updated++;
              }
            }
          }
        }

        console.log(`  ${ano}: ${updated} registros atualizados com dotação`);
        resultados[String(ano)] = { linhas_csv: lines.length - 1, relevantes: matched, agrupados: dotacaoMap.size, atualizados: updated };

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

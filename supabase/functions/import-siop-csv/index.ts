import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Importa CSV do SIOP (Painel do Orçamento) e enriquece dados_orcamentarios
 * com dotação autorizada/inicial.
 *
 * O CSV do SIOP (exportado via "Exportar… → CSV") tipicamente contém colunas como:
 * - Exercício, Programa, Ação, Órgão Superior, Dotação Inicial, Dotação Atualizada,
 *   Empenhado, Liquidado, Pago, etc.
 *
 * O sistema tenta mapear automaticamente as colunas pelo nome/conteúdo.
 */

// Normalize header names for matching
function normalizeHeader(h: string): string {
  return h
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .trim();
}

// Parse numeric value (handles Brazilian format: 1.234.567,89)
function parseNum(val: string | undefined): number | null {
  if (!val) return null;
  const s = val.trim().replace(/"/g, "");
  if (!s || s === "-" || s === "0" || s === "0,00") return null;
  const num = Number(s.replace(/\./g, "").replace(",", "."));
  return isNaN(num) || num === 0 ? null : num;
}

// Try to detect delimiter (comma, semicolon, or tab)
function detectDelimiter(firstLine: string): string {
  const counts = {
    ";": (firstLine.match(/;/g) || []).length,
    ",": (firstLine.match(/,/g) || []).length,
    "\t": (firstLine.match(/\t/g) || []).length,
  };
  if (counts[";"] >= counts[","] && counts[";"] >= counts["\t"]) return ";";
  if (counts["\t"] >= counts[","] && counts["\t"] >= counts[";"]) return "\t";
  return ",";
}

// Parse a single CSV line respecting quotes
function parseCsvLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

interface ColumnMap {
  exercicio: number;
  programa: number;
  acao: number;
  orgao: number;
  dotacao_inicial: number;
  dotacao_atualizada: number;
  empenhado: number;
  liquidado: number;
  pago: number;
}

// Patterns for column detection
const COL_PATTERNS: Record<keyof ColumnMap, RegExp[]> = {
  exercicio: [/exerc/, /ano/],
  programa: [/programa/, /prog/],
  acao: [/^acao$/, /acao_/, /acao /, /^a..o$/],
  orgao: [/orgao/, /orgao_sup/, /unidade/],
  dotacao_inicial: [/dotacao_inic/, /dot_inic/, /credito_inic/],
  dotacao_atualizada: [/dotacao_atualiz/, /dot_atualiz/, /credito_atual/, /dotacao_autor/],
  empenhado: [/empenh/],
  liquidado: [/liquid/],
  pago: [/pago/, /pagamento/],
};

function detectColumns(headers: string[]): Partial<ColumnMap> {
  const normalized = headers.map(normalizeHeader);
  const map: Partial<ColumnMap> = {};

  for (const [field, patterns] of Object.entries(COL_PATTERNS)) {
    for (let i = 0; i < normalized.length; i++) {
      if (patterns.some(p => p.test(normalized[i]))) {
        (map as any)[field] = i;
        break;
      }
    }
  }
  return map;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { csvContent, mode, filterProgramas } = await req.json();

    if (!csvContent || typeof csvContent !== "string") {
      return new Response(
        JSON.stringify({ success: false, error: "csvContent é obrigatório (string)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Parse CSV
    const lines = csvContent.split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: "CSV deve ter ao menos cabeçalho + 1 linha de dados" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const delimiter = detectDelimiter(lines[0]);
    const headers = parseCsvLine(lines[0], delimiter);
    const colMap = detectColumns(headers);

    console.log(`CSV: ${lines.length} linhas, delimiter='${delimiter}'`);
    console.log(`Headers: ${headers.join(" | ")}`);
    console.log(`Colunas detectadas: ${JSON.stringify(colMap)}`);

    if (colMap.exercicio === undefined && colMap.programa === undefined) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Não foi possível detectar colunas obrigatórias (Exercício, Programa)",
          headers_encontrados: headers,
          dica: "Certifique-se de exportar o CSV pelo Painel do Orçamento do SIOP com as colunas padrão.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Parse rows
    const parsed: any[] = [];
    const programasCodigos = filterProgramas || ["5034", "5803", "2065", "0153"];

    for (let i = 1; i < lines.length; i++) {
      const cells = parseCsvLine(lines[i], delimiter);
      if (cells.length < 3) continue;

      const exercicio = colMap.exercicio !== undefined ? cells[colMap.exercicio]?.trim() : null;
      const programaRaw = colMap.programa !== undefined ? cells[colMap.programa]?.trim() : null;
      const acaoRaw = colMap.acao !== undefined ? cells[colMap.acao]?.trim() : null;
      const orgaoRaw = colMap.orgao !== undefined ? cells[colMap.orgao]?.trim() : null;

      if (!exercicio || !programaRaw) continue;

      const ano = parseInt(exercicio);
      if (isNaN(ano) || ano < 2000 || ano > 2030) continue;

      // Extract program code (first 4 digits)
      const codProgMatch = programaRaw.match(/^(\d{4})/);
      const codProg = codProgMatch ? codProgMatch[1] : null;

      // Filter by relevant programs if specified
      if (codProg && programasCodigos.length > 0 && !programasCodigos.includes(codProg)) continue;

      const dotInicial = colMap.dotacao_inicial !== undefined ? parseNum(cells[colMap.dotacao_inicial]) : null;
      const dotAtualizada = colMap.dotacao_atualizada !== undefined ? parseNum(cells[colMap.dotacao_atualizada]) : null;
      const empenhado = colMap.empenhado !== undefined ? parseNum(cells[colMap.empenhado]) : null;
      const liquidado = colMap.liquidado !== undefined ? parseNum(cells[colMap.liquidado]) : null;
      const pago = colMap.pago !== undefined ? parseNum(cells[colMap.pago]) : null;

      if (!dotInicial && !dotAtualizada && !empenhado && !liquidado && !pago) continue;

      let programa = programaRaw;
      if (acaoRaw) programa += ` / ${acaoRaw}`;

      parsed.push({
        ano,
        programa: programa.substring(0, 250),
        cod_programa: codProg,
        orgao: orgaoRaw || "N/D",
        dotacao_inicial: dotInicial,
        dotacao_autorizada: dotAtualizada,
        empenhado,
        liquidado,
        pago,
      });
    }

    console.log(`Parsed: ${parsed.length} registros válidos`);

    // Preview mode: return parsed data without inserting
    if (mode === "preview") {
      return new Response(
        JSON.stringify({
          success: true,
          mode: "preview",
          total_linhas: lines.length - 1,
          registros_validos: parsed.length,
          colunas_detectadas: Object.fromEntries(
            Object.entries(colMap).map(([k, v]) => [k, v !== undefined ? headers[v as number] : null])
          ),
          amostra: parsed.slice(0, 10),
          anos: [...new Set(parsed.map(r => r.ano))].sort(),
          programas: [...new Set(parsed.map(r => r.cod_programa).filter(Boolean))],
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Import mode: upsert into dados_orcamentarios
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    let updated = 0;
    let inserted = 0;
    let skipped = 0;
    const erros: string[] = [];

    for (const row of parsed) {
      // Try to find existing record by programa pattern + ano
      const searchTerm = row.cod_programa || row.programa.substring(0, 20);
      
      const { data: existing } = await supabase
        .from("dados_orcamentarios")
        .select("id, dotacao_autorizada, dotacao_inicial")
        .eq("ano", row.ano)
        .eq("esfera", "federal")
        .ilike("programa", `%${searchTerm}%`)
        .limit(1);

      if (existing && existing.length > 0) {
        // Update existing record with dotação data
        const updates: any = {};
        if (row.dotacao_autorizada) updates.dotacao_autorizada = row.dotacao_autorizada;
        if (row.dotacao_inicial) updates.dotacao_inicial = row.dotacao_inicial;
        
        // Recalculate percentual_execucao if we now have dotação
        if (updates.dotacao_autorizada && existing[0]) {
          const { data: fullRec } = await supabase
            .from("dados_orcamentarios")
            .select("pago")
            .eq("id", existing[0].id)
            .single();
          if (fullRec?.pago && updates.dotacao_autorizada) {
            updates.percentual_execucao = Math.round((fullRec.pago / updates.dotacao_autorizada) * 10000) / 100;
          }
        }

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from("dados_orcamentarios")
            .update(updates)
            .eq("id", existing[0].id);
          if (error) {
            erros.push(`Update ${row.programa} ${row.ano}: ${error.message}`);
          } else {
            updated++;
          }
        } else {
          skipped++;
        }
      } else {
        // Insert as new record
        const { error } = await supabase.from("dados_orcamentarios").insert({
          programa: row.programa,
          orgao: row.orgao,
          esfera: "federal",
          ano: row.ano,
          dotacao_autorizada: row.dotacao_autorizada,
          dotacao_inicial: row.dotacao_inicial,
          empenhado: row.empenhado,
          liquidado: row.liquidado,
          pago: row.pago,
          percentual_execucao: row.dotacao_autorizada && row.pago
            ? Math.round((row.pago / row.dotacao_autorizada) * 10000) / 100
            : null,
          fonte_dados: "CSV SIOP",
          url_fonte: "https://www1.siop.planejamento.gov.br/QvAJAXZfc/opendoc.htm?document=IAS%2FExecucao_Orcamentaria.qvw&host=QVS%40paborc04&anonymous=true",
        });
        if (error) {
          erros.push(`Insert ${row.programa} ${row.ano}: ${error.message}`);
        } else {
          inserted++;
        }
      }
    }

    console.log(`Import: ${updated} atualizados, ${inserted} inseridos, ${skipped} ignorados, ${erros.length} erros`);

    return new Response(
      JSON.stringify({
        success: true,
        mode: "import",
        total_processados: parsed.length,
        atualizados: updated,
        inseridos: inserted,
        ignorados: skipped,
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

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SICONFI_BASE = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt";

/**
 * ================================================================
 * INGESTÃO MUNICIPAL — APENAS NOMES DE AÇÕES ORÇAMENTÁRIAS
 * ================================================================
 * 
 * Busca no SICONFI (RREO/DCA) apenas os NOMES de contas/ações
 * cujo título, público-alvo ou descrição contenha palavras-chave
 * raciais/étnicas. NÃO coleta dados de dotação ou execução.
 * ================================================================
 */

const KEYWORDS = [
  "racial", "racismo", "igualdade racial",
  "quilombol", "indígen", "indigen", "cigan", "romani",
  "terreiro", "matriz africana", "afro", "palmares",
  "funai", "sesai", "etnia", "étnic",
  "negro", "negra", "capoeira",
];

const CONTA_ALVO = ["assistência aos indígenas"];

function matchesKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS.some(kw => lower.includes(kw));
}

function isRelevantConta(conta: string): boolean {
  const lower = conta.toLowerCase();
  return CONTA_ALVO.some(a => lower.includes(a)) || matchesKeyword(lower);
}

function isJunk(v: string): boolean {
  const lower = v.toLowerCase();
  return lower.includes("<ec") || lower.includes("<mr") ||
    lower.includes("saldo") || lower.includes("crédito") ||
    lower.startsWith("despesas (") ||
    lower.startsWith("receita") ||
    lower.length < 3;
}

function classificarGrupo(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes("indigen") || lower.includes("funai") || lower.includes("sesai")) return "Indígena";
  if (lower.includes("quilombol")) return "Quilombola";
  if (lower.includes("cigan") || lower.includes("romani")) return "Cigano/Roma";
  if (lower.includes("racial") || lower.includes("negro") || lower.includes("afro")) return "Negro/Afrodescendente";
  return "Racial/Étnico";
}

// ── Fetch municipality list ──

async function fetchMunicipiosByUF(uf: string): Promise<{ cod_ibge: number; nome: string }[]> {
  const url = `${SICONFI_BASE}/entes?esfera=M&uf=${uf}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = await res.json();
    const items = data?.items || data || [];
    return items.map((item: any) => ({
      cod_ibge: item.cod_ibge,
      nome: item.ente || item.nome || `Município ${item.cod_ibge}`,
    }));
  } catch {
    return [];
  }
}

// ── Fetch RREO/DCA and extract action NAMES only ──

async function fetchActionNames(ibge: number, ano: number): Promise<string[]> {
  const names = new Set<string>();

  // Try RREO
  for (const periodo of [6, 5]) {
    try {
      const url = `${SICONFI_BASE}/rreo?an_exercicio=${ano}&nr_periodo=${periodo}&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo+02&id_ente=${ibge}`;
      const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15_000) });
      if (!res.ok) continue;
      const data = await res.json();
      const items = data?.items || data || [];
      for (const item of items) {
        const conta = String(item.conta || item.ds_conta || "").trim();
        if (!conta || isJunk(conta)) continue;
        if (isRelevantConta(conta)) names.add(conta);
      }
      if (names.size > 0) break;
    } catch { /* skip */ }
  }

  // Fallback DCA
  if (names.size === 0) {
    try {
      const url = `${SICONFI_BASE}/dca?an_exercicio=${ano}&no_anexo=DCA-Anexo+I-D&id_ente=${ibge}`;
      const res = await fetch(url, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(15_000) });
      if (!res.ok) return [];
      const data = await res.json();
      const items = data?.items || data || [];
      for (const item of items) {
        const conta = String(item.conta || item.ds_conta || "").trim();
        if (!conta || isJunk(conta)) continue;
        if (isRelevantConta(conta)) names.add(conta);
      }
    } catch { /* skip */ }
  }

  return Array.from(names);
}

// ── Main handler ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos: number[] = [2022, 2023, 2024];
    let ufs: string[] | undefined;
    let mode = "insert";

    try {
      const body = await req.json();
      if (body.anos) anos = body.anos;
      if (body.ufs) ufs = body.ufs;
      if (body.mode === "preview") mode = "preview";
    } catch { /* defaults */ }

    const supabase = mode === "insert"
      ? createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
      : null;

    const targetUFs = ufs || ["BA"];
    const erros: string[] = [];
    const allRegistros: any[] = [];
    const startTime = Date.now();
    const MAX_RUNTIME_MS = 270_000;

    for (const uf of targetUFs) {
      const municipios = await fetchMunicipiosByUF(uf);
      console.log(`${uf}: ${municipios.length} municípios`);
      await new Promise(r => setTimeout(r, 300));

      let processedCount = 0;

      for (const mun of municipios) {
        if (Date.now() - startTime > MAX_RUNTIME_MS) break;

        for (const ano of anos) {
          try {
            const actionNames = await fetchActionNames(mun.cod_ibge, ano);
            for (const conta of actionNames) {
              const key = `${mun.nome}|${conta}|${ano}`;
              if (allRegistros.some(r => r._key === key)) continue;

              allRegistros.push({
                _key: key,
                programa: `${mun.nome}/${uf} – ${conta}`.substring(0, 250),
                orgao: `Prefeitura de ${mun.nome}/${uf}`,
                esfera: "municipal",
                ano,
                fonte_dados: `SICONFI – ${mun.nome}/${uf}`,
                url_fonte: `https://siconfi.tesouro.gov.br`,
                descritivo: conta,
                observacoes: classificarGrupo(conta),
                razao_selecao: `Palavra-chave: ${KEYWORDS.filter(kw => conta.toLowerCase().includes(kw)).slice(0, 3).join(", ")}`,
                dotacao_inicial: null,
                dotacao_autorizada: null,
                empenhado: null,
                liquidado: null,
                pago: null,
                percentual_execucao: null,
                eixo_tematico: null,
                grupo_focal: null,
                publico_alvo: null,
              });
            }
          } catch (error) {
            erros.push(`${mun.nome} ${ano}: ${error instanceof Error ? error.message : "Erro"}`);
          }
          await new Promise(r => setTimeout(r, 400));
        }

        processedCount++;
        if (processedCount % 50 === 0) {
          console.log(`  [${processedCount}/${municipios.length}] ${allRegistros.length} ações encontradas`);
        }
      }
    }

    // Clean keys
    const batch = allRegistros.map(({ _key, ...rest }) => rest);

    const porGrupo: Record<string, number> = {};
    for (const r of batch) {
      const g = String(r.observacoes ?? "N/C");
      porGrupo[g] = (porGrupo[g] ?? 0) + 1;
    }

    if (mode === "preview") {
      return new Response(JSON.stringify({
        success: true,
        total_registros: batch.length,
        municipios_processados: allRegistros.length > 0 ? targetUFs.length : 0,
        municipios_total: targetUFs.length,
        por_grupo_etnico: porGrupo,
        amostra: batch.slice(0, 50).map(r => ({
          programa: r.programa, ano: r.ano, grupo: r.observacoes,
          criterio: r.razao_selecao,
        })),
        erros: erros.slice(0, 20),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // INSERT
    let totalInserted = 0;
    for (let i = 0; i < batch.length; i += 50) {
      const chunk = batch.slice(i, i + 50);
      const { error: insErr } = await supabase!.from("dados_orcamentarios").insert(chunk);
      if (insErr) erros.push(`Batch ${i}: ${insErr.message}`);
      else totalInserted += chunk.length;
    }

    return new Response(JSON.stringify({
      success: true,
      total_inseridos: totalInserted,
      por_grupo_etnico: porGrupo,
      erros: erros.slice(0, 20),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

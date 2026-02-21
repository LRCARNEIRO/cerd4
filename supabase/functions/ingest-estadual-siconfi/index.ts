import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ESTADOS_IBGE: Record<string, number> = {
  AC: 12, AL: 27, AP: 16, AM: 13, BA: 29, CE: 23, DF: 53,
  ES: 32, GO: 52, MA: 21, MT: 51, MS: 50, MG: 31, PA: 15,
  PB: 25, PR: 41, PE: 26, PI: 22, RJ: 33, RN: 24, RS: 43,
  RO: 11, RR: 14, SC: 42, SP: 35, SE: 28, TO: 17,
};

// ═══════════════════════════════════════════════════════════════
// Radicais e Palavras-Chave
// ═══════════════════════════════════════════════════════════════

const RADICAIS: { radical: string; grupo: string }[] = [
  { radical: "indígen", grupo: "Indígena" },
  { radical: "indigen", grupo: "Indígena" },
  { radical: "quilombol", grupo: "Quilombola" },
  { radical: "cigan", grupo: "Cigano/Roma" },
  { radical: "étnic", grupo: "Racial/Étnico" },
  { radical: "etnic", grupo: "Racial/Étnico" },
  { radical: "palmares", grupo: "Negro/Afrodescendente" },
  { radical: "funai", grupo: "Indígena" },
  { radical: "sesai", grupo: "Indígena" },
];

const PALAVRAS_CHAVE: { termo: string; grupo: string }[] = [
  { termo: "igualdade racial", grupo: "Negro/Afrodescendente" },
  { termo: "promoção da igualdade", grupo: "Racial/Étnico" },
  { termo: "racismo", grupo: "Negro/Afrodescendente" },
  { termo: "racial", grupo: "Negro/Afrodescendente" },
  { termo: "negro", grupo: "Negro/Afrodescendente" },
  { termo: "negra", grupo: "Negro/Afrodescendente" },
  { termo: "afrodescendente", grupo: "Negro/Afrodescendente" },
  { termo: "afro", grupo: "Negro/Afrodescendente" },
  { termo: "consciência negra", grupo: "Negro/Afrodescendente" },
  { termo: "matriz africana", grupo: "Negro/Afrodescendente" },
  { termo: "capoeira", grupo: "Negro/Afrodescendente" },
  { termo: "candomblé", grupo: "Negro/Afrodescendente" },
  { termo: "umbanda", grupo: "Negro/Afrodescendente" },
  { termo: "terreiro", grupo: "Negro/Afrodescendente" },
  { termo: "seppir", grupo: "Negro/Afrodescendente" },
  { termo: "povos originários", grupo: "Indígena" },
  { termo: "terra indígena", grupo: "Indígena" },
  { termo: "povos tradicionais", grupo: "Comunidade Tradicional" },
  { termo: "comunidades tradicionais", grupo: "Comunidade Tradicional" },
  { termo: "povo cigano", grupo: "Cigano/Roma" },
  { termo: "romani", grupo: "Cigano/Roma" },
  { termo: "discriminação racial", grupo: "Racial/Étnico" },
];

const TERMOS_EXCLUSAO = [
  "direitos da cidadania",
  "direitos individuais coletivos",
  "assistência comunitária",
  "direitos individuais",
  "gestão administrativa",
  "administração geral",
];

// ═══════════════════════════════════════════════════════════════
// FETCH
// ═══════════════════════════════════════════════════════════════

async function fetchJson(url: string, params: URLSearchParams): Promise<Record<string, unknown>[]> {
  try {
    const fullUrl = `${url}?${params}`;
    console.log(`  Fetch: ${fullUrl.substring(0, 150)}...`);
    const res = await fetch(fullUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) { console.error(`  HTTP ${res.status}`); return []; }
    const ct = res.headers.get("content-type");
    if (!ct?.includes("application/json")) return [];
    const data = await res.json();
    return data?.items ?? [];
  } catch (e) {
    console.error(`  Fetch error: ${e instanceof Error ? e.message : e}`);
    return [];
  }
}

async function consultarDCA(ano: number, ufCode: number) {
  return fetchJson("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca",
    new URLSearchParams({ an_exercicio: String(ano), id_ente: String(ufCode), no_anexo: "DCA-Anexo I-E" }));
}

async function consultarRREO(ano: number, ufCode: number) {
  for (let bim = 6; bim >= 1; bim--) {
    const items = await fetchJson("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo",
      new URLSearchParams({ an_exercicio: String(ano), id_ente: String(ufCode), nr_periodo: String(bim), no_anexo: "RREO-Anexo 02", co_tipo_demonstrativo: "RREO" }));
    if (items.length > 0) { console.log(`  RREO bim ${bim}: ${items.length}`); return items; }
  }
  return [];
}

// ═══════════════════════════════════════════════════════════════
// MATCHING — Radicais + Keywords
// ═══════════════════════════════════════════════════════════════

function normalize(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matchRadicaisKeywords(texto: string): { termos: string[]; grupos: Set<string> } | null {
  const norm = normalize(texto);
  const termos: string[] = [];
  const grupos = new Set<string>();

  for (const r of RADICAIS) {
    if (norm.includes(normalize(r.radical))) { termos.push(r.radical); grupos.add(r.grupo); }
  }
  for (const pk of PALAVRAS_CHAVE) {
    if (norm.includes(normalize(pk.termo)) && !termos.includes(pk.termo)) { termos.push(pk.termo); grupos.add(pk.grupo); }
  }
  if (termos.length === 0) return null;

  // Excluir falsos positivos genéricos
  const lower = texto.toLowerCase();
  for (const excl of TERMOS_EXCLUSAO) {
    if (lower.includes(excl)) {
      if (grupos.size === 1 && (grupos.has("Racial/Étnico"))) return null;
    }
  }
  return { termos, grupos };
}

// ═══════════════════════════════════════════════════════════════
// PROCESSAMENTO
// ═══════════════════════════════════════════════════════════════

function processarItems(
  items: Record<string, unknown>[], uf: string, ano: number, fonteAnexo: string,
): Record<string, unknown>[] {
  if (items.length > 0) {
    console.log(`  Campos (${fonteAnexo}): ${Object.keys(items[0]).join(", ")}`);
  }

  const porConta = new Map<string, {
    conta: string; codConta: string;
    empenhado: number | null; liquidado: number | null;
    dotacao_inicial: number | null; pago: number | null;
    razao: string; grupoEtnico: string | null;
  }>();

  for (const item of items) {
    const conta = String(item.conta ?? "").trim();
    const rotulo = String(item.rotulo ?? "").trim();
    const coluna = String(item.coluna ?? "").toLowerCase();
    const codConta = String(item.cod_conta ?? "");
    const valor = typeof item.valor === "number" ? item.valor : null;

    if ((!conta && !rotulo) || valor === null) continue;

    const contaDisplay = conta || rotulo;
    const textoCompleto = `${conta} ${rotulo} ${codConta} ${coluna}`;

    const match = matchRadicaisKeywords(textoCompleto);
    if (!match) continue;

    const razao = `Radical: ${match.termos.slice(0, 3).join(", ")}`;
    const grupoEtnico = [...match.grupos].join(" | ");

    const key = contaDisplay;
    const existing = porConta.get(key) ?? {
      conta: contaDisplay, codConta,
      empenhado: null, liquidado: null, dotacao_inicial: null, pago: null,
      razao, grupoEtnico,
    };

    if (coluna.includes("empenha")) existing.empenhado = (existing.empenhado ?? 0) + (valor ?? 0);
    else if (coluna.includes("liquida")) existing.liquidado = (existing.liquidado ?? 0) + (valor ?? 0);
    else if (coluna.includes("pag")) existing.pago = (existing.pago ?? 0) + (valor ?? 0);
    else if (coluna.includes("dotação") || coluna.includes("dotacao") || coluna.includes("inicial") || coluna.includes("crédito") || coluna.includes("credito"))
      existing.dotacao_inicial = (existing.dotacao_inicial ?? 0) + (valor ?? 0);

    porConta.set(key, existing);
  }

  const registros: Record<string, unknown>[] = [];
  for (const [, d] of porConta) {
    let pctExec: number | null = null;
    if (d.dotacao_inicial && d.dotacao_inicial > 0 && d.liquidado !== null)
      pctExec = Math.round((d.liquidado / d.dotacao_inicial) * 10000) / 100;

    registros.push({
      programa: `${uf} — ${d.conta}`.substring(0, 250),
      orgao: `Gov. Estadual (${uf})`,
      esfera: "estadual",
      ano,
      dotacao_inicial: d.dotacao_inicial,
      dotacao_autorizada: null,
      empenhado: d.empenhado,
      liquidado: d.liquidado,
      pago: d.pago,
      percentual_execucao: pctExec,
      fonte_dados: `SICONFI ${fonteAnexo} — ${uf}`,
      url_fonte: "https://siconfi.tesouro.gov.br/siconfi/pages/public/declaracao/declaracao_list.jsf",
      descritivo: d.conta,
      observacoes: d.grupoEtnico,
      eixo_tematico: null,
      grupo_focal: null,
      publico_alvo: null,
      razao_selecao: d.razao,
    });
  }
  return registros;
}

// ═══════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let anos: number[] = [2023, 2024];
    let ufs: string[] | undefined;
    let mode = "insert";
    let maxEstados = 5;

    try {
      const body = await req.json();
      if (Array.isArray(body.anos) && body.anos.length > 0) anos = body.anos;
      if (Array.isArray(body.ufs) && body.ufs.length > 0) ufs = body.ufs;
      if (body.mode === "preview") mode = "preview";
      if (typeof body.maxEstados === "number") maxEstados = body.maxEstados;
    } catch { /* defaults */ }

    const allEstados = Object.entries(ESTADOS_IBGE).filter(([uf]) => !ufs || ufs.includes(uf));
    const estadosAlvo = ufs ? allEstados : allEstados.slice(0, maxEstados);

    console.log(`=== Ingestão Estadual (Radicais+Keywords) ===`);
    console.log(`Mode: ${mode} | Estados(${estadosAlvo.length}): ${estadosAlvo.map(([u]) => u).join(",")} | Anos: ${anos.join(",")}`);

    const allRegistros: Record<string, unknown>[] = [];
    const erros: string[] = [];
    const logConsultas: string[] = [];

    for (const [uf, ufCode] of estadosAlvo) {
      for (const ano of anos) {
        console.log(`\n--- ${uf} [${ano}] ---`);
        try {
          let items: Record<string, unknown>[] = [];
          let fonte = "";

          if (ano >= 2025) {
            items = await consultarRREO(ano, ufCode);
            fonte = "RREO-Anexo 02";
          } else {
            items = await consultarDCA(ano, ufCode);
            fonte = "DCA-Anexo I-E";
          }

          if (items.length > 0) {
            const regs = processarItems(items, uf, ano, fonte);
            allRegistros.push(...regs);
            logConsultas.push(`${uf}/${ano}: ${fonte} → ${items.length} brutos → ${regs.length} hits`);
          } else {
            logConsultas.push(`${uf}/${ano}: ${fonte} → sem dados`);
          }
        } catch (error) {
          erros.push(`${uf} ${ano}: ${error instanceof Error ? error.message : "Erro"}`);
        }
        await new Promise(r => setTimeout(r, 350));
      }
    }

    // Deduplicação
    const deduped = new Map<string, Record<string, unknown>>();
    for (const r of allRegistros) {
      const key = `${r.programa}|${r.ano}`;
      const existing = deduped.get(key);
      if (!existing) { deduped.set(key, r); continue; }
      const dotR = (r.dotacao_inicial as number) ?? 0;
      const dotE = (existing.dotacao_inicial as number) ?? 0;
      if (dotR > dotE) deduped.set(key, r);
    }

    const batch = Array.from(deduped.values());

    // Estatísticas
    const porGrupo: Record<string, number> = {};
    const porUF: Record<string, number> = {};
    for (const r of batch) {
      const g = String(r.observacoes ?? "N/C");
      porGrupo[g] = (porGrupo[g] ?? 0) + 1;
      const ufM = String(r.programa ?? "").match(/^([A-Z]{2})/);
      if (ufM) porUF[ufM[1]] = (porUF[ufM[1]] ?? 0) + 1;
    }

    // PREVIEW
    if (mode === "preview") {
      return new Response(JSON.stringify({
        success: true, mode: "preview",
        total_brutos: allRegistros.length,
        total_deduplicados: deduped.size,
        por_grupo_etnico: porGrupo,
        por_uf: porUF,
        log_consultas: logConsultas,
        amostra: batch.slice(0, 30).map(r => ({
          programa: r.programa, ano: r.ano,
          dotacao_inicial: r.dotacao_inicial, liquidado: r.liquidado,
          razao_selecao: r.razao_selecao, grupo: r.observacoes,
        })),
        erros: erros.slice(0, 20),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // INSERT
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let totalInserted = 0;
    for (let i = 0; i < batch.length; i += 50) {
      const chunk = batch.slice(i, i + 50);
      const { error: insErr } = await supabase.from("dados_orcamentarios").insert(chunk);
      if (insErr) { erros.push(`Batch ${i}: ${insErr.message}`); } else { totalInserted += chunk.length; }
    }

    return new Response(JSON.stringify({
      success: true, mode: "insert",
      total_inseridos: totalInserted, total_brutos: allRegistros.length, deduplicados: deduped.size,
      por_grupo_etnico: porGrupo, por_uf: porUF,
      estados: estadosAlvo.map(([u]) => u), anos,
      log_consultas: logConsultas.slice(0, 40), erros: erros.slice(0, 20),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

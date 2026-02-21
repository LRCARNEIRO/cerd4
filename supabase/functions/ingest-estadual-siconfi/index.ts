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
// Radicais e Palavras-Chave (Camada 1)
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
// FETCH helpers
// ═══════════════════════════════════════════════════════════════

async function fetchJson(url: string, params: URLSearchParams): Promise<Record<string, unknown>[]> {
  try {
    const fullUrl = `${url}?${params}`;
    console.log(`  Fetch: ${fullUrl.substring(0, 160)}...`);
    const res = await fetch(fullUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(45_000),
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

// DCA Anexo I-E (2018–2024): dotação + empenho + liquidado + pago
async function consultarDCA(ano: number, ufCode: number) {
  return fetchJson("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca",
    new URLSearchParams({ an_exercicio: String(ano), id_ente: String(ufCode), no_anexo: "DCA-Anexo I-E" }));
}

// RREO Anexo 02 (2025+): fallback bimestral
async function consultarRREO(ano: number, ufCode: number) {
  for (let bim = 6; bim >= 1; bim--) {
    const items = await fetchJson("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo",
      new URLSearchParams({ an_exercicio: String(ano), id_ente: String(ufCode), nr_periodo: String(bim), no_anexo: "RREO-Anexo 02", co_tipo_demonstrativo: "RREO" }));
    if (items.length > 0) { console.log(`  RREO bim ${bim}: ${items.length}`); return items; }
  }
  return [];
}

// MSC Orçamentária — classe 5 (despesa), mês 12 (acumulado anual)
async function consultarMSC(ano: number, ufCode: number) {
  const items = await fetchJson("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/msc_orcamentaria",
    new URLSearchParams({
      an_referencia: String(ano),
      me_referencia: "12",
      id_ente: String(ufCode),
      co_tipo_matriz: "MSCC",
      classe_conta: "5",
      id_tv: "beginning_balance",
    }));
  if (items.length === 0) {
    // Fallback: try period_change
    return fetchJson("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/msc_orcamentaria",
      new URLSearchParams({
        an_referencia: String(ano),
        me_referencia: "12",
        id_ente: String(ufCode),
        co_tipo_matriz: "MSCC",
        classe_conta: "5",
        id_tv: "period_change",
      }));
  }
  return items;
}

// ═══════════════════════════════════════════════════════════════
// MATCHING
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

  const lower = texto.toLowerCase();
  for (const excl of TERMOS_EXCLUSAO) {
    if (lower.includes(excl)) {
      if (grupos.size === 1 && grupos.has("Racial/Étnico")) return null;
    }
  }
  return { termos, grupos };
}

// ═══════════════════════════════════════════════════════════════
// PROCESS DCA/RREO items → registros
// ═══════════════════════════════════════════════════════════════

function processarDCA(
  items: Record<string, unknown>[], uf: string, ano: number, fonteAnexo: string,
): { registros: Record<string, unknown>[]; codContas: Set<string> } {
  const porConta = new Map<string, {
    conta: string; codConta: string;
    empenhado: number | null; liquidado: number | null;
    dotacao_inicial: number | null; pago: number | null;
    razao: string; grupoEtnico: string | null;
  }>();

  const codContasMatched = new Set<string>();

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

    codContasMatched.add(codConta);

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
  return { registros, codContas: codContasMatched };
}

// ═══════════════════════════════════════════════════════════════
// ENRICH with MSC execution data (Camada 3)
// ═══════════════════════════════════════════════════════════════

function enrichWithMSC(
  registros: Record<string, unknown>[],
  mscItems: Record<string, unknown>[],
  codContas: Set<string>,
) {
  if (mscItems.length === 0 || codContas.size === 0) return;

  // Build MSC lookup by cod_conta
  const mscByConta = new Map<string, { empenhado: number; liquidado: number; pago: number }>();
  for (const item of mscItems) {
    const codConta = String(item.conta_contabil ?? item.cod_conta ?? "");
    const valor = typeof item.valor === "number" ? item.valor : 0;
    const natureza = String(item.natureza_conta ?? item.coluna ?? "").toLowerCase();

    if (!codContas.has(codConta)) continue;

    const existing = mscByConta.get(codConta) ?? { empenhado: 0, liquidado: 0, pago: 0 };
    if (natureza.includes("empenh")) existing.empenhado += valor;
    else if (natureza.includes("liquid")) existing.liquidado += valor;
    else if (natureza.includes("pag")) existing.pago += valor;
    mscByConta.set(codConta, existing);
  }

  // Enrich registros that lack execution data
  for (const reg of registros) {
    const desc = String(reg.descritivo ?? "");
    for (const [codConta, vals] of mscByConta) {
      if (desc.includes(codConta) || normalize(desc).includes(normalize(codConta))) {
        if (reg.empenhado === null && vals.empenhado > 0) reg.empenhado = vals.empenhado;
        if (reg.liquidado === null && vals.liquidado > 0) reg.liquidado = vals.liquidado;
        if (reg.pago === null && vals.pago > 0) reg.pago = vals.pago;
        if (reg.razao_selecao) reg.razao_selecao = `${reg.razao_selecao} + MSC`;
        break;
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// HANDLER — processes 1 state at a time for WORKER_LIMIT safety
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let anos: number[] = [2023, 2024];
    let uf: string | undefined;
    let ufs: string[] | undefined;
    let mode = "insert";
    let useMSC = false;

    try {
      const body = await req.json();
      if (Array.isArray(body.anos) && body.anos.length > 0) anos = body.anos;
      if (typeof body.uf === "string") uf = body.uf;
      if (Array.isArray(body.ufs) && body.ufs.length > 0) ufs = body.ufs;
      if (body.mode === "preview") mode = "preview";
      if (body.useMSC === true) useMSC = true;
    } catch { /* defaults */ }

    // Single state mode (preferred for batch safety)
    const targetUF = uf ?? ufs?.[0];
    if (!targetUF || !ESTADOS_IBGE[targetUF]) {
      return new Response(JSON.stringify({
        success: false,
        error: `UF inválida: ${targetUF}. Use o parâmetro 'uf' com uma sigla válida.`,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ufCode = ESTADOS_IBGE[targetUF];
    console.log(`=== Ingestão Estadual: ${targetUF} (${ufCode}) | Anos: ${anos.join(",")} | Mode: ${mode} | MSC: ${useMSC} ===`);

    const allRegistros: Record<string, unknown>[] = [];
    const erros: string[] = [];
    const logConsultas: string[] = [];

    for (const ano of anos) {
      console.log(`\n--- ${targetUF} [${ano}] ---`);
      try {
        // Camada 1: DCA/RREO keyword search
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
          const { registros, codContas } = processarDCA(items, targetUF, ano, fonte);

          // Camada 3: MSC enrichment (optional)
          if (useMSC && codContas.size > 0 && ano <= 2024) {
            console.log(`  MSC: buscando dados de execução para ${codContas.size} contas...`);
            try {
              const mscItems = await consultarMSC(ano, ufCode);
              if (mscItems.length > 0) {
                enrichWithMSC(registros, mscItems, codContas);
                logConsultas.push(`${targetUF}/${ano}: MSC → ${mscItems.length} registros consultados`);
              } else {
                logConsultas.push(`${targetUF}/${ano}: MSC → sem dados disponíveis`);
              }
            } catch (mscErr) {
              logConsultas.push(`${targetUF}/${ano}: MSC → erro: ${mscErr instanceof Error ? mscErr.message : "Erro"}`);
            }
          }

          allRegistros.push(...registros);
          logConsultas.push(`${targetUF}/${ano}: ${fonte} → ${items.length} brutos → ${registros.length} hits`);
        } else {
          logConsultas.push(`${targetUF}/${ano}: ${fonte} → sem dados`);
        }
      } catch (error) {
        erros.push(`${targetUF} ${ano}: ${error instanceof Error ? error.message : "Erro"}`);
      }
      await new Promise(r => setTimeout(r, 300));
    }

    // Deduplication
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

    // Stats
    const porGrupo: Record<string, number> = {};
    for (const r of batch) {
      const g = String(r.observacoes ?? "N/C");
      porGrupo[g] = (porGrupo[g] ?? 0) + 1;
    }

    // PREVIEW
    if (mode === "preview") {
      return new Response(JSON.stringify({
        success: true, mode: "preview", uf: targetUF,
        total_brutos: allRegistros.length,
        total_deduplicados: deduped.size,
        por_grupo_etnico: porGrupo,
        log_consultas: logConsultas,
        amostra: batch.slice(0, 30).map(r => ({
          programa: r.programa, ano: r.ano,
          dotacao_inicial: r.dotacao_inicial, liquidado: r.liquidado,
          empenhado: r.empenhado, pago: r.pago,
          razao_selecao: r.razao_selecao, grupo: r.observacoes,
        })),
        erros: erros.slice(0, 10),
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
      success: true, mode: "insert", uf: targetUF,
      total_inseridos: totalInserted, total_brutos: allRegistros.length, deduplicados: deduped.size,
      por_grupo_etnico: porGrupo,
      log_consultas: logConsultas.slice(0, 20), erros: erros.slice(0, 10),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

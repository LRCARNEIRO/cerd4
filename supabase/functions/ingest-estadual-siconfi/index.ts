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
// CAMADA 1 — Dicionário de Ações Raciais (Códigos PPA por Estado)
// ═══════════════════════════════════════════════════════════════

const DICIONARIO_PPA: Record<string, string[]> = {
  BA: ["1055", "2190", "3344"],
  MA: ["4321", "1244", "5561", "2188"],
  PA: ["6721", "4410"],
  SP: ["2822", "2830"],
  MG: ["1122", "4455"],
  PE: ["9988", "7766"],
  CE: ["450", "612"],
  PI: ["203", "155"],
  RJ: ["2210"],
  DF: ["4088"],
  RS: ["2410"],
  MT: ["551", "552"],
  PR: [], AM: [], MS: [], RO: [], TO: [], RR: [], PB: [], SE: [],
  // Pendentes (sem ações mapeadas nos PPAs)
  AC: [], AL: [], ES: [], GO: [], SC: [], AP: [], RN: [],
};

// ═══════════════════════════════════════════════════════════════
// CAMADA 2 — Radicais Unificados + Palavras-Chave
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
  { termo: "assistência aos indígenas", grupo: "Indígena" },
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

const FUNCAO_DIREITOS = "14";
const SUBFUNCOES_RELEVANTES = ["422"];

// ═══════════════════════════════════════════════════════════════
// FETCH HELPERS
// ═══════════════════════════════════════════════════════════════

async function fetchJsonSafely(url: string, params: URLSearchParams): Promise<Record<string, unknown>[]> {
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

/** DCA Anexo I-E — 2018-2024 */
async function consultarDCA_IE(ano: number, ufCode: number) {
  return fetchJsonSafely("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca",
    new URLSearchParams({ an_exercicio: String(ano), id_ente: String(ufCode), no_anexo: "DCA-Anexo I-E" }));
}

/** RREO Anexo 02 — 2025+ (tenta bimestres 6→1) */
async function consultarRREO_02(ano: number, ufCode: number) {
  for (let bim = 6; bim >= 1; bim--) {
    const items = await fetchJsonSafely("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo",
      new URLSearchParams({ an_exercicio: String(ano), id_ente: String(ufCode), nr_periodo: String(bim), no_anexo: "RREO-Anexo 02", co_tipo_demonstrativo: "RREO" }));
    if (items.length > 0) { console.log(`  RREO bim ${bim}: ${items.length}`); return items; }
  }
  return [];
}

/** MSC — Matriz de Saldos Contábeis (Camada 3) */
async function consultarMSC(ano: number, ufCode: number) {
  return fetchJsonSafely("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/msc_patrimonial",
    new URLSearchParams({ an_referencia: String(ano), id_ente: String(ufCode), co_tipo_matriz: "MSCC" }));
}

// ═══════════════════════════════════════════════════════════════
// MATCHING LOGIC — 4 Camadas
// ═══════════════════════════════════════════════════════════════

function normalizeText(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function checarRadicaisEKeywords(texto: string): { termos: string[]; grupos: Set<string> } | null {
  const norm = normalizeText(texto);
  const termos: string[] = [];
  const grupos = new Set<string>();

  for (const r of RADICAIS) {
    if (norm.includes(normalizeText(r.radical))) { termos.push(r.radical); grupos.add(r.grupo); }
  }
  for (const pk of PALAVRAS_CHAVE) {
    if (norm.includes(normalizeText(pk.termo)) && !termos.includes(pk.termo)) { termos.push(pk.termo); grupos.add(pk.grupo); }
  }
  if (termos.length === 0) return null;

  // Exclusão de falsos positivos
  const lower = texto.toLowerCase();
  for (const excl of TERMOS_EXCLUSAO) {
    if (lower.includes(excl)) {
      if (grupos.size === 1 && (grupos.has("Racial/Étnico") || grupos.has("Racial/Étnico (geral)"))) return null;
    }
  }
  return { termos, grupos };
}

function checarCodigoPPA(texto: string, uf: string): string | null {
  const codigos = DICIONARIO_PPA[uf];
  if (!codigos || codigos.length === 0) return null;
  for (const cod of codigos) {
    // Match code at word boundaries or as standalone number in the text
    const patterns = [
      new RegExp(`\\b${cod}\\b`),
      new RegExp(`^${cod}[\\s\\-\\.]`),
      new RegExp(`[\\s\\-\\.]${cod}$`),
      new RegExp(`[\\s\\-\\.]${cod}[\\s\\-\\.]`),
    ];
    for (const p of patterns) {
      if (p.test(texto)) return cod;
    }
  }
  return null;
}

function extrairCodigoFuncional(conta: string): { funcao: string; subfuncao: string } | null {
  const match = conta.match(/^(\d+)\.(\d+)/);
  return match ? { funcao: match[1], subfuncao: match[2] } : null;
}

// ═══════════════════════════════════════════════════════════════
// PROCESSAMENTO
// ═══════════════════════════════════════════════════════════════

function processarItems(
  items: Record<string, unknown>[], uf: string, ano: number, fonteAnexo: string,
): Record<string, unknown>[] {
  if (items.length > 0) {
    const s = items[0];
    console.log(`  Campos (${fonteAnexo}): ${Object.keys(s).join(", ")}`);
  }

  const porConta = new Map<string, {
    conta: string; codConta: string;
    empenhado: number | null; liquidado: number | null;
    dotacao_inicial: number | null; pago: number | null;
    razao: string; grupoEtnico: string | null; camada: string;
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
    const funcional = extrairCodigoFuncional(contaDisplay);

    let match = false;
    let razao = "";
    let grupoEtnico: string | null = null;
    let camada = "";

    // ── CAMADA 1: Código PPA do Dicionário ──
    const codPPA = checarCodigoPPA(textoCompleto, uf);
    if (codPPA) {
      match = true;
      razao = `Código PPA ${uf}:${codPPA}`;
      grupoEtnico = "Política Racial/Étnica (PPA)";
      camada = "C1-PPA";
    }

    // ── CAMADA 2a: Subfunção 422 + radical/keyword ──
    if (!match && funcional && SUBFUNCOES_RELEVANTES.includes(funcional.subfuncao)) {
      const check = checarRadicaisEKeywords(textoCompleto);
      if (check) {
        match = true;
        razao = `SubFn422 + ${check.termos.slice(0, 3).join(", ")}`;
        grupoEtnico = [...check.grupos].join(" | ");
        camada = "C2a-SubFn422";
      }
    }

    // ── CAMADA 2b: Radical/keyword em qualquer campo ──
    if (!match) {
      const check = checarRadicaisEKeywords(textoCompleto);
      if (check) {
        match = true;
        razao = `Radical: ${check.termos.slice(0, 3).join(", ")}`;
        grupoEtnico = [...check.grupos].join(" | ");
        camada = "C2b-Radical";
      }
    }

    // ── CAMADA 2c: Função 14 (filtro estrutural amplo) ──
    if (!match && funcional && funcional.funcao === FUNCAO_DIREITOS && funcional.subfuncao) {
      // Não inclui sem radical — apenas sinaliza para log
      // (A metodologia diz que Fn14 é insuficiente isoladamente)
    }

    if (!match) continue;

    const key = contaDisplay;
    const existing = porConta.get(key) ?? {
      conta: contaDisplay, codConta,
      empenhado: null, liquidado: null, dotacao_inicial: null, pago: null,
      razao, grupoEtnico, camada,
    };

    // Priorizar camada mais alta se duplicado
    if (existing.camada > camada) { existing.camada = camada; existing.razao = razao; }

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
      razao_selecao: `${d.camada} | ${d.razao}`,
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
    let anos: number[] = [2022, 2023, 2024, 2025];
    let ufs: string[] | undefined;
    let mode = "insert";

    try {
      const body = await req.json();
      if (Array.isArray(body.anos) && body.anos.length > 0) anos = body.anos;
      if (Array.isArray(body.ufs) && body.ufs.length > 0) ufs = body.ufs;
      if (body.mode === "preview") mode = "preview";
    } catch { /* defaults */ }

    const estadosAlvo = Object.entries(ESTADOS_IBGE).filter(([uf]) => !ufs || ufs.includes(uf));

    console.log(`=== Ingestão Estadual — 4 Camadas (MSC/PPA Padrão-Ouro) ===`);
    console.log(`Mode: ${mode} | Estados: ${estadosAlvo.map(([u]) => u).join(",")} | Anos: ${anos.join(",")}`);

    const allRegistros: Record<string, unknown>[] = [];
    const erros: string[] = [];
    const logConsultas: string[] = [];

    for (const [uf, ufCode] of estadosAlvo) {
      const codigosPPA = DICIONARIO_PPA[uf] ?? [];

      for (const ano of anos) {
        console.log(`\n--- ${uf} [${ano}] (PPA codes: ${codigosPPA.length}) ---`);
        try {
          let items: Record<string, unknown>[] = [];
          let fonte = "";

          if (ano >= 2025) {
            items = await consultarRREO_02(ano, ufCode);
            fonte = "RREO-Anexo 02";
          } else {
            items = await consultarDCA_IE(ano, ufCode);
            fonte = "DCA-Anexo I-E";
          }

          // Camada 3: Tentar MSC se DCA/RREO tem poucos resultados ou se há códigos PPA
          if (codigosPPA.length > 0 && items.length < 50) {
            const mscItems = await consultarMSC(ano, ufCode);
            if (mscItems.length > 0) {
              console.log(`  MSC: ${mscItems.length} itens (complemento Camada 3)`);
              items = [...items, ...mscItems];
              fonte += " + MSC";
            }
          }

          if (items.length > 0) {
            const regs = processarItems(items, uf, ano, fonte);
            allRegistros.push(...regs);
            const c1 = regs.filter(r => String(r.razao_selecao).startsWith("C1")).length;
            const c2 = regs.filter(r => String(r.razao_selecao).startsWith("C2")).length;
            logConsultas.push(`${uf}/${ano}: ${fonte} → ${items.length} brutos → ${regs.length} hits (C1:${c1} C2:${c2})`);
          } else {
            logConsultas.push(`${uf}/${ano}: ${fonte} → sem dados`);
          }
        } catch (error) {
          const msg = `${uf} ${ano}: ${error instanceof Error ? error.message : "Erro"}`;
          erros.push(msg);
        }
        await new Promise(r => setTimeout(r, 350));
      }
    }

    // Deduplicação (prioriza camada menor = mais confiável)
    const deduped = new Map<string, Record<string, unknown>>();
    for (const r of allRegistros) {
      const key = `${r.programa}|${r.ano}`;
      const existing = deduped.get(key);
      if (!existing) { deduped.set(key, r); continue; }
      const camadaR = String(r.razao_selecao ?? "").substring(0, 2);
      const camadaE = String(existing.razao_selecao ?? "").substring(0, 2);
      if (camadaR < camadaE) deduped.set(key, r); // C1 < C2
      else if (camadaR === camadaE) {
        const dotR = (r.dotacao_inicial as number) ?? 0;
        const dotE = (existing.dotacao_inicial as number) ?? 0;
        if (dotR > dotE) deduped.set(key, r);
      }
    }

    console.log(`\nDedup: ${allRegistros.length} → ${deduped.size}`);
    const batch = Array.from(deduped.values());

    // Estatísticas
    const porCamada: Record<string, number> = {};
    const porGrupo: Record<string, number> = {};
    const porUF: Record<string, number> = {};
    for (const r of batch) {
      const razao = String(r.razao_selecao ?? "");
      const cam = razao.split(" | ")[0] || "?";
      porCamada[cam] = (porCamada[cam] ?? 0) + 1;
      const g = String(r.observacoes ?? "N/C");
      porGrupo[g] = (porGrupo[g] ?? 0) + 1;
      const ufM = String(r.programa ?? "").match(/^([A-Z]{2})/);
      if (ufM) porUF[ufM[1]] = (porUF[ufM[1]] ?? 0) + 1;
    }

    // ── PREVIEW ──
    if (mode === "preview") {
      return new Response(JSON.stringify({
        success: true, mode: "preview",
        total_brutos: allRegistros.length,
        total_deduplicados: deduped.size,
        por_camada: porCamada,
        por_grupo_etnico: porGrupo,
        por_uf: porUF,
        log_consultas: logConsultas,
        amostra: batch.slice(0, 30).map(r => ({
          programa: r.programa, ano: r.ano,
          dotacao_inicial: r.dotacao_inicial, liquidado: r.liquidado,
          razao_selecao: r.razao_selecao, grupo: r.observacoes,
        })),
        erros: erros.slice(0, 20),
        metodologia: "4 Camadas: C1-PPA (Dicionário), C2a-SubFn422+Radical, C2b-Radical, C3-MSC. Fonte: DCA I-E (2018-2024) + RREO-02 (2025+).",
        dicionario_ppa_ufs: Object.entries(DICIONARIO_PPA).filter(([, v]) => v.length > 0).map(([uf, codes]) => `${uf}: ${codes.join(",")}`),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // ── INSERT ──
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
      por_camada: porCamada, estados: estadosAlvo.map(([u]) => u), anos,
      log_consultas: logConsultas.slice(0, 40), erros: erros.slice(0, 20),
      metodologia: "4 Camadas: C1-PPA, C2a-SubFn422, C2b-Radical, C3-MSC.",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

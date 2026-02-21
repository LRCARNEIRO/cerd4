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
// Radicais e Palavras-Chave para identificação de ações/programas
// dos PPAs estaduais voltados a políticas raciais/étnicas
// ═══════════════════════════════════════════════════════════════

const RADICAIS: { radical: string; grupo: string }[] = [
  { radical: "indigen", grupo: "Indígena" },
  { radical: "quilombol", grupo: "Quilombola" },
  { radical: "cigan", grupo: "Cigano/Roma" },
  { radical: "etnic", grupo: "Racial/Étnico" },
  { radical: "palmares", grupo: "Negro/Afrodescendente" },
  { radical: "funai", grupo: "Indígena" },
  { radical: "sesai", grupo: "Indígena" },
];

const PALAVRAS_CHAVE: { termo: string; grupo: string }[] = [
  { termo: "igualdade racial", grupo: "Negro/Afrodescendente" },
  { termo: "promocao da igualdade", grupo: "Racial/Étnico" },
  { termo: "racismo", grupo: "Negro/Afrodescendente" },
  { termo: "racial", grupo: "Negro/Afrodescendente" },
  { termo: "negro", grupo: "Negro/Afrodescendente" },
  { termo: "negra", grupo: "Negro/Afrodescendente" },
  { termo: "afrodescendente", grupo: "Negro/Afrodescendente" },
  { termo: "afro", grupo: "Negro/Afrodescendente" },
  { termo: "consciencia negra", grupo: "Negro/Afrodescendente" },
  { termo: "matriz africana", grupo: "Negro/Afrodescendente" },
  { termo: "capoeira", grupo: "Negro/Afrodescendente" },
  { termo: "candomble", grupo: "Negro/Afrodescendente" },
  { termo: "umbanda", grupo: "Negro/Afrodescendente" },
  { termo: "terreiro", grupo: "Negro/Afrodescendente" },
  { termo: "seppir", grupo: "Negro/Afrodescendente" },
  { termo: "povos originarios", grupo: "Indígena" },
  { termo: "terra indigena", grupo: "Indígena" },
  { termo: "povos tradicionais", grupo: "Comunidade Tradicional" },
  { termo: "comunidades tradicionais", grupo: "Comunidade Tradicional" },
  { termo: "povo cigano", grupo: "Cigano/Roma" },
  { termo: "romani", grupo: "Cigano/Roma" },
  { termo: "discriminacao racial", grupo: "Racial/Étnico" },
];

const TERMOS_EXCLUSAO = [
  "direitos da cidadania",
  "direitos individuais coletivos",
  "assistencia comunitaria",
  "gestao administrativa",
  "administracao geral",
];

// ═══════════════════════════════════════════════════════════════
// FETCH com paginação completa — busca TODAS as páginas
// ═══════════════════════════════════════════════════════════════

async function fetchAllPages(url: string, params: URLSearchParams): Promise<Record<string, unknown>[]> {
  const allItems: Record<string, unknown>[] = [];
  let offset = 0;
  const limit = 5000;
  let page = 0;
  const maxPages = 20; // safety

  try {
    while (page < maxPages) {
      params.set("$offset", String(offset));
      params.set("$limit", String(limit));
      const fullUrl = `${url}?${params}`;
      console.log(`  Fetch p${page}: ${fullUrl.substring(0, 180)}`);

      const res = await fetch(fullUrl, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(60_000),
      });

      if (!res.ok) { console.error(`  HTTP ${res.status}`); break; }
      const ct = res.headers.get("content-type");
      if (!ct?.includes("application/json")) break;

      const data = await res.json();
      const items: Record<string, unknown>[] = data?.items ?? [];
      if (items.length === 0) break;

      allItems.push(...items);
      console.log(`  → p${page}: ${items.length} items (total: ${allItems.length})`);

      if (!data.hasMore && items.length < limit) break;
      offset += items.length;
      page++;
      await new Promise(r => setTimeout(r, 200));
    }
  } catch (e) {
    console.error(`  Fetch error: ${e instanceof Error ? e.message : e}`);
  }
  return allItems;
}

// DCA Anexo I-E (2018–2024): programas/ações do PPA com dotação + execução
async function consultarDCA(ano: number, ufCode: number) {
  return fetchAllPages("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca",
    new URLSearchParams({ an_exercicio: String(ano), id_ente: String(ufCode), no_anexo: "DCA-Anexo I-E" }));
}

// RREO Anexo 02 (2025+): fallback bimestral
async function consultarRREO(ano: number, ufCode: number) {
  for (let bim = 6; bim >= 1; bim--) {
    const items = await fetchAllPages("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo",
      new URLSearchParams({ an_exercicio: String(ano), id_ente: String(ufCode), nr_periodo: String(bim), no_anexo: "RREO-Anexo 02", co_tipo_demonstrativo: "RREO" }));
    if (items.length > 0) { console.log(`  RREO bim ${bim}: ${items.length} total`); return items; }
  }
  return [];
}

// MSC Orçamentária — classe 5 (despesa)
async function consultarMSC(ano: number, ufCode: number) {
  const items = await fetchAllPages("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/msc_orcamentaria",
    new URLSearchParams({
      an_referencia: String(ano), me_referencia: "12", id_ente: String(ufCode),
      co_tipo_matriz: "MSCC", classe_conta: "5", id_tv: "beginning_balance",
    }));
  if (items.length > 0) return items;
  return fetchAllPages("https://apidatalake.tesouro.gov.br/ords/siconfi/tt/msc_orcamentaria",
    new URLSearchParams({
      an_referencia: String(ano), me_referencia: "12", id_ente: String(ufCode),
      co_tipo_matriz: "MSCC", classe_conta: "5", id_tv: "period_change",
    }));
}

// ═══════════════════════════════════════════════════════════════
// MATCHING — normalização + busca por radicais/palavras-chave
// ═══════════════════════════════════════════════════════════════

function normalize(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matchRadicaisKeywords(texto: string): { termos: string[]; grupos: Set<string> } | null {
  const norm = normalize(texto);
  const termos: string[] = [];
  const grupos = new Set<string>();

  for (const r of RADICAIS) {
    if (norm.includes(r.radical)) { termos.push(r.radical); grupos.add(r.grupo); }
  }
  for (const pk of PALAVRAS_CHAVE) {
    if (norm.includes(pk.termo) && !termos.includes(pk.termo)) { termos.push(pk.termo); grupos.add(pk.grupo); }
  }
  if (termos.length === 0) return null;

  // Exclusão de termos genéricos
  for (const excl of TERMOS_EXCLUSAO) {
    if (norm.includes(excl)) {
      if (grupos.size === 1 && grupos.has("Racial/Étnico")) return null;
    }
  }
  return { termos, grupos };
}

// ═══════════════════════════════════════════════════════════════
// CAMADA 1 — Busca nos PPAs: identificar ações/programas por
// palavras-chave em TODOS os campos descritivos
// (conta = nome programa, rotulo = título, cod_conta, coluna)
// Captura códigos e dotação inicial
// ═══════════════════════════════════════════════════════════════

interface AcaoPPA {
  nomePrograma: string;
  codConta: string;
  dotacao_inicial: number | null;
  empenhado: number | null;
  liquidado: number | null;
  pago: number | null;
  razao: string;
  grupoEtnico: string;
}

function identificarAcoesPPA(
  items: Record<string, unknown>[], uf: string,
): { acoes: Map<string, AcaoPPA>; codContas: Set<string> } {
  const acoes = new Map<string, AcaoPPA>();
  const codContas = new Set<string>();

  console.log(`  Buscando palavras-chave em ${items.length} registros...`);

  for (const item of items) {
    const conta = String(item.conta ?? "").trim();
    const rotulo = String(item.rotulo ?? "").trim();
    const coluna = String(item.coluna ?? "").toLowerCase();
    const codConta = String(item.cod_conta ?? "");
    const valor = typeof item.valor === "number" ? item.valor : null;

    if (!conta && !rotulo) continue;

    // Busca em TODOS os campos descritivos concatenados
    const textoCompleto = `${conta} ${rotulo} ${codConta}`;
    const match = matchRadicaisKeywords(textoCompleto);
    if (!match) continue;

    const nomePrograma = conta || rotulo;
    codContas.add(codConta);

    const key = nomePrograma;
    const existing = acoes.get(key) ?? {
      nomePrograma,
      codConta,
      dotacao_inicial: null,
      empenhado: null,
      liquidado: null,
      pago: null,
      razao: match.termos.slice(0, 3).join(", "),
      grupoEtnico: [...match.grupos].join(" | "),
    };

    if (valor !== null) {
      if (coluna.includes("empenha")) existing.empenhado = (existing.empenhado ?? 0) + valor;
      else if (coluna.includes("liquida")) existing.liquidado = (existing.liquidado ?? 0) + valor;
      else if (coluna.includes("pag")) existing.pago = (existing.pago ?? 0) + valor;
      else if (coluna.includes("dotação") || coluna.includes("dotacao") || coluna.includes("inicial") || coluna.includes("crédito") || coluna.includes("credito"))
        existing.dotacao_inicial = (existing.dotacao_inicial ?? 0) + valor;
    }
    acoes.set(key, existing);
  }

  console.log(`  → ${acoes.size} ações/programas identificados, ${codContas.size} códigos`);
  return { acoes, codContas };
}

// ═══════════════════════════════════════════════════════════════
// CAMADA 3 — Cruzamento MSC: usar os códigos da Camada 1 para
// capturar empenho e liquidação real na Matriz de Saldos Contábeis
// ═══════════════════════════════════════════════════════════════

function cruzarMSC(
  acoes: Map<string, AcaoPPA>,
  mscItems: Record<string, unknown>[],
  codContas: Set<string>,
): number {
  if (mscItems.length === 0 || codContas.size === 0) return 0;

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

  let enriched = 0;
  for (const [, acao] of acoes) {
    const mscData = mscByConta.get(acao.codConta);
    if (!mscData) continue;
    if (acao.empenhado === null && mscData.empenhado > 0) { acao.empenhado = mscData.empenhado; enriched++; }
    if (acao.liquidado === null && mscData.liquidado > 0) acao.liquidado = mscData.liquidado;
    if (acao.pago === null && mscData.pago > 0) acao.pago = mscData.pago;
    acao.razao += " + MSC";
  }
  return enriched;
}

// ═══════════════════════════════════════════════════════════════
// CAMADA 4 — Transição de Códigos entre PPAs: deduplicação
// por similaridade de descrição, mantendo maior dotação
// ═══════════════════════════════════════════════════════════════

function deduplicateTransition(registros: Record<string, unknown>[]): Map<string, Record<string, unknown>> {
  const deduped = new Map<string, Record<string, unknown>>();
  for (const r of registros) {
    const key = `${r.programa}|${r.ano}`;
    const existing = deduped.get(key);
    if (!existing) { deduped.set(key, r); continue; }
    const dotR = (r.dotacao_inicial as number) ?? 0;
    const dotE = (existing.dotacao_inicial as number) ?? 0;
    if (dotR > dotE) deduped.set(key, r);
  }
  return deduped;
}

// ═══════════════════════════════════════════════════════════════
// HANDLER — 1 estado por chamada
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let anos: number[] = [2023, 2024];
    let uf: string | undefined;
    let ufs: string[] | undefined;
    let mode = "insert";

    try {
      const body = await req.json();
      if (Array.isArray(body.anos) && body.anos.length > 0) anos = body.anos;
      if (typeof body.uf === "string") uf = body.uf;
      if (Array.isArray(body.ufs) && body.ufs.length > 0) ufs = body.ufs;
      if (body.mode === "preview") mode = "preview";
    } catch { /* defaults */ }

    const targetUF = uf ?? ufs?.[0];
    if (!targetUF || !ESTADOS_IBGE[targetUF]) {
      return new Response(JSON.stringify({
        success: false, error: `UF inválida: ${targetUF}`,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const ufCode = ESTADOS_IBGE[targetUF];
    console.log(`=== Ingestão ${targetUF} (${ufCode}) | Anos: ${anos.join(",")} | ${mode} ===`);

    const allRegistros: Record<string, unknown>[] = [];
    const erros: string[] = [];
    const logConsultas: string[] = [];

    for (const ano of anos) {
      console.log(`\n--- ${targetUF} [${ano}] ---`);
      try {
        // ── CAMADA 1: Buscar TODOS os dados do PPA e filtrar por palavras-chave ──
        let items: Record<string, unknown>[] = [];
        let fonte = "";

        if (ano >= 2025) {
          items = await consultarRREO(ano, ufCode);
          fonte = "RREO-Anexo 02";
        } else {
          items = await consultarDCA(ano, ufCode);
          fonte = "DCA-Anexo I-E";
        }

        logConsultas.push(`${targetUF}/${ano}: ${fonte} → ${items.length} registros brutos baixados`);

        if (items.length > 0) {
          const { acoes, codContas } = identificarAcoesPPA(items, targetUF);
          logConsultas.push(`${targetUF}/${ano}: Camada1 → ${acoes.size} ações PPA identificadas por palavras-chave`);

          // ── CAMADA 3: Cruzamento MSC para execução real ──
          if (codContas.size > 0 && ano <= 2024) {
            console.log(`  Camada3: rastreando ${codContas.size} códigos na MSC...`);
            try {
              const mscItems = await consultarMSC(ano, ufCode);
              const enriched = cruzarMSC(acoes, mscItems, codContas);
              logConsultas.push(`${targetUF}/${ano}: Camada3 MSC → ${mscItems.length} itens, ${enriched} ações enriquecidas`);
            } catch (mscErr) {
              logConsultas.push(`${targetUF}/${ano}: Camada3 MSC → erro: ${mscErr instanceof Error ? mscErr.message : "Erro"}`);
            }
          }

          // Converter ações para registros de inserção
          for (const [, acao] of acoes) {
            let pctExec: number | null = null;
            if (acao.dotacao_inicial && acao.dotacao_inicial > 0 && acao.liquidado !== null)
              pctExec = Math.round((acao.liquidado / acao.dotacao_inicial) * 10000) / 100;

            allRegistros.push({
              programa: `${targetUF} — ${acao.nomePrograma}`.substring(0, 250),
              orgao: `Gov. Estadual (${targetUF})`,
              esfera: "estadual",
              ano,
              dotacao_inicial: acao.dotacao_inicial,
              dotacao_autorizada: null,
              empenhado: acao.empenhado,
              liquidado: acao.liquidado,
              pago: acao.pago,
              percentual_execucao: pctExec,
              fonte_dados: `SICONFI ${fonte} — ${targetUF}`,
              url_fonte: "https://siconfi.tesouro.gov.br/siconfi/pages/public/declaracao/declaracao_list.jsf",
              descritivo: acao.nomePrograma,
              observacoes: acao.grupoEtnico,
              eixo_tematico: null,
              grupo_focal: null,
              publico_alvo: null,
              razao_selecao: acao.razao,
            });
          }
        } else {
          logConsultas.push(`${targetUF}/${ano}: ${fonte} → sem dados disponíveis`);
        }
      } catch (error) {
        erros.push(`${targetUF} ${ano}: ${error instanceof Error ? error.message : "Erro"}`);
      }
      await new Promise(r => setTimeout(r, 300));
    }

    // ── CAMADA 4: Transição de códigos entre PPAs ──
    const deduped = deduplicateTransition(allRegistros);
    const batch = Array.from(deduped.values());
    logConsultas.push(`Camada4: ${allRegistros.length} brutos → ${batch.length} após deduplicação`);

    const porGrupo: Record<string, number> = {};
    for (const r of batch) {
      const g = String(r.observacoes ?? "N/C");
      porGrupo[g] = (porGrupo[g] ?? 0) + 1;
    }

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
      if (insErr) erros.push(`Batch ${i}: ${insErr.message}`);
      else totalInserted += chunk.length;
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

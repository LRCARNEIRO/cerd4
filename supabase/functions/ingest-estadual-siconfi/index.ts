import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Códigos IBGE de 2 dígitos
const ESTADOS_IBGE: Record<string, number> = {
  AC: 12, AL: 27, AP: 16, AM: 13, BA: 29, CE: 23, DF: 53,
  ES: 32, GO: 52, MA: 21, MT: 51, MS: 50, MG: 31, PA: 15,
  PB: 25, PR: 41, PE: 26, PI: 22, RJ: 33, RN: 24, RS: 43,
  RO: 11, RR: 14, SC: 42, SP: 35, SE: 28, TO: 17,
};

// ═══════════════════════════════════════════════════════════════
// RADICAIS UNIFICADOS + PALAVRAS-CHAVE (Metodologia Estadual)
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
  { termo: "racial", grupo: "Negro/Afrodescendente" },
  { termo: "racismo", grupo: "Negro/Afrodescendente" },
  { termo: "negro", grupo: "Negro/Afrodescendente" },
  { termo: "negra", grupo: "Negro/Afrodescendente" },
  { termo: "afrodescendente", grupo: "Negro/Afrodescendente" },
  { termo: "consciência negra", grupo: "Negro/Afrodescendente" },
  { termo: "matriz africana", grupo: "Negro/Afrodescendente" },
  { termo: "capoeira", grupo: "Negro/Afrodescendente" },
  { termo: "candomblé", grupo: "Negro/Afrodescendente" },
  { termo: "umbanda", grupo: "Negro/Afrodescendente" },
  { termo: "terreiro", grupo: "Negro/Afrodescendente" },
  { termo: "afro", grupo: "Negro/Afrodescendente" },
  { termo: "seppir", grupo: "Negro/Afrodescendente" },
  { termo: "povos originários", grupo: "Indígena" },
  { termo: "terra indígena", grupo: "Indígena" },
  { termo: "assistência aos indígenas", grupo: "Indígena" },
  { termo: "povos tradicionais", grupo: "Comunidade Tradicional" },
  { termo: "comunidades tradicionais", grupo: "Comunidade Tradicional" },
  { termo: "promoção da igualdade", grupo: "Racial/Étnico" },
  { termo: "discriminação racial", grupo: "Racial/Étnico" },
];

const TERMOS_EXCLUSAO = [
  "direitos da cidadania",
  "direitos individuais coletivos",
  "assistência comunitária",
  "direitos individuais",
];

// Filtros estruturais: Função 14 (Direitos da Cidadania) e Subfunção 422
const FUNCAO_DIREITOS = "14";
const SUBFUNCOES_RELEVANTES = ["422"];

// ═══════════════════════════════════════════════════════════════
// FETCH HELPERS
// ═══════════════════════════════════════════════════════════════

async function fetchJsonSafely(url: string, params: URLSearchParams): Promise<Record<string, unknown>[]> {
  try {
    const fullUrl = `${url}?${params}`;
    console.log(`  Fetching: ${fullUrl}`);
    const res = await fetch(fullUrl, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(60_000),
    });
    if (!res.ok) { console.error(`  HTTP ${res.status}`); return []; }
    const ct = res.headers.get("content-type");
    if (!ct?.includes("application/json")) { return []; }
    const data = await res.json();
    return data?.items ?? [];
  } catch (e) {
    console.error(`  Erro fetch: ${e instanceof Error ? e.message : e}`);
    return [];
  }
}

/** DCA Anexo I-E (Despesas por Função/Subfunção) — 2018-2024 */
async function consultarDCA_IE(ano: number, ufCode: number): Promise<Record<string, unknown>[]> {
  return await fetchJsonSafely(
    "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca",
    new URLSearchParams({
      an_exercicio: String(ano),
      id_ente: String(ufCode),
      no_anexo: "DCA-Anexo I-E",
    }),
  );
}

/** RREO Anexo 02 (Despesas por Função/Subfunção) — 2025+ */
async function consultarRREO_02(ano: number, ufCode: number): Promise<Record<string, unknown>[]> {
  // Tenta bimestres de 6 (mais recente) a 1
  for (let bimestre = 6; bimestre >= 1; bimestre--) {
    const items = await fetchJsonSafely(
      "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo",
      new URLSearchParams({
        an_exercicio: String(ano),
        id_ente: String(ufCode),
        nr_periodo: String(bimestre),
        no_anexo: "RREO-Anexo 02",
        co_tipo_demonstrativo: "RREO",
      }),
    );
    if (items.length > 0) {
      console.log(`  RREO Anexo 02 bimestre ${bimestre}: ${items.length} itens`);
      return items;
    }
  }
  return [];
}

// ═══════════════════════════════════════════════════════════════
// MATCHING LOGIC (3 layers)
// ═══════════════════════════════════════════════════════════════

function checarRadicais(texto: string): { termos: string[]; grupos: Set<string> } | null {
  const lower = texto.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const termos: string[] = [];
  const grupos = new Set<string>();

  // Layer 1: Radicais unificados
  for (const r of RADICAIS) {
    const radNorm = r.radical.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    if (lower.includes(radNorm)) {
      termos.push(r.radical);
      grupos.add(r.grupo);
    }
  }

  // Layer 2: Palavras-chave específicas
  for (const pk of PALAVRAS_CHAVE) {
    const termNorm = pk.termo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    if (lower.includes(termNorm) && !termos.includes(pk.termo)) {
      termos.push(pk.termo);
      grupos.add(pk.grupo);
    }
  }

  if (termos.length === 0) return null;

  // Exclusão de falsos positivos genéricos
  const textoOriginal = texto.toLowerCase();
  for (const excl of TERMOS_EXCLUSAO) {
    if (textoOriginal.includes(excl.toLowerCase())) {
      // Se só tem match genérico (Racial/Étnico), excluir
      if (grupos.size === 1 && (grupos.has("Racial/Étnico") || grupos.has("Racial/Étnico (geral)"))) {
        return null;
      }
    }
  }

  return { termos, grupos };
}

/** Extrai código funcional do campo conta (ex: "14.422" → {funcao:"14", subfuncao:"422"}) */
function extrairCodigoFuncional(conta: string): { funcao: string; subfuncao: string } | null {
  const match = conta.match(/^(\d+)\.(\d+)/);
  if (match) return { funcao: match[1], subfuncao: match[2] };
  return null;
}

// ═══════════════════════════════════════════════════════════════
// PROCESSAMENTO DCA / RREO
// ═══════════════════════════════════════════════════════════════

interface RegistroProcessado {
  conta: string;
  codConta: string;
  empenhado: number | null;
  liquidado: number | null;
  dotacao_inicial: number | null;
  pago: number | null;
  razao: string;
  grupoEtnico: string | null;
  matchLayer: string;
}

function processarItems(
  items: Record<string, unknown>[], uf: string, ano: number, fonteAnexo: string,
): Record<string, unknown>[] {
  if (items.length > 0) {
    const sample = items[0];
    console.log(`  Campos (${fonteAnexo}): ${Object.keys(sample).join(", ")}`);
  }

  const porConta = new Map<string, RegistroProcessado>();

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
    let matchLayer = "";

    // Layer 1: Subfunção 422 + radical/keyword match
    if (funcional && SUBFUNCOES_RELEVANTES.includes(funcional.subfuncao)) {
      const check = checarRadicais(textoCompleto);
      if (check) {
        match = true;
        razao = `SubFn422 + ${check.termos.slice(0, 3).join(", ")}`;
        grupoEtnico = [...check.grupos].join(" | ");
        matchLayer = "L1-SubFn422+Radical";
      }
    }

    // Layer 2: Radical/keyword match em qualquer campo
    if (!match) {
      const check = checarRadicais(textoCompleto);
      if (check) {
        match = true;
        razao = `Radical | ${check.termos.slice(0, 3).join(", ")}`;
        grupoEtnico = [...check.grupos].join(" | ");
        matchLayer = "L2-Radical";
      }
    }

    // Layer 3: Função 14 (filtro estrutural amplo — sem radical obrigatório)
    if (!match && funcional && funcional.funcao === FUNCAO_DIREITOS && funcional.subfuncao) {
      match = true;
      razao = `Fn14.${funcional.subfuncao} (Direitos da Cidadania)`;
      grupoEtnico = "Racial/Étnico (geral)";
      matchLayer = "L3-Fn14";
    }

    if (!match) continue;

    const key = contaDisplay;
    const existing = porConta.get(key) ?? {
      conta: contaDisplay, codConta, empenhado: null, liquidado: null,
      dotacao_inicial: null, pago: null, razao, grupoEtnico, matchLayer,
    };

    if (coluna.includes("empenha")) existing.empenhado = (existing.empenhado ?? 0) + (valor ?? 0);
    else if (coluna.includes("liquida")) existing.liquidado = (existing.liquidado ?? 0) + (valor ?? 0);
    else if (coluna.includes("pag")) existing.pago = (existing.pago ?? 0) + (valor ?? 0);
    else if (coluna.includes("dotação") || coluna.includes("dotacao") || coluna.includes("inicial") || coluna.includes("crédito") || coluna.includes("credito"))
      existing.dotacao_inicial = (existing.dotacao_inicial ?? 0) + (valor ?? 0);

    porConta.set(key, existing);
  }

  const registros: Record<string, unknown>[] = [];
  for (const [, data] of porConta) {
    let percentual_execucao: number | null = null;
    if (data.dotacao_inicial && data.dotacao_inicial > 0 && data.liquidado !== null) {
      percentual_execucao = Math.round((data.liquidado / data.dotacao_inicial) * 10000) / 100;
    }

    registros.push({
      programa: `${uf} — ${data.conta}`.substring(0, 250),
      orgao: `Gov. Estadual (${uf})`,
      esfera: "estadual",
      ano,
      dotacao_inicial: data.dotacao_inicial,
      dotacao_autorizada: null,
      empenhado: data.empenhado,
      liquidado: data.liquidado,
      pago: data.pago,
      percentual_execucao,
      fonte_dados: `SICONFI ${fonteAnexo} — ${uf}`,
      url_fonte: "https://siconfi.tesouro.gov.br/siconfi/pages/public/declaracao/declaracao_list.jsf",
      descritivo: data.conta,
      observacoes: data.grupoEtnico,
      eixo_tematico: null,
      grupo_focal: null,
      publico_alvo: null,
      razao_selecao: `${data.matchLayer} | ${data.razao}`,
    });
  }

  return registros;
}

// ═══════════════════════════════════════════════════════════════
// HANDLER
// ═══════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos: number[] = [2022, 2023, 2024, 2025];
    let ufs: string[] | undefined;
    let mode = "insert"; // "preview" or "insert"

    try {
      const body = await req.json();
      if (Array.isArray(body.anos) && body.anos.length > 0) anos = body.anos;
      if (Array.isArray(body.ufs) && body.ufs.length > 0) ufs = body.ufs;
      if (body.mode === "preview") mode = "preview";
    } catch { /* defaults */ }

    const estadosAlvo = Object.entries(ESTADOS_IBGE).filter(([uf]) =>
      !ufs || ufs.includes(uf)
    );

    console.log(`=== Ingestão Estadual — Metodologia Padrão-Ouro ===`);
    console.log(`Mode: ${mode}`);
    console.log(`Estados: ${estadosAlvo.map(([uf]) => uf).join(", ")}`);
    console.log(`Anos: ${anos.join(", ")}`);
    console.log(`Fonte: DCA Anexo I-E (2018-2024) | RREO Anexo 02 (2025+)`);

    const allRegistros: Record<string, unknown>[] = [];
    const erros: string[] = [];
    const logConsultas: string[] = [];

    for (const [uf, ufCode] of estadosAlvo) {
      for (const ano of anos) {
        console.log(`\n--- ${uf} [${ano}] (id_ente=${ufCode}) ---`);

        try {
          if (ano >= 2025) {
            // 2025+: RREO Anexo 02
            const items = await consultarRREO_02(ano, ufCode);
            if (items.length > 0) {
              const regs = processarItems(items, uf, ano, "RREO-Anexo 02");
              allRegistros.push(...regs);
              logConsultas.push(`${uf}/${ano}: RREO-02 → ${items.length} brutos → ${regs.length} hits`);
            } else {
              logConsultas.push(`${uf}/${ano}: RREO-02 → sem dados`);
            }
          } else {
            // 2018-2024: DCA Anexo I-E
            const items = await consultarDCA_IE(ano, ufCode);
            if (items.length > 0) {
              const regs = processarItems(items, uf, ano, "DCA-Anexo I-E");
              allRegistros.push(...regs);
              logConsultas.push(`${uf}/${ano}: DCA-IE → ${items.length} brutos → ${regs.length} hits`);
            } else {
              logConsultas.push(`${uf}/${ano}: DCA-IE → sem dados`);
            }
          }
        } catch (error) {
          const msg = `${uf} ${ano}: ${error instanceof Error ? error.message : "Erro"}`;
          erros.push(msg);
          console.error(msg);
        }

        await new Promise((r) => setTimeout(r, 350));
      }
    }

    // Deduplicação
    const deduped = new Map<string, Record<string, unknown>>();
    for (const r of allRegistros) {
      const key = `${r.programa}|${r.ano}|${r.fonte_dados}`;
      const existing = deduped.get(key);
      const dotR = (r.dotacao_inicial as number) ?? 0;
      const dotE = (existing?.dotacao_inicial as number) ?? 0;
      if (!existing || dotR > dotE) deduped.set(key, r);
    }

    console.log(`\nDeduplicação: ${allRegistros.length} → ${deduped.size}`);

    const batch = Array.from(deduped.values());

    // ── PREVIEW MODE: retorna dados sem inserir ──
    if (mode === "preview") {
      // Agrupa por layer de match
      const porLayer: Record<string, number> = {};
      const porGrupo: Record<string, number> = {};
      const porUF: Record<string, number> = {};
      for (const r of batch) {
        const razao = String(r.razao_selecao ?? "");
        const layer = razao.split(" | ")[0] || "Desconhecido";
        porLayer[layer] = (porLayer[layer] ?? 0) + 1;
        const grupo = String(r.observacoes ?? "Não classificado");
        porGrupo[grupo] = (porGrupo[grupo] ?? 0) + 1;
        const ufMatch = String(r.programa ?? "").match(/^([A-Z]{2})/);
        if (ufMatch) porUF[ufMatch[1]] = (porUF[ufMatch[1]] ?? 0) + 1;
      }

      return new Response(
        JSON.stringify({
          success: true,
          mode: "preview",
          total_brutos: allRegistros.length,
          total_deduplicados: deduped.size,
          por_layer: porLayer,
          por_grupo_etnico: porGrupo,
          por_uf: porUF,
          log_consultas: logConsultas,
          amostra: batch.slice(0, 30).map(r => ({
            programa: r.programa,
            ano: r.ano,
            dotacao_inicial: r.dotacao_inicial,
            liquidado: r.liquidado,
            razao_selecao: r.razao_selecao,
            grupo: r.observacoes,
          })),
          erros: erros.slice(0, 20),
          metodologia: "Padrão-Ouro: DCA I-E (2018-2024) + RREO Anexo 02 (2025+). Layers: L1-SubFn422+Radical, L2-Radical, L3-Fn14.",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // ── INSERT MODE ──
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const BATCH_SIZE = 50;
    let totalInserted = 0;

    for (let i = 0; i < batch.length; i += BATCH_SIZE) {
      const chunk = batch.slice(i, i + BATCH_SIZE);
      const { error: insErr } = await supabase.from("dados_orcamentarios").insert(chunk);
      if (insErr) {
        erros.push(`Insert batch ${i}: ${insErr.message}`);
        console.error(`Insert error:`, insErr.message);
      } else {
        totalInserted += chunk.length;
      }
    }

    console.log(`\n=== Concluído: ${totalInserted} inseridos, ${erros.length} erros ===`);

    return new Response(
      JSON.stringify({
        success: true,
        mode: "insert",
        total_inseridos: totalInserted,
        total_brutos: allRegistros.length,
        deduplicados: deduped.size,
        estados: estadosAlvo.map(([uf]) => uf),
        anos,
        log_consultas: logConsultas.slice(0, 40),
        erros: erros.slice(0, 20),
        metodologia: "Padrão-Ouro: DCA I-E (2018-2024) + RREO Anexo 02 (2025+). Layers: L1-SubFn422+Radical, L2-Radical, L3-Fn14.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

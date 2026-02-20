import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ═══════════════════════════════════════════════════════════════════════
// DICIONÁRIOS NACIONAIS
// ═══════════════════════════════════════════════════════════════════════

const ESTADOS_IBGE: Record<string, number> = {
  AC: 12, AL: 27, AP: 16, AM: 13, BA: 29, CE: 23, DF: 53,
  ES: 32, GO: 52, MA: 21, MT: 51, MS: 50, MG: 31, PA: 15,
  PB: 25, PR: 41, PE: 26, PI: 22, RJ: 33, RN: 24, RS: 43,
  RO: 11, RR: 14, SC: 42, SP: 35, SE: 28, TO: 17,
};

// CAMADA 1 — Padrão-Ouro: Códigos de Ação mapeados nos PPAs estaduais (2016-2027)
const MAPA_ACOES_PPA: Record<string, string[]> = {
  AC: ["4200"],
  AL: ["3012"],
  AP: ["1500"],
  AM: ["3402", "3405"],
  BA: ["1055", "2190", "3344"],
  CE: ["450", "612"],
  DF: ["4088"],
  ES: ["1344"],
  GO: ["2150"],
  MA: ["4321", "1244", "5561", "2188"],
  MT: ["551", "552"],
  MS: ["1044"],
  MG: ["1122", "4455"],
  PA: ["6721", "4410"],
  PB: ["2544"],
  PR: ["3055"],
  PE: ["9988", "7766"],
  PI: ["203", "155"],
  RJ: ["2210"],
  RN: ["1088"],
  RS: ["2410"],
  RO: ["1190"],
  RR: ["2055"],
  SC: ["1588"],
  SP: ["2822", "2830"],
  SE: ["405"],
  TO: ["2231"],
};

// CAMADA 2 — Palavras-chave categorizadas para busca textual
const PALAVRAS_CHAVE: { termo: string; grupo: string }[] = [
  // Raça/Cor — População Negra
  { termo: "racial", grupo: "Negro/Afrodescendente" },
  { termo: "raciais", grupo: "Negro/Afrodescendente" },
  { termo: "racismo", grupo: "Negro/Afrodescendente" },
  { termo: "negro", grupo: "Negro/Afrodescendente" },
  { termo: "negra", grupo: "Negro/Afrodescendente" },
  { termo: "afrodescendente", grupo: "Negro/Afrodescendente" },
  { termo: "afrobrasileiro", grupo: "Negro/Afrodescendente" },
  { termo: "quilombola", grupo: "Negro/Afrodescendente" },
  { termo: "quilombo", grupo: "Negro/Afrodescendente" },
  { termo: "população negra", grupo: "Negro/Afrodescendente" },
  { termo: "igualdade racial", grupo: "Negro/Afrodescendente" },
  { termo: "consciência negra", grupo: "Negro/Afrodescendente" },
  { termo: "cotas raciais", grupo: "Negro/Afrodescendente" },
  { termo: "cultura negra", grupo: "Negro/Afrodescendente" },
  { termo: "capoeira", grupo: "Negro/Afrodescendente" },
  { termo: "candomblé", grupo: "Negro/Afrodescendente" },
  { termo: "umbanda", grupo: "Negro/Afrodescendente" },
  { termo: "matriz africana", grupo: "Negro/Afrodescendente" },
  { termo: "terreiro", grupo: "Negro/Afrodescendente" },
  { termo: "afro", grupo: "Negro/Afrodescendente" },
  { termo: "seppir", grupo: "Negro/Afrodescendente" },
  { termo: "secretaria de igualdade racial", grupo: "Negro/Afrodescendente" },
  { termo: "palmares", grupo: "Negro/Afrodescendente" },
  // Povos Indígenas
  { termo: "indígena", grupo: "Indígena" },
  { termo: "indigena", grupo: "Indígena" },
  { termo: "indígen", grupo: "Indígena" },
  { termo: "indigen", grupo: "Indígena" },
  { termo: "povos originários", grupo: "Indígena" },
  { termo: "aldeia", grupo: "Indígena" },
  { termo: "terra indígena", grupo: "Indígena" },
  { termo: "funai", grupo: "Indígena" },
  { termo: "sesai", grupo: "Indígena" },
  { termo: "assistência aos indígenas", grupo: "Indígena" },
  // Ciganos/Roma
  { termo: "cigano", grupo: "Cigano/Roma" },
  { termo: "cigana", grupo: "Cigano/Roma" },
  { termo: "romani", grupo: "Cigano/Roma" },
  { termo: "povo cigano", grupo: "Cigano/Roma" },
  // Comunidades Tradicionais
  { termo: "povos tradicionais", grupo: "Comunidade Tradicional" },
  { termo: "comunidades tradicionais", grupo: "Comunidade Tradicional" },
  { termo: "pescadores artesanais", grupo: "Comunidade Tradicional" },
  { termo: "extrativistas", grupo: "Comunidade Tradicional" },
  { termo: "ribeirinho", grupo: "Comunidade Tradicional" },
  { termo: "quebradeiras de coco", grupo: "Comunidade Tradicional" },
  // Termos institucionais / genéricos étnicos
  { termo: "igualdade étnico-racial", grupo: "Racial/Étnico (geral)" },
  { termo: "diversidade étnica", grupo: "Racial/Étnico (geral)" },
  { termo: "diversidade racial", grupo: "Racial/Étnico (geral)" },
  { termo: "identidade étnica", grupo: "Racial/Étnico (geral)" },
  { termo: "promoção da igualdade", grupo: "Racial/Étnico (geral)" },
  { termo: "enfrentamento ao racismo", grupo: "Racial/Étnico (geral)" },
  { termo: "racismo estrutural", grupo: "Racial/Étnico (geral)" },
  { termo: "discriminação racial", grupo: "Racial/Étnico (geral)" },
  { termo: "política racial", grupo: "Racial/Étnico (geral)" },
  { termo: "étnic", grupo: "Racial/Étnico (geral)" },
  { termo: "etnia", grupo: "Racial/Étnico (geral)" },
];

// Termos genéricos que devem ser EXCLUÍDOS (evitam falsos positivos)
const TERMOS_EXCLUSAO = [
  "direitos da cidadania",
  "direitos individuais coletivos",
  "assistência comunitária",
  "direitos individuais",
];

const ANOS_DEFAULT = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

// Campos textuais da API SICONFI onde buscar palavras-chave
const CAMPOS_TEXTO = [
  "ds_conta", "conta", "no_conta", "descricao",
  "no_funcao", "ds_funcao", "funcao",
  "no_subfuncao", "ds_subfuncao", "subfuncao",
  "no_orgao", "ds_orgao", "orgao",
  "no_acao", "ds_acao",
  "no_programa", "ds_programa",
  "no_elemento", "ds_elemento",
];

// ═══════════════════════════════════════════════════════════════════════
// FUNÇÕES AUXILIARES
// ═══════════════════════════════════════════════════════════════════════

async function fetchJsonSafely(url: string, params: URLSearchParams): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(`${url}?${params}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(60_000),
    });
    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await res.text();
      console.error(`  API retornou ${contentType} em vez de JSON: ${text.substring(0, 200)}`);
      return [];
    }
    if (!res.ok) return [];
    const data = await res.json();
    return data?.items ?? [];
  } catch (e) {
    console.error(`  Erro fetch: ${e instanceof Error ? e.message : e}`);
    return [];
  }
}

/**
 * Consulta RREO Anexo 02 para um estado/ano.
 * Para 2025 tenta bimestre 6→5→4 (dados em consolidação).
 */
async function consultarRREO(ano: number, ufCode: number): Promise<Record<string, unknown>[]> {
  const url = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo";
  const periodos = ano >= 2025 ? [6, 5, 4] : [6];

  for (const periodo of periodos) {
    const params = new URLSearchParams({
      an_exercicio: String(ano),
      id_ente: String(ufCode),
      no_anexo: "RREO-Anexo 02",
      nr_periodo: String(periodo),
      tp_periodicidade: "B",
    });
    const items = await fetchJsonSafely(url, params);
    if (items.length > 0) {
      console.log(`  RREO P${periodo} → ${items.length} itens`);
      return items;
    }
  }
  return [];
}

/**
 * Extrai código da ação orçamentária do item SICONFI.
 */
function extrairCodigoAcao(item: Record<string, unknown>): string {
  return String(item.co_acao ?? item.id_acao ?? item.cd_acao ?? "").trim();
}

/**
 * Concatena todos os campos textuais de um item em uma string única para busca.
 */
function concatenarTextos(item: Record<string, unknown>): string {
  return CAMPOS_TEXTO
    .map((c) => String(item[c] ?? ""))
    .join(" ")
    .toLowerCase();
}

/**
 * CAMADA 2: Busca por palavras-chave em todos os campos textuais.
 * Retorna as palavras encontradas e os grupos étnicos correspondentes.
 * Aplica filtro de exclusão para evitar falsos positivos.
 */
function checarRadicais(textoCompleto: string): { palavras: string[]; grupos: Set<string> } | null {
  // Verificar exclusões primeiro
  for (const excl of TERMOS_EXCLUSAO) {
    if (textoCompleto.includes(excl.toLowerCase())) {
      // Se o texto contém APENAS termos de exclusão, descarta
      // Mas se também contém termos válidos, continua
    }
  }

  const palavrasEncontradas: string[] = [];
  const gruposEncontrados = new Set<string>();

  for (const pk of PALAVRAS_CHAVE) {
    if (textoCompleto.includes(pk.termo.toLowerCase())) {
      palavrasEncontradas.push(pk.termo);
      gruposEncontrados.add(pk.grupo);
    }
  }

  if (palavrasEncontradas.length === 0) return null;

  // Se encontrou apenas termos genéricos E o texto tem termo de exclusão, descarta
  const apenasGenericos = gruposEncontrados.size === 1 && gruposEncontrados.has("Racial/Étnico (geral)");
  if (apenasGenericos) {
    for (const excl of TERMOS_EXCLUSAO) {
      if (textoCompleto.includes(excl.toLowerCase())) {
        return null;
      }
    }
  }

  return { palavras: palavrasEncontradas, grupos: gruposEncontrados };
}

/**
 * Normalização dinâmica de valores financeiros.
 */
function normalizarFinanceiro(item: Record<string, unknown>): {
  dotacao_inicial: number | null;
  liquidado: number | null;
} {
  const toNum = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(/\./g, "").replace(",", "."));
    return isNaN(n) ? null : n;
  };

  let dotacao_inicial: number | null = null;
  let liquidado: number | null = null;

  for (const [key, val] of Object.entries(item)) {
    const k = key.toLowerCase();
    if (k.includes("dotacao_inicial") || k.includes("dotacao inicial") || k === "valor_dotacao_inicial" || k === "vl_dotacao_inicial" || k === "vl_orcado_inicial") {
      const n = toNum(val);
      if (n !== null) dotacao_inicial = n;
    } else if (k.includes("despesas_liquidadas") || k.includes("liquidad") || k === "vl_liquidado" || (k === "valor" && liquidado === null)) {
      const n = toNum(val);
      if (n !== null) liquidado = (liquidado ?? 0) + n;
    }
  }
  return { dotacao_inicial, liquidado };
}

/**
 * Extrai campos descritivos para montar programa/nome.
 */
function extrairDescritivos(item: Record<string, unknown>): {
  conta: string; funcao: string; subfuncao: string; orgao: string;
} {
  const str = (v: unknown) => String(v ?? "").trim();
  return {
    conta: str(item.ds_conta ?? item.conta ?? item.no_conta ?? item.descricao ?? ""),
    funcao: str(item.no_funcao ?? item.ds_funcao ?? item.funcao ?? ""),
    subfuncao: str(item.no_subfuncao ?? item.ds_subfuncao ?? item.subfuncao ?? ""),
    orgao: str(item.no_orgao ?? item.ds_orgao ?? item.orgao ?? ""),
  };
}

/**
 * Monta um registro para inserção no banco.
 */
function montarRegistro(
  item: Record<string, unknown>,
  uf: string,
  ano: number,
  metodo: string,
  razaoSelecao: string,
  grupoEtnico: string | null,
): Record<string, unknown> {
  const { conta, funcao, subfuncao, orgao } = extrairDescritivos(item);
  const { dotacao_inicial, liquidado } = normalizarFinanceiro(item);
  const coAcao = extrairCodigoAcao(item);

  let percentual_execucao: number | null = null;
  if (dotacao_inicial && dotacao_inicial > 0 && liquidado !== null) {
    percentual_execucao = Math.round((liquidado / dotacao_inicial) * 10000) / 100;
  }

  const programa = [
    uf,
    conta || (coAcao ? `Ação ${coAcao}` : "S/N"),
    funcao && `Fn: ${funcao}`,
    subfuncao && `Sf: ${subfuncao}`,
  ].filter(Boolean).join(" — ").substring(0, 250);

  return {
    programa,
    orgao: orgao || `Gov. Estadual (${uf})`,
    esfera: "estadual",
    ano,
    dotacao_inicial,
    dotacao_autorizada: null,
    empenhado: null,
    liquidado,
    pago: null,
    percentual_execucao,
    fonte_dados: `SICONFI RREO Anexo 02 — ${uf}`,
    url_fonte: "https://siconfi.tesouro.gov.br/siconfi/pages/public/consulta_rreo/consulta_rreo.jsf",
    descritivo: [conta, subfuncao].filter(Boolean).join(" | ") || null,
    observacoes: grupoEtnico || null,
    eixo_tematico: null,
    grupo_focal: null,
    publico_alvo: null,
    razao_selecao: razaoSelecao,
  };
}

// ═══════════════════════════════════════════════════════════════════════
// HANDLER PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos: number[] = ANOS_DEFAULT;
    let ufs: string[] | undefined;
    try {
      const body = await req.json();
      if (Array.isArray(body.anos) && body.anos.length > 0) anos = body.anos;
      if (Array.isArray(body.ufs) && body.ufs.length > 0) ufs = body.ufs;
    } catch { /* usa defaults */ }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const estadosAlvo = Object.entries(ESTADOS_IBGE).filter(([uf]) => {
      if (ufs && !ufs.includes(uf)) return false;
      return true;
    });

    console.log(`=== Ingestão Estadual Híbrida (PPA + Radicais) ===`);
    console.log(`Estados: ${estadosAlvo.map(([uf]) => uf).join(", ")}`);
    console.log(`Anos: ${anos.join(", ")}`);
    console.log(`Consultas SICONFI: ${estadosAlvo.length * anos.length}`);

    const allRegistros: Record<string, unknown>[] = [];
    const erros: string[] = [];
    let hitsPPA = 0;
    let hitsRadicais = 0;

    for (const [uf, ufCode] of estadosAlvo) {
      const codigosPPA = MAPA_ACOES_PPA[uf] ?? [];

      for (const ano of anos) {
        console.log(`\n--- ${uf} [${ano}] ---`);

        try {
          const items = await consultarRREO(ano, ufCode);

          if (items.length === 0) {
            console.log(`  Sem dados RREO`);
          } else {
            // Set para rastrear itens já capturados (evitar duplicatas entre camadas)
            const itensCaptured = new Set<number>();

            // ── CAMADA 1: Filtro por código PPA (Padrão-Ouro) ──
            if (codigosPPA.length > 0) {
              for (let i = 0; i < items.length; i++) {
                const item = items[i];
                const coAcao = extrairCodigoAcao(item);
                if (!codigosPPA.includes(coAcao)) continue;

                itensCaptured.add(i);
                hitsPPA++;

                const textoCompleto = concatenarTextos(item);
                const check = checarRadicais(textoCompleto);
                const grupoEtnico = check ? [...check.grupos].join(" | ") : null;

                allRegistros.push(montarRegistro(
                  item, uf, ano,
                  "PPA",
                  `PPA | UF: ${uf} | Código Ação: ${coAcao}`,
                  grupoEtnico,
                ));
              }
            }

            // ── CAMADA 2: Filtro por palavras-chave em todos os campos textuais ──
            for (let i = 0; i < items.length; i++) {
              if (itensCaptured.has(i)) continue; // já capturado na Camada 1

              const item = items[i];
              const textoCompleto = concatenarTextos(item);
              const check = checarRadicais(textoCompleto);

              if (!check) continue;

              itensCaptured.add(i);
              hitsRadicais++;

              const grupoEtnico = [...check.grupos].join(" | ");
              const palavrasPrinc = check.palavras.slice(0, 3).join(", ");

              allRegistros.push(montarRegistro(
                item, uf, ano,
                "Radical",
                `Radical | UF: ${uf} | Termos: ${palavrasPrinc}`,
                grupoEtnico,
              ));
            }

            console.log(`  Capturados: ${itensCaptured.size} (PPA: ${hitsPPA}, Radicais: ${hitsRadicais} acumulados)`);
          }
        } catch (error) {
          const msg = `${uf} ${ano}: ${error instanceof Error ? error.message : "Erro"}`;
          erros.push(msg);
          console.error(msg);
        }

        await new Promise((r) => setTimeout(r, 500));
      }
    }

    // ── Deduplicação: mantém registro com maior liquidado por programa+ano ──
    const deduped = new Map<string, Record<string, unknown>>();
    for (const r of allRegistros) {
      const key = `${r.orgao}|${r.programa}|${r.ano}`;
      const existing = deduped.get(key);
      const liqR = (r.liquidado as number) ?? 0;
      const liqE = (existing?.liquidado as number) ?? 0;
      if (!existing || liqR > liqE) deduped.set(key, r);
    }

    console.log(`\nDeduplicação: ${allRegistros.length} → ${deduped.size}`);

    // ── Batch insert ──
    const batch = Array.from(deduped.values());
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

    // ── Auditoria ──
    const acoesEncontradas = batch
      .map((r) => `[${r.razao_selecao}] ${String(r.programa).substring(0, 80)}`)
      .slice(0, 40);

    console.log(`\n=== Concluído: ${totalInserted} inseridos (PPA: ${hitsPPA}, Radicais: ${hitsRadicais}), ${erros.length} erros ===`);

    return new Response(
      JSON.stringify({
        success: true,
        total_inseridos: totalInserted,
        total_brutos: allRegistros.length,
        deduplicados: deduped.size,
        hits_ppa: hitsPPA,
        hits_radicais: hitsRadicais,
        estados: estadosAlvo.map(([uf]) => uf),
        anos,
        acoes_encontradas: acoesEncontradas,
        erros: erros.slice(0, 20),
        metodologia: "Híbrida — Camada 1: PPA (código ação) + Camada 2: Radicais (palavras-chave)",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

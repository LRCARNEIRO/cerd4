import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Dicionário Nacional Completo — IDs IBGE para os 27 estados
const ESTADOS_IBGE: Record<string, number> = {
  AC: 12, AL: 27, AP: 16, AM: 13, BA: 29, CE: 23, DF: 53,
  ES: 32, GO: 52, MA: 21, MT: 51, MS: 50, MG: 31, PA: 15,
  PB: 25, PR: 41, PE: 26, PI: 22, RJ: 33, RN: 24, RS: 43,
  RO: 11, RR: 14, SC: 42, SP: 35, SE: 28, TO: 17,
};

// Mapa de Ações PPA por estado — códigos mapeados nos PPAs estaduais (2016-2027)
// Estratégia "Padrão-Ouro": busca por código de ação, não por texto
const MAPA_ACOES: Record<string, string[]> = {
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

const ANOS_DEFAULT = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

/**
 * Consulta RREO Anexo 02 para um estado/ano.
 * Para 2025 tenta bimestre 6→5→4 (dados ainda em consolidação).
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

    try {
      const res = await fetch(`${url}?${params}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(60_000),
      });
      if (res.ok) {
        const data = await res.json();
        const items: Record<string, unknown>[] = data?.items ?? [];
        if (items.length > 0) {
          console.log(`  RREO P${periodo} → ${items.length} itens`);
          return items;
        }
      }
    } catch (e) {
      console.error(`  Erro RREO P${periodo} (${ufCode}/${ano}):`, e);
    }
  }
  return [];
}

/**
 * Extrai o código da ação orçamentária do item.
 * A API do Siconfi pode retornar como 'co_acao', 'id_acao' ou via 'ds_conta' com prefixo numérico.
 */
function extrairCodigoAcao(item: Record<string, unknown>): string {
  const coAcao = item.co_acao ?? item.id_acao ?? item.cd_acao ?? "";
  return String(coAcao).trim();
}

/**
 * Normalização dinâmica de colunas financeiras.
 * A API varia os nomes entre versões (v_coluna_*, valor, etc.).
 */
function normalizarFinanceiro(item: Record<string, unknown>): {
  dotacao_inicial: number | null;
  liquidado: number | null;
} {
  let dotacao_inicial: number | null = null;
  let liquidado: number | null = null;

  const toNum = (v: unknown): number | null => {
    if (v === null || v === undefined || v === "") return null;
    const n = typeof v === "number" ? v : Number(String(v).replace(/\./g, "").replace(",", "."));
    return isNaN(n) ? null : n;
  };

  for (const [key, val] of Object.entries(item)) {
    const k = key.toLowerCase();

    if (
      k.includes("dotacao_inicial") ||
      k.includes("dotacao inicial") ||
      k === "valor_dotacao_inicial"
    ) {
      const n = toNum(val);
      if (n !== null) dotacao_inicial = n;
    } else if (
      k.includes("despesas_liquidadas") ||
      k.includes("liquidad") ||
      (k === "valor" && liquidado === null)
    ) {
      const n = toNum(val);
      if (n !== null) liquidado = (liquidado ?? 0) + n;
    }
  }

  return { dotacao_inicial, liquidado };
}

/**
 * Extrai campos descritivos do item para montar o nome do programa.
 */
function extrairDescritivos(item: Record<string, unknown>): {
  conta: string;
  funcao: string;
  subfuncao: string;
  orgao: string;
} {
  const str = (v: unknown) => String(v ?? "").trim();
  return {
    conta: str(item.ds_conta ?? item.conta ?? item.no_conta ?? item.descricao ?? ""),
    funcao: str(item.no_funcao ?? item.ds_funcao ?? item.funcao ?? ""),
    subfuncao: str(item.no_subfuncao ?? item.ds_subfuncao ?? item.subfuncao ?? ""),
    orgao: str(item.no_orgao ?? item.ds_orgao ?? item.orgao ?? ""),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parâmetros opcionais via body (padrão: todos os estados e anos)
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

    // Filtra estados alvo: apenas os que têm mapeamento PPA definido
    const estadosAlvo = Object.entries(ESTADOS_IBGE).filter(([uf]) => {
      if (ufs && !ufs.includes(uf)) return false;
      return !!MAPA_ACOES[uf]; // só estados com códigos PPA mapeados
    });

    const totalConsultas = estadosAlvo.length * anos.length;

    console.log(`=== Ingestão Estadual — Estratégia PPA (Código de Ação) ===`);
    console.log(`Estados: ${estadosAlvo.map(([uf]) => uf).join(", ")}`);
    console.log(`Anos: ${anos.join(", ")}`);
    console.log(`Total de consultas SICONFI: ${totalConsultas}`);

    const allRegistros: Record<string, unknown>[] = [];
    const erros: string[] = [];
    let totalAcoes = 0;

    for (const [uf, ufCode] of estadosAlvo) {
      const codigosAlvo = MAPA_ACOES[uf];

      for (const ano of anos) {
        console.log(`\n--- ${uf} [${ano}] | Códigos PPA: ${codigosAlvo.join(", ")} ---`);

        try {
          const items = await consultarRREO(ano, ufCode);

          if (items.length === 0) {
            console.log(`  Sem dados RREO`);
          } else {
            // Filtro por código de ação (estratégia PPA — exato e sem ambiguidade textual)
            for (const item of items) {
              const coAcao = extrairCodigoAcao(item);

              if (!codigosAlvo.includes(coAcao)) continue;

              const { conta, funcao, subfuncao, orgao } = extrairDescritivos(item);
              const { dotacao_inicial, liquidado } = normalizarFinanceiro(item);

              // Gap de execução: indicador de "Orçamento Simbólico" para o CERD
              let percentual_execucao: number | null = null;
              if (dotacao_inicial && dotacao_inicial > 0 && liquidado !== null) {
                percentual_execucao = Math.round((liquidado / dotacao_inicial) * 10000) / 100;
              }

              const programa = [
                uf,
                conta || `Ação ${coAcao}`,
                funcao && `Fn: ${funcao}`,
                subfuncao && `Sf: ${subfuncao}`,
              ]
                .filter(Boolean)
                .join(" — ")
                .substring(0, 250);

              allRegistros.push({
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
                observacoes: null,
                eixo_tematico: null,
                grupo_focal: null,
                publico_alvo: null,
                razao_selecao: `PPA | UF: ${uf} | Código Ação: ${coAcao}`,
              });

              totalAcoes++;
            }

            console.log(`  → ${totalAcoes} ações PPA encontradas até agora`);
          }
        } catch (error) {
          const msg = `${uf} ${ano}: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
          erros.push(msg);
          console.error(msg);
        }

        // Rate limiting — 500ms entre requests
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    // Deduplicação: mantém o registro com maior liquidado por programa+ano
    const deduped = new Map<string, Record<string, unknown>>();
    for (const r of allRegistros) {
      const key = `${r.orgao}|${r.programa}|${r.ano}`;
      const existing = deduped.get(key);
      const liqR = (r.liquidado as number) ?? 0;
      const liqE = (existing?.liquidado as number) ?? 0;
      if (!existing || liqR > liqE) deduped.set(key, r);
    }

    console.log(`\nDeduplicação: ${allRegistros.length} → ${deduped.size} registros`);

    // Batch insert no banco
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

    // Auditoria: lista as ações encontradas (para validação do cruzamento PPA×Siconfi)
    const acoesEncontradas = batch
      .map((r) => `[${r.razao_selecao}] ${String(r.programa).substring(0, 80)}`)
      .slice(0, 30);

    console.log(`\n=== Concluído: ${totalInserted} inseridos, ${erros.length} erros ===`);

    return new Response(
      JSON.stringify({
        success: true,
        total_inseridos: totalInserted,
        total_brutos: allRegistros.length,
        deduplicados: deduped.size,
        estados: estadosAlvo.map(([uf]) => uf),
        anos,
        acoes_encontradas: acoesEncontradas,
        erros: erros.slice(0, 20),
        metodologia: "PPA — busca por código de ação orçamentária",
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

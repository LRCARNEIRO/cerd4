import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Dicionário Nacional Completo — mesmos IDs IBGE do script Python
const ESTADOS_BR: Record<string, number> = {
  AC: 12, AL: 27, AP: 16, AM: 13, BA: 29, CE: 23, DF: 53,
  ES: 32, GO: 52, MA: 21, MT: 51, MS: 50, MG: 31, PA: 15,
  PB: 25, PR: 41, PE: 26, PI: 22, RJ: 33, RN: 24, RS: 43,
  RO: 11, RR: 14, SC: 42, SP: 35, SE: 28, TO: 17,
};

const ANOS_DEFAULT = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

// Radicais e palavras-chave — idênticos ao script Python
const RADICAIS = [
  "racial", "racismo", "igualdade racial", "igualdade étnica", "quilombol",
  "indígen", "indigen", "cigan", "romani", "terreiro", "matriz africana",
  "afro", "promoção da igualdade", "cultura negra", "capoeira", "negro",
  "negra", "candomblé", "umbanda", "povos tradicionais", "comunidades tradicionais",
  "étnic", "etnia", "palmares", "funai", "sesai", "assistência aos indígenas",
];

/**
 * Busca RREO Anexo 02 para todos os anos.
 * Equivale a extrair_siconfi_robusto() do script Python.
 * Para 2025 tenta bimestre 6→5→4 (dados ainda em consolidação).
 */
async function extrairSiconfiRobusto(ano: number, ufCode: number): Promise<Record<string, unknown>[]> {
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
          console.log(`  RREO P${periodo} → ${items.length} itens brutos`);
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
 * Verifica todos os valores string de um item em busca dos radicais.
 * Retorna o primeiro radical encontrado (razao_selecao) ou null.
 * Equivale ao checar_radicais() do script Python.
 */
function checarRadicais(item: Record<string, unknown>): string | null {
  const texto = Object.values(item)
    .filter((v) => typeof v === "string")
    .join(" ")
    .toLowerCase();

  for (const radical of RADICAIS) {
    if (texto.includes(radical.toLowerCase())) {
      return radical;
    }
  }
  return null;
}

/**
 * Normalização dinâmica de colunas de valores.
 * Procura chaves que contenham 'dotacao_inicial' ou 'liquidada'
 * — mesma lógica do rename dinâmico do script Python.
 */
function normalizarValores(item: Record<string, unknown>): {
  dotacao_inicial: number | null;
  liquidado: number | null;
} {
  let dotacao_inicial: number | null = null;
  let liquidado: number | null = null;

  for (const [key, val] of Object.entries(item)) {
    const k = key.toLowerCase();
    const num = typeof val === "number" ? val : Number(String(val).replace(/\./g, "").replace(",", "."));

    if (!isNaN(num) && num !== 0) {
      if (k.includes("dotacao_inicial") || k.includes("dotacao inicial") || k.includes("v_coluna_dotacao_inicial")) {
        dotacao_inicial = num;
      } else if (k.includes("liquidad") || k.includes("v_coluna_despesas_liquidadas")) {
        liquidado = (liquidado ?? 0) + num;
      }
    }
  }
  return { dotacao_inicial, liquidado };
}

/**
 * Extrai campos descritivos relevantes (conta, função, subfunção, órgão).
 * Equivale às colunas 'conta' e 'funcao' do df_export do Python.
 */
function extrairDescritivos(item: Record<string, unknown>): {
  ds_conta: string;
  funcao: string;
  subfuncao: string;
  orgao: string;
} {
  const str = (v: unknown) => String(v ?? "").trim();
  return {
    ds_conta: str(item.ds_conta ?? item.conta ?? item.no_conta ?? item.descricao ?? ""),
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

    const estadosAlvo = ufs
      ? Object.entries(ESTADOS_BR).filter(([uf]) => ufs!.includes(uf))
      : Object.entries(ESTADOS_BR);

    console.log(`=== Ingestão Estadual SICONFI (RREO Anexo 02) ===`);
    console.log(`Estados: ${estadosAlvo.map(([uf]) => uf).join(", ")}`);
    console.log(`Anos: ${anos.join(", ")}`);
    console.log(`Radicais: ${RADICAIS.length} termos`);

    const allRegistros: Record<string, unknown>[] = [];
    const erros: string[] = [];

    for (const [uf, code] of estadosAlvo) {
      for (const ano of anos) {
        console.log(`\n--- ${uf} [${ano}] ---`);

        try {
          const items = await extrairSiconfiRobusto(ano, code);

          if (items.length === 0) {
            console.log(`  Sem dados RREO`);
            continue;
          }

          // Log dos campos disponíveis (debug)
          const campos = Object.keys(items[0]).join(", ");
          console.log(`  Campos: ${campos.substring(0, 200)}`);

          // Filtra por radicais em TODOS os campos de texto (como o .apply() do Python)
          for (const item of items) {
            const razao = checarRadicais(item);
            if (!razao) continue;

            const { ds_conta, funcao, subfuncao, orgao } = extrairDescritivos(item);

            // Rejeita metadados de planilha (lixo estrutural da API)
            const contaLower = ds_conta.toLowerCase();
            if (
              contaLower.includes("<ec") ||
              contaLower.includes("<mr") ||
              contaLower.startsWith("total das despesas") ||
              contaLower.startsWith("despesas (intra") ||
              contaLower.startsWith("receita") ||
              ds_conta.length < 3
            ) continue;

            const { dotacao_inicial, liquidado } = normalizarValores(item);

            // Calcula percentual de execução (como execucao_perc do Python)
            let percentual_execucao: number | null = null;
            if (dotacao_inicial && dotacao_inicial > 0 && liquidado !== null) {
              percentual_execucao = Math.round((liquidado / dotacao_inicial) * 10000) / 100;
            }

            // Monta nome do programa com contexto máximo disponível
            const programa = [uf, ds_conta, funcao && `Fn: ${funcao}`, subfuncao && `Sf: ${subfuncao}`]
              .filter(Boolean).join(" — ").substring(0, 250);

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
              descritivo: [ds_conta, subfuncao].filter(Boolean).join(" | ") || null,
              observacoes: null,
              eixo_tematico: null,
              grupo_focal: null,
              publico_alvo: null,
              razao_selecao: `RREO SICONFI | Radical: ${razao}`,
            });
          }

          console.log(`  → ${allRegistros.filter((r) => r.esfera === "estadual").length} acumulados até agora`);
        } catch (error) {
          const msg = `${uf} ${ano}: ${error instanceof Error ? error.message : "Erro desconhecido"}`;
          erros.push(msg);
          console.error(msg);
        }

        // Rate limiting — 500ms entre requests (igual ao script Python)
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

    // Batch insert no Supabase
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

    // Resumo para auditoria (equivale ao df_export do Python)
    const programasEncontrados = batch
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
        programas_encontrados: programasEncontrados,
        erros: erros.slice(0, 20),
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

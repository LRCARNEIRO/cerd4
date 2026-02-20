import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Códigos IBGE de 2 dígitos (confirmado pela API)
const ESTADOS_IBGE: Record<string, number> = {
  AC: 12, AL: 27, AP: 16, AM: 13, BA: 29, CE: 23, DF: 53,
  ES: 32, GO: 52, MA: 21, MT: 51, MS: 50, MG: 31, PA: 15,
  PB: 25, PR: 41, PE: 26, PI: 22, RJ: 33, RN: 24, RS: 43,
  RO: 11, RR: 14, SC: 42, SP: 35, SE: 28, TO: 17,
};

// Palavras-chave categorizadas para busca no campo `conta` do DCA
const PALAVRAS_CHAVE: { termo: string; grupo: string }[] = [
  { termo: "racial", grupo: "Negro/Afrodescendente" },
  { termo: "raciais", grupo: "Negro/Afrodescendente" },
  { termo: "racismo", grupo: "Negro/Afrodescendente" },
  { termo: "negro", grupo: "Negro/Afrodescendente" },
  { termo: "negra", grupo: "Negro/Afrodescendente" },
  { termo: "afrodescendente", grupo: "Negro/Afrodescendente" },
  { termo: "quilombola", grupo: "Negro/Afrodescendente" },
  { termo: "quilombo", grupo: "Negro/Afrodescendente" },
  { termo: "igualdade racial", grupo: "Negro/Afrodescendente" },
  { termo: "consciência negra", grupo: "Negro/Afrodescendente" },
  { termo: "matriz africana", grupo: "Negro/Afrodescendente" },
  { termo: "capoeira", grupo: "Negro/Afrodescendente" },
  { termo: "candomblé", grupo: "Negro/Afrodescendente" },
  { termo: "umbanda", grupo: "Negro/Afrodescendente" },
  { termo: "terreiro", grupo: "Negro/Afrodescendente" },
  { termo: "afro", grupo: "Negro/Afrodescendente" },
  { termo: "seppir", grupo: "Negro/Afrodescendente" },
  { termo: "palmares", grupo: "Negro/Afrodescendente" },
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
  { termo: "cigano", grupo: "Cigano/Roma" },
  { termo: "cigana", grupo: "Cigano/Roma" },
  { termo: "romani", grupo: "Cigano/Roma" },
  { termo: "povos tradicionais", grupo: "Comunidade Tradicional" },
  { termo: "comunidades tradicionais", grupo: "Comunidade Tradicional" },
  { termo: "extrativistas", grupo: "Comunidade Tradicional" },
  { termo: "ribeirinho", grupo: "Comunidade Tradicional" },
  { termo: "quebradeiras de coco", grupo: "Comunidade Tradicional" },
  { termo: "étnic", grupo: "Racial/Étnico (geral)" },
  { termo: "etnia", grupo: "Racial/Étnico (geral)" },
  { termo: "diversidade étnica", grupo: "Racial/Étnico (geral)" },
  { termo: "promoção da igualdade", grupo: "Racial/Étnico (geral)" },
  { termo: "discriminação racial", grupo: "Racial/Étnico (geral)" },
];

const TERMOS_EXCLUSAO = [
  "direitos da cidadania",
  "direitos individuais coletivos",
  "assistência comunitária",
  "direitos individuais",
];

// Subfunções orçamentárias relevantes (captura por código funcional)
const SUBFUNCOES_RELEVANTES = ["422", "846"];
// Função 14 = Direitos da Cidadania (captura ampla)
const FUNCAO_DIREITOS = "14";

const ANOS_DEFAULT = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];

// ═══════════════════════════════════════════════════════════════════════

async function fetchJsonSafely(url: string, params: URLSearchParams): Promise<Record<string, unknown>[]> {
  try {
    const res = await fetch(`${url}?${params}`, {
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

/** Consulta DCA I-E (Despesas por Função/Subfunção) — fonte primária */
async function consultarDCA_IE(ano: number, ufCode: number): Promise<Record<string, unknown>[]> {
  const url = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca";
  const params = new URLSearchParams({
    an_exercicio: String(ano),
    id_ente: String(ufCode),
    no_anexo: "DCA-Anexo I-E",
  });
  return await fetchJsonSafely(url, params);
}

/** Consulta DCA I-D (Balanço Orçamentário Despesas) — complemento */
async function consultarDCA_ID(ano: number, ufCode: number): Promise<Record<string, unknown>[]> {
  const url = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca";
  const params = new URLSearchParams({
    an_exercicio: String(ano),
    id_ente: String(ufCode),
    no_anexo: "DCA-Anexo I-D",
  });
  return await fetchJsonSafely(url, params);
}

function checarRadicais(texto: string): { palavras: string[]; grupos: Set<string> } | null {
  const lower = texto.toLowerCase();
  const palavras: string[] = [];
  const grupos = new Set<string>();

  for (const pk of PALAVRAS_CHAVE) {
    if (lower.includes(pk.termo.toLowerCase())) {
      palavras.push(pk.termo);
      grupos.add(pk.grupo);
    }
  }
  if (palavras.length === 0) return null;

  // Exclusão de falsos positivos genéricos
  if (grupos.size === 1 && grupos.has("Racial/Étnico (geral)")) {
    for (const excl of TERMOS_EXCLUSAO) {
      if (lower.includes(excl.toLowerCase())) return null;
    }
  }
  return { palavras, grupos };
}

/** Extrai código funcional do campo conta (ex: "14.422" → {funcao:"14", subfuncao:"422"}) */
function extrairCodigoFuncional(conta: string): { funcao: string; subfuncao: string } | null {
  const match = conta.match(/^(\d+)\.(\d+)/);
  if (match) return { funcao: match[1], subfuncao: match[2] };
  const matchSimples = conta.match(/^(\d+)\s*-/);
  if (matchSimples) return { funcao: matchSimples[1], subfuncao: "" };
  return null;
}

/** Processa itens DCA (estrutura real: exercicio, rotulo, coluna, valor, cod_conta) */
function processarDCA(
  items: Record<string, unknown>[], uf: string, ano: number, fonteAnexo: string,
): Record<string, unknown>[] {
  // Log amostra do primeiro item para diagnóstico de campos
  if (items.length > 0) {
    const sample = items[0];
    console.log(`  Campos DCA (${fonteAnexo}): ${Object.keys(sample).join(", ")}`);
    console.log(`  Amostra: rotulo=${sample.rotulo}, coluna=${sample.coluna}, valor=${sample.valor}, cod_conta=${sample.cod_conta}, conta=${sample.conta}`);
  }

  // Agrupar por conta para consolidar Empenhada/Liquidada/Paga
  const porConta = new Map<string, {
    conta: string; codConta: string; coluna: string;
    empenhado: number | null; liquidado: number | null;
    dotacao_inicial: number | null; pago: number | null;
    razao: string; grupoEtnico: string | null;
  }>();

  for (const item of items) {
    // O DCA retorna AMBOS: "conta" (descritivo da linha) e "rotulo" (cabeçalho genérico)
    // Usar "conta" como identificador, mas buscar keywords em TODOS os campos
    const conta = String(item.conta ?? "").trim();
    const rotulo = String(item.rotulo ?? "").trim();
    const coluna = String(item.coluna ?? "").toLowerCase();
    const codConta = String(item.cod_conta ?? "");
    const valor = typeof item.valor === "number" ? item.valor : null;

    if ((!conta && !rotulo) || valor === null) continue;

    const contaDisplay = conta || rotulo; // Para exibição
    // Combinar TODOS os campos textuais para busca ampla de keywords
    const textoCompleto = `${conta} ${rotulo} ${codConta} ${coluna}`.toLowerCase();
    const funcional = extrairCodigoFuncional(contaDisplay);
    let match = false;
    let razao = "";
    let grupoEtnico: string | null = null;

    // Estratégia 1: Subfunção relevante (422 = Direitos Individuais)
    if (funcional && SUBFUNCOES_RELEVANTES.includes(funcional.subfuncao)) {
      const check = checarRadicais(textoCompleto);
      if (check) {
        match = true;
        razao = `Subfunção ${funcional.subfuncao} + Radical | ${check.palavras.slice(0, 3).join(", ")}`;
        grupoEtnico = [...check.grupos].join(" | ");
      }
    }

    // Estratégia 2: Keyword match em todos os campos textuais
    if (!match) {
      const check = checarRadicais(textoCompleto);
      if (check) {
        match = true;
        razao = `Radical | ${fonteAnexo} | Termos: ${check.palavras.slice(0, 3).join(", ")}`;
        grupoEtnico = [...check.grupos].join(" | ");
      }
    }

    // Estratégia 3: Função 14 (Direitos da Cidadania) com subfunção — captura ampla
    if (!match && funcional && funcional.funcao === FUNCAO_DIREITOS && funcional.subfuncao) {
      match = true;
      razao = `Funcional | Fn14.${funcional.subfuncao} (Direitos da Cidadania)`;
      grupoEtnico = "Racial/Étnico (geral)";
    }

    if (!match) continue;

    const key = `${contaDisplay}`;
    const existing = porConta.get(key) ?? {
      conta: contaDisplay, codConta, coluna: "",
      empenhado: null, liquidado: null, dotacao_inicial: null, pago: null,
      razao, grupoEtnico,
    };

    if (coluna.includes("empenha")) existing.empenhado = (existing.empenhado ?? 0) + (valor ?? 0);
    else if (coluna.includes("liquida")) existing.liquidado = (existing.liquidado ?? 0) + (valor ?? 0);
    else if (coluna.includes("pag")) existing.pago = (existing.pago ?? 0) + (valor ?? 0);
    else if (coluna.includes("dotação") || coluna.includes("dotacao") || coluna.includes("inicial"))
      existing.dotacao_inicial = (existing.dotacao_inicial ?? 0) + (valor ?? 0);

    porConta.set(key, existing);
  }

  // Converter para registros de inserção
  const registros: Record<string, unknown>[] = [];
  for (const [, data] of porConta) {
    let percentual_execucao: number | null = null;
    if (data.empenhado && data.empenhado > 0 && data.liquidado !== null) {
      percentual_execucao = Math.round((data.liquidado / data.empenhado) * 10000) / 100;
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
      razao_selecao: data.razao,
    });
  }

  return registros;
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
    } catch { /* defaults */ }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const estadosAlvo = Object.entries(ESTADOS_IBGE).filter(([uf]) =>
      !ufs || ufs.includes(uf)
    );

    console.log(`=== Ingestão Estadual via DCA (id_ente 2-dígitos) ===`);
    console.log(`Estados: ${estadosAlvo.map(([uf]) => uf).join(", ")}`);
    console.log(`Anos: ${anos.join(", ")}`);

    const allRegistros: Record<string, unknown>[] = [];
    const erros: string[] = [];

    for (const [uf, ufCode] of estadosAlvo) {
      for (const ano of anos) {
        console.log(`\n--- ${uf} [${ano}] (id_ente=${ufCode}) ---`);

        try {
          // DCA I-E: Despesas por Função/Subfunção (fonte primária)
          const itemsIE = await consultarDCA_IE(ano, ufCode);
          if (itemsIE.length > 0) {
            console.log(`  DCA I-E: ${itemsIE.length} itens`);
            const regs = processarDCA(itemsIE, uf, ano, "DCA-Anexo I-E");
            allRegistros.push(...regs);
            console.log(`  DCA I-E hits: ${regs.length}`);
          } else {
            console.log(`  DCA I-E: sem dados`);
          }

          // DCA I-D: Balanço Orçamentário (complemento)
          const itemsID = await consultarDCA_ID(ano, ufCode);
          if (itemsID.length > 0) {
            console.log(`  DCA I-D: ${itemsID.length} itens`);
            const regs = processarDCA(itemsID, uf, ano, "DCA-Anexo I-D");
            allRegistros.push(...regs);
            console.log(`  DCA I-D hits: ${regs.length}`);
          } else {
            console.log(`  DCA I-D: sem dados`);
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
      const liqR = (r.liquidado as number) ?? 0;
      const liqE = (existing?.liquidado as number) ?? 0;
      if (!existing || liqR > liqE) deduped.set(key, r);
    }

    console.log(`\nDeduplicação: ${allRegistros.length} → ${deduped.size}`);

    // Batch insert
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

    const acoesEncontradas = batch
      .map((r) => `[${r.razao_selecao}] ${String(r.programa).substring(0, 80)}`)
      .slice(0, 40);

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
        metodologia: "DCA I-E/I-D — Busca por Função 14, Subfunção 422 e palavras-chave raciais/étnicas",
        nota: "RREO retorna vazio para estados. DCA é a única fonte granular na API SICONFI. Para dados a nível de ação orçamentária, é necessário extração direta dos sistemas estaduais (Siafe, SIGFAZ) ou MSC.",
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

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SICONFI_BASE = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt";

/**
 * 27 UFs com código IBGE (id_ente) para o SICONFI.
 */
const ESTADOS = [
  { ibge: 12, uf: "AC", nome: "Acre" },
  { ibge: 27, uf: "AL", nome: "Alagoas" },
  { ibge: 16, uf: "AP", nome: "Amapá" },
  { ibge: 13, uf: "AM", nome: "Amazonas" },
  { ibge: 29, uf: "BA", nome: "Bahia" },
  { ibge: 23, uf: "CE", nome: "Ceará" },
  { ibge: 53, uf: "DF", nome: "Distrito Federal" },
  { ibge: 32, uf: "ES", nome: "Espírito Santo" },
  { ibge: 52, uf: "GO", nome: "Goiás" },
  { ibge: 21, uf: "MA", nome: "Maranhão" },
  { ibge: 51, uf: "MT", nome: "Mato Grosso" },
  { ibge: 50, uf: "MS", nome: "Mato Grosso do Sul" },
  { ibge: 31, uf: "MG", nome: "Minas Gerais" },
  { ibge: 15, uf: "PA", nome: "Pará" },
  { ibge: 25, uf: "PB", nome: "Paraíba" },
  { ibge: 41, uf: "PR", nome: "Paraná" },
  { ibge: 26, uf: "PE", nome: "Pernambuco" },
  { ibge: 22, uf: "PI", nome: "Piauí" },
  { ibge: 33, uf: "RJ", nome: "Rio de Janeiro" },
  { ibge: 24, uf: "RN", nome: "Rio Grande do Norte" },
  { ibge: 43, uf: "RS", nome: "Rio Grande do Sul" },
  { ibge: 11, uf: "RO", nome: "Rondônia" },
  { ibge: 14, uf: "RR", nome: "Roraima" },
  { ibge: 42, uf: "SC", nome: "Santa Catarina" },
  { ibge: 35, uf: "SP", nome: "São Paulo" },
  { ibge: 28, uf: "SE", nome: "Sergipe" },
  { ibge: 17, uf: "TO", nome: "Tocantins" },
];

/**
 * Termos raciais/étnicos para busca em TODOS os campos de texto.
 * Baseado no script de referência — cobertura ampla para capturar
 * ações "escondidas" em secretarias de infraestrutura ou agricultura.
 */
const TERMOS_RACIAIS = [
  // Radicais (capturam variações morfológicas)
  "quilombola", "quilombo",
  "indigen", "indígen",
  "cigano", "cigana",
  "afrodescendente", "afro",
  "remanescente",
  // Termos compostos e específicos
  "povos tradicionais", "comunidades tradicionais",
  "povos da floresta",
  "igualdade racial",
  "étnico", "etnico", "etnia",
  "racial", "racismo",
  "etnodesenvolvimento",
  "terreiro", "matriz africana",
  "negro", "negra",
  "palmares", "funai", "sesai", "funpen",
  "capoeira", "candomblé", "umbanda",
  "romani",
  // Assistência específica (subfunção 423)
  "assistência aos indígenas",
  "assistência aos índios",
  "assistência indígena",
];

function matchesRacial(text: string): boolean {
  const lower = text.toLowerCase();
  return TERMOS_RACIAIS.some((t) => lower.includes(t));
}

/**
 * Verifica se qualquer valor string de um item JSON contém termo racial.
 * Equivale ao df[cols_texto].apply(lambda x: x.str.contains(...)).any(axis=1)
 */
function itemMatchesRacial(item: Record<string, unknown>): boolean {
  for (const val of Object.values(item)) {
    if (typeof val === "string" && val.length > 2 && matchesRacial(val)) {
      return true;
    }
  }
  return false;
}

function parseBRL(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val === 0 ? null : val;
  const s = String(val).trim().replace(/\s/g, "");
  if (!s || s === "0" || s === "0,00" || s === "0.00") return null;
  // Handle both BRL (1.234,56) and plain (1234.56) formats
  let num: number;
  if (s.includes(",")) {
    num = Number(s.replace(/\./g, "").replace(",", "."));
  } else {
    num = Number(s);
  }
  return isNaN(num) || num === 0 ? null : num;
}

/**
 * Extrai o nome da conta/ação mais descritivo disponível no item.
 * DCA-Anexo I-E costuma ter 'ds_conta' mais granular que 'conta'.
 */
function extractConta(item: Record<string, unknown>): string {
  return (
    String(item.ds_conta || item.conta || item.no_conta || item.descricao || "")
      .trim()
      .replace(/\s+/g, " ")
  );
}

/**
 * Mapeia os campos financeiros dos itens da API para campos padronizados.
 * A API SICONFI muda nomes de campos entre DCA e RREO.
 * 
 * DCA campos comuns: v_coluna_dotacao_inicial, v_coluna_despesas_liquidadas,
 *                    valor_dotacao_inicial, valor_liquidado
 * RREO campos comuns: valor (com discriminação pela coluna 'coluna')
 */
function extractFinancials(item: Record<string, unknown>): {
  dotacao_inicial: number | null;
  dotacao_autorizada: number | null;
  empenhado: number | null;
  liquidado: number | null;
  pago: number | null;
  coluna: string;
} {
  // DCA: campos diretos
  const dot_inicial = parseBRL(
    item.v_coluna_dotacao_inicial ??
    item.valor_dotacao_inicial ??
    item.vl_dotacao_inicial ??
    null
  );
  const liquidado_dca = parseBRL(
    item.v_coluna_despesas_liquidadas ??
    item.valor_liquidado ??
    item.vl_liquidado ??
    null
  );
  const dot_autori = parseBRL(
    item.v_coluna_dotacao_atualizada ??
    item.valor_dotacao_atualizada ??
    item.vl_dotacao_atualizada ??
    null
  );
  const empenhado_dca = parseBRL(
    item.v_coluna_despesas_empenhadas ??
    item.valor_empenhado ??
    item.vl_empenhado ??
    null
  );
  const pago_dca = parseBRL(
    item.v_coluna_despesas_pagas ??
    item.valor_pago ??
    item.vl_pago ??
    null
  );

  const coluna = String(item.coluna || item.no_coluna || "").toLowerCase();

  return {
    dotacao_inicial: dot_inicial,
    dotacao_autorizada: dot_autori,
    empenhado: empenhado_dca,
    liquidado: liquidado_dca,
    pago: pago_dca,
    coluna,
  };
}

/**
 * Busca DCA-Anexo I-E (histórico consolidado, mais granular que RREO para programas).
 * Usado para 2018-2024 conforme metodologia do script de referência.
 */
async function fetchDCA_IE(ibge: number, ano: number): Promise<unknown[]> {
  // Tenta Anexo I-E primeiro (Despesas por Função/Subfunção/Programa/Ação)
  const urls = [
    `${SICONFI_BASE}/dca?an_exercicio=${ano}&no_anexo=DCA-Anexo+I-E&id_ente=${ibge}`,
    `${SICONFI_BASE}/dca?an_exercicio=${ano}&no_anexo=DCA-Anexo+I-D&id_ente=${ibge}`,
    `${SICONFI_BASE}/dca?an_exercicio=${ano}&no_anexo=DCA-Anexo+I-F&id_ente=${ibge}`,
  ];

  for (const url of urls) {
    const anexo = url.match(/no_anexo=([^&]+)/)?.[1] ?? "";
    console.log(`  DCA ${decodeURIComponent(anexo)}: ${url}`);
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.ok) {
        const data = await res.json();
        const items = data?.items || data || [];
        if (Array.isArray(items) && items.length > 0) {
          console.log(`  → ${items.length} itens brutos (${decodeURIComponent(anexo)})`);
          return items;
        }
      }
    } catch (e) {
      console.error(`  Erro DCA ${decodeURIComponent(anexo)}:`, e);
    }
  }
  return [];
}

/**
 * Busca RREO-Anexo 02 (último ou penúltimo bimestre).
 * Usado para 2025 conforme metodologia do script de referência.
 */
async function fetchRREO(ibge: number, ano: number): Promise<unknown[]> {
  for (const periodo of [6, 5, 4]) {
    const url = `${SICONFI_BASE}/rreo?an_exercicio=${ano}&nr_periodo=${periodo}&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo+02&id_ente=${ibge}`;
    console.log(`  RREO P${periodo}: ${url}`);
    try {
      const res = await fetch(url, { headers: { Accept: "application/json" } });
      if (res.ok) {
        const data = await res.json();
        const items = data?.items || data || [];
        if (Array.isArray(items) && items.length > 0) {
          console.log(`  → ${items.length} itens brutos (RREO P${periodo})`);
          return items;
        }
      }
    } catch (e) {
      console.error(`  Erro RREO P${periodo}:`, e);
    }
  }
  return [];
}

/**
 * Processa os itens brutos da API, filtrando por termos raciais em TODOS os campos.
 * Equivale à lógica do script Python: df[cols_texto].apply(str.contains(...)).any(axis=1)
 */
function processItems(
  items: unknown[],
  estado: typeof ESTADOS[0],
  ano: number,
  source: "DCA" | "RREO"
): Record<string, unknown>[] {
  const registros: Record<string, unknown>[] = [];
  const seen = new Set<string>();

  // RREO: items têm campo 'coluna' com o tipo de valor
  // DCA: items têm campos diretos de valor por coluna
  // Precisamos agregar por conta quando é RREO (múltiplas linhas por conta)
  const rreoAgg = new Map<string, Record<string, number | null>>();

  for (const rawItem of items) {
    const item = rawItem as Record<string, unknown>;

    // Verifica se qualquer campo string contém termo racial
    if (!itemMatchesRacial(item)) continue;

    const conta = extractConta(item);
    if (!conta || conta.length < 3) continue;

    // Filtrar lixo de metadados de planilha
    const lower = conta.toLowerCase();
    if (
      lower.includes("<ec") || lower.includes("<mr") ||
      lower.includes("total das despesas") ||
      lower.startsWith("despesas (intra") ||
      lower.startsWith("receita")
    ) continue;

    const key = `${estado.uf}|${conta}|${ano}`;
    const { dotacao_inicial, dotacao_autorizada, empenhado, liquidado, pago, coluna } =
      extractFinancials(item);

    if (source === "RREO") {
      // RREO: agregar por conta pois cada linha é uma coluna diferente
      if (!rreoAgg.has(key)) {
        rreoAgg.set(key, {
          dotacao_inicial: null,
          dotacao_autorizada: null,
          empenhado: null,
          liquidado: null,
          pago: null,
        });
      }
      const agg = rreoAgg.get(key)!;

      // Mapeia pelo nome da coluna
      const valor = parseBRL(item.valor ?? item.vl_conta ?? item.valor_conta ?? null);
      if (valor) {
        if (coluna.includes("dotação inicial") || coluna.includes("dotacao inicial")) {
          agg.dotacao_inicial = (agg.dotacao_inicial ?? 0) + valor;
        } else if (coluna.includes("dotação") || coluna.includes("atualizada")) {
          agg.dotacao_autorizada = (agg.dotacao_autorizada ?? 0) + valor;
        } else if (coluna.includes("empenhad")) {
          agg.empenhado = (agg.empenhado ?? 0) + valor;
        } else if (coluna.includes("liquidad")) {
          agg.liquidado = (agg.liquidado ?? 0) + valor;
        } else if (coluna.includes("pag")) {
          agg.pago = (agg.pago ?? 0) + valor;
        }
      }

      // Registrar metadata na primeira vez que vemos a conta
      if (!seen.has(key)) {
        seen.add(key);
        registros.push(buildRecord(key, conta, item, estado, ano, source, agg));
      } else {
        // Atualizar o registro existente com os valores acumulados
        const existing = registros.find((r) => r._key === key);
        if (existing) {
          existing.dotacao_inicial = agg.dotacao_inicial;
          existing.dotacao_autorizada = agg.dotacao_autorizada;
          existing.empenhado = agg.empenhado;
          existing.liquidado = agg.liquidado;
          existing.pago = agg.pago;
        }
      }
    } else {
      // DCA: campos de valor diretos por item
      if (!seen.has(key)) {
        seen.add(key);
        registros.push(
          buildRecord(key, conta, item, estado, ano, source, {
            dotacao_inicial,
            dotacao_autorizada,
            empenhado,
            liquidado,
            pago,
          })
        );
      } else {
        // Somar se houver múltiplas linhas com mesma conta (improvável na DCA, mas defensivo)
        const existing = registros.find((r) => r._key === key);
        if (existing) {
          if (dotacao_inicial) existing.dotacao_inicial = ((existing.dotacao_inicial as number) ?? 0) + dotacao_inicial;
          if (dotacao_autorizada) existing.dotacao_autorizada = ((existing.dotacao_autorizada as number) ?? 0) + dotacao_autorizada;
          if (empenhado) existing.empenhado = ((existing.empenhado as number) ?? 0) + empenhado;
          if (liquidado) existing.liquidado = ((existing.liquidado as number) ?? 0) + liquidado;
          if (pago) existing.pago = ((existing.pago as number) ?? 0) + pago;
        }
      }
    }
  }

  // Filtrar registros sem nenhum valor financeiro e calcular execução
  return registros
    .filter((r) =>
      r.dotacao_inicial || r.dotacao_autorizada || r.empenhado || r.liquidado || r.pago
    )
    .map((r) => {
      const { _key, ...clean } = r;
      // Calcular percentual de execução (liquidado / dotacao_inicial × 100)
      const dot = (clean.dotacao_inicial as number) || (clean.dotacao_autorizada as number);
      const liq = clean.liquidado as number;
      if (dot && liq) {
        clean.percentual_execucao = Math.round((liq / dot) * 10000) / 100;
      }
      return clean;
    });
}

function buildRecord(
  key: string,
  conta: string,
  item: Record<string, unknown>,
  estado: typeof ESTADOS[0],
  ano: number,
  source: "DCA" | "RREO",
  financials: Record<string, number | null>
): Record<string, unknown> {
  // Identifica quais termos raciais geraram o match
  const allText = Object.values(item)
    .filter((v) => typeof v === "string")
    .join(" ")
    .toLowerCase();
  const matched = TERMOS_RACIAIS.filter((t) => allText.includes(t)).slice(0, 4);
  const razaoParts = [`${source} SICONFI`];
  if (matched.length > 0) razaoParts.push(`Termos: ${matched.join(", ")}`);

  // Campos extra disponíveis na DCA (ação, subfunção, órgão)
  const acao = String(item.co_acao || item.cd_acao || item.no_acao || "").trim();
  const subfuncao = String(item.no_subfuncao || item.ds_subfuncao || item.subfuncao || "").trim();
  const orgao = String(item.no_orgao || item.ds_orgao || item.orgao_executor || "").trim();

  // Nome do programa: tenta ser específico. Se tiver ação, usa ela.
  const programaNome = acao && acao.length > 3
    ? `${estado.uf} – ${conta} / ${acao}`.substring(0, 250)
    : `${estado.uf} – ${conta}`.substring(0, 250);

  return {
    _key: key,
    programa: programaNome,
    orgao: orgao || `Gov. Estadual (${estado.uf})`,
    esfera: "estadual",
    ano,
    dotacao_inicial: financials.dotacao_inicial ?? null,
    dotacao_autorizada: financials.dotacao_autorizada ?? null,
    empenhado: financials.empenhado ?? null,
    liquidado: financials.liquidado ?? null,
    pago: financials.pago ?? null,
    percentual_execucao: null,
    fonte_dados: `SICONFI ${source} – ${estado.nome}`,
    url_fonte: `https://siconfi.tesouro.gov.br/siconfi/pages/public/consulta_rreo/consulta_rreo.jsf`,
    descritivo: subfuncao ? `${conta} | ${subfuncao}` : conta,
    observacoes: null,
    eixo_tematico: null,
    grupo_focal: null,
    publico_alvo: null,
    razao_selecao: razaoParts.join(" | "),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos: number[] = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    let ufs: string[] | undefined;
    try {
      const body = await req.json();
      if (body.anos) anos = body.anos;
      if (body.ufs) ufs = body.ufs;
    } catch { /* defaults */ }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const estadosAlvo = ufs
      ? ESTADOS.filter((e) => ufs!.includes(e.uf))
      : ESTADOS;

    const erros: string[] = [];
    let totalInserted = 0;
    const allRegistros: Record<string, unknown>[] = [];

    console.log(`=== Ingestão Estadual SICONFI (DCA I-E + RREO) ===`);
    console.log(`Estratégia: DCA-Anexo I-E para 2018-2024 | RREO-Anexo 02 para 2025`);
    console.log(`Estados: ${estadosAlvo.map((e) => e.uf).join(", ")}`);
    console.log(`Anos: ${anos.join(", ")}`);
    console.log(`Termos raciais: ${TERMOS_RACIAIS.length} termos`);

    for (const estado of estadosAlvo) {
      for (const ano of anos) {
        console.log(`\n--- ${estado.nome} (${estado.uf}) ${ano} ---`);

        try {
          let items: unknown[];
          let source: "DCA" | "RREO";

          if (ano < 2025) {
            // Histórico consolidado: DCA tem melhor granularidade de programa/ação
            items = await fetchDCA_IE(estado.ibge, ano);
            source = "DCA";

            // Fallback: se DCA não retornar, tenta RREO
            if (items.length === 0) {
              console.log(`  DCA vazia, tentando RREO como fallback...`);
              items = await fetchRREO(estado.ibge, ano);
              source = "RREO";
            }
          } else {
            // 2025: dados mais recentes via RREO
            items = await fetchRREO(estado.ibge, ano);
            source = "RREO";

            // Fallback: se RREO não retornar, tenta DCA (pode estar sendo enviado)
            if (items.length === 0) {
              console.log(`  RREO 2025 vazia, tentando DCA...`);
              items = await fetchDCA_IE(estado.ibge, ano);
              source = "DCA";
            }
          }

          console.log(`  ${source}: ${items.length} itens brutos totais`);

          if (items.length > 0) {
            // Log sample para debug — mostra campos disponíveis
            const sample = items[0] as Record<string, unknown>;
            const campos = Object.keys(sample).join(", ");
            console.log(`  Campos disponíveis: ${campos.substring(0, 200)}`);
          }

          const registros = processItems(items, estado, ano, source);
          console.log(`  → ${registros.length} registros com termos raciais`);

          if (registros.length > 0) {
            registros.forEach((r) =>
              console.log(`    • ${String(r.programa).substring(0, 80)} | dot=${r.dotacao_inicial} | liq=${r.liquidado}`)
            );
          }

          allRegistros.push(...registros);
        } catch (error) {
          const msg = `${estado.uf} ${ano}: ${error instanceof Error ? error.message : "Unknown"}`;
          erros.push(msg);
          console.error(msg);
        }

        // Rate limiting — polido com a API do Tesouro
        await new Promise((r) => setTimeout(r, 500));
      }
    }

    // Deduplicação por programa+ano+orgao (mantém o com maior valor)
    const deduped = new Map<string, Record<string, unknown>>();
    for (const r of allRegistros) {
      const key = `${r.orgao}|${r.programa}|${r.ano}`;
      const existing = deduped.get(key);
      if (!existing || ((r.liquidado as number) > ((existing.liquidado as number) ?? 0))) {
        deduped.set(key, r);
      }
    }
    console.log(`\nDeduplicação: ${allRegistros.length} → ${deduped.size} registros`);

    // Batch insert
    const batch = Array.from(deduped.values());
    const BATCH_SIZE = 50;
    for (let i = 0; i < batch.length; i += BATCH_SIZE) {
      const chunk = batch.slice(i, i + BATCH_SIZE);
      const { error: insErr } = await supabase.from("dados_orcamentarios").insert(chunk);
      if (insErr) {
        erros.push(`Insert batch ${i}: ${insErr.message}`);
        console.error(`Insert error batch ${i}:`, insErr.message);
      } else {
        totalInserted += chunk.length;
      }
    }

    // Resumo de programas únicos encontrados para auditoria
    const programasUnicos = batch.map((r) => String(r.programa)).slice(0, 30);

    console.log(`\n=== Concluído: ${totalInserted} inseridos, ${erros.length} erros ===`);

    return new Response(
      JSON.stringify({
        success: true,
        total_inseridos: totalInserted,
        total_brutos: allRegistros.length,
        deduplicados: deduped.size,
        estados: estadosAlvo.map((e) => e.uf),
        anos,
        programas_encontrados: programasUnicos,
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

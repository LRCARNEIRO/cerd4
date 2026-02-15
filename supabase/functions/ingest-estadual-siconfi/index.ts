import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SICONFI_BASE = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt";

/**
 * Estados prioritários para análise de política racial.
 * Código IBGE do ente (id_ente) é o código do estado.
 */
const ESTADOS = [
  { ibge: 12, uf: "AC", nome: "Acre", orgao: "Gov. Estadual" },
  { ibge: 27, uf: "AL", nome: "Alagoas", orgao: "Gov. Estadual" },
  { ibge: 16, uf: "AP", nome: "Amapá", orgao: "Gov. Estadual" },
  { ibge: 13, uf: "AM", nome: "Amazonas", orgao: "Gov. Estadual" },
  { ibge: 29, uf: "BA", nome: "Bahia", orgao: "SEPROMI" },
  { ibge: 23, uf: "CE", nome: "Ceará", orgao: "Gov. Estadual" },
  { ibge: 53, uf: "DF", nome: "Distrito Federal", orgao: "Sec. Justiça e Cidadania" },
  { ibge: 32, uf: "ES", nome: "Espírito Santo", orgao: "Gov. Estadual" },
  { ibge: 52, uf: "GO", nome: "Goiás", orgao: "Gov. Estadual" },
  { ibge: 21, uf: "MA", nome: "Maranhão", orgao: "SEDIHPOP" },
  { ibge: 51, uf: "MT", nome: "Mato Grosso", orgao: "Gov. Estadual" },
  { ibge: 50, uf: "MS", nome: "Mato Grosso do Sul", orgao: "Gov. Estadual" },
  { ibge: 31, uf: "MG", nome: "Minas Gerais", orgao: "SEDHS" },
  { ibge: 15, uf: "PA", nome: "Pará", orgao: "SEIRDH" },
  { ibge: 25, uf: "PB", nome: "Paraíba", orgao: "Gov. Estadual" },
  { ibge: 41, uf: "PR", nome: "Paraná", orgao: "Gov. Estadual" },
  { ibge: 26, uf: "PE", nome: "Pernambuco", orgao: "SecMulher/FUNDARPE" },
  { ibge: 22, uf: "PI", nome: "Piauí", orgao: "Gov. Estadual" },
  { ibge: 33, uf: "RJ", nome: "Rio de Janeiro", orgao: "SEASDH" },
  { ibge: 24, uf: "RN", nome: "Rio Grande do Norte", orgao: "Gov. Estadual" },
  { ibge: 43, uf: "RS", nome: "Rio Grande do Sul", orgao: "SDH" },
  { ibge: 11, uf: "RO", nome: "Rondônia", orgao: "Gov. Estadual" },
  { ibge: 14, uf: "RR", nome: "Roraima", orgao: "Gov. Estadual" },
  { ibge: 42, uf: "SC", nome: "Santa Catarina", orgao: "Gov. Estadual" },
  { ibge: 35, uf: "SP", nome: "São Paulo", orgao: "Sec. Justiça e Cidadania" },
  { ibge: 28, uf: "SE", nome: "Sergipe", orgao: "Gov. Estadual" },
  { ibge: 17, uf: "TO", nome: "Tocantins", orgao: "Gov. Estadual" },
];

/**
 * Subfunções e funções relevantes para política racial/indígena.
 * Subfunção 422: Direitos Individuais, Coletivos e Difusos
 * Função 14: Direitos da Cidadania
 * Subfunção 846: Outros Encargos Especiais (quilombolas/indígenas)
 */
const SUBFUNCOES_ALVO = ["422"];
const FUNCOES_ALVO = ["14"];

/**
 * Palavras-chave para filtrar programas relevantes na DCA/RREO.
 */
const KEYWORDS = [
  "racial", "racismo", "igualdade racial", "igualdade étnica",
  "quilombol", "indígen", "indigena", "cigan", "romani",
  "terreiro", "matriz africana", "afro",
  "direitos humanos", "cidadania", "promoção da igualdade",
];

function matchesKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS.some(kw => lower.includes(kw));
}

function parseBRL(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val === 0 ? null : val;
  const s = String(val).trim();
  if (!s || s === "0" || s === "0,00") return null;
  const num = Number(s.replace(/\./g, "").replace(",", "."));
  return isNaN(num) || num === 0 ? null : num;
}

/**
 * Busca dados do RREO (Anexo 02 - Despesas por Função/Subfunção)
 * ou DCA (Declaração de Contas Anuais) para um estado e ano.
 */
async function fetchRREO(ibge: number, ano: number): Promise<any[]> {
  // RREO Anexo 02: Despesas por Função/Subfunção
  // nr_periodo=6 = último bimestre (consolidado anual)
  const url = `${SICONFI_BASE}/rreo?an_exercicio=${ano}&nr_periodo=6&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo+02&id_ente=${ibge}`;
  console.log(`  RREO: ${url}`);

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      // Try period 5 (penultimate bimester) as fallback
      console.log(`  RREO período 6 falhou (${res.status}), tentando período 5...`);
      const url5 = `${SICONFI_BASE}/rreo?an_exercicio=${ano}&nr_periodo=5&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo+02&id_ente=${ibge}`;
      const res5 = await fetch(url5, { headers: { Accept: "application/json" } });
      if (!res5.ok) {
        console.error(`  RREO falhou para ambos períodos: ${res5.status}`);
        return [];
      }
      const data5 = await res5.json();
      return data5?.items || data5 || [];
    }

    const data = await res.json();
    return data?.items || data || [];
  } catch (e) {
    console.error(`  Erro fetch RREO:`, e);
    return [];
  }
}

/**
 * Busca dados da DCA (Declaração de Contas Anuais) como fallback.
 * Anexo I-D: Demonstrativo da Despesa por Função/Subfunção.
 */
async function fetchDCA(ibge: number, ano: number): Promise<any[]> {
  const url = `${SICONFI_BASE}/dca?an_exercicio=${ano}&no_anexo=DCA-Anexo+I-D&id_ente=${ibge}`;
  console.log(`  DCA: ${url}`);

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      console.error(`  DCA falhou: ${res.status}`);
      return [];
    }
    const data = await res.json();
    return data?.items || data || [];
  } catch (e) {
    console.error(`  Erro fetch DCA:`, e);
    return [];
  }
}

/**
 * Filtra e transforma dados RREO/DCA em registros orçamentários.
 * Campos RREO típicos: cod_conta, conta, valor, coluna
 * A coluna cod_conta contém a subfunção (ex: "14.422.xxxx.xxxx")
 */
function processRREOData(
  items: any[],
  estado: typeof ESTADOS[0],
  ano: number,
  source: "RREO" | "DCA"
): any[] {
  const registros: any[] = [];
  const seen = new Set<string>();

  // RREO Anexo 02 structure from SICONFI API:
  // cod_conta: "RREO2TotalDespesas" (same for all expenditure rows) or "RREO2TotalDespesasIntra" (intra-budget)
  // conta: the actual function/subfunção text, e.g. "Direitos da Cidadania", "Direitos Individuais Coletivos e Difusos"
  // coluna: "DOTAÇÃO INICIAL", "DOTAÇÃO ATUALIZADA (a)", "DESPESAS EMPENHADAS", "DESPESAS LIQUIDADAS", "DESPESAS PAGAS"
  // rotulo: section label e.g. "Total das Despesas Exceto Intra-Orçamentárias"

  // Relevant conta text patterns for racial equality policy
  const CONTA_ALVO = [
    "direitos da cidadania",           // Função 14
    "direitos individuais coletivos",  // Subfunção 422
    "direitos individuais, coletivos", // Variant
    "assistência aos indígenas",       // Subfunção 423
    "assistência comunitária",         // Subfunção 244 (some racial programs)
  ];

  const isRelevantConta = (conta: string): boolean => {
    const lower = conta.toLowerCase();
    return CONTA_ALVO.some(a => lower.includes(a)) || matchesKeyword(lower);
  };

  // Filter metadata/junk rows  
  const isJunk = (v: string) => {
    const lower = v.toLowerCase();
    return lower.includes("<ec") || lower.includes("<mr") ||
      lower.includes("saldo") || lower.includes("crédito") ||
      lower.startsWith("despesas (") || // top-level aggregate rows
      lower.startsWith("receita") ||
      lower.length < 3;
  };

  for (const item of items) {
    const codConta = String(item.cod_conta || item.cd_conta || "").trim();
    const conta = String(item.conta || item.ds_conta || "").trim();
    const coluna = String(item.coluna || "").trim().toLowerCase();
    const rotulo = String(item.rotulo || "").trim();
    const valor = parseBRL(item.valor || item.vl_conta || item.valor_conta);

    if (!conta || isJunk(conta)) continue;
    if (!isRelevantConta(conta)) continue;

    // Build readable program name  
    const isIntra = codConta.toLowerCase().includes("intra");
    const suffix = isIntra ? " (Intra-Orçamentária)" : "";
    const programaName = `${conta}${suffix}`;
    const key = `${estado.uf}|${conta}${suffix}|${ano}`;

    if (!seen.has(key)) {
      seen.add(key);

      // Derive publico_alvo and razao_selecao from conta text
      const contaLower = conta.toLowerCase();
      let publicoAlvo = "População em situação de vulnerabilidade racial/étnica";
      if (contaLower.includes("indígen") || contaLower.includes("indigena")) publicoAlvo = "Povos indígenas";
      else if (contaLower.includes("quilombol")) publicoAlvo = "Comunidades quilombolas";
      else if (contaLower.includes("cigan") || contaLower.includes("romani")) publicoAlvo = "Povos ciganos/romani";

      const razaoParts: string[] = [];
      if (CONTA_ALVO.some(a => contaLower.includes(a))) {
        const matched = CONTA_ALVO.find(a => contaLower.includes(a));
        razaoParts.push(`Conta RREO/DCA: "${matched}"`);
      }
      const kwMatched = KEYWORDS.filter(kw => contaLower.includes(kw));
      if (kwMatched.length > 0) razaoParts.push(`Palavras-chave: ${kwMatched.slice(0, 3).join(", ")}`);
      razaoParts.push(`Subfunção/Função alvo no SICONFI`);

      registros.push({
        _key: key,
        programa: `${estado.uf} – ${programaName}`.substring(0, 250),
        orgao: estado.orgao,
        esfera: "estadual",
        ano,
        dotacao_inicial: null as number | null,
        dotacao_autorizada: null as number | null,
        empenhado: null as number | null,
        liquidado: null as number | null,
        pago: null as number | null,
        percentual_execucao: null as number | null,
        fonte_dados: `SICONFI ${source} – ${estado.nome}`,
        url_fonte: `https://siconfi.tesouro.gov.br/siconfi/pages/defcon/consultar_rreo.jsf`,
        observacoes: `${estado.uf} – ${conta}`,
        eixo_tematico: null,
        grupo_focal: null,
        descritivo: conta,
        publico_alvo: publicoAlvo,
        razao_selecao: razaoParts.join(" | "),
      });
    }

    // Map column to financial field
    const rec = registros.find(r => r._key === key);
    if (!rec || !valor) continue;

    if (coluna.includes("dotação inicial") || coluna.includes("dotacao inicial")) {
      rec.dotacao_inicial = (rec.dotacao_inicial || 0) + valor;
    } else if (coluna.includes("dotação") || coluna.includes("atualizada") || coluna.includes("crédito")) {
      rec.dotacao_autorizada = (rec.dotacao_autorizada || 0) + valor;
    } else if (coluna.includes("empenhad")) {
      rec.empenhado = (rec.empenhado || 0) + valor;
    } else if (coluna.includes("liquidad")) {
      rec.liquidado = (rec.liquidado || 0) + valor;
    } else if (coluna.includes("pag")) {
      rec.pago = (rec.pago || 0) + valor;
    }
  }

  // Clean up and compute percentual
  return registros
    .filter(r => r.dotacao_autorizada || r.empenhado || r.liquidado || r.pago)
    .map(r => {
      const { _key, _codConta, _conta, ...clean } = r;
      if (clean.dotacao_autorizada && clean.pago) {
        clean.percentual_execucao = Math.round((clean.pago / clean.dotacao_autorizada) * 10000) / 100;
      }
      return clean;
    });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos: number[] = [2022, 2023, 2024];
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
      ? ESTADOS.filter(e => ufs!.includes(e.uf))
      : ESTADOS;

    const erros: string[] = [];
    let totalInserted = 0;
    const allRegistros: any[] = [];

    console.log(`=== Ingestão Estadual SICONFI ===`);
    console.log(`Estados: ${estadosAlvo.map(e => e.uf).join(", ")}`);
    console.log(`Anos: ${anos.join(", ")}`);

    for (const estado of estadosAlvo) {
      for (const ano of anos) {
        console.log(`\n--- ${estado.nome} (${estado.uf}) ${ano} ---`);

        try {
          // Try RREO first (more detailed), then DCA as fallback
          let items = await fetchRREO(estado.ibge, ano);
          let source: "RREO" | "DCA" = "RREO";

          if (!items || items.length === 0) {
            console.log(`  RREO vazio, tentando DCA...`);
            items = await fetchDCA(estado.ibge, ano);
            source = "DCA";
          }

          console.log(`  ${source}: ${items.length} itens brutos`);

          if (items.length > 0) {
            console.log(`  SAMPLE: ${JSON.stringify(items[0]).substring(0, 300)}`);
          }

          const registros = processRREOData(items, estado, ano, source);
          console.log(`  → ${registros.length} registros relevantes`);

          allRegistros.push(...registros);
        } catch (error) {
          const msg = `${estado.uf} ${ano}: ${error instanceof Error ? error.message : "Unknown"}`;
          erros.push(msg);
          console.error(msg);
        }

        // Rate limiting - SICONFI is generous but let's be polite
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Deduplicate by programa+ano+orgao
    const deduped = new Map<string, any>();
    for (const r of allRegistros) {
      const key = `${r.orgao}|${r.programa}|${r.ano}`;
      const existing = deduped.get(key);
      if (!existing || (r.pago && (!existing.pago || r.pago > existing.pago))) {
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

    console.log(`\n=== Concluído: ${totalInserted} inseridos, ${erros.length} erros ===`);

    return new Response(
      JSON.stringify({
        success: true,
        total_inseridos: totalInserted,
        total_brutos: allRegistros.length,
        deduplicados: deduped.size,
        estados: estadosAlvo.map(e => e.uf),
        anos,
        erros: erros.slice(0, 20),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

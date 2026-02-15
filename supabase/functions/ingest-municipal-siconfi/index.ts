import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SICONFI_BASE = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt";

/**
 * ================================================================
 * INGESTÃO ORÇAMENTÁRIA MUNICIPAL — POLÍTICAS RACIAIS
 * ================================================================
 * 
 * FONTE: API SICONFI (Tesouro Nacional) — RREO e DCA municipais
 * 
 * MUNICÍPIOS-ALVO: Capitais e cidades com expressiva população negra,
 * indígena ou quilombola e estruturas de promoção da igualdade racial.
 * 
 * ESTRATÉGIA DE FILTRO:
 *   1. Função 14 (Direitos da Cidadania)
 *   2. Subfunção 422 (Direitos Individuais, Coletivos e Difusos)
 *   3. Subfunção 423 (Assistência aos Indígenas)
 *   4. Palavras-chave raciais/étnicas na descrição da conta
 * 
 * CAMPOS COLETADOS (mesmos do Federal/Estadual):
 *   programa, orgao, descritivo, publico_alvo, razao_selecao,
 *   dotacao_inicial, dotacao_autorizada, empenhado, liquidado, pago,
 *   percentual_execucao, fonte_dados, url_fonte
 * ================================================================
 */

/**
 * Municípios prioritários para análise de política racial.
 * Código IBGE do ente (id_ente) é o código IBGE do município.
 * Fonte: https://www.ibge.gov.br/explica/codigos-dos-municipios.php
 */
const MUNICIPIOS = [
  // Capitais com maior pop. negra / estruturas de igualdade racial
  { ibge: 2927408, nome: "Salvador", uf: "BA", orgao: "SEMUR" },
  { ibge: 3550308, nome: "São Paulo", uf: "SP", orgao: "SMDHC" },
  { ibge: 3304557, nome: "Rio de Janeiro", uf: "RJ", orgao: "SMDHC" },
  { ibge: 2304400, nome: "Fortaleza", uf: "CE", orgao: "Coord. Igualdade Racial" },
  { ibge: 2611606, nome: "Recife", uf: "PE", orgao: "Ger. Igualdade Racial" },
  { ibge: 2507507, nome: "João Pessoa", uf: "PB", orgao: "Coord. Igualdade Racial" },
  { ibge: 2111300, nome: "São Luís", uf: "MA", orgao: "SEIR" },
  { ibge: 1302603, nome: "Manaus", uf: "AM", orgao: "SEMDIH" },
  { ibge: 1501402, nome: "Belém", uf: "PA", orgao: "CONEN" },
  { ibge: 3106200, nome: "Belo Horizonte", uf: "MG", orgao: "SMADC" },
  { ibge: 5300108, nome: "Brasília", uf: "DF", orgao: "Sec. Justiça e Cidadania" },
  { ibge: 4106902, nome: "Curitiba", uf: "PR", orgao: "FCC/SMDH" },
  { ibge: 4314902, nome: "Porto Alegre", uf: "RS", orgao: "SMDH" },
  { ibge: 5208707, nome: "Goiânia", uf: "GO", orgao: "SMDH" },
  { ibge: 1721000, nome: "Palmas", uf: "TO", orgao: "SMDH" },
  { ibge: 2800308, nome: "Aracaju", uf: "SE", orgao: "SMDH" },
  { ibge: 2408102, nome: "Natal", uf: "RN", orgao: "SEMJIDH" },
  { ibge: 2704302, nome: "Maceió", uf: "AL", orgao: "SMDH" },
  { ibge: 2211001, nome: "Teresina", uf: "PI", orgao: "SEMCASPI" },
  { ibge: 5103403, nome: "Cuiabá", uf: "MT", orgao: "SMDH" },
];

/**
 * Palavras-chave para filtrar programas/contas relevantes.
 */
const KEYWORDS = [
  "racial", "racismo", "igualdade racial", "igualdade étnica",
  "quilombol", "indígen", "indigena", "cigan", "romani",
  "terreiro", "matriz africana", "afro",
  "direitos humanos", "cidadania", "promoção da igualdade",
  "capoeira", "cultura negra", "negro", "candomblé", "umbanda",
  "povos tradicionais", "comunidades tradicionais",
];

/**
 * Contas RREO/DCA alvo (função/subfunção textual).
 */
const CONTA_ALVO = [
  "direitos da cidadania",           // Função 14
  "direitos individuais coletivos",  // Subfunção 422
  "direitos individuais, coletivos", // Variant
  "assistência aos indígenas",       // Subfunção 423
  "assistência comunitária",         // Subfunção 244
];

function matchesKeyword(text: string): boolean {
  const lower = text.toLowerCase();
  return KEYWORDS.some(kw => lower.includes(kw));
}

function isRelevantConta(conta: string): boolean {
  const lower = conta.toLowerCase();
  return CONTA_ALVO.some(a => lower.includes(a)) || matchesKeyword(lower);
}

function isJunk(v: string): boolean {
  const lower = v.toLowerCase();
  return lower.includes("<ec") || lower.includes("<mr") ||
    lower.includes("saldo") || lower.includes("crédito") ||
    lower.startsWith("despesas (") ||
    lower.startsWith("receita") ||
    lower.length < 3;
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
 * Busca dados RREO (Anexo 02) para um município e ano.
 */
async function fetchRREO(ibge: number, ano: number): Promise<any[]> {
  const url = `${SICONFI_BASE}/rreo?an_exercicio=${ano}&nr_periodo=6&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo+02&id_ente=${ibge}`;
  console.log(`  RREO: ${url}`);

  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      // Fallback to period 5
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
 * Busca dados DCA (Anexo I-D) como fallback.
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
 * Filtra e transforma dados RREO/DCA municipais em registros orçamentários.
 */
function processData(
  items: any[],
  municipio: typeof MUNICIPIOS[0],
  ano: number,
  source: "RREO" | "DCA"
): any[] {
  const registros: any[] = [];
  const seen = new Set<string>();

  for (const item of items) {
    const codConta = String(item.cod_conta || item.cd_conta || "").trim();
    const conta = String(item.conta || item.ds_conta || "").trim();
    const coluna = String(item.coluna || "").trim().toLowerCase();
    const valor = parseBRL(item.valor || item.vl_conta || item.valor_conta);

    if (!conta || isJunk(conta)) continue;
    if (!isRelevantConta(conta)) continue;

    const isIntra = codConta.toLowerCase().includes("intra");
    const suffix = isIntra ? " (Intra-Orçamentária)" : "";
    const programaName = `${conta}${suffix}`;
    const key = `${municipio.nome}|${conta}${suffix}|${ano}`;

    if (!seen.has(key)) {
      seen.add(key);

      // Derive publico_alvo
      const contaLower = conta.toLowerCase();
      let publicoAlvo = "População em situação de vulnerabilidade racial/étnica";
      if (contaLower.includes("indígen") || contaLower.includes("indigena")) publicoAlvo = "Povos indígenas";
      else if (contaLower.includes("quilombol")) publicoAlvo = "Comunidades quilombolas";
      else if (contaLower.includes("cigan") || contaLower.includes("romani")) publicoAlvo = "Povos ciganos/romani";
      else if (contaLower.includes("negro") || contaLower.includes("racial")) publicoAlvo = "População negra";

      // Build razao_selecao
      const razaoParts: string[] = [];
      const matchedConta = CONTA_ALVO.find(a => contaLower.includes(a));
      if (matchedConta) razaoParts.push(`Conta RREO/DCA: "${matchedConta}"`);
      const kwMatched = KEYWORDS.filter(kw => contaLower.includes(kw));
      if (kwMatched.length > 0) razaoParts.push(`Palavras-chave: ${kwMatched.slice(0, 3).join(", ")}`);
      razaoParts.push(`Subfunção/Função alvo no SICONFI municipal`);

      registros.push({
        _key: key,
        programa: `${municipio.nome}/${municipio.uf} – ${programaName}`.substring(0, 250),
        orgao: municipio.orgao,
        esfera: "municipal",
        ano,
        dotacao_inicial: null as number | null,
        dotacao_autorizada: null as number | null,
        empenhado: null as number | null,
        liquidado: null as number | null,
        pago: null as number | null,
        percentual_execucao: null as number | null,
        fonte_dados: `SICONFI ${source} – ${municipio.nome}/${municipio.uf}`,
        url_fonte: `https://siconfi.tesouro.gov.br/siconfi/pages/defcon/consultar_rreo.jsf`,
        observacoes: `${municipio.nome}/${municipio.uf} – ${conta}`,
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
      const { _key, ...clean } = r;
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
    let municipios_ibge: number[] | undefined;
    try {
      const body = await req.json();
      if (body.anos) anos = body.anos;
      if (body.municipios) municipios_ibge = body.municipios;
    } catch { /* defaults */ }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const municipiosAlvo = municipios_ibge
      ? MUNICIPIOS.filter(m => municipios_ibge!.includes(m.ibge))
      : MUNICIPIOS;

    const erros: string[] = [];
    let totalInserted = 0;
    const allRegistros: any[] = [];

    console.log(`=== Ingestão Municipal SICONFI ===`);
    console.log(`Municípios: ${municipiosAlvo.map(m => m.nome).join(", ")}`);
    console.log(`Anos: ${anos.join(", ")}`);

    for (const municipio of municipiosAlvo) {
      for (const ano of anos) {
        console.log(`\n--- ${municipio.nome}/${municipio.uf} (${municipio.ibge}) ${ano} ---`);

        try {
          // Try RREO first, DCA as fallback
          let items = await fetchRREO(municipio.ibge, ano);
          let source: "RREO" | "DCA" = "RREO";

          if (!items || items.length === 0) {
            console.log(`  RREO vazio, tentando DCA...`);
            items = await fetchDCA(municipio.ibge, ano);
            source = "DCA";
          }

          console.log(`  ${source}: ${items.length} itens brutos`);

          if (items.length > 0) {
            console.log(`  SAMPLE: ${JSON.stringify(items[0]).substring(0, 300)}`);
          }

          const registros = processData(items, municipio, ano, source);
          console.log(`  → ${registros.length} registros relevantes`);

          allRegistros.push(...registros);
        } catch (error) {
          const msg = `${municipio.nome} ${ano}: ${error instanceof Error ? error.message : "Unknown"}`;
          erros.push(msg);
          console.error(msg);
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 600));
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
        municipios: municipiosAlvo.map(m => `${m.nome}/${m.uf}`),
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

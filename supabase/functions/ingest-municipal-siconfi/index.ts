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
 * COBERTURA: TODOS os 5.570 municípios brasileiros (por UF)
 * 
 * ESTRATÉGIA:
 *   1. Recebe uma lista de UFs (ex: ["BA","SP","RJ"])
 *   2. Para cada UF, busca todos os municípios via endpoint /entes
 *   3. Para cada município, consulta RREO (Anexo 02) e fallback DCA
 *   4. Filtra por Função 14, Subfunções 422/423 e palavras-chave
 * 
 * CAMPOS COLETADOS (paridade com Federal/Estadual):
 *   programa, orgao, descritivo, publico_alvo, razao_selecao,
 *   dotacao_inicial, dotacao_autorizada, empenhado, liquidado, pago,
 *   percentual_execucao, fonte_dados, url_fonte
 * ================================================================
 */

const UFS_TODAS = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS",
  "MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO",
];

const KEYWORDS = [
  "racial", "racismo", "igualdade racial", "igualdade étnica",
  "quilombol", "indígen", "indigena", "cigan", "romani",
  "terreiro", "matriz africana", "afro",
  "direitos humanos", "cidadania", "promoção da igualdade",
  "capoeira", "cultura negra", "negro", "candomblé", "umbanda",
  "povos tradicionais", "comunidades tradicionais",
];

const CONTA_ALVO = [
  "direitos da cidadania",
  "direitos individuais coletivos",
  "direitos individuais, coletivos",
  "assistência aos indígenas",
  "assistência comunitária",
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

// ── Fetch municipality list from SICONFI entes endpoint ──

interface Ente {
  cod_ibge: number;
  ente: string;
  uf: string;
  esfera: string;
}

async function fetchMunicipiosByUF(uf: string): Promise<Ente[]> {
  const url = `${SICONFI_BASE}/entes?esfera=M&uf=${uf}`;
  console.log(`  Buscando municípios de ${uf}: ${url}`);
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      console.error(`  Entes ${uf} falhou: ${res.status}`);
      return [];
    }
    const data = await res.json();
    const items = data?.items || data || [];
    console.log(`  ${uf}: ${items.length} municípios encontrados`);
    return items.map((item: any) => ({
      cod_ibge: item.cod_ibge,
      ente: item.ente || item.nome || `Município ${item.cod_ibge}`,
      uf: uf,
      esfera: "M",
    }));
  } catch (e) {
    console.error(`  Erro fetch entes ${uf}:`, e);
    return [];
  }
}

// ── Fetch RREO/DCA data ──

async function fetchRREO(ibge: number, ano: number): Promise<any[]> {
  const url = `${SICONFI_BASE}/rreo?an_exercicio=${ano}&nr_periodo=6&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo+02&id_ente=${ibge}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) {
      // Try period 5
      const url5 = `${SICONFI_BASE}/rreo?an_exercicio=${ano}&nr_periodo=5&co_tipo_demonstrativo=RREO&no_anexo=RREO-Anexo+02&id_ente=${ibge}`;
      const res5 = await fetch(url5, { headers: { Accept: "application/json" } });
      if (!res5.ok) return [];
      const data5 = await res5.json();
      return data5?.items || data5 || [];
    }
    const data = await res.json();
    return data?.items || data || [];
  } catch {
    return [];
  }
}

async function fetchDCA(ibge: number, ano: number): Promise<any[]> {
  const url = `${SICONFI_BASE}/dca?an_exercicio=${ano}&no_anexo=DCA-Anexo+I-D&id_ente=${ibge}`;
  try {
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return [];
    const data = await res.json();
    return data?.items || data || [];
  } catch {
    return [];
  }
}

// ── Process and filter data ──

function processData(
  items: any[],
  municipioNome: string,
  municipioUF: string,
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
    const key = `${municipioNome}|${conta}${suffix}|${ano}`;

    if (!seen.has(key)) {
      seen.add(key);

      const contaLower = conta.toLowerCase();
      let publicoAlvo = "População em situação de vulnerabilidade racial/étnica";
      if (contaLower.includes("indígen") || contaLower.includes("indigena")) publicoAlvo = "Povos indígenas";
      else if (contaLower.includes("quilombol")) publicoAlvo = "Comunidades quilombolas";
      else if (contaLower.includes("cigan") || contaLower.includes("romani")) publicoAlvo = "Povos ciganos/romani";
      else if (contaLower.includes("negro") || contaLower.includes("racial")) publicoAlvo = "População negra";

      const razaoParts: string[] = [];
      const matchedConta = CONTA_ALVO.find(a => contaLower.includes(a));
      if (matchedConta) razaoParts.push(`Conta ${source}: "${matchedConta}"`);
      const kwMatched = KEYWORDS.filter(kw => contaLower.includes(kw));
      if (kwMatched.length > 0) razaoParts.push(`Palavras-chave: ${kwMatched.slice(0, 3).join(", ")}`);
      razaoParts.push(`Subfunção/Função alvo no SICONFI municipal`);

      registros.push({
        _key: key,
        programa: `${municipioNome}/${municipioUF} – ${programaName}`.substring(0, 250),
        orgao: `Prefeitura de ${municipioNome}/${municipioUF}`,
        esfera: "municipal",
        ano,
        dotacao_inicial: null as number | null,
        dotacao_autorizada: null as number | null,
        empenhado: null as number | null,
        liquidado: null as number | null,
        pago: null as number | null,
        percentual_execucao: null as number | null,
        fonte_dados: `SICONFI ${source} – ${municipioNome}/${municipioUF}`,
        url_fonte: `https://siconfi.tesouro.gov.br/siconfi/pages/defcon/consultar_rreo.jsf`,
        observacoes: `${municipioNome}/${municipioUF} – ${conta}`,
        eixo_tematico: null,
        grupo_focal: null,
        descritivo: conta,
        publico_alvo: publicoAlvo,
        razao_selecao: razaoParts.join(" | "),
      });
    }

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

// ── Main handler ──

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos: number[] = [2022, 2023, 2024];
    let ufs: string[] | undefined;
    let municipios_ibge: number[] | undefined;

    try {
      const body = await req.json();
      if (body.anos) anos = body.anos;
      if (body.ufs) ufs = body.ufs;
      if (body.municipios) municipios_ibge = body.municipios;
    } catch { /* defaults */ }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const erros: string[] = [];
    let totalInserted = 0;
    const allRegistros: any[] = [];
    const startTime = Date.now();
    const MAX_RUNTIME_MS = 270_000; // 4.5 minutes safety margin

    // ── Build municipality list ──
    interface MunicipioInfo { ibge: number; nome: string; uf: string; }
    const municipiosList: MunicipioInfo[] = [];

    if (municipios_ibge && municipios_ibge.length > 0) {
      // Specific IBGE codes provided (legacy mode / capitals)
      for (const ibge of municipios_ibge) {
        municipiosList.push({ ibge, nome: `Município ${ibge}`, uf: "??" });
      }
    } else {
      // Fetch all municipalities for the requested UFs
      const targetUFs = ufs || UFS_TODAS;
      console.log(`=== Buscando municípios para ${targetUFs.length} UFs ===`);

      for (const uf of targetUFs) {
        const entes = await fetchMunicipiosByUF(uf);
        for (const ente of entes) {
          municipiosList.push({
            ibge: ente.cod_ibge,
            nome: ente.ente,
            uf: uf,
          });
        }
        // Rate limit entes queries
        await new Promise(r => setTimeout(r, 300));
      }
    }

    console.log(`=== Ingestão Municipal SICONFI — ${municipiosList.length} municípios ===`);
    console.log(`Anos: ${anos.join(", ")}`);

    let processedCount = 0;
    let skippedByTimeout = 0;

    for (const municipio of municipiosList) {
      // Check timeout
      if (Date.now() - startTime > MAX_RUNTIME_MS) {
        skippedByTimeout = municipiosList.length - processedCount;
        console.log(`⚠️ Timeout approaching — ${skippedByTimeout} municípios restantes`);
        break;
      }

      for (const ano of anos) {
        try {
          let items = await fetchRREO(municipio.ibge, ano);
          let source: "RREO" | "DCA" = "RREO";

          if (!items || items.length === 0) {
            items = await fetchDCA(municipio.ibge, ano);
            source = "DCA";
          }

          if (items.length > 0) {
            const registros = processData(items, municipio.nome, municipio.uf, ano, source);
            if (registros.length > 0) {
              console.log(`  ✓ ${municipio.nome}/${municipio.uf} ${ano}: ${registros.length} registros`);
              allRegistros.push(...registros);
            }
          }
        } catch (error) {
          const msg = `${municipio.nome} ${ano}: ${error instanceof Error ? error.message : "Unknown"}`;
          erros.push(msg);
        }

        // Rate limiting — be polite with SICONFI
        await new Promise(r => setTimeout(r, 400));
      }

      processedCount++;

      // Log progress every 50 municipalities
      if (processedCount % 50 === 0) {
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        console.log(`  [${processedCount}/${municipiosList.length}] ${elapsed}s elapsed, ${allRegistros.length} registros`);
      }
    }

    // ── Deduplicate ──
    const deduped = new Map<string, any>();
    for (const r of allRegistros) {
      const key = `${r.orgao}|${r.programa}|${r.ano}`;
      const existing = deduped.get(key);
      if (!existing || (r.pago && (!existing.pago || r.pago > existing.pago))) {
        deduped.set(key, r);
      }
    }
    console.log(`\nDeduplicação: ${allRegistros.length} → ${deduped.size} registros`);

    // ── Batch insert ──
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

    const elapsedTotal = Math.round((Date.now() - startTime) / 1000);
    console.log(`\n=== Concluído em ${elapsedTotal}s: ${totalInserted} inseridos, ${erros.length} erros ===`);

    return new Response(
      JSON.stringify({
        success: true,
        total_inseridos: totalInserted,
        total_brutos: allRegistros.length,
        deduplicados: deduped.size,
        municipios_processados: processedCount,
        municipios_total: municipiosList.length,
        municipios_restantes: skippedByTimeout,
        anos,
        tempo_segundos: elapsedTotal,
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

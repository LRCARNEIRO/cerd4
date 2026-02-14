import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Órgãos superiores dedicados a políticas raciais/indígenas
const ORGAOS_SUPERIORES = [
  { codigo: "67000", sigla: "MIR", nome: "Ministério da Igualdade Racial", desde: 2023, dedicado: true },
  { codigo: "92000", sigla: "MPI", nome: "Ministério dos Povos Indígenas", desde: 2023, dedicado: true },
];

// Unidades orçamentárias específicas (existem desde antes de 2023)
const UOS_ESPECIFICAS = [
  { codigo: "37201", sigla: "FUNAI", nome: "Fundação Nacional dos Povos Indígenas", dedicado: true },
  { codigo: "22201", sigla: "INCRA", nome: "Instituto Nacional de Colonização e Reforma Agrária", dedicado: true },
  { codigo: "36901", sigla: "SESAI", nome: "Secretaria Especial de Saúde Indígena", dedicado: true },
];

// Programas temáticos de política racial em ministérios genéricos
// Estes são buscados diretamente pelo código do programa
const PROGRAMAS_TEMATICOS = [
  { codigo: "5034", nome: "Igualdade Racial e Superação do Racismo", desde: 2020 },
  { codigo: "5803", nome: "Juventude Negra Viva", desde: 2024 },
  { codigo: "0156", nome: "Promoção e Defesa dos Direitos dos Povos Indígenas", desde: 2004 },
  { codigo: "2065", nome: "Proteção e Promoção dos Direitos dos Povos Indígenas", desde: 2012 },
  { codigo: "0153", nome: "Promoção e Defesa dos Direitos da Criança e do Adolescente", desde: 2004 }, // interseccionalidade
];

const API_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";

async function fetchApi(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string
): Promise<any[]> {
  const allResults: any[] = [];
  let pagina = 1;
  const maxPages = 100;

  while (pagina <= maxPages) {
    const url = new URL(`${API_BASE}/${endpoint}`);
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v);
    }
    url.searchParams.set("pagina", String(pagina));
    
    const fullUrl = url.toString();
    if (pagina === 1) console.log(`  URL: ${fullUrl}`);

    try {
      const response = await fetch(fullUrl, {
        headers: {
          "chave-api-dados": apiKey,
          "Accept": "application/json",
        },
      });

      if (response.status === 429) {
        console.log(`Rate limited on page ${pagina}, waiting 30s...`);
        await new Promise(r => setTimeout(r, 30000));
        continue;
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error(`API error ${response.status}: ${errText}`);
        break;
      }

      const data = await response.json();
      if (!Array.isArray(data) || data.length === 0) break;

      allResults.push(...data);
      console.log(`  Page ${pagina}: ${data.length} records (total: ${allResults.length})`);

      if (data.length < 15) break;
      pagina++;
      
      await new Promise(r => setTimeout(r, 250));
    } catch (error) {
      console.error(`Fetch error page ${pagina}:`, error);
      break;
    }
  }

  return allResults;
}

// Fetch expenses by organ using despesas/por-orgao endpoint
async function fetchByOrgao(
  ano: number,
  codigoOrgao: string,
  isUO: boolean,
  apiKey: string
): Promise<any[]> {
  // Try despesas/por-orgao first (accepts codigoOrgao directly)
  const params: Record<string, string> = {
    ano: String(ano),
    codigoOrgao: codigoOrgao,
  };

  let results = await fetchApi("despesas/por-orgao", params, apiKey);
  
  // If empty, try funcional-programatica with orgaoSuperior
  if (results.length === 0) {
    const params2: Record<string, string> = {
      ano: String(ano),
      orgaoSuperior: codigoOrgao,
    };
    results = await fetchApi("despesas/por-funcional-programatica", params2, apiKey);
  }

  // If still empty and it's a UO, try with codigoUnidadeGestora
  if (results.length === 0 && isUO) {
    const params3: Record<string, string> = {
      ano: String(ano),
      unidadeGestora: codigoOrgao,
    };
    results = await fetchApi("despesas/por-funcional-programatica", params3, apiKey);
  }

  return results;
}

// Fetch by program code
async function fetchByPrograma(
  ano: number,
  codigoPrograma: string,
  apiKey: string
): Promise<any[]> {
  // Try funcional-programatica with programa filter
  let results = await fetchApi("despesas/por-funcional-programatica", {
    ano: String(ano),
    programa: codigoPrograma,
  }, apiKey);

  // Fallback: try codigoPrograma parameter
  if (results.length === 0) {
    results = await fetchApi("despesas/por-funcional-programatica", {
      ano: String(ano),
      codigoPrograma: codigoPrograma,
    }, apiKey);
  }

  return results;
}

function buildRecord(
  item: any,
  orgaoSigla: string,
  ano: number,
  codigoOrgaoUrl: string,
  isUO: boolean
) {
  // The API uses various field name patterns - try all known variants
  const codProg = item.codigoPrograma || item.codigo || item.programa?.codigo || "";
  const nomeProg = item.nomePrograma || item.programa?.descricao || item.descricao || item.nome || "";
  const codAcao = item.codigoAcao || item.acao?.codigo || "";
  const nomeAcao = item.nomeAcao || item.acao?.descricao || "";

  if (!codProg && !nomeProg) return null;

  let programaLabel = codProg ? `${codProg} – ${nomeProg}` : nomeProg;
  if (codAcao) {
    programaLabel += ` / ${codAcao}${nomeAcao ? ` – ${nomeAcao}` : ""}`;
  }

  // Try all known field name patterns for financial values
  const dotacao = Number(item.dotacaoAtualizada || item.valorDotacaoAtualizada || item.dotacaoInicial || item.valorOrcadoAtualizado) || null;
  const empenhado = Number(item.valorEmpenhado || item.empenhado || item.despesaEmpenhada) || null;
  const liquidado = Number(item.valorLiquidado || item.liquidado || item.despesaLiquidada) || null;
  const pago = Number(item.valorPago || item.pago || item.despesaPaga || item.valorPagoFinanceiro) || null;

  // Skip if no financial data at all
  if (!dotacao && !empenhado && !liquidado && !pago) return null;

  const percentual = dotacao && pago ? Math.round((pago / dotacao) * 10000) / 100 : null;

  const tipoFiltro = isUO ? "UO" : "OS";
  const portalUrl = `https://portaldatransparencia.gov.br/despesas/programa-e-acao?de=01/01/${ano}&ate=31/12/${ano}&orgaos=${tipoFiltro}${codigoOrgaoUrl}`;

  return {
    programa: programaLabel.substring(0, 250),
    orgao: orgaoSigla,
    esfera: "federal",
    ano,
    dotacao_autorizada: dotacao,
    empenhado,
    liquidado,
    pago,
    percentual_execucao: percentual,
    fonte_dados: `API Portal da Transparência – ${orgaoSigla}`,
    url_fonte: portalUrl,
    observacoes: null,
    eixo_tematico: null,
    grupo_focal: null,
  };
}

// Filter out administrative/generic programs for dedicated organs
function isAdministrativo(codProg: string, nomeProg: string): boolean {
  const adminCodes = ["0032", "0089", "0901", "0909"];
  if (adminCodes.includes(codProg)) return true;
  const lowerNome = (nomeProg || "").toLowerCase();
  return lowerNome.includes("gestao e manutencao") || 
         lowerNome.includes("reserva de contingencia") ||
         lowerNome.includes("encargos financeiros") ||
         lowerNome.includes("operacoes especiais");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos: number[] | undefined;
    let esfera: string | undefined;

    try {
      const body = await req.json();
      anos = body.anos;
      esfera = body.esfera;
    } catch {
      // defaults
    }

    const apiKey = Deno.env.get("PORTAL_TRANSPARENCIA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "PORTAL_TRANSPARENCIA_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const anosRange = anos || [2023, 2024, 2025];
    const erros: string[] = [];
    let totalInserted = 0;
    const registros: any[] = [];

    const doFederal = !esfera || esfera === "federal";

    if (doFederal) {
      console.log(`=== API REST: Federal ${anosRange.join(", ")} ===`);

      // 1. Órgãos superiores dedicados (MIR, MPI)
      for (const orgao of ORGAOS_SUPERIORES) {
        for (const ano of anosRange) {
          if (ano < orgao.desde) continue;
          console.log(`Fetching ${orgao.sigla} ${ano}...`);
          
          try {
            const dados = await fetchByOrgao(ano, orgao.codigo, false, apiKey);
            console.log(`  ${orgao.sigla} ${ano}: ${dados.length} raw records`);

            for (const item of dados) {
              const codProg = item.codigoPrograma || "";
              const nomeProg = item.nomePrograma || "";
              
              // For dedicated organs, skip only administrative programs
              if (isAdministrativo(codProg, nomeProg)) continue;

              const record = buildRecord(item, orgao.sigla, ano, orgao.codigo, false);
              if (record) registros.push(record);
            }
          } catch (error) {
            erros.push(`${orgao.sigla} ${ano}: ${error instanceof Error ? error.message : "Unknown"}`);
          }

          await new Promise(r => setTimeout(r, 500));
        }
      }

      // 2. Unidades orçamentárias específicas (FUNAI, INCRA, SESAI)
      for (const uo of UOS_ESPECIFICAS) {
        for (const ano of anosRange) {
          console.log(`Fetching UO ${uo.sigla} ${ano}...`);

          try {
            const dados = await fetchByOrgao(ano, uo.codigo, true, apiKey);
            console.log(`  ${uo.sigla} ${ano}: ${dados.length} raw records`);

            for (const item of dados) {
              const codProg = item.codigoPrograma || "";
              const nomeProg = item.nomePrograma || "";
              if (isAdministrativo(codProg, nomeProg)) continue;

              const record = buildRecord(item, uo.sigla, ano, uo.codigo, true);
              if (record) registros.push(record);
            }
          } catch (error) {
            erros.push(`${uo.sigla} ${ano}: ${error instanceof Error ? error.message : "Unknown"}`);
          }

          await new Promise(r => setTimeout(r, 500));
        }
      }

      // 3. Programas temáticos (buscados em todos os órgãos)
      for (const prog of PROGRAMAS_TEMATICOS) {
        for (const ano of anosRange) {
          if (ano < prog.desde) continue;
          console.log(`Fetching programa ${prog.codigo} (${prog.nome}) ${ano}...`);

          try {
            const dados = await fetchByPrograma(ano, prog.codigo, apiKey);
            console.log(`  Programa ${prog.codigo} ${ano}: ${dados.length} raw records`);

            for (const item of dados) {
              // Determine the orgao sigla from the response
              const orgaoNome = item.nomeOrgaoSuperior || item.nomeUnidadeOrcamentaria || "";
              const codOrgSup = item.codigoOrgaoSuperior || "";
              let sigla = codOrgSup;
              
              // Map known organ codes to siglas
              const siglaMap: Record<string, string> = {
                "67000": "MIR", "92000": "MPI", "26000": "MEC", "36000": "MS",
                "55000": "MDS", "30000": "MJSP", "44000": "MDHC",
                "47000": "MDHC", "37000": "FUNAI", "22000": "INCRA",
              };
              sigla = siglaMap[codOrgSup] || codOrgSup;

              // Skip if already captured by dedicated organ queries
              const alreadyCaptured = [...ORGAOS_SUPERIORES, ...UOS_ESPECIFICAS].some(
                o => o.sigla === sigla
              );
              if (alreadyCaptured) continue;

              const record = buildRecord(item, sigla, ano, codOrgSup, false);
              if (record) registros.push(record);
            }
          } catch (error) {
            erros.push(`Prog ${prog.codigo} ${ano}: ${error instanceof Error ? error.message : "Unknown"}`);
          }

          await new Promise(r => setTimeout(r, 500));
        }
      }

      // Deduplicate by orgao+programa+ano (keep record with highest pago)
      const deduped = new Map<string, any>();
      for (const r of registros) {
        const key = `${r.orgao}|${r.programa}|${r.ano}`;
        const existing = deduped.get(key);
        if (!existing || (r.pago && (!existing.pago || r.pago > existing.pago))) {
          deduped.set(key, r);
        }
      }

      console.log(`Deduped: ${registros.length} → ${deduped.size} records`);

      // Batch insert
      const batch = Array.from(deduped.values());
      const BATCH_SIZE = 50;
      for (let i = 0; i < batch.length; i += BATCH_SIZE) {
        const chunk = batch.slice(i, i + BATCH_SIZE);
        const { error: insErr } = await supabase.from("dados_orcamentarios").insert(chunk);
        if (insErr) {
          erros.push(`Batch insert error: ${insErr.message}`);
        } else {
          totalInserted += chunk.length;
        }
      }
    }

    console.log(`=== Concluído: ${totalInserted} registros inseridos, ${erros.length} erros ===`);

    return new Response(
      JSON.stringify({
        success: true,
        total_inseridos: totalInserted,
        anos: anosRange,
        erros: erros.slice(0, 20),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Fatal error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

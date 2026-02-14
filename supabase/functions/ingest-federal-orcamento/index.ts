import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ================================================================
 * METODOLOGIA DE INGESTÃO ORÇAMENTÁRIA FEDERAL — POLÍTICAS RACIAIS
 * ================================================================
 * 
 * OBJETIVO: Coletar dados de execução orçamentária federal (2018–2025) de
 * programas e ações voltados a políticas raciais, indígenas, quilombolas e ciganas.
 * 
 * FONTE: API do Portal da Transparência (api.portaldatransparencia.gov.br)
 * ENDPOINT: despesas/por-funcional-programatica
 * 
 * ESTRATÉGIA DE FILTRO (3 camadas independentes, depois deduplicadas):
 * 
 * CAMADA 1 — PROGRAMAS TEMÁTICOS DO PPA
 *   Códigos de programa finalísticos de política racial/indígena:
 *   - 5034: Igualdade Racial e Superação do Racismo (MIR, desde 2020)
 *   - 5803: Juventude Negra Viva (MIR, desde 2024)
 *   - 2065: Proteção e Promoção dos Direitos dos Povos Indígenas (MPI, desde 2012)
 *   - 0153: Promoção e Defesa dos Direitos da Criança e do Adolescente (MDHC, desde 2004)
 *   - 2034: Promoção da Igualdade Racial e Superação do Racismo (SEPPIR, PPA 2016-2019)
 * 
 * CAMADA 2 — SUBFUNÇÃO 422 (Direitos Individuais, Coletivos e Difusos)
 *   A subfunção 422 da classificação funcional-programática concentra ações de
 *   promoção de direitos de minorias. Filtrar por essa subfunção captura ações
 *   que não pertencem aos programas temáticos listados acima mas são relevantes.
 * 
 * CAMADA 3 — ÓRGÃOS ESPECÍFICOS
 *   Consultar despesas dos órgãos superiores com mandato direto:
 *   - 67000: Ministério da Igualdade Racial (MIR)
 *   - 92000: Ministério dos Povos Indígenas (MPI)
 * 
 * FILTRO DE RELEVÂNCIA (pós-coleta):
 *   Palavras-chave para validar relevância: racial, racismo, indígen, quilombol,
 *   cigan, romani, afro, palmares, igualdade racial, FUNAI, SESAI, etnia, étnic,
 *   povos tradicionais, comunidades tradicionais, terreiro, matriz africana
 * 
 * EXCLUSÕES EXPLÍCITAS:
 *   Programas transversais (Bolsa Família, MCMV, etc.) são excluídos mesmo que
 *   contenham subfunção 422 ou palavras-chave parciais.
 * 
 * CAMPOS COLETADOS:
 *   - programa (código + nome)
 *   - ação (código + nome)
 *   - dotação inicial (dotacao_inicial — PLOA/LOA quando disponível)
 *   - dotação atualizada (dotacao_autorizada — LOA + créditos adicionais)
 *   - empenhado
 *   - liquidado
 *   - pago
 *   - percentual de execução (pago/dotação)
 *   - órgão (resolvido por mapeamento)
 * ================================================================
 */

// ===== CAMADA 1: Programas temáticos do PPA =====
const PROGRAMAS_TEMATICOS = [
  { codigo: "5034", nome: "Igualdade Racial e Superação do Racismo", orgao: "MIR", desde: 2020 },
  { codigo: "5802", nome: "Direitos dos Povos Quilombolas e Ciganos", orgao: "MIR", desde: 2024 },
  { codigo: "5803", nome: "Juventude Negra Viva", orgao: "MIR", desde: 2024 },
  { codigo: "5804", nome: "Igualdade Étnico-Racial e Superação do Racismo", orgao: "MIR", desde: 2024 },
  { codigo: "5113", nome: "Educação Básica com Recorte Racial", orgao: "MEC", desde: 2024 },
  { codigo: "2065", nome: "Proteção e Promoção dos Direitos dos Povos Indígenas", orgao: "MPI", desde: 2012 },
  { codigo: "0153", nome: "Promoção e Defesa dos Direitos da Criança e do Adolescente", orgao: "MDHC", desde: 2004 },
  { codigo: "2034", nome: "Promoção da Igualdade Racial e Superação do Racismo (PPA 2016-2019)", orgao: "SEPPIR", desde: 2016 },
];

// ===== CAMADA 2: Subfunção 422 =====
const SUBFUNCAO_DIREITOS = "422";

// ===== CAMADA 3: Órgãos com mandato direto =====
const ORGAOS_MANDATO = [
  { codigo: "67000", sigla: "MIR" },
  { codigo: "92000", sigla: "MPI" },
];

// ===== Filtro de relevância pós-coleta =====
const KEYWORDS_RELEVANCIA = [
  "racial", "racismo", "indígen", "indigen", "quilombol", "cigan", "romani",
  "afro", "palmares", "igualdade racial", "funai", "sesai", "etnia", "étnic",
  "povos tradicionais", "comunidades tradicionais", "terreiro", "matriz africana",
  "discriminaç", "preconceito racial", "capoeira", "cultura negra", "negro",
  "povo de santo", "candomblé", "umbanda", "juventude negra",
];

// Programas transversais a excluir (falsos positivos)
const PROGRAMAS_EXCLUIDOS = [
  "2068", // Bolsa Família / Cadastro Único
  "2049", // Moradia Digna / MCMV
  "2012", // Fortalecimento SUS
  "2015", // Fortalecimento SUAS
  "6012", // Fundo Eleitoral
  "5029", // Fundo Amazônia
];

// Mapeamento de órgão superior para sigla
const SIGLA_MAP: Record<string, string> = {
  "67000": "MIR", "92000": "MPI", "26000": "MEC", "36000": "MS",
  "55000": "MDS", "30000": "MJSP", "44000": "MDHC", "47000": "MDHC",
  "37000": "FUNAI/MJ", "22000": "INCRA", "36901": "SESAI",
  "20000": "Presidência", "52000": "MDIC", "54000": "MTE",
};

// Mapeamento de ações específicas para órgão executor
const ACAO_ORGAO_MAP: Record<string, string> = {
  "20YP": "SESAI", "7684": "SESAI", "20UF": "FUNAI", "2384": "FUNAI",
  "215O": "FUNAI", "215Q": "FUNAI", "8635": "FUNAI", "15Q1": "INCRA",
  "214V": "FUNAI", "20G7": "INCRA", "0859": "INCRA", "21CS": "MIR",
};

// Ações da SESAI — classificadas como "Saúde Indígena" (informativo, não soma no total racial)
const ACOES_SESAI = ["20YP", "7684"];

function classificarGrupoFocal(item: any, orgao: string): string | null {
  const codAcao = item.codigoAcao || "";
  const texto = [item.programa, item.nomePrograma, item.acao, item.nomeAcao].filter(Boolean).join(" ").toLowerCase();

  // SESAI = Saúde Indígena (segregado)
  if (ACOES_SESAI.includes(codAcao) || orgao === "SESAI") return "saude_indigena";
  if (orgao === "FUNAI" || orgao === "MPI" || texto.includes("indígen") || texto.includes("indigen")) return "indigenas";
  if (codAcao === "20G7" || codAcao === "0859" || texto.includes("quilombol")) return "quilombolas";
  if (texto.includes("cigan") || texto.includes("romani")) return "ciganos";
  if (texto.includes("juventude negra")) return "juventude_negra";
  if (orgao === "MIR" || orgao === "SEPPIR" || texto.includes("racial") || texto.includes("racismo") || texto.includes("negro") || texto.includes("afro")) return "negros";
  return null;
}

function classificarEixoTematico(grupo: string | null): string | null {
  if (!grupo) return null;
  if (grupo === "saude_indigena") return "saude";
  if (grupo === "indigenas") return "terra_territorio";
  if (grupo === "quilombolas") return "terra_territorio";
  return "politicas_institucionais";
}

const API_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";

function parseBRL(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val || null;
  const s = String(val).trim();
  if (!s || s === "0" || s === "0,00") return null;
  const num = Number(s.replace(/\./g, "").replace(",", "."));
  return isNaN(num) || num === 0 ? null : num;
}

function resolveOrgao(item: any, fallback: string): string {
  const codAcao = item.codigoAcao || "";
  if (codAcao && ACAO_ORGAO_MAP[codAcao]) return ACAO_ORGAO_MAP[codAcao];
  const codOrg = item.codigoOrgaoSuperior || item.codigoOrgao || "";
  if (codOrg && SIGLA_MAP[codOrg]) return SIGLA_MAP[codOrg];
  return fallback;
}

function isRelevant(item: any): boolean {
  const codProg = item.codigoPrograma || "";
  if (PROGRAMAS_EXCLUIDOS.includes(codProg)) return false;

  // Items from Camada 1 (programa temático) are always relevant
  if (PROGRAMAS_TEMATICOS.some(p => p.codigo === codProg)) return true;

  // For Camada 2/3 results, check keywords
  const text = [
    item.programa, item.nomePrograma, item.acao, item.nomeAcao,
    item.nomeOrgaoSuperior, item.nomeFuncao, item.nomeSubfuncao,
  ].filter(Boolean).join(" ").toLowerCase();

  return KEYWORDS_RELEVANCIA.some(kw => text.includes(kw));
}

function buildRecord(item: any, fallbackOrgao: string, ano: number, camada: string) {
  const codProg = item.codigoPrograma || "";
  const nomeProg = item.programa || item.nomePrograma || "";
  const codAcao = item.codigoAcao || "";
  const nomeAcao = item.acao || item.nomeAcao || "";

  if (!codProg && !nomeProg) return null;

  let programa = codProg ? `${codProg} – ${nomeProg}` : nomeProg;
  if (codAcao) programa += ` / ${codAcao} – ${nomeAcao}`;

  const dotacaoInicial = parseBRL(item.dotacaoInicial || item.valorDotacaoInicial);
  const dotacaoAutorizada = parseBRL(item.dotacaoAtualizada || item.valorDotacaoAtualizada);
  const empenhado = parseBRL(item.empenhado || item.valorEmpenhado);
  const liquidado = parseBRL(item.liquidado || item.valorLiquidado);
  const pago = parseBRL(item.pago || item.valorPago);

  if (!dotacaoInicial && !dotacaoAutorizada && !empenhado && !liquidado && !pago) return null;

  const orgao = resolveOrgao(item, fallbackOrgao);
  const grupoFocal = classificarGrupoFocal(item, orgao);
  const eixoTematico = classificarEixoTematico(grupoFocal);
  const dotacaoRef = dotacaoAutorizada || dotacaoInicial;
  const percentual = dotacaoRef && pago ? Math.round((pago / dotacaoRef) * 10000) / 100 : null;

  return {
    programa: programa.substring(0, 250),
    orgao,
    esfera: "federal",
    ano,
    dotacao_inicial: dotacaoInicial,
    dotacao_autorizada: dotacaoAutorizada,
    empenhado,
    liquidado,
    pago,
    percentual_execucao: percentual,
    fonte_dados: `API Portal da Transparência (${camada})`,
    url_fonte: `https://portaldatransparencia.gov.br/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01/01/${ano}&ate=31/12/${ano}&programa=${codProg}`,
    observacoes: grupoFocal === "saude_indigena" ? `Camada: ${camada} | SEGREGADO: Saúde Indígena (não computar no total racial)` : `Camada: ${camada}`,
    eixo_tematico: eixoTematico,
    grupo_focal: grupoFocal,
  };
}

async function fetchPaginated(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<any[]> {
  const all: any[] = [];
  let page = 1;

  while (page <= 50) {
    const url = new URL(`${API_BASE}/${endpoint}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    url.searchParams.set("pagina", String(page));

    if (page === 1) console.log(`  → ${url}`);

    try {
      const res = await fetch(url.toString(), {
        headers: { "chave-api-dados": apiKey, Accept: "application/json" },
      });

      if (res.status === 429) {
        console.log(`  Rate limited p${page}, waiting 30s...`);
        await new Promise(r => setTimeout(r, 30000));
        continue;
      }
      if (!res.ok) {
        console.error(`  API ${res.status}: ${(await res.text()).substring(0, 200)}`);
        break;
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      all.push(...data);
      if (data.length < 15) break;
      page++;
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`  Fetch error p${page}:`, e);
      break;
    }
  }
  return all;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos: number[] = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    let camadas: string[] = ["programas", "subfuncao", "orgaos"];
    try {
      const body = await req.json();
      if (body.anos) anos = body.anos;
      if (body.camadas) camadas = body.camadas;
    } catch { /* defaults */ }

    const apiKey = Deno.env.get("PORTAL_TRANSPARENCIA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "PORTAL_TRANSPARENCIA_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const erros: string[] = [];
    const registrosMap = new Map<string, any>();
    const logCamadas: Record<string, { brutos: number; relevantes: number }> = {};

    console.log(`=== INGESTÃO FEDERAL MULTI-CAMADA ===`);
    console.log(`Anos: ${anos.join(", ")}`);
    console.log(`Camadas: ${camadas.join(", ")}`);

    // ===== CAMADA 1: Programas Temáticos =====
    if (camadas.includes("programas")) {
      console.log(`\n--- CAMADA 1: Programas Temáticos do PPA ---`);
      let brutos = 0, relevantes = 0;

      for (const prog of PROGRAMAS_TEMATICOS) {
        for (const ano of anos) {
          if (ano < prog.desde) continue;
          console.log(`  ${prog.codigo} (${prog.nome}) ${ano}...`);

          try {
            const dados = await fetchPaginated(
              "despesas/por-funcional-programatica",
              { ano: String(ano), programa: prog.codigo },
              apiKey,
            );
            brutos += dados.length;


            for (const item of dados) {
              if (!isRelevant(item)) continue;
              const record = buildRecord(item, prog.orgao, ano, "Programa Temático PPA");
              if (record) {
                const key = `${record.orgao}|${record.programa}|${record.ano}`;
                const existing = registrosMap.get(key);
                if (!existing || (record.pago && (!existing.pago || record.pago > existing.pago))) {
                  registrosMap.set(key, record);
                  relevantes++;
                }
              }
            }
          } catch (e) {
            erros.push(`Camada1 ${prog.codigo}/${ano}: ${e instanceof Error ? e.message : "?"}`);
          }
          await new Promise(r => setTimeout(r, 500));
        }
      }
      logCamadas["programas"] = { brutos, relevantes };
      console.log(`  Camada 1 totais: ${brutos} brutos → ${relevantes} relevantes`);
    }

    // ===== CAMADA 2: Subfunção 422 =====
    if (camadas.includes("subfuncao")) {
      console.log(`\n--- CAMADA 2: Subfunção 422 (Direitos Individuais) ---`);
      let brutos = 0, relevantes = 0;

      for (const ano of anos) {
        console.log(`  Subfunção 422, ano ${ano}...`);
        try {
          const dados = await fetchPaginated(
            "despesas/por-funcional-programatica",
            { ano: String(ano), subfuncao: SUBFUNCAO_DIREITOS },
            apiKey,
          );
          brutos += dados.length;

          for (const item of dados) {
            if (!isRelevant(item)) continue;
            const record = buildRecord(item, "MDHC", ano, "Subfunção 422");
            if (record) {
              const key = `${record.orgao}|${record.programa}|${record.ano}`;
              if (!registrosMap.has(key)) {
                registrosMap.set(key, record);
                relevantes++;
              }
            }
          }
        } catch (e) {
          erros.push(`Camada2 subfuncao422/${ano}: ${e instanceof Error ? e.message : "?"}`);
        }
        await new Promise(r => setTimeout(r, 500));
      }
      logCamadas["subfuncao"] = { brutos, relevantes };
      console.log(`  Camada 2 totais: ${brutos} brutos → ${relevantes} relevantes`);
    }

    // ===== CAMADA 3: Órgãos com Mandato Direto =====
    if (camadas.includes("orgaos")) {
      console.log(`\n--- CAMADA 3: Órgãos MIR (67000) e MPI (92000) ---`);
      let brutos = 0, relevantes = 0;

      for (const org of ORGAOS_MANDATO) {
        for (const ano of anos) {
          console.log(`  Órgão ${org.sigla} (${org.codigo}), ano ${ano}...`);
          try {
            const dados = await fetchPaginated(
              "despesas/por-funcional-programatica",
              { ano: String(ano), orgaoSuperior: org.codigo },
              apiKey,
            );
            brutos += dados.length;

            for (const item of dados) {
              const record = buildRecord(item, org.sigla, ano, `Órgão ${org.sigla}`);
              if (record) {
                const key = `${record.orgao}|${record.programa}|${record.ano}`;
                if (!registrosMap.has(key)) {
                  registrosMap.set(key, record);
                  relevantes++;
                }
              }
            }
          } catch (e) {
            erros.push(`Camada3 ${org.sigla}/${ano}: ${e instanceof Error ? e.message : "?"}`);
          }
          await new Promise(r => setTimeout(r, 500));
        }
      }
      logCamadas["orgaos"] = { brutos, relevantes };
      console.log(`  Camada 3 totais: ${brutos} brutos → ${relevantes} relevantes`);
    }

    // ===== INSERÇÃO NO BANCO =====
    const batch = Array.from(registrosMap.values());
    let totalInserted = 0;
    const BATCH_SIZE = 50;

    console.log(`\n=== Inserindo ${batch.length} registros deduplicados ===`);

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

    const resultado = {
      success: true,
      total_inseridos: totalInserted,
      total_deduplicados: batch.length,
      anos,
      camadas_executadas: camadas,
      detalhes_camadas: logCamadas,
      erros: erros.slice(0, 20),
      metodologia: {
        descricao: "Ingestão multi-camada com 3 filtros independentes deduplicados",
        camada_1: "Programas temáticos PPA: " + PROGRAMAS_TEMATICOS.map(p => p.codigo).join(", "),
        camada_2: "Subfunção 422 (Direitos Individuais, Coletivos e Difusos)",
        camada_3: "Órgãos MIR (67000) e MPI (92000)",
        filtro_relevancia: "Palavras-chave: " + KEYWORDS_RELEVANCIA.slice(0, 10).join(", ") + "...",
        exclusoes: "Programas transversais excluídos: " + PROGRAMAS_EXCLUIDOS.join(", "),
        fonte: "API Portal da Transparência (api.portaldatransparencia.gov.br)",
      },
    };

    console.log(`\n=== CONCLUÍDO: ${totalInserted} inseridos, ${erros.length} erros ===`);

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

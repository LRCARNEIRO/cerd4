import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Órgãos federais relevantes para política racial
const ORGAOS_FEDERAIS = [
  { codigo: "92000", nome: "Ministério da Igualdade Racial", sigla: "MIR" },
  { codigo: "37201", nome: "FUNAI", sigla: "FUNAI" },
  { codigo: "22201", nome: "INCRA", sigla: "INCRA" },
  { codigo: "36901", nome: "SESAI/Ministério da Saúde", sigla: "SESAI" },
  { codigo: "26000", nome: "Ministério da Educação", sigla: "MEC" },
  { codigo: "55000", nome: "Ministério do Desenvolvimento Social", sigla: "MDS" },
  { codigo: "30000", nome: "Ministério da Justiça e Segurança Pública", sigla: "MJSP" },
  { codigo: "37000", nome: "Ministério dos Povos Indígenas", sigla: "MPI" },
];

// Funções orçamentárias relevantes para filtro
const FUNCOES_RACIAIS = ["14"]; // 14 = Direitos da Cidadania

// Estados para consulta SICONFI
const ESTADOS_SICONFI = [
  { cod: 29, nome: "Bahia", uf: "BA" },
  { cod: 35, nome: "São Paulo", uf: "SP" },
  { cod: 33, nome: "Rio de Janeiro", uf: "RJ" },
  { cod: 31, nome: "Minas Gerais", uf: "MG" },
  { cod: 43, nome: "Rio Grande do Sul", uf: "RS" },
  { cod: 26, nome: "Pernambuco", uf: "PE" },
  { cod: 21, nome: "Maranhão", uf: "MA" },
  { cod: 15, nome: "Pará", uf: "PA" },
];

// Municípios para consulta SICONFI (capitais)
const MUNICIPIOS_SICONFI = [
  { cod: 2927408, nome: "Salvador", uf: "BA" },
  { cod: 3550308, nome: "São Paulo", uf: "SP" },
  { cod: 3304557, nome: "Rio de Janeiro", uf: "RJ" },
  { cod: 3106200, nome: "Belo Horizonte", uf: "MG" },
  { cod: 2611606, nome: "Recife", uf: "PE" },
  { cod: 4314902, nome: "Porto Alegre", uf: "RS" },
  { cod: 2304400, nome: "Fortaleza", uf: "CE" },
  { cod: 5300108, nome: "Brasília", uf: "DF" },
];

const PORTAL_TRANSPARENCIA_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";
const SICONFI_BASE = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt";

interface DadoOrcamentario {
  programa: string;
  orgao: string;
  esfera: string;
  ano: number;
  dotacao_autorizada: number | null;
  empenhado: number | null;
  pago: number | null;
  percentual_execucao: number | null;
  fonte_dados: string;
  url_fonte: string;
  observacoes: string | null;
  eixo_tematico: string | null;
  grupo_focal: string | null;
}

// ====== PORTAL DA TRANSPARÊNCIA (Federal) ======
async function fetchDespesasPorOrgao(
  apiKey: string,
  codigoOrgao: string,
  ano: number,
  funcao?: string
): Promise<any[]> {
  const params = new URLSearchParams({
    ano: ano.toString(),
    codigoOrgao: codigoOrgao,
    pagina: "1",
  });
  if (funcao) params.set("codigoFuncao", funcao);

  const url = `${PORTAL_TRANSPARENCIA_BASE}/despesas/por-orgao?${params}`;
  console.log(`Fetching: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "chave-api-dados": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Error ${response.status} for orgao ${codigoOrgao} ano ${ano}: ${text}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Fetch error for orgao ${codigoOrgao} ano ${ano}:`, error);
    return [];
  }
}

async function fetchDespesasFuncionalProgramatica(
  apiKey: string,
  ano: number,
  codigoOrgao: string
): Promise<any[]> {
  const params = new URLSearchParams({
    ano: ano.toString(),
    codigoOrgao: codigoOrgao,
    pagina: "1",
  });

  const url = `${PORTAL_TRANSPARENCIA_BASE}/despesas/por-funcional-programatica?${params}`;
  console.log(`Fetching funcional-programatica: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        "chave-api-dados": apiKey,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`Error ${response.status}: ${text}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Fetch error funcional-programatica:`, error);
    return [];
  }
}

function processPortalTransparenciaData(
  rawData: any[],
  orgaoInfo: { codigo: string; nome: string; sigla: string },
  ano: number
): DadoOrcamentario[] {
  const results: DadoOrcamentario[] = [];

  for (const item of rawData) {
    const programa = item.programa || item.nomeFuncao || item.nomePrograma || "Sem programa";
    const dotacao = Number(item.valorDotacaoInicial) || Number(item.valorAutorizado) || null;
    const empenhado = Number(item.valorEmpenhado) || null;
    const pago = Number(item.valorPago) || Number(item.valorLiquidado) || null;

    if (!dotacao && !empenhado && !pago) continue;

    const percentual = dotacao && pago ? (pago / dotacao) * 100 : null;

    results.push({
      programa: typeof programa === "string" ? programa : JSON.stringify(programa),
      orgao: orgaoInfo.sigla,
      esfera: "federal",
      ano,
      dotacao_autorizada: dotacao,
      empenhado,
      pago,
      percentual_execucao: percentual ? Math.round(percentual * 100) / 100 : null,
      fonte_dados: `Portal da Transparência – ${orgaoInfo.sigla}`,
      url_fonte: `https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F${ano}&ate=31%2F12%2F${ano}&orgaos=OR${orgaoInfo.codigo}`,
      observacoes: null,
      eixo_tematico: null,
      grupo_focal: null,
    });
  }

  return results;
}

// ====== SICONFI / STN (Estadual e Municipal) ======
async function fetchSiconfiRREO(
  idEnte: number,
  ano: number,
  periodo: number = 6
): Promise<any[]> {
  const url = `${SICONFI_BASE}/rreo?an_exercicio=${ano}&nr_periodo=${periodo}&co_tipo_demonstrativo=RREO&id_ente=${idEnte}`;
  console.log(`Fetching SICONFI RREO: ${url}`);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`SICONFI error ${response.status}: ${text}`);
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`SICONFI fetch error for ente ${idEnte}:`, error);
    return [];
  }
}

async function fetchSiconfiBudgetExecution(
  idEnte: number,
  ano: number
): Promise<any[]> {
  // DCA - Declaração de Contas Anuais (dados de execução orçamentária)
  const url = `${SICONFI_BASE}/dca?an_exercicio=${ano}&id_ente=${idEnte}&no_anexo=DCA-Anexo I-D`;
  console.log(`Fetching SICONFI DCA: ${url}`);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`SICONFI DCA error ${response.status}: ${text}`);
      return [];
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`SICONFI DCA fetch error:`, error);
    return [];
  }
}

function processSiconfiData(
  rawData: any[],
  entidade: { cod: number; nome: string; uf: string },
  ano: number,
  esfera: "estadual" | "municipal"
): DadoOrcamentario[] {
  const results: DadoOrcamentario[] = [];

  // Filtrar por funções relacionadas a direitos, cidadania, assistência social
  const funcoesRelevantes = [
    "direitos da cidadania",
    "assistência social",
    "educação",
    "saúde",
    "cultura",
    "habitação",
    "saneamento",
  ];

  for (const item of rawData) {
    const conta = (item.conta || item.co_conta || "").toLowerCase();
    const descricao = (item.coluna || item.rotulo || conta).toString();

    // Verificar se é relevante para política racial (filtro amplo)
    const isRelevante = funcoesRelevantes.some(
      (f) => conta.includes(f) || descricao.toLowerCase().includes(f)
    );

    if (!isRelevante && rawData.length > 50) continue;

    const valor = Number(item.valor) || 0;
    if (valor === 0) continue;

    results.push({
      programa: descricao.length > 200 ? descricao.substring(0, 200) : descricao,
      orgao: entidade.nome,
      esfera,
      ano,
      dotacao_autorizada: valor,
      empenhado: null,
      pago: null,
      percentual_execucao: null,
      fonte_dados: `SICONFI/STN – ${entidade.uf}`,
      url_fonte: `https://siconfi.tesouro.gov.br/siconfi/pages/public/conteudo.jsf?id=${entidade.cod}`,
      observacoes: `Dados do RREO/DCA – ${entidade.nome}`,
      eixo_tematico: null,
      grupo_focal: null,
    });
  }

  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { fonte, anos, esfera } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const anosRange = anos || [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    const resultados: DadoOrcamentario[] = [];
    const erros: string[] = [];

    // ====== FEDERAL (Portal da Transparência) ======
    if (!fonte || fonte === "portal_transparencia" || esfera === "federal") {
      const apiKey = Deno.env.get("PORTAL_TRANSPARENCIA_API_KEY");
      if (!apiKey) {
        erros.push("PORTAL_TRANSPARENCIA_API_KEY não configurada. Cadastre-se em https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email");
      } else {
        for (const orgao of ORGAOS_FEDERAIS) {
          for (const ano of anosRange) {
            // Buscar por órgão
            const dadosOrgao = await fetchDespesasPorOrgao(apiKey, orgao.codigo, ano);
            const processados = processPortalTransparenciaData(dadosOrgao, orgao, ano);
            resultados.push(...processados);

            // Buscar também por funcional-programática para programas específicos
            const dadosFP = await fetchDespesasFuncionalProgramatica(apiKey, ano, orgao.codigo);
            const processadosFP = processPortalTransparenciaData(dadosFP, orgao, ano);
            resultados.push(...processadosFP);

            // Rate limiting - Portal limita requisições por minuto
            await new Promise((r) => setTimeout(r, 500));
          }
        }
      }
    }

    // ====== ESTADUAL (SICONFI) ======
    if (!fonte || fonte === "siconfi" || esfera === "estadual") {
      for (const estado of ESTADOS_SICONFI) {
        for (const ano of anosRange) {
          // Tentar RREO (períodos bimestrais, período 6 = acumulado anual)
          const dadosRREO = await fetchSiconfiRREO(estado.cod, ano, 6);
          if (dadosRREO.length > 0) {
            const processados = processSiconfiData(dadosRREO, estado, ano, "estadual");
            resultados.push(...processados);
          } else {
            // Fallback para DCA
            const dadosDCA = await fetchSiconfiBudgetExecution(estado.cod, ano);
            const processados = processSiconfiData(dadosDCA, estado, ano, "estadual");
            resultados.push(...processados);
          }
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    }

    // ====== MUNICIPAL (SICONFI) ======
    if (!fonte || fonte === "siconfi" || esfera === "municipal") {
      for (const municipio of MUNICIPIOS_SICONFI) {
        for (const ano of anosRange) {
          const dadosRREO = await fetchSiconfiRREO(municipio.cod, ano, 6);
          if (dadosRREO.length > 0) {
            const processados = processSiconfiData(dadosRREO, municipio, ano, "municipal");
            resultados.push(...processados);
          } else {
            const dadosDCA = await fetchSiconfiBudgetExecution(municipio.cod, ano);
            const processados = processSiconfiData(dadosDCA, municipio, ano, "municipal");
            resultados.push(...processados);
          }
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    }

    // Deduplicar por programa+orgao+ano+esfera
    const seen = new Set<string>();
    const dedupedResults = resultados.filter((r) => {
      const key = `${r.programa}|${r.orgao}|${r.ano}|${r.esfera}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    console.log(`Total resultados: ${dedupedResults.length} (de ${resultados.length} brutos)`);

    // Inserir no banco
    if (dedupedResults.length > 0) {
      // Inserir em lotes de 50
      const batchSize = 50;
      let inserted = 0;
      for (let i = 0; i < dedupedResults.length; i += batchSize) {
        const batch = dedupedResults.slice(i, i + batchSize);
        const { error } = await supabase.from("dados_orcamentarios").insert(batch);
        if (error) {
          console.error(`Insert error batch ${i}:`, error);
          erros.push(`Erro inserção lote ${i}: ${error.message}`);
        } else {
          inserted += batch.length;
        }
      }
      console.log(`Inseridos: ${inserted} registros`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_encontrados: dedupedResults.length,
        por_esfera: {
          federal: dedupedResults.filter((r) => r.esfera === "federal").length,
          estadual: dedupedResults.filter((r) => r.esfera === "estadual").length,
          municipal: dedupedResults.filter((r) => r.esfera === "municipal").length,
        },
        erros: erros.length > 0 ? erros : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in scrape-orcamento:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

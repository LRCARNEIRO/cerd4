import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Órgãos federais relevantes para política racial (códigos SIOP)
const ORGAOS_FEDERAIS = [
  { codigo: "67000", nome: "Ministério da Igualdade Racial", sigla: "MIR", desde: 2023 },
  { codigo: "92000", nome: "Ministério dos Povos Indígenas", sigla: "MPI", desde: 2023 },
  { codigo: "26000", nome: "Ministério da Educação", sigla: "MEC", desde: 2001 },
  { codigo: "36000", nome: "Ministério da Saúde", sigla: "MS", desde: 2001 },
  { codigo: "55000", nome: "Ministério do Desenvolvimento Social", sigla: "MDS", desde: 2001 },
  { codigo: "30000", nome: "Ministério da Justiça e Segurança Pública", sigla: "MJSP", desde: 2001 },
];

// Unidades Orçamentárias específicas (dentro de órgãos maiores)
const UOS_ESPECIFICAS = [
  { codigo: "37201", orgao: "37000", nome: "FUNAI", sigla: "FUNAI" },
  { codigo: "22201", orgao: "22000", nome: "INCRA", sigla: "INCRA" },
  { codigo: "36901", orgao: "36000", nome: "SESAI", sigla: "SESAI" },
];

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

// SIOP SPARQL endpoint - use GET with URL params (like orcamentoBR R package)
const SIOP_SPARQL_BASE = "https://www1.siop.planejamento.gov.br/sparql/";
const PORTAL_TRANSPARENCIA_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";
const SICONFI_BASE = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt";

interface DadoOrcamentario {
  programa: string;
  orgao: string;
  esfera: string;
  ano: number;
  dotacao_autorizada: number | null;
  empenhado: number | null;
  liquidado: number | null;
  pago: number | null;
  percentual_execucao: number | null;
  fonte_dados: string;
  url_fonte: string;
  observacoes: string | null;
  eixo_tematico: string | null;
  grupo_focal: string | null;
}

// ====== SIOP SPARQL (Federal) ======

function buildSparqlQueryByOrgao(ano: number, codigoOrgao: string): string {
  // Based on orcamentoBR R package (.constroiSIOPqueryDetalheAnual)
  return `SELECT ?codExercicio ?codOrgao ?descOrgao ?codPrograma ?descPrograma ?codAcao ?descAcao (sum(?val2) as ?loa) (sum(?val3) as ?lei_mais_credito) (sum(?val4) as ?empenhado) (sum(?val5) as ?liquidado) (sum(?val6) as ?pago) WHERE { GRAPH <http://orcamento.dados.gov.br/${ano}/> { ?i loa:temExercicio ?exercicio . ?exercicio loa:identificador ?codExercicio . ?UO loa:temOrgao ?orgao . ?orgao loa:codigo ?codOrgao . ?orgao rdfs:label ?descOrgao . ?i loa:temUnidadeOrcamentaria ?UO . ?i loa:temPrograma ?programa . ?programa loa:codigo ?codPrograma . ?programa rdfs:label ?descPrograma . ?i loa:temAcao ?acao . ?acao loa:codigo ?codAcao . ?acao rdfs:label ?descAcao . ?orgao loa:codigo "${codigoOrgao}" . ?i loa:valorDotacaoInicial ?val2 . ?i loa:valorLeiMaisCredito ?val3 . ?i loa:valorEmpenhado ?val4 . ?i loa:valorLiquidado ?val5 . ?i loa:valorPago ?val6 . } } GROUP BY ?codExercicio ?codOrgao ?descOrgao ?codPrograma ?descPrograma ?codAcao ?descAcao ORDER BY ?codPrograma ?codAcao`;
}

function buildSparqlQueryByUO(ano: number, codigoUO: string): string {
  return `SELECT ?codExercicio ?codUO ?descUO ?codOrgao ?descOrgao ?codPrograma ?descPrograma ?codAcao ?descAcao (sum(?val2) as ?loa) (sum(?val3) as ?lei_mais_credito) (sum(?val4) as ?empenhado) (sum(?val5) as ?liquidado) (sum(?val6) as ?pago) WHERE { GRAPH <http://orcamento.dados.gov.br/${ano}/> { ?i loa:temExercicio ?exercicio . ?exercicio loa:identificador ?codExercicio . ?UO loa:temOrgao ?orgao . ?orgao loa:codigo ?codOrgao . ?orgao rdfs:label ?descOrgao . ?i loa:temUnidadeOrcamentaria ?UO . ?UO loa:codigo ?codUO . ?UO rdfs:label ?descUO . ?i loa:temPrograma ?programa . ?programa loa:codigo ?codPrograma . ?programa rdfs:label ?descPrograma . ?i loa:temAcao ?acao . ?acao loa:codigo ?codAcao . ?acao rdfs:label ?descAcao . ?UO loa:codigo "${codigoUO}" . ?i loa:valorDotacaoInicial ?val2 . ?i loa:valorLeiMaisCredito ?val3 . ?i loa:valorEmpenhado ?val4 . ?i loa:valorLiquidado ?val5 . ?i loa:valorPago ?val6 . } } GROUP BY ?codExercicio ?codUO ?descUO ?codOrgao ?descOrgao ?codPrograma ?descPrograma ?codAcao ?descAcao ORDER BY ?codPrograma ?codAcao`;
}

async function executeSparqlQuery(query: string): Promise<any[]> {
  console.log(`SPARQL query (${query.length} chars)`);

  // Use GET with URL params like the orcamentoBR R package
  const cleanQuery = query.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
  const encodedQuery = encodeURIComponent(cleanQuery);
  const url = `${SIOP_SPARQL_BASE}?default-graph-uri=&query=${encodedQuery}&format=application%2Fsparql-results%2Bjson&timeout=0&debug=on`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/sparql-results+json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`SPARQL error ${response.status}: ${text.substring(0, 300)}`);
      return [];
    }

    const data = await response.json();
    const bindings = data?.results?.bindings || [];
    console.log(`SPARQL success: ${bindings.length} bindings`);
    return bindings;
  } catch (error) {
    console.error(`SPARQL fetch error:`, error);
    return [];
  }
}

function processSiopData(
  bindings: any[],
  orgaoInfo: { nome: string; sigla: string },
  ano: number
): DadoOrcamentario[] {
  const results: DadoOrcamentario[] = [];

  for (const row of bindings) {
    const codPrograma = row.codPrograma?.value || "";
    const descPrograma = row.descPrograma?.value || "";
    const codAcao = row.codAcao?.value || "";
    const descAcao = row.descAcao?.value || "";

    const programa = `${codPrograma} – ${descPrograma} / ${codAcao} – ${descAcao}`;
    const dotacao = Number(row.loa?.value) || null;
    const leiMaisCredito = Number(row.lei_mais_credito?.value) || null;
    const empenhado = Number(row.empenhado?.value) || null;
    const liquidado = Number(row.liquidado?.value) || null;
    const pago = Number(row.pago?.value) || null;

    if (!dotacao && !empenhado && !pago) continue;

    // Use lei+crédito como dotação autorizada (mais precisa que dotação inicial)
    const dotacaoFinal = leiMaisCredito || dotacao;
    const percentual = dotacaoFinal && pago ? (pago / dotacaoFinal) * 100 : null;

    results.push({
      programa: programa.length > 250 ? programa.substring(0, 250) : programa,
      orgao: orgaoInfo.sigla,
      esfera: "federal",
      ano,
      dotacao_autorizada: dotacaoFinal,
      empenhado,
      liquidado,
      pago,
      percentual_execucao: percentual ? Math.round(percentual * 100) / 100 : null,
      fonte_dados: `SIOP/SOF – ${orgaoInfo.sigla}`,
      url_fonte: `https://www1.siop.planejamento.gov.br/QvAJAXZfc/opendoc.htm?document=IAS%2FExecucao_Orcamentaria.qvw&host=QVS%40paborc04&anonymous=true&bookmark=Document\\BM47&select=LB_EXERCICIO,${ano}&select=LB_ORGAO,${row.codOrgao?.value || orgaoInfo.sigla}`,
      observacoes: `Dotação inicial: R$ ${dotacao ? (dotacao / 1e6).toFixed(1) : "0"}M`,
      eixo_tematico: null,
      grupo_focal: null,
    });
  }

  return results;
}

// ====== Portal da Transparência API (Federal fallback) ======
// Strategy: 1) List programs for the year, 2) Query per-program using funcional-programatica
async function fetchPortalTransparencia(
  orgao: { codigo: string; nome: string; sigla: string },
  ano: number,
  apiKey: string
): Promise<DadoOrcamentario[]> {
  const results: DadoOrcamentario[] = [];

  // Step 1: Use /despesas/por-orgao to get sub-organ level data (this endpoint works)
  // But aggregate by querying funcional-programatica with specific filters
  // Since funcional-programatica doesn't accept orgao filter, we use por-orgao
  // and also query the programs list endpoint

  // First, let's get the list of programs for this year
  const programasUrl = `${PORTAL_TRANSPARENCIA_BASE}/despesas/funcional-programatica/programas?ano=${ano}`;
  console.log(`Portal Transparência listando programas: ${programasUrl}`);
  
  let programas: Array<{ codigo: string; descricao: string }> = [];
  try {
    const progResp = await fetch(programasUrl, {
      headers: { Accept: "application/json", "chave-api-dados": apiKey },
    });
    console.log(`Programas response status: ${progResp.status}`);
    if (progResp.ok) {
      const progData = await progResp.json();
      if (Array.isArray(progData)) {
        programas = progData.map((p: any) => ({
          codigo: p.codigo || p.codigoPrograma || String(p.id || ""),
          descricao: p.descricao || p.descricaoPrograma || p.nome || "",
        }));
        console.log(`Encontrados ${programas.length} programas para ${ano}. Exemplos: ${JSON.stringify(programas.slice(0, 3))}`);
      }
    }
  } catch (e) {
    console.error(`Erro listando programas:`, e);
  }

  // Step 2: For each program, query funcional-programatica with programa filter
  if (programas.length > 0) {
    // Filter to relevant programs (those likely related to racial equality)
    // We'll query ALL and filter by orgao after getting the data
    for (const prog of programas) {
      const url = `${PORTAL_TRANSPARENCIA_BASE}/despesas/por-funcional-programatica?ano=${ano}&programa=${prog.codigo}&pagina=1`;
      console.log(`Querying funcional-programatica for programa ${prog.codigo}: ${url}`);
      
      try {
        const response = await fetch(url, {
          headers: { Accept: "application/json", "chave-api-dados": apiKey },
        });

        if (!response.ok) {
          if (response.status !== 400) {
            console.error(`Programa ${prog.codigo} error: ${response.status}`);
          }
          continue;
        }

        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) continue;

        // Filter results for our target orgao
        const relevantItems = data.filter((item: any) => {
          const itemOrgao = item.orgaoSuperior?.codigo || item.codigoOrgaoSuperior || item.orgao?.codigo || "";
          return String(itemOrgao) === orgao.codigo;
        });

        if (relevantItems.length === 0) continue;

        console.log(`Programa ${prog.codigo} – ${prog.descricao}: ${relevantItems.length} items for ${orgao.sigla}`);

        for (const item of relevantItems) {
          const parseBRL = (v: any): number | null => {
            if (v == null || v === "") return null;
            if (typeof v === "number") return v;
            const cleaned = String(v).replace(/\./g, "").replace(",", ".");
            const num = Number(cleaned);
            return isNaN(num) ? null : num;
          };

          const dotacao = parseBRL(item.dotacaoInicial) || parseBRL(item.valorLeiMaisCreditos);
          const empenhado = parseBRL(item.despesaEmpenhada) || parseBRL(item.empenhado) || parseBRL(item.valorEmpenhado);
          const liquidado = parseBRL(item.despesaLiquidada) || parseBRL(item.liquidado);
          const pago = parseBRL(item.despesaPaga) || parseBRL(item.pago) || parseBRL(item.valorPago);

          if (!dotacao && !empenhado && !pago) continue;

          const dotacaoFinal = dotacao || empenhado;
          const percentual = dotacaoFinal && pago ? Math.round((pago / dotacaoFinal) * 10000) / 100 : null;

          const codAcao = item.acao?.codigo || "";
          const nomeAcao = item.acao?.descricao || "";
          let programaLabel = `${prog.codigo} – ${prog.descricao}`;
          if (codAcao && nomeAcao) {
            programaLabel += ` / ${codAcao} – ${nomeAcao}`;
          }

          const deepLink = `https://portaldatransparencia.gov.br/despesas/programa-e-acao?paginacaoSimples=true&tamanhoPagina=&offset=&direcaoOrdenacao=asc&de=01%2F01%2F${ano}&ate=31%2F12%2F${ano}&orgaos=OS${orgao.codigo}&programa=${prog.codigo}`;

          results.push({
            programa: programaLabel.length > 250 ? programaLabel.substring(0, 250) : programaLabel,
            orgao: orgao.sigla,
            esfera: "federal",
            ano,
            dotacao_autorizada: dotacaoFinal,
            empenhado,
            liquidado,
            pago,
            percentual_execucao: percentual,
            fonte_dados: `Portal da Transparência – ${orgao.sigla}`,
            url_fonte: deepLink,
            observacoes: null,
            eixo_tematico: null,
            grupo_focal: null,
          });
        }

        await new Promise((r) => setTimeout(r, 300));
      } catch (error) {
        console.error(`Error querying programa ${prog.codigo}:`, error);
      }
    }
  }

  // Fallback: if no program-level data, use por-orgao but label correctly
  if (results.length === 0) {
    console.log(`No program-level data for ${orgao.sigla} ${ano}, falling back to por-orgao`);
    let pagina = 1;
    while (pagina <= 5) {
      const url = `${PORTAL_TRANSPARENCIA_BASE}/despesas/por-orgao?ano=${ano}&orgaoSuperior=${orgao.codigo}&pagina=${pagina}`;
      try {
        const response = await fetch(url, {
          headers: { Accept: "application/json", "chave-api-dados": apiKey },
        });
        if (!response.ok) break;
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) break;

        for (const item of data) {
          const parseBRL = (v: any): number | null => {
            if (v == null || v === "") return null;
            if (typeof v === "number") return v;
            const cleaned = String(v).replace(/\./g, "").replace(",", ".");
            const num = Number(cleaned);
            return isNaN(num) ? null : num;
          };

          const nomeUO = item.orgao || item.descricao || "";
          const codUO = item.codigoOrgao || "";
          const empenhado = parseBRL(item.empenhado);
          const liquidado = parseBRL(item.liquidado);
          const pago = parseBRL(item.pago);

          if (!empenhado && !pago) continue;

          const deepLink = `https://portaldatransparencia.gov.br/despesas?de=01%2F01%2F${ano}&ate=31%2F12%2F${ano}&orgaos=OS${orgao.codigo}`;

          results.push({
            programa: `[UO] ${nomeUO} (${codUO})`,
            orgao: orgao.sigla,
            esfera: "federal",
            ano,
            dotacao_autorizada: empenhado,
            empenhado,
            liquidado,
            pago,
            percentual_execucao: empenhado && pago ? Math.round((pago / empenhado) * 10000) / 100 : null,
            fonte_dados: `Portal da Transparência – ${orgao.sigla}`,
            url_fonte: deepLink,
            observacoes: `Unidade Orçamentária (programa não disponível via API)`,
            eixo_tematico: null,
            grupo_focal: null,
          });
        }

        if (data.length < 15) break;
        pagina++;
        await new Promise((r) => setTimeout(r, 500));
      } catch (error) {
        console.error(`Fallback por-orgao error ${orgao.sigla} ${ano}:`, error);
        break;
      }
    }
  }

  return results;
}

async function fetchFederalData(
  anosRange: number[],
  erros: string[]
): Promise<DadoOrcamentario[]> {
  const resultados: DadoOrcamentario[] = [];
  const apiKey = Deno.env.get("PORTAL_TRANSPARENCIA_API_KEY") || "";

  // Try SPARQL first, fall back to Portal da Transparência
  for (const orgao of ORGAOS_FEDERAIS) {
    for (const ano of anosRange) {
      if (orgao.desde && ano < orgao.desde) continue;
      try {
        // Try SPARQL first
        const query = buildSparqlQueryByOrgao(ano, orgao.codigo);
        const bindings = await executeSparqlQuery(query);

        if (bindings.length > 0) {
          console.log(`SIOP SPARQL ${orgao.sigla} ${ano}: ${bindings.length} registros`);
          const processados = processSiopData(bindings, orgao, ano);
          resultados.push(...processados);
        } else if (apiKey) {
          // Fallback to Portal da Transparência
          console.log(`SPARQL failed for ${orgao.sigla} ${ano}, trying Portal da Transparência...`);
          const dados = await fetchPortalTransparencia(orgao, ano, apiKey);
          console.log(`Portal Transparência ${orgao.sigla} ${ano}: ${dados.length} registros`);
          resultados.push(...dados);
        } else {
          erros.push(`Sem dados para ${orgao.sigla} ${ano}: SPARQL bloqueado e sem API key do Portal da Transparência`);
        }
      } catch (error) {
        const msg = `Erro federal ${orgao.sigla} ${ano}: ${error instanceof Error ? error.message : "Unknown"}`;
        console.error(msg);
        erros.push(msg);
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  // UOs específicas (FUNAI, INCRA, SESAI) - only via SPARQL for now
  for (const uo of UOS_ESPECIFICAS) {
    for (const ano of anosRange) {
      try {
        const query = buildSparqlQueryByUO(ano, uo.codigo);
        const bindings = await executeSparqlQuery(query);
        if (bindings.length > 0) {
          console.log(`SIOP UO ${uo.sigla} ${ano}: ${bindings.length} registros`);
          const processados = processSiopData(bindings, uo, ano);
          resultados.push(...processados);
        }
      } catch (error) {
        const msg = `Erro SIOP UO ${uo.sigla} ${ano}: ${error instanceof Error ? error.message : "Unknown"}`;
        console.error(msg);
        erros.push(msg);
      }
      await new Promise((r) => setTimeout(r, 400));
    }
  }

  return resultados;
}

// ====== SICONFI / STN (Estadual e Municipal) ======
async function fetchSiconfiRREO(
  idEnte: number,
  ano: number,
  periodo: number = 6
): Promise<any[]> {
  const url = `${SICONFI_BASE}/rreo?an_exercicio=${ano}&nr_periodo=${periodo}&co_tipo_demonstrativo=RREO&id_ente=${idEnte}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

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
  const url = `${SICONFI_BASE}/dca?an_exercicio=${ano}&id_ente=${idEnte}&no_anexo=DCA-Anexo I-D`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) return [];

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
      liquidado: null,
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
    let fonte: string | undefined;
    let anos: number[] | undefined;
    let esfera: string | undefined;

    try {
      const body = await req.json();
      fonte = body.fonte;
      anos = body.anos;
      esfera = body.esfera;
    } catch {
      // No body or invalid JSON - use defaults
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const anosRange = anos || [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
    const resultados: DadoOrcamentario[] = [];
    const erros: string[] = [];

    // ====== FEDERAL (SPARQL + Portal da Transparência fallback) ======
    if (!fonte || fonte === "siop" || fonte === "portal" || esfera === "federal") {
      const dadosFederais = await fetchFederalData(anosRange, erros);
      resultados.push(...dadosFederais);
    }

    // ====== ESTADUAL (SICONFI) ======
    if (!fonte || fonte === "siconfi" || esfera === "estadual") {
      for (const estado of ESTADOS_SICONFI) {
        for (const ano of anosRange) {
          const dadosRREO = await fetchSiconfiRREO(estado.cod, ano, 6);
          if (dadosRREO.length > 0) {
            const processados = processSiconfiData(dadosRREO, estado, ano, "estadual");
            resultados.push(...processados);
          } else {
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

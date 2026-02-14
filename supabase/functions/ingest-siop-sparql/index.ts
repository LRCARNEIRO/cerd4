import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * ================================================================
 * METODOLOGIA DE INGESTÃO VIA SIOP/SPARQL — DADOS ABERTOS DO ORÇAMENTO
 * ================================================================
 *
 * OBJETIVO: Complementar a base orçamentária com dados de dotação inicial (PLOA e LOA)
 * e execução completa (empenhado, liquidado, pago) usando o endpoint SPARQL
 * do SIOP (Sistema Integrado de Planejamento e Orçamento).
 *
 * FONTE: https://www1.siop.planejamento.gov.br/sparql/
 *   — Endpoint SPARQL público do Ministério do Planejamento e Orçamento
 *   — Mesma base utilizada pelo pacote R "orcamentoBR" (CRAN)
 *   — Ontologia LOA: http://orcamento.dados.gov.br/
 *
 * VANTAGEM SOBRE A API DO PORTAL DA TRANSPARÊNCIA:
 *   ✅ Inclui dotação PLOA (Projeto de Lei Orçamentária Anual)
 *   ✅ Inclui dotação LOA (Lei Orçamentária Anual = dotação inicial)
 *   ✅ Inclui LOA + créditos adicionais (dotação autorizada)
 *   ✅ Todos os valores (empenhado, liquidado, pago) numa única consulta
 *   ✅ Detalhamento por programa e ação com descrições
 *   ✅ Sem necessidade de API key
 *
 * ESTRATÉGIA DE CONSULTA (mesmas 3 camadas da ingestão federal):
 *
 * CAMADA 1 — PROGRAMAS TEMÁTICOS DO PPA
 *   Consulta SPARQL filtrando por código de programa:
 *   - 5034: Igualdade Racial e Superação do Racismo
 *   - 5803: Juventude Negra Viva
 *   - 2065: Proteção e Promoção dos Direitos dos Povos Indígenas
 *   - 0153: Promoção e Defesa dos Direitos da Criança e do Adolescente
 *   - 2034: Promoção da Igualdade Racial (PPA 2016-2019)
 *
 * CAMADA 2 — SUBFUNÇÃO 422 (Direitos Individuais, Coletivos e Difusos)
 *   Consulta SPARQL filtrando por subfunção 422, com validação por
 *   palavras-chave para garantir relevância temática.
 *
 * CAMADA 3 — ÓRGÃOS MIR (67000) E MPI (92000)
 *   Consulta direta dos órgãos com mandato de política racial/indígena.
 *
 * CAMPOS COLETADOS:
 *   - programa (código + nome)
 *   - ação (código + nome)
 *   - PLOA (dotação do projeto de lei)
 *   - LOA (dotação inicial aprovada)
 *   - LOA + créditos (dotação autorizada)
 *   - empenhado
 *   - liquidado
 *   - pago
 *   - órgão (código + nome)
 * ================================================================
 */

const SIOP_SPARQL_URL = "https://www1.siop.planejamento.gov.br/sparql/";

// Programas temáticos do PPA
const PROGRAMAS_TEMATICOS = [
  { codigo: "5034", nome: "Igualdade Racial e Superação do Racismo", orgaoFallback: "MIR", desde: 2020 },
  { codigo: "5803", nome: "Juventude Negra Viva", orgaoFallback: "MIR", desde: 2024 },
  { codigo: "2065", nome: "Proteção e Promoção dos Direitos dos Povos Indígenas", orgaoFallback: "MPI", desde: 2012 },
  { codigo: "0153", nome: "Promoção da Criança e Adolescente", orgaoFallback: "MDHC", desde: 2004 },
  { codigo: "2034", nome: "Promoção da Igualdade Racial (PPA 2016-2019)", orgaoFallback: "SEPPIR", desde: 2016 },
];

// Órgãos com mandato direto
const ORGAOS_MANDATO = [
  { codigo: "67000", sigla: "MIR" },
  { codigo: "92000", sigla: "MPI" },
];

// Subfunção 422
const SUBFUNCAO_DIREITOS = "422";

// Palavras-chave de relevância
const KEYWORDS_RELEVANCIA = [
  "racial", "racismo", "indígen", "indigen", "quilombol", "cigan", "romani",
  "afro", "palmares", "igualdade racial", "funai", "sesai", "etnia", "étnic",
  "povos tradicionais", "comunidades tradicionais", "terreiro", "matriz africana",
  "capoeira", "cultura negra", "negro", "juventude negra",
];

// Programas transversais excluídos
const PROGRAMAS_EXCLUIDOS = ["2068", "2049", "2012", "2015", "6012", "5029"];

// Mapeamento de código de órgão para sigla
const SIGLA_MAP: Record<string, string> = {
  "67000": "MIR", "92000": "MPI", "26000": "MEC", "36000": "MS",
  "55000": "MDS", "30000": "MJSP", "44000": "MDHC", "47000": "MDHC",
  "37000": "FUNAI/MJ", "22000": "INCRA", "36901": "SESAI",
  "20000": "Presidência", "52000": "MDIC", "54000": "MTE",
};

/**
 * Builds a SPARQL query following the SIOP/LOA ontology.
 * Based on the orcamentoBR R package (CRAN).
 *
 * Graph URI: http://orcamento.dados.gov.br/{year}/
 * Ontology prefix: loa:
 */
function buildSparqlQuery(
  ano: number,
  opts: {
    filterPrograma?: string;
    filterSubfuncao?: string;
    filterOrgao?: string;
  } = {},
): string {
  let q = `SELECT ?codExercicio ?codOrgao ?descOrgao ?codPrograma ?descPrograma ?codAcao ?descAcao ?codSubfuncao ?descSubfuncao`;
  q += ` (sum(?val1) as ?ploa) (sum(?val2) as ?loa) (sum(?val3) as ?loa_mais_credito)`;
  q += ` (sum(?val4) as ?empenhado) (sum(?val5) as ?liquidado) (sum(?val6) as ?pago)`;
  q += ` WHERE { GRAPH <http://orcamento.dados.gov.br/${ano}/>`;
  q += ` {`;
  q += ` ?i loa:temExercicio ?exercicio .`;
  q += ` ?exercicio loa:identificador ?codExercicio .`;

  // Órgão (via UO)
  q += ` ?i loa:temUnidadeOrcamentaria ?UO .`;
  q += ` ?UO loa:temOrgao ?orgao .`;
  q += ` ?orgao loa:codigo ?codOrgao .`;
  q += ` ?orgao rdfs:label ?descOrgao .`;

  // Programa
  q += ` ?i loa:temPrograma ?programa .`;
  q += ` ?programa loa:codigo ?codPrograma .`;
  q += ` ?programa rdfs:label ?descPrograma .`;

  // Ação
  q += ` ?i loa:temAcao ?acao .`;
  q += ` ?acao loa:codigo ?codAcao .`;
  q += ` ?acao rdfs:label ?descAcao .`;

  // Subfunção
  q += ` ?i loa:temSubfuncao ?subfuncao .`;
  q += ` ?subfuncao loa:codigo ?codSubfuncao .`;
  q += ` ?subfuncao rdfs:label ?descSubfuncao .`;

  // Filtros específicos
  if (opts.filterPrograma) {
    q += ` ?programa loa:codigo "${opts.filterPrograma}" .`;
  }
  if (opts.filterSubfuncao) {
    q += ` ?subfuncao loa:codigo "${opts.filterSubfuncao}" .`;
  }
  if (opts.filterOrgao) {
    q += ` ?orgao loa:codigo "${opts.filterOrgao}" .`;
  }

  // Valores financeiros
  q += ` ?i loa:valorProjetoLei ?val1 .`;
  q += ` ?i loa:valorDotacaoInicial ?val2 .`;
  q += ` ?i loa:valorLeiMaisCredito ?val3 .`;
  q += ` ?i loa:valorEmpenhado ?val4 .`;
  q += ` ?i loa:valorLiquidado ?val5 .`;
  q += ` ?i loa:valorPago ?val6 .`;

  q += ` } }`;
  q += ` GROUP BY ?codExercicio ?codOrgao ?descOrgao ?codPrograma ?descPrograma ?codAcao ?descAcao ?codSubfuncao ?descSubfuncao`;

  return q;
}

async function executeSparql(query: string): Promise<any[]> {
  const encoded = encodeURIComponent(query.replace(/\n/g, " ").replace(/\s+/g, " "));
  const url = `${SIOP_SPARQL_URL}?default-graph-uri=&query=${encoded}&format=application%2Fsparql-results%2Bjson&timeout=60000&debug=on`;

  console.log(`  SPARQL URL length: ${url.length}`);

  const res = await fetch(url, {
    headers: { "Accept": "application/sparql-results+json" },
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`  SPARQL error ${res.status}:`, text.substring(0, 300));
    throw new Error(`SPARQL ${res.status}: ${text.substring(0, 200)}`);
  }

  const data = await res.json();
  const bindings = data?.results?.bindings || [];
  return bindings;
}

function resolveOrgaoSigla(codOrgao: string): string {
  return SIGLA_MAP[codOrgao] || codOrgao;
}

function isRelevant(codPrograma: string, descPrograma: string, descAcao: string, descSubfuncao: string): boolean {
  if (PROGRAMAS_EXCLUIDOS.includes(codPrograma)) return false;
  if (PROGRAMAS_TEMATICOS.some(p => p.codigo === codPrograma)) return true;

  const text = [descPrograma, descAcao, descSubfuncao].filter(Boolean).join(" ").toLowerCase();
  return KEYWORDS_RELEVANCIA.some(kw => text.includes(kw));
}

function bindingToRecord(b: any, ano: number, camada: string, fallbackOrgao: string) {
  const codProg = b.codPrograma?.value || "";
  const descProg = b.descPrograma?.value || "";
  const codAcao = b.codAcao?.value || "";
  const descAcao = b.descAcao?.value || "";
  const codOrgao = b.codOrgao?.value || "";
  const descOrgao = b.descOrgao?.value || "";

  if (!codProg && !descProg) return null;

  let programa = codProg ? `${codProg} – ${descProg}` : descProg;
  if (codAcao) programa += ` / ${codAcao} – ${descAcao}`;

  const ploa = parseFloat(b.ploa?.value) || null;
  const loa = parseFloat(b.loa?.value) || null;
  const loaMaisCredito = parseFloat(b.loa_mais_credito?.value) || null;
  const empenhado = parseFloat(b.empenhado?.value) || null;
  const liquidado = parseFloat(b.liquidado?.value) || null;
  const pago = parseFloat(b.pago?.value) || null;

  if (!ploa && !loa && !loaMaisCredito && !empenhado && !liquidado && !pago) return null;

  const orgaoSigla = resolveOrgaoSigla(codOrgao) || fallbackOrgao;
  const dotacaoAutorizada = loaMaisCredito || loa || ploa;
  const percentual = dotacaoAutorizada && pago ? Math.round((pago / dotacaoAutorizada) * 10000) / 100 : null;

  return {
    programa: programa.substring(0, 250),
    orgao: orgaoSigla,
    esfera: "federal",
    ano,
    dotacao_inicial: loa || ploa,
    dotacao_autorizada: dotacaoAutorizada,
    empenhado,
    liquidado,
    pago,
    percentual_execucao: percentual,
    fonte_dados: `SIOP/SPARQL (${camada})`,
    url_fonte: `https://www1.siop.planejamento.gov.br/sparql/`,
    observacoes: `Camada: ${camada} | PLOA: ${ploa ? (ploa / 1e6).toFixed(1) + "M" : "n/d"} | LOA: ${loa ? (loa / 1e6).toFixed(1) + "M" : "n/d"} | Órgão SIOP: ${codOrgao} – ${descOrgao}`,
    eixo_tematico: null,
    grupo_focal: null,
  };
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

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const erros: string[] = [];
    const registrosMap = new Map<string, any>();
    const logCamadas: Record<string, { consultas: number; bindings: number; relevantes: number }> = {};

    console.log(`=== INGESTÃO SIOP/SPARQL ===`);
    console.log(`Anos: ${anos.join(", ")}`);
    console.log(`Camadas: ${camadas.join(", ")}`);

    // ===== CAMADA 1: Programas Temáticos =====
    if (camadas.includes("programas")) {
      console.log(`\n--- CAMADA 1: Programas Temáticos via SPARQL ---`);
      let consultas = 0, totalBindings = 0, relevantes = 0;

      for (const prog of PROGRAMAS_TEMATICOS) {
        for (const ano of anos) {
          if (ano < prog.desde) continue;
          console.log(`  Programa ${prog.codigo} (${prog.nome}), ${ano}...`);

          try {
            const query = buildSparqlQuery(ano, { filterPrograma: prog.codigo });
            const bindings = await executeSparql(query);
            consultas++;
            totalBindings += bindings.length;

            for (const b of bindings) {
              const codProg = b.codPrograma?.value || "";
              const descProg = b.descPrograma?.value || "";
              const descAcao = b.descAcao?.value || "";
              const descSub = b.descSubfuncao?.value || "";

              if (!isRelevant(codProg, descProg, descAcao, descSub)) continue;

              const record = bindingToRecord(b, ano, "Programa PPA (SPARQL)", prog.orgaoFallback);
              if (record) {
                const key = `${record.orgao}|${record.programa}|${record.ano}`;
                const existing = registrosMap.get(key);
                if (!existing || (record.pago && (!existing.pago || record.pago > existing.pago))) {
                  registrosMap.set(key, record);
                  relevantes++;
                }
              }
            }
            console.log(`    → ${bindings.length} bindings, ${relevantes} relevantes acumulados`);
          } catch (e) {
            const msg = `Camada1 SPARQL ${prog.codigo}/${ano}: ${e instanceof Error ? e.message : "?"}`;
            erros.push(msg);
            console.error(`    ${msg}`);
          }
          await new Promise(r => setTimeout(r, 1000)); // Rate limiting
        }
      }
      logCamadas["programas"] = { consultas, bindings: totalBindings, relevantes };
    }

    // ===== CAMADA 2: Subfunção 422 =====
    if (camadas.includes("subfuncao")) {
      console.log(`\n--- CAMADA 2: Subfunção 422 via SPARQL ---`);
      let consultas = 0, totalBindings = 0, relevantes = 0;

      for (const ano of anos) {
        console.log(`  Subfunção ${SUBFUNCAO_DIREITOS}, ${ano}...`);
        try {
          const query = buildSparqlQuery(ano, { filterSubfuncao: SUBFUNCAO_DIREITOS });
          const bindings = await executeSparql(query);
          consultas++;
          totalBindings += bindings.length;

          for (const b of bindings) {
            const codProg = b.codPrograma?.value || "";
            const descProg = b.descPrograma?.value || "";
            const descAcao = b.descAcao?.value || "";
            const descSub = b.descSubfuncao?.value || "";

            if (!isRelevant(codProg, descProg, descAcao, descSub)) continue;

            const record = bindingToRecord(b, ano, "Subfunção 422 (SPARQL)", "MDHC");
            if (record) {
              const key = `${record.orgao}|${record.programa}|${record.ano}`;
              if (!registrosMap.has(key)) {
                registrosMap.set(key, record);
                relevantes++;
              }
            }
          }
          console.log(`    → ${bindings.length} bindings, ${relevantes} relevantes acumulados`);
        } catch (e) {
          erros.push(`Camada2 SPARQL subfuncao422/${ano}: ${e instanceof Error ? e.message : "?"}`);
        }
        await new Promise(r => setTimeout(r, 1000));
      }
      logCamadas["subfuncao"] = { consultas, bindings: totalBindings, relevantes };
    }

    // ===== CAMADA 3: Órgãos MIR e MPI =====
    if (camadas.includes("orgaos")) {
      console.log(`\n--- CAMADA 3: Órgãos MIR/MPI via SPARQL ---`);
      let consultas = 0, totalBindings = 0, relevantes = 0;

      for (const org of ORGAOS_MANDATO) {
        for (const ano of anos) {
          console.log(`  Órgão ${org.sigla} (${org.codigo}), ${ano}...`);
          try {
            const query = buildSparqlQuery(ano, { filterOrgao: org.codigo });
            const bindings = await executeSparql(query);
            consultas++;
            totalBindings += bindings.length;

            for (const b of bindings) {
              const record = bindingToRecord(b, ano, `Órgão ${org.sigla} (SPARQL)`, org.sigla);
              if (record) {
                const key = `${record.orgao}|${record.programa}|${record.ano}`;
                if (!registrosMap.has(key)) {
                  registrosMap.set(key, record);
                  relevantes++;
                }
              }
            }
            console.log(`    → ${bindings.length} bindings, ${relevantes} relevantes acumulados`);
          } catch (e) {
            erros.push(`Camada3 SPARQL ${org.sigla}/${ano}: ${e instanceof Error ? e.message : "?"}`);
          }
          await new Promise(r => setTimeout(r, 1000));
        }
      }
      logCamadas["orgaos"] = { consultas, bindings: totalBindings, relevantes };
    }

    // ===== INSERÇÃO NO BANCO =====
    const batch = Array.from(registrosMap.values());
    let totalInserted = 0;
    const BATCH_SIZE = 50;

    console.log(`\n=== Inserindo ${batch.length} registros deduplicados (SPARQL) ===`);

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
        descricao: "Ingestão via SIOP/SPARQL — dados completos com dotação inicial (PLOA/LOA)",
        fonte: "SIOP – Sistema Integrado de Planejamento e Orçamento (Ministério do Planejamento)",
        endpoint: SIOP_SPARQL_URL,
        ontologia: "http://orcamento.dados.gov.br/",
        referencia_tecnica: "Pacote R orcamentoBR (CRAN) — Daniel Gersten Reiss, MPO",
        campos_financeiros: "PLOA, LOA (dotação inicial), LOA+créditos (autorizada), empenhado, liquidado, pago",
        camada_1: "Programas temáticos PPA: " + PROGRAMAS_TEMATICOS.map(p => p.codigo).join(", "),
        camada_2: "Subfunção 422 (Direitos Individuais, Coletivos e Difusos)",
        camada_3: "Órgãos MIR (67000) e MPI (92000)",
        exclusoes: "Programas transversais excluídos: " + PROGRAMAS_EXCLUIDOS.join(", "),
      },
    };

    console.log(`\n=== SIOP/SPARQL CONCLUÍDO: ${totalInserted} inseridos, ${erros.length} erros ===`);

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

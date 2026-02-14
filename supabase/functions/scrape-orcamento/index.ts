import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Órgãos federais relevantes para política racial
const ORGAOS_FEDERAIS = [
  { codigo: "67000", nome: "Ministério da Igualdade Racial", sigla: "MIR", desde: 2023 },
  { codigo: "92000", nome: "Ministério dos Povos Indígenas", sigla: "MPI", desde: 2023 },
  { codigo: "26000", nome: "Ministério da Educação", sigla: "MEC", desde: 2001 },
  { codigo: "36000", nome: "Ministério da Saúde", sigla: "MS", desde: 2001 },
  { codigo: "55000", nome: "Ministério do Desenvolvimento Social", sigla: "MDS", desde: 2001 },
  { codigo: "30000", nome: "Ministério da Justiça e Segurança Pública", sigla: "MJSP", desde: 2001 },
];

const UOS_ESPECIFICAS = [
  { codigo: "37201", orgao: "37000", nome: "FUNAI", sigla: "FUNAI" },
  { codigo: "22201", orgao: "22000", nome: "INCRA", sigla: "INCRA" },
  { codigo: "36901", orgao: "36000", nome: "SESAI", sigla: "SESAI" },
];

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

// ====== FIRECRAWL + AI: Scrape Portal da Transparência pages ======
async function fetchFederalViaFirecrawl(
  anosRange: number[],
  erros: string[],
  supabase: any // Insert progressively to avoid timeout
): Promise<number> {
  const firecrawlApiKey = Deno.env.get("FIRECRAWL_API_KEY");
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");

  if (!firecrawlApiKey) { erros.push("FIRECRAWL_API_KEY não configurada"); return 0; }
  if (!lovableApiKey) { erros.push("LOVABLE_API_KEY não configurada"); return 0; }

  let totalInserted = 0;
  
  // Process limited orgaos to stay within edge function timeout (~60s)
  const orgaosToProcess = anosRange.length <= 2 ? ORGAOS_FEDERAIS : ORGAOS_FEDERAIS.slice(0, 2);

  for (const orgao of orgaosToProcess) {
    for (const ano of anosRange) {
      if (orgao.desde && ano < orgao.desde) continue;

      try {
        // Scrape the Portal da Transparência page for this org + year (programa e ação view)
        const portalUrl = `https://portaldatransparencia.gov.br/despesas/programa-e-acao?de=01%2F01%2F${ano}&ate=31%2F12%2F${ano}&orgaos=OS${orgao.codigo}`;
        
        console.log(`Firecrawl scraping: ${orgao.sigla} ${ano} → ${portalUrl}`);

        const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: portalUrl,
          formats: ["markdown"],
            waitFor: 3000,
            onlyMainContent: true,
          }),
        });

        if (!scrapeResponse.ok) {
          const errText = await scrapeResponse.text();
          console.error(`Firecrawl error ${orgao.sigla} ${ano}: ${scrapeResponse.status} ${errText.substring(0, 200)}`);
          erros.push(`Firecrawl ${orgao.sigla} ${ano}: HTTP ${scrapeResponse.status}`);
          continue;
        }

        const scrapeData = await scrapeResponse.json();
        const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || "";

        if (!markdown || markdown.length < 100) {
          console.log(`Firecrawl ${orgao.sigla} ${ano}: conteúdo vazio ou curto (${markdown.length} chars)`);
          erros.push(`${orgao.sigla} ${ano}: página sem dados de programas`);
          continue;
        }

        console.log(`Firecrawl ${orgao.sigla} ${ano}: ${markdown.length} chars de markdown`);

        // Use AI to extract structured budget data from the markdown
        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `Você é um especialista em orçamento público brasileiro e políticas de igualdade racial. Extraia APENAS programas e ações relacionados a políticas raciais do conteúdo fornecido.

FILTRO OBRIGATÓRIO – Inclua SOMENTE programas/ações que tratem de:
- Igualdade racial, combate ao racismo, promoção racial
- Povos indígenas, demarcação de terras indígenas, FUNAI
- Comunidades quilombolas, titulação de territórios quilombolas
- Comunidades tradicionais (ciganos, terreiros, matriz africana)
- Saúde indígena (SESAI), saúde da população negra
- Juventude negra, mulheres negras, violência racial
- Educação étnico-racial, cotas raciais, ações afirmativas
- Cultura afro-brasileira, patrimônio cultural negro/indígena
- Reforma agrária para quilombolas e indígenas (INCRA)
- Segurança alimentar de povos tradicionais
- Direitos humanos com recorte racial

EXCLUA programas genéricos/transversais (Bolsa Família, Minha Casa Minha Vida, Fundo Eleitoral, agricultura familiar genérica, etc.) que não tenham recorte racial explícito.

Retorne APENAS um JSON array:
[
  {
    "codigo_programa": "5034",
    "nome_programa": "Promoção da Igualdade Racial e Superação do Racismo",
    "codigo_acao": "20ZF",
    "nome_acao": "Descrição da ação",
    "dotacao_autorizada": 123456789.00,
    "empenhado": 100000000.00,
    "liquidado": 90000000.00,
    "pago": 85000000.00
  }
]

REGRAS:
- Valores monetários em reais (número puro, sem formatação)
- Busque dotacao_autorizada nos campos "Dotação Atualizada", "Crédito Autorizado" ou "LOA + Créditos"
- Se não encontrar dados de políticas raciais, retorne []
- Retorne APENAS o JSON, sem markdown ou explicações`
              },
              {
                role: "user",
                content: `Extraia os dados orçamentários de programas e ações do ${orgao.nome} (${orgao.sigla}) para o ano ${ano} do seguinte conteúdo:\n\n${markdown.substring(0, 60000)}`
              }
            ],
            temperature: 0.1,
            max_tokens: 16000,
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI error for ${orgao.sigla} ${ano}: ${aiResponse.status}`);
          erros.push(`AI extraction ${orgao.sigla} ${ano}: HTTP ${aiResponse.status}`);
          continue;
        }

        const aiResult = await aiResponse.json();
        const aiContent = aiResult.choices?.[0]?.message?.content || "[]";

        let programs: any[];
        try {
          let clean = aiContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
          const match = clean.match(/\[[\s\S]*\]/);
          programs = match ? JSON.parse(match[0]) : [];
        } catch {
          console.error(`JSON parse error for ${orgao.sigla} ${ano}`);
          programs = [];
        }

        console.log(`AI extracted ${programs.length} programs for ${orgao.sigla} ${ano}`);

        for (const prog of programs) {
          const codProg = prog.codigo_programa || "";
          const nomeProg = prog.nome_programa || "";
          const codAcao = prog.codigo_acao || "";
          const nomeAcao = prog.nome_acao || "";

          if (!codProg && !nomeProg) continue;

          let programaLabel = codProg ? `${codProg} – ${nomeProg}` : nomeProg;
          if (codAcao && nomeAcao) {
            programaLabel += ` / ${codAcao} – ${nomeAcao}`;
          } else if (codAcao) {
            programaLabel += ` / ${codAcao}`;
          }

          const dotacao = Number(prog.dotacao_autorizada) || null;
          const empenhado = Number(prog.empenhado) || null;
          const liquidado = Number(prog.liquidado) || null;
          const pago = Number(prog.pago) || null;

          if (!dotacao && !empenhado && !pago) continue;

          const percentual = dotacao && pago ? Math.round((pago / dotacao) * 10000) / 100 : null;

          const row: DadoOrcamentario = {
            programa: programaLabel.substring(0, 250),
            orgao: orgao.sigla,
            esfera: "federal",
            ano,
            dotacao_autorizada: dotacao,
            empenhado,
            liquidado,
            pago,
            percentual_execucao: percentual,
            fonte_dados: `Portal da Transparência – ${orgao.sigla}`,
            url_fonte: portalUrl.replace(/%2F/g, "/"),
            observacoes: null,
            eixo_tematico: null,
            grupo_focal: null,
          };
          const { error: insErr } = await supabase.from("dados_orcamentarios").insert(row);
          if (insErr) { erros.push(`Insert ${orgao.sigla}: ${insErr.message}`); }
          else { totalInserted++; }
        }

        // Rate limit
        await new Promise((r) => setTimeout(r, 1000));
      } catch (error) {
        const msg = `Erro Firecrawl ${orgao.sigla} ${ano}: ${error instanceof Error ? error.message : "Unknown"}`;
        console.error(msg);
        erros.push(msg);
      }
    }
  }

  // UOs específicas (FUNAI, INCRA, SESAI)
  for (const uo of UOS_ESPECIFICAS) {
    for (const ano of anosRange) {
      try {
        const portalUrl = `https://portaldatransparencia.gov.br/despesas/programa-e-acao?de=01%2F01%2F${ano}&ate=31%2F12%2F${ano}&orgaos=UO${uo.codigo}`;
        
        console.log(`Firecrawl scraping UO: ${uo.sigla} ${ano}`);

        const scrapeResponse = await fetch("https://api.firecrawl.dev/v1/scrape", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: portalUrl,
            formats: ["markdown"],
            waitFor: 5000,
            onlyMainContent: true,
          }),
        });

        if (!scrapeResponse.ok) continue;

        const scrapeData = await scrapeResponse.json();
        const markdown = scrapeData?.data?.markdown || scrapeData?.markdown || "";
        if (!markdown || markdown.length < 100) continue;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              {
                role: "system",
                content: `Extraia APENAS programas/ações de políticas raciais (igualdade racial, povos indígenas, quilombolas, saúde indígena, comunidades tradicionais, juventude negra, ações afirmativas, cultura afro-brasileira). EXCLUA programas genéricos sem recorte racial. Retorne APENAS JSON array: [{"codigo_programa":"","nome_programa":"","codigo_acao":"","nome_acao":"","dotacao_autorizada":0,"empenhado":0,"liquidado":0,"pago":0}]. Sem markdown.`
              },
              {
                role: "user",
                content: `Extraia programas/ações de ${uo.nome} (${uo.sigla}) ano ${ano}:\n\n${markdown.substring(0, 60000)}`
              }
            ],
            temperature: 0.1,
            max_tokens: 16000,
          }),
        });

        if (!aiResponse.ok) continue;

        const aiResult = await aiResponse.json();
        const aiContent = aiResult.choices?.[0]?.message?.content || "[]";
        let programs: any[];
        try {
          let clean = aiContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
          programs = JSON.parse(clean.match(/\[[\s\S]*\]/)?.[0] || "[]");
        } catch { programs = []; }

        for (const prog of programs) {
          const codProg = prog.codigo_programa || "";
          const nomeProg = prog.nome_programa || "";
          if (!codProg && !nomeProg) continue;

          let label = codProg ? `${codProg} – ${nomeProg}` : nomeProg;
          if (prog.codigo_acao) label += ` / ${prog.codigo_acao}${prog.nome_acao ? ` – ${prog.nome_acao}` : ""}`;

          const dotacao = Number(prog.dotacao_autorizada) || null;
          const empenhado = Number(prog.empenhado) || null;
          const pago = Number(prog.pago) || null;
          if (!dotacao && !empenhado && !pago) continue;

          const row: DadoOrcamentario = {
            programa: label.substring(0, 250),
            orgao: uo.sigla,
            esfera: "federal",
            ano,
            dotacao_autorizada: dotacao,
            empenhado,
            liquidado: Number(prog.liquidado) || null,
            pago,
            percentual_execucao: dotacao && pago ? Math.round((pago / dotacao) * 10000) / 100 : null,
            fonte_dados: `Portal da Transparência – ${uo.sigla}`,
            url_fonte: portalUrl.replace(/%2F/g, "/"),
            observacoes: null,
            eixo_tematico: null,
            grupo_focal: null,
          };
          const { error: insErr } = await supabase.from("dados_orcamentarios").insert(row);
          if (!insErr) totalInserted++;
        }

        await new Promise((r) => setTimeout(r, 1000));
      } catch (error) {
        erros.push(`Erro UO ${uo.sigla} ${ano}: ${error instanceof Error ? error.message : "Unknown"}`);
      }
    }
  }

  return totalInserted;
}

// ====== SICONFI / STN (Estadual e Municipal) ======
async function fetchSiconfiRREO(idEnte: number, ano: number, periodo: number = 6): Promise<any[]> {
  const url = `${SICONFI_BASE}/rreo?an_exercicio=${ano}&nr_periodo=${periodo}&co_tipo_demonstrativo=RREO&id_ente=${idEnte}`;
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) return [];
    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error(`SICONFI fetch error for ente ${idEnte}:`, error);
    return [];
  }
}

async function fetchSiconfiBudgetExecution(idEnte: number, ano: number): Promise<any[]> {
  const url = `${SICONFI_BASE}/dca?an_exercicio=${ano}&id_ente=${idEnte}&no_anexo=DCA-Anexo I-D`;
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
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
    "direitos da cidadania", "assistência social", "educação",
    "saúde", "cultura", "habitação", "saneamento",
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
    console.log(`Foco: programas de políticas raciais | Anos: ${anosRange.join(", ")}`);
    const resultados: DadoOrcamentario[] = [];
    const erros: string[] = [];
    let federalInserted = 0;

    // ====== FEDERAL (Firecrawl + AI extraction — inserts progressively) ======
    if (!fonte || fonte === "firecrawl" || fonte === "siop" || fonte === "portal" || esfera === "federal") {
      federalInserted = await fetchFederalViaFirecrawl(anosRange, erros, supabase);
    }

    // ====== ESTADUAL (SICONFI) ======
    if (!fonte || fonte === "siconfi" || esfera === "estadual") {
      for (const estado of ESTADOS_SICONFI) {
        for (const ano of anosRange) {
          const dadosRREO = await fetchSiconfiRREO(estado.cod, ano, 6);
          if (dadosRREO.length > 0) {
            resultados.push(...processSiconfiData(dadosRREO, estado, ano, "estadual"));
          } else {
            const dadosDCA = await fetchSiconfiBudgetExecution(estado.cod, ano);
            resultados.push(...processSiconfiData(dadosDCA, estado, ano, "estadual"));
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
            resultados.push(...processSiconfiData(dadosRREO, municipio, ano, "municipal"));
          } else {
            const dadosDCA = await fetchSiconfiBudgetExecution(municipio.cod, ano);
            resultados.push(...processSiconfiData(dadosDCA, municipio, ano, "municipal"));
          }
          await new Promise((r) => setTimeout(r, 300));
        }
      }
    }

    // Insert SICONFI data (estadual/municipal) in batch
    let siconfiInserted = 0;
    if (resultados.length > 0) {
      const batchSize = 50;
      for (let i = 0; i < resultados.length; i += batchSize) {
        const batch = resultados.slice(i, i + batchSize);
        const { error } = await supabase.from("dados_orcamentarios").insert(batch);
        if (error) {
          erros.push(`Erro inserção SICONFI lote ${i}: ${error.message}`);
        } else {
          siconfiInserted += batch.length;
        }
      }
    }

    const totalInserted = federalInserted + siconfiInserted;
    console.log(`Total inseridos: ${totalInserted} (federal: ${federalInserted}, siconfi: ${siconfiInserted})`);

    return new Response(
      JSON.stringify({
        success: true,
        total_inseridos: totalInserted,
        por_esfera: {
          federal: federalInserted,
          estadual: resultados.filter((r) => r.esfera === "estadual").length,
          municipal: resultados.filter((r) => r.esfera === "municipal").length,
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

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ESTADOS_IBGE: Record<string, { cod: number; nome: string }> = {
  AC: { cod: 12, nome: "Acre" }, AL: { cod: 27, nome: "Alagoas" },
  AP: { cod: 16, nome: "Amapá" }, AM: { cod: 13, nome: "Amazonas" },
  BA: { cod: 29, nome: "Bahia" }, CE: { cod: 23, nome: "Ceará" },
  DF: { cod: 53, nome: "Distrito Federal" }, ES: { cod: 32, nome: "Espírito Santo" },
  GO: { cod: 52, nome: "Goiás" }, MA: { cod: 21, nome: "Maranhão" },
  MT: { cod: 51, nome: "Mato Grosso" }, MS: { cod: 50, nome: "Mato Grosso do Sul" },
  MG: { cod: 31, nome: "Minas Gerais" }, PA: { cod: 15, nome: "Pará" },
  PB: { cod: 25, nome: "Paraíba" }, PR: { cod: 41, nome: "Paraná" },
  PE: { cod: 26, nome: "Pernambuco" }, PI: { cod: 22, nome: "Piauí" },
  RJ: { cod: 33, nome: "Rio de Janeiro" }, RN: { cod: 24, nome: "Rio Grande do Norte" },
  RS: { cod: 43, nome: "Rio Grande do Sul" }, RO: { cod: 11, nome: "Rondônia" },
  RR: { cod: 14, nome: "Roraima" }, SC: { cod: 42, nome: "Santa Catarina" },
  SP: { cod: 35, nome: "São Paulo" }, SE: { cod: 28, nome: "Sergipe" },
  TO: { cod: 17, nome: "Tocantins" },
};

// ════════════════════════════════════════════════════════════
// RADICAIS E KEYWORDS
// ════════════════════════════════════════════════════════════

const RADICAIS_POR_GRUPO: { grupo: string; radicais: string[] }[] = [
  {
    grupo: "Negro/Afrodescendente",
    radicais: ["racial", "racis", "negr", "afro", "afrodescend", "palmares", "seppir", "sepromi",
      "sepir", "candombl", "umbanda", "matriz african", "antirracis", "consciencia negra",
      "igualdade racial", "promocao da igualdade"],
  },
  {
    grupo: "Indígena",
    radicais: ["indigen", "funai", "sesai", "povos originari", "terra indigena", "saude indigena",
      "educacao indigena"],
  },
  {
    grupo: "Quilombola",
    radicais: ["quilombol", "quilombo", "remanescentes de quilombo"],
  },
  {
    grupo: "Comunidade Tradicional",
    radicais: ["comunidades tradicion", "povos tradicion", "povos e comunidades"],
  },
  {
    grupo: "Cigano/Roma",
    radicais: ["cigan", "romani", "povo cigano"],
  },
];

const TODOS_RADICAIS = RADICAIS_POR_GRUPO.flatMap(g => g.radicais);

function normalize(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function classificarGrupo(texto: string): string {
  const norm = normalize(texto);
  for (const g of RADICAIS_POR_GRUPO) {
    if (g.radicais.some(r => norm.includes(r))) return g.grupo;
  }
  return "Racial/Étnico";
}

function encontrarRadical(texto: string): string | null {
  const norm = normalize(texto);
  for (const r of TODOS_RADICAIS) {
    if (norm.includes(r)) return r;
  }
  return null;
}

// ════════════════════════════════════════════════════════════
// PASSO 1: BUSCAR URLs DE PDFs DE PPA VIA FIRECRAWL SEARCH
// ════════════════════════════════════════════════════════════

const PPA_CICLOS = [
  { label: "PPA 2024-2027", termos: [`PPA 2024 2027`] },
  { label: "PPA 2020-2023", termos: [`PPA 2020 2023`] },
  { label: "PPA 2016-2019", termos: [`PPA 2016 2019`] },
];

interface DocEncontrado {
  url: string;
  titulo: string;
  ciclo: string;
}

async function buscarPDFs(
  nomeEstado: string, firecrawlKey: string,
): Promise<{ docs: DocEncontrado[]; logs: string[] }> {
  const logs: string[] = [];
  const docs: DocEncontrado[] = [];
  const seenUrls = new Set<string>();

  for (const ciclo of PPA_CICLOS) {
    for (const termo of ciclo.termos) {
      const query = `${termo} ${nomeEstado} site:*.gov.br`;
      try {
        console.log(`  Busca PDF: ${query.substring(0, 90)}...`);
        const res = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ query, limit: 5, lang: "pt-BR", country: "BR" }),
          signal: AbortSignal.timeout(20_000),
        });

        if (res.status === 429) {
          logs.push(`Rate limit ${ciclo.label}, pausando 3s...`);
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        if (!res.ok) {
          logs.push(`Search ${ciclo.label} HTTP ${res.status}`);
          continue;
        }

        const data = await res.json();
        const results = data?.data ?? [];
        let added = 0;

        for (const r of results) {
          const url = String(r.url ?? "");
          if (!url || seenUrls.has(url)) continue;
          seenUrls.add(url);
          docs.push({ url, titulo: String(r.title ?? url), ciclo: ciclo.label });
          added++;
        }
        logs.push(`Search ${ciclo.label} "${termo.substring(0, 30)}": ${results.length} resultados, +${added} docs`);
      } catch (e) {
        logs.push(`Search ${ciclo.label}: ${e instanceof Error ? e.message : "Erro"}`);
      }
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // Busca direta por keywords raciais/étnicas
  const kwQuery = `PPA ${nomeEstado} "igualdade racial" OR "quilombola" OR "indígena" programa ação site:*.gov.br`;
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/search", {
      method: "POST",
      headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: kwQuery, limit: 5, lang: "pt-BR", country: "BR" }),
      signal: AbortSignal.timeout(15_000),
    });
    if (res.ok) {
      const data = await res.json();
      const results = data?.data ?? [];
      for (const r of results) {
        const url = String(r.url ?? "");
        if (!url || seenUrls.has(url)) continue;
        seenUrls.add(url);
        const texto = normalize(String(r.title ?? "") + " " + String(r.description ?? ""));
        let cicloLabel = "PPA (indefinido)";
        if (texto.includes("2024") || texto.includes("2025") || texto.includes("2026") || texto.includes("2027")) cicloLabel = "PPA 2024-2027";
        else if (texto.includes("2020") || texto.includes("2021") || texto.includes("2022") || texto.includes("2023")) cicloLabel = "PPA 2020-2023";
        else if (texto.includes("2016") || texto.includes("2017") || texto.includes("2018") || texto.includes("2019")) cicloLabel = "PPA 2016-2019";
        docs.push({ url, titulo: String(r.title ?? url), ciclo: cicloLabel });
      }
      logs.push(`Search keywords: ${results.length} resultados`);
    }
  } catch (e) {
    logs.push(`Search keywords: ${e instanceof Error ? e.message : "Erro"}`);
  }

  logs.push(`Total: ${docs.length} documentos encontrados`);
  return { docs, logs };
}

// ════════════════════════════════════════════════════════════
// PASSO 2: SCRAPE CADA DOCUMENTO E EXTRAIR AÇÕES
// ════════════════════════════════════════════════════════════

interface AcaoExtraida {
  nome: string;
  codigo: string | null;
  grupo: string;
  criterio: string;
  url_fonte: string;
  ppa_cycle: string;
}

// Linhas a rejeitar (metadados, não ações orçamentárias)
const REJEITAR = [
  "indicador de", "meta fisic", "meta prevista", "unidade de medida",
  "produto esperado", "indice de referencia", "formula de calculo",
  "apuracao do indice", "periodicidade", "base geografica",
  "fonte do indicador", "orgao responsavel pelo indicador",
  "objetivo estrategico", "objetivo de desenvolvimento",
  "saiba mais", "confira", "clique aqui", "acesse",
  "licitacao", "edital n", "portaria n", "decreto n",
  "diario oficial", "publicado em", "resolucao n",
  "sumario", "indice", "pagina", "voltar ao topo",
];

function extrairAcoes(markdown: string, url: string, ciclo: string): AcaoExtraida[] {
  const acoes: AcaoExtraida[] = [];
  const seen = new Set<string>();
  const lines = markdown.split(/\n/);

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].replace(/^\|+/, "").replace(/\|+$/, "").replace(/\|/g, " ").replace(/\s{2,}/g, " ").trim();
    if (line.length < 10 || line.length > 500) continue;

    const lineNorm = normalize(line);

    // Skip rejected patterns
    if (REJEITAR.some(t => lineNorm.includes(t))) continue;
    // Skip pure numeric/formatting lines
    if (/^[\d\s\.,R\$%\-]+$/.test(line)) continue;

    // Check if this line or nearby context contains a racial/ethnic radical
    const ctxStart = Math.max(0, i - 3);
    const ctxEnd = Math.min(lines.length, i + 4);
    const contexto = lines.slice(ctxStart, ctxEnd).join(" ");
    const radicalNaLinha = encontrarRadical(line);
    const radicalNoContexto = encontrarRadical(contexto);
    const radical = radicalNaLinha ?? radicalNoContexto;

    if (!radical) continue;

    // Try to extract code from the line
    let codigo: string | null = null;
    let nome = line;

    // Pattern: "Programa XXXX — Nome" or "Ação XXXX — Nome"
    const matchCodigo = line.match(
      /(?:Programa|A[çc][ãa]o|Atividade|Projeto|Opera[çc][ãa]o\s+Especial)\s+(\d{3,6})\s*[—–\-:\.\s]\s*(.+)/i
    );
    if (matchCodigo) {
      codigo = matchCodigo[1];
      nome = `${matchCodigo[0].match(/^\S+/)?.[0]} ${codigo} — ${matchCodigo[2].trim()}`;
    } else {
      // Pattern: "XXXX — Nome" (code at start)
      const matchCode = line.match(/^(\d{3,6})\s*[—–\-:\.\s]\s*(.{8,})/);
      if (matchCode) {
        codigo = matchCode[1];
        nome = `${codigo} — ${matchCode[2].trim()}`;
      }
    }

    // Clean up the name
    nome = nome
      .replace(/^\[PDF\]\s*/i, "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .substring(0, 250);

    // Dedup key
    const key = codigo
      ? `${codigo}_${ciclo}`
      : normalize(nome).substring(0, 50);

    if (seen.has(key)) continue;
    seen.add(key);

    // Only add if the radical is actually in the line itself (not just context)
    // OR if the line has a budget code
    if (!radicalNaLinha && !codigo) continue;

    acoes.push({
      nome,
      codigo,
      grupo: classificarGrupo(line + " " + contexto),
      criterio: codigo
        ? `Código ${codigo}: radical "${radical}"`
        : `Radical "${radical}" na descrição`,
      url_fonte: url,
      ppa_cycle: ciclo,
    });
  }

  return acoes;
}

async function scrapeEExtrair(
  docs: DocEncontrado[], firecrawlKey: string, maxDocs: number,
): Promise<{ acoes: AcaoExtraida[]; logs: string[] }> {
  const logs: string[] = [];
  const acoes: AcaoExtraida[] = [];
  const globalSeen = new Set<string>();

  // Prioritize HTML pages over PDFs (PDFs often fail with HTTP 500)
  const sorted = [...docs].sort((a, b) => {
    const aIsPdf = a.url.toLowerCase().endsWith(".pdf") ? 1 : 0;
    const bIsPdf = b.url.toLowerCase().endsWith(".pdf") ? 1 : 0;
    return aIsPdf - bIsPdf;
  });
  const toProcess = sorted.slice(0, maxDocs);
  logs.push(`Processando ${toProcess.length} de ${docs.length} documentos (HTML primeiro)...`);

  for (const doc of toProcess) {
    try {
      console.log(`  Scrape: ${doc.url.substring(0, 80)}`);
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          url: doc.url,
          formats: ["markdown"],
          onlyMainContent: false,
          waitFor: 1000,
        }),
        signal: AbortSignal.timeout(25_000),
      });

      if (res.status === 429) {
        logs.push(`Rate limit, pausando 5s...`);
        await new Promise(r => setTimeout(r, 5000));
        continue;
      }

      if (!res.ok) {
        logs.push(`Scrape HTTP ${res.status}: ${doc.url.substring(0, 60)}`);
        continue;
      }

      const data = await res.json();
      const md = String(data?.data?.markdown ?? data?.markdown ?? "");

      if (md.length < 50) {
        logs.push(`Scrape vazio (${md.length} chars): ${doc.titulo.substring(0, 50)}`);
        continue;
      }

      const extracted = extrairAcoes(md, doc.url, doc.ciclo);
      let added = 0;
      for (const a of extracted) {
        const gKey = a.codigo
          ? `${a.codigo}_${a.ppa_cycle}`
          : normalize(a.nome).substring(0, 50);
        if (!globalSeen.has(gKey)) {
          globalSeen.add(gKey);
          acoes.push(a);
          added++;
        }
      }
      logs.push(`✓ ${doc.titulo.substring(0, 40)} (${md.length} chars) → ${added} ações`);

      // Diagnostic: if large doc but 0 actions, log sample lines with radicals
      if (added === 0 && md.length > 500) {
        const sampleLines = md.split("\n")
          .filter(l => encontrarRadical(l) !== null)
          .slice(0, 5);
        if (sampleLines.length > 0) {
          logs.push(`  DIAG: ${sampleLines.length} linhas com radical mas 0 ações:`);
          for (const sl of sampleLines) {
            logs.push(`    → "${sl.trim().substring(0, 100)}"`);
          }
        }
      }
    } catch (e) {
      logs.push(`Scrape erro: ${e instanceof Error ? e.message : "?"} — ${doc.url.substring(0, 50)}`);
    }
    await new Promise(r => setTimeout(r, 400));
  }

  logs.push(`Total extraído: ${acoes.length} ações únicas de ${toProcess.length} documentos`);
  return { acoes, logs };
}

// ════════════════════════════════════════════════════════════
// HANDLER
// ════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let uf: string | undefined;
    let mode = "insert";

    try {
      const body = await req.json();
      if (typeof body.uf === "string") uf = body.uf;
      if (Array.isArray(body.ufs) && body.ufs.length > 0 && !uf) uf = body.ufs[0];
      if (body.mode === "preview") mode = "preview";
    } catch { /* defaults */ }

    if (!uf || !ESTADOS_IBGE[uf]) {
      return new Response(JSON.stringify({ success: false, error: `UF inválida: ${uf}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { nome: nomeEstado } = ESTADOS_IBGE[uf];
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY não configurada." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`=== Ingestão Estadual ${uf} (${nomeEstado}) | ${mode} ===`);

    // Passo 1: Buscar PDFs/documentos de PPA
    const { docs, logs: searchLogs } = await buscarPDFs(nomeEstado, firecrawlKey);

    // Passo 2: Scrape cada documento e extrair ações com palavras-chave
    // Limite baixo para evitar timeout (edge functions ~50s CPU)
    const maxDocs = mode === "preview" ? 3 : 5;
    const { acoes, logs: scrapeLogs } = await scrapeEExtrair(docs, firecrawlKey, maxDocs);

    const allLogs = [...searchLogs, "---", ...scrapeLogs];

    const porGrupo: Record<string, number> = {};
    for (const a of acoes) {
      porGrupo[a.grupo] = (porGrupo[a.grupo] ?? 0) + 1;
    }

    if (mode === "preview") {
      return new Response(JSON.stringify({
        success: true, mode: "preview", uf,
        total_registros: acoes.length,
        por_grupo_etnico: porGrupo,
        log_consultas: allLogs,
        amostra: acoes.slice(0, 50).map(a => ({
          programa: a.nome, codigo: a.codigo, grupo: a.grupo,
          criterio: a.criterio, ppa: a.ppa_cycle, url: a.url_fonte,
        })),
        erros: [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // INSERT
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const registros = acoes.map(a => ({
      programa: `${uf} — ${a.nome}`.substring(0, 250),
      orgao: `Gov. Estadual (${uf})`,
      esfera: "estadual",
      ano: new Date().getFullYear(),
      fonte_dados: `PPA ${nomeEstado} (${a.ppa_cycle})`,
      url_fonte: a.url_fonte,
      descritivo: a.codigo ? `Código: ${a.codigo} | ${a.nome}` : a.nome,
      observacoes: a.grupo,
      razao_selecao: a.criterio,
      dotacao_inicial: null, dotacao_autorizada: null,
      empenhado: null, liquidado: null, pago: null,
      percentual_execucao: null, eixo_tematico: null,
      grupo_focal: null, publico_alvo: null,
    }));

    let totalInserted = 0;
    const erros: string[] = [];
    for (let i = 0; i < registros.length; i += 50) {
      const chunk = registros.slice(i, i + 50);
      const { error: insErr } = await supabase.from("dados_orcamentarios").insert(chunk);
      if (insErr) erros.push(`Batch ${i}: ${insErr.message}`);
      else totalInserted += chunk.length;
    }

    return new Response(JSON.stringify({
      success: true, mode: "insert", uf,
      total_inseridos: totalInserted,
      por_grupo_etnico: porGrupo,
      log_consultas: allLogs.slice(0, 40),
      amostra: acoes.slice(0, 20).map(a => ({
        programa: a.nome, codigo: a.codigo, grupo: a.grupo,
        criterio: a.criterio, ppa: a.ppa_cycle,
      })),
      erros: erros.slice(0, 10),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

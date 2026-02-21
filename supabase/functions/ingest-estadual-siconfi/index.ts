import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ESTADOS: Record<string, string> = {
  AC: "Acre", AL: "Alagoas", AP: "Amapá", AM: "Amazonas",
  BA: "Bahia", CE: "Ceará", DF: "Distrito Federal", ES: "Espírito Santo",
  GO: "Goiás", MA: "Maranhão", MT: "Mato Grosso", MS: "Mato Grosso do Sul",
  MG: "Minas Gerais", PA: "Pará", PB: "Paraíba", PR: "Paraná",
  PE: "Pernambuco", PI: "Piauí", RJ: "Rio de Janeiro", RN: "Rio Grande do Norte",
  RS: "Rio Grande do Sul", RO: "Rondônia", RR: "Roraima", SC: "Santa Catarina",
  SP: "São Paulo", SE: "Sergipe", TO: "Tocantins",
};

// ═══════ RADICAIS ═══════

const RADICAIS_POR_GRUPO: { grupo: string; radicais: string[] }[] = [
  { grupo: "Negro/Afrodescendente", radicais: ["racial", "racis", "negr", "afro", "afrodescend", "palmares", "seppir", "sepromi", "candombl", "umbanda", "matriz african", "antirracis", "consciencia negra", "igualdade racial", "promocao da igualdade"] },
  { grupo: "Indígena", radicais: ["indigen", "funai", "sesai", "povos originari", "terra indigena", "saude indigena"] },
  { grupo: "Quilombola", radicais: ["quilombol", "quilombo", "remanescentes de quilombo"] },
  { grupo: "Comunidade Tradicional", radicais: ["comunidades tradicion", "povos tradicion", "povos e comunidades"] },
  { grupo: "Cigano/Roma", radicais: ["cigan", "romani", "povo cigano"] },
];

const TODOS_RADICAIS = RADICAIS_POR_GRUPO.flatMap(g => g.radicais);

function norm(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function classificar(texto: string): string {
  const n = norm(texto);
  for (const g of RADICAIS_POR_GRUPO) if (g.radicais.some(r => n.includes(r))) return g.grupo;
  return "Racial/Étnico";
}

function encontrarRadical(texto: string): string | null {
  const n = norm(texto);
  for (const r of TODOS_RADICAIS) if (n.includes(r)) return r;
  return null;
}

// ═══════ EXTRAÇÃO DE AÇÕES ═══════

interface Acao {
  nome: string;
  codigo: string | null;
  grupo: string;
  criterio: string;
  url: string;
  ppa: string;
}

const REJEITAR = ["indicador de", "meta fisic", "meta prevista", "unidade de medida", "produto esperado",
  "formula de calculo", "saiba mais", "confira", "clique aqui", "licitacao", "edital n",
  "portaria n", "decreto n", "diario oficial", "publicado em", "sumario", "pagina",
  "nosso planejamento", "a titular", "secretaria de", "secretario de",
  "o documento", "os indicadores", "o estado", "o governo",
  "isso e inedito", "estamos com", "expectativa", "que tem contribui"];

function extrairAcoes(texto: string, url: string, ppa: string): Acao[] {
  const acoes: Acao[] = [];
  const seen = new Set<string>();
  const lines = texto.split(/\n/);

  for (const rawLine of lines) {
    const line = rawLine.replace(/\|/g, " ").replace(/\s{2,}/g, " ").trim();
    if (line.length < 10 || line.length > 200) continue;
    const ln = norm(line);
    if (REJEITAR.some(t => ln.includes(t))) continue;
    if (/^[\d\s\.,R\$%\-]+$/.test(line)) continue;
    // Rejeitar snippets de notícias (contém "..." e mais de 15 palavras)
    if (line.includes("...") && line.split(/\s+/).length > 12) continue;
    // Rejeitar frases narrativas longas (mais de 20 palavras sem código)
    if (line.split(/\s+/).length > 20) continue;

    const radical = encontrarRadical(line);
    if (!radical) continue;

    // Extrair código se presente
    let codigo: string | null = null;
    let nome = line;

    const m1 = line.match(/(?:Programa|A[çc][ãa]o|Atividade|Projeto)\s+(\d{3,6})\s*[—–\-:\.\s]\s*(.+)/i);
    if (m1) {
      codigo = m1[1];
      nome = `${m1[0].match(/^\S+/)?.[0]} ${codigo} — ${m1[2].trim()}`;
    } else {
      const m2 = line.match(/^(\d{3,6})\s*[—–\-:\.\s]\s*(.{8,})/);
      if (m2) { codigo = m2[1]; nome = `${m2[1]} — ${m2[2].trim()}`; }
    }

    nome = nome.replace(/^\[PDF\]\s*/i, "").trim().substring(0, 250);
    const key = codigo ? `${codigo}` : norm(nome).substring(0, 50);
    if (seen.has(key)) continue;
    seen.add(key);

    acoes.push({ nome, codigo, grupo: classificar(line), criterio: `Radical "${radical}"`, url, ppa });
  }
  return acoes;
}

// ═══════ BUSCA + SCRAPE ═══════

async function buscar(nomeEstado: string, key: string, maxScrapes: number): Promise<{ acoes: Acao[]; logs: string[] }> {
  const logs: string[] = [];
  const acoes: Acao[] = [];
  const seenAcoes = new Set<string>();
  const seenUrls = new Set<string>();

  // Queries focadas em programas específicos com keywords raciais/étnicas
  const queries = [
    `${nomeEstado} PPA programa "igualdade racial" OR "quilombola" OR "indígena" site:*.gov.br`,
    `${nomeEstado} PPA ação orçamentária "quilombola" OR "indígena" OR "comunidades tradicionais" site:*.gov.br`,
    `${nomeEstado} programa orçamentário "antirracista" OR "igualdade racial" OR "promoção da igualdade" site:*.gov.br`,
    `${nomeEstado} PPA programa "povos tradicionais" OR "cigano" OR "afrodescendente" site:*.gov.br`,
  ];

  const docsToScrape: { url: string; titulo: string }[] = [];

  for (const query of queries) {
    try {
      console.log(`  Search: ${query.substring(0, 70)}...`);
      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 5, lang: "pt-BR", country: "BR" }),
        signal: AbortSignal.timeout(12_000),
      });

      if (res.status === 429) {
        logs.push("Rate limit, pausa 2s");
        await new Promise(r => setTimeout(r, 2000));
        continue;
      }
      if (!res.ok) { logs.push(`Search HTTP ${res.status}`); continue; }

      const data = await res.json();
      const results = data?.data ?? [];

      for (const r of results) {
        const url = String(r.url ?? "");
        const title = String(r.title ?? "");
        const snippet = String(r.markdown ?? r.description ?? "");
        const fullText = `${title}\n${snippet}`;

        // Classificar ciclo PPA pelo conteúdo
        const n = norm(fullText);
        let ppa = "PPA (indefinido)";
        if (n.includes("2024") || n.includes("2025") || n.includes("2026") || n.includes("2027")) ppa = "PPA 2024-2027";
        else if (n.includes("2020") || n.includes("2021") || n.includes("2022") || n.includes("2023")) ppa = "PPA 2020-2023";
        else if (n.includes("2016") || n.includes("2017") || n.includes("2018") || n.includes("2019")) ppa = "PPA 2016-2019";

        // Extrair ações dos snippets de busca
        const extracted = extrairAcoes(fullText, url, ppa);
        for (const a of extracted) {
          const k = norm(a.nome).substring(0, 50);
          if (!seenAcoes.has(k)) { seenAcoes.add(k); acoes.push(a); }
        }

        // Guardar para scrape se tem radical e não é PDF
        if (url && !seenUrls.has(url) && !url.toLowerCase().endsWith(".pdf")) {
          const hasRadical = encontrarRadical(fullText) !== null;
          if (hasRadical) {
            seenUrls.add(url);
            docsToScrape.push({ url, titulo: title });
          }
        }
      }
      logs.push(`Search: ${results.length} resultados, ${acoes.length} ações acum.`);
    } catch (e) {
      logs.push(`Search: ${e instanceof Error ? e.message : "Erro"}`);
    }
    await new Promise(r => setTimeout(r, 200));
  }

  logs.push(`Snippets: ${acoes.length} ações de ${queries.length} buscas`);

  // Scrape dos melhores docs HTML
  const toScrape = docsToScrape.slice(0, maxScrapes);
  for (const doc of toScrape) {
    try {
      console.log(`  Scrape: ${doc.url.substring(0, 70)}`);
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url: doc.url, formats: ["markdown"], onlyMainContent: true, waitFor: 1000 }),
        signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) { logs.push(`Scrape HTTP ${res.status}`); continue; }

      const data = await res.json();
      const md = String(data?.data?.markdown ?? data?.markdown ?? "");
      if (md.length < 100) continue;

      const n = norm(md);
      let ppa = "PPA (indefinido)";
      if (n.includes("2024") || n.includes("2027")) ppa = "PPA 2024-2027";
      else if (n.includes("2020") || n.includes("2023")) ppa = "PPA 2020-2023";
      else if (n.includes("2016") || n.includes("2019")) ppa = "PPA 2016-2019";

      const extracted = extrairAcoes(md, doc.url, ppa);
      let added = 0;
      for (const a of extracted) {
        const k = norm(a.nome).substring(0, 50);
        if (!seenAcoes.has(k)) { seenAcoes.add(k); acoes.push(a); added++; }
      }
      logs.push(`Scrape +${added} (${md.length} chars): ${doc.titulo.substring(0, 40)}`);
    } catch (e) {
      logs.push(`Scrape erro: ${e instanceof Error ? e.message : "?"}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  logs.push(`Total: ${acoes.length} ações únicas`);
  return { acoes, logs };
}

// ═══════ HANDLER ═══════

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

    if (!uf || !ESTADOS[uf]) {
      return new Response(JSON.stringify({ success: false, error: `UF inválida: ${uf}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const nomeEstado = ESTADOS[uf];
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY não configurada." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`=== Ingestão Estadual ${uf} (${nomeEstado}) | ${mode} ===`);

    const maxScrapes = mode === "preview" ? 2 : 3;
    const { acoes, logs } = await buscar(nomeEstado, firecrawlKey, maxScrapes);

    const porGrupo: Record<string, number> = {};
    for (const a of acoes) porGrupo[a.grupo] = (porGrupo[a.grupo] ?? 0) + 1;

    if (mode === "preview") {
      return new Response(JSON.stringify({
        success: true, mode: "preview", uf,
        total_registros: acoes.length,
        por_grupo_etnico: porGrupo,
        log_consultas: logs,
        amostra: acoes.slice(0, 50).map(a => ({
          programa: a.nome, codigo: a.codigo, grupo: a.grupo,
          criterio: a.criterio, ppa: a.ppa, url: a.url,
        })),
        erros: [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // INSERT
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const ppaStartYear = (ppa: string): number => {
      const m = ppa.match(/(\d{4})/);
      return m ? parseInt(m[1]) : new Date().getFullYear();
    };

    const registros = acoes.map(a => ({
      programa: `${uf} — ${a.nome}`.substring(0, 250),
      orgao: `Gov. Estadual (${uf})`,
      esfera: "estadual",
      ano: ppaStartYear(a.ppa),
      fonte_dados: `PPA ${nomeEstado} (${a.ppa})`,
      url_fonte: a.url,
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
      log_consultas: logs.slice(0, 40),
      amostra: acoes.slice(0, 20).map(a => ({
        programa: a.nome, codigo: a.codigo, grupo: a.grupo,
        criterio: a.criterio, ppa: a.ppa,
      })),
      erros: erros.slice(0, 10),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

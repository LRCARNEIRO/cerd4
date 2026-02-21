import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ESTADOS_IBGE: Record<string, { cod: number; nome: string; dominio: string }> = {
  AC: { cod: 12, nome: "Acre", dominio: "ac.gov.br" },
  AL: { cod: 27, nome: "Alagoas", dominio: "al.gov.br" },
  AP: { cod: 16, nome: "Amapá", dominio: "ap.gov.br" },
  AM: { cod: 13, nome: "Amazonas", dominio: "am.gov.br" },
  BA: { cod: 29, nome: "Bahia", dominio: "ba.gov.br" },
  CE: { cod: 23, nome: "Ceará", dominio: "ce.gov.br" },
  DF: { cod: 53, nome: "Distrito Federal", dominio: "df.gov.br" },
  ES: { cod: 32, nome: "Espírito Santo", dominio: "es.gov.br" },
  GO: { cod: 52, nome: "Goiás", dominio: "go.gov.br" },
  MA: { cod: 21, nome: "Maranhão", dominio: "ma.gov.br" },
  MT: { cod: 51, nome: "Mato Grosso", dominio: "mt.gov.br" },
  MS: { cod: 50, nome: "Mato Grosso do Sul", dominio: "ms.gov.br" },
  MG: { cod: 31, nome: "Minas Gerais", dominio: "mg.gov.br" },
  PA: { cod: 15, nome: "Pará", dominio: "pa.gov.br" },
  PB: { cod: 25, nome: "Paraíba", dominio: "pb.gov.br" },
  PR: { cod: 41, nome: "Paraná", dominio: "pr.gov.br" },
  PE: { cod: 26, nome: "Pernambuco", dominio: "pe.gov.br" },
  PI: { cod: 22, nome: "Piauí", dominio: "pi.gov.br" },
  RJ: { cod: 33, nome: "Rio de Janeiro", dominio: "rj.gov.br" },
  RN: { cod: 24, nome: "Rio Grande do Norte", dominio: "rn.gov.br" },
  RS: { cod: 43, nome: "Rio Grande do Sul", dominio: "rs.gov.br" },
  RO: { cod: 11, nome: "Rondônia", dominio: "ro.gov.br" },
  RR: { cod: 14, nome: "Roraima", dominio: "rr.gov.br" },
  SC: { cod: 42, nome: "Santa Catarina", dominio: "sc.gov.br" },
  SP: { cod: 35, nome: "São Paulo", dominio: "sp.gov.br" },
  SE: { cod: 28, nome: "Sergipe", dominio: "se.gov.br" },
  TO: { cod: 17, nome: "Tocantins", dominio: "to.gov.br" },
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
// BUSCA VIA FIRECRAWL SEARCH
// ════════════════════════════════════════════════════════════

const URL_REJEICAO = [
  "/noticias/", "/noticia/", "/news/", "/blog/", "/imprensa/",
  "/doe/", "/diariooficial/", "/licitacao/", "/edital/",
  "/concurso/", "/processo-seletivo/", "/comunicado/",
];

function isUrlValida(url: string): boolean {
  const lower = url.toLowerCase();
  for (const pat of URL_REJEICAO) if (lower.includes(pat)) return false;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.endsWith(".gov.br") || host.endsWith(".leg.br") || host.endsWith(".jus.br");
  } catch { return false; }
}

interface AcaoOrcamentaria {
  nome: string;
  codigo: string | null;
  secretaria: string | null;
  url_fonte: string;
  grupo: string;
  criterio: string;
  ppa_cycle: string;
}

async function buscarAcoes(
  nomeEstado: string, dominio: string, firecrawlKey: string,
): Promise<{ acoes: AcaoOrcamentaria[]; logs: string[] }> {
  const logs: string[] = [];
  const seenKeys = new Set<string>();
  const acoes: AcaoOrcamentaria[] = [];

  const ciclos = [
    { label: "PPA 2024-2027", queries: [
      `PPA 2024 2027 ${nomeEstado} programa ação "igualdade racial" OR "quilombola" OR "indígena" OR "comunidades tradicionais" site:*.gov.br`,
    ]},
    { label: "PPA 2020-2023", queries: [
      `PPA 2020 2023 ${nomeEstado} programa ação "igualdade racial" OR "quilombola" OR "indígena" OR "comunidades tradicionais" site:*.gov.br`,
    ]},
    { label: "PPA 2016-2019", queries: [
      `PPA 2016 2019 ${nomeEstado} programa ação "igualdade racial" OR "quilombola" OR "indígena" site:*.gov.br`,
    ]},
  ];

  const docsToScrape: { url: string; cycle: string }[] = [];

  for (const ciclo of ciclos) {
    for (const query of ciclo.queries) {
      try {
        console.log(`  Search: ${query.substring(0, 100)}...`);
        const res = await fetch("https://api.firecrawl.dev/v1/search", {
          method: "POST",
          headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({ query, limit: 5, lang: "pt-BR", country: "BR" }),
          signal: AbortSignal.timeout(20_000),
        });

        if (res.status === 429) {
          logs.push(`Rate limit ${ciclo.label}, pausando...`);
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        if (!res.ok) { logs.push(`Search ${ciclo.label} HTTP ${res.status}`); continue; }

        const data = await res.json();
        const results = data?.data ?? [];

        for (const r of results) {
          const url = String(r.url ?? "");
          if (!url || !isUrlValida(url)) continue;

          const md = String(r.markdown ?? r.description ?? "");
          const title = String(r.title ?? "");
          const content = [title, md].join("\n");

          if (content.length > 50) {
            const extracted = extrairAcoesDoConteudo(content, url, ciclo.label);
            for (const a of extracted) {
              const key = normalize(a.nome).substring(0, 60);
              if (!seenKeys.has(key)) {
                seenKeys.add(key);
                acoes.push(a);
              }
            }
          }

          if (!docsToScrape.some(d => d.url === url)) {
            docsToScrape.push({ url, cycle: ciclo.label });
          }
        }
        logs.push(`Search ${ciclo.label}: ${results.length} resultados, ${acoes.length} ações acumuladas`);
      } catch (e) {
        logs.push(`Search ${ciclo.label}: ${e instanceof Error ? e.message : "Erro"}`);
      }
      await new Promise(r => setTimeout(r, 400));
    }
  }

  // Scrape top 3 docs for deeper extraction
  const toScrape = docsToScrape.slice(0, 3);
  for (const doc of toScrape) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ url: doc.url, formats: ["markdown"], onlyMainContent: false, waitFor: 2000 }),
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) { logs.push(`Scrape HTTP ${res.status}: ${doc.url.substring(0, 60)}`); continue; }
      const data = await res.json();
      const md = String(data?.data?.markdown ?? data?.markdown ?? "");
      if (md.length < 100) { logs.push(`Scrape vazio: ${doc.url.substring(0, 60)}`); continue; }

      const extracted = extrairAcoesDoConteudo(md, doc.url, doc.cycle);
      let added = 0;
      for (const a of extracted) {
        const key = normalize(a.nome).substring(0, 60);
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          acoes.push(a);
          added++;
        }
      }
      logs.push(`Scrape OK (${md.length} chars) → +${added} ações: ${doc.url.substring(0, 60)}`);
    } catch (e) {
      logs.push(`Scrape erro: ${e instanceof Error ? e.message : "?"}`);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  logs.push(`Total: ${acoes.length} ações orçamentárias únicas extraídas`);
  return { acoes, logs };
}

// ════════════════════════════════════════════════════════════
// EXTRAÇÃO DE AÇÕES DO CONTEÚDO SCRAPED
// ════════════════════════════════════════════════════════════

const REJEITAR_LINHA = [
  "indicador de", "eixo tematic", "eixo estrateg", "eixo:", "# eixo",
  "diretriz", "compromisso:", "# compromisso",
  "macro-desafio", "macrodesafio", "prioridade da ldo",
  "saiba mais", "confira", "clique aqui",
  "licitacao", "edital n", "portaria n",
  "meta fisic", "meta prevista", "unidade de medida",
  "produto esperado", "indice de referencia",
  "apuracao do indice", "periodicidade", "base geografica",
  "fonte do indicador", "orgao responsavel pelo indicador",
  "formula de calculo", "objetivo estrategico",
  "# destaque", "secretari", "subsecretari",
];

function limparNome(nome: string): string {
  return nome
    .replace(/^\[PDF\]\s*/i, "")
    .replace(/\s*-\s*(?:BA|SP|RJ|MG|RS|PR|SC|PE|CE|GO|PA|MA|MT|MS|AM|RN|PB|PI|SE|AL|RO|AC|AP|RR|TO|DF|ES)\s*(?:\.?\s*Gov\b)?\.?\s*$/i, "")
    .replace(/,\s*conforme\s+o\s+PPA.*$/i, "")
    .replace(/,\s*possui\s+\d+\s+\w+.*$/i, "")
    .replace(/\.\s*\.\s*\d+\s*$/i, "")
    .replace(/\.\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .substring(0, 200);
}

function extrairAcoesDoConteudo(content: string, url: string, ppaCycle: string): AcaoOrcamentaria[] {
  const acoes: AcaoOrcamentaria[] = [];
  const seen = new Set<string>();
  const lines = content.split(/\n/);

  function cleanTableLine(raw: string): string {
    return raw.replace(/^\|+/, "").replace(/\|+$/, "").replace(/\|/g, " ").replace(/\s{2,}/g, " ").trim();
  }

  function extractAcaoFromTableRow(raw: string): { codigo: string; nome: string } | null {
    const cleaned = cleanTableLine(raw);
    const m1 = cleaned.match(/A[çc][ãäa]o\s+Or[çc]ament[áa]ria\s+(\d{3,6})\s+(.+)/i);
    if (m1) return { codigo: m1[1], nome: m1[2].trim() };
    const m2 = cleaned.match(/^(\d{3,6})\s*[-–—]\s*(.{10,})/);
    if (m2) return { codigo: m2[1], nome: m2[2].trim() };
    return null;
  }

  function extrairSecretaria(texto: string): string | null {
    const m = texto.match(/(Secretaria\s+(?:de\s+|da\s+|do\s+)?\S+(?:\s+\S+){0,5})/i);
    return m ? m[1].trim().substring(0, 120) : null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 8 || line.length > 500) continue;
    const lineNorm = normalize(line);
    if (REJEITAR_LINHA.some(t => lineNorm.includes(t))) continue;
    if (/^[\d\s\.,R\$%\-|]+$/.test(line)) continue;

    const ctxStart = Math.max(0, i - 5);
    const ctxEnd = Math.min(lines.length, i + 6);
    const contexto = lines.slice(ctxStart, ctxEnd).join(" ");

    // Padrão T: Tabela
    if (line.includes("|")) {
      const acaoTable = extractAcaoFromTableRow(line);
      if (acaoTable) {
        const radical = encontrarRadical(acaoTable.nome) ?? encontrarRadical(contexto);
        if (radical) {
          const key = `tab_${acaoTable.codigo}`;
          if (!seen.has(key)) {
            seen.add(key);
            acoes.push({
              nome: limparNome(`Ação ${acaoTable.codigo} — ${acaoTable.nome}`),
              codigo: acaoTable.codigo,
              secretaria: extrairSecretaria(contexto),
              url_fonte: url, grupo: classificarGrupo(acaoTable.nome + " " + contexto),
              criterio: `Ação ${acaoTable.codigo} (tabela PPA): radical "${radical}"`,
              ppa_cycle: ppaCycle,
            });
          }
        }
      }
      continue;
    }

    // Padrão 1: "Programa XXXX — Nome"
    const progMatch = line.match(/Programa\s+(\d{3,5})\s*[—–\-:\.\s]\s*(.+)/i);
    if (progMatch) {
      const codigo = progMatch[1];
      const nome = progMatch[2].trim();
      const radical = encontrarRadical(nome) ?? encontrarRadical(contexto);
      if (radical) {
        const key = `prog_${codigo}`;
        if (!seen.has(key)) {
          seen.add(key);
          acoes.push({
            nome: limparNome(`Programa ${codigo} — ${nome}`), codigo,
            secretaria: extrairSecretaria(contexto),
            url_fonte: url, grupo: classificarGrupo(nome + " " + contexto),
            criterio: `Programa PPA ${codigo}: radical "${radical}"`,
            ppa_cycle: ppaCycle,
          });
        }
      }
      continue;
    }

    // Padrão 2: "Ação/Atividade/Projeto XXXX — Nome"
    const acaoMatch = line.match(/(?:A[çc][ãa]o|Atividade|Projeto|Opera[çc][ãa]o\s+Especial)\s+(\d{4,6})\s*[—–\-:\.\s]\s*(.+)/i);
    if (acaoMatch) {
      const codigo = acaoMatch[1];
      const nome = acaoMatch[2].trim();
      const radical = encontrarRadical(nome) ?? encontrarRadical(contexto);
      if (radical) {
        const key = `acao_${codigo}`;
        if (!seen.has(key)) {
          seen.add(key);
          acoes.push({
            nome: limparNome(`Ação ${codigo} — ${nome}`), codigo,
            secretaria: extrairSecretaria(contexto),
            url_fonte: url, grupo: classificarGrupo(nome + " " + contexto),
            criterio: `Ação PPA ${codigo}: radical "${radical}"`,
            ppa_cycle: ppaCycle,
          });
        }
      }
      continue;
    }

    // Padrão 3: Código no início + radical
    const codeMatch = line.match(/^(\d{3,6})\s*[—–\-:\.]\s*(.{8,200})/);
    if (codeMatch) {
      const codigo = codeMatch[1];
      const nome = codeMatch[2].trim();
      const radical = encontrarRadical(nome) ?? encontrarRadical(contexto);
      if (radical) {
        const key = `gen_${codigo}`;
        if (!seen.has(key)) {
          seen.add(key);
          acoes.push({
            nome: limparNome(`${codigo} — ${nome}`), codigo,
            secretaria: extrairSecretaria(contexto),
            url_fonte: url, grupo: classificarGrupo(nome + " " + contexto),
            criterio: `Código ${codigo}: radical "${radical}"`,
            ppa_cycle: ppaCycle,
          });
        }
      }
      continue;
    }

    // Padrão 4: Texto com radical + código no contexto
    const radical = encontrarRadical(lineNorm);
    if (radical) {
      const codeInCtx = contexto.match(/(?:programa|a[çc][ãa]o|projeto|atividade)\s*(?:or[çc]ament[áa]ria)?\s*[:\.]?\s*(\d{3,6})\b/i);
      if (!codeInCtx) continue;
      const codigo = codeInCtx[1];
      const wordCount = line.split(/\s+/).length;
      if (wordCount > 15 || wordCount < 3) continue;
      const key = `flex_${codigo}_${normalize(line).substring(0, 30)}`;
      if (!seen.has(key)) {
        seen.add(key);
        acoes.push({
          nome: limparNome(line), codigo,
          secretaria: extrairSecretaria(contexto),
          url_fonte: url, grupo: classificarGrupo(line + " " + contexto),
          criterio: `Radical "${radical}" + código ${codigo}`,
          ppa_cycle: ppaCycle,
        });
      }
    }

    // Padrão 5: Linha com radical em contexto orçamentário (sem código)
    if (!radical) continue;
    const hasOrcContext = ["programa", "acao", "atividade", "projeto", "orcament", "despesa", "dotacao"]
      .some(w => normalize(contexto).includes(w));
    if (hasOrcContext) {
      const wordCount = line.split(/\s+/).length;
      if (wordCount >= 3 && wordCount <= 20) {
        const key = `nocode_${normalize(line).substring(0, 40)}`;
        if (!seen.has(key)) {
          seen.add(key);
          acoes.push({
            nome: limparNome(line), codigo: null,
            secretaria: extrairSecretaria(contexto),
            url_fonte: url, grupo: classificarGrupo(line + " " + contexto),
            criterio: `Radical "${radical}" em contexto orçamentário do PPA`,
            ppa_cycle: ppaCycle,
          });
        }
      }
    }
  }

  // Diagnóstico
  if (acoes.length === 0 && lines.length > 50) {
    const racialLines = lines.filter(l => encontrarRadical(l) !== null).slice(0, 10);
    if (racialLines.length > 0) {
      console.log(`DIAG: ${racialLines.length} linhas com radicais mas 0 ações. Amostras:`);
      for (const rl of racialLines) console.log(`  → "${rl.trim().substring(0, 120)}"`);
    }
  }

  return acoes;
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

    const { nome: nomeEstado, dominio } = ESTADOS_IBGE[uf];
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY não configurada." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`=== Ingestão Estadual ${uf} (${nomeEstado}) | ${mode} ===`);

    const { acoes, logs } = await buscarAcoes(nomeEstado, dominio, firecrawlKey);

    // Deduplicar
    const deduped = new Map<string, AcaoOrcamentaria>();
    for (const a of acoes) {
      const key = normalize(a.nome).substring(0, 60);
      if (!deduped.has(key)) deduped.set(key, a);
    }
    const batch = Array.from(deduped.values());

    const porGrupo: Record<string, number> = {};
    for (const a of batch) {
      porGrupo[a.grupo] = (porGrupo[a.grupo] ?? 0) + 1;
    }

    if (mode === "preview") {
      return new Response(JSON.stringify({
        success: true, mode: "preview", uf,
        total_registros: batch.length,
        por_grupo_etnico: porGrupo,
        log_consultas: logs,
        amostra: batch.slice(0, 50).map(a => ({
          programa: a.nome, codigo: a.codigo, grupo: a.grupo,
          criterio: a.criterio, ppa: a.ppa_cycle, url: a.url_fonte,
        })),
        erros: [],
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // INSERT
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const registros = batch.map(a => ({
      programa: `${uf} — ${a.nome}`.substring(0, 250),
      orgao: a.secretaria ?? `Gov. Estadual (${uf})`,
      esfera: "estadual",
      ano: new Date().getFullYear(),
      fonte_dados: `PPA ${nomeEstado} (${a.ppa_cycle})`,
      url_fonte: a.url_fonte,
      descritivo: a.codigo ? `Código: ${a.codigo} | ${a.nome}` : a.nome,
      observacoes: a.grupo,
      razao_selecao: a.criterio,
      dotacao_inicial: null,
      dotacao_autorizada: null,
      empenhado: null,
      liquidado: null,
      pago: null,
      percentual_execucao: null,
      eixo_tematico: null,
      grupo_focal: null,
      publico_alvo: null,
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
      log_consultas: logs.slice(0, 30),
      erros: erros.slice(0, 10),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

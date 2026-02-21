import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ESTADOS_IBGE: Record<string, { cod: number; nome: string }> = {
  AC: { cod: 12, nome: "Acre" }, AL: { cod: 27, nome: "Alagoas" }, AP: { cod: 16, nome: "Amapá" },
  AM: { cod: 13, nome: "Amazonas" }, BA: { cod: 29, nome: "Bahia" }, CE: { cod: 23, nome: "Ceará" },
  DF: { cod: 53, nome: "Distrito Federal" }, ES: { cod: 32, nome: "Espírito Santo" },
  GO: { cod: 52, nome: "Goiás" }, MA: { cod: 21, nome: "Maranhão" }, MT: { cod: 51, nome: "Mato Grosso" },
  MS: { cod: 50, nome: "Mato Grosso do Sul" }, MG: { cod: 31, nome: "Minas Gerais" },
  PA: { cod: 15, nome: "Pará" }, PB: { cod: 25, nome: "Paraíba" }, PR: { cod: 41, nome: "Paraná" },
  PE: { cod: 26, nome: "Pernambuco" }, PI: { cod: 22, nome: "Piauí" }, RJ: { cod: 33, nome: "Rio de Janeiro" },
  RN: { cod: 24, nome: "Rio Grande do Norte" }, RS: { cod: 43, nome: "Rio Grande do Sul" },
  RO: { cod: 11, nome: "Rondônia" }, RR: { cod: 14, nome: "Roraima" }, SC: { cod: 42, nome: "Santa Catarina" },
  SP: { cod: 35, nome: "São Paulo" }, SE: { cod: 28, nome: "Sergipe" }, TO: { cod: 17, nome: "Tocantins" },
};

const PPA_CYCLES = [
  { label: "PPA 2016-2019", start: 2016, end: 2019 },
  { label: "PPA 2020-2023", start: 2020, end: 2023 },
  { label: "PPA 2024-2027", start: 2024, end: 2027 },
];

// ════════════════════════════════════════════════════════════
// DICIONÁRIO DE BUSCA
// ════════════════════════════════════════════════════════════
const RADICAIS = ["indigen", "quilombol", "cigan", "etnic", "palmares", "funai", "sesai"];
const PALAVRAS = [
  "igualdade racial", "promocao da igualdade", "racismo", "racial",
  "negro", "negra", "afro", "afrodescendente",
  "candomble", "umbanda", "matriz africana", "terreiro",
  "povos tradicionais", "comunidades tradicionais", "povo cigano", "romani",
  "consciencia negra", "seppir", "terra indigena", "povos originarios",
  "discriminacao racial", "enfrentamento ao racismo",
];

const TERMOS_EXCLUSAO = [
  "direitos da cidadania", "direitos individuais coletivos",
  "assistencia comunitaria", "gestao administrativa", "administracao geral",
];

function normalize(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matchKeywords(texto: string): { criterio: string; grupo: string } | null {
  const norm = normalize(texto);
  let criterio = "";
  let grupo = "Racial/Étnico";

  for (const r of RADICAIS) {
    const idx = norm.indexOf(r);
    if (idx === -1) continue;
    const wordStart = texto.lastIndexOf(" ", idx) + 1;
    let wordEnd = texto.indexOf(" ", idx);
    if (wordEnd === -1) wordEnd = texto.length;
    const palavra = texto.substring(wordStart, wordEnd).replace(/[.,;:()|\[\]]/g, "").trim();
    if (palavra && palavra.length > 2) criterio = criterio ? `${criterio}; ${palavra}` : palavra;
    if (r === "indigen" || r === "funai" || r === "sesai") grupo = "Indígena";
    else if (r === "quilombol") grupo = "Quilombola";
    else if (r === "cigan") grupo = "Cigano/Roma";
    else if (r === "palmares") grupo = "Negro/Afrodescendente";
  }

  for (const p of PALAVRAS) {
    const idx = norm.indexOf(p);
    if (idx === -1) continue;
    const trecho = texto.substring(idx, idx + p.length);
    if (trecho) criterio = criterio ? `${criterio}; ${trecho}` : trecho;
    if (p.includes("negro") || p.includes("negra") || p.includes("afro") || p.includes("racial")) grupo = "Negro/Afrodescendente";
    else if (p.includes("indigena") || p.includes("originario")) grupo = "Indígena";
    else if (p.includes("quilombol")) grupo = "Quilombola";
    else if (p.includes("cigano") || p.includes("romani")) grupo = "Cigano/Roma";
    else if (p.includes("tradiciona")) grupo = "Comunidade Tradicional";
  }

  if (!criterio) return null;
  if (criterio.split(";").length <= 1) {
    for (const excl of TERMOS_EXCLUSAO) { if (norm.includes(excl)) return null; }
  }
  return { criterio, grupo };
}

// ════════════════════════════════════════════════════════════
// ETAPA 1 — Localizar documentos PPA reais (.gov.br apenas)
// ════════════════════════════════════════════════════════════

interface AcaoPPA {
  nome: string;
  codigo: string | null;
  dotacao_inicial: number | null;
  url_fonte: string;
  grupo: string;
  criterio: string;
  ppa_cycle: string;
}

/** Verifica se URL é de domínio governamental */
function isGovDomain(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.endsWith(".gov.br") || host.endsWith(".leg.br") || host.endsWith(".jus.br");
  } catch { return false; }
}

/** Queries ultra-focadas para encontrar o DOCUMENTO PPA em si */
function buildPPAQueries(nomeEstado: string): { query: string; cycle: string }[] {
  return [
    // Ciclo 2024-2027
    { query: `"plano plurianual" "2024" "2027" "${nomeEstado}" programas ações site:*.gov.br`, cycle: "PPA 2024-2027" },
    { query: `"PPA 2024-2027" "${nomeEstado}" anexo programas dotação site:*.gov.br`, cycle: "PPA 2024-2027" },
    // Ciclo 2020-2023
    { query: `"plano plurianual" "2020" "2023" "${nomeEstado}" programas ações site:*.gov.br`, cycle: "PPA 2020-2023" },
    { query: `"PPA 2020-2023" "${nomeEstado}" anexo programas dotação site:*.gov.br`, cycle: "PPA 2020-2023" },
    // Ciclo 2016-2019
    { query: `"plano plurianual" "2016" "2019" "${nomeEstado}" programas site:*.gov.br`, cycle: "PPA 2016-2019" },
  ];
}

/** Extrai ações/programas de conteúdo markdown do PPA buscando keywords */
function extractAcoesFromContent(
  content: string, url: string, ppaCycle: string,
): AcaoPPA[] {
  const acoes: AcaoPPA[] = [];
  const seen = new Set<string>();
  const lines = content.split(/\n/);

  // Processar linha a linha buscando keywords raciais/étnicas
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 8 || line.length > 600) continue;

    const match = matchKeywords(line);
    if (!match) continue;

    // Capturar contexto: 2 linhas antes e 2 depois para pegar código e dotação
    const contextLines: string[] = [];
    for (let j = Math.max(0, i - 2); j <= Math.min(lines.length - 1, i + 3); j++) {
      contextLines.push(lines[j]);
    }
    const context = contextLines.join(" ");

    // Extrair nome da ação/programa (limpar formatação markdown/tabela)
    let nome = line
      .replace(/^\|?\s*/, "").replace(/\|.*$/, "")
      .replace(/^\*+\s*/, "").replace(/^#+\s*/, "")
      .replace(/^\d+[\.\)]\s*/, "")
      .trim();

    if (nome.length < 5) nome = line.substring(0, 200);
    nome = nome.substring(0, 250);

    // Extrair código de ação/programa
    const codeMatch = context.match(/(?:(?:A[çc][ãa]o|Programa|Projeto|Atividade|C[óo]digo)\s*(?:n[ºo°.]?\s*)?)?(\d{4,6})/i);
    const codigo = codeMatch ? codeMatch[1] : null;

    // Extrair dotação inicial
    let dotacao: number | null = null;
    const valPatterns = [
      /R\$\s*([\d.,]+)/,
      /(?:dota[çc][ãa]o|valor|total|previsto)[:\s]*([\d.,]+)/i,
      /(\d{1,3}(?:\.\d{3})+(?:,\d{2})?)/,
    ];
    for (const pat of valPatterns) {
      const m = context.match(pat);
      if (m) {
        const val = parseFloat(m[1].replace(/\./g, "").replace(",", "."));
        if (val > 1000) { dotacao = val; break; } // mínimo R$1.000 para evitar ruído
      }
    }

    const key = normalize(nome).substring(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);

    acoes.push({ nome, codigo, dotacao_inicial: dotacao, url_fonte: url, grupo: match.grupo, criterio: match.criterio, ppa_cycle: ppaCycle });
  }

  return acoes;
}

async function buscarEProcessarPPAs(
  uf: string, nomeEstado: string, firecrawlKey: string,
): Promise<{ acoes: AcaoPPA[]; logs: string[]; erros: string[] }> {
  const acoes: AcaoPPA[] = [];
  const logs: string[] = [];
  const erros: string[] = [];
  const seenNomes = new Set<string>();
  const processedUrls = new Set<string>();

  const queries = buildPPAQueries(nomeEstado);

  // ── ETAPA 1: Encontrar URLs de documentos PPA em domínios .gov.br ──
  const ppaDocuments: { url: string; title: string; cycle: string }[] = [];

  for (const { query, cycle } of queries) {
    try {
      console.log(`  Search PPA: ${query.substring(0, 80)}...`);
      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 5, lang: "pt-BR", country: "BR" }),
        signal: AbortSignal.timeout(25_000),
      });

      if (!res.ok) { erros.push(`Search HTTP ${res.status}`); continue; }
      const data = await res.json();
      const results = data?.data ?? [];

      let govCount = 0;
      let rejectedCount = 0;

      for (const r of results) {
        const url = String(r.url ?? "");
        const title = String(r.title ?? "");
        if (!url || processedUrls.has(url)) continue;

        // ── FILTRO RÍGIDO: apenas .gov.br ──
        if (!isGovDomain(url)) {
          rejectedCount++;
          continue;
        }

        // Rejeitar URLs que claramente NÃO são documentos PPA
        const urlLower = url.toLowerCase();
        const titleLower = normalize(title);
        const isNews = titleLower.includes("noticia") || titleLower.includes("imprensa") || urlLower.includes("/noticias/") || urlLower.includes("/news/") || urlLower.includes("/blog/");
        const isEdital = titleLower.includes("edital") || titleLower.includes("licitac") || titleLower.includes("pregao") || titleLower.includes("dispensa");
        const isDiario = titleLower.includes("diario oficial") || urlLower.includes("/doe/") || urlLower.includes("/diariooficial/");

        if (isNews || isEdital || isDiario) {
          rejectedCount++;
          logs.push(`  REJEITADO (${isNews ? "notícia" : isEdital ? "edital" : "diário"}): ${title.substring(0, 50)}`);
          continue;
        }

        processedUrls.add(url);
        govCount++;
        ppaDocuments.push({ url, title, cycle });
      }

      logs.push(`Busca "${cycle}" → ${results.length} resultados, ${govCount} .gov.br aceitos, ${rejectedCount} rejeitados`);
    } catch (e) {
      erros.push(`Search: ${e instanceof Error ? e.message : "Erro"}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  logs.push(`Total documentos PPA encontrados: ${ppaDocuments.length}`);

  // ── ETAPA 2: Scrape dos documentos PPA (Firecrawl suporta PDF) ──
  // Limitar a 4 scrapes para não estourar timeout
  const maxScrapes = Math.min(ppaDocuments.length, 4);

  for (let s = 0; s < maxScrapes; s++) {
    const doc = ppaDocuments[s];
    try {
      console.log(`  Scraping PPA (${s + 1}/${maxScrapes}): ${doc.url.substring(0, 80)}`);
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          url: doc.url,
          formats: ["markdown"],
          onlyMainContent: false,
          waitFor: 3000,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        logs.push(`  Scrape HTTP ${res.status}: ${doc.title.substring(0, 50)}`);
        continue;
      }

      const data = await res.json();
      const md = String(data?.data?.markdown ?? data?.markdown ?? "");

      if (md.length < 100) {
        logs.push(`  Scrape vazio: ${doc.title.substring(0, 50)} (${md.length} chars)`);
        continue;
      }

      logs.push(`  Scrape OK: ${doc.title.substring(0, 50)} (${md.length} chars)`);

      // Determinar ciclo PPA real pelo conteúdo
      let detectedCycle = doc.cycle;
      for (const cycle of PPA_CYCLES) {
        if (md.includes(`${cycle.start}-${cycle.end}`) || md.includes(`${cycle.start}/${cycle.end}`) || md.includes(`PPA ${cycle.start}`)) {
          detectedCycle = cycle.label;
          break;
        }
      }

      // ── ETAPA 3: Buscar keywords no conteúdo do PPA ──
      const extracted = extractAcoesFromContent(md, doc.url, detectedCycle);

      for (const acao of extracted) {
        const key = normalize(acao.nome).substring(0, 80);
        if (!seenNomes.has(key)) {
          seenNomes.add(key);
          acoes.push(acao);
        }
      }

      logs.push(`  Extraídas ${extracted.length} ações com keywords raciais/étnicas (${detectedCycle})`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro";
      if (msg.includes("abort") || msg.includes("timeout")) {
        logs.push(`  Scrape timeout: ${doc.title.substring(0, 50)}`);
      } else {
        erros.push(`Scrape: ${msg}`);
      }
    }
    await new Promise(r => setTimeout(r, 300));
  }

  logs.push(`Total: ${acoes.length} ações/programas PPA com keywords raciais identificados`);
  return { acoes, logs, erros };
}

// ════════════════════════════════════════════════════════════
// ETAPA 4 — Cruzamento SICONFI para execução
// ════════════════════════════════════════════════════════════

async function buscarExecucaoSICONFI(
  ufCode: number, ano: number,
): Promise<{ empenhado: number | null; liquidado: number | null; pago: number | null; dotacao: number | null; logs: string[] }> {
  const logs: string[] = [];

  for (let bim = 6; bim >= 1; bim--) {
    try {
      const params = new URLSearchParams({
        an_exercicio: String(ano), id_ente: String(ufCode),
        nr_periodo: String(bim), no_anexo: "RREO-Anexo 02",
        co_tipo_demonstrativo: "RREO", "$limit": "5000",
      });
      const res = await fetch(`https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo?${params}`, {
        headers: { Accept: "application/json" }, signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const items: Record<string, unknown>[] = data?.items ?? [];
      if (items.length === 0) continue;

      const f14Items = items.filter(i => normalize(String(i.conta ?? "")).includes("direitos da cidadania"));
      if (f14Items.length === 0) { logs.push(`RREO bim${bim}: ${items.length} itens, 0 F14`); continue; }

      let empenhado: number | null = null, liquidado: number | null = null, pago: number | null = null, dotacao: number | null = null;
      for (const item of f14Items) {
        const coluna = normalize(String(item.coluna ?? ""));
        const valor = typeof item.valor === "number" ? item.valor : null;
        if (valor === null) continue;
        if (coluna.includes("dotacao inicial")) dotacao = (dotacao ?? 0) + valor;
        else if (coluna.includes("empenhadas ate o bimestre")) empenhado = (empenhado ?? 0) + valor;
        else if (coluna.includes("liquidadas ate o bimestre")) liquidado = (liquidado ?? 0) + valor;
        else if (coluna.includes("pagas ate o bimestre")) pago = (pago ?? 0) + valor;
      }
      logs.push(`RREO bim${bim}: F14 dot=${dotacao?.toLocaleString() ?? "—"} emp=${empenhado?.toLocaleString() ?? "—"}`);
      return { empenhado, liquidado, pago, dotacao, logs };
    } catch (e) {
      logs.push(`RREO bim${bim}: ${e instanceof Error ? e.message : "Erro"}`);
    }
  }

  try {
    const params = new URLSearchParams({
      an_exercicio: String(ano), id_ente: String(ufCode),
      no_anexo: "DCA-Anexo I-E", "$limit": "5000",
    });
    const res = await fetch(`https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca?${params}`, {
      headers: { Accept: "application/json" }, signal: AbortSignal.timeout(25_000),
    });
    if (res.ok) {
      const data = await res.json();
      const items: Record<string, unknown>[] = data?.items ?? [];
      const f14 = items.filter(i => String(i.conta ?? "").startsWith("14 "));
      let empenhado: number | null = null, liquidado: number | null = null, dotacao: number | null = null;
      for (const item of f14) {
        const coluna = normalize(String(item.coluna ?? ""));
        const valor = typeof item.valor === "number" ? item.valor : null;
        if (valor === null) continue;
        if (coluna.includes("empenhad")) empenhado = (empenhado ?? 0) + valor;
        else if (coluna.includes("liquidad")) liquidado = (liquidado ?? 0) + valor;
        else if (coluna.includes("dotacao")) dotacao = (dotacao ?? 0) + valor;
      }
      logs.push(`DCA I-E: F14 dot=${dotacao?.toLocaleString() ?? "—"}`);
      return { empenhado, liquidado, pago: null, dotacao, logs };
    }
  } catch (e) {
    logs.push(`DCA I-E: ${e instanceof Error ? e.message : "Erro"}`);
  }

  return { empenhado: null, liquidado: null, pago: null, dotacao: null, logs };
}

// ════════════════════════════════════════════════════════════
// HANDLER — 1 UF por chamada
// ════════════════════════════════════════════════════════════

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    let anos: number[] = [2023, 2024];
    let uf: string | undefined;
    let mode = "insert";

    try {
      const body = await req.json();
      if (Array.isArray(body.anos) && body.anos.length > 0) anos = body.anos;
      if (typeof body.uf === "string") uf = body.uf;
      if (Array.isArray(body.ufs) && body.ufs.length > 0 && !uf) uf = body.ufs[0];
      if (body.mode === "preview") mode = "preview";
    } catch { /* defaults */ }

    if (!uf || !ESTADOS_IBGE[uf]) {
      return new Response(JSON.stringify({ success: false, error: `UF inválida: ${uf}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { cod: ufCode, nome: nomeEstado } = ESTADOS_IBGE[uf];
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY não configurada." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`=== Ingestão PPA ${uf} (${nomeEstado}) | Anos: ${anos.join(",")} | ${mode} ===`);

    const allLogs: string[] = [];
    const allErros: string[] = [];
    const registros: Record<string, unknown>[] = [];

    // ── ETAPAS 1-3: Localizar PPAs → Scrape → Extrair ações com keywords ──
    const { acoes, logs: ppaLogs, erros: ppaErros } = await buscarEProcessarPPAs(uf, nomeEstado, firecrawlKey);
    allLogs.push(...ppaLogs);
    allErros.push(...ppaErros);

    // ── ETAPA 4: Cruzamento SICONFI para execução ──
    for (const ano of anos) {
      const { empenhado, liquidado, pago, dotacao: dotSiconfi, logs: siconfiLogs } =
        await buscarExecucaoSICONFI(ufCode, ano);
      allLogs.push(...siconfiLogs.map(l => `SICONFI/${ano}: ${l}`));

      // Criar registros para cada ação PPA encontrada
      for (const acao of acoes) {
        registros.push({
          programa: `${uf} — ${acao.nome}`.substring(0, 250),
          orgao: `Gov. Estadual (${uf})`, esfera: "estadual", ano,
          dotacao_inicial: acao.dotacao_inicial, dotacao_autorizada: null,
          empenhado: null, liquidado: null, pago: null, percentual_execucao: null,
          fonte_dados: `PPA ${nomeEstado} (${acao.ppa_cycle})`,
          url_fonte: acao.url_fonte,
          descritivo: acao.codigo ? `Código: ${acao.codigo} | ${acao.nome}` : acao.nome,
          observacoes: acao.grupo, eixo_tematico: null, grupo_focal: null, publico_alvo: null,
          razao_selecao: `${acao.criterio} | ${acao.ppa_cycle}`,
        });
      }

      // Registro agregado SICONFI F14
      if (dotSiconfi !== null || empenhado !== null) {
        let pctExec: number | null = null;
        if (dotSiconfi && dotSiconfi > 0 && liquidado !== null)
          pctExec = Math.round((liquidado / dotSiconfi) * 10000) / 100;

        registros.push({
          programa: `${uf} — Função 14: Direitos da Cidadania (agregado)`.substring(0, 250),
          orgao: `Gov. Estadual (${uf})`, esfera: "estadual", ano,
          dotacao_inicial: dotSiconfi, dotacao_autorizada: null,
          empenhado, liquidado, pago, percentual_execucao: pctExec,
          fonte_dados: `SICONFI RREO/DCA — ${uf}`,
          url_fonte: "https://siconfi.tesouro.gov.br",
          descritivo: "Função 14 — Direitos da Cidadania (execução agregada estadual)",
          observacoes: "Agregado F14", eixo_tematico: null, grupo_focal: null, publico_alvo: null,
          razao_selecao: "SICONFI Função 14 — valores agregados de execução",
        });
      }
    }

    // Deduplicação
    const deduped = new Map<string, Record<string, unknown>>();
    for (const r of registros) {
      const key = `${r.programa}|${r.ano}`;
      if (!deduped.has(key)) deduped.set(key, r);
    }
    const batch = Array.from(deduped.values());

    const porGrupo: Record<string, number> = {};
    for (const r of batch) {
      const g = String(r.observacoes ?? "N/C");
      porGrupo[g] = (porGrupo[g] ?? 0) + 1;
    }

    if (mode === "preview") {
      return new Response(JSON.stringify({
        success: true, mode: "preview", uf,
        total_acoes_ppa: acoes.length, total_registros: batch.length,
        por_grupo_etnico: porGrupo,
        acoes_ppa: acoes.map(a => ({
          nome: a.nome, codigo: a.codigo, dotacao_inicial: a.dotacao_inicial,
          grupo: a.grupo, criterio: a.criterio, ppa: a.ppa_cycle, url: a.url_fonte,
        })),
        log_consultas: allLogs,
        amostra: batch.slice(0, 30).map(r => ({
          programa: r.programa, ano: r.ano,
          dotacao_inicial: r.dotacao_inicial, liquidado: r.liquidado,
          empenhado: r.empenhado, razao_selecao: r.razao_selecao, grupo: r.observacoes,
        })),
        erros: allErros.slice(0, 10),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // INSERT
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let totalInserted = 0;
    for (let i = 0; i < batch.length; i += 50) {
      const chunk = batch.slice(i, i + 50);
      const { error: insErr } = await supabase.from("dados_orcamentarios").insert(chunk);
      if (insErr) allErros.push(`Batch ${i}: ${insErr.message}`);
      else totalInserted += chunk.length;
    }

    return new Response(JSON.stringify({
      success: true, mode: "insert", uf,
      total_inseridos: totalInserted, total_acoes_ppa: acoes.length,
      por_grupo_etnico: porGrupo,
      log_consultas: allLogs.slice(0, 20), erros: allErros.slice(0, 10),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

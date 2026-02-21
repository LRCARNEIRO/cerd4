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

// 3 ciclos PPA no período 2018–2025
const PPA_CYCLES = [
  { label: "PPA 2016-2019", start: 2016, end: 2019 },
  { label: "PPA 2020-2023", start: 2020, end: 2023 },
  { label: "PPA 2024-2027", start: 2024, end: 2027 },
];

// ════════════════════════════════════════════════════════════
// DICIONÁRIO DE BUSCA — radicais + palavras-chave
// ════════════════════════════════════════════════════════════
const RADICAIS = ["indigen", "quilombol", "cigan", "etnic", "palmares", "funai", "sesai"];
const PALAVRAS = [
  "igualdade racial", "promocao da igualdade", "racismo", "racial",
  "negro", "negra", "afro", "afrodescendente",
  "candomble", "umbanda", "matriz africana", "terreiro",
  "povos tradicionais", "comunidades tradicionais", "povo cigano", "romani",
  "consciencia negra", "seppir", "terra indigena", "povos originarios",
  "discriminacao racial", "enfrentamento ao racismo", "capoeira",
];

const TERMOS_EXCLUSAO = [
  "direitos da cidadania", "direitos individuais coletivos",
  "assistencia comunitaria", "gestao administrativa", "administracao geral",
];

function normalize(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Retorna o TRECHO EXATO (original, sem normalizar) que causou a seleção + grupo étnico */
function matchKeywords(texto: string): { criterio: string; grupo: string } | null {
  const norm = normalize(texto);
  let criterio = "";
  let grupo = "Racial/Étnico";

  // Buscar radicais — capturar a palavra real onde o radical aparece
  for (const r of RADICAIS) {
    const idx = norm.indexOf(r);
    if (idx === -1) continue;
    // Extrair a palavra completa do texto original
    const wordStart = texto.lastIndexOf(" ", idx) + 1;
    let wordEnd = texto.indexOf(" ", idx);
    if (wordEnd === -1) wordEnd = texto.length;
    const palavra = texto.substring(wordStart, wordEnd).replace(/[.,;:()]/g, "").trim();
    if (palavra) criterio = criterio ? `${criterio}; ${palavra}` : palavra;

    if (r === "indigen" || r === "funai" || r === "sesai") grupo = "Indígena";
    else if (r === "quilombol") grupo = "Quilombola";
    else if (r === "cigan") grupo = "Cigano/Roma";
    else if (r === "palmares") grupo = "Negro/Afrodescendente";
  }

  // Buscar palavras-chave — extrair o trecho exato do texto original
  for (const p of PALAVRAS) {
    const idx = norm.indexOf(p);
    if (idx === -1) continue;
    const trecho = texto.substring(idx, idx + p.length);
    if (trecho) criterio = criterio ? `${criterio}; ${trecho}` : trecho;

    if (p.includes("negro") || p.includes("negra") || p.includes("afro") || p.includes("racial"))
      grupo = "Negro/Afrodescendente";
    else if (p.includes("indigena") || p.includes("originario")) grupo = "Indígena";
    else if (p.includes("quilombol")) grupo = "Quilombola";
    else if (p.includes("cigano") || p.includes("romani")) grupo = "Cigano/Roma";
    else if (p.includes("tradiciona")) grupo = "Comunidade Tradicional";
  }

  if (!criterio) return null;

  // Exclusão de termos genéricos (só se o critério é fraco — 1 match simples)
  const numMatches = criterio.split(";").length;
  if (numMatches <= 1) {
    for (const excl of TERMOS_EXCLUSAO) {
      if (norm.includes(excl)) return null;
    }
  }

  return { criterio, grupo };
}

// ════════════════════════════════════════════════════════════
// CAMADA 1 — Busca nos documentos PPA via Firecrawl
// Procura documentos PPA nos portais de transparência e
// scrape do conteúdo para extrair ações/programas com
// palavras-chave raciais, código e dotação inicial
// ════════════════════════════════════════════════════════════

interface AcaoPPA {
  nome: string;
  codigo: string | null;
  dotacao_inicial: number | null;
  url_fonte: string;
  grupo: string;
  criterio: string; // trecho exato que causou a seleção
  ppa_cycle: string;
}

/** Monta queries de busca focadas em documentos PPA */
function buildSearchQueries(nomeEstado: string, uf: string): string[] {
  const ufLower = uf.toLowerCase();
  const nomeNorm = nomeEstado.toLowerCase().replace(/ /g, "");
  const domains = `site:${nomeNorm}.gov.br OR site:transparencia.${ufLower}.gov.br OR site:${ufLower}.gov.br OR site:planejamento.${ufLower}.gov.br`;

  return [
    // Buscar PPAs com termos raciais
    `"plano plurianual" "${nomeEstado}" quilombola indígena racial ação programa ${domains}`,
    `PPA "${nomeEstado}" igualdade racial negro afrodescendente programa ação dotação ${domains}`,
    `PPA "${nomeEstado}" comunidades tradicionais terreiro cigano programa orçamento ${domains}`,
    // Buscar sem restrição de domínio para capturar PDFs em repositórios
    `"plano plurianual" "${nomeEstado}" quilombola indígena racial programa ação dotação filetype:pdf`,
    `PPA "${nomeEstado}" igualdade racial negro programa ação orçamento filetype:pdf`,
  ];
}

/** Extrai ações/programas de conteúdo markdown scraped de um documento PPA */
function extractAcoesFromMarkdown(
  md: string, url: string, ppaCycle: string,
): AcaoPPA[] {
  const acoes: AcaoPPA[] = [];
  const seen = new Set<string>();

  // Dividir em blocos (parágrafos, linhas de tabela, etc.)
  const lines = md.split(/\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 10 || line.length > 500) continue;

    const match = matchKeywords(line);
    if (!match) continue;

    // Tentar extrair nome da ação/programa
    let nome = line
      .replace(/^\|?\s*/, "")     // remover pipes de tabela
      .replace(/\|.*$/, "")       // pegar só primeira coluna
      .replace(/^\*+\s*/, "")     // remover markdown bold
      .replace(/^#+\s*/, "")      // remover markdown headers
      .replace(/^\d+[\.\)]\s*/, "") // remover numeração
      .trim();

    // Tentar extrair código (ex: "1234", "Ação 5678", "Programa 0471")
    const codeMatch = line.match(/(?:(?:A[çc][ãa]o|Programa|Projeto|C[óo]digo)\s*(?:n[ºo°.]?\s*)?)?(\d{3,6})/i);
    const codigo = codeMatch ? codeMatch[1] : null;

    // Tentar extrair valor de dotação da mesma linha ou linhas adjacentes
    let dotacao: number | null = null;
    const context = [lines[i], lines[i + 1] ?? "", lines[i + 2] ?? ""].join(" ");
    const valMatch = context.match(/(?:R\$|dota[çc][ãa]o|valor|total)[:\s]*(\d{1,3}(?:[.\s]\d{3})*(?:,\d{1,2})?)/i);
    if (valMatch) {
      const val = parseFloat(valMatch[1].replace(/\s/g, "").replace(/\./g, "").replace(",", "."));
      if (val > 0) dotacao = val;
    }

    // Limpar nome
    if (nome.length < 5) nome = line.substring(0, 200);
    nome = nome.substring(0, 250);

    const key = normalize(nome).substring(0, 80);
    if (seen.has(key)) continue;
    seen.add(key);

    acoes.push({
      nome,
      codigo,
      dotacao_inicial: dotacao,
      url_fonte: url,
      grupo: match.grupo,
      criterio: match.criterio,
      ppa_cycle: ppaCycle,
    });
  }

  return acoes;
}

async function buscarDocumentosPPA(
  uf: string, nomeEstado: string, firecrawlKey: string,
): Promise<{ acoes: AcaoPPA[]; logs: string[]; erros: string[] }> {
  const acoes: AcaoPPA[] = [];
  const logs: string[] = [];
  const erros: string[] = [];
  const seenUrls = new Set<string>();
  const seenNomes = new Set<string>();

  const queries = buildSearchQueries(nomeEstado, uf);

  // Fase 1: Buscar URLs de documentos PPA
  const urlsToScrape: { url: string; title: string; desc: string }[] = [];

  for (const query of queries) {
    try {
      console.log(`  Search: ${query.substring(0, 100)}...`);
      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 5, lang: "pt-BR", country: "BR" }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) { erros.push(`Search ${res.status}`); continue; }
      const data = await res.json();
      const results = data?.data ?? [];
      logs.push(`Busca "${query.substring(0, 50)}..." → ${results.length} resultados`);

      for (const r of results) {
        const url = String(r.url ?? "");
        if (!url || seenUrls.has(url)) continue;
        seenUrls.add(url);

        // Priorizar PDFs e páginas de PPA
        const title = String(r.title ?? "");
        const desc = String(r.description ?? "");

        // Verificar se título/descrição contêm termos relevantes
        const fullText = `${title} ${desc}`;
        const hasKeyword = matchKeywords(fullText);
        if (hasKeyword) {
          urlsToScrape.push({ url, title, desc });
        }
      }
    } catch (e) {
      erros.push(`Search error: ${e instanceof Error ? e.message : "Erro"}`);
    }
    await new Promise(r => setTimeout(r, 400));
  }

  logs.push(`URLs para scraping: ${urlsToScrape.length}`);

  // Fase 2: Scrape dos documentos/páginas encontrados
  const maxScrapes = Math.min(urlsToScrape.length, 5); // Limitar para evitar timeout
  for (let s = 0; s < maxScrapes; s++) {
    const { url, title } = urlsToScrape[s];
    try {
      console.log(`  Scraping (${s + 1}/${maxScrapes}): ${url.substring(0, 80)}`);
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          formats: ["markdown"],
          onlyMainContent: false, // Capturar tudo — PPAs podem estar em tabelas e anexos
          waitFor: 3000,
        }),
        signal: AbortSignal.timeout(45_000),
      });

      if (!res.ok) { logs.push(`Scrape ${url.substring(0, 50)}: HTTP ${res.status}`); continue; }
      const data = await res.json();
      const md = String(data?.data?.markdown ?? data?.markdown ?? "");
      if (md.length < 50) { logs.push(`Scrape ${title.substring(0, 40)}: vazio`); continue; }

      // Determinar ciclo PPA pela URL ou conteúdo
      let ppaCycle = "PPA 2024-2027";
      for (const cycle of PPA_CYCLES) {
        if (
          url.includes(String(cycle.start)) ||
          md.includes(`${cycle.start}-${cycle.end}`) ||
          md.includes(`${cycle.start}/${cycle.end}`)
        ) {
          ppaCycle = cycle.label;
          break;
        }
      }

      const extracted = extractAcoesFromMarkdown(md, url, ppaCycle);

      // Deduplicar contra ações já encontradas
      for (const acao of extracted) {
        const key = normalize(acao.nome).substring(0, 80);
        if (!seenNomes.has(key)) {
          seenNomes.add(key);
          acoes.push(acao);
        }
      }

      logs.push(`Scrape ${title.substring(0, 40)}: ${extracted.length} ações extraídas (${ppaCycle})`);
    } catch (e) {
      erros.push(`Scrape error: ${e instanceof Error ? e.message : "Erro"}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  // Fase 3: Usar título+descrição dos resultados que não foram scraped
  // como fallback (menor qualidade, mas garante algum dado)
  for (const item of urlsToScrape) {
    const fullText = `${item.title} ${item.desc}`;
    const match = matchKeywords(fullText);
    if (!match) continue;

    let nome = item.title.replace(/^\[PDF\]\s*/i, "").trim();
    nome = nome.substring(0, 250);
    const key = normalize(nome).substring(0, 80);
    if (seenNomes.has(key)) continue;
    seenNomes.add(key);

    const codeMatch = fullText.match(/(?:Programa|Ação|Projeto)\s*(\d{3,6})/i);
    let ppaCycle = "PPA 2024-2027";
    for (const cycle of PPA_CYCLES) {
      if (fullText.includes(String(cycle.start)) || fullText.includes(`${cycle.start}-${cycle.end}`)) {
        ppaCycle = cycle.label;
        break;
      }
    }

    acoes.push({
      nome,
      codigo: codeMatch?.[1] ?? null,
      dotacao_inicial: null,
      url_fonte: item.url,
      grupo: match.grupo,
      criterio: match.criterio,
      ppa_cycle: ppaCycle,
    });
  }

  logs.push(`Total: ${acoes.length} ações/programas PPA identificados`);
  return { acoes, logs, erros };
}

// ════════════════════════════════════════════════════════════
// CAMADA 3 — Cruzamento SICONFI para execução (empenho/liquidação)
// Usa Função 14 (Direitos da Cidadania) no RREO/DCA
// ════════════════════════════════════════════════════════════

async function buscarExecucaoSICONFI(
  ufCode: number, ano: number,
): Promise<{ empenhado: number | null; liquidado: number | null; pago: number | null; dotacao: number | null; logs: string[] }> {
  const logs: string[] = [];

  // RREO Anexo 02
  for (let bim = 6; bim >= 1; bim--) {
    try {
      const params = new URLSearchParams({
        an_exercicio: String(ano), id_ente: String(ufCode),
        nr_periodo: String(bim), no_anexo: "RREO-Anexo 02",
        co_tipo_demonstrativo: "RREO", "$limit": "5000",
      });
      const res = await fetch(`https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo?${params}`, {
        headers: { Accept: "application/json" },
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const items: Record<string, unknown>[] = data?.items ?? [];
      if (items.length === 0) continue;

      const f14Items = items.filter(i => {
        const conta = normalize(String(i.conta ?? ""));
        return conta.includes("direitos da cidadania");
      });

      if (f14Items.length === 0) { logs.push(`RREO bim${bim}: ${items.length} itens, 0 F14`); continue; }

      let empenhado: number | null = null;
      let liquidado: number | null = null;
      let pago: number | null = null;
      let dotacao: number | null = null;

      for (const item of f14Items) {
        const coluna = normalize(String(item.coluna ?? ""));
        const valor = typeof item.valor === "number" ? item.valor : null;
        if (valor === null) continue;

        if (coluna.includes("dotacao inicial")) dotacao = (dotacao ?? 0) + valor;
        else if (coluna.includes("empenhadas ate o bimestre")) empenhado = (empenhado ?? 0) + valor;
        else if (coluna.includes("liquidadas ate o bimestre")) liquidado = (liquidado ?? 0) + valor;
        else if (coluna.includes("pagas ate o bimestre")) pago = (pago ?? 0) + valor;
      }

      logs.push(`RREO bim${bim}: F14 dot=${dotacao?.toLocaleString() ?? "—"} emp=${empenhado?.toLocaleString() ?? "—"} liq=${liquidado?.toLocaleString() ?? "—"}`);
      return { empenhado, liquidado, pago, dotacao, logs };
    } catch (e) {
      logs.push(`RREO bim${bim}: ${e instanceof Error ? e.message : "Erro"}`);
    }
  }

  // Fallback: DCA Anexo I-E
  try {
    const params = new URLSearchParams({
      an_exercicio: String(ano), id_ente: String(ufCode),
      no_anexo: "DCA-Anexo I-E", "$limit": "5000",
    });
    const res = await fetch(`https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca?${params}`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(30_000),
    });
    if (res.ok) {
      const data = await res.json();
      const items: Record<string, unknown>[] = data?.items ?? [];
      const f14 = items.filter(i => String(i.conta ?? "").startsWith("14 "));

      let empenhado: number | null = null;
      let liquidado: number | null = null;
      let dotacao: number | null = null;

      for (const item of f14) {
        const coluna = normalize(String(item.coluna ?? ""));
        const valor = typeof item.valor === "number" ? item.valor : null;
        if (valor === null) continue;

        if (coluna.includes("empenhad")) empenhado = (empenhado ?? 0) + valor;
        else if (coluna.includes("liquidad")) liquidado = (liquidado ?? 0) + valor;
        else if (coluna.includes("dotacao") || coluna.includes("dotação")) dotacao = (dotacao ?? 0) + valor;
      }

      logs.push(`DCA I-E: F14 dot=${dotacao?.toLocaleString() ?? "—"} emp=${empenhado?.toLocaleString() ?? "—"}`);
      return { empenhado, liquidado, pago: null, dotacao, logs };
    }
  } catch (e) {
    logs.push(`DCA I-E: ${e instanceof Error ? e.message : "Erro"}`);
  }

  return { empenhado: null, liquidado: null, pago: null, dotacao: null, logs };
}

// ════════════════════════════════════════════════════════════
// HANDLER — 1 estado por chamada
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
      return new Response(JSON.stringify({
        success: false, error: `UF inválida: ${uf}`,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { cod: ufCode, nome: nomeEstado } = ESTADOS_IBGE[uf];
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!firecrawlKey) {
      return new Response(JSON.stringify({
        success: false, error: "FIRECRAWL_API_KEY não configurada.",
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`=== Ingestão ${uf} (${nomeEstado}) | Anos: ${anos.join(",")} | ${mode} ===`);

    const allLogs: string[] = [];
    const allErros: string[] = [];
    const registros: Record<string, unknown>[] = [];

    // ── CAMADA 1: Busca nos documentos PPA ──
    console.log(`\n--- Camada 1: Documentos PPA ${nomeEstado} ---`);
    const { acoes, logs: ppaLogs, erros: ppaErros } = await buscarDocumentosPPA(uf, nomeEstado, firecrawlKey);
    allLogs.push(...ppaLogs.map(l => `C1-PPA: ${l}`));
    allErros.push(...ppaErros);

    // ── CAMADA 3: Cruzamento SICONFI para execução ──
    for (const ano of anos) {
      console.log(`\n--- Camada 3: Execução SICONFI ${uf}/${ano} ---`);
      const { empenhado, liquidado, pago, dotacao: dotSiconfi, logs: siconfiLogs } =
        await buscarExecucaoSICONFI(ufCode, ano);
      allLogs.push(...siconfiLogs.map(l => `C3/${ano}: ${l}`));

      // Criar registros para cada ação PPA encontrada
      if (acoes.length > 0) {
        for (const acao of acoes) {
          registros.push({
            programa: `${uf} — ${acao.nome}`.substring(0, 250),
            orgao: `Gov. Estadual (${uf})`,
            esfera: "estadual",
            ano,
            dotacao_inicial: acao.dotacao_inicial,
            dotacao_autorizada: null,
            empenhado: null, // Execução individual indisponível no SICONFI
            liquidado: null,
            pago: null,
            percentual_execucao: null,
            fonte_dados: `PPA ${nomeEstado} via Firecrawl`,
            url_fonte: acao.url_fonte,
            descritivo: acao.codigo ? `Código: ${acao.codigo} | ${acao.nome}` : acao.nome,
            observacoes: acao.grupo,
            eixo_tematico: null,
            grupo_focal: null,
            publico_alvo: null,
            razao_selecao: `${acao.criterio} | ${acao.ppa_cycle}`,
          });
        }
      }

      // Registro agregado SICONFI F14 (execução real)
      if (dotSiconfi !== null || empenhado !== null) {
        let pctExec: number | null = null;
        if (dotSiconfi && dotSiconfi > 0 && liquidado !== null)
          pctExec = Math.round((liquidado / dotSiconfi) * 10000) / 100;

        registros.push({
          programa: `${uf} — Função 14: Direitos da Cidadania (execução agregada)`.substring(0, 250),
          orgao: `Gov. Estadual (${uf})`,
          esfera: "estadual",
          ano,
          dotacao_inicial: dotSiconfi,
          dotacao_autorizada: null,
          empenhado, liquidado, pago,
          percentual_execucao: pctExec,
          fonte_dados: `SICONFI RREO/DCA — ${uf}`,
          url_fonte: "https://siconfi.tesouro.gov.br",
          descritivo: "Função 14 — Direitos da Cidadania (execução agregada estadual)",
          observacoes: "Agregado F14",
          eixo_tematico: null, grupo_focal: null, publico_alvo: null,
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

    // Stats por grupo
    const porGrupo: Record<string, number> = {};
    for (const r of batch) {
      const g = String(r.observacoes ?? "N/C");
      porGrupo[g] = (porGrupo[g] ?? 0) + 1;
    }

    if (mode === "preview") {
      return new Response(JSON.stringify({
        success: true, mode: "preview", uf,
        total_acoes_ppa: acoes.length,
        total_registros: batch.length,
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

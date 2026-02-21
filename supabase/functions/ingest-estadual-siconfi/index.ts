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

// Ciclos PPA estaduais no período 2018–2025
const PPA_CYCLES = [
  { label: "PPA 2016-2019", start: 2016, end: 2019 },
  { label: "PPA 2020-2023", start: 2020, end: 2023 },
  { label: "PPA 2024-2027", start: 2024, end: 2027 },
];

// Palavras-chave para buscar nos PPAs
const SEARCH_QUERIES = [
  "programa igualdade racial quilombola indígena ação orçamentária",
  "programa negro afrodescendente promoção igualdade racial PPA",
  "programa comunidades tradicionais quilombola cigano terreiro PPA",
];

// Radicais e palavras-chave para filtrar resultados
const RADICAIS = ["indigen", "quilombol", "cigan", "etnic", "palmares", "funai", "sesai"];
const PALAVRAS = [
  "igualdade racial", "promocao da igualdade", "racismo", "racial", "negro", "negra",
  "afrodescendente", "afro", "consciencia negra", "matriz africana", "capoeira",
  "candomble", "umbanda", "terreiro", "seppir", "povos originarios", "terra indigena",
  "povos tradicionais", "comunidades tradicionais", "povo cigano", "romani",
  "discriminacao racial", "enfrentamento ao racismo",
];

const TERMOS_EXCLUSAO = [
  "direitos da cidadania", "direitos individuais coletivos",
  "assistencia comunitaria", "gestao administrativa", "administracao geral",
];

function normalize(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function matchKeywords(texto: string): { termos: string[]; grupo: string } | null {
  const norm = normalize(texto);
  const termos: string[] = [];
  let grupo = "Racial/Étnico";

  for (const r of RADICAIS) {
    if (norm.includes(r)) {
      termos.push(r);
      if (r === "indigen" || r === "funai" || r === "sesai") grupo = "Indígena";
      else if (r === "quilombol") grupo = "Quilombola";
      else if (r === "cigan") grupo = "Cigano/Roma";
      else if (r === "palmares") grupo = "Negro/Afrodescendente";
    }
  }
  for (const p of PALAVRAS) {
    if (norm.includes(p)) {
      termos.push(p);
      if (p.includes("negro") || p.includes("negra") || p.includes("afro") || p.includes("racial"))
        grupo = "Negro/Afrodescendente";
      else if (p.includes("indigena") || p.includes("originario"))
        grupo = "Indígena";
      else if (p.includes("quilombol")) grupo = "Quilombola";
      else if (p.includes("cigano") || p.includes("romani")) grupo = "Cigano/Roma";
      else if (p.includes("tradiciona")) grupo = "Comunidade Tradicional";
    }
  }
  if (termos.length === 0) return null;

  for (const excl of TERMOS_EXCLUSAO) {
    if (norm.includes(excl) && termos.length === 1) return null;
  }
  return { termos, grupo };
}

// ═══════════════════════════════════════════════════════════════
// CAMADA 1 — Busca nos PPAs via Firecrawl Search
// Encontra programas/ações orçamentárias nos Portais de
// Transparência estaduais usando palavras-chave raciais
// ═══════════════════════════════════════════════════════════════

interface ProgramaPPA {
  nome: string;
  codigo: string | null;
  dotacao_inicial: number | null;
  url_fonte: string;
  grupo: string;
  termos_match: string[];
  ppa_cycle: string;
}

async function buscarPPAViaFirecrawl(
  uf: string, nomeEstado: string, firecrawlKey: string,
): Promise<{ programas: ProgramaPPA[]; logs: string[]; erros: string[] }> {
  const programas: ProgramaPPA[] = [];
  const logs: string[] = [];
  const erros: string[] = [];
  const seen = new Set<string>();

  for (const query of SEARCH_QUERIES) {
    const searchQuery = `PPA ${nomeEstado} ${query} site:${nomeEstado.toLowerCase().replace(/ /g, "")}.gov.br OR site:transparencia.${uf.toLowerCase()}.gov.br OR site:${uf.toLowerCase()}.gov.br`;

    try {
      console.log(`  Search: ${searchQuery.substring(0, 120)}`);
      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 5,
          lang: "pt-BR",
          country: "BR",
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        erros.push(`Firecrawl search error: ${res.status}`);
        continue;
      }

      const data = await res.json();
      const results = data?.data ?? [];
      logs.push(`Search "${query.substring(0, 40)}..." → ${results.length} resultados`);

      for (const r of results) {
        const title = String(r.title ?? "");
        const desc = String(r.description ?? "");
        const url = String(r.url ?? "");
        const fullText = `${title} ${desc}`;

        const match = matchKeywords(fullText);
        if (!match) continue;

        // Limpar nome do programa
        let programa = title.replace(/^\[PDF\]\s*/i, "").replace(/\s*-\s*(BA|SP|RJ|MG|RS|PR|CE|PE|GO|PA|MA|MT|MS|RO|RR|AC|AL|AP|AM|DF|ES|PB|PI|RN|SC|SE|TO)\s*(Gov|\.Gov).*$/i, "").trim();
        // Tentar extrair código (ex: "Programa 427")
        const codeMatch = programa.match(/(?:Programa|Ação|Projeto)\s*(\d{3,4})/i);
        const codigo = codeMatch ? codeMatch[1] : null;

        if (seen.has(normalize(programa))) continue;
        seen.add(normalize(programa));

        // Determinar ciclo PPA
        let ppaCycle = "PPA 2024-2027";
        for (const cycle of PPA_CYCLES) {
          if (fullText.includes(String(cycle.start)) || fullText.includes(`${cycle.start}-${cycle.end}`)) {
            ppaCycle = cycle.label;
            break;
          }
        }

        programas.push({
          nome: programa.substring(0, 250),
          codigo,
          dotacao_inicial: null,
          url_fonte: url,
          grupo: match.grupo,
          termos_match: match.termos.slice(0, 5),
          ppa_cycle: ppaCycle,
        });
      }
    } catch (e) {
      erros.push(`Search error: ${e instanceof Error ? e.message : "Erro"}`);
    }
    await new Promise(r => setTimeout(r, 500));
  }

  // ── Busca adicional sem restrição de site para ampliar cobertura ──
  if (programas.length < 3) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `PPA ${nomeEstado} programa igualdade racial quilombola indígena negro ação orçamentária dotação`,
          limit: 5,
          lang: "pt-BR",
          country: "BR",
        }),
        signal: AbortSignal.timeout(30_000),
      });
      if (res.ok) {
        const data = await res.json();
        const results = data?.data ?? [];
        logs.push(`Busca ampla → ${results.length} resultados`);
        for (const r of results) {
          const title = String(r.title ?? "");
          const desc = String(r.description ?? "");
          const url = String(r.url ?? "");
          const match = matchKeywords(`${title} ${desc}`);
          if (!match) continue;
          const key = normalize(title);
          if (seen.has(key)) continue;
          seen.add(key);
          const codeMatch = title.match(/(?:Programa|Ação|Projeto)\s*(\d{3,4})/i);
          programas.push({
            nome: title.substring(0, 250), codigo: codeMatch?.[1] ?? null,
            dotacao_inicial: null, url_fonte: url, grupo: match.grupo,
            termos_match: match.termos.slice(0, 5), ppa_cycle: "PPA 2024-2027",
          });
        }
      }
    } catch { /* ignore */ }
  }

  logs.push(`Total: ${programas.length} programas PPA identificados`);
  return { programas, logs, erros };
}

// ═══════════════════════════════════════════════════════════════
// CAMADA 2 — Enriquecimento via scraping dos PDFs/páginas
// Tenta extrair dotação inicial e detalhes das páginas encontradas
// ═══════════════════════════════════════════════════════════════

async function enriquecerViaScrap(
  programas: ProgramaPPA[], firecrawlKey: string,
): Promise<string[]> {
  const logs: string[] = [];
  const urlsToScrape = programas
    .filter(p => p.url_fonte && !p.url_fonte.endsWith(".pdf")) // PDFs são difíceis de parsear
    .slice(0, 3); // Limitar para evitar timeout

  for (const prog of urlsToScrape) {
    try {
      const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${firecrawlKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: prog.url_fonte,
          formats: ["markdown"],
          onlyMainContent: true,
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) continue;
      const data = await res.json();
      const md = String(data?.data?.markdown ?? "");

      // Tentar extrair valores de dotação
      const dotMatch = md.match(/dota[cç][ãa]o\s*(?:inicial|autorizada)?[:\s]*R?\$?\s*([\d.,]+)/i);
      if (dotMatch) {
        const val = parseFloat(dotMatch[1].replace(/\./g, "").replace(",", "."));
        if (val > 0) {
          prog.dotacao_inicial = val;
          logs.push(`  Scrape ${prog.nome.substring(0, 40)}: dotação R$ ${val.toLocaleString()}`);
        }
      }

      // Tentar extrair código se não temos
      if (!prog.codigo) {
        const codeMatch = md.match(/(?:código|programa|ação)\s*(?:n[ºo°]?\s*)?(\d{3,6})/i);
        if (codeMatch) prog.codigo = codeMatch[1];
      }
    } catch { /* ignore */ }
    await new Promise(r => setTimeout(r, 300));
  }
  return logs;
}

// ═══════════════════════════════════════════════════════════════
// CAMADA 3 — Cruzamento SICONFI/MSC para execução orçamentária
// Usa Função 14 (Direitos da Cidadania) e dados da RREO para
// capturar valores agregados de empenho/liquidação
// ═══════════════════════════════════════════════════════════════

async function buscarExecucaoSICONFI(
  ufCode: number, ano: number,
): Promise<{ empenhado: number | null; liquidado: number | null; pago: number | null; dotacao: number | null; logs: string[] }> {
  const logs: string[] = [];

  // RREO Anexo 02 — buscar Função 14 (Direitos da Cidadania)
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

      // Filtrar por Função 14 e subfunções relevantes
      const f14Items = items.filter(i => {
        const conta = normalize(String(i.conta ?? ""));
        return conta.includes("direitos da cidadania") ||
               conta.includes("direitos individuais coletivos") ||
               conta === "fu14 - demais subfuncoes";
      });

      if (f14Items.length === 0) { logs.push(`RREO bim ${bim}: ${items.length} items, 0 F14`); continue; }

      let empenhado: number | null = null;
      let liquidado: number | null = null;
      let pago: number | null = null;
      let dotacao: number | null = null;

      for (const item of f14Items) {
        const coluna = normalize(String(item.coluna ?? ""));
        const valor = typeof item.valor === "number" ? item.valor : null;
        const conta = normalize(String(item.conta ?? ""));
        if (valor === null || !conta.includes("direitos da cidadania")) continue;

        if (coluna.includes("dotacao inicial")) dotacao = (dotacao ?? 0) + valor;
        else if (coluna.includes("empenhadas ate o bimestre")) empenhado = (empenhado ?? 0) + valor;
        else if (coluna.includes("liquidadas ate o bimestre")) liquidado = (liquidado ?? 0) + valor;
        else if (coluna.includes("pagas ate o bimestre")) pago = (pago ?? 0) + valor;
      }

      logs.push(`RREO bim ${bim}: F14 dotação=${dotacao?.toLocaleString() ?? "N/A"}, emp=${empenhado?.toLocaleString() ?? "N/A"}, liq=${liquidado?.toLocaleString() ?? "N/A"}`);
      return { empenhado, liquidado, pago, dotacao, logs };
    } catch (e) {
      logs.push(`RREO bim ${bim}: erro ${e instanceof Error ? e.message : "Erro"}`);
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
      const f14 = items.filter(i => {
        const c = String(i.conta ?? "");
        return c.startsWith("14 ") || c.startsWith("14.");
      });

      let empenhado: number | null = null;
      let liquidado: number | null = null;
      let dotacao: number | null = null;

      for (const item of f14) {
        const coluna = normalize(String(item.coluna ?? ""));
        const valor = typeof item.valor === "number" ? item.valor : null;
        const conta = String(item.conta ?? "");
        if (valor === null || !conta.startsWith("14 ")) continue;

        if (coluna.includes("empenhad")) empenhado = (empenhado ?? 0) + valor;
        else if (coluna.includes("liquidad")) liquidado = (liquidado ?? 0) + valor;
        else if (coluna.includes("dotacao") || coluna.includes("dotação")) dotacao = (dotacao ?? 0) + valor;
      }

      logs.push(`DCA I-E: F14 dotação=${dotacao?.toLocaleString() ?? "N/A"}, emp=${empenhado?.toLocaleString() ?? "N/A"}`);
      return { empenhado, liquidado, pago: null, dotacao, logs };
    }
  } catch (e) {
    logs.push(`DCA I-E: erro ${e instanceof Error ? e.message : "Erro"}`);
  }

  return { empenhado: null, liquidado: null, pago: null, dotacao: null, logs };
}

// ═══════════════════════════════════════════════════════════════
// HANDLER — 1 estado por chamada
// ═══════════════════════════════════════════════════════════════

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

    const targetUF = uf;
    if (!targetUF || !ESTADOS_IBGE[targetUF]) {
      return new Response(JSON.stringify({
        success: false, error: `UF inválida: ${targetUF}`,
      }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { cod: ufCode, nome: nomeEstado } = ESTADOS_IBGE[targetUF];
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");

    if (!firecrawlKey) {
      return new Response(JSON.stringify({
        success: false, error: "FIRECRAWL_API_KEY não configurada. Conecte o Firecrawl nas configurações.",
      }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`=== Ingestão ${targetUF} (${nomeEstado}) | Anos: ${anos.join(",")} | ${mode} ===`);

    const allLogs: string[] = [];
    const allErros: string[] = [];
    const allRegistros: Record<string, unknown>[] = [];

    // ── CAMADA 1: Busca nos PPAs via Firecrawl ──
    console.log(`\n--- Camada 1: Busca PPA ${nomeEstado} via Firecrawl ---`);
    const { programas, logs: searchLogs, erros: searchErros } = await buscarPPAViaFirecrawl(targetUF, nomeEstado, firecrawlKey);
    allLogs.push(...searchLogs.map(l => `C1: ${l}`));
    allErros.push(...searchErros);

    // ── CAMADA 2: Enriquecimento via scraping ──
    if (programas.length > 0) {
      console.log(`\n--- Camada 2: Enriquecimento via scraping (${programas.length} programas) ---`);
      const scrapeLogs = await enriquecerViaScrap(programas, firecrawlKey);
      allLogs.push(...scrapeLogs.map(l => `C2: ${l}`));
    }

    // ── CAMADA 3: Cruzamento SICONFI para execução ──
    for (const ano of anos) {
      console.log(`\n--- Camada 3: Execução SICONFI ${targetUF}/${ano} ---`);
      const { empenhado, liquidado, pago, dotacao, logs: siconfiLogs } =
        await buscarExecucaoSICONFI(ufCode, ano);
      allLogs.push(...siconfiLogs.map(l => `C3/${ano}: ${l}`));

      // Criar registros: um para cada programa PPA encontrado
      if (programas.length > 0) {
        // Distribuir os valores SICONFI proporcionalmente entre os programas
        // (melhor estimativa possível quando não temos valores por programa)
        for (const prog of programas) {
          let pctExec: number | null = null;
          const progDotacao = prog.dotacao_inicial;
          if (progDotacao && progDotacao > 0 && liquidado !== null) {
            // Só calculamos % se temos dotação do próprio programa
            pctExec = null; // Sem precisão suficiente
          }

          allRegistros.push({
            programa: `${targetUF} — ${prog.nome}`.substring(0, 250),
            orgao: `Gov. Estadual (${targetUF})`,
            esfera: "estadual",
            ano,
            dotacao_inicial: prog.dotacao_inicial,
            dotacao_autorizada: null,
            empenhado: null, // Só o agregado está disponível
            liquidado: null,
            pago: null,
            percentual_execucao: pctExec,
            fonte_dados: `Firecrawl Search + SICONFI — ${targetUF}`,
            url_fonte: prog.url_fonte,
            descritivo: prog.nome,
            observacoes: prog.grupo,
            eixo_tematico: null,
            grupo_focal: null,
            publico_alvo: null,
            razao_selecao: `Camada1: ${prog.termos_match.slice(0, 3).join(", ")} | ${prog.ppa_cycle}`,
          });
        }

        // Registro agregado com valores SICONFI F14
        if (dotacao !== null || empenhado !== null) {
          let pctExec: number | null = null;
          if (dotacao && dotacao > 0 && liquidado !== null)
            pctExec = Math.round((liquidado / dotacao) * 10000) / 100;

          allRegistros.push({
            programa: `${targetUF} — Função 14: Direitos da Cidadania (agregado)`.substring(0, 250),
            orgao: `Gov. Estadual (${targetUF})`,
            esfera: "estadual",
            ano,
            dotacao_inicial: dotacao,
            dotacao_autorizada: null,
            empenhado, liquidado, pago,
            percentual_execucao: pctExec,
            fonte_dados: `SICONFI RREO/DCA — ${targetUF}`,
            url_fonte: "https://siconfi.tesouro.gov.br/siconfi/pages/public/declaracao/declaracao_list.jsf",
            descritivo: "Função 14 — Direitos da Cidadania (agregado estadual)",
            observacoes: "Agregado F14",
            eixo_tematico: null, grupo_focal: null, publico_alvo: null,
            razao_selecao: "Camada3: SICONFI Função 14 — valores agregados",
          });
        }
      } else {
        // Sem programas encontrados via Firecrawl — usar apenas SICONFI
        if (dotacao !== null || empenhado !== null) {
          let pctExec: number | null = null;
          if (dotacao && dotacao > 0 && liquidado !== null)
            pctExec = Math.round((liquidado / dotacao) * 10000) / 100;

          allRegistros.push({
            programa: `${targetUF} — Função 14: Direitos da Cidadania`.substring(0, 250),
            orgao: `Gov. Estadual (${targetUF})`,
            esfera: "estadual",
            ano,
            dotacao_inicial: dotacao,
            dotacao_autorizada: null,
            empenhado, liquidado, pago,
            percentual_execucao: pctExec,
            fonte_dados: `SICONFI RREO/DCA — ${targetUF}`,
            url_fonte: "https://siconfi.tesouro.gov.br/siconfi/pages/public/declaracao/declaracao_list.jsf",
            descritivo: "Função 14 — Direitos da Cidadania",
            observacoes: "Racial/Étnico",
            eixo_tematico: null, grupo_focal: null, publico_alvo: null,
            razao_selecao: "Camada3: SICONFI Função 14 (sem programas PPA identificados via scraping)",
          });
        }
      }
    }

    // Deduplicação
    const deduped = new Map<string, Record<string, unknown>>();
    for (const r of allRegistros) {
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
        success: true, mode: "preview", uf: targetUF,
        total_programas_ppa: programas.length,
        total_registros: batch.length,
        por_grupo_etnico: porGrupo,
        programas_ppa: programas.map(p => ({
          nome: p.nome, codigo: p.codigo, dotacao_inicial: p.dotacao_inicial,
          grupo: p.grupo, termos: p.termos_match, ppa: p.ppa_cycle, url: p.url_fonte,
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
      success: true, mode: "insert", uf: targetUF,
      total_inseridos: totalInserted, total_programas_ppa: programas.length,
      por_grupo_etnico: porGrupo,
      log_consultas: allLogs.slice(0, 20), erros: allErros.slice(0, 10),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

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
// RADICAIS E KEYWORDS PARA BUSCA NOS PPAs
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
// ETAPA 1: Localizar URLs de documentos PPA (PDFs) via Search
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

interface PPADoc {
  url: string;
  cycle: string;
  title: string;
}

async function localizarPPAs(
  nomeEstado: string, dominio: string, firecrawlKey: string,
): Promise<{ docs: PPADoc[]; programasFromSearch: ProgramaPPA[]; logs: string[] }> {
  const docs: PPADoc[] = [];
  const logs: string[] = [];
  const seenUrls = new Set<string>();
  const searchExtracted: ProgramaPPA[] = [];
  const seenProgsFromSearch = new Set<string>();

  // 3 queries compactas — uma por ciclo PPA
  const ciclos = [
    { label: "PPA 2024-2027", queries: [
      `PPA 2024 2027 ${nomeEstado} programa "igualdade racial" OR "quilombola" OR "indígena" OR "comunidades tradicionais" OR "SEPROMI" site:*.gov.br`,
    ]},
    { label: "PPA 2020-2023", queries: [
      `PPA 2020 2023 ${nomeEstado} programa "igualdade racial" OR "quilombola" OR "indígena" OR "comunidades tradicionais" site:*.gov.br`,
    ]},
    { label: "PPA 2016-2019", queries: [
      `PPA 2016 2019 ${nomeEstado} programa "igualdade racial" OR "quilombola" OR "indígena" site:*.gov.br`,
    ]},
  ];

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
          logs.push(`Rate limit na busca ${ciclo.label}, pausando...`);
          await new Promise(r => setTimeout(r, 3000));
          continue;
        }
        if (!res.ok) { logs.push(`Search ${ciclo.label} HTTP ${res.status}`); continue; }

        const data = await res.json();
        const results = data?.data ?? [];

        for (const r of results) {
          const url = String(r.url ?? "");
          if (!url || seenUrls.has(url) || !isUrlValida(url)) continue;
          seenUrls.add(url);

          // Extrair programas do markdown/description que a Search já retorna
          const md = String(r.markdown ?? r.description ?? "");
          const title = String(r.title ?? "");
          const content = [title, md].join("\n");
          if (content.length > 50) {
            const progsFromSearch = extrairProgramasDoConteudo(content, url, ciclo.label);
            for (const p of progsFromSearch) {
              const key = normalize(p.nome).substring(0, 60);
              if (!seenProgsFromSearch.has(key)) {
                seenProgsFromSearch.add(key);
                searchExtracted.push(p);
              }
            }
          }
          // Guardar URL para scrape profundo
          docs.push({ url, cycle: ciclo.label, title });
        }
        logs.push(`Search ${ciclo.label}: ${results.length} resultados, ${searchExtracted.length} programas extraídos`);
      } catch (e) {
        logs.push(`Search ${ciclo.label}: ${e instanceof Error ? e.message : "Erro"}`);
      }
      await new Promise(r => setTimeout(r, 400));
    }
  }

  logs.push(`Total: ${docs.length} docs para scrape, ${searchExtracted.length} programas já extraídos da busca`);
  return { docs, programasFromSearch: searchExtracted, logs };
}

// ════════════════════════════════════════════════════════════
// ETAPA 2: Scrape completo de cada documento e extração
// ════════════════════════════════════════════════════════════

interface ProgramaPPA {
  nome: string;
  codigo: string | null;
  dotacao_inicial: number | null;
  secretaria: string | null;
  url_fonte: string;
  grupo: string;
  criterio: string;
  ppa_cycle: string;
}

async function scrapeEExtrair(
  doc: PPADoc, firecrawlKey: string,
): Promise<{ programas: ProgramaPPA[]; log: string }> {
  try {
    const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        url: doc.url,
        formats: ["markdown"],
        onlyMainContent: false,
        waitFor: 2000,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      return { programas: [], log: `Scrape falhou HTTP ${res.status}: ${doc.url}` };
    }

    const data = await res.json();
    const md = String(data?.data?.markdown ?? data?.markdown ?? "");
    if (md.length < 100) {
      return { programas: [], log: `Scrape vazio (${md.length} chars): ${doc.url}` };
    }

    const programas = extrairProgramasDoConteudo(md, doc.url, doc.cycle);
    return {
      programas,
      log: `Scrape OK (${md.length} chars) → ${programas.length} programas: ${doc.url.substring(0, 80)}`,
    };
  } catch (e) {
    return { programas: [], log: `Scrape erro: ${e instanceof Error ? e.message : "?"} — ${doc.url}` };
  }
}

/** Limpa nomes de programas removendo artefatos de scraping */
function limparNome(nome: string): string {
  return nome
    .replace(/^\[PDF\]\s*/i, "")
    .replace(/\s*-\s*(?:BA|SP|RJ|MG|RS|PR|SC|PE|CE|GO|PA|MA|MT|MS|AM|RN|PB|PI|SE|AL|RO|AC|AP|RR|TO|DF|ES)\s*(?:\.?\s*Gov\b)?\.?\s*$/i, "")
    .replace(/,\s*conforme\s+o\s+PPA.*$/i, "")
    .replace(/,\s*possui\s+\d+\s+\w+.*$/i, "")
    .replace(/\.\s*\.\s*\d+\s*$/i, "")  // ". . 12"
    .replace(/\.\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .substring(0, 200);
}

/** Extrai APENAS programas e ações orçamentárias com código numérico, ou secretarias temáticas conhecidas.
 *  Rejeita indicadores, eixos, metas textuais, compromissos e qualquer item sem estrutura orçamentária. */
function extrairProgramasDoConteudo(
  content: string, url: string, ppaCycle: string,
): ProgramaPPA[] {
  const programas: ProgramaPPA[] = [];
  const seen = new Set<string>();
  const lines = content.split(/\n/);

  // ── Termos que NUNCA são programas/ações orçamentárias ──
  const REJEITAR_LINHA = [
    "indicador", "eixo tematic", "eixo estrateg", "diretriz",
    "macro-desafio", "macrodesafio", "compromisso", "prioridade da ldo",
    "nao programada na loa", "saiba mais", "confira", "clique aqui",
    "publicad", "licitacao", "edital", "portaria", "decreto",
    "resultado", "meta fisic", "meta prevista", "unidade de medida",
    "produto", "indice de referencia", "indice recente",
    "apuracao do indice", "periodicidade", "base geografica",
    "fonte do indicador", "orgao responsavel pelo indicador",
    "data de referencia", "polaridade", "formula de calculo",
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 10 || line.length > 400) continue;

    const lineNorm = normalize(line);

    // Rejeição rápida por termos proibidos
    if (REJEITAR_LINHA.some(t => lineNorm.includes(t))) continue;
    // Rejeitar linhas com muita pontuação (tabelas, listas genéricas)
    if (line.includes("...") || line.includes("…") || line.includes(";")) continue;
    if ((line.match(/,/g)?.length ?? 0) > 3) continue;
    // Rejeitar linhas que são apenas números ou valores monetários
    if (/^[\d\s\.,R\$%]+$/.test(line)) continue;

    // Contexto: 3 linhas antes e depois
    const ctxStart = Math.max(0, i - 3);
    const ctxEnd = Math.min(lines.length, i + 4);
    const contexto = lines.slice(ctxStart, ctxEnd).join(" ");

    // ═══ Padrão 1: "Programa XXXX — Nome" (com código obrigatório) ═══
    const progMatch = line.match(/Programa\s+(\d{3,5})\s*[—–\-:]\s*(.+)/i);
    if (progMatch) {
      const codigo = progMatch[1];
      const nome = progMatch[2].trim().substring(0, 200);
      const radical = encontrarRadical(nome) ?? encontrarRadical(contexto);
      if (radical) {
        const key = `prog_${codigo}`;
        if (!seen.has(key)) {
          seen.add(key);
          programas.push({
            nome: limparNome(`Programa ${codigo} — ${nome}`), codigo,
            dotacao_inicial: extrairValor(contexto),
            secretaria: extrairSecretaria(contexto),
            url_fonte: url, grupo: classificarGrupo(nome + " " + contexto),
            criterio: `Programa PPA código ${codigo}: radical "${radical}"`,
            ppa_cycle: ppaCycle,
          });
        }
      }
      continue;
    }

    // ═══ Padrão 2: "Ação/Atividade/Projeto XXXX — Nome" (com código obrigatório) ═══
    const acaoMatch = line.match(/(?:A[çc][ãa]o|Atividade|Projeto)\s+(\d{4,6})\s*[—–\-:]\s*(.+)/i);
    if (acaoMatch) {
      const codigo = acaoMatch[1];
      const nome = acaoMatch[2].trim().substring(0, 200);
      const radical = encontrarRadical(nome) ?? encontrarRadical(contexto);
      if (radical) {
        const key = `acao_${codigo}`;
        if (!seen.has(key)) {
          seen.add(key);
          programas.push({
            nome: limparNome(`Ação ${codigo} — ${nome}`), codigo,
            dotacao_inicial: extrairValor(contexto),
            secretaria: extrairSecretaria(contexto),
            url_fonte: url, grupo: classificarGrupo(nome + " " + contexto),
            criterio: `Ação PPA código ${codigo}: radical "${radical}"`,
            ppa_cycle: ppaCycle,
          });
        }
      }
      continue;
    }

    // ═══ Padrão 3: Secretarias/Órgãos temáticos conhecidos ═══
    const secPat = /(Secretaria\s+(?:de\s+|da\s+|do\s+)?(?:Promoção\s+da\s+Igualdade\s+Racial|Igualdade\s+Racial|Políticas\s+(?:para|de)\s+(?:Promoção|Igualdade)\s+Racial|Povos\s+Ind[íi]genas)|SEPROMI|SEPIR|SEPPIR|Fundação\s+(?:Cultural\s+)?Palmares)/i;
    const secMatch = line.match(secPat);
    if (secMatch) {
      const nomeSecretaria = secMatch[0].trim();
      const key = `sec_${normalize(nomeSecretaria).substring(0, 30)}`;
      if (!seen.has(key)) {
        seen.add(key);
        programas.push({
          nome: nomeSecretaria, codigo: null,
          dotacao_inicial: extrairValor(contexto),
          secretaria: nomeSecretaria, url_fonte: url,
          grupo: classificarGrupo(nomeSecretaria),
          criterio: `Secretaria/Órgão temático identificado no PPA`,
          ppa_cycle: ppaCycle,
        });
      }
    }
    // NÃO há Padrão 4 — apenas programas/ações com código ou secretarias conhecidas são aceitos
  }

  return programas;
}

function extrairSecretaria(texto: string): string | null {
  const m = texto.match(/(Secretaria\s+(?:de\s+|da\s+|do\s+)?\S+(?:\s+\S+){0,5})/i);
  return m ? m[1].trim().substring(0, 120) : null;
}

function extrairValor(texto: string): number | null {
  const patterns = [
    /R\$\s*([\d.,]+(?:\s*(?:milh[õo]es|milh[ãa]o|mil|bi))?)/i,
    /(?:dota[çc][ãa]o|valor|total|previsto|inicial)[:\s]*R?\$?\s*([\d.,]+)/i,
  ];
  for (const pat of patterns) {
    const m = texto.match(pat);
    if (m) {
      let raw = m[1].trim();
      const multiplier = raw.match(/milh[õo]es|milh[ãa]o/i) ? 1_000_000 :
        raw.match(/bil/i) ? 1_000_000_000 :
        raw.match(/\bm[i]l\b/i) ? 1_000 : 1;
      raw = raw.replace(/\s*(milh[õo]es|milh[ãa]o|mil|bi(?:lh[õo]es)?)\s*/i, "");
      const val = parseFloat(raw.replace(/\./g, "").replace(",", "."));
      if (!isNaN(val) && val > 0) {
        const result = val * multiplier;
        if (result > 500) return result;
      }
    }
  }
  return null;
}

// ════════════════════════════════════════════════════════════
// ETAPA 3: SICONFI — Execução F14 (referência agregada)
// NOTA: SICONFI organiza por Função/Subfunção, NÃO por programa.
// ════════════════════════════════════════════════════════════

async function buscarExecucaoF14(
  ufCode: number, ano: number,
): Promise<{ dotacao: number | null; empenhado: number | null; liquidado: number | null; pago: number | null; fonte: string; logs: string[] }> {
  const logs: string[] = [];
  for (let bim = 6; bim >= 1; bim--) {
    try {
      const params = new URLSearchParams({
        an_exercicio: String(ano), id_ente: String(ufCode),
        nr_periodo: String(bim), no_anexo: "RREO-Anexo 02",
        co_tipo_demonstrativo: "RREO", "$limit": "5000",
      });
      const res = await fetch(`https://apidatalake.tesouro.gov.br/ords/siconfi/tt/rreo?${params}`, {
        headers: { Accept: "application/json" }, signal: AbortSignal.timeout(20_000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const items: Record<string, unknown>[] = data?.items ?? [];
      if (items.length === 0) continue;
      const f14 = items.filter(i => normalize(String(i.conta ?? "")).includes("direitos da cidadania"));
      if (f14.length === 0) continue;
      let emp: number | null = null, liq: number | null = null, pag: number | null = null, dot: number | null = null;
      for (const item of f14) {
        const col = normalize(String(item.coluna ?? ""));
        const val = typeof item.valor === "number" ? item.valor : null;
        if (val === null) continue;
        if (col.includes("dotacao inicial")) dot = (dot ?? 0) + val;
        else if (col.includes("empenhadas ate o bimestre")) emp = (emp ?? 0) + val;
        else if (col.includes("liquidadas ate o bimestre")) liq = (liq ?? 0) + val;
        else if (col.includes("pagas ate o bimestre")) pag = (pag ?? 0) + val;
      }
      logs.push(`RREO bim${bim}: F14 dot=${dot?.toLocaleString() ?? "—"} emp=${emp?.toLocaleString() ?? "—"} liq=${liq?.toLocaleString() ?? "—"}`);
      return { dotacao: dot, empenhado: emp, liquidado: liq, pago: pag, fonte: `RREO Bim${bim}`, logs };
    } catch (e) { logs.push(`RREO bim${bim}: ${e instanceof Error ? e.message : "Erro"}`); }
  }
  // DCA fallback
  try {
    const params = new URLSearchParams({ an_exercicio: String(ano), id_ente: String(ufCode), no_anexo: "DCA-Anexo I-E", "$limit": "5000" });
    const res = await fetch(`https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca?${params}`, {
      headers: { Accept: "application/json" }, signal: AbortSignal.timeout(20_000),
    });
    if (res.ok) {
      const data = await res.json();
      const items: Record<string, unknown>[] = data?.items ?? [];
      const f14 = items.filter(i => { const c = normalize(String(i.conta ?? "")); return c.startsWith("14 ") || c.includes("direitos da cidadania"); });
      let emp: number | null = null, liq: number | null = null, dot: number | null = null;
      for (const item of f14) {
        const col = normalize(String(item.coluna ?? "")); const val = typeof item.valor === "number" ? item.valor : null;
        if (val === null) continue;
        if (col.includes("empenhad")) emp = (emp ?? 0) + val;
        else if (col.includes("liquidad")) liq = (liq ?? 0) + val;
        else if (col.includes("dotacao")) dot = (dot ?? 0) + val;
      }
      if (dot !== null || emp !== null) {
        logs.push(`DCA I-E: F14 dot=${dot?.toLocaleString() ?? "—"}`);
        return { dotacao: dot, empenhado: emp, liquidado: liq, pago: null, fonte: "DCA I-E", logs };
      }
    }
  } catch (e) { logs.push(`DCA I-E: ${e instanceof Error ? e.message : "Erro"}`); }
  return { dotacao: null, empenhado: null, liquidado: null, pago: null, fonte: "", logs };
}

// ════════════════════════════════════════════════════════════
// ETAPA 3b: Carregar DCA completo e fazer matching por programa
// ════════════════════════════════════════════════════════════

interface DCAItem {
  conta: string;
  coluna: string;
  valor: number | null;
}

async function carregarDCA(
  ufCode: number, ano: number,
): Promise<{ items: DCAItem[]; logs: string[] }> {
  const logs: string[] = [];
  const allItems: DCAItem[] = [];

  // Tentar DCA Anexo I-E (Despesas por Programa) — mais granular
  for (const anexo of ["DCA-Anexo I-E", "DCA-Anexo I-D"]) {
    try {
      const params = new URLSearchParams({
        an_exercicio: String(ano),
        id_ente: String(ufCode),
        no_anexo: anexo,
        "$limit": "10000",
      });
      const res = await fetch(
        `https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca?${params}`,
        { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(25_000) },
      );
      if (!res.ok) { logs.push(`${anexo} HTTP ${res.status}`); continue; }
      const data = await res.json();
      const items: Record<string, unknown>[] = data?.items ?? [];
      if (items.length === 0) { logs.push(`${anexo}: vazio`); continue; }

      for (const item of items) {
        allItems.push({
          conta: String(item.conta ?? ""),
          coluna: String(item.coluna ?? ""),
          valor: typeof item.valor === "number" ? item.valor : null,
        });
      }
      logs.push(`${anexo}: ${items.length} registros carregados`);
    } catch (e) {
      logs.push(`${anexo}: ${e instanceof Error ? e.message : "Erro"}`);
    }
  }

  return { items: allItems, logs };
}

interface ExecResult {
  empenhado: number | null;
  liquidado: number | null;
  dotacao: number | null;
  conta: string;
}

function matchExecucao(
  prog: ProgramaPPA, dcaItems: DCAItem[],
): ExecResult | null {
  if (dcaItems.length === 0) return null;

  // Strategy 1: Match by codigo if available
  if (prog.codigo) {
    const matched = dcaItems.filter(i => i.conta.includes(prog.codigo!));
    if (matched.length > 0) {
      return aggregateExec(matched);
    }
  }

  // Strategy 2: Match by keywords from program name
  const words = normalize(prog.nome)
    .replace(/programa\s+\d+\s*[—–\-:]\s*/i, "")
    .replace(/acao\s+\d+\s*[—–\-:]\s*/i, "")
    .split(/\s+/)
    .filter(w => w.length > 4);

  if (words.length === 0) return null;

  // Need at least 2 key words to match (or 1 if very specific)
  const candidates = dcaItems.filter(item => {
    const contaNorm = normalize(item.conta);
    const matchCount = words.filter(w => contaNorm.includes(w)).length;
    return matchCount >= Math.min(2, words.length);
  });

  if (candidates.length > 0) {
    return aggregateExec(candidates);
  }

  return null;
}

function aggregateExec(items: DCAItem[]): ExecResult {
  let emp: number | null = null;
  let liq: number | null = null;
  let dot: number | null = null;
  let conta = "";

  for (const item of items) {
    const col = normalize(item.coluna);
    if (item.valor === null) continue;
    if (!conta && item.conta) conta = item.conta;
    if (col.includes("empenhad")) emp = (emp ?? 0) + item.valor;
    else if (col.includes("liquidad")) liq = (liq ?? 0) + item.valor;
    else if (col.includes("dotacao") || col.includes("credito inicial")) dot = (dot ?? 0) + item.valor;
  }

  return { empenhado: emp, liquidado: liq, dotacao: dot, conta };
}

// ════════════════════════════════════════════════════════════
// HANDLER
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

    const { cod: ufCode, nome: nomeEstado, dominio } = ESTADOS_IBGE[uf];
    const firecrawlKey = Deno.env.get("FIRECRAWL_API_KEY");
    if (!firecrawlKey) {
      return new Response(JSON.stringify({ success: false, error: "FIRECRAWL_API_KEY não configurada." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    console.log(`=== Ingestão PPA ${uf} (${nomeEstado}) | Anos: ${anos.join(",")} | ${mode} ===`);

    const allLogs: string[] = [];
    const allErros: string[] = [];

    // ── ETAPA 1: Localizar documentos PPA + extração direta da busca ──
    allLogs.push("─── ETAPA 1: Localizando documentos PPA ───");
    const { docs, programasFromSearch, logs: searchLogs } = await localizarPPAs(nomeEstado, dominio, firecrawlKey);
    allLogs.push(...searchLogs);

    // ── ETAPA 2: Scrape profundo (apenas docs curtos na busca) + extração ──
    allLogs.push("─── ETAPA 2: Scrape e extração de programas ───");
    const todosProgramas: ProgramaPPA[] = [...programasFromSearch];
    const seenProgs = new Set<string>();
    for (const p of programasFromSearch) seenProgs.add(normalize(p.nome).substring(0, 60));

    // Limitar a 3 docs para não exceder timeout
    const docsToScrape = docs.slice(0, 3);
    for (const doc of docsToScrape) {
      const { programas, log } = await scrapeEExtrair(doc, firecrawlKey);
      allLogs.push(log);

      for (const p of programas) {
        const key = normalize(p.nome).substring(0, 60);
        if (!seenProgs.has(key)) {
          seenProgs.add(key);
          todosProgramas.push(p);
        }
      }
      await new Promise(r => setTimeout(r, 500));
    }
    allLogs.push(`Total: ${todosProgramas.length} programas/ações únicos extraídos dos PPAs`);

    // ── ETAPA 3: Cruzamento SICONFI por programa/ação ──
    allLogs.push("─── ETAPA 3: Cruzamento SICONFI por programa ───");
    const registros: Record<string, unknown>[] = [];

    for (const ano of anos) {
      // Carregar todo o DCA do ano para matching local
      const { items: dcaItems, logs: dcaLogs } = await carregarDCA(ufCode, ano);
      allLogs.push(...dcaLogs.map(l => `SICONFI/${ano}: ${l}`));

      let matchCount = 0;

      for (const prog of todosProgramas) {
        // Tentar encontrar execução correspondente no DCA
        const exec = matchExecucao(prog, dcaItems);

        const empenhado = exec?.empenhado ?? null;
        const liquidado = exec?.liquidado ?? null;
        const dotIni = prog.dotacao_inicial ?? exec?.dotacao ?? null;
        let pctExec: number | null = null;
        if (dotIni && dotIni > 0 && liquidado !== null)
          pctExec = Math.round((liquidado / dotIni) * 10000) / 100;

        if (exec) matchCount++;

        registros.push({
          programa: `${uf} — ${prog.nome}`.substring(0, 250),
          orgao: prog.secretaria ?? `Gov. Estadual (${uf})`,
          esfera: "estadual", ano,
          dotacao_inicial: dotIni, dotacao_autorizada: null,
          empenhado, liquidado, pago: null, percentual_execucao: pctExec,
          fonte_dados: exec
            ? `PPA + SICONFI DCA (${nomeEstado})`
            : `PPA ${nomeEstado} (${prog.ppa_cycle})`,
          url_fonte: prog.url_fonte,
          descritivo: prog.codigo ? `Código: ${prog.codigo} | ${prog.nome}` : prog.nome,
          observacoes: prog.grupo, eixo_tematico: null, grupo_focal: null, publico_alvo: null,
          razao_selecao: exec
            ? `${prog.criterio} | Exec. SICONFI: "${exec.conta.substring(0, 80)}"`
            : `${prog.criterio} | ${prog.ppa_cycle}`,
        });
      }

      allLogs.push(`SICONFI/${ano}: ${matchCount}/${todosProgramas.length} programas com execução encontrada`);
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
        total_programas_ppa: todosProgramas.length,
        total_registros: batch.length,
        por_grupo_etnico: porGrupo,
        documentos_scrapeados: docsToScrape.map(d => ({ url: d.url, cycle: d.cycle, title: d.title })),
        programas_ppa: todosProgramas.map(p => ({
          nome: p.nome, codigo: p.codigo, dotacao_inicial: p.dotacao_inicial,
          secretaria: p.secretaria, grupo: p.grupo, criterio: p.criterio,
          ppa: p.ppa_cycle, url: p.url_fonte,
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
      total_inseridos: totalInserted, total_programas_ppa: todosProgramas.length,
      por_grupo_etnico: porGrupo,
      log_consultas: allLogs.slice(0, 30), erros: allErros.slice(0, 10),
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    console.error("Fatal:", error);
    return new Response(JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

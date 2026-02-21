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
// BUSCA DIRECIONADA POR GRUPO TEMÁTICO
// ════════════════════════════════════════════════════════════

interface BuscaTematica {
  grupo: string;
  termos: string[];  // termos de busca para Firecrawl
  radicais: string[]; // para validar no conteúdo retornado
}

const BUSCAS: BuscaTematica[] = [
  {
    grupo: "Negro/Afrodescendente",
    termos: [
      "igualdade racial", "antirracista", "promoção da igualdade racial",
      "consciência negra", "enfrentamento ao racismo", "discriminação racial",
      "matriz africana", "candomblé", "capoeira afro",
    ],
    radicais: ["racial", "racis", "negr", "afro", "afrodescend", "palmares", "seppir", "candombl", "umbanda", "matriz african"],
  },
  {
    grupo: "Indígena",
    termos: [
      "indígena", "povos indígenas", "terra indígena", "saúde indígena",
      "educação indígena", "FUNAI", "SESAI",
    ],
    radicais: ["indigen", "funai", "sesai", "povos originari"],
  },
  {
    grupo: "Quilombola",
    termos: ["quilombola", "comunidades quilombolas", "remanescentes de quilombo"],
    radicais: ["quilombol", "quilombo"],
  },
  {
    grupo: "Comunidade Tradicional",
    termos: ["povos tradicionais", "comunidades tradicionais", "povos e comunidades tradicionais"],
    radicais: ["comunidades tradicion", "povos tradicion"],
  },
  {
    grupo: "Cigano/Roma",
    termos: ["cigano", "povo cigano", "comunidades ciganas"],
    radicais: ["cigan", "romani"],
  },
];

// Padrões para rejeitar URLs que NÃO são documentos PPA/orçamentários
const URL_REJEICAO = [
  "/noticias/", "/noticia/", "/news/", "/blog/", "/imprensa/",
  "/doe/", "/diariooficial/", "/licitacao/", "/edital/",
  "/concurso/", "/processo-seletivo/",
];

function normalize(t: string): string {
  return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function isUrlRelevante(url: string): boolean {
  const lower = url.toLowerCase();
  for (const pat of URL_REJEICAO) {
    if (lower.includes(pat)) return false;
  }
  return true;
}

function isGovDomain(url: string): boolean {
  try {
    const host = new URL(url).hostname.toLowerCase();
    return host.endsWith(".gov.br") || host.endsWith(".leg.br") || host.endsWith(".jus.br");
  } catch { return false; }
}

/** Limpa nomes de programas removendo artefatos de scraping */
function limparNome(nome: string): string {
  return nome
    .replace(/^\[PDF\]\s*/i, "")
    .replace(/\s*-\s*(?:BA|SP|RJ|MG|RS|PR|SC|PE|CE|GO|PA|MA|MT|MS|AM|RN|PB|PI|SE|AL|RO|AC|AP|RR|TO|DF|ES)\s*(?:\.?\s*Gov\b)?\.?\s*$/i, "")
    .replace(/\s*\.\s*$/, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\.\s*\d+\s*Relat[óo]rio.*$/i, "")
    .replace(/,\s*conforme\s+o\s+PPA.*$/i, "")
    .trim()
    .substring(0, 200);
}

// ════════════════════════════════════════════════════════════
// EXTRAÇÃO DE PROGRAMAS/AÇÕES DO CONTEÚDO
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

/** Extrai programas/ações/secretarias do conteúdo de um resultado de busca */
function extrairProgramas(
  content: string, url: string, grupo: string, radicais: string[], ppaCycle: string,
): ProgramaPPA[] {
  const programas: ProgramaPPA[] = [];
  const seen = new Set<string>();
  const norm = normalize(content);

  // Verificar se o conteúdo realmente contém termos relevantes
  const hasRelevantContent = radicais.some(r => norm.includes(r));
  if (!hasRelevantContent) return [];

  const lines = content.split(/\n/);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.length < 5 || line.length > 500) continue;
    const lineNorm = normalize(line);

    // ── Padrão 1: "Programa XXXX — Nome" ou "Programa XXXX - Nome" ──
    const progMatch = line.match(/Programa\s+(\d{3,5})\s*[—–\-:]\s*(.+)/i);
    if (progMatch) {
      const codigo = progMatch[1];
      const nome = progMatch[2].trim().substring(0, 200);
      // Verificar se o nome contém termos relevantes OU está próximo de conteúdo relevante
      const contexto = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 5)).join(" ");
      const contextoNorm = normalize(contexto);
      const temRadical = radicais.some(r => contextoNorm.includes(r));
      if (temRadical) {
        const key = `prog_${codigo}`;
        if (!seen.has(key)) {
          seen.add(key);
          const criterioRadical = radicais.find(r => contextoNorm.includes(r)) ?? "";
          // Tentar extrair dotação do contexto
          const dotacao = extrairValor(contexto);
          programas.push({
            nome: limparNome(`Programa ${codigo} — ${nome}`), codigo, dotacao_inicial: dotacao,
            secretaria: null, url_fonte: url, grupo,
            criterio: `Programa PPA: "${criterioRadical}" encontrado no contexto`,
            ppa_cycle: ppaCycle,
          });
        }
      }
    }

    // ── Padrão 2: "Ação XXXX — Nome" ou "XXXX - Nome da Ação" (dentro de contexto racial) ──
    const acaoMatch = line.match(/(?:A[çc][ãa]o|Atividade|Projeto)\s+(\d{4,6})\s*[—–\-:]\s*(.+)/i);
    if (acaoMatch) {
      const codigo = acaoMatch[1];
      const nome = acaoMatch[2].trim().substring(0, 200);
      const contexto = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 5)).join(" ");
      const contextoNorm = normalize(contexto);
      const temRadical = radicais.some(r => contextoNorm.includes(r));
      if (temRadical) {
        const key = `acao_${codigo}`;
        if (!seen.has(key)) {
          seen.add(key);
          const criterioRadical = radicais.find(r => contextoNorm.includes(r)) ?? "";
          const dotacao = extrairValor(contexto);
          programas.push({
            nome: limparNome(`Ação ${codigo} — ${nome}`), codigo, dotacao_inicial: dotacao,
            secretaria: null, url_fonte: url, grupo,
            criterio: `Ação PPA: "${criterioRadical}" no contexto`,
            ppa_cycle: ppaCycle,
          });
        }
      }
    }

    // ── Padrão 3: Secretarias relevantes (SEPROMI, SEPIR, FUNAI, etc.) ──
    const secMatch = line.match(/(Secretaria\s+(?:de\s+|da\s+|do\s+)?(?:Promoção\s+da\s+Igualdade\s+Racial|Igualdade\s+Racial|Justiça\s+e\s+Igualdade\s+Racial|Políticas\s+(?:para|de)\s+(?:Promoção|Igualdade)|Povos\s+Ind[íi]genas)|SEPROMI|SEPIR|SEPPIR|FUNAI|SESAI|INCRA|Fundação\s+(?:Cultural\s+)?Palmares)/i);
    if (secMatch) {
      const nomeSecretaria = secMatch[1] || secMatch[0];
      const key = `sec_${normalize(nomeSecretaria).substring(0, 30)}`;
      if (!seen.has(key)) {
        seen.add(key);
        const contexto = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 5)).join(" ");
        const dotacao = extrairValor(contexto);
        programas.push({
          nome: nomeSecretaria.trim(), codigo: null, dotacao_inicial: dotacao,
          secretaria: nomeSecretaria.trim(), url_fonte: url, grupo,
          criterio: `Secretaria/Órgão identificado no PPA`,
          ppa_cycle: ppaCycle,
        });
      }
    }

    // ── Padrão 4: Linhas que contêm radicais + parecem ser títulos de programa ──
    // Linhas que NÃO são parágrafos longos de texto corrido
    if (line.length < 150 && !progMatch && !acaoMatch && !secMatch) {
      const temRadical = radicais.some(r => lineNorm.includes(r));
      if (temRadical) {
        // Verificar se parece título de programa/ação (não texto corrido)
        const parecePrograma = /^[\d\.\)\-\|#\*]*\s*[A-ZÁÉÍÓÚÂÊÔÃ]/.test(line) ||
          lineNorm.includes("programa") || lineNorm.includes("acao") ||
          lineNorm.includes("projeto") || lineNorm.includes("atividade") ||
          lineNorm.includes("objetivo") || lineNorm.includes("meta");

        // Rejeitar texto corrido, snippets, notícias
        const pareceNoticia = lineNorm.includes("publicad") || lineNorm.includes("confira") ||
          lineNorm.includes("saiba mais") || lineNorm.includes("clique") ||
          lineNorm.includes("acesse") || lineNorm.includes("leia");
        const pareceSnippet = line.includes("...") || line.includes("…") ||
          (line.match(/,/g)?.length ?? 0) > 3 || (line.match(/\./g)?.length ?? 0) > 3;

        if (parecePrograma && !pareceNoticia && !pareceSnippet) {
          // Tentar extrair código
          const cMatch = line.match(/(\d{3,6})/);
          const codigo = cMatch ? cMatch[1] : null;
          const nome = limparNome(line.replace(/^\|?\s*/, "").replace(/\|.*$/, "")
            .replace(/^\*+\s*/, "").replace(/^#+\s*/, "")
            .replace(/^\d+[\.\)]\s*/, "").trim());
          const key = `gen_${normalize(nome).substring(0, 50)}`;
          if (!seen.has(key) && nome.length > 8) {
            seen.add(key);
            const criterioRadical = radicais.find(r => lineNorm.includes(r)) ?? "";
            const contexto = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join(" ");
            const dotacao = extrairValor(contexto);
            programas.push({
              nome, codigo, dotacao_inicial: dotacao,
              secretaria: null, url_fonte: url, grupo,
              criterio: `Título PPA contém: "${criterioRadical}"`,
              ppa_cycle: ppaCycle,
            });
          }
        }
      }
    }
  }

  return programas;
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
      // Handle "milhões", "mil" etc
      const multiplier = raw.match(/milh[õo]es|milh[ãa]o/i) ? 1_000_000 :
        raw.match(/bil/i) ? 1_000_000_000 :
        raw.match(/\bm[i]l\b/i) ? 1_000 : 1;
      raw = raw.replace(/\s*(milh[õo]es|milh[ãa]o|mil|bi(?:lh[õo]es)?)\s*/i, "");
      const val = parseFloat(raw.replace(/\./g, "").replace(",", "."));
      if (!isNaN(val) && val > 0) {
        const result = val * multiplier;
        if (result > 500) return result; // mínimo R$500 para filtrar ruído
      }
    }
  }
  return null;
}

// ════════════════════════════════════════════════════════════
// BUSCA PRINCIPAL: Firecrawl Search com queries temáticas
// ════════════════════════════════════════════════════════════

async function buscarProgramasPPA(
  uf: string, nomeEstado: string, dominio: string, firecrawlKey: string,
): Promise<{ programas: ProgramaPPA[]; logs: string[]; erros: string[] }> {
  const programas: ProgramaPPA[] = [];
  const logs: string[] = [];
  const erros: string[] = [];
  const seenKeys = new Set<string>();

  // Queries consolidadas: 2 por ciclo PPA (racial + indígena/quilombola)
  const queries: { query: string; cycle: string }[] = [
    // PPA 2024-2027
    { query: `PPA 2024 2027 ${nomeEstado} programa "igualdade racial" OR "quilombola" OR "indígena" OR "comunidades tradicionais" site:${dominio}`, cycle: "PPA 2024-2027" },
    { query: `"plano plurianual" 2024-2027 ${nomeEstado} programa racial OR étnico OR SEPROMI OR "povos tradicionais" site:*.gov.br`, cycle: "PPA 2024-2027" },
    // PPA 2020-2023
    { query: `PPA 2020 2023 ${nomeEstado} programa "igualdade racial" OR "quilombola" OR "indígena" OR "comunidades tradicionais" site:${dominio}`, cycle: "PPA 2020-2023" },
    { query: `"plano plurianual" 2020-2023 ${nomeEstado} programa racial OR étnico OR SEPROMI OR "povos tradicionais" site:*.gov.br`, cycle: "PPA 2020-2023" },
    // PPA 2016-2019
    { query: `PPA 2016 2019 ${nomeEstado} programa "igualdade racial" OR "quilombola" OR "indígena" site:${dominio}`, cycle: "PPA 2016-2019" },
    { query: `"plano plurianual" 2016-2019 ${nomeEstado} programa racial OR étnico site:*.gov.br`, cycle: "PPA 2016-2019" },
  ];

  // Todas as radicais unificadas para validação no conteúdo
  const todosRadicais = BUSCAS.flatMap(b => b.radicais);

  for (const { query, cycle } of queries) {
    try {
      console.log(`  Search: ${query.substring(0, 100)}...`);
      const res = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: { Authorization: `Bearer ${firecrawlKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          query, limit: 5, lang: "pt-BR", country: "BR",
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        if (res.status === 429) {
          logs.push(`Rate limit, pausando 5s...`);
          await new Promise(r => setTimeout(r, 5000));
        } else {
          logs.push(`Search HTTP ${res.status} para ${cycle}`);
        }
        continue;
      }

      const data = await res.json();
      const results = data?.data ?? [];
      let accepted = 0;

      for (const r of results) {
        const url = String(r.url ?? "");
        const title = String(r.title ?? "");
        const desc = String(r.description ?? "");
        const md = String(r.markdown ?? "");
        const content = [title, desc, md].filter(Boolean).join("\n");
        if (!url || !isUrlRelevante(url) || !isGovDomain(url) || content.length < 20) continue;
        if (!url || !isUrlRelevante(url) || !isGovDomain(url)) continue;

        // Extrair para TODOS os grupos étnicos de uma vez
        for (const busca of BUSCAS) {
          const extracted = extrairProgramas(content, url, busca.grupo, busca.radicais, cycle);
          for (const prog of extracted) {
            const key = normalize(prog.nome).substring(0, 60);
            if (!seenKeys.has(key)) {
              seenKeys.add(key);
              programas.push(prog);
              accepted++;
            }
          }
        }
      }

      logs.push(`${cycle}: ${results.length} resultados, ${accepted} programas aceitos`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erro";
      erros.push(`Search ${cycle}: ${msg}`);
    }
    await new Promise(r => setTimeout(r, 600));
  }

  logs.push(`Total: ${programas.length} programas/ações PPA identificados para ${uf}`);
  return { programas, logs, erros };
}

// ════════════════════════════════════════════════════════════
// SICONFI — Execução Função 14 (agregado)
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
        headers: { Accept: "application/json" }, signal: AbortSignal.timeout(25_000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const items: Record<string, unknown>[] = data?.items ?? [];
      if (items.length === 0) continue;

      const f14Items = items.filter(i => normalize(String(i.conta ?? "")).includes("direitos da cidadania"));
      if (f14Items.length === 0) continue;

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
      logs.push(`RREO bim${bim}: F14 dot=${dotacao?.toLocaleString() ?? "—"} emp=${empenhado?.toLocaleString() ?? "—"} liq=${liquidado?.toLocaleString() ?? "—"}`);
      return { empenhado, liquidado, pago, dotacao, logs };
    } catch (e) {
      logs.push(`RREO bim${bim}: ${e instanceof Error ? e.message : "Erro"}`);
    }
  }

  // DCA fallback
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
    const registros: Record<string, unknown>[] = [];

    // ── ETAPA 1-3: Buscar programas PPA com keywords raciais/étnicas ──
    const { programas, logs: ppaLogs, erros: ppaErros } = await buscarProgramasPPA(uf, nomeEstado, dominio, firecrawlKey);
    allLogs.push(...ppaLogs);
    allErros.push(...ppaErros);

    // ── ETAPA 4: Cruzamento SICONFI para execução ──
    for (const ano of anos) {
      const { empenhado, liquidado, pago, dotacao: dotSiconfi, logs: siconfiLogs } =
        await buscarExecucaoSICONFI(ufCode, ano);
      allLogs.push(...siconfiLogs.map(l => `SICONFI/${ano}: ${l}`));

      // Criar registros para cada programa PPA encontrado
      for (const prog of programas) {
        registros.push({
          programa: `${uf} — ${prog.nome}`.substring(0, 250),
          orgao: prog.secretaria ?? `Gov. Estadual (${uf})`,
          esfera: "estadual", ano,
          dotacao_inicial: prog.dotacao_inicial, dotacao_autorizada: null,
          empenhado: null, liquidado: null, pago: null, percentual_execucao: null,
          fonte_dados: `PPA ${nomeEstado} (${prog.ppa_cycle})`,
          url_fonte: prog.url_fonte,
          descritivo: prog.codigo ? `Código: ${prog.codigo} | ${prog.nome}` : prog.nome,
          observacoes: prog.grupo, eixo_tematico: null, grupo_focal: null, publico_alvo: null,
          razao_selecao: `${prog.criterio} | ${prog.ppa_cycle}`,
        });
      }

      // Registro agregado SICONFI F14 (referência)
      if (dotSiconfi !== null || empenhado !== null) {
        let pctExec: number | null = null;
        if (dotSiconfi && dotSiconfi > 0 && liquidado !== null)
          pctExec = Math.round((liquidado / dotSiconfi) * 10000) / 100;

        registros.push({
          programa: `${uf} — Função 14: Direitos da Cidadania (SICONFI)`.substring(0, 250),
          orgao: `Gov. Estadual (${uf})`, esfera: "estadual", ano,
          dotacao_inicial: dotSiconfi, dotacao_autorizada: null,
          empenhado, liquidado, pago, percentual_execucao: pctExec,
          fonte_dados: `SICONFI RREO/DCA — ${uf}`,
          url_fonte: "https://siconfi.tesouro.gov.br",
          descritivo: "Função 14 — Direitos da Cidadania (execução agregada estadual)",
          observacoes: "Referência SICONFI", eixo_tematico: null, grupo_focal: null, publico_alvo: null,
          razao_selecao: "SICONFI Função 14 — referência de execução agregada",
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
        total_programas_ppa: programas.length,
        total_registros: batch.length,
        por_grupo_etnico: porGrupo,
        programas_ppa: programas.map(p => ({
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

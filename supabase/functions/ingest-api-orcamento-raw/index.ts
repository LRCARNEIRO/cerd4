import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { unzipSync } from "https://esm.sh/fflate@0.8.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const API_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";

/**
 * BASE BRUTA DE AUDITAGEM — Ações, Programas e Dotações
 * Etapa 1: /despesas/por-funcional-programatica (ano + programa) → execução
 *          (empenhado / liquidado / pago). A API NÃO devolve dotação.
 * Etapa 2: ZIP oficial "orcamento-despesa/<ano>" (Dados Abertos) → dotação
 *          inicial e atualizada, agregada por programa+ação.
 * Grava o retorno original em public.orcamento_api_raw. Um ano por chamada.
 */


const PROGRAMAS_PADRAO = [
  "0032", "0151", "0617", "0910", "1041", "1189", "1617", "2034", "2065",
  "2078", "2112", "2316", "5022", "5034", "5122", "5136", "5802", "5803",
  "5804", "5838", "6011", "6111", "6114",
];

function num(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return Number.isFinite(val) ? val : null;
  const s = String(val).trim();
  if (!s) return null;
  const n = Number(s.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function pick(obj: any, ...keys: string[]): any {
  for (const k of keys) {
    const v = obj?.[k];
    if (v !== undefined && v !== null && v !== "") return v;
  }
  return null;
}

function mapRow(ano: number, item: any, consulta: string) {
  const prog = item.programaOrcamentario ?? item.programa ?? {};
  const acao = item.acao ?? {};
  const orgao = item.orgao ?? item.orgaoSuperior ?? {};
  const uo = item.unidadeOrcamentaria ?? {};
  const funcao = item.funcao ?? {};
  const subfuncao = item.subfuncao ?? {};

  return {
    ano,
    codigo_programa: String(
      pick(item, "codigoPrograma", "codigoProgramaOrcamentario") ?? prog.codigo ?? "",
    ),
    nome_programa: pick(item, "nomePrograma", "programaOrcamentarioNome") ?? prog.descricao ?? prog.nome ?? null,
    codigo_acao: String(pick(item, "codigoAcao") ?? acao.codigo ?? ""),
    nome_acao: pick(item, "nomeAcao") ?? acao.descricao ?? acao.nome ?? null,
    codigo_orgao: String(pick(item, "codigoOrgao", "codigoOrgaoSuperior") ?? orgao.codigo ?? ""),
    nome_orgao: pick(item, "nomeOrgao", "nomeOrgaoSuperior") ?? orgao.descricao ?? orgao.nome ?? null,
    codigo_unidade_orcamentaria: String(
      pick(item, "codigoUnidadeOrcamentaria") ?? uo.codigo ?? "",
    ),
    nome_unidade_orcamentaria:
      pick(item, "nomeUnidadeOrcamentaria") ?? uo.descricao ?? uo.nome ?? null,
    codigo_funcao: String(pick(item, "codigoFuncao") ?? funcao.codigo ?? "") || null,
    nome_funcao: pick(item, "nomeFuncao") ?? funcao.descricao ?? null,
    codigo_subfuncao: String(pick(item, "codigoSubfuncao") ?? subfuncao.codigo ?? "") || null,
    nome_subfuncao: pick(item, "nomeSubfuncao") ?? subfuncao.descricao ?? null,
    dotacao_inicial: num(pick(item, "dotacaoInicial", "valorDotacaoInicial", "orcamentoInicial")),
    dotacao_atualizada: num(
      pick(item, "dotacaoAtualizada", "valorDotacaoAtualizada", "orcamentoAtualizado", "orcamentoRealizado"),
    ),
    empenhado: num(pick(item, "empenhado", "valorEmpenhado", "orcamentoEmpenhado")),
    liquidado: num(pick(item, "liquidado", "valorLiquidado", "orcamentoLiquidado")),
    pago: num(pick(item, "pago", "valorPago", "orcamentoPago", "orcamentoRealizadoPago")),
    consulta_parametro: consulta,
    payload: item,
    coletado_em: new Date().toISOString(),
  };
}

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "", q = false;
  for (const c of line) {
    if (c === '"') q = !q;
    else if (c === ";" && !q) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out;
}

/** Baixa o ZIP oficial da despesa orçamentária e indexa dotações por programa|ação. */
async function baixarDotacoesLOA(ano: number) {
  const index = new Map<string, { inicial: number; atualizada: number }>();
  const url = `https://portaldatransparencia.gov.br/download-de-dados/orcamento-despesa/${ano}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; CERD-IV/1.0)", Accept: "*/*" },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const unzipped = unzipSync(new Uint8Array(await res.arrayBuffer()));
  const csvFile = Object.keys(unzipped).find(f => f.toLowerCase().endsWith(".csv"));
  if (!csvFile) throw new Error("ZIP sem CSV");

  const bytes = unzipped[csvFile];
  let text = new TextDecoder("utf-8").decode(bytes);
  if (text.includes("\uFFFD")) text = new TextDecoder("latin1").decode(bytes);

  const lines = text.split("\n");
  if (lines.length < 2) throw new Error("CSV vazio");

  const cols = parseCSVLine(lines[0]).map(c => c.replace(/"/g, "").trim().toUpperCase());
  const h: Record<string, number> = {};
  cols.forEach((c, i) => { h[c] = i; });

  const cIni = h["ORÇAMENTO INICIAL (R$)"] ?? h["ORCAMENTO INICIAL (R$)"] ?? h["DOTAÇÃO INICIAL (R$)"] ?? -1;
  const cAtu = h["ORÇAMENTO ATUALIZADO (R$)"] ?? h["ORCAMENTO ATUALIZADO (R$)"] ?? h["DOTAÇÃO ATUALIZADA (R$)"] ?? -1;
  const cProg = h["CÓDIGO PROGRAMA ORÇAMENTÁRIO"] ?? h["CODIGO PROGRAMA ORCAMENTARIO"] ?? h["CÓDIGO PROGRAMA"] ?? -1;
  const cAcao = h["CÓDIGO AÇÃO"] ?? h["CODIGO ACAO"] ?? -1;
  if (cProg === -1 || (cIni === -1 && cAtu === -1)) throw new Error("colunas não encontradas");

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const c = parseCSVLine(lines[i]);
    const prog = c[cProg]?.replace(/"/g, "").trim();
    if (!prog) continue;
    const acao = cAcao >= 0 ? (c[cAcao]?.replace(/"/g, "").trim() ?? "") : "";
    const ini = cIni >= 0 ? (num(c[cIni]) ?? 0) : 0;
    const atu = cAtu >= 0 ? (num(c[cAtu]) ?? 0) : 0;
    for (const key of [`${prog}|${acao}`, `${prog}|`]) {
      const e = index.get(key);
      if (e) { e.inicial += ini; e.atualizada += atu; }
      else index.set(key, { inicial: ini, atualizada: atu });
    }
  }
  return index;
}

Deno.serve(async (req) => {

  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const ano: number = Number(body.ano) || new Date().getFullYear();
    const programas: string[] = Array.isArray(body.programas) && body.programas.length
      ? body.programas.map(String)
      : PROGRAMAS_PADRAO;

    const apiKey = Deno.env.get("PORTAL_TRANSPARENCIA_API_KEY");
    if (!apiKey) {
      return new Response(JSON.stringify({ success: false, error: "PORTAL_TRANSPARENCIA_API_KEY ausente" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const modo: string = body.modo === "dotacao" ? "dotacao" : "execucao";
    const rows = new Map<string, any>();
    const erros: string[] = [];
    const detalhes: Record<string, number> = {};

    if (modo === "execucao") {
      for (const prog of programas) {
        let page = 1;
        let count = 0;
        while (page <= 30) {
          const url = `${API_BASE}/despesas/por-funcional-programatica?ano=${ano}&programa=${prog}&pagina=${page}`;
          try {
            const res = await fetch(url, { headers: { "chave-api-dados": apiKey, Accept: "application/json" } });
            if (res.status === 429) { await new Promise(r => setTimeout(r, 20000)); continue; }
            if (!res.ok) { if (page === 1) erros.push(`HTTP ${res.status} programa ${prog}`); break; }
            const data = await res.json();
            if (!Array.isArray(data) || data.length === 0) break;

            for (const item of data) {
              const row = mapRow(ano, item, `programa=${prog}`);
              if (!row.codigo_programa) row.codigo_programa = prog;
              const key = [row.ano, row.codigo_programa, row.codigo_acao, row.codigo_orgao, row.codigo_unidade_orcamentaria].join("|");
              rows.set(key, row);
              count++;
            }
            if (data.length < 15) break;
            page++;
            await new Promise(r => setTimeout(r, 300));
          } catch (e) {
            erros.push(`programa ${prog} p${page}: ${e}`);
            break;
          }
        }
        detalhes[prog] = count;
        await new Promise(r => setTimeout(r, 300));
      }
    }

    const all = Array.from(rows.values());
    let gravados = 0;
    for (let i = 0; i < all.length; i += 300) {
      const chunk = all.slice(i, i + 300);
      const { error } = await supabase
        .from("orcamento_api_raw")
        .upsert(chunk, { onConflict: "ano,codigo_programa,codigo_acao,codigo_orgao,codigo_unidade_orcamentaria" });
      if (error) erros.push(`upsert: ${error.message}`);
      else gravados += chunk.length;
    }

    // ETAPA 2 — Dotações (LOA / Dados Abertos)
    let dotacoes_atualizadas = 0;
    if (modo === "dotacao") {
      try {
        const { data: existentes } = await supabase
          .from("orcamento_api_raw")
          .select("ano, codigo_programa, codigo_acao")
          .eq("ano", ano);

        const alvo = existentes || [];
        const dotIndex = await baixarDotacoesLOA(ano);
        if (dotIndex.size === 0) erros.push("LOA: nenhuma dotação indexada");

        const vistos = new Set<string>();
        for (const row of alvo) {
          const k = `${row.codigo_programa}|${row.codigo_acao}`;
          if (vistos.has(k)) continue;
          vistos.add(k);
          const dot = dotIndex.get(k) ?? dotIndex.get(`${row.codigo_programa}|`);
          if (!dot || (!dot.inicial && !dot.atualizada)) continue;
          const { error } = await supabase
            .from("orcamento_api_raw")
            .update({
              dotacao_inicial: dot.inicial || null,
              dotacao_atualizada: dot.atualizada || null,
              fonte_dotacao: `LOA/Dados Abertos ${ano}`,
            })
            .eq("ano", ano)
            .eq("codigo_programa", row.codigo_programa)
            .eq("codigo_acao", row.codigo_acao);
          if (!error) dotacoes_atualizadas++;
        }
      } catch (e) {
        erros.push(`LOA: ${e}`);
      }
    }


    return new Response(JSON.stringify({
      success: true, ano, programas_consultados: programas.length,
      registros_coletados: all.length, registros_gravados: gravados,
      dotacoes_atualizadas, detalhes, erros,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

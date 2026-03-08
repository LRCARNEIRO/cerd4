import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * INGESTÃO TESTE — Marcadores de Agenda Transversal (PPA 2024-2027)
 * 
 * Busca dados de dotação e execução dos programas oficialmente marcados nas
 * Agendas Transversais de Igualdade Racial e Povos Indígenas, via API do
 * Portal da Transparência. Apenas anos 2024 e 2025.
 * 
 * Os registros são inseridos com fonte_dados = "Agenda Transversal TESTE"
 * para diferenciar da ingestão principal.
 */

interface AgendaPrograma {
  codigo: string;
  nome: string;
  orgao_codigo: string;
  orgao_nome: string;
  agenda: "racial" | "indigena";
}

const AGENDA_PROGRAMAS: AgendaPrograma[] = [
  // Agenda Racial
  { codigo: "1189", nome: "Bioeconomia para um Novo Ciclo de Prosperidade", orgao_codigo: "44000", orgao_nome: "MMA", agenda: "racial" },
  { codigo: "2224", nome: "Planejamento e Orçamento para o Desenvolvimento Sustentável e Inclusivo", orgao_codigo: "47000", orgao_nome: "MPO", agenda: "racial" },
  { codigo: "2301", nome: "Transformação do Estado para a Cidadania e o Desenvolvimento", orgao_codigo: "46000", orgao_nome: "MGI", agenda: "racial" },
  { codigo: "2304", nome: "Ciência, Tecnologia e Inovação para o Desenvolvimento Social", orgao_codigo: "24000", orgao_nome: "MCTI", agenda: "racial" },
  { codigo: "2308", nome: "Consolidação do Sistema Nacional de Ciência, Tecnologia e Inovação – SNCTI", orgao_codigo: "24000", orgao_nome: "MCTI", agenda: "racial" },
  { codigo: "2310", nome: "Promoção do Trabalho Decente, Emprego e Renda", orgao_codigo: "40000", orgao_nome: "MTE", agenda: "racial" },
  { codigo: "2316", nome: "Relações Internacionais e Assistência a Brasileiras e Brasileiros no Exterior", orgao_codigo: "35000", orgao_nome: "MRE", agenda: "racial" },
  { codigo: "5121", nome: "Gestão, Trabalho, Educação e Transformação Digital na Saúde", orgao_codigo: "36000", orgao_nome: "MS", agenda: "racial" },
  { codigo: "5802", nome: "Enfrentamento ao Racismo e Promoção da Igualdade Racial – Quilombolas e Ciganos", orgao_codigo: "67000", orgao_nome: "MIR", agenda: "racial" },
  { codigo: "5803", nome: "Juventude Negra Viva", orgao_codigo: "67000", orgao_nome: "MIR", agenda: "racial" },
  { codigo: "5804", nome: "Promoção da Igualdade Étnico-Racial", orgao_codigo: "67000", orgao_nome: "MIR", agenda: "racial" },
  { codigo: "5111", nome: "Educação Básica Democrática, com Qualidade e Equidade", orgao_codigo: "26000", orgao_nome: "MEC", agenda: "racial" },
  // Agenda Indígena
  { codigo: "1617", nome: "Demarcação e Gestão dos Territórios Indígenas", orgao_codigo: "84000", orgao_nome: "MPI", agenda: "indigena" },
  { codigo: "5123", nome: "Vigilância em Saúde e Ambiente", orgao_codigo: "36000", orgao_nome: "MS", agenda: "indigena" },
  { codigo: "5126", nome: "Esporte para a Vida", orgao_codigo: "51000", orgao_nome: "ME", agenda: "indigena" },
  { codigo: "5128", nome: "Bolsa Família", orgao_codigo: "55000", orgao_nome: "MDS", agenda: "indigena" },
  { codigo: "5129", nome: "Inclusão de Famílias em Situação de Vulnerabilidade no Cadastro Único", orgao_codigo: "55000", orgao_nome: "MDS", agenda: "indigena" },
  { codigo: "5136", nome: "Proteção e Promoção dos Direitos dos Povos Indígenas", orgao_codigo: "84000", orgao_nome: "MPI", agenda: "indigena" },
];

// Deduplicate: some programs appear in both agendas
const UNIQUE_CODIGOS = [...new Set(AGENDA_PROGRAMAS.map(p => p.codigo))];

const API_BASE = "https://api.portaldatransparencia.gov.br/api-de-dados";

function parseBRL(val: any): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return val || null;
  const s = String(val).trim();
  if (!s || s === "0" || s === "0,00") return null;
  const num = Number(s.replace(/\./g, "").replace(",", "."));
  return isNaN(num) || num === 0 ? null : num;
}

const SIGLA_MAP: Record<string, string> = {
  "67000": "MIR", "92000": "MPI", "84000": "MPI", "26000": "MEC", "36000": "MS",
  "55000": "MDS", "44000": "MMA", "47000": "MPO", "46000": "MGI", "24000": "MCTI",
  "40000": "MTE", "35000": "MRE", "51000": "ME",
};

function resolveOrgao(item: any, fallback: string): string {
  const codOrg = item.codigoOrgaoSuperior || item.codigoOrgao || "";
  if (codOrg && SIGLA_MAP[codOrg]) return SIGLA_MAP[codOrg];
  return fallback;
}

function aggregateApiRows(items: any[]): any[] {
  const map = new Map<string, any>();
  for (const item of items) {
    const codProg = item.codigoPrograma || "";
    const codAcao = item.codigoAcao || "";
    const key = `${codProg}|${codAcao}`;
    const existing = map.get(key);
    if (!existing) {
      map.set(key, { ...item });
    } else {
      for (const [rawField, parsedField] of [
        ["empenhado", "valorEmpenhado"], ["liquidado", "valorLiquidado"], ["pago", "valorPago"],
      ]) {
        const eVal = parseBRL(existing[rawField] || existing[parsedField]) || 0;
        const iVal = parseBRL(item[rawField] || item[parsedField]) || 0;
        const sum = eVal + iVal;
        existing[rawField] = sum > 0 ? sum : null;
        existing[parsedField] = sum > 0 ? sum : null;
      }
      for (const [rawField, parsedField] of [
        ["dotacaoInicial", "valorDotacaoInicial"], ["dotacaoAtualizada", "valorDotacaoAtualizada"],
      ]) {
        const eVal = parseBRL(existing[rawField] || existing[parsedField]) || 0;
        const iVal = parseBRL(item[rawField] || item[parsedField]) || 0;
        const max = Math.max(eVal, iVal);
        existing[rawField] = max > 0 ? max : null;
        existing[parsedField] = max > 0 ? max : null;
      }
      map.set(key, existing);
    }
  }
  return Array.from(map.values());
}

async function fetchPaginated(
  endpoint: string,
  params: Record<string, string>,
  apiKey: string,
): Promise<any[]> {
  const all: any[] = [];
  let page = 1;

  while (page <= 50) {
    const url = new URL(`${API_BASE}/${endpoint}`);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    url.searchParams.set("pagina", String(page));

    if (page === 1) console.log(`  → ${url}`);

    try {
      const res = await fetch(url.toString(), {
        headers: { "chave-api-dados": apiKey, Accept: "application/json" },
      });

      if (res.status === 429) {
        console.log(`  Rate limited p${page}, waiting 30s...`);
        await new Promise(r => setTimeout(r, 30000));
        continue;
      }
      if (!res.ok) {
        console.error(`  API ${res.status}: ${(await res.text()).substring(0, 200)}`);
        break;
      }

      const data = await res.json();
      if (!Array.isArray(data) || data.length === 0) break;
      all.push(...data);
      if (data.length < 15) break;
      page++;
      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`  Fetch error p${page}:`, e);
      break;
    }
  }
  return all;
}

/**
 * Programas focais: todo o orçamento é destinado ao público-alvo.
 * Para esses, todas as ações são incluídas sem filtro de keyword.
 */
const PROGRAMAS_FOCAIS = new Set([
  "5802", // Enfrentamento ao Racismo (MIR)
  "5803", // Juventude Negra Viva (MIR)
  "5804", // Promoção da Igualdade Étnico-Racial (MIR)
  "1617", // Demarcação Territórios Indígenas (MPI)
  "5136", // Proteção Povos Indígenas (MPI)
]);

/**
 * Keywords para filtrar ações dentro de programas universais.
 * Apenas ações cujo nome/descritivo contenha esses termos são incluídas.
 */
const ACAO_KEYWORDS = [
  "indígen", "indigen", "quilombol", "racial", "racismo", "negro", "negra",
  "afro", "étnic", "etnic", "palmares", "igualdade racial", "terreiro",
  "matriz africana", "capoeira", "candomblé", "umbanda", "afrodescendente",
  "cigano", "romani", "povo cigano", "comunidades tradicionais",
  "povos tradicionais", "remanescentes", "funai", "sesai",
  "saúde indígen", "educação indígen", "escolar indígen",
];

/** Check if an action text matches any target-population keyword */
function acaoMatchesKeyword(nomeAcao: string, descritivo: string): boolean {
  const text = `${nomeAcao} ${descritivo}`.toLowerCase();
  return ACAO_KEYWORDS.some(kw => text.includes(kw));
}

function resolveGrupoFocal(agenda: "racial" | "indigena", orgao: string, texto: string): string | null {
  const t = texto.toLowerCase();
  if (t.includes("quilombol")) return "quilombolas";
  if (t.includes("cigan") || t.includes("romani")) return "ciganos";
  if (agenda === "indigena" || orgao === "MPI" || t.includes("indígen") || t.includes("indigen")) return "indigenas";
  if (t.includes("juventude negra")) return "juventude_negra";
  return "negros";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let anos = [2024, 2025];
    let codigos: string[] | null = null; // null = all
    try {
      const body = await req.json();
      if (body.anos) anos = body.anos;
      if (body.codigos) codigos = body.codigos;
    } catch { /* defaults */ }

    const apiKey = Deno.env.get("PORTAL_TRANSPARENCIA_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: "PORTAL_TRANSPARENCIA_API_KEY não configurada" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const programasToFetch = codigos
      ? AGENDA_PROGRAMAS.filter(p => codigos!.includes(p.codigo))
      : AGENDA_PROGRAMAS;

    // Deduplicate by codigo (some appear in both agendas)
    const seen = new Set<string>();
    const uniqueProgs: AgendaPrograma[] = [];
    for (const p of programasToFetch) {
      if (!seen.has(p.codigo)) {
        seen.add(p.codigo);
        uniqueProgs.push(p);
      }
    }

    console.log(`=== INGESTÃO AGENDA TRANSVERSAL TESTE ===`);
    console.log(`Anos: ${anos.join(", ")}`);
    console.log(`Programas: ${uniqueProgs.length}`);

    const registros: any[] = [];
    const erros: string[] = [];
    const cobertura: Record<string, { encontrado: boolean; registros: number }> = {};

    for (const prog of uniqueProgs) {
      for (const ano of anos) {
        const chave = `${prog.codigo}-${ano}`;
        console.log(`\n${prog.codigo} (${prog.nome.substring(0, 50)}) ${ano}...`);

        try {
          const dados = await fetchPaginated(
            "despesas/por-funcional-programatica",
            { ano: String(ano), programa: prog.codigo },
            apiKey,
          );

          const aggregated = aggregateApiRows(dados);
          console.log(`  Brutos: ${dados.length}, Agregados: ${aggregated.length}, Focal: ${PROGRAMAS_FOCAIS.has(prog.codigo)}`);

          if (aggregated.length === 0) {
            cobertura[chave] = { encontrado: false, registros: 0 };
            continue;
          }

          let count = 0;
          let skippedUniversal = 0;
          const isFocal = PROGRAMAS_FOCAIS.has(prog.codigo);

          for (const item of aggregated) {
            const codProg = item.codigoPrograma || prog.codigo;
            const nomeProg = item.programa || item.nomePrograma || prog.nome;
            const codAcao = item.codigoAcao || "";
            const nomeAcao = item.acao || item.nomeAcao || "";
            const descritivo = item.descricao || item.descritivo || "";

            // For universal programs, filter by action-level keywords
            if (!isFocal && !acaoMatchesKeyword(nomeAcao, descritivo)) {
              skippedUniversal++;
              continue;
            }

            const orgao = resolveOrgao(item, prog.orgao_nome);

            let programa = `${codProg} – ${nomeProg}`;
            if (codAcao) programa += ` / ${codAcao} – ${nomeAcao}`;

            const dotacaoInicial = parseBRL(item.dotacaoInicial || item.valorDotacaoInicial);
            const dotacaoAutorizada = parseBRL(item.dotacaoAtualizada || item.valorDotacaoAtualizada);
            const empenhado = parseBRL(item.empenhado || item.valorEmpenhado);
            const liquidado = parseBRL(item.liquidado || item.valorLiquidado);
            const pago = parseBRL(item.pago || item.valorPago);

            if (!dotacaoInicial && !dotacaoAutorizada && !empenhado && !liquidado && !pago) continue;

            const textoCompleto = `${nomeProg} ${nomeAcao}`;
            const grupoFocal = resolveGrupoFocal(prog.agenda, orgao, textoCompleto);

            const dotRef = dotacaoAutorizada || dotacaoInicial;
            const percentual = dotRef && pago ? Math.round((pago / dotRef) * 10000) / 100 : null;

            registros.push({
              programa: programa.substring(0, 250),
              orgao,
              esfera: "federal",
              ano,
              dotacao_inicial: dotacaoInicial,
              dotacao_autorizada: dotacaoAutorizada,
              empenhado,
              liquidado,
              pago,
              percentual_execucao: percentual,
              fonte_dados: "Agenda Transversal TESTE",
              url_fonte: `https://portaldatransparencia.gov.br/despesas/programa-e-acao?de=01/01/${ano}&ate=31/12/${ano}&programa=${codProg}`,
              observacoes: `Agenda ${prog.agenda} | Programa ${prog.codigo}`,
              eixo_tematico: prog.agenda === "indigena" ? "terra_territorio" : "politicas_institucionais",
              grupo_focal: grupoFocal,
              descritivo: nomeAcao || nomeProg || null,
              publico_alvo: null,
              razao_selecao: `Agenda Transversal PPA 2024-2027: ${prog.agenda} | Programa ${prog.codigo} (${prog.nome})${isFocal ? ' [focal]' : ' [ação filtrada por keyword]'}`,
            });
            count++;
          }

          if (skippedUniversal > 0) {
            console.log(`  Filtradas ${skippedUniversal} ações universais (sem keyword de público-alvo)`);
          }
          console.log(`  Incluídas: ${count} ações`);
          cobertura[chave] = { encontrado: true, registros: count };
        } catch (e) {
          console.error(`  Erro ${prog.codigo} ${ano}:`, e);
          erros.push(`${prog.codigo} ${ano}: ${e}`);
          cobertura[chave] = { encontrado: false, registros: 0 };
        }

        // Rate limit
        await new Promise(r => setTimeout(r, 500));
      }
    }

    console.log(`\nTotal registros coletados: ${registros.length}`);

    // Delete existing TESTE records for these years before inserting
    if (registros.length > 0) {
      console.log("Removendo registros TESTE anteriores...");
      const { error: delErr } = await supabase
        .from("dados_orcamentarios")
        .delete()
        .eq("fonte_dados", "Agenda Transversal TESTE")
        .in("ano", anos);

      if (delErr) {
        console.error("Erro ao deletar:", delErr);
        erros.push(`Delete: ${delErr.message}`);
      }

      // Insert in batches
      const BATCH = 50;
      let inserted = 0;
      for (let i = 0; i < registros.length; i += BATCH) {
        const batch = registros.slice(i, i + BATCH);
        const { error: insErr } = await supabase
          .from("dados_orcamentarios")
          .insert(batch);
        if (insErr) {
          console.error(`Batch ${i}:`, insErr);
          erros.push(`Insert batch ${i}: ${insErr.message}`);
        } else {
          inserted += batch.length;
        }
      }
      console.log(`Inseridos: ${inserted}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_registros: registros.length,
        cobertura,
        erros: erros.length > 0 ? erros : undefined,
        programas_consultados: uniqueProgs.length,
        anos,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("Erro geral:", e);
    return new Response(
      JSON.stringify({ success: false, error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

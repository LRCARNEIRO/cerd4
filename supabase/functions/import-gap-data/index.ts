import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Import manually collected budget data for gaps not covered by the API.
 * Specifically: FUNAI, SESAI, INCRA data for 2020-2023.
 */

const ORGAO_METADATA: Record<string, { grupo_focal: string; eixo_tematico: string }> = {
  FUNAI: { grupo_focal: "indigenas", eixo_tematico: "terra_territorio" },
  SESAI: { grupo_focal: "saude_indigena", eixo_tematico: "saude" },
  MPI: { grupo_focal: "indigenas", eixo_tematico: "terra_territorio" },
  INCRA: { grupo_focal: "quilombolas", eixo_tematico: "terra_territorio" },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { registros } = await req.json();

    if (!Array.isArray(registros) || registros.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "Nenhum registro fornecido" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const errors: string[] = [];
    const records: any[] = [];

    for (let i = 0; i < registros.length; i++) {
      const r = registros[i];
      const ano = Number(r.ano);
      if (!ano || ano < 2018 || ano > 2026) {
        errors.push(`Linha ${i + 1}: ano inválido (${r.ano})`);
        continue;
      }

      const orgao = (r.orgao || "").trim().toUpperCase();
      if (!orgao) {
        errors.push(`Linha ${i + 1}: órgão vazio`);
        continue;
      }

      const programa = (r.programa || "").trim();
      const acao = (r.acao || "").trim();
      if (!programa && !acao) {
        errors.push(`Linha ${i + 1}: programa e ação vazios`);
        continue;
      }

      const meta = ORGAO_METADATA[orgao] || { grupo_focal: null, eixo_tematico: null };

      const programaFull = acao ? `${programa} / ${acao}`.substring(0, 250) : programa.substring(0, 250);

      const dotacaoInicial = r.dotacao_inicial || null;
      const dotacaoAutorizada = r.dotacao_autorizada || null;
      const empenhado = r.empenhado || null;
      const liquidado = r.liquidado || null;
      const pago = r.pago || null;

      const dotRef = dotacaoAutorizada || dotacaoInicial;
      const percentual = dotRef && pago ? Math.round((pago / dotRef) * 10000) / 100 : null;

      const isSesai = orgao === "SESAI";

      records.push({
        programa: programaFull,
        orgao,
        esfera: "federal",
        ano,
        dotacao_inicial: dotacaoInicial,
        dotacao_autorizada: dotacaoAutorizada,
        empenhado,
        liquidado,
        pago,
        percentual_execucao: percentual,
        fonte_dados: "Inserção manual – Portal da Transparência (verificação direta)",
        url_fonte: `https://portaldatransparencia.gov.br/despesas/programa-e-acao?de=01/01/${ano}&ate=31/12/${ano}`,
        observacoes: isSesai
          ? "Inserção manual | SEGREGADO: Saúde Indígena (não computar no total racial)"
          : "Inserção manual – lacuna API",
        eixo_tematico: meta.eixo_tematico,
        grupo_focal: meta.grupo_focal,
      });
    }

    let inserted = 0;
    const BATCH = 50;

    for (let i = 0; i < records.length; i += BATCH) {
      const chunk = records.slice(i, i + BATCH);
      const { error: insErr } = await supabase.from("dados_orcamentarios").insert(chunk);
      if (insErr) {
        errors.push(`Batch ${i}: ${insErr.message}`);
      } else {
        inserted += chunk.length;
      }
    }

    return new Response(
      JSON.stringify({ success: true, inserted, total: registros.length, errors }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : "Erro" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

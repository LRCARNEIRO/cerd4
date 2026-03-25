import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mapping: parágrafo CERD III → categorias de indicadores + eixos orçamentários
const PARAGRAFO_MAP: Record<string, { categorias: string[]; eixos: string[]; tema: string }> = {
  "12": {
    categorias: ["seguranca_publica", "justica_criminal"],
    eixos: ["seguranca_publica", "legislacao_justica"],
    tema: "Discriminação racial e crimes de ódio",
  },
  "14": {
    categorias: ["midia", "comunicacao", "cultura"],
    eixos: ["cultura_patrimonio"],
    tema: "Representatividade midiática e estereótipos",
  },
  "16": {
    categorias: ["saude", "saude_materna", "mortalidade"],
    eixos: ["saude"],
    tema: "Saúde e disparidades raciais",
  },
  "18": {
    categorias: ["educacao", "escolaridade"],
    eixos: ["educacao"],
    tema: "Educação e relações étnico-raciais",
  },
  "20": {
    categorias: ["terra_territorio", "indigenas", "povos_tradicionais"],
    eixos: ["terra_territorio"],
    tema: "Demarcação de terras indígenas",
  },
  "22": {
    categorias: ["terra_territorio", "quilombolas", "povos_tradicionais"],
    eixos: ["terra_territorio"],
    tema: "Titulação de territórios quilombolas",
  },
  "24": {
    categorias: ["seguranca_publica", "violencia_policial", "juventude"],
    eixos: ["seguranca_publica"],
    tema: "Violência policial e letalidade contra jovens negros",
  },
  "26": {
    categorias: ["seguranca_publica", "sistema_prisional", "encarceramento"],
    eixos: ["seguranca_publica", "legislacao_justica"],
    tema: "Encarceramento em massa e viés racial",
  },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { paragrafo } = await req.json();
    
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    
    if (!lovableApiKey) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(supabaseUrl, supabaseKey);

    const mapping = PARAGRAFO_MAP[String(paragrafo)];
    if (!mapping) {
      return new Response(JSON.stringify({ error: `Parágrafo §${paragrafo} não mapeado` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1) Query relevant indicators
    const { data: indicadores } = await supabase
      .from("indicadores_interseccionais")
      .select("nome, categoria, subcategoria, dados, fonte, tendencia")
      .or(mapping.categorias.map(c => `categoria.eq.${c},subcategoria.eq.${c}`).join(","));

    // 2) Query relevant budget data
    const { data: orcamento } = await supabase
      .from("dados_orcamentarios")
      .select("programa, orgao, ano, pago, dotacao_autorizada, percentual_execucao, esfera, eixo_tematico")
      .in("eixo_tematico", mapping.eixos)
      .order("ano", { ascending: false })
      .limit(20);

    // 3) Query relevant normative docs
    const { data: normativos } = await supabase
      .from("documentos_normativos")
      .select("titulo, categoria, status, artigos_convencao")
      .limit(50);
    
    // Filter normativos that overlap with the paragraph's artigos
    const artigosParagrafo = getArtigosPorParagrafo(paragrafo);
    const normativosRelevantes = (normativos || []).filter((doc: any) =>
      doc.artigos_convencao?.some((a: string) => artigosParagrafo.includes(a))
    );

    // 4) Get current resposta for context
    const { data: resposta } = await supabase
      .from("respostas_lacunas_cerd_iii")
      .select("critica_original, resposta_brasil, grau_atendimento, evidencias_quantitativas")
      .eq("paragrafo_cerd_iii", String(paragrafo))
      .single();

    // Build context for AI
    const indicadoresResumo = (indicadores || []).slice(0, 15).map((ind: any) => {
      const dados = ind.dados;
      let resumo = `${ind.nome} (${ind.fonte})`;
      if (dados && typeof dados === "object") {
        // Extract key numbers
        const entries = Object.entries(dados).slice(0, 5);
        resumo += ": " + entries.map(([k, v]) => `${k}=${v}`).join(", ");
      }
      if (ind.tendencia) resumo += ` [tendência: ${ind.tendencia}]`;
      return resumo;
    });

    const orcamentoResumo = (orcamento || []).slice(0, 10).map((o: any) =>
      `${o.programa} (${o.orgao}, ${o.ano}): autorizado R$${Number(o.dotacao_autorizada || 0).toLocaleString("pt-BR")}, pago R$${Number(o.pago || 0).toLocaleString("pt-BR")} (${o.percentual_execucao || 0}% execução)`
    );

    const normativosResumo = normativosRelevantes.slice(0, 10).map((n: any) =>
      `${n.titulo} [${n.categoria}, ${n.status}]`
    );

    const prompt = `Você é um especialista em direitos humanos e relatórios CERD/ONU. Gere uma avaliação técnica CONCISA (máximo 3 frases) sobre o §${paragrafo} das Observações Finais do CERD 2022 (tema: ${mapping.tema}).

CONTEXTO:
- Crítica original do CERD: "${resposta?.critica_original || 'N/D'}"
- Resposta do Brasil: "${resposta?.resposta_brasil || 'N/D'}"
- Grau de atendimento atual: ${resposta?.grau_atendimento || 'N/D'}

DADOS REAIS DO SISTEMA (use APENAS estes):
${indicadoresResumo.length > 0 ? `Indicadores: ${indicadoresResumo.join("; ")}` : "Sem indicadores estatísticos disponíveis."}
${orcamentoResumo.length > 0 ? `Orçamento: ${orcamentoResumo.join("; ")}` : "Sem dados orçamentários específicos."}
${normativosResumo.length > 0 ? `Marcos normativos: ${normativosResumo.join("; ")}` : "Sem marcos normativos vinculados."}

REGRAS:
1. Use APENAS os dados fornecidos acima. NÃO invente números.
2. Cite fontes específicas quando mencionar dados.
3. Máximo 3 frases objetivas avaliando avanços e persistência de desigualdades.
4. Se não houver dados suficientes, diga "Dados insuficientes para avaliação técnica automatizada".`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        stream: false,
      }),
    });

    if (!aiResponse.ok) {
      const status = aiResponse.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit excedido. Tente novamente em alguns segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA insuficientes." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${status}`);
    }

    const aiData = await aiResponse.json();
    const justificativa = aiData.choices?.[0]?.message?.content?.trim() || "Erro ao gerar avaliação.";

    // Update the record
    const { error: updateError } = await supabase
      .from("respostas_lacunas_cerd_iii")
      .update({ justificativa_avaliacao: justificativa })
      .eq("paragrafo_cerd_iii", String(paragrafo));

    if (updateError) throw updateError;

    return new Response(JSON.stringify({
      paragrafo,
      justificativa,
      fontes: {
        indicadores: indicadoresResumo.length,
        orcamento: orcamentoResumo.length,
        normativos: normativosResumo.length,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-justificativa error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function getArtigosPorParagrafo(paragrafo: string): string[] {
  const map: Record<string, string[]> = {
    "12": ["artigo_4", "artigo_6"],
    "14": ["artigo_7"],
    "16": ["artigo_5"],
    "18": ["artigo_5", "artigo_7"],
    "20": ["artigo_5"],
    "22": ["artigo_5"],
    "24": ["artigo_5", "artigo_6"],
    "26": ["artigo_5", "artigo_6"],
  };
  return map[paragrafo] || [];
}

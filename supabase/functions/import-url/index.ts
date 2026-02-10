import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL é obrigatório' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Protocolo inválido');
      }
    } catch {
      return new Response(JSON.stringify({ error: 'URL inválido' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fetching URL: ${url}`);

    // Fetch the page content
    const pageResponse = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CERDBot/1.0)',
        'Accept': 'text/html,text/plain,application/json',
      },
    });

    if (!pageResponse.ok) {
      return new Response(JSON.stringify({ error: `Não foi possível acessar a URL: ${pageResponse.status}` }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contentType = pageResponse.headers.get('content-type') || '';
    const pageContent = await pageResponse.text();

    // Strip HTML tags for cleaner processing
    const cleanContent = pageContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 50000);

    console.log(`Page fetched, ${cleanContent.length} chars`);

    // Use AI to extract structured data
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em extração de dados de páginas web sobre políticas públicas e legislação no Brasil.

Analise o conteúdo da página e extraia dados relevantes para o relatório CERD IV do Brasil.

Retorne um JSON válido:
{
  "titulo_pagina": "título identificado",
  "tipo_conteudo": "legislacao|dados_estatisticos|relatorio|politica_publica|outro",
  "resumo": "resumo do conteúdo em 2-3 frases",
  "indicadores": [{ "nome": "", "categoria": "", "fonte": "", "url_fonte": "${url}", "dados": {}, "tendencia": "" }],
  "orcamento": [{ "programa": "", "orgao": "", "esfera": "federal|estadual|municipal", "ano": 0, "fonte_dados": "", "url_fonte": "${url}" }],
  "lacunas": [{ "paragrafo": "", "tema": "", "descricao_lacuna": "", "eixo_tematico": "", "grupo_focal": "geral", "status_cumprimento": "em_andamento", "prioridade": "media" }],
  "conclusoes": [{ "titulo": "", "tipo": "legislacao|analise|evidencia", "periodo": "2018-2026", "argumento_central": "", "evidencias": [] }],
  "relevancia_cerd": "alta|media|baixa",
  "secoes_impactadas": ["estatisticas", "orcamento", "conclusoes", "relatorios", "metas"]
}

Se for legislação, crie uma conclusão com o texto legal relevante.
Se não encontrar dados de uma categoria, retorne array vazio [].`
          },
          {
            role: 'user',
            content: `URL: ${url}\n\nConteúdo:\n${cleanContent}`
          }
        ],
        temperature: 0.1,
        max_tokens: 8000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI error:', errorText);
      throw new Error('Erro ao processar conteúdo com IA');
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || '';

    let extractedData: any;
    try {
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found');
      }
    } catch {
      extractedData = {
        titulo_pagina: 'Conteúdo não estruturado',
        tipo_conteudo: 'outro',
        resumo: 'Não foi possível extrair dados estruturados desta página.',
        indicadores: [], orcamento: [], lacunas: [], conclusoes: [],
        relevancia_cerd: 'baixa',
        secoes_impactadas: [],
      };
    }

    // Count extracted items
    const totalItems = (extractedData.indicadores?.length || 0) +
      (extractedData.orcamento?.length || 0) +
      (extractedData.lacunas?.length || 0) +
      (extractedData.conclusoes?.length || 0);

    // Auto-insert if items found (with snapshot)
    if (totalItems > 0) {
      // Snapshot
      const tabelasAfetadas: string[] = [];
      const snapshotData: Record<string, any[]> = {};
      let totalRegistros = 0;

      const tables = ['indicadores_interseccionais', 'dados_orcamentarios', 'lacunas_identificadas', 'conclusoes_analiticas'];
      for (const t of tables) {
        const { data: existing } = await supabase.from(t).select('*');
        if (existing && existing.length > 0) {
          snapshotData[t] = existing;
          totalRegistros += existing.length;
          tabelasAfetadas.push(t);
        }
      }

      if (tabelasAfetadas.length > 0) {
        await supabase.from('data_snapshots').insert({
          nome: `Backup antes de importar URL: ${parsedUrl.hostname}`,
          descricao: `Import de ${url}`,
          arquivo_origem: url,
          usuario_id: 'user',
          snapshot_data: snapshotData,
          tabelas_afetadas: tabelasAfetadas,
          total_registros: totalRegistros,
        });
      }

      // Insert conclusoes at minimum (most common from URLs)
      const validEixos = ['legislacao_justica', 'politicas_institucionais', 'seguranca_publica', 'saude', 'educacao', 'trabalho_renda', 'terra_territorio', 'cultura_patrimonio', 'participacao_social', 'dados_estatisticas'];
      let inserted = 0;

      for (const conc of (extractedData.conclusoes || []).slice(0, 20)) {
        if (!conc.titulo || !conc.argumento_central) continue;
        const { error } = await supabase.from('conclusoes_analiticas').insert({
          titulo: String(conc.titulo).substring(0, 255),
          tipo: String(conc.tipo || 'legislacao').substring(0, 100),
          periodo: String(conc.periodo || '2018-2026').substring(0, 50),
          argumento_central: String(conc.argumento_central).substring(0, 5000),
          evidencias: Array.isArray(conc.evidencias) ? conc.evidencias.slice(0, 10) : null,
        });
        if (!error) inserted++;
      }

      for (const lac of (extractedData.lacunas || []).slice(0, 20)) {
        if (!lac.tema || !lac.descricao_lacuna) continue;
        const eixo = validEixos.includes(lac.eixo_tematico) ? lac.eixo_tematico : 'legislacao_justica';
        const { error } = await supabase.from('lacunas_identificadas').insert({
          paragrafo: String(lac.paragrafo || 'URL').substring(0, 50),
          tema: String(lac.tema).substring(0, 255),
          descricao_lacuna: String(lac.descricao_lacuna).substring(0, 2000),
          eixo_tematico: eixo,
          grupo_focal: 'geral',
          tipo_observacao: 'recomendacao',
          status_cumprimento: 'em_andamento',
          prioridade: 'media',
          fontes_dados: [url],
        });
        if (!error) inserted++;
      }

      extractedData.inserted = inserted;
    }

    return new Response(JSON.stringify({
      success: true,
      ...extractedData,
      total_items: totalItems,
      url,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('URL import error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

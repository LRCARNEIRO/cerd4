import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { indicators: rawIndicators, clearCategories } = await req.json();

    if (!rawIndicators || !Array.isArray(rawIndicators)) {
      return new Response(JSON.stringify({ error: 'indicators array required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Regra de Ouro (defesa no servidor): common_core NUNCA entra na base
    // analítica — registros universais sem recorte racial. Mesmo clientes
    // antigos (versão publicada) não conseguem recriar CC por aqui.
    const indicators = rawIndicators.filter((i: any) => i?.categoria !== 'common_core');
    const catsToClear: string[] = Array.from(new Set([
      ...(Array.isArray(clearCategories) ? clearCategories : []),
      'common_core',
    ]));

    // Preservar códigos congelados (codigo_curto) através do delete+reinsert:
    // snapshot nome → codigo_curto ANTES de limpar as categorias.
    const { data: existentes } = await supabase
      .from('indicadores_interseccionais')
      .select('nome, codigo_curto')
      .in('categoria', catsToClear);
    const codigoPorNome = new Map<string, string>();
    for (const r of existentes || []) {
      if (r?.nome && r?.codigo_curto) codigoPorNome.set(r.nome, r.codigo_curto);
    }

    // Clear existing mirror categories before re-inserting
    for (const cat of catsToClear) {
      const { error: delErr } = await supabase
        .from('indicadores_interseccionais')
        .delete()
        .eq('categoria', cat)
        .contains('documento_origem', ['espelho_estatico']);
      if (delErr) console.error(`Delete ${cat}:`, delErr);
    }

    // Reanexar o código congelado ao registro recriado com o mesmo nome.
    const payload = indicators.map((ind: any) => {
      const codigo = codigoPorNome.get(ind?.nome);
      return codigo ? { ...ind, codigo_curto: codigo } : ind;
    });

    // Insert in batches of 25, with per-row retry on batch failure for granular errors
    let inserted = 0;
    let errors = 0;
    const failedItems: Array<{ nome: string; categoria: string; error: string }> = [];

    for (let i = 0; i < payload.length; i += 25) {
      const batch = payload.slice(i, i + 25);
      const { error: insertError } = await supabase
        .from('indicadores_interseccionais')
        .insert(batch);

      if (insertError) {
        console.warn(`Batch ${i} failed (${insertError.message}). Retrying row-by-row...`);
        // Retry one-by-one to isolate failing items
        for (const item of batch) {
          const { error: rowErr } = await supabase
            .from('indicadores_interseccionais')
            .insert([item]);
          if (rowErr) {
            errors++;
            failedItems.push({
              nome: item.nome,
              categoria: item.categoria,
              error: rowErr.message,
            });
            console.error(`Failed: ${item.nome} (${item.categoria}) — ${rowErr.message}`);
          } else {
            inserted++;
          }
        }
      } else {
        inserted += batch.length;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${inserted} indicadores espelhados inseridos (${errors} falhas individuais)`,
      total: indicators.length,
      inserted,
      errors,
      failedItems,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Ingest error:', error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

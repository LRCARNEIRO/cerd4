import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { indicators } = await req.json();

    if (!indicators || !Array.isArray(indicators)) {
      return new Response(JSON.stringify({ error: 'indicators array required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete existing ods_racial records first
    const { error: deleteError } = await supabase
      .from('indicadores_interseccionais')
      .delete()
      .eq('categoria', 'ods_racial');

    if (deleteError) {
      console.error('Delete error:', deleteError);
    }

    // Insert in batches of 20
    let inserted = 0;
    for (let i = 0; i < indicators.length; i += 20) {
      const batch = indicators.slice(i, i + 20).map((ind: any) => ({
        nome: ind.name,
        categoria: 'ods_racial',
        subcategoria: ind.group,
        fonte: ind.fonte,
        url_fonte: ind.url,
        artigos_convencao: ind.artigoCerd || [],
        auditado_manualmente: true,
        data_auditoria: new Date().toISOString(),
        tendencia: null,
        dados: {
          ods_id: ind.id,
          slug: ind.slug,
          formato: ind.formato,
          series: ind.series,
        },
      }));

      const { error: insertError } = await supabase
        .from('indicadores_interseccionais')
        .insert(batch);

      if (insertError) {
        console.error(`Batch ${i} error:`, insertError);
      } else {
        inserted += batch.length;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${inserted} indicadores ODS Racial inseridos`,
      total: indicators.length,
      inserted,
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

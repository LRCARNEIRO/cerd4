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

    const { indicators, clearCategories } = await req.json();

    if (!indicators || !Array.isArray(indicators)) {
      return new Response(JSON.stringify({ error: 'indicators array required' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clear existing mirror categories before re-inserting
    if (clearCategories && Array.isArray(clearCategories)) {
      for (const cat of clearCategories) {
        // Only delete records that have 'espelho_estatico' in documento_origem
        const { error: delErr } = await supabase
          .from('indicadores_interseccionais')
          .delete()
          .eq('categoria', cat)
          .contains('documento_origem', ['espelho_estatico']);
        if (delErr) console.error(`Delete ${cat}:`, delErr);
      }
    }

    // Insert in batches of 25
    let inserted = 0;
    let errors = 0;
    for (let i = 0; i < indicators.length; i += 25) {
      const batch = indicators.slice(i, i + 25);
      const { error: insertError } = await supabase
        .from('indicadores_interseccionais')
        .insert(batch);

      if (insertError) {
        console.error(`Batch ${i} error:`, insertError);
        errors++;
      } else {
        inserted += batch.length;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${inserted} indicadores espelhados inseridos (${errors} lotes com erro)`,
      total: indicators.length,
      inserted,
      errors,
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

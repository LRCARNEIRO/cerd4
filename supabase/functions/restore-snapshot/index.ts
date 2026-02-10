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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { snapshot_id } = await req.json();
    if (!snapshot_id) {
      return new Response(JSON.stringify({ error: 'snapshot_id é obrigatório' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fetch snapshot
    const { data: snapshot, error: fetchError } = await supabase
      .from('data_snapshots')
      .select('*')
      .eq('id', snapshot_id)
      .single();

    if (fetchError || !snapshot) {
      return new Response(JSON.stringify({ error: 'Snapshot não encontrado' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const snapshotData = snapshot.snapshot_data as Record<string, any[]>;
    const restored: Record<string, number> = {};

    // Restore each table
    for (const tableName of snapshot.tabelas_afetadas) {
      const tableData = snapshotData[tableName];
      if (!tableData) continue;

      // Delete current data
      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // delete all

      if (deleteError) {
        console.error(`Error deleting ${tableName}:`, deleteError);
        continue;
      }

      // Re-insert snapshot data
      if (tableData.length > 0) {
        // Insert in batches of 50
        for (let i = 0; i < tableData.length; i += 50) {
          const batch = tableData.slice(i, i + 50);
          const { error: insertError } = await supabase
            .from(tableName)
            .insert(batch);
          if (insertError) {
            console.error(`Error restoring ${tableName} batch ${i}:`, insertError);
          }
        }
      }

      restored[tableName] = tableData.length;
    }

    console.log('Restore complete:', restored);

    return new Response(JSON.stringify({
      success: true,
      message: `Dados restaurados do snapshot "${snapshot.nome}"`,
      restored,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Restore error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

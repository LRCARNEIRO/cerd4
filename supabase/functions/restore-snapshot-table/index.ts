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

    const { snapshot_id, table_name } = await req.json();
    if (!snapshot_id || !table_name) {
      return new Response(JSON.stringify({ error: 'snapshot_id e table_name são obrigatórios' }), {
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
    const tableData = snapshotData[table_name];

    if (!tableData) {
      return new Response(JSON.stringify({ error: `Tabela ${table_name} não encontrada no snapshot` }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Delete current data
    const { error: deleteError } = await supabase
      .from(table_name)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError) {
      return new Response(JSON.stringify({ error: `Erro ao limpar ${table_name}: ${deleteError.message}` }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Re-insert snapshot data in batches
    let inserted = 0;
    for (let i = 0; i < tableData.length; i += 50) {
      const batch = tableData.slice(i, i + 50);
      const { error: insertError } = await supabase
        .from(table_name)
        .insert(batch);
      if (insertError) {
        console.error(`Error restoring batch ${i}:`, insertError);
      } else {
        inserted += batch.length;
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Tabela ${table_name} restaurada do snapshot "${snapshot.nome}"`,
      registros_restaurados: inserted,
      total_no_snapshot: tableData.length,
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

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

    const { items, file_name } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum item para confirmar' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create snapshot before inserting
    const tabelasAfetadas = [...new Set(items.map((i: any) => i.tabela))];
    const snapshotData: Record<string, any[]> = {};
    let totalRegistros = 0;

    for (const tabela of tabelasAfetadas) {
      const { data: existing } = await supabase.from(tabela).select('*');
      snapshotData[tabela] = existing || [];
      totalRegistros += (existing || []).length;
    }

    let snapshotId: string | null = null;
    if (tabelasAfetadas.length > 0) {
      const { data: snapResult } = await supabase.from('data_snapshots').insert({
        nome: `Backup antes de importar: ${file_name || 'dados confirmados'}`,
        descricao: `Snapshot automático - ${items.length} itens confirmados pelo usuário`,
        arquivo_origem: file_name || null,
        usuario_id: 'user',
        snapshot_data: snapshotData,
        tabelas_afetadas: tabelasAfetadas,
        total_registros: totalRegistros,
      }).select('id').single();
      snapshotId = snapResult?.id || null;
    }

    const results = {
      indicadores_inseridos: 0,
      orcamento_inseridos: 0,
      lacunas_inseridas: 0,
      conclusoes_inseridas: 0,
      erros: [] as string[],
    };

    for (const item of items) {
      try {
        const { tabela, dados } = item;
        if (!tabela || !dados) continue;

        const { error } = await supabase.from(tabela).insert(dados);
        if (error) throw error;

        if (tabela === 'indicadores_interseccionais') results.indicadores_inseridos++;
        if (tabela === 'dados_orcamentarios') results.orcamento_inseridos++;
        if (tabela === 'lacunas_identificadas') results.lacunas_inseridas++;
        if (tabela === 'conclusoes_analiticas') results.conclusoes_inseridas++;
      } catch (e: any) {
        results.erros.push(`${item.tabela}: ${e.message}`);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `${items.length} itens inseridos com sucesso!`,
      results,
      snapshot_id: snapshotId,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Confirm error:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

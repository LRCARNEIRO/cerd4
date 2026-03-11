import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Protocolo Triple-Check — Fase 3: Correção Assistida
 * 
 * Aplica correções aprovadas pelo operador:
 * - Registros BD (indicadores_interseccionais, dados_orcamentarios, conclusoes_analiticas): UPDATE direto
 * - StatisticsData.ts: Gera patch de código para aplicação manual
 */

interface CorrectionRequest {
  action: 'apply_db' | 'generate_patch' | 'mark_nd';
  item_id: string;
  origem: string;
  tabela?: string; // for DB items
  record_id?: string; // UUID for DB records
  campo?: string; // field to update
  valor_corrigido?: string | number | null;
  indicador: string;
  valor_anterior?: string | number | null;
  notas?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const sb = createClient(supabaseUrl, serviceKey);

    const body: CorrectionRequest | { corrections: CorrectionRequest[] } = await req.json();

    // Support batch corrections
    const corrections = 'corrections' in body ? body.corrections : [body];

    if (!corrections || corrections.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhuma correção fornecida' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const results: any[] = [];

    for (const corr of corrections) {
      try {
        if (corr.action === 'apply_db') {
          // Direct DB update
          const result = await applyDbCorrection(sb, corr);
          results.push({ item_id: corr.item_id, status: 'applied', ...result });
        } else if (corr.action === 'mark_nd') {
          // Mark as N/D in DB
          const result = await markAsND(sb, corr);
          results.push({ item_id: corr.item_id, status: 'marked_nd', ...result });
        } else if (corr.action === 'generate_patch') {
          // Generate code patch for StatisticsData.ts
          const patch = generateCodePatch(corr);
          results.push({ item_id: corr.item_id, status: 'patch_generated', patch });
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Erro';
        results.push({ item_id: corr.item_id, status: 'error', error: msg });
      }
    }

    const applied = results.filter(r => r.status === 'applied').length;
    const patches = results.filter(r => r.status === 'patch_generated').length;
    const errors = results.filter(r => r.status === 'error').length;

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      summary: { total: results.length, applied, patches, errors },
      results,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('audit-apply-correction error:', error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function applyDbCorrection(sb: any, corr: CorrectionRequest) {
  const allowedTables = ['indicadores_interseccionais', 'dados_orcamentarios', 'conclusoes_analiticas'];
  
  if (!corr.tabela || !allowedTables.includes(corr.tabela)) {
    throw new Error(`Tabela não permitida: ${corr.tabela}`);
  }
  if (!corr.record_id) {
    throw new Error('record_id obrigatório para correção em BD');
  }

  // Build update object based on table
  const updateData: Record<string, any> = {};

  if (corr.tabela === 'indicadores_interseccionais') {
    if (corr.campo === 'dados') {
      updateData.dados = corr.valor_corrigido;
    } else if (corr.campo === 'nome') {
      updateData.nome = corr.valor_corrigido;
    } else if (corr.campo === 'url_fonte') {
      updateData.url_fonte = corr.valor_corrigido;
    } else if (corr.campo === 'fonte') {
      updateData.fonte = corr.valor_corrigido;
    } else if (corr.campo === 'tendencia') {
      updateData.tendencia = corr.valor_corrigido;
    }
  } else if (corr.tabela === 'dados_orcamentarios') {
    const numFields = ['dotacao_inicial', 'dotacao_autorizada', 'empenhado', 'liquidado', 'pago', 'percentual_execucao'];
    if (corr.campo && numFields.includes(corr.campo)) {
      updateData[corr.campo] = corr.valor_corrigido != null ? Number(corr.valor_corrigido) : null;
    } else if (corr.campo === 'url_fonte') {
      updateData.url_fonte = corr.valor_corrigido;
    } else if (corr.campo === 'observacoes') {
      updateData.observacoes = corr.valor_corrigido;
    }
  } else if (corr.tabela === 'conclusoes_analiticas') {
    if (corr.campo === 'argumento_central') {
      updateData.argumento_central = corr.valor_corrigido;
    } else if (corr.campo === 'titulo') {
      updateData.titulo = corr.valor_corrigido;
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error(`Campo '${corr.campo}' não reconhecido para tabela '${corr.tabela}'`);
  }

  // Add audit note
  updateData.updated_at = new Date().toISOString();

  const { error } = await sb
    .from(corr.tabela)
    .update(updateData)
    .eq('id', corr.record_id);

  if (error) throw new Error(`DB update failed: ${error.message}`);

  return {
    tabela: corr.tabela,
    record_id: corr.record_id,
    campo: corr.campo,
    valor_anterior: corr.valor_anterior,
    valor_corrigido: corr.valor_corrigido,
  };
}

async function markAsND(sb: any, corr: CorrectionRequest) {
  if (!corr.tabela || !corr.record_id) {
    throw new Error('tabela e record_id obrigatórios');
  }

  // For indicadores, set dados to N/D marker
  if (corr.tabela === 'indicadores_interseccionais') {
    const { error } = await sb
      .from('indicadores_interseccionais')
      .update({
        dados: { valor: '⏳ N/D — Pendente de verificação humana', auditado: false },
        tendencia: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', corr.record_id);
    if (error) throw error;
  }

  return { tabela: corr.tabela, record_id: corr.record_id, marked: true };
}

function generateCodePatch(corr: CorrectionRequest): string {
  // Generate a human-readable patch instruction for StatisticsData.ts
  const lines = [
    `// ═══ PATCH: ${corr.item_id} ═══`,
    `// Arquivo: src/components/estatisticas/StatisticsData.ts`,
    `// Origem: ${corr.origem}`,
    `// Indicador: ${corr.indicador}`,
    `//`,
    `// ANTES: ${corr.valor_anterior}`,
    `// DEPOIS: ${corr.valor_corrigido ?? '⏳ N/D — Pendente de verificação humana'}`,
    `//`,
    `// Notas: ${corr.notas || 'Correção aprovada via Triple-Check Fase 3'}`,
    `// ════════════════════════════`,
  ];
  return lines.join('\n');
}

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

const FORBIDDEN_TERMS = [
  'estimad',
  'estimativa',
  'aproxim',
  'interpol',
  'proje',
  'previs',
  'arredond',
  'inferid',
  'suposi',
  'guess',
];

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
          const result = await applyDbCorrection(sb, corr);
          results.push({ item_id: corr.item_id, status: 'applied', ...result });
        } else if (corr.action === 'mark_nd') {
          const result = await markAsND(sb, corr);
          results.push({ item_id: corr.item_id, status: 'marked_nd', ...result });
        } else if (corr.action === 'generate_patch') {
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

function hasForbiddenTerm(value: string): boolean {
  const lower = value.toLowerCase();
  return FORBIDDEN_TERMS.some(term => lower.includes(term));
}

function assertGoldenRuleValue(value: unknown, context: string): void {
  if (typeof value === 'string' && hasForbiddenTerm(value)) {
    throw new Error(`Regra de Ouro violada em ${context}: valor contém indício de estimativa/projeção.`);
  }
}

async function applyDbCorrection(sb: any, corr: CorrectionRequest) {
  const allowedTables = ['indicadores_interseccionais', 'dados_orcamentarios', 'conclusoes_analiticas'];

  if (!corr.tabela || !allowedTables.includes(corr.tabela)) {
    throw new Error(`Tabela não permitida: ${corr.tabela}`);
  }
  if (!corr.record_id) {
    throw new Error('record_id obrigatório para correção em BD');
  }

  const updateData: Record<string, any> = {};

  if (corr.tabela === 'indicadores_interseccionais') {
    if (corr.campo === 'dados') {
      assertGoldenRuleValue(corr.valor_corrigido, 'dados.valor_confirmado_fonte');

      const { data: existing, error: fetchErr } = await sb
        .from('indicadores_interseccionais')
        .select('dados')
        .eq('id', corr.record_id)
        .single();

      if (fetchErr) {
        throw new Error(`Falha ao carregar indicador antes da correção: ${fetchErr.message}`);
      }

      const previous = existing?.dados && typeof existing.dados === 'object' ? existing.dados : {};
      updateData.dados = {
        ...previous,
        valor_confirmado_fonte: corr.valor_corrigido,
        status_validacao: 'confirmado_por_triple_check',
        regra_ouro: {
          sem_estimativa: true,
          sem_interpolacao: true,
          sem_projecao: true,
          validado_em: new Date().toISOString(),
        },
      };
    } else if (corr.campo === 'nome') {
      assertGoldenRuleValue(corr.valor_corrigido, 'nome');
      updateData.nome = corr.valor_corrigido;
    } else if (corr.campo === 'url_fonte') {
      if (typeof corr.valor_corrigido !== 'string' || !/^https?:\/\//i.test(corr.valor_corrigido)) {
        throw new Error('Regra de Ouro: url_fonte deve ser um deep link válido (http/https).');
      }
      updateData.url_fonte = corr.valor_corrigido;
    } else if (corr.campo === 'fonte') {
      assertGoldenRuleValue(corr.valor_corrigido, 'fonte');
      updateData.fonte = corr.valor_corrigido;
    } else if (corr.campo === 'tendencia') {
      assertGoldenRuleValue(corr.valor_corrigido, 'tendencia');
      updateData.tendencia = corr.valor_corrigido;
    }
  } else if (corr.tabela === 'dados_orcamentarios') {
    const numFields = ['dotacao_inicial', 'dotacao_autorizada', 'empenhado', 'liquidado', 'pago', 'percentual_execucao'];
    if (corr.campo && numFields.includes(corr.campo)) {
      updateData[corr.campo] = corr.valor_corrigido != null ? Number(corr.valor_corrigido) : null;
    } else if (corr.campo === 'url_fonte') {
      if (typeof corr.valor_corrigido !== 'string' || !/^https?:\/\//i.test(corr.valor_corrigido)) {
        throw new Error('url_fonte inválida para registro orçamentário.');
      }
      updateData.url_fonte = corr.valor_corrigido;
    } else if (corr.campo === 'observacoes') {
      assertGoldenRuleValue(corr.valor_corrigido, 'observacoes');
      updateData.observacoes = corr.valor_corrigido;
    }
  } else if (corr.tabela === 'conclusoes_analiticas') {
    if (corr.campo === 'argumento_central') {
      assertGoldenRuleValue(corr.valor_corrigido, 'argumento_central');
      updateData.argumento_central = corr.valor_corrigido;
    } else if (corr.campo === 'titulo') {
      assertGoldenRuleValue(corr.valor_corrigido, 'titulo');
      updateData.titulo = corr.valor_corrigido;
    }
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error(`Campo '${corr.campo}' não reconhecido para tabela '${corr.tabela}'`);
  }

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

  if (corr.tabela === 'indicadores_interseccionais') {
    const { error } = await sb
      .from('indicadores_interseccionais')
      .update({
        dados: {
          valor: '⏳ N/D — Pendente de verificação humana',
          auditado: false,
          regra_ouro: {
            sem_estimativa: true,
            sem_interpolacao: true,
            sem_projecao: true,
            motivo: 'ausência de dado exato verificável',
          },
        },
        tendencia: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', corr.record_id);
    if (error) throw error;
  }

  return { tabela: corr.tabela, record_id: corr.record_id, marked: true };
}

function generateCodePatch(corr: CorrectionRequest): string {
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
    `// Regra de Ouro: sem estimativas, sem projeções, sem interpolação`,
    `// ════════════════════════════`,
  ];
  return lines.join('\n');
}

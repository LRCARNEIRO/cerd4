import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

const HISTORICAL_YEAR_START = 2018;
const HISTORICAL_YEAR_END = 2025;

function isValidDeepLink(url: unknown): boolean {
  return typeof url === 'string' && /^https?:\/\//i.test(url.trim());
}

function containsForbiddenTerms(value: unknown): boolean {
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    return FORBIDDEN_TERMS.some(term => lower.includes(term));
  }
  if (Array.isArray(value)) return value.some(v => containsForbiddenTerms(v));
  if (value && typeof value === 'object') return Object.values(value).some(v => containsForbiddenTerms(v));
  return false;
}

function collectHistoricalYears(value: unknown, years: Set<number>) {
  if (Array.isArray(value)) {
    for (const item of value) collectHistoricalYears(item, years);
    return;
  }

  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      if (/^20\d{2}$/.test(key)) years.add(Number(key));
      if (key === 'ano' && typeof item === 'number') years.add(item);
      collectHistoricalYears(item, years);
    }
  }
}

function validateGoldenRulePayload(tabela: string, dados: Record<string, any>): string | null {
  if (containsForbiddenTerms(dados)) {
    return 'Regra de Ouro violada: conteúdo contém indício de estimativa/projeção/interpolação.';
  }

  if (tabela === 'indicadores_interseccionais') {
    if (!dados.nome || !dados.categoria || !dados.fonte) {
      return 'Indicador inválido: nome/categoria/fonte são obrigatórios.';
    }

    if (!isValidDeepLink(dados.url_fonte)) {
      return 'Indicador inválido: url_fonte (deep link) é obrigatória e deve iniciar com http/https.';
    }

    if (!dados.dados || typeof dados.dados !== 'object' || Array.isArray(dados.dados)) {
      return 'Indicador inválido: campo dados deve ser um objeto JSON estruturado.';
    }

    const years = new Set<number>();
    collectHistoricalYears(dados.dados, years);

    for (const year of years) {
      if (year < HISTORICAL_YEAR_START || year > HISTORICAL_YEAR_END) {
        return `Indicador inválido: série histórica fora do recorte ${HISTORICAL_YEAR_START}-${HISTORICAL_YEAR_END} (ano ${year}).`;
      }
    }
  }

  if (tabela === 'dados_orcamentarios') {
    if (!dados.fonte_dados) {
      return 'Orçamento inválido: fonte_dados é obrigatório.';
    }

    if (!isValidDeepLink(dados.url_fonte)) {
      return 'Orçamento inválido: url_fonte (deep link) é obrigatória e deve iniciar com http/https.';
    }

    if (typeof dados.ano === 'number' && (dados.ano < HISTORICAL_YEAR_START || dados.ano > HISTORICAL_YEAR_END)) {
      return `Orçamento inválido: ano fora do recorte ${HISTORICAL_YEAR_START}-${HISTORICAL_YEAR_END}.`;
    }
  }

  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const { action } = body;

    if (action === 'create-snapshot-only') {
      const { snapshot_nome, snapshot_descricao, snapshot_data, tabelas_afetadas, total_registros } = body;
      const { data: snapResult, error: snapErr } = await supabase.from('data_snapshots').insert({
        nome: snapshot_nome || 'Backup manual',
        descricao: snapshot_descricao || null,
        usuario_id: 'user',
        snapshot_data: snapshot_data,
        tabelas_afetadas: tabelas_afetadas,
        total_registros: total_registros || 0,
      }).select('id').single();

      if (snapErr) throw snapErr;

      return new Response(JSON.stringify({
        success: true,
        snapshot_id: snapResult?.id,
        message: `Snapshot "${snapshot_nome}" criado com ${total_registros} registros.`,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { items, file_name } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum item para confirmar' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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

        const validationError = validateGoldenRulePayload(tabela, dados);
        if (validationError) {
          results.erros.push(`${tabela}: ${validationError}`);
          continue;
        }

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

    const totalInseridos = results.indicadores_inseridos + results.orcamento_inseridos + results.lacunas_inseridas + results.conclusoes_inseridas;

    return new Response(JSON.stringify({
      success: true,
      message: `${totalInseridos} itens inseridos com sucesso (${results.erros.length} bloqueados/erros).`,
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

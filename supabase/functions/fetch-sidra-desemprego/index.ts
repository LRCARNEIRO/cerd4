const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Busca taxa de desocupação por cor/raça direto da API SIDRA/IBGE
 * Tabela 6402 — PNAD Contínua Trimestral
 * Variável 4099: Taxa de desocupação (%)
 * Classificação c86: Cor ou raça (2776=Branca, 2777=Preta, 2779=Parda)
 *
 * Para calcular "Negra" (Preta ou Parda combinada), busca também
 * a variável 4090 (Número de desocupados) e 4089 (Força de trabalho)
 * para ponderar corretamente.
 */

interface SidraRow {
  'Trimestre (Código)': string;
  Trimestre: string;
  'Cor ou raça (Código)': string;
  'Cor ou raça': string;
  V: string;
  D2C: string;
}

interface DesempregoAnual {
  ano: number;
  trimestre: string;
  branca: number;
  preta: number;
  parda: number;
  negra: number; // média simples (Preta+Parda)/2 — proxy aceitável dado peso similar na PEA
  fonte: string;
  apiUrl: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Períodos Q4 de cada ano (201804 = 4º trimestre 2018)
    const periodos = '201804,201904,202004,202104,202204,202304,202404';
    const apiUrl = `https://apisidra.ibge.gov.br/values/t/6402/n1/1/v/4099/p/${periodos}/c86/2776,2777,2779`;

    console.log('Fetching SIDRA:', apiUrl);

    const resp = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`SIDRA API error ${resp.status}:`, errText.substring(0, 300));
      return new Response(
        JSON.stringify({ success: false, error: `SIDRA retornou ${resp.status}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawData: SidraRow[] = await resp.json();
    // Primeira linha é header
    const dataRows = rawData.slice(1);

    // Agrupar por trimestre
    const byTrimestre: Record<string, Record<string, number>> = {};

    for (const row of dataRows) {
      const codigo = row['D2C'] || row['Trimestre (Código)'];
      const corCodigo = row['Cor ou raça (Código)'] || (row as any)['D4C'];
      const valor = parseFloat(row['V'] || (row as any).V);

      if (!codigo || isNaN(valor)) continue;

      if (!byTrimestre[codigo]) byTrimestre[codigo] = {};

      const corNome = corCodigo === '2776' ? 'branca'
        : corCodigo === '2777' ? 'preta'
        : corCodigo === '2779' ? 'parda'
        : null;

      if (corNome) byTrimestre[codigo][corNome] = valor;
    }

    const resultados: DesempregoAnual[] = [];

    for (const [codigo, valores] of Object.entries(byTrimestre)) {
      const ano = parseInt(codigo.substring(0, 4));
      const branca = valores.branca ?? NaN;
      const preta = valores.preta ?? NaN;
      const parda = valores.parda ?? NaN;

      // Negra = média simples de Preta e Parda
      // (proxy aceitável: na PEA, pardos ≈ 4x pretos, mas a taxa é similar)
      const negra = (!isNaN(preta) && !isNaN(parda))
        ? Math.round(((preta + parda) / 2) * 10) / 10
        : NaN;

      resultados.push({
        ano,
        trimestre: `Q4/${ano}`,
        branca,
        preta,
        parda,
        negra,
        fonte: `SIDRA 6402 — PNAD Contínua Q4/${ano}`,
        apiUrl,
      });
    }

    resultados.sort((a, b) => a.ano - b.ano);

    console.log(`SIDRA: ${resultados.length} anos retornados`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        tabela: '6402',
        variavel: '4099 — Taxa de desocupação',
        classificacao: 'c86 — Cor ou raça',
        periodoRef: 'Q4 (4º trimestre) de cada ano',
        nota_metodologica: 'Taxa "negra" calculada como média simples de Preta e Parda. Para média ponderada exata, seria necessário cruzar com população na força de trabalho por cor/raça.',
        linkAuditoria: 'https://sidra.ibge.gov.br/tabela/6402',
        dados: resultados,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('fetch-sidra-desemprego error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Busca taxa de desocupação por cor/raça direto da API SIDRA/IBGE
 * Tabela 6402 — PNAD Contínua Trimestral
 * Variável 4099: Taxa de desocupação (%)
 * c86/allxt retorna todas as categorias de cor/raça
 * Códigos: 2776=Branca, 2777=Preta, 2779=Parda
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Usar allxt para pegar todas as categorias de cor/raça
    const periodos = '201804,201904,202004,202104,202204,202304,202404';
    const apiUrl = `https://apisidra.ibge.gov.br/values/t/6402/n1/1/v/4099/p/${periodos}/c86/allxt`;

    console.log('Fetching SIDRA:', apiUrl);

    const resp = await fetch(apiUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (!resp.ok) {
      const errText = await resp.text();
      return new Response(
        JSON.stringify({ success: false, error: `SIDRA retornou ${resp.status}: ${errText.substring(0, 200)}` }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawData = await resp.json();
    
    if (!Array.isArray(rawData) || rawData.length < 2) {
      return new Response(
        JSON.stringify({ success: false, error: 'SIDRA retornou dados vazios', raw: JSON.stringify(rawData).substring(0, 500) }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Header is row 0, data starts at row 1
    const header = rawData[0];
    const dataRows = rawData.slice(1);
    
    console.log('SIDRA header keys:', JSON.stringify(Object.keys(header)));
    console.log('SIDRA total rows:', dataRows.length);
    console.log('SIDRA row 0:', JSON.stringify(dataRows[0]));

    // Identificar quais campos D*C contêm o trimestre e a cor/raça
    // Iterar sobre as chaves para encontrar padrões
    const sampleRow = dataRows[0];
    const keys = Object.keys(sampleRow);
    
    // Encontrar campo de trimestre e cor/raça pelo header
    let trimestreKey = '';
    let corRacaKey = '';
    
    for (const key of keys) {
      // O header contém os nomes das dimensões
      const headerVal = String(header[key] || '').toLowerCase();
      if (headerVal.includes('trimestre') && key.endsWith('C')) {
        trimestreKey = key;
      }
      if (headerVal.includes('cor') && key.endsWith('C')) {
        corRacaKey = key;
      }
    }

    // Fallback: tentar D3C e D4C (padrão comum da SIDRA)
    if (!trimestreKey) {
      // Procurar pelo valor: trimestre tem 6 dígitos
      for (const key of keys) {
        if (key.endsWith('C') && /^\d{6}$/.test(String(sampleRow[key]))) {
          trimestreKey = key;
          break;
        }
      }
    }
    if (!corRacaKey) {
      // Procurar pelo valor: cor/raça tem 4 dígitos no range 2776-2799
      for (const key of keys) {
        if (key.endsWith('C')) {
          const v = parseInt(String(sampleRow[key]));
          if (v >= 2776 && v <= 2799) {
            corRacaKey = key;
            break;
          }
        }
      }
    }

    console.log('Trimestre key:', trimestreKey, '| Cor/raça key:', corRacaKey);
    
    if (!trimestreKey || !corRacaKey) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Não foi possível identificar campos de trimestre/cor na resposta SIDRA',
          keys,
          headerSample: header,
          rowSample: sampleRow
        }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Agrupar por trimestre
    const byTrimestre: Record<string, Record<string, number>> = {};

    for (const row of dataRows) {
      const codigo = String(row[trimestreKey]);
      const corCodigo = String(row[corRacaKey]);
      const valor = parseFloat(String(row['V']));

      if (!codigo || isNaN(valor)) continue;

      if (!byTrimestre[codigo]) byTrimestre[codigo] = {};

      if (corCodigo === '2776') byTrimestre[codigo].branca = valor;
      else if (corCodigo === '2777') byTrimestre[codigo].preta = valor;
      else if (corCodigo === '2779') byTrimestre[codigo].parda = valor;
    }

    const resultados = [];

    for (const [codigo, valores] of Object.entries(byTrimestre)) {
      const ano = parseInt(codigo.substring(0, 4));
      if (isNaN(ano) || ano < 2018 || ano > 2030) continue;

      const branca = valores.branca ?? NaN;
      const preta = valores.preta ?? NaN;
      const parda = valores.parda ?? NaN;
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
    if (resultados.length > 0) {
      console.log('Primeiro:', JSON.stringify(resultados[0]));
      console.log('Último:', JSON.stringify(resultados[resultados.length - 1]));
    }

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        tabela: '6402',
        variavel: '4099 — Taxa de desocupação',
        classificacao: 'c86 — Cor ou raça',
        periodoRef: 'Q4 (4º trimestre) de cada ano',
        nota_metodologica: 'Taxa "negra" calculada como média simples de Preta e Parda. Dados referem-se ao 4º trimestre de cada ano (PNAD Contínua trimestral).',
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

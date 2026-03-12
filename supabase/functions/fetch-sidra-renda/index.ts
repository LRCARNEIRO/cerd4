const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Busca rendimento médio mensal real por cor/raça direto da API SIDRA/IBGE
 * Tabela 6405 — PNAD Contínua Trimestral
 * Variável 5929: Rendimento médio mensal real (R$)
 * 
 * MÉTODO: Busca os 4 trimestres de cada ano e calcula a MÉDIA ANUAL
 * Média Anual = (Q1 + Q2 + Q3 + Q4) / 4
 */

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Todos os 4 trimestres de 2018 a 2024
    const periodos = [
      '201801,201802,201803,201804',
      '201901,201902,201903,201904',
      '202001,202002,202003,202004',
      '202101,202102,202103,202104',
      '202201,202202,202203,202204',
      '202301,202302,202303,202304',
      '202401,202402,202403,202404',
    ].join(',');

    const apiUrl = `https://apisidra.ibge.gov.br/values/t/6405/n1/1/v/5929/p/${periodos}/c86/allxt`;

    console.log('Fetching SIDRA renda (all quarters):', apiUrl);

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
        JSON.stringify({ success: false, error: 'SIDRA retornou dados vazios' }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const dataRows = rawData.slice(1);
    const keys = Object.keys(dataRows[0]);

    // Detectar campos de trimestre e cor/raça
    let trimestreKey = '';
    let corRacaKey = '';

    for (const key of keys) {
      if (key.endsWith('C')) {
        const v = String(dataRows[0][key]);
        if (/^\d{6}$/.test(v) && parseInt(v) >= 201800) trimestreKey = key;
        const num = parseInt(v);
        if (num >= 2776 && num <= 2799) corRacaKey = key;
      }
    }

    if (!trimestreKey || !corRacaKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Campos não identificados na resposta SIDRA', keys }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Agrupar: ano → cor → [valores trimestrais]
    const byAnoAndCor: Record<number, Record<string, number[]>> = {};

    for (const row of dataRows) {
      const codigo = String(row[trimestreKey]);
      const corCodigo = String(row[corRacaKey]);
      const valor = parseFloat(String(row['V']));

      if (!codigo || isNaN(valor)) continue;

      const ano = parseInt(codigo.substring(0, 4));
      if (isNaN(ano) || ano < 2018 || ano > 2030) continue;

      let corNome = '';
      if (corCodigo === '2776') corNome = 'branca';
      else if (corCodigo === '2777') corNome = 'preta';
      else if (corCodigo === '2779') corNome = 'parda';
      else continue;

      if (!byAnoAndCor[ano]) byAnoAndCor[ano] = {};
      if (!byAnoAndCor[ano][corNome]) byAnoAndCor[ano][corNome] = [];
      byAnoAndCor[ano][corNome].push(valor);
    }

    const resultados = [];

    for (const [anoStr, cores] of Object.entries(byAnoAndCor)) {
      const ano = parseInt(anoStr);

      const avg = (arr: number[] | undefined) => {
        if (!arr || arr.length === 0) return NaN;
        return Math.round(arr.reduce((s, v) => s + v, 0) / arr.length);
      };

      const branca = avg(cores.branca);
      const preta = avg(cores.preta);
      const parda = avg(cores.parda);
      // Negra = média simples de Preta e Parda (valores médios anuais)
      const negra = (!isNaN(preta) && !isNaN(parda))
        ? Math.round((preta + parda) / 2)
        : NaN;

      const trimCount = cores.branca?.length || 0;

      resultados.push({
        ano,
        branca,
        preta,
        parda,
        negra,
        trimestresUsados: trimCount,
        detalhe: {
          branca_trimestres: cores.branca || [],
          preta_trimestres: cores.preta || [],
          parda_trimestres: cores.parda || [],
        },
        fonte: `SIDRA 6405 — Média anual ${ano} (${trimCount} trimestres)`,
        apiUrl,
      });
    }

    resultados.sort((a, b) => a.ano - b.ano);

    console.log(`SIDRA renda: ${resultados.length} anos (média anual de 4 trimestres)`);

    return new Response(
      JSON.stringify({
        success: true,
        timestamp: new Date().toISOString(),
        tabela: '6405',
        variavel: '5929 — Rendimento médio mensal real',
        classificacao: 'c86 — Cor ou raça (Branca, Preta, Parda)',
        metodo: 'Média aritmética dos 4 trimestres de cada ano: (Q1+Q2+Q3+Q4)/4',
        nota_metodologica: 'Rendimento "negro" = média simples de Preta e Parda. Cada valor anual é a média dos 4 trimestres da PNAD Contínua. Valores em R$ correntes.',
        linkAuditoria: 'https://sidra.ibge.gov.br/tabela/6405',
        dados: resultados,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('fetch-sidra-renda error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Erro' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

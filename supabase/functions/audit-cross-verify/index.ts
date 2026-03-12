const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Auditoria Cruzada Triple-Cross — Verificação por Tipo de Fonte
 *
 * Tipo A (PDF):  Firecrawl scrape → IA adversária (GPT-5) busca o número
 * Tipo B (API):  Fetch direto da API SIDRA/JSON → parse automático → comparação
 * Tipo C (Web):  Fetch URL → markdown → IA adversária busca o número
 *
 * REGRA: IA que CRIOU o dado (Gemini) NÃO audita. GPT-5 é o auditor adversário.
 */

interface IndicatorToVerify {
  id: string;
  indicador: string;
  valor_declarado: number | string | null;
  fonte_declarada: string;
  tipo_fonte: 'pdf' | 'api_sidra' | 'web' | 'desconhecido';
  url_fonte: string | null;
  // SIDRA-specific: pre-built API URL with params
  sidra_api_url?: string;
  // For SIDRA: which cell to look for
  sidra_filtros?: {
    variavel?: string;
    periodo?: string;
    cor_raca?: string;
    faixa_etaria?: string;
    descricao_busca?: string;
  };
  pagina_pdf?: string;
  secao: string;
}

interface VerifyResult {
  id: string;
  indicador: string;
  secao: string;
  valor_declarado: string;
  valor_encontrado: string | null;
  veredito: 'confirmado' | 'divergente' | 'nao_encontrado' | 'link_quebrado' | 'erro';
  tipo_fonte: string;
  confianca: number;
  divergencia: string | null;
  metodo_verificacao: string;
  detalhes: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY não configurada');

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');

    const { indicators }: { indicators: IndicatorToVerify[] } = await req.json();

    if (!indicators?.length) {
      return new Response(
        JSON.stringify({ error: 'Nenhum indicador para verificar' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Cross-verify: ${indicators.length} indicadores`);

    const results: VerifyResult[] = [];

    // Process sequentially to avoid rate limits
    for (const ind of indicators) {
      let result: VerifyResult;

      switch (ind.tipo_fonte) {
        case 'api_sidra':
          result = await verifySidra(ind);
          break;
        case 'pdf':
          result = await verifyPdf(ind, firecrawlKey, lovableApiKey);
          break;
        case 'web':
          result = await verifyWeb(ind, lovableApiKey);
          break;
        default:
          result = {
            id: ind.id,
            indicador: ind.indicador,
            secao: ind.secao,
            valor_declarado: String(ind.valor_declarado ?? 'N/D'),
            valor_encontrado: null,
            veredito: 'erro',
            tipo_fonte: ind.tipo_fonte,
            confianca: 0,
            divergencia: 'Tipo de fonte desconhecido',
            metodo_verificacao: 'nenhum',
            detalhes: null,
          };
      }

      results.push(result);
      // Small delay between requests to avoid rate limiting
      await new Promise(r => setTimeout(r, 500));
    }

    const summary = {
      total: results.length,
      confirmados: results.filter(r => r.veredito === 'confirmado').length,
      divergentes: results.filter(r => r.veredito === 'divergente').length,
      nao_encontrados: results.filter(r => r.veredito === 'nao_encontrado').length,
      links_quebrados: results.filter(r => r.veredito === 'link_quebrado').length,
      erros: results.filter(r => r.veredito === 'erro').length,
    };

    return new Response(
      JSON.stringify({ success: true, timestamp: new Date().toISOString(), summary, results }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('cross-verify error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// ═══════════════════════════════════════════════
// TIPO B: Verificação via API SIDRA (JSON direto)
// ═══════════════════════════════════════════════
async function verifySidra(ind: IndicatorToVerify): Promise<VerifyResult> {
  const base: VerifyResult = {
    id: ind.id,
    indicador: ind.indicador,
    secao: ind.secao,
    valor_declarado: String(ind.valor_declarado ?? 'N/D'),
    valor_encontrado: null,
    veredito: 'erro',
    tipo_fonte: 'api_sidra',
    confianca: 0,
    divergencia: null,
    metodo_verificacao: 'API SIDRA JSON direta',
    detalhes: null,
  };

  if (!ind.sidra_api_url) {
    base.veredito = 'erro';
    base.divergencia = 'URL da API SIDRA não fornecida. Necessário montar a query com parâmetros.';
    return base;
  }

  try {
    console.log(`SIDRA fetch: ${ind.sidra_api_url}`);
    const resp = await fetch(ind.sidra_api_url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!resp.ok) {
      base.veredito = 'link_quebrado';
      base.divergencia = `API SIDRA retornou status ${resp.status}`;
      await resp.text();
      return base;
    }

    const data = await resp.json();

    if (!Array.isArray(data) || data.length < 2) {
      base.veredito = 'nao_encontrado';
      base.divergencia = 'API SIDRA retornou dados vazios ou formato inesperado';
      base.detalhes = JSON.stringify(data).substring(0, 500);
      return base;
    }

    // SIDRA returns array: [header_row, ...data_rows]
    // Each row has keys like "V" (valor), "D1N" (categoria 1 nome), "D2N" (cat 2 nome), etc.
    // Find the row matching our filters
    const filtros = ind.sidra_filtros;
    const dataRows = data.slice(1); // skip header

    let matchedRow: any = null;
    let matchDetails = '';

    if (filtros?.descricao_busca) {
      // Search by description text in any dimension
      const search = filtros.descricao_busca.toLowerCase();
      matchedRow = dataRows.find((row: any) => {
        const allValues = Object.values(row).join(' ').toLowerCase();
        return allValues.includes(search);
      });
      matchDetails = `Busca: "${filtros.descricao_busca}"`;
    } else {
      // Try to match by cor_raca and faixa_etaria in dimension names
      matchedRow = dataRows.find((row: any) => {
        const dims = Object.entries(row)
          .filter(([k]) => k.match(/^D\dN$/))
          .map(([, v]) => String(v).toLowerCase());

        const matchCor = !filtros?.cor_raca || dims.some(d => d.includes(filtros.cor_raca!.toLowerCase()));
        const matchIdade = !filtros?.faixa_etaria || dims.some(d => d.includes(filtros.faixa_etaria!.toLowerCase()));
        const matchPeriodo = !filtros?.periodo || String(row['D1C'] || row['D2C'] || row['D3C'] || '').includes(filtros.periodo);
        return matchCor && matchIdade && matchPeriodo;
      });
      matchDetails = `Filtros: cor=${filtros?.cor_raca}, idade=${filtros?.faixa_etaria}, período=${filtros?.periodo}`;
    }

    if (!matchedRow) {
      base.veredito = 'nao_encontrado';
      base.divergencia = `Nenhuma linha correspondente encontrada. ${matchDetails}`;
      base.detalhes = `${dataRows.length} linhas retornadas. Primeira: ${JSON.stringify(dataRows[0]).substring(0, 300)}`;
      return base;
    }

    // Extract value
    const valorApi = matchedRow['V'];
    if (valorApi === null || valorApi === undefined || valorApi === '...' || valorApi === '-' || valorApi === 'X') {
      base.veredito = 'nao_encontrado';
      base.valor_encontrado = String(valorApi);
      base.divergencia = `Valor na API SIDRA: "${valorApi}" (dado não disponível/suprimido)`;
      return base;
    }

    base.valor_encontrado = String(valorApi);

    // Compare values
    const declaredNum = parseFloat(String(ind.valor_declarado));
    const foundNum = parseFloat(String(valorApi));

    if (!isNaN(declaredNum) && !isNaN(foundNum)) {
      const diff = Math.abs(declaredNum - foundNum);
      const tolerance = Math.max(Math.abs(declaredNum) * 0.02, 0.1); // 2% or 0.1

      if (diff <= tolerance) {
        base.veredito = 'confirmado';
        base.confianca = 95;
        base.detalhes = `API: ${foundNum}, Sistema: ${declaredNum}, Diff: ${diff.toFixed(2)}. ${matchDetails}`;
      } else {
        base.veredito = 'divergente';
        base.confianca = 90;
        base.divergencia = `Sistema=${declaredNum}, API SIDRA=${foundNum} (diff=${diff.toFixed(2)})`;
        base.detalhes = matchDetails;
      }
    } else {
      // String comparison
      if (String(ind.valor_declarado).trim() === String(valorApi).trim()) {
        base.veredito = 'confirmado';
        base.confianca = 90;
      } else {
        base.veredito = 'divergente';
        base.divergencia = `Sistema="${ind.valor_declarado}", API="${valorApi}"`;
      }
    }

    return base;

  } catch (err: unknown) {
    base.veredito = 'erro';
    base.divergencia = err instanceof Error ? err.message : 'Erro ao consultar SIDRA';
    return base;
  }
}

// ═══════════════════════════════════════════════
// TIPO A: Verificação via PDF (Firecrawl + IA adversária GPT-5)
// ═══════════════════════════════════════════════
async function verifyPdf(
  ind: IndicatorToVerify,
  firecrawlKey: string | undefined,
  lovableApiKey: string,
): Promise<VerifyResult> {
  const base: VerifyResult = {
    id: ind.id,
    indicador: ind.indicador,
    secao: ind.secao,
    valor_declarado: String(ind.valor_declarado ?? 'N/D'),
    valor_encontrado: null,
    veredito: 'erro',
    tipo_fonte: 'pdf',
    confianca: 0,
    divergencia: null,
    metodo_verificacao: 'Firecrawl PDF + GPT-5 adversário',
    detalhes: null,
  };

  if (!ind.url_fonte) {
    base.veredito = 'nao_encontrado';
    base.divergencia = 'Sem URL de fonte PDF';
    return base;
  }

  // Step 1: Extract PDF content
  let pdfContent = '';
  if (firecrawlKey) {
    try {
      const fcResp = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: ind.url_fonte,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      });

      if (fcResp.ok) {
        const fcData = await fcResp.json();
        pdfContent = (fcData.data?.markdown || fcData.markdown || '').substring(0, 20000);
      } else {
        const errText = await fcResp.text();
        base.veredito = 'link_quebrado';
        base.divergencia = `Firecrawl PDF erro: ${fcResp.status}`;
        base.detalhes = errText.substring(0, 200);
        return base;
      }
    } catch (err) {
      base.veredito = 'link_quebrado';
      base.divergencia = `Firecrawl falhou: ${err instanceof Error ? err.message : 'erro'}`;
      return base;
    }
  } else {
    base.veredito = 'erro';
    base.divergencia = 'FIRECRAWL_API_KEY não configurada — PDF não pode ser acessado';
    return base;
  }

  if (!pdfContent || pdfContent.length < 100) {
    base.veredito = 'nao_encontrado';
    base.divergencia = 'PDF extraído vazio ou muito curto';
    return base;
  }

  // Step 2: GPT-5 (adversarial) verifies the number
  return await verifyWithAdversarialAI(ind, base, pdfContent, lovableApiKey, 'PDF');
}

// ═══════════════════════════════════════════════
// TIPO C: Verificação via Web (fetch + IA adversária GPT-5)
// ═══════════════════════════════════════════════
async function verifyWeb(
  ind: IndicatorToVerify,
  lovableApiKey: string,
): Promise<VerifyResult> {
  const base: VerifyResult = {
    id: ind.id,
    indicador: ind.indicador,
    secao: ind.secao,
    valor_declarado: String(ind.valor_declarado ?? 'N/D'),
    valor_encontrado: null,
    veredito: 'erro',
    tipo_fonte: 'web',
    confianca: 0,
    divergencia: null,
    metodo_verificacao: 'Fetch web + GPT-5 adversário',
    detalhes: null,
  };

  if (!ind.url_fonte) {
    base.veredito = 'nao_encontrado';
    base.divergencia = 'Sem URL de fonte web';
    return base;
  }

  try {
    const resp = await fetch(ind.url_fonte, {
      headers: { 'User-Agent': 'CERD-IV-Auditor/1.0' },
      redirect: 'follow',
    });

    if (!resp.ok) {
      base.veredito = 'link_quebrado';
      base.divergencia = `URL retornou ${resp.status}`;
      await resp.text();
      return base;
    }

    const html = await resp.text();
    // Strip HTML tags for text content
    const textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 15000);

    if (textContent.length < 50) {
      base.veredito = 'nao_encontrado';
      base.divergencia = 'Conteúdo web extraído vazio';
      return base;
    }

    return await verifyWithAdversarialAI(ind, base, textContent, lovableApiKey, 'Web');

  } catch (err: unknown) {
    base.veredito = 'link_quebrado';
    base.divergencia = err instanceof Error ? err.message : 'Erro ao acessar URL';
    return base;
  }
}

// ═══════════════════════════════════════════════
// IA ADVERSÁRIA (GPT-5) — Verifica o dado no conteúdo extraído
// ═══════════════════════════════════════════════
async function verifyWithAdversarialAI(
  ind: IndicatorToVerify,
  base: VerifyResult,
  sourceContent: string,
  lovableApiKey: string,
  sourceType: string,
): Promise<VerifyResult> {
  const prompt = `Você é um auditor ADVERSÁRIO verificando dados de um relatório para a ONU (CERD IV).
Seu papel é CONTESTAR o dado — só confirme se o número exato estiver na fonte.

INDICADOR: ${ind.indicador}
VALOR DECLARADO NO SISTEMA: ${ind.valor_declarado}
FONTE DECLARADA: ${ind.fonte_declarada}
${ind.pagina_pdf ? `PÁGINA CITADA: ${ind.pagina_pdf}` : ''}

CONTEÚDO EXTRAÍDO DA FONTE (${sourceType}):
${sourceContent}

INSTRUÇÕES RÍGIDAS:
1. Procure o número EXATO "${ind.valor_declarado}" no conteúdo acima
2. Se encontrar o número exato (tolerância ±0.5 para decimais), classifique como "confirmado"
3. Se encontrar um número DIFERENTE para o mesmo indicador, classifique como "divergente"
4. Se o indicador não aparece no conteúdo, classifique como "nao_encontrado"
5. NUNCA aceite estimativas, projeções, interpolações ou arredondamentos
6. Se o número parece plausível mas NÃO está literalmente no texto, é "nao_encontrado"

Retorne APENAS JSON:
{
  "veredito": "confirmado" | "divergente" | "nao_encontrado",
  "valor_encontrado": "valor exato encontrado ou null",
  "confianca": 0-100,
  "divergencia": "descrição se divergente ou null",
  "trecho_fonte": "trecho exato do texto onde encontrou o dado (max 200 chars) ou null"
}`;

  try {
    // Use GPT-5 as adversarial model (different from Gemini that created the data)
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.05,
        max_tokens: 800,
      }),
    });

    if (response.status === 429) {
      base.veredito = 'erro';
      base.divergencia = 'Rate limit excedido. Tente novamente.';
      await response.text();
      return base;
    }

    if (response.status === 402) {
      base.veredito = 'erro';
      base.divergencia = 'Créditos insuficientes para IA.';
      await response.text();
      return base;
    }

    if (!response.ok) {
      base.veredito = 'erro';
      base.divergencia = `IA adversária retornou ${response.status}`;
      await response.text();
      return base;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      base.veredito = 'erro';
      base.divergencia = 'IA adversária não retornou JSON válido';
      base.detalhes = content.substring(0, 300);
      return base;
    }

    const aiResult = JSON.parse(jsonMatch[0]);
    base.veredito = aiResult.veredito || 'erro';
    base.valor_encontrado = aiResult.valor_encontrado || null;
    base.confianca = aiResult.confianca || 0;
    base.divergencia = aiResult.divergencia || null;
    base.detalhes = aiResult.trecho_fonte || null;

    return base;

  } catch (err: unknown) {
    base.veredito = 'erro';
    base.divergencia = `Falha na IA adversária: ${err instanceof Error ? err.message : 'erro'}`;
    return base;
  }
}

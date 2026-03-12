const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Auditoria Cruzada Triple-Cross — Verificação por Tipo de Fonte
 *
 * Tipo A (PDF):  Firecrawl scrape → IA adversária (GPT-5) busca o número
 * Tipo B (API):  Fetch direto da API SIDRA/JSON → parse automático → comparação
 * Tipo C (Web):  Firecrawl scrape URL → IA adversária busca o número
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
  sidra_api_url?: string;
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

    for (const ind of indicators) {
      let result: VerifyResult;

      try {
        switch (ind.tipo_fonte) {
          case 'api_sidra':
            result = await verifySidra(ind);
            break;
          case 'pdf':
            result = await verifyPdfOrWeb(ind, firecrawlKey, lovableApiKey);
            break;
          case 'web':
            result = await verifyWeb(ind, firecrawlKey, lovableApiKey);
            break;
          default:
            result = makeBase(ind, 'erro', 'Tipo de fonte desconhecido', 'nenhum');
        }
      } catch (err: unknown) {
        console.error(`Error verifying ${ind.id}:`, err);
        result = makeBase(ind, 'erro', err instanceof Error ? err.message : 'Erro inesperado', 'nenhum');
      }

      results.push(result);
      await new Promise(r => setTimeout(r, 800));
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

function makeBase(
  ind: IndicatorToVerify,
  veredito: VerifyResult['veredito'],
  divergencia: string | null,
  metodo: string,
): VerifyResult {
  return {
    id: ind.id,
    indicador: ind.indicador,
    secao: ind.secao,
    valor_declarado: String(ind.valor_declarado ?? 'N/D'),
    valor_encontrado: null,
    veredito,
    tipo_fonte: ind.tipo_fonte,
    confianca: 0,
    divergencia,
    metodo_verificacao: metodo,
    detalhes: null,
  };
}

// ═══════════════════════════════════════════════
// TIPO B: Verificação via API SIDRA (JSON direto)
// ═══════════════════════════════════════════════
async function verifySidra(ind: IndicatorToVerify): Promise<VerifyResult> {
  const base = makeBase(ind, 'erro', null, 'API SIDRA JSON direta');

  if (!ind.sidra_api_url) {
    base.divergencia = 'URL da API SIDRA não fornecida';
    return base;
  }

  try {
    console.log(`SIDRA fetch: ${ind.sidra_api_url}`);
    const resp = await fetch(ind.sidra_api_url, {
      headers: { 'Accept': 'application/json' },
    });

    if (!resp.ok) {
      const errText = await resp.text();
      base.veredito = 'link_quebrado';
      base.divergencia = `API SIDRA retornou status ${resp.status}: ${errText.substring(0, 200)}`;
      return base;
    }

    const data = await resp.json();

    if (!Array.isArray(data) || data.length < 2) {
      base.veredito = 'nao_encontrado';
      base.divergencia = 'API SIDRA retornou dados vazios ou formato inesperado';
      base.detalhes = JSON.stringify(data).substring(0, 500);
      return base;
    }

    const filtros = ind.sidra_filtros;
    const dataRows = data.slice(1);

    let matchedRow: any = null;
    let matchDetails = '';

    if (filtros?.descricao_busca) {
      const search = filtros.descricao_busca.toLowerCase();
      matchedRow = dataRows.find((row: any) => {
        const allValues = Object.values(row).join(' ').toLowerCase();
        return allValues.includes(search);
      });
      matchDetails = `Busca: "${filtros.descricao_busca}"`;
    } else {
      matchedRow = dataRows[0];
      matchDetails = 'Primeira linha de dados';
    }

    if (!matchedRow) {
      base.veredito = 'nao_encontrado';
      base.divergencia = `Nenhuma linha encontrada. ${matchDetails}`;
      base.detalhes = `${dataRows.length} linhas. Primeira: ${JSON.stringify(dataRows[0]).substring(0, 300)}`;
      return base;
    }

    const valorApi = matchedRow['V'];
    if (valorApi === null || valorApi === undefined || valorApi === '...' || valorApi === '-' || valorApi === 'X') {
      base.veredito = 'nao_encontrado';
      base.valor_encontrado = String(valorApi);
      base.divergencia = `Valor SIDRA: "${valorApi}" (suprimido/indisponível)`;
      return base;
    }

    base.valor_encontrado = String(valorApi);

    const declaredNum = parseFloat(String(ind.valor_declarado));
    const foundNum = parseFloat(String(valorApi));

    if (!isNaN(declaredNum) && !isNaN(foundNum)) {
      const diff = Math.abs(declaredNum - foundNum);
      const tolerance = Math.max(Math.abs(declaredNum) * 0.02, 0.1);

      if (diff <= tolerance) {
        base.veredito = 'confirmado';
        base.confianca = 95;
        base.detalhes = `API: ${foundNum}, Sistema: ${declaredNum}, Diff: ${diff.toFixed(2)}`;
      } else {
        base.veredito = 'divergente';
        base.confianca = 90;
        base.divergencia = `Sistema=${declaredNum}, API=${foundNum} (diff=${diff.toFixed(2)})`;
      }
    } else {
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
    base.divergencia = err instanceof Error ? err.message : 'Erro ao consultar SIDRA';
    return base;
  }
}

// ═══════════════════════════════════════════════
// Extrai conteúdo de URL via Firecrawl ou fetch direto
// ═══════════════════════════════════════════════
async function fetchContent(
  url: string,
  firecrawlKey: string | undefined,
): Promise<{ content: string; method: string } | { error: string }> {
  // Tenta Firecrawl primeiro (melhor para PDFs e sites dinâmicos)
  if (firecrawlKey) {
    try {
      const fcResp = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      });

      if (fcResp.ok) {
        const fcData = await fcResp.json();
        const md = (fcData.data?.markdown || fcData.markdown || '').substring(0, 8000);
        if (md.length > 100) {
          return { content: md, method: 'Firecrawl markdown' };
        }
      } else if (fcResp.status === 402) {
        console.log('Firecrawl 402 (créditos insuficientes), fallback para fetch direto');
        await fcResp.text();
      } else {
        const errText = await fcResp.text();
        console.log(`Firecrawl ${fcResp.status}: ${errText.substring(0, 100)}`);
      }
    } catch (err) {
      console.log('Firecrawl error, fallback:', err instanceof Error ? err.message : 'erro');
    }
  }

  // Fallback: fetch direto
  try {
    const resp = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CERD-IV-Auditor/1.0)',
        'Accept': 'text/html,application/xhtml+xml,*/*',
      },
      redirect: 'follow',
    });

    if (!resp.ok) {
      await resp.text();
      return { error: `URL retornou ${resp.status}` };
    }

    const html = await resp.text();
    const textContent = html
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 8000);

    if (textContent.length < 50) {
      return { error: 'Conteúdo extraído vazio' };
    }

    return { content: textContent, method: 'Fetch direto HTML→texto' };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : 'Erro ao acessar URL' };
  }
}

// ═══════════════════════════════════════════════
// TIPO A: Verificação via PDF (Firecrawl → fallback fetch → GPT-5)
// ═══════════════════════════════════════════════
async function verifyPdfOrWeb(
  ind: IndicatorToVerify,
  firecrawlKey: string | undefined,
  lovableApiKey: string,
): Promise<VerifyResult> {
  const base = makeBase(ind, 'erro', null, 'Firecrawl PDF + GPT-5 adversário');

  if (!ind.url_fonte) {
    base.veredito = 'nao_encontrado';
    base.divergencia = 'Sem URL de fonte PDF';
    return base;
  }

  const result = await fetchContent(ind.url_fonte, firecrawlKey);

  if ('error' in result) {
    base.veredito = 'link_quebrado';
    base.divergencia = result.error;
    return base;
  }

  base.metodo_verificacao = `${result.method} + GPT-5 adversário`;
  return await verifyWithAdversarialAI(ind, base, result.content, lovableApiKey, 'PDF');
}

// ═══════════════════════════════════════════════
// TIPO C: Verificação via Web (Firecrawl → fallback fetch → GPT-5)
// ═══════════════════════════════════════════════
async function verifyWeb(
  ind: IndicatorToVerify,
  firecrawlKey: string | undefined,
  lovableApiKey: string,
): Promise<VerifyResult> {
  const base = makeBase(ind, 'erro', null, 'Fetch web + GPT-5 adversário');

  if (!ind.url_fonte) {
    base.veredito = 'nao_encontrado';
    base.divergencia = 'Sem URL de fonte web';
    return base;
  }

  const result = await fetchContent(ind.url_fonte, firecrawlKey);

  if ('error' in result) {
    base.veredito = 'link_quebrado';
    base.divergencia = result.error;
    return base;
  }

  base.metodo_verificacao = `${result.method} + GPT-5 adversário`;
  return await verifyWithAdversarialAI(ind, base, result.content, lovableApiKey, 'Web');
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
  // Truncar conteúdo para evitar erro 400 por payload grande
  const truncatedContent = sourceContent.substring(0, 6000);

  const prompt = `Você é um auditor ADVERSÁRIO verificando dados de um relatório para a ONU (CERD IV).
Seu papel é CONTESTAR o dado — só confirme se o número exato estiver na fonte.

INDICADOR: ${ind.indicador}
VALOR DECLARADO NO SISTEMA: ${ind.valor_declarado}
FONTE DECLARADA: ${ind.fonte_declarada}
${ind.pagina_pdf ? `PÁGINA CITADA: ${ind.pagina_pdf}` : ''}

CONTEÚDO EXTRAÍDO DA FONTE (${sourceType}):
${truncatedContent}

INSTRUÇÕES:
1. Procure o número EXATO "${ind.valor_declarado}" no conteúdo
2. Se encontrar (tolerância ±0.5), classifique como "confirmado"
3. Se encontrar número DIFERENTE para o mesmo indicador, classifique como "divergente"
4. Se o indicador não aparece, classifique como "nao_encontrado"
5. NUNCA aceite estimativas ou projeções

Retorne APENAS JSON:
{"veredito":"confirmado|divergente|nao_encontrado","valor_encontrado":"valor ou null","confianca":0-100,"divergencia":"descrição ou null","trecho_fonte":"trecho max 150 chars ou null"}`;

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.05,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`AI gateway ${response.status}: ${errBody.substring(0, 200)}`);
      base.veredito = 'erro';
      base.divergencia = `IA adversária retornou ${response.status}`;
      base.detalhes = errBody.substring(0, 200);
      return base;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      base.veredito = 'erro';
      base.divergencia = 'IA não retornou JSON válido';
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
    base.divergencia = `Falha na IA: ${err instanceof Error ? err.message : 'erro'}`;
    return base;
  }
}

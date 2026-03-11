import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

/**
 * Protocolo Triple-Check — Fase 2: Verificação Cruzada
 * 
 * Recebe itens do inventário (não-A) e:
 * 1. Usa Firecrawl para extrair conteúdo da URL fonte
 * 2. Usa IA (Gemini Flash) para comparar valor declarado vs fonte
 * 3. Usa segunda IA (GPT-5-nano) para confirmar veredito
 * 4. Retorna vereditos: confirmado | divergente | link_quebrado | sem_fonte
 */

interface AuditItem {
  id: string;
  tipo: string;
  secao: string;
  indicador: string;
  valor_atual: string | number | null;
  fonte_declarada: string;
  url_fonte: string | null;
  origem: string;
  nivel_confianca: string;
  notas_auditoria: string | null;
}

interface VerifyRequest {
  items: AuditItem[];
  batch_size?: number;
}

interface Verdict {
  item_id: string;
  indicador: string;
  secao: string;
  nivel_original: string;
  veredito: 'confirmado' | 'divergente' | 'link_quebrado' | 'sem_fonte' | 'erro';
  nivel_sugerido: 'A' | 'B' | 'C' | 'pendente';
  valor_fonte: string | null;
  valor_declarado: string | null;
  divergencia: string | null;
  acao_sugerida: string | null;
  confianca_ia: number; // 0-100
  modelo_1: string;
  modelo_2: string | null;
  concordancia: boolean;
  url_verificada: string | null;
  firecrawl_status: 'ok' | 'erro' | 'nao_aplicavel';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!lovableApiKey) throw new Error('LOVABLE_API_KEY não configurada');

    const firecrawlKey = Deno.env.get('FIRECRAWL_API_KEY');
    
    const { items, batch_size = 5 }: VerifyRequest = await req.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(JSON.stringify({ error: 'Nenhum item para verificar' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Fase 2: Verificando ${items.length} itens (batch_size=${batch_size})`);

    const verdicts: Verdict[] = [];
    const batches = [];
    for (let i = 0; i < items.length; i += batch_size) {
      batches.push(items.slice(i, i + batch_size));
    }

    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(item => verifyItem(item, firecrawlKey, lovableApiKey))
      );
      verdicts.push(...batchResults);
    }

    // Summary stats
    const summary = {
      total: verdicts.length,
      confirmados: verdicts.filter(v => v.veredito === 'confirmado').length,
      divergentes: verdicts.filter(v => v.veredito === 'divergente').length,
      links_quebrados: verdicts.filter(v => v.veredito === 'link_quebrado').length,
      sem_fonte: verdicts.filter(v => v.veredito === 'sem_fonte').length,
      erros: verdicts.filter(v => v.veredito === 'erro').length,
      concordancia_ia: verdicts.filter(v => v.concordancia).length,
    };

    return new Response(JSON.stringify({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
      verdicts,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('audit-verify error:', error);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function verifyItem(
  item: AuditItem,
  firecrawlKey: string | undefined,
  lovableApiKey: string,
): Promise<Verdict> {
  const base: Verdict = {
    item_id: item.id,
    indicador: item.indicador,
    secao: item.secao,
    nivel_original: item.nivel_confianca,
    veredito: 'erro',
    nivel_sugerido: 'pendente',
    valor_fonte: null,
    valor_declarado: String(item.valor_atual ?? 'N/D'),
    divergencia: null,
    acao_sugerida: null,
    confianca_ia: 0,
    modelo_1: 'gemini-2.5-flash',
    modelo_2: null,
    concordancia: false,
    url_verificada: item.url_fonte,
    firecrawl_status: 'nao_aplicavel',
  };

  try {
    // Step 1: If URL exists, try Firecrawl
    let sourceContent = '';
    if (item.url_fonte && firecrawlKey) {
      try {
        const fcResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${firecrawlKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: item.url_fonte,
            formats: ['markdown'],
            onlyMainContent: true,
          }),
        });

        if (fcResponse.ok) {
          const fcData = await fcResponse.json();
          sourceContent = (fcData.data?.markdown || fcData.markdown || '').substring(0, 15000);
          base.firecrawl_status = 'ok';
        } else if (fcResponse.status === 402) {
          base.firecrawl_status = 'erro';
          sourceContent = '[Firecrawl: créditos insuficientes]';
        } else {
          base.firecrawl_status = 'erro';
          base.veredito = 'link_quebrado';
          base.nivel_sugerido = 'C';
          base.acao_sugerida = `URL retornou status ${fcResponse.status}. Buscar URL atualizada.`;
          return base;
        }
      } catch (fcErr) {
        base.firecrawl_status = 'erro';
        base.veredito = 'link_quebrado';
        base.nivel_sugerido = 'C';
        base.acao_sugerida = 'URL inacessível. Verificar manualmente ou buscar substituta.';
        return base;
      }
    } else if (item.url_fonte && !firecrawlKey) {
      // No Firecrawl, try direct fetch
      try {
        const directResp = await fetch(item.url_fonte, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; CERDBot/1.0)' },
        });
        if (!directResp.ok) {
          base.firecrawl_status = 'erro';
          base.veredito = 'link_quebrado';
          base.nivel_sugerido = 'C';
          base.acao_sugerida = `URL retornou ${directResp.status}`;
          return base;
        }
        const text = await directResp.text();
        sourceContent = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().substring(0, 10000);
        base.firecrawl_status = 'ok';
      } catch {
        base.firecrawl_status = 'erro';
      }
    }

    if (!item.url_fonte) {
      base.veredito = 'sem_fonte';
      base.nivel_sugerido = 'C';
      base.acao_sugerida = 'Indicador sem URL de fonte. Localizar fonte primária oficial.';
      return base;
    }

    // Step 2: AI Model 1 (Gemini Flash) — verify
    const prompt1 = buildVerificationPrompt(item, sourceContent);
    const ai1Result = await callAI(lovableApiKey, 'google/gemini-2.5-flash', prompt1);

    if (!ai1Result) {
      base.veredito = 'erro';
      base.acao_sugerida = 'Falha na verificação por IA (modelo 1)';
      return base;
    }

    base.modelo_1 = 'gemini-2.5-flash';
    base.valor_fonte = ai1Result.valor_encontrado || null;
    base.confianca_ia = ai1Result.confianca || 0;

    // Step 3: AI Model 2 (GPT-5-nano) — confirm for divergences
    if (ai1Result.veredito === 'divergente' || ai1Result.confianca < 70) {
      const prompt2 = buildConfirmationPrompt(item, sourceContent, ai1Result);
      const ai2Result = await callAI(lovableApiKey, 'openai/gpt-5-nano', prompt2);
      
      if (ai2Result) {
        base.modelo_2 = 'gpt-5-nano';
        base.concordancia = ai1Result.veredito === ai2Result.veredito;
        
        // Use consensus
        if (base.concordancia) {
          base.veredito = ai1Result.veredito;
          base.confianca_ia = Math.round((ai1Result.confianca + ai2Result.confianca) / 2);
        } else {
          // Disagreement → mark as pendente for human review
          base.veredito = 'divergente';
          base.confianca_ia = Math.min(ai1Result.confianca, ai2Result.confianca);
          base.acao_sugerida = `Modelos discordam: M1=${ai1Result.veredito}, M2=${ai2Result.veredito}. Requer revisão humana.`;
        }
      } else {
        base.veredito = ai1Result.veredito;
      }
    } else {
      base.veredito = ai1Result.veredito;
      base.concordancia = true;
    }

    // Determine suggested level
    if (base.veredito === 'confirmado') {
      base.nivel_sugerido = 'A';
      base.acao_sugerida = base.nivel_original !== 'A' ? 'Promover para Nível A (confirmado por IA + fonte).' : null;
    } else if (base.veredito === 'divergente') {
      base.nivel_sugerido = 'C';
      base.divergencia = ai1Result.divergencia || 'Valor não confere com a fonte';
      base.acao_sugerida = `Valor divergente: declarado="${base.valor_declarado}", fonte="${base.valor_fonte}". Corrigir ou marcar N/D.`;
    } else if (base.veredito === 'link_quebrado') {
      base.nivel_sugerido = 'C';
      base.acao_sugerida = 'Link quebrado. Buscar URL substituta via Firecrawl.';
    }

    return base;
  } catch (err: unknown) {
    base.veredito = 'erro';
    base.acao_sugerida = err instanceof Error ? err.message : 'Erro na verificação';
    return base;
  }
}

function buildVerificationPrompt(item: AuditItem, sourceContent: string): string {
  return `Você é um auditor de dados do relatório CERD IV do Brasil para a ONU.

TAREFA: Verificar se o valor declarado de um indicador corresponde ao que a fonte oficial apresenta.

INDICADOR: ${item.indicador}
SEÇÃO: ${item.secao}
VALOR DECLARADO: ${item.valor_atual}
FONTE DECLARADA: ${item.fonte_declarada}
URL: ${item.url_fonte || 'N/D'}

CONTEÚDO EXTRAÍDO DA FONTE:
${sourceContent || '[Conteúdo não disponível]'}

Retorne APENAS um JSON válido:
{
  "veredito": "confirmado" | "divergente",
  "valor_encontrado": "valor exato encontrado na fonte ou null",
  "confianca": 0-100,
  "divergencia": "descrição da divergência ou null",
  "nota": "observação breve"
}

Regras:
- "confirmado" = valor declarado bate com a fonte (tolerância ±2% para números)
- "divergente" = valor não encontrado, diferente, estimado, interpolado, projetado ou sem dado exato
- Se detectar termos como estimativa/aproximação/projeção/interpolação, classifique como "divergente"
- confianca < 50 se o conteúdo não menciona o indicador
- Seja rigoroso: dados para ONU exigem precisão absoluta e Regra de Ouro`,
}

function buildConfirmationPrompt(item: AuditItem, sourceContent: string, firstResult: any): string {
  return `Você é um segundo auditor independente verificando dados do CERD IV.

Um primeiro modelo avaliou este indicador:
- Indicador: ${item.indicador}
- Valor declarado: ${item.valor_atual}
- Fonte: ${item.fonte_declarada}
- Veredito do modelo 1: ${firstResult.veredito}
- Valor encontrado pelo modelo 1: ${firstResult.valor_encontrado}

CONTEÚDO DA FONTE:
${sourceContent || '[Não disponível]'}

Confirme ou conteste o veredito. Retorne APENAS JSON:
{
  "veredito": "confirmado" | "divergente",
  "confianca": 0-100,
  "nota": "sua análise independente"
}`;
}

async function callAI(apiKey: string, model: string, prompt: string): Promise<any> {
  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error(`AI ${model} error: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (err) {
    console.error(`AI ${model} call failed:`, err);
    return null;
  }
}

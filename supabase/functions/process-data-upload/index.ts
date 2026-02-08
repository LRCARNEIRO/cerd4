import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractedData {
  indicadores?: Array<{
    nome: string;
    categoria: string;
    fonte: string;
    url_fonte?: string;
    dados: Record<string, Record<string, number>>;
    tendencia?: string;
  }>;
  orcamento?: Array<{
    programa: string;
    orgao: string;
    esfera: string;
    ano: number;
    dotacao_inicial?: number;
    dotacao_autorizada?: number;
    empenhado?: number;
    liquidado?: number;
    pago?: number;
    percentual_execucao?: number;
    grupo_focal?: string;
    eixo_tematico?: string;
    fonte_dados: string;
    url_fonte?: string;
    observacoes?: string;
  }>;
  lacunas?: Array<{
    paragrafo: string;
    tema: string;
    descricao_lacuna: string;
    eixo_tematico: string;
    grupo_focal: string;
    status_cumprimento: string;
    prioridade: string;
    evidencias_encontradas?: string[];
    fontes_dados?: string[];
  }>;
  conclusoes?: Array<{
    titulo: string;
    tipo: string;
    periodo: string;
    argumento_central: string;
    evidencias?: string[];
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    // Authentication check
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });
    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    console.log(`Authenticated user: ${claimsData.claims.sub}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('Nenhum arquivo enviado');
    }

    // File validation
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: 'Arquivo muito grande. Limite: 10MB' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const allowedTypes = ['text/plain', 'text/csv', 'application/pdf', 'text/markdown', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (file.type && !allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({ error: 'Tipo de arquivo não suportado' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processando arquivo: ${file.name}, tipo: ${file.type}, tamanho: ${file.size}`);

    // Read file content
    const fileContent = await file.text();
    
    // Use AI to extract structured data from the document
    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é um especialista em extração de dados de documentos sobre políticas públicas raciais no Brasil.
            
Analise o documento fornecido e extraia dados estruturados nas seguintes categorias:

1. INDICADORES SOCIAIS (taxa de desemprego, homicídios, educação, saúde por raça/gênero)
2. DADOS ORÇAMENTÁRIOS (programas, valores, anos, órgãos responsáveis)
3. LACUNAS/RECOMENDAÇÕES (pontos pendentes de relatórios ONU/CERD)
4. CONCLUSÕES ANALÍTICAS (análises e achados do documento)

Para cada dado encontrado, identifique:
- A FONTE (nome da instituição/pesquisa)
- A DATA/ANO de referência
- O URL de origem se disponível
- Valores numéricos com evolução temporal quando possível (2018-2026)

Retorne um JSON válido com a estrutura:
{
  "indicadores": [{ "nome": "", "categoria": "", "fonte": "", "url_fonte": "", "dados": {"brancos": {"2018": N, "2019": N...}, "negros": {...}}, "tendencia": "aumento|reducao|estável" }],
  "orcamento": [{ "programa": "", "orgao": "", "esfera": "federal|estadual|municipal", "ano": N, "dotacao_autorizada": N, "empenhado": N, "pago": N, "percentual_execucao": N, "grupo_focal": "", "fonte_dados": "", "url_fonte": "", "observacoes": "" }],
  "lacunas": [{ "paragrafo": "", "tema": "", "descricao_lacuna": "", "eixo_tematico": "", "grupo_focal": "", "status_cumprimento": "", "prioridade": "", "evidencias_encontradas": [], "fontes_dados": [] }],
  "conclusoes": [{ "titulo": "", "tipo": "", "periodo": "", "argumento_central": "", "evidencias": [] }]
}

IMPORTANTE: 
- Extraia TODOS os dados numéricos disponíveis
- Preserve as referências exatas das fontes
- Identifique a evolução temporal (série histórica 2018-2026)
- Classifique corretamente por esfera (federal/estadual/municipal)
- Se não encontrar dados de uma categoria, retorne array vazio []`
          },
          {
            role: 'user',
            content: `Analise este documento e extraia os dados estruturados:\n\n${fileContent.substring(0, 50000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 8000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', errorText);
      throw new Error('Erro ao processar documento com IA');
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || '';
    
    console.log('AI response received, parsing...');
    
    // Extract JSON from AI response
    let extractedData: ExtractedData;
    try {
      // Try to find JSON in the response
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('AI Content:', aiContent.substring(0, 1000));
      extractedData = { indicadores: [], orcamento: [], lacunas: [], conclusoes: [] };
    }

    // Sanitize and validate extracted data before insertion
    const sanitizeStr = (s: any, maxLen: number): string => {
      if (typeof s !== 'string') return '';
      return s.substring(0, maxLen).trim();
    };
    const sanitizeNum = (n: any): number | null => {
      if (n === null || n === undefined) return null;
      const parsed = Number(n);
      return isNaN(parsed) ? null : parsed;
    };
    const validEsferas = ['federal', 'estadual', 'municipal'];
    const validTendencias = ['aumento', 'reducao', 'estável'];

    // Insert extracted data into database
    const results = {
      indicadores_inseridos: 0,
      orcamento_inseridos: 0,
      lacunas_inseridas: 0,
      conclusoes_inseridas: 0,
      erros: [] as string[],
    };

    // Limit total records to prevent abuse
    const MAX_RECORDS = 100;

    // Insert indicadores
    if (extractedData.indicadores && extractedData.indicadores.length > 0) {
      for (const ind of extractedData.indicadores.slice(0, MAX_RECORDS)) {
        try {
          if (!ind.nome || !ind.categoria || !ind.fonte) {
            results.erros.push(`Indicador inválido: campos obrigatórios ausentes`);
            continue;
          }
          const { error } = await supabase.from('indicadores_interseccionais').insert({
            nome: sanitizeStr(ind.nome, 255),
            categoria: sanitizeStr(ind.categoria, 100),
            fonte: sanitizeStr(ind.fonte, 255),
            url_fonte: ind.url_fonte ? sanitizeStr(ind.url_fonte, 500) : null,
            dados: ind.dados || {},
            tendencia: validTendencias.includes(ind.tendencia || '') ? ind.tendencia : null,
            desagregacao_raca: true,
            desagregacao_genero: true,
          });
          if (error) throw error;
          results.indicadores_inseridos++;
        } catch (e: any) {
          results.erros.push(`Indicador ${sanitizeStr(ind.nome, 50)}: ${e.message}`);
        }
      }
    }

    // Insert orcamento
    if (extractedData.orcamento && extractedData.orcamento.length > 0) {
      for (const orc of extractedData.orcamento.slice(0, MAX_RECORDS)) {
        try {
          if (!orc.programa || !orc.orgao || !orc.ano || !orc.fonte_dados) {
            results.erros.push(`Orçamento inválido: campos obrigatórios ausentes`);
            continue;
          }
          const ano = Number(orc.ano);
          if (isNaN(ano) || ano < 2000 || ano > 2030) {
            results.erros.push(`Orçamento ${orc.programa}: ano inválido ${orc.ano}`);
            continue;
          }
          const esfera = validEsferas.includes(orc.esfera) ? orc.esfera : 'federal';
          const { error } = await supabase.from('dados_orcamentarios').insert({
            programa: sanitizeStr(orc.programa, 255),
            orgao: sanitizeStr(orc.orgao, 255),
            esfera,
            ano,
            dotacao_inicial: sanitizeNum(orc.dotacao_inicial),
            dotacao_autorizada: sanitizeNum(orc.dotacao_autorizada),
            empenhado: sanitizeNum(orc.empenhado),
            liquidado: sanitizeNum(orc.liquidado),
            pago: sanitizeNum(orc.pago),
            percentual_execucao: sanitizeNum(orc.percentual_execucao),
            grupo_focal: orc.grupo_focal ? sanitizeStr(orc.grupo_focal, 100) : null,
            eixo_tematico: orc.eixo_tematico ? sanitizeStr(orc.eixo_tematico, 100) : null,
            fonte_dados: sanitizeStr(orc.fonte_dados, 255),
            url_fonte: orc.url_fonte ? sanitizeStr(orc.url_fonte, 500) : null,
            observacoes: orc.observacoes ? sanitizeStr(orc.observacoes, 1000) : null,
          });
          if (error) throw error;
          results.orcamento_inseridos++;
        } catch (e: any) {
          results.erros.push(`Orçamento ${sanitizeStr(orc.programa, 50)}/${orc.ano}: ${e.message}`);
        }
      }
    }

    // Insert lacunas
    const validEixosTematicos = ['legislacao_justica', 'politicas_institucionais', 'seguranca_publica', 'saude', 'educacao', 'trabalho_renda', 'terra_territorio', 'cultura_patrimonio', 'participacao_social', 'dados_estatisticas'];
    const validGruposFocais = ['negros', 'indigenas', 'quilombolas', 'ciganos', 'religioes_matriz_africana', 'juventude_negra', 'mulheres_negras', 'lgbtqia_negros', 'pcd_negros', 'idosos_negros', 'geral'];
    const validStatus = ['cumprido', 'parcialmente_cumprido', 'nao_cumprido', 'retrocesso', 'em_andamento'];
    const validPrioridades = ['critica', 'alta', 'media', 'baixa'];

    if (extractedData.lacunas && extractedData.lacunas.length > 0) {
      for (const lac of extractedData.lacunas.slice(0, MAX_RECORDS)) {
        try {
          if (!lac.paragrafo || !lac.tema || !lac.descricao_lacuna || !lac.eixo_tematico) {
            results.erros.push(`Lacuna inválida: campos obrigatórios ausentes`);
            continue;
          }
          if (!validEixosTematicos.includes(lac.eixo_tematico)) {
            results.erros.push(`Lacuna ${sanitizeStr(lac.tema, 50)}: eixo_tematico inválido`);
            continue;
          }
          const { error } = await supabase.from('lacunas_identificadas').insert({
            paragrafo: sanitizeStr(lac.paragrafo, 50),
            tema: sanitizeStr(lac.tema, 255),
            descricao_lacuna: sanitizeStr(lac.descricao_lacuna, 2000),
            eixo_tematico: lac.eixo_tematico as any,
            grupo_focal: (validGruposFocais.includes(lac.grupo_focal) ? lac.grupo_focal : 'geral') as any,
            tipo_observacao: 'recomendacao' as any,
            status_cumprimento: (validStatus.includes(lac.status_cumprimento) ? lac.status_cumprimento : 'nao_cumprido') as any,
            prioridade: (validPrioridades.includes(lac.prioridade) ? lac.prioridade : 'media') as any,
            evidencias_encontradas: Array.isArray(lac.evidencias_encontradas) ? lac.evidencias_encontradas.slice(0, 20).map((e: any) => sanitizeStr(e, 500)) : null,
            fontes_dados: Array.isArray(lac.fontes_dados) ? lac.fontes_dados.slice(0, 20).map((f: any) => sanitizeStr(f, 500)) : null,
          });
          if (error) throw error;
          results.lacunas_inseridas++;
        } catch (e: any) {
          results.erros.push(`Lacuna ${sanitizeStr(lac.tema, 50)}: ${e.message}`);
        }
      }
    }

    // Insert conclusoes
    if (extractedData.conclusoes && extractedData.conclusoes.length > 0) {
      for (const conc of extractedData.conclusoes.slice(0, MAX_RECORDS)) {
        try {
          if (!conc.titulo || !conc.tipo || !conc.periodo || !conc.argumento_central) {
            results.erros.push(`Conclusão inválida: campos obrigatórios ausentes`);
            continue;
          }
          const { error } = await supabase.from('conclusoes_analiticas').insert({
            titulo: sanitizeStr(conc.titulo, 255),
            tipo: sanitizeStr(conc.tipo, 100),
            periodo: sanitizeStr(conc.periodo, 50),
            argumento_central: sanitizeStr(conc.argumento_central, 5000),
            evidencias: Array.isArray(conc.evidencias) ? conc.evidencias.slice(0, 20).map((e: any) => sanitizeStr(e, 500)) : null,
          });
          if (error) throw error;
          results.conclusoes_inseridas++;
        } catch (e: any) {
          results.erros.push(`Conclusão ${conc.titulo}: ${e.message}`);
        }
      }
    }

    console.log('Processing complete:', results);

    return new Response(JSON.stringify({
      success: true,
      message: `Documento processado com sucesso!`,
      results,
      extractedData: {
        indicadores: extractedData.indicadores?.length || 0,
        orcamento: extractedData.orcamento?.length || 0,
        lacunas: extractedData.lacunas?.length || 0,
        conclusoes: extractedData.conclusoes?.length || 0,
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao processar upload:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

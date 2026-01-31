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
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      throw new Error('Nenhum arquivo enviado');
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

    // Insert extracted data into database
    const results = {
      indicadores_inseridos: 0,
      orcamento_inseridos: 0,
      lacunas_inseridas: 0,
      conclusoes_inseridas: 0,
      erros: [] as string[],
    };

    // Insert indicadores
    if (extractedData.indicadores && extractedData.indicadores.length > 0) {
      for (const ind of extractedData.indicadores) {
        try {
          const { error } = await supabase.from('indicadores_interseccionais').insert({
            nome: ind.nome,
            categoria: ind.categoria,
            fonte: ind.fonte,
            url_fonte: ind.url_fonte,
            dados: ind.dados,
            tendencia: ind.tendencia,
            desagregacao_raca: true,
            desagregacao_genero: true,
          });
          if (error) throw error;
          results.indicadores_inseridos++;
        } catch (e: any) {
          results.erros.push(`Indicador ${ind.nome}: ${e.message}`);
        }
      }
    }

    // Insert orcamento
    if (extractedData.orcamento && extractedData.orcamento.length > 0) {
      for (const orc of extractedData.orcamento) {
        try {
          const { error } = await supabase.from('dados_orcamentarios').insert({
            programa: orc.programa,
            orgao: orc.orgao,
            esfera: orc.esfera || 'federal',
            ano: orc.ano,
            dotacao_inicial: orc.dotacao_inicial,
            dotacao_autorizada: orc.dotacao_autorizada,
            empenhado: orc.empenhado,
            liquidado: orc.liquidado,
            pago: orc.pago,
            percentual_execucao: orc.percentual_execucao,
            grupo_focal: orc.grupo_focal,
            eixo_tematico: orc.eixo_tematico,
            fonte_dados: orc.fonte_dados,
            url_fonte: orc.url_fonte,
            observacoes: orc.observacoes,
          });
          if (error) throw error;
          results.orcamento_inseridos++;
        } catch (e: any) {
          results.erros.push(`Orçamento ${orc.programa}/${orc.ano}: ${e.message}`);
        }
      }
    }

    // Insert lacunas
    if (extractedData.lacunas && extractedData.lacunas.length > 0) {
      for (const lac of extractedData.lacunas) {
        try {
          const { error } = await supabase.from('lacunas_identificadas').insert({
            paragrafo: lac.paragrafo,
            tema: lac.tema,
            descricao_lacuna: lac.descricao_lacuna,
            eixo_tematico: lac.eixo_tematico as any,
            grupo_focal: (lac.grupo_focal || 'geral') as any,
            tipo_observacao: 'recomendacao' as any,
            status_cumprimento: (lac.status_cumprimento || 'nao_cumprido') as any,
            prioridade: (lac.prioridade || 'media') as any,
            evidencias_encontradas: lac.evidencias_encontradas,
            fontes_dados: lac.fontes_dados,
          });
          if (error) throw error;
          results.lacunas_inseridas++;
        } catch (e: any) {
          results.erros.push(`Lacuna ${lac.tema}: ${e.message}`);
        }
      }
    }

    // Insert conclusoes
    if (extractedData.conclusoes && extractedData.conclusoes.length > 0) {
      for (const conc of extractedData.conclusoes) {
        try {
          const { error } = await supabase.from('conclusoes_analiticas').insert({
            titulo: conc.titulo,
            tipo: conc.tipo,
            periodo: conc.periodo,
            argumento_central: conc.argumento_central,
            evidencias: conc.evidencias,
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

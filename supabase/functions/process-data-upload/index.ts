import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
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

const SYSTEM_PROMPT = `Você é um especialista em extração de dados de documentos sobre políticas públicas raciais, direitos humanos e discriminação racial no contexto do Brasil e da ONU/CERD.

Analise o documento fornecido e extraia dados estruturados nas seguintes categorias:

1. INDICADORES SOCIAIS (taxa de desemprego, homicídios, educação, saúde por raça/gênero)
2. DADOS ORÇAMENTÁRIOS (programas, valores, anos, órgãos responsáveis)
3. LACUNAS/RECOMENDAÇÕES (pontos pendentes, recomendações de organismos internacionais, compromissos assumidos)
4. CONCLUSÕES ANALÍTICAS (análises, achados, posicionamentos e compromissos do documento)

IMPORTANTE para documentos internacionais como a Declaração de Durban:
- Extraia TODAS as recomendações e compromissos como LACUNAS (mesmo que sejam metas futuras)
- Extraia os principais posicionamentos e achados como CONCLUSÕES
- Use "geral" como grupo_focal quando não especificado
- Use eixos temáticos válidos: legislacao_justica, politicas_institucionais, seguranca_publica, saude, educacao, trabalho_renda, terra_territorio, cultura_patrimonio, participacao_social, dados_estatisticas
- Use status: cumprido, parcialmente_cumprido, nao_cumprido, retrocesso, em_andamento
- Use prioridades: critica, alta, media, baixa
- Use grupos focais: negros, indigenas, quilombolas, ciganos, religioes_matriz_africana, juventude_negra, mulheres_negras, lgbtqia_negros, pcd_negros, idosos_negros, geral

Retorne um JSON válido com a estrutura:
{
  "indicadores": [{ "nome": "", "categoria": "", "fonte": "", "url_fonte": "", "dados": {"grupo1": {"ano": valor}}, "tendencia": "aumento|reducao|estável" }],
  "orcamento": [{ "programa": "", "orgao": "", "esfera": "federal|estadual|municipal", "ano": N, "dotacao_autorizada": N, "empenhado": N, "pago": N, "percentual_execucao": N, "grupo_focal": "", "fonte_dados": "", "url_fonte": "", "observacoes": "" }],
  "lacunas": [{ "paragrafo": "§N", "tema": "", "descricao_lacuna": "", "eixo_tematico": "", "grupo_focal": "", "status_cumprimento": "", "prioridade": "", "evidencias_encontradas": [], "fontes_dados": [] }],
  "conclusoes": [{ "titulo": "", "tipo": "achado|recomendacao|compromisso|analise", "periodo": "YYYY ou YYYY-YYYY", "argumento_central": "", "evidencias": [] }]
}

Se não encontrar dados de uma categoria, retorne array vazio [].
Extraia até 30 itens mais relevantes por categoria. Seja conciso nos textos.
IMPORTANTE: Retorne APENAS o JSON, sem markdown, sem comentários, sem explicações.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')!;

    const authHeader = req.headers.get('Authorization');
    let userId = 'anonymous';
    if (authHeader?.startsWith('Bearer ')) {
      try {
        const authClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: userData } = await authClient.auth.getUser();
        if (userData?.user) userId = userData.user.id;
      } catch (_e) { /* skip */ }
    }
    console.log(`Processing upload for user: ${userId}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) throw new Error('Nenhum arquivo enviado');

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return new Response(JSON.stringify({ error: 'Arquivo muito grande. Limite: 10MB' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const allowedExtensions = ['.txt', '.csv', '.pdf', '.md', '.docx', '.doc', '.xlsx', '.xls'];
    const fileExt = file.name ? '.' + file.name.split('.').pop()?.toLowerCase() : '';
    if (!allowedExtensions.includes(fileExt)) {
      return new Response(JSON.stringify({ error: 'Tipo de arquivo não suportado' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Processando arquivo: ${file.name}, tipo: ${file.type}, tamanho: ${file.size}`);

    // Build AI messages based on file type
    const isPdf = fileExt === '.pdf';
    const isDocx = fileExt === '.docx' || fileExt === '.doc';
    const isBinary = isPdf || isDocx || fileExt === '.xlsx' || fileExt === '.xls';

    let userMessages: any[];

    if (isBinary) {
      // For binary files (PDF, DOCX, XLSX), send as base64 to multimodal Gemini
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const base64Data = base64Encode(uint8Array);
      
      const mimeType = isPdf ? 'application/pdf' 
        : isDocx ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

      console.log(`Sending ${file.name} as base64 (${mimeType}), size: ${base64Data.length} chars`);

      userMessages = [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analise este documento "${file.name}" e extraia todos os dados estruturados possíveis. Extraia o máximo de lacunas, recomendações, conclusões e indicadores relevantes para o monitoramento de políticas públicas raciais no Brasil.`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Data}`
            }
          }
        ]
      }];
    } else {
      // For text files, send content directly
      const fileContent = await file.text();
      userMessages = [{
        role: 'user',
        content: `Analise este documento "${file.name}" e extraia os dados estruturados:\n\n${fileContent.substring(0, 80000)}`
      }];
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90000);

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...userMessages,
        ],
        temperature: 0.1,
        max_tokens: 32000,
      }),
    });

    clearTimeout(timeout);

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API error:', aiResponse.status, errorText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Limite de requisições excedido. Tente novamente em alguns minutos.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('Erro ao processar documento com IA');
    }

    const aiResult = await aiResponse.json();
    const aiContent = aiResult.choices?.[0]?.message?.content || '';
    
    console.log('AI response received, length:', aiContent.length);
    
    let extractedData: ExtractedData;
    try {
      // Remove markdown code fences if present
      let cleanContent = aiContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        extractedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in AI response');
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.log('AI Content preview:', aiContent.substring(0, 500));
      // Attempt to recover truncated JSON by closing open brackets
      try {
        let cleanContent = aiContent.replace(/```json\s*/g, '').replace(/```\s*/g, '');
        let jsonStr = cleanContent.match(/\{[\s\S]*/)?.[0] || '';
        // Remove trailing incomplete entry (after last complete }, or ],)
        jsonStr = jsonStr.replace(/,\s*\{[^}]*$/, '');
        // Count and close open brackets
        const openBraces = (jsonStr.match(/\{/g) || []).length - (jsonStr.match(/\}/g) || []).length;
        const openBrackets = (jsonStr.match(/\[/g) || []).length - (jsonStr.match(/\]/g) || []).length;
        for (let i = 0; i < openBrackets; i++) jsonStr += ']';
        for (let i = 0; i < openBraces; i++) jsonStr += '}';
        extractedData = JSON.parse(jsonStr);
        console.log('Recovered truncated JSON successfully');
      } catch (recoveryError) {
        console.error('JSON recovery also failed:', recoveryError);
        extractedData = { indicadores: [], orcamento: [], lacunas: [], conclusoes: [] };
      }
    }

    const totalItems = (extractedData.indicadores?.length || 0) + 
                       (extractedData.orcamento?.length || 0) + 
                       (extractedData.lacunas?.length || 0) + 
                       (extractedData.conclusoes?.length || 0);

    console.log(`Extracted: ${extractedData.indicadores?.length || 0} indicadores, ${extractedData.orcamento?.length || 0} orcamento, ${extractedData.lacunas?.length || 0} lacunas, ${extractedData.conclusoes?.length || 0} conclusoes`);

    // Build proposed changes for user review (DO NOT auto-insert)
    const proposedChanges: Array<{
      id: string;
      tabela: string;
      tipo: string;
      titulo: string;
      descricao: string;
      impacto: string[];
      dados: Record<string, any>;
    }> = [];

    const sanitizeStr = (s: any, maxLen: number): string => {
      if (typeof s !== 'string') return '';
      return s.substring(0, maxLen).trim();
    };
    const sanitizeNum = (n: any): number | null => {
      if (n === null || n === undefined) return null;
      const parsed = Number(n);
      return isNaN(parsed) ? null : parsed;
    };

    const validEixosTematicos = ['legislacao_justica', 'politicas_institucionais', 'seguranca_publica', 'saude', 'educacao', 'trabalho_renda', 'terra_territorio', 'cultura_patrimonio', 'participacao_social', 'dados_estatisticas'];
    const validGruposFocais = ['negros', 'indigenas', 'quilombolas', 'ciganos', 'religioes_matriz_africana', 'juventude_negra', 'mulheres_negras', 'lgbtqia_negros', 'pcd_negros', 'idosos_negros', 'geral'];
    const validStatus = ['cumprido', 'parcialmente_cumprido', 'nao_cumprido', 'retrocesso', 'em_andamento'];
    const validPrioridades = ['critica', 'alta', 'media', 'baixa'];
    const validEsferas = ['federal', 'estadual', 'municipal'];

    let idx = 0;

    // Build indicador proposals
    for (const ind of (extractedData.indicadores || []).slice(0, 100)) {
      if (!ind.nome || !ind.categoria || !ind.fonte) continue;
      proposedChanges.push({
        id: `change_${idx++}`,
        tabela: 'indicadores_interseccionais',
        tipo: 'indicador',
        titulo: sanitizeStr(ind.nome, 255),
        descricao: `${sanitizeStr(ind.categoria, 100)} — Fonte: ${sanitizeStr(ind.fonte, 100)}`,
        impacto: ['estatisticas', 'relatorios', 'cerd_iv'],
        dados: {
          nome: sanitizeStr(ind.nome, 255),
          categoria: sanitizeStr(ind.categoria, 100),
          fonte: sanitizeStr(ind.fonte, 255),
          url_fonte: ind.url_fonte ? sanitizeStr(ind.url_fonte, 500) : null,
          dados: ind.dados || {},
          tendencia: ['aumento', 'reducao', 'estável'].includes(ind.tendencia || '') ? ind.tendencia : null,
          desagregacao_raca: true,
          desagregacao_genero: true,
        },
      });
    }

    // Build orcamento proposals
    for (const orc of (extractedData.orcamento || []).slice(0, 100)) {
      if (!orc.programa || !orc.orgao || !orc.ano || !orc.fonte_dados) continue;
      const ano = Number(orc.ano);
      if (isNaN(ano) || ano < 2000 || ano > 2030) continue;
      proposedChanges.push({
        id: `change_${idx++}`,
        tabela: 'dados_orcamentarios',
        tipo: 'orcamento',
        titulo: `${sanitizeStr(orc.programa, 100)} (${ano})`,
        descricao: `${sanitizeStr(orc.orgao, 100)} — ${validEsferas.includes(orc.esfera) ? orc.esfera : 'federal'}`,
        impacto: ['orcamento', 'relatorios'],
        dados: {
          programa: sanitizeStr(orc.programa, 255),
          orgao: sanitizeStr(orc.orgao, 255),
          esfera: validEsferas.includes(orc.esfera) ? orc.esfera : 'federal',
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
        },
      });
    }

    // Build lacuna proposals
    for (const lac of (extractedData.lacunas || []).slice(0, 100)) {
      if (!lac.paragrafo || !lac.tema || !lac.descricao_lacuna) continue;
      const eixo = validEixosTematicos.includes(lac.eixo_tematico) ? lac.eixo_tematico : 'politicas_institucionais';
      proposedChanges.push({
        id: `change_${idx++}`,
        tabela: 'lacunas_identificadas',
        tipo: 'lacuna',
        titulo: sanitizeStr(lac.tema, 255),
        descricao: sanitizeStr(lac.descricao_lacuna, 300),
        impacto: ['conclusoes', 'relatorios', 'metas', 'cerd_iv'],
        dados: {
          paragrafo: sanitizeStr(lac.paragrafo, 50),
          tema: sanitizeStr(lac.tema, 255),
          descricao_lacuna: sanitizeStr(lac.descricao_lacuna, 2000),
          eixo_tematico: eixo,
          grupo_focal: validGruposFocais.includes(lac.grupo_focal) ? lac.grupo_focal : 'geral',
          tipo_observacao: 'recomendacao',
          status_cumprimento: validStatus.includes(lac.status_cumprimento) ? lac.status_cumprimento : 'nao_cumprido',
          prioridade: validPrioridades.includes(lac.prioridade) ? lac.prioridade : 'media',
          evidencias_encontradas: Array.isArray(lac.evidencias_encontradas) ? lac.evidencias_encontradas.slice(0, 20).map((e: any) => sanitizeStr(e, 500)) : null,
          fontes_dados: Array.isArray(lac.fontes_dados) ? lac.fontes_dados.slice(0, 20).map((f: any) => sanitizeStr(f, 500)) : null,
        },
      });
    }

    // Build conclusao proposals
    for (const conc of (extractedData.conclusoes || []).slice(0, 100)) {
      if (!conc.titulo || !conc.tipo || !conc.periodo || !conc.argumento_central) continue;
      proposedChanges.push({
        id: `change_${idx++}`,
        tabela: 'conclusoes_analiticas',
        tipo: 'conclusao',
        titulo: sanitizeStr(conc.titulo, 255),
        descricao: sanitizeStr(conc.argumento_central, 300),
        impacto: ['conclusoes', 'relatorios', 'common_core', 'cerd_iv'],
        dados: {
          titulo: sanitizeStr(conc.titulo, 255),
          tipo: sanitizeStr(conc.tipo, 100),
          periodo: sanitizeStr(conc.periodo, 50),
          argumento_central: sanitizeStr(conc.argumento_central, 5000),
          evidencias: Array.isArray(conc.evidencias) ? conc.evidencias.slice(0, 20).map((e: any) => sanitizeStr(e, 500)) : null,
        },
      });
    }

    console.log(`Built ${proposedChanges.length} proposed changes for review`);

    return new Response(JSON.stringify({
      success: true,
      message: `${proposedChanges.length} alterações identificadas para revisão`,
      proposedChanges,
      summary: {
        indicadores: extractedData.indicadores?.length || 0,
        orcamento: extractedData.orcamento?.length || 0,
        lacunas: extractedData.lacunas?.length || 0,
        conclusoes: extractedData.conclusoes?.length || 0,
        total: totalItems,
      },
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao processar upload:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

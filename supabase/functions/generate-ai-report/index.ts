import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface AIReportRequest {
  tipo: 'common-core' | 'cerd-iv' | 'tematico' | 'orcamentario';
  eixo_tematico?: string;
  grupo_focal?: string;
  esfera?: string;
}

const tipoRelatorioLabels: Record<string, string> = {
  'common-core': 'Common Core Document (HRI/CORE/BRA)',
  'cerd-iv': 'IV Relatório Periódico CERD (CERD/C/BRA/21-23)',
  'tematico': 'Relatório Temático',
  'orcamentario': 'Dossiê Orçamentário de Políticas Raciais',
};

const eixoLabels: Record<string, string> = {
  legislacao_justica: 'Legislação e Justiça',
  politicas_institucionais: 'Políticas Institucionais',
  seguranca_publica: 'Segurança Pública',
  saude: 'Saúde',
  educacao: 'Educação',
  trabalho_renda: 'Trabalho e Renda',
  terra_territorio: 'Terra e Território',
  cultura_patrimonio: 'Cultura e Patrimônio',
  participacao_social: 'Participação Social',
  dados_estatisticas: 'Dados e Estatísticas',
};

const grupoLabels: Record<string, string> = {
  negros: 'População Negra',
  indigenas: 'Povos Indígenas',
  quilombolas: 'Comunidades Quilombolas',
  ciganos: 'Povos Ciganos (Roma)',
  religioes_matriz_africana: 'Religiões de Matriz Africana',
  juventude_negra: 'Juventude Negra',
  mulheres_negras: 'Mulheres Negras',
  lgbtqia_negros: 'LGBTQIA+ Negros',
  pcd_negros: 'PcD Negros',
  idosos_negros: 'Idosos Negros',
  geral: 'População Geral',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    // Public endpoint - no authentication required
    console.log('Generating AI report (public endpoint)');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { tipo, eixo_tematico, grupo_focal, esfera } = await req.json() as AIReportRequest;

    // Input validation
    const validTipos = ['common-core', 'cerd-iv', 'tematico', 'orcamentario'];
    const validEixos = ['todos', 'legislacao_justica', 'politicas_institucionais', 'seguranca_publica', 'saude', 'educacao', 'trabalho_renda', 'terra_territorio', 'cultura_patrimonio', 'participacao_social', 'dados_estatisticas'];
    const validGrupos = ['todos', 'negros', 'indigenas', 'quilombolas', 'ciganos', 'religioes_matriz_africana', 'juventude_negra', 'mulheres_negras', 'lgbtqia_negros', 'pcd_negros', 'idosos_negros', 'geral'];
    const validEsferas = ['todas', 'federal', 'estadual', 'municipal'];

    if (!tipo || !validTipos.includes(tipo)) {
      return new Response(JSON.stringify({ error: 'Invalid tipo parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (eixo_tematico && !validEixos.includes(eixo_tematico)) {
      return new Response(JSON.stringify({ error: 'Invalid eixo_tematico parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (grupo_focal && !validGrupos.includes(grupo_focal)) {
      return new Response(JSON.stringify({ error: 'Invalid grupo_focal parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (esfera && !validEsferas.includes(esfera)) {
      return new Response(JSON.stringify({ error: 'Invalid esfera parameter' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Gerando relatório ${tipo} com IA`);

    // Fetch all relevant data from database
    const [lacunasResult, respostasResult, conclusoesResult, indicadoresResult, orcamentoResult] = await Promise.all([
      supabase.from('lacunas_identificadas').select('*').order('prioridade').order('paragrafo'),
      supabase.from('respostas_lacunas_cerd_iii').select('*').order('paragrafo_cerd_iii'),
      supabase.from('conclusoes_analiticas').select('*').order('created_at'),
      supabase.from('indicadores_interseccionais').select('*').order('categoria'),
      supabase.from('dados_orcamentarios').select('*').order('ano', { ascending: false }),
    ]);

    if (lacunasResult.error) throw lacunasResult.error;
    if (respostasResult.error) throw respostasResult.error;
    if (conclusoesResult.error) throw conclusoesResult.error;
    if (indicadoresResult.error) throw indicadoresResult.error;
    if (orcamentoResult.error) throw orcamentoResult.error;

    let lacunas = lacunasResult.data || [];
    let respostas = respostasResult.data || [];
    let conclusoes = conclusoesResult.data || [];
    let indicadores = indicadoresResult.data || [];
    let orcamento = orcamentoResult.data || [];

    // Apply filters
    if (eixo_tematico && eixo_tematico !== 'todos') {
      lacunas = lacunas.filter(l => l.eixo_tematico === eixo_tematico);
      orcamento = orcamento.filter(o => o.eixo_tematico === eixo_tematico);
    }
    if (grupo_focal && grupo_focal !== 'todos') {
      lacunas = lacunas.filter(l => l.grupo_focal === grupo_focal);
      orcamento = orcamento.filter(o => o.grupo_focal === grupo_focal);
    }
    if (esfera && esfera !== 'todas') {
      orcamento = orcamento.filter(o => o.esfera === esfera);
    }

    console.log(`Dados: ${lacunas.length} lacunas, ${respostas.length} respostas, ${conclusoes.length} conclusões, ${indicadores.length} indicadores, ${orcamento.length} registros orçamentários`);

    // Prepare context for AI
    const dataContext = prepareDataContext(tipo, lacunas, respostas, conclusoes, indicadores, orcamento, eixo_tematico, grupo_focal, esfera);
    
    // Generate AI prompt
    const systemPrompt = generateSystemPrompt(tipo);
    const userPrompt = generateUserPrompt(tipo, dataContext, eixo_tematico, grupo_focal, esfera);

    // Call Lovable AI
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: false,
        max_tokens: 16000,
      }),
    });

    if (!aiResponse.ok) {
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiResponse.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos insuficientes. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errorText);
      throw new Error(`Erro no gateway de IA: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content || '';

    console.log(`IA gerou ${aiContent.length} caracteres de conteúdo`);

    // Generate final HTML report
    const htmlReport = generateFinalHTML(tipo, aiContent, lacunas, indicadores, orcamento, eixo_tematico, grupo_focal);

    return new Response(htmlReport, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/html; charset=utf-8',
      },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    console.error('Erro ao gerar relatório com IA:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function prepareDataContext(
  tipo: string,
  lacunas: any[],
  respostas: any[],
  conclusoes: any[],
  indicadores: any[],
  orcamento: any[],
  eixo?: string,
  grupo?: string,
  esfera?: string
): string {
  const sections: string[] = [];

  // Summary statistics
  const stats = {
    totalLacunas: lacunas.length,
    cumpridas: lacunas.filter(l => l.status_cumprimento === 'cumprido').length,
    parciais: lacunas.filter(l => l.status_cumprimento === 'parcialmente_cumprido').length,
    naoCumpridas: lacunas.filter(l => l.status_cumprimento === 'nao_cumprido').length,
    retrocessos: lacunas.filter(l => l.status_cumprimento === 'retrocesso').length,
    criticas: lacunas.filter(l => l.prioridade === 'critica').length,
    altas: lacunas.filter(l => l.prioridade === 'alta').length,
  };

  sections.push(`## RESUMO ESTATÍSTICO
- Total de lacunas/recomendações ONU analisadas: ${stats.totalLacunas}
- Cumpridas: ${stats.cumpridas} (${stats.totalLacunas > 0 ? (stats.cumpridas/stats.totalLacunas*100).toFixed(1) : 0}%)
- Parcialmente cumpridas: ${stats.parciais} (${stats.totalLacunas > 0 ? (stats.parciais/stats.totalLacunas*100).toFixed(1) : 0}%)
- Não cumpridas: ${stats.naoCumpridas} (${stats.totalLacunas > 0 ? (stats.naoCumpridas/stats.totalLacunas*100).toFixed(1) : 0}%)
- Retrocessos identificados: ${stats.retrocessos}
- Prioridade crítica: ${stats.criticas}
- Prioridade alta: ${stats.altas}`);

  // Add Census 2022 official SIDRA/IBGE data
  sections.push(`## DADOS DEMOGRÁFICOS OFICIAIS (SIDRA/IBGE - Censo 2022)
Fonte: Tabela 9605 - População residente, por cor ou raça (https://sidra.ibge.gov.br/Tabela/9605)
Data de referência (SIDRA): 22/12/2023

- População total: 203.080.756
- Pardos: 92.083.286 (45,34%)
- Brancos: 88.252.121 (43,46%)
- Pretos: 20.656.458 (10,17%)
- Total população negra (pretos + pardos): 112.739.744 (55,51%)
- Indígenas: 1.693.535 (0,83%) - 391 etnias, 295 línguas
- Quilombolas (primeira contagem censitária): 1.327.802 em 1.696 municípios

## INDICADORES DE DESIGUALDADE RACIAL (PNAD 2023-2024 - IBGE)
- Renda: Pessoas negras ganham 58,9% do que pessoas brancas (R$ 2.199 vs R$ 3.730)
- Analfabetismo negro: 6,9% vs branco 3,1% (PNAD Educação 2024)
- Analfabetismo idosos negros (60+): 21,8% vs 8,1% entre brancos
- Ensino superior negro: 13,1% vs branco: 28,2%
- Desemprego negro: 8,2% vs branco: 5,5%
Fonte: PNAD Contínua 2023/2024 (IBGE)

## VIOLÊNCIA E SEGURANÇA (19º Anuário FBSP 2025 / Atlas da Violência 2025)
- Vítimas de homicídio negras: 77% (2024) — 2018: 75,7% (+1,3pp)
- Risco de homicídio negro: 2,7x maior
- Letalidade policial: 82% das vítimas são negras (2024) — 2018: 75,4%
- Feminicídio mulheres negras: 63,6% (2024) — 2018: 61%
- Violência doméstica: 59,8% vítimas negras (FBSP 2025)
Fontes: IPEA/FBSP Atlas da Violência 2025, 19º Anuário FBSP 2025

## ADMINISTRAÇÃO PÚBLICA - MUNIC/ESTADIC 2024 (IBGE)
- Apenas 2 UFs possuem Fundo de Igualdade Racial ativo
- Menos de 5% dos municípios possuem legislação racial específica
- Conselhos municipais de igualdade racial em ~8% dos municípios
- Perfil de gestores municipais de igualdade racial: maioria brancos e homens
- Povos ciganos e indígenas: sem estrutura específica na maioria dos governos subnacionais
Fonte: Pesquisa MUNIC e ESTADIC 2024, IBGE (dados inéditos)

## COVID-19 E DESIGUALDADE RACIAL (2020-2022)
- Excesso de mortalidade COVID negros: +57% vs brancos +38%
- Letalidade hospitalar indígena por COVID: 62%
- Mortalidade materna negra: quase triplicou durante pico pandêmico
- Insegurança alimentar grave: 18% lares negros vs 8% brancos (POF 2022)
- Acesso a UTI: negros com 30% menos chance de internação em UTI
- Mulheres negras: últimas a recuperar emprego pós-pandemia (PNAD 2023)
Fontes: Fiocruz, DataSUS/SIM, SESAI, PNAD Contínua, POF/IBGE`);

  // Lacunas details
  if (lacunas.length > 0) {
    const lacunasText = lacunas.slice(0, 30).map(l => 
      `- Parágrafo ${l.paragrafo}: ${l.tema} (${l.status_cumprimento}, prioridade ${l.prioridade})\n  Lacuna: ${l.descricao_lacuna}\n  Ações Brasil: ${(l.acoes_brasil || []).join('; ')}`
    ).join('\n');
    sections.push(`## LACUNAS E RECOMENDAÇÕES ONU (CERD/C/BRA/CO/18-20)\n${lacunasText}`);
  }

  // Respostas CERD III
  if (respostas.length > 0) {
    const respostasText = respostas.slice(0, 15).map(r =>
      `- Parágrafo ${r.paragrafo_cerd_iii}: ${r.critica_original}\n  Resposta Brasil: ${r.resposta_brasil}\n  Grau de atendimento: ${r.grau_atendimento}`
    ).join('\n');
    sections.push(`## RESPOSTAS ÀS CRÍTICAS DO CERD III\n${respostasText}`);
  }

  // Indicadores
  if (indicadores.length > 0) {
    const indicadoresText = indicadores.map(i => {
      const dados = i.dados || {};
      let dadosStr = '';
      Object.entries(dados).forEach(([key, values]: [string, any]) => {
        if (typeof values === 'object') {
          const anos = Object.keys(values).sort();
          if (anos.length > 0) {
            const primeiro = anos[0];
            const ultimo = anos[anos.length - 1];
            dadosStr += `    ${key}: ${primeiro}=${values[primeiro]}, ${ultimo}=${values[ultimo]}\n`;
          }
        }
      });
      return `- ${i.nome} (${i.categoria})\n  Fonte: ${i.fonte}\n  Tendência: ${i.tendencia || 'não informada'}\n${dadosStr}`;
    }).join('\n');
    sections.push(`## INDICADORES INTERSECCIONAIS\n${indicadoresText}`);
  }

  // Orçamento
  if (orcamento.length > 0) {
    // Group by program
    const byPrograma: Record<string, any[]> = {};
    orcamento.forEach(o => {
      if (!byPrograma[o.programa]) byPrograma[o.programa] = [];
      byPrograma[o.programa].push(o);
    });

    // Calculate totals by sphere
    const byEsfera: Record<string, number> = { federal: 0, estadual: 0, municipal: 0 };
    orcamento.forEach(o => {
      byEsfera[o.esfera] = (byEsfera[o.esfera] || 0) + parseFloat(o.pago || 0);
    });

    const orcamentoText = Object.entries(byPrograma).map(([programa, registros]) => {
      const totalPago = registros.reduce((acc, o) => acc + parseFloat(o.pago || 0), 0);
      const anos = [...new Set(registros.map(r => r.ano))].sort();
      const esferasPrograma = [...new Set(registros.map(r => r.esfera))];
      return `- ${programa} (${esferasPrograma.join(', ')})\n  Total pago: R$ ${(totalPago/1000000).toFixed(2)} milhões\n  Período: ${anos[0]}-${anos[anos.length-1]}\n  Fonte: ${registros[0].fonte_dados}`;
    }).join('\n');

    sections.push(`## EXECUÇÃO ORÇAMENTÁRIA DE POLÍTICAS RACIAIS
Total por esfera:
- Federal: R$ ${(byEsfera.federal/1000000000).toFixed(2)} bilhões
- Estadual: R$ ${(byEsfera.estadual/1000000000).toFixed(2)} bilhões
- Municipal: R$ ${(byEsfera.municipal/1000000000).toFixed(2)} bilhões

Programas:
${orcamentoText}`);
  }

  // Conclusões
  if (conclusoes.length > 0) {
    const conclusoesText = conclusoes.slice(0, 10).map(c =>
      `- ${c.titulo} (${c.tipo})\n  ${c.argumento_central}`
    ).join('\n');
    sections.push(`## CONCLUSÕES ANALÍTICAS\n${conclusoesText}`);
  }

  return sections.join('\n\n');
}

function generateSystemPrompt(tipo: string): string {
  const basePrompt = `Você é um analista especializado em direitos humanos e políticas raciais no Brasil. Sua função é produzir relatórios ANALÍTICOS e CONCLUSIVOS sobre a situação da discriminação racial, baseados exclusivamente nos dados fornecidos.

FOCO: Análise substantiva da política racial brasileira — desigualdades estruturais, cumprimento de obrigações internacionais, eficácia de políticas públicas, interseccionalidade.

NÃO INCLUA: informações sobre gestão de projeto, cronogramas, etapas de trabalho, prazos, ou estrutura organizacional da equipe. O relatório deve ser sobre POLÍTICA RACIAL, não sobre o processo de elaboração.

REGRAS:
1. Use APENAS os dados fornecidos. NÃO invente estatísticas.
2. Cite sempre as fontes mencionadas no contexto.
3. Tom: técnico, analítico, fundamentado em evidências. Diplomático mas sem omitir problemas.
4. Estruture em seções claras. Cada seção deve ter análise, não apenas listagem de dados.
5. Faça CRUZAMENTOS: orçamento × indicadores, lacunas ONU × evidências, evolução temporal.
6. Análise interseccional obrigatória: raça × gênero × idade × classe × deficiência × território.
7. Inclua dados da MUNIC/ESTADIC 2024 sobre fragilidade institucional subnacional.
8. Inclua impacto racial da COVID-19 como dimensão transversal.

FORMATO: Markdown com tabelas comparativas, destaques de números-chave e conclusões por seção.`;

  if (tipo === 'common-core') {
    return basePrompt + `

ESPECÍFICO PARA COMMON CORE:
- Seções: I-Demografia (Censo 2022 por raça), II-Marco institucional (incluindo MUNIC/ESTADIC), III-Indicadores desagregados
- Enfatize: composição racial, desigualdade de renda, educação, saúde, violência, território
- Inclua evolução 2018→2024 com análise de tendências
- Destaque marcos legais: Lei 14.532/2023, recriação MIR, Censo 2022 quilombolas
- Compare períodos 2018-2022 (retrocesso institucional) vs 2023-2024 (reconstrução)`;
  }

  if (tipo === 'cerd-iv') {
    return basePrompt + `

ESPECÍFICO PARA RELATÓRIO CERD IV:
- Responda ponto a ponto às Observações Finais (CERD/C/BRA/CO/18-20)
- Para cada recomendação: o que foi feito, o que falta, evidências quantitativas
- Reconheça retrocessos com honestidade e demonstre ações de recuperação
- Inclua: impacto COVID na população negra e indígena, dados MUNIC/ESTADIC
- Análise por eixo: segurança, saúde, educação, trabalho, território, cultura
- Conclusão: balanço geral com avanços, retrocessos persistentes e compromissos`;
  }

  if (tipo === 'orcamentario') {
    return basePrompt + `

ESPECÍFICO PARA ANÁLISE ORÇAMENTÁRIA:
- Compare períodos: 2018-2022 (desmonte) vs 2023-2025 (reconstrução)
- Taxas de execução por programa e esfera (federal, estadual, municipal)
- CRUZAMENTO CENTRAL: investimento orçamentário × resultados dos indicadores
- Destaque: MIR com ~99% de execução em 2024/2025 como evidência de fortalecimento
- Analise se aumentos orçamentários se traduziram em melhoria dos indicadores
- Inclua fragilidade subnacional (MUNIC/ESTADIC: poucos municípios com orçamento racial)`;
  }

  return basePrompt + `

ESPECÍFICO PARA RELATÓRIO TEMÁTICO:
- Aprofunde análise no eixo/grupo solicitado
- Cruzamento interseccional obrigatório
- Inclua dimensão COVID-19 e dados MUNIC/ESTADIC quando relevantes
- Proponha medidas baseadas nas evidências e lacunas identificadas`;
}

function generateUserPrompt(tipo: string, dataContext: string, eixo?: string, grupo?: string, esfera?: string): string {
  const filtros = [];
  if (eixo && eixo !== 'todos') filtros.push(`Eixo temático: ${eixoLabels[eixo] || eixo}`);
  if (grupo && grupo !== 'todos') filtros.push(`Grupo focal: ${grupoLabels[grupo] || grupo}`);
  if (esfera && esfera !== 'todas') filtros.push(`Esfera: ${esfera}`);

  const filtroText = filtros.length > 0 ? `\n\nFILTROS APLICADOS:\n${filtros.join('\n')}` : '';

  return `Com base EXCLUSIVAMENTE nos dados a seguir, gere um ${tipoRelatorioLabels[tipo] || 'relatório técnico'} completo e detalhado.${filtroText}

DADOS DO BANCO DE DADOS DO SISTEMA:

${dataContext}

---

INSTRUÇÕES:
1. Analise todos os dados fornecidos acima
2. Gere um relatório estruturado em Markdown
3. Inclua:
   - Sumário executivo
   - Análise por seção com dados específicos
   - Tabelas comparativas com os números exatos do contexto
   - Conclusões e recomendações baseadas nas evidências
   - Referências às fontes citadas
4. NÃO invente dados que não estejam no contexto
5. Quando dados forem insuficientes, indique "dados não disponíveis no sistema"

Gere o relatório completo agora:`;
}

function generateFinalHTML(
  tipo: string,
  aiContent: string,
  lacunas: any[],
  indicadores: any[],
  orcamento: any[],
  eixo?: string,
  grupo?: string
): string {
  const dataGeracao = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const titulo = tipoRelatorioLabels[tipo] || 'Relatório Técnico';
  
  // Convert markdown to HTML (basic conversion)
  let htmlContent = aiContent
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim());
      if (cells.some(c => c.includes('---'))) return '';
      const isHeader = cells.every(c => c === c.toUpperCase() || cells[0].includes('Indicador') || cells[0].includes('Ano'));
      const tag = isHeader ? 'th' : 'td';
      return `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
    });

  // Wrap tables
  htmlContent = htmlContent.replace(/(<tr>.*?<\/tr>)+/gs, '<table class="data-table">$&</table>');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${titulo}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: #1e3a5f;
      --primary-light: #2c5282;
      --accent: #c7a82b;
      --success: #22c55e;
      --warning: #eab308;
      --danger: #ef4444;
      --text: #1a1a2e;
      --text-muted: #64748b;
      --bg: #f8fafc;
      --card: #ffffff;
      --border: #e2e8f0;
    }
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.7;
      font-size: 11pt;
    }
    
    .container { max-width: 900px; margin: 0 auto; padding: 40px 24px; }
    
    .ai-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .print-info {
      background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
      padding: 16px 20px;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    
    .print-info strong { color: #1e40af; }
    
    .header {
      text-align: center;
      margin-bottom: 40px;
      padding-bottom: 24px;
      border-bottom: 3px solid var(--primary);
    }
    
    .header h1 {
      font-family: 'Playfair Display', serif;
      font-size: clamp(1.5rem, 4vw, 2rem);
      color: var(--primary);
      margin-bottom: 8px;
    }
    
    .header .subtitle {
      font-size: 1rem;
      color: var(--text-muted);
    }
    
    .header .date {
      font-size: 0.875rem;
      color: var(--text-muted);
      margin-top: 8px;
    }
    
    .meta-info {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      justify-content: center;
      margin-top: 16px;
    }
    
    .meta-badge {
      background: var(--primary);
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 500;
    }
    
    .content {
      background: white;
      padding: 32px;
      border-radius: 12px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
    }
    
    .content h1 {
      font-family: 'Playfair Display', serif;
      font-size: 1.5rem;
      color: var(--primary);
      margin: 32px 0 16px;
      padding-bottom: 8px;
      border-bottom: 2px solid var(--accent);
    }
    
    .content h2 {
      font-size: 1.25rem;
      color: var(--primary-light);
      margin: 24px 0 12px;
    }
    
    .content h3 {
      font-size: 1rem;
      color: var(--text);
      margin: 20px 0 8px;
    }
    
    .content p {
      margin-bottom: 12px;
      text-align: justify;
    }
    
    .content ul, .content ol {
      margin: 12px 0 12px 24px;
    }
    
    .content li {
      margin-bottom: 6px;
    }
    
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 0.9rem;
    }
    
    .data-table th, .data-table td {
      border: 1px solid var(--border);
      padding: 10px 12px;
      text-align: left;
    }
    
    .data-table th {
      background: var(--primary);
      color: white;
      font-weight: 600;
    }
    
    .data-table tr:nth-child(even) {
      background: #f8fafc;
    }
    
    .data-table tr:hover {
      background: #e2e8f0;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin: 24px 0;
    }
    
    .stat-card {
      background: linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%);
      color: white;
      padding: 16px;
      border-radius: 8px;
      text-align: center;
    }
    
    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
    }
    
    .stat-label {
      font-size: 0.75rem;
      opacity: 0.9;
      margin-top: 4px;
    }
    
    .footer {
      margin-top: 40px;
      padding-top: 24px;
      border-top: 2px solid var(--primary);
      text-align: center;
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    
    .footer strong {
      color: var(--text);
    }
    
    .source-note {
      background: #fef3c7;
      border-left: 4px solid var(--warning);
      padding: 12px 16px;
      margin: 16px 0;
      font-size: 0.85rem;
    }
    
    @media print {
      .print-info { display: none; }
      body { background: white; }
      .content { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-info">
      <strong>📄 Para salvar como PDF:</strong> Use Ctrl+P (ou Cmd+P no Mac) e selecione "Salvar como PDF".<br>
      <strong>📝 Para salvar como DOCX:</strong> Copie o conteúdo (Ctrl+A) e cole no Microsoft Word.
    </div>
    
    <div class="header">
      <span class="ai-badge">🤖 Gerado por IA • Lovable AI</span>
      <h1>${titulo}</h1>
      <p class="subtitle">Brasil • Período de Análise: 2018-2026</p>
      <p class="date">Gerado em: ${dataGeracao}</p>
      <div class="meta-info">
        <span class="meta-badge">${lacunas.length} lacunas analisadas</span>
        <span class="meta-badge">${indicadores.length} indicadores</span>
        <span class="meta-badge">${orcamento.length} registros orçamentários</span>
        ${eixo && eixo !== 'todos' ? `<span class="meta-badge">${eixoLabels[eixo] || eixo}</span>` : ''}
        ${grupo && grupo !== 'todos' ? `<span class="meta-badge">${grupoLabels[grupo] || grupo}</span>` : ''}
      </div>
    </div>
    
    <div class="source-note">
      <strong>⚠️ Importante:</strong> Este relatório foi gerado automaticamente por Inteligência Artificial utilizando 
      <strong>exclusivamente</strong> os dados armazenados no banco de dados do sistema. Nenhuma informação externa 
      foi adicionada. Recomenda-se verificação das fontes primárias antes da publicação oficial.
    </div>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${lacunas.length}</div>
        <div class="stat-label">Lacunas ONU</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${lacunas.filter(l => l.status_cumprimento === 'cumprido').length}</div>
        <div class="stat-label">Cumpridas</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${lacunas.filter(l => l.prioridade === 'critica').length}</div>
        <div class="stat-label">Críticas</div>
      </div>
      <div class="stat-card" style="background: linear-gradient(135deg, #047857, #065f46);">
        <div class="stat-value">R$ ${(orcamento.reduce((acc, o) => acc + parseFloat(o.pago || 0), 0) / 1000000000).toFixed(1)}bi</div>
        <div class="stat-label">Total Investido</div>
      </div>
    </div>
    
    <div class="content">
      <p>${htmlContent}</p>
    </div>
    
    <div class="footer">
      <p><strong>Sistema de Monitoramento CERD Brasil</strong></p>
      <p>CDG/UFF • MIR • MRE</p>
      <p style="margin-top: 8px; font-size: 0.75rem;">
        Relatório gerado com base em dados de: IBGE, IPEA, DataSUS, INEP, Fórum Brasileiro de Segurança Pública, 
        Portal da Transparência, SIOP, SICONFI e demais fontes oficiais cadastradas no sistema.
      </p>
    </div>
  </div>
</body>
</html>`;
}

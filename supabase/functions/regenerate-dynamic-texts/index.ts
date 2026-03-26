import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ── PARAGRAFO_CONFIG — same as generateDynamicJustificativa.ts ──
const PARAGRAFO_CONFIG: Record<string, { artigos: string[]; eixos: string[]; keywords: string[]; tema: string }> = {
  '12': { artigos: ['artigo_4','artigo_6','IV','VI'], eixos: ['seguranca_publica','legislacao_justica'], keywords: ['discriminação','crime','ódio','racismo','racial','denúncia','disque','ouvidoria','homicídio','letalidade'], tema: 'discriminação racial, crimes de ódio e acesso à justiça' },
  '14': { artigos: ['artigo_7','VII'], eixos: ['cultura_patrimonio'], keywords: ['mídia','cultura','representatividade','estereótipo','patrimônio','religião','matriz africana','terreiro','capoeira'], tema: 'cultura, patrimônio e representatividade midiática' },
  '16': { artigos: ['artigo_5','V'], eixos: ['saude'], keywords: ['saúde','mortalidade','materna','infantil','covid','saneamento','sus','datasus','pré-natal','óbito','natalidade'], tema: 'saúde e disparidades raciais' },
  '18': { artigos: ['artigo_5','artigo_7','V','VII'], eixos: ['educacao'], keywords: ['educação','escola','analfabetismo','evasão','superior','cotas','creche','alfabetização','distorção','etnico-racial','INEP'], tema: 'educação e relações étnico-raciais' },
  '20': { artigos: ['artigo_5','V'], eixos: ['terra_territorio'], keywords: ['indígena','terra','demarcação','homologação','FUNAI','TI','reserva','aldeia','yanomami'], tema: 'demarcação de terras indígenas' },
  '22': { artigos: ['artigo_5','V'], eixos: ['terra_territorio'], keywords: ['quilombola','quilombo','titulação','INCRA','território','certidão','palmares','comunidade remanescente'], tema: 'titulação de territórios quilombolas' },
  '24': { artigos: ['artigo_5','artigo_6','V','VI'], eixos: ['seguranca_publica'], keywords: ['violência','policial','letalidade','uso da força','arma','operação','favela','periferia','jovem negro','abordagem'], tema: 'violência policial e letalidade' },
  '26': { artigos: ['artigo_5','artigo_6','V','VI'], eixos: ['seguranca_publica','legislacao_justica'], keywords: ['carcerário','encarceramento','prisional','preso','detento','penitenciário','DEPEN','audiência de custódia','provisório'], tema: 'encarceramento em massa e sistema prisional' },
};

const NEGATIVE_INDICATORS = ['mortalidade','homicídio','violência','desemprego','analfabet','evasão','abandono','pobreza','deficit','déficit','trabalho infantil','desigualdade','letalidade','encarceramento','insegurança'];

function normalizeArticle(raw: string): string { return String(raw || '').toLowerCase().trim(); }

function matchesKeyword(text: string, keywords: string[]): boolean {
  const lower = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return keywords.some(kw => {
    const kwNorm = kw.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return lower.includes(kwNorm);
  });
}

function fmt(n: number | null | undefined): string {
  if (n == null) return '—';
  return n.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
}

function pct(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${Number(n).toFixed(1)}%`;
}

function isLowerBetter(nome: string): boolean {
  return NEGATIVE_INDICATORS.some(kw => nome.toLowerCase().includes(kw));
}

function inferTendencia(ind: any): string {
  if (!ind.tendencia) return 'desconhecida';
  const t = ind.tendencia.toLowerCase();
  const lowerBetter = isLowerBetter(ind.nome);
  if (t === 'crescente') return lowerBetter ? 'piora' : 'melhora';
  if (t === 'decrescente') return lowerBetter ? 'melhora' : 'piora';
  if (t === 'estavel' || t === 'estável') return 'estável';
  return 'desconhecida';
}

function findLinked(items: any[], config: any, nameField: string, catField: string, subField?: string): any[] {
  const byArtigo = items.filter(i => (i.artigos_convencao || []).some((a: string) => config.artigos.includes(normalizeArticle(a))));
  const byEixo = items.filter(i => config.eixos.includes(i[catField]) || (subField && i[subField] && config.eixos.includes(i[subField])));
  const byKeyword = items.filter(i => matchesKeyword(`${i[nameField]} ${i[catField] || ''} ${subField ? i[subField] || '' : ''}`, config.keywords));
  return Array.from(new Map([...byArtigo, ...byEixo, ...byKeyword].map(i => [i[nameField] + (i.ano || ''), i])).values());
}

function generateJustificativa(paragrafo: string, indicadores: any[], orcamento: any[], normativos: any[]): string | null {
  const config = PARAGRAFO_CONFIG[paragrafo];
  if (!config) return null;

  const inds = findLinked(indicadores, config, 'nome', 'categoria', 'subcategoria');
  const orcs = findLinked(orcamento, config, 'programa', 'eixo_tematico');
  const norms = findLinked(normativos, config, 'titulo', 'categoria');

  const parts: string[] = [];

  // Indicators
  if (inds.length > 0) {
    const findings: string[] = [];
    for (const ind of inds.slice(0, 8)) {
      const d = ind.dados;
      if (!d || typeof d !== 'object') continue;
      if (d.percentualVitimasNegras != null) findings.push(`${ind.nome}: ${pct(d.percentualVitimasNegras)} de vítimas negras`);
      else if (d.negros != null && d.brancos != null) findings.push(`${ind.nome}: ${typeof d.negros === 'number' && d.negros < 100 ? pct(d.negros) : fmt(d.negros)} negros vs. ${typeof d.brancos === 'number' && d.brancos < 100 ? pct(d.brancos) : fmt(d.brancos)} brancos`);
      else if (d.razaoMortalidadeNegraBranca != null) findings.push(`${ind.nome}: razão negra/branca ${fmt(d.razaoMortalidadeNegraBranca)}x`);
      else if (d.terrasTotal != null) findings.push(`${ind.nome}: ${fmt(d.terrasTotal)} registradas`);
      else if (d.territoriosTitulados != null) findings.push(`${ind.nome}: ${fmt(d.territoriosTitulados)} titulados`);
    }
    if (findings.length > 0) parts.push(`Indicadores vinculados (${inds.length} no sistema): ${findings.slice(0, 5).join('; ')}`);
    else parts.push(`${inds.length} indicador(es) estatístico(s) vinculado(s) ao tema`);

    const tendencias = inds.map(i => inferTendencia(i));
    const melhoram = tendencias.filter(t => t === 'melhora').length;
    const pioram = tendencias.filter(t => t === 'piora').length;
    if (melhoram > 0 || pioram > 0) parts.push(`Tendências: ${melhoram} melhora(s), ${pioram} piora(s)`);
  } else {
    parts.push('Sem indicadores estatísticos vinculados no sistema');
  }

  // Budget
  if (orcs.length > 0) {
    const latestYear = Math.max(...orcs.map((o: any) => o.ano));
    const latestOrcs = orcs.filter((o: any) => o.ano === latestYear);
    const totalPago = latestOrcs.reduce((s: number, o: any) => s + (o.pago || 0), 0);
    const totalAutorizado = latestOrcs.reduce((s: number, o: any) => s + (o.dotacao_autorizada || 0), 0);
    const execucao = totalAutorizado > 0 ? (totalPago / totalAutorizado) * 100 : null;
    const orcText = totalPago > 0
      ? `R$ ${fmt(totalPago / 1e6)}M pagos de R$ ${fmt(totalAutorizado / 1e6)}M autorizados (${latestYear}), execução ${execucao ? pct(execucao) : '—'}`
      : `${latestOrcs.length} ação(ões) orçamentária(s) em ${latestYear}`;
    parts.push(`Orçamento (${orcs.length} ações vinculadas): ${orcText}`);

    const simbolicos = latestOrcs.filter((o: any) => {
      const dot = Number(o.dotacao_autorizada) || 0;
      const pag = Number(o.pago) || 0;
      return dot > 100000 && pag < dot * 0.05;
    });
    if (simbolicos.length > 0) parts.push(`⚠️ ${simbolicos.length} ação(ões) com execução inferior a 5% (orçamento simbólico)`);
  }

  // Normative
  if (norms.length > 0) {
    parts.push(`${norms.length} marco(s) normativo(s) vinculado(s): ${norms.slice(0, 3).map((n: any) => n.titulo).join('; ')}`);
  } else {
    parts.push('Sem cobertura normativa identificada');
  }

  return parts.length > 0 ? parts.join('. ') + '.' : null;
}

function generateSuggestedResponse(lacuna: any, indicadores: any[], orcamento: any[], normativos: any[]): string | null {
  // Use same multi-layer matching for this lacuna's artigos/eixo/keywords
  const artigos = lacuna.artigos_convencao || [];
  const eixo = lacuna.eixo_tematico || '';
  const tema = lacuna.tema || '';
  
  const config = {
    artigos: artigos.map((a: string) => normalizeArticle(a)),
    eixos: [eixo],
    keywords: tema.split(/[\s,]+/).filter((w: string) => w.length > 3),
    tema,
  };

  const linkedInds = findLinked(indicadores, config, 'nome', 'categoria', 'subcategoria');
  const linkedOrcs = findLinked(orcamento, config, 'programa', 'eixo_tematico');
  const linkedNorms = findLinked(normativos, config, 'titulo', 'categoria');

  if (linkedInds.length === 0 && linkedOrcs.length === 0 && linkedNorms.length === 0) return null;

  const parts: string[] = [];
  parts.push(`Em resposta ao §${lacuna.paragrafo} das Observações Finais (CERD/C/BRA/CO/18-20), relativo a "${tema}", o Estado brasileiro apresenta os seguintes avanços e desafios identificados no período ${lacuna.periodo_analise_inicio}–${lacuna.periodo_analise_fim}:`);

  if (linkedInds.length > 0) {
    const melhoram = linkedInds.filter((i: any) => { const t = (i.tendencia||'').toLowerCase(); return t === 'crescente' || t === 'melhora'; });
    const pioram = linkedInds.filter((i: any) => { const t = (i.tendencia||'').toLowerCase(); return t === 'decrescente' || t === 'piora'; });
    const lines: string[] = [];
    if (melhoram.length > 0) lines.push(`Tendência positiva em ${melhoram.length} indicador(es): ${melhoram.slice(0,5).map((i:any)=>i.nome).join('; ')}.`);
    if (pioram.length > 0) lines.push(`Desafios em ${pioram.length} indicador(es): ${pioram.slice(0,5).map((i:any)=>i.nome).join('; ')}.`);
    parts.push(`No campo estatístico, ${linkedInds.length} indicador(es) vinculado(s). ${lines.join(' ')}`);
  }

  if (linkedOrcs.length > 0) {
    const totalDot = linkedOrcs.reduce((s:number, o:any) => s + (Number(o.dotacao_autorizada)||0), 0);
    const totalPago = linkedOrcs.reduce((s:number, o:any) => s + (Number(o.pago)||0), 0);
    const exec = totalDot > 0 ? ((totalPago/totalDot)*100).toFixed(1) : '0';
    parts.push(`Investimento: ${linkedOrcs.length} ação(ões), dotação R$ ${fmt(totalDot/1e6)}M, execução ${exec}%.`);
  }

  if (linkedNorms.length > 0) {
    parts.push(`Marco normativo: ${linkedNorms.length} documento(s): ${linkedNorms.slice(0,4).map((n:any)=>n.titulo).join('; ')}.`);
  }

  if (lacuna.acoes_brasil?.length > 0) {
    parts.push(`Ações governamentais: ${lacuna.acoes_brasil.slice(0,4).join('; ')}.`);
  }

  return parts.join('\n');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Fetch all data (excluding common_core)
    const [indRes, orcRes, normRes, respostasRes, lacunasRes] = await Promise.all([
      adminClient.from('indicadores_interseccionais').select('nome,categoria,subcategoria,dados,fonte,tendencia,artigos_convencao').neq('categoria', 'common_core'),
      adminClient.from('dados_orcamentarios').select('programa,orgao,ano,pago,dotacao_autorizada,percentual_execucao,eixo_tematico,esfera,artigos_convencao'),
      adminClient.from('documentos_normativos').select('titulo,categoria,status,artigos_convencao'),
      adminClient.from('respostas_lacunas_cerd_iii').select('*'),
      adminClient.from('lacunas_identificadas').select('*'),
    ]);

    const indicadores = indRes.data || [];
    const orcamento = orcRes.data || [];
    const normativos = normRes.data || [];
    const respostas = respostasRes.data || [];
    const lacunas = lacunasRes.data || [];

    const changes: any[] = [];

    // 1. Regenerate respostas_lacunas_cerd_iii.justificativa_avaliacao
    for (const r of respostas) {
      const newJust = generateJustificativa(r.paragrafo_cerd_iii, indicadores, orcamento, normativos);
      if (newJust && newJust !== r.justificativa_avaliacao) {
        const { error } = await adminClient
          .from('respostas_lacunas_cerd_iii')
          .update({ justificativa_avaliacao: newJust, updated_at: new Date().toISOString() })
          .eq('id', r.id);
        if (!error) {
          changes.push({
            tabela: 'respostas_lacunas_cerd_iii',
            paragrafo: r.paragrafo_cerd_iii,
            campo: 'justificativa_avaliacao',
            antes: (r.justificativa_avaliacao || '').substring(0, 150),
            depois: newJust.substring(0, 150),
          });
        }
      }
    }

    // 2. Regenerate lacunas_identificadas.resposta_sugerida_cerd_iv (all, not just NULLs)
    for (const lac of lacunas) {
      const newResp = generateSuggestedResponse(lac, indicadores, orcamento, normativos);
      if (newResp && newResp !== lac.resposta_sugerida_cerd_iv) {
        const { error } = await adminClient
          .from('lacunas_identificadas')
          .update({ resposta_sugerida_cerd_iv: newResp, updated_at: new Date().toISOString() })
          .eq('id', lac.id);
        if (!error) {
          changes.push({
            tabela: 'lacunas_identificadas',
            paragrafo: lac.paragrafo,
            tema: lac.tema,
            campo: 'resposta_sugerida_cerd_iv',
            antes: lac.resposta_sugerida_cerd_iv ? lac.resposta_sugerida_cerd_iv.substring(0, 100) : 'NULL',
            depois: newResp.substring(0, 100),
          });
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      total_changes: changes.length,
      respostas_updated: changes.filter(c => c.tabela === 'respostas_lacunas_cerd_iii').length,
      lacunas_updated: changes.filter(c => c.tabela === 'lacunas_identificadas').length,
      changes,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

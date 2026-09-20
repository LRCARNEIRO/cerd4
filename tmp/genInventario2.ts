/** Inventário das 3 Bases v13 — inclui colunas metodológicas (notas, classificação
 *  estrutural, valores desagregados, polaridade, tendência recalculada). */
import { readFileSync, writeFileSync } from 'fs';
import { buildIndicadorCodigoMap } from '@/utils/indicadorCodigo';
import { SUB_INDICADORES, hasSubIndicadores, getSubIndicadorAnchor, abaLabelCompleto } from '@/utils/indicadorSubs';
import { isDuplicata } from '@/utils/indicadorAliases';
import { abasDoIndicador } from '@/utils/indicadorLocator';
import { extractSerieSub, extractDadoUnico } from '@/utils/indicadorDadoUnico';
import { evaluateIndicadorDetailed } from '@/components/conclusoes/evaluateIndicador';
import { isLowerBetterNome } from '@/utils/indicadorPolaridade';

const BASE = 'https://cerd4.lovable.app';
const norm = (s: unknown) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const all: any[] = JSON.parse(readFileSync('/tmp/indicadores_interseccionais.json', 'utf8'));
const vincs: any[] = JSON.parse(readFileSync('/tmp/vinculos.json', 'utf8'));
const norms: any[] = JSON.parse(readFileSync('/tmp/documentos_normativos.json', 'utf8'));
const lac: any[] = JSON.parse(readFileSync('/tmp/lacunas.json', 'utf8'));
const recLabel = new Map<string, string>(lac.map((l: any) => [l.id, /^\d+$/.test(String(l.paragrafo)) ? `§${l.paragrafo}` : String(l.paragrafo || '—')]));
const orc: any[] = JSON.parse(readFileSync('/tmp/dados_orcamentarios.json', 'utf8'));

all.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)) || String(a.id).localeCompare(String(b.id)));
const codigos = buildIndicadorCodigoMap(all as any);
all.forEach((i) => (i.codigo = codigos.get(i.id) || ''));
const byNome = new Map(all.map((i) => [norm(i.nome), i]));

const vByKey = new Map<string, any[]>();
vincs.forEach((v) => {
  const k = `${v.base}|${norm(v.nome)}`;
  (vByKey.get(k) || vByKey.set(k, []).get(k)!).push(v);
});
const ALIAS_VINC: Record<string, string> = {
  'indigenas': 'Povos indígenas — Censo 2022',
  'ciganos/roma': 'Ciganos/Roma — lacuna de dados',
  'populacao carceraria por raca/cor': 'População carcerária por raça/cor',
  'disparidades interseccionais pcd': 'Disparidades PcD 14-59 anos por raça',
};
function vinc(base: string, nome: string) {
  const alias = Object.entries(ALIAS_VINC).filter(([, t]) => norm(t) === norm(nome)).map(([k]) => k).filter((k) => k !== norm(nome));
  const list = [...(vByKey.get(`${base}|${norm(nome)}`) || []), ...alias.flatMap((k) => vByKey.get(`${base}|${k}`) || [])];
  const recs = [...new Set(list.map((v) => recLabel.get(v.recomendacao_id) || v.recomendacao_id))].sort((a, b) => a.localeCompare(b, 'pt', { numeric: true }));
  const arts = [...new Set(list.map((v) => v.artigo).filter(Boolean))].sort();
  const fn = [...new Set(list.map((v) => v.funcao_metodo).filter(Boolean))];
  return { recs: recs.join(', ') || '—', arts: arts.join(', ') || '—', funcao: fn.join(' / ') || '—', n: list.length };
}

const NOTA_KEYS = ['nota', 'notaMetodologica', 'nota_metodologica', 'observacao_metodologica', 'metodologia', 'notaAuditoria', 'observacoesONU', 'notaCarce', 'nota_pct_por_raca', 'obs_2022'];
function notasDe(dados: any): string {
  const out: string[] = [];
  const walk = (o: any, d = 0) => {
    if (!o || d > 4) return;
    if (Array.isArray(o)) return o.forEach((x) => walk(x, d + 1));
    if (typeof o === 'object') {
      Object.entries(o).forEach(([k, v]) => {
        if (NOTA_KEYS.includes(k) && typeof v === 'string' && v.trim()) out.push(v.trim());
        else if (Array.isArray(v) && NOTA_KEYS.includes(k)) out.push(v.filter((x) => typeof x === 'string').join(' '));
        else walk(v, d + 1);
      });
    }
  };
  walk(dados);
  return [...new Set(out)].join(' | ') || '—';
}

const isYear = (k: string) => /^(19|20)\d{2}$/.test(k);
function flatten(dados: any) {
  const pares: string[] = [];
  const anos = new Set<string>();
  let nVal = 0;
  const walk = (o: any, path: string[], d = 0) => {
    if (o === null || o === undefined || d > 5) return;
    if (typeof o === 'number') {
      nVal++;
      const ano = [...path].reverse().find(isYear);
      if (ano) anos.add(ano);
      const rot = path.filter((p) => !isYear(p)).slice(-2).join(' · ') || '—';
      if (pares.length < 60) pares.push(`${ano || '—'} · ${rot}: ${o}`);
      return;
    }
    if (typeof o === 'string') {
      if (isYear(o)) anos.add(o);
      return;
    }
    if (Array.isArray(o)) return o.forEach((x, i) => walk(x, [...path, String(i)], d + 1));
    if (typeof o === 'object') {
      Object.entries(o).forEach(([k, v]) => {
        if (NOTA_KEYS.includes(k)) return;
        if (isYear(k)) anos.add(k);
        walk(v, [...path, k], d + 1);
      });
    }
  };
  walk(dados, []);
  return { pares, anos: [...anos].sort(), nVal };
}

function dadosDe(nome: string, sub: string | undefined, reg: any, tipo: 'guarda-chuva' | 'subindicador') {
  const dados = reg?.dados;
  const detail = evaluateIndicadorDetailed({ nome, tendencia: reg?.tendencia, dados });
  const serie = extractSerieSub(dados, sub, nome);
  const unico = !serie?.valorRecente ? extractDadoUnico(dados, sub, nome) : undefined;
  const flat = flatten(dados);
  const anos: string[] = [];
  let valores = '';
  let tem = 'não';
  if (serie?.valorRecente !== undefined) {
    if (serie.anoAntigo) anos.push(String(serie.anoAntigo));
    if (serie.anoRecente) anos.push(String(serie.anoRecente));
    valores = [
      serie.valorAntigo !== undefined ? `${serie.anoAntigo ?? '—'}: ${serie.valorAntigo}` : '',
      serie.valorRecente !== undefined ? `${serie.anoRecente ?? '—'}: ${serie.valorRecente}` : '',
    ].filter(Boolean).join(' → ');
    tem = serie.valorAntigo !== undefined && serie.anoAntigo !== serie.anoRecente ? 'sim' : 'ponto único';
  } else if (unico) {
    if (unico.ano) anos.push(String(unico.ano));
    valores = `${unico.ano ?? '—'}: ${unico.valor ?? unico.texto ?? '—'}${unico.unidade ? ' ' + unico.unidade : ''}${unico.rotulo ? ` (${unico.rotulo})` : ''}`;
    tem = 'ponto único';
  }
  const leitura = tem === 'sim'
    ? 'série histórica (antigo → recente)'
    : valores ? 'dado pontual auditado' : 'sem dado numérico exibido';

  const menorMelhor = isLowerBetterNome(nome, reg?.categoria);
  const polaridade = menorMelhor ? 'menor é melhor' : 'maior é melhor';

  let tendRecalc = '— (sem série histórica)';
  let baseCalc = flat.nVal === 0 ? 'Sem valores numéricos' : 'Ano único';
  // Guarda contra anos com valor nulo na série (ex.: 2024 sem medição): usa o
  // último ano efetivamente medido daquele rótulo, em vez de tratar null como 0.
  let vAnt = serie?.valorAntigo as number | undefined;
  let vRec = serie?.valorRecente as number | undefined;
  let aAnt = serie?.anoAntigo as any;
  let aRec = serie?.anoRecente as any;
  const rot = (serie as any)?.rotulo as string | undefined;
  const raw = dados?.series;
  let ajuste = '';
  if (rot && raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const pts = Object.entries(raw)
      .filter(([ano, v]: any) => /^(19|20)\d{2}$/.test(ano) && v && typeof v === 'object' && typeof (v as any)[rot] === 'number')
      .map(([ano, v]: any) => [ano, (v as any)[rot] as number] as [string, number])
      .sort((a, b) => a[0].localeCompare(b[0]));
    if (pts.length >= 2) {
      const mudou = String(aRec) !== pts[pts.length - 1][0] || String(aAnt) !== pts[0][0];
      [aAnt, vAnt] = pts[0];
      [aRec, vRec] = pts[pts.length - 1];
      if (mudou) ajuste = ' [ano sem medição descartado]';
    }
  }
  if (tem === 'sim' && typeof vAnt === 'number' && typeof vRec === 'number') {
    const delta = vRec - vAnt;
    tendRecalc = Math.abs(delta) < 1e-9 ? 'estável' : ((delta < 0) === menorMelhor ? 'melhorou' : 'piorou');
    baseCalc = `${rot || nome}: ${vAnt} (${aAnt}) → ${vRec} (${aRec}); variação ${delta >= 0 ? '+' : ''}${delta.toFixed(2)}; ${polaridade}${ajuste}`;
  } else if (tem === 'sim') {
    tendRecalc = '— (série sem valores comparáveis)';
    baseCalc = 'Valores não numéricos';
  }


  const classe = tipo === 'subindicador'
    ? 'Subindicador (recorte próprio do guarda-chuva)'
    : flat.nVal === 0 ? 'Sem valores numéricos estruturados'
      : flat.nVal === 1 ? 'Univalorado' : 'Multivalorado por categoria';

  return {
    valores: valores || '—',
    anos: anos.join(' – ') || '—',
    nAnos: anos.length,
    serieHist: tem,
    leitura,
    resultado: detail.result,
    tendenciaBD: reg?.tendencia || '—',
    classe,
    nValores: flat.nVal,
    desagregados: flat.pares.join(' ; ') || '—',
    anosCobertosTodos: flat.anos.join(', ') || '—',
    funcaoBase: tem === 'sim' ? 'IMPACTO (série histórica)' : 'ESFORÇO (ano único)',
    polaridade,
    tendRecalc,
    baseCalc,
    notas: notasDe(dados),
  };
}

function linhaEstat(o: any) {
  // Tendência e função seguem a MESMA regra: só há impacto quando há série
  // histórica (dois anos medidos). Sem série => esforço.
  const temSerie = ['melhorou', 'piorou', 'estável'].includes(o.d.tendRecalc);
  const funcao = temSerie ? 'IMPACTO' : 'ESFORÇO';
  return {
    'Código': o.codigo, 'Tipo': o.tipo, 'Título da evidência': o.titulo, 'sub': o.sub, 'Guarda-chuva': o.gc,
    'Aba / Categoria': o.aba, 'Localização no sistema': o.loc, 'Link no sistema (CERD IV)': o.url,
    'Registro de origem no BD': o.origem, 'Fonte': o.fonte, 'URL da fonte': o.urlFonte,
    'Tendência recalculada': o.d.tendRecalc,
    'Base do cálculo da tendência': o.d.baseCalc,
    'Função no método (esforço/impacto)': funcao,
    'Entra no cálculo de Impacto': funcao === 'IMPACTO' && temSerie ? 'sim' : 'não',
    'Recomendações vinculadas (§)': o.v.recs, 'Artigos ICERD': o.v.arts,
    'Nº de vínculos': o.v.n, 'Auditado': o.auditado,
    'Classificação estrutural': o.d.classe, 'Nº de anos': o.d.nAnos, 'Nº valores': o.d.nValores,
    'Valores exibidos (ano: valor)': o.d.valores,
    'Valores desagregados (ano · rótulo: valor)': o.d.desagregados,
    'Anos cobertos': o.d.anos, 'Anos presentes no registro': o.d.anosCobertosTodos,
    'Série histórica?': o.d.serieHist, 'Forma de leitura': o.d.polaridade,
    'Tipo de leitura do dado': o.d.leitura, 'Notas metodológicas': o.d.notas,
  };
}

const estat: any[] = [];
all.filter((i) => !hasSubIndicadores(i.nome) && !isDuplicata(i.codigo)).forEach((i) => {
  const aba = abasDoIndicador(i.categoria, i.subcategoria, i.nome, undefined, i.codigo)[0];
  const url = aba
    ? `${BASE}/estatisticas?tab=${aba.tabValue}${(aba as any).subTab ? `&sub=${(aba as any).subTab}` : ''}&ind=${i.codigo}#ind-${i.codigo}`
    : `${BASE}/busca?q=${encodeURIComponent(i.codigo)}`;
  estat.push(linhaEstat({
    codigo: i.codigo, tipo: 'guarda-chuva', titulo: i.nome, sub: '—', gc: '—',
    aba: i.categoria || '—', loc: aba ? abaLabelCompleto(aba as any) : '—', url,
    origem: i.nome, fonte: i.fonte || '—', urlFonte: i.url_fonte || '—',
    auditado: i.auditado_manualmente ? 'sim' : 'não',
    d: dadosDe(i.nome, undefined, i, 'guarda-chuva'), v: vinc('estatistica', i.nome),
  }));
});
SUB_INDICADORES.forEach((s: any) => {
  const u = byNome.get(norm(s.guardaChuva)) || (s.aliases || []).map((a: string) => byNome.get(norm(a))).find(Boolean);
  const anchor = getSubIndicadorAnchor(s.codigo, s.sub);
  const url = `${BASE}/estatisticas?tab=${s.tabValue}${s.subTab ? `&sub=${s.subTab}` : ''}&serie=${anchor}#${anchor}`;
  estat.push(linhaEstat({
    codigo: `${s.codigo} · sub`, tipo: 'subindicador', titulo: s.titulo, sub: s.sub, gc: s.guardaChuva,
    aba: s.abaLabel || u?.categoria || '—', loc: abaLabelCompleto(s), url,
    origem: u?.nome || '—', fonte: u?.fonte || '—', urlFonte: u?.url_fonte || '—',
    auditado: u?.auditado_manualmente ? 'sim' : 'não',
    d: dadosDe(s.titulo, s.sub, u, 'subindicador'), v: vinc('estatistica', s.titulo),
  }));
});

const normativa = norms.map((n) => {
  const v = vinc('normativa', n.titulo);
  return {
    'Título': n.titulo, 'Categoria': n.categoria, 'Status': n.status, 'Tipo de arquivo': n.tipo_arquivo,
    'Recomendações impactadas': (n.recomendacoes_impactadas || []).join(', ') || '—',
    'Recomendações vinculadas (§)': v.recs, 'Artigos ICERD': v.arts, 'Nº de vínculos': v.n,
    'Função no método (esforço/impacto)': 'ESFORÇO',
    'Localização no sistema': 'Base Normativa › Documentos',
    'Link no sistema (CERD IV)': `${BASE}/normativa?doc=${n.id}`,
    'URL de origem': n.url_origem || '—',
    'Notas metodológicas': n.observacoes || n.resumo || '—',
  };
});

const orcamento = orc.map((o) => {
  const v = vinc('orcamentaria', o.programa);
  return {
    'Programa / Ação': o.programa, 'Órgão': o.orgao, 'Esfera': o.esfera, 'Ano': o.ano,
    'Tipo de dotação': o.tipo_dotacao || '—', 'Dotação autorizada': o.dotacao_autorizada,
    'Empenhado': o.empenhado, 'Liquidado': o.liquidado, 'Pago': o.pago, '% execução': o.percentual_execucao,
    'Eixo temático': o.eixo_tematico || '—', 'Grupo focal': o.grupo_focal || '—',
    'Recomendações vinculadas (§)': v.recs, 'Artigos ICERD': v.arts,
    'Função no método (esforço/impacto)': 'ESFORÇO', 'Nº de vínculos (do programa)': v.n,
    'Público-alvo': o.publico_alvo || '—',
    'Localização no sistema': `Orçamento › Universo da Base › ${o.programa} (${o.ano})`,
    'Link no sistema (CERD IV)': `${BASE}/orcamento?tab=universo`,
    'Fonte': o.fonte_dados || '—', 'URL da fonte': o.url_fonte || '—',
    'Notas metodológicas': o.observacoes || '—',
  };
});

const vistos = new Set<string>();
estat.forEach((e) => {
  const k = norm(e['Título da evidência']);
  if (vistos.has(k)) e['Nº de vínculos'] = 0; else vistos.add(k);
});

writeFileSync('/tmp/inv2.json', JSON.stringify({ estat, normativa, orcamento }));
console.log('estat', estat.length,
  'sem dado', estat.filter((e) => e['Valores exibidos (ano: valor)'] === '—').length,
  'com nota', estat.filter((e) => e['Notas metodológicas'] !== '—').length,
  'norm', normativa.length, 'orc', orcamento.length);

/** Gera o Inventário das 3 Bases (versão atual) — dados, tendência e anos pelo resolvedor central. */
import { readFileSync, writeFileSync } from 'fs';
import { buildIndicadorCodigoMap } from '@/utils/indicadorCodigo';
import { SUB_INDICADORES, hasSubIndicadores, getSubIndicadorAnchor, abaLabelCompleto } from '@/utils/indicadorSubs';
import { isDuplicata } from '@/utils/indicadorAliases';
import { abasDoIndicador } from '@/utils/indicadorLocator';
import { extractSerieSub, extractDadoUnico } from '@/utils/indicadorDadoUnico';
import { evaluateIndicadorDetailed } from '@/components/conclusoes/evaluateIndicador';

const BASE = 'https://cerd4.lovable.app';
const norm = (s: unknown) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const all: any[] = JSON.parse(readFileSync('/tmp/indicadores_interseccionais.json', 'utf8'));
const vincs: any[] = JSON.parse(readFileSync('/tmp/vinculos.json', 'utf8'));
const norms: any[] = JSON.parse(readFileSync('/tmp/documentos_normativos.json', 'utf8'));
const orc: any[] = JSON.parse(readFileSync('/tmp/dados_orcamentarios.json', 'utf8'));

all.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)) || String(a.id).localeCompare(String(b.id)));
const codigos = buildIndicadorCodigoMap(all as any);
all.forEach((i) => (i.codigo = codigos.get(i.id) || ''));
const byNome = new Map(all.map((i) => [norm(i.nome), i]));

// vínculos por base+nome
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
  const recs = [...new Set(list.map((v) => v.recomendacao_id))].sort();
  const arts = [...new Set(list.map((v) => v.artigo).filter(Boolean))].sort();
  const fn = [...new Set(list.map((v) => v.funcao_metodo).filter(Boolean))];
  return { recs: recs.join(', ') || '—', arts: arts.join(', ') || '—', funcao: fn.join(' / ') || '—', n: list.length };
}

function dadosDe(nome: string, sub: string | undefined, reg: any) {
  const dados = reg?.dados;
  const detail = evaluateIndicadorDetailed({ nome, tendencia: reg?.tendencia, dados });
  const serie = extractSerieSub(dados, sub, nome);
  const unico = !serie?.valorRecente ? extractDadoUnico(dados, sub, nome) : undefined;
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
  const leitura = serie?.valorRecente !== undefined && tem === 'sim'
    ? 'série histórica (antigo → recente)'
    : valores ? 'dado pontual auditado' : 'sem dado numérico exibido';
  return {
    valores: valores || '—',
    anos: anos.join(' – ') || '—',
    nAnos: anos.length,
    serieHist: tem,
    leitura,
    resultado: detail.result,
    tendenciaBD: reg?.tendencia || '—',
  };
}

// ── Base Estatística ──
const estat: any[] = [];
all.filter((i) => !hasSubIndicadores(i.nome) && !isDuplicata(i.codigo)).forEach((i) => {
  const aba = abasDoIndicador(i.categoria, i.subcategoria, i.nome, undefined, i.codigo)[0];
  const url = aba
    ? `${BASE}/estatisticas?tab=${aba.tabValue}${(aba as any).subTab ? `&sub=${(aba as any).subTab}` : ''}&ind=${i.codigo}#ind-${i.codigo}`
    : `${BASE}/busca?q=${encodeURIComponent(i.codigo)}`;
  const d = dadosDe(i.nome, undefined, i);
  const v = vinc('estatistica', i.nome);
  estat.push({
    'Código': i.codigo, 'Tipo': 'guarda-chuva', 'Título da evidência': i.nome, 'sub': '—', 'Guarda-chuva': '—',
    'Aba / Categoria': i.categoria || '—', 'Localização no sistema': aba ? abaLabelCompleto(aba as any) : '—',
    'Link no sistema (CERD IV)': url, 'Registro de origem no BD': i.nome,
    'Fonte': i.fonte || '—', 'URL da fonte': i.url_fonte || '—',
    'Tendência (BD)': d.tendenciaBD, 'Resultado (evolução)': d.resultado,
    'Recomendações vinculadas (§)': v.recs, 'Artigos ICERD': v.arts,
    'Função no método (auditada)': v.funcao, 'Nº de vínculos': v.n,
    'Auditado': i.auditado_manualmente ? 'sim' : 'não',
    'Valores exibidos (ano: valor)': d.valores, 'Anos cobertos': d.anos, 'Nº de anos': d.nAnos,
    'Série histórica?': d.serieHist, 'Forma de leitura': d.leitura,
  });
});
SUB_INDICADORES.forEach((s: any) => {
  const u = byNome.get(norm(s.guardaChuva)) || (s.aliases || []).map((a: string) => byNome.get(norm(a))).find(Boolean);
  const anchor = getSubIndicadorAnchor(s.codigo, s.sub);
  const url = `${BASE}/estatisticas?tab=${s.tabValue}${s.subTab ? `&sub=${s.subTab}` : ''}&serie=${anchor}#${anchor}`;
  const d = dadosDe(s.titulo, s.sub, u);
  const v = vinc('estatistica', s.titulo);
  estat.push({
    'Código': `${s.codigo} · sub`, 'Tipo': 'subindicador', 'Título da evidência': s.titulo, 'sub': s.sub, 'Guarda-chuva': s.guardaChuva,
    'Aba / Categoria': s.abaLabel || u?.categoria || '—', 'Localização no sistema': abaLabelCompleto(s),
    'Link no sistema (CERD IV)': url, 'Registro de origem no BD': u?.nome || '—',
    'Fonte': u?.fonte || '—', 'URL da fonte': u?.url_fonte || '—',
    'Tendência (BD)': d.tendenciaBD, 'Resultado (evolução)': d.resultado,
    'Recomendações vinculadas (§)': v.recs, 'Artigos ICERD': v.arts,
    'Função no método (auditada)': v.funcao, 'Nº de vínculos': v.n,
    'Auditado': u?.auditado_manualmente ? 'sim' : 'não',
    'Valores exibidos (ano: valor)': d.valores, 'Anos cobertos': d.anos, 'Nº de anos': d.nAnos,
    'Série histórica?': d.serieHist, 'Forma de leitura': d.leitura,
  });
});

// ── Base Normativa ──
const normativa = norms.map((n) => {
  const v = vinc('normativa', n.titulo);
  return {
    'Título': n.titulo, 'Categoria': n.categoria, 'Status': n.status, 'Tipo de arquivo': n.tipo_arquivo,
    'Recomendações impactadas': (n.recomendacoes_impactadas || []).join(', ') || '—',
    'Recomendações vinculadas (§)': v.recs, 'Artigos ICERD': v.arts, 'Nº de vínculos': v.n,
    'Localização no sistema': 'Base Normativa › Documentos',
    'Link no sistema (CERD IV)': `${BASE}/normativa?doc=${n.id}`,
    'URL de origem': n.url_origem || '—',
  };
});

// ── Base Orçamentária ──
const orcamento = orc.map((o) => {
  const v = vinc('orcamentaria', o.programa);
  return {
    'Programa / Ação': o.programa, 'Órgão': o.orgao, 'Esfera': o.esfera, 'Ano': o.ano,
    'Tipo de dotação': o.tipo_dotacao || '—', 'Dotação autorizada': o.dotacao_autorizada,
    'Empenhado': o.empenhado, 'Liquidado': o.liquidado, 'Pago': o.pago, '% execução': o.percentual_execucao,
    'Eixo temático': o.eixo_tematico || '—', 'Grupo focal': o.grupo_focal || '—',
    'Recomendações vinculadas (§)': v.recs, 'Artigos ICERD': v.arts, 'Nº de vínculos (do programa)': v.n,
    'Público-alvo': o.publico_alvo || '—',
    'Localização no sistema': `Orçamento › Universo da Base › ${o.programa} (${o.ano})`,
    'Link no sistema (CERD IV)': `${BASE}/orcamento?tab=universo`,
    'Fonte': o.fonte_dados || '—', 'URL da fonte': o.url_fonte || '—',
  };
});

// evita dupla contagem quando guarda-chuva e subindicador têm o mesmo título
const vistos = new Set<string>();
estat.forEach((e) => {
  const k = norm(e['Título da evidência']);
  if (vistos.has(k)) e['Nº de vínculos'] = 0; else vistos.add(k);
});

writeFileSync('/tmp/inv.json', JSON.stringify({ estat, normativa, orcamento }));
const semDado = estat.filter((e) => e['Valores exibidos (ano: valor)'] === '—').length;
console.log('estat', estat.length, 'sem dado', semDado, 'norm', normativa.length, 'orc', orcamento.length,
  'vinc estat', estat.reduce((a, e) => a + e['Nº de vínculos'], 0),
  'vinc orc', orcamento.reduce((a, e) => a + e['Nº de vínculos'], 0),
  'vinc norm', normativa.reduce((a, e) => a + e['Nº de vínculos'], 0));

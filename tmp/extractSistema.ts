import './preload';
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';
import { withTendenciaPadrao, tendenciaPadraoDetalhada } from '@/utils/tendenciaPadronizada';
import { buildIndicadorCodigoMap } from '@/utils/indicadorCodigo';
import { isEvidenceEligibleIndicator } from '@/utils/indicatorEvidenceGuards';
import { dedupOrcamento } from '@/utils/orcamentoCanonico';
import { expandIndicadorEvidencia } from '@/hooks/useDiagnosticSensor';
import { computeEsforcoImpacto, mediaSimples, classificarFaixa } from '@/utils/esforcoImpacto';
import { normalizeArticleTag } from '@/utils/normalizeArticleTag';
const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!);
async function all(t: string, sel = '*', order?: (q: any) => any) {
  let out: any[] = [];
  for (let p = 0; ; p++) {
    let q: any = sb.from(t).select(sel);
    if (order) q = order(q);
    const { data, error } = await q.range(p * 1000, p * 1000 + 999);
    if (error) throw new Error(t + ': ' + error.message);
    out = out.concat(data || []);
    if (!data || data.length < 1000) break;
  }
  return out;
}
const indRaw = await all('indicadores_interseccionais', '*', q => q.order('created_at', { ascending: true }).order('id', { ascending: true }));
const allInd = withTendenciaPadrao(indRaw);
const cod = buildIndicadorCodigoMap(allInd as any);
const indicadores = allInd.map((i: any) => ({ ...i, codigo: cod.get(i.id) || '' })).filter(isEvidenceEligibleIndicator);
const orcAll = await all('dados_orcamentarios', 'id, programa, orgao, ano, esfera, fonte_dados, url_fonte, dotacao_autorizada, empenhado, liquidado, pago, tipo_dotacao, artigos_convencao, descritivo');
const orcamento = dedupOrcamento(orcAll as any).canonico as any[];
const normativos = await all('documentos_normativos', 'id, titulo, artigos_convencao, status, categoria, url_origem, created_at');
const curados = await all('vinculos_evidencia_curados', 'artigo, recomendacao_id, base, ref_id, sub, nome');
const recs = await all('lacunas_identificadas', '*', q => q.order('prioridade', { ascending: true }).order('paragrafo', { ascending: true }));
let ov: any[] = [];
try { ov = await all('evidence_overrides'); } catch (e) { console.log('overrides err', String(e)); }
console.log('counts', indRaw.length, indicadores.length, orcamento.length, normativos.length, curados.length, recs.length, 'overrides', ov.length);
const indById = new Map(indicadores.map((i: any) => [i.id, i]));
const orcById = new Map(orcamento.map((o: any) => [o.id, o]));
const normById = new Map(normativos.map((n: any) => [n.id, n]));
const est = (v: any) => ({ id: v.ref_id, codigo: null, nome: v.nome || v.sub || 'Indicador', categoria: 'estatistica_estatica', dados: null, tendencia: null, auditado_manualmente: true, documento_origem: ['espelho_estatico'] });
const res: any[] = [];
for (const rec of recs) {
  const vistos = new Set<string>();
  const doRec = curados.filter(v => v.recomendacao_id === rec.id).filter(v => { const k = `${v.base}|${v.ref_id}|${v.sub || ''}`; if (vistos.has(k)) return false; vistos.add(k); return true; });
  const inds = doRec.filter(v => v.base === 'estatistica').map(v => { const reg: any = indById.get(v.ref_id) || est(v); return v.sub ? { ...reg, nome: v.nome || reg.nome, sub: v.sub, guardaChuva: reg.nome, _ref: v.ref_id } : { ...reg, _ref: v.ref_id }; }).filter(isEvidenceEligibleIndicator);
  const orcs = doRec.filter(v => v.base === 'orcamentaria').map(v => orcById.get(v.ref_id)).filter(Boolean);
  const norms = doRec.filter(v => v.base === 'normativa').map(v => normById.get(v.ref_id)).filter(Boolean);
  const linked = inds.flatMap((i: any) => { const b: any = { id: i.id, codigo: i.codigo, nome: i.nome, categoria: i.categoria, tendencia: i.tendencia, dados: i.dados }; return i.sub ? [{ ...b, sub: i.sub, guardaChuva: i.guardaChuva }] : expandIndicadorEvidencia(b); });
  const ei = computeEsforcoImpacto({ indicadores: linked, orcamento: orcs, normativos: norms });
  res.push({
    id: rec.id, paragrafo: rec.paragrafo, tema: rec.tema, artigos: [...new Set((rec.artigos_convencao || []).map(normalizeArticleTag).filter(Boolean))],
    ei,
    indicadores: linked.map((l: any) => { const d = tendenciaPadraoDetalhada(l); return { id: l.id, codigo: l.codigo || '', nome: l.nome, sub: l.sub || '', guardaChuva: l.guardaChuva || '', categoria: l.categoria, tendencia: d.tendencia, base: d.base }; }),
    orcamento: orcs.map((o: any) => ({ id: o.id, programa: o.programa, orgao: o.orgao, ano: o.ano, esfera: o.esfera, tipo_dotacao: o.tipo_dotacao, dotacao_autorizada: o.dotacao_autorizada, empenhado: o.empenhado, liquidado: o.liquidado, pago: o.pago, fonte: o.fonte_dados, url: o.url_fonte })),
    normativos: norms.map((n: any) => ({ id: n.id, titulo: n.titulo, status: n.status, categoria: n.categoria, url: n.url_origem })),
  });
}
const arts: any = {};
for (const r of res) for (const a of r.artigos) { (arts[a] ||= { e: [], i: [], recs: [] }); arts[a].e.push(r.ei.esforco); arts[a].i.push(r.ei.impacto); arts[a].recs.push(r.paragrafo); }
const artOut = Object.fromEntries(Object.entries(arts).map(([a, b]: any) => [a, { esforco: mediaSimples(b.e), impacto: mediaSimples(b.i), faixaE: classificarFaixa(mediaSimples(b.e)), faixaI: classificarFaixa(mediaSimples(b.i)), n: b.e.length, recs: b.recs }]));
writeFileSync('/tmp/sistema_extract.json', JSON.stringify({ res, arts: artOut, curados, overrides: ov, mediaE: mediaSimples(res.map(r => r.ei.esforco)), mediaI: mediaSimples(res.map(r => r.ei.impacto)) }));
for (const r of res) console.log(r.paragrafo, r.ei.esforco, r.ei.impacto, r.ei.contagens.estatistica, r.ei.contagens.favoraveis + '/' + r.ei.contagens.comTendencia, r.ei.componentes.realizacaoEstatistica);
console.log(JSON.stringify(Object.fromEntries(Object.entries(artOut).map(([a, v]: any) => [a, [v.esforco, v.impacto, v.n]]))));

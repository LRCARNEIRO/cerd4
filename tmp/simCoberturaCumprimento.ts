/**
 * Simulação: separar indicadores de ESFORÇO (→ Grau de Cobertura) dos de
 * IMPACTO (→ Grau de Cumprimento, pela tendência melhora/piora/estável).
 */
import { createClient } from '@supabase/supabase-js';
import { evaluateIndicadorDetailed } from '../src/components/conclusoes/evaluateIndicador';

const sb = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_PUBLISHABLE_KEY!);
const norm = (s: any) => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const { data: lac } = await sb.from('lacunas_identificadas').select('id,paragrafo,documento_onu,tema,status_cumprimento').limit(200);
const vin: any[] = [];
for (let from = 0; ; from += 1000) {
  const { data } = await sb.from('vinculos_evidencia_curados').select('recomendacao_id,base,ref_id,nome,sub').range(from, from + 999);
  if (!data || data.length === 0) break;
  vin.push(...data);
  if (data.length < 1000) break;
}
const ind: any[] = [];
for (let from = 0; ; from += 1000) {
  const { data } = await sb.from('indicadores_interseccionais').select('id,nome,codigo_curto,dados,tendencia,categoria').range(from, from + 999);
  if (!data || data.length === 0) break;
  ind.push(...data);
  if (data.length < 1000) break;
}

const indByNome = new Map<string, any>();
for (const i of ind) indByNome.set(norm(i.nome), i);

// --- classificador esforço x impacto (heurística sobre o nome do indicador) ---
const IMPACTO_KW = ['taxa', 'homicid', 'letalidade', 'mortalidade', 'morte', 'obito', 'expectativa',
  'renda', 'salario', 'rendimento', 'desemprego', 'ocupacao', 'informalidade', 'pobreza', 'fome',
  'inseguranca alimentar', 'analfabet', 'evasao', 'escolaridade', 'conclusao', 'aprendizagem',
  'acesso', 'cobertura', 'saneamento', 'agua', 'esgoto', 'banheiro', 'domicilio', 'moradia',
  'encarcer', 'prisional', 'violencia', 'estupro', 'feminicid', 'suicid', 'racismo registrado',
  'denuncia', 'discriminacao', 'representa', 'presenca', 'proporcao', 'percentual', 'indice',
  'gravidez', 'desnutricao', 'vacina', 'covid', 'internacao', 'idh', 'gini'];
const ESFORCO_KW = ['programa', 'conselho', 'delegacia', 'plano', 'politica', 'orgao', 'secretaria',
  'adesao', 'adesoes', 'estrutura', 'criacao', 'institui', 'norma', 'lei', 'decreto', 'portaria',
  'legislacao', 'fundo', 'reserva de vagas', 'cota', 'capacitacao', 'formacao de agentes',
  'homologa', 'demarca', 'titula', 'certifica', 'regulariza', 'registrad', 'equipamento',
  'unidades', 'centros', 'servico implantado', 'campanha', 'protocolo'];

function classifica(nome: string): 'impacto' | 'esforco' {
  const n = norm(nome);
  const imp = IMPACTO_KW.filter(k => n.includes(k)).length;
  const esf = ESFORCO_KW.filter(k => n.includes(k)).length;
  if (esf > imp) return 'esforco';
  if (imp > 0) return 'impacto';
  return 'esforco';
}

// --- escalas atuais ---
const faixaInd = (n: number) => (n >= 10 ? 100 : n >= 7 ? 80 : n >= 5 ? 65 : n >= 3 ? 50 : n >= 2 ? 35 : n >= 1 ? 20 : 0);
const faixaOrc = (n: number) => (n >= 12 ? 100 : n >= 8 ? 80 : n >= 5 ? 65 : n >= 3 ? 50 : n >= 2 ? 35 : n >= 1 ? 20 : 0);
const faixaNorm = (n: number) => (n >= 6 ? 100 : n >= 4 ? 75 : n >= 3 ? 55 : n >= 2 ? 40 : n >= 1 ? 20 : 0);

type Row = any;
const porRec = new Map<string, Row[]>();
for (const v of vin) {
  if (!porRec.has(v.recomendacao_id)) porRec.set(v.recomendacao_id, []);
  porRec.get(v.recomendacao_id)!.push(v);
}

const resultados: any[] = [];
for (const rec of lac || []) {
  const rows = porRec.get(rec.id) || [];
  const dedup = new Map<string, Row>();
  for (const r of rows) dedup.set(r.base === 'estatistica' ? `e|${norm(r.nome)}` : `${r.base}|${r.ref_id}`, r);
  const list = [...dedup.values()];
  const est = list.filter(r => r.base === 'estatistica');
  const orc = list.filter(r => r.base === 'orcamentaria');
  const nor = list.filter(r => r.base === 'normativa');

  const estClass = est.map(r => {
    const reg = indByNome.get(norm(r.nome));
    const tipo = classifica(r.nome);
    const ev = reg ? evaluateIndicadorDetailed(reg).result : 'neutro';
    return { nome: r.nome, tipo, ev };
  });
  const impacto = estClass.filter(x => x.tipo === 'impacto');
  const esforcoEst = estClass.filter(x => x.tipo === 'esforco');

  // --- MODELO ATUAL ---
  const scoreAtual = Math.round(faixaInd(est.length) * 0.4 + faixaOrc(orc.length) * 0.3 + faixaNorm(nor.length) * 0.3);
  const statusAtual = scoreAtual >= 65 ? 'cumprido' : scoreAtual >= 35 ? 'parcial' : 'nao_cumprido';

  // --- MODELO PROPOSTO ---
  // Cobertura = esforço (indicadores de esforço + orçamento + normativos)
  const cobertura = Math.round(faixaInd(esforcoEst.length) * 0.3 + faixaOrc(orc.length) * 0.35 + faixaNorm(nor.length) * 0.35);
  const melhora = impacto.filter(x => x.ev === 'favoravel').length;
  const piora = impacto.filter(x => x.ev === 'desfavoravel').length;
  const estavel = impacto.filter(x => x.ev === 'neutro' || x.ev === 'novo').length;
  const estavelSerie = impacto.filter(x => x.ev === 'neutro').length;
  const novosImp = impacto.filter(x => x.ev === 'novo').length;
  const nImp = impacto.length;
  // Cumprimento = saldo de impacto (melhora 100, estável 50, piora 0), modulado pela cobertura quando não há impacto medido
  const cumprimento = nImp > 0 ? Math.round(((melhora * 100 + estavel * 50) / nImp)) : null;
  let statusNovo: string;
  if (nImp === 0) statusNovo = 'sem_impacto_medido';
  else if (cumprimento! >= 65 && cobertura >= 35) statusNovo = 'cumprido';
  else if (cumprimento! >= 35) statusNovo = 'parcial';
  else statusNovo = 'nao_cumprido';

  resultados.push({ par: rec.paragrafo, doc: rec.documento_onu, est: est.length, esf: esforcoEst.length, imp: nImp, orc: orc.length, nor: nor.length, melhora, piora, estavel, estavelSerie, novosImp, scoreAtual, statusAtual, cobertura, cumprimento, statusNovo });
}

const cont = (k: string, campo: string) => resultados.filter(r => r[campo] === k).length;
console.log('=== MODELO ATUAL ===');
console.log('cumprido', cont('cumprido', 'statusAtual'), '| parcial', cont('parcial', 'statusAtual'), '| nao cumprido', cont('nao_cumprido', 'statusAtual'));
console.log('=== MODELO PROPOSTO (cobertura x cumprimento) ===');
console.log('cumprido', cont('cumprido', 'statusNovo'), '| parcial', cont('parcial', 'statusNovo'), '| nao cumprido', cont('nao_cumprido', 'statusNovo'), '| sem impacto medido', cont('sem_impacto_medido', 'statusNovo'));
const media = (f: (r: any) => number | null) => {
  const v = resultados.map(f).filter((x): x is number => x !== null);
  return Math.round(v.reduce((a, b) => a + b, 0) / (v.length || 1));
};
console.log('media cobertura', media(r => r.cobertura), '| media cumprimento', media(r => r.cumprimento), '| media score atual', media(r => r.scoreAtual));
console.log('\npar | doc | est(esf/imp) orc nor | melh/piora/est | atual -> cob/cump novo');
for (const r of resultados.sort((a, b) => a.doc.localeCompare(b.doc) || a.par.localeCompare(b.par))) {
  console.log(`${String(r.par).padEnd(8)} ${String(r.doc).slice(0, 16).padEnd(16)} ${String(r.est).padStart(3)}(${r.esf}/${r.imp}) ${String(r.orc).padStart(3)} ${String(r.nor).padStart(2)} | ${r.melhora}/${r.piora}/${r.estavel} | ${String(r.scoreAtual).padStart(3)} ${r.statusAtual.padEnd(12)} -> cob ${String(r.cobertura).padStart(3)} cump ${String(r.cumprimento ?? '--').padStart(3)} ${r.statusNovo}`);
}

// ===== VARIANTE B: só impacto com série comparável (novo/sem série fora do denominador) =====
console.log('\n=== VARIANTE B (só impacto com série 2018→2025; melhora=100, estável=50, piora=0) ===');
console.log('par | imp com serie | melh/est/piora | cob | cump | status');
let b = { c: 0, p: 0, n: 0, s: 0 };
for (const r of resultados) {
  const comSerie = r.melhora + r.piora + r.estavelSerie;
  const cump = comSerie > 0 ? Math.round(((r.melhora * 100 + r.estavelSerie * 50) / comSerie)) : null;
  let st: string;
  if (cump === null) st = 'sem_impacto_medido';
  else if (cump >= 65 && r.cobertura >= 35) st = 'cumprido';
  else if (cump >= 35) st = 'parcial';
  else st = 'nao_cumprido';
  b[st === 'cumprido' ? 'c' : st === 'parcial' ? 'p' : st === 'nao_cumprido' ? 'n' : 's']++;
  console.log(`${String(r.par).padEnd(9)} ${String(comSerie).padStart(3)} | ${r.melhora}/${r.estavelSerie}/${r.piora} | ${String(r.cobertura).padStart(3)} | ${String(cump ?? '--').padStart(3)} | ${st}`);
}
console.log('TOTAL B: cumprido', b.c, '| parcial', b.p, '| nao cumprido', b.n, '| sem impacto medido', b.s);

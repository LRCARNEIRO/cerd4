import fs from 'fs';
import { getRecommendationKeywordMatch } from '@/utils/recommendationKeywordMatching';
import { isEvidenceEligibleIndicator } from '@/utils/indicatorEvidenceGuards';

const recs = JSON.parse(fs.readFileSync('/tmp/recs.json', 'utf8'));
const inds = JSON.parse(fs.readFileSync('/tmp/inds.json', 'utf8'));
const orc = JSON.parse(fs.readFileSync('/tmp/orc.json', 'utf8'));
const norm = JSON.parse(fs.readFileSync('/tmp/norm.json', 'utf8'));

const sInd = (n: number) => (n >= 10 ? 100 : n >= 7 ? 80 : n >= 5 ? 65 : n >= 3 ? 50 : n >= 2 ? 35 : n >= 1 ? 20 : 0);
const sOrc = (n: number) => (n >= 12 ? 100 : n >= 8 ? 80 : n >= 5 ? 65 : n >= 3 ? 50 : n >= 2 ? 35 : n >= 1 ? 20 : 0);
const sNorm = (n: number) => (n >= 6 ? 100 : n >= 4 ? 75 : n >= 3 ? 55 : n >= 2 ? 40 : n >= 1 ? 20 : 0);

const perRec: Record<string, { i: number; o: number; n: number; arts: string[]; indNames: string[]; orcKeys: string[]; normKeys: string[] }> = {};

for (const rec of recs) {
  const indicadores = inds
    .map((ind: any) => ({ item: ind, match: getRecommendationKeywordMatch(rec, `${ind.nome} ${ind.categoria} ${ind.subcategoria || ''} ${ind.analise_interseccional || ''} ${Array.isArray(ind.documento_origem) ? ind.documento_origem.join(' ') : ''}`) }))
    .filter((x: any) => x.match.isRelevant)
    .sort((a: any, b: any) => b.match.score - a.match.score || a.item.nome.localeCompare(b.item.nome))
    .map((x: any) => x.item)
    .slice(0, 20)
    .filter(isEvidenceEligibleIndicator);

  const orcamentos = orc
    .map((item: any) => ({ item, match: getRecommendationKeywordMatch(rec, `${item.programa} ${item.orgao} ${item.descritivo || ''} ${item.eixo_tematico || ''} ${item.publico_alvo || ''} ${item.observacoes || ''} ${item.razao_selecao || ''}`) }))
    .filter((x: any) => x.match.isRelevant)
    .sort((a: any, b: any) => b.match.score - a.match.score || a.item.programa.localeCompare(b.item.programa))
    .map((x: any) => x.item)
    .slice(0, 20);

  const normativos = norm
    .map((doc: any) => ({ item: doc, match: getRecommendationKeywordMatch(rec, `${doc.titulo} ${doc.categoria || ''}`) }))
    .filter((x: any) => x.match.isRelevant)
    .sort((a: any, b: any) => b.match.score - a.match.score || a.item.titulo.localeCompare(b.item.titulo))
    .map((x: any) => x.item)
    .slice(0, 20);

  perRec[rec.id] = {
    i: indicadores.length, o: orcamentos.length, n: normativos.length,
    arts: rec.artigos_convencao || [],
    indNames: indicadores.map((x: any) => x.nome),
    orcKeys: orcamentos.map((x: any) => `${x.programa}|${x.orgao}|${x.ano}`),
    normKeys: normativos.map((x: any) => x.titulo),
  };
}

let cump = 0, parc = 0, nao = 0, soma = 0, totInd = 0, totOrc = 0, totNorm = 0;
const byArt: Record<string, { tot: number; c: number; ind: Set<string>; orc: Set<string>; norm: Set<string> }> = {};
for (const [, v] of Object.entries(perRec)) {
  const score = Math.round(sInd(v.i) * 0.4 + sOrc(v.o) * 0.3 + sNorm(v.n) * 0.3);
  soma += score; totInd += v.i; totOrc += v.o; totNorm += v.n;
  const status = score >= 65 ? 'c' : score >= 35 ? 'p' : 'n';
  if (status === 'c') cump++; else if (status === 'p') parc++; else nao++;
  for (const a of v.arts) {
    byArt[a] ||= { tot: 0, c: 0, ind: new Set(), orc: new Set(), norm: new Set() };
    byArt[a].tot++;
    if (status === 'c') byArt[a].c++;
    v.indNames.forEach(x => byArt[a].ind.add(x));
    v.orcKeys.forEach(x => byArt[a].orc.add(x));
    v.normKeys.forEach(x => byArt[a].norm.add(x));
  }
}

console.log('RECOMENDACOES', { total: recs.length, cump, parc, nao, media: Math.round(soma / recs.length), totInd, totOrc, totNorm });
for (const a of ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII']) {
  const d = byArt[a];
  if (!d) { console.log(a, 'sem dados'); continue; }
  const ader = Math.round(
    (d.c / d.tot) * 50 + Math.min(15, d.norm.size * 1.5) + Math.min(10, d.orc.size * 1.0) + Math.min(15, d.ind.size * 1.2) +
    ([d.c > 0, d.orc.size > 0, d.ind.size > 0, d.norm.size > 0].filter(Boolean).length / 4) * 10
  );
  console.log(a, { recs: d.tot, cumpridas: d.c, ind: d.ind.size, orc: d.orc.size, norm: d.norm.size, aderencia: ader });
}

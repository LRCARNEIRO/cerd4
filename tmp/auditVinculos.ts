/**
 * Script de auditoria (offline): reproduz a vinculação automática de evidências
 * usada pelo sensor de diagnóstico e exporta o resultado em JSON para planilha.
 */
import { readFileSync, writeFileSync } from 'fs';
import { getRecommendationKeywordMatch } from '@/utils/recommendationKeywordMatching';
import { buildIndicadorCodigoMap } from '@/utils/indicadorCodigo';
import { isEvidenceEligibleIndicator } from '@/utils/indicatorEvidenceGuards';
import { dedupOrcamento } from '@/utils/orcamentoCanonico';
import { getSubsForGuardaChuva } from '@/utils/indicadorSubs';

const read = (f: string) => JSON.parse(readFileSync(`/tmp/${f}`, 'utf8'));
const lacunas: any[] = read('lac.json');
const indRaw: any[] = read('ind.json');
const orcRaw: any[] = read('orc.json');
const normativos: any[] = read('norm.json');

indRaw.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)) || String(a.id).localeCompare(String(b.id)));
const codigos = buildIndicadorCodigoMap(indRaw as any);
const indicadores = indRaw
  .map((i) => ({ ...i, codigo: codigos.get(i.id) || '' }))
  .filter(isEvidenceEligibleIndicator as any);
const orcamento = (dedupOrcamento(orcRaw as any).canonico as any[]);

const PESO = { ind: 0.4, orc: 0.3, norm: 0.3 };
const faixaInd = (n: number) => (n >= 10 ? 100 : n >= 7 ? 80 : n >= 5 ? 65 : n >= 3 ? 50 : n >= 2 ? 35 : n >= 1 ? 20 : 0);
const faixaOrc = (n: number) => (n >= 12 ? 100 : n >= 8 ? 80 : n >= 5 ? 65 : n >= 3 ? 50 : n >= 2 ? 35 : n >= 1 ? 20 : 0);
const faixaNorm = (n: number) => (n >= 6 ? 100 : n >= 4 ? 75 : n >= 3 ? 55 : n >= 2 ? 40 : n >= 1 ? 20 : 0);

const out = lacunas.map((rec) => {
  const inds = indicadores
    .map((ind) => ({ item: ind, m: getRecommendationKeywordMatch(rec as any, `${ind.nome} ${ind.categoria} ${ind.subcategoria || ''} ${ind.analise_interseccional || ''} ${Array.isArray(ind.documento_origem) ? ind.documento_origem.join(' ') : ''}`) }))
    .filter((x) => x.m.isRelevant)
    .sort((a, b) => b.m.score - a.m.score || a.item.nome.localeCompare(b.item.nome))
    .slice(0, 20);

  const orcs = orcamento
    .map((item) => ({ item, m: getRecommendationKeywordMatch(rec as any, `${item.programa} ${item.orgao} ${item.descritivo || ''} ${item.eixo_tematico || ''} ${item.publico_alvo || ''} ${item.observacoes || ''} ${item.razao_selecao || ''}`) }))
    .filter((x) => x.m.isRelevant)
    .sort((a, b) => b.m.score - a.m.score || a.item.programa.localeCompare(b.item.programa))
    .slice(0, 20);

  const norms = normativos
    .map((doc) => ({ item: doc, m: getRecommendationKeywordMatch(rec as any, `${doc.titulo} ${doc.categoria || ''}`) }))
    .filter((x) => x.m.isRelevant)
    .sort((a, b) => b.m.score - a.m.score || a.item.titulo.localeCompare(b.item.titulo))
    .slice(0, 20);

  const scoreGlobal = Math.round(faixaInd(inds.length) * PESO.ind + faixaOrc(orcs.length) * PESO.orc + faixaNorm(norms.length) * PESO.norm);
  const statusComputado = scoreGlobal >= 65 ? 'cumprido' : scoreGlobal >= 35 ? 'parcialmente_cumprido' : 'nao_cumprido';

  const indicadoresExpandidos = inds.flatMap(({ item, m }) => {
    const subs = getSubsForGuardaChuva(item.nome);
    if (subs.length === 0) return [{ codigo: item.codigo, nome: item.nome, sub: '', guardaChuva: '', categoria: item.categoria, tendencia: item.tendencia, score: m.score, motivo: (m as any).matchedTerms?.join(', ') || '' }];
    return subs.map((s: any) => ({ codigo: item.codigo || s.codigo, nome: s.titulo, sub: s.sub || '', guardaChuva: item.nome, categoria: item.categoria, tendencia: item.tendencia, score: m.score, motivo: (m as any).matchedTerms?.join(', ') || '' }));
  });

  return {
    id: rec.id,
    paragrafo: rec.paragrafo,
    documento: rec.documento_onu,
    tema: rec.tema,
    eixo: rec.eixo_tematico,
    grupo_focal: rec.grupo_focal,
    prioridade: rec.prioridade,
    status_manual: rec.status_cumprimento,
    status_computado: statusComputado,
    score_global: scoreGlobal,
    score_ind: faixaInd(inds.length),
    score_orc: faixaOrc(orcs.length),
    score_norm: faixaNorm(norms.length),
    indicadores: indicadoresExpandidos,
    orcamento: orcs.map(({ item, m }) => ({ programa: item.programa, orgao: item.orgao, ano: item.ano, esfera: item.esfera, dotacao_autorizada: item.dotacao_autorizada, pago: item.pago, score: m.score, motivo: (m as any).matchedTerms?.join(', ') || '' })),
    normativos: norms.map(({ item, m }) => ({ titulo: item.titulo, categoria: item.categoria, status: item.status, score: m.score, motivo: (m as any).matchedTerms?.join(', ') || '' })),
  };
});

writeFileSync('/tmp/vinculos.json', JSON.stringify({
  geradoEm: new Date().toISOString(),
  totais: { recomendacoes: out.length, indicadoresElegiveis: indicadores.length, orcamentoCanonico: orcamento.length, normativos: normativos.length },
  recomendacoes: out,
}, null, 2));
console.log('OK', out.length, indicadores.length, orcamento.length, normativos.length);

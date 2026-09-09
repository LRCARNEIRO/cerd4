/** Dump do rol canônico da Base Estatística (guarda-chuvas + subindicadores) com dados brutos. */
import { readFileSync, writeFileSync } from 'fs';
import { buildIndicadorCodigoMap } from '@/utils/indicadorCodigo';
import { SUB_INDICADORES, hasSubIndicadores } from '@/utils/indicadorSubs';
import { isDuplicata } from '@/utils/indicadorAliases';

const all: any[] = JSON.parse(readFileSync('/tmp/ind.json', 'utf8'));
all.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)) || String(a.id).localeCompare(String(b.id)));
const codigos = buildIndicadorCodigoMap(all as any);
all.forEach((i) => (i.codigo = codigos.get(i.id) || ''));

const gc = all
  .filter((i) => !hasSubIndicadores(i.nome) && !isDuplicata(i.codigo))
  .map((i) => ({
    tipo: 'guarda-chuva', codigo: i.codigo, titulo: i.nome, sub: '', guardaChuva: '',
    categoria: i.categoria, subcategoria: i.subcategoria || '', fonte: i.fonte || '',
    url: i.url_fonte || '', tendencia: i.tendencia || '', artigos: (i.artigos_convencao || []).join(', '),
    auditado: !!i.auditado_manualmente, dados: i.dados || {},
  }));

const subs = SUB_INDICADORES.map((s: any) => {
  const u = all.find((i) => i.nome === s.guardaChuva);
  return {
    tipo: 'subindicador', codigo: `${s.codigo} · sub`, titulo: s.titulo, sub: s.sub, guardaChuva: s.guardaChuva,
    categoria: s.abaLabel || (u?.categoria ?? ''), subcategoria: u?.subcategoria || '', fonte: u?.fonte || '',
    url: u?.url_fonte || '', tendencia: u?.tendencia || '', artigos: (u?.artigos_convencao || []).join(', '),
    auditado: !!u?.auditado_manualmente, dados: u?.dados || {},
  };
});

writeFileSync('/tmp/rol.json', JSON.stringify({ itens: [...gc, ...subs], totalGc: gc.length, totalSubs: subs.length }, null, 1));
console.log('gc', gc.length, 'subs', subs.length, 'total', gc.length + subs.length);

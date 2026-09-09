/** Dump do rol canônico da Base Estatística (guarda-chuvas + subindicadores) com dados brutos. */
import { readFileSync, writeFileSync } from 'fs';
import { buildIndicadorCodigoMap } from '@/utils/indicadorCodigo';
import { SUB_INDICADORES, hasSubIndicadores, getSubIndicadorAnchor, abaLabelCompleto } from '@/utils/indicadorSubs';
import { isDuplicata } from '@/utils/indicadorAliases';
import { abasDoIndicador } from '@/utils/indicadorLocator';

const BASE = 'https://cerd4.lovable.app';

const all: any[] = JSON.parse(readFileSync('/tmp/ind.json', 'utf8'));
all.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)) || String(a.id).localeCompare(String(b.id)));
const codigos = buildIndicadorCodigoMap(all as any);
all.forEach((i) => (i.codigo = codigos.get(i.id) || ''));

const gc = all
  .filter((i) => !hasSubIndicadores(i.nome) && !isDuplicata(i.codigo))
  .map((i) => {
    const aba = abasDoIndicador(i.categoria, i.subcategoria, i.nome, undefined, i.codigo)[0];
    const urlSistema = aba
      ? `${BASE}/estatisticas?tab=${aba.tabValue}${(aba as any).subTab ? `&sub=${(aba as any).subTab}` : ''}&ind=${i.codigo}#ind-${i.codigo}`
      : `${BASE}/busca?q=${encodeURIComponent(i.codigo)}`;
    return {
      tipo: 'guarda-chuva', codigo: i.codigo, titulo: i.nome, sub: '', guardaChuva: '',
      categoria: i.categoria, subcategoria: i.subcategoria || '', fonte: i.fonte || '',
      url: i.url_fonte || '', tendencia: i.tendencia || '', artigos: (i.artigos_convencao || []).join(', '),
      auditado: !!i.auditado_manualmente, dados: i.dados || {},
      aba: aba ? abaLabelCompleto(aba as any) : '', urlSistema,
    };
  });

const byNome = new Map(all.map((i) => [String(i.nome).trim().toLowerCase(), i]));

const subs = SUB_INDICADORES.map((s: any) => {
  // 1) registro guarda-chuva pelo nome exato; 2) fallback: registro de origem
  // declarado em `aliases` (caso das famílias de saneamento consolidadas, em
  // que cada recorte permanece como registro próprio no BD).
  const u =
    byNome.get(String(s.guardaChuva).trim().toLowerCase()) ||
    (s.aliases || []).map((a: string) => byNome.get(String(a).trim().toLowerCase())).find(Boolean);
  const anchor = getSubIndicadorAnchor(s.codigo, s.sub);
  const urlSistema = `${BASE}/estatisticas?tab=${s.tabValue}${s.subTab ? `&sub=${s.subTab}` : ''}&serie=${anchor}#${anchor}`;
  return {
    tipo: 'subindicador', codigo: `${s.codigo} · sub`, titulo: s.titulo, sub: s.sub, guardaChuva: s.guardaChuva,
    categoria: s.abaLabel || (u?.categoria ?? ''), subcategoria: u?.subcategoria || '', fonte: u?.fonte || '',
    url: u?.url_fonte || '', tendencia: u?.tendencia || '', artigos: (u?.artigos_convencao || []).join(', '),
    auditado: !!u?.auditado_manualmente, dados: u?.dados || {},
    aba: abaLabelCompleto(s), urlSistema, origemBD: u?.nome || '',
  };
});

writeFileSync('/tmp/rol.json', JSON.stringify({ itens: [...gc, ...subs], totalGc: gc.length, totalSubs: subs.length }, null, 1));
console.log('gc', gc.length, 'subs', subs.length, 'total', gc.length + subs.length,
  'sem fonte', [...gc, ...subs].filter((i) => !i.fonte).length,
  'sem url', [...gc, ...subs].filter((i) => !i.url).length);

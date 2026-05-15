// @ts-nocheck
(globalThis as any).localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
(globalThis as any).window = globalThis;
import { createClient } from '@supabase/supabase-js';
import { buildMirrorIndicators } from '../src/utils/staticToDbTransformer';
import { buildAllStage3Indicators, buildStage4Indicators } from '../src/utils/stage3Transformers';

const url = process.env.VITE_SUPABASE_URL || 'https://dglurebltgfusdpzccdt.supabase.co';
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const sb = createClient(url, key);

const expected = [
  ...buildMirrorIndicators(),
  ...buildAllStage3Indicators(),
  ...buildStage4Indicators(),
];
console.log(`Mirror gera: ${expected.length} indicadores esperados`);

const { data: bd, error } = await sb
  .from('indicadores_interseccionais')
  .select('id, nome, categoria, subcategoria, fonte, dados, documento_origem')
  .contains('documento_origem', ['espelho_estatico']);
if (error) throw error;
console.log(`BD tem: ${bd!.length} indicadores espelho`);

const keyOf = (r: any) => `${r.categoria}::${r.nome}`;
const bdMap = new Map(bd!.map(r => [keyOf(r), r]));
const expMap = new Map(expected.map(r => [keyOf(r), r]));

const rows: string[] = ['status|categoria|nome|subcategoria|valor_mirror|valor_bd|fonte_mirror|fonte_bd'];

// 1) Em mirror mas faltando no BD
for (const [k, e] of expMap) {
  if (!bdMap.has(k)) {
    const v = e.dados?.valor ?? JSON.stringify(e.dados).slice(0, 80);
    rows.push(`FALTA_NO_BD|${e.categoria}|${e.nome}|${e.subcategoria||''}|${v}||${e.fonte}|`);
  }
}
// 2) No BD mas não está mais no mirror
for (const [k, b] of bdMap) {
  if (!expMap.has(k)) {
    const v = b.dados?.valor ?? JSON.stringify(b.dados).slice(0, 80);
    rows.push(`ORFAO_NO_BD|${b.categoria}|${b.nome}|${b.subcategoria||''}||${v}||${b.fonte}`);
  }
}
// 3) Em ambos: comparar valores
for (const [k, e] of expMap) {
  const b = bdMap.get(k);
  if (!b) continue;
  const ve = e.dados?.valor;
  const vb = b.dados?.valor;
  if (ve != null && vb != null && Math.abs(Number(ve) - Number(vb)) > 0.01) {
    rows.push(`DIVERGENTE|${e.categoria}|${e.nome}|${e.subcategoria||''}|${ve}|${vb}|${e.fonte}|${b.fonte}`);
  } else if (e.fonte !== b.fonte) {
    rows.push(`FONTE_DIFERENTE|${e.categoria}|${e.nome}|${e.subcategoria||''}|${ve||''}|${vb||''}|${e.fonte}|${b.fonte}`);
  }
}

const fs = await import('fs');
fs.writeFileSync('/mnt/documents/sweep-mirror-vs-bd.csv', rows.join('\n'));

const counts: Record<string, number> = {};
for (const r of rows.slice(1)) {
  const s = r.split('|')[0];
  counts[s] = (counts[s] || 0) + 1;
}
console.log('Resumo:', counts);
console.log(`Total linhas: ${rows.length - 1}`);
console.log(`Saída: /mnt/documents/sweep-mirror-vs-bd.csv`);

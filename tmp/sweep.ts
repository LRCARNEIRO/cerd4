// @ts-nocheck
(globalThis as any).localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
(globalThis as any).window = globalThis;

const { createClient } = await import('@supabase/supabase-js');
const { buildMirrorIndicators } = await import('../src/utils/staticToDbTransformer');
const { buildAllStage3Indicators, buildStage4Indicators } = await import('../src/utils/stage3Transformers');

const url = 'https://dglurebltgfusdpzccdt.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnbHVyZWJsdGdmdXNkcHpjY2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NjI5NjgsImV4cCI6MjA4NTUzODk2OH0.4LjlVngtW3g4VhpFP7b8iGOXEMbRBillYOYrxuNPH-0';
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
const bdMap = new Map(bd!.map((r: any) => [keyOf(r), r]));
const expMap = new Map(expected.map((r: any) => [keyOf(r), r]));

const rows: string[] = ['status|categoria|nome|subcategoria|valor_mirror|valor_bd|fonte_mirror|fonte_bd'];
const esc = (s: any) => String(s ?? '').replace(/\|/g, '/').replace(/\n/g, ' ');

for (const [k, e] of expMap) {
  if (!bdMap.has(k)) {
    const v = (e as any).dados?.valor ?? JSON.stringify((e as any).dados).slice(0, 80);
    rows.push(`FALTA_NO_BD|${esc(e.categoria)}|${esc(e.nome)}|${esc(e.subcategoria)}|${esc(v)}||${esc(e.fonte)}|`);
  }
}
for (const [k, b] of bdMap) {
  if (!expMap.has(k)) {
    const v = (b as any).dados?.valor ?? JSON.stringify((b as any).dados).slice(0, 80);
    rows.push(`ORFAO_NO_BD|${esc(b.categoria)}|${esc(b.nome)}|${esc(b.subcategoria)}||${esc(v)}||${esc(b.fonte)}`);
  }
}
for (const [k, e] of expMap) {
  const b = bdMap.get(k);
  if (!b) continue;
  const ve = (e as any).dados?.valor;
  const vb = (b as any).dados?.valor;
  if (ve != null && vb != null && !isNaN(Number(ve)) && !isNaN(Number(vb)) && Math.abs(Number(ve) - Number(vb)) > 0.01) {
    rows.push(`DIVERGENTE|${esc(e.categoria)}|${esc(e.nome)}|${esc(e.subcategoria)}|${esc(ve)}|${esc(vb)}|${esc(e.fonte)}|${esc(b.fonte)}`);
  } else if (e.fonte !== b.fonte) {
    rows.push(`FONTE_DIFERENTE|${esc(e.categoria)}|${esc(e.nome)}|${esc(e.subcategoria)}|${esc(ve)}|${esc(vb)}|${esc(e.fonte)}|${esc(b.fonte)}`);
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
console.log(`Total divergências: ${rows.length - 1}`);
console.log(`Saída: /mnt/documents/sweep-mirror-vs-bd.csv`);

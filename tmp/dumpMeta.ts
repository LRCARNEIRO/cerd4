/** Dump de todos os exports de StatisticsData.ts em JSON (para o gerador de inventário). */
import { writeFileSync } from 'fs';
import * as S from '@/components/estatisticas/StatisticsData';

const out: Record<string, unknown> = {};
for (const [k, v] of Object.entries(S)) {
  if (typeof v === 'function') continue;
  out[k] = v;
}
writeFileSync('/tmp/statsdata.json', JSON.stringify(out));
console.log('exports', Object.keys(out).length);

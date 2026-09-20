/** Recalcula a tendência canônica de cada registro estatístico:
 *  só há tendência quando existe série histórica (>=2 anos medidos) e ela é
 *  lida pela polaridade do indicador. Vocabulário: melhorou | estável | piorou. */
import { readFileSync, writeFileSync } from 'fs';
import { buildIndicadorCodigoMap } from '@/utils/indicadorCodigo';
import { extractSerieSub } from '@/utils/indicadorDadoUnico';
import { isLowerBetterNome } from '@/utils/indicadorPolaridade';

const all: any[] = JSON.parse(readFileSync('/tmp/indicadores_interseccionais.json', 'utf8'));
all.sort((a, b) => String(a.created_at).localeCompare(String(b.created_at)) || String(a.id).localeCompare(String(b.id)));
const codigos = buildIndicadorCodigoMap(all as any);

const rows = all.map((i) => {
  const serie: any = extractSerieSub(i.dados, undefined, i.nome);
  let vAnt = serie?.valorAntigo, vRec = serie?.valorRecente, aAnt = serie?.anoAntigo, aRec = serie?.anoRecente;
  const rot = serie?.rotulo as string | undefined;
  const raw = i.dados?.series;
  if (rot && raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const pts = Object.entries(raw)
      .filter(([ano, v]: any) => /^(19|20)\d{2}$/.test(ano) && v && typeof v === 'object' && typeof (v as any)[rot] === 'number')
      .map(([ano, v]: any) => [ano, (v as any)[rot] as number] as [string, number])
      .sort((a, b) => a[0].localeCompare(b[0]));
    if (pts.length >= 2) { [aAnt, vAnt] = pts[0]; [aRec, vRec] = pts[pts.length - 1]; }
  }
  const temSerie = typeof vAnt === 'number' && typeof vRec === 'number' && String(aAnt) !== String(aRec);
  const menorMelhor = isLowerBetterNome(i.nome, i.categoria);
  let nova: string | null = null;
  let base = 'sem série histórica (ano único ou sem valores comparáveis)';
  if (temSerie) {
    const delta = (vRec as number) - (vAnt as number);
    nova = Math.abs(delta) < 1e-9 ? 'estável' : ((delta < 0) === menorMelhor ? 'melhorou' : 'piorou');
    base = `${rot || i.nome}: ${vAnt} (${aAnt}) → ${vRec} (${aRec}); variação ${delta >= 0 ? '+' : ''}${(delta as number).toFixed(2)}; ${menorMelhor ? 'menor é melhor' : 'maior é melhor'}`;
  }
  return { id: i.id, codigo: codigos.get(i.id) || '', nome: i.nome, antiga: i.tendencia ?? null, nova, base };
});

const mud = rows.filter((r) => (r.antiga || null) !== (r.nova || null));
console.log('total', rows.length, 'com série', rows.filter((r) => r.nova).length, 'mudam', mud.length);
const cont: Record<string, number> = {};
rows.forEach((r) => { const k = r.nova || '(vazio)'; cont[k] = (cont[k] || 0) + 1; });
console.log(cont);
writeFileSync('/tmp/tend.json', JSON.stringify(rows, null, 1));

const sql = mud.map((r) => `update public.indicadores_interseccionais set tendencia = ${r.nova ? `'${r.nova}'` : 'null'} where id = '${r.id}';`).join('\n');
writeFileSync('/tmp/tend.sql', sql);

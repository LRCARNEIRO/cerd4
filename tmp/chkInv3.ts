/** Reprocessa comparação sistema x planilha v19 usando a polaridade do RECORTE
 *  (título do subindicador), não do registro guarda-chuva. */
import { readFileSync, writeFileSync } from 'fs';
import { tendenciaPadraoDetalhada } from '@/utils/tendenciaPadronizada';
import { isLowerBetterNome } from '@/utils/indicadorPolaridade';

const rol = JSON.parse(readFileSync('/tmp/rol.json', 'utf8')).itens as any[];
const inv = JSON.parse(readFileSync('/tmp/inv2.json', 'utf8')) as any[];
const norm = (s: unknown) => String(s || '').trim().toLowerCase();
const invByTitulo = new Map(inv.map((r) => [norm(r['Título da evidência']), r]));

const linhas: string[] = [];
let iguais = 0;
for (const i of rol) {
  const gc = i.guardaChuva && i.guardaChuva !== '—' ? i.guardaChuva : i.titulo;
  // polaridade: recorte (título do sub) tem precedência; guarda-chuva é fallback
  const alvoPol = [i.titulo, i.sub, gc].filter(Boolean).join(' ');
  const menorMelhor = isLowerBetterNome(alvoPol, i.categoria);
  const d = tendenciaPadraoDetalhada({ nome: gc, categoria: i.categoria, dados: i.dados, sub: i.sub || undefined });
  // recalcula a leitura com a polaridade do recorte
  let atual: string = d.tendencia ?? 'sem série histórica';
  if (d.temSerie && typeof d.valorAntigo === 'number' && typeof d.valorRecente === 'number') {
    const delta = d.valorRecente - d.valorAntigo;
    atual = Math.abs(delta) < 1e-9 ? 'estável' : (delta < 0) === menorMelhor ? 'melhorou' : 'piorou';
  }
  const r = invByTitulo.get(norm(i.titulo));
  if (!r) { linhas.push(`SEM-MATCH\t${i.codigo}\t${i.titulo}`); continue; }
  const pl = norm(r['Tendência recalculada']).replace('— (', '').replace(')', '').replace('—', 'sem série histórica').trim();
  const plan = pl.includes('sem série') ? 'sem série histórica' : pl;
  const leituraPlan = norm(r['Forma de leitura']);
  const leituraSis = menorMelhor ? 'menor é melhor' : 'maior é melhor';
  const difT = plan !== atual;
  const difL = !!leituraPlan && leituraPlan !== leituraSis;
  if (!difT && !difL) { iguais++; continue; }
  linhas.push([
    difT && difL ? 'TEND+LEITURA' : difT ? 'TENDÊNCIA' : 'LEITURA',
    r['Código'], i.titulo,
    `planilha: ${plan} / ${leituraPlan}`,
    `sistema: ${atual} / ${leituraSis}`,
    d.base.slice(0, 90),
  ].join('\t'));
}
writeFileSync('/tmp/dif3.tsv', linhas.join('\n'));
console.log('conferidos:', rol.length, 'iguais:', iguais, 'divergências:', linhas.length);
console.log(linhas.join('\n'));

/** Compara tendência + polaridade do sistema x planilha v19 enviada. */
import { readFileSync, writeFileSync } from 'fs';
import { tendenciaPadraoDetalhada } from '@/utils/tendenciaPadronizada';
import { isLowerBetterNome } from '@/utils/indicadorPolaridade';

const rol = JSON.parse(readFileSync('/tmp/rol.json', 'utf8')).itens as any[];
const inv = JSON.parse(readFileSync('/tmp/inv2.json', 'utf8')) as any[];
const norm = (s: string) => String(s || '').trim().toLowerCase();
const invByTitulo = new Map(inv.map((r) => [norm(r['Título da evidência']), r]));

const linhas: string[] = [];
for (const i of rol) {
  const nome = i.guardaChuva && i.guardaChuva !== '—' ? i.guardaChuva : i.titulo;
  const d = tendenciaPadraoDetalhada({ nome, categoria: i.categoria, dados: i.dados, sub: i.sub || undefined });
  const atual = d.tendencia ?? 'sem série histórica';
  const r = invByTitulo.get(norm(i.titulo));
  if (!r) { linhas.push(`SEM-MATCH\t${i.codigo}\t${i.titulo}`); continue; }
  const pl = norm(r['Tendência recalculada']).replace('— (', '').replace(')', '').replace('—', 'sem série histórica').trim();
  const plan = pl.includes('sem série') ? 'sem série histórica' : pl;
  const leituraPlan = norm(r['Forma de leitura']);
  const leituraSis = isLowerBetterNome(nome, i.categoria) ? 'menor é melhor' : 'maior é melhor';
  const difT = plan !== atual;
  const difL = leituraPlan && leituraPlan !== leituraSis;
  if (difT || difL) {
    linhas.push([
      difT && difL ? 'TEND+LEITURA' : difT ? 'TENDÊNCIA' : 'LEITURA',
      r['Código'], i.titulo,
      `planilha: ${plan} / ${leituraPlan}`,
      `sistema: ${atual} / ${leituraSis}`,
      d.base.slice(0, 80),
    ].join('\t'));
  }
}
writeFileSync('/tmp/dif2.tsv', linhas.join('\n'));
console.log('divergências:', linhas.length);
console.log(linhas.join('\n'));

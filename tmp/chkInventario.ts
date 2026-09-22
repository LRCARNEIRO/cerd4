/** Compara tendência recalculada x planilha de inventário v19. */
import { readFileSync, writeFileSync } from 'fs';
import { tendenciaPadraoDetalhada } from '@/utils/tendenciaPadronizada';

const rol = JSON.parse(readFileSync('/tmp/rol.json', 'utf8')).itens as any[];
const inv = JSON.parse(readFileSync('/tmp/inv.json', 'utf8')) as any[];
const invByTitulo = new Map(inv.map((r) => [String(r.titulo).trim().toLowerCase(), r]));
const out: string[] = [];
for (const i of rol) {
  const d = tendenciaPadraoDetalhada({ nome: i.guardaChuva || i.titulo, categoria: i.categoria, dados: i.dados, sub: i.sub || undefined });
  const atual = d.tendencia ?? 'sem série histórica';
  const r = invByTitulo.get(String(i.titulo).trim().toLowerCase());
  const planilha = String(r?.tendencia || '').includes('sem série') ? 'sem série histórica' : String(r?.tendencia || '').trim();
  if (!r) { out.push(`SEM-MATCH ${i.codigo} | ${i.titulo}`); continue; }
  if (planilha !== atual) out.push(`DIF ${i.codigo} | ${i.titulo} | planilha=${planilha} | sistema=${atual}`);
}
writeFileSync('/tmp/difinv.txt', out.join('\n'));
console.log('divergências:', out.length);
console.log(out.slice(0, 40).join('\n'));

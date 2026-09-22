/** Confere tendência recalculada após correção de polaridade. */
import { readFileSync } from 'fs';
import { tendenciaPadraoDetalhada } from '@/utils/tendenciaPadronizada';

const rol = JSON.parse(readFileSync('/tmp/rol.json', 'utf8')).itens as any[];
const counts: Record<string, number> = {};
const alvos = ['baixo peso', 'menores de idade', 'sem ensino superior', '2 salários', 'mediana', 'denúnc', 'rmm'];
for (const i of rol) {
  const d = tendenciaPadraoDetalhada({ nome: i.guardaChuva || i.titulo, categoria: i.categoria, dados: i.dados, sub: i.sub || undefined });
  const k = d.tendencia ?? 'sem série';
  counts[k] = (counts[k] || 0) + 1;
  const t = String(i.titulo).toLowerCase();
  if (alvos.some((a) => t.includes(a))) console.log(i.codigo, '|', i.titulo, '=>', k, '|', d.base.slice(0, 90));
}
console.log(counts);

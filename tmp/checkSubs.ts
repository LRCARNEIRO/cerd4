import { SUB_INDICADORES } from '../src/utils/indicadorSubs';
import { resolveRegistroEstatico, extractDadoUnico } from '../src/utils/indicadorDadoUnico';
import { createClient } from '@supabase/supabase-js';
const url = process.env.VITE_SUPABASE_URL!, key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY!;
const sb = createClient(url, key);
const { data } = await sb.from('indicadores_interseccionais').select('id,nome,codigo_curto,dados,tendencia').limit(2000);
const norm = (s:any)=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
const map = new Map<string, any>();
for (const r of data||[]) map.set(norm(r.nome), { id:r.id, codigo:r.codigo_curto, nome:r.nome, dados:r.dados, tendencia:r.tendencia });
let sem:string[]=[];
for (const s of SUB_INDICADORES) {
  const { registro, codigoCongelado } = resolveRegistroEstatico(s.titulo, map as any);
  const u = extractDadoUnico(registro?.dados, s.sub, s.titulo);
  const temSerie = registro?.dados?.serieTemporal?.length;
  if (!u && !temSerie) sem.push(`${codigoCongelado||registro?.codigo||'??'} | ${s.titulo} | sub=${s.sub}`);
}
console.log('sem dado:', sem.length, 'de', SUB_INDICADORES.length);
console.log(sem.join('\n'));

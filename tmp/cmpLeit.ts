import { readFileSync } from 'fs';
import { tendenciaPadraoDetalhada } from '@/utils/tendenciaPadronizada';
const L = JSON.parse(readFileSync('/tmp/leit.json','utf8'));
const inds = JSON.parse(readFileSync('/tmp/inds.json','utf8'));
const by = new Map(inds.map((i:any)=>[i.nome.trim().toLowerCase(), i]));
const c:any={}; const dif:string[]=[];
for (const l of L) { const i:any=by.get(l.nome.toLowerCase()); const t=tendenciaPadraoDetalhada({nome:i.nome,categoria:i.categoria,dados:i.dados,sub:l.sub}).tendencia??'sem';
 c[t]=(c[t]||0)+1; if(t!==l.tendencia) dif.push(`${l.codigo}${l.sub?' · '+l.sub:''} | sist=${t} → ${l.tendencia} | ${l.leitura} | ${l.titulo}`);}
console.log(c, dif.length); console.log(dif.join('\n'));

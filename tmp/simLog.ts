const arts = [
  { a:'I',   orc:18,  est:5,   norm:2,  s50: 8.3 },
  { a:'II',  orc:27,  est:252, norm:11, s50: 14.3 },
  { a:'III', orc:158, est:92,  norm:6,  s50: 12.5 },
  { a:'IV',  orc:2,   est:7,   norm:4,  s50: 0 },
  { a:'V',   orc:202, est:219, norm:16, s50: 16.7 },
  { a:'VI',  orc:11,  est:34,  norm:5,  s50: 12.5 },
  { a:'VII', orc:43,  est:53,  norm:2,  s50: 0 },
];
const log = (n:number, max:number, ref:number) => Math.min(max, max * Math.log(1+n) / Math.log(1+ref));
const cenarios = [
  { nome:'LOG ancorado no inventário (est70/orc51/norm8)',
    fEst:(n:number)=>log(n,15,70), fOrc:(n:number)=>log(n,10,51), fNorm:(n:number)=>log(n,15,8) },
  { nome:'LOG generoso (metade do inventário: est140/orc102/norm16)',
    fEst:(n:number)=>log(n,15,140), fOrc:(n:number)=>log(n,10,102), fNorm:(n:number)=>log(n,15,16) },
];
for (const c of cenarios) {
  console.log('\n== ' + c.nome + ' ==  Art: Cump+Est+Orc+Norm+Ampl = Nota');
  for (const r of arts) {
    const br = [r.s50>0, r.orc>0, r.est>0, r.norm>0].filter(Boolean).length/4*10;
    const nota = Math.round(Math.min(100, r.s50 + c.fEst(r.est) + c.fOrc(r.orc) + c.fNorm(r.norm) + br));
    console.log(`${r.a.padEnd(4)} ${r.s50.toFixed(1).padStart(4)} + ${c.fEst(r.est).toFixed(1).padStart(4)} + ${c.fOrc(r.orc).toFixed(1).padStart(4)} + ${c.fNorm(r.norm).toFixed(1).padStart(4)} + ${br.toFixed(1).padStart(3)} = ${nota}`);
  }
}

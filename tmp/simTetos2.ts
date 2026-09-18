const arts = [
  { a:'I',   orc:18,  est:5,   norm:2,  s50: 8.3 },
  { a:'II',  orc:27,  est:252, norm:11, s50: 14.3 },
  { a:'III', orc:158, est:92,  norm:6,  s50: 12.5 },
  { a:'IV',  orc:2,   est:7,   norm:4,  s50: 0 },
  { a:'V',   orc:202, est:219, norm:16, s50: 16.7 },
  { a:'VI',  orc:11,  est:34,  norm:5,  s50: 12.5 },
  { a:'VII', orc:43,  est:53,  norm:2,  s50: 0 },
];
// HOJE: est=min(15,n*1.2) teto13; orc=min(10,n*1.0) teto10; norm=min(15,n*1.5) teto10
const cenarios = [
  { nome:'HOJE (13/10/10)', fEst:(n:number)=>Math.min(15,n*1.2), fOrc:(n:number)=>Math.min(10,n*1.0), fNorm:(n:number)=>Math.min(15,n*1.5) },
  { nome:'25% inventario (est70/orc51/norm8)', fEst:(n:number)=>Math.min(15,n*15/70), fOrc:(n:number)=>Math.min(10,n*10/51), fNorm:(n:number)=>Math.min(15,n*15/8) },
  { nome:'20% inventario (est56/orc41/norm7)', fEst:(n:number)=>Math.min(15,n*15/56), fOrc:(n:number)=>Math.min(10,n*10/41), fNorm:(n:number)=>Math.min(15,n*15/7) },
];
for (const c of cenarios) {
  console.log('\n== ' + c.nome + ' ==  Art: Cump+Est+Orc+Norm+Ampl = Nota');
  for (const r of arts) {
    const ampl = [r.orc>0,r.est>0,r.norm>0].filter(Boolean).length ? 10 : 0; // todos tem as 4 bases? cumpr>0 nem sempre
    const br = [r.s50>0, r.orc>0, r.est>0, r.norm>0].filter(Boolean).length/4*10;
    const nota = Math.round(Math.min(100, r.s50 + c.fEst(r.est) + c.fOrc(r.orc) + c.fNorm(r.norm) + br));
    console.log(`${r.a.padEnd(4)} ${r.s50.toFixed(1).padStart(4)} + ${c.fEst(r.est).toFixed(1).padStart(4)} + ${c.fOrc(r.orc).toFixed(1).padStart(4)} + ${c.fNorm(r.norm).toFixed(1).padStart(4)} + ${br.toFixed(1).padStart(3)} = ${nota}`);
  }
}

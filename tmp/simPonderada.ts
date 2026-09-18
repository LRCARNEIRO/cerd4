// Simulação: média ponderada pela quantidade de recomendações vinculadas por artigo
const arts = [
  { a:'I',   recs:6,  orc:18,  est:5,   norm:2,  s50: 8.3 },
  { a:'II',  recs:7,  orc:27,  est:252, norm:11, s50: 14.3 },
  { a:'III', recs:4,  orc:158, est:92,  norm:6,  s50: 12.5 },
  { a:'IV',  recs:2,  orc:2,   est:7,   norm:4,  s50: 0 },
  { a:'V',   recs:21, orc:202, est:219, norm:16, s50: 16.7 },
  { a:'VI',  recs:6,  orc:11,  est:34,  norm:5,  s50: 12.5 },
  { a:'VII', recs:4,  orc:43,  est:53,  norm:2,  s50: 0 },
];
const TOTAL_RECS = arts.reduce((s,r)=>s+r.recs,0); // 50 (42 recs, 8 multi-artigo)
const INV = { est:279, orc:204, norm:32 };
const log = (n:number, max:number, ref:number) => Math.min(max, max*Math.log(1+n)/Math.log(1+ref));

// HOJE: log ancorado no inventário global (70 est / 51 orc / 8 norm)
const hoje = arts.map(r=>{
  const br=[r.s50>0,r.orc>0,r.est>0,r.norm>0].filter(Boolean).length/4*10;
  return Math.round(Math.min(100, r.s50 + log(r.est,15,70) + log(r.orc,10,51) + log(r.norm,15,8) + br));
});

// CENÁRIO A: âncora proporcional à fatia de recomendações do artigo
// nota cheia quando o artigo reúne a fração do inventário proporcional à sua fração de recs (25% base)
const cenarioA = arts.map(r=>{
  const f = r.recs/TOTAL_RECS;
  const refEst = Math.max(1, INV.est*0.25*f), refOrc = Math.max(1, INV.orc*0.25*f), refNorm = Math.max(1, INV.norm*0.25*f);
  const br=[r.s50>0,r.orc>0,r.est>0,r.norm>0].filter(Boolean).length/4*10;
  const nota = Math.round(Math.min(100, r.s50 + log(r.est,15,refEst) + log(r.orc,10,refOrc) + log(r.norm,15,refNorm) + br));
  return { nota, refEst:refEst.toFixed(1), refOrc:refOrc.toFixed(1), refNorm:refNorm.toFixed(1) };
});

// CENÁRIO B: densidade por recomendação (evidências por rec), âncora = densidade média necessária
// ref = 25% do inventário / 50 recs => densidade de referência global
const cenarioB = arts.map(r=>{
  const dEst=r.est/r.recs, dOrc=r.orc/r.recs, dNorm=r.norm/r.recs;
  const refEst=INV.est*0.25/TOTAL_RECS, refOrc=INV.orc*0.25/TOTAL_RECS, refNorm=INV.norm*0.25/TOTAL_RECS;
  const br=[r.s50>0,r.orc>0,r.est>0,r.norm>0].filter(Boolean).length/4*10;
  const nota = Math.round(Math.min(100, r.s50 + log(dEst,15,refEst) + log(dOrc,10,refOrc) + log(dNorm,15,refNorm) + br));
  return { nota, dEst:dEst.toFixed(1), dOrc:dOrc.toFixed(1), dNorm:dNorm.toFixed(2) };
});

console.log('Art | HOJE | A: âncora ∝ recs (refs est/orc/norm) | B: densidade por rec (dEst/dOrc/dNorm)');
let somaPond=0, somaSimples=0;
arts.forEach((r,i)=>{
  somaPond += hoje[i]*r.recs; somaSimples += hoje[i];
  console.log(`${r.a.padEnd(3)} | ${String(hoje[i]).padStart(4)} | ${String(cenarioA[i].nota).padStart(4)}  (${cenarioA[i].refEst}/${cenarioA[i].refOrc}/${cenarioA[i].refNorm}) | ${String(cenarioB[i].nota).padStart(4)}  (${cenarioB[i].dEst}/${cenarioB[i].dOrc}/${cenarioB[i].dNorm})`);
});
console.log(`\nNota global HOJE — média simples: ${(somaSimples/7).toFixed(1)} | média ponderada por recs: ${(somaPond/TOTAL_RECS).toFixed(1)}`);
const pA = arts.reduce((s,r,i)=>s+cenarioA[i].nota*r.recs,0), pB = arts.reduce((s,r,i)=>s+cenarioB[i].nota*r.recs,0);
console.log(`Nota global A — ponderada: ${(pA/TOTAL_RECS).toFixed(1)} | B — ponderada: ${(pB/TOTAL_RECS).toFixed(1)}`);

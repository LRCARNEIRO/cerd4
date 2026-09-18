// distintos por artigo (da matriz auditada) e recomendacoes cumpridas
const arts = [
  { a:'I',   orc:18,  est:5,   norm:2,  cumpr:1, total:6, score50: 8.3 },
  { a:'II',  orc:27,  est:252, norm:11, cumpr:1, total:7, score50: 14.3 },
  { a:'III', orc:158, est:92,  norm:6,  cumpr:2, total:8, score50: 12.5 },
  { a:'IV',  orc:2,   est:7,   norm:4,  cumpr:0, total:4, score50: 0 },
  { a:'V',   orc:202, est:219, norm:16, cumpr:4, total:12, score50: 16.7 },
  { a:'VI',  orc:11,  est:34,  norm:5,  cumpr:1, total:4, score50: 12.5 },
  { a:'VII', orc:43,  est:53,  norm:2,  cumpr:0, total:5, score50: 0 },
];
const cenarios = [
  { nome:'HOJE (teto 10/13/2)', orcMax:10, orcTeto:10, estMax:15, estTeto:13, normMax:15, normTeto:2 },
  { nome:'25% do inventário (51/70/8)', orcMax:10, orcTeto:51, estMax:15, estTeto:70, normMax:15, normTeto:8 },
  { nome:'20% do inventário (41/56/7)', orcMax:10, orcTeto:41, estMax:15, estTeto:56, normMax:15, normTeto:7 },
];
for (const c of cenarios) {
  console.log('\n== ' + c.nome + ' ==');
  console.log('Art | Cump | Est | Orc | Norm | Ampl | Nota');
  for (const r of arts) {
    const est = Math.min(c.estMax, r.est * (c.estMax/c.estTeto));
    const orc = Math.min(c.orcMax, r.orc * (c.orcMax/c.orcTeto));
    const norm = Math.min(c.normMax, r.norm * (c.normMax/c.normTeto));
    const breadth = [r.cumpr>0, r.orc>0, r.est>0, r.norm>0].filter(Boolean).length;
    const ampl = breadth/4*10;
    const nota = Math.round(Math.min(100, r.score50 + est + orc + norm + ampl));
    console.log(`${r.a.padEnd(4)}| ${r.score50.toFixed(1).padStart(4)} | ${est.toFixed(1).padStart(4)} | ${orc.toFixed(1).padStart(4)} | ${norm.toFixed(1).padStart(4)} | ${ampl.toFixed(1).padStart(4)} | ${nota}`);
  }
}

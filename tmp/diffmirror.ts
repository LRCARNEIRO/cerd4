import { buildMirrorIndicators } from '../src/utils/staticToDbTransformer';
import { buildAllStage3Indicators, buildStage4Indicators, buildStage5Indicators } from '../src/utils/stage3Transformers';
const all = [...buildMirrorIndicators(), ...buildAllStage3Indicators(), ...buildStage4Indicators(), ...buildStage5Indicators()];
console.log(JSON.stringify(all.map((r:any)=>({nome:r.nome,categoria:r.categoria,subcategoria:r.subcategoria,dados:r.dados}))));

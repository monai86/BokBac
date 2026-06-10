import { calcProbabilityBayes } from '../dist/lib/bayesianEngine.js';
import { LIBRARY } from '../dist/data/library.js';
import { MCM_DATA } from '../dist/data/mcmData.js';
import { DEFAULT_SUITES } from '../dist/data/suites/defaultSuites.js';

const opts = { library: LIBRARY, mcmData: MCM_DATA, suites: DEFAULT_SUITES };
const answers = {
  Oxidase: '−',
  H2S: '+',
  Indole: '−',
  Citrate: '+',
  Motility: '+',
  Lactose: '−',
  LDC: '+',
};
const res = calcProbabilityBayes('enterobacterales', answers, opts);
console.log(res.slice(0, 3).map(r => `${r.id}: ${r.pct}% (${r.logPosterior}) [mcm: ${r._mcm}] fit: ${r.caseFitScore} contra: ${r.contradictionCount}`));

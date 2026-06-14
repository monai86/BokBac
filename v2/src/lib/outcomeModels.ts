export interface CategoricalOutcomeModel {
  testId: string;
  outcomes: string[];
  /** Given an expected percentage or standard MCM value, compute likelihood for a specific outcome */
  computeLikelihood: (expectedPct: number | null | undefined, outcome: string, group?: string) => number | null;
  /**
   * Some categorical tests, notably TSI, are not present as a single MCM field.
   * These models can estimate P(outcome | organism) from related MCM traits.
   */
  computeLikelihoodFromTraits?: (traits: Record<string, number | undefined>, outcome: string, group?: string) => number | null;
}

function pctToProb(pct: number | null | undefined): number | null {
  if (typeof pct !== 'number' || !Number.isFinite(pct)) return null;
  return Math.max(0, Math.min(100, pct)) / 100;
}

function complement(p: number | null): number | null {
  return p == null ? null : 1 - p;
}

function averageKnown(values: Array<number | null>): number | null {
  const known = values.filter((v): v is number => v != null);
  if (known.length === 0) return null;
  return known.reduce((sum, v) => sum + v, 0) / known.length;
}

function conservativeProduct(values: Array<number | null>, floor = 0.05): number | null {
  const known = values.filter((v): v is number => v != null);
  if (known.length === 0) return null;
  return known.reduce((prod, v) => prod * Math.max(floor, Math.min(1 - floor, v)), 1);
}

function clampLikelihood(value: number): number {
  return Math.max(0.05, Math.min(0.95, value));
}

function normalizeTsiOutcome(outcome: string): string {
  return outcome
    .toLowerCase()
    .replace(/−/g, '-')
    .replace(/₂/g, '2')
    .replace(/\s+/g, '')
    .replace(/,/g, '');
}

function gasPositiveRequested(normalized: string): boolean {
  return normalized.includes('gas+') || normalized.includes('/ag') || normalized.includes('k/ag') || normalized.includes('a/ag');
}

function gasNegativeRequested(normalized: string): boolean {
  return normalized.includes('gas-');
}

function h2sRequested(normalized: string): boolean {
  return normalized.includes('h2s') || normalized.includes('black');
}

function getTraitProb(traits: Record<string, number | undefined>, ...keys: string[]): number | null {
  for (const key of keys) {
    const p = pctToProb(traits[key]);
    if (p != null) return p;
  }
  return null;
}

/**
 * TSI is a composite readout. MCM data in this app does not expose a direct
 * "TSI pattern" field, so this estimates the categorical likelihood from the
 * closest documented traits:
 * - glucose acid -> any acid butt
 * - lactose or sucrose -> acid slant (A/A)
 * - H2S -> blackening
 * - gas from glucose -> gas modifier
 *
 * The values are intentionally conservative. Missing components are ignored,
 * and fully unsupported outcomes return neutral likelihood instead of fake
 * precision.
 */
export function tsiLikelihoodFromTraits(
  traits: Record<string, number | undefined>,
  outcome: string,
  group?: string
): number | null {
  const normalized = normalizeTsiOutcome(outcome);
  if (!normalized) return 0.5;

  let pGlucose = getTraitProb(traits, 'glucose_acid');
  if (group === 'nfb') {
    pGlucose = 0.0; // Non-fermenters do not ferment glucose in TSI butt (anaerobic)
  }
  const pLactose = getTraitProb(traits, 'lactose');
  const pSucrose = getTraitProb(traits, 'sucrose');
  const pH2s = getTraitProb(traits, 'h2s');
  const pGas = getTraitProb(traits, 'glucose_gas', 'gas_glucose');
  const pExtendedSugar = averageKnown([pLactose, pSucrose]);
  const pNoExtendedSugar = conservativeProduct([complement(pLactose), complement(pSucrose)]);
  const wantsH2s = h2sRequested(normalized);
  const wantsGasPositive = gasPositiveRequested(normalized);
  const wantsGasNegative = gasNegativeRequested(normalized);

  if (wantsH2s && pH2s == null) return null;
  if ((wantsGasPositive || wantsGasNegative) && pGas == null) return null;

  let base: number | null = null;

  if (normalized.includes('a/a')) {
    base = conservativeProduct([pGlucose, pExtendedSugar], 0.1);
  } else if (normalized.includes('k/a')) {
    base = conservativeProduct([pGlucose, pNoExtendedSugar], 0.1);
  } else if (normalized.includes('k/k') || normalized.includes('k/n') || normalized.includes('k/nc')) {
    base = complement(pGlucose);
  } else {
    return 0.5;
  }

  if (base == null) return null;

  const modifiers: number[] = [base];
  if (wantsH2s && pH2s != null) modifiers.push(Math.max(0.1, pH2s));
  if (!wantsH2s && pH2s != null && (normalized.includes('k/a') || normalized.includes('a/a'))) {
    modifiers.push(Math.max(0.1, 1 - pH2s));
  }
  if (wantsGasPositive && pGas != null) modifiers.push(Math.max(0.1, pGas));
  if (wantsGasNegative && pGas != null) modifiers.push(Math.max(0.1, 1 - pGas));

  return clampLikelihood(modifiers.reduce((sum, v) => sum + v, 0) / modifiers.length);
}

export const OUTCOME_MODELS: Record<string, CategoricalOutcomeModel> = {
  hemolysis: {
    testId: 'hemolysis',
    outcomes: ['α (alpha)', 'β (beta)', 'γ (gamma/none)', 'α/γ', 'β/γ'],
    computeLikelihood: (pct, outcome) => {
      const o = outcome.toLowerCase().replace(/−/g, '-');
      if (typeof pct === 'number') {
        const pBeta = pct / 100;
        if (o.includes('β') || o.includes('beta') || o === '+') return pBeta;
        if (o.includes('α') || o.includes('alpha')) return (1 - pBeta) * 0.5;
        if (o.includes('γ') || o.includes('gamma') || o.includes('none') || o === '-') return (1 - pBeta) * 0.5;
      }
      return 0.5;
    }
  },
  tsi: {
    testId: 'tsi',
    outcomes: ['A/A', 'A/A (gas+)', 'A/A (gas−)', 'K/A', 'K/A (gas+)', 'K/A H2S', 'K/AG H2S', 'K/K', 'K/N', 'K/NC'],
    computeLikelihood: (_pct, outcome, group) => tsiLikelihoodFromTraits({}, outcome, group),
    computeLikelihoodFromTraits: (traits, outcome, group) => tsiLikelihoodFromTraits(traits, outcome, group)
  },
  urease: {
    testId: 'urease',
    outcomes: ['++ (rapid)', '+ (slow)', '−'],
    computeLikelihood: (pct, outcome) => {
      const o = outcome.toLowerCase().replace(/−/g, '-');
      if (typeof pct === 'number') {
        const pPos = pct / 100;
        if (o.includes('++') || o.includes('rapid')) return pPos;
        if (o === '+' || o.includes('slow')) return pPos;
        if (o === '-') return 1 - pPos;
      }
      return 0.5;
    }
  }
}

export function categoricalLikelihood(testId: string, expectedPct: number | null | undefined, outcome: string, group?: string): number | null {
  const model = OUTCOME_MODELS[testId.toLowerCase()];
  if (model) {
    return model.computeLikelihood(expectedPct, outcome, group);
  }
  return null;
}

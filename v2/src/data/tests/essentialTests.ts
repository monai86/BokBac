import { lookupTestDefinition } from './biochemicalTestRegistry'

export interface EssentialGroupTests {
  primary: string[] // essential confirmatory tests
  core: string[]    // highly recommended to distinguish species
  minTests: number  // minimum recommended test answers for a reliable identification
}

export const ESSENTIAL_GROUP_TESTS: Record<string, EssentialGroupTests> = {
  enterobacterales: {
    primary: ['oxidase', 'lactose'],
    core: ['indole', 'citrate', 'urease', 'motility', 'h2s', 'ldc'],
    minTests: 5,
  },
  nfb: {
    primary: ['oxidase', 'glucose'],
    core: ['motility', 'growth_42', 'king_p', 'king_f'],
    minTests: 4,
  },
  vibrio: {
    primary: ['oxidase'],
    core: ['sucrose', 'o129', 'salt_tolerance', 'indole'], // note: salt_tolerance maps to 6.5% NaCl in suite
    minTests: 4,
  },
  gpc_cluster: {
    primary: ['catalase', 'coagulase'],
    core: ['novobiocin', 'dnase', 'mannitol'],
    minTests: 3,
  },
  gpc_chain: {
    primary: ['catalase', 'hemolysis'],
    core: ['optochin', 'bacitracin', 'camp', 'bile_esculin', 'salt_tolerance'], // note: salt_tolerance is 6.5% NaCl
    minTests: 3,
  },
  gpb: {
    primary: ['catalase'],
    core: ['motility', 'hemolysis', 'camp'],
    minTests: 3,
  },
  gn_coccobacilli: {
    primary: ['oxidase'],
    core: ['glucose', 'maltose', 'lactose', 'sucrose'],
    minTests: 3,
  },
}

export interface SuiteDiagnosticPowerResult {
  score: number // 0-100
  rating: 'weak' | 'adequate' | 'excellent'
  missingPrimary: string[]
  missingCore: string[]
}

/**
 * Calculates the diagnostic power score of a given suite of tests for a specific group.
 * Primary tests are worth 25 points each.
 * Core tests are worth 10 points each.
 * The total score is capped at 100.
 */
export function calculateSuiteDiagnosticPower(
  group: string,
  testIds: string[]
): SuiteDiagnosticPowerResult {
  const rules = ESSENTIAL_GROUP_TESTS[group]
  if (!rules) {
    return { score: 100, rating: 'excellent', missingPrimary: [], missingCore: [] }
  }

  const testIdSet = new Set(testIds.map(id => id.toLowerCase().replace(/[^a-z0-9]/g, '')))
  
  // Helper to match helper keys like 'salt_tolerance' to 'salttolerance' or '65nacl'
  const hasTest = (id: string): boolean => {
    const cleanId = id.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (testIdSet.has(cleanId)) return true
    
    // special alias handling for rules matching suites
    if (cleanId === 'salttolerance') {
      return testIdSet.has('65nacl') || testIdSet.has('salttolerance')
    }
    if (cleanId === 'glucose') {
      return testIdSet.has('glucose') || testIdSet.has('glucoseacid') || testIdSet.has('glucoseof')
    }
    if (cleanId === 'lactose') {
      return testIdSet.has('lactose') || testIdSet.has('maclactose') || testIdSet.has('tsilactose')
    }
    return false
  }

  const missingPrimary: string[] = []
  const missingCore: string[] = []

  let score = 0
  
  for (const p of rules.primary) {
    if (hasTest(p)) {
      score += 25
    } else {
      const def = lookupTestDefinition(p)
      missingPrimary.push(def?.label || p)
    }
  }

  for (const c of rules.core) {
    if (hasTest(c)) {
      score += 10
    } else {
      const def = lookupTestDefinition(c)
      missingCore.push(def?.label || c)
    }
  }

  const finalScore = Math.min(100, score)
  let rating: 'weak' | 'adequate' | 'excellent' = 'weak'
  if (finalScore >= 75) {
    rating = 'excellent'
  } else if (finalScore >= 40) {
    rating = 'adequate'
  }

  return {
    score: finalScore,
    rating,
    missingPrimary,
    missingCore,
  }
}

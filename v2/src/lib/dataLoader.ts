// Loads the legacy LIBRARY + SUITES + MCM_DATA exports and adapts them to
// the typed v4 engine API.

import { LIBRARY_ALL, SUITES } from '@/data/bacteriaLibrary'
import { MCM_DATA } from '@/data/mcmData'

import { normalizeBiochemNamesForBug } from './testMatcher'
import type { McmDataMap, Species, SuitesMap } from './types'

const SUITES_TYPED = SUITES as SuitesMap
const LIBRARY_RAW = LIBRARY_ALL as Species[]
const MCM_TYPED = MCM_DATA as McmDataMap

/** Single normalized library — bug.biochem rows are renamed to suite labels. */
export const LIBRARY_CLEAN: Species[] = LIBRARY_RAW.map((b) =>
  normalizeBiochemNamesForBug(b, SUITES_TYPED)
)

export const ALL_SUITES: SuitesMap = SUITES_TYPED
export const ALL_MCM_DATA: McmDataMap = MCM_TYPED

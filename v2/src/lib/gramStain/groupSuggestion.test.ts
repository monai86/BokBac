import { describe, expect, it } from 'vitest'
import { suggestOrganismGroups } from './groupSuggestion'

describe('suggestOrganismGroups specimen context', () => {
  it('reorders stool gram-negative rod suggestions compared with unknown specimen', () => {
    const base = suggestOrganismGroups({
      specimen: 'unknown',
      gramReaction: 'negative',
      morphology: 'bacilli',
      arrangement: 'unknown',
    }).map((item) => item.groupId)
    const stool = suggestOrganismGroups({
      specimen: 'stool',
      gramReaction: 'negative',
      morphology: 'bacilli',
      arrangement: 'unknown',
    }).map((item) => item.groupId)

    expect(stool).not.toEqual(base)
    expect(stool).toEqual(['enterobacterales', 'vibrio', 'nfb'])
  })

  it('prioritizes GN coccobacilli for genital gram-negative diplococci', () => {
    const suggestions = suggestOrganismGroups({
      specimen: 'genital',
      gramReaction: 'negative',
      morphology: 'cocci',
      arrangement: 'diplococci',
    })

    expect(suggestions[0].groupId).toBe('gn_coccobacilli')
    expect(suggestions[0].reason).toContain('สิ่งส่งตรวจ genital')
  })

  it('prioritizes Enterobacterales for urine gram-negative rods', () => {
    const suggestions = suggestOrganismGroups({
      specimen: 'urine',
      gramReaction: 'negative',
      morphology: 'bacilli',
      arrangement: 'unknown',
    })

    expect(suggestions[0].groupId).toBe('enterobacterales')
  })

  it('keeps specimen-only suggestions contextual and non-overconfident', () => {
    const suggestions = suggestOrganismGroups({
      specimen: 'stool',
      gramReaction: 'unknown',
      morphology: 'unknown',
      arrangement: 'unknown',
    })

    expect(suggestions.length).toBeGreaterThan(1)
    expect(suggestions.every((item) => item.confidence === 'contextual')).toBe(true)
  })

  it('does not remove otherwise compatible GN rod groups when specimen is present', () => {
    const base = suggestOrganismGroups({
      specimen: 'unknown',
      gramReaction: 'negative',
      morphology: 'bacilli',
      arrangement: 'unknown',
    }).map((item) => item.groupId)
    const stool = suggestOrganismGroups({
      specimen: 'stool',
      gramReaction: 'negative',
      morphology: 'bacilli',
      arrangement: 'unknown',
    }).map((item) => item.groupId)

    expect(stool).toEqual(expect.arrayContaining(base))
  })
})

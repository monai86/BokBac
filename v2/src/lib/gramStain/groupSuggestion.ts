import type { InitialObservation, SpecimenType } from '../types'

export interface SuggestedGroup {
  groupId: string
  name: string
  reason: string
  score: number
  confidence: 'strong' | 'moderate' | 'contextual'
}

type SuggestionDraft = SuggestedGroup & {
  order: number
}

const GROUP_LABELS: Record<string, string> = {
  gpc_cluster: 'GPC Cluster (Staphylococcus / Micrococcus)',
  gpc_chain: 'GPC Chain (Streptococcus / Enterococcus)',
  gpb: 'Gram-Positive Bacilli',
  enterobacterales: 'Enterobacterales',
  nfb: 'Non-Fermenters (NFB)',
  vibrio: 'Vibrionaceae / Aeromonas',
  gn_coccobacilli: 'GN Diplococci / Coccobacilli',
}

const SPECIMEN_GROUP_HINTS: Record<Exclude<SpecimenType, 'unknown'>, Record<string, number>> = {
  stool: { enterobacterales: 3, vibrio: 4, nfb: 1 },
  urine: { enterobacterales: 4, gpc_cluster: 1, gpc_chain: 1 },
  genital: { gn_coccobacilli: 4, gpc_chain: 1 },
  respiratory: { gpc_chain: 2, gn_coccobacilli: 2, nfb: 1 },
  csf: { gn_coccobacilli: 2, gpc_chain: 2, enterobacterales: 1 },
  blood: { enterobacterales: 1, gpc_cluster: 1, gpc_chain: 1, nfb: 1 },
  wound: { gpc_cluster: 2, enterobacterales: 1, nfb: 1, gpc_chain: 1 },
  throat: { gpc_chain: 3, gn_coccobacilli: 1 },
  ear: { nfb: 2, gpc_cluster: 1 },
}

function isKnownSpecimen(specimen: SpecimenType | undefined): specimen is Exclude<SpecimenType, 'unknown'> {
  return specimen != null && specimen !== 'unknown'
}

function confidenceFor(score: number, hasMorphologySignal: boolean): SuggestedGroup['confidence'] {
  if (!hasMorphologySignal) return 'contextual'
  if (score >= 9) return 'strong'
  return 'moderate'
}

function addOrBoostSuggestion(
  suggestions: Map<string, SuggestionDraft>,
  groupId: string,
  name: string,
  reason: string,
  score: number,
  order: number,
): void {
  const existing = suggestions.get(groupId)
  if (existing) {
    existing.score += score
    if (!existing.reason.includes(reason)) {
      existing.reason = `${existing.reason} ${reason}`
    }
    return
  }

  suggestions.set(groupId, {
    groupId,
    name,
    reason,
    score,
    confidence: 'moderate',
    order,
  })
}

export function suggestOrganismGroups(obs: InitialObservation): SuggestedGroup[] {
  const suggestions = new Map<string, SuggestionDraft>()
  let order = 0

  const isGP = obs.gramReaction === 'positive'
  const isGN = obs.gramReaction === 'negative'
  const hasMorphologySignal =
    (obs.gramReaction === 'positive' || obs.gramReaction === 'negative') &&
    obs.morphology !== 'unknown'

  // Cocci GPC/GNC
  if (obs.morphology === 'cocci') {
    if (isGP) {
      if (obs.arrangement === 'cluster') {
        addOrBoostSuggestion(
          suggestions,
          'gpc_cluster',
          GROUP_LABELS.gpc_cluster,
          'แบคทีเรียกลมย้อมติดสีแกรมบวก เรียงตัวเป็นกลุ่มคล้ายพวงองุ่น มักจะเป็นกลุ่ม Staphylococci หรือ Micrococci',
          10,
          order++,
        )
      } else if (obs.arrangement === 'chain' || obs.arrangement === 'pairs' || obs.arrangement === 'diplococci') {
        addOrBoostSuggestion(
          suggestions,
          'gpc_chain',
          GROUP_LABELS.gpc_chain,
          'แบคทีเรียกลมย้อมติดสีแกรมบวก เรียงตัวเป็นสายหรือเป็นคู่ มักจะเป็นกลุ่ม Streptococci หรือ Enterococci',
          10,
          order++,
        )
      } else {
        addOrBoostSuggestion(
          suggestions,
          'gpc_cluster',
          'GPC Cluster (Staphylococcus)',
          'แกรมบวกทรงกลม แนะนำตรวจ catalase และ coagulase เพิ่มเติม',
          7,
          order++,
        )
        addOrBoostSuggestion(
          suggestions,
          'gpc_chain',
          'GPC Chain (Streptococcus)',
          'แกรมบวกทรงกลม แนะนำตรวจ catalase และสังเกต hemolysis บน blood agar',
          7,
          order++,
        )
      }
    } else if (isGN) {
      addOrBoostSuggestion(
        suggestions,
        'gn_coccobacilli',
        'GN Diplococci / Coccobacilli (Neisseria)',
        'แกรมลบทรงกลมหรือทรงกลมปนแท่ง มักพบเรียงตัวเป็นคู่ (diplococci) เช่น Neisseria หรือ Moraxella',
        9,
        order++,
      )
    }
  }

  // Bacilli (Rods) GPB/GNB
  if (obs.morphology === 'bacilli') {
    if (isGP) {
      addOrBoostSuggestion(
        suggestions,
        'gpb',
        'Gram-Positive Bacilli (Bacillus / Listeria)',
        'แบคทีเรียแท่งแกรมบวก มักจะเป็นกลุ่ม Bacillus (สร้างสปอร์) หรือ Listeria/Corynebacterium (ไม่สร้างสปอร์)',
        9,
        order++,
      )
    } else if (isGN) {
      addOrBoostSuggestion(
        suggestions,
        'enterobacterales',
        'Enterobacterales (oxidase-negative)',
        'แบคทีเรียแท่งแกรมลบขนาดกลาง เจริญเติบโตได้ดีบน MacConkey agar และ oxidase เป็นลบ',
        8,
        order++,
      )
      addOrBoostSuggestion(
        suggestions,
        'nfb',
        'Non-Fermenters (NFB - oxidase-variable)',
        'แบคทีเรียแท่งแกรมลบที่ไม่ ferment น้ำตาล glucose เช่น Pseudomonas หรือ Acinetobacter',
        7,
        order++,
      )
      addOrBoostSuggestion(
        suggestions,
        'vibrio',
        'Vibrionaceae (oxidase-positive)',
        'แบคทีเรียแท่งแกรมลบ มักเจริญเติบโตบน TCBS agar หรือเป็น oxidase-positive แท่งตรงหรือโค้ง',
        6,
        order++,
      )
    }
  }

  // Coccobacilli
  if (obs.morphology === 'coccobacilli') {
    if (isGN) {
      addOrBoostSuggestion(
        suggestions,
        'gn_coccobacilli',
        'GN Coccobacilli (Haemophilus / Acinetobacter)',
        'แบคทีเรียแกรมลบขนาดเล็กมาก ทรงกลมปนแท่ง เช่น Haemophilus หรือ Acinetobacter บางสปีชีส์',
        9,
        order++,
      )
      addOrBoostSuggestion(
        suggestions,
        'enterobacterales',
        'Enterobacterales (short rods)',
        'Enterobacterales บางชนิดอาจมีขนาดสั้นคล้าย coccobacilli ได้ในบางสภาวะ',
        5,
        order++,
      )
    } else if (isGP) {
      addOrBoostSuggestion(
        suggestions,
        'gpb',
        'Gram-Positive Bacilli',
        'Listeria หรือ Corynebacterium บางครั้งอาจเห็นขนาดสั้นคล้าย coccobacilli',
        7,
        order++,
      )
    }
  }

  // Curved rod
  if (obs.morphology === 'curved_rod') {
    if (isGN) {
      addOrBoostSuggestion(
        suggestions,
        'vibrio',
        'Vibrionaceae / Campylobacter',
        'แบคทีเรียแกรมลบรูปแท่งโค้งงอหรือรูปเครื่องหมายจุลภาค (comma-shaped) ชี้แนะกลุ่ม Vibrio spp. เป็นหลัก',
        10,
        order++,
      )
    }
  }

  // Branching filament
  if (obs.morphology === 'branching_filament') {
    if (isGP) {
      addOrBoostSuggestion(
        suggestions,
        'gpb',
        'Gram-Positive Branching Filaments (Nocardia / Actinomyces)',
        'แบคทีเรียแกรมบวกที่มีการแตกแขนงคล้ายเส้นใย เช่น Nocardia หรือ Actinomyces',
        10,
        order++,
      )
    }
  }

  // Diplococci (explicit check)
  if (obs.arrangement === 'diplococci' && isGN) {
    addOrBoostSuggestion(
      suggestions,
      'gn_coccobacilli',
      'GN Diplococci (Neisseria / Moraxella)',
      'แกรมลบทรงกลมเรียงตัวเป็นคู่ แนะนำตรวจ oxidase และ CTA sugars หรือ DNase',
      3,
      order++,
    )
  }

  // If no specific suggestion, default to general groups based on Gram reaction
  if (suggestions.size === 0) {
    if (isGP) {
      addOrBoostSuggestion(suggestions, 'gpc_cluster', 'GPC Cluster (Staphylococcus)', 'แกรมบวก', 4, order++)
      addOrBoostSuggestion(suggestions, 'gpc_chain', 'GPC Chain (Streptococcus)', 'แกรมบวก', 4, order++)
      addOrBoostSuggestion(suggestions, 'gpb', 'GP Bacilli', 'แกรมบวก', 4, order++)
    } else if (isGN) {
      addOrBoostSuggestion(suggestions, 'enterobacterales', 'Enterobacterales', 'แกรมลบ', 4, order++)
      addOrBoostSuggestion(suggestions, 'nfb', 'Non-Fermenters (NFB)', 'แกรมลบ', 4, order++)
      addOrBoostSuggestion(suggestions, 'vibrio', 'Vibrionaceae', 'แกรมลบ', 4, order++)
      addOrBoostSuggestion(suggestions, 'gn_coccobacilli', 'GN Coccobacilli', 'แกรมลบ', 4, order++)
    } else if (isKnownSpecimen(obs.specimen)) {
      const hints = SPECIMEN_GROUP_HINTS[obs.specimen]
      Object.entries(hints).forEach(([groupId, boost]) =>
        addOrBoostSuggestion(
          suggestions,
          groupId,
          GROUP_LABELS[groupId] ?? groupId,
          `สิ่งส่งตรวจ ${obs.specimen} เป็นบริบทอ่อนสำหรับจัดลำดับเท่านั้น`,
          boost,
          order++,
        )
      )
    } else {
      return []
    }
  }

  if (isKnownSpecimen(obs.specimen)) {
    const hints = SPECIMEN_GROUP_HINTS[obs.specimen]
    for (const [groupId, boost] of Object.entries(hints)) {
      const suggestion = suggestions.get(groupId)
      if (!suggestion) continue
      suggestion.score += boost
      suggestion.reason = `${suggestion.reason} สิ่งส่งตรวจ ${obs.specimen} เพิ่มน้ำหนักบริบทเล็กน้อย แต่ไม่ใช้ตัดกลุ่มอื่นออก`
    }
  }

  return [...suggestions.values()]
    .map((suggestion) => ({
      groupId: suggestion.groupId,
      name: suggestion.name,
      reason: suggestion.reason,
      score: suggestion.score,
      confidence: confidenceFor(suggestion.score, hasMorphologySignal),
    }))
    .sort((a, b) => b.score - a.score || suggestions.get(a.groupId)!.order - suggestions.get(b.groupId)!.order)
}

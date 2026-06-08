import type { InitialObservation } from '../types'

export interface SuggestedGroup {
  groupId: string
  name: string
  reason: string
}

export function suggestOrganismGroups(obs: InitialObservation): SuggestedGroup[] {
  const suggestions: SuggestedGroup[] = []

  const isGP = obs.gramReaction === 'positive'
  const isGN = obs.gramReaction === 'negative'

  // Cocci GPC/GNC
  if (obs.morphology === 'cocci') {
    if (isGP) {
      if (obs.arrangement === 'cluster') {
        suggestions.push({
          groupId: 'gpc_cluster',
          name: 'GPC Cluster (Staphylococcus / Micrococcus)',
          reason: 'แบคทีเรียกลมย้อมติดสีแกรมบวก เรียงตัวเป็นกลุ่มคล้ายพวงองุ่น มักจะเป็นกลุ่ม Staphylococci หรือ Micrococci',
        })
      } else if (obs.arrangement === 'chain' || obs.arrangement === 'pairs' || obs.arrangement === 'diplococci') {
        suggestions.push({
          groupId: 'gpc_chain',
          name: 'GPC Chain (Streptococcus / Enterococcus)',
          reason: 'แบคทีเรียกลมย้อมติดสีแกรมบวก เรียงตัวเป็นสายหรือเป็นคู่ มักจะเป็นกลุ่ม Streptococci หรือ Enterococci',
        })
      } else {
        suggestions.push(
          {
            groupId: 'gpc_cluster',
            name: 'GPC Cluster (Staphylococcus)',
            reason: 'แกรมบวกทรงกลม แนะนำตรวจ catalase และ coagulase เพิ่มเติม',
          },
          {
            groupId: 'gpc_chain',
            name: 'GPC Chain (Streptococcus)',
            reason: 'แกรมบวกทรงกลม แนะนำตรวจ catalase และสังเกต hemolysis บน blood agar',
          }
        )
      }
    } else if (isGN) {
      suggestions.push({
        groupId: 'gn_coccobacilli',
        name: 'GN Diplococci / Coccobacilli (Neisseria)',
        reason: 'แกรมลบทรงกลมหรือทรงกลมปนแท่ง มักพบเรียงตัวเป็นคู่ (diplococci) เช่น Neisseria หรือ Moraxella',
      })
    }
  }

  // Bacilli (Rods) GPB/GNB
  if (obs.morphology === 'bacilli') {
    if (isGP) {
      suggestions.push({
        groupId: 'gpb',
        name: 'Gram-Positive Bacilli (Bacillus / Listeria)',
        reason: 'แบคทีเรียแท่งแกรมบวก มักจะเป็นกลุ่ม Bacillus (สร้างสปอร์) หรือ Listeria/Corynebacterium (ไม่สร้างสปอร์)',
      })
    } else if (isGN) {
      suggestions.push(
        {
          groupId: 'enterobacterales',
          name: 'Enterobacterales (oxidase-negative)',
          reason: 'แบคทีเรียแท่งแกรมลบขนาดกลาง เจริญเติบโตได้ดีบน MacConkey agar และ oxidase เป็นลบ',
        },
        {
          groupId: 'nfb',
          name: 'Non-Fermenters (NFB - oxidase-variable)',
          reason: 'แบคทีเรียแท่งแกรมลบที่ไม่ ferment น้ำตาล glucose เช่น Pseudomonas หรือ Acinetobacter',
        },
        {
          groupId: 'vibrio',
          name: 'Vibrionaceae (oxidase-positive)',
          reason: 'แบคทีเรียแท่งแกรมลบ มักเจริญเติบโตบน TCBS agar หรือเป็น oxidase-positive แท่งตรงหรือโค้ง',
        }
      )
    }
  }

  // Coccobacilli
  if (obs.morphology === 'coccobacilli') {
    if (isGN) {
      suggestions.push(
        {
          groupId: 'gn_coccobacilli',
          name: 'GN Coccobacilli (Haemophilus / Acinetobacter)',
          reason: 'แบคทีเรียแกรมลบขนาดเล็กมาก ทรงกลมปนแท่ง เช่น Haemophilus หรือ Acinetobacter บางสปีชีส์',
        },
        {
          groupId: 'enterobacterales',
          name: 'Enterobacterales (short rods)',
          reason: 'Enterobacterales บางชนิดอาจมีขนาดสั้นคล้าย coccobacilli ได้ในบางสภาวะ',
        }
      )
    } else if (isGP) {
      suggestions.push({
        groupId: 'gpb',
        name: 'Gram-Positive Bacilli',
        reason: 'Listeria หรือ Corynebacterium บางครั้งอาจเห็นขนาดสั้นคล้าย coccobacilli',
      })
    }
  }

  // Curved rod
  if (obs.morphology === 'curved_rod') {
    if (isGN) {
      suggestions.push({
        groupId: 'vibrio',
        name: 'Vibrionaceae / Campylobacter',
        reason: 'แบคทีเรียแกรมลบรูปแท่งโค้งงอหรือรูปเครื่องหมายจุลภาค (comma-shaped) ชี้แนะกลุ่ม Vibrio spp. เป็นหลัก',
      })
    }
  }

  // Branching filament
  if (obs.morphology === 'branching_filament') {
    if (isGP) {
      suggestions.push({
        groupId: 'gpb',
        name: 'Gram-Positive Branching Filaments (Nocardia / Actinomyces)',
        reason: 'แบคทีเรียแกรมบวกที่มีการแตกแขนงคล้ายเส้นใย เช่น Nocardia หรือ Actinomyces',
      })
    }
  }

  // Diplococci (explicit check)
  if (obs.arrangement === 'diplococci' && isGN) {
    suggestions.push({
      groupId: 'gn_coccobacilli',
      name: 'GN Diplococci (Neisseria / Moraxella)',
      reason: 'แกรมลบทรงกลมเรียงตัวเป็นคู่ แนะนำตรวจ oxidase และ CTA sugars หรือ DNase',
    })
  }

  // If no specific suggestion, default to general groups based on Gram reaction
  if (suggestions.length === 0) {
    if (isGP) {
      suggestions.push(
        { groupId: 'gpc_cluster', name: 'GPC Cluster (Staphylococcus)', reason: 'แกรมบวก' },
        { groupId: 'gpc_chain', name: 'GPC Chain (Streptococcus)', reason: 'แกรมบวก' },
        { groupId: 'gpb', name: 'GP Bacilli', reason: 'แกรมบวก' }
      )
    } else if (isGN) {
      suggestions.push(
        { groupId: 'enterobacterales', name: 'Enterobacterales', reason: 'แกรมลบ' },
        { groupId: 'nfb', name: 'Non-Fermenters (NFB)', reason: 'แกรมลบ' },
        { groupId: 'vibrio', name: 'Vibrionaceae', reason: 'แกรมลบ' },
        { groupId: 'gn_coccobacilli', name: 'GN Coccobacilli', reason: 'แกรมลบ' }
      )
    } else {
      suggestions.push({
        groupId: 'enterobacterales',
        name: 'General Identification (Default: Enterobacterales)',
        reason: 'กรุณาใส่ผลแกรมหรือรูปร่างเพื่อชี้แนะกลุ่มเชื้อที่จำเพาะเจาะจงขึ้น',
      })
    }
  }

  return suggestions
}

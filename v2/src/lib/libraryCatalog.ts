import { GROUPS } from '@/data/bacteriaLibrary'
import { LIBRARY_CLEAN } from '@/lib/dataLoader'
import type { Species } from '@/lib/types'

interface GroupMeta {
  id: string
  label: string
  emoji?: string
  color?: string
}

export const GROUP_META = (GROUPS as GroupMeta[]).filter((group) => group.id !== 'all')

export function getGroupMeta(groupId: string) {
  return GROUP_META.find((group) => group.id === groupId)
}

export function getLibrarySpecies() {
  return LIBRARY_CLEAN
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name, 'en'))
}

export function getSpeciesById(speciesId: string) {
  return LIBRARY_CLEAN.find((species) => species.id === speciesId)
}

export function searchSpecies(species: Species, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const haystack = [
    species.name,
    typeof species.thai === 'string' ? species.thai : '',
    species.group,
    species.importance,
    typeof species.gram === 'string' ? species.gram : '',
    typeof species.morph === 'string' ? species.morph : '',
    ...(Array.isArray(species.tags) ? species.tags : []),
    ...(Array.isArray(species.media) ? species.media : []),
    ...(Array.isArray(species.biochem) ? species.biochem.flatMap((item) => [item.t, item.r, item.n || '']) : []),
  ]

  return haystack
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalized))
}

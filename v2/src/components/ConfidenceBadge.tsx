import type { ConfidenceLevel } from '@/lib/types'

const LABELS: Record<ConfidenceLevel, { label: string; title: string; color: string }> = {
  high: {
    label: 'Strong teaching match',
    title: 'Evidence is consistent, but this is still an educational probability estimate.',
    color: 'bg-emerald-500/15 text-emerald-200 border-emerald-500/35',
  },
  medium: {
    label: 'Moderate support',
    title: 'Several findings point in the same direction. More confirmatory tests may still be needed.',
    color: 'bg-sky-500/15 text-sky-200 border-sky-500/35',
  },
  low: {
    label: 'Limited evidence',
    title: 'The current result is based on sparse, weak, or mixed evidence.',
    color: 'bg-amber-500/15 text-amber-200 border-amber-500/35',
  },
  very_low: {
    label: 'Uncertain',
    title: 'Evidence is insufficient or contradictory. Treat the ranking as exploratory.',
    color: 'bg-rose-500/15 text-rose-200 border-rose-500/35',
  },
}

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const cfg = LABELS[level]
  return (
    <span
      title={cfg.title}
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider ${cfg.color}`}
    >
      {cfg.label}
    </span>
  )
}

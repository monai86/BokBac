import type { ConfidenceLevel } from '@/lib/types'

const LABELS: Record<ConfidenceLevel, { label: string; color: string }> = {
  high: { label: 'HIGH', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  medium: { label: 'MEDIUM', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  low: { label: 'LOW', color: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  very_low: { label: 'UNCERTAIN', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
}

export function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const cfg = LABELS[level]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wider ${cfg.color}`}
    >
      ● {cfg.label}
    </span>
  )
}

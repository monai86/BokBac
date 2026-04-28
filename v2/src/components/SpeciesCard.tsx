import type { RankedSpecies } from '@/lib/types'
import { ConfidenceBadge } from './ConfidenceBadge'
import { McmBadge } from './McmBadge'

export function SpeciesCard({ species, rank }: { species: RankedSpecies; rank: number }) {
  const isTop = rank === 0
  const barColor =
    species.pct >= 70 ? 'bg-emerald-400'
    : species.pct >= 40 ? 'bg-amber-400'
    : species.pct >= 20 ? 'bg-orange-400'
    : 'bg-rose-400'

  return (
    <div
      className={`lg-surface p-4 transition-all ${isTop ? 'ring-2 ring-violet-500/50 shadow-lg shadow-violet-500/10' : ''}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500">#{rank + 1}</span>
            <h3 className="font-semibold text-zinc-100 truncate">{species.name}</h3>
            {species._mcm && <McmBadge count={species._usedMcmTests} />}
            {isTop && species._confidence && <ConfidenceBadge level={species._confidence} />}
          </div>
          {(species as { thai?: string }).thai && (
            <p className="text-xs text-zinc-500 mt-0.5">
              {(species as { thai?: string }).thai}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className={`text-2xl font-bold ${species._excluded ? 'text-zinc-600' : 'text-zinc-100'}`}>
            {species.pct}%
          </span>
          {species._excluded && <span className="text-[10px] text-rose-400">EXCLUDED</span>}
        </div>
      </div>

      {!species._excluded && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
          <div
            className={`h-full transition-all duration-500 ${barColor}`}
            style={{ width: `${species.pct}%` }}
          />
        </div>
      )}

      {(species as { tags?: string[] }).tags && (
        <div className="mt-2 flex flex-wrap gap-1">
          {((species as { tags?: string[] }).tags || []).slice(0, 4).map((t, i) => (
            <span
              key={i}
              className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-400"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

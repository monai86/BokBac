import type { RankedSpecies } from '@/lib/types'
import { ConfidenceBadge } from './ConfidenceBadge'
import { McmBadge } from './McmBadge'
import { Link } from 'react-router-dom'

export function SpeciesCard({ species, rank }: { species: RankedSpecies; rank: number }) {
  const isTop = rank === 0
  const supportCount = species._evidence?.filter((item) => item.direction === 'supportive').length ?? 0
  const conflictCount = species._evidence?.filter((item) => item.direction === 'conflicting').length ?? 0

  return (
    <Link
      to={`/library/${species.id}`}
      className={`result-card block group ${
        isTop ? 'top' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500 font-semibold">#{rank + 1}</span>
            <h3 className="font-semibold text-zinc-100 truncate group-hover:text-white">{species.name}</h3>
            {isTop && (
              <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-[10px] font-semibold text-violet-200">
                Suggested match
              </span>
            )}
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
          {species._excluded && <span className="text-[10px] font-bold text-rose-300 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/25">Ruled out</span>}
        </div>
      </div>

      {!species._excluded && (
        <div className="mt-3.5 grid grid-cols-3 gap-2">
          <div className="bg-white/5 rounded px-2 py-1.5 border border-white/5">
            <div className="text-[9px] text-zinc-500 font-medium">Candidate set</div>
            <div className="text-sm font-bold text-zinc-200">
              {Math.round(species.posteriorWithinCandidateSet ?? species.pct)}%
            </div>
          </div>
          <div className="bg-white/5 rounded px-2 py-1.5 border border-white/5">
            <div className="text-[9px] text-zinc-500 font-medium">Case Fit</div>
            <div className="text-sm font-bold text-zinc-200">
              {species.caseFitScore != null ? Math.round(species.caseFitScore * 100) : '--'}%
            </div>
          </div>
          <div className="bg-white/5 rounded px-2 py-1.5 border border-white/5">
            <div className="text-[9px] text-zinc-500 font-medium">Coverage</div>
            <div className="text-sm font-bold text-zinc-200">
              {species.evidenceCoverage != null ? Math.round(species.evidenceCoverage * 100) : '--'}%
            </div>
          </div>
        </div>
      )}

      {!species._excluded && species._evidence?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5 text-[10px]">
          <span className="rounded border border-emerald-500/20 bg-emerald-500/10 px-1.5 py-0.5 text-emerald-200">
            Supports {supportCount}
          </span>
          <span className="rounded border border-rose-500/20 bg-rose-500/10 px-1.5 py-0.5 text-rose-200">
            Conflicts {conflictCount}
          </span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        {(species as { tags?: string[] }).tags && (
          <div className="flex flex-wrap gap-1">
            {((species as { tags?: string[] }).tags || []).slice(0, 3).map((t, i) => (
              <span
                key={i}
                className="rounded bg-white/5 border border-white/5 px-1.5 py-0.5 text-[9px] text-zinc-400 font-medium"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        <span className="text-[10px] text-violet-400 group-hover:text-violet-300 font-medium flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          Evidence detail
        </span>
      </div>
    </Link>
  )
}

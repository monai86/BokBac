import type { RankedSpecies } from '@/lib/types'
import { ConfidenceBadge } from './ConfidenceBadge'
import { McmBadge } from './McmBadge'
import { Link } from 'react-router-dom'

export function SpeciesCard({ species, rank }: { species: RankedSpecies; rank: number }) {
  const isTop = rank === 0
  const barColor =
    species.pct >= 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
    : species.pct >= 40 ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
    : species.pct >= 20 ? 'bg-gradient-to-r from-orange-500 to-amber-500'
    : 'bg-gradient-to-r from-rose-500 to-pink-500'

  return (
    <Link
      to={`/library/${species.id}`}
      className={`lg-surface p-4 block transition-all hover:scale-[1.01] hover:border-violet-500/30 hover:bg-white/[0.06] group ${
        isTop ? 'ring-2 ring-violet-500/40 shadow-lg shadow-violet-500/10 bg-violet-950/[0.03]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-zinc-500 font-semibold">#{rank + 1}</span>
            <h3 className="font-semibold text-zinc-100 truncate group-hover:text-white">{species.name}</h3>
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
          <span className={`text-2xl font-bold tracking-tight ${species._excluded ? 'text-zinc-600' : 'text-zinc-100'}`}>
            {species.pct}%
          </span>
          {species._excluded && <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-1 py-0.5 rounded border border-rose-500/25">EXCLUDED</span>}
        </div>
      </div>

      {!species._excluded && (
        <>
          <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-white/5 relative">
            <div
              className={`h-full transition-all duration-500 rounded-full ${barColor} ${
                isTop ? 'shadow-[0_0_8px_rgba(124,92,255,0.4)]' : ''
              }`}
              style={{ width: `${species.pct}%` }}
            />
          </div>
          {typeof species.evidenceCoverage === 'number' && (
            <div className="mt-1.5 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
              <span>ความครอบคลุมของหลักฐาน (Coverage)</span>
              <span>{(species.evidenceCoverage * 100).toFixed(0)}%</span>
            </div>
          )}
        </>
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
          ดูรายละเอียด →
        </span>
      </div>
    </Link>
  )
}

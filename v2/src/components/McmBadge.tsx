export function McmBadge({ count }: { count: number }) {
  if (count <= 0) return null
  return (
    <span
      title={`Bayesian engine matched ${count} MCM-derived test(s)`}
      className="inline-flex items-center gap-1 rounded-md border border-violet-500/40 bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300"
    >
      MCM·{count}
    </span>
  )
}

import type { RankedSpecies } from '@/lib/types'
import { ConfidenceBadge } from './ConfidenceBadge'

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural
}

function evidenceByTest(species: RankedSpecies | undefined) {
  return new Map((species?._evidence || []).map((item) => [item.test, item]))
}

export function ResultExplanation({
  results,
  answeredCount,
}: {
  results: RankedSpecies[]
  answeredCount: number
}) {
  const top = results[0]
  if (!top) return null

  const runnerUp = results.find((r, i) => i > 0 && !r._excluded)
  const excludedCount = results.filter((r) => r._excluded).length
  const gap = top._gap ?? (runnerUp ? top.pct - runnerUp.pct : top.pct)
  const mcmLabel = top._mcm
    ? `${top._usedMcmTests} MCM ${pluralize(top._usedMcmTests, 'test')}`
    : 'library fallback'
  const answerLabel =
    answeredCount === 0
      ? 'No biochemical answers yet; ranking is based on prevalence priors.'
      : `${answeredCount} ${pluralize(answeredCount, 'answer')} considered.`
  const visibleEvidence = top._evidence
    .filter((item) => item.direction !== 'neutral' || item.isKey)
    .sort((a, b) => Math.abs(a.impact) - Math.abs(b.impact))
    .reverse()
    .slice(0, 4)
  const runnerEvidence = evidenceByTest(runnerUp)
  const differentiators = top._evidence
    .map((item) => ({ top: item, runner: runnerEvidence.get(item.test) }))
    .filter(({ runner }) => runner && runner.direction !== 'neutral')
    .sort((a, b) => {
      const aDelta = Math.abs(a.top.impact - (a.runner?.impact || 0))
      const bDelta = Math.abs(b.top.impact - (b.runner?.impact || 0))
      return bDelta - aDelta
    })
    .slice(0, 3)

  return (
    <aside className="lg-surface mb-4 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-100">
            Why this result is leading
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            <span className="font-medium text-zinc-200">{top.name}</span>
            {' '}is ranked first at{' '}
            <span className="font-semibold text-zinc-100">{top.pct}%</span>.
            {' '}{answerLabel}
          </p>
        </div>
        {top._confidence && <ConfidenceBadge level={top._confidence} />}
      </div>

      <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Evidence
          </dt>
          <dd className="mt-1 text-sm font-medium text-zinc-100">{mcmLabel}</dd>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Gap
          </dt>
          <dd className="mt-1 text-sm font-medium text-zinc-100">
            {gap} pp{runnerUp ? ` over ${runnerUp.name}` : ''}
          </dd>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Key tests
          </dt>
          <dd className="mt-1 text-sm font-medium text-zinc-100">
            {top._keyMatch} match / {top._keyMismatch} mismatch
          </dd>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Exclusions
          </dt>
          <dd className="mt-1 text-sm font-medium text-zinc-100">
            {excludedCount} hard-excluded
          </dd>
        </div>
        {top.typicalityIndex !== undefined && (
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Typicality
            </dt>
            <dd className="mt-1 text-sm font-medium text-zinc-100">
              {Math.round(top.typicalityIndex * 100)}%
            </dd>
          </div>
        )}
      </dl>

      {visibleEvidence.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Test-by-test evidence
          </h4>
          <div className="mt-2 grid gap-2 md:grid-cols-2">
            {visibleEvidence.map((item) => (
              <div
                key={`${item.test}-${item.answer}-${item.source}`}
                className="rounded-lg border border-white/5 bg-white/[0.03] p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium text-zinc-100">
                    {item.test} {item.answer}
                  </span>
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      item.direction === 'supportive'
                        ? 'bg-emerald-500/15 text-emerald-300'
                        : item.direction === 'conflicting'
                          ? 'bg-rose-500/15 text-rose-300'
                          : 'bg-zinc-500/15 text-zinc-300'
                    }`}
                  >
                    {item.direction}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {item.source.toUpperCase()} likelihood {(item.likelihood * 100).toFixed(0)}%
                  {typeof item.expectedPct === 'number'
                    ? ` · expected positive ${item.expectedPct}%`
                    : ''}
                  {item.isKey ? ' · key test' : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {runnerUp && differentiators.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Lead over runner-up
          </h4>
          <div className="mt-2 grid gap-2">
            {differentiators.map(({ top: topItem, runner }) => (
              <div
                key={`${topItem.test}-${runnerUp.id}`}
                className="rounded-lg border border-white/5 bg-white/[0.03] p-3"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-zinc-100">
                    {topItem.test} {topItem.answer}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {top.name}: {(topItem.likelihood * 100).toFixed(0)}% · {runnerUp.name}: {((runner?.likelihood || 0) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}

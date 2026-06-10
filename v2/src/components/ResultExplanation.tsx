import type { RankedSpecies } from '@/lib/types'
import { ConfidenceBadge } from './ConfidenceBadge'

const CONFIDENCE_EXPLANATION = {
  high: 'Findings are consistent and separated from the runner-up. Still educational, not definitive.',
  medium: 'Several findings support this candidate, but more confirmation would improve confidence.',
  low: 'The ranking is plausible but based on limited, weak, or mixed evidence.',
  very_low: 'Evidence is insufficient or contradictory. Treat this as an exploratory lead.',
} as const

function evidenceByTest(species: RankedSpecies | undefined) {
  return new Map((species?._evidence || []).map((item) => [item.test, item]))
}

function getSourceLabel(source: string, note?: string) {
  if (source === 'mcm') return 'อ้างอิงจากฐานข้อมูล MCM'
  if (source === 'library' && note === 'Group default') return 'ค่าพื้นฐานของกลุ่ม'
  if (source === 'library') return 'ข้อมูลทั่วไป (Library Fallback)'
  if (source === 'missing') return 'ไม่มีข้อมูลอ้างอิง'
  return source
}

function formatImpact(impact: number) {
  if (Math.abs(impact) < 0.01) return 'neutral'
  return impact > 0 ? `+${impact.toFixed(2)}` : impact.toFixed(2)
}

function EvidenceItem({ item }: { item: RankedSpecies['_evidence'][number] }) {
  return (
    <li className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-sm font-medium text-zinc-100">
          {item.test} = {item.answer}
        </span>
        <span className="shrink-0 rounded-full border border-white/10 bg-zinc-900 px-2 py-0.5 text-[10px] font-semibold text-zinc-300">
          impact {formatImpact(item.impact)}
        </span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-zinc-500">
        {getSourceLabel(item.source, item.note)}
        {typeof item.expectedPct === 'number' ? ` · reference positivity ${item.expectedPct}%` : ''}
        {item.isKey ? ' · key discriminator' : ''}
        {item.source === 'missing' ? ' · not used as ranking evidence' : ''}
      </p>
    </li>
  )
}

export function ResultExplanation({
  results,
  answeredCount,
}: {
  results: RankedSpecies[]
  answeredCount: number
}) {
  const top = results[0]
  if (!top || top._excluded) return null

  const runnerUp = results.find((r, i) => i > 0 && !r._excluded)
  const excludedCount = results.filter((r) => r._excluded).length
  const contradictionCount = top.contradictionCount ?? 0
  const gap = top._gap ?? (runnerUp ? top.pct - runnerUp.pct : top.pct)
  const mcmLabel = top._mcm
    ? `ใช้ ${top._usedMcmTests} MCM tests`
    : 'ไม่มีข้อมูล MCM (Fallback)'
    
  const answerLabel =
    answeredCount === 0
      ? 'ยังไม่มีการกรอกผลทดสอบทางชีวเคมี; การจัดอันดับปัจจุบันมาจากค่าความชุก (Prevalence prior)'
      : `พิจารณาจาก ${answeredCount} การทดสอบ`

  const supportiveEvidence = top._evidence
    .filter((item) => item.direction === 'supportive')
    .sort((a, b) => Math.abs(a.impact) - Math.abs(b.impact))
    .reverse()
    .slice(0, 4)

  const conflictingEvidence = top._evidence
    .filter((item) => item.direction === 'conflicting')
    .sort((a, b) => Math.abs(a.impact) - Math.abs(b.impact))
    .reverse()
    .slice(0, 4)

  const missingEvidence = top._evidence
    .filter((item) => item.source === 'missing')
    .slice(0, 4)

  const neutralKeyEvidence = top._evidence
    .filter((item) => item.direction === 'neutral' && item.isKey && item.source !== 'missing')
    .slice(0, 3)

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
      <div className="mb-4 rounded-lg border border-sky-500/20 bg-sky-500/10 p-3 text-xs leading-relaxed text-sky-100">
        BokBac is an educational probabilistic assistant. It suggests likely matches inside the selected candidate group and should not be used as a definitive clinical identification system.
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-zinc-100">
            Why this is the current most likely match
          </h3>
          <p className="mt-1 text-sm text-zinc-400">
            <span className="font-medium text-zinc-200">{top.name}</span>
            {' '}is the suggested match within the selected candidate group with{' '}
            <span className="font-semibold text-zinc-100">{Math.round(top.posteriorWithinCandidateSet ?? top.pct)}%</span>
            {' '}candidate-set support. {answerLabel}.
          </p>
          {top._confidence && (
            <p className="mt-1 text-xs leading-relaxed text-zinc-500">
              Confidence guide: {CONFIDENCE_EXPLANATION[top._confidence]}
            </p>
          )}
        </div>
        {top._confidence && <ConfidenceBadge level={top._confidence} />}
      </div>

      <dl className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Evidence source
          </dt>
          <dd className="mt-1 text-sm font-medium text-zinc-100">{mcmLabel}</dd>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Runner-up gap
          </dt>
          <dd className="mt-1 text-sm font-medium text-zinc-100">
            {Math.round(gap)}% {runnerUp ? `above ${runnerUp.name}` : ''}
          </dd>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Key tests
          </dt>
          <dd className="mt-1 text-sm font-medium text-zinc-100">
            support {top._keyMatch} / conflict {top._keyMismatch}
          </dd>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Ruled out
          </dt>
          <dd className="mt-1 text-sm font-medium text-zinc-100">
            {excludedCount} candidates
          </dd>
        </div>
        {top.caseFitScore !== undefined && (
          <div className="rounded-lg border border-white/5 bg-white/[0.03] p-3">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Case fit
            </dt>
            <dd className="mt-1 text-sm font-medium text-zinc-100">
              {Math.round(top.caseFitScore * 100)}%
            </dd>
          </div>
        )}
      </dl>

      {(answeredCount === 0 || top.evidenceCoverage < 0.5 || contradictionCount > 0 || conflictingEvidence.length > 0) && (
        <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs leading-relaxed text-amber-100">
          {answeredCount === 0 && 'No biochemical tests have been entered. The current order is prior-driven and should be treated as a starting point.'}
          {answeredCount > 0 && top.evidenceCoverage < 0.5 && 'Many entered results have no reference data for this candidate. More standard biochemical tests are needed before teaching confidence should increase.'}
          {contradictionCount > 0 && ` ${contradictionCount} strong contradiction${contradictionCount === 1 ? '' : 's'} were detected for this candidate.`}
          {conflictingEvidence.length > 0 && ' Review the conflicting evidence before accepting this as a likely match.'}
        </div>
      )}

      {(supportiveEvidence.length > 0 || conflictingEvidence.length > 0 || missingEvidence.length > 0 || neutralKeyEvidence.length > 0) && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Evidence summary
          </h4>
          <div className="mt-2 grid gap-3 lg:grid-cols-2">
            <section>
              <h5 className="mb-2 text-xs font-semibold text-emerald-200">Increased probability</h5>
              {supportiveEvidence.length > 0 ? (
                <ul className="space-y-2">
                  {supportiveEvidence.map((item) => <EvidenceItem key={`${item.test}-${item.answer}-support`} item={item} />)}
                </ul>
              ) : (
                <p className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-xs text-zinc-500">
                  No entered result strongly supports this candidate yet.
                </p>
              )}
            </section>

            <section>
              <h5 className="mb-2 text-xs font-semibold text-rose-200">Decreased probability</h5>
              {conflictingEvidence.length > 0 ? (
                <ul className="space-y-2">
                  {conflictingEvidence.map((item) => <EvidenceItem key={`${item.test}-${item.answer}-conflict`} item={item} />)}
                </ul>
              ) : (
                <p className="rounded-lg border border-white/5 bg-white/[0.03] p-3 text-xs text-zinc-500">
                  No entered result strongly conflicts with this candidate.
                </p>
              )}
            </section>
          </div>

          {(missingEvidence.length > 0 || neutralKeyEvidence.length > 0) && (
            <div className="mt-3 rounded-lg border border-white/5 bg-white/[0.03] p-3 text-xs leading-relaxed text-zinc-400">
              {missingEvidence.length > 0 && (
                <p>
                  Unsupported or missing reference data: {missingEvidence.map((item) => item.test).join(', ')}. These answers lower evidence coverage but do not push the ranking up or down.
                </p>
              )}
              {neutralKeyEvidence.length > 0 && (
                <p className={missingEvidence.length > 0 ? 'mt-1' : ''}>
                  Neutral key evidence: {neutralKeyEvidence.map((item) => `${item.test} = ${item.answer}`).join(', ')}.
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {runnerUp && differentiators.length > 0 && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <h4 className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Why it leads the runner-up
          </h4>
          <div className="mt-2 grid gap-2">
            {differentiators.map(({ top: topItem, runner }) => (
              <div
                key={`${topItem.test}-${runnerUp.id}`}
                className="rounded-lg border border-white/5 bg-white/[0.03] p-3"
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-zinc-100">
                    {topItem.test} = {topItem.answer}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {top.name}: {getSourceLabel(topItem.source)} ({(topItem.likelihood * 100).toFixed(0)}%)
                    {' '}vs{' '}
                    {runnerUp.name}: {runner ? getSourceLabel(runner.source) : 'ไม่มีข้อมูล'} ({(runner?.likelihood || 0) * 100}%)
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

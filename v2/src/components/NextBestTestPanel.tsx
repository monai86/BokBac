import { useState } from 'react'
import { useIdentifyStore } from '@/store/identifyStore'
import { getSuiteTestDisplay } from '@/lib/suiteCatalog'
import { TestInputControl } from './TestInputControl'

export function NextBestTestPanel() {
  const recommendedTests = useIdentifyStore((s) => s.recommendedTests)
  const answers = useIdentifyStore((s) => s.answers)
  const setAnswer = useIdentifyStore((s) => s.setAnswer)

  const group = useIdentifyStore((s) => s.group)
  const activeSuiteId = useIdentifyStore((s) => s.activeSuiteId)
  const defaultSuites = useIdentifyStore((s) => s.defaultSuites)
  const customSuites = useIdentifyStore((s) => s.customSuites)

  const [showOutsideSuite, setShowOutsideSuite] = useState(false)

  if (recommendedTests.length === 0) return null

  const allSuites = [...defaultSuites, ...customSuites]
  const activeSuite = allSuites.find((s) => s.id === activeSuiteId) || allSuites.find((s) => s.group === group)
  const suiteTestIds = new Set(activeSuite?.tests.map((t) => t.testId) || [])

  const filteredRecommendations = showOutsideSuite
    ? recommendedTests
    : recommendedTests.filter((rec) => suiteTestIds.has(rec.testId))

  // Show top 3 recommended tests
  const topRecommendations = filteredRecommendations.slice(0, 3)

  return (
    <div className="lg-surface border-violet-500/20 bg-violet-950/5 p-5">
      <div>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">
              Tests still needed to reduce uncertainty
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Recommendations are ranked by expected information gain, then adjusted for the active teaching suite, time, and cost.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer hover:text-zinc-200 transition">
              <input
                type="checkbox"
                checked={showOutsideSuite}
                onChange={(e) => setShowOutsideSuite(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-violet-500 focus:ring-violet-500 focus:ring-offset-black"
              />
              <span>Include exploratory tests outside this suite</span>
            </label>
            <span className="text-[10px] uppercase font-bold tracking-widest text-violet-300 bg-violet-500/15 px-2 py-0.5 rounded-full border border-violet-500/20">
              Learning prompt
            </span>
          </div>
        </div>

        {topRecommendations.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-black/20 text-xs text-zinc-500">
            No additional in-suite recommendations are available. {!showOutsideSuite && 'Enable exploratory tests to inspect options outside this suite.'}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {topRecommendations.map((rec) => {
              const current = answers[rec.testId] || ''
              const suiteItem = activeSuite?.tests.find((item) => item.testId === rec.testId)
              const display = suiteItem ? getSuiteTestDisplay(suiteItem) : { label: rec.testLabel, options: undefined }

              return (
                <div
                  key={rec.testId}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-white/5 bg-black/30 p-3.5 transition-all duration-300 hover:border-violet-500/20 hover:bg-black/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-zinc-200 truncate" title={rec.testLabel}>
                        {display.label}
                      </span>
                      <span className="shrink-0 text-[10px] font-bold text-violet-200 bg-violet-500/10 px-1.5 py-0.5 rounded">
                        uncertainty -{rec.entropyReduction}%
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] leading-relaxed text-zinc-500">
                      {rec.reason}. Practical score {rec.practicalScore}.
                    </p>
                  </div>

                  <TestInputControl
                    testId={rec.testId}
                    label={display.label}
                    options={display.options}
                    value={current}
                    layout="fill"
                    ariaPrefix="Set recommended"
                    onChange={(nextValue) => setAnswer(rec.testId, nextValue)}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

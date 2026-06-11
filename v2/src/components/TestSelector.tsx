import { useIdentifyStore } from '@/store/identifyStore'
import { getActiveSuite, getSuiteTestDisplay } from '@/lib/suiteCatalog'
import { TestInputControl } from './TestInputControl'

export function TestSelector() {
  const group = useIdentifyStore((s) => s.group)
  const answers = useIdentifyStore((s) => s.answers)
  const setAnswer = useIdentifyStore((s) => s.setAnswer)
  const recommendedTests = useIdentifyStore((s) => s.recommendedTests)
  const defaultSuites = useIdentifyStore((s) => s.defaultSuites)
  const customSuites = useIdentifyStore((s) => s.customSuites)
  const activeSuiteId = useIdentifyStore((s) => s.activeSuiteId)

  const suite = getActiveSuite(defaultSuites, customSuites, activeSuiteId, group)
  if (!suite) {
    return (
      <div className="lg-surface p-6 text-center text-zinc-400">
        ไม่พบ suite สำหรับ group <code className="text-violet-300">{group}</code>
      </div>
    )
  }

  const topRecs = recommendedTests.slice(0, 3)

  return (
    <div className="lg-surface p-5">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-200">
          การทดสอบ — <span className="text-violet-300">{suite.name}</span>
        </h2>
        <span className="text-xs text-zinc-500">
          {Object.keys(answers).length}/{suite.tests.length} ตอบแล้ว
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {[...suite.tests].sort((a, b) => a.order - b.order).map((t) => {
          const display = getSuiteTestDisplay(t)
          const current = answers[t.testId] || ''
          const isRecommended = topRecs.some((r) => r.testId === t.testId)

          return (
            <div
              key={t.testId}
              className={`wf-test-card flex items-center justify-between gap-2 ${
                current ? 'answered' : ''
              } ${
                isRecommended
                  ? 'border-violet-500/30 bg-violet-950/10 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                  : ''
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-sm text-zinc-200 truncate">{display.label}</span>
                {isRecommended && (
                  <span className="shrink-0 text-[9px] font-bold text-violet-300 bg-violet-500/25 px-1 py-0.5 rounded border border-violet-500/20 animate-pulse">
                    แนะนำ
                  </span>
                )}
              </div>
              <TestInputControl
                testId={t.testId}
                label={display.label}
                options={display.options}
                value={current}
                onChange={(nextValue) => setAnswer(t.testId, nextValue)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

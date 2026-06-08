import { useState } from 'react'
import { useIdentifyStore } from '@/store/identifyStore'

const COMMON_VALUES = [
  { value: '+', label: '+' },
  { value: '−', label: '−' },
  { value: 'V', label: 'V' },
]

const HEMOLYSIS_VALUES = [
  { value: 'β', label: 'β' },
  { value: 'α', label: 'α' },
  { value: 'γ', label: 'γ' },
]

const SR_VALUES = [
  { value: 's', label: 'S' },
  { value: 'r', label: 'R' },
]

function valuesForTest(testId: string, label: string) {
  const lower = (testId + ' ' + label).toLowerCase()
  if (lower.includes('hemolysis')) return [...HEMOLYSIS_VALUES, ...COMMON_VALUES]
  if (lower.includes('bacitracin') || lower.includes('optochin') || lower.includes('novobiocin'))
    return SR_VALUES
  return COMMON_VALUES
}

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
    <div className="lg-surface border-violet-500/20 bg-gradient-to-r from-violet-950/10 via-zinc-950/20 to-indigo-950/10 p-5 relative overflow-hidden group">
      {/* Decorative background glow */}
      <div className="absolute -right-20 -top-20 w-48 h-48 rounded-full bg-violet-600/10 blur-3xl pointer-events-none transition-all duration-700 group-hover:bg-violet-600/15" />
      <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-indigo-600/5 blur-3xl pointer-events-none" />

      <div className="relative z-10">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-violet-400 animate-pulse" />
            <h3 className="text-sm font-semibold text-zinc-100">
              การทดสอบแนะนำถัดไป (แนะนำเพื่อแยกเชื้อได้เร็วที่สุด)
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-[11px] text-zinc-400 cursor-pointer hover:text-zinc-200 transition">
              <input
                type="checkbox"
                checked={showOutsideSuite}
                onChange={(e) => setShowOutsideSuite(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-900 text-violet-500 focus:ring-violet-500 focus:ring-offset-black"
              />
              <span>แนะนำนอก Suite (Advanced)</span>
            </label>
            <span className="text-[10px] uppercase font-bold tracking-widest text-violet-400 bg-violet-500/15 px-2 py-0.5 rounded-full border border-violet-500/20">
              Active Suggestion
            </span>
          </div>
        </div>

        <p className="mb-4 text-xs text-zinc-400 leading-relaxed">
          เลือกทำและตอบผลการทดสอบด้านล่างนี้ ซึ่งเป็นกลุ่มการทดสอบที่ให้ค่า **Information Gain (การลดความไม่แน่นอน)** สูงที่สุด ณ สเตทนี้
        </p>

        {topRecommendations.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-white/10 rounded-xl bg-black/20 text-xs text-zinc-500">
            ไม่มีการแนะนำเพิ่มเติมใน Test Suite นี้แล้ว {!showOutsideSuite && " (ลองเลือกแนะนำนอก Suite เพื่อค้นหาเพิ่มเติม)"}
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-3">
            {topRecommendations.map((rec) => {
              const current = answers[rec.testLabel] || answers[rec.testId] || ''
              const opts = valuesForTest(rec.testId, rec.testLabel)

              return (
                <div
                  key={rec.testId}
                  className="flex flex-col justify-between gap-3 rounded-xl border border-white/5 bg-black/30 p-3.5 transition-all duration-300 hover:border-violet-500/20 hover:bg-black/40"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-zinc-200 truncate" title={rec.testLabel}>
                        {rec.testLabel}
                      </span>
                      <span className="shrink-0 text-[10px] font-bold text-violet-300 bg-violet-500/10 px-1.5 py-0.5 rounded">
                        -{rec.entropyReduction}%
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-500">
                      ลดความไม่แน่นอนลงได้ {rec.entropyReduction}%
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1">
                    {opts.map((o) => (
                      <button
                        type="button"
                        key={o.value}
                        aria-label={`Set recommended ${rec.testLabel} to ${o.label}`}
                        aria-pressed={current === o.value}
                        onClick={() =>
                          setAnswer(rec.testLabel, current === o.value ? null : o.value)
                        }
                        className={`flex-1 rounded-lg border py-1.5 text-xs font-semibold transition ${
                          current === o.value
                            ? 'border-violet-400 bg-violet-500/30 text-violet-100 shadow-[0_0_8px_rgba(139,92,246,0.2)]'
                            : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

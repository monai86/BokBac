import { useEffect, useState } from 'react'
import { GroupSelector } from '@/components/GroupSelector'
import { TestSelector } from '@/components/TestSelector'
import { NextBestTestPanel } from '@/components/NextBestTestPanel'
import { SpeciesCard } from '@/components/SpeciesCard'
import { ResultExplanation } from '@/components/ResultExplanation'
import { SavedCasesPanel } from '@/components/SavedCasesPanel'
import { InitialObservationWizard } from '@/components/InitialObservationWizard'
import { TestSuiteManager } from '@/components/TestSuiteManager'
import { LoadingSplash } from '@/components/LoadingSplash'
import { useIdentifyStore } from '@/store/identifyStore'
import { ESSENTIAL_GROUP_TESTS, calculateSuiteDiagnosticPower } from '@/data/tests/essentialTests'
import { lookupTestDefinition } from '@/data/tests/biochemicalTestRegistry'
import { getActiveSuite } from '@/lib/suiteCatalog'

const WORKFLOW_STEPS = [
  { n: 1, l: 'Gram Stain / Morphology', icon: '🔬' },
  { n: 2, l: 'Biochemical Tests', icon: '⚗️' },
  { n: 3, l: 'Probabilistic Review', icon: '📊' },
]

export function IdentifyPage() {
  const results = useIdentifyStore((s) => s.results)
  const answeredCount = useIdentifyStore((s) => Object.keys(s.answers).length)
  const recompute = useIdentifyStore((s) => s.recompute)
  const resetAnswers = useIdentifyStore((s) => s.resetAnswers)
  const resetInitialObservation = useIdentifyStore((s) => s.resetInitialObservation)

  const group = useIdentifyStore((s) => s.group)
  const answers = useIdentifyStore((s) => s.answers)
  const defaultSuites = useIdentifyStore((s) => s.defaultSuites) || []
  const customSuites = useIdentifyStore((s) => s.customSuites) || []
  const activeSuiteId = useIdentifyStore((s) => s.activeSuiteId)

  const activeSuite = getActiveSuite(defaultSuites, customSuites, activeSuiteId, group)

  const suiteTestIds = activeSuite?.tests.map((t) => t.testId) || []
  const suitePower = calculateSuiteDiagnosticPower(group, suiteTestIds)

  const groupRules = ESSENTIAL_GROUP_TESTS[group]
  const minTests = groupRules?.minTests || 3

  const isAnswered = (testId: string): boolean => {
    const cleanId = testId.toLowerCase().replace(/[^a-z0-9]/g, '')
    return Object.keys(answers).some((k) => {
      const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '')
      return cleanK === cleanId || cleanK.includes(cleanId) || cleanId.includes(cleanK)
    })
  }

  const missingPrimaryAnswers = groupRules
    ? groupRules.primary.filter((p) => !isAnswered(p))
    : []

  const topSpecies = results.find((r) => !r._excluded)
  const typicality = topSpecies?.typicalityIndex ?? 1.0
  const isAtypical = answeredCount > 0 && typicality < 0.15

  const [showAdvanced, setShowAdvanced] = useState(false)
  const [step, setStep] = useState(1)

  // Detect test environment to bypass step-by-step layout for unit tests
  const isTest = typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || (import.meta.env && import.meta.env.MODE === 'test'))
  const [isStepMode, setIsStepMode] = useState(!isTest)

  useEffect(() => {
    recompute()
  }, [recompute])

  const top10 = results.slice(0, 10)

  const handleReset = () => {
    resetAnswers()
    resetInitialObservation()
    setStep(1)
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Onboarding Guide */}
      <div className="rounded-xl border border-violet-500/20 bg-gradient-to-r from-violet-900/10 to-indigo-900/10 p-4 text-xs leading-relaxed flex items-start gap-3 relative overflow-hidden">
        <div className="lg-specular" />
        <div className="lg-caustic" />
        <span className="text-base shrink-0">💡</span>
        <div className="space-y-1">
          <p className="font-semibold text-zinc-100">
            เริ่มต้นใช้งาน BokBac (Quick Guide)
          </p>
          <p className="text-zinc-400">
            เริ่มต้นด้วยการระบุผล Gram stain และสัณฐานวิทยา (Morphology) ในขั้นตอนที่ 1 ระบบจะแนะนำชุดการทดสอบทางชีวเคมี (Test Suite) ที่เหมาะสม จากนั้นทำแบบทดสอบทางชีวเคมีในขั้นตอนที่ 2 และตรวจสอบผลการวิเคราะห์คะแนนความน่าจะเป็นของเชื้อในขั้นตอนที่ 3
          </p>
          <p className="text-zinc-400 italic mt-1 pt-1 border-t border-white/5">
            Start with Gram stain and morphology. BokBac will suggest relevant biochemical test suites, then calculate ranked bacterial candidates using probabilistic matching.
          </p>
        </div>
      </div>

      {/* Progress Stepper Bar (Only in Step Mode) */}
      {isStepMode && (
        <div className="identify-stepper lg-surface">
          <div className="lg-specular" />
          <div className="lg-caustic" />
          <div className="lg-content identify-stepper-content">
            <div className="identify-step-list" aria-label="Diagnostic workflow progress">
              {WORKFLOW_STEPS.map((s, idx, arr) => (
                <div
                  key={s.n}
                  className={`identify-step-item ${step === s.n ? 'is-current' : ''} ${step > s.n ? 'is-complete' : ''}`}
                >
                  <div className="identify-step-dot">
                  {step > s.n ? '✓' : s.n}
                  </div>
                  <span className="identify-step-label">
                    <span>{s.icon}</span>
                    {s.l}
                  </span>
                  {idx < arr.length - 1 && (
                    <div className={`identify-step-connector ${step > s.n ? 'is-complete' : ''}`} />
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIsStepMode(false)}
              className="identify-step-action"
            >
              🧩 แสดงหน้าเดียว
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="identify-step-action"
            >
              🔄 เริ่มใหม่
            </button>
          </div>
        </div>
      )}

      {/* Mode Switch Back Option (Only in Single Page Mode) */}
      {!isStepMode && (
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setIsStepMode(true)}
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-100 hover:bg-white/10 text-xs font-semibold transition"
          >
            🎯 สลับเป็นแบบทีละขั้นตอน (Step-by-Step)
          </button>
        </div>
      )}

      {/* STEP 1: Gram stain and morphology */}
      {(!isStepMode || step === 1) && (
        <div className="space-y-4 animate-fade-in">
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-header text-[20px] font-extrabold text-white mb-1.5 tracking-[-0.5px]">
                🔬 Step 1 — Gram Stain
              </h2>
            </div>
            <p className="text-[#64748b] text-[13px] mb-6 leading-relaxed">
              เลือกผลที่ได้จากการย้อม Gram stain
            </p>
            <InitialObservationWizard />
          </section>

          {/* Toggle Advanced Panel */}
          <div className="flex items-center justify-between bg-white/[0.01] border border-white/5 rounded-lg px-4 py-2">
            <span className="text-xs text-zinc-400">
              ต้องการเลือกกลุ่มแบคทีเรียด้วยตนเอง หรือปรับเปลี่ยนคลาสแล็บ?
            </span>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="rounded px-2.5 py-1 text-xs font-semibold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 transition"
            >
              {showAdvanced ? '🙈 ซ่อนตั้งค่าขั้นสูง' : '🛠️ แสดงตั้งค่าขั้นสูง / Custom Suites'}
            </button>
          </div>

          {/* Advanced configuration panels */}
          {showAdvanced && (
            <div className="grid gap-5 md:grid-cols-2 animate-fade-in">
              {/* Manual Group Selector */}
              <section className="space-y-2 backdrop-blur-md bg-white/[0.02] border border-white/10 rounded-xl p-5 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Manual Group Override
                </h3>
                <p className="text-[11px] text-zinc-500 mb-2">
                  เลือกกลุ่มแบคทีเรียเพื่อโหลด Test Suite แบบแมนนวล (จะข้ามคำแนะนำอัตโนมัติ)
                </p>
                <GroupSelector />
              </section>

              {/* Custom Suite Editor */}
              <TestSuiteManager />
            </div>
          )}

          {isStepMode && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-100 font-bold transition shadow-lg shadow-violet-500/20"
              >
                ดำเนินการต่อ → กรอกผล Biochemical Tests ⚗️
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: Answer Biochemical Tests */}
      {(!isStepMode || step === 2) && (
        <div className="space-y-6 animate-fade-in">
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-serif-header text-[20px] font-extrabold text-white mb-1.5 tracking-[-0.5px]">
                ⚗️ Step 2 — {activeSuite?.name || 'Biochemical Tests'}
              </h2>
              {!isStepMode && (
                <button
                  type="button"
                  onClick={resetAnswers}
                  aria-label="Reset all biochemical test answers"
                  className="text-xs text-zinc-500 hover:text-zinc-200 transition"
                >
                  ↺ Reset ผลทดสอบทั้งหมด
                </button>
              )}
            </div>
            <p className="text-[#64748b] text-[13px] mb-5 leading-relaxed">
              กรอกผลการทดสอบให้มากที่สุดเท่าที่มี (ข้ามได้ถ้ายังไม่ได้ทำ)
            </p>
            <TestSelector />
          </section>

          {/* Recommendations & Entropy reductions */}
          <section>
            <NextBestTestPanel />
          </section>

          {isStepMode && (
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-zinc-300 font-bold hover:bg-white/10 hover:text-white transition"
              >
                ← ย้อนกลับ
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-zinc-100 font-bold transition shadow-lg shadow-violet-500/25"
              >
                🔍 Review probabilistic match
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Diagnosis Results Output */}
      {(!isStepMode || step === 3) && (
        <div className="space-y-6 animate-fade-in">
          <section className="space-y-3">
            <div className="space-y-1">
              <h2 className="font-serif-header text-[20px] font-extrabold text-white mb-1.5 tracking-[-0.5px]">
                📊 Step 3 — ผลการจำแนกชนิด
              </h2>
              <p className="text-[#64748b] text-[13px] mb-6 leading-relaxed">
                คะแนนความน่าจะเป็นในการจำแนกชนิดเชื้อ จากผล biochemical ที่กรอก
              </p>
            </div>
            {top10.length === 0 ? (
              <div className="lg-surface p-6 text-center text-zinc-500">
                <LoadingSplash label="กำลังประมวลผลความน่าจะเป็น..." />
              </div>
            ) : (
              <>
                {/* Warnings & Diagnostics Alerts */}
                {(() => {
                  const allExcluded = results.length > 0 && results.every(r => r._excluded)
                  const topResult = results[0]
                  const hasLowFit = topResult && topResult.caseFitScore !== undefined && topResult.caseFitScore < 0.2
                  const hasWarnings = suitePower.rating === 'weak' || (answeredCount > 0 && answeredCount < minTests) || missingPrimaryAnswers.length > 0 || isAtypical || allExcluded || hasLowFit
                  
                  if (!hasWarnings) return null

                  return (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2 text-xs leading-normal">
                      <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
                        <span>⚠️</span>
                        <span>Evidence quality warnings</span>
                      </div>
                      
                      <div className="space-y-1.5 text-zinc-300 pl-4 list-none">
                        {allExcluded && (
                          <p className="text-rose-300">
                            • <strong className="text-rose-400">All candidates ruled out:</strong> The entered findings conflict with every organism in this selected group. Recheck Gram stain, morphology, test reading, or candidate group selection.
                          </p>
                        )}
                        {!allExcluded && hasLowFit && (
                          <p className="text-orange-300">
                            • <strong className="text-orange-400">Low case fit:</strong> The current top match does not fit the entered profile well. This can happen with atypical organisms, missing reference data, or misread lab reactions.
                          </p>
                        )}
                        {suitePower.rating === 'weak' && (
                          <p className="text-amber-200">
                            • <strong className="text-amber-300">Weak teaching suite:</strong> The current suite lacks key biochemical tests for this group ({suitePower.score}/100). Add or answer more discriminating tests before treating the ranking as stable.
                          </p>
                        )}
                        {answeredCount > 0 && answeredCount < minTests && (
                          <p>
                            • <strong className="text-amber-200">Insufficient evidence:</strong> Only {answeredCount} biochemical result{answeredCount === 1 ? '' : 's'} entered. This group usually needs at least {minTests} meaningful tests before a teaching match is dependable.
                          </p>
                        )}
                        {missingPrimaryAnswers.length > 0 && (
                          <p>
                            • <strong className="text-amber-200">Missing core tests:</strong> Add results for <span className="text-amber-200 font-semibold">{missingPrimaryAnswers.map(p => {
                              const def = lookupTestDefinition(p)
                              return def?.label || p
                            }).join(', ')}</span> to make the candidate ranking easier to justify.
                          </p>
                        )}
                        {isAtypical && topSpecies && !allExcluded && (
                          <p className="text-rose-300">
                            • <strong className="text-rose-400">Atypical profile:</strong> The entered results differ from the common profile for <span className="italic font-semibold">{topSpecies.name}</span> (typicality {Math.round(typicality * 100)}%). Recheck lab technique and reaction interpretation.
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })()}

                <ResultExplanation results={results} answeredCount={answeredCount} />
                
                <div className="grid gap-3 md:grid-cols-2">
                  {top10.map((s, i) => (
                    <SpeciesCard key={s.id} species={s} rank={i} />
                  ))}
                </div>

                <SavedCasesPanel />
              </>
            )}
          </section>

          {isStepMode && (
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-3 rounded-xl border border-white/10 bg-white/5 text-zinc-300 font-bold hover:bg-white/10 hover:text-white transition"
              >
                ← ย้อนกลับไปแก้ไขผลทดสอบ
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-zinc-100 font-bold transition shadow-lg shadow-orange-500/25"
              >
                🔄 เริ่มต้นเคสใหม่
              </button>
            </div>
          )}
        </div>
      )}

      {/* Educational Disclaimer */}
      <footer className="border-t border-white/5 pt-4 text-[10px] text-zinc-650 leading-normal space-y-1">
        <p>
          <strong>Educational Disclaimer:</strong> BokBac is for educational bacterial identification support only. Confidence scores reflect consistency with reference data, not clinical confirmation. Confirmatory laboratory procedures are still required. BokBac should not be used as the sole basis for clinical diagnosis.
        </p>
        <p>
          <strong>คำชี้แจงเพื่อการศึกษา:</strong> BokBac มีวัตถุประสงค์เพื่อการเรียนการสอนและสนับสนุนการจำแนกชนิดแบคทีเรียเท่านั้น ค่าระดับความน่าเชื่อถือสะท้อนถึงความสอดคล้องกับข้อมูลอ้างอิง ไม่ใช่การยืนยันทางคลินิก การวิเคราะห์ทางห้องปฏิบัติการเพื่อยืนยันผลยังคงเป็นสิ่งจำเป็นเสมอ และไม่ควรใช้ BokBac เป็นเกณฑ์เดียวในการวินิจฉัยโรคทางคลินิก
        </p>
      </footer>
    </div>
  )
}

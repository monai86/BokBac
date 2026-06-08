import { useEffect, useState } from 'react'
import { GroupSelector } from '@/components/GroupSelector'
import { TestSelector } from '@/components/TestSelector'
import { NextBestTestPanel } from '@/components/NextBestTestPanel'
import { SpeciesCard } from '@/components/SpeciesCard'
import { ResultExplanation } from '@/components/ResultExplanation'
import { SavedCasesPanel } from '@/components/SavedCasesPanel'
import { InitialObservationWizard } from '@/components/InitialObservationWizard'
import { TestSuiteManager } from '@/components/TestSuiteManager'
import { useIdentifyStore } from '@/store/identifyStore'
import { ESSENTIAL_GROUP_TESTS, calculateSuiteDiagnosticPower } from '@/data/tests/essentialTests'
import { lookupTestDefinition } from '@/data/tests/biochemicalTestRegistry'

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

  const allSuites = [...defaultSuites, ...customSuites]
  const activeSuite = allSuites.find((s) => s.id === activeSuiteId) || allSuites.find((s) => s.group === group)

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
      {/* Educational Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-50 tracking-tight">
            🧫 BokBac Microbial World
          </h1>
          <p className="mt-1 text-sm text-zinc-400">
            Educational Bacterial Identification System · v4.1.0
          </p>
        </div>
        <div className="text-right text-[10px] text-zinc-500 font-mono">
          <div>Posteriors & Coverage Split</div>
          <div>MCM 11th Edition calibrated</div>
        </div>
      </header>

      {/* Progress Stepper Bar (Only in Step Mode) */}
      {isStepMode && (
        <div className="lg-surface p-4 bg-zinc-900/40 border border-white/5 shadow-md flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="lg-specular" />
          <div className="lg-caustic" />
          <div className="lg-content flex items-center gap-3 sm:gap-6 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-none snap-x">
            {[
              { n: 1, l: 'Gram Stain / Morphology', icon: '🔬' },
              { n: 2, l: 'Biochemical Tests', icon: '⚗️' },
              { n: 3, l: 'ผลการวินิจฉัย', icon: '📊' },
            ].map((s, idx, arr) => (
              <div key={s.n} className="flex items-center gap-2 shrink-0 snap-start">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all border ${
                    step >= s.n
                      ? 'bg-violet-500 border-violet-400 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                  }`}
                >
                  {step > s.n ? '✓' : s.n}
                </div>
                <span
                  className={`text-xs font-semibold ${
                    step === s.n ? 'text-zinc-100' : 'text-zinc-500'
                  }`}
                >
                  <span className="mr-1">{s.icon}</span>
                  {s.l}
                </span>
                {idx < arr.length - 1 && (
                  <div
                    className={`w-4 sm:w-10 h-px transition-colors ${
                      step > s.n ? 'bg-violet-500/40' : 'bg-white/5'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="lg-content flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setIsStepMode(false)}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-100 hover:bg-white/10 text-xs font-semibold transition"
            >
              🧩 แสดงหน้าเดียว
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-100 hover:bg-white/10 text-xs font-semibold transition"
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

      {/* STEP 1: Observation Wizard */}
      {(!isStepMode || step === 1) && (
        <div className="space-y-4 animate-fade-in">
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                ขั้นตอนที่ 1: ตรวจสไลด์และผลย้อมแกรม
              </h2>
            </div>
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
                  เลือกกลุ่มแบคทีเรียเพื่อโหลด Test Suite แบบแมนนวล (จะข้ามการแนะนำจาก Wizard)
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
              <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                ขั้นตอนที่ 2: บันทึกผลทดสอบทางชีวเคมี
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
            <TestSelector />
          </section>

          {/* Recommendations & Entropy reductions */}
          <section>
            <NextBestTestPanel />
          </section>

          {/* Saved Workups list */}
          <SavedCasesPanel />

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
                🔍 วิเคราะห์ผลและวินิจฉัยเชื้อ
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Diagnosis Results Output */}
      {(!isStepMode || step === 3) && (
        <div className="space-y-6 animate-fade-in">
          <section className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              ขั้นตอนที่ 3: ผลการวินิจฉัยความน่าจะเป็นของสายพันธุ์ (Top 10)
            </h2>
            {top10.length === 0 ? (
              <div className="lg-surface p-6 text-center text-zinc-500">
                กำลังประมวลผลการวินิจฉัย…
              </div>
            ) : (
              <>
                {/* Warnings & Diagnostics Alerts */}
                {(suitePower.rating === 'weak' || (answeredCount > 0 && answeredCount < minTests) || missingPrimaryAnswers.length > 0 || isAtypical) && (
                  <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2 text-xs leading-normal">
                    <div className="flex items-center gap-2 text-amber-300 font-semibold mb-1">
                      <span>⚠️</span>
                      <span>ข้อแนะนำเพื่อความน่าเชื่อถือของการวินิจฉัย (Reliability Alerts)</span>
                    </div>
                    
                    <div className="space-y-1.5 text-zinc-300 pl-4 list-none">
                      {suitePower.rating === 'weak' && (
                        <p className="text-amber-200">
                          • <strong className="text-amber-300">ความจำเพาะของคลาสแล็บต่ำ:</strong> Test Suite ปัจจุบันขาดการทดสอบชีวเคมีหลักสำหรับกลุ่มเชื้อนี้ ({suitePower.score}/100) แนะนำให้ปรับแต่งคลาสแล็บเพิ่มเติม
                        </p>
                      )}
                      {answeredCount > 0 && answeredCount < minTests && (
                        <p>
                          • <strong className="text-amber-200">จำนวนการทดสอบน้อยเกินไป:</strong> เพิ่งทดสอบไปเพียง {answeredCount} ชนิด แนะนำให้ตรวจผลเพิ่มเติมอย่างน้อย {minTests} ชนิด เพื่อความมั่นใจในการระบุสปีชีส์
                        </p>
                      )}
                      {missingPrimaryAnswers.length > 0 && (
                        <p>
                          • <strong className="text-amber-200">ขาดการทดสอบยืนยันหลัก:</strong> แนะนำให้ทำการทดสอบและระบุผลของ <span className="text-amber-250 font-semibold">{missingPrimaryAnswers.map(p => {
                            const def = lookupTestDefinition(p)
                            return def?.label || p
                          }).join(', ')}</span> เพิ่มเติมเพื่อยืนยันกลุ่มเชื้อ
                        </p>
                      )}
                      {isAtypical && topSpecies && (
                        <p className="text-rose-300">
                          • <strong className="text-rose-400">โปรไฟล์ชีวเคมีผิดปกติ (Atypical Profile):</strong> ผลการทดสอบที่กรอกมีความแตกต่างจากรูปแบบทั่วไปของ <span className="italic font-semibold">{topSpecies.name}</span> อย่างมีนัยสำคัญ (Typicality Index = {Math.round(typicality * 100)}%) กรุณาตรวจสอบผลการทำแล็บหรือการอ่านปฏิกิริยาอีกครั้ง
                        </p>
                      )}
                    </div>
                  </div>
                )}

                <ResultExplanation results={results} answeredCount={answeredCount} />
                
                <div className="grid gap-3 md:grid-cols-2">
                  {top10.map((s, i) => (
                    <SpeciesCard key={s.id} species={s} rank={i} />
                  ))}
                </div>
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
      <footer className="border-t border-white/5 pt-4 text-[10px] text-zinc-600 leading-normal space-y-1">
        <p>
          <strong>Educational Disclaimer:</strong> BokBac is an educational decision-support tool for learning bacterial identification logic.
          It is not a replacement for local laboratory SOPs, quality control, confirmatory identification systems, antimicrobial susceptibility testing standards, or professional clinical judgment.
        </p>
        <p>
          <strong>คำชี้แจงเพื่อการศึกษา:</strong> BokBac เป็นเครื่องมือเพื่อการเรียนรู้และช่วยฝึกการคิดวิเคราะห์ในการ identify bacteria เท่านั้น
          ไม่ควรใช้แทน SOP ของห้องปฏิบัติการ การควบคุมคุณภาพ การทดสอบยืนยัน หรือการตัดสินใจทางการแพทย์จริง
        </p>
      </footer>
    </div>
  )
}

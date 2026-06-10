import { useIdentifyStore } from '@/store/identifyStore'
import { suggestOrganismGroups } from '@/lib/gramStain/groupSuggestion'
import type { InitialObservation, SpecimenType } from '@/lib/types'

type GramReaction = InitialObservation['gramReaction']
type Morphology = InitialObservation['morphology']
type Arrangement = NonNullable<InitialObservation['arrangement']>

const SPECIMENS: Array<{ value: SpecimenType; label: string; emoji: string }> = [
  { value: 'unknown', label: 'ไม่ระบุ', emoji: '❓' },
  { value: 'blood', label: 'เลือด (Blood)', emoji: '🩸' },
  { value: 'csf', label: 'น้ำไขสันหลัง (CSF)', emoji: '🧠' },
  { value: 'respiratory', label: 'เสมหะ/ปอด (Sputum/Resp)', emoji: '🫁' },
  { value: 'stool', label: 'อุจจาระ (Stool)', emoji: '💩' },
  { value: 'urine', label: 'ปัสสาวะ (Urine)', emoji: '💧' },
  { value: 'wound', label: 'บาดแผล (Wound)', emoji: '🩹' },
  { value: 'genital', label: 'อวัยวะเพศ (Genital)', emoji: '🔬' },
  { value: 'throat', label: 'คอหอย (Throat)', emoji: '👅' },
  { value: 'ear', label: 'หู (Ear)', emoji: '👂' },
]

const GRAM_REACTIONS: Array<{ value: GramReaction; label: string; color: string }> = [
  { value: 'positive', label: 'Gram Positive (+)', color: 'border-violet-400 bg-violet-500/10 text-violet-200' },
  { value: 'negative', label: 'Gram Negative (−)', color: 'border-rose-400 bg-rose-500/10 text-rose-200' },
  { value: 'variable', label: 'Gram Variable', color: 'border-amber-400 bg-amber-500/10 text-amber-200' },
  { value: 'unknown', label: 'Unknown / ไม่ระบุ', color: 'border-zinc-500 bg-zinc-500/10 text-zinc-300' },
]

const MORPHOLOGY_OPTIONS: Array<{ value: Morphology; label: string; emoji: string }> = [
  { value: 'cocci', label: 'Cocci (กลม)', emoji: '🟣' },
  { value: 'bacilli', label: 'Bacilli (แท่ง)', emoji: '➖' },
  { value: 'coccobacilli', label: 'Coccobacilli (กลมปนแท่ง)', emoji: '🫘' },
  { value: 'curved_rod', label: 'Curved rod (แท่งโค้ง)', emoji: '🪝' },
  { value: 'branching_filament', label: 'Branching filament (สายแตกแขนง)', emoji: '🌿' },
  { value: 'unknown', label: 'Unknown / ไม่ระบุ', emoji: '❓' },
]

const ARRANGEMENT_OPTIONS: Array<{ value: Arrangement; label: string }> = [
  { value: 'unknown', label: 'ไม่ระบุ' },
  { value: 'single', label: 'Single (เดี่ยว)' },
  { value: 'pairs', label: 'Pairs (คู่)' },
  { value: 'diplococci', label: 'Diplococci (คู่เมล็ดกาแฟ)' },
  { value: 'chain', label: 'Chain (สาย)' },
  { value: 'cluster', label: 'Cluster (กลุ่มพวงองุ่น)' },
  { value: 'palisade', label: 'Palisade (รั้วบ้าน/อักษรจีน)' },
]

export function InitialObservationWizard() {
  const initialObservation = useIdentifyStore((s) => s.initialObservation) || {
    gramReaction: 'unknown',
    morphology: 'unknown',
    arrangement: 'unknown',
  }
  const setInitialObservation = useIdentifyStore((s) => s.setInitialObservation)
  const resetInitialObservation = useIdentifyStore((s) => s.resetInitialObservation)
  const currentGroup = useIdentifyStore((s) => s.group)
  const setGroup = useIdentifyStore((s) => s.setGroup)
  const suiteSelectionReason = useIdentifyStore((s) => s.suiteSelectionReason)

  const suggestions = suggestOrganismGroups(initialObservation)

  const updateObs = (fields: Partial<typeof initialObservation>) => {
    setInitialObservation(fields)
  }

  return (
    <div className="lg-surface p-5 shadow-xl transition-all">
      <div className="lg-specular" />
      <div className="lg-caustic" />
      <div className="lg-content">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
              <span>🔬</span> ตัวช่วยวิเคราะห์ผลย้อมสไลด์ (Gram Stain & Morphology Wizard)
            </h2>
            <p className="text-xs text-zinc-400">
              ระบุลักษณะเบื้องต้นเพื่อค้นหากลุ่มแบคทีเรียที่สอดคล้อง สิ่งส่งตรวจช่วยจัดลำดับคำแนะนำเท่านั้น ไม่เพิ่มความมั่นใจของผลจำแนกขั้นสุดท้าย
            </p>
          </div>
          <button
            type="button"
            onClick={resetInitialObservation}
            className="text-xs text-zinc-500 hover:text-zinc-200 transition"
          >
            ↺ ล้างข้อมูล Wizard
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {/* Step 1: Specimen */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              1. สิ่งส่งตรวจ (Specimen)
            </label>
            <div className="grid grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
              {SPECIMENS.map((spec) => (
                <button
                  type="button"
                  key={spec.value}
                  onClick={() => updateObs({ specimen: spec.value })}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${
                    initialObservation.specimen === spec.value
                      ? 'border-violet-400 bg-violet-500/15 text-violet-100'
                      : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                  }`}
                >
                  <span>{spec.emoji}</span>
                  <span className="truncate">{spec.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Gram Reaction */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              2. ผลย้อมแกรม (Gram Reaction)
            </label>
            <div className="flex flex-col gap-1.5">
              {GRAM_REACTIONS.map((g) => (
                <button
                  type="button"
                  key={g.value}
                  onClick={() => updateObs({ gramReaction: g.value })}
                  className={`w-full rounded-lg border px-3 py-2 text-left text-xs font-medium transition ${
                    initialObservation.gramReaction === g.value
                      ? `${g.color} ring-2 ring-violet-500/35 border-transparent`
                      : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Morphology & Arrangement */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
              3. รูปร่างและการเรียงตัว (Morphology)
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {MORPHOLOGY_OPTIONS.map((morph) => (
                <button
                  type="button"
                  key={morph.value}
                  onClick={() => updateObs({ morphology: morph.value })}
                  className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-left text-xs transition ${
                    initialObservation.morphology === morph.value
                      ? 'border-violet-400 bg-violet-500/15 text-violet-100'
                      : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:border-white/10 hover:text-zinc-200'
                  }`}
                >
                  <span>{morph.emoji}</span>
                  <span className="truncate">{morph.label}</span>
                </button>
              ))}
            </div>

            {/* Arrangement Dropdown */}
            <div className="mt-1 flex flex-col gap-1">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase">การเรียงตัว (Arrangement)</span>
              <select
                value={initialObservation.arrangement || 'unknown'}
                onChange={(e) => updateObs({ arrangement: e.target.value as Arrangement })}
                className="w-full rounded-lg border border-white/10 bg-zinc-950 p-2 text-xs text-zinc-300 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
              >
                {ARRANGEMENT_OPTIONS.map((arr) => (
                  <option key={arr.value} value={arr.value}>
                    {arr.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Suggested suites section */}
        <div className="mt-5 border-t border-white/10 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
            💡 กลุ่มเชื้อที่แนะนำตามลักษณะทางจุลชีววิทยา:
          </h3>
          {suiteSelectionReason && (
            <div className="mb-3 rounded-lg border border-violet-500/20 bg-violet-500/10 px-3 py-2 text-[11px] text-violet-200">
              เลือก suite อัตโนมัติ: {suiteSelectionReason}
            </div>
          )}
          {suggestions.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] px-3 py-4 text-center text-xs text-zinc-500">
              กรุณาระบุ Gram reaction และ morphology เพิ่มเติมก่อนเลือกกลุ่มเชื้อ
            </div>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
              {suggestions.map((sug) => {
              const isActive = currentGroup === sug.groupId
              return (
                <div
                  key={sug.groupId}
                  onClick={() => setGroup(sug.groupId)}
                  className={`cursor-pointer rounded-xl border p-3 flex flex-col justify-between transition-all ${
                    isActive
                      ? 'border-violet-400 bg-violet-500/15 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                      : 'border-white/5 bg-white/[0.01] hover:border-white/15 hover:bg-white/[0.03]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-bold ${isActive ? 'text-violet-300' : 'text-zinc-200'}`}>
                        {sug.name}
                      </span>
                      {isActive && (
                        <span className="text-[9px] font-bold text-violet-300 bg-violet-500/25 px-1 py-0.5 rounded border border-violet-500/20">
                          กำลังใช้งาน
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 leading-normal mb-3">
                      {sug.reason}
                    </p>
                    {sug.confidence === 'contextual' && (
                      <p className="mb-3 text-[10px] text-amber-300/80">
                        บริบทจากสิ่งส่งตรวจเท่านั้น ต้องใช้ Gram stain และผลทดสอบยืนยัน
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      setGroup(sug.groupId)
                    }}
                    className={`w-full rounded-lg py-1 text-center text-[10px] font-semibold transition ${
                      isActive
                        ? 'bg-violet-500 text-white hover:bg-violet-600'
                        : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                    }`}
                  >
                    {isActive ? 'เลือกแล้ว' : 'ใช้ชุดทดสอบนี้'}
                  </button>
                </div>
              )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

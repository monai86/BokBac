import { useIdentifyStore } from '@/store/identifyStore'
import { ALL_SUITES } from '@/lib/dataLoader'

const COMMON_VALUES: Array<{ value: string; label: string }> = [
  { value: '+', label: '+' },
  { value: '−', label: '−' },
  { value: 'V', label: 'V' },
]

const HEMOLYSIS_VALUES: Array<{ value: string; label: string }> = [
  { value: 'β', label: 'β' },
  { value: 'α', label: 'α' },
  { value: 'γ', label: 'γ' },
]

const SR_VALUES: Array<{ value: string; label: string }> = [
  { value: 's', label: 'S' },
  { value: 'r', label: 'R' },
]

function valuesForTest(testId: string, label: string): Array<{ value: string; label: string }> {
  const lower = (testId + ' ' + label).toLowerCase()
  if (lower.includes('hemolysis')) return [...HEMOLYSIS_VALUES, ...COMMON_VALUES]
  if (lower.includes('bacitracin') || lower.includes('optochin') || lower.includes('novobiocin'))
    return SR_VALUES
  return COMMON_VALUES
}

export function TestSelector() {
  const group = useIdentifyStore((s) => s.group)
  const answers = useIdentifyStore((s) => s.answers)
  const setAnswer = useIdentifyStore((s) => s.setAnswer)

  const suite = ALL_SUITES[group]
  if (!suite) {
    return (
      <div className="lg-surface p-6 text-center text-zinc-400">
        ไม่พบ suite สำหรับ group <code className="text-violet-300">{group}</code>
      </div>
    )
  }

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
        {suite.tests.map((t) => {
          const current = answers[t.label] || answers[t.id] || ''
          const opts = valuesForTest(t.id, t.label)
          return (
            <div
              key={t.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2"
            >
              <span className="text-sm text-zinc-200 truncate">{t.label}</span>
              <div className="flex items-center gap-1">
                {opts.map((o) => (
                  <button
                    type="button"
                    key={o.value}
                    aria-label={`Set ${t.label} to ${o.label}`}
                    aria-pressed={current === o.value}
                    onClick={() =>
                      setAnswer(t.label, current === o.value ? null : o.value)
                    }
                    className={`min-w-[28px] rounded-md border px-2 py-0.5 text-xs font-medium transition ${
                      current === o.value
                        ? 'border-violet-400 bg-violet-500/30 text-violet-100'
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
    </div>
  )
}

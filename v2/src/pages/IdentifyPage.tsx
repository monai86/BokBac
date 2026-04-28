import { useEffect } from 'react'
import { GroupSelector } from '@/components/GroupSelector'
import { TestSelector } from '@/components/TestSelector'
import { SpeciesCard } from '@/components/SpeciesCard'
import { useIdentifyStore } from '@/store/identifyStore'

export function IdentifyPage() {
  const results = useIdentifyStore((s) => s.results)
  const recompute = useIdentifyStore((s) => s.recompute)
  const resetAnswers = useIdentifyStore((s) => s.resetAnswers)

  useEffect(() => {
    recompute()
  }, [recompute])

  const top10 = results.slice(0, 10)

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-zinc-50 tracking-tight">
          🦠 วินิจฉัยเชื้อแบคทีเรีย
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          MCM 11th Bayesian Engine · 157 species · 50/50 textbook scenarios validated
        </p>
      </header>

      <section className="mb-5">
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          1. เลือกกลุ่มเชื้อ
        </h2>
        <GroupSelector />
      </section>

      <section className="mb-5">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            2. ตอบผล Biochemical Tests
          </h2>
          <button
            onClick={resetAnswers}
            className="text-xs text-zinc-500 hover:text-zinc-200"
          >
            ↺ Reset
          </button>
        </div>
        <TestSelector />
      </section>

      <section>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-500">
          3. ผลการวินิจฉัย (Top 10)
        </h2>
        {top10.length === 0 ? (
          <div className="lg-surface p-6 text-center text-zinc-500">
            กำลังคำนวณ…
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {top10.map((s, i) => (
              <SpeciesCard key={s.id} species={s} rank={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

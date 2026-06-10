import { useState } from 'react'
import { useIdentifyStore } from '@/store/identifyStore'
import { lookupTestDefinition } from '@/data/tests/biochemicalTestRegistry'

const SUITE_TABS = [
  { id: 'gpc_cluster', label: 'GPC Cluster', icon: '🧫' },
  { id: 'gpc_chain', label: 'GPC Chain', icon: '🦠' },
  { id: 'gpb', label: 'GP Bacilli', icon: '🧪' },
  { id: 'enterobacterales', label: 'Enterobacterales', icon: '🦠' },
  { id: 'vibrio_aeromonas', label: 'Vibrio / Aeromonas', icon: '💧' },
  { id: 'nfb', label: 'Non-Fermentative', icon: '⚡' },
  { id: 'gn_coccobacilli', label: 'GN Coccobacilli', icon: '🔬' },
]

export function TestSuitesPage() {
  const defaultSuites = useIdentifyStore((s) => s.defaultSuites) || []
  const customSuites = useIdentifyStore((s) => s.customSuites) || []
  const [group, setGroup] = useState(SUITE_TABS[0].id)

  const allSuites = [...defaultSuites, ...customSuites]
  const suite = allSuites.find((item) => item.group === group) || allSuites[0]

  return (
    <div className="suite-page space-y-6">
      <header className="lg-surface suite-header p-6">
        <div className="lg-specular" />
        <div className="lg-caustic" />
        <div className="lg-content space-y-6">
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-xl border border-violet-400/30 bg-violet-500/15 text-2xl">
              🧪
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-zinc-50">Test Suite Reference</h1>
              <p className="mt-1 text-sm font-semibold text-zinc-500">
                รายการ Biochemical Tests ที่ใช้ในแต่ละกลุ่มเชื้อ
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUITE_TABS.map((tab) => {
              const active = tab.id === group
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setGroup(tab.id)}
                  className={`rounded-xl border px-5 py-3 text-sm font-bold transition ${
                    active
                      ? 'border-violet-400 bg-violet-500/20 text-violet-200 shadow-[0_0_20px_rgba(167,139,250,0.18)]'
                      : 'border-white/10 bg-white/[0.025] text-zinc-500 hover:border-white/20 hover:text-zinc-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {suite && (
        <>
          <section className="lg-surface suite-summary p-6">
            <div className="lg-specular" />
            <div className="lg-caustic" />
            <div className="lg-content flex items-center gap-5">
              <div className="grid h-14 w-14 place-items-center rounded-xl bg-violet-500/70 text-2xl">
                {SUITE_TABS.find((tab) => tab.id === group)?.icon || '🧪'}
              </div>
              <div>
                <h2 className="text-xl font-black text-zinc-100">{suite.name}</h2>
                <p className="mt-1 text-sm text-zinc-500">{suite.description || suite.group}</p>
                <p className="mt-1 text-xs text-zinc-600">{suite.tests.length} tests</p>
              </div>
            </div>
          </section>

          <section className="suite-table overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
            <div className="suite-table-row suite-table-head border-b border-white/10 px-6 py-4 text-xs font-black uppercase tracking-widest text-zinc-500">
              <span>No.</span>
              <span>Test name</span>
              <span>Options</span>
            </div>
            <div className="divide-y divide-white/[0.07]">
              {suite.tests.map((item, index) => {
                const def = lookupTestDefinition(item.testId)
                const options = def?.options || ['+', '−']
                return (
                  <article
                    key={`${item.testId}-${index}`}
                    className="suite-table-row min-h-[78px] items-center px-6 py-4"
                  >
                    <div>
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-violet-500/15 text-sm font-black text-violet-300">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-zinc-100">{def?.label || item.testId}</h3>
                      <p className="mt-1 text-xs text-zinc-500">{item.testId}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {options.map((option) => (
                        <span
                          key={option}
                          className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-xs font-semibold text-zinc-500"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

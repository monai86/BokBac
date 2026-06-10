import { useMemo, useState } from 'react'
import {
  BIOCHEM_TESTS_DATA,
  MEDIA_DATA,
  PH_INDICATORS_DATA,
  REAGENT_STORAGE,
} from '@/data/bacteriaLibrary'

interface TestItem {
  id: string
  name: string
  thai?: string
  principle?: string
  media?: string
  reagent?: string
  reagents?: string | Record<string, string>
  procedure?: string
  positive?: string
  rapid?: string
  sensitive?: string
  negative?: string
  resistant?: string
  interpretation_legend?: string
  examples?: string
  significance?: string
  organisms?: string
  incubation?: string
  qc?: string
  critical_note?: string
  important_note?: string
}

interface TestCategory {
  category: string
  color: string
  tests: TestItem[]
}

interface PlateItem {
  id: string
  name: string
  thai?: string
  type?: string
  principle?: string
  components?: string
  colonyTypes?: string
  keyUse?: string
  qc?: string
}

interface MediaCategory {
  category: string
  plates: PlateItem[]
}

type ReferenceTab = 'tests' | 'media' | 'indicators' | 'storage'

export function TestsReferencePage() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<ReferenceTab>('tests')

  // Search logic for biochemical tests
  const filteredTests = useMemo(() => {
    const rawTests = BIOCHEM_TESTS_DATA as TestCategory[]
    if (!search.trim()) return rawTests
    const q = search.toLowerCase()
    return rawTests
      .map((cat) => ({
        ...cat,
        tests: cat.tests.filter(
          (t) =>
            t.name.toLowerCase().includes(q) ||
            (t.thai && t.thai.toLowerCase().includes(q)) ||
            (t.principle && t.principle.toLowerCase().includes(q)) ||
            (t.organisms && t.organisms.toLowerCase().includes(q)) ||
            t.id.toLowerCase().includes(q),
        ),
      }))
      .filter((cat) => cat.tests.length > 0)
  }, [search])

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  // Count constants
  const testsCount = useMemo(() => {
    const rawTests = BIOCHEM_TESTS_DATA as TestCategory[]
    return rawTests.reduce((acc, cat) => acc + cat.tests.length, 0)
  }, [])

  const mediaCount = useMemo(() => {
    const rawMedia = MEDIA_DATA as MediaCategory[]
    return rawMedia.reduce((acc, cat) => acc + cat.plates.length, 0)
  }, [])

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <header className="lg-surface p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-zinc-900/35 border-white/10 shadow-lg">
        <div className="lg-specular" />
        <div className="lg-caustic" />
        <div className="lg-content flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-pink-500/20 border border-violet-500/30 flex items-center justify-center text-2xl shadow-md">
            ⚗️
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-50">
              Biochemical Tests & Media Reference
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              คู่มืออ้างอิงการทดสอบทางชีวเคมี อาหารเลี้ยงเชื้อ ตัวชี้วัด และการเตรียมสารเคมี
            </p>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/5 pb-2">
        {([
          { id: 'tests', label: '🧪 Biochemical Tests', count: testsCount },
          { id: 'media', label: '🧫 Culture Media', count: mediaCount },
          { id: 'indicators', label: '🎨 pH Indicators', count: PH_INDICATORS_DATA.length },
          { id: 'storage', label: '📦 Reagent Storage', count: REAGENT_STORAGE.length },
        ] satisfies Array<{ id: ReferenceTab; label: string; count: number }>).map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold border transition ${
                isActive
                  ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                  : 'border-white/5 bg-white/[0.02] text-zinc-400 hover:text-zinc-200 hover:border-white/15'
              }`}
            >
              {tab.label} <span className="opacity-60 font-medium">({tab.count})</span>
            </button>
          )
        })}
      </div>

      {/* Search Input for Biochemical Tests */}
      {activeTab === 'tests' && (
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">🔍</span>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหา: ชื่อการทดสอบ, หลักการ, เชื้อ, รหัสการทดสอบ..."
            className="w-full text-xs bg-white/[0.03] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.05] transition"
          />
        </div>
      )}

      {/* Tab Contents: Biochemical Tests */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          {filteredTests.map((category) => (
            <div key={category.category} className="space-y-3">
              {/* Category Title */}
              <div
                className="flex items-center justify-between px-4 py-2 rounded-xl border bg-white/[0.01]"
                style={{ borderLeft: `3px solid ${category.color}`, borderColor: 'rgba(255,255,255,0.05)' }}
              >
                <h2 className="text-xs font-bold uppercase tracking-wider" style={{ color: category.color }}>
                  {category.category}
                </h2>
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold border"
                  style={{
                    backgroundColor: `${category.color}15`,
                    color: category.color,
                    borderColor: `${category.color}30`,
                  }}
                >
                  {category.tests.length} tests
                </span>
              </div>

              {/* Grid of Tests */}
              <div className="grid gap-3 sm:grid-cols-2">
                {category.tests.map((test) => {
                  const isExpanded = expanded[test.id]
                  return (
                    <div
                      key={test.id}
                      className={`lg-surface p-4 transition-all duration-200 border shadow-md flex flex-col justify-between ${
                        isExpanded ? 'sm:col-span-2' : ''
                      }`}
                      style={{ borderColor: `${category.color}25` }}
                    >
                      <div className="lg-specular" />
                      <div className="lg-caustic" />
                      <div className="lg-content flex flex-col h-full justify-between">
                        {/* Header */}
                        <button
                          type="button"
                          onClick={() => toggleExpand(test.id)}
                          className="w-full text-left flex justify-between items-start gap-4 focus:outline-none"
                        >
                          <div className="min-w-0">
                            <span className="text-[10px] font-bold block mb-0.5" style={{ color: category.color }}>
                              {test.id}
                            </span>
                            <h3 className="text-xs font-bold text-zinc-200 leading-tight">
                              {test.name}
                            </h3>
                            {test.thai && (
                              <p className="text-[10px] text-zinc-400 mt-0.5 leading-normal">{test.thai}</p>
                            )}
                          </div>
                          <span
                            className={`text-zinc-500 text-xs transform transition-transform shrink-0 mt-1 duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          >
                            ▼
                          </span>
                        </button>

                        {/* Collapsible Details */}
                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t border-white/5 space-y-4 text-xs animate-fade-in">
                            {/* Principle */}
                            {test.principle && (
                              <div>
                                <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: category.color }}>
                                  หลักการ (Principle)
                                </div>
                                <p className="text-[11px] text-zinc-300 leading-relaxed">{test.principle}</p>
                              </div>
                            )}

                            {/* Media & Reagents */}
                            {(test.media || test.reagent || test.reagents) && (
                              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-1">
                                {test.media && (
                                  <p className="text-blue-300">
                                    <strong>Media:</strong> {test.media}
                                  </p>
                                )}
                                {test.reagent && (
                                  <p className="text-blue-300">
                                    <strong>Reagent:</strong> {test.reagent}
                                  </p>
                                )}
                                {test.reagents && (
                                  <p className="text-blue-300 font-mono">
                                    <strong>Reagents:</strong>{' '}
                                    {typeof test.reagents === 'string'
                                      ? test.reagents
                                      : Object.values(test.reagents).join('; ')}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Procedure */}
                            {test.procedure && (
                              <div>
                                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1">
                                  วิธีทำ (Procedure)
                                </div>
                                <p className="text-[11px] text-zinc-300 leading-relaxed">{test.procedure}</p>
                              </div>
                            )}

                            {/* Positive and Negative Result Alerts */}
                            <div className="grid gap-2 sm:grid-cols-2">
                              {(test.positive || test.rapid || test.sensitive) && (
                                <div className="bg-emerald-500/10 border border-emerald-500/25 rounded-lg p-3">
                                  <div className="text-[10px] font-bold text-emerald-400 mb-1">
                                    ✓ Positive / Sensitive
                                  </div>
                                  {test.positive && <p className="text-[11px] text-emerald-200">{test.positive}</p>}
                                  {test.rapid && <p className="text-[11px] text-emerald-200">{test.rapid}</p>}
                                  {test.sensitive && <p className="text-[11px] text-emerald-200">{test.sensitive}</p>}
                                </div>
                              )}

                              {(test.negative || test.resistant) && (
                                <div className="bg-rose-500/10 border border-rose-500/25 rounded-lg p-3">
                                  <div className="text-[10px] font-bold text-rose-400 mb-1">
                                    ✗ Negative / Resistant
                                  </div>
                                  {test.negative && <p className="text-[11px] text-rose-200">{test.negative}</p>}
                                  {test.resistant && <p className="text-[11px] text-rose-200">{test.resistant}</p>}
                                </div>
                              )}
                            </div>

                            {/* Interpretation Legend */}
                            {test.interpretation_legend && (
                              <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
                                <div className="text-[10px] font-bold text-amber-400 mb-1">📋 เกณฑ์การอ่านผล (Interpretation Key)</div>
                                <p className="text-[11px] text-amber-200 leading-relaxed">{test.interpretation_legend}</p>
                              </div>
                            )}

                            {/* Examples */}
                            {test.examples && (
                              <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3">
                                <div className="text-[10px] font-bold text-violet-400 mb-1">💡 ตัวอย่างผลปฏิกิริยา (Examples)</div>
                                <p className="text-[11px] text-violet-200 font-mono leading-relaxed">{test.examples}</p>
                              </div>
                            )}

                            {/* Significance */}
                            {test.significance && (
                              <div>
                                <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-1">
                                  ความสำคัญในการวินิจฉัย (Significance)
                                </div>
                                <p className="text-[11px] text-zinc-300 leading-relaxed">{test.significance}</p>
                              </div>
                            )}

                            {/* Related Organisms */}
                            {test.organisms && (
                              <div>
                                <div className="text-[10px] font-bold text-sky-400 uppercase tracking-wider mb-1">
                                  เชื้อที่เกี่ยวข้อง
                                </div>
                                <p className="text-[11px] text-sky-200 italic leading-relaxed">{test.organisms}</p>
                              </div>
                            )}

                            {/* Incubation */}
                            {test.incubation && (
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-zinc-500">🌡️ การบ่มเชื้อ:</span>
                                <span className="text-[11px] text-zinc-300">{test.incubation}</span>
                              </div>
                            )}

                            {/* QC Reference */}
                            {test.qc && (
                              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                                <div className="text-[10px] font-bold text-emerald-400 mb-1">✓ QC Strains</div>
                                <p className="text-[11px] text-emerald-300">{test.qc}</p>
                              </div>
                            )}

                            {/* Critical and Important Notes */}
                            {test.critical_note && (
                              <div className="bg-rose-500/15 border border-rose-500/35 rounded-lg p-3">
                                <div className="text-[10px] font-bold text-rose-400 mb-1">⚠️ Critical Note</div>
                                <p className="text-[11px] text-rose-200">{test.critical_note}</p>
                              </div>
                            )}

                            {test.important_note && (
                              <div className="bg-amber-500/15 border border-amber-500/35 rounded-lg p-3">
                                <div className="text-[10px] font-bold text-amber-400 mb-1">⚠️ Important Warning</div>
                                <p className="text-[11px] text-amber-200">{test.important_note}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Contents: Culture Media */}
      {activeTab === 'media' && (
        <div className="space-y-6">
          {(MEDIA_DATA as MediaCategory[]).map((cat, idx) => {
            const colors = ['#22d3ee', '#a855f7', '#f59e0b', '#10b981']
            const color = colors[idx % colors.length]
            return (
              <div key={cat.category} className="space-y-4">
                {/* Category header */}
                <div className="flex items-center gap-3 border-b border-white/5 pb-2">
                  <span className="w-1.5 h-6 rounded-sm" style={{ backgroundColor: color }} />
                  <h2 className="text-sm font-bold text-zinc-100">{cat.category}</h2>
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold border"
                    style={{
                      backgroundColor: `${color}15`,
                      color: color,
                      borderColor: `${color}30`,
                    }}
                  >
                    {cat.plates.length} plates
                  </span>
                </div>

                {/* Plates Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  {cat.plates.map((plate) => (
                    <div key={plate.id} className="lg-surface p-4 flex flex-col justify-between border-white/10 shadow-lg animate-fade-in">
                      <div className="lg-specular" />
                      <div className="lg-caustic" />
                      <div className="lg-content space-y-3">
                        {/* Title */}
                        <div className="border-b border-white/5 pb-2">
                          <h3 className="text-xs font-bold text-zinc-100">{plate.name}</h3>
                          {plate.thai && <p className="text-[10px] text-zinc-400 mt-0.5">{plate.thai}</p>}
                          <span className="inline-block mt-2 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[9px] text-zinc-400 uppercase tracking-wide">
                            {plate.type}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-3 text-[11px] leading-relaxed">
                          {plate.principle && (
                            <div>
                              <div className="text-[9px] font-bold text-cyan-400 uppercase mb-0.5">🔬 Principle</div>
                              <p className="text-zinc-300">{plate.principle}</p>
                            </div>
                          )}

                          {plate.components && (
                            <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-2.5">
                              <div className="text-[9px] font-bold text-violet-400 uppercase">🧪 Key Components</div>
                              <p className="text-violet-200 mt-1">{plate.components}</p>
                            </div>
                          )}

                          {plate.colonyTypes && (
                            <div>
                              <div className="text-[9px] font-bold text-amber-400 uppercase mb-0.5">🦠 Colony Appearance</div>
                              <p className="text-amber-200/90">{plate.colonyTypes}</p>
                            </div>
                          )}

                          {plate.keyUse && (
                            <div>
                              <div className="text-[9px] font-bold text-emerald-400 uppercase mb-0.5">🎯 Primary Use</div>
                              <p className="text-emerald-300/90">{plate.keyUse}</p>
                            </div>
                          )}

                          {plate.qc && (
                            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-2">
                              <div className="text-[9px] font-bold text-emerald-400 uppercase">✓ QC Strains</div>
                              <p className="text-emerald-300 mt-0.5">{plate.qc}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab Contents: pH Indicators */}
      {activeTab === 'indicators' && (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {PH_INDICATORS_DATA.map((ind, i) => (
            <div key={i} className="lg-surface p-5 border-white/10 shadow-lg space-y-4 animate-fade-in">
              <div className="lg-specular" />
              <div className="lg-caustic" />
              <div className="lg-content space-y-4">
                <h3 className="text-xs font-bold text-amber-400 border-b border-white/5 pb-2">
                  {ind.name}
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                    <span className="text-zinc-500">pH Range:</span>
                    <span className="text-zinc-200 font-mono font-semibold">{ind.pH}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                    <span className="text-zinc-500">Acid Color:</span>
                    <span className="text-yellow-400 font-semibold">{ind.acid}</span>
                  </div>
                  <div className="flex justify-between border-b border-white/[0.02] pb-1.5">
                    <span className="text-zinc-500">Alkaline Color:</span>
                    <span className="text-blue-400 font-semibold">{ind.alkaline}</span>
                  </div>
                  <div className="pt-2">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase block mb-1">Used for:</span>
                    <p className="text-[11px] text-zinc-300 leading-normal">{ind.used}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Contents: Reagent Storage */}
      {activeTab === 'storage' && (
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {REAGENT_STORAGE.map((item, i) => (
            <div key={i} className="lg-surface p-4 flex items-center gap-4 border-white/10 shadow-md animate-fade-in">
              <div className="lg-specular" />
              <div className="lg-caustic" />
              <div className="lg-content flex items-center gap-4 w-full">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-xl shrink-0">
                  🧪
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-zinc-200 leading-tight truncate">{item.reagent}</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Storage: <span className="text-violet-300 font-semibold">{item.storage}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { SPECIMEN_GUIDE } from '@/data/bacteriaLibrary'
import { getLibrarySpecies } from '@/lib/libraryCatalog'
import { useNavigate } from 'react-router-dom'

export function SpecimenPage() {
  const [selectedId, setSelectedId] = useState('blood')
  const navigate = useNavigate()
  const speciesList = getLibrarySpecies()

  const currentSpecimen = SPECIMEN_GUIDE.find((s) => s.id === selectedId) || SPECIMEN_GUIDE[0]

  const organismList = currentSpecimen.organisms
    ? currentSpecimen.organisms.split(/,\s*/).filter(Boolean)
    : []

  const handleSelectOrganism = (org: string) => {
    // Dynamic matching of organism name to species list
    const match = speciesList.find((b) => {
      const q = org.toLowerCase().trim()
      // Match by exact match or first word
      const cleanedBugName = b.name.toLowerCase()
      const firstWord = q.split(' ')[0]
      const nameMatch = cleanedBugName.includes(firstWord)
      const thaiMatch = b.thai && b.thai.toLowerCase().includes(q)
      return nameMatch || thaiMatch
    })
    
    if (match) {
      navigate(`/library/${match.id}`)
    } else {
      // Fallback: search library with the organism name
      navigate(`/library?q=${encodeURIComponent(org)}`)
    }
  }

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
          🧫 แนะนำสิ่งส่งตรวจ (Specimen Guide)
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          คู่มือแนะนำอาหารเลี้ยงเชื้อ (Culture Media) สภาพแวดล้อม และเชื้อที่พบบ่อยตามประเภทสิ่งส่งตรวจ
        </p>
      </header>

      {/* Main Layout Split */}
      <div className="grid gap-6 lg:grid-cols-[250px_1fr]">
        {/* Sidebar Selector */}
        <aside className="lg-surface p-4 flex flex-col h-fit bg-zinc-900/35">
          <div className="lg-specular" />
          <div className="lg-caustic" />
          <div className="lg-content flex flex-col gap-1.5">
            <div className="text-[10px] font-semibold tracking-wider text-zinc-500 uppercase px-3 py-1 mb-1">
              Specimen List
            </div>
            {SPECIMEN_GUIDE.map((spec) => {
              const isActive = spec.id === selectedId
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => setSelectedId(spec.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold border transition ${
                    isActive
                      ? 'border-violet-500/40 bg-violet-500/10 text-violet-200'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <span className="text-base">{spec.emoji}</span>
                  {spec.label}
                </button>
              )
            })}
          </div>
        </aside>

        {/* Specimen Detail Area */}
        <div className="space-y-6">
          {/* Hero Header Card */}
          <div className="lg-surface p-6 bg-gradient-to-br from-violet-500/10 via-white/[0.02] to-yellow-500/5 border border-white/10 shadow-lg">
            <div className="lg-specular" />
            <div className="lg-caustic" />
            <div className="lg-content flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-yellow-500/10 border border-white/15 flex items-center justify-center text-3xl shadow-md">
                {currentSpecimen.emoji}
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-zinc-50">
                  {currentSpecimen.label.split(' (')[0]}
                </h2>
                <p className="text-xs uppercase tracking-widest text-zinc-500 font-semibold mt-0.5">
                  {currentSpecimen.label.match(/\(([^)]+)\)/)?.[1] || 'Specimen'}
                </p>
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Culture Media Card */}
            <div className="lg-surface p-5 space-y-4">
              <div className="lg-specular" />
              <div className="lg-caustic" />
              <div className="lg-content space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-sm" />
                  <span className="text-base font-bold text-zinc-200">🧫 อาหารเลี้ยงเชื้อที่แนะนำ</span>
                </div>
                <div className="flex flex-col gap-2">
                  {currentSpecimen.plates.map((plate, index) => (
                    <div
                      key={plate}
                      className="flex items-center gap-3 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 transition hover:translate-x-1 hover:border-violet-500/25 hover:bg-violet-500/5"
                    >
                      <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-300 text-[11px] font-bold flex items-center justify-center border border-violet-500/30 shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-xs font-semibold text-zinc-300">{plate}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Incubation Conditions Card */}
            <div className="lg-surface p-5 space-y-4">
              <div className="lg-specular" />
              <div className="lg-caustic" />
              <div className="lg-content space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-cyan-500 to-blue-500 rounded-sm" />
                  <span className="text-base font-bold text-zinc-200">🌡️ เงื่อนไขการบ่มเพาะเชื้อ</span>
                </div>
                <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 mb-2">
                    <span>🌡️</span>
                    <span>อุณหภูมิ & สภาพแวดล้อม</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {currentSpecimen.condition}
                  </p>
                </div>
              </div>
            </div>

            {/* Important Notes Card */}
            <div className={`lg-surface p-5 space-y-4 ${organismList.length === 0 ? 'md:col-span-2' : ''}`}>
              <div className="lg-specular" />
              <div className="lg-caustic" />
              <div className="lg-content space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-5 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-sm" />
                  <span className="text-base font-bold text-zinc-200">📋 หมายเหตุสำคัญ (Important Notes)</span>
                </div>
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {currentSpecimen.notes}
                  </p>
                </div>
              </div>
            </div>

            {/* Common Pathogens Card */}
            {organismList.length > 0 && (
              <div className="lg-surface p-5 space-y-4">
                <div className="lg-specular" />
                <div className="lg-caustic" />
                <div className="lg-content space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-pink-500 rounded-sm" />
                    <span className="text-base font-bold text-zinc-200">🦠 เชื้อสาเหตุที่พบบ่อย</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {organismList.map((org) => (
                      <button
                        key={org}
                        type="button"
                        onClick={() => handleSelectOrganism(org)}
                        className="px-3 py-1.5 rounded-lg border border-purple-500/20 bg-purple-500/10 text-purple-200 text-xs font-medium transition hover:bg-purple-500/20 hover:border-purple-500/40"
                      >
                        {org}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Day 1-4 Lab Workflow Timeline */}
          <div className="lg-surface p-6 space-y-4 bg-zinc-900/10 border border-white/5">
            <div className="lg-specular" />
            <div className="lg-caustic" />
            <div className="lg-content space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xl">📅</span>
                <div>
                  <h3 className="text-sm font-bold text-orange-400">ตารางการดำเนินงานทางห้องปฏิบัติการ</h3>
                  <p className="text-[11px] text-zinc-500 mt-0.5">4-Day Standard Lab Workup Timeline</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    day: 'Day 1',
                    icon: '📦',
                    title: 'รับและลงเพลท',
                    desc: 'รับสิ่งส่งตรวจ ทำ Gram stain ด่วน และลงเพลทอาหารเลี้ยงเชื้อที่เหมาะสม จากนั้นนำเข้าตู้บ่ม 37°C',
                    color: 'border-blue-500/25 bg-blue-500/5 text-blue-400',
                    iconBg: 'bg-blue-500/20 text-blue-300'
                  },
                  {
                    day: 'Day 2',
                    icon: '🔍',
                    title: 'ดูผลและทดสอบขั้นต้น',
                    desc: 'ตรวจดูสัณฐานวิทยาของโคโลนี ทำ Gram stain โคโลนีเดี่ยว และทดสอบเบื้องต้น เช่น Catalase หรือ Oxidase',
                    color: 'border-cyan-500/25 bg-cyan-500/5 text-cyan-400',
                    iconBg: 'bg-cyan-500/20 text-cyan-300'
                  },
                  {
                    day: 'Day 3',
                    icon: '⚗️',
                    title: 'การทดสอบชีวเคมี',
                    desc: 'ลงชุดทดสอบเคมีเป้าหมายตามผลการวิเคราะห์เบื้องต้น (เช่น TSI, LIA, Citrate, MIO หรือแผ่นน้ำยาพิเศษ)',
                    color: 'border-violet-500/25 bg-violet-500/5 text-violet-400',
                    iconBg: 'bg-violet-500/20 text-violet-300'
                  },
                  {
                    day: 'Day 4',
                    icon: '✅',
                    title: 'อ่านผลและรายงาน',
                    desc: 'แปลผลปฏิกิริยาชีวเคมีทั้งหมด ตรวจความถูกต้องเปรียบเทียบกับคู่มือ สรุปชนิดเชื้อ และส่งผลรายงานแพทย์',
                    color: 'border-emerald-500/25 bg-emerald-500/5 text-emerald-400',
                    iconBg: 'bg-emerald-500/20 text-emerald-300'
                  }
                ].map((d) => (
                  <div
                    key={d.day}
                    className={`rounded-xl border p-4 flex flex-col gap-3 ${d.color}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-base ${d.iconBg} border border-white/5`}>
                        {d.icon}
                      </div>
                      <div>
                        <span className="px-2 py-0.5 rounded bg-white/5 text-[9px] font-bold border border-white/10 uppercase tracking-wide">
                          {d.day}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-100 mt-1">{d.title}</h4>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">{d.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

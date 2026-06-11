import { useState } from 'react'
import { SPECIMEN_GUIDE } from '@/data/bacteriaLibrary'
import { getLibrarySpecies } from '@/lib/libraryCatalog'
import { useNavigate } from 'react-router-dom'

const WORKFLOW_STEPS = [
  {
    day: 'Day 1',
    title: 'รับสิ่งส่งตรวจ',
    desc: 'Gram stain ด่วน เลือก plate ให้ตรงกับ specimen และบ่มตามเงื่อนไข',
  },
  {
    day: 'Day 2',
    title: 'อ่าน colony',
    desc: 'ดู colony morphology, ทำ Gram stain จาก colony เดี่ยว และเลือก screening test',
  },
  {
    day: 'Day 3',
    title: 'ลง biochemical',
    desc: 'เลือกชุดทดสอบตาม Gram group เช่น catalase, oxidase, TSI, bile esculin หรือ disc tests',
  },
  {
    day: 'Day 4',
    title: 'สรุปผล',
    desc: 'เทียบผลกับ reference, ตรวจ contradiction และบันทึก case สำหรับทบทวน',
  },
]

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
    <div className="specimen-workspace">
      <div className="specimen-shell">
        {/* Sidebar Selector */}
        <aside className="specimen-sidebar">
          <div className="flex flex-col gap-1.5">
            <div className="text-[11px] font-bold tracking-widest text-zinc-500 uppercase px-3 py-1 mb-0.5">
              Specimen
            </div>
            {SPECIMEN_GUIDE.map((spec) => {
              const isActive = spec.id === selectedId
              return (
                <button
                  key={spec.id}
                  type="button"
                  onClick={() => setSelectedId(spec.id)}
                  className={`legacy-list-button w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left font-semibold border transition ${
                    isActive
                      ? 'border-violet-500/40 bg-violet-500/10 text-violet-200'
                      : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
                  }`}
                >
                  <span className="text-lg">{spec.emoji}</span>
                  {spec.label}
                </button>
              )
            })}
          </div>
        </aside>

        <div className="specimen-main space-y-5">
          <div className="specimen-quick-panel lg-surface">
            <div className="lg-specular" />
            <div className="lg-caustic" />
            <div className="lg-content">
              <div className="specimen-title-row">
                <div className="specimen-mark" aria-hidden="true">{currentSpecimen.emoji}</div>
                <div>
                  <p className="specimen-kicker">Specimen guide</p>
                  <h1>{currentSpecimen.label.split(' (')[0]}</h1>
                  <p className="specimen-subtitle">
                    {currentSpecimen.label.match(/\(([^)]+)\)/)?.[1] || 'Clinical specimen'}
                  </p>
                </div>
              </div>

              <div className="specimen-facts">
                <section>
                  <span>อาหารเลี้ยงเชื้อ</span>
                  <strong>{currentSpecimen.plates.length} plates</strong>
                </section>
                <section>
                  <span>เงื่อนไขบ่ม</span>
                  <strong>{currentSpecimen.condition}</strong>
                </section>
                <section>
                  <span>จุดตรวจเร็ว</span>
                  <strong>{currentSpecimen.notes}</strong>
                </section>
              </div>
            </div>
          </div>

          <div className="specimen-detail-grid">
            <section className="specimen-section lg-surface specimen-section-media">
              <div className="lg-specular" />
              <div className="lg-caustic" />
              <div className="lg-content">
                <div className="specimen-section-head">
                  <span className="specimen-section-code">01</span>
                  <h2>Culture media</h2>
                </div>
                <ol className="specimen-plate-list">
                  {currentSpecimen.plates.map((plate, index) => (
                    <li key={plate}>
                      <span>{index + 1}</span>
                      <strong>{plate}</strong>
                    </li>
                  ))}
                </ol>
              </div>
            </section>

            <section className="specimen-section lg-surface specimen-section-condition">
              <div className="lg-specular" />
              <div className="lg-caustic" />
              <div className="lg-content">
                <div className="specimen-section-head">
                  <span className="specimen-section-code">02</span>
                  <h2>Incubation</h2>
                </div>
                <p className="specimen-readable">{currentSpecimen.condition}</p>
                <div className="specimen-note-strip">
                  <span>Note</span>
                  <strong>{currentSpecimen.notes}</strong>
                </div>
              </div>
            </section>

            {organismList.length > 0 && (
              <section className="specimen-section lg-surface specimen-section-organisms">
                <div className="lg-specular" />
                <div className="lg-caustic" />
                <div className="lg-content">
                  <div className="specimen-section-head">
                    <span className="specimen-section-code">03</span>
                    <h2>Common pathogens</h2>
                  </div>
                  <div className="specimen-organism-list">
                    {organismList.map((org) => (
                      <button
                        key={org}
                        type="button"
                        onClick={() => handleSelectOrganism(org)}
                        className="specimen-organism-chip"
                      >
                        {org}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            )}
          </div>

          <section className="specimen-workflow lg-surface">
            <div className="lg-specular" />
            <div className="lg-caustic" />
            <div className="lg-content">
              <div className="specimen-section-head specimen-workflow-head">
                <span className="specimen-section-code">04</span>
                <div>
                  <h2>Lab workup timeline</h2>
                  <p>4-day teaching workflow for specimen-to-result reasoning</p>
                </div>
              </div>
              <div className="specimen-timeline">
                {WORKFLOW_STEPS.map((step) => (
                  <article key={step.day}>
                    <span>{step.day}</span>
                    <div>
                      <h3>{step.title}</h3>
                      <p>{step.desc}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

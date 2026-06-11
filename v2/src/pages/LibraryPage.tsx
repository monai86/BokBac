import { useMemo, useState, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getGroupMeta, getLibrarySpecies, searchSpecies } from '@/lib/libraryCatalog'
import { GROUPS, SUITES } from '@/data/bacteriaLibrary'
import { getCanonicalBiochemRows } from '@/lib/testMatcher'

function toList(value: unknown) {
  return Array.isArray(value) ? value.filter(Boolean).map((item) => String(item)) : []
}

function toText(value: unknown) {
  return typeof value === 'string' ? value : ''
}

function toRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function importanceTone(level?: string) {
  switch (level) {
    case 'critical':
      return 'border-rose-500 bg-rose-500/10 text-rose-300'
    case 'high':
      return 'border-orange-500 bg-orange-500/10 text-orange-300'
    case 'moderate':
      return 'border-amber-500 bg-amber-500/10 text-amber-300'
    default:
      return 'border-zinc-500 bg-zinc-500/10 text-zinc-400'
  }
}

const IMP_LABEL: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  moderate: 'Moderate',
  low: 'Low',
}

const IMP_COLOR: Record<string, string> = {
  critical: '#f87171',
  high: '#fb923c',
  moderate: '#fbbf24',
  low: '#94a3b8',
}



function InfoCard({ title, color, children }: { title: string; color?: string; children: React.ReactNode }) {
  const c = color || '#a78bfa'
  return (
    <div className="card" style={{ padding: '14px', background: 'var(--glass-bg)', backdropFilter: 'var(--glass-blur)', border: `1px solid ${c}40`, borderRadius: 12, borderLeft: `3px solid ${c}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: c, letterSpacing: .5, textTransform: 'uppercase', marginBottom: 6 }}>{title}</div>
      {children}
    </div>
  )
}

type ActiveTab = 'clinical' | 'colony' | 'biochem' | 'resistance' | 'notes'

export function LibraryPage() {
  const { speciesId } = useParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')
  const [activeTab, setActiveTab] = useState<ActiveTab>('clinical')

  const species = useMemo(() => getLibrarySpecies(), [])
  const filtered = useMemo(
    () =>
      species.filter((item) => {
        if (group !== 'all' && item.group !== group) return false
        return searchSpecies(item, query)
      }),
    [group, query, species],
  )

  const selectedSpecies = useMemo(() => {
    if (!speciesId) return null
    return species.find((item) => item.id === speciesId) || null
  }, [speciesId, species])

  // Automatically reset tab when species changes
  useEffect(() => {
    setActiveTab('clinical')
  }, [speciesId])

  const groupMeta = selectedSpecies ? getGroupMeta(selectedSpecies.group) : null
  const groupColor = groupMeta?.color || '#94a3b8'
  const colony = selectedSpecies ? toRecord(selectedSpecies.colony) : {}
  const clinical = selectedSpecies ? toRecord(selectedSpecies.clinical) : {}
  const diseases = selectedSpecies ? toList(clinical.diseases) : []

  const canonicalBiochem = useMemo(() => {
    if (!selectedSpecies) return []
    return getCanonicalBiochemRows(selectedSpecies, SUITES)
  }, [selectedSpecies])


  return (
    <div className="workspace-page max-w-none px-4 sm:px-6 flex flex-col h-[calc(100vh-80px)] overflow-hidden">
      {/* Toolbar */}
      <header className="mb-3 flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-start xl:gap-6 flex-shrink-0">
        <label className="relative w-full xl:max-w-[280px]">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 text-lg">🔍</span>
          <span className="sr-only">ค้นหาเชื้อ</span>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ค้นหาชื่อเชื้อ..."
            style={{
              width: '100%',
              height: '42px',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(255, 255, 255, 0.035)',
              color: 'var(--text)',
              padding: '10px 16px 10px 40px',
              fontSize: '14px',
              outline: 'none',
              appearance: 'none',
              WebkitAppearance: 'none',
              transition: 'all 180ms ease',
            }}
            className="focus:border-violet-400/70 focus:bg-white/[0.06] focus:ring-2 focus:ring-violet-400/20"
          />
        </label>

        <div className="flex flex-wrap items-center gap-2 group-filter-scroll flex-1">
          {GROUPS.map((g) => (
            <button
              type="button"
              key={g.id}
              onClick={() => setGroup(g.id)}
              style={{
                background: group === g.id ? `${g.color}20` : 'transparent',
                border: `1px solid ${group === g.id ? g.color : 'rgba(255,255,255,0.12)'}`,
                color: group === g.id ? g.color : '#64748b',
                borderRadius: 20,
                padding: '4px 11px',
                fontSize: '11px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all .15s',
              }}
            >
              {g.emoji} {g.label}
            </button>
          ))}
          <span className="ml-auto hidden text-sm font-semibold text-zinc-500 xl:inline">
            {filtered.length} organisms
          </span>
        </div>
      </header>

      {/* Split catalog layout */}
      <div className="flex flex-1 min-h-0 overflow-hidden gap-4 mt-2">
        {/* Left side list */}
        <div className={`overflow-y-auto transition-all duration-300 pr-1 ${selectedSpecies ? 'lg:w-[35%] w-full' : 'w-full'}`}>
          {filtered.length === 0 ? (
            <div className="lg-surface p-8 text-center text-sm text-zinc-500">
              ไม่พบ species ที่ตรงกับคำค้นนี้
            </div>
          ) : (
            <section className="grid gap-2">
              {filtered.map((item) => {
                const gm = getGroupMeta(item.group)
                const isSelected = item.id === speciesId
                const groupColor = gm?.color || '#94a3b8'
                return (
                  <Link
                    key={item.id}
                    to={`/library/${item.id}`}
                    style={{
                      background: isSelected ? `${groupColor}12` : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? groupColor : 'rgba(255,255,255,0.08)'}`,
                      borderRadius: '10px',
                      padding: '11px',
                      marginBottom: '7px',
                      cursor: 'pointer',
                      transition: 'all .15s',
                      display: 'block',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, fontStyle: 'italic', color: isSelected ? groupColor : '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</div>
                        {item.thai && <div style={{ fontSize: '9px', color: '#64748b', marginTop: '1px' }}>{item.thai}</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px', marginLeft: '8px' }}>
                        <span style={{ background: `${groupColor}18`, color: groupColor, border: `1px solid ${groupColor}44`, borderRadius: '8px', padding: '1px 7px', fontSize: '9px', whiteSpace: 'nowrap' }}>{gm?.emoji} {gm?.label}</span>
                        {item.importance && IMP_COLOR[item.importance] && (
                          <span style={{ background: `${IMP_COLOR[item.importance]}15`, color: IMP_COLOR[item.importance], borderRadius: '8px', padding: '1px 7px', fontSize: '9px', whiteSpace: 'nowrap' }}>● {IMP_LABEL[item.importance]}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '4px', padding: '1px 6px', fontSize: '9px', color: '#94a3b8' }}>Gram {item.gram}</span>
                      <span style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.10)', borderRadius: '4px', padding: '1px 6px', fontSize: '9px', color: '#94a3b8' }}>{item.morph}</span>
                      {item.tags?.slice(0, 3).map(t => (
                        <span key={t} style={{ background: `${groupColor}10`, color: groupColor, borderRadius: '4px', padding: '1px 6px', fontSize: '9px' }}>{t}</span>
                      ))}
                    </div>
                  </Link>
                )
              })}
            </section>
          )}
        </div>

        {/* Right side details panel */}
        {selectedSpecies && (
          <div className="lg:w-[65%] w-full overflow-y-auto lg:relative lg:block fixed inset-0 lg:inset-auto z-50 lg:z-auto bg-[#0a0514]/95 lg:bg-[#0a0514]/70 lg:border-l lg:border-white/10 lg:pl-4 p-4 lg:p-0 flex flex-col">
            <div className="lg-surface p-5 sm:p-6 flex-1 flex flex-col" style={{ background: `linear-gradient(135deg, ${groupColor}15, rgba(10,5,20,0.8))` }}>
              <div className="lg-specular" />
              <div className="lg-caustic" />
              <div className="lg-content flex-1 flex flex-col min-h-0">
                {/* Header panel */}
                <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
                  <div>
                    <h1 className="text-2xl font-bold italic" style={{ color: groupColor }}>
                      {selectedSpecies.name}
                    </h1>
                    {selectedSpecies.thai && (
                      <p className="text-sm text-zinc-400 mt-0.5">{selectedSpecies.thai}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-zinc-300">
                        Gram {selectedSpecies.gram} · {selectedSpecies.morph}
                      </span>
                      {selectedSpecies.importance && (
                        <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${importanceTone(selectedSpecies.importance)}`}>
                          ● {IMP_LABEL[selectedSpecies.importance]}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('/library')}
                    className="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-100 hover:bg-white/10 text-xs font-semibold transition"
                  >
                    ✕ ปิดหน้าต่าง
                  </button>
                </div>

                {/* Tab select bar */}
                <div className="flex gap-1.5 my-4 border-b border-white/5 pb-2.5 overflow-x-auto scrollbar-none flex-shrink-0">
                  {['clinical', 'colony', 'biochem', 'resistance', 'notes'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab as ActiveTab)}
                      style={{
                        background: activeTab === tab ? `${groupColor}20` : 'transparent',
                        border: `1px solid ${activeTab === tab ? groupColor : 'rgba(255,255,255,0.10)'}`,
                        color: activeTab === tab ? groupColor : '#64748b',
                        borderRadius: 6,
                        padding: '4px 10px',
                        fontSize: 10,
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      {tab === 'clinical' && '🏥 Clinical'}
                      {tab === 'colony' && '🍽 Colony'}
                      {tab === 'biochem' && '⚗️ Biochem'}
                      {tab === 'resistance' && '💊 Resistance'}
                      {tab === 'notes' && '📝 Notes'}
                    </button>
                  ))}
                </div>

                {/* Tab content panel */}
                <div className="flex-1 overflow-y-auto pr-1">
                  {activeTab === 'clinical' && (
                    <div className="space-y-4 animate-fade-in">
                      {toText(clinical.habitat) && (
                        <InfoCard title="🌍 Natural Habitat" color={groupColor}>
                          <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.7, marginTop: 6 }}>{toText(clinical.habitat)}</p>
                        </InfoCard>
                      )}
                      <div style={{ height: 10 }} />
                      {diseases.length > 0 && (
                        <InfoCard title="🦠 Diseases Caused" color={groupColor}>
                          {diseases.map((d, i) => (
                            <div key={i} style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                              <span style={{ color: groupColor }}>▸</span>
                              <span style={{ fontSize: 12, color: '#cbd5e1', lineHeight: 1.5 }}>{d}</span>
                            </div>
                          ))}
                        </InfoCard>
                      )}
                      <div style={{ height: 10 }} />
                      {toText(clinical.transmission) && (
                        <InfoCard title="🔄 Transmission" color={groupColor}>
                          <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.7, marginTop: 6 }}>{toText(clinical.transmission)}</p>
                        </InfoCard>
                      )}
                      {toText(clinical.factors) && (
                        <>
                          <div style={{ height: 10 }} />
                          <InfoCard title="⚡ Virulence Factors" color={groupColor}>
                            <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.7, marginTop: 6 }}>{toText(clinical.factors)}</p>
                          </InfoCard>
                        </>
                      )}
                      {selectedSpecies.tags && selectedSpecies.tags.length > 0 && (
                        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 12 }}>
                          {selectedSpecies.tags.map((t) => (
                            <span key={t} style={{ background: `${groupColor}15`, color: groupColor, border: `1px solid ${groupColor}33`, borderRadius: 12, padding: '3px 10px', fontSize: 10 }}>{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'colony' && (
                    <div className="space-y-4 animate-fade-in">
                      {selectedSpecies.gramStain && (
                        <InfoCard title="🔬 Gram Stain" color={groupColor}>
                          <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.7, marginTop: 6 }}>{selectedSpecies.gramStain}</p>
                        </InfoCard>
                      )}
                      <div style={{ height: 10 }} />
                      {Object.keys(colony).length > 0 && (
                        <InfoCard title="🧫 Colony Morphology" color={groupColor}>
                          {Object.entries(colony).map(([med, desc]) => (
                            <div key={med} style={{ marginTop: 8 }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: groupColor, background: `${groupColor}15`, padding: '1px 8px', borderRadius: 4 }}>{med}</span>
                              <p style={{ margin: '4px 0 0 0', fontSize: 12, color: '#94a3b8', lineHeight: 1.6 }}>{String(desc)}</p>
                            </div>
                          ))}
                        </InfoCard>
                      )}
                      <div style={{ height: 10 }} />
                      {(selectedSpecies.media || selectedSpecies.condition) && (
                        <InfoCard title="🌡️ Media & Condition" color={groupColor}>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                            {selectedSpecies.media?.map(m => <span key={m} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '3px 10px', fontSize: 11, color: '#cbd5e1' }}>{m}</span>)}
                          </div>
                          <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 8 }}>{selectedSpecies.condition}</p>
                        </InfoCard>
                      )}
                    </div>
                  )}

                  {activeTab === 'biochem' && (
                    <div className="fade-in">
                      <InfoCard title="⚗️ Key Biochemical Tests" color={groupColor}>
                        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
                          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, marginTop: 8 }}>
                            <thead>
                              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                {['Test', 'Result', 'Note'].map(h => <th key={h} style={{ textAlign: 'left', padding: '6px 8px', color: '#64748b', fontWeight: 500 }}>{h}</th>)}
                              </tr>
                            </thead>
                            <tbody>
                              {canonicalBiochem.map((row, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                  <td style={{ padding: '5px 8px', color: '#cbd5e1', fontWeight: 500 }}>{row.t}</td>
                                  <td style={{ padding: '5px 8px' }}>
                                    <span style={{ fontWeight: 700, fontSize: 12, color: row.r.startsWith('+') ? '#4ade80' : row.r.startsWith('−') || row.r.startsWith('-') ? '#f87171' : row.r === 'S' ? '#22d3ee' : row.r === 'R' ? '#f97316' : '#fbbf24' }}>{row.r}</span>
                                  </td>
                                  <td style={{ padding: '5px 8px', color: '#64748b', fontSize: 10 }}>{row.n}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </InfoCard>
                    </div>
                  )}

                  {activeTab === 'resistance' && (
                    <div className="fade-in">
                      {(() => {
                        const resPatterns = [
                          { org: ['Staphylococcus aureus'], type: 'MRSA', name: 'Methicillin-resistant S. aureus', mech: 'mecA gene → PBP2a', test: 'Cefoxitin disk ≤21mm', treat: 'Vancomycin, Linezolid, Daptomycin', color: '#ef4444' },
                          { org: ['Enterococcus faecalis', 'Enterococcus faecium'], type: 'VRE', name: 'Vancomycin-resistant Enterococci', mech: 'vanA/vanB genes', test: 'Vancomycin MIC ≥32 µg/mL', treat: 'Linezolid, Daptomycin', color: '#f97316' },
                          { org: ['Escherichia coli', 'Klebsiella pneumoniae', 'Proteus mirabilis'], type: 'ESBL', name: 'ESBL-producer', mech: 'CTX-M, SHV, TEM β-lactamases', test: 'Cefotaxime+Clavulanate synergy', treat: 'Carbapenems, avoid cephalosporins', color: '#eab308' },
                          { org: ['Klebsiella pneumoniae', 'Escherichia coli', 'Enterobacter', 'Serratia'], type: 'CRE', name: 'Carbapenem-resistant', mech: 'KPC, NDM, OXA-48', test: 'Carbapenem MIC ≥4 µg/mL', treat: 'Polymyxins, Tigecycline, Ceftazidime-avibactam', color: '#ef4444' },
                          { org: ['Acinetobacter baumannii'], type: 'CRAB', name: 'Carbapenem-resistant A. baumannii', mech: 'OXA-23, OXA-24/40', test: 'Imipenem/Meropenem MIC ≥8', treat: 'Colistin, Sulbactam, Tigecycline', color: '#ef4444' },
                          { org: ['Pseudomonas aeruginosa'], type: 'CRPsA', name: 'Carbapenem-resistant P. aeruginosa', mech: 'AmpC + porin loss', test: 'Carbapenem MIC ≥8', treat: 'Ceftazidime-avibactam, Polymyxins', color: '#f97316' },
                        ];
                        const matched = resPatterns.filter(p => p.org.some(o => selectedSpecies.name.toLowerCase().includes(o.toLowerCase())));
                        
                        if (matched.length === 0) {
                          return (
                            <InfoCard title="💊 Antibiotic Resistance" color="#64748b">
                              <div style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.7, marginTop: 8 }}>
                                <p>No specific resistance pattern data for <strong>{selectedSpecies.name}</strong>.</p>
                                <p style={{ marginTop: 10 }}>Common resistance patterns for this organism group:</p>
                                <ul style={{ margin: '8px 0', paddingLeft: 16 }}>
                                  {selectedSpecies.group === 'gpc_cluster' && <li>Watch for MRSA in S. aureus; check cefoxitin disk test</li>}
                                  {selectedSpecies.group === 'gpc_chain' && <li>Penicillin resistance in S. pneumoniae; macrolide resistance</li>}
                                  {selectedSpecies.group === 'enterobacterales' && <li>ESBL and CRE increasingly common; carbapenem stewardship</li>}
                                  {selectedSpecies.group === 'nfb' && <li>CRAB (Acinetobacter) and CRPsA are critical WHO priority pathogens</li>}
                                </ul>
                              </div>
                            </InfoCard>
                          );
                        }
                        
                        return matched.map((m, i) => (
                          <div key={m.type}>
                            {i > 0 && <div style={{ height: 10 }} />}
                            <InfoCard title={`💊 ${m.type}: ${m.name}`} color={m.color}>
                              <div style={{ fontSize: 12, lineHeight: 1.7, marginTop: 8 }}>
                                <div style={{ marginBottom: 8 }}>
                                  <span style={{ color: '#64748b', fontWeight: 600 }}>Mechanism: </span>
                                  <span style={{ color: '#cbd5e1' }}>{m.mech}</span>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                  <span style={{ color: '#64748b', fontWeight: 600 }}>Detection: </span>
                                  <span style={{ color: '#cbd5e1' }}>{m.test}</span>
                                </div>
                                <div>
                                  <span style={{ color: '#64748b', fontWeight: 600 }}>Treatment: </span>
                                  <span style={{ color: '#22d3ee' }}>{m.treat}</span>
                                </div>
                              </div>
                            </InfoCard>
                          </div>
                        ));
                      })()}
                      <div style={{ height: 10 }} />
                      <InfoCard title="🧪 General Susceptibility Testing" color="#64748b">
                        <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.6, marginTop: 8 }}>
                          <p><strong>Disk Diffusion (Kirby-Bauer):</strong> Zone diameters interpreted per CLSI breakpoints</p>
                          <p style={{ marginTop: 6 }}><strong>MIC Testing:</strong> Broth microdilution gold standard; E-test alternative</p>
                          <p style={{ marginTop: 6 }}><strong>Automated Systems:</strong> VITEK, Phoenix, MicroScan</p>
                          <p style={{ marginTop: 6 }}><strong>Molecular:</strong> PCR for resistance genes (mecA, vanA, blaCTX-M, blaKPC, blaNDM)</p>
                        </div>
                      </InfoCard>
                    </div>
                  )}

                  {activeTab === 'notes' && (
                    <InfoCard title="📝 Clinical Notes & Key Points" color={groupColor}>
                      <p style={{ color: '#94a3b8', fontSize: 12, lineHeight: 1.8, marginTop: 8 }}>{selectedSpecies.notes}</p>
                    </InfoCard>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

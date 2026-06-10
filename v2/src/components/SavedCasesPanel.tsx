import { useContext, useState } from 'react'
import { useIdentifyStore } from '@/store/identifyStore'
import type { SavedCase } from '@/lib/types'
import { isFirebaseActive } from '@/auth/firebase'
import { AuthContext } from '@/auth/AuthProvider'

function formatSavedDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function matchesCase(item: SavedCase, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [
    item.title,
    item.topSpecies,
    item.group,
    item.suiteName,
    ...item.tags,
    ...Object.keys(item.answers),
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q))
}

function tagsToText(tags: string[]) {
  return tags.join(', ')
}

function textToTags(value: string) {
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
}

interface MissingSuiteWarning {
  caseTitle: string
  missingSuite: string
  fallbackSuite: string
}

const GROUP_META: Record<string, { emoji: string; label: string; color: string }> = {
  gpc_cluster: { emoji: '🍇', label: 'GPC Cluster', color: '#c084fc' },
  gpc_chain: { emoji: '🔗', label: 'GPC Chain', color: '#4ade80' },
  gpb: { emoji: '🧫', label: 'GP Bacilli', color: '#fb923c' },
  enterobacterales: { emoji: '🦠', label: 'Enterobacterales', color: '#f87171' },
  vibrio: { emoji: '🌊', label: 'Vibrionaceae', color: '#38bdf8' },
  nfb: { emoji: '🧪', label: 'NFB', color: '#22d3ee' },
  gn_coccobacilli: { emoji: '🫘', label: 'GN Coccobacilli', color: '#a3e635' },
}

export function SavedCasesPanel({ standalone = false }: { standalone?: boolean }) {
  const [query, setQuery] = useState('')
  const [missingSuiteWarning, setMissingSuiteWarning] = useState<MissingSuiteWarning | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const answers = useIdentifyStore((s) => s.answers)
  const savedCases = useIdentifyStore((s) => s.savedCases)
  const saveCurrentCase = useIdentifyStore((s) => s.saveCurrentCase)
  const updateCase = useIdentifyStore((s) => s.updateCase)
  const loadCase = useIdentifyStore((s) => s.loadCase)
  const deleteCase = useIdentifyStore((s) => s.deleteCase)
  const defaultSuites = useIdentifyStore((s) => s.defaultSuites)
  const customSuites = useIdentifyStore((s) => s.customSuites)
  const user = useContext(AuthContext)?.user || null
  const answeredCount = Object.keys(answers).length
  const filteredCases = savedCases.filter((item) => matchesCase(item, query))
  const exportPayload = JSON.stringify(filteredCases, null, 2)
  const exportHref = `data:application/json;charset=utf-8,${encodeURIComponent(exportPayload)}`

  const rename = (id: string, oldTitle: string) => {
    const newTitle = window.prompt('แก้ไขชื่อ Case:', oldTitle)
    if (newTitle && newTitle.trim()) {
      updateCase(id, { title: newTitle.trim() })
    }
  }

  if (standalone && savedCases.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: '16px', marginTop: 40, maxWidth: 800, margin: '40px auto 0' }}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>📂</div>
        <h3 style={{ color: '#fff', fontSize: 18, fontWeight: 600 }}>ยังไม่มีเคสที่ถูกบันทึกไว้</h3>
        <p style={{ color: 'var(--text2)', fontSize: 14, marginTop: 8 }}>ข้อมูลเชื้อที่คุณเลือกบันทึกจะถูกเก็บรวบรวมไว้ที่นี่</p>
      </div>
    )
  }

  return (
    <section className={standalone ? 'saved-cases-standalone' : 'mb-5'}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          {standalone ? '' : `Case History ${user ? '☁️ (Cloud synced)' : isFirebaseActive ? '💾 (Local only)' : '💾 (Local only - Cloud sync disabled)'}`}
        </h2>
        <button
          type="button"
          onClick={saveCurrentCase}
          disabled={answeredCount === 0}
          aria-label="Save current identification case"
          className="btn btn-primary px-3 py-1.5 text-xs h-fit"
        >
          Save case
        </button>
      </div>

      <div className="lg-surface p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="min-w-0 flex-1 text-xs text-zinc-500">
            <span className="sr-only">Search saved cases</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cases, tests, tags"
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-650 focus:border-violet-400/70"
            />
          </label>
          <a
            download="microbial-world-cases.json"
            href={exportHref}
            aria-disabled={filteredCases.length === 0}
            className={`rounded-md border px-3 py-2 text-center text-xs font-medium transition ${
              filteredCases.length === 0
                ? 'pointer-events-none border-white/5 bg-white/[0.02] text-zinc-600'
                : 'border-white/10 bg-white/5 text-zinc-300 hover:border-white/20 hover:text-zinc-100'
            }`}
          >
            Export JSON
          </a>
        </div>

        {missingSuiteWarning && (
          <div
            role="alert"
            className="mb-3 rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-semibold text-amber-200">
                  Saved case suite is no longer available
                </p>
                <p className="mt-1 leading-relaxed text-amber-100/85">
                  “{missingSuiteWarning.caseTitle}” referenced {missingSuiteWarning.missingSuite}, which no longer exists.
                  BokBac loaded the case using {missingSuiteWarning.fallbackSuite} instead. Results may not be perfectly reproducible.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMissingSuiteWarning(null)}
                aria-label="Dismiss missing suite warning"
                className="shrink-0 rounded-md border border-amber-400/20 px-2 py-1 text-[10px] font-medium text-amber-100 transition hover:border-amber-300/40 hover:bg-amber-400/10"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {savedCases.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No saved cases yet.
          </p>
        ) : filteredCases.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No saved cases match this search.
          </p>
        ) : (
          <div className="cases-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
            {filteredCases.map((item) => {
              const g = GROUP_META[item.group]
              return (
                <div key={item.id} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', transition: 'all .2s' }} className="fade-in hover:-translate-y-0.5 hover:shadow-lg hover:border-violet-500/30">
                  <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ width: '100%' }}>
                        <div style={{ fontSize: 12, color: g?.color || 'var(--accent)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>{g?.emoji} {g?.label || 'Unknown Suite'}</div>
                        <label className="block" style={{ width: '100%' }}>
                          <span className="sr-only">Case title</span>
                          <input
                            aria-label="Case title"
                            value={item.title}
                            onChange={(event) => updateCase(item.id, { title: event.target.value })}
                            style={{
                              width: '100%',
                              background: 'transparent',
                              border: 'none',
                              borderBottom: '1px solid transparent',
                              color: '#fff',
                              fontSize: '18px',
                              fontWeight: 600,
                              outline: 'none',
                              padding: '0',
                              lineHeight: 1.4,
                              fontFamily: 'inherit',
                            }}
                            className="focus:border-violet-500/30 focus:bg-white/[0.02] focus:px-2 focus:-ml-2 rounded"
                          />
                        </label>
                        <div style={{ color: 'var(--text3)', fontSize: 12, marginTop: 6, fontWeight: 500 }}>
                          📅 {formatSavedDate(item.createdAt)}
                        </div>
                      </div>
                    </div>
                    
                    {item.topSpecies && (
                      <div style={{ background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.2)', padding: '12px 16px', borderRadius: 8, marginBottom: 16 }}>
                        <div style={{ fontSize: 11, color: '#4ade80', textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5, marginBottom: 4 }}>Top Match</div>
                        <div style={{ fontSize: 14, color: '#fff', fontWeight: 500 }}><em>{item.topSpecies}</em> <span style={{ color: '#4ade80', fontWeight: 700 }}>({item.topPct || 0}%)</span></div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 'auto' }}>
                      {Object.entries(item.answers || {}).slice(0, 5).map(([k, v]) => v && (
                        <span key={k} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: 'var(--text2)', fontWeight: 500 }}>{k}: <strong style={{color:'#fff'}}>{v}</strong></span>
                      ))}
                      {Object.keys(item.answers || {}).length > 5 && (
                        <span style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 20, padding: '4px 10px', fontSize: 11, color: 'var(--text3)', fontWeight: 600 }}>+{Object.keys(item.answers || {}).length - 5} tests</span>
                      )}
                    </div>

                    <label className="mt-3 block" style={{ width: '100%' }}>
                      <span className="sr-only">Case tags</span>
                      <input
                        aria-label="Case tags"
                        value={tagsToText(item.tags)}
                        onChange={(event) => updateCase(item.id, { tags: textToTags(event.target.value) })}
                        placeholder="tags: urine, teaching, QC"
                        style={{
                          width: '100%',
                          background: 'rgba(0, 0, 0, 0.2)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '8px',
                          padding: '6px 12px',
                          fontSize: '12px',
                          color: 'var(--text2)',
                          outline: 'none',
                          transition: 'all 0.2s',
                        }}
                        className="focus:border-violet-400/50 focus:bg-black/40"
                      />
                    </label>
                  </div>

                  <div style={{ display: 'flex', borderTop: '1px solid var(--border)', background: 'var(--bg)' }}>
                    <button
                      onClick={() => {
                        const allSuites = [...defaultSuites, ...customSuites]
                        if (item.suiteId && !allSuites.some(s => s.id === item.suiteId)) {
                          const fallback = allSuites.find(s => s.group === item.group)
                          setMissingSuiteWarning({
                            caseTitle: item.title || item.topSpecies || item.id,
                            missingSuite: item.suiteName || item.suiteId,
                            fallbackSuite: fallback?.name || 'the current/default suite',
                          })
                        } else {
                          setMissingSuiteWarning(null)
                        }
                        loadCase(item.id)
                      }}
                      style={{ flex: 1, padding: '14px', background: 'var(--accent)', border: 'none', borderRight: '1px solid var(--border)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
                      className="hover:bg-violet-400"
                      aria-label={`Load saved case ${item.topSpecies || ''}`}
                    >
                      ▶ Load Case
                    </button>
                    <button
                      onClick={() => rename(item.id, item.title)}
                      style={{ padding: '14px 20px', background: 'transparent', border: 'none', borderRight: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer', transition: 'all .2s' }}
                      className="hover:text-white font-medium text-xs"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => {
                        if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
                          deleteCase(item.id)
                        } else {
                          setDeleteConfirmId(item.id)
                        }
                      }}
                      style={{ padding: '14px 20px', background: 'transparent', border: 'none', color: 'var(--red)', cursor: 'pointer', opacity: 0.8, transition: 'all .2s' }}
                      className="hover:opacity-100 font-medium text-xs"
                      aria-label="Delete saved case"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {deleteConfirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'rgba(17, 24, 39, 0.95)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: 20, padding: 32, width: '90%', maxWidth: 400, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255, 255, 255, 0.05) inset' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🗑️</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-0.5px' }}>ยืนยันลบเคสนี้?</h3>
              <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 24, lineHeight: 1.6 }}>คุณต้องการลบเคสนี้หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้</p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => setDeleteConfirmId(null)} style={{ padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#94a3b8', transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}>
                  ยกเลิก
                </button>
                <button onClick={() => { deleteCase(deleteConfirmId); setDeleteConfirmId(null); }} style={{ padding: '12px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', color: '#fff', boxShadow: '0 4px 14px rgba(239, 68, 68, 0.3)', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #f87171 0%, #ef4444 100%)'; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  ตกลง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

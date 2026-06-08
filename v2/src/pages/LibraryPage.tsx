import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getGroupMeta, getLibrarySpecies, GROUP_META, searchSpecies } from '@/lib/libraryCatalog'

function importanceTone(level?: string) {
  switch (level) {
    case 'critical':
      return 'border-rose-400/30 bg-rose-500/10 text-rose-200'
    case 'high':
      return 'border-orange-400/30 bg-orange-500/10 text-orange-200'
    case 'moderate':
      return 'border-amber-400/30 bg-amber-500/10 text-amber-200'
    default:
      return 'border-zinc-500/30 bg-zinc-500/10 text-zinc-300'
  }
}

export function LibraryPage() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState('all')

  const species = useMemo(() => getLibrarySpecies(), [])
  const filtered = useMemo(
    () =>
      species.filter((item) => {
        if (group !== 'all' && item.group !== group) return false
        return searchSpecies(item, query)
      }),
    [group, query, species],
  )

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl">
            คลังเชื้อแบคทีเรีย
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            Browse 157 species พร้อมข้อมูล gram stain, colony morphology, biochemical clues,
            และ clinical context เพื่อใช้คู่กับ workflow วินิจฉัย
          </p>
        </div>
        <div className="lg-surface flex w-full max-w-md flex-col gap-3 p-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Search
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ค้นหาชื่อเชื้อ, tag, test, media"
              className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/70"
            />
          </label>
          <p className="text-xs text-zinc-500">
            {filtered.length} / {species.length} species
          </p>
        </div>
      </header>

      <section className="mb-5">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setGroup('all')}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              group === 'all'
                ? 'border-violet-400 bg-violet-500/25 text-violet-100'
                : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
            }`}
          >
            ทั้งหมด
          </button>
          {GROUP_META.map((item) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setGroup(item.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                group === item.id
                  ? 'border-violet-400 bg-violet-500/25 text-violet-100'
                  : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
              }`}
            >
              <span className="mr-1">{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {filtered.length === 0 ? (
        <div className="lg-surface p-8 text-center text-sm text-zinc-500">
          ไม่พบ species ที่ตรงกับคำค้นนี้
        </div>
      ) : (
        <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => {
            const groupMeta = getGroupMeta(item.group)
            return (
              <Link
                key={item.id}
                to={`/library/${item.id}`}
                className="lg-surface group block p-4 transition hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-base font-semibold text-zinc-50 transition group-hover:text-white">
                        {item.name}
                      </h2>
                      {item.importance && (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${importanceTone(item.importance)}`}
                        >
                          {item.importance}
                        </span>
                      )}
                    </div>
                    {item.thai && (
                      <p className="mt-1 text-sm text-zinc-500">{item.thai}</p>
                    )}
                  </div>
                  <span className="text-xl">{groupMeta?.emoji || '🧫'}</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                  {item.gram && <span className="rounded-full bg-white/5 px-2 py-1">{item.gram}</span>}
                  {item.morph && <span className="rounded-full bg-white/5 px-2 py-1">{item.morph}</span>}
                  {groupMeta?.label && (
                    <span className="rounded-full bg-white/5 px-2 py-1">{groupMeta.label}</span>
                  )}
                </div>

                {item.tags && item.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.tags.slice(0, 4).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md border border-white/5 bg-black/20 px-2 py-1 text-[11px] text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <p className="mt-4 text-xs font-medium text-violet-300">
                  เปิดรายละเอียด species
                </p>
              </Link>
            )
          })}
        </section>
      )}
    </div>
  )
}

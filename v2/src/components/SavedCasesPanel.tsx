import { useState } from 'react'
import { useIdentifyStore } from '@/store/identifyStore'
import { ALL_SUITES } from '@/lib/dataLoader'
import type { SavedCase } from '@/lib/types'

function formatSavedDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
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

function matchesCase(item: SavedCase, query: string) {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return [
    item.title,
    item.topSpecies,
    item.group,
    ALL_SUITES[item.group]?.name,
    ...item.tags,
    ...Object.keys(item.answers),
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(q))
}

export function SavedCasesPanel() {
  const [query, setQuery] = useState('')
  const answers = useIdentifyStore((s) => s.answers)
  const savedCases = useIdentifyStore((s) => s.savedCases)
  const saveCurrentCase = useIdentifyStore((s) => s.saveCurrentCase)
  const updateCase = useIdentifyStore((s) => s.updateCase)
  const loadCase = useIdentifyStore((s) => s.loadCase)
  const deleteCase = useIdentifyStore((s) => s.deleteCase)
  const answeredCount = Object.keys(answers).length
  const filteredCases = savedCases.filter((item) => matchesCase(item, query))
  const exportPayload = JSON.stringify(filteredCases, null, 2)
  const exportHref = `data:application/json;charset=utf-8,${encodeURIComponent(exportPayload)}`

  return (
    <section className="mb-5">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Case History
        </h2>
        <button
          type="button"
          onClick={saveCurrentCase}
          disabled={answeredCount === 0}
          aria-label="Save current identification case"
          className="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-white/20 hover:text-zinc-100 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Save case
        </button>
      </div>

      <div className="lg-surface p-4">
        <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <label className="min-w-0 flex-1 text-xs text-zinc-500">
            <span className="sr-only">Search saved cases</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search cases, tests, tags"
              className="w-full rounded-md border border-white/10 bg-black/20 px-3 py-2 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-violet-400/70"
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

        {savedCases.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No saved cases yet.
          </p>
        ) : filteredCases.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No saved cases match this search.
          </p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {filteredCases.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-white/5 bg-white/[0.03] p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <label className="block">
                      <span className="sr-only">Case title</span>
                      <input
                        aria-label="Case title"
                        value={item.title}
                        onChange={(event) => updateCase(item.id, { title: event.target.value })}
                        className="w-full rounded-md border border-transparent bg-transparent px-0 py-0 text-sm font-semibold text-zinc-100 outline-none transition focus:border-white/10 focus:bg-black/20 focus:px-2 focus:py-1"
                      />
                    </label>
                    <p className="mt-1 truncate text-xs text-zinc-500">
                      {item.topSpecies || 'Unranked case'}
                      {typeof item.topPct === 'number' ? ` · ${item.topPct}%` : ''}
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {ALL_SUITES[item.group]?.name || item.group} · {Object.keys(item.answers).length} answers
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-600">
                      {formatSavedDate(item.createdAt)}
                    </p>
                    <label className="mt-2 block">
                      <span className="sr-only">Case tags</span>
                      <input
                        aria-label="Case tags"
                        value={tagsToText(item.tags)}
                        onChange={(event) => updateCase(item.id, { tags: textToTags(event.target.value) })}
                        placeholder="tags: urine, teaching, QC"
                        className="w-full rounded-md border border-white/5 bg-black/20 px-2 py-1 text-xs text-zinc-300 outline-none transition placeholder:text-zinc-700 focus:border-violet-400/70"
                      />
                    </label>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => loadCase(item.id)}
                      aria-label={`Load saved case ${item.topSpecies || item.id}`}
                      className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-xs text-zinc-300 hover:border-white/20 hover:text-zinc-100"
                    >
                      Load
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCase(item.id)}
                      aria-label={`Delete saved case ${item.topSpecies || item.id}`}
                      className="rounded-md border border-rose-500/20 bg-rose-500/10 px-2 py-1 text-xs text-rose-300 hover:border-rose-400/40"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

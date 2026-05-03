import { useIdentifyStore } from '@/store/identifyStore'
import { ALL_SUITES } from '@/lib/dataLoader'

function formatSavedDate(value: string) {
  return new Intl.DateTimeFormat('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function SavedCasesPanel() {
  const answers = useIdentifyStore((s) => s.answers)
  const savedCases = useIdentifyStore((s) => s.savedCases)
  const saveCurrentCase = useIdentifyStore((s) => s.saveCurrentCase)
  const loadCase = useIdentifyStore((s) => s.loadCase)
  const deleteCase = useIdentifyStore((s) => s.deleteCase)
  const answeredCount = Object.keys(answers).length

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
        {savedCases.length === 0 ? (
          <p className="text-sm text-zinc-500">
            No saved cases yet.
          </p>
        ) : (
          <div className="grid gap-2 md:grid-cols-2">
            {savedCases.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-white/5 bg-white/[0.03] p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-zinc-100">
                      {item.topSpecies || 'Unranked case'}
                      {typeof item.topPct === 'number' ? ` · ${item.topPct}%` : ''}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {ALL_SUITES[item.group]?.name || item.group} · {Object.keys(item.answers).length} answers
                    </p>
                    <p className="mt-0.5 text-xs text-zinc-600">
                      {formatSavedDate(item.createdAt)}
                    </p>
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

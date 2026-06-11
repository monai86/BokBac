import { Link, Navigate, useParams } from 'react-router-dom'
import { getGroupMeta, getSpeciesById } from '@/lib/libraryCatalog'

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

export function SpeciesDetailPage() {
  const { speciesId = '' } = useParams()
  const species = getSpeciesById(speciesId)

  if (!species) {
    return <Navigate to="/library" replace />
  }

  const groupMeta = getGroupMeta(species.group)
  const colony = toRecord(species.colony)
  const clinical = toRecord(species.clinical)
  const diseases = toList(clinical.diseases)

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
      <div className="mb-5">
        <Link to="/library" className="text-sm text-violet-300 hover:text-violet-200">
          ← กลับไปหน้าคลังเชื้อ
        </Link>
      </div>

      <header className="lg-surface p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
              {groupMeta && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                  {groupMeta.emoji} {groupMeta.label}
                </span>
              )}
              {species.importance && (
                <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 uppercase">
                  {species.importance}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-50 sm:text-3xl italic">
              {species.name}
            </h1>
            {species.thai && <p className="mt-1 text-sm text-zinc-400">{species.thai}</p>}
          </div>

          <div className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
            {species.gram && (
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                Gram: <span className="text-zinc-100">{species.gram}</span>
              </div>
            )}
            {species.morph && (
              <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                Morphology: <span className="text-zinc-100">{species.morph}</span>
              </div>
            )}
          </div>
        </div>

        {species.tags && species.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {species.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-violet-400/15 bg-violet-500/10 px-2 py-1 text-xs text-violet-200"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_0.9fr]">
        <section className="space-y-5">
          <article className="lg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Clinical Snapshot
            </h2>
            <div className="mt-3 space-y-3 text-sm leading-relaxed text-zinc-300">
              {toText(clinical.habitat) && (
                <p>
                  <span className="font-medium text-zinc-100">Habitat:</span> {toText(clinical.habitat)}
                </p>
              )}
              {diseases.length > 0 && (
                <div>
                  <p className="font-medium text-zinc-100">Common diseases</p>
                  <ul className="mt-2 space-y-1 text-zinc-300">
                    {diseases.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {toText(clinical.transmission) && (
                <p>
                  <span className="font-medium text-zinc-100">Transmission:</span>{' '}
                  {toText(clinical.transmission)}
                </p>
              )}
              {toText(clinical.factors) && (
                <p>
                  <span className="font-medium text-zinc-100">Virulence / notes:</span>{' '}
                  {toText(clinical.factors)}
                </p>
              )}
            </div>
          </article>

          <article className="lg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Biochemical Profile
            </h2>
            {species.biochem && species.biochem.length > 0 ? (
              <div className="mt-3 overflow-hidden rounded-2xl border border-white/10">
                <table className="min-w-full divide-y divide-white/10 text-sm">
                  <thead className="bg-white/[0.04] text-left text-xs uppercase tracking-wider text-zinc-500">
                    <tr>
                      <th className="px-3 py-2">Test</th>
                      <th className="px-3 py-2">Result</th>
                      <th className="px-3 py-2">Note</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {species.biochem.map((item) => (
                      <tr key={`${item.t}-${item.r}`} className="bg-black/10 text-zinc-300">
                        <td className="px-3 py-2 font-medium text-zinc-100">{item.t}</td>
                        <td className="px-3 py-2">{item.r}</td>
                        <td className="px-3 py-2 text-zinc-400">{item.n || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-500">ยังไม่มี biochemical profile สำหรับ species นี้</p>
            )}
          </article>
        </section>

        <aside className="space-y-5">
          <article className="lg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Gram Stain & Colony
            </h2>
            <div className="mt-3 space-y-3 text-sm text-zinc-300">
              {species.gramStain && <p>{species.gramStain}</p>}
              {Object.keys(colony).length > 0 && (
                <div className="space-y-2">
                  {Object.entries(colony).map(([medium, description]) => (
                    <div
                      key={medium}
                      className="rounded-xl border border-white/10 bg-black/20 px-3 py-2"
                    >
                      <p className="text-xs uppercase tracking-wider text-zinc-500">{medium}</p>
                      <p className="mt-1 text-sm text-zinc-200">{String(description)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </article>

          <article className="lg-surface p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Lab Workflow Notes
            </h2>
            <div className="mt-3 space-y-3 text-sm text-zinc-300">
              {species.media && species.media.length > 0 && (
                <div>
                  <p className="font-medium text-zinc-100">Suggested media</p>
                  <ul className="mt-2 space-y-1">
                    {species.media.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>
              )}
              {species.condition && (
                <p>
                  <span className="font-medium text-zinc-100">Incubation:</span> {species.condition}
                </p>
              )}
              {species.notes && (
                <p>
                  <span className="font-medium text-zinc-100">Interpretive note:</span> {species.notes}
                </p>
              )}
            </div>
          </article>
        </aside>
      </div>
    </div>
  )
}

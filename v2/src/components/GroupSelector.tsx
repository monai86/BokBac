import { useIdentifyStore } from '@/store/identifyStore'
import { ALL_SUITES } from '@/lib/dataLoader'

const GROUP_LABELS: Record<string, string> = {
  enterobacterales: 'Enterobacterales (GNR oxidase−)',
  nfb: 'Non-Fermenters (NFB, oxidase+)',
  vibrio: 'Vibrio / Aeromonas',
  gpc_cluster: 'GPC clusters (Staphylococcus)',
  gpc_chain: 'GPC chains (Strep / Enterococcus)',
  gpb: 'Gram+ Rods',
  gn_coccobacilli: 'GN diplococci / coccobacilli',
}

export function GroupSelector() {
  const group = useIdentifyStore((s) => s.group)
  const setGroup = useIdentifyStore((s) => s.setGroup)
  const groups = Object.keys(ALL_SUITES)

  return (
    <div className="flex flex-wrap gap-2">
      {groups.map((g) => (
        <button
          key={g}
          onClick={() => setGroup(g)}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            group === g
              ? 'border-violet-400 bg-violet-500/25 text-violet-100'
              : 'border-white/10 bg-white/5 text-zinc-400 hover:border-white/20 hover:text-zinc-200'
          }`}
        >
          {GROUP_LABELS[g] || g}
        </button>
      ))}
    </div>
  )
}

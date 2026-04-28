import { Link, NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'วินิจฉัย', emoji: '🔬' },
  { to: '/about', label: 'เกี่ยวกับ', emoji: 'ℹ️' },
]

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-bg/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-zinc-100 font-semibold">
            <span className="text-xl">🦠</span>
            <span className="hidden sm:inline">Microbial World</span>
            <span className="rounded-md border border-violet-500/40 bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
              v4-alpha
            </span>
          </Link>
          <nav className="flex gap-1">
            {NAV.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `rounded-full px-3 py-1.5 text-xs font-medium transition ${
                    isActive
                      ? 'bg-violet-500/20 text-violet-200'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5'
                  }`
                }
              >
                <span className="mr-1">{n.emoji}</span>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/5 py-4 text-center text-xs text-zinc-600">
        Microbial World v4 · MCM 11th · Cloudflare Pages
      </footer>
    </div>
  )
}

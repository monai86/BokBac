import { useEffect } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

const NAV = [
  { to: '/', label: 'วินิจฉัย', emoji: '🔬' },
  { to: '/specimen', label: 'ตัวอย่างตรวจ', emoji: '🧫' },
  { to: '/library', label: 'คลังเชื้อ', emoji: '📚' },
  { to: '/reference', label: 'คู่มือทดสอบ', emoji: '⚗️' },
  { to: '/about', label: 'เกี่ยวกับ', emoji: 'ℹ️' },
]

export function Layout() {
  // Activate Liquid Glass interactive effects (mouse tracking + tilt)
  useEffect(() => {
    const container = document.body
    const handlers = new Map<HTMLElement, { onMove: (e: MouseEvent) => void; onLeave: () => void }>()

    const attach = (el: HTMLElement) => {
      if (handlers.has(el)) return
      const specular = el.querySelector(':scope > .lg-specular') as HTMLElement | null

      const onMove = (e: MouseEvent) => {
        const rect = el.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        const cx = rect.width / 2
        const cy = rect.height / 2

        if (specular) {
          specular.style.left = x + 'px'
          specular.style.top = y + 'px'
        }

        const maxTilt = 2
        const rx = ((y - cy) / cy) * -maxTilt
        const ry = ((x - cx) / cx) * maxTilt
        el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.005, 1.005, 1.005)`
        el.style.transition = 'transform 0.1s ease-out'

        const angle = Math.atan2(y - cy, x - cx) * (180 / Math.PI) + 135
        el.style.setProperty('--lg-border-angle', angle + 'deg')
      }

      const onLeave = () => {
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
        el.style.transition = 'transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)'
        el.style.setProperty('--lg-border-angle', '135deg')
      }

      el.addEventListener('mousemove', onMove)
      el.addEventListener('mouseleave', onLeave)
      handlers.set(el, { onMove, onLeave })
    }

    const detach = (el: HTMLElement) => {
      const h = handlers.get(el)
      if (!h) return
      el.removeEventListener('mousemove', h.onMove)
      el.removeEventListener('mouseleave', h.onLeave)
      handlers.delete(el)
    }

    // Initial scan
    container.querySelectorAll<HTMLElement>('.lg-surface').forEach(attach)

    // Observe future additions/removals
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          const el = node as HTMLElement
          if (el.classList && el.classList.contains('lg-surface')) attach(el)
          if (el.querySelectorAll) el.querySelectorAll<HTMLElement>('.lg-surface').forEach(attach)
        })
        m.removedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          const el = node as HTMLElement
          if (handlers.has(el)) detach(el)
          if (el.querySelectorAll) el.querySelectorAll<HTMLElement>('.lg-surface').forEach(detach)
        })
      })
    })

    observer.observe(container, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      handlers.forEach((h, el) => {
        el.removeEventListener('mousemove', h.onMove)
        el.removeEventListener('mouseleave', h.onLeave)
      })
      handlers.clear()
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-20 border-b-2 border-transparent bg-bg/85 backdrop-blur-xl" style={{ borderImage: 'linear-gradient(90deg, #7c3aed, #C9A84C, #06b6d4) 1' }}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link to="/" className="flex items-center gap-2 text-zinc-100 font-semibold">
            <span className="text-xl">🦠</span>
            <span className="hidden sm:inline">Microbial World</span>
            <span className="rounded-md border border-violet-500/40 bg-violet-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-violet-300">
              v4.0.0
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
                      ? 'bg-violet-500/20 text-violet-200 border border-violet-500/40 nav-glow-pulse'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/5 border border-transparent'
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

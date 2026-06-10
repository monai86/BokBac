import { useEffect } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useIdentifyStore } from '@/store/identifyStore'
import { AuthModal } from './AuthModal'

const NAV = [
  { to: '/', label: 'วินิจฉัย', emoji: '🔬', short: '🔬 วินิจฉัย' },
  { to: '/specimen', label: 'ตัวอย่างตรวจ', emoji: '🧫', short: '🧫 ตัวอย่าง' },
  { to: '/library', label: 'คลังเชื้อ', emoji: '📚', short: '📚 คลัง' },
  { to: '/reference', label: 'คู่มือทดสอบ', emoji: '⚗️', short: '⚗️ Tests' },
  { to: '/settings', label: 'ตั้งค่า', emoji: '⚙️', short: '⚙️' },
  { to: '/about', label: 'เกี่ยวกับ', emoji: 'ℹ️', short: 'ℹ️' },
]

export function Layout() {
  const initAuthListener = useIdentifyStore((s) => s.initAuthListener)
  const user = useIdentifyStore((s) => s.user)
  const isGuest = useIdentifyStore((s) => s.isGuest)
  const loadingAuth = useIdentifyStore((s) => s.loadingAuth)
  const logout = useIdentifyStore((s) => s.logout)
  const setGuest = useIdentifyStore((s) => s.setGuest)

  useEffect(() => {
    initAuthListener()
  }, [initAuthListener])

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

  if (loadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#030712] text-zinc-400">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide">กำลังตรวจสอบระบบ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      {!user && !isGuest && <AuthModal />}
      <header className="nav-bar">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 w-full px-4 sm:px-6">
          <Link to="/" className="brand">
            <span className="emoji">🦠</span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800 }}>BOK BAC</div>
              <div style={{ fontSize: '8px', color: '#a78bfa', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginTop: '-2px', WebkitTextFillColor: 'initial' }}>DIAGNOSTIC ENGINE</div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <nav className="flex gap-1 items-center">
              {NAV.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  className={({ isActive }) =>
                    `nav-tab ${isActive ? 'active-tab' : ''}`
                  }
                >
                  <span className="nav-label-full">
                    <span className="mr-1">{n.emoji}</span>
                    {n.label}
                  </span>
                  <span className="nav-label-short">{n.short}</span>
                </NavLink>
              ))}
            </nav>
            <div className="flex items-center gap-2 text-xs border-l border-white/10 pl-4">
              {user ? (
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center font-bold text-white shadow-md border border-white/10 select-none">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <span className="hidden md:inline text-zinc-300 font-medium max-w-[80px] truncate">{user.displayName || 'Doctor'}</span>
                  <button onClick={logout} className="px-2.5 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-semibold hover:bg-red-500/20 transition">
                    ออก
                  </button>
                </div>
              ) : (
                <button onClick={() => setGuest(false)} className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold hover:scale-[1.02] active:scale-[0.98] transition">
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
          </div>
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

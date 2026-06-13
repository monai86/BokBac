import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '@/auth/useAuth'

const NAV = [
  { to: '/specimen', label: 'ตัวอย่างตรวจ', emoji: '🧫', short: '🧫 ตัวอย่าง' },
  { to: '/', label: 'จำแนกชนิด', emoji: '🔬', short: '🔬 จำแนกชนิด' },
  { to: '/cases', label: 'Case ที่บันทึก', emoji: '💾', short: '💾 Case' },
  { to: '/library', label: 'คลังเชื้อ', emoji: '📚', short: '📚 คลัง' },
  { to: '/reference', label: 'การทดสอบ', emoji: '⚗️', short: '⚗️ Tests' },
  { to: '/suites', label: 'Test Suites', emoji: '📊', short: '📊 Suites' },
  { to: '/settings', label: 'ตั้งค่า', emoji: '⚙️', short: '⚙️' },
]

export function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false)

  // Activate Liquid Glass interactive effects (mouse tracking + tilt)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const container = document.body
    const handlers = new Map<HTMLElement, { onMove: (e: MouseEvent) => void; onLeave: () => void }>()

    const attach = (el: HTMLElement) => {
      if (handlers.has(el)) return
      if (!el.classList.contains('lg-interactive')) return
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

        const maxTilt = 0.75
        const rx = ((y - cy) / cy) * -maxTilt
        const ry = ((x - cx) / cx) * maxTilt
        el.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.002, 1.002, 1.002)`
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
    container.querySelectorAll<HTMLElement>('.lg-surface.lg-interactive').forEach(attach)

    // Observe future additions/removals
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        m.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          const el = node as HTMLElement
          if (el.classList && el.classList.contains('lg-surface')) attach(el)
          if (el.querySelectorAll) el.querySelectorAll<HTMLElement>('.lg-surface.lg-interactive').forEach(attach)
        })
        m.removedNodes.forEach((node) => {
          if (node.nodeType !== 1) return
          const el = node as HTMLElement
          if (handlers.has(el)) detach(el)
          if (el.querySelectorAll) el.querySelectorAll<HTMLElement>('.lg-surface.lg-interactive').forEach(detach)
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

  useEffect(() => {
    setIsMobileNavOpen(false)
  }, [location.pathname])

  if (location.pathname === '/login') {
    return <Outlet />
  }

  return (
    <div className="min-h-screen flex flex-col app-shell">
      <header className="nav-bar">
        <Link to="/" className="brand">
          <span className="emoji">🦠</span>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 800 }}>BOK BAC</div>
            <div style={{ fontSize: '8px', color: '#a78bfa', letterSpacing: '2px', textTransform: 'uppercase', fontWeight: 600, marginTop: '-2px', WebkitTextFillColor: 'initial' }}>IDENTIFICATION ASSISTANT</div>
          </div>
        </Link>
        <button
          type="button"
          className="nav-menu-button"
          aria-label={isMobileNavOpen ? 'ปิดเมนูนำทาง' : 'เปิดเมนูนำทาง'}
          aria-expanded={isMobileNavOpen}
          onClick={() => setIsMobileNavOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
        <nav className={`app-nav-scroll ${isMobileNavOpen ? 'is-open' : ''}`}>
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
        <div className="nav-user">
          {user ? (
            <>
              <div className="nav-avatar">{user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}</div>
              <span className="nav-username hidden md:inline max-w-[80px] truncate">{user.displayName || 'Doctor'}</span>
              <button onClick={logout} className="nav-signout">
                ออกจากระบบ
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-ghost" style={{ padding: '8px 16px', fontSize: '12px' }}>
              เข้าสู่ระบบ
            </Link>
          )}
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  )
}

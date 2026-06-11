type LoadingSplashProps = {
  label?: string
  compact?: boolean
}

export function LoadingSplash({ label = 'กำลังเตรียมระบบ...', compact = false }: LoadingSplashProps) {
  return (
    <div className={compact ? 'loading-splash compact' : 'loading-splash'} role="status" aria-live="polite">
      <div className="loading-culture" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p>{label}</p>
    </div>
  )
}

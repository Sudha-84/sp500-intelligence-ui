// ── SignalPill ────────────────────────────────────────────────────────────────
export function SignalPill({
  signal,
  size = 'sm',
}: {
  signal: string
  size?: 'xs' | 'sm' | 'md'
}) {
  const sizeClasses = {
    xs: 'text-[9px] px-1.5 py-0.5',
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }

  const styles: Record<string, { bg: string; color: string }> = {
    BULLISH: { bg: 'var(--col-bull-glow)',          color: 'var(--col-bull)'    },
    BEARISH: { bg: 'var(--col-bear-glow)',          color: 'var(--col-bear)'    },
    NEUTRAL: { bg: 'rgba(107,114,128,0.15)',        color: 'var(--col-neutral)' },
  }

  const s = styles[signal?.toUpperCase()] ?? styles['NEUTRAL']

  return (
    <span
      className={`inline-block rounded-full font-semibold ${sizeClasses[size]}`}
      style={{ background: s.bg, color: s.color }}
    >
      {signal?.charAt(0) + signal?.slice(1).toLowerCase()}
    </span>
  )
}

// ── MetricCard ────────────────────────────────────────────────────────────────
export function MetricCard({
  label,
  value,
  sub,
  valueColor,
  valueSize = 'text-2xl',
  icon,
}: {
  label:       string
  value:       string | number
  sub?:        string
  valueColor?: string
  valueSize?:  string
  icon?:       React.ReactNode
}) {
  return (
    <div
      className="rounded-xl p-4 space-y-1"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</div>
        {icon && <div style={{ color: 'var(--text-muted)' }}>{icon}</div>}
      </div>
      <div
        className={`font-display font-medium tabular ${valueSize}`}
        style={{ color: valueColor ?? 'var(--text-primary)' }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{sub}</div>
      )}
    </div>
  )
}

// ── ConfidenceBar ─────────────────────────────────────────────────────────────
export function ConfidenceBar({
  value,
  signal,
  className = '',
}: {
  value:     number
  signal?:   string
  className?: string
}) {
  const color =
    signal === 'BULLISH' ? 'var(--col-bull)' :
    signal === 'BEARISH' ? 'var(--col-bear)' :
    'var(--col-neutral)'

  return (
    <div
      className={`h-1.5 rounded-full overflow-hidden ${className}`}
      style={{ background: 'var(--surface-4)', flex: 1 }}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(value, 100)}%`, background: color }}
      />
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="animate-spin"
      style={{ color: 'var(--accent)' }}
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" opacity="0.2" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" />
    </svg>
  )
}

// ── EmptyState ────────────────────────────────────────────────────────────────
export function EmptyState({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl py-16 text-center"
      style={{
        background: 'var(--surface-2)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div className="text-3xl mb-3">📭</div>
      <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>{message}</div>
    </div>
  )
}

// ── LoadingScreen ─────────────────────────────────────────────────────────────
export function LoadingScreen() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ background: 'var(--surface-0)' }}
    >
      <Spinner size={32} />
      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Loading SP500 Intelligence…
      </div>
    </div>
  )
}

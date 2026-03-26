'use client'

const TIER_COLORS: Record<string, string> = {
  HOT:  '#ef4444',
  WARM: '#f59e0b',
  COLD: '#3b82f6',
  SKIP: '#52525b',
}

export function ScoreRing({ score, tier, size = 64 }: { score: number; tier: string; size?: number }) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const pct = Math.min(Math.max(score, 0), 100)
  const offset = circumference - (pct / 100) * circumference
  const color = TIER_COLORS[tier] ?? '#52525b'
  const cx = size / 2
  const strokeW = size > 56 ? 4 : 3

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={cx} cy={cx} r={radius}
          fill="none" stroke="#27272a" strokeWidth={strokeW}
        />
        <circle
          cx={cx} cy={cx} r={radius}
          fill="none" stroke={color} strokeWidth={strokeW}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-bold text-zinc-100 leading-none" style={{ fontSize: size > 56 ? 13 : 11 }}>
          {pct.toFixed(0)}
        </span>
        <span className="text-zinc-600 leading-none mt-0.5" style={{ fontSize: size > 56 ? 8 : 7 }}>
          /100
        </span>
      </div>
    </div>
  )
}

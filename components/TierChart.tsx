'use client'

interface TierData {
  label: string
  count: number
  color: string
  textColor: string
}

interface Props {
  total: number
  tiers: TierData[]
}

export function TierChart({ total, tiers }: Props) {
  // Donut chart via SVG
  const size = 140
  const strokeWidth = 18
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Build segments
  let offset = 0
  const segments = tiers
    .filter(t => t.count > 0)
    .map(t => {
      const pct = total > 0 ? t.count / total : 0
      const dash = pct * circumference
      const gap = circumference - dash
      const seg = { ...t, pct, dash, gap, offset }
      offset += dash
      return seg
    })

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 flex items-center gap-6">
      {/* Donut */}
      <div className="relative shrink-0">
        <svg width={size} height={size} className="-rotate-90">
          {/* Background track */}
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgb(39 39 42)" strokeWidth={strokeWidth}
          />
          {/* Segments */}
          {segments.map((seg, i) => (
            <circle
              key={seg.label}
              cx={size / 2} cy={size / 2} r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          ))}
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-zinc-100">{total}</span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Districts</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5 flex-1">
        {tiers.map(t => {
          const pct = total > 0 ? Math.round((t.count / total) * 100) : 0
          return (
            <div key={t.label} className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-sm font-semibold ${t.textColor}`}>{t.label}</span>
                  <span className="text-xs text-zinc-500">{t.count} ({pct}%)</span>
                </div>
                {/* Mini bar */}
                <div className="h-1 bg-zinc-800 rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: t.color }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import clsx from 'clsx'

const TIER_CONFIG = {
  HOT:  { label: 'HOT',  bg: 'bg-red-500/15',   text: 'text-red-400',   border: 'border-red-500/30',   dot: 'bg-red-400' },
  WARM: { label: 'WARM', bg: 'bg-amber-500/15',  text: 'text-amber-400', border: 'border-amber-500/30', dot: 'bg-amber-400' },
  COLD: { label: 'COLD', bg: 'bg-purple-500/10',  text: 'text-purple-300', border: 'border-purple-500/25', dot: 'bg-purple-300' },
  SKIP: { label: 'SKIP', bg: 'bg-zinc-700/30',   text: 'text-zinc-500',  border: 'border-zinc-700/40',  dot: 'bg-zinc-600' },
}

export function TierBadge({ tier, size = 'sm' }: { tier: string; size?: 'sm' | 'md' }) {
  const cfg = TIER_CONFIG[tier as keyof typeof TIER_CONFIG] ?? TIER_CONFIG.SKIP
  return (
    <span className={clsx(
      'inline-flex items-center gap-1.5 font-mono font-semibold rounded-full border tracking-wider',
      cfg.bg, cfg.text, cfg.border,
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1'
    )}>
      <span className={clsx('w-1.5 h-1.5 rounded-full', cfg.dot)} />
      {cfg.label}
    </span>
  )
}

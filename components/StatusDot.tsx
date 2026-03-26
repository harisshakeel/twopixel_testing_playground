import clsx from 'clsx'

const STATUS = {
  processed:  { label: 'Processed',     color: 'bg-emerald-400' },
  done:       { label: 'Done',           color: 'bg-emerald-400' },
  competitor: { label: 'Competitor',     color: 'bg-orange-400' },
  sensitive:  { label: 'Sensitive',      color: 'bg-red-400' },
  error:      { label: 'Error',          color: 'bg-red-500' },
  skipped:    { label: 'Skipped',        color: 'bg-zinc-600' },
  scraping:   { label: 'Scraping…',      color: 'bg-purple-400 animate-pulse' },
  enriching:  { label: 'Enriching…',     color: 'bg-purple-400 animate-pulse' },
  scoring:    { label: 'Scoring…',       color: 'bg-violet-400 animate-pulse' },
  strategy:   { label: 'Strategy…',      color: 'bg-purple-400 animate-pulse' },
  pending:    { label: 'Pending',        color: 'bg-zinc-700' },
}

export function StatusDot({ status }: { status: string }) {
  const cfg = STATUS[status as keyof typeof STATUS] ?? { label: status, color: 'bg-zinc-600' }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
      <span className={clsx('w-1.5 h-1.5 rounded-full flex-shrink-0', cfg.color)} />
      {cfg.label}
    </span>
  )
}

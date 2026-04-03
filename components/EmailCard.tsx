'use client'
import { useState } from 'react'
import { ChevronDown, Calendar } from 'lucide-react'
import clsx from 'clsx'
import type { StrategyEmail } from '@/lib/pipeline'

function getSubject(email: StrategyEmail): string {
  if (email.subject_line) return email.subject_line
  if (email.subject_lines) {
    return email.subject_lines.A ?? email.subject_lines.B ?? email.subject_lines.C ?? '—'
  }
  return '—'
}

function getSendDay(email: StrategyEmail): string {
  const d = email.send_day
  if (!d || d === 0 || d === '0') return 'Day 1'
  if (typeof d === 'string' && d.startsWith('Day')) return d
  return `Day ${d}`
}

export function EmailCard({ email, index }: { email: StrategyEmail; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const num = email.email_number ?? email.number ?? (index + 1)

  return (
    <div className={clsx(
      'rounded-xl border transition-all duration-200 border-zinc-700 bg-zinc-800/20',
      open && 'shadow-lg'
    )}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <span className="text-xs font-bold text-zinc-300">{num}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Email {num}</span>
            <span className="text-zinc-700">·</span>
            <span className="inline-flex items-center gap-1 text-xs text-zinc-600">
              <Calendar className="w-3 h-3" />
              {getSendDay(email)}
            </span>
          </div>
          <p className="text-sm font-medium text-zinc-200 truncate">
            {getSubject(email)}
          </p>
        </div>

        <ChevronDown className={clsx('w-4 h-4 text-zinc-600 flex-shrink-0 transition-transform', open && 'rotate-180')} />
      </button>

      {/* Body */}
      {open && (
        <div className="px-5 pb-5 border-t border-zinc-800/60">
          <div className="mt-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Email Body</p>
            <div className="bg-zinc-900/60 rounded-lg p-4 border border-zinc-800">
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">
                {email.body}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'
import { useState } from 'react'
import { ChevronDown, Calendar } from 'lucide-react'
import clsx from 'clsx'
import type { StrategyEmail } from '@/lib/pipeline'

const EMAIL_TYPE_LABELS: Record<string, string> = {
  cold_open:     'Awareness · Research',
  value_bridge:  'Value Add',
  evidence_share:'Social Proof',
  urgency_nudge: 'Timing · Urgency',
  breakup:       'Breakup · Permission',
}

const EMAIL_TYPE_COLORS: Record<string, string> = {
  cold_open:     'border-purple-500/40 bg-purple-500/5',
  value_bridge:  'border-violet-500/40 bg-violet-500/5',
  evidence_share:'border-purple-400/40 bg-purple-400/5',
  urgency_nudge: 'border-amber-500/40 bg-amber-500/5',
  breakup:       'border-zinc-600/60 bg-zinc-800/20',
}

function getSubject(email: StrategyEmail): string {
  if (email.subject_line) return email.subject_line
  if (email.subject_lines) {
    return email.subject_lines.A ?? email.subject_lines.B ?? email.subject_lines.C ?? '—'
  }
  return '—'
}

function getSendDay(email: StrategyEmail): string {
  const d = email.send_day
  if (d === 0 || d === '0') return 'Day 1'
  return `Day ${d}`
}

export function EmailCard({ email, index }: { email: StrategyEmail; index: number }) {
  const [open, setOpen] = useState(index === 0)
  const typeKey = email.type ?? ''
  const typeLabel = EMAIL_TYPE_LABELS[typeKey] ?? email.name ?? email.type ?? `Email ${index + 1}`
  const colorClass = EMAIL_TYPE_COLORS[typeKey] ?? 'border-zinc-700 bg-zinc-800/20'

  const num = email.email_number ?? email.number ?? (index + 1)

  return (
    <div className={clsx('rounded-xl border transition-all duration-200', colorClass, open ? 'shadow-lg' : '')}>
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        {/* Number circle */}
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
          <span className="text-xs font-bold text-zinc-300">{num}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{typeLabel}</span>
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
          {/* All subject line variants */}
          {email.subject_lines && Object.keys(email.subject_lines).length > 1 && (
            <div className="mt-4 mb-4 space-y-1.5">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Subject Lines</p>
              {Object.entries(email.subject_lines).map(([variant, line]) => line ? (
                <div key={variant} className="flex items-start gap-2">
                  <span className="flex-shrink-0 text-xs font-mono bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">{variant}</span>
                  <span className="text-sm text-zinc-300">{line}</span>
                </div>
              ) : null)}
            </div>
          )}

          {/* Body */}
          <div className="mt-4">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Email Body</p>
            <div className="bg-zinc-900/60 rounded-lg p-4 border border-zinc-800">
              <pre className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed font-sans">
                {email.body}
              </pre>
            </div>
          </div>

          {/* CTA */}
          {email.cta && (
            <div className="mt-4 flex items-start gap-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider shrink-0 mt-0.5">CTA</span>
              <p className="text-sm text-purple-400">{email.cta}</p>
            </div>
          )}

          {/* PS */}
          {email.ps_line && (
            <p className="mt-3 text-sm text-zinc-500 italic">{email.ps_line}</p>
          )}

        </div>
      )}
    </div>
  )
}

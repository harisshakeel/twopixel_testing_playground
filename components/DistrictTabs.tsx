'use client'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { EmailCard } from '@/components/EmailCard'
import { ContactsTable } from '@/components/ContactsTable'
import { BookOpen, Mail, Target, Users, ShieldAlert } from 'lucide-react'
import type { StrategyEmail, Contact, CompetitorAnalysis } from '@/lib/pipeline'

type TabId = 'intel' | 'contacts' | 'strategy' | 'emails'


// ─── Intel Brief renderer (react-markdown) ──────────────────────────────────

function IntelBrief({ md }: { md: string }) {
  return (
    <div className="prose-intel">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-lg font-bold text-zinc-100 mb-4 pb-2 border-b border-zinc-700">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-8 mb-3 pb-1 border-b border-zinc-800/60">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider pt-3 pb-1">{children}</h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-zinc-300 leading-relaxed mb-3">{children}</p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-zinc-100">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-zinc-400">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="space-y-1 mb-3">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="space-y-1 mb-3 list-decimal list-inside">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500/60 mt-2 shrink-0" />
              <span className="text-sm text-zinc-300 leading-relaxed">{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-purple-500/50 pl-3 my-2 text-sm text-zinc-300 italic">{children}</blockquote>
          ),
          hr: () => <hr className="border-zinc-800 my-4" />,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 underline underline-offset-2">{children}</a>
          ),
          table: ({ children }) => (
            <div className="rounded-xl border border-zinc-800 overflow-hidden mb-3">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="border-b border-zinc-800 bg-zinc-900/60">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-2 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-2.5 text-sm text-zinc-200 align-top">{children}</td>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-zinc-800/40 last:border-0">{children}</tr>
          ),
        }}
      >
        {md}
      </ReactMarkdown>
    </div>
  )
}

// ─── SAP table renderer ───────────────────────────────────────────────────────

function SAPTable({ md }: { md: string }) {
  const lines = md.split('\n').filter(l => l.trim())
  const tableLines = lines.filter(l => l.trim().startsWith('|'))
  const nonTableLines = lines.filter(l => !l.trim().startsWith('|'))

  const parseRow = (line: string) =>
    line.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)

  const rows = tableLines.filter(l => !l.match(/^\|[-\s|]+\|$/))
  const [headerRow, ...dataRows] = rows
  const headers = headerRow ? parseRow(headerRow) : []
  const data = dataRows.map(parseRow)

  return (
    <div className="space-y-4">
      {nonTableLines.length > 0 && (
        <p className="text-xs text-zinc-500">{nonTableLines.join(' ')}</p>
      )}
      {headers.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-zinc-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/60">
                {headers.map((h, i) => (
                  <th key={i} className="px-4 py-3 text-left text-xs font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, ri) => (
                <tr key={ri} className="border-b border-zinc-800/50 last:border-0 hover:bg-zinc-900/30 transition-colors">
                  {row.map((cell, ci) => (
                    <td key={ci} className={`px-4 py-3 text-sm align-top leading-relaxed ${ci === 0 ? 'font-medium text-zinc-200 w-1/4' : ci === 1 ? 'text-zinc-400 w-1/4' : 'text-zinc-300 w-1/2'}`}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

interface Props {
  intelBrief: string | null
  strategy: { primary_contact?: { name?: string; title?: string; email?: string }; secondary_contact?: { name?: string; title?: string; email?: string } | null } | null
  sapDoc: string | null
  emails: StrategyEmail[]
  contacts: Contact[]
  status: string
  competitor: string | null
  competitorAnalysis: CompetitorAnalysis[]
}

function SkippedState({ icon: Icon, reason }: { icon: React.FC<{ className?: string }>; reason: string }) {
  return (
    <div className="bg-zinc-900/50 border border-orange-500/20 rounded-2xl p-12 text-center">
      <Icon className="w-8 h-8 text-orange-400/60 mx-auto mb-3" />
      <p className="text-sm text-zinc-400">{reason}</p>
    </div>
  )
}

function CompetitorEvidence({ analysis }: { analysis: CompetitorAnalysis[] }) {
  if (!analysis.length) return null
  return (
    <div className="mt-4 bg-zinc-900/50 border border-orange-500/20 rounded-xl p-4 space-y-3">
      <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Competitor Evidence</p>
      {analysis.map((c, i) => (
        <div key={i} className="text-sm space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-200">{c.name}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded ${
              c.status === 'active' ? 'bg-red-500/15 text-red-400' :
              c.status === 'evaluating' ? 'bg-amber-500/15 text-amber-400' :
              'bg-zinc-800 text-zinc-500'
            }`}>{c.status}</span>
          </div>
          {c.evidence && <p className="text-zinc-400 text-xs leading-relaxed">{c.evidence}</p>}
          {c.used_for && <p className="text-zinc-500 text-xs">Used for: {c.used_for}</p>}
        </div>
      ))}
    </div>
  )
}

export function DistrictTabs({
  intelBrief, strategy, sapDoc, emails, contacts,
  status, competitor, competitorAnalysis,
}: Props) {
  const [tab, setTab] = useState<TabId>('intel')

  const isSkipped = status === 'competitor' || status === 'sensitive'
  const skipReason = status === 'competitor'
    ? `Competitor detected (${competitor}) — intel skipped.`
    : status === 'sensitive'
    ? 'District flagged sensitive — outreach skipped.'
    : ''

  const tabs: { id: TabId; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'intel',    label: 'Intel Brief', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'contacts', label: 'Contacts',    icon: <Users className="w-3.5 h-3.5" />, count: contacts.length },
    { id: 'strategy', label: 'Strategy',    icon: <Target className="w-3.5 h-3.5" /> },
    { id: 'emails',   label: 'Emails',      icon: <Mail className="w-3.5 h-3.5" />, count: emails.length },
  ]

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 mb-6 border-b border-zinc-800 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`
              inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap
              ${tab === t.id
                ? 'border-purple-500 text-zinc-100'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'}
            `}
          >
            {t.icon}
            {t.label}
            {t.count !== undefined && t.count > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${tab === t.id ? 'bg-purple-500/20 text-purple-300' : 'bg-zinc-800 text-zinc-500'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Intel tab ──────────────────────────────────────────────────────── */}
      {tab === 'intel' && (
        <div>
          {isSkipped ? (
            <>
              <SkippedState icon={ShieldAlert} reason={skipReason} />
              <CompetitorEvidence analysis={competitorAnalysis} />
            </>
          ) : intelBrief ? (
            <IntelBrief md={intelBrief} />
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
              <BookOpen className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-600">No intelligence brief generated yet.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Contacts tab ───────────────────────────────────────────────────── */}
      {tab === 'contacts' && (
        <div>
          {contacts.length > 0 ? (
            <ContactsTable contacts={contacts} />
          ) : (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
              <Users className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-600">
                {isSkipped ? `${skipReason.replace(' — intel skipped.', '').replace(' — outreach skipped.', '')} — no contacts extracted.` : 'No contacts extracted yet.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Strategy tab ───────────────────────────────────────────────────── */}
      {tab === 'strategy' && (
        <div>
          {isSkipped ? (
            <SkippedState icon={ShieldAlert} reason={skipReason.replace('intel', 'strategy')} />
          ) : !sapDoc ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
              <Target className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-600">No strategy generated yet.</p>
            </div>
          ) : (
            <SAPTable md={sapDoc} />
          )}
        </div>
      )}

      {/* ── Emails tab ─────────────────────────────────────────────────────── */}
      {tab === 'emails' && (
        <div>
          {isSkipped || emails.length === 0 ? (
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
              <Mail className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-600">
                {status === 'competitor' ? `Competitor detected (${competitor}) — no emails generated.` :
                 status === 'sensitive'  ? 'District flagged sensitive — no outreach.' :
                 'Run the pipeline to completion to generate emails.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {emails.map((email, i) => (
                <EmailCard key={i} email={email} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

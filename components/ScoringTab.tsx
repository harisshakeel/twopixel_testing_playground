'use client'
import { BarChart3, Award, Plus } from 'lucide-react'
import { TierBadge } from '@/components/TierBadge'
import { ScoreRing } from '@/components/ScoreRing'
import type { ScoringResult } from '@/lib/pipeline'

interface Props {
  scoring: ScoringResult | null
  status: string
}

export function ScoringTab({ scoring, status }: Props) {
  if (!scoring) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
        <BarChart3 className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-600">
          {status === 'competitor' || status === 'sensitive'
            ? 'District was skipped — no scoring performed.'
            : 'No scoring data available. Run the pipeline through Stage 7.'}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Score overview */}
      <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-6 flex items-center gap-8">
        <ScoreRing score={scoring.normalized_score} tier={scoring.tier} size={80} />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl font-bold text-zinc-100">{scoring.normalized_score}</span>
            <span className="text-lg text-zinc-600">/100</span>
            <TierBadge tier={scoring.tier} size="sm" />
          </div>
          <p className="text-xs text-zinc-500">
            Raw score: {scoring.raw_score.toFixed(1)} | {scoring.matched_signals.length} signals matched
          </p>
        </div>
      </div>

      {/* Signal matches */}
      {scoring.matched_signals.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-3">Matched Signals</p>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 bg-zinc-900/60">
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">#</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Weight</th>
                  <th className="px-4 py-2.5 text-left text-xs font-bold text-zinc-500 uppercase tracking-wider">Keywords</th>
                </tr>
              </thead>
              <tbody>
                {scoring.matched_signals
                  .sort((a, b) => b.relevance_score - a.relevance_score)
                  .map((s, i) => (
                  <tr key={i} className="border-b border-zinc-800/40 last:border-0">
                    <td className="px-4 py-2.5 text-xs text-zinc-600">{s.signal_index}</td>
                    <td className="px-4 py-2.5 text-sm text-zinc-200">{s.category}</td>
                    <td className="px-4 py-2.5">
                      <span className={`text-xs font-mono px-1.5 py-0.5 rounded ${
                        s.relevance_score >= 10 ? 'bg-emerald-500/15 text-emerald-400' :
                        s.relevance_score >= 5 ? 'bg-blue-500/15 text-blue-400' :
                        'bg-zinc-800 text-zinc-400'
                      }`}>{s.relevance_score}</span>
                    </td>
                    <td className="px-4 py-2.5 text-xs text-zinc-400">
                      {s.matched_keywords.length > 0
                        ? s.matched_keywords.join(', ')
                        : <span className="text-zinc-600">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bonus points */}
      {Object.keys(scoring.bonus_points).length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-3">Bonus Points</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.entries(scoring.bonus_points).map(([key, value]) => (
              <div key={key} className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                  <Plus className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-zinc-400">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm font-semibold text-zinc-200">+{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

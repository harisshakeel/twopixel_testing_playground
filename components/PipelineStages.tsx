import { Check, Circle, Database, Filter, Globe, FileText, Search, Share2, Target, Mail, ShieldX } from 'lucide-react'
import type { StageMeta } from '@/lib/pipeline'

const STAGES = [
  { key: 'nces_lookup',       altKey: '02_nces',           label: 'NCES Lookup',      icon: Database,    step: 2 },
  { key: 'url_discovery',     altKey: '03_url_discovery',  label: 'URL Discovery',    icon: Globe,       step: 3 },
  { key: 'url_filtering',     altKey: '04_url_filtering',  label: 'URL Filtering',    icon: Filter,      step: 4 },
  { key: 'scraping',          altKey: '05_scraping',       label: 'Scraping',         icon: Search,      step: 5 },
  { key: 'social_media',      altKey: '05.5_social',       label: 'Social Media',     icon: Share2,      step: 5.5 },
  { key: 'intel_extraction',  altKey: '06_intel',          label: 'Intel Extraction', icon: FileText,    step: 6 },
  { key: 'strategy',           altKey: '07_strategy',       label: 'Strategy',         icon: Target,      step: 7 },
  { key: 'email_cadence',     altKey: '08_emails',         label: 'Email Cadence',    icon: Mail,        step: 8 },
] as const

function formatDuration(s: number): string {
  if (s < 60) return `${s.toFixed(1)}s`
  const m = Math.floor(s / 60)
  const sec = Math.round(s % 60)
  return `${m}m ${sec}s`
}

interface Props {
  stages: Record<string, StageMeta> | null
  status?: string
}

export function PipelineStages({ stages, status }: Props) {
  const isCompetitor = status === 'competitor'
  const isSensitive = status === 'sensitive'
  const isSkipped = isCompetitor || isSensitive
  const precheck = stages?.competitor_precheck

  // Find slowest stage for highlighting
  let maxDuration = 0
  let slowestKey = ''
  if (stages) {
    for (const stage of STAGES) {
      const meta = stages[stage.key] ?? stages[stage.altKey]
      const d = meta?.duration_s as number | undefined
      if (d && d > maxDuration) {
        maxDuration = d
        slowestKey = stage.key
      }
    }
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-zinc-600 uppercase tracking-wider">Pipeline Stages</p>
        {precheck && (
          <span className="inline-flex items-center gap-1.5 text-xs text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md">
            <ShieldX className="w-3 h-3" />
            Pre-check: {precheck.competitor as string} customer
          </span>
        )}
      </div>
      <div className="flex items-center gap-0">
        {STAGES.map((stage, i) => {
          const meta = stages?.[stage.key] ?? stages?.[stage.altKey]
          const done = meta?.status === 'done'
          const noData = meta?.status === 'no_data'
          const skippedByCompetitor = isSkipped && !meta && !done
          const isSlowest = stage.key === slowestKey && maxDuration > 0
          const Icon = stage.icon

          return (
            <div key={stage.key} className="flex items-center flex-1 min-w-0">
              {/* Stage node */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border transition-colors
                  ${done ? (isSlowest ? 'bg-amber-500/15 border-amber-500/30' : 'bg-emerald-500/15 border-emerald-500/30') :
                    noData ? 'bg-amber-500/10 border-amber-500/20' :
                    skippedByCompetitor ? 'bg-orange-500/5 border-orange-500/15' :
                    'bg-zinc-800 border-zinc-700'}
                `}>
                  {done ? (
                    <Check className={`w-4 h-4 ${isSlowest ? 'text-amber-400' : 'text-emerald-400'}`} />
                  ) : skippedByCompetitor ? (
                    <Icon className="w-3.5 h-3.5 text-orange-500/40" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${noData ? 'text-amber-500' : 'text-zinc-600'}`} />
                  )}
                </div>
                <span className={`text-[10px] leading-tight text-center ${
                  done ? 'text-zinc-400' :
                  skippedByCompetitor ? 'text-orange-500/40' :
                  'text-zinc-600'
                }`}>
                  {stage.label}
                </span>
                {/* Stats under stage */}
                {meta && done && (
                  <span className="text-[9px] text-zinc-600 text-center leading-tight">
                    {stage.key === 'url_discovery' && `${meta.urls_found} URLs`}
                    {stage.key === 'url_filtering' && `${meta.filtered_urls} kept`}
                    {stage.key === 'scraping' && `${((meta.total_chars as number) / 1000).toFixed(0)}K chars`}
                    {stage.key === 'social_media' && `${meta.signal_posts} posts`}
                    {stage.key === 'intel_extraction' && `${meta.contacts_found} contacts`}
                    {stage.key === 'strategy' && meta.normalized_score != null && `${meta.normalized_score}/100`}
                    {stage.key === 'email_cadence' && `${meta.emails_generated} emails`}
                  </span>
                )}
                {/* Duration */}
                {meta?.duration_s && (
                  <span className={`text-[9px] text-center leading-tight ${isSlowest ? 'text-amber-400 font-medium' : 'text-zinc-600'}`}>
                    {formatDuration(meta.duration_s as number)}
                  </span>
                )}
                {skippedByCompetitor && (
                  <span className="text-[9px] text-orange-500/40 text-center leading-tight">skipped</span>
                )}
              </div>
              {/* Connector line */}
              {i < STAGES.length - 1 && (
                <div className={`h-px flex-1 mx-1 ${
                  done ? 'bg-emerald-500/30' :
                  skippedByCompetitor ? 'bg-orange-500/10' :
                  'bg-zinc-800'
                }`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

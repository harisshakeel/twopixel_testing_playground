import { Check, Circle, Database, Filter, Globe, FileText, Search, Share2 } from 'lucide-react'
import type { StageMeta } from '@/lib/pipeline'

const STAGES = [
  { key: 'nces_lookup',       label: 'NCES Lookup',      icon: Database,  step: 2 },
  { key: 'url_discovery',     label: 'URL Discovery',    icon: Globe,     step: 3 },
  { key: 'url_filtering',     label: 'URL Filtering',    icon: Filter,    step: 4 },
  { key: 'scraping',          label: 'Scraping',         icon: Search,    step: 5 },
  { key: 'social_media',      label: 'Social Media',     icon: Share2,    step: 5.5 },
  { key: 'intel_extraction',  label: 'Intel Extraction', icon: FileText,  step: 6 },
] as const

interface Props {
  stages: Record<string, StageMeta> | null
}

export function PipelineStages({ stages }: Props) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
      <p className="text-xs text-zinc-600 uppercase tracking-wider mb-3">Pipeline Stages</p>
      <div className="flex items-center gap-0">
        {STAGES.map((stage, i) => {
          const meta = stages?.[stage.key]
          const done = meta?.status === 'done'
          const noData = meta?.status === 'no_data'
          const Icon = stage.icon

          return (
            <div key={stage.key} className="flex items-center flex-1 min-w-0">
              {/* Stage node */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border transition-colors
                  ${done ? 'bg-emerald-500/15 border-emerald-500/30' :
                    noData ? 'bg-amber-500/10 border-amber-500/20' :
                    'bg-zinc-800 border-zinc-700'}
                `}>
                  {done ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Icon className={`w-3.5 h-3.5 ${noData ? 'text-amber-500' : 'text-zinc-600'}`} />
                  )}
                </div>
                <span className={`text-[10px] leading-tight text-center ${done ? 'text-zinc-400' : 'text-zinc-600'}`}>
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
                  </span>
                )}
              </div>
              {/* Connector line */}
              {i < STAGES.length - 1 && (
                <div className={`h-px flex-1 mx-1 ${done ? 'bg-emerald-500/30' : 'bg-zinc-800'}`} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

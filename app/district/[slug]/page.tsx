import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  getAllDistricts, getIntelBrief, getStrategy, getSAPDoc,
  getContacts, getRunMeta, getEmails,
} from '@/lib/pipeline'
import { StatusDot } from '@/components/StatusDot'
import { ScoreRing } from '@/components/ScoreRing'
import { TierBadge } from '@/components/TierBadge'
import { DistrictTabs } from '@/components/DistrictTabs'
import { PipelineStages } from '@/components/PipelineStages'
import { ArrowLeft, ExternalLink, ShieldAlert } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function DistrictPage({ params }: { params: { slug: string } }) {
  const { slug } = params
  const { districts } = getAllDistricts()
  const record = districts.find(d => d.slug === slug)

  if (!record) notFound()

  const intelBrief = getIntelBrief(slug)
  const strategy = getStrategy(slug)
  const sapDoc = getSAPDoc(slug)
  const contacts = getContacts(slug)
  const runMeta = getRunMeta(slug)
  const emails = getEmails(slug)

  const isCompetitor = record.status === 'competitor'
  const isSensitive = record.status === 'sensitive'
  const hasScore = record.normalized_score > 0 && record.tier

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">

      {/* Back nav */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        All Districts
      </Link>

      {/* ── Header card ─────────────────────────────────────────────────────── */}
      <div className={`bg-zinc-900/70 border border-zinc-800 border-t-2 ${
        isCompetitor ? 'border-t-orange-500' :
        isSensitive ? 'border-t-red-500' :
        'border-t-purple-500'
      } rounded-2xl p-6 mb-6`}>
        <div className="flex items-start gap-6">
          {/* Score ring (left) */}
          {hasScore && (
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <ScoreRing score={record.normalized_score} tier={record.tier!} size={72} />
              <TierBadge tier={record.tier!} size="sm" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">{record.district_name}</h1>
                {record.website_url && (
                  <a
                    href={record.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-purple-400 transition-colors mt-1"
                  >
                    {record.website_url.replace(/^https?:\/\//, '')}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <StatusDot status={record.status} />
            </div>

            {/* Competitor banner */}
            {isCompetitor && record.competitor && (
              <div className="mt-4 flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-2.5">
                <ShieldAlert className="w-4 h-4 text-orange-400 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-orange-300">
                    Active {record.competitor} customer
                  </p>
                  {record.skip_reason && (
                    <p className="text-xs text-orange-400/70 mt-0.5">{record.skip_reason}</p>
                  )}
                </div>
              </div>
            )}

            {/* Sensitive banner */}
            {isSensitive && (
              <div className="mt-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
                <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
                <p className="text-sm font-medium text-red-300">
                  {record.skip_reason ?? 'District flagged sensitive — outreach paused'}
                </p>
              </div>
            )}

            {/* NCES quick stats */}
            {runMeta?.nces && (
              <div className="flex items-center gap-5 mt-4 flex-wrap">
                {[
                  { label: 'Enrollment', value: runMeta.nces.enrollment.toLocaleString() },
                  { label: 'Schools', value: String(runMeta.nces.num_schools) },
                  { label: 'State', value: runMeta.nces.state },
                  { label: 'Locale', value: runMeta.nces.locale.split('-').pop()?.trim() ?? runMeta.nces.locale },
                  { label: 'Type', value: runMeta.nces.district_type },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="text-xs text-zinc-600 uppercase tracking-wider">{s.label}</p>
                    <p className="text-sm font-semibold text-zinc-300">{s.value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Pipeline stages ────────────────────────────────────────────────── */}
      <PipelineStages stages={runMeta?.stages ?? null} status={record.status} />

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <DistrictTabs
        intelBrief={intelBrief}
        strategy={strategy}
        sapDoc={sapDoc}
        emails={emails}
        contacts={contacts}
        status={record.status}
        competitor={record.competitor}
        competitorAnalysis={record.competitor_analysis}
      />
    </div>
  )
}

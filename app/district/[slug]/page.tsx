import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllDistricts, getIntelBrief, getStrategy, getSAPDoc, getContacts, getRunMeta } from '@/lib/pipeline'
import { StatusDot } from '@/components/StatusDot'
import { DistrictTabs } from '@/components/DistrictTabs'
import { PipelineStages } from '@/components/PipelineStages'
import { ArrowLeft, ExternalLink } from 'lucide-react'

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

  // Collect all emails: main list + email_4 / email_5 if applicable
  const emails = [
    ...(strategy?.emails ?? []),
    ...(strategy?.email_4_if_applicable?.applicable !== false && strategy?.email_4_if_applicable
        ? [strategy.email_4_if_applicable] : []),
    ...(strategy?.email_5_if_applicable?.applicable !== false && strategy?.email_5_if_applicable
        ? [strategy.email_5_if_applicable] : []),
  ]

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
      <div className="bg-zinc-900/70 border border-zinc-800 border-t-2 border-t-purple-500 rounded-2xl p-6 mb-6">
        <div className="flex items-start gap-6">
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
      <PipelineStages stages={runMeta?.stages ?? null} />

      {/* ── Tabs ───────────────────────────────────────────────────────────── */}
      <DistrictTabs
        intelBrief={intelBrief}
        strategy={strategy}
        sapDoc={sapDoc}
        emails={emails}
        contacts={contacts}
        status={record.status}
      />
    </div>
  )
}

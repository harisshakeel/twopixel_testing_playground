import Link from 'next/link'
import { getAllDistricts, formatRunTimestamp, type DistrictRecord } from '@/lib/pipeline'
import { StatusDot } from '@/components/StatusDot'
import { StartPipelineButton } from '@/components/StartPipelineButton'
import { TierChart } from '@/components/TierChart'
import { ChevronRight, LayoutGrid, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
      <p className="text-xs text-zinc-500 mb-1 font-medium">{label}</p>
      <p className="text-2xl font-bold text-zinc-100 leading-none">{value}</p>
      {sub && <p className="text-xs text-zinc-600 mt-1">{sub}</p>}
    </div>
  )
}

function DistrictCard({ d }: { d: DistrictRecord }) {
  return (
    <Link href={`/district/${d.slug}`}>
      <div className="group relative bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 hover:bg-zinc-900 hover:border-zinc-700 transition-all duration-200 cursor-pointer h-full flex flex-col">

        <div className="flex-1 min-w-0 mb-4">
          <p className="text-base font-semibold text-zinc-100 leading-tight truncate">
            {d.district_name}
          </p>
          {d.website_url && (
            <p className="text-xs text-zinc-600 mt-1 truncate">{d.website_url.replace(/^https?:\/\//, '')}</p>
          )}
        </div>

        {/* Status */}
        <div className="mt-auto pt-3 border-t border-zinc-800/60 flex items-center justify-between">
          <StatusDot status={d.status} />
          <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
        </div>
      </div>
    </Link>
  )
}

export default function DashboardPage() {
  const { districts, lastRun } = getAllDistricts()

  const processed = districts.filter(d => d.status === 'processed' || d.status === 'done')
  const competitor = districts.filter(d => d.status === 'competitor')
  const sensitive = districts.filter(d => d.status === 'sensitive')
  const pending = districts.filter(d => d.status === 'pending')
  const errored = districts.filter(d => d.status === 'error')

  if (!districts.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 text-center px-6">
        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-2">
          <LayoutGrid className="w-6 h-6 text-zinc-600" />
        </div>
        <h2 className="text-xl font-semibold text-zinc-300">No pipeline runs yet</h2>
        <p className="text-sm text-zinc-600 max-w-sm">
          Start the pipeline below and results will appear here automatically.
        </p>
        <StartPipelineButton />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">

      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 tracking-tight">Testing Playground</h1>
          <p className="text-sm text-zinc-500 mt-1">Pipeline output testing</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRun && (
            <div className="flex items-center gap-2 text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2">
              <Clock className="w-3.5 h-3.5" />
              <span>Last run: <span className="text-zinc-400">{formatRunTimestamp(lastRun)}</span></span>
            </div>
          )}
          <StartPipelineButton />
        </div>
      </div>

      {/* Stats visual */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <TierChart
            total={districts.length}
            tiers={[
              { label: 'Processed',  count: processed.length,  color: '#22c55e', textColor: 'text-emerald-400' },
              { label: 'Competitor', count: competitor.length,  color: '#fb923c', textColor: 'text-orange-400' },
              { label: 'Sensitive',  count: sensitive.length,   color: '#f87171', textColor: 'text-red-400' },
              { label: 'Pending',    count: pending.length,     color: '#52525b', textColor: 'text-zinc-500' },
              { label: 'Errors',     count: errored.length,     color: '#ef4444', textColor: 'text-red-500' },
            ]}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <StatCard label="Processed" value={processed.length} sub={`of ${districts.length}`} />
          <StatCard label="Competitor" value={competitor.length} sub="existing vendor" />
          <StatCard label="Sensitive" value={sensitive.length} sub="crisis detected" />
          <StatCard label="Pending" value={pending.length} sub="not started" />
        </div>
      </div>

      {/* District sections by status */}
      {[
        { label: 'Processed',  items: processed,  accent: 'text-emerald-400', bar: 'bg-emerald-500' },
        { label: 'Competitor', items: competitor,  accent: 'text-orange-400',  bar: 'bg-orange-500' },
        { label: 'Sensitive',  items: sensitive,   accent: 'text-red-400',     bar: 'bg-red-400' },
        { label: 'Pending',    items: pending,     accent: 'text-zinc-500',    bar: 'bg-zinc-700' },
        { label: 'Errors',     items: errored,     accent: 'text-red-400',     bar: 'bg-red-500' },
      ].map(({ label, items, accent, bar }) => items.length > 0 && (
        <div key={label} className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-1 h-5 rounded-full ${bar}`} />
            <h2 className={`text-sm font-bold uppercase tracking-widest ${accent}`}>{label}</h2>
            <span className="text-xs text-zinc-600">{items.length} district{items.length !== 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {items.map(d => <DistrictCard key={d.district_name} d={d} />)}
          </div>
        </div>
      ))}
    </div>
  )
}

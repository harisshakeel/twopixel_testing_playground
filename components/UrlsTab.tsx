'use client'
import { useState } from 'react'
import { Globe, Filter, FileText, Users, Zap, ChevronDown, ChevronRight } from 'lucide-react'
import type { UrlDiscovered, UrlFiltered } from '@/lib/pipeline'

function Section({ title, icon: Icon, count, children, defaultOpen = false }: {
  title: string; icon: React.FC<{ className?: string }>; count: number; children: React.ReactNode; defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border border-zinc-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-zinc-900/60 hover:bg-zinc-900 transition-colors text-left"
      >
        {open ? <ChevronDown className="w-3.5 h-3.5 text-zinc-500" /> : <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />}
        <Icon className="w-4 h-4 text-zinc-400" />
        <span className="text-sm font-medium text-zinc-300">{title}</span>
        <span className="text-xs text-zinc-600 bg-zinc-800 rounded-full px-2 py-0.5">{count}</span>
      </button>
      {open && <div className="border-t border-zinc-800">{children}</div>}
    </div>
  )
}

function UrlList({ urls, showCategory }: { urls: Array<{ url: string; category?: string; reason?: string; is_pdf?: boolean; title?: string; description?: string }>; showCategory?: boolean }) {
  if (!urls.length) return <p className="px-4 py-3 text-xs text-zinc-600">None</p>
  return (
    <div className="divide-y divide-zinc-800/50 max-h-80 overflow-y-auto">
      {urls.map((u, i) => (
        <div key={i} className="px-4 py-2 hover:bg-zinc-900/40">
          <div className="flex items-center gap-2">
            {u.is_pdf && <FileText className="w-3 h-3 text-amber-500 shrink-0" />}
            <a href={u.url} target="_blank" rel="noopener noreferrer"
               className="text-xs text-purple-400 hover:text-purple-300 truncate">
              {u.url.replace(/^https?:\/\//, '')}
            </a>
            {showCategory && u.category && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${
                u.category === 'contact' ? 'bg-blue-500/15 text-blue-400' :
                u.category === 'signal' ? 'bg-emerald-500/15 text-emerald-400' :
                u.category === 'both' ? 'bg-purple-500/15 text-purple-400' :
                'bg-zinc-800 text-zinc-500'
              }`}>{u.category}</span>
            )}
          </div>
          {(u.reason || u.title || u.description) && (
            <p className="text-[10px] text-zinc-600 mt-0.5 truncate pl-5">
              {u.reason || u.title || u.description}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

interface Props {
  urlsDiscovered: UrlDiscovered[]
  urlsFiltered: UrlFiltered[]
}

export function UrlsTab({ urlsDiscovered, urlsFiltered }: Props) {
  const contactUrls = urlsFiltered.filter(u => u.category === 'contact')
  const signalUrls = urlsFiltered.filter(u => u.category === 'signal' && !u.is_pdf)
  const bothUrls = urlsFiltered.filter(u => u.category === 'both')
  const pdfUrls = urlsFiltered.filter(u => u.is_pdf)

  if (!urlsDiscovered.length && !urlsFiltered.length) {
    return (
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
        <Globe className="w-8 h-8 text-zinc-700 mx-auto mb-3" />
        <p className="text-sm text-zinc-600">No URL data available. Run the pipeline to discover URLs.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2">
          <p className="text-[10px] text-zinc-600 uppercase">Discovered</p>
          <p className="text-lg font-bold text-zinc-200">{urlsDiscovered.length}</p>
        </div>
        <div className="text-zinc-700">→</div>
        <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2">
          <p className="text-[10px] text-zinc-600 uppercase">Filtered</p>
          <p className="text-lg font-bold text-zinc-200">{urlsFiltered.length}</p>
        </div>
        <div className="text-xs text-zinc-600">
          ({contactUrls.length} contact, {signalUrls.length} signal{bothUrls.length ? `, ${bothUrls.length} both` : ''}{pdfUrls.length ? `, ${pdfUrls.length} pdf` : ''})
        </div>
      </div>

      {/* Filtered sections */}
      {urlsFiltered.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Stage 4: Filtered URLs</p>
          <Section title="Contact URLs" icon={Users} count={contactUrls.length} defaultOpen={true}>
            <UrlList urls={contactUrls} />
          </Section>
          <Section title="Signal URLs" icon={Zap} count={signalUrls.length}>
            <UrlList urls={signalUrls} />
          </Section>
          {bothUrls.length > 0 && (
            <Section title="Both (Contact + Signal)" icon={Globe} count={bothUrls.length}>
              <UrlList urls={bothUrls} />
            </Section>
          )}
          {pdfUrls.length > 0 && (
            <Section title="PDF Documents" icon={FileText} count={pdfUrls.length}>
              <UrlList urls={pdfUrls} />
            </Section>
          )}
        </div>
      )}

      {/* Raw discovered */}
      {urlsDiscovered.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Stage 3: All Discovered URLs</p>
          <Section title="Raw URLs" icon={Globe} count={urlsDiscovered.length}>
            <UrlList urls={urlsDiscovered} />
          </Section>
        </div>
      )}
    </div>
  )
}

'use client'

import { Mail, Phone } from 'lucide-react'
import type { Contact } from '@/lib/pipeline'

interface Props {
  contacts: Contact[]
}

export function ContactsTable({ contacts }: Props) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Table header */}
      <div className="grid grid-cols-12 gap-2 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/60">
        <span className="col-span-3 text-[10px] text-zinc-600 uppercase tracking-wider font-bold">Name</span>
        <span className="col-span-4 text-[10px] text-zinc-600 uppercase tracking-wider font-bold">Title</span>
        <span className="col-span-3 text-[10px] text-zinc-600 uppercase tracking-wider font-bold">Email</span>
        <span className="col-span-2 text-[10px] text-zinc-600 uppercase tracking-wider font-bold">Phone</span>
      </div>
      {/* Rows */}
      <div className="divide-y divide-zinc-800/40">
        {contacts.map((c, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 px-4 py-2.5 hover:bg-zinc-800/20 transition-colors items-center">
            <p className="col-span-3 text-sm font-medium text-zinc-200 truncate">{c.name}</p>
            <p className="col-span-4 text-xs text-zinc-500 truncate">{c.title || '—'}</p>
            <div className="col-span-3">
              {c.email ? (
                <a
                  href={`mailto:${c.email}`}
                  className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 truncate transition-colors"
                >
                  <Mail className="w-3 h-3 shrink-0" />
                  <span className="truncate">{c.email}</span>
                </a>
              ) : (
                <span className="text-xs text-zinc-700">—</span>
              )}
            </div>
            <div className="col-span-2">
              {c.phone ? (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500 truncate">
                  <Phone className="w-3 h-3 shrink-0" />
                  <span className="truncate">{c.phone}</span>
                </span>
              ) : (
                <span className="text-xs text-zinc-700">—</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

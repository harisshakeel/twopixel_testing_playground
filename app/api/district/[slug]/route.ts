import { NextResponse } from 'next/server'
import { getAllDistricts, getIntelBrief, getStrategy, getOutreachDoc, getContacts, getRunMeta } from '@/lib/pipeline'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: { slug: string } }) {
  const { slug } = params
  const { districts } = getAllDistricts()
  const record = districts.find(d => d.slug === slug) ?? null

  const intelBrief = getIntelBrief(slug)
  const strategy = getStrategy(slug)
  const outreachDoc = getOutreachDoc(slug)
  const contacts = getContacts(slug)
  const runMeta = getRunMeta(slug)

  return NextResponse.json({ record, intelBrief, strategy, outreachDoc, contacts, runMeta })
}

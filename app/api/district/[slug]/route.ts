import { NextResponse } from 'next/server'
import { getAllDistricts, getIntelBrief, getSAPDoc, getContacts, getRunMeta } from '@/lib/pipeline'

export const dynamic = 'force-dynamic'

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { districts } = getAllDistricts()
  const record = districts.find(d => d.slug === slug) ?? null

  const intelBrief = getIntelBrief(slug)
  const sapDoc = getSAPDoc(slug)
  const contacts = getContacts(slug)
  const runMeta = getRunMeta(slug)

  return NextResponse.json({ record, intelBrief, sapDoc, contacts, runMeta })
}

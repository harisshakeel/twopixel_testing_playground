import { NextResponse } from 'next/server'
import { getAllDistricts } from '@/lib/pipeline'

export const dynamic = 'force-dynamic'

export async function GET() {
  const data = getAllDistricts()
  return NextResponse.json(data)
}

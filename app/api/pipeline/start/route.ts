import { NextResponse } from 'next/server'
import { exec } from 'child_process'

export const dynamic = 'force-dynamic'

const PIPELINE_SECRET = process.env.PIPELINE_SECRET

export async function POST(request: Request) {
  // Require a secret token to prevent unauthorized pipeline execution
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!PIPELINE_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'PIPELINE_SECRET is not configured on the server' },
      { status: 500 }
    )
  }

  if (!token || token !== PIPELINE_SECRET) {
    return NextResponse.json(
      { ok: false, error: 'Unauthorized' },
      { status: 401 }
    )
  }

  return new Promise<NextResponse>((resolve) => {
    exec(
      'docker compose --profile run up pipeline -d',
      { cwd: '/app/..' },
      (error, stdout, stderr) => {
        if (error) {
          resolve(NextResponse.json({ ok: false, error: stderr || error.message }, { status: 500 }))
        } else {
          resolve(NextResponse.json({ ok: true, output: stdout }))
        }
      }
    )
  })
}

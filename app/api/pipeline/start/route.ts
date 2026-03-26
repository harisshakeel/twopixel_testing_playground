import { NextResponse } from 'next/server'
import { exec } from 'child_process'

export const dynamic = 'force-dynamic'

export async function POST() {
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

import { NextResponse } from 'next/server'
import { incr, readAll, type CounterName } from '@/lib/counter'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

// GET /api/stats → aggregate usage counters (or null fields if no store attached)
export async function GET() {
  const counts = await readAll()
  return NextResponse.json(counts ?? { visits: null, connected: null, uploads: null })
}

// POST /api/stats { event: 'visit' | 'upload' } → increment that counter.
// 'connected' is incremented server-side in the OAuth callback, not here.
export async function POST(request: Request) {
  let event: string | undefined
  try {
    event = (await request.json())?.event
  } catch {
    // ignore malformed body
  }
  const name: CounterName | null =
    event === 'visit' ? 'visits' : event === 'upload' ? 'uploads' : null
  if (!name) return NextResponse.json({ ok: false }, { status: 400 })
  const value = await incr(name)
  return NextResponse.json({ ok: true, value })
}

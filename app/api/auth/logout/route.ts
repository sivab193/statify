import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { clearTokenCookies } from '@/lib/session'

export async function POST() {
  clearTokenCookies(await cookies())
  return NextResponse.json({ ok: true })
}

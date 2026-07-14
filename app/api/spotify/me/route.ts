import { NextResponse } from 'next/server'
import { spotifyFetch } from '@/lib/spotify'
import { getValidAccessToken } from '@/lib/session'

export async function GET() {
  const accessToken = await getValidAccessToken()
  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const data = await spotifyFetch('/me', accessToken)
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch user data:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}

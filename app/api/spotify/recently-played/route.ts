import { NextRequest, NextResponse } from 'next/server'
import { spotifyFetch, refreshAccessToken } from '@/lib/spotify'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const limit = searchParams.get('limit') || '50'

  let accessToken = request.cookies.get('spotify_access_token')?.value
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value

  if (!accessToken && refreshToken) {
    try {
      const data = await refreshAccessToken(refreshToken)
      accessToken = data.access_token
    } catch (error) {
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 })
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const data = await spotifyFetch(
      `/me/player/recently-played?limit=${limit}`,
      accessToken
    )
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch recently played' }, { status: 500 })
  }
}

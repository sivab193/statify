import { NextRequest, NextResponse } from 'next/server'
import { spotifyFetch, refreshAccessToken } from '@/lib/spotify'

export async function GET(request: NextRequest) {
  let accessToken = request.cookies.get('spotify_access_token')?.value
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value

  if (!accessToken && refreshToken) {
    try {
      const data = await refreshAccessToken(refreshToken)
      accessToken = data.access_token
      
      // Update cookie with new access token
      const response = NextResponse.json(await spotifyFetch('/me', accessToken))
      response.cookies.set('spotify_access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.expires_in,
      })
      return response
    } catch (error) {
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 })
    }
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const data = await spotifyFetch('/me', accessToken)
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}

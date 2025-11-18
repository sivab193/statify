import { NextRequest, NextResponse } from 'next/server'
import { spotifyFetch, refreshAccessToken } from '@/lib/spotify'

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get('spotify_access_token')?.value
  const refreshToken = request.cookies.get('spotify_refresh_token')?.value

  console.log('[v0] /api/spotify/me - Cookies:', { 
    hasAccessToken: !!accessToken, 
    hasRefreshToken: !!refreshToken 
  })

  if (!accessToken && refreshToken) {
    console.log('[v0] Attempting to refresh access token')
    try {
      const data = await refreshAccessToken(refreshToken)
      const newAccessToken = data.access_token
      
      // Update cookie with new access token
      const userData = await spotifyFetch('/me', newAccessToken)
      const response = NextResponse.json(userData)
      response.cookies.set('spotify_access_token', newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: data.expires_in,
        path: '/',
      })
      console.log('[v0] Token refreshed successfully')
      return response
    } catch (error) {
      console.error('[v0] Failed to refresh token:', error)
      return NextResponse.json({ error: 'Failed to refresh token' }, { status: 401 })
    }
  }

  if (!accessToken) {
    console.log('[v0] No access token found, returning 401')
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    console.log('[v0] Fetching user data from Spotify')
    const data = await spotifyFetch('/me', accessToken)
    console.log('[v0] User data fetched successfully')
    return NextResponse.json(data)
  } catch (error) {
    console.error('[v0] Failed to fetch user data:', error)
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 })
  }
}

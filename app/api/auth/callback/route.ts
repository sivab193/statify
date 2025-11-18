import { NextRequest, NextResponse } from 'next/server'
import { getAccessToken } from '@/lib/spotify'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  console.log('[v0] Callback received:', { code: !!code, error })

  if (error) {
    return NextResponse.redirect(new URL('/auth?error=access_denied', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/auth?error=no_code', request.url))
  }

  try {
    const data = await getAccessToken(code)
    
    console.log('[v0] Token exchange successful:', { 
      hasAccessToken: !!data.access_token, 
      hasRefreshToken: !!data.refresh_token,
      expiresIn: data.expires_in 
    })

    // Store tokens in cookies
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    
    const isProduction = process.env.NODE_ENV === 'production'
    
    // Set access token (expires in 1 hour)
    response.cookies.set('spotify_access_token', data.access_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: data.expires_in,
      path: '/',
    })

    // Set refresh token (long-lived)
    response.cookies.set('spotify_refresh_token', data.refresh_token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    })

    console.log('[v0] Cookies set, redirecting to dashboard')
    return response
  } catch (error) {
    console.error('[v0] Error exchanging code for token:', error)
    return NextResponse.redirect(new URL('/auth?error=token_exchange_failed', request.url))
  }
}

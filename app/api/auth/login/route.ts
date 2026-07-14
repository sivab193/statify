import { NextRequest, NextResponse } from 'next/server'
import { createHash, randomBytes } from 'crypto'
import { buildAuthorizeUrl } from '@/lib/spotify'
import { COOKIE_AUTH_STATE, COOKIE_PKCE_VERIFIER, resolveOrigin } from '@/lib/session'

export async function GET(request: NextRequest) {
  const origin = resolveOrigin(request)

  if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    return NextResponse.redirect(new URL('/auth?error=not_configured', origin))
  }

  const redirectUri = `${origin}/api/auth/callback`
  const state = randomBytes(16).toString('hex')
  const codeVerifier = randomBytes(32).toString('base64url')
  const codeChallenge = createHash('sha256').update(codeVerifier).digest('base64url')

  const response = NextResponse.redirect(
    buildAuthorizeUrl({ redirectUri, state, codeChallenge })
  )

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  } as const
  response.cookies.set(COOKIE_AUTH_STATE, state, cookieOptions)
  response.cookies.set(COOKIE_PKCE_VERIFIER, codeVerifier, cookieOptions)

  return response
}

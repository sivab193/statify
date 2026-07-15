import { NextRequest, NextResponse } from 'next/server'
import { exchangeCode } from '@/lib/spotify'
import { incr } from '@/lib/counter'
import {
  COOKIE_AUTH_STATE,
  COOKIE_PKCE_VERIFIER,
  resolveOrigin,
  setTokenCookies,
} from '@/lib/session'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const state = searchParams.get('state')

  // request.url's host is normalized to the bind hostname; use the real
  // origin so browser-facing redirects stay on the host the user is on
  const origin = resolveOrigin(request)

  const fail = (reason: string) => {
    const response = NextResponse.redirect(new URL(`/auth?error=${reason}`, origin))
    response.cookies.delete(COOKIE_AUTH_STATE)
    response.cookies.delete(COOKIE_PKCE_VERIFIER)
    return response
  }

  if (error) return fail('access_denied')
  if (!code) return fail('no_code')

  const expectedState = request.cookies.get(COOKIE_AUTH_STATE)?.value
  const codeVerifier = request.cookies.get(COOKIE_PKCE_VERIFIER)?.value
  if (!expectedState || !codeVerifier || state !== expectedState) {
    return fail('state_mismatch')
  }

  try {
    const tokens = await exchangeCode(code, `${origin}/api/auth/callback`, codeVerifier)

    if (!tokens.refresh_token) return fail('token_exchange_failed')

    // Count a successful Spotify connection (no-ops without a KV store)
    incr('connected').catch(() => {})

    const response = NextResponse.redirect(new URL('/dashboard', origin))
    response.cookies.delete(COOKIE_AUTH_STATE)
    response.cookies.delete(COOKIE_PKCE_VERIFIER)
    setTokenCookies(response.cookies, tokens)
    return response
  } catch (err) {
    console.error('Spotify token exchange failed:', err)
    return fail('token_exchange_failed')
  }
}
